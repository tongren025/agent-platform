from copy import deepcopy
from types import SimpleNamespace

import pytest

from app.services.comic_contracts import audit_comic_spec_contract
from app.services.workflow_nodes import NodeContext, get_node_executor


def _valid_bundle() -> dict:
    return {
        "director": {
            "delivery_spec": {
                "directorial_intent": {
                    "protagonist_goal": "在警报前救出妹妹",
                    "central_obstacle": "封锁门只能从敌方控制室开启",
                    "stakes": "失败会导致妹妹被转移",
                    "audience_information_plan": ["先知道警报倒计时"],
                    "emotion_curve": ["紧张", "希望", "决断"],
                    "turning_points": ["主角发现守卫是旧友"],
                    "visual_strategy": ["由封闭近景转为出口全景"],
                }
            }
        },
        "script": {
            "target_duration_sec": 4,
            "scenes": [{
                "scene_id": "SC001",
                "entry_state": {"door": "locked"},
                "scene_goal": "取得开门权限",
                "opposition": "旧友拒绝交出密钥",
                "stakes": "倒计时结束后妹妹被转移",
                "turn": "主角放下武器换取信任",
                "exit_state": {"door": "opening"},
                "beats": [{
                    "beat_id": "B001",
                    "intent": "以放弃武力换取合作",
                    "action": "主角把武器推向旧友并后退一步",
                    "dialogue": "你来开门。",
                    "audio_note": "警报倒计时",
                    "consequence": "旧友按下开门键",
                }],
            }],
        },
        "characters": {
            "characters": [{
                "character_id": "CHAR001",
                "version": "v1",
                "story_function": "主动承担代价的主角",
                "identity_invariants": {"silhouette": "短外套与高马尾"},
                "variants": [{"variant_id": "base"}],
                "generation_description": "高马尾、短外套、左眉疤痕",
            }]
        },
        "scenes": {
            "scenes": [{
                "scene_id": "LOC001",
                "version": "v1",
                "story_usage": ["控制室谈判"],
                "layout": {"zones": ["门区", "控制台区"]},
                "materials": ["磨砂金属"],
                "palette": ["冷灰", "警报红"],
                "lighting": {"source": "顶灯"},
                "camera_positions": ["门区反打位"],
                "generation_description": "狭长金属控制室，尽头为发光控制台",
            }]
        },
        "storyboard": {
            "total_duration_sec": 4,
            "shots": [{
                "shot_id": "SH001",
                "scene_id": "SC001",
                "beat_id": "B001",
                "narrative_intent": "让放下武器成为有代价的选择",
                "information_change": "旧友确认主角愿意冒险信任他",
                "emotion_target": "紧张转为短暂希望",
                "duration_sec": 4,
                "shot_size": "中近景",
                "camera_angle": "平视",
                "composition": "武器位于两人之间的下方前景",
                "subject_action": "主角推开武器并后退一步",
                "camera_motion": "固定",
                "start_state": {"weapon": "held"},
                "end_state": {"weapon": "between characters"},
                "character_refs": ["CHAR001@v1"],
                "scene_ref": "LOC001@v1",
                "prop_refs": ["PROP_KEY"],
                "dialogue": "你来开门。",
                "audio": "警报倒计时",
                "transition": "直接切",
                "continuity_checks": ["主角始终位于画面左侧"],
                "generation_risks": [],
            }],
        },
        "action_vfx": {
            "shots": [{
                "shot_id": "SH001",
                "action": {
                    "setup": "主角握住武器",
                    "path": [{"subject": "左手", "from": "胸前", "to": "桌面"}],
                    "result": "主角后退",
                },
                "vfx_layers": [],
                "continuity_in": {"weapon": "held"},
                "continuity_out": {"weapon": "between characters"},
                "generation_risks": [],
                "split_recommendation": "none",
            }]
        },
    }


def test_complete_cross_role_sample_passes_without_model_calls():
    report = audit_comic_spec_contract(_valid_bundle())

    assert report["gate"] == "PASS"
    assert report["errors"] == []
    assert report["metrics"] == {
        "scene_count": 1,
        "beat_count": 1,
        "character_count": 1,
        "scene_asset_count": 1,
        "shot_count": 1,
        "action_shot_count": 1,
        "shot_duration_sec": 4.0,
    }


def test_cross_role_audit_routes_reference_duration_and_coverage_failures():
    bundle = deepcopy(_valid_bundle())
    shot = bundle["storyboard"]["shots"][0]
    shot["duration_sec"] = 7
    shot["character_refs"] = ["CHAR404@v1"]
    bundle["action_vfx"]["shots"] = []

    report = audit_comic_spec_contract(bundle)

    assert report["gate"] == "FAIL"
    codes = {item["code"] for item in report["errors"]}
    assert {"duration_invalid", "duration_sum_mismatch", "reference_unknown", "shot_coverage_missing"} <= codes
    owners = {item["owner_employee_key"] for item in report["errors"]}
    assert {"comic-storyboard", "comic-vfx-designer"} <= owners


@pytest.mark.asyncio
async def test_contract_audit_node_publishes_machine_readable_gate():
    executor = get_node_executor("comic-contract-audit")
    context = NodeContext(
        node=SimpleNamespace(config={"inputs": _valid_bundle()}),
        variables={},
        run=SimpleNamespace(),
        run_id="run-contract",
        workflow_key="comic-drama",
    )

    result = await executor.execute(context)

    assert result.status == "success"
    assert result.output["gate"] == "PASS"
    assert result.output["metrics"]["shot_count"] == 1
