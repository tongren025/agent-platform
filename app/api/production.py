"""Production pipeline API — project & card CRUD + AI generation."""
from __future__ import annotations

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import BASE_DIR
from app.core.logging import get_logger
from app.models.conversation import AgentRunRequest
from app.models.production import (
    STAGES, STAGE_KEYS, STAGE_INSTRUCTIONS, ROLES,
    GC_STAGES, GC_STAGE_KEYS, GC_STAGE_INSTRUCTIONS,
    ProductionCard, ProductionProject, ProjectWithCards, ProjectMember,
)
from app.services.invocation import run_invocation
from app.services.production_quality import evaluate_production_draft

router = APIRouter(prefix="/api/v1/agentapp/production", tags=["production"])
logger = get_logger(__name__)

DATA_DIR = BASE_DIR / "data" / "production"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _proj_dir(pid: str) -> Path:
    """返回项目 pid 的数据目录路径（data/production/{pid}）。"""
    return DATA_DIR / pid


def _load_project(pid: str) -> ProductionProject:
    """从磁盘加载项目 project.json；不存在直接抛 404。"""
    f = _proj_dir(pid) / "project.json"
    if not f.exists():
        raise HTTPException(404, f"项目 {pid} 不存在")
    return ProductionProject.model_validate_json(f.read_text("utf-8"))


def _save_project(proj: ProductionProject) -> None:
    """把项目对象写回磁盘 project.json（目录不存在则创建）。"""
    d = _proj_dir(proj.project_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "project.json").write_text(proj.model_dump_json(indent=2), "utf-8")


def _load_cards(pid: str) -> list[ProductionCard]:
    """加载项目的全部生产卡片；cards.json 不存在时返回空列表。"""
    f = _proj_dir(pid) / "cards.json"
    if not f.exists():
        return []
    raw = json.loads(f.read_text("utf-8"))
    return [ProductionCard.model_validate(c) for c in raw]


def _save_cards(pid: str, cards: list[ProductionCard]) -> None:
    """把项目卡片列表整体写回 cards.json（全量覆盖写）。"""
    d = _proj_dir(pid)
    d.mkdir(parents=True, exist_ok=True)
    (d / "cards.json").write_text(
        json.dumps([c.model_dump() for c in cards], ensure_ascii=False, indent=2),
        "utf-8",
    )


def _now() -> str:
    """返回当前 UTC 时间的 ISO 格式字符串，作为统一时间戳。"""
    return datetime.now(timezone.utc).isoformat()


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
    for section in [s.strip() for s in reply.split("---") if s.strip()]:
        lines = section.strip().split("\n")
        title = lines[0].strip().lstrip("#").strip() if lines else "生成卡片"
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section
        drafts.append({"title": title, "content": body, "prompts": [], "negative_prompts": [], "metadata": {}})
    return drafts


SPEC_STAGES = ("script", "storyboard", "img_prompt", "vid_prompt")


def _compute_readiness(cards: list[ProductionCard]) -> dict:
    """按 G 生成单元计算真实生产就绪度，避免“文案卡已 done”被误报为成片完成。"""
    units = sorted({
        (c.episode, c.shot_number)
        for c in cards
        if c.episode is not None and c.shot_number > 0
    })
    if not units:
        return {
            "units": 0, "spec_ready": 0, "with_image": 0, "with_video": 0,
            "delivered": 0, "spec_rate": 0, "image_rate": 0,
            "video_rate": 0, "delivery_rate": 0, "overall_progress": 0,
            "blockers": 0, "next_action": "先生成剧本与 G 生成单元",
        }

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
        next_action = f"修复 {missing_spec} 个断链单元"
    elif with_image < total:
        next_action = f"完成剩余 {total - with_image} 个单元出图"
    elif with_video < total:
        next_action = f"完成剩余 {total - with_video} 个单元视频"
    elif delivered < total:
        next_action = "完成剪辑与成片交付"
    else:
        next_action = "项目已具备交付条件"
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
    return {
        "total": total,
        "by_stage": by_stage,
        "by_status": by_status,
        "card_status_progress": round(done_total / total * 100) if total else 0,
        "overall_progress": readiness["overall_progress"],
        "readiness": readiness,
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
                proj = ProductionProject.model_validate_json(f.read_text("utf-8"))
                cards = _load_cards(proj.project_id)
                stats = _compute_stats(cards)
                projects.append({**proj.model_dump(), "cardCount": len(cards), "stats": stats})
    return {"code": 200, "data": projects}


class CreateProjectReq(BaseModel):
    """POST /projects 的请求体：新建项目的名称、素材来源与默认执行员工/团队。"""
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
        members=[ProjectMember(user_id=username, name=display_name, role="owner", added_at=now)],
        created_at=now,
        updated_at=now,
    )
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
    settings: Optional[dict] = None


