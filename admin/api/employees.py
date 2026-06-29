"""管理端员工治理 API——复用用户端 employee_registry，带 admin 鉴权。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.common import ok, validate_key
from app.dependencies import employee_registry, team_registry
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/employees", tags=["admin-employees"])


@router.get("")
def list_employees(_: dict = Depends(require_admin)):
    items = employee_registry.list_all()
    result = []
    for emp in items:
        d = emp.model_dump(by_alias=True, mode="json")
        team = team_registry.get(emp.team_code) if emp.team_code else None
        d["teamName"] = team.name if team else None
        result.append(d)
    return ok(result)


@router.post("/{key}/enabled")
def toggle_enabled(key: str, body: dict, _: dict = Depends(require_admin)):
    validate_key(key, label="employeeKey")
    emp = employee_registry.get(key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    emp.enabled = body.get("enabled", not emp.enabled)
    saved = employee_registry.save(emp)
    return ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/{key}")
def delete_employee(key: str, _: dict = Depends(require_admin)):
    validate_key(key, label="employeeKey")
    deleted = employee_registry.delete(key)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    return ok(True)
