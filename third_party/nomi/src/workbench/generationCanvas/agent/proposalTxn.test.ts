import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyProposalBatch } from './proposalTxn'
import { useGenerationCanvasStore } from '../store/generationCanvasStore'
import { setCanvasEventSinkForTests, type CanvasShadowEvent } from '../events/canvasEventEmitter'
import { __resetCanvasUndoJournalForTests, getHistoryFlags } from '../events/canvasUndoJournal'

// 画布纯图状态(I3 逐字节比对的对象;选区/瞬态不在比对面)。
function projection() {
  const state = useGenerationCanvasStore.getState()
  return JSON.parse(JSON.stringify({ nodes: state.nodes, edges: state.edges, groups: state.groups }))
}

let captured: CanvasShadowEvent[] = []

beforeEach(() => {
  useGenerationCanvasStore.getState().restoreSnapshot({ nodes: [], edges: [], selectedNodeIds: [], groups: [] })
  __resetCanvasUndoJournalForTests()
  captured = []
  setCanvasEventSinkForTests((events) => captured.push(...events))
})

afterEach(() => {
  setCanvasEventSinkForTests(null)
})

const createStep = (clientIds: string[]) => ({
  toolCallId: 'tc-create',
  toolName: 'create_canvas_nodes',
  effectiveArgs: {
    summary: '测试批',
    nodes: clientIds.map((clientId, index) => ({
      clientId,
      kind: 'image',
      title: `镜头 ${index + 1}`,
      prompt: `prompt ${clientId}`,
    })),
  },
})

