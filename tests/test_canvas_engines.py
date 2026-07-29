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
