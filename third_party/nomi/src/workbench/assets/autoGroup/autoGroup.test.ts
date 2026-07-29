import { describe, it, expect } from 'vitest'
import type { GenerationCanvasNode, GenerationCanvasEdge } from '../../generationCanvas/model/generationCanvasTypes'
import {
  classifyZone,
  toFindItems,
  resolveVariantRoot,
  stackVariants,
  parseGroupingResult,
  extractJsonObject,
  deriveGroupName,
  groupFilmStacksByCards,
  buildGroupingPrompt,
  type FindItem,
  type VariantStack,
} from './autoGroup'

function node(partial: Partial<GenerationCanvasNode> & { id: string }): GenerationCanvasNode {
  return {
    kind: 'image',
    title: '',
    position: { x: 0, y: 0 },
    ...partial,
  } as unknown as GenerationCanvasNode
}
const gen = (id: string, extra: Partial<GenerationCanvasNode> = {}) =>
  node({ id, result: { type: 'image', thumbnailUrl: `t-${id}`, provenance: { prompt: 'p', timestamp: 1 } } as never, ...extra })

describe('classifyZone', () => {
  it('导入素材(kind=asset)=参考', () => {
    expect(classifyZone(node({ id: 'a', kind: 'asset' }))).toBe('reference')
  })
  it('生成节点=成片', () => {
    expect(classifyZone(gen('s'))).toBe('film')
  })
  it('meta.source=upload 也算参考', () => {
    expect(classifyZone(node({ id: 'u', meta: { source: 'upload' } }))).toBe('reference')
  })
})

describe('toFindItems', () => {
  const edges: GenerationCanvasEdge[] = []
  it('剔除配料卡(character/scene/prop)与无缩略图空节点', () => {
    const nodes = [
      gen('shot1'),
      node({ id: 'char1', kind: 'character', result: { type: 'image', thumbnailUrl: 'c' } as never }),
      node({ id: 'empty' }), // 无 result → 无缩略图
    ]
    const items = toFindItems(nodes, edges)
    expect(items.map((i) => i.nodeId)).toEqual(['shot1'])
  })
  it('挂载卡反查进 mounted(who/where)', () => {
    const nodes = [
      gen('shot1'),
      node({ id: 'lin', kind: 'character', title: '林夏', result: { type: 'image', thumbnailUrl: 'c' } as never }),
    ]
    const e: GenerationCanvasEdge[] = [{ id: 'e1', source: 'lin', target: 'shot1' } as GenerationCanvasEdge]
    const items = toFindItems(nodes, e)
    expect(items[0].mounted.map((m) => m.title)).toEqual(['林夏'])
  })
  it('用户标记从 meta.mark 取', () => {
    const items = toFindItems([gen('s', { meta: { mark: '主镜' } })], edges)
    expect(items[0].mark).toBe('主镜')
  })
})

describe('resolveVariantRoot', () => {
  it('顺 derivedFrom 找到根', () => {
    const v1 = gen('v1')
    const v2 = gen('v2', { derivedFrom: 'v1' })
    const v3 = gen('v3', { derivedFrom: 'v2' })
    const byId = new Map([v1, v2, v3].map((n) => [n.id, n]))
    expect(resolveVariantRoot(v3, byId)).toBe('v1')
  })
  it('环不死循环', () => {
    const a = gen('a', { derivedFrom: 'b' })
    const b = gen('b', { derivedFrom: 'a' })
    const byId = new Map([a, b].map((n) => [n.id, n]))
    expect(resolveVariantRoot(a, byId)).toBe('b') // 走一步到 b 后发现环停下
  })
})

describe('stackVariants', () => {
  it('同根归一摞，封面=最新', () => {
    const items = toFindItems(
      [
        gen('v1', { result: { type: 'image', thumbnailUrl: 't1', provenance: { timestamp: 1 } } as never }),
        gen('v2', { derivedFrom: 'v1', result: { type: 'image', thumbnailUrl: 't2', provenance: { timestamp: 5 } } as never }),
        gen('other'),
      ],
      [],
    )
    const stacks = stackVariants(items)
    const big = stacks.find((s) => s.items.length > 1)!
    expect(big.rootId).toBe('v1')
    expect(big.cover.nodeId).toBe('v2') // 时间 5 > 1
    expect(stacks).toHaveLength(2)
  })
})

describe('deriveGroupName', () => {
  it('场景·角色', () => {
    expect(deriveGroupName([{ id: 's', kind: 'scene', title: '雪地' }, { id: 'c', kind: 'character', title: '林夏' }])).toBe('雪地 · 林夏')
  })
  it('只角色', () => {
    expect(deriveGroupName([{ id: 'c', kind: 'character', title: '林夏' }])).toBe('林夏')
  })
  it('多角色用+连', () => {
    expect(deriveGroupName([{ id: 'a', kind: 'character', title: '林夏' }, { id: 'b', kind: 'character', title: '陈默' }])).toBe('林夏+陈默')
  })
})

