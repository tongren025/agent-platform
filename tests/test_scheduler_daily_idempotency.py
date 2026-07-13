"""调度器的「当天只跑一次」语义 —— 必须跨进程重启依然成立。

背景:`_distill_done_today` / `_evolve_done_today` 只活在内存里,进程一重启就忘光,
于是每次重启都把全部员工的蒸馏 + 自我进化重跑一遍(实测某天累计 151 + 165 次,
应为 11 + 11 次,每次都是十几秒的 LLM 调用)。

修法是从**已落盘的运行日志**推导"今天跑过了"。这里锁住两处最容易回归的地方:
1. 日志里的 ranAt 是 UTC(带 Z),而"今天"按本地日期判断——必须先换算时区。
2. 失败的运行也要算作"今天已尝试",否则失败一次就会每 30 秒重试一整天。
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

import pytest

from app.services import distillation, evolution
from app.services.scheduler import DailyScheduler


def _today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


# ── _ran_on:时区与边界 ──────────────────────────────────────────────

def test_ran_on_none_means_never_ran():
    assert DailyScheduler._ran_on(None, _today()) is False


def test_ran_on_utc_timestamp_is_converted_to_local_date():
    """UTC 的 now 换算到本地日期后必须等于本地今天(否则时区一偏就漏跑/重跑)。"""
    assert DailyScheduler._ran_on(datetime.now(timezone.utc), _today()) is True


def test_ran_on_yesterday_is_false():
    assert DailyScheduler._ran_on(datetime.now(timezone.utc) - timedelta(hours=25), _today()) is False


def test_ran_on_future_counts_as_done_guards_clock_skew():
    """时钟回拨时宁可今天少跑一次,也不要疯狂重跑——故用 >= 而非 ==。"""
    assert DailyScheduler._ran_on(datetime.now(timezone.utc) + timedelta(days=1), _today()) is True


def test_ran_on_naive_datetime_is_treated_as_local():
    assert DailyScheduler._ran_on(datetime.now(), _today()) is True


# ── last_run_at:从落盘日志推导 ──────────────────────────────────────

@pytest.fixture
def emp_key(tmp_path, monkeypatch):
    """把两个服务的日志路径都重定向到 tmp,不碰真实 data/。"""
    key = "test-employee"
    d_log = tmp_path / "distill.json"
    e_log = tmp_path / "evolve.json"
    monkeypatch.setattr(distillation, "_log_path", lambda k: d_log)
    monkeypatch.setattr(evolution, "_run_logs_path", lambda k: e_log)
    return key, d_log, e_log


def test_last_run_at_missing_file_returns_none(emp_key):
    key, _, _ = emp_key
    assert distillation.last_run_at(key) is None
    assert evolution.last_run_at(key) is None


def test_last_run_at_picks_the_newest_entry(emp_key):
    key, d_log, _ = emp_key
    d_log.write_text(json.dumps([
        {"ranAt": "2026-07-08T01:00:00Z"},
        {"ranAt": "2026-07-10T06:13:52Z"},   # 最新的,不在末尾
        {"ranAt": "2026-07-09T02:00:00Z"},
    ]), encoding="utf-8")
    got = distillation.last_run_at(key)
    assert got == datetime(2026, 7, 10, 6, 13, 52, tzinfo=timezone.utc)


def test_failed_run_still_counts_as_ran(emp_key):
    """失败的运行也写日志,也必须算"今天已尝试",否则会每 30 秒重试一整天。"""
    key, d_log, _ = emp_key
    stamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    d_log.write_text(json.dumps([{"ranAt": stamp, "error": "LLM 超时"}]), encoding="utf-8")
    assert DailyScheduler._ran_on(distillation.last_run_at(key), _today()) is True


def test_corrupt_log_returns_none_rather_than_raising(emp_key):
    """日志损坏时应退化成"没跑过"(允许重跑),而不是把调度器整个巡检打挂。"""
    key, d_log, e_log = emp_key
    d_log.write_text("{ not json", encoding="utf-8")
    e_log.write_text("[]", encoding="utf-8")
    assert distillation.last_run_at(key) is None
    assert evolution.last_run_at(key) is None


def test_evolution_last_run_at_reads_its_own_log(emp_key):
    key, _, e_log = emp_key
    e_log.write_text(json.dumps([{"ranAt": "2026-07-10T06:14:06.134703Z"}]), encoding="utf-8")
    got = evolution.last_run_at(key)
    assert got is not None and got.year == 2026 and got.month == 7 and got.day == 10
