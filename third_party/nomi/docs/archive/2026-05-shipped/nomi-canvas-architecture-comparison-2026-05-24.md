# Canvas 架构对比 — flat filter vs per-category vs hybrid

日期：2026-05-24
状态：决策辅助
依赖：`nomi-mura-architecture-decision-2026-05-24.md`

> 用户问：客观分析这几种方案的优缺点，针对 Nomi 的用户哪个更好。

---

## 0. 三个候选方案

我把这个决定**故意分成三档**（不是二选一），因为中间档（C）是用户没明说但其实最贴近实际需求的。

| 代号 | 名字 | 一句话 |
|---|---|---|
| **A** | flat filter | v0.5 现状 — 一个 `nodes[]` 数组，UI 按 `categoryId` 过滤 |
| **B** | per-category 物理分离 + 层级 | Mura 完整版 — 5 个独立 canvas state，每个有自己的 nodes/edges/viewport，节点有 `parentId` |
| **C** | hybrid — 保留 flat 数据 + 加 parentId + per-category viewport | 折中 — 数据仍然 flat，但视觉和心智上是独立画布 + 树形层级 |

---

## 1. 数据模型并排

### A: flat filter (v0.5 现状)
```typescript
type Snapshot = {
  nodes: Node[]                  // flat 一坨
  edges: Edge[]                  // flat 一坨
  selectedNodeIds: string[]      // 全局选中
}

type Node = {
  id: string
  categoryId: string             // ← tag，仅作 filter
  position, size, result, ...
}
// Canvas: nodes.filter(n => n.categoryId === active)
```

### B: per-category 物理分离 + 层级
```typescript
type Snapshot = {
  categories: Record<CategoryId, CategoryCanvas>
  crossCategoryEdges: Edge[]     // ← 跨分类边单独放
}

type CategoryCanvas = {
  nodes: Node[]                  // 只装本分类的
  edges: Edge[]                  // 分类内的边
  viewport: { zoom, offset }     // 独立视口
  selectedNodeIds: string[]      // 独立选中
}

type Node = {
  id: string
  // 不再有 categoryId — 隐式由所在 CategoryCanvas 决定
  parentId?: string              // ← 树形父节点
  position, size, result, ...
}
```

文件层：`categories/shots.json` / `cast.json` / ...

### C: hybrid
```typescript
type Snapshot = {
  nodes: Node[]                  // 仍然 flat
  edges: Edge[]                  // 仍然 flat
  selectedNodeIds: string[]
  categoryViewports: Record<CategoryId, { zoom, offset }>  // ← per-cat 视口
}

type Node = {
  id: string
  categoryId: string             // 仍保留
  parentId?: string              // ← NEW
  position, size, result, ...
}
// Canvas: nodes.filter(n => n.categoryId === active)
// Sidebar 树: 用 parentId 在每个 cat 内组装出层级
```

---

## 2. 7 维度对比

| 维度 | A flat | B per-cat | C hybrid |
|---|---|---|---|
| **层级关系** | ✗ 无 | ✓ 完整 | ✓ 完整 |
| **独立视口（每分类记住 zoom/offset）** | ⚠️ v0.5 已实现 | ✓ 原生 | ✓ |
| **跨分类引用（角色用于画面）** | ✓ 直接 edge | ⚠️ 需要 crossCategoryEdges 单独存 | ✓ 直接 edge |
| **大项目增量保存（改一处只写一个文件）** | ✗ 重写整个 project.json | ✓ 改 shots 只写 shots.json | ✗ 重写 project.json |
| **复制粘贴（含 subtree）** | ⚠️ 需新增 | ✓ 自然支持 | ✓ 自然支持（基于 parentId） |
| **跨分类拖拽** | ✓ 改 categoryId 即可 | ⚠️ 需要从一个 canvas 移到另一个 | ✓ 改 categoryId 即可 |
| **代码迁移成本** | 0（已 ship）| 高（重构数据层）| 中（增量加字段） |
| **v0.5 老用户数据 migration 风险** | 0 | 高 | 低 |

---

## 3. 用户场景对比

### 场景 1: 新手做 30 秒产品 demo（10 个画面节点，无变体）

