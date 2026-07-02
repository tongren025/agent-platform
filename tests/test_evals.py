"""eval harness 的回归网 —— check 引擎 + 套件运行，全程无网络。

golden cases 是领域内容（放 evals/cases/），这里只回归"机器"：断言逻辑对不对、
invoke 失败会不会被算作 case 失败、套件通过率统计对不对。
"""
from __future__ import annotations

import json

from evals.checks import evaluate_output, run_check
from evals.harness import EvalCase, load_cases, run_suite


# ── check 引擎 ────────────────────────────────────────────────

def test_contains_and_not_contains():
    assert run_check("竖屏 9:16 提示词", {"type": "contains", "value": "竖屏"}).passed
    assert not run_check("横屏 16:9", {"type": "contains", "value": "竖屏"}).passed
    assert run_check("竖屏", {"type": "not_contains", "value": "横屏"}).passed
    assert not run_check("横屏", {"type": "not_contains", "value": "横屏"}).passed


def test_regex_and_length():
    assert run_check("分辨率 1080x1920", {"type": "regex", "pattern": r"1080.?1920"}).passed
    assert run_check("x" * 100, {"type": "min_length", "value": 80}).passed
    assert not run_check("short", {"type": "min_length", "value": 80}).passed
    assert not run_check("x" * 100, {"type": "max_length", "value": 50}).passed


def test_json_checks():
    assert run_check('{"a": 1, "b": 2}', {"type": "is_json"}).passed
    assert not run_check("not json", {"type": "is_json"}).passed
    assert run_check('{"a": 1, "b": 2}', {"type": "json_has_keys", "keys": ["a", "b"]}).passed
    assert not run_check('{"a": 1}', {"type": "json_has_keys", "keys": ["a", "b"]}).passed


def test_unknown_check_type_fails_loudly():
    assert not run_check("x", {"type": "bogus"}).passed


def test_evaluate_output_aggregates():
    results = evaluate_output("竖屏 9:16", [
        {"type": "contains", "value": "竖屏"},
        {"type": "not_contains", "value": "横屏"},
    ])
    assert all(r.passed for r in results)


# ── harness ──────────────────────────────────────────────────

def _case(cid: str, checks: list[dict]) -> EvalCase:
    return EvalCase(case_id=cid, employee_key="emp", input="hi", checks=checks)


async def test_run_suite_scores_pass_fail_and_invoke_error():
    async def invoke(_emp: str, _inp: str) -> str:
        return "竖屏 9:16 的提示词内容"

    async def failing_invoke(_emp: str, _inp: str) -> str:
        raise RuntimeError("Employee not found")

    passing = _case("ok", [{"type": "contains", "value": "竖屏"}])
    failing = _case("bad", [{"type": "contains", "value": "横屏"}])

    report = await run_suite([passing, failing], invoke)
    assert report.total == 2
    assert report.passed == 1
    assert not report.all_passed

    # invoke 抛错 → 该 case 记为失败，且带上错误信息，不中断整套
    err_report = await run_suite([passing], failing_invoke)
    assert err_report.passed == 0
    assert err_report.reports[0].error == "Employee not found"


async def test_all_passed_true_when_every_case_passes():
    async def invoke(_emp: str, _inp: str) -> str:
        return "竖屏内容足够长" * 5

    cases = [
        _case("a", [{"type": "contains", "value": "竖屏"}]),
        _case("b", [{"type": "min_length", "value": 10}]),
    ]
    report = await run_suite(cases, invoke)
    assert report.all_passed


def test_load_cases_reads_json(tmp_path):
    (tmp_path / "c1.json").write_text(json.dumps({
        "id": "c1", "employeeKey": "emp", "input": "hi",
        "checks": [{"type": "contains", "value": "x"}],
    }), encoding="utf-8")
    cases = load_cases(tmp_path)
    assert len(cases) == 1
    assert cases[0].case_id == "c1"
    assert cases[0].employee_key == "emp"
