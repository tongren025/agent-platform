"""平台原生画布接口测试。"""

from __future__ import annotations

import io

from fastapi import HTTPException
from starlette.datastructures import UploadFile
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


def test_image_model_catalog_maps_platform_media_models(monkeypatch):
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "list_canvas_models",
        lambda kind: [{
            "modelKey": "vendor/image-model",
            "vendorKey": "openrouter",
            "labelZh": "Image Model",
            "enabled": True,
            "pricing": {"cost": 1},
            "meta": {"supportedParameters": {"aspect_ratio": ["9:16"]}},
        }],
    )

    result = canvas.list_image_models()

    assert result["code"] == 200
    assert result["data"][0]["modelId"] == "openrouter:vendor/image-model"
    assert result["data"][0]["actualModelId"] == "vendor/image-model"
    assert result["data"][0]["modelName"] == "Image Model"
    assert result["data"][0]["provider"] == "openrouter"


def test_canvas_image_generation_uses_platform_service(tmp_path, monkeypatch):
    captured = {}
    monkeypatch.setattr(canvas, "DATA_DIR", tmp_path)

    def fake_generate(prompt, model, size):
        captured.update(prompt=prompt, model=model, size=size)
        return {"url": "/generated/shot.png", "provider": "openrouter"}

    monkeypatch.setattr(canvas, "generate_image_to_local", fake_generate)
    canvas._save(canvas.CanvasDoc(canvas_id="demo", created_at=canvas._now(), updated_at=canvas._now()))

    result = canvas.generate_image("demo", canvas.GenerateReq(
        prompt="竖屏雨夜街道",
        model="openrouter:vendor/image-model",
        size="1024x1536",
    ))

    assert captured == {
        "prompt": "竖屏雨夜街道",
        "model": "openrouter:vendor/image-model",
        "size": "1024x1536",
    }
    assert result["data"] == {"url": "/generated/shot.png", "provider": "openrouter"}


def test_workbench_project_round_trip_uses_server_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(canvas, "WORKBENCH_DIR", tmp_path)
    production_dir = tmp_path / "production"
    production_dir.mkdir()
    monkeypatch.setattr(canvas, "PRODUCTION_DIR", production_dir)
    record = {
        "id": "project-1",
        "name": "平台画布项目",
        "createdAt": 100,
        "updatedAt": 200,
        "revision": 3,
        "canvas": {"nodes": [{"id": "shot-1", "type": "image"}], "edges": []},
        "timeline": {"tracks": []},
    }

    saved = canvas.save_workbench_project("project-1", record)
    assert saved["data"] == record
    assert canvas.get_workbench_project("project-1")["data"]["canvas"]["nodes"][0]["id"] == "shot-1"
    assert canvas.list_workbench_projects()["data"] == [{
        "id": "project-1",
        "name": "平台画布项目",
        "createdAt": 100,
        "updatedAt": 200,
        "revision": 3,
    }]

    assert canvas.delete_workbench_project("project-1")["data"] is True
    with pytest.raises(HTTPException) as exc:
        canvas.get_workbench_project("project-1")
    assert exc.value.status_code == 404


def test_workbench_project_rejects_mismatched_id(tmp_path, monkeypatch):
    monkeypatch.setattr(canvas, "WORKBENCH_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc:
        canvas.save_workbench_project("project-1", {"id": "project-2"})

    assert exc.value.status_code == 400


def test_workbench_model_catalog_maps_platform_media_models(monkeypatch):
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "list_canvas_models",
        lambda kind: [{
            "modelKey": f"vendor/{kind}-model",
            "vendorKey": "openrouter",
            "modelAlias": f"vendor/{kind}-model",
            "labelZh": f"{kind.title()} Model",
            "kind": kind,
            "enabled": True,
            "meta": {"recommended": True},
        }],
    )

    result = canvas.list_workbench_models("video")

    assert result["code"] == 200
    assert result["data"][0]["modelKey"] == "vendor/video-model"
    assert result["data"][0]["vendorKey"] == "openrouter"
    assert result["data"][0]["kind"] == "video"
    assert result["data"][0]["meta"]["recommended"] is True


def test_workbench_image_task_uses_platform_image_service(monkeypatch):
    captured = {}

    def fake_generate(prompt, model, size):
        captured.update(prompt=prompt, model=model, size=size)
        return {"url": "/uploads/canvas/result.png"}

    monkeypatch.setattr(canvas, "generate_image_to_local", fake_generate)
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "find_canvas_model",
        lambda vendor, model, kind: {"vendorKey": vendor, "modelKey": model, "kind": kind},
    )
    result = canvas.run_workbench_task(canvas.WorkbenchTaskReq(
        kind="text_to_image",
        prompt="雨夜街道",
        width=1024,
        height=1536,
        extras={"projectId": "canvas-demo", "modelKey": "vendor/image-model"},
    ))

    assert captured == {
        "prompt": "雨夜街道",
        "model": "openrouter:vendor/image-model",
        "size": "1024x1536",
    }
    assert result["data"]["status"] == "succeeded"
    assert result["data"]["assets"] == [{"type": "image", "url": "/uploads/canvas/result.png"}]


