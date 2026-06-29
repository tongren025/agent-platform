"""最简管理员鉴权：口令登录 + HMAC 签名 token，不引第三方依赖。

token 结构：base64url(payload) + "." + base64url(HMAC-SHA256(payload))
payload 是 {"sub": 用户名, "exp": 过期时间戳}。无状态，校验只看签名和过期时间。
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

from fastapi import Header, HTTPException

from admin.config import ADMIN_PASSWORD, ADMIN_SECRET, ADMIN_TOKEN_TTL, ADMIN_USERNAME


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _sign(payload: bytes) -> str:
    return _b64encode(hmac.new(ADMIN_SECRET.encode(), payload, hashlib.sha256).digest())


def verify_credentials(username: str, password: str) -> bool:
    # 常数时间比较，避免计时侧信道
    u_ok = hmac.compare_digest(username or "", ADMIN_USERNAME)
    p_ok = hmac.compare_digest(password or "", ADMIN_PASSWORD)
    return u_ok and p_ok


def issue_token(username: str) -> str:
    payload = json.dumps(
        {"sub": username, "exp": int(time.time()) + ADMIN_TOKEN_TTL},
        separators=(",", ":"),
    ).encode()
    return f"{_b64encode(payload)}.{_sign(payload)}"


def _parse_token(token: str) -> dict:
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
    """FastAPI 依赖：校验 Authorization: Bearer <token>，返回管理员声明。"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少管理员凭证")
    return _parse_token(authorization[len("Bearer "):].strip())
