"""Agent 调用性能边界回归：历史上下文必须有预算，不能随会话无限增长。"""
from __future__ import annotations

from app.models.conversation import ConversationMessage, ConversationSession
from app.services.invocation import (
    _HISTORY_MAX_CHARS,
    _HISTORY_MAX_MESSAGES,
    _bounded_history,
)


def test_bounded_history_keeps_recent_messages_within_budget():
    session = ConversationSession(
        sessionId="ses_perf",
        employeeKey="comic-screenwriter",
        messages=[
            ConversationMessage(role="user" if index % 2 == 0 else "assistant", content=str(index) * 2000)
            for index in range(40)
        ],
    )

    history = _bounded_history(session)

    assert len(history) <= _HISTORY_MAX_MESSAGES
    assert sum(len(item["content"]) for item in history) <= _HISTORY_MAX_CHARS
    assert history[-1]["content"].endswith("39")


def test_bounded_history_uses_existing_summary_for_dropped_messages():
    session = ConversationSession(
        sessionId="ses_summary",
        employeeKey="comic-director",
        compressedSummary="第一幕已经完成，主角拿到了钥匙。",
        messages=[
            ConversationMessage(role="user", content=f"消息 {index}" * 1000)
            for index in range(30)
        ],
    )

    history = _bounded_history(session)

    assert history[0]["role"] == "system"
    assert "较早会话摘要" in history[0]["content"]
