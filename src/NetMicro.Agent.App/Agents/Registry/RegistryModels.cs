using NetMicro.Agent.App.Agents.Models;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Registry
{
    // ══════════════════════════════════════════
    //  Skill 注册实体
    // ══════════════════════════════════════════

    /// <summary>
    /// 独立的 Skill 定义。存储在 data/skills/{code}.json。
    /// 员工通过 skillRefs 引用，不再内嵌。
    /// </summary>
    public class SkillDefinition : IRegistryEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? BindingCode { get; set; }
        public string? Summary { get; set; }
        public string? Description { get; set; }
        public bool Required { get; set; }
        public bool IsTree { get; set; }
        public List<RuntimeSkill>? Children { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => Code;
        [JsonIgnore] public string DisplayName => Name;
    }

    // ══════════════════════════════════════════
    //  MCP Server 注册实体
    // ══════════════════════════════════════════

    /// <summary>
    /// 独立的 MCP Server 定义。存储在 data/mcp-servers/{serverCode}.json。
    /// 员工通过 mcpServerRefs 引用。
    /// </summary>
    public class McpServerDefinition : IRegistryEntity
    {
        public string ServerCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? BindingCode { get; set; }
        public string? Description { get; set; }
        public string TransportType { get; set; } = "stdio";
        public string? Command { get; set; }
        public List<string>? CommandArgs { get; set; }
        public string? Url { get; set; }
        public Dictionary<string, string>? Env { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => ServerCode;
        [JsonIgnore] public string DisplayName => Name;
    }

    // ══════════════════════════════════════════
    //  Tool 注册实体
    // ══════════════════════════════════════════

    /// <summary>
    /// 独立的 Tool 定义（元数据）。存储在 data/tools/{toolCode}.json。
    /// 运行时行为由 IAgentToolHandler 代码实现；此处只管元数据。
    /// 员工通过 toolRefs 引用。
    /// </summary>
    public class ToolDefinition : IRegistryEntity
    {
        public string ToolCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? BindingCode { get; set; }
        public string? Description { get; set; }
        /// <summary>输入参数的 JSON Schema 定义。</summary>
        public string? InputSchema { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => ToolCode;
        [JsonIgnore] public string DisplayName => Name;
    }

    // ══════════════════════════════════════════
    //  Employee 注册实体
    // ══════════════════════════════════════════

    /// <summary>
    /// 独立的数字员工定义。存储在 data/employees/{employeeKey}.json。
    /// 通过 skillRefs/toolRefs/mcpServerRefs 引用注册中心的能力。
    /// 由 FileSnapshotLoader 的 FileEmployeeData 抽离而来，作为公共 POCO 供注册中心和服务层共用。
    /// </summary>
    public class EmployeeDefinition : IRegistryEntity
    {
        // ── 既有字段（与 FileEmployeeData 对齐） ──
        /// <summary>员工唯一编码（业务主键）。</summary>
        public string EmployeeKey { get; set; } = string.Empty;
        /// <summary>员工展示名称。</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>员工描述。</summary>
        public string? Description { get; set; }
        /// <summary>角色画像（注入到系统提示词的核心内容）。</summary>
        public string RoleProfile { get; set; } = string.Empty;
        /// <summary>是否启用 DeepAgent 模式（多步推理 + 文件系统工具）。</summary>
        public bool DeepAgent { get; set; }
        /// <summary>默认模型调用策略（model_id / temperature / max_tokens 等）。</summary>
        public Dictionary<string, object?> DefaultModelPolicy { get; set; } = new();
        /// <summary>引用的 Skill 编码列表（从注册中心解析）。</summary>
        public List<string>? SkillRefs { get; set; }
        /// <summary>引用的 Tool 编码列表（从注册中心解析）。</summary>
        public List<string>? ToolRefs { get; set; }
        /// <summary>引用的 MCP Server 编码列表（从注册中心解析）。</summary>
        public List<string>? McpServerRefs { get; set; }

        // ── 新增字段（数字员工团队迭代） ──
        /// <summary>是否启用；停用后不可被聊天调用。</summary>
        public bool Enabled { get; set; } = true;
        /// <summary>头像 URL 或图标标识。</summary>
        public string? Avatar { get; set; }
        /// <summary>员工标签（用于筛选/分组）。</summary>
        public List<string> Tags { get; set; } = new List<string>();
        /// <summary>所属团队编码。</summary>
        public string? TeamCode { get; set; }
        /// <summary>所基于的模版编码（若由模版创建）。</summary>
        public string? TemplateCode { get; set; }
        /// <summary>是否已挂载知识库。</summary>
        public bool HasKnowledgeBase { get; set; }
        /// <summary>员工拥有者用户 ID（用于权限隔离）。</summary>
        public string? OwnerUserId { get; set; }
        /// <summary>来源：system（系统内置）/ template（模版创建）/ user（用户自建）。</summary>
        public string Source { get; set; } = "user";
        /// <summary>排序权重，数值越小越靠前。</summary>
        public int SortOrder { get; set; }
        /// <summary>创建时间（UTC）。</summary>
        public DateTime CreatedAt { get; set; }
        /// <summary>最后更新时间（UTC）。</summary>
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => EmployeeKey;
        [JsonIgnore] public string DisplayName => Name;
    }

    // ══════════════════════════════════════════
    //  Team 注册实体（Phase 2 预埋）
    // ══════════════════════════════════════════

    /// <summary>
    /// 数字员工团队定义。存储在 data/teams/{teamCode}.json。
    /// 团队聚合一组员工（MemberEmployeeKeys），用于在前端按团队维度展示和切换。
    /// Phase 2 才开始接入运行时逻辑，此处先落地数据模型供注册中心识别。
    /// </summary>
    public class TeamDefinition : IRegistryEntity
    {
        /// <summary>团队唯一编码（业务主键）。</summary>
        public string TeamCode { get; set; } = string.Empty;
        /// <summary>团队展示名称。</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>团队描述。</summary>
        public string? Description { get; set; }
        /// <summary>团队图标（URL 或图标标识符）。</summary>
        public string? Icon { get; set; }
        /// <summary>团队主题色。</summary>
        public string? Color { get; set; }
        /// <summary>团队成员的 EmployeeKey 列表。</summary>
        public List<string> MemberEmployeeKeys { get; set; } = new List<string>();
        /// <summary>团队默认选中的 EmployeeKey。</summary>
        public string? DefaultEmployeeKey { get; set; }
        /// <summary>团队所有者用户 ID（私有团队场景）。</summary>
        public string? OwnerUserId { get; set; }
        /// <summary>排序权重，数值越小越靠前。</summary>
        public int SortOrder { get; set; }
        /// <summary>创建时间（UTC）。</summary>
        public DateTime CreatedAt { get; set; }
        /// <summary>最后更新时间（UTC）。</summary>
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => TeamCode;
        [JsonIgnore] public string DisplayName => Name;
    }

    // ══════════════════════════════════════════
    //  RoleTemplate 注册实体
    // ══════════════════════════════════════════

    /// <summary>
    /// 角色模板定义。存储在 data/role-templates/{templateCode}.json。
    /// 用于在创建数字员工时按模板预填角色画像与建议绑定的 Skill / Tool / MCP。
    /// Source = "system" 的模板不可修改、不可删除；"user" 模板由用户维护。
    /// </summary>
    public class RoleTemplateDefinition : IRegistryEntity
    {
        /// <summary>kebab-case 唯一标识；文件名 = {TemplateCode}.json。</summary>
        public string TemplateCode { get; set; } = string.Empty;
        /// <summary>模板展示名称。</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>模板描述。</summary>
        public string? Description { get; set; }
        /// <summary>分类：营销 / 客服 / 分析 / 增长 / 运营 / 内容 / 产品 / 风控 / 通用 / 工程 等。</summary>
        public string Category { get; set; } = string.Empty;
        /// <summary>模板核心角色画像提示词（用作 &lt;role_profile&gt; 主体）。</summary>
        public string RoleProfile { get; set; } = string.Empty;
        /// <summary>是否默认开启 DeepAgent 深度推理模式。</summary>
        public bool DeepAgent { get; set; } = false;
        /// <summary>默认模型策略（自由结构 JSON 对象，例如 provider / model / temperature 等）。</summary>
        public Dictionary<string, object?>? DefaultModelPolicy { get; set; }
        /// <summary>建议绑定的 Skill code 列表（需已存在于注册中心）。</summary>
        public List<string> SuggestedSkillCodes { get; set; } = new List<string>();
        /// <summary>建议绑定的 Tool code 列表。</summary>
        public List<string> SuggestedToolCodes { get; set; } = new List<string>();
        /// <summary>建议绑定的 MCP Server code 列表（一般为空）。</summary>
        public List<string> SuggestedMcpServerCodes { get; set; } = new List<string>();
        /// <summary>标签列表，用于前端筛选与展示。</summary>
        public List<string> Tags { get; set; } = new List<string>();
        /// <summary>图标：emoji 或 antd icon 名。</summary>
        public string? Icon { get; set; }
        /// <summary>来源："system"（不可改不可删）或 "user"。</summary>
        public string Source { get; set; } = "user";
        /// <summary>排序权重，数值越小越靠前。</summary>
        public int SortOrder { get; set; }
        /// <summary>创建时间（UTC）。</summary>
        public DateTime CreatedAt { get; set; }
        /// <summary>最后更新时间（UTC）。</summary>
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore] public string Key => TemplateCode;
        [JsonIgnore] public string DisplayName => Name;
    }
}
