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

## 第一阶段运行边界

优先以 Yuxi `LITE_MODE` 独立运行，使用独立的 PostgreSQL 数据库（或 schema）、
Redis 命名空间和文件存储。Agent Platform 通过 Yuxi API Key 调用
`agent-invocation` 接口，保存 `run_id`、`thread_id` 和 Artifact 映射。

第一阶段不启用：

- Milvus、Neo4j 和知识图谱
- Dify、Notion 等外部知识源
- 重型 OCR/文档解析服务
- 多租户、部门和组织架构接管
- Yuxi Vue 前端替换现有 React 前端

## 上游修改约束

- 初始验证期间不直接改写 Yuxi 运行内核。
- 无关工具通过 Agent 资源允许列表和 Skill 配置关闭，不通过删除源码关闭。
- 必须修改上游时，单独记录补丁目的、涉及文件和对应上游提交。
- 现有图片、视频、生产和成本治理仍以 Agent Platform 为事实来源。
