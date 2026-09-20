# API 参考与业务接入手册

> 本文件由 `scripts/generate_api_reference.py` 生成。接口清单、参数和模型字段来自两个服务的 `app.openapi()`；固定章节说明代码中的鉴权和业务约定。
> 清单覆盖 OpenAPI 已公开的方法，不包含 `include_in_schema=False` 的隐藏端点、静态文件挂载及框架自动提供的文档页，也不代表已对每个接口完成运行验收。服务启动后可访问 `/docs`、`/redoc` 和 `/openapi.json`。

## 1. 服务边界与鉴权

| 服务 | 默认地址 | 作用 | 鉴权 |
|---|---|---|---|
| 用户端 app | `http://127.0.0.1:8000` | 项目、生产看板、画布、员工、工作流和任务 | Bearer token，账号状态、写操作权限及项目成员校验 |
| 管理端 admin | `http://127.0.0.1:8001` | 用户、角色、供应商和系统概览 | Bearer token，受保护管理接口校验当前 `system:admin` 权限 |
| 同源管理代理 | 用户端 `/api/admin/*` | 将浏览器管理请求转发到 admin 服务 | 由目标管理服务校验，代理保留认证头 |

两个登录入口共用用户存储、`admin.auth` 的 HMAC token 签发/校验及 `ADMIN_SECRET`。部署使用相同密钥和用户数据时，token 可跨两个服务验证；能否执行操作取决于当前账号状态和权限，不能用“从哪个入口登录”代替权限判断。管理鉴权会实时检查账号存在且启用，管理操作按当前 `system:admin` 权限放行，token 中历史 `role` 不作为最终授权依据。

用户端默认开启 `USER_API_AUTH`：`/api/*` 需要 Bearer token，写操作按路径前缀映射权限；生产项目相关接口还会校验成员，管理员按实现豁免成员限制。`/api/v1/agentapp/auth/*` 自行校验登录或 token，`/api/admin/*` 转交管理服务，OPTIONS 预检、非 API 静态路径以及生产素材 `/resource/*` 的 GET/HEAD 不经过用户鉴权中间件。全局中间件的认证要求不会自动出现在每行 OpenAPI 参数中。

生产环境必须配置 `ADMIN_SECRET` 和安全的管理员初始口令；未配置密钥时仅开发环境允许使用固定开发密钥。两个进程应读取一致的配置。

## 2. 最小调用流程

### 用户端

```http
POST /api/v1/agentapp/auth/login
Content-Type: application/json

{"username":"alice","password":"***"}

GET /api/v1/agentapp/production/projects
Authorization: Bearer <data.token>
```

登录成功返回 `{"code":200,"data":{"token":"...","username":"...","displayName":"...","role":"..."}}`。后续业务请求使用 `Authorization: Bearer <token>`；`GET /api/v1/agentapp/auth/me` 返回当前身份和权限。兼容接口 `GET /api/v1/agentapp/auth/check` 接收 query 参数 `token`；新接入优先使用 `/me`，避免凭证进入 URL 日志。

### 管理端

```http
POST /api/admin/auth/login
Content-Type: application/json

{"username":"admin","password":"***"}

GET /api/admin/system/overview
Authorization: Bearer <data.token>
```

浏览器生产入口使用同源 `/api/admin/*`；开发调试可以直接访问 :8001。代理转发 HTTP 方法、查询串、请求体和非 hop-by-hop 请求头。登录成功不表示获得管理权限，受保护管理接口仍会重新授权。

## 3. 制作流程与真实交付状态

### 生产看板与导演工作台

下列 `/production` 和 `/director` 均指完整前缀 `/api/v1/agentapp/production`、`/api/v1/agentapp/director`。

1. `POST /production/projects` 创建项目；`POST /production/projects/{pid}/generate` 按 `target_stage`、员工及上下文生成阶段卡片。生成文本、提示词或卡片不等于生成图片和视频。
2. 调用具体生图或视频任务接口，读取返回的实际资源 URL、job 和状态；只有真实媒体结果才能进入素材验收。
3. 图片通过 `/production/projects/{pid}/cards/{card_id}/review` 记录评审，再通过 `/image-candidates/activate` 采用候选。视频对应 `/video-review` 和 `/video-candidates/activate`。具体完整路径与请求字段见接口清单。
4. 标记卡片 `done` 时，会阻止当前已登记、要求精品评审但尚未获准的媒体直接完成；该检查不等于所有手动卡片都做过质量检测。候选采用接口另外校验评审及精品分数。
5. `GET /director/projects/{project_id}` 查看镜头与成片状态。`POST /director/projects/{project_id}/compose` 使用就绪的镜头视频生成整片候选：镜头不齐或已过期时可返回 400；合成期间源镜头改变返回 409；合成服务异常返回 502。成功后 final 卡进入 `review`，仍需整片验收和采用。不要只凭 HTTP 200 或存在 final 卡判定可交付。

批量卡片接口按 `card_id` 找到项目并逐项校验成员权限；未知卡片静默跳过，已知但无权访问的项目返回 403。质量失败是否留下评审记录取决于调用的评审接口；普通请求被拒绝不保证自动写入返工记录。

### 画布工作台

画布接口前缀为 `/api/v1/agentapp/canvas`。`POST /workbench/tasks` 的文本和图片分支等待结果后返回，视频分支提交上游任务；应依据返回的 `status` 和素材字段继续处理。视频通过 `GET /workbench/tasks/{task_id}` 轮询，已不存在的上游任务返回 404，上游错误通常返回 502。`GET /workbench/assets` 必须带 `project_id`。

### 工作流、队列与 CLI 流水线

- `/api/v1/agentapp/workflow` 管理工作流定义及运行；`/api/v1/agentapp/tasks` 提供 Redis 异步任务。队列不可用时任务列表降级为空列表，入队及具体任务查询返回 503；空列表不能用作“任务已完成”的证据。
- `POST /api/v1/pipeline/run` 等待本地 CLI 流水线执行结束再返回，不是 Redis 入队。没有可用 CLI 时返回 503。该流水线的 `finalFile` 与 `GET /api/v1/pipeline/runs/{run_id}/final` 指 Markdown 合并文档，不是商业成片视频。

## 4. 请求和响应约定

- 多数业务成功响应使用 `{"code":200,"data":...}`。CLI pipeline 的成功响应直接返回对象或列表；媒体下载、健康探针、流式接口及代理响应也不能一律按该信封解析。
- 全局 HTTP 异常和参数校验失败使用 `{"code":<HTTP状态>,"message":"...","data":...,"requestId":"..."}`；`requestId` 在请求上下文可用时出现。422 的 `data` 包含字段错误数组。中间件错误可能不带 `requestId`，代理响应由上游定义。
- OpenAPI 自动生成的 `HTTPValidationError` 描述的是框架默认结构，尚未完整表达上述自定义错误信封；调用方以本节说明及实际响应为准。未声明响应模型的端点也不代表没有响应数据。
- 400 表示业务输入或前置条件不满足；401 表示凭证或账号状态无效；403 表示权限或成员检查失败；404 表示资源不存在；409 表示评审门禁或并发状态冲突；422 表示参数结构不匹配。具体接口可能只使用其中一部分。
- 部分上游调用将故障映射为 502，任务队列或 CLI 不可用使用 503。错误码的完整范围仍取决于具体端点，不能假设所有供应商或数据库故障都已统一映射。
- 上传接口按请求体栏使用 `multipart/form-data`；浏览器传入 `FormData` 时让 `fetch` 自动生成 boundary。请求体标为 `application/json` 的接口才发送 JSON。
- 参数栏保留请求的别名、位置、必填性、类型和约束。模型字段“可选”表示允许省略；只有类型包含 `null` 才声明可显式传 `null`。默认值未列出不代表没有服务端默认工厂。
- `GET /api/v1/agentapp/skills/list` 需要 `query`；画布素材索引需要 `project_id`。缺少必填参数返回 422。

## 5. 配置和启动

```powershell
# 在仓库根目录启动用户端
uvicorn app.main:app --host 0.0.0.0 --port 8000
# 在另一个终端启动管理端
uvicorn admin.main:app --host 0.0.0.0 --port 8001
# 在 web 目录启动前端开发服务
npm run dev
```

`ADMIN_API_URL` 控制同源管理代理目标（Compose 默认 `http://admin:8001`）；`Agent.AdminApiBaseUrl` 配置的是外部充值策略 API（开发配置为 :5040），不是本仓库管理服务。策略上传/查询依赖该外部系统，不能仅启动 :8001 就认为该能力可用。

`USE_DB_STORES=true` 需要 PostgreSQL；异步任务还需要 Redis 和 worker。供应商密钥应通过加密配置或环境变量提供。详细部署参数以 `README.md`、`.env.example` 和对应配置模块为准。

## 6. 排错与同步校验

先检查两个服务的 `GET /healthcheck`。它们只表示进程存活，不证明 Redis、数据库或供应商可用。401 检查 token、共享密钥与账号状态；403 检查当前权限及项目成员；422 对照下表的请求别名和必填参数；400/409 按响应说明修正前置素材、评审或并发状态；上游错误使用 `requestId` 联查服务日志。

```powershell
# 在仓库根目录执行
python scripts/generate_api_reference.py
python scripts/generate_api_reference.py --check
python -m pytest -q tests/test_api_reference.py
```

`--check` 会在文件缺失或内容过时时返回非零并给出修复命令，不会修改文件。生成过程只校验文档与当前 OpenAPI 是否同步，不访问上游服务或验证实际媒体效果。接口、请求模型或固定接入说明改变后应重新生成并提交文档。

当前 OpenAPI 公开方法：用户端 257 条，管理端 19 条。

## 7. 用户端接口清单

