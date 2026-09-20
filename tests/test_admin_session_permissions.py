"""管理端权限与账号状态必须在每次请求时生效，不能信任旧 token 角色。"""
from __future__ import annotations

import json
import time

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient


@pytest.fixture
def account(monkeypatch):
    import app.dependencies as dependencies
    from admin.api import auth_api
    from app.api import user_auth

    class Store:
        user = {"username": "test-admin", "role": "admin", "enabled": True}
        permissions = ["system:admin"]

        def get(self, username):
            return self.user if self.user and username == self.user["username"] else None

        def get_permissions(self, username):
            return list(self.permissions)

    store = Store()
    monkeypatch.setattr(dependencies, "user_store", store)
    monkeypatch.setattr(auth_api, "user_store", store)
    monkeypatch.setattr(user_auth, "user_store", store)
    return store


def headers(role="admin"):
    from admin.auth import issue_token
    return {"Authorization": f"Bearer {issue_token('test-admin', role)}"}


@pytest.mark.parametrize("state", ["disabled", "deleted"])
def test_existing_admin_token_stops_working_after_account_revocation(account, state):
    from admin.main import app
    client = TestClient(app)
    auth = headers()
    assert client.get("/api/admin/roles", headers=auth).status_code == 200
    if state == "disabled":
        account.user["enabled"] = False
    else:
        account.user = None
    assert client.get("/api/admin/roles", headers=auth).status_code == 401
    assert client.get("/api/admin/auth/me", headers=auth).status_code == 401


def test_admin_token_cannot_keep_revoked_permission(account):
    from admin.main import app
    client = TestClient(app)
    auth = headers()
    account.permissions = []
    assert client.get("/api/admin/roles", headers=auth).status_code == 403


def test_current_custom_admin_permission_is_respected(account):
    from admin.main import app
    account.user["role"] = "operator"
    assert TestClient(app).get("/api/admin/roles", headers=headers("viewer")).status_code == 200


def test_check_returns_current_role_instead_of_token_snapshot(account):
    from app.main import app
    from admin.auth import issue_token
    token = issue_token("test-admin", "admin")
    account.user["role"] = "viewer"
    account.permissions = ["workbench:use"]
    response = TestClient(app).get("/api/v1/agentapp/auth/check", params={"token": token})
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "viewer"


@pytest.mark.parametrize("payload", [
    [], None, {"sub": "test-admin", "exp": "tomorrow"},
    {"sub": "test-admin", "exp": float("nan")},
    {"sub": "test-admin", "exp": True},
    {"sub": "test-admin", "exp": 10 ** 1000},
    {"exp": 9999999999}, {"sub": ["test-admin"], "exp": 9999999999},
])
def test_signed_malformed_claims_return_401(payload):
    from admin.auth import _b64encode, _sign, parse_token
    raw = json.dumps(payload).encode()
    token = f"{_b64encode(raw)}.{_sign(raw)}"
    with pytest.raises(HTTPException) as error:
        parse_token(token)
    assert error.value.status_code == 401


def test_expiration_boundary_is_rejected(monkeypatch):
    import admin.auth as auth
    now = int(time.time())
    raw = json.dumps({"sub": "test-admin", "exp": now}).encode()
    monkeypatch.setattr(auth.time, "time", lambda: now)
    with pytest.raises(HTTPException) as error:
        auth.parse_token(f"{auth._b64encode(raw)}.{auth._sign(raw)}")
    assert error.value.status_code == 401


@pytest.mark.parametrize("raw", [b"not-json", b"\xff", b"[" * 10000 + b"]" * 10000])
def test_signed_nonstandard_payload_returns_401(raw):
    from admin.auth import _b64encode, _sign, parse_token
    with pytest.raises(HTTPException) as error:
        parse_token(f"{_b64encode(raw)}.{_sign(raw)}")
    assert error.value.status_code == 401


@pytest.mark.parametrize("service, endpoint", [
    ("user", "/api/v1/agentapp/registry/employees"),
    ("user", "/api/v1/agentapp/auth/me"),
    ("admin", "/api/admin/roles"),
])
def test_oversized_expiration_returns_401_through_api(service, endpoint):
    from admin.auth import _b64encode, _sign
    from admin.main import app as admin_app
    from app.main import app as user_app
    raw = json.dumps({"sub": "test-admin", "exp": 10 ** 1000}).encode()
    token = f"{_b64encode(raw)}.{_sign(raw)}"
    client = TestClient(admin_app if service == "admin" else user_app, raise_server_exceptions=False)
    response = client.get(endpoint, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_non_ascii_signature_returns_401_through_legacy_check():
    from admin.auth import _b64encode
    from app.main import app
    raw = json.dumps({"sub": "test-admin", "exp": 9999999999}).encode()
    response = TestClient(app, raise_server_exceptions=False).get(
        "/api/v1/agentapp/auth/check", params={"token": f"{_b64encode(raw)}.非法签名"},
    )
    assert response.status_code == 401


@pytest.mark.parametrize("secret, valid", [
    ("dev-only-secret-change-in-production", False),
    ("test-only-production-secret-37f846da25", True),
])
def test_production_rejects_known_development_secret(monkeypatch, secret, valid):
    import runpy
    from pathlib import Path
    import dotenv
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *args, **kwargs: False)
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_PASSWORD", "test-only-admin-password")
    monkeypatch.setenv("ADMIN_SECRET", secret)
    config_path = Path(__file__).resolve().parents[1] / "admin" / "config.py"
    if valid:
        assert runpy.run_path(str(config_path))["ADMIN_SECRET"] == secret
    else:
        with pytest.raises(RuntimeError, match="ADMIN_SECRET"):
            runpy.run_path(str(config_path))
