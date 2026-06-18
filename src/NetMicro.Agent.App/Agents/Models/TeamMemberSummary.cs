namespace NetMicro.Agent.App.Agents.Models
{
    /// <summary>
    /// 团队成员摘要：用于在运行时快照中向当前员工暴露同团队其他成员的最小信息集，
    /// 供 delegate_to_employee 工具的 system prompt 渲染与目标合法性校验使用。
    /// </summary>
    public class TeamMemberSummary
    {
        /// <summary>成员员工唯一编码。</summary>
        public string EmployeeKey { get; set; } = string.Empty;

        /// <summary>成员展示名称。</summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>成员描述。</summary>
        public string? Description { get; set; }

        /// <summary>RoleProfile 摘要：取角色画像前 200 字，避免 system prompt 膨胀。</summary>
        public string? RoleProfileSummary { get; set; }
    }
}
