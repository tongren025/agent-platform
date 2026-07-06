# 改动记录 CHANGELOG

> 规则见 [CLAUDE.md](../CLAUDE.md):每次功能性改动必须在此追加一条。
> 最新在上。格式:`## [日期] 标题` + 变更点 + 影响面。

---

## [2026-07-06] docs: 年度路线图 ROADMAP.md(2026-07 ~ 2027-06)

**动机**:平台底座完工后进入"生产优先"阶段,需要一份进版本库的作战地图,
把目标/已完成/优化项/待建设/欠账/机会/不做清单固化,团队与 AI 会话共同对齐。

**变更点**:新增 `docs/ROADMAP.md`——北极星(单集成片周期)、KPI 季度表、
四季度主题计划(Q3 打样闭环 / Q4 成片发布团队化 / Q1 提速迭代 / Q2 规模与商业化决策)、
8 项优化(含验收标准)、8 项欠账、8 项触发式机会、负面清单、复盘机制。
README 文档导航挂链。

**影响面**:纯文档。每月对表更新,每集复盘追加到文末记录区。

---

## [2026-07-06] chore: 开源基线——AGPL-3.0 许可证 + 英文 README

**动机**:仓库自称 open-source 但底部写"私有项目仅供内部使用"且无 LICENSE 文件
(GitHub 显示 license: null),路人不敢用更不会 star;星的大头在国际社区但只有中文 README。

**变更点**
- 新增 `LICENSE`:AGPL-3.0 官方全文——个人/自部署/二开自由,SaaS 化需同协议开源,保留商业闭源授权空间。
- `README.md`:许可证一节改为 AGPL-3.0 说明;顶部加中英文切换链接。
- 新增 `README.en.md`:精简英文版(定位/功能/快速启动/架构/协议),突出垂直漫剧管线差异化。

**影响面**:纯文档/法律文件,无代码行为变化。GitHub 仓库页将自动识别并展示 AGPL-3.0。

---

## [2026-07-06] feat: 自由画布定位转向——数据的可视化生成台(AI 派生 + 看板双向)

**动机**:7-03 首版画布把重心放在"API 生图"上,方向偏了——出图由小云雀/即梦
半自动路径承担,没必要在平台里重造生成器。用户真正要的是**可视化地生成生产
数据**(剧本/设定/分镜/提示词):指着任意数据节点让数字员工派生下游数据,
派生血缘全程可见;看板是表视图,画布是图视图,同一份数据。

**变更点**
- `app/models/production.py`:新增 `STAGE_INSTRUCTIONS`(各阶段 AI 生成指令
  模板,从 production.py 的 generate_stage 函数体提取为模块级常量,
  看板逐阶段生成与画布派生共用,避免两处漂移)。
- `app/api/production.py`:generate_stage 改用共享模板,行为不变。
- `app/api/canvas.py`:新增 `POST /canvases/{cid}/derive`——源节点内容 +
  阶段指令模板 + 额外指令交给数字员工(复用 `run_invocation`),回复按
  `---` 分段解析成 1~N 个条目返回;单次上限 30 条;后端无状态,
  节点创建/连线由前端完成。
- 前端 `CanvasNodes.tsx`:提示词节点泛化为**数据节点**(阶段标签 + 可编辑
  标题/内容 + AI 派生/复制/回写看板);旧 prompt 类型节点加载时自动迁移。
  图片节点保留(参考图 + 半自动出图回传),API 生图降级为"变体"可选动作;
  图片改用 antd Image(点击可放大预览)。
- 前端 `Canvas.tsx`:新增「AI 派生」弹窗(员工/目标阶段/指令,员工选择记
  localStorage);「从看板导入」弹窗(项目 → 集数/阶段过滤 → 卡片按阶段
  分列铺进画布,单次上限 60 张);「回写看板」升级(任意阶段 + 集数,
  提示词阶段自动带 prompts 字段)。

**影响面**
- **接口**:新增 `/api/v1/agentapp/canvas/canvases/{cid}/derive`(写权限
  production:manage,同画布前缀);generate(T2I)/upload 接口保留不变。
- **数据**:画布节点 data 结构从 `{prompt,url}` 扩展为
  `{stage,title,content,url,prompt}`,旧数据自动迁移,无需手工处理。