| 方法 | 路径 | operationId | 用途 | 参数 | 请求体 |
|---|---|---|---|---|---|
| `DELETE` | `/api/admin/{path}` | `proxy_admin_delete` | 转发管理端 DELETE 请求。 | path path：string，必填 | — |
| `GET` | `/api/admin/{path}` | `proxy_admin_get` | 转发管理端 GET 请求。 | path path：string，必填 | — |
| `HEAD` | `/api/admin/{path}` | `proxy_admin_head` | 转发管理端 HEAD 请求。 | path path：string，必填 | — |
| `OPTIONS` | `/api/admin/{path}` | `proxy_admin_options` | 转发管理端 OPTIONS 请求。 | path path：string，必填 | — |
| `PATCH` | `/api/admin/{path}` | `proxy_admin_patch` | 转发管理端 PATCH 请求。 | path path：string，必填 | — |
| `POST` | `/api/admin/{path}` | `proxy_admin_post` | 转发管理端 POST 请求。 | path path：string，必填 | — |
| `PUT` | `/api/admin/{path}` | `proxy_admin_put` | 转发管理端 PUT 请求。 | path path：string，必填 | — |
| `GET` | `/api/v1/agentapp/agent/ai-providers` | `list_ai_providers_api_v1_agentapp_agent_ai_providers_get` | GET /ai-providers：列出全部供应商（含配置文件内置与用户自管），apiKey 脱敏返回，managed 标记是否可编辑。 | — | — |
| `POST` | `/api/v1/agentapp/agent/ai-providers` | `save_ai_provider_api_v1_agentapp_agent_ai_providers_post` | POST /ai-providers：新建（或按名称覆盖）一个用户自管供应商；名称非法返 400。 | — | application/json：AiProviderBody，必填 |
| `DELETE` | `/api/v1/agentapp/agent/ai-providers/{name}` | `delete_ai_provider_api_v1_agentapp_agent_ai_providers__name__delete` | DELETE /ai-providers/{name}：删除用户自管供应商；名称非法返 400，不存在返 404。 | path name：string，必填 | — |
| `GET` | `/api/v1/agentapp/agent/ai-providers/{name}` | `get_ai_provider_api_v1_agentapp_agent_ai_providers__name__get` | GET /ai-providers/{name}：返回单个供应商详情；API Key 只返回掩码，名称非法返 400。 | path name：string，必填 | — |
| `PUT` | `/api/v1/agentapp/agent/ai-providers/{name}` | `update_ai_provider_api_v1_agentapp_agent_ai_providers__name__put` | PUT /ai-providers/{name}：更新供应商配置；apiKey 传空表示沿用旧值；名称非法返 400。 | path name：string，必填 | application/json：AiProviderBody，必填 |
| `POST` | `/api/v1/agentapp/agent/ai-providers/{name}/models` | `add_ai_provider_model_api_v1_agentapp_agent_ai_providers__name__models_post` | POST /ai-providers/{name}/models：把一个模型追加到供应商配置，已存在则更新名称/超时。 | path name：string，必填 | application/json：ProviderModelBody，必填 |
| `POST` | `/api/v1/agentapp/agent/ai-providers/{name}/models/sync-gpt` | `sync_ai_provider_gpt_models_api_v1_agentapp_agent_ai_providers__name__models_sync_gpt_post` | 从供应商 /models 同步当前 Key 可用的通用 GPT 文字/视觉模型。 | path name：string，必填 | — |
| `POST` | `/api/v1/agentapp/agent/ai-providers/{name}/test` | `test_ai_provider_api_v1_agentapp_agent_ai_providers__name__test_post` | POST /ai-providers/{name}/test：用首个模型发一条测试消息验证连通性；结果放在 success 字段而非 HTTP 状态码。 | path name：string，必填 | — |
| `GET` | `/api/v1/agentapp/agent/employees` | `list_agent_employees_api_v1_agentapp_agent_employees_get` | GET /employees：返回全部数字员工列表，附带计算出的标签与简介（computedTags/computedDescription）。 | — | — |
| `GET` | `/api/v1/agentapp/agent/openrouter/models` | `list_openrouter_models_api_v1_agentapp_agent_openrouter_models_get` | 实时拉取完整模型目录，并清理本地已加入但已从 OpenRouter 下线的模型。 | — | — |
| `GET` | `/api/v1/agentapp/agent/quota/{employee_key}` | `get_quota_api_v1_agentapp_agent_quota__employee_key__get` | GET /quota/{employee_key}：查该员工本月 token 用量与配额。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/agent/run` | `run_agent_endpoint_api_v1_agentapp_agent_run_post` | POST /run：执行可取消的同步运行；客户端可预生成 runId 并从另一请求停止。 | — | application/json：AgentRunRequest，必填 |
| `POST` | `/api/v1/agentapp/agent/run-stream` | `run_agent_stream_endpoint_api_v1_agentapp_agent_run_stream_post` | POST /run-stream：逐字返回模型内容，末尾发送完整 AgentRunResponse。 | — | application/json：AgentRunRequest，必填 |
| `GET` | `/api/v1/agentapp/agent/runs` | `list_runs_api_v1_agentapp_agent_runs_get` | GET /runs：按员工/会话/成功与否过滤，列出运行记录（最多 limit 条）。 | query employeeKey：string 或 null，可选<br>query sessionId：string 或 null，可选<br>query success：boolean 或 null，可选<br>query limit：integer，可选；默认值：50 | — |
| `GET` | `/api/v1/agentapp/agent/runs/{run_id}` | `get_run_api_v1_agentapp_agent_runs__run_id__get` | GET /runs/{run_id}：查单条运行记录，不存在返回 404。 | path run_id：string，必填；pattern="^run_[A-Za-z0-9_-]{1,64}$" | — |
| `POST` | `/api/v1/agentapp/agent/runs/{run_id}/cancel` | `cancel_run_api_v1_agentapp_agent_runs__run_id__cancel_post` | POST /runs/{id}/cancel：向当前进程内的运行发布幂等取消信号。 | path run_id：string，必填；pattern="^run_[A-Za-z0-9_-]{1,64}$" | — |
| `GET` | `/api/v1/agentapp/agent/sessions` | `list_sessions_api_v1_agentapp_agent_sessions_get` | GET /sessions：按员工/团队/目标类型过滤列出会话，默认排除已归档，取最近 limit 条。 | query employeeKey：string 或 null，可选<br>query teamCode：string 或 null，可选<br>query targetType：string 或 null，可选<br>query includeArchived：boolean，可选；默认值：false<br>query limit：integer，可选；默认值：20 | — |
| `DELETE` | `/api/v1/agentapp/agent/sessions/{session_id}` | `delete_session_api_v1_agentapp_agent_sessions__session_id__delete` | DELETE /sessions/{id}：删除会话，不存在返 404。 | path session_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/agent/sessions/{session_id}` | `get_session_api_v1_agentapp_agent_sessions__session_id__get` | GET /sessions/{id}：查单个会话详情，不存在返 404。 | path session_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/agent/sessions/{session_id}/archive` | `archive_session_api_v1_agentapp_agent_sessions__session_id__archive_post` | POST /sessions/{id}/archive：归档或取消归档一个会话。 | path session_id：string，必填 | application/json：ArchiveSessionBody，必填 |
| `GET` | `/api/v1/agentapp/agent/sessions/{session_id}/workspace` | `get_session_workspace_api_v1_agentapp_agent_sessions__session_id__workspace_get` | GET /sessions/{id}/workspace：返回 DeepAgent 待办与文件索引，不内联正文。 | path session_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/agent/sessions/{session_id}/workspace/file` | `get_session_workspace_file_api_v1_agentapp_agent_sessions__session_id__workspace_file_get` | GET /sessions/{id}/workspace/file：按虚拟路径读取一个文件正文。 | path session_id：string，必填<br>query path：string，必填；minLength=1 | — |
| `GET` | `/api/v1/agentapp/agent/system-info` | `get_system_info_api_v1_agentapp_agent_system_info_get` | GET /system-info：返回运行环境与 agent 关键开关（版本、端口、供应商/模型数量、委派/Shell/知识库配置等）。 | — | — |
| `POST` | `/api/v1/agentapp/agent/team-run` | `run_team_endpoint_api_v1_agentapp_agent_team_run_post` | POST /team-run：以团队 leader 身份执行一次团队对话（复用 /run），并把会话标记为 team 类型；参数缺失返 400。 | — | application/json：TeamRunBody，必填 |
| `POST` | `/api/v1/agentapp/agent/team-run-stream` | `run_team_stream_endpoint_api_v1_agentapp_agent_team_run_stream_post` | POST /team-run-stream：团队负责人流式回复并保留团队会话标记。 | — | application/json：TeamRunBody，必填 |
| `POST` | `/api/v1/agentapp/agent/upload` | `upload_file_api_v1_agentapp_agent_upload_post` | POST /upload：上传聊天附件（≤10MB），保存到 data/uploads 并返回文件元信息；文本类文件顺带返回前 20000 字符内容，超限返 413。 | — | multipart/form-data：Body_upload_file_api_v1_agentapp_agent_upload_post，必填 |
| `GET` | `/api/v1/agentapp/auth/check` | `check_token_api_v1_agentapp_auth_check_get` | 兼容旧客户端的 query token 校验；返回实时角色，浏览器新代码优先使用 /me。 | query token：string，可选；默认值："" | — |
| `POST` | `/api/v1/agentapp/auth/login` | `login_api_v1_agentapp_auth_login_post` | POST /login：校验账号密码，成功则签发 token 并返回用户名/显示名/角色。 | — | application/json：LoginRequest，必填 |
| `GET` | `/api/v1/agentapp/auth/me` | `me_api_v1_agentapp_auth_me_get` | GET /me：校验 Bearer token 与账号当前状态，返回实时身份和权限。 | header authorization：string，可选；默认值："" | — |
| `GET` | `/api/v1/agentapp/canvas/canvases` | `list_canvases_api_v1_agentapp_canvas_canvases_get` | 列出全部画布(仅摘要,不含节点)。 | — | — |
| `POST` | `/api/v1/agentapp/canvas/canvases` | `create_canvas_api_v1_agentapp_canvas_canvases_post` | POST /canvases：创建空画布并返回完整文档。 | — | application/json：CreateCanvasReq，必填 |
| `DELETE` | `/api/v1/agentapp/canvas/canvases/{cid}` | `delete_canvas_api_v1_agentapp_canvas_canvases__cid__delete` | DELETE /canvases/{cid}：删除画布文件，不存在返 404。 | path cid：string，必填 | — |
| `GET` | `/api/v1/agentapp/canvas/canvases/{cid}` | `get_canvas_api_v1_agentapp_canvas_canvases__cid__get` | GET /canvases/{cid}：读画布完整文档，不存在返 404。 | path cid：string，必填 | — |
| `PATCH` | `/api/v1/agentapp/canvas/canvases/{cid}` | `rename_canvas_api_v1_agentapp_canvas_canvases__cid__patch` | PATCH /canvases/{cid}：仅重命名画布。 | path cid：string，必填 | application/json：RenameCanvasReq，必填 |
| `PUT` | `/api/v1/agentapp/canvas/canvases/{cid}` | `save_canvas_api_v1_agentapp_canvas_canvases__cid__put` | PUT /canvases/{cid}：整体保存画布（节点/连线全量覆盖）。 | path cid：string，必填 | application/json：SaveCanvasReq，必填 |
| `POST` | `/api/v1/agentapp/canvas/canvases/{cid}/derive` | `derive_api_v1_agentapp_canvas_canvases__cid__derive_post` | POST /canvases/{cid}/derive:画布 AI 派生。 | path cid：string，必填 | application/json：DeriveReq，必填 |
| `POST` | `/api/v1/agentapp/canvas/canvases/{cid}/duplicate` | `duplicate_canvas_api_v1_agentapp_canvas_canvases__cid__duplicate_post` | POST /canvases/{cid}/duplicate：复制画布(含全部节点/连线)。 | path cid：string，必填 | — |
| `POST` | `/api/v1/agentapp/canvas/canvases/{cid}/generate` | `generate_image_api_v1_agentapp_canvas_canvases__cid__generate_post` | 文生图:调 OpenAI 兼容 images 接口,图片落地本地后返回 URL。 | path cid：string，必填 | application/json：app__api__canvas__GenerateReq，必填 |
| `POST` | `/api/v1/agentapp/canvas/canvases/{cid}/upload` | `upload_asset_api_v1_agentapp_canvas_canvases__cid__upload_post` | 把本地图片拖上画布:落盘 uploads/canvas 并返回静态 URL。 | path cid：string，必填 | multipart/form-data：Body_upload_asset_api_v1_agentapp_canvas_canvases__cid__upload_post，必填 |
| `GET` | `/api/v1/agentapp/canvas/engines/{engine}` | `get_canvas_engine_api_v1_agentapp_canvas_engines__engine__get` | 读取 Excalidraw/Fabric/Rete 等引擎的原生 JSON；首次访问返回空文档。 | path engine：string，必填 | — |
| `PUT` | `/api/v1/agentapp/canvas/engines/{engine}` | `save_canvas_engine_api_v1_agentapp_canvas_engines__engine__put` | 整体保存第三方画布引擎文档。 | path engine：string，必填 | application/json：SaveCanvasEngineReq，必填 |
| `GET` | `/api/v1/agentapp/canvas/image-models` | `list_image_models_api_v1_agentapp_canvas_image_models_get` | 列出后台明确配置且可用的图片模型，禁止公共目录和聊天模型混入。 | — | — |
| `POST` | `/api/v1/agentapp/canvas/workbench/agent` | `run_workbench_agent_api_v1_agentapp_canvas_workbench_agent_post` | 兼容非流式客户端的画布 Agent 端点。 | — | application/json：WorkbenchAgentReq，必填 |
| `POST` | `/api/v1/agentapp/canvas/workbench/agent/stream` | `stream_workbench_agent_api_v1_agentapp_canvas_workbench_agent_stream_post` | 画布 Agent 的 NDJSON 流：增量展示 assistantMessage，末尾返回结构化工具调用。 | — | application/json：WorkbenchAgentReq，必填 |
| `GET` | `/api/v1/agentapp/canvas/workbench/assets` | `list_workbench_assets_api_v1_agentapp_canvas_workbench_assets_get` | 列出画布上传素材，并合并同 ID 生产项目已有的图片和视频。 | query project_id：string，必填；minLength=1 | — |
| `POST` | `/api/v1/agentapp/canvas/workbench/assets/{project_id}/remote` | `import_workbench_remote_asset_api_v1_agentapp_canvas_workbench_assets__project_id__remote_post` | 登记浏览器粘贴的远程图片/视频 URL，随项目素材库恢复。 | path project_id：string，必填 | application/json：WorkbenchRemoteAssetReq，必填 |
| `POST` | `/api/v1/agentapp/canvas/workbench/assets/{project_id}/upload` | `upload_workbench_asset_api_v1_agentapp_canvas_workbench_assets__project_id__upload_post` | 把工作台拖入的图片、视频或音频保存到平台上传目录并登记素材。 | path project_id：string，必填 | multipart/form-data：Body_upload_workbench_asset_api_v1_agentapp_canvas_workbench_assets__project_id__upload_post，必填 |
| `GET` | `/api/v1/agentapp/canvas/workbench/models` | `list_workbench_models_api_v1_agentapp_canvas_workbench_models_get` | 把平台已配置员工/模型映射为画布工作台可消费的 catalog。 | query kind：string，可选；默认值："image"；pattern="^(text&#124;image&#124;video)$" | — |
| `GET` | `/api/v1/agentapp/canvas/workbench/projects` | `list_workbench_projects_api_v1_agentapp_canvas_workbench_projects_get` | 列出画布项目和平台现有生产项目，二者使用同一项目 ID。 | — | — |
| `DELETE` | `/api/v1/agentapp/canvas/workbench/projects/{project_id}` | `delete_workbench_project_api_v1_agentapp_canvas_workbench_projects__project_id__delete` | Delete Workbench Project | path project_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/canvas/workbench/projects/{project_id}` | `get_workbench_project_api_v1_agentapp_canvas_workbench_projects__project_id__get` | Get Workbench Project | path project_id：string，必填 | — |
| `PUT` | `/api/v1/agentapp/canvas/workbench/projects/{project_id}` | `save_workbench_project_api_v1_agentapp_canvas_workbench_projects__project_id__put` | Save Workbench Project | path project_id：string，必填 | application/json：object，必填 |
| `GET` | `/api/v1/agentapp/canvas/workbench/prompt-learning` | `get_workbench_prompt_learning_api_v1_agentapp_canvas_workbench_prompt_learning_get` | 列出内置方法论和用户确认过的画布提示词案例。 | query limit：integer，可选；默认值：100；minimum=1；maximum=300 | — |
| `POST` | `/api/v1/agentapp/canvas/workbench/prompt-learning` | `learn_workbench_prompts_api_v1_agentapp_canvas_workbench_prompt_learning_post` | 把用户确认采用的提示词沉淀到案例库和对应员工长期记忆。 | — | application/json：PromptLearningReq，必填 |
| `GET` | `/api/v1/agentapp/canvas/workbench/prompts` | `list_workbench_prompts_api_v1_agentapp_canvas_workbench_prompts_get` | 返回 Agent Studio 内置的人物、场景和分镜专业提示词资产。 | — | — |
| `POST` | `/api/v1/agentapp/canvas/workbench/tasks` | `run_workbench_task_api_v1_agentapp_canvas_workbench_tasks_post` | 使用平台已配置员工/模型执行文本、图片或视频任务。 | — | application/json：WorkbenchTaskReq，必填 |
| `GET` | `/api/v1/agentapp/canvas/workbench/tasks/{task_id}` | `get_workbench_task_api_v1_agentapp_canvas_workbench_tasks__task_id__get` | 轮询工作台视频任务，完成后返回已落地的平台 MP4 地址。 | path task_id：string，必填<br>query kind：string，可选；默认值："text_to_video"<br>query project_id：string，可选；默认值："agent-canvas"<br>query vendor：string，可选；默认值："openrouter" | — |
| `GET` | `/api/v1/agentapp/canvas/workbench/vendors` | `list_workbench_vendors_api_v1_agentapp_canvas_workbench_vendors_get` | 列出平台已有数字员工入口和 AI 供应商，不返回任何密钥。 | — | — |
| `GET` | `/api/v1/agentapp/director/feedback` | `get_project_feedback_api_v1_agentapp_director_feedback_get` | 聚合全部 JSON 项目的高频问题、低分项目和真实修复成功率。 | — | — |
| `GET` | `/api/v1/agentapp/director/media-models` | `get_media_models_api_v1_agentapp_director_media_models_get` | 有员工时只返回其已配置模型；无员工时保留 OpenRouter 目录兼容。 | query kind：string，可选；默认值："image"；pattern="^(image&#124;video)$"<br>query employee_key：string，可选；默认值："" | — |
| `GET` | `/api/v1/agentapp/director/projects/{project_id}` | `get_director_state_api_v1_agentapp_director_projects__project_id__get` | 返回总制片视角的项目进度、镜头与下一步动作。 | path project_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/control-assets` | `upload_director_control_asset_api_v1_agentapp_director_projects__project_id__cards__card_id__control_assets_post` | 上传镜头参考素材并立即绑定到控制包。 | path project_id：string，必填<br>path card_id：string，必填<br>query role：string，可选；默认值："style"；可选值：["identity","expression","scene","prop","storyboard","performance","motion","camera","blocking","dialogue","sound","continuity","style"] | multipart/form-data：Body_upload_director_control_asset_api_v1_agentapp_director_projects__project_id__cards__card_id__control_assets_post，必填 |
| `PUT` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/control-pack` | `update_director_control_pack_api_v1_agentapp_director_projects__project_id__cards__card_id__control_pack_put` | 保存单镜头的角色、场景、表演、运镜和声音控制。 | path project_id：string，必填<br>path card_id：string，必填 | application/json：ShotControlPack，必填 |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/image` | `generate_director_image_api_v1_agentapp_director_projects__project_id__cards__card_id__image_post` | 按图片执行员工的模型策略生成镜头图，并自动回填到图片提示卡。 | path project_id：string，必填<br>path card_id：string，必填 | application/json：ImageGenerateReq，必填 |
| `PUT` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/image-prompt` | `update_director_image_prompt_api_v1_agentapp_director_projects__project_id__cards__card_id__image_prompt_put` | 保存单镜头主提示词，同时保留卡片上的其余提示词与生产元数据。 | path project_id：string，必填<br>path card_id：string，必填 | application/json：ImagePromptUpdateReq，必填 |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/video` | `generate_director_video_api_v1_agentapp_director_projects__project_id__cards__card_id__video_post` | 提交一个镜头的 OpenRouter 异步视频任务并把任务号写回卡片。 | path project_id：string，必填<br>path card_id：string，必填 | application/json：VideoGenerateReq，必填 |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/cards/{card_id}/video/sync` | `sync_director_video_api_v1_agentapp_director_projects__project_id__cards__card_id__video_sync_post` | 同步视频任务状态；完成后下载 MP4 并自动回填镜头。 | path project_id：string，必填<br>path card_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/compose` | `compose_director_cut_api_v1_agentapp_director_projects__project_id__compose_post` | 按集数与 G 单元顺序合成全部镜头，并生成/更新 final 卡。 | path project_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/director/projects/{project_id}/diagnostics` | `get_project_diagnostics_api_v1_agentapp_director_projects__project_id__diagnostics_get` | 只读扫描项目，返回健康分、阻塞问题和下一条可执行动作。 | path project_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/director/projects/{project_id}/optimization-runs` | `get_project_optimization_runs_api_v1_agentapp_director_projects__project_id__optimization_runs_get` | 返回最近的问题修复记录，展示修复前后健康分和失败原因。 | path project_id：string，必填<br>query limit：integer，可选；默认值：30；minimum=1；maximum=100 | — |
| `POST` | `/api/v1/agentapp/director/projects/{project_id}/optimize` | `optimize_project_api_v1_agentapp_director_projects__project_id__optimize_post` | 按诊断问题调用现有阶段生成器定向返工，并记录优化前后结果。 | path project_id：string，必填 | application/json：OptimizeProjectReq，必填 |
| `PUT` | `/api/v1/agentapp/director/projects/{project_id}/shots/order` | `reorder_director_shots_api_v1_agentapp_director_projects__project_id__shots_order_put` | 原子重排一集全部正整数 G 单元，并让旧视频/成片进入过期状态。 | path project_id：string，必填 | application/json：ShotOrderReq，必填 |
| `POST` | `/api/v1/agentapp/evolution/accept/{employee_key}/{insight_id}` | `accept_api_v1_agentapp_evolution_accept__employee_key___insight_id__post` | POST /accept/{key}/{id}：采纳一条建议并落地；不存在或已处理返 404。 | path employee_key：string，必填<br>path insight_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/evolution/analyze/{employee_key}` | `trigger_analysis_api_v1_agentapp_evolution_analyze__employee_key__post` | POST /analyze/{key}：立即触发一次自我进化分析并返回运行日志。 | path employee_key：string，必填 | — |
| `GET` | `/api/v1/agentapp/evolution/insights/{employee_key}` | `get_insights_api_v1_agentapp_evolution_insights__employee_key__get` | GET /insights/{key}：列出某员工的全部进化建议。 | path employee_key：string，必填 | — |
| `GET` | `/api/v1/agentapp/evolution/overview` | `overview_api_v1_agentapp_evolution_overview_get` | GET /overview：汇总每个员工的建议数量（待处理/已采纳/已驳回/总计）。 | — | — |
| `POST` | `/api/v1/agentapp/evolution/reject/{employee_key}/{insight_id}` | `reject_api_v1_agentapp_evolution_reject__employee_key___insight_id__post` | POST /reject/{key}/{id}：驳回一条建议；不存在或已处理返 404。 | path employee_key：string，必填<br>path insight_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/evolution/run-logs/{employee_key}` | `get_run_logs_api_v1_agentapp_evolution_run_logs__employee_key__get` | GET /run-logs/{key}：列出某员工的进化运行日志。 | path employee_key：string，必填 | — |
| `GET` | `/api/v1/agentapp/knowledge-graph` | `get_knowledge_graph_api_v1_agentapp_knowledge_graph_get` | GET ''：聚合员工/工具/技能/MCP/团队/工作流为节点、绑定关系为边，返回 {nodes, edges} 供前端可视化。 | — | — |
| `GET` | `/api/v1/agentapp/memory/all/{employee_key}` | `get_all_api_v1_agentapp_memory_all__employee_key__get` | GET /all/{key}：返回该员工三层记忆全量（用于提示词注入的完整视图）。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/memory/distill/{employee_key}` | `trigger_distillation_api_v1_agentapp_memory_distill__employee_key__post` | POST /distill/{key}：立即触发一次记忆蒸馏并返回日志。 | path employee_key：string，必填 | — |
| `GET` | `/api/v1/agentapp/memory/distillation-logs/{employee_key}` | `get_distillation_logs_api_v1_agentapp_memory_distillation_logs__employee_key__get` | GET /distillation-logs/{key}：列出该员工的蒸馏历史。 | path employee_key：string，必填 | — |
| `GET` | `/api/v1/agentapp/memory/episodic/{employee_key}` | `list_episodic_api_v1_agentapp_memory_episodic__employee_key__get` | GET /episodic/{key}：列出该员工的全部经验记忆。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/memory/episodic/{employee_key}` | `add_episodic_api_v1_agentapp_memory_episodic__employee_key__post` | POST /episodic/{key}：新增一条经验记忆。 | path employee_key：string，必填 | application/json：EpisodicBody，必填 |
| `DELETE` | `/api/v1/agentapp/memory/episodic/{employee_key}/{memory_id}` | `delete_episodic_api_v1_agentapp_memory_episodic__employee_key___memory_id__delete` | DELETE /episodic/{key}/{id}：删除一条经验记忆，不存在返 404。 | path employee_key：string，必填<br>path memory_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/memory/extract/{employee_key}/{session_id}` | `trigger_extraction_api_v1_agentapp_memory_extract__employee_key___session_id__post` | POST /extract/{key}/{session_id}：从指定会话手动提取记忆并存入长期记忆，会话不存在返 404。 | path employee_key：string，必填<br>path session_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/memory/procedural/{employee_key}` | `list_procedural_api_v1_agentapp_memory_procedural__employee_key__get` | GET /procedural/{key}：列出该员工的全部行为记忆。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/memory/procedural/{employee_key}` | `add_procedural_api_v1_agentapp_memory_procedural__employee_key__post` | POST /procedural/{key}：新增一条行为记忆（与已有高相似则合并）。 | path employee_key：string，必填 | application/json：ProceduralBody，必填 |
| `DELETE` | `/api/v1/agentapp/memory/procedural/{employee_key}/{memory_id}` | `delete_procedural_api_v1_agentapp_memory_procedural__employee_key___memory_id__delete` | DELETE /procedural/{key}/{id}：删除一条行为记忆，不存在返 404。 | path employee_key：string，必填<br>path memory_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/memory/semantic/{employee_key}` | `list_semantic_api_v1_agentapp_memory_semantic__employee_key__get` | GET /semantic/{key}：列出该员工的全部语义记忆。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/memory/semantic/{employee_key}` | `add_semantic_api_v1_agentapp_memory_semantic__employee_key__post` | POST /semantic/{key}：新增一条语义记忆（与已有高相似则合并）。 | path employee_key：string，必填 | application/json：SemanticBody，必填 |
| `DELETE` | `/api/v1/agentapp/memory/semantic/{employee_key}/{memory_id}` | `delete_semantic_api_v1_agentapp_memory_semantic__employee_key___memory_id__delete` | DELETE /semantic/{key}/{id}：删除一条语义记忆，不存在返 404。 | path employee_key：string，必填<br>path memory_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/memory/stats/{employee_key}` | `get_stats_api_v1_agentapp_memory_stats__employee_key__get` | GET /stats/{key}：三层记忆各自条数统计。 | path employee_key：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/cards/batch-delete` | `batch_delete_cards_api_v1_agentapp_production_cards_batch_delete_post` | 整批权限检查通过后删除卡片，返回实际删除的 ID；未知 ID 静默跳过。 | — | application/json：BatchDeleteReq，必填 |
| `POST` | `/api/v1/agentapp/production/cards/batch-move` | `batch_move_cards_api_v1_agentapp_production_cards_batch_move_post` | 整批权限及阶段检查通过后移动卡片；未知 ID 跳过，非法阶段返 400。 | — | application/json：BatchMoveReq，必填 |
| `POST` | `/api/v1/agentapp/production/cards/batch-status` | `batch_update_status_api_v1_agentapp_production_cards_batch_status_post` | 整批权限、状态及完成门禁检查通过后写入；校验失败不修改任何项目。 | — | application/json：BatchUpdateStatusReq，必填 |
| `DELETE` | `/api/v1/agentapp/production/cards/{card_id}` | `delete_card_api_v1_agentapp_production_cards__card_id__delete` | DELETE /cards/{card_id}：跨全部项目定位并删除卡片；不存在返 404。 | path card_id：string，必填 | — |
| `PUT` | `/api/v1/agentapp/production/cards/{card_id}` | `update_card_api_v1_agentapp_production_cards__card_id__put` | PUT /cards/{card_id}：跨全部项目按 card_id 定位并部分更新卡片（以 model_fields_set 判断哪些字段被显式传入）；不存在返 404。 | path card_id：string，必填 | application/json：UpdateCardReq，必填 |
| `POST` | `/api/v1/agentapp/production/cards/{card_id}/move` | `move_card_api_v1_agentapp_production_cards__card_id__move_post` | POST /cards/{card_id}/move：把单张卡片移到指定阶段；阶段非法返 400，卡片不存在返 404。 | path card_id：string，必填<br>query stage：string，可选；默认值："idea" | — |
| `GET` | `/api/v1/agentapp/production/matrix` | `production_matrix_api_v1_agentapp_production_matrix_get` | GET /matrix：跨全部项目返回「季 → 集 → G 生成单元」的链路对照表。 | — | — |
| `GET` | `/api/v1/agentapp/production/orphans` | `list_orphans_api_v1_agentapp_production_orphans_get` | GET /orphans：跨全部项目列出孤儿卡（挂在四个 spec 阶段全空的 G 单元上的卡片）。 | — | — |
| `GET` | `/api/v1/agentapp/production/projects` | `list_projects_api_v1_agentapp_production_projects_get` | GET /projects：列出当前用户有权访问的项目，附带卡片数与进度统计。 | — | — |
| `POST` | `/api/v1/agentapp/production/projects` | `create_project_api_v1_agentapp_production_projects_post` | POST /projects：创建项目（创建者自动成为 owner）；若带原始素材则自动生成一张 idea 阶段卡片。 | — | application/json：CreateProjectReq，必填 |
| `DELETE` | `/api/v1/agentapp/production/projects/{pid}` | `delete_project_api_v1_agentapp_production_projects__pid__delete` | DELETE /projects/{pid}：删除项目整个数据目录（含卡片与上传文件），幂等操作。 | path pid：string，必填 | — |
| `GET` | `/api/v1/agentapp/production/projects/{pid}` | `get_project_api_v1_agentapp_production_projects__pid__get` | GET /projects/{pid}：返回项目详情 + 全部卡片 + 进度统计；老数据无成员时自动补 owner。 | path pid：string，必填 | — |
| `PUT` | `/api/v1/agentapp/production/projects/{pid}` | `update_project_api_v1_agentapp_production_projects__pid__put` | PUT /projects/{pid}：按传入字段部分更新项目信息（settings 为合并而非覆盖）。 | path pid：string，必填 | application/json：UpdateProjectReq，必填 |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/archive` | `list_archive_api_v1_agentapp_production_projects__pid__archive_get` | GET /projects/{pid}/archive：列出该项目归档目录里的全部卡片（按归档时间倒序）。 | path pid：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/archive` | `archive_cards_api_v1_agentapp_production_projects__pid__archive_post` | 在项目锁内归档卡片。 | path pid：string，必填 | application/json：ArchiveReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/archive/{card_id}/restore` | `restore_card_api_v1_agentapp_production_projects__pid__archive__card_id__restore_post` | 在项目锁内恢复归档卡片。 | path pid：string，必填<br>path card_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards` | `add_card_api_v1_agentapp_production_projects__pid__cards_post` | POST /projects/{pid}/cards：在项目下新建一张生产卡片；项目不存在返 404。 | path pid：string，必填 | application/json：CreateCardReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/batch` | `batch_add_cards_api_v1_agentapp_production_projects__pid__cards_batch_post` | POST /projects/{pid}/cards/batch：一次写入多张卡片并返回新建结果；项目不存在返 404。 | path pid：string，必填 | application/json：BatchCreateCardReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/comments` | `create_card_comment_api_v1_agentapp_production_projects__pid__cards__card_id__comments_post` | 在项目内给指定卡片添加批注，作者取当前鉴权账号。 | path pid：string，必填<br>path card_id：string，必填 | application/json：CreateCommentReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/generate-image` | `generate_card_image_api_v1_agentapp_production_projects__pid__cards__card_id__generate_image_post` | 生成待验收候选；已有通过版本时不自动替换当前生产图。 | path pid：string，必填<br>path card_id：string，必填 | application/json：GenerateCardImageReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/image-candidates/activate` | `activate_image_candidate_api_v1_agentapp_production_projects__pid__cards__card_id__image_candidates_activate_post` | 采用一个已通过验收的图片候选；切换会让绑定旧图的视频自然变为过期。 | path pid：string，必填<br>path card_id：string，必填 | application/json：ActivateImageCandidateReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/review` | `review_card_image_api_v1_agentapp_production_projects__pid__cards__card_id__review_post` | POST …/review：对卡片某张图记一次人工评审（pass/reject），追加进 metadata.image_reviews。 | path pid：string，必填<br>path card_id：string，必填 | application/json：ReviewCardImageReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/split-storyboard` | `split_storyboard_card_api_v1_agentapp_production_projects__pid__cards__card_id__split_storyboard_post` | 在项目锁内拆分故事板，避免覆盖同时发生的卡片修改。 | path pid：string，必填<br>path card_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/upload` | `upload_card_file_api_v1_agentapp_production_projects__pid__cards__card_id__upload_post` | POST /projects/{pid}/cards/{card_id}/upload：上传图片/视频到卡片，按 file_type 追加到 images 或 videos 列表；卡片不存在返 404。 | path pid：string，必填<br>path card_id：string，必填<br>query file_type：string，可选；默认值："image" | multipart/form-data：Body_upload_card_file_api_v1_agentapp_production_projects__pid__cards__card_id__upload_post，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/video-candidates/activate` | `activate_video_candidate_api_v1_agentapp_production_projects__pid__cards__card_id__video_candidates_activate_post` | 采用一个已通过验收的视频候选；未达门槛的候选不能进入下一阶段。 | path pid：string，必填<br>path card_id：string，必填 | application/json：ActivateVideoCandidateReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/cards/{card_id}/video-review` | `review_card_video_api_v1_agentapp_production_projects__pid__cards__card_id__video_review_post` | 评审镜头视频或整集成片；只有采用版本的结论会改变生产状态。 | path pid：string，必填<br>path card_id：string，必填 | application/json：ReviewCardVideoReq，必填 |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/comments` | `list_project_comments_api_v1_agentapp_production_projects__pid__comments_get` | 列出项目批注，可按卡片过滤；默认隐藏已解决项。 | path pid：string，必填<br>query card_id：string 或 null，可选<br>query include_resolved：boolean，可选；默认值：false | — |
| `PATCH` | `/api/v1/agentapp/production/projects/{pid}/comments/{comment_id}` | `update_project_comment_api_v1_agentapp_production_projects__pid__comments__comment_id__patch` | 在当前项目内解决或重新打开一条批注。 | path pid：string，必填<br>path comment_id：string，必填 | application/json：UpdateCommentReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/export` | `export_project_api_v1_agentapp_production_projects__pid__export_post` | 导出项目 JSON、批注、版本与本地媒体为可迁移 ZIP 包。 | path pid：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/generate` | `generate_stage_api_v1_agentapp_production_projects__pid__generate_post` | POST /projects/{pid}/generate：汇总前置阶段内容作为上下文，调用数字员工生成目标阶段卡片。 | path pid：string，必填 | application/json：app__api__production__GenerateReq，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/inbox/upload` | `inbox_upload_api_v1_agentapp_production_projects__pid__inbox_upload_post` | POST …/inbox/upload：批量收文件并按文件名规则分拣挂卡。 | path pid：string，必填<br>query default_episode：integer 或 null，可选；文件名缺集数时的默认集 | multipart/form-data：Body_inbox_upload_api_v1_agentapp_production_projects__pid__inbox_upload_post，必填 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/members` | `add_member_api_v1_agentapp_production_projects__pid__members_post` | POST /projects/{pid}/members：添加项目成员；角色非法或重名返 400。 | path pid：string，必填 | application/json：AddMemberReq，必填 |
| `DELETE` | `/api/v1/agentapp/production/projects/{pid}/members/{user_id}` | `remove_member_api_v1_agentapp_production_projects__pid__members__user_id__delete` | DELETE /projects/{pid}/members/{user_id}：移除项目成员；不允许移除最后一个 owner（返 400），成员不存在返 404。 | path pid：string，必填<br>path user_id：string，必填 | — |
| `PUT` | `/api/v1/agentapp/production/projects/{pid}/members/{user_id}` | `update_member_role_api_v1_agentapp_production_projects__pid__members__user_id__put` | PUT /projects/{pid}/members/{user_id}：修改成员角色；不允许把最后一个 owner 降级（返 400），成员不存在返 404。 | path pid：string，必填<br>path user_id：string，必填 | application/json：UpdateMemberReq，必填 |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/review-stats` | `get_review_stats_api_v1_agentapp_production_projects__pid__review_stats_get` | GET …/review-stats：聚合项目内全部图片评审，返回废弃原因分布（含中文名）与按集统计。 | path pid：string，必填 | — |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/search` | `search_cards_api_v1_agentapp_production_projects__pid__search_get` | GET /projects/{pid}/search：按关键词（匹配标题/内容/提示词）与阶段/状态/集数/负责人组合过滤卡片。 | path pid：string，必填<br>query q：string，可选；搜索关键词；默认值：""<br>query stage：string 或 null，可选<br>query status：string 或 null，可选<br>query episode：integer 或 null，可选<br>query assignee：string 或 null，可选 | — |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/stats` | `get_project_stats_api_v1_agentapp_production_projects__pid__stats_get` | GET /projects/{pid}/stats：返回项目进度统计，并按集（EPxx）细分各集进度。 | path pid：string，必填 | — |
| `GET` | `/api/v1/agentapp/production/projects/{pid}/versions` | `list_project_versions_api_v1_agentapp_production_projects__pid__versions_get` | 列出项目版本元数据，按创建时间倒序，不回传大体积卡片正文。 | path pid：string，必填 | — |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/versions` | `create_project_version_api_v1_agentapp_production_projects__pid__versions_post` | 手动创建一个永不覆盖的项目版本；即使内容相同也保留用户明确打点。 | path pid：string，必填 | application/json：CreateVersionReq 或 null，可选 |
| `POST` | `/api/v1/agentapp/production/projects/{pid}/versions/{version_id}/restore` | `restore_project_version_api_v1_agentapp_production_projects__pid__versions__version_id__restore_post` | 恢复指定版本；覆盖当前内容前强制保存 before_restore 快照。 | path pid：string，必填<br>path version_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/production/quality-profile` | `get_quality_profile_api_v1_agentapp_production_quality_profile_get` | 返回图片、镜头视频和整集成片量表；前端不得自行复制阈值。 | — | — |
| `GET` | `/api/v1/agentapp/production/resource/{path}` | `serve_resource_api_v1_agentapp_production_resource__path__get` | GET /resource/{path}：从 resouce 目录提供静态素材文件；带路径穿越防护（越界返 403），文件不存在返 404。 | path path：string，必填<br>query w：integer 或 null，可选 | — |
| `GET` | `/api/v1/agentapp/production/stages` | `list_stages_api_v1_agentapp_production_stages_get` | GET /stages：返回生产流程的全部阶段定义（key/名称/顺序），供前端渲染看板列。 | — | — |
| `GET` | `/api/v1/agentapp/quick-prompts` | `list_quick_prompts_api_v1_agentapp_quick_prompts_get` | 列出当前账号的常用指令，可按数字员工筛选。 | query employee_key：string 或 null，可选 | — |
| `POST` | `/api/v1/agentapp/quick-prompts` | `create_quick_prompt_api_v1_agentapp_quick_prompts_post` | 给当前账号保存一条常用指令。 | — | application/json：CreateQuickPromptReq，必填 |
| `DELETE` | `/api/v1/agentapp/quick-prompts/{prompt_id}` | `delete_quick_prompt_api_v1_agentapp_quick_prompts__prompt_id__delete` | 删除当前账号的一条常用指令。 | path prompt_id：string，必填 | — |
| `PUT` | `/api/v1/agentapp/quick-prompts/{prompt_id}` | `update_quick_prompt_api_v1_agentapp_quick_prompts__prompt_id__put` | 修改当前账号的一条常用指令，无法访问其他账号的同名资源。 | path prompt_id：string，必填 | application/json：UpdateQuickPromptReq，必填 |
| `GET` | `/api/v1/agentapp/registry/employees` | `list_employees_api_v1_agentapp_registry_employees_get` | GET /employees：列出全部数字员工。 | — | — |
| `POST` | `/api/v1/agentapp/registry/employees` | `create_employee_api_v1_agentapp_registry_employees_post` | POST /employees：创建员工，key 已存在返 409。 | — | application/json：EmployeeDefinition，必填 |
| `POST` | `/api/v1/agentapp/registry/employees/generate-draft` | `generate_employee_draft_api_v1_agentapp_registry_employees_generate_draft_post` | 根据一句岗位描述自动设计完整员工；模型异常时返回高质量通用草稿。 | — | application/json：EmployeeDraftBody，必填 |
| `DELETE` | `/api/v1/agentapp/registry/employees/{key}` | `delete_employee_api_v1_agentapp_registry_employees__key__delete` | DELETE /employees/{key}：删除员工，不存在返 404。 | path key：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/employees/{key}` | `get_employee_api_v1_agentapp_registry_employees__key__get` | GET /employees/{key}：查单个员工，不存在返 404。 | path key：string，必填 | — |
| `PUT` | `/api/v1/agentapp/registry/employees/{key}` | `update_employee_api_v1_agentapp_registry_employees__key__put` | PUT /employees/{key}：整体更新员工定义，不存在返 404。 | path key：string，必填 | application/json：EmployeeDefinition，必填 |
| `PUT` | `/api/v1/agentapp/registry/employees/{key}/bindings` | `update_employee_bindings_api_v1_agentapp_registry_employees__key__bindings_put` | PUT /employees/{key}/bindings：更新员工的技能/工具/MCP 绑定（传了才改）。 | path key：string，必填 | application/json：BindingsBody，必填 |
| `POST` | `/api/v1/agentapp/registry/employees/{key}/clone` | `clone_employee_api_v1_agentapp_registry_employees__key__clone_post` | POST /employees/{key}/clone：以现有员工为模板克隆一个新员工（新 key + 新名字）。 | path key：string，必填 | application/json：object，必填 |
| `POST` | `/api/v1/agentapp/registry/employees/{key}/enabled` | `toggle_employee_enabled_api_v1_agentapp_registry_employees__key__enabled_post` | POST /employees/{key}/enabled：启用/停用员工。 | path key：string，必填 | application/json：EnabledBody，必填 |
| `GET` | `/api/v1/agentapp/registry/employees/{key}/knowledge` | `list_knowledge_docs_api_v1_agentapp_registry_employees__key__knowledge_get` | GET /employees/{key}/knowledge：列出员工知识库文档。 | path key：string，必填 | — |
| `POST` | `/api/v1/agentapp/registry/employees/{key}/knowledge` | `upload_knowledge_doc_api_v1_agentapp_registry_employees__key__knowledge_post` | POST /employees/{key}/knowledge：上传知识文档（扩展名/大小受配置约束），非法返 400；成功后后台向量化（M3）。 | path key：string，必填 | multipart/form-data：Body_upload_knowledge_doc_api_v1_agentapp_registry_employees__key__knowledge_post，必填 |
| `GET` | `/api/v1/agentapp/registry/employees/{key}/knowledge/search` | `search_knowledge_api_v1_agentapp_registry_employees__key__knowledge_search_get` | GET /employees/{key}/knowledge/search：知识库检索——配了向量检索走语义（M3），否则退化关键词。 | path key：string，必填<br>query q：string，必填<br>query topK：integer，可选；默认值：5 | — |
| `DELETE` | `/api/v1/agentapp/registry/employees/{key}/knowledge/{doc_id}` | `delete_knowledge_doc_api_v1_agentapp_registry_employees__key__knowledge__doc_id__delete` | DELETE /employees/{key}/knowledge/{doc_id}：删除知识文档，不存在返 404；连带清向量（M3）。 | path key：string，必填<br>path doc_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/mcp-servers` | `list_mcp_servers_api_v1_agentapp_registry_mcp_servers_get` | GET /mcp-servers：列出全部 MCP 服务器定义。 | — | — |
| `POST` | `/api/v1/agentapp/registry/mcp-servers` | `save_mcp_server_api_v1_agentapp_registry_mcp_servers_post` | POST /mcp-servers：新建或整体覆盖一个 MCP 服务器定义。 | — | application/json：McpServerDefinition，必填 |
| `DELETE` | `/api/v1/agentapp/registry/mcp-servers/{code}` | `delete_mcp_server_api_v1_agentapp_registry_mcp_servers__code__delete` | DELETE /mcp-servers/{code}：删除 MCP 服务器，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/mcp-servers/{code}` | `get_mcp_server_api_v1_agentapp_registry_mcp_servers__code__get` | GET /mcp-servers/{code}：查单个 MCP 服务器，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/overview` | `get_overview_api_v1_agentapp_registry_overview_get` | GET /overview：各注册表的数量统计（首页总览卡片用）。 | — | — |
| `GET` | `/api/v1/agentapp/registry/role-templates` | `list_role_templates_api_v1_agentapp_registry_role_templates_get` | GET /role-templates：列出全部角色模板。 | — | — |
| `POST` | `/api/v1/agentapp/registry/role-templates` | `save_role_template_api_v1_agentapp_registry_role_templates_post` | POST /role-templates：新建或整体覆盖一个角色模板。 | — | application/json：RoleTemplateDefinition，必填 |
| `DELETE` | `/api/v1/agentapp/registry/role-templates/{code}` | `delete_role_template_api_v1_agentapp_registry_role_templates__code__delete` | DELETE /role-templates/{code}：删除模板，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/role-templates/{code}` | `get_role_template_api_v1_agentapp_registry_role_templates__code__get` | GET /role-templates/{code}：查单个模板，不存在返 404。 | path code：string，必填 | — |
| `POST` | `/api/v1/agentapp/registry/role-templates/{code}/apply` | `apply_role_template_api_v1_agentapp_registry_role_templates__code__apply_post` | POST /role-templates/{code}/apply：按模板一键创建员工（带建议技能/工具绑定），目标 key 已存在返 409。 | path code：string，必填 | application/json：ApplyTemplateBody，必填 |
| `GET` | `/api/v1/agentapp/registry/skills` | `list_skills_api_v1_agentapp_registry_skills_get` | GET /skills：列出全部技能定义。 | — | — |
| `POST` | `/api/v1/agentapp/registry/skills` | `save_skill_api_v1_agentapp_registry_skills_post` | POST /skills：新建或整体覆盖一个技能定义。 | — | application/json：SkillDefinition，必填 |
| `DELETE` | `/api/v1/agentapp/registry/skills/{code}` | `delete_skill_api_v1_agentapp_registry_skills__code__delete` | DELETE /skills/{code}：删除技能，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/skills/{code}` | `get_skill_api_v1_agentapp_registry_skills__code__get` | GET /skills/{code}：查单个技能，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/teams` | `list_teams_api_v1_agentapp_registry_teams_get` | GET /teams：列出全部团队。 | — | — |
| `POST` | `/api/v1/agentapp/registry/teams` | `save_team_api_v1_agentapp_registry_teams_post` | POST /teams：新建或整体覆盖一个团队定义。 | — | application/json：TeamDefinition，必填 |
| `DELETE` | `/api/v1/agentapp/registry/teams/{code}` | `delete_team_api_v1_agentapp_registry_teams__code__delete` | DELETE /teams/{code}：删除团队，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/teams/{code}` | `get_team_api_v1_agentapp_registry_teams__code__get` | GET /teams/{code}：查单个团队，不存在返 404。 | path code：string，必填 | — |
| `PUT` | `/api/v1/agentapp/registry/teams/{code}/members` | `update_team_members_api_v1_agentapp_registry_teams__code__members_put` | PUT /teams/{code}/members：整体替换团队成员列表。 | path code：string，必填 | application/json：TeamMembersBody，必填 |
| `GET` | `/api/v1/agentapp/registry/tools` | `list_tools_api_v1_agentapp_registry_tools_get` | GET /tools：列出全部工具定义。 | — | — |
| `POST` | `/api/v1/agentapp/registry/tools` | `save_tool_api_v1_agentapp_registry_tools_post` | POST /tools：新建或整体覆盖一个工具定义。 | — | application/json：ToolDefinition，必填 |
| `DELETE` | `/api/v1/agentapp/registry/tools/{code}` | `delete_tool_api_v1_agentapp_registry_tools__code__delete` | DELETE /tools/{code}：删除工具，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/registry/tools/{code}` | `get_tool_api_v1_agentapp_registry_tools__code__get` | GET /tools/{code}：查单个工具，不存在返 404。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/scrape/employees` | `list_target_employees_api_v1_agentapp_scrape_employees_get` | GET /target-employees：可作为学习目标的员工精简列表（下拉框用）。 | — | — |
| `POST` | `/api/v1/agentapp/scrape/learn-batch/{employee_key}` | `learn_batch_api_v1_agentapp_scrape_learn_batch__employee_key__post` | 批量学习：一次性给指定员工喂多篇文章。 | path employee_key：string，必填 | application/json：array&lt;_LearnRequest&gt;，必填 |
| `GET` | `/api/v1/agentapp/scrape/learn-sources` | `list_learn_sources_api_v1_agentapp_scrape_learn_sources_get` | GET /learn-sources：列出全部文章学习源。 | — | — |
| `POST` | `/api/v1/agentapp/scrape/learn-sources` | `create_learn_source_api_v1_agentapp_scrape_learn_sources_post` | POST /learn-sources：创建文章学习源（运行时状态由服务端初始化），重复返 409。 | — | application/json：LearnSource，必填 |
| `DELETE` | `/api/v1/agentapp/scrape/learn-sources/{code}` | `delete_learn_source_api_v1_agentapp_scrape_learn_sources__code__delete` | DELETE /learn-sources/{code}：删除学习源并清掉其历史。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/scrape/learn-sources/{code}` | `get_learn_source_api_v1_agentapp_scrape_learn_sources__code__get` | GET /learn-sources/{code}：查单个学习源，不存在返 404。 | path code：string，必填 | — |
| `PUT` | `/api/v1/agentapp/scrape/learn-sources/{code}` | `update_learn_source_api_v1_agentapp_scrape_learn_sources__code__put` | PUT /learn-sources/{code}：更新学习源配置，保留运行时状态字段。 | path code：string，必填 | application/json：LearnSource，必填 |
| `GET` | `/api/v1/agentapp/scrape/learn-sources/{code}/history` | `list_learn_history_api_v1_agentapp_scrape_learn_sources__code__history_get` | GET /learn-sources/{code}/history：列出该学习源的历史运行记录。 | path code：string，必填 | — |
| `POST` | `/api/v1/agentapp/scrape/learn-sources/{code}/run` | `run_learn_source_now_api_v1_agentapp_scrape_learn_sources__code__run_post` | POST /learn-sources/{code}/run：立即执行一次文章学习，返回本次运行结果。 | path code：string，必填 | — |
| `POST` | `/api/v1/agentapp/scrape/learn/{employee_key}` | `learn_from_article_api_v1_agentapp_scrape_learn__employee_key__post` | 让指定员工从一篇网页文章中学习专业知识。 | path employee_key：string，必填 | application/json：_LearnRequest，必填 |
| `GET` | `/api/v1/agentapp/scrape/sources` | `list_sources_api_v1_agentapp_scrape_sources_get` | GET /sources：列出全部提示词采集源。 | — | — |
| `POST` | `/api/v1/agentapp/scrape/sources` | `create_source_api_v1_agentapp_scrape_sources_post` | POST /sources：创建采集源（运行时状态字段由服务端初始化，忽略客户端传值），重复返 409。 | — | application/json：ScrapeSource，必填 |
| `DELETE` | `/api/v1/agentapp/scrape/sources/{code}` | `delete_source_api_v1_agentapp_scrape_sources__code__delete` | DELETE /sources/{code}：删除采集源并连带清掉其已采提示词与历史。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/scrape/sources/{code}` | `get_source_api_v1_agentapp_scrape_sources__code__get` | GET /sources/{code}：查单个采集源，不存在返 404。 | path code：string，必填 | — |
| `PUT` | `/api/v1/agentapp/scrape/sources/{code}` | `update_source_api_v1_agentapp_scrape_sources__code__put` | PUT /sources/{code}：更新采集源配置，保留服务端维护的运行时状态字段。 | path code：string，必填 | application/json：ScrapeSource，必填 |
| `GET` | `/api/v1/agentapp/scrape/sources/{code}/history` | `list_history_api_v1_agentapp_scrape_sources__code__history_get` | GET /sources/{code}/history：列出该源的历史运行记录。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/scrape/sources/{code}/prompts` | `list_prompts_api_v1_agentapp_scrape_sources__code__prompts_get` | GET /sources/{code}/prompts：列出该源已采集的提示词（limit 1-600）。 | path code：string，必填<br>query limit：integer，可选；默认值：200；minimum=1；maximum=600 | — |
| `POST` | `/api/v1/agentapp/scrape/sources/{code}/run` | `run_source_now_api_v1_agentapp_scrape_sources__code__run_post` | POST /sources/{code}/run：立即执行一次采集（不等定时），返回本次运行结果。 | path code：string，必填 | — |
| `GET` | `/api/v1/agentapp/skills/analyze` | `get_analysis_api_v1_agentapp_skills_analyze_get` | 读取缓存的分析报告。 | — | — |
| `POST` | `/api/v1/agentapp/skills/analyze` | `analyze_trends_api_v1_agentapp_skills_analyze_post` | 用 LLM 生成 AI 趋势分析报告（同一天复用缓存）。 | — | — |
| `GET` | `/api/v1/agentapp/skills/digest` | `get_digest_api_v1_agentapp_skills_digest_get` | 读当前简报（已剔除已读条目）。不触发 LLM。 | — | — |
| `POST` | `/api/v1/agentapp/skills/digest` | `make_digest_api_v1_agentapp_skills_digest_post` | 生成简报：剔除已读 → 按画像挑选 → 只回结论。 | query force：boolean，可选；true=无视当天缓存强制重生成；默认值：false | — |
| `GET` | `/api/v1/agentapp/skills/digest/profile` | `get_digest_profile_api_v1_agentapp_skills_digest_profile_get` | 读兴趣画像（决定简报挑什么）。 | — | — |
| `PUT` | `/api/v1/agentapp/skills/digest/profile` | `put_digest_profile_api_v1_agentapp_skills_digest_profile_put` | 更新兴趣画像；下次生成简报即生效。 | — | application/json：object，必填 |
| `POST` | `/api/v1/agentapp/skills/digest/read` | `mark_digest_read_api_v1_agentapp_skills_digest_read_post` | 标记已读——这些条目以后永不再出现在简报里。 | — | application/json：MarkReadReq，必填 |
| `GET` | `/api/v1/agentapp/skills/list` | `list_skills_api_v1_agentapp_skills_list_get` | 某个 query 的三个榜单：星最多 / 增长最快(估算) / 真实近期增长。 | query query：string，必填；要查看的 query | — |
| `GET` | `/api/v1/agentapp/skills/queries` | `list_queries_api_v1_agentapp_skills_queries_get` | 所有可用 query 及其摘要（条数、生成时间、是否有真实增长数据）。 | — | — |
| `POST` | `/api/v1/agentapp/skills/refresh` | `refresh_api_v1_agentapp_skills_refresh_post` | 手动触发一次拉取（会写快照 + JSON，并立即返回最新结果）。 | — | application/json：RefreshReq，必填 |
| `GET` | `/api/v1/agentapp/skills/repo-history` | `repo_history_api_v1_agentapp_skills_repo_history_get` | 某仓库在历次快照里的 star 走势，用于详情趋势图。 | query query：string，必填<br>query fullName：string，必填；owner/repo | — |
| `GET` | `/api/v1/agentapp/skills/repo-lookup` | `repo_lookup_api_v1_agentapp_skills_repo_lookup_get` | 跨全部 query 查一个仓库的完整记录 + star 走势。 | query fullName：string，必填；owner/repo | — |
| `GET` | `/api/v1/agentapp/skills/summary` | `get_cross_query_summary_api_v1_agentapp_skills_summary_get` | 跨查询汇总统计：语言分布、总项目数、各查询概况。 | — | — |
| `GET` | `/api/v1/agentapp/strategyproxy/parsestatus` | `get_parse_status_api_v1_agentapp_strategyproxy_parsestatus_get` | GET /parsestatus：按 snapshotId 向管理端查询策略解析结果。 | query snapshotId：string，必填 | — |
| `POST` | `/api/v1/agentapp/strategyproxy/upload` | `upload_strategy_file_api_v1_agentapp_strategyproxy_upload_post` | POST /upload：把上传的策略文件转发到管理端解析接口；管理端出错按其状态码/502 返回。 | — | multipart/form-data：Body_upload_strategy_file_api_v1_agentapp_strategyproxy_upload_post，必填 |
| `POST` | `/api/v1/agentapp/system-manager/actions/confirm` | `confirm_action_api_v1_agentapp_system_manager_actions_confirm_post` | 确认并执行提案；新增 MCP 保存后立即真实连接并发现工具。 | — | application/json：ConfirmActionBody，必填 |
| `POST` | `/api/v1/agentapp/system-manager/changes/{change_id}/rollback` | `propose_rollback_api_v1_agentapp_system_manager_changes__change_id__rollback_post` | 为历史变更生成回滚预览；仍需再调用确认端点。 | path change_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/system-manager/chat` | `chat_api_v1_agentapp_system_manager_chat_post` | 与系统管家对话；写操作只生成待确认提案。 | — | application/json：ManagerChatBody，必填 |
| `GET` | `/api/v1/agentapp/system-manager/context` | `get_context_api_v1_agentapp_system_manager_context_get` | 获取当前页面说明与系统资源健康摘要。 | query pagePath：string，可选；默认值："/"；maxLength=500 | — |
| `POST` | `/api/v1/agentapp/system-manager/mcp/oauth/callback` | `complete_mcp_oauth_api_v1_agentapp_system_manager_mcp_oauth_callback_post` | 完成 OAuth code 交换，并立即真实验证 MCP 工具发现。 | — | application/json：OAuthCallbackBody，必填 |
| `DELETE` | `/api/v1/agentapp/system-manager/mcp/{server_code}/oauth` | `logout_mcp_oauth_api_v1_agentapp_system_manager_mcp__server_code__oauth_delete` | 清除本机加密保存的 MCP OAuth 令牌。 | path server_code：string，必填 | — |
| `POST` | `/api/v1/agentapp/system-manager/mcp/{server_code}/oauth/start` | `start_mcp_oauth_api_v1_agentapp_system_manager_mcp__server_code__oauth_start_post` | 启动标准 MCP OAuth，返回授权服务器生成的浏览器地址。 | path server_code：string，必填 | application/json：OAuthStartBody，必填 |
| `POST` | `/api/v1/agentapp/system-manager/mcp/{server_code}/test` | `test_mcp_api_v1_agentapp_system_manager_mcp__server_code__test_post` | 真实连接 MCP 并列出工具，用于验证服务器配置及登录是否有效。 | path server_code：string，必填 | — |
| `GET` | `/api/v1/agentapp/system-manager/sessions/{session_id}` | `get_manager_session_api_v1_agentapp_system_manager_sessions__session_id__get` | 读取当前登录用户自己的系统管家历史对话。 | path session_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/system-manager/skills/import` | `import_skill_zip_api_v1_agentapp_system_manager_skills_import_post` | 上传并检查 Skill ZIP；只生成安装/更新提案，不立即写入技能目录。 | — | multipart/form-data：Body_import_skill_zip_api_v1_agentapp_system_manager_skills_import_post，必填 |
| `GET` | `/api/v1/agentapp/tasks` | `list_tasks_api_v1_agentapp_tasks_get` | 列出当前用户最近任务；未配置 Redis 时按可选能力降级为空列表。 | query limit：integer，可选；默认值：50 | — |
| `POST` | `/api/v1/agentapp/tasks/agent-run` | `enqueue_agent_run_api_v1_agentapp_tasks_agent_run_post` | POST /agent-run：入队一次 agent 运行并返回 job_id；去重命中返 409，Redis 不可用返 503。 | — | application/json：AgentRunRequest，必填 |
| `GET` | `/api/v1/agentapp/tasks/{job_id}` | `get_task_status_api_v1_agentapp_tasks__job_id__get` | GET /{job_id}：查询异步任务状态与结果（完成才带 result），不存在返 404。 | path job_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/tasks/{job_id}/cancel` | `cancel_task_api_v1_agentapp_tasks__job_id__cancel_post` | 取消当前用户尚未完成的任务；arq 会中止排队或执行中的 Job。 | path job_id：string，必填 | — |
| `POST` | `/api/v1/agentapp/tasks/{job_id}/retry` | `retry_task_api_v1_agentapp_tasks__job_id__retry_post` | 使用原始参数重新入队失败/完成任务，并生成新的 Job ID。 | path job_id：string，必填 | — |
| `GET` | `/api/v1/agentapp/trend-sources/arxiv` | `arxiv_list_api_v1_agentapp_trend_sources_arxiv_get` | GET /arxiv：按分类拉最新论文（带缓存），上游失败返 502。 | query category：string，可选；默认值："cs.AI"<br>query limit：integer，可选；默认值：20；maximum=50 | — |
| `GET` | `/api/v1/agentapp/trend-sources/arxiv/categories` | `arxiv_categories_api_v1_agentapp_trend_sources_arxiv_categories_get` | GET /arxiv/categories：arXiv 预置分类列表。 | — | — |
| `GET` | `/api/v1/agentapp/trend-sources/hn` | `hn_list_api_v1_agentapp_trend_sources_hn_get` | GET /hn：按查询词拉 HN 故事（带 2 小时缓存），上游失败返 502。 | query query：string，可选；默认值："AI agent"<br>query limit：integer，可选；默认值：20；maximum=50 | — |
| `GET` | `/api/v1/agentapp/trend-sources/hn/queries` | `hn_queries_api_v1_agentapp_trend_sources_hn_queries_get` | GET /hn/queries：HN 预置查询词列表。 | — | — |
| `GET` | `/api/v1/agentapp/trend-sources/news` | `news_list_api_v1_agentapp_trend_sources_news_get` | GET /news：按主题拉新闻（带缓存），上游失败返 502。 | query query：string，可选；默认值："artificial intelligence"<br>query limit：integer，可选；默认值：20；maximum=50 | — |
| `GET` | `/api/v1/agentapp/trend-sources/news/topics` | `news_topics_api_v1_agentapp_trend_sources_news_topics_get` | GET /news/topics：新闻预置主题列表。 | — | — |
| `GET` | `/api/v1/agentapp/trend-sources/overview` | `sources_overview_api_v1_agentapp_trend_sources_overview_get` | 返回各数据源的缓存状态。 | — | — |
| `GET` | `/api/v1/agentapp/trend-sources/reddit` | `reddit_list_api_v1_agentapp_trend_sources_reddit_get` | GET /reddit：按 subreddit 拉热帖（带缓存），上游失败返 502。 | query subreddit：string，可选；默认值："MachineLearning"<br>query limit：integer，可选；默认值：20；maximum=50 | — |
| `GET` | `/api/v1/agentapp/trend-sources/reddit/subs` | `reddit_subs_api_v1_agentapp_trend_sources_reddit_subs_get` | GET /reddit/subs：预置 subreddit 列表。 | — | — |
| `POST` | `/api/v1/agentapp/trend-sources/translate` | `translate_titles_api_v1_agentapp_trend_sources_translate_post` | 用 LLM 把英文标题批量翻译成中文简介。 | — | application/json：TranslateRequest，必填 |
| `GET` | `/api/v1/agentapp/workflow` | `list_workflows_api_v1_agentapp_workflow_get` | GET ''：列出全部工作流定义。 | — | — |
| `POST` | `/api/v1/agentapp/workflow` | `create_workflow_api_v1_agentapp_workflow_post` | POST ''：创建工作流；key 已存在返 409。图非法也允许保存，附 validationError 供前端提示。 | — | application/json：WorkflowDefinition，必填 |
| `GET` | `/api/v1/agentapp/workflow/node-types` | `list_node_types_api_v1_agentapp_workflow_node_types_get` | GET /node-types：返回已注册的节点类型及中文标签/描述（供前端调色板渲染）。 | — | — |
| `DELETE` | `/api/v1/agentapp/workflow/{key}` | `delete_workflow_api_v1_agentapp_workflow__key__delete` | DELETE /{key}：删除工作流及其全部运行记录，不存在返 404。 | path key：string，必填 | — |
| `GET` | `/api/v1/agentapp/workflow/{key}` | `get_workflow_api_v1_agentapp_workflow__key__get` | GET /{key}：取单个工作流，不存在返 404。 | path key：string，必填 | — |
| `PUT` | `/api/v1/agentapp/workflow/{key}` | `update_workflow_api_v1_agentapp_workflow__key__put` | PUT /{key}：更新工作流；不存在返 404，附 validationError。 | path key：string，必填 | application/json：WorkflowDefinition，必填 |
| `POST` | `/api/v1/agentapp/workflow/{key}/run` | `run_workflow_now_api_v1_agentapp_workflow__key__run_post` | POST /{key}/run：立即运行工作流（带整体超时）；不存在 404、超时 504、异常 500。 | path key：string，必填 | application/json：_RunBody，必填 |
| `GET` | `/api/v1/agentapp/workflow/{key}/runs` | `list_runs_api_v1_agentapp_workflow__key__runs_get` | GET /{key}/runs：列出该工作流的运行历史。 | path key：string，必填 | — |
| `GET` | `/api/v1/agentapp/workflow/{key}/runs/{run_id}` | `get_run_api_v1_agentapp_workflow__key__runs__run_id__get` | GET /{key}/runs/{run_id}：查单次工作流运行详情，不存在返 404。 | path key：string，必填<br>path run_id：string，必填 | — |
| `GET` | `/api/v1/pipeline/cli-status` | `get_cli_status_api_v1_pipeline_cli_status_get` | 检查本机可用的 CLI 工具。 | — | — |
| `POST` | `/api/v1/pipeline/run` | `start_pipeline_api_v1_pipeline_run_post` | 启动 CLI 流水线（同步执行，等全部完成后返回）。 | — | application/json：PipelineRunRequest，必填 |
| `GET` | `/api/v1/pipeline/runs` | `list_runs_api_v1_pipeline_runs_get` | 列出所有流水线运行记录。 | — | — |
| `GET` | `/api/v1/pipeline/runs/{run_id}` | `get_run_api_v1_pipeline_runs__run_id__get` | 获取单次运行的详情。 | path run_id：string，必填 | — |
| `GET` | `/api/v1/pipeline/runs/{run_id}/final` | `get_final_doc_api_v1_pipeline_runs__run_id__final_get` | 获取最终合并文档。 | path run_id：string，必填 | — |
| `GET` | `/healthcheck` | `healthcheck_healthcheck_get` | 存活探针——供负载均衡 / docker-compose healthcheck 使用，不做依赖检查。 | — | — |
| `GET` | `/{full_path}` | `spa_fallback__full_path__get` | SPA 兜底路由：命中静态文件则直接返回，否则回退到 index.html 交给前端路由。 | path full_path：string，必填 | — |

