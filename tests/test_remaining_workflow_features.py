"""制作闭环剩余能力：排序、版本、批注、导出、快捷指令与并发合并回归。"""
from __future__ import annotations

import io
import json
import tempfile as stdlib_tempfile
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def feature_env(tmp_path, monkeypatch, app_client):
    """隔离制作数据和常用指令数据，不触碰仓库内真实运行数据。"""
    import app.api.production as production
    import app.api.quick_prompts as quick_prompts

    production_dir = tmp_path / "production"
    production_dir.mkdir()
    monkeypatch.setattr(production, "DATA_DIR", production_dir)
    monkeypatch.setattr(quick_prompts, "DATA_DIR", tmp_path / "quick-prompts")
    return app_client, production_dir


def _create_project(client, name: str = "闭环测试") -> str:
    response = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": name, "source_content": "原始故事"},
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["project_id"]


def _add_card(
    client,
    pid: str,
    *,
    stage: str,
    title: str,
    episode: int | None = 1,
    unit: int = 1,
    content: str = "内容",
    prompts: list[str] | None = None,
    images: list[str] | None = None,
    videos: list[str] | None = None,
    metadata: dict | None = None,
) -> dict:
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": stage,
            "title": title,
            "content": content,
            "episode": episode,
            "shot_number": unit,
            "prompts": prompts or [],
            "images": images or [],
            "videos": videos or [],
            "metadata": metadata or {},
            "status": "done",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


def _project_cards(client, pid: str) -> list[dict]:
    response = client.get(f"/api/v1/agentapp/production/projects/{pid}")
    assert response.status_code == 200, response.text
    return response.json()["data"]["cards"]


def test_reorder_maps_every_stage_and_invalid_request_is_atomic(feature_env):
    """重排映射同集全部阶段；缺号、重复号均不得写盘或创建快照。"""
    client, production_dir = feature_env
    pid = _create_project(client)
    expected: dict[str, int] = {}
    for unit in (1, 2):
        for stage in ("script", "storyboard", "img_prompt", "vid_prompt"):
            card = _add_card(
                client,
                pid,
                stage=stage,
                title=f"G{unit} {stage}",
                unit=unit,
            )
            expected[card["card_id"]] = 3 - unit
    other_episode = _add_card(
        client,
        pid,
        stage="script",
        title="EP2 G1",
        episode=2,
        unit=1,
    )
    stale_project_updated_at = client.get(
        f"/api/v1/agentapp/production/projects/{pid}"
    ).json()["data"]["updated_at"]

    response = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/shots/order",
        json={
            "episode": 1,
            "ordered_units": [2, 1],
            "expected_project_updated_at": stale_project_updated_at,
        },
    )
    assert response.status_code == 200, response.text
    cards = _project_cards(client, pid)
    for card in cards:
        if card["card_id"] in expected:
            assert card["shot_number"] == expected[card["card_id"]]
    assert next(
        card for card in cards if card["card_id"] == other_episode["card_id"]
    )["shot_number"] == 1
    versions = client.get(
        f"/api/v1/agentapp/production/projects/{pid}/versions"
    ).json()["data"]
    assert versions[0]["reason"] == "shot_reorder"

    cards_before = (production_dir / pid / "cards.json").read_bytes()
    version_files_before = sorted((production_dir / pid / "versions").glob("*.json"))
    invalid = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/shots/order",
        json={"episode": 1, "ordered_units": [1, 1]},
    )
    assert invalid.status_code == 400
    assert (production_dir / pid / "cards.json").read_bytes() == cards_before
    assert sorted((production_dir / pid / "versions").glob("*.json")) == version_files_before
    stale = client.put(
        f"/api/v1/agentapp/director/projects/{pid}/shots/order",
        json={
            "episode": 1,
            "ordered_units": [1, 2],
            "expected_project_updated_at": stale_project_updated_at,
        },
    )
    assert stale.status_code == 409


