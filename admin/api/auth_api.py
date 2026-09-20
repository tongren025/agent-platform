"""管理端登录——基于平台用户存储验证。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from app.dependencies import user_store
from admin.auth import issue_token, require_login

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


class LoginRequest(BaseModel):
    """登录请求体：平台用户名 + 明文密码（仅传输用，服务端只存哈希）。"""
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    """POST /api/admin/auth/login：账号密码登录，签发管理端 HMAC token；账号密码错误或账号被禁用返回 401。"""
    user = user_store.authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="账号或密码错误，或账号已被禁用")
    return ok({
        "token": issue_token(req.username, user.get("role", "viewer")),
        "username": req.username,
        "displayName": user.get("displayName", req.username),
        "role": user.get("role", "viewer"),
    })


@router.get("/me")
def me(claims: dict = Depends(require_login)):
    """GET /api/admin/auth/me：返回当前登录用户信息（剔除密码哈希）及权限列表；token 对应用户不存在或已禁用返回 401。"""
    username = claims.get("sub")
    user = user_store.get(username)
    if not user or not user.get("enabled", True):
        raise HTTPException(status_code=401, detail="用户不存在或已被禁用")
    permissions = user_store.get_permissions(username)
    safe = dict(user)
    safe.pop("passwordHash", None)
    safe["permissions"] = permissions
    return ok(safe)
