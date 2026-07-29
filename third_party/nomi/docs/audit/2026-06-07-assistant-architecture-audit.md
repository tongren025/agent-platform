# 助手 / Agent 架构审计：两套面板 vs 一套（2026-06-07）

> 触发：用户问「为什么现在架构有问题」+「我加了往生成区带的工具，AI 说整两个会有问题，到底分两个还是做一个，分析核心优缺点和逻辑」。
> 方法：按 R6 读真实代码（带 file:line）→ R6 调研顶尖项目真实架构 → R3 对比表 → R7 六角色评审 → 推荐 + 迁移路径。本文只做分析与决策，不含实现（实现待用户拍板，符合 R7/R8）。

---

## 0. 一句话结论

**后端其实早就是「一个 Agent」**（同一 runtime、同一 session 记忆，只按 `skillKey` 换工具组）。问题不在「几个 Agent」，而在**前端硬切成两块面板 + 一条 window 事件桥**——这正是业界已被验证会出问题的「多个面对用户的入口 + 脆弱路由」反模式。推荐：**收敛成一个跟随用户上下文的助手面板，工具域按当前所在区（创作/生成/时间轴）动态收放**，把「拆镜头/定妆」等从按钮降级为这一个助手的工具。这同时解掉 ⑤⑥⑦⑧ 与你 P1/P4 的诉求。

---

## 1. 现状架构（事实，带 file:line）

### 1.1 后端：已经是「一个 Agent」
- `src/workbench/ai/workbenchAgentRunner.ts:5` 注释原文：**“One shared agent runner for both workbench panels (创作区 + 生成区). The backend engine (`runAgentChatV2`) is identical for both areas; only the tool group differs (selected by skillKey).”**
- `workbenchSessionKey()`（`:23`）= `nomi:workbench:<projectId|local>`——**两个面板共用同一条后端记忆 key**，「跨轮 + 跨区」共享上下文（注释 `:18-22` 明说是故意的）。
- 生成区的 `sendGenerationCanvasAgentMessage`（`generationCanvasAgentClient.ts:174`）**内部就是调 `runWorkbenchAgent`**（`:181`），只是默认 `skillKey='workbench.generation.canvas-planner'`。

→ **不存在「两个 Agent 运行时」。** 后端单一，记忆单一。

### 1.2 前端：硬切成两块面板，控件/技能/工具各一套
| | 创作区 `CreationAiPanel.tsx` | 生成区 `CanvasAssistantPanel.tsx` |
|---|---|---|
| 技能 skillKey | `workbench.creation.*` | `workbench.generation.canvas-planner` |
| 工具组 | 文档工具（read_full_text / insert_at_cursor / replace_selection） | 画布工具（`generationCanvasTools.ts`：create/connect/delete_nodes、set_node_prompt、generate_image/video、send_to_timeline） |
| 模式选择 | 创作模式（通用/…） | Agent / chat / refine |
| 模型选择器 | ❌ 无 | ✅ `AssistantModelPicker`（无 text 模型时 `return null` → 时有时无）|
| 行话按钮 | 「拆镜头」「定妆」chip | ❌ 无（靠事件桥被动接收） |

### 1.3 「往生成区带的工具」= window 事件桥（你加的那次调整）
- 创作区点「拆镜头/定妆」→ `requestStoryboardPlanning` / `requestFixationPlanning`（`storyboardLauncher.ts` / `fixationLauncher.ts`）派发 `window` CustomEvent。
- 生成区 `CanvasAssistantPanel.tsx:318 / :336` 监听 `STORYBOARD_PLANNING_EVENT` / `FIXATION_PLANNING_EVENT` → 用 `STORYBOARD_PLANNER_SKILL` / `FIXATION_PLANNER_SKILL` + `buildPrompt` 覆盖，把剧本文本喂给**同一个** runtime。
- 另有生成→预览的桥：`sendGenerationNodeToTimeline.ts`、`sendStoryboardToTimeline.ts`。

→ 跨区协作靠**「派 DOM 事件 + 换 skill」**，不是干净的工具调用。

---

## 2. 为什么现在有问题（根因，不是现象）

