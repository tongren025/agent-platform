# 模块索引（自动生成）

> 由 `python -m scripts.gen_module_index` 从各模块 docstring / 文件头注释提取。
> **不要手改本文件**——改对应源文件的模块 docstring 后重新生成。
> 架构导览与数据流见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 后端（Python）

### `admin/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../admin/__init__.py) | 管理端独立服务包。 |
| [auth.py](../admin/auth.py) | 管理端鉴权——基于平台用户存储，HMAC 签名 token。 |
| [config.py](../admin/config.py) | 管理端独立服务的配置——与用户端分离的鉴权口令 + 端口。 |
| [main.py](../admin/main.py) | 管理端独立 FastAPI 服务入口。 |

### `admin/api/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../admin/api/__init__.py) | 管理端接口路由包。 |
| [auth_api.py](../admin/api/auth_api.py) | 管理端登录——基于平台用户存储验证。 |
| [providers.py](../admin/api/providers.py) | 管理端 AI 服务商 API——复用用户端 ai_service / ai_provider_store，带 admin 鉴权。 |
| [roles.py](../admin/api/roles.py) | 管理端角色管理 API。 |
| [system.py](../admin/api/system.py) | 管理端系统总览——复用用户端 app 的 registry 数据，只读聚合。 |
| [users.py](../admin/api/users.py) | 管理端用户管理 API。 |

### `app/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/__init__.py) | agent-platform 用户端主服务（FastAPI，:8000/:5311）。 |
| [config.py](../app/config.py) | 业务配置装载（appsettings.json 体系）。 |
| [dependencies.py](../app/dependencies.py) | 全局服务单例装配（轻量级手工 DI 容器）。 |
| [main.py](../app/main.py) | FastAPI application entry point. |
| [utils.py](../app/utils.py) | 全局工具函数——消除各 model 文件中的 _now() 重复。 |

### `app/api/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/api/__init__.py) | 用户端 API 路由包 —— 汇集 app/api/ 下各业务路由模块（agent、registry、production 等），由 app.main 统一挂载。 |
| [agent.py](../app/api/agent.py) | Agent 运行 API——核心的 run / team-run 端点。 |
| [ai_providers.py](../app/api/ai_providers.py) | AI Provider 管理 API。 |
| [canvas.py](../app/api/canvas.py) | 自由画布 API：原子 CRUD、图片/视频上传、文生图、异步视频任务同步与人工顺序成片合成。 |
| [common.py](../app/api/common.py) | API 层公共工具函数——消除各 router 文件中的重复定义。 |
| [director.py](../app/api/director.py) | 导演 Agent API：把剧本、图片、视频与成片收束为一条可执行主线。 |
| [evolution.py](../app/api/evolution.py) | 自我进化系统 API。 |
| [knowledge_graph.py](../app/api/knowledge_graph.py) | 知识图谱 API —— 聚合所有实体及关系，供前端可视化。 |
| [memory_api.py](../app/api/memory_api.py) | 长期记忆管理 API。 |
| [pipeline.py](../app/api/pipeline.py) | CLI Pipeline REST API — 用本地 CLI 驱动漫剧创作流水线。 |
| [production.py](../app/api/production.py) | Production pipeline API — project & card CRUD + AI generation. |
| [registry.py](../app/api/registry.py) | 注册表 API：技能/MCP/工具/员工/团队/角色模板的 CRUD + 员工知识库管理。Prefix: /api/v1/agentapp/registry。 |
| [runs.py](../app/api/runs.py) | agent 运行记录 API —— 事后审计每次 run 的成本与行为。 |
| [scrape.py](../app/api/scrape.py) | 自动学习 / 提示词采集 API。 |
| [sessions.py](../app/api/sessions.py) | 会话管理 API。 |
| [skills.py](../app/api/skills.py) | GitHub Skill 榜单 API — 读 skill_tracker 的产出，并支持手动触发拉取。 |
| [strategy_proxy.py](../app/api/strategy_proxy.py) | 策略文件解析代理：把用户端上传/查询请求转发到管理端(:8001)的策略接口。 |
| [tasks.py](../app/api/tasks.py) | M4 异步任务 API —— 入队、用户任务列表、状态查询、取消与重试。 |
| [trend_sources.py](../app/api/trend_sources.py) | 多源 AI 趋势聚合 — Hacker News / arXiv / Google News RSS / Reddit。 |
| [user_auth.py](../app/api/user_auth.py) | 用户端登录接口——与管理端共用同一套用户存储和 token 签发。 |
| [workflow.py](../app/api/workflow.py) | 工作流编排 API。 |

