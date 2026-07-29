# 画布生成 Agent 真机走查审计

日期：2026-06-12
方法：R13 标准流程——清场 → 全新构建 → 常驻驱动（ui-driver）→ 真实旅程「新建空白项目 → 创作区灌故事 → 拆镜头（真实 LLM）→ 批准计划 → 连边 → 选节点改参数 → 真实生成」→ 逐步截图 + DOM/几何实测 → Explore 挖根因到 file:line。
证据截图：`tests/ux/shots/agent-test-0*.png`（00 起始 ~ 14 生成终态）。
用户原始反馈：「生成失败/生成区 agent 执行失败频发」「参数固定没法编辑」「执行与批准不相关、没有边」「生成出来的东西没有提示词」。

## 结论速览

| # | 问题 | 级别 | 复现 | 根因定位 |
|---|---|---|---|---|
| A | 对账误报「执行与批准有 6 处出入」（边明明连上了） | **P0** | ✅ 必现（connect 跨轮时） | reconcile 用本批局部 id 映射，apply 用全局 registry，两套不同源 |
| B | 批准粒度割裂：批了「确认全部 7 节点」又弹 connect 单独审批 | **P0** | ✅ 必现（模型分轮发工具时） | 计划卡折叠依赖 create+connect 同轮到达，跨轮即降级裸审批 |
| C | 节点参数面板被时间轴遮挡，模型/比例/清晰度/生成按钮点不到；prompt 看着像静态文本 | **P0** | ✅ elementFromPoint 实证 4 按钮全被 `workbench-timeline-track` 接住 | composer 写死朝下展开、无视口 clamp/翻转；局部堆叠上下文 z 被时间轴区域压制 |
| D | agent 建的节点与已有节点重叠 | P1 | ✅ 网格与「镜头1」AABB 相交 | gridPosition 纯 index 网格，不读已有节点避让 |
| E | 「生成区 Agent 执行失败」无细节、高频 | P1 | 本次未触发（单图生成成功，vendor 链路通） | 顶层 catch-all 压成单句 + 中层通用兜底吞 vendor 原文 + 旁路静默 catch |
| F | 「整笔撤销/查看步骤」按钮文字竖排一字一行 | P2 | ✅ 截图 agent-test-07 | 回执卡按钮容器过窄文字纵向折行 |
| G | 「生成出来的东西没有提示词」 | 待复现 | ❌ 本次 7 节点 prompt 全在 | 可能与特定模型/历史版本相关，留观察 |

「提示词没法编辑」实测澄清：composer 内是 tiptap（contenteditable=true，`NodeGenerationComposer.tsx:165-176`），**能编辑**；体感「不可编辑」来自 C 的遮挡 + 编辑器无输入框示能（看起来像静态文本）。

## 根因详情（file:line）

### A 对账误报（P0）
- 边落地用**模块级跨提议**的 `clientIdRegistry`：`agent/applyCanvasToolCall.ts:43-47`、连边分支 `:122-131` → 边真实连上（DOM 6 条 `generation-canvas-v2__edge` 实证）。
- 对账用**每笔提议本地新建**的 `clientIdToNodeId`：`agent/proposalTxn.ts:71`（仅本批 create 步 `:110` 填充）→ `reconcile.ts:49` `resolveId = raw => clientIdToNodeId[raw] ?? raw`。
- connect 在独立提议执行时本地 map 为空 → `n1` 原样查 store → 永远找不到 → 6 条全报「未连接」。
- 同类入口：`reconcile.ts:107/:120`（set_node_prompt / delete 的跨提议引用同样落空）。
- **修复方向**：reconcile 与 apply 共用同一解析器（注入全局 registry 或回退查询）。

