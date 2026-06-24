from __future__ import annotations

import json
import logging
import re
import secrets
from pathlib import Path

from app.config import BASE_DIR, settings
from app.models.knowledge import KnowledgeDocument, KnowledgeSnippet

logger = logging.getLogger(__name__)

_TOKEN_RE = re.compile(r"[a-z0-9一-鿿]+", re.UNICODE)


class KnowledgeStore:

    def __init__(self, root_dir: str | None = None) -> None:
        cfg = settings.agent
        self._root = BASE_DIR / (root_dir or cfg.knowledge_dir)
        self._root.mkdir(parents=True, exist_ok=True)
        self._max_file_bytes = cfg.knowledge_max_file_size_mb * 1024 * 1024
        self._max_total_bytes = cfg.knowledge_max_total_size_per_employee_mb * 1024 * 1024
        self._allowed_exts = set(cfg.knowledge_supported_extensions)

    def _emp_dir(self, employee_key: str) -> Path:
        return self._root / employee_key

    def _index_path(self, employee_key: str) -> Path:
        return self._emp_dir(employee_key) / "index.json"

    def _load_index(self, employee_key: str) -> list[KnowledgeDocument]:
        ip = self._index_path(employee_key)
        if not ip.exists():
            return []
        try:
            raw = json.loads(ip.read_text(encoding="utf-8"))
            return [KnowledgeDocument.model_validate(d) for d in raw]
        except Exception:
            logger.warning("Corrupt knowledge index for %s", employee_key, exc_info=True)
            return []

    def _save_index(
        self, employee_key: str, docs: list[KnowledgeDocument]
    ) -> None:
        ip = self._index_path(employee_key)
        ip.parent.mkdir(parents=True, exist_ok=True)
        data = [d.model_dump(by_alias=True, mode="json") for d in docs]
        ip.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def _total_size(self, employee_key: str) -> int:
        emp_dir = self._emp_dir(employee_key)
        if not emp_dir.exists():
            return 0
        total = 0
        for fp in emp_dir.iterdir():
            if fp.name != "index.json" and fp.is_file():
                total += fp.stat().st_size
        return total

    def _set_employee_knowledge_flag(self, employee_key: str, value: bool) -> None:
        try:
            from app.dependencies import employee_registry

            emp = employee_registry.get(employee_key)
            if emp is not None and emp.has_knowledge_base != value:
                emp.has_knowledge_base = value
                employee_registry.save(emp)
        except Exception:
            logger.warning(
                "Could not update hasKnowledgeBase for %s", employee_key, exc_info=True
            )

    def list_docs(self, employee_key: str) -> list[KnowledgeDocument]:
        return self._load_index(employee_key)

    def upload(
        self,
        employee_key: str,
        filename: str,
        content_bytes: bytes,
    ) -> KnowledgeDocument:
        ext = Path(filename).suffix.lower()
        if ext not in self._allowed_exts:
            raise ValueError(
                f"Unsupported extension {ext!r}. Allowed: {sorted(self._allowed_exts)}"
            )

        if len(content_bytes) > self._max_file_bytes:
            raise ValueError(
                f"File size {len(content_bytes)} exceeds limit "
                f"({self._max_file_bytes} bytes)"
            )

        current_total = self._total_size(employee_key)
        if current_total + len(content_bytes) > self._max_total_bytes:
            raise ValueError(
                f"Total storage for employee {employee_key!r} would exceed "
                f"{self._max_total_bytes} bytes"
            )

        doc_id = secrets.token_hex(8)
        doc = KnowledgeDocument(
            doc_id=doc_id,
            file_name=filename,
            extension=ext,
            size_bytes=len(content_bytes),
        )

        emp_dir = self._emp_dir(employee_key)
        emp_dir.mkdir(parents=True, exist_ok=True)
        doc_path = emp_dir / f"{doc_id}{ext}"
        doc_path.write_bytes(content_bytes)

        docs = self._load_index(employee_key)
        docs.append(doc)
        self._save_index(employee_key, docs)

        if len(docs) == 1:
            self._set_employee_knowledge_flag(employee_key, True)

        return doc

    def delete_doc(self, employee_key: str, doc_id: str) -> bool:
        docs = self._load_index(employee_key)
        target = None
        remaining: list[KnowledgeDocument] = []
        for d in docs:
            if d.doc_id == doc_id:
                target = d
            else:
                remaining.append(d)

        if target is None:
            return False

        doc_path = self._emp_dir(employee_key) / f"{doc_id}{target.extension}"
        if doc_path.exists():
            doc_path.unlink()

        self._save_index(employee_key, remaining)

        if not remaining:
            self._set_employee_knowledge_flag(employee_key, False)

        return True

    def read_text(self, employee_key: str, doc_id: str) -> str | None:
        docs = self._load_index(employee_key)
        target = next((d for d in docs if d.doc_id == doc_id), None)
        if target is None:
            return None

        doc_path = self._emp_dir(employee_key) / f"{doc_id}{target.extension}"
        if not doc_path.exists():
            return None

        return doc_path.read_text(encoding="utf-8")


def _tokenize(text: str) -> set[str]:
    return set(_TOKEN_RE.findall(text.lower()))


class KeywordRetriever:

    _MAX_DOC_BYTES = 1 * 1024 * 1024
    _EXCERPT_RADIUS = 100
    _SUBSTRING_BONUS = 0.3

    def __init__(self, store: KnowledgeStore) -> None:
        self._store = store

    def search(
        self,
        employee_key: str,
        query: str,
        top_k: int = 5,
    ) -> list[KnowledgeSnippet]:
        if not query.strip():
            return []

        query_tokens = _tokenize(query)
        if not query_tokens:
            return []

        query_lower = query.lower()
        docs = self._store.list_docs(employee_key)
        scored: list[tuple[float, KnowledgeDocument, str]] = []

        for doc in docs:
            if doc.size_bytes > self._MAX_DOC_BYTES:
                continue

            text = self._store.read_text(employee_key, doc.doc_id)
            if text is None:
                continue

            doc_tokens = _tokenize(text)
            if not doc_tokens:
                continue

            intersection = query_tokens & doc_tokens
            union = query_tokens | doc_tokens
            score = len(intersection) / len(union) if union else 0.0

            text_lower = text.lower()
            if query_lower in text_lower:
                score += self._SUBSTRING_BONUS

            if score <= 0:
                continue

            excerpt = self._extract_excerpt(text, text_lower, query_lower)
            scored.append((score, doc, excerpt))

        scored.sort(key=lambda t: t[0], reverse=True)

        return [
            KnowledgeSnippet(
                doc_id=doc.doc_id,
                file_name=doc.file_name,
                excerpt=excerpt,
                score=round(score, 4),
            )
            for score, doc, excerpt in scored[:top_k]
        ]

    def _extract_excerpt(
        self, text: str, text_lower: str, query_lower: str
    ) -> str:
        pos = text_lower.find(query_lower)
        if pos == -1:
            return text[: self._EXCERPT_RADIUS * 2].strip()

        start = max(0, pos - self._EXCERPT_RADIUS)
        end = min(len(text), pos + len(query_lower) + self._EXCERPT_RADIUS)
        excerpt = text[start:end].strip()

        if start > 0:
            excerpt = "..." + excerpt
        if end < len(text):
            excerpt = excerpt + "..."

        return excerpt
