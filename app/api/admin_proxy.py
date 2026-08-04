"""管理端 API 同源代理：生产 SPA 的 /api/admin/* 转发到独立 admin 进程。"""
from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

from app.core.settings import settings


router = APIRouter(prefix="/api/admin", tags=["admin-proxy"])

_HOP_BY_HOP_HEADERS = {
    "connection",
    "content-encoding",
    "content-length",
    "host",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
)
async def proxy_admin_api(request: Request, path: str) -> Response:
    """保留方法、查询串、正文和管理 token，把请求转给独立 admin 服务。"""
    target = f"{settings.admin_api_url.rstrip('/')}/api/admin/{path.lstrip('/')}"
    request_headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in _HOP_BY_HOP_HEADERS
    }
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=False) as client:
            upstream = await client.request(
                request.method,
                target,
                params=list(request.query_params.multi_items()),
                content=await request.body(),
                headers=request_headers,
            )
    except httpx.RequestError as exc:
        raise HTTPException(502, "管理端服务不可用，请确认 admin 进程已启动") from exc

    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in _HOP_BY_HOP_HEADERS
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
    )