1. **「双面板」是给『顺序流程』装了『独立域』的壳。** 创作（写文本）→ 拆镜头 → 生成（画布）→ 时间轴，是同一个创作流的**先后阶段**，不是互相独立的领域。但 UI 把它切成两套面对用户的助手，于是同一件事要在两处分别长出控件、文案、模式、模型选择。
2. **事件桥 = 脆弱路由。** creation→generation 用 `window` CustomEvent + `setTimeout(60)` 等面板挂载（`CreationAiPanel.tsx:145`）。时序耦合、跨 React 生命周期、难测、易漏（定妆就没接自然语言入口，拆镜头才有正则 `STORYBOARD_REQUEST_PATTERN`）。
3. **定妆「双路径」是命名歧义，不是 P1 重复实现**（← 本条经 2026-06-07 复核修正，详见 §10）。两条路是**两个不同生产阶段的不同操作**，只是都叫「定妆」：节点级 `applyFixationMakeup`（`buildFixationNode.ts:30-70`，输入一张已有图 → i2i 衍生）vs 剧本级 `launchFixationPlanning`（`CreationAiPanel.tsx:151-168`，输入剧本文本、此刻无图 → 建 character/scene 概念卡，idle 等用户生成）。二者共用的提示词抽象 `buildFixationPrompt` 已抽出（`fixationPromptTemplates.ts:1-11`），无实质重叠。用户「没参考我的图」是因为点了同名的剧本级入口却期待节点级行为——**根因是命名/标签歧义，不是并行实现**。
4. **控件不一致是「双壳」的必然产物。** 模型选择器只在生成区有、还会自我隐藏；模式选项两边语义不同（创作模式 vs Agent/chat/refine）。用户感知为「这个有那个没有」。
5. **行话外露。** 「拆镜头」「定妆」是制片术语，被摆成一等按钮，用户看不懂（你已指出）。它们本质是「让这个助手去做的一类活」，该是**工具**不是**门面按钮**。

---

## 3. 你加的「带过去的工具」：优缺点

**优点**
- 让创作区的剧本能直达生成区落地成节点，跑通了「写完→一键拆镜头/定妆」的主线，价值真实。
- 复用了同一 runtime + 同一 session，没有真的造第二个 Agent（这点是对的）。

**缺点（也是 AI 警告你的点）**
- 桥是 **DOM 事件 + 时序 hack**，不是结构化能力；新增一种「带过去」就要再拉一条事件 + 一个 skill + 一个监听（拆镜头、定妆已各一套，未来定景/分镜表会继续繁殖）。
- 把「带过去」实现在**面板**层而非**工具**层，导致它只能从创作面板按钮触发，自然语言/跨入口都得各自再接。
- 强化了「双面板」的存在感——你越往桥上加东西，越难收敛成一套。

→ 方向（让创作内容能驱动生成）是对的；**实现位置错了**：应是「一个助手的一个工具」，而不是「面板间的一条事件桥」。

---

## 4. 两套 vs 一套：核心对比（R3）

| 维度 | A. 维持两套面板（现状） | B. 一套统一助手（推荐） | C. 真·多 Agent（独立 runtime+独立记忆） |
|---|---|---|---|
| 用户看到 | 两个助手，控件/模式/模型各异，行话按钮 | 一个助手，跟着你所在区变工具，自然语言驱动 | 多个助手，需手动切/被路由 |
| 跨区协作 | window 事件桥（脆弱、时序耦合） | 助手内**工具调用**（结构化、可测、可被自然语言触发） | 需 coordinator 路由 + 显式 handoff |
| 一致性 | 差（双壳必然分叉） | 高（单一来源） | 最差（风格/行为各自漂移）|
| 加新能力成本 | 高（每个「带过去」+事件+skill+监听） | 低（加一个工具，自动可被调用） | 高（新 agent + 路由 + 记忆隔离）|
| 与 P1/P4 | 违反（并行版、分叉） | 契合 | 违反 |
| 上下文连续性 | 已共享 session（唯一做对的） | 共享 + 单面板，连续性最好 | handoff 丢失 tacit 上下文 |
| 风险/回滚 | 已上线，债在累积 | 中（要合并面板，分阶段可回滚） | 高 |
| 适用前提 | —— | 顺序流程 / 创作工具 / 工具尚可塞进一个 schema | 真·独立域 + 可并行 + 工具爆炸 |

### R6 顶尖实践佐证
- **微软 Azure SRE**：把几十个领域专用 agent **收敛回少数通才**，结论「**更少 agent、更宽工具、按需知识，取代了脆弱路由和僵硬边界**」——专家间 handoff 的损耗大于专精的收益。
- **创作工具特有风险**：多 agent 分别用不同模型 → 风格/决策不一致 → 成品风格割裂。
- **LangChain**：creative assistant 属于「单 agent + 多专长、无需在能力间设硬边界」的典型。
- **业界共识**：早期产品**从单一面板起步**，工具膨胀后演进到**hybrid（subagent-as-tools，对用户仍是一个面板）**；只有「真正独立、可并行的域」才上**面对用户的多面板/多 agent**。