describe('applyProposalBatch — S6-2 提议事务状态机', () => {
  it('全成 → committed:create+connect 落地,txn.committed 携 clientIdToNodeId', async () => {
    const outcome = await applyProposalBatch([
      createStep(['c1', 'c2']),
      {
        toolCallId: 'tc-connect',
        toolName: 'connect_canvas_edges',
        effectiveArgs: { edges: [{ sourceClientId: 'c1', targetClientId: 'c2' }] },
      },
    ])

    expect(outcome.status).toBe('committed')
    const state = useGenerationCanvasStore.getState()
    expect(state.nodes).toHaveLength(2)
    expect(state.edges).toHaveLength(1)
    if (outcome.status === 'committed') {
      expect(Object.keys(outcome.clientIdToNodeId)).toEqual(['c1', 'c2'])
    }
    const committed = captured.find((event) => event.type === 'agent.txn.committed')
    expect(committed).toBeTruthy()
    expect(committed!.payload.proposalId).toBe(outcome.proposalId)
    expect((committed!.payload.clientIdToNodeId as Record<string, string>).c1).toBe(state.nodes[0].id)
    // I4:committed 必带对账结果(S6-3)。
    expect((committed!.payload.reconciliation as { ok: boolean }).ok).toBe(true)
    if (outcome.status === 'committed') expect(outcome.reconciliation.ok).toBe(true)
  })

  it('事务期间画布事件统一携 source:agent + proposalId + 共享 txnId(I1 数据前提)', async () => {
    const outcome = await applyProposalBatch([createStep(['c1', 'c2'])])
    const canvasEvents = captured.filter((event) => event.type.startsWith('canvas.'))
    expect(canvasEvents.length).toBeGreaterThan(0)
    for (const event of canvasEvents) {
      expect(event.source).toBe('agent')
      expect(event.proposalId).toBe(outcome.proposalId)
      expect(event.txnId).toBe(`txn_${outcome.proposalId}`)
    }
  })

  it('整笔提议 = 一个 Cmd+Z 步(批准是一次用户意志,§6.2 粒度)', async () => {
    await applyProposalBatch([createStep(['c1', 'c2', 'c3'])])
    expect(useGenerationCanvasStore.getState().nodes).toHaveLength(3)
    expect(getHistoryFlags().canUndo).toBe(true)
    useGenerationCanvasStore.getState().undo()
    // 一次撤销整批全消,而不是只退一个节点。
    expect(useGenerationCanvasStore.getState().nodes).toHaveLength(0)
    useGenerationCanvasStore.getState().redo()
    expect(useGenerationCanvasStore.getState().nodes).toHaveLength(3)
  })

  it('中途失败 → aborted:补偿回滚零半截,画布投影与提议前逐字节相等(I3)', async () => {
    // 预置一个用户节点,确认补偿不误伤。
    useGenerationCanvasStore.getState().addNode({ kind: 'image', title: '用户自己的', prompt: 'mine' })
    const before = projection()
    captured = []

    const outcome = await applyProposalBatch([
      createStep(['c1', 'c2']),
      // set_node_prompt 对不存在节点抛 node_not_found —— 注入中途失败。
      { toolCallId: 'tc-fail', toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'ghost-404', prompt: 'x' } },
    ])

    expect(outcome.status).toBe('aborted')
    if (outcome.status === 'aborted') {
      expect(outcome.failedIndex).toBe(1)
      expect(outcome.compensatedNodeIds).toHaveLength(2)
    }
    expect(projection()).toEqual(before)
    const aborted = captured.find((event) => event.type === 'agent.txn.aborted')
    expect(aborted).toBeTruthy()
    expect(aborted!.payload.reason).toContain('node_not_found')
    expect((aborted!.payload.compensatedNodeIds as string[])).toHaveLength(2)
    expect(captured.some((event) => event.type === 'agent.txn.committed')).toBe(false)
  })

  it('中途失败 → 已成功的 set_node_prompt 必须回滚(I3 不只删新建节点)', async () => {
    useGenerationCanvasStore.getState().addNode({ kind: 'image', title: '用户节点', prompt: '原始提示词' })
    const nodeId = useGenerationCanvasStore.getState().nodes[0].id
    const before = projection()

    const outcome = await applyProposalBatch([
      { toolCallId: 'tc-edit', toolName: 'set_node_prompt', effectiveArgs: { nodeId, prompt: 'AI 改的提示词' } },
      { toolCallId: 'tc-fail', toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'ghost-404', prompt: 'x' } },
    ])

    expect(outcome.status).toBe('aborted')
    // 关键(P0-7):第 0 步成功改了既有节点 prompt,abort 必须用 restore-prompt 还原——
    // 旧 abort 只删 createdNodeIds,这个改写被永久留下(I3 破)。
    expect(useGenerationCanvasStore.getState().nodes[0].prompt).toBe('原始提示词')
    expect(projection()).toEqual(before)
  })

  it('中途失败 → 已成功的 delete_canvas_nodes 必须恢复(I3 restore-graph 不能攒了不用)', async () => {
    useGenerationCanvasStore.getState().addNode({ kind: 'image', title: '会被AI删', prompt: 'keep-me' })
    const nodeId = useGenerationCanvasStore.getState().nodes[0].id
    const before = projection()

    const outcome = await applyProposalBatch([
      { toolCallId: 'tc-del', toolName: 'delete_canvas_nodes', effectiveArgs: { nodeIds: [nodeId] } },
      { toolCallId: 'tc-fail', toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'ghost-404', prompt: 'x' } },
    ])

    expect(outcome.status).toBe('aborted')
    // 关键(P0-7):AI 删了用户节点、事务又失败,abort 必须把节点恢复回来。
    expect(useGenerationCanvasStore.getState().nodes).toHaveLength(1)
    expect(projection()).toEqual(before)
  })

  it('aborted 后 Cmd+Z 不会复活半截态(事务内 barrier 已拔)', async () => {
    useGenerationCanvasStore.getState().addNode({ kind: 'image', title: '用户自己的', prompt: 'mine' })
    const before = projection()

    await applyProposalBatch([
      createStep(['c1']),
      { toolCallId: 'tc-fail', toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'ghost-404', prompt: 'x' } },
    ])
    expect(projection()).toEqual(before)

    // 撤销:应回退「用户自己的」那一步(addNode 的 barrier),绝不停在半截态(1 个 AI 节点)上。
    useGenerationCanvasStore.getState().undo()
    expect(useGenerationCanvasStore.getState().nodes).toHaveLength(0)
  })

  it('第一步就失败 → aborted 无可补偿,画布零变化', async () => {
    const before = projection()
    const outcome = await applyProposalBatch([
      { toolCallId: 'tc-fail', toolName: 'set_node_prompt', effectiveArgs: { nodeId: 'ghost-404', prompt: 'x' } },
    ])
    expect(outcome.status).toBe('aborted')
    if (outcome.status === 'aborted') expect(outcome.compensatedNodeIds).toHaveLength(0)
    expect(projection()).toEqual(before)
  })

  it('事务结束后环境上下文还原:后续用户手势仍是 source:user 无 proposalId', async () => {
    await applyProposalBatch([createStep(['c1'])])
    captured = []
    useGenerationCanvasStore.getState().addNode({ kind: 'image', title: '后续', prompt: 'later' })
    const added = captured.find((event) => event.type === 'canvas.node.added')
    expect(added!.source).toBe('user')
    expect(added!.proposalId).toBeUndefined()
  })
})
