"""导演 Agent API：把剧本、图片、视频与成片收束为一条可执行主线。"""
from __future__ import annotations

import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.api import production as production_api
from app.api.common import ok, validate_key
from app.api.production import (
    GenerateReq,
    _create_project_snapshot,
    _load_cards,
    _load_project,
    _now,
    _proj_dir,
    _project_lock,
    _save_cards,
    _save_project,
    generate_stage,
)
from app.dependencies import employee_registry
from app.models.production import ProductionCard, ProductionProject
from app.services import openrouter_media
from app.services.image_generation import generate_image_to_local
from app.services.shot_control import (
    ReferenceRole,
    ShotControlPack,
    ShotReference,
    build_shot_control_pack,
    compile_shot_control_plan,
    infer_reference_kind,
)
from app.services.project_diagnostics import (
    active_card_for_unit,
    diagnose_project,
    production_unit_keys,
)
from app.services.project_feedback import summarize_project_feedback
from app.services.project_optimization import (
    append_optimization_run,
    build_repair_instruction,
    list_optimization_runs,
    optimization_control,
)
from app.services.production_quality import (
    build_image_repair_prompt,
    build_video_repair_prompt,
    image_is_approved,
    image_requires_precision_review,
    latest_video_review,
    video_candidate,
    video_is_approved,
    video_requires_precision_review,
)


router = APIRouter(
    prefix="/api/v1/agentapp/director",
    tags=["director"],
    dependencies=[Depends(production_api._require_project_membership)],
)
SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")
ACTIVE_VIDEO_STATUSES = {"pending", "in_progress", "queued", "processing", "running"}
READY_VIDEO_STATUSES = {"completed", "complete", "succeeded"}
COMIC_DRAMA_TEAM_CODE = "comic-drama-team"
COMIC_MEDIA_EMPLOYEES = {
    "image": "comic-keyframe-artist",
    "video": "comic-video-artist",
}


def _unqualified_media_model(model_ref: str) -> str:
    normalized = str(model_ref or "").strip()
    if normalized.lower().startswith("openrouter:"):
        return normalized.split(":", 1)[1].strip()
    return normalized


def _normalize_media_model_route(kind: str, model_ref: object) -> str:
    """把历史裸图片模型 ID 迁移到当前可执行的 OpenRouter 路由。"""
    clean = str(model_ref or "").strip()
    if kind == "image" and clean.lower() == "gpt-image-2":
        return "openrouter:openai/gpt-image-2"
    return clean


def _same_media_model(left: str, right: str) -> bool:
    return (
        _unqualified_media_model(left).lower()
        == _unqualified_media_model(right).lower()
    )


def _resolve_media_route(
    project: ProductionProject,
    kind: str,
    employee_key: str,
    requested_model: str,
) -> tuple[str, str]:
    """漫剧项目强制走岗位配置；其他项目保留显式模型兼容。"""
    key = str(employee_key or "").strip()
    if project.team_code == COMIC_DRAMA_TEAM_CODE:
        expected = COMIC_MEDIA_EMPLOYEES[kind]
        if key and key != expected:
            raise HTTPException(
                400,
                f"漫剧团队的{'图片' if kind == 'image' else '视频'}执行岗位"
                f"必须是 {expected}，不能使用 {key}",
            )
        key = expected

    if not key:
        model_ref = str(requested_model or "").strip()
        if not model_ref:
            raise HTTPException(400, "请选择媒体模型或指定媒体执行员工")
        return "", model_ref

    employee = employee_registry.get(key)
    if employee is None:
        raise HTTPException(400, f"媒体执行员工 {key} 不存在")
    if not employee.enabled:
        raise HTTPException(400, f"媒体执行员工 {key} 已停用")
    policy = employee.default_model_policy or {}
    route_key = "image_model_id" if kind == "image" else "video_model_id"
    model_ref = _normalize_media_model_route(kind, policy.get(route_key))
    if not model_ref:
        raise HTTPException(400, f"员工 {key} 尚未配置 {route_key}")
    if requested_model and not _same_media_model(requested_model, model_ref):
        raise HTTPException(
            400,
            f"员工 {key} 已固定使用 {model_ref}；"
            f"如需更换，请先在员工配置中修改 {route_key}",
        )
    return key, model_ref


def _configured_media_model(employee_key: str, kind: str) -> dict:
    """把员工固定模型与供应商实时能力合并为导演台选项。"""
    employee = employee_registry.get(employee_key)
    if employee is None or not employee.enabled:
        raise HTTPException(400, f"媒体执行员工 {employee_key} 不存在或已停用")
    route_key = "image_model_id" if kind == "image" else "video_model_id"
    model_ref = _normalize_media_model_route(
        kind,
        (employee.default_model_policy or {}).get(route_key),
    )
    if not model_ref:
        raise HTTPException(400, f"员工 {employee_key} 尚未配置 {route_key}")

    capability: dict = {}
    if model_ref.lower().startswith("openrouter:"):
        try:
            capability = next(
                (
                    model for model in openrouter_media.list_media_models(kind)
                    if _same_media_model(str(model.get("id") or ""), model_ref)
                ),
                {},
            )
        except Exception:
            capability = {}
    return {
        **capability,
        "id": model_ref,
        "name": f"{employee.name}默认 · {_unqualified_media_model(model_ref)}",
        "kind": kind,
        "description": (
            str(capability.get("description") or "")
            or "由数字员工配置统一管理；如需更换请到员工管理中修改"
        ),
        "pricing": capability.get("pricing") or {},
        "isFree": bool(capability.get("isFree")),
        "recommended": True,
        "recommendationReason": "当前岗位已配置的执行模型",
        "employeeKey": employee_key,
    }


def _director_image_size(aspect_ratio: str) -> str:
    """映射到 GPT Image 支持的标准尺寸；OpenRouter 会再换算为最近画幅。"""
    if aspect_ratio in {"9:16", "3:4", "2:3"}:
        return "1024x1536"
    if aspect_ratio in {"16:9", "4:3", "3:2"}:
        return "1536x1024"
    return "1024x1024"


def _unit_keys(cards: list[ProductionCard]) -> list[tuple[Optional[int], int]]:
    """导演主线与诊断共用同一生产单元口径。"""
    return production_unit_keys(cards)


def _card_for(cards: list[ProductionCard], episode: Optional[int], unit: int, stage: str) -> ProductionCard | None:
    """按逻辑 G 单元取卡，兼容集级剧本和子镜头分镜。"""
    return active_card_for_unit(cards, episode, unit, stage)


def _active_image_url(card: ProductionCard | None) -> str:
    """取卡片当前图；显式 active_image（即使为空）优先于历史列表回退。"""
    if card is None:
        return ""
    if "active_image" in card.metadata:
        return str(card.metadata.get("active_image") or "")
    return str(card.images[-1]) if card.images else ""


