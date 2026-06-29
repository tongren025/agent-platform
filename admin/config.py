"""管理端独立服务的配置——与用户端分离的鉴权口令 + 端口。

全部走环境变量，未配置时落到仅供本地开发的默认值。
生产部署请务必设置 ADMIN_PASSWORD 和 ADMIN_SECRET。
"""
from __future__ import annotations

import os
import secrets

# 管理员账号口令：优先读环境变量，否则用默认（仅本地开发）
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

# 签 token 用的密钥：未配置则每次启动随机生成（重启即令所有已发 token 失效）
ADMIN_SECRET = os.environ.get("ADMIN_SECRET") or secrets.token_hex(32)

# token 有效期（秒），默认 12 小时
ADMIN_TOKEN_TTL = int(os.environ.get("ADMIN_TOKEN_TTL", str(12 * 3600)))

# 独立服务监听端口（用户端默认 8000/5311，这里另起一个避免冲突）
ADMIN_PORT = int(os.environ.get("ADMIN_PORT", "8001"))
