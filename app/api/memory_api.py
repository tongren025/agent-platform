"""
长期记忆管理 API。
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.common import ok as _ok
from app.dependencies import long_term_memory
from app.models.memory_types import (
    EpisodicMemory,
    ProceduralMemory,
    SemanticMemory,
)

router = APIRouter(prefix="/api/v1/agentapp/memory", tags=["memory"])


# ── 总览 ─────────────────────────────────────────────

@router.get("/stats/{employee_key}")
async def get_stats(employee_key: str):
    return _ok(long_term_memory.get_stats(employee_key))


@router.get("/all/{employee_key}")
async def get_all(employee_key: str):
    data = long_term_memory.get_all_for_prompt(employee_key)
    return _ok({
        "semantic": [m.model_dump(by_alias=True, mode="json") for m in data["semantic"]],
        "episodic": [m.model_dump(by_alias=True, mode="json") for m in data["episodic"]],
        "procedural": [m.model_dump(by_alias=True, mode="json") for m in data["procedural"]],
    })


# ── 语义记忆 ──────────────────────────────────────────

@router.get("/semantic/{employee_key}")
async def list_semantic(employee_key: str):
    items = long_term_memory.list_semantic(employee_key)
    return _ok([m.model_dump(by_alias=True, mode="json") for m in items])


class SemanticBody(BaseModel):
    content: str
    category: str = "fact"
    importance: float = 0.5

@router.post("/semantic/{employee_key}")
async def add_semantic(employee_key: str, body: SemanticBody):
    m = SemanticMemory(
        employee_key=employee_key,
        content=body.content,
        category=body.category,
        importance=body.importance,
    )
    saved = long_term_memory.add_semantic(employee_key, m)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/semantic/{employee_key}/{memory_id}")
async def delete_semantic(employee_key: str, memory_id: str):
    if not long_term_memory.delete_semantic(employee_key, memory_id):
        raise HTTPException(404, "Memory not found")
    return _ok()


# ── 经验记忆 ──────────────────────────────────────────

@router.get("/episodic/{employee_key}")
async def list_episodic(employee_key: str):
    items = long_term_memory.list_episodic(employee_key)
    return _ok([m.model_dump(by_alias=True, mode="json") for m in items])


class EpisodicBody(BaseModel):
    observation: str
    action: str = ""
    result: str = ""
    success_score: float = Field(0.5, alias="successScore")
    model_config = {"populate_by_name": True}

@router.post("/episodic/{employee_key}")
async def add_episodic(employee_key: str, body: EpisodicBody):
    m = EpisodicMemory(
        employee_key=employee_key,
        observation=body.observation,
        action=body.action,
        result=body.result,
        success_score=body.success_score,
    )
    saved = long_term_memory.add_episodic(employee_key, m)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/episodic/{employee_key}/{memory_id}")
async def delete_episodic(employee_key: str, memory_id: str):
    if not long_term_memory.delete_episodic(employee_key, memory_id):
        raise HTTPException(404, "Memory not found")
    return _ok()


# ── 行为记忆 ──────────────────────────────────────────

@router.get("/procedural/{employee_key}")
async def list_procedural(employee_key: str):
    items = long_term_memory.list_procedural(employee_key)
    return _ok([m.model_dump(by_alias=True, mode="json") for m in items])


class ProceduralBody(BaseModel):
    rule: str
    rationale: str = ""
    confidence: float = 0.5

@router.post("/procedural/{employee_key}")
async def add_procedural(employee_key: str, body: ProceduralBody):
    m = ProceduralMemory(
        employee_key=employee_key,
        rule=body.rule,
        rationale=body.rationale,
        confidence=body.confidence,
    )
    saved = long_term_memory.add_procedural(employee_key, m)
    return _ok(saved.model_dump(by_alias=True, mode="json"))


@router.delete("/procedural/{employee_key}/{memory_id}")
async def delete_procedural(employee_key: str, memory_id: str):
    if not long_term_memory.delete_procedural(employee_key, memory_id):
        raise HTTPException(404, "Memory not found")
    return _ok()


# ── 手动触发记忆提取 ─────────────────────────────────

@router.post("/extract/{employee_key}/{session_id}")
async def trigger_extraction(employee_key: str, session_id: str):
    from app.dependencies import memory_store
    from app.services.memory_extractor import extract_and_store

    session = memory_store.load_session(session_id)
    if session is None:
        raise HTTPException(404, "Session not found")

    messages = [{"role": msg.role, "content": msg.content} for msg in session.messages]
    await extract_and_store(messages, employee_key, session_id)
    return _ok(long_term_memory.get_stats(employee_key))


# ── Deep Dream 蒸馏 ───────────────────────────────────

@router.post("/distill/{employee_key}")
async def trigger_distillation(employee_key: str):
    from app.services.distillation import run_distillation
    log = await run_distillation(employee_key)
    return _ok(log.model_dump(by_alias=True, mode="json"))


@router.get("/distillation-logs/{employee_key}")
async def get_distillation_logs(employee_key: str):
    from app.services.distillation import list_distillation_logs
    logs = list_distillation_logs(employee_key)
    return _ok([lg.model_dump(by_alias=True, mode="json") for lg in logs])
