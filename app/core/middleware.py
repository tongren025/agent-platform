"""请求中间件 —— 为每个请求生成 request_id 并记录访问日志。

request_id:优先透传客户端 / 网关传入的 X-Request-ID,否则新生成。
绑定到 structlog contextvars,使该请求内所有日志都带同一 id;
并回写到响应头,便于前端 / 排障按 id 追踪。
"""
from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logging import bind_contextvars, clear_contextvars, get_logger

_logger = get_logger("http.access")

_REQUEST_ID_HEADER = "X-Request-ID"


class RequestContextMiddleware(BaseHTTPMiddleware):
    """请求上下文中间件：负责 request_id 的生成/透传/回写，以及一条访问日志，由 app.main 挂载。"""

    async def dispatch(self, request: Request, call_next):
        """为单个请求绑定 request_id 到日志上下文，请求结束时（无论成败）记录访问日志并清理上下文。"""
        request_id = request.headers.get(_REQUEST_ID_HEADER) or uuid.uuid4().hex
        clear_contextvars()
        bind_contextvars(request_id=request_id)
        request.state.request_id = request_id

        start = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers[_REQUEST_ID_HEADER] = request_id
            return response
        finally:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
            _logger.info(
                "request",
                method=request.method,
                path=request.url.path,
                status=status_code,
                elapsed_ms=elapsed_ms,
                client=request.client.host if request.client else None,
            )
            clear_contextvars()
