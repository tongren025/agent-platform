# 数据与存储

## 存储开关的真实范围

`app/core/settings.py` 的 `USE_DB_STORES` 由 `app/dependencies.py` 读取。它只切换四类运行态实现：

| 数据 | 关闭开关（默认） | 开启开关 |
|---|---|---|
| 对话会话 | `ConversationMemoryStore`，JSON | `ConversationMemoryDbStore`，PostgreSQL |
| Agent 运行记录 | `AgentRunStore`，JSON | `AgentRunDbStore`，PostgreSQL |
| 长期记忆 | `LongTermMemoryStore` + `JsonMemoryBackend` | `LongTermMemoryStore` + `PgMemoryBackend` |
| 向量检索 | `vector_store=None`，关键词检索 | `VectorStore` + `SemanticRetriever`，pgvector（还需 `DASHSCOPE_API_KEY`） |

不要在业务模块自行判断环境变量；通过 `app.dependencies` 暴露的 store 单例访问。

下列数据**不受** `USE_DB_STORES` 切换，仍由各 service 的 JSON 文件实现：员工/团队/角色模板/技能/工具/MCP/工作流注册表，知识文档，工作流运行记录，制作项目与卡片，采集和学习历史，快捷提示，AI 供应商配置，趋势缓存及生产素材。

## PostgreSQL 与 ORM

数据库连接、session 和开发建表路径在 `app/core/db.py`；生产结构变更使用 Alembic。当前 ORM 表（`app/models/db/`）：

- `roles`、`users`（`user.py`）；
- `conversation_sessions`（`session.py`）；
- `agent_runs`（`run.py`）；
- `long_term_memories`（`memory.py`）；
- `embeddings`（`embedding.py`）。

迁移文件在 `migrations/versions/`，不要修改已执行迁移；新增表/字段应追加新版本并补测试。

## JSON 数据目录

- `data/platform/`：平台用户和角色（`app/services/user_store.py`）；
- `data/employees/`、`data/teams/`、`data/role-templates/`、`data/skills/`、`data/tools/`、`data/mcp-servers/`：注册表；
- `data/knowledge/`、`data/memory/`、`data/sessions/`、`data/agent-runs/`：知识、长期记忆、会话和运行记录的 JSON 分支；
- `data/workflows/`、`data/workflow-runs/`：工作流定义及运行记录；
- `data/production/`、`data/canvas/`：制作项目、媒体和画布工作区；
- `data/ai-providers/`、`data/quick-prompts/`：供应商密钥密文和用户快捷提示；
- `data/scrape-sources/`、`data/collected-prompts/`、`data/scrape-history/`、`data/learn-sources/`、`data/learn-history/`：采集/学习配置及历史。

`app/services/canvas_projects.py` 明确生产项目 `data/production/<project_id>` 是业务真相，画布快照是独立工作区；不要用快照覆盖生产项目。

## 数据迁移与备份

1. 备份目标数据库或 JSON 目录，记录时间、版本和来源。
2. 阅读 migration 的 `upgrade/downgrade`，在测试环境执行并运行 `tests/test_migrate_json_to_pg.py` 及领域测试。
3. 仅对已实现 DB store 的运行态执行 `scripts/migrate_json_to_pg.py`；注册表、工作流、生产项目等 JSON 数据不能假定会自动迁移。
4. 切换后核对记录数、关键 API、记忆读写和向量检索；失败时优先恢复应用版本和备份。
