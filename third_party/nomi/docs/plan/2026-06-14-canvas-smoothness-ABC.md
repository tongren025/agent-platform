# 画布丝滑改造 A+B+C 实现规范

日期：2026-06-14
底座决策：**改自研画布**（不迁 React Flow，理由见会话/对比表）
触发规则：R4（多文件改动先写文档）+ R8（用户可见改动先出样张拍板）

---

## 0. 范围 / 不动项 / 回滚 / 验收门

**范围**：只动画布**视口层 + 交互层**。
- 视口/手势：`GenerationCanvas.tsx`、`generationCanvasGeometry.ts`、新增 `useCanvasViewportGestures.ts`
- 框选：`GenerationCanvas.tsx` + 新增 `useMarqueeSelection.ts` + store `selectNodesInRect`
- minimap：新增 `CanvasMinimap.tsx`
- 边层：`CanvasEdgeLayer.tsx`（节流 + 视口裁剪）

**不动项（零改动）**：
- store 真相源、手势事件溯源（`emitCanvasGesture`）、撤销/快照、对账、Agent 工具
- 节点组件内部（composer/params/缩放把手/等比锁）
- 节点数据结构、持久化、IPC
- 连边能力校验、分组、跨分类、拖到时间轴

**回滚策略**：每档独立 commit；视口手势抽成 hook，出问题单 revert 该 hook 不影响其他档。

**验收门**：五门全过 + `tests/ux/design-fidelity.e2e.mjs` 新增断言 + R13 真机走查（触控板 + 鼠标各走一遍 J1）。

---

## 1. 关键拍板项：滚轮/手势语义（唯一需要你定的取舍）

当前：**任何滚轮都缩放**（不分修饰键）→ 触控板双指滑动被当缩放，最别扭。

行业标准（Figma / Miro / tldraw 一致）：

| 手势 | 行为 | 适用 |
|---|---|---|
| 触控板双指滑 | **平移** | 触控板 |
| 触控板捏合 | **缩放**（锚在光标） | 触控板 |
| `⌘/Ctrl + 滚轮` | **缩放**（锚在光标） | 鼠标 + 触控板 |
| 纯鼠标滚轮 | **垂直平移**（`Shift+滚轮`=水平） | 鼠标 |
| 空格 + 拖 / 中键拖 / 右键拖 | **平移** | 全部 |

**取舍**：采用此标准后，**纯鼠标用户原来"滚轮即缩放"会变成"滚轮平移"，缩放要按住 ⌘/Ctrl**。这是为了让触控板（你主力）丝滑必须付的一致性代价；好处是和所有专业画布工具肌肉记忆一致。

> 技术依据：浏览器对触控板**捏合**会合成 `wheel` 且 `ctrlKey=true`；**双指滑**是 `ctrlKey=false` 的 `wheel`。故用 `event.ctrlKey/metaKey` 即可零heuristic区分缩放/平移（根因层判定，符合 P2）。

→ **默认按上表实现**；若你想保留"鼠标滚轮=缩放"，在拍板时说明，我加一个设置开关（但那是并行语义，倾向不做）。

---

## 2. A 档 · 手势（立竿见影，最高优先）

新增 `useCanvasViewportGestures.ts`，收口三类输入：

### A1 滚轮/触控板（替换现 `handleWheel`，P1 删旧）
```
onWheel(e):
  命中卡内可滚区 → 交原生（沿用 findScrollableAncestor）
  e.preventDefault()
  if (e.ctrlKey || e.metaKey):   // 捏合 / Cmd+滚轮
     zoomAtStagePoint(clamp(zoom * factor(e), 0.2, 3), 光标)
  else:                          // 双指滑 / 鼠标滚轮
     scheduleOffset({ x: offset.x - e.deltaX, y: offset.y - e.deltaY })
```
- 缩放走 **rAF 批处理**（与平移同 `scheduleOffset` 机制，消除快滚多次 setState 抖动）。

### A2 空格+拖 平移
- `keydown Space`（输入框放行）→ `isSpacePanReady=true`，光标 `grab`；按下拖 → 平移；`keyup` 复位。

### A3 中键 / 右键拖 平移
- `handleStagePanStart` 放开 `button===1`（中键）；右键拖平移需与右键菜单区分：**拖动超阈值才平移、未超阈值才弹菜单**。

---

## 3. B 档 · 重量感 + 框选 + 大图不卡

### B1 平滑缩放/适应/重置动画
- `fitView` / 重置 / 缩放条：用 `requestAnimationFrame` 在 `--nomi-transition-fast`(140ms) 内插值 zoom+offset（ease `cubic-bezier(.2,.7,.3,1)`）。
- 滚轮/捏合连续缩放**不加动画**（本就连续），只给离散跳转（按钮/条/适应）加。

### B2 框选 marquee
- 空白处左键拖（非空格、非平移修饰）→ 画选框：`absolute` 蓝紫描边层，token：`border-nomi-accent bg-nomi-accent-soft/30`。
- 抬起 → store 新增 `selectNodesInRect(rect, categoryId, additive)`（`Shift` 追加）；命中用 AABB。
- 与平移区分：**空白处默认框选**，平移走 空格/中键/右键/双指（A 档）。→ 这改了"空白左键拖=平移"的旧行为，需你知悉（见 §1 一致性）。

### B3 连线拖拽不卡
- `pendingCursorPos` 改 rAF 节流（现每 pointermove setState）。
- 边层视口裁剪：`CanvasEdgeLayer` 只渲染**两端任一在可视区 buffer 内**的边（复用节点虚拟化的视口框）。

---

## 4. C 档 · 大图导航 + 清债

### C1 CanvasMinimap（新组件，样张见下）
- 位置：右下角，`absolute right-4 bottom-6 z-[8]`。
- 容器：`w-[180px] h-[120px] rounded-nomi border border-nomi-line bg-nomi-paper/95 shadow-nomi-md`。
- 内容：所有节点按 bbox 等比缩放成小矩形（`bg-nomi-ink-30`，选中 `bg-nomi-accent`）；视口框 `border border-nomi-accent`。
- 交互：点击/拖视口框 → 跳转 `setViewportTransform`。
- 收起：`>50 节点` 默认展开；少节点可折叠成小图标（密度优先 R2）。

### C2 清除 `4000×3000` 死常量
- `generationCanvas.css` 的 `.generation-canvas-v2__nodes/__edges` 固定 `4000×3000` → 改为不依赖固定尺寸（`overflow:visible` 下节点/边本就自由定位）。验证虚拟化/fitView/minimap 不依赖它后删除（P1 删旧）。

---

## 5. 实现顺序

A（手势）→ 真机验触控板 → B1 平滑 → B2 框选 → B3 边 → C1 minimap → C2 清债。每步独立 commit + 真机走查。
