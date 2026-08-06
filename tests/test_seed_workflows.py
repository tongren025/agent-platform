import json

from app.services.seed_workflows import COMIC_ROLES, build_comic_drama_workflow


def test_comic_workflow_is_the_guided_one_sentence_to_finish_pipeline():
    workflow = build_comic_drama_workflow()
    node_keys = [node.node_key for node in workflow.nodes]

    assert workflow.enabled is True
    assert node_keys[0] == "start"
    assert node_keys[-1] == "end"
    assert len(node_keys) == 28
    assert len(workflow.edges) == 34
    assert {"spec_audit", "spec_contract_gate", "spec_gate", "image_gate", "video_gate"} <= set(node_keys)


def test_director_brief_carries_directorial_thinking_into_handoffs():
    workflow = build_comic_drama_workflow()
    director = next(node for node in workflow.nodes if node.node_key == "director")
    prompt = director.config["userInputTemplate"]

    assert "目标—阻碍—有代价的选择—变化" in prompt
    assert "production_brief.delivery_spec.directorial_intent" in prompt
    assert "给编剧任务设置" in prompt
    assert "给分镜任务设置" in prompt
    assert "静音/删镜检查" in prompt


def test_screenwriter_builds_causal_scenes_without_taking_over_direction():
    workflow = build_comic_drama_workflow()
    writer = next(node for node in workflow.nodes if node.node_key == "writer")
    prompt = writer.config["userInputTemplate"]

    assert "directorial_intent" in prompt
    assert "但是/因此" in prompt
    assert "人物主动选择" in prompt
    assert "台词/潜台词" in prompt
    assert "不规定景别、运镜或模型提示词" in prompt


def test_storyboard_contract_carries_shot_causality_and_generation_constraints():
    workflow = build_comic_drama_workflow()
    storyboard = next(node for node in workflow.nodes if node.node_key == "storyboard")
    prompt = storyboard.config["userInputTemplate"]
    schema = json.loads(storyboard.config["structuredSchemaJson"])
    shot_schema = schema["properties"]["storyboard"]["properties"]["shots"]["items"]

    assert "镜头因果" in prompt
    assert "静音、删镜、连续性、生成性与总时长检查" in prompt
    assert "不得改写核心剧情和对白" in prompt
    assert {
        "narrative_intent",
        "information_change",
        "emotion_target",
        "camera_angle",
        "prop_refs",
        "audio",
        "transition",
        "generation_risks",
    } <= set(shot_schema["required"])
    assert shot_schema["properties"]["duration_sec"]["maximum"] == 6


def test_remaining_comic_roles_have_specialized_prompts_and_contracts():
    workflow = build_comic_drama_workflow()
    nodes = {node.node_key: node for node in workflow.nodes}

    prompt_markers = {
        "char_design": ("剪影", "禁继承项", "跨视角稳定生成"),
        "scene_design": ("空间母版", "行动/遮挡/危险区", "场景母版保持无人"),
        "vfx_action": ("受力反馈", "source/interaction/environment/", "拆镜建议"),
        "image_prompt": ("来源/参考映射", "negative_prompt 独立", "validation"),
        "char_art": ("validation=ready", "不得重新设计", "避免重复提交"),
        "scene_art": ("validation=ready", "不得重设计", "不得加入主要人物"),
        "keyframe_art": ("单一时间点", "不得设计/改写提示词", "避免重复提交"),
        "video_prompt": ("generation_mode", "模式互斥", "连续性 validation"),
        "video_generation": ("输入指纹", "模式互斥", "不得编造 URL"),
        "spec_qa": ("人物主动选择", "severity", "最小返工"),
        "image_qa": ("解剖手部", "责任岗位", "最小返工"),
        "video_qa": ("动作受力", "闪烁融化", "音画标准"),
    }
    for node_key, markers in prompt_markers.items():
        prompt = nodes[node_key].config["userInputTemplate"]
        assert all(marker in prompt for marker in markers)

    char_schema = json.loads(nodes["char_design"].config["structuredSchemaJson"])
    char_required = char_schema["properties"]["character_bible"]["properties"][
        "characters"
    ]["items"]["required"]
    assert {"story_function", "expression_range", "pose_constraints", "open_questions"} <= set(
        char_required
    )

    scene_schema = json.loads(nodes["scene_design"].config["structuredSchemaJson"])
    scene_required = scene_schema["properties"]["scene_bible"]["properties"][
        "scenes"
    ]["items"]["required"]
    assert {"story_usage", "materials", "palette", "time_variants", "open_questions"} <= set(
        scene_required
    )

    image_schema = json.loads(nodes["image_prompt"].config["structuredSchemaJson"])
    image_properties = image_schema["properties"]["image_prompt_package"]["properties"]
    for asset_key in ("character_assets", "scene_assets", "keyframe_assets"):
        required = set(image_properties[asset_key]["items"]["required"])
        assert {"reference_map", "negative_prompt", "validation"} <= required

    video_schema = json.loads(nodes["video_prompt"].config["structuredSchemaJson"])
    video_shot = video_schema["properties"]["video_prompt_package"]["properties"][
        "shots"
    ]["items"]
    assert "generation_mode" in video_shot["required"]
    parameter_required = set(video_shot["properties"]["parameters"]["required"])
    assert {"image_url", "last_frame_url", "reference_urls"} <= parameter_required

    qa_schema = json.loads(nodes["image_qa"].config["structuredSchemaJson"])
    qa_check_required = qa_schema["properties"]["qa_report"]["properties"]["checks"][
        "items"
    ]["required"]
    assert {"severity", "evidence_id", "expected", "owner_employee_key", "rework"} <= set(
        qa_check_required
    )


def test_comic_team_roles_cover_every_production_gate():
    employee_keys = {employee_key for employee_key, _, _ in COMIC_ROLES}

    assert {
        "comic-director",
        "comic-screenwriter",
        "comic-vfx-designer",
        "comic-character-designer",
        "comic-character-artist",
        "comic-scene-designer",
        "comic-scene-artist",
        "comic-storyboard",
        "comic-prompt-engineer",
        "comic-keyframe-artist",
        "comic-video-artist",
        "comic-qa-inspector",
    } == employee_keys
