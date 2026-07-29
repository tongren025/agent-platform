import type { CropRect } from './ImageCropGridOverlay'

// 可调切图的纯几何：把「外框 rect + 框内分割线」换算成一组 image 归一化 cell。
// cols/rows 是「框内」切分分数（0~1，升序，长度 = gridSize-1；裁剪时为空）。
// 输出 cell 的 x/y/w/h 是「整图」归一化坐标，直接喂给 cropImageRegion。
// 裁剪 = 0 条线 = 1 个 cell（即外框本身）；这让裁剪与切图共用同一条确认路径（P1，不留两套）。

export type GridCell = {
  x: number
  y: number
  w: number
  h: number
  row: number
  column: number
}

function edges(start: number, span: number, cuts: number[]): number[] {
  const sorted = [...cuts].sort((a, b) => a - b)
  const result = [start]
  for (const cut of sorted) result.push(start + cut * span)
  result.push(start + span)
  return result
}

export type TileBox = { x: number; y: number; width: number; height: number }

// 切图瓦片的落点/尺寸（相对块原点 0,0，调用方再加 baseX/baseY）。
// 设计：整块宽收敛到 blockWidth(≈源节点宽，不再每格撑到 240)；每列宽按 cell 占框宽的比例分；
// 每格高 = 列宽 / 自身宽高比(不拉伸)；行距取该行最高；小间距行列对齐成紧凑方块——治「切完飘」。
// 1 个 cell（裁剪）退化为单个 blockWidth 宽的盒子，与切图共用这一条布局（P1，不另算）。
export function computeSplitLayout(
  cells: GridCell[],
  frameWidth: number,
  blockWidth: number,
  aspects: number[],
  options?: { gap?: number; minTileWidth?: number },
): TileBox[] {
  if (cells.length === 0) return []
  const gap = options?.gap ?? 16
  const minTileWidth = options?.minTileWidth ?? 96
  const fw = Math.max(0.0001, frameWidth)
  const colCount = Math.max(...cells.map((c) => c.column)) + 1
  const rowCount = Math.max(...cells.map((c) => c.row)) + 1
  const colWidths = Array.from({ length: colCount }, (_, c) => {
    const sample = cells.find((cell) => cell.column === c)
    const frac = sample ? sample.w / fw : 1 / colCount
    return Math.max(minTileWidth, Math.round(frac * blockWidth))
  })
  const cellHeights = cells.map((cell, i) => {
    const aspect = aspects[i] && aspects[i] > 0 ? aspects[i] : cell.w / Math.max(0.0001, cell.h)
    return Math.max(1, Math.round(colWidths[cell.column] / aspect))
  })
  const rowHeights = Array.from({ length: rowCount }, (_, r) =>
    Math.max(1, ...cells.map((cell, i) => (cell.row === r ? cellHeights[i] : 0))))
  const colX = colWidths.map((_, c) => colWidths.slice(0, c).reduce((sum, w) => sum + w + gap, 0))
  const rowY = rowHeights.map((_, r) => rowHeights.slice(0, r).reduce((sum, h) => sum + h + gap, 0))
  return cells.map((cell, i) => ({
    x: colX[cell.column],
    y: rowY[cell.row],
    width: colWidths[cell.column],
    height: cellHeights[i],
  }))
}

export function computeGridCells(rect: CropRect, cols: number[], rows: number[]): GridCell[] {
  const xEdges = edges(rect.x, rect.w, cols)
  const yEdges = edges(rect.y, rect.h, rows)
  const cells: GridCell[] = []
  for (let row = 0; row < yEdges.length - 1; row += 1) {
    for (let column = 0; column < xEdges.length - 1; column += 1) {
      cells.push({
        x: xEdges[column],
        y: yEdges[row],
        w: xEdges[column + 1] - xEdges[column],
        h: yEdges[row + 1] - yEdges[row],
        row,
        column,
      })
    }
  }
  return cells
}
