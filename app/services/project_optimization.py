"""项目问题修复运行记录与进程内并发控制。

默认以项目目录里的 JSON 保存最近运行，不依赖数据库或 Redis。单机单用户部署可直接
使用；未来多进程部署时可在保持 API 契约不变的前提下替换共享控制器。
"""
from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any


class ProjectOptimizationControl:
    """同一项目一次只允许一个自动修复，避免重复覆盖同一生产槽位。"""

    def __init__(self) -> None:
        self._active: set[str] = set()
        self._lock = threading.Lock()

    def begin(self, project_id: str) -> bool:
        with self._lock:
            if project_id in self._active:
                return False
            self._active.add(project_id)
            return True

    def finish(self, project_id: str) -> None:
        with self._lock:
            self._active.discard(project_id)

    def is_active(self, project_id: str) -> bool:
        with self._lock:
            return project_id in self._active


optimization_control = ProjectOptimizationControl()


def _history_path(project_dir: Path) -> Path:
    return project_dir / "optimization-runs.json"


def list_optimization_runs(project_dir: Path, limit: int = 30) -> list[dict[str, Any]]:
    """读取最近的自动修复记录；文件不存在时返回空列表。"""
    path = _history_path(project_dir)
    if not path.exists():
        return []
    payload = json.loads(path.read_text("utf-8"))
    if not isinstance(payload, list):
        raise ValueError("optimization-runs.json 必须是 JSON 数组")
    safe_limit = max(1, min(limit, 100))
    return list(reversed(payload[-safe_limit:]))


def append_optimization_run(project_dir: Path, record: dict[str, Any]) -> None:
    """原子追加修复记录，并只保留最近 100 次运行。"""
    path = _history_path(project_dir)
    current = list(reversed(list_optimization_runs(project_dir, 100)))
    current.append(record)
    current = current[-100:]
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(
            json.dumps(current, ensure_ascii=False, indent=2),
            "utf-8",
        )
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)
