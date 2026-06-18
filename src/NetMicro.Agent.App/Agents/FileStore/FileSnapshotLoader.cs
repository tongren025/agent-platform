using NetMicro.Agent.App.Agents.Models;
using NetMicro.Agent.App.Agents.Registry;
using NetMicro.Agent.App.Agents.Services;

namespace NetMicro.Agent.App.Agents.FileStore
{
    /// <summary>
    /// 基于本地 JSON 文件的 SnapshotLoader（文件模式，不依赖 MongoDB）。
    /// 通过 EmployeeRegistryService 加载员工定义（refs 引用语义），
    /// 再到 Skill / Tool / McpServer 注册中心解析 refs，最终装配运行时快照。
    /// </summary>
    public class FileSnapshotLoader : ISnapshotLoader
    {
        private readonly EmployeeRegistryService _employees;
        private readonly SkillRegistryService _skillRegistry;
        private readonly ToolRegistryService _toolRegistry;
        private readonly McpServerRegistryService _mcpRegistry;
        private readonly TeamRegistryService _teamRegistry;
        private readonly ILogger<FileSnapshotLoader> _logger;

        public FileSnapshotLoader(
            EmployeeRegistryService employees,
            SkillRegistryService skillRegistry,
            ToolRegistryService toolRegistry,
            McpServerRegistryService mcpRegistry,
            TeamRegistryService teamRegistry,
            ILogger<FileSnapshotLoader> logger)
        {
            _employees = employees;
            _skillRegistry = skillRegistry;
            _toolRegistry = toolRegistry;
            _mcpRegistry = mcpRegistry;
            _teamRegistry = teamRegistry;
            _logger = logger;
        }