### `app/core/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/core/__init__.py) | 基础设施层 —— 配置、日志、中间件、异常处理、可观测性。 |
| [auth.py](../app/core/auth.py) | 用户端 API 鉴权中间件 —— 后端强制校验,登录门禁不再只是前端装饰。 |
| [db.py](../app/core/db.py) | 数据库基础设施 —— 同步 SQLAlchemy 2.0 + psycopg3。 |
| [embedding.py](../app/core/embedding.py) | M3 Embedding 服务 —— 调 DashScope text-embedding-v3 生成向量。 |
| [errors.py](../app/core/errors.py) | 全局异常处理 —— 统一响应结构,生产环境不外泄堆栈。 |
| [logging.py](../app/core/logging.py) | 结构化日志 —— structlog,支持 JSON(生产)与彩色控制台(开发)。 |
| [metrics.py](../app/core/metrics.py) | LLM 运行的自定义 Prometheus 指标 —— M6 在 HTTP 指标之外补 LLM 维度。 |
| [middleware.py](../app/core/middleware.py) | 请求中间件 —— 为每个请求生成 request_id 并记录访问日志。 |
| [observability.py](../app/core/observability.py) | 可观测性 —— 挂载 Prometheus /metrics 端点。 |
| [queue.py](../app/core/queue.py) | M4 异步任务队列 —— arq 连接池 + 入队辅助。 |
| [rate_limit.py](../app/core/rate_limit.py) | M5 限流 —— slowapi 全局限速 + 员工级 token 配额。 |
| [settings.py](../app/core/settings.py) | 基础设施配置 —— 走环境变量 / .env,密钥不再进 json 版本库。 |

### `app/models/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/models/__init__.py) | 数据模型包聚合出口——把注册表/运行时/会话/知识库模型统一 re-export，兼容 `from app.models import X` 的旧写法。 |
| [conversation.py](../app/models/conversation.py) | Agent 对话与运行的核心模型：run 请求/响应、token 用量、调用轨迹、会话与消息。 |
| [distillation.py](../app/models/distillation.py) | Deep Dream 记忆蒸馏模型。 |
| [evolution.py](../app/models/evolution.py) | 自我进化系统模型。 |
| [knowledge.py](../app/models/knowledge.py) | 知识库数据模型：文档元信息与检索片段（存储与检索见 app/services/knowledge.py）。 |
| [learn.py](../app/models/learn.py) | 定时文章学习相关的数据模型。 |
| [memory_types.py](../app/models/memory_types.py) | 长期记忆模型，灵感来自 LangMem 概念框架。 |
| [production.py](../app/models/production.py) | Production pipeline models — from idea to final cut. |
| [registry.py](../app/models/registry.py) | 注册表数据模型：技能/工具/MCP/员工/团队/角色模板的定义。均为 JSON 文件存储（刻意保留——静态配置），camelCase alias 对齐前端。 |
| [run_record.py](../app/models/run_record.py) | 单次 agent 运行的可观测记录。 |
| [runtime.py](../app/models/runtime.py) | 运行时快照模型：把注册表定义解析为 agent 执行期实际可见的技能/工具/MCP 视图（按 scope 分组），供 prompt 编译与工具循环消费。 |
| [scrape.py](../app/models/scrape.py) | 自动学习 / 提示词采集相关的数据模型。 |
| [workflow.py](../app/models/workflow.py) | DIFY 式工作流编排引擎的数据模型。 |

### `app/models/db/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/models/db/__init__.py) | SQLAlchemy ORM 模型(PostgreSQL 持久化层)。 |
| [base.py](../app/models/db/base.py) | ORM 基类与公共列。 |
| [embedding.py](../app/models/db/embedding.py) | 向量 embedding ORM —— M3 pgvector 语义检索。 |
| [memory.py](../app/models/db/memory.py) | 长期记忆的 ORM —— M1 把三类记忆的 JSON 文件迁到 PostgreSQL。 |
| [run.py](../app/models/db/run.py) | 单次 agent 运行记录的 ORM —— M1 把 JSON run store 迁到 PostgreSQL。 |
| [session.py](../app/models/db/session.py) | 对话会话的 ORM —— M1 把 JSON 会话 store 迁到 PostgreSQL。 |
| [user.py](../app/models/db/user.py) | 平台用户 + 角色的 ORM 模型。 |

