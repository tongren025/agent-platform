# 交接：视频抽帧（首/尾帧）+ 重新支持镜头视频接力

> 给接手 AI 的自包含上下文。用户拍板：shot→shot 自动链先删了（B-clean），**改成"从视频抽首/尾帧图"的能力**——这一块同时根治三件事，是核心基建。
> 工作树 `/Users/aoqimin/Desktop/Nomi/` main 分支。先读 CLAUDE.md 纪律 + `docs/workflow/2026-06-06-real-generation-e2e-loop.md`（接入即验证）。

## 0. 这个能力一并解决三件事
1. **批量生成那个潜伏 bug 的根治**：视频→视频 first_frame 边承诺"抽源视频尾帧当本镜首帧"，但抽帧步骤从未实现 → 多镜视频接力裸跑/失败（见 docs/audit/eval 与 bug① 分析）。
2. **重新支持镜头视频接力**：B-clean 为了避开这个坑，去掉了 storyboard 的 shot→shot 链（`storyboardPlan.ts` 转换器）。抽帧做好后可**安全重新接上**（前一镜尾帧→后一镜首帧的连贯）。
3. **Seedance 首尾帧 from 视频** + `return_last_frame` 链：见 `docs/handoff/2026-06-16-seedance-apimart-complete.md`。

## 1. 现状（坏在哪，精确）
- **承诺方已就位**：`src/workbench/generationCanvas/runner/generationReferenceResolver.ts` —— 当 first_frame 边的源是 video 节点，算出 `relayFromVideoUrl=源视频URL`，并**故意把 firstFrameUrl 留 undefined**（注释原话："runController 提交生成前 await 抽帧把它换成真实图片 URL 填进 firstFrameUrl"）。封死了"拿视频/封面冒充首帧"。
- **消费方不存在**：`src/workbench/generationCanvas/runner/generationRunController.ts` 的 `runGenerationNode` **没有**那个 await-抽帧步骤；`generationNodeExecutor.ts` 直接把 resolver 结果交给 generateVideo。`buildArchetypeInputParams`/catalog body 也只读 firstFrameUrl，**完全没消费 relayFromVideoUrl**。
- **输出格式已约定**：抽帧返回 `nomi-local://` URL（`runner/referenceUrl.ts` 的 `asUrl` 注释："nomi-local:// 是抽帧 IPC 的返回值，必须放行"）。已放行，不用改。
- **electron 侧 ffmpeg 现成**：`electron/export/mediaProbe.ts:197 resolveFfmpegPath` 拿 ffmpeg 路径；`electron/export/ensureExecutable.ts` 处理执行位（**ffprobe 执行位陷阱已踩过，必用它 chmod**，见 memory ffprobe-exec-bit-packaging-trap）。

## 2. 要做什么（分层）

### 2A. electron 主进程：抽帧 IPC
新增 IPC `nomi:video:extractFrame`（仿 `electron/main.ts:206 registerIpc` 里 `registerSyncIpc`/`registerIpc` 的注册法，但抽帧是异步用 `ipcMain.handle`）：
- 入参：`{ videoUrl: string（nomi-local:// 或 https 或本地路径）, which: 'first' | 'last' | number(秒), projectId: string }`
- 实现：
  1. `resolveFfmpegPath()`（mediaProbe.ts）拿 ffmpeg；`ensureExecutable()` 保执行位。
  2. videoUrl 若是 nomi-local:// → 解析成本地文件路径（参考 `electron/assets/assetPaths.ts` 的 localAssetUrl 反解 / runtime.ts 里 nomi-local 解析）；https → ffmpeg 可直接读 URL（但慢，建议先下载到 temp）。
  3. ffmpeg 抽帧：
     - 首帧：`ffmpeg -y -ss 0 -i <video> -frames:v 1 -q:v 3 <tmp.png>`
     - 尾帧：先 `mediaProbe` 拿时长 D，再 `ffmpeg -y -ss <D-0.1> -i <video> -frames:v 1 -q:v 3 <tmp.png>`（或 `-sseof -0.1`，二选一实测稳的）
     - 指定秒：`-ss <秒>`
  4. 读 PNG bytes → `writeAsset(projectId, bytes, 'frame-xxx.png', 'image/png', { kind:'generated', ... })`（`electron/runtime.ts:212`）→ 返回 nomi-local:// URL。
