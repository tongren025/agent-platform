# Nomi Mura 架构决议 — 5 独立画布 + 内部层级

日期：2026-05-24
状态：待用户最终确认
前置文档：`nomi-mura-sidebar-revision-2026-05-24.md` (第一轮 UI 修订)

> 第二轮迭代。用户明确：
> 1. **5 分类** (不变)
> 2. **保留"分镜"名字** (反对 D7 重命名)
> 3. **布局对齐 Mura**：sidebar / canvas / 节点形态都跟 Mura
> 4. **每个分类是独立画布**，不是"一个画布按分类过滤"
> 5. **画布内的资产可换位置、可复制粘贴**
> 6. **每次生成都在树里增加一个东西**
> 7. **新生成的图是父图的子节点**，构建父子层级而不是平铺

这份文档把这 7 点的工程含义讲透 + 列出每个边界问题让你定。

---

## 1. 心智模型重大变化

### 1.1 v0.5.0 现状（filter 模型）

```
Project
├── categories: [{id, name, icon, viewType}, ...]   ← 元数据
├── nodes: [GenerationCanvasNode, ...]              ← 所有节点扁平存放
└── edges: [GenerationCanvasEdge, ...]              ← 跨节点边

Canvas 渲染：filter(node => node.categoryId === activeCategoryId)
```

**问题**：分类只是一个 tag。所有节点共享同一个 canvas state（zoom/offset/selection）。换分类就像换过滤器。

### 1.2 Mura 思路（独立画布 + 树形层级）

```
Project
└── categories: [
      { id: 'shots',  canvas: { nodes, edges, hierarchy, viewport, selection } },
      { id: 'cast',   canvas: { nodes, edges, hierarchy, viewport, selection } },
      { id: 'scene',  canvas: { ... } },
      { id: 'prop',   canvas: { ... } },
      { id: 'audio',  canvas: { ... } },
    ]
```

**每个分类是一个独立的"小项目"**：自己的节点池、自己的边、自己的层级树、自己的视口、自己的选中。

**Sidebar 不只是 5 个按钮，而是一棵可展开的目录树**：

```
画面 (12)         ← 分类，可展开
├── 海边灯塔        ← root 节点（用户最初的 prompt）
│   ├── V2 黄昏版    ← child: 基于 V1 重新生成
│   └── V3 雾天版
├── 街道夜景        ← root
│   └── inpaint: 加路灯
└── 室内场景        ← root
角色 (3)          ← 可折叠
├── 小苏
│   ├── 表情:微笑   ← child: 基于"小苏"全身基准生成的变体
│   ├── 表情:愤怒
│   └── 全身造型
└── 老王
场景 (5)
...
道具 (1)
...
声音 (0)
+ 新建分类
```

---

## 2. 这意味着什么工程变化

### 2.1 数据模型重构

#### 当前 (v0.5.0)
```typescript
type GenerationCanvasSnapshot = {
  nodes: GenerationCanvasNode[]
  edges: GenerationCanvasEdge[]
  selectedNodeIds: string[]
}

type GenerationCanvasNode = {
  id: string
  kind: GenerationNodeKind
  categoryId: string          // 仅作过滤标签
  position: { x, y }
  size?: { w, h }
  result?, history?, meta?, ...
}
```

#### 提议 (Mura)
```typescript
type GenerationCanvasSnapshot = {
  categories: Record<CategoryId, CategoryCanvas>
}

type CategoryCanvas = {
  nodes: GenerationCanvasNode[]
  edges: GenerationCanvasEdge[]
  selectedNodeIds: string[]
  viewport: { zoom: number; offset: { x, y } }
}

type GenerationCanvasNode = {
  id: string
  kind: GenerationNodeKind
  // categoryId 不再需要 — 节点本身就在某个 CategoryCanvas 里
  parentId?: string           // ← NEW: 层级父节点
  position: { x, y }
  size?: { w, h }
  result?, history?, meta?, ...
}
```

**关键差异**：
- 节点按分类**物理分离**存储（不是 filter）
- 引入 `parentId` 表达层级关系
- viewport 进入 per-category snapshot（自然分离）

#### 文件层布局
```
~/Documents/Nomi Projects/{project}/
  project.json
  categories/
    shots.json           ← 画面 canvas
    cast.json            ← 角色 canvas
    scene.json           ← 场景 canvas
    prop.json            ← 道具 canvas
    audio.json           ← 声音 canvas
  assets/                ← 图片/视频文件原件（不变）
  logs/
    cost-log.jsonl
```

每个分类一个 JSON 文件 = **大项目时增量保存性能好**（改画面分类不重写整个 project.json）。这呼应长片审计 §1.2 的"墙 33: 增量保存"。

### 2.2 Sidebar UI 从按钮列表 → 文件管理器

当前 `CategorySidebar`：5 个 button + counts。