def _current_image_review(
    card: ProductionCard | None,
    image_url: str,
) -> dict:
    """取当前图片最后一次审核；历史图片的结论不能污染新版本。"""
    if card is None or not image_url:
        return {}
    reviews = [
        review
        for review in (card.metadata.get("image_reviews") or [])
        if str(review.get("image") or "") == image_url
    ]
    return reviews[-1] if reviews else {}


def _active_video_url(card: ProductionCard | None) -> str:
    """取当前采用视频；显式 active_video 优先于历史列表。"""
    if card is None:
        return ""
    if "active_video" in card.metadata:
        return str(card.metadata.get("active_video") or "")
    return str(card.videos[-1]) if card.videos else ""


def _reference_urls_for_card(
    cards: list[ProductionCard],
    card: ProductionCard,
    explicit_urls: list[str],
) -> list[str]:
    """收集显式参考、角色/场景母版及上一镜当前图，稳定跨镜头身份与场景。"""
    candidates = list(explicit_urls)
    for key in ("reference_urls", "reference_assets"):
        raw = card.metadata.get(key)
        if isinstance(raw, list):
            candidates.extend(str(value) for value in raw)

    for source in cards:
        if source.card_id == card.card_id:
            continue
        if source.episode not in (None, card.episode):
            continue
        if source.stage in {"setting", "design"}:
            candidates.extend(source.images)

    for source in cards:
        if (
            source.episode == card.episode
            and source.shot_number == card.shot_number - 1
            and source.stage in {"img_prompt", "storyboard"}
            and source.images
        ):
            active_url = _active_image_url(source)
            if active_url:
                candidates.append(active_url)

    unique: list[str] = []
    for value in candidates:
        url = str(value or "").strip()
        if url and url not in unique:
            unique.append(url)
    return unique[:14]


