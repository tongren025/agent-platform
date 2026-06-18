using NetMicro.Agent.App.Agents.ContextCompression;
using NetMicro.Agent.App.Agents.DeepAgent;
using NetMicro.Agent.App.Agents.FileStore;
using NetMicro.Agent.App.Agents.Knowledge;
using NetMicro.Agent.App.Agents.McpClient;
using NetMicro.Agent.App.Agents.Memory;
using NetMicro.Agent.App.Agents.Registry;
using NetMicro.Agent.App.Agents.Runtime;
using NetMicro.Agent.App.Agents.Services;
using NetMicro.Agent.App.Agents.Strategy;

namespace NetMicro.Agent.App.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// 注册 Agent 独立服务所需的全部依赖（本地 JSON 文件存储，无 MongoDB/Redis/ES 依赖）。
        /// </summary>
        public static IServiceCollection AddAgentServices(this IServiceCollection services,
            IConfiguration configuration)
        {
            // ── 核心 AI 服务 ──
            services.AddScoped<NetMicro.Agent.App.Core.IAIRequestService, NetMicro.Agent.App.Core.AIRequestService>();

            // ── 注册中心服务（Singleton：启动时从本地 JSON 加载，全局共享） ──
            services.AddSingleton<SkillRegistryService>();
            services.AddSingleton<McpServerRegistryService>();
            services.AddSingleton<ToolRegistryService>();
            services.AddSingleton<EmployeeRegistryService>();
            services.AddSingleton<RoleTemplateRegistryService>();
            services.AddSingleton<TeamRegistryService>();

            // ── 启动时一次性迁移：补齐 EmployeeDefinition 的新字段（Source/Enabled/CreatedAt 等） ──
            services.AddHostedService<EmployeeMigrationHostedService>();

            // ── Agent 运行时（文件模式：从本地 JSON 读取员工配置） ──
            services.AddScoped<PromptCompiler>();
            services.AddScoped<ISnapshotLoader, FileSnapshotLoader>();
            services.AddScoped<IAgentToolHandler, FileSkillDetailHandler>();
            services.AddScoped<LocalKernelFunctionFactory>();
            services.AddScoped<AgentLoop>();
            services.AddScoped<SkAgentRunner>();

            // ── MCP 子进程连接的 per-request 池化（同请求内嵌套 delegate 共享连接，避免重复 spawn） ──
            services.AddScoped<McpConnectionPool>();
            services.AddScoped<McpToolRegistrar>();

            // ── Agent 调用服务 ──
            services.AddScoped<IAgentInvocationService, FileAgentInvocationService>();

            // ── Deep Agents 增强能力 ──
            services.AddScoped<IContextCompressor, LlmContextCompressor>();
            services.AddScoped<IConversationMemoryStore, FileConversationMemoryStore>();

            // ── DeepAgent 平台工具：规划 / 虚拟文件系统 / 子 Agent / 审批 / Shell / JS ──
            services.AddScoped<IAgentToolHandler, WriteTodosHandler>();
            // 文件系统工具同时注册接口与具体类型（TaskHandler 需要按具体类型注入它们）
            services.AddScoped<LsHandler>();
            services.AddScoped<ReadFileHandler>();
            services.AddScoped<WriteFileHandler>();
            services.AddScoped<EditFileHandler>();
            services.AddScoped<IAgentToolHandler>(sp => sp.GetRequiredService<LsHandler>());
            services.AddScoped<IAgentToolHandler>(sp => sp.GetRequiredService<ReadFileHandler>());
            services.AddScoped<IAgentToolHandler>(sp => sp.GetRequiredService<WriteFileHandler>());
            services.AddScoped<IAgentToolHandler>(sp => sp.GetRequiredService<EditFileHandler>());
            services.AddScoped<IAgentToolHandler, TaskHandler>();
            services.AddScoped<IAgentToolHandler, RequireApprovalHandler>();
            services.AddScoped<IAgentToolHandler, ShellExecuteHandler>();
            services.AddScoped<IAgentToolHandler, JavaScriptInterpreterHandler>();

            // ── 跨员工 delegate 平台工具（条件注入，由 PlatformInfraToolRegistry 按 TeamCode 判断是否对员工可见） ──
            services.AddScoped<IAgentToolHandler, DelegateToEmployeeHandler>();

            // ── 员工知识库（轻量方案：本地目录 + index.json + 关键词召回，无向量库 / Embedding 依赖） ──
            services.AddSingleton<IEmployeeKnowledgeStore, FileEmployeeKnowledgeStore>();
            services.AddScoped<IKnowledgeRetriever, KeywordKnowledgeRetriever>();
            services.AddScoped<IAgentToolHandler, QueryKnowledgeBaseHandler>();

            // ── 策略助手工具 Handler（调用 Admin API） ──
            var adminApiBaseUrl = configuration["Agent:AdminApiBaseUrl"] ?? "http://localhost:5040";
            services.AddHttpClient<AdminApiClient>(client =>
            {
                client.BaseAddress = new Uri(adminApiBaseUrl);
                client.Timeout = TimeSpan.FromSeconds(60);
            });
            services.AddScoped<IAgentToolHandler, GetParseResultHandler>();
            services.AddScoped<IAgentToolHandler, PrecheckStrategyHandler>();
            services.AddScoped<IAgentToolHandler, CreateStrategyHandler>();
            services.AddScoped<IAgentToolHandler, RollbackStrategyHandler>();

            return services;
        }
    }
}
