"""产出文件保留策略。

`skills_*.json` 每次同步每个 query 写一份（8 个/天），而只有「每个 query 最新的那份」
会被读取（见 app/api/skills.py 的 _latest_per_query）。旧的既不被读，也让每次 API 调用
的目录扫描变慢，属于纯增长的垃圾。

⚠️ 只清理 `skills_*.json`。`output/snapshots/` 绝不触碰——
star 走势历史只存在于快照里，删掉就再也拿不回来了（GitHub 不提供历史 star 数）。
"""
from __future__ import annotations

import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent / "output"

DEFAULT_KEEP_PER_QUERY = 5


def prune_outputs(keep_per_query: int = DEFAULT_KEEP_PER_QUERY, dry_run: bool = False) -> dict:
    """每个 query 只保留最近 keep_per_query 份 skills_*.json，其余删除。

    返回 {"kept": n, "deleted": n, "freed_bytes": n, "deleted_files": [...]}。
    dry_run=True 时只统计不删除。
    """
    if not OUTPUT_DIR.exists() or keep_per_query < 1:
        return {"kept": 0, "deleted": 0, "freed_bytes": 0, "deleted_files": []}

    # query -> [(generated_at, path, size)]
    by_query: dict[str, list[tuple[str, Path, int]]] = {}
    for f in OUTPUT_DIR.glob("skills_*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue  # 坏文件留着，不擅自删
        q = data.get("query")
        if not q:
            continue
        by_query.setdefault(q, []).append((data.get("generated_at", ""), f, f.stat().st_size))

    kept = deleted = freed = 0
    deleted_files: list[str] = []
    for _q, entries in by_query.items():
        entries.sort(key=lambda e: e[0], reverse=True)  # generated_at 新 → 旧
        kept += len(entries[:keep_per_query])
        for _ts, path, size in entries[keep_per_query:]:
            deleted += 1
            freed += size
            deleted_files.append(path.name)
            if not dry_run:
                try:
                    path.unlink()
                except OSError:
                    deleted -= 1
                    freed -= size
                    deleted_files.pop()

    return {"kept": kept, "deleted": deleted, "freed_bytes": freed, "deleted_files": deleted_files}
