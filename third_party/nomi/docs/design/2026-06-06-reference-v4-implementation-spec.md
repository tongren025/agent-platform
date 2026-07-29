# V4 参考区设计实现规范（照这份建，别只照 HTML 猜）

> **为什么有这份**：样张 `docs/design/mockups/2026-06-06-reference-at-v4.html` 是**理想态快照**——只画了 4 个静态
> 画面，缺所有交互态、精确 token、边界异常、UI↔数据绑定。**实现以本规范为准**；mockup 只是「长相参照」，本规范是
> 「行为 + 像素 + 数据」合同。先读交接 `2026-06-06-HANDOFF.md` §5（R1/R5/R6 等约束）。
> 凡本规范未覆盖到、又必须定的，按 CLAUDE.md「歧义必停」**先问用户**，别自行发明。

---

## 0. 三个组件 + 一处绑定（建什么）

- **AssetTile**（共享原语 `src/workbench/assets/`）：一个素材的小方块。
- **AssetPicker**（共享原语）：点「+」弹出的统一选择器。
- **AssetMention**（共享原语，基于 Tiptap）：描述框里的内联引用 chip + @ 唤起。
- **ReferenceRow**（节点侧 `controls/AssetReference.tsx`，**非共享原语**）：把档案 slots 渲染成一排 tile，消费上面三者。

数据绑定（R5/R6/R1，**最容易被静态稿漏掉、必须写死**）见 §6。

---

## 1. 全局 token（精确值，0 手写随意值——违反即工作错误，规则 10）

| 用途 | 值 | Tailwind |
|---|---|---|
| 参考行 tile 尺寸 | 56×56 | `w-14 h-14`（mockup .tile=56；当前实现 48，**以 56 为准、密度评审可再调**） |
| 选择器 tile 尺寸 | 48×48 | `w-12 h-12` |
| 内联 @ chip 缩略图 | 18×18，垂直基线 `-3px` | 见 §4 |
| tile 圆角 | 6px | `rounded-nomi-sm` |
| 选择器/弹层圆角 | 10px | `rounded-nomi` |
| 徽标/×/pill | 999 | `rounded-pill` |
| 字号 | 11 / 12 / 13 | `text-micro` / `text-caption` / `text-body-sm`（**禁** `text-[9.5px]` 这类） |
| 间距 | 4 的倍数 | tile 间 `gap-2`(8)；chip 与字 `gap-1`(4)；徽标偏移 `-top-[4px]` |
| 图标 | Tabler，stroke 1.5，**禁 emoji** | `@tabler/icons-react`（已是依赖） |
| 边框 | `border-nomi-line` / 虚线 `border-dashed border-nomi-ink-20` | |
| accent | `bg-nomi-accent` / `bg-nomi-accent-soft text-nomi-accent` | |
| 暗蒙层（视频） | `oklch(.2 .01 80/.28)` | |
| 动效 | hover/选中 150ms ease；弹层出现 120ms；**禁**夸张动画 | |

颜色/阴影一律走 `--nomi-*` token（`src/theme/nomi-tokens.css`），不写死 oklch（视频暗蒙是唯一例外，已在 mockup）。

---

## 2. AssetTile — 全规格（mockup 只画了 4 种，实际 ≥10 态）

**形态（按 `kind`，形态自明、不靠角标）**：
- `image`：`<img object-cover>` 填满。
- `video`：`<img>` 缩略图 + **整块暗蒙层**（inset-0, 28%）+ **居中播放三角**（Tabler `IconPlayerPlayFilled` 22px 白 + drop-shadow）。
- `audio`：无缩略图 → `bg-nomi-ink-05` + **整块波形**（Tabler `IconWaveSine` 或 6 条 `<i>` 波形，ink-40，居中）。
- `add`：虚线边 + 居中 `+`（Tabler `IconPlus` 18px ink-40）。

**叠加层**：
- 编号徽标（仅 `numbered=true`，= 角色图）：左上 `-top-[4px] -left-[4px]`，accent pill，`text-micro font-semibold` 白，内容 ①②③（数字按在 row 中的**图片顺序**，不是全部素材顺序）。
- 删除 ×：右上 `-top-[4px] -right-[4px]`，paper bg + line border，ink-60，`text-micro`。**hover tile 才显或常显**（定一种，建议常显——触屏无 hover）。

