"""DeepAgent 上下文 L1 精简：把大型工具结果卸载到可恢复虚拟文件。

核心算法迁自 Yuxi ``agents/middlewares/summary.py``：按近似 token 阈值判断，
使用工具名与内容哈希生成稳定路径，并在模型上下文中保留预览和完整结果路径。
这里适配现有 ``DeepAgentState.files``，不依赖 LangGraph、LangChain 或外部存储。
"""
from __future__ import annotations

import hashlib
import re

_APPROX_CHARS_PER_TOKEN = 4
DEFAULT_TOOL_RESULT_TOKEN_LIMIT = 300
LARGE_TOOL_RESULTS_PREFIX = "/outputs/large_tool_results"


def _estimated_content_tokens(content: str) -> int:
    """按 Yuxi 的 4 字符/token 规则估算文本大小。"""
    return max(
        (len(content) + _APPROX_CHARS_PER_TOKEN - 1)
        // _APPROX_CHARS_PER_TOKEN,
        1,
    )


def _tool_result_path(tool_name: str | None, content: str) -> str:
    """用安全工具名与内容哈希生成确定性的虚拟文件路径。"""
    safe_tool_name = re.sub(
        r"[^A-Za-z0-9_.-]+",
        "-",
        (tool_name or "").strip(),
    ).strip(".-") or "tool-result"
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]
    return f"{LARGE_TOOL_RESULTS_PREFIX}/{safe_tool_name}-{digest}.txt"


def _preview_tool_result(content: str, token_limit: int) -> tuple[str, int]:
    """返回至多 token_limit 近似 token 的预览和被省略字符数。"""
    text = content.strip()
    if token_limit <= 0:
        return "", len(text)

    max_chars = token_limit * _APPROX_CHARS_PER_TOKEN
    if len(text) <= max_chars:
        return text, 0

    preview = text[:max_chars].rstrip()
    return preview, len(text) - len(preview)


def compact_tool_result(
    tool_name: str | None,
    content: str,
    *,
    files: dict[str, str],
    token_limit: int = DEFAULT_TOOL_RESULT_TOKEN_LIMIT,
) -> str:
    """大型结果写入虚拟文件并返回紧凑引用；小结果保持原样。"""
    if _estimated_content_tokens(content) <= token_limit:
        return content

    path = _tool_result_path(tool_name, content)
    files[path] = content
    preview, omitted_chars = _preview_tool_result(content, token_limit)
    lines = [
        "[Tool result saved]",
        f"Tool: {tool_name or 'unknown'}",
        f"Approx tokens: {_estimated_content_tokens(content)}",
        f"Full output path: {path}",
    ]
    if preview:
        lines.extend(["", "Output preview:", preview])
    if omitted_chars:
        lines.append(
            f"\n[Truncated {omitted_chars} chars. "
            "Use read_file with the full output path when more detail is needed.]"
        )
    return "\n".join(lines)
