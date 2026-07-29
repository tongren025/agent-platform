"""OpenAI 兼容接口响应归一化。

标准 OpenAI SDK 返回带 ``choices`` 的对象；部分中转服务会返回字典、序列化 JSON
字符串或纯文本。本模块把这些形态统一成调用方可消费的 Chat Completions 结构。
"""
from __future__ import annotations

import json
from types import SimpleNamespace
from typing import Any


_IMAGE_ONLY_MODEL_PREFIXES = (
    "chatgpt-image-",
    "dall-e-",
    "gpt-image-",
)


def select_chat_completion_model(models: list[dict]) -> str:
    """选择可用于 Chat Completions 连通测试的模型，跳过纯生图模型。"""
    for model in models:
        model_id = str(
            model.get("modelId")
            or model.get("actualModelId")
            or model.get("modelName")
            or ""
        ).strip()
        if not model_id:
            continue
        normalized = model_id.lower()
        if normalized.startswith(_IMAGE_ONLY_MODEL_PREFIXES):
            continue
        return model_id
    return ""


def _to_namespace(value: Any) -> Any:
    """递归把字典转换为属性可访问对象，列表保持列表语义。"""
    if isinstance(value, dict):
        return SimpleNamespace(**{
            key: _to_namespace(item) for key, item in value.items()
        })
    if isinstance(value, list):
        return [_to_namespace(item) for item in value]
    return value


def _decode_json_string(value: str) -> Any:
    """最多解两层 JSON 字符串，兼容上游把标准响应重复序列化的情况。"""
    decoded: Any = value
    for _ in range(2):
        if not isinstance(decoded, str):
            break
        try:
            next_value = json.loads(decoded)
        except (json.JSONDecodeError, TypeError):
            break
        if next_value == decoded:
            break
        decoded = next_value
    return decoded


def normalize_chat_completion(response: Any) -> Any:
    """把对象、字典、JSON 字符串或纯文本归一为带 ``choices`` 的响应。"""
    if hasattr(response, "choices"):
        return response

    if isinstance(response, bytes):
        response = response.decode("utf-8", errors="replace")
    if isinstance(response, str):
        response = _decode_json_string(response)

    if isinstance(response, dict) and isinstance(response.get("choices"), list):
        return _to_namespace(response)

    if isinstance(response, str):
        content = response
    else:
        content = json.dumps(response, ensure_ascii=False, default=str)

    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(
                    role="assistant",
                    content=content,
                    tool_calls=None,
                ),
                finish_reason="stop",
            )
        ],
        usage=None,
    )


def extract_chat_content(response: Any) -> str:
    """提取第一条 assistant 文本；响应结构缺失时给出明确错误。"""
    normalized = normalize_chat_completion(response)
    choices = getattr(normalized, "choices", None)
    if not choices:
        raise ValueError("模型响应中没有 choices")
    message = getattr(choices[0], "message", None)
    if message is None:
        raise ValueError("模型响应中没有 message")
    content = getattr(message, "content", "")
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    return json.dumps(content, ensure_ascii=False, default=str)
