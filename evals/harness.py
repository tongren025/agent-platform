"""eval 套件加载 + 运行 —— 把 golden cases 跑过数字员工并按 checks 评分。

invoke 被抽象成一个异步回调 (employee_key, input) -> output：
- run_evals.py 传入真实的 run_invocation
- 单元测试传入 fake invoker，从而无需网络即可回归 harness 本身
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Awaitable, Callable

from evals.checks import CheckResult, evaluate_output

AsyncInvoke = Callable[[str, str], Awaitable[str]]


@dataclass
class EvalCase:
    case_id: str
    employee_key: str
    input: str
    checks: list[dict] = field(default_factory=list)


@dataclass
class CaseReport:
    case_id: str
    employee_key: str
    passed: bool
    checks: list[CheckResult] = field(default_factory=list)
    output: str = ""
    error: str | None = None


@dataclass
class SuiteReport:
    reports: list[CaseReport] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.reports)

    @property
    def passed(self) -> int:
        return sum(1 for r in self.reports if r.passed)

    @property
    def all_passed(self) -> bool:
        return self.total > 0 and self.passed == self.total


def load_cases(cases_dir: Path) -> list[EvalCase]:
    cases: list[EvalCase] = []
    for fp in sorted(cases_dir.glob("*.json")):
        data = json.loads(fp.read_text(encoding="utf-8"))
        cases.append(EvalCase(
            case_id=data.get("id", fp.stem),
            employee_key=data["employeeKey"],
            input=data["input"],
            checks=data.get("checks", []),
        ))
    return cases


async def run_case(case: EvalCase, invoke: AsyncInvoke) -> CaseReport:
    try:
        output = await invoke(case.employee_key, case.input)
    except Exception as exc:  # invoke 失败即本 case 失败，但不中断整套
        return CaseReport(case.case_id, case.employee_key, False, [], "", str(exc))
    results = evaluate_output(output, case.checks)
    passed = all(r.passed for r in results)
    return CaseReport(case.case_id, case.employee_key, passed, results, output[:500])


async def run_suite(cases: list[EvalCase], invoke: AsyncInvoke) -> SuiteReport:
    report = SuiteReport()
    for case in cases:
        report.reports.append(await run_case(case, invoke))
    return report
