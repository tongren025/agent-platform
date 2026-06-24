"""
工作流节点执行器及其全局注册表。

仿 app/tools/base.py 的 register_handler 模式做成「开闭」插件式：新增节点类型只需写一个
NodeExecutor 子类并 register_node_executor，遍历引擎（workflow_executor）无需改动。

v1 内置：start / agent / condition / template / tool / knowledge / end。
延后（不在 v1）：iteration / variable-aggregator / code / http / parameter-extraction / sub-workflow。

每个执行器把自己的产出作为一个 dict 发布到变量池的 node_key 下；约定至少含 'output' 与 'text'
两个字段（下游用 {{node.output}} 引用）。
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from app.config import settings
from app.runtime.template import resolve_template, resolve_value

logger = logging.getLogger(__name__)

# 审批挂起前缀（与 app/runtime/loop.py 一致）——工作流路径也必须尊重它
_PENDING_PREFIX = "##PENDING_APPROVAL##"
# 永不允许从工作流 tool 节点直接调用的工具：Shell 执行 / 跨员工委派
_WORKFLOW_BLOCKED_TOOLS = {"execute", "delegate_to_employee"}


@dataclass
class NodeContext:
    node: object              # WorkflowNode
    variables: dict           # node_key -> {field: value}
    run: object               # WorkflowRun
    run_id: str
    workflow_key: str


@dataclass
class NodeResult:
    output: dict = field(default_factory=dict)   # 发布到 variables[node_key] 的字段
    next_handle: Optional[str] = None            # condition 选中的分支标签
    status: str = "success"                      # success | failed
    error: Optional[str] = None
    traces: list = field(default_factory=list)
    prompt_tokens: int = 0
    completion_tokens: int = 0


class NodeExecutor:
    node_type: str = ""

    async def execute(self, ctx: NodeContext) -> NodeResult:  # pragma: no cover - 抽象
        raise NotImplementedError


# ── 注册表（仿 app/tools/base.py）────────────────────────────────
_executors: dict[str, NodeExecutor] = {}


def register_node_executor(inst: NodeExecutor) -> None:
    _executors[inst.node_type] = inst


def get_node_executor(node_type: str) -> Optional[NodeExecutor]:
    return _executors.get(node_type)


def get_all_node_executors() -> dict[str, NodeExecutor]:
    return dict(_executors)


def _publish(text: str, **extra) -> dict:
    out = {"output": text, "text": text}
    out.update(extra)
    return out


# ── 内置执行器 ──────────────────────────────────────────────────

class StartExecutor(NodeExecutor):
    node_type = "start"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        # 触发输入已由引擎播种到 variables['start']；本节点透传，便于 {{<startNodeKey>.output}}
        inputs = ctx.variables.get("start", {})
        out = dict(inputs) if isinstance(inputs, dict) else {}
        out.update(_publish(json.dumps(inputs, ensure_ascii=False)))
        return NodeResult(output=out)


class AgentExecutor(NodeExecutor):
    """核心多-subagent 节点：包一个数字员工，原样调用现有 run_invocation()。"""
    node_type = "agent"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        employee_key = (cfg.get("employeeKey") or "").strip()
        if not employee_key:
            return NodeResult(status="failed", error="agent 节点缺少 employeeKey")

        user_input = resolve_template(cfg.get("userInputTemplate") or "", ctx.variables)
        if not user_input.strip():
            user_input = resolve_template("{{start.output}}", ctx.variables) or "(无输入)"

        # 注意：v1 已知限制——loop.py 里 OpenAI 调用是同步的，故并行 fan-out 的多个 agent
        # 节点实际会串行（不会真正并发）。这里仍 await run_invocation 保证正确性；
        # 待底层换成 AsyncOpenAI 后即可自动并发，无需改本文件。
        # 不透传 __delegation_stack：工作流跳数不计入 delegation_max_depth（用 max_steps 约束），
        # 每个 agent 节点内部的 delegate 调用从空栈开始计深度。
        from app.models.conversation import AgentRunRequest
        from app.services.invocation import run_invocation

        req = AgentRunRequest(
            employee_key=employee_key,
            user_input=user_input,
            workflow_key=ctx.workflow_key or None,
            structured_schema_json=cfg.get("structuredSchemaJson"),
        )
        res = await run_invocation(req)
        msg = res.assistant_message or ""

        out = _publish(msg)
        # 若员工被要求输出结构化 JSON，把顶层键也发布出来，便于 {{node.someField}}
        parsed = _try_json(msg)
        if isinstance(parsed, dict):
            for k, v in parsed.items():
                if k not in out:
                    out[k] = v

        pt = res.token_usage.prompt_tokens if res.token_usage else 0
        ct = res.token_usage.completion_tokens if res.token_usage else 0
        return NodeResult(
            output=out,
            status="success" if res.success else "failed",
            error=None if res.success else (res.error_message or "agent 运行失败"),
            traces=res.traces or [],
            prompt_tokens=pt,
            completion_tokens=ct,
        )


class ConditionExecutor(NodeExecutor):
    """分支节点：按 cases 顺序用安全比较器匹配，激活对应 source_handle。"""
    node_type = "condition"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        cases = cfg.get("cases") or []
        else_label = cfg.get("elseLabel") or "else"
        for case in cases:
            left = resolve_template(str(case.get("var", "")), ctx.variables)
            op = case.get("op", "eq")
            right = case.get("value", "")
            if _compare(left, op, right):
                label = case.get("label") or else_label
                return NodeResult(output=_publish(label), next_handle=label)
        return NodeResult(output=_publish(else_label), next_handle=else_label)


class TemplateExecutor(NodeExecutor):
    """纯文本拼装节点：不调用 LLM、不耗 token。"""
    node_type = "template"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        out = resolve_template(cfg.get("template") or "", ctx.variables)
        return NodeResult(output=_publish(out))


class ToolExecutor(NodeExecutor):
    """工具节点：复用 app.tools.base 注册的现有工具 handler。

    授权（关键）：工作流节点不像 agent 循环那样自带作用域，所以这里必须显式授权——
    必须指定 employeeKey，且该工具在此员工绑定的 tool_refs 内才允许调用（复用 agent
    路径同样的作用域语义），否则任意工作流作者就能调用任意有副作用的工具（提权）。
    """
    node_type = "tool"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        from app.dependencies import employee_registry
        from app.tools.base import ToolContext, get_handler

        cfg = ctx.node.config or {}
        tool_code = (cfg.get("toolCode") or "").strip()
        if not tool_code:
            return NodeResult(status="failed", error="工具节点缺少 toolCode")
        if tool_code in _WORKFLOW_BLOCKED_TOOLS:
            return NodeResult(status="failed", error=f"工具 {tool_code!r} 不允许在工作流节点中直接调用")

        emp_key = (cfg.get("employeeKey") or "").strip()
        if not emp_key:
            return NodeResult(status="failed", error="工具节点必须指定 employeeKey 以授权该工具调用")
        emp = employee_registry.get(emp_key)
        if emp is None:
            return NodeResult(status="failed", error=f"员工不存在：{emp_key}")
        if tool_code not in (emp.tool_refs or []):
            return NodeResult(status="failed", error=f"员工 {emp_key} 未绑定工具 {tool_code!r}，拒绝调用")

        handler = get_handler(tool_code)
        if handler is None:
            return NodeResult(status="failed", error=f"工具未注册：{tool_code!r}")

        # 参数模板：始终解析成结构后再 json.dumps，让每个插入值都被 JSON 转义，
        # 避免字符串插值绕过转义注入额外参数（如覆盖 command / snapshot_id）。
        raw = cfg.get("argsTemplate", {})
        if isinstance(raw, str):
            try:
                raw = json.loads(raw) if raw.strip() else {}
            except (json.JSONDecodeError, ValueError):
                return NodeResult(status="failed", error="argsTemplate 不是合法 JSON 对象")
        resolved = resolve_value(raw, ctx.variables)
        args_json = json.dumps(resolved, ensure_ascii=False)

        result = await handler.handle(ToolContext(tool_code, args_json, employee_key=emp_key))

        # 审批闸门：工作流路径同样要尊重 ##PENDING_APPROVAL##，否则人审被静默跳过
        if isinstance(result, str) and result.startswith(_PENDING_PREFIX):
            return NodeResult(
                status="failed",
                error="该工具需要人工审批，工作流暂不支持中途挂起审批（已按失败处理）",
                output=_publish(result),
            )

        out = _publish(result or "")
        parsed = _try_json(result)
        if isinstance(parsed, dict):
            for k, v in parsed.items():
                if k not in out:
                    out[k] = v
        return NodeResult(output=out)


class KnowledgeExecutor(NodeExecutor):
    """知识检索节点：对指定员工知识库做关键词检索，把片段作为变量注入下游。"""
    node_type = "knowledge"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        from app.dependencies import knowledge_retriever

        cfg = ctx.node.config or {}
        employee_key = (cfg.get("employeeKey") or "").strip()
        query = resolve_template(cfg.get("queryTemplate") or "", ctx.variables)
        try:
            top_k = int(cfg.get("topK", 5) or 5)
        except (ValueError, TypeError):
            top_k = 5
        if not employee_key or not query.strip():
            return NodeResult(output=_publish("", count=0))
        snippets = knowledge_retriever.search(employee_key, query, top_k)
        joined = "\n\n".join(f"[{s.file_name}] {s.excerpt}" for s in snippets)
        return NodeResult(output=_publish(joined, count=len(snippets)))


class EndExecutor(NodeExecutor):
    """出口节点：用 outputTemplate 汇总最终结果。"""
    node_type = "end"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        tmpl = cfg.get("outputTemplate")
        out = resolve_template(tmpl, ctx.variables) if tmpl else ""
        return NodeResult(output=_publish(out))


# ── 辅助 ────────────────────────────────────────────────────────

def _try_json(text):
    if not isinstance(text, str):
        return None
    s = text.strip()
    if not (s.startswith("{") or s.startswith("[")):
        return None
    try:
        return json.loads(s)
    except (json.JSONDecodeError, ValueError):
        return None


def _compare(left: str, op: str, right) -> bool:
    """安全的枚举比较器——绝不 eval。left 是已解析的字符串。"""
    right_s = "" if right is None else str(right)
    op = (op or "eq").strip()
    if op == "eq":
        return left == right_s
    if op == "neq":
        return left != right_s
    if op == "contains":
        return right_s in left
    if op == "notContains":
        return right_s not in left
    if op == "empty":
        return left.strip() == ""
    if op == "notEmpty":
        return left.strip() != ""
    if op in ("gt", "lt", "gte", "lte"):
        try:
            lf, rf = float(left), float(right_s)
        except (ValueError, TypeError):
            # 非数值则退化为字符串比较
            lf, rf = left, right_s  # type: ignore[assignment]
        if op == "gt":
            return lf > rf
        if op == "lt":
            return lf < rf
        if op == "gte":
            return lf >= rf
        return lf <= rf
    if op == "startsWith":
        return left.startswith(right_s)
    if op == "endsWith":
        return left.endswith(right_s)
    logger.warning("未知比较运算符：%s（按不匹配处理）", op)
    return False


# ── 注册内置执行器（导入即生效，仿 app/tools 的 import 副作用）────
for _ex in (
    StartExecutor(), AgentExecutor(), ConditionExecutor(), TemplateExecutor(),
    ToolExecutor(), KnowledgeExecutor(), EndExecutor(),
):
    register_node_executor(_ex)