- **验证**:真实跑通派生链路——分镜师员工把一条图片提示词拆成 3 个分镜
  节点,且自动引用了员工知识库中的角色固定描述词(R3苍霖/scene04),
  Art Bible 一致性词汇在派生中生效;看板导入 372 卡命中、过滤后 13 卡成列铺开。

---

## [2026-07-06] chore: 每日 git 自动备份到 auto-backup 分支

**动机**:工作树曾累积 183 个文件改动 4 天未提交,机器故障即全丢;
系统里没有任何自动同步 GitHub 的机制(DailyScheduler 只跑采集/学习)。

**变更点**
- 新增 `scripts/git_auto_backup.ps1`:用临时 index 把工作树完整快照
  (含未提交/未跟踪文件,遵循 .gitignore)提交到 `auto-backup` 分支并推送;
  不碰 master / 真实暂存区 / 进行中的工作;与上次备份无差异时跳过。
- 已实测:首次运行生成备份提交并推送 `origin/auto-backup` 成功。

**影响面**
- **远程新增分支** `auto-backup`(纯备份链,勿在其上开发;恢复文件用
  `git checkout auto-backup -- <路径>`)。
- **需手动注册一次**每日计划任务(管理员或本人终端执行):
  `schtasks /Create /F /SC DAILY /ST 21:30 /TN "agent-platform-git-backup" /TR "pwsh -NoProfile -File D:\P\agent\scripts\git_auto_backup.ps1"`
- 无代码行为 / 接口 / DB 变化。

---

## [2026-07-06] docs: 知识库体系——全量中文注释 + 模块索引 + 架构导览

**动机**：代码注释缺口大（451 处无 docstring），且没有"快速知道某模块干什么"的入口，
新人/未来的自己只能靠翻代码。本次建立四层文档体系。

**变更点**
- 全仓补齐中文 docstring：app/admin/evals/scripts 463 处（模块头/类/函数），
  web/src 45 个文件全部加中文头注释。AST 扫描缺失归零，118 tests 全绿（零行为变化）。
- 新增 `scripts/gen_module_index.py`：从 docstring 自动生成 `docs/MODULE_INDEX.md`
  （118 后端模块 + 45 前端文件的一句话职责索引），代码变了重跑即同步。
- 新增 `docs/ARCHITECTURE.md`（手写）：分层总览、5 条核心数据流
  （对话/异步任务/工作流/知识检索/记忆三层）、"想改 X 去哪个文件"速查表、文档四层约定。
- README 新增"文档导航"一节。

**影响面**：纯文档 + 一个生成脚本，无接口/行为变化。
维护约定：新增模块跑一次 `python -m scripts.gen_module_index`；
ARCHITECTURE.md 只在数据流/分层变化时手工更新。

---

## [2026-07-06] fix(M3): 知识文档向量化接线 + 首批 eval golden cases

**动机**：M3 交付时 `SemanticRetriever.index_document` / `remove_document` 写了但**没有任何调用方**——
即使配好 PG + DASHSCOPE_API_KEY，上传的知识文档也永远不会被向量化，语义检索恒空（退化关键词）。
本次把"入口"接上，语义检索链路才真正闭环。另补首批 eval golden cases（此前只有模板）。

**变更点**
- `app/api/registry.py`：
  - 上传知识文档成功后 `asyncio.create_task(_vectorize_doc(...))` 后台切片向量化
    （不阻塞上传响应；semantic_retriever 未启用或失败时静默跳过，fail-open）。
  - 删除知识文档时 `_drop_doc_vectors` 连带清掉该文档全部切片向量。
- 新增 3 个 eval golden case（`evals/cases/*.json`）：
  `prompt_engineer_basic` / `screenwriter_basic` / `qa_inspector_basic`——
  基于漫剧员工的保守确定性检查（min_length / contains / not_contains），
  `python -m evals.run_evals` 即可跑（需 LLM 供应商已配置）。
- 测试：`test_vector_store.py` 新增 4 用例（向量化调度 / 未启用空转 / 清向量 / 失败吞掉）。

**影响面**
- 接口行为：上传/删除知识文档的响应契约不变；仅在 `USE_DB_STORES=true` +
  `DASHSCOPE_API_KEY` 配置时新增后台向量化副作用。
