namespace NetMicro.Agent.App.Agents.Knowledge
{
    /// <summary>
    /// 员工知识库存储抽象。以 index.json 作为单一事实源，提供文档列表 / 上传 / 删除 / 读文 四类基础能力。
    /// 一期为本地文件实现，后续可扩展到对象存储或 MongoDB GridFS。
    /// </summary>
    public interface IEmployeeKnowledgeStore
    {
        /// <summary>
        /// 列出员工知识库中所有文档元数据。索引文件不存在时返回空列表（不抛异常）。
        /// </summary>
        /// <param name="employeeKey">员工业务主键。</param>
        /// <param name="ct">取消令牌。</param>
        Task<List<KnowledgeDocument>> ListAsync(string employeeKey, CancellationToken ct);

        /// <summary>
        /// 上传一份新文档：校验扩展名 / 单文件大小 / 员工累计容量，
        /// 通过后落盘并追加到 index.json；如员工尚未开启知识库，则懒触发 HasKnowledgeBase=true。
        /// </summary>
        /// <param name="employeeKey">员工业务主键。</param>
        /// <param name="fileName">原始文件名（含扩展名）。</param>
        /// <param name="content">文件内容流。</param>
        /// <param name="sizeBytes">文件字节大小（用于配额校验）。</param>
        /// <param name="ct">取消令牌。</param>
        /// <returns>新生成的文档元数据。</returns>
        /// <exception cref="KnowledgeUnsupportedTypeException">扩展名不在白名单内。</exception>
        /// <exception cref="KnowledgeFileTooLargeException">单文件超过 MaxFileSizeMB 上限。</exception>
        /// <exception cref="KnowledgeQuotaExceededException">单员工累计大小超过 MaxTotalSizePerEmployeeMB 上限。</exception>
        Task<KnowledgeDocument> UploadAsync(string employeeKey, string fileName, Stream content, long sizeBytes, CancellationToken ct);

        /// <summary>
        /// 删除指定 docId 的文档：先删磁盘文件、再更新 index.json。
        /// 注：删除最后一份文档时不自动回退 HasKnowledgeBase。
        /// </summary>
        /// <returns>true=删除成功；false=docId 不存在。</returns>
        Task<bool> DeleteAsync(string employeeKey, string docId, CancellationToken ct);

        /// <summary>
        /// 以 UTF-8 文本形式读取文档原文。文档不存在或读取失败时返回 null。
        /// </summary>
        Task<string?> ReadTextAsync(string employeeKey, string docId, CancellationToken ct);
    }

    // ══════════════════════════════════════════
    //  自定义异常：Controller 层捕获后映射为 415/413/507
    // ══════════════════════════════════════════

    /// <summary>扩展名不在白名单内（.txt / .md）。Controller 应返回 HTTP 415。</summary>
    public class KnowledgeUnsupportedTypeException : InvalidOperationException
    {
        /// <summary>触发异常的扩展名（含点号）。</summary>
        public string Extension { get; }

        public KnowledgeUnsupportedTypeException(string extension)
            : base($"不支持的文件类型: {extension}。仅支持 .txt / .md 两种格式")
        {
            Extension = extension;
        }
    }

    /// <summary>单文件超过大小上限。Controller 应返回 HTTP 413。</summary>
    public class KnowledgeFileTooLargeException : InvalidOperationException
    {
        /// <summary>实际文件大小（字节）。</summary>
        public long SizeBytes { get; }
        /// <summary>限额（字节）。</summary>
        public long MaxBytes { get; }

        public KnowledgeFileTooLargeException(long sizeBytes, long maxBytes)
            : base($"单文件不得超过 {maxBytes / 1024 / 1024}MB，当前文件 {sizeBytes / 1024 / 1024}MB")
        {
            SizeBytes = sizeBytes;
            MaxBytes = maxBytes;
        }
    }

    /// <summary>员工累计容量超限。Controller 应返回 HTTP 507（Insufficient Storage）。</summary>
    public class KnowledgeQuotaExceededException : InvalidOperationException
    {
        /// <summary>当前累计（字节）。</summary>
        public long CurrentBytes { get; }
        /// <summary>本次待新增（字节）。</summary>
        public long IncomingBytes { get; }
        /// <summary>限额（字节）。</summary>
        public long MaxBytes { get; }

        public KnowledgeQuotaExceededException(long currentBytes, long incomingBytes, long maxBytes)
            : base($"单员工知识库累计不得超过 {maxBytes / 1024 / 1024}MB，当前 {currentBytes / 1024 / 1024}MB + 本次 {incomingBytes / 1024 / 1024}MB")
        {
            CurrentBytes = currentBytes;
            IncomingBytes = incomingBytes;
            MaxBytes = maxBytes;
        }
    }
}
