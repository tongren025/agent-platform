# Nomi v0.7.4 — HTML5 拖拽到时间轴修复

发布日期：2026-05-27

## 修了什么

v0.7.3 修了 pointer-based 拖拽（拖整张卡片），但**用右侧 grip 小按钮拖（HTML5 DnD）依然无效**。本版彻底修好。

### 真凶：浏览器安全限制

`TimelineTrack` 的 `onDragOver` / `onDragEnter` 用 `resolveDropPreview` 读 `event.dataTransfer.getData(MIME)` 解码载荷。**但 HTML5 DnD 规范在 dragover/enter 期间禁止 getData()**（防数据泄漏），只能读 `dataTransfer.types`。

→ `getData` 返回空 → 解码失败 → 返回 null → **`event.preventDefault()` 永不调用** → 浏览器认定不是合法 drop target → drop 事件根本不触发。

### 修法

`onDragEnter` / `onDragOver` 改成查 `dataTransfer.types.includes(MIME)`（这个在 drag 期间合法）。Payload 解码推到 `onDrop`（这时 getData 解锁）。

顺手补回视觉反馈：drag 中无法生成精确 preview，但用一个 `isDragHovering` state 给轨道加 accent 色高亮，至少能看到"我正在悬停，松手会落下"。

## 测试

- 抓住卡片右侧 grip ⋮ → 拖到时间轴 → 轨道高亮 → 松手 → clip 入轨 ✓
- 拖卡片本体（pointer 路径）也能落 ✓
