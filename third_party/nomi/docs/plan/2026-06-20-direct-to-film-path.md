# 傻瓜直达出片路径（绕过画布）

> 2026-06-20 ｜ 状态：**方案 + 样张已出，待用户拍板**（未实现）
> 起因：E5 体验审计两个独立 agent（设计师 + 真实用户）共识的**最劝退点**——
> 「从漂亮的分镜卡一脚踩进节点画布毛线球」是体验悬崖；诉求 = 给「只想出片、不想懂节点」
> 的用户一条**绕过画布的傻瓜直达路径**，画布降为「需要才打开」的高级选项。
> 样张：`storyboard_direct_to_film_path`（已展示，可点两条路径体验）。

---

## 0. 一句话方案

在「分镜方案卡」这个**魔法时刻**（用户最惊喜的一步）给两条出口，而不是只有「落画布」一条：

| 出口 | 给谁 | 干什么 |
|---|---|---|
| **一键出片**（主，推荐） | 不想懂节点的创作者 | 确认 → 自动生成全部画面 → 自动排进时间轴 → 直接落「预览」。全程不显示画布。 |
| **落画布精修**（次，现有） | 想控制节点/参考/参数的进阶用户 | 现有「确认落画布」路径不变。 |

出片后在预览区留一条轻链接「想改某个镜头？打开画布精修 →」——画布从**强制必经**变成**按需可选**。

---

## 1. 为什么这条可行（关键：基本不造新基建，是「编排 + 入口」）

E5 审计 + 现有文档确认：从「方案」到「成片」的每一环**都已存在**，只是今天散成画布上的手动动作、没串成一条龙：

| 环节 | 现有能力 | 来源 |
|---|---|---|
| 方案 → 画布节点 | `storyboardPlanToCreateNodesArgs`（image-first：镜头=image 关键画面节点 + shot→shot 链） | [storyboard-plan-document-flow](2026-06-13-storyboard-plan-document-flow.md) |
| 批量生成 | 「生成全部 / 选中」run-all（画布工具栏 / 选区工具栏 `data-storyboard-run-all`） | `GenerationCanvas.tsx` 选区工具栏 |
| 排进时间轴 | `sendStoryboardToTimeline.ts` 批量铺 + `storyboardTimelinePlan.ts` 按 `shotIndex` 确定性排序（视频/关键帧占位） | [agent-arrange-storyboard-to-timeline](2026-06-13-agent-arrange-storyboard-to-timeline.md) |
| 时间轴 → 预览 → 导出 | 全链路已就位，导出只读 `timeline.tracks[].clips[].url` | 同上 |

> **结论：傻瓜直达 ≈ 把「生成全部 + 排片到时间轴 + 切到预览」串成一个编排动作 + 一个入口按钮。**
> 不新增生成/时间轴/导出基建（风险低）。Explore 已确认四个核心函数全部就位且是纯/单一执行口。

### 一条龙：最少需串起的现有函数（Explore 实勘）
```
收集镜头/参考节点 id（isShotNumberedNode + shots 分类）  shotNumbering.ts
  → buildDependencyWaves(ids)                          runner/dependencyWaves.ts:30
  → await runGenerationNodesByPlan(plan)               runner/generationRunController.ts:323
  → arrangeStoryboardToTimeline({})                    agent/sendStoryboardToTimeline.ts:122
  → setWorkspaceMode('preview')                        workbenchStore.ts:306
（导出可选）→ dispatchEvent('nomi-request-export')      TimelinePreview.tsx:282 → exportApi
```
**唯一缺口**：一个把上面顺序 `await` 串起来的前端编排函数 + 一个「一键出片」按钮。
**关键风险（必须避开）**：现有手动「生成 N 个」走 `runPlanWithToasts`（`batchPlanPreview.ts:45`）是 **fire-and-forget**（吞 await 只弹 toast）。直达编排**不能复用它**，必须直接 `await runGenerationNodesByPlan(...)` 拿完成回执，否则会在「图还没出」时就排片 → 落一堆「未生成跳过」。
- 「确认落画布」按钮：`StoryboardPlanEditor.tsx:240-253`，onConfirm 链路 `:77-110`（已自动切生成区 + fit）
- 手动批量生成入口：`GenerationCanvas.tsx:350 handleBatchGenerate`（须先框选，**无「全部」按钮**）
- tab 切换：`NomiAppBar.tsx:168 NomiStepper` → `WorkbenchShell.tsx:156` → `setWorkspaceMode`
- 排片纯函数：`storyboardTimelinePlan.ts:57 planStoryboardTimeline`（按 shotIndex，视频优先→关键帧占位→跳过）

