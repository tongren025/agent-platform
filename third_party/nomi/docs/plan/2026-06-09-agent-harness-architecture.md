# Nomi Agent Harness 架构定义与演进方案

> 触发：重型完整架构评审（用户拍板「走完整架构评审」）。
> 流程：阶段0 调研 → 阶段1 起草 → **阶段2 6 角色+对抗评审（已完成，结论见 §A）** → **阶段3 决策回填（已拍板，见 §B）** → 阶段4 bug① 实现规范+样张（进行中）。
> 理论框架：六组件治理模型 H = (E, T, C, S, L, V)（《大语言模型智能体测试框架：综述》2026）。

---

## A. 阶段2 评审结论（7 视角，3 个颠覆性发现）

评审推翻了初稿的部分设计，以下为采纳后的结论：

### A1. bug① 的真前提被初稿跳过：agent 现在不「选模型」
参数是 **(模型 × 模式 × 供应商)** 三元组的属性（`seedance.ts` 一模型 3 模式，resolution 随模式变；`index.ts:98` 再按 vendor 换整组 params）。但 agent 调 `create_canvas_nodes`（`canvasTools.ts:31-40`）那一刻**没有模型被选中**——`GenerationCanvasNode`（`generationCanvasTypes.ts:95`）无 `modelKey` 字段，模型落在 `node.meta.modelKey`+`node.meta.archetype.modeId`，由 `useNodeModelAutoSelect` 在节点创建**之后**自动选。
→ **「让 agent 配参数」的前提是「让 agent 先选模型」**，这是比「加参数槽」更上游的决策。

### A2. partial ghost 流式预渲染 → 改为「计划清单卡」
- 真实用户要的是**事前看清单确认**，不是看节点逐个长出来。
- 对抗+CTO+前端+后端证明：partial ghost 与现有**确认门**（`agentChatV2.ts:235` `awaitToolConfirmation`）正面冲突——确认前画节点，abort / `experimental_repairToolCall` 改写 / 用户拒绝 三路径下 ghost 无法回收 = 幽灵节点 + 双真相源（违反 P1）。
- **正解**：强化已有 `AgentPlanCard`（`summarizeAgentPlan` 已把 create+connect 折叠成卡）为**计划清单卡**——agent 列出「建哪些节点 + 每个建议模型/比例/清晰度」，用户看到、可改、确认才落地。一举解决「AI 能配 + 你能看 + 你能改 + 你能事前拍板」，且绕开流式坑。

### A3. bug②③ 是纯 bugfix，复杂度比 bug① 低一个量级
- **bug② 卡顿**：根因是 `generationCanvasTools.ts:62` `nodes.map(addNode)` → 24 次 `set` → React Flow reconcile 24 次（前端修正：undo 快照因 immer 结构共享、persist 因 debounce 都便宜，**不是瓶颈**）。修法：store 加 `addNodes(inputs[])` 单次 set；`connect_nodes` 同样批量化（CTO 指出 edges 也逐条，别只修一半）。先用 React DevTools Profiler 验证 commit≈24 次坐实主因。
- **bug② 无中间态**：被「计划清单卡」顺带解决（用户事前就看到清单，不会干等）。
- **bug③**：`extensionFromMime`（`assetPaths.ts:8`）**已接好**；真凶是 `runtime.ts:440` 硬塞带 `.png` 的 fileName + `importRemoteAsset:287` 的 `fileName.includes(".")` 短路放行。修法：删 `:440` 污染源（fileName 不带后缀）+ 收紧 `:287`（真实字节 derive 的后缀永远赢，堵第二入口）。历史脏文件**不迁移**（级联改 url 引用回归面巨大，仅 Finder 缩略图一个症状；应用内按字节解码不受影响）。

### A4. 评审一致的范围裁剪
- **剥离 v5 升级**（D1）：初稿「重写 harness 就对齐 v5」把「修 bug」偷渡成「重写 harness」。三个 bug 在 v4 全可修，v5 单独立项。
- **砍**：C 来源标记 / 摘要压缩、L 审计配额（用户无感、非真实痛点）。
- **推迟**：两套 harness 统一 loop（generateText vs streamText 无官方共享抽象，硬抽是 if 分叉壳）。
- **立即抽**：`createToolCallRepair` 在 `agentChatHarness.ts:115` 与 `onboarding/agent.ts:113` 逐字重复 = 真 P1 违规，抽成共享 helper。
- **拆解交付**：三个 bug 各自独立 commit，不捆框架。

