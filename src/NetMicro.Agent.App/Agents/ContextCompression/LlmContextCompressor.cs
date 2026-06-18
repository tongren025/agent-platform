using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using NetMicro.Agent.App.Core;

namespace NetMicro.Agent.App.Agents.ContextCompression
{
    /// <summary>
    /// 基于 LLM 的上下文压缩器。
    /// 当对话历史超过阈值时，把早期消息交给 LLM 生成一段摘要，
    /// 替换掉原始消息，保留最近 N 轮完整对话。
    /// </summary>
    public class LlmContextCompressor : IContextCompressor
    {
        private readonly IAIRequestService _aiRequestService;
        private readonly ILogger<LlmContextCompressor> _logger;

        private const string SummarizePrompt =
            "你是对话压缩器。请把以下对话历史压缩为一段简洁的中文摘要，保留所有关键信息：" +
            "用户的原始需求、已完成的工具调用及其结果、已做出的决策、待办事项进度、" +
            "虚拟文件系统中存在的文件列表。输出纯文本摘要，不要用 JSON 或 Markdown 标题。";

        public LlmContextCompressor(
            IAIRequestService aiRequestService,
            ILogger<LlmContextCompressor> logger)
        {
            _aiRequestService = aiRequestService;
            _logger = logger;
        }

        public async Task<bool> CompressIfNeededAsync(
            ChatHistory history,
            int threshold,
            int keepRecent,
            string modelId,
            CancellationToken ct = default)
        {
            // system prompt 不计入消息数
            var nonSystemCount = history.Count(m => m.Role != AuthorRole.System);
            if (nonSystemCount <= threshold)
                return false;

            _logger.LogInformation(
                "对话历史 {Count} 条超过阈值 {Threshold}，开始压缩（保留最近 {Keep} 条）",
                nonSystemCount, threshold, keepRecent);

            // 分离：system prompts / 待压缩消息 / 保留消息
            var systemMessages = history.Where(m => m.Role == AuthorRole.System).ToList();
            var nonSystemMessages = history.Where(m => m.Role != AuthorRole.System).ToList();

            var toKeep = Math.Min(keepRecent, nonSystemMessages.Count);
            var toCompress = nonSystemMessages.Take(nonSystemMessages.Count - toKeep).ToList();
            var kept = nonSystemMessages.Skip(nonSystemMessages.Count - toKeep).ToList();

            if (toCompress.Count == 0)
                return false;

            // 把待压缩消息拼成文本，交给 LLM 摘要
            var compressText = string.Join("\n",
                toCompress.Select(m => $"[{m.Role}] {TruncateContent(m.Content, 500)}"));

            string summary;
            try
            {
                var kernel = _aiRequestService.GetKernel(modelId);
                var chatService = kernel.GetRequiredService<IChatCompletionService>();
                var summaryHistory = new ChatHistory();
                summaryHistory.AddSystemMessage(SummarizePrompt);
                summaryHistory.AddUserMessage(compressText);

                var settings = new OpenAIPromptExecutionSettings
                {
                    MaxTokens = 1024,
                    Temperature = 0.3
                };

                var result = await chatService.GetChatMessageContentsAsync(
                    summaryHistory, settings, kernel, ct);
                summary = result.LastOrDefault()?.Content ?? "（压缩摘要生成失败）";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "LLM 摘要生成失败，使用简单截断");
                summary = string.Join("\n",
                    toCompress.TakeLast(3).Select(m => $"[{m.Role}] {TruncateContent(m.Content, 200)}"));
            }

            // 重建对话历史：system + 摘要 + 保留的最近消息
            history.Clear();
            foreach (var msg in systemMessages)
                history.Add(msg);
            history.AddUserMessage($"[以下是前 {toCompress.Count} 条消息的压缩摘要]\n{summary}");
            history.AddAssistantMessage("好的，我已了解之前的对话内容，请继续。");
            foreach (var msg in kept)
                history.Add(msg);

            _logger.LogInformation(
                "上下文压缩完成：{Compressed} 条消息 → 1 条摘要，保留 {Kept} 条",
                toCompress.Count, kept.Count);

            return true;
        }

        private static string TruncateContent(string? content, int maxLen)
        {
            if (string.IsNullOrEmpty(content)) return "(空)";
            return content.Length <= maxLen ? content : content[..maxLen] + "...";
        }
    }
}
