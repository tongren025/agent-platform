# -*- coding: utf-8 -*-
"""EP01 视频提示词 v1→v2 拆段整备（2026-07-22）。

背景：EP01 的 8 张 G 视频提示词是 v1「八层结构」大卡——整 G 8~14 秒、6~9 个镜头
塞一张卡，全部过不了平台静态门禁（segment_too_long + negative_language）。
单段超 6 秒违反视频模型物理限制（角色变形，见 Art Bible 禁止清单），
这批卡一条都不能直接送模型，是成片链路上除图片外的最大卡口。

拆法（兼容 2026-07-07「切换在生成内用『镜头N』分段」拍板与 6 秒物理上限）：
- 每子段 = 连续镜头组，组内总时长 ≤6 秒，段内切镜仍由「镜头N」分段交给模型；
- G1 14s/9 镜 → 3 张子段卡（e01-vp01-a/b/c），以此类推；
- @引用按段位重排：A 段带首帧锁，FLF 卡末段带末帧锁，中段仅角色母版+风格锁；
- 场景句替换为该 G 首帧卡的显式「配色权重」句（fix_style_anchor_pollution 产出）；
- 画风尾句正向化（删「避免/无裂纹」等负向触发词）；镜头行运动禁词改写；
- 原 G 大卡非破坏保留：status→review，metadata 标 superseded_by。
- e01-vp-hdr 整集头部卡就地正向化（它会拼在每条提示词前面）。

用法：
    python scripts/split_ep01_vid_prompts.py           # dry-run
    python scripts/split_ep01_vid_prompts.py --apply   # 落盘
幂等：已存在子段卡 / 已 superseded 的原卡跳过。
落盘后自动对全部新卡跑静态门禁并打印结果。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.production_quality import evaluate_production_draft  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, "data", "production", "jiulu-s1", "cards.json")
NOW = "2026-07-22T10:00:00+08:00"
MAX_SEG = 6  # 秒，单段物理上限

# 画风尾句正向化：原句含「无裂纹」「避免抖动运动」等门禁负向触发词
STYLE_TAIL = (
    "画风严格对齐@视频1，干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，"
    "柔和漫射光，清晰主体，低描边。画面干净利落，主体边缘清晰，保持角色一致性，"
    "服装稳定，保持面部一致，面部清晰，人体结构正常，动作自然流畅，画面稳定，"
    "竖屏9:16，电影质感"
)

# 镜头行运动禁词改写（保语义、避 FORBIDDEN_MOTION_WORDS）
MOTION_REWRITES = {"剧烈抽搐": "猛地抽搐", "剧烈": "猛烈", "激烈": "白热化", "快速": "利落"}

SHOT_RE = re.compile(r"「镜头(\d+)」\[(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\]")


def parse_card(content: str) -> dict:
    """把 v1 大卡拆成 头部行/镜头行列表/场景行/画风行。"""
    lines = content.split("\n")
    refs = lines[0]
    mode = next((l for l in lines if l.startswith("【生成模式】")), "")
    role = next((l for l in lines if l.startswith("角色：")), "")
    scene = next((l for l in lines if l.startswith("全局场景：")), "")
    shots = []
    for l in lines:
        m = SHOT_RE.match(l.strip())
        if m:
            t0 = int(m.group(2)) * 60 + int(m.group(3))
            t1 = int(m.group(4)) * 60 + int(m.group(5))
            shots.append({"num": int(m.group(1)), "dur": t1 - t0, "line": l.strip()})
    return {"refs": refs, "mode": mode, "role": role, "scene": scene, "shots": shots}


def group_shots(shots: list[dict]) -> list[list[dict]]:
    """贪心分组：连续镜头累计 ≤6 秒为一子段。"""
    groups: list[list[dict]] = []
    cur: list[dict] = []
    acc = 0
    for s in shots:
        if cur and acc + s["dur"] > MAX_SEG:
            groups.append(cur)
            cur, acc = [], 0
        cur.append(s)
        acc += s["dur"]
    if cur:
        groups.append(cur)
    return groups


def renumber(group: list[dict]) -> tuple[str, int]:
    """子段内镜头重新编号、时间码归零，返回 (镜头行文本, 总时长)。"""
    out = []
    t = 0
    for i, s in enumerate(group, 1):
        line = SHOT_RE.sub("", s["line"], count=1).strip()
        a, b = t, t + s["dur"]
        out.append(f"「镜头{i}」[{a // 60:02d}:{a % 60:02d}-{b // 60:02d}:{b % 60:02d}] {line}")
        t = b
    return "\n".join(out), t


def sanitize(text: str) -> str:
    for k, v in MOTION_REWRITES.items():
        text = text.replace(k, v)
    return text


def palette_of(cards: list[dict], g: int) -> str:
    """取该 G 首帧卡的显式配色权重句。"""
    for c in cards:
        if (c.get("stage") == "img_prompt" and str(c.get("episode")) == "1"
                and c.get("shot_number") == g and "首帧" in c.get("title", "")):
            m = re.search(r"配色权重：[^⑤\n]*", c.get("content", ""))
            if m:
                return m.group(0).rstrip("。 ")
    return ""


def build_segment(parsed: dict, g: int, idx: int, total: int, group: list[dict],
                  palette: str, first_frame: str, end_frame: str) -> tuple[str, str, int]:
    """组装一张子段卡 content，返回 (content, subsegment标签, 时长)。"""
    label = chr(ord("A") + idx)
    shots_text, dur = renumber(group)
    shots_text = sanitize(shots_text)
    is_first, is_last = idx == 0, idx == total - 1

    refs = ["@图片1(R3母版)"]
    if is_first and first_frame:
        refs.append(f"@图片2({first_frame}首帧)")
        mode = "【生成模式】首帧锁定：锁首帧、后续交模型"
    elif is_last and end_frame:
        refs.append(f"@图片2({end_frame}末帧锁)")
        mode = "【生成模式】末帧锁定（FLF 收尾段）：结束画面必须落在末帧"
    else:
        mode = "【生成模式】承接生成：起始画面衔接上一子段结束状态"
    refs.append("@视频1(风格锁)")

    scene_base = parsed["scene"].replace("全局场景：", "场景：")
    # 旧双色对撞句换成显式配色权重（找不到权重句时保留原场景句）
    if palette:
        scene_base = re.sub(r"；暖赤金主调[^\n]*", "", scene_base).rstrip("。；") + "；" + palette

    content = "\n".join([
        " ".join(refs),
        mode,
        f"生成时长{dur}s（单段≤6s）| 强度强 | G{g}子段{label}（原镜头{group[0]['num']}-{group[-1]['num']}）",
        parsed["role"],
        "",
        shots_text,
        "",
        scene_base,
        STYLE_TAIL,
    ])
    return content, f"G{g}-{label}", dur


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    with open(CARDS, encoding="utf-8") as f:
        cards = json.load(f)
    existing_ids = {c.get("card_id") for c in cards}

    new_cards, gate_report = [], []
    for c in cards:
        cid = c.get("card_id", "")
        if not re.fullmatch(r"e01-vp0\d", cid):
            continue
        if (c.get("metadata") or {}).get("superseded_by"):
            continue  # 幂等：已拆过
        g = c.get("shot_number")
        parsed = parse_card(c["content"])
        if not parsed["shots"]:
            print(f"!! {cid} 解析不到镜头行，跳过")
            continue
        first_frame = (re.search(r"@图片2\((\S+?)首帧\)", parsed["refs"]) or [None, ""])[1]
        end_frame = (re.search(r"@图片\d\((\S+?)末帧锁\)", parsed["refs"]) or [None, ""])[1]
        palette = palette_of(cards, g)
        groups = group_shots(parsed["shots"])
        seg_ids = []
        for i, grp in enumerate(groups):
            seg_id = f"{cid}-{chr(ord('a') + i)}"
            if seg_id in existing_ids:
                continue
            content, sub, dur = build_segment(parsed, g, i, len(groups), grp,
                                              palette, first_frame, end_frame)
            issues = evaluate_production_draft("vid_prompt", sub, content, [])
            gate_report.append((seg_id, sub, dur, [x["code"] for x in issues]))
            seg_ids.append(seg_id)
            new_cards.append({
                "card_id": seg_id, "project_id": "jiulu-s1", "stage": "vid_prompt",
                "title": f"{sub} {c['title'].replace('视频提示词(八层)', '').replace(f'G{g} ', '', 1).strip()} 视频提示词",
                "content": content, "episode": 1, "shot_number": g,
                "prompts": [content], "negative_prompts": [], "images": [], "videos": [],
                "metadata": {
                    "unit_number": g, "subsegment": sub, "duration_seconds": dur,
                    "flf": bool(end_frame) and i == len(groups) - 1,
                    "split_from": cid, "shots": f"{grp[0]['num']}-{grp[-1]['num']}",
                },
                "status": "done", "assignee": "",
                "created_at": NOW, "updated_at": NOW,
            })
        c["status"] = "review"
        c["metadata"] = {**(c.get("metadata") or {}),
                         "superseded_by": seg_ids, "split_note": "v1八层大卡已按≤6s拆段(2026-07-22)"}
        c["updated_at"] = NOW

    # 整集头部卡就地正向化（负向词会拼进每条提示词）
    hdr_fixed = False
    for c in cards:
        if c.get("card_id") == "e01-vp-hdr" and ("避免" in c["content"] or "无裂纹" in c["content"]):
            c["content"] = re.sub(r"画风严格对齐@视频1[^\n]*", STYLE_TAIL, c["content"])
            c["content"] = c["content"].replace("避免抖动运动和弯曲肢体，", "").replace("无裂纹，", "")
            c["updated_at"] = NOW
            hdr_fixed = True

    print(f"{'APPLY' if args.apply else 'DRY-RUN'}: 新增子段卡 {len(new_cards)} 张, hdr正向化: {hdr_fixed}")
    for seg_id, sub, dur, codes in gate_report:
        print(f"  {seg_id:16s} {sub:7s} {dur}s  门禁: {'PASS' if not codes else 'FAIL ' + ','.join(codes)}")
    if args.apply:
        cards.extend(new_cards)
        tmp = CARDS + ".tmp"
        with open(tmp, "w", encoding="utf-8", newline="\n") as f:
            f.write(json.dumps(cards, ensure_ascii=False, indent=2))
        os.replace(tmp, CARDS)
        print("已落盘。")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
