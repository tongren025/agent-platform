"""AI Provider 管理 API。

从 agent.py 拆出——单一职责：AI 模型供应商的 CRUD 与连通测试。

Prefix: /api/v1/agentapp/agent  （保持前端路由不变）
"""
from __future__ import annotations

import logging
from collections.abc import Iterable

import openai
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.common import BAD_KEY_RE, ok as _ok
from app.config import resolve_secret, settings
from app.dependencies import ai_service

router = APIRouter(prefix="/api/v1/agentapp/agent")
logger = logging.getLogger(__name__)

_GPT_MODEL_DISPLAY_NAMES = {
    "gpt-5.6-terra": "GPT-5.6 Terra（中档·视觉）",
    "gpt-5.6-sol": "GPT-5.6 Sol（高档·视觉）",
    "gpt-5.6-luna": "GPT-5.6 Luna（经济档·视觉）",
}
_GPT_MODEL_PRIORITY = {
    "gpt-5.6-terra": 0,
    "gpt-5.6-sol": 1,
    "gpt-5.6-luna": 2,
}
_SPECIALIZED_GPT_MARKERS = (
    "audio",
    "codex",
    "image",
    "realtime",
    "search-preview",
    "transcribe",
    "tts",
)


def _mask_key(key: str) -> str:
    """把 API Key 脱敏为 "前4位****后4位"，短 key 直接返回 "****"，避免明文外泄。"""
    if not key or len(key) <= 8:
        return "****"
    return key[:4] + "****" + key[-4:]


def _safe_provider_data(data: dict, *, managed: bool) -> dict:
    """构造可回传前端的供应商数据，明文/密文 Key 均不得离开服务端。"""
    raw_key = str(data.get("apiKey", "") or "")
    resolved_key = resolve_secret(raw_key)
    safe = {
        key: value
        for key, value in data.items()
        if key not in {"apiKey", "apiKeyEncrypted", "apiKeyStorage"}
    }
    safe["apiKeyMasked"] = _mask_key(resolved_key)
    safe["hasApiKey"] = bool(resolved_key)
    safe["managed"] = managed
    return safe


class AiProviderBody(BaseModel):
    """POST/PUT /ai-providers 的请求体：AI 供应商配置（名称、endpoint、apiKey、启用状态与模型列表）。"""
    name: str
    endpoint: str
    apiKey: str
    enabled: bool = True
    models: list[dict] = []


class ProviderModelBody(BaseModel):
    """追加到供应商模型列表的单个模型。"""
    modelName: str
    modelId: str
    timeoutMinutes: int = 20


@router.get("/ai-providers")
def list_ai_providers():
    """GET /ai-providers：列出全部供应商（含配置文件内置与用户自管），apiKey 脱敏返回，managed 标记是否可编辑。"""
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
        }, managed=managed is not None))
    return _ok(result)


def _is_free_openrouter_model(item: dict) -> bool:
    """按 OpenRouter 返回的 id/pricing 判断是否免费。"""
    if str(item.get("id", "")).endswith(":free"):
        return True
    pricing = item.get("pricing") or {}
    prompt = float(pricing.get("prompt") or 0)
    completion = float(pricing.get("completion") or 0)
    return prompt == 0 and completion == 0


def _is_general_gpt_model(model_id: str) -> bool:
    """只保留适合普通文字/视觉对话的 GPT 模型，排除需专用 API 的模型。"""
    normalized = model_id.strip().lower()
    return normalized.startswith("gpt-") and not any(
        marker in normalized for marker in _SPECIALIZED_GPT_MARKERS
    )


def _sorted_general_gpt_ids(model_ids: Iterable[str]) -> list[str]:
    """去重并排序 GPT 模型；5.6 主力档位置顶，其余按模型 ID 排序。"""
    unique = {
        model_id.strip()
        for model_id in model_ids
        if isinstance(model_id, str) and _is_general_gpt_model(model_id)
    }
    return sorted(
        unique,
        key=lambda model_id: (
            _GPT_MODEL_PRIORITY.get(model_id.lower(), 100),
            model_id.lower(),
        ),
    )


