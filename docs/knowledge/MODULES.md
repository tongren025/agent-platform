# 模块索引

本文按主平台业务领域列出源码入口、测试入口和维护边界。工作台/第三方子模块另有各自文档，不在此复制其内部架构。

| 业务领域 | 源码入口 | 主要测试 | 维护边界 |
|---|---|---|---|
| 应用启动与基础设施 | `app/main.py`、`app/core/` | `test_health.py`、`test_deployment_config.py`、`test_metrics.py` | 配置、日志、中间件、鉴权、限流、队列和指标；路由业务放 `app/api/` |
| 用户鉴权与会话 | `app/api/user_auth.py`、`app/api/sessions.py`、`app/core/auth.py` | `test_user_api_auth.py`、`test_session_workspace.py` | 共享身份凭证、会话与工作区访问；用户业务与管理接口分别检查当前权限 |
| Agent 运行时 | `app/api/agent.py`、`app/runtime/`、`app/services/invocation.py` | `test_agent_streaming.py`、`test_agent_loop_retry.py`、`test_gpt56_runtime.py`、`test_mcp_runtime.py` | prompt、模型调用、工具/MCP、checkpoint；外部 provider 适配集中在 services |
| 注册表与组织 | `app/api/registry.py`、`app/api/skills.py`、`app/services/registry.py` | `test_registry_store.py`、`test_skill_packages.py`、`test_skill_dependencies.py` | 员工、团队、角色模板、技能、工具、MCP 和工作流定义的 JSON 注册表 |
| 工作流编排 | `app/api/workflow.py`、`app/services/workflow_executor.py`、`workflow_nodes.py` | `test_comic_workflow_definition.py`、`test_remaining_workflow_features.py`、`test_seed_workflows.py` | 图校验、节点执行、超时和运行记录；不负责 Redis Agent 任务 |
| 异步 Agent 队列 | `app/core/queue.py`、`app/api/tasks.py`、`app/tasks/worker.py` | `test_queue.py`、`test_agent_run_control.py` | Redis/arq 入队、状态、取消、重试；worker 仅注册 `run_agent_task` |
| 制作生产 | `app/api/production.py`、`app/services/production_quality.py`、`app/services/image_generation.py` | `test_production_*.py`、`test_tiexin_*.py` | 项目/卡片/阶段生成、媒体上传和质量审核；业务真相在 `data/production/` |
| 画布与导演 | `app/api/canvas.py`、`app/api/director.py`、`app/services/canvas_*.py`、`app/services/shot_control.py` | `test_canvas_*.py`、`test_shot_control.py`、`test_jiulu_trajectory_storyboards.py` | 画布/镜头控制、项目快照和导演流程；不要直接改生产项目 JSON |
| 知识、记忆与学习 | `app/api/knowledge_graph.py`、`memory_api.py`、`scrape.py` | `test_memory_*.py`、`test_long_term_memory_db.py`、`test_vector_store.py`、`test_refresh_comic_profiles.py` | 知识检索、三层长期记忆、采集/学习；DB 开关只覆盖运行态记忆/向量 |
| AI 供应商与模型 | `app/api/ai_providers.py`、`app/services/ai.py`、`model_transport.py` | `test_ai_service_model_refs.py`、`test_model_transport.py`、`test_openrouter_media.py` | 供应商密钥加密、模型目录、Responses/兼容协议；不得在日志泄露密钥 |
| 管理治理 | `admin/main.py`、`admin/api/`、`admin/auth.py` | `test_admin_proxy.py`、`test_production_permissions.py` | 管理用户、角色、供应商和系统概览；独立进程/鉴权 |
| 前端 | `web/src/App.tsx`、`web/src/api.ts`、`web/src/adminApi.ts` | `web/tests/`、前端构建 `npm --prefix web run build` | React/Vite/antd 页面、状态、API client；不在前端复制后端业务规则 |
| 可观测性与评估 | `app/core/metrics.py`、`app/core/observability.py`、`deploy/`、`evals/` | `test_metrics.py`、`test_evals.py`、`evals/run_evals.py` | 指标、Prometheus/Grafana、评估脚本；不修改业务数据模型 |
