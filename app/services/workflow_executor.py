"""
工作流执行引擎：对 WorkflowDefinition（DAG）做 ready-set 遍历。

语义要点：
- 变量池 variables[node_key] = {field: value}；保留键 'start' = 触发输入（{{start.x}} 的来源）。
- 边「激活」：源节点可放行（success，或 failed 且 onError=continue）且 source_handle 与源选择的
  分支一致（condition 节点只激活一条出边）。
- 节点「就绪」：所有入边的源都已终态，且至少有一条入边激活 → 运行；若全部入边都未激活 → skipped。
  这套规则天然处理菱形图：分支汇合(join)节点在任一条分支到达时即触发；死分支整支 skipped。
- 就绪批次用 asyncio.gather 并发（v1 因底层 OpenAI 同步调用实际会串行，但结构就位）。
- 兜底：max_steps（防环/失控）、节点级超时、整体超时（在 API 层 wait_for）。错误策略 onError ∈ {stop|continue}。
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from app.config import settings
from app.models.workflow import NodeStepResult, WorkflowDefinition, WorkflowRun
from app.services.workflow_nodes import NodeContext, NodeResult, get_node_executor

logger = logging.getLogger(__name__)

_TERMINAL = {"success", "failed", "skipped"}
_OUTPUT_MAX = 2000  # 单节点输出落盘截断（仿 loop.py:178），防 base64/长文撑爆运行文件


def _now() -> datetime:
    return datetime.now(timezone.utc)


def validate_graph(wf: WorkflowDefinition) -> str | None:
    """保存与运行前的图校验：返回错误描述字符串，合法则 None。"""
    nodes = {n.node_key: n for n in wf.nodes}
    if not nodes:
        return "工作流没有任何节点"
    if len(nodes) != len(wf.nodes):
        return "存在重复的 nodeKey"
    starts = [n for n in wf.nodes if n.type == "start"]
    if len(starts) != 1:
        return f"必须且只能有一个 start 节点（当前 {len(starts)} 个）"
    if not any(n.type == "end" for n in wf.nodes):
        return "至少需要一个 end 节点"
    for e in wf.edges:
        if e.source not in nodes:
            return f"边的源节点不存在：{e.source!r}"
        if e.target not in nodes:
            return f"边的目标节点不存在：{e.target!r}"
    # 环检测（Kahn）
    indeg = {k: 0 for k in nodes}
    adj: dict[str, list[str]] = {k: [] for k in nodes}
    for e in wf.edges:
        indeg[e.target] += 1
        adj[e.source].append(e.target)
    queue = [k for k, d in indeg.items() if d == 0]
    seen = 0
    while queue:
        cur = queue.pop()
        seen += 1
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    if seen != len(nodes):
        return "工作流存在环（必须是有向无环图 DAG）"
    return None


def _persist(run: WorkflowRun) -> None:
    try:
        from app.dependencies import workflow_run_store
        workflow_run_store.save(run)
    except Exception:
        logger.warning("工作流运行记录落盘失败：%s", run.run_id, exc_info=True)


async def _run_node(node, variables: dict, run: WorkflowRun) -> NodeResult:
    executor = get_node_executor(node.type)
    if executor is None:
        return NodeResult(status="failed", error=f"未知节点类型：{node.type!r}")
    ctx = NodeContext(
        node=node, variables=variables, run=run,
        run_id=run.run_id, workflow_key=run.workflow_key,
    )
    try:
        return await asyncio.wait_for(
            executor.execute(ctx), timeout=settings.workflow.node_timeout_seconds
        )
    except asyncio.TimeoutError:
        return NodeResult(status="failed", error=f"节点超时（{node.type}）")
    except Exception as exc:  # noqa: BLE001
        logger.exception("节点执行异常：%s", node.node_key)
        return NodeResult(status="failed", error=str(exc))


async def run_workflow(wf: WorkflowDefinition, inputs: dict | None) -> WorkflowRun:
    run = WorkflowRun(workflow_key=wf.workflow_key, inputs=dict(inputs or {}), status="running")

    err = validate_graph(wf)
    if err:
        run.status = "failed"
        run.error = err
        run.finished_at = _now()
        _persist(run)
        return run

    nodes = {n.node_key: n for n in wf.nodes}
    in_edges: dict[str, list] = {k: [] for k in nodes}
    for e in wf.edges:
        in_edges.setdefault(e.target, []).append(e)

    variables: dict = {"start": dict(inputs or {})}
    status: dict[str, str] = {k: "pending" for k in nodes}
    chosen: dict[str, str] = {}  # condition 节点 -> 选中的 handle
    steps: dict[str, NodeStepResult] = {
        k: NodeStepResult(node_key=k, type=n.type, status="pending") for k, n in nodes.items()
    }
    run.steps = list(steps.values())

    def passable(k: str) -> bool:
        s = status[k]
        if s == "success":
            return True
        if s == "failed" and (nodes[k].config or {}).get("onError") == "continue":
            return True
        return False

    def edge_active(e) -> bool:
        if not passable(e.source):
            return False
        ch = chosen.get(e.source)  # 非 condition 节点为 None（放行全部 None-handle 出边）
        if e.source_handle is None:
            return ch is None
        return ch == e.source_handle

    executed = 0
    max_steps = settings.workflow.max_steps

    while run.status == "running":
        runnable: list[str] = []
        to_skip: list[str] = []
        for k, n in nodes.items():
            if status[k] != "pending":
                continue
            ins = in_edges.get(k, [])
            if not ins:
                if n.type == "start":
                    runnable.append(k)
                else:
                    to_skip.append(k)  # 无入边的孤儿节点（非 start）不可达
                continue
            if all(status[e.source] in _TERMINAL for e in ins):
                if any(edge_active(e) for e in ins):
                    runnable.append(k)
                else:
                    to_skip.append(k)  # 所有分支都未激活 → 整支剪枝

        for k in to_skip:
            status[k] = "skipped"
            steps[k].status = "skipped"
        if to_skip:
            _persist(run)

        if not runnable:
            if to_skip:
                continue  # 跳过可能解锁后续，重新评估
            break  # 无可推进节点（已完成，或剩余在环里——validate 已挡环，这里是兜底）

        for k in runnable:
            status[k] = "running"
            steps[k].status = "running"

        try:
            results = await asyncio.gather(
                *[_run_node(nodes[k], variables, run) for k in runnable],
                return_exceptions=True,
            )
        except asyncio.CancelledError:
            # 整体超时（API 层 wait_for 取消本协程）：落定为 timeout 并持久化，
            # 否则最后一次持久化的运行记录会永远停在 'running'。
            run.status = "timeout"
            run.error = run.error or "运行超时被中止"
            for kk in nodes:
                if status[kk] == "running":
                    steps[kk].status = "failed"
                elif status[kk] == "pending":
                    steps[kk].status = "skipped"
            run.finished_at = _now()
            _persist(run)
            raise

        abort = False
        for k, res in zip(runnable, results):
            executed += 1
            st = steps[k]
            if isinstance(res, BaseException):
                st.status = "failed"
                st.error = str(res)
                status[k] = "failed"
                if (nodes[k].config or {}).get("onError") != "continue":
                    abort = True
                variables[k] = {}
                continue

            out_dict = res.output if isinstance(res.output, dict) else {}
            variables[k] = out_dict
            text_out = out_dict.get("output")
            if isinstance(text_out, str) and len(text_out) > _OUTPUT_MAX:
                text_out = text_out[:_OUTPUT_MAX] + " …（已截断）"
            st.output = text_out if isinstance(text_out, str) else (
                None if text_out is None else str(text_out)
            )
            st.error = res.error
            st.traces = res.traces or []
            st.prompt_tokens = res.prompt_tokens
            st.completion_tokens = res.completion_tokens
            run.total_prompt_tokens += res.prompt_tokens
            run.total_completion_tokens += res.completion_tokens

            if res.status == "failed":
                st.status = "failed"
                status[k] = "failed"
                if (nodes[k].config or {}).get("onError") != "continue":
                    abort = True
            else:
                st.status = "success"
                status[k] = "success"
                if res.next_handle is not None:
                    chosen[k] = res.next_handle
                if nodes[k].type == "end":
                    run.final_output = out_dict.get("output")

        _persist(run)

        if executed > max_steps:
            run.status = "failed"
            run.error = f"超过最大节点数 {max_steps}（疑似环或失控）"
            break
        if abort:
            run.status = "failed"
            run.error = run.error or "节点失败，按 onError=stop 中止运行"
            break

    # 收尾：未处理的 pending 标记为 skipped
    for k in nodes:
        if status[k] == "pending":
            status[k] = "skipped"
            steps[k].status = "skipped"

    if run.status == "running":
        run.status = "success"
    run.variables = dict(variables)
    run.finished_at = _now()
    _persist(run)
    return run
