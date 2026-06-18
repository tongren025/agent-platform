namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 运行时 MCP Server 快照（含连接配置）。
    /// </summary>
    public class RuntimeMcpServer
    {
        /// <summary>MCP Server 编码（业务唯一）。</summary>
        public string ServerCode { get; set; } = string.Empty;

        /// <summary>MCP Server 在当前数字员工上的绑定编码。</summary>
        public string BindingCode { get; set; } = string.Empty;

        /// <summary>MCP Server 显示名称。</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>MCP Server 能力说明。</summary>
        public string? Description { get; set; }

        /// <summary>排序值（小的排前面）。</summary>
        public int SortOrder { get; set; }

        // ── 连接配置（用于实际建立 MCP 通信） ──

        /// <summary>传输类型：stdio（默认） 或 http。</summary>
        public string TransportType { get; set; } = "stdio";

        /// <summary>stdio 模式：要启动的可执行文件（如 node、python、npx）。</summary>
        public string? Command { get; set; }

        /// <summary>stdio 模式：命令行参数。</summary>
        public List<string>? CommandArgs { get; set; }

        /// <summary>http 模式：MCP 服务器的端点 URL。</summary>
        public string? Url { get; set; }

        /// <summary>需要注入到 MCP 进程的环境变量。</summary>
        public Dictionary<string, string>? Env { get; set; }
    }
}
