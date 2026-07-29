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
from app.services.model_generation import generate_response_text

router = APIRouter(prefix="/api/v1/agentapp/skills", tags=["skills"])

OUTPUT_DIR = BASE_DIR / "skill_tracker" / "output"
SNAPSHOT_DIR = OUTPUT_DIR / "snapshots"


# ── 读取产出 ────────────────────────────────────────────────────────

# _latest_per_query 会被 queries / list / summary / repo-lookup 四个端点各调一次，
# 而它要 parse 目录下每一份 skills_*.json（当前 70 份 ≈ 38ms，且随天数线性增长）。
# 用「文件数 + 最新 mtime」当签名做进程内缓存：同步写入新文件后签名自然变化，缓存自动失效。
_latest_cache: tuple[tuple[int, int], dict[str, dict]] | None = None


def _output_signature() -> tuple[int, int]:
    """产出目录的廉价指纹（文件数, 最新 mtime_ns）——只 stat 不读内容。"""
    if not OUTPUT_DIR.exists():
        return (0, 0)
    files = list(OUTPUT_DIR.glob("skills_*.json"))
    if not files:
        return (0, 0)
    return (len(files), max(f.stat().st_mtime_ns for f in files))


def _latest_per_query() -> dict[str, dict]:
    """每个 query 取 generated_at 最新的一份 skills_*.json（带进程内缓存）。"""
    global _latest_cache

    if not OUTPUT_DIR.exists():
        return {}

    sig = _output_signature()
    if _latest_cache is not None and _latest_cache[0] == sig:
        return _latest_cache[1]

    latest: dict[str, dict] = {}
    for f in OUTPUT_DIR.glob("skills_*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        q = data.get("query", "?")
        if q not in latest or data.get("generated_at", "") > latest[q].get("generated_at", ""):
            latest[q] = data

    _latest_cache = (sig, latest)
    return latest


def is_query_fresh(query: str, on_date: str | None = None) -> bool:
    """该 query 的最新产出是否就是指定日期（默认今天）。

    幂等护栏：趋势同步可能被多个入口触发（后端调度器 / Windows 计划任务 / CLI），
    靠它跳过当天已经拉过的 query，避免重复消耗 GitHub 配额。
    """
    data = _latest_per_query().get(query)
    if not data:
        return False
    target = on_date or datetime.now().strftime("%Y-%m-%d")
    return data.get("generated_at", "")[:10] == target


def _snap_slug(query: str) -> str:
    """把 query 归一化为快照目录名（小写、非字母数字替换为下划线），空结果回退为 "default"。"""
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


def _history_points(query: str, full_name: str) -> list[dict]:
    """某仓库在某 query 历次快照里的 star 走势点。"""
    slug_dir = SNAPSHOT_DIR / _snap_slug(query)
    points: list[dict] = []
    if not slug_dir.exists():
        return points
    for f in sorted(slug_dir.glob("*.json")):
        try:
            snap = json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        stars = snap.get("stars", {}).get(full_name)
        if stars is not None:
            points.append({"takenAt": snap.get("taken_at", ""), "stars": stars})
    return points


@router.get("/repo-history")
def repo_history(
    query: str = Query(...),
    fullName: str = Query(..., description="owner/repo"),
):
    """某仓库在历次快照里的 star 走势，用于详情趋势图。"""
    return _ok(_history_points(query, fullName))


@router.get("/repo-lookup")
def repo_lookup(fullName: str = Query(..., description="owner/repo")):
    """跨全部 query 查一个仓库的完整记录 + star 走势。

    AI 分析报告是跨领域汇总的，它提到的仓库不一定落在当前选中的 query 里，
    所以不能复用 /list 的结果——必须在所有 query 的最新产出中查找。
    查不到（例如 LLM 提到了榜单外的项目）返回 data=null，前端据此降级为纯外链。
    """
    best: dict | None = None
    best_query = ""
    for q, data in _latest_per_query().items():
        for bucket in ("top_starred", "fastest_growing", "real_growth"):
            for r in data.get(bucket, []):
                if r.get("full_name") != fullName:
                    continue
                # 同名可能出现在多个 query / 多个榜单，取字段最全的一条
                # （real_growth 里的记录额外带 delta / delta_per_day）
                if best is None or len(r) > len(best):
                    best, best_query = r, q

    if best is None:
        return _ok(None)
    return _ok({
        "repo": best,
        "query": best_query,
        "history": _history_points(best_query, fullName),
    })


class RefreshReq(BaseModel):
    """POST /refresh 的请求体：要刷新的 query、榜单条数上限与"真实增长"统计的时间窗口（天）。"""
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


class NoTrendDataError(RuntimeError):
    """尚无任何 query 的趋势数据，无法生成分析报告。"""


async def generate_analysis(force: bool = False) -> dict:
    """用 LLM 生成 AI 趋势分析报告并落盘缓存。

    force=False 时同一天内直接复用缓存（HTTP 手动触发用）；
    force=True 时无视缓存强制重生成（每日自动同步用，数据刚刷新过必须重算）。

    与 FastAPI 解耦：只抛普通异常，由路由层翻译成 HTTP 状态码，
    这样定时调度器也能直接调用。
    """
    from app.dependencies import ai_service

    summary = _build_analysis_summary()
    if not summary:
        raise NoTrendDataError("暂无趋势数据，请先刷新至少一个查询")

    if not force and _ANALYSIS_CACHE_PATH.exists():
        try:
            cache = json.loads(_ANALYSIS_CACHE_PATH.read_text(encoding="utf-8"))
            if cache.get("generatedAt", "")[:10] == datetime.now().strftime("%Y-%m-%d"):
                return cache
        except Exception:  # noqa: BLE001 缓存损坏就当没有，继续重生成
            pass

    client, model = ai_service.get_default_client()

    prompt = _ANALYSIS_PROMPT.format(data_summary=summary)
    raw = await asyncio.to_thread(
        lambda: generate_response_text(
            client=client,
            model=model,
            instructions="你是 AI 行业分析师。只返回 JSON，不要解释。",
            input_data=prompt,
            temperature=0.3,
            max_output_tokens=4000,
        )
    )
    raw = raw or "{}"

    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start < 0 or end <= start:
        raise ValueError("LLM 未返回 JSON")
    report = json.loads(raw[start:end])

    report["generatedAt"] = datetime.now().isoformat()
    report["model"] = model

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    _ANALYSIS_CACHE_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return report


@router.post("/analyze")
async def analyze_trends():
    """用 LLM 生成 AI 趋势分析报告（同一天复用缓存）。"""
    try:
        return _ok(await generate_analysis())
    except NoTrendDataError as exc:
        raise HTTPException(404, str(exc))
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, f"分析报告 JSON 解析失败: {exc}")
    except Exception as exc:  # noqa: BLE001 LLM 客户端 / 网络
        raise HTTPException(502, f"LLM 调用失败: {exc}")


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


