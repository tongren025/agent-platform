"""OpenAI Chat Completions / Responses 双协议适配层。

系统内部仍使用统一的 Chat 风格消息和工具调用结构；本模块在网络边界把它转换为
Responses API，并把返回结果归一化回来。这样 Agent 循环无需维护两套消息状态机，
同时可以获得 Responses 的真流式事件与提示词缓存能力。
"""
from __future__ import annotations

import asyncio
import hashlib
import inspect
import json
import logging
import time
from types import SimpleNamespace
from typing import Any, Awaitable, Callable

import openai

logger = logging.getLogger(__name__)

TextDeltaCallback = Callable[[str, str], Awaitable[None] | None]


class ModelStreamError(RuntimeError):
    """HTTP 已成功建立但模型流在完成事件前异常中断。"""


def build_prompt_cache_key(
    *,
    model: str,
    system_prompt: str,
    tools: list[dict],
    scope: str = "",
) -> str:
    """按稳定提示词前缀生成匿名缓存键，不包含用户正文或凭据。"""
    payload = json.dumps(
        {
            "model": model.lower(),
            "system": system_prompt,
            "tools": tools,
            "scope": scope,
        },
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:40]
    return f"agent-{digest}"


def _default_prompt_cache_key(client: Any, create_kwargs: dict) -> str:
    """为未显式指定缓存键的后台任务提取稳定前缀。"""
    messages = list(create_kwargs.get("messages") or [])
    system_prompt = ""
    for message in messages:
        if message.get("role") == "system":
            system_prompt = _message_content(message.get("content"))
            break
    if not system_prompt and messages:
        # 无 system 的批处理通常把模板和动态材料放在同一 user 消息；
        # 只取前缀，既区分任务类型又不让动态正文破坏缓存路由。
        system_prompt = _message_content(messages[0].get("content"))[:2048]
    return build_prompt_cache_key(
        model=str(create_kwargs.get("model") or ""),
        system_prompt=system_prompt,
        tools=list(create_kwargs.get("tools") or []),
        scope=str(getattr(client, "_agent_provider_name", "") or ""),
    )


def preferred_api(client: Any, model: str) -> str:
    """返回本次请求实际应使用的协议：responses 或 chat。"""
    configured_mode = getattr(client, "_agent_api_mode", None)
    # 单元测试桩或旧 SDK 客户端可能只有 chat 属性；未显式配置协议时保留兼容。
    # 正式供应商客户端都会写入 _agent_api_mode，因此默认 responses 不受影响。
    if configured_mode is None and not hasattr(client, "responses"):
        return "chat"
    mode = str(configured_mode or "responses").lower()
    if mode == "responses":
        return "responses"
    if mode == "chat":
        return "chat"
    unavailable = getattr(client, "_agent_responses_unavailable_models", set())
    return "chat" if model in unavailable else "responses"


def _responses_unavailable_error(exc: BaseException) -> bool:
    """只把端点/协议不兼容视为可回退，普通参数错误仍应直接暴露。"""
    if isinstance(exc, (openai.NotFoundError, AttributeError)):
        return True
    if not isinstance(exc, openai.BadRequestError):
        return False
    detail = str(exc).lower()
    markers = (
        "/responses",
        "responses api",
        "unknown endpoint",
        "unsupported endpoint",
        "not supported",
        "not found",
    )
    return any(marker in detail for marker in markers)


def mark_responses_unavailable(client: Any, model: str) -> None:
    """记住自动模式下不支持 Responses 的模型，后续请求不再重复探测。"""
    unavailable = set(
        getattr(client, "_agent_responses_unavailable_models", set()) or set()
    )
    unavailable.add(model)
    try:
        client._agent_responses_unavailable_models = unavailable
    except Exception:
        pass


def should_fallback_to_chat(client: Any, exc: BaseException) -> bool:
    """自动模式遇到明确协议不兼容时允许回退；强制 Responses 模式不回退。"""
    mode = str(
        getattr(client, "_agent_api_mode", "responses") or "responses"
    ).lower()
    return mode == "auto" and _responses_unavailable_error(exc)


def _tool_to_responses(tool: dict) -> dict:
    function = tool.get("function") or {}
    return {
        "type": "function",
        "name": str(function.get("name") or ""),
        "description": str(function.get("description") or ""),
        "parameters": function.get("parameters") or {
            "type": "object",
            "properties": {},
        },
    }


