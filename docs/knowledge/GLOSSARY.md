# 术语表

- Agent：带模型、提示词、工具和记忆能力的执行单元。
- Runtime snapshot：一次运行时把员工配置解析后的技能、工具、MCP 和模型策略快照。
- Prompt compile：把快照和上下文编译成最终 system prompt。
- MCP：模型上下文协议，用于连接外部工具或服务。
- arq：基于 Redis 的 Python 异步任务队列。
- Store：业务数据读写抽象，可由 JSON 或 PostgreSQL 实现。
- SPA fallback：前端深链接找不到静态文件时返回 index.html。
- Checkpoint：Agent 中断或继续运行时保存的消息、文件和 todos 状态。
- 生产项目：production 模块管理的剧本、镜头、素材和生成任务。
- 知识库：本目录下的结构化文档集合；data/knowledge/ 是运行时业务数据，二者用途不同。
