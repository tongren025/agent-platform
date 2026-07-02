from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from app.api.common import ok as _ok, validate_key as _validate_key
from app.dependencies import (
    employee_registry,
    knowledge_retriever,
    knowledge_store,
    mcp_server_registry,
    role_template_registry,
    semantic_retriever,
    skill_registry,
    team_registry,
    tool_registry,
)
from app.models.registry import (
    EmployeeDefinition,
    McpServerDefinition,
    RoleTemplateDefinition,
    SkillDefinition,
    TeamDefinition,
    ToolDefinition,
)

router = APIRouter(prefix="/api/v1/agentapp/registry")


# ── Skills ──────────────────────────────────────────────────────────

@router.get("/skills")
def list_skills():
    items = skill_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/skills/{code}")
def get_skill(code: str):
    _validate_key(code)
    item = skill_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Skill not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/skills")
def save_skill(body: SkillDefinition):
    saved = skill_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/skills/{code}")
def delete_skill(code: str):
    _validate_key(code)
    deleted = skill_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Skill not found: {code}")
    return _ok(True)


# ── MCP Servers ─────────────────────────────────────────────────────

@router.get("/mcp-servers")
def list_mcp_servers():
    items = mcp_server_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/mcp-servers/{code}")
def get_mcp_server(code: str):
    _validate_key(code)
    item = mcp_server_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"MCP server not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/mcp-servers")
def save_mcp_server(body: McpServerDefinition):
    saved = mcp_server_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/mcp-servers/{code}")
def delete_mcp_server(code: str):
    _validate_key(code)
    deleted = mcp_server_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"MCP server not found: {code}")
    return _ok(True)


# ── Tools ───────────────────────────────────────────────────────────

@router.get("/tools")
def list_tools():
    items = tool_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/tools/{code}")
def get_tool(code: str):
    _validate_key(code)
    item = tool_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Tool not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/tools")
def save_tool(body: ToolDefinition):
    saved = tool_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/tools/{code}")
def delete_tool(code: str):
    _validate_key(code)
    deleted = tool_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tool not found: {code}")
    return _ok(True)


# ── Employees ───────────────────────────────────────────────────────

class EnabledBody(BaseModel):
    enabled: bool


class BindingsBody(BaseModel):
    skill_refs: list[str] | None = None
    tool_refs: list[str] | None = None
    mcp_server_refs: list[str] | None = None


@router.get("/employees")
def list_employees():
    items = employee_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/employees/{key}")
def get_employee(key: str):
    _validate_key(key)
    item = employee_registry.get(key)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/employees")
def create_employee(body: EmployeeDefinition):
    if employee_registry.exists(body.employee_key):
        raise HTTPException(
            status_code=409,
            detail=f"Employee already exists: {body.employee_key}",
        )
    saved = employee_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/employees/{key}")
def update_employee(key: str, body: EmployeeDefinition):
    _validate_key(key)
    existing = employee_registry.get(key)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    body.created_at = existing.created_at
    body.employee_key = key
    saved = employee_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/employees/{key}")
def delete_employee(key: str):
    _validate_key(key)
    deleted = employee_registry.delete(key)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    return _ok(True)


@router.post("/employees/{key}/clone")
def clone_employee(key: str, body: dict):
    _validate_key(key)
    source = employee_registry.get(key)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")

    new_key = body.get("employeeKey") or body.get("employee_key", "")
    new_name = body.get("employeeName") or body.get("employee_name", "")
    if not new_key:
        raise HTTPException(status_code=400, detail="employeeKey is required")
    _validate_key(new_key)
    if employee_registry.exists(new_key):
        raise HTTPException(status_code=409, detail=f"Employee already exists: {new_key}")

    cloned_data = source.model_dump(by_alias=True, mode="json")
    cloned = EmployeeDefinition.model_validate(cloned_data)
    cloned.employee_key = new_key
    cloned.name = new_name or f"{source.name} (copy)"
    cloned.source = "user"
    now = datetime.now(timezone.utc)
    cloned.created_at = now
    cloned.updated_at = now

    saved = employee_registry.save(cloned)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.post("/employees/{key}/enabled")
