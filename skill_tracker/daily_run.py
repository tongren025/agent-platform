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

# 默认每天跑这几个榜单；想改就编辑这里，或用 -q 覆盖
DEFAULT_QUERIES = [
    "AI agent",
    "LLM",
    "topic:mcp",
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
    args = parser.parse_args(argv)

    queries = args.queries or DEFAULT_QUERIES

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / f"{datetime.now().strftime('%Y%m%d')}.log"
    log_file = log_path.open("a", encoding="utf-8")
    orig_stdout = sys.stdout
    sys.stdout = _Tee(orig_stdout, log_file)

    failures = 0
    try:
        print(f"\n########## 运行于 {datetime.now().isoformat()} ##########")
        for q in queries:
            print(f"\n>>>>> query: {q}")
            try:
                tracker.run(q, args.limit, args.recent_days, as_json=True)
            except Exception as e:  # noqa: BLE001 单个 query 失败不中断
                failures += 1
                print(f"  [失败] query={q!r}: {e}")
    finally:
        sys.stdout = orig_stdout
        log_file.close()

    print(f"完成，共 {len(queries)} 个 query，失败 {failures} 个。日志: {log_path}")
    return 1 if failures == len(queries) else 0


if __name__ == "__main__":
    raise SystemExit(main())
