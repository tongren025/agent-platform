"""JSON→PG 导入脚本回归 —— SQLite 目标 + 临时 JSON 源，验证读→写映射，无需真实 PG。"""
from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.db.base import Base
import app.models.db.run      # noqa: F401
import app.models.db.session  # noqa: F401
import app.models.db.memory   # noqa: F401
from app.models.conversation import ConversationSession
from app.models.memory_types import SemanticMemory
from app.models.run_record import AgentRunRecord
from app.services.run_store import AgentRunStore
from app.services.run_store_db import AgentRunDbStore
from app.services.memory import ConversationMemoryStore
from app.services.memory_db import ConversationMemoryDbStore
from app.services.long_term_memory import JsonMemoryBackend
from app.services.long_term_memory_db import PgMemoryBackend
from scripts.migrate_json_to_pg import migrate_memory, migrate_runs, migrate_sessions


@pytest.fixture
def sf():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)


def test_migrate_runs(tmp_path, sf):
    src = AgentRunStore(run_dir=str(tmp_path))
    src.save_run(AgentRunRecord(employee_key="alice", total_tokens=10))
    src.save_run(AgentRunRecord(employee_key="bob", total_tokens=20))

    dst = AgentRunDbStore(session_factory=sf)
    n = migrate_runs(src, dst)

    assert n == 2
    assert len(dst.list_runs()) == 2


def test_migrate_sessions_includes_archived(tmp_path, sf):
    src = ConversationMemoryStore(session_dir=str(tmp_path))
    src.save_session(ConversationSession(session_id="s1", employee_key="alice"))
    src.save_session(ConversationSession(session_id="s2", employee_key="alice", archived=True))

    dst = ConversationMemoryDbStore(session_factory=sf)
    n = migrate_sessions(src, dst)

    assert n == 2  # 归档的也搬
    assert dst.load_session("s2") is not None


def test_migrate_memory(tmp_path, sf):
    json_backend = JsonMemoryBackend(root=tmp_path)
    json_backend.save("alice", "semantic", [
        SemanticMemory(content="喜欢电影感").model_dump(by_alias=True, mode="json"),
    ])

    pg_backend = PgMemoryBackend(session_factory=sf)
    n = migrate_memory(tmp_path, json_backend, pg_backend)

    assert n == 1
    rows = pg_backend.load("alice", "semantic")
    assert len(rows) == 1
    assert rows[0]["content"] == "喜欢电影感"


def test_migrate_memory_empty_root_is_noop(tmp_path, sf):
    empty = tmp_path / "does_not_exist"
    n = migrate_memory(empty, JsonMemoryBackend(root=tmp_path), PgMemoryBackend(session_factory=sf))
    assert n == 0
