# Nomi v0.6.0 — Phase E.2 完成版

发布日期：2026-05-25
依据：`docs/plans/2026-05-25-phase-e2-completion-and-tech-uplift.md`

## 概览

v0.5.1 部分实现了 Phase E.2 的 "5 分类 + Mura 视觉 + 跨分类独立复制 + 派生标签"，但有 7 项 spec 偏离。v0.6.0 把这些偏离全部修补到位，并完成一次架构清理（删除 viewType 系统、统一画布底座）。

## 用户可见变化

### 视觉

- **Tabler 图标替代 emoji**：sidebar 5 个分类图标改用 Tabler outline 图标（IconLayoutRows / IconUser / IconPhoto / IconBox / IconChartBar），与 Mura 设计对齐
- **节点标题 pill**：节点左上角浮动深色圆角胶囊，显示 "分镜 01" / "角色" 等
- **分镜自动编号**：分镜分类节点按 position.y 升序自动编号，拖动后实时重算
- **占位态新文案**：节点未生成时显示 "分镜 03 / 等待生成"（取代旧的 "点击节点填写提示词"）；保留斜条纹背景
- **独立副本角标改文案**：跨分类副本角标从 "派生" 改为 "独立副本"（icon 同步换为 IconCopy），tooltip 显示完整路径 "独立副本（来自 [分类]·[名]）"

### 交互

- **Composer 永久可见（shots 分类）**：分镜分类节点的 composer 不再 selection-based 浮层，永久可见以提升可发现性
- **空状态 CTA**：画布空时显示 "+ 新建{分类名}" 按钮（旧的通用引导文案被替换）
- **撤销 toast**：跨分类拖拽完成后 5 秒内可点击 toast 撤销
- **Sidebar 仅在生成区显示**：创作 / 预览 step 不再共享 sidebar，恢复全宽

## 内部架构变化

- 删除 `viewType` 字段与 `CategoryViewType` 系统：5 个分类全部基于同一画布底座
- 引入 `NodeRenderKind` 数据字段（5 种 kind 对应 5 分类默认渲染样式）
- `derivedFrom` 语义收窄：仅承载跨分类独立副本；同分类 "基于此重生成" 链路改存 `regeneratedFrom`
- 分镜节点新增 `shotIndex` 字段（migration 写入；UI 始终 live 计算）
- Migration v0.5.1 → v0.6.0 自动跑：renderKind 补齐、derivedFrom 语义分流、shotIndex 计算
- GroupFrame 从 GenerationCanvas 内联实现抽离为独立组件
- 删除 lucide-react 依赖，全部图标走 @tabler/icons-react
- 新增 commit-msg hook 强制进度表更新（防止 spec 不被尊重）

## 内部基建

- `scripts/check-progress-update.cjs` + `scripts/install-git-hooks.cjs`：commit message 含 `[E.2C-XX]` 时必须在同一 commit 更新进度表为 ✓，否则拒绝

## 数据迁移

v0.5.1 项目首次打开时自动迁移：

- 节点 `renderKind` 按 categoryId 推断默认值
- `derivedFrom` 重新分流：同分类源 → 移到 `regeneratedFrom`；不同分类源 → 保留；源不存在 → 清空
- 分镜节点 `shotIndex` 按 position.y 升序赋值

迁移幂等，无需用户操作。

## 已知限制

- **Composer 视觉定位**：永久可见后仍以 absolute 浮在节点下方（保持兼容）。spec §6.1 期望的 "真正内嵌到 card flex 流" 是 future iteration
- **5 个分类节点渲染样式差异**：当前所有分类共用 BaseGenerationNode 渲染（仅 composer 永久性、占位文案、副本角标按 category 区分）；spec 提出的 5 个独立 render 组件被识别为 over-engineering，已合并简化
- **集成测试**：依赖人工验证（v0.5.1 audit 流程的延续）
- **Audio 分类节点 kind**：当前空状态 CTA 创建 'image' kind（声音分类暂用 image 占位），audio kind 待 future iteration

## 推迟到 Phase E.3 的内容

W0 的 11 项技术栈升级（React 19 / Vite 6 / TS 5.7 / Zustand 5 / TipTap 4 / Tanstack Query 5 / Vitest 3 / Biome / Electron 33 / 持久化抽象）整体推迟到独立的 Phase E.3 单独完成，避免与功能开发复合风险。

## Commit 历史（v0.5.1 → v0.6.0）

按 task 顺序：

- `[E.2C-01]` chore(dev): 进度更新 hook
- `[E.2C-13]` refactor(project): 删除 viewType 系统
- `[E.2C-14]` feat(project): NodeRenderKind + Tabler 图标映射
- `[E.2C-15]` feat(canvas): Node 类型扩展
- `[E.2C-16]` feat(project): Migration v51→v60
- `[E.2C-17]` feat(canvas): TitlePill 组件
- `[E.2C-18]` feat(canvas): composer 永久可见（shots）
- `[E.2C-24]` feat(canvas): 空状态 CTA
- `[E.2C-25]` feat(canvas): 独立副本角标
- `[E.2C-27]` feat(canvas): live shotIndex
- `[E.2C-28]` feat(canvas): 占位态文案
- `[E.2C-11]` refactor(ui): 删除 lucide
- `[E.2C-26]` feat(workbench): 撤销 toast
- `[E.2C-29]` refactor(workbench): sidebar 下沉到 GenerationWorkspace
- `[E.2C-30]` refactor(canvas): GroupFrame 抽离
- `[E.2C-33]` chore(release): bump 0.6.0

## 验收

- ✅ build:renderer 通过
- ✅ 235 tests 全过（含 10 新增 migration 测试）
- ✅ 7 项 v0.5.1 audit 偏离全部修补
- ✅ 4 项用户决策落地
- ⏸ 手动集成测试待用户验证
- ⏸ Phase E.3 技术升级独立排期
