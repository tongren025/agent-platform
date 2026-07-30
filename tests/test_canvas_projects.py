import json

from app.services.canvas_projects import build_workbench_record, read_or_import_project


def _card(card_id: str, episode: int | None, shot_number: int, stage: str, title: str) -> dict:
    return {
        "card_id": card_id,
        "episode": episode,
        "shot_number": shot_number,
        "stage": stage,
        "title": title,
        "content": title,
        "created_at": "2026-07-30T10:00:00Z",
        "updated_at": "2026-07-30T10:00:00Z",
    }


def test_production_import_builds_episode_shot_groups_and_local_layout():
    project = {
        "project_id": "season-demo",
        "name": "第一季",
        "created_at": "2026-07-30T10:00:00Z",
        "updated_at": "2026-07-30T10:00:00Z",
    }
    cards = [
        _card("global-style", None, 0, "design", "视觉母版"),
        _card("ep1-script", 1, 0, "script", "第一集剧本"),
        _card("ep1-g1-board", 1, 1, "storyboard", "G1 分镜"),
        _card("ep1-g1-video", 1, 1, "vid_prompt", "G1 视频"),
        _card("ep1-g2-board", 1, 2, "storyboard", "G2 分镜"),
    ]

    record = build_workbench_record(project, cards)
    canvas = record["payload"]["generationCanvas"]
    groups = canvas["groups"]
    group_names = [group["name"] for group in groups]

    assert "全局资产" in group_names
    assert "EP01 · 本集资料" in group_names
    assert group_names.count("EP01 · G1") == 1
    assert "EP01 · G2" in group_names
    g1_nodes = [
        node
        for node in canvas["nodes"]
        if node["meta"]["episode"] == 1 and node["meta"]["shotNumber"] == 1
    ]
    assert len({node["groupId"] for node in g1_nodes}) == 1
    assert len({node["position"]["y"] for node in g1_nodes}) == 1


def test_existing_canvas_is_upgraded_without_overwriting_user_group(tmp_path):
    workbench_dir = tmp_path / "workbench"
    production_dir = tmp_path / "production"
    project_root = production_dir / "season-demo"
    workbench_dir.mkdir(parents=True)
    project_root.mkdir(parents=True)
    project = {
        "project_id": "season-demo",
        "name": "第一季",
        "created_at": "2026-07-30T10:00:00Z",
        "updated_at": "2026-07-30T10:00:00Z",
    }
    cards = [
        _card("ep1-g1-board", 1, 1, "storyboard", "G1 分镜"),
        _card("ep1-g2-board", 1, 2, "storyboard", "G2 分镜"),
    ]
    (project_root / "project.json").write_text(json.dumps(project), "utf-8")
    (project_root / "cards.json").write_text(json.dumps(cards), "utf-8")
    record = build_workbench_record(project, cards)
    canvas = record["payload"]["generationCanvas"]
    canvas["groups"] = [{
        "id": "user-group",
        "name": "我自己的组",
        "categoryId": "shots",
        "nodeIds": ["production-ep1-g1-board"],
        "createdAt": 1,
        "updatedAt": 1,
    }]
    canvas["nodes"][0]["groupId"] = "user-group"
    canvas["nodes"][0]["title"] = "用户改过的标题"
    (workbench_dir / "season-demo.json").write_text(
        json.dumps(record, ensure_ascii=False),
        "utf-8",
    )

    upgraded = read_or_import_project("season-demo", workbench_dir, production_dir)
    assert upgraded is not None
    upgraded_canvas = upgraded["payload"]["generationCanvas"]
    assert upgraded_canvas["nodes"][0]["title"] == "用户改过的标题"
    assert upgraded_canvas["nodes"][0]["groupId"] == "user-group"
    assert any(group["id"] == "user-group" for group in upgraded_canvas["groups"])
    assert any(
        group["name"] == "EP01 · G2"
        for group in upgraded_canvas["groups"]
    )
