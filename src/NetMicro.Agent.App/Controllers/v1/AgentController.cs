using Microsoft.AspNetCore.Mvc;
using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Agents.Registry;
using NetMicro.Agent.App.Agents.Services;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Controllers.v1
{
    /// <summary>
    /// Agent 调用入口。
    ///
    /// Deep Agents 增强：
    /// - 多轮对话：请求/响应中透传 sessionId
    /// - Human-in-the-loop：响应中返回 pendingApproval，后续请求带 approvalDecision 恢复
    /// - 会话管理：列出/删除会话
    /// </summary>
    public class AgentController : BaseController
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AgentController> _logger;

        public AgentController(
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILogger<AgentController> logger)
        {
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// 获取可选数字员工列表。
        /// </summary>
        [HttpGet("/api/v1/agentapp/agent/employees")]
        public IActionResult Employees()
        {
            // 通过注册中心列出员工，替代直接扫描 JSON 文件目录
            var employeeRegistry = _serviceProvider.GetRequiredService<EmployeeRegistryService>();
            var employees = employeeRegistry.ListAll()
                .Where(d => !string.IsNullOrWhiteSpace(d.EmployeeKey))
                .Select(BuildEmployeeListItem)
                .OrderByDescending(x => x.EmployeeKey == "recharge-strategy-assistant")
                .ThenBy(x => x.Name)
                .ToList();

            return Ok(new { code = 200, data = employees });
        }

        /// <summary>
        /// 同步调用 Agent。
        /// - 首次调用不传 sessionId → 分配新会话
        /// - 后续同一会话传入 sessionId → 自动恢复对话历史
        /// - 上一轮返回 pendingApproval 时，本次传入 approvalDecision 继续执行
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Run([FromBody] AgentRunRequest request)
        {
            var timeoutSeconds = _configuration.GetValue<int?>("Agent:RunTimeoutSeconds") ?? 180;
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(HttpContext.RequestAborted);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            var invocationService = _serviceProvider.GetRequiredService<IAgentInvocationService>();
            var result = await invocationService.RunAsync(request, cts.Token);

            if (!result.Success)
            {
                if (result.ErrorMessage == "TIMEOUT")
                    return StatusCode(504, new { code = 504, message = "Agent 执行超时" });

                return StatusCode(500, new { code = 500, message = result.ErrorMessage ?? "Agent 执行失败" });
            }

            var response = new AgentRunResponse
            {
                AssistantMessage = result.AssistantMessage,
                TokenUsage = result.TokenUsage ?? new AgentTokenUsage(),
                Traces = result.Traces,
                ActiveScopes = result.ActiveScopes,
                AutoInvokeCount = result.AutoInvokeCount,
                SessionId = result.SessionId,
            };

            // 透传待审批状态
            if (result.PendingApproval != null)
            {
                response.PendingApproval = new PendingApprovalDetail
                {
                    Description = result.PendingApproval.Description,
                    ActionType = result.PendingApproval.ActionType,
                    RequestedAt = result.PendingApproval.RequestedAt
                };
            }

            return Ok(new { code = 200, data = response });
        }

        /// <summary>
        /// 列出指定员工的会话列表。
        /// </summary>
        [HttpGet("/api/v1/agentapp/agent/sessions")]
        public async Task<IActionResult> ListSessions([FromQuery] string employeeKey, [FromQuery] int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });

            var memoryStore = _serviceProvider.GetRequiredService<IConversationMemoryStore>();
            var sessions = await memoryStore.ListSessionsAsync(employeeKey, limit);

            var items = sessions.Select(s => new
            {
                s.SessionId,
                s.EmployeeKey,
                MessageCount = s.Messages.Count,
                s.CreatedAt,
                s.LastActiveAt,
                HasPendingApproval = s.PendingApproval != null,
                LastMessage = s.Messages.LastOrDefault()?.Content is { Length: > 100 } lm
                    ? lm[..100] + "..." : s.Messages.LastOrDefault()?.Content
            });

            return Ok(new { code = 200, data = items });
        }

        /// <summary>
        /// 删除会话。
        /// </summary>
        [HttpDelete("/api/v1/agentapp/agent/sessions/{sessionId}")]
        public async Task<IActionResult> DeleteSession(string sessionId)
        {
            var memoryStore = _serviceProvider.GetRequiredService<IConversationMemoryStore>();
            await memoryStore.DeleteSessionAsync(sessionId);
            return Ok(new { code = 200, message = "会话已删除" });
        }

        private static EmployeeListItem BuildEmployeeListItem(EmployeeDefinition data)
        {
            // refs 模型下没有内嵌 skills/tools/mcpServers，统计直接来自 refs 列表长度
            var skillCount = data.SkillRefs?.Count ?? 0;
            var toolCount = data.ToolRefs?.Count ?? 0;
            var mcpCount = data.McpServerRefs?.Count ?? 0;

            var tags = new List<string>();
            // 优先采用员工自身的标签
            if (data.Tags is { Count: > 0 })
                tags.AddRange(data.Tags);
            if (data.EmployeeKey.Contains("recharge", StringComparison.OrdinalIgnoreCase) && !tags.Contains("Excel"))
                tags.Add("Excel");
            if (data.DeepAgent)
                tags.Add("DeepAgent");
            if (skillCount > 0)
                tags.Add($"{skillCount} 个技能");
            if (toolCount > 0)
                tags.Add($"{toolCount} 个工具");
            if (mcpCount > 0)
                tags.Add($"{mcpCount} 个 MCP");
            if (tags.Count == 0)
                tags.Add("聊天");

            return new EmployeeListItem
            {
                EmployeeKey = data.EmployeeKey,
                Name = string.IsNullOrWhiteSpace(data.Name) ? data.EmployeeKey : data.Name,
                Description = BuildDescription(data.RoleProfile, data.Name),
                Tags = tags,
                Enabled = data.Enabled,
                SkillCount = skillCount,
                ToolCount = toolCount
            };
        }

        private static string BuildDescription(string? roleProfile, string name)
        {
            var firstLine = (roleProfile ?? string.Empty)
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault(x => !x.StartsWith("#", StringComparison.Ordinal));

            if (string.IsNullOrWhiteSpace(firstLine))
                return $"{name}，可通过对话完成指定任务。";

            firstLine = firstLine
                .Replace("你是", string.Empty, StringComparison.Ordinal)
                .Trim(' ', '。', '.', '\r');

            return firstLine.Length <= 80 ? firstLine : firstLine[..80] + "...";
        }

        private sealed class EmployeeListItem
        {
            public string EmployeeKey { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public List<string> Tags { get; set; } = new();
            public bool Enabled { get; set; }
            public int SkillCount { get; set; }
            public int ToolCount { get; set; }
        }
    }
}
