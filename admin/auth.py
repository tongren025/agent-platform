"""管理端鉴权——基于平台用户存储，HMAC 签名 token。

token payload: {"sub": username, "role": roleCode, "exp": timestamp}
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import math
import time

from fastapi import Header, HTTPException

from admin.config import ADMIN_SECRET, ADMIN_TOKEN_TTL


def _b64encode(raw: bytes) -> str:
    """URL-safe base64 编码（去掉 = 填充）。"""
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64decode(s: str) -> bytes:
    """URL-safe base64 解码（自动补回 = 填充）。"""
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _sign(payload: bytes) -> str:
    """用 ADMIN_SECRET 对 payload 做 HMAC-SHA256 签名，返回 base64 摘要。"""
    return _b64encode(hmac.new(ADMIN_SECRET.encode(), payload, hashlib.sha256).digest())


def issue_token(username: str, role: str = "admin") -> str:
    """签发两端共用的身份 token；访问权限由请求时的账号状态与角色决定。"""
    payload = json.dumps(
        {"sub": username, "role": role, "exp": int(time.time()) + ADMIN_TOKEN_TTL},
        separators=(",", ":"),
    ).encode()
    return f"{_b64encode(payload)}.{_sign(payload)}"


def parse_token(token: str) -> dict:
    """解析并校验 token：格式、HMAC 签名（常量时间比较）、过期时间，任一不过返 401。"""
    try:
        body, sig = token.split(".", 1)
        # compare_digest 的字符串输入必须是 ASCII；非法签名仍按凭证错误处理。
        if not sig.isascii():
            raise ValueError("签名必须为 ASCII")
        payload = _b64decode(body)
    except Exception:
        raise HTTPException(status_code=401, detail="token 格式非法")
    if not hmac.compare_digest(sig, _sign(payload)):
        raise HTTPException(status_code=401, detail="token 签名校验失败")
    try:
        data = json.loads(payload)
        if not isinstance(data, dict):
            raise ValueError("payload 必须为对象")
        if not isinstance(data.get("sub"), str) or not data["sub"].strip():
            raise ValueError("缺少账号标识")
        expires_at = data.get("exp")
        if isinstance(expires_at, bool) or not isinstance(expires_at, (int, float)):
            raise ValueError("有效期必须为数值")
        if not math.isfinite(expires_at):
            raise ValueError("有效期必须为有限数值")
    except (ValueError, TypeError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=401, detail="token 内容非法") from exc
    if expires_at <= time.time():
        raise HTTPException(status_code=401, detail="token 已过期，请重新登录")
    return data


def require_admin(authorization: str = Header(default="")) -> dict:
    """校验当前账号及实时 system:admin 权限，降权后旧 token 立即失去管理权限。"""
    from app.dependencies import user_store

    claims = require_login(authorization)
    if "system:admin" not in user_store.get_permissions(claims["sub"]):
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return claims


def require_login(authorization: str = Header(default="")) -> dict:
    """校验 token 与实时账号状态；已删除、禁用的账号不能继续使用旧凭证。"""
    from app.dependencies import user_store

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少凭证")
    claims = parse_token(authorization[len("Bearer "):].strip())
    user = user_store.get(claims["sub"])
    if not user or not user.get("enabled", True):
        raise HTTPException(status_code=401, detail="账号不存在或已被禁用")
    return {**claims, "role": user.get("role", "viewer")}
