"""管理端角色管理 API。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.common import ok
from app.dependencies import role_store
from app.services.user_store import ALL_PERMISSIONS
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/roles", tags=["admin-roles"])


class RoleBody(BaseModel):
    """角色创建/更新请求体：编码、名称、描述与权限列表。"""
    roleCode: str
    name: str
    description: str = ""
    permissions: list[str] = []


@router.get("")
def list_roles(_: dict = Depends(require_admin)):
    """GET /api/admin/roles：列出全部角色。"""
    return ok(role_store.list_all())


@router.get("/permissions")
def list_permissions(_: dict = Depends(require_admin)):
    """GET /permissions：全部可分配权限及中文标签（前端勾选框用）。"""
    labels = {
        "system:admin": "系统管理（用户、角色）",
        "employee:manage": "数字员工管理",
        "team:manage": "团队管理",
        "workflow:manage": "工作流管理",
        "tool:manage": "工具管理",
        "workbench:use": "使用工作台",
        "production:manage": "生产管线",
        "settings:manage": "系统设置",
    }
    return ok([{"code": p, "label": labels.get(p, p)} for p in ALL_PERMISSIONS])


@router.post("")
def create_role(req: RoleBody, _: dict = Depends(require_admin)):
    """POST：创建角色，编码重复返 409。"""
    if role_store.get(req.roleCode):
        raise HTTPException(status_code=409, detail=f"角色已存在: {req.roleCode}")
    role = role_store.save({
        "roleCode": req.roleCode,
        "name": req.name,
        "description": req.description,
        "permissions": req.permissions,
    })
    return ok(role)


@router.put("/{role_code}")
def update_role(role_code: str, req: RoleBody, _: dict = Depends(require_admin)):
    """PUT /{role_code}：更新角色（保留 builtIn 标记），不存在返 404。"""
    existing = role_store.get(role_code)
    if not existing:
        raise HTTPException(status_code=404, detail=f"角色不存在: {role_code}")
    role = role_store.save({
        "roleCode": role_code,
        "name": req.name,
        "description": req.description,
        "permissions": req.permissions,
        "builtIn": existing.get("builtIn", False),
    })
    return ok(role)


@router.delete("/{role_code}")
def delete_role(role_code: str, _: dict = Depends(require_admin)):
    """DELETE /{role_code}：删除角色；内置角色或使用中会被 store 拒绝（返 400）。"""
    try:
        deleted = role_store.delete(role_code)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"角色不存在: {role_code}")
        return ok(True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
