"""AI 供应商（provider）配置存储 + LLM 客户端解析。

- AiProviderStore：把用户在管理端配置的 AI 供应商持久化为 data/ai-providers/*.json，
  API Key 使用服务器本地 Fernet 主密钥加密后落盘；旧版明文文件在读取时自动迁移。
- AIService：把一个 model_id 解析到具体供应商，并造出对应的 OpenAI 兼容客户端，
  供 agent 运行时调用。支持「供应商名:模型名」显式指定，或只给模型名跨供应商查找。
"""
from __future__ import annotations

import json
import logging
import os
import re
import tempfile
import time
from pathlib import Path
from threading import Lock
from typing import Sequence

import openai
from cryptography.fernet import Fernet, InvalidToken

from app.config import AiModelConfig, BASE_DIR, resolve_secret

logger = logging.getLogger(__name__)

# 供应商名用作文件名，禁止斜杠 / 反斜杠 / .. 以防路径穿越
_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_PROVIDER_DIR = BASE_DIR / "data" / "ai-providers"
_SECRET_ENV_NAME = "AI_PROVIDER_ENCRYPTION_KEY"
_SECRET_PREFIX = "fernet:v1:"


class ProviderSecretError(RuntimeError):
    """供应商密钥无法加密/解密时抛出；错误信息永不包含密钥或密文。"""


def _is_env_reference(value: str) -> bool:
    """`${ENV_NAME}` 只是环境变量引用，不属于需要再次加密的密钥明文。"""
    return value.startswith("${") and value.endswith("}") and len(value) > 3


class _ProviderSecretCipher:
    """延迟加载 Fernet 主密钥，避免未保存后台密钥时生成无用文件。

    优先读取服务器环境变量 `AI_PROVIDER_ENCRYPTION_KEY`；未配置时，在与供应商目录
    同一持久化数据根下生成 `.secrets/provider-encryption.key`。app/admin/worker 共享同一
    `/app/data`（标准版 named volume、生产版服务器 bind mount），容器重启后仍可解密。
    """

    def __init__(self, key_path: Path, configured_key: str | bytes | None = None) -> None:
        self._key_path = key_path
        self._configured_key = configured_key
        self._fernet: Fernet | None = None

    def encrypt(self, value: str) -> str:
        """加密明文并附加格式版本前缀。"""
        token = self._get_fernet().encrypt(value.encode("utf-8")).decode("ascii")
        return _SECRET_PREFIX + token

    def decrypt(self, value: str) -> str:
        """解密带版本前缀的密文；主密钥不匹配时给出可运维但不泄密的错误。"""
        if not value.startswith(_SECRET_PREFIX):
            raise ProviderSecretError("不支持的供应商密钥密文格式")
        token = value[len(_SECRET_PREFIX):]
        try:
            return self._get_fernet().decrypt(token.encode("ascii")).decode("utf-8")
        except (InvalidToken, UnicodeDecodeError, UnicodeEncodeError) as exc:
            raise ProviderSecretError(
                "供应商密钥无法解密：服务器主密钥不匹配或密文已损坏"
            ) from exc

    def _get_fernet(self) -> Fernet:
        """首次真正加解密时才装载主密钥。"""
        if self._fernet is not None:
            return self._fernet

        configured = self._configured_key
        if configured is None:
            configured = os.getenv(_SECRET_ENV_NAME, "").strip() or None
        key = configured if configured is not None else self._load_or_create_file_key()
        try:
            if isinstance(key, str):
                key = key.encode("ascii", errors="strict")
            self._fernet = Fernet(key)
        except (TypeError, ValueError, UnicodeEncodeError) as exc:
            raise ProviderSecretError(
                f"{_SECRET_ENV_NAME} 不是有效的 Fernet key；请重新生成 32 字节 URL-safe base64 key"
            ) from exc
        return self._fernet

    def _load_or_create_file_key(self) -> bytes:
        """从持久卷读取主密钥；不存在时用 O_EXCL 原子创建，兼容多进程同时启动。"""
        self._key_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(self._key_path.parent, 0o700)
        except OSError:
            pass

        try:
            return self._read_file_key()
        except ProviderSecretError:
            # 文件可能刚被并发进程以 O_EXCL 建立但尚未写完；只对空文件短暂重试。
            if not self._key_path.exists() or self._key_path.stat().st_size > 0:
                raise
            for _ in range(40):
                try:
                    return self._read_file_key()
                except ProviderSecretError:
                    time.sleep(0.05)
            raise ProviderSecretError("服务器供应商加密主密钥文件为空")
        except FileNotFoundError:
            generated = Fernet.generate_key()
            flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
            try:
                fd = os.open(self._key_path, flags, 0o600)
            except FileExistsError:
                # 另一个 app/admin/worker 进程刚创建文件，等待它完成写入。
                for _ in range(40):
                    try:
                        return self._read_file_key()
                    except (FileNotFoundError, ProviderSecretError):
                        time.sleep(0.05)
                raise ProviderSecretError("服务器供应商加密主密钥文件创建不完整")

            with os.fdopen(fd, "wb") as handle:
                handle.write(generated)
                handle.flush()
                os.fsync(handle.fileno())
            try:
                os.chmod(self._key_path, 0o600)
            except OSError:
                pass
            logger.info("Generated provider encryption key at %s", self._key_path)
            return generated

    def _read_file_key(self) -> bytes:
        """读取非空主密钥文件；不把内容写入日志或异常。"""
        raw = self._key_path.read_bytes().strip()
        if not raw:
            raise ProviderSecretError("服务器供应商加密主密钥文件为空")
        return raw


