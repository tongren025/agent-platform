using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Agents.Models;
using NetMicro.Agent.App.Agents.Runtime;
using NetMicro.Agent.App.Agents.Services;
using NetMicro.Agent.App.Core;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.FileStore
{
    /// <summary>
    /// 文件模式的 Agent 调用编排（不依赖 MongoDB）。
    ///
    /// Deep Agents 增强：
    /// - 多轮对话会话管理（自动加载/保存对话历史）
    /// - Human-in-the-loop 审批恢复流
    /// </summary>
    public class FileAgentInvocationService : IAgentInvocationService
    {
        private readonly ISnapshotLoader _snapshotLoader;
        private readonly PromptCompiler _promptCompiler;
        private readonly SkAgentRunner _runner;
        private readonly IConversationMemoryStore _memoryStore;
        private readonly ILogger<FileAgentInvocationService> _logger;

        public FileAgentInvocationService(
            ISnapshotLoader snapshotLoader,
            PromptCompiler promptCompiler,
            SkAgentRunner runner,
            IConversationMemoryStore memoryStore,
            ILogger<FileAgentInvocationService> logger)
        {
            _snapshotLoader = snapshotLoader;
            _promptCompiler = promptCompiler;
            _runner = runner;
            _memoryStore = memoryStore;
            _logger = logger;
        }

        public async Task<AgentRunResult> RunAsync(AgentRunRequest request, CancellationToken ct = default)
        {
            var scopes = ScopeBuilder.Build(request.EmployeeKey, request.WorkflowKey);

            var snapshot = await _snapshotLoader.LoadAsync(request.EmployeeKey, scopes);
            if (snapshot == null)
                return new AgentRunResult { Success = false, ErrorMessage = $"数字员工 {request.EmployeeKey} 不存在，请检查 data/employees/{request.EmployeeKey}.json" };

            var compileResult = _promptCompiler.Compile(snapshot, scopes, request.StructuredSchemaJson);

            var userMessage = BuildUserMessage(request.UserInput, request.ExtraContext, compileResult.ResponseInstruction);

            Dictionary<string, object?>? extraDict = null;
            if (!string.IsNullOrWhiteSpace(request.ExtraContext))
            {
                try { extraDict = JsonConvert.DeserializeObject<Dictionary<string, object?>>(request.ExtraContext); }
                catch { extraDict = new Dictionary<string, object?> { ["raw"] = request.ExtraContext }; }
            }
            extraDict ??= new Dictionary<string, object?>();

            // ── 多轮对话：加载会话历史 ──
            ConversationSession? session = null;
            ChatHistory? existingHistory = null;
            var sessionId = request.SessionId;

            if (!string.IsNullOrWhiteSpace(sessionId))
            {
                session = await _memoryStore.LoadSessionAsync(sessionId, ct);
                if (session != null)
                {
                    existingHistory = RestoreChatHistory(session);
                    _logger.LogInformation("恢复会话 {SessionId}，{Count} 条历史消息",
                        sessionId, session.Messages.Count);
                }
            }

            // 首次调用时分配 SessionId
            if (string.IsNullOrWhiteSpace(sessionId))
                sessionId = $"ses_{Guid.NewGuid():N}"[..20];

            // ── Human-in-the-loop：审批决策注入 ──
            if (!string.IsNullOrWhiteSpace(request.ApprovalDecision))
            {
                extraDict["__approval_decision"] = request.ApprovalDecision;
                _logger.LogInformation("审批决策注入: {Decision}", request.ApprovalDecision);

                // 清除会话中的待审批状态
                if (session != null)
                    session.PendingApproval = null;
            }

            // ── 运行 Agent ──
            var result = await _runner.RunAsync(
                snapshot,
                compileResult.SystemPrompt,
                userMessage,
                compileResult.VisibleTools,
                compileResult.VisibleMcpServers,
                request.EmployeeKey,
                extraDict,
                existingHistory,
                ct);

            result.ActiveScopes = scopes;
            result.SessionId = sessionId;

            // ── 多轮对话：保存会话 ──
            if (result.Success)
            {
                session ??= new ConversationSession
                {
                    SessionId = sessionId,
                    EmployeeKey = request.EmployeeKey,
                    CreatedAt = DateTime.UtcNow
                };

                // 追加本轮消息
                session.Messages.Add(new ConversationMessage
                {
                    Role = "user",
                    Content = request.UserInput,
                    Timestamp = DateTime.UtcNow
                });

                session.Messages.Add(new ConversationMessage
                {
                    Role = "assistant",
                    Content = result.AssistantMessage,
                    Timestamp = DateTime.UtcNow
                });

                // 保存审批状态（如果有）
                session.PendingApproval = result.PendingApproval;

                await _memoryStore.SaveSessionAsync(session, ct);
            }

            return result;
        }

        /// <summary>从会话历史恢复 SK ChatHistory。</summary>
        private static ChatHistory RestoreChatHistory(ConversationSession session)
        {
            var history = new ChatHistory();

            foreach (var msg in session.Messages)
            {
                var role = msg.Role?.ToLowerInvariant() switch
                {
                    "system" => AuthorRole.System,
                    "assistant" => AuthorRole.Assistant,
                    "tool" => AuthorRole.Tool,
                    _ => AuthorRole.User
                };
                history.Add(new ChatMessageContent(role, msg.Content));
            }

            return history;
        }

        private static string BuildUserMessage(string userInput, string? extraContext, string? responseInstruction)
        {
            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(extraContext))
                parts.Add($"[额外上下文]\n{extraContext}");
            parts.Add(userInput);
            if (!string.IsNullOrWhiteSpace(responseInstruction))
                parts.Add(responseInstruction);
            return string.Join("\n\n", parts);
        }
    }
}
