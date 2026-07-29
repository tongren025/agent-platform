import { describe, expect, it } from 'vitest'
import { computeGridCells, computeSplitLayout } from './cropGridGeometry'

const FULL = { x: 0, y: 0, w: 1, h: 1 }

describe('computeGridCells', () => {
  it('裁剪退化：无分割线 → 1 个 cell，等于外框本身', () => {
    const cells = computeGridCells({ x: 0.1, y: 0.2, w: 0.5, h: 0.4 }, [], [])
    expect(cells).toHaveLength(1)
    expect(cells[0]).toMatchObject({ row: 0, column: 0 })
    expect(cells[0].x).toBeCloseTo(0.1)
    expect(cells[0].y).toBeCloseTo(0.2)
    expect(cells[0].w).toBeCloseTo(0.5)
    expect(cells[0].h).toBeCloseTo(0.4)
  })

  it('等分 2×2（默认线 0.5）→ 4 个等大 cell，证明＝旧等分行为', () => {
    const cells = computeGridCells(FULL, [0.5], [0.5])
    expect(cells).toHaveLength(4)
    for (const cell of cells) {
      expect(cell.w).toBeCloseTo(0.5)
      expect(cell.h).toBeCloseTo(0.5)
    }
    expect(cells.map((c) => [c.row, c.column])).toEqual([
      [0, 0], [0, 1], [1, 0], [1, 1],
    ])
  })

  it('等分 3×3（线 1/3,2/3）→ 9 个 cell，各 1/3', () => {
    const third = [1 / 3, 2 / 3]
    const cells = computeGridCells(FULL, third, third)
    expect(cells).toHaveLength(9)
    for (const cell of cells) {
      expect(cell.w).toBeCloseTo(1 / 3)
      expect(cell.h).toBeCloseTo(1 / 3)
    }
  })

  it('自定义线：把竖线拖到 0.7 → 左宽 0.7、右窄 0.3（不再等分）', () => {
    const cells = computeGridCells(FULL, [0.7], [0.5])
    expect(cells[0].w).toBeCloseTo(0.7)
    expect(cells[1].w).toBeCloseTo(0.3)
  })

  it('外框偏移 + 缩放：cell 是整图坐标，随框平移缩放', () => {
    const frame = { x: 0.2, y: 0.1, w: 0.6, h: 0.8 }
    const cells = computeGridCells(frame, [0.5], [])
    expect(cells).toHaveLength(2)
    expect(cells[0]).toMatchObject({ x: 0.2, y: 0.1, h: 0.8 })
    expect(cells[0].w).toBeCloseTo(0.3)
    expect(cells[1].x).toBeCloseTo(0.5)
    expect(cells[1].w).toBeCloseTo(0.3)
  })

  it('乱序传入的线也会被升序处理', () => {
    const cells = computeGridCells(FULL, [2 / 3, 1 / 3], [])
    expect(cells.map((c) => c.x)).toEqual([0, 1 / 3, 2 / 3])
  })
})

describe('computeSplitLayout（切完不飘：紧凑方块）', () => {
  const square = (n: number) => Array.from({ length: n }, () => 1)

  it('等分 2×2：四格等大，整块≈源宽，间距=gap，行列对齐', () => {
    const cells = computeGridCells(FULL, [0.5], [0.5])
    const boxes = computeSplitLayout(cells, 1, 240, square(4), { gap: 16 })
    // 四格同宽同高
    expect(new Set(boxes.map((b) => b.width))).toEqual(new Set([120]))
    expect(new Set(boxes.map((b) => b.height))).toEqual(new Set([120]))
    // 相邻列/行间距 = 宽/高 + gap（紧凑、不飘）
    expect(boxes[1].x - boxes[0].x).toBe(120 + 16)
    expect(boxes[2].y - boxes[0].y).toBe(120 + 16)
    // 整块宽 ≈ 源宽（120+16+120=256，而非旧版每格 240 的 ~536）
    const blockW = Math.max(...boxes.map((b) => b.x + b.width))
    expect(blockW).toBeLessThanOrEqual(260)
    // 左上格在原点，行列严格对齐
    expect(boxes[0]).toMatchObject({ x: 0, y: 0 })
    expect(boxes[0].x).toBe(boxes[2].x)
    expect(boxes[1].x).toBe(boxes[3].x)
  })

  it('不等分：把竖线拖到 0.7 → 左列更宽、右列更窄', () => {
    const cells = computeGridCells(FULL, [0.7], [0.5])
    const boxes = computeSplitLayout(cells, 1, 400, square(4), { gap: 16 })
    expect(boxes[0].width).toBe(280) // 0.7 × 400
    expect(boxes[1].width).toBe(120) // 0.3 × 400
  })

  it('过窄列设地板，不至于窄到没法用', () => {
    const cells = computeGridCells(FULL, [0.95], [])
    const boxes = computeSplitLayout(cells, 1, 200, square(2), { gap: 16, minTileWidth: 96 })
    expect(boxes[1].width).toBe(96) // 0.05×200=10 → 抬到地板 96
  })

  it('裁剪退化（1 格）：单盒 = blockWidth × blockWidth/宽高比', () => {
    const cells = computeGridCells({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, [], [])
    const boxes = computeSplitLayout(cells, 0.8, 300, [1.5])
    expect(boxes).toHaveLength(1)
    expect(boxes[0]).toMatchObject({ x: 0, y: 0, width: 300, height: 200 })
  })

  it('每格高随自身宽高比，不拉伸', () => {
    const cells = computeGridCells(FULL, [0.5], [])
    const boxes = computeSplitLayout(cells, 1, 240, [2, 0.5], { gap: 16 })
    expect(boxes[0].height).toBe(60) // 120 / 2
    expect(boxes[1].height).toBe(240) // 120 / 0.5
  })
})
