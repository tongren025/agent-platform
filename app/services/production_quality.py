"""漫剧生产的确定性质量门禁与人工视觉评分规则。

文本草稿使用静态规则拦截明显不可生产的内容；实际图片则由人工按同一套五维量表
评分。两者都只产生可解释结果，不调用额外模型，也不会自动采用或删除媒体。
"""
from __future__ import annotations

import re
from typing import Any, Mapping


ABSTRACT_VISUAL_PHRASES = (
    "环境主导", "自行演进", "神情落在", "欲言又止", "冷声宣告", "众人以为",
)
FORBIDDEN_MOTION_WORDS = ("快速", "高速", "飞速", "剧烈", "激烈", "fast")
NEGATIVE_PHRASES = ("不要", "避免", "禁止", "无噪点", "无颗粒", "无裂纹", "no ", "without")
HIGH_FREQUENCY_DETAILS = (
    "裂纹", "颗粒", "碎石", "锁链", "锈迹", "污渍", "血管纹", "火星", "尘埃", "粒子",
)

VISUAL_QUALITY_RUBRIC_VERSION = "visual-v1"
VISUAL_QUALITY_MIN_SCORE = 80.0
VISUAL_QUALITY_MIN_RATING = 3
VISUAL_QUALITY_CRITICAL_MIN_RATING = 4
VISUAL_QUALITY_RUBRIC: tuple[dict[str, Any], ...] = (
    {
        "key": "identity_consistency",
        "label": "角色一致性",
        "description": "脸、年龄、发型、服装、道具与当前角色时期母版一致",
        "weight": 30,
        "critical": True,
    },
    {
        "key": "composition_accuracy",
        "label": "分镜符合度",
        "description": "景别、机位、构图、动作和视线符合本镜分镜",
        "weight": 25,
        "critical": True,
    },
    {
        "key": "scene_consistency",
        "label": "场景一致性",
        "description": "空间布局、时间、天气、光线和关键道具连续",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "style_fidelity",
        "label": "风格忠实度",
        "description": "画风、色彩、材质和镜头质感符合项目视觉母版",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "technical_integrity",
        "label": "技术完整性",
        "description": "结构、手指、文字、边缘和光影没有明显生成瑕疵",
        "weight": 15,
        "critical": False,
    },
)

REJECTION_CORRECTIONS = {
    "tone_off": "保持项目视觉母版的色调、材质和光影层级",
    "character_drift": "严格复用当前角色时期的脸、发型、服装和标志性道具",
    "composition_mismatch": "严格执行本镜景别、机位、构图、动作和视线方向",
    "lighting_wrong": "保持场景既定时间、主光方向、明暗关系和色温",
    "anatomy_broken": "确保人体、手指、面部、服装边缘和道具结构完整",
    "scene_drift": "保持场景空间布局、天气、陈设和关键道具连续",
    "style_drift": "保持项目统一画风、材质语言和后期质感",
    "continuity_break": "承接上一镜角色位置、朝向、动作状态和环境变化",
    "text_artifact": "画面内文字、符号和标识必须清晰且符合设定",
    "other": "严格修正人工评审补充说明中指出的问题",
}


def visual_quality_profile() -> dict[str, Any]:
    """返回前后端共用的精品图片评分规则。"""
    return {
        "version": VISUAL_QUALITY_RUBRIC_VERSION,
        "minimumScore": VISUAL_QUALITY_MIN_SCORE,
        "minimumRating": VISUAL_QUALITY_MIN_RATING,
        "criticalMinimumRating": VISUAL_QUALITY_CRITICAL_MIN_RATING,
        "ratingScale": {"min": 1, "max": 5},
        "dimensions": [dict(item) for item in VISUAL_QUALITY_RUBRIC],
    }