## 8. 管理端接口清单

| 方法 | 路径 | operationId | 用途 | 参数 | 请求体 |
|---|---|---|---|---|---|
| `GET` | `/` | `root__get` | GET /：友好指引——管理端是纯 API，控制台界面在前端 /admin 路由。 | — | — |
| `POST` | `/api/admin/auth/login` | `login_api_admin_auth_login_post` | POST /api/admin/auth/login：账号密码登录，签发管理端 HMAC token；账号密码错误或账号被禁用返回 401。 | — | application/json：LoginRequest，必填 |
| `GET` | `/api/admin/auth/me` | `me_api_admin_auth_me_get` | GET /api/admin/auth/me：返回当前登录用户信息（剔除密码哈希）及权限列表；token 对应用户不存在或已禁用返回 401。 | header authorization：string，可选；默认值："" | — |
| `GET` | `/api/admin/providers` | `list_providers_api_admin_providers_get` | GET /api/admin/providers：列出全部 AI 服务商（含环境内置与后台托管，managed 字段区分）；apiKey 一律脱敏返回。 | header authorization：string，可选；默认值："" | — |
| `POST` | `/api/admin/providers` | `save_provider_api_admin_providers_post` | POST /api/admin/providers：新建（同名则覆盖）托管服务商配置；返回脱敏后的保存结果。 | header authorization：string，可选；默认值："" | application/json：ProviderBody，必填 |
| `DELETE` | `/api/admin/providers/{name}` | `delete_provider_api_admin_providers__name__delete` | DELETE /api/admin/providers/{name}：删除托管服务商；不存在返回 404（环境内置的服务商不在删除范围内）。 | path name：string，必填<br>header authorization：string，可选；默认值："" | — |
| `PUT` | `/api/admin/providers/{name}` | `update_provider_api_admin_providers__name__put` | PUT /api/admin/providers/{name}：更新服务商；apiKey 留空时保留原 key，防止前端把掩码串回存覆盖真值。 | path name：string，必填<br>header authorization：string，可选；默认值："" | application/json：ProviderBody，必填 |
| `POST` | `/api/admin/providers/{name}/test` | `test_provider_api_admin_providers__name__test_post` | POST /api/admin/providers/{name}/test：用第一个已配模型发一条极短对话实测连通性；连不通不抛错，结果放 success/error 字段。 | path name：string，必填<br>header authorization：string，可选；默认值："" | — |
| `GET` | `/api/admin/roles` | `list_roles_api_admin_roles_get` | GET /api/admin/roles：列出全部角色。 | header authorization：string，可选；默认值："" | — |
| `POST` | `/api/admin/roles` | `create_role_api_admin_roles_post` | POST：创建角色，编码重复返 409。 | header authorization：string，可选；默认值："" | application/json：RoleBody，必填 |
| `GET` | `/api/admin/roles/permissions` | `list_permissions_api_admin_roles_permissions_get` | GET /permissions：全部可分配权限及中文标签（前端勾选框用）。 | header authorization：string，可选；默认值："" | — |
| `DELETE` | `/api/admin/roles/{role_code}` | `delete_role_api_admin_roles__role_code__delete` | DELETE /{role_code}：删除角色；内置角色或使用中会被 store 拒绝（返 400）。 | path role_code：string，必填<br>header authorization：string，可选；默认值："" | — |
| `PUT` | `/api/admin/roles/{role_code}` | `update_role_api_admin_roles__role_code__put` | PUT /{role_code}：更新角色（保留 builtIn 标记），不存在返 404。 | path role_code：string，必填<br>header authorization：string，可选；默认值："" | application/json：RoleBody，必填 |
| `GET` | `/api/admin/system/overview` | `overview_api_admin_system_overview_get` | GET /api/admin/system/overview：平台资源数量总览（员工启停统计等）。 | header authorization：string，可选；默认值："" | — |
| `GET` | `/api/admin/users` | `list_users_api_admin_users_get` | GET /api/admin/users：列出全部用户，附带角色显示名。 | header authorization：string，可选；默认值："" | — |
| `POST` | `/api/admin/users` | `create_user_api_admin_users_post` | POST：创建用户，用户名重复等校验失败返 400。 | header authorization：string，可选；默认值："" | application/json：CreateUserReq，必填 |
| `DELETE` | `/api/admin/users/{username}` | `delete_user_api_admin_users__username__delete` | DELETE /{username}：删除用户，不存在返 404，受保护用户返 400。 | path username：string，必填<br>header authorization：string，可选；默认值："" | — |
| `PUT` | `/api/admin/users/{username}` | `update_user_api_admin_users__username__put` | PUT /{username}：按传入字段增量更新用户信息/密码。 | path username：string，必填<br>header authorization：string，可选；默认值："" | application/json：UpdateUserReq，必填 |
| `GET` | `/healthcheck` | `healthcheck_healthcheck_get` | 存活探针，供容器健康检查。 | — | — |

