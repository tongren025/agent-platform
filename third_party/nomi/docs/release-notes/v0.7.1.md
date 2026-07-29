# Nomi v0.7.1 — 卡片可生成 + 可上传 + 媒体轨道抽象 + 性能优化

发布日期：2026-05-27
依据：v0.7.0 实测反馈（4 类卡片不能用 + 卡顿 + 时间轴不灵活）

## 核心修复

v0.7.0 把 4 类卡片做成了"纯展示"，用户没法生成 / 上传 / 拖时间轴。v0.7.1 把它们变成真正可用的创作单元。

## 4 个变化

### 1. 选中卡片 → 弹 composer
角色 / 场景 / 道具 / 声音卡选中时，下方浮出 composer（与 shots 一致的提示词框 + 模型选择 + 生成按钮）。

技术：`BaseGenerationNode.tsx` 删掉 `!isCardKind` 屏蔽。

### 2. 4 类卡片支持上传
空状态显示"+ 上传"CTA：
- 角色 / 场景 / 道具：accept `image/*`
- 声音：accept `audio/*`，上传后真实可播放（HTMLAudioElement）+ 自动读时长写入 `meta.durationSec`

技术：`CardCommon.UploadFallback` 新增，4 个卡片组件 wire up。

### 3. 视频轨道改"媒体轨"，容纳 video + audio
`TimelineClipType = 'image' | 'video' | 'audio'`。Audio clip 落到原视频轨（重命名"媒体轨"）。
`getTrackTypeForClipType` helper 集中映射逻辑。

技术：`timelineTypes.ts` + `timelineEdit.ts` + `timelineDropFeedback.ts` + `buildClipFromGenerationNode.ts` + `sendGenerationNodeToTimeline.ts` 一起改。

### 4. 卡片宽度尊重 spec
- 角色卡 / 道具卡：200 px 固定
- 场景卡：320 px 固定
- 声音卡：420 × 80 固定

v0.7 强行 min 240 导致卡片被撑大，v0.7.1 卡片模式跳过 MIN_NODE_WIDTH。

## 性能优化

- `BaseGenerationNode` 用 React.memo 包裹（node 引用 + selected + readOnly + focusFlash 四个 prop 浅比较）
- 拖动单个节点不再触发其他节点 rerender（zustand store 引用稳定 + memo 配合）

## 已知限制 / 推迟到 v0.8

- 音频生成（audio kind 数据层 + 音频模型 adapter）—— 当前 audio 卡选中后 composer 仍按 `kind='image'` 占位提供 image 模型选择，生成会出图而不是出音频。**v0.7.1 仅支持音频上传，不支持音频生成。**
- 真实波形分析（仍是静态 SVG 占位）
- 时间轴上 audio clip 的真实播放

## 升级

v0.7.0 → v0.7.1 数据兼容，直接打开即可。

## 设计系统合规

所有变更走 token，无 hex。卡片宽度匹配 `nomi-cards-design-v1.md` §4。
