"""Responses-first 统一生成入口的契约测试。"""
from __future__ import annotations

import json
from types import SimpleNamespace

from app.services.model_generation import (
    extract_response_text,
    generate_response_text,
)


def test_generate_text_uses_responses_and_omits_gpt5_temperature():
    captured = {}

    class Responses:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(output_text="完成")

    client = SimpleNamespace(responses=Responses())
    text = generate_response_text(
        client=client,
        model="gpt-5.6-terra",
        instructions="只返回结论",
        input_data="分析",
        reasoning_effort="medium",
        temperature=0.7,
        max_output_tokens=1234,
    )

    assert text == "完成"
    assert captured["input"] == "分析"
    assert captured["instructions"] == "只返回结论"
    assert captured["reasoning"] == {"effort": "medium"}
    assert captured["max_output_tokens"] == 1234
    assert "temperature" not in captured
    assert not hasattr(client, "chat")


def test_extract_response_text_accepts_serialized_typed_output():
    response = json.dumps(
        json.dumps({
            "output": [
                {"type": "reasoning", "summary": []},
                {
                    "type": "message",
                    "content": [
                        {"type": "output_text", "text": "统一响应"},
                    ],
                },
            ],
        }, ensure_ascii=False),
        ensure_ascii=False,
    )

    assert extract_response_text(response) == "统一响应"


def test_extract_response_text_reads_mis_shaped_proxy_without_chat_retry():
    response = {
        "choices": [
            {"message": {"content": "兼容读取"}},
        ],
    }

    assert extract_response_text(response) == "兼容读取"
