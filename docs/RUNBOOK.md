# 启动与排障手册 RUNBOOK

> 目标：照抄命令 3 分钟起服务，不用翻代码、不用猜。
> 本文件所有结论都核对过代码（2026-07-14）。发现文档与实际行为不符时，先改这里。
> 架构与数据流看 [ARCHITECTURE.md](ARCHITECTURE.md)；逐文件职责看 [MODULE_INDEX.md](MODULE_INDEX.md)。

## 0. 最短路径（零配置就能跑）

```bash
# 终端 1 —— 后端用户端 (:8000)
.venv\Scripts\activate          # Linux/Mac: source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 终端 2 —— 前端 (:5173)
cd web && npm run dev
```

打开 http://localhost:5173，登录 **admin / admin123**（首次启动自动创建，`app/services/user_store.py`）。

零配置的含义（都核实过）：
- **不需要** `.env`——`app/core/settings.py` 全字段有默认值。
- **不需要** `appsettings.Development.json`——缺失时按空配置处理（`app/config.py:84`）。
- **不需要** PostgreSQL / Redis / DashScope——见 §4 可选服务矩阵。
- **LLM 供应商可以事后配**：管理端 UI 添加（落盘 `data/ai-providers/*.json`），或写
  `appsettings.Development.json` 的 `aiModels` 段。没配之前服务照常跑、能登录能点页面，
  只有真正调 LLM 时才报「没有可用的 AI provider」（`app/services/ai.py:186`）。

## 1. 端口一览与三个必踩的坑

| 进程 | 端口 | 启动命令 |
|------|------|---------|
| app 用户端 API + SPA | 8000 | `uvicorn app.main:app --port 8000 --reload` |
| web 前端 dev server | 5173 | `cd web && npm run dev` |
| admin 管理端 API | 8001 | `uvicorn admin.main:app --port 8001 --reload` |
| worker 异步任务消费者 | — | `python -m app.tasks.worker`（需 Redis） |
| Letta 记忆运行时（可选，未接线） | 8283 | `.\scripts\start_letta.ps1` |

**坑 1：`python -m app.main` 起在 5311，不是 8000。**
`app/main.py` 的 `__main__` 分支读业务配置 `Port`（默认 5311，`app/config.py:72`），而仓库
appsettings.json 里根本没有 Port 键。前端代理和 docker-compose 都按 8000 对齐——
**永远用 `uvicorn ... --port 8000` 显式指定**。

**坑 2：鲜克隆直连 :8000 白屏。**
`wwwroot/index.html` 进了版本库，但它引用的 hash 化 bundle（`wwwroot/assets/`）被 gitignore。
开发期走 5173（Vite 代理 `/api`→8000、`/api/admin`→8001）；要直连 8000 先 `cd web && npm run build`
（产物直接写到仓库根 `wwwroot/`）。

**坑 3：根目录 `main.py` 不是入口。**
真入口是 `app/main.py`（用户端）和 `admin/main.py`（管理端）。根目录那个只是 uv 初始化残留的指路牌。

## 2. 每个进程的启动细节

### app 用户端（:8000）
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
启动时自动做四件事（`app/main.py` lifespan）：
1. 员工记录兜底迁移（补 tags/source/created_at）；
2. 团队 roles → member_employee_keys 回填；
3. `SEED_DEMO_WORKFLOWS=true` 时幂等种入漫剧演示工作流（默认 **false**，失败只告警不阻断）；
4. 拉起 DailyScheduler（30 秒巡检）：趋势同步 `TRENDS_SYNC_TIME`（默认 02:00）、
   记忆蒸馏 03:00、自我进化 04:00（后两者硬编码在 `app/services/scheduler.py:27`，不可配）。

