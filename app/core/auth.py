"""用户端 API 鉴权中间件 —— 后端强制校验,登录门禁不再只是前端装饰。

此前 /agent/run、/registry/* 等端点无任何鉴权,局域网内可绕过前端直接调用。
本中间件保护 app.main 下所有 /api/* 路径(管理端是独立服务 :8001,不经此处):

- 豁免:/api/v1/agentapp/auth/*(登录/校验)、OPTIONS 预检。
- 读(GET/HEAD):任何已登录且未禁用的用户。
- 写(POST/PUT/PATCH/DELETE):按路由前缀映射角色权限(最长前缀优先);
  未映射的写操作按 workbench:use(对话/入队等工作台使用类)。
- 开关:USER_API_AUTH=false 整体关闭(应急逃生口),默认开。

token 复用 admin/auth.py 的 HMAC 签发(user_auth.py 登录时颁发,同一密钥)。
注意:ADMIN_SECRET 未配置时每次重启随机生成——app 与 admin 两个进程的
token 互不通用,且重启即全体失效;生产务必在 .env 固定 ADMIN_SECRET。
"""
from __future__ import annotations

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from admin.auth import parse_token

_AUTH_EXEMPT_PREFIX = "/api/v1/agentapp/auth/"

# 写操作的前缀 → 所需权限。顺序即匹配顺序:更长/更具体的前缀放前面。
_WRITE_PERMS: list[tuple[str, str]] = [
    ("/api/v1/agentapp/agent/ai-providers", "settings:manage"),
    ("/api/v1/agentapp/registry/teams", "team:manage"),
    ("/api/v1/agentapp/registry/tools", "tool:manage"),
    ("/api/v1/agentapp/registry/mcp-servers", "tool:manage"),
    ("/api/v1/agentapp/registry", "employee:manage"),
    ("/api/v1/agentapp/workflow", "workflow:manage"),
    ("/api/v1/agentapp/production", "production:manage"),
    ("/api/v1/pipeline", "production:manage"),
    ("/api/v1/agentapp/memory", "employee:manage"),
    ("/api/v1/agentapp/scrape", "employee:manage"),
    ("/api/v1/agentapp/skills", "employee:manage"),
    ("/api/v1/agentapp/evolution", "employee:manage"),
    ("/api/v1/agentapp/knowledge-graph", "employee:manage"),
    ("/api/v1/agentapp/trend-sources", "employee:manage"),
]
_DEFAULT_WRITE_PERM = "workbench:use"

_READ_METHODS = {"GET", "HEAD"}


def _envelope(status: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": status, "message": message, "data": None})


def _required_write_perm(path: str) -> str:
    for prefix, perm in _WRITE_PERMS:
        if path.startswith(prefix):
            return perm
    return _DEFAULT_WRITE_PERM


class UserAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # 非 API 路径(SPA/静态/healthcheck/metrics/uploads)与登录端点直接放行
        if not path.startswith("/api/") or path.startswith(_AUTH_EXEMPT_PREFIX):
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return _envelope(401, "未登录或缺少凭证")
        try:
            claims = parse_token(auth_header[len("Bearer "):].strip())
        except HTTPException as exc:
            return _envelope(exc.status_code, str(exc.detail))

        # 用户须仍存在且未被禁用(token 有效期内被禁用/删除的账号立即失效)
        from app.dependencies import user_store

        username = claims.get("sub", "")
        user = user_store.get(username)
        if not user or not user.get("enabled", True):
            return _envelope(401, "账号不存在或已被禁用")

        if request.method not in _READ_METHODS:
            required = _required_write_perm(path)
            perms = user_store.get_permissions(username)
            if required not in perms:
                return _envelope(403, f"当前角色无此操作权限(需要 {required})")

        request.state.user = user
        request.state.username = username
        return await call_next(request)
