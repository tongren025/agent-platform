# Nomi Harness 框架选型调研报告

> 方法：三路并行调研 agent（多智能体框架对比 + 共享状态协调机制 + 人在环模式 + AI 创作 Pipeline），全部基于可引用来源（arxiv/GitHub/官方文档/生产案例）。
> 服务于：「人 + 多个 AI 角色在共享创作状态上分工协作共创长片/动画」的本地优先创作工作台。

---

## 一、主流多智能体框架核心对比

### 状态共享模型（最关键维度）

| 框架 | 状态共享模型 | 多角色共享同一份状态 | HITL | Stars | 生产验证 |
|---|---|---|---|---|---|
| **LangGraph** | TypedDict 共享图状态（黑板） | ✅ 原生，所有节点共享 StateGraph | ⭐⭐⭐ 最强，interrupt+checkpoint+time-travel | 34.4k | Klarna/Replit/Elastic，3450万/月 PyPI |
| **Google ADK** | prefix-scoped Session State（黑板变体） | ✅ session.state 共享 + 作用域控制 | ⭐⭐⭐ 强（Vertex 托管） | 15.6k | Google Agentspace/CES 自有产品 |
| **MetaGPT** | 发布-订阅消息池（弱化黑板） | ⚠️ 全量消息可读，非结构化可写 | ⭐ 弱 | 68.7k | 学术强，商业早期 |
| **CrewAI** | 消息链 + 多层记忆 | ⚠️ 共享知识库，非原生 | ⭐⭐ 中 | 52.4k | PwC/Fortune 500（多为 POC） |
| **AutoGen** | 消息总线 + Orchestrator 账本 | ❌ 需外接 state container | ⭐ 弱（open feature request） | 58.8k | **主仓库进入维护模式** ⚠️ |
| **OpenAI Agents SDK** | 消息传递 + RunContext（LLM不可见） | ❌ 不原生 | ⭐⭐ 中 | 27.1k | Coinbase AgentKit |

**关键发现**：
- 黑板/共享状态架构相比纯消息传递，在复杂推理任务有 13–57% 性能提升（Han et al. 2025，arXiv:2510.01285）
- **LangGraph** 是唯一集齐"共享状态 + 持久化 checkpoint + 成熟 HITL + 生产验证"四项的框架
- **AutoGen 主仓库进入维护模式**，是重要风险信号，不应作为新项目基础
- 所有框架都是 **Python 为主**（部分有 TypeScript），与 Nomi 的 Electron/TypeScript 技术栈**不直接兼容**

---

## 二、共享创作状态的协调机制

### 各机制核心评估

**Yjs CRDT（最成熟，已验证）**
- 原理：操作交换律保证任意顺序合并收敛，Y.Text/Y.Map/Y.Array 覆盖主要数据类型
- 验证：tldraw.com（50 并发编辑者）、BlockSuite/AFFiNE（11k stars）、Kinetiq（2025 生产）
- **AI agent 作为 CRDT peer**：Electric.ax 2026-04 生产实现——agent 在服务端持独立 Y.Doc，工具集：`get_document_snapshot → search_text → start_streaming_edit`，agent presence/cursor 对人类全透明
- CodeCRDT 论文（arXiv:2510.18893）：5 agents 压力测试，收敛延迟 < 200ms，零字符级冲突
- 局限：树结构 reparent 需额外保护；语义冲突（5–10%）仍需应用层处理

**属性级 LWW + 中心服务端（Figma 模式）**
- 适合：画布节点的离散属性（位置/尺寸/参数），属性级天然不冲突
- Figma 处理 >22 亿变更/天，但 AI 并发写同属性时 LWW 失控（Figma 后来补了 OT 修补）

**Event Sourcing（最适合审计）**
- 所有操作不覆盖写，追加事件日志；当前状态 = reduce(events)
- Linear 生产验证：事件结构 `{uuid, attribute, value, syncId}`
- 与 CRDT 并行运作：CRDT 做冲突解决，Event Log 做操作历史/审计/版本回溯
- AI agent 操作天然产生可审计的事件记录

**Local-first 架构**
- 本地副本是主副本，后台异步同步；读写 0ms 响应
- Nomi 本已是 local-first（Electron，项目存本地）——这不是要额外引入的技术，是已有的设计哲学

---

## 三、AI 创作 Pipeline 的架构启示

### 真实 AI 影视/动画创作多 agent 项目

