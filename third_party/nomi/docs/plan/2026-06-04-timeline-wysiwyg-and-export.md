# P2 预览=成片(WYSIWYG) + P3 导出能力（音频/字幕/转场）执行文档

日期：2026-06-04
状态：**方案定稿中（含需用户拍板的决策点 + 分步落地）**
承接：`docs/plan/2026-06-03-timeline-interaction-rework.md`（P1 已 push，commit 35f089c）

> 遵守 CLAUDE.md：规则 3（决策对比表）、4（执行前文档）、5（Context7 查 ffmpeg，已做）、6（顶尖开源真实代码，已做）、7（6 角色，架构定稿前过）、8（用户可见 UI 先样张）、9（模块化/单一真相源）。

---

## 0. 核心洞察（决定整体顺序）

**P2 与 P3 通过"合成几何"强耦合，必须一起定，否则返工：**
- 现状有**两套渲染、两个真相源**：预览 = DOM `<video>/<img>` + `object-contain`（黑边）；导出 = canvas `drawTimelineFrame` + **cover（裁切）** → 录 WebM → ffmpeg 转码（写死 `-an`）。
- 代码里还躺着**生产级导出主路径** `ffmpegFiltergraph.ts`（未接线）：它用 `scale=…:force_original_aspect_ratio=decrease, pad=…color=black`（= **letterbox / contain，黑边**）。
- 三者几何各不相同（预览 contain、webm 导出 cover、filtergraph 导出 letterbox）。**WYSIWYG 的前提是三者统一到同一套几何 + 同一个合成描述（CTO 红线：单一合成 IR）。**

**结论顺序**：先定"导出主后端 = ffmpegFiltergraph（生产路径，与 2026-05-24 架构文档一致）" → 预览按 filtergraph 的几何渲染 → P3 音频/字幕/转场都在这同一条 filtergraph 上扩展。WebM/MediaRecorder 降级为 fallback（架构文档本就如此定调）。

---

## 1. 需用户拍板的决策（规则 3）

### 决策 A：画面适配几何（clip 宽高比 ≠ 画布时）
| 方案 | 用户看到什么 | 代价 |
|---|---|---|
| **A1 Letterbox/contain（黑边，推荐）** | 整帧不裁，留黑边；与现有 filtergraph 一致 | 有黑边；竖图放横屏黑边大 |
| A2 Cover/裁切 | 撑满画布、无黑边 | 裁掉边缘内容；与 filtergraph 现状不符，要改 |
| A3 每 clip 可选 fit | 最灵活 | 要 transform UI（属更后期） |
> 推荐 **A1**：与生产 filtergraph 现状一致、不丢画面、改动最小。预览与导出都用 A1 → 真 WYSIWYG。

### 决策 B：P3 范围与顺序
| 子能力 | 是否需新 UI | 规则 8 闸口 |
|---|---|---|
| **音频导出**（video clip 自带音轨随片导出，多 clip amix） | 否（仅导出设置可选静音/含声） | 无 → 可直接实现 |
| **字幕/文字**（clip.text 烧进画面 drawtext） | **是**（文字编辑/样式 UI） | **必须先出样张+评审+确认** |
| **转场**（相邻 clip xfade） | **是**（转场选择/时长 UI） | **必须先出样张+评审+确认** |
> 建议顺序：**P2(WYSIWYG) → P3-音频 → 出字幕/转场样张拍板 → 实现字幕/转场**。

---

## 2. 架构（规则 9）：单一合成真相源 = 导出 manifest

```
时间轴 EDL (timelineTypes)
   │  buildRenderManifestRequest（+ 资产本地路径解析 + ffprobe 元数据）
   ▼
NomiRenderManifestV1（唯一合成描述：tracks/clips/transform/audio/text/profile/几何）
   ├─▶ 预览渲染器：按 manifest 几何在 <canvas> 合成（A1 letterbox）→ WYSIWYG
   └─▶ ffmpegFiltergraph 编译器：同一 manifest → filter_complex（视频 overlay + 音频 amix + drawtext + xfade）
```
- 预览与导出**都从 manifest 的几何派生**，禁止两套 contain/cover 逻辑（消灭现状病根）。
- 预览仍可用 DOM video 播放（性能），但**画幅/裁切/背景几何**必须由 manifest 几何决定，与导出一致；或预览改 canvas 合成（更彻底，P2 内部实现细节，可迭代）。

---

## 3. P3-音频导出落地步骤（无新 UI，可直接实现；来自深读报告）

按依赖排序，每步独立可验证：

