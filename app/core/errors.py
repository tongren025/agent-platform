"""全局异常处理 —— 统一响应结构,生产环境不外泄堆栈。

响应体与 app.api.common.ok() 的信封保持一致:{code, message, data}。
未捕获异常记结构化日志(含 request_id),对客户端只返回通用错误 +
request_id,便于用户报障时定位,而不泄漏内部实现。
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

_logger = get_logger("http.error")


def _envelope(code: int, message: str, data=None, request_id: str | None = None) -> JSONResponse:
    """构造统一错误信封 {code, message, data[, requestId]}；code>=400 时同步作为 HTTP 状态码。"""
    body = {"code": code, "message": message, "data": data}
    if request_id:
        body["requestId"] = request_id
    return JSONResponse(status_code=code if code >= 400 else 200, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    """向 FastAPI app 注册三类全局异常处理器（HTTP 异常 / 参数校验 / 未捕获兜底），启动时调用一次。"""
    @app.exception_handler(StarletteHTTPException)
    async def _http_exc(request: Request, exc: StarletteHTTPException):
        """业务主动抛出的 HTTPException：按原状态码转成统一信封。"""
        rid = getattr(request.state, "request_id", None)
        return _envelope(exc.status_code, str(exc.detail), request_id=rid)

    @app.exception_handler(RequestValidationError)
    async def _validation_exc(request: Request, exc: RequestValidationError):
        """请求体/参数校验失败：返回 422，data 里带 pydantic 的字段级错误明细。"""
        rid = getattr(request.state, "request_id", None)
        return _envelope(422, "请求参数校验失败", data=exc.errors(), request_id=rid)

    @app.exception_handler(Exception)
    async def _unhandled_exc(request: Request, exc: Exception):
        """未捕获异常兜底：记结构化错误日志（含堆栈），对客户端只回通用 500 + request_id，不泄漏内部实现。"""
        rid = getattr(request.state, "request_id", None)
        _logger.error(
            "unhandled_exception",
            method=request.method,
            path=request.url.path,
            error=repr(exc),
            exc_info=exc,
        )
        return _envelope(500, "服务内部错误,请稍后重试", request_id=rid)
