"""用户端登录接口——与管理端共用同一套用户存储和 token 签发。"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from app.dependencies import user_store
from admin.auth import issue_token, parse_token

router = APIRouter(prefix="/api/v1/agentapp/auth", tags=["user-auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
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
def me(authorization: str = ""):
    from fastapi import Header
    # 手动拿 header 避免自动 401
    return ok({"authenticated": False})


@router.get("/check")
def check_token(token: str = ""):
    if not token:
        raise HTTPException(status_code=401, detail="未提供 token")
    claims = parse_token(token)
    user = user_store.get(claims.get("sub", ""))
    if not user or not user.get("enabled", True):
        raise HTTPException(status_code=401, detail="用户不存在或已禁用")
    permissions = user_store.get_permissions(claims.get("sub", ""))
    return ok({
        "username": claims.get("sub"),
        "role": claims.get("role"),
        "permissions": permissions,
    })