- 无 DB schema / 配置项变化。全量测试 118 passed。

---

## [2026-07-03] feat: 自由画布(对标即梦智能画布的 MVP)

**动机**:制作看板是线性流水线,缺一个空间化、非线性的图像迭代工作区。
即梦智能画布(无限画布+局部重绘+扩图)是行业标配交互;本次先落 MVP:
无限画布 + 文生图 + 变体 + 上传参考图 + 出图回写看板,复用现有 ReactFlow。

**变更点**
- 新增 `app/api/canvas.py`:画布 CRUD(`/api/v1/agentapp/canvas/canvases*`)、
  `GET /image-models`(列启用供应商的模型,用户自选生图模型)、
  `POST /canvases/{cid}/generate`(文生图,走 ai_service 的 OpenAI 兼容
  images 接口,远端图片下载转存本地)、`POST /canvases/{cid}/upload`(传参考图)。
- 画布数据落盘 `data/canvas/{canvas_id}.json`;生成/上传的图片存
  `data/uploads/canvas/`,经 `/uploads` 静态挂载直出(`<img>` 无需带
  Authorization —— 刻意不放 `/api/*` 下,避开鉴权中间件)。
- `app/core/auth.py`:`_WRITE_PERMS` 增加 canvas 前缀 → `production:manage`。
- `app/main.py`:挂载 canvas router。
- 前端新增 `pages/Canvas.tsx` + `components/canvas/CanvasNodes.tsx`:
  提示词节点 → 生成 → 图片节点,连线记录血缘;变体/下载/发送到看板
  (回写为 img_gen 阶段卡片);节点改动 1.2s 防抖自动保存;
  模型与尺寸选择记在 localStorage。
- `App.tsx` 路由 `/canvas`;`Layout.tsx` 导航「自由画布」(perm production:manage)。

**影响面**
- **接口**:新增 `/api/v1/agentapp/canvas/*`(读=登录用户,写=production:manage)。
- **数据**:新目录 `data/canvas/`、`data/uploads/canvas/`。
- **依赖/配置**:无新增(httpx 已在 requirements)。生图必须先在
  AI 供应商里配好支持 OpenAI images 接口的模型(如方舟 seedream),
  在画布顶栏选择后才可用;未配置时生成返回明确错误,不影响其他功能。
- **暂不包含**:局部重绘/扩图/消除/放大/图生视频(下一迭代,依赖 inpaint 类 API)。

---

## [2026-07-02] P0 安全修复:用户端 API 强制鉴权 + 角色权限落地

**动机**:登录门禁此前只在前端路由(UserAuthGuard),后端 `/agent/run`、`/registry/*`
等全部裸奔——局域网内任何人可 curl 直调,烧 LLM 费用且可改数据;viewer/editor
角色权限在用户端完全未生效。

**变更点**
- 新增 `app/core/auth.py`:`UserAuthMiddleware`——保护 app 下所有 `/api/*`;
  豁免 `/auth/*` 与 OPTIONS;读(GET/HEAD)任何登录用户,写按前缀映射权限
  (registry→employee/team/tool、workflow、production+pipeline、ai-providers→settings、
  memory/scrape/skills/evolution/knowledge-graph/trend-sources→employee、默认 workbench:use);
  用户须存在且未禁用(禁用立即生效,不等 token 过期)。
- `app/core/settings.py` + `app/main.py`:开关 `USER_API_AUTH`(默认开)。
- 前端 `api.ts`:所有请求带 `Authorization: Bearer`;401 统一清 token 跳 `/login`。
- 前端 `userAuth.ts`:登录/校验后缓存 `permissions`;新增 `hasPerm()`。
- 前端 `Layout.tsx`:导航按权限显隐(空分组隐藏);侧栏新增退出登录。
- 测试:`test_user_api_auth.py`(7 用例);`conftest.app_client` 统一带管理员凭证。

**影响面**
- **接口**:app 服务全部 `/api/*` 未带凭证返回 401(信封格式);无权限写操作 403。
- **配置**:新增 `USER_API_AUTH`(默认 true)。
- **前端**:老 token 继续有效;权限列表登录后自动拉取。
- **注意**:`ADMIN_SECRET` 未配置时重启即随机——生产必须在 `.env` 固定,
  否则重启后全员被登出;app 与 admin 进程若各自随机,token 互不通用。
