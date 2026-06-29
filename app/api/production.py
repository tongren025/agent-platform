"""Production pipeline API — project & card CRUD + AI generation."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import BASE_DIR
from app.models.conversation import AgentRunRequest
from app.models.production import (
    STAGES, STAGE_KEYS, ROLES,
    ProductionCard, ProductionProject, ProjectWithCards, ProjectMember,
)
from app.services.invocation import run_invocation

router = APIRouter(prefix="/api/v1/agentapp/production", tags=["production"])

DATA_DIR = BASE_DIR / "data" / "production"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _proj_dir(pid: str) -> Path:
    return DATA_DIR / pid


def _load_project(pid: str) -> ProductionProject:
    f = _proj_dir(pid) / "project.json"
    if not f.exists():
        raise HTTPException(404, f"项目 {pid} 不存在")
    return ProductionProject.model_validate_json(f.read_text("utf-8"))


def _save_project(proj: ProductionProject) -> None:
    d = _proj_dir(proj.project_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "project.json").write_text(proj.model_dump_json(indent=2), "utf-8")


def _load_cards(pid: str) -> list[ProductionCard]:
    f = _proj_dir(pid) / "cards.json"
    if not f.exists():
        return []
    raw = json.loads(f.read_text("utf-8"))
    return [ProductionCard.model_validate(c) for c in raw]


def _save_cards(pid: str, cards: list[ProductionCard]) -> None:
    d = _proj_dir(pid)
    d.mkdir(parents=True, exist_ok=True)
    (d / "cards.json").write_text(
        json.dumps([c.model_dump() for c in cards], ensure_ascii=False, indent=2),
        "utf-8",
    )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _compute_stats(cards: list[ProductionCard]) -> dict:
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
    return {
        "total": total,
        "by_stage": by_stage,
        "by_status": by_status,
        "overall_progress": round(done_total / total * 100) if total else 0,
    }


# ── Projects ──────────────────────────────────────────────────────

@router.get("/projects")
def list_projects():
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
    name: str
    description: str = ""
    source_type: str = "idea"
    source_content: str = ""
    employee_key: str = ""
    team_code: str = ""


@router.post("/projects")
def create_project(req: CreateProjectReq):
    pid = str(uuid.uuid4())[:8]
    now = _now()
    proj = ProductionProject(
        project_id=pid,
        name=req.name,
        description=req.description,
        source_type=req.source_type,
        source_content=req.source_content,
        employee_key=req.employee_key,
        team_code=req.team_code,
        members=[ProjectMember(user_id="owner", name="创建者", role="owner", added_at=now)],
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
    proj = _load_project(pid)
    if not proj.members:
        proj.members = [ProjectMember(user_id="owner", name="创建者", role="owner", added_at=proj.created_at)]
        _save_project(proj)
    cards = _load_cards(pid)
    stats = _compute_stats(cards)
    result = ProjectWithCards(**proj.model_dump(), cards=cards, stats=stats)
    return {"code": 200, "data": result.model_dump()}


class UpdateProjectReq(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None
    source_content: Optional[str] = None
    employee_key: Optional[str] = None
    team_code: Optional[str] = None
    settings: Optional[dict] = None


@router.put("/projects/{pid}")
def update_project(pid: str, req: UpdateProjectReq):
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
    if req.settings is not None:
        proj.settings.update(req.settings)
    proj.updated_at = _now()
    _save_project(proj)
    return {"code": 200, "data": proj.model_dump()}


@router.delete("/projects/{pid}")
def delete_project(pid: str):
    import shutil
    d = _proj_dir(pid)
    if d.exists():
        shutil.rmtree(d)
    return {"code": 200, "data": "ok"}


# ── Project Members ──────────────────────────────────────────────

class AddMemberReq(BaseModel):
    user_id: str = ""
    name: str
    role: str = "editor"
    avatar: str = ""


@router.post("/projects/{pid}/members")
def add_member(pid: str, req: AddMemberReq):
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
    role: str


@router.put("/projects/{pid}/members/{user_id}")
def update_member_role(pid: str, user_id: str, req: UpdateMemberReq):
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
    cards: list[CreateCardReq]


@router.post("/projects/{pid}/cards/batch")
def batch_add_cards(pid: str, req: BatchCreateCardReq):
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
    card_ids: list[str]
    stage: str


@router.post("/cards/batch-move")
def batch_move_cards(req: BatchMoveReq):
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
    card_ids: list[str]


@router.post("/cards/batch-delete")
def batch_delete_cards(req: BatchDeleteReq):
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
    card_ids: list[str]
    status: str


@router.post("/cards/batch-status")
def batch_update_status(req: BatchUpdateStatusReq):
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
    target_stage: str
    employee_key: str = ""
    extra_instruction: str = ""


@router.post("/projects/{pid}/generate")
async def generate_stage(pid: str, req: GenerateReq):
    proj = _load_project(pid)
    cards = _load_cards(pid)

    target_idx = STAGE_KEYS.index(req.target_stage) if req.target_stage in STAGE_KEYS else -1
    if target_idx < 0:
        raise HTTPException(400, f"无效阶段: {req.target_stage}")

    prev_cards = [c for c in cards if STAGE_KEYS.index(c.stage) < target_idx]
    if not prev_cards and not proj.source_content:
        raise HTTPException(400, "没有前置阶段的内容可供生成")

    context_parts = []
    if proj.source_content:
        context_parts.append(f"## 项目原始素材\n{proj.source_content}")
    for stage_key in STAGE_KEYS[:target_idx]:
        stage_cards = sorted([c for c in prev_cards if c.stage == stage_key], key=lambda x: x.shot_number)
        if stage_cards:
            stage_name = next((s["name"] for s in STAGES if s["key"] == stage_key), stage_key)
            context_parts.append(f"## {stage_name}")
            for sc in stage_cards:
                context_parts.append(f"### {sc.title}\n{sc.content}")
                if sc.prompts:
                    context_parts.append("提示词:\n" + "\n".join(f"- {p}" for p in sc.prompts))

    context = "\n\n".join(context_parts)
    target_name = next((s["name"] for s in STAGES if s["key"] == req.target_stage), req.target_stage)

    stage_instructions = {
        "script": (
            "根据上面的创意/原著内容，写出完整的剧本。"
            "按场景拆分，每个场景包含：场景编号、场景描述、角色、台词、情绪/氛围。"
            "输出格式：每个场景用 --- 分隔，每个场景第一行是标题（如：场景1: xxx）。"
        ),
        "setting": (
            "根据剧本内容，输出角色设定和场景设定的文字描述。\n"
            "角色设定：每个角色的身份层（外貌、年龄、体型）、装备层（服装、武器、道具）、可变层（表情/情绪状态）。\n"
            "场景设定：每个场景的空间结构、光影设计（主光源+补光）、色温、氛围。\n"
            "输出格式：先角色后场景，每个用 --- 分隔，第一行标题（如：角色: 苍霖 或 场景: 废墟巷道）。"
        ),
        "design": (
            "根据角色·场景设定的文字描述，输出视觉设计参考。\n"
            "角色：正面全身定妆照描述、三视图要求、关键特征提示词。\n"
            "场景：场景概念图描述、关键光影和色彩提示词。\n"
            "道具：关键道具的外观描述和特效层。\n"
            "输出格式：每个用 --- 分隔，第一行标题（如：角色设计: 苍霖 或 场景设计: 废墟巷道）。"
        ),
        "storyboard": (
            "根据剧本、角色场景设定和视觉设计，拆分成分镜头脚本。\n"
            "每个镜头包含：镜头编号、画面描述（引用角色设定和场景设定的视觉关键词）、"
            "景别/角度、运镜方式（推/拉/摇/移/固定）、时长建议、角色动作、台词/旁白、音效。"
            "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01: xxx）。"
        ),
        "img_prompt": (
            "根据分镜和视觉设计，为每个镜头生成一条图片生成提示词。\n"
            "提示词要求：包含画面主体、环境、光线、构图、风格、画质关键词。\n"
            "角色描述必须引用角色设定中的固定词，确保一致性。\n"
            "竖屏 9:16 比例。\n"
            "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01），第二行起是提示词。"
        ),
        "vid_prompt": (
            "根据分镜和图片提示词，为每个镜头生成一条视频生成提示词。\n"
            "遵循 Seedance 2.0 格式：画面描述 + 动作 + 运镜 + 氛围。\n"
            "规则：无负向词、单段 ≤6 秒、运镜与动作分离、八层结构。\n"
            "输出格式：每个镜头用 --- 分隔，第一行标题（如：镜头01），第二行起是视频提示词。"
        ),
    }

    instruction = stage_instructions.get(req.target_stage, f"根据前面的内容，生成{target_name}阶段的内容。")
    if req.extra_instruction:
        instruction += f"\n\n额外要求：{req.extra_instruction}"

    emp_key = req.employee_key or proj.employee_key
    if not emp_key:
        from app.dependencies import employee_registry
        all_emps = employee_registry.list_all()
        emp_key = all_emps[0].employee_key if all_emps else ""

    if not emp_key:
        raise HTTPException(400, "需要指定一个数字员工来执行生成")

    prompt = f"你正在为项目「{proj.name}」生成{target_name}。\n\n{instruction}\n\n以下是已有的内容：\n\n{context}"

    result = await run_invocation(AgentRunRequest(
        employeeKey=emp_key,
        userInput=prompt,
    ))
    if not result.success:
        raise HTTPException(500, result.error_message or "AI 生成失败")
    reply = result.assistant_message

    if not reply:
        raise HTTPException(500, "AI 未返回内容")

    sections = [s.strip() for s in reply.split("---") if s.strip()]
    now = _now()
    new_cards = []
    existing_stage_cards = [c for c in cards if c.stage == req.target_stage]
    for ec in existing_stage_cards:
        cards.remove(ec)

    for i, section in enumerate(sections):
        lines = section.strip().split("\n")
        title = lines[0].strip().lstrip("#").strip() if lines else f"{target_name} {i+1}"
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section

        prompts = []
        if req.target_stage in ("img_prompt", "vid_prompt"):
            prompts = [body] if body else []

        card = ProductionCard(
            card_id=str(uuid.uuid4())[:8],
            project_id=pid,
            stage=req.target_stage,
            title=title,
            content=body,
            shot_number=i + 1,
            prompts=prompts,
            status="done",
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
        "stage": req.target_stage,
        "cards": [c.model_dump() for c in new_cards],
    }}


# ── Stages meta ───────────────────────────────────────────────────

@router.get("/stages")
def list_stages():
    return {"code": 200, "data": STAGES}


# ── Resource file serving ────────────────────────────────────────

RESOURCE_DIR = BASE_DIR / "resouce"

@router.get("/resource/{path:path}")
def serve_resource(path: str):
    file_path = RESOURCE_DIR / path
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(404, f"Resource not found: {path}")
    resolved = file_path.resolve()
    if not str(resolved).startswith(str(RESOURCE_DIR.resolve())):
        raise HTTPException(403, "Access denied")
    suffix = file_path.suffix.lower()
    media_types = {
        ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4",
        ".webm": "video/webm", ".pdf": "application/pdf",
    }
    return FileResponse(resolved, media_type=media_types.get(suffix, "application/octet-stream"))
