# 画布分镜四问：图片分镜模式 + 三个显示/工具 bug 修复

> 2026-07-02 起。来源：用户 dogfood 画布反馈四条。四路只读调查已完成，根因均已定位到 file:line。
> 用户已拍板方向（AskUserQuestion 2026-07-02）：
> - **图片分镜 = 拆镜头加「图片/视频」模式开关，默认图片**（技能引擎暂不接线，先直接解决摩擦）。
> - **图片镜头能一键转成视频镜头**（image→video 桥，image-first：先定画面→再图生视频）。

---

## 背景：四条反馈 → 四个独立根因

| # | 用户反馈 | 根因（file:line） | 类型 |
|---|---|---|---|
| ① | 技能是图片分镜，却总出视频分镜 | 拆镜头**双重写死**：(a) `runStoryboardPlanner.ts:34` 技能写死成内置纯视频 planner；(b) `storyboardPlan.ts:282-291` 落画布转换器无条件建 `kind:'video'`+时长+视频模型；IR 无图片镜头字段。playbook 引擎 `playbookOrchestrator.ts` 是**死代码**（仅测试/注释引用，生产零调用） | 架构缺口 |
| ② | 中转站不能起名字、多家分不清 | **字段已有**（`Vendor.name`，接入向导"来源名称"能填并落库）。显示 bug：`OnboardingDrawer.tsx:220-231` 把所有第三方中转塞进单张「其他模型」卡，`ModelChipGroups`/`modelChipGrouping.ts` 只按 kind 分组、chip 只显示模型名，**vendorName 从不渲染** | 显示 bug |
| ③ | 节点写"分镜"但内容/编号都不显示 | (a) `shots` 分类默认 renderKind=`shot-frame`（`projectCategories.ts:62`），但 **`ShotFrameNode` 组件从未实现**——`resolveRenderKind.ts:6,21` 把它当 explicit 原样返回、`NodeCardBody.tsx:26-34` 不认它 → 镜头节点退化成图片空壳，prompt 无专属展示区；(b) 「镜头 N」徽标只在 `PendingGenerationPlaceholder`（未选中+无 result）渲染（`CardCommon.tsx:29-33`），生成出画面/选中后就消失 | 显示 bug×2 |
| ④ | 整理分镜堆一起、助手也分不了 | (a) 整理算法 `tidyCanvasLayout.ts:197-199` 在节点**无连线+无 shotIndex** 时排序键坍缩、退回原坐标铺网格 → 语义排序失效（与 ③ 序号同源）；(b) 画布助手工具集 `canvasTools.ts:212-221` **没有整理/移动节点工具**，`tidyCategory` 未暴露为 agent 工具 → 助手无手可动 | 算法退化 + 工具缺口 |

---

## 范围（要做的）

### S1 — 图片分镜模式（①，核心）
- **数据模型加镜头种类**：`PlanShot`（`storyboardPlan.ts:38-52`）+ `storyboardShotSchema`（`canvasTools.ts:95-105`）加 `shotKind: 'image' | 'video'`（默认 image）。图片镜头 `durationSec` 变可选。
- **落画布转换器分支**：`storyboardPlanToCreateNodesArgs`（`storyboardPlan.ts:242-303`）按 `shotKind` 分支——图片镜头建 `kind:'image'` 节点（不写 duration、绑图片模型、不连视频参考边）；视频镜头维持现状。
- **拆镜头模式开关**：创作区拆镜头入口（`CreationAiPanel.tsx` 附近）加「图片 / 视频」二选一，**默认图片**。开关值透传进 `runStoryboardPlanner` → planner 按模式产出。
- **planner 技能双模式**：内置 planner SKILL.md 拆成/条件化图片 vs 视频两套方法论（图片模式写图生图提示词、不写运镜/时长/转场）。**注意 P1：不新增并行版，用同一 planner 按模式切**。
- 方案编辑器 `StoryboardPlanEditor.tsx` / `StoryboardShotCard.tsx`：图片镜头卡不显示"时长"，显示"图生图提示词"。

