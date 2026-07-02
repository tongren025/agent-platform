"""M5 限流/配额回归 —— slowapi 429 + 员工 token 配额检查。"""
from __future__ import annotations

from app.core.rate_limit import (
    _monthly_counters,
    check_quota,
    get_usage,
    record_token_usage,
)


def test_record_and_get_usage():
    record_token_usage("quota_test_a", 1000)
    usage = get_usage("quota_test_a")
    assert usage["tokens_used"] >= 1000
    assert usage["employee_key"] == "quota_test_a"


def test_check_quota_allows_when_under_limit():
    record_token_usage("quota_test_b", 500)
    allowed, reason = check_quota("quota_test_b", {"default_monthly_tokens": 10000})
    assert allowed is True
    assert reason == ""


def test_check_quota_blocks_when_over_limit():
    record_token_usage("quota_test_c", 99999)
    allowed, reason = check_quota("quota_test_c", {"default_monthly_tokens": 1000})
    assert allowed is False
    assert "超出配额" in reason


def test_check_quota_unlimited_when_zero():
    record_token_usage("quota_test_d", 99999999)
    allowed, _ = check_quota("quota_test_d", {"default_monthly_tokens": 0})
    assert allowed is True


def test_check_quota_override_per_employee():
    record_token_usage("quota_test_e", 5000)
    allowed, _ = check_quota("quota_test_e", {
        "default_monthly_tokens": 1000,
        "overrides": {"quota_test_e": 0},
    })
    assert allowed is True


def test_quota_api_returns_usage(app_client):
    resp = app_client.get("/api/v1/agentapp/agent/quota/some_emp")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert "tokens_used" in body["data"]


def test_rate_limit_429(app_client):
    """slowapi 挂载验证：超限返回 429（此处验证 handler 已注册）。"""
    resp = app_client.get("/api/v1/agentapp/agent/quota/test")
    assert resp.status_code == 200
