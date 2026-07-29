# Nomi v0.7.8 — 修复创作编辑器的黄色 focus 框

发布日期：2026-05-27

## 修了什么

点击创作页文本编辑器后整框出现亮黄色边框，跟产品 accent token（蓝紫）完全冲突。

**根因**：Tiptap 的 `.ProseMirror` div 没有显式 focus 样式，浏览器在 macOS 上调用 `outline: auto` —— 这个值会**跟随系统强调色**（系统设置 → 外观 → 强调色）。用户系统设为"黄色"或"橙色"时，编辑器就出黄框。代码里搜不到 yellow 因为颜色根本不是代码定义的。

**修法**：
1. `.ProseMirror:focus` / `:focus-visible` 显式 `outline: none`，盖掉系统默认
2. 外层 `<section>` 加 `focus-within` 时切到 accent 蓝紫细边 —— 保留键盘 focus 反馈，但用我们的设计色

## 副作用 / 兼容

- 鼠标点击 + 键盘导航的 focus 反馈都还在，只是颜色改了
- 不动 Tiptap 配置，只改 CSS
- 不动其他编辑器（提示词框、问点什么等都各自有自己的 focus 处理）
