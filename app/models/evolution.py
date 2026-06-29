"""自我进化系统模型。"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class EvolutionInsight(BaseModel):
    insight_id: str = Field("", alias="insightId")
    employee_key: str = Field("", alias="employeeKey")
    type: Literal["prompt_improve", "new_rule", "skill_suggest", "tool_suggest"] = "prompt_improve"
    title: str = ""
    content: str = ""
    rationale: str = ""
    confidence: float = Field(0.5, alias="confidence")
    status: Literal["pending", "accepted", "rejected"] = "pending"
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    resolved_at: Optional[datetime] = Field(None, alias="resolvedAt")

    model_config = {"populate_by_name": True}


class EvolutionRunLog(BaseModel):
    log_id: str = Field("", alias="logId")
    employee_key: str = Field("", alias="employeeKey")
    ran_at: datetime = Field(default_factory=_now, alias="ranAt")
    sessions_analyzed: int = Field(0, alias="sessionsAnalyzed")
    insights_generated: int = Field(0, alias="insightsGenerated")
    llm_model: str = Field("", alias="llmModel")
    duration_ms: int = Field(0, alias="durationMs")
    error: Optional[str] = None

    model_config = {"populate_by_name": True}
