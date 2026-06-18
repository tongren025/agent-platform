using NetMicro.Agent.App.Agents.Runtime;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// 获取 Excel 解析结果。LLM 传入 snapshot_id，返回完整解析结果 JSON。
    /// LLM 可据此向运营用自然语言解释每组配置内容。
    /// </summary>
    public class GetParseResultHandler : IAgentToolHandler
    {
        private readonly AdminApiClient _apiClient;
        private readonly ILogger<GetParseResultHandler> _logger;

        public string ToolCode => "get_parse_result";

        public GetParseResultHandler(AdminApiClient apiClient, ILogger<GetParseResultHandler> logger)
        {
            _apiClient = apiClient;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken)
        {
            var snapshotId = SnapshotIdHelper.Resolve(context);
            if (string.IsNullOrEmpty(snapshotId))
                return "{\"error\": \"缺少 snapshot_id 参数。请提供解析任务的 snapshotId。\"}";

            _logger.LogInformation("获取解析结果: snapshotId={SnapshotId}", snapshotId);
            return await _apiClient.GetParseResultAsync(snapshotId, cancellationToken);
        }
    }
}
