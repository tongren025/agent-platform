"""Production pipeline API — project & card CRUD + AI generation."""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import tempfile
import threading
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Request
from fastapi.responses import FileResponse
from pydantic import AliasChoices, BaseModel, Field
from starlette.background import BackgroundTask

from app.config import BASE_DIR, settings as app_settings
from app.core.logging import get_logger
from app.models.conversation import AgentRunRequest
from app.models.production import (
    STAGES, STAGE_KEYS, STAGE_INSTRUCTIONS, ROLES,
    GC_STAGES, GC_STAGE_KEYS, GC_STAGE_INSTRUCTIONS,
    ProductionCard, ProductionGoal, ProductionProject, ProjectWithCards, ProjectMember,
)
from app.services.invocation import run_invocation
from app.services.image_generation import generate_image_to_local
from app.services.inbox_ingest import parse_inbox_filename, resolve_inbox_target
from app.services.production_quality import (
    build_image_repair_prompt,
    evaluate_production_draft,
    evaluate_visual_quality,
    image_is_approved,
    image_requires_precision_review,
    visual_quality_profile,
)

router = APIRouter(prefix="/api/v1/agentapp/production", tags=["production"])
logger = get_logger(__name__)

INBOX_MAX_FILE_BYTES = 50 * 1024 * 1024  # 50 MB per file

_STAGE_EMPLOYEE_CANDIDATES: dict[str, tuple[str, ...]] = {
    "script": ("comic-screenwriter", "script-doctor"),
    "setting": ("comic-character-designer", "comic-scene-designer"),
    "design": ("comic-prompt-engineer", "comic-character-designer"),
    "storyboard": ("comic-storyboard", "comic-director"),
    "img_prompt": ("comic-prompt-engineer", "comic-keyframe-artist"),
    "vid_prompt": ("comic-video-artist", "comic-prompt-engineer"),
}

DATA_DIR = BASE_DIR / "data" / "production"
DATA_DIR.mkdir(parents=True, exist_ok=True)
_PROJECT_LOCKS: dict[str, threading.RLock] = {}
_PROJECT_LOCKS_GUARD = threading.Lock()


def _project_lock(pid: str) -> threading.RLock:
    """返回项目级进程内重入锁，保护 JSON 的读-改-写序列。"""
    with _PROJECT_LOCKS_GUARD:
        lock = _PROJECT_LOCKS.get(pid)
        if lock is None:
            lock = threading.RLock()
            _PROJECT_LOCKS[pid] = lock
        return lock


def _select_generation_employee(
    target_stage: str,
    requested_employee_key: str,
    project_employee_key: str,
) -> str:
    """按“本次指定 → 项目默认 → 阶段专业员工”选择生成执行人。

    旧逻辑在项目未指定员工时直接取注册表第一项，文件排序变化就可能把充值策略助手
    拿去写漫剧。这里仅从目标阶段的专业候选中选择启用员工；一个都没有时明确报错。
    """
    if requested_employee_key.strip():
        return requested_employee_key.strip()
    if project_employee_key.strip():
        return project_employee_key.strip()

    from app.dependencies import employee_registry

    enabled_keys = {
        employee.employee_key
        for employee in employee_registry.list_all()
        if employee.enabled
    }
    for candidate in _STAGE_EMPLOYEE_CANDIDATES.get(target_stage, ()):
        if candidate in enabled_keys:
            return candidate
    return ""


def _proj_dir(pid: str) -> Path:
    """返回项目目录，并拒绝任何越出 production 根目录的项目标识。"""
    root = DATA_DIR.resolve()
    candidate = (DATA_DIR / pid).resolve()
    if candidate.parent != root:
        raise HTTPException(400, "无效项目 ID")
    return candidate


def _load_project(pid: str) -> ProductionProject:
    """从磁盘加载项目；旧数据缺少新增字段时由模型默认值兼容，不在读取时写盘。"""
    f = _proj_dir(pid) / "project.json"
    if not f.exists():
        raise HTTPException(404, f"项目 {pid} 不存在")
    return ProductionProject.model_validate_json(f.read_text("utf-8"))


def _save_project(proj: ProductionProject) -> None:
    """把项目对象写回磁盘 project.json（目录不存在则创建）。"""
    d = _proj_dir(proj.project_id)
    _write_json_atomic(d / "project.json", proj.model_dump())


def _load_cards(pid: str) -> list[ProductionCard]:
    """加载项目的全部生产卡片；cards.json 不存在时返回空列表。"""
    f = _proj_dir(pid) / "cards.json"
    if not f.exists():
        return []
    raw = json.loads(f.read_text("utf-8"))
    return [ProductionCard.model_validate(c) for c in raw]


def _save_cards(pid: str, cards: list[ProductionCard]) -> None:
    """把项目卡片列表整体写回 cards.json（全量覆盖写）。"""
    _write_json_atomic(
        _proj_dir(pid) / "cards.json",
        [c.model_dump() for c in cards],
    )


def _now() -> str:
    """返回当前 UTC 时间的 ISO 格式字符串，作为统一时间戳。"""
    return datetime.now(timezone.utc).isoformat()