        public Task<EmployeeRuntimeSnapshot?> LoadAsync(string employeeKey, IReadOnlyList<string> activeScopes)
        {
            // 通过员工注册中心加载定义，替代直接读 JSON 文件的旧实现
            var employee = _employees.Get(employeeKey);
            if (employee == null)
            {
                _logger.LogWarning("员工配置不存在: {EmployeeKey}", employeeKey);
                return Task.FromResult<EmployeeRuntimeSnapshot?>(null);
            }

            var snapshot = new EmployeeRuntimeSnapshot
            {
                SystemPromptBlock = new SystemPromptBlock { Content = employee.RoleProfile },
                DeepAgent = employee.DeepAgent,
                // 从员工定义透传：用于 PlatformInfraToolRegistry 条件注入 query_knowledge_base 工具
                HasKnowledgeBase = employee.HasKnowledgeBase,
                DefaultModelPolicy = employee.DefaultModelPolicy is { Count: > 0 }
                    ? employee.DefaultModelPolicy
                    : new Dictionary<string, object?>
                    {
                        ["model_id"] = "gpt-4o",
                        ["temperature"] = 0.7,
                        ["max_tokens"] = 4096
                    }
            };

            // ── 从注册中心解析 Skill 引用（skillRefs）──
            if (employee.SkillRefs is { Count: > 0 })
            {
                foreach (var skillCode in employee.SkillRefs)
                {
                    var def = _skillRegistry.Get(skillCode);
                    if (def == null) { _logger.LogWarning("Skill 引用 {Code} 在注册中心不存在，跳过", skillCode); continue; }

                    // 引用的 skill 默认放 global scope
                    const string scope = "global";
                    if (!activeScopes.Contains(scope)) continue;

                    var rs = new RuntimeSkill
                    {
                        Code = def.Code,
                        BindingCode = def.BindingCode ?? def.Code,
                        Name = def.Name,
                        Summary = def.Summary,
                        Description = def.Description,
                        Required = def.Required,
                        SortOrder = def.SortOrder
                    };

                    if (def.IsTree && def.Children is { Count: > 0 })
                    {
                        rs.Children = def.Children;
                        if (!snapshot.SkillTreesByScope.ContainsKey(scope))
                            snapshot.SkillTreesByScope[scope] = new List<RuntimeSkill>();
                        snapshot.SkillTreesByScope[scope].Add(rs);
                    }
                    else
                    {
                        if (!snapshot.SkillsByScope.ContainsKey(scope))
                            snapshot.SkillsByScope[scope] = new List<RuntimeSkill>();
                        snapshot.SkillsByScope[scope].Add(rs);
                    }
                }
            }

            // ── 从注册中心解析 Tool 引用（toolRefs）──
            if (employee.ToolRefs is { Count: > 0 })
            {
                foreach (var toolCode in employee.ToolRefs)
                {
                    var def = _toolRegistry.Get(toolCode);
                    if (def == null) { _logger.LogWarning("Tool 引用 {Code} 在注册中心不存在，跳过", toolCode); continue; }

                    const string scope = "global";
                    if (!activeScopes.Contains(scope)) continue;

                    if (!snapshot.ToolsByScope.ContainsKey(scope))
                        snapshot.ToolsByScope[scope] = new List<RuntimeTool>();

                    // 避免重复
                    if (snapshot.ToolsByScope[scope].Any(t => t.ToolCode == def.ToolCode)) continue;
                    snapshot.ToolsByScope[scope].Add(new RuntimeTool
                    {
                        ToolCode = def.ToolCode,
                        BindingCode = def.BindingCode ?? def.ToolCode,
                        Name = def.Name,
                        Description = def.Description,
                        InputSchema = def.InputSchema,
                        SortOrder = def.SortOrder
                    });
                }
            }

            // ── 从注册中心解析 MCP Server 引用（mcpServerRefs）──
            if (employee.McpServerRefs is { Count: > 0 })
            {
                foreach (var mcpCode in employee.McpServerRefs)
                {
                    var def = _mcpRegistry.Get(mcpCode);
                    if (def == null) { _logger.LogWarning("MCP Server 引用 {Code} 在注册中心不存在，跳过", mcpCode); continue; }

                    const string scope = "global";
                    if (!activeScopes.Contains(scope)) continue;

                    if (!snapshot.McpByScope.ContainsKey(scope))
                        snapshot.McpByScope[scope] = new List<RuntimeMcpServer>();

                    if (snapshot.McpByScope[scope].Any(m => m.ServerCode == def.ServerCode)) continue;
                    snapshot.McpByScope[scope].Add(new RuntimeMcpServer
                    {
                        ServerCode = def.ServerCode,
                        BindingCode = def.BindingCode ?? def.ServerCode,
                        Name = def.Name,
                        Description = def.Description,
                        SortOrder = def.SortOrder,
                        TransportType = def.TransportType,
                        Command = def.Command,
                        CommandArgs = def.CommandArgs,
                        Url = def.Url,
                        Env = def.Env
                    });
                }
            }

            // ── 装载团队上下文（用于 delegate_to_employee 工具的条件注入与目标白名单）──
            if (!string.IsNullOrWhiteSpace(employee.TeamCode))
            {
                // 无论团队是否存在，TeamCode 都写入快照，便于上层感知归属（即使是悬空 code）
                snapshot.TeamCode = employee.TeamCode;

                var team = _teamRegistry.Get(employee.TeamCode);
                if (team == null)
                {
                    // 悬空 TeamCode：团队定义缺失。保留 TeamCode 但 TeamMembers 为空，记 Warning 便于排查脏数据
                    _logger.LogWarning(
                        "员工 {EmployeeKey} 引用的 TeamCode {TeamCode} 在团队注册中心不存在，TeamMembers 留空",
                        employeeKey, employee.TeamCode);
                }
                else if (team.MemberEmployeeKeys is { Count: > 0 })
                {
                    // 装配同团队其他成员摘要（剔除自身、跳过悬空 key）
                    foreach (var otherKey in team.MemberEmployeeKeys)
                    {
                        if (string.IsNullOrWhiteSpace(otherKey)) continue;
                        if (string.Equals(otherKey, employeeKey, StringComparison.Ordinal)) continue;

                        var other = _employees.Get(otherKey);
                        if (other == null)
                        {
                            _logger.LogWarning(
                                "团队 {TeamCode} 的成员 {OtherKey} 在员工注册中心不存在，跳过",
                                employee.TeamCode, otherKey);
                            continue;
                        }

                        snapshot.TeamMembers.Add(new TeamMemberSummary
                        {
                            EmployeeKey = other.EmployeeKey,
                            Name = other.Name,
                            Description = other.Description,
                            // 取 RoleProfile 前 200 字作为摘要，避免 system prompt 膨胀
                            RoleProfileSummary = BuildRoleProfileSummary(other.RoleProfile)
                        });
                    }
                }
            }

            _logger.LogInformation(
                "从员工注册中心加载员工配置: {EmployeeKey} scopes={Scopes} teamCode={TeamCode} teamMembers={TeamMemberCount}",
                employeeKey, string.Join(",", activeScopes), snapshot.TeamCode ?? "<none>", snapshot.TeamMembers.Count);

            return Task.FromResult<EmployeeRuntimeSnapshot?>(snapshot);
        }

        /// <summary>
        /// 从原始 RoleProfile 抽取摘要：取前 200 字。
        /// 超长截断时追加省略号以告知调用方此为摘要。null/空白原样返回 null。
        /// </summary>
        private static string? BuildRoleProfileSummary(string? roleProfile)
        {
            if (string.IsNullOrWhiteSpace(roleProfile)) return null;
            const int maxLen = 200;
            var trimmed = roleProfile.Trim();
            return trimmed.Length <= maxLen ? trimmed : trimmed.Substring(0, maxLen) + "…";
        }
    }
}
