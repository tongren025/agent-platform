import { getGenerationNodeFootprintSize } from '../model/generationNodeKinds'
import type { GenerationNodeKind } from '../model/generationCanvasTypes'

/**
 * 新建节点落点真碰撞避让（审计 A4 根治）。
 *
 * 旧实现（GenerationCanvas.getToolbarInsertionPosition）的「避让」是把已有节点原点
 * 四舍五入成 `"x,y"` 整数点塞进 Set，只在新点与某原点**像素级相同**时才判冲突——
 * 错开 1px、或两卡包围盒大面积重叠，都检测不到 → 几乎总返回中心 basePosition，
 * 手动建的节点恒压在中心已有节点上（真机复现：生成图片 / 添加 3D / 图片节点全中招）。
 *
 * 本版改用**真实 AABB 包围盒**判重叠：每个候选位置都拿「新节点尺寸」对全体已有节点
 * 的盒做相交测试，命中就按螺旋顺序换下一个候选，找到第一个不压任何已有节点的空位。
 * 步距 derive 自节点尺寸（不 hardcode），与 trajectoryLayout 的「间距从尺寸推导」一致。
 */

const GAP = 48

export type NodeBox = {
  kind: GenerationNodeKind
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

type Size = { width: number; height: number }
type Point = { x: number; y: number }

// 节点足迹 = 名义尺寸 + NODE_RENDER_SAFETY（吸收渲染比名义大的增量）。与批量布局
// (agent/trajectoryLayout) 共用 model 层的同一足迹函数——单插避让和批量布局同一余量，
// 不许各搞一套（第二真相源）。
function sizeFor(node: Pick<NodeBox, 'kind' | 'size'>): Size {
  return getGenerationNodeFootprintSize(node.kind, node.size)
}

/** 两个轴对齐矩形是否相交。 */
function overlaps(aPos: Point, aSize: Size, bPos: Point, bSize: Size): boolean {
  return (
    aPos.x < bPos.x + bSize.width &&
    aPos.x + aSize.width > bPos.x &&
    aPos.y < bPos.y + bSize.height &&
    aPos.y + aSize.height > bPos.y
  )
}

function collidesAny(pos: Point, size: Size, existing: readonly NodeBox[]): boolean {
  return existing.some((node) => overlaps(pos, size, node.position, sizeFor(node)))
}

// 8 个方向（先右/下，再四角/左/上），保证优先往右下铺、视觉自然。两个螺旋解算器共用。
const SPIRAL_DIRS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
]

/**
 * 从 base 起，按螺旋顺序找第一个不与任何已有节点重叠的落点。
 * 螺旋环 r=0..maxRings，每环 8 个方向，步距 = 新节点尺寸 + GAP（保证一步就能跨过一张卡）。
 * 全部命中（极端密集）→ 返回最后一个候选（不再无限找，行为可预期）。
 *
 * `existing` 只应传**同分类**（同屏可见）节点：画布按 activeCategoryId 分屏渲染
 * （GenerationCanvas 只画 categoryId===activeCategoryId 的节点），跨分类节点不同屏、不遮挡，
 * 拿它们避让只会把新节点无谓推远。
 */
export function resolveInsertionPosition(
  newKind: GenerationNodeKind,
  base: Point,
  existing: readonly NodeBox[],
  maxRings = 6,
): Point {
  const size = sizeFor({ kind: newKind })
  if (!collidesAny(base, size, existing)) return base

  const stepX = Math.round(size.width + GAP)
  const stepY = Math.round(size.height + GAP)
  let last = base
  for (let ring = 1; ring <= maxRings; ring += 1) {
    for (const dir of SPIRAL_DIRS) {
      const candidate = {
        x: Math.round(base.x + dir.x * stepX * ring),
        y: Math.round(base.y + dir.y * stepY * ring),
      }
      last = candidate
      if (!collidesAny(candidate, size, existing)) return candidate
    }
  }
  return last
}

/**
 * 整组落点避让（粘贴多节点用）：把整簇 `boxes` 当刚体，求一个统一位移 delta，
 * 使位移后**没有任何一张卡**压住 `existing`——保住簇内相对排布（单一位移不变形），
 * 同时整簇不压已有内容。步距 = 整簇包围盒尺寸 + GAP（一环就能跨过整簇）。
 * 不冲突 → {0,0}；极端密集找不到 → 最后一个候选位移（行为可预期）。
 */
export function resolveGroupInsertionDelta(
  boxes: readonly NodeBox[],
  existing: readonly NodeBox[],
  maxRings = 6,
): Point {
  if (!boxes.length) return { x: 0, y: 0 }
  const groupCollides = (dx: number, dy: number): boolean =>
    boxes.some((box) => collidesAny({ x: box.position.x + dx, y: box.position.y + dy }, sizeFor(box), existing))
  if (!groupCollides(0, 0)) return { x: 0, y: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const box of boxes) {
    const size = sizeFor(box)
    minX = Math.min(minX, box.position.x)
    minY = Math.min(minY, box.position.y)
    maxX = Math.max(maxX, box.position.x + size.width)
    maxY = Math.max(maxY, box.position.y + size.height)
  }
  const stepX = Math.round(maxX - minX + GAP)
  const stepY = Math.round(maxY - minY + GAP)
  let last: Point = { x: 0, y: 0 }
  for (let ring = 1; ring <= maxRings; ring += 1) {
    for (const dir of SPIRAL_DIRS) {
      const delta = { x: dir.x * stepX * ring, y: dir.y * stepY * ring }
      last = delta
      if (!groupCollides(delta.x, delta.y)) return delta
    }
  }
  return last
}
