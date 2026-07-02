"""确定性检查引擎 —— eval 评分核心，纯函数、可单测、不碰网络。

LLM 输出天然有随机性，所以只做结构性断言（包含/不包含/正则/长度/JSON/键存在），
不做精确匹配。一个 case 的 output 依次过一组 checks，全过才算通过。
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass


@dataclass
class CheckResult:
    kind: str
    passed: bool
    detail: str


def _as_json(output: str):
    try:
        return json.loads(output)
    except (json.JSONDecodeError, TypeError):
        return None


def run_check(output: str, check: dict) -> CheckResult:
    kind = check.get("type", "")

    if kind == "contains":
        v = str(check.get("value", ""))
        return CheckResult(kind, v in output, f"应包含 {v!r}")

    if kind == "not_contains":
        v = str(check.get("value", ""))
        return CheckResult(kind, v not in output, f"不应包含 {v!r}")

    if kind == "regex":
        p = str(check.get("pattern", ""))
        return CheckResult(kind, re.search(p, output) is not None, f"应匹配 /{p}/")

    if kind == "min_length":
        n = int(check.get("value", 0))
        return CheckResult(kind, len(output) >= n, f"长度应 ≥ {n}（实际 {len(output)}）")

    if kind == "max_length":
        n = int(check.get("value", 0))
        return CheckResult(kind, len(output) <= n, f"长度应 ≤ {n}（实际 {len(output)}）")

    if kind == "is_json":
        return CheckResult(kind, _as_json(output) is not None, "应为合法 JSON")

    if kind == "json_has_keys":
        data = _as_json(output)
        keys = check.get("keys", [])
        ok = isinstance(data, dict) and all(k in data for k in keys)
        return CheckResult(kind, ok, f"JSON 应含键 {keys}")

    return CheckResult(kind or "unknown", False, f"未知检查类型: {kind!r}")


def evaluate_output(output: str, checks: list[dict]) -> list[CheckResult]:
    """把 output 过一遍所有 checks，返回逐条结果。"""
    return [run_check(output, c) for c in checks]
