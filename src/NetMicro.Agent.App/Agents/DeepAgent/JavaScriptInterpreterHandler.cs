using Jint;
using Jint.Native;
using Jint.Runtime;
using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// JavaScript 解释器工具：interpret_js。在沙箱中执行 JS 代码片段。
    /// 对标 Deep Agents 的 Interpreter 能力（用于工具组合与数据变换）。
    ///
    /// 使用场景：
    /// - 对工具返回的数据做 map/filter/reduce 变换
    /// - 格式转换（CSV → JSON、嵌套展平等）
    /// - 字符串拼接、数值计算
    /// - 与虚拟文件系统交互（通过 fs.read/fs.write）
    ///
    /// 安全机制：
    /// - 使用 Jint（纯 .NET JS 引擎），不访问宿主文件系统
    /// - 执行时间限制（默认 5 秒）
    /// - 内存限制（默认 50MB）
    /// - 只暴露有限的宿主 API（fs / todos / console.log）
    /// </summary>
    public class JavaScriptInterpreterHandler : IAgentToolHandler
    {
        private readonly ILogger<JavaScriptInterpreterHandler> _logger;

        public string ToolCode => "interpret_js";

        public JavaScriptInterpreterHandler(ILogger<JavaScriptInterpreterHandler> logger)
        {
            _logger = logger;
        }

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"当前 Agent 未启用 DeepAgent 状态，无法使用 interpret_js\"}");

            // 解析参数
            string? code;
            try
            {
                var args = JObject.Parse(context.ArgumentsJson);
                code = args["code"]?.ToString();
            }
            catch
            {
                return Task.FromResult("{\"error\":\"参数解析失败，需要 {code}\"}");
            }

            if (string.IsNullOrWhiteSpace(code))
                return Task.FromResult("{\"error\":\"缺少 code 参数\"}");

            _logger.LogInformation("执行 JS 代码: {CodePreview}",
                code!.Length > 100 ? code[..100] + "..." : code);

            var logs = new List<string>();

            try
            {
                var engine = new Engine(options =>
                {
                    options.TimeoutInterval(TimeSpan.FromSeconds(5));
                    options.LimitMemory(50 * 1024 * 1024); // 50MB
                    options.LimitRecursion(100);
                    options.MaxStatements(10000);
                    options.Strict(false);
                });

                // 注入虚拟文件系统 API
                engine.SetValue("fs", new
                {
                    read = new Func<string, string>(path =>
                    {
                        if (state.Files.TryGetValue(path, out var content))
                            return content;
                        throw new JavaScriptException("文件不存在: " + path);
                    }),
                    write = new Action<string, string>((path, content) =>
                    {
                        state.Files[path] = content;
                    }),
                    list = new Func<string[]>(() => state.Files.Keys.ToArray()),
                    exists = new Func<string, bool>(path => state.Files.ContainsKey(path))
                });

                // 注入 todo API（只读）
                engine.SetValue("todos", new
                {
                    list = new Func<object[]>(() =>
                        state.Todos.Select(t => (object)new { t.Content, t.Status }).ToArray()),
                    text = new Func<string>(() => state.RenderTodos())
                });

                // 注入 console.log
                engine.SetValue("console", new
                {
                    log = new Action<object?>(msg => logs.Add(msg?.ToString() ?? "undefined")),
                    warn = new Action<object?>(msg => logs.Add($"[WARN] {msg}")),
                    error = new Action<object?>(msg => logs.Add($"[ERROR] {msg}"))
                });

                // 注入常用工具函数
                engine.Execute(@"
                    function parseJSON(str) { return JSON.parse(str); }
                    function toJSON(obj, pretty) { return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj); }
                ");

                // 执行用户代码
                var result = engine.Evaluate(code);
                var resultStr = result?.ToString() ?? "undefined";

                // 如果结果是对象，尝试 JSON 序列化
                if (result != null && result.IsObject())
                {
                    try
                    {
                        var jsonResult = engine.Evaluate($"JSON.stringify(({code}), null, 2)");
                        resultStr = jsonResult?.ToString() ?? resultStr;
                    }
                    catch { /* 退回 toString() */ }
                }

                var output = new System.Text.StringBuilder();
                if (logs.Count > 0)
                {
                    output.AppendLine("[console 输出]");
                    foreach (var log in logs)
                        output.AppendLine(log);
                    output.AppendLine();
                }
                output.Append("[返回值] ").Append(resultStr);

                return Task.FromResult(output.ToString());
            }
            catch (TimeoutException)
            {
                return Task.FromResult("{\"error\":\"JS 执行超时（5秒限制）\"}");
            }
            catch (MemoryLimitExceededException)
            {
                return Task.FromResult("{\"error\":\"JS 执行超出内存限制（50MB）\"}");
            }
            catch (StatementsCountOverflowException)
            {
                return Task.FromResult("{\"error\":\"JS 执行超出语句数限制（10000 条）\"}");
            }
            catch (RecursionDepthOverflowException)
            {
                return Task.FromResult("{\"error\":\"JS 递归深度超限（100 层）\"}");
            }
            catch (JavaScriptException jse)
            {
                return Task.FromResult($"{{\"error\":\"JS 运行时错误：{jse.Message}\"}}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JS 解释器异常");
                return Task.FromResult($"{{\"error\":\"JS 解释器异常：{ex.Message}\"}}");
            }
        }
    }
}
