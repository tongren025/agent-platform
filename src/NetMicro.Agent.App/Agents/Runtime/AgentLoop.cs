using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 可复用的工具调用循环。主 Agent 与 task 派生的子 Agent 都走这里，
    /// 不依赖任何具体 ToolHandler，因此不会和 LocalKernelFunctionFactory 形成循环依赖。
    ///
    /// Deep Agents 增强：
    /// - 上下文压缩：对话历史过长时自动压缩早期消息（Context Compression）
    /// - 审批中断：检测 require_approval 工具设置的标志，中断循环返回待审批状态（Human-in-the-loop）
    /// - 多轮恢复：支持从已有 ChatHistory 恢复，用于多轮对话场景（Multi-turn Memory）
    /// </summary>
    public class AgentLoop
    {
        private readonly ILogger<AgentLoop> _logger;

        public AgentLoop(ILogger<AgentLoop> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 跑一次工具调用循环。
        /// </summary>
        /// <param name="kernel">已注册好工具插件的 Kernel。</param>
        /// <param name="systemPrompt">系统提示。</param>
        /// <param name="userMessage">用户消息。</param>
        /// <param name="maxIterations">外层迭代上限（SK 自身还会做内层 auto-invoke）。</param>
        /// <param name="options">扩展选项（上下文压缩、多轮恢复、审批中断等）。</param>
        public async Task<AgentLoopResult> RunAsync(
            Kernel kernel,
            string systemPrompt,
            string userMessage,
            int maxIterations,
            double temperature,
            int maxTokens,
            string label,
            AgentLoopOptions? options = null,
            CancellationToken ct = default)
        {
            var result = new AgentLoopResult();

            // ── 构建 ChatHistory：支持多轮恢复 ──
            ChatHistory chatHistory;

            if (options?.ExistingHistory is { Count: > 0 })
            {
                // 从已有会话恢复
                chatHistory = options.ExistingHistory;

                // 确保 system prompt 是最新的（替换第一条 system message）
                var firstSystem = chatHistory.FirstOrDefault(m => m.Role == AuthorRole.System);
                if (firstSystem != null)
                    chatHistory.Remove(firstSystem);
                chatHistory.Insert(0, new ChatMessageContent(AuthorRole.System, systemPrompt));

                // 追加新的 user message
                chatHistory.AddUserMessage(userMessage);

                _logger.LogInformation("[{Label}] 从会话恢复，已有 {Count} 条历史消息", label, chatHistory.Count);
            }
            else
            {
                chatHistory = new ChatHistory();
                chatHistory.AddSystemMessage(systemPrompt);
                chatHistory.AddUserMessage(userMessage);
            }

            var settings = new OpenAIPromptExecutionSettings
            {
                ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                MaxTokens = maxTokens,
                Temperature = temperature
            };

            var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
            int iteration = 0;

            while (iteration < maxIterations)
            {
                iteration++;

                // ── 上下文压缩检查（每轮迭代前） ──
                if (options?.Compressor != null && !string.IsNullOrEmpty(options.ModelId))
                {
                    try
                    {
                        var compressed = await options.Compressor.CompressIfNeededAsync(
                            chatHistory,
                            options.ContextCompressionThreshold,
                            options.ContextCompressionKeepRecent,
                            options.ModelId,
                            ct);

                        if (compressed)
                            _logger.LogInformation("[{Label}] 第 {Iter} 轮前执行了上下文压缩", label, iteration);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[{Label}] 上下文压缩失败，继续使用原始历史", label);
                    }
                }

                var response = await chatCompletionService.GetChatMessageContentsAsync(
                    chatHistory, settings, kernel, ct);

                foreach (var msg in response)
                {
                    chatHistory.Add(msg);

                    if (msg.Metadata?.ContainsKey("ToolCalls") == true)
                    {
                        result.Traces.Add(new AgentInvocationTrace
                        {
                            Iteration = iteration,
                            ToolName = msg.Metadata["ToolCalls"]?.ToString() ?? "",
                            Result = msg.Content,
                            Success = true
                        });
                    }
                }

                // ── 审批中断检查（Human-in-the-loop） ──
                if (options?.State?.PendingApproval != null)
                {
                    _logger.LogInformation("[{Label}] 检测到 require_approval 中断，暂停执行", label);
                    result.FinalText = chatHistory.LastOrDefault()?.Content ?? "";
                    result.Success = true;
                    result.PendingApproval = options.State.PendingApproval;
                    break;
                }

                var lastMsg = response.LastOrDefault();
                if (lastMsg?.Metadata?.ContainsKey("FinishReason") == true)
                {
                    var finishReason = lastMsg.Metadata["FinishReason"]?.ToString();
                    if (finishReason != "tool_calls" && finishReason != "function_call")
                    {
                        result.FinalText = lastMsg.Content ?? "";
                        result.Success = true;
                        break;
                    }
                }
                else
                {
                    result.FinalText = lastMsg?.Content ?? "";
                    result.Success = true;
                    break;
                }
            }

            if (!result.Success)
            {
                _logger.LogWarning("[{Label}] 超过最大工具调用次数 {Max}", label, maxIterations);
                result.FinalText = chatHistory.LastOrDefault()?.Content ?? "抱歉，处理过程中遇到了问题。";
                result.Success = true;
            }

            result.Iterations = iteration;
            result.History = chatHistory;
            return result;
        }
    }

    /// <summary>工具调用循环的结果。</summary>
    public class AgentLoopResult
    {
        public string FinalText { get; set; } = string.Empty;
        public bool Success { get; set; }
        public int Iterations { get; set; }
        public List<AgentInvocationTrace> Traces { get; set; } = new();

        /// <summary>循环结束时的完整对话历史（用于会话持久化）。</summary>
        public ChatHistory? History { get; set; }

        /// <summary>待审批操作信息（非空表示因 Human-in-the-loop 暂停）。</summary>
        public PendingApprovalInfo? PendingApproval { get; set; }
    }
}
