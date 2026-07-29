"""多模态成品质检：把平台图片或视频抽帧交给员工的视觉模型审阅。"""
from __future__ import annotations

import base64
import json
import mimetypes
import shutil
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse

from app.dependencies import ai_service
from app.services import openrouter_media
from app.services.chat_response import extract_chat_content


_MAX_VISUAL_INPUTS = 12


def _is_gpt_56_model(model_id: str) -> bool:
    return "gpt-5.6" in str(model_id or "").strip().lower()


def _path_to_data_url(path: Path) -> str:
    media_type = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{media_type};base64,{encoded}"


def _image_reference(url: str) -> str:
    """把平台图片转为 data URL；远端图片仅允许 HTTPS，由模型供应商读取。"""
    local_path = openrouter_media.resolve_upload_path(url)
    if local_path is not None:
        return _path_to_data_url(local_path)
    parsed = urlparse(url)
    if parsed.scheme == "data" and url.startswith("data:image/"):
        return url
    if parsed.scheme != "https":
        raise ValueError("图片证据只允许平台 /uploads/ URL、HTTPS 或 data:image URL")
    return url


def _probe_duration(path: Path) -> float:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("服务器未安装 FFprobe，无法验证视频证据")
    completed = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        timeout=15,
        check=False,
    )
    if completed.returncode != 0:
        detail = completed.stderr[-800:].strip()
        raise RuntimeError(f"读取视频时长失败: {detail}")
    try:
        duration = float(completed.stdout.strip())
    except (TypeError, ValueError) as exc:
        raise RuntimeError("视频缺少可解析的时长信息") from exc
    if duration <= 0:
        raise RuntimeError("视频时长必须大于 0")
    return duration


def _sample_video_frames(path: Path) -> tuple[list[str], float]:
    """在一次 FFmpeg 调用中均匀抽取前、中、后段三帧，避免只看封面。"""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("服务器未安装 FFmpeg，无法验证视频证据")
    duration = _probe_duration(path)
    sample_rate = 3 / max(duration, 0.1)
    with tempfile.TemporaryDirectory(prefix="media-inspection-") as temp_dir:
        pattern = Path(temp_dir) / "frame-%02d.jpg"
        video_filter = (
            f"fps={sample_rate:.8f},"
            "scale=if(gt(iw\\,1280)\\,1280\\,iw):-2"
        )
        completed = subprocess.run(
            [
                ffmpeg,
                "-v",
                "error",
                "-i",
                str(path),
                "-vf",
                video_filter,
                "-frames:v",
                "3",
                "-q:v",
                "3",
                str(pattern),
            ],
            capture_output=True,
            text=True,
            timeout=45,
            check=False,
        )
        if completed.returncode != 0:
            detail = completed.stderr[-1200:].strip()
            raise RuntimeError(f"视频抽帧失败: {detail}")
        frame_paths = sorted(Path(temp_dir).glob("frame-*.jpg"))
        if not frame_paths:
            raise RuntimeError("视频抽帧结果为空")
        return [_path_to_data_url(path) for path in frame_paths[:3]], duration


def _parse_report(text: str) -> dict | str:
    normalized = text.strip()
    if normalized.startswith("```") and normalized.endswith("```"):
        lines = normalized.splitlines()
        normalized = "\n".join(lines[1:-1]).strip()
    try:
        parsed = json.loads(normalized)
    except (json.JSONDecodeError, TypeError):
        return text
    return parsed if isinstance(parsed, dict) else text


def _extract_responses_text(response: object) -> str:
    """提取 Responses API 文本，兼容 SDK 对象和 OpenAI 兼容字典。"""
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str):
        return output_text
    if isinstance(response, dict):
        direct_text = response.get("output_text")
        if isinstance(direct_text, str):
            return direct_text
        output = response.get("output", [])
    else:
        output = getattr(response, "output", [])

    text_parts: list[str] = []
    for item in output or []:
        content = (
            item.get("content", [])
            if isinstance(item, dict)
            else getattr(item, "content", [])
        )
        for part in content or []:
            part_type = (
                part.get("type")
                if isinstance(part, dict)
                else getattr(part, "type", None)
            )
            text = (
                part.get("text")
                if isinstance(part, dict)
                else getattr(part, "text", None)
            )
            if part_type in {"output_text", "text"} and isinstance(text, str):
                text_parts.append(text)
    return "\n".join(text_parts)


