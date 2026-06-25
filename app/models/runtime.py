from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class RuntimeSkill(BaseModel):
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
    tool_code: str = Field("", alias="toolCode")
    binding_code: str = Field("", alias="bindingCode")
    name: str = ""
    description: Optional[str] = None
    input_schema: Optional[str] = Field(None, alias="inputSchema")
    sort_order: int = Field(0, alias="sortOrder")

    model_config = {"populate_by_name": True}


class RuntimeMcpServer(BaseModel):
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
    employee_key: str = Field("", alias="employeeKey")
    name: str = ""
    description: Optional[str] = None
    role_profile_summary: Optional[str] = Field(None, alias="roleProfileSummary")

    model_config = {"populate_by_name": True}


class EmployeeRuntimeSnapshot(BaseModel):
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
    system_prompt: str = ""
    response_instruction: str = ""
    active_scopes: list[str] = Field(default_factory=list)
    resolved_model_config: dict = Field(default_factory=dict)
    visible_skills: list[RuntimeSkill] = Field(default_factory=list)
    visible_skill_trees: list[RuntimeSkill] = Field(default_factory=list)
    visible_tools: list[RuntimeTool] = Field(default_factory=list)
    visible_mcp_servers: list[RuntimeMcpServer] = Field(default_factory=list)
