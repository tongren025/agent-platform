# Nomi Production Video Export Architecture

日期：2026-05-24
状态：执行版技术方案

## 1. CTO 结论

Nomi 不能把当前 `Canvas → MediaRecorder WebM → FFmpeg MP4` 当成长期导出架构。它只适合作为 fallback / 调试路径。

生产级导出必须改成：

```text
React / Timeline UI
  → immutable render manifest
  → export job queue
  → render planner
  → native FFmpeg / headless frame renderer / WebCodecs backend
  → atomic MP4 output
```

核心原则：

1. **UI 不直接承担最终导出引擎。** Renderer 只负责用户操作、manifest snapshot 和进度展示。
2. **每次导出都基于不可变快照。** 用户继续编辑不能影响已经开始的导出。
3. **导出是 job，不是一个 button promise。** 必须有 job id、状态机、日志、取消、清理、错误分类。
4. **FFmpeg 是桌面 MP4 主后端。** WebCodecs / Mediabunny 只做浏览器轻量路径或实验路径。
5. **简单剪辑尽量走 FFmpeg 图/concat；复杂视觉再走帧渲染。** 不要所有东西都 PNG 序列化，避免浪费。
6. **音频从第一天预留模型。** 即使 v1 静音，也不能设计成以后难以混音的死路。

## 2. 开源架构参考

| 项目 | 可复用架构 | 对 Nomi 的含义 |
|---|---|---|
| Kdenlive + MLT | UI timeline 与 MLT render graph 分离；通过 producers / playlists / tractors / consumers 表达剪辑 | Nomi 要建立自己的 `NomiRenderManifest`，不要让 React state 直接等于导出协议 |
| Shotcut + MLT | 导出写临时 `.mlt`，启动独立 render job，解析进度，支持 job queue / cancel / logs | Electron main process 需要 `ExportJobManager`，而不是同步 IPC promise |
| OpenShot + libopenshot | 导出前 copy project/timeline，writer 负责编码参数、faststart、frame progress、cache 管理 | Nomi 必须 snapshot 项目；输出使用 temp file + rename；导出 cache 与 preview cache 分离 |
| Olive | render graph、frame cache、后台渲染概念 | 后续做 effects/keyframes 时不要把效果写死在 canvas 函数里 |
| Remotion | deterministic frame rendering、headless Chromium workers、FFmpeg stitch、progress/cancel | 复杂 React/canvas overlay 可用 headless/offscreen frame renderer，但不应替代所有 FFmpeg 原生路径 |
| Mediabunny / WebCodecs | Browser MP4 muxing、CanvasSource、WebCodecs capability/progress/cancel | 适合作为浏览器/轻量后端；不作为桌面主导出后端 |
| ffmpeg.wasm | 浏览器 FFmpeg fallback | 不适合作为桌面长视频主后端，性能和内存风险太高 |

## 3. 目标架构

```text
src/workbench
  export UI / settings / progress
  timeline edit model
        │
        ▼
NomiRenderManifest v1
  tracks, clips, assets, transforms, effects, audio, profile
        │ IPC: nomi:exports:start(manifest)
        ▼
electron/export
  exportJobManager.ts       job 状态、队列、取消、日志、清理
  exportManifest.ts         manifest schema / validation / snapshot io
  exportPlanner.ts          选择 direct-ffmpeg / frame-render / hybrid
  ffmpegCommandBuilder.ts   FFmpeg concat/filtergraph/encode args
  ffmpegRunner.ts           spawn、progress、kill、atomic output
  frameRenderer.ts          headless/offscreen canvas frame production
  exportPaths.ts            project exports/cache/temp 安全路径
        │
        ▼
Native FFmpeg
  MP4/H.264/AAC/yuv420p/+faststart
```

## 4. Render manifest v1

```ts
export type NomiRenderManifestV1 = {
  version: 1
  projectId: string
  createdAt: string
  timeline: {
    fps: number
    durationFrames: number
    range: { startFrame: number; endFrame: number }
    tracks: NomiRenderTrack[]
  }
  profile: {
    container: 'mp4'
    videoCodec: 'h264'
    audioCodec: 'aac' | 'none'
    width: number
    height: number
    fps: number
    pixelFormat: 'yuv420p'
    quality: 'small' | 'standard' | 'high'
    preset: 'publish' | 'edit' | 'share'
  }
  assets: Record<string, {
    id: string
    kind: 'image' | 'video' | 'audio'
    absolutePath: string
    durationSeconds?: number
    width?: number
    height?: number
    hasAudio?: boolean
  }>
}

export type NomiRenderTrack = {
  id: string
  type: 'video' | 'image' | 'audio' | 'text' | 'overlay'
  zIndex: number
  muted?: boolean
  clips: NomiRenderClip[]
}

export type NomiRenderClip = {
  id: string
  assetId?: string
  type: 'video' | 'image' | 'audio' | 'text'
  startFrame: number
  endFrame: number
  sourceInFrame?: number
  sourceOutFrame?: number
  transform?: {
    fit: 'contain' | 'cover' | 'fill'
    scale: number
    x: number
    y: number
    rotation: number
    opacity: number
  }
  audio?: {
    volume: number
    fadeInFrames?: number
    fadeOutFrames?: number
  }
  text?: {
    content: string
    fontFamily: string
    fontSize: number
    color: string
  }
}
```

设计要求：

