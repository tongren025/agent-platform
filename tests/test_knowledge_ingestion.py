"""统一知识入库服务回归：状态回写、同名替换和旧向量清理。"""
from __future__ import annotations

import pytest

from app.models.knowledge import KnowledgeDocument
from app.services.knowledge import KnowledgeStore
from app.services.knowledge_ingestion import (
    index_knowledge_document,
    replace_named_knowledge_document,
    store_knowledge_document,
)


class _Indexer:
    def __init__(self) -> None:
        self.indexed: list[tuple[str, str, str]] = []
        self.removed: list[tuple[str, str]] = []

    async def index_document(self, employee_key: str, doc_id: str, text: str) -> int:
        self.indexed.append((employee_key, doc_id, text))
        return 2

    def remove_document(
        self, employee_key: str, doc_id: str, source_type: str = "knowledge"
    ) -> None:
        self.removed.append((employee_key, doc_id))


def test_legacy_document_defaults_to_visible_keyword_degraded_state():
    doc = KnowledgeDocument.model_validate({
        "docId": "legacy",
        "fileName": "legacy.md",
        "extension": ".md",
        "sizeBytes": 10,
    })

    assert doc.index_status == "degraded"
    assert doc.chunk_count == 0


@pytest.mark.asyncio
async def test_index_status_is_visible(tmp_path):
    store = KnowledgeStore(root_dir=str(tmp_path / "knowledge"))
    content = "统一知识入口".encode()
    doc = store_knowledge_document(store, "test-index", "guide.md", content)

    assert doc.index_status == "pending"
    await index_knowledge_document(store, _Indexer(), "test-index", doc.doc_id, content)

    saved = store.list_docs("test-index")[0]
    assert saved.index_status == "indexed"
    assert saved.chunk_count == 2
    assert saved.content_hash
    assert saved.space_key == "test-index"


@pytest.mark.asyncio
async def test_missing_semantic_indexer_marks_keyword_degraded(tmp_path):
    store = KnowledgeStore(root_dir=str(tmp_path / "knowledge"))
    doc = store_knowledge_document(store, "test-degraded", "guide.md", b"keyword only")

    await index_knowledge_document(store, None, "test-degraded", doc.doc_id, b"keyword only")

    saved = store.list_docs("test-degraded")[0]
    assert saved.index_status == "degraded"
    assert saved.chunk_count == 0


@pytest.mark.asyncio
async def test_replace_named_document_removes_old_file_and_vectors(tmp_path):
    store = KnowledgeStore(root_dir=str(tmp_path / "knowledge"))
    indexer = _Indexer()
    old = store_knowledge_document(
        store, "test-replace", "auto-source.md", b"old", source_type="scrape"
    )

    new = await replace_named_knowledge_document(
        store,
        indexer,
        "test-replace",
        "auto-source.md",
        b"new",
        source_type="scrape",
    )

    docs = store.list_docs("test-replace")
    assert [doc.doc_id for doc in docs] == [new.doc_id]
    assert indexer.removed == [("test-replace", old.doc_id)]
    assert store.read_text("test-replace", new.doc_id) == "new"
