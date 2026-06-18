using System.ComponentModel.DataAnnotations;

namespace NetMicro.Agent.App.Core
{
    /// <summary>
    /// 同步 Agent 调用请求（POST /api/v1/agentapp/agent/run）。
    /// </summary>
    public class AgentRunRequest
    {
        /// <summary>
        /// 数字员工业务编码（employee_key），如 recharge-strategy-assistant。
        /// </summary>
        [Required(ErrorMessage = "employeeKey 不能为空")]
        [MaxLength(128, ErrorMessage = "employeeKey 最大长度 128")]
        public string EmployeeKey { get; set; } = string.Empty;

        /// <summary>
        /// 可选工作流编码，传入后作用域栈会追加 agentKey.workflowKey。
        /// </summary>
        [MaxLength(128, ErrorMessage = "workflowKey 最大长度 128")]
        public string? WorkflowKey { get; set; }

        /// <summary>
        /// 用户输入文本（user message）。
        /// </summary>
        [Required(ErrorMessage = "userInput 不能为空")]
        public string UserInput { get; set; } = string.Empty;

        /// <summary>
        /// 可选的额外上下文，会注入到 user message 顶部，供调用方塞结构化数据（如 Excel 表头）。
        /// </summary>
        public string? ExtraContext { get; set; }

        /// <summary>
        /// 可选的结构化输出 JSON Schema 原文，存在时会自动追加 output_contract 段落。
        /// </summary>
        public string? StructuredSchemaJson { get; set; }

        /// <summary>
        /// 可选的模型配置覆盖（覆盖 snapshot.DefaultModelPolicy）。
        /// </summary>
        public Dictionary<string, object?>? ModelOverrides { get; set; }

        /// <summary>
        /// 会话 ID（用于多轮对话）。
        /// 首次调用时不传或传空，服务端分配新 SessionId 并在响应中返回；
        /// 后续同一会话的请求传入同一 SessionId，服务端自动加载对话历史。
        /// </summary>
        [MaxLength(64, ErrorMessage = "sessionId 最大长度 64")]
        public string? SessionId { get; set; }

        /// <summary>
        /// 审批决策（用于 Human-in-the-loop 恢复）。
        /// 当上一轮返回 pendingApproval 时，用户确认后传 "approved"，
        /// 拒绝时传 "rejected" 或拒绝原因。
        /// </summary>
        [MaxLength(500, ErrorMessage = "approvalDecision 最大长度 500")]
        public string? ApprovalDecision { get; set; }
    }
}
