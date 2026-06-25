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
    return {
        "claude": _find_cli("claude") is not None,
        "gemini": _find_cli("gemini") is not None,
    }
