"""
定时文章学习的文件型持久化。

- LearnSourceStore   学习源     data/learn-sources/<code>.json
- LearnHistoryStore  运行历史   data/learn-history/<code>.json（最近 N 条）

复用 scrape_store.py 的原子写法。
"""
from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from app.config import BASE_DIR
from app.models.learn import LearnRunResult, LearnSource

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_MAX_HISTORY = 50


def _sanitize(key: str) -> str:
    """校验 code 合法（非空、无斜杠/..），防路径穿越。"""
    if not key or _BAD_KEY_RE.search(key):
        raise ValueError(f"Invalid key: {key!r}")
    return key


def _atomic_write(path: Path, text: str) -> None:
    """原子写：先写临时文件再 os.replace，避免半截文件。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


class LearnSourceStore:
    """学习源（定时文章学习任务配置）存储：data/learn-sources/<code>.json。"""

    def __init__(self) -> None:
        self._dir = BASE_DIR / "data" / "learn-sources"
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, code: str) -> Path:
        """学习源 code → json 文件路径。"""
        return self._dir / f"{_sanitize(code)}.json"

    def list_all(self) -> list[LearnSource]:
        """读出全部学习源，按创建时间升序；损坏文件告警跳过。"""
        items: list[LearnSource] = []
        for fp in self._dir.glob("*.json"):
            try:
                items.append(LearnSource.model_validate_json(fp.read_text(encoding="utf-8")))
            except Exception:
                logger.warning("Failed to load learn source %s", fp, exc_info=True)
        items.sort(key=lambda s: s.created_at)
        return items

    def get(self, code: str) -> LearnSource | None:
        """按 code 读取单个学习源，缺失或损坏返回 None。"""
        fp = self._path(code)
        if not fp.exists():
            return None
        try:
            return LearnSource.model_validate_json(fp.read_text(encoding="utf-8"))
        except Exception:
            logger.warning("Failed to load learn source %s", fp, exc_info=True)
            return None

    def exists(self, code: str) -> bool:
        """判断某学习源是否存在。"""
        return self._path(code).exists()

    def save(self, source: LearnSource) -> LearnSource:
        """写入学习源；更新时保留原 created_at、刷新 updated_at。"""
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
        """删除学习源，成功 True，本不存在 False。"""
        fp = self._path(code)
        if fp.exists():
            fp.unlink()
            return True
        return False


class LearnHistoryStore:
    """学习运行历史存储：data/learn-history/<code>.json，保留最近 _MAX_HISTORY 条。"""

    def __init__(self) -> None:
        self._dir = BASE_DIR / "data" / "learn-history"
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, code: str) -> Path:
        """学习源 code → 历史 json 文件路径。"""
        return self._dir / f"{_sanitize(code)}.json"

    def list(self, code: str) -> list[LearnRunResult]:
        """读出某学习源的运行历史（最新在前）；缺失或损坏返回空列表。"""
        fp = self._path(code)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [LearnRunResult.model_validate(d) for d in raw]
        except Exception:
            return []

    def append(self, result: LearnRunResult) -> None:
        """追加一条运行历史到队首，封顶 _MAX_HISTORY 条后原子写回。"""
        items = self.list(result.source_code)
        items.insert(0, result)
        items = items[:_MAX_HISTORY]
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(self._path(result.source_code), json.dumps(data, ensure_ascii=False, indent=2))

    def delete_all(self, code: str) -> None:
        """删除某学习源的全部历史文件（失败只告警）。"""
        fp = self._path(code)
        try:
            if fp.exists():
                fp.unlink()
        except OSError:
            logger.warning("删除学习历史失败：%s", fp, exc_info=True)
