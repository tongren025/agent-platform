namespace NetMicro.Agent.App.Core
{
    /// <summary>
    /// 单次 Agent 调用累计 token 用量。
    /// </summary>
    public class AgentTokenUsage
    {
        /// <summary>
        /// Prompt 输入 token 总数。
        /// </summary>
        public long PromptTokens { get; set; }

        /// <summary>
        /// LLM 输出 token 总数。
        /// </summary>
        public long CompletionTokens { get; set; }

        /// <summary>
        /// 总 token 数。
        /// </summary>
        public long TotalTokens { get; set; }
    }
}
