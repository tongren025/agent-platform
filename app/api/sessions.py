"""会话管理 API。

从 agent.py 拆出——单一职责：对话会话的列表 / 查看 / 归档 / 删除。

Prefix: /api/v1/agentapp/agent  （保持前端路由不变）
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.api.common import ok as _ok
from app.dependencies import memory_store

router = APIRouter(prefix="/api/v1/agentapp/agent")


class ArchiveSessionBody(BaseModel):
    """归档/取消归档会话接口的请求体：archived=True 归档，False 恢复。"""
    archived: bool = True


@router.get("/sessions")
def list_sessions(
    employeeKey: str | None = Query(None, alias="employeeKey"),
    teamCode: str | None = Query(None, alias="teamCode"),
    targetType: str | None = Query(None, alias="targetType"),
    includeArchived: bool = Query(False, alias="includeArchived"),
    limit: int = Query(20, alias="limit"),
):
    """GET /sessions：按员工/团队/目标类型过滤列出会话，默认排除已归档，取最近 limit 条。"""
    sessions = memory_store.list_sessions(
        employee_key=employeeKey,
        team_code=teamCode,
        target_type=targetType,
        include_archived=includeArchived,
        limit=limit,
    )
    return _ok([
        s.model_dump(by_alias=True, mode="json") for s in sessions
    ])


@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    """GET /sessions/{id}：查单个会话详情，不存在返 404。"""
    session = memory_store.load_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    return _ok(session.model_dump(by_alias=True, mode="json"))


@router.post("/sessions/{session_id}/archive")
def archive_session(session_id: str, body: ArchiveSessionBody):
    """POST /sessions/{id}/archive：归档或取消归档一个会话。"""
    session = memory_store.load_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    session.archived = body.archived
    memory_store.save_session(session)
    return _ok(session.model_dump(by_alias=True, mode="json"))


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    """DELETE /sessions/{id}：删除会话，不存在返 404。"""
    deleted = memory_store.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    return _ok(True)
