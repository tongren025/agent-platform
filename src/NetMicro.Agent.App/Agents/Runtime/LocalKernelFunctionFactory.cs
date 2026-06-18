using Microsoft.SemanticKernel;
using NetMicro.Agent.App.Agents.DeepAgent;
using NetMicro.Agent.App.Agents.Models;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 把 <see cref="RuntimeTool"/> 转换为 <see cref="KernelFunction"/>。
    /// 执行体通过注册的 <see cref="IAgentToolHandler"/> 分发。
    /// </summary>
    public class LocalKernelFunctionFactory
    {
        /// <summary>这些工具的结果不做上下文卸载（它们本身就是控制/文件管理类，输出需直接可见）。</summary>
        private static readonly HashSet<string> NoOffloadTools = new(StringComparer.OrdinalIgnoreCase)
        {
            "write_todos", "ls", "read_file", "write_file", "edit_file", "task", "get_skill_detail",
            "require_approval", "execute", "interpret_js"
        };

        private readonly Dictionary<string, IAgentToolHandler> _handlers;
        private readonly ILogger<LocalKernelFunctionFactory> _logger;

        public LocalKernelFunctionFactory(
            IEnumerable<IAgentToolHandler> handlers,
            ILogger<LocalKernelFunctionFactory> logger)
        {
            _handlers = handlers.ToDictionary(h => h.ToolCode, h => h);
            _logger = logger;
        }

        /// <summary>
        /// 为一批 RuntimeTool 生成 KernelFunction 列表。
        /// 没有注册 handler 的 tool 会被跳过并记 warn 日志。
        /// </summary>
        /// <param name="state">DeepAgent 单轮状态（非 DeepAgent 员工传 null）。</param>
        public List<KernelFunction> Create(
            IEnumerable<RuntimeTool> tools,
            string employeeKey,
            Dictionary<string, object?>? extraContext = null,
            DeepAgentState? state = null)
        {
            var functions = new List<KernelFunction>();

            foreach (var tool in tools)
            {
                if (!_handlers.TryGetValue(tool.ToolCode, out var handler))
                {
                    _logger.LogWarning("本地工具 {ToolCode} 未注册 handler，跳过", tool.ToolCode);
                    continue;
                }

                functions.Add(KernelFunctionWrapper.Wrap(
                    handler,
                    tool.ToolCode,
                    tool.Description ?? tool.Name,
                    employeeKey,
                    state,
                    extraContext,
                    offloadLargeResults: state != null && !NoOffloadTools.Contains(tool.ToolCode),
                    _logger,
                    inputSchema: tool.InputSchema));
            }

            return functions;
        }
    }
}
