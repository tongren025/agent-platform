"""
长期记忆存储。

三种记忆各自独立存储在 data/memory/<employee_key>/ 下：
  - semantic.json   语义记忆（事实/偏好）
  - episodic.json   经验记忆（成功交互）
  - procedural.json 行为记忆（行为规则）

支持 LangMem 的核心操作：
  - 新增 / 更新 / 删除
  - 合并去重（相似内容合并而非重复添加）
  - 衰减（长期未访问的记忆降低 importance）
  - 检索（按相关性返回 top-k，目前用关键词匹配，后续可接向量）
"""
from __future__ import annotations

import json
import logging
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path

from app.config import BASE_DIR
from app.models.memory_types import (
    EpisodicMemory,
    ProceduralMemory,
    SemanticMemory,
)

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_MAX_SEMANTIC = 200
_MAX_EPISODIC = 100
_MAX_PROCEDURAL = 50


def _sanitize(key: str) -> str:
    if not key or _BAD_KEY_RE.search(key):
        raise ValueError(f"Invalid key: {key!r}")
    return key


def _atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def _gen_id() -> str:
    return "mem_" + secrets.token_hex(6)


def _now() -> datetime:
    return datetime.now(timezone.utc)


_CJK_RE = re.compile(r"[一-鿿]")
_WORD_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> set[str]:
    """中文按单字、英文按单词分 token。"""
    low = text.lower()
    tokens = set(_CJK_RE.findall(low))
    tokens.update(_WORD_RE.findall(low))
    return tokens


