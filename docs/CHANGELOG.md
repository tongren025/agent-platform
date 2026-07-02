# 改动记录 CHANGELOG

> 规则见 [CLAUDE.md](../CLAUDE.md):每次功能性改动必须在此追加一条。
> 最新在上。格式:`## [日期] 标题` + 变更点 + 影响面。

---

## [2026-07-01] M5 限流/配额 + M4 异步任务队列 + M3 向量检索 + M6 Grafana 面板

**动机**：M0-M2-M6 已落地后的收尾冲刺——把剩余三个里程碑（M5/M4/M3）一次性交付，
同时补齐 Grafana 自动置备面板，使 M0-M6 全线完工。

**变更点**

### M5 限流/配额
- 新增 `app/core/rate_limit.py`：slowapi 全局限速（IP 维度 60/min 默认）+
  员工月度 token 配额（`check_quota` / `record_token_usage`），配额从
  `appsettings.json` 的 `quotas` 段读（`default_monthly_tokens` + `overrides`）。
- `app/main.py`：挂载 slowapi `Limiter` + 429 handler。
- `app/api/agent.py`：`/run` 端点加 `@limiter.limit("20/minute")` + 配额检查。
- `app/api/runs.py`：新增 `GET /quota/{employee_key}` 查本月用量。
- `app/services/invocation.py`：每次 run 结束后 `record_token_usage` 累加。
- `app/config.py`：新增 `quotas` 配置项。
- 测试：`test_rate_limit.py`（7 用例：配额检查/阻断/override/API）。

### M4 异步任务队列
- 新增 `app/core/queue.py`：arq Redis 连接池 + `enqueue` 辅助。
- 新增 `app/tasks/agent_task.py`：`run_agent_task` 异步任务函数。
- 新增 `app/tasks/worker.py`：arq WorkerSettings，
  `python -m app.tasks.worker` 或 `arq app.tasks.worker.WorkerSettings` 启动。
- 新增 `app/api/tasks.py`：
  `POST /tasks/agent-run`（入队）+ `GET /tasks/{job_id}`（状态查询）。
- `docker-compose.yml`：新增 `worker` 服务（与 app 同镜像，command 改 worker）。
- 测试：`test_queue.py`（5 用例：模块可导入/worker 设置/API 路由）。

### M3 向量检索
- 新增 `app/core/embedding.py`：DashScope text-embedding-v3（1024 维），
  `embed_texts` / `embed_single`，无 API key 时 fail-open 返空。
- 新增 `app/models/db/embedding.py`：`EmbeddingORM`（pgvector Vector 列，
  SQLite 退化为 JSON）。
- 新增 `app/services/vector_store.py`：
  `VectorStore`（upsert/delete/cosine_distance 搜索）+
  `SemanticRetriever`（query→embed→search→KnowledgeSnippet）+
  `_split_text` 文本切片。
- `app/dependencies.py`：`use_db_stores=True` 时实例化 `vector_store` /
  `semantic_retriever`，否则为 None。
- `app/api/registry.py`：新增 `GET /employees/{key}/knowledge/search?q=&topK=`，
  有向量检索走语义，否则退化关键词。
- `app/core/db.py`：`init_db` 注册 EmbeddingORM。
- Alembic：`a7c2e3f41b90_add_embeddings_table` 新建 `embeddings` 表 + pgvector 扩展。
- 测试：`test_vector_store.py`（10 用例：模块导入/切片/无 key 退化/API）。

### M6 Grafana 面板
- 新增 `deploy/grafana/provisioning/dashboards/dashboard.yml`：面板自动置备。
- 新增 `deploy/grafana/provisioning/dashboards/agent-overview.json`：
  7 个 panel（运行次数/成功率/总次数/Token 速率/成本累计/HTTP 速率/HTTP P95），
  docker-compose 启动即自动加载。