| | A | B | C |
|---|---|---|---|
| 体验 | 10 个节点平铺，能用 | 10 个节点都在画面 cat 下，sidebar 仍是 5 个按钮（树折叠）| 同 B |
| 复杂度感受 | 最低 | 略多概念但默认折叠看不出 | 同 B |
| 结论 | A=B=C，没差别 | | |

### 场景 2: 小苏做 5 分钟漫剧（30 镜头 + 4 角色 + 5 场景 + 每镜头平均 2 个变体 = ~70 节点）

| | A | B | C |
|---|---|---|---|
| 找"小苏的所有变体" | 翻画布 / 搜索 | 点 sidebar 角色 → 展开小苏 → 看到所有 children | 同 B |
| "把这镜头改一下重生成" | 原节点 status 变化或新节点散落 | 新节点自动成 child，sidebar 看得清"哪个是 V2" | 同 B |
| 跨分类引用（画面用角色 ref） | 一条 edge，简单 | edge 跨 canvas，存 cross-category，渲染略复杂 | 一条 edge，简单 |
| 结论 | A 笨重 | **B 最优** | **C 同 B，略弱在 viewport 切换的视觉感**（仍可接受）|

### 场景 3: 长片项目（1000 节点，分布 4 个分类）

| | A | B | C |
|---|---|---|---|
| 整个 project.json 大小 | 100MB+ | 每文件 25MB | 100MB+ |
| 单次保存延迟 | 重写 100MB → 几秒 | 重写 25MB → < 1s | 重写 100MB → 几秒 |
| Sidebar 树撑得开吗 | 树概念不存在 | 折叠展开 OK | 折叠展开 OK |
| 找"shot 437 的最佳变体" | 几乎不可能 | sidebar 展开看 children 一眼 | 同 B |
| 结论 | **A 完全崩** | **B 最佳** | **C 在保存性能上输给 B，其他持平** |

### 场景 4: 用户从 v0.5.0 升级

| | A→A | A→B | A→C |
|---|---|---|---|
| 数据是否会出问题 | 不变 | 高风险（数据结构重组）| 低（加 parentId 字段，旧节点 parentId=null）|
| 用户感受 | 没变 | 看到全新 UI，需重新适应 | UI 升级但行为兼容 |
| 老 project 兼容 | 100% | 需要复杂 migration（节点重新分散到 5 个文件）| 容易（加字段即可） |

---

## 4. 各方案的"独门优势"

### A 独门优势
- 已经发布，0 工程成本
- 简单到不需要文档
- 短片场景下用户感知不到差异

### B 独门优势（C 也做不到的）
- **文件级增量保存**（长片场景这条 winner）
- **每分类完全独立的 undo/redo 历史**（不会跨分类干扰）
- 架构上"每个画布是个小工程"的纯粹感

### C 独门优势（B 也做不到的）
- **跨分类 edge 仍是 first-class**（不用单独的 crossCategoryEdges 存储）
- 升级路径平滑（v0.5.0 老用户无感升级）
- 工程量减半（1 周 vs 2 周）
- 数据模型变化最小（加字段而已）

---

## 5. 风险盘点

### A 的风险（不升级）
- 长片场景墙 6/7/11/22 撞死（参考 long-form audit）
- Nomi 失去"asset-native"差异化
- 老用户：50+ 节点后开始抱怨

### B 的风险
- 2 周开发 + migration 复杂度 + 跨分类 edge 重构 = **可能延误 v0.6 整月**
- v0.5.0 老 user 数据组织被打散，迁移失败概率 > 0
- crossCategoryEdges 是新模型，bug 暴露面大
- "用户认知负担"——sidebar 树 + parent/child + 独立 viewport 同时引入

### C 的风险
- 大项目保存性能仍受限（但短中片场景没事，长片是 v0.7+ 的事）
- 架构上"看起来像独立画布但底层共享" — 未来某一天还是要重构到 B（debt）
- "每分类独立 undo" 实现复杂（要在 flat 数据上模拟 per-cat undo stack）

---

## 6. 针对 Nomi 用户的判断

### 我们的用户结构（来自 v2 PRD §2.1 + long-form audit §13）

