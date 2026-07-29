# 音频模型接入 + 声音节点升级 + 「声音分类是图」根治

> 日期：2026-06-15 ｜ 状态：**待用户拍板**（mockup 已出，未动代码）
> 来源：apimart TTS（`/v1/audio/speech`）+ Whisper-1（`/v1/audio/transcriptions`）
> 官方文档（R5 已抓，`.md` 原文）：
> - TTS: https://docs.apimart.ai/en/api-reference/audios/tts.md
> - Whisper: https://docs.apimart.ai/en/api-reference/audios/whisper-1.md

## 1. 用户拍板（已收集）

| 问题 | 选择 |
|---|---|
| Whisper（音频转文字）定位 | **两者都要** — 节点出文本 + 一键生成字幕（SRT/VTT） |
| TTS（文字转语音） | **升级声音节点为可生成** — 填台词 + 选音色 → 出音频；保留上传 |
| 接时间轴 | **先只做节点生成** — 时间轴（旁白/配音轨）留下一轮 |

## 2. 两个 vendor API（事实，非记忆）

二者都是 **OpenAI 兼容、同步** 端点 —— 与现有图像/视频模型（submit→轮询 task_id）**形状不同**，是接入的核心难点。

### TTS — `POST /v1/audio/speech`
- body(JSON): `model`(gpt-4o-mini-tts) · `input`(≤4096 字符) · `voice`(alloy/echo/fable/onyx/nova/shimmer) · `response_format`(wav默认/opus/aac/flac/pcm) · `speed`(0.25–4.0)
- **响应 = 二进制音频字节**（非 JSON、非 URL）→ 需新的「二进制响应 → 存盘 → nomi-local URL」路径

### Whisper-1 — `POST /v1/audio/transcriptions`
- **multipart/form-data**: `file`(mp3/mp4/m4a/wav/webm…≤25MB) · `model`(whisper-1) · `language`(ISO-639-1,选填) · `prompt`(选填,≤224token) · `response_format`(json默认/text/srt/verbose_json/vtt) · `temperature`(0–1)
- 响应 = **同步 JSON** `{ text, ... }`（verbose_json 带 segments/timestamps；srt/vtt 直接给字幕串）

## 3. 「声音分类现在是图」根因（三层，全是真 bug）

| 层 | 位置 | 现状 | 根因 |
|---|---|---|---|
| 结果 DTO | `src/workbench/api/taskApi.ts:16` | `TaskAssetDto.type: 'image' \| 'video'` | 无 `'audio'` |
| 计费/任务分类 | `electron/runtime.ts:368` `billingKindForTaskKind` | audio 类落到 `return "image"` 兜底 | 没有 audio 分支 |
| 结果落地 | `electron/runtime.ts:531` `buildProfileTaskResult` | `type = wantedKind==='video'?'video':'image'` | 硬编码二选一 |
| 落地搬运 | `electron/runtime.ts:393` `localizeTaskAsset` | 签名 `type: 'image' \| 'video'` | 同上 |
| 档案 kind | `src/config/modelArchetypes/types.ts:88` | `kind: 'video' \| 'image'` | 无 audio |
| 节点上传占位 | `AudioStripNode.tsx:65-78` | 上传音频存 `result.type='image'` 占位 | 注释自陈「schema 未扩 audio」 |

✅ 已就绪（无需动）：`AssetKind`/`TimelineClipType`/`BillingModelKind` 已含 `'audio'`；`ProfileKind` 已有 `text_to_audio`/`image_to_audio`（但语义是「视频带音频」，不复用）；声音分类 `audio` 已存在（`projectCategories.ts:93`）。

## 4. 架构设计

### 4.1 新增 taskKind（renderer DTO + electron ProfileKind 双侧）
- `text_to_speech`（TTS） · `transcribe`（Whisper）
- `taskApi.ts:TaskKind` + `electron/catalog/types.ts:ProfileKind` + `src/api/desktopClient.ts` 三处同步（单一真相分两侧，本就成对）

