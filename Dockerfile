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
    && apt-get install -y --no-install-recommends curl libpq5 nodejs npm \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 后端源码
COPY app/ ./app/
COPY admin/ ./admin/
COPY appsettings*.json ./

# 数据库迁移
COPY alembic.ini ./alembic.ini
COPY migrations/ ./migrations/

# 种子数据(production cards 等,首次启动时写入 named volume)
COPY data/ ./data/

# 趋势页与默认开启的每日同步调度器都在运行时导入此包。
COPY skill_tracker/ ./skill_tracker/

# 前端构建产物(app.main 通过 SPA fallback 提供)
# 注意:vite 的 outDir 是 ../wwwroot(web/vite.config.ts),stage1 WORKDIR=/web,
# 产物实际落在 /wwwroot 而不是 /web/dist——COPY 源写错会直接构建失败。
COPY --from=web-build /wwwroot/ ./wwwroot/

EXPOSE 8000 8001

# 默认启动用户端;管理端在 compose 覆盖 command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
