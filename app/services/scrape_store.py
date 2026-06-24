"""
采集相关的文件型持久化存储。

- ScrapeSourceStore     采集源    data/scrape-sources/<code>.json
- CollectedPromptStore  提示词库  data/collected-prompts/<source_code>.json（按收藏数排序，去重，封顶）
- ScrapeHistoryStore    运行历史  data/scrape-history/<source_code>.json（保留最近 N 条）
"""
from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from app.config import BASE_DIR
from app.models.scrape import CollectedPrompt, ScrapeRunResult, ScrapeSource

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_MAX_PROMPTS_PER_SOURCE = 600
_MAX_HISTORY = 50


def _sanitize(key: str) -> str:
    if not key or _BAD_KEY_RE.search(key):
        raise ValueError(f"Invalid key: {key!r}")
    return key


def _atomic_write(path: Path, text: str) -> None:
    """先写临时文件再 os.replace 原子替换，避免写入中途崩溃留下半截文件。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


class ScrapeSourceStore:
    def __init__(self) -> None:
        self._dir = BASE_DIR / "data" / "scrape-sources"
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, code: str) -> Path:
        return self._dir / f"{_sanitize(code)}.json"

    def list_all(self) -> list[ScrapeSource]:
        items: list[ScrapeSource] = []
        for fp in self._dir.glob("*.json"):
            try:
                items.append(ScrapeSource.model_validate_json(fp.read_text(encoding="utf-8")))
            except Exception:
                logger.warning("Failed to load scrape source %s", fp, exc_info=True)
        items.sort(key=lambda s: s.created_at)
        return items

    def get(self, code: str) -> ScrapeSource | None:
        fp = self._path(code)
        if not fp.exists():
            return None
        try:
            return ScrapeSource.model_validate_json(fp.read_text(encoding="utf-8"))
        except Exception:
            logger.warning("Failed to load scrape source %s", fp, exc_info=True)
            return None

    def exists(self, code: str) -> bool:
        return self._path(code).exists()

    def save(self, source: ScrapeSource) -> ScrapeSource:
        fp = self._path(source.source_code)
        now = datetime.now(timezone.utc)
        if fp.exists():
            existing = self.get(source.source_code)
            if existing is not None:
                source.created_at = existing.created_at
        source.updated_at = now
        _atomic_write(
            fp,
            json.dumps(source.model_dump(by_alias=True, mode="json"), ensure_ascii=False, indent=2),
        )
        return source

    def delete(self, code: str) -> bool:
        fp = self._path(code)
        if fp.exists():
            fp.unlink()
            return True
        return False


class CollectedPromptStore:
    def __init__(self) -> None:
        self._dir = BASE_DIR / "data" / "collected-prompts"
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, source_code: str) -> Path:
        return self._dir / f"{_sanitize(source_code)}.json"

    def list(self, source_code: str) -> list[CollectedPrompt]:
        fp = self._path(source_code)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [CollectedPrompt.model_validate(d) for d in raw]
        except Exception:
            logger.warning("Failed to load collected prompts %s", fp, exc_info=True)
            return []

    def _write(self, source_code: str, items: list[CollectedPrompt]) -> None:
        fp = self._path(source_code)
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(fp, json.dumps(data, ensure_ascii=False, indent=2))

    def add_many(
        self, source_code: str, incoming: list[CollectedPrompt]
    ) -> list[CollectedPrompt]:
        """合并去重（按 external_id），返回本次新增的条目。"""
        existing = self.list(source_code)
        by_id = {it.external_id: it for it in existing}
        newly: list[CollectedPrompt] = []
        for it in incoming:
            if it.external_id and it.external_id not in by_id:
                by_id[it.external_id] = it
                newly.append(it)
            elif it.external_id in by_id:
                # 更新热度统计，但保留首次采集时间
                prev = by_id[it.external_id]
                prev.favorite_num = max(prev.favorite_num, it.favorite_num)
                prev.usage_num = max(prev.usage_num, it.usage_num)

        merged = list(by_id.values())
        merged.sort(key=lambda x: (x.favorite_num, x.usage_num), reverse=True)
        if len(merged) > _MAX_PROMPTS_PER_SOURCE:
            merged = merged[:_MAX_PROMPTS_PER_SOURCE]
        self._write(source_code, merged)
        return newly

    def count(self, source_code: str) -> int:
        return len(self.list(source_code))

    def delete_all(self, source_code: str) -> None:
        fp = self._path(source_code)
        try:
            if fp.exists():
                fp.unlink()
        except OSError:
            logger.warning("删除提示词数据失败：%s", fp, exc_info=True)


class ScrapeHistoryStore:
    def __init__(self) -> None:
        self._dir = BASE_DIR / "data" / "scrape-history"
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, source_code: str) -> Path:
        return self._dir / f"{_sanitize(source_code)}.json"

    def list(self, source_code: str) -> list[ScrapeRunResult]:
        fp = self._path(source_code)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [ScrapeRunResult.model_validate(d) for d in raw]
        except Exception:
            return []

    def append(self, result: ScrapeRunResult) -> None:
        items = self.list(result.source_code)
        items.insert(0, result)
        items = items[:_MAX_HISTORY]
        fp = self._path(result.source_code)
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(fp, json.dumps(data, ensure_ascii=False, indent=2))

    def delete_all(self, source_code: str) -> None:
        fp = self._path(source_code)
        try:
            if fp.exists():
                fp.unlink()
        except OSError:
            logger.warning("删除采集历史失败：%s", fp, exc_info=True)