## 9. 用户端组件模型

### ActivateImageCandidateReq

把已经通过人工验收的历史候选设为当前生产版本。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `image` | string | 是 |  |

### ActivateVideoCandidateReq

把已经通过精品验收的视频候选设为当前生产版本。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `video` | string | 是 |  |

### AddMemberReq

POST /projects/{pid}/members 的请求体：新成员的名称与角色（user_id 缺省则自动生成）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `user_id` | string | 否 | 默认值："" |
| `name` | string | 是 |  |
| `role` | string | 否 | 默认值："editor" |
| `avatar` | string | 否 | 默认值："" |

### AgentRunRequest

一次 agent 运行的入参（POST /api/agent/run 请求体）。<br><br>approval_decision 用于恢复处于待审批状态的会话（approve / reject）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `employeeKey` | string | 是 |  |
| `workflowKey` | string 或 null | 否 |  |
| `userInput` | string | 是 |  |
| `extraContext` | string 或 null | 否 |  |
| `transientContext` | string 或 null | 否 |  |
| `structuredSchemaJson` | string 或 null | 否 |  |
| `modelOverrides` | object 或 null | 否 |  |
| `sessionId` | string 或 null | 否 |  |
| `approvalDecision` | string 或 null | 否 |  |
| `runId` | string 或 null | 否 |  |

