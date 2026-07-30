"""Agent 对话与运行的核心模型：run 请求/响应、token 用量、调用轨迹、会话与消息。

均为 Pydantic 模型，字段 alias 为 camelCase（对齐 C# 版 API 契约与前端）。
会话由 ConversationMemoryStore（JSON）或 ConversationMemoryDbStore（PG）持久化。
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.utils import utcnow as _now


class AgentRunRequest(BaseModel):
    """一次 agent 运行的入参（POST /api/agent/run 请求体）。

    approval_decision 用于恢复处于待审批状态的会话（approve / reject）。
    """
    employee_key: str = Field(..., alias="employeeKey")
    workflow_key: Optional[str] = Field(None, alias="workflowKey")
    user_input: str = Field(..., alias="userInput")
    extra_context: Optional[str] = Field(None, alias="extraContext")
    # 只参与本次模型请求、不写入会话历史。画布方法论、动态模型清单等大块
    # 运行时上下文应走此字段，避免每轮续聊都把相同内容永久复制一遍。
    transient_context: Optional[str] = Field(None, alias="transientContext")
    structured_schema_json: Optional[str] = Field(None, alias="structuredSchemaJson")
    model_overrides: Optional[dict] = Field(None, alias="modelOverrides")
    session_id: Optional[str] = Field(None, alias="sessionId")
    approval_decision: Optional[str] = Field(None, alias="approvalDecision")
    run_id: Optional[str] = Field(
        None,
        alias="runId",
        pattern=r"^run_[A-Za-z0-9_-]{1,64}$",
    )

    model_config = {"populate_by_name": True}


class PendingApprovalDetail(BaseModel):
    """随 run 响应返回的待审批摘要——告知前端"agent 停在哪个危险动作上等人批"。"""
    description: str = ""
    action_type: str = Field("", alias="actionType")
    requested_at: datetime = Field(default_factory=_now, alias="requestedAt")

    model_config = {"populate_by_name": True}


class AgentTokenUsage(BaseModel):
    """一次运行累计的 token 用量（多轮工具循环求和后的总数）。"""
    prompt_tokens: int = Field(0, alias="promptTokens")
    completion_tokens: int = Field(0, alias="completionTokens")
    total_tokens: int = Field(0, alias="totalTokens")
    cached_prompt_tokens: int = Field(0, alias="cachedPromptTokens")

    model_config = {"populate_by_name": True}


class AgentInvocationTrace(BaseModel):
    """一次工具调用的轨迹（第几轮、调了什么、结果与耗时）——run 记录与工作流步骤共用。"""
    iteration: int = 0
    tool_name: str = Field("", alias="toolName")
    arguments: Optional[str] = None
    result: Optional[str] = None
    success: bool = True
    elapsed_milliseconds: int = Field(0, alias="elapsedMilliseconds")

    model_config = {"populate_by_name": True}


class AgentRunResponse(BaseModel):
    """一次 agent 运行的出参：助手回复、token 用量、工具轨迹、会话 ID、待审批信息等。"""
    run_id: Optional[str] = Field(None, alias="runId")
    assistant_message: str = Field("", alias="assistantMessage")
    cancelled: bool = False
    error_message: Optional[str] = Field(None, alias="errorMessage")
    token_usage: Optional[AgentTokenUsage] = Field(None, alias="tokenUsage")
    traces: list[AgentInvocationTrace] = Field(default_factory=list)
    active_scopes: list[str] = Field(default_factory=list, alias="activeScopes")
    compiled_system_prompt: Optional[str] = Field(None, alias="compiledSystemPrompt")
    auto_invoke_count: int = Field(0, alias="autoInvokeCount")
    session_id: Optional[str] = Field(None, alias="sessionId")
    pending_approval: Optional[PendingApprovalDetail] = Field(None, alias="pendingApproval")
    delegation_stack: Optional[list[str]] = Field(None, alias="delegationStack")
    model_transport: str = Field("", alias="modelTransport")

    model_config = {"populate_by_name": True}


class ConversationMessage(BaseModel):
    """会话中的一条消息（user / assistant / tool），tool_name 仅工具消息携带。"""
    role: str
    content: str
    timestamp: datetime = Field(default_factory=_now)
    tool_name: Optional[str] = Field(None, alias="toolName")

    model_config = {"populate_by_name": True}


class ConversationArtifact(BaseModel):
    """会话产出物（长回复自动抽取的文档/代码块），在工作台右侧独立展示。"""
    artifact_id: str = Field("", alias="artifactId")
    title: str = ""
    kind: str = "document"
    content: str = ""
    source_message_index: int = Field(0, alias="sourceMessageIndex")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")

    model_config = {"populate_by_name": True}


class DeepAgentWorkspaceTodo(BaseModel):
    """DeepAgent 工作区中的一条可见待办。"""
    content: str = ""
    status: str = "pending"


class DeepAgentWorkspaceFile(BaseModel):
    """DeepAgent 虚拟文件的只读摘要；正文通过独立文件接口按需读取。"""
    path: str
    size: int = 0
    kind: str = "workspace"


class DeepAgentWorkspaceView(BaseModel):
    """面向工作台的稳定状态观察：进度、文件索引与安全恢复建议。"""
    status: str = "success"
    summary: str = ""
    next_actions: list[str] = Field(default_factory=list, alias="nextActions")
    artifacts: list[str] = Field(default_factory=list)
    checkpoint_version: Optional[int] = Field(None, alias="checkpointVersion")
    todos: list[DeepAgentWorkspaceTodo] = Field(default_factory=list)
    files: list[DeepAgentWorkspaceFile] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class DeepAgentWorkspaceFileView(BaseModel):
    """工作区单文件正文响应，附带可恢复观察字段。"""
    status: str = "success"
    summary: str = ""
    next_actions: list[str] = Field(default_factory=list, alias="nextActions")
    artifacts: list[str] = Field(default_factory=list)
    path: str
    size: int = 0
    content: str = ""

    model_config = {"populate_by_name": True}


class PendingApprovalInfo(BaseModel):
    """存进会话的待审批完整信息（含原始参数 JSON），恢复运行时由 RequireApprovalHandler 消费。"""
    description: str = ""
    action_type: str = Field("", alias="actionType")
    arguments_json: Optional[str] = Field(None, alias="argumentsJson")
    requested_at: datetime = Field(default_factory=_now, alias="requestedAt")

    model_config = {"populate_by_name": True}


class ConversationSession(BaseModel):
    """一个完整对话会话：消息历史、产出物、压缩摘要、待审批状态。按 session_id 持久化。"""
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