# ── 个人化每日简报 ──────────────────────────────────────────────────
# 与 /analyze 的全景报告分工：全景报告是"今天整个领域怎么样"，每天高度重复；
# 简报是"今天有哪几条值得你看"，看过即消失，不重复。

class MarkReadReq(BaseModel):
    """标记已读的条目 id 列表（POST /digest/read）。"""
    ids: list[str]


@router.get("/digest")
def get_digest():
    """读当前简报（已剔除已读条目）。不触发 LLM。"""
    from app.services import trend_digest
    return _ok(trend_digest.read_digest())


@router.post("/digest")
async def make_digest(force: bool = Query(False, description="true=无视当天缓存强制重生成")):
    """生成简报：剔除已读 → 按画像挑选 → 只回结论。"""
    from app.services import trend_digest
    try:
        return _ok(await trend_digest.generate_digest(force=force))
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, f"简报 JSON 解析失败: {exc}")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"LLM 调用失败: {exc}")


@router.post("/digest/read")
def mark_digest_read(req: MarkReadReq):
    """标记已读——这些条目以后永不再出现在简报里。"""
    from app.services import trend_digest
    added = trend_digest.mark_seen(req.ids)
    return _ok({"marked": added, "digest": trend_digest.read_digest()})


@router.get("/digest/profile")
def get_digest_profile():
    """读兴趣画像（决定简报挑什么）。"""
    from app.services import trend_digest
    return _ok(trend_digest.load_profile())


@router.put("/digest/profile")
def put_digest_profile(profile: dict):
    """更新兴趣画像；下次生成简报即生效。"""
    from app.services import trend_digest
    return _ok(trend_digest.save_profile(profile))


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