### AiProviderBody

POST/PUT /ai-providers 的请求体：AI 供应商配置（名称、endpoint、apiKey、启用状态与模型列表）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 |  |
| `endpoint` | string | 是 |  |
| `apiKey` | string | 是 |  |
| `enabled` | boolean | 否 | 默认值：true |
| `models` | array&lt;object&gt; | 否 | 默认值：[] |
| `apiMode` | string | 否 | 默认值："responses"；可选值：["auto","responses","chat"] |

### ApplyTemplateBody

套用角色模板请求体：目标员工 key 与名字。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `employeeKey` | string | 否 | 默认值："" |
| `employeeName` | string | 否 | 默认值："" |

### ArchiveReq

POST /projects/{pid}/archive 的请求体：要归档的卡片与原因。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `card_ids` | array&lt;string&gt; | 是 |  |
| `reason` | string | 否 | 默认值："孤儿卡：所属 G 单元不存在" |

### ArchiveSessionBody

归档/取消归档会话接口的请求体：archived=True 归档，False 恢复。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `archived` | boolean | 否 | 默认值：true |

### BatchCreateCardReq

POST /projects/{pid}/cards/batch 的请求体：批量新建的卡片列表。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `cards` | array&lt;CreateCardReq&gt; | 是 |  |

### BatchDeleteReq

