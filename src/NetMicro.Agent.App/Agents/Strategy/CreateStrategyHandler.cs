using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// 批量创建策略资源：根据 snapshot_id 获取解析结果中的 configs，调用后端 Create 接口。
    /// 创建人群包、面板、商品策略等资源。
    /// </summary>
    public class CreateStrategyHandler : IAgentToolHandler
    {
        private readonly AdminApiClient _apiClient;
        private readonly ILogger<CreateStrategyHandler> _logger;

        public string ToolCode => "create_strategy";

        public CreateStrategyHandler(AdminApiClient apiClient, ILogger<CreateStrategyHandler> logger)
        {
            _apiClient = apiClient;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken)
        {
            var snapshotId = SnapshotIdHelper.Resolve(context);
            if (string.IsNullOrEmpty(snapshotId))
                return "{\"error\": \"缺少 snapshot_id 参数。\"}";

            _logger.LogInformation("批量创建策略: snapshotId={SnapshotId}", snapshotId);

            // 1. 获取解析结果
            var parseResultJson = await _apiClient.GetParseResultAsync(snapshotId, cancellationToken);
            var configs = ExtractConfigs(parseResultJson);
            if (configs == null)
                return "{\"error\": \"无法从解析结果中提取 configs，请确认解析已成功完成。\"}";

            // 2. 调用 BatchCreate
            var reqBody = JsonConvert.SerializeObject(new { configs });
            return await _apiClient.BatchCreateAsync(snapshotId, reqBody, cancellationToken);
        }

        private static JToken? ExtractConfigs(string json)
        {
            try
            {
                var root = JObject.Parse(json);
                var configs = root.SelectToken("data.preview.configs")
                    ?? root.SelectToken("data.data.preview.configs")
                    ?? root.SelectToken("preview.configs");
                return configs is JArray { Count: > 0 } ? configs : null;
            }
            catch { return null; }
        }
    }
}
