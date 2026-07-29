"""API 契约层 —— 广撒回归网。

只打「只读、无网络、无 LLM」的端点：路由装配、单例读路径、响应信封 {code,data}
任一被改坏，pytest 立刻红。写路径的正确性由 test_registry_store.py（tmp 隔离）覆盖，
本文件刻意不做任何 POST/PUT/DELETE，以免污染真实 data/。
"""
from __future__ import annotations

import pytest
from types import SimpleNamespace


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
    """目录刷新应标记免费模型，并删除本地已加入但已从完整目录下线的模型。"""
    requested_params = {}

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

    def fake_get(*args, **kwargs):
        requested_params.update(kwargs.get("params") or {})
        return FakeResponse()

    managed = {
        "name": "openrouter",
        "endpoint": "https://openrouter.ai/api/v1",
        "apiKey": "${OPENROUTER_API_KEY}",
        "enabled": True,
        "models": [
            {"modelName": "Free Model", "modelId": "vendor/free-model:free"},
            {"modelName": "Removed Model", "modelId": "vendor/removed-model"},
        ],
    }
    saved = []
    provider = SimpleNamespace(name="openrouter", models=list(managed["models"]))

    monkeypatch.setattr("app.api.ai_providers.httpx.get", fake_get)
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.list_all_providers",
        lambda: [provider],
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.get",
        lambda _name: dict(managed),
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.save",
        lambda data: saved.append(data) or data,
    )

    resp = app_client.get("/api/v1/agentapp/agent/openrouter/models")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert body["data"][0]["id"] == "vendor/free-model:free"
    assert body["data"][0]["isFree"] is True
    assert body["data"][1]["isFree"] is False
    assert requested_params == {"output_modalities": "all"}
    assert [model["modelId"] for model in saved[0]["models"]] == [
        "vendor/free-model:free"
    ]


def test_openrouter_models_empty_catalog_does_not_prune(app_client, monkeypatch):
    """上游异常空目录必须报错，不能据此清空本地供应商模型。"""
    class EmptyResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"data": []}

    save_called = False

    def fail_if_saved(_data):
        nonlocal save_called
        save_called = True

    monkeypatch.setattr(
        "app.api.ai_providers.httpx.get",
        lambda *args, **kwargs: EmptyResponse(),
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.save",
        fail_if_saved,
    )

    resp = app_client.get("/api/v1/agentapp/agent/openrouter/models")
    assert resp.status_code == 502
    assert save_called is False


def test_sync_gpt_models_keeps_general_chat_models(app_client, monkeypatch):
    """同步目录应保留通用 GPT 文字/视觉模型，并排除需专用接口的模型。"""
    provider = SimpleNamespace(
        name="openai",
        endpoint="https://api.openai.com/v1",
        api_key="sk-test",
        enabled=True,
        models=[
            {
                "modelName": "旧名称",
                "modelId": "gpt-5.6-terra",
                "timeoutMinutes": 30,
            },
            {"modelName": "已下线", "modelId": "gpt-old"},
            {"modelName": "自定义模型", "modelId": "vendor-chat"},
        ],
    )
    managed = {
        "name": provider.name,
        "endpoint": provider.endpoint,
        "apiKey": provider.api_key,
        "enabled": True,
        "models": list(provider.models),
    }
    saved = []

    class FakeModels:
        def list(self):
            return SimpleNamespace(data=[
                SimpleNamespace(id="gpt-5.6-sol"),
                SimpleNamespace(id="gpt-5.6-terra"),
                SimpleNamespace(id="gpt-image-2"),
                SimpleNamespace(id="gpt-realtime-2"),
                SimpleNamespace(id="text-embedding-3-small"),
            ])

    class FakeClient:
        def __init__(self, **_kwargs):
            self.models = FakeModels()

    monkeypatch.setattr("app.api.ai_providers.openai.OpenAI", FakeClient)
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.list_all_providers",
        lambda: [provider],
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.get",
        lambda _name: dict(managed),
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.save",
        lambda data: saved.append(data) or data,
    )

    resp = app_client.post(
        "/api/v1/agentapp/agent/ai-providers/openai/models/sync-gpt"
    )
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["syncedCount"] == 3
    assert body["gptCount"] == 2
    assert body["addedCount"] == 1
    assert body["removedCount"] == 1
    assert [model["modelId"] for model in saved[0]["models"]] == [
        "gpt-5.6-terra",
        "gpt-5.6-sol",
        "vendor-chat",
    ]
    assert saved[0]["models"][0] == {
        "modelName": "GPT-5.6 Terra（中档·视觉）",
        "modelId": "gpt-5.6-terra",
        "timeoutMinutes": 30,
    }


def test_sync_gpt_models_empty_result_does_not_overwrite(app_client, monkeypatch):
    """上游没有通用 GPT 模型时应报错，不能清空现有配置。"""
    provider = SimpleNamespace(
        name="openai",
        endpoint="https://api.openai.com/v1",
        api_key="sk-test",
        enabled=True,
        models=[{"modelName": "GPT", "modelId": "gpt-5.6-terra"}],
    )
    save_called = False

    class FakeModels:
        def list(self):
            return SimpleNamespace(data=[SimpleNamespace(id="gpt-image-2")])

    class FakeClient:
        def __init__(self, **_kwargs):
            self.models = FakeModels()

    def fail_if_saved(_data):
        nonlocal save_called
        save_called = True

    monkeypatch.setattr("app.api.ai_providers.openai.OpenAI", FakeClient)
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.list_all_providers",
        lambda: [provider],
    )
    monkeypatch.setattr(
        "app.api.ai_providers.ai_service.store.save",
        fail_if_saved,
    )

    resp = app_client.post(
        "/api/v1/agentapp/agent/ai-providers/openai/models/sync-gpt"
    )
    assert resp.status_code == 502
    assert save_called is False
