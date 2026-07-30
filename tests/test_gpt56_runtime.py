from __future__ import annotations

from contextlib import asynccontextmanager
from types import SimpleNamespace

import httpx
import openai
import pytest

from app.models.runtime import (
    EmployeeRuntimeSnapshot,
    PromptCompileResult,
    RuntimeTool,
)
from app.runtime import runner
from app.runtime.loop import (
    AgentLoopResult,
    AgentLoopOptions,
    ToolHandler,
    _create_response_with_retry,
    _create_with_retry,
    run_agent_loop,
    run_responses_agent_loop,
)


class _ChatCompletions:
    def __init__(self):
        self.kwargs = None

    def create(self, **kwargs):
        self.kwargs = kwargs
        return SimpleNamespace(ok=True)


class _ChatClient:
    def __init__(self):
        self._agent_api_mode = "chat"
        self.chat = SimpleNamespace(completions=_ChatCompletions())


@pytest.mark.asyncio
async def test_gpt56_chat_uses_reasoning_and_max_completion_tokens():
    client = _ChatClient()
    options = AgentLoopOptions(
        model="gpt-5.6-terra",
        reasoning_effort="none",
        max_tokens=1234,
        max_retries=0,
    )

    await _create_with_retry(
        client,
        {"messages": [{"role": "user", "content": "hi"}]},
        False,
        options,
        1,
    )

    kwargs = client.chat.completions.kwargs
    assert kwargs["reasoning_effort"] == "none"
    assert kwargs["max_completion_tokens"] == 1234
    assert "max_tokens" not in kwargs
    assert "temperature" not in kwargs


@pytest.mark.asyncio
async def test_gpt56_chat_rejects_reasoning_with_function_tools():
    client = _ChatClient()

    async def handler(_: str) -> str:
        return "ok"

    result = await run_agent_loop(
        client,
        AgentLoopOptions(
            model="gpt-5.6-sol",
            reasoning_effort="high",
            max_retries=0,
        ),
        "system",
        "user",
        [ToolHandler("demo", "demo", {"type": "object"}, handler)],
    )

    assert not result.success
    assert "Responses API" in result.final_text
    assert client.chat.completions.kwargs is None


class _Responses:
    def __init__(self):
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if len(self.calls) == 1:
            call = SimpleNamespace(
                type="function_call",
                id="fc_1",
                call_id="call_1",
                name="demo",
                arguments='{"value": 7}',
            )
            return SimpleNamespace(
                output=[call],
                output_text="",
                usage=SimpleNamespace(input_tokens=10, output_tokens=4),
            )
        message = SimpleNamespace(
            type="message",
            role="assistant",
            content=[SimpleNamespace(type="output_text", text="完成")],
        )
        return SimpleNamespace(
            output=[message],
            output_text="完成",
            usage=SimpleNamespace(input_tokens=12, output_tokens=3),
        )


class _ResponsesClient:
    def __init__(self):
        self.responses = _Responses()


@pytest.mark.asyncio
async def test_responses_fallback_only_sends_reasoning_to_gpt56():
    calls = []

    class FallbackResponses:
        def create(self, **kwargs):
            calls.append(kwargs)
            if kwargs["model"] == "gpt-5.6-sol":
                request = httpx.Request(
                    "POST",
                    "https://api.openai.com/v1/responses",
                )
                response = httpx.Response(404, request=request)
                raise openai.NotFoundError(
                    "not found",
                    response=response,
                    body=None,
                )
            return SimpleNamespace(output_text="备用成功", output=[])

    client = SimpleNamespace(responses=FallbackResponses())
    result = await _create_response_with_retry(
        client,
        {"input": "hi"},
        False,
        AgentLoopOptions(
            model="gpt-5.6-sol",
            fallback_models=["gpt-4o"],
            reasoning_effort="high",
            max_retries=0,
        ),
        1,
    )

    assert result.output_text == "备用成功"
    assert calls[0]["reasoning"] == {"effort": "high"}
    assert "reasoning" not in calls[1]


@pytest.mark.asyncio
async def test_responses_loop_replays_tool_output_and_preserves_reasoning():
    client = _ResponsesClient()
    received = []

    async def handler(arguments: str) -> str:
        received.append(arguments)
        return '{"success": true}'

    result = await run_responses_agent_loop(
        client,
        AgentLoopOptions(
            model="gpt-5.6-sol",
            reasoning_effort="high",
            max_tokens=2048,
            max_retries=0,
        ),
        "system",
        "user",
        [ToolHandler("demo", "demo", {"type": "object"}, handler)],
    )

    assert result.success
    assert result.final_text == "完成"
    assert received == ['{"value": 7}']
    assert result.prompt_tokens == 22
    assert result.completion_tokens == 7
    assert len(client.responses.calls) == 2
    first = client.responses.calls[0]
    second = client.responses.calls[1]
    assert first["reasoning"] == {"effort": "high"}
    assert first["max_output_tokens"] == 2048
    assert first["store"] is False
    assert any(
        item.get("type") == "function_call_output"
        and item.get("call_id") == "call_1"
        for item in second["input"]
    )


