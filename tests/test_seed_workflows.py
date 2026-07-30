from app.services.seed_workflows import COMIC_ROLES, build_comic_drama_workflow


def test_comic_workflow_is_the_guided_one_sentence_to_finish_pipeline():
    workflow = build_comic_drama_workflow()
    node_keys = [node.node_key for node in workflow.nodes]

    assert workflow.enabled is True
    assert node_keys == [
        "start",
        "director",
        "writer",
        "visual_bible",
        "char_design",
        "char_art",
        "scene_design",
        "scene_art",
        "storyboard",
        "motion",
        "prompt_eng",
        "keyframe_art",
        "video",
        "qa",
        "end",
    ]
    assert [(edge.source, edge.target) for edge in workflow.edges] == list(
        zip(node_keys, node_keys[1:])
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
        "comic-trajectory-artist",
        "comic-prompt-engineer",
        "comic-keyframe-artist",
        "comic-video-artist",
        "comic-qa-inspector",
    } == employee_keys
