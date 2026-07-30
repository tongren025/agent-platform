"""真实项目诊断与问题驱动返工闭环。"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from app.models.production import ProductionCard, ProductionProject
from app.services.project_diagnostics import diagnose_project


def _project(goal: str = "final", source: str = "一个少年在雨夜推开旧电影院的门") -> ProductionProject:
    return ProductionProject(
        project_id="diagnostic-demo",
        name="诊断测试片",
        source_type="gc",
        source_content=source,
        production_goal=goal,
    )


def _card(
    stage: str,
    *,
    unit: int = 1,
    status: str = "done",
    metadata: dict | None = None,
    images: list[str] | None = None,
    videos: list[str] | None = None,
) -> ProductionCard:
    return ProductionCard(
        card_id=f"{stage}-{unit}",
        project_id="diagnostic-demo",
        stage=stage,
        title=f"G{unit} {stage}",
        content=f"{stage} content",
        episode=None,
        shot_number=unit,
        status=status,
        metadata=metadata or {},
        images=images or [],
        videos=videos or [],
    )


def test_project_without_units_starts_from_structured_script():
    report = diagnose_project(_project("storyboard"), [])

    assert report["state"] == "blocked"
    assert report["issues"][0]["code"] == "production_units_missing"
    assert report["issues"][0]["autoFixable"] is True
    assert report["nextAction"]["targetStage"] == "script"
    assert report["nextAction"]["shotNumber"] is None


def test_goal_scope_does_not_report_unrequested_video_work():
    cards = [
        _card("script"),
        _card("storyboard"),
        _card("img_prompt", images=["/frame.png"]),
    ]

    report = diagnose_project(_project("images"), cards)

    assert report["state"] == "complete"
    assert report["score"] == 100
    assert not {"video_missing", "final_missing"} & {
        issue["code"] for issue in report["issues"]
    }


def test_quality_failure_becomes_first_action_before_expensive_media():
    cards = [
        _card("script"),
        _card(
            "storyboard",
            status="review",
            metadata={
                "quality_gate": {
                    "passed": False,
                    "issues": [
                        {
                            "code": "storyboard_fields_missing",
                            "message": "缺少起始姿态和结束姿态",
                        },
                    ],
                },
            },
        ),
        _card("img_prompt"),
        _card("vid_prompt"),
    ]

    report = diagnose_project(_project("final"), cards)

    first = report["issues"][0]
    assert first["code"] == "quality_gate_failed"
    assert first["stage"] == "storyboard"
    assert first["action"]["kind"] == "generate_stage"
    assert first["action"]["mode"] == "replace"
    assert first["details"] == ["缺少起始姿态和结束姿态"]


def test_latest_card_wins_over_old_failed_version():
    old = _card(
        "storyboard",
        status="review",
        metadata={
            "quality_gate": {
                "passed": False,
                "issues": [{"code": "old", "message": "旧版本问题"}],
            },
        },
    )
    old.card_id = "old-storyboard"
    latest = _card(
        "storyboard",
        metadata={"quality_gate": {"passed": True, "issues": []}},
    )
    latest.card_id = "latest-storyboard"
    report = diagnose_project(
        _project("storyboard"),
        [_card("script"), old, latest],
    )

    assert report["state"] == "complete"
    assert report["issues"] == []


def test_aggregate_gc_uses_prompt_order_instead_of_reporting_no_units():
    cards = [
        ProductionCard(
            card_id="aggregate-script",
            project_id="diagnostic-demo",
            stage="script",
            title="GC 高光剧本",
            content="完整剧本",
            status="done",
            metadata={"shot_count": 3},
        ),
        ProductionCard(
            card_id="aggregate-storyboard",
            project_id="diagnostic-demo",
            stage="storyboard",
            title="GC 故事板",
            content="完整故事板",
            status="done",
            metadata={"shot_count": 3},
        ),
        ProductionCard(
            card_id="aggregate-image",
            project_id="diagnostic-demo",
            stage="img_prompt",
            title="GC 图片提示",
            content="三张图片提示",
            images=["/1.png", "/2.png", "/3.png"],
            status="done",
            metadata={"prompt_order": ["W01", "W02", "W03"]},
        ),
        ProductionCard(
            card_id="aggregate-video",
            project_id="diagnostic-demo",
            stage="vid_prompt",
            title="GC 视频提示",
            content="三条视频提示",
            status="done",
            metadata={"prompt_order": ["W01", "W02", "W03"]},
        ),
    ]

    report = diagnose_project(_project("final"), cards)

    assert report["totalUnits"] == 3
    assert "production_units_missing" not in {
        issue["code"] for issue in report["issues"]
    }
    assert report["issues"][0]["code"] == "video_missing"
    assert report["issues"][0]["message"] == "聚合项目还差 3 个镜头视频。"


@pytest.fixture()
def optimization_env(tmp_path, monkeypatch, app_client):
    """隔离真实项目文件，并把 LLM 调用替换成可重复的合格回复。"""
    import app.api.production as production

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)

    async def fake_invocation(_req):
        return SimpleNamespace(
            success=True,
            assistant_message=(
                "G1 可生产内容 [00:00-00:06]\n"
                "前景：旧门框；中景：少年位于画面左侧；背景：雨夜街道。"
                "画面位置：左侧；起始姿态：右手垂下；结束姿态：右手推门；"
                "视线方向：门内。角色缓慢推门，暖光照亮面部。"
            ),
            error_message=None,
        )

    monkeypatch.setattr(production, "run_invocation", fake_invocation)
    return app_client, tmp_path


def test_optimize_endpoint_repairs_one_issue_and_records_before_after(optimization_env):
    client, production_dir = optimization_env
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "真实闭环测试",
            "source_type": "gc",
            "source_content": "一个少年在雨夜推开旧电影院的门",
            "production_goal": "storyboard",
        },
    ).json()["data"]
    pid = project["project_id"]
    bad = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": "script",
            "title": "G1 旧剧本",
            "content": "内容不完整",
            "episode": None,
            "shot_number": 1,
            "status": "review",
            "metadata": {
                "quality_gate": {
                    "passed": False,
                    "issues": [{"code": "structure", "message": "缺少可生产动作"}],
                },
            },
        },
    )
    assert bad.status_code == 200

    diagnostics = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/diagnostics"
    ).json()["data"]
    issue = next(
        item for item in diagnostics["issues"]
        if item["code"] == "quality_gate_failed"
    )

    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/optimize",
        json={"issue_id": issue["id"]},
    )

    assert response.status_code == 200, response.text
    result = response.json()["data"]
    assert result["status"] == "success"
    assert result["resolved"] is True
    assert result["afterScore"] > result["beforeScore"]
    assert result["generation"]["replaced"] == 1

    history = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/optimization-runs"
    ).json()["data"]
    assert history[0]["runId"] == result["runId"]
    assert history[0]["status"] == "resolved"
    saved = json.loads(
        (production_dir / pid / "optimization-runs.json").read_text("utf-8")
    )
    assert saved[-1]["afterScore"] == result["afterScore"]


def test_non_automatic_media_issue_is_rejected_without_mutation(optimization_env):
    client, _ = optimization_env
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "媒体问题测试",
            "source_type": "gc",
            "source_content": "一个少年在雨夜推开旧电影院的门",
            "production_goal": "images",
        },
    ).json()["data"]
    pid = project["project_id"]
    for stage in ("script", "storyboard", "img_prompt"):
        response = client.post(
            f"/api/v1/agentapp/production/projects/{pid}/cards",
            json={
                "stage": stage,
                "title": f"G1 {stage}",
                "content": f"{stage} content",
                "episode": None,
                "shot_number": 1,
                "status": "done",
            },
        )
        assert response.status_code == 200

    diagnostics = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/diagnostics"
    ).json()["data"]
    issue = next(item for item in diagnostics["issues"] if item["code"] == "image_missing")
    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/optimize",
        json={"issue_id": issue["id"]},
    )

    assert response.status_code == 409
    assert "选择模型" in response.json()["message"]


def test_real_project_dry_run_reaches_external_media_boundary(optimization_env):
    """从创意连续修复到生图边界，证明诊断结果能驱动下一次真实动作。"""
    client, _ = optimization_env
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "雨夜电影院",
            "source_type": "gc",
            "source_content": "一个少年在雨夜推开废弃电影院的门，银幕里有人回头。",
            "production_goal": "images",
        },
    ).json()["data"]
    pid = project["project_id"]

    repaired_codes = []
    for _ in range(3):
        diagnostics = client.get(
            f"/api/v1/agentapp/director/projects/{pid}/diagnostics"
        ).json()["data"]
        issue = diagnostics["issues"][0]
        assert issue["autoFixable"] is True
        repaired_codes.append(issue["code"])
        result = client.post(
            f"/api/v1/agentapp/director/projects/{pid}/optimize",
            json={"issue_id": issue["id"]},
        )
        assert result.status_code == 200, result.text
        assert result.json()["data"]["resolved"] is True

    diagnostics = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/diagnostics"
    ).json()["data"]
    assert repaired_codes == [
        "production_units_missing",
        "stage_missing",
        "stage_missing",
    ]
    assert diagnostics["score"] == 80
    assert diagnostics["issues"][0]["code"] == "image_missing"
    assert diagnostics["issues"][0]["autoFixable"] is False
    assert diagnostics["nextAction"]["kind"] == "open_media"
    history = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/optimization-runs"
    ).json()["data"]
    assert len(history) == 3
    assert all(run["status"] == "resolved" for run in history)
