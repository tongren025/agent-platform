# API 参考与业务接入手册

> 本文件由 `scripts/generate_api_reference.py` 生成。固定章节描述鉴权、错误、业务流程和部署约定；末尾路由清单来自当前 FastAPI 注册表。
> 接口版本以代码和 OpenAPI 为准。服务启动后可打开 `/docs`、`/redoc` 或下载 `/openapi.json`。

## 1. 服务边界

| 服务 | 默认地址 | 作用 | 鉴权 |
|---|---|---|---|
| 用户端 app | `http://127.0.0.1:8000` | 项目、生产看板、画布、员工、工作流和任务 | `Authorization: Bearer <user-token>` |
| 管理端 admin | `http://127.0.0.1:8001` | 管理员登录、用户/角色、供应商和系统概览 | 独立 admin token |
| 同源管理代理 | 用户端 `/api/admin/*` | 将浏览器管理请求转发到 admin 服务 | 代理保留请求头和正文 |

用户端 `/api/*` 默认受鉴权中间件保护；登录、健康检查、OPTIONS 和生产素材 GET 按代码配置豁免。管理端 token 不能用于用户端 API，用户 token 也不能替代管理端权限。

## 2. 最小调用流程

### 用户端

```http
POST /api/v1/agentapp/auth/login
Content-Type: application/json

{"username":"alice","password":"***"}

GET /api/v1/agentapp/production/projects
Authorization: Bearer <token>
```

登录返回的 token 只放在内存或受控存储中；所有后续请求都使用 `Authorization`。401 时重新登录，403 表示账号有 token 但没有所需权限或不是项目成员。

### 管理端

```http
POST /api/admin/auth/login
Content-Type: application/json

{"username":"admin","password":"***"}

GET /api/admin/system/overview
Authorization: Bearer <admin-token>
```

生产前端优先请求同源 `/api/admin/*`，由 app 的管理代理转发；开发调试可以直接访问 :8001。代理按原 HTTP 方法、查询串、请求体和非 hop-by-hop 请求头转发。

## 3. 业务闭环

### 短片/短剧制作

1. `POST /api/v1/agentapp/production/projects` 创建项目，写入交付目标、团队和项目成员。
2. `POST /projects/{pid}/generate` 按阶段生成剧本、人物/场景、分镜、图片提示词和视频提示词卡片。每张卡保留 episode、shot、版本、依赖和真实资产引用。
3. 图片/视频生成任务必须保存真实 job 或资源地址；提示词、计划和模型回复不能伪装成媒体成品。
4. 图片和视频验收接口写入候选版本、评审历史和当前采用版本。质量门禁未通过时不能直接把卡片标为 `done`。
5. 只有通过逐镜审核且满足完整性门禁的卡片才能进入最终成片/合成阶段；失败返回 409，并在卡片 metadata 中保留返工原因。

批量卡片接口没有 `pid` 路径：服务端会按 `card_id` 找到每个所属项目并逐项目校验成员权限。未知卡片保持静默跳过，已知但无权访问的项目返回 403。

### 画布工作台

画布项目、节点、素材上传和视频任务位于 `/api/v1/agentapp/canvas`。`POST /workbench/tasks` 返回异步任务；轮询 `/workbench/tasks/{task_id}` 时，已不存在的上游任务返回 404，供应商不可用返回 502。素材索引查询必须带 `project_id`。

### 工作流与任务

工作流定义与运行位于 `/api/v1/agentapp/workflow`，Redis 队列位于 `/api/v1/agentapp/tasks`。Redis 不可用时任务列表可以返回空列表，但具体 job 状态会返回 503；这表示基础设施缺失，不代表任务完成。

## 4. 请求和响应约定

- JSON 业务接口通常返回 `{"code":200,"data":...}`；`/api/v1/pipeline` 保留流水线自身的原始响应合同。
- 校验失败返回 422，资源不存在返回 404，登录失效返回 401，权限/成员隔离失败返回 403，质量门禁或状态冲突返回 409。
- 上游 AI、媒体或独立 admin 服务不可达返回 502；Redis 等任务基础设施不可用返回 503。客户端应展示可重试状态，不要把错误响应写入成品资产。
- 上传接口使用 `multipart/form-data`；浏览器让 `fetch` 自动生成 boundary，不要手工设置 `Content-Type: application/json`。
- `/skills/list`、画布素材查询等接口的必填 query 参数以 OpenAPI 为准；缺少参数是 422，不是服务崩溃。

