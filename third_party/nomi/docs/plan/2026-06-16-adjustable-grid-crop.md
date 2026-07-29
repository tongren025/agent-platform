# 可调切图（方案 A）执行文档

> 用户拍板：方案 A —— 外框 + 网格分割线都可拖，行列数仍固定 2×2 / 3×3。
> 默认线在等分位置，用户不动直接确认＝旧的等分效果；想切准就把白线拖到内容真实边界。

## 背景 / 根因

`切图`（四视图 2×2 / 九宫格 3×3）现在走 `splitImageIntoGrid`，**直接按 `图宽÷gridSize` 平均切，切线钉死不可调**。遇到本身不均匀的拼图/海报就切歪 = 用户说的"不准确"。

`裁剪` 已有可拖取景框 `ImageCropOverlay`（归一化坐标 + 4 角拉伸 + 整体拖 + 框外压暗 + ✓/✕）。本质上「切图」= 裁剪框 + 内部分割线。

## 范围（改 4 文件 + 1 新几何模块 + 1 单测）

1. **统一组件**：`render/ImageCropOverlay.tsx` → `render/ImageCropGridOverlay.tsx`（重命名即删旧，P1）。
   - 新增 `gridSize: 1 | 2 | 3` prop。`1` = 纯裁剪（无内线，行为与今天逐像素一致）；`2/3` = 多 `gridSize-1` 条可拖横/竖线，默认等分位置。
   - 内线坐标 = **框内归一化分数**（随外框缩放自动跟随）。相邻线/边最小间距 `MIN_GAP`。
   - `onConfirm({ rect, cols, rows })`：`cols/rows` 是框内切分分数（升序，长度 `gridSize-1`；裁剪时为空）。
2. **几何纯函数** `render/cropGridGeometry.ts`：`computeGridCells(rect, cols, rows)` → 一组 image 归一化 cell `{x,y,w,h,row,column}`。裁剪=1 cell（即外框本身）；切图=N cell。**可单测**。
3. **单测** `render/cropGridGeometry.test.ts`：等分/自定义线/裁剪退化/外框偏移 四类断言。
4. **hook** `useNodeImageEditing.ts`：
   - 删 `splitImageIntoGrid`（cell 化后用现成 `cropImageRegion` 逐 cell 裁）。
   - 状态 `cropMode + splittingGridSize` → 统一 `editGrid: 1|2|3|null` + `openEdit(grid)` / `cancelEdit()`。
   - `handleEditConfirm({rect,cols,rows})`：`computeGridCells` → 逐 cell `cropImageRegion` → 建节点。1 cell 走裁剪文案/单节点布局；N cell 走切片文案 + 按列宽/行高累加的展开网格布局（兼容不等分 cell）。meta.source 不变（`image-crop` / `image-grid-split-NxN`）。
5. **toolbar** `NodeImageEditToolbar.tsx`：props `cropMode/splittingGridSize` → `editGrid`；裁剪/切图/变换在 `editGrid!==null || imageOpBusy` 时禁用。菜单项仍是四视图(2)/九宫格(3)，点击改为"打开可调框"。
6. **壳** `BaseGenerationNode.tsx`：overlay 挂载条件 `cropMode` → `editGrid!==null`，传 `gridSize={editGrid}`；接 `handleEditConfirm`/`cancelEdit`；toolbar 的 onCrop→openEdit(1)、onGridSplit(g)→openEdit(g)。

## 不动什么

- 生成 / 参考边 / 落盘（`persistEditedNodeImageToLocal`）/ `cropImageRegion` / `transformImage` / `imageGridTileNodeSize` 全不动。
- 「跳出新节点、原图零改动」原则不变；meta.source 字符串不变（下游/迁移不受影响）。
- 全景「四视图截图」（PanoramaViewer）与本次无关，不碰。

## 回滚

单 commit。回滚即 `git revert`。组件重命名 + hook API 改名集中在这 4 文件，无跨模块连带。

## 验收门

- `computeGridCells` 单测绿（等分=旧行为的等价证明）。
- 五门：check:filesize / check:tokens / lint:ci / typecheck / test / build。
- 真机走查：图片节点 → 切图 → 拖线/拖角 → 确认 → 切出的瓦片边界跟拖的线一致；默认不动确认 = 与旧等分像素级一致；裁剪路径仍单节点正常。token-only（复用 ImageCropOverlay 既有 class，无新 px/hex）。
