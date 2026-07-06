"""AI 供应商（provider）配置存储 + LLM 客户端解析。

- AiProviderStore：把用户在管理端配置的 AI 供应商持久化为 data/ai-providers/*.json。
- AIService：把一个 model_id 解析到具体供应商，并造出对应的 OpenAI 兼容客户端，
  供 agent 运行时调用。支持「供应商名:模型名」显式指定，或只给模型名跨供应商查找。
"""
from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Sequence

import openai

from app.config import AiModelConfig, BASE_DIR

logger = logging.getLogger(__name__)

# 供应商名用作文件名，禁止斜杠 / 反斜杠 / .. 以防路径穿越
_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_PROVIDER_DIR = BASE_DIR / "data" / "ai-providers"


class AiProviderStore:
    """AI 供应商配置的文件存储（每个供应商一份 data/ai-providers/<name>.json）。"""

    def __init__(self) -> None:
        _PROVIDER_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _path_for(name: str) -> Path:
        """把供应商名映射到 json 文件路径，并校验名字合法（防路径穿越）。"""
        if not name or _BAD_KEY_RE.search(name):
            raise ValueError(f"Invalid provider name: {name!r}")
        return _PROVIDER_DIR / f"{name}.json"

    def list_all(self) -> list[dict]:
        """读出目录下所有供应商配置；单个文件损坏只告警跳过，不中断。"""
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
        """按名读取单个供应商配置，不存在返回 None。"""
        fp = self._path_for(name)
        if not fp.exists():
            return None
        return json.loads(fp.read_text(encoding="utf-8"))

    def save(self, data: dict) -> dict:
        """写入/覆盖一个供应商配置（以 data['name'] 为文件名），返回原数据。"""
        name = data.get("name", "")
        fp = self._path_for(name)
        fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return data

    def delete(self, name: str) -> bool:
        """删除指定供应商配置，成功返回 True，本不存在返回 False。"""
        fp = self._path_for(name)
        if fp.exists():
            fp.unlink()
            return True
        return False

    def to_ai_configs(self) -> list[AiModelConfig]:
        """把存储里的原始 dict 转成强类型 AiModelConfig 列表（供 AIService 使用）。"""
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
    """LLM 客户端解析服务：把 model_id 解析为 (OpenAI 客户端, 真实模型 id)。

    供应商来源有两处：管理端动态配置(存储) + 启动配置内置(config_providers)，
    合并时存储优先、内置补充。
    """

    def __init__(
        self,
        config_providers: Sequence[AiModelConfig],
        provider_store: AiProviderStore,
    ) -> None:
        self._config_providers = list(config_providers)
        self._store = provider_store

    @property
    def _providers(self) -> list[AiModelConfig]:
        """合并「存储管理的」与「启动配置内置的」供应商，同名以存储为准、内置不覆盖。"""
        managed = self._store.to_ai_configs()
        seen = {p.name.lower() for p in managed}
        merged = list(managed)
        for p in self._config_providers:
            if p.name.lower() not in seen:
                merged.append(p)
        return merged

    def get_client(self, model_id: str, *, async_client: bool = False) -> tuple[openai.OpenAI | openai.AsyncOpenAI, str]:
        """解析 model_id 并返回可直接调用的客户端 + 真实模型 id。

        model_id 带冒号（provider:model）时锁定供应商查找；否则跨所有启用供应商找第一个匹配。
        async_client=True 时返回 AsyncOpenAI（供异步任务/队列使用）。
        """
        if ":" in model_id:
            provider_name, model_name = model_id.split(":", 1)
            return self._resolve_with_provider(provider_name, model_name, async_client=async_client)
        return self._resolve_any(model_id, async_client=async_client)

    def list_providers(self) -> list[AiModelConfig]:
        """列出所有「已启用」的供应商。"""
        return [p for p in self._providers if p.enabled]

    def list_all_providers(self) -> list[AiModelConfig]:
        """列出全部供应商（含未启用），用于管理端展示。"""
        return list(self._providers)

    @property
    def store(self) -> AiProviderStore:
        """暴露底层供应商存储，供管理端做增删改。"""
        return self._store

    def _make_client(self, provider: AiModelConfig, *, async_client: bool) -> openai.OpenAI | openai.AsyncOpenAI:
        """按供应商的 endpoint / api_key 造一个同步或异步 OpenAI 客户端。"""
        cls = openai.AsyncOpenAI if async_client else openai.OpenAI
        return cls(base_url=provider.endpoint, api_key=provider.api_key)

    def _resolve_with_provider(
        self, provider_name: str, model_name: str, *, async_client: bool = False,
    ) -> tuple[openai.OpenAI | openai.AsyncOpenAI, str]:
        """在「指定供应商」内查找模型；供应商或模型缺失都抛 ValueError。"""
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
        """跨所有「已启用」供应商查找模型，命中第一个即返回；都没有则抛 ValueError。"""
        for provider in self._providers:
            if not provider.enabled:
                continue
            resolved = self._find_model_in_provider(provider, model_name)
            if resolved is not None:
                return self._make_client(provider, async_client=async_client), resolved

        raise ValueError(f"Model {model_name!r} not found in any provider")

    def _find_provider(self, name: str) -> AiModelConfig | None:
        """按名（不区分大小写）查找一个「已启用」的供应商。"""
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
        """在某供应商的模型列表里匹配（按 modelName 或 modelId），返回真实 modelId。"""
        name_lower = model_name.lower()
        for m in provider.models:
            if m.get("modelName", "").lower() == name_lower:
                return m.get("modelId", m.get("modelName", ""))
            if m.get("modelId", "").lower() == name_lower:
                return m["modelId"]
        return None
