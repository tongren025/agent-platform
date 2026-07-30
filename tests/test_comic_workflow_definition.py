"""内置漫剧生产 DAG 的结构与契约回归测试。"""
from __future__ import annotations

import json
from pathlib import Path

from app.models.workflow import WorkflowDefinition
from app.services.seed_workflows import (
    COMIC_LEGACY_WORKFLOW_KEY,
    COMIC_WORKFLOW_KEY,
    COMIC_WORKFLOW_REVISION,
    build_comic_drama_workflow,
)
from app.services.workflow_executor import validate_graph


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW_DIR = ROOT / "data" / "workflows"


def _load(name: str) -> WorkflowDefinition:
    return WorkflowDefinition.model_validate_json(
        (WORKFLOW_DIR / name).read_text(encoding="utf-8")
    )


def _nodes(workflow: WorkflowDefinition) -> dict:
    return {node.node_key: node for node in workflow.nodes}


def test_default_comic_workflow_is_valid_real_production_dag():
    workflow = _load("comic-drama.json")
    nodes = _nodes(workflow)

    assert validate_graph(workflow) is None
    assert workflow.enabled is True
    assert getattr(workflow, "builtinRevision") == COMIC_WORKFLOW_REVISION
    assert set(nodes) == {
        "start",
        "director",
        "writer",
        "char_design",
        "scene_design",
        "storyboard",
        "vfx_action",
        "spec_package",
        "spec_qa",
        "spec_gate",
        "image_prompt",
        "character_tasks",
        "scene_tasks",
        "keyframe_tasks",
        "char_art",
        "scene_art",
        "keyframe_art",
        "image_package",
        "image_qa",
        "image_gate",
        "video_prompt",
        "video_tasks",
        "video_generation",
        "video_qa",
        "video_gate",
        "end",
    }

    employee_by_node = {
        "director": "comic-director",
        "writer": "comic-screenwriter",
        "char_design": "comic-character-designer",
        "scene_design": "comic-scene-designer",
        "storyboard": "comic-storyboard",
        "vfx_action": "comic-vfx-designer",
        "spec_qa": "comic-qa-inspector",
        "image_prompt": "comic-prompt-engineer",
        "image_qa": "comic-qa-inspector",
        "video_prompt": "comic-prompt-engineer",
        "video_qa": "comic-qa-inspector",
    }
    for node_key, employee_key in employee_by_node.items():
        assert nodes[node_key].type == "agent"
        assert nodes[node_key].config["employeeKey"] == employee_key
        assert nodes[node_key].config["onError"] == "stop"

    media_employee_by_node = {
        "char_art": "comic-character-artist",
        "scene_art": "comic-scene-artist",
        "keyframe_art": "comic-keyframe-artist",
        "video_generation": "comic-video-artist",
    }
    for node_key, employee_key in media_employee_by_node.items():
        assert nodes[node_key].type == "iteration"
        assert nodes[node_key].config["employeeKey"] == employee_key
        assert nodes[node_key].config["onError"] == "stop"


def test_media_nodes_require_real_tool_calls_and_preserve_async_video_state():
    nodes = _nodes(_load("comic-drama.json"))

    image_schema = json.loads(nodes["image_prompt"].config["structuredSchemaJson"])
    image_package = image_schema["properties"]["image_prompt_package"]
    assert {
        "character_assets",
        "scene_assets",
        "keyframe_assets",
        "validation",
    } <= set(image_package["required"])

    for node_key in ("char_art", "scene_art", "keyframe_art"):
        prompt = nodes[node_key].config["userInputTemplate"]
        assert "generate_image" in prompt
        assert nodes[node_key].config["arrayTemplate"].endswith(".items}}")
        assert nodes[node_key].config["maxParallel"] == 2

    keyframe_prompt = nodes["keyframe_art"].config["userInputTemplate"]
    assert "不得设计/改写提示词" in keyframe_prompt

    video_prompt = nodes["video_generation"].config["userInputTemplate"]
    assert "generate_video" in video_prompt
    assert "check_video_generation" in video_prompt
    assert "pending" in video_prompt
    assert nodes["video_generation"].config["arrayTemplate"] == "{{video_tasks.items}}"
    assert nodes["video_generation"].config["maxParallel"] == 1


