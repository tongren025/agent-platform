# 多项目工作台：浏览器式标签页 + 分屏（#4-a）

> 2026-06-19 · 状态：方向已拍板（浏览器式标签 + 分屏），分两阶段。
> 用户拍板：UI 像浏览器（标签 + ＋号 + 可拖宽度）；开源敢大胆，但"弄坏用户作品"是唯一硬线。
> 演进自原"原生多窗口"调研——用户选了**应用内标签**而非原生 OS 窗口（更轻、更顺、可跨屏靠分屏）。

## 0. 实测 blast radius（决定分两阶段的依据）

`useWorkbenchStore` = 全局单例（[workbenchStore.ts:212](src/workbench/workbenchStore.ts)，691 行），37 文件 / 265 处用：
- **105 处** `useWorkbenchStore(选择器)` hook —— context 化后透明接管，基本不改。
- **121 处** `.getState/.setState/.subscribe`（**非 React**，散在 agent 工具/生成控制器/IPC 桥）—— 全假设"单一全局 store"。**这是分屏的硬骨头**：每处都要重接线成"操作哪个面板"。接错 = agent/生成写到错的项目 = 跨项目串改 = **唯一不能碰的线**。

→ 故：**标签页不动 store（安全，先做）**；**分屏要 store 隔离 + 121 处重接线（危险，独立专注一轮 TDD 做）**。

## 1. 阶段一：标签页（本轮做，不动 store）

**心智**：标签 = 当前打开的项目集；一次**活一个**项目（全局 store 仍单例）；切标签 = 项目加载（Nomi 已有 hydrateForProjectLoad + `#/studio?projectId=X` 路由）。后台生成在主进程跑，**切走不停** → 核心爱点「A 出片时去 B 干活」成立。

- **标签条 UI**：浏览器式,顶栏一条。每标签 = 项目图标 + 名 + ×；右侧 ＋。复用 Nomi token/组件。
- **＋ 号**：开项目选择（项目库 picker）→ 选中作为新标签 + 切过去。
- **切标签**：navigate `#/studio?projectId=X` → 触发现有项目加载。切前持久化当前项目（Nomi 草稿/落盘机制已在）。
- **关标签**：移出标签列表；若关的是活动标签 → 切到相邻。
- **同项目锁（硬线）**：一个项目同时只占一个标签；重复打开 → 聚焦已有标签（数据安全；为阶段二分屏也铺好）。
- **标签状态存哪**：新建轻量 `useProjectTabsStore`（app 级，独立于 per-project workbenchStore）+ 持久化 localStorage（重开 app 恢复标签）。**不混进 workbenchStore**（分层 R9）。

**不动**：workbenchStore 架构、生成后端、per-project hydrate。

## 2. 阶段二：分屏（独立一轮，store 隔离重构）

**心智**：两项目同屏并排，中间可拖宽度，两边都活。

- **store 工厂化**：`createWorkbenchStore()` + React context（`WorkbenchStoreProvider`）；`useWorkbenchStore(selector)` 改读 context store（105 处 hook 几乎零改）。
- **121 处非 React 访问重接线**：这些拿不到 React context → 必须**显式传 store 实例**（agent session / 生成控制器 / IPC 桥都带上"这是哪个 pane 的 store"）。逐处改 + 单测锁"操作落在正确 pane"。
- **分屏布局**：两 pane 各包一个 `WorkbenchStoreProvider`，中间 draggable divider（宽度比例存 tab 状态）。
- **IPC 事件按 pane 路由**：项目相关事件只回对应 pane（主进程维护 paneId→projectId）。
- **TDD 铁律**：每接线一批 → 单测"agent/生成只改自己 pane 的项目"，防跨项目串改。

## 3. 不动什么
- 主进程后端 / catalog / 任务系统 = 共享不复制（P1）。多 pane 并发生成各跑各的（task 按 id 独立，已验）。
- task/agent/onboarding 的 id 过滤事件已隔离，不动。

## 4. 回滚
- 阶段一：标签条 + tabs store 是增量；撤掉标签条即回单项目（路由/hydrate 本就在）。
- 阶段二：store 工厂 + context 是大改，独立分支做、全门 + 跨项目串改回归断言绿才并。

## 5. 验收门
- **阶段一**：五门过；真机 ＋开俩项目 → 切标签项目不串 + A 后台生成切到 B 不停 + 关标签不崩 + 重复开同项目聚焦不新建；tabs 持久化重开恢复。
- **阶段二**：全门 + **跨项目串改回归断言**（agent/生成/IPC 都只落自己 pane）+ 真机分屏拖宽度 + 双屏并发生成互不污染。

## 6. 资源态度（开源敢大胆）
每标签轻（一次活一个,不叠渲染）；分屏才双份渲染 → 文档提示量力分屏。不做硬上限。
