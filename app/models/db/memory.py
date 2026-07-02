"""长期记忆的 ORM —— M1 把三类记忆的 JSON 文件迁到 PostgreSQL。

一条记忆一行；`data` 存整条记忆的 by_alias dict（业务层已保证结构），`position` 保序
（业务层排序后整表覆盖写）。检索/合并逻辑仍在 LongTermMemoryStore，本表只做整表读写。
"""
from __future__ import annotations

from sqlalchemy import Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db.base import Base


class LongTermMemoryORM(Base):
    __tablename__ = "long_term_memories"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    employee_key: Mapped[str] = mapped_column(String(128), index=True)
    kind: Mapped[str] = mapped_column(String(16), index=True)  # semantic | episodic | procedural
    position: Mapped[int] = mapped_column(Integer, default=0)   # 保序（业务层已排好序）
    memory_id: Mapped[str] = mapped_column(String(64), default="", index=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)      # 整条记忆的 by_alias dict
