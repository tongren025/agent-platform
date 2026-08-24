"""OpenRouter 媒体服务的本地参考图请求契约。"""

from __future__ import annotations

import base64

import pytest

from app.services import openrouter_media
from app.services import image_generation
from app.api import canvas


class FakeResponse:
    def __init__(self, body: dict):
        self._body = body

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return self._body


def test_list_image_models_marks_paid_and_recommends_low_cost_model(monkeypatch):
    """文本 token 免费不等于图片免费，且角色一致性模型应排在默认首位。"""
    image_models = {
        "data": [
            {
                "id": "expensive/new-image",
                "name": "Newest Image",
                "architecture": {"output_modalities": ["image"]},
            },
            {
                "id": openrouter_media.RECOMMENDED_IMAGE_MODEL,
                "name": "Recommended Image",
                "architecture": {
                    "input_modalities": ["text", "image"],
                    "output_modalities": ["image"],
                },
                "supported_parameters": {
                    "aspect_ratio": {"values": ["9:16"]},
                    "input_references": {"max": 14},
                },
            },
        ]
    }
    catalog = {
        "data": [
            {
                "id": "expensive/new-image",
                "pricing": {"prompt": "0", "completion": "0", "image_output": "0.1"},
            },
            {
                "id": openrouter_media.RECOMMENDED_IMAGE_MODEL,
                "pricing": {"prompt": "0", "completion": "0", "image_output": "0.00003"},
            },
        ]
    }

    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )

    def fake_get(url, **_kwargs):
        return FakeResponse(catalog if url.endswith("/models") else image_models)

    monkeypatch.setattr(openrouter_media.httpx, "get", fake_get)
    models = openrouter_media.list_media_models("image")

    assert models[0]["id"] == openrouter_media.RECOMMENDED_IMAGE_MODEL
    assert models[0]["recommended"] is True
    assert models[0]["isFree"] is False
    assert models[1]["isFree"] is False


def test_generic_image_generation_routes_openrouter_models(monkeypatch):
    """带 openrouter 前缀的真实图片模型必须走专用 /images API，而非聊天供应商列表。"""
    captured = {}

    def fake_generate(**kwargs):
        captured.update(kwargs)
        return {
            "content": b"image",
            "suffix": ".png",
            "model": kwargs["model"],
            "usage": {},
        }

    monkeypatch.setattr(openrouter_media, "generate_image_bytes", fake_generate)
    monkeypatch.setattr(
        image_generation,
        "_save_image_bytes",
        lambda content, ext: f"/uploads/canvas/result{ext}",
    )
    result = image_generation.generate_image_to_local(
        "portrait",
        f"openrouter:{openrouter_media.RECOMMENDED_IMAGE_MODEL}",
        "720x1280",
    )

    assert captured["model"] == openrouter_media.RECOMMENDED_IMAGE_MODEL
    assert captured["aspect_ratio"] == "9:16"
    assert captured["resolution"] == "1K"
    assert result["url"] == "/uploads/canvas/result.png"


def test_canvas_image_models_only_returns_configured_media_models(monkeypatch):
    """画布生图下拉框只接受平台已配置图片模型，不读取公共全量目录。"""
    monkeypatch.setattr(
        canvas.canvas_catalog,
        "list_canvas_models",
        lambda kind: [{
            "modelKey": openrouter_media.RECOMMENDED_IMAGE_MODEL,
            "vendorKey": "openrouter",
            "labelZh": "Configured Image",
            "enabled": True,
            "pricing": {"cost": 1},
            "meta": {"supportedParameters": {}},
        }],
    )

    body = canvas.list_image_models()
    models = body["data"]
    assert len(models) == 1
    assert models[0]["modelId"].startswith("openrouter:")
    assert models[0]["actualModelId"] == openrouter_media.RECOMMENDED_IMAGE_MODEL
    assert models[0]["provider"] == "openrouter"


def test_generate_image_encodes_local_input_references(tmp_path, monkeypatch):
    """仓库内角色/场景母版会以 data URL 发送，不泄露本地路径。"""
    reference = tmp_path / "face.png"
    reference.write_bytes(b"approved-face")
    captured = {}

    monkeypatch.setattr(openrouter_media, "BASE_DIR", tmp_path)
    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )
    monkeypatch.setattr(
        openrouter_media,
        "_save_bytes",
        lambda *_args, **_kwargs: "/uploads/production/demo/result.png",
    )

    def fake_post(url, *, headers, json, timeout):
        captured.update({
            "url": url,
            "headers": headers,
            "json": json,
            "timeout": timeout,
        })
        return FakeResponse({
            "data": [{
                "b64_json": base64.b64encode(b"result").decode("ascii"),
                "media_type": "image/png",
            }],
            "usage": {"cost": 0.04},
        })

    monkeypatch.setattr(openrouter_media.httpx, "post", fake_post)
    result = openrouter_media.generate_image(
        "demo",
        model="image-model",
        prompt="identity preserve",
        reference_paths=[reference],
    )

    sent_url = captured["json"]["input_references"][0]["image_url"]["url"]
    assert sent_url.startswith("data:image/png;base64,")
    assert str(reference) not in sent_url
    assert result["usage"]["cost"] == 0.04


