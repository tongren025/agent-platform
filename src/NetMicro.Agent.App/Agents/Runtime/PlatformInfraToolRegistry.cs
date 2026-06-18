using NetMicro.Agent.App.Agents.Models;

namespace NetMicro.Agent.App.Agents.Runtime
{
    /// <summary>
    /// 平台内置基础设施工具：与具体数字员工无关，按需注入。
    /// 每个工具带完整的 InputSchema（JSON Schema），LLM 精确传参，不靠猜。
    /// </summary>
    public static class PlatformInfraToolRegistry
    {
        private const string PlatformBindingCode = "platform";

        /// <summary>
        /// 主入口：按数字员工运行时快照按条件注入平台内置工具。
        /// 既兼容旧的二参版本（沿用 includeSkillDetail / includeDeepAgent），又新增按 snapshot 字段
        /// 条件注入 <c>delegate_to_employee</c>（团队协作）与 <c>query_knowledge_base</c>（知识库检索）。
        /// </summary>
        public static IReadOnlyList<RuntimeTool> GetPlatformInfraTools(
            EmployeeRuntimeSnapshot snapshot,
            bool includeSkillDetail,
            bool includeDeepAgent = false)
        {
            var tools = new List<RuntimeTool>(GetPlatformInfraTools(includeSkillDetail, includeDeepAgent));

            if (snapshot == null)
            {
                return tools;
            }

            // ── delegate_to_employee：仅在挂团队且团队中存在其他成员时注入 ──
            // 与 DelegateToEmployeeHandler.ToolCode 保持一致（"delegate_to_employee"）。
            if (!string.IsNullOrWhiteSpace(snapshot.TeamCode) && snapshot.TeamMembers.Count > 0)
            {
                tools.Add(Infra("delegate_to_employee",
                    "把任务派发给同团队的其他数字员工。仅当确实需要他人专业能力时使用；避免环路/深度过深，否则会被熔断。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""employeeKey"":{""type"":""string"",""description"":""目标员工的 employeeKey，必须从 <team_members> 中选择""},
    ""task"":{""type"":""string"",""description"":""派发给目标员工的具体任务描述（自然语言）""},
    ""context"":{""type"":""string"",""description"":""可选的上下文/背景信息，会拼接到 task 后面""}
  },
  ""required"":[""employeeKey"",""task""],
  ""additionalProperties"":false
}", 1020));
            }

            // ── query_knowledge_base：仅在员工挂知识库时注入 ──
            // Phase 2 仅落工具骨架，Handler 在 Phase 3 接入真实检索后才有实际效果。
            if (snapshot.HasKnowledgeBase)
            {
                tools.Add(Infra("query_knowledge_base",
                    "在该员工挂载的知识库中检索相关片段。返回 chunk 文本与来源引用。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""query"":{""type"":""string"",""description"":""检索关键词或问题（自然语言）""},
    ""topK"":{""type"":""integer"",""description"":""返回的片段数量上限，默认 5"",""minimum"":1,""maximum"":20,""default"":5}
  },
  ""required"":[""query""],
  ""additionalProperties"":false
}", 1030));
            }

            return tools;
        }

