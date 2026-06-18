using System.Collections.Concurrent;

namespace NetMicro.Agent.App.Agents.McpClient
{
    /// <summary>
    /// MCP 连接池：把 MCP 子进程的生命周期从「每次 Registrar 实例」提升到「每个请求」。
    ///
    /// 背景：在跨员工 delegate 场景下（A→B→C 嵌套调用），每层 Agent 都会新建一个
    /// <see cref="McpToolRegistrar"/>，若各自独立 spawn/kill MCP 子进程，单次 delegate
    /// 链路会重复启停同一个 MCP server 多次，带来 10+ 秒延迟。
    ///
    /// 策略：池子本身注册为 Scoped——ASP.NET Core 的请求作用域天然就是「一次 HTTP 请求」，
    /// 池随 scope 创建、随 scope 释放，因此天然 per-request。
    /// 不做 Singleton：跨用户/跨员工的 MCP 子进程不应共享（环境变量、Token 等差异）。
    ///
    /// 同 request 内，多个嵌套 Agent 共享同一 MCP 连接，第二层之后 <see cref="AcquireAsync"/>
    /// 直接命中缓存，零 spawn 成本。
    /// </summary>
    public class McpConnectionPool : IAsyncDisposable
    {
        private readonly ILogger<McpConnectionPool> _logger;

        // ServerCode → 连接 + 单飞锁；锁用于防止同 server 并发首次 connect 重复 spawn
        private readonly ConcurrentDictionary<string, Lazy<Task<McpServerConnection>>> _connections = new();

        // 标记是否已被 Dispose，避免被释放后还有人尝试拿连接
        private int _disposed;

        public McpConnectionPool(ILogger<McpConnectionPool> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 获取或创建一个 MCP 连接（per-request 缓存）。
        /// 相同 <paramref name="serverCode"/> 在同一 pool 生命周期内只会真正 spawn 一次。
        /// </summary>
        /// <remarks>
        /// 注意：调用方<b>不需要</b>也<b>不应该</b>对返回的连接做 Dispose；
        /// 连接的释放由池统一在 scope 销毁时完成。
        /// </remarks>
        public Task<McpServerConnection> AcquireAsync(
            string serverCode,
            string command,
            List<string>? commandArgs,
            Dictionary<string, string>? env,
            CancellationToken ct = default)
        {
            if (Volatile.Read(ref _disposed) == 1)
                throw new ObjectDisposedException(nameof(McpConnectionPool), "MCP 连接池已释放（请求作用域已结束）");

            // Lazy<Task<>>：保证同一 serverCode 并发首调时只创建一次 connection 任务
            var lazy = _connections.GetOrAdd(serverCode, code => new Lazy<Task<McpServerConnection>>(
                () => CreateAndConnectAsync(code, command, commandArgs, env, ct),
                LazyThreadSafetyMode.ExecutionAndPublication));

            return lazy.Value;
        }

        private async Task<McpServerConnection> CreateAndConnectAsync(
            string serverCode,
            string command,
            List<string>? commandArgs,
            Dictionary<string, string>? env,
            CancellationToken ct)
        {
            var conn = new McpServerConnection(serverCode, command, commandArgs, env, _logger);
            try
            {
                await conn.ConnectAsync(ct);
                _logger.LogInformation("[McpPool] MCP 连接 {Code} 已加入 per-request 池", serverCode);
                return conn;
            }
            catch
            {
                // 连接失败时清除缓存条目，允许后续重试；并立刻释放半成品进程
                _connections.TryRemove(serverCode, out _);
                try { await conn.DisposeAsync(); } catch { /* best effort */ }
                throw;
            }
        }

        /// <summary>
        /// 请求结束时由 DI 容器调用，统一释放本请求作用域内所有 MCP 连接。
        /// </summary>
        public async ValueTask DisposeAsync()
        {
            if (Interlocked.Exchange(ref _disposed, 1) == 1)
                return;

            foreach (var kv in _connections)
            {
                try
                {
                    // Lazy 可能仍在初始化中：等它结束（成功/失败都可），再 dispose
                    var conn = await kv.Value.Value.ConfigureAwait(false);
                    await conn.DisposeAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[McpPool] 释放 MCP 连接 {Code} 时异常", kv.Key);
                }
            }
            _connections.Clear();
        }
    }
}