describe('groupFilmStacksByCards 确定性分组(零模型)', () => {
  const mk = (id: string, cards: VariantStack['cover']['mounted'], createdAt = 0): VariantStack => {
    const cover = { nodeId: id, title: id, zone: 'film', createdAt, mounted: cards, variantRootId: id, categoryId: 'shots' } as FindItem
    return { rootId: id, cover, items: [cover] }
  }
  const lin = { id: 'lin', kind: 'character' as const, title: '林夏' }
  const snow = { id: 'snow', kind: 'scene' as const, title: '雪地' }
  it('同卡组合≥2 成命名组，单个落未分组', () => {
    const { groups, ungrouped } = groupFilmStacksByCards([
      mk('a', [snow, lin]),
      mk('b', [snow, lin]),
      mk('c', [lin]), // 只林夏，单个
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('雪地 · 林夏')
    expect(groups[0].stacks).toHaveLength(2)
    expect(ungrouped.map((s) => s.rootId)).toEqual(['c'])
  })
  it('没挂卡的落未分组(谁/在哪未知,等模型读提示词)', () => {
    const { groups, ungrouped } = groupFilmStacksByCards([mk('x', []), mk('y', [])])
    expect(groups).toHaveLength(0)
    expect(ungrouped).toHaveLength(2)
  })
  it('组按张数降序', () => {
    const chen = { id: 'chen', kind: 'character' as const, title: '陈默' }
    const { groups } = groupFilmStacksByCards([
      mk('a', [lin]), mk('b', [lin]), mk('c', [lin]),
      mk('d', [chen]), mk('e', [chen]),
    ])
    expect(groups.map((g) => g.name)).toEqual(['林夏', '陈默'])
  })
})

describe('autoGroupName 合并(AI 读提示词归的组)', () => {
  const mk = (id: string, cards: VariantStack['cover']['mounted'], autoGroupName?: string): VariantStack => {
    const cover = { nodeId: id, title: id, zone: 'film', createdAt: 0, mounted: cards, variantRootId: id, categoryId: 'shots', autoGroupName } as FindItem
    return { rootId: id, cover, items: [cover] }
  }
  const lin = { id: 'lin', kind: 'character' as const, title: '林夏' }
  it('没连卡但有 AI 组名 → 按 AI 名归组', () => {
    const { groups } = groupFilmStacksByCards([mk('a', [], '雨夜街头'), mk('b', [], '雨夜街头')])
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('雨夜街头')
  })
  it('连卡优先于 AI 名(卡是确定事实)', () => {
    const { groups } = groupFilmStacksByCards([mk('a', [lin], '别的名'), mk('b', [lin], '别的名')])
    expect(groups[0].name).toBe('林夏')
  })
  it('卡组与 AI 组并存', () => {
    const { groups } = groupFilmStacksByCards([
      mk('a', [lin]), mk('b', [lin]),
      mk('c', [], '雨夜'), mk('d', [], '雨夜'),
    ])
    expect(groups.map((g) => g.name).sort()).toEqual(['林夏', '雨夜'])
  })
})

describe('buildGroupingPrompt', () => {
  it('含每条 id 与提示词 + JSON 格式', () => {
    const p = buildGroupingPrompt([{ nodeId: 'n1', prompt: '林夏雪地回头' }, { nodeId: 'n2', title: '咖啡馆' }])
    expect(p).toContain('id=n1')
    expect(p).toContain('林夏雪地回头')
    expect(p).toContain('id=n2')
    expect(p).toContain('"groups"')
  })
})

describe('parseGroupingResult 防错闸', () => {
  const ids = ['n1', 'n2', 'n3', 'n4']
  it('正常分组', () => {
    const raw = JSON.stringify({ groups: [{ name: '雪地里的林夏', nodeIds: ['n1', 'n2'], confidence: 0.9 }] })
    const r = parseGroupingResult(raw, ids)
    expect(r.groups).toEqual([{ name: '雪地里的林夏', nodeIds: ['n1', 'n2'] }])
    expect(r.ungroupedIds).toEqual(['n3', 'n4'])
  })
  it('低置信度 → 落未分组', () => {
    const raw = JSON.stringify({ groups: [{ name: 'x', nodeIds: ['n1', 'n2'], confidence: 0.4 }] })
    const r = parseGroupingResult(raw, ids)
    expect(r.groups).toHaveLength(0)
    expect(r.ungroupedIds).toHaveLength(4)
  })
  it('单张不成组 → 落未分组', () => {
    const raw = JSON.stringify({ groups: [{ name: 'x', nodeIds: ['n1'], confidence: 0.9 }] })
    expect(parseGroupingResult(raw, ids).groups).toHaveLength(0)
  })
  it('过滤无效 id 与跨组重复', () => {
    const raw = JSON.stringify({
      groups: [
        { name: 'A', nodeIds: ['n1', 'n2', 'ZZZ'], confidence: 0.9 },
        { name: 'B', nodeIds: ['n2', 'n3'], confidence: 0.9 }, // n2 已被 A 占
      ],
    })
    const r = parseGroupingResult(raw, ids)
    expect(r.groups[0].nodeIds).toEqual(['n1', 'n2'])
    expect(r.groups[1]).toBeUndefined() // B 去掉 n2 后只剩 n3，单张不成组
    expect(r.ungroupedIds.sort()).toEqual(['n3', 'n4'])
  })
  it('带```json围栏 + 前后废话也能解析', () => {
    const raw = '好的：\n```json\n{"groups":[{"name":"咖啡馆","nodeIds":["n3","n4"],"confidence":0.8}]}\n```\n完成'
    expect(parseGroupingResult(raw, ids).groups[0].name).toBe('咖啡馆')
  })
  it('垃圾输入 → 全部未分组(绝不假装分好)', () => {
    expect(parseGroupingResult('模型挂了', ids).ungroupedIds).toEqual(ids)
    expect(extractJsonObject('no json here')).toBeNull()
  })
})
