"""MCP 运行时桥接回归测试：覆盖可选加载、缓存、命名与故障隔离。"""
from __future__ import annotations

import asyncio
import json
import sys
from contextlib import asynccontextmanager
from types import SimpleNamespace

import pytest

from app.models.runtime import RuntimeMcpServer
from app.runtime import mcp as mcp_runtime


def _server(code: str = "math-server") -> RuntimeMcpServer:
    return RuntimeMcpServer(
        server_code=code,
        name=code,
        transport_type="stdio",
        command="fake-mcp",
    )


class _FakeSession:
    """最小 MCP 会话桩，记录发现与调用次数。"""

    def __init__(self, *, fail_call: bool = False) -> None:
        self.list_count = 0
        self.calls: list[tuple[str, dict]] = []
        self.fail_call = fail_call

    async def list_tools(self, cursor=None):
        self.list_count += 1
        return SimpleNamespace(
            tools=[
                SimpleNamespace(
                    name="add-values",
                    description="两数相加",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "a": {"type": "number"},
                            "b": {"type": "number"},
                        },
                        "required": ["a", "b"],
                    },
                )
            ],
            nextCursor=None,
        )

    async def call_tool(self, name: str, arguments: dict):
        self.calls.append((name, arguments))
        if self.fail_call:
            return SimpleNamespace(
                structuredContent=None,
                content=[SimpleNamespace(text="计算失败")],
                isError=True,
            )
        return SimpleNamespace(
            structuredContent={"value": arguments["a"] + arguments["b"]},
            content=[],
            isError=False,
        )


async def test_no_servers_keeps_runtime_empty():
    """未配置 MCP 时不加载任何工具，也不触碰 SDK。"""
    async with mcp_runtime.mcp_tool_handlers([]) as handlers:
        assert handlers == []


async def test_bound_server_exposes_namespaced_callable_tool(monkeypatch):
    session = _FakeSession()

    @asynccontextmanager
    async def fake_open_session(_server):
        yield session

    mcp_runtime.clear_mcp_tools_cache()
    monkeypatch.setattr(mcp_runtime, "_open_session", fake_open_session)

    async with mcp_runtime.mcp_tool_handlers([_server()]) as handlers:
        assert len(handlers) == 1
        handler = handlers[0]
        assert handler.name == "mcp__mathServer__addValues"
        assert handler.input_schema["required"] == ["a", "b"]
        assert await handler.handler('{"a": 2, "b": 5}') == '{"value": 7}'

    assert session.calls == [("add-values", {"a": 2, "b": 5})]


async def test_tool_specs_are_cached_by_server_config(monkeypatch):
    session = _FakeSession()

    @asynccontextmanager
    async def fake_open_session(_server):
        yield session

    mcp_runtime.clear_mcp_tools_cache()
    monkeypatch.setattr(mcp_runtime, "_open_session", fake_open_session)
    server = _server()

    async with mcp_runtime.mcp_tool_handlers([server]):
        pass
    async with mcp_runtime.mcp_tool_handlers([server]):
        pass

    assert session.list_count == 1


async def test_failed_server_does_not_hide_healthy_server(monkeypatch):
    healthy_session = _FakeSession()

    @asynccontextmanager
    async def fake_open_session(server):
        if server.server_code == "broken":
            raise RuntimeError("cannot connect")
        yield healthy_session

    mcp_runtime.clear_mcp_tools_cache()
    monkeypatch.setattr(mcp_runtime, "_open_session", fake_open_session)

    async with mcp_runtime.mcp_tool_handlers(
        [_server("broken"), _server("healthy")]
    ) as handlers:
        assert [handler.name for handler in handlers] == [
            "mcp__healthy__addValues"
        ]


async def test_probe_timeout_closes_hanging_session(monkeypatch):
    """系统管家验证不能无限等待，并且取消后必须退出底层传输。"""
    closed = False

    @asynccontextmanager
    async def hanging_open_session(_server, *, http_client=None):
        nonlocal closed
        try:
            await asyncio.sleep(60)
            yield _FakeSession()
        finally:
            closed = True

    monkeypatch.setattr(mcp_runtime, "_open_session", hanging_open_session)

    with pytest.raises(
        mcp_runtime.McpConnectionTimeoutError,
        match="连接超过 0.01 秒，已自动终止",
    ):
        await mcp_runtime.probe_mcp_server(_server(), timeout_seconds=0.01)

    assert closed is True


async def test_mcp_error_result_becomes_tool_failure(monkeypatch):
    session = _FakeSession(fail_call=True)

    @asynccontextmanager
    async def fake_open_session(_server):
        yield session

    mcp_runtime.clear_mcp_tools_cache()
    monkeypatch.setattr(mcp_runtime, "_open_session", fake_open_session)

    async with mcp_runtime.mcp_tool_handlers([_server()]) as handlers:
        with pytest.raises(mcp_runtime.McpToolExecutionError, match="计算失败"):
            await handlers[0].handler('{"a": 1, "b": 1}')


async def test_real_sdk_stdio_round_trip():
    """用官方 MCP SDK 启动临时 stdio 服务，验证真实协议往返。"""
    server_script = (
        "from mcp.server.fastmcp import FastMCP\n"
        "server = FastMCP('runtime-test')\n"
        "@server.tool()\n"
        "def echo(text: str) -> str:\n"
        "    return text\n"
        "server.run(transport='stdio')\n"
    )
    server = RuntimeMcpServer(
        server_code="real-sdk",
        name="real-sdk",
        transport_type="stdio",
        command=sys.executable,
        command_args=["-c", server_script],
    )

    mcp_runtime.clear_mcp_tools_cache()
    async with mcp_runtime.mcp_tool_handlers([server]) as handlers:
        assert [handler.name for handler in handlers] == ["mcp__realSdk__echo"]
        result = json.loads(await handlers[0].handler('{"text": "pong"}'))

    assert result == {"result": "pong"}
