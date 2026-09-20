# 项目知识库

本目录是 agent-platform 的可检索知识库，面向后续开发、排障和产品问答。

## 使用方式

先看 INDEX.md 按主题定位，再阅读专题文档。提问时可以直接使用自然语言，例如：

- “用户端 API 从哪里启动？”
- “Redis 不可用时任务会怎样？”
- “新增一个 API 路由要改哪些文件？”

## 内容分层

| 文档 | 内容 |
|---|---|
| FEATURES.md | 面向业务的功能大全、页面入口、输入产出和能力边界 |
| INDEX.md | 主题索引、关键词和入口文件 |
| ARCHITECTURE.md | 系统边界、模块关系和请求流 |
| OPERATIONS.md | 启动、配置、队列、数据库和排障 |
| API.md | 用户端与管理端 API 入口 |
| DATA.md | JSON/PostgreSQL 双存储和数据目录 |
| FAQ.md | 高频问题的直接答案 |
| MODULES.md | 模块边界、业务领域和推荐阅读顺序 |

## 维护规则

1. 行为、接口或配置变更时，同步更新对应专题文档。
2. 每个新模块至少补充“用途、入口、依赖、持久化位置、常见故障”。
3. 文件名使用大写主题名；索引中的路径必须指向仓库内真实文件。
4. 不把运行日志、缓存、构建产物和密钥写入知识库。

## 事实来源

知识库以当前源码、README.md、AGENTS.md、docker-compose*.yml、迁移文件和测试为准；发生冲突时以源码和测试行为为准。

## 本地检索与新鲜度检查

知识库提供无外部依赖的本地检索器：

- python -m scripts.project_kb search "Redis 队列"：返回专题、路径和行号。
- python -m scripts.project_kb search "新增 API" --json：供脚本或 Agent 消费 JSON。
- python -m scripts.project_kb check：检查源码和文档是否偏离已记录基线。
- python -m scripts.project_kb refresh：人工核对文档后更新基线。

检索实时读取 docs/knowledge 和选定的 docs 手册；源码哈希只用于提醒文档可能过期，不会把源代码内容复制进索引。