def test_qa_nodes_publish_machine_readable_gate_and_conditions_fail_closed():
    nodes = _nodes(_load("comic-drama.json"))

    for qa_key, phase in (
        ("spec_qa", "SPEC"),
        ("image_qa", "IMAGE"),
        ("video_qa", "VIDEO"),
    ):
        schema = json.loads(nodes[qa_key].config["structuredSchemaJson"])
        assert schema["properties"]["phase"]["const"] == phase
        assert schema["properties"]["gate"]["enum"] == ["PASS", "FAIL"]
        assert {"gate", "qa_report"} <= set(schema["required"])
        report_schema = schema["properties"]["qa_report"]
        assert report_schema["properties"]["verdict"]["enum"] == [
            "pass",
            "fail",
            "blocked",
        ]
        assert {"evidence", "checks", "blockers", "rework_tasks"} <= set(
            report_schema["required"]
        )

    for gate_key, qa_key in (
        ("spec_gate", "spec_qa"),
        ("image_gate", "image_qa"),
        ("video_gate", "video_qa"),
    ):
        config = nodes[gate_key].config
        assert config["elseLabel"] == "FAIL"
        assert config["cases"] == [{
            "label": "PASS",
            "var": f"{{{{{qa_key}.gate}}}}",
            "op": "eq",
            "value": "PASS",
        }]

    assert "实际调用 inspect_media" in nodes["image_qa"].config["userInputTemplate"]
    assert "inspection_type=image" in nodes["image_qa"].config["userInputTemplate"]
    assert "实际调用 inspect_media" in nodes["video_qa"].config["userInputTemplate"]
    assert "inspection_type=video" in nodes["video_qa"].config["userInputTemplate"]


def test_generation_units_are_capped_without_fixed_total_duration_prompt():
    raw = (WORKFLOW_DIR / "comic-drama.json").read_text(encoding="utf-8")
    nodes = _nodes(_load("comic-drama.json"))

    assert "整段10秒" not in raw
    assert "一条整段10秒合并提示词" not in raw
    storyboard_schema = json.loads(nodes["storyboard"].config["structuredSchemaJson"])
    shot_duration = (
        storyboard_schema["properties"]["storyboard"]["properties"]["shots"]
        ["items"]["properties"]["duration_sec"]
    )
    assert shot_duration["maximum"] == 6

    video_schema = json.loads(nodes["video_prompt"].config["structuredSchemaJson"])
    video_duration = (
        video_schema["properties"]["video_prompt_package"]["properties"]["shots"]
        ["items"]["properties"]["parameters"]["properties"]["duration"]
    )
    assert video_duration["maximum"] == 6


def test_static_workflows_match_seed_builders():
    static = _load("comic-drama.json")
    seeded = build_comic_drama_workflow()
    assert static.workflow_key == seeded.workflow_key == COMIC_WORKFLOW_KEY
    assert static.nodes == seeded.nodes
    assert static.edges == seeded.edges
    assert static.description == seeded.description

    legacy_static = _load("comic-drama-10s.json")
    legacy_seeded = build_comic_drama_workflow(
        COMIC_LEGACY_WORKFLOW_KEY,
        legacy_entry=True,
    )
    assert legacy_static.nodes == legacy_seeded.nodes
    assert legacy_static.edges == legacy_seeded.edges


def test_legacy_key_is_a_thin_alias_to_the_standard_workflow():
    workflow = _load("comic-drama-10s.json")
    nodes = _nodes(workflow)

    assert validate_graph(workflow) is None
    assert set(nodes) == {"start", "production", "end"}
    assert nodes["production"].type == "sub-workflow"
    assert nodes["production"].config["workflowKey"] == COMIC_WORKFLOW_KEY
    assert nodes["production"].config["onError"] == "stop"

    raw = (WORKFLOW_DIR / "comic-drama-10s.json").read_text(encoding="utf-8")
    assert "整段10秒" not in raw
    assert "合并提示词" not in raw
