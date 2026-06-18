using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json.Linq;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// Human-in-the-loop 审批工具：require_approval。
    /// Agent 在执行破坏性或高风险操作前调用此工具，暂停执行并等待人工确认。
    /// 对标 Deep Agents 的 Human-in-the-loop Approval Checkpoint 能力。
    ///
    /// 工作流程：
    /// 1. Agent 调用 require_approval，传入操作描述
    /// 2. 工具设置 DeepAgentState.PendingApproval 标志
    /// 3. AgentLoop 检测到标志后中断循环，返回 PendingApproval 状态
    /// 4. 客户端收到 pendingApproval 响应，展示给用户确认
    /// 5. 用户确认后，客户端带 approvalDecision=approved 重新调用
    /// 6. AgentLoop 恢复执行，工具返回"已批准"
    /// </summary>
    public class RequireApprovalHandler : IAgentToolHandler
    {
        public string ToolCode => "require_approval";

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken = default)
        {
            var state = context.State;
            if (state == null)
                return Task.FromResult("{\"error\":\"当前 Agent 未启用 DeepAgent 状态，无法使用 require_approval\"}");

            // 如果已有审批决策（从恢复路径传入），直接返回结果
            if (context.ExtraContext.TryGetValue("__approval_decision", out var decision) &&
                decision is string d && !string.IsNullOrEmpty(d))
            {
                state.PendingApproval = null;
                return Task.FromResult(d.Equals("approved", StringComparison.OrdinalIgnoreCase)
                    ? "操作已获人工批准，请继续执行。"
                    : $"操作被拒绝：{d}。请调整方案或向运营说明原因。");
            }

            // 解析参数
            string? description, actionType, argsJson;
            try
            {
                var args = JObject.Parse(context.ArgumentsJson);
                description = args["description"]?.ToString()?.Trim();
                actionType = args["action_type"]?.ToString()?.Trim() ?? "unknown";
                argsJson = args["arguments"]?.ToString();
            }
            catch
            {
                return Task.FromResult("{\"error\":\"参数解析失败，需要 {description, action_type?}\"}");
            }

            if (string.IsNullOrWhiteSpace(description))
                return Task.FromResult("{\"error\":\"缺少 description（需要审批的操作描述）\"}");

            // 设置待审批标志，AgentLoop 会检测到并中断
            state.PendingApproval = new PendingApprovalInfo
            {
                Description = description!,
                ActionType = actionType!,
                ArgumentsJson = argsJson,
                RequestedAt = DateTime.UtcNow
            };

            return Task.FromResult(
                $"⏸️ 操作需要人工审批：{description}\n" +
                "已暂停执行，等待运营确认后继续。");
        }
    }
}
