"""制作项目成员隔离：全局角色权限不能替代项目级访问控制。"""
from __future__ import annotations

from fastapi.testclient import TestClient


class _ProjectUserStore:
    """只提供鉴权中间件所需的最小用户/权限接口。"""

    def get(self, username: str):
        if username not in {"alice", "bob", "admin"}:
            return None
        return {"username": username, "enabled": True, "role": "editor"}

    def get_permissions(self, username: str):
        return ["production:manage", "workbench:use"]


def _headers(username: str) -> dict[str, str]:
    from admin.auth import issue_token

    return {"Authorization": f"Bearer {issue_token(username, 'editor')}"}


def test_non_member_cannot_see_or_modify_project(tmp_path, monkeypatch):
    import app.api.production as production
    import app.dependencies as dependencies
    from app.main import app

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)
    monkeypatch.setattr(dependencies, "user_store", _ProjectUserStore())
    client = TestClient(app)

    created = client.post(
        "/api/v1/agentapp/production/projects",
        headers=_headers("alice"),
        json={"name": "Alice 私有项目"},
    )
    assert created.status_code == 200
    project_id = created.json()["data"]["project_id"]

    bob_list = client.get(
        "/api/v1/agentapp/production/projects",
        headers=_headers("bob"),
    )
    assert bob_list.status_code == 200
    assert bob_list.json()["data"] == []
    assert client.get(
        f"/api/v1/agentapp/production/projects/{project_id}",
        headers=_headers("bob"),
    ).status_code == 403
    assert client.put(
        f"/api/v1/agentapp/production/projects/{project_id}",
        headers=_headers("bob"),
        json={"description": "越权修改"},
    ).status_code == 403
    matrix = client.get(
        "/api/v1/agentapp/production/matrix",
        headers=_headers("bob"),
    )
    assert matrix.status_code == 200
    assert matrix.json()["data"]["projects"] == []
    assert client.get(
        f"/api/v1/agentapp/director/projects/{project_id}",
        headers=_headers("bob"),
    ).status_code == 403
    assert client.get(
        f"/api/v1/agentapp/director/projects/{project_id}/diagnostics",
        headers=_headers("bob"),
    ).status_code == 403

    added = client.post(
        f"/api/v1/agentapp/production/projects/{project_id}/members",
        headers=_headers("alice"),
        json={"user_id": "bob", "name": "Bob", "role": "editor"},
    )
    assert added.status_code == 200

    bob_list = client.get(
        "/api/v1/agentapp/production/projects",
        headers=_headers("bob"),
    )
    assert [item["project_id"] for item in bob_list.json()["data"]] == [project_id]
    assert client.get(
        f"/api/v1/agentapp/production/projects/{project_id}",
        headers=_headers("bob"),
    ).status_code == 200
