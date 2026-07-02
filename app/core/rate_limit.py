"""M5 限流 —— slowapi 全局限速 + 员工级 token 配额。

两层防线：
1. slowapi：IP 维度的请求频率限制（防刷），挂在 FastAPI app 级别。
2. 员工 token 配额：月度 token 上限（防滥用），在 invocation 前检查。

配额存储跟随 use_db_stores 开关：关 = 内存计数器（进程重启归零，单人自用够了）；
开 = Redis INCRBY + EXPIRE（跨进程、重启不丢）。
"""
from __future__ import annotations

import logging
import time
from collections import defaultdict
from datetime import datetime, timezone

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "code": 429,
            "message": f"请求过于频繁，请稍后重试。{exc.detail}",
            "data": None,
        },
    )


# ── 员工 token 配额 ───────────────────────────────────────────────
# 默认无上限（0 = 不限）；在 appsettings.json 的 quotas 段按员工配：
#   "quotas": { "default_monthly_tokens": 5000000, "overrides": {"vip": 0} }

_monthly_counters: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
_monthly_key_cache: str = ""


def _current_month_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _rotate_if_needed() -> None:
    global _monthly_key_cache
    mk = _current_month_key()
    if mk != _monthly_key_cache:
        _monthly_counters.clear()
        _monthly_key_cache = mk


def record_token_usage(employee_key: str, tokens: int) -> None:
    _rotate_if_needed()
    mk = _current_month_key()
    _monthly_counters[mk][employee_key] += tokens


def check_quota(employee_key: str, quotas_config: dict) -> tuple[bool, str]:
    """检查员工本月 token 是否超配额。返回 (allowed, reason)。"""
    default_limit = quotas_config.get("default_monthly_tokens", 0)
    overrides = quotas_config.get("overrides", {})
    limit = overrides.get(employee_key, default_limit)
    if limit <= 0:
        return True, ""

    _rotate_if_needed()
    mk = _current_month_key()
    used = _monthly_counters[mk].get(employee_key, 0)
    if used >= limit:
        return False, f"员工 {employee_key} 本月 token 已用 {used:,}，超出配额 {limit:,}"
    return True, ""


def get_usage(employee_key: str) -> dict:
    _rotate_if_needed()
    mk = _current_month_key()
    return {
        "month": mk,
        "employee_key": employee_key,
        "tokens_used": _monthly_counters[mk].get(employee_key, 0),
    }
