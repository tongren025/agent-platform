"""数据库基础设施 —— 同步 SQLAlchemy 2.0 + psycopg3。

选同步而非 async:现有 API 路由多为同步 def,repository 内部自管
session,业务层零改动即可从 JSON 文件切到 PostgreSQL。真正 IO 密集的
队列(M4)/embedding(M3)另走 async,不强求全栈异步。
"""
from __future__ import annotations

from contextlib import contextmanager
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import settings

# pool_pre_ping:连接前探活,避免 PG 空闲断连后拿到坏连接
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


@contextmanager
def session_scope() -> Iterator[Session]:
    """事务边界 —— 正常提交,异常回滚,始终关闭。repository 内部使用。"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Iterator[Session]:
    """FastAPI 依赖 —— 需要在路由里直接用 session 时注入。"""
    with session_scope() as session:
        yield session


def init_db() -> None:
    """首次启动建表(开发/自测便捷路径);生产用 alembic 迁移。"""
    from app.models.db.base import Base
    import app.models.db.user     # noqa: F401  注册 ORM 到 metadata
    import app.models.db.run      # noqa: F401  M1：运行记录表
    import app.models.db.session  # noqa: F401  M1：对话会话表
    import app.models.db.memory   # noqa: F401  M1：长期记忆表
    import app.models.db.embedding # noqa: F401  M3：向量 embedding 表

    Base.metadata.create_all(bind=engine)