def _director_state(project_id: str) -> dict:
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    diagnostics = diagnose_project(project, cards)
    unit_keys = _unit_keys(cards)
    total = len(unit_keys)

    counts = {stage: 0 for stage in SPEC_STAGES}
    image_done = video_done = 0
    image_review_total = video_review_total = 0
    ready_video_updated_at: list[str] = []
    shots = []
    for episode, unit in unit_keys:
        stage_cards = {stage: _card_for(cards, episode, unit, stage) for stage in SPEC_STAGES}
        for stage, card in stage_cards.items():
            if card is not None:
                counts[stage] += 1

        image_card = stage_cards["img_prompt"] or stage_cards["storyboard"]
        video_card = stage_cards["vid_prompt"]
        image_url = ""
        image_inputs_match = True
        if image_card and image_card.images:
            image_url = _active_image_url(image_card)
            current_image_prompt = (
                image_card.prompts[0]
                if image_card.prompts
                else image_card.content
            ).strip()
            generated_image_prompt = str(
                image_card.metadata.get("last_image_prompt") or ""
            ).strip()
            image_inputs_match = (
                not generated_image_prompt
                or not current_image_prompt
                or generated_image_prompt == current_image_prompt
            )
        latest_image_review = _current_image_review(image_card, image_url)
        image_quality_required = bool(
            image_card
            and image_requires_precision_review(image_card.metadata, image_url)
        )
        image_approved = bool(
            image_card
            and image_is_approved(image_card.metadata, image_card.status, image_url)
        )
        image_review_count = int(bool(image_url) and not image_approved)
        image_ready = bool(image_url) and image_inputs_match and image_approved
        if image_ready:
            image_done += 1
        image_review_total += image_review_count

        video_url = ""
        video_candidate_url = ""
        latest_video_quality: dict = {}
        video_quality_required = False
        video_quality_passed: bool | None = None
        video_review_verdict = ""
        video_job = None
        video_stale = False
        control_pack_payload: dict = {}
        control_plan_payload: dict = {}
        if video_card:
            try:
                control_duration = int(
                    video_card.metadata.get("duration_seconds") or 5
                )
            except (TypeError, ValueError):
                control_duration = 5
            control_pack = build_shot_control_pack(
                cards,
                video_card,
                image_card,
                current_image_url=image_url,
            )
            control_plan = compile_shot_control_plan(
                (
                    video_card.prompts[0]
                    if video_card.prompts
                    else video_card.content
                ),
                control_pack,
                duration=control_duration,
            )
            control_pack_payload = control_pack.model_dump(mode="json")
            control_plan_payload = control_plan.model_dump(mode="json")
        if video_card:
            raw_video_job = video_card.metadata.get("openrouter_video_job") or {}
            current_video_prompt = (
                video_card.prompts[0] if video_card.prompts else video_card.content
            ).strip()
            job_image = str(raw_video_job.get("imageUrl") or "")
            job_prompt = str(raw_video_job.get("prompt") or "").strip()
            job_status = str(raw_video_job.get("status") or "").strip().lower()
            job_matches_inputs = (
                (not job_image or not image_url or job_image == image_url)
                and (not job_prompt or not current_video_prompt or job_prompt == current_video_prompt)
                and (
                    not raw_video_job.get("controlPack")
                    or raw_video_job.get("controlPack") == control_pack_payload
                )
            )
            if job_matches_inputs:
                video_job = raw_video_job or None
            active_video = _active_video_url(video_card)
            active_candidate = video_candidate(video_card.metadata, active_video)
            active_matches_inputs = (
                (
                    not str(active_candidate.get("imageUrl") or "")
                    or str(active_candidate.get("imageUrl") or "") == image_url
                )
                and (
                    not str(active_candidate.get("prompt") or "").strip()
                    or str(active_candidate.get("prompt") or "").strip()
                    == current_video_prompt
                )
            )
            video_approved = video_is_approved(
                video_card.metadata,
                video_card.status,
                active_video,
            )
            active_uses_current_job = bool(
                not active_candidate
                or (
                    str(active_candidate.get("job_id") or "")
                    and str(active_candidate.get("job_id") or "")
                    == str(raw_video_job.get("id") or "")
                    and (
                        not str(raw_video_job.get("submittedAt") or "")
                        or not str(active_candidate.get("created_at") or "")
                        or str(raw_video_job.get("submittedAt") or "")
                        <= str(active_candidate.get("created_at") or "")
                    )
                )
            )
            active_job_ready = bool(
                not raw_video_job
                or not job_status
                or not active_uses_current_job
                or job_status in READY_VIDEO_STATUSES
            )
            video_ready = image_ready and bool(active_video) and active_matches_inputs and (
                active_job_ready
            ) and video_approved
            video_stale = bool(active_video) and not active_matches_inputs
            if video_ready:
                video_url = active_video
                video_done += 1
                ready_video_updated_at.append(str(
                    video_card.metadata.get("active_video_changed_at")
                    or video_card.updated_at
                ))
            if video_card.videos:
                latest_video = str(video_card.videos[-1])
                latest_review = latest_video_review(video_card.metadata, latest_video)
                latest_video_quality = dict(latest_review.get("quality") or {})
                video_quality_required = video_requires_precision_review(
                    video_card.metadata,
                    latest_video,
                )
                video_quality_passed = latest_video_quality.get("passed")
                video_review_verdict = str(latest_review.get("verdict") or "")
                if video_quality_required and video_quality_passed is not True:
                    video_candidate_url = latest_video
                    video_review_total += 1

        title_card = stage_cards["script"] or stage_cards["storyboard"] or image_card or video_card
        duration = 5
        if title_card:
            try:
                duration = int(title_card.metadata.get("duration_seconds") or 5)
            except (TypeError, ValueError):
                duration = 5
        shots.append({
            "episode": episode,
            "unit": unit,
            "title": title_card.title if title_card else f"G{unit}",
            "script": stage_cards["script"].content if stage_cards["script"] else "",
            "imageCardId": image_card.card_id if image_card else "",
            "imagePrompt": (
                (image_card.prompts[0] if image_card.prompts else image_card.content)
                if image_card else ""
            ),
            "imageUrl": image_url,
            "imageStale": bool(image_url) and not image_inputs_match,
            "videoCardId": video_card.card_id if video_card else "",
            "videoPrompt": (
                (video_card.prompts[0] if video_card.prompts else video_card.content)
                if video_card else ""
            ),
            "videoUrl": video_url,
            "videoCandidateUrl": video_candidate_url,
            "videoJob": video_job,
            "videoStale": video_stale,
            "videoReviewVerdict": video_review_verdict,
            "videoQualityRequired": video_quality_required,
            "videoQualityScore": latest_video_quality.get("score"),
            "videoQualityPassed": video_quality_passed,
            "durationSeconds": max(1, min(duration, 15)),
            "controlPack": control_pack_payload,
            "controlPlan": control_plan_payload,
            "reviewCount": image_review_count,
            "imageReviewVerdict": str(latest_image_review.get("verdict") or ""),
            "imageReviewReason": str(latest_image_review.get("reason") or ""),
            "imageReviewNote": str(latest_image_review.get("note") or ""),
            "imageQualityRequired": image_quality_required,
            "imageQualityScore": (latest_image_review.get("quality") or {}).get("score"),
            "imageQualityPassed": (latest_image_review.get("quality") or {}).get("passed"),
        })

    final_candidate = next((card for card in reversed(cards) if card.stage == "final" and card.videos), None)
    latest_video_update = max(ready_video_updated_at, default="")
    final_candidate_url = _active_video_url(final_candidate)
    final_review = (
        latest_video_review(final_candidate.metadata, final_candidate_url)
        if final_candidate and final_candidate_url
        else {}
    )
    final_quality = dict(final_review.get("quality") or {})
    final_quality_required = bool(
        final_candidate
        and video_requires_precision_review(final_candidate.metadata, final_candidate_url)
    )
    final_approved = bool(
        final_candidate
        and video_is_approved(
            final_candidate.metadata,
            final_candidate.status,
            final_candidate_url,
        )
    )
    final_up_to_date = bool(
        final_candidate
        and total > 0
        and video_done == total
        and str(final_candidate.updated_at) >= latest_video_update
    )
    final_pending_review = final_up_to_date and not final_approved
    final_card = (
        final_candidate
        if final_up_to_date and final_approved
        else None
    )
    stages = [
        {"key": "script", "name": "剧本", "done": counts["script"], "total": total},
        {"key": "storyboard", "name": "分镜", "done": counts["storyboard"], "total": total},
        {"key": "img_prompt", "name": "画面提示", "done": counts["img_prompt"], "total": total},
        {"key": "image", "name": "图片", "done": image_done, "total": total},
        {"key": "vid_prompt", "name": "视频提示", "done": counts["vid_prompt"], "total": total},
        {"key": "video", "name": "视频", "done": video_done, "total": total},
        {"key": "final", "name": "成片", "done": 1 if final_card else 0, "total": 1},
    ]

    next_action = {"kind": "done", "stage": "", "label": "项目已具备交付条件", "count": 0}
    for stage, label in (
        ("script", "生成剧本"),
        ("storyboard", "生成逐镜分镜"),
        ("img_prompt", "生成画面提示"),
    ):
        if total == 0 or counts[stage] < total:
            next_action = {"kind": "stage", "stage": stage, "label": label, "count": max(total - counts[stage], 1)}
            break
    else:
        if image_done < total:
            next_action = {"kind": "image", "stage": "image", "label": "生成镜头图片", "count": total - image_done}
        elif counts["vid_prompt"] < total:
            next_action = {"kind": "stage", "stage": "vid_prompt", "label": "生成视频提示", "count": total - counts["vid_prompt"]}
        elif video_done < total:
            next_action = {"kind": "video", "stage": "video", "label": "生成镜头视频", "count": total - video_done}
        elif not final_up_to_date:
            next_action = {"kind": "compose", "stage": "final", "label": "合成成片预览", "count": video_done}
        elif final_card is None:
            next_action = {"kind": "final_review", "stage": "final", "label": "验收整集成片", "count": 1}

    # 质量门禁失败必须先返工，不能仅凭“卡片存在”继续推进到昂贵的图片/视频生成。
    first_issue = diagnostics["issues"][0] if diagnostics["issues"] else None
    if first_issue and first_issue["code"] == "quality_gate_failed":
        next_action = {
            "kind": "optimize",
            "stage": first_issue["stage"],
            "label": first_issue["action"]["label"],
            "count": 1,
            "issueId": first_issue["id"],
        }
    elif first_issue and first_issue["action"]["kind"] == "review_card":
        next_action = {
            "kind": "review",
            "stage": first_issue["stage"],
            "label": first_issue["action"]["label"],
            "count": 1,
            "issueId": first_issue["id"],
        }

    progress_parts = [
        counts["script"] / total if total else 0,
        counts["storyboard"] / total if total else 0,
        image_done / total if total else 0,
        video_done / total if total else 0,
        1 if final_card else 0,
    ]
    overall_progress = round(sum(progress_parts) / len(progress_parts) * 100)
    return {
        "project": project.model_dump(),
        "stages": stages,
        "shots": shots,
        "totalUnits": total,
        "overallProgress": overall_progress,
        "nextAction": next_action,
        "reviewCount": image_review_total + video_review_total + int(
            final_pending_review
        ),
        "imageReviewCount": image_review_total,
        "videoReviewCount": video_review_total,
        "activeJobs": sum(
            1 for shot in shots
            if shot["videoJob"]
            and str(shot["videoJob"].get("status") or "").lower() in ACTIVE_VIDEO_STATUSES
        ),
        "finalStale": bool(final_candidate and not final_up_to_date),
        "finalPendingReview": final_pending_review,
        "finalUrl": (
            str(final_card.metadata.get("active_video") or final_card.videos[-1])
            if final_card else ""
        ),
        "finalCandidateUrl": (
            final_candidate_url
            if final_up_to_date
            else ""
        ),
        "finalCardId": final_candidate.card_id if final_candidate else "",
        "finalReviewVerdict": str(final_review.get("verdict") or ""),
        "finalQualityRequired": final_quality_required,
        "finalQualityScore": final_quality.get("score"),
        "finalQualityPassed": final_quality.get("passed"),
        "diagnostics": {
            "state": diagnostics["state"],
            "score": diagnostics["score"],
            "summary": diagnostics["summary"],
            "blockerCount": diagnostics["blockerCount"],
            "warningCount": diagnostics["warningCount"],
        },
    }