提议：**Explorer-style tree**：
- 顶级：5 个分类 button（默认折叠）
- 点击 ▶ 展开看 root 节点列表
- 点击 root 的 ▶ 展开看其 child 节点
- 节点行：缩略图(20×20) + 标题 + 状态徽标
- 选中节点 → 在画布跳到对应位置 + 高亮闪烁
- 拖动节点 → reorder / reparent / 跨分类移动
- 右键：复制 / 粘贴 / 重命名 / 删除 / "把这个作为根节点"

### 2.3 生成行为变化

#### 当前
用户在画布点 "生成"，节点的 status 从 idle → queued → success。**节点本身被原地填充结果**。

#### 提议（Mura）
- 用户在画布选中节点 A，点 "基于这个生成变体" / "inpaint" / "outpaint"
- 系统**创建新节点 A.1**，其 `parentId = A.id`
- A.1 在画布上自动定位在 A 旁边（视觉上的 child）
- A.1 在 sidebar 树里显示为 A 的 child

如果点 "+ 新建画面" 这种没有源头的生成：
- 新节点是 **root**（parentId 为空）
- 出现在 sidebar 树的顶级

如果是 image-to-video（双输入：一张 image + 一段 prompt）：
- 视频节点的 `parentId = image 节点 id` （source = primary input）
- 这条 edge 在画布上是显式的连接（保留 edge 模型表达"用谁做参考"）

### 2.4 复制粘贴

#### 在同分类内
- Cmd+C 选中节点（含 subtree）→ Cmd+V 在当前 categoryCanvas 创建副本
- 副本节点的 `parentId` 复制（粘贴成 "原节点的兄弟"）或保留为 root（取决于具体动作）
- 副本节点的内部子树整体复制，重新指 ID

#### 跨分类
- 右键 "移动到 → 场景" 把节点从画面分类挪到场景分类
- 移动时 `parentId` 清空（变成目标分类的 root）

---

## 3. 必须和你确认的 10 个具体边界

请逐条确认 ✅ 接受 / 🔄 改成... / ❓ 待想清楚。

### Q1. 父子关系建立时机

**默认**：每次"基于 X 重新生成 / 变体 / inpaint"产生的新节点，自动 `parentId = X.id`。

- ✅ 接受
- 🔄 改成：______

### Q2. 多输入生成的 parent

例：image-to-video 节点 V，输入 = (image I + character_ref C + style_ref S)。

**默认**：parentId = 第一个非引用类输入（这里是 I）。C 和 S 通过 edge 表达"参考关系"，不进 hierarchy。

- ✅ 接受
- 🔄 改成：parent 是用户最后选中的节点
- ❓ 别的方案：______

### Q3. 用户手动调整 parent

**默认**：用户可以在 sidebar 树里**拖拽节点改 parent**（拖到另一个节点上 = reparent）。

- ✅ 接受
- 🔄 只能拖到同分类内
- 🔄 不允许手动改

### Q4. 树的最大深度

**默认**：无硬性深度限制（V1 → V2 → V3 → V4 都可以）。但 UI 上 sidebar 树超过 4 层会出现"⋯展开"折叠。

- ✅ 接受
- 🔄 限制 ≤ 3 层
- 🔄 限制 ≤ 5 层

### Q5. 跨分类的 edge（不是 hierarchy）

例：画面 P 引用角色 C 作为 character_ref。

**默认**：跨分类的 edge **仍然支持**（不是 parentId，是 edge）。这条 edge 在两个分类的画布都不显式渲染（避免视觉混乱），但生成时作为参考自动注入。

- ✅ 接受
- 🔄 跨分类 edge 只在"全景视图"(future) 才显示
- 🔄 不允许跨分类 edge

### Q6. 画布上的位置 vs sidebar 的顺序

**默认**：
- 画布上的位置（x, y）是空间布局，用户自由摆
- sidebar 里的顺序是**人为指定**：默认按创建时间排，可拖拽改
- 这两个**互相不同步** — 画布动节点不影响 sidebar 顺序，sidebar 拖动也不挪画布位置

- ✅ 接受（最自由）
- 🔄 sidebar 顺序 == 画布上从上到下从左到右
- ❓ 别的方案：______

### Q7. 复制 subtree 的语义

例：节点 A 有 child A1, A2, A3。Cmd+C 选 A 后 Cmd+V。

**默认**：
- 整棵子树都复制（A' → A1', A2', A3'）
- 新节点的 categoryId 不变（同分类内粘贴）
- result.url 引用同一个 asset 文件（不重新生成）
- prompt / params 全复制

- ✅ 接受
- 🔄 只复制顶层 A，不复制 children
- 🔄 result.url 也要复制成新文件

### Q8. 删除节点的级联

**默认**：删 A 时弹确认"也会删除 N 个子节点"。

