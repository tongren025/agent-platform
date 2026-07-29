# 分镜方案卡片回看 · 实现规范（2026-06-15）

> 用户已拍板样张 `docs/design/reviews/2026-06-15-storyboard-card.html`。
> 第二批（见 [history-prompt-backlog](2026-06-15-history-prompt-backlog.md)）。

## 目标
把拆镜头方案从「占满创作区主列的全屏编辑器 · 确认即焚」改成「创作区**对话流里一张可收起/可重开的卡片** · 确认落画布后留痕、可再编辑」。

用户拍板的三点：① 卡片在创作区对话流（发起拆镜头的地方）；② 历史 = 只当前内容，不存多版本；③ 确认落画布后卡片保留。

## 核心架构决策（单一真相源）
- `storyboardPlan`（store 单字段，已存在、随项目持久化）= **唯一真相源**（P1）。卡片是它的纯视图，不复制数据。
- 卡片**不新增到消息模型**：渲染为创作对话流尾部「跟随当前方案」的单张卡（driven by `storyboardPlan`）。避免改 `WorkbenchAiMessage`、避免锚定消息被删/孤儿、避免多版本堆积。一个项目一份活跃方案 → 永远恰好一张卡，重拆覆盖同一份（符合「只存当前内容」）。
- 编辑仍走现有全宽 `StoryboardPlanEditor`（主列），卡片只做摘要+状态+入口（不造窄版编辑器，P1）。

## 状态模型（store）
| 字段 | 类型 | 持久化 | 含义 |
|---|---|---|---|
| `storyboardPlan` | `StoryboardPlan \| null` | 是（已有）| 当前活跃方案；null=无 |
| `storyboardPlanCommitted` | `boolean` | 是（新增）| false=草稿，true=已落画布 |
| `storyboardEditorOpen` | `boolean` | 否（UI 瞬态）| 主列是否展示编辑器；重开项目默认 false（休息态=收起卡片）|

## Actions（store）
- `setStoryboardPlan(plan)`（已有，改语义）：set plan + `committed=false` + `editorOpen=true`。propose_storyboard_plan 回调调它。
- `setStoryboardEditorOpen(open)`（新）：卡片「打开编辑」/「收起」。
- `commitStoryboardPlan()`（新）：`committed=true` + `editorOpen=false`，**plan 保留**。
- `discardStoryboardPlan()`（新）：`plan=null` + `committed=false` + `editorOpen=false`。

## 各状态 → UI
| 条件 | 卡片 | 主列 |
|---|---|---|
| plan=null + 规划中 | （无卡）对话流里 assistant pending 文本「正在拆镜头…」| 文档 |
| plan≠null, editorOpen=true | 「编辑中」卡 + 收起卡片 | **StoryboardPlanEditor** |
| plan≠null, !committed, !editorOpen | 「草稿」卡（摘要+前2镜头）+ 打开编辑 / 丢弃 | 文档 |
| plan≠null, committed, !editorOpen | 「已落画布」卡 + 再次编辑 / 去生成区 | 文档 |

## 改动清单（按层）
1. **类型/状态** `src/workbench/workbenchStore.ts`（+ `workbenchTypes` 若类型在那）：加两字段 + 三 action；`setStoryboardPlan` 改语义；`swapCreationAiProject` 重置 editorOpen=false。
2. **主列 gate** `src/workbench/creation/CreationWorkspace.tsx`：`hasStoryboardPlan ? …` → `storyboardEditorOpen ? <StoryboardPlanEditor/> : <WorkbenchEditor/>`。
3. **编辑器收尾** `src/workbench/creation/storyboard/StoryboardPlanEditor.tsx`：
   - `onConfirm`：applyCanvasToolCall 后 `setStoryboardPlan(null)` → 改成 `commitStoryboardPlan()`（plan 留），保留 `setWorkspaceMode('generation')`。
   - `onDiscard`：`setStoryboardPlan(null)` → `discardStoryboardPlan()`。
   - header 加「收起」→ `setStoryboardEditorOpen(false)`。
4. **新卡片** `src/workbench/creation/storyboard/StoryboardPlanCard.tsx`（NEW，≤200 行）：读 plan/committed/editorOpen，渲三态（编辑中/草稿/已落画布），token-only，视觉对齐 `CommittedProposalCard`（caption/micro 字号、rounded-nomi、徽标）。摘要数据从 plan 现算（镜头数/锚数/总时长/前2镜头）。
5. **对话流挂载** `src/workbench/creation/CreationAiPanel.tsx`：messages.map 之后、composer 之前渲 `{storyboardPlan && <StoryboardPlanCard/>}`；`launchStoryboardPlanning` 收尾 assistant 文案去掉「左侧」改指卡片。
6. **持久化** `projectRecordSchema.ts` + `projectNormalize.ts` + `workbenchProjectSession.ts`：加 `storyboardPlanCommitted`（默认 false）。
7. **测试**：store 三 action 状态迁移单测；StoryboardPlanCard 三态渲染（可选 RTL）。

## 不动项
- `StoryboardPlanEditor` 内部字段编辑逻辑（锚卡/镜头卡/拖拽）不改——只改它的收尾 action 与 gate。
- `propose_storyboard_plan` 工具与规划师守卫不改。
- 画布侧 `AssistantTimeline`/`CommittedProposalCard` 不改（只借视觉范式）。

## 已知边界
- 旧项目若已有 in-flight `storyboardPlan` 但无 committed 字段 → normalize 默认 `committed=false`（当草稿处理），重开后卡片以「草稿·收起」出现，符合预期，无孤儿。

## 回滚
纯增量：revert 本批 commit 即回到「全屏即焚」。持久化加的字段向后兼容（缺省 false）。

## 验收门
- 五门全过。
- 真机走查：拆镜头→出草稿卡→打开编辑→收起（卡留）→再打开→确认落画布→卡转「已落画布」留在对话流→再次编辑可回去→切项目再回来卡还在（持久化）。
- 与样张四态逐项对账。