POST /cards/batch-delete 的请求体：要删除的卡片 ID 列表。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `card_ids` | array&lt;string&gt; | 是 |  |

### BatchMoveReq

POST /cards/batch-move 的请求体：要移动的卡片 ID 列表与目标阶段。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `card_ids` | array&lt;string&gt; | 是 |  |
| `stage` | string | 是 |  |

### BatchUpdateStatusReq

POST /cards/batch-status 的请求体：要更新的卡片 ID 列表与目标状态。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `card_ids` | array&lt;string&gt; | 是 |  |
| `status` | string | 是 |  |

### BindingsBody

员工绑定更新请求体：技能/工具/MCP 引用列表（None 表示不改该项）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `skill_refs` | array&lt;string&gt; 或 null | 否 |  |
| `tool_refs` | array&lt;string&gt; 或 null | 否 |  |
| `mcp_server_refs` | array&lt;string&gt; 或 null | 否 |  |

### Body_import_skill_zip_api_v1_agentapp_system_manager_skills_import_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_inbox_upload_api_v1_agentapp_production_projects__pid__inbox_upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `files` | array&lt;string (application/octet-stream)&gt; | 是 |  |

### Body_upload_asset_api_v1_agentapp_canvas_canvases__cid__upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_card_file_api_v1_agentapp_production_projects__pid__cards__card_id__upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_director_control_asset_api_v1_agentapp_director_projects__project_id__cards__card_id__control_assets_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_file_api_v1_agentapp_agent_upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_knowledge_doc_api_v1_agentapp_registry_employees__key__knowledge_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_strategy_file_api_v1_agentapp_strategyproxy_upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### Body_upload_workbench_asset_api_v1_agentapp_canvas_workbench_assets__project_id__upload_post

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | string (application/octet-stream) | 是 |  |

