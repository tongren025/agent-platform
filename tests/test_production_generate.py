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

    employee_keys: list[str] = []
    captured: dict = {
        "prompts": [],
        "schemas": [],
        "employee_keys": employee_keys,
        "employees": employee_keys,
    }

    async def fake_invocation(req):
        captured["prompts"].append(req.user_input)
        captured["schemas"].append(req.structured_schema_json)
        employee_keys.append(req.employee_key)
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


def test_comic_project_without_employee_uses_stage_specialist(prod_env):
    """漫剧团队未指定员工时按目标阶段选择固定专业岗位。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "漫剧专业岗位测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

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


def test_comic_team_routes_each_text_stage_to_designated_employee(prod_env):
    """导演台绑定漫剧团队后，各文字阶段必须调用明确岗位，不能使用项目首员工兜底。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "岗位路由测试",
            "source_content": "少年在废墟中发现龙蛋",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    for stage in ("script", "storyboard", "img_prompt", "vid_prompt"):
        response = client.post(
            f"/api/v1/agentapp/production/projects/{pid}/generate",
            json={"target_stage": stage, "episode": 1, "mode": "replace"},
        )
        assert response.status_code == 200, response.text

    assert captured["employees"][-4:] == [
        "comic-screenwriter",
        "comic-storyboard",
        "comic-prompt-engineer",
        "comic-prompt-engineer",
    ]


@pytest.mark.parametrize(
    ("extra_instruction", "expected_employee"),
    [
        ("只生成主要角色的人物造型、服装和道具设定", "comic-character-designer"),
        ("只生成废墟场景的空间、建筑、光影和布景设定", "comic-scene-designer"),
    ],
)
def test_comic_team_setting_employee_follows_context(
    prod_env,
    extra_instruction,
    expected_employee,
):
    """setting 是复合阶段，明确人物/场景上下文时必须分派给对应设计师。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "设定路由测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={
            "target_stage": "setting",
            "extra_instruction": extra_instruction,
        },
    )

    assert response.status_code == 200, response.text
    assert captured["employees"][-1] == expected_employee


def test_comic_team_setting_dispatches_character_and_scene_context(prod_env):
    """一次 setting 自动分派两个岗位，用户不再手动拆单。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "复合设定测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={
            "target_stage": "setting",
            "extra_instruction": "同时生成人物角色造型和场景布景",
        },
    )

    assert response.status_code == 200, response.text
    assert captured["employees"] == ["comic-character-designer", "comic-scene-designer"]
    assert "已完成的角色交接" in captured["prompts"][1]
    cards = response.json()["data"]["cards"]
    assert len(cards) == 4
    assert {c["metadata"]["responsible_employee_key"] for c in cards} == set(captured["employees"])


def test_default_setting_dispatches_both_roles(prod_env):
    client, captured = prod_env
    pid = client.post("/api/v1/agentapp/production/projects", json={
        "name": "默认接力", "source_content": "两个人在车站相遇", "team_code": "comic-drama-team",
    }).json()["data"]["project_id"]
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={"target_stage": "setting"})
    assert response.status_code == 200
    assert captured["employees"] == ["comic-character-designer", "comic-scene-designer"]
    assert all(json.loads(schema)["required"] == ["cards"] for schema in captured["schemas"])


def test_design_drafting_uses_prompt_engineer_not_media_executor(prod_env):
    client, captured = prod_env
    pid = client.post("/api/v1/agentapp/production/projects", json={
        "name": "设计草稿", "source_content": "站台", "team_code": "comic-drama-team",
    }).json()["data"]["project_id"]
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={
        "target_stage": "design", "extra_instruction": "人物三视图和场景设计",
    })
    assert response.status_code == 200
    assert captured["employees"] == ["comic-prompt-engineer"]
    assert "不调用生图/生视频工具" in captured["prompts"][0]


def test_shot_context_preserves_global_assets_and_metadata(prod_env):
    client, captured = prod_env
    pid = _create_project_with_cards(client)
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/cards", json={
        "stage": "design", "title": "全局母版", "content": "灰色外套",
        "shot_number": 7, "images": ["/uploads/canvas/identity.png"],
        "metadata": {"asset_id": "CHAR7", "version": "v2", "reference_assets": [{"url": "/uploads/canvas/scene.png"}]},
    })
    assert response.status_code == 200
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={
        "target_stage": "img_prompt", "episode": 1, "shot_number": 1, "employee_key": "e1",
    })
    assert response.status_code == 200
    prompt = captured["prompts"][-1]
    for value in ("全局母版", "CHAR7", "v2", "/uploads/canvas/identity.png", "/uploads/canvas/scene.png"):
        assert value in prompt
    assert "EP2剧本" not in prompt


def test_compound_setting_failure_keeps_all_old_cards(prod_env, monkeypatch):
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    client.put(f"/api/v1/agentapp/production/projects/{pid}", json={"team_code": "comic-drama-team"})
    before = _cards(client, pid)
    import app.api.production as prod

    async def fake(req):
        if req.employee_key == "comic-scene-designer":
            return SimpleNamespace(success=False, error_message="场景服务不可用")
        return SimpleNamespace(success=True, assistant_message='{"cards":[{"title":"角色","content":"新规格"}]}')

    monkeypatch.setattr(prod, "run_invocation", fake)
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={
        "target_stage": "setting", "mode": "replace",
    })
    assert response.status_code == 500
    assert _cards(client, pid) == before


