using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace NetMicro.Agent.App.Core
{
    public interface IAIRequestService
    {
        Kernel GetKernel(string model);
    }

    public class AiProviderModelConfig
    {
        public string ModelName { get; set; } = string.Empty;
        public string ModelId { get; set; } = string.Empty;
        public int TimeoutMinutes { get; set; } = 20;
    }

    public class AiProviderConfig
    {
        public string Name { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public List<AiProviderModelConfig> Models { get; set; } = new();
    }

    public class AIRequestService : IAIRequestService
    {
        private readonly ILogger<AIRequestService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly List<AiProviderConfig> _providers;
        private readonly AiProviderConfig _defaultProvider;

        public AIRequestService(
            ILogger<AIRequestService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _providers = configuration.GetSection("aiModels").Get<List<AiProviderConfig>>() ?? new();
            _defaultProvider = _providers.FirstOrDefault(x => x.Name == "aitag")
                ?? _providers.FirstOrDefault()
                ?? throw new InvalidOperationException("未找到 AI 模型配置（aiModels 节）");
        }

        public Kernel GetKernel(string model)
        {
            var (provider, modelName) = ResolveProvider(model);
            var current = provider ?? _defaultProvider;
            var modelCfg = current.Models.FirstOrDefault(m =>
                string.Equals(m.ModelName, modelName, StringComparison.OrdinalIgnoreCase));

            if (modelCfg == null)
            {
                _logger.LogWarning("未找到模型 {Model}，使用默认", modelName);
                modelCfg = current.Models.FirstOrDefault()
                    ?? throw new InvalidOperationException($"提供方 [{current.Name}] 下无可用模型");
            }

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromMinutes(Math.Max(modelCfg.TimeoutMinutes, 20));

#pragma warning disable SKEXP0010
            return Kernel.CreateBuilder()
                .AddOpenAIChatCompletion(
                    endpoint: new Uri(current.Endpoint),
                    modelId: modelCfg.ModelId,
                    apiKey: current.ApiKey,
                    httpClient: client)
                .Build();
#pragma warning restore SKEXP0010
        }

        private (AiProviderConfig? Provider, string ModelName) ResolveProvider(string model)
        {
            if (string.IsNullOrWhiteSpace(model)) return (null, model);
            var parts = model.Split(':', 2, StringSplitOptions.TrimEntries);
            if (parts.Length != 2 || string.IsNullOrWhiteSpace(parts[0])) return (null, model);
            var p = _providers.FirstOrDefault(x =>
                string.Equals(x.Name, parts[0], StringComparison.OrdinalIgnoreCase));
            return p != null ? (p, parts[1]) : throw new InvalidOperationException($"未找到 AI 提供方: {parts[0]}");
        }
    }
}
