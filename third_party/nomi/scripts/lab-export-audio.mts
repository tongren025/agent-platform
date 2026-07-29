// 一次性端到端用户测试：合成带音轨视频 → 跑完整 filtergraph 导出 → 检查产物音视频流。
// 运行：pnpm exec tsx scripts/lab-export-audio.mts
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { probeMediaMetadata } from '../electron/export/mediaProbe'
import { compileFfmpegFiltergraph } from '../electron/export/ffmpegFiltergraph'
import { renderFiltergraphToMp4, resolveFfmpegPath } from '../electron/export/ffmpegRunner'

const ffmpeg = resolveFfmpegPath()
console.log('ffmpeg:', ffmpeg)

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nomi-audio-test-'))
const projectDir = path.join(tmp, 'project')
fs.mkdirSync(projectDir, { recursive: true })
const srcVideo = path.join(tmp, 'src-with-audio.mp4')

const synth = spawnSync(ffmpeg, [
  '-y',
  '-f', 'lavfi', '-i', 'testsrc=size=640x480:rate=30:duration=2',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
  '-shortest', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p', srcVideo,
], { encoding: 'utf8' })
console.log('synth video+audio exit:', synth.status)

let probedHasAudio: boolean | undefined
try {
  const probe = await probeMediaMetadata(srcVideo)
  probedHasAudio = probe.hasAudio
  console.log('probe:', JSON.stringify(probe))
} catch (error) {
  console.log('PROBE FAILED (production 无 ffprobe 时即如此):', (error as Error).message)
}

const hasAudio = probedHasAudio ?? true // 探测失败时强制，单测 filtergraph 链路本身
const manifest = {
  version: 1 as const,
  projectId: 'p',
  createdAt: new Date().toISOString(),
  timeline: {
    fps: 30,
    durationFrames: 60,
    range: { startFrame: 0, endFrame: 60 },
    tracks: [{ id: 'v', kind: 'visual', clips: [{ id: 'c1', assetId: 'a1', startFrame: 0, endFrame: 60, sourceStartFrame: 0, sourceEndFrame: 60 }] }],
  },
  profile: {
    preset: 'publish' as const, container: 'mp4' as const, videoCodec: 'h264' as const,
    audioCodec: hasAudio ? ('aac' as const) : ('none' as const),
    audioMode: hasAudio ? ('mixdown' as const) : ('mute' as const),
    width: 1280, height: 720, fps: 30, pixelFormat: 'yuv420p' as const, quality: 'standard' as const, audioBitrateKbps: 192,
  },
  assets: { a1: { id: 'a1', kind: 'video' as const, absolutePath: srcVideo, hasAudio } },
}

const plan = compileFfmpegFiltergraph({ manifest })
console.log('audioOutputLabel:', plan.audioOutputLabel)
console.log('filterComplex:', plan.filterComplex)

const result = await renderFiltergraphToMp4({ projectDir, outputName: 'audio-test', profile: manifest.profile, filtergraph: plan, ffmpegPath: ffmpeg })
console.log('output mp4:', result.absolutePath, `${(result.size / 1024).toFixed(0)}KB`)

const inspect = spawnSync(ffmpeg, ['-i', result.absolutePath], { encoding: 'utf8' })
const info = inspect.stderr
const hasAudioStream = /Stream.*Audio/.test(info)
const hasVideoStream = /Stream.*Video/.test(info)
console.log('--- 产物流 ---')
console.log(info.split('\n').filter((l) => /Stream|Duration/.test(l)).map((l) => l.trim()).join('\n'))
console.log('=== 结果 ===')
console.log('产物有视频流:', hasVideoStream)
console.log('产物有音频流:', hasAudioStream)
console.log(hasAudioStream && hasVideoStream ? '✅ 音频导出链路通过' : '❌ 链路有问题')

fs.rmSync(tmp, { recursive: true, force: true })
