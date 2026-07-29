"""模型引用与端点能力判定：统一隔离聊天、图片、视频及其他专用模型。"""
from __future__ import annotations


_IMAGE_PREFIXES = (
    "chatgpt-image-",
    "dall-e-",
    "gpt-image-",
)
_IMAGE_MARKERS = (
    "flux",
    "ideogram",
    "imagen",
    "imagegen",
    "recraft",
    "seedream",
    "stable-diffusion",
)
_VIDEO_MARKERS = (
    "grok-imagine-video",
    "hailuo",
    "happyhorse",
    "kling",
    "seedance",
    "sora",
    "veo",
    "video-generation",
    "wan-",
    "wan-video",
)
_NON_CHAT_MARKERS = (
    "audio",
    "codex",
    "embedding",
    "moderation",
    "realtime",
    "search-preview",
    "transcribe",
    "tts",
)
_VALID_MODALITIES = {"text", "image", "video"}


def unqualified_model_id(model_ref: str) -> str:
    """移除显式 ``provider:model`` 前缀；保留 ``vendor/model:free`` 这类裸 ID。"""
    normalized = str(model_ref or "").strip()
    if ":" not in normalized:
        return normalized
    prefix, model_id = normalized.split(":", 1)
    if "/" in prefix:
        return normalized
    return model_id


def is_image_generation_model_id(model_ref: str) -> bool:
    """按已知模型族判断是否为图片生成专用模型。"""
    model_id = unqualified_model_id(model_ref).lower()
    if model_id.startswith(_IMAGE_PREFIXES):
        return True
    return any(marker in model_id for marker in _IMAGE_MARKERS) or (
        "image" in model_id and "vision" not in model_id
    )


def is_video_generation_model_id(model_ref: str) -> bool:
    """按已知模型族判断是否为视频生成专用模型。"""
    model_id = unqualified_model_id(model_ref).lower()
    return any(marker in model_id for marker in _VIDEO_MARKERS)


def is_chat_completion_model_id(model_ref: str) -> bool:
    """聊天链只接受通用模型，拒绝图片、视频、音频、嵌入等专用端点模型。"""
    model_id = unqualified_model_id(model_ref).lower()
    if not model_id:
        return False
    if is_image_generation_model_id(model_id) or is_video_generation_model_id(model_id):
        return False
    return not any(marker in model_id for marker in _NON_CHAT_MARKERS)


def validate_employee_model_routes(
    output_modalities: list[str] | None,
    policy: dict | None,
) -> None:
    """校验员工能力与模型路由的结构不变量；供应商可用性由 API 层另行检查。"""
    modalities = set(output_modalities or ["text"])
    invalid = modalities - _VALID_MODALITIES
    if invalid:
        raise ValueError(f"不支持的员工输出能力: {', '.join(sorted(invalid))}")
    if "text" not in modalities:
        raise ValueError("员工必须保留 text 能力，由思考模型负责分析和工具编排")

    model_policy = policy or {}
    chat_model = str(model_policy.get("model_id") or "").strip()
    if not chat_model:
        raise ValueError("员工必须显式配置 model_id 作为思考模型")
    if not is_chat_completion_model_id(chat_model):
        raise ValueError(
            f"{chat_model} 不能作为员工思考模型；请配置到对应的图片或视频模型字段"
        )

    image_model = str(model_policy.get("image_model_id") or "").strip()
    if "image" in modalities:
        if not image_model:
            raise ValueError("图片员工必须配置 image_model_id")
        if not is_image_generation_model_id(image_model):
            raise ValueError(f"{image_model} 不是可识别的图片生成模型")

    video_model = str(model_policy.get("video_model_id") or "").strip()
    if "video" in modalities and not video_model:
        raise ValueError("视频员工必须配置 video_model_id")
