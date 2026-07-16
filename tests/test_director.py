"""导演 Agent 的状态聚合、OpenRouter 媒体回填与成片合成契约。"""
from __future__ import annotations

import pytest


@pytest.fixture()
def director_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据，并替换全部外部媒体调用。"""
    import app.api.production as production
    from app.services import openrouter_media

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)
    monkeypatch.setattr(openrouter_media, "list_media_models", lambda kind: [{
        "id": f"demo/{kind}", "name": f"Demo {kind}", "kind": kind,
    }])
    monkeypatch.setattr(openrouter_media, "generate_image", lambda project_id, **kwargs: {
        "url": f"/uploads/production/{project_id}/shot.png",
        "model": kwargs["model"],
        "usage": {"cost": 0.01},
    })
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
