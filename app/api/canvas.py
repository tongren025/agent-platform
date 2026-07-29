"""自由画布 API —— 画布 CRUD + 文生图 + 素材上传。

画布是无限拼贴空间:节点(提示词/图片)带坐标,连线记录生成血缘。
数据落盘 data/canvas/{canvas_id}.json,与制作看板(production)互不依赖;
出图后前端可通过看板 API 把图片回写成 img_gen 阶段卡片。

生图走统一图片生成服务（OpenAI 兼容供应商或 OpenRouter Images）,
产物统一保存到 data/uploads/canvas/ —— 该目录经 /uploads 静态挂载直出,
<img> 标签无需携带 Authorization 也能显示。
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.api.common import ok, validate_key
from app.config import BASE_DIR
from app.core.logging import get_logger
from app.services.image_generation import generate_image_to_local
from app.services import openrouter_media
from app.models.conversation import AgentRunRequest
from app.models.production import STAGES, STAGE_INSTRUCTIONS
from app.services.invocation import run_invocation

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/agentapp/canvas", tags=["canvas"])

DATA_DIR = BASE_DIR / "data" / "canvas"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ENGINE_DIR = DATA_DIR / "engines"
ENGINE_DIR.mkdir(parents=True, exist_ok=True)
WORKBENCH_DIR = DATA_DIR / "workbench"
WORKBENCH_DIR.mkdir(parents=True, exist_ok=True)
WORKBENCH_ASSET_DIR = DATA_DIR / "workbench-assets"
WORKBENCH_ASSET_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = BASE_DIR / "data" / "uploads" / "canvas"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_ALLOWED_UPLOAD_EXT = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".mp4", ".webm", ".mov",
    ".mp3", ".wav", ".m4a", ".aac", ".flac",
}


# ── 模型 ──────────────────────────────────────────────────────────


class CanvasNode(BaseModel):
    """画布节点。data 内容按 type 区分:prompt 存 {prompt},image 存 {url, prompt}。"""

    node_id: str = ""
    type: str = "image"  # prompt | image
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})
    data: dict = Field(default_factory=dict)


class CanvasEdge(BaseModel):
    """血缘连线:source 节点生成/派生出 target 节点。"""

    edge_id: str = ""
    source: str = ""
    target: str = ""
    data: dict = Field(default_factory=dict)


class CanvasDoc(BaseModel):
    """一张画布的完整文档：节点 + 血缘连线，落盘 data/canvas/{canvas_id}.json。"""
    canvas_id: str = ""
    name: str = "未命名画布"
    nodes: list[CanvasNode] = Field(default_factory=list)
    edges: list[CanvasEdge] = Field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""


class CanvasEngineDoc(BaseModel):
    """第三方画布引擎文档：由 engine 区分序列化格式，服务端只负责可靠落盘。"""

    engine: str
    content: dict[str, Any] = Field(default_factory=dict)
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
    """画布整体落盘（格式化 JSON）。"""
    _path(doc.canvas_id).write_text(doc.model_dump_json(indent=2), "utf-8")


def _engine_path(engine: str) -> Path:
    """第三方引擎文档路径，只接受安全的单段 key。"""
    validate_key(engine, label="engine")
    return ENGINE_DIR / f"{engine}.json"


def _workbench_path(project_id: str) -> Path:
    validate_key(project_id, label="project_id")
    return WORKBENCH_DIR / f"{project_id}.json"


def _workbench_asset_path(project_id: str) -> Path:
    validate_key(project_id, label="project_id")
    return WORKBENCH_ASSET_DIR / f"{project_id}.json"


def _load_workbench_assets(project_id: str) -> list[dict[str, Any]]:
    path = _workbench_asset_path(project_id)
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "画布素材索引损坏") from exc
    return [item for item in payload if isinstance(item, dict)] if isinstance(payload, list) else []


def _save_workbench_assets(project_id: str, items: list[dict[str, Any]]) -> None:
    path = _workbench_asset_path(project_id)
    temp_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), "utf-8")
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)


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
    nodes: list[CanvasNode] = Field(default_factory=list)
    edges: list[CanvasEdge] = Field(default_factory=list)


@router.put("/canvases/{cid}")
def save_canvas(cid: str, req: SaveCanvasReq):
    """PUT /canvases/{cid}：整体保存画布（节点/连线全量覆盖）。"""
    doc = _load(cid)
    if req.name is not None and req.name.strip():
        doc.name = req.name.strip()
    doc.nodes = req.nodes
    doc.edges = req.edges
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


class RenameCanvasReq(BaseModel):
    """重命名画布请求体。"""
    name: str


@router.patch("/canvases/{cid}")
def rename_canvas(cid: str, req: RenameCanvasReq):
    """PATCH /canvases/{cid}：仅重命名画布。"""
    doc = _load(cid)
    name = req.name.strip()
    if not name:
        raise HTTPException(400, "画布名称不能为空")
    doc.name = name
    doc.updated_at = _now()
    _save(doc)
    return ok(doc.model_dump())


@router.post("/canvases/{cid}/duplicate")
def duplicate_canvas(cid: str):
    """POST /canvases/{cid}/duplicate：复制画布(含全部节点/连线)。"""
    src = _load(cid)
    new_cid = uuid.uuid4().hex[:8]
    doc = CanvasDoc(
        canvas_id=new_cid,
        name=f"{src.name} (副本)",
        nodes=src.nodes,
        edges=src.edges,
        created_at=_now(),
        updated_at=_now(),
    )
    _save(doc)
    return ok(doc.model_dump())


# ── 第三方引擎文档 ───────────────────────────────────────────────


@router.get("/engines/{engine}")
def get_canvas_engine(engine: str):
    """读取 Excalidraw/Fabric/Rete 等引擎的原生 JSON；首次访问返回空文档。"""
    path = _engine_path(engine)
    if not path.exists():
        return ok(CanvasEngineDoc(engine=engine).model_dump())
    try:
        doc = CanvasEngineDoc.model_validate_json(path.read_text("utf-8"))
    except Exception as exc:
        logger.exception("画布引擎文档损坏: %s", path)
        raise HTTPException(500, f"{engine} 画布文档无法读取") from exc
    return ok(doc.model_dump())


class SaveCanvasEngineReq(BaseModel):
    """保存第三方引擎原生 JSON，请求体不绑定某一前端库的数据结构。"""

    content: dict[str, Any] = Field(default_factory=dict)


@router.put("/engines/{engine}")
def save_canvas_engine(engine: str, req: SaveCanvasEngineReq):
    """整体保存第三方画布引擎文档。"""
    path = _engine_path(engine)
    doc = CanvasEngineDoc(engine=engine, content=req.content, updated_at=_now())
    path.write_text(doc.model_dump_json(indent=2), "utf-8")
    return ok(doc.model_dump())


# ── 生图 ──────────────────────────────────────────────────────────


@router.get("/image-models")
def list_image_models():
    """只列出实时确认支持图片输出的 OpenRouter 模型，禁止聊天模型混入。"""
    try:
        models = openrouter_media.list_media_models("image")
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"读取 OpenRouter 图片模型失败: {exc}") from exc
    return ok([
        {
            "provider": "openrouter",
            # 加显式供应商前缀，让通用生图服务走 OpenRouter 专用 /images API。
            "modelId": f"openrouter:{model['id']}",
            "actualModelId": model["id"],
            "modelName": model["name"],
            "pricing": model["pricing"],
            "isFree": model["isFree"],
            "recommended": model["recommended"],
            "recommendationReason": model["recommendationReason"],
            "supportedParameters": model["supportedParameters"],
        }
        for model in models
    ])


# ── 完整工作台媒体适配 ─────────────────────────────────────────


@router.get("/workbench/projects")
def list_workbench_projects():
    """列出完整工作台项目摘要，数据由平台服务端统一保存。"""
    projects = []
    for path in WORKBENCH_DIR.glob("*.json"):
        try:
            record = json.loads(path.read_text("utf-8"))
            projects.append({
                key: record.get(key)
                for key in (
                    "id", "name", "createdAt", "updatedAt", "revision", "savedAt",
                    "thumbStyle", "thumbnail", "thumbnailUrls", "seedKey", "source",
                    "rootPath", "missing", "draft",
                )
                if key in record
            })
        except Exception:
            logger.warning("工作台项目文件损坏，跳过: %s", path.name)
    projects.sort(key=lambda item: int(item.get("updatedAt") or 0), reverse=True)
    return ok(projects)


@router.get("/workbench/projects/{project_id}")
def get_workbench_project(project_id: str):
    path = _workbench_path(project_id)
    if not path.exists():
        raise HTTPException(404, f"工作台项目 {project_id} 不存在")
    return ok(json.loads(path.read_text("utf-8")))


@router.put("/workbench/projects/{project_id}")
def save_workbench_project(project_id: str, record: dict[str, Any]):
    path = _workbench_path(project_id)
    if str(record.get("id") or "") != project_id:
        raise HTTPException(400, "项目 ID 与请求路径不一致")
    path.write_text(
        json.dumps(record, ensure_ascii=False, indent=2),
        "utf-8",
    )
    return ok(record)


@router.delete("/workbench/projects/{project_id}")
def delete_workbench_project(project_id: str):
    path = _workbench_path(project_id)
    if path.exists():
        path.unlink()
    return ok(True)


@router.get("/workbench/assets")
def list_workbench_assets(project_id: str = Query(..., min_length=1)):
    """列出一个完整工作台项目已上传或引用的素材。"""
    items = _load_workbench_assets(project_id)
    items.sort(key=lambda item: str(item.get("updatedAt") or ""), reverse=True)
    return ok({"items": items, "cursor": None})


@router.post("/workbench/assets/{project_id}/upload")
async def upload_workbench_asset(project_id: str, file: UploadFile = File(...)):
    """把工作台拖入的图片、视频或音频保存到平台上传目录并登记素材。"""
    validate_key(project_id, label="project_id")
    ext = Path(file.filename or "asset").suffix.lower() or ".bin"
    if ext not in _ALLOWED_UPLOAD_EXT:
        raise HTTPException(400, f"不支持的文件类型: {ext}")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(400, "文件超过 50MB 上限")
    asset_id = f"asset_{uuid.uuid4().hex[:16]}"
    filename = f"{asset_id}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    now = _now()
    item = {
        "id": asset_id,
        "name": (file.filename or filename).strip() or filename,
        "data": {
            "url": f"/uploads/canvas/{filename}",
            "contentType": file.content_type or "application/octet-stream",
            "size": len(content),
            "kind": "upload",
        },
        "createdAt": now,
        "updatedAt": now,
        "userId": "agent-studio",
        "projectId": project_id,
    }
    items = _load_workbench_assets(project_id)
    items.insert(0, item)
    _save_workbench_assets(project_id, items)
    return ok(item)


class WorkbenchRemoteAssetReq(BaseModel):
    """登记一个远程素材引用；不由服务端抓取，避免把画布接口变成任意 URL 代理。"""

    url: str
    name: str = ""
    owner_node_id: str | None = Field(None, alias="ownerNodeId")

    model_config = {"populate_by_name": True}


@router.post("/workbench/assets/{project_id}/remote")
def import_workbench_remote_asset(project_id: str, req: WorkbenchRemoteAssetReq):
    """登记浏览器粘贴的远程图片/视频 URL，随项目素材库恢复。"""
    validate_key(project_id, label="project_id")
    url = req.url.strip()
    if not url.startswith(("https://", "http://", "/uploads/")):
        raise HTTPException(400, "远程素材只接受 http(s) 或平台上传地址")
    now = _now()
    asset_id = f"asset_{uuid.uuid4().hex[:16]}"
    item = {
        "id": asset_id,
        "name": req.name.strip() or Path(url.split("?", 1)[0]).name or "远程素材",
        "data": {
            "url": url,
            "kind": "remote",
            "ownerNodeId": req.owner_node_id,
        },
        "createdAt": now,
        "updatedAt": now,
        "userId": "agent-studio",
        "projectId": project_id,
    }
    items = _load_workbench_assets(project_id)
    items.insert(0, item)
    _save_workbench_assets(project_id, items)
    return ok(item)


def _workbench_project_id(value: Any) -> str:
    """把工作台项目 ID 收敛为平台媒体目录可接受的安全名称。"""
    cleaned = "".join(
        character
        for character in str(value or "agent-canvas")
        if character.isalnum() or character in "._-"
    )
    # 媒体服务会把它拼入目录；去掉路径回退片段和前导点，避免 `../` 清洗后仍留下 `..`。
    while ".." in cleaned:
        cleaned = cleaned.replace("..", "-")
    return cleaned.strip(".-_")[:80] or "agent-canvas"


@router.get("/workbench/models")
def list_workbench_models(kind: str = Query("image", pattern="^(image|video)$")):
    """把平台媒体模型目录映射为画布工作台可消费的 catalog。"""
    try:
        models = openrouter_media.list_media_models(kind)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"读取平台 {kind} 模型失败: {exc}") from exc
    now = _now()
    return ok([
        {
            "modelKey": model["id"],
            "vendorKey": "openrouter",
            "modelAlias": model["id"],
            "labelZh": model["name"],
            "kind": kind,
            "enabled": True,
            "meta": {
                "description": model.get("description") or "",
                "inputModalities": model.get("inputModalities") or ["text"],
                "outputModalities": model.get("outputModalities") or [kind],
                "supportedParameters": model.get("supportedParameters") or {},
                "supportedResolutions": model.get("supportedResolutions") or [],
                "supportedAspectRatios": model.get("supportedAspectRatios") or [],
                "recommended": bool(model.get("recommended")),
            },
            "pricing": {"cost": 0, "enabled": True, "specCosts": []},
            "createdAt": now,
            "updatedAt": now,
        }
        for model in models
    ])


class WorkbenchTaskReq(BaseModel):
    """完整工作台的通用媒体任务请求。"""

    vendor: str = "openrouter"
    kind: str
    prompt: str
    width: int | None = None
    height: int | None = None
    extras: dict[str, Any] = Field(default_factory=dict)


@router.post("/workbench/tasks")
def run_workbench_task(req: WorkbenchTaskReq):
    """使用平台模型执行工作台图片任务或提交视频任务。"""
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(400, "提示词不能为空")
    if req.vendor != "openrouter":
        raise HTTPException(400, f"平台暂不支持供应商: {req.vendor}")
    model = str(req.extras.get("modelKey") or "").strip()
    if not model:
        raise HTTPException(400, "请选择模型")
    project_id = _workbench_project_id(req.extras.get("projectId"))
    task_id = f"canvas_{uuid.uuid4().hex[:16]}"
    try:
        if req.kind in ("text_to_image", "image_edit"):
            width = max(256, min(int(req.width or 1024), 4096))
            height = max(256, min(int(req.height or 1536), 4096))
            generated = generate_image_to_local(
                prompt,
                f"openrouter:{model}",
                f"{width}x{height}",
            )
            return ok({
                "id": task_id,
                "kind": req.kind,
                "status": "succeeded",
                "assets": [{"type": "image", "url": generated["url"]}],
                "raw": generated,
                "provenance": {
                    "provider": "openrouter",
                    "modelKey": model,
                    "prompt": prompt,
                    "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
                },
            })
        if req.kind in ("text_to_video", "image_to_video"):
            references = req.extras.get("referenceImages") or []
            first_frame = str(
                req.extras.get("firstFrameUrl")
                or (references[0] if isinstance(references, list) and references else "")
            )
            job = openrouter_media.submit_video(
                project_id,
                model=model,
                prompt=prompt,
                duration=int(req.extras.get("duration") or 5),
                resolution=str(req.extras.get("resolution") or "720p"),
                aspect_ratio=str(req.extras.get("aspectRatio") or "9:16"),
                image_url=first_frame,
                generate_audio=bool(req.extras.get("generateAudio", True)),
            )
            return ok({
                "id": job["id"],
                "kind": req.kind,
                "status": "running",
                "assets": [],
                "raw": {**job, "projectId": project_id},
            })
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        logger.warning("画布媒体任务失败 kind=%s model=%s: %s", req.kind, model, exc)
        raise HTTPException(502, f"画布媒体任务失败: {exc}") from exc
    raise HTTPException(400, f"平台暂不支持任务类型: {req.kind}")


@router.get("/workbench/tasks/{task_id}")
def get_workbench_task(
    task_id: str,
    kind: str = Query("text_to_video"),
    project_id: str = Query("agent-canvas"),
):
    """轮询工作台视频任务，完成后返回已落地的平台 MP4 地址。"""
    try:
        result = openrouter_media.sync_video(_workbench_project_id(project_id), task_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, f"查询画布视频任务失败: {exc}") from exc
    status = str(result.get("status") or "pending")
    normalized_status = (
        "succeeded" if status == "completed"
        else "failed" if status in ("failed", "cancelled")
        else "running"
    )
    assets = (
        [{"type": "video", "url": result["url"]}]
        if normalized_status == "succeeded" and result.get("url")
        else []
    )
    return ok({
        "vendor": "openrouter",
        "result": {
            "id": task_id,
            "kind": kind,
            "status": normalized_status,
            "assets": assets,
            "raw": result,
        },
    })


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
    """把本地图片拖上画布:落盘 uploads/canvas 并返回静态 URL。"""
    _load(cid)
    ext = Path(file.filename or "file").suffix.lower() or ".png"
    if ext not in _ALLOWED_UPLOAD_EXT:
        raise HTTPException(400, f"不支持的文件类型: {ext}")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(400, "文件超过 50MB 上限")
    filename = f"up_{uuid.uuid4().hex[:10]}{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return ok({"url": f"/uploads/canvas/{filename}"})


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
