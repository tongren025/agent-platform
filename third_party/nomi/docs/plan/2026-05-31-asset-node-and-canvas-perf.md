# 画布：素材节点（≠生成节点）+ A1.5 组件抽取

> 状态：✅ 已完成（A1.5 step 1–6 全部落地，tsc/build/test 全绿）

## 执行结果（回填 2026-06-01）

| 步 | commit | 内容 |
|---|---|---|
| 1 | `4c88978` | 抽 `NodeGenerationComposer`（composer + 生成依赖出壳）|
| 2 | `b9ce044` | 抽 `useNodeImageEditing` hook + `NodeImageEditToolbar`（图片工具条/handler/canvas 辅助出壳；3 个 handler 直接产 `asset`）|
| 3 | `4792969` | registry 加 `asset` 插件；壳 `isAssetKind`→ 关 composer、强制 `renderKind=undefined`、image∨asset 才挂工具条/crop overlay |
| 4 | `464cbac` | 素材创建路径产 `asset`：assetImportAdapter / 文件树拖入 / 全景截图（空状态 CTA 保持 `image`，它是新建生成节点）|
| 5 | `9770744` | `normalizeLegacyImageAssetKinds` 进 hydrate 链 + vitest（导入/切图/裁剪→asset，真生成图保持 image）|
| 6 | — | tsc 0 错；build 过；test 402 passed +1 todo；grep 无残留素材 `kind:'image'` 路径 |

剩余非测试 `kind:'image'` 均为合法生成路径：registry 的 image 插件定义、空状态 CTA、种子默认画布节点。验收门 1–6 全过。

---

> 触发：①画布上"什么都是生成卡片"——导入图、裁出来的图不该有提示词/参数/重新生成（噪音，规则2）；②拖拽卡顿（见 §2 更正）。

## 1. 用户价值

画布上其实有两种东西，现在混成一种：
- **生成节点**：有提示词 + 模型 + 能重新生成。重卡片（composer）合理。
- **素材**：导入的图、切图/裁剪/旋转出来的图。它就是一张图 / 一个输入。挂"提示词/参数/重新生成"= 噪音。

用户要：素材卡**去掉** composer（提示词 + 参数卡 + 重新生成/模型选择）；**保留**编辑功能（切图/截图/裁剪/旋转翻转）、连线（用作参考）、缩放、拖到时间轴、删除。

## 2. 性能更正（重要）

旧版 §2 说"`BaseGenerationNode` 未包 `React.memo`"——**已过时**。现在代码（1485–1492 行）已包 memo + 自定义比较器，且满是 `v0.7.1/v0.7.2 perf` 痕迹（primitive 订阅、rAF 批量 move、boolean canGenerate）。**"拖一张所有卡重渲染"的根因前面版本已修。**

→ 旧计划"步骤1 加 React.memo"是**空操作，删除该步**。若仍卡，是别的原因（composer 订阅 / 图片重解码 / 画布层重渲染），需**重新 profile**，单独立项，不在本轮。

## 3. 架构事实 + A1.5 方案

`BaseGenerationNode`（1495 行）已经是"壳 + 按 kind 分发"：拖拽/缩放/端口/header/时间轴/preview ≈500 行壳（kind 无关）；composer、图片工具条、卡片分发（角色/场景/道具/音频已是独立组件）、全景，各自按 kind 分叉（已 ≥5 处）。

**纯 A1**（原地加 `isAssetKind`）短期最省，但每加一个图片功能就多一处散落 if，长期纠缠。**A2**（素材全独立组件）要复制 ≈500 行壳 → 两份漂移 → 违反规则1。

**A1.5（已选）**：把两个"功能块"抽成可组合组件，壳只留一个：
- `NodeGenerationComposer.tsx` ← 搬出 composer（1384–1453）。自带 store 订阅 + runner + NodeParameterControls + 布局计算。**仅生成类 kind 挂它**。
- `useNodeImageEditing.ts`（hook）+ `NodeImageEditToolbar.tsx` ← 搬出图片工具条（1066–1158）+ 3 个 handler（切图/裁剪/旋转翻转）+ 画布辅助函数。**图片类和素材类都挂**。crop overlay 仍在 preview，由 hook 的 `cropMode/setCropMode` 驱动。
- 壳回归纯容器。以后"图片功能一直加" = 进 `useNodeImageEditing`/`NodeImageEditToolbar` 一处，生成节点和素材节点自动都有，不碰生成逻辑。