@pytest.mark.asyncio
async def _legacy_runner_only_falls_back_when_proxy_compatibility_is_explicit(
    monkeypatch,
):
    calls = []

    async def responses_loop(**_kwargs):
        calls.append("responses")
        return AgentLoopResult(
            success=False,
            final_text="404 /responses endpoint not found",
        )

    async def chat_loop(**kwargs):
        calls.append("chat")
        assert kwargs["options"].reasoning_effort == "none"
        return AgentLoopResult(success=True, final_text="已完成")

    @asynccontextmanager
    async def no_mcp(_servers):
        yield []

    monkeypatch.setattr(
        runner.ai_service,
        "get_client",
        lambda *_args, **_kwargs: (SimpleNamespace(), "gpt-5.6-sol"),
    )
    monkeypatch.setattr(
        runner,
        "run_responses_agent_loop",
        responses_loop,
    )
    monkeypatch.setattr(runner, "run_agent_loop", chat_loop)
    monkeypatch.setattr(runner, "mcp_tool_handlers", no_mcp)

    result = await runner.run_agent(
        snapshot=EmployeeRuntimeSnapshot(
            employee_key="qa",
            default_model_policy={
                "model_id": "gpt-5.6-sol",
                "reasoning_effort": "high",
                "allow_chat_fallback": True,
            },
        ),
        compiled_prompt=PromptCompileResult(system_prompt="qa"),
        user_message="检查图片",
        visible_tools=[
            RuntimeTool(
                tool_code="inspect_media",
                name="检查媒体",
                input_schema='{"type":"object"}',
            )
        ],
        visible_mcp_servers=[],
        employee_key="qa",
    )

    assert result.success is True
    assert result.assistant_message == "已完成"
    assert calls == ["responses", "chat"]


@pytest.mark.asyncio
async def _legacy_runner_does_not_silently_fallback_to_chat(monkeypatch):
    calls = []

    async def responses_loop(**_kwargs):
        calls.append("responses")
        return AgentLoopResult(
            success=False,
            final_text="404 /responses endpoint not found",
        )

    async def chat_loop(**_kwargs):
        calls.append("chat")
        return AgentLoopResult(success=True, final_text="不应执行")

    @asynccontextmanager
    async def no_mcp(_servers):
        yield []

    monkeypatch.setattr(
        runner.ai_service,
        "get_client",
        lambda *_args, **_kwargs: (SimpleNamespace(), "gpt-5.6-sol"),
    )
    monkeypatch.setattr(runner, "run_responses_agent_loop", responses_loop)
    monkeypatch.setattr(runner, "run_agent_loop", chat_loop)
    monkeypatch.setattr(runner, "mcp_tool_handlers", no_mcp)

    result = await runner.run_agent(
        snapshot=EmployeeRuntimeSnapshot(
            employee_key="qa",
            default_model_policy={
                "model_id": "gpt-5.6-sol",
                "reasoning_effort": "high",
            },
        ),
        compiled_prompt=PromptCompileResult(system_prompt="qa"),
        user_message="检查图片",
        visible_tools=[],
        visible_mcp_servers=[],
        employee_key="qa",
    )

    assert result.success is False
    assert calls == ["responses"]


@pytest.mark.asyncio
async def _legacy_runner_does_not_fallback_after_a_tool_side_effect(
    monkeypatch,
):
    calls = []

    async def responses_loop(**_kwargs):
        calls.append("responses")
        return AgentLoopResult(
            success=False,
            final_text="connection lost after tool",
            traces=[
                SimpleNamespace(
                    tool_name="generate_image",
                    result=None,
                    success=True,
                )
            ],
        )

    async def chat_loop(**_kwargs):
        calls.append("chat")
        return AgentLoopResult(success=True, final_text="不应执行")

    @asynccontextmanager
    async def no_mcp(_servers):
        yield []

    monkeypatch.setattr(
        runner.ai_service,
        "get_client",
        lambda *_args, **_kwargs: (SimpleNamespace(), "gpt-5.6-sol"),
    )
    monkeypatch.setattr(
        runner,
        "run_responses_agent_loop",
        responses_loop,
    )
    monkeypatch.setattr(runner, "run_agent_loop", chat_loop)
    monkeypatch.setattr(runner, "mcp_tool_handlers", no_mcp)

    result = await runner.run_agent(
        snapshot=EmployeeRuntimeSnapshot(
            employee_key="artist",
            default_model_policy={
                "model_id": "gpt-5.6-sol",
                "reasoning_effort": "high",
            },
        ),
        compiled_prompt=PromptCompileResult(system_prompt="artist"),
        user_message="生成图片",
        visible_tools=[
            RuntimeTool(
                tool_code="generate_image",
                name="生成图片",
                input_schema='{"type":"object"}',
            )
        ],
        visible_mcp_servers=[],
        employee_key="artist",
    )

    assert result.success is False
    assert calls == ["responses"]
