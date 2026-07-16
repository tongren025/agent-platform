"""自由画布人工主控链路的回归测试。

保障重点不是模型效果，而是用户自己的数据不会静默覆盖，图片/视频不会混淆，
视频任务与成片合成严格使用前端显式提交的参数和顺序。
"""
from __future__ import annotations

import pytest


@pytest.fixture()
def canvas_env(tmp_path, monkeypatch, app_client):
    """隔离画布 JSON 与上传目录，避免测试污染真实工作台。"""
    import app.api.canvas as canvas

    data_dir = tmp_path / "canvas"
    upload_dir = tmp_path / "uploads"
    data_dir.mkdir()
    upload_dir.mkdir()
    monkeypatch.setattr(canvas, "DATA_DIR", data_dir)
    monkeypatch.setattr(canvas, "UPLOAD_DIR", upload_dir)
    return app_client, canvas, data_dir, upload_dir


def _create(client, name="镜头工作台"):
    response = client.post("/api/v1/agentapp/canvas/canvases", json={"name": name})
    assert response.status_code == 200, response.text
    return response.json()["data"]


def test_canvas_save_uses_revision_to_reject_stale_window(canvas_env):
    """两个窗口同时编辑时，旧版本必须 409，不能后到的旧数据覆盖新数据。"""
    client, _, _, _ = canvas_env
    doc = _create(client)
    assert doc["revision"] == 0

    first = client.put(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}",
        json={
            "base_revision": 0,
            "nodes": [{"node_id": "n1", "type": "data", "data": {"content": "新内容"}}],
            "edges": [],
        },
    )
    assert first.status_code == 200
    assert first.json()["data"]["revision"] == 1

    stale = client.put(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}",
        json={"base_revision": 0, "nodes": [], "edges": []},
    )
    assert stale.status_code == 409
    current = client.get(f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}").json()["data"]
    assert current["revision"] == 1
    assert current["nodes"][0]["data"]["content"] == "新内容"


def test_canvas_save_is_atomic_and_leaves_no_temp_file(canvas_env):
    """正常保存后只保留正式 JSON，不遗留临时文件。"""
    client, _, data_dir, _ = canvas_env
    doc = _create(client)
    client.put(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}",
        json={"base_revision": 0, "nodes": [], "edges": []},
    )
    assert [path.name for path in data_dir.iterdir()] == [f"{doc['canvas_id']}.json"]


def test_video_upload_returns_media_kind(canvas_env):
    """上传 MP4 必须生成 video 节点信息，不能再交给图片组件渲染。"""
    client, _, _, upload_dir = canvas_env
    doc = _create(client)
    response = client.post(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}/upload",
        files={"file": ("shot-01.mp4", b"fake-mp4", "video/mp4")},
    )
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["kind"] == "video"
    assert data["name"] == "shot-01.mp4"
    assert data["size"] == 8
    assert (upload_dir / data["url"].rsplit("/", 1)[-1]).read_bytes() == b"fake-mp4"


def test_canvas_video_submit_and_sync_are_explicit(canvas_env, monkeypatch):
    """文/图生视频参数原样传递；同步完成后返回固化 URL。"""
    client, canvas, _, _ = canvas_env
    doc = _create(client)
    captured = {}

    def fake_submit(project_id, **kwargs):
        captured.update({"project_id": project_id, **kwargs})
        return {"id": "job-1", "status": "pending", "model": kwargs["model"]}

    def fake_sync(project_id, job_id):
        assert project_id == doc["canvas_id"]
        assert job_id == "job-1"
        return {"id": job_id, "status": "completed", "url": "/uploads/production/final.mp4"}

    monkeypatch.setattr(canvas.openrouter_media, "submit_video", fake_submit)
    monkeypatch.setattr(canvas.openrouter_media, "sync_video", fake_sync)

    submitted = client.post(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}/video",
        json={
            "model": "video/model",
            "prompt": "角色转身看向镜头",
            "duration": 8,
            "resolution": "1080p",
            "aspect_ratio": "16:9",
            "image_url": "/uploads/canvas/frame.png",
            "generate_audio": False,
        },
    )
    assert submitted.status_code == 200, submitted.text
    assert submitted.json()["data"]["job"]["id"] == "job-1"
    assert captured == {
        "project_id": doc["canvas_id"],
        "model": "video/model",
        "prompt": "角色转身看向镜头",
        "duration": 8,
        "resolution": "1080p",
        "aspect_ratio": "16:9",
        "image_url": "/uploads/canvas/frame.png",
        "generate_audio": False,
    }

    synced = client.post(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}/video/job-1/sync"
    )
    assert synced.status_code == 200
    assert synced.json()["data"]["job"]["status"] == "completed"


def test_canvas_compose_preserves_manual_order(canvas_env, monkeypatch):
    """合成顺序完全由画布提交决定，后端不得自行重排镜头。"""
    client, canvas, _, _ = canvas_env
    doc = _create(client)
    captured = {}

    def fake_compose(project_id, video_urls, aspect_ratio):
        captured.update({
            "project_id": project_id,
            "video_urls": video_urls,
            "aspect_ratio": aspect_ratio,
        })
        return {"url": "/uploads/production/cut.mp4", "clipCount": len(video_urls)}

    monkeypatch.setattr(canvas.openrouter_media, "compose_video", fake_compose)
    urls = ["/uploads/canvas/shot-b.mp4", "/uploads/canvas/shot-a.mp4"]
    saved = client.put(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}",
        json={
            "base_revision": 0,
            "nodes": [
                {
                    "node_id": f"v{index}",
                    "type": "video",
                    "data": {"url": url, "stage": "vid_gen", "reviewStatus": "approved"},
                }
                for index, url in enumerate(urls)
            ],
            "edges": [],
        },
    )
    assert saved.status_code == 200
    response = client.post(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}/compose",
        json={"video_urls": urls, "aspect_ratio": "9:16"},
    )
    assert response.status_code == 200, response.text
    assert captured["video_urls"] == urls
    assert response.json()["data"]["clipCount"] == 2


def test_canvas_compose_rejects_unapproved_video(canvas_env, monkeypatch):
    """即使绕过前端直接调用 API，草稿视频也不能进入成片。"""
    client, canvas, _, _ = canvas_env
    doc = _create(client)
    url = "/uploads/canvas/draft.mp4"
    client.put(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}",
        json={
            "base_revision": 0,
            "nodes": [{
                "node_id": "draft-video",
                "type": "video",
                "data": {"url": url, "stage": "vid_gen", "reviewStatus": "review"},
            }],
            "edges": [],
        },
    )
    monkeypatch.setattr(canvas.openrouter_media, "compose_video", lambda *args, **kwargs: pytest.fail("不应调用合成"))
    response = client.post(
        f"/api/v1/agentapp/canvas/canvases/{doc['canvas_id']}/compose",
        json={"video_urls": [url], "aspect_ratio": "9:16"},
    )
    assert response.status_code == 400
    assert "已通过" in str(response.json())
