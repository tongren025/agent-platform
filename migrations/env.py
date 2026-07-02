import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Alembic Config 对象，读取 alembic.ini
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── 目标 metadata：导入所有 ORM，使 autogenerate 覆盖全部表 ──
from app.models.db.base import Base
import app.models.db.user     # noqa: F401
import app.models.db.run      # noqa: F401
import app.models.db.session  # noqa: F401
import app.models.db.memory   # noqa: F401

target_metadata = Base.metadata


def _get_url() -> str:
    # 优先 ALEMBIC_URL（CI / 离线自测可指向 sqlite），否则用基础设施配置里的 PG URL
    env_url = os.getenv("ALEMBIC_URL")
    if env_url:
        return env_url
    from app.core.settings import settings
    return settings.database_url


config.set_main_option("sqlalchemy.url", _get_url())


def run_migrations_offline() -> None:
    context.configure(
        url=_get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
