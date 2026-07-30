"""系统管家 API：页面指导、系统诊断和二次确认式 Skill/MCP 管理。"""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile
from pydantic import BaseModel, Field

from app.api.common import ok
from app.dependencies import mcp_server_registry, system_manager
from app.models.runtime import RuntimeMcpServer
from app.runtime.mcp import McpConnectionTimeoutError, probe_mcp_server
from app.services.mcp_oauth import mcp_oauth_coordinator


router = APIRouter(prefix="/api/v1/agentapp/system-manager", tags=["system-manager"])


class ManagerChatBody(BaseModel):
    """系统管家对话请求，pagePath 用于提供当前页面指导。"""

    model_config = {"populate_by_name": True}
    message: str = Field(..., min_length=1, max_length=8000)
    page_path: str = Field("/", alias="pagePath", max_length=500)
    session_id: str | None = Field(None, alias="sessionId", max_length=120)


class ConfirmActionBody(BaseModel):
    """确认一次系统变更；proposalId 是管家预览阶段签发的一次性标识。"""

    model_config = {"populate_by_name": True}
    proposal_id: str = Field(..., alias="proposalId", min_length=10, max_length=200)


class OAuthStartBody(BaseModel):
    """MCP OAuth 开始请求。"""

    model_config = {"populate_by_name": True}
    redirect_uri: str = Field(..., alias="redirectUri", min_length=10, max_length=1000)


class OAuthCallbackBody(BaseModel):
    """浏览器 OAuth 回调参数。"""

    state: str = Field(..., min_length=8, max_length=1000)
    code: str = Field(..., min_length=1, max_length=4000)


@router.get("/context")
def get_context(page_path: str = Query("/", alias="pagePath", max_length=500)):
    """获取当前页面说明与系统资源健康摘要。"""
    return ok(system_manager.context(page_path))


@router.post("/chat")
def chat(body: ManagerChatBody, request: Request):
    """与系统管家对话；写操作只生成待确认提案。"""
    try:
        result = system_manager.chat(
            body.message,
            body.page_path,
            owner=str(getattr(request.state, "username", "") or "local"),
            session_id=body.session_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"系统管家检查失败：{exc}") from exc
    return ok(result)


@router.post("/actions/confirm")
def confirm_action(body: ConfirmActionBody, request: Request):
    """确认并执行管家给出的单次变更提案。"""
    try:
        result = system_manager.confirm(
            body.proposal_id,
            owner=str(getattr(request.state, "username", "") or "local"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok(result)


@router.get("/sessions/{session_id}")
def get_manager_session(session_id: str, request: Request):
    """读取当前登录用户自己的系统管家历史对话。"""
    try:
        result = system_manager.get_session(
            str(getattr(request.state, "username", "") or "local"),
            session_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ok(result)


@router.post("/changes/{change_id}/rollback")
def propose_rollback(change_id: str, request: Request):
    """为历史变更生成回滚预览；仍需再调用确认端点。"""
    try:
        result = system_manager.propose_rollback(
            change_id,
            owner=str(getattr(request.state, "username", "") or "local"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok(result)


@router.post("/skills/import")
async def import_skill_zip(request: Request, file: UploadFile = File(...)):
    """上传并检查 Skill ZIP；只生成安装/更新提案，不立即写入技能目录。"""
    archive = await file.read()
    try:
        result = system_manager.preview_uploaded_skill(
            file.filename or "skill.zip",
            archive,
            owner=str(getattr(request.state, "username", "") or "local"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok(result)


@router.post("/mcp/{server_code}/test")
async def test_mcp(server_code: str):
    """真实连接 MCP 并列出工具，用于验证服务器配置及登录是否有效。"""
    item = mcp_server_registry.get(server_code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"MCP 不存在：{server_code}")
    runtime = RuntimeMcpServer(
        server_code=item.server_code,
        binding_code=item.server_code,
        name=item.name,
        description=item.description,
        transport_type=item.transport_type,
        command=item.command,
        command_args=item.command_args,
        url=item.url,
        env=item.env,
        headers=item.headers,
        auth_type=item.auth_type,
        oauth_scope=item.oauth_scope,
    )
    try:
        specs = await probe_mcp_server(runtime)
    except McpConnectionTimeoutError as exc:
        system_manager.record_mcp_health(
            server_code,
            status="timeout",
            error=str(exc),
        )
        raise HTTPException(
            status_code=504,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        system_manager.record_mcp_health(
            server_code,
            status="error",
            error=str(exc),
        )
        raise HTTPException(
            status_code=502,
            detail=f"MCP 连接或登录验证失败：{exc}",
        ) from exc
    tool_names = [spec.original_name for spec in specs]
    system_manager.record_mcp_health(
        server_code,
        status="connected",
        tool_names=tool_names,
    )
    return ok({
        "serverCode": server_code,
        "status": "connected",
        "toolCount": len(specs),
        "tools": [
            {"name": spec.original_name, "description": spec.description}
            for spec in specs
        ],
    })


@router.post("/mcp/{server_code}/oauth/start")
async def start_mcp_oauth(server_code: str, body: OAuthStartBody, request: Request):
    """启动标准 MCP OAuth，返回授权服务器生成的浏览器地址。"""
    item = mcp_server_registry.get(server_code)
    if item is None:
        raise HTTPException(status_code=404, detail=f"MCP 不存在：{server_code}")
    from urllib.parse import urlparse

    redirect = urlparse(body.redirect_uri)
    request_host = request.url.hostname
    if redirect.hostname not in {request_host, "localhost", "127.0.0.1"}:
        raise HTTPException(status_code=400, detail="OAuth 回调地址必须属于当前 Agent Studio")
    runtime = RuntimeMcpServer(
        server_code=item.server_code,
        binding_code=item.server_code,
        name=item.name,
        description=item.description,
        transport_type=item.transport_type,
        command=item.command,
        command_args=item.command_args,
        url=item.url,
        env=item.env,
        headers=item.headers,
        auth_type=item.auth_type,
        oauth_scope=item.oauth_scope,
    )
    try:
        result = await mcp_oauth_coordinator.start(runtime, body.redirect_uri)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"无法启动 MCP OAuth：{exc}") from exc
    return ok(result)


@router.post("/mcp/oauth/callback")
async def complete_mcp_oauth(body: OAuthCallbackBody):
    """完成 OAuth code 交换，并立即真实验证 MCP 工具发现。"""
    try:
        result = await mcp_oauth_coordinator.complete(body.state, body.code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"MCP OAuth 登录失败：{exc}") from exc
    system_manager.record_mcp_health(
        result["serverCode"],
        status="connected",
        tool_names=result["tools"],
    )
    return ok(result)


@router.delete("/mcp/{server_code}/oauth")
def logout_mcp_oauth(server_code: str):
    """清除本机加密保存的 MCP OAuth 令牌。"""
    if mcp_server_registry.get(server_code) is None:
        raise HTTPException(status_code=404, detail=f"MCP 不存在：{server_code}")
    mcp_oauth_coordinator.clear_tokens(server_code)
    return ok({"serverCode": server_code, "status": "logged_out"})
