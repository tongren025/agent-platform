/**
 * 节点落点碰撞避让。
 *
 * 基于 Nomi v0.17.0 `generationCanvas/store/resolveInsertionPosition.ts`
 * 的 AABB 螺旋避让算法改写（Apache-2.0）；这里只保留与画布布局有关的纯逻辑，
 * 类型、尺寸和数据源全部改为 Agent Studio ReactFlow 节点。
 */
import type { Node } from 'reactflow';

export type CanvasNodeKind = 'data' | 'storyboard' | 'sticky' | 'group' | 'image';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

const GAP = 48;
const DEFAULT_SIZES: Record<CanvasNodeKind, Size> = {
  data: { width: 300, height: 210 },
  storyboard: { width: 320, height: 280 },
  sticky: { width: 220, height: 170 },
  group: { width: 600, height: 400 },
  image: { width: 264, height: 300 },
};

const SPIRAL_DIRECTIONS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
];

function nodeSize(node: Node): Size {
  const fallback = DEFAULT_SIZES[(node.type || 'data') as CanvasNodeKind] || DEFAULT_SIZES.data;
  return {
    width: Number(node.width || node.style?.width || fallback.width),
    height: Number(node.height || node.style?.height || fallback.height),
  };
}

function overlaps(aPosition: Point, aSize: Size, bPosition: Point, bSize: Size): boolean {
  return (
    aPosition.x < bPosition.x + bSize.width
    && aPosition.x + aSize.width > bPosition.x
    && aPosition.y < bPosition.y + bSize.height
    && aPosition.y + aSize.height > bPosition.y
  );
}

export function resolveInsertionPosition(
  kind: CanvasNodeKind,
  base: Point,
  existing: readonly Node[],
  maxRings = 8,
): Point {
  const size = DEFAULT_SIZES[kind];
  const collides = (position: Point) => existing.some((node) => (
    node.type !== 'group' && overlaps(position, size, node.position, nodeSize(node))
  ));

  if (!collides(base)) return base;

  const stepX = size.width + GAP;
  const stepY = size.height + GAP;
  let last = base;
  for (let ring = 1; ring <= maxRings; ring += 1) {
    for (const direction of SPIRAL_DIRECTIONS) {
      const candidate = {
        x: Math.round(base.x + direction.x * stepX * ring),
        y: Math.round(base.y + direction.y * stepY * ring),
      };
      last = candidate;
      if (!collides(candidate)) return candidate;
    }
  }
  return last;
}
