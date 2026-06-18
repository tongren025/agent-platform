namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 提示词编译结果：可直接喂给 LLM 调用层。
    /// </summary>
    public class PromptCompileResult
    {
        /// <summary>编译后的 system prompt。</summary>
        public string SystemPrompt { get; set; } = string.Empty;

        /// <summary>追加到 user message 末尾的结构化输出约束（无则为空字符串）。</summary>
        public string ResponseInstruction { get; set; } = string.Empty;

        /// <summary>本次生效的作用域栈。</summary>
        public List<string> ActiveScopes { get; set; } = new();

        /// <summary>解析后的模型配置。</summary>
        public Dictionary<string, object?> ResolvedModelConfig { get; set; } = new();

        /// <summary>可见的叶子技能列表。</summary>
        public List<RuntimeSkill> VisibleSkills { get; set; } = new();

        /// <summary>可见的技能树（含子技能）。</summary>
        public List<RuntimeSkill> VisibleSkillTrees { get; set; } = new();

        /// <summary>可见的工具列表（包含平台基础设施工具）。</summary>
        public List<RuntimeTool> VisibleTools { get; set; } = new();

        /// <summary>可见的 MCP Server 列表。</summary>
        public List<RuntimeMcpServer> VisibleMcpServers { get; set; } = new();
    }
}
