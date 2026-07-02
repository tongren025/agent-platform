"""向量 embedding ORM —— M3 pgvector 语义检索。

每条记录是一段文本的向量表示（employee_key + source_type + source_id 唯一标识）。
使用 pgvector 的 Vector 类型存储 1024 维向量。
在非 PG 环境（SQLite 测试）退化为 JSON 列存 list[float]。
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db.base import Base

try:
    from pgvector.sqlalchemy import Vector
    _VECTOR_TYPE = Vector(1024)
except ImportError:
    from sqlalchemy import JSON
    _VECTOR_TYPE = JSON


class EmbeddingORM(Base):
    __tablename__ = "embeddings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    employee_key: Mapped[str] = mapped_column(String(128), index=True)
    source_type: Mapped[str] = mapped_column(String(32), index=True)
    source_id: Mapped[str] = mapped_column(String(128), index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    embedding = mapped_column(_VECTOR_TYPE, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        Index("ix_emb_employee_source", "employee_key", "source_type", "source_id", unique=True),
    )
