"""M4 异步任务队列 —— arq 连接池 + 入队辅助。

arq 用 Redis 做 broker：任务入队后由独立 worker 进程消费，
长任务（agent 运行、工作流编排）不再阻塞 API 进程。

用法：
  pool = await get_pool()
  job = await pool.enqueue_job("run_agent_task", request_dict)
"""
from __future__ import annotations

import logging
import time
from typing import Any

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.core.settings import settings as core_settings

logger = logging.getLogger(__name__)

# Redis 没起时的失败必须"快"且"安静"：
# arq 默认 conn_retries=5 + conn_retry_delay=1s，单次连接要耗 11 秒才放弃，
# 每个打到队列接口的请求都白等 11 秒，还各自吐一份完整 traceback（日志曾被刷到 2.4MB）。
CONNECT_TIMEOUT_SECONDS = 1
CONNECT_RETRIES = 1
# 连接失败后的熔断窗口：窗口内直接拒，不再逐个请求去撞一个已知连不上的 Redis。
CIRCUIT_COOLDOWN_SECONDS = 30.0

_pool: ArqRedis | None = None
_circuit_open_until = 0.0


class QueueUnavailable(RuntimeError):
    """异步队列（Redis）不可用。消息直接面向用户，调用方原样透出即可。"""


def _redis_settings(*, conn_retries: int = CONNECT_RETRIES, conn_retry_delay: int = 0) -> RedisSettings:
    """把 REDIS_URL（redis://host:port/db）解析成 arq 的 RedisSettings；解析不了退回默认值（localhost:6379/0）。

    默认走「快速失败」参数，给 API 进程用——请求线程不该为一个连不上的 Redis 空等。
    常驻的 worker 进程应显式传更宽容的重试（见 app/tasks/worker.py）：
    它没有等待中的用户，Redis 晚几秒起来就退出反而更糟。
    """
    url = core_settings.redis_url
    timeouts = {
        "conn_timeout": CONNECT_TIMEOUT_SECONDS,
        "conn_retries": conn_retries,
        "conn_retry_delay": conn_retry_delay,
    }
    if url.startswith("redis://"):
        parts = url.replace("redis://", "").split("/")
        host_port = parts[0]
        database = int(parts[1]) if len(parts) > 1 else 0
        if ":" in host_port:
            host, port_s = host_port.rsplit(":", 1)
            port = int(port_s)
        else:
            host, port = host_port, 6379
        return RedisSettings(host=host, port=port, database=database, **timeouts)
    return RedisSettings(**timeouts)


def queue_available() -> bool:
    """队列当前是否可用（已有连接池，或熔断窗口已过可以再试一次）。"""
    return _pool is not None or time.monotonic() >= _circuit_open_until


async def get_pool() -> ArqRedis:
    """获取进程级单例 arq Redis 连接池，首次调用时懒创建。

    连不上时抛 QueueUnavailable 并打开熔断窗口：
    失败在 1 秒内返回，且窗口期内的后续请求不再重复尝试连接。
    """
    global _pool, _circuit_open_until
    if _pool is not None:
        return _pool
    if time.monotonic() < _circuit_open_until:
        raise QueueUnavailable("异步任务队列未启动（Redis 未连接），请启动 Redis 后重试")
    try:
        _pool = await create_pool(_redis_settings())
    except Exception as exc:
        _circuit_open_until = time.monotonic() + CIRCUIT_COOLDOWN_SECONDS
        # 只留一行可读的告警：完整 traceback 对"Redis 没起"这件事没有增量信息。
        logger.warning(
            "Redis 连接失败（%s），异步队列在 %.0f 秒内直接拒绝请求：%s",
            core_settings.redis_url, CIRCUIT_COOLDOWN_SECONDS, exc,
        )
        raise QueueUnavailable("异步任务队列未启动（Redis 未连接），请启动 Redis 后重试") from exc
    return _pool


async def enqueue(func_name: str, *args: Any, **kwargs: Any):
    """入队辅助：按函数名把任务丢进队列，返回 arq Job（可能为 None，如 job_id 重复）。"""
    pool = await get_pool()
    return await pool.enqueue_job(func_name, *args, **kwargs)


async def close_pool() -> None:
    """关闭并清空单例连接池，应用 shutdown 时调用。"""
    global _pool, _circuit_open_until
    if _pool is not None:
        await _pool.aclose()
        _pool = None
    _circuit_open_until = 0.0
