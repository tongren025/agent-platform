"""M4 异步任务 API —— 入队、用户任务列表、状态查询、取消与重试。

POST /tasks/agent-run   入队一次 agent 运行，立即返回 job_id
GET  /tasks/{job_id}    查询任务状态 / 结果
"""
from __future__ import annotations

import json
import logging
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.common import ok as _ok
from app.core.queue import QueueUnavailable
from app.core.rate_limit import limiter
from app.models.conversation import AgentRunRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agentapp/tasks")
TASK_META_TTL = 60 * 60 * 24 * 30


def _queue_error(action: str, exc: Exception, fallback_status: int = 503) -> HTTPException:
    """把队列异常统一转成 HTTP 错误。

    "Redis 没起"是一个已知的运行状态而不是代码缺陷：只记一行告警并给出可操作提示，
    不再为每个请求打完整 traceback（日志曾因此被刷到 2.4MB）。其它异常保留完整栈。
    """
    if isinstance(exc, QueueUnavailable):
        logger.warning("%s失败：%s", action, exc)
        return HTTPException(status_code=503, detail=str(exc))
    logger.exception("%s失败", action)
    detail = f"异步队列不可用: {exc}" if fallback_status == 503 else str(exc)
    return HTTPException(status_code=fallback_status, detail=detail)


def _username(request: Request) -> str:
    """返回鉴权中间件写入的用户名；关闭鉴权的开发环境统一归 anonymous。"""
    return getattr(request.state, "username", "anonymous")


def _status_value(status) -> str:
    """把 arq JobStatus 兼容转换成前端稳定字符串。"""
    return getattr(status, "value", str(status))


async def _save_task_meta(pool, username: str, job_id: str, request_data: dict) -> None:
    """把任务摘要写入用户级有序索引；不扫描 Redis 全库。"""
    now = time.time()
    meta = {
        "job_id": job_id,
        "username": username,
        "employee_key": request_data.get("employee_key") or request_data.get("employeeKey") or "",
        "user_input": request_data.get("user_input") or request_data.get("userInput") or "",
        "request": request_data,
        "created_at": now,
    }
    await pool.setex(f"agent:task:meta:{job_id}", TASK_META_TTL, json.dumps(meta, ensure_ascii=False))
    await pool.zadd(f"agent:tasks:user:{username}", {job_id: now})
    await pool.expire(f"agent:tasks:user:{username}", TASK_META_TTL)


async def _load_task_meta(pool, job_id: str) -> dict | None:
    """读取任务元数据并兼容 Redis 返回 bytes/string。"""
    raw = await pool.get(f"agent:task:meta:{job_id}")
    if not raw:
        return None
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    return json.loads(raw)


async def _task_view(pool, job_id: str, meta: dict | None = None) -> dict | None:
    """组合 arq 运行态与产品元数据，形成任务中心统一视图。"""
    from arq.jobs import Job
    job = Job(job_id, redis=pool)
    info = await job.info()
    if info is None:
        return None
    meta = meta or {}
    return {
        "job_id": job_id,
        "status": _status_value(info.status),
        "result": info.result if _status_value(info.status) == "complete" else None,
        "enqueue_time": str(info.enqueue_time) if info.enqueue_time else None,
        "employee_key": meta.get("employee_key", ""),
        "user_input": meta.get("user_input", ""),
        "created_at": meta.get("created_at"),
    }


class EnqueueResponse(BaseModel):
    """POST /agent-run 的响应体：入队成功后返回的 job_id 与初始状态。"""
    job_id: str
    status: str = "queued"


@router.post("/agent-run")
@limiter.limit("10/minute")
async def enqueue_agent_run(request: Request, body: AgentRunRequest):
    """POST /agent-run：入队一次 agent 运行并返回 job_id；去重命中返 409，Redis 不可用返 503。"""
    try:
        from app.core.queue import enqueue, get_pool
        request_data = body.model_dump(mode="json")
        job = await enqueue("run_agent_task", request_data)
        if job is None:
            raise HTTPException(status_code=409, detail="任务已在队列中（去重）")
        pool = await get_pool()
        await _save_task_meta(pool, _username(request), job.job_id, request_data)
        return _ok({"job_id": job.job_id, "status": "queued"})
    except HTTPException:
        raise
    except ImportError:
        raise HTTPException(status_code=503, detail="Redis 未连接，异步队列不可用")
    except Exception as exc:
        raise _queue_error("入队", exc) from exc


@router.get("")
async def list_tasks(request: Request, limit: int = 50):
    """列出当前用户最近任务，供任务中心直接展示，无需用户保存 Job ID。"""
    try:
        from app.core.queue import get_pool
        pool = await get_pool()
        username = _username(request)
        job_ids = await pool.zrevrange(f"agent:tasks:user:{username}", 0, max(0, min(limit, 100) - 1))
        views = []
        for raw_id in job_ids:
            job_id = raw_id.decode() if isinstance(raw_id, bytes) else str(raw_id)
            meta = await _load_task_meta(pool, job_id)
            view = await _task_view(pool, job_id, meta)
            if view:
                views.append(view)
        return _ok(views)
    except Exception as exc:
        raise _queue_error("查询任务列表", exc) from exc


@router.get("/{job_id}")
async def get_task_status(request: Request, job_id: str):
    """GET /{job_id}：查询异步任务状态与结果（完成才带 result），不存在返 404。"""
    try:
        from app.core.queue import get_pool
        pool = await get_pool()
        meta = await _load_task_meta(pool, job_id)
        if meta and meta.get("username") != _username(request):
            raise HTTPException(status_code=404, detail=f"任务不存在: {job_id}")
        view = await _task_view(pool, job_id, meta)
        if view is None:
            raise HTTPException(status_code=404, detail=f"任务不存在: {job_id}")
        return _ok(view)
    except HTTPException:
        raise
    except Exception as exc:
        raise _queue_error("查询任务状态", exc, fallback_status=500) from exc


@router.post("/{job_id}/cancel")
async def cancel_task(request: Request, job_id: str):
    """取消当前用户尚未完成的任务；arq 会中止排队或执行中的 Job。"""
    try:
        from arq.jobs import Job
        from app.core.queue import get_pool
        pool = await get_pool()
        meta = await _load_task_meta(pool, job_id)
        if not meta or meta.get("username") != _username(request):
            raise HTTPException(status_code=404, detail=f"任务不存在: {job_id}")
        aborted = await Job(job_id, redis=pool).abort(timeout=3)
        return _ok({"job_id": job_id, "cancelled": aborted})
    except HTTPException:
        raise
    except Exception as exc:
        raise _queue_error("取消任务", exc, fallback_status=500) from exc


@router.post("/{job_id}/retry")
async def retry_task(request: Request, job_id: str):
    """使用原始参数重新入队失败/完成任务，并生成新的 Job ID。"""
    try:
        from app.core.queue import enqueue, get_pool
        pool = await get_pool()
        meta = await _load_task_meta(pool, job_id)
        if not meta or meta.get("username") != _username(request):
            raise HTTPException(status_code=404, detail=f"任务不存在: {job_id}")
        job = await enqueue("run_agent_task", meta["request"])
        if job is None:
            raise HTTPException(status_code=409, detail="任务已在队列中")
        await _save_task_meta(pool, _username(request), job.job_id, meta["request"])
        return _ok({"job_id": job.job_id, "status": "queued"})
    except HTTPException:
        raise
    except Exception as exc:
        raise _queue_error("重试任务", exc, fallback_status=500) from exc
