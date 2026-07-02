"""结构化日志 —— structlog,支持 JSON(生产)与彩色控制台(开发)。

每条日志自动带上当前请求的 request_id(由 RequestIDMiddleware 绑定到
contextvars),从而把一次请求的所有日志串成一条链路。
"""
from __future__ import annotations

import logging
import sys

import structlog

from app.core.settings import settings

# 供中间件写入 / 读取当前请求上下文(request_id 等)
merge_contextvars = structlog.contextvars.merge_contextvars
bind_contextvars = structlog.contextvars.bind_contextvars
clear_contextvars = structlog.contextvars.clear_contextvars


def configure_logging() -> None:
    """在应用启动时调用一次,统一 stdlib logging 与 structlog 的输出。"""
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    shared_processors = [
        merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.log_json:
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )

    # 把 stdlib logging(uvicorn / fastapi / 第三方库)也收敛到同一级别
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )
    for noisy in ("uvicorn.access",):
        logging.getLogger(noisy).setLevel(max(level, logging.WARNING))


def get_logger(name: str | None = None):
    return structlog.get_logger(name)
