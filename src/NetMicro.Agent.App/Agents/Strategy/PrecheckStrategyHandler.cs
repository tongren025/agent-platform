using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// 预检策略配置：根据 snapshot_id 获取解析结果中的 configs，调用后端 Precheck 接口。
    /// 返回校验结果（重名、缺失字段、无法匹配商品等）。
    /// </summary>
    public class PrecheckStrategyHandler : IAgentToolHandler
    {
        private readonly AdminApiClient _apiClient;
        private readonly ILogger<PrecheckStrategyHandler> _logger;

        public string ToolCode => "precheck_strategy";

        public PrecheckStrategyHandler(AdminApiClient apiClient, ILogger<PrecheckStrategyHandler> logger)
        {
            _apiClient = apiClient;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken)
        {
            var snapshotId = SnapshotIdHelper.Resolve(context);
            if (string.IsNullOrEmpty(snapshotId))
                return "{\"error\": \"缺少 snapshot_id 参数。\"}";

            _logger.LogInformation("预检策略: snapshotId={SnapshotId}", snapshotId);

            // 1. 先获取解析结果
            var parseResultJson = await _apiClient.GetParseResultAsync(snapshotId, cancellationToken);
            var configs = ExtractConfigs(parseResultJson);
            if (configs == null)
                return "{\"error\": \"无法从解析结果中提取 configs，可能解析尚未完成或已失败。\"}";

            // 2. 调用 Precheck
            var reqBody = JsonConvert.SerializeObject(new { configs });
            return await _apiClient.PrecheckAsync(reqBody, cancellationToken);
        }

        /// <summary>
        /// 从 GetParseResult 的返回中提取 preview.configs 数组。
        /// 兼容 ServiceResult 包装格式：{ data: { preview: { configs: [...] } } }
        /// </summary>
        private static JToken? ExtractConfigs(string json)
        {
            try
            {
                var root = JObject.Parse(json);

                // 尝试路径：data.preview.configs（ServiceResult 包装）
                var configs = root.SelectToken("data.preview.configs");
                if (configs is JArray { Count: > 0 }) return configs;

                // 尝试路径：data.data.preview.configs（双层包装）
                configs = root.SelectToken("data.data.preview.configs");
                if (configs is JArray { Count: > 0 }) return configs;

                // 尝试路径：preview.configs（裸返回）
                configs = root.SelectToken("preview.configs");
                if (configs is JArray { Count: > 0 }) return configs;

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}
