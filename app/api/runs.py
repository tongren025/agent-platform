"""agent 运行记录 API —— 事后审计每次 run 的成本与行为。

单一职责：只读地列出 / 查看 run 记录，回答"这次 run 花了多少、走了哪条工具链、
为什么失败"。这是 L3 可观测闭环里"可查"的那一半。

Prefix: /api/v1/agentapp/agent  （与会话 API 同前缀，子路径 /runs）
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.api.common import ok as _ok
from app.core.rate_limit import get_usage
from app.dependencies import agent_run_store

router = APIRouter(prefix="/api/v1/agentapp/agent")


@router.get("/runs")
def list_runs(
    employeeKey: str | None = Query(None, alias="employeeKey"),
    sessionId: str | None = Query(None, alias="sessionId"),
    success: bool | None = Query(None, alias="success"),
    limit: int = Query(50, alias="limit"),
):
    """GET /runs：按员工/会话/成功与否过滤，列出运行记录（最多 limit 条）。"""
    runs = agent_run_store.list_runs(
        employee_key=employeeKey,
        session_id=sessionId,
        success=success,
        limit=limit,
    )
    return _ok([r.model_dump(by_alias=True, mode="json") for r in runs])


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    """GET /runs/{run_id}：查单条运行记录，不存在返回 404。"""
    record = agent_run_store.load_run(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Run not found: {run_id}")
    return _ok(record.model_dump(by_alias=True, mode="json"))


@router.get("/quota/{employee_key}")
def get_quota(employee_key: str):
    """GET /quota/{employee_key}：查该员工本月 token 用量与配额。"""
    return _ok(get_usage(employee_key))