def _write_json_atomic(path: Path, payload: Any) -> None:
    """先写同目录临时文件再原子替换，避免进程中断留下半截 JSON。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            "utf-8",
        )
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)


def _versions_dir(pid: str) -> Path:
    """返回项目版本目录。"""
    return _proj_dir(pid) / "versions"


def _snapshot_summary(cards: list[ProductionCard], description: str = "") -> dict:
    """生成读者可理解的版本摘要，避免版本列表只剩一个时间戳。"""
    stage_counts: dict[str, int] = {}
    for card in cards:
        stage_counts[card.stage] = stage_counts.get(card.stage, 0) + 1
    episodes = sorted({card.episode for card in cards if card.episode is not None})
    return {
        "description": description,
        "card_count": len(cards),
        "stage_counts": stage_counts,
        "episodes": episodes,
    }


def _snapshot_hash(project: ProductionProject, cards: list[ProductionCard]) -> str:
    """计算项目与卡片当前内容指纹，供自动快照去重。"""
    return _snapshot_payload_hash(
        project.model_dump(),
        [card.model_dump() for card in cards],
    )


def _snapshot_payload_hash(project: dict, cards: list[dict]) -> str:
    """按快照原始 JSON 算指纹，新增模型默认字段时仍能验证旧合法版本。"""
    canonical = json.dumps(
        {
            "project": project,
            "cards": cards,
        },
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _version_metadata(payload: dict) -> dict:
    """从完整版本文件裁出列表页所需元数据，避免 GET versions 返回全部卡片正文。"""
    return {
        "version_id": payload.get("version_id", ""),
        "label": payload.get("label", ""),
        "reason": payload.get("reason", ""),
        "created_at": payload.get("created_at", ""),
        "summary": payload.get("summary") or {},
    }


def _read_version_files(pid: str) -> list[dict]:
    """读取项目全部版本文件；坏文件记录告警并跳过，不阻断其余历史。"""
    directory = _versions_dir(pid)
    if not directory.exists():
        return []
    versions: list[dict] = []
    for path in directory.glob("*.json"):
        try:
            payload = json.loads(path.read_text("utf-8"))
            if isinstance(payload, dict) and payload.get("version_id"):
                versions.append(payload)
        except (OSError, json.JSONDecodeError):
            logger.warning("版本文件读取失败，已跳过: %s", path, exc_info=True)
    return sorted(versions, key=lambda item: item.get("created_at", ""), reverse=True)


def _create_project_snapshot(
    pid: str,
    *,
    label: str,
    reason: str,
    description: str = "",
    force: bool = False,
) -> dict | None:
    """保存项目和全部卡片快照；自动快照与最近内容相同则跳过。"""
    with _project_lock(pid):
        project = _load_project(pid)
        cards = _load_cards(pid)
        content_hash = _snapshot_hash(project, cards)
        if not force:
            existing = _read_version_files(pid)
            if existing and existing[0].get("content_hash") == content_hash:
                return None

        now = _now()
        version_id = (
            datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
            + "-"
            + uuid.uuid4().hex[:8]
        )
        payload = {
            "schema_version": 1,
            "version_id": version_id,
            "label": label.strip() or "自动快照",
            "reason": reason.strip() or "automatic",
            "created_at": now,
            "summary": _snapshot_summary(cards, description),
            "content_hash": content_hash,
            "project": project.model_dump(),
            "cards": [card.model_dump() for card in cards],
        }
        _write_json_atomic(_versions_dir(pid) / f"{version_id}.json", payload)
        return _version_metadata(payload)


def _load_version(pid: str, version_id: str) -> dict:
    """按安全版本 ID 加载单个快照。"""
    if not re.fullmatch(r"[A-Za-z0-9_-]+", version_id):
        raise HTTPException(400, "无效版本 ID")
    path = _versions_dir(pid) / f"{version_id}.json"
    if not path.is_file():
        raise HTTPException(404, f"版本 {version_id} 不存在")
    try:
        payload = json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "版本文件损坏，无法恢复") from exc
    if payload.get("version_id") != version_id:
        raise HTTPException(500, "版本文件标识不一致")
    if (
        not isinstance(payload.get("project"), dict)
        or not isinstance(payload.get("cards"), list)
        or not isinstance(payload.get("content_hash"), str)
        or not payload.get("content_hash")
    ):
        raise HTTPException(500, "版本文件缺少完整项目、卡片或内容指纹")
    if payload.get("schema_version") != 1:
        raise HTTPException(500, "暂不支持该项目版本格式")
    if (
        _snapshot_payload_hash(payload["project"], payload["cards"])
        != payload["content_hash"]
    ):
        raise HTTPException(500, "版本文件内容指纹校验失败")
    try:
        ProductionProject.model_validate(payload["project"])
        validated_cards = [
            ProductionCard.model_validate(item)
            for item in payload["cards"]
        ]
        del validated_cards
    except Exception as exc:
        raise HTTPException(500, "版本文件项目或卡片格式错误") from exc
    return payload


def _load_comments(pid: str) -> list[dict]:
    """读取项目批注；历史项目没有 comments.json 时返回空列表。"""
    path = _proj_dir(pid) / "comments.json"
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "项目批注文件损坏") from exc
    if not isinstance(payload, list):
        raise HTTPException(500, "项目批注文件格式错误")
    return [item for item in payload if isinstance(item, dict)]


def _save_comments(pid: str, comments: list[dict]) -> None:
    """原子写回项目批注。"""
    _write_json_atomic(_proj_dir(pid) / "comments.json", comments)


def _extract_json_payload(text: str) -> Any | None:
    """尽量从 AI 回复中提取 JSON 载荷；失败时返回 None 走 Markdown 分段兼容路径。"""
    raw = text.strip()
    if raw.startswith("```"):
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw, re.IGNORECASE)
        if match:
            raw = match.group(1).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _coerce_int(value: Any) -> Optional[int]:
    """把 JSON 字段或标题里的数字转成 int；无法解析时返回 None。"""
    if value is None or value == "":
        return None
    if isinstance(value, int):
        return value
    match = re.search(r"\d+", str(value))
    return int(match.group(0)) if match else None


def _detect_generation_unit(title: str, metadata: dict) -> Optional[int]:
    """识别 G1/G2 等生成单元编号；不把普通“镜头01”当成单元，避免旧回复误归类。"""
    for key in ("unit_number", "generation_unit", "unit", "g", "shot_number"):
        value = _coerce_int(metadata.get(key))
        if value is not None:
            return value
    match = re.match(r"^\s*G\s*0*(\d+)(?:\b|[^\d])", title, re.IGNORECASE)
    return int(match.group(1)) if match else None


def _detect_time_range(text: str) -> str:
    """从标题或正文里提取第一个 00:00-00:15 形式的时间范围。"""
    match = re.search(r"(\d{1,2}:\d{2})\s*[-~—]\s*(\d{1,2}:\d{2})", text)
    return f"{match.group(1)}-{match.group(2)}" if match else ""


def _is_overview_card(title: str) -> bool:
    """判断 AI 回复段是否是一集级总表/头部/质检等概览卡，概览卡固定落到单元号 0。"""
    overview_words = ("镜头拆分表", "全局头部", "质检报告", "视觉母题", "单元衔接", "导演Brief")
    return any(word in title for word in overview_words)


def _sections_from_reply(reply: str) -> list[dict]:
    """把 AI 回复统一成卡片草稿列表，优先结构化 JSON，失败回退到 --- Markdown 分段。"""
    payload = _extract_json_payload(reply)
    if payload is not None:
        if isinstance(payload, dict):
            items = payload.get("cards") or payload.get("items") or payload.get("sections") or []
        else:
            items = payload
        if isinstance(items, list):
            drafts = []
            for item in items:
                if not isinstance(item, dict):
                    continue
                metadata = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
                title = str(item.get("title") or item.get("name") or "生成卡片").strip()
                body = str(item.get("content") or item.get("body") or item.get("text") or "").strip()
                prompts = item.get("prompts") if isinstance(item.get("prompts"), list) else []
                negative_prompts = item.get("negative_prompts") if isinstance(item.get("negative_prompts"), list) else []
                drafts.append({"title": title, "content": body, "prompts": prompts,
                               "negative_prompts": negative_prompts, "metadata": metadata})
            if drafts:
                return drafts

    drafts = []
    # 只有独占一行的 --- 才是卡片分隔符。Markdown 表格的 |---|---| 也含
    # 连续连字符，旧版直接 str.split 会把一张表拆成十几张标题为 "|" 的脏卡。
    sections = re.split(r"(?m)^\s*---\s*$", reply)
    for section in [item.strip() for item in sections if item.strip()]:
        lines = section.strip().split("\n")
        title = lines[0].strip().lstrip("#").strip() if lines else "生成卡片"
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section
        drafts.append({"title": title, "content": body, "prompts": [], "negative_prompts": [], "metadata": {}})
    return drafts


SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")
STORY_IMAGE_STAGE_PRIORITY = {
    "img_gen": 0,
    # “我的项目”首先服务于看懂故事；制片故事板比视频首帧更适合人阅读。
    "storyboard": 1,
    "img_prompt": 2,
    "final": 3,
    "vid_prompt": 4,
}


def _positive_int(value: object) -> int:
    """把卡片元数据中的正整数安全收敛为 int，异常值按 0 处理。"""
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return 0
    return parsed if parsed > 0 else 0


def _compute_story_preview(cards: list[ProductionCard]) -> dict:
    """提取项目列表可直接展示的剧情画面摘要，避免前端下载全部卡片后再猜。"""
    aligned_cards = [
        card for card in cards
        if card.images
        and isinstance(card.metadata.get("prompt_order"), list)
        and card.metadata.get("prompt_order")
    ]
    aligned_cards.sort(
        key=lambda card: (
            STORY_IMAGE_STAGE_PRIORITY.get(card.stage, 99),
            -len(card.images),
        )
    )

    expected = 0
    story_images: list[str] = []
    video_count = 0
    if aligned_cards:
        source = aligned_cards[0]
        order = source.metadata.get("prompt_order") or []
        expected = max(
            len(order),
            _positive_int(source.metadata.get("shot_count")),
            _positive_int(source.metadata.get("prompt_count")),
            _positive_int(source.metadata.get("keyframe_count")),
        )
        story_images = list(source.images[:expected or None])
        video_count = max((len(card.videos) for card in cards), default=0)
    else:
        unit_keys = sorted({
            (card.episode, card.shot_number)
            for card in cards
            if card.shot_number > 0
        }, key=lambda item: (item[0] is None, item[0] or 0, item[1]))
        if unit_keys:
            expected = 0
            for episode, shot_number in unit_keys:
                unit_cards = [
                    card for card in cards
                    if card.episode == episode and card.shot_number == shot_number
                ]
                visual_cards = sorted(
                    (card for card in unit_cards if card.images),
                    key=lambda card: (
                        STORY_IMAGE_STAGE_PRIORITY.get(card.stage, 99),
                        -len(card.images),
                    ),
                )
                if visual_cards:
                    visual_card = visual_cards[0]
                    panel_count = max(
                        len(visual_card.images),
                        _positive_int(visual_card.metadata.get("panel_count")),
                        1,
                    )
                    expected += panel_count
                    story_images.extend(visual_card.images[:panel_count])
                else:
                    expected += 1
                if any(card.videos for card in unit_cards):
                    video_count += 1
        else:
            # 老项目可能只有聚合卡且没有 prompt_order；只把生产画面作为故事预览，
            # 人物三视图和场景母版留给项目详情的“人物与世界”区域。
            fallback_cards = sorted(
                (
                    card for card in cards
                    if card.images and card.stage not in {"idea", "setting", "design"}
                ),
                key=lambda card: (
                    STORY_IMAGE_STAGE_PRIORITY.get(card.stage, 99),
                    card.created_at,
                ),
            )
            seen: set[str] = set()
            for card in fallback_cards:
                for image in card.images:
                    if image not in seen:
                        seen.add(image)
                        story_images.append(image)
            expected = max(
                len(story_images),
                max(
                    (
                        max(
                            _positive_int(card.metadata.get("shot_count")),
                            _positive_int(card.metadata.get("prompt_count")),
                            _positive_int(card.metadata.get("keyframe_count")),
                        )
                        for card in cards
                    ),
                    default=0,
                ),
            )
            video_count = max((len(card.videos) for card in cards), default=0)

    # 同一批画面常被图片提示词、视频提示词和交付卡重复引用；列表只计一次。
    story_images = list(dict.fromkeys(story_images))
    available = len(story_images)
    final_video_ready = any(
        card.stage == "final" and card.status == "done" and card.videos
        for card in cards
    )
    approved_images = min(
        max(
            (
                _positive_int(card.metadata.get("approved_image_count"))
                for card in cards
            ),
            default=0,
        ),
        available,
    )
    if final_video_ready and expected:
        video_count = expected
    return {
        "available_images": available,
        "approved_images": approved_images,
        "expected_images": expected,
        "missing_images": max(expected - available, 0),
        "preview_images": story_images[:4],
        "video_count": min(video_count, expected) if expected else video_count,
        "has_final_video": final_video_ready,
    }


def _compute_readiness(cards: list[ProductionCard]) -> dict:
    """按镜头计算真实生产就绪度，并兼容把整支预告聚合在一张卡里的项目。"""
    units = sorted(
        {
            (c.episode, c.shot_number)
            for c in cards
            if c.shot_number > 0
        },
        # 旧 GC 的镜头允许 episode=None；Python 3 不能直接比较 None 与 int。
        # 把全局镜头稳定排在分集镜头之前，同时保留二者为不同生产单元。
        key=lambda item: (
            -1 if item[0] is None else item[0],
            item[1],
        ),
    )
    if not units:
        story_preview = _compute_story_preview(cards)
        total = story_preview["expected_images"]
        if not total:
            return {
                "units": 0, "spec_ready": 0, "with_image": 0, "with_video": 0,
                "delivered": 0, "spec_rate": 0, "image_rate": 0,
                "video_rate": 0, "delivery_rate": 0, "overall_progress": 0,
                "blockers": 0, "next_action": "先生成剧本和镜头画面",
            }
        present = {card.stage for card in cards}
        has_all_specs = all(stage in present for stage in SPEC_STAGES)
        spec_ready = total if has_all_specs else 0
        missing_spec = 0 if has_all_specs else total
        with_image = min(story_preview["available_images"], total)
        with_video = min(story_preview["video_count"], total)
        delivered = total if story_preview["has_final_video"] else 0
    else:
        spec_ready = with_image = with_video = delivered = 0
        missing_spec = 0
        for episode, unit in units:
            unit_cards = [c for c in cards if c.episode == episode and c.shot_number == unit]
            present = {c.stage for c in unit_cards}
            missing = [stage for stage in SPEC_STAGES if stage not in present]
            if not missing:
                spec_ready += 1
            else:
                missing_spec += 1
            if any(c.images for c in unit_cards):
                with_image += 1
            if any(c.videos for c in unit_cards):
                with_video += 1
            if any(c.stage == "final" and c.status == "done" for c in unit_cards):
                delivered += 1
        total = len(units)

    spec_rate = round(spec_ready / total * 100)
    image_rate = round(with_image / total * 100)
    video_rate = round(with_video / total * 100)
    delivery_rate = round(delivered / total * 100)
    overall = round(spec_rate * 0.4 + image_rate * 0.3 + video_rate * 0.2 + delivery_rate * 0.1)
    if missing_spec:
        next_action = f"补齐 {missing_spec} 个镜头的制作信息"
    elif with_image < total:
        next_action = f"还差 {total - with_image} 个镜头画面"
    elif with_video < total:
        next_action = f"还差 {total - with_video} 个镜头视频"
    elif delivered < total:
        next_action = "完成剪辑并导出成片"
    else:
        next_action = "成片已经可以交付"
    return {
        "units": total,
        "spec_ready": spec_ready,
        "with_image": with_image,
        "with_video": with_video,
        "delivered": delivered,
        "spec_rate": spec_rate,
        "image_rate": image_rate,
        "video_rate": video_rate,
        "delivery_rate": delivery_rate,
        "overall_progress": overall,
        "blockers": missing_spec,
        "next_action": next_action,
    }


def _compute_stats(cards: list[ProductionCard]) -> dict:
    """统计卡片状态与真实生产就绪度，供项目列表、首页和 stats 接口复用。"""
    total = len(cards)
    by_stage: dict[str, dict] = {}
    by_status: dict[str, int] = {}
    for s in STAGES:
        stage_cards = [c for c in cards if c.stage == s["key"]]
        done = sum(1 for c in stage_cards if c.status == "done")
        by_stage[s["key"]] = {
            "total": len(stage_cards),
            "done": done,
            "pending": len(stage_cards) - done,
            "progress": round(done / len(stage_cards) * 100) if stage_cards else 0,
        }
    for c in cards:
        by_status[c.status] = by_status.get(c.status, 0) + 1
    done_total = by_status.get("done", 0)
    readiness = _compute_readiness(cards)
    story_preview = _compute_story_preview(cards)
    return {
        "total": total,
        "by_stage": by_stage,
        "by_status": by_status,
        "card_status_progress": round(done_total / total * 100) if total else 0,
        "overall_progress": readiness["overall_progress"],
        "readiness": readiness,
        "story_preview": story_preview,
    }


# ── Projects ──────────────────────────────────────────────────────

@router.get("/projects")
def list_projects():
    """GET /projects：列出全部生产项目，附带卡片数与进度统计。"""
    projects = []
    if DATA_DIR.exists():
        for d in sorted(DATA_DIR.iterdir()):
            f = d / "project.json"
            if f.exists():
                proj = _load_project(d.name)
                cards = _load_cards(proj.project_id)
                stats = _compute_stats(cards)
                projects.append({**proj.model_dump(), "cardCount": len(cards), "stats": stats})
    return {"code": 200, "data": projects}


class CreateProjectReq(BaseModel):
    """POST /projects 请求体：名称、素材、执行方、交付目标及首页置顶状态。"""
    name: str
    description: str = ""
    source_type: str = "idea"
    source_content: str = ""
    employee_key: str = ""
    team_code: str = ""
    episode_count: int = Field(default=0, ge=0, le=500)
    episode_duration_seconds: int = Field(default=90, ge=5, le=3600)
    aspect_ratio: str = "9:16"
    visual_style: str = ""
    budget: float = Field(default=0, ge=0)
    production_goal: ProductionGoal = Field(
        default="final",
        validation_alias=AliasChoices("production_goal", "productionGoal"),
    )
    pinned: bool = False


@router.post("/projects")
def create_project(req: CreateProjectReq, request: Request):
    """POST /projects：创建项目（创建者自动成为 owner）；若带原始素材则自动生成一张 idea 阶段卡片。"""
    pid = str(uuid.uuid4())[:8]
    now = _now()
    username = getattr(request.state, "username", "owner")
    user = getattr(request.state, "user", {}) or {}
    display_name = user.get("displayName", username) if isinstance(user, dict) else username
    proj = ProductionProject(
        project_id=pid,
        name=req.name,
        description=req.description,
        source_type=req.source_type,
        source_content=req.source_content,
        employee_key=req.employee_key,
        team_code=req.team_code,
        episode_count=req.episode_count,
        episode_duration_seconds=req.episode_duration_seconds,
        aspect_ratio=req.aspect_ratio,
        visual_style=req.visual_style,
        budget=req.budget,
        production_goal=req.production_goal,
        pinned=req.pinned,
        members=[ProjectMember(user_id=username, name=display_name, role="owner", added_at=now)],
        created_at=now,
        updated_at=now,
    )
    with _project_lock(pid):
        _save_project(proj)
        if req.source_content.strip():
            card = ProductionCard(
                card_id=str(uuid.uuid4())[:8],
                project_id=pid,
                stage="idea",
                title="原始素材",
                content=req.source_content,
                status="done",
                created_at=now,
                updated_at=now,
            )
            _save_cards(pid, [card])

    return {"code": 200, "data": proj.model_dump()}


@router.get("/projects/{pid}")
def get_project(pid: str):
    """GET /projects/{pid}：返回项目详情 + 全部卡片 + 进度统计；老数据无成员时自动补 owner。"""
    with _project_lock(pid):
        proj = _load_project(pid)
        if not proj.members:
            proj.members = [ProjectMember(user_id="owner", name="创建者", role="owner", added_at=proj.created_at)]
            _save_project(proj)
        cards = _load_cards(pid)
        stats = _compute_stats(cards)
        stage_defs = GC_STAGES if proj.source_type == "gc" else STAGES
        result = ProjectWithCards(**proj.model_dump(), cards=cards, stages=stage_defs, stats=stats)
    return {"code": 200, "data": result.model_dump()}


class UpdateProjectReq(BaseModel):
    """PUT /projects/{pid} 的请求体：全部字段可选，只更新传入的字段。"""
    name: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None
    source_content: Optional[str] = None
    employee_key: Optional[str] = None
    team_code: Optional[str] = None
    episode_count: Optional[int] = Field(default=None, ge=0, le=500)
    episode_duration_seconds: Optional[int] = Field(default=None, ge=5, le=3600)
    aspect_ratio: Optional[str] = None
    visual_style: Optional[str] = None
    budget: Optional[float] = Field(default=None, ge=0)
    production_goal: Optional[ProductionGoal] = Field(
        default=None,
        validation_alias=AliasChoices("production_goal", "productionGoal"),
    )
    pinned: Optional[bool] = None
    settings: Optional[dict] = None


@router.put("/projects/{pid}")
def update_project(pid: str, req: UpdateProjectReq):
    """PUT /projects/{pid}：按传入字段部分更新项目信息（settings 为合并而非覆盖）。"""
    with _project_lock(pid):
        proj = _load_project(pid)
        if req.name is not None:
            proj.name = req.name
        if req.description is not None:
            proj.description = req.description
        if req.source_type is not None:
            proj.source_type = req.source_type
        if req.source_content is not None:
            proj.source_content = req.source_content
        if req.employee_key is not None:
            proj.employee_key = req.employee_key
        if req.team_code is not None:
            proj.team_code = req.team_code
        if req.episode_count is not None:
            proj.episode_count = req.episode_count
        if req.episode_duration_seconds is not None:
            proj.episode_duration_seconds = req.episode_duration_seconds
        if req.aspect_ratio is not None:
            proj.aspect_ratio = req.aspect_ratio
        if req.visual_style is not None:
            proj.visual_style = req.visual_style
        if req.budget is not None:
            proj.budget = req.budget
        if req.production_goal is not None:
            proj.production_goal = req.production_goal
        if req.pinned is not None:
            proj.pinned = req.pinned
        if req.settings is not None:
            proj.settings.update(req.settings)
        proj.updated_at = _now()
        _save_project(proj)
    return {"code": 200, "data": proj.model_dump()}


@router.delete("/projects/{pid}")
def delete_project(pid: str):
    """DELETE /projects/{pid}：删除项目整个数据目录（含卡片与上传文件），幂等操作。"""
    import shutil
    with _project_lock(pid):
        d = _proj_dir(pid)
        if d.exists():
            shutil.rmtree(d)
    return {"code": 200, "data": "ok"}


# ── Project Versions ─────────────────────────────────────────────

class CreateVersionReq(BaseModel):
    """手动版本请求；标签和原因均可省略。"""
    label: str = Field(default="", max_length=120)
    reason: str = Field(default="", max_length=200)


@router.get("/projects/{pid}/versions")
def list_project_versions(pid: str):
    """列出项目版本元数据，按创建时间倒序，不回传大体积卡片正文。"""
    with _project_lock(pid):
        _load_project(pid)
        versions = [_version_metadata(item) for item in _read_version_files(pid)]
    return {"code": 200, "data": versions}


@router.post("/projects/{pid}/versions")
def create_project_version(pid: str, req: CreateVersionReq | None = None):
    """手动创建一个永不覆盖的项目版本；即使内容相同也保留用户明确打点。"""
    body = req or CreateVersionReq()
    version = _create_project_snapshot(
        pid,
        label=body.label or "手动版本",
        reason=body.reason or "manual",
        description="用户手动保存的项目版本",
        force=True,
    )
    return {"code": 200, "data": version}


@router.post("/projects/{pid}/versions/{version_id}/restore")
def restore_project_version(pid: str, version_id: str):
    """恢复指定版本；覆盖当前内容前强制保存 before_restore 快照。"""
    with _project_lock(pid):
        current_project = _load_project(pid)
        current_cards = _load_cards(pid)
        payload = _load_version(pid, version_id)
        try:
            restored_project = ProductionProject.model_validate(payload.get("project"))
            restored_cards = [
                ProductionCard.model_validate(item)
                for item in (payload.get("cards") or [])
            ]
        except Exception as exc:
            raise HTTPException(500, "版本内容损坏，无法恢复") from exc
        if restored_project.project_id != pid or any(
            card.project_id != pid for card in restored_cards
        ):
            raise HTTPException(400, "版本不属于当前项目")

        before_restore = _create_project_snapshot(
            pid,
            label=f"恢复 {payload.get('label') or version_id} 前",
            reason="before_restore",
            description=f"恢复版本 {version_id} 前的自动保护点",
            force=True,
        )
        restored_project.updated_at = _now()
        try:
            _save_project(restored_project)
            _save_cards(pid, restored_cards)
        except Exception as exc:
            # 两份主数据必须一起恢复；回滚绕过可被测试/插件替换的保存函数，
            # 确保第二次写失败也不会留下“旧卡片 + 新项目”的混合状态。
            _write_json_atomic(
                _proj_dir(pid) / "project.json",
                current_project.model_dump(),
            )
            _write_json_atomic(
                _proj_dir(pid) / "cards.json",
                [card.model_dump() for card in current_cards],
            )
            raise HTTPException(500, "版本恢复失败，当前项目已回滚") from exc
        logger.info(
            "项目版本已恢复 pid=%s target=%s before=%s",
            pid,
            version_id,
            (before_restore or {}).get("version_id"),
        )
    return {
        "code": 200,
        "data": {
            "restored_version_id": version_id,
            "before_restore_version_id": (before_restore or {}).get("version_id"),
            "project": restored_project.model_dump(),
            "card_count": len(restored_cards),
            "previous_updated_at": current_project.updated_at,
        },
    }


def _safe_export_filename(value: str) -> str:
    """把用户可编辑的项目名收敛成安全下载文件名。"""
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", value).strip(" .")
    return (cleaned or "project")[:80]


def _add_export_tree(
    archive: zipfile.ZipFile,
    root: Path,
    archive_prefix: str,
) -> None:
    """安全地把目录内普通文件加入 ZIP，跳过符号链接与越界解析路径。"""
    if not root.is_dir():
        return
    resolved_root = root.resolve()
    for path in root.rglob("*"):
        if not path.is_file() or path.is_symlink():
            continue
        resolved = path.resolve()
        try:
            relative = resolved.relative_to(resolved_root)
        except ValueError:
            logger.warning("导出时跳过越界文件: %s", path)
            continue
        safe_parts = [
            re.sub(r"[/\\\x00-\x1f]", "_", part)
            for part in relative.parts
            if part not in ("", ".", "..")
        ]
        if not safe_parts:
            continue
        archive.write(
            resolved,
            arcname="/".join([archive_prefix.strip("/"), *safe_parts]),
        )


@router.post("/projects/{pid}/export")
def export_project(pid: str):
    """导出项目 JSON、批注、版本与本地媒体为可迁移 ZIP 包。"""
    fd, temp_name = tempfile.mkstemp(prefix="agent-project-", suffix=".zip")
    os.close(fd)
    temp_path = Path(temp_name)
    try:
        with _project_lock(pid):
            project = _load_project(pid)
            cards = _load_cards(pid)
            comments = _load_comments(pid)
            project_dir = _proj_dir(pid)
            with zipfile.ZipFile(
                temp_path,
                mode="w",
                compression=zipfile.ZIP_DEFLATED,
                allowZip64=True,
            ) as archive:
                archive.writestr(
                    "project.json",
                    json.dumps(project.model_dump(), ensure_ascii=False, indent=2),
                )
                archive.writestr(
                    "cards.json",
                    json.dumps(
                        [card.model_dump() for card in cards],
                        ensure_ascii=False,
                        indent=2,
                    ),
                )
                archive.writestr(
                    "comments.json",
                    json.dumps(comments, ensure_ascii=False, indent=2),
                )
                _add_export_tree(archive, _versions_dir(pid), "versions")
                _add_export_tree(archive, project_dir / "uploads", "uploads")
                _add_export_tree(
                    archive,
                    BASE_DIR / "data" / "uploads" / "production" / pid,
                    "uploads/generated",
                )
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise

    filename = f"{_safe_export_filename(project.name)}-{pid}.zip"
    return FileResponse(
        temp_path,
        media_type="application/zip",
        filename=filename,
        background=BackgroundTask(temp_path.unlink, missing_ok=True),
    )


# ── Project Members ──────────────────────────────────────────────

class AddMemberReq(BaseModel):
    """POST /projects/{pid}/members 的请求体：新成员的名称与角色（user_id 缺省则自动生成）。"""
    user_id: str = ""
    name: str
    role: str = "editor"
    avatar: str = ""


@router.post("/projects/{pid}/members")
def add_member(pid: str, req: AddMemberReq):
    """POST /projects/{pid}/members：添加项目成员；角色非法或重名返 400。"""
    if req.role not in ROLES:
        raise HTTPException(400, f"无效角色: {req.role}，可选: {', '.join(ROLES)}")
    with _project_lock(pid):
        proj = _load_project(pid)
        for m in proj.members:
            if m.name == req.name:
                raise HTTPException(400, f"成员 {req.name} 已存在")
        member = ProjectMember(
            user_id=req.user_id or str(uuid.uuid4())[:8],
            name=req.name,
            role=req.role,
            avatar=req.avatar,
            added_at=_now(),
        )
        proj.members.append(member)
        proj.updated_at = _now()
        _save_project(proj)
    return {"code": 200, "data": member.model_dump()}


class UpdateMemberReq(BaseModel):
    """PUT /projects/{pid}/members/{user_id} 的请求体：成员的新角色。"""
    role: str


@router.put("/projects/{pid}/members/{user_id}")
def update_member_role(pid: str, user_id: str, req: UpdateMemberReq):
    """PUT /projects/{pid}/members/{user_id}：修改成员角色；不允许把最后一个 owner 降级（返 400），成员不存在返 404。"""
    if req.role not in ROLES:
        raise HTTPException(400, f"无效角色: {req.role}")
    with _project_lock(pid):
        proj = _load_project(pid)
        for m in proj.members:
            if m.user_id == user_id:
                if m.role == "owner" and req.role != "owner":
                    owners = [mm for mm in proj.members if mm.role == "owner"]
                    if len(owners) <= 1:
                        raise HTTPException(400, "项目至少需要一个 owner")
                m.role = req.role
                proj.updated_at = _now()
                _save_project(proj)
                return {"code": 200, "data": m.model_dump()}
    raise HTTPException(404, "成员不存在")


@router.delete("/projects/{pid}/members/{user_id}")
def remove_member(pid: str, user_id: str):
    """DELETE /projects/{pid}/members/{user_id}：移除项目成员；不允许移除最后一个 owner（返 400），成员不存在返 404。"""
    with _project_lock(pid):
        proj = _load_project(pid)
        member = next((m for m in proj.members if m.user_id == user_id), None)
        if not member:
            raise HTTPException(404, "成员不存在")
        if member.role == "owner":
            owners = [m for m in proj.members if m.role == "owner"]
            if len(owners) <= 1:
                raise HTTPException(400, "不能移除最后一个 owner")
        proj.members = [m for m in proj.members if m.user_id != user_id]
        proj.updated_at = _now()
        _save_project(proj)
    return {"code": 200, "data": "ok"}


# ── Cards ─────────────────────────────────────────────────────────

class CreateCardReq(BaseModel):
    """POST /projects/{pid}/cards 的请求体：新建卡片的阶段、标题内容、集数/G 单元号及提示词/素材列表。"""
    stage: str = "idea"
    title: str = ""
    content: str = ""
    episode: Optional[int] = None
    shot_number: int = 0
    prompts: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    status: str = "pending"
    assignee: str = ""


@router.post("/projects/{pid}/cards")
def add_card(pid: str, req: CreateCardReq):
    """POST /projects/{pid}/cards：在项目下新建一张生产卡片；项目不存在返 404。"""
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        now = _now()
        card = ProductionCard(
            card_id=str(uuid.uuid4())[:8],
            project_id=pid,
            stage=req.stage,
            title=req.title,
            content=req.content,
            episode=req.episode,
            shot_number=req.shot_number,
            prompts=req.prompts,
            images=req.images,
            videos=req.videos,
            metadata=req.metadata,
            status=req.status,
            assignee=req.assignee,
            created_at=now,
            updated_at=now,
        )
        cards.append(card)
        _save_cards(pid, cards)
    return {"code": 200, "data": card.model_dump()}


class UpdateCardReq(BaseModel):
    """PUT /cards/{card_id} 的请求体：全部字段可选，仅更新显式传入的字段。"""
    stage: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    episode: Optional[int] = None
    shot_number: Optional[int] = None
    prompts: Optional[list[str]] = None
    negative_prompts: Optional[list[str]] = None
    images: Optional[list[str]] = None
    videos: Optional[list[str]] = None
    metadata: Optional[dict] = None
    status: Optional[str] = None
    assignee: Optional[str] = None


@router.put("/cards/{card_id}")
def update_card(card_id: str, req: UpdateCardReq):
    """PUT /cards/{card_id}：跨全部项目按 card_id 定位并部分更新卡片（以 model_fields_set 判断哪些字段被显式传入）；不存在返 404。"""
    provided = req.model_fields_set
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            for c in cards:
                if c.card_id != card_id:
                    continue
                versioned_changes = []
                if (
                    "content" in provided
                    and req.content is not None
                    and req.content != c.content
                ):
                    versioned_changes.append("content")
                if (
                    "prompts" in provided
                    and (req.prompts or []) != c.prompts
                ):
                    versioned_changes.append("prompts")
                if (
                    "shot_number" in provided
                    and req.shot_number is not None
                    and req.shot_number != c.shot_number
                ):
                    versioned_changes.append("shot_number")
                if versioned_changes:
                    _create_project_snapshot(
                        d.name,
                        label=f"修改卡片「{c.title or c.card_id}」前",
                        reason="card_update",
                        description=(
                            f"卡片 {c.card_id} 即将修改字段："
                            + "、".join(versioned_changes)
                        ),
                    )
                if "stage" in provided and req.stage is not None:
                    c.stage = req.stage
                if "title" in provided and req.title is not None:
                    c.title = req.title
                if "content" in provided and req.content is not None:
                    c.content = req.content
                if "episode" in provided:
                    c.episode = req.episode
                if "shot_number" in provided and req.shot_number is not None:
                    c.shot_number = req.shot_number
                if "prompts" in provided:
                    c.prompts = req.prompts or []
                if "negative_prompts" in provided:
                    c.negative_prompts = req.negative_prompts or []
                if "images" in provided:
                    c.images = req.images or []
                if "videos" in provided:
                    c.videos = req.videos or []
                if "metadata" in provided:
                    next_metadata = req.metadata or {}
                    previous_active = str(c.metadata.get("active_image") or "")
                    next_active = str(next_metadata.get("active_image") or "")
                    if next_active and next_active != previous_active:
                        raise HTTPException(
                            409,
                            "切换当前图片必须使用候选采用操作，并先完成质量验收",
                        )
                    c.metadata = next_metadata
                if "status" in provided and req.status is not None:
                    c.status = req.status
                if "assignee" in provided:
                    c.assignee = req.assignee or ""
                c.updated_at = _now()
                _save_cards(d.name, cards)
                return {"code": 200, "data": c.model_dump()}
    raise HTTPException(404, "卡片不存在")


@router.delete("/cards/{card_id}")
def delete_card(card_id: str):
    """DELETE /cards/{card_id}：跨全部项目定位并删除卡片；不存在返 404。"""
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            new_cards = [c for c in cards if c.card_id != card_id]
            if len(new_cards) < len(cards):
                _save_cards(d.name, new_cards)
                return {"code": 200, "data": "ok"}
    raise HTTPException(404, "卡片不存在")


# ── Card Comments ────────────────────────────────────────────────

class CreateCommentReq(BaseModel):
    """新建卡片批注请求。"""
    content: str = Field(max_length=4000)


class UpdateCommentReq(BaseModel):
    """批注解决状态请求。"""
    resolved: bool


@router.get("/projects/{pid}/comments")
def list_project_comments(
    pid: str,
    card_id: str | None = Query(default=None),
    include_resolved: bool = Query(default=False),
):
    """列出项目批注，可按卡片过滤；默认隐藏已解决项。"""
    with _project_lock(pid):
        _load_project(pid)
        if card_id is not None:
            cards = _load_cards(pid)
            if not any(card.card_id == card_id for card in cards):
                raise HTTPException(404, f"卡片 {card_id} 不存在")
        comments = _load_comments(pid)
        if card_id is not None:
            comments = [item for item in comments if item.get("card_id") == card_id]
        if not include_resolved:
            comments = [item for item in comments if not item.get("resolved", False)]
    return {
        "code": 200,
        "data": sorted(comments, key=lambda item: item.get("created_at", "")),
    }


@router.post("/projects/{pid}/cards/{card_id}/comments")
def create_card_comment(
    pid: str,
    card_id: str,
    req: CreateCommentReq,
    request: Request,
):
    """在项目内给指定卡片添加批注，作者取当前鉴权账号。"""
    content = req.content.strip()
    if not content:
        raise HTTPException(400, "批注内容不能为空")
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        if not any(card.card_id == card_id for card in cards):
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        now = _now()
        comment = {
            "id": uuid.uuid4().hex[:12],
            "project_id": pid,
            "card_id": card_id,
            "content": content,
            "author": getattr(request.state, "username", "unknown"),
            "created_at": now,
            "updated_at": now,
            "resolved": False,
            "resolved_at": None,
        }
        comments = _load_comments(pid)
        comments.append(comment)
        _save_comments(pid, comments)
    return {"code": 200, "data": comment}


@router.patch("/projects/{pid}/comments/{comment_id}")
def update_project_comment(pid: str, comment_id: str, req: UpdateCommentReq):
    """在当前项目内解决或重新打开一条批注。"""
    with _project_lock(pid):
        _load_project(pid)
        comments = _load_comments(pid)
        comment = next((item for item in comments if item.get("id") == comment_id), None)
        if comment is None:
            raise HTTPException(404, "批注不存在")
        if bool(comment.get("resolved", False)) != req.resolved:
            now = _now()
            comment["resolved"] = req.resolved
            comment["resolved_at"] = now if req.resolved else None
            comment["updated_at"] = now
            _save_comments(pid, comments)
    return {"code": 200, "data": comment}


class BatchCreateCardReq(BaseModel):
    """POST /projects/{pid}/cards/batch 的请求体：批量新建的卡片列表。"""
    cards: list[CreateCardReq]


@router.post("/projects/{pid}/cards/batch")
def batch_add_cards(pid: str, req: BatchCreateCardReq):
    """POST /projects/{pid}/cards/batch：一次写入多张卡片并返回新建结果；项目不存在返 404。"""
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        now = _now()
        new_cards = []
        for item in req.cards:
            card = ProductionCard(
                card_id=str(uuid.uuid4())[:8],
                project_id=pid,
                stage=item.stage,
                title=item.title,
                content=item.content,
                episode=item.episode,
                shot_number=item.shot_number,
                prompts=item.prompts,
                images=item.images,
                videos=item.videos,
                metadata=item.metadata,
                status=item.status,
                assignee=item.assignee,
                created_at=now,
                updated_at=now,
            )
            new_cards.append(card)
            cards.append(card)
        _save_cards(pid, cards)
    return {"code": 200, "data": [c.model_dump() for c in new_cards]}


class BatchMoveReq(BaseModel):
    """POST /cards/batch-move 的请求体：要移动的卡片 ID 列表与目标阶段。"""
    card_ids: list[str]
    stage: str


@router.post("/cards/batch-move")
def batch_move_cards(req: BatchMoveReq):
    """POST /cards/batch-move：跨项目批量把卡片移到目标阶段，返回实际移动的 ID 列表；阶段非法返 400。"""
    if req.stage not in STAGE_KEYS:
        raise HTTPException(400, f"无效阶段: {req.stage}")
    moved = []
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            changed = False
            for c in cards:
                if c.card_id in req.card_ids:
                    c.stage = req.stage
                    c.updated_at = _now()
                    moved.append(c.card_id)
                    changed = True
            if changed:
                _save_cards(d.name, cards)
    return {"code": 200, "data": {"moved": moved}}


class BatchDeleteReq(BaseModel):
    """POST /cards/batch-delete 的请求体：要删除的卡片 ID 列表。"""
    card_ids: list[str]


@router.post("/cards/batch-delete")
def batch_delete_cards(req: BatchDeleteReq):
    """POST /cards/batch-delete：跨项目批量删除卡片，返回实际删除的 ID 列表（不存在的 ID 静默跳过）。"""
    deleted = []
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            new_cards = [c for c in cards if c.card_id not in req.card_ids]
            if len(new_cards) < len(cards):
                removed = [c.card_id for c in cards if c.card_id in req.card_ids]
                deleted.extend(removed)
                _save_cards(d.name, new_cards)
    return {"code": 200, "data": {"deleted": deleted}}


class BatchUpdateStatusReq(BaseModel):
    """POST /cards/batch-status 的请求体：要更新的卡片 ID 列表与目标状态。"""
    card_ids: list[str]
    status: str


@router.post("/cards/batch-status")
def batch_update_status(req: BatchUpdateStatusReq):
    """POST /cards/batch-status：跨项目批量更新卡片状态，返回实际更新的 ID 列表。"""
    updated = []
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            changed = False
            for c in cards:
                if c.card_id in req.card_ids:
                    c.status = req.status
                    c.updated_at = _now()
                    updated.append(c.card_id)
                    changed = True
            if changed:
                _save_cards(d.name, cards)
    return {"code": 200, "data": {"updated": updated}}


@router.post("/projects/{pid}/cards/{card_id}/upload")
async def upload_card_file(pid: str, card_id: str, file: UploadFile = File(...), file_type: str = "image"):
    """POST /projects/{pid}/cards/{card_id}/upload：上传图片/视频到卡片，按 file_type 追加到 images 或 videos 列表；卡片不存在返 404。"""
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        if not any(card.card_id == card_id for card in cards):
            raise HTTPException(404, "卡片不存在")
    ext = Path(file.filename or "file").suffix or (".png" if file_type == "image" else ".mp4")
    filename = f"{card_id}_{uuid.uuid4().hex[:6]}{ext}"
    content = await file.read()
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        card = next((item for item in cards if item.card_id == card_id), None)
        if not card:
            raise HTTPException(404, "卡片不存在")
        upload_dir = _proj_dir(pid) / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / filename
        file_path.write_bytes(content)
        url = f"/api/v1/agentapp/production/resource/production/{pid}/uploads/{filename}"
        if file_type == "video":
            card.videos.append(url)
        else:
            card.images.append(url)
        card.updated_at = _now()
        _save_cards(pid, cards)
    return {"code": 200, "data": {"url": url, "card": card.model_dump()}}


# ── 回填收件箱：外部生成的图/视频按文件名批量分拣挂卡 ─────────────
# 出口是「导出提示词」，这里是对称的入口——小云雀/即梦生成的一批文件
# 拖进来按文件名规则自动挂到对应卡，识别不了的原样返回原因。


@router.post("/projects/{pid}/inbox/upload")
async def inbox_upload(
    pid: str,
    files: list[UploadFile] = File(...),
    default_episode: Optional[int] = Query(None, description="文件名缺集数时的默认集"),
):
    """POST …/inbox/upload：批量收文件并按文件名规则分拣挂卡。

    命名约定见 app/services/inbox_ingest.py 模块 docstring。
    返回 matched（挂到哪张卡）与 unmatched（为什么没挂上），全部文件都会有下落。
    图片挂上后自动设为该卡当前版本（active_image）——刚生成的就是想用的。
    """
    with _project_lock(pid):
        _load_project(pid)
    unmatched = []
    pending_files: list[dict] = []
    for f in files:
        name = f.filename or ""
        parsed = parse_inbox_filename(name, default_episode)
        if not parsed.get("ok"):
            unmatched.append({"filename": name, "reason": parsed.get("reason", "无法解析")})
            continue
        max_bytes = INBOX_MAX_FILE_BYTES
        chunks: list[bytes] = []
        total = 0
        while True:
            chunk = await f.read(1024 * 256)
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                unmatched.append({"filename": name, "reason": f"超过 {max_bytes // (1024*1024)}MB 上限"})
                break
            chunks.append(chunk)
        if total > max_bytes or total == 0:
            if total == 0:
                unmatched.append({"filename": name, "reason": "空文件"})
            continue
        pending_files.append({
            "filename": name,
            "parsed": parsed,
            "data": b"".join(chunks),
        })

    matched = []
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        upload_dir = _proj_dir(pid) / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        dirty = False
        for pending in pending_files:
            name = pending["filename"]
            parsed = pending["parsed"]
            card, slot, reason = resolve_inbox_target(cards, parsed)
            if card is None:
                unmatched.append({"filename": name, "reason": reason})
                continue
            fname = f"{card.card_id}_{uuid.uuid4().hex[:6]}{parsed['ext']}"
            (upload_dir / fname).write_bytes(pending["data"])
            url = f"/api/v1/agentapp/production/resource/production/{pid}/uploads/{fname}"
            if slot == "videos":
                card.videos.append(url)
            else:
                card.images.append(url)
                card.metadata = {**card.metadata, "active_image": url}
            card.updated_at = _now()
            dirty = True
            matched.append({
                "filename": name,
                "card_id": card.card_id,
                "card_title": card.title,
                "stage": card.stage,
                "slot": slot,
                "url": url,
            })
        if dirty:
            _save_cards(pid, cards)
    return {"code": 200, "data": {"matched": matched, "unmatched": unmatched}}


# ── 两键评审：通过/废弃 + 废弃原因统计 ───────────────────────────
# 背景：卡片 status=done 主要表示"生成完成"，不是独立的验收历史。
# 失败原因不落数据 → 重生成不带修正 → 同一毛病反复返工。评审记录让废图有出口。

REVIEW_REJECT_REASONS = {
    "tone_off": "基调偏差",
    "character_drift": "角色走形",
    "composition_mismatch": "构图不符分镜",
    "lighting_wrong": "光影错误",
    "anatomy_broken": "结构崩坏",
    "scene_drift": "场景漂移",
    "style_drift": "画风漂移",
    "continuity_break": "前后镜不连续",
    "text_artifact": "文字或符号错误",
    "other": "其他",
}


def _project_image_path_from_url(pid: str, image: str) -> Path | None:
    """把本项目 resource URL 安全解析为本地文件；外部 URL 返回 None。"""
    marker = f"/resource/production/{pid}/"
    if marker not in image:
        return None
    relative = image.split(marker, 1)[1].split("?", 1)[0]
    project_root = _proj_dir(pid).resolve()
    candidate = (project_root / relative).resolve()
    try:
        candidate.relative_to(project_root)
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


def _file_sha256(path: Path | None) -> str:
    if path is None:
        return ""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _card_review_spec_fingerprint(card: ProductionCard) -> str:
    """绑定当前生成规格；媒体清单提供的指纹优先于通用卡片摘要。"""
    generation_fingerprint = str(
        card.metadata.get("generation_spec_fingerprint") or ""
    )
    if generation_fingerprint:
        return generation_fingerprint
    runtime_keys = {
        "active_image",
        "image_reviews",
        "review_verdict",
        "reviewed_at",
        "reviewed_by",
        "media_status",
        "generated_segments",
        "episode_media_status",
    }
    metadata = {
        key: value
        for key, value in card.metadata.items()
        if key not in runtime_keys
    }
    payload = {
        "stage": card.stage,
        "episode": card.episode,
        "shot_number": card.shot_number,
        "title": card.title,
        "content": card.content,
        "prompts": card.prompts,
        "negative_prompts": card.negative_prompts,
        "metadata": metadata,
    }
    encoded = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


class ReviewCardImageReq(BaseModel):
    """POST /projects/{pid}/cards/{card_id}/review 的请求体。

    verdict=reject 时 reason 必填且必须在 REVIEW_REJECT_REASONS 枚举内。
    image 省略时默认评审卡片当前版本（metadata.active_image 或 images[0]）。
    """
    verdict: str
    image: str = ""
    reason: str = ""
    note: str = ""
    ratings: dict[str, int] = Field(default_factory=dict)
    promote: bool = True


class ActivateImageCandidateReq(BaseModel):
    """把已经通过人工验收的历史候选设为当前生产版本。"""
    image: str


@router.get("/quality-profile")
def get_quality_profile():
    """返回精品图片验收量表；前端不得自行复制阈值。"""
    return {"code": 200, "data": {
        "profile": "precision",
        "image": visual_quality_profile(),
        "reject_reasons": [
            {"key": key, "name": name}
            for key, name in REVIEW_REJECT_REASONS.items()
        ],
    }}


@router.post("/projects/{pid}/cards/{card_id}/review")
def review_card_image(pid: str, card_id: str, req: ReviewCardImageReq):
    """POST …/review：对卡片某张图记一次人工评审（pass/reject），追加进 metadata.image_reviews。

    reject 必须携带枚举内 reason，否则 400——不允许"不满意但说不出哪不满意"进入数据。
    """
    if req.verdict not in ("pass", "reject"):
        raise HTTPException(400, "verdict 必须是 pass 或 reject")
    if req.verdict == "reject" and req.reason not in REVIEW_REJECT_REASONS:
        raise HTTPException(400, f"废弃必须选择原因，可选: {list(REVIEW_REJECT_REASONS)}")
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        card = next((c for c in cards if c.card_id == card_id), None)
        if not card:
            raise HTTPException(404, "卡片不存在")
        current_image = (
            str(card.metadata.get("active_image") or "")
            if "active_image" in card.metadata
            else (str(card.images[-1]) if card.images else "")
        )
        if not current_image:
            raise HTTPException(400, "卡片没有可评审的图片")
        image = req.image.strip() or current_image
        known_images = {str(item) for item in card.images}
        if image != current_image and image not in known_images:
            raise HTTPException(409, "候选图片已变化，请刷新后重新评审")
        known_candidates = {
            str(item.get("image") or "")
            for item in (card.metadata.get("image_candidates") or [])
        }
        if image != current_image and image not in known_candidates:
            raise HTTPException(409, "历史图片不能重新评审；请先生成或登记为质量候选")
        requires_precision = image_requires_precision_review(card.metadata, image)
        if req.verdict == "pass" and requires_precision and not req.ratings:
            raise HTTPException(400, "新生成候选必须完成五维精品评分后才能通过")
        quality: dict[str, Any] = {}
        if req.ratings:
            try:
                quality = evaluate_visual_quality(req.ratings)
            except ValueError as exc:
                raise HTTPException(400, str(exc)) from exc
            if req.verdict == "pass" and not quality["passed"]:
                raise HTTPException(400, f"{quality['summary']} 请退回并说明主要问题。")
        image_path = _project_image_path_from_url(pid, image)
        reviews = list(card.metadata.get("image_reviews") or [])
        review_id = uuid.uuid4().hex[:12]
        review_record = {
            "id": review_id,
            "image": image,
            "file_sha256": _file_sha256(image_path),
            "spec_fingerprint": _card_review_spec_fingerprint(card),
            "verdict": req.verdict,
            "reason": req.reason if req.verdict == "reject" else "",
            "note": req.note,
            "time": _now(),
        }
        if quality:
            review_record["quality"] = quality
        reviews.append(review_record)

        candidate_records = list(card.metadata.get("image_candidates") or [])
        candidate = next(
            (item for item in candidate_records if str(item.get("image") or "") == image),
            None,
        )
        if candidate is None:
            candidate = {"image": image}
            candidate_records.append(candidate)
        candidate.update({
            "latest_review_id": review_id,
            "verdict": req.verdict,
            "quality_score": quality.get("score"),
            "reviewed_at": review_record["time"],
        })

        promoted = req.verdict == "pass" and (req.promote or image == current_image)
        active_image = image if promoted else current_image
        active_reviews = [
            item
            for item in reviews
            if str(item.get("image") or "") == active_image
        ]
        active_verdict = (
            str(active_reviews[-1].get("verdict") or "")
            if active_reviews
            else ""
        )
        card.metadata = {
            **card.metadata,
            "active_image": active_image,
            "image_reviews": reviews,
            "image_candidates": candidate_records,
            "review_verdict": active_verdict,
        }
        # 只有当前采用版本的结论影响生产状态；评审未采用候选不能打断现有镜头。
        if active_verdict == "pass":
            card.status = "done"
        elif active_verdict == "reject":
            card.status = "review"
        card.updated_at = _now()
        _save_cards(pid, cards)
    return {"code": 200, "data": card.model_dump()}


@router.post("/projects/{pid}/cards/{card_id}/image-candidates/activate")
def activate_image_candidate(
    pid: str,
    card_id: str,
    req: ActivateImageCandidateReq,
):
    """采用一个已通过验收的图片候选；切换会让绑定旧图的视频自然变为过期。"""
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, "卡片不存在")
        image = req.image.strip()
        if not image or image not in {str(item) for item in card.images}:
            raise HTTPException(400, "候选图片不存在")
        reviews = [
            item
            for item in (card.metadata.get("image_reviews") or [])
            if str(item.get("image") or "") == image
        ]
        if not reviews or reviews[-1].get("verdict") != "pass":
            raise HTTPException(409, "候选图片必须先通过人工验收才能采用")
        if image_requires_precision_review(card.metadata, image):
            quality = reviews[-1].get("quality") or {}
            if quality.get("passed") is not True:
                raise HTTPException(409, "新生成候选必须达到精品评分门槛才能采用")
        card.metadata = {
            **card.metadata,
            "active_image": image,
            "review_verdict": "pass",
            "active_image_changed_at": _now(),
        }
        card.status = "done"
        card.updated_at = _now()
        _save_cards(pid, cards)
    return {"code": 200, "data": card.model_dump()}


@router.get("/projects/{pid}/review-stats")
def get_review_stats(pid: str):
    """GET …/review-stats：聚合项目内全部图片评审，返回废弃原因分布（含中文名）与按集统计。

    这是"卡在图片关过不去"的诊断面板数据源：哪个原因占大头，就先修哪个。
    """
    _load_project(pid)
    cards = _load_cards(pid)
    total = passed = rejected = 0
    reasons: dict[str, int] = {}
    by_episode: dict[str, dict] = {}
    for c in cards:
        for r in c.metadata.get("image_reviews") or []:
            total += 1
            ep = str(c.episode) if c.episode is not None else "全局"
            slot = by_episode.setdefault(ep, {"passed": 0, "rejected": 0})
            if r.get("verdict") == "pass":
                passed += 1
                slot["passed"] += 1
            else:
                rejected += 1
                slot["rejected"] += 1
                key = r.get("reason") or "other"
                reasons[key] = reasons.get(key, 0) + 1
    return {"code": 200, "data": {
        "total": total,
        "passed": passed,
        "rejected": rejected,
        "reject_reasons": [
            {"key": k, "name": REVIEW_REJECT_REASONS.get(k, k), "count": v}
            for k, v in sorted(reasons.items(), key=lambda kv: -kv[1])
        ],
        "by_episode": by_episode,
    }}


@router.post("/cards/{card_id}/move")
def move_card(card_id: str, stage: str = "idea"):
    """POST /cards/{card_id}/move：把单张卡片移到指定阶段；阶段非法返 400，卡片不存在返 404。"""
    if stage not in STAGE_KEYS:
        raise HTTPException(400, f"无效阶段: {stage}")
    for d in DATA_DIR.iterdir():
        with _project_lock(d.name):
            cards_file = d / "cards.json"
            if not cards_file.exists():
                continue
            cards = _load_cards(d.name)
            for c in cards:
                if c.card_id == card_id:
                    c.stage = stage
                    c.updated_at = _now()
                    _save_cards(d.name, cards)
                    return {"code": 200, "data": c.model_dump()}
    raise HTTPException(404, "卡片不存在")


# ── Search ───────────────────────────────────────────────────────

@router.get("/projects/{pid}/search")
def search_cards(
    pid: str,
    q: str = Query("", description="搜索关键词"),
    stage: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    episode: Optional[int] = Query(None),
    assignee: Optional[str] = Query(None),
):
    """GET /projects/{pid}/search：按关键词（匹配标题/内容/提示词）与阶段/状态/集数/负责人组合过滤卡片。"""
    cards = _load_cards(pid)
    results = []
    for c in cards:
        if stage and c.stage != stage:
            continue
        if status and c.status != status:
            continue
        if episode is not None and c.episode != episode:
            continue
        if assignee and c.assignee != assignee:
            continue
        if q:
            q_lower = q.lower()
            text = f"{c.title} {c.content} {' '.join(c.prompts)}".lower()
            if q_lower not in text:
                continue
        results.append(c.model_dump())
    return {"code": 200, "data": results}


# ── Project Stats ────────────────────────────────────────────────

@router.get("/projects/{pid}/stats")
def get_project_stats(pid: str):
    """GET /projects/{pid}/stats：返回项目进度统计，并按集（EPxx）细分各集进度。"""
    _load_project(pid)
    cards = _load_cards(pid)
    stats = _compute_stats(cards)
    episodes = sorted(set(c.episode for c in cards if c.episode is not None))
    ep_stats = {}
    for ep in episodes:
        ep_cards = [c for c in cards if c.episode == ep]
        ep_stats[f"EP{ep:02d}"] = _compute_stats(ep_cards)
    stats["by_episode"] = ep_stats
    stats["episodes"] = episodes
    return {"code": 200, "data": stats}


# ── AI Generation ─────────────────────────────────────────────────

class GenerateReq(BaseModel):
    """POST /projects/{pid}/generate 的请求体：目标阶段、执行员工（缺省用项目默认）与额外生成要求。

    episode 限定生成范围（None=全局资产）：上下文只取该集卡片 + 全局资产，新卡片落到该集。
    mode 控制落卡方式：append（默认）只追加不动已有卡片；replace 仅删除同阶段**同集数**的旧卡片。
    """
    target_stage: str
    employee_key: str = ""
    extra_instruction: str = ""
    episode: Optional[int] = None
    shot_number: Optional[int] = None
    mode: str = "append"


def _commit_generated_drafts(
    pid: str,
    req: GenerateReq,
    drafts: list[dict],
    target_name: str,
) -> dict:
    """在项目锁内基于最新磁盘状态提交 AI 草稿，避免 await 期间的修改被旧副本覆盖。"""
    with _project_lock(pid):
        proj = _load_project(pid)
        cards = _load_cards(pid)
        now = _now()
        new_cards: list[ProductionCard] = []
        # 替换/续号都只作用于「同阶段 + 同集数」的最新卡片。
        scope_cards = [
            card for card in cards
            if card.stage == req.target_stage
            and card.episode == req.episode
            and (
                req.shot_number is None
                or card.shot_number == req.shot_number
            )
        ]
        replaced = 0
        if req.mode == "replace":
            if scope_cards:
                scope_name = (
                    f"EP{req.episode:02d}"
                    if req.episode is not None
                    else "全局资产"
                )
                if req.shot_number is not None:
                    scope_name += f" / G{req.shot_number}"
                _create_project_snapshot(
                    pid,
                    label=f"替换 {target_name} 前",
                    reason="generate_replace",
                    description=(
                        f"AI 将替换 {scope_name} 的 {target_name}，"
                        f"保护 {len(scope_cards)} 张旧卡片"
                    ),
                )
            scope_ids = {card.card_id for card in scope_cards}
            cards = [card for card in cards if card.card_id not in scope_ids]
            replaced = len(scope_cards)
            next_shot = 0
        else:
            next_shot = max(
                (card.shot_number for card in scope_cards),
                default=0,
            )

        for index, draft in enumerate(drafts):
            title = draft["title"] or f"{target_name} {index + 1}"
            body = draft["content"]
            metadata = dict(draft.get("metadata") or {})
            parsed_unit = _detect_generation_unit(title, metadata)
            if req.shot_number is not None:
                unit_number = req.shot_number
            elif parsed_unit is None and _is_overview_card(title):
                unit_number = 0
            elif parsed_unit is not None:
                unit_number = parsed_unit
                next_shot = max(next_shot, unit_number)
            else:
                next_shot += 1
                unit_number = next_shot

            time_range = metadata.get("time_range") or _detect_time_range(
                f"{title}\n{body}"
            )
            metadata.update({
                "target_stage": req.target_stage,
                "production_grain": (
                    "episode_overview"
                    if unit_number == 0
                    else "generation_unit"
                ),
            })
            if unit_number > 0:
                metadata["unit_number"] = unit_number
            if time_range:
                metadata["time_range"] = time_range

            prompts = [
                str(prompt).strip()
                for prompt in draft.get("prompts", [])
                if str(prompt).strip()
            ]
            negative_prompts = [
                str(prompt).strip()
                for prompt in draft.get("negative_prompts", [])
                if str(prompt).strip()
            ]
            if (
                req.target_stage in ("img_prompt", "vid_prompt")
                and not prompts
                and body
            ):
                prompts = [body]
            quality_issues = evaluate_production_draft(
                req.target_stage,
                title,
                body,
                prompts,
            )
            metadata["quality_gate"] = {
                "passed": not quality_issues,
                "issues": quality_issues,
                "note": "静态门禁通过不等于实际图片/视频视觉验收通过",
            }

            card = ProductionCard(
                card_id=str(uuid.uuid4())[:8],
                project_id=pid,
                stage=req.target_stage,
                title=title,
                content=body,
                episode=req.episode,
                shot_number=unit_number,
                prompts=prompts,
                negative_prompts=negative_prompts,
                metadata=metadata,
                status="done" if not quality_issues else "review",
                created_at=now,
                updated_at=now,
            )
            new_cards.append(card)
            cards.append(card)

        _save_cards(pid, cards)
        proj.updated_at = now
        _save_project(proj)
        return {
            "generated": len(new_cards),
            "replaced": replaced,
            "mode": req.mode,
            "episode": req.episode,
            "shot_number": req.shot_number,
            "stage": req.target_stage,
            "cards": [card.model_dump() for card in new_cards],
            "quality_issue_count": sum(
                len(card.metadata.get("quality_gate", {}).get("issues", []))
                for card in new_cards
            ),
        }


@router.post("/projects/{pid}/generate")
async def generate_stage(pid: str, req: GenerateReq):
    """POST /projects/{pid}/generate：汇总前置阶段内容作为上下文，调用数字员工生成目标阶段卡片。

    生成结果优先按结构化 JSON 解析，失败时按 --- 分段拆卡；G1/G2 标题会落到对应生成单元号。
    按 req.mode 追加或替换（替换只影响同阶段同集数的卡片）。
    阶段/模式非法、无前置内容、无可用员工返 400，AI 失败或空回复返 500。
    """
    proj = _load_project(pid)
    cards = _load_cards(pid)

    is_gc = proj.source_type == "gc"
    stage_keys = GC_STAGE_KEYS if is_gc else STAGE_KEYS
    stage_defs = GC_STAGES if is_gc else STAGES
    instructions_map = GC_STAGE_INSTRUCTIONS if is_gc else STAGE_INSTRUCTIONS

    target_idx = stage_keys.index(req.target_stage) if req.target_stage in stage_keys else -1
    if target_idx < 0:
        raise HTTPException(400, f"无效阶段: {req.target_stage}")
    if req.mode not in ("append", "replace"):
        raise HTTPException(400, f"无效模式: {req.mode}，可选: append / replace")

    prev_cards = [c for c in cards if c.stage in stage_keys and stage_keys.index(c.stage) < target_idx]
    if req.episode is not None:
        prev_cards = [c for c in prev_cards if c.episode == req.episode or c.episode is None]
    if req.shot_number is not None:
        if req.shot_number <= 0:
            raise HTTPException(400, "shot_number 必须大于 0")
        prev_cards = [c for c in prev_cards if c.shot_number in (0, req.shot_number)]
    if not prev_cards and not proj.source_content:
        raise HTTPException(400, "没有前置阶段的内容可供生成")

    context_parts = []
    if proj.source_content:
        context_parts.append(f"## 项目原始素材\n{proj.source_content}")
    # GC 可继承正片项目已经锁定的 Art Bible，避免概念片重新猜人物与画风。
    art_bible_project_id = str((proj.settings or {}).get("art_bible_project_id") or "").strip()
    if is_gc and art_bible_project_id:
        try:
            art_bible_cards = [
                card for card in _load_cards(art_bible_project_id)
                if card.stage in ("setting", "design")
                and (card.images or card.prompts or card.content)
            ]
        except HTTPException:
            art_bible_cards = []
        if art_bible_cards:
            context_parts.append("## 已锁定 Art Bible（必须继承，不得重新设计）")
            for card in art_bible_cards:
                context_parts.append(f"### {card.title}\n{card.content}")
                if card.prompts:
                    context_parts.append("母版提示词:\n" + "\n".join(f"- {item}" for item in card.prompts))
                if card.images:
                    context_parts.append("母版图片:\n" + "\n".join(f"- {item}" for item in card.images))
    for stage_key in stage_keys[:target_idx]:
        stage_cards = sorted([c for c in prev_cards if c.stage == stage_key], key=lambda x: x.shot_number)
        if stage_cards:
            stage_name = next((s["name"] for s in stage_defs if s["key"] == stage_key), stage_key)
            context_parts.append(f"## {stage_name}")
            for sc in stage_cards:
                context_parts.append(f"### {sc.title}\n{sc.content}")
                if sc.prompts:
                    context_parts.append("提示词:\n" + "\n".join(f"- {p}" for p in sc.prompts))

    context = "\n\n".join(context_parts)
    target_name = next((s["name"] for s in stage_defs if s["key"] == req.target_stage), req.target_stage)

    instruction = instructions_map.get(
        req.target_stage,
        STAGE_INSTRUCTIONS.get(req.target_stage, f"根据前面的内容，生成{target_name}阶段的内容。"),
    )
    if req.extra_instruction:
        instruction += f"\n\n额外要求：{req.extra_instruction}"

    emp_key = _select_generation_employee(
        req.target_stage,
        req.employee_key or "",
        proj.employee_key or "",
    )

    if not emp_key:
        raise HTTPException(400, f"没有可执行“{target_name}”阶段的已启用数字员工")

    scope_label = f"EP{req.episode:02d}" if req.episode is not None else "全局资产"
    if req.shot_number is not None:
        scope_label += f" / G{req.shot_number}"
        instruction += (
            f"\n\n本次只返工 G{req.shot_number}，不要生成其他 G 单元；"
            "保持未要求修改的事实、角色和上下游约束不变。"
        )
    project_constraints = (
        f"项目规格：单集目标时长 {proj.episode_duration_seconds} 秒；画幅 {proj.aspect_ratio}；"
        f"视觉风格：{proj.visual_style or '沿用已锁定 Art Bible'}。"
    )
    prompt = f"你正在为项目「{proj.name}」（范围：{scope_label}）生成{target_name}。\n{project_constraints}\n\n{instruction}\n\n以下是已有的内容：\n\n{context}"

    try:
        result = await asyncio.wait_for(
            run_invocation(AgentRunRequest(
                employeeKey=emp_key,
                userInput=prompt,
            )),
            timeout=max(1, int(app_settings.agent.run_timeout_seconds)),
        )
    except TimeoutError as exc:
        raise HTTPException(
            504,
            f"AI 生成超过 {app_settings.agent.run_timeout_seconds} 秒，任务已停止，请重试",
        ) from exc
    if not result.success:
        raise HTTPException(500, result.error_message or "AI 生成失败")
    reply = result.assistant_message

    if not reply:
        raise HTTPException(500, "AI 未返回内容")

    drafts = _sections_from_reply(reply)
    if not drafts:
        raise HTTPException(500, "AI 返回内容无法拆成卡片")

    return {
        "code": 200,
        "data": _commit_generated_drafts(pid, req, drafts, target_name),
    }


class GenerateCardImageReq(BaseModel):
    """单卡立即生图请求：默认读取卡片 prompts[0]，也允许前端显式传入已编辑提示词。"""
    model: str
    prompt: str = ""
    size: str = "1024x1536"


@router.post("/projects/{pid}/cards/{card_id}/generate-image")
def generate_card_image(pid: str, card_id: str, req: GenerateCardImageReq):
    """生成待验收候选；已有通过版本时不自动替换当前生产图。"""
    with _project_lock(pid):
        _load_project(pid)
        cards = _load_cards(pid)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None:
            raise HTTPException(404, f"卡片 {card_id} 不存在")
        if card.stage not in ("img_prompt", "storyboard"):
            raise HTTPException(400, "只有图片提示词卡或故事板卡可以立即生图")

        prompt = req.prompt.strip() or (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        if not prompt:
            raise HTTPException(400, "卡片没有可用提示词")
        generation_prompt = build_image_repair_prompt(
            prompt,
            list(card.metadata.get("image_reviews") or []),
        )
    try:
        result = generate_image_to_local(generation_prompt, req.model, req.size)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        logger.warning("单卡生图失败 card=%s model=%s: %s", card_id, req.model, exc)
        raise HTTPException(502, f"生图失败: {exc}") from exc

    with _project_lock(pid):
        cards = _load_cards(pid)
        card = next((item for item in cards if item.card_id == card_id), None)
        if card is None or card.stage not in ("img_prompt", "storyboard"):
            raise HTTPException(409, "生图期间卡片已被删除或改变，请重新操作")
        current_prompt = (
            card.prompts[0].strip()
            if card.prompts
            else card.content.strip()
        )
        existing_active_image = (
            str(card.metadata.get("active_image") or "")
            if "active_image" in card.metadata
            else (str(card.images[-1]) if card.images else "")
        )
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
                "last_image_prompt": prompt,
                "last_image_generation_prompt": generation_prompt,
            }
            if active_image == result["url"]:
                card.metadata["review_verdict"] = ""
                card.status = "review"
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
        _save_cards(pid, cards)
    return {
        "code": 200,
        "data": {
            **result,
            "card": card.model_dump(),
            "applied": applied,
            "stale": not applied,
            "qualityFeedbackApplied": generation_prompt != prompt,
            "candidateUrl": result.get("url") or "",
        },
    }


@router.post("/projects/{pid}/cards/{card_id}/split-storyboard")
def split_storyboard_card(pid: str, card_id: str):
    """在项目锁内拆分故事板，避免覆盖同时发生的卡片修改。"""
    with _project_lock(pid):
        return _split_storyboard_card_locked(pid, card_id)


def _split_storyboard_card_locked(pid: str, card_id: str):
    """把历史上一张 G 内含多个 ``### 镜头N`` 的大分镜拆成一镜一卡，原卡不再保留。"""
    _load_project(pid)
    cards = _load_cards(pid)
    card = next((item for item in cards if item.card_id == card_id), None)
    if card is None:
        raise HTTPException(404, f"卡片 {card_id} 不存在")
    if card.stage != "storyboard":
        raise HTTPException(400, "只有分镜卡可以拆成逐镜故事板")

    matches = list(re.finditer(r"(?m)^###\s*镜头\s*(\d+)[^\n]*\n", card.content))
    if len(matches) < 2:
        raise HTTPException(400, "该分镜没有检测到至少两个“### 镜头N”段落")

    now = _now()
    split_cards: list[ProductionCard] = []
    for index, match in enumerate(matches):
        subshot_number = int(match.group(1))
        end = matches[index + 1].start() if index + 1 < len(matches) else len(card.content)
        heading = match.group(0).strip()
        body = card.content[match.end():end].strip()
        subshot = f"G{card.shot_number}-S{subshot_number}"
        metadata = {
            **card.metadata,
            "unit_number": card.shot_number,
            "subshot": subshot,
            "storyboard_schema_version": "3.0-one-shot-per-card",
            "split_from_card_id": card.card_id,
        }
        split_cards.append(ProductionCard(
            card_id=str(uuid.uuid4())[:8],
            project_id=pid,
            stage="storyboard",
            title=f"{subshot} 故事板",
            content=f"{heading}\n{body}",
            episode=card.episode,
            shot_number=card.shot_number,
            images=list(card.images) if index == 0 else [],
            metadata=metadata,
            status=card.status,
            assignee=card.assignee,
            created_at=now,
            updated_at=now,
        ))

    position = cards.index(card)
    cards[position:position + 1] = split_cards
    _save_cards(pid, cards)
    return {"code": 200, "data": {
        "split": len(split_cards),
        "source_card_id": card_id,
        "cards": [item.model_dump() for item in split_cards],
    }}


