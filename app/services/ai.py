from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Sequence

import openai

from app.config import AiModelConfig, BASE_DIR

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_PROVIDER_DIR = BASE_DIR / "data" / "ai-providers"


class AiProviderStore:

    def __init__(self) -> None:
        _PROVIDER_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _path_for(name: str) -> Path:
        if not name or _BAD_KEY_RE.search(name):
            raise ValueError(f"Invalid provider name: {name!r}")
        return _PROVIDER_DIR / f"{name}.json"

    def list_all(self) -> list[dict]:
        items: list[dict] = []
        if not _PROVIDER_DIR.exists():
            return items
        for fp in _PROVIDER_DIR.glob("*.json"):
            try:
                items.append(json.loads(fp.read_text(encoding="utf-8")))
            except Exception:
                logger.warning("Failed to load provider %s", fp, exc_info=True)
        return items

    def get(self, name: str) -> dict | None:
        fp = self._path_for(name)
        if not fp.exists():
            return None
        return json.loads(fp.read_text(encoding="utf-8"))

    def save(self, data: dict) -> dict:
        name = data.get("name", "")
        fp = self._path_for(name)
        fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return data

    def delete(self, name: str) -> bool:
        fp = self._path_for(name)
        if fp.exists():
            fp.unlink()
            return True
        return False

    def to_ai_configs(self) -> list[AiModelConfig]:
        configs: list[AiModelConfig] = []
        for d in self.list_all():
            configs.append(AiModelConfig(
                name=d["name"],
                endpoint=d.get("endpoint", ""),
                api_key=d.get("apiKey", ""),
                enabled=d.get("enabled", True),
                models=d.get("models", []),
            ))
        return configs


class AIService:

    def __init__(
        self,
        config_providers: Sequence[AiModelConfig],
        provider_store: AiProviderStore,
    ) -> None:
        self._config_providers = list(config_providers)
        self._store = provider_store

    @property
    def _providers(self) -> list[AiModelConfig]:
        managed = self._store.to_ai_configs()
        seen = {p.name.lower() for p in managed}
        merged = list(managed)
        for p in self._config_providers:
            if p.name.lower() not in seen:
                merged.append(p)
        return merged

    def get_client(self, model_id: str, *, async_client: bool = False) -> tuple[openai.OpenAI | openai.AsyncOpenAI, str]:
        if ":" in model_id:
            provider_name, model_name = model_id.split(":", 1)
            return self._resolve_with_provider(provider_name, model_name, async_client=async_client)
        return self._resolve_any(model_id, async_client=async_client)

    def list_providers(self) -> list[AiModelConfig]:
        return [p for p in self._providers if p.enabled]

    def list_all_providers(self) -> list[AiModelConfig]:
        return list(self._providers)

    @property
    def store(self) -> AiProviderStore:
        return self._store

    def _make_client(self, provider: AiModelConfig, *, async_client: bool) -> openai.OpenAI | openai.AsyncOpenAI:
        cls = openai.AsyncOpenAI if async_client else openai.OpenAI
        return cls(base_url=provider.endpoint, api_key=provider.api_key)

    def _resolve_with_provider(
        self, provider_name: str, model_name: str, *, async_client: bool = False,
    ) -> tuple[openai.OpenAI | openai.AsyncOpenAI, str]:
        provider = self._find_provider(provider_name)
        if provider is None:
            raise ValueError(f"AI provider not found: {provider_name!r}")

        resolved_model_id = self._find_model_in_provider(provider, model_name)
        if resolved_model_id is None:
            raise ValueError(
                f"Model {model_name!r} not found in provider {provider_name!r}"
            )

        return self._make_client(provider, async_client=async_client), resolved_model_id

    def _resolve_any(self, model_name: str, *, async_client: bool = False) -> tuple[openai.OpenAI | openai.AsyncOpenAI, str]:
        for provider in self._providers:
            if not provider.enabled:
                continue
            resolved = self._find_model_in_provider(provider, model_name)
            if resolved is not None:
                return self._make_client(provider, async_client=async_client), resolved

        raise ValueError(f"Model {model_name!r} not found in any provider")

    def _find_provider(self, name: str) -> AiModelConfig | None:
        name_lower = name.lower()
        for p in self._providers:
            if p.name.lower() == name_lower and p.enabled:
                return p
        return None

    def get_default_client(self) -> tuple[openai.OpenAI, str]:
        """返回第一个可用 provider 的客户端和默认模型，用于后台任务。"""
        for provider in self._providers:
            if not provider.enabled or not provider.models:
                continue
            model_id = provider.models[0].get("modelId", provider.models[0].get("modelName", ""))
            if model_id:
                client = openai.OpenAI(base_url=provider.endpoint, api_key=provider.api_key)
                return client, model_id
        raise ValueError("没有可用的 AI provider")

    @staticmethod
    def _find_model_in_provider(
        provider: AiModelConfig, model_name: str
    ) -> str | None:
        name_lower = model_name.lower()
        for m in provider.models:
            if m.get("modelName", "").lower() == name_lower:
                return m.get("modelId", m.get("modelName", ""))
            if m.get("modelId", "").lower() == name_lower:
                return m["modelId"]
        return None
