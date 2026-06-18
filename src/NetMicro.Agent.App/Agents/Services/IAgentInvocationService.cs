using NetMicro.Agent.App.Agents.Runtime;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Agents.Services
{
    /// <summary>
    /// Agent 调用编排服务。
    /// </summary>
    public interface IAgentInvocationService
    {
        /// <summary>同步调用 Agent。</summary>
        Task<AgentRunResult> RunAsync(AgentRunRequest request, CancellationToken ct = default);
    }
}
