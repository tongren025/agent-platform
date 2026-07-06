"""注册表 API：技能/MCP/工具/员工/团队/角色模板的 CRUD + 员工知识库管理。Prefix: /api/v1/agentapp/registry。"""
from __future__ import annotations

import asyncio as _asyncio
import logging as _logging
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

_logger = _logging.getLogger(__name__)


# ── Skills ──────────────────────────────────────────────────────────

@router.get("/skills")
def list_skills():
    """GET /skills：列出全部技能定义。"""
    items = skill_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/skills/{code}")
def get_skill(code: str):
    """GET /skills/{code}：查单个技能，不存在返 404。"""
    _validate_key(code)
    item = skill_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Skill not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/skills")
def save_skill(body: SkillDefinition):
    """POST /skills：新建或整体覆盖一个技能定义。"""
    saved = skill_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/skills/{code}")
def delete_skill(code: str):
    """DELETE /skills/{code}：删除技能，不存在返 404。"""
    _validate_key(code)
    deleted = skill_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Skill not found: {code}")
    return _ok(True)


# ── MCP Servers ─────────────────────────────────────────────────────

@router.get("/mcp-servers")
def list_mcp_servers():
    """GET /mcp-servers：列出全部 MCP 服务器定义。"""
    items = mcp_server_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/mcp-servers/{code}")
def get_mcp_server(code: str):
    """GET /mcp-servers/{code}：查单个 MCP 服务器，不存在返 404。"""
    _validate_key(code)
    item = mcp_server_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"MCP server not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/mcp-servers")
def save_mcp_server(body: McpServerDefinition):
    """POST /mcp-servers：新建或整体覆盖一个 MCP 服务器定义。"""
    saved = mcp_server_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/mcp-servers/{code}")
def delete_mcp_server(code: str):
    """DELETE /mcp-servers/{code}：删除 MCP 服务器，不存在返 404。"""
    _validate_key(code)
    deleted = mcp_server_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"MCP server not found: {code}")
    return _ok(True)


# ── Tools ───────────────────────────────────────────────────────────

@router.get("/tools")
def list_tools():
    """GET /tools：列出全部工具定义。"""
    items = tool_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/tools/{code}")
def get_tool(code: str):
    """GET /tools/{code}：查单个工具，不存在返 404。"""
    _validate_key(code)
    item = tool_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Tool not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/tools")
def save_tool(body: ToolDefinition):
    """POST /tools：新建或整体覆盖一个工具定义。"""
    saved = tool_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/tools/{code}")
