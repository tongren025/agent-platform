"""平台用户 + 角色的 ORM 模型。

字段与旧 JSON store(app/services/user_store.py)一一对应,to_dict()
输出保持 camelCase,使 API 层从 JSON 切到 PG 时无需改动。
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db.base import Base, to_iso, utcnow


class Role(Base):
    """roles 表：平台角色（权限集合），built_in 标记内置角色不可删。"""
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    role_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    permissions: Mapped[list] = mapped_column(JSON, default=list)
    built_in: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    def to_dict(self) -> dict:
        """输出 camelCase dict，对齐旧 JSON store 的角色结构。"""
        return {
            "roleCode": self.role_code,
            "name": self.name,
            "description": self.description or "",
            "permissions": list(self.permissions or []),
            "builtIn": self.built_in,
            "createdAt": to_iso(self.created_at),
        }


class User(Base):
    """users 表：平台登录用户，password_hash 存哈希，role_code 关联角色。"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    display_name: Mapped[str] = mapped_column(String(128), default="")
    role_code: Mapped[str] = mapped_column(String(64), index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def to_dict(self, include_hash: bool = False) -> dict:
        """输出 camelCase dict；include_hash=True 时附带密码哈希（仅内部鉴权用，勿外传）。"""
        data = {
            "userId": self.user_id,
            "username": self.username,
            "displayName": self.display_name,
            "role": self.role_code,
            "enabled": self.enabled,
            "createdAt": to_iso(self.created_at),
            "lastLoginAt": to_iso(self.last_login_at),
        }
        if include_hash:
            data["passwordHash"] = self.password_hash
        return data