### S2 — 图→视频桥（①-b）
- 图片镜头节点（或方案卡）上加「转视频镜头」动作：复用现有 image→video 生成链路，把该图片镜头升级/派生成视频镜头（绑视频模型、可填时长）。
- 落点：优先做在画布节点操作层（图片镜头节点上一个显式按钮），而非隐藏菜单。

### S3 — 分镜节点显示修复（③）
- **实现 `shot-frame` 节点体**：让 `shots` 分类节点始终显示「镜头 N + 画面内容（prompt 首行/摘要）」，无论是否生成、是否选中。清掉 `shot-frame` 死引用（P1：要么真实现、要么删枚举回退到 image 卡——优先真实现，这是分镜的一等展示）。
- **序号常显**：把「镜头 N」徽标从"仅占位态"提到"生成后/选中时也显示"（`CardCommon.tsx` + `BaseGenerationNode.tsx` 的 result 分支叠加角标）。

### S4 — 整理 + 助手工具（④）
- **助手加「整理画布」工具**：`canvasTools.ts` 声明 + `applyCanvasToolCall.ts` 接 `tidyCategory`。让画布助手能触发整理。
- **整理退化缓解**：随 S3 让镜头节点稳定带 shotIndex 后，`tidyCanvasLayout.ts` 排序自然恢复分镜序；复核无连线镜头也能按 shotIndex 排。

### S5 — 中转站命名显示（②）
- **已接入列表按 vendor 拆卡**：`OnboardingDrawer.tsx:220-231` 把 `otherModels` 按 `vendorKey` 分桶，每家一张/一段卡，卡名用 `vendorMeta.get(vendorKey)?.name`，不再统一叫"其他模型"。
- **chip 补 vendorName**：`ChipModel` 加 `vendorName`，`OnboardingDrawer.tsx:73-78` join `vendorMeta`。
- （可选）relay 预设预填可读默认名，减少留空回退成 `apimart-ai` 丑名。

---

## 不动项（明确不做）
- **不接线 playbook 引擎**（用户已拍：暂不）。playbook 仍是标签展示；但**不删**死代码，留作后续正式管线的地基。
- 不改 `Vendor` 存储 schema（②字段已存在）。
- 不改通用生成画布 Agent 的 `create_canvas_nodes` 路径（那条本来就有 image 分支）。
- 不动视频分镜现有行为（图片是新增模式，视频维持，用户可切）。

## 回滚
- 每个 S 独立 commit，可单独 revert。
- S1 IR 加字段用可选 + 默认 image，旧项目（无 shotKind）读取时按现有行为兜底（避免迁移破坏，守 never-wipe-user-data）。

## 验收门（R11 五门 + R8 对账 + R13 走查）
- **样张拍板**：S1 开关、S3 分镜节点体、S5 中转站列表、S2 转视频按钮 —— 均先出**真实布局样张**给用户拍板再实现（禁脑补，栽过 3×）。
- **五门**：`pnpm run gates` 全过（filesize→tokens→lint→typecheck→test→build）。
- **测试**：S1 转换器按 shotKind 分支的单测；S3 shot-frame 渲染快照；S4 整理排序含 shotIndex 的单测；S5 分组按 vendor 的单测。
- **R13 走查**：拆一个真实小说片段 → 图片分镜 → 画布看到带编号+内容的图片镜头 → 整理成序 → 选一张转视频。截图人眼判断。

## 执行顺序（按"清晰+高值+低风险"先行，① 最大放后）
S5（中转站显示，纯 UI 快赢）→ S3（分镜编号+内容，直接解决"看不懂顺序"）→ S4（整理+助手工具）→ S1（图片分镜模式，最大）→ S2（图→视频桥）。
每块：读真实 UI → 出样张 → 拍板 → 实现 → 五门 → 走查 → commit。