### CanvasEdge

血缘连线:source 节点生成/派生出 target 节点。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `edge_id` | string | 否 | 默认值："" |
| `source` | string | 否 | 默认值："" |
| `target` | string | 否 | 默认值："" |
| `data` | object | 否 |  |

### CanvasNode

画布节点。data 内容按 type 区分:prompt 存 {prompt},image 存 {url, prompt}。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `node_id` | string | 否 | 默认值："" |
| `type` | string | 否 | 默认值："image" |
| `position` | object | 否 |  |
| `data` | object | 否 |  |

### ConfirmActionBody

确认一次系统变更；proposalId 是管家预览阶段签发的一次性标识。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `proposalId` | string | 是 | minLength=10；maxLength=200 |

### CreateCanvasReq

创建画布请求体：仅画布名。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 否 | 默认值："未命名画布" |

### CreateCardReq

POST /projects/{pid}/cards 的请求体：新建卡片的阶段、标题内容、集数/G 单元号及提示词/素材列表。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `stage` | string | 否 | 默认值："idea" |
| `title` | string | 否 | 默认值："" |
| `content` | string | 否 | 默认值："" |
| `episode` | integer 或 null | 否 |  |
| `shot_number` | integer | 否 | 默认值：0 |
| `prompts` | array&lt;string&gt; | 否 |  |
| `images` | array&lt;string&gt; | 否 |  |
| `videos` | array&lt;string&gt; | 否 |  |
| `metadata` | object | 否 |  |
| `status` | string | 否 | 默认值："pending" |
| `assignee` | string | 否 | 默认值："" |

### CreateCommentReq

新建卡片批注请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `content` | string | 是 | maxLength=4000 |

### CreateProjectReq

POST /projects 请求体：名称、素材、执行方、交付目标及首页置顶状态。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 |  |
| `description` | string | 否 | 默认值："" |
| `source_type` | string | 否 | 默认值："idea" |
| `source_content` | string | 否 | 默认值："" |
| `employee_key` | string | 否 | 默认值："" |
| `team_code` | string | 否 | 默认值："" |
| `episode_count` | integer | 否 | 默认值：0；minimum=0.0；maximum=500.0 |
| `episode_duration_seconds` | integer | 否 | 默认值：90；minimum=5.0；maximum=3600.0 |
| `aspect_ratio` | string | 否 | 默认值："9:16" |
| `visual_style` | string | 否 | 默认值："" |
| `budget` | number | 否 | 默认值：0；minimum=0.0 |
| `production_goal` | string 或 null | 否 |  |
| `pinned` | boolean | 否 | 默认值：false |

### CreateQuickPromptReq

新建常用指令请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | 是 | maxLength=80 |
| `content` | string | 是 | maxLength=10000 |
| `employee_key` | string | 否 | 默认值：""；maxLength=160 |

### CreateVersionReq

手动版本请求；标签和原因均可省略。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `label` | string | 否 | 默认值：""；maxLength=120 |
| `reason` | string | 否 | 默认值：""；maxLength=200 |

### DeriveReq

派生请求:以某个数据节点为源,让数字员工生成下游数据条目。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source_title` | string | 否 | 默认值："" |
| `source_content` | string | 是 |  |
| `source_stage` | string | 否 | 默认值："" |
| `target_stage` | string | 否 | 默认值："" |
| `employee_key` | string | 是 |  |
| `instruction` | string | 否 | 默认值："" |
| `max_items` | integer | 否 | 默认值：12 |

### EmployeeDefinition

数字员工定义：角色画像 + 模型策略 + 技能/工具/MCP 绑定 + 团队归属。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `employeeKey` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `roleProfile` | string | 否 | 默认值："" |
| `deepAgent` | boolean | 否 | 默认值：false |
| `defaultModelPolicy` | object | 否 |  |
| `outputModalities` | array&lt;string&gt; | 否 |  |
| `skillRefs` | array&lt;string&gt; 或 null | 否 |  |
| `toolRefs` | array&lt;string&gt; 或 null | 否 |  |
| `mcpServerRefs` | array&lt;string&gt; 或 null | 否 |  |
| `teamCode` | string 或 null | 否 |  |
| `templateCode` | string 或 null | 否 |  |
| `hasKnowledgeBase` | boolean | 否 | 默认值：false |
| `avatarUrl` | string 或 null | 否 |  |
| `tags` | array&lt;string&gt; | 否 |  |
| `enabled` | boolean | 否 | 默认值：true |
| `source` | string | 否 | 默认值："user" |
| `ownerUserId` | string 或 null | 否 |  |

### EmployeeDraftBody

智能员工草稿请求：用户只需描述想要的岗位，可选指定用于设计草稿的模型。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `roleRequest` | string | 是 | minLength=2；maxLength=1000 |
| `modelId` | string 或 null | 否 |  |

### EnabledBody

启用/停用开关请求体。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `enabled` | boolean | 是 |  |

### EpisodicBody

POST /episodic/{employee_key} 的请求体：新增经验记忆的观察/动作/结果与成功度评分。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `observation` | string | 是 |  |
| `action` | string | 否 | 默认值："" |
| `result` | string | 否 | 默认值："" |
| `successScore` | number | 否 | 默认值：0.5 |

### GenerateCardImageReq

单卡立即生图请求：默认读取卡片 prompts[0]，也允许前端显式传入已编辑提示词。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `model` | string | 是 |  |
| `prompt` | string | 否 | 默认值："" |
| `size` | string | 否 | 默认值："1024x1536" |

### HTTPValidationError

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `detail` | array&lt;ValidationError&gt; | 否 |  |

### ImageGenerateReq

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `model` | string | 否 | 默认值："" |
| `employee_key` | string | 否 | 默认值："" |
| `prompt` | string | 否 | 默认值："" |
| `resolution` | string | 否 | 默认值："1K" |
| `aspect_ratio` | string | 否 | 默认值："9:16" |
| `reference_urls` | array&lt;string&gt; | 否 |  |

### ImagePromptUpdateReq

只更新导演工作流里图片卡片的首条主提示词。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `prompt` | string | 是 |  |

### LearnSource

一个文章学习源：URL 列表 + 目标员工 + 每日定时配置 + 最近运行状态（由运行器回写）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sourceCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `targetEmployeeKey` | string | 否 | 默认值："" |
| `urls` | array&lt;string&gt; | 否 |  |
| `roleHint` | string | 否 | 默认值："" |
| `scheduleTime` | string | 否 | 默认值："02:00" |
| `maxArticles` | integer | 否 | 默认值：10；minimum=1.0；maximum=50.0 |
| `enabled` | boolean | 否 | 默认值：true |
| `lastRunAt` | string (date-time) 或 null | 否 |  |
| `lastStatus` | string | 否 | 默认值："" |
| `lastMessage` | string | 否 | 默认值："" |
| `lastLearnedCount` | integer | 否 | 默认值：0 |
| `totalLearned` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |

### LoginRequest

POST /login 的请求体：用户名与密码。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | string | 是 |  |
| `password` | string | 是 |  |

### ManagerChatBody

系统管家对话请求，pagePath 用于提供当前页面指导。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `message` | string | 是 | minLength=1；maxLength=8000 |
| `pagePath` | string | 否 | 默认值："/"；maxLength=500 |
| `sessionId` | string 或 null | 否 |  |

### MarkReadReq

标记已读的条目 id 列表（POST /digest/read）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `ids` | array&lt;string&gt; | 是 |  |

### McpServerDefinition

MCP 服务器定义：stdio（command+args）或 http（url）两种接入方式。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `serverCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `transportType` | string | 否 | 默认值："stdio" |
| `command` | string 或 null | 否 |  |
| `commandArgs` | array&lt;string&gt; 或 null | 否 |  |
| `url` | string 或 null | 否 |  |
| `env` | object&lt;string, string&gt; 或 null | 否 |  |
| `headers` | object&lt;string, string&gt; 或 null | 否 |  |
| `authType` | string | 否 | 默认值："none" |
| `oauthScope` | string 或 null | 否 |  |
| `description` | string 或 null | 否 |  |

### OAuthCallbackBody

浏览器 OAuth 回调参数。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `state` | string | 是 | minLength=8；maxLength=1000 |
| `code` | string | 是 | minLength=1；maxLength=4000 |

### OAuthStartBody

MCP OAuth 开始请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `redirectUri` | string | 是 | minLength=10；maxLength=1000 |

### OptimizeProjectReq

按当前诊断问题定向返工；一次只处理一个问题，避免大范围覆盖。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `issue_id` | string | 是 | minLength=1；maxLength=64 |
| `extra_instruction` | string | 否 | 默认值：""；maxLength=4000 |

### PipelineRunRequest

POST /run 的请求体：漫剧生产流水线的题材输入，可按员工覆盖 CLI 类型或跳过部分员工。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `theme` | string | 是 | 漫剧题材/梗概 |
| `cli_overrides` | object&lt;string, string&gt; 或 null | 否 | 按员工覆盖 CLI 类型，如 {"comic-screenwriter": "gemini"} |
| `skip_employees` | array&lt;string&gt; 或 null | 否 | 跳过某些员工（employeeKey 列表） |

### PipelineRunResponse

POST /run 的响应体：一次流水线运行的整体结果（输出目录、最终文件、总耗时与各步骤明细）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `runId` | string | 是 |  |
| `theme` | string | 是 |  |
| `outputDir` | string | 是 |  |
| `finalFile` | string 或 null | 否 |  |
| `success` | boolean | 是 |  |
| `totalSeconds` | number | 是 |  |
| `steps` | array&lt;StepInfo&gt; | 是 |  |

### ProceduralBody

POST /procedural/{employee_key} 的请求体：新增行为记忆的规则、依据与置信度。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `rule` | string | 是 |  |
| `rationale` | string | 否 | 默认值："" |
| `confidence` | number | 否 | 默认值：0.5 |

### PromptLearningItem

一条用户已确认采用的画布提示词。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `kind` | string | 否 | 默认值："image_prompt" |
| `title` | string | 否 | 默认值："" |
| `prompt` | string | 是 |  |

### PromptLearningReq

画布采用后学习请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `projectId` | string | 否 | 默认值："" |
| `employeeKey` | string | 否 | 默认值："" |
| `items` | array&lt;PromptLearningItem&gt; | 否 |  |

### ProviderModelBody

追加到供应商模型列表的单个模型。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `modelName` | string | 是 |  |
| `modelId` | string | 是 |  |
| `timeoutMinutes` | integer | 否 | 默认值：20 |

### RefreshReq

POST /refresh 的请求体：要刷新的 query、榜单条数上限与"真实增长"统计的时间窗口（天）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `query` | string | 是 |  |
| `limit` | integer | 否 | 默认值：15 |
| `recentDays` | integer | 否 | 默认值：180 |

### RenameCanvasReq

重命名画布请求体。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 |  |

### ReviewCardImageReq

POST /projects/{pid}/cards/{card_id}/review 的请求体。<br><br>verdict=reject 时 reason 必填且必须在 REVIEW_REJECT_REASONS 枚举内。<br>image 省略时默认评审卡片当前版本（metadata.active_image 或 images[0]）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `verdict` | string | 是 |  |
| `image` | string | 否 | 默认值："" |
| `reason` | string | 否 | 默认值："" |
| `note` | string | 否 | 默认值："" |
| `ratings` | object&lt;string, integer&gt; | 否 |  |
| `promote` | boolean | 否 | 默认值：true |

### ReviewCardVideoReq

评审镜头视频或整集成片；新候选通过时必须提交完整量表。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `verdict` | string | 是 |  |
| `video` | string | 否 | 默认值："" |
| `reason` | string | 否 | 默认值："" |
| `note` | string | 否 | 默认值："" |
| `ratings` | object&lt;string, integer&gt; | 否 |  |
| `promote` | boolean | 否 | 默认值：true |

### RoleTemplateDefinition

