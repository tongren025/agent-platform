"""AI Provider 管理 API。

从 agent.py 拆出——单一职责：AI 模型供应商的 CRUD 与连通测试。

Prefix: /api/v1/agentapp/agent  （保持前端路由不变）
"""
from __future__ import annotations

import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.common import BAD_KEY_RE, ok as _ok
from app.config import settings
from app.dependencies import ai_service

router = APIRouter(prefix="/api/v1/agentapp/agent")


def _mask_key(key: str) -> str:
    if not key or len(key) <= 8:
        return "****"
    return key[:4] + "****" + key[-4:]


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
    if BAD_KEY_RE.search(name):
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
    if BAD_KEY_RE.search(body.name):
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
    if BAD_KEY_RE.search(name):
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
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    deleted = ai_service.store.delete(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return _ok(True)


@router.post("/ai-providers/{name}/test")
def test_ai_provider(name: str):
    if BAD_KEY_RE.search(name):
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
