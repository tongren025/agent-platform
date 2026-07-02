"""运行记录的 PostgreSQL 仓储 —— M1 迁移，接口镜像 JSON 版 AgentRunStore。

save_run / load_run / list_runs 的签名与返回类型与 app/services/run_store.py 完全一致，
故 dependencies 里一行即可切换后端，invocation.py 与 api/runs.py 零改动。
并发安全由事务保证（旧 JSON store 的读改写无锁，并发下会丢数据）。
"""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.db import SessionLocal
from app.models.db.run import AgentRunORM
from app.models.run_record import AgentRunRecord


class AgentRunDbStore:

    def __init__(self, session_factory: sessionmaker | None = None) -> None:
        # 允许注入 sessionmaker（测试用 SQLite 内存库），默认走应用的 PG SessionLocal
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

    def save_run(self, record: AgentRunRecord) -> None:
        with self._session() as s:
            row = s.scalar(select(AgentRunORM).where(AgentRunORM.run_id == record.run_id))
            if row is None:
                row = AgentRunORM(run_id=record.run_id)
                s.add(row)
            row.session_id = record.session_id
            row.employee_key = record.employee_key
            row.workflow_key = record.workflow_key
            row.model = record.model
            row.success = record.success
            row.iterations = record.iterations
            row.prompt_tokens = record.prompt_tokens
            row.completion_tokens = record.completion_tokens
            row.total_tokens = record.total_tokens
            row.cost_usd = record.cost_usd
            row.elapsed_ms = record.elapsed_ms
            row.error_message = record.error_message
            row.pending_approval = record.pending_approval
            row.traces = [t.model_dump(by_alias=True) for t in record.traces]
            row.created_at = record.created_at

    def load_run(self, run_id: str) -> AgentRunRecord | None:
        with self._session() as s:
            row = s.scalar(select(AgentRunORM).where(AgentRunORM.run_id == run_id))
            return AgentRunRecord.model_validate(row.to_dict()) if row else None

    def list_runs(
        self,
        employee_key: str | None = None,
        session_id: str | None = None,
        success: bool | None = None,
        limit: int = 50,
    ) -> list[AgentRunRecord]:
        with self._session() as s:
            stmt = select(AgentRunORM)
            if employee_key:
                stmt = stmt.where(AgentRunORM.employee_key == employee_key)
            if session_id:
                stmt = stmt.where(AgentRunORM.session_id == session_id)
            if success is not None:
                stmt = stmt.where(AgentRunORM.success == success)
            stmt = stmt.order_by(AgentRunORM.created_at.desc()).limit(limit)
            return [AgentRunRecord.model_validate(r.to_dict()) for r in s.scalars(stmt)]
