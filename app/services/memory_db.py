"""对话会话的 PostgreSQL 仓储 —— M1 迁移，接口镜像 JSON 版 ConversationMemoryStore。

load_session / list_sessions / save_session / delete_session 的签名与返回类型与
app/services/memory.py 完全一致，故 dependencies 一行切换，invocation.py / api/sessions.py
零改动。并发安全由事务保证（旧 JSON store 读改写无锁，并发会丢会话）。
"""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.db import SessionLocal
from app.models.conversation import ConversationSession
from app.models.db.session import ConversationSessionORM


class ConversationMemoryDbStore:

    def __init__(self, session_factory: sessionmaker | None = None) -> None:
        self._sf = session_factory or SessionLocal

    @contextmanager
    def _session(self) -> Iterator[Session]:
        s = self._sf()
        try:
            yield s
            s.commit()
        except Exception:
            s.rollback()
            raise
        finally:
            s.close()

    def load_session(self, session_id: str) -> ConversationSession | None:
        with self._session() as s:
            row = s.scalar(
                select(ConversationSessionORM).where(
                    ConversationSessionORM.session_id == session_id
                )
            )
            return ConversationSession.model_validate(row.to_dict()) if row else None

    def list_sessions(
        self,
        employee_key: str | None = None,
        limit: int = 20,
        target_type: str | None = None,
        team_code: str | None = None,
        include_archived: bool = False,
    ) -> list[ConversationSession]:
        with self._session() as s:
            stmt = select(ConversationSessionORM)
            if employee_key:
                stmt = stmt.where(ConversationSessionORM.employee_key == employee_key)
            if target_type:
                stmt = stmt.where(ConversationSessionORM.target_type == target_type)
            if team_code:
                stmt = stmt.where(ConversationSessionORM.team_code == team_code)
            if not include_archived:
                stmt = stmt.where(ConversationSessionORM.archived.is_(False))
            stmt = stmt.order_by(ConversationSessionORM.last_active_at.desc()).limit(limit)
            return [ConversationSession.model_validate(r.to_dict()) for r in s.scalars(stmt)]

    def save_session(self, session: ConversationSession) -> None:
        with self._session() as s:
            row = s.scalar(
                select(ConversationSessionORM).where(
                    ConversationSessionORM.session_id == session.session_id
                )
            )
            if row is None:
                row = ConversationSessionORM(session_id=session.session_id)
                s.add(row)
            row.employee_key = session.employee_key
            row.target_type = session.target_type
            row.team_code = session.team_code
            row.title = session.title
            row.archived = session.archived
            row.messages = [m.model_dump(by_alias=True, mode="json") for m in session.messages]
            row.artifacts = [a.model_dump(by_alias=True, mode="json") for a in session.artifacts]
            row.compressed_summary = session.compressed_summary
            row.session_metadata = session.metadata or {}
            row.pending_approval = (
                session.pending_approval.model_dump(by_alias=True, mode="json")
                if session.pending_approval else None
            )
            row.created_at = session.created_at
            row.last_active_at = session.last_active_at

    def delete_session(self, session_id: str) -> bool:
        with self._session() as s:
            row = s.scalar(
                select(ConversationSessionORM).where(
                    ConversationSessionORM.session_id == session_id
                )
            )
            if row is None:
                return False
            s.delete(row)
            return True
