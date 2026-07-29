# Nomi 目录树设计修订（基于 Mura 原型）

日期：2026-05-24
状态：草稿，待用户勾选
设计来源：`Mura - 画布设计.html` (用户提供的 React 原型 bundle，已解出 jsx)
当前实现：v0.5.0 (commit `fbe26ea`)
相关文档：
- `nomi-structured-creation-prd-2026-05-24.md` (原 PRD — 8 个分类设计)
- `nomi-phase-e-execution-plan-2026-05-24.md` (Phase E 施工蓝图)

---

## 0. 这份文档的角色

v0.5.0 已经把"项目目录树 + 子画布"按 **8 个内置分类**的方案落地了。用户在 Mura 原型里设计的版本是 **5 个分类**，结构更紧凑，分类逻辑也更清晰。

本文档：
1. 把 v0.5.0 已有 vs Mura 设计提议一项一项对照
2. 列出**每条差异**让用户勾选采纳 / 拒绝 / 部分采纳
3. 用户勾完后我用这份决议更新主 PRD 并启动 Phase E.1 改造

---

## 1. 核心差异：5 个分类 vs 8 个分类

### 1.1 现状 (v0.5.0)

8 个 built-in 分类（`src/workbench/project/projectCategories.ts`）：

```
1. 📖 故事 (story)        — 单文档 TipTap
2. 👥 角色 (characters)   — 卡片网格
3. 🌍 场景 (scenes)       — 卡片网格
4. 🎨 风格 (style)        — 单画布
5. 🎬 分镜 (shots)        — 主画布
6. 🎵 声音 (audio)        — 列表
7. 🖼️ 资源池 (inbox)      — 平铺网格
8. 📦 导出 (exports)      — 列表
```

### 1.2 Mura 设计

5 个 built-in 分类（出现在生成区左侧 sidebar）：

```
1. 画面 (shots)   — "AI 生成的图与短片"
2. 角色 (cast)    — "可复用的角色形象"
3. 场景 (scene)   — "环境与背景"
4. 道具 (prop)    — "物品与摆设"            ← v0.5 没有
5. 声音 (audio)   — "音乐与音效"
+ 新建            — 自定义分类
```

**故事 / 风格 / 资源池 / 导出 在 Mura 里不是 sidebar 分类**：
- **故事** 在 step 1「创作」的整页编辑器里（不在 sidebar）
- **风格** 不存在为独立分类（推测：未来在 frame 节点的"模型 / 比例" chip 旁边或 project-level setting）
- **资源池** 不存在（推测：导入素材直接归入对应分类，由用户/AI 决定）
- **导出** 在 step 3「预览」里（不在 sidebar）

### 1.3 心智差异

**v0.5**："分类树覆盖整个项目生命周期" — 故事 / 风格 / 导出 都是分类

**Mura**："分类树只装可复用的领域资产" — 故事是创作动作（在 step 1），导出是发布动作（在 step 3），风格是属性不是实体

Mura 的心智更纯粹：**sidebar 里的东西都是"东西"（asset），sidebar 外的东西是"动作"（action）**。

---

## 2. 一项一项对照决议表

每项请勾 ✅ 采纳 Mura / ❌ 保留 v0.5 / 🟡 部分采纳（注备注）。

| # | 维度 | v0.5 现状 | Mura 设计 | 建议 |
|---|---|---|---|---|
| **D1** | 分类数量 | 8 个 | 5 个 | ✅ 采纳（5 个心智更清晰） |
| **D2** | 道具 (prop) 分类 | ❌ 没有 | ✅ 有 | ✅ 采纳（漫剧/动画必需） |
| **D3** | 故事 (story) 是否进 sidebar | ✅ 是 (story 分类) | ❌ 否（在创作 step） | ✅ 采纳（故事是行为不是资产） |
| **D4** | 风格 (style) 是否进 sidebar | ✅ 是 (style 分类) | ❌ 否 | 🟡 折中：保留为 frame 节点的"风格"chip（v0.6 Nomi Script 落地时给到 `@风格` block 派生） |
| **D5** | 资源池 (inbox) 是否进 sidebar | ✅ 是 (inbox 分类) | ❌ 否 | 🟡 折中：仍存在但默认隐藏；只在用户拖入未归类素材时自动浮出 |
| **D6** | 导出 (exports) 是否进 sidebar | ✅ 是 (exports 分类) | ❌ 否（在预览 step） | ✅ 采纳（导出是 deliverable 不是 asset） |
| **D7** | 分镜 → 画面 重命名 | "分镜" | "画面" | ✅ 采纳（"画面"更亲切） |
| **D8** | 自定义分类入口 | "+ 新分类"（功能未实现） | "+ 新建"（占位）| ✅ 文案改"新建分类"，功能挪 v0.6 |
| **D9** | 角色英文 key | `characters` | `cast` | 🟡 内部仍 `characters`（兼容性），UI 显示 "角色" |
| **D10** | 场景英文 key | `scenes` | `scene` | 🟡 内部仍 `scenes`（已 ship），UI 不变 |

