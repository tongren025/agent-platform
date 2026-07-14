"""v3 提示词管线：提取每集作业包 → 校验 LLM 逐镜增稠结果 → 渲染三类卡片 → 合并回卡池。

标准见 docs/PROMPT_STANDARD_V3.md。用法：
  python scripts/prompt_pipeline_v3.py extract [--season jiulu-s1] [--episode 1] [--workdir DIR]
  python scripts/prompt_pipeline_v3.py render --season jiulu-s1 --episode 1 [--check] [--workdir DIR]
  python scripts/prompt_pipeline_v3.py merge [--season jiulu-s1] [--episode 1] [--workdir DIR]
  python scripts/prompt_pipeline_v3.py report
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.production_quality import (  # noqa: E402
    ABSTRACT_VISUAL_PHRASES,
    FORBIDDEN_MOTION_WORDS,
    NEGATIVE_PHRASES,
    evaluate_production_draft,
)

PRODUCTION_ROOT = ROOT / "data" / "production"
DEFAULT_WORKDIR = ROOT / "_v3_work"

# 默认风格锚（九陆纪元·漫剧）。其他项目可在 project.json 的
# settings.style_anchors = {"normal": ..., "battle": ...} 中覆盖，真人剧等风格互不污染。
STYLE_ANCHORS = {
    "normal": "干净半写实东方幻想漫剧插画，柔和漫射光，清晰主体，低描边",
    "battle": "干净半写实东方幻想漫剧插画，电影级高特效动作关键帧，柔和漫射光，清晰主体，低描边，蓝白魔法阵与赤金龙焰对撞",
}


def project_style_anchors(season: str) -> dict[str, str]:
    """读取项目级风格锚；未配置的键回落到默认漫剧锚。"""
    anchors = dict(STYLE_ANCHORS)
    project_file = PRODUCTION_ROOT / season / "project.json"
    if project_file.exists():
        settings = json.loads(project_file.read_text("utf-8")).get("settings") or {}
        overrides = settings.get("style_anchors") or {}
        for key in ("normal", "battle"):
            if str(overrides.get(key, "")).strip():
                anchors[key] = overrides[key].strip()
    return anchors
POSITIVE_SUFFIX = (
    "主体边缘清晰，面部结构完整立体，五官清楚，人体比例自然，动作连贯流畅，"
    "画面稳定干净，背景层次分明，色彩通透，竖屏9:16，电影质感"
)
# 旧模板脚本产出的通用填充句：出现即判该镜头没有逐镜思考
TEMPLATE_JUNK = (
    "变化从一个明确起点开始", "用场景最近地标建立尺度", "延续上一镜永久地标",
    "处于变化前基准状态", "先改变一个最关键的可见部位", "扩散前缘完成",
    "变化停在清楚的新边界或队形", "降低纹理密度以分离主体", "只让邻近地标产生一次可见响应",
)
ALLOWED_CAMERA_EN = (
    "dolly in", "dolly out", "zoom in", "zoom out", "tracking", "truck left",
    "truck right", "arc shot", "crane up", "crane down", "boom up", "boom down",
    "pan left", "pan right", "tilt up", "tilt down", "dutch angle", "orbit",
    "static", "handheld", "whip pan", "bird's eye", "low angle", "follow", "dive", "aerial",
)
TIME_RE = re.compile(r"(\d{2}):(\d{2})-(\d{2}):(\d{2})")
SUB_LABELS = "ABCDEFGH"


# ── 基础工具 ──────────────────────────────────────────────────────

def _seconds(mmss: str) -> int:
    m, s = mmss.split(":")
    return int(m) * 60 + int(s)


def _row_duration(time_range: str) -> int:
    match = TIME_RE.search(time_range)
    if not match:
        return 0
    return (_seconds(f"{match.group(3)}:{match.group(4)}")
            - _seconds(f"{match.group(1)}:{match.group(2)}"))


def _load_cards(season: str) -> list[dict]:
    return json.loads((PRODUCTION_ROOT / season / "cards.json").read_text("utf-8"))


def _save_cards(season: str, cards: list[dict]) -> None:
    path = PRODUCTION_ROOT / season / "cards.json"
    path.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", "utf-8")


# ── extract：解析卡池，产出每集作业包 ────────────────────────────

def _parse_script_unit(content: str) -> dict:
    """解析 G 剧本卡：单元名、覆盖时码、锚点和逐段表格行。"""
    lines = content.splitlines()
    head = lines[0] if lines else ""
    head_match = re.match(r"^#*\s*(G\d+)[\s·]*(.*?)\s*\[(\d{2}:\d{2}-\d{2}:\d{2})\]", head)
    name = head_match.group(2).strip(" ·|") if head_match else head[:30]
    time_range = head_match.group(3) if head_match else ""
    anchor = ""
    anchor_match = re.search(r"^锚点：(.+)$", content, re.MULTILINE)
    if anchor_match:
        anchor = anchor_match.group(1).strip()
    rows = []
    for line in lines:
        if not re.match(r"^\|", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if cells and not TIME_RE.fullmatch(cells[0]) and len(cells) > 1 and TIME_RE.fullmatch(cells[1]):
            cells = cells[1:]  # 总表格式首列是 G 编号
        if len(cells) < 8 or not TIME_RE.fullmatch(cells[0]):
            continue
        dialogue = cells[3].strip().strip("「」『』\"'")
        rows.append({
            "time": cells[0], "dur": _row_duration(cells[0]), "size": cells[1],
            "action": cells[2], "dialogue": "" if dialogue in ("（无）", "(无)", "无") else dialogue,
            "emotion": cells[4], "camera": cells[5], "audio": cells[6], "light": cells[7],
        })
    return {"name": name, "time_range": time_range, "anchor": anchor, "rows": rows}


def _parse_img_card(card: dict) -> dict:
    content = card.get("content", "")
    file_line = next((l for l in content.splitlines() if l.startswith("file:")), "")
    dna = ""
    dna_match = re.search(r"^②【主体】(.+)$", content, re.MULTILINE)
    if dna_match:
        dna = dna_match.group(1).strip()
    scene = ""
    scene_match = re.search(r"场景：([^\n|]+)", content)
    if scene_match:
        scene = scene_match.group(1).strip()
    return {
        "card_id": card["card_id"], "title": card.get("title", ""),
        "file_line": file_line, "dna": dna, "scene": scene,
        "is_end": "末帧" in card.get("title", ""),
    }


def _parse_vid_card(card: dict) -> dict:
    content = card.get("content", "")
    refs = re.findall(r"@(?:图片|视频|音频)\d+\([^)]*\)", content)
    motion = next((l for l in content.splitlines() if l.startswith("Motion:")), "")
    script = next((l for l in content.splitlines() if l.startswith("Script:")), "")
    strength_match = re.search(r"\|\s*(强|中|低)\b", motion or content)
    chars: list[str] = []
    chars_match = re.search(r"^角色：(.+)$", content, re.MULTILINE)
    if chars_match:
        chars = [c.strip() for c in chars_match.group(1).split("；") if c.strip()]
    else:
        chars = sorted(set(re.findall(r"R\d+[^（()\n]{0,12}（[^（）]{10,}）", content)))
    return {
        "card_id": card["card_id"], "title": card.get("title", ""),
        "refs": refs, "motion_line": motion, "script_line": script,
        "flf": ("末帧锁" in content or "FLF" in content),
        "strength": strength_match.group(1) if strength_match else "强",
        "chars": chars,
    }


def _settings_excerpt(cards: list[dict], limit: int = 9000) -> str:
    parts, used = [], 0
    for card in cards:
        if card.get("stage") != "setting":
            continue
        chunk = f"### {card.get('title', '')}\n{card.get('content', '')[:450]}"
        if used + len(chunk) > limit:
            break
        parts.append(chunk)
        used += len(chunk)
    return "\n\n".join(parts)


def extract_packets(season: str | None, episode: int | None, workdir: Path) -> dict:
    """把卡池按集拆成作业包 JSON，返回统计。"""
    out_dir = workdir / "packets"
    out_dir.mkdir(parents=True, exist_ok=True)
    stats = {"episodes": 0, "units": 0, "units_skipped_no_script": 0, "notes": []}
    seasons = [season] if season else sorted(p.name for p in PRODUCTION_ROOT.glob("jiulu-s*"))
    for sea in seasons:
        cards = _load_cards(sea)
        episodes = sorted({c["episode"] for c in cards if c.get("episode")})
        if episode is not None:
            episodes = [e for e in episodes if e == episode]
        setting_text = _settings_excerpt(cards)
        for ep in episodes:
            ep_cards = [c for c in cards if c.get("episode") == ep]
            units: dict[int, dict] = {}
            for c in ep_cards:
                unit_no = c.get("shot_number") or 0
                if unit_no <= 0:
                    continue
                unit = units.setdefault(unit_no, {"unit": unit_no, "cards": {}, "characters_pool": []})
                if c["stage"] == "script":
                    unit.update(_parse_script_unit(c.get("content", "")))
                elif c["stage"] == "storyboard":
                    unit["cards"]["storyboard"] = {"card_id": c["card_id"], "title": c.get("title", "")}
                elif c["stage"] == "vid_prompt":
                    unit["cards"]["vid"] = _parse_vid_card(c)
                elif c["stage"] == "img_prompt":
                    unit["cards"].setdefault("img", []).append(_parse_img_card(c))
            packet_units = []
            for unit_no in sorted(units):
                unit = units[unit_no]
                pool: list[str] = []
                for source in (unit["cards"].get("vid", {}).get("chars", []),
                               [i["dna"] for i in unit["cards"].get("img", []) if i["dna"]]):
                    for item in source:
                        if item and item not in pool:
                            pool.append(item)
                unit["characters_pool"] = pool
                if not unit.get("rows"):
                    stats["units_skipped_no_script"] += 1
                    stats["notes"].append(f"{sea} EP{ep:02d} G{unit_no} 无剧本表，跳过重写")
                    unit["rows"] = []
                packet_units.append(unit)
            packet = {"season": sea, "episode": ep, "units": packet_units,
                      "settings_excerpt": setting_text}
            (out_dir / f"{sea}_ep{ep:02d}.json").write_text(
                json.dumps(packet, ensure_ascii=False, indent=1), "utf-8")
            stats["episodes"] += 1
            stats["units"] += len(packet_units)
    return stats


# ── 子段分箱 ──────────────────────────────────────────────────────

def group_subsegments(durations: list[int]) -> list[list[int]]:
    """把连续剪辑段分箱为 3~6s 生成子段（目标 4~6s），返回每箱的镜头下标列表。"""
    total = sum(durations)
    if total <= 6:
        return [list(range(len(durations)))]
    n = len(durations)
    best: dict[int, tuple[float, list[list[int]]]] = {0: (0.0, [])}
    for end in range(1, n + 1):
        candidates = []
        acc = 0
        for start in range(end - 1, -1, -1):
            acc += durations[start]
            if acc > 6:
                break
            if start not in best:
                continue
            penalty = 0.0 if 4 <= acc <= 6 else (2.0 if acc == 3 else 50.0)
            prev_cost, prev_bins = best[start]
            candidates.append((prev_cost + 1.0 + penalty + (5 - acc) ** 2 * 0.01,
                               prev_bins + [list(range(start, end))]))
        if candidates:
            best[end] = min(candidates, key=lambda x: x[0])
    if n not in best:
        raise ValueError(f"无法把剪辑段 {durations} 分为 3~6s 子段（存在超 6s 的单镜）")
    return best[n][1]


# ── render：校验增稠 JSON 并渲染三类卡片 ─────────────────────────

def _norm_dialogue(text: str) -> str:
    return re.sub(r"[「」『』\"'。！？!?，、\s]", "", text or "")


def _check_text(errors: list[str], where: str, text: str, *, allow_pipe: bool = False) -> None:
    """模型侧文本的正向性与具体性检查。"""
    lowered = (text or "").lower()
    for word in NEGATIVE_PHRASES:
        if word.lower() in lowered:
            errors.append(f"{where}: 含负向表达「{word}」")
    for word in FORBIDDEN_MOTION_WORDS:
        if word.lower() in lowered:
            errors.append(f"{where}: 含失稳运动词「{word}」")
    for word in ABSTRACT_VISUAL_PHRASES + TEMPLATE_JUNK:
        if word in (text or ""):
            errors.append(f"{where}: 含模板句/抽象句「{word}」")
    if not allow_pipe and re.search(r"[|｜]", text or ""):
        errors.append(f"{where}: 含表格竖线，必须写成流畅句子")
    if re.search(r"[+-]\d", text or ""):
        errors.append(f"{where}: 混入情绪评分（如 +3），情绪要翻译成可见元素")


def _check_shot(errors: list[str], where: str, shot: dict, row: dict, char_tags: set[str]) -> None:
    if shot.get("time") != row["time"]:
        errors.append(f"{where}: 时码 {shot.get('time')} 与剧本 {row['time']} 不一致")
    if _norm_dialogue(shot.get("dialogue", "")) != _norm_dialogue(row["dialogue"]):
        errors.append(f"{where}: 台词与剧本不一致（须逐字保留原文）")
    camera = shot.get("camera", "")
    hits = [k for k in ALLOWED_CAMERA_EN if k in camera.lower()]
    if len(hits) != 1:
        errors.append(f"{where}: 运镜「{camera}」必须恰好含一个标准运镜术语")
    else:
        row_hits = [k for k in ALLOWED_CAMERA_EN if k in row["camera"].lower()]
        if row_hits and hits[0] not in row_hits:
            errors.append(f"{where}: 运镜 {hits[0]} 与剧本 {row_hits} 不一致")
    visual = shot.get("visual", "")
    if not 30 <= len(visual) <= 260:
        errors.append(f"{where}: visual 长度 {len(visual)} 超出 30~260（需 1~3 句具体画面描述）")
    if re.search(r"[·:：]", visual):
        errors.append(f"{where}: visual 含「·/：」拼接符，必须写成自然语句")
    for field in ("visual", "start_pose", "end_pose", "gaze", "position", "fg", "mg", "bg",
                  "light", "audio", "purpose", "subject", "shot_size"):
        value = shot.get(field, "")
        if not str(value).strip():
            errors.append(f"{where}: 字段 {field} 为空")
            continue
        _check_text(errors, f"{where}.{field}", str(value))
    beats = shot.get("beats") or []
    if not 2 <= len(beats) <= 4:
        errors.append(f"{where}: beats 需 2~4 拍，当前 {len(beats)}")
    for i, beat in enumerate(beats):
        if not (isinstance(beat, list) and len(beat) == 2):
            errors.append(f"{where}: beats[{i}] 需为 [时刻, 描述]")
            continue
        _check_text(errors, f"{where}.beats[{i}]", str(beat[1]))
    for tag in shot.get("chars", []):
        if tag not in char_tags:
            errors.append(f"{where}: 角色标签「{tag}」不在本单元 characters 中")


def _split_refs(refs: list[str]) -> dict:
    return {
        "master": [r for r in refs if "母版" in r],
        "style": [r for r in refs if r.startswith("@视频")],
        "end": [r for r in refs if "末帧" in r],
    }


def _render_vid(unit: dict, enriched: dict, bins: list[list[int]], anchors: dict[str, str]) -> str:
    rows, shots = unit["rows"], enriched["shots"]
    vid = unit["cards"]["vid"]
    refs = _split_refs(vid.get("refs", []))
    first_frame_file = ""
    for img in unit["cards"].get("img", []):
        if not img["is_end"]:
            file_match = re.search(r"file:\s*images/(\S+?\.png)", img["file_line"])
            first_frame_file = file_match.group(1) if file_match else ""
            break
    total = sum(r["dur"] for r in rows)
    plan = " + ".join(f"{SUB_LABELS[i]} {sum(rows[j]['dur'] for j in b)}s" for i, b in enumerate(bins))
    char_map = {c["tag"]: c["dna"] for c in enriched.get("characters", [])}
    anchor = anchors[enriched.get("style_anchor", "normal")]
    out = [
        f"{unit_title(unit)} | 成片{unit.get('time_range', '')}（{total}s）| "
        f"生成子段{len(bins)}条：{plan} | 竖屏9:16",
        f"场景锚：{enriched['scene_anchor']}",
        f"连续性锁：{enriched['continuity_lock']}",
        "",
    ]
    for bi, bin_idx in enumerate(bins):
        label = SUB_LABELS[bi]
        seg_rows = [rows[j] for j in bin_idx]
        seg_dur = sum(r["dur"] for r in seg_rows)
        seg_time = f"{seg_rows[0]['time'].split('-')[0]}-{seg_rows[-1]['time'].split('-')[1]}"
        gen_note = f"一次生成{seg_dur}s" if seg_dur >= 4 else f"一次生成4s，成片取前{seg_dur}s"
        out.append(f"━━ 子段{label}｜成片{seg_time}｜{gen_note} ━━")
        ref_parts = list(refs["master"])
        if bi == 0 and first_frame_file:
            ref_parts.append(f"@图片2({first_frame_file} 本子段首帧)")
        elif bi > 0:
            ref_parts.append(f"@图片2(子段{SUB_LABELS[bi - 1]}末帧截图 作首帧)")
        ref_parts.extend(refs["style"])
        if bi == len(bins) - 1:
            ref_parts.extend(f"{r}" for r in refs["end"])
        if ref_parts:
            out.append(" ".join(ref_parts))
        seg_chars: list[str] = []
        for j in bin_idx:
            for tag in shots[j].get("chars", []):
                if tag not in seg_chars:
                    seg_chars.append(tag)
        if seg_chars:
            out.append("出场角色：" + "；".join(f"{t}（{char_map[t]}）" for t in seg_chars))
        out.append("")
        offset = 0
        for k, j in enumerate(bin_idx):
            shot, row = shots[j], rows[j]
            end_offset = offset + row["dur"]
            head = f"「镜头{k + 1}」{offset}-{end_offset}秒｜{shot['shot_size']}"
            line = f"{shot['visual']} 镜头{shot['camera']}。光影：{shot['light']}。音效：{shot['audio']}。"
            if shot.get("dialogue"):
                line += f"台词：「{shot['dialogue']}」。"
            out.extend([head, line])
            offset = end_offset
        out.append("")
        out.append(f"风格：{anchor}。{POSITIVE_SUFFIX}。")
        if bi == len(bins) - 1 and refs["end"]:
            out.append(f"末帧停在：{shots[bin_idx[-1]]['end_pose']}——与末帧锁图一致。")
        elif bi == len(bins) - 1:
            out.append(f"末帧停在：{shots[bin_idx[-1]]['end_pose']}。")
        else:
            out.append(
                f"末帧停在：{shots[bin_idx[-1]]['end_pose']}——截取本帧作子段{SUB_LABELS[bi + 1]}首帧。")
        out.append("")
    trailer = [l for l in (vid.get("motion_line"), vid.get("script_line")) if l]
    if trailer:
        out.extend(["---", *trailer])
    return "\n".join(out).strip()


def unit_title(unit: dict) -> str:
    return f"G{unit['unit']} {unit.get('name', '').strip()}".strip()


def _render_storyboard(unit: dict, enriched: dict, bins: list[list[int]]) -> str:
    rows, shots = unit["rows"], enriched["shots"]
    total = sum(r["dur"] for r in rows)
    plan = "+".join(f"{SUB_LABELS[i]}{sum(rows[j]['dur'] for j in b)}s" for i, b in enumerate(bins))
    shot_sub = {}
    for bi, bin_idx in enumerate(bins):
        for j in bin_idx:
            shot_sub[j] = SUB_LABELS[bi]
    out = [
        f"{unit_title(unit)} | 成片时长{total}s | {len(rows)}个剪辑镜头 | 生成子段：{plan}",
        "生成策略：每个子段一次生成（3~6s），子段间用末帧截图接力；禁止把整个 G 当作一次生成。",
        f"场景锚：{enriched['scene_anchor']}",
        f"连续性基准：{enriched['continuity_lock']}",
        "",
    ]
    prev_end = "承接上一 G 已验收末帧"
    for j, (shot, row) in enumerate(zip(shots, rows)):
        nxt = f"镜头{j + 2}" if j + 1 < len(rows) else "下一 G 首镜"
        beats = "\n".join(f"- {t}：{d}" for t, d in shot["beats"])
        out.extend([
            f"### 镜头{j + 1}｜{row['time']}｜{row['dur']}s｜子段{shot_sub[j]}",
            f"镜头目的：{shot['purpose']}",
            f"景别·机位：{shot['shot_size']}｜唯一运镜：{shot['camera']}",
            f"主体与焦点：{shot['subject']}",
            f"画面位置：{shot['position']}",
            f"空间分层：前景：{shot['fg']}／中景：{shot['mg']}／背景：{shot['bg']}",
            f"视线方向与轴线：{shot['gaze']}",
            f"起始姿态：{shot['start_pose']}（承接：{prev_end}）",
            "分时动作：",
            beats,
            f"结束姿态：{shot['end_pose']}",
            f"光影：{shot['light']}",
            f"声音：{shot['audio']}" + (f"；台词：「{shot['dialogue']}」" if shot.get("dialogue") else ""),
            f"剪辑与承接：末帧停在「{shot['end_pose']}」，切{nxt}。",
            "",
        ])
        prev_end = shot["end_pose"]
    out.extend([
        "G 单元验收：逐子段生成、逐子段验收；子段首帧须与上一子段末帧一致（轴线、服装、光源方向）。",
        "返工规则：哪个子段失败只重跑该子段，不连带整 G。",
    ])
    return "\n".join(out).strip()


def _render_img(img: dict, unit: dict, enriched: dict, anchors: dict[str, str]) -> str:
    frame = enriched.get("end_frame") if img["is_end"] else enriched.get("first_frame")
    anchor = anchors[enriched.get("style_anchor", "normal")]
    subject = frame.get("subject_line") or img["dna"]
    out = [img["file_line"], ""] if img["file_line"] else []
    out.extend([
        f"①【风格】{anchor}",
        f"②【主体】{subject}",
        f"③【动作】{frame['moment']}",
        f"④【景别构图】{frame['composition']}。竖屏9:16。场景：{enriched['scene_anchor']}",
        f"⑤【光影】{frame['lighting']}",
        f"⑥【情绪氛围】{frame['mood']}",
        f"⑦【画质】画面干净，{POSITIVE_SUFFIX}",
    ])
    return "\n".join(out).strip()


def render_episode(season: str, episode: int, workdir: Path, *, check: bool = False) -> dict:
    """校验增稠 JSON；通过则渲染三类卡片文本到 rendered/ 目录。"""
    packet = json.loads((workdir / "packets" / f"{season}_ep{episode:02d}.json").read_text("utf-8"))
    enriched_path = workdir / "enriched" / f"{season}_ep{episode:02d}.json"
    if not enriched_path.exists():
        return {"ok": False, "errors": [f"缺少增稠文件 {enriched_path}"]}
    try:
        enriched = json.loads(enriched_path.read_text("utf-8"))
    except json.JSONDecodeError as exc:
        return {"ok": False, "errors": [f"增稠 JSON 解析失败: {exc}"]}

    errors: list[str] = []
    anchors = project_style_anchors(season)
    enriched_units = {u.get("unit"): u for u in enriched.get("units", [])}
    rendered_cards: list[dict] = []
    for unit in packet["units"]:
        if not unit.get("rows"):
            continue
        where = f"G{unit['unit']}"
        eu = enriched_units.get(unit["unit"])
        if not eu:
            errors.append(f"{where}: 增稠结果缺失该单元")
            continue
        for field in ("scene_anchor", "continuity_lock"):
            if not str(eu.get(field, "")).strip():
                errors.append(f"{where}: 缺少 {field}")
            else:
                _check_text(errors, f"{where}.{field}", str(eu[field]))
        if eu.get("style_anchor") not in STYLE_ANCHORS:
            errors.append(f"{where}: style_anchor 必须是 normal/battle")
        char_tags = {c.get("tag") for c in eu.get("characters", [])}
        for c in eu.get("characters", []):
            if not str(c.get("dna", "")).strip():
                errors.append(f"{where}: 角色 {c.get('tag')} 缺少 dna")
        shots = eu.get("shots", [])
        if len(shots) != len(unit["rows"]):
            errors.append(f"{where}: 镜头数 {len(shots)} 与剧本行数 {len(unit['rows'])} 不一致")
            continue
        for j, (shot, row) in enumerate(zip(shots, unit["rows"])):
            _check_shot(errors, f"{where}.镜头{j + 1}", shot, row, char_tags)
        has_img_end = any(i["is_end"] for i in unit["cards"].get("img", []))
        has_img_first = any(not i["is_end"] for i in unit["cards"].get("img", []))
        for key, needed in (("first_frame", has_img_first), ("end_frame", has_img_end)):
            if not needed:
                continue
            frame = eu.get(key) or {}
            for field in ("subject_line", "moment", "composition", "lighting", "mood"):
                if not str(frame.get(field, "")).strip():
                    errors.append(f"{where}: {key}.{field} 为空")
                else:
                    _check_text(errors, f"{where}.{key}.{field}", str(frame[field]))
        if errors:
            continue

        durations = [r["dur"] for r in unit["rows"]]
        try:
            bins = group_subsegments(durations)
        except ValueError as exc:
            errors.append(f"{where}: {exc}")
            continue
        subseg_meta = [
            {"label": SUB_LABELS[i], "seconds": sum(durations[j] for j in b),
             "shots": [j + 1 for j in b]}
            for i, b in enumerate(bins)
        ]
        stage_payloads = []
        if unit["cards"].get("vid"):
            stage_payloads.append(("vid_prompt", unit["cards"]["vid"]["card_id"],
                                   unit["cards"]["vid"]["title"], _render_vid(unit, eu, bins, anchors),
                                   {"prompt_schema_version": "3.0-subsegment", "subsegments": subseg_meta}))
        if unit["cards"].get("storyboard"):
            stage_payloads.append(("storyboard", unit["cards"]["storyboard"]["card_id"],
                                   unit["cards"]["storyboard"]["title"],
                                   _render_storyboard(unit, eu, bins),
                                   {"storyboard_schema_version": "2.1-concrete",
                                    "subshot_count": len(unit["rows"]),
                                    "generation_strategy": "subsegments_3to6s_lastframe_relay",
                                    "subsegments": subseg_meta}))
        for img in unit["cards"].get("img", []):
            stage_payloads.append(("img_prompt", img["card_id"], img["title"],
                                   _render_img(img, unit, eu, anchors),
                                   {"prompt_schema_version": "2.0-positive"}))
        for stage, card_id, title, content, meta in stage_payloads:
            issues = evaluate_production_draft(stage, title, content, [])
            if issues:
                errors.extend(f"{where}[{stage}]: 门禁 {i['code']} — {i['message']}" for i in issues)
                continue
            meta["quality_gate"] = {"passed": True, "issues": [],
                                    "note": "静态门禁通过不等于实际图片/视频视觉验收通过"}
            rendered_cards.append({"card_id": card_id, "stage": stage, "content": content,
                                   "metadata_patch": meta})

    if errors:
        return {"ok": False, "errors": errors[:80], "error_count": len(errors)}
    result = {"ok": True, "cards": len(rendered_cards), "errors": []}
    if not check:
        out_dir = workdir / "rendered"
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{season}_ep{episode:02d}.json").write_text(
            json.dumps({"season": season, "episode": episode, "cards": rendered_cards},
                       ensure_ascii=False, indent=1), "utf-8")
    return result


# ── merge：把渲染结果写回卡池 ────────────────────────────────────

def merge_rendered(season: str | None, episode: int | None, workdir: Path) -> dict:
    stats = {"files": 0, "cards": 0, "missing": []}
    rendered_dir = workdir / "rendered"
    by_season: dict[str, list[dict]] = {}
    for path in sorted(rendered_dir.glob("*.json")):
        data = json.loads(path.read_text("utf-8"))
        if season and data["season"] != season:
            continue
        if episode is not None and data["episode"] != episode:
            continue
        by_season.setdefault(data["season"], []).append(data)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    for sea, batches in by_season.items():
        cards = _load_cards(sea)
        index = {c["card_id"]: c for c in cards}
        for batch in batches:
            for item in batch["cards"]:
                card = index.get(item["card_id"])
                if not card:
                    stats["missing"].append(item["card_id"])
                    continue
                card["content"] = item["content"]
                metadata = dict(card.get("metadata") or {})
                metadata.update(item["metadata_patch"])
                card["metadata"] = metadata
                card["status"] = "done"
                card["updated_at"] = now
                stats["cards"] += 1
            stats["files"] += 1
        _save_cards(sea, cards)
    return stats


# ── report：全池门禁与版本扫描 ───────────────────────────────────

def report_pool() -> dict:
    summary: dict[str, dict] = {}
    for path in sorted(PRODUCTION_ROOT.glob("jiulu-s*/cards.json")):
        season = path.parent.name
        cards = json.loads(path.read_text("utf-8"))
        counts = {"cards": 0, "gate_fail": 0, "v3": 0}
        for card in cards:
            if card.get("stage") not in ("storyboard", "img_prompt", "vid_prompt"):
                continue
            if (card.get("shot_number") or 0) <= 0:
                continue
            counts["cards"] += 1
            issues = evaluate_production_draft(card["stage"], card.get("title", ""),
                                               card.get("content", ""), card.get("prompts") or [])
            if issues:
                counts["gate_fail"] += 1
            meta = card.get("metadata") or {}
            if str(meta.get("prompt_schema_version", "")).startswith(("3.0", "2.0")) or \
                    str(meta.get("storyboard_schema_version", "")).startswith("2.1"):
                counts["v3"] += 1
        summary[season] = counts
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["extract", "render", "merge", "report"])
    parser.add_argument("--season")
    parser.add_argument("--episode", type=int)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--workdir", type=Path, default=DEFAULT_WORKDIR)
    args = parser.parse_args()
    if args.command == "extract":
        result = extract_packets(args.season, args.episode, args.workdir)
    elif args.command == "render":
        if not args.season or args.episode is None:
            parser.error("render 需要 --season 和 --episode")
        result = render_episode(args.season, args.episode, args.workdir, check=args.check)
    elif args.command == "merge":
        result = merge_rendered(args.season, args.episode, args.workdir)
    else:
        result = report_pool()
    print(json.dumps(result, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