def _message_content(content: Any) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    return json.dumps(content, ensure_ascii=False, default=str)


def _messages_to_responses(messages: list[dict]) -> tuple[str, list[dict]]:
    """把 Chat 历史转换成 Responses input；首个 system 独立为 instructions。"""
    instructions = ""
    response_input: list[dict] = []
    for index, message in enumerate(messages):
        role = str(message.get("role") or "user")
        content = _message_content(message.get("content"))
        if role == "system" and not instructions and index == 0:
            instructions = content
            continue
        if role == "tool":
            response_input.append({
                "type": "function_call_output",
                "call_id": str(message.get("tool_call_id") or ""),
                "output": content,
            })
            continue
        if role == "assistant" and message.get("tool_calls"):
            if content:
                response_input.append({
                    "type": "message",
                    "role": "assistant",
                    "content": content,
                })
            for tool_call in message.get("tool_calls") or []:
                function = tool_call.get("function") or {}
                response_input.append({
                    "type": "function_call",
                    "call_id": str(tool_call.get("id") or ""),
                    "name": str(function.get("name") or ""),
                    "arguments": str(function.get("arguments") or "{}"),
                })
            continue
        response_input.append({
            "type": "message",
            "role": role,
            "content": content,
        })
    return instructions, response_input


def to_responses_kwargs(
    chat_kwargs: dict,
    *,
    prompt_cache_key: str | None = None,
    stream: bool = False,
) -> dict:
    """把 Chat create 参数映射为 Responses create 参数。"""
    instructions, response_input = _messages_to_responses(
        list(chat_kwargs.get("messages") or [])
    )
    result: dict[str, Any] = {
        "model": chat_kwargs.get("model"),
        "input": response_input,
        "max_output_tokens": chat_kwargs.get("max_tokens"),
        "stream": stream,
    }
    if instructions:
        result["instructions"] = instructions
    if "temperature" in chat_kwargs:
        result["temperature"] = chat_kwargs["temperature"]
    if chat_kwargs.get("tools"):
        result["tools"] = [
            _tool_to_responses(tool) for tool in chat_kwargs["tools"]
        ]
    if chat_kwargs.get("reasoning_effort"):
        result["reasoning"] = {"effort": chat_kwargs["reasoning_effort"]}
    if prompt_cache_key:
        result["prompt_cache_key"] = prompt_cache_key
    if chat_kwargs.get("timeout") is not None:
        result["timeout"] = chat_kwargs["timeout"]
    return {key: value for key, value in result.items() if value is not None}


def _usage_to_chat(usage: Any) -> Any:
    if usage is None:
        return None
    input_details = getattr(usage, "input_tokens_details", None)
    cached_tokens = int(getattr(input_details, "cached_tokens", 0) or 0)
    return SimpleNamespace(
        prompt_tokens=int(getattr(usage, "input_tokens", 0) or 0),
        completion_tokens=int(getattr(usage, "output_tokens", 0) or 0),
        prompt_tokens_details=SimpleNamespace(cached_tokens=cached_tokens),
    )


def response_to_chat(response: Any) -> Any:
    """把 Responses 完整响应转换成 AgentLoop 使用的 ChatCompletion 形态。"""
    text_parts: list[str] = []
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str) and output_text:
        text_parts.append(output_text)

    tool_calls: list[Any] = []
    for index, item in enumerate(getattr(response, "output", None) or []):
        item_type = str(getattr(item, "type", "") or "")
        if item_type == "message" and not text_parts:
            for block in getattr(item, "content", None) or []:
                if getattr(block, "type", None) == "output_text":
                    text = getattr(block, "text", None)
                    if isinstance(text, str):
                        text_parts.append(text)
        elif item_type == "function_call":
            tool_calls.append(SimpleNamespace(
                id=str(
                    getattr(item, "call_id", None)
                    or getattr(item, "id", None)
                    or f"call_{index}"
                ),
                type="function",
                function=SimpleNamespace(
                    name=str(getattr(item, "name", "") or ""),
                    arguments=str(getattr(item, "arguments", "") or "{}"),
                ),
            ))

    finish_reason = "tool_calls" if tool_calls else "stop"
    if str(getattr(response, "status", "") or "") == "incomplete":
        details = getattr(response, "incomplete_details", None)
        reason = str(getattr(details, "reason", "") or "")
        finish_reason = "length" if "token" in reason else "incomplete"

    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(
                    role="assistant",
                    content="".join(text_parts),
                    tool_calls=tool_calls or None,
                ),
                finish_reason=finish_reason,
            )
        ],
        usage=_usage_to_chat(getattr(response, "usage", None)),
        response_id=str(getattr(response, "id", "") or ""),
        transport="responses",
    )


