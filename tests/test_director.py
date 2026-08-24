"""导演 Agent 的状态聚合、OpenRouter 媒体回填与成片合成契约。"""
from __future__ import annotations

import pytest


@pytest.fixture()
def director_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据，并替换全部外部媒体调用。"""
    import app.api.production as production
    from app.services import openrouter_media

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)
    image_calls = {"count": 0}

    def generate_image(project_id, **kwargs):
        image_calls["count"] += 1
        return {
            "url": f"/uploads/production/{project_id}/shot-{image_calls['count']}.png",
            "model": kwargs["model"],
            "usage": {"cost": 0.01},
        }

    monkeypatch.setattr(openrouter_media, "list_media_models", lambda kind: [{
        "id": f"demo/{kind}", "name": f"Demo {kind}", "kind": kind,
    }])
    monkeypatch.setattr(openrouter_media, "generate_image", generate_image)
    monkeypatch.setattr(openrouter_media, "submit_video", lambda project_id, **kwargs: {
        "id": "job-demo", "status": "pending", "pollingUrl": "/videos/job-demo",
        "model": kwargs["model"],
    })
    monkeypatch.setattr(openrouter_media, "sync_video", lambda project_id, job_id: {
        "id": job_id,
        "status": "completed",
        "url": f"/uploads/production/{project_id}/shot.mp4",
        "usage": {"cost": 0.2},
        "error": "",
    })
    monkeypatch.setattr(openrouter_media, "compose_video", lambda project_id, video_urls, aspect_ratio: {
        "url": f"/uploads/production/{project_id}/final.mp4",
        "clipCount": len(video_urls),
        "aspectRatio": aspect_ratio,
        "width": 720,
        "height": 1280,
    })
    return app_client


def _create_gc(client) -> tuple[str, dict[str, str]]:
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "导演测试片",
            "source_type": "gc",
            "source_content": "一个人在雨夜推开旧电影院的门",
            "aspect_ratio": "9:16",
        },
    ).json()["data"]
    pid = project["project_id"]
    card_ids = {}
    for stage in ("script", "storyboard", "img_prompt", "vid_prompt"):
        body = {
            "stage": stage,
            "title": f"G1 {stage}",
            "content": f"{stage} content",
            "episode": None,
            "shot_number": 1,
            "prompts": [f"{stage} prompt"],
            "metadata": {"duration_seconds": 4},
        }
        card = client.post(
            f"/api/v1/agentapp/production/projects/{pid}/cards",
            json=body,
        ).json()["data"]
        card_ids[stage] = card["card_id"]
    return pid, card_ids


def test_director_state_points_to_missing_image(director_env):
    """规格齐全但图片为空时，导演应把下一步收束到生图。"""
    client = director_env
    pid, _ = _create_gc(client)
    response = client.get(f"/api/v1/agentapp/director/projects/{pid}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["totalUnits"] == 1
    assert data["nextAction"] == {
        "kind": "image", "stage": "image", "label": "生成镜头图片", "count": 1,
    }
    assert data["shots"][0]["durationSeconds"] == 4


def test_director_media_models_are_normalized(director_env):
    """图片/视频模型目录通过统一信封返回。"""
    response = director_env.get("/api/v1/agentapp/director/media-models?kind=video")
    assert response.status_code == 200
    assert response.json()["data"][0]["id"] == "demo/video"


def test_comic_director_uses_employee_media_routes(
    director_env,
    monkeypatch,
):
    """漫剧导演台必须使用岗位配置，不能让请求模型绕过员工策略。"""
    import app.api.director as director

    client = director_env
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "员工路由测试",
            "source_type": "gc",
            "source_content": "雨夜旧影院",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]
    pid = project["project_id"]
    setting = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": "setting",
            "title": "角色母版",
            "content": "锁定人物",
            "images": ["/uploads/canvas/character-master.png"],
        },
    )
    assert setting.status_code == 200
    card_ids = {}
    for stage in ("img_prompt", "vid_prompt"):
        response = client.post(
            f"/api/v1/agentapp/production/projects/{pid}/cards",
            json={
                "stage": stage,
                "title": f"G1 {stage}",
                "content": f"{stage} prompt",
                "shot_number": 1,
                "prompts": [f"{stage} prompt"],
            },
        )
        card_ids[stage] = response.json()["data"]["card_id"]

    image_calls = {}

    def fake_employee_image(
        prompt,
        model,
        size,
        quality,
        reference_urls,
    ):
        image_calls.update({
            "prompt": prompt,
            "model": model,
            "size": size,
            "quality": quality,
            "reference_urls": reference_urls,
        })
        return {
            "url": "/uploads/canvas/employee-shot.png",
            "model": model,
        }

    video_calls = {}

    def fake_employee_video(project_id, **kwargs):
        video_calls.update(kwargs)
        return {
            "id": "job-employee",
            "status": "queued",
            "model": kwargs["model"],
        }

    monkeypatch.setattr(
        director,
        "generate_image_to_local",
        fake_employee_image,
    )
    monkeypatch.setattr(
        director.openrouter_media,
        "submit_video",
        fake_employee_video,
    )

    models = client.get(
        "/api/v1/agentapp/director/media-models",
        params={
            "kind": "image",
            "employee_key": "comic-keyframe-artist",
        },
    )
    assert models.status_code == 200
    assert models.json()["data"][0]["id"] == "gpt-image-2"

    image = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/"
        f"{card_ids['img_prompt']}/image",
        json={
            "model": "gpt-image-2",
            "employee_key": "comic-keyframe-artist",
        },
    )
    assert image.status_code == 200, image.text
    assert image_calls["model"] == "gpt-image-2"
    assert image_calls["reference_urls"] == [
        "/uploads/canvas/character-master.png"
    ]
    assert (
        image.json()["data"]["card"]["metadata"]["last_image_employee_key"]
        == "comic-keyframe-artist"
    )
    approved_image = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/"
        f"{card_ids['img_prompt']}/review",
        json={
            "verdict": "pass",
            "image": image.json()["data"]["url"],
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert approved_image.status_code == 200, approved_image.text

    video = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/"
        f"{card_ids['vid_prompt']}/video",
        json={
            "model": "openrouter:bytedance/seedance-2.0",
            "employee_key": "comic-video-artist",
            "image_url": "/uploads/canvas/employee-shot.png",
        },
    )
    assert video.status_code == 200, video.text
    assert video_calls["model"] == "bytedance/seedance-2.0"
    job_metadata = video.json()["data"]["card"]["metadata"][
        "openrouter_video_job"
    ]
    assert job_metadata["employeeKey"] == "comic-video-artist"
    assert (
        job_metadata["modelRef"]
        == "openrouter:bytedance/seedance-2.0"
    )


def test_comic_director_rejects_model_that_bypasses_employee(director_env):
    client = director_env
    project = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "禁止绕过模型",
            "source_type": "gc",
            "source_content": "测试",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]
    pid = project["project_id"]
    card = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": "img_prompt",
            "title": "G1 首帧",
            "content": "镜头图",
            "shot_number": 1,
            "prompts": ["镜头图"],
        },
    ).json()["data"]

    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/"
        f"{card['card_id']}/image",
        json={
            "model": "openrouter:another/image-model",
            "employee_key": "comic-keyframe-artist",
        },
    )

    assert response.status_code == 400
    assert "已固定使用 gpt-image-2" in response.text


def test_update_image_prompt_preserves_secondary_prompts(director_env):
    """镜头编辑只替换首条生产提示词，不误删同卡片上的补充提示。"""
    client = director_env
    pid, card_ids = _create_gc(client)
    card_id = card_ids["img_prompt"]
    client.put(
        f"/api/v1/agentapp/production/cards/{card_id}",
        json={
            "prompts": ["旧主提示", "角色一致性参考", "光影参考"],
            "content": "保留的卡片说明",
            "metadata": {"duration_seconds": 4, "source": "fixture"},
        },
    )

    response = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_id}/image-prompt",
        json={"prompt": "  新的镜头主提示  "},
    )

    assert response.status_code == 200, response.text
    card = response.json()["data"]["card"]
    assert card["prompts"] == ["新的镜头主提示", "角色一致性参考", "光影参考"]
    assert card["content"] == "保留的卡片说明"
    assert card["metadata"] == {"duration_seconds": 4, "source": "fixture"}
    state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert state["shots"][0]["imagePrompt"] == "新的镜头主提示"


def test_update_image_prompt_rejects_blank_and_non_image_card(director_env):
    client = director_env
    pid, card_ids = _create_gc(client)
    blank = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image-prompt",
        json={"prompt": "   "},
    )
    wrong_stage = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['script']}/image-prompt",
        json={"prompt": "不会被写入"},
    )
    assert blank.status_code == 400
    assert wrong_stage.status_code == 400


def test_image_video_and_compose_flow(director_env):
    """图片、镜头视频与整集成片必须逐级精品验收后才能交付。"""
    client = director_env
    pid, card_ids = _create_gc(client)

    image_response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image",
        json={"model": "demo/image", "aspect_ratio": "9:16"},
    )
    assert image_response.status_code == 200
    assert image_response.json()["data"]["card"]["images"]
    first_image = image_response.json()["data"]["url"]
    pending_video = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video",
        json={"model": "demo/video", "duration": 4, "aspect_ratio": "9:16"},
    )
    assert pending_video.status_code == 409
    assert "精品评分" in pending_video.json()["message"]
    approved_image = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={
            "verdict": "pass",
            "image": first_image,
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert approved_image.status_code == 200, approved_image.text

    video_response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video",
        json={"model": "demo/video", "duration": 4, "aspect_ratio": "9:16"},
    )
    assert video_response.status_code == 200
    assert video_response.json()["data"]["job"]["status"] == "pending"

    sync_response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video/sync",
    )
    assert sync_response.status_code == 200
    synced_card = sync_response.json()["data"]["card"]
    assert synced_card["videos"]
    assert synced_card["status"] == "review"

    state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert state["shots"][0]["videoCandidateUrl"].endswith("/shot.mp4")
    assert state["shots"][0]["videoUrl"] == ""
    assert state["videoReviewCount"] == 1
    blocked_compose = client.post(f"/api/v1/agentapp/director/projects/{pid}/compose")
    assert blocked_compose.status_code == 400

    video_review = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/"
            f"{card_ids['vid_prompt']}/video-review"
        ),
        json={
            "verdict": "pass",
            "video": synced_card["videos"][-1],
            "ratings": {
                "identity_stability": 5,
                "motion_integrity": 5,
                "shot_fidelity": 4,
                "temporal_continuity": 4,
                "audio_dialogue": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert video_review.status_code == 200, video_review.text
    state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert state["nextAction"]["kind"] == "compose"

    compose_response = client.post(f"/api/v1/agentapp/director/projects/{pid}/compose")
    assert compose_response.status_code == 200
    data = compose_response.json()["data"]
    assert data["clipCount"] == 1
    assert data["state"]["finalUrl"] == ""
    assert data["state"]["finalCandidateUrl"].endswith("/final.mp4")
    assert data["state"]["finalPendingReview"] is True
    assert data["state"]["nextAction"]["kind"] == "final_review"

    final_card_id = data["state"]["finalCardId"]
    final_review = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/"
            f"{final_card_id}/video-review"
        ),
        json={
            "verdict": "pass",
            "video": data["state"]["finalCandidateUrl"],
            "ratings": {
                "narrative_continuity": 5,
                "visual_continuity": 5,
                "pacing": 4,
                "audio_mix": 4,
                "dialogue_delivery": 4,
                "delivery_integrity": 4,
            },
        },
    )
    assert final_review.status_code == 200, final_review.text
    data["state"] = client.get(
        f"/api/v1/agentapp/director/projects/{pid}"
    ).json()["data"]
    assert data["state"]["finalUrl"].endswith("/final.mp4")
    assert data["state"]["nextAction"]["kind"] == "done"

    # 重新提交视频只是在后台生成新候选，不能让已验收旧版和整集交付暂时消失。
    replacement_video = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video",
        json={"model": "demo/video", "duration": 4, "aspect_ratio": "9:16"},
    )
    assert replacement_video.status_code == 200, replacement_video.text
    preserved_while_generating = client.get(
        f"/api/v1/agentapp/director/projects/{pid}"
    ).json()["data"]
    assert preserved_while_generating["shots"][0]["videoUrl"].endswith("/shot.mp4")
    assert preserved_while_generating["finalUrl"].endswith("/final.mp4")

    # 退回当前首帧会暂停下游交付；重新通过同一版本后可恢复。
    reject = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={
            "verdict": "reject",
            "image": data["state"]["shots"][0]["imageUrl"],
            "reason": "composition_mismatch",
        },
    )
    assert reject.status_code == 200
    rejected_video = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video",
        json={"model": "demo/video", "duration": 4, "aspect_ratio": "9:16"},
    )
    assert rejected_video.status_code == 409
    assert "待返工" in rejected_video.json()["message"]
    rejected_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert rejected_state["nextAction"]["kind"] == "image"
    assert rejected_state["finalUrl"] == ""
    assert rejected_state["finalStale"] is True
    approve = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={
            "verdict": "pass",
            "image": data["state"]["shots"][0]["imageUrl"],
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert approve.status_code == 200
    approved_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert approved_state["finalUrl"].endswith("/final.mp4")

    # 重做首帧先只产生候选；未验收前不能覆盖已通过的生产图。
    regenerate = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image",
        json={"model": "demo/image", "aspect_ratio": "9:16"},
    )
    assert regenerate.status_code == 200
    candidate = regenerate.json()["data"]["url"]
    preserved_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert preserved_state["shots"][0]["imageUrl"] != candidate
    assert preserved_state["shots"][0]["videoUrl"].endswith("/shot.mp4")
    assert preserved_state["finalUrl"].endswith("/final.mp4")

    reviewed_candidate = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={
            "verdict": "pass",
            "image": candidate,
            "promote": False,
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 5,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert reviewed_candidate.status_code == 200, reviewed_candidate.text
    activated = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}"
            "/image-candidates/activate"
        ),
        json={"image": candidate},
    )
    assert activated.status_code == 200, activated.text
    stale_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert stale_state["shots"][0]["videoUrl"] == ""
    assert stale_state["shots"][0]["videoStale"] is True
    assert stale_state["finalUrl"] == ""
    assert stale_state["finalStale"] is True
    assert stale_state["nextAction"]["kind"] == "video"
    blocked_compose = client.post(f"/api/v1/agentapp/director/projects/{pid}/compose")
    assert blocked_compose.status_code == 400


def test_video_submission_requires_current_project_image(director_env):
    client = director_env
    pid, card_ids = _create_gc(client)

    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['vid_prompt']}/video",
        json={
            "model": "demo/video",
            "duration": 4,
            "aspect_ratio": "9:16",
            "image_url": "https://example.com/untracked.png",
        },
    )

    assert response.status_code == 400
    assert "先生成当前镜头图片" in response.json()["message"]


def test_rejected_video_feedback_is_applied_to_next_submission(
    director_env,
    monkeypatch,
):
    """视频退回原因必须进入下一次真实供应商请求，而不是只留在历史里。"""
    client = director_env
    from app.services import openrouter_media

    submitted_prompts: list[str] = []

    def capture_submit(project_id, **kwargs):
        submitted_prompts.append(kwargs["prompt"])
        return {
            "id": f"job-{len(submitted_prompts)}",
            "status": "pending",
            "pollingUrl": f"/videos/job-{len(submitted_prompts)}",
            "model": kwargs["model"],
        }

    monkeypatch.setattr(openrouter_media, "submit_video", capture_submit)
    pid, card_ids = _create_gc(client)
    image = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image",
        json={"model": "demo/image"},
    ).json()["data"]["url"]
    approved = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={
            "verdict": "pass",
            "image": image,
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert approved.status_code == 200, approved.text
    endpoint = (
        f"/api/v1/agentapp/director/projects/{pid}/cards/"
        f"{card_ids['vid_prompt']}/video"
    )
    first = client.post(endpoint, json={"model": "demo/video"})
    assert first.status_code == 200, first.text
    synced = client.post(f"{endpoint}/sync")
    assert synced.status_code == 200, synced.text
    video = synced.json()["data"]["card"]["videos"][-1]
    rejected = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/"
            f"{card_ids['vid_prompt']}/video-review"
        ),
        json={
            "verdict": "reject",
            "video": video,
            "reason": "motion_broken",
            "note": "第 3 秒右手穿过衣服",
        },
    )
    assert rejected.status_code == 200, rejected.text

    second = client.post(endpoint, json={"model": "demo/video"})
    assert second.status_code == 200, second.text
    assert second.json()["data"]["qualityFeedbackApplied"] is True
    assert "确保肢体、头发、衣物和物体运动连续完整" in submitted_prompts[-1]
    assert "第 3 秒右手穿过衣服" in submitted_prompts[-1]


def test_rejected_image_feedback_is_applied_to_next_generation(
    director_env,
    monkeypatch,
):
    """退回原因和人工备注必须进入下一次真实生图请求，不能只停留在统计页。"""
    client = director_env
    from app.services import openrouter_media

    prompts: list[str] = []

    def capture_generation(project_id, **kwargs):
        prompts.append(kwargs["prompt"])
        return {
            "url": f"/uploads/production/{project_id}/quality-{len(prompts)}.png",
            "model": kwargs["model"],
            "usage": {"cost": 0.01},
        }

    monkeypatch.setattr(openrouter_media, "generate_image", capture_generation)
    pid, card_ids = _create_gc(client)
    endpoint = (
        f"/api/v1/agentapp/director/projects/{pid}"
        f"/cards/{card_ids['img_prompt']}/image"
    )
    first = client.post(endpoint, json={"model": "demo/image"})
    assert first.status_code == 200, first.text
    image = first.json()["data"]["url"]
    rejected = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}"
            f"/cards/{card_ids['img_prompt']}/review"
        ),
        json={
            "verdict": "reject",
            "image": image,
            "reason": "character_drift",
            "note": "女主必须保留左眼泪痣和青色发带",
        },
    )
    assert rejected.status_code == 200, rejected.text

    second = client.post(endpoint, json={"model": "demo/image"})
    assert second.status_code == 200, second.text
    assert second.json()["data"]["qualityFeedbackApplied"] is True
    assert "当前角色时期的脸、发型、服装" in prompts[-1]
    assert "女主必须保留左眼泪痣和青色发带" in prompts[-1]
    assert prompts[-1].startswith("img_prompt prompt")
def test_director_control_pack_upload_and_multimodal_submission(
    director_env,
    monkeypatch,
):
    """镜头控制保存、音频上传与多模态生成必须形成一条真实链路。"""
    from app.services import openrouter_media

    client = director_env
    submitted = {}

    def capture_submit(project_id, **kwargs):
        submitted.update(kwargs)
        return {
            "id": "job-control",
            "status": "pending",
            "pollingUrl": "/videos/job-control",
            "model": kwargs["model"],
        }

    monkeypatch.setattr(openrouter_media, "submit_video", capture_submit)
    pid, card_ids = _create_gc(client)
    control_url = (
        f"/api/v1/agentapp/director/projects/{pid}/cards/"
        f"{card_ids['vid_prompt']}/control-pack"
    )
    saved = client.put(
        control_url,
        json={
            "generation_mode": "auto",
            "shot_type": "dialogue",
            "references": [{
                "url": "https://example.test/performance.mp4",
                "kind": "video",
                "role": "performance",
                "label": "表演参考",
            }],
            "storyboard": "【时间轴】[00:00-00:04] 起身；[00:04-00:08] 说话",
            "camera_plan": "中近景缓慢推进",
            "performance_plan": "停顿后开口",
            "audio_plan": "低声对白",
        },
    )
    assert saved.status_code == 200, saved.text
    assert saved.json()["data"]["controlPlan"]["mode"] == "reference"

    uploaded = client.post(
        (
            f"/api/v1/agentapp/director/projects/{pid}/cards/"
            f"{card_ids['vid_prompt']}/control-assets"
        ),
        params={"role": "dialogue"},
        files={"file": ("dialogue.mp3", b"voice", "audio/mpeg")},
    )
    assert uploaded.status_code == 200, uploaded.text
    uploaded_data = uploaded.json()["data"]
    assert uploaded_data["asset"]["kind"] == "audio"
    assert uploaded_data["asset"]["role"] == "dialogue"

    image = client.post(
        (
            f"/api/v1/agentapp/director/projects/{pid}/cards/"
            f"{card_ids['img_prompt']}/image"
        ),
        json={"model": "demo/image", "aspect_ratio": "9:16"},
    )
    assert image.status_code == 200, image.text
    image_url = image.json()["data"]["url"]
    approved = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/"
            f"{card_ids['img_prompt']}/review"
        ),
        json={
            "verdict": "pass",
            "image": image_url,
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert approved.status_code == 200, approved.text

    video = client.post(
        (
            f"/api/v1/agentapp/director/projects/{pid}/cards/"
            f"{card_ids['vid_prompt']}/video"
        ),
        json={"model": "demo/video", "duration": 8, "aspect_ratio": "9:16"},
    )
    assert video.status_code == 200, video.text
    assert submitted["image_url"] == ""
    assert submitted["last_frame_url"] == ""
    assert {item["kind"] for item in submitted["reference_inputs"]} == {
        "image", "video", "audio",
    }
    metadata = video.json()["data"]["card"]["metadata"]["openrouter_video_job"]
    assert metadata["generationMode"] == "reference"
    assert metadata["controlPlan"]["summary"]["referenceCount"] == 3

    state = client.get(
        f"/api/v1/agentapp/director/projects/{pid}"
    ).json()["data"]
    shot = state["shots"][0]
    assert shot["controlPlan"]["mode"] == "reference"
    assert len(shot["controlPack"]["references"]) == 2