角色模板：一键创建员工的预置配方（画像 + 建议技能/工具/MCP）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `templateCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `category` | string | 否 | 默认值："" |
| `description` | string 或 null | 否 |  |
| `roleProfile` | string | 否 | 默认值："" |
| `deepAgent` | boolean | 否 | 默认值：false |
| `defaultModelPolicy` | object | 否 |  |
| `outputModalities` | array&lt;string&gt; | 否 |  |
| `suggestedSkillCodes` | array&lt;string&gt; | 否 |  |
| `suggestedToolCodes` | array&lt;string&gt; | 否 |  |
| `suggestedMcpServerCodes` | array&lt;string&gt; | 否 |  |
| `tags` | array&lt;string&gt; | 否 |  |
| `icon` | string 或 null | 否 |  |
| `source` | string | 否 | 默认值："system" |

### SaveCanvasEngineReq

保存第三方引擎原生 JSON，请求体不绑定某一前端库的数据结构。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `content` | object | 否 |  |

### SaveCanvasReq

保存画布请求体：整体覆盖节点与连线，名字可选改。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string 或 null | 否 |  |
| `nodes` | array&lt;CanvasNode&gt; | 否 |  |
| `edges` | array&lt;CanvasEdge&gt; | 否 |  |

### ScrapeSource

一个提示词采集源：平台(jimeng/xyq) + 目标员工 + 定时配置 + 最近运行状态（由采集器回写）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sourceCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `platform` | string | 否 | 默认值："jimeng" |
| `url` | string | 否 | 默认值："" |
| `targetEmployeeKey` | string | 否 | 默认值："" |
| `scheduleTime` | string | 否 | 默认值："09:00" |
| `maxItems` | integer | 否 | 默认值：40 |
| `enabled` | boolean | 否 | 默认值：true |
| `lastRunAt` | string (date-time) 或 null | 否 |  |
| `lastStatus` | string | 否 | 默认值："" |
| `lastMessage` | string | 否 | 默认值："" |
| `lastNewCount` | integer | 否 | 默认值：0 |
| `totalCollected` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |

### SemanticBody

POST /semantic/{employee_key} 的请求体：新增语义记忆的内容、分类与重要度。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `content` | string | 是 |  |
| `category` | string | 否 | 默认值："fact" |
| `importance` | number | 否 | 默认值：0.5 |

### ShotControlPack

模型无关的单镜头控制协议。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `schema_version` | integer | 否 | 默认值：1 |
| `generation_mode` | string | 否 | 默认值："auto"；可选值：["auto","keyframe","reference"] |
| `shot_type` | string | 否 | 默认值："auto"；可选值：["auto","dialogue","performance","action","camera","establishing","transition"] |
| `first_frame_url` | string | 否 | 默认值：""；maxLength=4096 |
| `last_frame_url` | string | 否 | 默认值：""；maxLength=4096 |
| `references` | array&lt;ShotReference&gt; | 否 | maxItems=30 |
| `storyboard` | string | 否 | 默认值：""；maxLength=12000 |
| `camera_plan` | string | 否 | 默认值：""；maxLength=4000 |
| `performance_plan` | string | 否 | 默认值：""；maxLength=4000 |
| `audio_plan` | string | 否 | 默认值：""；maxLength=4000 |
| `continuity_plan` | string | 否 | 默认值：""；maxLength=4000 |

### ShotOrderReq

镜头排序请求；ordered_units 使用排序前的 G 单元号。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `episode` | integer 或 null | 否 |  |
| `ordered_units` | array&lt;integer&gt; | 是 |  |
| `expected_project_updated_at` | string 或 null | 否 |  |

### ShotReference

一项有明确用途的多模态参考素材。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `reference_id` | string | 否 | 默认值："" |
| `url` | string | 是 | minLength=1；maxLength=4096 |
| `kind` | string | 否 | 默认值："image"；可选值：["image","video","audio"] |
| `role` | string | 否 | 默认值："style"；可选值：["identity","expression","scene","prop","storyboard","performance","motion","camera","blocking","dialogue","sound","continuity","style"] |
| `label` | string | 否 | 默认值：""；maxLength=120 |
| `note` | string | 否 | 默认值：""；maxLength=1000 |
| `priority` | integer | 否 | 默认值：50；minimum=0.0；maximum=100.0 |

### SkillDefinition

技能定义：支持 JSON 技能与只读 SKILL.md 包，并可声明工具/MCP/技能依赖。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `code` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `bindingCode` | string 或 null | 否 |  |
| `summary` | string 或 null | 否 |  |
| `description` | string 或 null | 否 |  |
| `required` | boolean | 否 | 默认值：false |
| `isTree` | boolean | 否 | 默认值：false |
| `children` | array&lt;object&gt; 或 null | 否 |  |
| `sourceType` | string | 否 | 默认值："json" |
| `skillPath` | string 或 null | 否 |  |
| `toolDependencies` | array&lt;string&gt; | 否 |  |
| `mcpDependencies` | array&lt;string&gt; | 否 |  |
| `skillDependencies` | array&lt;string&gt; | 否 |  |

### StepInfo

流水线单步执行结果：员工、所用 CLI、产出文件、耗时与成败信息，嵌在 PipelineRunResponse.steps 中。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `employeeKey` | string | 是 |  |
| `name` | string | 是 |  |
| `cliType` | string | 是 |  |
| `file` | string | 是 |  |
| `success` | boolean | 是 |  |
| `error` | string 或 null | 否 |  |
| `elapsedSeconds` | number | 是 |  |
| `outputLength` | integer | 是 |  |

### TeamDefinition

团队定义：成员列表 + 队长 + 有序角色 + 默认编排工作流。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `teamCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `memberEmployeeKeys` | array&lt;string&gt; | 否 |  |
| `defaultEmployeeKey` | string 或 null | 否 |  |
| `ownerUserId` | string 或 null | 否 |  |
| `leaderEmployeeKey` | string 或 null | 否 |  |
| `description` | string 或 null | 否 |  |
| `roles` | array&lt;TeamRole&gt; 或 null | 否 |  |
| `defaultWorkflowKey` | string 或 null | 否 |  |

### TeamMembersBody

团队成员更新请求体。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `memberEmployeeKeys` | array&lt;string&gt; | 否 |  |

### TeamRole

团队内一个成员的角色标注（阶段分组 + 组内排序）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `employeeKey` | string | 否 | 默认值："" |
| `stage` | string | 否 | 默认值："" |
| `order` | integer | 否 | 默认值：0 |

### TeamRunBody

POST /team-run 的请求体：指定团队编码与用户输入，可携带会话 ID 与额外上下文。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `teamCode` | string | 否 | 默认值："" |
| `userInput` | string | 否 | 默认值："" |
| `sessionId` | string 或 null | 否 |  |
| `extraContext` | string 或 null | 否 |  |
| `runId` | string 或 null | 否 |  |

### ToolDefinition

工具定义：暴露给 agent 的函数调用（input_schema 为 JSON Schema 字符串）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `toolCode` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `bindingCode` | string 或 null | 否 |  |
| `description` | string 或 null | 否 |  |
| `inputSchema` | string 或 null | 否 |  |

### TranslateRequest

标题批量翻译请求体。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `titles` | array&lt;string&gt; | 是 |  |

### UpdateCardReq

PUT /cards/{card_id} 的请求体：全部字段可选，仅更新显式传入的字段。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `stage` | string 或 null | 否 |  |
| `title` | string 或 null | 否 |  |
| `content` | string 或 null | 否 |  |
| `episode` | integer 或 null | 否 |  |
| `shot_number` | integer 或 null | 否 |  |
| `prompts` | array&lt;string&gt; 或 null | 否 |  |
| `negative_prompts` | array&lt;string&gt; 或 null | 否 |  |
| `images` | array&lt;string&gt; 或 null | 否 |  |
| `videos` | array&lt;string&gt; 或 null | 否 |  |
| `metadata` | object 或 null | 否 |  |
| `status` | string 或 null | 否 |  |
| `assignee` | string 或 null | 否 |  |

### UpdateCommentReq

批注解决状态请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `resolved` | boolean | 是 |  |

### UpdateMemberReq

PUT /projects/{pid}/members/{user_id} 的请求体：成员的新角色。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `role` | string | 是 |  |

### UpdateProjectReq

PUT /projects/{pid} 的请求体：全部字段可选，只更新传入的字段。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string 或 null | 否 |  |
| `description` | string 或 null | 否 |  |
| `source_type` | string 或 null | 否 |  |
| `source_content` | string 或 null | 否 |  |
| `employee_key` | string 或 null | 否 |  |
| `team_code` | string 或 null | 否 |  |
| `episode_count` | integer 或 null | 否 |  |
| `episode_duration_seconds` | integer 或 null | 否 |  |
| `aspect_ratio` | string 或 null | 否 |  |
| `visual_style` | string 或 null | 否 |  |
| `budget` | number 或 null | 否 |  |
| `production_goal` | string 或 null | 否 |  |
| `pinned` | boolean 或 null | 否 |  |
| `settings` | object 或 null | 否 |  |

### UpdateQuickPromptReq

修改常用指令请求；只更新显式传入字段。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string 或 null | 否 |  |
| `content` | string 或 null | 否 |  |
| `employee_key` | string 或 null | 否 |  |

### ValidationError

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `loc` | array&lt;string 或 integer&gt; | 是 |  |
| `msg` | string | 是 |  |
| `type` | string | 是 |  |
| `input` | 未声明 | 否 |  |
| `ctx` | object | 否 |  |

### VideoGenerateReq

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `model` | string | 否 | 默认值："" |
| `employee_key` | string | 否 | 默认值："" |
| `prompt` | string | 否 | 默认值："" |
| `duration` | integer | 否 | 默认值：5 |
| `resolution` | string | 否 | 默认值："720p" |
| `aspect_ratio` | string | 否 | 默认值："9:16" |
| `image_url` | string | 否 | 默认值："" |
| `last_frame_url` | string | 否 | 默认值："" |
| `reference_urls` | array&lt;string&gt; | 否 |  |
| `control_pack` | ShotControlPack 或 null | 否 |  |
| `generate_audio` | boolean | 否 | 默认值：true |

### WorkbenchAgentReq

Web 画布 Agent 请求：保留技能、所选员工/模型和项目会话。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `vendor` | string | 否 | 默认值："platform-employee" |
| `modelKey` | string | 否 | 默认值："" |
| `skillKey` | string | 否 | 默认值："" |
| `skillName` | string | 否 | 默认值："" |
| `prompt` | string | 是 |  |
| `systemPrompt` | string | 否 | 默认值："" |
| `requiredTool` | string | 否 | 默认值："" |
| `sessionId` | string 或 null | 否 |  |
| `projectId` | string | 否 | 默认值："" |

### WorkbenchRemoteAssetReq

登记一个远程素材引用；不由服务端抓取，避免把画布接口变成任意 URL 代理。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `url` | string | 是 |  |
| `name` | string | 否 | 默认值："" |
| `ownerNodeId` | string 或 null | 否 |  |

### WorkbenchTaskReq

完整工作台的通用媒体任务请求。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `vendor` | string | 否 | 默认值："openrouter" |
| `kind` | string | 是 |  |
| `prompt` | string | 是 |  |
| `width` | integer 或 null | 否 |  |
| `height` | integer 或 null | 否 |  |
| `extras` | object | 否 |  |

### WorkflowDefinition

工作流定义（DAG）：节点 + 边，复用 RegistryEntity 的 JSON 文件存储。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `sortOrder` | integer | 否 | 默认值：0 |
| `createdAt` | string (date-time) | 否 |  |
| `updatedAt` | string (date-time) | 否 |  |
| `workflowKey` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `description` | string 或 null | 否 |  |
| `teamCode` | string 或 null | 否 |  |
| `nodes` | array&lt;WorkflowNode&gt; | 否 |  |
| `edges` | array&lt;WorkflowEdge&gt; | 否 |  |
| `enabled` | boolean | 否 | 默认值：true |
| `ownerUserId` | string 或 null | 否 |  |

### WorkflowEdge

工作流有向边；source_handle 是 condition 节点的分支标签，普通边为 None。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `edgeId` | string | 否 | 默认值："" |
| `source` | string | 否 | 默认值："" |
| `target` | string | 否 | 默认值："" |
| `sourceHandle` | string 或 null | 否 |  |

### WorkflowNode

工作流节点：类型 + 画布坐标 + 类型相关的松散 config（结构见上方注释）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `nodeKey` | string | 否 | 默认值："" |
| `type` | string | 否 | 默认值："" |
| `name` | string | 否 | 默认值："" |
| `position` | object | 否 |  |
| `config` | object | 否 |  |

### _LearnRequest

单篇文章学习请求体：文章 URL + 可选角色提示。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `url` | string | 否 | 默认值："" |
| `roleHint` | string | 否 | 默认值："" |

### _RunBody

POST /{key}/run 的请求体：工作流启动输入变量字典（键对应 start 节点声明的字段）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `inputs` | object | 否 | 默认值：{} |

### app__api__canvas__GenerateReq

文生图请求体：提示词 + 模型 + 尺寸。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `prompt` | string | 是 |  |
| `model` | string | 是 |  |
| `size` | string | 否 | 默认值："1024x1024" |

### app__api__production__GenerateReq

POST /projects/{pid}/generate 请求体：目标阶段、执行员工与额外生成要求。<br><br>episode 限定生成范围（None=全局资产）：上下文只取该集卡片 + 全局资产，新卡片落到该集。<br>mode 控制落卡方式：append（默认）只追加不动已有卡片；replace 仅删除同阶段**同集数**的旧卡片。<br>漫剧团队按阶段岗位合同路由；其他项目缺省使用项目默认员工。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `target_stage` | string | 是 |  |
| `employee_key` | string | 否 | 默认值："" |
| `extra_instruction` | string | 否 | 默认值："" |
| `episode` | integer 或 null | 否 |  |
| `shot_number` | integer 或 null | 否 |  |
| `mode` | string | 否 | 默认值："append" |

## 10. 管理端组件模型

### CreateUserReq

用户创建请求体：用户名/密码/显示名/角色/启用状态。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | string | 是 |  |
| `password` | string | 是 |  |
| `displayName` | string | 否 | 默认值："" |
| `role` | string | 否 | 默认值："viewer" |
| `enabled` | boolean | 否 | 默认值：true |

### HTTPValidationError

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `detail` | array&lt;ValidationError&gt; | 否 |  |

### LoginRequest

登录请求体：平台用户名 + 明文密码（仅传输用，服务端只存哈希）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | string | 是 |  |
| `password` | string | 是 |  |

### ProviderBody

服务商保存/更新请求体：apiKey 传空串表示"沿用已存的旧 key"（配合前端只显示掩码）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 |  |
| `endpoint` | string | 是 |  |
| `apiKey` | string | 否 | 默认值："" |
| `enabled` | boolean | 否 | 默认值：true |
| `models` | array&lt;object&gt; | 否 | 默认值：[] |
| `apiMode` | string | 否 | 默认值："responses"；可选值：["auto","responses","chat"] |

### RoleBody

角色创建/更新请求体：编码、名称、描述与权限列表。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `roleCode` | string | 是 |  |
| `name` | string | 是 |  |
| `description` | string | 否 | 默认值："" |
| `permissions` | array&lt;string&gt; | 否 | 默认值：[] |

### UpdateUserReq

用户更新请求体：全部字段可选，传了才改（含改密）。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `displayName` | string 或 null | 否 |  |
| `role` | string 或 null | 否 |  |
| `enabled` | boolean 或 null | 否 |  |
| `password` | string 或 null | 否 |  |

### ValidationError

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `loc` | array&lt;string 或 integer&gt; | 是 |  |
| `msg` | string | 是 |  |
| `type` | string | 是 |  |
| `input` | 未声明 | 否 |  |
| `ctx` | object | 否 |  |