---

## 3. Canvas 节点形态对照

### 3.1 v0.5 现状 (BaseGenerationNode)

节点结构：
```
[节点头部：状态徽标 + ℹ️ 信息按钮]
[预览区: 棋盘背景 / 图像 / 视频 (object-cover)]
[底部：选中时浮出 composer 面板 (prompt textarea + 模型选择 + ratio + 生成按钮)]
[周围: 输入/输出连接 handle + resize 控制点]
```

特点：
- composer **悬浮在节点下方**（只有选中时显示）
- 节点本身只显示预览图
- 提示词"未选中时隐藏"

### 3.2 Mura "画面"节点设计

节点结构：
```
[图像区: 已生成 (16:9 占满) 或 占位 (灰底 + "画面 NN" + "等待生成")]
[Composer (永远可见): 
   textarea (描述这一画⋯)
   chip: 模型 select
   chip: 比例 select (16:9 / 1:1 / 9:16 / 4:3)
   生成 → 按钮
]
```

特点：
- **composer 永远内嵌**在节点内（不悬浮）
- 节点是一个完整的"图像 + 控制面板"复合体
- 占位状态显式标 "等待生成"（vs v0.5 的棋盘背景）

### 3.3 决议

| # | 维度 | v0.5 现状 | Mura 设计 | 建议 |
|---|---|---|---|---|
| **C1** | composer 默认可见性 | 仅选中时浮出 | 永远内嵌 | 🟡 见下方分析 |
| **C2** | 占位态视觉 | 棋盘背景 (无文字) | 灰底 + "画面 NN" + "等待生成" | ✅ 采纳（更明确） |
| **C3** | 节点编号 | 无（节点 id 不显） | "画面 01 / 02 / 03..."  | ✅ 采纳（按位置或连边序自动编号） |
| **C4** | 模型 / 比例 chip 位置 | 节点底部 chip 区（悬浮） | 节点底部 chip 区（内嵌） | 与 C1 联动 |
| **C5** | 节点宽度 | 自适应图像比例 | 固定 320px 宽 | 🟡 折中：320px 默认，可拖宽 |

**C1 的分析**：

| 选项 | 利 | 弊 |
|---|---|---|
| A. 永远内嵌 (Mura) | 一眼看到 prompt + 模型；不用选中 | 节点占地大，30+ 节点画布变拥挤 |
| B. 仅选中悬浮 (v0.5 现状) | 节点小，画布密度高 | 用户要点一下才知道 prompt |
| C. 混合：低 zoom 时折叠成图标，高 zoom 时展开 | 兼顾两者 | 实现复杂 |

**默认建议 A（Mura）**：因为 1) prompt 是用户的"思维显示" 2) Mura 视觉的"工作台感"主要由这个内嵌 composer 营造 3) 节点数大时可降到只显图像（用画布缩放阈值自动切）

---

## 4. 三段式 (Stepper) 与 sidebar 的关系

### 4.1 Mura 的三步骤

```
创作 (step 1)     →     生成 (step 2)     →     预览 (step 3)
写故事                   出画面 (sidebar 5 分类)         成视频
```

- step 1 = 单页编辑器 + AI 助手侧边栏（没有 sidebar 分类树）
- step 2 = 5 分类 sidebar + canvas + AI 助手浮窗 + 紧凑时间轴
- step 3 = 视频预览舞台 + 完整时间轴（文本/图像/视频 三轨）

