"""
FastAPI application entry point.

Port of C# Program.cs — Agent Service.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, settings
from app.api import agent, memory_api, registry, scrape, strategy_proxy, workflow

import app.tools.builtin  # noqa: F401
import app.tools.delegate  # noqa: F401
import app.tools.deep  # noqa: F401
import app.tools.strategy.handlers  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ─────────────────────────────────────────────────────────────

app = FastAPI(title="Agent Service", version="v1")

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

app.include_router(registry.router)
app.include_router(agent.router)
app.include_router(scrape.router)
app.include_router(strategy_proxy.router)
app.include_router(memory_api.router)
app.include_router(workflow.router)


# ── Static files (SPA fallback) ────────────────────────────────────

wwwroot = BASE_DIR / "wwwroot"
if wwwroot.exists():
    app.mount("/assets", StaticFiles(directory=str(wwwroot / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path == "healthcheck":
            return None
        file_path = wwwroot / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(wwwroot / "index.html")


# ── Startup: employee migration ────────────────────────────────────


@app.on_event("startup")
def migrate_employees():
    """Backfill defaults for Tags, Source, CreatedAt/UpdatedAt."""
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


# ── Startup: 团队结构迁移 + 种子工作流 ─────────────────────────────


@app.on_event("startup")
def migrate_teams_and_seed():
    """团队 roles<->members 回填（非破坏性）+ 种入漫剧工作流范例。"""
    from app.dependencies import team_registry

    for team in team_registry.list_all():
        # 仅在 members 为空（初次种入态）时从 roles 回填，避免每次重启把用户
        # 手动移除过的成员又复活（members 才是权威，roles 不强制为其超集）。
        if team.roles and not team.member_employee_keys:
            role_keys = [r.employee_key for r in team.roles if r.employee_key]
            if role_keys:
                team.member_employee_keys = role_keys
                team_registry.save(team)
                logger.info("Team %s: seeded %d members from roles", team.team_code, len(role_keys))

    try:
        from app.services.seed_workflows import seed_comic_drama
        seed_comic_drama()
    except Exception:
        logger.warning("种子工作流注入失败", exc_info=True)


# ── Startup/Shutdown: 每日采集调度器 ───────────────────────────────


@app.on_event("startup")
async def start_scheduler():
    from app.dependencies import daily_scheduler

    daily_scheduler.start()


@app.on_event("shutdown")
async def stop_scheduler():
    from app.dependencies import daily_scheduler

    await daily_scheduler.stop()


# ── Main ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
