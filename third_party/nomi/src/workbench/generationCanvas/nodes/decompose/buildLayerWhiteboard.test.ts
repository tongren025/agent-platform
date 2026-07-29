import { describe, expect, it } from 'vitest'
import { buildLayerWhiteboardState } from './buildLayerWhiteboard'

describe('buildLayerWhiteboardState', () => {
  it('N 张图层 → N 个 asset + N 个图层，铺满画布', () => {
    const state = buildLayerWhiteboardState(['bg.png', 'a.png', 'b.png'], '4:3')
    expect(state.canvasAssets).toHaveLength(3)
    const assetLayers = state.layers.filter((l) => l.kind === 'asset')
    expect(assetLayers).toHaveLength(3)
    const first = state.canvasAssets[0]
    expect(first.x).toBe(0)
    expect(first.y).toBe(0)
    expect(first.width).toBeGreaterThan(0)
    expect(first.source).toBe('generated')
  })

  it('index0 命名为背景，其余为元素 N', () => {
    const state = buildLayerWhiteboardState(['bg.png', 'a.png'], '1:1')
    expect(state.canvasAssets[0].name).toBe('背景')
    expect(state.canvasAssets[1].name).toBe('元素 1')
  })

  it('空 url 被跳过', () => {
    const state = buildLayerWhiteboardState(['bg.png', '', 'b.png'], '16:9')
    expect(state.canvasAssets).toHaveLength(2)
  })

  it('活动图层切到最上层元素（非锁定背景）', () => {
    const state = buildLayerWhiteboardState(['bg.png', 'a.png'], '3:4')
    const active = state.layers.find((l) => l.id === state.activeLayerId)
    expect(active?.kind).toBe('asset')
    expect(active?.name).toBe('元素 1')
  })

  it('保留默认 ratio 与结构（strokes 空 / 有默认背景+绘图层）', () => {
    const state = buildLayerWhiteboardState(['bg.png'], '16:9')
    expect(state.activeRatio).toBe('16:9')
    expect(state.strokes).toEqual([])
    expect(state.layers.some((l) => l.kind === 'background')).toBe(true)
  })
})
