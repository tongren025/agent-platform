"""镜头控制包：把角色、场景、表演、运镜与声音素材编译成一次视频生成计划。"""
from __future__ import annotations

from pathlib import PurePosixPath
from typing import Literal

from pydantic import BaseModel, Field

from app.models.production import ProductionCard


ReferenceKind = Literal["image", "video", "audio"]
ReferenceRole = Literal[
    "identity", "expression", "scene", "prop", "storyboard", "performance",
    "motion", "camera", "blocking", "dialogue", "sound", "continuity", "style",
]
GenerationMode = Literal["auto", "keyframe", "reference"]
ShotType = Literal[
    "auto", "dialogue", "performance", "action", "camera", "establishing",
    "transition",
]


class ShotReference(BaseModel):
    """一项有明确用途的多模态参考素材。"""

    reference_id: str = ""
    url: str = Field(min_length=1, max_length=4096)
    kind: ReferenceKind = "image"
    role: ReferenceRole = "style"
    label: str = Field(default="", max_length=120)
    note: str = Field(default="", max_length=1000)
    priority: int = Field(default=50, ge=0, le=100)


class ShotControlPack(BaseModel):
    """模型无关的单镜头控制协议。"""

    schema_version: int = 1
    generation_mode: GenerationMode = "auto"
    shot_type: ShotType = "auto"
    first_frame_url: str = Field(default="", max_length=4096)
    last_frame_url: str = Field(default="", max_length=4096)
    references: list[ShotReference] = Field(default_factory=list, max_length=30)
    storyboard: str = Field(default="", max_length=12000)
    camera_plan: str = Field(default="", max_length=4000)
    performance_plan: str = Field(default="", max_length=4000)
    audio_plan: str = Field(default="", max_length=4000)
    continuity_plan: str = Field(default="", max_length=4000)


class ShotControlPlan(BaseModel):
    """一次实际生成采用的控制模式、素材顺序与诊断。"""

    mode: Literal["keyframe", "reference"]
    prompt: str
    first_frame_url: str = ""
    last_frame_url: str = ""
    references: list[ShotReference] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    summary: dict = Field(default_factory=dict)


_VIDEO_SUFFIXES = {".mp4", ".mov", ".mpeg", ".mpg", ".webm", ".m4v"}
_AUDIO_SUFFIXES = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}
_ROLE_PRIORITY = {
    "identity": 100, "scene": 90, "performance": 90, "motion": 88,
    "camera": 86, "blocking": 86, "dialogue": 84, "continuity": 82,
    "storyboard": 80, "expression": 78, "prop": 76, "sound": 70, "style": 60,
}


def infer_reference_kind(url: str) -> ReferenceKind:
    """按 URL 后缀识别素材类型；无后缀素材按图片兼容。"""
    clean = str(url or "").split("?", 1)[0].replace("\\", "/")
    suffix = PurePosixPath(clean).suffix.lower()
    if suffix in _VIDEO_SUFFIXES:
        return "video"
    if suffix in _AUDIO_SUFFIXES:
        return "audio"
    return "image"


def _reference_from_value(
    value: object,
    *,
    default_role: ReferenceRole = "style",
) -> ShotReference | None:
    if isinstance(value, str):
        url = value.strip()
        if not url:
            return None
        return ShotReference(
            url=url,
            kind=infer_reference_kind(url),
            role=default_role,
            priority=_ROLE_PRIORITY[default_role],
        )
    if not isinstance(value, dict):
        return None
    url = str(value.get("url") or value.get("path") or value.get("src") or "").strip()
    if not url:
        return None
    raw_role = str(value.get("role") or default_role).strip().lower()
    role: ReferenceRole = (
        raw_role if raw_role in _ROLE_PRIORITY else default_role
    )  # type: ignore[assignment]
    raw_kind = str(value.get("kind") or value.get("type") or "").lower()
    kind: ReferenceKind = (
        raw_kind if raw_kind in {"image", "video", "audio"}
        else infer_reference_kind(url)
    )  # type: ignore[assignment]
    return ShotReference(
        reference_id=str(value.get("reference_id") or value.get("id") or ""),
        url=url,
        kind=kind,
        role=role,
        label=str(value.get("label") or value.get("name") or "")[:120],
        note=str(value.get("note") or value.get("description") or "")[:1000],
        priority=int(value.get("priority") or _ROLE_PRIORITY[role]),
    )


