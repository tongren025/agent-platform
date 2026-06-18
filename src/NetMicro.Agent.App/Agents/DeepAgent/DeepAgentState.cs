using System.Text;
using NetMicro.Agent.App.Agents.Memory;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// DeepAgent 单轮运行状态（in-turn）。
    /// 一次 /agent/run 内由主 Agent 和其派生的子 Agent 共享：
    /// - 规划 todo 清单（write_todos）
    /// - 虚拟文件系统（ls / read_file / write_file / edit_file）
    /// - 可派生的子 Agent 定义（task）
    /// - 待审批操作（require_approval）
    /// 不跨请求持久化——下一轮调用会重新构建。
    /// </summary>
    public class DeepAgentState
    {
        /// <summary>规划清单。write_todos 会整体替换它。</summary>
        public List<TodoItem> Todos { get; } = new();

        /// <summary>虚拟文件系统：path -> 文本内容。</summary>
        public Dictionary<string, string> Files { get; } = new(StringComparer.OrdinalIgnoreCase);

        /// <summary>本轮可派生的子 Agent，按 type 索引。</summary>
        public Dictionary<string, SubAgentDefinition> SubAgents { get; } = new(StringComparer.OrdinalIgnoreCase);

        /// <summary>本轮模型配置（派生子 Agent 时复用）。</summary>
        public string ModelId { get; set; } = "gpt-4o";
        public double Temperature { get; set; } = 0.5;
        public int MaxTokens { get; set; } = 4096;

        /// <summary>
        /// 待审批操作信息。非空表示 Agent 调用了 require_approval，需要中断循环等待人工确认。
        /// AgentLoop 每轮迭代后检测此字段，不为空时中断并返回 PendingApproval 状态。
        /// </summary>
        public PendingApprovalInfo? PendingApproval { get; set; }

        /// <summary>把当前 todo 清单渲染成给 LLM 看的文本。</summary>
        public string RenderTodos()
        {
            if (Todos.Count == 0) return "（当前没有 todo）";
            var sb = new StringBuilder();
            for (var i = 0; i < Todos.Count; i++)
            {
                var t = Todos[i];
                var mark = t.Status switch
                {
                    "completed" => "[x]",
                    "in_progress" => "[~]",
                    _ => "[ ]"
                };
                sb.Append(mark).Append(' ').Append(i + 1).Append(". ").AppendLine(t.Content);
            }
            return sb.ToString().TrimEnd();
        }

        /// <summary>把虚拟文件列表渲染成给 LLM 看的文本（含字节数）。</summary>
        public string RenderFileList()
        {
            if (Files.Count == 0) return "（虚拟文件系统为空）";
            var sb = new StringBuilder();
            foreach (var kv in Files)
                sb.Append("- ").Append(kv.Key).Append("  (").Append(kv.Value.Length).AppendLine(" chars)");
            return sb.ToString().TrimEnd();
        }
    }

    /// <summary>单条规划项。</summary>
    public class TodoItem
    {
        public string Content { get; set; } = string.Empty;

        /// <summary>pending / in_progress / completed。</summary>
        public string Status { get; set; } = "pending";
    }

    /// <summary>子 Agent 定义（本轮构建，不持久化）。</summary>
    public class SubAgentDefinition
    {
        /// <summary>类型标识，task 工具通过它选择子 Agent。</summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>给主 Agent 看的简介（写进系统提示）。</summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>子 Agent 自己的系统提示（隔离上下文，可包含完整解析规则）。</summary>
        public string SystemPrompt { get; set; } = string.Empty;

        /// <summary>子 Agent 允许使用的工具 code（通常只有虚拟文件系统工具）。</summary>
        public List<string> ToolCodes { get; set; } = new();
    }
}
