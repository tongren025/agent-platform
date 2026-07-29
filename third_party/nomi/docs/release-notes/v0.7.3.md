# Nomi v0.7.3 — 4 个 UX bug 修复

发布日期：2026-05-27
依据：v0.7.2 用户实测复现的 4 个具体问题

## 修了什么

### 1. 拖卡片到时间轴失败
**原因**：`findTimelineDropTarget` 用 `document.elementFromPoint`（单数），返回 cursor 下最顶层元素。但拖动时被拖的卡片就在 cursor 位置 → 永远返回卡片自己，永远找不到时间轴轨道 → 拖不进去。

**修法**：改用 `document.elementsFromPoint`（复数），返回所有重叠元素，遍历找第一个匹配时间轴轨道的。

顺手修了 `TimelineTrack.handleDrop` 的 audio clip 路由 bug：HTML5 拖拽时 audio clip 没经过 `getTrackTypeForClipType` 映射 → 之前 audio HTML5 drop 静默失败。

### 2. 点 sidebar item 不切换到对应节点
**原因**：sidebar 只调 `selectNode`，没派发 `nomi-focus-generation-node` 事件。canvas 有这个事件监听器（用于"独立副本定位源节点"），但 sidebar 没接进去。

**修法**：sidebar 的 `handleSelectNode` 加 `window.dispatchEvent` 派发 focus 事件 → canvas 切到目标分类 + pan/zoom 到该节点 + 高亮 1.4 秒。

### 3. 未生成（空）卡片不能拖动
**原因**：v0.7.1 的 `UploadFallback` label 加了 `onPointerDown={e => e.stopPropagation()}`，把 article 的 drag-to-move 也拦住了 → 整个空卡片都无法拖动。

**修法**：去掉 stopPropagation；依赖现有的 2px drag threshold 区分"点击开文件框 vs 拖动"。子元素加 `pointer-events-none` 避免拦事件。

### 4. 卡片显示"图片 36"等异常计数
**原因**：`buildUsageMap` 没去重 title — 多张同名卡片（如默认标题"图片"）让同一 shot 被重复推入桶。用户有 5 张默认名"图片"的卡 × 真实命中 8 shots = 显示 40。

**修法**：title 收集改成 Set 去重，每个 (shot, title) 组合最多记一次。

## 升级

v0.7.x → v0.7.3 数据兼容。

## 还在 v0.8 队列

- 上传文件改电子 IPC 写盘（避免 dataURL 撑大持久化）
- 音频 kind 数据层 + 真实音频生成
