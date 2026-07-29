"""Agent 运行器：把运行时快照装配成 loop 可执行的选项（工具 handler、模型策略、重试/降级配置），是 invocation 与 loop 之间的装配层。"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Optional

import openai

from app.dependencies import ai_service
from app.services.chat_response import is_chat_completion_model_id
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
from app.runtime.context_compaction import compact_tool_result
from app.runtime.mcp import mcp_tool_handlers

logger = logging.getLogger(__name__)

DEEP_AGENT_CHECKPOINT_KEY = "deepAgentCheckpoint"


@dataclass
class AgentRunResult:
    """一次 agent 运行的完整结果；checkpoint 仅供会话编排层内部持久化。"""
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
    deep_state_checkpoint: Optional[dict] = None


def _parse_schema(raw: Optional[str]) -> dict:
    """解析工具的 JSON Schema 字符串；空或非法时返回空 object schema（工具仍可无参调用）。"""
    if not raw:
        return {"type": "object", "properties": {}}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {"type": "object", "properties": {}}


def _append_generated_media(text: str, traces: list[AgentInvocationTrace]) -> str:
    """把媒体工具产出或异步任务号兜底附到回复，避免模型遗漏可恢复信息。"""
    media_tool_names = {
        "generate_image",
        "generate_video",
        "check_video_generation",
    }
    reply_items: list[str] = []
    for trace in traces:
        if (
            trace.tool_name not in media_tool_names
            or not trace.success
            or not trace.result
        ):
            continue
        try:
            payload = json.loads(trace.result)
        except (json.JSONDecodeError, TypeError):
            continue
        if not isinstance(payload, dict) or not payload.get("success"):
            continue
        markdown = str(payload.get("markdown") or "").strip()
        if markdown and markdown not in text and markdown not in reply_items:
            reply_items.append(markdown)
            continue
        if payload.get("mediaType") == "video_job":
            job_id = str(payload.get("jobId") or "").strip()
            status = str(payload.get("status") or "pending").strip()
            pending_text = f"视频任务 `{job_id}` 当前状态：{status}。"
            if job_id and pending_text not in text and pending_text not in reply_items:
                reply_items.append(pending_text)
    if not reply_items:
        return text
    return (text.rstrip() + "\n\n" + "\n\n".join(reply_items)).strip()


def _build_tool_handler(
    rt: RuntimeTool,
    employee_key: str,
    extra_context: Optional[str],
    shared_deep_state: object | None = None,
) -> Optional[ToolHandler]:
    """把注册表工具定义包装成 loop 的 ToolHandler：绑定已注册的处理器，未注册的给出提示文案。"""
    base_handler = get_handler(rt.tool_code)
    if base_handler is None:
        logger.debug("No handler registered for tool: %s", rt.tool_code)

        async def handler_fn(args: str, _code: str = rt.tool_code) -> str:
            """未注册工具的兜底 handler：返回提示文案。"""
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
            """已注册工具的执行包装：构造 ToolContext 并调用对应 handler。"""
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
    existing_deep_state_checkpoint: Optional[dict] = None,
) -> AgentRunResult:
    """运行 agent，并在 DeepAgent 模式恢复/返回同一会话的 todos/files checkpoint。"""
    run_result = AgentRunResult(active_scopes=compiled_prompt.active_scopes)

    model_policy = snapshot.default_model_policy
    model_id: str = model_policy.get("model_id", "gpt-4o")
    if not is_chat_completion_model_id(model_id):
        run_result.success = False
        run_result.error_message = (
            f"{model_id} 是图片生成模型，不能作为员工思考模型；"
            "请把它配置到 image_model_id，并选择 GPT-5.6 等聊天模型作为 model_id"
        )
        return run_result
    temperature: float = float(model_policy.get("temperature", 0.7))
    max_tokens: int = int(model_policy.get("max_tokens", 4096))

    fallback_model_ids = [
        str(item).strip()
        for item in model_policy.get("fallback_models", [])
        if str(item).strip() and str(item).strip() != model_id
    ]
    resolved_candidates: list[tuple[object, str, str]] = []
    resolution_errors: list[str] = []
    for candidate_id in [model_id, *fallback_model_ids]:
        try:
            candidate_client, candidate_model = ai_service.get_client(
                candidate_id,
                async_client=True,
            )
            resolved_candidates.append((candidate_client, candidate_model, candidate_id))
        except (ValueError, openai.OpenAIError) as exc:
            resolution_errors.append(f"{candidate_id}: {exc}")
            logger.warning("模型 %s 不可用，检查下一降级模型: %s", candidate_id, exc)

    if not resolved_candidates:
        run_result.success = False
        detail = "；".join(resolution_errors) or model_id
        run_result.error_message = f"没有可用的聊天模型：{detail}"
        return run_result

    client, resolved_model, selected_model_id = resolved_candidates[0]
    if selected_model_id != model_id:
        logger.warning("主模型 %s 不可用，已降级到 %s", model_id, selected_model_id)

    shared_deep_state = None
    if snapshot.deep_agent:
        from app.tools.deep import DeepAgentState
        shared_deep_state = DeepAgentState.from_checkpoint(
            existing_deep_state_checkpoint
        )

    tool_handlers: list[ToolHandler] = []
    for rt in visible_tools:
        handler = _build_tool_handler(rt, employee_key, extra_context, shared_deep_state)
        if handler is not None:
            tool_handlers.append(handler)

    max_iterations = 12 if snapshot.deep_agent else 5

    # 预解析跨 provider 降级模型：各自拿独立 client，主模型失败后依次尝试。
    # 解析失败的降级模型直接跳过——降级本身不该让主流程崩。
    fallback_clients = [
        (fb_client, fb_resolved)
        for fb_client, fb_resolved, _ in resolved_candidates[1:]
    ]

    options = AgentLoopOptions(
        existing_messages=existing_messages,
        max_iterations=max_iterations,
        temperature=temperature,
        max_tokens=max_tokens,
        model=resolved_model,
        max_retries=int(model_policy.get("max_retries", 2)),
        request_timeout=float(model_policy.get("request_timeout", 60.0)),
        fallback_clients=fallback_clients,
        tool_result_transform=(
            lambda tool_name, content: compact_tool_result(
                tool_name,
                content,
                files=shared_deep_state.files,
            )
            if shared_deep_state is not None
            else content
        )
        if shared_deep_state is not None
        else None,
    )

    try:
        # MCP 是可选增强：只在员工绑定了服务时建立会话并追加工具；
        # 未配置或单个服务故障时，现有本地工具与 AgentLoop 原样继续。
        async with mcp_tool_handlers(visible_mcp_servers) as mcp_handlers:
            loop_result: AgentLoopResult = await run_agent_loop(
                client=client,
                options=options,
                system_prompt=compiled_prompt.system_prompt,
                user_message=user_message,
                tools=[*tool_handlers, *mcp_handlers],
            )
    except Exception as exc:
        logger.error("Agent loop failed for %s: %s", employee_key, exc)
        run_result.success = False
        run_result.error_message = f"代理循环执行失败: {exc}"
        if shared_deep_state is not None:
            run_result.deep_state_checkpoint = shared_deep_state.to_checkpoint()
        return run_result

    from app.utils import strip_latex_artifacts
    final_text = strip_latex_artifacts(loop_result.final_text)
    run_result.assistant_message = _append_generated_media(
        final_text,
        loop_result.traces,
    )
    run_result.success = loop_result.success
    if not loop_result.success:
        run_result.error_message = final_text or "AI 生成失败"
    run_result.traces = loop_result.traces
    run_result.auto_invoke_count = loop_result.iterations
    run_result.pending_approval = loop_result.pending_approval

    if loop_result.prompt_tokens or loop_result.completion_tokens:
        run_result.token_usage = AgentTokenUsage(
            prompt_tokens=loop_result.prompt_tokens,
            completion_tokens=loop_result.completion_tokens,
            total_tokens=loop_result.prompt_tokens + loop_result.completion_tokens,
        )

    if shared_deep_state is not None:
        run_result.deep_state_checkpoint = shared_deep_state.to_checkpoint()

    return run_result
