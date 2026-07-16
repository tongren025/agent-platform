"""统一知识入库服务：上传、索引、替换与删除共用同一套 fail-open 语义。

当前版本兼容现有员工级文件库；索引任务仍由应用进程执行。持久任务箱与 generation
切换属于下一阶段，目标约束见 docs/KNOWLEDGE_ARCHITECTURE.md。
"""
from __future__ import annotations

import asyncio
import logging
from typing import Protocol

from app.models.knowledge import KnowledgeDocument
from app.services.knowledge import KnowledgeStore

logger = logging.getLogger(__name__)


class KnowledgeIndexer(Protocol):
    """语义索引器所需的最小接口，便于 JSON 降级模式和测试注入。"""

    async def index_document(
        self, employee_key: str, doc_id: str, text: str
    ) -> int:
        """切片并索引正文，返回成功片段数。"""
        ...

    def remove_document(
        self, employee_key: str, doc_id: str, source_type: str = "knowledge"
    ) -> None:
        """删除文档对应的全部语义切片。"""
        ...


_background_tasks: set[asyncio.Task[None]] = set()


async def index_knowledge_document(
    store: KnowledgeStore,
    indexer: KnowledgeIndexer | None,
    employee_key: str,
    doc_id: str,
    content_bytes: bytes,
) -> int:
    """索引一篇知识文档并回写真实状态；语义不可用时保留关键词降级能力。"""
    if indexer is None:
        store.update_index_status(employee_key, doc_id, "degraded", 0)
        return 0

    try:
        text = content_bytes.decode("utf-8", errors="replace")
        stored = await indexer.index_document(employee_key, doc_id, text)
        status = "indexed" if stored > 0 else "degraded"
        store.update_index_status(employee_key, doc_id, status, stored)
        if stored:
            logger.info("知识文档已向量化: %s/%s (%d chunks)", employee_key, doc_id, stored)
        return stored
    except Exception:
        store.update_index_status(employee_key, doc_id, "degraded", 0)
        logger.warning(
            "知识文档向量化失败，已降级为关键词检索: %s/%s",
            employee_key,
            doc_id,
            exc_info=True,
        )
        return 0


def schedule_knowledge_index(
    store: KnowledgeStore,
    indexer: KnowledgeIndexer | None,
    employee_key: str,
    doc_id: str,
    content_bytes: bytes,
) -> None:
    """在当前事件循环调度索引，并持有任务引用直到结束。"""
    try:
        task = asyncio.create_task(
            index_knowledge_document(store, indexer, employee_key, doc_id, content_bytes)
        )
    except RuntimeError:
        store.update_index_status(employee_key, doc_id, "degraded", 0)
        logger.warning("当前没有事件循环，文档仅启用关键词检索: %s/%s", employee_key, doc_id)
        return
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


def store_knowledge_document(
    store: KnowledgeStore,
    employee_key: str,
    filename: str,
    content_bytes: bytes,
    *,
    source_type: str = "upload",
    authority: str = "reviewed",
) -> KnowledgeDocument:
    """统一写入文档正文与元数据；调用方再选择等待索引或后台调度。"""
    return store.upload(
        employee_key,
        filename,
        content_bytes,
        source_type=source_type,
        authority=authority,
    )


def delete_knowledge_document(
    store: KnowledgeStore,
    indexer: KnowledgeIndexer | None,
    employee_key: str,
    doc_id: str,
) -> bool:
    """删除正文与元数据，并尽力清理语义切片；不存在返回 False。"""
    deleted = store.delete_doc(employee_key, doc_id)
    if not deleted:
        return False
    if indexer is not None:
        try:
            indexer.remove_document(employee_key, doc_id)
        except Exception:
            logger.warning("清理文档向量失败: %s/%s", employee_key, doc_id, exc_info=True)
    return True


async def replace_named_knowledge_document(
    store: KnowledgeStore,
    indexer: KnowledgeIndexer | None,
    employee_key: str,
    filename: str,
    content_bytes: bytes,
    *,
    source_type: str,
    authority: str = "unverified",
) -> KnowledgeDocument:
    """先写入并索引同名新文档，成功落盘后再统一删除旧文档及其向量。"""
    old_ids = [
        doc.doc_id for doc in store.list_docs(employee_key) if doc.file_name == filename
    ]
    doc = store_knowledge_document(
        store,
        employee_key,
        filename,
        content_bytes,
        source_type=source_type,
        authority=authority,
    )
    await index_knowledge_document(store, indexer, employee_key, doc.doc_id, content_bytes)
    for old_id in old_ids:
        delete_knowledge_document(store, indexer, employee_key, old_id)
    return next(
        (item for item in store.list_docs(employee_key) if item.doc_id == doc.doc_id),
        doc,
    )
