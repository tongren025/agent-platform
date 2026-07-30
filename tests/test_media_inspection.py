"""真实媒体证据进入视觉模型的契约测试。"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.services import media_inspection


def test_image_inspection_embeds_platform_asset_and_keeps_reasoning(
    tmp_path,
    monkeypatch,
):
    image_path = tmp_path / "approved.png"
    image_path.write_bytes(b"approved-image")
    captured = {}

    class Responses:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                output_text=(
                    '{"visual_inspection":{"verdict":"pass",'
                    '"checks":[],"summary":"ok"}}'
                )
            )

    client = SimpleNamespace(
        responses=Responses()
    )
    monkeypatch.setattr(
        media_inspection.openrouter_media,
        "resolve_upload_path",
        lambda _url: image_path,
    )
    monkeypatch.setattr(
        media_inspection.ai_service,
        "get_client",
        lambda _model: (client, "gpt-5.6-sol"),
    )

    result = media_inspection.inspect_media(
        model="gpt-5.6-sol",
        reasoning_effort="high",
        media_urls=["/uploads/canvas/approved.png"],
        inspection_type="image",
        criteria="角色脸型与服装必须匹配 C001",
    )

    visual_content = captured["input"][0]["content"][1]
    assert visual_content["image_url"].startswith(
        "data:image/png;base64,"
    )
    assert visual_content["type"] == "input_image"
    assert captured["reasoning"] == {"effort": "high"}
    assert captured["max_output_tokens"] == 4096
    assert "messages" not in captured
    assert result["visualInputCount"] == 1
    assert result["report"]["visual_inspection"]["verdict"] == "pass"


def test_video_inspection_rejects_remote_video_without_local_frames(
    monkeypatch,
):
    monkeypatch.setattr(
        media_inspection.openrouter_media,
        "resolve_upload_path",
        lambda _url: None,
    )

    with pytest.raises(ValueError, match="/uploads/"):
        media_inspection.inspect_media(
            model="gpt-5.6-sol",
            reasoning_effort="high",
            media_urls=["https://example.test/movie.mp4"],
            inspection_type="video",
            criteria="动作连续",
        )
