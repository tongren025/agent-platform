"""两键评审（通过/废弃+原因统计）API 回归测试。

背景：卡片 status=done 只表示"生成完成"，用户对图的不满意从未落数据——
失败原因不记录导致重生成不带修正、同一毛病反复返工。本组测试钉住：
1. reject 必须携带枚举内 reason（不允许"不满意但说不出哪"进数据）；
2. 评审追加进 metadata.image_reviews 且不覆盖历史；
3. review-stats 按原因聚合出分布，是"卡在图片关"的诊断面板数据源。
"""
from __future__ import annotations

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
    """评审记录逐条追加不覆盖；image 省略时默认取 images[0]。"""
    client, pid, (cid, _) = review_env
    base = f"/api/v1/agentapp/production/projects/{pid}/cards/{cid}/review"
    r = client.post(base, json={"verdict": "reject", "reason": "tone_off", "note": "整体偏冷"})
    assert r.status_code == 200, r.text
    r = client.post(base, json={"verdict": "pass"})
    assert r.status_code == 200
    meta = r.json()["data"]["metadata"]
    reviews = meta["image_reviews"]
    assert len(reviews) == 2
    assert reviews[0]["reason"] == "tone_off"
    assert reviews[0]["note"] == "整体偏冷"
    assert reviews[0]["image"] == "/uploads/g1.png"
    assert reviews[1]["verdict"] == "pass"
    assert meta["review_verdict"] == "pass"  # 最新一次


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
