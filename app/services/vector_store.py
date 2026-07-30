"""M3 向量存储与语义检索 —— pgvector 存取 + DashScope embedding。

两个入口：
1. VectorStore：底层 CRUD，知识库文档 / 长期记忆向量化后存这里。
2. SemanticRetriever：高层检索，query → embedding → 余弦相似搜索 → 返回 top-k 片段。

非 PG 环境（use_db_stores=False）退化为空操作——关键词检索仍然可用。
"""
from __future__ import annotations

import asyncio
import logging
from typing import Sequence

from app.core.embedding import embed_single, embed_texts
from app.models.knowledge import KnowledgeSnippet

logger = logging.getLogger(__name__)


class VectorStore:
    """pgvector 向量 CRUD。"""

    def __init__(self) -> None:
        """尝试拿到 DB session 工厂；DB 不可用则标记 available=False，后续所有操作空转。"""
        self._available = False
        try:
            from app.core.db import SessionLocal
            self._session_factory = SessionLocal
            self._available = True
        except Exception:
            logger.debug("VectorStore: DB 不可用，退化为空操作")

    @property
    def available(self) -> bool:
        """向量存储是否可用（PG/pgvector 是否就绪）。"""
        return self._available

    def upsert(
        self,
        employee_key: str,
        source_type: str,
        source_id: str,
        content: str,
        embedding: list[float],
    ) -> None:
        """按 (员工, 来源类型, 来源 id) 插入或更新一条向量；DB 不可用时空操作，失败只告警。"""
        if not self._available:
            return
        from app.models.db.embedding import EmbeddingORM
        session = self._session_factory()
        try:
            existing = (
                session.query(EmbeddingORM)
                .filter_by(employee_key=employee_key, source_type=source_type, source_id=source_id)
                .first()
            )
            if existing:
                existing.content = content
                existing.embedding = embedding
            else:
                session.add(EmbeddingORM(
                    employee_key=employee_key,
                    source_type=source_type,
                    source_id=source_id,
                    content=content,
                    embedding=embedding,
                ))
            session.commit()
        except Exception:
            session.rollback()
            logger.warning("向量 upsert 失败", exc_info=True)
        finally:
            session.close()

    def delete(self, employee_key: str, source_type: str, source_id: str) -> None:
        """删除指定 (员工, 来源类型, 来源 id) 的向量；DB 不可用时空操作。"""
        if not self._available:
            return
        from app.models.db.embedding import EmbeddingORM
        session = self._session_factory()
        try:
            session.query(EmbeddingORM).filter_by(
                employee_key=employee_key, source_type=source_type, source_id=source_id,
            ).delete()
            session.commit()
        except Exception:
            session.rollback()
            logger.warning("向量删除失败", exc_info=True)
        finally:
            session.close()

    def search_similar(
        self,
        employee_key: str,
        query_embedding: list[float],
        source_type: str | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        """余弦相似搜索。返回 [{source_id, content, score}, ...]。"""
        if not self._available:
            return []
        from app.models.db.embedding import EmbeddingORM
        session = self._session_factory()
        try:
            q = session.query(EmbeddingORM).filter_by(employee_key=employee_key)
            if source_type:
                q = q.filter_by(source_type=source_type)
            q = q.filter(EmbeddingORM.embedding.isnot(None))

            try:
                q = q.order_by(EmbeddingORM.embedding.cosine_distance(query_embedding))
            except Exception:
                return []

            rows = q.limit(top_k).all()
            results = []
            for row in rows:
                results.append({
                    "source_id": row.source_id,
                    "source_type": row.source_type,
                    "content": row.content,
                })
            return results
        except Exception:
            logger.warning("向量搜索失败", exc_info=True)
            return []
        finally:
            session.close()


class SemanticRetriever:
    """语义检索器 —— 替代/补充 KeywordRetriever。"""

    def __init__(self, vector_store: VectorStore, knowledge_store=None) -> None:
        """注入底层向量存储与（可选）知识库存储。"""
        self._vs = vector_store
        self._ks = knowledge_store

    async def search(
        self,
        employee_key: str,
        query: str,
        top_k: int = 5,
        source_type: str | None = None,
    ) -> list[KnowledgeSnippet]:
        """语义检索：query 向量化 → 余弦相似 top-k → 转成 KnowledgeSnippet；不可用或向量化失败返回空。"""
        if not self._vs.available:
            return []

        query_vec = await embed_single(query)
        if not query_vec:
            return []

        results = self._vs.search_similar(
            employee_key=employee_key,
            query_embedding=query_vec,
            source_type=source_type,
            top_k=top_k,
        )

        return [
            KnowledgeSnippet(
                doc_id=r["source_id"],
                file_name=r.get("source_type", ""),
                excerpt=r["content"][:500],
                score=1.0 - i * 0.05,
            )
            for i, r in enumerate(results)
        ]

    async def index_document(
        self,
        employee_key: str,
        doc_id: str,
        content: str,
        source_type: str = "knowledge",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ) -> int:
        """把文档切片并向量化存入。返回成功存入的 chunk 数。"""
        chunks = _split_text(content, chunk_size, chunk_overlap)
        if not chunks:
            return 0

        vectors = await embed_texts(chunks)
        if not vectors or len(vectors) != len(chunks):
            return 0

        stored = 0
        for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
            chunk_id = f"{doc_id}_chunk_{i}"
            self._vs.upsert(employee_key, source_type, chunk_id, chunk, vec)
            stored += 1
        return stored

    def remove_document(self, employee_key: str, doc_id: str, source_type: str = "knowledge") -> None:
        """删除某文档的全部切片向量（按 doc_id 前缀匹配 source_id）。"""
        if not self._vs.available:
            return
        from app.models.db.embedding import EmbeddingORM
        session = self._vs._session_factory()
        try:
            session.query(EmbeddingORM).filter(
                EmbeddingORM.employee_key == employee_key,
                EmbeddingORM.source_type == source_type,
                EmbeddingORM.source_id.like(f"{doc_id}%"),
            ).delete(synchronize_session=False)
            session.commit()
        except Exception:
            session.rollback()
            logger.warning("删除文档向量失败", exc_info=True)
        finally:
            session.close()


async def retrieve_knowledge(
    employee_key: str,
    query: str,
    top_k: int = 5,
) -> list[KnowledgeSnippet]:
    """模块级检索入口：向量语义优先，不可用或无结果时兜底关键词检索。

    agent 运行前的 RAG 预检索（invocation）与知识搜索 API（registry）共用。
    fail-open：任何一路失败都不抛出，最坏返回空列表，绝不阻断 agent 运行。
    """
    from app.dependencies import knowledge_retriever, semantic_retriever

    snippets: list[KnowledgeSnippet] = []
    if semantic_retriever is not None:
        try:
            # RAG 是回答增强而不是主链路硬依赖。远程 embedding 超过预算时立即
            # 回退本地关键词检索，避免用户在模型真正开始前先无反馈等待几十秒。
            snippets = await asyncio.wait_for(
                semantic_retriever.search(employee_key, query, top_k=top_k),
                timeout=2.5,
            )
        except asyncio.TimeoutError:
            logger.info("语义检索超过 2.5s，回退关键词 employee=%s", employee_key)
        except Exception:
            logger.warning("语义检索失败，回退关键词", exc_info=True)
    if not snippets:
        try:
            snippets = knowledge_retriever.search(employee_key, query, top_k=top_k)
        except Exception:
            logger.warning("关键词检索失败", exc_info=True)
            snippets = []
    return snippets


def _split_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """简单按字符数切片，段落边界优先。"""
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            nl = text.rfind("\n", start, end)
            if nl > start + chunk_size // 2:
                end = nl + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < len(text) else end
    return chunks