def _metadata_references(card: ProductionCard | None) -> list[ShotReference]:
    if card is None:
        return []
    references: list[ShotReference] = []
    for key in ("reference_assets", "reference_urls"):
        raw = card.metadata.get(key)
        if isinstance(raw, list):
            references.extend(
                reference for value in raw
                if (reference := _reference_from_value(value)) is not None
            )
    legacy_fields: tuple[tuple[str, ReferenceRole], ...] = (
        ("performance_video_url", "performance"),
        ("motion_reference_url", "motion"),
        ("camera_reference_url", "camera"),
        ("previsualization_url", "blocking"),
        ("clay_render_url", "blocking"),
        ("dialogue_audio_url", "dialogue"),
        ("audio_reference_url", "sound"),
    )
    for field, role in legacy_fields:
        reference = _reference_from_value(card.metadata.get(field), default_role=role)
        if reference is not None:
            references.append(reference)
    return references


def _matching_asset_references(
    cards: list[ProductionCard],
    video_card: ProductionCard,
) -> list[ShotReference]:
    """只绑定分镜点名的角色/场景母版，避免把整个项目素材全部塞给模型。"""
    role_names: list[str] = []
    for source in cards:
        if (
            source.episode == video_card.episode
            and source.shot_number == video_card.shot_number
            and source.stage in {"storyboard", "img_prompt", "vid_prompt"}
        ):
            raw_roles = source.metadata.get("reference_roles") or []
            if isinstance(raw_roles, list):
                role_names.extend(str(value).strip().lower() for value in raw_roles)
    role_names = [value for value in role_names if value]
    if not role_names:
        return []

    matches: list[ShotReference] = []
    for source in cards:
        if source.stage not in {"setting", "design"}:
            continue
        if source.episode not in (None, video_card.episode):
            continue
        identity = " ".join((
            source.title,
            str(source.metadata.get("asset_id") or ""),
            str(source.metadata.get("asset_type") or ""),
        )).lower()
        if not any(name in identity or identity in name for name in role_names):
            continue
        asset_type = str(source.metadata.get("asset_type") or "").lower()
        role: ReferenceRole = (
            "scene" if "scene" in asset_type or "场景" in identity else "identity"
        )
        for url in source.images[-3:]:
            matches.append(ShotReference(
                url=url,
                kind="image",
                role=role,
                label=source.title,
                priority=_ROLE_PRIORITY[role],
            ))
    return matches


def _dedupe_references(references: list[ShotReference]) -> list[ShotReference]:
    best_by_url: dict[str, ShotReference] = {}
    order: list[str] = []
    for reference in references:
        url = reference.url.strip()
        if not url:
            continue
        existing = best_by_url.get(url)
        if existing is None:
            best_by_url[url] = reference.model_copy(update={"url": url})
            order.append(url)
        elif reference.priority > existing.priority:
            best_by_url[url] = reference.model_copy(update={"url": url})
    indexed = {url: index for index, url in enumerate(order)}
    return sorted(
        best_by_url.values(),
        key=lambda item: (-item.priority, indexed[item.url]),
    )[:30]


def build_shot_control_pack(
    cards: list[ProductionCard],
    video_card: ProductionCard,
    image_card: ProductionCard | None,
    *,
    current_image_url: str = "",
    override: ShotControlPack | None = None,
) -> ShotControlPack:
    """合并用户设置、卡片元数据与上游分镜，得到完整控制包。"""
    stored = ShotControlPack.model_validate(
        video_card.metadata.get("shot_control_pack") or {},
    )
    base = (override or stored).model_copy(deep=True)
    storyboard_card = next((
        card for card in cards
        if card.episode == video_card.episode
        and card.shot_number == video_card.shot_number
        and card.stage == "storyboard"
    ), None)
    if current_image_url:
        base.first_frame_url = current_image_url
    if not base.last_frame_url:
        base.last_frame_url = str(video_card.metadata.get("last_frame_url") or "")
    if not base.storyboard and storyboard_card is not None:
        base.storyboard = storyboard_card.content
    for field in ("camera_plan", "performance_plan", "audio_plan", "continuity_plan"):
        if not getattr(base, field):
            setattr(base, field, str(video_card.metadata.get(field) or ""))

    references = list(base.references)
    references.extend(_metadata_references(video_card))
    references.extend(_metadata_references(storyboard_card))
    references.extend(_metadata_references(image_card))
    references.extend(_matching_asset_references(cards, video_card))
    previous_image = next((
        card for card in cards
        if card.episode == video_card.episode
        and card.shot_number == video_card.shot_number - 1
        and card.stage in {"img_prompt", "storyboard"}
        and card.images
    ), None)
    if previous_image is not None:
        previous_url = str(
            previous_image.metadata.get("active_image") or previous_image.images[-1],
        )
        if previous_url:
            references.append(ShotReference(
                url=previous_url,
                kind="image",
                role="continuity",
                label="上一镜结束状态",
                priority=_ROLE_PRIORITY["continuity"],
            ))
    base.references = _dedupe_references(references)
    return base


