"""Tool handler protocol and global registry."""
from __future__ import annotations

import json
from typing import Protocol, Any


class ToolContext:
    """Carries everything a tool handler needs for one invocation."""

    def __init__(
        self,
        tool_code: str,
        arguments_json: str,
        employee_key: str,
        extra_context: str | None = None,
        deep_state: Any = None,
    ):
        self.tool_code = tool_code
        self.arguments_json = arguments_json
        self.employee_key = employee_key
        self.extra_context = extra_context
        self.deep_state = deep_state

    def parse_args(self) -> dict:
        """把工具调用的 arguments JSON 解析成 dict（空串返回空 dict，非法 JSON 抛异常由调用方兜底）。"""
        if not self.arguments_json:
            return {}
        return json.loads(self.arguments_json)

    def parse_extra_context(self) -> dict:
        """Parse extra_context as JSON dict; return empty dict on failure."""
        if not self.extra_context:
            return {}
        try:
            val = json.loads(self.extra_context)
            return val if isinstance(val, dict) else {}
        except (json.JSONDecodeError, TypeError):
            return {}


class ToolHandler(Protocol):
    """工具处理器协议：实现 tool_code 属性与 async handle(ctx)，注册到全局 registry 后即可被 agent 调用。"""
    tool_code: str

    async def handle(self, ctx: ToolContext) -> str:
        """执行一次工具调用，返回给 LLM 的结果文本（通常为 JSON 字符串）。"""
        ...


# ── Global registry ──────────────────────────────────────────────

_handlers: dict[str, ToolHandler] = {}


def register_handler(handler: ToolHandler) -> None:
    """Register a handler instance by its tool_code."""
    _handlers[handler.tool_code] = handler


def get_handler(tool_code: str) -> ToolHandler | None:
    """Return the handler for *tool_code*, or ``None``."""
    return _handlers.get(tool_code)


def get_all_handlers() -> dict[str, ToolHandler]:
    """Return a shallow copy of the full registry."""
    return _handlers.copy()
