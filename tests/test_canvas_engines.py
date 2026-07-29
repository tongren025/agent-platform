"""第三方画布引擎文档接口测试。"""

from __future__ import annotations

from fastapi import HTTPException
import pytest

from app.api import canvas


def test_canvas_engine_document_round_trip(tmp_path, monkeypatch):
    monkeypatch.setattr(canvas, "ENGINE_DIR", tmp_path)

    empty = canvas.get_canvas_engine("excalidraw")
    assert empty["data"]["engine"] == "excalidraw"
    assert empty["data"]["content"] == {}

    saved = canvas.save_canvas_engine(
        "excalidraw",
        canvas.SaveCanvasEngineReq(content={"elements": [{"id": "shape-1"}]}),
    )
    assert saved["data"]["updated_at"]

    loaded = canvas.get_canvas_engine("excalidraw")
    assert loaded["data"]["content"]["elements"] == [{"id": "shape-1"}]


@pytest.mark.parametrize("engine", ["", "../secret", "folder/name", r"folder\name"])
def test_canvas_engine_rejects_unsafe_key(tmp_path, monkeypatch, engine):
    monkeypatch.setattr(canvas, "ENGINE_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc:
        canvas.get_canvas_engine(engine)

    assert exc.value.status_code == 400


def test_nomi_model_catalog_maps_platform_media_models(monkeypatch):
    monkeypatch.setattr(
        canvas.openrouter_media,
        "list_media_models",
        lambda kind: [{
            "id": "vendor/image-model",
            "name": "Image Model",
            "description": "test",
            "inputModalities": ["text"],
            "outputModalities": [kind],
            "supportedParameters": {"aspect_ratio": ["9:16"]},
            "supportedResolutions": ["1024x1536"],
            "supportedAspectRatios": ["9:16"],
            "recommended": True,
        }],
    )

    result = canvas.list_nomi_models("image")

    assert result["code"] == 200
    assert result["data"][0]["modelKey"] == "vendor/image-model"
    assert result["data"][0]["vendorKey"] == "openrouter"
    assert result["data"][0]["labelZh"] == "Image Model"
    assert result["data"][0]["kind"] == "image"
    assert result["data"][0]["enabled"] is True
    assert result["data"][0]["meta"]["supportedAspectRatios"] == ["9:16"]


def test_nomi_image_task_uses_platform_image_service(monkeypatch):
    captured = {}

    def fake_generate(prompt, model, size):
        captured.update(prompt=prompt, model=model, size=size)
        return {"url": "/generated/shot.png", "provider": "openrouter"}

    monkeypatch.setattr(canvas, "generate_image_to_local", fake_generate)

    result = canvas.run_nomi_task(canvas.NomiTaskReq(
        kind="text_to_image",
        prompt="竖屏雨夜街道",
        width=1024,
        height=1536,
        extras={"modelKey": "vendor/image-model", "projectId": "demo/project"},
    ))

    assert captured == {
        "prompt": "竖屏雨夜街道",
        "model": "openrouter:vendor/image-model",
        "size": "1024x1536",
    }
    assert result["data"]["status"] == "succeeded"
    assert result["data"]["assets"] == [{"type": "image", "url": "/generated/shot.png"}]


def test_nomi_video_task_submit_and_poll(monkeypatch):
    captured = {}

    def fake_submit(project_id, **kwargs):
        captured.update(project_id=project_id, **kwargs)
        return {"id": "job-123", "status": "pending"}

    monkeypatch.setattr(canvas.openrouter_media, "submit_video", fake_submit)
    monkeypatch.setattr(
        canvas.openrouter_media,
        "sync_video",
        lambda project_id, task_id: {
            "id": task_id,
            "status": "completed",
            "url": f"/generated/{project_id}.mp4",
        },
    )

    submitted = canvas.run_nomi_task(canvas.NomiTaskReq(
        kind="image_to_video",
        prompt="人物向镜头走来",
        extras={
            "modelKey": "vendor/video-model",
            "projectId": "demo/project",
            "firstFrameUrl": "/generated/frame.png",
            "duration": 8,
            "aspectRatio": "9:16",
        },
    ))
    polled = canvas.get_nomi_task("job-123", "image_to_video", "demoproject")

    assert submitted["data"]["id"] == "job-123"
    assert captured["project_id"] == "demoproject"
    assert captured["image_url"] == "/generated/frame.png"
    assert captured["duration"] == 8
    assert polled["data"]["result"]["status"] == "succeeded"
    assert polled["data"]["result"]["assets"][0]["url"] == "/generated/demoproject.mp4"
