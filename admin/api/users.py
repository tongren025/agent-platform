"""管理端用户管理 API。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from app.dependencies import user_store, role_store
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


class CreateUserReq(BaseModel):
    username: str
    password: str
    displayName: str = ""
    role: str = "viewer"
    enabled: bool = True


class UpdateUserReq(BaseModel):
    displayName: str | None = None
    role: str | None = None
    enabled: bool | None = None
    password: str | None = None


@router.get("")
def list_users(_: dict = Depends(require_admin)):
    users = user_store.list_all()
    roles = {r["roleCode"]: r["name"] for r in role_store.list_all()}
    for u in users:
        u["roleName"] = roles.get(u.get("role", ""), u.get("role", ""))
    return ok(users)


@router.post("")
def create_user(req: CreateUserReq, _: dict = Depends(require_admin)):
    try:
        user = user_store.create({
            "username": req.username,
            "password": req.password,
            "displayName": req.displayName or req.username,
            "role": req.role,
            "enabled": req.enabled,
        })
        return ok(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{username}")
def update_user(username: str, req: UpdateUserReq, _: dict = Depends(require_admin)):
    data = {}
    if req.displayName is not None:
        data["displayName"] = req.displayName
    if req.role is not None:
        data["role"] = req.role
    if req.enabled is not None:
        data["enabled"] = req.enabled
    if req.password:
        data["password"] = req.password
    try:
        user = user_store.update(username, data)
        return ok(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{username}")
def delete_user(username: str, _: dict = Depends(require_admin)):
    try:
        deleted = user_store.delete(username)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"用户不存在: {username}")
        return ok(True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
