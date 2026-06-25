from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from app.dependencies import ai_service
from app.tools.base import ToolContext, get_handler
from app.models.conversation import AgentInvocationTrace, AgentTokenUsage, PendingApprovalDetail
from app.models.runtime import (
    EmployeeRuntimeSnapshot,
    PromptCompileResult,
    RuntimeMcpServer,
    RuntimeTool,
)
from app.runtime.loop import (
    AgentLoopOptions,
    AgentLoopResult,
    ToolHandler,
    run_agent_loop,
)

logger = logging.getLogger(__name__)


@dataclass
class AgentRunResult:
    assistant_message: str = ""
    success: bool = True
    error_message: Optional[str] = None
    token_usage: Optional[AgentTokenUsage] = None
    traces: list[AgentInvocationTrace] = field(default_factory=list)
    active_scopes: list[str] = field(default_factory=list)
    auto_invoke_count: int = 0
    session_id: Optional[str] = None
    pending_approval: Optional[PendingApprovalDetail] = None
    delegation_stack: Optional[list[str]] = None


def _parse_schema(raw: Optional[str]) -> dict:
    if not raw:
        return {"type": "object", "properties": {}}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {"type": "object", "properties": {}}


def _build_tool_handler(
    rt: RuntimeTool,
    employee_key: str,
    extra_context: Optional[str],
    shared_deep_state: object | None = None,
) -> Optional[ToolHandler]:
    base_handler = get_handler(rt.tool_code)
    if base_handler is None:
        logger.debug("No handler registered for tool: %s", rt.tool_code)

        async def handler_fn(args: str, _code: str = rt.tool_code) -> str:
            return f"工具 '{_code}' 尚未注册处理函数。"
    else:
        async def handler_fn(
            args: str,
            _code: str = rt.tool_code,
            _emp: str = employee_key,
            _extra: Optional[str] = extra_context,
            _h=base_handler,
            _ds=shared_deep_state,
        ) -> str:
            ctx = ToolContext(_code, args, _emp, _extra, deep_state=_ds)
            return await _h.handle(ctx)

    return ToolHandler(
        name=rt.tool_code,
        description=rt.description or rt.name or rt.tool_code,
        input_schema=_parse_schema(rt.input_schema),
        handler=handler_fn,
    )


async def run_agent(
    snapshot: EmployeeRuntimeSnapshot,
    compiled_prompt: PromptCompileResult,
    user_message: str,
    visible_tools: list[RuntimeTool],
    visible_mcp_servers: list[RuntimeMcpServer],
    employee_key: str,
    extra_context: Optional[str] = None,
    existing_messages: Optional[list[dict]] = None,
) -> AgentRunResult:
    run_result = AgentRunResult(active_scopes=compiled_prompt.active_scopes)

    model_policy = snapshot.default_model_policy
    model_id: str = model_policy.get("model_id", "gpt-4o")
    temperature: float = float(model_policy.get("temperature", 0.7))
    max_tokens: int = int(model_policy.get("max_tokens", 4096))

    try:
        client, resolved_model = ai_service.get_client(model_id, async_client=True)
    except ValueError as exc:
        logger.error("Failed to resolve AI model %s: %s", model_id, exc)
        run_result.success = False
        run_result.error_message = f"无法解析模型: {model_id}"
        return run_result

    shared_deep_state = None
    if snapshot.deep_agent:
        from app.tools.deep import DeepAgentState
        shared_deep_state = DeepAgentState()

    tool_handlers: list[ToolHandler] = []
    for rt in visible_tools:
        handler = _build_tool_handler(rt, employee_key, extra_context, shared_deep_state)
        if handler is not None:
            tool_handlers.append(handler)

    max_iterations = 12 if snapshot.deep_agent else 5

    options = AgentLoopOptions(
        existing_messages=existing_messages,
        max_iterations=max_iterations,
        temperature=temperature,
        max_tokens=max_tokens,
        model=resolved_model,
    )

    try:
        loop_result: AgentLoopResult = await run_agent_loop(
            client=client,
            options=options,
            system_prompt=compiled_prompt.system_prompt,
            user_message=user_message,
            tools=tool_handlers,
        )
    except Exception as exc:
        logger.error("Agent loop failed for %s: %s", employee_key, exc)
        run_result.success = False
        run_result.error_message = f"代理循环执行失败: {exc}"
        return run_result

    run_result.assistant_message = loop_result.final_text
    run_result.success = loop_result.success
    run_result.traces = loop_result.traces
    run_result.auto_invoke_count = loop_result.iterations
    run_result.pending_approval = loop_result.pending_approval

    if loop_result.prompt_tokens or loop_result.completion_tokens:
        run_result.token_usage = AgentTokenUsage(
            prompt_tokens=loop_result.prompt_tokens,
            completion_tokens=loop_result.completion_tokens,
            total_tokens=loop_result.prompt_tokens + loop_result.completion_tokens,
        )

    return run_result
