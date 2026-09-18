"""制作项目目标与置顶状态的持久化契约测试。"""
from __future__ import annotations

import json

import pytest


@pytest.fixture
def project_env(tmp_path, monkeypatch, app_client):
    """隔离制作项目目录，避免读写真实项目数据。"""
    import app.api.production as production

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)
    return app_client, tmp_path


def test_create_project_persists_goal_and_pinned(project_env):
    client, data_dir = project_env

    response = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "第一集分镜",
            # 兼容早期前端使用的 camelCase 入参，响应与落盘统一为 snake_case。
            "productionGoal": "images",
            "pinned": True,
        },
    )

    assert response.status_code == 200
    project = response.json()["data"]
    assert project["production_goal"] == "images"
    assert project["pinned"] is True

    stored = json.loads(
        (data_dir / project["project_id"] / "project.json").read_text("utf-8"),
    )
    assert stored["production_goal"] == "images"
    assert stored["pinned"] is True

    detail = client.get(
        f"/api/v1/agentapp/production/projects/{project['project_id']}",
    ).json()["data"]
    assert detail["production_goal"] == "images"
    assert detail["pinned"] is True

    director = client.get(
        f"/api/v1/agentapp/director/projects/{project['project_id']}",
    ).json()["data"]
    assert director["project"]["production_goal"] == "images"
    assert director["project"]["pinned"] is True


def test_short_drama_goal_auto_assigns_builtin_team(project_env):
    """业务向导声明交付目标时，项目应可直接进入内置短剧流水线。"""
    client, _ = project_env
    response = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "商业短剧项目",
            "source_type": "idea",
            "source_content": "雨夜重逢",
            "productionGoal": "final",
        },
    )

    assert response.status_code == 200
    project = response.json()["data"]
    assert project["team_code"] == "comic-drama-team"
    assert project["production_goal"] == "final"

def test_create_project_rejects_blank_name_without_writing(project_env):
    """项目名只有空白时必须拒绝，且不能留下无效项目目录。"""
    client, data_dir = project_env

    response = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "  \t  "},
    )

    assert response.status_code == 400
    assert "项目名称不能为空" in response.text
    assert list(data_dir.iterdir()) == []


def test_update_project_persists_goal_and_pinned(project_env):
    client, data_dir = project_env
    created = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "待更新项目"},
    ).json()["data"]
    pid = created["project_id"]

    assert created["production_goal"] == "final"
    assert created["pinned"] is False

    response = client.put(
        f"/api/v1/agentapp/production/projects/{pid}",
        json={"production_goal": "storyboard", "pinned": True},
    )

    assert response.status_code == 200
    updated = response.json()["data"]
    assert updated["production_goal"] == "storyboard"
    assert updated["pinned"] is True

    stored = json.loads((data_dir / pid / "project.json").read_text("utf-8"))
    assert stored["production_goal"] == "storyboard"
    assert stored["pinned"] is True

    reread = client.get(
        f"/api/v1/agentapp/production/projects/{pid}",
    ).json()["data"]
    assert reread["production_goal"] == "storyboard"
    assert reread["pinned"] is True


def test_legacy_project_uses_safe_defaults(project_env):
    client, data_dir = project_env
    legacy_dir = data_dir / "legacy01"
    legacy_dir.mkdir()
    (legacy_dir / "project.json").write_text(
        json.dumps({
            "project_id": "legacy01",
            "name": "历史项目",
            "members": [{
                "user_id": "owner",
                "name": "创建者",
                "role": "owner",
            }],
        }, ensure_ascii=False),
        "utf-8",
    )

    detail_response = client.get(
        "/api/v1/agentapp/production/projects/legacy01",
    )
    assert detail_response.status_code == 200
    detail = detail_response.json()["data"]
    assert detail["production_goal"] == "final"
    assert detail["pinned"] is False

    projects = client.get(
        "/api/v1/agentapp/production/projects",
    ).json()["data"]
    legacy = next(project for project in projects if project["project_id"] == "legacy01")
    assert legacy["production_goal"] == "final"
    assert legacy["pinned"] is False

    # 读取兼容不能偷偷改写历史文件；显式更新时才持久化新增字段。
    stored = json.loads((legacy_dir / "project.json").read_text("utf-8"))
    assert "production_goal" not in stored
    assert "pinned" not in stored
