"""OpenRouter 图片/视频生成与本地成片合成服务。"""
from __future__ import annotations

import base64
import mimetypes
import re
import shutil
import subprocess
import uuid
from pathlib import Path
from urllib.parse import urlparse

import httpx

from app.config import BASE_DIR
from app.dependencies import ai_service


UPLOAD_ROOT = BASE_DIR / "data" / "uploads"
PRODUCTION_UPLOAD_ROOT = UPLOAD_ROOT / "production"
_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9._-]+$")


def _openrouter_config() -> tuple[str, str]:
    """返回已启用 OpenRouter 的 API 基址与密钥。"""
    for provider in ai_service.list_all_providers():
        if provider.name.lower() == "openrouter" and provider.enabled:
            if not provider.api_key:
                raise ValueError("OpenRouter API Key 未配置")
            return provider.endpoint.rstrip("/"), provider.api_key
    raise ValueError("OpenRouter 供应商未启用")


def _headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost/agent-studio",
        "X-Title": "Agent Studio",
    }


def _project_upload_dir(project_id: str) -> Path:
    if not _SAFE_ID_RE.fullmatch(project_id):
        raise ValueError("项目 ID 非法")
    directory = PRODUCTION_UPLOAD_ROOT / project_id
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _save_bytes(project_id: str, content: bytes, suffix: str) -> str:
    suffix = suffix if suffix.startswith(".") else f".{suffix}"
    filename = f"media_{uuid.uuid4().hex[:12]}{suffix}"
    path = _project_upload_dir(project_id) / filename
    path.write_bytes(content)
    return f"/uploads/production/{project_id}/{filename}"


def _suffix_for_media_type(media_type: str | None, default: str = ".png") -> str:
    if media_type == "image/svg+xml":
        return ".svg"
    guessed = mimetypes.guess_extension(media_type or "")
    return ".jpg" if guessed == ".jpe" else (guessed or default)


def list_media_models(kind: str) -> list[dict]:
    """实时列出 OpenRouter 图片或视频模型，并统一为前端可消费字段。"""
    if kind not in ("image", "video"):
        raise ValueError("kind 只能是 image 或 video")
    endpoint, api_key = _openrouter_config()
    path = "/images/models" if kind == "image" else "/videos/models"
    response = httpx.get(f"{endpoint}{path}", headers=_headers(api_key), timeout=30)
    response.raise_for_status()

    models = []
    for item in response.json().get("data", []):
        model_id = str(item.get("id") or "")
        if not model_id:
            continue
        architecture = item.get("architecture") or {}
        models.append({
            "id": model_id,
            "name": item.get("name") or model_id,
            "kind": kind,
            "description": item.get("description") or "",
            "inputModalities": architecture.get("input_modalities") or ["text"],
            "outputModalities": architecture.get("output_modalities") or [kind],
            "supportedParameters": item.get("supported_parameters") or {},
            "supportedResolutions": item.get("supported_resolutions") or [],
            "supportedAspectRatios": item.get("supported_aspect_ratios") or [],
            "pricing": item.get("pricing") or item.get("pricing_skus") or {},
        })
    return models


def generate_image(
    project_id: str,
    *,
    model: str,
    prompt: str,
    resolution: str = "1K",
    aspect_ratio: str = "9:16",
) -> dict:
    """调用 OpenRouter 专用图片 API，保存首张图片并返回本地 URL。"""
    endpoint, api_key = _openrouter_config()
    payload = {
        "model": model,
        "prompt": prompt,
        "resolution": resolution,
        "aspect_ratio": aspect_ratio,
        "n": 1,
        "output_format": "png",
    }
    response = httpx.post(
        f"{endpoint}/images",
        headers=_headers(api_key),
        json=payload,
        timeout=180,
    )
    response.raise_for_status()
    body = response.json()
    item = (body.get("data") or [None])[0]
    if not isinstance(item, dict):
        raise RuntimeError("OpenRouter 未返回图片")

    if item.get("b64_json"):
        media_type = item.get("media_type") or "image/png"
        url = _save_bytes(
            project_id,
            base64.b64decode(item["b64_json"]),
            _suffix_for_media_type(media_type),
        )
    elif item.get("url"):
        remote = httpx.get(item["url"], timeout=90, follow_redirects=True)
        remote.raise_for_status()
        url = _save_bytes(
            project_id,
            remote.content,
            _suffix_for_media_type(remote.headers.get("content-type")),
        )
    else:
        raise RuntimeError("OpenRouter 图片响应缺少 b64_json/url")

    return {"url": url, "model": model, "usage": body.get("usage") or {}}


def _local_upload_path(url: str) -> Path | None:
    parsed = urlparse(url)
    if parsed.scheme or not parsed.path.startswith("/uploads/"):
        return None
    relative = parsed.path.removeprefix("/uploads/").lstrip("/")
    path = (UPLOAD_ROOT / relative).resolve()
    root = UPLOAD_ROOT.resolve()
    if path != root and root not in path.parents:
        raise ValueError("素材路径越界")
    if not path.is_file():
        raise ValueError(f"参考图不存在: {url}")
    return path


def _image_reference(url: str) -> str:
    local_path = _local_upload_path(url)
    if local_path is not None:
        media_type = mimetypes.guess_type(local_path.name)[0] or "image/png"
        encoded = base64.b64encode(local_path.read_bytes()).decode("ascii")
        return f"data:{media_type};base64,{encoded}"
    if urlparse(url).scheme != "https":
        raise ValueError("远端参考图必须使用 HTTPS")
    return url


