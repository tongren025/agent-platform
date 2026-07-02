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
