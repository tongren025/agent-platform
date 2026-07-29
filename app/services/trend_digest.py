"""个人化趋势简报。

和 `/skills/analyze` 的全景报告是两回事：
- 全景报告：把当天所有领域重算一遍，**每天内容高度重复**，一百多条谁也看不完。
- 本模块：只挑「你没看过 且 和你在做的事相关」的少数几条，**先给结论再给理由**，
  看过即标记已读，之后永不再出现。

三个关键设计：
1. **已读是永久的**（`seen.json`）。用户说"我看了你就看了，下次不要再给我"。
2. **候选先减法再送 LLM**：先剔除已读，再截断，避免每天把同样的东西喂给模型重算。
3. **画像可编辑**（`profile.json`）。默认按用户真实在做的事预填，而不是泛泛的"AI 爱好者"。
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

from app.config import BASE_DIR
from app.services.chat_response import extract_chat_content

logger = logging.getLogger(__name__)

_DIR = BASE_DIR / "data" / "trends"
PROFILE_PATH = _DIR / "profile.json"
SEEN_PATH = _DIR / "seen.json"
DIGEST_PATH = _DIR / "digest.json"

_SOURCES_DIR = BASE_DIR / "skill_tracker" / "output" / "sources"

# 送给 LLM 的候选上限：再多也只是徒增 token，模型也挑不动
MAX_CANDIDATES = 80
# 一份简报最多几条——用户明确说看不过来
MAX_PICKS = 6
# 已读记录保留多久（超过就 GC，免得 seen.json 无限增长）
SEEN_TTL_DAYS = 180

# 默认画像：按用户真实在做的事预填（独立创作者，一人做竖屏漫剧 + 自建 Agent 平台）。
# 不是"AI 爱好者"这种废话画像——那样过滤不掉任何东西。
DEFAULT_PROFILE = {
    "role": "独立创作者，一人制作竖屏 AI 漫剧《九陆纪元》，同时自建数字员工/Agent 平台",
    "interests": [
        "AI 视频生成（Seedance、Veo、Wan、Kling 等模型与工作流）",
        "图像生成与角色一致性、分镜/首末帧控制",
        "提示词工程与可复用的 Skill / 方法论",
        "Agent 框架、MCP 协议、长程任务执行",
        "RAG / 知识库 / 长期记忆",
        "短剧 / 竖屏内容的叙事与节奏",
    ],
    "not_interested": [
        "纯学术理论、无开源实现的论文",
        "融资新闻、公司八卦、榜单排名本身",
        "面向企业的销售型产品",
        "与内容创作和 Agent 工程都无关的通用基础设施",
    ],
}


def _ensure_dir() -> None:
    _DIR.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return fallback


def _write_json(path: Path, data) -> None:
    _ensure_dir()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ── 画像 ────────────────────────────────────────────────────────────

def load_profile() -> dict:
    """读兴趣画像；首次调用落盘默认值，之后用户可改。"""
    p = _read_json(PROFILE_PATH, None)
    if not p:
        _write_json(PROFILE_PATH, DEFAULT_PROFILE)
        return dict(DEFAULT_PROFILE)
    return p


def save_profile(profile: dict) -> dict:
    _write_json(PROFILE_PATH, profile)
    return profile


# ── 已读 ────────────────────────────────────────────────────────────

def load_seen() -> dict[str, str]:
    """{item_id: 标记已读的 ISO 时间}。"""
    return _read_json(SEEN_PATH, {}) or {}


def mark_seen(ids: list[str]) -> int:
    """标记已读；返回本次新增条数。已读是永久的，除非过了 TTL 被 GC。"""
    seen = load_seen()
    now = datetime.now().isoformat()
    added = 0
    for i in ids:
        if i and i not in seen:
            seen[i] = now
            added += 1
    _gc_seen(seen)
    _write_json(SEEN_PATH, seen)
    return added


def _gc_seen(seen: dict[str, str]) -> None:
    """就地清掉超过 TTL 的已读记录（那些条目早已滚出榜单，不会再冒出来）。"""
    cutoff = (datetime.now() - timedelta(days=SEEN_TTL_DAYS)).isoformat()
    for k in [k for k, v in seen.items() if v < cutoff]:
        del seen[k]


# ── 候选收集 ────────────────────────────────────────────────────────

def _github_candidates() -> list[dict]:
    """GitHub 五源里的仓库，跨全部 query 去重（同一个仓库可能出现在多个榜单）。"""
    from app.api.skills import _latest_per_query  # 延迟导入避免循环

    out: dict[str, dict] = {}
    for q, data in _latest_per_query().items():
        for bucket in ("top_starred", "fastest_growing", "real_growth"):
            for r in data.get(bucket, []):
                name = r.get("full_name")
                if not name or name in out:
                    continue
                out[name] = {
                    "id": f"github:{name}",
                    "source": "GitHub",
                    "title": name,
                    "url": r.get("html_url") or f"https://github.com/{name}",
                    "detail": (r.get("description") or "")[:220],
                    "metrics": f"{r.get('stars', 0)}⭐"
                               + (f", 近期 +{r['delta']}" if r.get("delta") else "")
                               + (f", {r.get('language')}" if r.get("language") else ""),
                    "domain": q,
                }
    return list(out.values())


def _source_candidates() -> list[dict]:
    """HN / arXiv / 新闻 / Reddit 的缓存条目。"""
    labels = {"hn": "Hacker News", "arxiv": "arXiv", "news": "Google News", "reddit": "Reddit"}
    out: list[dict] = []
    if not _SOURCES_DIR.exists():
        return out

    for src_dir in _SOURCES_DIR.iterdir():
        if not src_dir.is_dir():
            continue
        label = labels.get(src_dir.name, src_dir.name)
        for f in src_dir.glob("*.json"):
            data = _read_json(f, {}) or {}
            for it in data.get("items", []):
                # 每个源取一个稳定 URL 当去重键
                key = it.get("hnUrl") or it.get("absUrl") or it.get("url")
                if not key:
                    continue
                detail = it.get("summary") or ""
                metrics = ""
                if it.get("points") is not None:
                    metrics = f"{it['points']} points, {it.get('comments', 0)} 评论"
                elif it.get("score") is not None:
                    metrics = f"{it['score']} 票, {it.get('comments', 0)} 评论"
                elif it.get("source"):
                    metrics = str(it["source"])
                out.append({
                    "id": f"{src_dir.name}:{key}",
                    "source": label,
                    "title": (it.get("title") or "")[:200],
                    "url": it.get("url") or key,
                    "detail": detail[:220],
                    "metrics": metrics,
                    "domain": data.get("query") or data.get("category") or "",
                })
    return out


def collect_unseen() -> list[dict]:
    """全部候选，剔除已读。"""
    seen = load_seen()
    cands = _github_candidates() + _source_candidates()
    return [c for c in cands if c["id"] not in seen]


# ── LLM 挑选 ────────────────────────────────────────────────────────

_PROMPT = """\
你在为一位创作者做每日情报筛选。他的画像：