### B 批准粒度割裂（P0）
- 折叠：`components/agentPlanSummary.ts:49-105` 只在**当前 pending 队列**里找 create+connect；卡片确认时本会连带批 connect（`AgentPlanCard.tsx:86-89`）。
- 但 pending 逐事件入队（`CanvasAssistantPanel.tsx:344-349`），模型把 connect 放到 create 确认后的下一轮（真实行为常见）→ 渲染计划卡时队列里只有 create → connect 后到走 `:646-683` 裸审批。
- 设计假设写在 `agent/generationCanvasAgentClient.ts:75`（要求同轮发出）——假设破裂 A、B 同时触发。
- **修复方向**：① prompt/工具层强约束同轮 + 校验；或 ② 计划卡记忆 create 计划，connect 后到时回填折叠不降级。

### C 参数面板遮挡（P0）
- `nodes/NodeGenerationComposer.tsx:117-119`：`absolute -translate-x-1/2` + `top: calc(100%+gap)` 写死朝下；`floatingComposerLayout`（`:46-57`）无边界检测/翻转/clamp。
- 节点选中 z 只有局部 `data-[selected=true]:z-[5]`（`BaseGenerationNode.tsx:431`），时间轴（`TimelinePanel.tsx:189`/`TimelineTrack.tsx:71`）是画布外同级区域，靠下节点的 composer 越界即被盖。
- 同类入口：`BaseGenerationNode.tsx:514` panorama-toolbar 同样无 clamp。
- 违反 R13「打开态防遮挡」铁律（BodyPortal/翻转/clamp + 几何回归断言）。
- **修复方向**：composer 加视口 clamp + 空间不足翻转朝上；提升为不裁剪层；落 design-fidelity 几何断言。

### D 节点重叠（P1）
- `agent/applyCanvasToolCall.ts:14-24` `gridPosition` 固定原点 (160,160) 纯 index 网格，入参无 nodes；`:88-94` 批量时忽略 LLM 坐标直接铺网格。
- **修复方向**：网格原点避让已有节点包围盒 / AABB 碰撞偏移。

### E 错误吞并（P1）
- 面板级唯一抛出点 `CanvasAssistantPanel.tsx:384-388` 总 catch 压成「生成区 Agent 执行失败：{message}」。
- 丢失细节的路径：`workbenchAiClient.ts:95`（`agents chat stream failed` 通用串）、`:96`（`stream ended without result`）；`generationCanvasAgentClient.ts:144/:155` 模型清单/记忆注入失败**静默吞**。
- 路径 1（流式 error 事件）vendor 文案是透传的——所以「高频失败无细节」大概率来自 2/3/静默路径。
- 节点级链路（`runner/generationRunController.ts:130/:138` + `classifyGenerationError`）结构化透传，本次实测单图生成 success，vendor 链路通。
- **修复方向**：按错误类别分流（复用 classifyGenerationError），保留 vendor 原文；静默 catch 至少落日志/提示。

### F 回执卡按钮竖排（P2）
- 「已应用：创建 7 个节点」卡右侧「查看步骤」「整笔撤销」按钮容器过窄，文字一字一行竖排（截图 agent-test-07-canvas-nodes.png 右栏）。
- **修复方向**：按钮 `whitespace-nowrap` + 卡片布局给按钮列留最小宽。

## 走查中顺带验证为「好」的
- 拆镜头计划卡：7 节点带中文标题 + 英文 prompt + 模型/比例/清晰度，可整卡批准/拒绝 ✓
- 节点落库后 prompt/标题/参数齐全（用户报的 G 未复现）✓
- 单节点真实生成（Seedream 4.5 / 16:9 / 2K）成功，状态徽标 idle→running→success ✓
- 「适应视图」可用 ✓

## 建议修复顺序
1. **A+B 一起修**（同源：跨轮 id/折叠假设）——这是用户「执行与批准不相关、没有边」的全部体感来源
2. **C**（遮挡 = 「参数没法编辑」体感来源）+ 顺带 prompt 编辑器加输入框示能（边框/placeholder）
3. E（错误分流透传——否则下次失败还是查不到原因）
4. D、F
5. G 留观察：下次出现「无提示词节点」时抓 `create_canvas_nodes` 的原始 args 取证
