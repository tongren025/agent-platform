using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.McpClient
{
    /// <summary>
    /// MCP（Model Context Protocol）服务器连接。
    /// 管理与单个 MCP 服务器的 stdio/JSON-RPC 通信生命周期。
    /// 对标 Deep Agents 的 MCP Server 集成能力。
    ///
    /// 通信协议：JSON-RPC 2.0 over stdin/stdout，每行一个消息。
    /// 生命周期：initialize → initialized → tools/list → tools/call* → 关闭进程。
    /// </summary>
    public class McpServerConnection : IAsyncDisposable
    {
        private readonly string _serverCode;
        private readonly string _command;
        private readonly List<string> _commandArgs;
        private readonly Dictionary<string, string> _env;
        private readonly ILogger _logger;

        private Process? _process;
        private int _nextId = 1;
        private readonly ConcurrentDictionary<int, TaskCompletionSource<JObject>> _pending = new();
        private readonly CancellationTokenSource _readCts = new();
        private Task? _readTask;
        private bool _initialized;

        /// <summary>已发现的工具列表。</summary>
        public List<McpToolDefinition> Tools { get; } = new();

        public McpServerConnection(
            string serverCode,
            string command,
            List<string>? commandArgs,
            Dictionary<string, string>? env,
            ILogger logger)
        {
            _serverCode = serverCode;
            _command = command;
            _commandArgs = commandArgs ?? new();
            _env = env ?? new();
            _logger = logger;
        }

        /// <summary>启动 MCP 服务器进程，完成握手，发现工具列表。</summary>
        public async Task ConnectAsync(CancellationToken ct = default)
        {
            if (_initialized) return;

            _logger.LogInformation("启动 MCP 服务器 {Code}: {Command} {Args}",
                _serverCode, _command, string.Join(" ", _commandArgs));

            var psi = new ProcessStartInfo
            {
                FileName = _command,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardInputEncoding = Encoding.UTF8
            };
            foreach (var arg in _commandArgs)
                psi.ArgumentList.Add(arg);
            foreach (var (key, value) in _env)
                psi.Environment[key] = value;

            _process = Process.Start(psi)
                ?? throw new InvalidOperationException($"无法启动 MCP 服务器进程：{_command}");

            // 后台读取 stdout
            _readTask = Task.Run(() => ReadLoop(_readCts.Token), _readCts.Token);

            // 1. initialize
            var initResult = await SendRequestAsync("initialize", new JObject
            {
                ["protocolVersion"] = "2024-11-05",
                ["capabilities"] = new JObject(),
                ["clientInfo"] = new JObject
                {
                    ["name"] = "NetMicro.Agent",
                    ["version"] = "1.0.0"
                }
            }, ct);

            _logger.LogInformation("MCP {Code} 握手成功: {ServerInfo}",
                _serverCode, initResult["serverInfo"]?.ToString() ?? "(unknown)");

            // 2. initialized 通知（无 id，无需响应）
            await SendNotificationAsync("notifications/initialized", new JObject(), ct);

            // 3. 发现工具
            var toolsResult = await SendRequestAsync("tools/list", new JObject(), ct);
            var toolsArray = toolsResult["tools"] as JArray ?? new JArray();

            Tools.Clear();
            foreach (var t in toolsArray)
            {
                Tools.Add(new McpToolDefinition
                {
                    Name = t["name"]?.ToString() ?? "",
                    Description = t["description"]?.ToString() ?? "",
                    InputSchema = t["inputSchema"]?.ToString() ?? "{}"
                });
            }

            _logger.LogInformation("MCP {Code} 发现 {Count} 个工具: {Names}",
                _serverCode, Tools.Count, string.Join(", ", Tools.Select(t => t.Name)));

            _initialized = true;
        }

        /// <summary>调用 MCP 工具。</summary>
        public async Task<string> CallToolAsync(string toolName, string argumentsJson, CancellationToken ct = default)
        {
            if (!_initialized)
                throw new InvalidOperationException("MCP 服务器未初始化");

            JObject arguments;
            try { arguments = JObject.Parse(argumentsJson); }
            catch { arguments = new JObject(); }

            var result = await SendRequestAsync("tools/call", new JObject
            {
                ["name"] = toolName,
                ["arguments"] = arguments
            }, ct);

            // MCP 返回 { content: [{type: "text", text: "..."}], isError?: bool }
            var content = result["content"] as JArray;
            if (content == null || content.Count == 0)
                return result.ToString();

            var texts = content
                .Where(c => c["type"]?.ToString() == "text")
                .Select(c => c["text"]?.ToString() ?? "")
                .ToList();

            var isError = result["isError"]?.Value<bool>() ?? false;
            var output = string.Join("\n", texts);

            if (isError)
                return $"{{\"error\":\"{output.Replace("\"", "\\\"")}\"}}";

            return output;
        }

        private async Task<JObject> SendRequestAsync(string method, JObject @params, CancellationToken ct)
        {
            var id = Interlocked.Increment(ref _nextId);
            var tcs = new TaskCompletionSource<JObject>(TaskCreationOptions.RunContinuationsAsynchronously);
            _pending[id] = tcs;
            
            var request = new JObject
            {
                ["jsonrpc"] = "2.0",
                ["id"] = id,
                ["method"] = method,
                ["params"] = @params
            };

            await WriteLineAsync(request.ToString(Formatting.None), ct);

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));

            try
            {
                return await tcs.Task.WaitAsync(timeoutCts.Token);
            }
            catch (OperationCanceledException)
            {
                _pending.TryRemove(id, out _);
                throw new TimeoutException($"MCP 请求 {method} 超时");
            }
        }

        private async Task SendNotificationAsync(string method, JObject @params, CancellationToken ct)
        {
            var notification = new JObject
            {
                ["jsonrpc"] = "2.0",
                ["method"] = method,
                ["params"] = @params
            };
            await WriteLineAsync(notification.ToString(Formatting.None), ct);
        }

        private async Task WriteLineAsync(string line, CancellationToken ct)
        {
            if (_process?.StandardInput == null)
                throw new InvalidOperationException("MCP 进程未启动");

            await _process.StandardInput.WriteLineAsync(line.AsMemory(), ct);
            await _process.StandardInput.FlushAsync();
        }

        private async Task ReadLoop(CancellationToken ct)
        {
            try
            {
                while (!ct.IsCancellationRequested && _process?.StandardOutput != null)
                {
                    var line = await _process.StandardOutput.ReadLineAsync(ct);
                    if (line == null) break; // EOF

                    if (string.IsNullOrWhiteSpace(line)) continue;

                    JObject msg;
                    try { msg = JObject.Parse(line); }
                    catch
                    {
                        _logger.LogDebug("MCP {Code} 收到非 JSON 行: {Line}", _serverCode, line);
                        continue;
                    }

                    // 如果有 id，是对我们请求的响应
                    var id = msg["id"]?.Value<int?>();
                    if (id.HasValue && _pending.TryRemove(id.Value, out var tcs))
                    {
                        if (msg["error"] != null)
                        {
                            var errorMsg = msg["error"]?["message"]?.ToString() ?? "MCP 错误";
                            tcs.SetException(new InvalidOperationException($"MCP 错误: {errorMsg}"));
                        }
                        else
                        {
                            tcs.SetResult(msg["result"] as JObject ?? new JObject());
                        }
                    }
                    // 否则是通知，目前忽略
                }
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MCP {Code} 读取循环异常", _serverCode);
            }
        }

        public async ValueTask DisposeAsync()
        {
            _readCts.Cancel();

            if (_process != null && !_process.HasExited)
            {
                try
                {
                    _process.Kill(entireProcessTree: true);
                    await _process.WaitForExitAsync(new CancellationTokenSource(3000).Token);
                }
                catch { /* best effort */ }
                _process.Dispose();
            }

            _readCts.Dispose();

            // 取消所有待处理请求
            foreach (var (_, tcs) in _pending)
                tcs.TrySetCanceled();
            _pending.Clear();
        }
    }

    /// <summary>MCP 工具定义。</summary>
    public class McpToolDefinition
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InputSchema { get; set; } = "{}";
    }
}
