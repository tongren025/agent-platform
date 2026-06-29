"""管理端系统总览——复用用户端 app 的 registry 数据，只读聚合。"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.common import ok
from app.dependencies import (
    employee_registry,
    mcp_server_registry,
    role_template_registry,
    skill_registry,
    team_registry,
    tool_registry,
    workflow_registry,
)
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/system", tags=["admin-system"])


@router.get("/overview")
def overview(_: dict = Depends(require_admin)):
    employees = employee_registry.list_all()
    enabled = sum(1 for e in employees if getattr(e, "enabled", True))
    return ok({
        "employees": len(employees),
        "employeesEnabled": enabled,
        "employeesDisabled": len(employees) - enabled,
        "teams": len(team_registry.list_all()),
        "workflows": len(workflow_registry.list_all()),
        "tools": len(tool_registry.list_all()),
        "skills": len(skill_registry.list_all()),
        "mcpServers": len(mcp_server_registry.list_all()),
        "roleTemplates": len(role_template_registry.list_all()),
    })
