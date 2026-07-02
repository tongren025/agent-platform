"""AgentRunDbStore 回归 —— 用 SQLite 内存库验证 ORM + 仓储，无需真实 PG。

这是 M1 第一个真实迁移切片的证据：运行记录能落 SQL 库、按条件查、同 run_id 幂等 upsert、
traces 结构完整往返。同一套 ORM 生产环境跑在 PostgreSQL 上。
"""
from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.db.base import Base
import app.models.db.run  # noqa: F401  注册 AgentRunORM 到 metadata
from app.models.conversation import AgentInvocationTrace
from app.models.run_record import AgentRunRecord
from app.services.run_store_db import AgentRunDbStore


@pytest.fixture
def store():
    # StaticPool + 单连接，让内存库在多个 session 间保持同一份数据
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    sf = sessionmaker(bind=engine, expire_on_commit=False)
    return AgentRunDbStore(session_factory=sf)


def test_save_load_roundtrip(store):
    rec = AgentRunRecord(
        session_id="ses_1", employee_key="alice", model="gpt-4o",
        prompt_tokens=100, completion_tokens=50, total_tokens=150,
    )
    store.save_run(rec)

    loaded = store.load_run(rec.run_id)
    assert loaded is not None
    assert loaded.employee_key == "alice"
    assert loaded.total_tokens == 150


def test_save_is_idempotent_upsert(store):
    store.save_run(AgentRunRecord(run_id="run_fixed", employee_key="alice", success=True))
    store.save_run(AgentRunRecord(run_id="run_fixed", employee_key="alice", success=False))

    loaded = store.load_run("run_fixed")
    assert loaded.success is False          # 后写覆盖
    assert len(store.list_runs()) == 1      # 同 run_id 不重复插


def test_list_filters(store):
    store.save_run(AgentRunRecord(employee_key="alice", success=True))
    store.save_run(AgentRunRecord(employee_key="alice", success=False))
    store.save_run(AgentRunRecord(employee_key="bob", success=True))

    assert len(store.list_runs(employee_key="alice")) == 2
    assert len(store.list_runs(employee_key="alice", success=False)) == 1
    assert len(store.list_runs(success=True)) == 2


def test_load_missing_returns_none(store):
    assert store.load_run("run_nope") is None


def test_traces_survive_roundtrip(store):
    rec = AgentRunRecord(employee_key="alice", traces=[
        AgentInvocationTrace(iteration=1, tool_name="search", success=True, elapsed_milliseconds=42),
    ])
    store.save_run(rec)

    loaded = store.load_run(rec.run_id)
    assert len(loaded.traces) == 1
    assert loaded.traces[0].tool_name == "search"
    assert loaded.traces[0].elapsed_milliseconds == 42
