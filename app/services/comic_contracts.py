"""漫剧规格包的确定性跨岗位合同审计。

本模块只做纯计算，不调用模型、不读写磁盘。它在昂贵媒体生成前检查导演、编剧、
人物/场景、分镜和动作包之间的 ID、版本、时长与必填语义是否闭合；审计失败直接
阻断规格门禁，详细审美与媒体质量仍交给独立 QA。
"""
from __future__ import annotations

from collections.abc import Mapping
from typing import Any


_INTENT_FIELDS = (
    "protagonist_goal",
    "central_obstacle",
    "stakes",
    "audience_information_plan",
    "emotion_curve",
    "turning_points",
    "visual_strategy",
)


def _issue(
    issues: list[dict[str, str]],
    *,
    code: str,
    stage: str,
    path: str,
    message: str,
    owner: str,
) -> None:
    """追加一条可路由、可复验的确定性问题。"""
    issues.append({
        "code": code,
        "stage": stage,
        "path": path,
        "message": message,
        "owner_employee_key": owner,
    })


def _mapping(value: Any) -> dict[str, Any]:
    return dict(value) if isinstance(value, Mapping) else {}


def _items(value: Any) -> list[Any]:
    return list(value) if isinstance(value, list) else []


def _present(value: Any) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict, tuple, set)):
        return bool(value)
    return value is not None


def _reference_id(value: Any, *keys: str) -> str:
    """从字符串或引用对象中提取稳定 ID，并剥离常见版本后缀。"""
    if isinstance(value, Mapping):
        for key in keys:
            raw = value.get(key)
            if raw:
                return str(raw).strip()
        return ""
    text = str(value or "").strip()
    for separator in ("@", ":", "/"):
        if separator in text:
            text = text.split(separator, 1)[0]
    return text


def _require_fields(
    obj: Mapping[str, Any],
    fields: tuple[str, ...],
    *,
    stage: str,
    base_path: str,
    owner: str,
    errors: list[dict[str, str]],
) -> None:
    for field in fields:
        if not _present(obj.get(field)):
            _issue(
                errors,
                code="required_field_missing",
                stage=stage,
                path=f"{base_path}.{field}",
                message=f"必填字段 {field} 为空",
                owner=owner,
            )