@router.put("/projects/{pid}")
def update_project(pid: str, req: UpdateProjectReq):
    """PUT /projects/{pid}：按传入字段部分更新项目信息（settings 为合并而非覆盖）。"""
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
    if req.settings is not None:
        proj.settings.update(req.settings)
    proj.updated_at = _now()
    _save_project(proj)
    return {"code": 200, "data": proj.model_dump()}


@router.delete("/projects/{pid}")
def delete_project(pid: str):
    """DELETE /projects/{pid}：删除项目整个数据目录（含卡片与上传文件），幂等操作。"""
    import shutil
    d = _proj_dir(pid)
    if d.exists():
        shutil.rmtree(d)
    return {"code": 200, "data": "ok"}


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
        cards_file = d / "cards.json"
        if not cards_file.exists():
            continue
        cards = _load_cards(d.name)
        for c in cards:
            if c.card_id == card_id:
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
                if "images" in provided:
                    c.images = req.images or []
                if "videos" in provided:
                    c.videos = req.videos or []
                if "metadata" in provided:
                    c.metadata = req.metadata or {}
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
        cards_file = d / "cards.json"
        if not cards_file.exists():
            continue
        cards = _load_cards(d.name)
        new_cards = [c for c in cards if c.card_id != card_id]
        if len(new_cards) < len(cards):
            _save_cards(d.name, new_cards)
            return {"code": 200, "data": "ok"}
    raise HTTPException(404, "卡片不存在")


class BatchCreateCardReq(BaseModel):
    """POST /projects/{pid}/cards/batch 的请求体：批量新建的卡片列表。"""
    cards: list[CreateCardReq]


@router.post("/projects/{pid}/cards/batch")
def batch_add_cards(pid: str, req: BatchCreateCardReq):
    """POST /projects/{pid}/cards/batch：一次写入多张卡片并返回新建结果；项目不存在返 404。"""
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
    _load_project(pid)
    cards = _load_cards(pid)
    card = next((c for c in cards if c.card_id == card_id), None)
    if not card:
        raise HTTPException(404, "卡片不存在")

    upload_dir = _proj_dir(pid) / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "file").suffix or (".png" if file_type == "image" else ".mp4")
    filename = f"{card_id}_{uuid.uuid4().hex[:6]}{ext}"
    file_path = upload_dir / filename

    content = await file.read()
    file_path.write_bytes(content)

    url = f"/api/v1/agentapp/production/resource/production/{pid}/uploads/{filename}"
    if file_type == "video":
        card.videos.append(url)
    else:
        card.images.append(url)
    card.updated_at = _now()
    _save_cards(pid, cards)
    return {"code": 200, "data": {"url": url, "card": card.model_dump()}}


