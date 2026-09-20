"""自我进化系统 API。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.common import ok as _ok, validate_key


def _validate_employee_key(employee_key: str) -> None:
    """在访问员工目录前拒绝路径穿越参数，错误返回 400。"""
    validate_key(employee_key, label="employee_key")


router = APIRouter(prefix="/api/v1/agentapp/evolution", tags=["evolution"])


@router.get("/insights/{employee_key}", dependencies=[Depends(_validate_employee_key)])
async def get_insights(employee_key: str):
    """GET /insights/{key}：列出某员工的全部进化建议。"""
    from app.services.evolution import list_insights
    items = list_insights(employee_key)
    return _ok([it.model_dump(by_alias=True, mode="json") for it in items])


@router.post("/analyze/{employee_key}", dependencies=[Depends(_validate_employee_key)])
async def trigger_analysis(employee_key: str):
    """POST /analyze/{key}：立即触发一次自我进化分析并返回运行日志。"""
    from app.services.evolution import run_evolution_analysis
    log = await run_evolution_analysis(employee_key)
    return _ok(log.model_dump(by_alias=True, mode="json"))


@router.post("/accept/{employee_key}/{insight_id}", dependencies=[Depends(_validate_employee_key)])
async def accept(employee_key: str, insight_id: str):
    """POST /accept/{key}/{id}：采纳一条建议并落地；不存在或已处理返 404。"""
    from app.services.evolution import accept_insight
    if not accept_insight(employee_key, insight_id):
        raise HTTPException(404, "Insight not found or already resolved")
    return _ok()


@router.post("/reject/{employee_key}/{insight_id}", dependencies=[Depends(_validate_employee_key)])
async def reject(employee_key: str, insight_id: str):
    """POST /reject/{key}/{id}：驳回一条建议；不存在或已处理返 404。"""
    from app.services.evolution import reject_insight
    if not reject_insight(employee_key, insight_id):
        raise HTTPException(404, "Insight not found or already resolved")
    return _ok()


@router.get("/run-logs/{employee_key}", dependencies=[Depends(_validate_employee_key)])
async def get_run_logs(employee_key: str):
    """GET /run-logs/{key}：列出某员工的进化运行日志。"""
    from app.services.evolution import list_run_logs
    logs = list_run_logs(employee_key)
    return _ok([lg.model_dump(by_alias=True, mode="json") for lg in logs])


@router.get("/overview")
async def overview():
    """GET /overview：汇总每个员工的建议数量（待处理/已采纳/已驳回/总计）。"""
    from app.dependencies import employee_registry
    from app.services.evolution import list_insights

    result = []
    for emp in employee_registry.list_all():
        k = emp.employee_key
        if not k:
            continue
        insights = list_insights(k)
        pending = sum(1 for i in insights if i.status == "pending")
        accepted = sum(1 for i in insights if i.status == "accepted")
        rejected = sum(1 for i in insights if i.status == "rejected")
        if insights:
            result.append({
                "employeeKey": k,
                "name": emp.name or k,
                "pending": pending,
                "accepted": accepted,
                "rejected": rejected,
                "total": len(insights),
            })
    return _ok(result)
