# 合并「创作 agent」与「画布 agent」为统一 agent — 执行 plan（草案）

日期：2026-06-06
状态：**草案，待 CTO/前端/后端三角色对抗评审回填 + 用户确认后执行**（规则 4/9）。
缘起：定妆 Tier2 暴露的问题——把剧本甩给生成区 agent 跑，跨面板交接脆弱（「处理中」卡死），且用户要「创作区剧本联动」。
用户拍板：合并成同一套 agent、带全部工具、连贯上下文。

## §1 关键事实（为什么这是「拆并行版」而非「从头造」）

两个 agent **后端已是同一个 runner** `runAgentChatV2`（electron/runtime.ts）。所谓「两个 agent」只是：
1. 两个 UI 面板：`CreationAiPanel`（创作区）/ `CanvasAssistantPanel`（生成区），各开各的会话；
2. 工具集被 `buildToolsForSkill(skillKey)` 网关二选一：`workbench.creation.*` → 文档工具；其它 → 画布工具。

→ 合并 = **拆掉工具网关（改成并集）+ 合并面板/会话**，不是重写 agent runtime。这是规则 1「消除并行版」。

## §2 目标架构

| 维度 | 现状 | 目标 |
|---|---|---|
| 工具 | skill 网关二选一（文档 xor 画布） | **并集**：读/改剧本 + 读画布/建节点/连边/写节点提示词，全给 |
| skill | 既当人设又当工具开关 | **只当行为模式**（写作/拆镜头/定妆/审查…），工具恒定 |
| 上下文 | 各看各的 | 一个会话同时可见剧本 + 画布 → 连贯 |
| 面板/会话 | 两个面板、两个会话 | **一个助手、一个会话**，创作区/生成区都挂它 |
| 定妆 Tier2 | 跳 tab + 甩给生成 agent（脆弱、卡死） | 统一 agent 上的一个 skill，读剧本→建卡，不跳走 |

## §3 范围

**改：**
- 后端 `buildToolsForSkill`：返回文档 + 画布工具**并集**；统一提供两组工具的 hooks（**最大难点**，待后端角色 agent 给方案）。
- 前端：合并 `CreationAiPanel` + `CanvasAssistantPanel` 为一个面板组件 + 一个共享会话 store；创作/生成区都挂。
- skill：现有 `workbench.creation.*` / storyboard / fixation 全部改为「统一 agent 的行为模式」（工具不再靠 skill 网关）。
- 定妆 Tier2：删掉跨面板 CustomEvent 那套（fixationLauncher 的 event 交接），改成统一 agent 内的 skill 触发。

**不动（本次不碰）：**
- `runAgentChatV2` 的核心循环 / 模型调用 / IPC 协议（只改工具装配与 hooks 提供）。
- 画布工具 / 文档工具各自的**实现**（只改"谁能拿到它们"）。
- 已落地的 ①②③（mapping/prompt 模块/Tier1 浮条按钮）+ 两个 UX bug 修复——它们和本重构正交。
- 模型 catalog / 生成链路。

## §4 待评审收敛的开放问题（三角色 agent 回填）

1. **hooks 合并**（后端）：一次 `runAgentChatV2` 怎么同时拿到「文档写回（需活编辑器）」+「画布 store 回调」两组 hooks？
2. **文档写工具的"在场"**（前端）：编辑器只在创作 tab 挂载；统一 agent 在生成 tab 时，文档"写"工具 hook 不在场 → 禁用？还是「读剧本随时可、写剧本仅创作 tab」？
3. **工具是否真"全给"还是"按上下文动态可见"**（CTO）：全给 8 工具会不会让模型选错？中间方案（按当前 workspace 动态启用）是否更稳？
4. **两套确认 UI**（前端）：AgentPlanCard（画布）+ 文档就地 diff，合并面板后怎么共存。
5. **会话连续性**（前端）：一个面板跨 creation/generation workspace 重挂时会话不丢，放哪个 store。
6. **「处理中」卡死根因**（后端）：是否合并后自然绕开，还是要单独修（超时/错误收口/埋点）。

## §5 回滚策略

- 重构在单独分支/worktree 进行；分阶段 commit（后端工具并集 → 前端面板合并 → skill 改造 → 定妆 skill 接入）。
- 每阶段 CI 五门 + 真机走查通过才进下一步；任一阶段红 → 回退该 commit。
- 旧两面板代码在合并面板验证通过的**同一 commit** 删除（规则 1，不留并行版）。

## §6 验收门