def toggle_employee_enabled(key: str, body: EnabledBody):
    _validate_key(key)
    emp = employee_registry.get(key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    emp.enabled = body.enabled
    saved = employee_registry.save(emp)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/employees/{key}/bindings")
def update_employee_bindings(key: str, body: BindingsBody):
    _validate_key(key)
    emp = employee_registry.get(key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")

    if body.skill_refs:
        existing = set(emp.skill_refs or [])
        emp.skill_refs = list(existing | set(body.skill_refs))
    if body.tool_refs:
        existing = set(emp.tool_refs or [])
        emp.tool_refs = list(existing | set(body.tool_refs))
    if body.mcp_server_refs:
        existing = set(emp.mcp_server_refs or [])
        emp.mcp_server_refs = list(existing | set(body.mcp_server_refs))

    saved = employee_registry.save(emp)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


# ── Role Templates ──────────────────────────────────────────────────

class ApplyTemplateBody(BaseModel):
    model_config = {"populate_by_name": True}
    employee_key: str = Field("", alias="employeeKey")
    employee_name: str = Field("", alias="employeeName")


@router.get("/role-templates")
def list_role_templates():
    items = role_template_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/role-templates/{code}")
def get_role_template(code: str):
    _validate_key(code)
    item = role_template_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Role template not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/role-templates")
def save_role_template(body: RoleTemplateDefinition):
    existing = role_template_registry.get(body.template_code)
    if existing is not None and existing.source == "system":
        raise HTTPException(
            status_code=403,
            detail=f"Cannot overwrite system template: {body.template_code}",
        )
    saved = role_template_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/role-templates/{code}")
def delete_role_template(code: str):
    _validate_key(code)
    existing = role_template_registry.get(code)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Role template not found: {code}")
    if existing.source == "system":
        raise HTTPException(
            status_code=403,
            detail=f"Cannot delete system template: {code}",
        )
    role_template_registry.delete(code)
    return _ok(True)


@router.post("/role-templates/{code}/apply")
def apply_role_template(code: str, body: ApplyTemplateBody):
    _validate_key(code)
    emp_key = body.employee_key
    emp_name = body.employee_name
    if not emp_key:
        raise HTTPException(status_code=400, detail="employeeKey is required")
    _validate_key(emp_key)
    if employee_registry.exists(emp_key):
        raise HTTPException(
            status_code=409,
            detail=f"Employee already exists: {emp_key}",
        )
    emp = role_template_registry.apply_to_new_employee(code, emp_key, emp_name)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Role template not found: {code}")
    return _ok(emp.model_dump(by_alias=True, mode="json"))


# ── Teams ───────────────────────────────────────────────────────────

class TeamMembersBody(BaseModel):
    model_config = {"populate_by_name": True}
    member_employee_keys: list[str] = Field(default_factory=list, alias="memberEmployeeKeys")


@router.get("/teams")
def list_teams():
    items = team_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/teams/{code}")
def get_team(code: str):
    _validate_key(code)
    item = team_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/teams")
def save_team(body: TeamDefinition):
    # 保留前端基本信息表单不涉及的结构化字段（roles / 默认工作流），
    # 否则在「编辑团队」里改个名字就会把阶段角色和工作流绑定冲掉。
    existing = team_registry.get(body.team_code)
    if existing is not None:
        if body.roles is None:
            body.roles = existing.roles
        if body.default_workflow_key is None:
            body.default_workflow_key = existing.default_workflow_key
    saved = team_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/teams/{code}")
def delete_team(code: str):
    _validate_key(code)
    for emp in employee_registry.list_all():
        if emp.team_code == code:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot delete team '{code}': employee '{emp.employee_key}' still references it.",
            )
    deleted = team_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Team not found: {code}")
    return _ok(True)


@router.put("/teams/{code}/members")
def update_team_members(code: str, body: TeamMembersBody):
    _validate_key(code)
    team = team_registry.get(code)
    if team is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {code}")

    member_keys = body.member_employee_keys
    for mk in member_keys:
        if not employee_registry.exists(mk):
            raise HTTPException(
                status_code=400,
                detail=f"Employee not found: {mk}",
            )

    team.member_employee_keys = member_keys
    saved = team_registry.save(team)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


# ── Knowledge ───────────────────────────────────────────────────────

@router.get("/employees/{key}/knowledge")
def list_knowledge_docs(key: str):
    _validate_key(key)
    docs = knowledge_store.list_docs(key)
    return _ok([d.model_dump(by_alias=True, mode="json") for d in docs])


@router.post("/employees/{key}/knowledge")
async def upload_knowledge_doc(key: str, file: UploadFile = File(...)):
    _validate_key(key)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    content = await file.read()
    try:
        doc = knowledge_store.upload(key, file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _ok(doc.model_dump(by_alias=True, mode="json"))


@router.delete("/employees/{key}/knowledge/{doc_id}")
def delete_knowledge_doc(key: str, doc_id: str):
    _validate_key(key)
    deleted = knowledge_store.delete_doc(key, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document not found: {doc_id}")
    return _ok(True)


from fastapi import Query as _Query


@router.get("/employees/{key}/knowledge/search")
async def search_knowledge(
    key: str,
    q: str = _Query(..., alias="q"),
    top_k: int = _Query(5, alias="topK"),
):
    _validate_key(key)
    if semantic_retriever is not None:
        results = await semantic_retriever.search(key, q, top_k=top_k, source_type="knowledge")
        if results:
            return _ok([r.model_dump(by_alias=True, mode="json") for r in results])
    results = knowledge_retriever.search(key, q, top_k=top_k)
    return _ok([r.model_dump(by_alias=True, mode="json") for r in results])


# ── Overview ────────────────────────────────────────────────────────

@router.get("/overview")
def get_overview():
    return _ok({
        "skills": len(skill_registry.list_all()),
        "mcpServers": len(mcp_server_registry.list_all()),
        "tools": len(tool_registry.list_all()),
        "employees": len(employee_registry.list_all()),
        "teams": len(team_registry.list_all()),
        "roleTemplates": len(role_template_registry.list_all()),
    })
