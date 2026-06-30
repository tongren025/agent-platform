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

from app.api.common import ok as _ok
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
    return _ok(out)


@router.get("/list")
def list_skills(query: str = Query(..., description="要查看的 query")):
    """某个 query 的三个榜单：星最多 / 增长最快(估算) / 真实近期增长。"""
    latest = _latest_per_query()
    data = latest.get(query)
    if not data:
        raise HTTPException(404, f"没有 query={query!r} 的数据，先刷新一次")
    return _ok({
        "query": query,
        "generatedAt": data.get("generated_at", ""),
        "topStarred": data.get("top_starred", []),
        "fastestGrowing": data.get("fastest_growing", []),
        "realGrowth": data.get("real_growth", []),
    })


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
    return _ok(points)


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

    return _ok({
        "query": q,
        "generatedAt": result.get("generated_at", datetime.now().isoformat()),
        "topStarred": result.get("top_starred", []),
        "fastestGrowing": result.get("fastest_growing", []),
        "realGrowth": result.get("real_growth", []),
    })


# ── AI 分析报告 ─────────────────────────────────────────────────────

_ANALYSIS_CACHE_PATH = OUTPUT_DIR / "analysis_cache.json"

_ANALYSIS_PROMPT = """\
你是一名 AI 行业分析师。根据以下 GitHub AI 项目趋势数据，写一份中文分析报告。

## 数据摘要
{data_summary}

## 要求
写一份结构化的 JSON 分析报告，包含以下字段：

1. **summary**：总体趋势一段话总结（150 字以内）
2. **hot_tracks**：当前最热的 3~5 个技术方向，每个包含 name、description、representative_repos（代表性项目名，最多3个）、heat_score（1~10）
3. **rising_stars**：3~5 个正在快速崛起的新兴项目，每个包含 repo_name、reason、growth_metric
4. **tech_shifts**：2~3 个正在发生的技术趋势转变，每个包含 title、description
5. **language_insights**：编程语言分布洞察，包含 dominant（主导语言）、rising（上升语言）、insight（一句话分析）
6. **recommendations**：对 AI 创作工具/Agent 平台开发者的 2~3 条建议，每条包含 title、content

返回严格 JSON：
{{
  "summary": "...",
  "hot_tracks": [...],
  "rising_stars": [...],
  "tech_shifts": [...],
  "language_insights": {{"dominant": "...", "rising": "...", "insight": "..."}},
  "recommendations": [...]
}}
"""


def _build_analysis_summary() -> str:
    """从所有 query 的最新数据构建摘要文本。"""
    latest = _latest_per_query()
    if not latest:
        return ""

    lines = []
    for q in sorted(latest.keys()):
        data = latest[q]
        top = data.get("top_starred", [])[:5]
        growing = data.get("fastest_growing", [])[:5]
        real = data.get("real_growth", [])[:5]

        lines.append(f"\n### 领域：{q}")
        lines.append(f"数据时间：{data.get('generated_at', '?')[:10]}")

        if top:
            lines.append("**头部项目（按总星标）：**")
            for r in top:
                lang = f" [{r.get('language','')}]" if r.get('language') else ""
                lines.append(f"- {r['full_name']}{lang}: {r.get('stars',0)}⭐ — {(r.get('description',''))[:80]}")

        if growing:
            lines.append("**新晋高增长：**")
            for r in growing:
                lines.append(f"- {r['full_name']}: {r.get('stars_per_day',0):.0f}⭐/天, 共{r.get('stars',0)}⭐")

        if real:
            lines.append("**真实近期涨星：**")
            for r in real:
                delta = r.get('delta', 0)
                lines.append(f"- {r['full_name']}: {'+'if delta>0 else ''}{delta}⭐, {r.get('delta_per_day',0):.1f}/天")

    # 语言分布
    lang_count: dict[str, int] = {}
    for data in latest.values():
        for r in data.get("top_starred", []) + data.get("fastest_growing", []):
            lang = r.get("language")
            if lang:
                lang_count[lang] = lang_count.get(lang, 0) + 1
    if lang_count:
        top_langs = sorted(lang_count.items(), key=lambda x: -x[1])[:8]
        lines.append("\n### 编程语言分布（所有领域合计）")
        for lang, cnt in top_langs:
            lines.append(f"- {lang}: {cnt} 个项目")

    return "\n".join(lines)


