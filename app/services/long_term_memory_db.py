"""长期记忆的 PostgreSQL 后端 —— 实现 MemoryBackend 的 load/save 原语。

只负责"读整表 / 写整表"，与 JSON 后端语义一致（save = 整表覆盖，对应 JSON 的"重写整个文件"），
故 LongTermMemoryStore 的合并/衰减/检索逻辑一行不改即可切到 PG。并发安全由事务保证。
"""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.db import SessionLocal
from app.models.db.memory import LongTermMemoryORM


class PgMemoryBackend:

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

    def load(self, emp_key: str, kind: str) -> list[dict]:
        with self._session() as s:
            stmt = (
                select(LongTermMemoryORM)
                .where(LongTermMemoryORM.employee_key == emp_key)
                .where(LongTermMemoryORM.kind == kind)
                .order_by(LongTermMemoryORM.position)
            )
            return [row.data for row in s.scalars(stmt)]

    def save(self, emp_key: str, kind: str, rows: list[dict]) -> None:
        with self._session() as s:
            # 整表覆盖：删旧插新，与 JSON 后端"重写整个文件"语义一致
            s.execute(
                delete(LongTermMemoryORM)
                .where(LongTermMemoryORM.employee_key == emp_key)
                .where(LongTermMemoryORM.kind == kind)
            )
            for i, row in enumerate(rows):
                s.add(LongTermMemoryORM(
                    employee_key=emp_key,
                    kind=kind,
                    position=i,
                    memory_id=row.get("memoryId", ""),
                    data=row,
                ))
