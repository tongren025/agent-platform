"""运行时快照模型：把注册表定义解析为 agent 执行期实际可见的技能/工具/MCP 视图（按 scope 分组），供 prompt 编译与工具循环消费。"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class RuntimeSkill(BaseModel):
    """运行时技能视图（含来源 binding_code 与树形子技能）。"""
    code: str
    binding_code: str = Field("", alias="bindingCode")
    name: str = ""
    summary: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    sort_order: int = Field(0, alias="sortOrder")
    children: Optional[list[dict]] = None

    model_config = {"populate_by_name": True}


class RuntimeTool(BaseModel):
    """运行时工具视图（input_schema 为 JSON Schema 字符串）。"""
    tool_code: str = Field("", alias="toolCode")
    binding_code: str = Field("", alias="bindingCode")
    name: str = ""
    description: Optional[str] = None
    input_schema: Optional[str] = Field(None, alias="inputSchema")
    sort_order: int = Field(0, alias="sortOrder")

    model_config = {"populate_by_name": True}


class RuntimeMcpServer(BaseModel):
    """运行时 MCP 服务器视图（stdio/http 连接参数）。"""
    server_code: str = Field("", alias="serverCode")
    binding_code: str = Field("", alias="bindingCode")
    name: str = ""
    description: Optional[str] = None
    transport_type: str = Field("stdio", alias="transportType")
    command: Optional[str] = None
    command_args: Optional[list[str]] = Field(None, alias="commandArgs")
    url: Optional[str] = None
    env: Optional[dict[str, str]] = None
    sort_order: int = Field(0, alias="sortOrder")

    model_config = {"populate_by_name": True}


class TeamMemberSummary(BaseModel):
    """队友摘要：注入提示词让 agent 知道可以委派给谁。"""
    employee_key: str = Field("", alias="employeeKey")
    name: str = ""
    description: Optional[str] = None
    role_profile_summary: Optional[str] = Field(None, alias="roleProfileSummary")

    model_config = {"populate_by_name": True}


class EmployeeRuntimeSnapshot(BaseModel):
    """员工运行时快照：system prompt 块 + 按 scope 分组的技能/工具/MCP + 模型策略 + 团队上下文。由 snapshot.load_snapshot() 构建。"""
    employee_key: str = Field("", alias="employeeKey")
    system_prompt_block: Optional[str] = None
    skills_by_scope: dict[str, list[RuntimeSkill]] = Field(default_factory=dict)
    skill_trees_by_scope: dict[str, list[RuntimeSkill]] = Field(default_factory=dict)
    tools_by_scope: dict[str, list[RuntimeTool]] = Field(default_factory=dict)
    mcp_by_scope: dict[str, list[RuntimeMcpServer]] = Field(default_factory=dict)
    default_model_policy: dict = Field(default_factory=dict)
    deep_agent: bool = False
    team_code: Optional[str] = None
    team_members: list[TeamMemberSummary] = Field(default_factory=list)
    has_knowledge_base: bool = False

    model_config = {"populate_by_name": True}


class PromptCompileResult(BaseModel):
    """prompt 编译产物：最终 system prompt、响应指令、生效 scope 与可见工具集。"""
    system_prompt: str = ""
    response_instruction: str = ""
    active_scopes: list[str] = Field(default_factory=list)
    resolved_model_config: dict = Field(default_factory=dict)
    visible_skills: list[RuntimeSkill] = Field(default_factory=list)
    visible_skill_trees: list[RuntimeSkill] = Field(default_factory=list)
    visible_tools: list[RuntimeTool] = Field(default_factory=list)
    visible_mcp_servers: list[RuntimeMcpServer] = Field(default_factory=list)