def evaluate_visual_quality(ratings: Mapping[str, object]) -> dict[str, Any]:
    """按五维量表计算可解释得分；缺项或越界直接拒绝，避免虚假高分。"""
    normalized: dict[str, int] = {}
    missing: list[str] = []
    for dimension in VISUAL_QUALITY_RUBRIC:
        key = str(dimension["key"])
        if key not in ratings:
            missing.append(str(dimension["label"]))
            continue
        value = ratings[key]
        if isinstance(value, bool):
            raise ValueError(f"{dimension['label']}评分必须是 1-5 的整数")
        try:
            parsed = int(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{dimension['label']}评分必须是 1-5 的整数") from exc
        if parsed < 1 or parsed > 5 or parsed != value:
            raise ValueError(f"{dimension['label']}评分必须是 1-5 的整数")
        normalized[key] = parsed
    if missing:
        raise ValueError(f"精品验收缺少评分：{'、'.join(missing)}")

    score = round(sum(
        normalized[str(item["key"])] / 5 * int(item["weight"])
        for item in VISUAL_QUALITY_RUBRIC
    ), 1)
    failed_dimensions: list[dict[str, Any]] = []
    for item in VISUAL_QUALITY_RUBRIC:
        key = str(item["key"])
        required = (
            VISUAL_QUALITY_CRITICAL_MIN_RATING
            if item["critical"]
            else VISUAL_QUALITY_MIN_RATING
        )
        if normalized[key] < required:
            failed_dimensions.append({
                "key": key,
                "label": item["label"],
                "rating": normalized[key],
                "required": required,
            })
    passed = score >= VISUAL_QUALITY_MIN_SCORE and not failed_dimensions
    return {
        "version": VISUAL_QUALITY_RUBRIC_VERSION,
        "ratings": normalized,
        "score": score,
        "passed": passed,
        "failedDimensions": failed_dimensions,
        "summary": (
            f"精品验收通过，综合 {score:.1f} 分。"
            if passed
            else (
                f"综合 {score:.1f} 分，未达到 {VISUAL_QUALITY_MIN_SCORE:.0f} 分"
                if not failed_dimensions
                else "未通过：" + "、".join(
                    f"{item['label']} {item['rating']}/{item['required']}"
                    for item in failed_dimensions
                )
            )
        ),
    }


def build_image_repair_prompt(base_prompt: str, reviews: list[Mapping[str, Any]]) -> str:
    """把最近退回原因转成正向硬约束，供下一次生图复用。

    只读取 reject 记录；同一原因去重，人工备注最多保留 200 字，避免历史反馈无限膨胀。
    """
    corrections: list[str] = []
    seen: set[str] = set()
    for review in reversed(reviews):
        if str(review.get("verdict") or "") != "reject":
            continue
        reason = str(review.get("reason") or "other")
        if reason not in seen:
            corrections.append(REJECTION_CORRECTIONS.get(reason, REJECTION_CORRECTIONS["other"]))
            seen.add(reason)
        note = " ".join(str(review.get("note") or "").split())[:200]
        if note:
            note_key = f"note:{note}"
            if note_key not in seen:
                corrections.append(f"人工验收补充：{note}")
                seen.add(note_key)
        if len(corrections) >= 5:
            break
    if not corrections:
        return base_prompt
    return (
        f"{base_prompt.rstrip()}\n\n"
        "【本次返工必须满足的正向硬约束】\n"
        + "\n".join(f"{index}. {item}" for index, item in enumerate(corrections, 1))
    )


def latest_image_review(
    metadata: Mapping[str, Any],
    image: str,
) -> Mapping[str, Any]:
    """取指定图片的最后一次评审，保证历史版本的结论不会串到当前候选。"""
    reviews = [
        item
        for item in (metadata.get("image_reviews") or [])
        if str(item.get("image") or "") == image
    ]
    return reviews[-1] if reviews else {}


def image_candidate(
    metadata: Mapping[str, Any],
    image: str,
) -> Mapping[str, Any]:
    """取图片候选元数据；旧项目没有候选记录时返回空映射。"""
    return next(
        (
            item
            for item in (metadata.get("image_candidates") or [])
            if str(item.get("image") or "") == image
        ),
        {},
    )


def image_requires_precision_review(
    metadata: Mapping[str, Any],
    image: str,
) -> bool:
    """只有新质量链路生成的媒体强制五维评分，旧项目不会被批量判废。"""
    return bool(image_candidate(metadata, image).get("review_required"))


def image_is_approved(
    metadata: Mapping[str, Any],
    status: str,
    image: str,
) -> bool:
    """判断图片是否可进入视频阶段，兼容旧项目并严格约束新候选。"""
    if not image:
        return False
    review = latest_image_review(metadata, image)
    if image_requires_precision_review(metadata, image):
        quality = review.get("quality") or {}
        return (
            review.get("verdict") == "pass"
            and quality.get("passed") is True
        )
    return status != "review" and review.get("verdict") != "reject"


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