# ── Stages meta ───────────────────────────────────────────────────

@router.get("/stages")
def list_stages():
    """GET /stages：返回生产流程的全部阶段定义（key/名称/顺序），供前端渲染看板列。"""
    return {"code": 200, "data": STAGES}


# ── 全链路对照矩阵 / 孤儿卡归档 ──────────────────────────────────
#
# 一个 G 生成单元从剧本到成片要依次经过 CHAIN_STAGES 四个 spec 阶段。
# 归档 = 把卡片从 cards.json 移到 data/production/<pid>/archive/<card_id>.json。
# 一卡一文件，肉眼可读、可直接翻看，永不删除；随时可 restore 回 cards.json。

CHAIN_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")


def _archive_dir(pid: str) -> Path:
    """项目 pid 的归档目录（data/production/{pid}/archive）。"""
    return _proj_dir(pid) / "archive"


def _list_archived(pid: str) -> list[dict]:
    """读出该项目归档目录里的全部卡片（按归档时间倒序）；目录不存在返回空。"""
    d = _archive_dir(pid)
    if not d.exists():
        return []
    items = []
    for f in d.glob("*.json"):
        try:
            items.append(json.loads(f.read_text("utf-8")))
        except Exception:
            logger.warning("归档文件读取失败，跳过: %s", f, exc_info=True)
    return sorted(items, key=lambda x: x.get("archived_at", ""), reverse=True)


