using Microsoft.SemanticKernel;
using NetMicro.Agent.App.Agents.DeepAgent;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 工具执行上下文。
    /// </summary>
    public class AgentToolContext
    {
        /// <summary>DeepAgent 单轮共享状态（todos / 虚拟文件 / 子 Agent）。非 DeepAgent 员工为 null。</summary>
        public DeepAgentState? State { get; set; }

        /// <summary>工具编码。</summary>
        public string ToolCode { get; set; } = string.Empty;

        /// <summary>LLM 传入的参数 JSON。</summary>
        public string ArgumentsJson { get; set; } = "{}";

        /// <summary>所属数字员工 key。</summary>
        public string EmployeeKey { get; set; } = string.Empty;

        /// <summary>调用方透传的额外上下文。</summary>
        public Dictionary<string, object?> ExtraContext { get; set; } = new();

        /// <summary>当前 Kernel 实例。</summary>
        public Kernel? Kernel { get; set; }
    }
}
