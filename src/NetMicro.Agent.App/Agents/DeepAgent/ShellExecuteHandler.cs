using System.Diagnostics;
using System.Text;
using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// Shell 执行工具：execute。在受限环境中执行系统命令。
    /// 对标 Deep Agents 的 Shell Execution（LocalShellBackend）能力。
    ///
    /// 安全机制：
    /// - 命令白名单（可配置，默认只允许安全的只读命令）
    /// - 执行超时（默认 30 秒）
    /// - 输出大小限制（默认 10000 字符）
    /// - 禁止管道到危险命令
    /// </summary>
    public class ShellExecuteHandler : IAgentToolHandler
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ShellExecuteHandler> _logger;

        /// <summary>默认白名单：只有这些命令的前缀才允许执行。</summary>
        private static readonly HashSet<string> DefaultAllowedCommands = new(StringComparer.OrdinalIgnoreCase)
        {
            "echo", "date", "ls", "dir", "cat", "type", "find", "grep",
            "wc", "head", "tail", "sort", "uniq", "pwd", "whoami",
            "hostname", "uname", "df", "du", "which", "where",
            "dotnet", "node", "python", "pip", "npm", "curl"
        };

        /// <summary>绝对禁止的命令/关键词。</summary>
        private static readonly HashSet<string> BlockedKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            "rm", "del", "rmdir", "format", "mkfs", "dd", "shutdown", "reboot",
            "passwd", "chmod", "chown", "kill", "pkill", "killall",
            "sudo", "su", ">", ">>", "|"
        };

        public string ToolCode => "execute";

        public ShellExecuteHandler(IConfiguration configuration, ILogger<ShellExecuteHandler> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            // 检查是否启用
            var enabled = _configuration.GetValue<bool?>("Agent:ShellExecute:Enabled") ?? false;
            if (!enabled)
                return "{\"error\":\"Shell 执行功能未启用。请在配置中设置 Agent:ShellExecute:Enabled=true\"}";

            // 解析参数
            string? command, workingDir;
            try
            {
                var args = JObject.Parse(context.ArgumentsJson);
                command = args["command"]?.ToString()?.Trim();
                workingDir = args["working_dir"]?.ToString()?.Trim();
            }
            catch
            {
                return "{\"error\":\"参数解析失败，需要 {command, working_dir?}\"}";
            }

            if (string.IsNullOrWhiteSpace(command))
                return "{\"error\":\"缺少 command 参数\"}";

            // 安全检查
            var validation = ValidateCommand(command!);
            if (validation != null)
                return $"{{\"error\":\"命令被拒绝：{validation}\"}}";

            var timeoutSeconds = _configuration.GetValue<int?>("Agent:ShellExecute:TimeoutSeconds") ?? 30;
            var maxOutput = _configuration.GetValue<int?>("Agent:ShellExecute:MaxOutputChars") ?? 10000;

            _logger.LogInformation("执行命令: {Command}", command);

            try
            {
                var isWindows = OperatingSystem.IsWindows();
                var psi = new ProcessStartInfo
                {
                    FileName = isWindows ? "cmd.exe" : "/bin/sh",
                    Arguments = isWindows ? $"/c {command}" : $"-c \"{command!.Replace("\"", "\\\"")}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = workingDir ?? AppContext.BaseDirectory,
                    StandardOutputEncoding = Encoding.UTF8,
                    StandardErrorEncoding = Encoding.UTF8
                };

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

                using var process = Process.Start(psi);
                if (process == null)
                    return "{\"error\":\"无法启动进程\"}";

                var stdoutTask = process.StandardOutput.ReadToEndAsync(cts.Token);
                var stderrTask = process.StandardError.ReadToEndAsync(cts.Token);

                await process.WaitForExitAsync(cts.Token);

                var stdout = await stdoutTask;
                var stderr = await stderrTask;
                var exitCode = process.ExitCode;

                // 截断过长输出
                if (stdout.Length > maxOutput)
                    stdout = stdout[..maxOutput] + $"\n...（输出被截断，共 {stdout.Length} 字符）";
                if (stderr.Length > maxOutput / 2)
                    stderr = stderr[..(maxOutput / 2)] + "\n...（错误输出被截断）";

                var result = new StringBuilder();
                result.Append($"exit_code: {exitCode}\n");
                if (!string.IsNullOrWhiteSpace(stdout))
                    result.Append($"stdout:\n{stdout}\n");
                if (!string.IsNullOrWhiteSpace(stderr))
                    result.Append($"stderr:\n{stderr}\n");

                return result.ToString().TrimEnd();
            }
            catch (OperationCanceledException)
            {
                return $"{{\"error\":\"命令执行超时（{timeoutSeconds}s）\"}}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "命令执行异常: {Command}", command);
                return $"{{\"error\":\"命令执行异常：{ex.Message}\"}}";
            }
        }

        private string? ValidateCommand(string command)
        {
            // 检查黑名单关键词
            foreach (var keyword in BlockedKeywords)
            {
                if (command.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    return $"包含被禁止的关键词 '{keyword}'";
            }

            // 提取首个命令词
            var firstWord = command.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault()?.ToLowerInvariant();
            if (string.IsNullOrEmpty(firstWord))
                return "命令为空";

            // 加载自定义白名单（如果配置了）
            var customAllowed = _configuration.GetSection("Agent:ShellExecute:AllowedCommands")
                .Get<string[]>();
            var allowedSet = customAllowed != null
                ? new HashSet<string>(customAllowed, StringComparer.OrdinalIgnoreCase)
                : DefaultAllowedCommands;

            if (!allowedSet.Contains(firstWord))
                return $"命令 '{firstWord}' 不在白名单中。允许的命令：{string.Join(", ", allowedSet)}";

            return null;
        }
    }
}