def inspect_media(
    *,
    model: str,
    reasoning_effort: str,
    media_urls: list[str],
    inspection_type: str,
    criteria: str,
) -> dict:
    """调用员工的思考模型审阅真实视觉证据，返回报告与证据元数据。"""
    if inspection_type not in {"image", "video"}:
        raise ValueError("inspection_type 必须为 image 或 video")
    if not media_urls:
        raise ValueError("media_urls 至少需要一个可访问资产")

    evidence: list[dict] = []
    visual_inputs: list[str] = []
    if inspection_type == "image":
        for index, url in enumerate(media_urls[:_MAX_VISUAL_INPUTS], start=1):
            visual_inputs.append(_image_reference(url))
            evidence.append({
                "evidence_id": f"image-{index}",
                "type": "image",
                "url": url,
                "accessible": True,
            })
    else:
        for index, url in enumerate(media_urls[:4], start=1):
            local_path = openrouter_media.resolve_upload_path(url)
            if local_path is None:
                raise ValueError("视频质检只接受已落地到平台的 /uploads/ URL")
            frames, duration = _sample_video_frames(local_path)
            visual_inputs.extend(frames)
            evidence.append({
                "evidence_id": f"video-{index}",
                "type": "video",
                "url": url,
                "accessible": True,
                "duration_seconds": round(duration, 3),
                "sampled_frames": len(frames),
            })

    if len(visual_inputs) > _MAX_VISUAL_INPUTS:
        visual_inputs = visual_inputs[:_MAX_VISUAL_INPUTS]

    client, resolved_model = ai_service.get_client(model)
    default_criteria = (
        "检查角色一致性、构图、结构、文字水印、风格；"
        "视频另检查动作连续性、闪烁、变形和首尾衔接。"
    )
    inspection_prompt = (
        "你是独立的漫剧成品质检模型。只能依据本次实际附带的图片证据作结论，"
        "不得把提示词或文件名当作画面证据。"
        f"\n质检类型：{inspection_type}"
        f"\n验收标准：{criteria or default_criteria}"
        f"\n证据清单：{json.dumps(evidence, ensure_ascii=False)}"
        "\n视频证据按每条视频的前段、中段、后段顺序抽帧。"
        "\n请只输出 JSON 对象："
        '{"visual_inspection":{"verdict":"pass|fail|blocked",'
        '"checks":[{"result":"pass|fail|blocked","severity":'
        '"critical|major|minor|info","evidence_id":"","observation":"",'
        '"expected":"","rework":""}],"summary":""}}。'
        "有 critical/major 问题必须 fail；证据无法支持结论必须 blocked。"
    )
    if _is_gpt_56_model(resolved_model):
        response = client.responses.create(
            model=resolved_model,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "严谨审片，报告必须可追溯到实际视觉证据。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": inspection_prompt},
                        *[
                            {
                                "type": "input_image",
                                "image_url": image_url,
                                "detail": "high",
                            }
                            for image_url in visual_inputs
                        ],
                    ],
                },
            ],
            reasoning={"effort": reasoning_effort or "high"},
            max_output_tokens=4096,
            timeout=120,
        )
        report_text = _extract_responses_text(response)
    else:
        content: list[dict] = [{"type": "text", "text": inspection_prompt}]
        content.extend(
            {
                "type": "image_url",
                "image_url": {"url": image_url, "detail": "high"},
            }
            for image_url in visual_inputs
        )
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[
                {
                    "role": "system",
                    "content": "严谨审片，报告必须可追溯到实际视觉证据。",
                },
                {"role": "user", "content": content},
            ],
            max_tokens=4096,
            temperature=0.1,
            timeout=120,
        )
        report_text = extract_chat_content(response)
    if not report_text.strip():
        raise RuntimeError("视觉质检模型未返回报告")
    return {
        "inspectionType": inspection_type,
        "model": resolved_model,
        "evidence": evidence,
        "visualInputCount": len(visual_inputs),
        "report": _parse_report(report_text),
    }