def test_submit_video_accepts_local_first_frame(tmp_path, monkeypatch):
    """视频首帧可以来自仓库文件，且会被标成 first_frame。"""
    frame = tmp_path / "frame.png"
    frame.write_bytes(b"approved-frame")
    captured = {}

    monkeypatch.setattr(openrouter_media, "BASE_DIR", tmp_path)
    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )

    def fake_post(url, *, headers, json, timeout):
        captured["json"] = json
        return FakeResponse({"id": "job-1", "status": "queued"})

    monkeypatch.setattr(openrouter_media.httpx, "post", fake_post)
    result = openrouter_media.submit_video(
        "demo",
        model="video-model",
        prompt="continue motion",
        image_path=frame,
    )

    first_frame = captured["json"]["frame_images"][0]
    assert first_frame["frame_type"] == "first_frame"
    assert first_frame["image_url"]["url"].startswith(
        "data:image/png;base64,"
    )
    assert result["id"] == "job-1"


def test_submit_video_rejects_two_first_frame_sources(tmp_path):
    frame = tmp_path / "frame.png"
    frame.write_bytes(b"frame")
    with pytest.raises(ValueError, match="只能提供一个"):
        openrouter_media.submit_video(
            "demo",
            model="video-model",
            prompt="continue motion",
            image_url="https://example.test/frame.png",
            image_path=frame,
        )


def test_submit_video_rejects_frames_mixed_with_input_references(monkeypatch):
    """OpenRouter 会让 frame_images 覆盖 input_references，平台必须阻止假一致性。"""
    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )

    with pytest.raises(ValueError, match="不能同时使用"):
        openrouter_media.submit_video(
            "demo",
            model="video-model",
            prompt="continue motion",
            image_url="https://example.test/frame.png",
            reference_urls=["https://example.test/character.png"],
        )
def test_list_video_models_exposes_multimodal_capabilities(monkeypatch):
    """导演台必须拿到时长、首末帧、多模态和原生音频能力。"""
    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )
    monkeypatch.setattr(
        openrouter_media.httpx,
        "get",
        lambda *_args, **_kwargs: FakeResponse({"data": [{
            "id": "bytedance/seedance-2.0",
            "name": "Seedance 2.0",
            "supported_durations": [4, 5, 8, 10, 15],
            "supported_frame_images": ["first_frame", "last_frame"],
            "generate_audio": True,
        }]}),
    )

    model = openrouter_media.list_media_models("video")[0]

    assert model["supportedDurations"][-1] == 15
    assert model["supportedFrameImages"] == ["first_frame", "last_frame"]
    assert model["inputReferenceModalities"] == ["image", "video", "audio"]
    assert model["generateAudio"] is True


def test_submit_video_encodes_local_video_and_audio_references(
    tmp_path,
    monkeypatch,
):
    """项目内的表演视频和对白音频会作为多模态引用提交，不泄露本地路径。"""
    asset_dir = tmp_path / "data" / "production" / "demo" / "uploads"
    asset_dir.mkdir(parents=True)
    (asset_dir / "performance.mp4").write_bytes(b"video")
    (asset_dir / "dialogue.mp3").write_bytes(b"audio")
    captured = {}

    monkeypatch.setattr(openrouter_media, "BASE_DIR", tmp_path)
    monkeypatch.setattr(
        openrouter_media,
        "_openrouter_config",
        lambda: ("https://example.test/api/v1", "secret"),
    )

    def fake_post(_url, *, headers, json, timeout):
        captured["json"] = json
        return FakeResponse({"id": "job-multimodal", "status": "queued"})

    monkeypatch.setattr(openrouter_media.httpx, "post", fake_post)
    prefix = (
        "/api/v1/agentapp/production/resource/production/demo/uploads/"
    )
    result = openrouter_media.submit_video(
        "demo",
        model="bytedance/seedance-2.0",
        prompt="参考表演和声音生成",
        reference_inputs=[
            {"kind": "video", "url": f"{prefix}performance.mp4"},
            {"kind": "audio", "url": f"{prefix}dialogue.mp3"},
        ],
    )

    references = captured["json"]["input_references"]
    assert "frame_images" not in captured["json"]
    assert references[0]["video_url"]["url"].startswith(
        "data:video/mp4;base64,"
    )
    assert references[1]["audio_url"]["url"].startswith(
        "data:audio/mpeg;base64,"
    )
    assert result["generationMode"] == "reference"
    assert result["referenceCount"] == 2
