"""
自动学习 / 提示词采集 API。

Prefix: /api/v1/agentapp/scrape
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel as _BaseModel, Field

from app.api.common import ok as _ok, validate_key as _validate
from app.dependencies import (
    collected_prompt_store,
    employee_registry,
    learn_history_store,
    learn_source_store,
    scrape_history_store,
    scrape_source_store,
)
from app.models.learn import LearnSource
from app.models.scrape import ScrapeSource
from app.services.learn_runner import run_learn
from app.services.scrape_runner import run_scrape

router = APIRouter(prefix="/api/v1/agentapp/scrape")


class _LearnRequest(_BaseModel):
    model_config = {"populate_by_name": True}
    url: str = ""
    role_hint: str = Field("", alias="roleHint")


# ── 采集源 CRUD ─────────────────────────────────────────────────────

@router.get("/sources")
def list_sources():
    items = scrape_source_store.list_all()
    return _ok([s.model_dump(by_alias=True, mode="json") for s in items])


@router.get("/sources/{code}")
def get_source(code: str):
    _validate(code)
    src = scrape_source_store.get(code)
    if src is None:
        raise HTTPException(status_code=404, detail=f"Source not found: {code}")
    return _ok(src.model_dump(by_alias=True, mode="json"))


@router.post("/sources")
def create_source(body: ScrapeSource):
    _validate(body.source_code)
    if scrape_source_store.exists(body.source_code):
        raise HTTPException(status_code=409, detail=f"Source already exists: {body.source_code}")
    # 运行时状态字段一律由服务端初始化，忽略客户端可能传入的伪造值
    body.last_run_at = None
    body.last_status = ""
    body.last_message = ""
    body.last_new_count = 0
    body.total_collected = 0
    saved = scrape_source_store.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/sources/{code}")
def update_source(code: str, body: ScrapeSource):
    _validate(code)
    existing = scrape_source_store.get(code)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Source not found: {code}")
    body.source_code = code
    # 保留运行时状态字段
    body.last_run_at = existing.last_run_at
    body.last_status = existing.last_status
    body.last_message = existing.last_message
    body.last_new_count = existing.last_new_count
    body.total_collected = existing.total_collected
    saved = scrape_source_store.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/sources/{code}")
def delete_source(code: str):
    _validate(code)
    if not scrape_source_store.delete(code):
        raise HTTPException(status_code=404, detail=f"Source not found: {code}")
    collected_prompt_store.delete_all(code)
    scrape_history_store.delete_all(code)
    return _ok(True)


# ── 立即采集 ────────────────────────────────────────────────────────

@router.post("/sources/{code}/run")
async def run_source_now(code: str):
    _validate(code)
    src = scrape_source_store.get(code)
    if src is None:
        raise HTTPException(status_code=404, detail=f"Source not found: {code}")
    result = await run_scrape(src)
    return _ok(result.model_dump(by_alias=True, mode="json"))


# ── 已采集提示词 / 历史 ─────────────────────────────────────────────

@router.get("/sources/{code}/prompts")
def list_prompts(code: str, limit: int = Query(200, ge=1, le=600)):
    _validate(code)
    items = collected_prompt_store.list(code)[:limit]
    return _ok([p.model_dump(by_alias=True, mode="json") for p in items])


@router.get("/sources/{code}/history")
def list_history(code: str):
    _validate(code)
    items = scrape_history_store.list(code)
    return _ok([h.model_dump(by_alias=True, mode="json") for h in items])


# ── 文章学习（抓取 → LLM 总结 → 注入知识库 + 记忆）────────────────

@router.post("/learn/{employee_key}")
async def learn_from_article(employee_key: str, body: _LearnRequest):
    """让指定员工从一篇网页文章中学习专业知识。"""
    _validate(employee_key)
    emp = employee_registry.get(employee_key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {employee_key}")
    if not body.url:
        raise HTTPException(status_code=400, detail="url is required")
    role_hint = body.role_hint or emp.name
    from app.services.scraper import scrape_and_summarize
    result = await scrape_and_summarize(body.url, employee_key, role_hint)
    return _ok(result)


@router.post("/learn-batch/{employee_key}")
async def learn_batch(employee_key: str, body: list[_LearnRequest]):
    """批量学习：一次性给指定员工喂多篇文章。"""
    _validate(employee_key)
    emp = employee_registry.get(employee_key)
    if emp is None:
        raise HTTPException(status_code=404, detail=f"Employee not found: {employee_key}")
    from app.services.scraper import scrape_and_summarize, ScraperError as _SE
    results = []
    for item in body[:20]:
        if not item.url:
            continue
        try:
            r = await scrape_and_summarize(
                item.url, employee_key, item.role_hint or emp.name
            )
            results.append({"url": item.url, "status": "ok", **r})
        except _SE as exc:
            results.append({"url": item.url, "status": "failed", "message": str(exc)})
        except Exception as exc:
            results.append({"url": item.url, "status": "error", "message": str(exc)})
    return _ok(results)


# ── 定时文章学习：学习源 CRUD + 立即学习 + 历史 ────────────────────

@router.get("/learn-sources")
def list_learn_sources():
    items = learn_source_store.list_all()
    return _ok([s.model_dump(by_alias=True, mode="json") for s in items])


@router.get("/learn-sources/{code}")
def get_learn_source(code: str):
    _validate(code)
    src = learn_source_store.get(code)
    if src is None:
        raise HTTPException(status_code=404, detail=f"Learn source not found: {code}")
    return _ok(src.model_dump(by_alias=True, mode="json"))


@router.post("/learn-sources")
def create_learn_source(body: LearnSource):
    _validate(body.source_code)
    if learn_source_store.exists(body.source_code):
        raise HTTPException(status_code=409, detail=f"Learn source already exists: {body.source_code}")
    body.last_run_at = None
    body.last_status = ""
    body.last_message = ""
    body.last_learned_count = 0
    body.total_learned = 0
    saved = learn_source_store.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.put("/learn-sources/{code}")
def update_learn_source(code: str, body: LearnSource):
    _validate(code)
    existing = learn_source_store.get(code)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Learn source not found: {code}")
    body.source_code = code
    body.last_run_at = existing.last_run_at
    body.last_status = existing.last_status
    body.last_message = existing.last_message
    body.last_learned_count = existing.last_learned_count
    body.total_learned = existing.total_learned
    saved = learn_source_store.save(body)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/learn-sources/{code}")
def delete_learn_source(code: str):
    _validate(code)
    if not learn_source_store.delete(code):
        raise HTTPException(status_code=404, detail=f"Learn source not found: {code}")
    learn_history_store.delete_all(code)
    return _ok(True)


@router.post("/learn-sources/{code}/run")
async def run_learn_source_now(code: str):
    _validate(code)
    src = learn_source_store.get(code)
    if src is None:
        raise HTTPException(status_code=404, detail=f"Learn source not found: {code}")
    result = await run_learn(src)
    return _ok(result.model_dump(by_alias=True, mode="json"))


@router.get("/learn-sources/{code}/history")
def list_learn_history(code: str):
    _validate(code)
    items = learn_history_store.list(code)
    return _ok([h.model_dump(by_alias=True, mode="json") for h in items])


# ── 目标员工候选（便于前端下拉）────────────────────────────────────

@router.get("/employees")
def list_target_employees():
    emps = employee_registry.list_all()
    return _ok([
        {"employeeKey": e.employee_key, "name": e.name}
        for e in emps
    ])