# 系统内其它凭证（例如 MCP OAuth token）复用同一套本地密钥治理。
# 保留旧类名避免影响现有供应商存储，同时提供有明确用途的公共名称。
LocalSecretCipher = _ProviderSecretCipher


class AiProviderStore:
    """AI 供应商配置文件存储；对调用方返回明文，对磁盘只写密文或环境变量引用。"""

    def __init__(
        self,
        provider_dir: Path | None = None,
        encryption_key: str | bytes | None = None,
    ) -> None:
        self._provider_dir = Path(provider_dir) if provider_dir is not None else _PROVIDER_DIR
        self._provider_dir.mkdir(parents=True, exist_ok=True)
        key_path = self._provider_dir.parent / ".secrets" / "provider-encryption.key"
        self._cipher = _ProviderSecretCipher(key_path, configured_key=encryption_key)

    @property
    def provider_dir(self) -> Path:
        """供应商 JSON 所在目录，供部署检查与测试隔离使用。"""
        return self._provider_dir

    def _path_for(self, name: str) -> Path:
        """把供应商名映射到 json 文件路径，并校验名字合法（防路径穿越）。"""
        if not name or _BAD_KEY_RE.search(name):
            raise ValueError(f"Invalid provider name: {name!r}")
        return self._provider_dir / f"{name}.json"

    def list_all(self) -> list[dict]:
        """读出并解密全部供应商配置；旧明文文件会就地迁移为密文。"""
        items: list[dict] = []
        if not self._provider_dir.exists():
            return items
        for fp in sorted(self._provider_dir.glob("*.json")):
            try:
                items.append(self._load_path(fp))
            except Exception:
                logger.warning("Failed to load provider %s", fp, exc_info=True)
        return items

    def get(self, name: str) -> dict | None:
        """按名读取单个供应商配置，不存在返回 None。"""
        fp = self._path_for(name)
        if not fp.exists():
            return None
        return self._load_path(fp)

    def save(self, data: dict) -> dict:
        """写入/覆盖配置；实际 API Key 加密落盘，返回调用方提供的逻辑明文视图。"""
        name = data.get("name", "")
        fp = self._path_for(name)
        logical = dict(data)
        logical["name"] = name
        logical["apiKey"] = str(logical.get("apiKey", "") or "")
        logical.pop("apiKeyEncrypted", None)
        logical.pop("apiKeyStorage", None)
        self._write_logical(fp, logical)
        return logical

    def delete(self, name: str) -> bool:
        """删除指定供应商配置，成功返回 True，本不存在返回 False。"""
        fp = self._path_for(name)
        if fp.exists():
            fp.unlink()
            return True
        return False

    def _load_path(self, fp: Path) -> dict:
        """读取逻辑配置；检测到旧明文 API Key 时立刻原子迁移为密文。"""
        raw = json.loads(fp.read_text(encoding="utf-8"))
        logical, needs_migration = self._decode_payload(raw)
        if needs_migration:
            self._write_logical(fp, logical)
            logger.info("Migrated provider %s API key to encrypted storage", logical.get("name", fp.stem))
        return logical

    def _decode_payload(self, raw: dict) -> tuple[dict, bool]:
        """把磁盘结构转为运行时结构，并标记是否为旧明文格式。"""
        if not isinstance(raw, dict):
            raise ValueError("Provider config must be a JSON object")
        logical = dict(raw)
        encrypted = str(logical.pop("apiKeyEncrypted", "") or "")
        logical.pop("apiKeyStorage", None)
        if encrypted:
            logical.pop("apiKey", None)
            logical["apiKey"] = self._cipher.decrypt(encrypted)
            return logical, False

        api_key = str(logical.get("apiKey", "") or "")
        logical["apiKey"] = api_key
        return logical, bool(api_key and not _is_env_reference(api_key))

    def _write_logical(self, fp: Path, logical: dict) -> None:
        """把逻辑配置编码为磁盘结构并原子替换，避免进程中断留下半截 JSON。"""
        payload = dict(logical)
        api_key = str(payload.pop("apiKey", "") or "")
        payload.pop("apiKeyEncrypted", None)
        payload.pop("apiKeyStorage", None)
        if api_key and not _is_env_reference(api_key):
            payload["apiKeyEncrypted"] = self._cipher.encrypt(api_key)
            payload["apiKeyStorage"] = "fernet-v1"
        else:
            payload["apiKey"] = api_key

        text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                newline="\n",
                dir=fp.parent,
                prefix=f".{fp.name}.",
                suffix=".tmp",
                delete=False,
            ) as handle:
                temp_path = Path(handle.name)
                handle.write(text)
                handle.flush()
                os.fsync(handle.fileno())
            try:
                os.chmod(temp_path, 0o600)
            except OSError:
                pass
            os.replace(temp_path, fp)
            try:
                os.chmod(fp, 0o600)
            except OSError:
                pass
        finally:
            if temp_path is not None and temp_path.exists():
                temp_path.unlink(missing_ok=True)

    def to_ai_configs(self) -> list[AiModelConfig]:
        """把存储里的原始 dict 转成强类型 AiModelConfig 列表（供 AIService 使用）。"""
        configs: list[AiModelConfig] = []
        for d in self.list_all():
            configs.append(AiModelConfig(
                name=d["name"],
                endpoint=d.get("endpoint", ""),
                api_key=resolve_secret(d.get("apiKey", "")),
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
        # OpenAI SDK 客户端内部维护 HTTP 连接池。按供应商复用客户端，避免每次
        # 对话重复建立 TCP/TLS 连接；配置变化会形成新 key，不会复用旧凭据。
        self._client_cache: dict[
            tuple[str, str, str, bool],
            openai.OpenAI | openai.AsyncOpenAI,
        ] = {}
        self._client_cache_lock = Lock()

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

        model_id 以已配置供应商名开头（provider:model）时锁定该供应商；否则把
        完整字符串当模型 ID 跨供应商查找，兼容 ``vendor/model:free``。
        async_client=True 时返回 AsyncOpenAI（供异步任务/队列使用）。
        """
        if ":" in model_id:
            provider_name, model_name = model_id.split(":", 1)
            if self._find_provider(provider_name) is not None:
                return self._resolve_with_provider(
                    provider_name,
                    model_name,
                    async_client=async_client,
                )
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
        """按供应商复用同步或异步 OpenAI 客户端及其 HTTP 连接池。"""
        if not provider.endpoint.strip():
            raise ValueError(f"AI provider {provider.name!r} missing endpoint")
        if not provider.api_key.strip():
            raise ValueError(f"AI provider {provider.name!r} missing API key")
        cache_key = (
            provider.name.lower(),
            provider.endpoint.strip(),
            provider.api_key,
            async_client,
        )
        with self._client_cache_lock:
            cached = self._client_cache.get(cache_key)
            if cached is not None:
                return cached
            cls = openai.AsyncOpenAI if async_client else openai.OpenAI
            client = cls(
                base_url=provider.endpoint.strip(),
                api_key=provider.api_key,
            )
            # 单进程通常只有少量供应商；仍设置上限，防止频繁改配置无限积累旧 client。
            if len(self._client_cache) >= 32:
                self._client_cache.pop(next(iter(self._client_cache)))
            self._client_cache[cache_key] = client
            return client

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
        unavailable_matches: list[str] = []
        for provider in self._providers:
            if not provider.enabled:
                continue
            resolved = self._find_model_in_provider(provider, model_name)
            if resolved is not None:
                try:
                    return self._make_client(provider, async_client=async_client), resolved
                except ValueError as exc:
                    unavailable_matches.append(str(exc))

        if unavailable_matches:
            raise ValueError("; ".join(unavailable_matches))
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
            if (
                not provider.enabled
                or not provider.models
                or not provider.endpoint.strip()
                or not provider.api_key.strip()
            ):
                continue
            model_id = provider.models[0].get("modelId", provider.models[0].get("modelName", ""))
            if model_id:
                return self._make_client(provider, async_client=False), model_id
        raise ValueError("没有已启用且凭据完整的 AI provider")

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
