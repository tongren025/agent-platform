# Nomi v0.7.2 — 性能修复（去除 O(n²) selector + 订阅粒度收敛 + 卡片 memo）

发布日期：2026-05-27
依据：v0.7.1 用户反馈 "卡顿没修干净"，深度审计后定位 6 个性能问题，全修。

## 修了什么

v0.7.1 把 `BaseGenerationNode` memo 了，但内部 8 个 store 订阅有 4 个返回数组/对象引用，**任何 state 变化都触发所有节点重渲染**。memo 救不了内部订阅。这版把订阅粒度全部收敛到 primitive。

### P0 — 真正的卡顿大头

1. **每个节点订阅 `selectedNodeIds` 整数组** → 改成 `state.selectedNodeIds.length > 1` boolean。任何选中变化不再触发所有节点重渲染。

2. **`useNodeUsageCount` / `useNodeVariantCount` 每次 store 变都跑 O(n) filter，n 张卡 × O(n) = O(n²)** → WeakMap 缓存 keyed on `state.nodes` 引用。同一 nodes 数组只 build 一次，每张卡 O(1) Map.get 查询。15 张卡 × 30 节点：450 次过滤 → 0 次。

3. **shots 占位编号 selector 每次任何 state 变都 O(n log n) filter+sort** → 走同一个 WeakMap 缓存模式。新增 `useShotIndex` hook。

### P1 — 锦上添花但本身是 bug

4. **`canGenerate` 用 `getState()` 同步读，不响应 nodes/edges 变化** → 改为正式 store selector。之前是个隐藏 bug：连线/状态变化后 canGenerate 直到下次别的订阅触发 render 才会刷新。

5. **`sourceNode` 订阅返回整个 node 对象** → 拆成 3 个 primitive 订阅（title / categoryId / exists）。

6. **`pendingConnectionSourceId` 订阅返回 string** → 拆成两个 boolean（isPendingSource / isPendingTarget），只关心当前节点状态翻转。

### 卡片本体 memo

7. CharacterCardNode / SceneCardNode / PropCardNode / AudioStripNode 4 个组件全部 `React.memo(Impl, (p, n) => p.node === n.node)`。

## 性能预期

- 30 节点项目，单次拖动 / 选中 / 打字 → 仅相关节点重渲染，其他 0 render
- 卡片关联计数运算成本从 O(n²) 降到 O(n) once + O(1) lookup
- 拖动节点期间 ~60fps 应该稳得住（之前会掉到 20-30fps）

## 已知遗留（v0.8）

- 上传 dataURL 写进 store 导致大文件持久化慢 —— 需要 electron IPC 写到 userData 文件系统
- 音频生成（audio kind 数据层 + 音频模型 adapter）

## 升级

v0.7.0 / v0.7.1 → v0.7.2 数据兼容，直接打开。