@router.get("/openrouter/models")
def list_openrouter_models():
    """实时拉取完整模型目录，并清理本地已加入但已从 OpenRouter 下线的模型。"""
    try:
        resp = httpx.get(
            "https://openrouter.ai/api/v1/models",
            params={"output_modalities": "all"},
            timeout=20,
        )
        resp.raise_for_status()
        raw = resp.json().get("data", [])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenRouter models fetch failed: {exc}") from exc

    # 清理只能基于一次成功且非空的完整目录；上游异常返回空数组时宁可报错，
    # 也不能把本地模型配置误判为全部下线。
    if not isinstance(raw, list) or not raw:
        raise HTTPException(status_code=502, detail="OpenRouter models fetch returned an empty catalog")
    raw = [
        item
        for item in raw
        if isinstance(item, dict) and item.get("id")
    ]
    if not raw:
        raise HTTPException(status_code=502, detail="OpenRouter models fetch returned no valid model IDs")
    catalog_ids = {str(item["id"]) for item in raw}

    configured = set()
    for p in ai_service.list_all_providers():
        if p.name.lower() == "openrouter":
            managed = ai_service.store.get(p.name)
            if managed is None:
                configured = {
                    m.get("modelId") or m.get("modelName")
                    for m in p.models
                    if (m.get("modelId") or m.get("modelName")) in catalog_ids
                }
                break

            previous_models = list(managed.get("models") or [])
            active_models = [
                model
                for model in previous_models
                if (model.get("modelId") or model.get("modelName")) in catalog_ids
            ]
            if len(active_models) != len(previous_models):
                updated = dict(managed)
                updated["models"] = active_models
                ai_service.store.save(updated)
                logger.info(
                    "OpenRouter 模型目录刷新：清理 %d 个已下线模型",
                    len(previous_models) - len(active_models),
                )
            configured = {
                model.get("modelId") or model.get("modelName")
                for model in active_models
            }
            break

    models = []
    for item in raw:
        pricing = item.get("pricing") or {}
        architecture = item.get("architecture") or {}
        top_provider = item.get("top_provider") or {}
        model_id = item.get("id", "")
        models.append({
            "id": model_id,
            "name": item.get("name") or model_id,
            "contextLength": item.get("context_length") or top_provider.get("context_length"),
            "promptPrice": pricing.get("prompt"),
            "completionPrice": pricing.get("completion"),
            "isFree": _is_free_openrouter_model(item),
            "modality": architecture.get("modality"),
            "inputModalities": architecture.get("input_modalities") or [],
            "outputModalities": architecture.get("output_modalities") or [],
            "configured": model_id in configured,
        })
    return _ok(models)


@router.post("/ai-providers/{name}/models")
def add_ai_provider_model(name: str, body: ProviderModelBody):
    """POST /ai-providers/{name}/models：把一个模型追加到供应商配置，已存在则更新名称/超时。"""
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    provider = None
    for p in ai_service.list_all_providers():
        if p.name.lower() == name.lower():
            provider = p
            break
    if provider is None:
        if name.lower() != "openrouter":
            raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
        data = {
            "name": "openrouter",
            "endpoint": "https://openrouter.ai/api/v1",
            "apiKey": "${OPENROUTER_API_KEY}",
            "enabled": True,
            "models": [],
        }
    else:
        existing = ai_service.store.get(provider.name)
        data = existing or {
            "name": provider.name,
            "endpoint": provider.endpoint,
            "apiKey": "${OPENROUTER_API_KEY}" if provider.name.lower() == "openrouter" else provider.api_key,
            "enabled": provider.enabled,
            "models": list(provider.models),
        }

    models = list(data.get("models") or [])
    next_model = {
        "modelName": body.modelName or body.modelId,
        "modelId": body.modelId or body.modelName,
        "timeoutMinutes": body.timeoutMinutes or 20,
    }
    replaced = False
    for idx, model in enumerate(models):
        if (model.get("modelId") or model.get("modelName")) == next_model["modelId"]:
            models[idx] = next_model
            replaced = True
            break
    if not replaced:
        models.append(next_model)
    data["models"] = models
    saved = ai_service.store.save(data)
    return _ok(_safe_provider_data(saved, managed=True))


