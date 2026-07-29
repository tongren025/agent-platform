# Yuxi Runtime 集成边界

## 当前阶段

已完成上游源码快照引入和四项增量接入：MCP 工具执行桥接、SKILL.md 技能包发现、
Skill 依赖闭包和 DeepAgent 本地 checkpoint。
没有替换 Agent Platform 的 DeepAgent、Skill/MCP 配置或本地工具，也没有把 Yuxi
服务加入根目录 `docker-compose.yml`。

当前原则不是运行第二套 Yuxi 内核，而是把上游当作固定代码来源库：逐项确认缺口，
只把成熟实现接到现有模块，每项独立测试、独立提交，随时可按 Git 提交回退。

## 已接入能力

### MCP 工具执行桥接

- 后台已有的 MCP 服务定义和员工 `mcpServerRefs` 继续作为唯一配置来源。
- 员工未绑定 MCP 时，不导入 MCP SDK、不启动 stdio 子进程、不建立 HTTP 连接。
- 绑定后按需连接 `stdio`、Streamable HTTP 或 SSE 服务，发现工具并转换成现有
  `ToolHandler`，不改写 AgentLoop 协议。
- 工具名使用 `mcp__服务__工具` 命名空间，避免覆盖现有本地工具。
- 工具声明按完整服务配置哈希缓存；配置变化后自然失效。
- 每个服务独立加载和关闭，一个服务故障不会影响其他 MCP 服务或本地工具。

实现来源：`backend/package/yuxi/agents/mcp/service.py`。本地适配层没有搬入
Yuxi 的 PostgreSQL Repository 或 LangChain 运行栈。

### SKILL.md 技能包发现

- 现有 JSON Skill 注册表仍是可编辑配置层，目录型 `SKILL.md` 作为只读来源补充。
- 同 code 时 JSON 优先，不覆盖、不删除、不迁移技能包目录或链接。
- 复用 Yuxi frontmatter 解析与 slug 校验，读取 name、description 及工具/MCP/
  Skill 依赖元数据；单个包损坏只隔离该包。
- 继续使用平台原有 `get_skill_detail` 工具按需读取完整正文；系统提示词只展示摘要，
  树形 Skill 也不再预注入子技能全文。

实现来源：`backend/package/yuxi/agents/skills/service.py` 与
`backend/package/yuxi/agents/middlewares/skills.py`。本地适配不包含 Yuxi 的
数据库权限、远程安装器或 LangGraph Middleware。

### Skill 依赖闭包

- 员工绑定根 Skill 后，运行时按配置顺序展开其 `skillDependencies`。
- 闭包内的 `toolDependencies` 与 `mcpDependencies` 追加到员工现有显式绑定，
  显式绑定优先并保持去重。
- 缺失依赖和循环依赖只告警并跳过问题边，不让整个员工快照失败。
- 解析只发生在内存快照中，不反写员工、Skill、工具或 MCP 的 JSON 配置。

实现来源：`backend/package/yuxi/agents/middlewares/skills.py` 中的
`expand_skill_closure`、dependency map 与 fail-soft 设计。

### DeepAgent 本地 checkpoint

- 复用 Yuxi `extract_agent_state` 的显式状态边界，只持久化 `todos/files`，不保存
  模型隐藏推理，也不把待审批信息混进工作区状态。
- checkpoint 以版本化对象写入现有 `ConversationSession.metadata`；同一会话的
  下一轮在工具 handler 装配前恢复，主代理和子代理继续共享同一状态对象。
- 默认使用现有一会话一 JSON 文件；后台启用 PostgreSQL 会话仓储时，同一 metadata
  字段自动落入 JSON 列，不新增表或迁移。
- 未知版本或损坏字段安全降级为空状态；普通员工不创建 checkpoint，现有路径不变。

实现来源：`backend/package/yuxi/services/chat_service.py` 中
`extract_agent_state` / checkpoint state view 的数据边界。本地适配没有搬入
LangGraph、`AsyncPostgresSaver` 或 Redis，而是接入平台已有会话仓储。

## 目标职责

后续继续从 Yuxi 筛选可补齐的通用 Agent Harness 能力：

- Agent Context 与中间件
- 请求排队、AgentRun、Steer、取消和恢复
- 更完整的运行恢复、Steer 与工具审批
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
