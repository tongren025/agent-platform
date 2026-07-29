import { describe, expect, it } from 'vitest'
import { reconcileProposal } from './reconcile'

const nodes = [
  { id: 'real-1', kind: 'image', title: '镜头 1', prompt: 'sunrise', meta: { modelKey: 'm1', aspect_ratio: '16:9' } },
  { id: 'real-2', kind: 'video', title: '镜头 2', prompt: 'sunset' },
]
const edges = [{ source: 'real-1', target: 'real-2' }]
const clientIdToNodeId = { c1: 'real-1', c2: 'real-2' }

describe('reconcileProposal — S6-3 对账纯函数(N12)', () => {
  it('执行与批准一致 → ok,零偏差', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: {
            nodes: [
              { clientId: 'c1', kind: 'image', title: '镜头 1', prompt: 'sunrise', modelKey: 'm1', params: { aspect_ratio: '16:9' } },
              { clientId: 'c2', kind: 'video', title: '镜头 2', prompt: 'sunset' },
            ],
          },
          result: null,
        },
        {
          toolName: 'connect_canvas_edges',
          effectiveArgs: { edges: [{ sourceClientId: 'c1', targetClientId: 'c2' }] },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(result).toEqual({ ok: true, deviations: [] })
  })

  it('prompt 被改 → 偏差带 expected/actual', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: { nodes: [{ clientId: 'c1', kind: 'image', title: '镜头 1', prompt: '用户批准的版本' }] },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(result.ok).toBe(false)
    expect(result.deviations).toEqual([
      { where: '镜头 1', field: '提示词', expected: '用户批准的版本', actual: 'sunrise' },
    ])
  })

  it('批准的 modelKey 被校验丢弃(回退自动选)→ 必须可见,不在白名单', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: { nodes: [{ clientId: 'c2', kind: 'video', title: '镜头 2', prompt: 'sunset', modelKey: 'ghost-model' }] },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(result.ok).toBe(false)
    expect(result.deviations[0]).toMatchObject({ where: '镜头 2', field: '模型', expected: 'ghost-model' })
  })

  it('position/categoryId/空标题兜底在派生白名单内 → 不算偏差', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: {
            // 批准时带了 position,执行被网格 derive 覆盖;title 为空被兜底「镜头 1」——都不报。
            nodes: [{ clientId: 'c1', kind: 'image', title: '', prompt: 'sunrise', position: { x: 9999, y: 9999 } }],
          },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(result.ok).toBe(true)
  })

  it('批准的边没连上 → 偏差', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'connect_canvas_edges',
          effectiveArgs: { edges: [{ sourceClientId: 'c2', targetClientId: 'c1' }] },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges, // 只有 real-1→real-2,反向不存在
    })
    expect(result.ok).toBe(false)
    expect(result.deviations[0].field).toBe('引用边')
  })

  it('边没连上 → where 用节点标题(不是原始 id)+ 带执行侧跳过原因(完整版重设计)', () => {
    const result = reconcileProposal({
      steps: [
        {
          toolName: 'connect_canvas_edges',
          effectiveArgs: { edges: [{ sourceClientId: 'c2', targetClientId: 'c1' }] }, // real-2→real-1 不存在
          result: { skippedEdges: [{ source: 'real-2', target: 'real-1', mode: 'first_frame', reason: 'unsupported_reference' }] },
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(result.deviations[0]).toMatchObject({
      where: '「镜头 2」→「镜头 1」', // 标题，非 real-2 / real-1
      field: '引用边',
      reason: '所选模型不支持这种参考连接',
    })
  })

  it('create 步随计划携带的边（节点+边一次批准）→ 与节点同步对账', () => {
    const ok = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: {
            nodes: [
              { clientId: 'c1', kind: 'image', title: '镜头 1', prompt: 'sunrise', modelKey: 'm1', params: { aspect_ratio: '16:9' } },
              { clientId: 'c2', kind: 'video', title: '镜头 2', prompt: 'sunset' },
            ],
            edges: [{ sourceClientId: 'c1', targetClientId: 'c2' }],
          },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(ok).toEqual({ ok: true, deviations: [] })

    const bad = reconcileProposal({
      steps: [
        {
          toolName: 'create_canvas_nodes',
          effectiveArgs: {
            nodes: [{ clientId: 'c1', kind: 'image', title: '镜头 1', prompt: 'sunrise', modelKey: 'm1', params: { aspect_ratio: '16:9' } }],
            edges: [{ sourceClientId: 'c2', targetClientId: 'c1' }], // 反向边不存在
          },
          result: null,
        },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(bad.ok).toBe(false)
    expect(bad.deviations[0].field).toBe('引用边')
  })

  it('边语义(mode)对账：批准的语义被换 → 偏差;计划未指定 → 通配兼容', () => {
    const modeEdges = [{ source: 'real-1', target: 'real-2', mode: 'character_ref' }]
    const ok = reconcileProposal({
      steps: [
        { toolName: 'connect_canvas_edges', effectiveArgs: { edges: [{ sourceClientId: 'c1', targetClientId: 'c2', mode: 'character_ref' }] }, result: null },
      ],
      clientIdToNodeId,
      nodes,
      edges: modeEdges,
    })
    expect(ok).toEqual({ ok: true, deviations: [] })

    const swapped = reconcileProposal({
      steps: [
        { toolName: 'connect_canvas_edges', effectiveArgs: { edges: [{ sourceClientId: 'c1', targetClientId: 'c2', mode: 'first_frame' }] }, result: null },
      ],
      clientIdToNodeId,
      nodes,
      edges: modeEdges,
    })
    expect(swapped.ok).toBe(false)
    expect(swapped.deviations[0]).toMatchObject({ field: '边语义', expected: 'first_frame', actual: 'character_ref' })

    const wildcard = reconcileProposal({
      steps: [
        { toolName: 'connect_canvas_edges', effectiveArgs: { edges: [{ sourceClientId: 'c1', targetClientId: 'c2' }] }, result: null },
      ],
      clientIdToNodeId,
      nodes,
      edges: modeEdges,
    })
    expect(wildcard.ok).toBe(true)
  })

  it('跨提议 clientId 经 resolveExternalId 回退解析 → 不再误报「未连接」(2026-06-12 bug A)', () => {
    // 模拟 connect 在独立提议执行:本批 clientIdToNodeId 为空,真实映射只在全局 registry。
    const registry = new Map([['n1', 'real-1'], ['n2', 'real-2']])
    const withFallback = reconcileProposal({
      steps: [
        {
          toolName: 'connect_canvas_edges',
          effectiveArgs: { edges: [{ sourceClientId: 'n1', targetClientId: 'n2' }] },
          result: null,
        },
      ],
      clientIdToNodeId: {},
      nodes,
      edges,
      resolveExternalId: (raw) => registry.get(raw) ?? raw,
    })
    expect(withFallback).toEqual({ ok: true, deviations: [] })

    // 不带回退(旧行为)→ 拿计划 id 找边必然误报——锁住回退是必需的。
    const withoutFallback = reconcileProposal({
      steps: [
        {
          toolName: 'connect_canvas_edges',
          effectiveArgs: { edges: [{ sourceClientId: 'n1', targetClientId: 'n2' }] },
          result: null,
        },
      ],
      clientIdToNodeId: {},
      nodes,
      edges,
    })
    expect(withoutFallback.ok).toBe(false)
  })

  it('set_node_prompt / delete 的后态核对', () => {
    const ok = reconcileProposal({
      steps: [
        { toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'real-1', prompt: 'sunrise' }, result: null },
        { toolName: 'delete_canvas_nodes', effectiveArgs: { nodeIds: ['gone-1'] }, result: null },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(ok.ok).toBe(true)

    const bad = reconcileProposal({
      steps: [
        { toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'real-1', prompt: '没写进去的' }, result: null },
        { toolName: 'delete_canvas_nodes', effectiveArgs: { nodeIds: ['real-2'] }, result: null },
      ],
      clientIdToNodeId,
      nodes,
      edges,
    })
    expect(bad.ok).toBe(false)
    expect(bad.deviations).toHaveLength(2)
  })
})
