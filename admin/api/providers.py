"""管理端 AI 服务商 API——复用用户端 ai_service / ai_provider_store，带 admin 鉴权。"""
from __future__ import annotations

import openai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal

from app.api.common import ok, validate_key
from app.config import resolve_secret
from app.dependencies import ai_service
from app.services.chat_response import (
    extract_chat_content,
    select_chat_completion_model,
)
from app.services.model_transport import (
    build_prompt_cache_key,
    create_model_completion_sync,
)
from admin.auth import require_admin

router = APIRouter(prefix="/api/admin/providers", tags=["admin-providers"])


def _mask_key(key: str) -> str:
    """脱敏 API Key：只露前后各 4 位，其余打码——密钥明文绝不回传前端。"""
    if not key or len(key) <= 8:
        return "****"
    return key[:4] + "****" + key[-4:]


def _safe_provider_data(data: dict, *, managed: bool) -> dict:
    """后台响应只返回 Key 掩码和是否已配置，绝不回传明文或磁盘密文。"""
    resolved_key = resolve_secret(str(data.get("apiKey", "") or ""))
    safe = {
        key: value
        for key, value in data.items()
        if key not in {"apiKey", "apiKeyEncrypted", "apiKeyStorage"}
    }
    safe["apiKeyMasked"] = _mask_key(resolved_key)
    safe["hasApiKey"] = bool(resolved_key)
    safe["managed"] = managed
    return safe


class ProviderBody(BaseModel):
    """服务商保存/更新请求体：apiKey 传空串表示"沿用已存的旧 key"（配合前端只显示掩码）。"""
    name: str
    endpoint: str
    apiKey: str = ""
    enabled: bool = True
    models: list[dict] = []
    apiMode: Literal["auto", "responses", "chat"] = "responses"


@router.get("")
def list_providers(_: dict = Depends(require_admin)):
    """GET /api/admin/providers：列出全部 AI 服务商（含环境内置与后台托管，managed 字段区分）；apiKey 一律脱敏返回。"""
    providers = ai_service.list_all_providers()
    store = ai_service.store
    result = []
    for p in providers:
        managed = store.get(p.name)
        result.append(_safe_provider_data({
            "name": p.name,
            "endpoint": p.endpoint,
            "apiKey": p.api_key,
            "enabled": p.enabled,
            "models": p.models,
            "apiMode": p.api_mode,
        }, managed=managed is not None))
    return ok(result)


@router.post("")
def save_provider(body: ProviderBody, _: dict = Depends(require_admin)):
    """POST /api/admin/providers：新建（同名则覆盖）托管服务商配置；返回脱敏后的保存结果。"""
    validate_key(body.name, label="provider name")
    if not body.apiKey:
        raise HTTPException(status_code=400, detail="API Key is required for a new managed provider")
    data = {
        "name": body.name,
        "endpoint": body.endpoint,
        "apiKey": body.apiKey,
        "enabled": body.enabled,
        "models": body.models,
        "apiMode": body.apiMode,
    }
    saved = ai_service.store.save(data)
    return ok(_safe_provider_data(saved, managed=True))


@router.put("/{name}")
def update_provider(name: str, body: ProviderBody, _: dict = Depends(require_admin)):
    """PUT /api/admin/providers/{name}：更新服务商；apiKey 留空时保留原 key，防止前端把掩码串回存覆盖真值。"""
    validate_key(name, label="provider name")
    existing = ai_service.store.get(name)
    api_key = body.apiKey
    if not api_key and existing:
        api_key = existing.get("apiKey", "")
    if not api_key:
        raise HTTPException(status_code=400, detail="API Key is required when converting to managed storage")
    data = {
        "name": name,
        "endpoint": body.endpoint,
        "apiKey": api_key,
        "enabled": body.enabled,
        "models": body.models,
        "apiMode": body.apiMode,
    }
    saved = ai_service.store.save(data)
    return ok(_safe_provider_data(saved, managed=True))


@router.delete("/{name}")
def delete_provider(name: str, _: dict = Depends(require_admin)):
    """DELETE /api/admin/providers/{name}：删除托管服务商；不存在返回 404（环境内置的服务商不在删除范围内）。"""
    validate_key(name, label="provider name")
    deleted = ai_service.store.delete(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return ok(True)


@router.post("/{name}/test")
def test_provider(name: str, _: dict = Depends(require_admin)):
    """POST /api/admin/providers/{name}/test：用第一个已配模型发一条极短对话实测连通性；连不通不抛错，结果放 success/error 字段。"""
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
    model_id = select_chat_completion_model(provider.models)
    if not model_id:
        return ok({
            "success": False,
            "error": "No chat-compatible models configured; image models require the Images or Responses API",
        })
    try:
        client = openai.OpenAI(base_url=provider.endpoint, api_key=provider.api_key)
        client._agent_api_mode = provider.api_mode
        resp = create_model_completion_sync(client, {
            "model": model_id,
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 5,
            "timeout": 15,
        }, prompt_cache_key=build_prompt_cache_key(
            model=model_id,
            system_prompt="",
            tools=[],
            scope=f"provider-test:{provider.name}",
        ))
        return ok({
            "success": True,
            "model": model_id,
            "reply": extract_chat_content(resp),
            "transport": str(getattr(resp, "transport", "chat") or "chat"),
        })
    except Exception as exc:
        return ok({"success": False, "model": model_id, "error": str(exc)})
