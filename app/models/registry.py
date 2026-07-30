"""注册表数据模型：技能/工具/MCP/员工/团队/角色模板的定义。均为 JSON 文件存储（刻意保留——静态配置），camelCase alias 对齐前端。"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def _now() -> datetime:
    """UTC 当前时间工厂（默认值用）。"""
    return datetime.now(timezone.utc)


class RegistryEntity(BaseModel):
    """注册表实体基类：排序 + 创建/更新时间；子类实现 get_key() 提供文件名主键。"""
    sort_order: int = Field(0, alias="sortOrder")
    created_at: datetime = Field(default_factory=_now, alias="createdAt")
    updated_at: datetime = Field(default_factory=_now, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}

    def get_key(self) -> str:
        """注册表主键，子类必须实现（决定 JSON 文件名）。"""
        raise NotImplementedError


class SkillDefinition(RegistryEntity):
    """技能定义：支持 JSON 技能与只读 SKILL.md 包，并可声明工具/MCP/技能依赖。"""
    code: str = ""
    name: str = ""
    binding_code: Optional[str] = Field(None, alias="bindingCode")
    summary: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    is_tree: bool = Field(False, alias="isTree")
    children: Optional[list[dict]] = None
    source_type: str = Field("json", alias="sourceType")
    skill_path: Optional[str] = Field(None, alias="skillPath")
    tool_dependencies: list[str] = Field(
        default_factory=list,
        alias="toolDependencies",
    )
    mcp_dependencies: list[str] = Field(
        default_factory=list,
        alias="mcpDependencies",
    )
    skill_dependencies: list[str] = Field(
        default_factory=list,
        alias="skillDependencies",
    )

    def get_key(self) -> str:
        """注册表主键：code。"""
        return self.code


class McpServerDefinition(RegistryEntity):
    """MCP 服务器定义：stdio（command+args）或 http（url）两种接入方式。"""
    server_code: str = Field("", alias="serverCode")
    name: str = ""
    transport_type: str = Field("stdio", alias="transportType")
    command: Optional[str] = None
    command_args: Optional[list[str]] = Field(None, alias="commandArgs")
    url: Optional[str] = None
    env: Optional[dict[str, str]] = None
    headers: Optional[dict[str, str]] = None
    auth_type: str = Field("none", alias="authType")
    oauth_scope: Optional[str] = Field(None, alias="oauthScope")
    description: Optional[str] = None

    def get_key(self) -> str:
        """注册表主键：server_code。"""
        return self.server_code


class ToolDefinition(RegistryEntity):
    """工具定义：暴露给 agent 的函数调用（input_schema 为 JSON Schema 字符串）。"""
    tool_code: str = Field("", alias="toolCode")
    name: str = ""
    binding_code: Optional[str] = Field(None, alias="bindingCode")
    description: Optional[str] = None
    input_schema: Optional[str] = Field(None, alias="inputSchema")

    def get_key(self) -> str:
        """注册表主键：tool_code。"""
        return self.tool_code


class EmployeeDefinition(RegistryEntity):
    """数字员工定义：角色画像 + 模型策略 + 技能/工具/MCP 绑定 + 团队归属。"""
    employee_key: str = Field("", alias="employeeKey")
    name: str = ""
    role_profile: str = Field("", alias="roleProfile")
    deep_agent: bool = Field(False, alias="deepAgent")
    default_model_policy: dict = Field(default_factory=dict, alias="defaultModelPolicy")
    output_modalities: list[str] = Field(
        default_factory=lambda: ["text"],
        alias="outputModalities",
    )
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
        """注册表主键：employee_key。"""
        return self.employee_key


class TeamRole(BaseModel):
    """团队内一个成员的角色标注（阶段分组 + 组内排序）。"""
    employee_key: str = Field("", alias="employeeKey")
    stage: str = ""          # 阶段分组（如 创作 / 设计 / 生成），仅展示用
    order: int = 0           # 同阶段内排序

    model_config = {"populate_by_name": True, "extra": "allow"}


class TeamDefinition(RegistryEntity):
    """团队定义：成员列表 + 队长 + 有序角色 + 默认编排工作流。"""
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
        """注册表主键：team_code。"""
        return self.team_code


class RoleTemplateDefinition(RegistryEntity):
    """角色模板：一键创建员工的预置配方（画像 + 建议技能/工具/MCP）。"""
    template_code: str = Field("", alias="templateCode")
    name: str = ""
    category: str = ""
    description: Optional[str] = None
    role_profile: str = Field("", alias="roleProfile")
    deep_agent: bool = Field(False, alias="deepAgent")
    default_model_policy: dict = Field(default_factory=dict, alias="defaultModelPolicy")
    output_modalities: list[str] = Field(
        default_factory=lambda: ["text"],
        alias="outputModalities",
    )
    suggested_skill_codes: list[str] = Field(default_factory=list, alias="suggestedSkillCodes")
    suggested_tool_codes: list[str] = Field(default_factory=list, alias="suggestedToolCodes")
    suggested_mcp_server_codes: list[str] = Field(default_factory=list, alias="suggestedMcpServerCodes")
    tags: list[str] = Field(default_factory=list)
    icon: Optional[str] = None
    source: str = "system"

    def get_key(self) -> str:
        """注册表主键：template_code。"""
        return self.template_code
