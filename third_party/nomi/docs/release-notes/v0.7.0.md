# Nomi v0.7.0 — 4 类卡片分化（基于设计系统）

发布日期：2026-05-25
依据：`docs/design/nomi-cards-design-v1.md`

## 核心变化

v0.6.x 时所有 5 类节点（分镜/角色/场景/道具/声音）共用 BaseGenerationNode 渲染，视觉无差。v0.7 让 4 个非分镜分类各自有专属卡片视觉，回应每类的真实创作使用情境。

## 4 类卡片

### 角色卡 (CharacterCardNode)
- 200 宽 + 图（object-contain 完整显示）+ 80px 信息区
- 显示：名字 / 一句话设定（meta.tagline）/ 使用次数 / 变体数
- 数据缺失行自动隐藏，不显示 placeholder

### 场景卡 (SceneCardNode)
- 320 宽 + 主图 full-bleed + 浮动信息条（半透明深底 + backdrop-blur + 白字）
- 显示：名字 / 氛围 mood tag / 使用次数 / 变体数

### 道具卡 (PropCardNode)
- 200 宽 + 图 + 60px 信息区
- "归属"用 IconLink + nomi-accent 高亮显示

### 声音卡 (AudioStripNode)
- 420×80 固定横条 (与图像类完全不同范式)
- 播放按钮 + 类型徽标 (BGM/音效/旁白) + 名字 + 波形 placeholder + 时长 + 使用次数
- v0.7 不做真实音频播放（待 audio kind 落地）

## 内部架构

- 新增 `node.meta` 字段类型（CharacterMeta / SceneMeta / PropMeta / AudioMeta）+ provenance 标记
- Live 计算 hooks（useNodeUsageCount / useNodeVariantCount）—— 文本匹配 MVP
- BaseGenerationNode dispatcher：按 renderKind 渲染对应卡片，preview/composer 仅 shots 显示

## 设计系统先行

依赖 `docs/design/nomi-design-system.md` v1 — 所有颜色 / 字号 / 圆角 / 图标全部走 token，无 hex。

## 已知限制（推迟到 v0.7.1）

- **AI 从剧本一次性提取卡片元数据** — spec §5.5 已设计完整方案（generateObject + zod schema + SYSTEM_PROMPT），实现推到 v0.7.1
- **"从剧本同步" 按钮 + 预览 modal** — 同上推迟
- **首次同步隐私确认 modal** — 同上
- **NewCardInlineForm** — 创建空白卡片的 inline 表单，v0.7 用户仍走现有"+ 新建"路径（创建默认空卡片）
- **默认尺寸按 renderKind 智能调** — 暂用现有 kind 默认尺寸，用户可手动调整
- **真实音频处理** (AudioStripNode 仅显示骨架，没有真实播放/波形分析) — 待 audio kind 数据层落地

## 升级路径

v0.6.x 项目直接打开 v0.7：
- 现存 cast/scene/prop/audio 分类节点自动用新卡片视觉渲染
- 因为 meta 是空的，新卡片只显示图 + 名字 + 0 计数（其它行隐藏）
- 这种"少了 tagline 行"的视觉降级**不是 bug**，是设计选择（spec §3.4 Level 0）

## 设计系统合规

- ✅ 所有颜色 token 化（无 hex / rgba）
- ✅ 字号 token 化（micro/caption/body/title）
- ✅ 图标 100% Tabler（lucide 已删，IconLink / IconPlayerPlay 等）
- ✅ 4 个新组件 + helpers 已登记到设计系统 §11 todo（待 v0.7.1 完整登记 §4）
