"""OpenAI 兼容响应归一化测试。"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from app.runtime.loop import AgentLoopOptions, run_agent_loop
from app.services.chat_response import extract_chat_content, normalize_chat_completion


def test_standard_completion_is_preserved():
    response = SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content="标准回复", tool_calls=None),
                finish_reason="stop",
            )
        ],
        usage=None,
    )

    assert normalize_chat_completion(response) is response
    assert extract_chat_content(response) == "标准回复"


def test_plain_string_is_wrapped_as_assistant_reply():
    response = normalize_chat_completion("字符串回复")

    assert response.choices[0].message.content == "字符串回复"
    assert response.choices[0].message.tool_calls is None
    assert response.choices[0].finish_reason == "stop"
    assert response.usage is None


def test_serialized_chat_completion_is_decoded():
    payload = {
        "choices": [{
            "message": {"role": "assistant", "content": "序列化回复"},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 2, "completion_tokens": 3},
    }
    response = normalize_chat_completion(json.dumps(json.dumps(payload)))

    assert extract_chat_content(response) == "序列化回复"
    assert response.usage.prompt_tokens == 2
    assert response.usage.completion_tokens == 3


def test_dictionary_completion_supports_attribute_access():
    response = normalize_chat_completion({
        "choices": [{
            "message": {
                "content": "",
                "tool_calls": [{
                    "id": "call-1",
                    "function": {"name": "lookup", "arguments": "{}"},
                }],
            },
            "finish_reason": "tool_calls",
        }],
        "usage": None,
    })

    assert response.choices[0].message.tool_calls[0].function.name == "lookup"


@pytest.mark.asyncio
async def test_agent_loop_accepts_plain_string_completion(monkeypatch):
    async def fake_create(*_args, **_kwargs):
        return "代理字符串回复"

    monkeypatch.setattr("app.runtime.loop._create_with_retry", fake_create)

    result = await run_agent_loop(
        client=SimpleNamespace(),
        options=AgentLoopOptions(model="gpt-test", max_retries=0),
        system_prompt="系统提示",
        user_message="你好",
        tools=[],
    )

    assert result.success is True
    assert result.final_text == "代理字符串回复"
    assert result.messages[-1] == {
        "role": "assistant",
        "content": "代理字符串回复",
    }
