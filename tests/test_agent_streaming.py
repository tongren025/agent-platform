"""数字员工流式接口回归：保证内容事件在最终结果之前逐段送达。"""

from __future__ import annotations

import json

import pytest

from app.api import agent
from app.models.conversation import AgentRunRequest


class _ConnectedRequest:
    async def is_disconnected(self) -> bool:
        return False


@pytest.mark.asyncio
async def test_agent_stream_emits_incremental_content_before_result(monkeypatch):
    async def fake_execute(body, *, on_text_delta=None):
        assert body.run_id == "run_stream_test"
        assert on_text_delta is not None
        await on_text_delta("第一段", "第一段")
        await on_text_delta("第二段", "第一段第二段")
        return {
            "data": {
                "runId": body.run_id,
                "assistantMessage": "第一段第二段",
                "cancelled": False,
                "sessionId": "ses_stream_test",
            }
        }

    monkeypatch.setattr(agent, "_execute_agent_run", fake_execute)
    response = agent._stream_agent_events(
        _ConnectedRequest(),
        AgentRunRequest(
            employeeKey="stream-employee",
            userInput="请流式回复",
            runId="run_stream_test",
        ),
    )

    events = [
        json.loads(chunk.decode("utf-8"))
        async for chunk in response.body_iterator
    ]

    assert [item["event"] for item in events] == [
        "initial",
        "content",
        "content",
        "result",
        "done",
    ]
    assert events[1]["data"] == {"delta": "第一段", "text": "第一段"}
    assert events[2]["data"] == {
        "delta": "第二段",
        "text": "第一段第二段",
    }
    assert events[3]["data"]["assistantMessage"] == "第一段第二段"
    assert response.media_type == "application/x-ndjson"
    assert response.headers["cache-control"] == "no-cache, no-transform"
    assert response.headers["x-accel-buffering"] == "no"
