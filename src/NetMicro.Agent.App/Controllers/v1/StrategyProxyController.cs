using Microsoft.AspNetCore.Mvc;
using NetMicro.Agent.App.Agents.Strategy;

namespace NetMicro.Agent.App.Controllers.v1
{
    /// <summary>
    /// 策略助手代理接口：将前端请求转发到 Admin API 的 RechargeStrategyAssistant。
    /// 避免前端直连 Admin API 产生跨域和配置问题。
    /// </summary>
    public class StrategyProxyController : BaseController
    {
        private readonly AdminApiClient _apiClient;
        private readonly ILogger<StrategyProxyController> _logger;

        public StrategyProxyController(AdminApiClient apiClient, ILogger<StrategyProxyController> logger)
        {
            _apiClient = apiClient;
            _logger = logger;
        }

        /// <summary>
        /// 上传 Excel 文件，转发到 Admin API 的 SubmitParse，返回 snapshotId。
        /// </summary>
        [HttpPost]
        [RequestSizeLimit(20 * 1024 * 1024)] // 20MB
        public async Task<IActionResult> Upload(IFormCollection form)
        {
            var file = form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest(new { code = 400, message = "请上传 Excel 文件" });

            form.TryGetValue("description", out var description);
            form.TryGetValue("strategyType", out var strategyType);

            _logger.LogInformation("策略代理上传: {FileName}, {Size}KB, type={StrategyType}",
                file.FileName, file.Length / 1024, strategyType.FirstOrDefault());

            var result = await _apiClient.UploadParseAsync(file, description.FirstOrDefault(), strategyType.FirstOrDefault(), HttpContext.RequestAborted);
            return Content(result, "application/json");
        }

        /// <summary>
        /// 查询解析状态，转发到 Admin API 的 GetParseResult。
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> ParseStatus([FromQuery] string snapshotId)
        {
            if (string.IsNullOrEmpty(snapshotId))
                return BadRequest(new { code = 400, message = "缺少 snapshotId" });

            var result = await _apiClient.GetParseResultAsync(snapshotId, HttpContext.RequestAborted);
            return Content(result, "application/json");
        }
    }
}
