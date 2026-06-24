"""
工作流运行记录的文件型持久化存储。

按 workflow_key 分文件：data/workflow-runs/<workflow_key>.json，保留最近 N 条（最新在前）。
采用原子写（tmp + os.replace）——FileJsonRegistry.save 用的是普通 write_text 非原子，
而运行记录会在每个节点完成后增量落盘（崩溃可恢复进度），所以这里必须原子写，
直接拷 scrape_store.py 的实现。
"""
from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path

from app.config import BASE_DIR, settings
from app.models.workflow import WorkflowRun

logger = logging.getLogger(__name__)

_BAD_KEY_RE = re.compile(r"[/\\]|\.\.")
_MAX_RUNS = 50


def _sanitize(key: str) -> str:
    if not key or _BAD_KEY_RE.search(key):
        raise ValueError(f"Invalid key: {key!r}")
    return key


def _atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp{os.getpid()}")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


class WorkflowRunStore:
    def __init__(self) -> None:
        self._dir = BASE_DIR / settings.workflow.run_dir
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, workflow_key: str) -> Path:
        return self._dir / f"{_sanitize(workflow_key)}.json"

    def list(self, workflow_key: str) -> list[WorkflowRun]:
        fp = self._path(workflow_key)
        if not fp.exists():
            return []
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            return [WorkflowRun.model_validate(d) for d in raw]
        except Exception:
            logger.warning("Failed to load workflow runs %s", fp, exc_info=True)
            return []

    def get(self, workflow_key: str, run_id: str) -> WorkflowRun | None:
        for r in self.list(workflow_key):
            if r.run_id == run_id:
                return r
        return None

    def save(self, run: WorkflowRun) -> None:
        """插入或更新一条运行记录（按 run_id 去重），最新在前，封顶 _MAX_RUNS。

        运行期间会被多次调用（每个节点完成后增量落盘），所以按 run_id upsert。
        """
        items = self.list(run.workflow_key)
        items = [r for r in items if r.run_id != run.run_id]
        items.insert(0, run)
        items = items[:_MAX_RUNS]
        data = [it.model_dump(by_alias=True, mode="json") for it in items]
        _atomic_write(self._path(run.workflow_key), json.dumps(data, ensure_ascii=False, indent=2))

    def delete_all(self, workflow_key: str) -> None:
        fp = self._path(workflow_key)
        try:
            if fp.exists():
                fp.unlink()
        except OSError:
            logger.warning("删除工作流运行记录失败：%s", fp, exc_info=True)
