"""Production pipeline API — project & card CRUD + AI generation."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.config import BASE_DIR
from app.models.production import (
    STAGES, STAGE_KEYS,
    ProductionCard, ProductionProject, ProjectWithCards,
)

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


# ── Projects ──────────────────────────────────────────────────────

@router.get("/projects")
def list_projects():
    projects = []
    if DATA_DIR.exists():
        for d in sorted(DATA_DIR.iterdir()):
            f = d / "project.json"
            if f.exists():
                proj = ProductionProject.model_validate_json(f.read_text("utf-8"))
                card_count = len(_load_cards(proj.project_id))
                projects.append({**proj.model_dump(), "cardCount": card_count})
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
    cards = _load_cards(pid)
    result = ProjectWithCards(**proj.model_dump(), cards=cards)
    return {"code": 200, "data": result.model_dump()}


@router.put("/projects/{pid}")
def update_project(pid: str, req: CreateProjectReq):
    proj = _load_project(pid)
    proj.name = req.name
    proj.description = req.description
    proj.source_type = req.source_type
    proj.source_content = req.source_content
    proj.employee_key = req.employee_key
    proj.team_code = req.team_code
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


# ── Cards ─────────────────────────────────────────────────────────

class CreateCardReq(BaseModel):
    stage: str = "idea"
    title: str = ""
    content: str = ""
    shot_number: int = 0
    prompts: list[str] = []
    images: list[str] = []
    videos: list[str] = []
    metadata: dict = {}
    status: str = "pending"


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
        shot_number=req.shot_number,
        prompts=req.prompts,
        images=req.images,
        videos=req.videos,
        metadata=req.metadata,
        status=req.status,
        created_at=now,
        updated_at=now,
    )
    cards.append(card)
    _save_cards(pid, cards)
    return {"code": 200, "data": card.model_dump()}


@router.put("/cards/{card_id}")
def update_card(card_id: str, req: CreateCardReq):
    for d in DATA_DIR.iterdir():
        cards_file = d / "cards.json"
        if not cards_file.exists():
            continue
        cards = _load_cards(d.name)
        for c in cards:
            if c.card_id == card_id:
                c.stage = req.stage
                c.title = req.title
                c.content = req.content
                c.shot_number = req.shot_number
                c.prompts = req.prompts
                c.images = req.images
                c.videos = req.videos
                c.metadata = req.metadata
                c.status = req.status
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


# ── AI Generation ─────────────────────────────────────────────────

class GenerateReq(BaseModel):
    target_stage: str
    employee_key: str = ""
    extra_instruction: str = ""


@router.post("/projects/{pid}/generate")
async def generate_stage(pid: str, req: GenerateReq):
    """Use AI to generate cards for the target stage based on previous stages."""
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

    from app.services.invocation import invoke_agent
    prompt = f"你正在为项目「{proj.name}」生成{target_name}。\n\n{instruction}\n\n以下是已有的内容：\n\n{context}"

    result = await invoke_agent(employee_key=emp_key, user_input=prompt)
    reply = result.get("reply", "") if isinstance(result, dict) else str(result)

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
    """Serve image/video files from the resouce/ directory."""
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