@router.get("/projects/{project_id}")
def get_director_state(project_id: str):
    """返回总制片视角的项目进度、镜头与下一步动作。"""
    validate_key(project_id, label="project_id")
    return ok(_director_state(project_id))


class OptimizeProjectReq(BaseModel):
    """按当前诊断问题定向返工；一次只处理一个问题，避免大范围覆盖。"""

    issue_id: str = Field(min_length=1, max_length=64)
    extra_instruction: str = Field(default="", max_length=4000)


@router.get("/projects/{project_id}/diagnostics")
def get_project_diagnostics(project_id: str):
    """只读扫描项目，返回健康分、阻塞问题和下一条可执行动作。"""
    validate_key(project_id, label="project_id")
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    return ok(diagnose_project(project, cards))


@router.get("/projects/{project_id}/optimization-runs")
def get_project_optimization_runs(
    project_id: str,
    limit: int = Query(30, ge=1, le=100),
):
    """返回最近的问题修复记录，展示修复前后健康分和失败原因。"""
    validate_key(project_id, label="project_id")
    _load_project(project_id)
    try:
        runs = list_optimization_runs(_proj_dir(project_id), limit)
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        raise HTTPException(500, f"优化记录读取失败: {exc}") from exc
    return ok(runs)


@router.get("/feedback")
def get_project_feedback():
    """聚合全部 JSON 项目的高频问题、低分项目和真实修复成功率。"""
    projects: list[dict] = []
    runs: list[dict] = []
    skipped = 0
    if production_api.DATA_DIR.exists():
        for directory in sorted(production_api.DATA_DIR.iterdir()):
            if not (directory / "project.json").exists():
                continue
            try:
                project = _load_project(directory.name)
                diagnostics = diagnose_project(
                    project,
                    _load_cards(project.project_id),
                )
                projects.append({
                    "projectId": project.project_id,
                    "name": project.name,
                    "diagnostics": diagnostics,
                })
                runs.extend(list_optimization_runs(directory, 100))
            except (OSError, ValueError, TypeError, json.JSONDecodeError):
                skipped += 1
    feedback = summarize_project_feedback(projects, runs)
    feedback["skippedProjectCount"] = skipped
    return ok(feedback)


@router.post("/projects/{project_id}/optimize")
async def optimize_project(project_id: str, req: OptimizeProjectReq):
    """按诊断问题调用现有阶段生成器定向返工，并记录优化前后结果。

    只允许处理诊断明确标记为 autoFixable 的规格问题；生图、生视频仍要求用户在
    导演页选择模型，避免后台静默产生费用。
    """
    validate_key(project_id, label="project_id")
    if not req.issue_id.strip():
        raise HTTPException(400, "issue_id 不能为空")
    if not optimization_control.begin(project_id):
        raise HTTPException(409, "该项目已有修复任务在运行，请等待完成后刷新；如长时间无变化再重试。")

    started_at = _now()
    run_id = uuid.uuid4().hex[:12]
    issue: dict | None = None
    before: dict | None = None
    try:
        project = _load_project(project_id)
        cards = _load_cards(project_id)
        before = diagnose_project(project, cards)
        issue = next(
            (item for item in before["issues"] if item["id"] == req.issue_id),
            None,
        )
        if issue is None:
            raise HTTPException(409, "这个问题已经变化或解决，请刷新检查结果后再操作。")
        action = issue["action"]
        if not issue["autoFixable"] or action.get("kind") != "generate_stage":
            raise HTTPException(
                409,
                f"“{issue['message']}”需要人工选择模型或补充素材，不能自动执行。"
                f"下一步：{action.get('label', '返回导演页处理')}。",
            )

        extra_instruction = build_repair_instruction(
            issue,
            req.extra_instruction,
        )
        repair_employee_key = ""
        if project.team_code != COMIC_DRAMA_TEAM_CODE:
            repair_employee_key = production_api._select_generation_employee(
                action["targetStage"],
                "",
                project.employee_key,
            )

        generation = await generate_stage(
            project_id,
            GenerateReq(
                target_stage=action["targetStage"],
                employee_key=repair_employee_key,
                episode=action.get("episode"),
                shot_number=action.get("shotNumber"),
                mode=action.get("mode", "replace"),
                extra_instruction=extra_instruction,
            ),
        )
        generated = generation["data"]
        after_project = _load_project(project_id)
        after = diagnose_project(after_project, _load_cards(project_id))
        unresolved = any(item["id"] == issue["id"] for item in after["issues"])
        status = "needs_review" if unresolved else "resolved"
        summary = (
            "返工结果仍未通过检查，请查看新的问题说明。"
            if unresolved
            else f"已修复：{issue['message']}"
        )
        record = {
            "runId": run_id,
            "projectId": project_id,
            "issueId": issue["id"],
            "issueCode": issue["code"],
            "stage": issue["stage"],
            "episode": issue["episode"],
            "unit": issue["unit"],
            "status": status,
            "summary": summary,
            "beforeScore": before["score"],
            "afterScore": after["score"],
            "generated": generated.get("generated", 0),
            "replaced": generated.get("replaced", 0),
            "qualityIssueCount": generated.get("quality_issue_count", 0),
            "startedAt": started_at,
            "finishedAt": _now(),
            "error": "",
        }
        append_optimization_run(_proj_dir(project_id), record)
        return ok({
            "status": "warning" if unresolved else "success",
            "summary": summary,
            "nextActions": after["nextActions"],
            "artifacts": [
                *after["artifacts"],
                f"data/production/{project_id}/optimization-runs.json",
            ],
            "runId": run_id,
            "state": status,
            "resolved": not unresolved,
            "beforeScore": before["score"],
            "afterScore": after["score"],
            "generation": generated,
            "diagnostics": after,
        })
    except Exception as exc:
        error = str(exc.detail) if isinstance(exc, HTTPException) else str(exc)
        record = {
            "runId": run_id,
            "projectId": project_id,
            "issueId": issue["id"] if issue else req.issue_id,
            "issueCode": issue["code"] if issue else "",
            "stage": issue["stage"] if issue else "",
            "episode": issue["episode"] if issue else None,
            "unit": issue["unit"] if issue else None,
            "status": "failed",
            "summary": "自动修复失败，项目内容保持在可恢复状态。",
            "beforeScore": before["score"] if before else 0,
            "afterScore": before["score"] if before else 0,
            "generated": 0,
            "replaced": 0,
            "qualityIssueCount": 0,
            "startedAt": started_at,
            "finishedAt": _now(),
            "error": error,
        }
        try:
            append_optimization_run(_proj_dir(project_id), record)
        except Exception:
            pass
        raise
    finally:
        optimization_control.finish(project_id)


