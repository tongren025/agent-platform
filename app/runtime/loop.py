"""Agent 工具调用循环 —— 系统最核心的 LLM 执行引擎。

职责边界：只负责"给定 client + 消息 + 工具，把一轮多迭代的 tool-calling
对话跑到收敛"，并内建三层可靠性（同模型指数退避重试 → 同 provider 备用
模型 → 跨 provider fallback client）。它不做的事：不解析员工配置、不选
模型、不落库——那些在上游 runner.run_agent / invocation 里；工具的具体
实现在 app/tools/*，这里只通过 ToolHandler.handler 回调执行并记录 trace。

特殊约定：工具结果以 ##PENDING_APPROVAL## 开头时视为人工审批中断，
循环立即停下并把详情放进 AgentLoopResult.pending_approval，由上游持久化。
"""
from __future__ import annotations

import asyncio
import json
import logging
import random
import time
from dataclasses import dataclass, field
from typing import Awaitable, Callable, Optional

import openai

from app.models.conversation import AgentInvocationTrace, PendingApprovalDetail
from app.services.chat_response import normalize_chat_completion

SyncOrAsyncClient = openai.OpenAI | openai.AsyncOpenAI

logger = logging.getLogger(__name__)

_PENDING_PREFIX = "##PENDING_APPROVAL##"

# 可重试的瞬时错误：限流、连接抖动、请求超时、5xx 服务端错误。
_RETRYABLE_ERRORS: tuple[type[BaseException], ...] = (
    openai.RateLimitError,
    openai.APIConnectionError,
    openai.APITimeoutError,
    openai.InternalServerError,
)
# 立即放弃的错误：鉴权、权限、请求体本身有问题——重试或降级都没意义。
_FATAL_ERRORS: tuple[type[BaseException], ...] = (
    openai.AuthenticationError,
    openai.PermissionDeniedError,
    openai.BadRequestError,
)


@dataclass
class ToolHandler:
    """循环可调用的一个工具：name/description/input_schema 报给 LLM，handler 收 JSON 参数串返回文本结果（由 runner 组装）。"""

    name: str
    description: str
    input_schema: dict
    handler: Callable[[str], Awaitable[str]]


@dataclass
class AgentLoopOptions:
    """一次循环的运行参数：会话历史、迭代/生成上限、模型，以及重试/超时/降级等可靠性配置（由 runner 按员工模型策略填好）。"""

    existing_messages: Optional[list[dict]] = None
    max_iterations: int = 5
    temperature: float = 0.7
    max_tokens: int = 4096
    model: str = "gpt-4o"
    reasoning_effort: Optional[str] = None
    api_surface: str = "chat_completions"
    # —— 可靠性（默认值即生效，调用方无需改动）——
    max_retries: int = 2            # 瞬时错误的重试次数（不含首次调用）
    retry_base_delay: float = 1.0   # 指数退避基准秒数
    request_timeout: float = 60.0   # 单次 LLM 调用超时（秒），0 表示不限
    fallback_models: list[str] = field(default_factory=list)  # 同 provider 备用模型（复用主 client）
    # 跨 provider 降级：(client, model_id) 预解析对，由 runner 用 ai_service 解析后传入。
    # 顺序：主模型 → fallback_models → fallback_clients。
    fallback_clients: list = field(default_factory=list)


@dataclass
class AgentLoopResult:
    """循环产出：最终回复、成败、迭代数、工具 trace、完整消息列表（供续聊持久化）、审批中断详情与 token 用量。"""

    final_text: str = ""
    success: bool = True
    iterations: int = 0
    traces: list[AgentInvocationTrace] = field(default_factory=list)
    messages: list[dict] = field(default_factory=list)
    pending_approval: Optional[PendingApprovalDetail] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0


def _build_openai_tools(handlers: list[ToolHandler]) -> list[dict]:
    """把 ToolHandler 列表转成 OpenAI chat.completions 的 tools（function calling）声明格式。"""
    tools: list[dict] = []
    for h in handlers:
        tools.append({
            "type": "function",
            "function": {
                "name": h.name,
                "description": h.description,
                "parameters": h.input_schema,
            },
        })
    return tools


