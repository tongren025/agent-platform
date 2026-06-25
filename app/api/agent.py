"""Agent 运行 API——核心的 run / team-run 端点。

AI Provider CRUD → ai_providers.py
Session CRUD → sessions.py
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.api.common import ok as _ok
from app.config import BASE_DIR, settings
from app.dependencies import employee_registry, memory_store, team_registry
from app.models.conversation import AgentRunRequest, AgentRunResponse
from app.services.invocation import run_invocation

router = APIRouter(prefix="/api/v1/agentapp/agent")

_UPLOAD_DIR = BASE_DIR / "data" / "uploads"
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
_MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"}
_TEXT_EXTS = {".txt", ".md", ".json", ".csv", ".xml", ".yaml", ".yml", ".py", ".js", ".ts", ".html", ".css"}

logger = logging.getLogger(__name__)


def _extract_description(role_profile: str | None) -> str:
    if not role_profile:
        return ""
    for line in role_profile.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            return stripped
    return ""


def _build_tags(emp) -> list[str]:
    tags: list[str] = []

    skill_count = len(emp.skill_refs) if emp.skill_refs else 0
    if skill_count > 0:
        tags.append(f"{skill_count} 技能")

    tool_count = len(emp.tool_refs) if emp.tool_refs else 0
    if tool_count > 0:
        tags.append(f"{tool_count} 工具")

    mcp_count = len(emp.mcp_server_refs) if emp.mcp_server_refs else 0
    if mcp_count > 0:
        tags.append(f"{mcp_count} MCP服务")

    if emp.deep_agent:
        tags.append("DeepAgent")

    if emp.has_knowledge_base:
        tags.append("知识库")

    return tags


class TeamRunBody(BaseModel):
    model_config = {"populate_by_name": True}
    team_code: str = Field("", alias="teamCode")
    user_input: str = Field("", alias="userInput")
    session_id: str | None = Field(None, alias="sessionId")
    extra_context: str | None = Field(None, alias="extraContext")


# ── 员工列表（带计算标签）──────────────────────────────────────────


@router.get("/employees")
def list_agent_employees():
    employees = employee_registry.list_all()
    result = []
    for emp in employees:
        data = emp.model_dump(by_alias=True, mode="json")
        data["computedTags"] = _build_tags(emp)
        data["computedDescription"] = _extract_description(emp.role_profile)
        result.append(data)
    return _ok(result)


# ── 文件上传（聊天附件）──────────────────────────────────────────


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > _MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="文件不能超过 10 MB")
    ext = Path(file.filename or "").suffix.lower()
    file_id = uuid.uuid4().hex[:12]
    saved_name = f"{file_id}{ext}"
    saved_path = _UPLOAD_DIR / saved_name
    saved_path.write_bytes(data)

    is_image = ext in _IMAGE_EXTS
    is_text = ext in _TEXT_EXTS
    text_content = ""
    if is_text:
        try:
            text_content = data.decode("utf-8", errors="replace")[:20000]
        except Exception:
            pass

    return _ok({
        "fileId": file_id,
        "fileName": file.filename,
        "fileSize": len(data),
        "ext": ext,
        "isImage": is_image,
        "isText": is_text,
        "textContent": text_content,
        "url": f"/uploads/{saved_name}",
    })


# ── Agent Run ──────────────────────────────────────────────────────


@router.post("/run")
async def run_agent_endpoint(body: AgentRunRequest):
    timeout = settings.agent.run_timeout_seconds

    try:
        agent_result = await asyncio.wait_for(
            run_invocation(body),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Agent run timed out after {timeout}s",
        )
    except Exception as exc:
        logger.exception("Agent run failed for employee=%s", body.employee_key)
        raise HTTPException(
            status_code=500,
            detail=f"Agent run failed: {exc}",
        )

    response = AgentRunResponse(
        assistant_message=agent_result.assistant_message,
        token_usage=agent_result.token_usage,
        traces=agent_result.traces,
        active_scopes=agent_result.active_scopes,
        auto_invoke_count=agent_result.auto_invoke_count,
        session_id=agent_result.session_id,
        pending_approval=agent_result.pending_approval,
        delegation_stack=agent_result.delegation_stack,
    )
    return _ok(response.model_dump(by_alias=True, mode="json"))


# ── Team Run ──────────────────────────────────────────────────────


def _team_context(team_code: str, user_input: str, extra_context: str | None = None) -> tuple[str, str, dict]:
    team = team_registry.get(team_code)
    if team is None:
        raise HTTPException(status_code=404, detail=f"Team not found: {team_code}")

    leader_key = (
        team.leader_employee_key
        or team.default_employee_key
        or (team.member_employee_keys[0] if team.member_employee_keys else "")
    )
    if not leader_key:
        raise HTTPException(status_code=400, detail=f"Team has no leader/member: {team_code}")
    leader = employee_registry.get(leader_key)
    if leader is None:
        raise HTTPException(status_code=404, detail=f"Team leader not found: {leader_key}")

    members = []
    mentioned = []
    lower_input = user_input.lower()
    for key in team.member_employee_keys:
        emp = employee_registry.get(key)
        if emp is None:
            continue
        role = next((r for r in (team.roles or []) if r.employee_key == key), None)
        members.append({
            "employeeKey": key,
            "name": emp.name,
            "stage": role.stage if role else "",
            "order": role.order if role else 0,
            "isLeader": key == leader_key,
        })
        if f"@{key.lower()}" in lower_input or f"@{emp.name.lower()}" in lower_input:
            mentioned.append(key)

    context = {
        "__team_chat": True,
        "__team_code": team.team_code,
        "__team_name": team.name,
        "__team_description": team.description or "",
        "__leader_employee_key": leader_key,
        "__default_workflow_key": team.default_workflow_key or "",
        "__mentioned_members": mentioned,
        "__team_members": members,
        "__team_chat_instructions": (
            "你正在代表整个团队回复用户。优先由团队负责人统筹；"
            "如果用户 @某个成员，必须显式考虑该成员职责，并可调用 delegate_to_employee 委派。"
            "回复要汇总团队结论，而不是只像单个员工独白。"
        ),
    }
    if extra_context:
        context["__user_extra_context"] = extra_context
    return leader_key, team.name, context


@router.post("/team-run")
async def run_team_endpoint(body: TeamRunBody):
    team_code = body.team_code
    user_input = body.user_input
    session_id = body.session_id
    extra_context = body.extra_context
    if not team_code:
        raise HTTPException(status_code=400, detail="teamCode is required")
    if not user_input.strip():
        raise HTTPException(status_code=400, detail="userInput is required")

    leader_key, team_name, context = _team_context(team_code, user_input, extra_context)
    request = AgentRunRequest(
        employeeKey=leader_key,
        userInput=user_input,
        sessionId=session_id,
        extraContext=json.dumps(context, ensure_ascii=False),
    )
    response = await run_agent_endpoint(request)
    data = response["data"]
    sid = data.get("sessionId")
    if sid:
        session = memory_store.load_session(sid)
        if session is not None:
            session.target_type = "team"
            session.team_code = team_code
            session.employee_key = leader_key
            session.metadata["teamName"] = team_name
            session.metadata["leaderEmployeeKey"] = leader_key
            memory_store.save_session(session)
    return response
