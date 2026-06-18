namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 数字员工运行时快照：编译提示词所需的全部输入。
    /// </summary>
    public class EmployeeRuntimeSnapshot
    {
        /// <summary>数字员工的角色画像 / system prompt 主体。</summary>
        public SystemPromptBlock? SystemPromptBlock { get; set; }

        /// <summary>按作用域分桶的技能简介（叶子级 / 普通技能）。</summary>
        public Dictionary<string, List<RuntimeSkill>> SkillsByScope { get; set; } = new();

        /// <summary>按作用域分桶的技能树（带子技能的方法论）。</summary>
        public Dictionary<string, List<RuntimeSkill>> SkillTreesByScope { get; set; } = new();

        /// <summary>按作用域分桶的工具。</summary>
        public Dictionary<string, List<RuntimeTool>> ToolsByScope { get; set; } = new();

        /// <summary>按作用域分桶的 MCP Server。</summary>
        public Dictionary<string, List<RuntimeMcpServer>> McpByScope { get; set; } = new();

        /// <summary>默认模型配置（model id / temperature / max_tokens 等）。</summary>
        public Dictionary<string, object?> DefaultModelPolicy { get; set; } = new();

        /// <summary>是否启用 DeepAgent 能力（规划 / 子 Agent / 虚拟文件系统 / 上下文卸载）。</summary>
        public bool DeepAgent { get; set; }

        /// <summary>
        /// 所属团队编码。员工未加入任何团队时为 null；
        /// 非空时由 PlatformInfraToolRegistry 条件注入 delegate_to_employee 跨员工协作工具。
        /// </summary>
        public string? TeamCode { get; set; }

        /// <summary>
        /// 同团队其他成员摘要列表（已剔除自身）。
        /// 当 TeamCode 为空、团队不存在或团队中仅有自身时，该列表为空。
        /// </summary>
        public List<TeamMemberSummary> TeamMembers { get; set; } = new();

        /// <summary>
        /// 是否挂载知识库。非空时由 PlatformInfraToolRegistry 条件注入 query_knowledge_base 工具。
        /// Phase 2 暂作占位，Phase 3 由知识库装配链路根据真实绑定情况赋值。
        /// </summary>
        public bool HasKnowledgeBase { get; set; }
    }
}
