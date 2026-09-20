# 故障排查矩阵

| 现象 | 检查 | 处理 | 验证 |
|---|---|---|---|
| 8000 无响应 | app 日志、端口、.env | 修正导入或配置后重启 | /healthcheck 返回成功 |
| 8001 登录失败 | admin token、ADMIN_* 配置 | 清理旧 token，确认管理端进程 | /api/admin/auth/me |
| API 返回 401 | 用户端会话和 USER_API_AUTH | 重新登录，检查鉴权中间件 | 同一请求带有效 token |
| API 返回 403 | 角色权限和路由依赖 | 调整角色权限或使用正确账号 | 权限接口与目标 API 一致 |
| 队列 QueueUnavailable | REDIS_URL、Redis、worker | 启动 Redis 和 worker；等待熔断窗口 | 任务从 queued 进入 in_progress |
| 任务长期 queued | worker 日志、queue_name | 确认 worker 与 API 队列名一致 | 任务有 started_at/进度 |
| DB 迁移失败 | DATABASE_URL、alembic current | 先修连接，再升级 head | alembic current 到最新 |
| 前端 404/空白 | Network、wwwroot、SPA fallback | 重建前端并同步静态资源 | 深链接刷新仍能打开 |
| 画布生成被阻塞 | 上游节点、循环、缺 prompt | 修复依赖边和提示词 | 依赖波次计划无 blocked |
| 模型调用失败 | 供应商 endpoint、API key、model_id | 检查 AI provider 配置和 fallback | provider:model 能解析并返回 |

排查时记录时间、请求路径、run_id/task_id 和相关日志，避免只凭 UI 错误猜测。
