# Nomi 视频导出 PRD

日期：2026-05-23
版本：v1

## 1. 结论

Nomi 只需要一个默认标准格式：

**MP4 / H.264 / 30fps**

v1 基础导出暂不包含音频；如果未来接入音频轨，再升级为 **MP4 / H.264 / AAC / 30fps**。

原因：创作者最终要发布到抖音、B 站、YouTube、小红书、微信、剪映、PR。MP4 是最低摩擦格式。

其他格式不要做成一排复杂选项，只做“导出用途预设”。

## 2. 当前导出能力

已有：

- `src/workbench/export/timelineWebmExport.ts`
  - Canvas 逐帧绘制时间轴。
  - `MediaRecorder` 录制 WebM。
  - 默认宽度 1280。
  - 支持当前预览画幅。
  - 支持导出进度。

- `electron/export/ffmpegRunner.ts`
  - Electron 主进程已能把前端导出的 WebM 转码为 MP4。
  - 默认写入项目 `exports/`。
  - 使用 H.264，当前基础导出显式不包含音频。

- `src/workbench/export/exportApi.ts`
  - 前端先复用 Canvas/WebM 渲染链路，再交给桌面导出 IPC 转 MP4。

- `src/workbench/preview/TimelinePreview.tsx`
  - 预览区有导出按钮。
  - 当前按钮文案是“导出 MP4”。
  - 视频素材预览是 muted。

限制：

- MP4 导出第一版不含音频。
- 仍依赖浏览器 `MediaRecorder` 生成中间 WebM。
- 暂不支持码率、平台预设、导出范围。
- 长视频稳定性仍需测试矩阵验证。

## 3. 用户真正需要什么

用户不是想选择格式。

用户想回答三个问题：

1. 发到哪里？
2. 清不清晰？
3. 能不能继续剪？

所以导出设置应该按用途组织，而不是按编码参数组织。

## 4. 导出预设

| 优先级 | 预设 | 格式 | 用途 |
|---|---|---|---|
| P0 | 标准发布 | MP4 / H.264 | 默认选择，适合大多数平台；音频轨接入后升级 AAC |
| P0 | 继续剪辑 | MP4 / H.264 / 高码率 | 给剪映、PR、DaVinci 二次编辑 |
| P1 | 轻量分享 | MP4 / H.264 / 低码率 | 发群、快速预览 |
| P1 | 当前 WebM | WebM | 保留为 fallback / 调试 |
| P2 | GIF | GIF | 表情包、短预览，不做长视频 |
| P2 | 图片序列 | PNG/JPEG 序列 | 高级工作流，后置 |

结论：

**不要让用户选 10 种格式。默认导出 MP4，只暴露 3 个用途预设。**

## 5. 导出设置

P0 必须有：

- 画幅：沿用当前预览画幅。
- 分辨率：720p / 1080p / 原始。
- 质量：标准 / 高质量 / 小体积。
- 保存位置：默认写入项目 `exports/`。
- 文件名：项目名 + 时间戳。

P1 再做：

- 是否包含音频。
- 是否保留透明背景。
- 码率高级设置。
- 导出片段范围。
- 同时导出多个画幅。

不做：

- 手动选择编码器。
- 手动输入复杂 FFmpeg 参数。
- 专业调色、字幕压制、混音。

## 6. 推荐技术方案

### P0：Electron 主进程调用 FFmpeg CLI

推荐：

- 用 `child_process.spawn` 调用 FFmpeg。
- 不用 `fluent-ffmpeg`，它已废弃。
- 可以考虑 `ffmpeg-static` 提供跨平台二进制，但要处理 FFmpeg LGPL/GPL 合规。

原因：

- Nomi 是桌面 App，不需要把重转码塞进浏览器。
- FFmpeg 是最成熟的本地转码工具。
- 主进程可以直接读项目文件、写 `exports/`、报告进度。

### P1：保留 WebM 导出作为 fallback

当前 `timelineWebmExport.ts` 不删。

用途：

- 没有 FFmpeg 时仍可导出。
- 开发调试。
- 低风险保底。

### 暂不选：ffmpeg.wasm

ffmpeg.wasm 可以在浏览器内转码，但对桌面 Nomi 不是首选。

原因：

- 性能和内存压力大。
- 长视频风险高。
- 需要处理 worker / SharedArrayBuffer / 跨源隔离。
- Electron 已经能直接跑本地 FFmpeg。

### 暂不选：Remotion

Remotion 适合“用 React 生成视频”，但 Nomi 当前已有自己的时间轴和画布。

除非未来要做模板化节目包装，否则不作为导出底座。

### 可关注：Mediabunny / WebCodecs

适合未来做浏览器原生 MP4/WebM 导出。

但当前 WebCodecs API 低层、兼容和 muxing 成本更高，不如 FFmpeg CLI 直接。

