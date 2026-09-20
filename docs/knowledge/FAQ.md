# 常见问题

## 用户端和管理端有什么区别？

用户端由 `app/main.py` 提供，默认 8000；管理端由 `admin/main.py` 提供，默认 8001。管理端使用 `/api/admin/*` 路由，生产时可由用户端 `/api/admin` 代理。两端共用签名密钥和用户存储；管理操作实时检查账号状态与 `system:admin`，不能以登录入口或 token 中的旧角色代替授权。

## Redis、arq 任务和其他后台任务有什么区别？

**Redis/arq Agent 任务**由 `app/api/tasks.py` 入队 `run_agent_task`，`app/tasks/worker.py` 消费；队列名是 arq 默认队列，API 侧 Redis 连接快速失败并有 30 秒熔断，worker 使用更宽松重试。它适合 Agent 长运行、任务中心查询、取消和重试。

**制作生产生成**在 `app/api/production.py` 的请求处理内调用 `run_invocation`/媒体生成并写入 `data/production/<pid>`；ZIP 导出响应使用 Starlette `BackgroundTask` 仅清理临时压缩文件；它不负责异步生成。画布流式任务使用进程内 `asyncio.create_task`，视频供应商任务则返回 running 状态并通过轮询同步。

**工作流引擎**由 `app/api/workflow.py` 调用 `app/services/workflow_executor.py`，按节点执行、全局/节点超时并把运行记录写入 `data/workflow-runs/`；工作流运行 API 不是自动进入 arq 队列。

## Redis 没启动会怎样？

调用 `/api/v1/agentapp/tasks` 入队或查询具体任务时会返回队列不可用（通常 503）；任务列表在可选能力降级路径可能返回空列表。启动 Redis 后等待熔断窗口结束再重试。API 与 worker 必须使用同一 Redis URL/队列名。

## 数据默认保存在哪里？

基础设施配置在 `app/core/settings.py`，业务配置在 `app/config.py`。默认 `USE_DB_STORES=false`：会话、Agent 运行记录、长期记忆写 JSON，知识检索使用关键词；开启后仅这些运行态和向量检索切到 PostgreSQL/pgvector。注册表、工作流、制作项目、采集历史等仍写 JSON。

## 新增后端 API 要改哪些地方？

在相应 `app/api/` 或 `admin/api/` 添加路由，确认入口挂载、鉴权/限流依赖、前端 client 和测试同步；行为变化更新 CHANGELOG 与知识库。

## 前端接口在哪里维护？

用户端在 `web/src/api.ts`，管理端在 `web/src/adminApi.ts`；页面在 `web/src/pages/`，组件在 `web/src/components/`。技术栈以 `web/package.json` 为准（React、react-router-dom、antd、Vite）。

## 数据库迁移失败怎么办？

确认 `DATABASE_URL`、PostgreSQL 可达和 Alembic 当前版本；先备份，再执行迁移。不要手工删表；生产回滚优先恢复应用版本，只有确认迁移可逆且有备份才 downgrade。

## 哪些文件不应提交？

`.gitignore` 明确忽略 `.env`、`.venv/`、`__pycache__/`、日志、`.tmp/`、私密数据和 `.codegraph/`。运行数据、备份、构建产物和 `wwwroot/assets/` 是否提交取决于当前仓库跟踪策略；用 `git status --short` 与 `git ls-files` 核对，不在知识库中一概判定。

## 如何定位一个功能？

先用 `docs/knowledge/INDEX.md` 找领域，再用 CodeGraph 查符号关系；文字常量和日志用 `rg`。沿入口 → router → service/runtime → store/任务 → 测试逐层跟踪。



## 现在有哪些功能？

直接查 [FEATURES.md](FEATURES.md)，按制作业务、数字员工、学习知识和后台管理定位。需要操作步骤再查 [系统使用手册](../USER_GUIDE.md)；只有文档存在歧义或过期时，才定点核对对应页面和 API。不要把文件存在、后端支持或上游桌面功能等同于主站已经完整开放。

## 项目知识库和员工知识库是一回事吗？

不是。`docs/knowledge` 是维护者和产品问答使用的项目资料；员工知识库是上传给具体数字员工、在运行时检索的业务素材；长期记忆保存员工的事实、经验和行为规则；站内使用手册负责教创作者操作；系统管家结合页面上下文和本地手册解释功能。把工程文档写进仓库，不会自动变成每个员工都能检索到的业务知识。
