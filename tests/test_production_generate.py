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

    captured: dict = {"prompts": []}

    async def fake_invocation(req):
        captured["prompts"].append(req.user_input)
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


def test_invalid_mode_rejected(prod_env):
    """mode 不在 append/replace 内返回 400。"""
    client, _ = prod_env
    pid = _create_project_with_cards(client)
    r = client.post(
        f"/api/v1/agentapp/production/projects/{pid}/generate",
        json={"target_stage": "script", "mode": "overwrite", "employee_key": "e1"},
    )
    assert r.status_code == 400