## 7. 工程拆分

> CTO 更新：当前 `Canvas → MediaRecorder WebM → FFmpeg MP4` 只能作为过渡/fallback，不能作为长视频主架构。生产级方案以 `immutable render manifest → export job queue → render planner → native FFmpeg/headless renderer` 为主线。详见 `docs/architecture/nomi-production-video-export-architecture-2026-05-24.md`。

### v0.4.1：导出任务基础

新增：

- `electron/export/renderTimelineExport.ts`
- `electron/export/ffmpegRunner.ts`
- `electron/export/exportPresets.ts`

IPC：

- `nomi:exports:start`
- `nomi:exports:progress`
- `nomi:exports:cancel`

前端：

- `src/workbench/export/exportTypes.ts`
- `src/workbench/export/exportApi.ts`
- `src/workbench/export/ExportDialog.tsx`

### v0.4.2：MP4 标准导出

能力：

- 标准发布 MP4。
- 写入项目 `exports/`。
- 导出进度。
- 导出完成后显示文件路径。
- 失败可查看错误信息。

### v0.4.3：导出预设

能力：

- 标准发布。
- 继续剪辑。
- 轻量分享。
- WebM fallback。

## 8. 数据结构

```ts
type ExportPreset = 'publish' | 'edit' | 'share' | 'webm'

type ExportRequest = {
  projectId: string
  timeline: TimelineState
  aspectRatio: PreviewAspectRatio
  preset: ExportPreset
  resolution: '720p' | '1080p' | 'source'
  quality: 'small' | 'standard' | 'high'
  outputName?: string
}
```

## 9. 用户流程

1. 用户进入预览区。
2. 点击“导出”。
3. 选择用途：标准发布 / 继续剪辑 / 轻量分享。
4. 确认画幅、分辨率、质量。
5. 点击导出。
6. 导出文件写入项目 `exports/`。
7. 导出完成后，用户可以打开文件或打开所在文件夹。

## 10. 验收标准

P0：

- 能导出 MP4。
- 导出文件在项目 `exports/`。
- 1080p、30fps 可播放。
- 3 分钟以内项目稳定导出。
- 导出失败有明确错误。

P1：

- 支持三种预设。
- 支持取消导出。
- 支持 WebM fallback。

## 11. 执行计划

目标：快速落地“基础导出”。

基础导出 = 当前时间轴 + 当前画幅 + 1080p MP4 + 保存到项目 `exports/` + 进度/错误提示。

### 11.1 阶段计划

| 阶段 | 目标 | 负责人/Agent | 产出 | 风险 |
|---|---|---|---|---|
| 0. 方案冻结 | 明确只做基础 MP4，不发散 | Orchestrator + Product | 功能边界、验收标准 | 需求继续膨胀 |
| 1. 技术探针 | 验证本机 FFmpeg 路径、授权、调用方式 | Research/Spike Agent | `ffmpeg` 调用 PoC、合规说明 | 二进制体积、LGPL/GPL、跨平台路径 |
| 2. IPC 骨架 | 建导出任务协议 | Dev Agent | `exports:start/progress/cancel` | 进度事件和取消机制不稳定 |
| 3. 渲染链路 | 把时间轴帧序列交给 FFmpeg | Dev Agent | MP4 文件写入 `exports/` | 现有 Canvas 导出在主进程不可直接复用 |
| 4. 前端入口 | 把“导出 WebM”改成“导出 MP4”基础弹窗 | Dev Agent | ExportDialog、进度、错误提示 | UI 设置过多 |
| 5. 兼容保底 | 保留 WebM fallback | Dev Agent | MP4 不可用时提示 WebM | 双路径状态混乱 |
| 6. 测试验证 | 覆盖空时间轴、图片、视频、长短项目 | QA Agent | 测试报告、问题清单 | 视频测试自动化成本高 |
| 7. 用户体验审查 | 按用户旅程走一遍 | UX Reviewer | 体验问题、文案调整 | 技术可用但用户不懂 |
| 8. 收口发布 | 修复 P0 问题，更新文档 | Orchestrator | Release checklist | 未知平台差异 |

### 11.2 多 Agent 分工

| Agent | 任务 | 交付物 |
|---|---|---|
| Orchestrator | 控制范围、拆任务、合并结论 | 每日执行清单、阻塞项 |
| Product Agent | 防止需求膨胀，确认基础导出定义 | 功能边界、用户流程 |
| Research Agent | 查 FFmpeg、ffmpeg-static、授权、跨平台风险 | 技术选型备忘 |
| Dev Agent | 实现 IPC、FFmpeg runner、前端弹窗 | 可运行代码 |
| QA Agent | 写测试矩阵，跑手动/自动验证 | 测试报告 |
| UX Reviewer | 用用户视角走导出流程 | 体验审查报告 |
| Code Reviewer | 查并发、路径、安全、错误处理 | Review findings |

