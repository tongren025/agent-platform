"""真实项目诊断与问题驱动返工闭环。"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from app.models.production import ProductionCard, ProductionProject
from app.services.project_diagnostics import diagnose_project
from app.services.project_feedback import summarize_project_feedback
from app.services.project_optimization import build_repair_instruction


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


def test_asset_cards_do_not_create_fake_production_units():
    cards = [
        _card("setting", unit=1),
        _card("design", unit=2),
    ]

    report = diagnose_project(_project("storyboard"), cards)

    assert report["totalUnits"] == 0
    assert report["issues"][0]["code"] == "production_units_missing"
    assert not any(
        issue["code"] == "stage_missing"
        for issue in report["issues"]
    )


def test_end_frame_lock_does_not_create_a_production_unit():
    flf = _card("img_prompt", unit=6)
    flf.title = "G6末帧锁（FLF）"

    report = diagnose_project(_project("images"), [flf])

    assert report["totalUnits"] == 0
    assert report["issues"][0]["code"] == "production_units_missing"


def test_episode_script_and_subshots_share_g_level_production_units():
    script = _card("script", unit=0, metadata={"g_count": 2, "shot_count": 4})
    storyboards = [
        _card("storyboard", unit=1, metadata={"unit_number": 1, "subshot": "G1-S1"}),
        _card("storyboard", unit=2, metadata={"unit_number": 1, "subshot": "G1-S2"}),
        _card("storyboard", unit=3, metadata={"unit_number": 2, "subshot": "G2-S1"}),
        _card("storyboard", unit=4, metadata={"unit_number": 2, "subshot": "G2-S2"}),
    ]
    prompts = [
        _card("img_prompt", unit=1, metadata={"g_unit": "G1"}),
        _card("img_prompt", unit=2, metadata={"g_unit": "G2"}),
        _card("vid_prompt", unit=1, metadata={"g_unit": "G1"}),
        _card("vid_prompt", unit=2, metadata={"g_unit": "G2"}),
    ]

    report = diagnose_project(_project("final"), [script, *storyboards, *prompts])

    assert report["totalUnits"] == 2
    assert not any(
        issue["code"] == "stage_missing"
        for issue in report["issues"]
    )
    assert {
        check["key"]: (check["passedCount"], check["total"])
        for check in report["checks"]
        if check["key"] in {"script", "storyboard", "img_prompt", "vid_prompt"}
    } == {
        "script": (2, 2),
        "storyboard": (2, 2),
        "img_prompt": (2, 2),
        "vid_prompt": (2, 2),
    }
    assert sum(issue["code"] == "image_missing" for issue in report["issues"]) == 2
    assert sum(issue["code"] == "video_missing" for issue in report["issues"]) == 2


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


def test_manual_review_without_failure_reason_requires_human_confirmation():
    report = diagnose_project(
        _project("storyboard"),
        [
            _card("script", status="review"),
            _card("storyboard"),
        ],
    )

    issue = report["issues"][0]
    assert issue["code"] == "manual_review_required"
    assert issue["autoFixable"] is False
    assert issue["action"]["kind"] == "review_card"
    assert issue["action"]["label"] == "打开内容并确认"


def test_weighted_score_keeps_missing_final_visible_in_large_project():
    cards = []
    for unit in range(1, 101):
        cards.extend([
            _card("script", unit=unit),
            _card("storyboard", unit=unit),
            _card("img_prompt", unit=unit, images=[f"/frame-{unit}.png"]),
            _card("vid_prompt", unit=unit, videos=[f"/video-{unit}.mp4"]),
        ])

    report = diagnose_project(_project("final"), cards)

    assert report["score"] == 90
    assert report["issues"][0]["code"] == "final_missing"
    delivery = next(
        item for item in report["scoreBreakdown"]
        if item["key"] == "delivery"
    )
    assert delivery == {
        "key": "delivery",
        "label": "交付成片",
        "score": 0.0,
        "weight": 10,
    }


def test_repair_instruction_uses_gate_code_and_acceptance_criteria():
    report = diagnose_project(
        _project("storyboard"),
        [
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
        ],
    )

    instruction = build_repair_instruction(
        report["issues"][0],
        "保留雨夜蓝色主光",
    )

    assert "逐项补齐门禁指出的生产字段" in instruction
    assert "画面内容、角色动作、景别运镜" in instruction
    assert "用户补充要求：保留雨夜蓝色主光" in instruction
    assert "只输出当前阶段要求的最终结构化结果" in instruction


def test_feedback_summary_prioritizes_high_frequency_automatic_problem():
    projects = [
        {
            "projectId": "a",
            "name": "项目 A",
            "diagnostics": {
                "score": 30,
                "blockerCount": 3,
                "issues": [
                    {
                        "code": "stage_missing",
                        "stage": "script",
                        "autoFixable": True,
                    },
                    {
                        "code": "stage_missing",
                        "stage": "img_prompt",
                        "autoFixable": True,
                    },
                    {
                        "code": "video_missing",
                        "stage": "video",
                        "autoFixable": False,
                    },
                ],
            },
        },
        {
            "projectId": "b",
            "name": "项目 B",
            "diagnostics": {
                "score": 80,
                "blockerCount": 1,
                "issues": [
                    {
                        "code": "video_missing",
                        "stage": "video",
                        "autoFixable": False,
                    },
                ],
            },
        },
    ]
    runs = [
        {"status": "resolved", "beforeScore": 30, "afterScore": 45},
        {"status": "failed", "beforeScore": 45, "afterScore": 45},
    ]

    feedback = summarize_project_feedback(projects, runs)

    assert feedback["projectCount"] == 2
    assert feedback["issueCount"] == 4
    assert feedback["recommendedIssueCode"] == "stage_missing"
    assert next(
        item["projectIds"]
        for item in feedback["topIssues"]
        if item["code"] == "stage_missing"
    ) == ["a"]
    assert next(
        item["projectIds"]
        for item in feedback["topIssues"]
        if item["code"] == "video_missing"
    ) == ["a", "b"]
    assert feedback["optimization"]["successRate"] == 50
    assert feedback["optimization"]["averageScoreGain"] == 15.0


def test_feedback_recommendation_respects_stage_dependencies_before_frequency():
    feedback = summarize_project_feedback(
        [
            {
                "projectId": "dependency-order",
                "name": "依赖顺序项目",
                "diagnostics": {
                    "score": 20,
                    "blockerCount": 6,
                    "issues": [
                        {
                            "code": "video_missing",
                            "stage": "video",
                            "autoFixable": False,
                        },
                        {
                            "code": "video_missing",
                            "stage": "video",
                            "autoFixable": False,
                        },
                        {
                            "code": "video_missing",
                            "stage": "video",
                            "autoFixable": False,
                        },
                        {
                            "code": "image_missing",
                            "stage": "image",
                            "autoFixable": False,
                        },
                        {
                            "code": "image_missing",
                            "stage": "image",
                            "autoFixable": False,
                        },
                        {
                            "code": "manual_review_required",
                            "stage": "script",
                            "autoFixable": False,
                        },
                    ],
                },
            },
        ],
        [],
    )

    assert feedback["topIssues"][0]["code"] == "video_missing"
    assert feedback["recommendedIssueCode"] == "manual_review_required"
    assert feedback["nextActions"] == [
        "先人工确认内容；没有失败原因时不要自动重写。"
    ]


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


def test_feedback_endpoint_uses_json_projects_without_database(optimization_env):
    client, _ = optimization_env
    client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "反馈统计项目",
            "source_type": "gc",
            "source_content": "少年在雨夜推开电影院的门",
            "production_goal": "images",
        },
    )

    response = client.get("/api/v1/agentapp/director/feedback")

    assert response.status_code == 200
    feedback = response.json()["data"]
    assert feedback["projectCount"] == 1
    assert feedback["issueCount"] == 1
    assert feedback["recommendedIssueCode"] == "production_units_missing"
    assert feedback["optimization"]["successRate"] is None


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
    assert diagnostics["score"] == 60
    assert diagnostics["issues"][0]["code"] == "image_missing"
    assert diagnostics["issues"][0]["autoFixable"] is False
    assert diagnostics["nextAction"]["kind"] == "open_media"
    history = client.get(
        f"/api/v1/agentapp/director/projects/{pid}/optimization-runs"
    ).json()["data"]
    assert len(history) == 3
    assert all(run["status"] == "resolved" for run in history)
