import { describe, it, expect } from 'vitest'
import { updateClipsBySourceNodeId } from './timelineEdit'
import type { TimelineClip, TimelineState } from './timelineTypes'

function clip(over: Partial<TimelineClip>): TimelineClip {
  return {
    id: 'c',
    type: 'video',
    sourceNodeId: 'n',
    label: '',
    startFrame: 0,
    endFrame: 100,
    frameCount: 100,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
    ...over,
  }
}

function state(clips: TimelineClip[]): TimelineState {
  return {
    version: 1,
    fps: 30,
    scale: 1,
    playheadFrame: 0,
    tracks: [{ id: 'videoTrack', type: 'video', label: '视频轨', clips }],
    textClips: [],
  }
}

describe('updateClipsBySourceNodeId', () => {
  it('只改命中 sourceNodeId 的 clip', () => {
    const s = state([
      clip({ id: 'a', sourceNodeId: 'n1', startFrame: 0, endFrame: 100 }),
      clip({ id: 'b', sourceNodeId: 'n2', startFrame: 100, endFrame: 200 }),
    ])
    const next = updateClipsBySourceNodeId(s, 'n1', (c) => ({ ...c, label: '改了' }))
    const a = next.tracks[0].clips.find((c) => c.id === 'a')
    const b = next.tracks[0].clips.find((c) => c.id === 'b')
    expect(a?.label).toBe('改了')
    expect(b?.label).toBe('')
  })

  it('回填变长会撞下一片 → endFrame 夹到邻片起点、不重叠、startFrame 不变', () => {
    const s = state([
      clip({ id: 'a', sourceNodeId: 'n1', startFrame: 0, endFrame: 100, frameCount: 100 }),
      clip({ id: 'b', sourceNodeId: 'n2', startFrame: 100, endFrame: 200 }),
    ])
    // transform 把 a 变长到 endFrame 180（frameCount 180）
    const next = updateClipsBySourceNodeId(s, 'n1', (c) => ({ ...c, endFrame: 180, frameCount: 180 }))
    const a = next.tracks[0].clips.find((c) => c.id === 'a')!
    expect(a.startFrame).toBe(0)
    expect(a.endFrame).toBe(100) // 夹到 b.startFrame，不重叠
    expect(a.offsetEndFrame).toBe(80) // 收回的 80 帧记进 offsetEnd（video 模型）
  })

  it('无命中 → 返回同一引用', () => {
    const s = state([clip({ id: 'a', sourceNodeId: 'n1' })])
    expect(updateClipsBySourceNodeId(s, 'nope', (c) => ({ ...c, label: 'x' }))).toBe(s)
  })
})