def _first_frame_count(unit_cards: list[ProductionCard]) -> int:
    """该单元的「首帧提示词」张数：img_prompt 阶段里排除掉末帧锁(FLF)的部分。

    首帧与末帧锁同属 img_prompt 阶段，只能靠标题区分。判断单元是否断链必须用这个数，
    否则只剩一张末帧锁的孤儿单元会被误判为「img_prompt 阶段有卡」。
    """
    ip = [c for c in unit_cards if c.stage == "img_prompt"]
    return len(ip) - sum(1 for c in ip if "末帧" in c.title)


def _unit_missing_stages(unit_cards: list[ProductionCard]) -> list[str]:
    """返回该 G 单元缺失的 spec 阶段列表（img_prompt 按首帧张数判断）。"""
    counts = {
        "script": sum(1 for c in unit_cards if c.stage == "script"),
        "storyboard": sum(1 for c in unit_cards if c.stage == "storyboard"),
        "img_prompt": _first_frame_count(unit_cards),
        "vid_prompt": sum(1 for c in unit_cards if c.stage == "vid_prompt"),
    }
    return [s for s, n in counts.items() if n == 0]


def _orphan_cards(cards: list[ProductionCard]) -> list[ProductionCard]:
    """找出孤儿卡：挂在某个 G 单元号上、但该单元四个 spec 阶段全空的卡片。

    典型来源是编号错位——例如 jiulu-s1 EP16/EP17 各有一张 `G6末帧锁`，
    而这两集实际只有 G1~G5。这类卡有真实内容，不该删；但它不属于任何单元，
    在逐单元下钻的视图里永远露不出来。
    """
    out: list[ProductionCard] = []
    for ep in {c.episode for c in cards if c.episode is not None}:
        ep_cards = [c for c in cards if c.episode == ep]
        for u in {c.shot_number for c in ep_cards if c.shot_number > 0}:
            uc = [c for c in ep_cards if c.shot_number == u]
            if len(_unit_missing_stages(uc)) == len(CHAIN_STAGES):
                out.extend(uc)
    return sorted(out, key=lambda c: (c.episode or 0, c.shot_number))


