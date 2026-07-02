# ─────────────────────────────────────────────────────────────
# 多阶段构建:stage1 构建前端 → stage2 运行 Python 后端。
# 同一镜像可跑用户端(app.main)或管理端(admin.main),
# 由 docker-compose 的 command 区分。
# ─────────────────────────────────────────────────────────────

# ── Stage 1: 构建前端 ──────────────────────────────────────
FROM node:20-slim AS web-build
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ── Stage 2: Python 运行时 ─────────────────────────────────
FROM python:3.12-slim AS runtime
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# 系统依赖(psycopg 运行时需要 libpq)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 后端源码
COPY app/ ./app/
COPY admin/ ./admin/
COPY appsettings.json ./appsettings.json

# 前端构建产物(app.main 通过 SPA fallback 提供)
COPY --from=web-build /web/dist/ ./wwwroot/

EXPOSE 8000 8001

# 默认启动用户端;管理端在 compose 覆盖 command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
