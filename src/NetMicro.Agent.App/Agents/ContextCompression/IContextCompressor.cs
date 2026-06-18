using Microsoft.SemanticKernel.ChatCompletion;

namespace NetMicro.Agent.App.Agents.ContextCompression
{
    /// <summary>
    /// 上下文压缩器接口。当对话历史过长时，把早期消息压缩为摘要，
    /// 避免 token 爆炸，同时保留关键上下文。
    /// 对标 Deep Agents 的 Context Compression / Summarization 能力。
    /// </summary>
    public interface IContextCompressor
    {
        /// <summary>
        /// 如果对话历史超过阈值，把早期消息压缩为一条摘要消息。
        /// </summary>
        /// <param name="history">当前对话历史（会被原地修改）。</param>
        /// <param name="threshold">消息数阈值，超过后触发压缩。</param>
        /// <param name="keepRecent">压缩后保留最近几轮消息（system prompt 不计入）。</param>
        /// <param name="modelId">用于生成摘要的模型。</param>
        /// <param name="ct">取消令牌。</param>
        /// <returns>是否执行了压缩。</returns>
        Task<bool> CompressIfNeededAsync(
            ChatHistory history,
            int threshold,
            int keepRecent,
            string modelId,
            CancellationToken ct = default);
    }
}
