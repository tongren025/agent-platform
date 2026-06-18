namespace NetMicro.Agent.App.Agents.Registry
{
    /// <summary>Skill 注册中心服务。</summary>
    public class SkillRegistryService
    {
        private readonly FileJsonRegistry<SkillDefinition> _registry;
        public SkillRegistryService(IConfiguration config, ILogger<SkillRegistryService> logger)
        {
            var dir = config["Agent:SkillDir"] ?? Path.Combine(AppContext.BaseDirectory, "data", "skills");
            _registry = new FileJsonRegistry<SkillDefinition>(dir, logger);
        }
        public List<SkillDefinition> ListAll() => _registry.ListAll();
        public SkillDefinition? Get(string code) => _registry.Get(code);
        public bool Exists(string code) => _registry.Exists(code);
        public void Save(SkillDefinition skill) => _registry.Save(skill);
        public bool Delete(string code) => _registry.Delete(code);
    }

    /// <summary>MCP Server 注册中心服务。</summary>
    public class McpServerRegistryService
    {
        private readonly FileJsonRegistry<McpServerDefinition> _registry;
        public McpServerRegistryService(IConfiguration config, ILogger<McpServerRegistryService> logger)
        {
            var dir = config["Agent:McpServerDir"] ?? Path.Combine(AppContext.BaseDirectory, "data", "mcp-servers");
            _registry = new FileJsonRegistry<McpServerDefinition>(dir, logger);
        }
        public List<McpServerDefinition> ListAll() => _registry.ListAll();
        public McpServerDefinition? Get(string code) => _registry.Get(code);
        public bool Exists(string code) => _registry.Exists(code);
        public void Save(McpServerDefinition server) => _registry.Save(server);
        public bool Delete(string code) => _registry.Delete(code);
    }

    /// <summary>Tool 注册中心服务。</summary>
    public class ToolRegistryService
    {
        private readonly FileJsonRegistry<ToolDefinition> _registry;
        public ToolRegistryService(IConfiguration config, ILogger<ToolRegistryService> logger)
        {
            var dir = config["Agent:ToolDir"] ?? Path.Combine(AppContext.BaseDirectory, "data", "tools");
            _registry = new FileJsonRegistry<ToolDefinition>(dir, logger);
        }
        public List<ToolDefinition> ListAll() => _registry.ListAll();
        public ToolDefinition? Get(string code) => _registry.Get(code);
        public bool Exists(string code) => _registry.Exists(code);
        public void Save(ToolDefinition tool) => _registry.Save(tool);
        public bool Delete(string code) => _registry.Delete(code);
    }

    /// <summary>Team 注册中心服务（Phase 2 预埋，文件存储在 data/teams）。</summary>
    public class TeamRegistryService
    {
        private readonly FileJsonRegistry<TeamDefinition> _registry;
        public TeamRegistryService(IConfiguration config, ILogger<TeamRegistryService> logger)
        {
            var dir = config["Agent:TeamDir"] ?? Path.Combine(AppContext.BaseDirectory, "data", "teams");
            _registry = new FileJsonRegistry<TeamDefinition>(dir, logger);
        }
        public List<TeamDefinition> ListAll() => _registry.ListAll();
        public TeamDefinition? Get(string code) => _registry.Get(code);
        public bool Exists(string code) => _registry.Exists(code);
        public void Save(TeamDefinition team) => _registry.Save(team);
        public bool Delete(string code) => _registry.Delete(code);
    }

    /// <summary>Employee 注册中心服务（数据落盘到 data/employees）。</summary>
    public class EmployeeRegistryService
    {
        private readonly FileJsonRegistry<EmployeeDefinition> _registry;
        public EmployeeRegistryService(IConfiguration config, ILogger<EmployeeRegistryService> logger)
        {
            // 优先使用 Agent:EmployeeDir，缺省回退到 Agent:DataDir 与 data/employees，与历史路径对齐
            var dir = config["Agent:EmployeeDir"]
                ?? config["Agent:DataDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "data", "employees");
            _registry = new FileJsonRegistry<EmployeeDefinition>(dir, logger);
        }
        public List<EmployeeDefinition> ListAll() => _registry.ListAll();
        public EmployeeDefinition? Get(string key) => _registry.Get(key);
        public bool Exists(string key) => _registry.Exists(key);
        public void Save(EmployeeDefinition employee) => _registry.Save(employee);
        public bool Delete(string key) => _registry.Delete(key);

        /// <summary>
        /// 异步保存包装。当前底层 FileJsonRegistry 是同步写文件，此处仅做 async 适配，
        /// 为后续 T1.x 切换到真正的异步 IO（File.WriteAllTextAsync / Mongo follow-up）预留接缝。
        /// </summary>
        public Task SaveAsync(EmployeeDefinition employee, CancellationToken ct = default)
        {
            if (employee == null) throw new ArgumentNullException(nameof(employee));
            ct.ThrowIfCancellationRequested();
            _registry.Save(employee);
            return Task.CompletedTask;
        }
    }

    // ══════════════════════════════════════════
    //  RoleTemplate 注册中心服务
    // ══════════════════════════════════════════

    /// <summary>
    /// 角色模板注册中心服务。子目录：data/role-templates/。
    /// 提供基础 CRUD 转发，以及 ApplyToNewEmployeeAsync —— 把模板复刻为新员工实体（refs 引用语义，非 inline copy）。
    /// </summary>
    public class RoleTemplateRegistryService
    {
        private readonly FileJsonRegistry<RoleTemplateDefinition> _registry;
        private readonly ILogger<RoleTemplateRegistryService> _logger;

        public RoleTemplateRegistryService(IConfiguration config, ILogger<RoleTemplateRegistryService> logger)
        {
            var dir = config["Agent:RoleTemplateDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "data", "role-templates");
            _registry = new FileJsonRegistry<RoleTemplateDefinition>(dir, logger);
            _logger = logger;
        }

        public List<RoleTemplateDefinition> ListAll() => _registry.ListAll();
        public RoleTemplateDefinition? Get(string templateCode) => _registry.Get(templateCode);
        public bool Exists(string templateCode) => _registry.Exists(templateCode);
        public void Save(RoleTemplateDefinition template) => _registry.Save(template);
        public bool Delete(string templateCode) => _registry.Delete(templateCode);

        /// <summary>
        /// 按模板生成一个新的 EmployeeDefinition 并通过 EmployeeRegistryService 落盘。
        /// 复刻语义：仅做 refs 引用拷贝（写 code 列表），不做 inline copy；运行时由 FileSnapshotLoader 解析。
        /// </summary>
        /// <param name="templateCode">模板编码（必须已存在）。</param>
        /// <param name="newEmployeeKey">新员工的业务主键。</param>
        /// <param name="newName">新员工的展示名称。</param>
        /// <param name="employees">员工注册中心（用于落盘 + 占用检查）。</param>
        /// <param name="ct">取消令牌。</param>
        /// <returns>已落盘的新员工实体。</returns>
        /// <exception cref="ArgumentException">参数缺失或模板不存在。</exception>
        /// <exception cref="InvalidOperationException">新员工 key 已被占用。</exception>
        public async Task<EmployeeDefinition> ApplyToNewEmployeeAsync(
            string templateCode,
            string newEmployeeKey,
            string newName,
            EmployeeRegistryService employees,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(templateCode))
                throw new ArgumentException("templateCode 不能为空", nameof(templateCode));
            if (string.IsNullOrWhiteSpace(newEmployeeKey))
                throw new ArgumentException("newEmployeeKey 不能为空", nameof(newEmployeeKey));
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("newName 不能为空", nameof(newName));
            if (employees == null) throw new ArgumentNullException(nameof(employees));

            // 取模板
            var template = _registry.Get(templateCode)
                ?? throw new ArgumentException($"模板不存在: {templateCode}", nameof(templateCode));

            // 新 key 占用检查（Phase 1 单租户场景下足够）
            if (employees.Get(newEmployeeKey) != null)
                throw new InvalidOperationException($"员工 key 已存在: {newEmployeeKey}");

            var now = DateTime.UtcNow;

            // 装配 EmployeeDefinition：refs 引用语义，写 code 列表，运行时由 FileSnapshotLoader 解析
            // 注：当前 EmployeeDefinition.SkillRefs/ToolRefs/McpServerRefs 仍为 List<string>，
            //     待数据模型升级为 List<SkillRef>/List<ToolRef>/List<McpServerRef> 后，
            //     此处改为 Select((code, idx) => new SkillRef { Scope = "global", Code = code, SortOrder = idx })。
            var employee = new EmployeeDefinition
            {
                EmployeeKey = newEmployeeKey,
                Name = newName,
                Description = template.Description,
                RoleProfile = template.RoleProfile,
                DeepAgent = template.DeepAgent,
                DefaultModelPolicy = template.DefaultModelPolicy != null
                    ? new Dictionary<string, object?>(template.DefaultModelPolicy)
                    : new Dictionary<string, object?>(),

                SkillRefs = template.SuggestedSkillCodes?.ToList() ?? new List<string>(),
                ToolRefs = template.SuggestedToolCodes?.ToList() ?? new List<string>(),
                McpServerRefs = template.SuggestedMcpServerCodes?.ToList() ?? new List<string>(),

                // 模板来源标记
                TemplateCode = templateCode,
                Source = "user",

                // 其他字段默认值
                Enabled = true,
                Tags = new List<string>(),
                HasKnowledgeBase = false,
                CreatedAt = now,
                UpdatedAt = now
            };

            await employees.SaveAsync(employee, ct).ConfigureAwait(false);
            _logger.LogInformation("基于模板复刻新员工: template={TemplateCode}, newKey={NewKey}", templateCode, newEmployeeKey);
            return employee;
        }
    }
}
