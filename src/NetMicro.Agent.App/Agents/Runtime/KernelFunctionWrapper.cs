using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using NetMicro.Agent.App.Agents.DeepAgent;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 把 <see cref="IAgentToolHandler"/> 包装成 <see cref="KernelFunction"/> 的公共逻辑。
    /// 主运行器和子 Agent（task）都复用它，避免重复实现工具分发与上下文卸载。
    ///
    /// 重要：SK 通过函数元数据（name + description + parameter schema）告诉 LLM 工具的用法。
    /// 由于我们用 CreateFromMethod 注册的是 (Kernel, string? arguments, CancellationToken)，
    /// LLM 通过 tool calling API 只看到一个 arguments 字符串参数。
    /// 所以 InputSchema 必须拼进 description，让 LLM 知道 arguments 里面该放什么 JSON。
    /// </summary>
    public static class KernelFunctionWrapper
    {
        /// <summary>超过该长度（字符）的工具结果会被卸载到虚拟文件系统，只回填一个指针。</summary>
        public const int OffloadThreshold = 4000;

        /// <summary>
        /// 包装一个工具 handler。
        /// </summary>
        /// <param name="offloadLargeResults">
        /// 是否对超长结果做上下文卸载。数据型工具（如 get_parse_result）建议开启；
        /// 虚拟文件系统工具自身必须关闭，否则 read_file 的内容会被二次卸载。
        /// </param>
        /// <param name="inputSchema">
        /// 工具的输入参数 JSON Schema。非空时拼入 description，
        /// 让 LLM 通过 tool calling API 也能看到精确的参数定义。
        /// </param>
        public static KernelFunction Wrap(
            IAgentToolHandler handler,
            string toolCode,
            string description,
            string employeeKey,
            DeepAgentState? state,
            Dictionary<string, object?>? extraContext,
            bool offloadLargeResults,
            ILogger logger,
            string? inputSchema = null)
        {
            // 把 InputSchema 融入 description，确保 SK 发给 LLM 的 tool metadata 包含参数定义
            var fullDescription = description;
            if (!string.IsNullOrWhiteSpace(inputSchema))
                fullDescription += $"\n参数 schema：{inputSchema}";

            return KernelFunctionFactory.CreateFromMethod(
                async (Kernel kernel, string? arguments, CancellationToken ct) =>
                {
                    var ctx = new AgentToolContext
                    {
                        ToolCode = toolCode,
                        ArgumentsJson = arguments ?? "{}",
                        EmployeeKey = employeeKey,
                        ExtraContext = extraContext ?? new(),
                        State = state,
                        Kernel = kernel
                    };

                    string result;
                    try
                    {
                        result = await handler.HandleAsync(ctx, ct);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "本地工具 {ToolCode} 执行异常", toolCode);
                        return $"{{\"error\":\"{ex.Message}\"}}";
                    }

                    // 上下文卸载：超长结果落盘，主对话只保留指针，省 token
                    if (offloadLargeResults && state != null && result is { Length: > OffloadThreshold })
                    {
                        var path = NextFileName(state, toolCode);
                        state.Files[path] = result;
                        logger.LogInformation("工具 {ToolCode} 结果 {Len} chars 已卸载到虚拟文件 {Path}", toolCode, result.Length, path);
                        return $"工具结果较大（{result.Length} 字符），已写入虚拟文件 \"{path}\"。" +
                               $"请用 read_file 工具按需读取（支持 offset/limit 分页），不要假设其内容。";
                    }

                    return result;
                },
                functionName: toolCode,
                description: fullDescription);
        }

        private static string NextFileName(DeepAgentState state, string toolCode)
        {
            var baseName = $"{toolCode}_result";
            var path = $"{baseName}.json";
            var i = 2;
            while (state.Files.ContainsKey(path))
                path = $"{baseName}_{i++}.json";
            return path;
        }
    }
}
