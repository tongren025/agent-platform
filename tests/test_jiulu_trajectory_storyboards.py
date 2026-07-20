from scripts.render_jiulu_s1_trajectory_storyboards import (
    CARDS_PATH,
    board_resource_url,
    parse_subshots,
)

import json


def test_parse_subshots_extracts_timing_camera_and_actions():
    content = """G1 测试 | 成片时长3s
### 镜头1｜00:00-00:01｜独立生成1s
镜头目的：建立人物起势
景别·机位：中景 / 正面平视｜唯一运镜：跟随(follow)
主体与焦点：苍霖；焦点锁定动作
屏幕方向与轴线：左→右；保持同侧机位
起始姿态：站立；承接状态：无
分时动作：
- 0.0s：苍霖站稳。
- 1.0s：苍霖向前一步。
结束姿态：前脚落地。
光影：暖赤金侧光；方向不跳变
声音：脚步声。
### 镜头2｜00:01-00:03｜独立生成2s
镜头目的：完成动作落点
景别·机位：近景 / 侧面｜唯一运镜：固定(static)
主体与焦点：苍霖；焦点锁定眼神
屏幕方向与轴线：左→右；保持同侧机位
起始姿态：前脚落地；承接状态：上一镜
分时动作：
- 0.0s：抬眼。
- 2.0s：视线锁定目标。
结束姿态：视线停稳。
光影：冷蓝轮廓光；方向不跳变
声音：风声。
G 单元验收：完成。
"""

    subshots = parse_subshots(content)

    assert len(subshots) == 2
    assert subshots[0].timecode == "00:00-00:01"
    assert subshots[0].camera == "跟随(follow)"
    assert subshots[0].actions == ("苍霖站稳。", "苍霖向前一步。")
    assert subshots[1].end_pose == "视线停稳。"


def test_all_production_storyboards_are_parseable():
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    storyboards = [
        card
        for card in cards
        if card.get("stage") == "storyboard" and card.get("episode") is not None
    ]

    counts = [len(parse_subshots(card["content"])) for card in storyboards]

    assert len(storyboards) == 143
    assert sum(counts) == 1229
    assert min(counts) >= 5
    assert max(counts) <= 12


def test_board_resource_url_is_stable_and_episode_scoped():
    card = {
        "card_id": "e06-sb04",
        "episode": 6,
        "shot_number": 4,
        "title": "G4 没死透 分镜",
    }

    url = board_resource_url(card)

    assert "/EP06/" in url
    assert url.endswith("EP06_G04_没死透_动作轨迹故事板.jpg")
