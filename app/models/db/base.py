"""ORM 基类与公共列。"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """所有 ORM 模型的公共基类（SQLAlchemy 2.0 DeclarativeBase）。"""
    pass


def utcnow() -> datetime:
    """统一的 UTC 当前时间工厂，供 ORM 列默认值使用。"""
    return datetime.now(timezone.utc)


def to_iso(dt: datetime | None) -> str | None:
    """统一把 datetime 序列化成 ISO 字符串,对齐旧 JSON store 的输出格式。"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
