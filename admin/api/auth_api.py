"""管理端登录接口。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from admin.auth import issue_token, require_admin, verify_credentials

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    if not verify_credentials(req.username, req.password):
        raise HTTPException(status_code=401, detail="账号或密码错误")
    return ok({"token": issue_token(req.username), "username": req.username})


@router.get("/me")
def me(claims: dict = Depends(require_admin)):
    return ok({"username": claims.get("sub")})
