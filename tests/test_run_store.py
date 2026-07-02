"""agent 运行落库的回归网 —— 存储 round-trip、过滤、成本估算、只读 API。

这是补 L3"可观测闭环"的验证：以前一次 run 跑完即散，现在能落库、按员工/成败过滤、
并通过 /runs API 事后审计成本与行为。
"""
from __future__ import annotations

from app.models.run_record import AgentRunRecord
from app.services.run_store import AgentRunStore, estimate_cost


def test_save_load_roundtrip(tmp_path):
    store = AgentRunStore(run_dir=str(tmp_path))
    rec = AgentRunRecord(
        session_id="ses_1", employee_key="alice", model="gpt-4o",
        prompt_tokens=100, completion_tokens=50, total_tokens=150,
    )
    store.save_run(rec)

    loaded = store.load_run(rec.run_id)
    assert loaded is not None
    assert loaded.employee_key == "alice"
    assert loaded.total_tokens == 150


def test_list_filters_by_employee_and_success(tmp_path):
    store = AgentRunStore(run_dir=str(tmp_path))
    store.save_run(AgentRunRecord(employee_key="alice", success=True))
    store.save_run(AgentRunRecord(employee_key="alice", success=False))
    store.save_run(AgentRunRecord(employee_key="bob", success=True))

    assert len(store.list_runs(employee_key="alice")) == 2
    assert len(store.list_runs(employee_key="alice", success=False)) == 1
    assert len(store.list_runs(success=True)) == 2


def test_load_missing_returns_none(tmp_path):
    store = AgentRunStore(run_dir=str(tmp_path))
    assert store.load_run("run_nope") is None


def test_estimate_cost_is_none_without_price():
    assert estimate_cost("unknown-model", 1000, 1000) is None


def test_estimate_cost_uses_price_map(monkeypatch):
    from app.config import settings as biz_settings
    monkeypatch.setitem(
        biz_settings.model_prices, "gpt-x",
        {"promptPer1k": 0.005, "completionPer1k": 0.015},
    )
    # 2000 prompt + 1000 completion → 2*0.005 + 1*0.015 = 0.025
    assert estimate_cost("gpt-x", 2000, 1000) == 0.025


def test_runs_api_list_returns_envelope(app_client):
    resp = app_client.get("/api/v1/agentapp/agent/runs")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert isinstance(body["data"], list)


def test_runs_api_get_missing_is_404(app_client):
    resp = app_client.get("/api/v1/agentapp/agent/runs/run_does_not_exist")
    assert resp.status_code == 404
