namespace NetMicro.Agent.App.Core
{
    /// <summary>
    /// 单次工具或 MCP 调用的执行轨迹，用于排错与审计。
    /// </summary>
    public class AgentInvocationTrace
    {
        /// <summary>
        /// auto-invoke 轮次序号（1 起）。
        /// </summary>
        public int Iteration { get; set; }

        /// <summary>
        /// 工具完整名称（本地工具：tool_code；MCP 工具：mcp__{server_code}__{tool_name}）。
        /// </summary>
        public string ToolName { get; set; } = string.Empty;

        /// <summary>
        /// LLM 传入的参数 JSON 文本。
        /// </summary>
        public string? Arguments { get; set; }

        /// <summary>
        /// 工具返回的原始文本（含错误回填）。
        /// </summary>
        public string? Result { get; set; }

        /// <summary>
        /// 工具是否执行成功（false 表示已用错误信息回填给 LLM）。
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 工具执行耗时（毫秒）。
        /// </summary>
        public long ElapsedMilliseconds { get; set; }
    }
}