### 4.2 同步执行路径（关键 —— 不混进异步轮询）
现有 `runTask` 分三路：① 有 mapping 的异步 profile（submit→admit→poll）② text（AI SDK 流式）③ image/video fallback。
音频两个都是**同步出结果**，新增**第四路 audio**：
- **TTS**：JSON body → `requestBinary`（新，拿 `arrayBuffer`）→ 写盘（`electron/files` / importLocalFile）→ `{ type:'audio', url: nomi-local }`，status 直接 `succeeded`，**不进 admit/poll**
- **Whisper**：multipart body（新 `requestMultipart`，复用 `postMultipartForAssetUpload` 的 form 组装）→ JSON `{text}` → 结果是**文本**（`raw.text`），不产 asset。节点把 text 写进 `result`/`meta`，并暴露「生成字幕」动作把 srt/vtt 落字幕。
- 二者都是同步：HttpOperation 仍可声明（method/path/headers/body）但 runtime 识别 audio kind → 走同步收口，不调度轮询。

### 4.3 catalog mapping（新 `electron/catalog/apimartAudios.ts`，单源，仿 apimartVideos.ts）
- TTS mapping：`create` = POST `/v1/audio/speech`，body 模板引用档案参数（voice/speed/response_format）
- Whisper mapping：`create` = POST `/v1/audio/transcriptions`，multipart（file 来自参考音频槽）
- 在 `seedBuiltins.ts` 登记；模型 kind=`'audio'`

### 4.4 模型档案（新 `kind:'audio'`）
- `types.ts` ModelArchetype.kind 扩 `'audio'`
- 新档案 `gptTts.ts`（TTS：模式=配音生成，参数 voice/speed；intent 复用或加 `'speech'`）+ `whisper.ts`（转写：参考音频槽 audio_ref + language；intent `'transcribe'`）
- 注册进 `modelArchetypes/index.ts`

### 4.5 模型清单（renderer）
- `src/config/models.ts`：加 `AUDIO_MODELS`（gpt-4o-mini-tts / whisper-1），`getAllowedModelsByKind` 加 `case 'audio'`

### 4.6 声音节点升级（UI，R8 mockup 已出）
当前 `AudioStripNode` = 420×80 上传条，**无 composer**。升级为「生成型节点」：
- **选中态挂 composer**（仿 `NodeGenerationComposer`）：顶部模式切换 `[配音生成 | 转写音频]`
  - 配音生成：台词 textarea + 音色 select(6) + 语速 + model → 生成钮 → 音频
  - 转写音频：参考音频槽（拖入/连上游）+ language select + model → 生成钮 → 文本
- **预览态**：
  - 有音频 → 现有音频条（play+波形+时长），`result.type='audio'`
  - 有转写文本 → 文本卡 + 「复制」「生成字幕」
- 让声音 kind 进 `isImageLikeGenerationNodeKind` 之外的新判定 `isAudioLikeGenerationNodeKind`，composer references 区按 audio_ref 槽渲染（仅转写模式有槽）

### 4.7 字幕落地（Whisper「生成字幕」）
- 转写用 `response_format=srt`/`vtt` 再要一次（或 verbose_json 的 segments 本地转 srt）→ 写进现有字幕系统（`NodeKind 'subtitle'` / 预览字幕，见 memory「预览区字幕/标题卡」）。**本轮范围：出 srt 文本 + 落字幕节点/预览**；时间轴排片下一轮。

### 4.8 左侧画布工具栏（CanvasToolbar）—— 2026-06-15 追加需求
现状 [CanvasToolbar.tsx](../../src/workbench/generationCanvas/components/CanvasToolbar.tsx)（左侧竖条）= 创建节点钮（text/image/video/panorama/scene3d）+ 下半部：复制 / 剪切 / 批量生成 / 发送到时间轴。
用户要求：**① 加「声音」创建钮 ② 删掉下半部，只留创建节点钮 ③ 设计一致。**

