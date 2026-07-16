"""导演 Agent API：把剧本、图片、视频与成片收束为一条可执行主线。"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.api.common import ok, validate_key
from app.api.production import _load_cards, _load_project, _now, _save_cards, _save_project
from app.models.production import ProductionCard
from app.services import openrouter_media


router = APIRouter(prefix="/api/v1/agentapp/director", tags=["director"])
SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")


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


def _director_state(project_id: str) -> dict:
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    unit_keys = _unit_keys(cards)
    total = len(unit_keys)

    counts = {stage: 0 for stage in SPEC_STAGES}
    image_done = video_done = 0
    shots = []
    for episode, unit in unit_keys:
        unit_cards = [
            card for card in cards
            if card.episode == episode and card.shot_number == unit
        ]
        stage_cards = {stage: _card_for(cards, episode, unit, stage) for stage in SPEC_STAGES}
        for stage, card in stage_cards.items():
            if card is not None:
                counts[stage] += 1

        image_card = stage_cards["img_prompt"] or stage_cards["storyboard"]
        video_card = stage_cards["vid_prompt"]
        image_url = ""
        if image_card and image_card.images:
            image_url = str(image_card.metadata.get("active_image") or image_card.images[-1])
            image_done += 1
        video_url = ""
        video_job = None
        if video_card:
            video_job = video_card.metadata.get("openrouter_video_job")
            if video_card.videos:
                video_url = str(video_card.metadata.get("active_video") or video_card.videos[-1])
                video_done += 1

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
            "videoCardId": video_card.card_id if video_card else "",
            "videoPrompt": (
                (video_card.prompts[0] if video_card.prompts else video_card.content)
                if video_card else ""
            ),
            "videoUrl": video_url,
            "videoJob": video_job,
            "durationSeconds": max(1, min(duration, 15)),
            "reviewCount": sum(1 for card in unit_cards if card.status == "review"),
        })

    final_card = next((card for card in reversed(cards) if card.stage == "final" and card.videos), None)
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
        "reviewCount": sum(1 for card in cards if card.status == "review"),
        "activeJobs": sum(
            1 for shot in shots
            if shot["videoJob"] and shot["videoJob"].get("status") in ("pending", "in_progress")
        ),
        "finalUrl": (
            str(final_card.metadata.get("active_video") or final_card.videos[-1])
            if final_card else ""
        ),
    }


@router.get("/projects/{project_id}")
def get_director_state(project_id: str):
    """返回总制片视角的项目进度、镜头与下一步动作。"""
    validate_key(project_id, label="project_id")
    return ok(_director_state(project_id))


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


@router.post("/projects/{project_id}/cards/{card_id}/image")
def generate_director_image(project_id: str, card_id: str, req: ImageGenerateReq):
    """为一个镜头生成图片并自动回填到图片提示卡。"""
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    card = next((item for item in cards if item.card_id == card_id), None)
    if card is None:
        raise HTTPException(404, f"卡片 {card_id} 不存在")
    if card.stage not in ("img_prompt", "storyboard"):
        raise HTTPException(400, "该卡片不是图片生产卡")
    prompt = req.prompt.strip() or (card.prompts[0].strip() if card.prompts else card.content.strip())
    if not prompt:
        raise HTTPException(400, "镜头没有图片提示词")
    try:
        result = openrouter_media.generate_image(
            project_id,
            model=req.model,
            prompt=prompt,
            resolution=req.resolution,
            aspect_ratio=req.aspect_ratio or project.aspect_ratio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"OpenRouter 生图失败: {exc}") from exc

    card.images.append(result["url"])
    card.metadata = {
        **card.metadata,
        "active_image": result["url"],
        "last_image_model": result["model"],
        "last_image_prompt": prompt,
        "last_image_usage": result.get("usage") or {},
    }
    card.status = "done"
    card.updated_at = _now()
    _save_cards(project_id, cards)
    return ok({**result, "card": card.model_dump()})


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
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    card = next((item for item in cards if item.card_id == card_id), None)
    if card is None:
        raise HTTPException(404, f"卡片 {card_id} 不存在")
    if card.stage != "vid_prompt":
        raise HTTPException(400, "该卡片不是视频生产卡")
    prompt = req.prompt.strip() or (card.prompts[0].strip() if card.prompts else card.content.strip())
    if not prompt:
        raise HTTPException(400, "镜头没有视频提示词")

    image_url = req.image_url
    if not image_url:
        image_card = next((
            item for item in cards
            if item.episode == card.episode and item.shot_number == card.shot_number
            and item.stage in ("img_prompt", "storyboard") and item.images
        ), None)
        if image_card:
            image_url = str(image_card.metadata.get("active_image") or image_card.images[-1])
    try:
        job = openrouter_media.submit_video(
            project_id,
            model=req.model,
            prompt=prompt,
            duration=req.duration,
            resolution=req.resolution,
            aspect_ratio=req.aspect_ratio or project.aspect_ratio,
            image_url=image_url,
            generate_audio=req.generate_audio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"OpenRouter 视频任务提交失败: {exc}") from exc

    card.metadata = {
        **card.metadata,
        "openrouter_video_job": {
            **job,
            "prompt": prompt,
            "imageUrl": image_url,
            "submittedAt": _now(),
        },
    }
    card.updated_at = _now()
    _save_cards(project_id, cards)
    return ok({"job": job, "card": card.model_dump()})


@router.post("/projects/{project_id}/cards/{card_id}/video/sync")
def sync_director_video(project_id: str, card_id: str):
    """同步视频任务状态；完成后下载 MP4 并自动回填镜头。"""
    _load_project(project_id)
    cards = _load_cards(project_id)
    card = next((item for item in cards if item.card_id == card_id), None)
    if card is None:
        raise HTTPException(404, f"卡片 {card_id} 不存在")
    job = card.metadata.get("openrouter_video_job") or {}
    job_id = str(job.get("id") or "")
    if not job_id:
        raise HTTPException(400, "卡片没有待同步的视频任务")
    try:
        result = openrouter_media.sync_video(project_id, job_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"同步视频任务失败: {exc}") from exc

    card.metadata = {
        **card.metadata,
        "openrouter_video_job": {**job, **result, "syncedAt": _now()},
    }
    if result.get("url"):
        card.videos.append(result["url"])
        card.metadata["active_video"] = result["url"]
        card.status = "done"
    elif result.get("status") == "failed":
        card.status = "review"
    card.updated_at = _now()
    _save_cards(project_id, cards)
    return ok({"job": result, "card": card.model_dump()})


@router.post("/projects/{project_id}/compose")
def compose_director_cut(project_id: str):
    """按集数与 G 单元顺序合成全部镜头，并生成/更新 final 卡。"""
    project = _load_project(project_id)
    cards = _load_cards(project_id)
    video_cards = sorted(
        [card for card in cards if card.stage == "vid_prompt" and card.videos],
        key=lambda card: (-1 if card.episode is None else card.episode, card.shot_number, card.created_at),
    )
    video_urls = [
        str(card.metadata.get("active_video") or card.videos[-1])
        for card in video_cards
    ]
    try:
        result = openrouter_media.compose_video(project_id, video_urls, project.aspect_ratio)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"成片合成失败: {exc}") from exc

    now = _now()
    final_card = next((card for card in cards if card.stage == "final" and card.shot_number == 0), None)
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
