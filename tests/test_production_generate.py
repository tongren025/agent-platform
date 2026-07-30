"""看板 AI 生成的按集 scope 与 append/replace 落卡行为。

run_invocation 打桩(不碰真实 LLM),DATA_DIR 指向 tmp(不碰真实 data/production)。
核心保障:替换只影响同阶段同集数的卡片,其他集绝不触碰;按集生成时
上下文只含本集 + 全局资产。
"""
from __future__ import annotations

import json
from types import SimpleNamespace

import pytest


@pytest.fixture()
def prod_env(tmp_path, monkeypatch, app_client):
    """隔离 production 数据目录到 tmp,并把 run_invocation 换成录制桩。"""
    import app.api.production as prod

    monkeypatch.setattr(prod, "DATA_DIR", tmp_path)

    captured: dict = {"prompts": [], "employee_keys": []}

    async def fake_invocation(req):
        captured["prompts"].append(req.user_input)
        captured["employee_keys"].append(req.employee_key)
        return SimpleNamespace(
            success=True,
            assistant_message="镜头01: 新卡A\n内容A\n---\n镜头02: 新卡B\n内容B",
            error_message=None,
        )

    monkeypatch.setattr(prod, "run_invocation", fake_invocation)
    return app_client, captured


def _create_project_with_cards(client) -> str:
    """建一个项目:EP01 两张剧本卡、EP02 一张剧本卡、一张全局设定卡。"""
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "测试剧", "source_content": "原始素材:九陆世界观"},
    ).json()["data"]["project_id"]

    def add(stage, title, episode, shot):
        r = client.post(
            f"/api/v1/agentapp/production/projects/{pid}/cards",
            json={"stage": stage, "title": title, "content": f"{title}的内容",
                  "episode": episode, "shot_number": shot},
        )
        assert r.json()["code"] == 200

    add("script", "EP1剧本A", 1, 1)
    add("script", "EP1剧本B", 1, 2)
    add("script", "EP2剧本", 2, 1)
    add("setting", "全局角色设定", None, 1)
    return pid


def _cards(client, pid):
    return client.get(f"/api/v1/agentapp/production/projects/{pid}").json()["data"]["cards"]


def test_replace_only_touches_same_episode(prod_env):
    """replace 模式只删同阶段同集的旧卡,其他集与其他阶段原样保留。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)

    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "episode": 1, "mode": "replace",
              "employee_key": "e1"},
    )
    data = r.json()["data"]
    assert data["generated"] == 2
    assert data["replaced"] == 2

    cards = _cards(client, pid)
    ep1_script = [c for c in cards if c["stage"] == "script" and c["episode"] == 1]
    titles = {c["title"] for c in ep1_script}
    assert titles == {"镜头01: 新卡A", "镜头02: 新卡B"}
    # EP02 剧本卡与全局设定卡不受影响
    assert any(c["title"] == "EP2剧本" for c in cards)
    assert any(c["title"] == "全局角色设定" for c in cards)


def test_append_keeps_old_cards_and_continues_shot_number(prod_env):
    """append 模式(默认)不删旧卡；无 G 单元标题的旧式回复继续顺延兼容编号。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)

    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "episode": 1, "employee_key": "e1"},
    )
    data = r.json()["data"]
    assert data["replaced"] == 0

    cards = _cards(client, pid)
    ep1_script = [c for c in cards if c["stage"] == "script" and c["episode"] == 1]
    assert len(ep1_script) == 4  # 旧 2 张 + 新 2 张
    new_shots = sorted(c["shot_number"] for c in ep1_script if c["title"].startswith("镜头"))
    assert new_shots == [3, 4]


def test_episode_scoped_context_excludes_other_episodes(prod_env):
    """按集生成时,上下文含本集与全局资产,不含其他集。"""
    client, captured = prod_env
    pid = _create_project_with_cards(client)

    client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "storyboard", "episode": 1, "employee_key": "e1"},
    )
    prompt = captured["prompts"][-1]
    assert "EP1剧本A" in prompt
    assert "全局角色设定" in prompt
    assert "EP2剧本" not in prompt