**状态（每一种都要实现 + 走查截图）**：
| 态 | 表现 |
|---|---|
| default | 上述形态 |
| hover | `outline-2 outline-nomi-accent outline-offset-1`（可点插入/可选时）；× 高亮 |
| focus（键盘） | 同 hover 的 outline + 可见焦点环 |
| loading（缩略图/上传中） | skeleton 脉冲 或 居中 spinner；× 禁用 |
| error（图加载失败/上传失败） | fallback：`IconPhotoOff` ink-30 + 浅红边；点 = 重试 tooltip |
| selected（picker 里/插入模式） | accent 实边 + 角标 ✓ |
| dragging（拖出去） | 半透明 0.5 |
| disabled（超出上限的 add） | ink-20、cursor-not-allowed、tooltip「最多 N 个」 |

**props 约定**：`{ asset: AssetRef, numbered?: number, onRemove?, onClick?, selected?, size: 'row'|'picker' }`。**纯展示**，不碰 store/上传。

---

## 3. ReferenceRow — 一排 tile ↔ 档案 typed slots（**mockup 完全没表达，最关键**）

视觉：**一排 tile**（image/video/audio 混排，同方块形态）+ 末尾「+」。无组标签、无 caption（形态自明）。
数据：**内部仍按类型路由到档案的 image_ref / video_ref / audio_ref 三个 slot**（各自 meta 键 + 各自上限）。用户看一排，数据进三桶。

**规则（必须实现）**：
1. **加素材自动按类型路由**：picker 选/上传/拖入的素材，按 `kind` 进对应 slot 的 meta 数组（`referenceImageUrls`/`referenceVideoUrls`/`referenceAudioUrls`）。
2. **每类型独立上限**：image≤9 / video≤3 / audio≤3（取自档案 slot.max）。**到上限时**：该类型在 picker/拖入里灰掉 + toast「最多 N 个视频」。不是整行封顶。
3. **编号只给角色图**：`image_ref` 且 `characterIndexed` 的 tile 标 ①②③（= reference_image 数组顺序）；video/audio 不编号。
4. **当前模式没有的类型不接受**：如某模式只有 `first_frame` 单槽 → 不是这排 tile，而是单槽形态（见 §3.1）。ReferenceRow 只在「有数组槽」的模式出现。
5. **空态**：可选数组槽（min 0）全空 → 只一个「+」（不画三个空组，规则 2）。必填单槽（min 1，如首帧）→ 单槽占位（§3.1）。
6. **顺序与拖拽重排**：tile 可拖动重排（影响 character 编号 + 发送顺序）；重排 = 改 meta 数组顺序。**重排时同步更新 prompt 里对应 @ chip 的编号**（R6 单源）。

**§3.1 单槽形态（first_frame/last_frame/source_video，非数组）**：仍是一个方块 tile（image 缩略图 / video 波形不适用→source_video 用 video 形态），但 `cardinality:single`、可走画布**连线**（持久 edge，沿用现有 `handleSlotAssignment`）。**单槽走边、数组走 meta-only**（R5，别统一成边，会崩 `(target,mode)` 唯一性、回归全能参考）。

**slot 描述符（R5，驱动渲染分叉）**：
```ts
{ cardinality:'single'|'array', persistAsEdge:boolean, form:'tile'|'textRef'|'singleImage', accept:'image'|'video'|'audio'|'any', min, max, characterIndexed?, metaKey, inputKey }
```
ReferenceRow 读档案 slots → 映射成这些描述符 → 按 `form`/`cardinality` 分支渲染。文本节点「选中文本」槽 `form:'textRef'`（不是 tile）。

---

## 4. AssetMention（@ 内联引用）— 基于 Tiptap（**mockup 只画了 chip 长相，交互全缺**）

**先做（R6）**：按规则 5 查 Tiptap 官方（inline atom Node + `ReactNodeViewRenderer` + `Mention`/`@`-suggestion）。prompt 从纯
`<textarea>`（NodeGenerationComposer）**整体换成 Tiptap 编辑器**（换了删旧 textarea，别两套并存）。项目已有 `useNomiRichTextEditor`/`WorkbenchEditor` 可参考复用。