### `app/runtime/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/runtime/__init__.py) | Agent 运行时包 —— 承载"一次员工调用"的完整执行链。 |
| [cli_executor.py](../app/runtime/cli_executor.py) | CLI Executor — 通过本地已认证的 CLI 工具（claude / gemini）调用 LLM。 |
| [cli_pipeline.py](../app/runtime/cli_pipeline.py) | CLI Pipeline — 按角色顺序调 CLI，每步写入文件，最终合并。 |
| [infra_tools.py](../app/runtime/infra_tools.py) | Platform infrastructure tool definitions injected into every agent run. |
| [loop.py](../app/runtime/loop.py) | Agent 工具调用循环 —— 系统最核心的 LLM 执行引擎。 |
| [prompt.py](../app/runtime/prompt.py) | Prompt 编译器：把员工运行时快照 + 生效 scope 编译成最终 system prompt（角色画像 + 技能 + 团队上下文 + DeepAgent 工作流指引 + 结构化输出指令）。 |
| [runner.py](../app/runtime/runner.py) | Agent 运行器：把运行时快照装配成 loop 可执行的选项（工具 handler、模型策略、重试/降级配置），是 invocation 与 loop 之间的装配层。 |
| [scope.py](../app/runtime/scope.py) | Scope builder utility. |
| [snapshot.py](../app/runtime/snapshot.py) | 运行时快照构建：从各注册表聚合员工的技能/工具/MCP/团队上下文，产出 EmployeeRuntimeSnapshot 供 prompt 编译与运行使用。 |
| [template.py](../app/runtime/template.py) | 工作流变量插值：把 {{node.field}} 解析成上游节点的输出。 |

### `app/services/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/services/__init__.py) | 业务服务层：注册表、会话/记忆/运行记录存储、AI 调用、采集/学习、工作流引擎等。 |
| [ai.py](../app/services/ai.py) | AI 供应商（provider）配置存储 + LLM 客户端解析。 |
| [distillation.py](../app/services/distillation.py) | Deep Dream 记忆蒸馏 —— 模拟人类睡眠时的记忆整合。 |
| [evolution.py](../app/services/evolution.py) | 自我进化引擎 —— 审视对话历史，生成改进建议。 |
| [invocation.py](../app/services/invocation.py) | Agent 调用编排层。 |
| [knowledge.py](../app/services/knowledge.py) | 员工知识库：文件存储 + 关键词检索。 |
| [knowledge_ingestion.py](../app/services/knowledge_ingestion.py) | 统一知识入库服务：上传、索引、替换与删除共用同一套 fail-open 语义。 |
| [learn_runner.py](../app/services/learn_runner.py) | 定时文章学习运行编排：逐个 URL 抓取 → LLM 总结 → 写入目标员工知识库+长期记忆 → 记录历史。 |
| [learn_store.py](../app/services/learn_store.py) | 定时文章学习的文件型持久化。 |
| [long_term_memory.py](../app/services/long_term_memory.py) | 长期记忆存储。 |
| [long_term_memory_db.py](../app/services/long_term_memory_db.py) | 长期记忆的 PostgreSQL 后端 —— 实现 MemoryBackend 的 load/save 原语。 |
| [memory.py](../app/services/memory.py) | 会话（短期记忆）文件存储。 |
| [memory_db.py](../app/services/memory_db.py) | 对话会话的 PostgreSQL 仓储 —— M1 迁移，接口镜像 JSON 版 ConversationMemoryStore。 |
| [memory_extractor.py](../app/services/memory_extractor.py) | 后台记忆提取器。 |
| [openrouter_media.py](../app/services/openrouter_media.py) | OpenRouter 图片/视频生成与本地成片合成服务。 |
| [production_quality.py](../app/services/production_quality.py) | 漫剧生产提示词的静态质量门禁。 |
| [registry.py](../app/services/registry.py) | 通用文件型注册表（Registry）。 |
| [run_store.py](../app/services/run_store.py) | agent 运行记录存储 —— 每次 run 一份 JSON，供事后审计成本与行为。 |
| [run_store_db.py](../app/services/run_store_db.py) | 运行记录的 PostgreSQL 仓储 —— M1 迁移，接口镜像 JSON 版 AgentRunStore。 |
| [scheduler.py](../app/services/scheduler.py) | 轻量级每日定时调度器（基于 asyncio，无第三方依赖）。 |
| [scrape_runner.py](../app/services/scrape_runner.py) | 采集运行编排：抓取 → 去重入库 → 生成知识文档注入目标员工知识库 → 写运行历史。 |
| [scrape_store.py](../app/services/scrape_store.py) | 采集相关的文件型持久化存储。 |
| [scraper.py](../app/services/scraper.py) | 网页提示词采集器。 |
| [seed_workflows.py](../app/services/seed_workflows.py) | 种子工作流：把 9 人漫剧团队的真实「编剧→设计→生成」流水线编码成一张 WorkflowDefinition， |
| [session_messages.py](../app/services/session_messages.py) | 会话消息身份工具：为新旧消息提供稳定 ID 与单调序号，支撑增量记忆游标。 |
| [trend_digest.py](../app/services/trend_digest.py) | 个人化趋势简报。 |
| [user_store.py](../app/services/user_store.py) | 平台用户与角色存储——JSON 文件持久化，admin 和 user 两端共用。 |
| [vector_store.py](../app/services/vector_store.py) | M3 向量存储与语义检索 —— pgvector 存取 + DashScope embedding。 |
| [workflow_executor.py](../app/services/workflow_executor.py) | 工作流执行引擎：对 WorkflowDefinition（DAG）做 ready-set 遍历。 |
| [workflow_nodes.py](../app/services/workflow_nodes.py) | 工作流节点执行器及其全局注册表。 |
| [workflow_store.py](../app/services/workflow_store.py) | 工作流运行记录的文件型持久化存储。 |