**影响面**
- **配置**：appsettings.json 可选新增 `quotas` 段。
- **环境变量**：`DASHSCOPE_API_KEY`（M3 可选，不配则退化关键词检索）。
- **DB**：新增 `embeddings` 表（仅 use_db_stores=True 且有 PG 时）。
- **容器**：docker-compose 新增 `worker` 服务。
- **监控**：Grafana 启动即有 "Agent 运行概览" dashboard。
- **接口**：新增 `/tasks/agent-run`、`/tasks/{job_id}`、`/quota/{employee_key}`、
  `/employees/{key}/knowledge/search`。

---

## [2026-07-01] M2 成本真值 + M6 指标核心

**动机**:运行记录已落 token,但成本一直显"未配价目";可观测只有 HTTP 指标,没有 LLM 维度。
本次让成本变成可配的真数字,并把运行/token/成本暴露成 Prometheus 指标——"钱和量"闭环。

**变更点**
- M2:`estimate_cost` 改从配置读价目——`app/config.py` 新增 `model_prices`
  (appsettings.json 的 `modelPrices` 段:`model_id -> {promptPer1k, completionPer1k}`,USD)。
  填了才算,默认空(价格会漂,不硬编码)。运行看板的"成本"列随之自动显真金白银。
- M6:新增 `app/core/metrics.py`,自定义 Counter:`agent_runs_total{employee,success}`、
  `agent_prompt_tokens_total`、`agent_completion_tokens_total`、`agent_cost_usd_total`;
  `invocation.py` 每次 run 结束累加,随既有 /metrics 暴露,Grafana 可直接取。
- 新增测试:`test_metrics.py`(指标累加 + /metrics 暴露)、更新 `test_run_store.py` 成本用例。

**影响面**
- **配置**:appsettings.json 新增可选 `modelPrices` 段;不填则成本为 null(行为不变)。
- **指标**:/metrics 新增 4 个 `agent_*` 指标(需配 Grafana 面板才"看得见",面板本次未做)。
- 无 DB / 接口契约变化。

---

## [2026-07-01] ⚠️ 修正:M1 之前的"已完成"记录名不副实

**核对结论**:本文件此前的 M1 条目声称已交付 `app/repositories/user_repo.py`
(`PgRoleStore`/`PgUserStore`)、`alembic.ini` + `migrations/0001_initial`、
`scripts/migrate_json_to_pg.py`,并已把 `dependencies` 切到 PG。**代码树核对:上述文件
全部不存在**,`dependencies.py` 仍用 JSON 版 `RoleStore/UserStore`,`session_scope`/
`SessionLocal`/`init_db` 无任何调用处,且连 `sqlalchemy`/`psycopg` 都未安装。
即:M1 只有 `app/core/db.py` + `app/models/db/{base,user}.py` 的**脚手架**,从未真正接线。
现把该条目改写为真实进度,避免文档继续误导。

## [2026-07-01] M1 数据层:运行记录 + 会话 + 长期记忆 → PostgreSQL(可切换,"要查的"已齐)

**动机**:JSON 文件存储读改写无锁,并发下丢数据。M1 给每个 store 加"PG 可选"开关——
**只迁"要查的"运行态**(运行记录、会话、长期记忆),注册表等静态配置永远留 JSON。
JSON 默认(单人自用清爽),PG 备用(要查/演示/上量时一个环境变量切过去),两者不冲突。
本次收尾长期记忆后,三类"要查的"运行态全部可切。

**变更点**
- 新增 ORM:`app/models/db/{run,session,memory}.py`
  (`agent_runs` / `conversation_sessions` / `long_term_memories` 表),`to_dict()`/结构对齐旧 JSON。
- 新增仓储/后端:`run_store_db.py`(`AgentRunDbStore`)、`memory_db.py`(`ConversationMemoryDbStore`)、
  `long_term_memory_db.py`(`PgMemoryBackend`);接口与 JSON 版逐字一致,并发安全由事务保证。
