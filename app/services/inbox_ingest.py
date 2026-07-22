"""回填收件箱：按文件名规则把外部生成的图/视频批量分拣到生产卡。

真实生产路径是小云雀/即梦半自动——平台此前只有「导出提示词」出口，
回填入口要逐卡手动上传，一集几十个文件的摩擦是每天的摩擦。
收件箱按文件名约定自动挂卡，识别不了的进未分拣列表由人处理。

文件名约定（大小写不敏感，分隔符 _ - 空格均可）：
    EP01_G03_首帧_v2.png   → EP1 G3 的首帧 img_prompt 卡 images
    EP01_G03_末帧.png      → EP1 G3 标题含「末帧」的 img_prompt 卡
    EP01_G03_分镜.png      → EP1 G3 的 storyboard 卡（「故事板」同义）
    EP01_G1-A.mp4          → EP1 G1 子段 A 的 vid_prompt 卡 videos
    EP01_G03.mp4           → EP1 G3 唯一 vid_prompt 卡（多张子段时拒收，要求带子段标签）
    TB1.png / tone-01.png  → 基调板卡 g-tone-01（全局，无需集数）
缺省集数由调用方传入（单集页上传时默认当前集）。
"""
from __future__ import annotations

import re
from typing import Any, Optional

VIDEO_EXTS = {".mp4", ".mov", ".webm", ".m4v"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

_EP_RE = re.compile(r"(?:ep|e|第)\s*0*(\d{1,3})\s*集?", re.I)
# 子段字母后必须是词边界，防止 G1_final 的 f 被误判成子段标签
_UNIT_RE = re.compile(r"g\s*0*(\d{1,2})\s*[-_]?\s*([a-h](?![a-z0-9]))?", re.I)
_TONE_RE = re.compile(r"(?:tb|tone[-_]?0?)(\d)", re.I)


def parse_inbox_filename(filename: str, default_episode: Optional[int] = None) -> dict:
    """解析文件名 → {kind, episode, unit, subsegment, ext, ok, reason}。

    kind: tone_board / first_frame / last_frame / storyboard / video
    解析失败时 ok=False 且 reason 说明缺什么——未分拣原因要能直接指导改名。
    """
    stem, _, ext = filename.rpartition(".")
    ext = ("." + ext.lower()) if ext else ""
    stem = stem or filename
    is_video = ext in VIDEO_EXTS
    if not is_video and ext not in IMAGE_EXTS:
        return {"ok": False, "reason": f"不支持的文件类型 {ext or '(无扩展名)'}"}

    tone = _TONE_RE.search(stem)
    if tone and not is_video:
        return {"ok": True, "kind": "tone_board", "tone_number": int(tone.group(1)), "ext": ext}

    ep_match = _EP_RE.search(stem)
    episode = int(ep_match.group(1)) if ep_match else default_episode
    if episode is None:
        return {"ok": False, "reason": "文件名没有集数（如 EP01），且未指定默认集"}

    # 集数命中的片段要从 G 匹配范围中排除，避免 "EP01" 的 "01" 被当成 G1
    unit_zone = stem[ep_match.end():] if ep_match else stem
    unit_match = _UNIT_RE.search(unit_zone)
    if not unit_match:
        return {"ok": False, "reason": "文件名没有 G 单元号（如 G3 或 G1-A）"}
    unit = int(unit_match.group(1))
    sub = (unit_match.group(2) or "").upper()

    if is_video:
        return {"ok": True, "kind": "video", "episode": episode, "unit": unit,
                "subsegment": f"G{unit}-{sub}" if sub else "", "ext": ext}

    low = stem.lower()
    if "末帧" in stem:
        kind = "last_frame"
    elif "分镜" in stem or "故事板" in stem or "storyboard" in low:
        kind = "storyboard"
    else:
        kind = "first_frame"  # 图片缺省按首帧
    return {"ok": True, "kind": kind, "episode": episode, "unit": unit, "ext": ext}


def resolve_inbox_target(cards: list[Any], parsed: dict) -> tuple[Optional[Any], str, str]:
    """按解析结果在卡池中定位目标卡。

    返回 (card, slot, reason)；card=None 时 reason 说明为什么没匹配上。
    slot: images / videos。cards 元素为 ProductionCard（属性访问）。
    """
    kind = parsed["kind"]

    if kind == "tone_board":
        cid = f"g-tone-{parsed['tone_number']:02d}"
        card = next((c for c in cards if c.card_id == cid), None)
        return (card, "images", "") if card else (None, "", f"基调板卡 {cid} 不存在")

    ep, unit = parsed["episode"], parsed["unit"]
    in_unit = [c for c in cards if c.episode == ep and c.shot_number == unit]
    if not in_unit:
        return None, "", f"EP{ep} 没有 G{unit} 单元"

    if kind == "video":
        vps = [c for c in in_unit if c.stage == "vid_prompt"
               and not (c.metadata or {}).get("superseded_by")]
        if parsed["subsegment"]:
            card = next((c for c in vps
                         if (c.metadata or {}).get("subsegment") == parsed["subsegment"]), None)
            return (card, "videos", "") if card else \
                (None, "", f"EP{ep} 没有子段 {parsed['subsegment']} 的视频提示词卡")
        if len(vps) == 1:
            return vps[0], "videos", ""
        if not vps:
            return None, "", f"EP{ep} G{unit} 没有视频提示词卡"
        return None, "", f"EP{ep} G{unit} 有 {len(vps)} 张子段卡，文件名需带子段标签（如 G{unit}-A）"

    if kind == "storyboard":
        sbs = [c for c in in_unit if c.stage == "storyboard"]
        return (sbs[0], "images", "") if sbs else (None, "", f"EP{ep} G{unit} 没有分镜卡")

    # first_frame / last_frame → img_prompt 卡，按标题区分首末帧
    ips = [c for c in in_unit if c.stage == "img_prompt"]
    if not ips:
        return None, "", f"EP{ep} G{unit} 没有图片提示词卡"
    want_last = kind == "last_frame"
    matched = [c for c in ips if ("末帧" in c.title) == want_last]
    if matched:
        return matched[0], "images", ""
    if want_last:
        return None, "", f"EP{ep} G{unit} 没有末帧卡（该 G 未启用 FLF 末帧锁）"
    return ips[0], "images", ""
