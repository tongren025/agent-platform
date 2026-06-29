"""GitHub Skill 榜单 API — 读 skill_tracker 的产出，并支持手动触发拉取。

数据来源：项目根 skill_tracker/ 包（CLI + 计划任务每天写入 output/）。
后台自动拉取复用已注册的 Windows 计划任务 SkillTrackerDaily，本接口只读结果
+ 提供按需手动刷新（POST /refresh）。
"""
from __future__ import annotations

import asyncio
import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.config import BASE_DIR

router = APIRouter(prefix="/api/v1/agentapp/skills", tags=["skills"])

OUTPUT_DIR = BASE_DIR / "skill_tracker" / "output"
SNAPSHOT_DIR = OUTPUT_DIR / "snapshots"


# ── 读取产出 ────────────────────────────────────────────────────────

def _latest_per_query() -> dict[str, dict]:
    """每个 query 取 generated_at 最新的一份 skills_*.json。"""
    latest: dict[str, dict] = {}
    if not OUTPUT_DIR.exists():
        return latest
    for f in OUTPUT_DIR.glob("skills_*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        q = data.get("query", "?")
        if q not in latest or data.get("generated_at", "") > latest[q].get("generated_at", ""):
            latest[q] = data
    return latest


def _snap_slug(query: str) -> str:
    import re
    s = re.sub(r"[^a-zA-Z0-9]+", "_", query.strip().lower()).strip("_")
    return s or "default"


# ── 接口 ────────────────────────────────────────────────────────────

@router.get("/queries")
def list_queries():
    """所有可用 query 及其摘要（条数、生成时间、是否有真实增长数据）。"""
    latest = _latest_per_query()
    out = []
    for q, data in sorted(latest.items()):
        out.append({
            "query": q,
            "generatedAt": data.get("generated_at", ""),
            "topCount": len(data.get("top_starred", [])),
            "hasRealGrowth": bool(data.get("real_growth")),
        })
    return {"code": 200, "data": out}


@router.get("/list")
def list_skills(query: str = Query(..., description="要查看的 query")):
    """某个 query 的三个榜单：星最多 / 增长最快(估算) / 真实近期增长。"""
    latest = _latest_per_query()
    data = latest.get(query)
    if not data:
        raise HTTPException(404, f"没有 query={query!r} 的数据，先刷新一次")
    return {"code": 200, "data": {
        "query": query,
        "generatedAt": data.get("generated_at", ""),
        "topStarred": data.get("top_starred", []),
        "fastestGrowing": data.get("fastest_growing", []),
        "realGrowth": data.get("real_growth", []),
    }}


@router.get("/repo-history")
def repo_history(
    query: str = Query(...),
    fullName: str = Query(..., description="owner/repo"),
):
    """某仓库在历次快照里的 star 走势，用于详情趋势图。"""
    slug_dir = SNAPSHOT_DIR / _snap_slug(query)
    points = []
    if slug_dir.exists():
        for f in sorted(slug_dir.glob("*.json")):
            try:
                snap = json.loads(f.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue
            stars = snap.get("stars", {}).get(fullName)
            if stars is not None:
                points.append({"takenAt": snap.get("taken_at", ""), "stars": stars})
    return {"code": 200, "data": points}


class RefreshReq(BaseModel):
    query: str
    limit: int = 15
    recentDays: int = 180


@router.post("/refresh")
async def refresh(req: RefreshReq):
    """手动触发一次拉取（会写快照 + JSON，并立即返回最新结果）。"""
    q = req.query.strip()
    if not q:
        raise HTTPException(400, "query 不能为空")

    try:
        import skill_tracker.tracker as tracker
    except ImportError as e:
        raise HTTPException(500, f"无法加载 skill_tracker: {e}")

    try:
        # tracker.run 是同步 + 网络 IO，放线程池避免阻塞事件循环
        result = await asyncio.to_thread(
            tracker.run, q, req.limit, req.recentDays, True
        )
    except Exception as e:  # noqa: BLE001 网络/限流等
        raise HTTPException(502, f"拉取失败: {e}")

    return {"code": 200, "data": {
        "query": q,
        "generatedAt": result.get("generated_at", datetime.now().isoformat()),
        "topStarred": result.get("top_starred", []),
        "fastestGrowing": result.get("fastest_growing", []),
        "realGrowth": result.get("real_growth", []),
    }}
