"""MCP 工具运行时桥接。

这层只负责把员工已绑定的 MCP 服务转换成现有 AgentLoop 可调用的
``ToolHandler``。实现沿用 Yuxi 的配置哈希缓存、工具唯一命名和故障隔离思路，
但直接接入本项目已有 JSON 注册表与 OpenAI 工具循环，不引入数据库或 LangChain。

未绑定 MCP 服务时不会导入 MCP SDK、启动子进程或建立网络连接。
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import re
from collections.abc import AsyncIterator
from contextlib import AsyncExitStack, asynccontextmanager
from dataclasses import dataclass
from typing import Any

import httpx

from app.models.runtime import RuntimeMcpServer
from app.runtime.loop import ToolHandler

logger = logging.getLogger(__name__)

_MCP_CONNECT_TIMEOUT_SECONDS = 15.0
_MCP_TOOL_TIMEOUT_SECONDS = 60.0
_MCP_TOOL_NAME_MAX_LENGTH = 64


class McpToolExecutionError(RuntimeError):
    """MCP 服务已响应，但工具执行结果标记为失败。"""


@dataclass(frozen=True)
class McpToolSpec:
    """缓存的 MCP 工具声明；会话本身不跨调用缓存。"""

    exposed_name: str
    original_name: str
    description: str
    input_schema: dict[str, Any]


_mcp_tool_specs_cache: dict[str, list[McpToolSpec]] = {}
_mcp_cache_lock = asyncio.Lock()


def _camel_identifier(value: str) -> str:
    """沿用 Yuxi 的 lowerCamelCase 命名，并收敛到 OpenAI 工具名字符集。"""
    pieces = [piece for piece in re.split(r"[^A-Za-z0-9]+", value) if piece]
    if not pieces:
        return "unnamed"
    first, *rest = pieces
    result = first[:1].lower() + first[1:]
    result += "".join(piece[:1].upper() + piece[1:] for piece in rest)
    return result


def _qualified_tool_name(server_code: str, tool_name: str) -> str:
    """生成跨 MCP 服务不冲突且不超过 OpenAI 限制的工具名。"""
    base = f"mcp__{_camel_identifier(server_code)}__{_camel_identifier(tool_name)}"
    if len(base) <= _MCP_TOOL_NAME_MAX_LENGTH:
        return base
    suffix = hashlib.sha256(base.encode("utf-8")).hexdigest()[:8]
    prefix_length = _MCP_TOOL_NAME_MAX_LENGTH - len(suffix) - 2
    return f"{base[:prefix_length]}__{suffix}"


def _server_cache_key(server: RuntimeMcpServer) -> str:
    """配置变化时自然生成新缓存键，避免继续使用旧工具声明。"""
    payload = json.dumps(
        server.model_dump(by_alias=True, exclude_none=True),
        ensure_ascii=True,
        separators=(",", ":"),
        sort_keys=True,
    )
    config_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
    return f"{server.server_code}:{config_hash}"


def clear_mcp_tools_cache(server_code: str | None = None) -> None:
    """清理全部或指定服务的工具声明缓存，供后台刷新与测试使用。"""
    if server_code is None:
        _mcp_tool_specs_cache.clear()
        return
    prefix = f"{server_code}:"
    for key in [key for key in _mcp_tool_specs_cache if key.startswith(prefix)]:
        _mcp_tool_specs_cache.pop(key, None)


def _resolved_secret_refs(values: dict[str, str] | None, *, label: str) -> dict[str, str] | None:
    """解析 ``${ENV_VAR}`` 引用；密钥仅在进程内展开，不写入注册表。"""
    if not values:
        return None
    resolved: dict[str, str] = {}
    for name, value in values.items():
        match = re.fullmatch(r"\$\{([A-Z][A-Z0-9_]*)\}", str(value).strip())
        if match:
            env_name = match.group(1)
            resolved_value = os.getenv(env_name)
            if resolved_value is None:
                raise ValueError(f"MCP {label}引用的环境变量未配置：{env_name}")
            resolved[name] = resolved_value
        else:
            resolved[name] = str(value)
    return resolved


def _resolved_env(env: dict[str, str] | None) -> dict[str, str] | None:
    """解析 stdio 子进程环境变量。"""
    return _resolved_secret_refs(env, label="环境变量")


@asynccontextmanager
async def _open_session(
    server: RuntimeMcpServer,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> AsyncIterator[Any]:
    """按注册表配置建立一个 MCP 会话；SDK 仅在确实需要 MCP 时加载。"""
    try:
        from mcp import ClientSession, StdioServerParameters
    except ImportError as exc:  # pragma: no cover - 由无依赖路径测试覆盖
        raise RuntimeError(
            "已绑定 MCP 服务，但未安装 MCP SDK；请安装 requirements.txt 后重试"
        ) from exc

    async with AsyncExitStack() as stack:
        transport_type = (server.transport_type or "stdio").strip().lower()
        if transport_type == "stdio":
            if not server.command:
                raise ValueError(f"MCP 服务 {server.server_code} 缺少 command")
            from mcp.client.stdio import stdio_client

            env = None
            resolved_env = _resolved_env(server.env)
            if resolved_env:
                env = dict(os.environ)
                env.update(resolved_env)
            parameters = StdioServerParameters(
                command=server.command,
                args=list(server.command_args or []),
                env=env,
            )
            transport = stdio_client(parameters)
        elif transport_type in {"http", "streamable_http", "streamable-http"}:
            if not server.url:
                raise ValueError(f"MCP 服务 {server.server_code} 缺少 url")
            from mcp.client.streamable_http import streamable_http_client

            client = http_client
            if client is None and (
                server.headers or (server.auth_type or "none").lower() == "oauth"
            ):
                headers = _resolved_secret_refs(server.headers, label="请求头") or {}
                auth = None
                if (server.auth_type or "none").lower() == "oauth":
                    from app.services.mcp_oauth import mcp_oauth_coordinator

                    auth = mcp_oauth_coordinator.auth_provider(server)
                client = await stack.enter_async_context(
                    httpx.AsyncClient(
                        headers=headers,
                        auth=auth,
                        follow_redirects=True,
                        timeout=30,
                    )
                )
            transport = streamable_http_client(server.url, http_client=client)
        elif transport_type == "sse":
            if not server.url:
                raise ValueError(f"MCP 服务 {server.server_code} 缺少 url")
            from mcp.client.sse import sse_client

            headers = _resolved_secret_refs(server.headers, label="请求头") or None
            auth = None
            if (server.auth_type or "none").lower() == "oauth":
                from app.services.mcp_oauth import mcp_oauth_coordinator

                auth = mcp_oauth_coordinator.auth_provider(server)
            transport = sse_client(server.url, headers=headers, auth=auth)
        else:
            raise ValueError(
                f"MCP 服务 {server.server_code} 使用了不支持的传输类型: "
                f"{server.transport_type}"
            )

        async with transport as streams:
            read_stream, write_stream = streams[0], streams[1]
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                yield session


def _tool_input_schema(tool: Any) -> dict[str, Any]:
    """兼容 MCP SDK v1 的 camelCase 与适配器常见的 snake_case 字段。"""
    schema = getattr(tool, "inputSchema", None)
    if schema is None:
        schema = getattr(tool, "input_schema", None)
    if isinstance(schema, dict):
        return schema
    return {"type": "object", "properties": {}}


async def _discover_tool_specs(
    session: Any,
    server: RuntimeMcpServer,
) -> list[McpToolSpec]:
    """发现并缓存一个服务的完整工具声明，支持 MCP 分页。"""
    cache_key = _server_cache_key(server)
    async with _mcp_cache_lock:
        cached = _mcp_tool_specs_cache.get(cache_key)
    if cached is not None:
        return cached

    tools: list[Any] = []
    cursor: str | None = None
    while True:
        response = (
            await session.list_tools(cursor=cursor)
            if cursor is not None
            else await session.list_tools()
        )
        tools.extend(list(getattr(response, "tools", []) or []))
        cursor = getattr(response, "nextCursor", None)
        if cursor is None:
            cursor = getattr(response, "next_cursor", None)
        if not cursor:
            break

    specs = [
        McpToolSpec(
            exposed_name=_qualified_tool_name(server.server_code, str(tool.name)),
            original_name=str(tool.name),
            description=(
                str(getattr(tool, "description", "") or "")
                or f"{server.name or server.server_code} 的 MCP 工具 {tool.name}"
            ),
            input_schema=_tool_input_schema(tool),
        )
        for tool in tools
    ]

    async with _mcp_cache_lock:
        stale_keys = [
            key
            for key in _mcp_tool_specs_cache
            if key.startswith(f"{server.server_code}:") and key != cache_key
        ]
        for stale_key in stale_keys:
            _mcp_tool_specs_cache.pop(stale_key, None)
        _mcp_tool_specs_cache[cache_key] = specs
    return specs


async def probe_mcp_server(
    server: RuntimeMcpServer,
    *,
    http_client: httpx.AsyncClient | None = None,
) -> list[McpToolSpec]:
    """建立一次真实 MCP 会话并返回工具清单，供系统管家验证配置和登录状态。"""
    async with _open_session(server, http_client=http_client) as session:
        return await _discover_tool_specs(session, server)


def _content_value(item: Any) -> Any:
    """把 MCP 内容块转换成可安全 JSON 序列化的值。"""
    text = getattr(item, "text", None)
    if isinstance(text, str):
        return text
    if hasattr(item, "model_dump"):
        return item.model_dump(by_alias=True, exclude_none=True)
    if isinstance(item, (dict, list, str, int, float, bool)) or item is None:
        return item
    return str(item)


def _serialize_tool_result(result: Any) -> str:
    """把 MCP CallToolResult 收敛成现有 AgentLoop 接受的文本结果。"""
    structured = getattr(result, "structuredContent", None)
    if structured is None:
        structured = getattr(result, "structured_content", None)

    content = [_content_value(item) for item in (getattr(result, "content", []) or [])]
    if structured is not None:
        serialized = json.dumps(structured, ensure_ascii=False, default=str)
    elif content and all(isinstance(item, str) for item in content):
        serialized = "\n".join(content)
    elif content:
        serialized = json.dumps(content, ensure_ascii=False, default=str)
    else:
        serialized = ""

    is_error = getattr(result, "isError", None)
    if is_error is None:
        is_error = getattr(result, "is_error", False)
    if is_error:
        raise McpToolExecutionError(serialized or "MCP 服务返回了失败结果")
    return serialized


def _build_tool_handlers(
    session: Any,
    specs: list[McpToolSpec],
) -> list[ToolHandler]:
    """把 MCP 工具声明与当前会话绑定为本项目原生 ToolHandler。"""
    handlers: list[ToolHandler] = []
    for spec in specs:

        async def handler_fn(
            raw_args: str,
            _session: Any = session,
            _spec: McpToolSpec = spec,
        ) -> str:
            try:
                arguments = json.loads(raw_args) if raw_args else {}
            except (json.JSONDecodeError, TypeError) as exc:
                raise ValueError(f"MCP 工具参数不是合法 JSON: {exc}") from exc
            if not isinstance(arguments, dict):
                raise ValueError("MCP 工具参数必须是 JSON object")
            async with asyncio.timeout(_MCP_TOOL_TIMEOUT_SECONDS):
                result = await _session.call_tool(
                    _spec.original_name,
                    arguments=arguments,
                )
            return _serialize_tool_result(result)

        handlers.append(
            ToolHandler(
                name=spec.exposed_name,
                description=spec.description,
                input_schema=spec.input_schema,
                handler=handler_fn,
            )
        )
    return handlers


@asynccontextmanager
async def mcp_tool_handlers(
    servers: list[RuntimeMcpServer],
) -> AsyncIterator[list[ToolHandler]]:
    """连接已绑定服务并产出工具；任一服务失败都不会击穿其它服务或主流程。"""
    if not servers:
        yield []
        return

    active_stacks: list[AsyncExitStack] = []
    handlers: list[ToolHandler] = []
    try:
        for server in servers:
            stack = AsyncExitStack()
            await stack.__aenter__()
            try:
                async with asyncio.timeout(_MCP_CONNECT_TIMEOUT_SECONDS):
                    session = await stack.enter_async_context(_open_session(server))
                    specs = await _discover_tool_specs(session, server)
            except Exception as exc:
                await stack.aclose()
                logger.warning(
                    "MCP 服务 %s 加载失败，已隔离并继续运行: %s",
                    server.server_code,
                    exc,
                )
                continue

            active_stacks.append(stack)
            handlers.extend(_build_tool_handlers(session, specs))
            logger.info(
                "MCP 服务 %s 已加载 %d 个工具",
                server.server_code,
                len(specs),
            )
        yield handlers
    finally:
        for stack in reversed(active_stacks):
            try:
                await stack.aclose()
            except Exception:
                logger.warning("关闭 MCP 会话失败", exc_info=True)
