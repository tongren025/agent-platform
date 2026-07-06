"""管理端独立 FastAPI 服务入口。

与用户端 app.main 分离：独立进程、独立端口、独立鉴权，
但通过 `from app.* import ...` 复用同一套 models / services / registries。

启动：
    python -m admin.main
或：
    uvicorn admin.main:app --port 8001 --reload
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from admin.config import ADMIN_PORT
from app.core.settings import settings as core_settings
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.core.errors import register_exception_handlers
from app.core.observability import setup_metrics
from admin.api import auth_api, system, providers, users, roles

configure_logging()

app = FastAPI(title="Agent Admin Service", version="v1")

# 顺序:CORS 最外层 → 请求上下文(request_id / 访问日志)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=core_settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
setup_metrics(app)


@app.get("/")
def root():
    # 管理端是纯 API 服务，本身不托管前端。直接裸访问 :8001 会一脸 404，
    # 这里给一个友好指引，说明后台"界面"其实在前端的 /admin 路由下。
    """GET /：友好指引——管理端是纯 API，控制台界面在前端 /admin 路由。"""
    return JSONResponse({
        "service": "Agent Admin Service",
        "note": "这是管理端 API（纯后端，不含界面）。管理控制台界面在前端的 /admin 路由。",
        "console_ui": "开发环境: http://127.0.0.1:5188/admin/login ；生产环境: 用户端同源的 /admin",
        "api_docs": "/docs",
        "healthcheck": "/healthcheck",
    })


@app.get("/healthcheck")
def healthcheck():
    """存活探针，供容器健康检查。"""
    return "ok"


app.include_router(auth_api.router)
app.include_router(system.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(providers.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("admin.main:app", host="0.0.0.0", port=ADMIN_PORT, reload=True)