@router.post("/analyze")
async def analyze_trends():
    """用 LLM 生成 AI 趋势分析报告。"""
    from app.dependencies import ai_service

    summary = _build_analysis_summary()
    if not summary:
        raise HTTPException(404, "暂无趋势数据，请先刷新至少一个查询")

    # 检查缓存（同一天只生成一次）
    if _ANALYSIS_CACHE_PATH.exists():
        try:
            cache = json.loads(_ANALYSIS_CACHE_PATH.read_text(encoding="utf-8"))
            cache_date = cache.get("generatedAt", "")[:10]
            if cache_date == datetime.now().strftime("%Y-%m-%d"):
                return _ok(cache)
        except Exception:
            pass

    try:
        client, model = ai_service.get_default_client()
    except Exception as exc:
        raise HTTPException(500, f"无法获取 AI 客户端: {exc}")

    prompt = _ANALYSIS_PROMPT.format(data_summary=summary)
    try:
        resp = await asyncio.to_thread(
            lambda: client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "你是 AI 行业分析师。只返回 JSON，不要解释。"},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
            )
        )
        raw = resp.choices[0].message.content or "{}"
    except Exception as exc:
        raise HTTPException(502, f"LLM 调用失败: {exc}")

    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start < 0 or end <= start:
            raise ValueError("无 JSON")
        report = json.loads(raw[start:end])
    except Exception as exc:
        raise HTTPException(500, f"分析报告 JSON 解析失败: {exc}")

    report["generatedAt"] = datetime.now().isoformat()
    report["model"] = model

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    _ANALYSIS_CACHE_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return _ok(report)


@router.get("/analyze")
def get_analysis():
    """读取缓存的分析报告。"""
    if not _ANALYSIS_CACHE_PATH.exists():
        return _ok(None)
    try:
        cache = json.loads(_ANALYSIS_CACHE_PATH.read_text(encoding="utf-8"))
        return _ok(cache)
    except Exception:
        return _ok(None)


@router.get("/summary")
def get_cross_query_summary():
    """跨查询汇总统计：语言分布、总项目数、各查询概况。"""
    latest = _latest_per_query()
    if not latest:
        return _ok({"queries": [], "languages": {}, "totalRepos": 0})

    lang_count: dict[str, int] = {}
    all_repos: set[str] = set()
    total_stars = 0
    query_stats = []

    for q in sorted(latest.keys()):
        data = latest[q]
        repos = data.get("top_starred", [])
        growing = data.get("fastest_growing", [])
        real = data.get("real_growth", [])

        for r in repos + growing:
            name = r.get("full_name", "")
            if name:
                all_repos.add(name)
            lang = r.get("language")
            if lang:
                lang_count[lang] = lang_count.get(lang, 0) + 1

        top_repo = repos[0] if repos else None
        total_delta = sum(r.get("delta", 0) for r in real)
        total_stars += sum(r.get("stars", 0) for r in repos)

        query_stats.append({
            "query": q,
            "repoCount": len(repos),
            "topRepo": top_repo.get("full_name", "") if top_repo else "",
            "topStars": top_repo.get("stars", 0) if top_repo else 0,
            "growingCount": len(growing),
            "totalDelta": total_delta,
            "generatedAt": data.get("generated_at", ""),
        })

    return _ok({
        "queries": query_stats,
        "languages": dict(sorted(lang_count.items(), key=lambda x: -x[1])),
        "totalRepos": len(all_repos),
        "totalStars": total_stars,
    })
