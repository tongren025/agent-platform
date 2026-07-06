# 架构导览（人读的那份）

> 目标：三分钟内回答"这个系统怎么运转的、我想改 X 该去哪"。
> 逐文件说明查 [MODULE_INDEX.md](MODULE_INDEX.md)（自动生成）；改动历史查 [CHANGELOG.md](CHANGELOG.md)。

## 一、分层总览

```
web/src (React)  ──/api 代理──►  app/ 用户端(:8000)          admin/ 管理端(:8001)
                                     │                            │
        ┌────────────────────────────┼────────────────┐           │
        ▼                            ▼                ▼           ▼
   app/api/  路由层            app/runtime/       app/services/   复用 app 的
   （只做参数校验+调服务）      agent 执行内核      业务服务层       user_store 等
        │                            │                │
        └────────────┬───────────────┴────────────────┘
                     ▼
              app/core/   基础设施（配置/日志/DB/队列/限流/embedding/指标）
                     ▼
        data/ (JSON, 默认)  ←USE_DB_STORES 开关→  PostgreSQL (+pgvector)
```

**两份配置各管一摊**：`app/config.py` 读 appsettings.json（业务参数：目录/超时/价目/配额）；
`app/core/settings.py` 读 .env（基础设施：DB/Redis/密钥/开关）。

**装配点只有一个**：`app/dependencies.py`——所有 store/service 单例在这里按
`USE_DB_STORES` 开关选 JSON 或 PG 实现，API 层永远 import 这里的实例。

## 二、核心数据流

### 1. 一次对话（同步路径，最重要的一条链）

```
POST /agent/run                      app/api/agent.py      限流(20/min) + 月度配额检查
  └► run_invocation()                app/services/invocation.py
       ├► build_scopes + load_snapshot   app/runtime/snapshot.py   员工定义 → 运行时快照
       ├► compile()                      app/runtime/prompt.py     快照 → system prompt
       ├► run_agent()                    app/runtime/runner.py     装配工具 handler / 重试 / 降级
       │    └► run_agent_loop()          app/runtime/loop.py       ★ LLM+工具循环（含指数退避重试、
       │                                                             同供应商换模型、跨供应商 fallback）
       ├► 存会话                          memory_store（JSON 或 PG）
       ├► 落运行记录 + Prometheus 指标 + 配额累加    run_store / metrics / rate_limit
       └► 后台提取长期记忆                app/services/memory_extractor.py
```

### 2. 异步路径（M4，长任务不占请求连接）

```
POST /tasks/agent-run → app/core/queue.py 入 Redis → 独立 worker 进程
（python -m app.tasks.worker）消费 app/tasks/agent_task.py → GET /tasks/{job_id} 查结果
```

### 3. 工作流运行

```
POST /workflow/{key}/run → app/services/workflow_executor.py（Kahn 拓扑遍历 DAG）
  → app/services/workflow_nodes.py 各类型执行器（agent 节点复用 run_invocation）
  → 运行记录落 workflow_store
```

### 4. 知识库检索（M3 双轨）

```
上传文档 → registry.py 存文件 + 后台向量化(index_document → DashScope embedding → pgvector)
检索     → /knowledge/search：向量可用走语义(SemanticRetriever)，否则退化关键词(KeywordRetriever)
agent 内 → query_knowledge_base 工具（app/tools/builtin.py）
```

### 5. 记忆体系（三层）

| 层 | 存哪 | 谁写 | 谁读 |
|----|------|------|------|
| 会话记忆（消息历史） | sessions | invocation 每轮追加 | 续聊时注入 |
| 长期记忆（语义/经验/行为三类） | data/memory 或 PG | memory_extractor 后台提取 | prompt 编译时注入 |
| 蒸馏/进化 | distillation/evolution logs | 定时或手动触发 | 人工审阅采纳 |

## 三、"我想改 X" 速查表

| 想干什么 | 去哪 |
|---|---|
| 改 LLM 重试/超时/降级策略 | `app/runtime/loop.py`（`_create_with_retry`），参数在员工的 `defaultModelPolicy` |
| 加一个 agent 工具 | `app/tools/` 写 Handler + `register_handler`，再到工具注册表建定义并绑给员工 |
| 加一个 API 端点 | `app/api/` 对应文件加路由；新文件要在 `app/main.py` include_router |
| 加一张数据库表 | `app/models/db/` 建 ORM → `core/db.py init_db` 注册 → `alembic revision --autogenerate` |
| 改某类数据 JSON↔PG 切换逻辑 | `app/dependencies.py`（开关分支都在这） |
| 改前端页面/加导航 | `web/src/pages/` + `App.tsx` 路由 + `components/Layout.tsx` 导航（注意 perm 权限位） |
| 改鉴权/权限映射 | 用户端 `app/core/auth.py`；管理端 `admin/auth.py` |
| 改限流/配额 | `app/core/rate_limit.py`；配额数值在 appsettings.json `quotas` 段 |
| 改模型价目（成本核算） | appsettings.json `modelPrices` 段 |
| 加 Prometheus 指标 | `app/core/metrics.py` |
| 加工作流节点类型 | `app/services/workflow_nodes.py` 写执行器 + 前端 `nodeMeta.ts` |
| 写回归/评测 | `tests/`（pytest）；LLM 效果评测 `evals/cases/*.json` |

## 四、文档体系约定（四层）

1. **代码内 docstring**（全中文，AST 扫描保证无缺失）——看单个函数/类
2. **[MODULE_INDEX.md](MODULE_INDEX.md)**（自动生成）——按目录查"这文件干什么"
3. **本文件**——数据流与去哪改
4. **[CHANGELOG.md](CHANGELOG.md) + README**——为什么变成这样 / 怎么跑起来

同步规则：新增/重命名模块后跑 `python -m scripts.gen_module_index`；
本文件只在**数据流或分层变化**时手工更新（加个端点不用动它）。
