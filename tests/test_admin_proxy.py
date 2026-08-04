"""生产构建下管理控制台必须能通过用户端同源路径访问独立 admin 服务。"""
from __future__ import annotations

import json

import httpx


def test_admin_api_is_proxied_without_user_token(app_client, monkeypatch):
    calls: list[dict] = []

    class FakeResponse:
        status_code = 200
        content = json.dumps({"code": 200, "data": {"token": "qa-token"}}).encode()
        headers = {"content-type": "application/json", "content-length": "1"}

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def request(self, method, url, **kwargs):
            calls.append({"method": method, "url": url, **kwargs})
            return FakeResponse()

    monkeypatch.setattr(httpx, "AsyncClient", FakeClient)

    response = app_client.post(
        "/api/admin/auth/login",
        json={"username": "admin", "password": "admin123"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["token"] == "qa-token"
    assert calls[0]["method"] == "POST"
    assert calls[0]["url"].endswith("/api/admin/auth/login")
    assert b'"username":"admin"' in calls[0]["content"]
