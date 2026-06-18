namespace NetMicro.Agent.App.Agents.Memory
{
    /// <summary>
    /// 多轮对话会话。跨请求持久化对话历史，
    /// 对标 Deep Agents 的 Long-term Memory / Persistence 能力。
    /// </summary>
    public class ConversationSession
    {
        /// <summary>会话唯一标识。由客户端生成或服务端分配。</summary>
        public string SessionId { get; set; } = string.Empty;

        /// <summary>关联的数字员工 key。</summary>
        public string EmployeeKey { get; set; } = string.Empty;

        /// <summary>对话消息列表（按时间顺序）。</summary>
        public List<ConversationMessage> Messages { get; set; } = new();

        /// <summary>上下文压缩后的摘要（如果有）。</summary>
        public string? CompressedSummary { get; set; }

        /// <summary>会话创建时间。</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>最后活跃时间。</summary>
        public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;

        /// <summary>会话元数据（如 workflowKey、业务标签等）。</summary>
        public Dictionary<string, string> Metadata { get; set; } = new();

        /// <summary>待审批的操作描述（非空时表示会话处于等待审批状态）。</summary>
        public PendingApprovalInfo? PendingApproval { get; set; }
    }

    /// <summary>单条对话消息。</summary>
    public class ConversationMessage
    {
        /// <summary>角色：system / user / assistant / tool。</summary>
        public string Role { get; set; } = string.Empty;

        /// <summary>消息文本内容。</summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>消息时间戳。</summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>工具名称（仅 role=tool 时有值）。</summary>
        public string? ToolName { get; set; }
    }

    /// <summary>待审批操作信息。</summary>
    public class PendingApprovalInfo
    {
        /// <summary>需要审批的操作描述。</summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>操作类型标识（如 create_strategy、execute 等）。</summary>
        public string ActionType { get; set; } = string.Empty;

        /// <summary>相关的工具参数 JSON。</summary>
        public string? ArgumentsJson { get; set; }

        /// <summary>请求审批的时间。</summary>
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}
