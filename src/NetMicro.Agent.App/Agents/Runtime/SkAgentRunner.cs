using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using NetMicro.Agent.App.Agents.ContextCompression;
using NetMicro.Agent.App.Agents.DeepAgent;
using NetMicro.Agent.App.Agents.McpClient;
using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Agents.Models;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 基于 Semantic Kernel 的 Agent 运行器。
    /// 负责装配 Kernel / 工具 / DeepAgent 状态，实际的工具调用循环委派给 <see cref="AgentLoop"/>。
    ///
    /// Deep Agents 增强：
    /// - MCP Server 工具自动发现与注册
    /// - 上下文压缩器注入
    /// - 多轮对话历史传递
    /// - 审批中断状态传递
    /// </summary>
    public class SkAgentRunner
    {
        private readonly IAIRequestService _aiRequestService;
        private readonly LocalKernelFunctionFactory _localFactory;
        private readonly AgentLoop _agentLoop;
        private readonly IContextCompressor _contextCompressor;
        private readonly McpToolRegistrar _mcpRegistrar;
        private readonly ILogger<SkAgentRunner> _logger;

        /// <summary>普通员工的外层迭代上限。</summary>
        private const int MaxAutoInvokeAttempts = 5;

        /// <summary>DeepAgent 员工的外层迭代上限（需要更多步骤：规划/派子Agent/验证/创建）。</summary>
        private const int MaxDeepAgentAttempts = 12;

        public SkAgentRunner(
            IAIRequestService aiRequestService,
            LocalKernelFunctionFactory localFactory,
            AgentLoop agentLoop,
            IContextCompressor contextCompressor,
            McpToolRegistrar mcpRegistrar,
            ILogger<SkAgentRunner> logger)
        {
            _aiRequestService = aiRequestService;
            _localFactory = localFactory;
            _agentLoop = agentLoop;
            _contextCompressor = contextCompressor;
            _mcpRegistrar = mcpRegistrar;
            _logger = logger;
        }

        /// <summary>
        /// 运行一次 Agent 调用。
        /// </summary>
        /// <param name="snapshot">数字员工运行时快照。</param>
        /// <param name="compiledPrompt">编译后的 system prompt。</param>
        /// <param name="userMessage">用户消息。</param>
        /// <param name="visibleTools">可见的本地工具列表。</param>
        /// <param name="visibleMcpServers">可见的 MCP 服务器列表。</param>
        /// <param name="employeeKey">员工 key。</param>
        /// <param name="extraContext">额外上下文。</param>
        /// <param name="existingHistory">已有对话历史（多轮恢复用）。</param>
        /// <param name="cancellationToken">取消令牌。</param>
        public async Task<AgentRunResult> RunAsync(
            EmployeeRuntimeSnapshot snapshot,
            string compiledPrompt,
            string userMessage,
            IReadOnlyList<RuntimeTool> visibleTools,
            IReadOnlyList<RuntimeMcpServer>? visibleMcpServers,
            string employeeKey,
            Dictionary<string, object?>? extraContext = null,
            ChatHistory? existingHistory = null,
            CancellationToken cancellationToken = default)
        {
            var result = new AgentRunResult();

            try
            {
                // 1. 模型配置 + Kernel
                var modelId = snapshot.DefaultModelPolicy.GetValueOrDefault("model_id")?.ToString() ?? "gpt-4o";
                var temperature = Convert.ToDouble(snapshot.DefaultModelPolicy.GetValueOrDefault("temperature") ?? 0.7);
                var maxTokens = Convert.ToInt32(snapshot.DefaultModelPolicy.GetValueOrDefault("max_tokens") ?? 4096);
                var kernel = _aiRequestService.GetKernel(modelId);

                // 2. DeepAgent 单轮状态（仅 DeepAgent 员工）：规划清单 / 虚拟文件系统 / 子 Agent
                DeepAgentState? state = null;
                if (snapshot.DeepAgent)
                {
                    state = new DeepAgentState
                    {
                        ModelId = modelId,
                        Temperature = temperature,
                        MaxTokens = maxTokens
                    };
                    foreach (var sa in SubAgentRegistry.Build(snapshot))
                        state.SubAgents[sa.Type] = sa;
                }

                // 3. 注册本地 KernelFunctions（含 DeepAgent 工具，state 透传给文件/规划/子Agent工具）
                var localFunctions = _localFactory.Create(visibleTools, employeeKey, extraContext, state);
                if (localFunctions.Count > 0)
                {
                    var plugin = KernelPluginFactory.CreateFromFunctions("AgentTools", localFunctions);
                    kernel.Plugins.Add(plugin);
                }

                // 4. 注册 MCP Server 工具（如果有）
                // Registrar 自身无资源（连接由 per-request McpConnectionPool 管理），无需 dispose；
                // 在 delegate 嵌套调用相同 mcpServerCode 时，pool 命中缓存，零 spawn 开销
                if (visibleMcpServers is { Count: > 0 })
                {
                    var mcpToolCount = await _mcpRegistrar.RegisterAllAsync(
                        kernel, visibleMcpServers, employeeKey, state, extraContext, cancellationToken);

                    if (mcpToolCount > 0)
                        _logger.LogInformation("已注册 {Count} 个 MCP 工具", mcpToolCount);
                }

                // 5. 构建 AgentLoopOptions（Deep Agents 增强能力）
                var loopOptions = new AgentLoopOptions
                {
                    ExistingHistory = existingHistory,
                    State = state,
                    ModelId = modelId,
                    Compressor = snapshot.DeepAgent ? _contextCompressor : null,
                    ContextCompressionThreshold = 20,
                    ContextCompressionKeepRecent = 6
                };

                // 6. 跑工具调用循环
                var maxIterations = snapshot.DeepAgent ? MaxDeepAgentAttempts : MaxAutoInvokeAttempts;
                var loop = await _agentLoop.RunAsync(
                    kernel,
                    compiledPrompt,
                    userMessage,
                    maxIterations,
                    temperature,
                    maxTokens,
                    $"main:{employeeKey}",
                    loopOptions,
                    cancellationToken);

                result.AssistantMessage = loop.FinalText;
                result.Success = true;
                result.AutoInvokeCount = loop.Iterations;
                result.Traces = loop.Traces;
                result.PendingApproval = loop.PendingApproval;
            }
            catch (OperationCanceledException)
            {
                result.Success = false;
                result.ErrorMessage = "TIMEOUT";
                _logger.LogWarning("Agent {EmployeeKey} 执行超时", employeeKey);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Agent {EmployeeKey} 执行异常", employeeKey);
            }
            // 注意：MCP 连接的释放由 per-request McpConnectionPool 在 scope 结束时统一完成，
            // SkAgentRunner 不再持有/释放 MCP 资源（避免嵌套 delegate 时把别人还要用的连接关掉）

            return result;
        }
    }
}
