"""
长期记忆模型，灵感来自 LangMem 概念框架。

三层记忆：
- SemanticMemory（语义记忆）：从对话中提取的事实、偏好、知识
- EpisodicMemory（经验记忆）：成功交互模式，observation → action → result
- ProceduralMemory（行为记忆）：习得的行为规则，用于演进系统提示词
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class SemanticMemory(BaseModel):
    """语义记忆：事实与偏好。对应 LangMem 的 Semantic Memory (Collections)。"""
    memory_id: str = Field("", alias="memoryId")
    employee_key: str = Field("", alias="employeeKey")
    content: str = ""
    category: str = ""  # preference | fact | knowledge | context
    importance: float = Field(0.5, alias="importance")  # 0~1
    source_session: str = Field("", alias="sourceSession")
    access_count: int = Field(0, alias="accessCount")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    last_accessed: Optional[datetime] = Field(None, alias="lastAccessed")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "ignore"}


class EpisodicMemory(BaseModel):
    """经验记忆：成功交互模式。对应 LangMem 的 Episodic Memory。"""
    memory_id: str = Field("", alias="memoryId")
    employee_key: str = Field("", alias="employeeKey")
    observation: str = ""
    action: str = ""
    result: str = ""
    success_score: float = Field(0.0, alias="successScore")  # 0~1
    source_session: str = Field("", alias="sourceSession")
    access_count: int = Field(0, alias="accessCount")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    last_accessed: Optional[datetime] = Field(None, alias="lastAccessed")

    model_config = {"populate_by_name": True, "extra": "ignore"}


class ProceduralMemory(BaseModel):
    """行为记忆：习得的行为规则。对应 LangMem 的 Procedural Memory。"""
    memory_id: str = Field("", alias="memoryId")
    employee_key: str = Field("", alias="employeeKey")
    rule: str = ""
    rationale: str = ""  # 为什么学到这条规则
    confidence: float = Field(0.5, alias="confidence")  # 0~1
    activation_count: int = Field(0, alias="activationCount")
    source_session: str = Field("", alias="sourceSession")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "ignore"}


class MemoryExtractionResult(BaseModel):
    """一次记忆提取的结果。"""
    semantic: list[SemanticMemory] = Field(default_factory=list)
    episodic: list[EpisodicMemory] = Field(default_factory=list)
    procedural: list[ProceduralMemory] = Field(default_factory=list)
    session_id: str = Field("", alias="sessionId")
    extracted_at: datetime = Field(default_factory=_now, alias="extractedAt")

    model_config = {"populate_by_name": True}
