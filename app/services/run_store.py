"""agent 运行记录存储 —— 每次 run 一份 JSON，供事后审计成本与行为。

沿用 ConversationMemoryStore 的约定：BASE_DIR 下一目录、一记录一文件、
pydantic model_dump(by_alias) / model_validate 落盘与回读。
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from app.config import BASE_DIR, settings
from app.models.run_record import AgentRunRecord
from app.services.registry import _normalize_keys

logger = logging.getLogger(__name__)


def estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float | None:
    """按配置的价目估算一次调用的美元成本；无对应价目时返回 None。

    价目来自 appsettings.json 的 "modelPrices" 段
    （model_id -> {"promptPer1k": x, "completionPer1k": y}，单位 USD）。
    默认空——填了才算，token 才是真值。
    """
    price = settings.model_prices.get(model)
    if not price:
        return None
    prompt_per_1k = float(price.get("promptPer1k", 0) or 0)
    completion_per_1k = float(price.get("completionPer1k", 0) or 0)
    return round(
        prompt_tokens / 1000 * prompt_per_1k + completion_tokens / 1000 * completion_per_1k,
        6,
    )


class AgentRunStore:

    def __init__(self, run_dir: str | None = None) -> None:
        self._dir = BASE_DIR / (run_dir or settings.agent.run_record_dir)
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path_for(self, run_id: str) -> Path:
        return self._dir / f"{run_id}.json"

    def save_run(self, record: AgentRunRecord) -> None:
        self._dir.mkdir(parents=True, exist_ok=True)
        data = record.model_dump(by_alias=True, mode="json")
        self._path_for(record.run_id).write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def load_run(self, run_id: str) -> AgentRunRecord | None:
        fp = self._path_for(run_id)
        if not fp.exists():
            return None
        try:
            data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
            return AgentRunRecord.model_validate(data)
        except Exception:
            logger.warning("Failed to load run %s", fp, exc_info=True)
            return None

    def list_runs(
        self,
        employee_key: str | None = None,
        session_id: str | None = None,
        success: bool | None = None,
        limit: int = 50,
    ) -> list[AgentRunRecord]:
        if not self._dir.exists():
            return []

        runs: list[AgentRunRecord] = []
        for fp in self._dir.glob("run_*.json"):
            try:
                data = _normalize_keys(json.loads(fp.read_text(encoding="utf-8")))
                r = AgentRunRecord.model_validate(data)
            except Exception:
                logger.warning("Skipping corrupt run file %s", fp, exc_info=True)
                continue
            if employee_key and r.employee_key != employee_key:
                continue
            if session_id and r.session_id != session_id:
                continue
            if success is not None and r.success != success:
                continue
            runs.append(r)

        runs.sort(key=lambda r: r.created_at, reverse=True)
        return runs[:limit]
