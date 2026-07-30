import json
from types import SimpleNamespace

import pytest

from app.api import canvas
from app.services import canvas_prompts


def test_builtin_canvas_prompt_catalog_is_professional_and_non_empty():
    rows = canvas_prompts.list_prompt_catalog()

    assert len(rows) >= 5
    assert {row["id"] for row in rows} >= {
        "canvas-character-identity-board",
        "canvas-scene-design-board",
        "canvas-image-storyboard-shot",
        "canvas-video-storyboard-shot",
    }
    character = next(row for row in rows if row["id"] == "canvas-character-identity-board")
    assert "身份锁定" in character["prompt"]
    assert "三视图" in character["prompt"]
    assert all(row["prompt"].strip() for row in rows)
    assert all("Nomi" not in row["source"] for row in rows)


def test_storyboard_agent_response_becomes_real_tool_call():
    raw = json.dumps({
        "assistantMessage": "已经拆成两镜。",
        "toolCalls": [{
            "toolName": "propose_storyboard_plan",
            "args": {
                "title": "门外来客",
                "anchors": [{
                    "id": "anchor-1",
                    "kind": "character",
                    "name": "林夏",
                    "description": "短发，深色外套",
                    "carrier": "visual",
                }],
                "shots": [
                    {
                        "index": 8,
                        "shotKind": "image",
                        "durationSec": 7,
                        "anchorIds": ["anchor-1", "missing"],
                        "prompt": "中景，林夏停在门前，手悬在门把上。",
                    },
                    {
                        "index": 9,
                        "shotKind": "video",
                        "durationSec": 5,
                        "anchorIds": ["anchor-1"],
                        "prompt": "镜头缓慢推近，林夏转头看向走廊尽头。",
                    },
                ],
            },
        }],
    }, ensure_ascii=False)

    parsed = canvas_prompts.parse_agent_response("workbench.storyboard.planner", raw)

    call = parsed["toolCalls"][0]
    assert call["toolName"] == "propose_storyboard_plan"
    assert [shot["index"] for shot in call["args"]["shots"]] == [1, 2]
    assert call["args"]["shots"][0]["durationSec"] == 0
    assert call["args"]["shots"][0]["anchorIds"] == ["anchor-1"]


def test_fixation_agent_rejects_empty_prompt():
    raw = json.dumps({
        "assistantMessage": "完成",
        "toolCalls": [{
            "toolName": "create_canvas_nodes",
            "args": {
                "nodes": [{"clientId": "c1", "kind": "character", "title": "林夏", "prompt": ""}],
            },
        }],
    }, ensure_ascii=False)

    with pytest.raises(ValueError, match="提示词不能为空"):
        canvas_prompts.parse_agent_response("workbench.fixation.planner", raw)


def test_accepted_canvas_prompt_enters_existing_memory_chain(tmp_path, monkeypatch):
    monkeypatch.setattr(canvas_prompts, "LEARNING_PATH", tmp_path / "prompt-learning.json")
    from app import dependencies

    procedural = []
    episodic = []
    monkeypatch.setattr(
        dependencies.employee_registry,
        "get",
        lambda key: SimpleNamespace(employee_key=key) if key == "artist" else None,
    )
    monkeypatch.setattr(dependencies.long_term_memory, "add_procedural", lambda key, item: procedural.append(item))
    monkeypatch.setattr(dependencies.long_term_memory, "add_episodic", lambda key, item: episodic.append(item))

    result = canvas_prompts.record_accepted_prompts(
        project_id="story-1",
        employee_key="artist",
        items=[{
            "kind": "character",
            "title": "林夏身份板",
            "prompt": "三视图、表情研究、服装变体、七重身份锁定。",
        }],
    )

    assert result == {"acceptedCount": 1, "memoryCount": 2}
    assert procedural[0].confidence == 0.8
    assert episodic[0].success_score == 1.0
    overview = canvas_prompts.prompt_learning_overview()
    assert overview["stats"]["acceptedCount"] == 1
    assert overview["records"][0]["employeeKey"] == "artist"


@pytest.mark.asyncio
async def test_web_canvas_agent_restores_storyboard_tool_event(monkeypatch):
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "find_canvas_model",
        lambda vendor, model, kind: {"vendorKey": vendor, "modelKey": model, "kind": kind},
    )
    monkeypatch.setattr(canvas, "_format_workbench_model_catalog", lambda: "image: demo:image")

    async def fake_run(_request):
        return SimpleNamespace(
            success=True,
            assistant_message=json.dumps({
                "assistantMessage": "方案已生成。",
                "toolCalls": [{
                    "toolName": "propose_storyboard_plan",
                    "args": {
                        "title": "测试方案",
                        "anchors": [],
                        "shots": [{
                            "index": 1,
                            "shotKind": "image",
                            "durationSec": 0,
                            "anchorIds": [],
                            "prompt": "远景，人物走入空旷站台。",
                        }],
                    },
                }],
            }, ensure_ascii=False),
            session_id="ses_canvas",
            token_usage=None,
        )

    monkeypatch.setattr(canvas, "run_invocation", fake_run)

    result = await canvas.run_workbench_agent(canvas.WorkbenchAgentReq(
        vendor="platform-employee",
        modelKey="storyboard-worker",
        skillKey="workbench.storyboard.planner",
        prompt="把这个故事拆成图片分镜",
    ))

    assert result["data"]["toolCalls"][0]["toolName"] == "propose_storyboard_plan"
    assert result["data"]["toolCalls"][0]["args"]["shots"][0]["prompt"]


def test_partial_assistant_message_can_stream_before_json_is_closed():
    partial = (
        '{"assistantMessage":"正在拆分第一幕\\n已识别主角",'
        '"toolCalls":[{"toolName":"propose_storyboard_plan","args":'
    )

    assert canvas._partial_json_string(
        partial,
        "assistantMessage",
    ) == "正在拆分第一幕\n已识别主角"
