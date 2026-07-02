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
    name: str
    description: str
    input_schema: dict
    handler: Callable[[str], Awaitable[str]]


@dataclass
class AgentLoopOptions:
    existing_messages: Optional[list[dict]] = None
    max_iterations: int = 5
    temperature: float = 0.7
    max_tokens: int = 4096
    model: str = "gpt-4o"
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
    final_text: str = ""
    success: bool = True
    iterations: int = 0
    traces: list[AgentInvocationTrace] = field(default_factory=list)
    messages: list[dict] = field(default_factory=list)
    pending_approval: Optional[PendingApprovalDetail] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0


def _build_openai_tools(handlers: list[ToolHandler]) -> list[dict]:
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


def _parse_pending_approval(raw: str) -> PendingApprovalDetail | None:
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


async def run_agent_loop(
    client: SyncOrAsyncClient,
    options: AgentLoopOptions,
    system_prompt: str,
    user_message: str,
    tools: list[ToolHandler],
) -> AgentLoopResult:
    result = AgentLoopResult()

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    if options.existing_messages:
        messages.extend(options.existing_messages)

    messages.append({"role": "user", "content": user_message})

    openai_tools = _build_openai_tools(tools) if tools else []
    handler_map: dict[str, ToolHandler] = {h.name: h for h in tools}

    is_async = isinstance(client, openai.AsyncOpenAI)

    for iteration in range(1, options.max_iterations + 1):
        result.iterations = iteration

        try:
            base_kwargs: dict = dict(
                messages=messages,
                temperature=options.temperature,
                max_tokens=options.max_tokens,
            )
            if openai_tools:
                base_kwargs["tools"] = openai_tools

            response = await _create_with_retry(
                client, base_kwargs, is_async, options, iteration
            )
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
