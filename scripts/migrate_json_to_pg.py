"""一次性把 data/**.json 里的运行态导入 PostgreSQL。

用法（先确保 PG 已起、依赖已装、表已建）：
    alembic upgrade head            # 建表
    python -m scripts.migrate_json_to_pg

只搬"要查的"运行态：运行记录 / 会话 / 长期记忆（与 use_db_stores 切换的范围一致）。
幂等：按主键 upsert / 整表覆盖，重复跑不会产生重复数据。注册表等静态配置不搬（仍走 JSON）。

各 migrate_* 函数接受注入的 store/backend，故可用 SQLite 单测（见 tests/test_migrate_json_to_pg.py）。
"""
from __future__ import annotations

from pathlib import Path

_KINDS = ("semantic", "episodic", "procedural")


def migrate_runs(json_store, db_store) -> int:
    runs = json_store.list_runs(limit=10**9)
    for r in runs:
        db_store.save_run(r)
    return len(runs)


def migrate_sessions(json_store, db_store) -> int:
    sessions = json_store.list_sessions(limit=10**9, include_archived=True)
    for s in sessions:
        db_store.save_session(s)
    return len(sessions)


def migrate_memory(memory_root: Path, json_backend, pg_backend) -> int:
    if not memory_root.exists():
        return 0
    count = 0
    for emp_dir in sorted(memory_root.iterdir()):
        if not emp_dir.is_dir():
            continue
        emp = emp_dir.name
        for kind in _KINDS:
            rows = json_backend.load(emp, kind)
            if rows:
                pg_backend.save(emp, kind, rows)
                count += len(rows)
    return count


def main() -> None:
    from app.config import BASE_DIR
    from app.core.db import init_db
    from app.services.memory import ConversationMemoryStore
    from app.services.memory_db import ConversationMemoryDbStore
    from app.services.long_term_memory import JsonMemoryBackend
    from app.services.long_term_memory_db import PgMemoryBackend
    from app.services.run_store import AgentRunStore
    from app.services.run_store_db import AgentRunDbStore

    init_db()  # 兜底建表；生产应先 `alembic upgrade head`

    runs = migrate_runs(AgentRunStore(), AgentRunDbStore())
    sessions = migrate_sessions(ConversationMemoryStore(), ConversationMemoryDbStore())
    mem_root = BASE_DIR / "data" / "memory"
    mem = migrate_memory(mem_root, JsonMemoryBackend(mem_root), PgMemoryBackend())

    print(f"导入完成：运行记录 {runs} 条，会话 {sessions} 个，长期记忆 {mem} 条")


if __name__ == "__main__":
    main()
