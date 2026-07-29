"""数字员工媒体工具：由聊天模型编排，分别调用图片与视频专用 API。"""
from __future__ import annotations

import asyncio
import json

from app.dependencies import employee_registry
from app.services import openrouter_media
from app.services.image_generation import generate_image_to_local
from app.services.media_inspection import inspect_media
from app.tools.base import ToolContext, register_handler


def _policy(ctx: ToolContext) -> dict:
    """读取当前员工的模型策略；员工已删除时返回空策略并由 handler 给出错误。"""
    employee = employee_registry.get(ctx.employee_key)
    return dict(employee.default_model_policy) if employee is not None else {}


def _json_result(**values) -> str:
    return json.dumps(values, ensure_ascii=False)


def _string_list(value: object, *, limit: int) -> list[str]:
    if not isinstance(value, list):
        return []
    return [
        str(item).strip()
        for item in value[:limit]
        if str(item or "").strip()
    ]


class GenerateImageHandler:
    """使用员工配置的图片模型生成图片，不允许聊天模型自行替换媒体模型。"""

    tool_code = "generate_image"

    async def handle(self, ctx: ToolContext) -> str:
        args = ctx.parse_args()
        prompt = str(args.get("prompt") or "").strip()
        if not prompt:
            return _json_result(success=False, error="prompt is required")

        model = str(_policy(ctx).get("image_model_id") or "").strip()
        if not model:
            return _json_result(
                success=False,
                error="该员工尚未配置图片生成模型 image_model_id",
            )

        size = str(args.get("size") or "1024x1536")
        quality = str(args.get("quality") or "medium").lower()
        if quality not in {"low", "medium", "high", "auto"}:
            quality = "medium"
        reference_urls = _string_list(args.get("reference_urls"), limit=14)

        try:
            result = await asyncio.to_thread(
                generate_image_to_local,
                prompt,
                model,
                size,
                quality,
                reference_urls,
            )
        except Exception as exc:
            return _json_result(
                success=False,
                model=model,
                error=f"图片生成失败: {exc}",
            )

        url = result["url"]
        return _json_result(
            success=True,
            mediaType="image",
            url=url,
            model=result.get("model") or model,
            referenceUrls=reference_urls,
            markdown=f"![生成图片]({url})",
        )


class GenerateVideoHandler:
    """提交异步视频生成任务；完成状态通过 check_video_generation 查询。"""

    tool_code = "generate_video"

    async def handle(self, ctx: ToolContext) -> str:
        args = ctx.parse_args()
        prompt = str(args.get("prompt") or "").strip()
        if not prompt:
            return _json_result(success=False, error="prompt is required")

        configured = str(_policy(ctx).get("video_model_id") or "").strip()
        if not configured:
            return _json_result(
                success=False,
                error="该员工尚未配置视频生成模型 video_model_id",
            )
        if not configured.lower().startswith("openrouter:"):
            return _json_result(
                success=False,
                error="当前视频工具只支持 openrouter: 前缀的视频模型",
            )
        model = configured.split(":", 1)[1].strip()
        if not model:
            return _json_result(success=False, error="OpenRouter 视频模型不能为空")
        project_id = f"employee-{ctx.employee_key}"
        reference_urls = _string_list(args.get("reference_urls"), limit=12)
        first_frame_url = str(args.get("image_url") or "").strip()
        last_frame_url = str(args.get("last_frame_url") or "").strip()

        try:
            result = await asyncio.to_thread(
                openrouter_media.submit_video,
                project_id,
                model=model,
                prompt=prompt,
                duration=args.get("duration", 5),
                resolution=str(args.get("resolution") or "720p"),
                aspect_ratio=str(args.get("aspect_ratio") or "9:16"),
                image_url=first_frame_url,
                last_frame_url=last_frame_url,
                reference_urls=reference_urls,
                generate_audio=bool(args.get("generate_audio", True)),
            )
        except Exception as exc:
            return _json_result(
                success=False,
                model=configured,
                error=f"视频任务提交失败: {exc}",
            )

        return _json_result(
            success=True,
            mediaType="video_job",
            jobId=result["id"],
            status=result.get("status") or "pending",
            model=configured,
            firstFrameUrl=first_frame_url,
            lastFrameUrl=last_frame_url,
            referenceUrls=reference_urls,
            nextAction="稍后调用 check_video_generation，并传入该 jobId",
        )


class CheckVideoGenerationHandler:
    """查询员工视频任务；完成后下载到本地并返回可播放 URL。"""

    tool_code = "check_video_generation"

    async def handle(self, ctx: ToolContext) -> str:
        args = ctx.parse_args()
        job_id = str(args.get("job_id") or "").strip()
        if not job_id:
            return _json_result(success=False, error="job_id is required")

        project_id = f"employee-{ctx.employee_key}"
        try:
            result = await asyncio.to_thread(
                openrouter_media.sync_video,
                project_id,
                job_id,
            )
        except Exception as exc:
            return _json_result(
                success=False,
                jobId=job_id,
                error=f"视频任务查询失败: {exc}",
            )

        status = str(result.get("status") or "pending")
        failed = status.lower() in {"cancelled", "canceled", "failed", "rejected"}
        payload = {
            "success": not failed and not bool(result.get("error")),
            "mediaType": (
                "video" if status == "completed"
                else "video_job"
            ),
            "jobId": job_id,
            "status": status,
            "error": result.get("error") or "",
        }
        if result.get("url"):
            payload["url"] = result["url"]
            payload["markdown"] = f"[播放生成视频]({result['url']})"
        return _json_result(**payload)


class InspectMediaHandler:
    """读取真实图片或视频抽帧，并用当前员工的视觉思考模型生成证据报告。"""

    tool_code = "inspect_media"

    async def handle(self, ctx: ToolContext) -> str:
        args = ctx.parse_args()
        media_urls = _string_list(args.get("media_urls"), limit=12)
        inspection_type = str(args.get("inspection_type") or "").strip().lower()
        criteria_value = args.get("criteria")
        criteria = (
            criteria_value
            if isinstance(criteria_value, str)
            else json.dumps(criteria_value or {}, ensure_ascii=False)
        )
        policy = _policy(ctx)
        model = str(policy.get("model_id") or "").strip()
        if not model:
            return _json_result(
                success=False,
                verdict="blocked",
                error="该员工尚未配置视觉思考模型 model_id",
            )

        try:
            result = await asyncio.to_thread(
                inspect_media,
                model=model,
                reasoning_effort=str(
                    policy.get("reasoning_effort") or "high"
                ),
                media_urls=media_urls,
                inspection_type=inspection_type,
                criteria=criteria,
            )
        except Exception as exc:
            return _json_result(
                success=False,
                verdict="blocked",
                inspectionType=inspection_type,
                error=f"媒体证据检查失败: {exc}",
            )
        return _json_result(success=True, **result)


register_handler(GenerateImageHandler())
register_handler(GenerateVideoHandler())
register_handler(CheckVideoGenerationHandler())
register_handler(InspectMediaHandler())