→ 我们的创作/生成是**顺序阶段**、是**创作工具**、工具量级**还能塞进一个 schema**——三条都指向 **B（单面板）**，并随工具膨胀再走 hybrid。**C 不适用。**

---

## 5. 推荐方案

**B + 渐进 hybrid：一个跟随上下文的助手面板。**

1. **一个面板**：合并 `CreationAiPanel` 与 `CanvasAssistantPanel` 为单一助手组件，工具域随「当前活跃区」动态切换（在编辑器→文档工具；在画布→画布工具；在时间轴→时间轴工具）。后端已是单 runtime + 单 session，天然支持。
2. **拆镜头/定妆/定景 → 工具**：从面板按钮降级为这个助手的 capability（skill/tool）。用户自然语言说「把这段拆成镜头」「给这个角色定妆」即触发；不再需要 window 事件桥。删掉桥与重复路径（P1）。
3. **定妆消除命名歧义（非删路径）**：保留两条本质不同的路径，但让用户清楚自己在做哪件事——节点级入口标「基于此图定妆/身份板衍生」（有图 i2i），剧本级入口标「剧本立角色/场景卡」（无图、建卡待生成）。共用的 `buildFixationPrompt` 不动。**不删剧本级**：它在「还没有图」阶段不可能走 i2i（无图源、tool 无 references 通道），删了等于砍掉剧本→立卡的主线（详见 §10）。
4. **模型选择器常驻且一致**：助手模型选择并入统一控件，不再「时有时无」。
5. **控件语言统一**：一套模式语义、一套底栏。

**这同时关掉本轮之前报告里的 ⑤⑥⑦⑧。**

---

## 6. R7 六角色评审（基于真实代码，非臆测）

- **CTO**：后端已单一，合并是「去壳」不是「重写内核」，技术债下降、扩展点收敛到「加一个工具」。✅ 支持 B，警告：迁移要 P1 同 commit 删桥，别留双面板 fallback。
- **设计师**：两套面板违反密度优先与一致性；单面板 + 上下文工具更符合 Design.md。✅ 选择面板重设计（见 §8）应与此同盘考虑。
- **PM**：用户价值在「写完能一键落地生成」，B 用更低成本保住该价值且更易扩展（定景/分镜表 = 加工具而非加面板）。✅ 支持 B，建议分阶段交付避免一次性大改。
- **前端**：事件桥 + `setTimeout` 时序是 bug 温床；改成工具调用可测、可被多入口复用。✅ 支持 B。风险：合并面板涉及状态/挂载点迁移，需回归走查（R13）。
- **后端**：runtime/session 已共享，B 几乎不动后端；只需把 storyboard/fixation 的 skill 收成「工具」而非「整段 prompt 覆盖」。✅ 低风险。
- **真实用户**：「我不想学拆镜头/定妆是啥，我想说人话让它干」——B 直击此点；单面板减少「这个有那个没有」的困惑。✅ 强支持。

无角色支持维持现状或上 C。

---

## 7. 迁移路径（分阶段，符合 P1，每阶段可回滚 + 验收门）

> 每阶段都要：① 先出样张/或先评审（R8）② 加新同 commit 删旧（P1）③ 五门全过 ④ Playwright 真机走查（R13）。

- **阶段 0（本文）**：审计 + 决策。✅
- **阶段 1**：把「拆镜头/定妆」从 `CreationAiPanel` 按钮改造为统一助手的**工具**（自然语言触发），删 window 事件桥。**注意**：是「拆桥」不是「删定妆某条路径」——两条定妆路径都保留（§10），只把触发方式从 DOM 事件改成结构化工具调用，并消除命名歧义。复核已确认工具执行逻辑早在组件外的全局 store + `generationCanvasTools`（`generationCanvasTools.ts:52-98`），创作区助手可直接调用，后端/store 几乎不动。验收：说人话能拆镜头/能在剧本阶段立角色卡、在图节点上做 i2i 定妆，两种定妆的入口文案不再混淆。
- **阶段 2**：合并两个面板为一个上下文感知助手；统一模式/模型选择器。验收：一个面板跨创作/生成连续工作，控件不再「时有时无」。
- **阶段 3（可选）**：工具膨胀后引入 subagent-as-tools（对用户仍是一个面板）。

---

## 8. 与「选择面板重设计」的关系

