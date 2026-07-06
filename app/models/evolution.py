"""自我进化系统模型。"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class EvolutionInsight(BaseModel):
    """自我进化产出的一条洞察（提示词改进/新规则/技能建议/工具建议），由人工 accept/reject。"""
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
    """一次进化分析运行的日志：分析了几个会话、产出几条洞察、耗时。"""
    log_id: str = Field("", alias="logId")
    employee_key: str = Field("", alias="employeeKey")
    ran_at: datetime = Field(default_factory=_now, alias="ranAt")
    sessions_analyzed: int = Field(0, alias="sessionsAnalyzed")
    insights_generated: int = Field(0, alias="insightsGenerated")
    llm_model: str = Field("", alias="llmModel")
    duration_ms: int = Field(0, alias="durationMs")
    error: Optional[str] = None

    model_config = {"populate_by_name": True}
