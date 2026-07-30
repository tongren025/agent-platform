"""生产项目诊断：把缺项、质量门禁和媒体阻塞收敛成可执行问题清单。

该模块只做纯计算，不读写磁盘、不调用模型。API、导演工作台和测试可以共用同一份
判断，避免“页面显示完成，但下一步仍然不可生产”的状态漂移。
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, Optional

from app.models.production import ProductionCard, ProductionProject
from app.services.production_quality import (
    image_is_approved,
    image_requires_precision_review,
)


SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")
STAGE_LABELS = {
    "script": "剧本",
    "storyboard": "逐镜分镜",
    "img_prompt": "画面提示",
    "vid_prompt": "视频提示",
    "image": "镜头图片",
    "video": "镜头视频",
    "final": "成片",
}
GOAL_REQUIREMENTS = {
    "storyboard": ("script", "storyboard"),
    "images": ("script", "storyboard", "img_prompt", "image"),
    "final": (*SPEC_STAGES, "image", "video", "final"),
}
# 健康分按交付价值加权，而不是按卡片数量平均。否则大型项目少一条成片只扣
# 0.1 分，四舍五入后甚至会显示 100 分。
GOAL_SCORE_WEIGHTS = {
    "storyboard": {
        "source": 10,
        "script": 35,
        "storyboard": 55,
    },
    "images": {
        "source": 5,
        "script": 15,
        "storyboard": 20,
        "img_prompt": 20,
        "image": 40,
    },
    "final": {
        "source": 5,
        "script": 10,
        "storyboard": 15,
        "img_prompt": 10,
        "image": 20,
        "vid_prompt": 10,
        "video": 20,
        "final": 10,
    },
}
SCORE_GROUPS = (
    ("content", "内容规格", ("source", "script", "storyboard", "production_units")),
    ("prompt", "模型提示", ("img_prompt", "vid_prompt")),
    ("media", "媒体资产", ("image", "video")),
    ("delivery", "交付成片", ("final",)),
)
STAGE_ACCEPTANCE_CRITERIA = {
    "script": [
        "镜头或 G 单元编号、时间范围和可见动作明确",
        "剧情事实、角色关系和上下游引用保持不变",
    ],
    "storyboard": [
        "画面内容、角色动作、景别运镜、光影、时长和承接信息齐全",
        "只使用可直接绘制的名词和动作，单个连续生成段不超过 6 秒",
    ],
    "img_prompt": [
        "一条提示词只描述一个主体、一个明确动作和一套光影构图",
        "只写希望出现的内容，不混入负向措辞或过量纹理粒子",
    ],
    "vid_prompt": [
        "一张卡只描述一个不超过 6 秒的连续动作",
        "角色动作与唯一运镜分开描述，不使用快速或剧烈运动词",
    ],
}
STAGE_ORDER = {
    "source": 0,
    "script": 10,
    "storyboard": 20,
    "img_prompt": 30,
    "image": 40,
    "vid_prompt": 50,
    "video": 60,
    "final": 70,
}
ACTIVE_VIDEO_STATUSES = {"pending", "in_progress", "queued", "processing", "running"}
READY_VIDEO_STATUSES = {"completed", "complete", "succeeded", "success", "done", "ready"}


def _issue_id(code: str, stage: str, episode: Optional[int], unit: Optional[int]) -> str:
    """为同一个逻辑问题生成稳定 ID；重生成卡片后 ID 仍保持不变。"""
    raw = json.dumps(
        [code, stage, episode, unit],
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]


def _issue(
    *,
    code: str,
    stage: str,
    message: str,
    action: dict[str, Any],
    episode: Optional[int] = None,
    unit: Optional[int] = None,
    card: ProductionCard | None = None,
    severity: str = "blocker",
    details: list[str] | None = None,
    detail_codes: list[str] | None = None,
    acceptance_criteria: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "id": _issue_id(code, stage, episode, unit),
        "code": code,
        "severity": severity,
        "stage": stage,
        "stageLabel": STAGE_LABELS.get(stage, stage),
        "episode": episode,
        "unit": unit,
        "cardId": card.card_id if card else "",
        "message": message,
        "details": details or [],
        "detailCodes": detail_codes or [],
        "acceptanceCriteria": (
            acceptance_criteria
            if acceptance_criteria is not None
            else STAGE_ACCEPTANCE_CRITERIA.get(stage, [])
        ),
        "autoFixable": action.get("kind") == "generate_stage",
        "action": action,
    }


def _logical_unit(card: ProductionCard) -> int:
    """把不同存储粒度的卡片归一到 G 单元。

    历史项目会把逐镜分镜按 S1/S2/S3 分卡保存，但图片/视频提示按 G1/G2
    保存。此时 `shot_number` 是子镜头序号，`unit_number/g_unit` 才是共同主键。
    """
    unit_number = _positive_int(card.metadata.get("unit_number"))
    if unit_number:
        return unit_number
    g_unit = str(card.metadata.get("g_unit") or "").strip().upper()
    if g_unit.startswith("G"):
        parsed = _positive_int(g_unit[1:])
        if parsed:
            return parsed
    return card.shot_number if card.shot_number > 0 else 0


def _active_cards(
    cards: list[ProductionCard],
    episode: Optional[int],
    unit: int,
    stage: str,
) -> list[ProductionCard]:
    """取 G 单元内各物理子槽位的最新卡片，避免旧返工版本遮住新版本。"""
    result: list[ProductionCard] = []
    seen_slots: set[int] = set()
    for card in reversed(cards):
        if (
            card.episode != episode
            or card.stage != stage
            or _logical_unit(card) != unit
            or (stage == "img_prompt" and _is_end_frame_lock(card))
            or card.shot_number in seen_slots
        ):
            continue
        seen_slots.add(card.shot_number)
        result.append(card)

    # 连续剧常把整集剧本保存在 shot_number=0 的一张卡里；它覆盖该集所有 G，
    # 不能强迫用户复制成几十张内容相同的剧本卡。
    if not result and stage == "script":
        episode_script = next(
            (
                card
                for card in reversed(cards)
                if card.episode == episode
                and card.stage == "script"
                and card.shot_number == 0
                and (card.content.strip() or card.prompts)
            ),
            None,
        )
        if episode_script is not None:
            result.append(episode_script)
    return result


def active_card_for_unit(
    cards: list[ProductionCard],
    episode: Optional[int],
    unit: int,
    stage: str,
) -> ProductionCard | None:
    """返回 G 单元内可供导演主线展示和执行的最新代表卡。"""
    active_cards = _active_cards(cards, episode, unit, stage)
    return active_cards[0] if active_cards else None


def _active_card(
    cards: list[ProductionCard],
    episode: Optional[int],
    unit: int,
    stage: str,
) -> ProductionCard | None:
    """内部兼容入口；逐单元媒体检查只需要一张代表卡。"""
    return active_card_for_unit(cards, episode, unit, stage)


def _is_end_frame_lock(card: ProductionCard) -> bool:
    """识别 FLF 末帧锁；它是附属资产，不能单独建立一个 G 生产单元。"""
    title = card.title.strip().lower()
    return card.stage == "img_prompt" and (
        "末帧" in title
        or "flf" in title
    )


def production_unit_keys(
    cards: list[ProductionCard],
) -> list[tuple[Optional[int], int]]:
    """从逐镜规格卡识别 G 单元，同时兼容集级剧本与子镜头分镜。"""
    keys = {
        (card.episode, _logical_unit(card))
        for card in cards
        if card.stage in SPEC_STAGES
        and _logical_unit(card) > 0
        and not _is_end_frame_lock(card)
    }
    for card in cards:
        if card.stage != "script" or card.shot_number != 0:
            continue
        for unit in range(1, _positive_int(card.metadata.get("g_count")) + 1):
            keys.add((card.episode, unit))
    return sorted(
        keys,
        key=lambda item: (-1 if item[0] is None else item[0], item[1]),
    )


def _active_image(card: ProductionCard | None) -> str:
    if card is None:
        return ""
    if "active_image" in card.metadata:
        return str(card.metadata.get("active_image") or "")
    return str(card.images[-1]) if card.images else ""


def _current_image_review(card: ProductionCard | None, image: str) -> dict[str, Any]:
    if card is None or not image:
        return {}
    reviews = [
        review
        for review in (card.metadata.get("image_reviews") or [])
        if str(review.get("image") or "") == image
    ]
    return reviews[-1] if reviews else {}


def _approved_image_count(card: ProductionCard) -> int:
    """旧聚合卡按历史数量兼容；新候选只统计真正通过精品验收的图片。"""
    precision_images = [
        image
        for image in card.images
        if image_requires_precision_review(card.metadata, str(image))
    ]
    if not precision_images:
        return len(card.images)
    legacy_count = len(card.images) - len(precision_images)
    precision_count = sum(
        1
        for image in precision_images
        if image_is_approved(card.metadata, card.status, str(image))
    )
    return legacy_count + precision_count


def _video_state(card: ProductionCard | None, image: str) -> tuple[bool, bool]:
    """返回 (已完成, 处理中)，并拒绝把旧图片/旧提示词产生的视频算作当前版本。"""
    if card is None:
        return False, False
    job = card.metadata.get("openrouter_video_job") or {}
    status = str(job.get("status") or "").strip().lower()
    prompt = (card.prompts[0] if card.prompts else card.content).strip()
    inputs_match = (
        (not job.get("imageUrl") or not image or str(job.get("imageUrl")) == image)
        and (not job.get("prompt") or not prompt or str(job.get("prompt")).strip() == prompt)
    )
    processing = bool(job) and inputs_match and status in ACTIVE_VIDEO_STATUSES
    ready = bool(card.videos) and inputs_match and (
        not job or not status or status in READY_VIDEO_STATUSES
    )
    return ready, processing


def _generate_action(
    stage: str,
    *,
    episode: Optional[int],
    unit: Optional[int],
    mode: str,
    label: str,
) -> dict[str, Any]:
    return {
        "kind": "generate_stage",
        "label": label,
        "targetStage": stage,
        "episode": episode,
        "shotNumber": unit,
        "mode": mode,
    }


def _review_action(
    *,
    card: ProductionCard,
    episode: Optional[int],
    unit: Optional[int],
) -> dict[str, Any]:
    """返回人工确认动作；没有失败原因的 review 卡不能擅自重写。"""
    return {
        "kind": "review_card",
        "label": "打开内容并确认",
        "cardId": card.card_id,
        "episode": episode,
        "shotNumber": unit,
    }


def _slot_label(episode: Optional[int], unit: Optional[int]) -> str:
    episode_label = "全局" if episode is None else f"EP{episode:02d}"
    return episode_label if unit is None else f"{episode_label} / G{unit}"


def _positive_int(value: object) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return 0
    return parsed if parsed > 0 else 0


def _aggregate_expected_units(cards: list[ProductionCard]) -> int:
    """识别旧项目里“整支预告聚合在一张卡”的镜头总数。"""
    expected = 0
    for card in cards:
        if card.stage not in SPEC_STAGES:
            continue
        order = card.metadata.get("prompt_order")
        if isinstance(order, list):
            expected = max(expected, len(order))
        for key in ("shot_count", "prompt_count", "keyframe_count"):
            expected = max(expected, _positive_int(card.metadata.get(key)))
    return expected


def _aggregate_card(cards: list[ProductionCard], stage: str) -> ProductionCard | None:
    return next(
        (
            card
            for card in reversed(cards)
            if card.stage == stage
            and not _is_end_frame_lock(card)
            and (card.content.strip() or card.prompts)
        ),
        None,
    )


def _diagnose_aggregate_project(
    cards: list[ProductionCard],
    requirements: tuple[str, ...],
    expected: int,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """兼容没有逐镜卡、但 metadata 已声明镜头顺序/数量的历史 GC。"""
    checks: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    for stage in requirements:
        if stage not in SPEC_STAGES:
            continue
        card = _aggregate_card(cards, stage)
        passed = expected if card else 0
        if card is None:
            issues.append(_issue(
                code="stage_missing",
                stage=stage,
                message=f"聚合项目缺少{STAGE_LABELS[stage]}。",
                action=_generate_action(
                    stage,
                    episode=None,
                    unit=None,
                    mode="append",
                    label=f"补齐{STAGE_LABELS[stage]}",
                ),
            ))
        else:
            gate = card.metadata.get("quality_gate") or {}
            gate_issues = gate.get("issues") or []
            if gate.get("passed") is False or gate_issues:
                passed = 0
                issues.append(_issue(
                    code="quality_gate_failed",
                    stage=stage,
                    card=card,
                    message=f"聚合项目的{STAGE_LABELS[stage]}未通过质量门禁。",
                    details=[
                        str(item.get("message") or item.get("code") or "未知质量问题")
                        for item in gate_issues
                    ],
                    detail_codes=[
                        str(item.get("code") or "")
                        for item in gate_issues
                        if item.get("code")
                    ],
                    action=_generate_action(
                        stage,
                        episode=None,
                        unit=None,
                        mode="replace",
                        label=f"返工{STAGE_LABELS[stage]}",
                    ),
                ))
            elif card.status == "review":
                passed = 0
                issues.append(_issue(
                    code="manual_review_required",
                    stage=stage,
                    card=card,
                    message=f"聚合项目的{STAGE_LABELS[stage]}仍在待审核状态。",
                    action=_review_action(
                        card=card,
                        episode=None,
                        unit=None,
                    ),
                ))
        checks.append({
            "key": stage,
            "label": STAGE_LABELS[stage],
            "passed": passed == expected,
            "total": expected,
            "passedCount": passed,
        })

    if "image" in requirements:
        visual_cards = [
            card
            for card in cards
            if card.stage not in {"idea", "setting", "design"}
        ]
        available = min(
            max((_approved_image_count(card) for card in visual_cards), default=0),
            expected,
        )
        checks.append({
            "key": "image",
            "label": STAGE_LABELS["image"],
            "passed": available == expected,
            "total": expected,
            "passedCount": available,
        })
        if available < expected:
            prompt_card = _aggregate_card(cards, "img_prompt")
            issues.append(_issue(
                code="image_missing",
                stage="image",
                message=f"聚合项目还差 {expected - available} 张镜头图片。",
                card=prompt_card,
                action={
                    "kind": "open_media",
                    "mediaKind": "image",
                    "label": "选择模型生成图片",
                    "cardId": prompt_card.card_id if prompt_card else "",
                },
            ))

    videos_ready = False
    if "video" in requirements:
        available = min(
            max(
                (
                    len(card.videos)
                    for card in cards
                    if card.stage != "final"
                ),
                default=0,
            ),
            expected,
        )
        videos_ready = available == expected
        checks.append({
            "key": "video",
            "label": STAGE_LABELS["video"],
            "passed": videos_ready,
            "total": expected,
            "passedCount": available,
        })
        if not videos_ready:
            video_card = _aggregate_card(cards, "vid_prompt")
            issues.append(_issue(
                code="video_missing",
                stage="video",
                message=f"聚合项目还差 {expected - available} 个镜头视频。",
                card=video_card,
                action={
                    "kind": "open_media",
                    "mediaKind": "video",
                    "label": "选择模型生成视频",
                    "cardId": video_card.card_id if video_card else "",
                },
            ))

    if "final" in requirements:
        final_card = next(
            (
                card
                for card in reversed(cards)
                if card.stage == "final" and card.status == "done" and card.videos
            ),
            None,
        )
        final_ready = bool(final_card) and videos_ready
        checks.append({
            "key": "final",
            "label": STAGE_LABELS["final"],
            "passed": final_ready,
            "total": 1,
            "passedCount": int(final_ready),
        })
        if videos_ready and not final_ready:
            issues.append(_issue(
                code="final_missing",
                stage="final",
                message="全部镜头视频已就绪，但还没有合成当前版本的成片。",
                action={"kind": "compose", "label": "合成成片预览"},
            ))
    return checks, issues


def _sort_issues(issues: list[dict[str, Any]]) -> list[dict[str, Any]]:
    severity_order = {"blocker": 0, "warning": 1, "info": 2}
    return sorted(
        issues,
        key=lambda item: (
            severity_order.get(item["severity"], 9),
            STAGE_ORDER.get(item["stage"], 999),
            -1 if item["episode"] is None else item["episode"],
            item["unit"] or 0,
            item["code"],
        ),
    )


def _score_checks(
    goal: str,
    checks: list[dict[str, Any]],
) -> tuple[int, list[dict[str, Any]]]:
    """按目标阶段计算可解释健康分，并把每项权重写回检查结果。"""
    check_keys = {str(check["key"]) for check in checks}
    if "production_units" in check_keys:
        # 还没建立生产主键时，不能用尚不存在的数百张卡片稀释问题。
        weights = {"source": 10, "production_units": 90}
    else:
        weights = GOAL_SCORE_WEIGHTS.get(goal, GOAL_SCORE_WEIGHTS["final"])

    for check in checks:
        total = max(0, int(check["total"]))
        passed = max(0, min(int(check["passedCount"]), total))
        completion = passed / total if total else 0
        weight = int(weights.get(str(check["key"]), 0))
        check["weight"] = weight
        check["completion"] = round(completion * 100)
        check["weightedScore"] = round(completion * weight, 1)

    breakdown: list[dict[str, Any]] = []
    for group_key, label, keys in SCORE_GROUPS:
        group_checks = [check for check in checks if check["key"] in keys]
        weight = sum(int(check["weight"]) for check in group_checks)
        if weight <= 0:
            continue
        score = round(sum(float(check["weightedScore"]) for check in group_checks), 1)
        breakdown.append({
            "key": group_key,
            "label": label,
            "score": score,
            "weight": weight,
        })

    score = round(sum(float(check["weightedScore"]) for check in checks))
    return max(0, min(score, 100)), breakdown


def diagnose_project(
    project: ProductionProject,
    cards: list[ProductionCard],
) -> dict[str, Any]:
    """生成项目健康报告和下一条可执行动作。

    诊断以项目交付目标为边界：只做到故事板的项目不会被“还没视频”误判为失败。
    """
    goal = project.production_goal
    requirements = GOAL_REQUIREMENTS.get(goal, GOAL_REQUIREMENTS["final"])
    unit_keys = production_unit_keys(cards)
    aggregate_units = _aggregate_expected_units(cards) if not unit_keys else 0
    issues: list[dict[str, Any]] = []
    checks: list[dict[str, Any]] = []

    has_source = bool(project.source_content.strip()) or any(
        card.stage == "idea" and card.content.strip()
        for card in cards
    )
    checks.append({
        "key": "source",
        "label": "创意素材",
        "passed": has_source,
        "total": 1,
        "passedCount": int(has_source),
    })
    if not has_source:
        issues.append(_issue(
            code="source_missing",
            stage="source",
            message="项目还没有可供生成的创意、原著或需求素材。",
            action={
                "kind": "edit_project",
                "label": "补充项目素材",
            },
        ))

    if aggregate_units:
        aggregate_checks, aggregate_issues = _diagnose_aggregate_project(
            cards,
            requirements,
            aggregate_units,
        )
        checks.extend(aggregate_checks)
        issues.extend(aggregate_issues)
    # 只有原始素材、还没有 G 单元时，先用一次完整剧本生成建立生产主键。
    elif not unit_keys:
        script_ready = any(
            card.stage == "script" and card.content.strip()
            for card in cards
        )
        checks.append({
            "key": "production_units",
            "label": "生产单元",
            "passed": False,
            "total": 1,
            "passedCount": 0,
        })
        if has_source:
            issues.append(_issue(
                code="production_units_missing",
                stage="script",
                message=(
                    "还没有可逐镜推进的 G 生产单元。"
                    if not script_ready
                    else "现有剧本没有识别出 G 生产单元，需要重新结构化。"
                ),
                episode=None if project.source_type == "gc" else 1,
                action=_generate_action(
                    "script",
                    episode=None if project.source_type == "gc" else 1,
                    unit=None,
                    mode="replace" if script_ready else "append",
                    label="生成结构化剧本",
                ),
            ))
    else:
        for stage in requirements:
            if stage not in SPEC_STAGES:
                continue
            passed = 0
            for episode, unit in unit_keys:
                stage_cards = _active_cards(cards, episode, unit, stage)
                if not stage_cards:
                    issues.append(_issue(
                        code="stage_missing",
                        stage=stage,
                        episode=episode,
                        unit=unit,
                        message=f"{_slot_label(episode, unit)} 缺少{STAGE_LABELS[stage]}。",
                        action=_generate_action(
                            stage,
                            episode=episode,
                            unit=unit,
                            mode="append",
                            label=f"补齐{STAGE_LABELS[stage]}",
                        ),
                    ))
                    continue

                failed_card = next(
                    (
                        candidate
                        for candidate in stage_cards
                        if (
                            (candidate.metadata.get("quality_gate") or {}).get("passed")
                            is False
                            or (candidate.metadata.get("quality_gate") or {}).get("issues")
                        )
                    ),
                    None,
                )
                if failed_card is not None:
                    gate = failed_card.metadata.get("quality_gate") or {}
                    gate_issues = gate.get("issues") or []
                    detail_messages = [
                        str(item.get("message") or item.get("code") or "未知质量问题")
                        for item in gate_issues
                    ]
                    issues.append(_issue(
                        code="quality_gate_failed",
                        stage=stage,
                        episode=episode,
                        unit=unit,
                        card=failed_card,
                        message=f"{_slot_label(episode, unit)} 的{STAGE_LABELS[stage]}未通过质量门禁。",
                        details=detail_messages,
                        detail_codes=[
                            str(item.get("code") or "")
                            for item in gate_issues
                            if item.get("code")
                        ],
                        action=_generate_action(
                            stage,
                            episode=episode,
                            unit=unit,
                            mode="replace",
                            label=f"返工{STAGE_LABELS[stage]}",
                        ),
                    ))
                    continue

                # 图片被人工退回时，提示词本身仍可能合格；交给图片检查生成精准问题。
                review_card = next(
                    (
                        candidate
                        for candidate in stage_cards
                        if candidate.status == "review"
                        and _current_image_review(
                            candidate,
                            _active_image(candidate) if stage == "img_prompt" else "",
                        ).get("verdict") != "reject"
                    ),
                    None,
                )
                if review_card is not None:
                    issues.append(_issue(
                        code="manual_review_required",
                        stage=stage,
                        episode=episode,
                        unit=unit,
                        card=review_card,
                        message=f"{_slot_label(episode, unit)} 的{STAGE_LABELS[stage]}仍在待审核状态。",
                        action=_review_action(
                            card=review_card,
                            episode=episode,
                            unit=unit,
                        ),
                    ))
                    continue
                passed += 1
            checks.append({
                "key": stage,
                "label": STAGE_LABELS[stage],
                "passed": passed == len(unit_keys),
                "total": len(unit_keys),
                "passedCount": passed,
            })

        if "image" in requirements:
            passed = 0
            for episode, unit in unit_keys:
                prompt_card = _active_card(cards, episode, unit, "img_prompt")
                image_card = prompt_card or _active_card(cards, episode, unit, "storyboard")
                image = _active_image(image_card)
                review = _current_image_review(image_card, image)
                image_approved = bool(
                    image_card
                    and image_is_approved(image_card.metadata, image_card.status, image)
                )
                if not image:
                    issues.append(_issue(
                        code="image_missing",
                        stage="image",
                        episode=episode,
                        unit=unit,
                        card=image_card,
                        message=f"{_slot_label(episode, unit)} 还没有镜头图片。",
                        action={
                            "kind": "open_media",
                            "mediaKind": "image",
                            "label": "选择模型生成图片",
                            "cardId": image_card.card_id if image_card else "",
                        },
                    ))
                elif review.get("verdict") == "reject":
                    reason = str(review.get("reason") or "人工审核未通过")
                    note = str(review.get("note") or "").strip()
                    issues.append(_issue(
                        code="image_review_failed",
                        stage="image",
                        episode=episode,
                        unit=unit,
                        card=image_card,
                        message=f"{_slot_label(episode, unit)} 的当前图片已被退回：{reason}。",
                        details=[note] if note else [],
                        action={
                            "kind": "open_media",
                            "mediaKind": "image",
                            "label": "修改提示词并重新生图",
                            "cardId": image_card.card_id if image_card else "",
                        },
                    ))
                elif not image_approved:
                    quality = review.get("quality") or {}
                    score = quality.get("score")
                    details = (
                        [f"当前综合评分：{score} / 100"]
                        if score is not None
                        else []
                    )
                    issues.append(_issue(
                        code="image_quality_review_required",
                        stage="image",
                        episode=episode,
                        unit=unit,
                        card=image_card,
                        message=f"{_slot_label(episode, unit)} 的当前图片尚未通过精品五维验收。",
                        details=details,
                        acceptance_criteria=[
                            "角色一致性和分镜符合度均不低于 4/5",
                            "其他视觉维度均不低于 3/5，综合分不低于 80/100",
                        ],
                        action=_review_action(
                            card=image_card,
                            episode=episode,
                            unit=unit,
                        ),
                    ))
                else:
                    passed += 1
            checks.append({
                "key": "image",
                "label": STAGE_LABELS["image"],
                "passed": passed == len(unit_keys),
                "total": len(unit_keys),
                "passedCount": passed,
            })

        if "video" in requirements:
            passed = processing = 0
            for episode, unit in unit_keys:
                image_card = (
                    _active_card(cards, episode, unit, "img_prompt")
                    or _active_card(cards, episode, unit, "storyboard")
                )
                video_card = _active_card(cards, episode, unit, "vid_prompt")
                ready, is_processing = _video_state(video_card, _active_image(image_card))
                if ready:
                    passed += 1
                elif is_processing:
                    processing += 1
                    issues.append(_issue(
                        code="video_processing",
                        stage="video",
                        episode=episode,
                        unit=unit,
                        card=video_card,
                        severity="info",
                        message=f"{_slot_label(episode, unit)} 的视频正在生成。",
                        action={
                            "kind": "sync_media",
                            "mediaKind": "video",
                            "label": "刷新视频状态",
                            "cardId": video_card.card_id if video_card else "",
                        },
                    ))
                else:
                    issues.append(_issue(
                        code="video_missing",
                        stage="video",
                        episode=episode,
                        unit=unit,
                        card=video_card,
                        message=f"{_slot_label(episode, unit)} 还没有可用镜头视频。",
                        action={
                            "kind": "open_media",
                            "mediaKind": "video",
                            "label": "选择模型生成视频",
                            "cardId": video_card.card_id if video_card else "",
                        },
                    ))
            checks.append({
                "key": "video",
                "label": STAGE_LABELS["video"],
                "passed": passed == len(unit_keys),
                "total": len(unit_keys),
                "passedCount": passed,
                "processingCount": processing,
            })

        if "final" in requirements:
            videos_ready = next(
                (check["passed"] for check in checks if check["key"] == "video"),
                False,
            )
            final_card = next(
                (
                    card
                    for card in reversed(cards)
                    if card.stage == "final" and card.status == "done" and card.videos
                ),
                None,
            )
            final_ready = bool(final_card) and bool(videos_ready)
            checks.append({
                "key": "final",
                "label": STAGE_LABELS["final"],
                "passed": final_ready,
                "total": 1,
                "passedCount": int(final_ready),
            })
            if videos_ready and not final_ready:
                issues.append(_issue(
                    code="final_missing",
                    stage="final",
                    message="全部镜头视频已就绪，但还没有合成当前版本的成片。",
                    action={
                        "kind": "compose",
                        "label": "合成成片预览",
                    },
                ))

    issues = _sort_issues(issues)
    total_checks = sum(int(check["total"]) for check in checks)
    passed_checks = sum(int(check["passedCount"]) for check in checks)
    score, score_breakdown = _score_checks(goal, checks)
    blockers = sum(1 for issue in issues if issue["severity"] == "blocker")
    warnings = sum(1 for issue in issues if issue["severity"] == "warning")
    in_progress = sum(1 for issue in issues if issue["severity"] == "info")
    complete = total_checks > 0 and passed_checks == total_checks
    if complete:
        state = "complete"
        summary = "当前交付目标已经通过全部检查。"
    elif blockers:
        state = "blocked"
        summary = f"发现 {blockers} 个阻塞问题，建议从第一项开始修复。"
    elif warnings:
        state = "attention"
        summary = f"发现 {warnings} 个需要处理的问题。"
    elif in_progress:
        state = "running"
        summary = f"有 {in_progress} 项任务正在执行。"
    else:
        state = "ready"
        summary = "项目可以继续推进下一阶段。"

    first_issue = issues[0] if issues else None
    next_action = first_issue["action"] if first_issue else {
        "kind": "done",
        "label": "当前目标已完成",
    }
    return {
        "status": "success" if complete else "warning",
        "summary": summary,
        "nextActions": [issue["action"]["label"] for issue in issues[:3]],
        "artifacts": [
            f"data/production/{project.project_id}/project.json",
            f"data/production/{project.project_id}/cards.json",
        ],
        "projectId": project.project_id,
        "goal": goal,
        "state": state,
        "score": score,
        "scoreBreakdown": score_breakdown,
        "totalUnits": len(unit_keys) or aggregate_units,
        "blockerCount": blockers,
        "warningCount": warnings,
        "inProgressCount": in_progress,
        "checks": checks,
        "issues": issues,
        "nextAction": next_action,
    }
