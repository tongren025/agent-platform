"""常用指令 API：按当前登录账号隔离保存工作台快捷短语。"""
from __future__ import annotations

import hashlib
import json
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

from app.config import BASE_DIR


router = APIRouter(
    prefix="/api/v1/agentapp/quick-prompts",
    tags=["quick-prompts"],
)
DATA_DIR = BASE_DIR / "data" / "quick-prompts"
_USER_LOCKS: dict[str, threading.RLock] = {}
_USER_LOCKS_GUARD = threading.Lock()


def _now() -> str:
    """返回统一 UTC 时间戳。"""
    return datetime.now(timezone.utc).isoformat()


def _username(request: Request) -> str:
    """读取鉴权中间件注入的账号；缺失时拒绝落入共享文件。"""
    username = str(getattr(request.state, "username", "") or "").strip()
    if not username:
        raise HTTPException(401, "未登录或缺少账号信息")
    return username


def _user_file(username: str) -> Path:
    """用户名只参与哈希，不直接进入路径，杜绝账号名路径穿越。"""
    digest = hashlib.sha256(username.encode("utf-8")).hexdigest()
    return DATA_DIR / f"{digest}.json"


def _user_lock(username: str) -> threading.RLock:
    """返回账号级进程内重入锁，保护快捷指令读-改-写。"""
    with _USER_LOCKS_GUARD:
        lock = _USER_LOCKS.get(username)
        if lock is None:
            lock = threading.RLock()
            _USER_LOCKS[username] = lock
        return lock


def _load_prompts(username: str) -> list[dict]:
    """读取一个账号的指令列表。"""
    path = _user_file(username)
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text("utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "常用指令数据损坏") from exc
    if not isinstance(payload, list):
        raise HTTPException(500, "常用指令数据格式错误")
    return [item for item in payload if isinstance(item, dict)]


def _save_prompts(username: str, prompts: list[dict]) -> None:
    """原子写回一个账号的全部指令。"""
    path = _user_file(username)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(
            json.dumps(prompts, ensure_ascii=False, indent=2),
            "utf-8",
        )
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)


class CreateQuickPromptReq(BaseModel):
    """新建常用指令请求。"""
    title: str = Field(max_length=80)
    content: str = Field(max_length=10000)
    employee_key: str = Field(default="", max_length=160)


class UpdateQuickPromptReq(BaseModel):
    """修改常用指令请求；只更新显式传入字段。"""
    title: str | None = Field(default=None, max_length=80)
    content: str | None = Field(default=None, max_length=10000)
    employee_key: str | None = Field(default=None, max_length=160)


@router.get("")
def list_quick_prompts(
    request: Request,
    employee_key: str | None = Query(default=None),
):
    """列出当前账号的常用指令，可按数字员工筛选。"""
    username = _username(request)
    with _user_lock(username):
        prompts = _load_prompts(username)
        if employee_key is not None:
            prompts = [
                item for item in prompts
                if item.get("employee_key", "") == employee_key
            ]
    return {
        "code": 200,
        "data": sorted(
            prompts,
            key=lambda item: item.get("updated_at", ""),
            reverse=True,
        ),
    }


@router.post("")
def create_quick_prompt(req: CreateQuickPromptReq, request: Request):
    """给当前账号保存一条常用指令。"""
    title = req.title.strip()
    content = req.content.strip()
    if not title:
        raise HTTPException(400, "指令标题不能为空")
    if not content:
        raise HTTPException(400, "指令内容不能为空")
    username = _username(request)
    with _user_lock(username):
        prompts = _load_prompts(username)
        now = _now()
        item = {
            "id": uuid.uuid4().hex[:12],
            "title": title,
            "content": content,
            "employee_key": req.employee_key.strip(),
            "created_at": now,
            "updated_at": now,
        }
        prompts.append(item)
        _save_prompts(username, prompts)
    return {"code": 200, "data": item}


@router.put("/{prompt_id}")
def update_quick_prompt(
    prompt_id: str,
    req: UpdateQuickPromptReq,
    request: Request,
):
    """修改当前账号的一条常用指令，无法访问其他账号的同名资源。"""
    username = _username(request)
    with _user_lock(username):
        prompts = _load_prompts(username)
        item = next((entry for entry in prompts if entry.get("id") == prompt_id), None)
        if item is None:
            raise HTTPException(404, "常用指令不存在")
        provided = req.model_fields_set
        if not provided:
            raise HTTPException(400, "至少提供一个要修改的字段")
        changed = False
        if "title" in provided and req.title is not None:
            title = req.title.strip()
            if not title:
                raise HTTPException(400, "指令标题不能为空")
            if title != item.get("title"):
                item["title"] = title
                changed = True
        if "content" in provided and req.content is not None:
            content = req.content.strip()
            if not content:
                raise HTTPException(400, "指令内容不能为空")
            if content != item.get("content"):
                item["content"] = content
                changed = True
        if "employee_key" in provided and req.employee_key is not None:
            employee_key = req.employee_key.strip()
            if employee_key != item.get("employee_key", ""):
                item["employee_key"] = employee_key
                changed = True
        if changed:
            item["updated_at"] = _now()
            _save_prompts(username, prompts)
    return {"code": 200, "data": item}


@router.delete("/{prompt_id}")
def delete_quick_prompt(prompt_id: str, request: Request):
    """删除当前账号的一条常用指令。"""
    username = _username(request)
    with _user_lock(username):
        prompts = _load_prompts(username)
        kept = [item for item in prompts if item.get("id") != prompt_id]
        if len(kept) == len(prompts):
            raise HTTPException(404, "常用指令不存在")
        _save_prompts(username, kept)
    return {"code": 200, "data": {"deleted": prompt_id}}