def submit_video(
    project_id: str,
    *,
    model: str,
    prompt: str,
    duration: int = 5,
    resolution: str = "720p",
    aspect_ratio: str = "9:16",
    image_url: str = "",
    generate_audio: bool = True,
) -> dict:
    """提交 OpenRouter 异步视频任务，返回任务信息但不阻塞等待。"""
    endpoint, api_key = _openrouter_config()
    payload: dict = {
        "model": model,
        "prompt": prompt,
        "duration": max(1, min(int(duration), 15)),
        "resolution": resolution,
        "aspect_ratio": aspect_ratio,
        "generate_audio": generate_audio,
    }
    if image_url:
        payload["frame_images"] = [{
            "type": "image_url",
            "image_url": {"url": _image_reference(image_url)},
            "frame_type": "first_frame",
        }]

    response = httpx.post(
        f"{endpoint}/videos",
        headers=_headers(api_key),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    body = response.json()
    job_id = str(body.get("id") or "")
    if not _SAFE_ID_RE.fullmatch(job_id):
        raise RuntimeError("OpenRouter 未返回有效视频任务 ID")
    return {
        "id": job_id,
        "status": body.get("status") or "pending",
        "pollingUrl": body.get("polling_url") or f"{endpoint}/videos/{job_id}",
        "model": model,
    }


def sync_video(project_id: str, job_id: str) -> dict:
    """同步一个 OpenRouter 视频任务；完成时下载视频到项目目录。"""
    if not _SAFE_ID_RE.fullmatch(job_id):
        raise ValueError("视频任务 ID 非法")
    endpoint, api_key = _openrouter_config()
    status_response = httpx.get(
        f"{endpoint}/videos/{job_id}",
        headers=_headers(api_key),
        timeout=30,
    )
    status_response.raise_for_status()
    body = status_response.json()
    status = str(body.get("status") or "pending")
    result = {
        "id": job_id,
        "status": status,
        "usage": body.get("usage") or {},
        "error": body.get("error") or "",
    }
    if status != "completed":
        return result

    media_response = httpx.get(
        f"{endpoint}/videos/{job_id}/content?index=0",
        headers=_headers(api_key),
        timeout=180,
        follow_redirects=True,
    )
    media_response.raise_for_status()
    result["url"] = _save_bytes(project_id, media_response.content, ".mp4")
    return result


def local_video_path(url: str) -> Path:
    """把平台媒体 URL 安全映射回本地视频文件。"""
    path = _local_upload_path(url)
    if path is None:
        raise ValueError("成片合成仅支持已落地到平台的本地视频")
    return path


def _has_audio_stream(path: Path) -> bool:
    """用 ffprobe 判断视频是否含音轨；探测失败时按无音轨处理。"""
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return False
    completed = subprocess.run(
        [
            ffprobe, "-v", "error", "-select_streams", "a:0",
            "-show_entries", "stream=codec_type", "-of", "default=nw=1:nk=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    return completed.returncode == 0 and "audio" in completed.stdout


def compose_video(project_id: str, video_urls: list[str], aspect_ratio: str = "9:16") -> dict:
    """使用 FFmpeg 统一画幅并串接镜头；全部有音轨时同步保留声音。"""
    if not video_urls:
        raise ValueError("没有可合成的视频镜头")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("本机未安装 FFmpeg")

    dimensions = {
        "9:16": (720, 1280),
        "16:9": (1280, 720),
        "1:1": (1080, 1080),
        "3:4": (810, 1080),
        "4:3": (1080, 810),
    }
    width, height = dimensions.get(aspect_ratio, dimensions["9:16"])
    paths = [local_video_path(url) for url in video_urls]
    keep_audio = all(_has_audio_stream(path) for path in paths)
    output_path = _project_upload_dir(project_id) / f"final_{uuid.uuid4().hex[:10]}.mp4"

    command = [ffmpeg, "-y"]
    for path in paths:
        command.extend(["-i", str(path)])
    video_filters = [
        f"[{index}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:black,fps=30,setsar=1,"
        f"setpts=PTS-STARTPTS[v{index}]"
        for index in range(len(paths))
    ]
    filters = list(video_filters)
    if keep_audio:
        filters.extend(
            f"[{index}:a]aresample=48000,asetpts=PTS-STARTPTS[a{index}]"
            for index in range(len(paths))
        )
        inputs = "".join(f"[v{index}][a{index}]" for index in range(len(paths)))
        filters.append(inputs + f"concat=n={len(paths)}:v=1:a=1[outv][outa]")
    else:
        filters.append(
            "".join(f"[v{index}]" for index in range(len(paths)))
            + f"concat=n={len(paths)}:v=1:a=0[outv]"
        )
    command.extend([
        "-filter_complex", ";".join(filters),
        "-map", "[outv]",
    ])
    if keep_audio:
        command.extend(["-map", "[outa]", "-c:a", "aac", "-b:a", "192k"])
    else:
        command.append("-an")
    command.extend([
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output_path),
    ])
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=900,
        check=False,
    )
    if completed.returncode != 0:
        output_path.unlink(missing_ok=True)
        detail = completed.stderr[-1600:].strip()
        raise RuntimeError(f"FFmpeg 合成失败: {detail}")
    return {
        "url": f"/uploads/production/{project_id}/{output_path.name}",
        "clipCount": len(paths),
        "aspectRatio": aspect_ratio,
        "width": width,
        "height": height,
        "audioPreserved": keep_audio,
    }
