# 画布图片:等比缩放 + 裁剪（Figma 式图片操作）

> 状态：待用户拍裁剪持久化方案后实施
> 触发：用户 —— 生成完只想要图在画布上显示，那张图也得能「按比例放大缩小」+「裁剪」+ 一些 figma 图片功能。

## 0. 用户原话拆解

- 卡片以前能拉伸调大小 → 图片节点也要能拉伸，且是**按比例**放大缩小。
- 图片要能**裁剪**。
- 其它 figma 图片功能（旋转/翻转/滤镜…）：本轮不做（范围发散、价值不聚焦，等具体场景再加）。

## 1. 现状

`BaseGenerationNode.tsx`：
- 选中后 8 个拉伸把手（四边 + 四角）。`handlePointerMove`（line 335–382）。
- 仅 **E/W（左右边）锁图片比例**（`widthOnlyResize && mediaAspect`）；N/S、四角是**自由拉伸** → 框被拉成跟图不同比例，`object-contain` 留空。
- `<img>` 恒 `object-contain`，图片永不变形，只会留空。
- 无裁剪 / 旋转 / 翻转。
- `node.meta` 是 `z.record(z.unknown())`，加字段无需改 schema。

## 2. Part A — 等比缩放（小、低风险，先做）

把 `handlePointerMove` 的 resize 分支改成：**只要 `mediaAspect` 已知，所有把手都锁图片比例**。
- E/W / 四角：以宽为主，`height = round(width / mediaAspect)`。
- N/S：以高为主，`width = round(height * mediaAspect)`，并按 west/north 调整 position。
- 先夹宽高到 [240,680]/[120,520]，若某一维触顶/触底，按比例回算另一维（避免越界破坏比例）。
- `mediaAspect` 未知（无图）才退回原自由拉伸。

效果：拉动 = 等比缩放，拉完不留空框（框恒等于图片比例）。

## 3. Part B — 裁剪（核心原则：原图不动，裁剪「跳出」成新节点）

> 用户拍板：裁剪不在原图上做破坏式操作，而是**像四宫格/九宫格截图那样从原图跳出一个新节点**。原图永远保留，后续操作都在新（裁剪后）节点上。下游（时间线/参考/导出）自然用新节点 = 用裁剪后的图。

完全复用现有 `handleImageGridSplit` 的模式（`BaseGenerationNode.tsx:651`）：canvas 裁出像素 → `addNode` 新图片节点 → `storeConnectNodes(node.id, newNode.id, 'reference')`，`meta.source='image-crop'`、`sourceNodeId=node.id`。原节点零改动。

### 3.1 进入裁剪
composer 工具条加「裁剪」按钮（仅 image 结果时出现，挨着宫格切分按钮）。点 → preview 上浮 `ImageCropOverlay`：显示完整原图，可拖动的裁剪框（4 角缩放 + 框内平移），框外变暗，✓ 确认 / ✕ 取消。

### 3.2 坐标映射
Part A 后节点框恒 = 图片比例，preview ≈ 无 letterbox，故裁剪框按 container 归一化坐标 [0,1] ≈ 图片归一化坐标。确认时 `rect × naturalSize` 作为 `drawImage` 源矩形。

### 3.3 确认 → 生成新节点
- canvas `drawImage(img, sx,sy,sw,sh, 0,0, outW,outH)` → `toDataURL('image/png')`。
- 新节点放在原节点右侧（`baseX = node.position.x + visualSize.width + 80`），`imageGridTileNodeSize` 算尺寸（继承裁剪区比例），`result/history/status='success'`，`meta.source='image-crop'`、`sourceNodeId`、`localOnly:true`、imageWidth/Height/AspectRatio/previewHeight。
- `storeConnectNodes(node.id, newNode.id, 'reference')`，新节点 select。
- 退出裁剪模式。新裁剪节点本身是普通 image 节点：可再等比缩放、再裁剪、拖时间线、当参考。

