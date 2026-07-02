"""单次 agent 运行的可观测记录。

以前一次 run 的 trace / token / 成本只随响应返回、跑完即散，事后无法回答
"这次 run 花了多少、为什么走了那条工具链"。本模型把每次 run 落成一条可查记录，
是补 L3"可观测闭环"的落库单元。
"""
from __future__ import annotations

import secrets
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.conversation import AgentInvocationTrace
from app.utils import utcnow as _now


def _generate_run_id() -> str:
    return "run_" + secrets.token_hex(8)


class AgentRunRecord(BaseModel):
    run_id: str = Field(default_factory=_generate_run_id, alias="runId")
    session_id: str = Field("", alias="sessionId")
    employee_key: str = Field("", alias="employeeKey")
    workflow_key: Optional[str] = Field(None, alias="workflowKey")
    model: str = ""
    success: bool = True
    iterations: int = 0
    prompt_tokens: int = Field(0, alias="promptTokens")
    completion_tokens: int = Field(0, alias="completionTokens")
    total_tokens: int = Field(0, alias="totalTokens")
    # 成本单位 USD；无对应模型价目时为 None（token 才是真值，成本可事后按价目换算）
    cost_usd: Optional[float] = Field(None, alias="costUsd")
    elapsed_ms: int = Field(0, alias="elapsedMilliseconds")
    error_message: Optional[str] = Field(None, alias="errorMessage")
    pending_approval: bool = Field(False, alias="pendingApproval")
    traces: list[AgentInvocationTrace] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_now, alias="createdAt")

    model_config = {"populate_by_name": True}
