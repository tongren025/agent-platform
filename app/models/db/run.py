"""单次 agent 运行记录的 ORM —— M1 把 JSON run store 迁到 PostgreSQL。

字段与 app/models/run_record.py 的 AgentRunRecord 一一对应，to_dict() 输出 camelCase，
使 store 从 JSON 切到 PG 时 API 层零改动（沿用 user.py 建立的迁移范式）。
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db.base import Base, to_iso, utcnow


class AgentRunORM(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    session_id: Mapped[str] = mapped_column(String(64), default="", index=True)
    employee_key: Mapped[str] = mapped_column(String(128), default="", index=True)
    workflow_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    model: Mapped[str] = mapped_column(String(128), default="")
    success: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    iterations: Mapped[int] = mapped_column(Integer, default=0)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    elapsed_ms: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    pending_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    traces: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True,
    )

    def to_dict(self) -> dict:
        return {
            "runId": self.run_id,
            "sessionId": self.session_id,
            "employeeKey": self.employee_key,
            "workflowKey": self.workflow_key,
            "model": self.model,
            "success": self.success,
            "iterations": self.iterations,
            "promptTokens": self.prompt_tokens,
            "completionTokens": self.completion_tokens,
            "totalTokens": self.total_tokens,
            "costUsd": self.cost_usd,
            "elapsedMilliseconds": self.elapsed_ms,
            "errorMessage": self.error_message,
            "pendingApproval": self.pending_approval,
            "traces": list(self.traces or []),
            "createdAt": to_iso(self.created_at),
        }
