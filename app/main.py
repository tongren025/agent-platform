"""
FastAPI application entry point.

Port of C# Program.cs — Agent Service.
"""
from __future__ import annotations

from datetime import datetime, timezone

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, settings
from app.core.settings import settings as core_settings
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.core.errors import register_exception_handlers
from app.core.observability import setup_metrics
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api import admin_proxy, agent, ai_providers, canvas, director, evolution, knowledge_graph, memory_api, pipeline, production, quick_prompts, registry, runs, scrape, sessions, skills, strategy_proxy, system_manager, tasks, trend_sources, user_auth, workflow

import app.tools.builtin  # noqa: F401
import app.tools.delegate  # noqa: F401
import app.tools.deep  # noqa: F401
import app.tools.media  # noqa: F401
import app.tools.strategy.handlers  # noqa: F401

configure_logging()
logger = get_logger(__name__)

# ── Lifespan ───────────────────────────────────────────────────────


def _migrate_employees() -> None:
    """启动时兜底迁移：只补无争议的基础字段，不覆盖用户模型与能力选择。"""
    from app.dependencies import employee_registry

    migrated = 0
    for emp in employee_registry.list_all():
        changed = False

        if emp.tags is None:
            emp.tags = []
            changed = True

        if not emp.source:
            emp.source = "user"
            changed = True

        if emp.created_at == datetime.min:
            emp.created_at = datetime.now(timezone.utc)
            changed = True

        if changed:
            employee_registry.save(emp)
            migrated += 1

    if migrated:
        logger.info("Employee migration: updated %d records", migrated)


def _migrate_teams_and_seed() -> None:
    """启动时团队迁移（roles → member_employee_keys 回填）；SEED_DEMO_WORKFLOWS=true 时才注入漫剧演示工作流（失败仅告警）。"""
    from app.dependencies import team_registry

    for team in team_registry.list_all():
        if team.roles and not team.member_employee_keys:
            role_keys = [r.employee_key for r in team.roles if r.employee_key]
            if role_keys:
                team.member_employee_keys = role_keys
                team_registry.save(team)
                logger.info("Team %s: seeded %d members from roles", team.team_code, len(role_keys))

    try:
        from app.core.settings import settings as core_settings
        if core_settings.seed_demo_workflows:
            from app.services.seed_workflows import seed_comic_drama
            seed_comic_drama()
    except Exception:
        logger.warning("种子工作流注入失败", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 生命周期：启动时执行数据迁移并拉起每日定时调度器，关闭时停止调度器。"""
    _migrate_employees()
    _migrate_teams_and_seed()
    try:
        from app.services.builtin_registry_migration import (
            migrate_builtin_comic_registry,
        )

        migrate_builtin_comic_registry()
    except Exception:
        # 兜底保护启动；迁移器内部已经逐条隔离，这里只处理导入或框架级异常。
        logger.warning("内置漫剧配置版本迁移失败", exc_info=True)
    from app.dependencies import daily_scheduler
    daily_scheduler.start()
    yield
    await daily_scheduler.stop()


# ── App ─────────────────────────────────────────────────────────────

app = FastAPI(title="Agent Service", version="v1", lifespan=lifespan)

# 顺序(外→内):CORS → 请求上下文(request_id/访问日志)→ API 鉴权。
# add_middleware 后添加者在外层,故按内→外的相反顺序书写。
if core_settings.user_api_auth:
    from app.core.auth import UserAuthMiddleware
    app.add_middleware(UserAuthMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=core_settings.cors_origin_list,
    allow_credentials=core_settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
setup_metrics(app)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


@app.get("/healthcheck")
def healthcheck():
    """存活探针——供负载均衡 / docker-compose healthcheck 使用，不做依赖检查。"""
    return "ok"

app.include_router(user_auth.router)
app.include_router(admin_proxy.router)
app.include_router(registry.router)
app.include_router(agent.router)
app.include_router(ai_providers.router)
app.include_router(sessions.router)
app.include_router(runs.router)
app.include_router(scrape.router)
app.include_router(strategy_proxy.router)
app.include_router(memory_api.router)
app.include_router(workflow.router)
app.include_router(pipeline.router)
app.include_router(production.router)
app.include_router(director.router)
app.include_router(quick_prompts.router)
app.include_router(canvas.router)
app.include_router(skills.router)
app.include_router(knowledge_graph.router)
app.include_router(evolution.router)
app.include_router(trend_sources.router)
app.include_router(tasks.router)
app.include_router(system_manager.router)


# ── Static files (SPA fallback) ────────────────────────────────────

wwwroot = BASE_DIR / "wwwroot"
uploads_dir = BASE_DIR / "data" / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
if wwwroot.exists():
    # assets 是前端构建产物(gitignore),克隆后未 build 时不存在——挂载必须单独判断,
    # 否则 StaticFiles 构造即抛 RuntimeError,后端起不来(CI 上曾因此全红)
    if (wwwroot / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(wwwroot / "assets")), name="assets")

    # index.html 里引用的是带内容 hash 的 bundle(assets/index-<hash>.js)。
    # 一旦浏览器把 index.html 缓存住，就会一直去取旧 hash 的 bundle——
    # 而重新 build 后旧 bundle 已被 emptyOutDir 删掉，于是 /assets 直接 404、页面白屏，
    # 用户只能靠 Ctrl+Shift+R 自救。所以 index.html 必须每次revalidate。
    # (hash 化的 assets/ 由 StaticFiles 带 etag 返回，可以安全地长期缓存。)
    _INDEX_NO_CACHE = {"Cache-Control": "no-cache, must-revalidate"}

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        """SPA 兜底路由：命中静态文件则直接返回，否则回退到 index.html 交给前端路由。"""
        file_path = (wwwroot / full_path).resolve()
        wwwroot_resolved = wwwroot.resolve()
        # 路径穿越防御：file_path 必须在 wwwroot 内部
        if (
            file_path.is_relative_to(wwwroot_resolved)
            and file_path.is_file()
            and file_path.name != "index.html"
        ):
            return FileResponse(file_path)
        index_file = wwwroot / "index.html"
        if index_file.exists():
            return FileResponse(index_file, headers=_INDEX_NO_CACHE)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=404, content={"message": "Not Found"})


# ── Main ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
