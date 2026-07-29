# 审计：参考真相源分裂 + apimart 全模型参数完整性（2026-06-16）

> 触发：用户真机「可灵 i2v 生成与参考图无关（白烧额度）」+「连线没连上但参考图上去了」+「怕其他视频模型也有此问题」+「查 apimart 参数是否完整」。两路 Explore agent 深审，本文汇总。

## 一、参考「显示真相源」vs「生成真相源」结构性分裂（系统性，影响所有视频模型）

**地基根因**：显示用 `resolveReferenceSlots`（`runner/referenceSlots.ts:73-148`），生成用**另一个独立函数** `resolveGenerationReferences`（`runner/generationReferenceResolver.ts:26-121`）。memory `connection-reference-bugs-2026-06-14` 的方案（`docs/plan/2026-06-14-connection-reference-capability-model.md`）的 **S3「生成也收口到 resolveReferenceSlots」从未落地**——只做了 S1（建函数）+ S4（显示接入）。两函数对边的处理规则不同 → 显示能画出的图，生成不一定读得到。

### 1a.「线没连上但参考图上去了」根因（钉死）
`nodes/completeNodeConnection.ts:17-28`：拖线到「当前模式有 image **数组**槽」的节点（可灵 i2v 的 image_ref、所有全能参考模式），走 `addAssetUrlToNode` 把 URL 写进 `meta.referenceImageUrls`，然后 **`cancelConnection()` + return——不建任何 edge**，且**不弹 toast**。
→ 现象：没有边/没有连线（CanvasEdgeLayer 画不出），但参考槽经 `resolveReferenceSlots` 的「上传」分支（referenceSlots.ts:124-137）显示出图。用户以为连线失败，其实写了 meta 参考。
- **系统性**：影响所有「当前模式声明 image 数组槽」的模型。纯单帧槽模型（Hailuo/Seedance keyframe）反而会建边、有线——所以不同模型表现不一致（数组槽 vs 单帧槽分界）。
- **注**：此 meta-only 路径**生成是会读到的**（buildArchetypeInputParams 读 meta.referenceImageUrls）→ 所以图其实进了请求。故 1a 本身不直接导致 #4。

### 1b. URL 优先级不一致
显示 `referenceUrl.ts:17` = `providerUrl || url || thumbnailUrl`；生成 `collectNodeContext`（`nodeContext.ts:48-50`）只读 `result.url || thumbnailUrl`，**不读 providerUrl**。源若只有 providerUrl 无 url → 显示有、生成兜不到。

### 1c. 对账静默放过（三口径不收敛）
`agent/reconcile.ts:88-113` 只遍历 agent 计划的边，**不扫描手动拖线产生的「无边有图」meta-only 状态** → 静默放过。

### #4 可灵 i2v 图没进请求体 —— ✅ 已钉死并修（2026-06-16）
真机捕获请求体证明**传输完全正确**（image_urls 带图正常发可灵）。根因 = **全代码 URL 提取优先级不一致**（即 1b）：显示读 providerUrl 优先，但生成侧 `collectNodeContext` 和写 meta 的 `resultPreviewUrl` **都不读 providerUrl** → 只有 providerUrl 无 result.url 的图（很多生成图就这形态）显示得出、生成兜不到 → image_urls 空 → 纯文生出无关内容。已修（commit 9770e79，两处统一 providerUrl 优先 + 回归测试），0.10.7。详见 memory `url-priority-inconsistency-ref-lost`。

### 1d.「为什么数组参考不连线」根因（钉死，2026-06-16 用户追问）
代码注释说「数组绝不变持久边、否则崩 (target,mode) 唯一性」——**这理由是错的/过时的**：`model/graphOps.ts:80 connectNodes` 去重按 **(source,target,mode)**，同目标连多个**不同源**本来就允许、不撞唯一性。
**真实原因 = 顺序**：`image_ref` 数组槽 `characterIndexed`（types.ts:39），按序对应 prompt 的 character1/2/3（缩略图 ①②③）；而 `GenerationCanvasEdge`（generationCanvasTypes.ts:190）只有 `{id,source,target,mode}`、**无 order 字段** = 无序集合。N 张图连成 N 条边 → 丢「谁是 character1」。所以数组存有序 meta（不画线），单帧槽（无序问题）才画线。
- 当前的 toast「已作为参考图添加」(completeNodeConnection.ts) **是权宜**，绕症状不碰根。

