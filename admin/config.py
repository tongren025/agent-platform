"""管理端独立服务配置：管理员初始化口令、两端共用的签名密钥和监听端口。

全部走环境变量，未配置时落到仅供本地开发的默认值。
生产部署请务必设置 ADMIN_PASSWORD 和 ADMIN_SECRET。
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# 本模块的常量都在导入时求值，所以必须先把 .env 灌进 os.environ 再读。
# 独立 admin 进程（uvicorn admin.main:app）不经过 app/config.py，
# 保证两个进程读取同一密钥；开发环境缺省使用固定开发密钥，生产环境缺省则拒绝启动。
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# 管理员账号口令：优先读环境变量，否则用默认（仅本地开发）
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
APP_ENV = os.environ.get("APP_ENV", "development").strip().lower()

# 签 token 用的密钥：未配置则用固定开发密钥（跨进程一致），
# 避免 app(8000) 与 admin(8001) 各自随机生成导致 token 互不认账。
_env_secret = os.environ.get("ADMIN_SECRET", "").strip()
if _env_secret:
    ADMIN_SECRET = _env_secret
else:
    if APP_ENV in {"production", "prod"}:
        raise RuntimeError("生产环境必须设置 ADMIN_SECRET（至少 32 位）")
    import logging as _logging
    _logging.getLogger(__name__).warning(
        "ADMIN_SECRET 未配置，使用固定开发密钥——生产环境务必在 .env 中设置 ADMIN_SECRET"
    )
    ADMIN_SECRET = "dev-only-secret-change-in-production"

if APP_ENV in {"production", "prod"}:
    if ADMIN_PASSWORD.lower() in {"", "admin", "admin123", "change-me-in-prod", "changeme"} or len(ADMIN_PASSWORD) < 12:
        raise RuntimeError("生产环境必须设置至少 12 位 ADMIN_PASSWORD，不能使用示例默认值")
    if len(ADMIN_SECRET) < 32 or ADMIN_SECRET.lower() in {
        "admin", "admin123", "change-me-in-prod", "changeme", "dev-only-secret-change-in-production",
    }:
        raise RuntimeError("生产环境 ADMIN_SECRET 至少需要 32 位，不能使用示例或开发默认密钥")

# token 有效期（秒），默认 12 小时
ADMIN_TOKEN_TTL = int(os.environ.get("ADMIN_TOKEN_TTL", str(12 * 3600)))

# 独立服务监听端口（用户端默认 8000/5311，这里另起一个避免冲突）
ADMIN_PORT = int(os.environ.get("ADMIN_PORT", "8001"))
