"""MCP 登录协调与加密凭证存储。

授权过程由 MCP SDK 完成；本服务只负责把浏览器跳转与回调接到 SDK，并使用与
AI Provider 相同的 Fernet 主密钥加密保存 OAuth token、client registration 和
用户直接提供的静态请求头。MCP 注册表始终不保存静态凭证明文。
"""
from __future__ import annotations

import asyncio
import json
import re
import secrets
import time
import urllib.parse
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from mcp.client.auth import OAuthClientProvider
from mcp.shared.auth import OAuthClientInformationFull, OAuthClientMetadata, OAuthToken

from app.config import BASE_DIR
from app.models.runtime import RuntimeMcpServer
from app.services.ai import LocalSecretCipher


class EncryptedMcpTokenStorage:
    """单个 MCP 服务的加密凭证存储，同时实现 SDK TokenStorage。"""

    def __init__(self, server_code: str, root_dir: Path | None = None) -> None:
        safe = "".join(char for char in server_code if char.isalnum() or char in "-_")
        if not safe or safe != server_code:
            raise ValueError("非法 MCP serverCode")
        root = Path(root_dir) if root_dir is not None else BASE_DIR / "data" / "mcp-auth"
        self._path = root / f"{safe}.json"
        self._cipher = LocalSecretCipher(
            root.parent / ".secrets" / "provider-encryption.key",
        )

    def _load(self) -> dict[str, Any]:
        if not self._path.exists():
            return {}
        payload = json.loads(self._path.read_text(encoding="utf-8"))
        encrypted = str(payload.get("encrypted") or "")
        if not encrypted:
            return {}
        return json.loads(self._cipher.decrypt(encrypted))

    def _save(self, payload: dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        encrypted = self._cipher.encrypt(json.dumps(payload, ensure_ascii=False))
        temp = self._path.with_suffix(".tmp")
        temp.write_text(
            json.dumps({"version": 1, "encrypted": encrypted}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temp.replace(self._path)

    async def get_tokens(self) -> OAuthToken | None:
        raw = self._load().get("tokens")
        return OAuthToken.model_validate(raw) if raw else None

    async def set_tokens(self, tokens: OAuthToken) -> None:
        payload = self._load()
        payload["tokens"] = tokens.model_dump(mode="json", exclude_none=True)
        self._save(payload)

    async def get_client_info(self) -> OAuthClientInformationFull | None:
        raw = self._load().get("clientInfo")
        return OAuthClientInformationFull.model_validate(raw) if raw else None

    async def set_client_info(self, client_info: OAuthClientInformationFull) -> None:
        payload = self._load()
        payload["clientInfo"] = client_info.model_dump(mode="json", exclude_none=True)
        self._save(payload)

    def get_static_headers(self) -> dict[str, str]:
        """读取已加密保存的静态鉴权头，仅供 MCP 运行时在内存中使用。"""
        raw = self._load().get("staticHeaders")
        if not isinstance(raw, dict):
            return {}
        return {
            str(name): str(value)
            for name, value in raw.items()
            if str(name).strip() and isinstance(value, str)
        }

    def set_static_headers(self, headers: dict[str, str]) -> None:
        """校验并加密保存静态请求头，拒绝换行注入和非法头名。"""
        if not isinstance(headers, dict) or not headers or len(headers) > 100:
            raise ValueError("MCP 静态请求头不能为空或超过 100 项")
        normalized: dict[str, str] = {}
        header_name_re = re.compile(r"^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$")
        for raw_name, raw_value in headers.items():
            name = str(raw_name).strip()
            value = str(raw_value).strip()
            if not header_name_re.fullmatch(name):
                raise ValueError("MCP 静态请求头名称不合法")
            if not value or "\r" in value or "\n" in value:
                raise ValueError(f"MCP 静态请求头 {name} 的值不合法")
            normalized[name] = value
        payload = self._load()
        payload["staticHeaders"] = normalized
        self._save(payload)

    def has_static_headers(self) -> bool:
        """只返回是否已有静态凭证，不向上层暴露内容。"""
        try:
            return bool(self.get_static_headers())
        except Exception:
            return False

    def clear_static_headers(self) -> None:
        """仅清除静态请求头，保留同一服务可能已有的 OAuth 状态。"""
        payload = self._load()
        payload.pop("staticHeaders", None)
        if payload:
            self._save(payload)
        elif self._path.exists():
            self._path.unlink()

    def has_tokens(self) -> bool:
        """仅返回是否已有 token，不向上层暴露 token 内容。"""
        try:
            return bool(self._load().get("tokens"))
        except Exception:
            return False

    def clear(self) -> None:
        """退出登录时删除加密令牌文件。"""
        if self._path.exists():
            self._path.unlink()


@dataclass
class _OAuthFlow:
    """一次浏览器 OAuth 授权的进程内协调状态。"""

    server_code: str
    state: str
    callback: asyncio.Future[tuple[str, str | None]]
    task: asyncio.Task
    created_at: float


class McpOAuthCoordinator:
    """把 SDK 的 redirect/callback 回调桥接成前后端两步 API。"""

    def __init__(self) -> None:
        self._flows: dict[str, _OAuthFlow] = {}

    @staticmethod
    def token_status(server_code: str) -> str:
        """返回 OAuth 凭证状态，不解密或返回 token。"""
        return "authorized" if EncryptedMcpTokenStorage(server_code).has_tokens() else "login_required"

    @staticmethod
    def clear_tokens(server_code: str) -> None:
        """清除一个 MCP 的 OAuth 凭证。"""
        EncryptedMcpTokenStorage(server_code).clear()

    @staticmethod
    def auth_provider(
        server: RuntimeMcpServer,
        *,
        redirect_uri: str | None = None,
        redirect_handler=None,
        callback_handler=None,
    ) -> OAuthClientProvider:
        """构造 SDK OAuth provider；已有 token 时可无交互刷新。"""
        if not server.url:
            raise ValueError("OAuth MCP 缺少 url")
        redirect_uris = [redirect_uri] if redirect_uri else ["http://localhost/oauth/callback"]
        metadata = OAuthClientMetadata(
            redirect_uris=redirect_uris,
            client_name="Agent Studio",
            scope=server.oauth_scope,
        )
        return OAuthClientProvider(
            server.url,
            metadata,
            EncryptedMcpTokenStorage(server.server_code),
            redirect_handler=redirect_handler,
            callback_handler=callback_handler,
        )

    async def start(self, server: RuntimeMcpServer, redirect_uri: str) -> dict[str, str]:
        """启动后台探测，等待 SDK 产出真实授权 URL 后立即返回浏览器。"""
        if (server.auth_type or "none").lower() != "oauth":
            raise ValueError("该 MCP 未配置 OAuth 登录")
        if (server.transport_type or "").lower() not in {
            "http",
            "streamable_http",
            "streamable-http",
        }:
            raise ValueError("浏览器 OAuth 登录仅支持 Streamable HTTP MCP")
        parsed = urllib.parse.urlparse(redirect_uri)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.fragment:
            raise ValueError("redirectUri 必须是有效的 HTTP(S) 地址")

        loop = asyncio.get_running_loop()
        redirect_future: asyncio.Future[str] = loop.create_future()
        callback_future: asyncio.Future[tuple[str, str | None]] = loop.create_future()

        async def redirect_handler(url: str) -> None:
            if not redirect_future.done():
                redirect_future.set_result(url)

        async def callback_handler() -> tuple[str, str | None]:
            return await asyncio.wait_for(callback_future, timeout=300)

        async def authorize() -> list[str]:
            from app.runtime.mcp import probe_mcp_server

            auth = self.auth_provider(
                server,
                redirect_uri=redirect_uri,
                redirect_handler=redirect_handler,
                callback_handler=callback_handler,
            )
            async with httpx.AsyncClient(auth=auth, follow_redirects=True, timeout=30) as client:
                specs = await probe_mcp_server(server, http_client=client)
            return [spec.original_name for spec in specs]

        task = asyncio.create_task(authorize())
        try:
            auth_url = await asyncio.wait_for(redirect_future, timeout=20)
        except Exception:
            task.cancel()
            raise
        state = urllib.parse.parse_qs(urllib.parse.urlparse(auth_url).query).get("state", [""])[0]
        if not state:
            task.cancel()
            raise ValueError("授权服务器没有返回 state，无法安全继续")
        self._flows[state] = _OAuthFlow(
            server_code=server.server_code,
            state=state,
            callback=callback_future,
            task=task,
            created_at=time.time(),
        )
        return {"authorizationUrl": auth_url, "state": state}

    async def complete(self, state: str, code: str) -> dict[str, Any]:
        """接收浏览器回调并等待 SDK 完成 token 交换与真实 MCP 探测。"""
        flow = self._flows.pop(state, None)
        if flow is None or time.time() - flow.created_at > 300:
            raise ValueError("OAuth 登录已过期，请重新发起")
        if not flow.callback.done():
            flow.callback.set_result((code, state))
        try:
            tools = await asyncio.wait_for(flow.task, timeout=60)
        except Exception:
            EncryptedMcpTokenStorage(flow.server_code).clear()
            raise
        return {
            "serverCode": flow.server_code,
            "status": "authorized",
            "toolCount": len(tools),
            "tools": tools,
        }


mcp_oauth_coordinator = McpOAuthCoordinator()
