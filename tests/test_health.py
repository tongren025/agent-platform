"""冒烟测试 —— 校验两端可启动、健康检查通、request_id 与 /metrics 就绪。

这是 M0 地基的回归网:只要中间件 / 异常处理 / 指标端点被改坏,CI 立刻红。
"""
from __future__ import annotations


def test_app_healthcheck(app_client):
    resp = app_client.get("/healthcheck")
    assert resp.status_code == 200
    assert resp.json() == "ok"


def test_admin_healthcheck(admin_client):
    resp = admin_client.get("/healthcheck")
    assert resp.status_code == 200
    assert resp.json() == "ok"


def test_request_id_header_present(app_client):
    resp = app_client.get("/healthcheck")
    assert resp.headers.get("X-Request-ID")


def test_metrics_endpoint_exposed(app_client):
    resp = app_client.get("/metrics")
    assert resp.status_code == 200
    assert "http_request" in resp.text


def test_unknown_route_returns_envelope(admin_client):
    # 管理端无 SPA fallback,未知路由应命中统一异常信封
    resp = admin_client.get("/api/admin/does-not-exist")
    assert resp.status_code == 404
    body = resp.json()
    assert body["code"] == 404
    assert "message" in body
