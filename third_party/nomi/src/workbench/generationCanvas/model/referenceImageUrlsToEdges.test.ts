import { describe, expect, it } from 'vitest'
import { migrateReferenceImageUrlsToEdges } from './referenceImageUrlsToEdges'
import type { GenerationCanvasNode, GenerationCanvasEdge } from './generationCanvasTypes'

// 迁移：旧项目数组参考存 meta.referenceImageUrls（有序、不画线）→ 有序 character_ref 边。
// 铁律：反查不到源的 URL 一律保留 meta，绝不丢已存参考。

function imgNode(id: string, url?: string): GenerationCanvasNode {
  return {
    id, kind: 'image', title: id, position: { x: 0, y: 0 }, prompt: '',
    ...(url ? { result: { id: `${id}-r`, type: 'image', url, createdAt: 0 } } : {}),
  } as GenerationCanvasNode
}
function omni(id: string, refUrls: string[]): GenerationCanvasNode {
  return {
    id, kind: 'video', title: id, position: { x: 400, y: 0 }, prompt: '',
    meta: { modelKey: 'seedance-2', archetype: { id: 'seedance-2', modeId: 'omni' }, referenceImageUrls: refUrls },
  } as GenerationCanvasNode
}

describe('migrateReferenceImageUrlsToEdges', () => {
  it('两张参考图都在画布有源 → 按序建两条 character_ref 边(order 0,1)、meta 清空', () => {
    const a = imgNode('a', 'https://cdn/a.png')
    const b = imgNode('b', 'https://cdn/b.png')
    const dst = omni('dst', ['https://cdn/a.png', 'https://cdn/b.png'])
    const result = migrateReferenceImageUrlsToEdges([a, b, dst], [])
    expect(result.edgesCreated).toBe(2)
    expect(result.edges.map((e) => [e.source, e.order])).toEqual([['a', 0], ['b', 1]])
    expect(result.edges.every((e) => e.mode === 'character_ref' && e.target === 'dst')).toBe(true)
    const migratedDst = result.nodes.find((n) => n.id === 'dst')
    expect(migratedDst?.meta?.referenceImageUrls).toBeUndefined() // 全迁走 → 删键
  })

  it('保序：meta 数组顺序决定 order（即便源节点在 nodes 里乱序）', () => {
    const b = imgNode('b', 'https://cdn/b.png')
    const a = imgNode('a', 'https://cdn/a.png')
    const dst = omni('dst', ['https://cdn/a.png', 'https://cdn/b.png']) // a 先
    const result = migrateReferenceImageUrlsToEdges([b, a, dst], [])
    expect(result.edges.map((e) => e.source)).toEqual(['a', 'b']) // 按 meta 序，不按 nodes 序
  })

  it('反查不到源（手动上传 / 源已删）→ 该 URL 保留在 meta，绝不丢', () => {
    const a = imgNode('a', 'https://cdn/a.png')
    const dst = omni('dst', ['https://cdn/a.png', 'https://cdn/uploaded-only.png'])
    const result = migrateReferenceImageUrlsToEdges([a, dst], [])
    expect(result.edgesCreated).toBe(1)
    const migratedDst = result.nodes.find((n) => n.id === 'dst')
    expect(migratedDst?.meta?.referenceImageUrls).toEqual(['https://cdn/uploaded-only.png'])
  })

  it('幂等：再跑一次（meta 已清、边已建）→ 不重复建边、引用不变', () => {
    const a = imgNode('a', 'https://cdn/a.png')
    const dst = omni('dst', ['https://cdn/a.png'])
    const first = migrateReferenceImageUrlsToEdges([a, dst], [])
    const second = migrateReferenceImageUrlsToEdges(first.nodes, first.edges)
    expect(second.edgesCreated).toBe(0)
    expect(second.edges).toBe(first.edges) // 无新边 → 原引用
    expect(second.nodes).toBe(first.nodes) // 无 meta 变更 → 原引用
  })

  it('providerUrl 反查（生成图常见形态：只有 providerUrl）', () => {
    const a = {
      id: 'a', kind: 'image', title: 'a', position: { x: 0, y: 0 }, prompt: '',
      result: { id: 'a-r', type: 'image', providerUrl: 'https://cdn/prov.png', createdAt: 0 },
    } as unknown as GenerationCanvasNode
    const dst = omni('dst', ['https://cdn/prov.png'])
    const result = migrateReferenceImageUrlsToEdges([a, dst], [])
    expect(result.edges).toMatchObject([{ source: 'a', target: 'dst', mode: 'character_ref' }])
  })

  it('无 referenceImageUrls 的节点 → no-op（nodes/edges 原引用，调用方据此判幂等不写盘）', () => {
    const a = imgNode('a', 'https://cdn/a.png')
    const dst = { id: 'dst', kind: 'video', title: 'dst', position: { x: 0, y: 0 }, prompt: '', meta: {} } as GenerationCanvasNode
    const nodes = [a, dst]
    const edges: GenerationCanvasEdge[] = []
    const result = migrateReferenceImageUrlsToEdges(nodes, edges)
    expect(result.edgesCreated).toBe(0)
    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(edges)
  })
})
