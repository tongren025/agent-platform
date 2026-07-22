# -*- coding: utf-8 -*-
"""修复风格锚点句污染与配色不定主次问题（2026-07-21）。

背景：Art Bible 的全局风格锚点句里混入了 G1 的具体画面元素
「蓝白魔法阵与赤金龙焰对撞」，被 192 张 img_prompt 卡、五季卡池、
9 个员工 roleProfile、长期记忆和画布节点忠实复制——导致安静戏、
悲伤戏的提示词也在把模型往"对撞大战"拉，全季基调漂移。
同时 jiulu-s1 的④场景尾巴统一写「暖赤金主调 vs 净化冷蓝」双色对撞
却不定主次比例，模型每次自行配平，批间冷暖随机。

本脚本做两类修复：
1. 全量去污染：从下列文件中删除污染短语（仅删短语，不动其余内容）
   - data/production/jiulu-s1..s5/cards.json（全 stage）
   - data/employees/*.json（roleProfile）
   - data/memory/*/semantic.json（长期记忆）
   - data/evolution/comic-qa-inspector/insights.json
   - data/canvas/359d205a.json（画布风格节点）
   - data/production/jiulu-s1/EP01_master_package.md / EP01_duanju_master_package.md
2. jiulu-s1 img_prompt 192 张配色显式化：
   按各卡自身⑤光影信号 + ⑥情绪符号判型（金绿/冷主导/暖主导/云海），
   把模板尾巴「；暖赤金主调 vs 净化冷蓝数据流；世界树光丝金绿为第三色」
   替换为带比例与出现范围的配色权重句；非模板尾巴则追加。
   冷主导卡④中段「熔浆奔流·暖赤金主调」同步改「熔浆奔流·熔浆暗红余光」，
   消除同卡内冷暖指令互相打架。

用法：
    python scripts/fix_style_anchor_pollution.py           # dry-run，只报告
    python scripts/fix_style_anchor_pollution.py --apply   # 落盘

幂等：重复执行第二次应报告 0 处改动。
不碰：.bak 备份、archive/ 归档卡、sessions、distillation_logs（历史记录）。
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

POLLUTION = "蓝白魔法阵与赤金龙焰对撞"
# 删除时连同前导连接符一起删，保证剩余句子通顺
POLLUTION_VARIANTS = [
    "，" + POLLUTION,
    "、" + POLLUTION,
    POLLUTION,  # 兜底：无前导符时裸删
]

# jiulu-s1 ④尾巴统一模板（170 张烬龙陆废墟 + 8 张熔浆之心共用）
TAIL_TEMPLATE = "；暖赤金主调 vs 净化冷蓝数据流；世界树光丝金绿为第三色"

# 配色权重句（显式主次比例 + 次色出现范围 + 不均分原则）
PALETTE = {
    "warm": (
        "；配色权重：暖赤金约80%主导，净化冷蓝≤20%仅限净化光束与数据流，"
        "金绿仅作世界树光丝点缀；冷暖不均分，单一主光源定基调"
    ),
    "cold": (
        "；配色权重：净化冷蓝约70%主导，暖赤金约30%仅限熔浆与余烬反光，"
        "金绿仅作世界树光丝点缀；冷暖不均分，单一主光源定基调"
    ),
    "green": (
        "；配色权重：世界树金绿约60%主导，暖赤金约25%环境余光，"
        "净化冷蓝≤15%仅限数据流；冷暖不均分，单一主光源定基调"
    ),
    "cloud": (
        "；配色权重：金色阳光约80%主导，云影冷灰≤20%，不出现净化冷蓝；"
        "冷暖不均分，单一主光源定基调"
    ),
}

COLD_SIGNALS = ("画面转冷", "冷色高色温", "冷蓝压顶", "冷调压", "冷蓝光束")
WARM_SIGNALS = ("暖色低色温", "暖赤", "金光", "暖色", "暖调")
GREEN_SIGNALS = ("金绿主色", "金绿自发光")
CLOUD_SIGNALS = ("云海上方", "金色云海", "阳光穿云")


def strip_pollution(text: str) -> tuple[str, int]:
    """删除污染短语，返回 (新文本, 删除次数)。"""
    count = 0
    for variant in POLLUTION_VARIANTS:
        n = text.count(variant)
        if n:
            text = text.replace(variant, "")
            count += n
    return text, count


def classify_palette(content: str) -> str:
    """按⑤光影信号 + ⑥情绪符号 + 场景关键词判定该卡配色型。"""
    sec4 = _section(content, "④【景别构图】", "⑤")
    sec5 = _section(content, "⑤【光影】", "⑥")
    sec6 = _section(content, "⑥【情绪氛围】", "⑦")
    if any(s in sec4 for s in CLOUD_SIGNALS) or any(s in sec5 for s in CLOUD_SIGNALS):
        return "cloud"
    if any(s in sec5 for s in GREEN_SIGNALS):
        return "green"
    if any(s in sec5 for s in COLD_SIGNALS):
        return "cold"
    if any(s in sec5 for s in WARM_SIGNALS):
        return "warm"
    # ⑤无明确信号时按⑥情绪符号兜底：负值偏冷，其余暖主导
    m = re.search(r"[-−]\s*(\d)", sec6)
    if m and int(m.group(1)) >= 1:
        return "cold"
    return "warm"


def _section(content: str, start: str, end_marker: str) -> str:
    i = content.find(start)
    if i < 0:
        return ""
    j = content.find(end_marker, i + len(start))
    return content[i + len(start): j if j > 0 else len(content)]


def fix_s1_palette(card: dict) -> list[str]:
    """对 jiulu-s1 单张 img_prompt 卡做配色显式化，返回改动说明列表。"""
    content = card.get("content") or ""
    changes: list[str] = []
    if "配色权重：" in content:
        return changes  # 幂等：已处理过
    kind = classify_palette(content)
    palette = PALETTE[kind]
    if TAIL_TEMPLATE in content:
        content = content.replace(TAIL_TEMPLATE, palette)
        changes.append(f"尾巴模板→{kind}型配色")
    else:
        # 非模板尾巴（e23/e24 等）：在「场景：...」段末（⑤之前）追加
        m = re.search(r"(场景：[^\n]*?)(\n⑤|⑤)", content)
        if m:
            content = content[: m.end(1)] + palette + content[m.end(1):]
            changes.append(f"场景段追加{kind}型配色")
    # 冷主导卡：④中段与⑤打架的「熔浆奔流·暖赤金主调」改暗红余光
    if kind == "cold" and "熔浆奔流·暖赤金主调" in content:
        content = content.replace("熔浆奔流·暖赤金主调", "熔浆奔流·熔浆暗红余光")
        changes.append("④中段暖调→熔浆暗红余光")
    if changes:
        card["content"] = content
        # prompts 数组为空时前端读 content；若 prompts[0] 与旧 content 相同也同步
        prompts = card.get("prompts") or []
        if prompts:
            prompts[0] = content
    return changes


def process_cards_file(path: str, do_palette: bool, stats: dict, samples: list) -> bool:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    cards = data.get("cards") if isinstance(data, dict) else data
    if cards is None:
        cards = data
    changed = False
    for card in cards:
        raw = json.dumps(card, ensure_ascii=False)
        if POLLUTION in raw:
            for field in ("content",):
                val = card.get(field)
                if val and POLLUTION in val:
                    before = val
                    val, n = strip_pollution(val)
                    if n:
                        card[field] = val
                        stats["pollution_removed"] += n
                        changed = True
                        if len(samples) < 3:
                            i = before.find(POLLUTION)
                            samples.append(
                                f"[{os.path.basename(os.path.dirname(path))}/"
                                f"{card.get('card_id')}] …{before[max(0, i-40):i+len(POLLUTION)+5]}… → 删除"
                            )
            prompts = card.get("prompts") or []
            for k, p in enumerate(prompts):
                if p and POLLUTION in p:
                    prompts[k], n = strip_pollution(p)
                    stats["pollution_removed"] += n
                    changed = True
        if do_palette and card.get("stage") == "img_prompt":
            chs = fix_s1_palette(card)
            if chs:
                stats["palette_fixed"] += 1
                stats["palette_kinds"][chs[0].split("→")[-1].split("型")[0]] = (
                    stats["palette_kinds"].get(chs[0].split("→")[-1].split("型")[0], 0) + 1
                )
                changed = True
    if changed:
        stats["files"].append(path)
        _atomic_write_json(path, data)
    return changed


def process_json_text_file(path: str, stats: dict) -> bool:
    """员工/记忆/进化/画布 JSON：整体文本级删除污染短语后重新解析写回。"""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if POLLUTION not in text:
        return False
    data = json.loads(text)
    new_text = json.dumps(data, ensure_ascii=False)
    new_text, n = strip_pollution(new_text)
    stats["pollution_removed"] += n
    stats["files"].append(path)
    _atomic_write_json(path, json.loads(new_text))
    return True


def process_md_file(path: str, stats: dict) -> bool:
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if POLLUTION not in text:
        return False
    text, n = strip_pollution(text)
    stats["pollution_removed"] += n
    stats["files"].append(path)
    _atomic_write(path, text)
    return True


def _atomic_write_json(path: str, data) -> None:
    if not APPLY:
        return
    _atomic_write(path, json.dumps(data, ensure_ascii=False, indent=2))


def _atomic_write(path: str, text: str) -> None:
    if not APPLY:
        return
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    os.replace(tmp, path)


APPLY = False


def main() -> None:
    global APPLY
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="真正落盘（默认 dry-run）")
    args = parser.parse_args()
    APPLY = args.apply

    stats = {"pollution_removed": 0, "palette_fixed": 0, "palette_kinds": {}, "files": []}
    samples: list[str] = []

    # 1) 五季卡池：s1 全量修（去污染+配色），s2-s5 仅去污染
    for season in range(1, 6):
        path = os.path.join(ROOT, "data", "production", f"jiulu-s{season}", "cards.json")
        if os.path.exists(path):
            process_cards_file(path, do_palette=(season == 1), stats=stats, samples=samples)

    # 2) 员工 roleProfile
    for path in glob.glob(os.path.join(ROOT, "data", "employees", "*.json")):
        process_json_text_file(path, stats)

    # 3) 长期记忆 semantic.json
    for path in glob.glob(os.path.join(ROOT, "data", "memory", "*", "semantic.json")):
        process_json_text_file(path, stats)

    # 4) 进化洞察 + 画布风格节点
    for rel in (
        os.path.join("data", "evolution", "comic-qa-inspector", "insights.json"),
        os.path.join("data", "canvas", "359d205a.json"),
    ):
        path = os.path.join(ROOT, rel)
        if os.path.exists(path):
            process_json_text_file(path, stats)

    # 5) EP01 交付包 markdown
    for name in ("EP01_master_package.md", "EP01_duanju_master_package.md"):
        path = os.path.join(ROOT, "data", "production", "jiulu-s1", name)
        if os.path.exists(path):
            process_md_file(path, stats)

    mode = "APPLY 已落盘" if APPLY else "DRY-RUN 未写入"
    print(f"=== {mode} ===")
    print(f"污染短语删除: {stats['pollution_removed']} 处")
    print(f"s1 配色显式化: {stats['palette_fixed']} 张, 分型 {stats['palette_kinds']}")
    print(f"涉及文件 {len(stats['files'])} 个:")
    for p in stats["files"]:
        print("  -", os.path.relpath(p, ROOT))
    if samples:
        print("diff 样例:")
        for s in samples:
            print("  ", s)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
