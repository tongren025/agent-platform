from app.services.seed_workflows import COMIC_ROLES, build_comic_drama_workflow


def test_comic_workflow_is_the_guided_one_sentence_to_finish_pipeline():
    workflow = build_comic_drama_workflow()
    node_keys = [node.node_key for node in workflow.nodes]

    assert workflow.enabled is True
    assert node_keys[0] == "start"
    assert node_keys[-1] == "end"
    assert len(node_keys) == 26
    assert len(workflow.edges) == 31
    assert {"spec_gate", "image_gate", "video_gate"} <= set(node_keys)


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