---

## B. 决策回填（已拍板）

| # | 决策 | 拍板 |
|---|---|---|
| **D-核心** | agent 职权 | **出计划清单卡，建议模型+参数；用户在卡上改+确认才落地** |
| **节奏** | 交付顺序 | **bug① 优先**（最痛先解）。bug②③ 随后 |
| **D1** | v4→v5 升级 | 剥离，单独立项，本轮不动 |
| **D2** | 参数系统 | 扩展 archetype 不推倒；但需验证能否承载 agent 约束（见 C3）|
| **D3** | 两套 harness | 只抽公共 helper（repair/trace），不抽 loop |
| **D4** | V 组件 | 本轮只做支撑 bug 调试的最小事件；完整 trace 推迟，且默认元数据级（prompt 正文 opt-in，防隐私回归）|

---

## C. bug① 专项执行计划（当前焦点）

**目标**：agent 建节点时，在计划清单卡里为每个节点建议模型 + 比例/清晰度；用户可改、确认才落地。

### C1. 动手前必须验证的假设（spike，进行中）
1. **agent 能否选模型**：`useNodeModelAutoSelect` 现状？能否让 agent 在计划阶段 propose 一个 `modelKey` 写进 `node.meta`？自动选与 agent 选的优先级冲突怎么办？
2. **模型档案能给 agent 读成什么**：catalog/archetype 能否列成「可用模型清单 + 每个的参数 schema」注入系统提示词？
3. **参数约束试金石**：`ModelParameterControl`（`modelCatalogMeta.ts:14`）表达不了互斥（`seedance.ts:59` omni 模式 first_frame ⊥ reference）。一份 schema 能否同时驱动 UI 渲染 + agent 校验？还是必须分层？

### C2. 设计交付（R8，spike 后）
需先出样张 + 用户拍板的（设计师评审 S1-S4，bug① 相关）：
- **计划清单卡**：列节点 + 每节点的 `[模型 chip][比例 chip][清晰度 chip]`，可内联编辑，「AI 配置」与「用户手配」视觉是否区分（撞「创作者控制优先」锁定原则）。
- **全局基调**（真实用户诉求）：「全部竖屏 / 全部高清」一句话设默认，清单整体跟随。
- 串行 present 的最小呈现间隔（设计师：过快会抽搐）——若走计划卡一次性确认落地，此项可能不需要。

### C3. 实现要点（样张拍板后）
- agent 工具 schema：`plannedNodeSchema` 加 `modelKey?` + `params?`，params 的 Zod 从该模型档案**动态生成**（动态 enum + strict）；约束层（互斥/跨字段）若 `ModelParameterControl` 撑不住则单独建校验层。
- 系统提示词：注入可用模型清单 + 每个的参数 schema（`generationCanvasAgentClient.ts:50`）。
- `applyCanvasToolCall.ts:23`：写入 `node.meta.modelKey` + `node.meta.archetype` + 参数值。
- 幂等：按 `toolCallId` upsert（repair 会重放）。

---

## D. 后续 backlog（bug① 之后，已排序）

| 优先级 | 项 | 组件 |
|---|---|---|
| 次 | bug② store 批量化（含 edges）+ Profiler 验证 | E |
| 次 | bug③ 删污染源 + 堵第二入口（不迁移历史）| 资产 |
| 低 | 抽 `createToolCallRepair` 共享 helper（P1 违规）| L |
| 低 | nomi-local 资产持久化真实 contentType（后缀不再是唯一真相源）| 资产 |
| 推迟 | S 会话 resume / V 完整 trace / D1 v5 升级 | S/V |

---

## E. 验收门（回填用）

- [ ] bug① agent 在清单卡建议模型+参数，用户可改可确认，非法参数被拦（回归断言 + R13 走查 J1）
- [ ] bug① agent 配的参数在节点上可见（撞「创作者控制优先」）
- [ ] bug② addNodes 批量后 Profiler commit 次数显著下降，24 节点无卡顿
- [ ] bug③ 下载图片后缀与真实字节一致，Finder 有缩略图（file 断言）
- [ ] 五门全过（check:filesize → lint:ci → typecheck → test → build）