用户同时提出：下拉/选择框不符合设计语言 + 冗余空间过大。这是**独立的可视设计任务**，与本架构决策正交，但同属「助手/生成区表层一致性」。按 R8 单独出 HTML 样张 + 设计师/真实用户评审再实现。建议：**先做选择面板重设计（见效快、风险低、用户当下最痛）**，架构合并（阶段 1-2）随后。

---

## 9. 待用户拍板

1. 架构方向取 **B（单面板 + 工具化，推荐）**？还是先只做阶段 1（工具化拆镜头/定妆、拆桥）？
2. 选择面板重设计与架构合并的**先后顺序**（建议先做选择面板）？
3. 是否要我再正式跑一遍 **R7 子 agent 独立评审**（本文的六角色是我基于全量代码上下文写的；如需第二双眼睛可另起 subagent）？

---

## 10. 复核修正（2026-06-07，独立 subagent 二次核验）

> 用独立 Explore subagent 逐条核了本文的事实 claim（带 file:line），并深挖两处「被低估的硬骨头」。结论：**§1 全部 7 条事实 claim 成立**；但**§2.3 / §5.3 的「定妆双路径=P1 重复实现」判错了**，已在上文修正。另确认 phase-1 比原文更可行。

### 10.1 修正：定妆不是「重复实现」，是「两个阶段的不同操作 + 命名歧义」
- 路径 A `applyFixationMakeup`（`buildFixationNode.ts:31`：`srcUrl = node.result?.url`，无图直接 no-op）：**输入一张已有图** → `references:[srcUrl]` + i2i 模型 `gpt-image-2-image-to-image`（`buildFixationNode.ts:19-27,55-56`），Tier1 通用模板。
- 路径 B `launchFixationPlanning`（`CreationAiPanel.tsx:152`：`(selectedText||documentText)`）：**输入剧本文本、此刻无图** → agent 建 `kind:'character'|'scene'` 概念卡，只有 `title/prompt`，**无 references 通道**（`generationCanvasTools.ts:12-17`），idle 等用户生成（`skills/workbench-fixation-planner/SKILL.md:14-15` 明令「不要替用户生成图」），Tier2 剧本反推模板。
- 二者**共用** `buildFixationPrompt`（`fixationPromptTemplates.ts:1-11,71-142`），这层已是正确抽象。**代码无可合并的实质重叠，重复的只有「定妆」这个名字。**
- → 原 §5.3「统一 i2i、删剧本级」**技术不成立**（B 无图源、tool 无 references 通道，强行 i2i = 偷跑用户该自己点的生成，违反 SKILL 约束）。正解：**消除命名歧义，两条都留**。

### 10.2 强化：phase-1「工具化」比原文判断更可行（后端/store 几乎零改动）
- 画布状态是真·全局 Zustand store（`generationCanvasStore.ts:376`），可在任意组件外 `getState()` 访问。
- 所有工具落地动作已走纯模块 `generationCanvasTools`（`generationCanvasTools.ts:52-98`，每个方法直接调 store action），含 `generate_image/video`（`runGenerationNode` 全 store 驱动，`generationRunController.ts:63-100`）与 `send_to_timeline`（`sendGenerationNodeToTimeline.ts:51`，双 store 端口化）。
- **已存在一条不依赖面板挂载的自动执行路径** `defaultExecuteToolCall`（`generationCanvasAgentClient.ts:109-172`）。`CanvasAssistantPanel.tsx:155-212` 那份 `applyConfirmedToolCall` 只是「确认 UI + 队列」的翻译层，不是执行权所在。
- → phase-1 主要工作 = 抽一个共享 `applyCanvasToolCall` 模块 + 决定创作区助手的确认 UX。**runtime/store/runner 几乎不动**，原文「后端低风险」成立且更乐观。

### 10.3 措辞瑕疵修正
- 原文多处「产出卡没生成钮」更准确应为「节点为 idle 状态、等用户点生成」（canvas-planner 提示词明示「节点默认 idle，用户自己点生成按钮」）。不是没有按钮，是没自动生成 + 无参考图。

### 10.4 仍未补、进实现前必须补的两件事
1. **合并面板（阶段 2）的 HTML 样张**（R8）——本文只决策方向，未给可视样张；「工具域随活跃区动态切换」会带来「工具可用性不可见」的新风险，需样张验证。
2. **§4 的外部「顶尖实践佐证」缺出处**（违反 R6 的「给 file:line/源」要求）——微软 SRE / LangChain / 业界共识均无 URL，建议补真实出处或降级为「待证假设」，不作为决策硬依据（B 的真正论据是内部代码已统一，不需要这段）。
