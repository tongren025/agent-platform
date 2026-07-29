// 时间轴吸附领域层 — 纯类型，无 React、无副作用。
// 借鉴 OpenCut 的 SnapPoint source 架构（github.com/OpenCut-app/OpenCut, tag pre-rewrite）。
// 时间一律用整数帧（与 TimelineState.fps 对齐），像素只在交互层换算。

export type SnapPointType = 'origin' | 'playhead' | 'clipStart' | 'clipEnd'

/** 一个吸附目标点（帧坐标 + 来源类型 + 给用户看的标签）。 */
export type SnapPoint = {
  frame: number
  type: SnapPointType
  label: string
  /** clipStart / clipEnd 时为来源 clip 的 id（用于排除自身）。 */
  clipId?: string
}

/** resolveSnap 命中结果。deltaFrame = 吸附点 - 原始目标帧（带符号）。 */
export type SnapResult = {
  frame: number
  point: SnapPoint
  deltaFrame: number
}
