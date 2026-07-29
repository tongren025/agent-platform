# Nomi v0.7.9 — 去掉编辑器 focus 边框

发布日期：2026-05-27

## 修了什么

v0.7.8 修了黄色边框但加了蓝紫色 focus-within 边框作为替代。用户反馈不要任何 focus 边框 —— 直接去掉。

现在创作编辑器 focus 时只有光标，没有任何外框变化。

`.ProseMirror:focus { outline: none }` 保留（盖住系统默认黄/蓝色）。
