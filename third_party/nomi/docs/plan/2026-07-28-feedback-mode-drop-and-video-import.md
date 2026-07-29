# 2026-07-28 群反馈根治：参考图静默丢弃 + 参考视频不可播

来源：用户群 2026-07-28 批量反馈（Nomi画布群）。两条都是「静默失败」家族。

## A. 挂了参考图却停在「文生图」→ 参考被静默丢弃（付费后才发现）

**用户遭遇**：连了角色三视图/传了参考图，生成方式还停在「文生图」，模型收不到图 →「男的角色图生成出女的」。群里自己定位到「没有自动切换」。

**根因**（读码实证）：
- `meta.archetype.modeId` 是持久手动状态；`buildArchetypeInputParams` / `catalogTaskActions` 按当前模式槽做 M2 互斥投影，t2i 模式 `slots:[]` → 参考图整个不进 body（`archetypeMeta.ts:528`、`catalogTaskActions.ts:89-105`）。
- 建边时已有 auto-promote（`autoPromoteTargetModeForEdge`），但只覆盖「建边那一刻」。三条复发路：
  1. **换模型**：`handleModelChange` 写新 `modelKey` 后旧 `meta.archetype` 失配 → `currentArchetypeMode` 落回新档案默认（GPT Image 2 默认 t2i），边还挂着；
  2. **提示词库带参考图**：`applyPromptPickerItem` 只写 prompt，`item.referenceImages` 整个丢弃（NodeGenerationComposer.tsx:386）；
  3. **存量数据**（auto-promote 上线前建的边）。
- 付费闸 `canRunGenerationNode` 只防「图生图缺参考」，t2i 提前 `return true`（generationRunController.ts:421）→「t2i 挂参考」直接付费发出纯文生。

**修法（derive，不加并行状态）**：
1. `referenceEdgeCapability.ts`：把 `resolveTargetModeForEdge` 的核心抽成 `resolveModeForReferenceDemand`（P1 重构非新增），新增 `resolveModeForConnectedReferences(target, nodes, edges)`——按**活边**收集参考需求，当前模式一条都收不下且档案有能收的模式 → 返回该模式 id（幂等：能收任一条 → null）。**只看活边不看 meta 残值**：meta 参考值跨模式持久是拍板过的设计（怕丢上传），不能反过来当切换依据。
2. `runGenerationNode` 入口（唯一提交咽喉，composer/agent/批量/MCP 全经此）：canRun 之前先 reconcile——模式收不下活边参考就切过去（与建边 auto-promote 同一套语义，UI ModeBar 同步翻转）。换模型/存量/一切残留在此兜底。
3. `handleModelChange`：换模型构造 nextMeta 时就地 reconcile（单次写入，UI 立即正确，不等到提交）。
4. `applyPromptPickerItem`：带参考图的库 prompt → 先促模式（当前模式收不下 image_ref 时），再走 `addAssetUrlToNode` 单源写入；模型任何模式都不吃图 → toast 诚实告知只应用了文本。

**用户看到的变化**：连图/换模型/用库提示词后，生成方式自动跳到「图生图」（ModeBar 可见）；参考图不再有任何路径被静默吞掉。

**不动项**：不删手动 ModeBar（用户仍可手切，切了但挂着活边、提交时会被 reconcile 回来——「挂着参考=要用参考」，不想用就断边）；不动「图生图缺参考拒发」既有闸；audio 配音/转写模式语义不参与自动切换。

## B. 导入参考视频灰色、0:00、点不了播放

**用户遭遇**：上传参考视频后节点是视频样式但灰色不可播、时长 00:00，反复试「还是不行」。

**根因**（读码实证）：导入链路只按 MIME 前缀放行（`nodeAssetDrop.ts:16`），落盘零 codec 探测零转码；播放是原生 `<video>`。手机 HEVC/H.265（Windows Chromium 解不了）、AVI/MPEG 容器等 → `loadedmetadata` 永不触发 → 灰壳+0:00+播放键死。ffprobe/ffmpeg **均已打包**但只服务导出/抽帧。播放失败诊断（`videoPlaybackDiagnostics`）只打 console，UI 无任何提示。

**修法（进口归一化 + 存量/生成产物懒自愈 + 诚实报错）**：
1. 新建 `electron/assets/videoImportNormalize.ts`：纯函数 `videoNeedsPlayabilityTranscode(probe, ext)`（安全集：容器 mp4/m4v/mov/webm/ogg/ogv × 视频 h264/vp8/vp9/av1 × 音频 aac/mp3/opus/vorbis/flac/无音轨）+ `ensurePlayableVideoBytes`（临时落盘 → probeMediaMetadata → 不安全则打包 ffmpeg 转 H.264+AAC MP4 faststart；探测/转码失败回退原字节，绝不挡导入）。
2. `importLocalFile`（所有本地导入的单一咽喉：画布拖入/粘贴/素材库同走 `nomi:assets:import-file`）：video/* 先归一化再 `writeAsset`；转码时资产 meta 记 `playbackNormalizedFrom`。
3. 懒自愈（覆盖存量坏节点 + 供应商回 HEVC 的生成产物）：新 IPC `nomi:assets:ensure-playable`（入参 nomi-local url → 磁盘路径 → probe → 需要则转码 → writeAsset 新 mp4 → 回新 url）。渲染侧新组件 `NodeVideoPlaybackGuard` 包住 `DeferredNodeVideo`：decode 类错误(MediaError 3/4)且 nomi-local → 自动调一次自愈，成功换 `result.url` 重载；失败/不适用 → 视频区显示 `describeVideoPlaybackFailure` 人话（终结纯灰壳）。
4. MIME 为空的兜底：`importKindForFile` 对空 MIME 按扩展名回退（Windows 上 mkv 等常无 MIME → 今天被静默跳过，同族修）。

**用户看到的变化**：手机拍的 HEVC / AVI 等视频拖进来直接能播能拖进度（导入稍慢=在转码）；老的坏节点打开后自动修好；真坏的文件显示原因而不是无声灰块。

**不动项**：生成产物落地（localizedAsset）不做前置转码（懒自愈够用，不为未损坏的 4K 输出白付转码）；crossOrigin/`ACAO:*` 现状不动（生成视频经同协议正常播放，实证无问题）；导出链路不动（ffmpeg 本就解得了 HEVC）。

## 验收门

- 单测：`resolveModeForConnectedReferences`（t2i+图边→edit；当前能收→null；文本边忽略；t2v+首帧边→i2v）、reconcile 集成、`videoNeedsPlayabilityTranscode` 判定表、ffmpeg 参数构造。
- 五门全过（filesize/tokens/i18n/lint/typecheck/test/build）。
- R13 真机走查：① 连参考图→换模型到 GPT Image 2 → ModeBar 自动=图生图（截图）；② 导入 mpeg4/hevc 视频 → 节点能播、时长非 0（截图）。
- 落 main：独立 sibling worktree 钉 origin/main cherry-pick 后 push（并行纪律）。

## 回滚

两块互相独立，各自单 commit；revert 对应 commit 即回退，无迁移无数据变更（转码只新增文件，不改旧资产）。
