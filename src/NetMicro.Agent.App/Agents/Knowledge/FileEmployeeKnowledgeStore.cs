using System.Text;
using System.Text.RegularExpressions;
using NetMicro.Agent.App.Agents.Registry;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Knowledge
{
    /// <summary>
    /// 基于本地文件系统的员工知识库存储实现。
    /// 目录布局: {Root}/{EmployeeKey}/{docId}.{ext} + 同目录 index.json。
    /// 适合单机部署；分布式场景可替换为对象存储/MongoDB 实现。
    /// </summary>
    public class FileEmployeeKnowledgeStore : IEmployeeKnowledgeStore
    {
        // 文件类型白名单（spec 一期仅支持纯文本）
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".txt",
            ".md"
        };

        // EmployeeKey 合法字符白名单：字母数字 + 下划线 + 短横线，防止目录穿越
        private static readonly Regex SafeEmployeeKeyRegex = new("^[a-zA-Z0-9_-]+$", RegexOptions.Compiled);

        private static readonly JsonSerializerSettings JsonSettings = new()
        {
            Formatting = Formatting.Indented,
            NullValueHandling = NullValueHandling.Ignore,
            DateFormatString = "yyyy-MM-ddTHH:mm:ss.fffZ"
        };

        private readonly string _rootDir;
        private readonly long _maxFileSizeBytes;
        private readonly long _maxTotalSizePerEmployeeBytes;
        private readonly EmployeeRegistryService _employees;
        private readonly ILogger<FileEmployeeKnowledgeStore> _logger;

        public FileEmployeeKnowledgeStore(
            IConfiguration configuration,
            EmployeeRegistryService employees,
            ILogger<FileEmployeeKnowledgeStore> logger)
        {
            _employees = employees ?? throw new ArgumentNullException(nameof(employees));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // 根目录：优先读 Agent:Knowledge:DataDir，缺省回退到 {BaseDir}/data/knowledge
            _rootDir = configuration["Agent:Knowledge:DataDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "data", "knowledge");

            // 配额配置（默认值：单文件 10MB / 单员工总量 100MB）
            var maxFileSizeMB = configuration.GetValue<int?>("Agent:Knowledge:MaxFileSizeMB") ?? 10;
            var maxTotalSizePerEmployeeMB = configuration.GetValue<int?>("Agent:Knowledge:MaxTotalSizePerEmployeeMB") ?? 100;
            _maxFileSizeBytes = (long)maxFileSizeMB * 1024L * 1024L;
            _maxTotalSizePerEmployeeBytes = (long)maxTotalSizePerEmployeeMB * 1024L * 1024L;

            Directory.CreateDirectory(_rootDir);
        }

        // ──────────────────────────────────────────
        //  ListAsync：读 index.json，不存在则返回空列表
        // ──────────────────────────────────────────
        public Task<List<KnowledgeDocument>> ListAsync(string employeeKey, CancellationToken ct)
        {
            ValidateEmployeeKey(employeeKey);
            var indexPath = GetIndexPath(employeeKey);
            if (!File.Exists(indexPath))
                return Task.FromResult(new List<KnowledgeDocument>());

            try
            {
                var json = File.ReadAllText(indexPath, Encoding.UTF8);
                var list = JsonConvert.DeserializeObject<List<KnowledgeDocument>>(json, JsonSettings)
                           ?? new List<KnowledgeDocument>();
                return Task.FromResult(list);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "读取员工知识库索引失败: employeeKey={EmployeeKey}", employeeKey);
                return Task.FromResult(new List<KnowledgeDocument>());
            }
        }

        // ──────────────────────────────────────────
        //  UploadAsync：校验 → 落盘 → 更新索引 → 懒触发 HasKnowledgeBase
        // ──────────────────────────────────────────
        public async Task<KnowledgeDocument> UploadAsync(
            string employeeKey,
            string fileName,
            Stream content,
            long sizeBytes,
            CancellationToken ct)
        {
            ValidateEmployeeKey(employeeKey);
            if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentException("文件名不能为空", nameof(fileName));
            if (content == null) throw new ArgumentNullException(nameof(content));

            // 1. 校验扩展名
            var ext = Path.GetExtension(fileName);
            if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
                throw new KnowledgeUnsupportedTypeException(ext ?? string.Empty);

            // 2. 校验单文件大小
            if (sizeBytes > _maxFileSizeBytes)
                throw new KnowledgeFileTooLargeException(sizeBytes, _maxFileSizeBytes);

            // 3. 校验员工累计容量
            var existing = await ListAsync(employeeKey, ct).ConfigureAwait(false);
            var currentTotal = existing.Sum(d => d.SizeBytes);
            if (currentTotal + sizeBytes > _maxTotalSizePerEmployeeBytes)
                throw new KnowledgeQuotaExceededException(currentTotal, sizeBytes, _maxTotalSizePerEmployeeBytes);

            // 4. 准备目录与目标文件路径
            var employeeDir = GetEmployeeDir(employeeKey);
            Directory.CreateDirectory(employeeDir);

            var docId = Guid.NewGuid().ToString("N");
            var targetFilePath = Path.Combine(employeeDir, $"{docId}{ext.ToLowerInvariant()}");

            // 5. 落盘文件（不允许半截文件残留：失败时清理）
            try
            {
                await using (var fs = new FileStream(targetFilePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    await content.CopyToAsync(fs, ct).ConfigureAwait(false);
                }
            }
            catch
            {
                // 写入失败 → 删除半截文件，索引保持不变
                TryDeleteFile(targetFilePath);
                throw;
            }

            // 6. 生成元数据
            var doc = new KnowledgeDocument
            {
                DocId = docId,
                FileName = fileName,
                Extension = ext.ToLowerInvariant(),
                SizeBytes = sizeBytes,
                UploadedAt = DateTime.UtcNow,
                Tags = null
            };

            // 7. 更新 index.json（追加新条目并写回）
            existing.Add(doc);
            try
            {
                WriteIndex(employeeKey, existing);
            }
            catch
            {
                // 索引写失败 → 回滚刚落盘的文件，保持一致性
                TryDeleteFile(targetFilePath);
                throw;
            }

            // 8. 懒触发：首次上传时把员工 HasKnowledgeBase 置为 true
            TryLazyEnableKnowledgeBase(employeeKey);

            _logger.LogInformation(
                "员工知识库上传成功: employeeKey={EmployeeKey}, docId={DocId}, fileName={FileName}, sizeBytes={SizeBytes}",
                employeeKey, docId, fileName, sizeBytes);

            return doc;
        }

        // ──────────────────────────────────────────
        //  DeleteAsync：先删磁盘文件 → 再更新索引；任一步失败则保持原状
        // ──────────────────────────────────────────
        public async Task<bool> DeleteAsync(string employeeKey, string docId, CancellationToken ct)
        {
            ValidateEmployeeKey(employeeKey);
            if (string.IsNullOrWhiteSpace(docId)) throw new ArgumentException("docId 不能为空", nameof(docId));

            var existing = await ListAsync(employeeKey, ct).ConfigureAwait(false);
            var target = existing.FirstOrDefault(d => string.Equals(d.DocId, docId, StringComparison.OrdinalIgnoreCase));
            if (target == null)
                return false;

            var employeeDir = GetEmployeeDir(employeeKey);
            var filePath = Path.Combine(employeeDir, $"{target.DocId}{target.Extension}");

            // 1. 先删文件（若文件本身已不在，认为已清理，可继续修索引）
            try
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "删除知识库文件失败: filePath={FilePath}", filePath);
                throw;
            }

            // 2. 再改索引
            existing.RemoveAll(d => string.Equals(d.DocId, docId, StringComparison.OrdinalIgnoreCase));
            WriteIndex(employeeKey, existing);

            // 注：删除最后一份文档时，不自动回退 HasKnowledgeBase（spec 明确要求由管理员显式关闭）
            _logger.LogInformation(
                "员工知识库文档删除成功: employeeKey={EmployeeKey}, docId={DocId}", employeeKey, docId);
            return true;
        }

        // ──────────────────────────────────────────
        //  ReadTextAsync：以 UTF-8 文本读取文档原文
        // ──────────────────────────────────────────
        public async Task<string?> ReadTextAsync(string employeeKey, string docId, CancellationToken ct)
        {
            ValidateEmployeeKey(employeeKey);
            if (string.IsNullOrWhiteSpace(docId)) return null;

            var existing = await ListAsync(employeeKey, ct).ConfigureAwait(false);
            var target = existing.FirstOrDefault(d => string.Equals(d.DocId, docId, StringComparison.OrdinalIgnoreCase));
            if (target == null) return null;

            var filePath = Path.Combine(GetEmployeeDir(employeeKey), $"{target.DocId}{target.Extension}");
            if (!File.Exists(filePath)) return null;

            try
            {
                return await File.ReadAllTextAsync(filePath, Encoding.UTF8, ct).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "读取知识库文档失败: filePath={FilePath}", filePath);
                return null;
            }
        }

        // ──────────────────────────────────────────
        //  私有辅助方法
        // ──────────────────────────────────────────

        /// <summary>
        /// 校验 EmployeeKey 合法性，阻断目录穿越。
        /// 仅允许字母数字 + 下划线 + 短横线。
        /// </summary>
        private static void ValidateEmployeeKey(string employeeKey)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                throw new ArgumentException("employeeKey 不能为空", nameof(employeeKey));
            if (!SafeEmployeeKeyRegex.IsMatch(employeeKey))
                throw new ArgumentException($"employeeKey 含非法字符: {employeeKey}", nameof(employeeKey));
        }

        private string GetEmployeeDir(string employeeKey) => Path.Combine(_rootDir, employeeKey);

        private string GetIndexPath(string employeeKey) => Path.Combine(GetEmployeeDir(employeeKey), "index.json");

        private void WriteIndex(string employeeKey, List<KnowledgeDocument> documents)
        {
            var employeeDir = GetEmployeeDir(employeeKey);
            Directory.CreateDirectory(employeeDir);
            var indexPath = GetIndexPath(employeeKey);
            var json = JsonConvert.SerializeObject(documents, JsonSettings);
            File.WriteAllText(indexPath, json, Encoding.UTF8);
        }

        private void TryDeleteFile(string path)
        {
            try
            {
                if (File.Exists(path)) File.Delete(path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "回滚删除文件失败: path={Path}", path);
            }
        }

        /// <summary>
        /// 懒触发：若员工尚未开启知识库，把 HasKnowledgeBase 置为 true 并 Save 一次。
        /// 注：注册表中找不到员工不视为错误（仅记录 debug），避免影响主流程。
        /// </summary>
        private void TryLazyEnableKnowledgeBase(string employeeKey)
        {
            try
            {
                var employee = _employees.Get(employeeKey);
                if (employee == null)
                {
                    _logger.LogDebug("懒触发跳过：员工注册中心未找到 employeeKey={EmployeeKey}", employeeKey);
                    return;
                }

                if (employee.HasKnowledgeBase) return;

                employee.HasKnowledgeBase = true;
                employee.UpdatedAt = DateTime.UtcNow;
                _employees.Save(employee);
                _logger.LogInformation("懒触发员工知识库开关: employeeKey={EmployeeKey}", employeeKey);
            }
            catch (Exception ex)
            {
                // 懒触发失败不影响上传主流程，仅 warn
                _logger.LogWarning(ex, "懒触发 HasKnowledgeBase 失败: employeeKey={EmployeeKey}", employeeKey);
            }
        }
    }
}