### 地基修法（让这类不再复发）★= 用户排第 3 的「参考真相源收口」，含「让数组也连线」
正解一举三得（连线视觉对 + 显示/生成收口 + #4 整类不复发）：
1. **边加 `order` 字段**（generationCanvasTypes.ts GenerationCanvasEdge）→ 数组参考也能用**有序的边**表达（保住 character1..N 顺序）。
2. **拖线到数组槽改成建有序边**（completeNodeConnection.ts 去掉 meta-only 早退 + cancelConnection；删权宜 toast，P1）→ 线画出来、显示=数据一致。
3. **生成收口到边**：`generationNodeExecutor`/`buildArchetypeInputParams` 直接消费 `resolveReferenceSlots` 的有序 fills（含 origin），删 `resolveGenerationReferences` 的独立边解析（治整类分裂）。
4. **对账**断言「fills 里每个 edge-origin 都有真实 edge」（治 1c）。
5. **迁移**：旧项目 meta.referenceImageUrls 有序数组 → 建成对应有序边（别丢已存参考）。
6. 排期：等 Seedance 变体合并 subagent 落地合 main 后做（两大地基重构不并行，都碰参考系统会 merge 打架）。先出 R8 样张「多图参考连线带 ①②③」。

## 二、apimart 全模型参数完整性（对官方文档，16 个模型）

### A. 缺核心能力/模式（重灾区，像 Seedance 之前那样）
| 模型 | 缺什么 | 官方 URL |
|---|---|---|
| **可灵 v3（用户正用,最高优先）** | `multi_shot` 多镜头分镜(shot_type/multi_prompt) + `element_list` 元素引用 + `negative_prompt`。档案注释自承"作后续增强"=明知故缺 | kling-v3/generation |
| **Veo 3.1** | `veo3.1-quality`/`veo3.1-lite` 两变体 + `generation_type`(frame/reference 模式区分) | veo3/generation |
| **Wan 2.7** | `video_urls` 视频续写 + `audio_url` 音频驱动两模式 + `seed` + `negative_prompt` | wan2.7/generation |
| **Omni-Flash-Ext** | `generation_type`(3图reference模式) + `video_urls` 参考视频 | omni-flash-ext/generation |
| **Nano Banana** | `mask_url` inpainting 局部重绘 | gemini-2.5-flash/generation |
| **Seedream 4.5** | `sequential_image_generation` 组图模式 + `n` | seedream-4.5/generation |

### B. 缺变体
Sora 2 缺 `sora-2-pro`；Hailuo 2.3 缺 `-Fast`；Qwen-Image 缺 `-pro`；Gemini 缺 `-official`。

### C. 取值/默认对不上官方（会 API 报错或行为偏差，**快修**）
- **Sora 2**：标准版 resolution 不该有 1080p（官方仅 720p）；duration 应离散枚举 4/8/12/16/20（现连续 number 可发非法值）。
- **Veo 3.1**：duration 官方仅 8，现允许 4-8。
- **Seedance 标准**：`generate_audio` 默认应 **false**（现 true）；标准版 resolution 默认应 480p（现 720p）；`return_last_frame` 仍缺（memory 点名过）。
- **GPT Image 2**：size 漏 `2:1/1:2/3:1/1:3`。
- **Omni-Flash-Ext**：image_urls slot 允许非法的 2 张（官方 0/1/3）。
- **Hailuo/Sora**：duration 离散枚举用了连续 number 控件。

### D. 普遍缺可选参数
`seed`(Wan)、`negative_prompt`(Kling/Wan/Qwen)、`n`(Seedream/Gemini/Qwen)、`watermark`(多视频)、`prompt_extend/optimizer`(Wan/Hailuo/Z-Image)。

**唯一完整**：Imagen 4。

## 三、修复优先级（待用户拍板范围 R3）
1. **P0 #4 真实请求体复现**（白烧额度，最该先钉）→ 烧 1 可灵额度抓 body。
2. **P0 取值快修**（C 类，防 API 报错）：Seedance generate_audio 默认 + Sora/Veo duration + Sora 1080p。安全数据改动。
3. **P1 线 bug**：拖数组槽加 toast「已作为参考图添加」（治混淆）；地基则做「也建边」。
4. **P1 地基 S3**：显示/生成收口同一真相源（治整类分裂）。
5. **P2 缺能力/变体**（A/B 类）：可灵 multi_shot/element_list、Veo/Wan/Omni 新模式、缺变体——逐模型补，工作量大，按用户关注度排（可灵优先）。
