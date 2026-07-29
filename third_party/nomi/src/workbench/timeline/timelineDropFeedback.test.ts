import { describe, expect, it } from 'vitest'
import { buildTimelineDropPreview, formatTimelineDropTimecode } from './timelineDropFeedback'
import type { TimelineClip, TimelineTrack } from './timelineTypes'

function makeClip(overrides: Partial<TimelineClip> = {}): TimelineClip {
  return {
    id: 'clip-new',
    type: 'image',
    sourceNodeId: 'node-1',
    label: 'Generated image',
    startFrame: 0,
    endFrame: 90,
    frameCount: 90,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
    url: 'file:///asset.png',
    ...overrides,
  }
}

function makeTrack(overrides: Partial<TimelineTrack> = {}): TimelineTrack {
  return {
    id: 'imageTrack',
    type: 'image',
    label: '图片轨',
    clips: [],
    ...overrides,
  }
}

describe('timeline drop feedback', () => {
  it('builds a visible valid ghost preview at the drop frame', () => {
    const preview = buildTimelineDropPreview({
      track: makeTrack(),
      clip: makeClip(),
      startFrame: 30,
      scale: 2,
      fps: 30,
    })

    expect(preview).toMatchObject({
      canPlace: true,
      startFrame: 30,
      endFrame: 120,
      left: 60,
      width: 180,
      timecode: '0:01',
    })
  })

  it('marks colliding drops invalid with a user-facing reason', () => {
    const preview = buildTimelineDropPreview({
      track: makeTrack({ clips: [makeClip({ id: 'existing', startFrame: 60, endFrame: 150 })] }),
      clip: makeClip(),
      startFrame: 30,
      scale: 1,
      fps: 30,
    })

    expect(preview.canPlace).toBe(false)
    expect(preview.reason).toBe('这里已有片段，试试拖到空白位置')
  })

  it('marks wrong-track drops invalid with a clear reason', () => {
    const preview = buildTimelineDropPreview({
      track: makeTrack({ type: 'video', label: '视频轨' }),
      clip: makeClip({ type: 'image' }),
      startFrame: 0,
      scale: 1,
      fps: 30,
    })

    expect(preview.canPlace).toBe(false)
    expect(preview.reason).toBe('这个素材需要放到图片轨')
  })

  it('formats frame positions as compact timeline timecodes', () => {
    expect(formatTimelineDropTimecode(0, 30)).toBe('0:00')
    expect(formatTimelineDropTimecode(75, 30)).toBe('0:02')
    expect(formatTimelineDropTimecode(1830, 30)).toBe('1:01')
  })
})
