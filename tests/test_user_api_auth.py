"""用户端 API 鉴权中间件回归(P0 修复)。

验证:无凭证 401 / 坏 token 401 / 登录端点豁免 / healthcheck 豁免 /
有效凭证放行 / viewer 角色写管理资源被 403。
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def anon_client():
    from app.main import app
    return TestClient(app)


def test_api_requires_token(anon_client):
    resp = anon_client.get("/api/v1/agentapp/registry/employees")
    assert resp.status_code == 401
    assert resp.json()["code"] == 401


def test_garbage_token_rejected(anon_client):
    resp = anon_client.get(
        "/api/v1/agentapp/registry/employees",
        headers={"Authorization": "Bearer not-a-token"},
    )
    assert resp.status_code == 401


def test_login_endpoint_exempt(anon_client):
    # 未带凭证也能到达登录端点——401 来自密码错误而非中间件拦截
    resp = anon_client.post(
        "/api/v1/agentapp/auth/login",
        json={"username": "admin", "password": "definitely-wrong-password"},
    )
    assert resp.status_code == 401
    assert "密码" in resp.json()["message"]


def test_healthcheck_and_metrics_exempt(anon_client):
    assert anon_client.get("/healthcheck").status_code == 200
    assert anon_client.get("/metrics").status_code == 200


def test_valid_token_passes(app_client):
    resp = app_client.get("/api/v1/agentapp/registry/employees")
    assert resp.status_code == 200


def test_viewer_read_ok_write_forbidden(monkeypatch):
    from app.main import app
    from admin.auth import issue_token
    import app.dependencies as deps

    class _FakeStore:
        def get(self, username):
            return {"username": username, "enabled": True, "role": "viewer"}

        def get_permissions(self, username):
            return ["workbench:use"]

    monkeypatch.setattr(deps, "user_store", _FakeStore())
    client = TestClient(app)
    client.headers.update({"Authorization": f"Bearer {issue_token('viewer-x', 'viewer')}"})

    # 读:任何登录用户放行
    assert client.get("/api/v1/agentapp/registry/employees").status_code == 200
    # 写员工:需要 employee:manage,viewer 只有 workbench:use → 403
    resp = client.post("/api/v1/agentapp/registry/employees", json={})
    assert resp.status_code == 403
    assert "employee:manage" in resp.json()["message"]


def test_disabled_user_rejected(monkeypatch):
    from app.main import app
    from admin.auth import issue_token
    import app.dependencies as deps

    class _FakeStore:
        def get(self, username):
            return {"username": username, "enabled": False, "role": "admin"}

        def get_permissions(self, username):
            return []

    monkeypatch.setattr(deps, "user_store", _FakeStore())
    client = TestClient(app)
    client.headers.update({"Authorization": f"Bearer {issue_token('banned', 'admin')}"})
    resp = client.get("/api/v1/agentapp/registry/employees")
    assert resp.status_code == 401