async def _emit_text_delta(
    callback: TextDeltaCallback,
    delta: str,
    text: str,
) -> None:
    try:
        value = callback(delta, text)
        if inspect.isawaitable(value):
            await value
    except Exception:
        logger.warning("LLM 流式回调失败，继续完成模型请求", exc_info=True)


def _stream_next(iterator):
    try:
        return True, next(iterator)
    except StopIteration:
        return False, None


async def _iterate_stream(stream: Any, is_async: bool):
    try:
        if is_async:
            async for item in stream:
                yield item
            return
        iterator = iter(stream)
        while True:
            has_item, item = await asyncio.to_thread(_stream_next, iterator)
            if not has_item:
                return
            yield item
    except (asyncio.CancelledError, GeneratorExit):
        raise
    except Exception as exc:
        raise ModelStreamError(f"模型流式响应中断: {exc}") from exc


def _chat_delta_text(delta: Any) -> str:
    content = getattr(delta, "content", None)
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts: list[str] = []
    for item in content:
        text = getattr(item, "text", None)
        if isinstance(text, str):
            parts.append(text)
        elif isinstance(item, dict) and isinstance(item.get("text"), str):
            parts.append(item["text"])
    return "".join(parts)


async def _create_chat_completion(
    client: Any,
    create_kwargs: dict,
    is_async: bool,
    callback: TextDeltaCallback | None,
    started_at: float,
) -> tuple[Any, int | None]:
    if callback is None:
        if is_async:
            response = await client.chat.completions.create(**create_kwargs)
        else:
            response = await asyncio.to_thread(
                client.chat.completions.create, **create_kwargs
            )
        return response, int((time.monotonic() - started_at) * 1000)

    stream_kwargs = dict(create_kwargs, stream=True)
    if is_async:
        stream = await client.chat.completions.create(**stream_kwargs)
    else:
        stream = await asyncio.to_thread(
            client.chat.completions.create, **stream_kwargs
        )

    text_parts: list[str] = []
    tool_parts: dict[int, dict] = {}
    finish_reason = "stop"
    usage = None
    first_token_ms: int | None = None
    async for chunk in _iterate_stream(stream, is_async):
        if getattr(chunk, "usage", None) is not None:
            usage = chunk.usage
        for choice in getattr(chunk, "choices", None) or []:
            if getattr(choice, "finish_reason", None):
                finish_reason = choice.finish_reason
            delta = getattr(choice, "delta", None)
            if delta is None:
                continue
            piece = _chat_delta_text(delta)
            if piece:
                text_parts.append(piece)
                full_text = "".join(text_parts)
                if first_token_ms is None:
                    first_token_ms = int((time.monotonic() - started_at) * 1000)
                await _emit_text_delta(callback, piece, full_text)
            for tool_delta in getattr(delta, "tool_calls", None) or []:
                index = int(getattr(tool_delta, "index", 0) or 0)
                target = tool_parts.setdefault(index, {
                    "id": "",
                    "type": "function",
                    "name": "",
                    "arguments": "",
                })
                target["id"] += str(getattr(tool_delta, "id", "") or "")
                target["type"] = str(
                    getattr(tool_delta, "type", "") or target["type"]
                )
                function = getattr(tool_delta, "function", None)
                if function is not None:
                    target["name"] += str(getattr(function, "name", "") or "")
                    target["arguments"] += str(
                        getattr(function, "arguments", "") or ""
                    )

    tool_calls = [
        SimpleNamespace(
            id=value["id"] or f"call_{index}",
            type=value["type"],
            function=SimpleNamespace(
                name=value["name"],
                arguments=value["arguments"],
            ),
        )
        for index, value in sorted(tool_parts.items())
    ]
    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(
                    role="assistant",
                    content="".join(text_parts),
                    tool_calls=tool_calls or None,
                ),
                finish_reason=finish_reason,
            )
        ],
        usage=usage,
        transport="chat",
    ), first_token_ms


