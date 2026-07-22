"""收件箱回填：文件名解析 + 卡池匹配 + API 端点测试。"""
from __future__ import annotations

import pytest
from app.services.inbox_ingest import parse_inbox_filename, resolve_inbox_target


# ── parse_inbox_filename ──────────────────────────────────────────

class TestParseFilename:
    def test_first_frame(self):
        r = parse_inbox_filename("EP01_G03_首帧_v2.png")
        assert r["ok"]
        assert r["kind"] == "first_frame"
        assert r["episode"] == 1
        assert r["unit"] == 3

    def test_last_frame(self):
        r = parse_inbox_filename("EP01_G05_末帧.png")
        assert r["ok"]
        assert r["kind"] == "last_frame"
        assert r["episode"] == 1
        assert r["unit"] == 5

    def test_storyboard(self):
        r = parse_inbox_filename("EP02_G1_分镜.jpg")
        assert r["ok"]
        assert r["kind"] == "storyboard"
        assert r["episode"] == 2

    def test_video_with_subsegment(self):
        r = parse_inbox_filename("EP01_G1-A.mp4")
        assert r["ok"]
        assert r["kind"] == "video"
        assert r["subsegment"] == "G1-A"

    def test_video_without_subsegment(self):
        r = parse_inbox_filename("EP01_G3.mp4")
        assert r["ok"]
        assert r["kind"] == "video"
        assert r["subsegment"] == ""

    def test_tone_board(self):
        r = parse_inbox_filename("TB1.png")
        assert r["ok"]
        assert r["kind"] == "tone_board"
        assert r["tone_number"] == 1

    def test_default_episode(self):
        r = parse_inbox_filename("G3_首帧.png", default_episode=5)
        assert r["ok"]
        assert r["episode"] == 5

    def test_no_episode_no_default(self):
        r = parse_inbox_filename("G3_首帧.png")
        assert not r["ok"]
        assert "集数" in r["reason"]

    def test_no_unit(self):
        r = parse_inbox_filename("EP01_首帧.png")
        assert not r["ok"]
        assert "G 单元号" in r["reason"]

    def test_unsupported_ext(self):
        r = parse_inbox_filename("EP01_G1.pdf")
        assert not r["ok"]
        assert "不支持" in r["reason"]

    def test_g1_final_not_subsegment(self):
        """G1_final.mp4 的 'f' 不能被误判为子段标签。"""
        r = parse_inbox_filename("EP01_G1_final.mp4")
        assert r["ok"]
        assert r["subsegment"] == ""


# ── resolve_inbox_target ──────────────────────────────────────────

class _Card:
    def __init__(self, **kw):
        for k, v in kw.items():
            setattr(self, k, v)
        self.metadata = kw.get("metadata", {})
        self.title = kw.get("title", "")
        self.images = kw.get("images", [])
        self.videos = kw.get("videos", [])
        self.updated_at = ""


