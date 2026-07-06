"""管理端鉴权——基于平台用户存储，HMAC 签名 token。

token payload: {"sub": username, "role": roleCode, "exp": timestamp}
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
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
    """签发管理端 token：payload(sub/role/exp) + HMAC 签名，格式 body.sig，有效期 ADMIN_TOKEN_TTL。"""
    payload = json.dumps(
        {"sub": username, "role": role, "exp": int(time.time()) + ADMIN_TOKEN_TTL},
        separators=(",", ":"),
    ).encode()
    return f"{_b64encode(payload)}.{_sign(payload)}"


def parse_token(token: str) -> dict:
    """解析并校验 token：格式、HMAC 签名（常量时间比较）、过期时间，任一不过返 401。"""
    try:
        body, sig = token.split(".", 1)
        payload = _b64decode(body)
    except Exception:
        raise HTTPException(status_code=401, detail="token 格式非法")
    if not hmac.compare_digest(sig, _sign(payload)):
        raise HTTPException(status_code=401, detail="token 签名校验失败")
    data = json.loads(payload)
    if data.get("exp", 0) < time.time():
        raise HTTPException(status_code=401, detail="token 已过期，请重新登录")
    return data


def require_admin(authorization: str = Header(default="")) -> dict:
    """校验 token 并要求 system:admin 权限。"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少凭证")
    claims = parse_token(authorization[len("Bearer "):].strip())
    if claims.get("role") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return claims


def require_login(authorization: str = Header(default="")) -> dict:
    """校验 token，任何已登录用户均可。"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少凭证")
    return parse_token(authorization[len("Bearer "):].strip())