@router.get("/media-models")
def get_media_models(
    kind: str = Query("image", pattern="^(image|video)$"),
    employee_key: str = Query(""),
):
    """有员工时只返回其已配置模型；无员工时保留 OpenRouter 目录兼容。"""
    if employee_key:
        return ok([_configured_media_model(employee_key, kind)])
    try:
        return ok(openrouter_media.list_media_models(kind))
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"读取 OpenRouter {kind} 模型失败: {exc}") from exc


class ImageGenerateReq(BaseModel):
    model: str = ""
    employee_key: str = ""
    prompt: str = ""
    resolution: str = "1K"
    aspect_ratio: str = "9:16"
    reference_urls: list[str] = Field(default_factory=list)


class ImagePromptUpdateReq(BaseModel):
    """只更新导演工作流里图片卡片的首条主提示词。"""

    prompt: str


@router.put("/projects/{project_id}/cards/{card_id}/image-prompt")
def update_director_image_prompt(project_id: str, card_id: str, req: ImagePromptUpdateReq):
    """保存单镜头主提示词，同时保留卡片上的其余提示词与生产元数据。"""
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(400, "图片提示词不能为空")

    with _project_lock(project_id):
        _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage not in ("img_prompt", "storyboard", "setting", "design"):
            raise HTTPException(400, "该卡片不支持图片提示词编辑")
        current_prompt = card.prompts[0] if card.prompts else card.content
        if current_prompt == prompt:
            return ok({"card": card.model_dump()})
        _create_project_snapshot(
            project_id,
            label=f"修改 G{card.shot_number} 图片提示词前",
            reason="image_prompt_update",
            description=(
                f"保存卡片 {card.card_id} 的新主提示词前，"
                "自动保留当前项目内容"
            ),
        )
        if (
            card.images
            and not card.metadata.get("last_image_prompt")
        ):
            card.metadata = {
                **card.metadata,
                "last_image_prompt": current_prompt,
            }
        card.prompts = [prompt, *card.prompts[1:]] if card.prompts else [prompt]
        card.updated_at = _now()
        _save_cards(project_id, cards)
    return ok({"card": card.model_dump()})


class ShotOrderReq(BaseModel):
    """镜头排序请求；ordered_units 使用排序前的 G 单元号。"""
    episode: Optional[int] = None
    ordered_units: list[int]
    expected_project_updated_at: str | None = None


@router.put("/projects/{project_id}/shots/order")
def reorder_director_shots(project_id: str, req: ShotOrderReq):
    """原子重排一集全部正整数 G 单元，并让旧视频/成片进入过期状态。"""
    with _project_lock(project_id):
        project = _load_project(project_id)
        if (
            req.expected_project_updated_at
            and req.expected_project_updated_at != project.updated_at
        ):
            raise HTTPException(409, "项目已被其他人更新，请刷新后重新排序")
        cards = _load_cards(project_id)
        available_units = sorted({
            card.shot_number
            for card in cards
            if card.episode == req.episode and card.shot_number > 0
        })
        ordered = req.ordered_units
        if (
            any(unit <= 0 for unit in ordered)
            or len(ordered) != len(set(ordered))
            or set(ordered) != set(available_units)
        ):
            raise HTTPException(
                400,
                "ordered_units 必须无重复且恰好覆盖该集全部正整数镜头",
            )

        if ordered == available_units:
            return ok({
                "episode": req.episode,
                "ordered_units": ordered,
                "updated_cards": 0,
                "state": _director_state(project_id),
            })

        _create_project_snapshot(
            project_id,
            label=(
                f"调整 EP{req.episode:02d} 镜头顺序前"
                if req.episode is not None
                else "调整全局镜头顺序前"
            ),
            reason="shot_reorder",
            description=f"镜头顺序从 {available_units} 调整为 {ordered}",
        )
        now = _now()
        unit_mapping = {
            old_unit: index + 1 for index, old_unit in enumerate(ordered)
        }
        updated_cards = 0
        for card in cards:
            if card.episode == req.episode and card.shot_number > 0:
                card.shot_number = unit_mapping[card.shot_number]
                card.updated_at = now
                updated_cards += 1
        project.updated_at = now
        _save_cards(project_id, cards)
        _save_project(project)
    return ok({
        "episode": req.episode,
        "ordered_units": ordered,
        "updated_cards": updated_cards,
        "state": _director_state(project_id),
    })


