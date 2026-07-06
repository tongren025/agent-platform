"""
CLI Executor — 通过本地已认证的 CLI 工具（claude / gemini）调用 LLM。
无需 API Key，直接用订阅额度。
"""
from __future__ import annotations

import asyncio
import logging
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)

_CLI_PATHS: dict[str, str | None] = {}


def _find_cli(name: str) -> str | None:
    """在 PATH 里定位 CLI 可执行文件并缓存结果（进程级缓存，找不到缓存 None）。"""
    if name not in _CLI_PATHS:
        _CLI_PATHS[name] = shutil.which(name)
    return _CLI_PATHS[name]


async def run_cli(
    cli_type: str,
    prompt: str,
    system_prompt: str = "",
    max_tokens: int = 8192,
    timeout_seconds: int = 300,
) -> str:
    """统一入口：按 cli_type 分发到 claude / gemini CLI 执行一段提示词，返回纯文本输出。"""
    if cli_type == "claude":
        return await _run_claude(prompt, system_prompt, max_tokens, timeout_seconds)
    elif cli_type == "gemini":
        return await _run_gemini(prompt, system_prompt, max_tokens, timeout_seconds)
    else:
        raise ValueError(f"不支持的 CLI 类型: {cli_type}")


async def _run_claude(
    prompt: str,
    system_prompt: str,
    max_tokens: int,
    timeout_seconds: int,
) -> str:
    """调 claude CLI（-p 单轮、text 输出）；system_prompt 以分隔线拼接在正文前。"""
    exe = _find_cli("claude")
    if not exe:
        raise RuntimeError("claude CLI 未安装或不在 PATH 中")

    full_prompt = prompt
    if system_prompt:
        full_prompt = f"{system_prompt}\n\n---\n\n{prompt}"

    cmd = [
        exe, "-p", full_prompt,
        "--output-format", "text",
        "--max-turns", "1",
    ]

    logger.info("Calling claude CLI (prompt length=%d)", len(full_prompt))
    return await _exec(cmd, timeout_seconds)


async def _run_gemini(
    prompt: str,
    system_prompt: str,
    max_tokens: int,
    timeout_seconds: int,
) -> str:
    """调 gemini CLI（-p 模式）；system_prompt 以分隔线拼接在正文前。"""
    exe = _find_cli("gemini")
    if not exe:
        raise RuntimeError("gemini CLI 未安装或不在 PATH 中")

    full_prompt = prompt
    if system_prompt:
        full_prompt = f"{system_prompt}\n\n---\n\n{prompt}"

    cmd = [exe, "-p", full_prompt]

    logger.info("Calling gemini CLI (prompt length=%d)", len(full_prompt))
    return await _exec(cmd, timeout_seconds)


async def _exec(cmd: list[str], timeout_seconds: int) -> str:
    """执行子进程并收集 stdout；超时 kill 进程，非零退出码抛 RuntimeError（附 stderr 摘要）。"""
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=timeout_seconds
        )
    except asyncio.TimeoutError:
        proc.kill()
        raise RuntimeError(f"CLI 调用超时（{timeout_seconds}s）")

    if proc.returncode != 0:
        err = stderr.decode("utf-8", errors="replace").strip()
        logger.error("CLI exited with code %d: %s", proc.returncode, err[:500])
        raise RuntimeError(f"CLI 返回错误 (code={proc.returncode}): {err[:300]}")

    return stdout.decode("utf-8", errors="replace").strip()


def check_available_clis() -> dict[str, bool]:
    """探测本机哪些 CLI 可用（claude/gemini），返回 {名称: 是否可用}。"""
    return {
        "claude": _find_cli("claude") is not None,
        "gemini": _find_cli("gemini") is not None,
    }