@router.post("/cards/{card_id}/move")
def move_card(card_id: str, stage: str = "idea"):
    """POST /cards/{card_id}/move：把单张卡片移到指定阶段；阶段非法返 400，卡片不存在返 404。"""
    if stage not in STAGE_KEYS:
        raise HTTPException(400, f"无效阶段: {stage}")
    for d in DATA_DIR.iterdir():
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
    mode: str = "append"


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
    if not prev_cards and not proj.source_content:
        raise HTTPException(400, "没有前置阶段的内容可供生成")

    context_parts = []
    if proj.source_content:
        context_parts.append(f"## 项目原始素材\n{proj.source_content}")
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

    emp_key = req.employee_key or proj.employee_key
    if not emp_key:
        from app.dependencies import employee_registry
        all_emps = employee_registry.list_all()
        emp_key = all_emps[0].employee_key if all_emps else ""

    if not emp_key:
        raise HTTPException(400, "需要指定一个数字员工来执行生成")

    scope_label = f"EP{req.episode:02d}" if req.episode is not None else "全局资产"
    project_constraints = (
        f"项目规格：单集目标时长 {proj.episode_duration_seconds} 秒；画幅 {proj.aspect_ratio}；"
        f"视觉风格：{proj.visual_style or '沿用已锁定 Art Bible'}。"
    )
    prompt = f"你正在为项目「{proj.name}」（范围：{scope_label}）生成{target_name}。\n{project_constraints}\n\n{instruction}\n\n以下是已有的内容：\n\n{context}"

    result = await run_invocation(AgentRunRequest(
        employeeKey=emp_key,
        userInput=prompt,
    ))
    if not result.success:
        raise HTTPException(500, result.error_message or "AI 生成失败")
    reply = result.assistant_message

    if not reply:
        raise HTTPException(500, "AI 未返回内容")

    drafts = _sections_from_reply(reply)
    if not drafts:
        raise HTTPException(500, "AI 返回内容无法拆成卡片")

    now = _now()
    new_cards = []
    # 替换/续号都只作用于「同阶段 + 同集数」的卡片，其他集的卡片绝不触碰
    scope_cards = [c for c in cards if c.stage == req.target_stage and c.episode == req.episode]
    replaced = 0
    if req.mode == "replace":
        for ec in scope_cards:
            cards.remove(ec)
        replaced = len(scope_cards)
        next_shot = 0
    else:
        next_shot = max((c.shot_number for c in scope_cards), default=0)

    for i, draft in enumerate(drafts):
        title = draft["title"] or f"{target_name} {i+1}"
        body = draft["content"]
        metadata = dict(draft.get("metadata") or {})
        parsed_unit = _detect_generation_unit(title, metadata)
        if parsed_unit is None and _is_overview_card(title):
            unit_number = 0
        elif parsed_unit is not None:
            unit_number = parsed_unit
            next_shot = max(next_shot, unit_number)
        else:
            next_shot += 1
            unit_number = next_shot

        time_range = metadata.get("time_range") or _detect_time_range(f"{title}\n{body}")
        metadata.update({
            "target_stage": req.target_stage,
            "production_grain": "episode_overview" if unit_number == 0 else "generation_unit",
        })
        if unit_number > 0:
            metadata["unit_number"] = unit_number
        if time_range:
            metadata["time_range"] = time_range

        prompts = [str(p).strip() for p in draft.get("prompts", []) if str(p).strip()]
        negative_prompts = [str(p).strip() for p in draft.get("negative_prompts", []) if str(p).strip()]
        if req.target_stage in ("img_prompt", "vid_prompt") and not prompts and body:
            prompts = [body]
        quality_issues = evaluate_production_draft(req.target_stage, title, body, prompts)
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

    return {"code": 200, "data": {
        "generated": len(new_cards),
        "replaced": replaced,
        "mode": req.mode,
        "episode": req.episode,
        "stage": req.target_stage,
        "cards": [c.model_dump() for c in new_cards],
        "quality_issue_count": sum(
            len(c.metadata.get("quality_gate", {}).get("issues", [])) for c in new_cards
        ),
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