def test_wrong_json_contract_is_not_saved_as_finished_card(prod_env, monkeypatch):
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    before = _cards(client, pid)
    import app.api.production as prod

    async def fake(_req):
        return SimpleNamespace(success=True, assistant_message='{"script_package":{"blockers":["missing"]}}')

    monkeypatch.setattr(prod, "run_invocation", fake)
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={
        "target_stage": "script", "episode": 1, "mode": "replace", "employee_key": "e1",
    })
    assert response.status_code == 502
    assert _cards(client, pid) == before


def test_explicit_input_blocker_cannot_pass_static_gate(prod_env, monkeypatch):
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    import app.api.production as prod

    async def fake(_req):
        return SimpleNamespace(success=True, assistant_message=json.dumps({"cards": [{
            "title": "角色版本冲突", "content": "已有两个互斥版本", "metadata": {"blockers": ["确认当前角色版本"]},
        }]}, ensure_ascii=False))

    monkeypatch.setattr(prod, "run_invocation", fake)
    response = client.post(f"/api/v1/agentapp/production/projects/{pid}/generate", json={
        "target_stage": "setting", "employee_key": "e1",
    })
    assert response.status_code == 200
    card = response.json()["data"]["cards"][0]
    assert card["status"] == "review"
    assert card["metadata"]["quality_gate"]["passed"] is False


def test_comic_team_rejects_employee_that_does_not_support_stage(prod_env):
    """漫剧团队不能把视频生成师显式塞给剧本阶段，应返回可操作的岗位提示。"""
    client, _ = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "错误岗位测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={
            "target_stage": "script",
            "employee_key": "comic-video-artist",
        },
    )

    assert response.status_code == 400
    body = response.text
    assert "剧本" in body
    assert "comic-video-artist" in body
    assert "comic-screenwriter" in body


def test_comic_team_reports_missing_routed_employee(prod_env, monkeypatch):
    """团队路由目标不存在时直接说明配置问题，不能再换成注册表中的其他员工。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "缺失岗位测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    import app.dependencies as dependencies

    original_get = dependencies.employee_registry.get
    monkeypatch.setattr(
        dependencies.employee_registry,
        "get",
        lambda key: None if key == "comic-screenwriter" else original_get(key),
    )
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script"},
    )

    assert response.status_code == 400
    assert "comic-screenwriter" in response.text
    assert "不存在" in response.text
    assert captured["employees"] == []


def test_comic_team_reports_disabled_routed_employee(prod_env, monkeypatch):
    """团队路由目标已停用时给出启用提示，不得悄悄换岗继续生成。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "停用岗位测试",
            "source_content": "测试素材",
            "team_code": "comic-drama-team",
        },
    ).json()["data"]["project_id"]

    import app.dependencies as dependencies

    original_get = dependencies.employee_registry.get

    def fake_get(key):
        employee = original_get(key)
        if key == "comic-screenwriter" and employee is not None:
            employee.enabled = False
        return employee

    monkeypatch.setattr(dependencies.employee_registry, "get", fake_get)
    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script"},
    )

    assert response.status_code == 400
    assert "comic-screenwriter" in response.text
    assert "已停用" in response.text
    assert captured["employees"] == []


def test_comic_media_and_qa_stage_route_contract():
    """图片、视频与质检阶段保留明确岗位合同，供媒体流水线复用。"""
    import app.api.production as prod

    assert prod._comic_context_employee("img_gen", "角色立绘") == "comic-character-artist"
    assert prod._comic_context_employee("img_gen", "纯场景布景") == "comic-scene-artist"
    assert prod._comic_context_employee("img_gen", "G1 关键帧") == "comic-keyframe-artist"
    assert prod.COMIC_DRAMA_STAGE_EMPLOYEES["vid_gen"] == ("comic-video-artist",)
    assert prod.COMIC_DRAMA_STAGE_EMPLOYEES["qa"] == ("comic-qa-inspector",)


def test_empty_employee_no_longer_falls_back_to_global_first_employee(prod_env):
    """非团队项目若既无请求员工也无项目默认员工，必须明确要求选择，不能偷偷取全局首员工。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "空员工测试", "source_content": "测试素材"},
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script"},
    )

    assert response.status_code == 400
    assert "需要" in response.text
    assert "指定" in response.text
    assert captured["employees"] == []


def test_non_comic_project_keeps_explicit_employee_behavior(prod_env):
    """非漫剧项目仍原样使用请求中的显式员工，不受漫剧岗位白名单影响。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={"name": "外部员工测试", "source_content": "测试素材"},
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "employee_key": "external-writer"},
    )

    assert response.status_code == 200, response.text
    assert captured["employees"][-1] == "external-writer"


def test_non_comic_project_keeps_project_default_employee_behavior(prod_env):
    """非漫剧项目未传请求员工时，仍使用项目原有默认员工。"""
    client, captured = prod_env
    pid = client.post(
        "/api/v1/agentapp/production/projects",
        json={
            "name": "项目默认员工测试",
            "source_content": "测试素材",
            "employee_key": "project-writer",
        },
    ).json()["data"]["project_id"]

    response = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script"},
    )

    assert response.status_code == 200, response.text
    assert captured["employees"][-1] == "project-writer"
