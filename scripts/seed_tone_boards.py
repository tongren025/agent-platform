# -*- coding: utf-8 -*-
"""种入《九陆纪元》S1 基调板（color script 锚点卡）（2026-07-21）。

背景：全季 192 张首帧的基调靠纯文字描述，从未有过"基调母版参考图"——
文字锁不住色调是文生图的物理事实，这是"图片基调对不上"的根因之一。
本脚本在 jiulu-s1 的 design 阶段种入 5 张基调板卡（g-tone-01..05），
覆盖修复脚本（fix_style_anchor_pollution.py）产出的全部配色分型：
green 25 / warm 88 / cold 57 / cloud 14 张，外加爆发帧专用板。

工作流：
1. 用户把每张卡 prompts[0] 复制到小云雀/即梦，各生成 4-8 张候选；
2. 按卡片 content 里的挑图标准挑出唯一一张"就是它"，绑定到本卡（status→done）；
3. 之后生成该分型的任何首帧，@图片1(角色母版) 之外固定 @图片2(对应基调板)，
   基调用参考图物理锁定，文字配色权重只作辅助。

用法：
    python scripts/seed_tone_boards.py           # dry-run
    python scripts/seed_tone_boards.py --apply   # 落盘
幂等：card_id 已存在则跳过。
"""
from __future__ import annotations

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, "data", "production", "jiulu-s1", "cards.json")
NOW = "2026-07-21T12:00:00+08:00"

STYLE = "干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，柔和漫射光，清晰主体，低描边"
QUALITY = (
    "画面干净无描边，无墨线，无裂纹，无草稿线，无脏黑边，无死黑阴影，无文字水印，"
    "纯环境氛围板无人物，画面稳定，竖屏9:16，电影质感"
)

BOARDS = [
    {
        "card_id": "g-tone-01",
        "title": "基调板TB1 金绿·世界树奇观",
        "kind": "green",
        "serves": "green 型 25 张（EP01 G1 开场、EP06-07 世界树遗迹等）",
        "prompt": (
            f"{STYLE}。纯场景基调板：垂死世界树横贯冷调暗天幕，九缕金绿光丝射向九方，"
            "大地龙骨山峦全部剪影化，树体金绿自发光是画面唯一主光源。"
            "配色权重：世界树金绿约60%主导，暖赤金约25%仅作地面熔浆余光，"
            "净化冷蓝≤15%仅限天际数据流；冷暖不均分，单一主光源定基调。"
            f"逆光，极大远景，竖屏9:16。{QUALITY}"
        ),
    },
    {
        "card_id": "g-tone-02",
        "title": "基调板TB2 暖赤金·废墟基态",
        "kind": "warm",
        "serves": "warm 型 88 张主力（EP01 G2/G5/G6/G7 等废墟日常与高燃戏基底）",
        "prompt": (
            f"{STYLE}。纯场景基调板：烬龙陆废墟全景，熔浆河奔流发光，龙骨山峦插天，"
            "熔渣地貌破败苍茫，云隙漏下金光。熔浆自发光为主光源，暖色低色温。"
            "配色权重：暖赤金约80%主导，净化冷蓝≤20%仅作远处天际数据流微光，"
            "金绿仅作天边世界树光丝点缀；冷暖不均分，单一主光源定基调。"
            f"大远景，竖屏9:16。{QUALITY}"
        ),
    },
    {
        "card_id": "g-tone-03",
        "title": "基调板TB3 冷蓝·净化压境",
        "kind": "cold",
        "serves": "cold 型 57 张（EP01 G3 齐射/G4 执行官压顶等净化军压境戏）",
        "prompt": (
            f"{STYLE}。纯场景基调板：净化舰队悬空列阵，冷蓝光束如暴雨向废墟倾泻，"
            "整片大地入影，熔浆只剩暗红余光在沟壑里流淌。冷色高色温，"
            "光源来自净化数据光，画面整体转冷。"
            "配色权重：净化冷蓝约70%主导，暖赤金约30%仅限熔浆与余烬反光；"
            "冷暖不均分，单一主光源定基调。"
            f"极大远景低机位仰拍，竖屏9:16。{QUALITY}"
        ),
    },
    {
        "card_id": "g-tone-04",
        "title": "基调板TB4 龙焰爆发·对撞极值",
        "kind": "warm_burst",
        "serves": "爆发帧专用（EP01 G3 反手灭、G5 熔浆主场 money shot 等瞬时高点）",
        "prompt": (
            f"{STYLE}。纯场景基调板：赤金龙焰洪流横扫画面，与蓝白净化光束正面对撞，"
            "冲击波掀起熔渣碎屑，龙焰白热核心轻微过曝。"
            "配色权重：暖赤金约85%瞬时压过全场，蓝白净化光≤15%只在被吞噬的边缘；"
            "冷暖不均分，龙焰是唯一主光源。"
            f"大远景，竖屏9:16。{QUALITY}"
        ),
    },
    {
        "card_id": "g-tone-05",
        "title": "基调板TB5 金色云海·升空终章",
        "kind": "cloud",
        "serves": "cloud 型 14 张（EP23 破云升空、EP24 云海终章）",
        "prompt": (
            f"{STYLE}。纯场景基调板：金色云海无边际翻涌，阳光穿云形成体积光柱，"
            "远方大陆轮廓浮在云线上。顺光高亮度暖调，无任何净化元素。"
            "配色权重：金色阳光约80%主导，云影冷灰≤20%，不出现净化冷蓝；"
            "冷暖不均分，单一主光源定基调。"
            f"极大远景，竖屏9:16。{QUALITY}"
        ),
    },
]

