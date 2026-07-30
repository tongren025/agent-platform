"""两键评审（通过/废弃+原因统计）API 回归测试。

背景：卡片 status=done 只表示"生成完成"，用户对图的不满意从未落数据——
失败原因不记录导致重生成不带修正、同一毛病反复返工。本组测试钉住：
1. reject 必须携带枚举内 reason（不允许"不满意但说不出哪"进数据）；
2. 评审追加进 metadata.image_reviews 且不覆盖历史；
3. review-stats 按原因聚合出分布，是"卡在图片关"的诊断面板数据源。
"""
from __future__ import annotations

import hashlib

import pytest


@pytest.fixture()
def review_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据目录到 tmp，造一个带两张绑图卡的项目。"""
    import app.api.production as prod

    monkeypatch.setattr(prod, "DATA_DIR", tmp_path)

    r = app_client.post("/api/v1/agentapp/production/projects", json={"name": "评审测试"})
    assert r.status_code == 200, r.text
    pid = r.json()["data"]["project_id"]

    card_ids = []
    for i in (1, 2):
        r = app_client.post(f"/api/v1/agentapp/production/projects/{pid}/cards", json={
            "stage": "img_prompt", "title": f"G{i} 首帧", "content": "x",
            "episode": 1, "shot_number": i, "images": [f"/uploads/g{i}.png"],
        })
        assert r.status_code == 200, r.text
        card_ids.append(r.json()["data"]["card_id"])
    return app_client, pid, card_ids


def test_reject_without_reason_is_400(review_env):
    """废弃不带原因必须被拒绝——评审数据的价值全在原因字段。"""
    client, pid, (cid, _) = review_env
    r = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review",
                    json={"verdict": "reject"})
    assert r.status_code == 400
    r = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review",
                    json={"verdict": "reject", "reason": "随便写的"})
    assert r.status_code == 400


def test_invalid_verdict_is_400(review_env):
    client, pid, (cid, _) = review_env
    r = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review",
                    json={"verdict": "maybe"})
    assert r.status_code == 400


def test_reviews_append_and_default_image_resolution(review_env):
    """评审记录逐条追加不覆盖；废弃进入返工，通过后关闭待处理状态。"""
    client, pid, (cid, _) = review_env
    base = f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review"
    r = client.post(base, json={"verdict": "reject", "reason": "tone_off", "note": "整体偏冷"})
    assert r.status_code == 200, r.text
    assert r.json()["data"]["status"] == "review"
    director = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert director["reviewCount"] == 1
    assert director["shots"][0]["reviewCount"] == 1
    assert director["shots"][0]["imageReviewVerdict"] == "reject"
    r = client.post(base, json={"verdict": "pass"})
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "done"
    director = client.get(f"/api/v1/agentapp/director/projects/{pid}").json()["data"]
    assert director["reviewCount"] == 0
    assert director["shots"][0]["imageReviewVerdict"] == "pass"
    meta = r.json()["data"]["metadata"]
    reviews = meta["image_reviews"]
    assert len(reviews) == 2
    assert reviews[0]["reason"] == "tone_off"
    assert reviews[0]["note"] == "整体偏冷"
    assert reviews[0]["image"] == "/uploads/g1.png"
    assert reviews[1]["verdict"] == "pass"
    assert meta["review_verdict"] == "pass"  # 最新一次


def test_review_binds_project_image_hash_and_generation_spec(review_env):
    """项目内媒体评审必须绑定当前文件内容和生成规格，覆盖同路径后旧通过失效。"""
    client, pid, _ = review_env
    import app.api.production as prod

    image_path = prod._proj_dir(pid) / "assets" / "frame.png"
    image_path.parent.mkdir(parents=True, exist_ok=True)
    image_bytes = b"current-frame-v1"
    image_path.write_bytes(image_bytes)
    image_url = (
        f"/api/v1/agentapp/production/resource/production/{pid}"
        "/assets/frame.png"
    )
    created = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": "img_prompt",
            "title": "绑定指纹的首帧",
            "content": "x",
            "images": [image_url],
            "metadata": {
                "active_image": image_url,
                "generation_spec_fingerprint": "spec-v1",
            },
        },
    )
    assert created.status_code == 200, created.text
    card_id = created.json()["data"]["card_id"]

    reviewed = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review",
        json={"verdict": "pass"},
    )
    assert reviewed.status_code == 200, reviewed.text
    record = reviewed.json()["data"]["metadata"]["image_reviews"][-1]
    assert record["file_sha256"] == hashlib.sha256(image_bytes).hexdigest()
    assert record["spec_fingerprint"] == "spec-v1"


def test_review_card_without_images_is_400(review_env):
    """没图的卡不能评审——避免产生悬空评审记录。"""
    client, pid, _ = review_env
    r = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards", json={
        "stage": "img_prompt", "title": "G9 无图", "content": "x", "episode": 1, "shot_number": 9,
    })
    cid = r.json()["data"]["card_id"]
    r = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review",
                    json={"verdict": "pass"})
    assert r.status_code == 400


def test_review_stats_aggregate_reasons(review_env):
    """统计端点按废弃原因聚合并排序，带中文名，按集分桶。"""
    client, pid, (c1, c2) = review_env
    base = f"/api/v1/agentapp/production/projects/{pid}/cards"
    client.post(f"{base}/{c1}/review", json={"verdict": "reject", "reason": "tone_off"})
    client.post(f"{base}/{c1}/review", json={"verdict": "reject", "reason": "tone_off"})
    client.post(f"{base}/{c1}/review", json={"verdict": "reject", "reason": "anatomy_broken"})
    client.post(f"{base}/{c2}/review", json={"verdict": "pass"})

    r = client.get(f"/api/v1/agentapp/production/projects/{pid}/review-stats")
    assert r.status_code == 200, r.text
    data = r.json()["data"]
    assert data["total"] == 4
    assert data["passed"] == 1
    assert data["rejected"] == 3
    top = data["reject_reasons"][0]
    assert top["key"] == "tone_off"
    assert top["name"] == "基调偏差"
    assert top["count"] == 2
    assert data["by_episode"]["1"] == {"passed": 1, "rejected": 3}


def test_quality_profile_and_structured_visual_review(review_env):
    """精品验收量表来自后端；关键维度不达标时不能伪装成通过。"""
    client, pid, (cid, _) = review_env
    profile = client.get("/api/v1/agentapp/production/quality-profile")
    assert profile.status_code == 200, profile.text
    image_profile = profile.json()["data"]["image"]
    assert image_profile["minimumScore"] == 80
    assert [item["key"] for item in image_profile["dimensions"]] == [
        "identity_consistency",
        "composition_accuracy",
        "scene_consistency",
        "style_fidelity",
        "technical_integrity",
    ]

    endpoint = f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review"
    failed = client.post(endpoint, json={
        "verdict": "pass",
        "ratings": {
            "identity_consistency": 3,
            "composition_accuracy": 5,
            "scene_consistency": 5,
            "style_fidelity": 5,
            "technical_integrity": 5,
        },
    })
    assert failed.status_code == 400
    assert "角色一致性" in failed.json()["message"]

    passed = client.post(endpoint, json={
        "verdict": "pass",
        "ratings": {
            "identity_consistency": 5,
            "composition_accuracy": 4,
            "scene_consistency": 4,
            "style_fidelity": 4,
            "technical_integrity": 4,
        },
    })
    assert passed.status_code == 200, passed.text
    quality = passed.json()["data"]["metadata"]["image_reviews"][-1]["quality"]
    assert quality["passed"] is True
    assert quality["score"] == 86.0
    assert quality["version"] == "visual-v1"


def test_review_and_activate_non_current_candidate(review_env):
    """历史候选可独立评分；未采用的候选不打断当前版本，通过后才允许晋级。"""
    client, pid, _ = review_env
    created = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={
            "stage": "img_prompt",
            "title": "G3 候选比较",
            "content": "x",
            "episode": 1,
            "shot_number": 3,
            "images": ["/uploads/candidate-a.png", "/uploads/candidate-b.png"],
            "metadata": {"active_image": "/uploads/candidate-a.png"},
            "status": "done",
        },
    )
    assert created.status_code == 200, created.text
    card_id = created.json()["data"]["card_id"]
    reviewed = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review",
        json={
            "verdict": "pass",
            "image": "/uploads/candidate-b.png",
            "promote": False,
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert reviewed.status_code == 200, reviewed.text
    card = reviewed.json()["data"]
    assert card["metadata"]["active_image"] == "/uploads/candidate-a.png"
    assert card["status"] == "done"

    activated = client.post(
        (
            f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}"
            "/image-candidates/activate"
        ),
        json={"image": "/uploads/candidate-b.png"},
    )
    assert activated.status_code == 200, activated.text
    assert activated.json()["data"]["metadata"]["active_image"] == "/uploads/candidate-b.png"
    assert activated.json()["data"]["metadata"]["review_verdict"] == "pass"