- [ ] 一个助手面板，创作区/生成区都可用、会话连贯（同一会话看得到剧本 + 画布）。
- [ ] 统一 agent 能在一轮对话里：读剧本 → 建角色/场景卡 → 写提示词（定妆 Tier2 真机 E2E 跑通，不再「处理中」卡死）。
- [ ] 写作/拆镜头/审查等原创作 skill 行为不回归。
- [ ] 旧两面板 + 跨面板 CustomEvent 交接代码已删（无并行版）。
- [ ] CI 五门全绿 + 真机走查（规则 13）。

## §7 评审回填（CTO / 前端 / 后端，2026-06-06）—— 三方强烈收敛

### 结论：**不做「全合并」，改做方案 B（按 workspace 动态启用工具 + 一个跨域移交工具）。**

三个角色 agent 独立命中同一组事实（多维独立命中 = 最强信号）：

1. **「连贯上下文」已存在，不是合并的价值**：两个面板共用同一 sessionKey `nomi:workbench:<projectId>` + 同一 runner，后端 LLM 记忆**本来就跨创作/生成区连贯**（workbenchAgentRunner.ts:22-31；runtime.ts:2469-2472 注释自述）。→ 合并的「主卖点」论证不成立（规则 8 矛盾必停的触发点）。真实增量只有「一轮内同时持有文档+画布工具」。

2. **「工具恒定全给」是错的，会系统性制造「处理中」卡死**（后端实证最致命）：
   - 后端 hooks 是**同一套** `AgentChatV2Hooks`，工具在主进程**无运行期对象依赖**——主进程只是哑路由（emit tool-call → 等渲染层 confirm 回填）。所以 `buildToolsForSkill` 返回并集**主进程零成本**。
   - **但工具的「执行器」在渲染层是面板局部的**：画布工具执行体只活在 `CanvasAssistantPanel.applyConfirmedToolCall`，文档写只活在创作面板的 tiptap。生成区面板**没有 tiptap**，创作区面板**没有画布 store**。
   - → 给 agent 全部工具,它调了**对方域**的工具 → 当前面板不认 → `confirm` 永不回填 → `awaitToolConfirmation` Promise 永不 resolve → loop 永久卡 **「处理中」**。**合并的前置条件是先建「跨域工具执行注册表」,否则合并 = 系统性造卡死。**
   - CTO 补充：这还等于**向 LLM 虚标能力**（承诺它当前区兑现不了的工具）——项目「别藏/别虚标能力」的反面；且画布快照+剧本全文叠加会更快撑爆 30 条历史上限。

3. **方案 B（三方一致推荐）**：`buildToolsForSkill` 入参由 `skillKey` 升级为「skill + 当前 workspace / availableTools 白名单（由发起面板声明它能执行哪些）」——任一时刻只暴露**当前区同域、可执行、不打架**的工具池；再加**一个轻量跨域移交工具**（只请求切区 + 意图入队,不需另一区当前挂载）承接「一轮内从写剧本推进到建画布卡」。改动小、向后兼容、契合「声明能力 / 通用系统填」、零新债。拿到提案 90% 的真实价值。

### 「处理中」卡死根因（后端锁定，与合并解耦，可立即修）
- **最可能（假设1）**：fixation 复用了 storyboard 的 `AgentPlanCard`/`summarizeAgentPlan`,但它对 **character/scene** 节点**可能渲不出可点的确认卡**（空卡/无按钮）→ 用户无从 confirm → `awaitToolConfirmation` 永不 resolve → 「处理中」永转。（合成层 bug,逐元素门绿也抓不到。）
- **次因（假设2）**：`runAgentChatV2` 的 `streamText` **无超时/abort**——vendor 端点挂起就无限等。
- **修法**：① main.ts:342(pending 入)/:380(confirm 回)**配对计时埋点**（1 分钟内区分"等用户确认"vs"模型不返回"）；② 修 AgentPlanCard 对 character/scene 的渲染（出可点卡）;③ streamText 加 abortSignal+超时兜底。

### 修订后的范围（覆盖 §2/§3）
- 把「全合并 + skill 退化 + 两区常驻」**作废**。改为方案 B：动态工具白名单 + 跨域移交工具。
- 「处理中」根因独立修（埋点 + 确认卡 + 超时）——**无论合不合并都该修**。
- 定妆 Tier2 走方案 B：创作区触发 → 移交工具切到生成区 + 把"按剧本建卡"意图带过去 → 生成区面板（有画布执行器）落卡 + 确认。比现在的 CustomEvent+setTimeout(60) 竞态稳。
- 旧 CustomEvent/setTimeout 跨区交接：方案 B 落地后删（规则 1）。