- **加声音创建钮**：需先在 [registry.ts](../../src/workbench/generationCanvas/nodes/registry.ts) 新增 `audio` 节点 kind（`icon:'audio'`、`executionKind:'audio'`(新)、`catalogKind:'audio'`、`quickAdd:true`、component=升级后的声音节点）；`GenerationNodeExecutionKind` 扩 `'audio'`、`GenerationNodeIconKey` 扩 `'audio'`、`categoryIcons` 加 audio 图标、`isAudioLikeGenerationNodeKind` 新增。`PRIMARY_NODE_KINDS` 加 `'audio'` → 左侧栏与右键菜单（同一真相源 `PRIMARY_ADD_ITEMS`）同时多一个声音钮。
- **删下半部（复制/剪切/批量生成/发送到时间轴）的归宿**（R1：把价值合并进新代码再删，不许静默丢能力）—— **2026-06-15 用户已拍板**：
  - 复制/剪切：已有键盘快捷键（[useCanvasShortcuts.ts](../../src/workbench/generationCanvas/components/useCanvasShortcuts.ts)）→ 删钮零损失。
  - **发送到时间轴：直接删** —— 节点本就能拖入时间轴（[useNodeDragResize.ts:349](../../src/workbench/generationCanvas/nodes/useNodeDragResize.ts:349)），按钮冗余。
  - **批量生成：搬到「选中浮条」** —— 见 §4.11（不进左侧栏；左侧栏纯创建）。

### 4.10 修：框选多个节点弹出一大堆 composer 面板（用户反馈 bug）
**症状**：左键框选/多选 N 个节点 → N 个大 composer（生成方式·文生图/参数）同时浮出，层叠糊成一片。
**根因（单一）**：[BaseGenerationNode.tsx:875](../../src/workbench/generationCanvas/nodes/BaseGenerationNode.tsx) `{selected && … <NodeGenerationComposer/>}` —— 多选时每个节点 `selected` 都为真 → 每个都挂 composer。
**修在根因层**：composer 只在**单选**（sole selection）时挂。节点已订阅 `isMultiSelectActive`（[第92行](../../src/workbench/generationCanvas/nodes/BaseGenerationNode.tsx) `selectedNodeIds.length > 1`）→ 条件改 `selected && !isMultiSelectActive && …`。
**这类不再复发**：composer 挂载唯一入口收口到「单选」，多选态永远不挂；补 e2e 断言「选中 ≥2 节点 → 画布上 composer 数 = 0」。resize handle 同理可考虑（多选时逐节点 resize 无意义）——本轮先只动 composer，避免扩面。

### 4.11 选中浮条优化（加批量生成 + 删冗余 + 放大）
现状 [GenerationCanvas.tsx:654](../../src/workbench/generationCanvas/components/GenerationCanvas.tsx)（`selectedCount>1` 浮现）：`[N 个节点][编组⌘G][复制][剪切][×]`，图标 14px 偏小，复制/剪切与键盘 ⌘C/⌘X 重复。
- **加批量生成（主操作）**：深色 pill「生成 N 个」（图标+文字，非小图标），点击复用 CanvasToolbar 现有逻辑（`buildDependencyWaves` → 单节点无依赖直跑、多节点弹依赖波次确认条，确认前零调用零扣费）。
- **删冗余**：复制/剪切从浮条移除（键盘 ⌘C/⌘X 覆盖，R2「没行动价值就删」）。保留 编组（⌘G，组织价值）+ × 清除（显式）。
- **放大**：图标 14→16px、按钮命中区 ≥28px，主操作带文字；token-only。
- **批量生成单一真相源**：逻辑从 CanvasToolbar 抽出，浮条与（若保留的）任何入口共用，不复制粘贴（R1）。

