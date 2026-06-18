using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Memory
{
    /// <summary>
    /// 基于本地 JSON 文件的对话记忆存储。
    /// 会话文件存储在 data/sessions/{sessionId}.json。
    /// 适用于单机部署；分布式场景可替换为 Redis/MongoDB 实现。
    /// </summary>
    public class FileConversationMemoryStore : IConversationMemoryStore
    {
        private readonly string _sessionDir;
        private readonly ILogger<FileConversationMemoryStore> _logger;
        private static readonly JsonSerializerSettings JsonSettings = new()
        {
            Formatting = Formatting.Indented,
            NullValueHandling = NullValueHandling.Ignore,
            DateFormatString = "yyyy-MM-ddTHH:mm:ss.fffZ"
        };

        public FileConversationMemoryStore(IConfiguration configuration, ILogger<FileConversationMemoryStore> logger)
        {
            _sessionDir = configuration["Agent:SessionDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "data", "sessions");
            _logger = logger;
            Directory.CreateDirectory(_sessionDir);
        }

        public Task<ConversationSession?> LoadSessionAsync(string sessionId, CancellationToken ct = default)
        {
            var filePath = GetFilePath(sessionId);
            if (!File.Exists(filePath))
                return Task.FromResult<ConversationSession?>(null);

            try
            {
                var json = File.ReadAllText(filePath);
                var session = JsonConvert.DeserializeObject<ConversationSession>(json, JsonSettings);
                _logger.LogDebug("加载会话 {SessionId}，{Count} 条消息", sessionId, session?.Messages.Count ?? 0);
                return Task.FromResult(session);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "加载会话 {SessionId} 失败", sessionId);
                return Task.FromResult<ConversationSession?>(null);
            }
        }

        public Task SaveSessionAsync(ConversationSession session, CancellationToken ct = default)
        {
            session.LastActiveAt = DateTime.UtcNow;
            var filePath = GetFilePath(session.SessionId);

            try
            {
                var json = JsonConvert.SerializeObject(session, JsonSettings);
                File.WriteAllText(filePath, json);
                _logger.LogDebug("保存会话 {SessionId}，{Count} 条消息", session.SessionId, session.Messages.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "保存会话 {SessionId} 失败", session.SessionId);
            }
            return Task.CompletedTask;
        }

        public Task DeleteSessionAsync(string sessionId, CancellationToken ct = default)
        {
            var filePath = GetFilePath(sessionId);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("删除会话 {SessionId}", sessionId);
            }
            return Task.CompletedTask;
        }

        public Task<List<ConversationSession>> ListSessionsAsync(
            string employeeKey, int limit = 20, CancellationToken ct = default)
        {
            var sessions = new List<ConversationSession>();
            if (!Directory.Exists(_sessionDir))
                return Task.FromResult(sessions);

            foreach (var file in Directory.EnumerateFiles(_sessionDir, "*.json"))
            {
                try
                {
                    var json = File.ReadAllText(file);
                    var session = JsonConvert.DeserializeObject<ConversationSession>(json, JsonSettings);
                    if (session != null && string.Equals(session.EmployeeKey, employeeKey, StringComparison.OrdinalIgnoreCase))
                        sessions.Add(session);
                }
                catch { /* skip corrupted files */ }
            }

            return Task.FromResult(
                sessions.OrderByDescending(s => s.LastActiveAt).Take(limit).ToList());
        }

        private string GetFilePath(string sessionId)
        {
            // 清理 sessionId 防止路径遍历
            var safeId = string.Join("_", sessionId.Split(Path.GetInvalidFileNameChars()));
            return Path.Combine(_sessionDir, $"{safeId}.json");
        }
    }
}
