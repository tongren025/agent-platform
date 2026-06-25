"""API 层公共工具函数——消除各 router 文件中的重复定义。"""
from __future__ import annotations

import re

from fastapi import HTTPException

BAD_KEY_RE = re.compile(r"[/\\]|\.\.")


def ok(data: object = None) -> dict:
    return {"code": 200, "data": data}


def validate_key(key: str, *, label: str = "key") -> None:
    if not key or BAD_KEY_RE.search(key):
        raise HTTPException(status_code=400, detail=f"Invalid {label}: {key!r}")
