# 知识库索引

## 按问题查找

| 你想了解 | 先看 | 关键入口 |
|---|---|---|
| 现在有哪些功能、怎么用、能交付什么 | FEATURES.md、../USER_GUIDE.md | 制作主线、数字员工、知识学习、平台管理 |
| 项目整体架构 | ARCHITECTURE.md、MODULES.md | app/main.py、admin/main.py、web/src/ |
| 如何启动、配置和排障 | OPERATIONS.md | docker-compose.yml、app/core/settings.py |
| API 路由在哪里 | API.md | app/api/、admin/api/、web/src/api.ts |
| 数据保存在哪里 | DATA.md | app/models/db/、app/dependencies.py、data/ |
| 高频故障怎么处理 | FAQ.md | Redis、鉴权、迁移、构建 |
| 异步任务怎么运行 | ARCHITECTURE.md | app/core/queue.py、app/tasks/worker.py |
| Agent/工作流怎么调用 | ARCHITECTURE.md | app/runtime/、app/tasks/agent_task.py |
| 前端页面和接口如何对应 | API.md | web/src/pages/、web/src/api.ts |

## 代码目录速查

- app/：用户端 FastAPI 业务服务。
- admin/：独立的管理端 FastAPI 服务和鉴权。
- web/：React + Vite + antd 前端。
- app/core/：配置、数据库、队列、日志和中间件。
- app/models/db/：SQLAlchemy 模型和存储实现。
- app/runtime/：Agent、提示词、工具和工作流运行时。
- app/tasks/：后台任务和 worker。
- migrations/：Alembic 数据库迁移。
- tests/：后端 pytest 测试。
- data/：JSON 存储、知识、记忆、生产数据和运行结果。
- deploy/：Prometheus、Grafana 等可观测性配置。
- scripts/：迁移、种子、校验和生产辅助脚本。

## 关键词

FastAPI React Vite PostgreSQL Redis arq Alembic Agent MCP RAG Canvas Production admin 鉴权 队列 存储迁移

## 运行与治理专题

- RUNTIME.md：本地、容器和发布流程。
- TROUBLESHOOTING.md：按现象定位启动、鉴权、队列、数据库和前端问题。
- GLOSSARY.md：统一 Agent、MCP、Store、checkpoint 等术语。

## 本地检索命令

执行 python -m scripts.project_kb search "关键词"。回答源码结构问题时，将检索结果中的路径交给 CodeGraph 做结构查询；回答日志、常量和错误文本时再使用 rg。
