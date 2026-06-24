"""
定时文章学习运行编排：逐个 URL 抓取 → LLM 总结 → 写入目标员工知识库+长期记忆 → 记录历史。

复用 app/services/scraper.py 的 scrape_and_summarize()（单篇文章学习），这里负责批量、
状态回写与去重串行。
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from app.models.learn import LearnArticleResult, LearnRunResult, LearnSource

logger = logging.getLogger(__name__)

_source_locks: dict[str, asyncio.Lock] = {}


def _lock_for(code: str) -> asyncio.Lock:
    lk = _source_locks.get(code)
    if lk is None:
        lk = asyncio.Lock()
        _source_locks[code] = lk
    return lk


async def run_learn(source: LearnSource) -> LearnRunResult:
    async with _lock_for(source.source_code):
        return await _run_inner(source)


async def _run_inner(source: LearnSource) -> LearnRunResult:
    from app.dependencies import employee_registry, learn_history_store, learn_source_store
    from app.services.scraper import ScraperError, scrape_and_summarize

    result = LearnRunResult(source_code=source.source_code)
    limit = max(1, source.max_articles or 1)  # 防御非正数导致「有 URL 却学 0 篇还报成功」
    urls = [u.strip() for u in (source.urls or []) if u.strip()][:limit]
    result.total_urls = len(urls)

    emp = employee_registry.get(source.target_employee_key)
    if emp is None:
        result.status = "failed"
        result.message = f"目标员工不存在：{source.target_employee_key}"
        result.finished_at = datetime.now(timezone.utc)
        _writeback(source, result)
        learn_history_store.append(result)
        return result

    role_hint = source.role_hint or emp.name
    learned = 0
    for url in urls:
        art = LearnArticleResult(url=url)
        try:
            r = await scrape_and_summarize(url, source.target_employee_key, role_hint)
            art.status = "ok"
            art.title = r.get("title", "")
            art.char_count = r.get("charCount", 0)
            art.memories_added = r.get("memoriesAdded", 0)
            art.knowledge_doc_id = r.get("knowledgeDocId")
            learned += 1
        except ScraperError as exc:
            art.status = "failed"
            art.message = str(exc)
        except Exception as exc:  # noqa: BLE001
            art.status = "failed"
            art.message = f"未知错误：{exc}"
            logger.warning("文章学习失败：%s — %s", url, exc, exc_info=True)
        result.articles.append(art)

    result.learned_count = learned
    result.failed_count = result.total_urls - learned
    if learned == 0 and result.total_urls > 0:
        result.status = "failed"
    elif result.failed_count > 0:
        result.status = "partial"
    else:
        result.status = "success"
    result.message = f"学习 {result.total_urls} 篇，成功 {learned} 篇，失败 {result.failed_count} 篇。"
    result.finished_at = datetime.now(timezone.utc)

    _writeback(source, result)
    learn_history_store.append(result)
    return result


def _writeback(source: LearnSource, result: LearnRunResult) -> None:
    from app.dependencies import learn_source_store

    fresh = learn_source_store.get(source.source_code)
    if fresh is not None:
        fresh.last_run_at = result.finished_at
        fresh.last_status = result.status
        fresh.last_message = result.message
        fresh.last_learned_count = result.learned_count
        fresh.total_learned = (fresh.total_learned or 0) + result.learned_count
        learn_source_store.save(fresh)
