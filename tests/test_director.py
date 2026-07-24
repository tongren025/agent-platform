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
    """单镜从图片到异步视频再到 FFmpeg 成片会持续回填同一项目。"""
    client = director_env
    pid, card_ids = _create_gc(client)

    image_response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image",
        json={"model": "demo/image", "aspect_ratio": "9:16"},
    )
    assert image_response.status_code == 200
    assert image_response.json()["data"]["card"]["images"]

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
    assert sync_response.json()["data"]["card"]["videos"]

    state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert state["nextAction"]["kind"] == "compose"

    compose_response = client.post(f"/api/v1/agentapp/director/projects/{pid}/compose")
    assert compose_response.status_code == 200
    data = compose_response.json()["data"]
    assert data["clipCount"] == 1
    assert data["state"]["finalUrl"].endswith("/final.mp4")
    assert data["state"]["nextAction"]["kind"] == "done"

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
    rejected_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert rejected_state["nextAction"]["kind"] == "image"
    assert rejected_state["finalUrl"] == ""
    assert rejected_state["finalStale"] is True
    approve = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_ids['img_prompt']}/review",
        json={"verdict": "pass", "image": data["state"]["shots"][0]["imageUrl"]},
    )
    assert approve.status_code == 200
    approved_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert approved_state["finalUrl"].endswith("/final.mp4")

    # 重做首帧后，旧视频和旧成片不能继续冒充当前交付版本。
    regenerate = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card_ids['img_prompt']}/image",
        json={"model": "demo/image", "aspect_ratio": "9:16"},
    )
    assert regenerate.status_code == 200
    stale_state = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert stale_state["shots"][0]["videoUrl"] == ""
    assert stale_state["shots"][0]["videoStale"] is True
    assert stale_state["finalUrl"] == ""
    assert stale_state["finalStale"] is True
    assert stale_state["nextAction"]["kind"] == "video"
    blocked_compose = client.post(f"/api/v1/agentapp/director/projects/{pid}/compose")
    assert blocked_compose.status_code == 400
