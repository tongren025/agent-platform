using Microsoft.AspNetCore.Mvc;
using NetMicro.Agent.App.Agents.Knowledge;
using NetMicro.Agent.App.Agents.McpClient;
using NetMicro.Agent.App.Agents.Registry;

namespace NetMicro.Agent.App.Controllers.v1
{
    /// <summary>
    /// 注册中心管理 API — Skill / MCP Server / Tool / Employee / RoleTemplate 的增删改查。
    /// 路由前缀统一为 /api/v1/agentapp/registry/*。
    /// </summary>
    public class RegistryController : BaseController
    {
        private readonly SkillRegistryService _skills;
        private readonly McpServerRegistryService _mcpServers;
        private readonly ToolRegistryService _tools;
        private readonly EmployeeRegistryService _employees;
        private readonly RoleTemplateRegistryService _roleTemplates;
        private readonly TeamRegistryService _teams;
        private readonly IEmployeeKnowledgeStore _knowledge;
        private readonly ILogger<RegistryController> _logger;

        public RegistryController(
            SkillRegistryService skills,
            McpServerRegistryService mcpServers,
            ToolRegistryService tools,
            EmployeeRegistryService employees,
            RoleTemplateRegistryService roleTemplates,
            TeamRegistryService teams,
            IEmployeeKnowledgeStore knowledge,
            ILogger<RegistryController> logger)
        {
            _skills = skills;
            _mcpServers = mcpServers;
            _tools = tools;
            _employees = employees;
            _roleTemplates = roleTemplates;
            _teams = teams;
            _knowledge = knowledge;
            _logger = logger;
        }

        // ══════════ Skill ══════════

        [HttpGet("/api/v1/agentapp/registry/skills")]
        public IActionResult ListSkills() => Ok(new { code = 200, data = _skills.ListAll() });

        [HttpGet("/api/v1/agentapp/registry/skills/{code}")]
        public IActionResult GetSkill(string code)
        {
            var skill = _skills.Get(code);
            return skill != null ? Ok(new { code = 200, data = skill }) : NotFound(new { code = 404, message = $"Skill {code} 不存在" });
        }

        [HttpPost("/api/v1/agentapp/registry/skills")]
        public IActionResult SaveSkill([FromBody] SkillDefinition skill)
        {
            if (string.IsNullOrWhiteSpace(skill?.Code))
                return BadRequest(new { code = 400, message = "缺少 code" });
            _skills.Save(skill);
            return Ok(new { code = 200, message = "已保存", data = skill });
        }

