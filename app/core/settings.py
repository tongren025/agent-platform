"""基础设施配置 —— 走环境变量 / .env,密钥不再进 json 版本库。

与 app.config.settings(业务配置,读 appsettings.json)区分:
这里只放数据库、Redis、密钥、日志、CORS 等基础设施项。
用 pydantic-settings 统一校验和类型转换,用户端 / 管理端共享同一份。
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class CoreSettings(BaseSettings):
    """基础设施配置（环境变量 / .env 驱动）：DB、Redis、密钥、日志、CORS 等，app 与 admin 两进程共享。"""

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

    # 演示种子:启动时注入 13 节点漫剧演示工作流。默认关——
    # 演示运行结果不进制作看板,只会让生产入口显得混乱。
    seed_demo_workflows: bool = False

    # AI 趋势自动同步:每天到点批量刷 GitHub 榜单并重生成 AI 分析报告。
    # 默认开——趋势页的价值全靠数据新鲜度,关掉就退化成一份过期快照。
    # 若仍在用 Windows 计划任务 SkillTrackerDaily,请关掉其中一个,避免一天拉两次。
    trends_auto_sync: bool = True
    trends_sync_time: str = "02:00"  # 本地时间 HH:MM,早于蒸馏(03:00)/进化(04:00)

    # 数据库(M1 起用)
    database_url: str = "postgresql+psycopg://agent:change-me-in-prod@postgres:5432/agent"

    # Redis(M4/M5 起用)
    redis_url: str = "redis://redis:6379/0"

    # 管理端鉴权(与 admin.config 保持一致的来源)
    admin_username: str = "admin"
    admin_password: str = "admin123"
    admin_secret: str = ""
    admin_token_ttl: int = 12 * 3600
    # 生产 SPA 通过 app 的 /api/admin 同源代理访问独立管理端进程。
    admin_api_url: str = "http://127.0.0.1:8001"

    # LLM / Embedding(M3 起用,国内 DashScope)
    # 后台托管 provider API Key 的 Fernet 主密钥；留空时生成到持久化 data/.secrets。
    ai_provider_encryption_key: str = ""
    dashscope_api_key: str = ""

    # GitHub 趋势拉取。匿名限流 10 次/分钟,而一次全量同步要打 16 次(8 query × 2 次 search),
    # 极易触发 403 靠 sleep 硬扛。配置 token 后提升到 30 次/分钟。
    # 注意:skill_tracker.GitHubClient 走 os.getenv 读它(CLI 单独跑时也要能用),
    # 而 pydantic-settings 只把 .env 读进对象、不写 os.environ——故需 export_to_env() 显式回灌。
    github_token: str = ""

    # 日志
    log_level: str = "INFO"
    log_json: bool = False

    # CORS —— 逗号分隔;"*" 表示放开(仅开发)
    cors_origins: str = "*"

    @model_validator(mode="after")
    def validate_production_security(self) -> "CoreSettings":
        """生产环境拒绝会导致越权、数据丢失或跨环境串配置的默认值。"""
        if not self.is_production:
            return self

        problems: list[str] = []
        weak_passwords = {"", "admin", "admin123", "change-me-in-prod", "changeme"}
        password = self.admin_password.strip()
        secret = self.admin_secret.strip()
        if password.lower() in weak_passwords or len(password) < 12:
            problems.append("ADMIN_PASSWORD 至少 12 位且不能使用示例默认值")
        if secret.lower() in weak_passwords or len(secret) < 32:
            problems.append("ADMIN_SECRET 至少 32 位且不能使用示例默认值")
        if not self.user_api_auth:
            problems.append("USER_API_AUTH 必须为 true")
        if "change-me-in-prod" in self.database_url.lower():
            problems.append("DATABASE_URL 仍在使用示例数据库密码")
        if not self.cors_origins.strip() or self.cors_origins.strip() == "*":
            problems.append("CORS_ORIGINS 必须设置为明确的前端域名，不能使用 *")
        if problems:
            raise ValueError("生产配置未通过安全检查：" + "；".join(problems))
        return self

    @property
    def is_production(self) -> bool:
        """APP_ENV 是否为生产环境（production / prod），用于日志格式、错误脱敏等分支。"""
        return self.app_env.lower() in ("production", "prod")

    @property
    def cors_origin_list(self) -> list[str]:
        """把逗号分隔的 CORS_ORIGINS 解析成列表；空或 '*' 视为全放开（仅限开发）。"""
        raw = (self.cors_origins or "").strip()
        if not raw or raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]

    @property
    def cors_allow_credentials(self) -> bool:
        """通配符来源不能与浏览器凭证同时启用，避免无效且过宽的 CORS 响应。"""
        return self.cors_origin_list != ["*"]


@lru_cache
def get_settings() -> CoreSettings:
    """进程级单例配置（lru_cache 保证只加载一次 .env）；常规代码直接用模块级 settings 即可。"""
    return CoreSettings()


settings = get_settings()


def export_to_env() -> None:
    """把少数需要被「不认识 CoreSettings 的第三方/独立模块」读到的配置回灌进 os.environ。

    pydantic-settings 只把 .env 解析进对象，不会写 os.environ；
    而 skill_tracker.GitHubClient 是可脱离后端单独跑的 CLI 组件，只认 os.getenv("GITHUB_TOKEN")。
    不覆盖真实环境变量（真实 env 优先级更高）。
    """
    import os

    if settings.github_token and not os.environ.get("GITHUB_TOKEN"):
        os.environ["GITHUB_TOKEN"] = settings.github_token


export_to_env()