**没有 Alembic 自动迁移**：`USE_DB_STORES=true` 时仅 `create_all` 兜底；生产走
`alembic upgrade head`。注意 `alembic.ini` 里的 `sqlalchemy.url` 是死占位符——真实 DSN 由
`migrations/env.py` 运行时注入（优先 `ALEMBIC_URL` 环境变量，否则 `settings.database_url`），
**改 alembic.ini 不生效**。

### web 前端（:5173）
```bash
cd web && npm run dev     # 裸 vite，默认 5173
npm run build             # tsc -b && vite build，产物写仓库根 wwwroot/ 并清空旧产物
```
代理规则（`web/vite.config.ts`）：`/api/admin` → 127.0.0.1:8001（更具体前缀在前），`/api` → 127.0.0.1:8000。

### admin 管理端（:8001）
```bash
uvicorn admin.main:app --port 8001 --reload    # 端口也可用 ADMIN_PORT 环境变量改
```
- 默认账号 **admin / admin123**（`ADMIN_USERNAME/ADMIN_PASSWORD` 可改）。
- 裸访问 :8001 返回指引 JSON——管理界面实际在前端的 `/admin` 路由（开发期 http://localhost:5173/admin/login）。
- **`ADMIN_SECRET` 不配 = 每次重启随机生成 = 重启踢掉全部已登录管理端**。本机也建议在 `.env` 固定一个长随机串。
- app(:8000) 与 admin(:8001) 的 token **互不通用**（两套独立鉴权）。

### worker 异步任务消费者
```bash
python -m app.tasks.worker      # 或 arq app.tasks.worker.WorkerSettings
```
- 唯一前置是 Redis（`REDIS_URL`）。**不起 worker，任务中心提交的任务会永远停在 queued**——它是唯一消费端。
- 参数：max_jobs=10、单任务超时 600s、队列名 default。

## 3. 配置双轨制（谁读哪份）

| 配置文件 | 读取方 | 管什么 |
|---------|--------|--------|
| `appsettings.json`（+ `appsettings.Development.json` 深合并覆盖） | `app/config.py` | 业务参数：数据目录、Shell 白名单、委派深度、知识库限额、`aiModels` 供应商、`modelPrices` 价目、`quotas` 配额 |
| `.env` | `app/core/settings.py`（pydantic-settings） | 基础设施：DB/Redis 连接串、鉴权开关、种子开关、调度时间 |

关键键速查（默认值都核实过代码）：

| 键 | 默认 | 不配/配错会怎样 |
|----|------|----------------|
| `USE_DB_STORES` | false | **唯一会把「起服务」变成「必须先起 PG」的开关**：true 时 import 期就连 PG，不通直接起不来 |
| `USER_API_AUTH` | true | 所有 `/api/*` 需 Bearer token；豁免登录端点、OPTIONS、production 素材 GET |
| `SEED_DEMO_WORKFLOWS` | false | true 才种入漫剧演示工作流 |
| `DATABASE_URL` / `REDIS_URL` | 指向 compose 服务名 `postgres`/`redis` | **裸机开发必须手改为 127.0.0.1**，否则连不上 |
| `DASHSCOPE_API_KEY` | 空 | 空=embedding 跳过、语义检索静默降级为关键词检索，不影响启动 |
| `ADMIN_SECRET` | 空 | 空=管理端 token 每次重启全部失效 |
| `TRENDS_AUTO_SYNC` / `TRENDS_SYNC_TIME` | true / 02:00 | 趋势雷达每日同步 |
| `aiModels`（appsettings） | 无 | 一旦写了，`name/endpoint/apiKey` 三键必填——缺键会在 **import 期 KeyError 崩掉 uvicorn** |

