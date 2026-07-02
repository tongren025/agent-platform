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


@app.get("/healthcheck")
def healthcheck():
    return "ok"


app.include_router(auth_api.router)
app.include_router(system.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(providers.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("admin.main:app", host="0.0.0.0", port=ADMIN_PORT, reload=True)