def audit_comic_spec_contract(bundle: Mapping[str, Any] | None) -> dict[str, Any]:
    """审计导演到动作包的跨阶段合同，返回机器可读 PASS/FAIL 报告。"""
    payload = _mapping(bundle)
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    owners = {
        "director": "comic-director",
        "script": "comic-screenwriter",
        "characters": "comic-character-designer",
        "scenes": "comic-scene-designer",
        "storyboard": "comic-storyboard",
        "action_vfx": "comic-vfx-designer",
    }
    stages: dict[str, dict[str, Any]] = {}
    for stage, owner in owners.items():
        stages[stage] = _mapping(payload.get(stage))
        if not stages[stage]:
            _issue(
                errors,
                code="stage_output_missing",
                stage=stage,
                path=stage,
                message=f"缺少 {stage} 阶段的结构化输出",
                owner=owner,
            )

    director = stages["director"]
    directorial_intent = _mapping(
        _mapping(director.get("delivery_spec")).get("directorial_intent")
    )
    _require_fields(
        directorial_intent,
        _INTENT_FIELDS,
        stage="director",
        base_path="director.delivery_spec.directorial_intent",
        owner=owners["director"],
        errors=errors,
    )

    script = stages["script"]
    target_duration = script.get("target_duration_sec")
    if not isinstance(target_duration, (int, float)) or target_duration <= 0:
        _issue(
            errors,
            code="duration_invalid",
            stage="script",
            path="script.target_duration_sec",
            message="剧本目标时长必须为正数",
            owner=owners["script"],
        )

    script_scenes = _items(script.get("scenes"))
    if not script_scenes:
        _issue(
            errors,
            code="collection_empty",
            stage="script",
            path="script.scenes",
            message="剧本至少需要一个场景",
            owner=owners["script"],
        )
    scene_ids: set[str] = set()
    beat_ids: set[str] = set()
    for index, raw_scene in enumerate(script_scenes):
        scene = _mapping(raw_scene)
        path = f"script.scenes[{index}]"
        _require_fields(
            scene,
            ("scene_id", "entry_state", "scene_goal", "opposition", "stakes", "turn", "exit_state"),
            stage="script",
            base_path=path,
            owner=owners["script"],
            errors=errors,
        )
        scene_id = str(scene.get("scene_id") or "").strip()
        if scene_id:
            if scene_id in scene_ids:
                _issue(
                    errors,
                    code="id_duplicate",
                    stage="script",
                    path=f"{path}.scene_id",
                    message=f"重复 scene_id：{scene_id}",
                    owner=owners["script"],
                )
            scene_ids.add(scene_id)
        beats = _items(scene.get("beats"))
        if not beats:
            _issue(
                errors,
                code="collection_empty",
                stage="script",
                path=f"{path}.beats",
                message="场景至少需要一个可观察节拍",
                owner=owners["script"],
            )
        for beat_index, raw_beat in enumerate(beats):
            beat = _mapping(raw_beat)
            beat_path = f"{path}.beats[{beat_index}]"
            _require_fields(
                beat,
                ("beat_id", "intent", "consequence"),
                stage="script",
                base_path=beat_path,
                owner=owners["script"],
                errors=errors,
            )
            if not any(_present(beat.get(field)) for field in ("action", "dialogue", "audio_note")):
                _issue(
                    errors,
                    code="observable_beat_missing",
                    stage="script",
                    path=beat_path,
                    message="节拍必须包含可观察动作、对白或声音",
                    owner=owners["script"],
                )
            beat_id = str(beat.get("beat_id") or "").strip()
            if beat_id:
                if beat_id in beat_ids:
                    _issue(
                        errors,
                        code="id_duplicate",
                        stage="script",
                        path=f"{beat_path}.beat_id",
                        message=f"重复 beat_id：{beat_id}",
                        owner=owners["script"],
                    )
                beat_ids.add(beat_id)

    character_rows = _items(stages["characters"].get("characters"))
    character_ids: set[str] = set()
    for index, raw_character in enumerate(character_rows):
        character = _mapping(raw_character)
        path = f"characters.characters[{index}]"
        _require_fields(
            character,
            ("character_id", "version", "story_function", "identity_invariants", "variants", "generation_description"),
            stage="characters",
            base_path=path,
            owner=owners["characters"],
            errors=errors,
        )
        character_id = str(character.get("character_id") or "").strip()
        if character_id:
            if character_id in character_ids:
                _issue(
                    errors,
                    code="id_duplicate",
                    stage="characters",
                    path=f"{path}.character_id",
                    message=f"重复 character_id：{character_id}",
                    owner=owners["characters"],
                )
            character_ids.add(character_id)

    scene_rows = _items(stages["scenes"].get("scenes"))
    asset_scene_ids: set[str] = set()
    for index, raw_scene in enumerate(scene_rows):
        scene = _mapping(raw_scene)
        path = f"scenes.scenes[{index}]"
        _require_fields(
            scene,
            ("scene_id", "version", "story_usage", "layout", "materials", "palette", "lighting", "camera_positions", "generation_description"),
            stage="scenes",
            base_path=path,
            owner=owners["scenes"],
            errors=errors,
        )
        scene_id = str(scene.get("scene_id") or "").strip()
        if scene_id:
            if scene_id in asset_scene_ids:
                _issue(
                    errors,
                    code="id_duplicate",
                    stage="scenes",
                    path=f"{path}.scene_id",
                    message=f"重复场景资产 ID：{scene_id}",
                    owner=owners["scenes"],
                )
            asset_scene_ids.add(scene_id)

    storyboard = stages["storyboard"]
    shots = _items(storyboard.get("shots"))
    shot_ids: set[str] = set()
    shot_duration = 0.0
    for index, raw_shot in enumerate(shots):
        shot = _mapping(raw_shot)
        path = f"storyboard.shots[{index}]"
        _require_fields(
            shot,
            (
                "shot_id", "scene_id", "beat_id", "narrative_intent",
                "information_change", "emotion_target", "shot_size",
                "camera_angle", "composition", "subject_action", "camera_motion",
                "start_state", "end_state", "scene_ref", "transition",
                "continuity_checks",
            ),
            stage="storyboard",
            base_path=path,
            owner=owners["storyboard"],
            errors=errors,
        )
        shot_id = str(shot.get("shot_id") or "").strip()
        if shot_id:
            if shot_id in shot_ids:
                _issue(
                    errors,
                    code="id_duplicate",
                    stage="storyboard",
                    path=f"{path}.shot_id",
                    message=f"重复 shot_id：{shot_id}",
                    owner=owners["storyboard"],
                )
            shot_ids.add(shot_id)
        duration = shot.get("duration_sec")
        if not isinstance(duration, (int, float)) or duration <= 0 or duration > 6:
            _issue(
                errors,
                code="duration_invalid",
                stage="storyboard",
                path=f"{path}.duration_sec",
                message="单镜时长必须大于 0 且不超过 6 秒",
                owner=owners["storyboard"],
            )
        else:
            shot_duration += float(duration)
        if scene_ids and str(shot.get("scene_id") or "") not in scene_ids:
            _issue(
                errors,
                code="reference_unknown",
                stage="storyboard",
                path=f"{path}.scene_id",
                message="分镜 scene_id 未引用剧本场景",
                owner=owners["storyboard"],
            )
        if beat_ids and str(shot.get("beat_id") or "") not in beat_ids:
            _issue(
                errors,
                code="reference_unknown",
                stage="storyboard",
                path=f"{path}.beat_id",
                message="分镜 beat_id 未引用剧本节拍",
                owner=owners["storyboard"],
            )
        scene_ref = _reference_id(shot.get("scene_ref"), "scene_id", "id")
        if asset_scene_ids and scene_ref not in asset_scene_ids:
            _issue(
                errors,
                code="reference_unknown",
                stage="storyboard",
                path=f"{path}.scene_ref",
                message=f"未知场景资产引用：{scene_ref or '(空)'}",
                owner=owners["storyboard"],
            )
        for ref_index, ref in enumerate(_items(shot.get("character_refs"))):
            character_ref = _reference_id(ref, "character_id", "id")
            if character_ids and character_ref not in character_ids:
                _issue(
                    errors,
                    code="reference_unknown",
                    stage="storyboard",
                    path=f"{path}.character_refs[{ref_index}]",
                    message=f"未知角色资产引用：{character_ref or '(空)'}",
                    owner=owners["storyboard"],
                )

    storyboard_total = storyboard.get("total_duration_sec")
    if isinstance(storyboard_total, (int, float)):
        if abs(float(storyboard_total) - shot_duration) > 0.05:
            _issue(
                errors,
                code="duration_sum_mismatch",
                stage="storyboard",
                path="storyboard.total_duration_sec",
                message=f"逐镜合计 {shot_duration:g}s 与分镜总时长 {storyboard_total:g}s 不一致",
                owner=owners["storyboard"],
            )
        if isinstance(target_duration, (int, float)) and abs(float(storyboard_total) - float(target_duration)) > 0.05:
            _issue(
                errors,
                code="duration_target_mismatch",
                stage="storyboard",
                path="storyboard.total_duration_sec",
                message="分镜总时长与剧本目标时长不一致",
                owner=owners["storyboard"],
            )
    else:
        _issue(
            errors,
            code="duration_invalid",
            stage="storyboard",
            path="storyboard.total_duration_sec",
            message="分镜总时长必须为数字",
            owner=owners["storyboard"],
        )

    action_rows = _items(stages["action_vfx"].get("shots"))
    action_shot_ids: set[str] = set()
    for index, raw_action in enumerate(action_rows):
        action = _mapping(raw_action)
        path = f"action_vfx.shots[{index}]"
        _require_fields(
            action,
            ("shot_id", "action", "continuity_in", "continuity_out"),
            stage="action_vfx",
            base_path=path,
            owner=owners["action_vfx"],
            errors=errors,
        )
        if not isinstance(action.get("vfx_layers"), list):
            _issue(
                errors,
                code="field_type_invalid",
                stage="action_vfx",
                path=f"{path}.vfx_layers",
                message="vfx_layers 必须为数组，普通镜头可为空数组",
                owner=owners["action_vfx"],
            )
        if not isinstance(action.get("generation_risks"), list):
            _issue(
                errors,
                code="field_type_invalid",
                stage="action_vfx",
                path=f"{path}.generation_risks",
                message="generation_risks 必须为数组",
                owner=owners["action_vfx"],
            )
        shot_id = str(action.get("shot_id") or "").strip()
        if shot_id:
            if shot_id in action_shot_ids:
                _issue(
                    errors,
                    code="id_duplicate",
                    stage="action_vfx",
                    path=f"{path}.shot_id",
                    message=f"动作包重复 shot_id：{shot_id}",
                    owner=owners["action_vfx"],
                )
            action_shot_ids.add(shot_id)

    for missing_shot in sorted(shot_ids - action_shot_ids):
        _issue(
            errors,
            code="shot_coverage_missing",
            stage="action_vfx",
            path="action_vfx.shots",
            message=f"动作包缺少分镜 {missing_shot}",
            owner=owners["action_vfx"],
        )
    for unknown_shot in sorted(action_shot_ids - shot_ids):
        _issue(
            errors,
            code="reference_unknown",
            stage="action_vfx",
            path="action_vfx.shots",
            message=f"动作包包含未知分镜 {unknown_shot}",
            owner=owners["action_vfx"],
        )

    if not character_rows:
        _issue(
            warnings,
            code="character_assets_empty",
            stage="characters",
            path="characters.characters",
            message="人物资产为空；仅在无人叙事时可接受",
            owner=owners["characters"],
        )

    gate = "FAIL" if errors else "PASS"
    return {
        "phase": "SPEC_CONTRACT",
        "gate": gate,
        "verdict": "fail" if errors else "pass",
        "errors": errors,
        "warnings": warnings,
        "metrics": {
            "scene_count": len(script_scenes),
            "beat_count": len(beat_ids),
            "character_count": len(character_rows),
            "scene_asset_count": len(scene_rows),
            "shot_count": len(shots),
            "action_shot_count": len(action_rows),
            "shot_duration_sec": round(shot_duration, 3),
        },
    }
