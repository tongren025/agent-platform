using Microsoft.SemanticKernel.ChatCompletion;
using NetMicro.Agent.App.Agents.ContextCompression;
using NetMicro.Agent.App.Agents.DeepAgent;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// AgentLoop 扩展选项，承载 Deep Agents 增强能力的配置。
    /// 通过可选参数传入，不影响核心循环的向后兼容。
    /// </summary>
    public class AgentLoopOptions
    {
        /// <summary>
        /// 已有的对话历史（用于多轮对话恢复）。
        /// 如果非空，会在 system prompt 和 user message 之前加载。
        /// </summary>
        public ChatHistory? ExistingHistory { get; set; }

        /// <summary>
        /// 上下文压缩器实例。启用后会在每轮迭代后检查并压缩过长的对话历史。
        /// </summary>
        public IContextCompressor? Compressor { get; set; }

        /// <summary>
        /// DeepAgent 单轮状态。用于检测 require_approval 中断。
        /// </summary>
        public DeepAgentState? State { get; set; }

        /// <summary>
        /// 模型 ID（上下文压缩器生成摘要时使用）。
        /// </summary>
        public string? ModelId { get; set; }

        /// <summary>
        /// 消息数阈值，超过时触发上下文压缩。默认 20。
        /// </summary>
        public int ContextCompressionThreshold { get; set; } = 20;

        /// <summary>
        /// 压缩后保留最近几轮消息。默认 6。
        /// </summary>
        public int ContextCompressionKeepRecent { get; set; } = 6;
    }
}