        [HttpDelete("/api/v1/agentapp/registry/skills/{code}")]
        public IActionResult DeleteSkill(string code)
        {
            return _skills.Delete(code)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"Skill {code} 不存在" });
        }

        // ══════════ MCP Server ══════════

        [HttpGet("/api/v1/agentapp/registry/mcp-servers")]
        public IActionResult ListMcpServers() => Ok(new { code = 200, data = _mcpServers.ListAll() });

        [HttpGet("/api/v1/agentapp/registry/mcp-servers/{code}")]
        public IActionResult GetMcpServer(string code)
        {
            var server = _mcpServers.Get(code);
            return server != null ? Ok(new { code = 200, data = server }) : NotFound(new { code = 404, message = $"MCP Server {code} 不存在" });
        }

        [HttpPost("/api/v1/agentapp/registry/mcp-servers")]
        public IActionResult SaveMcpServer([FromBody] McpServerDefinition server)
        {
            if (string.IsNullOrWhiteSpace(server?.ServerCode))
                return BadRequest(new { code = 400, message = "缺少 serverCode" });
            _mcpServers.Save(server);
            return Ok(new { code = 200, message = "已保存", data = server });
        }

        [HttpDelete("/api/v1/agentapp/registry/mcp-servers/{code}")]
        public IActionResult DeleteMcpServer(string code)
        {
            return _mcpServers.Delete(code)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"MCP Server {code} 不存在" });
        }

        /// <summary>测试 MCP Server 连接：启动进程 → 握手 → 列出工具 → 关闭。</summary>
        [HttpPost("/api/v1/agentapp/registry/mcp-servers/{code}/test")]
        public async Task<IActionResult> TestMcpServer(string code)
        {
            var def = _mcpServers.Get(code);
            if (def == null) return NotFound(new { code = 404, message = $"MCP Server {code} 不存在" });
            if (string.IsNullOrWhiteSpace(def.Command))
                return BadRequest(new { code = 400, message = "缺少 Command 配置" });

            try
            {
                await using var conn = new McpServerConnection(
                    def.ServerCode, def.Command, def.CommandArgs, def.Env, _logger);
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
                await conn.ConnectAsync(cts.Token);

                return Ok(new
                {
                    code = 200,
                    message = "连接成功",
                    data = new
                    {
                        serverCode = def.ServerCode,
                        toolCount = conn.Tools.Count,
                        tools = conn.Tools.Select(t => new { t.Name, t.Description })
                    }
                });
            }
            catch (Exception ex)
            {
                return Ok(new { code = 500, message = $"连接失败: {ex.Message}" });
            }
        }

        // ══════════ Tool ══════════

        [HttpGet("/api/v1/agentapp/registry/tools")]
        public IActionResult ListTools() => Ok(new { code = 200, data = _tools.ListAll() });

        [HttpGet("/api/v1/agentapp/registry/tools/{code}")]
        public IActionResult GetTool(string code)
        {
            var tool = _tools.Get(code);
            return tool != null ? Ok(new { code = 200, data = tool }) : NotFound(new { code = 404, message = $"Tool {code} 不存在" });
        }

        [HttpPost("/api/v1/agentapp/registry/tools")]
        public IActionResult SaveTool([FromBody] ToolDefinition tool)
        {
            if (string.IsNullOrWhiteSpace(tool?.ToolCode))
                return BadRequest(new { code = 400, message = "缺少 toolCode" });
            _tools.Save(tool);
            return Ok(new { code = 200, message = "已保存", data = tool });
        }

        [HttpDelete("/api/v1/agentapp/registry/tools/{code}")]
        public IActionResult DeleteTool(string code)
        {
            return _tools.Delete(code)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"Tool {code} 不存在" });
        }

        // ══════════ Employee ══════════

        [HttpGet("/api/v1/agentapp/registry/employees")]
        public IActionResult ListEmployees() => Ok(new { code = 200, data = _employees.ListAll() });

        [HttpGet("/api/v1/agentapp/registry/employees/{employeeKey}")]
        public IActionResult GetEmployee(string employeeKey)
        {
            var emp = _employees.Get(employeeKey);
            return emp != null ? Ok(new { code = 200, data = emp }) : NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });
        }

        /// <summary>新建员工。</summary>
        [HttpPost("/api/v1/agentapp/registry/employees")]
        public IActionResult SaveEmployee([FromBody] EmployeeDefinition employee)
        {
            if (string.IsNullOrWhiteSpace(employee?.EmployeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });
            if (ContainsUnsafeKeyChars(employee.EmployeeKey))
                return BadRequest(new { code = 400, message = "employeeKey 含非法字符（不允许 / \\ 或 ..）" });

            try
            {
                _employees.Save(employee);
                return Ok(new { code = 200, message = "已保存", data = employee });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "保存员工失败: {Key}", employee.EmployeeKey);
                return StatusCode(500, new { code = 500, message = $"保存失败: {ex.Message}" });
            }
        }

        /// <summary>
        /// 全量更新员工：读老的、保留 CreatedAt，覆盖其他字段；UpdatedAt = now。
        /// URL key 与 body.EmployeeKey 不一致返回 400；不存在返回 404。
        /// </summary>
        [HttpPut("/api/v1/agentapp/registry/employees/{employeeKey}")]
        public IActionResult UpdateEmployee(string employeeKey, [FromBody] EmployeeDefinition input)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });
            if (input == null)
                return BadRequest(new { code = 400, message = "请求体不能为空" });
            if (ContainsUnsafeKeyChars(employeeKey))
                return BadRequest(new { code = 400, message = "employeeKey 含非法字符（不允许 / \\ 或 ..）" });
            if (!string.IsNullOrWhiteSpace(input.EmployeeKey) &&
                !string.Equals(input.EmployeeKey, employeeKey, StringComparison.Ordinal))
            {
                return BadRequest(new { code = 400, message = "URL employeeKey 与请求体 EmployeeKey 不一致" });
            }

            var existing = _employees.Get(employeeKey);
            if (existing == null) return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            // 保留不可变审计字段；其余覆盖
            input.EmployeeKey = employeeKey;
            input.CreatedAt = existing.CreatedAt;
            input.UpdatedAt = DateTime.UtcNow;

            try
            {
                _employees.Save(input);
                return Ok(new { code = 200, message = "已更新", data = input });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新员工失败: {Key}", employeeKey);
                return StatusCode(500, new { code = 500, message = $"更新失败: {ex.Message}" });
            }
        }

        [HttpDelete("/api/v1/agentapp/registry/employees/{employeeKey}")]
        public IActionResult DeleteEmployee(string employeeKey)
        {
            return _employees.Delete(employeeKey)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });
        }

        /// <summary>
        /// 克隆员工：深拷贝引用列表与标签；Source 强制 "user"；CreatedAt/UpdatedAt 重置。
        /// </summary>
        [HttpPost("/api/v1/agentapp/registry/employees/{employeeKey}/clone")]
        public IActionResult CloneEmployee(string employeeKey, [FromBody] CloneEmployeeRequest body)
        {
            if (body == null || string.IsNullOrWhiteSpace(body.NewEmployeeKey) || string.IsNullOrWhiteSpace(body.NewName))
                return BadRequest(new { code = 400, message = "缺少 newEmployeeKey 或 newName" });
            if (ContainsUnsafeKeyChars(body.NewEmployeeKey))
                return BadRequest(new { code = 400, message = "newEmployeeKey 含非法字符（不允许 / \\ 或 ..）" });

            var source = _employees.Get(employeeKey);
            if (source == null) return NotFound(new { code = 404, message = $"源员工 {employeeKey} 不存在" });

            if (_employees.Exists(body.NewEmployeeKey))
                return Conflict(new { code = 409, message = $"目标 employeeKey 已存在: {body.NewEmployeeKey}" });

            var now = DateTime.UtcNow;
            var clone = new EmployeeDefinition
            {
                EmployeeKey = body.NewEmployeeKey,
                Name = body.NewName,
                Description = source.Description,
                RoleProfile = source.RoleProfile,
                DeepAgent = source.DeepAgent,
                DefaultModelPolicy = source.DefaultModelPolicy != null
                    ? new Dictionary<string, object?>(source.DefaultModelPolicy)
                    : new Dictionary<string, object?>(),

                // 深拷贝引用列表
                SkillRefs = source.SkillRefs != null ? new List<string>(source.SkillRefs) : null,
                ToolRefs = source.ToolRefs != null ? new List<string>(source.ToolRefs) : null,
                McpServerRefs = source.McpServerRefs != null ? new List<string>(source.McpServerRefs) : null,
                Tags = source.Tags != null ? new List<string>(source.Tags) : new List<string>(),

                Enabled = source.Enabled,
                Avatar = source.Avatar,
                TeamCode = source.TeamCode,
                TemplateCode = source.TemplateCode,
                HasKnowledgeBase = false, // 知识库不跟随克隆
                OwnerUserId = source.OwnerUserId,

                // Source 强制 "user"；时间戳重置
                Source = "user",
                SortOrder = source.SortOrder,
                CreatedAt = now,
                UpdatedAt = now
            };

            try
            {
                _employees.Save(clone);
                _logger.LogInformation("克隆员工: source={Source}, newKey={NewKey}", employeeKey, body.NewEmployeeKey);
                return Ok(new { code = 200, message = "已克隆", data = clone });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "克隆员工失败: source={Source}", employeeKey);
                return StatusCode(500, new { code = 500, message = $"克隆失败: {ex.Message}" });
            }
        }

        /// <summary>启停员工：仅切换 Enabled 字段并刷新 UpdatedAt。</summary>
        [HttpPost("/api/v1/agentapp/registry/employees/{employeeKey}/enabled")]
        public IActionResult ToggleEmployeeEnabled(string employeeKey, [FromBody] ToggleEnabledRequest body)
        {
            if (body == null) return BadRequest(new { code = 400, message = "缺少请求体" });

            var existing = _employees.Get(employeeKey);
            if (existing == null) return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            existing.Enabled = body.Enabled;
            existing.UpdatedAt = DateTime.UtcNow;

            try
            {
                _employees.Save(existing);
                return Ok(new { code = 200, message = body.Enabled ? "已启用" : "已停用", data = new { enabled = existing.Enabled } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "切换员工启停失败: {Key}", employeeKey);
                return StatusCode(500, new { code = 500, message = $"操作失败: {ex.Message}" });
            }
        }

        /// <summary>给员工绑定 Skill / MCP / Tool（增量追加）。</summary>
        [HttpPut("/api/v1/agentapp/registry/employees/{employeeKey}/bindings")]
        public IActionResult UpdateBindings(string employeeKey, [FromBody] BindingsUpdate update)
        {
            var emp = _employees.Get(employeeKey);
            if (emp == null) return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            if (update.SkillRefs != null)
            {
                emp.SkillRefs ??= new List<string>();
                foreach (var r in update.SkillRefs.Where(r => !emp.SkillRefs.Contains(r)))
                    emp.SkillRefs.Add(r);
            }
            if (update.McpServerRefs != null)
            {
                emp.McpServerRefs ??= new List<string>();
                foreach (var r in update.McpServerRefs.Where(r => !emp.McpServerRefs.Contains(r)))
                    emp.McpServerRefs.Add(r);
            }
            if (update.ToolRefs != null)
            {
                emp.ToolRefs ??= new List<string>();
                foreach (var r in update.ToolRefs.Where(r => !emp.ToolRefs.Contains(r)))
                    emp.ToolRefs.Add(r);
            }

            _employees.Save(emp);
            return Ok(new { code = 200, message = "绑定已更新", data = emp });
        }

        // ══════════ Role Template ══════════

        /// <summary>列出所有角色模板；支持按 category 可选过滤。</summary>
        [HttpGet("/api/v1/agentapp/registry/role-templates")]
        public IActionResult ListRoleTemplates([FromQuery] string? category = null)
        {
            var list = _roleTemplates.ListAll();
            if (!string.IsNullOrWhiteSpace(category))
            {
                list = list.Where(t => string.Equals(t.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            return Ok(new { code = 200, data = list });
        }

        [HttpGet("/api/v1/agentapp/registry/role-templates/{templateCode}")]
        public IActionResult GetRoleTemplate(string templateCode)
        {
            var tpl = _roleTemplates.Get(templateCode);
            return tpl != null
                ? Ok(new { code = 200, data = tpl })
                : NotFound(new { code = 404, message = $"模板 {templateCode} 不存在" });
        }

        /// <summary>保存角色模板：仅允许 Source = "user"；试图写 system 模板返回 403。</summary>
        [HttpPost("/api/v1/agentapp/registry/role-templates")]
        public IActionResult SaveRoleTemplate([FromBody] RoleTemplateDefinition template)
        {
            if (string.IsNullOrWhiteSpace(template?.TemplateCode))
                return BadRequest(new { code = 400, message = "缺少 templateCode" });
            if (string.Equals(template.Source, "system", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { code = 403, message = "系统模板不可修改（Source = system）" });

            // 已存在的 system 模板也不允许通过 POST 覆盖
            var existing = _roleTemplates.Get(template.TemplateCode);
            if (existing != null && string.Equals(existing.Source, "system", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { code = 403, message = $"系统模板 {template.TemplateCode} 不可修改" });

            try
            {
                _roleTemplates.Save(template);
                return Ok(new { code = 200, message = "已保存", data = template });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "保存模板失败: {Code}", template.TemplateCode);
                return StatusCode(500, new { code = 500, message = $"保存失败: {ex.Message}" });
            }
        }

        /// <summary>删除角色模板：system 模板不可删除（403）。</summary>
        [HttpDelete("/api/v1/agentapp/registry/role-templates/{templateCode}")]
        public IActionResult DeleteRoleTemplate(string templateCode)
        {
            var existing = _roleTemplates.Get(templateCode);
            if (existing == null) return NotFound(new { code = 404, message = $"模板 {templateCode} 不存在" });
            if (string.Equals(existing.Source, "system", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { code = 403, message = $"系统模板 {templateCode} 不可删除" });

            return _roleTemplates.Delete(templateCode)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"模板 {templateCode} 不存在" });
        }

        /// <summary>
        /// 基于模板复刻一个新的数字员工。
        /// 复刻语义：refs 引用拷贝（写 code 列表），不做 inline copy。
        /// </summary>
        [HttpPost("/api/v1/agentapp/registry/role-templates/{templateCode}/apply")]
        public async Task<IActionResult> ApplyRoleTemplate(
            string templateCode,
            [FromBody] ApplyTemplateRequest body,
            CancellationToken ct)
        {
            if (body == null || string.IsNullOrWhiteSpace(body.NewEmployeeKey) || string.IsNullOrWhiteSpace(body.NewName))
                return BadRequest(new { code = 400, message = "缺少 newEmployeeKey 或 newName" });
            if (ContainsUnsafeKeyChars(body.NewEmployeeKey))
                return BadRequest(new { code = 400, message = "newEmployeeKey 含非法字符（不允许 / \\ 或 ..）" });

            if (_roleTemplates.Get(templateCode) == null)
                return NotFound(new { code = 404, message = $"模板 {templateCode} 不存在" });
            if (_employees.Exists(body.NewEmployeeKey))
                return Conflict(new { code = 409, message = $"目标 employeeKey 已存在: {body.NewEmployeeKey}" });

            try
            {
                var employee = await _roleTemplates.ApplyToNewEmployeeAsync(
                    templateCode, body.NewEmployeeKey, body.NewName, _employees, ct).ConfigureAwait(false);
                return Ok(new { code = 200, message = "已复刻", data = employee });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { code = 409, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "模板复刻失败: template={Template}, newKey={NewKey}", templateCode, body.NewEmployeeKey);
                return StatusCode(500, new { code = 500, message = $"复刻失败: {ex.Message}" });
            }
        }

        // ══════════ Team ══════════

        /// <summary>列出所有团队；支持按 ownerUserId 可选过滤（私有团队场景）。</summary>
        [HttpGet("/api/v1/agentapp/registry/teams")]
        public IActionResult ListTeams([FromQuery] string? ownerUserId = null)
        {
            var list = _teams.ListAll();
            if (!string.IsNullOrWhiteSpace(ownerUserId))
            {
                list = list.Where(t => string.Equals(t.OwnerUserId, ownerUserId, StringComparison.Ordinal)).ToList();
            }
            return Ok(new { code = 200, data = list });
        }

        [HttpGet("/api/v1/agentapp/registry/teams/{teamCode}")]
        public IActionResult GetTeam(string teamCode)
        {
            var team = _teams.Get(teamCode);
            return team != null
                ? Ok(new { code = 200, data = team })
                : NotFound(new { code = 404, message = $"团队 {teamCode} 不存在" });
        }

        /// <summary>
        /// 新建团队。teamCode 必须唯一；已存在则 409。
        /// CreatedAt / UpdatedAt 由本端写入（基类 FileJsonRegistry 不会强行维护）。
        /// </summary>
        [HttpPost("/api/v1/agentapp/registry/teams")]
        public IActionResult SaveTeam([FromBody] TeamDefinition team)
        {
            if (string.IsNullOrWhiteSpace(team?.TeamCode))
                return BadRequest(new { code = 400, message = "缺少 teamCode" });
            if (ContainsUnsafeKeyChars(team.TeamCode))
                return BadRequest(new { code = 400, message = "teamCode 含非法字符（不允许 / \\ 或 ..）" });
            if (_teams.Exists(team.TeamCode))
                return Conflict(new { code = 409, message = $"团队已存在: {team.TeamCode}" });

            var now = DateTime.UtcNow;
            team.CreatedAt = now;
            team.UpdatedAt = now;
            team.MemberEmployeeKeys ??= new List<string>();

            try
            {
                _teams.Save(team);
                return Ok(new { code = 200, message = "已保存", data = team });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "保存团队失败: {Code}", team.TeamCode);
                return StatusCode(500, new { code = 500, message = $"保存失败: {ex.Message}" });
            }
        }

        /// <summary>
        /// 全量更新团队：保留 CreatedAt，刷新 UpdatedAt；URL key 与 body.TeamCode 不一致返回 400；不存在返回 404。
        /// </summary>
        [HttpPut("/api/v1/agentapp/registry/teams/{teamCode}")]
        public IActionResult UpdateTeam(string teamCode, [FromBody] TeamDefinition input)
        {
            if (string.IsNullOrWhiteSpace(teamCode))
                return BadRequest(new { code = 400, message = "缺少 teamCode" });
            if (input == null)
                return BadRequest(new { code = 400, message = "请求体不能为空" });
            if (ContainsUnsafeKeyChars(teamCode))
                return BadRequest(new { code = 400, message = "teamCode 含非法字符（不允许 / \\ 或 ..）" });
            if (!string.IsNullOrWhiteSpace(input.TeamCode) &&
                !string.Equals(input.TeamCode, teamCode, StringComparison.Ordinal))
            {
                return BadRequest(new { code = 400, message = "URL teamCode 与请求体 TeamCode 不一致" });
            }

            var existing = _teams.Get(teamCode);
            if (existing == null) return NotFound(new { code = 404, message = $"团队 {teamCode} 不存在" });

            // 保留不可变审计字段；其余覆盖
            input.TeamCode = teamCode;
            input.CreatedAt = existing.CreatedAt;
            input.UpdatedAt = DateTime.UtcNow;
            input.MemberEmployeeKeys ??= new List<string>();

            try
            {
                _teams.Save(input);
                return Ok(new { code = 200, message = "已更新", data = input });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新团队失败: {Code}", teamCode);
                return StatusCode(500, new { code = 500, message = $"更新失败: {ex.Message}" });
            }
        }

        /// <summary>
        /// 删除团队。先扫描 employees 中 TeamCode == 目标 teamCode 的引用员工：
        /// 若有引用，返回 409 + 引用员工列表（拒绝级联失序，避免删除后员工指向悬空 teamCode 导致 delegate 工具无意中关闭）。
        /// </summary>
        [HttpDelete("/api/v1/agentapp/registry/teams/{teamCode}")]
        public IActionResult DeleteTeam(string teamCode)
        {
            if (string.IsNullOrWhiteSpace(teamCode))
                return BadRequest(new { code = 400, message = "缺少 teamCode" });

            var existing = _teams.Get(teamCode);
            if (existing == null) return NotFound(new { code = 404, message = $"团队 {teamCode} 不存在" });

            // 引用扫描：发现任一 employee 指向此 teamCode 即拒绝删除
            var referencedEmployees = _employees.ListAll()
                .Where(e => string.Equals(e.TeamCode, teamCode, StringComparison.Ordinal))
                .Select(e => new { e.EmployeeKey, e.Name })
                .ToList();
            if (referencedEmployees.Count > 0)
            {
                return Conflict(new
                {
                    code = 409,
                    message = $"团队 {teamCode} 仍被 {referencedEmployees.Count} 个员工引用，拒绝删除",
                    data = new { referencedEmployees }
                });
            }

            return _teams.Delete(teamCode)
                ? Ok(new { code = 200, message = "已删除" })
                : NotFound(new { code = 404, message = $"团队 {teamCode} 不存在" });
        }

        /// <summary>
        /// 覆盖式更新团队成员列表。先校验每个 employeeKey 在 EmployeeRegistryService 中存在；
        /// 任一不存在则 400 并返回缺失列表，避免写入悬空引用导致 delegate 校验在运行时失败。
        /// </summary>
        [HttpPut("/api/v1/agentapp/registry/teams/{teamCode}/members")]
        public IActionResult UpdateTeamMembers(string teamCode, [FromBody] UpdateTeamMembersRequest body)
        {
            if (string.IsNullOrWhiteSpace(teamCode))
                return BadRequest(new { code = 400, message = "缺少 teamCode" });
            if (body == null)
                return BadRequest(new { code = 400, message = "请求体不能为空" });

            var existing = _teams.Get(teamCode);
            if (existing == null) return NotFound(new { code = 404, message = $"团队 {teamCode} 不存在" });

            var newMembers = body.MemberEmployeeKeys ?? new List<string>();

            // 去重，保留输入顺序
            var deduped = new List<string>(newMembers.Count);
            var seen = new HashSet<string>(StringComparer.Ordinal);
            foreach (var key in newMembers)
            {
                if (string.IsNullOrWhiteSpace(key)) continue;
                if (seen.Add(key)) deduped.Add(key);
            }

            // 存在性校验
            var missing = deduped.Where(k => !_employees.Exists(k)).ToList();
            if (missing.Count > 0)
            {
                return BadRequest(new
                {
                    code = 400,
                    message = $"以下 employeeKey 不存在: {string.Join(", ", missing)}",
                    data = new { missing }
                });
            }

            existing.MemberEmployeeKeys = deduped;
            existing.UpdatedAt = DateTime.UtcNow;

            try
            {
                _teams.Save(existing);
                return Ok(new { code = 200, message = "成员已更新", data = existing });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新团队成员失败: {Code}", teamCode);
                return StatusCode(500, new { code = 500, message = $"更新失败: {ex.Message}" });
            }
        }

        // ══════════ Employee Knowledge Base ══════════

        /// <summary>列出员工知识库中的所有文档元数据。员工不存在返回 404；尚未上传任何文档时返回空列表。</summary>
        [HttpGet("/api/v1/agentapp/registry/employees/{employeeKey}/knowledge")]
        public async Task<IActionResult> ListKnowledge(string employeeKey, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });
            if (ContainsUnsafeKeyChars(employeeKey))
                return BadRequest(new { code = 400, message = "employeeKey 含非法字符（不允许 / \\ 或 ..）" });

            if (_employees.Get(employeeKey) == null)
                return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            try
            {
                var list = await _knowledge.ListAsync(employeeKey, ct).ConfigureAwait(false);
                return Ok(new { code = 200, data = list });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "列出知识库文档失败: {Key}", employeeKey);
                return StatusCode(500, new { code = 500, message = $"列出失败: {ex.Message}" });
            }
        }

        /// <summary>
        /// 上传一份知识库文档：仅支持 .txt / .md；单文件 ≤ 10MB；单员工累计 ≤ 100MB。
        /// 首次成功上传时由 store 内部懒触发 HasKnowledgeBase = true。
        /// </summary>
        [HttpPost("/api/v1/agentapp/registry/employees/{employeeKey}/knowledge")]
        [RequestSizeLimit(20_000_000)] // 20MB 软上限；handler 内部按 config 再次校验真实限额
        public async Task<IActionResult> UploadKnowledge(string employeeKey, IFormFile file, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });
            if (ContainsUnsafeKeyChars(employeeKey))
                return BadRequest(new { code = 400, message = "employeeKey 含非法字符（不允许 / \\ 或 ..）" });
            if (file == null || file.Length == 0)
                return BadRequest(new { code = 400, message = "缺少上传文件" });

            if (_employees.Get(employeeKey) == null)
                return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            try
            {
                using var stream = file.OpenReadStream();
                var doc = await _knowledge.UploadAsync(employeeKey, file.FileName, stream, file.Length, ct).ConfigureAwait(false);
                return Ok(new { code = 200, message = "已上传", data = doc });
            }
            catch (KnowledgeUnsupportedTypeException ex)
            {
                return StatusCode(415, new { code = 415, message = ex.Message });
            }
            catch (KnowledgeFileTooLargeException ex)
            {
                return StatusCode(413, new { code = 413, message = ex.Message });
            }
            catch (KnowledgeQuotaExceededException ex)
            {
                return StatusCode(507, new { code = 507, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "上传知识库文档失败: employee={Key}, file={File}", employeeKey, file.FileName);
                return StatusCode(500, new { code = 500, message = $"上传失败: {ex.Message}" });
            }
        }

        /// <summary>
        /// 删除指定 docId 的知识库文档。先删磁盘文件、再更新 index.json。
        /// 注：删除最后一份文档时不自动回退 HasKnowledgeBase，需在员工管理面板显式关闭。
        /// </summary>
        [HttpDelete("/api/v1/agentapp/registry/employees/{employeeKey}/knowledge/{docId}")]
        public async Task<IActionResult> DeleteKnowledge(string employeeKey, string docId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(employeeKey))
                return BadRequest(new { code = 400, message = "缺少 employeeKey" });
            if (ContainsUnsafeKeyChars(employeeKey))
                return BadRequest(new { code = 400, message = "employeeKey 含非法字符（不允许 / \\ 或 ..）" });
            if (string.IsNullOrWhiteSpace(docId))
                return BadRequest(new { code = 400, message = "缺少 docId" });

            if (_employees.Get(employeeKey) == null)
                return NotFound(new { code = 404, message = $"员工 {employeeKey} 不存在" });

            try
            {
                var ok = await _knowledge.DeleteAsync(employeeKey, docId, ct).ConfigureAwait(false);
                if (!ok) return NotFound(new { code = 404, message = "文档不存在" });
                return Ok(new { code = 200, message = "已删除" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "删除知识库文档失败: employee={Key}, docId={DocId}", employeeKey, docId);
                return StatusCode(500, new { code = 500, message = $"删除失败: {ex.Message}" });
            }
        }

        // ══════════ Overview ══════════

        /// <summary>概览：系统中各类资源数量。</summary>
        [HttpGet("/api/v1/agentapp/registry/overview")]
        public IActionResult Overview() => Ok(new
        {
            code = 200,
            data = new
            {
                skills = _skills.ListAll().Count,
                mcpServers = _mcpServers.ListAll().Count,
                tools = _tools.ListAll().Count,
                employees = _employees.ListAll().Count,
                roleTemplates = _roleTemplates.ListAll().Count,
                teams = _teams.ListAll().Count
            }
        });

        // ══════════ 工具方法 ══════════

        /// <summary>
        /// 校验 key 不含路径分隔符与目录跳跃，防止路径遍历攻击。
        /// 注：底层 FileJsonRegistry 的 SanitizeKey 会兜底清洗，但 controller 层显式拒绝可避免 key 被错误改写后写到非预期文件。
        /// </summary>
        private static bool ContainsUnsafeKeyChars(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return true;
            return key.Contains('/') || key.Contains('\\') || key.Contains("..");
        }
    }

    /// <summary>员工绑定批量追加请求。</summary>
    public class BindingsUpdate
    {
        public List<string>? SkillRefs { get; set; }
        public List<string>? McpServerRefs { get; set; }
        public List<string>? ToolRefs { get; set; }
    }

    /// <summary>克隆员工请求体。</summary>
    public class CloneEmployeeRequest
    {
        /// <summary>新员工的业务主键。</summary>
        public string NewEmployeeKey { get; set; } = string.Empty;
        /// <summary>新员工的展示名称。</summary>
        public string NewName { get; set; } = string.Empty;
    }

    /// <summary>启停员工请求体。</summary>
    public class ToggleEnabledRequest
    {
        /// <summary>目标启用状态。</summary>
        public bool Enabled { get; set; }
    }

    /// <summary>模板复刻请求体。</summary>
    public class ApplyTemplateRequest
    {
        /// <summary>新员工的业务主键。</summary>
        public string NewEmployeeKey { get; set; } = string.Empty;
        /// <summary>新员工的展示名称。</summary>
        public string NewName { get; set; } = string.Empty;
    }

    /// <summary>团队成员覆盖式更新请求体。</summary>
    public class UpdateTeamMembersRequest
    {
        /// <summary>新的成员 EmployeeKey 列表（覆盖式，非追加）。</summary>
        public List<string>? MemberEmployeeKeys { get; set; }
    }
}
