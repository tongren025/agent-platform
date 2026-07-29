# Yuxi Runtime 集成边界

## 当前阶段

当前仅完成上游源码快照引入，尚未替换 Agent Platform 现有运行链，也未把 Yuxi
服务加入根目录 `docker-compose.yml`。这样可以先独立验证，随时通过切换 Git 分支
回到原系统。

## 目标职责

Yuxi Runtime 后续负责通用 Agent Harness 能力：

- Agent Context 与中间件
- 请求排队、AgentRun、Steer、取消和恢复
- LangGraph checkpoint 与工具审批
- Skills、MCP、工具门控和子智能体生命周期
- 工作区、沙盒文件系统和 Artifact 交付
- 上下文压缩、运行事件和 Agent 评估

Agent Platform 继续负责垂直漫剧业务：

- 项目、剧集、镜头和生产卡片
- 角色、场景、视觉母版和资产血缘
- 图片/视频模型路由、费用确认和媒体任务
- 审片、返工、完整性检查和成片合成
- 可视化生产 DAG 与用户端 React 工作台

## 运行模式

Yuxi Runtime 的基础设施必须是可选增强项，不能成为单人使用的启动前置条件。
后台配置决定实际启用的存储和执行能力：

| 后台配置 | 未配置时 | 配置后 |
| --- | --- | --- |
| PostgreSQL | 会话、运行记录、记忆和配置使用 JSON/Markdown/本地文件 | 切换到数据库仓储、事务和并发保护 |
| Redis | 使用进程内执行、轮询或本地事件记录 | 启用持久任务队列、跨进程事件、取消和恢复 |
| MinIO | 上传与产物保存在本地项目/线程目录 | 使用对象存储 |
| Milvus / Neo4j | 使用现有 pgvector/关键词检索，或不启用图谱 | 启用重型知识库和知识图谱 |

默认的单人模式应当做到：

- 不要求 PostgreSQL、Redis、MinIO、Milvus 或 Neo4j。
- 不配置任何外部基础设施也能启动、对话、调用工具和保存工作成果。
- 配置、会话、记忆和运行摘要可直接检查、备份与迁移。
- 后续填写增强配置时，不改变用户端 API 和生产数据模型。

Agent Platform 可以直接在进程内使用经过筛选的 Yuxi Agent 内核；需要独立扩容时，
再切换为 Yuxi `LITE_MODE` 服务，通过 API Key 调用 `agent-invocation` 接口，并保存
`run_id`、`thread_id` 和 Artifact 映射。

默认单人模式不启用：

- Milvus、Neo4j 和知识图谱
- Dify、Notion 等外部知识源
- 重型 OCR/文档解析服务
- 多租户、部门和组织架构接管
- Yuxi Vue 前端替换现有 React 前端

这些能力保留在源码中，由后台配置按需开启，不通过删除代码裁剪。

## 上游修改约束

- 初始验证期间不直接改写 Yuxi 运行内核。
- 无关工具通过 Agent 资源允许列表和 Skill 配置关闭，不通过删除源码关闭。
- 必须修改上游时，单独记录补丁目的、涉及文件和对应上游提交。
- 现有图片、视频、生产和成本治理仍以 Agent Platform 为事实来源。
