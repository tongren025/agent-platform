using NetMicro.Agent.App.Agents.Runtime;

namespace NetMicro.Agent.App.Agents.McpClient
{
    /// <summary>
    /// MCP 工具代理：把 MCP 服务器上的某个工具包装成 <see cref="IAgentToolHandler"/>，
    /// 使其可以像本地工具一样注册到 Semantic Kernel。
    /// 工具编码格式：mcp__{serverCode}__{toolName}。
    /// </summary>
    public class McpToolProxy : IAgentToolHandler
    {
        private readonly McpServerConnection _connection;
        private readonly string _toolName;
        private readonly string _toolCode;
        private readonly ILogger _logger;

        /// <summary>工具编码，格式 mcp__{serverCode}__{toolName}。</summary>
        public string ToolCode => _toolCode;

        public McpToolProxy(
            McpServerConnection connection,
            string serverCode,
            string toolName,
            ILogger logger)
        {
            _connection = connection;
            _toolName = toolName;
            _toolCode = $"mcp__{serverCode}__{toolName}";
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("调用 MCP 工具 {ToolCode}，参数: {Args}",
                _toolCode, TruncateForLog(context.ArgumentsJson));

            try
            {
                var result = await _connection.CallToolAsync(_toolName, context.ArgumentsJson, cancellationToken);
                return result;
            }
            catch (TimeoutException)
            {
                return $"{{\"error\":\"MCP 工具 {_toolName} 调用超时\"}}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MCP 工具 {ToolCode} 调用异常", _toolCode);
                return $"{{\"error\":\"MCP 工具调用异常：{ex.Message}\"}}";
            }
        }

        private static string TruncateForLog(string? text) =>
            text is { Length: > 200 } ? text[..200] + "..." : text ?? "{}";
    }
}
