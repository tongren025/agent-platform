# API 入口地图

## 用户端 API（主入口：`app/main.py`）

用户端 router 位于 `app/api/`，默认前缀为 `/api/v1/agentapp`；另有独立的 `/api/v1/pipeline` 流水线路由。应用入口在启动时挂载各 router，并提供 `/healthcheck`。

| 领域 | 源码入口 | 路由前缀/说明 |
|---|---|---|
| Agent 对话与运行 | `app/api/agent.py` | `/api/v1/agentapp/agent`：员工列表、运行、流式运行、团队运行 |
| 会话、运行记录、配额 | `sessions.py`、`runs.py` | 同上 `/agent` 前缀 |
| 模型供应商 | `ai_providers.py` | `/api/v1/agentapp/agent/ai-providers`、模型同步和测试 |
| 注册表 | `registry.py`、`skills.py` | `/api/v1/agentapp/registry`、`/skills`：员工、团队、角色、技能、工具、MCP、工作流 |
| 画布与工作台 | `canvas.py` | `/api/v1/agentapp/canvas`：画布项目、节点、任务和快照 |
| 制作生产 | `production.py` | `/api/v1/agentapp/production`：项目、卡片、素材上传、阶段生成和媒体验收 |
| 工作流编排 | `workflow.py`、`app/services/workflow_executor.py` | `/api/v1/agentapp/workflow`：定义、节点类型、运行和运行历史 |
| Redis Agent 任务中心 | `tasks.py`、`app/core/queue.py` | `/api/v1/agentapp/tasks`：入队、状态、取消、重试 |
| 知识与记忆 | `knowledge_graph.py`、`memory_api.py` | `/knowledge-graph`、`/memory` |
| 采集、趋势、进化 | `scrape.py`、`trend_sources.py`、`evolution.py` | 各自以 `/api/v1/agentapp/` 下领域名为前缀 |
| 流水线与导演 | `pipeline.py`、`director.py` | `/api/v1/pipeline`、`/api/v1/agentapp/director` |
| 系统管家与辅助功能 | `system_manager.py`、`quick_prompts.py`、`strategy_proxy.py` | 系统指导、快捷提示、策略代理 |

前端调用封装在 `web/src/api.ts`，页面/组件在 `web/src/pages/`、`web/src/components/`；主前端是 React + Vite + antd。

## 管理端 API（主入口：`admin/main.py`）

管理端使用独立进程和 `/api/admin/*` 前缀，两端共用 token 签名实现与用户存储；受保护管理操作实时要求当前账号启用且具备 `system:admin` 权限：

- `admin/api/auth_api.py`：`/api/admin/auth` 登录与当前管理员；
- `users.py`、`roles.py`：平台用户、角色和权限；
- `providers.py`：AI 供应商治理；
- `system.py`：`/api/admin/system/overview` 系统概览。

管理端前端调用封装在 `web/src/adminApi.ts`。浏览器分别保存两端会话并隔离失效状态；相同密钥和用户存储下 token 可跨服务校验，实际操作仍由当前权限决定。完整参数与模型见 [API_REFERENCE.md](../API_REFERENCE.md)。

## 新增 API 检查清单

1. 在对应 router 定义请求/响应模型并校验输入。
2. 复用既有鉴权、限流、项目成员校验和错误处理依赖。
3. 确认 `app/main.py` 或 `admin/main.py` 已挂载 router，避免“代码存在但 404”。
4. 更新 `web/src/api.ts` 或 `adminApi.ts` 的类型与调用方。
5. 在 `tests/test_api_contract.py`、领域测试或 `tests/test_admin_proxy.py` 补充验证。
6. 行为、接口或配置变化同步更新 `docs/CHANGELOG.md` 和本知识库。