- 管理端(:8001)不受影响(原有 require_admin)。

---

## [2026-07-02] fix: 未构建前端时后端启动崩溃（CI 全红根因）

**动机**：`wwwroot/index.html` 已进版本库但 `wwwroot/assets/` 是构建产物（gitignore）。
克隆后未 `npm run build` 直接起后端（或 CI 跑测试）时，`StaticFiles(wwwroot/assets)`
构造即抛 `RuntimeError`，应用起不来——首轮 CI 因此 backend 全红。

**变更点**：`app/main.py` 挂载 `/assets` 前单独判断目录存在；SPA fallback 不受影响。

**影响面**：无接口/配置变化。CI backend job 恢复绿；新人克隆仓库可直接起后端。

---

## [2026-07-02] 修复 CLI 流水线页白屏 + 管理端根路径 404 + 补项目知识库文档

**动机**：用户反馈「CLI 流水线」页打不开、后台 :8001 报 404，并要求给制作项目补知识库文档。

**变更点**
- **修复 `web/src/pages/Pipeline.tsx` 白屏崩溃**：页面用裸 `fetch` 拉 `/api/v1/pipeline/*`，未带 `Authorization` 头。后端鉴权开启后返回 401 错误信封 `{code,message,data:null}`，被 `setCliStatus` 塞进 state，渲染时 `Object.entries(cliStatus.available)` 因 `available` 为 `undefined` 抛 TypeError 导致整页崩溃。修复：新增带 token 的 `authFetch`，6 处 fetch 全部改用；并对异常响应兜底（`r.ok ? r.json() : null` + `Array.isArray` 校验），避免错误对象污染 state。
- **修复管理端 `admin/main.py` 根路径 404**：`:8001` 是纯 API 服务，裸访问根路径 `/` 返回 404 令人困惑。新增 `GET /` 返回友好指引 JSON（说明后台界面在前端 `/admin` 路由、附文档/健康检查入口）。后台界面本身正常（前端 `/admin/login`，API 走 `/api/admin/*` 代理到 :8001）。
- **新增 `data/production/jiulu-s1/README.md`**：制作项目知识库总纲（命题/三幕/角色/场景/分集进度/资产索引/管线）。数据源自 `cards.json`+`project.json`+master packages。
- **删除两个废弃 story bible**：`story_bible_v2_龙棺.md`（《她死后，龙来了》龙棺重生复仇，主角沈昭）与 `story_bible_重绘.md`（《描红》世界重绘，主角昭）均为早期未采用的故事方向草案，与苍霖篇生产线不一致，易混淆，经用户确认后删除（已核对 `cards.json`/`project.json` 无悬空引用）。

**影响面**
- 前端：Pipeline 页恢复可用（此前任何已登录用户进入即白屏）。
- 后端：admin `:8001/` 由 404 变为 200 指引；无 API 行为变更。
- 数据：`data/` 属 gitignore，项目 README 跟随业务数据，不进版本库。

---

## [2026-07-02] 制作看板层级视图（剧 → 集 → 镜头 → 资源）

**动机**：原制作看板是平铺看板，372 张卡片混在一起，不直观。
用户需要按「剧 → 集 → 镜头 → 资源」的层级逐级下钻浏览。

**变更点**
- 新增 `web/src/pages/ProductionHub.tsx`：项目总览页，展示项目摘要、全局资产（按故事/角色/场景/设计分组）、剧集网格（含镜头数/进度/缩略图）。
- 新增 `web/src/pages/EpisodeDetail.tsx`：单集详情页，展示该集所有镜头卡片，点击任一镜头弹出 Drawer，按阶段 Tab 显示剧本/分镜/提示词/图片/视频等资源。
- 修改 `web/src/App.tsx`：新增路由 `/production/:pid`（层级总览）、`/production/:pid/ep/:ep`（集详情）、`/production/:pid/pipeline`（原看板）。
- 修改 `web/src/pages/Production.tsx`：项目列表卡片加「层级视图」按钮，跳转到 ProductionHub。

**影响面**
- 前端新增 2 个页面组件 + 3 条路由。
- 原 `/production` 看板不受影响，可通过 ProductionHub 的「管线视图」按钮回到看板。
- 无后端/API/数据库变更。

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
