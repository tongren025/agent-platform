using NetMicro.Agent.App.Agents.Registry;

namespace NetMicro.Agent.App.Agents.Services
{
    /// <summary>
    /// 启动期幂等回填存量 EmployeeDefinition 的新增字段默认值。
    /// 兼容历史版本生成的、缺少 Tags / Source / CreatedAt / UpdatedAt 等新字段的员工 JSON 文件。
    /// 已包含完整字段的文件不会被改写，避免每次启动都刷新 UpdatedAt。
    /// </summary>
    public class EmployeeMigrationHostedService : IHostedService
    {
        private readonly EmployeeRegistryService _employees;
        private readonly ILogger<EmployeeMigrationHostedService> _logger;

        public EmployeeMigrationHostedService(
            EmployeeRegistryService employees,
            ILogger<EmployeeMigrationHostedService> logger)
        {
            _employees = employees;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            // 当前 Registry 仍是同步实现，迁移逻辑也直接走同步路径；
            // 单个文件解析失败必须 try/catch 隔离，避免拖垮整个应用启动。
            try
            {
                var all = _employees.ListAll();
                int scanned = 0;
                int migrated = 0;

                foreach (var employee in all)
                {
                    if (cancellationToken.IsCancellationRequested) break;
                    scanned++;
                    try
                    {
                        if (TryBackfillDefaults(employee))
                        {
                            // 注意：FileJsonRegistry.Save 会自动刷新 UpdatedAt；
                            // 仅在确实有字段被回填时才走这条路径，保证幂等。
                            _employees.Save(employee);
                            migrated++;
                            _logger.LogInformation("数字员工字段回填完成: {Key}", employee.EmployeeKey);
                        }
                    }
                    catch (Exception innerEx)
                    {
                        _logger.LogWarning(innerEx, "数字员工字段回填失败，已跳过: {Key}", employee?.EmployeeKey);
                    }
                }

                _logger.LogInformation("EmployeeMigrationHostedService 完成扫描: scanned={Scanned}, migrated={Migrated}", scanned, migrated);
            }
            catch (Exception ex)
            {
                // 兜底：迁移层任何意外都不应阻断启动
                _logger.LogWarning(ex, "EmployeeMigrationHostedService 启动期迁移异常，已忽略");
            }

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        /// <summary>
        /// 检查并回填 EmployeeDefinition 上的默认值。
        /// 返回 true 表示有字段被改动，调用方应当写回磁盘；返回 false 表示已是完整状态，幂等跳过。
        /// </summary>
        private static bool TryBackfillDefaults(EmployeeDefinition employee)
        {
            if (employee == null) return false;

            bool changed = false;
            var now = DateTime.UtcNow;

            // Tags：null → 空列表
            if (employee.Tags == null)
            {
                employee.Tags = new List<string>();
                changed = true;
            }

            // Source：null/空 → "user"
            if (string.IsNullOrWhiteSpace(employee.Source))
            {
                employee.Source = "user";
                changed = true;
            }

            // CreatedAt：default(DateTime) → 当前 UTC
            if (employee.CreatedAt == default)
            {
                employee.CreatedAt = now;
                changed = true;
            }

            // UpdatedAt：default(DateTime) → CreatedAt
            // 注意：要在 CreatedAt 回填之后判断，保证两者一致
            if (employee.UpdatedAt == default)
            {
                employee.UpdatedAt = employee.CreatedAt;
                changed = true;
            }

            return changed;
        }
    }
}