def _build_responses_tools(handlers: list[ToolHandler]) -> list[dict]:
    """把工具声明转换为 Responses API 的扁平 function tool 结构。"""
    return [
        {
            "type": "function",
            "name": handler.name,
            "description": handler.description,
            "parameters": handler.input_schema,
        }
        for handler in handlers
    ]


def _is_gpt_56_model(model: str) -> bool:
    """识别 GPT-5.6 家族；兼容供应商解析后仍带命名空间的模型 ID。"""
    normalized = str(model or "").strip().lower()
    return "gpt-5.6" in normalized


def _parse_pending_approval(raw: str) -> PendingApprovalDetail | None:
    """解析 ##PENDING_APPROVAL## 信号后的 JSON 体为审批详情；解析失败降级为 unknown 类型（不让坏格式打断中断流程）。"""
    try:
        body = raw[len(_PENDING_PREFIX):].strip()
        data = json.loads(body)
        return PendingApprovalDetail(
            description=data.get("description", ""),
            action_type=data.get("action_type", ""),
        )
    except Exception:
        return PendingApprovalDetail(description=raw, action_type="unknown")


async def _create_completion(
    client: SyncOrAsyncClient,
    create_kwargs: dict,
    is_async: bool,
):
    """执行一次 chat.completions.create；同步客户端丢到线程池，避免阻塞事件循环。"""
    if is_async:
        return await client.chat.completions.create(**create_kwargs)
    return await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.chat.completions.create(**create_kwargs)
    )


async def _create_with_retry(
    client: SyncOrAsyncClient,
    base_kwargs: dict,
    is_async: bool,
    options: AgentLoopOptions,
    iteration: int,
):
    """带重试 + 降级的 LLM 调用。

    对同一模型按指数退避（含抖动）重试瞬时错误；重试用尽后依次尝试
    ``fallback_models``；鉴权 / 请求体错误直接上抛（重试和降级都没意义）。
    全部失败时抛出最后一个异常，由调用方兜底成一次失败的 run。
    """
    # 尝试顺序：主模型 → 同 provider 备用模型（复用主 client）→ 跨 provider 备用（各自 client）
    attempts: list[tuple[SyncOrAsyncClient, bool, str]] = [(client, is_async, options.model)]
    attempts += [(client, is_async, m) for m in options.fallback_models]
    attempts += [
        (c, isinstance(c, openai.AsyncOpenAI), m) for (c, m) in options.fallback_clients
    ]
    last_exc: BaseException | None = None

    for a_client, a_is_async, model in attempts:
        create_kwargs = dict(base_kwargs, model=model)
        if _is_gpt_56_model(model):
            create_kwargs["max_completion_tokens"] = options.max_tokens
            if options.reasoning_effort:
                create_kwargs["reasoning_effort"] = options.reasoning_effort
        else:
            create_kwargs["max_tokens"] = options.max_tokens
            create_kwargs["temperature"] = options.temperature
        if options.request_timeout:
            create_kwargs["timeout"] = options.request_timeout

        for attempt in range(options.max_retries + 1):
            try:
                return await _create_completion(a_client, create_kwargs, a_is_async)
            except _FATAL_ERRORS:
                raise
            except openai.NotFoundError as exc:
                # 模型不存在 / 不可用：不在本模型上重试，直接降级到下一个
                last_exc = exc
                logger.warning("LLM 模型 %s 不可用，尝试降级: %s", model, exc)
                break
            except _RETRYABLE_ERRORS as exc:
                last_exc = exc
                if attempt < options.max_retries:
                    delay = options.retry_base_delay * (2 ** attempt)
                    delay += random.uniform(0, options.retry_base_delay)
                    logger.warning(
                        "LLM 瞬时失败，%.1fs 后重试 "
                        "(model=%s, iteration=%d, attempt=%d/%d): %s",
                        delay, model, iteration, attempt + 1, options.max_retries, exc,
                    )
                    await asyncio.sleep(delay)
                    continue
                logger.warning(
                    "LLM 模型 %s 重试用尽，尝试降级 (iteration=%d): %s",
                    model, iteration, exc,
                )
                break

    assert last_exc is not None
    raise last_exc


