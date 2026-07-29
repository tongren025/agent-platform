# 交接 + 执行计划：模型变体合并（一个模型+变体选择器）+ apimart 全模型参数对齐

> 2026-06-16。用户两个诉求：① **变体合并**——Seedance 一族就 4 个独立模型（标准/fast/face/fast-face），picker 里一堆，要收成「一个模型 + 变体选择器」；② **参数完整对齐**——所有 apimart 模型逐项对官方文档补全（审计见 `docs/audit/2026-06-16-reference-split-and-apimart-params.md`）。
> 上下文够则我带 subagent 做；不够则新 session 拿此文档执行。**本文自包含，照着能直接干。**

## 0. 现状数据流（摸底，file:line）
```
catalog seed (seedBuiltins.ts: 每 modelKey=1 CuratedModel)
  → picker UI (InlineParameterBar.tsx:119-127 NomiSelect 扁平,每 modelKey=1 项 ← Seedance 4 变体=4 项)
  → 选模型写 meta.modelKey/modelAlias/modelVendor (NodeParameterControls.tsx:113-133, 不存 archetypeId)
  → 档案现场解析 resolveArchetypeForModel({modelKey,meta}) (按 meta.archetypeId 或 identifierPatterns)
  → 模式 meta.archetype={id,modeId} (archetypeMeta.ts:347 applyArchetypeModeSwitch)
  → 发请求 buildCatalogTaskRequest (catalogTaskActions.ts:101) extras={...meta,modelKey,archetypeInput}
  → runtime findTaskMapping(vendor,taskKind,modelKey) (runtime.ts:415) selectTaskMapping(精确modelKey>generic)
  → body 取 model：apimart=`{{model.modelKey}}`(catalog行) | happyhorse=`{{request.params.model}}`(modelEnum覆盖)
```
- `ModelArchetype.family` 字段**已存在但 picker 没用它分组**。唯一分组 UI 是 onboarding `ModelChipGroups.tsx`（按 kind，只读）。
- Seedance 4 modelKey → 2 档案（standard + fast，fast 仅为 withFastRes 改清晰度 480/720）；face 靠 identifierPatterns 复用标准档案。`idKey`（apimartVideos.ts videoModel）= 多 modelKey 共享档案时防 mapping id 撞的补丁，正是「变体散成多模型」的痛点信号。

## 1. ★Part A：变体合并设计（核心架构）

### 1.1 机制：新增 `variants` 正交轴（对称 modes 三件套）
变体跨所有 mode（fast 影响 t2v/i2v/omni/firstlast 全部的 resolution），**不能塞进 per-mode 的 `modelEnum`**（否则 mode×variant 笛卡尔积）。新增档案级 `variants`：
- `types.ts ModelArchetype` 加：
  ```ts
  variants?: { id: string; label: string; modelKey: string; paramOverrides?: Partial<Record<modeId, ModelParameterControl[]>> | (controls)=>controls }[]
  defaultVariantId?: string
  ```
- 对称实现（仿 `currentArchetypeMode`/`modeId`/`applyArchetypeModeSwitch`，archetypeMeta.ts:62-71/347）：
  - `currentArchetypeVariant(archetype, meta)` —读 `meta.archetype.variantId` 回落 defaultVariantId。
  - `applyArchetypeVariantSwitch(meta, archetype, variantId)` —只改 variantId，不动参考值（同 mode 切换）。
  - meta 形态：`meta.archetype = { id, modeId, variantId }`。

### 1.2 传输：直接复用 happyhorse 范式（已验证）
- catalog body 的 model 字段：apimart Seedance body 从 `{{model.modelKey}}` 改为 **`{{request.params.model}}`**。
- `buildArchetypeInputParams`（archetypeMeta.ts:321 现 `if(mode.modelEnum) out.model=...` 处）加：
  `out.model = variant?.modelKey ?? mode.modelEnum ?? <catalog modelKey>`（变体优先于 mode enum）。
- 这样实际发出的 modelKey = `doubao-seedance-2.0-fast-face` 等，由变体决定，走 happyhorse 同款 `{{request.params.model}}` 通道。