@router.post("/projects/{project_id}/cards/{card_id}/image")
def generate_director_image(project_id: str, card_id: str, req: ImageGenerateReq):
    """按图片执行员工的模型策略生成镜头图，并自动回填到图片提示卡。"""
    with _project_lock(project_id):
        project = _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage not in ("img_prompt", "storyboard", "setting", "design"):
            raise HTTPException(400, "该卡片不支持图片生成")
        prompt = req.prompt.strip() or (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        if not prompt:
            raise HTTPException(400, "镜头没有图片提示词")
        generation_prompt = build_image_repair_prompt(
            prompt,
            list(card.metadata.get("image_reviews") or []),
        )
        aspect_ratio = req.aspect_ratio or project.aspect_ratio
        employee_key, model_ref = _resolve_media_route(
            project,
            "image",
            req.employee_key,
            req.model,
        )
        reference_urls = _reference_urls_for_card(
            cards,
            card,
            req.reference_urls,
        )
    try:
        if employee_key:
            result = generate_image_to_local(
                generation_prompt,
                model_ref,
                _director_image_size(aspect_ratio),
                "medium",
                reference_urls,
            )
        else:
            result = openrouter_media.generate_image(
                project_id,
                model=model_ref,
                prompt=generation_prompt,
                resolution=req.resolution,
                aspect_ratio=aspect_ratio,
                reference_urls=reference_urls,
            )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"图片执行员工生图失败: {exc}") from exc

    with _project_lock(project_id):
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None or card.stage not in (
            "img_prompt",
            "storyboard",
            "setting",
            "design",
        ):
            raise HTTPException(409, "生图期间卡片已被删除或改变，请重新操作")
        current_prompt = (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        existing_active_image = _active_image_url(card)
        applied = current_prompt == prompt
        if applied:
            if result["url"] not in card.images:
                card.images.append(result["url"])
            existing_approved = image_is_approved(
                card.metadata,
                card.status,
                existing_active_image,
            )
            candidates = list(card.metadata.get("image_candidates") or [])
            candidates = [
                item
                for item in candidates
                if str(item.get("image") or "") != result["url"]
            ]
            candidates.append({
                "image": result["url"],
                "model": result["model"],
                "base_prompt": prompt,
                "generation_prompt": generation_prompt,
                "created_at": _now(),
                "verdict": "",
                "quality_score": None,
                "review_required": True,
            })
            active_image = (
                existing_active_image
                if existing_active_image and existing_approved
                else result["url"]
            )
            card.metadata = {
                **card.metadata,
                "active_image": active_image,
                "image_candidates": candidates[-20:],
                "last_image_model": result["model"],
                "last_image_model_ref": model_ref,
                "last_image_employee_key": employee_key,
                "last_image_prompt": prompt,
                "last_image_generation_prompt": generation_prompt,
                "last_image_usage": result.get("usage") or {},
                "last_image_reference_urls": reference_urls,
            }
            if active_image == result["url"]:
                card.metadata["review_verdict"] = ""
                card.status = "review"
        else:
            late_results = list(card.metadata.get("late_image_results") or [])
            late_results.append({
                "url": result["url"],
                "model": result.get("model") or model_ref,
                "model_ref": model_ref,
                "employee_key": employee_key,
                "prompt": prompt,
                "finished_at": _now(),
            })
            card.metadata = {
                **card.metadata,
                "active_image": existing_active_image,
                "late_image_results": late_results[-20:],
            }
        card.updated_at = _now()
        _save_cards(project_id, cards)
    return ok({
        **result,
        "card": card.model_dump(),
        "applied": applied,
        "stale": not applied,
        "qualityFeedbackApplied": generation_prompt != prompt,
    })


_CONTROL_ASSET_KINDS = {
    ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image",
    ".gif": "image", ".mp4": "video", ".mov": "video", ".webm": "video",
    ".mp3": "audio", ".wav": "audio", ".m4a": "audio", ".aac": "audio",
}
_CONTROL_ASSET_LIMITS = {
    "image": 20 * 1024 * 1024,
    "video": 100 * 1024 * 1024,
    "audio": 15 * 1024 * 1024,
}


def _control_pack_result(
    cards: list[ProductionCard],
    card: ProductionCard,
    pack: ShotControlPack,
) -> dict:
    image_card = (
        _card_for(cards, card.episode, card.shot_number, "img_prompt")
        or _card_for(cards, card.episode, card.shot_number, "storyboard")
    )
    resolved_pack = build_shot_control_pack(
        cards,
        card,
        image_card,
        current_image_url=_active_image_url(image_card),
        override=pack,
    )
    try:
        duration = int(card.metadata.get("duration_seconds") or 5)
    except (TypeError, ValueError):
        duration = 5
    prompt = card.prompts[0] if card.prompts else card.content
    plan = compile_shot_control_plan(prompt, resolved_pack, duration=duration)
    return {
        "controlPack": resolved_pack.model_dump(mode="json"),
        "controlPlan": plan.model_dump(mode="json"),
    }


@router.put("/projects/{project_id}/cards/{card_id}/control-pack")
def update_director_control_pack(
    project_id: str,
    card_id: str,
    req: ShotControlPack,
):
    """保存单镜头的角色、场景、表演、运镜和声音控制。"""
    with _project_lock(project_id):
        _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage != "vid_prompt":
            raise HTTPException(400, "该卡片不是视频生产卡")
        result = _control_pack_result(cards, card, req)
        card.metadata = {
            **card.metadata,
            "shot_control_pack": result["controlPack"],
        }
        card.updated_at = _now()
        _save_cards(project_id, cards)
    return ok(result)


@router.post("/projects/{project_id}/cards/{card_id}/control-assets")
async def upload_director_control_asset(
    project_id: str,
    card_id: str,
    role: ReferenceRole = Query("style"),
    file: UploadFile = File(...),
):
    """上传镜头参考素材并立即绑定到控制包。"""
    original_name = str(file.filename or "reference")
    suffix = (
        f".{original_name.rsplit('.', 1)[-1].lower()}"
        if "." in original_name
        else ""
    )
    kind = _CONTROL_ASSET_KINDS.get(suffix)
    if kind is None:
        raise HTTPException(400, "仅支持常见图片、MP4/MOV/WebM、MP3/WAV/M4A/AAC")
    limit = _CONTROL_ASSET_LIMITS[kind]
    content = await file.read(limit + 1)
    await file.close()
    if len(content) > limit:
        raise HTTPException(
            413,
            f"{kind} 参考素材超过 {limit // (1024 * 1024)}MB 上限",
        )
    if not content:
        raise HTTPException(400, "参考素材为空")

    with _project_lock(project_id):
        _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage != "vid_prompt":
            raise HTTPException(400, "该卡片不是视频生产卡")
        upload_dir = _proj_dir(project_id) / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        filename = f"control_{uuid.uuid4().hex[:16]}{suffix}"
        (upload_dir / filename).write_bytes(content)
        url = (
            "/api/v1/agentapp/production/resource/production/"
            f"{project_id}/uploads/{filename}"
        )
        stored = ShotControlPack.model_validate(
            card.metadata.get("shot_control_pack") or {},
        )
        stored.references.append(ShotReference(
            reference_id=uuid.uuid4().hex[:12],
            url=url,
            kind=kind,
            role=role,
            label=original_name[:120],
        ))
        result = _control_pack_result(cards, card, stored)
        card.metadata = {
            **card.metadata,
            "shot_control_pack": result["controlPack"],
        }
        card.updated_at = _now()
        _save_cards(project_id, cards)
    return ok({
        **result,
        "asset": {
            "url": url,
            "kind": kind,
            "role": role,
            "label": original_name[:120],
        },
    })


class VideoGenerateReq(BaseModel):
    model: str = ""
    employee_key: str = ""
    prompt: str = ""
    duration: int = 5
    resolution: str = "720p"
    aspect_ratio: str = "9:16"
    image_url: str = ""
    last_frame_url: str = ""
    reference_urls: list[str] = Field(default_factory=list)
    control_pack: ShotControlPack | None = None
    generate_audio: bool = True


@router.post("/projects/{project_id}/cards/{card_id}/video")
def generate_director_video(project_id: str, card_id: str, req: VideoGenerateReq):
    """提交一个镜头的 OpenRouter 异步视频任务并把任务号写回卡片。"""
    with _project_lock(project_id):
        project = _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage != "vid_prompt":
            raise HTTPException(400, "该卡片不是视频生产卡")
        prompt = req.prompt.strip() or (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        if not prompt:
            raise HTTPException(400, "镜头没有视频提示词")
        employee_key, model_ref = _resolve_media_route(
            project,
            "video",
            req.employee_key,
            req.model,
        )
        if employee_key and not model_ref.lower().startswith("openrouter:"):
            raise HTTPException(
                400,
                f"员工 {employee_key} 的视频模型必须使用 openrouter: 前缀",
            )

        image_card = (
            _card_for(cards, card.episode, card.shot_number, "img_prompt")
            or _card_for(cards, card.episode, card.shot_number, "storyboard")
        )
        current_image_url = _active_image_url(image_card)
        if not current_image_url:
            raise HTTPException(400, "请先生成当前镜头图片，再提交视频")
        if req.image_url and req.image_url != current_image_url:
            raise HTTPException(409, "镜头图片已变化，请刷新后使用当前版本提交视频")
        image_review = _current_image_review(image_card, current_image_url)
        if image_card is None or not image_is_approved(
            image_card.metadata,
            image_card.status,
            current_image_url,
        ):
            if image_review.get("verdict") == "reject":
                raise HTTPException(409, "当前镜头图片待返工，请修改并通过后再提交视频")
            raise HTTPException(409, "当前镜头图片必须完成精品评分并通过后才能提交视频")
        image_url = current_image_url
        initial_stored_pack = dict(
            card.metadata.get("shot_control_pack") or {}
        )
        control_pack = build_shot_control_pack(
            cards,
            card,
            image_card,
            current_image_url=image_url,
            override=req.control_pack,
        )
        if req.last_frame_url:
            control_pack.last_frame_url = req.last_frame_url
        if req.reference_urls:
            control_pack.references.extend(
                ShotReference(
                    url=url,
                    kind=infer_reference_kind(url),
                    role="style",
                )
                for url in req.reference_urls
                if str(url or "").strip()
            )
        control_plan = compile_shot_control_plan(
            prompt,
            control_pack,
            duration=req.duration,
        )
        control_pack_payload = control_pack.model_dump(mode="json")
        control_plan_payload = control_plan.model_dump(mode="json")
        generation_prompt = build_video_repair_prompt(
            control_plan.prompt,
            list(card.metadata.get("video_reviews") or []),
        )
        aspect_ratio = req.aspect_ratio or project.aspect_ratio
        submission_started_at = _now()
    try:
        job = openrouter_media.submit_video(
            project_id,
            model=_unqualified_media_model(model_ref),
            prompt=generation_prompt,
            duration=req.duration,
            resolution=req.resolution,
            aspect_ratio=aspect_ratio,
            image_url=control_plan.first_frame_url,
            last_frame_url=control_plan.last_frame_url,
            reference_inputs=[
                {"kind": reference.kind, "url": reference.url}
                for reference in control_plan.references
            ],
            generate_audio=req.generate_audio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"OpenRouter 视频任务提交失败: {exc}") from exc

    with _project_lock(project_id):
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None or card.stage != "vid_prompt":
            raise HTTPException(409, "提交期间卡片已被删除或改变，请重新操作")
        current_prompt = (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        image_card = (
            _card_for(cards, card.episode, card.shot_number, "img_prompt")
            or _card_for(cards, card.episode, card.shot_number, "storyboard")
        )
        current_image_url = _active_image_url(image_card)
        image_approved = (
            bool(current_image_url)
            and image_card is not None
            and image_is_approved(
                image_card.metadata,
                image_card.status,
                current_image_url,
            )
        )
        current_job = card.metadata.get("openrouter_video_job") or {}
        newer_job_exists = (
            str(current_job.get("submittedAt") or "") > submission_started_at
        )
        inputs_match = (
            current_prompt == prompt
            and image_approved
            and dict(card.metadata.get("shot_control_pack") or {})
            == initial_stored_pack
            and (
                not image_url
                or not current_image_url
                or current_image_url == image_url
            )
        )
        applied = inputs_match and not newer_job_exists
        job_payload = {
            **job,
            "modelRef": model_ref,
            "employeeKey": employee_key,
            "prompt": prompt,
            "generationPrompt": generation_prompt,
            "imageUrl": image_url,
            "lastFrameUrl": control_plan.last_frame_url,
            "referenceUrls": [
                reference.url for reference in control_plan.references
            ],
            "referenceInputs": [
                reference.model_dump(mode="json")
                for reference in control_plan.references
            ],
            "generationMode": control_plan.mode,
            "controlPack": control_pack_payload,
            "controlPlan": control_plan_payload,
            "controlWarnings": control_plan.warnings,
            "submittedAt": submission_started_at,
        }
        if applied:
            card.metadata = {
                **card.metadata,
                "shot_control_pack": control_pack_payload,
                "openrouter_video_job": job_payload,
            }
            card.updated_at = _now()
        else:
            late_jobs = list(card.metadata.get("late_video_jobs") or [])
            late_jobs.append(job_payload)
            card.metadata = {
                **card.metadata,
                "late_video_jobs": late_jobs[-20:],
            }
        _save_cards(project_id, cards)
    return ok({
        "job": job,
        "card": card.model_dump(),
        "applied": applied,
        "stale": not applied,
        "controlPack": control_pack_payload,
        "controlPlan": control_plan_payload,
        "qualityFeedbackApplied": generation_prompt != control_plan.prompt,
    })


@router.post("/projects/{project_id}/cards/{card_id}/video/sync")
def sync_director_video(project_id: str, card_id: str):
    """同步视频任务状态；完成后下载 MP4 并自动回填镜头。"""
    with _project_lock(project_id):
        _load_project(project_id)
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        job = dict(card.metadata.get("openrouter_video_job") or {})
        job_id = str(job.get("id") or "")
        if not job_id:
            raise HTTPException(400, "卡片没有待同步的视频任务")
    try:
        result = openrouter_media.sync_video(project_id, job_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"同步视频任务失败: {exc}") from exc

    with _project_lock(project_id):
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None or card.stage != "vid_prompt":
            raise HTTPException(409, "同步期间卡片已被删除或改变，请重新操作")
        current_job = dict(card.metadata.get("openrouter_video_job") or {})
        same_job = str(current_job.get("id") or "") == job_id
        current_prompt = (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        image_card = next((
            item for item in cards
            if item.episode == card.episode
            and item.shot_number == card.shot_number
            and item.stage in ("img_prompt", "storyboard")
            and item.images
        ), None)
        current_image_url = _active_image_url(image_card)
        prompt_matches = (
            not str(job.get("prompt") or "").strip()
            or not current_prompt
            or str(job.get("prompt") or "").strip() == current_prompt
        )
        image_matches = (
            not str(job.get("imageUrl") or "")
            or not current_image_url
            or str(job.get("imageUrl") or "") == current_image_url
        )
        input_matches = prompt_matches and image_matches
        applied = same_job and input_matches
        if applied:
            result_url = str(result.get("url") or "")
            existing_active_video = _active_video_url(card)
            existing_active_approved = video_is_approved(
                card.metadata,
                card.status,
                existing_active_video,
            )
            if result_url and result_url not in card.videos:
                card.videos.append(result_url)
            candidates = list(card.metadata.get("video_candidates") or [])
            if result_url:
                candidate = next(
                    (
                        item for item in candidates
                        if str(item.get("video") or "") == result_url
                    ),
                    None,
                )
                if candidate is None:
                    candidate = {"video": result_url}
                    candidates.append(candidate)
                candidate.update({
                    "review_required": True,
                    "kind": "video",
                    "prompt": current_prompt,
                    "imageUrl": current_image_url,
                    "job_id": job_id,
                    "created_at": _now(),
                    "verdict": "",
                    "quality_score": None,
                })
            active_video = (
                existing_active_video
                if existing_active_video and existing_active_approved
                else result_url
            )
            card.metadata = {
                **card.metadata,
                "openrouter_video_job": {
                    **current_job,
                    **result,
                    "syncedAt": _now(),
                },
                "active_video": active_video,
                "video_candidates": candidates,
            }
            if result_url:
                if active_video == result_url:
                    card.metadata["video_review_verdict"] = ""
                    card.metadata["active_video_changed_at"] = _now()
                    card.status = "review"
                else:
                    card.status = "done"
            elif result.get("status") == "failed":
                card.status = "review"
        else:
            late_results = list(card.metadata.get("late_video_results") or [])
            late_entry = {
                "job_id": job_id,
                "prompt": job.get("prompt") or "",
                "imageUrl": job.get("imageUrl") or "",
                "result": result,
                "finished_at": _now(),
            }
            result_key = (
                job_id,
                str(result.get("url") or ""),
                str(result.get("status") or ""),
            )
            late_results = [
                item for item in late_results
                if (
                    str(item.get("job_id") or ""),
                    str((item.get("result") or {}).get("url") or ""),
                    str((item.get("result") or {}).get("status") or ""),
                ) != result_key
            ]
            late_results.append(late_entry)
            metadata = {
                **card.metadata,
                "late_video_results": late_results[-20:],
            }
            if same_job:
                metadata["openrouter_video_job"] = {
                    **current_job,
                    **result,
                    "syncedAt": _now(),
                    "stale": True,
                }
            card.metadata = metadata
        card.updated_at = _now()
        _save_cards(project_id, cards)
    return ok({
        "job": result,
        "card": card.model_dump(),
        "applied": applied,
        "stale": not applied,
    })


def _compose_plan(project_id: str) -> tuple[
    ProductionProject,
    list[ProductionCard],
    list[str],
    tuple,
]:
    """基于当前就绪镜头构造合成计划与可比较输入签名。"""
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    state = _director_state(project_id)
    ready_ids = {
        shot["videoCardId"]
        for shot in state["shots"]
        if shot["videoUrl"]
    }
    if state["totalUnits"] > 0 and len(ready_ids) < state["totalUnits"]:
        raise HTTPException(400, "有镜头的图片或视频已经更新，请先重新生成对应视频")
    video_cards = sorted(
        [card for card in cards if card.card_id in ready_ids],
        key=lambda card: (
            -1 if card.episode is None else card.episode,
            card.shot_number,
            card.created_at,
        ),
    )
    video_urls = [
        str(card.metadata.get("active_video") or card.videos[-1])
        for card in video_cards
    ]
    signature = (
        project.aspect_ratio,
        tuple(
            (
                card.card_id,
                card.episode,
                card.shot_number,
                str(card.metadata.get("active_video") or card.videos[-1]),
                card.updated_at,
            )
            for card in video_cards
        ),
    )
    return project, cards, video_urls, signature


def _discard_composed_result(project_id: str, result: dict) -> None:
    """删除未挂载的本地合成结果；清理失败只记日志。"""
    try:
        generated_path = openrouter_media.local_video_path(
            str(result.get("url") or "")
        )
        generated_path.unlink(missing_ok=True)
    except Exception:
        from app.core.logging import get_logger

        get_logger(__name__).warning(
            "清理过期合成文件失败 project=%s url=%s",
            project_id,
            result.get("url"),
            exc_info=True,
        )


@router.post("/projects/{project_id}/compose")
def compose_director_cut(project_id: str):
    """按集数与 G 单元顺序合成全部镜头，并生成/更新 final 卡。"""
    with _project_lock(project_id):
        project, _, video_urls, input_signature = _compose_plan(project_id)
        aspect_ratio = project.aspect_ratio
    try:
        result = openrouter_media.compose_video(
            project_id,
            video_urls,
            aspect_ratio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"成片合成失败: {exc}") from exc

    with _project_lock(project_id):
        try:
            project, cards, _, latest_signature = _compose_plan(project_id)
        except HTTPException as exc:
            _discard_composed_result(project_id, result)
            raise HTTPException(409, "合成期间镜头已更新，请重新合成成片") from exc
        if latest_signature != input_signature:
            _discard_composed_result(project_id, result)
            raise HTTPException(409, "合成期间镜头已更新，请重新合成成片")
        now = _now()
        final_card = next((
            card
            for card in cards
            if card.stage == "final" and card.shot_number == 0
        ), None)
        if final_card is None:
            final_card = ProductionCard(
                card_id=str(uuid.uuid4())[:8],
                project_id=project_id,
                stage="final",
                title=f"{project.name} 成片预览",
                content="导演 Agent 按镜头顺序自动合成的竖屏预览。",
                episode=None,
                shot_number=0,
                status="done",
                created_at=now,
                updated_at=now,
            )
            cards.append(final_card)
        if result["url"] not in final_card.videos:
            final_card.videos.append(result["url"])
        candidates = list(final_card.metadata.get("video_candidates") or [])
        candidate = next(
            (
                item for item in candidates
                if str(item.get("video") or "") == result["url"]
            ),
            None,
        )
        if candidate is None:
            candidate = {"video": result["url"]}
            candidates.append(candidate)
        candidate.update({
            "review_required": True,
            "kind": "final",
            "source_videos": video_urls,
            "created_at": now,
            "verdict": "",
            "quality_score": None,
        })
        final_card.metadata = {
            **final_card.metadata,
            "active_video": result["url"],
            "compose": result,
            "video_candidates": candidates,
            "video_review_verdict": "",
        }
        final_card.status = "review"
        final_card.updated_at = now
        project.updated_at = now
        _save_cards(project_id, cards)
        _save_project(project)
    return ok({**result, "card": final_card.model_dump(), "state": _director_state(project_id)})
