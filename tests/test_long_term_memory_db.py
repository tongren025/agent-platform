"""长期记忆 PG 后端回归 —— 用 SQLite 内存库把 LongTermMemoryStore 跑在 PgMemoryBackend 上。

关键验证：把 load/save 抽成后端原语后，合并/列表/删除/检索/统计 这些业务逻辑在 PG 后端上
行为不变（零漂移）。同一套 LongTermMemoryStore 生产接 PostgreSQL。
"""
from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.db.base import Base
import app.models.db.memory  # noqa: F401  注册 LongTermMemoryORM
from app.models.memory_types import EpisodicMemory, ProceduralMemory, SemanticMemory
from app.services.long_term_memory import LongTermMemoryStore
from app.services.long_term_memory_db import PgMemoryBackend


@pytest.fixture
def store():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    sf = sessionmaker(bind=engine, expire_on_commit=False)
    return LongTermMemoryStore(backend=PgMemoryBackend(session_factory=sf))


def test_add_and_list_semantic(store):
    m = store.add_semantic("alice", SemanticMemory(content="喜欢电影感画面", category="preference", importance=0.8))
    items = store.list_semantic("alice")
    assert len(items) == 1
    assert items[0].content == "喜欢电影感画面"
    assert m.memory_id  # 自动生成 id


def test_semantic_merges_similar(store):
    store.add_semantic("alice", SemanticMemory(content="喜欢电影感的视觉风格", importance=0.5))
    store.add_semantic("alice", SemanticMemory(content="喜欢电影感的视觉风格", importance=0.9))
    items = store.list_semantic("alice")
    assert len(items) == 1          # 高相似度合并而非新增
    assert items[0].importance == 0.9   # 取较大 importance


def test_delete_semantic(store):
    m = store.add_semantic("alice", SemanticMemory(content="一条事实"))
    assert store.delete_semantic("alice", m.memory_id) is True
    assert store.list_semantic("alice") == []
    assert store.delete_semantic("alice", m.memory_id) is False


def test_episodic_procedural_and_stats(store):
    store.add_episodic("alice", EpisodicMemory(
        observation="用户要竖屏", action="给 9:16", result="满意", success_score=0.9))
    store.add_procedural("alice", ProceduralMemory(rule="优先中文提示词", confidence=0.6))
    assert store.get_stats("alice") == {
        "semantic_count": 0, "episodic_count": 1, "procedural_count": 1,
    }


def test_retrieve_hits_relevant(store):
    store.add_semantic("alice", SemanticMemory(content="喜欢赛博朋克霓虹", importance=0.7))
    hits = store.retrieve_semantic("alice", "赛博朋克", top_k=5)
    assert any("赛博朋克" in h.content for h in hits)


def test_isolation_between_employees(store):
    store.add_semantic("alice", SemanticMemory(content="A的记忆"))
    store.add_semantic("bob", SemanticMemory(content="B的记忆"))
    assert len(store.list_semantic("alice")) == 1
    assert len(store.list_semantic("bob")) == 1
    assert store.list_semantic("alice")[0].content == "A的记忆"