def test_generation_preserves_g_unit_metadata(prod_env, monkeypatch):
    """G1/G2 标题或结构化字段会落到对应生成单元号，并写入 metadata。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)

    import app.api.production as prod

    async def fake_invocation(req):
        return SimpleNamespace(
            success=True,
            assistant_message=json.dumps({
                "cards": [
                    {
                        "title": "G1 破云坠城 视频提示词(八层)",
                        "content": "@图片1 生成时长15s",
                        "metadata": {"unit_number": "G1", "time_range": "00:00-00:15"},
                    },
                    {
                        "title": "G1末帧锁(FLF·七要素)",
                        "content": "file: images/e01_u1_end.png",
                    },
                    {
                        "title": "全局头部 成片级",
                        "content": "【风格】干净半写实东方幻想漫剧插画",
                    },
                ],
            }, ensure_ascii=False),
            error_message=None,
        )

    monkeypatch.setattr(prod, "run_invocation", fake_invocation)
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "vid_prompt", "episode": 1, "mode": "replace",
              "employee_key": "e1"},
    )
    data = r.json()["data"]
    assert data["generated"] == 3

    cards = data["cards"]
    assert cards[0]["shot_number"] == 1
    assert cards[0]["metadata"]["unit_number"] == 1
    assert cards[0]["metadata"]["time_range"] == "00:00-00:15"
    assert cards[0]["metadata"]["production_grain"] == "generation_unit"
    assert cards[1]["shot_number"] == 1
    assert cards[2]["shot_number"] == 0
    assert cards[2]["metadata"]["production_grain"] == "episode_overview"


def test_markdown_table_separator_is_not_treated_as_card_boundary(prod_env, monkeypatch):
    """表格里的 |---| 不是卡片分隔符，只允许独占一行的 --- 分卡。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)

    import app.api.production as prod

    async def fake_invocation(req):
        return SimpleNamespace(
            success=True,
            assistant_message=(
                "镜头拆分表 成片级\n"
                "| G | 时间 | 动作 |\n"
                "|---|---|---|\n"
                "| G1 | 00:00-00:05 | 抬头 |\n"
                "---\n"
                "G1 第一段 剧本 [00:00-00:05]\n"
                "| 时间 | 画面 |\n"
                "|---|---|\n"
                "| 00:00 | 机器人抬头 |\n"
                "---\n"
                "G2 第二段 剧本 [00:05-00:10]\n正文\n"
                "---\n"
                "G3 第三段 剧本 [00:10-00:15]\n正文"
            ),
            error_message=None,
        )

    monkeypatch.setattr(prod, "run_invocation", fake_invocation)
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "episode": 1, "mode": "replace",
              "employee_key": "e1"},
    )

    assert response.status_code == 200
    cards = response.json()["data"]["cards"]
    assert len(cards) == 4
    assert [card["title"] for card in cards] == [
        "镜头拆分表 成片级",
        "G1 第一段 剧本 [00:00-00:05]",
        "G2 第二段 剧本 [00:05-00:10]",
        "G3 第三段 剧本 [00:10-00:15]",
    ]
    assert "|---|---|" in cards[1]["content"]


def test_invalid_mode_rejected(prod_env):
    """mode 不在 append/replace 内返回 400。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "mode": "overwrite", "employee_key": "e1"},
    )
    assert r.status_code == 400


def test_generation_marks_quality_failures_for_review(prod_env):
    """不完整的一句话分镜仍会保存，但必须进入审核并返回质量问题，不能伪装 done。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "storyboard", "episode": 1, "mode": "replace", "employee_key": "e1"},
    )
    data = r.json()["data"]
    assert data["quality_issue_count"] > 0
    assert all(card["status"] == "review" for card in data["cards"])
    assert all(not card["metadata"]["quality_gate"]["passed"] for card in data["cards"])


def test_project_runtime_constraints_are_injected_into_generation_prompt(prod_env):
    """生成必须使用项目自身时长和画幅，不再把 90 秒/9:16 写死。"""
    client, captured = prod_env
    pid = _create_project_with_cards(client)
    client.put(
        f"/api/v1/agentapp/production/projects/{pid}",
        json={"episode_duration_seconds": 42, "aspect_ratio": "16:9"},
    )
    client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "storyboard", "episode": 1, "employee_key": "e1"},
    )
    prompt = captured["prompts"][-1]
    assert "单集目标时长 42 秒" in prompt
    assert "画幅 16:9" in prompt


def test_project_without_employee_uses_stage_specialist(prod_env):
    """未绑定项目员工时按目标阶段选专业员工，不能再拿注册表第一项碰运气。"""
    client, captured = prod_env
    pid = _create_project_with_cards(client)

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "episode": 1},
    )

    assert response.status_code == 200
    assert captured["employee_keys"][-1] == "comic-screenwriter"


