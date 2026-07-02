"""对话会话的 ORM —— M1 把 JSON 会话 store 迁到 PostgreSQL。

字段与 app/models/conversation.py 的 ConversationSession 一一对应，to_dict() 输出
camelCase，使 store 从 JSON 切到 PG 时 API 层零改动。messages / artifacts /
pendingApproval / metadata 作为 JSON 列整体存取（子对象已是 by_alias 结构）。
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db.base import Base, to_iso, utcnow


class ConversationSessionORM(Base):
    __tablename__ = "conversation_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    employee_key: Mapped[str] = mapped_column(String(128), default="", index=True)
    target_type: Mapped[str] = mapped_column(String(32), default="employee", index=True)
    team_code: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    title: Mapped[str] = mapped_column(Text, default="")
    archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    messages: Mapped[list] = mapped_column(JSON, default=list)
    artifacts: Mapped[list] = mapped_column(JSON, default=list)
    compressed_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # "metadata" 是 SQLAlchemy 保留属性名，故 Python 属性另起名，DB 列名仍为 metadata
    session_metadata: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    pending_approval: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True,
    )

    def to_dict(self) -> dict:
        return {
            "sessionId": self.session_id,
            "employeeKey": self.employee_key,
            "targetType": self.target_type,
            "teamCode": self.team_code,
            "title": self.title,
            "archived": self.archived,
            "messages": list(self.messages or []),
            "artifacts": list(self.artifacts or []),
            "compressedSummary": self.compressed_summary,
            "metadata": dict(self.session_metadata or {}),
            "pendingApproval": self.pending_approval,
            "createdAt": to_iso(self.created_at),
            "lastActiveAt": to_iso(self.last_active_at),
        }
