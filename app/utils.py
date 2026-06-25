"""全局工具函数——消除各 model 文件中的 _now() 重复。"""
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
