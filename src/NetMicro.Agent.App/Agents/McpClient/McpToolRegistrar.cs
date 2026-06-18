using Microsoft.SemanticKernel;
using NetMicro.Agent.App.Agents.DeepAgent;
using NetMicro.Agent.App.Agents.Models;
using NetMicro.Agent.App.Agents.Runtime;

namespace NetMicro.Agent.App.Agents.McpClient
{
    /// <summary>
    /// MCP 工具注册器。负责：
    /// 1. 根据配置「借」MCP 服务器连接（来自 per-request <see cref="McpConnectionPool"/>）
    /// 2. 发现服务器上的工具
    /// 3. 为每个工具创建 <see cref="McpToolProxy"/>
    /// 4. 将代理包装为 <see cref="KernelFunction"/> 注册到 Kernel
    ///
    /// 生命周期：每次 Agent 调用创建一个 Registrar（轻量、无资源），调用结束后丢弃；
    /// MCP 子进程的真正生命周期由 <see cref="McpConnectionPool"/> 控制（per-request）。
    /// 这样跨员工 delegate 嵌套调用相同 mcpServerCode 时只 spawn 一次，避免重复启停的 10+ 秒开销。
    /// </summary>
    public class McpToolRegistrar
    {
        private readonly McpConnectionPool _pool;
        private readonly ILogger<McpToolRegistrar> _logger;

        public McpToolRegistrar(McpConnectionPool pool, ILogger<McpToolRegistrar> logger)
        {
            _pool = pool;
            _logger = logger;
        }

        /// <summary>
        /// 连接所有可见的 MCP 服务器，发现工具，注册到 Kernel。
        /// </summary>
        /// <param name="kernel">要注册工具的 Kernel 实例。</param>
        /// <param name="mcpServers">可见的 MCP 服务器配置。</param>
        /// <param name="employeeKey">员工 key（用于上下文传递）。</param>
        /// <param name="state">DeepAgent 状态（如果有）。</param>
        /// <param name="extraContext">额外上下文。</param>
        /// <param name="ct">取消令牌。</param>
        /// <returns>已注册的 MCP 工具数量。</returns>
        public async Task<int> RegisterAllAsync(
            Kernel kernel,
            IReadOnlyList<RuntimeMcpServer> mcpServers,
            string employeeKey,
            DeepAgentState? state,
            Dictionary<string, object?>? extraContext,
            CancellationToken ct = default)
        {
            if (mcpServers.Count == 0) return 0;

            var totalTools = 0;

            foreach (var server in mcpServers)
            {
                if (string.IsNullOrWhiteSpace(server.Command))
                {
                    _logger.LogWarning("MCP 服务器 {Code} 缺少 Command 配置，跳过", server.ServerCode);
                    continue;
                }

                try
                {
                    // 关键：从 per-request pool 借连接；同一请求内重复借同一 serverCode 不会重新 spawn
                    var connection = await _pool.AcquireAsync(
                        server.ServerCode,
                        server.Command,
                        server.CommandArgs,
                        server.Env,
                        ct);

                    if (connection.Tools.Count == 0)
                    {
                        _logger.LogInformation("MCP 服务器 {Code} 没有可用工具", server.ServerCode);
                        continue;
                    }

                    var functions = new List<KernelFunction>();

                    foreach (var tool in connection.Tools)
                    {
                        var proxy = new McpToolProxy(connection, server.ServerCode, tool.Name, _logger);

                        var fn = KernelFunctionWrapper.Wrap(
                            proxy,
                            proxy.ToolCode,
                            $"[MCP:{server.Name}] {tool.Description}",
                            employeeKey,
                            state,
                            extraContext,
                            offloadLargeResults: state != null, // DeepAgent 模式下卸载大结果
                            _logger);

                        functions.Add(fn);
                    }

                    if (functions.Count > 0)
                    {
                        var pluginName = $"MCP_{server.ServerCode}";

                        // 注意：同一 request 嵌套 Agent 复用 pool 中同一 connection 时，
                        // 不同 Agent 的 Kernel 实例各自独立、互不共享 Plugins，所以这里
                        // 直接 Add 不会触发「同名 plugin 重复注册」异常。
                        kernel.Plugins.Add(KernelPluginFactory.CreateFromFunctions(pluginName, functions));
                        totalTools += functions.Count;

                        _logger.LogInformation("MCP 服务器 {Code} 注册了 {Count} 个工具",
                            server.ServerCode, functions.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "MCP 服务器 {Code} 连接/注册失败，跳过", server.ServerCode);
                }
            }

            return totalTools;
        }
    }
}
