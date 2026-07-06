"""M3 向量检索回归 —— embedding 模块 + 文本切片 + 检索器逻辑。

真实 pgvector 和 DashScope 需要环境支持，单测验证：
1. 模块可导入、接口签名正确
2. 文本切片逻辑
3. SemanticRetriever 在 VectorStore 不可用时退化为空结果
4. Embedding 模块在无 API key 时 fail-open
"""
from __future__ import annotations

import importlib
import pytest


def test_embedding_module_importable():
    mod = importlib.import_module("app.core.embedding")
    assert callable(mod.embed_texts)
    assert callable(mod.embed_single)
    assert mod.DIMENSION == 1024


def test_vector_store_importable():
    mod = importlib.import_module("app.services.vector_store")
    assert callable(mod.VectorStore)
    assert callable(mod.SemanticRetriever)


def test_text_splitting():
    from app.services.vector_store import _split_text
    text = "a" * 1200
    chunks = _split_text(text, chunk_size=500, overlap=50)
    assert len(chunks) >= 2
    for chunk in chunks:
        assert len(chunk) <= 500


def test_text_splitting_short():
    from app.services.vector_store import _split_text
    chunks = _split_text("hello world", chunk_size=500, overlap=50)
    assert chunks == ["hello world"]


def test_text_splitting_empty():
    from app.services.vector_store import _split_text
    chunks = _split_text("", chunk_size=500, overlap=50)
    assert chunks == []


@pytest.mark.asyncio
async def test_embed_texts_no_key_returns_empty(monkeypatch):
    from app.core import embedding
    from app.core.settings import settings
    monkeypatch.setattr(settings, "dashscope_api_key", "")
    result = await embedding.embed_texts(["test"])
    assert result == []


@pytest.mark.asyncio
async def test_semantic_retriever_unavailable():
    from app.services.vector_store import VectorStore, SemanticRetriever
    vs = VectorStore.__new__(VectorStore)
    vs._available = False
    sr = SemanticRetriever(vs)
    results = await sr.search("emp1", "query")
    assert results == []


def test_embedding_orm_importable():
    from app.models.db.embedding import EmbeddingORM
    assert EmbeddingORM.__tablename__ == "embeddings"


def test_search_knowledge_api_exists(app_client):
    resp = app_client.get("/api/v1/agentapp/registry/employees/test_emp/knowledge/search?q=hello")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert isinstance(body["data"], list)


# ── M3 接线回归：上传 → 向量化调度、删除 → 清向量 ─────────────────


class _FakeRetriever:
    """记录调用的假语义检索器。"""
    def __init__(self):
        self.indexed = []
        self.removed = []

    async def index_document(self, key, doc_id, text, **kw):
        self.indexed.append((key, doc_id, text))
        return 1

    def remove_document(self, key, doc_id, source_type="knowledge"):
        self.removed.append((key, doc_id))


@pytest.mark.asyncio
async def test_vectorize_doc_calls_retriever(monkeypatch):
    import app.api.registry as reg
    fake = _FakeRetriever()
    monkeypatch.setattr(reg, "semantic_retriever", fake)
    await reg._vectorize_doc("emp1", "doc1", "你好世界".encode("utf-8"))
    assert fake.indexed == [("emp1", "doc1", "你好世界")]


@pytest.mark.asyncio
async def test_vectorize_doc_noop_when_disabled(monkeypatch):
    import app.api.registry as reg
    monkeypatch.setattr(reg, "semantic_retriever", None)
    await reg._vectorize_doc("emp1", "doc1", b"hello")  # 不应抛异常


def test_drop_doc_vectors_calls_retriever(monkeypatch):
    import app.api.registry as reg
    fake = _FakeRetriever()
    monkeypatch.setattr(reg, "semantic_retriever", fake)
    reg._drop_doc_vectors("emp1", "doc1")
    assert fake.removed == [("emp1", "doc1")]


def test_drop_doc_vectors_failure_is_swallowed(monkeypatch):
    import app.api.registry as reg

    class _Boom:
        def remove_document(self, *a, **k):
            raise RuntimeError("db down")

    monkeypatch.setattr(reg, "semantic_retriever", _Boom())
    reg._drop_doc_vectors("emp1", "doc1")  # fail-open，不抛