**MAViS（arXiv:2508.08487，2025-08）** — 六阶段全链路
```
剧本(3 reviewer 迭代) → 分镜设计(7要素) → 角色LoRA → 关键帧 → 视频片段 → 语音配乐
```
- **3E 原则**（每阶段统一迭代范式）：Explore→Examine→Enhance，可直接复用为 Nomi agent 内部循环
- 单 LoRA 覆盖整部脚本锁定角色一致性（MUDI 框架）

**MovieAgent（arxiv:2503.07314，showlab，开源）** — 三层 CoT
```
Director Agent（5步CoT）→ Scene Plan Agent → Shot Plan Agent → 生成模块
```
- **Character Bank 贯穿全 pipeline**，与 Nomi 角色卡设计高度同构
- 三层分工（文案→场景→镜头）= Nomi 的「创作→拆镜头→画布节点」

**FilmAgent（arXiv:2501.12909，SIGGRAPH Asia 2024）** — 4 角色 Debate-Judge
- 发现：协调良好的多 agent（GPT-4o，3.98/5）**超越更强的单一模型**（o1）
- 不同任务用不同协作协议：写作用 Critique-Correct-Verify，摄影决策用 Debate-Judge

**ScriptAgent（Tencent，arXiv:2601.17737，2026-01）** — 带 CriticAgent 闭环
- CriticAgent 同时评估脚本质量 + 视频保真度，形成反馈闭环防止下游错误积累

**ComfyUI**（GitHub 13k stars）
- DAG 计算图 + 智能缓存（只重跑变更节点及下游）
- 工作流 JSON 嵌入图像 metadata，自描述可复现
- 与 Nomi 差异：ComfyUI 面向技术用户，Nomi 在其上增加「创作意图层」

---

## 四、选型结论（为 Nomi 具体场景）

### Nomi 的约束
- Electron + TypeScript + React Flow + Zustand（前端技术栈，非 Python）
- 多供应商生成模型（非绑定单一 LLM）
- 本地优先，用户资产不出本机
- 目标：人 + 多个 AI 角色协作共创

### 结论：**不采用任何现有框架，自建 model-agnostic harness 内核**

原因（逐条证据支撑）：

1. **技术栈不兼容**：所有主流框架（LangGraph/CrewAI/AutoGen/ADK）都是 Python 优先。在 Electron TypeScript 中嵌入需要子进程/HTTP 桥接，引入进程边界、序列化开销和额外复杂度——你已经在 Claude Agent SDK 评估时踩过这个坑（spawn native binary 在 Electron 的 asar 打包问题）。

2. **P4 通用第一，LangGraph 绑 LangChain 生态**：LangGraph 虽然架构最接近，但与 LangChain 强耦合，而你的多供应商生成模型（GPT Image 2/即梦/可灵/Veo）走 Vercel AI SDK，混用两套会制造双真相源（违反 P1）。

3. **Nomi 的核心状态已经是 Zustand**：你的画布节点、项目、角色卡全在 Zustand store。最合理的方式是把 harness 的「共享创作状态」**直接建在 Zustand 之上**，而不是引入外部框架的状态系统再做同步。

4. **HITL 已有成熟的原语，可以直接借鉴不依赖框架**：LangGraph 的 `interrupt()/checkpoint` 模式是可以独立实现的设计模式（不依赖 LangGraph 运行时），Temporal 的 Signal 模式也是如此。你已有的 `awaitToolConfirmation` 是同一个抽象的雏形。

5. **你已经有最难的部分**：Vercel AI SDK（E 循环）+ canvasTools（T）+ AgentPlanCard（L 雏形）+ agentChatHarness（纯函数帮手）——**这就是一个自有 harness 的骨架**，需要的是组织和补全，不是换框架。

### 借鉴什么（不照搬，借设计）

| 从哪借 | 借什么 | 不借什么 |
|---|---|---|
| **LangGraph** | StateGraph 的「reducer 合并共享状态」模式、interrupt/checkpoint 的 HITL 设计 | LangChain 生态依赖、Python 运行时 |
| **Yjs CRDT** | 多角色共享同一份 Y.Map/Y.Array 的协调机制（特别是「agent as CRDT peer」Electric.ax 模式）| 不一定要真正引入 Yjs，Zustand immer 可以先承担；待多人协作时再评估 |
| **Event Sourcing（Linear 模式）** | 操作日志 = 审计 trail = 版本回溯 = AI 操作可撤销的地基 | 不需要完整的 EventStore 基础设施，用 append-only 日志先走 |
| **MAViS/MovieAgent** | 3E 迭代范式（Explore/Examine/Enhance）、Character Bank 贯穿 pipeline、Director/Scene/Shot 三层 CoT | 具体的模型调用实现（那是生成层，不是 harness 层）|
| **ComfyUI** | DAG 智能缓存（只重跑变更节点）、工作流自描述 metadata | 技术用户优先的 UX |
| **FilmAgent** | 不同任务用不同协作协议（写作 vs 创意决策用不同的 agent 交互模式）| 仅用于 AI 创作团队内部协作时 |

