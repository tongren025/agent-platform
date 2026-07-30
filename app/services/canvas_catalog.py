"""把平台现有数字员工与 AI 供应商配置映射为画布模型目录。

这里是画布 Web 运行时的模型单一真相源：

- 文本节点既可选择数字员工，也可直接选择后台已启用的聊天模型；
- 图片/视频节点只展示平台或员工策略中明确配置、且能解析到供应商的模型；
- 不再把 OpenRouter 的公共全量目录冒充成用户已经配置的模型。
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.config import resolve_secret
from app.core.model_capabilities import (
    is_chat_completion_model_id,
    is_image_generation_model_id,
    is_video_generation_model_id,
)
from app.dependencies import ai_service, employee_registry

SUPPORTED_CANVAS_MODEL_KINDS = {"text", "image", "video"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _model_id(model: dict[str, Any]) -> str:
    return str(
        model.get("modelId")
        or model.get("actualModelId")
        or model.get("modelName")
        or ""
    ).strip()


def _model_name(model: dict[str, Any], fallback: str) -> str:
    return str(model.get("modelName") or model.get("label") or fallback).strip() or fallback


def _string_list(value: Any) -> list[str]:
    if isinstance(value, str):
        return [part.strip().lower() for part in value.replace("->", ",").split(",") if part.strip()]
    if isinstance(value, list):
        return [str(part).strip().lower() for part in value if str(part).strip()]
    return []


def configured_model_kind(model: dict[str, Any]) -> str | None:
    """优先使用显式能力字段，老配置再按模型 ID 做保守识别。"""
    explicit = str(
        model.get("kind")
        or model.get("modelKind")
        or model.get("modelType")
        or ""
    ).strip().lower()
    if explicit in SUPPORTED_CANVAS_MODEL_KINDS:
        return explicit

    architecture = model.get("architecture")
    architecture = architecture if isinstance(architecture, dict) else {}
    output_modalities = (
        _string_list(model.get("outputModalities"))
        or _string_list(model.get("output_modalities"))
        or _string_list(architecture.get("output_modalities"))
        or _string_list(architecture.get("modality"))
    )
    if "video" in output_modalities:
        return "video"
    if "image" in output_modalities:
        return "image"

    model_id = _model_id(model)
    if is_video_generation_model_id(model_id):
        return "video"
    if is_image_generation_model_id(model_id):
        return "image"
    if is_chat_completion_model_id(model_id):
        return "text"
    return None


def _provider_available(provider: Any) -> bool:
    return bool(
        provider.enabled
        and str(provider.endpoint or "").strip()
        and str(provider.api_key or "").strip()
    )


def list_canvas_vendors() -> list[dict[str, Any]]:
    """返回不含密钥的画布供应商目录。"""
    now = _now()
    employees = [employee for employee in employee_registry.list_all() if employee.enabled]
    vendors: list[dict[str, Any]] = []
    if employees:
        vendors.append({
            "key": "platform-employee",
            "name": "Agent Studio 数字员工",
            "enabled": True,
            "hasApiKey": True,
            "authType": "none",
            "baseUrlHint": None,
            "createdAt": now,
            "updatedAt": now,
        })
    for provider in ai_service.list_all_providers():
        has_api_key = bool(resolve_secret(str(provider.api_key or "")))
        vendors.append({
            "key": provider.name,
            "name": provider.name,
            "enabled": bool(provider.enabled),
            "hasApiKey": has_api_key,
            "authType": "bearer",
            "baseUrlHint": provider.endpoint or None,
            "createdAt": now,
            "updatedAt": now,
        })
    return vendors


def _catalog_row(
    *,
    vendor_key: str,
    model_key: str,
    label: str,
    kind: str,
    enabled: bool,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    now = _now()
    return {
        "modelKey": model_key,
        "vendorKey": vendor_key,
        "modelAlias": model_key,
        "labelZh": label,
        "kind": kind,
        "enabled": enabled,
        "meta": meta or {},
        "pricing": {"cost": 0, "enabled": True, "specCosts": []},
        "createdAt": now,
        "updatedAt": now,
    }


def _resolve_employee_media_ref(
    model_ref: str,
    providers: list[Any],
) -> tuple[Any, str, dict[str, Any] | None] | None:
    """把员工策略里的媒体引用解析到供应商；不猜测未配置供应商。"""
    clean_ref = str(model_ref or "").strip()
    if not clean_ref:
        return None
    by_name = {provider.name.lower(): provider for provider in providers}
    if ":" in clean_ref:
        prefix, model_id = clean_ref.split(":", 1)
        provider = by_name.get(prefix.lower())
        if provider is not None and model_id.strip():
            configured = next(
                (
                    model for model in provider.models
                    if _model_id(model).lower() == model_id.strip().lower()
                ),
                None,
            )
            # 员工策略本身也是显式配置；允许 OpenRouter 媒体路由不重复写入供应商模型白名单。
            if configured is not None or provider.name.lower() == "openrouter":
                return provider, model_id.strip(), configured

    for provider in providers:
        configured = next(
            (
                model for model in provider.models
                if _model_id(model).lower() == clean_ref.lower()
            ),
            None,
        )
        if configured is not None:
            return provider, _model_id(configured), configured
    return None


def list_canvas_models(kind: str) -> list[dict[str, Any]]:
    """列出画布真正可选的已配置模型，不访问任何上游公共目录。"""
    if kind not in SUPPORTED_CANVAS_MODEL_KINDS:
        raise ValueError(f"不支持的画布模型类型: {kind}")

    providers = list(ai_service.list_all_providers())
    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()

    if kind == "text":
        for employee in employee_registry.list_all():
            if not employee.enabled:
                continue
            rows.append(_catalog_row(
                vendor_key="platform-employee",
                model_key=employee.employee_key,
                label=employee.name or employee.employee_key,
                kind="text",
                enabled=True,
                meta={
                    "source": "employee",
                    "description": employee.role_profile,
                    "outputModalities": employee.output_modalities,
                },
            ))
            seen.add(("platform-employee", employee.employee_key.lower()))

    for provider in providers:
        for model in provider.models:
            model_id = _model_id(model)
            if not model_id or configured_model_kind(model) != kind:
                continue
            identity = (provider.name.lower(), model_id.lower())
            if identity in seen:
                continue
            seen.add(identity)
            rows.append(_catalog_row(
                vendor_key=provider.name,
                model_key=model_id,
                label=_model_name(model, model_id),
                kind=kind,
                enabled=_provider_available(provider),
                meta={
                    "source": "provider",
                    "providerName": provider.name,
                    "configured": True,
                    "inputModalities": (
                        model.get("inputModalities")
                        or model.get("input_modalities")
                        or ["text"]
                    ),
                    "outputModalities": (
                        model.get("outputModalities")
                        or model.get("output_modalities")
                        or [kind]
                    ),
                    "supportedParameters": model.get("supportedParameters") or {},
                    "supportedResolutions": model.get("supportedResolutions") or [],
                    "supportedAspectRatios": model.get("supportedAspectRatios") or [],
                },
            ))

    if kind in {"image", "video"}:
        policy_key = f"{kind}_model_id"
        for employee in employee_registry.list_all():
            if not employee.enabled or kind not in set(employee.output_modalities or []):
                continue
            resolved = _resolve_employee_media_ref(
                str((employee.default_model_policy or {}).get(policy_key) or ""),
                providers,
            )
            if resolved is None:
                continue
            provider, model_id, configured = resolved
            identity = (provider.name.lower(), model_id.lower())
            if identity in seen:
                continue
            seen.add(identity)
            rows.append(_catalog_row(
                vendor_key=provider.name,
                model_key=model_id,
                label=_model_name(configured or {}, model_id),
                kind=kind,
                enabled=_provider_available(provider),
                meta={
                    "source": "employee-policy",
                    "configured": True,
                    "employeeKeys": [employee.employee_key],
                    "inputModalities": ["text", "image"] if kind == "video" else ["text"],
                    "outputModalities": [kind],
                },
            ))

    return rows


def find_canvas_model(vendor: str, model_key: str, kind: str) -> dict[str, Any] | None:
    """校验一次画布请求仍指向当前已启用目录，防止提交任意上游模型 ID。"""
    vendor_lower = str(vendor or "").strip().lower()
    model_lower = str(model_key or "").strip().lower()
    for row in list_canvas_models(kind):
        if (
            row["enabled"]
            and str(row["vendorKey"]).lower() == vendor_lower
            and str(row["modelKey"]).lower() == model_lower
        ):
            return row
    return None
