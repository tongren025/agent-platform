import { describe, expect, it } from 'vitest'
import { connectNodes, nextEdgeOrderForTarget, sortEdgesByOrder } from './graphOps'
import type { GenerationCanvasEdge } from './generationCanvasTypes'

describe('connectNodes — 去重按 (source,target,mode)（治「同两点连不了第二种参考」R2）', () => {
  it('同 (source,target,mode) 重复 → no-op', () => {
    const base: GenerationCanvasEdge[] = [{ id: 'e1', source: 'a', target: 'b', mode: 'first_frame' }]
    expect(connectNodes(base, 'a', 'b', 'first_frame')).toBe(base)
  })

  it('同两点、不同 mode（首帧 + 尾帧）→ 都连得上', () => {
    const base: GenerationCanvasEdge[] = [{ id: 'e1', source: 'a', target: 'b', mode: 'first_frame' }]
    const next = connectNodes(base, 'a', 'b', 'last_frame')
    expect(next).toHaveLength(2)
    expect(next[1]).toMatchObject({ source: 'a', target: 'b', mode: 'last_frame' })
  })

  it('自连接 / 空端点 → no-op', () => {
    const base: GenerationCanvasEdge[] = []
    expect(connectNodes(base, 'a', 'a', 'reference')).toBe(base)
    expect(connectNodes(base, '', 'b', 'reference')).toBe(base)
  })
})

describe('connectNodes — order 字段（数组参考 character1..N 的真相源，audit §1d）', () => {
  it('多个不同源 → 同 target：order 按放入顺序递增 0,1,2', () => {
    let edges: GenerationCanvasEdge[] = []
    edges = connectNodes(edges, 'a', 'dst', 'character_ref')
    edges = connectNodes(edges, 'b', 'dst', 'character_ref')
    edges = connectNodes(edges, 'c', 'dst', 'character_ref')
    expect(edges.map((e) => [e.source, e.order])).toEqual([['a', 0], ['b', 1], ['c', 2]])
  })

  it('order 全模式单调（不按 mode 分桶）：首帧 + 角色参考交替也连续递增', () => {
    let edges: GenerationCanvasEdge[] = []
    edges = connectNodes(edges, 'f', 'dst', 'first_frame')
    edges = connectNodes(edges, 'a', 'dst', 'character_ref')
    expect(edges.map((e) => e.order)).toEqual([0, 1])
  })

  it('nextEdgeOrderForTarget = 该 target 已有入边数（含别的 target 的边不计）', () => {
    const edges: GenerationCanvasEdge[] = [
      { id: 'e1', source: 'a', target: 'dst', mode: 'character_ref', order: 0 },
      { id: 'e2', source: 'b', target: 'other', mode: 'reference', order: 0 },
    ]
    expect(nextEdgeOrderForTarget(edges, 'dst')).toBe(1)
    expect(nextEdgeOrderForTarget(edges, 'other')).toBe(1)
    expect(nextEdgeOrderForTarget(edges, 'none')).toBe(0)
  })
})

describe('sortEdgesByOrder — 显示/生成共用的稳定有序', () => {
  it('按 order 升序排（无视数组原序）', () => {
    const edges: GenerationCanvasEdge[] = [
      { id: 'e2', source: 'b', target: 'dst', mode: 'character_ref', order: 1 },
      { id: 'e0', source: 'a', target: 'dst', mode: 'character_ref', order: 0 },
    ]
    expect(sortEdgesByOrder(edges).map((e) => e.source)).toEqual(['a', 'b'])
  })

  it('无 order 的旧边视作 +∞、排在显式 order 之后且彼此保持原数组序（旧快照行为不变）', () => {
    const edges: GenerationCanvasEdge[] = [
      { id: 'old1', source: 'x', target: 'dst', mode: 'reference' },
      { id: 'new', source: 'a', target: 'dst', mode: 'character_ref', order: 0 },
      { id: 'old2', source: 'y', target: 'dst', mode: 'reference' },
    ]
    expect(sortEdgesByOrder(edges).map((e) => e.source)).toEqual(['a', 'x', 'y'])
  })
})
