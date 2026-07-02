"""基础设施配置 —— 走环境变量 / .env,密钥不再进 json 版本库。

与 app.config.settings(业务配置,读 appsettings.json)区分:
这里只放数据库、Redis、密钥、日志、CORS 等基础设施项。
用 pydantic-settings 统一校验和类型转换,用户端 / 管理端共享同一份。
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CoreSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # 运行环境
    app_env: str = "development"

    # 存储后端：M1 迁移开关。True = 运行态走 PostgreSQL；False（默认）= 旧 JSON 文件。
    # 逐个 store 迁移期间用它灰度切换，PG 未就绪时保持 False 不影响现有功能。
    use_db_stores: bool = False

    # 用户端 API 强制鉴权(P0 修复):默认开。仅作应急逃生口,勿在生产关闭。
    user_api_auth: bool = True

    # 数据库(M1 起用)
    database_url: str = "postgresql+psycopg://agent:change-me-in-prod@postgres:5432/agent"

    # Redis(M4/M5 起用)
    redis_url: str = "redis://redis:6379/0"

    # 管理端鉴权(与 admin.config 保持一致的来源)
    admin_username: str = "admin"
    admin_password: str = "admin123"
    admin_secret: str = ""
    admin_token_ttl: int = 12 * 3600

    # LLM / Embedding(M3 起用,国内 DashScope)
    dashscope_api_key: str = ""

    # 日志
    log_level: str = "INFO"
    log_json: bool = False

    # CORS —— 逗号分隔;"*" 表示放开(仅开发)
    cors_origins: str = "*"

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in ("production", "prod")

    @property
    def cors_origin_list(self) -> list[str]:
        raw = (self.cors_origins or "").strip()
        if not raw or raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> CoreSettings:
    return CoreSettings()


settings = get_settings()
