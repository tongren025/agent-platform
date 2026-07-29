import { describe, expect, it, vi } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import { buildGenerationNodeTimelineClip } from './buildGenerationNodeTimelineClip'

vi.mock('../../media/videoDurationProbe', () => ({
  readVideoDurationSeconds: vi.fn(async () => 7),
}))

function videoNode(overrides: Partial<GenerationCanvasNode> = {}): GenerationCanvasNode {
  return {
    id: 'node-1',
    kind: 'video',
    title: 'shot',
    position: { x: 0, y: 0 },
    result: { id: 'result-1', type: 'video', url: 'nomi-local://asset/project/video.mp4', createdAt: 1 },
    ...overrides,
  }
}

describe('buildGenerationNodeTimelineClip', () => {
  it('probes a generated video duration before inserting when result duration is missing', async () => {
    const clip = await buildGenerationNodeTimelineClip(videoNode(), { fps: 30, startFrame: 10 })

    expect(clip?.frameCount).toBe(210)
    expect(clip?.startFrame).toBe(10)
    expect(clip?.endFrame).toBe(220)
  })

  it('prefers the current media file duration even when result duration is already available', async () => {
    const clip = await buildGenerationNodeTimelineClip(
      videoNode({ result: { id: 'result-1', type: 'video', url: 'nomi-local://asset/project/video.mp4', durationSeconds: 3, createdAt: 1 } }),
      { fps: 30, startFrame: 0 },
    )

    expect(clip?.frameCount).toBe(210)
    expect(clip?.endFrame).toBe(210)
  })

  it('prefers the current media file duration over a stale result duration', async () => {
    const clip = await buildGenerationNodeTimelineClip(
      videoNode({ result: { id: 'result-1', type: 'video', url: 'nomi-local://asset/project/video.mp4', durationSeconds: 5, createdAt: 1 } }),
      { fps: 30, startFrame: 0 },
    )

    expect(clip?.frameCount).toBe(210)
    expect(clip?.endFrame).toBe(210)
  })
})
