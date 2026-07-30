"""Responses API 适配层回归测试。"""
from __future__ import annotations

from types import SimpleNamespace

import httpx
import openai

from app.services.model_transport import (
    build_prompt_cache_key,
    create_model_completion,
    create_model_completion_sync,
    to_responses_kwargs,
)


def _response(text: str = "完成", *, cached_tokens: int = 0):
    return SimpleNamespace(
        id="resp_1",
        status="completed",
        output_text=text,
        output=[
            SimpleNamespace(
                type="message",
                content=[SimpleNamespace(type="output_text", text=text)],
            )
        ],
        usage=SimpleNamespace(
            input_tokens=120,
            output_tokens=8,
            input_tokens_details=SimpleNamespace(cached_tokens=cached_tokens),
        ),
    )


class _SyncResponses:
    def __init__(self):
        self.kwargs = None

    def create(self, **kwargs):
        self.kwargs = kwargs
        return _response(cached_tokens=96)


class _ForbiddenChat:
    def create(self, **kwargs):
        raise AssertionError("Responses 模式不应调用 Chat Completions")


def test_sync_responses_maps_cache_key_and_usage():
    responses = _SyncResponses()
    client = SimpleNamespace(
        _agent_api_mode="responses",
        responses=responses,
        chat=SimpleNamespace(completions=_ForbiddenChat()),
    )
    result = create_model_completion_sync(client, {
        "model": "gpt-5.6-terra",
        "messages": [
            {"role": "system", "content": "稳定系统提示词"},
            {"role": "user", "content": "你好"},
        ],
        "max_tokens": 128,
    }, prompt_cache_key="agent-test")

    assert result.choices[0].message.content == "完成"
    assert result.usage.prompt_tokens == 120
    assert result.usage.prompt_tokens_details.cached_tokens == 96
    assert result.transport == "responses"
    assert responses.kwargs["prompt_cache_key"] == "agent-test"
    assert responses.kwargs["instructions"] == "稳定系统提示词"
    assert responses.kwargs["max_output_tokens"] == 128
    assert "messages" not in responses.kwargs


def test_real_sdk_posts_to_responses_endpoint_not_chat():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["path"] = request.url.path
        captured["body"] = request.read().decode("utf-8")
        return httpx.Response(200, json={
            "id": "resp_wire",
            "object": "response",
            "created_at": 1,
            "status": "completed",
            "model": "gpt-5.6-sol",
            "output": [{
                "id": "msg_1",
                "type": "message",
                "status": "completed",
                "role": "assistant",
                "content": [{
                    "type": "output_text",
                    "text": "wire-ok",
                    "annotations": [],
                    "logprobs": [],
                }],
            }],
            "parallel_tool_calls": True,
            "tool_choice": "auto",
            "tools": [],
            "usage": {
                "input_tokens": 10,
                "input_tokens_details": {"cached_tokens": 8},
                "output_tokens": 2,
                "output_tokens_details": {"reasoning_tokens": 0},
                "total_tokens": 12,
            },
        })

    http_client = httpx.Client(transport=httpx.MockTransport(handler))
    client = openai.OpenAI(
        api_key="test",
        base_url="https://gateway.example/v1",
        http_client=http_client,
    )
    client._agent_api_mode = "responses"
    result = create_model_completion_sync(client, {
        "model": "gpt-5.6-sol",
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 32,
    })

    assert captured["path"] == "/v1/responses"
    assert '"prompt_cache_key"' in captured["body"]
    assert "/chat/completions" not in captured["path"]
    assert result.choices[0].message.content == "wire-ok"
    assert result.usage.prompt_tokens_details.cached_tokens == 8


def test_tool_history_is_converted_to_responses_items():
    kwargs = to_responses_kwargs({
        "model": "gpt-5.6-sol",
        "messages": [
            {"role": "system", "content": "系统"},
            {
                "role": "assistant",
                "content": "",
                "tool_calls": [{
                    "id": "call_1",
                    "type": "function",
                    "function": {"name": "lookup", "arguments": '{"q":"x"}'},
                }],
            },
            {"role": "tool", "tool_call_id": "call_1", "content": "结果"},
        ],
        "tools": [{
            "type": "function",
            "function": {
                "name": "lookup",
                "description": "查询",
                "parameters": {"type": "object"},
            },
        }],
    })

    assert kwargs["input"][0]["type"] == "function_call"
    assert kwargs["input"][1] == {
        "type": "function_call_output",
        "call_id": "call_1",
        "output": "结果",
    }
    assert kwargs["tools"][0]["name"] == "lookup"
    assert "function" not in kwargs["tools"][0]


class _AsyncResponses:
    def __init__(self, events):
        self.events = events
        self.kwargs = None

    async def create(self, **kwargs):
        self.kwargs = kwargs

        async def stream():
            for event in self.events:
                yield event

        return stream()


async def test_responses_stream_emits_real_deltas_and_completed_usage():
    completed = _response("你好", cached_tokens=64)
    responses = _AsyncResponses([
        SimpleNamespace(type="response.output_text.delta", delta="你"),
        SimpleNamespace(type="response.output_text.delta", delta="好"),
        SimpleNamespace(type="response.completed", response=completed),
    ])
    client = SimpleNamespace(
        _agent_api_mode="responses",
        responses=responses,
        chat=SimpleNamespace(completions=_ForbiddenChat()),
    )
    events: list[tuple[str, str]] = []

    result, first_token_ms = await create_model_completion(
        client,
        {
            "model": "gpt-5.6-sol",
            "messages": [{"role": "user", "content": "问候"}],
            "max_tokens": 64,
        },
        is_async=True,
        callback=lambda delta, text: events.append((delta, text)),
        prompt_cache_key="agent-stream",
    )

    assert result.choices[0].message.content == "你好"
    assert result.usage.prompt_tokens_details.cached_tokens == 64
    assert first_token_ms is not None
    assert events == [("你", "你"), ("好", "你好")]
    assert responses.kwargs["stream"] is True


def test_prompt_cache_key_is_stable_and_does_not_include_user_input():
    first = build_prompt_cache_key(
        model="gpt-5.6-terra",
        system_prompt="系统前缀",
        tools=[],
        scope="employee-a",
    )
    second = build_prompt_cache_key(
        model="gpt-5.6-terra",
        system_prompt="系统前缀",
        tools=[],
        scope="employee-a",
    )
    changed = build_prompt_cache_key(
        model="gpt-5.6-terra",
        system_prompt="另一个系统前缀",
        tools=[],
        scope="employee-a",
    )

    assert first == second
    assert first != changed
    assert "系统前缀" not in first