@router.post("/ai-providers/{name}/models/sync-gpt")
def sync_ai_provider_gpt_models(name: str):
    """从供应商 /models 同步当前 Key 可用的通用 GPT 文字/视觉模型。"""
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")

    provider = next(
        (item for item in ai_service.list_all_providers() if item.name.lower() == name.lower()),
        None,
    )
    if provider is None:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    if not provider.api_key:
        raise HTTPException(status_code=400, detail="API Key is required before syncing models")

    try:
        client = openai.OpenAI(base_url=provider.endpoint, api_key=provider.api_key)
        catalog = client.models.list()
        model_ids = [str(item.id) for item in catalog.data if getattr(item, "id", None)]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"GPT models fetch failed: {exc}") from exc

    synced_ids = _sorted_general_gpt_ids(model_ids)
    if not synced_ids:
        raise HTTPException(
            status_code=502,
            detail="Provider returned no general-purpose GPT models",
        )

    existing = ai_service.store.get(provider.name)
    data = existing or {
        "name": provider.name,
        "endpoint": provider.endpoint,
        "apiKey": provider.api_key,
        "enabled": provider.enabled,
        "models": list(provider.models),
    }
    previous_by_id = {
        str(model.get("modelId") or model.get("modelName")): model
        for model in data.get("models") or []
        if model.get("modelId") or model.get("modelName")
    }
    previous_gpt_ids = {
        model_id for model_id in previous_by_id if _is_general_gpt_model(model_id)
    }
    preserved_models = [
        model
        for model_id, model in previous_by_id.items()
        if not _is_general_gpt_model(model_id)
    ]
    models = []
    for model_id in synced_ids:
        previous = previous_by_id.get(model_id, {})
        models.append({
            "modelName": _GPT_MODEL_DISPLAY_NAMES.get(
                model_id.lower(),
                previous.get("modelName") or model_id,
            ),
            "modelId": model_id,
            "timeoutMinutes": previous.get("timeoutMinutes") or 10,
        })
    models.extend(preserved_models)

    data["models"] = models
    saved = ai_service.store.save(data)
    synced_id_set = set(synced_ids)
    return _ok({
        "provider": _safe_provider_data(saved, managed=True),
        "syncedCount": len(models),
        "gptCount": len(synced_ids),
        "addedCount": len(synced_id_set - previous_gpt_ids),
        "removedCount": len(previous_gpt_ids - synced_id_set),
    })


@router.get("/ai-providers/{name}")
def get_ai_provider(name: str):
    """GET /ai-providers/{name}：返回单个供应商详情；API Key 只返回掩码，名称非法返 400。"""
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    store = ai_service.store
    data = store.get(name)
    if data is None:
        for p in ai_service.list_all_providers():
            if p.name == name:
                return _ok(_safe_provider_data({
                    "name": p.name,
                    "endpoint": p.endpoint,
                    "apiKey": p.api_key,
                    "enabled": p.enabled,
                    "models": p.models,
                }, managed=False))
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return _ok(_safe_provider_data(data, managed=True))


@router.post("/ai-providers")
def save_ai_provider(body: AiProviderBody):
    """POST /ai-providers：新建（或按名称覆盖）一个用户自管供应商；名称非法返 400。"""
    if BAD_KEY_RE.search(body.name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    if not body.apiKey:
        raise HTTPException(status_code=400, detail="API Key is required for a new managed provider")
    data = {
        "name": body.name,
        "endpoint": body.endpoint,
        "apiKey": body.apiKey,
        "enabled": body.enabled,
        "models": body.models,
    }
    saved = ai_service.store.save(data)
    return _ok(_safe_provider_data(saved, managed=True))


@router.put("/ai-providers/{name}")
def update_ai_provider(name: str, body: AiProviderBody):
    """PUT /ai-providers/{name}：更新供应商配置；apiKey 传空表示沿用旧值；名称非法返 400。"""
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
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
    }
    saved = ai_service.store.save(data)
    return _ok(_safe_provider_data(saved, managed=True))


@router.delete("/ai-providers/{name}")
def delete_ai_provider(name: str):
    """DELETE /ai-providers/{name}：删除用户自管供应商；名称非法返 400，不存在返 404。"""
    if BAD_KEY_RE.search(name):
        raise HTTPException(status_code=400, detail="Invalid provider name")
    deleted = ai_service.store.delete(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Provider not found: {name}")
    return _ok(True)


@router.post("/ai-providers/{name}/test")
def test_ai_provider(name: str):
    """POST /ai-providers/{name}/test：用首个模型发一条测试消息验证连通性；结果放在 success 字段而非 HTTP 状态码。"""
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
    """GET /system-info：返回运行环境与 agent 关键开关（版本、端口、供应商/模型数量、委派/Shell/知识库配置等）。"""
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
