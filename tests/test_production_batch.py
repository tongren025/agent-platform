"""批量卡片操作必须整批校验，并保留未知 ID 静默跳过的接口约定。"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


class _BatchUserStore:
    """测试只使用具有生产权限的普通成员，避免管理员绕过成员校验。"""

    def get(self, username: str):
        return {"username": username, "enabled": True, "role": "editor"}

    def get_permissions(self, username: str):
        return ["production:manage"]


@pytest.fixture
def batch_env(tmp_path, monkeypatch):
    import app.api.production as production
    import app.dependencies as dependencies
    from admin.auth import issue_token
    from app.main import app
    from app.models.production import ProductionCard, ProductionProject, ProjectMember

    monkeypatch.setattr(production, "DATA_DIR", tmp_path)
    monkeypatch.setattr(dependencies, "user_store", _BatchUserStore())

    def seed(pid, *, member="alice", **card_fields):
        project = ProductionProject(
            project_id=pid,
            name=pid,
            members=[ProjectMember(user_id=member, role="owner")],
        )
        card = ProductionCard(
            project_id=pid,
            card_id=f"{pid}-card",
            stage="img_gen",
            status="review",
            updated_at="original-time",
            **card_fields,
        )
        production._save_project(project)
        production._save_cards(pid, [card])
        return card.card_id

    headers = {"Authorization": f"Bearer {issue_token('alice', 'editor')}"}
    # 不进入应用 lifespan，避免本接口回归启动真实调度器或执行启动迁移。
    client = TestClient(app, headers=headers)
    try:
        yield client, production, seed
    finally:
        client.close()


def _card_files(production):
    return {
        path: path.read_bytes()
        for path in production.DATA_DIR.glob("*/cards.json")
    }


@pytest.mark.parametrize("media", ["image", "video"])
@pytest.mark.parametrize("review", [None, {"verdict": "reject"}, {
    "verdict": "pass", "quality": {"passed": False},
}])
def test_batch_done_checks_every_project_before_any_write(batch_env, media, review):
    """第二个项目未验收时，前一个合法项目也不能提前写成 done。"""
    client, production, seed = batch_env
    first = seed("a-ready")
    suffix = "png" if media == "image" else "mp4"
    url = f"/uploads/candidate.{suffix}"
    metadata = {
        f"active_{media}": url,
        f"{media}_candidates": [{media: url, "review_required": True}],
    }
    if review is not None:
        metadata[f"{media}_reviews"] = [{media: url, **review}]
    second = seed("z-unreviewed", metadata=metadata)
    before = _card_files(production)

    response = client.post(
        "/api/v1/agentapp/production/cards/batch-status",
        json={"card_ids": [first, second], "status": "done"},
    )

    assert response.status_code == 409
    assert _card_files(production) == before


@pytest.mark.parametrize("action,extra", [
    ("batch-move", {"stage": "vid_prompt"}),
    ("batch-delete", {}),
    ("batch-status", {"status": "pending"}),
])
def test_batch_denies_mixed_membership_before_any_write(batch_env, action, extra):
    client, production, seed = batch_env
    first = seed("a-owned")
    second = seed("z-private", member="bob")
    before = _card_files(production)

    response = client.post(
        f"/api/v1/agentapp/production/cards/{action}",
        json={"card_ids": [first, second], **extra},
    )

    assert response.status_code == 403
    assert _card_files(production) == before


@pytest.mark.parametrize("action,extra,result_key", [
    ("batch-move", {"stage": "vid_prompt"}, "moved"),
    ("batch-delete", {}, "deleted"),
    ("batch-status", {"status": "done"}, "updated"),
])
def test_batch_updates_all_selected_projects_and_ignores_unknown_ids(
    batch_env, action, extra, result_key,
):
    client, production, seed = batch_env
    first = seed("a-owned")
    second = seed("b-owned")
    seed("z-unselected", member="bob")
    unselected = (production.DATA_DIR / "z-unselected" / "cards.json").read_bytes()

    response = client.post(
        f"/api/v1/agentapp/production/cards/{action}",
        json={"card_ids": [first, "missing-card", second, first], **extra},
    )

    assert response.status_code == 200, response.text
    assert sorted(response.json()["data"][result_key]) == [first, second]
    for pid in ("a-owned", "b-owned"):
        cards = production._load_cards(pid)
        if action == "batch-delete":
            assert cards == []
        else:
            card = cards[0]
            assert card.updated_at != "original-time"
            if action == "batch-move":
                assert card.stage == "vid_prompt"
                assert card.status == "review"
            else:
                assert card.status == "done"
                assert card.stage == "img_gen"
    assert (production.DATA_DIR / "z-unselected" / "cards.json").read_bytes() == unselected


@pytest.mark.parametrize("media", ["image", "video"])
def test_batch_done_accepts_current_media_that_passed_quality_review(batch_env, media):
    client, production, seed = batch_env
    url = "/uploads/approved-media"
    card_id = seed("approved", metadata={
        f"active_{media}": url,
        f"{media}_candidates": [{media: url, "review_required": True}],
        f"{media}_reviews": [{media: url, "verdict": "pass", "quality": {"passed": True}}],
    })

    response = client.post(
        "/api/v1/agentapp/production/cards/batch-status",
        json={"card_ids": [card_id], "status": "done"},
    )

    assert response.status_code == 200, response.text
    assert production._load_cards("approved")[0].status == "done"


@pytest.mark.parametrize("action,extra", [
    ("batch-move", {"stage": "unknown-stage"}),
    ("batch-status", {"status": "unknown-status"}),
])
def test_batch_rejects_invalid_stage_or_status_without_writing(batch_env, action, extra):
    client, production, seed = batch_env
    card_id = seed("owned")
    before = _card_files(production)

    response = client.post(
        f"/api/v1/agentapp/production/cards/{action}",
        json={"card_ids": [card_id], **extra},
    )

    assert response.status_code == 400
    assert _card_files(production) == before


@pytest.mark.parametrize("action,extra,result_key", [
    ("batch-move", {"stage": "vid_prompt"}, "moved"),
    ("batch-delete", {}, "deleted"),
    ("batch-status", {"status": "pending"}, "updated"),
])
@pytest.mark.parametrize("card_ids", [[], ["missing-card"]])
def test_batch_handles_an_empty_production_store(batch_env, monkeypatch, action, extra, result_key, card_ids):
    client, production, _ = batch_env
    missing_root = production.DATA_DIR / "not-created"
    monkeypatch.setattr(production, "DATA_DIR", missing_root)

    response = client.post(
        f"/api/v1/agentapp/production/cards/{action}",
        json={"card_ids": card_ids, **extra},
    )

    assert response.status_code == 200, response.text
    assert response.json()["data"][result_key] == []
    assert not missing_root.exists()
