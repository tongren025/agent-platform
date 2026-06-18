using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Registry
{
    /// <summary>
    /// 通用的基于 JSON 文件的注册中心。
    /// 每个实体存为一个 JSON 文件：{dataDir}/{key}.json。
    /// Skill、MCP Server、Tool、Employee 共用此基类。
    /// </summary>
    public class FileJsonRegistry<T> where T : class, IRegistryEntity
    {
        private readonly string _dataDir;
        private readonly ILogger _logger;
        private static readonly JsonSerializerSettings JsonSettings = new()
        {
            Formatting = Formatting.Indented,
            NullValueHandling = NullValueHandling.Ignore,
            DateFormatString = "yyyy-MM-ddTHH:mm:ss.fffZ"
        };

        public FileJsonRegistry(string dataDir, ILogger logger)
        {
            _dataDir = dataDir;
            _logger = logger;
            Directory.CreateDirectory(_dataDir);
        }

        public List<T> ListAll()
        {
            var items = new List<T>();
            if (!Directory.Exists(_dataDir)) return items;

            foreach (var file in Directory.EnumerateFiles(_dataDir, "*.json"))
            {
                try
                {
                    var json = File.ReadAllText(file);
                    var item = JsonConvert.DeserializeObject<T>(json, JsonSettings);
                    if (item != null) items.Add(item);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "读取注册项失败: {Path}", file);
                }
            }
            return items.OrderBy(x => x.SortOrder).ThenBy(x => x.DisplayName).ToList();
        }

        public T? Get(string key)
        {
            var path = GetFilePath(key);
            if (!File.Exists(path)) return null;
            try
            {
                var json = File.ReadAllText(path);
                return JsonConvert.DeserializeObject<T>(json, JsonSettings);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "读取注册项失败: {Key}", key);
                return null;
            }
        }

        public bool Exists(string key) => File.Exists(GetFilePath(key));

        public void Save(T item)
        {
            item.UpdatedAt = DateTime.UtcNow;
            if (item.CreatedAt == default) item.CreatedAt = DateTime.UtcNow;
            var path = GetFilePath(item.Key);
            var json = JsonConvert.SerializeObject(item, JsonSettings);
            File.WriteAllText(path, json);
            _logger.LogInformation("保存注册项: {Key} → {Path}", item.Key, path);
        }

        public bool Delete(string key)
        {
            var path = GetFilePath(key);
            if (!File.Exists(path)) return false;
            File.Delete(path);
            _logger.LogInformation("删除注册项: {Key}", key);
            return true;
        }

        private string GetFilePath(string key)
        {
            var safeKey = string.Join("_", key.Split(Path.GetInvalidFileNameChars()));
            return Path.Combine(_dataDir, $"{safeKey}.json");
        }
    }

    /// <summary>注册中心实体公共接口。</summary>
    public interface IRegistryEntity
    {
        string Key { get; }
        string DisplayName { get; }
        int SortOrder { get; }
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
    }
}