def delete_tool(code: str):
    """DELETE /tools/{code}：删除工具，不存在返 404。"""
    _validate_key(code)
    deleted = tool_registry.delete(code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tool not found: {code}")
    return _ok(True)


# ── Employees ───────────────────────────────────────────────────────

class EnabledBody(BaseModel):
    """启用/停用开关请求体。"""
    enabled: bool


class BindingsBody(BaseModel):
    """员工绑定更新请求体：技能/工具/MCP 引用列表（None 表示不改该项）。"""
    skill_refs: list[str] | None = None
    tool_refs: list[str] | None = None
    mcp_server_refs: list[str] | None = None


@router.get("/employees")
def list_employees():
    """GET /employees：列出全部数字员工。"""
    items = employee_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/employees/{key}")
def get_employee(key: str):
    """GET /employees/{key}：查单个员工，不存在返 404。"""
    _validate_key(key)
    item = employee_registry.get(key)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/employees")
def create_employee(body: EmployeeDefinition):
    """POST /employees：创建员工，key 已存在返 409。"""
    if employee_registry.exists(body.employee_key):
        raise HTTPException(
            status_code=409,
            detail=f"Employee already exists: {body.employee_key}",
        )
    saved = employee_registry.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/employees/{key}")
def update_employee(key: str, body: EmployeeDefinition):
    """PUT /employees/{key}：整体更新员工定义，不存在返 404。"""
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
    """DELETE /employees/{key}：删除员工，不存在返 404。"""
    _validate_key(key)
    deleted = employee_registry.delete(key)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    return _ok(True)


@router.post("/employees/{key}/clone")
def clone_employee(key: str, body: dict):
    """POST /employees/{key}/clone：以现有员工为模板克隆一个新员工（新 key + 新名字）。"""
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
    """POST /employees/{key}/enabled：启用/停用员工。"""
    _validate_key(key)
    emp = employee_registry.get(key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {key}")
    emp.enabled = body.enabled
    saved = employee_registry.save(emp)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/employees/{key}/bindings")
def update_employee_bindings(key: str, body: BindingsBody):
    """PUT /employees/{key}/bindings：更新员工的技能/工具/MCP 绑定（传了才改）。"""
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
    """套用角色模板请求体：目标员工 key 与名字。"""
    model_config = {"populate_by_name": True}
    employee_key: str = Field("", alias="employeeKey")
    employee_name: str = Field("", alias="employeeName")


@router.get("/role-templates")
def list_role_templates():
    """GET /role-templates：列出全部角色模板。"""
    items = role_template_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/role-templates/{code}")
def get_role_template(code: str):
    """GET /role-templates/{code}：查单个模板，不存在返 404。"""
    _validate_key(code)
    item = role_template_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Role template not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/role-templates")
def save_role_template(body: RoleTemplateDefinition):
    """POST /role-templates：新建或整体覆盖一个角色模板。"""
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
    """DELETE /role-templates/{code}：删除模板，不存在返 404。"""
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
    """POST /role-templates/{code}/apply：按模板一键创建员工（带建议技能/工具绑定），目标 key 已存在返 409。"""
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
    """团队成员更新请求体。"""
    model_config = {"populate_by_name": True}
    member_employee_keys: list[str] = Field(default_factory=list, alias="memberEmployeeKeys")


@router.get("/teams")
def list_teams():
    """GET /teams：列出全部团队。"""
    items = team_registry.list_all()
    return _ok([i.model_dump(by_alias=True, mode="json") for i in items])


@router.get("/teams/{code}")
def get_team(code: str):
    """GET /teams/{code}：查单个团队，不存在返 404。"""
    _validate_key(code)
    item = team_registry.get(code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {code}")
    return _ok(item.model_dump(by_alias=True, mode="json"))


@router.post("/teams")
def save_team(body: TeamDefinition):
    # 保留前端基本信息表单不涉及的结构化字段（roles / 默认工作流），
    # 否则在「编辑团队」里改个名字就会把阶段角色和工作流绑定冲掉。
    """POST /teams：新建或整体覆盖一个团队定义。"""
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
    """DELETE /teams/{code}：删除团队，不存在返 404。"""
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
    """PUT /teams/{code}/members：整体替换团队成员列表。"""
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

async def _vectorize_doc(key: str, doc_id: str, content_bytes: bytes) -> None:
    """M3 接线：上传后把文档切片向量化入库（后台任务）。

    semantic_retriever 未启用（JSON 模式 / 无 DASHSCOPE_API_KEY）或失败时静默跳过——
    向量化只是检索增强，绝不能影响上传主流程。
    """
    if semantic_retriever is None:
        return
    try:
        text = content_bytes.decode("utf-8", errors="replace")
        stored = await semantic_retriever.index_document(key, doc_id, text)
        if stored:
            _logger.info("知识文档已向量化: %s/%s (%d chunks)", key, doc_id, stored)
    except Exception:
        _logger.warning("知识文档向量化失败（不影响上传）: %s/%s", key, doc_id, exc_info=True)


def _drop_doc_vectors(key: str, doc_id: str) -> None:
    """M3 接线：删除文档时连带清掉其全部切片向量；失败只告警。"""
    if semantic_retriever is None:
        return
    try:
        semantic_retriever.remove_document(key, doc_id)
    except Exception:
        _logger.warning("清理文档向量失败: %s/%s", key, doc_id, exc_info=True)


@router.get("/employees/{key}/knowledge")
def list_knowledge_docs(key: str):
    """GET /employees/{key}/knowledge：列出员工知识库文档。"""
    _validate_key(key)
    docs = knowledge_store.list_docs(key)
    return _ok([d.model_dump(by_alias=True, mode="json") for d in docs])


@router.post("/employees/{key}/knowledge")
async def upload_knowledge_doc(key: str, file: UploadFile = File(...)):
    """POST /employees/{key}/knowledge：上传知识文档（扩展名/大小受配置约束），非法返 400；成功后后台向量化（M3）。"""
    _validate_key(key)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    content = await file.read()
    try:
        doc = knowledge_store.upload(key, file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    # 后台向量化，不阻塞上传响应
    _asyncio.create_task(_vectorize_doc(key, doc.doc_id, content))
    return _ok(doc.model_dump(by_alias=True, mode="json"))


@router.delete("/employees/{key}/knowledge/{doc_id}")
def delete_knowledge_doc(key: str, doc_id: str):
    """DELETE /employees/{key}/knowledge/{doc_id}：删除知识文档，不存在返 404；连带清向量（M3）。"""
    _validate_key(key)
    deleted = knowledge_store.delete_doc(key, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document not found: {doc_id}")
    _drop_doc_vectors(key, doc_id)
    return _ok(True)


from fastapi import Query as _Query


@router.get("/employees/{key}/knowledge/search")
async def search_knowledge(
    key: str,
    q: str = _Query(..., alias="q"),
    top_k: int = _Query(5, alias="topK"),
):
    """GET /employees/{key}/knowledge/search：知识库检索——配了向量检索走语义（M3），否则退化关键词。"""
    _validate_key(key)
    from app.services.vector_store import retrieve_knowledge
    results = await retrieve_knowledge(key, q, top_k=top_k)
    return _ok([r.model_dump(by_alias=True, mode="json") for r in results])


# ── Overview ────────────────────────────────────────────────────────

@router.get("/overview")
def get_overview():
    """GET /overview：各注册表的数量统计（首页总览卡片用）。"""
    return _ok({
        "skills": len(skill_registry.list_all()),
        "mcpServers": len(mcp_server_registry.list_all()),
        "tools": len(tool_registry.list_all()),
        "employees": len(employee_registry.list_all()),
        "teams": len(team_registry.list_all()),
        "roleTemplates": len(role_template_registry.list_all()),
    })
