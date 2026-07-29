# 给画布 Agent 加「按剧本时序排片到媒体轨道」工具

> 日期：2026-06-13　状态：实现中
> 触发：用户要让画布 Agent 把生成好的视频按剧本时序自动排进下方时间轴媒体轨道，
> 然后直接到预览/导出区出片。难点 = 排序要稳、准。

## 背景 / 现状（带 file:line）

- 送节点视频进时间轴的执行逻辑早就有：`sendGenerationNodeToTimeline.ts`（纯函数+端口注入）、
  `sendStoryboardToTimeline.ts`（批量铺，cursor 累加）。但**只有 UI 在用**——
  画布卡片右侧把手（`BaseGenerationNode.tsx:843`）拖/点、工具栏按钮（`CanvasToolbar.tsx:180`）。
- **画布 Agent 完全没有送时间轴的工具**：6 个 LLM 工具（`electron/ai/canvasTools.ts:66`）里没有这一项。
- 时间轴/预览/导出全链路已就位：生成区底部 `TimelinePanel`（`GenerationWorkspace.tsx:90`）→ 预览区
  `PreviewWorkspace` → `TimelinePreview.tsx` 导出 MP4。导出素材**只来自 `timeline.tracks[].clips[].url`**。

## 排序信号决策（核心：稳、准）

| 信号 | 可靠性 | 结论 |
|---|---|---|
| **`shotIndex` 镜号**（`shotNumbering.ts`） | ★★★ | **采用**。拆镜头时按提交顺序 `max+1` 写死 = 剧本时序，是存储身份、拖动不变 |
| LLM 读 title/prompt 判断 | ★ | 弃。镜头一多会数错/幻觉，非确定性 |
| 节点坐标 position | ☆ | 弃。布局按 kind 分列、用户可拖乱 |
| edge 连线（旧 `orderNodesByEdges`） | ☆ | 弃并删。引用 DAG 非时序链，真实分镜图上退化回输入顺序 |

**关键原则：把「排序」从 LLM 手里拿走。** Agent 只负责「触发」，工具内部用 `shotIndex` 确定性排序。

## 用户拍板（2026-06-13）

1. 排序依据 = **shotIndex 镜号**
2. 重复调用 = **追加到末尾**（非破坏，每次接在时间轴现有内容后面）
3. 范围 = **视频 + 关键帧占位**（未生成视频的镜头，用它的关键帧图片占位，保成片不断档）

**已向用户点明的冲突**：「追加」+「占位」叠加 → 重复调用会把整条序列复制接在后面（用户接受，
副本自行删；若嫌烦后续可一行切「清空重排」）。

## 方案

### 排片单位与占位（纯函数 `storyboardTimelinePlan.ts`）

以**视频节点**为剧本镜位（shots 分类、executionKind=video），按 `shotIndex` 升序：
- 视频已生成（`result.type==='video' && url`）→ 放视频 clip（video 轨）
- 未生成 → 找它的**关键帧**（入边 `first_frame`/通用边的 image 源节点）有图 → 放图片占位 clip（image 轨）
- 关键帧也没有 → 跳过并回报
- 关键帧节点（被某视频引用的）不再独立成片（dedup，靠 video 镜位代表）
- 单层模式 / 纯图故事板：没有视频节点的 image 镜头（未被任何视频消费）按 shotIndex 直接成片

**两轨共享 cursor 平铺**：视频 clip 落 video 轨、占位图 clip 落 image 轨，但 cursor 在两轨间顺序累加，
所以时间上首尾相接不重叠；导出 `resolveActiveClipsAtFrame` 跨两轨取当前帧活动 clip，成片连续。
（复用现成 `sendGenerationNodeToTimeline` 逐 clip 落自然轨 + cursor，无需强塞 image 进 video 轨。）

### Agent 工具（新增 `arrange_storyboard_to_timeline`）

接 4 处（与现有 6 工具同构）：
1. `electron/ai/canvasTools.ts` — schema（参数：可选 `nodeIds` 子集；省略=整条故事板）+ `canvasToolNames`
2. `electron/ai/agentChatV2.ts` `buildCanvasToolsForV2` — 注册
3. `src/workbench/generationCanvas/agent/gate.ts` `TOOL_META` — `{ writes: true }`（写时间轴，需用户确认；
   锁不变量不涉及，evaluateLock 对未知名返回 null）
4. `src/workbench/generationCanvas/agent/applyCanvasToolCall.ts` — 分发分支：调 `arrangeStoryboardToTimeline`
   （append 到时间轴末尾），回结构化结果给 LLM（sent N / skipped 镜号+原因，供其向用户复报）

附带：
- `toolCallSummary.ts` `summarizeToolCall` 加人话摘要（pending 卡/步骤标题）
- `canvasPromptContext.ts` 行格式加 `shotIndex` + 视频标记，让 Agent 决策/复报能引用镜号
- `skills/workbench-generation/SKILL.md` 加工具说明 + 默认行为（「视频都生成好后，用户说『排好/排进时间轴/可以预览了』时调用」）

### P1：删旧

- 删 `orderNodesByEdges`（不可靠的 edge 排序）+ `storyboard.test.ts` 里对应用例
- 手动工具栏按钮（`CanvasToolbar.tsx`）的 `sendStoryboardToTimeline` 改用 shotIndex 排序（统一一份排序真相），
  tooltip「按时序连边排序」→「按剧本镜序排序」
- 两个入口（手动选中子集 / Agent 整条故事板）共享 `sendGenerationNodeToTimeline` 落点核心 + 共享 cursor 平铺 helper

## 不动什么

- 不碰拆镜头链路、不碰 storyboard.planner skill（它仍只 create_canvas_nodes）
- 不碰导出/预览渲染、不碰节点右侧手动把手
- 不改时间轴轨道数据模型（仍 image/video 两轨、clip 为单位）

## 回滚

新增工具是叠加的；回滚 = 从 4 处摘掉工具 + 恢复 `orderNodesByEdges`。单一 commit，可整体 revert。

## 验收门

1. `pnpm run typecheck` + `npx vitest run`（新增 `storyboardTimelinePlan` 纯函数单测：
   乱序 shotIndex 正确排序 / 视频优先 / 缺视频走关键帧占位 / 关键帧 dedup / 跳过未生成）绿
2. `pnpm build` 绿
3. R13 真机走查：拆镜头→（模拟）生成→对 Agent 说「按剧本把视频排进时间轴」→ 截图看媒体轨按镜序铺好→
   切预览区能连续播放→导出面板可达。人眼判断顺/对。
