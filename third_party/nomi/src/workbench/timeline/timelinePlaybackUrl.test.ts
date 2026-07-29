import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import type { TimelineClip, TimelineState } from './timelineTypes'
import { resolveTimelineClipPlaybackUrl, resolveTimelinePlaybackUrls } from './timelinePlaybackUrl'

function clip(url: string): TimelineClip {
  return {
    id: 'clip-1',
    type: 'video',
    sourceNodeId: 'node-1',
    label: '镜头',
    startFrame: 0,
    endFrame: 30,
    frameCount: 30,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
    url,
  }
}

function node(): GenerationCanvasNode {
  return {
    id: 'node-1',
    kind: 'video',
    title: '镜头',
    position: { x: 0, y: 0 },
    status: 'idle',
    result: {
      id: 'result-1',
      type: 'video',
      url: 'nomi-local://asset/project/assets/generated/video.mp4',
      providerUrl: 'http://192.168.10.2:8188/view?filename=ComfyUI_00025_.mp4&subfolder=video&type=output',
      createdAt: 1,
    },
  }
}

describe('resolveTimelineClipPlaybackUrl', () => {
  it('rewrites an old providerUrl timeline clip back to the local persisted asset', () => {
    expect(resolveTimelineClipPlaybackUrl(clip(node().result!.providerUrl!), [node()])).toBe(
      'nomi-local://asset/project/assets/generated/video.mp4',
    )
  })

  it('keeps the clip url when it does not match the source node result', () => {
    expect(resolveTimelineClipPlaybackUrl(clip('https://cdn.example.com/other.mp4'), [node()])).toBe(
      'https://cdn.example.com/other.mp4',
    )
  })
})

describe('resolveTimelinePlaybackUrls', () => {
  it('returns an export-safe timeline without mutating the original clip url', () => {
    const providerUrl = node().result!.providerUrl!
    const timeline: TimelineState = {
      fps: 30,
      scale: 1,
      playheadFrame: 0,
      tracks: [{ id: 'video', type: 'video', label: 'Video', clips: [clip(providerUrl)] }],
      textClips: [],
    }

    const resolved = resolveTimelinePlaybackUrls(timeline, [node()])

    expect(resolved.tracks[0]?.clips[0]?.url).toBe('nomi-local://asset/project/assets/generated/video.mp4')
    expect(timeline.tracks[0]?.clips[0]?.url).toBe(providerUrl)
  })
})