### 3.4 不存 crop 矩形到原节点
裁剪是「派生新资产」不是「改原图显示」，所以**不**往 `node.meta.crop` 写东西、**不**改原节点渲染。原节点保持现状。

## 4. 不动什么
- 不改 catalog / mapping / runtime。
- 不做旋转/翻转/滤镜/蒙版（本轮明确排除）。
- 不改卡片节点（character/scene/prop/audio 已是 `object-contain` + 仅未生成显底纹的正确写法）。
- 不改视频节点裁剪（裁剪只对 image 结果开放；video 仅等比缩放）。
- **不破坏式改原图**：原节点 result/meta 零改动，裁剪只产新节点。
- 不碰导出 / 时间线代码（新裁剪节点是普通 image 节点，自然走现有链路）。

## 5. 回滚
- 单 commit；回归 `git revert`。
- Part A 纯前端低风险；Part B 若选，裁剪后能从 originalUrl 还原。

## 6. 验收门
1. 前端 tsc 我改文件 0 新错；`pnpm test` 全绿。
2. 等比缩放：拖任意把手（含四角/上下边）图片等比缩放，不留空框。
3. 裁剪：图片节点出现裁剪按钮 → 拖裁剪框 → 确认后**右侧生成一个新裁剪节点**（reference 连线），原节点不变。
4. 新裁剪节点是普通 image 节点：可再缩放/再裁剪/拖时间线/当参考；原图始终保留。

## 7. 结果（实施后回填）

实施完成。

- **Part A 等比缩放**：`BaseGenerationNode.tsx` `handlePointerMove` resize 分支重写 —— `mediaAspect` 已知时，水平把手（含四角）以宽主导 `h=w/aspect`、纯上下把手以高主导 `w=h*aspect`，触界按比例回算另一维；无比例（未生成）才退回自由拉伸。拉任意把手都等比、不留空框。
- **Part B 裁剪（跳出新节点）**：
  - 新增 `cropImageRegion(url, rect)` canvas 裁剪工具（复用 `loadImageForCanvas`），归一化矩形 × naturalSize 作 `drawImage` 源。
  - 新增 `render/ImageCropOverlay.tsx`：浮在 preview 上的取景框（4 角缩放 + 框内平移 + 框外压暗 + ✓/✕）。坐标按 container 归一化 ≈ 图片归一化（Part A 后框=图片比例，无 letterbox）。
  - 图片工具条加「裁剪」按钮；`handleCropConfirm` 完全照 `handleImageGridSplit` 模式：canvas 裁出 → `addNode` 新 image 节点（右侧）→ `meta.source='image-crop'`+`sourceNodeId` → `connectNodes(reference)`。**原节点零改动**。

验收：前端 tsc 我改文件 0 新错、`pnpm test` 339 全绿、`build:renderer` 通过。待用户目视确认：拉伸等比无空框；裁剪后右侧生成新节点、原图保留、新节点可继续操作。

## 8. 旋转 + 翻转（用户复盘后选定，同款「跳出新节点」原则）

用户问哪些图片处理特别需要。结论：旋转 90°(左/右) + 水平/垂直翻转 —— 零外部依赖、纯 canvas、即刻有用，且能完全套用裁剪的派生模式。抠图/超分/inpaint 需先定外部能力，单独立项，本轮不做。

- 新增 `transformImage(url, op)`（op = rotate-left | rotate-right | flip-h | flip-v）：canvas 变换 → `toDataURL`；旋转 90° 时宽高互换。
- 新增 `handleImageTransform(op)`：照 `handleCropConfirm` 模式 —— canvas 处理 → `addNode` 新 image 节点（右侧）→ `meta.source='image-<op>'`+`sourceNodeId` → `connectNodes(reference)`。原节点零改动。
- 图片工具条加 4 个**图标按钮**（左转/右转/水平翻转/垂直翻转，icon-only 保持工具条紧凑）。
- 单 busy 状态防重复点击。

验收：tsc 0 新错、`pnpm test` 全绿、build 通过；旋转/翻转各生成一个方向正确的新节点、原图保留。