### 4.2 v0.5 的现状

v0.5 已经有：
- 顶部 NomiStepper (创作 / 生成 / 预览) — 现有 stepper 行为已对齐
- 创作区 (WorkbenchEditor + CreationAiPanel) — 已存在
- 生成区 (GenerationWorkspace + CanvasAssistantPanel + Timeline) — 已存在
- **目录树 sidebar 装在哪一层？** 当前是装在 `WorkbenchShell`，跨 3 个 step 都显示

### 4.3 决议

| # | 维度 | v0.5 现状 | Mura 设计 | 建议 |
|---|---|---|---|---|
| **S1** | sidebar 在哪些 step 显示 | 3 个 step 都显示 | **只在 step 2 显示** | ✅ 采纳（创作和预览不需要分类） |
| **S2** | 创作 step 的右侧 panel | TipTap 编辑器 + AI panel | 同左 (TipTap + AI chat) | ✅ 已对齐 |
| **S3** | 生成 step 的画布编号 | 仅按 categoryId 过滤当前分类节点 | 同左 + 当前分类自动编号 | ✅ 采纳 + 加自动编号 (Mura C3) |
| **S4** | 预览 step 的轨道 | 当前只有图片 + 视频 | 文本 / 图像 / 视频 三轨 | 🟡 文本轨需要新数据模型；建议进 Phase F |

---

## 5. 改造路线提议 — Phase E.1 (1 周内完成)

如果用户勾选**全采纳 Mura 设计**，需要的改造：

### 5.1 P0（破坏性变化，必须做）

#### Task E.1-1: 数据模型 - 减少 built-in 分类
- 修改 `src/workbench/project/projectCategories.ts`：从 8 个降到 5 个 built-in (画面/角色/场景/道具/声音)
- `story` 不再是 sidebar 分类，但保留为 `viewType` 给 step 1 使用
- `style` / `exports` 同样保留但不在 sidebar
- `inbox` 默认 hidden，仅在自动归类失败时浮出
- 新增 `prop` 分类 + 配套图标

#### Task E.1-2: 节点 kind 与分类映射调整
- `migrateNodeToCategoryId` 加入 `prop` 路由
- v0.5 旧项目里 categoryId='style' / 'exports' / 'inbox' 的节点处理（不删，但 UI 上不见 — 可在"高级"里 toggle 显示）

#### Task E.1-3: Sidebar 只在 step 2 显示
- `WorkbenchShell.tsx` 把 sidebar mount 从 shell 级别下沉到 `GenerationWorkspace`
- step 1 / 3 不再渲染 sidebar
- 移除 sidebar 在创作 / 预览的占位

#### Task E.1-4: 分镜 → 画面 重命名（label 层）
- `projectCategories.ts` 把 shots 分类的 `name: '分镜'` 改成 `name: '画面'`
- 数据库 / 文件里的 categoryId 仍是 `shots`（不破坏向后兼容）
- 文档同步更新

### 5.2 P1（视觉重做，Mura 节点形态）

#### Task E.1-5: 节点 composer 内嵌
- `BaseGenerationNode.tsx` 把 composer 从悬浮浮窗改为内嵌
- 移除"仅选中显示"逻辑，改为永远显示
- 节点高度变化（v0.5 ~140px → Mura ~280px）

#### Task E.1-6: 节点编号自动生成
- 当前画布所有节点按位置（左→右、上→下）或按时序连边自动编号
- 编号标签固定在节点头部："{分类名} 01"

#### Task E.1-7: 占位态视觉
- 替换棋盘背景为 Mura 风格灰底 + 标签

### 5.3 P2（视情况）

#### Task E.1-8: AI 助手浮窗化（step 2）
- 当前 CanvasAssistantPanel 是 sidebar 固定式
- Mura 用浮动 "AI 助手" 按钮 + 展开 panel
- v0.5 现状已经有 collapsible（`generationAiCollapsed`），改成 Mura 视觉风格即可

#### Task E.1-9: 预览 step 三轨道
- 加入"文本"轨道（subtitle / 旁白）
- 这是 Phase F 的工作，本 Phase E.1 不一定做

