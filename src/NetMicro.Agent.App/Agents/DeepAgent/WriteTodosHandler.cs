using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// 规划工具：write_todos。把复杂任务拆成可见的 todo 清单并跟踪进度。
    /// 整体替换式更新——每次传入完整清单（含已完成项）。
    /// </summary>
    public class WriteTodosHandler : IAgentToolHandler
    {
        public string ToolCode => "write_todos";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"当前 Agent 未启用 DeepAgent 状态，无法使用 write_todos\"}");

            List<TodoItem> incoming;
            try
            {
                var root = JObject.Parse(context.ArgumentsJson);
                var arr = root["todos"] as JArray ?? new JArray();
                incoming = arr.Select(x => new TodoItem
                {
                    Content = x["content"]?.ToString() ?? x.ToString(),
                    Status = NormalizeStatus(x["status"]?.ToString())
                }).Where(t => !string.IsNullOrWhiteSpace(t.Content)).ToList();
            }
            catch (JsonException ex)
            {
                return Task.FromResult($"{{\"error\":\"todos 参数解析失败：{ex.Message}\"}}");
            }

            state.Todos.Clear();
            state.Todos.AddRange(incoming);

            return Task.FromResult("已更新规划清单：\n" + state.RenderTodos());
        }

        private static string NormalizeStatus(string? raw)
        {
            return raw?.Trim().ToLowerInvariant() switch
            {
                "completed" or "done" or "finished" => "completed",
                "in_progress" or "in-progress" or "doing" or "active" => "in_progress",
                _ => "pending"
            };
        }
    }
}
