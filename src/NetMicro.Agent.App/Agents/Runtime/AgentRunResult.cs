using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// Agent 单次运行结果。
    /// </summary>
    public class AgentRunResult
    {
        /// <summary>LLM 最终回复。</summary>
        public string AssistantMessage { get; set; } = string.Empty;

        /// <summary>是否成功完成。</summary>
        public bool Success { get; set; }

        /// <summary>错误信息（失败时）。</summary>
        public string? ErrorMessage { get; set; }

        /// <summary>Token 用量。</summary>
        public AgentTokenUsage? TokenUsage { get; set; }

        /// <summary>工具调用追踪。</summary>
        public List<AgentInvocationTrace> Traces { get; set; } = new();

        /// <summary>实际生效的作用域栈。</summary>
        public List<string> ActiveScopes { get; set; } = new();

        /// <summary>auto-invoke 轮次。</summary>
        public int AutoInvokeCount { get; set; }

        /// <summary>会话 ID（多轮对话标识）。</summary>
        public string? SessionId { get; set; }

        /// <summary>
        /// 待审批操作信息。非空时表示 Agent 因 Human-in-the-loop 而暂停。
        /// 客户端应获取人工确认后在下一请求中传入 approvalDecision。
        /// </summary>
        public PendingApprovalInfo? PendingApproval { get; set; }

        /// <summary>跨员工 delegate 调用链（若本次是嵌套调用）。栈底是顶层发起的员工。</summary>
        public List<string>? DelegationStack { get; set; }
    }
}
