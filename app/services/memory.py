from __future__ import annotations

import json
import logging
from pathlib import Path

from app.config import BASE_DIR, settings
from app.models.conversation import ConversationSession
from app.services.registry import _normalize_keys

logger = logging.getLogger(__name__)


class ConversationMemoryStore:

    def __init__(self, session_dir: str | None = None) -> None:
        self._dir = BASE_DIR / (session_dir or settings.agent.session_dir)
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path_for(self, session_id: str) -> Path:
        return self._dir / f"{session_id}.json"

    def load_session(self, session_id: str) -> ConversationSession | None:
        fp = self._path_for(session_id)
        if not fp.exists():
            return None
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
        fp = self._path_for(session.session_id)
        self._dir.mkdir(parents=True, exist_ok=True)
        data = session.model_dump(by_alias=True, mode="json")
        fp.write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def delete_session(self, session_id: str) -> bool:
        fp = self._path_for(session_id)
        if fp.exists():
            fp.unlink()
            return True
        return False