- ✅ 接受
- 🔄 child 自动提升到 A 的层级（不删）
- 🔄 不弹窗，默认连子一起删

### Q9. 道具 (prop) 分类的具体内容

它和 "场景里的物体" 怎么区分？

**默认**：道具 = **可复用的物品 asset**（一把剑、一个咖啡杯、一个手机）。场景 = **环境**（咖啡馆、街道、卧室）。如果一个咖啡馆里有特定的杯子，杯子在道具，咖啡馆在场景，生成时两者都可作为 ref。

- ✅ 接受
- 🔄 道具范围只限"角色随身物品"
- ❓ 别的方案：______

### Q10. v0.5.0 老项目的 migration

v0.5.0 已发版。老项目里有 8 个分类的节点（含 story / style / inbox / exports）。

**默认**：
- 老节点 categoryId='story' / 'style' / 'exports' / 'inbox' 的全部**迁移到一个新分类** "归档"（隐藏）
- 5 新分类（画面/角色/场景/道具/声音）保留
- 老 inbox 里的节点按 kind 自动归入 5 新分类
- 用户可在"高级 → 显示归档"看到旧数据

- ✅ 接受
- 🔄 老分类的节点全删（彻底重做）
- 🔄 保留全部 8 个分类，新分类叠加（10 个分类）

---

## 4. 这次改造的工程量评估

如果 Q1-Q10 全部按默认勾，工程量：

| 模块 | 工作量 | 风险 |
|---|---|---|
| 数据模型重构（flat → per-category）| 2 天 | 中（破坏性，需 migration） |
| File-per-category 持久化 | 1 天 | 低 |
| Sidebar 改 explorer tree | 2 天 | 中（UX 复杂度高） |
| 节点 parentId 字段 + UI 视觉 | 1 天 | 低 |
| 生成时自动建 parent 关系 | 1 天 | 低 |
| Cmd+C/V 复制粘贴 (含 subtree) | 1.5 天 | 中 |
| 跨分类拖拽 (sidebar tree drop target) | 1 天 | 低 |
| 删除级联确认 UI | 0.5 天 | 低 |
| v0.5 migration 兼容 | 1 天 | 中 |
| 单元测试 + 集成测试 | 1.5 天 | 低 |
| **总计** | **~13 天 / 2 周** | 中 |

**对比**：之前的 Phase E.1 我估的是 1 周。这次因为是架构级重构，2 周更现实。

---

## 5. 建议命名 / 版本

- 这次重构跨度大，建议**单独发 v0.6.0**（不是 v0.5.1 patch）
- 命名："Phase E.2 — Per-Category Canvas + Hierarchy"
- v0.5.x 持续兜底兼容老 user

---

## 6. 我个人的几个担忧

（仅供参考，不必采纳）

### 担忧 1：tree depth 控制不好会失控

漫剧创作典型情境：
- 主角小苏（root）
- → 小苏 V2 微笑（child）
- → 小苏 V2 微笑 第 3 镜头表情 inpaint（grandchild）
- → 上一步再 inpaint 加眼镜（great-grandchild）

四五层是常态。sidebar 树撑不撑得开？建议：**默认折叠**，点击展开，但有"快速展开全部"。

### 担忧 2：跨分类 edge 在新架构里如何持久化

如果分类各自独立 JSON 存储，**跨分类的 edge 存哪？**
- 选项 A：edge 存 source 端所在的分类（角色 → 画面 的边存在角色.json）
- 选项 B：跨分类 edge 单独放 `project.json` 的 cross-refs 字段
- 选项 C：每个分类都存自己的引用，冗余但简单

**推荐 B**：因为跨分类的语义本来就是 project-global，且数量远少于分类内 edge。

### 担忧 3：用户认知负担

8 分类 → 5 分类 OK。但 sidebar 从平 list → 树形展开，再加上节点 hierarchy 概念……新用户能 onboard 吗？

**对策**：
- 默认折叠（看上去就是 5 个按钮，老用户体验不变）
- 节点 hierarchy 自动生成（用户不主动操作就感受不到）
- "+ 新建画面" 仍创建 root，最常见路径不复杂

---

## 7. 如果你按默认全勾，下一步：

1. 我把 Q1-Q10 的决议合入主 PRD `nomi-structured-creation-prd-2026-05-24.md`
2. 写 Phase E.2 施工计划（按本文 §4 的模块拆 task）
3. 派 Phase E.2 executor 启动重构（2 周工期）
4. 中途 audit + push v0.6.0

如果有某些 Q 想不一样，告诉我。我再修。

---

## 8. 一行确认

如果你只想说一句：

> **"Q1-Q10 全部默认，启动 Phase E.2"** — 我直接动手
>
> **"先想想 Q3 / Q5 / Q10，其他默认"** — 我等你想清楚再启动
>
> **"X 不对，改成 Y"** — 我按 Y 改 PRD
