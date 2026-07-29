"""平台原生画布接口测试。"""

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


def test_image_model_catalog_maps_platform_media_models(monkeypatch):
    monkeypatch.setattr(
        canvas.openrouter_media,
        "list_media_models",
        lambda kind: [{
            "id": "vendor/image-model",
            "name": "Image Model",
            "description": "test",
            "pricing": {"prompt": "0", "image": "0.01"},
            "isFree": False,
            "inputModalities": ["text"],
            "outputModalities": [kind],
            "supportedParameters": {"aspect_ratio": ["9:16"]},
            "supportedResolutions": ["1024x1536"],
            "supportedAspectRatios": ["9:16"],
            "recommended": True,
            "recommendationReason": "适合画布生图",
        }],
    )

    result = canvas.list_image_models()

    assert result["code"] == 200
    assert result["data"][0]["modelId"] == "openrouter:vendor/image-model"
    assert result["data"][0]["actualModelId"] == "vendor/image-model"
    assert result["data"][0]["modelName"] == "Image Model"
    assert result["data"][0]["recommended"] is True


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
