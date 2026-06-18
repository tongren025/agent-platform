namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// Agent 工具处理器接口。每个本地工具实现此接口。
    /// </summary>
    public interface IAgentToolHandler
    {
        /// <summary>工具编码（与 RuntimeTool.ToolCode 对应）。</summary>
        string ToolCode { get; }

        /// <summary>执行工具。</summary>
        Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default);
    }
}
