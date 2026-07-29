import { clampTimelineScale } from '../timelineEdit'
import type { SnapPoint, SnapResult } from './snapTypes'

/** 吸附阈值（像素）。用像素定义、按 zoom 换算成帧 → 任意缩放下手感一致。 */
export const SNAP_THRESHOLD_PX = 8

/**
 * 把像素阈值换算成帧。scale = 像素/帧（见 timelineEdit.frameToPixel）。
 * 至少 1 帧，避免高度缩小时阈值塌成 0。
 */
export function pixelThresholdToFrames(scale: number, thresholdPx: number = SNAP_THRESHOLD_PX): number {
  const safeScale = clampTimelineScale(scale)
  return Math.max(1, Math.round(thresholdPx / safeScale))
}

/**
 * 在阈值内找最近的吸附点。无命中返回 null（→ 不吸附，自由放置）。
 * 这正是"靠近即吸、拖远即脱离"：目标帧远离所有点超过阈值时自然返回 null。
 */
export function resolveSnap(
  targetFrame: number,
  points: readonly SnapPoint[],
  thresholdFrames: number,
): SnapResult | null {
  let best: SnapResult | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const point of points) {
    const distance = Math.abs(point.frame - targetFrame)
    if (distance <= thresholdFrames && distance < bestDistance) {
      bestDistance = distance
      best = { frame: point.frame, point, deltaFrame: point.frame - targetFrame }
    }
  }
  return best
}
