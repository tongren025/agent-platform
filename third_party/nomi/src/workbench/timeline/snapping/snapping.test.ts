import { describe, it, expect } from 'vitest'
import type { TimelineClip, TimelineState } from '../timelineTypes'
import { buildSnapPoints } from './snapPoints'
import { resolveSnap, pixelThresholdToFrames, SNAP_THRESHOLD_PX } from './resolveSnap'

function clip(id: string, start: number, end: number, type: TimelineClip['type'] = 'image'): TimelineClip {
  return {
    id, type, sourceNodeId: `node-${id}`, label: id,
    startFrame: start, endFrame: end, frameCount: end - start,
    offsetStartFrame: 0, offsetEndFrame: 0,
  }
}

function timeline(playheadFrame: number, imageClips: TimelineClip[], videoClips: TimelineClip[] = []): TimelineState {
  return {
    version: 1, fps: 30, scale: 1, playheadFrame,
    tracks: [
      { id: 'imageTrack', type: 'image', label: '图片轨', clips: imageClips },
      { id: 'videoTrack', type: 'video', label: '媒体轨', clips: videoClips },
    ],
  }
}

describe('buildSnapPoints', () => {
  it('总是包含起点(0)，默认包含 playhead', () => {
    const points = buildSnapPoints(timeline(45, []))
    expect(points.find((p) => p.type === 'origin')?.frame).toBe(0)
    expect(points.find((p) => p.type === 'playhead')?.frame).toBe(45)
  })

  it('includePlayhead:false 时不收集 playhead（拖 playhead 自身用）', () => {
    const points = buildSnapPoints(timeline(45, []), { includePlayhead: false })
    expect(points.some((p) => p.type === 'playhead')).toBe(false)
  })

  it('收集每个 clip 的头/尾（跨轨），并能排除指定 clip', () => {
    const t = timeline(0, [clip('a', 0, 90)], [clip('b', 30, 150, 'video')])
    const all = buildSnapPoints(t)
    expect(all.filter((p) => p.type === 'clipStart').map((p) => p.frame).sort((x, y) => x - y)).toEqual([0, 30])
    expect(all.filter((p) => p.type === 'clipEnd').map((p) => p.frame).sort((x, y) => x - y)).toEqual([90, 150])

    const excluded = buildSnapPoints(t, { excludeClipIds: new Set(['a']) })
    expect(excluded.some((p) => p.clipId === 'a')).toBe(false)
    expect(excluded.some((p) => p.clipId === 'b')).toBe(true)
  })

  it('不收集整秒栅格点（真实用户反馈：避免搓衣板感）', () => {
    // 30fps、playhead=0、无 clip：除起点/playhead 外不应有一堆整秒点
    const points = buildSnapPoints(timeline(0, []))
    // 仅 origin(0) 与 playhead(0)，没有 30/60/90... 这种整秒点
    expect(points.every((p) => p.type === 'origin' || p.type === 'playhead')).toBe(true)
  })
})

describe('pixelThresholdToFrames', () => {
  it('按 scale(像素/帧) 换算，至少 1 帧', () => {
    expect(pixelThresholdToFrames(1)).toBe(SNAP_THRESHOLD_PX)       // 1px/帧 → 8 帧
    expect(pixelThresholdToFrames(4)).toBe(2)                       // 4px/帧 → 8/4=2 帧
    expect(pixelThresholdToFrames(0.35)).toBeGreaterThanOrEqual(1)  // 高度缩小也不塌成 0
  })
})

describe('resolveSnap', () => {
  const points = buildSnapPoints(timeline(100, [clip('a', 0, 90)]))

  it('阈值内吸附到最近点，返回带符号 deltaFrame', () => {
    const r = resolveSnap(93, points, 8) // 最近的是 clip a 的尾 90
    expect(r?.frame).toBe(90)
    expect(r?.deltaFrame).toBe(-3)
    expect(r?.point.type).toBe('clipEnd')
  })

  it('超出阈值返回 null（拖远即脱离）', () => {
    expect(resolveSnap(120, points, 8)).toBeNull()
  })

  it('多个候选取最近的', () => {
    // 目标 95：到 90(尾) 距离 5，到 100(playhead) 距离 5 —— 取先命中且更近者
    const r = resolveSnap(96, points, 8)
    expect(r?.frame).toBe(100) // 距离 4 < 到 90 的距离 6
  })
})
