"""管理端 AI 服务商 API——复用用户端 ai_service / ai_provider_store，带 admin 鉴权。"""
from __future__ import annotations

import openai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.common import ok, validate_key
from app.dependencies import ai_service
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/providers", tags=["admin-providers"])


def _mask_key(key: str) -> str:
    if not key or len(key) <= 8:
        return "****"
    return key[:4] + "****" + key[-4:]


class ProviderBody(BaseModel):
    name: str
    endpoint: str
    apiKey: str = ""
    enabled: bool = True
    models: list[dict] = []


@router.get("")
def list_providers(_: dict = Depends(require_admin)):
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
    return ok(result)


@router.post("")
def save_provider(body: ProviderBody, _: dict = Depends(require_admin)):
    validate_key(body.name, label="provider name")
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
    return ok(safe)


@router.put("/{name}")
def update_provider(name: str, body: ProviderBody, _: dict = Depends(require_admin)):
    validate_key(name, label="provider name")
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
    return ok(safe)


@router.delete("/{name}")
def delete_provider(name: str, _: dict = Depends(require_admin)):
    validate_key(name, label="provider name")
    deleted = ai_service.store.delete(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return ok(True)


@router.post("/{name}/test")
def test_provider(name: str, _: dict = Depends(require_admin)):
    validate_key(name, label="provider name")
    provider = None
    for p in ai_service.list_all_providers():
        if p.name == name:
            provider = p
            break
    if provider is None:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    if not provider.models:
        return ok({"success": False, "error": "No models configured"})
    model_id = provider.models[0].get("modelId", provider.models[0].get("modelName", ""))
    try:
        client = openai.OpenAI(base_url=provider.endpoint, api_key=provider.api_key)
        resp = client.chat.completions.create(
            model=model_id,
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=5,
            timeout=15,
        )
        return ok({"success": True, "model": model_id, "reply": resp.choices[0].message.content})
    except Exception as exc:
        return ok({"success": False, "model": model_id, "error": str(exc)})
