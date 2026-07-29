/**
 * 通用叠加层变换地基（content-agnostic）：不绑「文字」——文字/图片/贴纸将来都用它。
 * 坐标 = 归一化（占画布宽/高的 0~1 比例），中心锚点 → 预览（任意尺寸）与导出（固定分辨率）零漂移。
 * 纯函数：clamp / snap / 坐标换算。交互组件 OverlaySelectionBox 与渲染层都消费这里。
 */

export type Vec2 = { x: number; y: number }

export type OverlayTransform = {
  /** 元素中心的归一化位置（0~1，相对画布宽/高）*/
  position: Vec2
  /** 缩放倍数（作用于元素的基准尺寸）*/
  scale: number
  /** 旋转角度（度）。本期预留，不接把手——以后加是加法。*/
  rotation: number
}

export const SCALE_MIN = 0.2
export const SCALE_MAX = 5

/** 中线吸附阈值（占画布的比例）——拖到接近水平/垂直中线时吸附。*/
export const SNAP_THRESHOLD_FRAC = 0.012

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale))
}

/** 把中心点夹在画面内（中心不跑出画布）。*/
export function clampCenter(center: Vec2): Vec2 {
  return {
    x: Math.min(1, Math.max(0, Number.isFinite(center.x) ? center.x : 0.5)),
    y: Math.min(1, Math.max(0, Number.isFinite(center.y) ? center.y : 0.5)),
  }
}

export type SnapResult = {
  center: Vec2
  /** 命中的吸附引导线（归一化坐标）：水平中线 y=0.5 / 垂直中线 x=0.5，未命中为 null。*/
  guideX: number | null
  guideY: number | null
}

/** 中线吸附：靠近 x=0.5 或 y=0.5 时吸附，并报告引导线。*/
export function snapCenterToGuides(center: Vec2, threshold = SNAP_THRESHOLD_FRAC): SnapResult {
  let x = center.x
  let y = center.y
  let guideX: number | null = null
  let guideY: number | null = null
  if (Math.abs(x - 0.5) <= threshold) { x = 0.5; guideX = 0.5 }
  if (Math.abs(y - 0.5) <= threshold) { y = 0.5; guideY = 0.5 }
  return { center: { x, y }, guideX, guideY }
}

/** 归一化中心 → 给定画布尺寸下的像素中心。*/
export function centerToPixel(center: Vec2, width: number, height: number): Vec2 {
  return { x: center.x * Math.max(1, width), y: center.y * Math.max(1, height) }
}

/** 像素中心 → 归一化中心。*/
export function pixelToCenter(pixel: Vec2, width: number, height: number): Vec2 {
  return { x: pixel.x / Math.max(1, width), y: pixel.y / Math.max(1, height) }
}