### 11.3 开发任务拆分

| 优先级 | 任务 | 文件 |
|---|---|---|
| P0 | 定义导出请求/状态类型 | `src/workbench/export/exportTypes.ts` |
| P0 | 暴露导出 IPC | `electron/preload.ts`, `src/desktop/bridge.ts` |
| P0 | 实现 FFmpeg runner | `electron/export/ffmpegRunner.ts` |
| P0 | 实现导出任务管理 | `electron/export/renderTimelineExport.ts` |
| P0 | 写入项目 `exports/` | `electron/runtime.ts` 或 export service |
| P0 | 前端 ExportDialog | `src/workbench/export/ExportDialog.tsx` |
| P0 | 替换预览区导出入口 | `src/workbench/preview/TimelinePreview.tsx` |
| P0 | 进度、错误、完成动作 | `TimelinePreview.tsx`, `ExportDialog.tsx` |
| P1 | WebM fallback | `timelineWebmExport.ts` |
| P1 | 取消导出 | IPC + FFmpeg process 管理 |

### 11.4 风险表

| 风险 | 影响 | 应对 |
|---|---|---|
| FFmpeg 授权不清 | 不能随包发布 | 先支持用户本机 FFmpeg；打包二进制前做 LGPL/GPL 审查 |
| 跨平台 FFmpeg 路径不同 | Windows/macOS 失败 | 统一 runner 查找顺序：内置路径 → 系统 PATH → 用户配置 |
| 主进程无法复用前端 Canvas 渲染 | MP4 实现延迟 | 第一版可走“前端 WebM → 主进程 FFmpeg 转 MP4” |
| 长视频导出慢 | 用户误以为卡死 | 明确进度、预计耗时、取消按钮 |
| 音频缺失 | 成片不可发布 | 第一版声明“无音频”；下一版做音频保留 |
| 本地路径权限 | 写入失败 | 默认写项目 `exports/`；失败时给明确错误 |
| 视频源无法读取 | 导出失败 | 导出前做素材健康检查 |
| 设置过多 | 用户困惑 | 第一版只给 720p/1080p，不给码率和编码器 |

### 11.5 测试矩阵

| 场景 | 期望 |
|---|---|
| 空时间轴 | 禁用导出，提示先添加素材 |
| 单图片 5 秒 | 导出 MP4 可播放 |
| 单视频 5 秒 | 导出 MP4 可播放 |
| 图片 + 视频混排 | 画面顺序正确 |
| 9:16 竖屏 | 输出分辨率正确 |
| 16:9 横屏 | 输出分辨率正确 |
| 720p | 文件较小，播放正常 |
| 1080p | 默认导出，播放正常 |
| 导出中取消 | 进程停止，不留下损坏完成态 |
| FFmpeg 不可用 | 提示原因，并允许 WebM fallback |
| 素材丢失 | 导出前提示缺失文件 |
| 3 分钟项目 | 不崩溃，有进度 |

### 11.6 用户体验验收

用户只需要知道三件事：

1. 点哪里导出。
2. 导出到哪里。
3. 失败时怎么办。

P0 文案：

- 主按钮：`导出 MP4`
- 默认设置：`1080p · 当前画幅 · 标准发布`
- 完成提示：`已导出到项目 exports 文件夹`
- 失败提示：`导出失败：缺少 FFmpeg / 素材丢失 / 写入失败`

### 11.7 推进节奏

| 天数 | 目标 |
|---|---|
| Day 1 | 技术探针：FFmpeg 调用、输出 MP4、写入 exports |
| Day 2 | IPC + runner + 前端按钮串通 |
| Day 3 | 导出弹窗、进度、错误、完成动作 |
| Day 4 | WebM fallback、取消、素材检查 |
| Day 5 | 测试矩阵、UX review、修 P0 bug |

## 12. 开源方案参考

- FFmpeg：成熟的音视频转码工具；官方说明其默认 LGPL，启用 GPL 部分时整体按 GPL 处理。https://www.ffmpeg.org/legal.html
- ffmpeg-static：提供 macOS / Linux / Windows 静态 FFmpeg 二进制。https://www.npmjs.com/package/ffmpeg-static
- ffmpeg.wasm：浏览器内 FFmpeg WebAssembly 方案，适合作 fallback 或纯 Web。https://ffmpegwasm.netlify.app/docs/overview/
- WebCodecs：浏览器原生低层音视频编解码 API。https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
- Mediabunny：TypeScript 媒体读写/转换工具，面向浏览器和 WebCodecs。https://github.com/Vanilagy/mediabunny
- Remotion：React 生成视频框架，适合模板化视频，不适合作当前时间轴导出底座。https://github.com/remotion-dev/remotion
