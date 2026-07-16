"""自由画布 API —— 原子 CRUD + 图片/视频生成、上传与人工审核后合成。

画布是无限拼贴空间:节点(提示词/图片)带坐标,连线记录生成血缘。
数据落盘 data/canvas/{canvas_id}.json,与制作看板(production)互不依赖;
出图后前端可通过看板 API 把图片回写成 img_gen 阶段卡片。

生图走 ai_service 的 OpenAI 兼容 images 接口(如豆包/方舟 seedream),
产物统一保存到 data/uploads/canvas/ —— 该目录经 /uploads 静态挂载直出,
<img> 标签无需携带 Authorization 也能显示。
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.api.common import ok, validate_key
from app.config import BASE_DIR
from app.core.logging import get_logger
from app.dependencies import ai_service
from app.services.image_generation import generate_image_to_local
from app.services import openrouter_media
from app.models.conversation import AgentRunRequest
from app.models.production import STAGES, STAGE_INSTRUCTIONS
from app.services.invocation import run_invocation

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/agentapp/canvas", tags=["canvas"])

DATA_DIR = BASE_DIR / "data" / "canvas"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = BASE_DIR / "data" / "uploads" / "canvas"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_ALLOWED_UPLOAD_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"}


# ── 模型 ──────────────────────────────────────────────────────────


class CanvasNode(BaseModel):
    """画布节点。type 支持 data/image/video，data 保持开放字典便于前端演进。"""

    node_id: str = ""
    type: str = "data"  # data | image | video
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})
    data: dict = Field(default_factory=dict)


class CanvasEdge(BaseModel):
    """血缘连线:source 节点生成/派生出 target 节点。"""

    edge_id: str = ""
    source: str = ""
    target: str = ""


class CanvasDoc(BaseModel):
    """一张画布的完整文档：节点 + 血缘连线，落盘 data/canvas/{canvas_id}.json。"""
    canvas_id: str = ""
    name: str = "未命名画布"
    nodes: list[CanvasNode] = Field(default_factory=list)
    edges: list[CanvasEdge] = Field(default_factory=list)
    revision: int = 0
    created_at: str = ""
    updated_at: str = ""


def _now() -> str:
    """UTC 当前时间的 ISO 字符串。"""
    return datetime.now(timezone.utc).isoformat()


def _path(cid: str) -> Path:
    """画布 JSON 文件路径。"""
    return DATA_DIR / f"{cid}.json"


def _load(cid: str) -> CanvasDoc:
    """读画布（校验 id 合法性），不存在返 404。"""
    validate_key(cid, label="canvas_id")
    f = _path(cid)
    if not f.exists():
        raise HTTPException(404, f"画布 {cid} 不存在")
    return CanvasDoc.model_validate_json(f.read_text("utf-8"))


def _save(doc: CanvasDoc) -> None:
    """原子保存画布，避免进程中断留下半截 JSON。"""
    target = _path(doc.canvas_id)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(f".{target.name}.{uuid.uuid4().hex}.tmp")
    try:
        temporary.write_text(doc.model_dump_json(indent=2), "utf-8")
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)


# ── 画布 CRUD ─────────────────────────────────────────────────────


@router.get("/canvases")
def list_canvases():
    """列出全部画布(仅摘要,不含节点)。"""
    result = []
    for f in sorted(DATA_DIR.glob("*.json")):
        try:
            doc = CanvasDoc.model_validate_json(f.read_text("utf-8"))
        except Exception:
            logger.warning("画布文件损坏,跳过: %s", f.name)
            continue
        result.append({
            "canvas_id": doc.canvas_id,
            "name": doc.name,
            "nodeCount": len(doc.nodes),
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        })
    result.sort(key=lambda x: x["updated_at"], reverse=True)
    return ok(result)


class CreateCanvasReq(BaseModel):
    """创建画布请求体：仅画布名。"""
    name: str = "未命名画布"


@router.post("/canvases")
def create_canvas(req: CreateCanvasReq):
    """POST /canvases：创建空画布并返回完整文档。"""
    cid = uuid.uuid4().hex[:8]
    doc = CanvasDoc(canvas_id=cid, name=req.name.strip() or "未命名画布",
                    created_at=_now(), updated_at=_now())
    _save(doc)
    return ok(doc.model_dump())


@router.get("/canvases/{cid}")
def get_canvas(cid: str):
    """GET /canvases/{cid}：读画布完整文档，不存在返 404。"""
    return ok(_load(cid).model_dump())


class SaveCanvasReq(BaseModel):
    """保存画布请求体：整体覆盖节点与连线，名字可选改。"""
    name: str | None = None
    base_revision: int | None = None
    nodes: list[CanvasNode] = Field(default_factory=list)
    edges: list[CanvasEdge] = Field(default_factory=list)


@router.put("/canvases/{cid}")
def save_canvas(cid: str, req: SaveCanvasReq):
    """PUT /canvases/{cid}：整体保存画布（节点/连线全量覆盖）。"""
    doc = _load(cid)
    if req.base_revision is not None and req.base_revision != doc.revision:
        raise HTTPException(
            409,
            f"画布已被其他窗口更新（当前版本 {doc.revision}，提交版本 {req.base_revision}）",
        )
    if req.name is not None and req.name.strip():
        doc.name = req.name.strip()
    doc.nodes = req.nodes
    doc.edges = req.edges
    doc.revision += 1
    doc.updated_at = _now()
    _save(doc)
    return ok(doc.model_dump())


@router.delete("/canvases/{cid}")
def delete_canvas(cid: str):
    """DELETE /canvases/{cid}：删除画布文件，不存在返 404。"""
    validate_key(cid, label="canvas_id")
    f = _path(cid)
    if not f.exists():
        raise HTTPException(404, f"画布 {cid} 不存在")
    f.unlink()
    return ok(True)


# ── 生图 ──────────────────────────────────────────────────────────


@router.get("/image-models")
def list_image_models():
    """列出所有启用供应商下的模型,由用户自选哪个是生图模型。

    平台不猜测模型能力(chat/image 混在同一 models 列表里),
    前端记住用户上次选择即可。
    """
    result = []
    for p in ai_service.list_all_providers():
        if not p.enabled:
            continue
        for m in p.models:
            model_id = m.get("modelId", m.get("modelName", ""))
            if not model_id:
                continue
            result.append({
                "provider": p.name,
                "modelId": model_id,
                "modelName": m.get("modelName", model_id),
            })
    return ok(result)


class GenerateReq(BaseModel):
    """文生图请求体：提示词 + 模型 + 尺寸。"""
    prompt: str
    model: str
    size: str = "1024x1024"


@router.post("/canvases/{cid}/generate")
def generate_image(cid: str, req: GenerateReq):
    """文生图:调 OpenAI 兼容 images 接口,图片落地本地后返回 URL。

    远端返回的临时 URL 有有效期,必须下载转存,否则画布过几天就成空窗。
    """
    _load(cid)  # 画布必须存在
    if not req.prompt.strip():
        raise HTTPException(400, "提示词不能为空")

    try:
        result = generate_image_to_local(req.prompt, req.model, req.size)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        logger.warning("生图失败 model=%s: %s", req.model, exc)
        raise HTTPException(502, f"生图失败: {exc}")
    return ok(result)


# ── 素材上传 ──────────────────────────────────────────────────────


@router.post("/canvases/{cid}/upload")
async def upload_asset(cid: str, file: UploadFile = File(...)):
    """把本地图片或视频拖上画布，落盘后返回媒体类型和静态 URL。"""
    _load(cid)
    ext = Path(file.filename or "file").suffix.lower() or ".png"
    if ext not in _ALLOWED_UPLOAD_EXT:
        raise HTTPException(400, f"不支持的文件类型: {ext}")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(400, "文件超过 50MB 上限")
    filename = f"up_{uuid.uuid4().hex[:10]}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    kind = "video" if ext in {".mp4", ".webm"} else "image"
    return ok({
        "url": f"/uploads/canvas/{filename}",
        "kind": kind,
        "name": file.filename or filename,
        "size": len(content),
    })


# ── 视频生成与手动合成 ────────────────────────────────────────────


@router.get("/media-models")
def list_media_models(kind: str = Query("video", pattern="^(image|video)$")):
    """列出 OpenRouter 图片/视频模型，供自由画布显式选择。"""
    try:
        return ok(openrouter_media.list_media_models(kind))
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"读取 {kind} 模型失败: {exc}") from exc


class GenerateVideoReq(BaseModel):
    """自由画布视频任务：既支持文生视频，也支持首帧图生视频。"""

    model: str
    prompt: str
    duration: int = 5
    resolution: str = "720p"
    aspect_ratio: str = "9:16"
    image_url: str = ""
    generate_audio: bool = True


@router.post("/canvases/{cid}/video")
def generate_video(cid: str, req: GenerateVideoReq):
    """提交异步视频任务；任务信息由前端作为节点数据保存。"""
    _load(cid)
    if not req.prompt.strip():
        raise HTTPException(400, "视频提示词不能为空")
    try:
        job = openrouter_media.submit_video(
            cid,
            model=req.model,
            prompt=req.prompt.strip(),
            duration=req.duration,
            resolution=req.resolution,
            aspect_ratio=req.aspect_ratio,
            image_url=req.image_url,
            generate_audio=req.generate_audio,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"视频任务提交失败: {exc}") from exc
    return ok({"job": job})


@router.post("/canvases/{cid}/video/{job_id}/sync")
def sync_video(cid: str, job_id: str):
    """同步视频任务；完成后把远端 MP4 固化到本地 uploads。"""
    _load(cid)
    try:
        return ok({"job": openrouter_media.sync_video(cid, job_id)})
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"同步视频任务失败: {exc}") from exc


class ComposeReq(BaseModel):
    """按用户指定顺序合成已审核镜头。"""

    video_urls: list[str] = Field(min_length=1, max_length=100)
    aspect_ratio: str = "9:16"


@router.post("/canvases/{cid}/compose")
def compose_canvas_video(cid: str, req: ComposeReq):
    """按请求顺序拼接本地视频，返回可下载的成片节点素材。"""
    doc = _load(cid)
    approved_urls = {
        str(node.data.get("url") or "")
        for node in doc.nodes
        if node.type == "video"
        and node.data.get("reviewStatus") == "approved"
        and node.data.get("stage") != "final"
    }
    rejected = [url for url in req.video_urls if url not in approved_urls]
    if rejected:
        raise HTTPException(400, "只能合成当前画布中人工标记为“已通过”的视频")
    try:
        result = openrouter_media.compose_video(cid, req.video_urls, req.aspect_ratio)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"合成失败: {exc}") from exc
    return ok(result)


# ── AI 派生(画布的核心动作)────────────────────────────────────


class DeriveReq(BaseModel):
    """派生请求:以某个数据节点为源,让数字员工生成下游数据条目。"""

    source_title: str = ""
    source_content: str
    source_stage: str = ""      # 源节点阶段标签(仅用于提示上下文,可空)
    target_stage: str = ""      # 目标阶段(命中 STAGE_INSTRUCTIONS 用其模板;空=自由派生)
    employee_key: str
    instruction: str = ""       # 额外指令
    max_items: int = 12         # 单次派生条目上限,防止一次生成过多节点


def _stage_name(key: str) -> str:
    """阶段 key → 中文名;未知 key 原样返回。"""
    return next((s["name"] for s in STAGES if s["key"] == key), key)


@router.post("/canvases/{cid}/derive")
async def derive(cid: str, req: DeriveReq):
    """POST /canvases/{cid}/derive:画布 AI 派生。

    源节点内容 + 阶段指令模板(与看板逐阶段生成共用)交给数字员工,
    回复按 --- 分段解析成 1~N 个条目返回;节点创建与连线由前端完成,
    后端保持无状态(画布整体由 PUT 保存)。
    """
    _load(cid)  # 画布必须存在
    if not req.source_content.strip():
        raise HTTPException(400, "源节点内容为空,无从派生")
    if not req.employee_key:
        raise HTTPException(400, "需要指定执行派生的数字员工")

    if req.target_stage:
        base_instruction = STAGE_INSTRUCTIONS.get(
            req.target_stage,
            f"根据源数据,派生出「{_stage_name(req.target_stage)}」阶段的内容。",
        )
    else:
        base_instruction = "根据源数据和要求,生成派生内容。"
    if req.instruction:
        base_instruction += f"\n\n额外要求:{req.instruction}"

    src_label = f"(阶段: {_stage_name(req.source_stage)})" if req.source_stage else ""
    prompt = (
        f"你正在漫剧生产画布上做数据派生。以下是源数据{src_label}:\n\n"
        f"### {req.source_title or '未命名'}\n{req.source_content}\n\n"
        f"{base_instruction}\n\n"
        f"输出格式:每个条目用 --- 分隔,第一行是标题,其余行是内容;"
        f"最多输出 {max(1, min(req.max_items, 30))} 个条目。"
    )

    result = await run_invocation(AgentRunRequest(
        employeeKey=req.employee_key,
        userInput=prompt,
    ))
    if not result.success:
        raise HTTPException(500, result.error_message or "AI 派生失败")
    reply = result.assistant_message or ""
    if not reply.strip():
        raise HTTPException(500, "AI 未返回内容")

    limit = max(1, min(req.max_items, 30))
    sections = [s.strip() for s in reply.split("---") if s.strip()][:limit]
    items = []
    for i, section in enumerate(sections):
        lines = section.split("\n")
        title = lines[0].strip().lstrip("#").strip() if lines else f"派生 {i + 1}"
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section
        items.append({"title": title, "content": body, "stage": req.target_stage})

    return ok({"items": items, "raw": reply if not items else ""})