- manifest 中只能保存 resolved asset path，不保存远程 URL 作为最终导出依赖。
- 所有尺寸必须为偶数，满足 H.264 `yuv420p`。
- `profile.width/height` 必须跟用户画幅一致：9:16 是 `1080x1920`，不是 `1920x1080` 里加黑边。
- manifest 写入 `project/cache/export-<jobId>/manifest.json`，用于复现和 debug。

## 5. Export job 状态机

```ts
type ExportJobStatus =
  | 'queued'
  | 'preparing'
  | 'planning'
  | 'rendering'
  | 'encoding'
  | 'muxing'
  | 'finalizing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
```

IPC：

```text
nomi:exports:start(payload)      -> { jobId }
nomi:exports:event               -> progress / log / result / error
nomi:exports:cancel({ jobId })   -> { ok }
nomi:exports:status({ jobId })   -> snapshot
nomi:exports:show-in-folder({ projectId, relativePath }) -> { ok }
```

每个 job 必须有：

- `jobId`
- `projectId`
- `manifestPath`
- `tempDir`
- `outputTempPath`
- `outputFinalPath`
- `ffmpegPid?`
- `progress.percent`
- `progress.stage`
- `stderrLogPath`
- `createdAt / updatedAt / completedAt`

## 6. Planner 策略

| 场景 | 后端 | 原因 |
|---|---|---|
| 单轨视频剪切、无效果、同编码 | FFmpeg concat / stream copy | 最快，最低损耗 |
| 多轨基础合成、裁剪、缩放、静态图、音频混合 | FFmpeg filter_complex | 稳定、可进度、质量可控 |
| Canvas/React 动画、复杂文字、AI overlay、非 FFmpeg 易表达效果 | headless/offscreen frame renderer + FFmpeg encode | 确定性逐帧渲染 |
| 浏览器-only / 轻量分享 | Mediabunny + WebCodecs | 降低本地二进制依赖，但仅作可选后端 |
| FFmpeg 不可用 | 当前 WebM fallback | 保底，不承诺长视频质量 |

不要默认走 `MediaRecorder`。它是 fallback，不是主干。

## 7. 近期落地顺序

### Milestone A：把现有 MVP 拉出死路

- [x] MP4 输出按真实画幅写入：9:16 输出 `1080x1920`，1:1 输出 `1080x1080`。
- [x] `show-in-folder` IPC 收紧为 `{ projectId, relativePath }`，只能打开项目 `exports/` 下的导出结果。
- [ ] `ExportJobManager` 基础：job id、status、event、cancel。
- [ ] `ffmpegRunner` 支持 progress callback、cancel signal、stderr log file、temp output + atomic rename。
- [ ] `exportManifest.ts` 定义 v1 schema，并从现有 timeline snapshot 生成 manifest。

### Milestone B：替换 WebM 大对象 IPC

- [ ] renderer 不再 `arrayBuffer()` 传大 WebM。
- [ ] 过渡方案：renderer 将 WebM 写入 job temp path，IPC 只传相对路径。
- [ ] 目标方案：直接由 export worker/headless renderer 产帧或由 FFmpeg 读源文件。

### Milestone C：生产级 MP4

- [ ] FFmpeg command builder 支持 true aspect ratio、CRF/preset、faststart、AAC 音频预留。
- [ ] progress 使用 `-progress pipe:2` 或 stderr time/frame 解析。
- [ ] 输出先写 `.partial.mp4`，成功后 rename 到 `exports/*.mp4`。
- [ ] 错误分类：缺编码器、素材丢失、磁盘不足、权限失败、取消、FFmpeg crash。

### Milestone D：音频与多轨

- [ ] timeline 引入 audio track / clip audio metadata。
- [ ] FFmpeg `filter_complex` 做音频 trim、delay、volume、fade、amix。
- [ ] 输出 AAC 192k，音频轨接入后 PRD 从 `MP4/H.264` 升级为 `MP4/H.264/AAC`。

## 8. 验收矩阵

| 类别 | 必须覆盖 |
|---|---|
| 画幅 | 16:9、9:16、1:1、4:5 |
| 时长 | 5s、60s、3min、10min smoke |
| 素材 | image-only、video-only、image+video、missing asset、bad codec |
| 操作 | start、progress、cancel、failure、retry、show in folder |
| 输出 | playable MP4、H.264/yuv420p、faststart、尺寸正确、非空文件 |
| 安全 | path traversal 被拒绝、非 exports 路径被拒绝 |
| 包装 | dev、packaged mac arm64、packaged mac x64、Windows smoke |

## 9. 当前代码已落地的第一步

本方案落地的第一步已经进入代码：

1. `electron/export/ffmpegRunner.ts`
   - 新增 `exportDimensionsForPreset()`。
   - FFmpeg 输出尺寸从固定 landscape 改为按 `aspectRatio` 计算真实画幅。
2. `src/workbench/export/exportApi.ts`
   - 导出时把当前预览画幅传给 Electron。
3. `electron/runtime.ts`
   - MP4 导出请求接收 `aspectRatio`。
   - 新增受限 `showExportInFolder()`。
4. `electron/main.ts` / `electron/preload.ts` / `src/desktop/bridge.ts`
   - `show-in-folder` 改为 project-relative payload，不再接受 renderer 任意绝对路径。
5. `electron/export/ffmpegRunner.test.ts`
   - 覆盖 16:9、9:16、1:1、4:5 输出尺寸。

验证命令：

```bash
npm test -- --run electron/export/ffmpegRunner.test.ts
npm run build:electron
npm run build:renderer
```
