"""平台用户与角色存储——JSON 文件持久化，admin 和 user 两端共用。"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config import BASE_DIR

logger = logging.getLogger(__name__)

_DATA_DIR = BASE_DIR / "data" / "platform"
_USERS_FILE = _DATA_DIR / "users.json"
_ROLES_FILE = _DATA_DIR / "roles.json"

ALL_PERMISSIONS = [
    "system:admin",
    "employee:manage",
    "team:manage",
    "workflow:manage",
    "tool:manage",
    "workbench:use",
    "production:manage",
    "settings:manage",
]

DEFAULT_ROLES = [
    {
        "roleCode": "admin",
        "name": "管理员",
        "description": "系统管理员，拥有所有权限",
        "permissions": list(ALL_PERMISSIONS),
        "builtIn": True,
    },
    {
        "roleCode": "editor",
        "name": "编辑",
        "description": "可管理数字员工、团队、工作流等，但不能管理用户和角色",
        "permissions": [
            "employee:manage", "team:manage", "workflow:manage",
            "tool:manage", "workbench:use", "production:manage",
        ],
        "builtIn": True,
    },
    {
        "roleCode": "viewer",
        "name": "只读",
        "description": "只能查看和使用工作台",
        "permissions": ["workbench:use"],
        "builtIn": True,
    },
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── 密码哈希 ──────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return f"pbkdf2:{salt.hex()}:{dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, dk_hex = stored.split(":")
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return hmac.compare_digest(dk.hex(), dk_hex)


# ── RoleStore ─────────────────────────────────────────────────

class RoleStore:

    def __init__(self) -> None:
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not _ROLES_FILE.exists():
            self._write(DEFAULT_ROLES)

    @staticmethod
    def _read() -> list[dict]:
        if not _ROLES_FILE.exists():
            return []
        return json.loads(_ROLES_FILE.read_text("utf-8"))

    @staticmethod
    def _write(roles: list[dict]) -> None:
        _ROLES_FILE.write_text(json.dumps(roles, ensure_ascii=False, indent=2), "utf-8")

    def list_all(self) -> list[dict]:
        return self._read()

    def get(self, role_code: str) -> dict | None:
        return next((r for r in self._read() if r["roleCode"] == role_code), None)

    def save(self, role: dict) -> dict:
        roles = self._read()
        idx = next((i for i, r in enumerate(roles) if r["roleCode"] == role["roleCode"]), -1)
        if idx >= 0:
            role["builtIn"] = roles[idx].get("builtIn", False)
            roles[idx] = role
        else:
            role.setdefault("builtIn", False)
            role.setdefault("createdAt", _now_iso())
            roles.append(role)
        self._write(roles)
        return role

    def delete(self, role_code: str) -> bool:
        roles = self._read()
        target = next((r for r in roles if r["roleCode"] == role_code), None)
        if not target:
            return False
        if target.get("builtIn"):
            raise ValueError("不能删除内置角色")
        roles = [r for r in roles if r["roleCode"] != role_code]
        self._write(roles)
        return True


# ── UserStore ─────────────────────────────────────────────────

class UserStore:

    def __init__(self, role_store: RoleStore) -> None:
        self._role_store = role_store
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not _USERS_FILE.exists():
            default_user = {
                "userId": "u_" + uuid.uuid4().hex[:8],
                "username": "admin",
                "passwordHash": hash_password("admin123"),
                "displayName": "系统管理员",
                "role": "admin",
                "enabled": True,
                "createdAt": _now_iso(),
                "lastLoginAt": None,
            }
            self._write([default_user])
            logger.info("已创建默认管理员账号 admin / admin123")

    @staticmethod
    def _read() -> list[dict]:
        if not _USERS_FILE.exists():
            return []
        return json.loads(_USERS_FILE.read_text("utf-8"))

    @staticmethod
    def _write(users: list[dict]) -> None:
        _USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2), "utf-8")

    def list_all(self) -> list[dict]:
        users = self._read()
        for u in users:
            u.pop("passwordHash", None)
        return users

    def get(self, username: str) -> dict | None:
        return next((u for u in self._read() if u["username"] == username), None)

    def get_by_id(self, user_id: str) -> dict | None:
        return next((u for u in self._read() if u["userId"] == user_id), None)

    def authenticate(self, username: str, password: str) -> dict | None:
        user = self.get(username)
        if not user:
            return None
        if not user.get("enabled", True):
            return None
        if not verify_password(password, user.get("passwordHash", "")):
            return None
        users = self._read()
        for u in users:
            if u["username"] == username:
                u["lastLoginAt"] = _now_iso()
                break
        self._write(users)
        user["lastLoginAt"] = _now_iso()
        return user

    def create(self, data: dict) -> dict:
        users = self._read()
        if any(u["username"] == data["username"] for u in users):
            raise ValueError(f"用户名已存在: {data['username']}")
        role = self._role_store.get(data.get("role", "viewer"))
        if not role:
            raise ValueError(f"角色不存在: {data.get('role')}")
        user = {
            "userId": "u_" + uuid.uuid4().hex[:8],
            "username": data["username"],
            "passwordHash": hash_password(data["password"]),
            "displayName": data.get("displayName", data["username"]),
            "role": data.get("role", "viewer"),
            "enabled": data.get("enabled", True),
            "createdAt": _now_iso(),
            "lastLoginAt": None,
        }
        users.append(user)
        self._write(users)
        safe = dict(user)
        safe.pop("passwordHash", None)
        return safe

    def update(self, username: str, data: dict) -> dict:
        users = self._read()
        user = next((u for u in users if u["username"] == username), None)
        if not user:
            raise ValueError(f"用户不存在: {username}")
        if "displayName" in data:
            user["displayName"] = data["displayName"]
        if "role" in data:
            role = self._role_store.get(data["role"])
            if not role:
                raise ValueError(f"角色不存在: {data['role']}")
            user["role"] = data["role"]
        if "enabled" in data:
            user["enabled"] = data["enabled"]
        if "password" in data and data["password"]:
            user["passwordHash"] = hash_password(data["password"])
        self._write(users)
        safe = dict(user)
        safe.pop("passwordHash", None)
        return safe

    def delete(self, username: str) -> bool:
        users = self._read()
        admins = [u for u in users if u["role"] == "admin" and u["username"] != username]
        target = next((u for u in users if u["username"] == username), None)
        if not target:
            return False
        if target["role"] == "admin" and len(admins) == 0:
            raise ValueError("不能删除最后一个管理员")
        users = [u for u in users if u["username"] != username]
        self._write(users)
        return True

    def get_permissions(self, username: str) -> list[str]:
        user = self.get(username)
        if not user:
            return []
        role = self._role_store.get(user.get("role", ""))
        if not role:
            return []
        return role.get("permissions", [])