def test_gc_generation_inherits_locked_art_bible(prod_env):
    """GC 生成必须注入正片项目的设定/设计母版，不能只写“沿用 Art Bible”却没有上下文。"""
    client, captured = prod_env
    bible_pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "九陆正片", "source_content": "正片素材"},
    ).json()["data"]["project_id"]
    client.post(
        f"/api/v1/agentapp/production/projects/{bible_pid}/cards",
        json={"stage": "design", "title": "苍霖母版", "content": "左脸旧疤、深青巨龙",
              "images": ["/locked/canglin.png"]},
    )
    gc_pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "九陆GC", "source_type": "gc", "source_content": "制作30秒GC"},
    ).json()["data"]["project_id"]
    client.put(
        f"/api/v1/agentapp/production/projects/{gc_pid}",
        json={"settings": {"art_bible_project_id": bible_pid}},
    )

    response = client.post(
        f"/api/v1/agentapp/production/projects/{gc_pid}/generate",
        json={"target_stage": "storyboard", "employee_key": "e1"},
    )
    assert response.status_code == 200
    prompt = captured["prompts"][-1]
    assert "已锁定 Art Bible" in prompt
    assert "苍霖母版" in prompt
    assert "左脸旧疤、深青巨龙" in prompt
    assert "/locked/canglin.png" in prompt


def test_shot_scoped_replace_only_touches_current_unit(prod_env):
    """镜头级返工只替换指定 G 的同阶段卡片，并把新卡固定回该 G。"""
    client, captured = prod_env
    pid = _create_project_with_cards(client)
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "episode": 1, "shot_number": 1,
              "mode": "replace", "employee_key": "e1"},
    )
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["replaced"] == 1
    assert data["shot_number"] == 1
    assert all(card["shot_number"] == 1 for card in data["cards"])
    cards = _cards(client, pid)
    assert any(card["title"] == "EP1剧本B" for card in cards)
    assert "只返工 G1" in captured["prompts"][-1]


def test_card_edit_updates_negative_prompt_and_immediate_image_versions(prod_env, monkeypatch):
    """单卡生图追加待验收候选，不覆盖已有生产图；通过后才能采用。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    created = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={"stage": "img_prompt", "title": "G1 首帧", "content": "正文",
              "episode": 1, "shot_number": 1, "prompts": ["用户主提示词"],
              },
    ).json()["data"]
    card_id = created["card_id"]
    edited = client.put(
        f"/api/v1/agentapp/production/cards/{card_id}",
        json={"negative_prompts": ["不要水印"], "images": ["/uploads/canvas/old.png"]},
    ).json()["data"]
    assert edited["negative_prompts"] == ["不要水印"]

    import app.api.production as prod
    monkeypatch.setattr(prod, "generate_image_to_local", lambda prompt, model, size: {
        "url": "/uploads/canvas/new.png", "model": "image-model",
    })
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/generate-image",
        json={"model": "image-model"},
    )
    assert response.status_code == 200
    card = response.json()["data"]["card"]
    assert card["images"] == ["/uploads/canvas/old.png", "/uploads/canvas/new.png"]
    assert card["metadata"]["active_image"] == "/uploads/canvas/old.png"
    assert card["metadata"]["last_image_prompt"] == "用户主提示词"
    candidate = card["metadata"]["image_candidates"][-1]
    assert candidate["image"] == "/uploads/canvas/new.png"
    assert candidate["review_required"] is True

    simple_pass = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review",
        json={"verdict": "pass", "image": "/uploads/canvas/new.png"},
    )
    assert simple_pass.status_code == 400
    quality_pass = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review",
        json={
            "verdict": "pass",
            "image": "/uploads/canvas/new.png",
            "ratings": {
                "identity_consistency": 5,
                "composition_accuracy": 5,
                "scene_consistency": 4,
                "style_fidelity": 4,
                "technical_integrity": 4,
            },
        },
    )
    assert quality_pass.status_code == 200, quality_pass.text
    assert quality_pass.json()["data"]["metadata"]["active_image"] == "/uploads/canvas/new.png"


def test_split_legacy_storyboard_into_one_card_per_subshot(prod_env):
    """历史 G 大分镜可无损拆成逐镜卡，供每镜单独生成故事板图。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    content = (
        "G1 大分镜\n"
        "### 镜头1｜2s\n画面内容：角色抬头\n角色动作：睁眼\n"
        "### 镜头2｜3s\n画面内容：角色起身\n角色动作：右手撑地\n"
    )
    source = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards",
        json={"stage": "storyboard", "title": "G1 分镜", "content": content,
              "episode": 1, "shot_number": 1},
    ).json()["data"]
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/cards/{source['card_id']}/split-storyboard",
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["split"] == 2
    assert [card["metadata"]["subshot"] for card in data["cards"]] == ["G1-S1", "G1-S2"]
    assert all(card["shot_number"] == 1 for card in data["cards"])
    cards = _cards(client, pid)
    assert not any(card["card_id"] == source["card_id"] for card in cards)
