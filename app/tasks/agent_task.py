"""arq 任务函数 —— worker 进程消费的异步任务。

每个函数签名：async def xxx(ctx, *args)
ctx 是 arq 注入的 dict（含 redis 连接等），首参固定。

任务结果通过 arq 自动持久化到 Redis（Job.result()），
同时落库到 agent_run_store 供 API 查询。
"""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timezone

from app.models.conversation import AgentRunRequest
from app.models.run_record import AgentRunRecord

logger = logging.getLogger(__name__)


async def run_agent_task(ctx: dict, request_dict: dict) -> dict:
    """异步执行 agent 运行——与同步的 run_invocation 逻辑一致，但在 worker 里跑。"""
    from app.config import settings
    from app.core.metrics import record_run_metrics
    from app.core.rate_limit import record_token_usage
    from app.dependencies import agent_run_store
    from app.services.invocation import run_invocation
    from app.services.run_store import estimate_cost

    body = AgentRunRequest.model_validate(request_dict)
    timeout = settings.agent.run_timeout_seconds

    t0 = time.monotonic()
    try:
        result = await asyncio.wait_for(run_invocation(body), timeout=timeout)
    except asyncio.TimeoutError:
        return {"success": False, "error": f"Agent run timed out after {timeout}s"}
    except Exception as exc:
        logger.exception("异步 agent 任务失败: employee=%s", body.employee_key)
        return {"success": False, "error": str(exc)}

    elapsed_ms = int((time.monotonic() - t0) * 1000)
    pt = result.token_usage.prompt_tokens if result.token_usage else 0
    ct = result.token_usage.completion_tokens if result.token_usage else 0

    try:
        from app.runtime.snapshot import load_snapshot
        from app.runtime.scope import build_scopes
        scopes = build_scopes(body.employee_key, body.workflow_key)
        snapshot = load_snapshot(body.employee_key, scopes)
        model_id = (snapshot.default_model_policy or {}).get("model_id", "") if snapshot else ""
        cost = estimate_cost(model_id, pt, ct)
        record_run_metrics(body.employee_key, result.success, pt, ct, cost)
        record_token_usage(body.employee_key, pt + ct)
    except Exception:
        logger.debug("异步任务指标记录失败", exc_info=True)

    return {
        "success": result.success,
        "assistant_message": result.assistant_message,
        "session_id": result.session_id,
        "elapsed_ms": elapsed_ms,
    }
