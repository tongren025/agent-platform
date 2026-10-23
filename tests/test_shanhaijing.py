"""
山海经专栏与角色图鉴 API 测试。
"""

import pytest


@pytest.fixture
def client(app_client, tmp_path, monkeypatch):
    # 使用真实鉴权，并把角色读写隔离到临时目录。
    from app.api import shanhaijing

    monkeypatch.setattr(shanhaijing, "CHARACTERS_FILE", tmp_path / "characters.json")
    monkeypatch.setattr(shanhaijing, "CACHE_DIR", tmp_path / "cache")
    return app_client


def test_shanhaijing_categories(client):
    """测试分类与山系统计接口。"""
    res = client.get("/api/v1/agentapp/shanhaijing/categories")
    assert res.status_code == 200
    if res.status_code == 200:
        data = res.json()["data"]
        assert "categories" in data
        assert "stats" in data
        assert data["stats"]["total_characters"] >= 12


def test_shanhaijing_characters_list(client):
    """测试角色列表与筛选。"""
    res = client.get("/api/v1/agentapp/shanhaijing/characters")
    assert res.status_code == 200
    if res.status_code == 200:
        chars = res.json()["data"]
        assert len(chars) >= 12
        assert any(c["name"] == "九尾狐" for c in chars)
        assert any(c["name"] == "烛龙" for c in chars)