def test_versions_are_unique_and_restore_creates_before_restore(feature_env):
    """自动/手动版本不覆盖；恢复前强制保存当前内容。"""
    client, _ = feature_env
    pid = _create_project(client)
    card = _add_card(
        client,
        pid,
        stage="script",
        title="G1",
        content="第一版",
    )
    changed = client.put(
        f"/api/v1/agentapp/production/cards/{card['card_id']}",
        json={"content": "第二版"},
    )
    assert changed.status_code == 200
    versions = client.get(
        f"/api/v1/agentapp/production/projects/{pid}/versions"
    ).json()["data"]
    automatic = next(item for item in versions if item["reason"] == "card_update")

    manual_one = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions",
        json={"label": "第二版确认", "reason": "manual"},
    ).json()["data"]
    manual_two = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions",
        json={"label": "同内容再打点", "reason": "manual"},
    ).json()["data"]
    assert len({
        automatic["version_id"],
        manual_one["version_id"],
        manual_two["version_id"],
    }) == 3

    client.put(
        f"/api/v1/agentapp/production/cards/{card['card_id']}",
        json={"content": "第三版"},
    )
    restored = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions/"
        f"{automatic['version_id']}/restore"
    )
    assert restored.status_code == 200, restored.text
    restore_data = restored.json()["data"]
    assert restore_data["before_restore_version_id"]
    restored_card = next(
        item for item in _project_cards(client, pid)
        if item["card_id"] == card["card_id"]
    )
    assert restored_card["content"] == "第一版"
    reasons = {
        item["reason"]
        for item in client.get(
            f"/api/v1/agentapp/production/projects/{pid}/versions"
        ).json()["data"]
    }
    assert "before_restore" in reasons


def test_restore_rolls_back_when_second_main_file_write_fails(
    feature_env,
    monkeypatch,
):
    """恢复 cards.json 写失败时 project.json 与 cards.json 都回滚到恢复前。"""
    client, production_dir = feature_env
    import app.api.production as production

    pid = _create_project(client)
    card = _add_card(
        client,
        pid,
        stage="script",
        title="G1",
        content="旧内容",
    )
    version_id = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions",
        json={"label": "旧版本"},
    ).json()["data"]["version_id"]
    client.put(
        f"/api/v1/agentapp/production/cards/{card['card_id']}",
        json={"content": "当前内容"},
    )
    project_path = production_dir / pid / "project.json"
    cards_path = production_dir / pid / "cards.json"
    project_before = project_path.read_bytes()
    cards_before = cards_path.read_bytes()

    def fail_cards_save(*_args, **_kwargs):
        raise OSError("模拟 cards.json 写入失败")

    monkeypatch.setattr(production, "_save_cards", fail_cards_save)
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore"
    )
    assert response.status_code == 500
    assert project_path.read_bytes() == project_before
    assert cards_path.read_bytes() == cards_before


def test_version_hash_uses_raw_payload_and_rejects_corruption(feature_env):
    """旧快照缺少后来默认字段仍可校验；缺字段或篡改内容会被拒绝。"""
    client, production_dir = feature_env
    import app.api.production as production

    pid = _create_project(client)
    _add_card(client, pid, stage="script", title="G1")
    version_id = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions",
        json={"label": "兼容性版本"},
    ).json()["data"]["version_id"]
    path = production_dir / pid / "versions" / f"{version_id}.json"
    payload = json.loads(path.read_text("utf-8"))
    payload["project"].pop("pinned", None)
    payload["cards"][0].pop("negative_prompts", None)
    payload["content_hash"] = production._snapshot_payload_hash(
        payload["project"],
        payload["cards"],
    )
    path.write_text(json.dumps(payload, ensure_ascii=False), "utf-8")
    compatible = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore"
    )
    assert compatible.status_code == 200, compatible.text

    payload["project"]["name"] = "被篡改但未更新指纹"
    path.write_text(json.dumps(payload, ensure_ascii=False), "utf-8")
    corrupted = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore"
    )
    assert corrupted.status_code == 500

    payload.pop("cards")
    path.write_text(json.dumps(payload, ensure_ascii=False), "utf-8")
    missing_cards = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore"
    )
    assert missing_cards.status_code == 500


