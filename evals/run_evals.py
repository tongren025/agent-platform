"""eval 运行入口：把 evals/cases/*.json 跑过真实数字员工并打分。

    python -m evals.run_evals              # 跑默认目录 evals/cases 下全部 case
    python -m evals.run_evals --dir path   # 指定 case 目录

任一 case 失败即以非零码退出，可直接挂进 CI 做回归门（蒸馏 / 提示词改动后重跑对比）。
"""
from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from evals.harness import SuiteReport, load_cases, run_suite

_DEFAULT_DIR = Path(__file__).resolve().parent / "cases"


async def _real_invoke(employee_key: str, user_input: str) -> str:
    # 延迟导入：只有真正跑 eval 时才拉起 app 依赖
    from app.models.conversation import AgentRunRequest
    from app.services.invocation import run_invocation

    res = await run_invocation(
        AgentRunRequest(employee_key=employee_key, user_input=user_input)
    )
    if not res.success:
        raise RuntimeError(res.error_message or "run failed")
    return res.assistant_message


def _print_report(report: SuiteReport) -> None:
    for r in report.reports:
        mark = "PASS" if r.passed else "FAIL"
        print(f"[{mark}] {r.case_id}  ({r.employee_key})")
        if r.error:
            print(f"         ! invoke 失败: {r.error}")
        for c in r.checks:
            if not c.passed:
                print(f"         ✗ {c.kind}: {c.detail}")
    print(f"\n{report.passed}/{report.total} passed")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, default=_DEFAULT_DIR)
    args = ap.parse_args()

    cases = load_cases(args.dir)
    if not cases:
        print(f"没有 case（目录 {args.dir}）——把 *.json.example 复制成 *.json 并填真实 employeeKey")
        return 1

    report = asyncio.run(run_suite(cases, _real_invoke))
    _print_report(report)
    return 0 if report.all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
