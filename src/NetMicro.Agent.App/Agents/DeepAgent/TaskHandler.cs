using Microsoft.SemanticKernel;
using NetMicro.Agent.App.Agents.Runtime;
using NetMicro.Agent.App.Core;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// 子智能体工具：task。把一段聚焦子任务派发到隔离上下文的子 Agent 执行。
    /// 子 Agent 与主 Agent 共享同一份虚拟文件系统，但拥有独立的对话历史和受限工具集，
    /// 因此繁重的中间产物（如逐列解析的长 JSON）不会污染主对话。
    /// </summary>
    public class TaskHandler : IAgentToolHandler
    {
        private readonly AgentLoop _agentLoop;
        private readonly IAIRequestService _aiRequestService;
        private readonly Dictionary<string, IAgentToolHandler> _fileHandlers;
        private readonly ILogger<TaskHandler> _logger;

        private static readonly Dictionary<string, string> ToolDescriptions = new()
        {
            ["read_file"] = "读取虚拟文件内容，参数 {\"path\":\"文件名\",\"offset\":可选起始行,\"limit\":可选行数}",
            ["write_file"] = "写入/覆盖虚拟文件，参数 {\"path\":\"文件名\",\"content\":\"内容\"}",
            ["ls"] = "列出虚拟文件系统中的所有文件",
            ["edit_file"] = "按字符串替换编辑虚拟文件，参数 {\"path\":\"文件名\",\"old_string\":\"原文\",\"new_string\":\"新文\",\"replace_all\":可选bool}"
        };

        public TaskHandler(
            AgentLoop agentLoop,
            IAIRequestService aiRequestService,
            LsHandler lsHandler,
            ReadFileHandler readFileHandler,
            WriteFileHandler writeFileHandler,
            EditFileHandler editFileHandler,
            ILogger<TaskHandler> logger)
        {
            _agentLoop = agentLoop;
            _aiRequestService = aiRequestService;
            _fileHandlers = new[]
            {
                (IAgentToolHandler)lsHandler, readFileHandler, writeFileHandler, editFileHandler
            }.ToDictionary(h => h.ToolCode, h => h);
            _logger = logger;
        }

        public string ToolCode => "task";

        public async Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return "{\"error\":\"当前 Agent 未启用 DeepAgent 状态，无法使用 task\"}";

            string? type, description;
            try
            {
                var args = JObject.Parse(context.ArgumentsJson);
                type = args["subagent_type"]?.ToString()?.Trim();
                description = args["description"]?.ToString()?.Trim();
            }
            catch
            {
                return "{\"error\":\"参数解析失败，需要 {subagent_type, description}\"}";
            }

            if (string.IsNullOrWhiteSpace(description))
                return "{\"error\":\"缺少 description（要交给子 Agent 的具体任务）\"}";

            // 选择子 Agent 类型：未指定且只有一个时自动选用
            if (string.IsNullOrWhiteSpace(type))
            {
                if (state.SubAgents.Count == 1) type = state.SubAgents.Keys.First();
                else return $"{{\"error\":\"请指定 subagent_type，可选：{string.Join(", ", state.SubAgents.Keys)}\"}}";
            }

            if (!state.SubAgents.TryGetValue(type!, out var def))
                return $"{{\"error\":\"未知 subagent_type：{type}，可选：{string.Join(", ", state.SubAgents.Keys)}\"}}";

            _logger.LogInformation("派生子 Agent type={Type} desc={Desc}", type, description);

            // 为子 Agent 准备隔离 Kernel + 受限工具集（共享同一份虚拟文件系统）
            Kernel kernel;
            try { kernel = _aiRequestService.GetKernel(state.ModelId); }
            catch (Exception ex) { return $"{{\"error\":\"子 Agent 初始化失败：{ex.Message}\"}}"; }

            var functions = new List<KernelFunction>();
            foreach (var code in def.ToolCodes)
            {
                if (!_fileHandlers.TryGetValue(code, out var handler)) continue;
                functions.Add(KernelFunctionWrapper.Wrap(
                    handler,
                    code,
                    ToolDescriptions.GetValueOrDefault(code, code),
                    context.EmployeeKey,
                    state,
                    context.ExtraContext,
                    offloadLargeResults: false, // 子 Agent 的文件工具结果不再二次卸载
                    _logger));
            }
            if (functions.Count > 0)
                kernel.Plugins.Add(KernelPluginFactory.CreateFromFunctions("SubAgentTools", functions));

            var loopResult = await _agentLoop.RunAsync(
                kernel,
                def.SystemPrompt,
                description!,
                maxIterations: 8,
                temperature: state.Temperature,
                maxTokens: state.MaxTokens,
                label: $"sub:{type}",
                options: null, // 子 Agent 不需要上下文压缩和审批中断
                ct: cancellationToken);

            return $"[子 Agent {type} 已完成]\n{loopResult.FinalText}";
        }
    }
}