- **缓存**：按 `(videoUrl, which)` 缓存抽出的 nomi-local URL，别每次重抽（参考现有 fingerprintCache 思路）。
- **错误**：抽帧失败 → 抛结构化错误，**别让它静默丢/裸跑**（resolver 的设计就是宁可拦下也不冒充）。

### 2B. 渲染层 runner：消费 relayFromVideoUrl
`generationRunController.ts` `runGenerationNode` 提交 executor **之前**：
```
const refs = resolveGenerationReferences(node, ...)
if (refs.relayFromVideoUrl && !refs.firstFrameUrl) {
  refs.firstFrameUrl = await window.nomiDesktop.extractVideoFrame({ videoUrl: refs.relayFromVideoUrl, which: 'last', projectId })
}
```
（which='last' —— 接力语义是"用源视频的**尾帧**当本镜首帧"，见 resolver 注释。）抽帧失败 → 节点标人话错误 + 不裸跑。

### 2C. 重新接上 shot→shot 视频接力（storyboard）
`src/workbench/generationCanvas/agent/storyboardPlan.ts` 转换器（B-clean 删了 shot→shot 'reference' 边）：视频镜头时，把相邻镜头连 **first_frame 边**（前一镜 video → 这一镜 first_frame），靠 2A/2B 抽前一镜尾帧。注意：① 只在视频镜头间连（图片镜头不需要）；② 依赖波次（dependencyWaves）已支持"前镜先生成、后镜后生成"，接力天然按波次跑；③ 更新 storyboardPlan.test.ts 的边断言。
- **替代/补充**：Seedance 的 `return_last_frame:true` 直接返回尾帧 URL → 后镜 first_frame 直接用，省一次抽帧。两条路都做：有 return_last_frame 用它，否则抽帧。

## 3. 验证（接入即验证铁律，必跑真实 E2E）
- 单测：抽帧 IPC（mock ffmpeg）、relay 消费分支（relayFromVideoUrl → firstFrameUrl 被填）、storyboard 视频接力边断言。
- **真实 E2E**：storyboard 拆 2 个视频镜头 → 镜1 生成 → 镜2 接力（抽镜1尾帧当首帧）→ 镜2 生成连贯。隔离 electron 实例 + 主进程埋点抓真实请求体（确认 first_frame 填的是抽出的 nomi-local 帧，不是视频 URL）。烧额度，用户已授权。
- 五门全过。

## 4. 关键文件地图
- 承诺方：`runner/generationReferenceResolver.ts`（relayFromVideoUrl）
- 消费点：`runner/generationRunController.ts`（runGenerationNode）+ `generationNodeExecutor.ts`
- URL 放行：`runner/referenceUrl.ts`（asUrl，已支持 nomi-local）
- ffmpeg：`electron/export/mediaProbe.ts`（resolveFfmpegPath）+ `electron/export/ensureExecutable.ts`
- 存素材：`electron/runtime.ts:212 writeAsset` + `electron/assets/assetPaths.ts`
- IPC 注册：`electron/main.ts:206 registerIpc`（+ preload 暴露 window.nomiDesktop.extractVideoFrame）
- storyboard 接力：`agent/storyboardPlan.ts` 转换器 + `storyboardPlan.test.ts`
- 依赖波次：`runner/dependencyWaves.ts`

## 5. 坑
- **执行位**：随附 ffmpeg/ffprobe 缺执行位会静默失败（已踩，见 memory `ffprobe-exec-bit-packaging-trap`）→ 必过 ensureExecutable。
- **尾帧抽取**：`-sseof` 在某些封装上不稳，备选"先 probe 时长再 -ss D-ε"，实测取稳的。
- **远程视频**：ffmpeg 读 https 慢/可能失败，建议先下载 temp 再抽。
- **别冒充**：resolver 已封死"视频/封面当首帧"，抽帧失败就拦下报错，**绝不 fallback**。
- **nomi-local 反解**：抽帧入参可能是 nomi-local://（源是本地生成的视频），要先反解成磁盘路径喂 ffmpeg。
