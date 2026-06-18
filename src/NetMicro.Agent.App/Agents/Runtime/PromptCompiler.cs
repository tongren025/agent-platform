using System.Text;
using NetMicro.Agent.App.Agents.DeepAgent;
using NetMicro.Agent.App.Agents.Models;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 将数字员工运行时快照编译为可直接喂给 LLM 的 system prompt。
    /// </summary>
    public class PromptCompiler
    {
        public PromptCompileResult Compile(
            EmployeeRuntimeSnapshot snapshot,
            List<string> activeScopes,
            string? structuredSchemaJson = null)
        {
            var visibleSkills = CollectSkills(snapshot, activeScopes);
            var visibleSkillTrees = CollectSkillTrees(snapshot, activeScopes);
            var visibleTools = CollectTools(
                snapshot,
                activeScopes,
                includeSkillDetail: visibleSkills.Count > 0 || visibleSkillTrees.Count > 0,
                includeDeepAgent: snapshot.DeepAgent);
            var visibleMcpServers = CollectMcpServers(snapshot, activeScopes);

            var sections = new List<string>();

            var profileContent = snapshot.SystemPromptBlock?.Content?.Trim();
            if (!string.IsNullOrEmpty(profileContent))
            {
                sections.Add($"<role_profile>\n{profileContent}\n</role_profile>");
            }

            // DeepAgent 工作准则 + 可用子 Agent 清单（紧跟角色画像，作为高优先级总纲）
            if (snapshot.DeepAgent)
            {
                sections.Add(BuildDeepAgentWorkflow(snapshot));
            }

            // 团队成员清单：仅当员工挂团队且团队中存在其他成员时渲染。
            // 与 DeepAgent 解耦——delegate_to_employee 工具的注入条件只看 TeamCode 是否非空，
            // 因此该段独立于 deep_agent_workflow 输出，避免 DeepAgent 关闭时 LLM 看不到同事清单。
            var teamMembersBlock = BuildTeamMembersSection(snapshot);
            if (!string.IsNullOrEmpty(teamMembersBlock))
            {
                sections.Add(teamMembersBlock);
            }

            if (visibleSkillTrees.Count > 0)
            {
                var skillBlocks = visibleSkillTrees
                    .Select(RenderSkillBlock)
                    .Where(block => !string.IsNullOrEmpty(block))
                    .ToList();
                if (skillBlocks.Count > 0)
                {
                    var sb = new StringBuilder();
                    sb.Append("<skills>\n");
                    sb.Append("<instruction>以下是你的方法论技能简介。先根据 summary 判断是否相关；需要完整内容时调用 get_skill_detail 查看详情。</instruction>\n");
                    sb.Append(string.Join("\n", skillBlocks));
                    sb.Append("\n</skills>");
                    sections.Add(sb.ToString());
                }
            }

            if (visibleTools.Count > 0)
            {
                var toolBlocks = visibleTools.Select(tool =>
                {
                    var sb = new StringBuilder();
                    sb.Append($"<tool code=\"{tool.ToolCode}\" binding_code=\"{tool.BindingCode}\">\n");
                    sb.Append($"<name>{tool.Name}</name>\n");
                    sb.Append($"<description>{(string.IsNullOrEmpty(tool.Description) ? "按工具说明使用" : tool.Description)}</description>\n");
                    if (!string.IsNullOrWhiteSpace(tool.InputSchema))
                        sb.Append($"<input_schema>{tool.InputSchema.Trim()}</input_schema>\n");
                    sb.Append("</tool>");
                    return sb.ToString();
                });
                sections.Add("<tools>\n<instruction>调用工具时，参数必须严格符合 input_schema 定义的 JSON Schema。required 字段必传，additionalProperties=false 表示不允许传多余字段。</instruction>\n" + string.Join("\n", toolBlocks) + "\n</tools>");
            }

            if (visibleMcpServers.Count > 0)
            {
                var mcpBlocks = visibleMcpServers.Select(server =>
                    $"<mcp_server code=\"{server.ServerCode}\" binding_code=\"{server.BindingCode}\">\n" +
                    $"<name>{server.Name}</name>\n" +
                    $"<description>{(string.IsNullOrEmpty(server.Description) ? "按能力说明使用" : server.Description)}</description>\n" +
                    "</mcp_server>");
                sections.Add("<mcp_servers>\n" + string.Join("\n", mcpBlocks) + "\n</mcp_servers>");
            }

            var systemPrompt = string.Join("\n\n", sections.Where(s => !string.IsNullOrEmpty(s))).Trim();

            return new PromptCompileResult
            {
                SystemPrompt = systemPrompt,
                ResponseInstruction = BuildResponseInstruction(structuredSchemaJson),
                ActiveScopes = activeScopes,
                ResolvedModelConfig = new Dictionary<string, object?>(snapshot.DefaultModelPolicy),
                VisibleSkills = visibleSkills,
                VisibleSkillTrees = visibleSkillTrees,
                VisibleTools = visibleTools,
                VisibleMcpServers = visibleMcpServers,
            };
        }

        private static List<RuntimeSkill> CollectSkills(
            EmployeeRuntimeSnapshot snapshot,
            List<string> activeScopes)
        {
            var skills = new List<RuntimeSkill>();
            foreach (var scope in activeScopes)
            {
                if (!snapshot.SkillsByScope.TryGetValue(scope, out var scopeSkills)) continue;
                skills.AddRange(scopeSkills
                    .OrderBy(item => item.SortOrder)
                    .ThenBy(item => item.Name)
                    .ThenBy(item => item.Code));
            }
            return skills;
        }

        private static List<RuntimeSkill> CollectSkillTrees(
            EmployeeRuntimeSnapshot snapshot,
            List<string> activeScopes)
        {
            var trees = new List<RuntimeSkill>();
            foreach (var scope in activeScopes)
            {
                if (!snapshot.SkillTreesByScope.TryGetValue(scope, out var scopeTrees)) continue;
                trees.AddRange(scopeTrees
                    .OrderBy(item => item.SortOrder)
                    .ThenBy(item => item.Name)
                    .ThenBy(item => item.Code));
            }
            return trees;
        }

        private static List<RuntimeTool> CollectTools(
            EmployeeRuntimeSnapshot snapshot,
            List<string> activeScopes,
            bool includeSkillDetail,
            bool includeDeepAgent = false)
        {
            var tools = new List<RuntimeTool>();
            var seen = new HashSet<(string ToolCode, string BindingCode)>();
            foreach (var scope in activeScopes)
            {
                if (!snapshot.ToolsByScope.TryGetValue(scope, out var scopeTools)) continue;
                foreach (var tool in scopeTools
                             .OrderBy(item => item.SortOrder)
                             .ThenBy(item => item.Name)
                             .ThenBy(item => item.ToolCode))
                {
                    var key = (tool.ToolCode, tool.BindingCode);
                    if (!seen.Add(key)) continue;
                    tools.Add(tool);
                }
            }
            // 透传 snapshot：让 PlatformInfraToolRegistry 按 TeamCode/HasKnowledgeBase 条件注入
            // delegate_to_employee / query_knowledge_base 等需要员工上下文的平台内置工具。
            foreach (var tool in PlatformInfraToolRegistry.GetPlatformInfraTools(snapshot, includeSkillDetail, includeDeepAgent))
            {
                var key = (tool.ToolCode, tool.BindingCode);
                if (!seen.Add(key)) continue;
                tools.Add(tool);
            }
            return tools;
        }

        /// <summary>构建 DeepAgent 工作准则 + 可用子 Agent 清单。</summary>
        private static string BuildDeepAgentWorkflow(EmployeeRuntimeSnapshot snapshot)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<deep_agent_workflow>");
            sb.AppendLine("你具备 DeepAgent 能力：规划清单、虚拟文件系统、子 Agent 派发、人工审批、Shell 执行、JS 解释器。请遵循以下准则：");
            sb.AppendLine("1. 先规划再行动：面对多步任务（如\"解析→解释→预检→创建\"），先用 write_todos 列出步骤；开始某步时标 in_progress，完成后标 completed，推进中按需调整清单。");
            sb.AppendLine("2. 卸载大块上下文：遇到超大的输入或工具结果（完整解析 JSON、长 Excel 文本），用 write_file 暂存为虚拟文件，需要时再用 read_file 按需读取，保持主对话精简。系统也会自动把过大的工具结果落盘并只回你一个文件指针。");
            sb.AppendLine("3. 按需委派，保持高效：每次 LLM 调用都有成本，不要为小事滥用工具。只有当输入很大（多列、多组、超长文本）或解析特别繁重时，才用 task 把\"逐列解析成结构化 JSON\"交给子 Agent；它在隔离上下文完成后把产物写进虚拟文件并只回摘要，你再 read_file 取结果，主对话不被长 JSON 污染。输入很小时直接自己解析解释，不必派子 Agent，也不必为每一步都建文件。");
            sb.AppendLine("4. 先验证后提交：调用 create_strategy 前必须先 precheck_strategy；对任何破坏性或高风险操作，先用 require_approval 请求人工审批，等运营确认后再执行。");
            sb.AppendLine("5. 数据变换用 interpret_js：需要对工具结果做 map/filter/reduce、格式转换、数值计算时，用 interpret_js 执行 JS 代码片段，避免在主对话中手工拼接。JS 代码可通过 fs.read/fs.write 与虚拟文件系统交互。");
            sb.AppendLine("6. 系统命令用 execute：需要查看环境信息、运行诊断命令时用 execute。仅允许白名单内的安全命令，有超时和输出限制。");
            sb.AppendLine("7. 收尾核对：回复运营前回看 todo 清单，确认该做的都做了。");

            var subAgents = SubAgentRegistry.Build(snapshot);
            if (subAgents.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("可用子 Agent（task 的 subagent_type 取值）：");
                sb.AppendLine("<subagents>");
                foreach (var sa in subAgents)
                    sb.Append("  <subagent type=\"").Append(sa.Type).Append("\">").Append(sa.Description).AppendLine("</subagent>");
                sb.AppendLine("</subagents>");
            }

            sb.Append("</deep_agent_workflow>");
            return sb.ToString();
        }

        /// <summary>
        /// 渲染 &lt;team_members&gt; 段：列出同 team 其他成员的 EmployeeKey / Name / Description / RoleProfile 摘要，
        /// 仅当 snapshot.TeamCode 非空且 TeamMembers 列表非空时返回非空字符串。
        /// </summary>
        private static string BuildTeamMembersSection(EmployeeRuntimeSnapshot snapshot)
        {
            if (string.IsNullOrEmpty(snapshot.TeamCode) || snapshot.TeamMembers.Count == 0)
            {
                return string.Empty;
            }

            var sb = new StringBuilder();
            sb.Append("你属于团队 `").Append(snapshot.TeamCode).Append("`，可通过 `delegate_to_employee` 工具把任务派发给以下同事之一：");
            sb.AppendLine();
            sb.AppendLine("<team_members>");
            foreach (var member in snapshot.TeamMembers)
            {
                sb.AppendLine("  <member>");
                sb.Append("    <employeeKey>").Append(member.EmployeeKey).AppendLine("</employeeKey>");
                sb.Append("    <name>").Append(member.Name).AppendLine("</name>");
                sb.Append("    <description>").Append(member.Description ?? string.Empty).AppendLine("</description>");
                sb.Append("    <roleProfile>").Append(member.RoleProfileSummary ?? string.Empty).AppendLine("</roleProfile>");
                sb.AppendLine("  </member>");
            }
            sb.Append("</team_members>");
            return sb.ToString();
        }

        private static List<RuntimeMcpServer> CollectMcpServers(
            EmployeeRuntimeSnapshot snapshot,
            List<string> activeScopes)
        {
            var servers = new List<RuntimeMcpServer>();
            foreach (var scope in activeScopes)
            {
                if (!snapshot.McpByScope.TryGetValue(scope, out var scopeServers)) continue;
                servers.AddRange(scopeServers
                    .OrderBy(item => item.SortOrder)
                    .ThenBy(item => item.Name)
                    .ThenBy(item => item.ServerCode));
            }
            return servers;
        }

        private static string BuildResponseInstruction(string? structuredSchemaJson)
        {
            if (string.IsNullOrWhiteSpace(structuredSchemaJson))
            {
                return string.Empty;
            }
            return
                "<output_contract>\n" +
                "<rule>最终结果必须严格符合以下 JSON Schema。</rule>\n" +
                "<rule>不要输出 Schema 之外的字段。</rule>\n" +
                "<rule>如果字段值无法确认，请基于已有证据给出最稳妥的结果，不要编造新事实。</rule>\n" +
                $"<json_schema>{structuredSchemaJson}</json_schema>\n" +
                "</output_contract>";
        }

        private static string RenderSkillBlock(RuntimeSkill skill)
        {
            var summaryText = (skill.Summary ?? skill.Description ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(summaryText))
            {
                return string.Empty;
            }

            var lines = new List<string>
            {
                $"<skill code=\"{skill.Code}\" binding_code=\"{skill.BindingCode}\" required=\"{(skill.Required ? "true" : "false")}\">",
                $"<name>{skill.Name}</name>",
                $"<summary>{summaryText}</summary>",
            };

            var subSkillBlocks = new List<string>();
            foreach (var child in skill.Children)
            {
                var childSummary = (child.Summary ?? child.Description ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(childSummary)) continue;
                subSkillBlocks.Add(string.Join("\n", new[]
                {
                    $"<sub_skill code=\"{child.Code}\">",
                    $"<name>{child.Name}</name>",
                    $"<summary>{childSummary}</summary>",
                    "</sub_skill>",
                }));
            }
            if (subSkillBlocks.Count > 0)
            {
                lines.Add("<sub_skills>");
                lines.AddRange(subSkillBlocks);
                lines.Add("</sub_skills>");
            }
            lines.Add("</skill>");
            return string.Join("\n", lines);
        }
    }
}