- **长期记忆重构**:`long_term_memory.py` 把"读整表/写整表"抽成 `MemoryBackend` 原语
  (`JsonMemoryBackend` 默认),合并/衰减/检索/截断逻辑一行不改即可换 PG——零行为漂。
- `app/core/settings.py`:新增开关 `use_db_stores`(默认 `False`),灰度切换。
- `app/core/db.py`:`init_db()` 注册三张表 ORM。
- `app/dependencies.py`:开关为真时 `agent_run_store` / `memory_store` / `long_term_memory` 走 PG。
- 新增测试:`test_run_store_db.py`、`test_memory_db.py`、`test_long_term_memory_db.py`——
  SQLite 内存库验证 round-trip / 幂等 / 过滤 / 合并检索 / 子结构完整往返。
- 新增 Alembic:`alembic.ini` + `migrations/`(`env.py` 用 `settings.database_url`,`ALEMBIC_URL` 可覆盖),
  `5b08f4badaa1_initial_schema` 建全部 5 张表(users/roles/agent_runs/conversation_sessions/long_term_memories)。
- 新增导入脚本 `scripts/migrate_json_to_pg.py`:把 `data/{agent-runs,sessions,memory}` 幂等导入 PG
  (+ `test_migrate_json_to_pg.py`,SQLite 目标验证读→写映射)。

**影响面**
- **DB**:新增 `agent_runs`、`conversation_sessions`、`long_term_memories` 表(仅当 `use_db_stores=True` 且装了 DB 依赖)。
- **配置**:新增 `USE_DB_STORES` 环境变量,默认关。
- 受影响接口:`/agent/runs`、`/agent/sessions`、`/memory/*`(存储层透明切换,契约不变)。
- **仍为 JSON**:注册表(员工/团队/工具/技能/工作流,**刻意保留**——静态配置)、平台用户/角色、采集/学习历史。
- **生产启用步骤**:`pip install -r requirements.txt` → 配 `DATABASE_URL` → `alembic upgrade head` →
  (可选)`python -m scripts.migrate_json_to_pg` 搬历史 → `USE_DB_STORES=true`。
- **验证边界**:migration 已在 SQLite 上 upgrade/downgrade 通过;真实 PG 联调需在有 PG 的环境跑。

---

## [2026-07-01] M0 工程地基:Docker Compose + 配置密钥 + 结构化日志 + CI

**动机**:此前仅有 CORS 中间件、basicConfig 日志、密钥明文进 json、无测试无部署,
不具备"团队批量生产 + 可推广"的底座。M0 立起后续里程碑共同依赖的地基。

**变更点**
- 编排:`docker-compose.yml`(postgres+pgvector / redis / app / admin / prometheus / grafana)+ 多阶段 `Dockerfile` + `.dockerignore`。
- 配置:`app/core/settings.py`(pydantic-settings + `.env`),密钥移出版本库;`.env.example` 为样例;CORS 由环境变量收窄。
- 日志:`app/core/logging.py`(structlog)+ `app/core/middleware.py`(request_id 全链路)+ `app/core/errors.py`(统一异常信封,生产不外泄堆栈)。
- 可观测:`app/core/observability.py` 暴露 `/metrics`,Prometheus/Grafana 置备(`deploy/`)。
- 质量:`tests/`(冒烟测试)+ `pytest.ini` + `.github/workflows/ci.yml`(后端 pytest + 前端 tsc/build)。

**影响面**
- `app/main.py` / `admin/main.py`:挂 RequestContextMiddleware、异常处理器、`/metrics`;日志改 structlog。
- **配置**:新增环境变量 `APP_ENV/DATABASE_URL/REDIS_URL/LOG_LEVEL/LOG_JSON/CORS_ORIGINS/ADMIN_*/DASHSCOPE_API_KEY`。
- `.gitignore`:忽略 `.env`。
- 启动方式:`docker compose up -d --build` 一键起全套。
