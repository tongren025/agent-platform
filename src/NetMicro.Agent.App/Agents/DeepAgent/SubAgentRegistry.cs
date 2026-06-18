using System.Text;
using NetMicro.Agent.App.Agents.Models;

namespace NetMicro.Agent.App.Agents.DeepAgent
{
    /// <summary>
    /// 根据员工运行时快照构建本轮可用的子 Agent 定义。
    /// 关键点：把体量巨大的解析规则（技能树子技能描述）塞进"解析"子 Agent 的系统提示，
    /// 而不是主 Agent 的上下文——主 Agent 只看到子 Agent 的一句简介。
    /// </summary>
    public static class SubAgentRegistry
    {
        /// <summary>子 Agent 默认可用的虚拟文件系统工具。</summary>
        private static readonly List<string> FileTools = new() { "read_file", "write_file", "ls" };

        public static List<SubAgentDefinition> Build(EmployeeRuntimeSnapshot snapshot)
        {
            var list = new List<SubAgentDefinition>();

            // 1) 解析子 Agent：把技能树里所有子技能的完整规则拼成它的系统提示
            var ruleBlocks = new StringBuilder();
            foreach (var tree in snapshot.SkillTreesByScope.SelectMany(kv => kv.Value))
            {
                foreach (var child in tree.Children ?? new List<RuntimeSkill>())
                {
                    var rule = (child.Description ?? child.Summary ?? "").Trim();
                    if (string.IsNullOrEmpty(rule)) continue;
                    ruleBlocks.Append("\n\n## 模板类型：").Append(child.Name).Append(" (code=").Append(child.Code).Append(")\n").Append(rule);
                }
            }

            if (ruleBlocks.Length > 0)
            {
                var prompt = new StringBuilder();
                prompt.AppendLine("你是策略 Excel 解析专家，在隔离上下文中专注完成一次解析子任务。");
                prompt.AppendLine();
                prompt.AppendLine("## 工作方式");
                prompt.AppendLine("1. 先用 read_file 读取主 Agent 指定的输入文件（通常包含 Excel 文本）。");
                prompt.AppendLine("2. 判断模板类型（recharge / user_segments / payment_board），套用对应规则解析。");
                prompt.AppendLine("3. 用 write_file 把解析出的 JSON 写入主 Agent 指定的输出文件。");
                prompt.AppendLine("4. 最终只回复一句话的中文摘要（识别到几组配置、模板类型、有无明显问题），不要把完整 JSON 贴回来。");
                prompt.AppendLine();
                prompt.AppendLine("## 完整解析规则（按模板类型选用）");
                prompt.Append(ruleBlocks);

                list.Add(new SubAgentDefinition
                {
                    Type = "strategy-parser",
                    Description = "策略解析专家：读取输入文件中的 Excel 文本，套用完整字段映射与 Schema 规则解析成结构化 JSON 并写入输出文件，只回摘要。把繁重解析交给它可让主对话保持干净。",
                    SystemPrompt = prompt.ToString(),
                    ToolCodes = FileTools
                });
            }

            // 2) 通用子 Agent：处理与解析无关的杂活
            list.Add(new SubAgentDefinition
            {
                Type = "general",
                Description = "通用子任务执行器：在隔离上下文中完成一段聚焦的工作（整理、归纳、转换等），可读写虚拟文件，只回简短结论。",
                SystemPrompt =
                    "你是一个聚焦的子任务执行器，在隔离上下文中完成主 Agent 交给你的一件具体事情。" +
                    "可用 read_file/write_file/ls 读写虚拟文件。完成后只回复简短结论，必要时把详细产物写进文件，不要长篇贴回。",
                ToolCodes = FileTools
            });

            return list;
        }
    }
}
