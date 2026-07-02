"""LLM 自定义指标回归 —— record_run_metrics 累加，且随 /metrics 暴露。"""
from __future__ import annotations

import pytest
from prometheus_client import REGISTRY

from app.core.metrics import record_run_metrics


def _val(name: str, **labels) -> float:
    return REGISTRY.get_sample_value(name, labels) or 0.0


def test_record_run_metrics_increments():
    before_runs = _val("agent_runs_total", employee="tester", success="true")
    before_cost = _val("agent_cost_usd_total", employee="tester")
    before_pt = _val("agent_prompt_tokens_total", employee="tester")

    record_run_metrics("tester", True, 100, 50, 0.02)

    assert _val("agent_runs_total", employee="tester", success="true") == before_runs + 1
    assert _val("agent_cost_usd_total", employee="tester") == pytest.approx(before_cost + 0.02)
    assert _val("agent_prompt_tokens_total", employee="tester") == before_pt + 100


def test_failed_run_labeled_separately():
    before = _val("agent_runs_total", employee="tester2", success="false")
    record_run_metrics("tester2", False, 0, 0, None)
    assert _val("agent_runs_total", employee="tester2", success="false") == before + 1


def test_metrics_exposed_on_endpoint(app_client):
    record_run_metrics("tester3", True, 10, 5, None)
    resp = app_client.get("/metrics")
    assert resp.status_code == 200
    assert "agent_runs_total" in resp.text