角色：{role}
关注：
{interests}
明确不关注：
{not_interested}

下面是今天他**还没看过**的候选条目。请挑出**最多 {max_picks} 条**真正对他有用的，
其余一律丢弃——宁可少给，也不要凑数。如果没有任何一条值得看，返回空数组。

候选：
{candidates}

对每条入选项输出：
- id：原样抄回候选的 id
- verdict：**一句话结论**，直接说"这是什么、能拿来干什么"。不要复述标题，不要说"这是一个…的项目"。
- why：为什么和他相关（结合他的画像，一句话）
- score：1~10，与他的相关度

严格返回 JSON 数组，不要解释：
[{{"id": "...", "verdict": "...", "why": "...", "score": 8}}]
"""


async def generate_digest(force: bool = False) -> dict:
    """生成个人化简报：剔除已读 → LLM 按画像挑选 → 落盘。

    同一天已生成过则直接复用（force=True 绕过），避免每次开页面都烧一次 LLM。
    """
    import asyncio

    cached = _read_json(DIGEST_PATH, None)
    if not force and cached and cached.get("generatedAt", "")[:10] == datetime.now().strftime("%Y-%m-%d"):
        return _filter_seen(cached)

    profile = load_profile()
    candidates = collect_unseen()
    if not candidates:
        digest = {"generatedAt": datetime.now().isoformat(), "model": "", "picks": [], "candidateCount": 0}
        _write_json(DIGEST_PATH, digest)
        return digest

    shortlist = _shortlist(candidates)
    by_id = {c["id"]: c for c in shortlist}

    lines = []
    for c in shortlist:
        lines.append(f'- id={c["id"]} | [{c["source"]}] {c["title"]}'
                     + (f' | {c["metrics"]}' if c["metrics"] else "")
                     + (f' | {c["detail"]}' if c["detail"] else ""))

    prompt = _PROMPT.format(
        role=profile.get("role", ""),
        interests="\n".join(f"- {i}" for i in profile.get("interests", [])),
        not_interested="\n".join(f"- {i}" for i in profile.get("not_interested", [])),
        max_picks=MAX_PICKS,
        candidates="\n".join(lines),
    )

    from app.dependencies import ai_service
    client, model = ai_service.get_default_client()
    resp = await asyncio.to_thread(
        lambda: client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是情报筛选助手。只返回 JSON 数组，不要解释。宁缺毋滥。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
        )
    )
    raw = extract_chat_content(resp) or "[]"
    start, end = raw.find("["), raw.rfind("]") + 1
    if start < 0 or end <= start:
        raise ValueError("LLM 未返回 JSON 数组")
    picked = json.loads(raw[start:end])

    picks = []
    for p in picked[:MAX_PICKS]:
        c = by_id.get(p.get("id"))
        if not c:
            continue  # LLM 编了不存在的 id，丢弃
        picks.append({**c, "verdict": p.get("verdict", ""), "why": p.get("why", ""), "score": p.get("score", 0)})
    picks.sort(key=lambda p: p.get("score", 0), reverse=True)

    digest = {
        "generatedAt": datetime.now().isoformat(),
        "model": model,
        "picks": picks,
        "candidateCount": len(candidates),
    }
    _write_json(DIGEST_PATH, digest)
    return digest


def _signal(c: dict) -> float:
    """粗排信号：从 metrics 里抠出第一个数字，作为热度代理。

    只在**同源内部**比较有意义——GitHub 的 79000 stars 和 HN 的 534 points 不是一个量纲。
    """
    import re
    m = re.search(r"(\d[\d,]*)", c.get("metrics", ""))
    return float(m.group(1).replace(",", "")) if m else 0.0


# 每个源能进候选池的名额。跨源比数字大小会让 GitHub 的星数碾压一切，
# 截断后其他四个源一条都不剩——五源追踪就名存实亡了。
_SOURCE_QUOTA = {"GitHub": 32}
_DEFAULT_QUOTA = 12


def _shortlist(candidates: list[dict]) -> list[dict]:
    """按源配额取各自的高信号条目，保证每个源都有机会进简报。"""
    by_source: dict[str, list[dict]] = {}
    for c in candidates:
        by_source.setdefault(c["source"], []).append(c)

    out: list[dict] = []
    for src, items in by_source.items():
        items.sort(key=_signal, reverse=True)
        out.extend(items[:_SOURCE_QUOTA.get(src, _DEFAULT_QUOTA)])
    return out[:MAX_CANDIDATES]


def _filter_seen(digest: dict) -> dict:
    """返回前再过一遍已读——用户可能在别处标记过。"""
    seen = load_seen()
    digest = dict(digest)
    digest["picks"] = [p for p in digest.get("picks", []) if p.get("id") not in seen]
    return digest


def read_digest() -> dict:
    """读缓存的简报（已剔除已读）。没有则返回空壳。"""
    cached = _read_json(DIGEST_PATH, None)
    if not cached:
        return {"generatedAt": "", "model": "", "picks": [], "candidateCount": 0}
    return _filter_seen(cached)