---

## 6. 风险与权衡

### 6.1 数据层兼容

v0.5.0 已发布给用户。如果有人创建了项目，里面节点可能有 `categoryId='style'` 或 `categoryId='exports'` 或 `categoryId='inbox'`。E.1 改造**不能让这些节点丢失**。

**对策**：
- 不删 Category 类型；只是默认的 BUILTIN_CATEGORIES 列表从 8 降到 5
- v0.5 项目读取时：未被 sidebar 显示的 categoryId 仍保留在 node 数据里
- 提供"显示所有分类"toggle 让老用户看到旧数据
- Phase F 的 Nomi Script 落地后，`@风格` block 派生回 style 分类（虚拟分类）

### 6.2 节点 composer 永远内嵌的影响

- 视觉：节点占地 +50%。300 个节点的画布在 Mura 视觉里会拥挤
- 性能：已经有 E8 虚拟化保底（节点 > 50 时只渲染视口内），不是问题
- 心智：用户能一眼看见每个节点的 prompt，**更符合"画布即工作台"的心智**

### 6.3 道具 (prop) 分类的范围

道具是漫剧 / 动画典型需求，但短视频 / 产品 demo 不一定需要。

**建议**：5 个分类全是默认显示。让用户自己 hide。

---

## 7. 等待用户决议

请勾选：

### A. 整体方向

- [ ] **方案 1**：全采纳 Mura 设计（推荐）
- [ ] **方案 2**：部分采纳（请按表格逐项标）
- [ ] **方案 3**：保留 v0.5 现状，Mura 设计作为未来 v0.6+ 参考

### B. 分类数量

- [ ] 5 个分类（Mura）
- [ ] 6-7 个分类（Mura + 留 1-2 个 v0.5 的，比如保留 inbox）
- [ ] 8 个分类（v0.5 现状）

### C. 故事 / 风格 / 导出的归处

- [ ] 全部从 sidebar 移除（Mura）
- [ ] 故事移除 + 其他保留
- [ ] 全部保留

### D. 节点 composer 形态

- [ ] 永远内嵌（Mura）
- [ ] 选中时悬浮（v0.5 现状）
- [ ] 低 zoom 折叠 / 高 zoom 展开（混合）

### E. 节点编号

- [ ] 自动按位置 / 时序编号（Mura）
- [ ] 不编号（v0.5 现状）

### F. 时机

- [ ] **立刻做 Phase E.1**（影响 v0.5.0 已发版用户，但 v0.5.0 user base 估计 < 20，影响小）
- [ ] **进 v0.5.1** 跟其他 deferred 一起做（E6/E7/E9）
- [ ] **进 v0.6** 跟 Nomi Script 一起做（结构化创作）

---

## 8. 我的推荐组合

如果你不想逐项勾，给个 default：

> **方案 1 + 5 分类 + 故事/导出移出 sidebar + 风格保留（移到 frame chip）+ inbox 默认 hidden + 内嵌 composer + 自动编号 + 立刻做 Phase E.1**

理由：
- v0.5.0 是给早期用户的，user base 还小，破坏性 migration 影响小
- Mura 的 5 分类心智明显更清晰
- 内嵌 composer 是 Mura 视觉风格的灵魂，分开做的话视觉割裂
- 自动编号是 1 行代码的事
- inbox 默认 hidden 给老项目兜底（不丢数据）

---

## 9. 跨文档

| 文档 | 该如何更新 |
|---|---|
| `nomi-structured-creation-prd-2026-05-24.md` | §4.1 分类清单从 8 改 5；§3.3 Nomi Script 加 `@道具` block |
| `nomi-phase-e-execution-plan-2026-05-24.md` | 加 Phase E.1 任务清单 |
| `nomi-product-prd-v2-2026-05-23.md` | §4.4 视觉设计层"画框"节点形态改成 Mura 风格 |
| `nomi-long-form-scale-audit-2026-05-24.md` | 不变（P0/P1/P2 分级仍然有效） |

---

请勾选第 7 节的选项（或直接说"采用第 8 节默认"），我立即按决议更新主 PRD + 启动 Phase E.1。
