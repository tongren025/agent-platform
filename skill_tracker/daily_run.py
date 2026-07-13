"""定时任务入口：批量跑一组 query，各自存快照 + JSON，并写日志。

被 Windows 计划任务调用（见 schedule_task.ps1），也可手动跑：
    python -m skill_tracker.daily_run
    python -m skill_tracker.daily_run -q "claude skill" -q "topic:mcp"

不传 -q 时用下面的默认 query 集（与 skill 相关）。单个 query 失败不影响其他。
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

try:
    from . import tracker
except ImportError:  # 直接 python skill_tracker/daily_run.py
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from skill_tracker import tracker

# 默认每天跑这几个榜单；想改就编辑这里，或用 -q 覆盖。
# 这是趋势 query 的唯一事实来源：后端调度器（app/services/scheduler.py）也从这里导入，
# 必须与前端 SkillTracker.tsx 的 QUERY_LABELS 保持一一对应，否则 UI 上会出现永不更新的 tab。
DEFAULT_QUERIES = [
    "agent skill",
    "claude skill",
    "skill",
    "topic:mcp",
    "AI agent",
    "LLM",
    "generative-ai",
    "AI coding",
]

LOG_DIR = Path(__file__).resolve().parent / "output" / "logs"


class _Tee:
    """把 stdout 同时写到控制台和日志文件。"""

    def __init__(self, *streams):
        self._streams = streams

    def write(self, data):
        for s in self._streams:
            s.write(data)

    def flush(self):
        for s in self._streams:
            s.flush()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="批量定时拉取多个 skill 榜单")
    parser.add_argument(
        "-q", "--query", action="append", dest="queries",
        help="要跑的 query，可多次传；不传则用默认集",
    )
    parser.add_argument("-n", "--limit", type=int, default=15)
    parser.add_argument("--recent-days", type=int, default=180)
    parser.add_argument(
        "-f", "--force", action="store_true",
        help="即使当天已经拉过也强制重拉（默认跳过，避免与后端调度器重复消耗 GitHub 配额）",
    )
    args = parser.parse_args(argv)

    queries = args.queries or DEFAULT_QUERIES

    # 后端 DailyScheduler 也会同步趋势。两个入口都做当天幂等，谁先跑到算谁的。
    def _fresh(q: str) -> bool:
        if args.force:
            return False
        try:
            from app.api.skills import is_query_fresh
            return is_query_fresh(q)
        except Exception:  # noqa: BLE001 脱离后端单独跑 CLI 时不做幂等判断
            return False

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / f"{datetime.now().strftime('%Y%m%d')}.log"
    log_file = log_path.open("a", encoding="utf-8")
    orig_stdout = sys.stdout
    sys.stdout = _Tee(orig_stdout, log_file)

    failures = skipped = 0
    try:
        print(f"\n########## 运行于 {datetime.now().isoformat()} ##########")
        for q in queries:
            if _fresh(q):
                skipped += 1
                print(f"\n>>>>> query: {q} —— 当天已有数据，跳过（-f 可强制重拉）")
                continue
            print(f"\n>>>>> query: {q}")
            try:
                tracker.run(q, args.limit, args.recent_days, as_json=True)
            except Exception as e:  # noqa: BLE001 单个 query 失败不中断
                failures += 1
                print(f"  [失败] query={q!r}: {e}")
    finally:
        sys.stdout = orig_stdout
        log_file.close()

    print(f"完成，共 {len(queries)} 个 query，跳过 {skipped} 个，失败 {failures} 个。日志: {log_path}")
    return 1 if failures and failures == len(queries) - skipped else 0


if __name__ == "__main__":
    raise SystemExit(main())
