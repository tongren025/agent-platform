"""多源 AI 趋势聚合 — Hacker News / arXiv / Google News RSS / Reddit。

全部使用免费公开 API，无需 API Key。数据缓存到 skill_tracker/output/sources/。
"""
from __future__ import annotations

import asyncio
import json
import re
import ssl
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.api.common import ok as _ok
from app.config import BASE_DIR

router = APIRouter(prefix="/api/v1/agentapp/trend-sources", tags=["trend-sources"])

CACHE_DIR = BASE_DIR / "skill_tracker" / "output" / "sources"
CACHE_TTL_HOURS = 2


def _cache_path(source: str, query: str) -> Path:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", query.strip().lower()).strip("_") or "default"
    return CACHE_DIR / source / f"{slug}.json"


def _read_cache(source: str, query: str) -> dict | None:
    p = _cache_path(source, query)
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        fetched = datetime.fromisoformat(data.get("fetchedAt", "2000-01-01"))
        if datetime.now() - fetched < timedelta(hours=CACHE_TTL_HOURS):
            return data
    except Exception:
        pass
    return None


def _write_cache(source: str, query: str, data: dict) -> None:
    p = _cache_path(source, query)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


_SSL_NOVERIFY = ssl.create_default_context()
_SSL_NOVERIFY.check_hostname = False
_SSL_NOVERIFY.verify_mode = ssl.CERT_NONE

_NOVERIFY_HOSTS = {"export.arxiv.org"}


def _fetch_url(url: str, *, headers: dict | None = None, timeout: int = 15) -> bytes:
    req = urllib.request.Request(url, headers=headers or {})
    req.add_header("User-Agent", "AgentStudio-TrendRadar/1.0")
    host = urllib.parse.urlparse(url).hostname or ""
    ctx = _SSL_NOVERIFY if host in _NOVERIFY_HOSTS else None
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
        return resp.read()


# ── Hacker News (Algolia API) ───────────────────────────────────────

HN_QUERIES = [
    {"key": "AI_agent", "q": "AI agent", "label": "AI Agent"},
    {"key": "LLM", "q": "LLM", "label": "大语言模型"},
    {"key": "Claude", "q": "Claude anthropic", "label": "Claude"},
    {"key": "GPT", "q": "GPT OpenAI", "label": "GPT / OpenAI"},
    {"key": "MCP", "q": "MCP model context protocol", "label": "MCP 协议"},
    {"key": "AI_coding", "q": "AI coding copilot", "label": "AI 编程"},
]


def _fetch_hn(query: str, limit: int = 20) -> list[dict]:
    url = (
        f"https://hn.algolia.com/api/v1/search?"
        f"query={urllib.parse.quote(query)}&tags=story&hitsPerPage={limit}"
    )
    raw = _fetch_url(url)
    data = json.loads(raw)
    items = []
    for hit in data.get("hits", []):
        items.append({
            "title": hit.get("title", ""),
            "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
            "points": hit.get("points", 0),
            "comments": hit.get("num_comments", 0),
            "author": hit.get("author", ""),
            "createdAt": hit.get("created_at", ""),
            "hnUrl": f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
        })
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items


@router.get("/hn/queries")
def hn_queries():
    return _ok(HN_QUERIES)


@router.get("/hn")
async def hn_list(query: str = Query("AI agent"), limit: int = Query(20, le=50)):
    cached = _read_cache("hn", query)
    if cached:
        return _ok(cached)
    try:
        items = await asyncio.to_thread(_fetch_hn, query, limit)
    except Exception as e:
        raise HTTPException(502, f"Hacker News 拉取失败: {e}")
    result = {"source": "hackernews", "query": query, "fetchedAt": datetime.now().isoformat(), "items": items}
    _write_cache("hn", query, result)
    return _ok(result)


# ── arXiv (Atom API) ────────────────────────────────────────────────

ARXIV_CATEGORIES = [
    {"key": "cs_AI", "cat": "cs.AI", "label": "人工智能 (cs.AI)"},
    {"key": "cs_CL", "cat": "cs.CL", "label": "计算语言学 (cs.CL)"},
    {"key": "cs_LG", "cat": "cs.LG", "label": "机器学习 (cs.LG)"},
    {"key": "cs_CV", "cat": "cs.CV", "label": "计算机视觉 (cs.CV)"},
    {"key": "cs_MA", "cat": "cs.MA", "label": "多智能体 (cs.MA)"},
]

ARXIV_NS = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}


