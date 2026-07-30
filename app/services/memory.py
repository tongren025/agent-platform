"""会话（短期记忆）文件存储。

把每次对话的 ConversationSession 持久化为 data 下的安全文件名 JSON，
提供读取 / 列表过滤 / 保存 / 删除。是 agent 多轮上下文的落地层。
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from pathlib import Path

from app.config import BASE_DIR, settings
from app.models.conversation import ConversationSession
from app.services.registry import _normalize_keys

logger = logging.getLogger(__name__)

_PORTABLE_SESSION_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,119}\Z")
_WINDOWS_RESERVED_STEMS = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


class ConversationMemoryStore:
    """会话文件存储：每个会话一份跨平台安全命名的 JSON。"""

    def __init__(self, session_dir: str | None = None) -> None:
        self._dir = BASE_DIR / (session_dir or settings.agent.session_dir)
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path_for(self, session_id: str) -> Path:
        """会话 id → 不含路径分隔符、Windows 禁用字符或保留名的稳定文件路径。"""
        normalized = str(session_id)
        if (
            _PORTABLE_SESSION_ID_RE.fullmatch(normalized)
            and normalized.upper() not in _WINDOWS_RESERVED_STEMS
            and normalized not in {".", ".."}
        ):
            stem = normalized
        else:
            digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
            stem = f"session_{digest}"
        return self._dir / f"{stem}.json"

    def _legacy_path_for(self, session_id: str) -> Path | None:
        """Linux 旧版可能直接以含冒号的 id 命名；仅在路径绝对安全时兼容读取。"""
        normalized = str(session_id)
        if (
            not normalized
            or normalized in {".", ".."}
            or "/" in normalized
            or "\\" in normalized
            or (os.name == "nt" and re.search(r'[<>:"|?*]', normalized))
        ):
            return None
        legacy = self._dir / f"{normalized}.json"
        return legacy if legacy != self._path_for(normalized) else None

    def load_session(self, session_id: str) -> ConversationSession | None:
        """读取单个会话；文件缺失或损坏都返回 None（损坏会告警）。"""
        candidates = [self._path_for(session_id)]
        legacy = self._legacy_path_for(session_id)
        if legacy is not None:
            candidates.append(legacy)
        for fp in candidates:
            if not fp.exists():
                continue
            try:
                data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
                return ConversationSession.model_validate(data)
            except Exception:
                logger.warning("Failed to load session %s", fp, exc_info=True)
        return None

    def list_sessions(
        self,
        employee_key: str | None = None,
        limit: int = 20,
        target_type: str | None = None,
        team_code: str | None = None,
        include_archived: bool = False,
    ) -> list[ConversationSession]:
        """列出会话，支持按员工/目标类型/团队过滤，默认排除已归档；按最近活跃排序后取前 limit 条。"""
        if not self._dir.exists():
            return []

        sessions: list[ConversationSession] = []
        for fp in self._dir.glob("*.json"):
            try:
                data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
                s = ConversationSession.model_validate(data)
                if employee_key and s.employee_key != employee_key:
                    continue
                if target_type and s.target_type != target_type:
                    continue
                if team_code and s.team_code != team_code:
                    continue
                if not include_archived and s.archived:
                    continue
                sessions.append(s)
            except Exception:
                logger.warning("Skipping corrupt session file %s", fp, exc_info=True)

        sessions.sort(key=lambda s: s.last_active_at, reverse=True)
        return sessions[:limit]

    def save_session(self, session: ConversationSession) -> None:
        """保存/覆盖会话，字段按别名序列化（与前端 camelCase 对齐）。"""
        fp = self._path_for(session.session_id)
        self._dir.mkdir(parents=True, exist_ok=True)
        data = session.model_dump(by_alias=True, mode="json")
        fp.write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def delete_session(self, session_id: str) -> bool:
        """删除会话文件，成功 True，本不存在 False。"""
        deleted = False
        candidates = [self._path_for(session_id)]
        legacy = self._legacy_path_for(session_id)
        if legacy is not None:
            candidates.append(legacy)
        for fp in candidates:
            if fp.exists():
                fp.unlink()
                deleted = True
        return deleted
