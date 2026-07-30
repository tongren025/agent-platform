"""导演 Agent API：把剧本、图片、视频与成片收束为一条可执行主线。"""
from __future__ import annotations

import json
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
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
from app.models.production import ProductionCard, ProductionProject
from app.services import openrouter_media
from app.services.project_diagnostics import diagnose_project
from app.services.project_feedback import summarize_project_feedback
from app.services.project_optimization import (
    append_optimization_run,
    build_repair_instruction,
    list_optimization_runs,
    optimization_control,
)


router = APIRouter(prefix="/api/v1/agentapp/director", tags=["director"])
SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")
ACTIVE_VIDEO_STATUSES = {"pending", "in_progress", "queued", "processing", "running"}
READY_VIDEO_STATUSES = {"completed", "complete", "succeeded"}


def _unit_keys(cards: list[ProductionCard]) -> list[tuple[Optional[int], int]]:
    return sorted(
        {(card.episode, card.shot_number) for card in cards if card.shot_number > 0},
        key=lambda item: (-1 if item[0] is None else item[0], item[1]),
    )


def _card_for(cards: list[ProductionCard], episode: Optional[int], unit: int, stage: str) -> ProductionCard | None:
    return next((
        card for card in cards
        if card.episode == episode and card.shot_number == unit and card.stage == stage
    ), None)


def _active_image_url(card: ProductionCard | None) -> str:
    """取卡片当前图；显式 active_image（即使为空）优先于历史列表回退。"""
    if card is None:
        return ""
    if "active_image" in card.metadata:
        return str(card.metadata.get("active_image") or "")
    return str(card.images[-1]) if card.images else ""


