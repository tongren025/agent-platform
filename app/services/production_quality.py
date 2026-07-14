"""漫剧生产提示词的静态质量门禁。"""
from __future__ import annotations

import re


ABSTRACT_VISUAL_PHRASES = (
    "环境主导", "自行演进", "神情落在", "欲言又止", "冷声宣告", "众人以为",
)
FORBIDDEN_MOTION_WORDS = ("快速", "高速", "飞速", "剧烈", "激烈", "fast")
NEGATIVE_PHRASES = ("不要", "避免", "禁止", "无噪点", "无颗粒", "无裂纹", "no ", "without")
HIGH_FREQUENCY_DETAILS = (
    "裂纹", "颗粒", "碎石", "锁链", "锈迹", "污渍", "血管纹", "火星", "尘埃", "粒子",
)


def evaluate_production_draft(stage: str, title: str, content: str, prompts: list[str]) -> list[dict]:
    """检查 AI 草稿是否可直接生产，返回带 code/message 的问题列表。

    该函数只做确定性静态检查，不替代对实际图片、视频的人工视觉验收。
    """
    text = "\n".join([title, content, *prompts])
    issues: list[dict] = []

    def add(code: str, message: str) -> None:
        if not any(item["code"] == code for item in issues):
            issues.append({"code": code, "message": message})

    if stage == "storyboard":
        found = [word for word in ABSTRACT_VISUAL_PHRASES if word in text]
        if found:
            add("abstract_visual", f"存在不可直接绘制的抽象描述：{'、'.join(found)}")
        required = ("起始姿态", "结束姿态", "画面位置", "视线方向", "前景", "中景", "背景")
        missing = [field for field in required if field not in text]
        if missing:
            add("storyboard_fields_missing", f"分镜缺少生产字段：{'、'.join(missing)}")

    if stage in ("img_prompt", "vid_prompt"):
        negative = [word for word in NEGATIVE_PHRASES if word.lower() in text.lower()]
        if negative:
            add("negative_language", f"正向提示词混入负向表达：{'、'.join(negative)}")
        detail_count = sum(text.count(word) for word in HIGH_FREQUENCY_DETAILS)
        if stage == "img_prompt" and detail_count > 3:
            add("visual_noise_risk", "高频纹理/粒子元素超过 3 项，存在噪点与主体失焦风险")

    if stage == "vid_prompt":
        motion = [word for word in FORBIDDEN_MOTION_WORDS if word.lower() in text.lower()]
        if motion:
            add("unstable_motion", f"包含易导致画面失稳的运动词：{'、'.join(motion)}")
        for start_m, start_s, end_m, end_s in re.findall(
            r"\[(\d{1,2}):(\d{2})\s*[-~—]\s*(\d{1,2}):(\d{2})\]", text
        ):
            duration = (int(end_m) * 60 + int(end_s)) - (int(start_m) * 60 + int(start_s))
            if duration > 6:
                add("segment_too_long", f"存在 {duration} 秒连续生成段，单段必须不超过 6 秒")
                break
        for match in re.finditer(r"(?:一次生成|生成时长)(\d{1,2})s", text):
            if int(match.group(1)) > 6:
                add("segment_too_long", f"声明单次生成 {match.group(1)} 秒，连续生成段必须不超过 6 秒")
                break

    return issues