### 1.3 catalog 合 1 条目
- `apimartVideos.ts`：Seedance 从 4 个 videoModel() 收成 **1 个**（modelKey 取基 id `doubao-seedance-2.0`，labelZh "Seedance 2.0"）；body 用 `{{request.params.model}}`。
- `seedBuiltins.ts`：4 CuratedModel→1，mapping 4×2→1×2（t2v/i2v）。寻址 generic 一条覆盖（变体差异在 body model 字段，不在 mapping 路由）。删 idKey 补丁（不再多 modelKey 共享档案）。

### 1.4 变体能力差异（params 约束随变体变）
- fast 限清晰度 480/720、face 不支持 Asset URL → 变体级 `paramOverrides`（仿 `vendorParams` 的 specializeArchetypeForVendor，index.ts:114-127）。
- 新增 `specializeArchetypeForVariant(archetype, variantId)`：按变体把 mode.params 里 resolution 控件 options 收窄（同 withFastRes 逻辑，从「档案级 spread」改「运行时按 variantId 叠加」）。
- 渲染读取点叠一层：`nodeModelArchetype.ts:48 resolveRenderedControls` / `archetypeModeParams`。

### 1.5 UI：变体选择器（用户可见，**需 R8 样张 + 拍板**）
- 节点上、模型选择器旁/下，加变体分段（仿「生成方式」ModeBar）。Seedance: 标准/快速/真人/真人快速。
- **开放设计点（待用户拍板）**：① 一个 4 选段（标准/快速/真人/真人快速）vs ② 两个正交开关「速度:标准/快速」+「真人:关/开」(Seedance 恰好 2×2，更省)。其它模型变体结构不同(Sora:标准/pro；Veo:fast/quality/lite)→ 通用 `variants` 列表 + 分段选择器最通用；2×2 是 Seedance 特例优化。**建议先做通用分段，Seedance 暂用 4 选段**。
- picker 本身：每 family 只列 1 项（基模型）。需改 `useModelOptions`/`modelOptionsAdapter` 把同 family 的变体折叠成 1 option（保留基 modelKey），或在 catalog 层就只 seed 基模型。

### 1.6 影响面 / 风险
- 改：types/archetypeMeta(变体三件套+specialize)/seedanceApimart(变体声明)/apimartVideos(合1+body model)/seedBuiltins(合1)/InlineParameterBar或新 VariantBar(UI)/NodeParameterControls(渲染变体特化)。
- 兼容：旧项目 meta 存的是 `doubao-seedance-2.0-fast` 等具体 modelKey → resolveArchetypeForModel 仍要能把它映回「基档案 + 对应 variantId」（identifierPatterns 保留旧 modelKey→variant 映射，迁移层）。**这是最大风险点：别让已存项目的模型选择丢失/变空。**
- 五门 + 真实 E2E（每变体发对 modelKey）+ R13 走查 picker/变体切换。

## 2. Part B：apimart 全模型参数对齐（逐模型,对官方文档）
完整缺口表见审计 `docs/audit/2026-06-16-reference-split-and-apimart-params.md`。按优先级：

### B1 取值/默认对不上（会 API 报错,先修,安全）
- Sora 2：标准版 resolution 去掉 1080p(官方仅720p)；duration 连续 number→离散枚举 4/8/12/16/20。
- Veo 3.1：duration 固定 8(去 4-7)。
- Seedance：标准版 generate_audio 默认 true→false；标准版 resolution 默认 720p→480p；补 return_last_frame。
- GPT Image 2：size 补 2:1/1:2/3:1/1:3。
- Omni-Flash-Ext：image_urls slot 去掉非法的 2 张档(官方 0/1/3)。
- Hailuo/Sora：duration 离散枚举（非连续 number）。