        /// <summary>
        /// 兼容旧签名：不带 snapshot 时仅按 includeSkillDetail / includeDeepAgent 注入基础工具。
        /// 不再注入需要员工上下文判断的 delegate_to_employee / query_knowledge_base。
        /// </summary>
        public static IReadOnlyList<RuntimeTool> GetPlatformInfraTools(bool includeSkillDetail, bool includeDeepAgent = false)
        {
            var tools = new List<RuntimeTool>();

            if (includeSkillDetail)
            {
                tools.Add(Infra("get_skill_detail",
                    "根据 skill code 拉取该方法论/技能的完整描述。在 summary 不足以决策时使用。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""code"":{""type"":""string"",""description"":""技能编码，从 <skills> 中的 code 属性获取""}
  },
  ""required"":[""code""],
  ""additionalProperties"":false
}", 1000));
            }

            if (includeDeepAgent)
            {
                // ── 规划 ──
                tools.Add(Infra("write_todos",
                    "把复杂任务拆成 todo 清单并跟踪进度。每次传入完整清单（含已完成项），系统整体替换。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""todos"":{
      ""type"":""array"",
      ""description"":""完整的 todo 列表，每次调用整体替换（包含已完成项）"",
      ""items"":{
        ""type"":""object"",
        ""properties"":{
          ""content"":{""type"":""string"",""description"":""步骤描述""},
          ""status"":{""type"":""string"",""enum"":[""pending"",""in_progress"",""completed""],""description"":""状态：pending=待做，in_progress=进行中，completed=已完成"",""default"":""pending""}
        },
        ""required"":[""content""]
      }
    }
  },
  ""required"":[""todos""],
  ""additionalProperties"":false
}", 1010));

                // ── 虚拟文件系统 ──
                tools.Add(Infra("ls",
                    "列出虚拟文件系统中的所有文件及字符数。无参数。",
                    /*lang=json*/ @"{""type"":""object"",""properties"":{},""additionalProperties"":false}", 1011));

                tools.Add(Infra("read_file",
                    "读取虚拟文件内容，支持按行分页读取大文件。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""path"":{""type"":""string"",""description"":""文件路径（从 ls 结果中获取）""},
    ""offset"":{""type"":""integer"",""description"":""起始行号（0 起），省略则从头读"",""minimum"":0},
    ""limit"":{""type"":""integer"",""description"":""读取行数，省略则读全部"",""minimum"":1}
  },
  ""required"":[""path""],
  ""additionalProperties"":false
}", 1012));

                tools.Add(Infra("write_file",
                    "写入/覆盖虚拟文件。用于暂存大块中间数据（如解析 JSON、Excel 文本），保持主对话精简。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""path"":{""type"":""string"",""description"":""文件路径，如 parse_result.json、input.txt""},
    ""content"":{""type"":""string"",""description"":""文件内容（纯文本）""}
  },
  ""required"":[""path"",""content""],
  ""additionalProperties"":false
}", 1013));

                tools.Add(Infra("edit_file",
                    "按字符串替换编辑虚拟文件。old_string 必须在文件中唯一匹配，或设 replace_all=true 全部替换。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""path"":{""type"":""string"",""description"":""文件路径""},
    ""old_string"":{""type"":""string"",""description"":""要被替换的原文（必须非空且在文件中存在）""},
    ""new_string"":{""type"":""string"",""description"":""替换后的新文本""},
    ""replace_all"":{""type"":""boolean"",""description"":""是否替换所有匹配。false（默认）时 old_string 必须唯一"",""default"":false}
  },
  ""required"":[""path"",""old_string"",""new_string""],
  ""additionalProperties"":false
}", 1014));

                // ── 子 Agent ──
                tools.Add(Infra("task",
                    "把聚焦子任务派发到隔离上下文的子 Agent。子 Agent 共享虚拟文件系统但有独立对话历史，适合繁重解析。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""subagent_type"":{""type"":""string"",""description"":""子 Agent 类型，从 <subagents> 中的 type 属性选取。只有一个子 Agent 时可省略""},
    ""description"":{""type"":""string"",""description"":""交给子 Agent 的具体任务描述，要足够详细（包含输入文件路径、输出要求等）""}
  },
  ""required"":[""description""],
  ""additionalProperties"":false
}", 1015));

                // ── 人工审批 ──
                tools.Add(Infra("require_approval",
                    "请求人工审批。在执行破坏性/高风险操作前暂停执行，等待运营在前端确认后继续。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""description"":{""type"":""string"",""description"":""需要审批的操作描述，会展示给运营看""},
    ""action_type"":{""type"":""string"",""description"":""操作类型标识，如 create_strategy、rollback_strategy"",""default"":""unknown""},
    ""arguments"":{""type"":""string"",""description"":""相关参数 JSON（可选，用于审计）""}
  },
  ""required"":[""description""],
  ""additionalProperties"":false
}", 1016));

                // ── Shell 执行 ──
                tools.Add(Infra("execute",
                    "在受限沙箱中执行系统命令。仅允许白名单命令，有超时（30s）和输出限制（10000字符）。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""command"":{""type"":""string"",""description"":""要执行的命令（必须以白名单命令开头，如 echo、ls、grep、dotnet、node）""},
    ""working_dir"":{""type"":""string"",""description"":""工作目录（可选，默认为应用根目录）""}
  },
  ""required"":[""command""],
  ""additionalProperties"":false
}", 1017));

                // ── JS 解释器 ──
                tools.Add(Infra("interpret_js",
                    "在沙箱中执行 JavaScript 代码。用于数据变换（map/filter/reduce）、格式转换、数值计算。可通过 fs.read(path)/fs.write(path,content) 操作虚拟文件，通过 todos.list() 读取规划清单。",
                    /*lang=json*/ @"{
  ""type"":""object"",
  ""properties"":{
    ""code"":{""type"":""string"",""description"":""要执行的 JavaScript 代码。最后一个表达式的值作为返回值。可用 fs.read/fs.write/fs.list/fs.exists 操作虚拟文件，console.log 输出日志。5秒超时，50MB 内存限制。""}
  },
  ""required"":[""code""],
  ""additionalProperties"":false
}", 1018));
            }

            return tools;
        }

        private static RuntimeTool Infra(string code, string description, string? inputSchema, int sort) => new()
        {
            ToolCode = code,
            BindingCode = PlatformBindingCode,
            Name = code,
            Description = description,
            InputSchema = inputSchema,
            SortOrder = sort,
        };
    }
}