def test_comments_are_project_scoped_and_resolvable(feature_env):
    """批注校验卡片归属、记录作者，并支持解决/重新显示。"""
    client, _ = feature_env
    pid = _create_project(client, "项目甲")
    card = _add_card(client, pid, stage="storyboard", title="G1 分镜")
    other_pid = _create_project(client, "项目乙")

    created = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card['card_id']}/comments",
        json={"content": "  构图需要更有压迫感  "},
    )
    assert created.status_code == 200, created.text
    comment = created.json()["data"]
    assert comment["content"] == "构图需要更有压迫感"
    assert comment["author"] == "admin"
    listed = client.get(
        f"/api/v1/agentapp/production/projects/{pid}/comments",
        params={"card_id": card["card_id"]},
    ).json()["data"]
    assert [item["id"] for item in listed] == [comment["id"]]

    wrong_project = client.patch(
        f"/api/v1/agentapp/production/projects/{other_pid}/comments/{comment['id']}",
        json={"resolved": True},
    )
    assert wrong_project.status_code == 404
    resolved = client.patch(
        f"/api/v1/agentapp/production/projects/{pid}/comments/{comment['id']}",
        json={"resolved": True},
    )
    assert resolved.status_code == 200
    assert client.get(
        f"/api/v1/agentapp/production/projects/{pid}/comments"
    ).json()["data"] == []
    all_comments = client.get(
        f"/api/v1/agentapp/production/projects/{pid}/comments",
        params={"include_resolved": True},
    ).json()["data"]
    assert all_comments[0]["resolved"] is True


def test_review_rejects_historical_image(feature_env):
    """显式评审旧图返回 409，不能用历史图 verdict 改变当前卡片状态。"""
    client, _ = feature_env
    pid = _create_project(client)
    card = _add_card(
        client,
        pid,
        stage="img_prompt",
        title="G1 首帧",
        images=["/old.png", "/current.png"],
        metadata={"active_image": "/current.png"},
    )
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card['card_id']}/review",
        json={"verdict": "reject", "reason": "tone_off", "image": "/old.png"},
    )
    assert response.status_code == 409
    saved = next(
        item for item in _project_cards(client, pid)
        if item["card_id"] == card["card_id"]
    )
    assert saved["status"] == "done"
    assert saved["metadata"].get("image_reviews") is None


def test_export_zip_has_safe_complete_paths_and_temp_file_is_cleaned(
    feature_env,
    monkeypatch,
    tmp_path,
):
    """导出包含核心 JSON、版本和媒体，ZIP 内无穿越路径且临时包会清理。"""
    client, production_dir = feature_env
    import app.api.production as production

    pid = _create_project(client, '含:非法/字符的项目')
    card = _add_card(client, pid, stage="script", title="G1")
    client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card['card_id']}/comments",
        json={"content": "备份里的批注"},
    )
    client.post(
        f"/api/v1/agentapp/production/projects/{pid}/versions",
        json={"label": "导出版本"},
    )
    uploads = production_dir / pid / "uploads"
    uploads.mkdir()
    (uploads / "frame.png").write_bytes(b"png-data")

    real_mkstemp = stdlib_tempfile.mkstemp
    created_temp_paths: list[Path] = []

    def tracked_mkstemp(*args, **kwargs):
        kwargs["dir"] = tmp_path
        fd, name = real_mkstemp(*args, **kwargs)
        created_temp_paths.append(Path(name))
        return fd, name

    monkeypatch.setattr(production.tempfile, "mkstemp", tracked_mkstemp)
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/export"
    )
    assert response.status_code == 200, response.text
    assert "attachment" in response.headers["content-disposition"]
    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        names = archive.namelist()
        assert {"project.json", "cards.json", "comments.json"} <= set(names)
        assert any(name.startswith("versions/") for name in names)
        assert "uploads/frame.png" in names
        assert all(
            not name.startswith(("/", "\\"))
            and ".." not in Path(name).parts
            for name in names
        )
        comments = json.loads(archive.read("comments.json"))
        assert comments[0]["content"] == "备份里的批注"
    assert created_temp_paths
    assert all(not path.exists() for path in created_temp_paths)