### B2 缺核心能力/模式（大,按用户关注度,可灵优先）
- **可灵 v3**：multi_shot 多镜头(shot_type/multi_prompt) + element_list 元素引用 + negative_prompt。
- Veo 3.1：veo3.1-quality/lite 变体(→变体轴) + generation_type(frame/reference)。
- Wan 2.7：video_urls 视频续写 + audio_url 音频驱动 + seed + negative_prompt。
- Omni-Flash-Ext：generation_type(3图reference) + video_urls 参考视频。
- Nano Banana：mask_url inpainting。Seedream：sequential_image_generation 组图 + n。

### B3 缺变体（→ 正好用 Part A 的变体轴接）
Sora `-pro`、Hailuo `-Fast`、Qwen `-pro`、Gemini `-official`。**这些变体合并后用 variants 声明，不再各占 picker 一项。**

### B4 普遍缺可选参数
seed(Wan)、negative_prompt(Kling/Wan/Qwen)、n(Seedream/Gemini/Qwen)、watermark(多视频)、prompt_extend/optimizer(Wan/Hailuo/Z-Image)。

## 3. 执行切片（建议顺序）
- **S0 拍板** ✅ 已定（2026-06-16）：**方案 A——通用 4 选段变体选择器**（仿 ModeBar「生成方式」分段，token 合规）。不用 B 的 2×2 双开关（只适配 Seedance 特例，其它模型变体结构不同会 UX 混用）。样张见对话 model_variant_consolidation。
- **S1 变体轴地基**：types `variants` + archetypeMeta 三件套 + specializeForVariant + buildArchetypeInputParams 写 out.model。单测（变体→modelKey、变体→params 收窄、旧 modelKey 迁移到 variantId）。
- **S2 Seedance 试点合并**：seedanceApimart 声明 variants + apimartVideos 合1+body model + seedBuiltins 合1 + 迁移层。真实 E2E（4 变体各发对 modelKey）。
- **S3 UI 变体选择器**：VariantBar 组件(仿 ModeBar,token合规) + picker 折叠 family + 渲染变体特化。R13 走查。
- **S4 推广 + 参数对齐**：其它 family 套变体(Sora/Veo/Hailuo/Qwen/Gemini 变体) + B1 取值快修 + B2 缺能力(可灵优先) + B4 可选参数。每模型对官方文档逐项打钩。
- **S5 收尾**：审计文档回填、设计系统登记 VariantBar、E2E 回归锁。

## 4. 不动什么
- 档案 modes/modeId 三件套（变体是平行新轴，不改 modes）。
- happyhorse modelEnum（per-mode 范式不动，变体复用其传输通道但走新轴）。
- 已修的 #4 URL 优先级、视频抽帧、首尾帧 combine（与本次正交）。

## 5. 验收门
五门 + **真实生成 E2E（每变体抓请求体确认发对 modelKey + 参数对官方）** + R13 真机走查（picker 只剩 family 项、变体切换、旧项目模型不丢）+ 与官方文档逐项对账打钩。

## 6. 关键 file:line 索引
- 档案类型/轴：`src/config/modelArchetypes/types.ts`
- 档案三件套：`src/workbench/generationCanvas/nodes/controls/archetypeMeta.ts:62-71`(read)/`:347`(switch)/`:321`(out.model 写入点)
- vendor 特化范式：`src/config/modelArchetypes/index.ts:114-127` specializeArchetypeForVendor
- Seedance 档案：`src/config/modelArchetypes/seedanceApimart.ts`
- catalog：`electron/catalog/apimartVideos.ts`(videoModel/body)、`electron/catalog/seedBuiltins.ts`(seed)
- 传输 modelKey：`electron/runtime.ts:415`(findTaskMapping)/`:423`(templateContext)、`electron/catalog/kieHappyhorse.ts:30`(modelEnum body 范式)
- picker UI：`src/workbench/generationCanvas/nodes/InlineParameterBar.tsx:119-127`、`NodeParameterControls.tsx:113-133`(选模型)、`modelOptionsAdapter.ts`/`useModelOptions`(列表来源)
- 模式 UI 参照：`src/workbench/generationCanvas/nodes/controls/ModeBar.tsx`（VariantBar 仿它）