def _fetch_arxiv(category: str, limit: int = 20) -> list[dict]:
    url = (
        f"http://export.arxiv.org/api/query?"
        f"search_query=cat:{category}&sortBy=submittedDate&sortOrder=descending"
        f"&max_results={limit}"
    )
    raw = _fetch_url(url, timeout=20)
    root = ET.fromstring(raw)
    items = []
    for entry in root.findall("atom:entry", ARXIV_NS):
        title = (entry.findtext("atom:title", "", ARXIV_NS) or "").strip().replace("\n", " ")
        summary = (entry.findtext("atom:summary", "", ARXIV_NS) or "").strip().replace("\n", " ")
        authors = [a.findtext("atom:name", "", ARXIV_NS) for a in entry.findall("atom:author", ARXIV_NS)]
        links = entry.findall("atom:link", ARXIV_NS)
        pdf_url = ""
        abs_url = ""
        for link in links:
            if link.get("title") == "pdf":
                pdf_url = link.get("href", "")
            elif link.get("rel") == "alternate":
                abs_url = link.get("href", "")
        published = entry.findtext("atom:published", "", ARXIV_NS)
        categories = [c.get("term", "") for c in entry.findall("atom:category", ARXIV_NS)]
        items.append({
            "title": title,
            "summary": summary[:300] + ("…" if len(summary) > 300 else ""),
            "authors": authors[:5],
            "publishedAt": published,
            "absUrl": abs_url,
            "pdfUrl": pdf_url,
            "categories": categories,
        })
    return items


@router.get("/arxiv/categories")
def arxiv_categories():
    return _ok(ARXIV_CATEGORIES)


@router.get("/arxiv")
async def arxiv_list(category: str = Query("cs.AI"), limit: int = Query(20, le=50)):
    cached = _read_cache("arxiv", category)
    if cached:
        return _ok(cached)
    try:
        items = await asyncio.to_thread(_fetch_arxiv, category, limit)
    except Exception as e:
        raise HTTPException(502, f"arXiv 拉取失败: {e}")
    result = {"source": "arxiv", "category": category, "fetchedAt": datetime.now().isoformat(), "items": items}
    _write_cache("arxiv", category, result)
    return _ok(result)


# ── Google News RSS ──────────────────────────────────────────────────

NEWS_TOPICS = [
    {"key": "ai_general", "q": "artificial intelligence", "label": "AI 综合"},
    {"key": "llm_news", "q": "large language model LLM", "label": "大模型动态"},
    {"key": "ai_agent", "q": "AI agent autonomous", "label": "AI Agent"},
    {"key": "ai_startup", "q": "AI startup funding", "label": "AI 创业融资"},
    {"key": "ai_regulation", "q": "AI regulation policy", "label": "AI 监管政策"},
]


def _fetch_news_rss(query: str, limit: int = 20) -> list[dict]:
    url = (
        f"https://news.google.com/rss/search?"
        f"q={urllib.parse.quote(query)}+when:7d&hl=en&gl=US&ceid=US:en"
    )
    raw = _fetch_url(url, timeout=15)
    root = ET.fromstring(raw)
    items = []
    for item in root.findall(".//item")[:limit]:
        title = (item.findtext("title") or "").strip()
        # Google News title format: "Headline - Source"
        source = ""
        if " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0]
            source = parts[1] if len(parts) > 1 else ""
        link = item.findtext("link") or ""
        pub_date = item.findtext("pubDate") or ""
        items.append({
            "title": title,
            "url": link,
            "source": source,
            "publishedAt": pub_date,
        })
    return items


@router.get("/news/topics")
def news_topics():
    return _ok(NEWS_TOPICS)


@router.get("/news")
async def news_list(query: str = Query("artificial intelligence"), limit: int = Query(20, le=50)):
    cached = _read_cache("news", query)
    if cached:
        return _ok(cached)
    try:
        items = await asyncio.to_thread(_fetch_news_rss, query, limit)
    except Exception as e:
        raise HTTPException(502, f"Google News 拉取失败: {e}")
    result = {"source": "google_news", "query": query, "fetchedAt": datetime.now().isoformat(), "items": items}
    _write_cache("news", query, result)
    return _ok(result)


# ── Reddit (公开 JSON API) ──────────────────────────────────────────