### 4.9 声音播放条（播放可用 + 播放条 UI）
现状 [AudioStripNode.tsx](../../src/workbench/generationCanvas/nodes/render/AudioStripNode.tsx) 已有隐藏 `<audio>` + 播放/暂停切换，但波形是**静态占位**、无进度/拖拽 seek。
- 真实播放：复用现有 `<audio ref>`；`onTimeUpdate` 驱动进度，`onLoadedMetadata` 取真实时长（已有）。
- **播放条**：波形即进度条 —— 已播部分 accent 实色、未播部分淡色（`opacity`）；点击/拖拽波形 = seek（换算 `clientX→currentTime`）；右侧显示 `当前 / 总时长`（`00:05 / 00:12`，`tabular-nums font-mono`）。token-only，与音频条同卡内。

## 5. 分阶段实施（每阶段独立可验证）

| 阶段 | 内容 | 验收 |
|---|---|---|
| **S0 地基** | 全链路打通 `'audio'`：TaskAssetDto.type / billingKindForTaskKind / buildProfileTaskResult / localizeTaskAsset / archetype.kind / AudioStripNode 上传不再伪装 image | 上传音频 result.type==='audio'，单测 + 五门绿 |
| **S1 同步执行路径** | runtime 第四路 audio：requestBinary（TTS）+ requestMultipart（Whisper）+ 同步收口 | 单测：mock vendor 返回二进制/JSON → 正确落 asset/文本 |
| **S2 catalog + 档案 + 模型清单** | apimartAudios.ts / gptTts.ts / whisper.ts / AUDIO_MODELS / seedBuiltins | resolveArchetypeForModel 命中；selectTaskMapping 命中 |
| **S3 声音节点升级 UI** | composer 模式切换 + 配音生成 + 转写 + 预览态 | 与本 mockup 逐项对账 + design-fidelity 断言 |
| **S4 字幕落地** | 转写 srt → 字幕节点/预览 | 真机：转写 → 生成字幕可见 |
| **S5 真实 E2E** | 用真实 key 跑一次 TTS + 一次 Whisper（接入即验证铁律） | 主进程埋点抓到 vendor HTTP；音频可播、文本正确 |
| **S6 工具栏 + 浮条 + 播放条** | 注册 audio 节点 kind → 左侧栏加声音钮 + 删下半部；删发送到时间轴钮；批量生成搬选中浮条 + 浮条优化（§4.11）；修多选弹一堆 composer（§4.10）；AudioStripNode 真实播放 + 播放条 seek | 与工具栏/浮条/播放条 mockup 对账；e2e：多选 composer 数=0；真机点声音钮建节点、拖播放条 seek、框选→生成 N 个 |

## 9. 决策（R3）：删掉的「批量生成 / 发送到时间轴」去哪 —— 已拍板（2026-06-15）

- **发送到时间轴**：直接删（节点可拖入时间轴，按钮冗余）。
- **批量生成**：搬到「选中浮条」（§4.11），作为主操作「生成 N 个」。
- **复制/剪切**：靠键盘 ⌘C/⌘X 保留，浮条也移除（去冗余）。

## 6. 不动什么
- 时间轴排片（旁白/配音轨）—— 下一轮（用户拍板）
- 现有图像/视频异步轮询路径 —— 不碰，audio 是新增第四路
- 上传音频能力 —— 保留，只是不再伪装 image type
- `text_to_audio`/`image_to_audio` ProfileKind —— 不复用（语义是「视频带音频」）

## 7. 回滚
- 每阶段独立 commit；S0 地基若引发图像/视频回归 → revert 单 commit（type union 扩展是加法，风险低）
- 新档案/mapping 是新增条目，删条目即回滚，不影响既有模型

## 8. 验收门（P3：全绿≠完成）
1. 五门：check:filesize / check:tokens / lint:ci / typecheck / test / build
2. S3 与本 mockup 逐项对账（截图并排）
3. R13 真机走查：J 新增「为镜头配旁白」旅程 —— 填台词→生成→听到音频；上传访谈→转写→出字幕
4. S5 真实 vendor E2E 跑通（用户提供 apimart key + 额度）
