"""ConversationMemoryDbStore 回归 —— SQLite 内存库验证 ORM + 仓储，无需真实 PG。

会话是最核心的"要查"运行态（工作台历史）。这里验证 round-trip（含 messages）、
按员工/归档/类型过滤、upsert 幂等、删除。同一套 ORM 生产跑 PostgreSQL。
"""
from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.db.base import Base
import app.models.db.session  # noqa: F401  注册 ConversationSessionORM
from app.models.conversation import ConversationMessage, ConversationSession
from app.services.memory_db import ConversationMemoryDbStore


@pytest.fixture
def store():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    sf = sessionmaker(bind=engine, expire_on_commit=False)
    return ConversationMemoryDbStore(session_factory=sf)


def _session(sid: str, emp: str = "alice", **kw) -> ConversationSession:
    return ConversationSession(session_id=sid, employee_key=emp, title=sid, **kw)


def test_save_load_roundtrip_with_messages(store):
    sess = _session("ses_1")
    sess.messages.append(ConversationMessage(role="user", content="画只猫"))
    sess.messages.append(ConversationMessage(role="assistant", content="好的"))
    store.save_session(sess)

    loaded = store.load_session("ses_1")
    assert loaded is not None
    assert loaded.employee_key == "alice"
    assert len(loaded.messages) == 2
    assert loaded.messages[0].content == "画只猫"


def test_save_is_idempotent_upsert(store):
    sess = _session("ses_fixed")
    store.save_session(sess)
    sess.messages.append(ConversationMessage(role="user", content="hi"))
    store.save_session(sess)

    assert len(store.list_sessions()) == 1          # 同 session_id 不重复
    assert len(store.load_session("ses_fixed").messages) == 1


def test_list_filters_employee_and_archived(store):
    store.save_session(_session("s1", "alice"))
    store.save_session(_session("s2", "alice", archived=True))
    store.save_session(_session("s3", "bob"))

    assert len(store.list_sessions(employee_key="alice")) == 1          # 默认不含归档
    assert len(store.list_sessions(employee_key="alice", include_archived=True)) == 2
    assert len(store.list_sessions()) == 2                              # 全部非归档


def test_list_filters_target_type_and_team(store):
    store.save_session(_session("t1", "alice", target_type="team", team_code="TEAM_A"))
    store.save_session(_session("t2", "alice", target_type="employee"))

    assert len(store.list_sessions(target_type="team")) == 1
    assert len(store.list_sessions(team_code="TEAM_A")) == 1


def test_delete(store):
    store.save_session(_session("ses_del"))
    assert store.delete_session("ses_del") is True
    assert store.load_session("ses_del") is None
    assert store.delete_session("ses_del") is False
