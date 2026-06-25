"""
DIFY 式工作流编排引擎的数据模型。

- WorkflowDefinition：一张有向无环图（DAG），节点 + 边。复用 RegistryEntity 文件存储。
- WorkflowNode：一个类型化节点（start/agent/condition/template/tool/knowledge/end），
  类型相关配置放在 loose 的 config dict 里（仿 EmployeeDefinition.default_model_policy 的松散风格，避免模型爆炸）。
- WorkflowEdge：一条有向边，source_handle 用于 condition 节点的分支标签。
- WorkflowRun / NodeStepResult：一次运行的结果与逐节点明细（复用 AgentInvocationTrace）。
"""
from __future__ import annotations

import secrets
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.conversation import AgentInvocationTrace
from app.models.registry import RegistryEntity
from app.utils import utcnow as _now


def _gen_run_id() -> str:
    return "wfr_" + secrets.token_hex(8)


class WorkflowNode(BaseModel):
    node_key: str = Field("", alias="nodeKey")
    type: str = ""  # start | agent | condition | template | tool | knowledge | end
    name: str = ""
    # 画布坐标，仅前端使用，引擎忽略
    position: dict = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    # 类型相关配置（松散 dict）：
    #   agent     -> {employeeKey, userInputTemplate, structuredSchemaJson?, onError?}
    #   condition -> {cases:[{label, var, op, value}], elseLabel}
    #   template  -> {template}
    #   tool      -> {toolCode, argsTemplate}
    #   knowledge -> {employeeKey, queryTemplate, topK}
    #   start     -> {inputs:[{name, label, required}]}
    #   end       -> {outputTemplate}
    config: dict = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "extra": "allow"}

    def get_key(self) -> str:
        return self.node_key


class WorkflowEdge(BaseModel):
    edge_id: str = Field("", alias="edgeId")
    source: str = ""  # 源节点 node_key
    target: str = ""  # 目标节点 node_key
    # condition 节点的分支标签；普通边为 None（激活全部出边）
    source_handle: Optional[str] = Field(None, alias="sourceHandle")

    model_config = {"populate_by_name": True, "extra": "allow"}


class WorkflowDefinition(RegistryEntity):
    workflow_key: str = Field("", alias="workflowKey")
    name: str = ""
    description: Optional[str] = None
    team_code: Optional[str] = Field(None, alias="teamCode")
    nodes: list[WorkflowNode] = Field(default_factory=list)
    edges: list[WorkflowEdge] = Field(default_factory=list)
    enabled: bool = True
    owner_user_id: Optional[str] = Field(None, alias="ownerUserId")

    def get_key(self) -> str:
        return self.workflow_key


class NodeStepResult(BaseModel):
    node_key: str = Field("", alias="nodeKey")
    type: str = ""
    status: str = "pending"  # pending | running | success | failed | skipped
    output: Optional[str] = None
    error: Optional[str] = None
    elapsed_ms: int = Field(0, alias="elapsedMs")
    traces: list[AgentInvocationTrace] = Field(default_factory=list)
    prompt_tokens: int = Field(0, alias="promptTokens")
    completion_tokens: int = Field(0, alias="completionTokens")

    model_config = {"populate_by_name": True, "extra": "allow"}


class WorkflowRun(BaseModel):
    run_id: str = Field(default_factory=_gen_run_id, alias="runId")
    workflow_key: str = Field("", alias="workflowKey")
    status: str = "running"  # running | success | failed | timeout
    inputs: dict = Field(default_factory=dict)
    # 最终各节点输出快照（node_key -> {field: value}），仅用于回看与调试
    variables: dict = Field(default_factory=dict)
    steps: list[NodeStepResult] = Field(default_factory=list)
    final_output: Optional[str] = Field(None, alias="finalOutput")
    error: Optional[str] = None
    total_prompt_tokens: int = Field(0, alias="totalPromptTokens")
    total_completion_tokens: int = Field(0, alias="totalCompletionTokens")
    started_at: datetime = Field(default_factory=_now, alias="startedAt")
    finished_at: Optional[datetime] = Field(None, alias="finishedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}
