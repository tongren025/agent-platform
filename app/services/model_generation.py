"""Responses-first 的统一文本/多模态生成入口。

业务模块不得直接调用 ``chat.completions``。Responses API 是默认且唯一的现代
生成入口；旧代理兼容只允许集中在运行时显式 ``api_surface=chat_completions``
的分支中，避免同一模型在不同业务模块走不同协议。
"""
from __future__ import annotations

import json
from typing import Any


def _item_value(item: object, key: str, default=None):
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


def extract_response_text(response: object) -> str:
    """从 Responses SDK 对象、兼容字典或序列化 JSON 中提取文本。"""
    if isinstance(response, bytes):
        response = response.decode("utf-8", errors="replace")
    if isinstance(response, str):
        for _ in range(2):
            try:
                decoded = json.loads(response)
            except (json.JSONDecodeError, TypeError):
                return response
            if decoded == response:
                break
            response = decoded
            if not isinstance(response, str):
                break
        if isinstance(response, str):
            return response

    direct = _item_value(response, "output_text", "")
    if isinstance(direct, str) and direct:
        return direct

    chunks: list[str] = []
    for item in _item_value(response, "output", []) or []:
        if _item_value(item, "type") != "message":
            continue
        for content in _item_value(item, "content", []) or []:
            if _item_value(content, "type") not in {"output_text", "text"}:
                continue
            text = _item_value(content, "text", "")
            if isinstance(text, str) and text:
                chunks.append(text)
    if chunks:
        return "\n".join(chunks)

    # 某些 OpenAI 兼容代理错误地在 /responses 返回 Chat 形状；只兼容读取，
    # 不会因此再次请求 /chat/completions。
    choices = _item_value(response, "choices", []) or []
    if choices:
        message = _item_value(choices[0], "message", {})
        content = _item_value(message, "content", "")
        if isinstance(content, str):
            return content
    return ""


def generate_response_text(
    *,
    client: Any,
    model: str,
    input_data: str | list[dict],
    instructions: str = "",
    max_output_tokens: int = 4096,
    reasoning_effort: str | None = None,
    temperature: float | None = None,
    timeout: float | None = None,
    store: bool = False,
) -> str:
    """调用 Responses API 并返回最终文本。

    GPT-5 系列不发送 ``temperature``，避免 reasoning 模型拒绝该参数；其他
    OpenAI 兼容文本模型继续保留原业务温度。调用失败原样抛出，由业务层决定
    重试、降级或向用户报告，不静默切回旧 Chat 接口。
    """
    model_id = str(model or "").strip()
    if not model_id:
        raise ValueError("Responses 调用缺少模型 ID")

    kwargs: dict[str, Any] = {
        "model": model_id,
        "input": input_data,
        "max_output_tokens": max_output_tokens,
        "store": store,
    }
    if instructions:
        kwargs["instructions"] = instructions
    if reasoning_effort and reasoning_effort != "none":
        kwargs["reasoning"] = {"effort": reasoning_effort}
    if temperature is not None and "gpt-5" not in model_id.lower():
        kwargs["temperature"] = temperature
    if timeout is not None:
        kwargs["timeout"] = timeout

    response = client.responses.create(**kwargs)
    return extract_response_text(response)
