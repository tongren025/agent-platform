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


async def _proxy_admin_request(request: Request, path: str) -> Response:
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


@router.get("/{path:path}", operation_id="proxy_admin_get")
async def proxy_admin_get(request: Request, path: str) -> Response:
    """转发管理端 GET 请求。"""
    return await _proxy_admin_request(request, path)


@router.post("/{path:path}", operation_id="proxy_admin_post")
async def proxy_admin_post(request: Request, path: str) -> Response:
    """转发管理端 POST 请求。"""
    return await _proxy_admin_request(request, path)


@router.put("/{path:path}", operation_id="proxy_admin_put")
async def proxy_admin_put(request: Request, path: str) -> Response:
    """转发管理端 PUT 请求。"""
    return await _proxy_admin_request(request, path)


@router.patch("/{path:path}", operation_id="proxy_admin_patch")
async def proxy_admin_patch(request: Request, path: str) -> Response:
    """转发管理端 PATCH 请求。"""
    return await _proxy_admin_request(request, path)


@router.delete("/{path:path}", operation_id="proxy_admin_delete")
async def proxy_admin_delete(request: Request, path: str) -> Response:
    """转发管理端 DELETE 请求。"""
    return await _proxy_admin_request(request, path)


@router.head("/{path:path}", operation_id="proxy_admin_head")
async def proxy_admin_head(request: Request, path: str) -> Response:
    """转发管理端 HEAD 请求。"""
    return await _proxy_admin_request(request, path)


@router.options("/{path:path}", operation_id="proxy_admin_options")
async def proxy_admin_options(request: Request, path: str) -> Response:
    """转发管理端 OPTIONS 请求。"""
    return await _proxy_admin_request(request, path)