## 5. 配置和启动

```powershell
# 用户端
uvicorn app.main:app --host 0.0.0.0 --port 8000
# 管理端（独立进程）
uvicorn admin.main:app --host 0.0.0.0 --port 8001
# 前端开发
cd web; npm run dev
```

`ADMIN_API_URL` 是用户端同源管理代理的目标（本仓 Compose 默认 `http://admin:8001`）；`Agent.AdminApiBaseUrl` 是外部充值策略 admin API（默认 :5040），两者不是同一个服务。策略代理依赖外部服务时，上传/解析查询的 502 表示该外部服务未配置或不可达。

`USE_DB_STORES=true` 需要 PostgreSQL；任务执行需要 Redis；没有 DashScope embedding key 时语义检索降级为关键词检索，不影响服务启动。供应商密钥只通过管理端加密存储或环境变量注入。

## 6. 故障排查顺序

1. `GET /healthcheck` 确认 app 存活，管理端再检查 `GET :8001/healthcheck`。
2. 401：重新登录并确认 token 的服务边界；403：确认账号权限和项目成员列表。
3. 422：对照 `/openapi.json` 检查字段名、别名、上传格式和必填 query。
4. 409：查看卡片 metadata 的 review/candidate 记录，先完成质量验收或回到返工阶段。
5. 502：检查 admin、AI/媒体供应商和策略外部服务地址；502 不应通过重试无限循环。
6. 503：检查 Redis/PostgreSQL；任务详情在 Redis 恢复前不可判定为完成。

## 7. 自动校验

```powershell
$env:TEMP='D:\P\agent\qa_tmp'; $env:TMP='D:\P\agent\qa_tmp'
python -m pytest -q
cd web; npm exec tsc -- --noEmit; npm run build
cd ..; python scripts/generate_api_reference.py --check
```

当前注册路由：用户端 11 条方法，管理端 11 条方法。

## 8. 用户端完整路由清单

| Method | Path | Handler | Description |
|---|---|---|---|
| `GET` | `/docs` | `swagger_ui_html` |  |
| `HEAD` | `/docs` | `swagger_ui_html` |  |
| `GET` | `/docs/oauth2-redirect` | `swagger_ui_redirect` |  |
| `HEAD` | `/docs/oauth2-redirect` | `swagger_ui_redirect` |  |
| `GET` | `/healthcheck` | `healthcheck` | 存活探针——供负载均衡 / docker-compose healthcheck 使用，不做依赖检查。 |
| `GET` | `/metrics` | `metrics` | Endpoint that serves Prometheus metrics. |
| `GET` | `/openapi.json` | `openapi` |  |
| `HEAD` | `/openapi.json` | `openapi` |  |
| `GET` | `/redoc` | `redoc_html` |  |
| `HEAD` | `/redoc` | `redoc_html` |  |
| `GET` | `/{full_path:path}` | `spa_fallback` | SPA 兜底路由：命中静态文件则直接返回，否则回退到 index.html 交给前端路由。 |

## 9. 管理端完整路由清单

| Method | Path | Handler | Description |
|---|---|---|---|
| `GET` | `/` | `root` | GET /：友好指引——管理端是纯 API，控制台界面在前端 /admin 路由。 |
| `GET` | `/docs` | `swagger_ui_html` |  |
| `HEAD` | `/docs` | `swagger_ui_html` |  |
| `GET` | `/docs/oauth2-redirect` | `swagger_ui_redirect` |  |
| `HEAD` | `/docs/oauth2-redirect` | `swagger_ui_redirect` |  |
| `GET` | `/healthcheck` | `healthcheck` | 存活探针，供容器健康检查。 |
| `GET` | `/metrics` | `metrics` | Endpoint that serves Prometheus metrics. |
| `GET` | `/openapi.json` | `openapi` |  |
| `HEAD` | `/openapi.json` | `openapi` |  |
| `GET` | `/redoc` | `redoc_html` |  |
| `HEAD` | `/redoc` | `redoc_html` |  |