def _similarity(a: str, b: str) -> float:
    ta, tb = _tokenize(a), _tokenize(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


class LongTermMemoryStore:

    def __init__(self) -> None:
        self._root = BASE_DIR / "data" / "memory"
        self._root.mkdir(parents=True, exist_ok=True)

    def _emp_dir(self, emp_key: str) -> Path:
        d = self._root / _sanitize(emp_key)
        d.mkdir(parents=True, exist_ok=True)
        return d

    # ── 语义记忆 ──────────────────────────────────────────

    def _semantic_path(self, emp_key: str) -> Path:
        return self._emp_dir(emp_key) / "semantic.json"

    def list_semantic(self, emp_key: str) -> list[SemanticMemory]:
        fp = self._semantic_path(emp_key)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [SemanticMemory.model_validate(d) for d in raw]
        except Exception:
            logger.warning("语义记忆加载失败: %s", fp, exc_info=True)
            return []

    def _save_semantic(self, emp_key: str, items: list[SemanticMemory]) -> None:
        items.sort(key=lambda m: m.importance, reverse=True)
        if len(items) > _MAX_SEMANTIC:
            items = items[:_MAX_SEMANTIC]
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(self._semantic_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))

    def add_semantic(self, emp_key: str, memory: SemanticMemory) -> SemanticMemory:
        items = self.list_semantic(emp_key)
        # 合并：如果已有高相似度的记忆，更新而非新增
        for existing in items:
            if _similarity(existing.content, memory.content) > 0.6:
                existing.content = memory.content
                existing.importance = max(existing.importance, memory.importance)
                existing.updated_at = _now()
                existing.access_count += 1
                self._save_semantic(emp_key, items)
                return existing
        if not memory.memory_id:
            memory.memory_id = _gen_id()
        items.append(memory)
        self._save_semantic(emp_key, items)
        return memory

    def delete_semantic(self, emp_key: str, memory_id: str) -> bool:
        items = self.list_semantic(emp_key)
        filtered = [m for m in items if m.memory_id != memory_id]
        if len(filtered) == len(items):
            return False
        self._save_semantic(emp_key, filtered)
        return True

    def retrieve_semantic(self, emp_key: str, query: str, top_k: int = 10) -> list[SemanticMemory]:
        items = self.list_semantic(emp_key)
        if not query.strip():
            return items[:top_k]
        scored = []
        for m in items:
            sim = _similarity(query, m.content)
            score = sim * 0.6 + m.importance * 0.3 + min(m.access_count, 10) / 10 * 0.1
            if score > 0.05:
                scored.append((score, m))
        scored.sort(key=lambda x: x[0], reverse=True)
        now = _now()
        result = []
        for _, m in scored[:top_k]:
            m.last_accessed = now
            m.access_count += 1
            result.append(m)
        if result:
            self._save_semantic(emp_key, items)
        return result

    # ── 经验记忆 ──────────────────────────────────────────

    def _episodic_path(self, emp_key: str) -> Path:
        return self._emp_dir(emp_key) / "episodic.json"

    def list_episodic(self, emp_key: str) -> list[EpisodicMemory]:
        fp = self._episodic_path(emp_key)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [EpisodicMemory.model_validate(d) for d in raw]
        except Exception:
            logger.warning("经验记忆加载失败: %s", fp, exc_info=True)
            return []

    def _save_episodic(self, emp_key: str, items: list[EpisodicMemory]) -> None:
        items.sort(key=lambda m: m.success_score, reverse=True)
        if len(items) > _MAX_EPISODIC:
            items = items[:_MAX_EPISODIC]
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(self._episodic_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))

    def add_episodic(self, emp_key: str, memory: EpisodicMemory) -> EpisodicMemory:
        items = self.list_episodic(emp_key)
        if not memory.memory_id:
            memory.memory_id = _gen_id()
        items.append(memory)
        self._save_episodic(emp_key, items)
        return memory

    def delete_episodic(self, emp_key: str, memory_id: str) -> bool:
        items = self.list_episodic(emp_key)
        filtered = [m for m in items if m.memory_id != memory_id]
        if len(filtered) == len(items):
            return False
        self._save_episodic(emp_key, filtered)
        return True

    def retrieve_episodic(self, emp_key: str, query: str, top_k: int = 5) -> list[EpisodicMemory]:
        items = self.list_episodic(emp_key)
        if not query.strip():
            return items[:top_k]
        scored = []
        for m in items:
            text = f"{m.observation} {m.action} {m.result}"
            sim = _similarity(query, text)
            score = sim * 0.5 + m.success_score * 0.4 + min(m.access_count, 10) / 10 * 0.1
            if score > 0.05:
                scored.append((score, m))
        scored.sort(key=lambda x: x[0], reverse=True)
        now = _now()
        result = []
        for _, m in scored[:top_k]:
            m.last_accessed = now
            m.access_count += 1
            result.append(m)
        if result:
            self._save_episodic(emp_key, items)
        return result

    # ── 行为记忆 ──────────────────────────────────────────

    def _procedural_path(self, emp_key: str) -> Path:
        return self._emp_dir(emp_key) / "procedural.json"

    def list_procedural(self, emp_key: str) -> list[ProceduralMemory]:
        fp = self._procedural_path(emp_key)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [ProceduralMemory.model_validate(d) for d in raw]
        except Exception:
            logger.warning("行为记忆加载失败: %s", fp, exc_info=True)
            return []

    def _save_procedural(self, emp_key: str, items: list[ProceduralMemory]) -> None:
        items.sort(key=lambda m: (m.confidence, m.activation_count), reverse=True)
        if len(items) > _MAX_PROCEDURAL:
            items = items[:_MAX_PROCEDURAL]
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(self._procedural_path(emp_key), json.dumps(data, ensure_ascii=False, indent=2))

    def add_procedural(self, emp_key: str, memory: ProceduralMemory) -> ProceduralMemory:
        items = self.list_procedural(emp_key)
        for existing in items:
            if _similarity(existing.rule, memory.rule) > 0.5:
                existing.confidence = min(1.0, existing.confidence + 0.1)
                existing.activation_count += 1
                existing.updated_at = _now()
                if memory.rationale:
                    existing.rationale = memory.rationale
                self._save_procedural(emp_key, items)
                return existing
        if not memory.memory_id:
            memory.memory_id = _gen_id()
        items.append(memory)
        self._save_procedural(emp_key, items)
        return memory

    def delete_procedural(self, emp_key: str, memory_id: str) -> bool:
        items = self.list_procedural(emp_key)
        filtered = [m for m in items if m.memory_id != memory_id]
        if len(filtered) == len(items):
            return False
        self._save_procedural(emp_key, filtered)
        return True

    def get_all_for_prompt(self, emp_key: str) -> dict:
        return {
            "semantic": self.list_semantic(emp_key),
            "episodic": self.list_episodic(emp_key),
            "procedural": self.list_procedural(emp_key),
        }

    def get_stats(self, emp_key: str) -> dict:
        return {
            "semantic_count": len(self.list_semantic(emp_key)),
            "episodic_count": len(self.list_episodic(emp_key)),
            "procedural_count": len(self.list_procedural(emp_key)),
        }