@router.get("/matrix")
def production_matrix():
    """GET /matrix：跨全部项目返回「季 → 集 → G 生成单元」的链路对照表。

    每个 G 单元一行，聚合它在四个 spec 阶段各有几张卡、以及已产出的图/视频数。
    只回统计量不回卡片正文——三季 2000+ 张卡压成 ~340 行，前端可一屏铺开。
    shot_number == 0 的整集级卡（导演Brief/拆分表/质检等）不计入 G 单元，另按集汇总。
    """
    rows: list[dict] = []
    projects: list[dict] = []
    if not DATA_DIR.exists():
        return {"code": 200, "data": {"projects": [], "rows": []}}

    for d in sorted(DATA_DIR.iterdir()):
        f = d / "project.json"
        if not f.exists():
            continue
        proj = ProductionProject.model_validate_json(f.read_text("utf-8"))
        cards = _load_cards(proj.project_id)
        episodes = sorted({c.episode for c in cards if c.episode is not None})
        projects.append({
            "project_id": proj.project_id,
            "name": proj.name,
            "episode_count": len(episodes),
            "card_count": len(cards),
        })

        for ep in episodes:
            ep_cards = [c for c in cards if c.episode == ep]
            # 整集级卡：shot_number == 0，如 导演Brief / 镜头拆分表 / 质检报告
            ep_level = [c for c in ep_cards if c.shot_number == 0]
            units = sorted({c.shot_number for c in ep_cards if c.shot_number > 0})
            for u in units:
                uc = [c for c in ep_cards if c.shot_number == u]
                by_stage = {s: [c for c in uc if c.stage == s] for s in CHAIN_STAGES}
                flf = sum(1 for c in by_stage["img_prompt"] if "末帧" in c.title)
                missing = _unit_missing_stages(uc)
                title = next((c.title for c in by_stage["script"]), "") or next((c.title for c in uc), "")
                rows.append({
                    "project_id": proj.project_id,
                    "project_name": proj.name,
                    "episode": ep,
                    "unit": u,
                    "title": title,
                    "script": len(by_stage["script"]),
                    "storyboard": len(by_stage["storyboard"]),
                    "img_prompt": _first_frame_count(uc),
                    "flf": flf,
                    "vid_prompt": len(by_stage["vid_prompt"]),
                    "images": sum(len(c.images) for c in uc),
                    "videos": sum(len(c.videos) for c in uc),
                    "missing": missing,
                    # 四个 spec 阶段全缺 = 该单元不存在，这些卡是孤儿
                    "orphan": len(missing) == len(CHAIN_STAGES),
                    "ep_level_cards": len(ep_level),
                })

    return {"code": 200, "data": {"projects": projects, "rows": rows}}