### `app/tasks/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/tasks/__init__.py) | M4 异步任务包 —— arq 任务函数与 worker 配置。 |
| [agent_task.py](../app/tasks/agent_task.py) | arq 任务函数 —— worker 进程消费的异步任务。 |
| [worker.py](../app/tasks/worker.py) | arq Worker 定义 —— `python -m app.tasks.worker` 启动独立 worker 进程。 |

### `app/tools/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/tools/__init__.py) | Agent 工具包 —— 提供给数字员工在 agent loop 中调用的各类工具 Handler。 |
| [base.py](../app/tools/base.py) | Tool handler protocol and global registry. |
| [builtin.py](../app/tools/builtin.py) | 内置工具：技能详情查询 + 知识库检索。模块加载时自动注册到全局工具 registry（main.py 顶部 import 触发）。 |
| [deep.py](../app/tools/deep.py) | DeepAgent 工具集：任务清单(write_todos)、虚拟文件系统(ls/read/write/edit)、人工审批(require_approval)、受限 shell(execute)、子代理(task)。状态都存在 DeepAgentState（单次运行内存内共享），模块加载时自动注册。 |
| [delegate.py](../app/tools/delegate.py) | 员工间委派工具（delegate_to_employee）：把消息转给另一个数字员工执行并取回结果。带总开关、深度上限与环路检测（__delegation_stack）。 |

### `app/tools/strategy/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../app/tools/strategy/__init__.py) | 充值策略工具子包 —— 对接 Novel 管理端 RechargeStrategyAssistant 接口。 |
| [client.py](../app/tools/strategy/client.py) | 充值策略 admin API 的异步 HTTP 客户端（httpx），基址来自 settings.agent.admin_api_base_url。模块级单例 admin_client。 |
| [handlers.py](../app/tools/strategy/handlers.py) | 充值策略工具 handler：get_parse_result / precheck_strategy / create_strategy / rollback_strategy 四个工具，包装 admin_client 并注册到全局工具 registry。 |

### `evals/`