async def _create_response(
    client: SyncOrAsyncClient,
    create_kwargs: dict,
    is_async: bool,
):
    """执行一次 Responses API 请求；同步客户端放入线程池。"""
    if is_async:
        return await client.responses.create(**create_kwargs)
    return await asyncio.get_event_loop().run_in_executor(
        None, lambda: client.responses.create(**create_kwargs)
    )


async def _create_response_with_retry(
    client: SyncOrAsyncClient,
    base_kwargs: dict,
    is_async: bool,
    options: AgentLoopOptions,
    iteration: int,
):
    """Responses API 版本的重试与跨模型降级。"""
    attempts: list[tuple[SyncOrAsyncClient, bool, str]] = [
        (client, is_async, options.model)
    ]
    attempts += [(client, is_async, model) for model in options.fallback_models]
    attempts += [
        (candidate, isinstance(candidate, openai.AsyncOpenAI), model)
        for candidate, model in options.fallback_clients
    ]
    last_exc: BaseException | None = None

    for candidate, candidate_is_async, model in attempts:
        create_kwargs = dict(base_kwargs, model=model)
        if options.reasoning_effort:
            create_kwargs["reasoning"] = {"effort": options.reasoning_effort}
        if options.request_timeout:
            create_kwargs["timeout"] = options.request_timeout

        for attempt in range(options.max_retries + 1):
            try:
                return await _create_response(
                    candidate,
                    create_kwargs,
                    candidate_is_async,
                )
            except _FATAL_ERRORS:
                raise
            except openai.NotFoundError as exc:
                last_exc = exc
                logger.warning("Responses 模型 %s 不可用，尝试降级: %s", model, exc)
                break
            except _RETRYABLE_ERRORS as exc:
                last_exc = exc
                if attempt < options.max_retries:
                    delay = options.retry_base_delay * (2 ** attempt)
                    delay += random.uniform(0, options.retry_base_delay)
                    logger.warning(
                        "Responses 瞬时失败，%.1fs 后重试 "
                        "(model=%s, iteration=%d, attempt=%d/%d): %s",
                        delay,
                        model,
                        iteration,
                        attempt + 1,
                        options.max_retries,
                        exc,
                    )
                    await asyncio.sleep(delay)
                    continue
                logger.warning(
                    "Responses 模型 %s 重试用尽，尝试降级 "
                    "(iteration=%d): %s",
                    model,
                    iteration,
                    exc,
                )
                break

    assert last_exc is not None
    raise last_exc


def _response_item_value(item: object, key: str, default=None):
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


def _response_item_dict(item: object) -> dict:
    """保留 Responses 输出项，供无服务端状态的下一轮手工回放。"""
    if isinstance(item, dict):
        return dict(item)
    model_dump = getattr(item, "model_dump", None)
    if callable(model_dump):
        return model_dump(exclude_none=True)
    return {
        key: value
        for key, value in vars(item).items()
        if value is not None
    }


def _response_text(response: object) -> str:
    direct = str(getattr(response, "output_text", "") or "")
    if direct:
        return direct
    chunks: list[str] = []
    for item in getattr(response, "output", []) or []:
        if _response_item_value(item, "type") != "message":
            continue
        for content in _response_item_value(item, "content", []) or []:
            if _response_item_value(content, "type") in {"output_text", "text"}:
                text = str(_response_item_value(content, "text", "") or "")
                if text:
                    chunks.append(text)
    return "\n".join(chunks)