**chip（inline atom node）**：18×18 缩略图，`rounded-nomi-sm` + `border-nomi-line`，`vertical-align:-3px` 基线对齐，**无数字**（row 里已编号）。整体一个原子：Backspace 一次删整块；不可从中间断开。hover 高亮、可点定位到对应 tile。

**插入两条路（都要）**：
- **点 row 里的 tile** → 在光标处插入该 tile 的 chip（**主路径**，新手不用懂 @）。
- **打 `@`** → suggestion 弹出当前可引用的 tile 缩略图（轻量 inline picker，**不是**那个大 AssetPicker；只列已加的 ref tile）→ 选 → 插入 chip。

**发送投影（R6，单一真相源，最易出 bug）**：**一个纯函数**同时产出 ① 给模型的 prompt 文本（chip → `character{N}`）② 有序的 `reference_image` URL 数组——**别拆两处**，否则「句中编号」和「数组顺序」漂移。接 `archetypeMeta.buildArchetypeInputParams`（投影单源点）。

**边界（mockup 全无，必须定）**：
- 删了 row 里某 tile，它在 prompt 的 chip 怎么办？→ **同步删除该 chip**（或标失效高亮提示）。定一种，建议同步删 + 编号重排。
- prompt 有 chip 但该类型模型不支持（切到不支持参考的模式）→ chip 失效灰显 + tooltip。
- 没有任何 ref tile 时打 @ → suggestion 显「先加参考图」空态，不弹空列表。
- 复制/粘贴含 chip 的文本、撤销重做 → Tiptap schema 要把 chip 定义成可序列化原子（持久化进 `node.prompt` 时存什么？定一个序列化格式，如 `@[assetId]`，渲染时解析回 chip）。**这条决定 prompt 的持久化格式，必须先定。**

---

## 5. AssetPicker（统一选择器）— 全规格（mockup 画了布局，状态/锚定/规模全缺）

**触发/锚定**：点 row 末尾「+」打开。**绝不能被 composer overflow 裁剪**（同设置弹层的教训）——渲染在不裁剪的定位层
（composer 外层锚 / portal），定位贴「+」下方。点外部 / Esc / 选完 → 关。

**布局（自上而下）**：
1. 搜索框（`IconSearch` + input，placeholder「搜索素材名…」）——**跨画布+项目素材实时过滤**。
2. **画布** section：横排画布图卡缩略图（tile 48px，点 = 加）。
3. **项目素材 · 最近** + 右上「浏览全部 →」：**可滚网格**（5 列、`max-h` 封顶约 108px、`overflow-auto`）；最近 N 张优先。混排 image/video/audio（同形态语言）。
4. **⬆ 上传本地文件**（虚线按钮，`IconUpload`，accept 按当前可加类型）。
5. footer：「或把文件拖进来 · 从卡片拉条线 · 从素材面板拖到节点」。

**规模化（R-规模，用户专门问过）**：弹层**只做快速取**（搜索 + 最近网格可滚），**不做全量浏览**；「浏览全部 →」打开/聚焦侧边**素材面板**（`WorkspaceFileExplorerPanel`），全量浏览在面板、从面板拖到节点加（节点级 onDrop，§6）。

**状态（mockup 没有，必须实现）**：
| 态 | 表现 |
|---|---|
| 加载中 | 各 section skeleton |
| 画布无图卡 | 隐藏「画布」section（不显空标题） |
| 项目素材空 | 「项目素材」显「还没有素材，上传一个 →」引导上传 |
| 搜索无结果 | 「没找到『xxx』」+ 上传入口 |
| 某类型到上限 | 该类型 tile 灰显 + tooltip「最多 N 个」 |
| 拖文件悬停在弹层上 | 弹层高亮 dashed accent 边 + 「松手添加」 |

**drag-drop**：弹层 + ReferenceRow + 整个节点都接 drop（§6）。
**键盘**：方向键在网格移动、Enter 选、Esc 关、`/` 或自动聚焦搜索。

**props**：`{ slot 描述符, assetPool, onPick(asset), onUpload(file), onClose }`。不自己管上传副作用，回调给消费方（节点侧处理 R1 的传输 URL）。

