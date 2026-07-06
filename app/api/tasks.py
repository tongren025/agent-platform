"""M4 异步任务 API —— 入队 + 状态查询。

POST /tasks/agent-run   入队一次 agent 运行，立即返回 job_id
GET  /tasks/{job_id}    查询任务状态 / 结果
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.common import ok as _ok
from app.core.rate_limit import limiter
from app.models.conversation import AgentRunRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agentapp/tasks")


class EnqueueResponse(BaseModel):
    """POST /agent-run 的响应体：入队成功后返回的 job_id 与初始状态。"""
    job_id: str
    status: str = "queued"


@router.post("/agent-run")
@limiter.limit("10/minute")
async def enqueue_agent_run(request: Request, body: AgentRunRequest):
    """POST /agent-run：入队一次 agent 运行并返回 job_id；去重命中返 409，Redis 不可用返 503。"""
    try:
        from app.core.queue import enqueue
        job = await enqueue("run_agent_task", body.model_dump(mode="json"))
        if job is None:
            raise HTTPException(status_code=409, detail="任务已在队列中（去重）")
        return _ok({"job_id": job.job_id, "status": "queued"})
    except ImportError:
        raise HTTPException(status_code=503, detail="Redis 未连接，异步队列不可用")
    except Exception as exc:
        logger.exception("入队失败")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{job_id}")
async def get_task_status(job_id: str):
    """GET /{job_id}：查询异步任务状态与结果（完成才带 result），不存在返 404。"""
    try:
        from arq.jobs import Job
        from app.core.queue import get_pool
        pool = await get_pool()
        job = Job(job_id, redis=pool)
        info = await job.info()
        if info is None:
            raise HTTPException(status_code=404, detail=f"任务不存在: {job_id}")
        return _ok({
            "job_id": job_id,
            "status": info.status,
            "result": info.result if info.status == "complete" else None,
            "enqueue_time": str(info.enqueue_time) if info.enqueue_time else None,
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("查询任务状态失败")
        raise HTTPException(status_code=500, detail=str(exc))
