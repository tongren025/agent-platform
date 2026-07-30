"""agent 运行记录 API —— 事后审计每次 run 的成本与行为。

单一职责：只读地列出 / 查看 run 记录，回答"这次 run 花了多少、走了哪条工具链、
为什么失败"。这是 L3 可观测闭环里"可查"的那一半。

Prefix: /api/v1/agentapp/agent  （与会话 API 同前缀，子路径 /runs）
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, Query

from app.api.common import ok as _ok
from app.core.rate_limit import get_usage
from app.dependencies import agent_run_store
from app.models.run_record import AgentRunControlView
from app.runtime.run_control import active_run_control

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
def get_run(
    run_id: str = Path(..., pattern=r"^run_[A-Za-z0-9_-]{1,64}$"),
):
    """GET /runs/{run_id}：查单条运行记录，不存在返回 404。"""
    record = agent_run_store.load_run(run_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Run not found: {run_id}")
    return _ok(record.model_dump(by_alias=True, mode="json"))


@router.post("/runs/{run_id}/cancel")
def cancel_run(
    run_id: str = Path(..., pattern=r"^run_[A-Za-z0-9_-]{1,64}$"),
):
    """POST /runs/{id}/cancel：向当前进程内的运行发布幂等取消信号。"""
    active = active_run_control.request_cancel(run_id)
    if active is not None:
        view = AgentRunControlView(
            summary=f"已请求停止运行 {run_id}，将在当前模型或工具边界安全结束。",
            next_actions=[
                "等待当前请求返回“已停止当前运行”。",
                "若长时间无响应，可刷新运行记录确认最终状态。",
            ],
            artifacts=[run_id],
            run_id=run_id,
            state="cancelling",
        )
        return _ok(view.model_dump(by_alias=True, mode="json"))

    record = agent_run_store.load_run(run_id)
    if record is not None:
        final_state = (
            "cancelled"
            if record.error_message == "运行已由用户停止"
            else ("completed" if record.success else "failed")
        )
        view = AgentRunControlView(
            status="warning",
            summary=f"运行 {run_id} 已经结束，无需再次停止。",
            next_actions=["打开原运行记录查看最终结果。"],
            artifacts=[run_id],
            run_id=run_id,
            state=final_state,
        )
        return _ok(view.model_dump(by_alias=True, mode="json"))

    raise HTTPException(
        status_code=404,
        detail=(
            f"当前进程没有运行 {run_id}，历史记录中也未找到。"
            "请刷新页面取得当前 runId 后重试；若服务刚重启或记录仍不存在，"
            "说明旧运行已无法控制，请停止使用该 runId。"
        ),
    )


@router.get("/quota/{employee_key}")
def get_quota(employee_key: str):
    """GET /quota/{employee_key}：查该员工本月 token 用量与配额。"""
    return _ok(get_usage(employee_key))
