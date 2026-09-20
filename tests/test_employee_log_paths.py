"""记忆与进化只读日志查询不建目录，非法员工 key 在 API 层返回 400。"""
from __future__ import annotations

import pytest


def test_reading_missing_logs_has_no_filesystem_side_effect(tmp_path, monkeypatch):
    from app.services import distillation, evolution
    monkeypatch.setattr(distillation, "BASE_DIR", tmp_path)
    monkeypatch.setattr(evolution, "BASE_DIR", tmp_path)
    assert distillation.list_distillation_logs("missing-employee") == []
    assert distillation.last_run_at("missing-employee") is None
    assert evolution.list_insights("missing-employee") == []
    assert evolution.list_run_logs("missing-employee") == []
    assert evolution.last_run_at("missing-employee") is None
    assert not (tmp_path / "data").exists()


@pytest.mark.parametrize("key", ["..", "../outside", "a..b", r"..\outside"])
def test_log_paths_reject_traversal(key):
    from app.services import distillation, evolution
    for function in (distillation._log_path, evolution._data_dir):
        with pytest.raises(ValueError):
            function(key)


@pytest.mark.parametrize("suffix", [
    "evolution/insights/a..b", "evolution/run-logs/a..b",
    "memory/distillation-logs/a..b", "memory/semantic/a..b", "memory/stats/a..b",
])
def test_invalid_employee_path_returns_400(app_client, suffix):
    response = app_client.get(f"/api/v1/agentapp/{suffix}")
    assert response.status_code == 400
    assert response.json()["code"] == 400


def test_evolution_overview_does_not_require_employee_query(app_client):
    response = app_client.get("/api/v1/agentapp/evolution/overview")
    assert response.status_code == 200


def test_log_write_still_creates_parent_directory(tmp_path, monkeypatch):
    from app.services import distillation, evolution
    monkeypatch.setattr(distillation, "BASE_DIR", tmp_path)
    monkeypatch.setattr(evolution, "BASE_DIR", tmp_path)
    distillation._save_logs("writer", [])
    evolution._save_run_logs("writer", [])
    assert (tmp_path / "data/memory/writer/distillation_logs.json").read_text() == "[]"
    assert (tmp_path / "data/evolution/writer/run_logs.json").read_text() == "[]"