def test_workbench_video_task_submit_and_poll_platform_service(monkeypatch):
    captured = {}

    def fake_submit(project_id, **kwargs):
        captured.update(project_id=project_id, **kwargs)
        return {"id": "video-job-1", "status": "queued"}

    monkeypatch.setattr(canvas.openrouter_media, "submit_video", fake_submit)
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "find_canvas_model",
        lambda vendor, model, kind: {"vendorKey": vendor, "modelKey": model, "kind": kind},
    )
    monkeypatch.setattr(
        canvas.openrouter_media,
        "sync_video",
        lambda project_id, job_id, **kwargs: {
            "id": job_id,
            "status": "completed",
            "url": f"/uploads/director/{project_id}/result.mp4",
        },
    )

    submitted = canvas.run_workbench_task(canvas.WorkbenchTaskReq(
        kind="image_to_video",
        prompt="镜头缓慢推进",
        extras={
            "projectId": "../unsafe project",
            "modelKey": "vendor/video-model",
            "firstFrameUrl": "/uploads/canvas/frame.png",
            "duration": 8,
            "resolution": "1080p",
            "aspectRatio": "16:9",
            "generateAudio": False,
        },
    ))

    assert submitted["data"]["id"] == "video-job-1"
    assert submitted["data"]["status"] == "running"
    assert captured["project_id"] == "unsafeproject"
    assert captured["model"] == "vendor/video-model"
    assert captured["provider"] == "openrouter"
    assert captured["image_url"] == "/uploads/canvas/frame.png"
    assert captured["generate_audio"] is False

    polled = canvas.get_workbench_task(
        "video-job-1",
        kind="image_to_video",
        project_id=captured["project_id"],
    )
    assert polled["data"]["result"]["status"] == "succeeded"
    assert polled["data"]["result"]["assets"][0]["url"].endswith("/result.mp4")


def test_workbench_lists_and_imports_existing_production_project(tmp_path, monkeypatch):
    workbench_dir = tmp_path / "workbench"
    production_dir = tmp_path / "production"
    project_dir = production_dir / "story-1"
    workbench_dir.mkdir()
    project_dir.mkdir(parents=True)
    (project_dir / "project.json").write_text(
        """{
          "project_id": "story-1",
          "name": "已有漫剧",
          "description": "继续完成这一季",
          "created_at": "2026-07-01T00:00:00+00:00",
          "updated_at": "2026-07-02T00:00:00+00:00"
        }""",
        "utf-8",
    )
    (project_dir / "cards.json").write_text(
        """[
          {
            "card_id": "shot-1",
            "project_id": "story-1",
            "stage": "storyboard",
            "title": "第一镜",
            "content": "主角推门进入雨巷",
            "prompts": ["雨夜巷口"],
            "images": ["/uploads/production/story-1/shot.png"],
            "videos": [],
            "shot_number": 1,
            "created_at": "2026-07-02T00:00:00+00:00",
            "updated_at": "2026-07-02T00:00:00+00:00"
          }
        ]""",
        "utf-8",
    )
    monkeypatch.setattr(canvas, "WORKBENCH_DIR", workbench_dir)
    monkeypatch.setattr(canvas, "PRODUCTION_DIR", production_dir)

    listed = canvas.list_workbench_projects()["data"]
    assert [(item["id"], item["name"]) for item in listed] == [("story-1", "已有漫剧")]

    imported = canvas.get_workbench_project("story-1")["data"]
    nodes = imported["payload"]["generationCanvas"]["nodes"]
    assert imported["id"] == "story-1"
    assert nodes[0]["meta"]["productionCardId"] == "shot-1"
    assert nodes[0]["result"]["url"].endswith("/shot.png")
    assert (workbench_dir / "story-1.json").exists()

    assets = canvas.list_workbench_assets("story-1")["data"]["items"]
    assert assets[0]["data"]["url"].endswith("/shot.png")


@pytest.mark.asyncio
async def test_workbench_asset_upload_and_remote_reference(tmp_path, monkeypatch):
    asset_dir = tmp_path / "indexes"
    upload_dir = tmp_path / "uploads"
    asset_dir.mkdir()
    upload_dir.mkdir()
    monkeypatch.setattr(canvas, "WORKBENCH_ASSET_DIR", asset_dir)
    monkeypatch.setattr(canvas, "UPLOAD_DIR", upload_dir)

    uploaded = await canvas.upload_workbench_asset(
        "project-1",
        UploadFile(
            filename="镜头首帧.png",
            file=io.BytesIO(b"\x89PNG\r\n\x1a\nimage"),
            headers={"content-type": "image/png"},
        ),
    )
    assert uploaded["data"]["projectId"] == "project-1"
    assert uploaded["data"]["data"]["url"].startswith("/uploads/canvas/asset_")
    assert len(list(upload_dir.glob("*.png"))) == 1

    remote = canvas.import_workbench_remote_asset(
        "project-1",
        canvas.WorkbenchRemoteAssetReq(
            url="https://cdn.example.com/reference.jpg",
            name="角色参考",
            ownerNodeId="node-1",
        ),
    )
    assert remote["data"]["data"]["ownerNodeId"] == "node-1"

    listed = canvas.list_workbench_assets("project-1")
    assert [item["name"] for item in listed["data"]["items"]] == ["角色参考", "镜头首帧.png"]


def test_workbench_remote_asset_rejects_unsafe_scheme(tmp_path, monkeypatch):
    monkeypatch.setattr(canvas, "WORKBENCH_ASSET_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc:
        canvas.import_workbench_remote_asset(
            "project-1",
            canvas.WorkbenchRemoteAssetReq(url="file:///etc/passwd"),
        )

    assert exc.value.status_code == 400
