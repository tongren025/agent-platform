"""Agent 运行 API——核心的 run / team-run 端点。

AI Provider CRUD → ai_providers.py
Session CRUD → sessions.py
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field
from starlette.responses import StreamingResponse

from app.api.common import ok as _ok
from app.config import BASE_DIR, settings
from app.core.rate_limit import check_quota, limiter
from app.dependencies import agent_run_store, employee_registry, memory_store, team_registry
from app.models.conversation import AgentRunRequest, AgentRunResponse
from app.models.run_record import generate_run_id
from app.runtime.run_control import ActiveRunConflictError, active_run_control
from app.services.invocation import run_invocation

router = APIRouter(prefix="/api/v1/agentapp/agent")

_UPLOAD_DIR = BASE_DIR / "data" / "uploads"
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
_MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"}
_TEXT_EXTS = {".txt", ".md", ".json", ".csv", ".xml", ".yaml", ".yml", ".py", ".js", ".ts", ".html", ".css"}

logger = logging.getLogger(__name__)


def _extract_description(role_profile: str | None) -> str:
    """从员工角色画像文本中提取第一行非标题内容，作为员工的简介展示。"""
    if not role_profile:
        return ""
    for line in role_profile.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            return stripped
    return ""


def _build_tags(emp) -> list[str]:
    """根据员工绑定的技能/工具/MCP/知识库等配置，生成前端展示用的标签列表。"""
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
    """POST /team-run 的请求体：指定团队编码与用户输入，可携带会话 ID 与额外上下文。"""
    model_config = {"populate_by_name": True}
    team_code: str = Field("", alias="teamCode")
    user_input: str = Field("", alias="userInput")
    session_id: str | None = Field(None, alias="sessionId")
    extra_context: str | None = Field(None, alias="extraContext")
    run_id: str | None = Field(
        None,
        alias="runId",
        pattern=r"^run_[A-Za-z0-9_-]{1,64}$",
    )


# ── 员工列表（带计算标签）──────────────────────────────────────────


@router.get("/employees")
def list_agent_employees():
    """GET /employees：返回全部数字员工列表，附带计算出的标签与简介（computedTags/computedDescription）。"""
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
    """POST /upload：上传聊天附件（≤10MB），保存到 data/uploads 并返回文件元信息；文本类文件顺带返回前 20000 字符内容，超限返 413。"""
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


async def _execute_agent_run(
    body: AgentRunRequest,
    *,
    on_text_delta=None,
) -> dict:
    """登记并执行一次可取消运行；控制状态只驻留当前进程。"""
    quotas = getattr(settings, "quotas", {})
    if quotas:
        allowed, reason = check_quota(body.employee_key, quotas)
        if not allowed:
            raise HTTPException(status_code=429, detail=reason)

    run_id = body.run_id or generate_run_id()
    body.run_id = run_id
    if agent_run_store.load_run(run_id) is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                f"运行 ID 已有历史结果：{run_id}。请生成新的 runId 后重试；"
                "若这是重复提交，请停止重试并查看原运行记录。"
            ),
        )
    try:
        active_run_control.register(
            run_id,
            employee_key=body.employee_key,
            session_id=body.session_id,
        )
    except ActiveRunConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail=(
                f"{exc}。请等待当前运行结束或调用取消接口；"
                "状态未变化前请停止重复提交同一 runId。"
            ),
        ) from exc

    timeout = settings.agent.run_timeout_seconds

    try:
        invocation = (
            run_invocation(body, on_text_delta=on_text_delta)
            if on_text_delta is not None
            else run_invocation(body)
        )
        agent_result = await asyncio.wait_for(
            invocation,
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
    finally:
        active_run_control.finish(run_id)

    response = AgentRunResponse(
        run_id=run_id,
        assistant_message=agent_result.assistant_message,
        cancelled=agent_result.cancelled,
        error_message=agent_result.error_message,
        token_usage=agent_result.token_usage,
        traces=agent_result.traces,
        active_scopes=agent_result.active_scopes,
        auto_invoke_count=agent_result.auto_invoke_count,
        session_id=agent_result.session_id,
        pending_approval=agent_result.pending_approval,
        delegation_stack=agent_result.delegation_stack,
        model_transport=agent_result.transport,
    )
    return _ok(response.model_dump(by_alias=True, mode="json"))


@router.post("/run")
@limiter.limit("20/minute")
async def run_agent_endpoint(request: Request, body: AgentRunRequest):
    """POST /run：执行可取消的同步运行；客户端可预生成 runId 并从另一请求停止。"""
    return await _execute_agent_run(body)


def _ndjson(event: str, data: dict) -> bytes:
    """编码一条浏览器可增量解析的 NDJSON 事件。"""
    return (
        json.dumps({"event": event, "data": data}, ensure_ascii=False)
        + "\n"
    ).encode("utf-8")


def _stream_agent_events(
    request: Request,
    body: AgentRunRequest,
    *,
    finalize=None,
):
    """把统一 AgentRun 执行桥接成 NDJSON；断连时取消后台运行。"""
    run_id = body.run_id or generate_run_id()
    body.run_id = run_id

    async def events():
        queue: asyncio.Queue[tuple[str, dict]] = asyncio.Queue(maxsize=128)

        async def on_text_delta(delta: str, text: str) -> None:
            await queue.put(("content", {"delta": delta, "text": text}))

        async def execute() -> None:
            try:
                envelope = await _execute_agent_run(
                    body,
                    on_text_delta=on_text_delta,
                )
                data = envelope["data"]
                if finalize is not None:
                    finalize(data)
                await queue.put(("result", data))
            except HTTPException as exc:
                await queue.put(("error", {
                    "message": str(exc.detail),
                    "status": exc.status_code,
                }))
            except Exception as exc:
                logger.exception("Streaming agent run failed run=%s", run_id)
                await queue.put(("error", {"message": str(exc)}))
            finally:
                await queue.put(("done", {"reason": "finished"}))

        task = asyncio.create_task(execute())
        yield _ndjson("initial", {"runId": run_id})
        try:
            while True:
                try:
                    event, data = await asyncio.wait_for(queue.get(), timeout=0.5)
                except asyncio.TimeoutError:
                    if await request.is_disconnected():
                        active_run_control.request_cancel(run_id)
                        task.cancel()
                        break
                    continue
                yield _ndjson(event, data)
                if event == "done":
                    break
        finally:
            if not task.done():
                active_run_control.request_cancel(run_id)
                task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/run-stream")
@limiter.limit("20/minute")
async def run_agent_stream_endpoint(request: Request, body: AgentRunRequest):
    """POST /run-stream：逐字返回模型内容，末尾发送完整 AgentRunResponse。"""
    return _stream_agent_events(request, body)


# ── Team Run ──────────────────────────────────────────────────────


def _team_context(team_code: str, user_input: str, extra_context: str | None = None) -> tuple[str, str, dict]:
    """构建团队对话上下文：解析团队 leader、成员列表与 @提及，返回 (leader_key, 团队名, 注入 context)；团队/负责人缺失时抛 404/400。"""
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
@limiter.limit("20/minute")
async def run_team_endpoint(request: Request, body: TeamRunBody):
    """POST /team-run：以团队 leader 身份执行一次团队对话（复用 /run），并把会话标记为 team 类型；参数缺失返 400。"""
    team_code = body.team_code
    user_input = body.user_input
    session_id = body.session_id
    extra_context = body.extra_context
    if not team_code:
        raise HTTPException(status_code=400, detail="teamCode is required")
    if not user_input.strip():
        raise HTTPException(status_code=400, detail="userInput is required")

    leader_key, team_name, context = _team_context(team_code, user_input, extra_context)
    agent_request = AgentRunRequest(
        employeeKey=leader_key,
        userInput=user_input,
        sessionId=session_id,
        extraContext=json.dumps(context, ensure_ascii=False),
        runId=body.run_id,
    )
    response = await _execute_agent_run(agent_request)
    data = response["data"]
    _mark_team_session(data, team_code, team_name, leader_key)
    return response


def _mark_team_session(
    data: dict,
    team_code: str,
    team_name: str,
    leader_key: str,
) -> None:
    """把统一 Agent 结果对应的会话标为团队会话。"""
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


@router.post("/team-run-stream")
@limiter.limit("20/minute")
async def run_team_stream_endpoint(request: Request, body: TeamRunBody):
    """POST /team-run-stream：团队负责人流式回复并保留团队会话标记。"""
    if not body.team_code:
        raise HTTPException(status_code=400, detail="teamCode is required")
    if not body.user_input.strip():
        raise HTTPException(status_code=400, detail="userInput is required")
    leader_key, team_name, context = _team_context(
        body.team_code,
        body.user_input,
        body.extra_context,
    )
    agent_request = AgentRunRequest(
        employeeKey=leader_key,
        userInput=body.user_input,
        sessionId=body.session_id,
        extraContext=json.dumps(context, ensure_ascii=False),
        runId=body.run_id,
    )
    return _stream_agent_events(
        request,
        agent_request,
        finalize=lambda data: _mark_team_session(
            data,
            body.team_code,
            team_name,
            leader_key,
        ),
    )
