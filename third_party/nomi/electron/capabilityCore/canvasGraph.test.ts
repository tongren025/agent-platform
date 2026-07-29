import { describe, expect, it } from 'vitest'

import {
  addNodes,
  connectNodes,
  deleteNodes,
  emptyCanvasSnapshot,
  normalizeSnapshot,
  readCanvas,
  setNodePrompt,
} from './canvasGraph'

describe('capabilityCore/canvasGraph', () => {
  it('addNodes 给每个节点稳定唯一 id 且不重叠堆原点', () => {
    const { snapshot, ids } = addNodes(emptyCanvasSnapshot(), [
      { kind: 'text', prompt: '一句脚本' },
      { kind: 'image', title: '镜头 1' },
    ])
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    expect(snapshot.nodes).toHaveLength(2)
    expect(snapshot.nodes[0].kind).toBe('text')
    expect(snapshot.nodes[0].prompt).toBe('一句脚本')
    expect(snapshot.nodes[1].title).toBe('镜头 1')
    // 不给坐标时纵向错开，y 严格递增（防「布局无避让」全堆原点）。
    expect(snapshot.nodes[1].position.y).toBeGreaterThan(snapshot.nodes[0].position.y)
  })

  it('addNodes 不可变——原快照不被改写', () => {
    const before = emptyCanvasSnapshot()
    addNodes(before, [{ kind: 'text' }])
    expect(before.nodes).toHaveLength(0)
  })

  it('connectNodes 按 target 入边数赋递增 order（保住 character1..N 顺序）', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'image' }, { kind: 'image' }, { kind: 'video' }])
    const [a, b, target] = built.ids
    const { snapshot, edgeIds } = connectNodes(built.snapshot, [
      { source: a, target, mode: 'character_ref' },
      { source: b, target, mode: 'character_ref' },
    ])
    expect(edgeIds).toHaveLength(2)
    const edges = snapshot.edges.filter((edge) => edge.target === target)
    expect(edges.map((edge) => edge.order)).toEqual([0, 1])
  })

  it('connectNodes 跳过不存在端点 / 自连 / 重复，并给出原因', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'image' }, { kind: 'video' }])
    const [a, b] = built.ids
    const first = connectNodes(built.snapshot, [{ source: a, target: b }])
    const second = connectNodes(first.snapshot, [
      { source: a, target: b }, // 重复
      { source: a, target: 'ghost' }, // 端点不存在
      { source: a, target: a }, // 自连
    ])
    expect(second.edgeIds).toHaveLength(0)
    expect(second.skipped.map((item) => item.reason).sort()).toEqual(['不能自连', '端点节点不存在', '重复连线'])
  })

  it('connectNodes 非法 mode 落回 reference', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'image' }, { kind: 'video' }])
    const { snapshot } = connectNodes(built.snapshot, [{ source: built.ids[0], target: built.ids[1], mode: 'bogus' }])
    expect(snapshot.edges[0].mode).toBe('reference')
  })

  it('setNodePrompt 改提示词与标题；未知节点 changed=false', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'text' }])
    const ok = setNodePrompt(built.snapshot, built.ids[0], '新提示', '新标题')
    expect(ok.changed).toBe(true)
    expect(ok.snapshot.nodes[0].prompt).toBe('新提示')
    expect(ok.snapshot.nodes[0].title).toBe('新标题')
    const miss = setNodePrompt(built.snapshot, 'ghost', 'x')
    expect(miss.changed).toBe(false)
  })

  it('deleteNodes 同时清掉关联入边出边，无悬挂边', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'image' }, { kind: 'video' }, { kind: 'image' }])
    const [a, b, c] = built.ids
    const connected = connectNodes(built.snapshot, [
      { source: a, target: b },
      { source: c, target: b },
    ])
    const { snapshot, deleted } = deleteNodes(connected.snapshot, [b])
    expect(deleted).toEqual([b])
    expect(snapshot.nodes.map((node) => node.id).sort()).toEqual([a, c].sort())
    expect(snapshot.edges).toHaveLength(0)
  })

  it('normalizeSnapshot 把坏数据降级为空，过滤无 id 的节点/边', () => {
    expect(normalizeSnapshot(null).nodes).toHaveLength(0)
    const dirty = normalizeSnapshot({
      nodes: [{ id: 'n1', kind: 'text', title: 't', position: { x: 0, y: 0 } }, { kind: 'broken' }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }, { id: 'bad' }],
    })
    expect(dirty.nodes).toHaveLength(1)
    expect(dirty.edges).toHaveLength(1)
  })

  it('readCanvas 只暴露决策所需精简字段，不灌 raw', () => {
    const built = addNodes(emptyCanvasSnapshot(), [{ kind: 'text', prompt: 'p', title: 't' }])
    const view = readCanvas(built.snapshot)
    expect(view.nodes[0]).toMatchObject({ kind: 'text', prompt: 'p', title: 't', status: 'idle', hasResult: false })
    expect(view.nodes[0]).not.toHaveProperty('raw')
  })
})
