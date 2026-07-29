# 全套设计审查（2026-06-15）

> 方法：① 全仓机械扫描设计违规（grep，覆盖所有面，不受运行态限制）；② 真机逐面走查（人眼 + computed-style 实测）。
> 触发：用户要求「全套设计审查」。背景：本日刚抓出 [[text-bodysm-class-trap]]（驼峰错类静默回退 16px，全仓 19 处），证明**肉眼会漏系统性 token 侵蚀**，故本审计以系统扫描为主轴。
> 真机走查覆盖：项目库 / 创作区 / 分镜编辑器+卡片 / 时间轴预览 / 生成画布（本日均已截图人眼过）。**未覆盖（被并行会话占用驱动 socket 中断）**：导出面板 / 模型接入 / 素材库 / 展开态侧栏 / 各弹层——待驱动空闲补走。

## 总评
设计 token 体系本身**健全**（三层 token、§2–§7 规范齐全、图标 100% Tabler 无杂库）。但**实践中 token 纪律大面积侵蚀**：到处用任意 px 值绕过 token，规范写了却没落地。多数能正常渲染，但正是这种侵蚀埋了 bodySm 那种雷、并让界面隐隐不一致、难维护。**核心问题不是没规范，是规范没被执行。**

---

## P1 · 真视觉/有用户影响（建议尽快）

### P1-1 off-token 颜色（~11 处）
硬编码 hex / Tailwind 默认色板，绕过语义 token：
- `src/workbench/library/ProjectLibraryPage.tsx:352,354` — `text-[#b42318]` / `hover:bg-[#b42318]`（删除按钮红，应 `text-workbench-danger`）
- `src/workbench/generationCanvas/components/GenerationCanvas.tsx:510` — `bg-[#f7f7f9]`（画布底，应 token）
- `src/ui/toast.tsx:45,47` — `bg-red-500/[.12]` / `bg-blue-500/[.12]`（应 `bg-workbench-danger-soft` / `-info-soft`）
- `src/workbench/sidebar/CategoryTree.tsx:352` — `text-red-600 hover:bg-red-50`（应 workbench-danger）
- `src/workbench/generationCanvas/nodes/scene3d/Scene3DFullscreen.tsx:3780-82` — `text-red-300/green-300/blue-300`（XYZ 轴标，3D 内可酌情保留）

### P1-2 sub-11px 超小字号（~19 处，低于 token 下限 micro=11）
9px / 9.5px / 10px / 10.5px，legibility 偏弱、且全 off-token：
- 侧栏计数/角标：`NodeItem.tsx:54,59`(9px)、`CategoryItem.tsx:117`(9px 派生角标)、`GroupItem.tsx:64,98,105`(10px)、`FileTreeNode.tsx:76`(9px)
- `AgentPlanCard.tsx:63,65,112`(9-10px)、`BaseGenerationNode.tsx:603`(10.5px)、`AudioStripNode.tsx:166`(10px)、`TimelinePanel.tsx:310`(9.5px)
- Scene3DFullscreen 多处 10px
→ 统一抬到 `text-micro`(11) 或重审是否真需要这么小。

### P1-3 文本字形当图标（违反 §6「只 Tabler」）
`×` 关闭、`▾▸` 折叠箭头用文本字形而非 Tabler，渲染重量/对齐与全 app 的 Tabler 不一致：
- `ProvenancePanel.tsx:53` `×` → `IconX`
- `AssetTile.tsx:44` `×` → `IconX`
- `AgentPlanCard.tsx:65` `▾` → `IconChevronDown`
- `FileTreeNode.tsx:14,76` / `GroupItem.tsx` / `CategoryItem.tsx:53,94` `▾▸` → `IconChevronRight/Down`

### P1-4 非 4 倍数任意间距（§2.2 明令禁止）
- **`gap-[7px]` 用了 11 次**——设计系统 §2.2 原文「**禁止 gap-[7px] 这种非标准值**」，却恰恰用了最多。
- 另有 `gap-[5px]`(7) `gap-[6px]`(14) `px-[11px]`(9) `p-[5px]`(9) `py-[5px]`(5) 等非 4 倍数。
→ 归一到 4 倍数（gap-1/1.5/2…，1.5=6px 合规）。

---

## P2 · 系统性 token 债（多数渲染正常，但易漂、难维护）

### P2-1 任意 px 字号 228 处 → 应用字号 token
分布：`text-[12px]`×71（=caption）、`text-[11px]`×62（=micro）、`text-[13px]`×55（=body-sm）、`text-[14px]`×14（=body）、`text-[16px]`×4（=title）。**全部可直接映射到现有 token**，纯纪律问题。风险同 bodySm：哪天某处写错就静默回退。建议批量迁移 + 加 lint 守。

### P2-2 任意圆角 84 处 → 应用圆角 token
`rounded-[Npx]` 散落，应归 `rounded-nomi-sm`(6) / `rounded-nomi`(10) / `rounded-nomi-lg`(14)。

### P2-3 无 token 的大字号
`text-[20px]`（ProvenancePanel 关闭×、NomiMarkdown h1）/ `text-[28px]`（ProjectLibraryPage h1 标题）——§2.3 原列 h2=20 但 tailwind 配置已删 h2，造成 20px 无 token。→ 要么恢复 h2 token，要么这些用 `font-nomi-display` 显式声明。

---

## P3 · 专项 / 低优先

- **Scene3DFullscreen.tsx**：任意值（颜色/字号/圆角/阴影）密集——是独立 3D 编辑器，隔离度高，可单独低优先重构。
- **生成画布节点页脚控件**（真机所见）：节点底部一排控件（定位/网格/滑杆/`?` 按钮）无标签、隐喻不清，违 R2「好产品不靠解释」。建议补 tooltip 或换可懂图标。`?` 字面问号当图标尤其不该。

---

## 做得好的（保持）
- 图标库 100% Tabler，无 lucide/heroicons 杂库（§6 执行到位）。
- token 体系三层架构健全、设计系统文档完整。
- 项目库 / 创作区 / 分镜编辑器（本日重设计）/ 时间轴预览：本日真机看过，视觉干净、层级清楚。
- 本日已修：bodySm 全仓错类（[[text-bodysm-class-trap]]）。

---

## 建议路线（用户拍板优先级）
1. **P1 速修批**（颜色 token 化 + 超小字抬到 micro + ×/▾ 换 Tabler + gap-[7px] 归一）——视觉收益直接、改动局部、可一两批做完。
2. **P2 token 迁移批**（228 字号 + 84 圆角 → token）——量大但机械，建议配 **eslint-plugin-tailwindcss `no-arbitrary-value` 或自定义 lint** 一次迁移 + 守门，根治「绕过 token」整类（P2 思维：修根因不修症状）。
3. **补走查**：驱动空闲时真机过导出/模型接入/素材库/侧栏展开/弹层，补 per-surface 视觉清单。
4. P3 专项排后。

> 注：本审计只查未修。P1/P2 取舍（尤其 228 处批量迁移是否现在做）留用户拍板，不擅自全量改。
