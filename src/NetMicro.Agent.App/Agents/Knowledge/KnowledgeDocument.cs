namespace NetMicro.Agent.App.Agents.Knowledge
{
    /// <summary>
    /// 员工知识库文档元数据 POCO。
    /// 对应 data/knowledge/{EmployeeKey}/index.json 中的单条记录。
    /// </summary>
    public class KnowledgeDocument
    {
        /// <summary>文档唯一标识（GUID N 格式，无连字符）。</summary>
        public string DocId { get; set; } = string.Empty;

        /// <summary>原始上传文件名（含扩展名）。</summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>文件扩展名（含点号，如 .txt / .md）。</summary>
        public string Extension { get; set; } = string.Empty;

        /// <summary>文件字节大小。</summary>
        public long SizeBytes { get; set; }

        /// <summary>上传时间（UTC）。</summary>
        public DateTime UploadedAt { get; set; }

        /// <summary>可选标签，用于分类或筛选。</summary>
        public List<string>? Tags { get; set; }
    }
}
