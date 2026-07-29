import { describe, expect, it } from 'vitest'
import {
  clampCenter,
  clampScale,
  centerToPixel,
  pixelToCenter,
  snapCenterToGuides,
  SCALE_MAX,
  SCALE_MIN,
} from './overlayTransform'

describe('overlayTransform 纯函数地基', () => {
  it('clampScale 夹到 [MIN,MAX]', () => {
    expect(clampScale(0.05)).toBe(SCALE_MIN)
    expect(clampScale(99)).toBe(SCALE_MAX)
    expect(clampScale(1.5)).toBe(1.5)
    expect(clampScale(NaN)).toBe(1)
  })

  it('clampCenter 夹中心在画面内 0~1', () => {
    expect(clampCenter({ x: -0.3, y: 1.4 })).toEqual({ x: 0, y: 1 })
    expect(clampCenter({ x: 0.4, y: 0.6 })).toEqual({ x: 0.4, y: 0.6 })
  })

  it('snapCenterToGuides 靠近中线吸附并报告引导线', () => {
    const near = snapCenterToGuides({ x: 0.503, y: 0.7 })
    expect(near.center.x).toBe(0.5)
    expect(near.guideX).toBe(0.5)
    expect(near.guideY).toBeNull()
    const far = snapCenterToGuides({ x: 0.7, y: 0.7 })
    expect(far.center).toEqual({ x: 0.7, y: 0.7 })
    expect(far.guideX).toBeNull()
  })

  it('归一化 ↔ 像素 互逆', () => {
    const px = centerToPixel({ x: 0.25, y: 0.5 }, 1920, 1080)
    expect(px).toEqual({ x: 480, y: 540 })
    expect(pixelToCenter(px, 1920, 1080)).toEqual({ x: 0.25, y: 0.5 })
  })
})
