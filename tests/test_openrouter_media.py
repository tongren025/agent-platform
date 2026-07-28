"""OpenRouter 媒体服务的本地参考图请求契约。"""

from __future__ import annotations

import base64

import pytest

from app.services import openrouter_media


class FakeResponse:
    def __init__(self, body: dict):
        self._body = body

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return self._body


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
