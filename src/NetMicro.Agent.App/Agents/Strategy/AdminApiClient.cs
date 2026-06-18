using System.Text;
using Microsoft.AspNetCore.Http;

namespace NetMicro.Agent.App.Agents.Strategy
{
    /// <summary>
    /// Admin API HTTP 客户端，供策略工具 Handler 调用管理后台的 RechargeStrategyAssistant 接口。
    /// 基础路由：/api/v1/novelmanage/RechargeStrategyAssistant/{action}
    /// </summary>
    public class AdminApiClient
    {
        private const string BasePath = "/api/v1/novelmanage/RechargeStrategyAssistant";

        private readonly System.Net.Http.HttpClient _httpClient;
        private readonly ILogger<AdminApiClient> _logger;

        public AdminApiClient(System.Net.Http.HttpClient httpClient, ILogger<AdminApiClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>上传 Excel 文件到 Admin API 的 SubmitParse，返回原始响应 JSON（含 snapshotId）。</summary>
        public async Task<string> UploadParseAsync(IFormFile file, string? description, string? strategyType, CancellationToken ct)
        {
            var url = $"{BasePath}/SubmitParse";
            _logger.LogInformation("调用 Admin API: POST {Url}, file={FileName}", url, file.FileName);

            using var content = new MultipartFormDataContent();
            using var stream = file.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                file.ContentType ?? "application/octet-stream");
            content.Add(fileContent, "file", file.FileName);

            if (!string.IsNullOrEmpty(description))
                content.Add(new StringContent(description), "description");
            if (!string.IsNullOrEmpty(strategyType))
                content.Add(new StringContent(strategyType), "strategyType");

            var response = await _httpClient.PostAsync(url, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SubmitParse 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"code\": {(int)response.StatusCode}, \"message\": \"SubmitParse 失败\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        /// <summary>获取解析结果</summary>
        public async Task<string> GetParseResultAsync(string snapshotId, CancellationToken ct)
        {
            var url = $"{BasePath}/GetParseResult?snapshotId={Uri.EscapeDataString(snapshotId)}";
            _logger.LogInformation("调用 Admin API: GET {Url}", url);

            var response = await _httpClient.GetAsync(url, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Admin API 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"error\": \"Admin API 返回 {(int)response.StatusCode}\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        /// <summary>预检配置合法性</summary>
        public async Task<string> PrecheckAsync(string configsJson, CancellationToken ct)
        {
            var url = $"{BasePath}/Precheck";
            _logger.LogInformation("调用 Admin API: POST {Url}", url);

            var content = new StringContent(configsJson, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Precheck 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"error\": \"Precheck 返回 {(int)response.StatusCode}\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        /// <summary>批量创建策略资源</summary>
        public async Task<string> BatchCreateAsync(string snapshotId, string configsJson, CancellationToken ct)
        {
            var url = $"{BasePath}/Create?snapshotId={Uri.EscapeDataString(snapshotId)}";
            _logger.LogInformation("调用 Admin API: POST {Url}", url);

            var content = new StringContent(configsJson, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("BatchCreate 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"error\": \"BatchCreate 返回 {(int)response.StatusCode}\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        /// <summary>回滚已创建的策略资源</summary>
        public async Task<string> RollbackAsync(string snapshotId, CancellationToken ct)
        {
            var url = $"{BasePath}/Rollback?snapshotId={Uri.EscapeDataString(snapshotId)}";
            _logger.LogInformation("调用 Admin API: POST {Url}", url);

            var response = await _httpClient.PostAsync(url, null, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Rollback 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"error\": \"Rollback 返回 {(int)response.StatusCode}\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        /// <summary>获取原始 JSON（调试用）</summary>
        public async Task<string> GetRawJsonAsync(string snapshotId, CancellationToken ct)
        {
            var url = $"{BasePath}/GetRawJson?snapshotId={Uri.EscapeDataString(snapshotId)}";
            _logger.LogInformation("调用 Admin API: GET {Url}", url);

            var response = await _httpClient.GetAsync(url, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("GetRawJson 返回 {StatusCode}: {Body}", (int)response.StatusCode, body);
                return $"{{\"error\": \"GetRawJson 返回 {(int)response.StatusCode}\", \"detail\": {EscapeJsonValue(body)}}}";
            }
            return body;
        }

        private static string EscapeJsonValue(string raw)
        {
            return "\"" + raw.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "") + "\"";
        }
    }
}
