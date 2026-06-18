using NetMicro.Agent.App.Agents.Registry;
using NetMicro.Agent.App.Agents.Services;
using NetMicro.Agent.App.Core;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 跨员工 delegate 平台工具：让同 team 内的员工互相派活。
    /// 仅在员工 TeamCode 非空且 Agent:Delegation:Enabled = true 时由 PlatformInfraToolRegistry 条件注入。
    ///
    /// 执行流：
    ///   1) 参数解析（target employeeKey / task / 可选 context）
    ///   2) 栈检测（优先级最高）：目标已在调用栈 → DELEGATION_CYCLE_DETECTED
    ///   3) 深度兜底：stack.Count &gt;= Agent:Delegation:MaxDepth → DELEGATION_DEPTH_EXCEEDED
    ///   4) Team 边界校验：caller 必须挂 team；target 必须在 caller team 的 MemberEmployeeKeys[]
    ///   5) 通过 IAgentInvocationService.RunAsync 嵌套调用（带超时 cts）
    ///   6) 超时 → DELEGATION_TIMEOUT；成功 → 返回子员工 FinalText
    ///
    /// 显式禁止：不在本 Handler 内直接 SkAgentRunner.RunAsync —— 必须复用 invocation 编排链路。
    /// </summary>
    public class DelegateToEmployeeHandler : IAgentToolHandler
    {
        public string ToolCode => "delegate_to_employee";

        // ── ExtraContext 协议 key（与 SkAgentRunner / IAgentInvocationService 共用） ──
        private const string CtxKeyDelegationStack = "__delegation_stack";
        private const string CtxKeyDelegationRootUserId = "__delegation_root_user_id";
        private const string CtxKeyDelegationParentSession = "__delegation_parent_session";
        private const string CtxKeyRootUserId = "__root_user_id";
        private const string CtxKeyUserId = "__user_id";
        private const string CtxKeySessionId = "__session_id";

        // ── 配置 key 与默认值 ──
        private const string CfgMaxDepth = "Agent:Delegation:MaxDepth";
        private const string CfgTimeoutSeconds = "Agent:Delegation:TimeoutSeconds";
        private const int DefaultMaxDepth = 3;
        private const int DefaultTimeoutSeconds = 60;

        private readonly IServiceProvider _sp;
        private readonly IConfiguration _config;
        private readonly EmployeeRegistryService _employees;
        private readonly TeamRegistryService _teams;
        private readonly ILogger<DelegateToEmployeeHandler> _logger;

        public DelegateToEmployeeHandler(
            IServiceProvider sp,
            IConfiguration config,
            EmployeeRegistryService employees,
            TeamRegistryService teams,
            ILogger<DelegateToEmployeeHandler> logger)
        {
            _sp = sp;
            _config = config;
            _employees = employees;
            _teams = teams;
            _logger = logger;
        }

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            // ── 1. 解析参数 ──
            DelegateArgs? args = null;
            if (!string.IsNullOrEmpty(context.ArgumentsJson))
            {
                try
                {
                    args = JsonConvert.DeserializeObject<DelegateArgs>(context.ArgumentsJson);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "delegate_to_employee 参数解析失败: {ArgsJson}", context.ArgumentsJson);
                }
            }
            if (args == null || string.IsNullOrWhiteSpace(args.EmployeeKey) || string.IsNullOrWhiteSpace(args.Task))
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "INVALID_ARGS",
                    reason = "缺少必填参数 employeeKey 或 task"
                });
            }

            var callerKey = context.EmployeeKey ?? string.Empty;
            var targetKey = args.EmployeeKey.Trim();

            // ── 2. 读取调用栈（顶层调用栈为空） ──
            var stack = ReadDelegationStack(context.ExtraContext);

            // ── 3. 栈检测：优先于深度兜底 ──
            if (stack.Any(k => string.Equals(k, targetKey, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.LogWarning("delegate 环路：target={Target} 已在调用栈 {Stack}", targetKey, string.Join("→", stack));
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_CYCLE_DETECTED",
                    target = targetKey,
                    stack = stack
                });
            }

            // ── 4. 深度兜底 ──
            var maxDepth = _config.GetValue<int?>(CfgMaxDepth) ?? DefaultMaxDepth;
            if (stack.Count >= maxDepth)
            {
                _logger.LogWarning("delegate 深度超限：depth={Depth} max={Max} stack={Stack}", stack.Count, maxDepth, string.Join("→", stack));
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_DEPTH_EXCEEDED",
                    depth = stack.Count,
                    max = maxDepth,
                    stack = stack
                });
            }

            // ── 5. Team 边界校验 ──
            var caller = _employees.Get(callerKey);
            if (caller == null)
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_FORBIDDEN",
                    reason = "caller_not_found",
                    caller = callerKey
                });
            }
            if (string.IsNullOrWhiteSpace(caller.TeamCode))
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_FORBIDDEN",
                    reason = "caller_no_team",
                    caller = callerKey
                });
            }

            var team = _teams.Get(caller.TeamCode);
            if (team == null)
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_FORBIDDEN",
                    reason = "team_not_found",
                    team = caller.TeamCode
                });
            }

            var inTeam = team.MemberEmployeeKeys != null
                         && team.MemberEmployeeKeys.Any(m => string.Equals(m, targetKey, StringComparison.OrdinalIgnoreCase));
            if (!inTeam)
            {
                // 二次解析目标员工的 TeamCode，便于错误信息更具诊断价值
                var target = _employees.Get(targetKey);
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_FORBIDDEN",
                    reason = "target_not_in_same_team",
                    target = targetKey,
                    targetTeam = target?.TeamCode,
                    expectedTeam = caller.TeamCode
                });
            }

            // 不允许 delegate 给自己（语义上无意义，且会立刻触发环检）
            if (string.Equals(callerKey, targetKey, StringComparison.OrdinalIgnoreCase))
            {
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_FORBIDDEN",
                    reason = "self_delegate",
                    target = targetKey
                });
            }

            // ── 6. 装配嵌套请求 ──
            var newStack = new List<string>(stack) { callerKey };

            // root user id 沿用顶层（优先 __delegation_root_user_id，其次 __root_user_id / __user_id）
            var rootUserId = ResolveRootUserId(context.ExtraContext);

            var userMessage = string.IsNullOrWhiteSpace(args.Context)
                ? args.Task
                : args.Task + "\n\n上下文：" + args.Context;

            var childExtra = new Dictionary<string, object?>
            {
                [CtxKeyDelegationStack] = newStack,
                [CtxKeyDelegationRootUserId] = rootUserId,
                [CtxKeyDelegationParentSession] = TryGetString(context.ExtraContext, CtxKeySessionId)
            };

            var childRequest = new AgentRunRequest
            {
                EmployeeKey = targetKey,
                UserInput = userMessage,
                // 子调用独立 sessionId（不与主调串），由下游服务自行分配
                SessionId = null,
                // ExtraContext 必须为字符串（AgentRunRequest 定义为 string?），这里序列化为 JSON 字符串透传
                ExtraContext = JsonConvert.SerializeObject(childExtra)
            };

            // ── 7. 嵌套调用 + 超时熔断 ──
            var timeoutSeconds = _config.GetValue<int?>(CfgTimeoutSeconds) ?? DefaultTimeoutSeconds;
            if (timeoutSeconds <= 0) timeoutSeconds = DefaultTimeoutSeconds;

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            // 通过 ServiceProvider 解析 IAgentInvocationService —— 它是 Scoped，每次嵌套获取当前请求作用域内实例
            var invocation = _sp.GetService<IAgentInvocationService>();
            if (invocation == null)
            {
                _logger.LogError("IAgentInvocationService 未注册，无法执行 delegate");
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_INTERNAL_ERROR",
                    reason = "invocation_service_unavailable"
                });
            }

            try
            {
                _logger.LogInformation(
                    "delegate 嵌套调用：caller={Caller} target={Target} depth={Depth} timeoutSec={Timeout}",
                    callerKey, targetKey, stack.Count, timeoutSeconds);

                var childResult = await invocation.RunAsync(childRequest, cts.Token).ConfigureAwait(false);

                // 失败兜底：把错误透传给主调 LLM 决策
                if (childResult == null)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        error = "DELEGATION_INTERNAL_ERROR",
                        reason = "null_child_result",
                        target = targetKey
                    });
                }

                if (!childResult.Success)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        error = "DELEGATION_CHILD_FAILED",
                        target = targetKey,
                        message = childResult.ErrorMessage,
                        assistantMessage = childResult.AssistantMessage
                    });
                }

                // 成功：返回子员工最终输出，附带链路元信息便于上游观察
                return JsonConvert.SerializeObject(new
                {
                    target = targetKey,
                    assistantMessage = childResult.AssistantMessage,
                    sessionId = childResult.SessionId,
                    autoInvokeCount = childResult.AutoInvokeCount,
                    delegationStack = newStack
                });
            }
            catch (OperationCanceledException) when (cts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
            {
                // 仅在我们自己的超时 token 触发时归类为 TIMEOUT；外部取消则继续抛
                _logger.LogWarning("delegate 超时熔断：target={Target} timeoutSec={Timeout}", targetKey, timeoutSeconds);
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_TIMEOUT",
                    target = targetKey,
                    timeoutSeconds = timeoutSeconds
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "delegate 嵌套调用异常：caller={Caller} target={Target}", callerKey, targetKey);
                return JsonConvert.SerializeObject(new
                {
                    error = "DELEGATION_INTERNAL_ERROR",
                    reason = ex.GetType().Name,
                    message = ex.Message,
                    target = targetKey
                });
            }
        }

        // ── 辅助：从 ExtraContext 读出调用栈 ──
        private static List<string> ReadDelegationStack(Dictionary<string, object?> extra)
        {
            if (extra == null || !extra.TryGetValue(CtxKeyDelegationStack, out var raw) || raw == null)
                return new List<string>();

            switch (raw)
            {
                case List<string> ls:
                    return new List<string>(ls);
                case IEnumerable<string> es:
                    return es.ToList();
                case IEnumerable<object> eo:
                    return eo.Where(o => o != null).Select(o => o!.ToString()!).ToList();
                case string s when !string.IsNullOrWhiteSpace(s):
                    // 兼容序列化为 JSON 字符串后再透传的场景
                    try
                    {
                        var arr = JsonConvert.DeserializeObject<List<string>>(s);
                        return arr ?? new List<string>();
                    }
                    catch
                    {
                        return new List<string>();
                    }
                default:
                    return new List<string>();
            }
        }

        // ── 辅助：解析顶层 user id（沿用顶层；若无则回退到当前 user） ──
        private static string? ResolveRootUserId(Dictionary<string, object?> extra)
        {
            if (extra == null) return null;
            return TryGetString(extra, CtxKeyDelegationRootUserId)
                   ?? TryGetString(extra, CtxKeyRootUserId)
                   ?? TryGetString(extra, CtxKeyUserId);
        }

        private static string? TryGetString(Dictionary<string, object?> extra, string key)
        {
            if (extra == null || !extra.TryGetValue(key, out var v) || v == null) return null;
            var s = v.ToString();
            return string.IsNullOrWhiteSpace(s) ? null : s;
        }

        /// <summary>delegate_to_employee 工具参数 DTO。</summary>
        private sealed class DelegateArgs
        {
            [JsonProperty("employeeKey")]
            public string EmployeeKey { get; set; } = string.Empty;

            [JsonProperty("task")]
            public string Task { get; set; } = string.Empty;

            [JsonProperty("context")]
            public string? Context { get; set; }
        }
    }
}
