/** Agent Studio 原生节点落点规划：按行寻找离锚点最近的空位。 */
import type { Node } from 'reactflow';

export type CanvasNodeKind = 'data' | 'storyboard' | 'sticky' | 'group' | 'image';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

const GAP = 40;
const DEFAULT_SIZES: Record<CanvasNodeKind, Size> = {
  data: { width: 300, height: 210 },
  storyboard: { width: 320, height: 280 },
  sticky: { width: 220, height: 170 },
  group: { width: 600, height: 400 },
  image: { width: 264, height: 300 },
};

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
  maxRows = 12,
): Point {
  const size = DEFAULT_SIZES[kind];
  const isOccupied = (position: Point) => existing.some((node) => (
    node.type !== 'group' && overlaps(position, size, node.position, nodeSize(node))
  ));

  if (!isOccupied(base)) return base;

  const columnWidth = size.width + GAP;
  const rowHeight = size.height + GAP;
  for (let row = 0; row <= maxRows; row += 1) {
    const columnLimit = row + 2;
    for (let column = -columnLimit; column <= columnLimit; column += 1) {
      if (row === 0 && column === 0) continue;
      const candidate = {
        x: Math.round(base.x + column * columnWidth),
        y: Math.round(base.y + row * rowHeight),
      };
      if (!isOccupied(candidate)) return candidate;
    }
  }

  return {
    x: Math.round(base.x),
    y: Math.round(base.y + (maxRows + 1) * rowHeight),
  };
}