def _account_client(username: str) -> TestClient:
    from admin.auth import issue_token
    from app.main import app

    client = TestClient(app)
    client.headers.update({
        "Authorization": f"Bearer {issue_token(username, 'viewer')}",
    })
    return client


def test_quick_prompts_are_account_scoped_clearable_and_noop_stable(
    feature_env,
    monkeypatch,
):
    """常用指令按账号隔离，员工可清空，重复无变化更新不刷新时间。"""
    _client, _ = feature_env
    from app.dependencies import user_store

    original_get = user_store.get
    original_permissions = user_store.get_permissions

    def fake_get(username):
        if username in {"alice", "bob"}:
            return {
                "username": username,
                "displayName": username,
                "enabled": True,
                "role": "viewer",
            }
        return original_get(username)

    def fake_permissions(username):
        if username in {"alice", "bob"}:
            return ["workbench:use"]
        return original_permissions(username)

    monkeypatch.setattr(user_store, "get", fake_get)
    monkeypatch.setattr(user_store, "get_permissions", fake_permissions)
    alice = _account_client("alice")
    bob = _account_client("bob")
    created = alice.post(
        "/api/v1/agentapp/quick-prompts",
        json={
            "title": "润色台词",
            "content": "把这段台词改得更口语化",
            "employee_key": "writer",
        },
    )
    assert created.status_code == 200, created.text
    item = created.json()["data"]
    assert bob.get("/api/v1/agentapp/quick-prompts").json()["data"] == []
    assert bob.put(
        f"/api/v1/agentapp/quick-prompts/{item['id']}",
        json={"title": "越权"},
    ).status_code == 404

    cleared = alice.put(
        f"/api/v1/agentapp/quick-prompts/{item['id']}",
        json={"employee_key": ""},
    ).json()["data"]
    assert cleared["employee_key"] == ""
    unchanged = alice.put(
        f"/api/v1/agentapp/quick-prompts/{item['id']}",
        json={"employee_key": ""},
    ).json()["data"]
    assert unchanged["updated_at"] == cleared["updated_at"]


def test_viewer_cannot_export_whole_project(feature_env, monkeypatch):
    """项目整包导出使用 POST，普通 viewer 不可绕过前端直接下载。"""
    admin_client, _ = feature_env
    from app.dependencies import user_store

    pid = _create_project(admin_client)
    original_get = user_store.get
    original_permissions = user_store.get_permissions
    monkeypatch.setattr(
        user_store,
        "get",
        lambda username: (
            {
                "username": username,
                "displayName": username,
                "enabled": True,
                "role": "viewer",
            }
            if username == "viewer-export"
            else original_get(username)
        ),
    )
    monkeypatch.setattr(
        user_store,
        "get_permissions",
        lambda username: (
            ["workbench:use"]
            if username == "viewer-export"
            else original_permissions(username)
        ),
    )
    viewer = _account_client("viewer-export")
    response = viewer.post(
        f"/api/v1/agentapp/production/projects/{pid}/export"
    )
    assert response.status_code == 403


def test_generate_reload_preserves_edits_made_while_ai_is_running(
    feature_env,
    monkeypatch,
):
    """AI await 期间发生的卡片编辑不会被调用前的 cards 旧副本覆盖。"""
    client, _ = feature_env
    import app.api.production as production

    pid = _create_project(client)
    source = _add_card(
        client,
        pid,
        stage="idea",
        title="素材卡",
        episode=None,
        unit=0,
        content="初始内容",
    )

    async def fake_invocation(_req):
        production.update_card(
            source["card_id"],
            production.UpdateCardReq(content="等待期间的编辑"),
        )
        production.add_card(
            pid,
            production.CreateCardReq(
                stage="idea",
                title="等待期间新增",
                content="不能丢",
            ),
        )
        return SimpleNamespace(
            success=True,
            assistant_message="G1 新剧本\n生成内容",
            error_message=None,
        )

    monkeypatch.setattr(production, "run_invocation", fake_invocation)
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={
            "target_stage": "script",
            "employee_key": "writer",
            "mode": "append",
        },
    )
    assert response.status_code == 200, response.text
    cards = _project_cards(client, pid)
    assert next(
        item for item in cards if item["card_id"] == source["card_id"]
    )["content"] == "等待期间的编辑"
    assert any(item["title"] == "等待期间新增" for item in cards)