CONTENT_TMPL = """基调母版（color script 锚点）。{serves}

**作用**：本卡选定的图是该分型所有首帧的基调参考图——基调用图锁，不用文字赌。

**生成**：复制本卡提示词到小云雀/即梦，生成 4-8 张候选。

**挑图标准（三条都过才算）**：
1. 主色占比达标：一眼看去主色 ≥ 七成画面，次色只在限定位置出现；
2. 光源方向唯一：能说出光从哪来；有第二光源的废弃；
3. 黑位干净：暗部有层次不死黑，无脏色块。

**选定后**：把图绑到本卡（status 改 done）。之后生成 {kind} 型首帧时：
@图片1=角色母版，@图片2=本卡基调板，提示词配色权重句保持不变。
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    with open(CARDS, encoding="utf-8") as f:
        cards = json.load(f)
    existing = {c.get("card_id") for c in cards}

    added = []
    for i, b in enumerate(BOARDS):
        if b["card_id"] in existing:
            continue
        added.append(b["card_id"])
        cards.append({
            "card_id": b["card_id"],
            "project_id": "jiulu-s1",
            "stage": "design",
            "title": b["title"],
            "content": CONTENT_TMPL.format(serves=b["serves"], kind=b["kind"]),
            "episode": None,
            "shot_number": 0,  # 模型要求 int；0=全局/一集级卡约定，None 会让整个项目 _load_cards 炸 500
            "prompts": [b["prompt"]],
            "images": [],
            "videos": [],
            "metadata": {
                "asset_type": "tone_board",
                "palette_kind": b["kind"],
                "sort_hint": f"tone-{i:02d}",
            },
            "status": "pending",
            "assignee": "",
            "created_at": NOW,
            "updated_at": NOW,
        })

    print(f"{'APPLY' if args.apply else 'DRY-RUN'}: 新增基调板卡 {len(added)} 张: {added}")
    if args.apply and added:
        tmp = CARDS + ".tmp"
        with open(tmp, "w", encoding="utf-8", newline="\n") as f:
            f.write(json.dumps(cards, ensure_ascii=False, indent=2))
        os.replace(tmp, CARDS)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
