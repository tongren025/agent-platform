"""
FastAPI application entry point.

Port of C# Program.cs — Agent Service.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, settings
from app.api import agent, ai_providers, memory_api, pipeline, registry, scrape, sessions, strategy_proxy, workflow

import app.tools.builtin  # noqa: F401
import app.tools.delegate  # noqa: F401
import app.tools.deep  # noqa: F401
import app.tools.strategy.handlers  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Lifespan ───────────────────────────────────────────────────────


def _migrate_employees() -> None:
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
    from app.dependencies import team_registry

    for team in team_registry.list_all():
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    _migrate_employees()
    _migrate_teams_and_seed()
    from app.dependencies import daily_scheduler
    daily_scheduler.start()
    yield
    await daily_scheduler.stop()


# ── App ─────────────────────────────────────────────────────────────

app = FastAPI(title="Agent Service", version="v1", lifespan=lifespan)

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
app.include_router(ai_providers.router)
app.include_router(sessions.router)
app.include_router(scrape.router)
app.include_router(strategy_proxy.router)
app.include_router(memory_api.router)
app.include_router(workflow.router)
app.include_router(pipeline.router)


# ── Static files (SPA fallback) ────────────────────────────────────

wwwroot = BASE_DIR / "wwwroot"
uploads_dir = BASE_DIR / "data" / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
if wwwroot.exists():
    app.mount("/assets", StaticFiles(directory=str(wwwroot / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        file_path = wwwroot / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(wwwroot / "index.html")


# ── Main ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
