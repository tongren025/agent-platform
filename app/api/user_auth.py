"""用户端登录接口——与管理端共用同一套用户存储和 token 签发。"""
from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from app.dependencies import user_store
from admin.auth import issue_token, parse_token

router = APIRouter(prefix="/api/v1/agentapp/auth", tags=["user-auth"])


class LoginRequest(BaseModel):
    """POST /login 的请求体：用户名与密码。"""
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    """POST /login：校验账号密码，成功则签发 token 并返回用户名/显示名/角色。"""
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
def me(authorization: str = Header(default="")):
    """GET /me：校验 Bearer token 与账号当前状态，返回实时身份和权限。"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录或缺少凭证")
    claims = parse_token(authorization[len("Bearer "):].strip())
    username = claims.get("sub", "")
    user = user_store.get(username)
    if not user or not user.get("enabled", True):
        raise HTTPException(status_code=401, detail="用户不存在或已禁用")
    return ok({
        "authenticated": True,
        "username": username,
        "displayName": user.get("displayName", username),
        "role": user.get("role", "viewer"),
        "permissions": user_store.get_permissions(username),
    })


@router.get("/check")
def check_token(token: str = ""):
    """兼容旧客户端的 query token 校验；返回实时角色，浏览器新代码优先使用 /me。"""
    if not token:
        raise HTTPException(status_code=401, detail="未提供 token")
    claims = parse_token(token)
    user = user_store.get(claims.get("sub", ""))
    if not user or not user.get("enabled", True):
        raise HTTPException(status_code=401, detail="用户不存在或已禁用")
    permissions = user_store.get_permissions(claims.get("sub", ""))
    return ok({
        "username": claims.get("sub"),
        "role": user.get("role", "viewer"),
        "permissions": permissions,
    })
