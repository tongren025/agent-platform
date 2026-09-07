"""漫剧生产的确定性质量门禁与人工媒体评分规则。

文本草稿使用静态规则拦截明显不可生产的内容；实际图片则由人工按同一套五维量表
评分，镜头视频与整集成片使用各自的六维量表。所有规则都只产生可解释结果，
不调用额外模型，也不会自动采用或删除媒体。
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

VIDEO_QUALITY_RUBRIC_VERSION = "video-v1"
VIDEO_QUALITY_MIN_SCORE = 85.0
VIDEO_QUALITY_RUBRIC: tuple[dict[str, Any], ...] = (
    {
        "key": "identity_stability",
        "label": "角色稳定性",
        "description": "运动全过程中脸、五官、服装和道具不漂移、不闪变",
        "weight": 25,
        "critical": True,
    },
    {
        "key": "motion_integrity",
        "label": "运动完整性",
        "description": "动作连贯，肢体、头发、衣物和物体运动没有断裂或穿模",
        "weight": 20,
        "critical": True,
    },
    {
        "key": "shot_fidelity",
        "label": "镜头符合度",
        "description": "运镜、景别、构图、动作节奏与本镜视频提示一致",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "temporal_continuity",
        "label": "时序连续性",
        "description": "首尾帧、角色位置、视线和环境变化可自然衔接相邻镜头",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "audio_dialogue",
        "label": "声音与对白",
        "description": "对白、口型、音效和环境声清楚同步，无明显爆音或断音",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "technical_integrity",
        "label": "技术完整性",
        "description": "无闪烁、重影、黑帧、编码损坏、水印或异常文字",
        "weight": 10,
        "critical": False,
    },
)

FINAL_QUALITY_RUBRIC_VERSION = "final-v1"
FINAL_QUALITY_MIN_SCORE = 88.0
FINAL_QUALITY_RUBRIC: tuple[dict[str, Any], ...] = (
    {
        "key": "narrative_continuity",
        "label": "叙事连贯性",
        "description": "情节因果、信息释放和人物动机完整，观众无需猜测缺失桥段",
        "weight": 25,
        "critical": True,
    },
    {
        "key": "visual_continuity",
        "label": "视觉连续性",
        "description": "跨镜角色、场景、时间、光线和动作承接一致",
        "weight": 20,
        "critical": True,
    },
    {
        "key": "pacing",
        "label": "节奏与情绪",
        "description": "镜头时长、转场和情绪起伏服务剧情，没有拖沓或突兀跳切",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "audio_mix",
        "label": "整体声音",
        "description": "对白可懂，音乐、音效和环境声层次平衡，镜间响度连续",
        "weight": 15,
        "critical": False,
    },
    {
        "key": "dialogue_delivery",
        "label": "对白呈现",
        "description": "口型、字幕、台词时序和角色语气一致，无错字漏字",
        "weight": 10,
        "critical": False,
    },
    {
        "key": "delivery_integrity",
        "label": "交付完整性",
        "description": "画幅、分辨率、首尾、黑帧、编码和完整播放均符合交付要求",
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

VIDEO_REJECTION_CORRECTIONS = {
    "identity_drift": "保持角色脸、五官、发型、服装和道具在全段运动中稳定不变",
    "motion_broken": "降低动作复杂度，确保肢体、头发、衣物和物体运动连续完整",
    "shot_mismatch": "严格执行本镜运镜、景别、动作幅度和时间节拍",
    "continuity_break": "首帧承接上一镜状态，尾帧准确落到下一镜所需位置和朝向",
    "audio_sync": "对白、口型、音效和环境声严格同步，保持人声清晰",
    "visual_artifact": "避免闪烁、重影、黑帧、水印、异常文字和编码损坏",
    "other": "严格修正人工视频验收补充说明中指出的问题",
}


def visual_quality_profile() -> dict[str, Any]:
    """返回前后端共用的精品图片评分规则。"""
    return media_quality_profile("image")


def media_quality_profile(kind: str) -> dict[str, Any]:
    """返回指定媒体阶段的评分规则，阈值只在后端维护。"""
    profiles = {
        "image": (
            VISUAL_QUALITY_RUBRIC_VERSION,
            VISUAL_QUALITY_MIN_SCORE,
            VISUAL_QUALITY_RUBRIC,
        ),
        "video": (
            VIDEO_QUALITY_RUBRIC_VERSION,
            VIDEO_QUALITY_MIN_SCORE,
            VIDEO_QUALITY_RUBRIC,
        ),
        "final": (
            FINAL_QUALITY_RUBRIC_VERSION,
            FINAL_QUALITY_MIN_SCORE,
            FINAL_QUALITY_RUBRIC,
        ),
    }
    if kind not in profiles:
        raise ValueError(f"未知质量规则：{kind}")
    version, minimum_score, rubric = profiles[kind]
    return {
        "version": version,
        "minimumScore": minimum_score,
        "minimumRating": VISUAL_QUALITY_MIN_RATING,
        "criticalMinimumRating": VISUAL_QUALITY_CRITICAL_MIN_RATING,
        "ratingScale": {"min": 1, "max": 5},
        "dimensions": [dict(item) for item in rubric],
    }


def evaluate_visual_quality(ratings: Mapping[str, object]) -> dict[str, Any]:
    """按五维量表计算可解释得分；缺项或越界直接拒绝，避免虚假高分。"""
    return evaluate_media_quality("image", ratings)


def evaluate_media_quality(
    kind: str,
    ratings: Mapping[str, object],
) -> dict[str, Any]:
    """按媒体阶段量表计算可解释得分；缺项或越界直接拒绝。"""
    profile = media_quality_profile(kind)
    rubric = profile["dimensions"]
    normalized: dict[str, int] = {}
    missing: list[str] = []
    for dimension in rubric:
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
        for item in rubric
    ), 1)
    failed_dimensions: list[dict[str, Any]] = []
    for item in rubric:
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
    minimum_score = float(profile["minimumScore"])
    passed = score >= minimum_score and not failed_dimensions
    return {
        "version": profile["version"],
        "kind": kind,
        "ratings": normalized,
        "score": score,
        "passed": passed,
        "failedDimensions": failed_dimensions,
        "summary": (
            f"精品验收通过，综合 {score:.1f} 分。"
            if passed
            else (
                f"综合 {score:.1f} 分，未达到 {minimum_score:.0f} 分"
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


def build_video_repair_prompt(
    base_prompt: str,
    reviews: list[Mapping[str, Any]],
) -> str:
    """把最近视频退回原因转成下一次生成的有限正向约束。"""
    corrections: list[str] = []
    seen: set[str] = set()
    for review in reversed(reviews):
        if str(review.get("verdict") or "") != "reject":
            continue
        reason = str(review.get("reason") or "other")
        if reason not in seen:
            corrections.append(
                VIDEO_REJECTION_CORRECTIONS.get(
                    reason,
                    VIDEO_REJECTION_CORRECTIONS["other"],
                )
            )
            seen.add(reason)
        note = " ".join(str(review.get("note") or "").split())[:200]
        if note and f"note:{note}" not in seen:
            corrections.append(f"人工视频验收补充：{note}")
            seen.add(f"note:{note}")
        if len(corrections) >= 5:
            break
    if not corrections:
        return base_prompt
    return (
        f"{base_prompt.rstrip()}\n\n"
        "【本次视频返工必须满足的正向硬约束】\n"
        + "\n".join(
            f"{index}. {item}"
            for index, item in enumerate(corrections, 1)
        )
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


def latest_video_review(
    metadata: Mapping[str, Any],
    video: str,
) -> Mapping[str, Any]:
    """取指定视频的最后一次评审，镜头视频和整集成片共用。"""
    reviews = [
        item
        for item in (metadata.get("video_reviews") or [])
        if str(item.get("video") or "") == video
    ]
    return reviews[-1] if reviews else {}


def video_candidate(
    metadata: Mapping[str, Any],
    video: str,
) -> Mapping[str, Any]:
    """取视频候选元数据；旧项目没有候选记录时返回空映射。"""
    return next(
        (
            item
            for item in (metadata.get("video_candidates") or [])
            if str(item.get("video") or "") == video
        ),
        {},
    )


def video_requires_precision_review(
    metadata: Mapping[str, Any],
    video: str,
) -> bool:
    """只有新质量链路产生的视频候选强制六维评分。"""
    return bool(video_candidate(metadata, video).get("review_required"))


def video_is_approved(
    metadata: Mapping[str, Any],
    status: str,
    video: str,
) -> bool:
    """判断镜头视频或整集成片是否已达到对应精品门槛。"""
    if not video:
        return False
    review = latest_video_review(metadata, video)
    if video_requires_precision_review(metadata, video):
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
        # 只审实际正向提示词；标题/说明和同一提示词的展示副本不参与计数。
        positive_prompts = list(dict.fromkeys(prompts or [content]))
        positive_text = "\n".join(positive_prompts)
        negative = [word for word in NEGATIVE_PHRASES if word.lower() in positive_text.lower()]
        if negative:
            add("negative_language", f"正向提示词混入负向表达：{'、'.join(negative)}")
        detail_count = max(
            (sum(word in prompt for word in HIGH_FREQUENCY_DETAILS) for prompt in positive_prompts),
            default=0,
        )
        if stage == "img_prompt" and detail_count > 3:
            add("visual_noise_risk", "高频纹理/粒子元素超过 3 项，存在噪点与主体失焦风险")

    if stage == "vid_prompt":
        motion = [word for word in FORBIDDEN_MOTION_WORDS if word.lower() in text.lower()]
        if motion:
            add("unstable_motion", f"包含易导致画面失稳的运动词：{'、'.join(motion)}")
        controlled_long_segment = any(
            marker in text
            for marker in ("【时间轴】", "时间轴：", "时间轴:", "逐秒时间轴")
        )
        for start_m, start_s, end_m, end_s in re.findall(
            r"\[(\d{1,2}):(\d{2})\s*[-~—]\s*(\d{1,2}):(\d{2})\]", text
        ):
            duration = (int(end_m) * 60 + int(end_s)) - (int(start_m) * 60 + int(start_s))
            if duration > 15 or (duration > 6 and not controlled_long_segment):
                add(
                    "segment_too_long",
                    (
                        f"存在 {duration} 秒生成段；7~15 秒连续镜头必须提供【时间轴】，"
                        "其它镜头单段不超过 6 秒"
                    ),
                )
                break
        for match in re.finditer(r"(?:一次生成|生成时长)(\d{1,2})s", text):
            duration = int(match.group(1))
            if duration > 15 or (duration > 6 and not controlled_long_segment):
                add(
                    "segment_too_long",
                    (
                        f"声明单次生成 {duration} 秒；7~15 秒连续镜头必须提供【时间轴】，"
                        "其它镜头单段不超过 6 秒"
                    ),
                )
                break

    return issues
