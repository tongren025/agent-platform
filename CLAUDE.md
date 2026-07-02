# CLAUDE.md — agent-platform 项目指令

本文件为在本仓库(`agent-platform`,数字员工/漫剧生产平台)工作的所有人
与 AI 会话提供硬性约定。进版本库、团队共享,不依赖任何人的记性。

## 文档同步硬规则(每次改代码必须执行,不可跳过)

任何**功能性代码改动**在提交前,必须同步更新对应文档。三者按改动性质取用:

1. **`docs/CHANGELOG.md`** —— 只要动了行为/接口/架构/依赖/部署,就追加一条。
   格式:`## [日期] 标题` + 变更点 + 影响面(改了哪些 API/表/配置)。**每次必写。**
2. **`README.md`** —— 当改动影响"怎么跑起来/整体架构/环境变量/端口"时更新,
   使 README 永远反映**当前真实状态**(不是历史)。
3. **模块内文档/docstring** —— 新增服务、表、公共函数,写清用途和接入点。

判定标准:**"三个月后新人只看文档能不能接手这块?"** 不能 → 文档没写够。

- 纯格式化、注释、变量重命名等**无行为变化**的改动,可不写 CHANGELOG。
- 提交信息(commit message)不算文档 —— 它会淹没在 git log 里,不可替代上述三处。
- 复盘时如果发现某次改动漏了文档,先补文档再继续新功能。

## 架构速览(详见 README.md)

- 用户端 API:`app/`(FastAPI,:8000)—— 业务主服务
- 管理端 API:`admin/`(FastAPI,:8001)—— 用户/角色/供应商治理,独立进程独立鉴权
- 前端:`web/`(React + Vite + antd),构建产物由 app 的 SPA fallback 提供
- 基础设施层:`app/core/`(配置/日志/中间件/异常/DB/可观测)
- 数据层:`app/models/db/`(ORM)+ `app/repositories/`(仓储)+ `migrations/`(Alembic)
- 编排:`docker-compose.yml`(PostgreSQL+pgvector / Redis / app / admin / Prometheus / Grafana)

## 生产化里程碑(进度见 docs/CHANGELOG.md)

M0 工程地基 ✅ · M1 数据层→PostgreSQL ✅ · M2 LLM 调用治理 · M3 RAG 向量化 ·
M4 异步任务队列 · M5 鉴权/限流/配额 · M6 可观测性闭环。**不做多租户。**

## 约定

- 注释用中文,标识符(类/方法/变量)用英文。
- 密钥只进 `.env`(不进版本库),样例见 `.env.example`。
- 数据层用同步 SQLAlchemy(现有 API 多为同步 def);队列/embedding 才用 async。
