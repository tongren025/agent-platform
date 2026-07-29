import React from 'react'
import type { TimelineClip } from '../timeline/timelineTypes'
import { resolveVideoClipMediaTimeSeconds } from '../player/timelinePlayback'

/**
 * playhead → <video>.currentTime 同步（playhead 是单一真相源）。抽出减负 TimelinePreview（R9，与 usePreviewBgmPlayback 对称）。
 * 旧实现「playing 时直接 return」→ 播放中点时间轴中间，playhead 跳了但画面不跟（scrub 失效）。
 * 改为播放感知阈值：暂停时贴紧（逐帧步进也要跟）；播放时 <video> 自走、与 playhead 实时相近，
 * 放宽阈值只在 scrub 这种「大跳」时纠正，避免每帧把 currentTime 往回拽造成抖动。
 */
export function usePreviewVideoPlayheadSync(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  {
    videoClip,
    videoUrl,
    playheadFrame,
    fps,
    playing,
  }: {
    videoClip: TimelineClip | null | undefined
    videoUrl: string
    playheadFrame: number
    fps: number
    playing: boolean
  },
): void {
  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !videoClip || !videoUrl) return
    const nextTime = resolveVideoClipMediaTimeSeconds({ clip: videoClip, playheadFrame, fps })
    if (!Number.isFinite(nextTime)) return
    const threshold = playing ? 0.3 : 0.04
    if (Math.abs(video.currentTime - nextTime) < threshold) return
    video.currentTime = nextTime
  }, [videoRef, fps, playheadFrame, videoClip, videoUrl, playing])
}
