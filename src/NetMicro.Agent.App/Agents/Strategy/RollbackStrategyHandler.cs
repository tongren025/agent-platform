using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// 回滚策略：根据 snapshot_id 回滚已创建的策略资源（人群包、面板等）。
    /// </summary>
    public class RollbackStrategyHandler : IAgentToolHandler
    {
        private readonly AdminApiClient _apiClient;
        private readonly ILogger<RollbackStrategyHandler> _logger;

        public string ToolCode => "rollback_strategy";

        public RollbackStrategyHandler(AdminApiClient apiClient, ILogger<RollbackStrategyHandler> logger)
        {
            _apiClient = apiClient;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken)
        {
            var snapshotId = SnapshotIdHelper.Resolve(context);
            if (string.IsNullOrEmpty(snapshotId))
                return "{\"error\": \"缺少 snapshot_id 参数。\"}";

            _logger.LogInformation("回滚策略: snapshotId={SnapshotId}", snapshotId);
            return await _apiClient.RollbackAsync(snapshotId, cancellationToken);
        }
    }
}