@router.get("/orphans")
def list_orphans():
    """GET /orphans：跨全部项目列出孤儿卡（挂在四个 spec 阶段全空的 G 单元上的卡片）。

    附带该集实际存在的 G 单元号，便于判断是编号错位还是该单元从未写完。
    """
    out: list[dict] = []
    if not DATA_DIR.exists():
        return {"code": 200, "data": out}

    for d in sorted(DATA_DIR.iterdir()):
        f = d / "project.json"
        if not f.exists():
            continue
        proj = ProductionProject.model_validate_json(f.read_text("utf-8"))
        cards = _load_cards(proj.project_id)
        for c in _orphan_cards(cards):
            siblings = sorted({
                x.shot_number for x in cards
                if x.episode == c.episode and x.shot_number > 0 and x.shot_number != c.shot_number
            })
            out.append({
                **c.model_dump(),
                "project_id": proj.project_id,
                "project_name": proj.name,
                "episode_units": siblings,
            })
    return {"code": 200, "data": out}


class ArchiveReq(BaseModel):
    """POST /projects/{pid}/archive 的请求体：要归档的卡片与原因。"""
    card_ids: list[str]
    reason: str = "孤儿卡：所属 G 单元不存在"


@router.post("/projects/{pid}/archive")
def archive_cards(pid: str, req: ArchiveReq):
    """在项目锁内归档卡片。"""
    with _project_lock(pid):
        return _archive_cards_locked(pid, req)


