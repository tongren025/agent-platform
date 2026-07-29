# Nomi v0.6.1 — Composer 真正 flex-内嵌

发布日期：2026-05-25
依据：v0.6.0 release notes 里 "已知限制" 第 1 项的完整修复

## 唯一变更

**分镜节点的 composer 改为真正的 flex 内嵌**，与图像区共占节点视觉空间，组成一张完整的 Mura 风格分镜卡。

### Before (v0.6.0)
- 节点是 ~180px 的图像方块
- Composer `absolute` 浮在节点下方 → 视觉上 "图 + 飘出来的工具栏"
- 跟 Mura 设计稿一对比就感觉"布局没对齐"

### After (v0.6.1)
- 节点是 ~360px 高的完整卡片
- 上半部分（flex-1）：图像 / 占位斜条纹
- 下半部分（120-180px）：composer，没有 absolute 定位
- 视觉上 "一张分镜卡 = 图 + composer"，跟 Mura 设计一致

## 实现细节

- 新增 `isInlineComposer` 判定（仅 shots 分类 + 非 readonly + 非 panorama 触发）
- Article 容器：从 grid 1-row 改为 flex-column（仅 shots）
- Preview div：从 `h-full` 改为 `flex-1 min-h-0`（仅 shots）
- Composer：从 `absolute top: calc(100%+gap)` 改为 `relative flex-shrink-0`（仅 shots）
- 其他分类节点保持现有行为（selection-based 浮层）

## 不影响

- 角色 / 场景 / 道具 / 声音 分类节点
- 选中时的浮层 composer 触发逻辑
- 节点拖动 / 缩放 / 编辑等所有现有交互

## 升级

v0.6.0 用户首次启动 v0.6.1 时无需任何迁移，重新打开项目即可看到分镜节点新布局。
