from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class RegistryEntity(BaseModel):
    sort_order: int = Field(0, alias="sortOrder")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}

    def get_key(self) -> str:
        raise NotImplementedError


class SkillDefinition(RegistryEntity):
    code: str = ""
    name: str = ""
    binding_code: Optional[str] = Field(None, alias="bindingCode")
    summary: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    is_tree: bool = Field(False, alias="isTree")
    children: Optional[list[dict]] = None

    def get_key(self) -> str:
        return self.code


class McpServerDefinition(RegistryEntity):
    server_code: str = Field("", alias="serverCode")
    name: str = ""
    transport_type: str = Field("stdio", alias="transportType")
    command: Optional[str] = None
    command_args: Optional[list[str]] = Field(None, alias="commandArgs")
    url: Optional[str] = None
    env: Optional[dict[str, str]] = None
    description: Optional[str] = None

    def get_key(self) -> str:
        return self.server_code


class ToolDefinition(RegistryEntity):
    tool_code: str = Field("", alias="toolCode")
    name: str = ""
    binding_code: Optional[str] = Field(None, alias="bindingCode")
    description: Optional[str] = None
    input_schema: Optional[str] = Field(None, alias="inputSchema")

    def get_key(self) -> str:
        return self.tool_code


class EmployeeDefinition(RegistryEntity):
    employee_key: str = Field("", alias="employeeKey")
    name: str = ""
    role_profile: str = Field("", alias="roleProfile")
    deep_agent: bool = Field(False, alias="deepAgent")
    default_model_policy: dict = Field(default_factory=dict, alias="defaultModelPolicy")
    skill_refs: Optional[list[str]] = Field(None, alias="skillRefs")
    tool_refs: Optional[list[str]] = Field(None, alias="toolRefs")
    mcp_server_refs: Optional[list[str]] = Field(None, alias="mcpServerRefs")
    team_code: Optional[str] = Field(None, alias="teamCode")
    template_code: Optional[str] = Field(None, alias="templateCode")
    has_knowledge_base: bool = Field(False, alias="hasKnowledgeBase")
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    tags: list[str] = Field(default_factory=list)
    enabled: bool = True
    source: str = "user"
    owner_user_id: Optional[str] = Field(None, alias="ownerUserId")

    def get_key(self) -> str:
        return self.employee_key


class TeamRole(BaseModel):
    employee_key: str = Field("", alias="employeeKey")
    stage: str = ""          # 阶段分组（如 创作 / 设计 / 生成），仅展示用
    order: int = 0           # 同阶段内排序

    model_config = {"populate_by_name": True, "extra": "allow"}


class TeamDefinition(RegistryEntity):
    team_code: str = Field("", alias="teamCode")
    name: str = ""
    member_employee_keys: list[str] = Field(default_factory=list, alias="memberEmployeeKeys")
    default_employee_key: Optional[str] = Field(None, alias="defaultEmployeeKey")
    owner_user_id: Optional[str] = Field(None, alias="ownerUserId")
    # ── 新增：让团队有真实结构（此前队长/阶段全靠前端按 tag 猜）──────────
    leader_employee_key: Optional[str] = Field(None, alias="leaderEmployeeKey")
    description: Optional[str] = None
    # 有序角色（阶段 + 排序）——阶段流转的真实数据来源，替代前端 tag 关键词匹配
    roles: Optional[list[TeamRole]] = None
    # 团队的默认编排工作流（显式「流转」路径；委派仍作为临时兜底）
    default_workflow_key: Optional[str] = Field(None, alias="defaultWorkflowKey")

    def get_key(self) -> str:
        return self.team_code


class RoleTemplateDefinition(RegistryEntity):
    template_code: str = Field("", alias="templateCode")
    name: str = ""
    category: str = ""
    description: Optional[str] = None
    role_profile: str = Field("", alias="roleProfile")
    deep_agent: bool = Field(False, alias="deepAgent")
    default_model_policy: dict = Field(default_factory=dict, alias="defaultModelPolicy")
    suggested_skill_codes: list[str] = Field(default_factory=list, alias="suggestedSkillCodes")
    suggested_tool_codes: list[str] = Field(default_factory=list, alias="suggestedToolCodes")
    suggested_mcp_server_codes: list[str] = Field(default_factory=list, alias="suggestedMcpServerCodes")
    tags: list[str] = Field(default_factory=list)
    icon: Optional[str] = None
    source: str = "system"

    def get_key(self) -> str:
        return self.template_code
