from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class AgentRunRequest(BaseModel):
    employee_key: str = Field(..., alias="employeeKey")
    workflow_key: Optional[str] = Field(None, alias="workflowKey")
    user_input: str = Field(..., alias="userInput")
    extra_context: Optional[str] = Field(None, alias="extraContext")
    structured_schema_json: Optional[str] = Field(None, alias="structuredSchemaJson")
    model_overrides: Optional[dict] = Field(None, alias="modelOverrides")
    session_id: Optional[str] = Field(None, alias="sessionId")
    approval_decision: Optional[str] = Field(None, alias="approvalDecision")

    model_config = {"populate_by_name": True}


class PendingApprovalDetail(BaseModel):
    description: str = ""
    action_type: str = Field("", alias="actionType")
    requested_at: datetime = Field(default_factory=_now, alias="requestedAt")

    model_config = {"populate_by_name": True}


class AgentTokenUsage(BaseModel):
    prompt_tokens: int = Field(0, alias="promptTokens")
    completion_tokens: int = Field(0, alias="completionTokens")
    total_tokens: int = Field(0, alias="totalTokens")

    model_config = {"populate_by_name": True}


class AgentInvocationTrace(BaseModel):
    iteration: int = 0
    tool_name: str = Field("", alias="toolName")
    arguments: Optional[str] = None
    result: Optional[str] = None
    success: bool = True
    elapsed_milliseconds: int = Field(0, alias="elapsedMilliseconds")

    model_config = {"populate_by_name": True}


class AgentRunResponse(BaseModel):
    assistant_message: str = Field("", alias="assistantMessage")
    token_usage: Optional[AgentTokenUsage] = Field(None, alias="tokenUsage")
    traces: list[AgentInvocationTrace] = Field(default_factory=list)
    active_scopes: list[str] = Field(default_factory=list, alias="activeScopes")
    compiled_system_prompt: Optional[str] = Field(None, alias="compiledSystemPrompt")
    auto_invoke_count: int = Field(0, alias="autoInvokeCount")
    session_id: Optional[str] = Field(None, alias="sessionId")
    pending_approval: Optional[PendingApprovalDetail] = Field(None, alias="pendingApproval")
    delegation_stack: Optional[list[str]] = Field(None, alias="delegationStack")

    model_config = {"populate_by_name": True}


class ConversationMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=_now)
    tool_name: Optional[str] = Field(None, alias="toolName")

    model_config = {"populate_by_name": True}


class ConversationArtifact(BaseModel):
    artifact_id: str = Field("", alias="artifactId")
    title: str = ""
    kind: str = "document"
    content: str = ""
    source_message_index: int = Field(0, alias="sourceMessageIndex")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")

    model_config = {"populate_by_name": True}


class PendingApprovalInfo(BaseModel):
    description: str = ""
    action_type: str = Field("", alias="actionType")
    arguments_json: Optional[str] = Field(None, alias="argumentsJson")
    requested_at: datetime = Field(default_factory=_now, alias="requestedAt")

    model_config = {"populate_by_name": True}


class ConversationSession(BaseModel):
    session_id: str = Field("", alias="sessionId")
    employee_key: str = Field("", alias="employeeKey")
    target_type: str = Field("employee", alias="targetType")
    team_code: Optional[str] = Field(None, alias="teamCode")
    title: str = ""
    archived: bool = False
    messages: list[ConversationMessage] = Field(default_factory=list)
    artifacts: list[ConversationArtifact] = Field(default_factory=list)
    compressed_summary: Optional[str] = Field(None, alias="compressedSummary")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    last_active_at: datetime = Field(default_factory=_now, alias="lastActiveAt")
    metadata: dict = Field(default_factory=dict)
    pending_approval: Optional[PendingApprovalInfo] = Field(None, alias="pendingApproval")

    model_config = {"populate_by_name": True}
