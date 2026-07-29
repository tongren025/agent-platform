import { readVideoDurationSeconds } from '../../media/videoDurationProbe'
import { buildClipFromGenerationNode } from '../generationCanvas/model/buildClipFromGenerationNode'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import type { TimelineClip } from './timelineTypes'

type BuildOptions = {
  fps?: number
  startFrame?: number
  resultId?: string
}

function withVideoDuration(clip: TimelineClip, durationSeconds: number, fps: number): TimelineClip {
  const frameCount = Math.max(1, Math.round(durationSeconds * Math.max(1, fps)))
  return {
    ...clip,
    frameCount,
    endFrame: clip.startFrame + frameCount,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
  }
}

export async function buildGenerationNodeTimelineClip(
  node: GenerationCanvasNode,
  options: BuildOptions = {},
): Promise<TimelineClip | null> {
  const clip = buildClipFromGenerationNode(node, options)
  if (!clip || clip.type !== 'video' || !clip.url) return clip

  const durationSeconds = await readVideoDurationSeconds(clip.url)
  if (!durationSeconds) return clip
  return withVideoDuration(clip, durationSeconds, options.fps || 30)
}
