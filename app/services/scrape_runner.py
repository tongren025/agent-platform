"""
采集运行编排：抓取 → 去重入库 → 生成知识文档注入目标员工知识库 → 写运行历史。
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from app.models.scrape import ScrapeRunResult, ScrapeSource
from app.services.scraper import ScraperError, ScraperNeedsLogin, scrape_source

logger = logging.getLogger(__name__)

_KNOWLEDGE_MAX_RENDER = 200  # 注入知识库的提示词条数上限（按热度取前 N）
_MAX_PROMPT_CHARS = 4000  # 单条提示词渲染时的字符上限，防止异常长文本撑爆知识文件

# 同一采集源的并发运行串行化（手动「立即采集」与定时触发可能同时发生）
_source_locks: dict[str, asyncio.Lock] = {}


def _lock_for(source_code: str) -> asyncio.Lock:
    """取（或惰性创建）某采集源的专属锁，保证同源不会并发重复采集。"""
    lk = _source_locks.get(source_code)
    if lk is None:
        lk = asyncio.Lock()
        _source_locks[source_code] = lk
    return lk


def _render_markdown(source: ScrapeSource, prompts: list) -> str:
    """把采集到的提示词渲染成知识库 markdown：按热度取前 _KNOWLEDGE_MAX_RENDER 条，单条截断。"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines: list[str] = [
        f"# {source.name} — 自动采集的提示词库",
        "",
        f"> 来源平台：{source.platform}　|　采集地址：{source.url}",
        f"> 最近更新：{now}　|　累计 {len(prompts)} 条（下表按热度排序，展示前 {min(len(prompts), _KNOWLEDGE_MAX_RENDER)} 条）",
        "",
        "本文件由系统每日自动更新。当用户需要写提示词 / 做图做视频时，"
        "可参考下列真实热门案例的写法、结构和关键词。",
        "",
    ]
    for idx, p in enumerate(prompts[:_KNOWLEDGE_MAX_RENDER], start=1):
        title = p.title or "（无标题）"
        type_label = "视频" if p.item_type == "video" else "图片"
        lines.append(
            f"## {idx}. {title}　[{type_label}]"
        )
        meta = f"作者：{p.author or '匿名'}　❤ {p.favorite_num}　使用 {p.usage_num}"
        lines.append(f"> {meta}")
        lines.append("")
        lines.append("提示词：")
        lines.append("")
        prompt_text = p.prompt or ""
        if len(prompt_text) > _MAX_PROMPT_CHARS:
            prompt_text = prompt_text[:_MAX_PROMPT_CHARS] + " …（已截断）"
        lines.append(prompt_text)
        lines.append("")
        lines.append("---")
        lines.append("")
    return "\n".join(lines)


async def _ingest_into_knowledge(source: ScrapeSource, prompts: list) -> None:
    """把采集到的提示词渲染成 markdown，替换目标员工知识库里的自动文档。"""
    from app.dependencies import employee_registry, knowledge_store, semantic_retriever
    from app.services.knowledge_ingestion import replace_named_knowledge_document

    emp_key = source.target_employee_key
    if not emp_key:
        return
    if employee_registry.get(emp_key) is None:
        logger.warning("采集目标员工不存在，跳过知识库注入：%s", emp_key)
        return

    auto_file = f"auto-{source.source_code}.md"

    # 统一服务保证先写入并索引新文档，再清理旧正文和向量。
    md = _render_markdown(source, prompts)
    await replace_named_knowledge_document(
        knowledge_store,
        semantic_retriever,
        emp_key,
        auto_file,
        md.encode("utf-8"),
        source_type="scrape",
        authority="unverified",
    )


async def run_scrape(source: ScrapeSource) -> ScrapeRunResult:
    """执行一次采集（同源串行）。无论成功失败都会回写采集源状态并记录历史。"""
    async with _lock_for(source.source_code):
        return await _run_scrape_inner(source)


async def _run_scrape_inner(source: ScrapeSource) -> ScrapeRunResult:
    """采集实际逻辑：抓取 → 去重入库 → 注入知识库 → 回写源状态与历史。

    按结果分级：needs_login（需登录）/ failed（抓取或未知错误）/ success；
    知识库注入失败只告警、不影响本次采集判定成功。
    """
    from app.dependencies import (
        collected_prompt_store,
        scrape_history_store,
        scrape_source_store,
    )

    result = ScrapeRunResult(source_code=source.source_code)
    logger.info("开始采集：%s (%s)", source.source_code, source.platform)

    try:
        items = await scrape_source(
            source.platform, source.url, source.source_code, source.max_items
        )
        newly = collected_prompt_store.add_many(source.source_code, items)
        total = collected_prompt_store.count(source.source_code)
        all_prompts = collected_prompt_store.list(source.source_code)

        try:
            await _ingest_into_knowledge(source, all_prompts)
        except Exception as exc:
            logger.warning("知识库注入失败：%s", exc, exc_info=True)

        result.status = "success"
        result.fetched_count = len(items)
        result.new_count = len(newly)
        result.total_count = total
        result.message = f"抓取 {len(items)} 条，新增 {len(newly)} 条，累计 {total} 条。"
    except ScraperNeedsLogin as exc:
        result.status = "needs_login"
        result.message = str(exc)
        logger.info("采集需要登录：%s", source.source_code)
    except ScraperError as exc:
        result.status = "failed"
        result.message = str(exc)
        logger.warning("采集失败：%s — %s", source.source_code, exc)
    except Exception as exc:  # noqa: BLE001
        result.status = "failed"
        result.message = f"未知错误：{exc}"
        logger.exception("采集异常：%s", source.source_code)

    result.finished_at = datetime.now(timezone.utc)

    # 回写采集源状态
    fresh = scrape_source_store.get(source.source_code)
    if fresh is not None:
        fresh.last_run_at = result.finished_at
        fresh.last_status = result.status
        fresh.last_message = result.message
        fresh.last_new_count = result.new_count
        fresh.total_collected = result.total_count or fresh.total_collected
        scrape_source_store.save(fresh)

    scrape_history_store.append(result)
    return result
