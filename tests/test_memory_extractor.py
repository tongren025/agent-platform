"""增量记忆回归：只处理新消息、失败不推进游标、重试范围稳定。"""
from __future__ import annotations

import pytest

from app.models.conversation import ConversationMessage, ConversationSession
from app.models.memory_types import EpisodicMemory
from app.services import memory_extractor
from app.services.long_term_memory import JsonMemoryBackend, LongTermMemoryStore
from app.services.session_messages import append_session_message, ensure_message_identity
from app.utils import utcnow


class _MemoryStore:
    def __init__(self, session: ConversationSession) -> None:
        self.session = session.model_copy(deep=True)

    def load_session(self, session_id: str):
        if session_id != self.session.session_id:
            return None
        return self.session.model_copy(deep=True)

    def save_session(self, session: ConversationSession) -> None:
        self.session = session.model_copy(deep=True)


def _session(session_id: str) -> ConversationSession:
    session = ConversationSession(session_id=session_id, employee_key="writer")
    session.messages = [
        ConversationMessage(role="user", content="以后都用中文，并且先给结论。"),
        ConversationMessage(role="assistant", content="明白，后续会先给结论并使用中文。"),
    ]
    ensure_message_identity(session)
    return session


def test_stable_memory_id_is_idempotent(tmp_path):
    store = LongTermMemoryStore(JsonMemoryBackend(tmp_path / "memory"))
    memory = EpisodicMemory(
        memory_id="mem_stable",
        employee_key="writer",
        observation="用户要求先给结论",
        action="先输出结论",
        result="用户确认有效",
        success_score=0.9,
    )

    store.add_episodic("writer", memory)
    store.add_episodic("writer", memory.model_copy(deep=True))

    assert len(store.list_episodic("writer")) == 1


@pytest.mark.asyncio
async def test_extract_session_delta_only_processes_new_messages(monkeypatch):
    store = _MemoryStore(_session("ses_delta_only"))
    calls = []

    async def fake_extract(messages, employee_key, session_id, *, idempotency_key=None):
        calls.append((messages, idempotency_key))

    monkeypatch.setattr("app.dependencies.memory_store", store)
    monkeypatch.setattr(memory_extractor, "extract_and_store", fake_extract)

    assert await memory_extractor.extract_session_delta("writer", "ses_delta_only") is True
    assert store.session.metadata["lastMemorySequence"] == 2

    append_session_message(
        store.session, role="user", content="这次也保持简洁。", timestamp=utcnow()
    )
    append_session_message(
        store.session, role="assistant", content="好的。", timestamp=utcnow()
    )
    assert await memory_extractor.extract_session_delta("writer", "ses_delta_only") is True

    assert [item["content"] for item in calls[1][0]] == ["这次也保持简洁。", "好的。"]
    assert calls[0][1] == "ses_delta_only:1:2:v1"
    assert calls[1][1] == "ses_delta_only:3:4:v1"


@pytest.mark.asyncio
async def test_failed_extraction_keeps_cursor_for_same_range_retry(monkeypatch):
    store = _MemoryStore(_session("ses_retry_range"))
    keys = []

    async def fail(messages, employee_key, session_id, *, idempotency_key=None):
        keys.append(idempotency_key)
        raise memory_extractor.MemoryExtractionRetryableError("temporary")

    monkeypatch.setattr("app.dependencies.memory_store", store)
    monkeypatch.setattr(memory_extractor, "extract_and_store", fail)

    assert await memory_extractor.extract_session_delta("writer", "ses_retry_range") is False
    assert "lastMemorySequence" not in store.session.metadata

    async def succeed(messages, employee_key, session_id, *, idempotency_key=None):
        keys.append(idempotency_key)

    monkeypatch.setattr(memory_extractor, "extract_and_store", succeed)
    assert await memory_extractor.extract_session_delta("writer", "ses_retry_range") is True
    assert keys == ["ses_retry_range:1:2:v1", "ses_retry_range:1:2:v1"]
