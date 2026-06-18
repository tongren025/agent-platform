namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 运行时技能/方法论快照。
    /// </summary>
    public class RuntimeSkill
    {
        /// <summary>技能编码（业务唯一）。</summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>技能在当前数字员工上的绑定编码。</summary>
        public string BindingCode { get; set; } = string.Empty;

        /// <summary>技能名称。</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>简介（注入到 system prompt 的精简描述）。</summary>
        public string? Summary { get; set; }

        /// <summary>完整描述（在 get_skill_detail 时返回）。</summary>
        public string? Description { get; set; }

        /// <summary>是否必选技能。</summary>
        public bool Required { get; set; }

        /// <summary>排序值（小的排前面）。</summary>
        public int SortOrder { get; set; }

        /// <summary>子技能（用于树状方法论结构）。</summary>
        public List<RuntimeSkill> Children { get; set; } = new();
    }
}