class TestResolveTarget:
    def _pool(self):
        return [
            _Card(card_id="g-tone-01", stage="design", episode=None, shot_number=0, title="基调板·世界树"),
            _Card(card_id="e01-ip01", stage="img_prompt", episode=1, shot_number=1, title="G1 首帧"),
            _Card(card_id="e01-ip01-last", stage="img_prompt", episode=1, shot_number=1, title="G1 末帧锁"),
            _Card(card_id="e01-sb01", stage="storyboard", episode=1, shot_number=1, title="G1 故事板"),
            _Card(card_id="e01-vp01-a", stage="vid_prompt", episode=1, shot_number=1,
                  title="G1-A vid", metadata={"subsegment": "G1-A"}),
            _Card(card_id="e01-vp01-b", stage="vid_prompt", episode=1, shot_number=1,
                  title="G1-B vid", metadata={"subsegment": "G1-B"}),
        ]

    def test_tone_board(self):
        card, slot, _ = resolve_inbox_target(self._pool(),
            parse_inbox_filename("TB1.png"))
        assert card.card_id == "g-tone-01"
        assert slot == "images"

    def test_first_frame(self):
        card, slot, _ = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G1_首帧.png"))
        assert card.card_id == "e01-ip01"
        assert slot == "images"

    def test_last_frame(self):
        card, slot, _ = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G1_末帧.png"))
        assert card.card_id == "e01-ip01-last"

    def test_storyboard(self):
        card, slot, _ = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G1_分镜.jpg"))
        assert card.card_id == "e01-sb01"

    def test_video_subsegment(self):
        card, slot, _ = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G1-B.mp4"))
        assert card.card_id == "e01-vp01-b"
        assert slot == "videos"

    def test_video_ambiguous_requires_subsegment(self):
        card, _, reason = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G1.mp4"))
        assert card is None
        assert "子段标签" in reason

    def test_missing_unit(self):
        card, _, reason = resolve_inbox_target(self._pool(),
            parse_inbox_filename("EP01_G9_首帧.png"))
        assert card is None
        assert "G9" in reason

    def test_last_frame_no_flf(self):
        pool = [_Card(card_id="e01-ip02", stage="img_prompt", episode=1, shot_number=2, title="G2 首帧")]
        card, _, reason = resolve_inbox_target(pool,
            parse_inbox_filename("EP01_G2_末帧.png"))
        assert card is None
        assert "末帧" in reason


# ── API 端点 ──────────────────────────────────────────────────────

@pytest.fixture()
def inbox_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据目录，造一个带 G1 首帧卡的项目。"""
    import app.api.production as prod
    monkeypatch.setattr(prod, "DATA_DIR", tmp_path)

    r = app_client.post("/api/v1/agentapp/production/projects", json={"name": "收件箱测试"})
    assert r.status_code == 200, r.text
    pid = r.json()["data"]["project_id"]
    r = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/cards", json={
        "title": "G1 首帧", "content": "test", "stage": "img_prompt",
        "episode": 1, "shot_number": 1,
    })
    assert r.status_code == 200, r.text
    return pid


def test_inbox_upload_matched(app_client, inbox_env):
    pid = inbox_env
    files = [("files", ("EP01_G1_首帧.png", b"\x89PNG fake", "image/png"))]
    resp = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/inbox/upload", files=files)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["matched"]) == 1
    assert data["matched"][0]["slot"] == "images"
    assert data["matched"][0]["card_title"] == "G1 首帧"


def test_inbox_upload_unmatched(app_client, inbox_env):
    pid = inbox_env
    files = [("files", ("random.txt", b"hello", "text/plain"))]
    resp = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/inbox/upload", files=files)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["unmatched"]) == 1
    assert "不支持" in data["unmatched"][0]["reason"]


def test_inbox_upload_empty_file(app_client, inbox_env):
    pid = inbox_env
    files = [("files", ("EP01_G1_首帧.png", b"", "image/png"))]
    resp = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/inbox/upload", files=files)
    data = resp.json()["data"]
    assert len(data["unmatched"]) == 1
    assert "空文件" in data["unmatched"][0]["reason"]


def test_inbox_upload_oversize(app_client, inbox_env, monkeypatch):
    """超过 per-file 上限的文件应拒绝。"""
    import app.api.production as prod
    monkeypatch.setattr(prod, "INBOX_MAX_FILE_BYTES", 16)
    pid = inbox_env
    files = [("files", ("EP01_G1_首帧.png", b"\x89PNG" + b"x" * 20, "image/png"))]
    resp = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/inbox/upload", files=files)
    data = resp.json()["data"]
    assert len(data["unmatched"]) == 1
    assert "上限" in data["unmatched"][0]["reason"]


def test_inbox_default_episode(app_client, inbox_env):
    pid = inbox_env
    files = [("files", ("G1_首帧.png", b"\x89PNG data", "image/png"))]
    resp = app_client.post(
        f"/api/v1/agentapp/production/projects/{pid}/inbox/upload?default_episode=1",
        files=files,
    )
    data = resp.json()["data"]
    assert len(data["matched"]) == 1
