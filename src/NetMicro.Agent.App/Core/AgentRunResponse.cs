namespace NetMicro.Agent.App.Core
{
    /// <summary>
    /// 同步 Agent 调用响应。
    /// </summary>
    public class AgentRunResponse
    {
        /// <summary>
        /// LLM 最终输出的 assistant 消息文本。
        /// </summary>
        public string AssistantMessage { get; set; } = string.Empty;

        /// <summary>
        /// 累计 token 用量。
        /// </summary>
        public AgentTokenUsage TokenUsage { get; set; } = new();

        /// <summary>
        /// 工具调用 trace 列表（按 iteration 升序）。
        /// </summary>
        public List<AgentInvocationTrace> Traces { get; set; } = new();

        /// <summary>
        /// 实际生效的作用域栈，方便调用方排查 prompt 装配结果。
        /// </summary>
        public List<string> ActiveScopes { get; set; } = new();

        /// <summary>
        /// 实际喂给 LLM 的 system prompt（仅在 verbose 模式或调试场景返回，可能为 null）。
        /// </summary>
        public string? CompiledSystemPrompt { get; set; }

        /// <summary>
        /// auto-invoke 轮次（终止于第几轮）。
        /// </summary>
        public int AutoInvokeCount { get; set; }

        /// <summary>
        /// 会话 ID。客户端应保存此值，后续同一会话的请求传回以维持多轮对话。
        /// </summary>
        public string? SessionId { get; set; }

        /// <summary>
        /// 待审批操作信息。非空时表示 Agent 因需要人工确认而暂停。
        /// 客户端应展示此信息给用户，获取确认后在下一次请求中传入 approvalDecision。
        /// </summary>
        public PendingApprovalDetail? PendingApproval { get; set; }

        /// <summary>跨员工 delegate 调用链（若本次是嵌套调用）。栈底是顶层发起的员工。</summary>
        public List<string>? DelegationStack { get; set; }
    }

    /// <summary>待审批操作详情（返回给客户端）。</summary>
    public class PendingApprovalDetail
    {
        /// <summary>操作描述（展示给运营）。</summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>操作类型标识。</summary>
        public string ActionType { get; set; } = string.Empty;

        /// <summary>请求审批的时间。</summary>
        public DateTime RequestedAt { get; set; }
    }
}
