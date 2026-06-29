"""管理端独立 FastAPI 服务入口。

与用户端 app.main 分离：独立进程、独立端口、独立鉴权，
但通过 `from app.* import ...` 复用同一套 models / services / registries。

启动：
    python -m admin.main
或：
    uvicorn admin.main:app --port 8001 --reload
"""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from admin.config import ADMIN_PORT
from admin.api import auth_api, system, employees, providers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(title="Agent Admin Service", version="v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthcheck")
def healthcheck():
    return "ok"


app.include_router(auth_api.router)
app.include_router(system.router)
app.include_router(employees.router)
app.include_router(providers.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("admin.main:app", host="0.0.0.0", port=ADMIN_PORT, reload=True)