REDDIT_SUBS = [
    {"key": "MachineLearning", "sub": "MachineLearning", "label": "机器学习"},
    {"key": "LocalLLaMA", "sub": "LocalLLaMA", "label": "本地大模型"},
    {"key": "artificial", "sub": "artificial", "label": "AI 综合"},
    {"key": "ClaudeAI", "sub": "ClaudeAI", "label": "Claude"},
    {"key": "ChatGPT", "sub": "ChatGPT", "label": "ChatGPT"},
]


def _fetch_reddit(subreddit: str, limit: int = 20) -> list[dict]:
    url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}"
    raw = _fetch_url(url, headers={"Accept": "application/json"}, timeout=15)
    data = json.loads(raw)
    items = []
    for child in data.get("data", {}).get("children", []):
        post = child.get("data", {})
        if post.get("stickied"):
            continue
        created = post.get("created_utc", 0)
        items.append({
            "title": post.get("title", ""),
            "url": f"https://reddit.com{post.get('permalink', '')}",
            "externalUrl": post.get("url", ""),
            "score": post.get("score", 0),
            "comments": post.get("num_comments", 0),
            "author": post.get("author", ""),
            "createdAt": datetime.fromtimestamp(created, tz=timezone.utc).isoformat() if created else "",
            "flair": post.get("link_flair_text", ""),
            "isVideo": post.get("is_video", False),
            "thumbnail": post.get("thumbnail", ""),
        })
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items


@router.get("/reddit/subs")
def reddit_subs():
    return _ok(REDDIT_SUBS)


@router.get("/reddit")
async def reddit_list(subreddit: str = Query("MachineLearning"), limit: int = Query(20, le=50)):
    cached = _read_cache("reddit", subreddit)
    if cached:
        return _ok(cached)
    try:
        items = await asyncio.to_thread(_fetch_reddit, subreddit, limit)
    except Exception as e:
        err_msg = str(e)
        if "403" in err_msg or "Blocked" in err_msg:
            return _ok({
                "source": "reddit", "subreddit": subreddit,
                "fetchedAt": datetime.now().isoformat(),
                "items": [],
                "error": "Reddit API 在当前网络环境下不可用（需要代理）",
            })
        raise HTTPException(502, f"Reddit 拉取失败: {e}")
    result = {"source": "reddit", "subreddit": subreddit, "fetchedAt": datetime.now().isoformat(), "items": items}
    _write_cache("reddit", subreddit, result)
    return _ok(result)


# ── 多源概览 ─────────────────────────────────────────────────────────

@router.get("/overview")
def sources_overview():
    """返回各数据源的缓存状态。"""
    sources = []
    for name, label in [("hn", "Hacker News"), ("arxiv", "arXiv"), ("news", "Google News"), ("reddit", "Reddit")]:
        src_dir = CACHE_DIR / name
        cached_count = 0
        latest_time = ""
        if src_dir.exists():
            for f in src_dir.glob("*.json"):
                try:
                    d = json.loads(f.read_text(encoding="utf-8"))
                    cached_count += 1
                    t = d.get("fetchedAt", "")
                    if t > latest_time:
                        latest_time = t
                except Exception:
                    pass
        sources.append({"key": name, "label": label, "cachedQueries": cached_count, "latestFetch": latest_time})
    return _ok(sources)


# ── 批量翻译 ─────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    titles: list[str]


@router.post("/translate")
async def translate_titles(req: TranslateRequest):
    """用 LLM 把英文标题批量翻译成中文简介。"""
    if not req.titles:
        return _ok([])

    from app.dependencies import ai_service
    try:
        client, model = ai_service.get_default_client()
    except Exception as e:
        raise HTTPException(500, f"没有可用的 AI provider: {e}")

    titles_text = "\n".join(f"{i+1}. {t}" for i, t in enumerate(req.titles))
    prompt = (
        "你是一个翻译助手。把下面的英文标题/摘要逐条翻译成简洁的中文（每条不超过 30 字）。\n"
        "直接输出 JSON 数组，数组元素为中文字符串，顺序和数量与输入一一对应。不要输出其他内容。\n\n"
        f"{titles_text}"
    )
    try:
        resp = await asyncio.to_thread(
            lambda: client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=4000,
            )
        )
        text = resp.choices[0].message.content.strip()
        # 提取 JSON 数组
        start = text.find("[")
        end = text.rfind("]") + 1
        if start >= 0 and end > start:
            translations = json.loads(text[start:end])
        else:
            translations = [t.strip() for t in text.split("\n") if t.strip()]
    except Exception as e:
        raise HTTPException(500, f"翻译失败: {e}")

    return _ok(translations)
