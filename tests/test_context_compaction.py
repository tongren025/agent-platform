"""Yuxi L1 上下文精简：大型工具结果卸载与 AgentLoop 接入。"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.runtime.context_compaction import (
    LARGE_TOOL_RESULTS_PREFIX,
    compact_tool_result,
)
from app.runtime.loop import (
    AgentLoopOptions,
    ToolHandler,
    run_agent_loop,
)


def test_small_tool_result_stays_inline():
    """小结果不写工作区，也不改变模型看到的内容。"""
    files: dict[str, str] = {}

    result = compact_tool_result(
        "search",
        "三条简短结果",
        files=files,
        token_limit=300,
    )

    assert result == "三条简短结果"
    assert files == {}


def test_large_tool_result_is_saved_with_stable_path_and_preview():
    """大型结果使用内容寻址路径保存，返回值只保留预览和读取指引。"""
    files: dict[str, str] = {}
    content = "检索结果-" * 400

    first = compact_tool_result(
        "mcp__web/search",
        content,
        files=files,
        token_limit=40,
    )
    second = compact_tool_result(
        "mcp__web/search",
        content,
        files=files,
        token_limit=40,
    )

    assert first == second
    assert len(files) == 1
    path = next(iter(files))
    assert path.startswith(f"{LARGE_TOOL_RESULTS_PREFIX}/mcp__web-search-")
    assert files[path] == content
    assert f"Full output path: {path}" in first
    assert "Use read_file" in first
    assert content not in first


class _RecordingCreate:
    """同步假客户端：按顺序返回两轮响应并保留请求参数。"""

    def __init__(self, responses: list[object]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def __call__(self, **kwargs):
        self.calls.append(kwargs)
        return self._responses.pop(0)


def _tool_call_response() -> object:
    """构造一轮调用 search 工具的兼容响应。"""
    return SimpleNamespace(
        usage=None,
        choices=[SimpleNamespace(
            finish_reason="tool_calls",
            message=SimpleNamespace(
                content="",
                tool_calls=[SimpleNamespace(
                    id="call_1",
                    function=SimpleNamespace(
                        name="search",
                        arguments="{}",
                    ),
                )],
            ),
        )],
    )


def _stop_response() -> object:
    """构造工具结果后的最终回复。"""
    return SimpleNamespace(
        usage=None,
        choices=[SimpleNamespace(
            finish_reason="stop",
            message=SimpleNamespace(
                content="已读取摘要",
                tool_calls=None,
            ),
        )],
    )


@pytest.mark.asyncio
async def test_agent_loop_only_sends_compacted_result_to_next_model():
    """trace 保留原结果，下一轮模型上下文改用紧凑引用。"""
    content = "A" * 1600
    files: dict[str, str] = {}
    create = _RecordingCreate([_tool_call_response(), _stop_response()])
    client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(create=create),
        )
    )

    async def handle(_args: str) -> str:
        return content

    result = await run_agent_loop(
        client=client,
        options=AgentLoopOptions(
            model="test-model",
            max_retries=0,
            tool_result_transform=lambda name, value: compact_tool_result(
                name,
                value,
                files=files,
                token_limit=40,
            ),
        ),
        system_prompt="system",
        user_message="search",
        tools=[ToolHandler(
            name="search",
            description="search",
            input_schema={"type": "object", "properties": {}},
            handler=handle,
        )],
    )

    sent_tool_message = [
        message
        for message in create.calls[1]["messages"]
        if message["role"] == "tool"
    ][-1]
    assert sent_tool_message["role"] == "tool"
    assert sent_tool_message["content"].startswith("[Tool result saved]")
    assert content not in sent_tool_message["content"]
    assert result.traces[0].result == content
    assert next(iter(files.values())) == content
    assert result.final_text == "已读取摘要"
