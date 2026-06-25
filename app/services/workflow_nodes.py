"""
工作流节点执行器及其全局注册表。

仿 app/tools/base.py 的 register_handler 模式做成「开闭」插件式：新增节点类型只需写一个
NodeExecutor 子类并 register_node_executor，遍历引擎（workflow_executor）无需改动。

v1 内置：start / agent / condition / template / tool / knowledge / end。
v2 新增：iteration / http / code / sub-workflow。

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
_NODE_OUTPUT_MAX = 2000
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


# ── v2 新增执行器 ──────────────────────────────────────────────────


class IterationExecutor(NodeExecutor):
    """循环节点：对一个 JSON 数组逐项调用指定员工，收集结果。

    config:
      arrayTemplate   — 解析为 JSON 数组的模板（如 ``{{start.items}}``）
      employeeKey     — 每项调用的数字员工 key
      userInputTemplate — 每次迭代的输入模板；可用 ``{{__item__}}`` ``{{__index__}}`` ``{{__total__}}``
      maxParallel     — 最大并行数（默认 1 = 串行）
    output:
      items  — 各项结果列表
      output — 用换行连接的全部回复文本
      count  — 处理数量
    """
    node_type = "iteration"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        employee_key = (cfg.get("employeeKey") or "").strip()
        if not employee_key:
            return NodeResult(status="failed", error="iteration 节点缺少 employeeKey")

        raw_array = resolve_template(cfg.get("arrayTemplate") or "[]", ctx.variables)
        try:
            items = json.loads(raw_array) if isinstance(raw_array, str) else raw_array
        except (json.JSONDecodeError, TypeError):
            items = []
        if not isinstance(items, list):
            items = [items]
        if not items:
            return NodeResult(output=_publish("", items=[], count=0))

        max_par = max(1, int(cfg.get("maxParallel") or 1))
        user_tpl = cfg.get("userInputTemplate") or "{{__item__}}"
        total = len(items)
        results = [None] * total
        total_pt = total_ct = 0

        sem = asyncio.Semaphore(max_par)

        async def _run_one(idx: int, item) -> None:
            nonlocal total_pt, total_ct
            iter_vars = dict(ctx.variables)
            item_str = json.dumps(item, ensure_ascii=False) if not isinstance(item, str) else item
            iter_vars["__item__"] = {"output": item_str, "text": item_str}
            iter_vars["__index__"] = {"output": str(idx), "text": str(idx)}
            iter_vars["__total__"] = {"output": str(total), "text": str(total)}

            user_input = resolve_template(user_tpl, iter_vars)
            from app.models.conversation import AgentRunRequest
            from app.services.invocation import run_invocation
            req = AgentRunRequest(employee_key=employee_key, user_input=user_input)
            async with sem:
                res = await run_invocation(req)
            msg = res.assistant_message or ""
            if res.token_usage:
                total_pt += res.token_usage.prompt_tokens
                total_ct += res.token_usage.completion_tokens
            results[idx] = {"index": idx, "input": user_input, "output": msg,
                            "success": res.success}

        tasks = [_run_one(i, item) for i, item in enumerate(items)]
        await asyncio.gather(*tasks, return_exceptions=True)

        texts = [r["output"] for r in results if r and r.get("output")]
        failed = sum(1 for r in results if r and not r.get("success"))
        return NodeResult(
            output=_publish("\n\n".join(texts), items=results, count=total,
                            failed_count=failed),
            status="success" if failed == 0 else ("partial" if failed < total else "failed"),
            error=f"{failed}/{total} 项失败" if failed else None,
            prompt_tokens=total_pt,
            completion_tokens=total_ct,
        )


class HttpExecutor(NodeExecutor):
    """HTTP 请求节点：调用外部 API，把响应注入变量池。

    config:
      url         — 模板解析后的完整 URL
      method      — GET / POST / PUT / DELETE（默认 GET）
      headers     — dict，值支持模板
      bodyTemplate — 请求体模板（POST/PUT 时使用）
      timeout     — 秒（默认 30）
    output:
      output      — 响应体文本
      statusCode  — HTTP 状态码
    """
    node_type = "http"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        import httpx

        cfg = ctx.node.config or {}
        url = resolve_template(cfg.get("url") or "", ctx.variables).strip()
        if not url:
            return NodeResult(status="failed", error="http 节点缺少 url")

        method = (cfg.get("method") or "GET").upper()
        timeout = min(120, max(1, int(cfg.get("timeout") or 30)))
        headers = {}
        for k, v in (cfg.get("headers") or {}).items():
            headers[k] = resolve_template(str(v), ctx.variables)

        body_text = None
        if method in ("POST", "PUT", "PATCH"):
            raw = cfg.get("bodyTemplate")
            if raw is not None:
                body_text = resolve_template(str(raw), ctx.variables)

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(float(timeout), connect=10.0),
                follow_redirects=True,
            ) as client:
                resp = await client.request(
                    method, url, headers=headers or None,
                    content=body_text.encode("utf-8") if body_text else None,
                )
            text = resp.text[:_NODE_OUTPUT_MAX] if len(resp.text) > _NODE_OUTPUT_MAX else resp.text
            out = _publish(text, statusCode=resp.status_code)
            parsed = _try_json(text)
            if isinstance(parsed, dict):
                for k, v in parsed.items():
                    if k not in out:
                        out[k] = v
            status = "success" if resp.is_success else "failed"
            return NodeResult(output=out, status=status,
                              error=f"HTTP {resp.status_code}" if not resp.is_success else None)
        except httpx.TimeoutException:
            return NodeResult(status="failed", error=f"HTTP 请求超时（{timeout}s）")
        except Exception as exc:
            return NodeResult(status="failed", error=f"HTTP 请求失败：{exc}")


class CodeExecutor(NodeExecutor):
    """代码/表达式节点：安全地执行 Python 表达式做数据变换，不耗 token。

    config:
      expression — Python 表达式字符串
      inputs     — dict，键为变量名，值为模板表达式（解析后注入表达式的命名空间）
    output:
      output — 表达式的求值结果（stringify）

    安全：AST 白名单校验 + 受限 builtins，绝不 exec/import。
    """
    node_type = "code"

    _SAFE_BUILTINS = {
        "len": len, "str": str, "int": int, "float": float, "bool": bool,
        "list": list, "dict": dict, "tuple": tuple, "set": set,
        "sorted": sorted, "reversed": reversed, "enumerate": enumerate,
        "zip": zip, "range": range, "map": map, "filter": filter,
        "min": min, "max": max, "sum": sum, "abs": abs, "round": round,
        "isinstance": isinstance, "type": type, "hasattr": hasattr,
        "True": True, "False": False, "None": None,
        "json_loads": json.loads, "json_dumps": lambda o: json.dumps(o, ensure_ascii=False),
    }

    import ast as _ast
    _ALLOWED_NODES = {
        _ast.Expression, _ast.Constant, _ast.Name, _ast.Load, _ast.Store, _ast.Del,
        _ast.BinOp, _ast.UnaryOp, _ast.BoolOp, _ast.Compare,
        _ast.Add, _ast.Sub, _ast.Mult, _ast.Div, _ast.FloorDiv, _ast.Mod, _ast.Pow,
        _ast.USub, _ast.UAdd, _ast.Not, _ast.Invert,
        _ast.And, _ast.Or,
        _ast.Eq, _ast.NotEq, _ast.Lt, _ast.LtE, _ast.Gt, _ast.GtE, _ast.In, _ast.NotIn, _ast.Is, _ast.IsNot,
        _ast.IfExp,
        _ast.Subscript, _ast.Slice,
        _ast.Attribute,
        _ast.Call, _ast.keyword,
        _ast.List, _ast.Tuple, _ast.Dict, _ast.Set,
        _ast.ListComp, _ast.DictComp, _ast.SetComp, _ast.GeneratorExp, _ast.comprehension,
        _ast.JoinedStr, _ast.FormattedValue,
        _ast.Starred,
    }
    del _ast

    async def execute(self, ctx: NodeContext) -> NodeResult:
        import ast as _ast
        cfg = ctx.node.config or {}
        expr = (cfg.get("expression") or "").strip()
        if not expr:
            return NodeResult(status="failed", error="code 节点缺少 expression")

        try:
            tree = compile(expr, "<code-node>", "eval", _ast.PyCF_ONLY_AST)
        except SyntaxError as e:
            return NodeResult(status="failed", error=f"表达式语法错误：{e}")

        for node in _ast.walk(tree):
            if type(node) not in self._ALLOWED_NODES:
                return NodeResult(status="failed",
                                  error=f"不允许的语法：{type(node).__name__}")
            if isinstance(node, _ast.Attribute) and node.attr.startswith("_"):
                return NodeResult(status="failed",
                                  error=f"不允许访问下划线属性：{node.attr}")

        ns = dict(self._SAFE_BUILTINS)
        for name, tpl in (cfg.get("inputs") or {}).items():
            resolved = resolve_value(tpl, ctx.variables)
            ns[name] = resolved

        try:
            code = compile(expr, "<code-node>", "eval")
            result = eval(code, {"__builtins__": {}}, ns)  # noqa: S307
        except Exception as exc:
            return NodeResult(status="failed", error=f"表达式执行失败：{exc}")

        out_str = json.dumps(result, ensure_ascii=False, default=str) if not isinstance(result, str) else result
        out = _publish(out_str)
        if isinstance(result, dict):
            for k, v in result.items():
                if k not in out:
                    out[k] = v
        elif isinstance(result, list):
            out["items"] = result
            out["count"] = len(result)
        return NodeResult(output=out)


class SubWorkflowExecutor(NodeExecutor):
    """子工作流节点：执行另一个工作流定义，把其最终输出注入变量池。

    config:
      workflowKey    — 目标工作流 key
      inputsTemplate — dict，键为子工作流 start 输入字段名，值为模板表达式
    output:
      output    — 子工作流 end 节点的输出
      subRunId  — 子工作流运行 ID（可溯源）
      subStatus — 子工作流运行状态
    """
    node_type = "sub-workflow"

    _MAX_DEPTH = 3
    _DEPTH_KEY = "__sub_workflow_depth"

    async def execute(self, ctx: NodeContext) -> NodeResult:
        cfg = ctx.node.config or {}
        wf_key = (cfg.get("workflowKey") or "").strip()
        if not wf_key:
            return NodeResult(status="failed", error="sub-workflow 节点缺少 workflowKey")

        depth = int(ctx.variables.get(self._DEPTH_KEY, {}).get("output", 0))
        if depth >= self._MAX_DEPTH:
            return NodeResult(status="failed",
                              error=f"子工作流嵌套深度超过上限（{self._MAX_DEPTH}）")

        from app.dependencies import workflow_registry
        from app.services.workflow_executor import run_workflow

        wf = workflow_registry.get(wf_key)
        if wf is None:
            return NodeResult(status="failed", error=f"子工作流不存在：{wf_key}")

        inputs_tpl = cfg.get("inputsTemplate") or {}
        inputs = {}
        for k, v in inputs_tpl.items():
            inputs[k] = resolve_value(v, ctx.variables)
        inputs[self._DEPTH_KEY] = depth + 1

        run = await run_workflow(wf, inputs)
        final = run.final_output or ""
        out = _publish(final, subRunId=run.run_id, subStatus=run.status)
        pt = run.total_prompt_tokens
        ct = run.total_completion_tokens
        status = "success" if run.status == "success" else "failed"
        return NodeResult(output=out, status=status,
                          error=run.error if run.status != "success" else None,
                          prompt_tokens=pt, completion_tokens=ct)


# ── 注册内置执行器（导入即生效，仿 app/tools 的 import 副作用）────
for _ex in (
    StartExecutor(), AgentExecutor(), ConditionExecutor(), TemplateExecutor(),
    ToolExecutor(), KnowledgeExecutor(), EndExecutor(),
    IterationExecutor(), HttpExecutor(), CodeExecutor(), SubWorkflowExecutor(),
):
    register_node_executor(_ex)
