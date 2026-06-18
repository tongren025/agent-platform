namespace NetMicro.Agent.App.Agents.Memory
{
    /// <summary>
    /// 对话记忆存储接口。负责跨请求持久化会话状态，
    /// 对标 Deep Agents 的 Long-term Memory（Memory Store）能力。
    /// </summary>
    public interface IConversationMemoryStore
    {
        /// <summary>加载会话。不存在时返回 null。</summary>
        Task<ConversationSession?> LoadSessionAsync(string sessionId, CancellationToken ct = default);

        /// <summary>保存/更新会话。</summary>
        Task SaveSessionAsync(ConversationSession session, CancellationToken ct = default);

        /// <summary>删除会话。</summary>
        Task DeleteSessionAsync(string sessionId, CancellationToken ct = default);

        /// <summary>列出某个员工的所有会话（按最后活跃时间倒序）。</summary>
        Task<List<ConversationSession>> ListSessionsAsync(
            string employeeKey, int limit = 20, CancellationToken ct = default);
    }
}
