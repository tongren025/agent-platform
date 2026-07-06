"""Deep Dream 记忆蒸馏模型。"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class DistillationAction(BaseModel):
    """蒸馏产生的单个动作：merge 合并 / prune 剪除 / adjust 调整某条记忆。"""
    action: Literal["merge", "prune", "adjust"] = "adjust"
    memory_type: Literal["semantic", "episodic", "procedural"] = "semantic"
    target_id: str = Field("", alias="targetId")
    merge_into_id: Optional[str] = Field(None, alias="mergeIntoId")
    new_content: Optional[str] = Field(None, alias="newContent")
    new_importance: Optional[float] = Field(None, alias="newImportance")
    reason: str = ""

    model_config = {"populate_by_name": True}


class DistillationLog(BaseModel):
    """一次 Deep Dream 蒸馏运行的日志：执行了哪些动作、前后记忆数量对比、耗时。"""
    log_id: str = Field("", alias="logId")
    employee_key: str = Field("", alias="employeeKey")
    ran_at: datetime = Field(default_factory=_now, alias="ranAt")
    actions: list[DistillationAction] = Field(default_factory=list)
    before_counts: dict[str, int] = Field(default_factory=dict, alias="beforeCounts")
    after_counts: dict[str, int] = Field(default_factory=dict, alias="afterCounts")
    llm_model: str = Field("", alias="llmModel")
    duration_ms: int = Field(0, alias="durationMs")
    error: Optional[str] = None

    model_config = {"populate_by_name": True}