---

## 6. 数据绑定 / 管道（**静态稿 0 表达，最容易翻车，必须写死**）

- **assetPool**（共享 selector，**别建新 store**）：`useMemo` 合流 = 画布 store 的 image/video 结果节点 + `useWorkspaceFiles(projectId)`（已 limit 500）+ 本会话上传。产出 `AssetRef[]`：
  ```ts
  type AssetRef = { id; name; kind:'image'|'video'|'audio'; renderUrl; transportUrl?; source:'canvas'|'project'|'upload'; thumb }
  ```
- **R1（致命，必须做）renderUrl vs transportUrl**：`nomi-local://`（本地）只能用于 UI 渲染；**vendor 取不到**。
  **发送前在 runtime 侧**把参考里的 `nomi-local://` 上传成 vendor 可达 URL（走已有 `hardenedFetch` 私网拦截 + 200MB 上限），
  替换进 body。renderer 只存 renderUrl + assetId；transportUrl 在 runtime 任务发起前解析。**别在 renderer 上传**（拿不到文件系统直读、绕路）。
- **加素材落点**：选/传/拖 → 按 kind 进 `node.meta` 的 `referenceImageUrls/VideoUrls/AudioUrls`（数组、meta-only）或单槽键（firstFrameUrl…，可带 edge）。沿用现有 `archetypeMeta` 的键映射 + `buildArchetypeInputParams` 投影。
- **节点级 onDrop**（现在没有，§HANDOFF R）：`BaseGenerationNode` 加 `onDragOver(preventDefault, dropEffect='copy') + onDrop(stopPropagation)`，解析三种 payload（`WORKSPACE_FILE_DRAG_MIME` / OS `Files` / 画布卡）→ 加到该节点的 row（**不要**冒泡到画布 onDrop 新建卡）。
- **连线→参考**：`connectToNode` 命中「目标节点当前模式有数组参考槽」→ 加进 meta 数组（**不持久画 9 条线**，连线是一次投入手势）；单槽仍走持久 edge。
- **prompt 持久化**：含 @ chip 的 prompt 存成可解析格式（如 `@[assetId]`），加载时 Tiptap 解析回 chip（见 §4 边界）。

---

## 7. 无障碍 + 国际化

- 所有可点 tile/chip/按钮有 `aria-label`；删除键 `aria-label="移除{name}"`。
- 键盘可达：Tab 进 picker、方向键选、Esc 关、Backspace 删 chip。
- 文案中文为主；数字/类型不硬编码进样式。

---

## 8. 验收（每个 state 都要，不是只对 happy path）

- **样张对账（规则 8 AFTER）**：真渲染 mockup v4 并排比成品**每一态**（不只主态）；差异补齐或上报。
- **真体感走查（规则 13）**：`tests/ux/` 加一条覆盖：加图（三来源各一遍）→ 点 tile/打@ 插入 → 删 chip → 重排 → 到上限 → 切模式失效 → 空态。**截图比样张，不是 `expect(存在)`**。
- **状态截图**：§2/§5 的每个 state（loading/error/empty/到上限/拖悬停/搜索无结果）都要有截图证据。
- **R1 真实生成**：nomi-local 素材作参考的真实生成（花额度、`KIE_API_KEY` 门控、**先问用户**）验 transportUrl 替换生效。
- **R6 单源测试**：删/重排 tile 后，prompt 投影出的 `character{N}` 文本 ↔ `reference_image` URL 数组**逐项对应**的单测。
- CI 五门绿；新组件单测；NodeParameterControls/BaseGenerationNode 净减（规则 12）。

---

## 9. 先出样张再写码（规则 8，本规范也只是「行为合同」，不是最终视觉裁决）

本规范定**行为 + 数据 + token**；但 §2/§5 的**新状态**（loading/error/empty/到上限/@suggestion/拖悬停）mockup 没画。
**动手前先把这些缺的态补进 mockup（v4.1）**，自跑设计师 + 真实用户 agent 审一遍（已成默认纪律），用户确认后再实现。
别拿本规范的文字描述代替「看得见的样张」——好产品不靠解释，评审也不靠想象。
