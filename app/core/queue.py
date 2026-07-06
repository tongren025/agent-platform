"""M4 异步任务队列 —— arq 连接池 + 入队辅助。

arq 用 Redis 做 broker：任务入队后由独立 worker 进程消费，
长任务（agent 运行、工作流编排）不再阻塞 API 进程。

用法：
  pool = await get_pool()
  job = await pool.enqueue_job("run_agent_task", request_dict, _queue_name="default")
"""
from __future__ import annotations

import logging
from typing import Any

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.core.settings import settings as core_settings

logger = logging.getLogger(__name__)

_pool: ArqRedis | None = None


def _redis_settings() -> RedisSettings:
    """把 REDIS_URL（redis://host:port/db）解析成 arq 的 RedisSettings；解析不了退回默认值（localhost:6379/0）。"""
    url = core_settings.redis_url
    if url.startswith("redis://"):
        parts = url.replace("redis://", "").split("/")
        host_port = parts[0]
        database = int(parts[1]) if len(parts) > 1 else 0
        if ":" in host_port:
            host, port_s = host_port.rsplit(":", 1)
            port = int(port_s)
        else:
            host, port = host_port, 6379
        return RedisSettings(host=host, port=port, database=database)
    return RedisSettings()


async def get_pool() -> ArqRedis:
    """获取进程级单例 arq Redis 连接池，首次调用时懒创建。"""
    global _pool
    if _pool is None:
        _pool = await create_pool(_redis_settings())
    return _pool


async def enqueue(func_name: str, *args: Any, **kwargs: Any):
    """入队辅助：按函数名把任务丢进队列，返回 arq Job（可能为 None，如 job_id 重复）。"""
    pool = await get_pool()
    return await pool.enqueue_job(func_name, *args, **kwargs)


async def close_pool() -> None:
    """关闭并清空单例连接池，应用 shutdown 时调用。"""
    global _pool
    if _pool is not None:
        await _pool.aclose()
        _pool = None