| 用户群 | 占比 | 资产规模 | 真实需求 |
|---|---|---|---|
| 短片产品 demo / vlog 用户 | 60% | < 30 节点 | A 够用 |
| 漫剧 / 短剧创作者（小苏型）| 30% | 30-200 节点 | 需要层级 + 变体管理 |
| 中片 / 独立工作室 | 8% | 200-500 节点 | 需要层级 + 性能 |
| 长片探索者（10% 战略核心） | 2% | 1000+ 节点 | 必须 B 级别架构 |

**关键洞察**：
- 90% 用户在场景 1-2，C 和 B 给到的价值**几乎一样**
- 10% 用户在场景 3-4，C 撑不撑得住要看具体节点数
- 长片用户是战略上的"定义产品上限"群体，但**早期人数极少**（v0.5/v0.6/v0.7 阶段都是个位数）

### 战略 vs 务实的拉锯

**战略角度（B 赢）**：
- v2 PRD §1.4 "Asset-Native OS" 心智需要 B 的架构纯粹性
- long-form audit 推荐的"file-per-category 增量保存"只有 B 能做
- Mura 设计语境本身就是 B

**务实角度（C 赢）**：
- 早期用户绝大多数感知不到 B vs C 的差异
- B 的工程成本翻倍但带来的"额外价值"只在 < 10% 用户上发生
- C 是 B 的子集 — 未来从 C 升级到 B 比从 A 升级到 B 容易

---

## 7. 我的推荐：**先 C，留路径升 B**

理由：

1. **C 满足用户 100% 已表达的需求**：
   - ✓ 5 分类
   - ✓ 每分类独立视觉感（per-cat viewport）
   - ✓ 节点 hierarchy（parentId）
   - ✓ 复制粘贴 / 拖拽 / 编号
   - ✓ 生成自动建 child
   - ✓ Mura 视觉布局

2. **C 不满足的"未来需求"，v0.7+ 再补**：
   - 文件级增量保存（v0.7 长片场景上线时再做）
   - 每分类独立 undo（罕见需求）

3. **C 的工程成本是 B 的 50%**，可以**1 周内交付 v0.6.0**，节奏快得多

4. **C 对 v0.5.0 老用户友好**：加个 parentId 字段，老 project 直接全是 root 节点，零 migration 风险

5. **C → B 的升级路径自然**：parentId 已存在，未来要做 file-per-cat 只是把 flat 数组按 categoryId 拆开存盘 — 一周工程

6. **v0.5 已实现的 per-cat viewport** — C 就是把这个已有的能力 + parentId 字段配齐就够，复用率高

### 反方观点（如果你要选 B）

如果你的判断是：
- "我要现在就把架构地基打牢，未来不要返工"
- "我接受 2 周延期换长期纯粹性"
- "v0.5.0 老 user base 还很小（< 20 人），可以承受 migration 风险"

那 B 是对的。**B 在 5-10 年视角下确实更正确**，但 C 在 6-12 个月视角下更划算。

---

## 8. 决策建议

| 你的优先级是什么 | 选什么 |
|---|---|
| 早期用户快速上手 + 短期迭代速度 | **C** |
| 架构纯粹 + 长片场景准备 + 不返工 | **B** |
| 不变 / 等用户反馈 | A（不推荐，已知 long-form 撞墙）|

**我的个人推荐：C**

具体执行：
- 在 PRD 里把 §1.2 Mura 的数据模型部分改为 hybrid C
- Phase E.2 工期从 2 周缩短到 1 周
- v0.6.0 提前发布
- 把"file-per-category 持久化"列为 v0.7 第一优先 (这本来也是 long-form audit P1)

---

## 9. 如果你选 C，下一步

我会：
1. 把这份对比文档作为决策档案
2. 用 C 方案重写 `nomi-mura-architecture-decision-2026-05-24.md` 的 §1.2
3. 把 §4 工程量评估从 13 天压到 7 天
4. 启动 Phase E.2 executor

如果你选 B，我把 §4 的 10 个 Q 默认值锁定后启动 B。

如果你觉得我推 C 是偷懒，告诉我，我也愿意辩护 B（甚至重新评估）。