async def run_agent_loop(
    client: SyncOrAsyncClient,
    options: AgentLoopOptions,
    system_prompt: str,
    user_message: str,
    tools: list[ToolHandler],
) -> AgentLoopResult:
    """运行 agent 工具调用主循环，直到模型给出最终回复或触碰边界条件。

    每轮迭代：调一次 LLM（经 _create_with_retry，内含重试 + 同 provider
    备用模型 + 跨 provider fallback 三级降级）→ 若无 tool_calls 即收敛返回；
    否则逐个执行工具、追加 tool 消息进入下一轮。

    终止条件：模型自然收敛 / 达到 max_iterations / 工具返回审批中断信号 /
    LLM 在重试降级全部用尽后仍失败（success=False，错误写入 final_text，
    不上抛异常——由调用方把它记成一次失败的 run）。

    注意：工具执行异常不会中断循环，错误文本会作为 tool 结果喂回模型让其
    自行调整；trace 中的工具结果截断到 2000 字符，完整结果只进消息历史。
    """
    result = AgentLoopResult()

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    if options.existing_messages:
        messages.extend(options.existing_messages)

    messages.append({"role": "user", "content": user_message})

    openai_tools = _build_openai_tools(tools) if tools else []
    handler_map: dict[str, ToolHandler] = {h.name: h for h in tools}

    is_async = isinstance(client, openai.AsyncOpenAI)
    if (
        openai_tools
        and _is_gpt_56_model(options.model)
        and options.reasoning_effort != "none"
    ):
        result.success = False
        result.final_text = (
            "LLM 调用失败: GPT-5.6 在 Chat Completions 中使用函数工具时，"
            "reasoning_effort 必须为 none；需要推理与工具并用时请使用 Responses API。"
        )
        result.messages = messages
        return result

    for iteration in range(1, options.max_iterations + 1):
        result.iterations = iteration

        try:
            base_kwargs: dict = {"messages": messages}
            if openai_tools:
                base_kwargs["tools"] = openai_tools

            response = await _create_with_retry(
                client, base_kwargs, is_async, options, iteration
            )
            response = normalize_chat_completion(response)
        except Exception as exc:
            logger.error(
                "LLM 调用最终失败（已重试+降级后，iteration=%d）: %s", iteration, exc
            )
            result.success = False
            result.final_text = f"LLM 调用失败: {exc}"
            break

        if response.usage:
            result.prompt_tokens += response.usage.prompt_tokens or 0
            result.completion_tokens += response.usage.completion_tokens or 0

        choice = response.choices[0]
        assistant_msg = choice.message

        msg_dict: dict = {"role": "assistant", "content": assistant_msg.content or ""}
        if assistant_msg.tool_calls:
            msg_dict["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in assistant_msg.tool_calls
            ]
        messages.append(msg_dict)

        if choice.finish_reason == "stop" or not assistant_msg.tool_calls:
            result.final_text = assistant_msg.content or ""
            break

        should_break = False
        for tc in assistant_msg.tool_calls:
            fn_name = tc.function.name
            fn_args = tc.function.arguments

            handler = handler_map.get(fn_name)
            if handler is None:
                tool_result = f"错误: 未知工具 '{fn_name}'"
                logger.warning("Unknown tool called: %s", fn_name)
                trace = AgentInvocationTrace(
                    iteration=iteration,
                    tool_name=fn_name,
                    arguments=fn_args,
                    result=tool_result,
                    success=False,
                    elapsed_milliseconds=0,
                )
                result.traces.append(trace)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": tool_result,
                })
                continue

            start_ms = time.monotonic()
            try:
                tool_result = await handler.handler(fn_args)
                success = True
            except Exception as exc:
                logger.error("Tool handler error (%s): %s", fn_name, exc)
                tool_result = f"工具执行失败: {exc}"
                success = False

            elapsed = int((time.monotonic() - start_ms) * 1000)

            trace = AgentInvocationTrace(
                iteration=iteration,
                tool_name=fn_name,
                arguments=fn_args,
                result=tool_result[:2000] if tool_result else None,
                success=success,
                elapsed_milliseconds=elapsed,
            )
            result.traces.append(trace)

            if tool_result and tool_result.startswith(_PENDING_PREFIX):
                result.pending_approval = _parse_pending_approval(tool_result)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": "操作已暂停，等待人工审批。",
                })
                should_break = True
                break

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_result or "",
            })

        if should_break:
            result.final_text = assistant_msg.content or "操作已暂停，等待人工审批。"
            break
    else:
        result.final_text = (
            result.final_text
            or messages[-1].get("content", "")
            or "已达到最大迭代次数。"
        )

    result.messages = messages
    return result


