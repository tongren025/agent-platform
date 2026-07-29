# 生成助手时间线 · 时序内联（修「吐字顺序倒挂 / 确认卡在上面」）

> 日期 2026-06-15。承接 commit b2d26b8（删 toast + 统一按钮）的后续根治。

## 问题（用户两次反馈，同一根因）

- 第一次：「下面已到下一阶段、有下一阶段的内容，但过一会上面才吐字」。
- 第二次（我把气泡挪到卡下方后）：「确认卡竟然在上面就是问题」。

**根因**：一轮对话只有**一个累积文字气泡**，但 agent 的真实时序是
`叙述(卡前) → 工具调用卡 →（用户确认）→ 总结(卡后)`。
单气泡只能整体放在卡的上方**或**下方：

- 放上方（原实现）→ 卡后的「总结」也被塞到卡上方 → 「上面过一会才吐字」。
- 放下方（b2d26b8 的反向改动）→ 卡前的「叙述」也被塞到卡下方 → 「确认卡在上面」。

两种「固定位置」都必错一半。**唯一正解 = 按到达时序内联**：卡前文字在卡上、卡后文字在卡下。

## 方案：文字按工具调用边界分段 + 卡片锚定到「它跟在哪条消息后」

### 数据
- `PendingToolCall` / `PendingToolCallLike` 加 `anchorMessageId?: string`。
- `CommittedProposalRecord` 加 `anchorMessageId?: string`（落盘可选；缺失=回退到队尾，旧会话不报错）。
- 组件态 `deviationAnchorId`（对账卡锚点，与本轮 committed 同源）。

### 流式处理（CanvasAssistantPanel.submitAgentMessage 重写）
单气泡 → **分段惰性气泡**：
- `activeId`=当前打开的文字气泡（null=未开）；`activeText`=本段累积（按 **delta** 累加，非 cumulative）。
- `anchorId`=下一张卡要跟在其后的消息 id；初值=用户消息 id，**仅当某气泡收到首个非空 token 时**更新为该气泡 id。
- 提交时先开一个占位气泡（'处理中…'）保响应感。
- `onContent(delta)`：activeId 为空则开新气泡；累加 delta；首字时 `anchorId=activeId`；rAF 合帧写入。
- `onToolCall`（decision==='ask' 入队卡）：`enqueue({…, anchorMessageId: anchorId})` → `sealBubble()`：
  - 空气泡（无正文）→ 删除（不留空壳）；非空 → 标 done。`activeId=null`。
  - 下一个 `onContent` 自然开「卡后」新气泡。
- 流结束：activeId 非空且有正文→定稿（含「只说不做」⚠️ 追加 / token footer）；空占位→有动作则删、无动作则 '已完成。'。

### 渲染（AssistantTimeline 重写 + 撤销 b2d26b8 的「trailing 挪到 liveSteps 后」）
- 每张 liveStep 带 `anchor`（pending 查 pendingToolCalls / committed 读 record / deviation 读 deviationAnchorId）。
- 渲染：按消息顺序遍历，渲染消息后紧接渲染**锚定到它**的卡；锚点无匹配/缺失的卡 → 队尾兜底（=旧行为，保安全）。
- 卡锚定到「卡前气泡」，「卡后总结」是更晚的消息 → 自然排到卡下方。导轨 connectDown 不变。

### 时序示例
`U → A(叙述) → [card 锚A] → B(总结)` 渲染为 `U, A, card, B` ✓
无前言：`U → [card 锚U] → B` 渲染为 `U, card, B`（无空壳）✓

## 不动什么
- 提议事务/补偿/对账/撤销执行体（proposalTxn/proposalUndo 执行逻辑）不碰，只加锚字段。
- 创作区 CreationAiPanel 不碰（它另有 turn 控制器；本轮只修生成区画布助手）。
- 持久化/归档形状只增可选字段，旧会话回退队尾。

## 回滚
本次改动集中在 4 个文件 + 1 plan：`git revert` 单 commit 即回到 b2d26b8 后状态。

## 验收门
- 五门全过（filesize/lint/typecheck/test/build）。
- 真机走查：agent 建节点一轮 —— 叙述在卡**上**、确认/已应用卡在中、总结在卡**下**；无空壳气泡；无 toast。