1. **资产路径反查**：runtime 暴露 `resolveAssetAbsolutePathBySourceNodeId(projectId, sourceNodeId)` + IPC（基于已有 `listProjectAssets` / `uniqueAssetPath` 的磁盘资产）。
2. **ffprobe 落元数据**：资产导入（`importLocalFile`/`importRemoteAsset`）后调 `probeMediaMetadata`（已实现，0 调用），写 `hasAudio/audioCodec/durationSeconds/sampleRate/channels`。
3. **manifest 补字段**（`renderManifest.ts`）：填 `asset.absolutePath` + 透传 `hasAudio`；profile 按"是否有音轨/用户选择"切 `audioCodec:'aac', audioMode:'mixdown'`。
4. **拆 manifest 双闸**（`runtime.ts:673-687`）：要求 `absolutePath` 必填、剔除/可选 `url`，不再无条件 throw。
5. ✅ **filtergraph 扩展源音轨**（`ffmpegFiltergraph.ts`，已实现+验证）：video clip `asset.hasAudio` → `[N:a]atrim=start:end,asetpts=PTS-STARTPTS,adelay=ms|ms[a_X]`，多源 `amix=inputs=K:duration=longest:dropout_transition=0:normalize=0[aout]`（normalize=0 防 1/N 衰减），单源直命名 `[aout]`。10 单测全过、electron tsc 零错误。注：同一 asset 被多 clip 复用时 `[N:a]/[N:v]` 重复引用是**既有限制**（视觉侧亦然），后续用 split/asplit 解决。
6. **runtime 分支到 filtergraph**：`plan.backend==='ffmpeg-filtergraph'` → 新 `runFiltergraphExportJob`（compile → `buildWebmToMp4Args({filtergraph,profile})` → 复用 `defaultRunProcess` + 进度解析），跳过 WebM 录制链路。
7. **去掉硬编码 `-an`**：新增 `transcodeManifestToMp4`（无 webm 输入、由 profile.audioMode 决定音频），保留 `transcodeWebmFileToMp4` 作 fallback。
8. **进度**：`durationMs = durationFrames/fps*1000`，复用 `consumeProgressStreamChunk`。

ffmpeg 语法（Context7 已确认）：`amix=inputs=N:duration=longest:dropout_transition=0`、`atrim=start:end`+`asetpts`、`adelay=ms|ms`、`xfade=transition=fade:duration:offset`、`drawtext=fontfile=…:text=…:enable='between(t,a,b)'`。

---

## 4. P2-WYSIWYG 落地（无新 UI）
- 选定几何 A1（letterbox）为 manifest/预览/导出统一口径。
- 预览：按 manifest 几何渲染（最小改动＝把预览的 contain 几何换成"按导出分辨率比例 + letterbox"，背景统一 `DEFAULT_EXPORT_BACKGROUND`）；彻底版＝预览走 canvas 合成共用 `drawTimelineFrame`（迭代）。
- 删除"预览 contain / 导出 cover"的双真相源（规则 1）。

---

## 5. 不动什么
- 不动 P1 已交付的交互层（吸附/playhead/多选）。
- 字幕/转场实现**在用户确认样张前不写**（规则 8）。
- 不引入新第三方库（沿用内置 ffmpeg）。
- 不改 timeline 的两轨结构（音频走 video 轨源音轨，多轨属后续）。

## 6. 回滚策略
- WebM→MP4 旧路径（`transcodeWebmFileToMp4`）**保留为 fallback**，filtergraph 路径失败可回退。
- 每步独立 commit；filtergraph 接线在独立分支验证后再合。
- ffprobe/资产路径解析为**新增**，不改现有导出行为，可单独回滚。

## 7. 验收门（P3-音频）
| 类别 | 必须通过 |
|---|---|
| 音频 | 含音轨的 video clip 导出后 MP4 **有声**；多 clip 自动 amix 不串扰；纯图项目仍静音正常 |
| 画幅 | 16:9/9:16/1:1 导出尺寸正确，letterbox 几何与预览一致（WYSIWYG） |
| 兼容 | 无音轨/缺资产/取消/失败回退 fallback 正常 |
| 回归 | `pnpm build` 绿、`vitest` 不回归；filtergraph 新增单测 |

## 8. 下一步
1. 用户拍决策 A（几何）+ B（顺序）。
2. 实现 P2-WYSIWYG（统一几何）。
3. 实现 P3-音频（步骤 1–8，验证）。
4. 出字幕/转场样张 → 6 角色评审（规则7）→ 用户确认 → 实现。
