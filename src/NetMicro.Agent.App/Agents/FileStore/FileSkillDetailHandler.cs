using NetMicro.Agent.App.Agents.Models;
using NetMicro.Agent.App.Agents.Registry;
using NetMicro.Agent.App.Agents.Runtime;
using Newtonsoft.Json;

namespace NetMicro.Agent.App.Agents.FileStore
{
    /// <summary>
    /// 文件模式下的 get_skill_detail 工具：通过员工 + Skill 注册中心查询技能详情。
    /// refs 模型下员工不再内嵌 skills，因此先取员工的 SkillRefs，再到 SkillRegistryService 解析；
    /// 同时支持递归在 IsTree 技能的 Children 中查找子技能。
    /// </summary>
    public class FileSkillDetailHandler : IAgentToolHandler
    {
        private readonly EmployeeRegistryService _employees;
        private readonly SkillRegistryService _skillRegistry;
        private readonly ILogger<FileSkillDetailHandler> _logger;

        public string ToolCode => "get_skill_detail";

        public FileSkillDetailHandler(
            EmployeeRegistryService employees,
            SkillRegistryService skillRegistry,
            ILogger<FileSkillDetailHandler> logger)
        {
            _employees = employees;
            _skillRegistry = skillRegistry;
            _logger = logger;
        }

        public Task<string> HandleAsync(AgentToolContext context, CancellationToken cancellationToken)
        {
            string? skillCode = null;
            if (!string.IsNullOrEmpty(context.ArgumentsJson))
            {
                try
                {
                    var args = JsonConvert.DeserializeObject<Dictionary<string, string>>(context.ArgumentsJson);
                    args?.TryGetValue("code", out skillCode);
                    if (skillCode == null) args?.TryGetValue("skill_code", out skillCode);
                }
                catch { }
            }

            if (string.IsNullOrEmpty(skillCode))
                return Task.FromResult("{\"error\": \"缺少 code 参数\"}");

            var employee = _employees.Get(context.EmployeeKey);
            if (employee == null)
                return Task.FromResult($"{{\"error\": \"员工配置不存在: {context.EmployeeKey}\"}}");

            // 先在该员工绑定的 skillRefs 中检索；命中后从 SkillRegistryService 取详情
            var matchedCode = employee.SkillRefs?.FirstOrDefault(c =>
                string.Equals(c, skillCode, StringComparison.OrdinalIgnoreCase));

            if (matchedCode != null)
            {
                var def = _skillRegistry.Get(matchedCode);
                if (def != null)
                {
                    _logger.LogInformation("查询技能详情: {SkillCode}", skillCode);
                    return Task.FromResult(JsonConvert.SerializeObject(new
                    {
                        code = def.Code,
                        name = def.Name,
                        description = def.Description ?? def.Summary ?? "无详细描述"
                    }));
                }
            }

            // 未在顶层匹配到，则递归搜索员工 skillRefs 指向的树型技能的 children
            if (employee.SkillRefs is { Count: > 0 })
            {
                foreach (var refCode in employee.SkillRefs)
                {
                    var parent = _skillRegistry.Get(refCode);
                    if (parent == null || !parent.IsTree || parent.Children is not { Count: > 0 })
                        continue;

                    var child = FindChildRecursive(parent.Children, skillCode);
                    if (child != null)
                    {
                        _logger.LogInformation("查询子技能详情: {ParentCode}/{SkillCode}", parent.Code, skillCode);
                        return Task.FromResult(JsonConvert.SerializeObject(new
                        {
                            code = child.Code,
                            name = child.Name,
                            description = child.Description ?? child.Summary ?? "无详细描述"
                        }));
                    }
                }
            }

            return Task.FromResult($"{{\"error\": \"技能 {skillCode} 不存在\"}}");
        }

        private static RuntimeSkill? FindChildRecursive(IEnumerable<RuntimeSkill> children, string skillCode)
        {
            foreach (var c in children)
            {
                if (string.Equals(c.Code, skillCode, StringComparison.OrdinalIgnoreCase))
                    return c;
                if (c.Children is { Count: > 0 })
                {
                    var deeper = FindChildRecursive(c.Children, skillCode);
                    if (deeper != null) return deeper;
                }
            }
            return null;
        }
    }
}