async def run_responses_agent_loop(
    client: SyncOrAsyncClient,
    options: AgentLoopOptions,
    system_prompt: str,
    user_message: str,
    tools: list[ToolHandler],
) -> AgentLoopResult:
    """使用 Responses API 运行支持推理与函数工具并用的代理循环。

    为兼容不使用服务端会话存储的部署，每轮都手工回放此前的 output items，
    并把 function_call_output 追加到下一轮 input。这样既保留 call_id，也不会
    依赖 previous_response_id。
    """
    result = AgentLoopResult()
    input_items: list[dict] = []
    for message in options.existing_messages or []:
        role = str(message.get("role") or "user")
        if role not in {"user", "assistant"}:
            role = "user"
        input_items.append({
            "role": role,
            "content": str(message.get("content") or ""),
        })
    input_items.append({"role": "user", "content": user_message})

    responses_tools = _build_responses_tools(tools)
    handler_map = {handler.name: handler for handler in tools}
    is_async = isinstance(client, openai.AsyncOpenAI)

    for iteration in range(1, options.max_iterations + 1):
        result.iterations = iteration
        base_kwargs: dict = {
            "instructions": system_prompt,
            "input": input_items,
            "max_output_tokens": options.max_tokens,
            "store": False,
        }
        if responses_tools:
            base_kwargs["tools"] = responses_tools

        try:
            response = await _create_response_with_retry(
                client,
                base_kwargs,
                is_async,
                options,
                iteration,
            )
        except Exception as exc:
            logger.error(
                "Responses 调用最终失败（已重试+降级后，iteration=%d）: %s",
                iteration,
                exc,
            )
            result.success = False
            result.final_text = f"LLM 调用失败: {exc}"
            break

        usage = getattr(response, "usage", None)
        if usage is not None:
            result.prompt_tokens += int(
                getattr(usage, "input_tokens", 0) or 0
            )
            result.completion_tokens += int(
                getattr(usage, "output_tokens", 0) or 0
            )

        output_items = list(getattr(response, "output", []) or [])
        input_items.extend(_response_item_dict(item) for item in output_items)
        function_calls = [
            item
            for item in output_items
            if _response_item_value(item, "type") == "function_call"
        ]
        response_text = _response_text(response)
        if not function_calls:
            result.final_text = response_text
            break

        should_break = False
        for call in function_calls:
            fn_name = str(_response_item_value(call, "name", "") or "")
            fn_args = str(_response_item_value(call, "arguments", "{}") or "{}")
            call_id = str(
                _response_item_value(call, "call_id")
                or _response_item_value(call, "id")
                or ""
            )
            handler = handler_map.get(fn_name)

            if handler is None:
                tool_result = f"错误: 未知工具 '{fn_name}'"
                success = False
                elapsed = 0
                logger.warning("Unknown Responses tool called: %s", fn_name)
            else:
                start_ms = time.monotonic()
                try:
                    tool_result = await handler.handler(fn_args)
                    success = True
                except Exception as exc:
                    logger.error(
                        "Responses tool handler error (%s): %s",
                        fn_name,
                        exc,
                    )
                    tool_result = f"工具执行失败: {exc}"
                    success = False
                elapsed = int((time.monotonic() - start_ms) * 1000)

            result.traces.append(AgentInvocationTrace(
                iteration=iteration,
                tool_name=fn_name,
                arguments=fn_args,
                result=tool_result[:2000] if tool_result else None,
                success=success,
                elapsed_milliseconds=elapsed,
            ))

            if tool_result and tool_result.startswith(_PENDING_PREFIX):
                result.pending_approval = _parse_pending_approval(tool_result)
                tool_result = "操作已暂停，等待人工审批。"
                should_break = True

            input_items.append({
                "type": "function_call_output",
                "call_id": call_id,
                "output": tool_result or "",
            })
            if should_break:
                break

        if should_break:
            result.final_text = response_text or "操作已暂停，等待人工审批。"
            break
    else:
        result.final_text = result.final_text or "已达到最大迭代次数。"

    result.messages = input_items
    return result