> ⚠️ **文档/代码不一致（需你知悉，不自行定）**：`storyboard-plan-flow` 文档写「2026-06-15 改 image-first，镜头落 `kind:'image'`」，但 Explore 实读当前代码 `storyboardPlan.ts:282-291` 镜头仍落 `kind:'video'`（且刻意不连 shot→shot 链 `:297`）。这直接影响决策 A（一键出片是出图快版还是视频）。**两者矛盾 → 按 R3 停下上报，请你确认现状到底是哪种**，再定 A。

---

## 2. 流程（三屏，见样张）

1. **方案卡**（创作区，魔法时刻）：9 镜就绪，两个按钮「一键出片 / 落画布精修」+ 一行「规划免费 · 出片才用额度」。
2. **出片中**（真实进度，遵 `No fake progress` 铁律）：
   - 「生成画面 N / 9」**真计数**（逐镜回填，不是假 spinner / 假进度条）
   - 逐镜状态列表：等待 / 生成中 / 已生成
   - 全部完成 → 自动 `storyboardTimelinePlan` 排片 → 切「预览」tab
   - 任一镜失败：人话报「镜 X 没出来，已用占位/可重试」，不闷掉（错误透传纪律）
3. **预览**：播放器 + 时间轴条 + 「导出 MP4」+ 轻链接「打开画布精修」。

铁律继承（来自 storyboard-plan-flow）：① 规划免费、执行才花钱；② 跨镜参考图先生成再出镜头（一键出片内部仍按「锚点先生成 → 镜头后生成」的依赖序，不是无脑并发）。

---

## 3. 需要你拍板的取舍（R3）

### 决策 A：「一键出片」生成什么？（image-first 现状下）
| 方案 | 出片内容 | 代价 |
|---|---|---|
| **A1 出关键画面成片（推荐，贴 image-first）** | 9 张关键画面图按 shotIndex 排成「图片成片」（带转场/Ken Burns 可选） | 不自动做视频动画化，省额度快出片；想动起来再去画布「动画化」 |
| A2 出视频成片 | 每镜生成视频 | 额度大、慢；与当前 image-first 默认相悖 |
| A3 让用户选 | 出片前问「图片快版 / 视频完整版」 | 多一步选择 |

### 决策 B：入口措辞与位置
| 方案 | 用户看到 |
|---|---|
| **B1 方案卡双按钮（推荐，样张所示）** | 「一键出片」主 + 「落画布精修」次，并排 |
| B2 单按钮 + 高级折叠 | 只显「一键出片」，画布入口藏进「⋯ 高级」 |

### 决策 C：失败镜头策略
| 方案 | 行为 |
|---|---|
| **C1 占位续片 + 标记可重试（推荐）** | 失败镜用关键帧/占位，成片不断档，预览里标红「重试」 |
| C2 中断报错 | 任一失败即停，回方案卡 |

---

## 4. 不动什么 / 回滚
- **不改生成 / 时间轴 / 导出基建**（只编排现有函数）
- 「落画布」现有路径**完全保留**（加新不删旧：这是并存的两条出口，不是替换——画布仍是真相源，一键出片只是自动走了一遍画布会做的事）
- 回滚 = 移除编排器 + 入口按钮，方案卡退回单「落画布」

## 5. 验收门
- 真机：方案卡点「一键出片」→ 不出现画布 → 落预览有可播草稿 → 导出有效 MP4
- 进度真实（生成 N/M 真计数，无假进度）
- 失败镜头人话透传 + 占位续片
- 「打开画布精修」能从预览跳到画布且节点/时间轴一致

## 6. 现状勘查已完成（见 §1）
Explore 已回填全部 file:line + 一条龙函数链 + 唯一缺口 + 风险点。可行性确认：**低风险，纯编排**。
实现工作量预估：1 个编排函数（~40 行）+ 1 个按钮 + 进度 UI（约 1 个新组件）。落在 `src/workbench/creation/storyboard/` 或新 `directToFilm.ts`，不碰生成/时间轴/导出基建。
