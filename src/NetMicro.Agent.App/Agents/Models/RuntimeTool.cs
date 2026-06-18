namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 运行时工具（function tool）快照。
    /// </summary>
    public class RuntimeTool
    {
        /// <summary>工具编码（业务唯一）。</summary>
        public string ToolCode { get; set; } = string.Empty;

        /// <summary>工具在当前数字员工上的绑定编码。</summary>
        public string BindingCode { get; set; } = string.Empty;

        /// <summary>工具显示名称。</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>工具使用说明（概要，注入 system prompt）。</summary>
        public string? Description { get; set; }

        /// <summary>
        /// 输入参数的 JSON Schema（完整定义，注入 system prompt 让 LLM 精确传参）。
        /// 格式为标准 JSON Schema draft-07 字符串。为空时 LLM 按 Description 中的文字提示传参。
        /// </summary>
        public string? InputSchema { get; set; }

        /// <summary>排序值（小的排前面）。</summary>
        public int SortOrder { get; set; }
    }
}