| 文件 | 干什么 |
|------|--------|
| [__init__.py](../evals/__init__.py) | Agent 输出质量 eval 套件。 |
| [checks.py](../evals/checks.py) | 确定性检查引擎 —— eval 评分核心，纯函数、可单测、不碰网络。 |
| [harness.py](../evals/harness.py) | eval 套件加载 + 运行 —— 把 golden cases 跑过数字员工并按 checks 评分。 |
| [run_evals.py](../evals/run_evals.py) | eval 运行入口：把 evals/cases/*.json 跑过真实数字员工并打分。 |

## 前端（web/src）

### `web/src/`

| 文件 | 干什么 |
|------|--------|
| [adminApi.ts](../web/src/adminApi.ts) | 管理端 API 封装：走 /api/admin/*（代理到 :8001），带管理端独立 token。 |
| [api.ts](../web/src/api.ts) | 用户端 API 封装：统一 BASE 前缀、Bearer 凭证、错误信封解包；401 自动清 token 回登录页。 |
| [App.tsx](../web/src/App.tsx) | 路由总表：用户端页面（登录墙内）+ 管理端 /admin 页面（独立鉴权）；页面按路由懒加载以缩短首屏时间。 |
| [main.tsx](../web/src/main.tsx) | 前端入口：挂载 React 根组件，套 antd 中文语言包与主题配置。 |
| [media.ts](../web/src/media.ts) | 素材媒体工具：缩略图 URL 拼接 + 加载失败的可见占位。 |
| [theme.ts](../web/src/theme.ts) | 全局配色常量 COLORS + antd 主题定制（主色/圆角/组件级覆盖）。 |
| [types.ts](../web/src/types.ts) | 前后端共享的 TypeScript 类型定义（与后端 Pydantic 模型的 camelCase 契约一一对应）。 |
| [ui.tsx](../web/src/ui.tsx) | antd message 的上下文桥。 |
| [userAuth.ts](../web/src/userAuth.ts) | 用户端登录态：token 存取、登录/校验/登出、权限缓存与 hasPerm() 判断。 |
| [vite-env.d.ts](../web/src/vite-env.d.ts) | <reference types="vite/client" /> |

### `web/src/components/`

| 文件 | 干什么 |
|------|--------|
| [AdminLayout.tsx](../web/src/components/AdminLayout.tsx) | 管理端布局：独立导航与鉴权守卫，与用户端完全隔离。 |
| [AppErrorBoundary.tsx](../web/src/components/AppErrorBoundary.tsx) | 全局错误边界：避免单个页面渲染异常导致整站白屏，给用户明确恢复入口。 |
| [Layout.tsx](../web/src/components/Layout.tsx) | 用户端主布局：左侧导航（按权限显隐）+ 内容区；含折叠与窄屏适配。 |
| [TraceList.tsx](../web/src/components/TraceList.tsx) | 工具调用轨迹展示组件：逐轮显示工具名/参数/结果/成败。 |
| [UserAuthGuard.tsx](../web/src/components/UserAuthGuard.tsx) | 用户端路由守卫：校验 token 有效性，未登录跳 /login。 |

### `web/src/components/canvas/`

| 文件 | 干什么 |
|------|--------|
| [CanvasNodes.tsx](../web/src/components/canvas/CanvasNodes.tsx) | 自由画布文本/图片/视频节点：人工编辑、审核状态、生成、同步、复制、删除和看板回写。 |

### `web/src/components/workflow/`

| 文件 | 干什么 |
|------|--------|
| [NodeConfigDrawer.tsx](../web/src/components/workflow/NodeConfigDrawer.tsx) | 节点配置抽屉：按节点类型渲染对应的配置表单（agent/条件/模板/工具等）。 |
| [nodeMeta.ts](../web/src/components/workflow/nodeMeta.ts) | 工作流节点类型元数据：类型/名称/描述/配色，画布与工具箱共用。 |
| [RunPanel.tsx](../web/src/components/workflow/RunPanel.tsx) | 工作流运行面板：填输入 → 触发运行 → 逐节点结果实时展示。 |
| [WorkflowNodeCard.tsx](../web/src/components/workflow/WorkflowNodeCard.tsx) | 画布上的工作流节点卡片：按类型着色，显示节点名与摘要。 |

### `web/src/pages/`

| 文件 | 干什么 |
|------|--------|
| [ArticleLearn.tsx](../web/src/pages/ArticleLearn.tsx) | 文章学习页：学习源 CRUD、手动触发、学习历史（网页→LLM 总结→知识库+记忆）。 |
| [AutoLearn.tsx](../web/src/pages/AutoLearn.tsx) | 提示词采集页：采集源 CRUD、手动触发、已采提示词与历史查看。 |
| [Canvas.tsx](../web/src/pages/Canvas.tsx) | 一人团队人工主控画布：从文本、图片、视频到审核、备份与成片合成。 |
| [Dashboard.tsx](../web/src/pages/Dashboard.tsx) | 总览页：以“继续制作、当前阻塞、下一步行动”为核心，而非罗列系统资源数量。 |
| [DirectorStudio.tsx](../web/src/pages/DirectorStudio.tsx) | 导演 Agent 主页面：创意建项、七步进度、OpenRouter 媒体生成、镜头审片与成片预览。 |
| [Employees.tsx](../web/src/pages/Employees.tsx) | 数字员工管理页：员工 CRUD、启停、克隆、绑定技能/工具/MCP、知识库上传。 |
| [EpisodeDetail.tsx](../web/src/pages/EpisodeDetail.tsx) | 单集详情页：该集全部 G 生成单元卡片，按阶段 Tab 查看剧本/分镜/提示词/图/视频。 |
| [Evolution.tsx](../web/src/pages/Evolution.tsx) | 自我进化页：查看/采纳/拒绝 LLM 分析会话后产出的改进洞察。 |
| [KnowledgeCenter.tsx](../web/src/pages/KnowledgeCenter.tsx) | 一人工作室知识中心：聚合真实知识覆盖与现有入口。 |
| [KnowledgeGraph.tsx](../web/src/pages/KnowledgeGraph.tsx) | 能力关系图页：员工/工具/技能/团队/工作流的拓扑可视化。 |
| [Memory.tsx](../web/src/pages/Memory.tsx) | 记忆管理页：查看/增删员工的语义、经验、行为三类长期记忆，触发提取与蒸馏。 |
| [Pipeline.tsx](../web/src/pages/Pipeline.tsx) | CLI 流水线页：用本地 claude/gemini CLI 跑漫剧创作流水线（导演→编剧→美术…）。 |
| [Production.tsx](../web/src/pages/Production.tsx) | 制作看板页：漫剧十阶段卡片式流水线（创意→剧本→分镜→生图→成片）。 |
| [ProductionHub.tsx](../web/src/pages/ProductionHub.tsx) | 制作项目层级总览：剧 → 集 → G 生成单元 → 资源逐级下钻的入口页。 |
| [ProductionMatrix.tsx](../web/src/pages/ProductionMatrix.tsx) | 全链路对照矩阵：季 → 集 → G 生成单元 → 剧本/分镜/首帧/末帧/视频提示词/图/视频，一屏铺开。 |
| [Runs.tsx](../web/src/pages/Runs.tsx) | 运行记录页（可观测）：每次 agent 运行的 token/成本/轨迹审计 + 员工月度配额用量。 |
| [Settings.tsx](../web/src/pages/Settings.tsx) | 设置页：AI 供应商配置（endpoint/key/模型列表）与系统信息。 |
| [SkillTracker.tsx](../web/src/pages/SkillTracker.tsx) | AI 趋势雷达页：GitHub 趋势仓库追踪与 LLM 分析。 |
| [Tasks.tsx](../web/src/pages/Tasks.tsx) | 任务中心：自动列出当前用户任务并刷新状态，保留 Job ID 查询作为兼容入口。 |
| [Teams.tsx](../web/src/pages/Teams.tsx) | 团队管理页：团队 CRUD、成员编排与队长设置。 |
| [Templates.tsx](../web/src/pages/Templates.tsx) | 角色模板页：浏览模板并一键套用创建员工。 |
| [Tools.tsx](../web/src/pages/Tools.tsx) | 工具 & MCP 管理页：工具定义与 MCP 服务器的 CRUD。 |
| [UserLogin.tsx](../web/src/pages/UserLogin.tsx) | 用户端登录页：账号密码换 token，成功后进入主界面。 |
| [Workbench.tsx](../web/src/pages/Workbench.tsx) | 工作台：与数字员工/团队对话的主界面，含会话管理、附件、产出物与审批。 |
| [WorkflowEditor.tsx](../web/src/pages/WorkflowEditor.tsx) | 工作流编辑器：ReactFlow 画布拖拽节点连线，配置后保存/运行。 |
| [Workflows.tsx](../web/src/pages/Workflows.tsx) | 工作流列表页：工作流 CRUD 入口与运行历史。 |

### `web/src/pages/admin/`

| 文件 | 干什么 |
|------|--------|
| [AdminDashboard.tsx](../web/src/pages/admin/AdminDashboard.tsx) | 管理端总览：平台资源与用户统计。 |
| [AdminLogin.tsx](../web/src/pages/admin/AdminLogin.tsx) | 管理端登录页：管理员账号换管理端独立 token。 |
| [AdminProviders.tsx](../web/src/pages/admin/AdminProviders.tsx) | 管理端 AI 供应商治理：供应商 CRUD 与连通性测试。 |
| [AdminRoles.tsx](../web/src/pages/admin/AdminRoles.tsx) | 管理端角色管理：角色 CRUD 与权限勾选。 |
| [AdminUsers.tsx](../web/src/pages/admin/AdminUsers.tsx) | 管理端用户管理：平台用户 CRUD、改角色、启停、重置密码。 |

