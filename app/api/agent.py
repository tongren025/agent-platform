from __future__ import annotations

import asyncio
import logging
import re

import openai
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.config import settings
from app.dependencies import ai_service, employee_registry, memory_store
from app.models.conversation import AgentRunRequest, AgentRunResponse
from app.services.invocation import run_invocation

router = APIRouter(prefix="/api/v1/agentapp/agent")

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")


def _ok(data: object = None) -> dict:
    return {"code": 200, "data": data}


def _mask_key(key: str) -> str:
    if not key or len(key) <= 8:
        return "****"
    return key[:4] + "****" + key[-4:]


def _extract_description(role_profile: str | None) -> str:
    if not role_profile:
        return ""
    for line in role_profile.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            return stripped
    return ""


def _build_tags(emp) -> list[str]:
    tags: list[str] = []

    skill_count = len(emp.skill_refs) if emp.skill_refs else 0
    if skill_count > 0:
        tags.append(f"{skill_count} 技能")

    tool_count = len(emp.tool_refs) if emp.tool_refs else 0
    if tool_count > 0:
        tags.append(f"{tool_count} 工具")

    mcp_count = len(emp.mcp_server_refs) if emp.mcp_server_refs else 0
    if mcp_count > 0:
        tags.append(f"{mcp_count} MCP服务")

    if emp.deep_agent:
        tags.append("DeepAgent")

    if emp.has_knowledge_base:
        tags.append("知识库")

    return tags


class AiProviderBody(BaseModel):
    name: str
    endpoint: str
    apiKey: str
    enabled: bool = True
    models: list[dict] = []


@router.get("/ai-providers")
def list_ai_providers():
    providers = ai_service.list_all_providers()
    store = ai_service.store
    result = []
    for p in providers:
        managed = store.get(p.name)
        result.append({
            "name": p.name,
            "endpoint": p.endpoint,
            "apiKeyMasked": _mask_key(p.api_key),
            "enabled": p.enabled,
            "models": p.models,
            "managed": managed is not None,
        })
    return _ok(result)


@router.get("/ai-providers/{name}")
def get_ai_provider(name: str):
    if _BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    store = ai_service.store
    data = store.get(name)
    if data is None:
        for p in ai_service.list_all_providers():
            if p.name == name:
                return _ok({
                    "name": p.name,
                    "endpoint": p.endpoint,
                    "apiKey": p.api_key,
                    "apiKeyMasked": _mask_key(p.api_key),
                    "enabled": p.enabled,
                    "models": p.models,
                    "managed": False,
                })
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    safe = dict(data)
    safe["apiKeyMasked"] = _mask_key(safe.get("apiKey", ""))
    safe["managed"] = True
    return _ok(safe)


@router.post("/ai-providers")
def save_ai_provider(body: AiProviderBody):
    if _BAD_KEY_RE.search(body.name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    data = {
        "name": body.name,
        "endpoint": body.endpoint,
        "apiKey": body.apiKey,
        "enabled": body.enabled,
        "models": body.models,
    }
    saved = ai_service.store.save(data)
    safe = dict(saved)
    safe["apiKeyMasked"] = _mask_key(safe.get("apiKey", ""))
    safe["managed"] = True
    return _ok(safe)


@router.put("/ai-providers/{name}")
def update_ai_provider(name: str, body: AiProviderBody):
    if _BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    existing = ai_service.store.get(name)
    api_key = body.apiKey
    if not api_key and existing:
        api_key = existing.get("apiKey", "")
    data = {
        "name": name,
        "endpoint": body.endpoint,
        "apiKey": api_key,
        "enabled": body.enabled,
        "models": body.models,
    }
    saved = ai_service.store.save(data)
    safe = dict(saved)
    safe["apiKeyMasked"] = _mask_key(safe.get("apiKey", ""))
    safe["managed"] = True
    return _ok(safe)


@router.delete("/ai-providers/{name}")
def delete_ai_provider(name: str):
    if _BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    deleted = ai_service.store.delete(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return _ok(True)


@router.post("/ai-providers/{name}/test")
def test_ai_provider(name: str):
    if _BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    provider = None
    for p in ai_service.list_all_providers():
        if p.name == name:
            provider = p
            break
    if provider is None:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    if not provider.models:
        return _ok({"success": False, "error": "No models configured"})
    model_id = provider.models[0].get("modelId", provider.models[0].get("modelName", ""))
    try:
        client = openai.OpenAI(base_url=provider.endpoint, api_key=provider.api_key)
        resp = client.chat.completions.create(
            model=model_id,
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=5,
            timeout=15,
        )
        return _ok({"success": True, "model": model_id, "reply": resp.choices[0].message.content})
    except Exception as exc:
        return _ok({"success": False, "model": model_id, "error": str(exc)})


@router.get("/system-info")
def get_system_info():
    import platform
    providers = ai_service.list_providers()
    total_models = sum(len(p.models) for p in providers)
    return _ok({
        "version": "1.0.0",
        "python": platform.python_version(),
        "platform": platform.system(),
        "port": settings.port,
        "providerCount": len(providers),
        "modelCount": total_models,
        "delegationEnabled": settings.agent.delegation_enabled,
        "delegationMaxDepth": settings.agent.delegation_max_depth,
        "shellEnabled": settings.agent.shell_execute_enabled,
        "knowledgeEnabled": settings.agent.knowledge_enabled,
        "runTimeout": settings.agent.run_timeout_seconds,
    })


@router.get("/employees")
def list_agent_employees():
    employees = employee_registry.list_all()
    result = []
    for emp in employees:
        data = emp.model_dump(by_alias=True, mode="json")
        data["computedTags"] = _build_tags(emp)
        data["computedDescription"] = _extract_description(emp.role_profile)
        result.append(data)
    return _ok(result)


@router.post("/run")
async def run_agent_endpoint(body: AgentRunRequest):
    timeout = settings.agent.run_timeout_seconds

    try:
        agent_result = await asyncio.wait_for(
            run_invocation(body),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Agent run timed out after {timeout}s",
        )
    except Exception as exc:
        logger.exception("Agent run failed for employee=%s", body.employee_key)
        raise HTTPException(
            status_code=500,
            detail=f"Agent run failed: {exc}",
        )

    response = AgentRunResponse(
        assistant_message=agent_result.assistant_message,
        token_usage=agent_result.token_usage,
        traces=agent_result.traces,
        active_scopes=agent_result.active_scopes,
        auto_invoke_count=agent_result.auto_invoke_count,
        session_id=agent_result.session_id,
        pending_approval=agent_result.pending_approval,
        delegation_stack=agent_result.delegation_stack,
    )
    return _ok(response.model_dump(by_alias=True, mode="json"))


@router.get("/sessions")
def list_sessions(
    employeeKey: str = Query(..., alias="employeeKey"),
    limit: int = Query(20, alias="limit"),
):
    sessions = memory_store.list_sessions(employeeKey, limit=limit)
    return _ok([
        s.model_dump(by_alias=True, mode="json") for s in sessions
    ])


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    deleted = memory_store.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    return _ok(True)