def _director_state(project_id: str) -> dict:
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    diagnostics = diagnose_project(project, cards)
    unit_keys = _unit_keys(cards)
    total = len(unit_keys)

    counts = {stage: 0 for stage in SPEC_STAGES}
    image_done = video_done = 0
    image_review_total = 0
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
        image_reviews = [
            review for review in ((image_card.metadata.get("image_reviews") or []) if image_card else [])
            if str(review.get("image") or "") == image_url
        ]
        latest_image_review = image_reviews[-1] if image_reviews else {}
        image_review_count = 1 if image_card and image_card.status == "review" else 0
        image_ready = bool(image_url) and image_inputs_match and image_review_count == 0 and (
            latest_image_review.get("verdict") != "reject"
        )
        if image_ready:
            image_done += 1
        image_review_total += image_review_count

        video_url = ""
        video_job = None
        video_stale = False
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
            )
            if job_matches_inputs:
                video_job = raw_video_job or None
            video_ready = image_ready and bool(video_card.videos) and job_matches_inputs and (
                not raw_video_job or not job_status or job_status in READY_VIDEO_STATUSES
            )
            video_stale = bool(video_card.videos) and not video_ready
            if video_ready:
                video_url = str(video_card.metadata.get("active_video") or video_card.videos[-1])
                video_done += 1
                ready_video_updated_at.append(str(video_card.updated_at))

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
            "videoJob": video_job,
            "videoStale": video_stale,
            "durationSeconds": max(1, min(duration, 15)),
            "reviewCount": image_review_count,
            "imageReviewVerdict": str(latest_image_review.get("verdict") or ""),
            "imageReviewReason": str(latest_image_review.get("reason") or ""),
            "imageReviewNote": str(latest_image_review.get("note") or ""),
        })

    final_candidate = next((card for card in reversed(cards) if card.stage == "final" and card.videos), None)
    latest_video_update = max(ready_video_updated_at, default="")
    final_card = (
        final_candidate
        if final_candidate
        and total > 0
        and video_done == total
        and str(final_candidate.updated_at) >= latest_video_update
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
        elif final_card is None:
            next_action = {"kind": "compose", "stage": "final", "label": "合成成片预览", "count": video_done}

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
        "reviewCount": image_review_total,
        "activeJobs": sum(
            1 for shot in shots
            if shot["videoJob"]
            and str(shot["videoJob"].get("status") or "").lower() in ACTIVE_VIDEO_STATUSES
        ),
        "finalStale": bool(final_candidate and final_card is None),
        "finalUrl": (
            str(final_card.metadata.get("active_video") or final_card.videos[-1])
            if final_card else ""
        ),
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

        generation = await generate_stage(
            project_id,
            GenerateReq(
                target_stage=action["targetStage"],
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
def get_media_models(kind: str = Query("image", pattern="^(image|video)$")):
    """列出 OpenRouter 专用图片/视频模型，不暴露供应商密钥。"""
    try:
        return ok(openrouter_media.list_media_models(kind))
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"读取 OpenRouter {kind} 模型失败: {exc}") from exc


class ImageGenerateReq(BaseModel):
    model: str
    prompt: str = ""
    resolution: str = "1K"
    aspect_ratio: str = "9:16"


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
    """为一个镜头生成图片并自动回填到图片提示卡。"""
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
        aspect_ratio = req.aspect_ratio or project.aspect_ratio
    try:
        result = openrouter_media.generate_image(
            project_id,
            model=req.model,
            prompt=prompt,
            resolution=req.resolution,
            aspect_ratio=aspect_ratio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"OpenRouter 生图失败: {exc}") from exc

    with _project_lock(project_id):
        cards = _load_cards(project_id)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None or card.stage not in ("img_prompt", "storyboard"):
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
            card.metadata = {
                **card.metadata,
                "active_image": result["url"],
                "last_image_model": result["model"],
                "last_image_prompt": prompt,
                "last_image_usage": result.get("usage") or {},
            }
            card.status = "done"
        else:
            late_results = list(card.metadata.get("late_image_results") or [])
            late_results.append({
                "url": result["url"],
                "model": result.get("model") or req.model,
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
    })


class VideoGenerateReq(BaseModel):
    model: str
    prompt: str = ""
    duration: int = 5
    resolution: str = "720p"
    aspect_ratio: str = "9:16"
    image_url: str = ""
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

        image_url = req.image_url
        if not image_url:
            image_card = next((
                item for item in cards
                if item.episode == card.episode
                and item.shot_number == card.shot_number
                and item.stage in ("img_prompt", "storyboard")
                and item.images
            ), None)
            if image_card:
                image_url = _active_image_url(image_card)
        aspect_ratio = req.aspect_ratio or project.aspect_ratio
        submission_started_at = _now()
    try:
        job = openrouter_media.submit_video(
            project_id,
            model=req.model,
            prompt=prompt,
            duration=req.duration,
            resolution=req.resolution,
            aspect_ratio=aspect_ratio,
            image_url=image_url,
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
        image_card = next((
            item for item in cards
            if item.episode == card.episode
            and item.shot_number == card.shot_number
            and item.stage in ("img_prompt", "storyboard")
            and item.images
        ), None)
        current_image_url = _active_image_url(image_card)
        current_job = card.metadata.get("openrouter_video_job") or {}
        newer_job_exists = (
            str(current_job.get("submittedAt") or "") > submission_started_at
        )
        inputs_match = (
            current_prompt == prompt
            and (
                not image_url
                or not current_image_url
                or current_image_url == image_url
            )
        )
        applied = inputs_match and not newer_job_exists
        job_payload = {
            **job,
            "prompt": prompt,
            "imageUrl": image_url,
            "submittedAt": submission_started_at,
        }
        if applied:
            card.metadata = {
                **card.metadata,
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
            if result.get("url") and result["url"] not in card.videos:
                card.videos.append(result["url"])
            card.metadata = {
                **card.metadata,
                "openrouter_video_job": {
                    **current_job,
                    **result,
                    "syncedAt": _now(),
                },
            }
            if result.get("url"):
                card.metadata["active_video"] = result["url"]
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
        final_card.metadata = {
            **final_card.metadata,
            "active_video": result["url"],
            "compose": result,
        }
        final_card.status = "done"
        final_card.updated_at = now
        project.updated_at = now
        _save_cards(project_id, cards)
        _save_project(project)
    return ok({**result, "card": final_card.model_dump(), "state": _director_state(project_id)})