**密钥现状（三个地方，按优先级）**：管理端 UI 落盘的 `data/ai-providers/*.json`（最优先）>
`appsettings.Development.json` 的 `aiModels` > 无。`aiModels[].apiKey` 支持 `${ENV_NAME}` 占位符，
例如 OpenRouter 可写 `"apiKey": "${OPENROUTER_API_KEY}"`，真实 key 放 `.env` 或系统环境变量。
`.env` 也管基础设施密钥（DashScope 等）。
`appsettings.Development.json` 已 gitignore，但它在盘上是明文——不要把它复制进任何会入库的路径。
另注意其中 `AdminApiBaseUrl`（:5040）指向的是**外部充值策略 admin API**（`app/api/strategy_proxy.py` 消费），
与本仓 :8001 的 admin/ 服务重名不同物。

OpenRouter 配置最小例子：

```json
{
  "aiModels": [
    {
      "name": "openrouter",
      "endpoint": "https://openrouter.ai/api/v1",
      "apiKey": "${OPENROUTER_API_KEY}",
      "enabled": "true",
      "models": [
        { "modelName": "OpenRouter Auto", "modelId": "openrouter/auto", "timeoutMinutes": 20 }
      ]
    }
  ]
}
```

## 4. 可选外部服务矩阵（不起会怎样）

| 服务 | 默认需要吗 | 不起的后果 |
|------|-----------|-----------|
| PostgreSQL(+pgvector) | 否 | 一切走 JSON 文件存储；只有 `USE_DB_STORES=true` 才必须 |
| Redis | 否 | 服务照常起（懒连接）；仅任务中心 API 调用时返 503「异步队列不可用」；限流/配额用内存实现不受影响 |
| DashScope | 否 | 知识库语义检索降级为关键词检索（fail-open） |
| Letta(:8283) | 否 | 脚手架已备未接线，不影响任何现有功能 |
| Prometheus/Grafana | 否 | 只影响监控面板，`/metrics` 端点始终暴露 |

## 5. 常见报错 → 解法

| 症状 | 原因 | 解法 |
|------|------|------|
| 调 LLM 报「没有可用的 AI provider」 | 供应商没配 | 管理端 UI 加供应商，或写 `appsettings.Development.json` 的 aiModels |
| uvicorn import 期就崩 KeyError | aiModels 写了但缺 name/endpoint/apiKey | 三键补齐 |
| uvicorn import 期崩在 PG 连接 | `USE_DB_STORES=true` 且 PG 不通 | 起 PG 并把 `DATABASE_URL` 指向 127.0.0.1，或改回 false |
| 任务中心 503「异步队列不可用」 | Redis 没起/连不上 | 起 Redis，`REDIS_URL` 指向 127.0.0.1；再起 worker |
| 任务一直 queued 不执行 | worker 没起 | `python -m app.tasks.worker` |
| 直连 :8000 白屏 | 前端产物未构建（assets/ 被 gitignore） | `cd web && npm run build`，或开发期走 5173 |
| 页面白屏且强刷才恢复 | 浏览器缓存了旧 index.html | 已在服务端修（index.html 强制 no-cache）；仍出现就 Ctrl+Shift+R |
| 起在 5311 端口 | 用了 `python -m app.main` | 改用 `uvicorn app.main:app --port 8000` |
| 管理端重启后全员被踢 | `ADMIN_SECRET` 为空每次随机 | `.env` 固定长随机串 |
| 生产卡片素材图 404 | 克隆后没有 `resouce/` 目录（gitignore） | 素材在 682MB `漫剧.zip` 里，解压到 `resouce/`；注意目录名拼写就是少个 r，代码硬编码，**别建 `resource/`** |

## 6. data/ 目录地图（运行时状态，新人最容易懵）

`data/` 默认全部 gitignore，**唯一例外 `data/production/`（漫剧卡池，已入库 5 季 4062 卡）**。
按生产者分四类：