def _control_prompt(
    base_prompt: str,
    pack: ShotControlPack,
    references: list[ShotReference],
) -> str:
    counters = {"image": 0, "video": 0, "audio": 0}
    prefixes = {"image": "参考图", "video": "参考视频", "audio": "参考音频"}
    bindings: list[str] = []
    for reference in references:
        counters[reference.kind] += 1
        tag = f"{prefixes[reference.kind]}{counters[reference.kind]}"
        purpose = reference.note or reference.label or reference.role
        bindings.append(f"- {tag}：{purpose}（用途：{reference.role}）")
    sections = ["【镜头控制包】"]
    if bindings:
        sections.extend(["素材绑定：", *bindings])
    for title, value in (
        ("【时间轴/故事板】", pack.storyboard),
        ("【摄影机与空间调度】", pack.camera_plan),
        ("【表演与动作】", pack.performance_plan),
        ("【对白与声音】", pack.audio_plan),
        ("【前后镜连续性】", pack.continuity_plan),
    ):
        if value:
            sections.extend([title, value])
    sections.extend(["【本镜头生成提示】", base_prompt.strip()])
    return "\n".join(value for value in sections if value)


def compile_shot_control_plan(
    base_prompt: str,
    pack: ShotControlPack,
    *,
    duration: int,
) -> ShotControlPlan:
    """编译为 OpenRouter 首尾帧或多模态参考两种互斥模式。"""
    references = _dedupe_references(list(pack.references))
    has_multimodal = any(item.kind in {"video", "audio"} for item in references)
    has_semantic_images = any(
        item.kind == "image" and item.role not in {"continuity", "style"}
        for item in references
    )
    mode = pack.generation_mode
    if mode == "auto":
        mode = "reference" if has_multimodal or has_semantic_images else "keyframe"

    warnings: list[str] = []
    if mode == "reference" and pack.first_frame_url:
        references.insert(0, ShotReference(
            url=pack.first_frame_url,
            kind="image",
            role="storyboard",
            label="已验收镜头构图",
            priority=100,
        ))
        references = _dedupe_references(references)
    if mode == "keyframe" and references:
        warnings.append("首尾帧模式会忽略其它参考素材；需要这些素材时请选择多模态参考")
    if not pack.first_frame_url and not any(item.kind == "image" for item in references):
        warnings.append("缺少已验收画面或图片参考，人物与构图稳定性会降低")
    if pack.shot_type in {"dialogue", "performance"} and not any(
        item.role in {"performance", "dialogue"} for item in references
    ):
        warnings.append("对白/表演镜头缺少配音或表演参考")
    if pack.shot_type == "action" and not any(
        item.role in {"motion", "performance", "blocking"} for item in references
    ):
        warnings.append("动作镜头缺少动作或白模预演参考")
    if duration > 6 and not pack.storyboard:
        warnings.append("长于 6 秒的连续镜头缺少时间轴故事板")

    used_references = references if mode == "reference" else []
    role_counts: dict[str, int] = {}
    for reference in used_references:
        role_counts[reference.role] = role_counts.get(reference.role, 0) + 1
    return ShotControlPlan(
        mode=mode,
        prompt=_control_prompt(base_prompt, pack, used_references),
        first_frame_url=pack.first_frame_url if mode == "keyframe" else "",
        last_frame_url=pack.last_frame_url if mode == "keyframe" else "",
        references=used_references,
        warnings=warnings,
        summary={
            "mode": mode,
            "shotType": pack.shot_type,
            "referenceCount": len(used_references),
            "referenceKinds": sorted({item.kind for item in used_references}),
            "roleCounts": role_counts,
            "hasStoryboard": bool(pack.storyboard),
            "hasCameraPlan": bool(pack.camera_plan),
            "hasPerformancePlan": bool(pack.performance_plan),
            "hasAudioPlan": bool(pack.audio_plan),
            "warningCount": len(warnings),
        },
    )
