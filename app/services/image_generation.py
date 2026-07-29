"""OpenAI 兼容文生图公共服务：调用指定模型并把结果持久化到本地画布上传目录。"""

from __future__ import annotations

import base64
import logging
import uuid
from pathlib import Path

import httpx

from app.dependencies import ai_service
from app.services import openrouter_media


logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "data" / "uploads" / "canvas"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _save_image_bytes(content: bytes, ext: str = ".png") -> str:
    """把图片字节写入共享上传目录，返回可由 app 静态服务访问的 URL。"""
    filename = f"img_{uuid.uuid4().hex[:10]}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return f"/uploads/canvas/{filename}"


def generate_image_to_local(prompt: str, model: str, size: str = "1024x1536") -> dict[str, str]:
    """调用指定 images 模型生成一张图，下载远端结果并返回永久本地 URL。"""
    clean_prompt = prompt.strip()
    if not clean_prompt:
        raise ValueError("提示词不能为空")

    if model.startswith("openrouter:"):
        model_id = model.removeprefix("openrouter:")
        if not model_id:
            raise ValueError("OpenRouter 图片模型不能为空")
        width, _, height = size.partition("x")
        try:
            width_value, height_value = int(width), int(height)
        except ValueError:
            width_value, height_value = 1024, 1536
        ratio = width_value / max(height_value, 1)
        aspect_ratio = min(
            ("1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"),
            key=lambda value: abs(
                ratio - (
                    int(value.split(":")[0]) / int(value.split(":")[1])
                )
            ),
        )
        resolution = "2K" if max(width_value, height_value) >= 1900 else "1K"
        generated = openrouter_media.generate_image_bytes(
            model=model_id,
            prompt=clean_prompt,
            resolution=resolution,
            aspect_ratio=aspect_ratio,
        )
        url = _save_image_bytes(generated["content"], generated["suffix"])
        return {"url": url, "model": model_id}

    client, model_id = ai_service.get_client(model)
    try:
        response = client.images.generate(
            model=model_id,
            prompt=clean_prompt,
            size=size,
            n=1,
            timeout=120,
        )
    except Exception:
        logger.warning("生图失败 model=%s", model_id, exc_info=True)
        raise

    datum = response.data[0] if response.data else None
    if datum is None:
        raise RuntimeError("生图接口未返回图片")

    if getattr(datum, "b64_json", None):
        url = _save_image_bytes(base64.b64decode(datum.b64_json))
    elif getattr(datum, "url", None):
        remote = httpx.get(datum.url, timeout=60, follow_redirects=True)
        remote.raise_for_status()
        content_type = remote.headers.get("content-type", "")
        ext = ".jpg" if "jpeg" in content_type or "jpg" in content_type else ".webp" if "webp" in content_type else ".png"
        url = _save_image_bytes(remote.content, ext)
    else:
        raise RuntimeError("生图接口返回了未知格式（无 b64_json 也无 url）")

    return {"url": url, "model": model_id}