| 子目录 | 谁写 | 说明 |
|--------|------|------|
| employees / teams / tools / skills / mcp-servers / role-templates / workflows / workflow-runs / agent-runs / sessions | 注册表与运行链路 | 平台核心对象，`app/config.py` 可改路径 |
| knowledge/&lt;员工&gt; / memory/&lt;员工&gt; / evolution/&lt;员工&gt; | 知识库上传 / 记忆提取 / 蒸馏进化 | **按员工 key 分子目录** |
| scrape-sources / scrape-history / collected-prompts / learn-sources / learn-history | 自动学习采集 | 定时或手动触发 |
| ai-providers | 管理端 UI | LLM 供应商配置（优先级最高的那份） |
| production/jiulu-s1..s5 | 制作看板 | **删了不可再生**；每项目 project.json + cards.json + archive/ + uploads/ |
| canvas | 自由画布 | 1.2s 防抖自动保存 |
| platform | 用户/角色（users.json、roles.json） | 用户端登录鉴权数据 |
| trends | 趋势雷达 | profile.json（兴趣画像）、seen.json（**已读态，删了会重复推送**） |
| thumb-cache/{64,128,256,512} | 缩略图服务 | **纯缓存，随时可删**，按源文件 mtime 自动失效 |
| uploads | 各上传入口 | 对话/画布/卡片上传的原始文件 |

## 7. 根目录文件辨析（哪些是杂物、哪些不能动）

| 文件/目录 | 是什么 |
|-----------|--------|
| `main.py` | uv 初始化残留的指路牌，**不是入口**（真入口 `app/main.py`） |
| `_server_*.log` / `_vite_*.log` | 历史会话手动重定向的进程输出，代码零引用，已 gitignore，可删 |
| `_gen_cards_v3.py` / `_gen_cards_v4.py` | 历史卡池生成器，**误跑会全量覆盖现有 4062 卡卡池**，见 [scripts/README.md](../scripts/README.md) 危险区 |
| `resouce/` | 本地媒体素材根（**拼写就是少个 r**，代码硬编码）；gitignore，从 `漫剧.zip` 解压获得 |
| `output/` | 历史创作交付物（S1 分镜 PNG 等），代码不写入；gitignore 用的无锚点 `output/`，会连带忽略任何同名目录（skill_tracker/output 即中招，有意为之） |
| `wwwroot/` | 前端构建产物挂载点；只有 index.html 入库 |
| `automations/` | Claude Code 定时自动化任务的持久记忆（如自动生图任务的进度），不被业务代码消费 |
| `AGENTS.md` | `CLAUDE.md` 的逐字镜像（给 Codex 等其它 agent），**改一个必须同步另一个** |
| `openapi_letta.json` | Letta v0.16.8 OpenAPI 规范，vendored 只作接口对照，无代码消费 |
| `skills-lock.json` | vendored 技能锁文件（ai-video-generation / remotion-render / seedance-v2），对应 `.agents/skills/` 与 `.claude/skills/` |
| `appsettings.Production.json` | 生产环境业务配置（compose 内使用） |
| `skill_tracker/` | 独立 GitHub 榜单小工具（趋势雷达数据源），产出被 `app/api/skills.py` 消费；`output/snapshots/` **永不清理**（star 历史只存在于快照，删了不可再生） |
| `evals/` | LLM 输出回归网：`python -m evals.run_evals`（需已配 LLM 供应商），golden case 在 `evals/cases/` |

## 8. 测试与验证

```bash
python -m pytest -q          # 全量测试，零外部服务依赖（pytest.ini：asyncio_mode=auto）
cd web && npm run build      # 前端类型检查 + 构建
python -m scripts.gen_module_index   # 新增/重命名模块后重刷 docs/MODULE_INDEX.md
```

## 9. Docker 路线

```bash
cp .env.example .env      # 至少改 POSTGRES_PASSWORD / ADMIN_PASSWORD / ADMIN_SECRET
docker compose up -d --build
```
app :8000 · admin :8001 · Grafana :3000（admin/admin）· Prometheus :9090。
app/admin/worker 三容器共享同一镜像，仅 command 不同；容器内 `DATABASE_URL/REDIS_URL`
用 compose 服务名（.env.example 默认值即为此设计）。