async def _create_responses_completion(
    client: Any,
    create_kwargs: dict,
    is_async: bool,
    callback: TextDeltaCallback | None,
    prompt_cache_key: str | None,
    started_at: float,
) -> tuple[Any, int | None]:
    response_kwargs = to_responses_kwargs(
        create_kwargs,
        prompt_cache_key=prompt_cache_key,
        stream=callback is not None,
    )
    if callback is None:
        if is_async:
            response = await client.responses.create(**response_kwargs)
        else:
            response = await asyncio.to_thread(
                client.responses.create, **response_kwargs
            )
        return response_to_chat(response), int(
            (time.monotonic() - started_at) * 1000
        )

    if is_async:
        stream = await client.responses.create(**response_kwargs)
    else:
        stream = await asyncio.to_thread(
            client.responses.create, **response_kwargs
        )

    text_parts: list[str] = []
    tool_calls: list[Any] = []
    completed_response = None
    first_token_ms: int | None = None
    async for event in _iterate_stream(stream, is_async):
        event_type = str(getattr(event, "type", "") or "")
        if event_type == "response.output_text.delta":
            piece = str(getattr(event, "delta", "") or "")
            if piece:
                text_parts.append(piece)
                full_text = "".join(text_parts)
                if first_token_ms is None:
                    first_token_ms = int((time.monotonic() - started_at) * 1000)
                await _emit_text_delta(callback, piece, full_text)
        elif event_type == "response.output_item.done":
            item = getattr(event, "item", None)
            if getattr(item, "type", None) == "function_call":
                tool_calls.append(item)
        elif event_type in {"response.completed", "response.incomplete"}:
            completed_response = getattr(event, "response", None)
        elif event_type == "response.failed":
            response = getattr(event, "response", None)
            error = getattr(response, "error", None)
            detail = str(
                getattr(error, "message", None)
                or error
                or "Responses 流式请求失败"
            )
            raise ModelStreamError(detail)

    if completed_response is not None:
        return response_to_chat(completed_response), first_token_ms

    fallback = SimpleNamespace(
        id="",
        status="completed",
        output=[
            SimpleNamespace(
                type="message",
                content=[
                    SimpleNamespace(type="output_text", text="".join(text_parts))
                ],
            ),
            *tool_calls,
        ],
        output_text="".join(text_parts),
        usage=None,
    )
    return response_to_chat(fallback), first_token_ms


async def create_model_completion(
    client: Any,
    create_kwargs: dict,
    *,
    is_async: bool,
    callback: TextDeltaCallback | None = None,
    prompt_cache_key: str | None = None,
) -> tuple[Any, int | None]:
    """按供应商策略调用模型；自动模式下协议不兼容才降级到 Chat。"""
    started_at = time.monotonic()
    model = str(create_kwargs.get("model") or "")
    if preferred_api(client, model) == "responses":
        prompt_cache_key = prompt_cache_key or _default_prompt_cache_key(
            client,
            create_kwargs,
        )
        try:
            return await _create_responses_completion(
                client,
                create_kwargs,
                is_async,
                callback,
                prompt_cache_key,
                started_at,
            )
        except Exception as exc:
            if not should_fallback_to_chat(client, exc):
                raise
            mark_responses_unavailable(client, model)
            logger.warning(
                "供应商不支持 Responses API，模型 %s 本进程自动降级到 Chat Completions: %s",
                model,
                exc,
            )
    return await _create_chat_completion(
        client,
        create_kwargs,
        is_async,
        callback,
        started_at,
    )


def create_model_completion_sync(
    client: Any,
    create_kwargs: dict,
    *,
    prompt_cache_key: str | None = None,
) -> Any:
    """同步服务调用的轻量入口；与 Agent 循环使用相同的协议选择和降级规则。"""
    model = str(create_kwargs.get("model") or "")
    if preferred_api(client, model) == "responses":
        prompt_cache_key = prompt_cache_key or _default_prompt_cache_key(
            client,
            create_kwargs,
        )
        try:
            response = client.responses.create(**to_responses_kwargs(
                create_kwargs,
                prompt_cache_key=prompt_cache_key,
                stream=False,
            ))
            return response_to_chat(response)
        except Exception as exc:
            if not should_fallback_to_chat(client, exc):
                raise
            mark_responses_unavailable(client, model)
            logger.warning(
                "供应商不支持 Responses API，模型 %s 本进程自动降级到 Chat Completions: %s",
                model,
                exc,
            )
    return client.chat.completions.create(**create_kwargs)