def _archive_cards_locked(pid: str, req: ArchiveReq):
    """POST /projects/{pid}/archive：把卡片从 cards.json 移入归档目录，一卡一文件。

    不是删除——原始卡片内容原样保留，另附 archived_at / archive_reason，可随时 restore。
    card_id 不在该项目里则跳过（幂等：重复归档同一张不会报错）。
    """
    _load_project(pid)  # 项目不存在直接 404
    cards = _load_cards(pid)
    wanted = set(req.card_ids)
    to_archive = [c for c in cards if c.card_id in wanted]
    if not to_archive:
        return {"code": 200, "data": {"archived": 0, "cards": []}}

    d = _archive_dir(pid)
    d.mkdir(parents=True, exist_ok=True)
    now = _now()
    for c in to_archive:
        payload = {**c.model_dump(), "archived_at": now, "archive_reason": req.reason}
        (d / f"{c.card_id}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), "utf-8")

    _save_cards(pid, [c for c in cards if c.card_id not in wanted])
    logger.info("归档 %d 张卡片到 %s：%s", len(to_archive), d, req.reason)
    return {"code": 200, "data": {
        "archived": len(to_archive),
        "cards": [c.card_id for c in to_archive],
    }}


@router.get("/projects/{pid}/archive")
def list_archive(pid: str):
    """GET /projects/{pid}/archive：列出该项目归档目录里的全部卡片（按归档时间倒序）。"""
    _load_project(pid)
    return {"code": 200, "data": _list_archived(pid)}


@router.post("/projects/{pid}/archive/{card_id}/restore")
def restore_card(pid: str, card_id: str):
    """在项目锁内恢复归档卡片。"""
    with _project_lock(pid):
        return _restore_card_locked(pid, card_id)


def _restore_card_locked(pid: str, card_id: str):
    """POST /projects/{pid}/archive/{card_id}/restore：把归档卡片移回 cards.json 并删除归档文件。

    卡片已在 cards.json 中（重复恢复）则只清理归档文件，不产生重复卡。
    """
    _load_project(pid)
    f = _archive_dir(pid) / f"{card_id}.json"
    if not f.exists():
        raise HTTPException(404, f"归档中没有这张卡片: {card_id}")

    payload = json.loads(f.read_text("utf-8"))
    payload.pop("archived_at", None)
    payload.pop("archive_reason", None)

    cards = _load_cards(pid)
    if not any(c.card_id == card_id for c in cards):
        cards.append(ProductionCard.model_validate(payload))
        _save_cards(pid, cards)
    f.unlink()
    return {"code": 200, "data": {"restored": card_id}}


# ── Resource file serving ────────────────────────────────────────

RESOURCE_DIR = BASE_DIR / "resouce"
THUMB_CACHE_DIR = BASE_DIR / "data" / "thumb-cache"

# 可生成缩略图的位图格式(gif 不动,避免丢动画)
_THUMBABLE = {".png", ".jpg", ".jpeg", ".webp"}
# 允许的缩略图宽度白名单——挡住 ?w= 任意取值把缓存目录撑爆
_THUMB_WIDTHS = (64, 128, 256, 512)


def _thumbnail_path(src: Path, width: int) -> Path | None:
    """按(源文件路径 + mtime + 宽度)生成缓存键，返回缩略图路径；不该/不能生成时返回 None，调用方回退原图。

    缓存落在 data/thumb-cache/<width>/<sha1>.webp；mtime 进 key，源图被替换后缓存自动失效。
    """
    try:
        stat = src.stat()
        digest = hashlib.sha1(f"{src}|{stat.st_mtime_ns}|{width}".encode("utf-8")).hexdigest()
        out = THUMB_CACHE_DIR / str(width) / f"{digest}.webp"
        if out.exists():
            return out

        from PIL import Image  # 延迟导入：Pillow 缺失时 fail-open 回退原图，不影响服务启动

        with Image.open(src) as im:
            if im.width <= width:
                return None  # 原图本就比目标窄，放大没意义
            im = im.convert("RGBA") if im.mode in ("P", "LA") else im
            # 高度上限放宽到 4×宽，竖屏 9:16 素材不会被 thumbnail 的等比框裁小
            im.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
            out.parent.mkdir(parents=True, exist_ok=True)
            tmp = out.with_name(f"{digest}.{uuid.uuid4().hex}.tmp")
            im.save(tmp, "WEBP", quality=82, method=4)
        tmp.replace(out)  # 先写临时文件再原子改名，避免并发请求读到半截文件
        return out
    except Exception:
        logger.warning("缩略图生成失败，回退原图: %s (w=%s)", src, width, exc_info=True)
        return None


@router.get("/resource/{path:path}")
def serve_resource(path: str, w: int | None = None):
    """GET /resource/{path}：从 resouce 目录提供静态素材文件；带路径穿越防护（越界返 403），文件不存在返 404。

    可选 ?w=64|128|256|512 返回等比缩放的 WebP 缩略图（磁盘缓存，按源文件 mtime 失效）。
    宽度不在白名单、格式不支持、原图本就更窄或 Pillow 不可用时一律回退原图（fail-open）。
    """
    file_path = RESOURCE_DIR / path
    allowed_root = RESOURCE_DIR
    if not file_path.is_file() and path.startswith("production/"):
        # 卡片上传的文件写在 data/production/<pid>/uploads/，而返回的 URL 沿用
        # resource/production/ 前缀——resouce/ 下找不到时回退到 data/ 读，
        # 否则上传成功的图 GET 必 404（写读目录不一致的历史遗留）。
        file_path = DATA_DIR / path[len("production/"):]
        allowed_root = DATA_DIR
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(404, f"Resource not found: {path}")
    resolved = file_path.resolve()
    if not str(resolved).startswith(str(allowed_root.resolve())):
        raise HTTPException(403, "Access denied")
    suffix = file_path.suffix.lower()

    if w in _THUMB_WIDTHS and suffix in _THUMBABLE:
        thumb = _thumbnail_path(resolved, w)
        if thumb is not None:
            return FileResponse(thumb, media_type="image/webp",
                                headers={"Cache-Control": "public, max-age=31536000, immutable"})

    media_types = {
        ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4",
        ".webm": "video/webm", ".pdf": "application/pdf",
    }
    # 原图给 1 小时缓存：素材文件基本不原地改写（改了也是换文件名），
    # 避免抽屉/预览每次重拉 MB 级原图；不敢给 immutable，路径没有内容指纹。
    return FileResponse(resolved, media_type=media_types.get(suffix, "application/octet-stream"),
                        headers={"Cache-Control": "public, max-age=3600"})