def test_late_image_does_not_replace_new_prompt_current_image(
    feature_env,
    monkeypatch,
):
    """生图期间提示词变化时，晚到图片只进 late 记录，不成为当前图。"""
    client, _ = feature_env
    import app.api.director as director

    pid = _create_project(client)
    card = _add_card(
        client,
        pid,
        stage="img_prompt",
        title="G1 首帧",
        prompts=["旧提示"],
    )

    def fake_generate(*_args, **_kwargs):
        director.update_director_image_prompt(
            pid,
            card["card_id"],
            director.ImagePromptUpdateReq(prompt="新提示"),
        )
        return {
            "url": f"/uploads/production/{pid}/late.png",
            "model": "image-model",
            "usage": {},
        }

    monkeypatch.setattr(director.openrouter_media, "generate_image", fake_generate)
    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/cards/{card['card_id']}/image",
        json={"model": "image-model"},
    )
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["applied"] is False
    assert data["stale"] is True
    saved = next(
        item for item in _project_cards(client, pid)
        if item["card_id"] == card["card_id"]
    )
    assert saved["prompts"][0] == "新提示"
    assert saved["images"] == []
    assert saved["metadata"]["late_image_results"][0]["url"].endswith("late.png")
    state = client.get(
        f"/api/v1/agentapp/director/projects/{pid}"
    ).json()["data"]
    assert state["shots"][0]["imageUrl"] == ""


def test_compose_rejects_changed_inputs_and_cleans_orphan_result(
    feature_env,
    monkeypatch,
    tmp_path,
):
    """FFmpeg 期间输入签名变化时不挂 final，并清理本次孤儿成片。"""
    client, _ = feature_env
    import app.api.director as director
    import app.api.production as production

    pid = _create_project(client)
    image_url = f"/uploads/production/{pid}/image.png"
    video_url = f"/uploads/production/{pid}/shot.mp4"
    _add_card(
        client,
        pid,
        stage="script",
        title="G1 剧本",
        unit=1,
    )
    _add_card(
        client,
        pid,
        stage="storyboard",
        title="G1 分镜",
        unit=1,
    )
    _add_card(
        client,
        pid,
        stage="img_prompt",
        title="G1 首帧",
        unit=1,
        prompts=["图片提示"],
        images=[image_url],
        metadata={"active_image": image_url, "last_image_prompt": "图片提示"},
    )
    video_card = _add_card(
        client,
        pid,
        stage="vid_prompt",
        title="G1 视频",
        unit=1,
        prompts=["视频提示"],
        videos=[video_url],
        metadata={
            "active_video": video_url,
            "openrouter_video_job": {
                "id": "job-1",
                "status": "completed",
                "prompt": "视频提示",
                "imageUrl": image_url,
            },
        },
    )
    orphan = tmp_path / "orphan-final.mp4"

    def fake_compose(*_args, **_kwargs):
        orphan.write_bytes(b"video")
        production.update_card(
            video_card["card_id"],
            production.UpdateCardReq(status="review"),
        )
        return {
            "url": f"/uploads/production/{pid}/orphan-final.mp4",
            "clipCount": 1,
        }

    monkeypatch.setattr(director.openrouter_media, "compose_video", fake_compose)
    monkeypatch.setattr(
        director.openrouter_media,
        "local_video_path",
        lambda _url: orphan,
    )
    response = client.post(
        f"/api/v1/agentapp/director/projects/{pid}/compose"
    )
    assert response.status_code == 409
    assert not orphan.exists()
    assert not any(card["stage"] == "final" for card in _project_cards(client, pid))
