# 分镜→视频(方案B) + 批量生成体验 修复方案

> 触发：宣传片录屏暴露的 bug。用户已拍板 **方案 B**（推翻 image-first，分镜里直接是视频/可选模型参数）。
> 状态：待用户拍 ① 的批量 UX 小决策后执行。
> 关联记忆：[[storyboard-image-first-convergence]] / [[reconcile-edge-drop-and-card-redesign]] / connection-reference。

## 背景：四个 bug 的归属

| # | 症状 | 结论 |
|---|---|---|
| ② | 连线来的参考图「×」叉不掉 | ✅ 已修(f57bd7b,分支)：边来源断边/上传删meta，五门绿+回归测试 |
| ③ | 分镜显示时长(视频)、落画布却是图片 | 本是 2026-06-15 image-first 设计；**用户拍板 B 推翻** → 本方案处理 |
| ④ | 分镜里不能选模型/参数 | 缺口；**B 一并补** |
| ① | 框选批量生成→弹窗 + 只生成几个 | 运行器/UX，根因已定(见下) → 本方案处理 |

## 一、方案 B：分镜 = 视频镜头 + 可选模型/参数

**范围（改）**
- IR：`PlanShot`(storyboardPlan.ts:38-46) 加可选 `modelKey?/modeId?/params?`；同步 `planShotSchema`(+漂移守卫)。
- 转换器：`storyboardPlanToCreateNodesArgs`(storyboardPlan.ts:228-292) 镜头 kind 由写死 `'image'` 改为**按"有时长/视频模型"建 `video` 节点**；`durationSec` 传入节点 params；模型/参数"用户选了优先、没选回退默认视频模型"。
- 编辑器：`StoryboardShotCard.tsx` 时长档旁加**模型选择器**(复用 `useModelOptions('video')` + `NomiSelect`) + 关键参数(比例/清晰度)；时长上限按所选模型钳。
- 默认解析：`resolveStoryboardVideoDefault`(已存在，commit 103ec26) 作为"用户没选时"的兜底。

**不动**
- 锚(定妆/参考卡)仍是 image（角色/场景定妆本就该是图）。
- 参考边能力校验(referenceEdgeCapability)、resolveReferenceSlots 不动。

**评测影响(必须同步，否则评测红)**
- `storyboardPlan.test.ts` 钉死"镜头 kind=image"的用例要改成 video；可能涉及 evals/datasets/storyboard。
- 评测集里 image-first 的断言要回填。

**回滚**：B 是单 commit 系列；保留 `2026-06-15-storyboard-default-image-and-edges.md` 文档，回滚=revert 本系列。

## 二、Bug ① 批量生成：根因 + 修法

**根因(已定)**
- 弹窗：`handleBatchGenerate`(GenerationCanvas.tsx:345-358) 仅当"≤1节点+无边+无blocked"才直跑，否则一律 `open(plan)` 弹 BatchPlanOverlay。多镜+连线的分镜批量 100% 触发。
- 只生成几个：`buildDependencyWaves`(dependencyWaves.ts:51-60) 把"上游参考卡未生成且不在选择集内"的镜头标 `blocked`，确认后只跑 `waves`(blocked 排除)。用户框了镜头没框未生成的参考卡 → 镜头大批 blocked。

**修法(待 ① 决策定具体形态)**：
- 弹窗：`nothing-blocked` 时不弹、直接跑（去掉"我都点了还弹"的冗余）；仅当有 blocked 才提示。
- blocked：把"上游参考卡"**自动纳入级联**——一键"连参考卡一起生成"(先跑参考卡波次、再跑镜头)，而不是默默只跑一部分。或至少把 blocked 原因做成显眼的人话行内提示，给"一起生成"按钮。

## 三、① 批量 UX —— 已拍板：「不弹窗 + 缺啥提示啥」

- **去掉模态弹窗**：`handleBatchGenerate` 不再 `open(plan)`；直接 `runGenerationNodesByPlan(plan)` 跑能跑的波次。
- **blocked → 行内提示 + 一键级联**：当 `plan.blocked.length > 0`，在画布上挂一条**非模态行内提示**「X 个镜头在等参考卡生成」+ 按钮「连参考卡一起生成」。点按钮 = 用 `collectUngeneratedReferenceAncestors` 把缺的上游参考卡并入选择集 → 重算波次 → 跑（参考卡先、镜头后）。**这一步是扣费前的明确同意**（替代原弹窗的成本确认职责）。
- **加新删旧(P1)**：`BatchPlanOverlay` 模态 + `useBatchPlanPreviewStore` 若无其他使用方 → 删除；agent 工具 `run_generation_batch` 路径(applyCanvasToolCall 走 runPlanWithToasts)不受影响，单独核对。
- **行内提示用设计 token**(R8)，复用现有 toast/notice 原语，真机 R13 走查确认不遮挡。

## 执行顺序（已定）

## 执行顺序（定后）
1. ① 批量 UX（小、立刻见效、不依赖 B）→ 单独 commit。
2. B：IR+转换器+编辑器+默认兜底 → 改 + 同步评测集 → 单独 commit 系列。
3. 五门 + 真机走查(R13)：框选批量生成全部成功、分镜选视频模型落画布是视频节点带时长。
