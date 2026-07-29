# 画布非功能性体验优化 实现规范

日期：2026-06-19
触发规则：R4（多文件改动先写文档）+ R8（用户可见改动先出可体验样张拍板）
样张：已出 4 轮可交互 widget，用户逐项拍板收敛（见下「拍板记录」）。

底座：自研画布（不迁 React Flow）。无第三方库改动，故无 Context7 项（R5 不触发）。

---

## 0. 范围 / 不动项 / 回滚 / 验收门

**范围**：只动画布**视觉表现层**——连边渲染、节点描边、节点挂载动画、手势提示。

- 连边：`CanvasEdgeLayer.tsx` + `generationCanvas.css`（边相关段）
- 节点描边：`BaseGenerationNode.tsx`（preview / card / text 容器）+ 必要 token 类
- 出现动画：`GenerationCanvas.tsx`（节点 map 处加「新节点」判定）+ `generationCanvas.css`（keyframe）
- 手势提示：新增 `CanvasGestureHint.tsx` + 一处轻量持久化（已读标记）

**不动项（零改动）**：
- 边的**数据模型 / mode 语义 / 连边能力校验 / order 落槽 / 对账 / 生成读边**——只改怎么画，不改边是什么
- store 真相源、手势事件溯源、撤销/快照、Agent 工具、虚拟化、视口手势
- 节点数据结构、持久化、IPC、节点内部 composer/params/缩放把手

**回滚策略**：每片独立 commit；出问题单 revert 该片不影响其他。

**验收门**：五门全过（`pnpm run gates`）+ `tests/ux/design-fidelity.e2e.mjs` 补断言 + R13 真机走查（触控板走 J1，逐项与样张对账）。

---

## 1. 关键事实修正（开工前已与用户对齐）

**画布边没有「顺序」类——全是「参考/喂素材给生成」关系。** 播放顺序由时间轴 `shotIndex` 决定，不在连线上。
边 mode 枚举（`generationCanvasTypes.ts:205`）：`reference`(素材参考·泛) / `first_frame` / `last_frame` / `style_ref` / `character_ref` / `composition_ref`。

故「顺序 vs 参考」二分在数据上不存在（P1：不造并行语义）。最终落 **A′：所有边统一一种样式**，类型信息靠少量标签补。

---

## 2. 收敛后的拍板记录（样张逐轮）

| 项 | 初稿 | 用户反馈 | 终态 |
|---|---|---|---|
| LOD 缩放降级 | 低 zoom 把节点换成分类色块 | 「图本身一眼就知道是什么，换色块反而看不懂、会乱」 | **撤销色块**。永远保留原图，只加中性细描边分隔（②） |
| 节点分类色边框 | 每类节点描分类色 | 「符合设计系统吗？会很乱」 | **撤销**。节点保持中性（现状设计系统：分类色只用于边/分类轨） |
| 边四色编码 | 按 mode 四色 | 「有必要弄这四个线条吗」 | **砍掉四色**。统一一种 accent 实线（A′） |
| 边二分（顺序/参考） | 灰虚线 vs accent | 数据无「顺序」类（事实修正） | **A′ 统一一种边** + 仅有类型贴标签 |
| 标签密度 | 始终显示 | — | **密集/低 zoom 收起，hover/选中才显** |

---

## 3. 切片实现

### 切片 1 · 连边可见性（①）

`CanvasEdgeLayer.tsx` + `generationCanvas.css`：

1. **统一描边**：边 path 一律 `stroke: var(--nomi-accent)`、`stroke-width: 2`、**`vector-effect: non-scaling-stroke`**（线宽锁屏幕像素，缩小不消失，根因层解决「缩小边消失」）、实线、round linecap。
2. **删四色（P1）**：删 `generationCanvas.css` 的 `data-mode` 颜色段（first/last/style/character/composition 各色 + 默认 ink-30 虚线），全归一到 accent 实线。
3. **终点圆点**：target 锚点画 `r=3.2` accent 实心圆（`vector-effect: non-scaling-stroke`），指明「谁喂谁」方向。
4. **类型标签**：仅 typed mode（非 `reference`）在边中点渲染小 pill（`首帧/尾帧/角色/风格/构图`），token：`bg-nomi-accent-soft text-nomi-accent` 量级，圆角 pill。
   - **非缩放可读**：标签 `<g transform="translate(mx,my) scale(1/zoom)">` 反缩放，恒定屏幕字号 → CanvasEdgeLayer 新增 `zoom` prop。
   - **密度收起**：按 target 入边「有标签边」计数，> 阈值（暂定 3）的标记 `data-dense` → 默认隐藏标签，仅 hover 该边 / 边激活时显（CSS `:hover` + `data-active`）。少量边时常显。
5. **激活态**：沿用现有 `data-active`（加粗 + drop-shadow），改到 accent 基色。

### 切片 2 · 节点中性细描边（②）

`BaseGenerationNode.tsx`：给 `__preview` div、`isCardKind` 容器、`TextDocumentNode` 外层加**一道中性细描边**作卡片分隔——
用 **ring（box-shadow，零布局位移）**：`ring-1 ring-inset ring-nomi-line`（token 色，不引入任意 hex）。
目的：密集/缩小时相邻卡片有边界、白底文本卡不糊进浅色画布。不换色、不变块。

### 切片 3 · 节点出现动画（③）

- `generationCanvas.css` 加 `@keyframes generation-canvas-v2-node-in`：`scale(.82)→1` + `opacity 0→1`，~340ms `cubic-bezier(.2,.7,.3,1)`。
- `GenerationCanvas.tsx` 节点 map：用 `seenNodeIdsRef`（首帧渲染收录全部现有 id → **不动画**，避免开项目时 80 节点齐闪）；后续渲染中**新出现的 id** 才挂 `.appear`（add/paste/Agent 落点）。挂载后收进 set。
- 退出 fade（删除）需保留 DOM 过渡，plumbing 较重 → **v1 先只做出现**；退出动画列为后续小尾巴（不阻塞本批）。

### 切片 4 · 手势提示卡（④）

A′ 已让标签自解释，**不再需要边图例**。④ 收敛为单一「手势提示」：
- 新增 `CanvasGestureHint.tsx`：画布角落小卡，列 `双指滑·平移 / ⌘+滚轮·缩放 / 空白拖·框选`。
- 克制（R2）：**首次进入显示、可一键关**，已读后不再弹（持久化已读标记，per-device）。不常驻占角。

---

## 4. 实现顺序

切片 1（边）→ 真机走查 → 切片 2（描边）→ 切片 3（动画）→ 切片 4（手势卡）。
每片独立 commit + 五门 + 真机截图与样张对账（R13）。

---

## 5. 验收清单（报完成前逐项核）

- [ ] 缩小到 ~30% 边仍清晰可见（非缩放描边生效）
- [ ] 边全一种 accent 色，无残留四色（grep 确认 CSS 删净）
- [ ] typed 边标签反缩放可读；密集时收起、hover 显
- [ ] 节点任意缩放保留原图 + 有细边界；白底文本卡不糊进画布
- [ ] 新增/粘贴/Agent 落点节点弹入动画；**开项目时已有节点不齐闪**
- [ ] 手势卡首次显、可关、已读不再弹
- [ ] 与第 4 轮 widget 样张逐项并排对账无差异
- [ ] design-fidelity 断言补齐边色/非缩放/描边
