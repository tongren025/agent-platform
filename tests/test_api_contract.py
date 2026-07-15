"""API 契约层 —— 广撒回归网。

只打「只读、无网络、无 LLM」的端点：路由装配、单例读路径、响应信封 {code,data}
任一被改坏，pytest 立刻红。写路径的正确性由 test_registry_store.py（tmp 隔离）覆盖，
本文件刻意不做任何 POST/PUT/DELETE，以免污染真实 data/。
"""
from __future__ import annotations

import pytest


# 每个都返回统一信封 _ok(...) → {"code": 200, "data": <list|dict>}，且不触网、不调模型。
READ_ONLY_ENDPOINTS = [
    "/api/v1/agentapp/registry/skills",
    "/api/v1/agentapp/registry/mcp-servers",
    "/api/v1/agentapp/registry/tools",
    "/api/v1/agentapp/registry/employees",
    "/api/v1/agentapp/registry/role-templates",
    "/api/v1/agentapp/agent/employees",
    "/api/v1/agentapp/agent/sessions",
    "/api/v1/agentapp/agent/ai-providers",
    "/api/v1/agentapp/workflow",
    "/api/v1/agentapp/workflow/node-types",
    "/api/v1/agentapp/knowledge-graph",
    "/api/v1/agentapp/scrape/sources",
    "/api/v1/agentapp/scrape/learn-sources",
    "/api/v1/agentapp/scrape/employees",
    "/api/v1/agentapp/trend-sources/hn/queries",
    "/api/v1/agentapp/trend-sources/arxiv/categories",
    "/api/v1/agentapp/trend-sources/news/topics",
    "/api/v1/agentapp/trend-sources/reddit/subs",
    "/api/v1/agentapp/trend-sources/overview",
]


@pytest.mark.parametrize("path", READ_ONLY_ENDPOINTS)
def test_readonly_endpoint_returns_envelope(app_client, path):
    resp = app_client.get(path)
    assert resp.status_code == 200, f"{path} → {resp.status_code}"
    body = resp.json()
    assert body["code"] == 200
    assert "data" in body


# ── 校验 / 错误路径 ────────────────────────────────────────────────

def test_bad_key_returns_400(app_client):
    # code 含 ".." 命中 validate_key → 400（用 a..b 规避 URL 规范化）
    resp = app_client.get("/api/v1/agentapp/registry/skills/a..b")
    assert resp.status_code == 400
    assert resp.json()["code"] == 400


def test_missing_resource_returns_404(app_client):
    resp = app_client.get("/api/v1/agentapp/registry/skills/definitely-missing-xyz")
    assert resp.status_code == 404
    assert resp.json()["code"] == 404


def test_auth_check_without_token_returns_401(app_client):
    resp = app_client.get("/api/v1/agentapp/auth/check")
    assert resp.status_code == 401


def test_login_with_bad_credentials_returns_401(app_client):
    resp = app_client.post(
        "/api/v1/agentapp/auth/login",
        json={"username": "__nope__", "password": "__nope__"},
    )
    assert resp.status_code == 401


def test_login_missing_body_returns_422(app_client):
    # pydantic 校验失败 → 422，锁住请求体契约
    resp = app_client.post("/api/v1/agentapp/auth/login", json={})
    assert resp.status_code == 422


def test_openrouter_models_endpoint_marks_free_models(app_client, monkeypatch):
    """OpenRouter 模型目录接口应返回 JSON 信封，而不是被 SPA 兜底成 HTML。"""
    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "data": [
                    {
                        "id": "vendor/free-model:free",
                        "name": "Free Model",
                        "context_length": 8192,
                        "pricing": {"prompt": "0", "completion": "0"},
                        "architecture": {"modality": "text->text"},
                        "top_provider": {},
                    },
                    {
                        "id": "vendor/paid-model",
                        "name": "Paid Model",
                        "context_length": 32768,
                        "pricing": {"prompt": "0.000001", "completion": "0.000002"},
                        "architecture": {"modality": "text->text"},
                        "top_provider": {},
                    },
                ]
            }

    monkeypatch.setattr("app.api.ai_providers.httpx.get", lambda *args, **kwargs: FakeResponse())

    resp = app_client.get("/api/v1/agentapp/agent/openrouter/models")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert body["data"][0]["id"] == "vendor/free-model:free"
    assert body["data"][0]["isFree"] is True
    assert body["data"][1]["isFree"] is False