## 4. 新增节点类型 `asset`

`registry.ts` 增 `asset` 插件：`menuLabel:'素材'`、`icon:'image'`（复用，不动 icon 注册）、`catalogKind:'image'`（惰性，无 executionKind 不会生成）、`providesImageReference:true`（可作参考被连线）、`agentCreatable:false`、**无 executionKind**、`quickAdd:false`（用户不手动加空素材）。复用 `BaseGenerationNode` 渲染（A1.5 后壳已干净）。

壳里 `isAssetKind = node.kind==='asset'`：
- 不挂 `NodeGenerationComposer`。
- 挂 `NodeImageEditToolbar`（与 image 同条件）。
- **强制 `renderKind=undefined`**（走纯图片预览）——否则素材落进 cast/scene 分类会被 renderKind 推断成角色卡/场景卡（边界 1）。
- 不渲染生成占位（"等待生成"/"拖图当首帧"）——素材必有 result.url。

## 5. 新素材都产出 `asset`（含本地画布衍生）

把现有产素材的创建路径全改成 `kind:'asset'`（本地画布操作的衍生物没有自己的 provenance，语义上全是素材 —— 边界 2）：
- `adapters/assetImportAdapter.ts:167`（导入 / OS 拖入）
- `components/GenerationCanvas.tsx` 文件树拖入处
- `nodes/BaseGenerationNode.tsx`：切图 `handleImageGridSplit`、裁剪 `handleCropConfirm`、旋转翻转 `handleImageTransform`、全景截图 `handlePanoramaScreenshot` 产出的子节点（搬进 hook 后改这几处）

## 6. 老项目规整

`project/projectMediaMigration.ts` 节点遍历加一条：`kind==='image'` 且"素材特征"→ 改 `kind:'asset'`。
- 谓词（保守，避免误伤真生成节点）：`meta.localOnly===true` **或** `meta.source ∈ {local-drop, asset-upload, workspace-file, image-crop, image-rotate-left, image-rotate-right, image-flip-h, image-flip-v, panorama-screenshot} 或以 image-grid-split-/panorama- 开头`，**且**无 `result.provenance`。
- 配 vitest：混合 nodes，断言导入/切图/裁剪图→asset，真生成图→保持 image。

## 7. 不动什么
- 生成节点（text/character/scene/image/keyframe/video/shot/output/panorama 的生成行为）全不动。
- 切图/裁剪/旋转翻转/连线/缩放/时间轴拖拽的**实现**不动，只是搬进 hook/组件并让素材也复用。
- `result.url` 图片预览管线不动。文件夹/存储/时间轴/导出/左侧面板不动。
- 视频/音频导入暂不转 asset（边界 4），本轮只做图片，后续再说。

## 8. 回滚
- 当前 main（本地领先）上每步独立 commit，失败 `git reset` 回上一节点。
- 每个 Bash 命令 `cd <worktree> &&` 或 `git -C <worktree>` 自锚定（见 CLAUDE.md）。

## 9. 验收门
1. 导入图 / 文件树拖入图 / 切图/裁剪/旋转产物 → 素材卡：无提示词、无参数卡、无重新生成/模型选择。
2. 素材卡仍可：切图/截图/裁剪/旋转翻转、连线被引用、缩放、拖到时间轴、删除。
3. 生成节点不受影响：提示词/参数/重新生成照旧。
4. 老项目打开：历史导入/切图/裁剪图变素材卡；真生成图仍是生成卡。
5. `pnpm exec tsc -p electron/tsconfig.json` 0 错；`pnpm build` 过；`pnpm test` 全绿（含新规整测试）。
6. grep 无对旧 `kind:'image'` 素材产出路径的残留。

## 10. 步骤（每步独立 commit）
1. 抽 `NodeGenerationComposer`（搬 composer + 生成相关 import 出壳）。
2. 抽 `useNodeImageEditing` + `NodeImageEditToolbar`（搬图片工具条/handler/辅助函数出壳）。
3. registry 加 `asset` kind；壳按 `isAssetKind` 关 composer/占位 + 强制 renderKind=undefined + 开 image 工具条。
4. 创建路径改产 `asset`（import / 文件树拖入 / 切图 / 裁剪 / 旋转翻转 / 全景截图）。
5. `projectMediaMigration` 加素材规整 + vitest。
6. 验证（tsc/build/test/目测）。