---

## 五、Nomi Harness 内核的推荐核心抽象

基于调研，推荐三个核心抽象作为 harness 内核的骨架：

### 抽象 1：共享创作状态（Shared Creative State）
```typescript
// 所有角色（人+AI）共享同一份状态，类似 LangGraph 的 TypedDict StateGraph
// 但建在 Zustand 之上，不引入外部框架
type SharedCreativeState = {
  // 项目级真相源（已有）
  nodes: GenerationCanvasNode[]    // 画布节点
  edges: GenerationCanvasEdge[]    // 连接边
  // 新增：协作治理层
  operationLog: Operation[]        // Event Sourcing 日志（审计/回滚/对账）
  projectMemory: ProjectMemory     // 角色卡/风格/设定（Nomi 版 CLAUDE.md）
  pendingProposals: Proposal[]     // 待批准的变更提议（计划事务）
}
```

### 抽象 2：角色（Role）— 统一人和 AI
```typescript
// 不区分人和 AI——都是能「提议→执行」写操作的角色
type CreativeRole = {
  id: string
  kind: 'human' | 'ai-agent'
  name: string               // "导演 Agent" / "你" / "定妆 Agent"
  capabilities: Capability[] // 这个角色能做什么（T 工具注册）
  memory: RoleMemory         // 角色专属记忆（选读，项目记忆是共享的）
}
```

### 抽象 3：提议事务（Proposal Transaction）— 簇 A 的骨架
```typescript
// AI 的任何写操作都是一笔事务，经过三态流转
type Proposal = {
  id: string
  proposedBy: CreativeRole
  operations: Operation[]          // 要做的具体操作（建节点/改参数/连边）
  status: 'proposed' | 'approved' | 'committed' | 'rolled-back'
  approvedBy?: CreativeRole        // 谁批准的
  committedSnapshot?: StateSnapshot // 执行后快照（用于回滚）
  costEstimate?: CostEstimate      // 生成前成本预估（N9）
}
// 事务状态机：proposed→(批准→committed | 拒绝→rolled-back)
// 每个 committed 事务 = 一个 undo 快照点（簇 D 撤销的地基）
```

这三个抽象统一了：
- 簇 A（计划—批准—执行） = Proposal 事务
- 簇 D（撤销）= 每笔 committed Proposal 是一个快照点
- 簇 E（记忆）= SharedCreativeState.projectMemory
- 将来的多人/多 AI 协作 = 加更多 CreativeRole，不改架构

---

## 六、实现路径

**近期（复用调研成果，现在的代码库）**：
- `AgentPlanCard` = Proposal 事务的 UI（已在做）
- `applyCanvasToolCall` = Proposal.committed 的执行器（已有，加日志）
- `agentChatHarness.ts` = 提炼成 harness 内核的帮手层

**中期（引入协调机制）**：
- Operation Log（Event Sourcing，append-only）= 审计 + 撤销的地基
- ProjectMemory（Nomi 版 CLAUDE.md）= 记忆层（简单先用 JSON，不用向量数据库）

**长期（多角色协作时）**：
- 评估 Yjs 作为多角色共享状态的协调层（取代 Zustand 纯 local state）
- Character Bank 贯穿 pipeline（角色卡 = pipeline 级别的不变参数）

---

## 附：参考来源

- LangGraph：https://github.com/langchain-ai/langgraph（34.4k stars）
- Google ADK：https://github.com/google/adk-python（15.6k stars）
- Yjs：https://github.com/yjs/yjs
- Electric.ax AI agents as CRDT peers：https://electric.ax/blog/2026/04/08/ai-agents-as-crdt-peers-with-yjs
- CodeCRDT：arXiv:2510.18893
- Figma multiplayer：https://www.figma.com/blog/how-figmas-multiplayer-technology-works/
- Local-first software：https://www.inkandswitch.com/local-first-software/
- MAViS：arXiv:2508.08487
- MovieAgent：https://github.com/showlab/MovieAgent（arXiv:2503.07314）
- FilmAgent：arXiv:2501.12909（SIGGRAPH Asia 2024）
- ScriptAgent (Tencent)：arXiv:2601.17737
- LangGraph HITL：https://docs.langchain.com/oss/python/langgraph/interrupts
- LLM Multi-Agent Blackboard：arXiv:2510.01285
- Han et al. 共享黑板性能提升：13–57%（同上）
