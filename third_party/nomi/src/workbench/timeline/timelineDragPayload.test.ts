import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import { decodeTimelineGenerationNodeDragPayload, encodeTimelineGenerationNodeDragPayload } from './timelineDragPayload'

function node(overrides: Partial<GenerationCanvasNode> = {}): GenerationCanvasNode {
  return {
    id: 'node-1',
    kind: 'video',
    title: 'shot',
    position: { x: 0, y: 0 },
    result: { id: 'old-result', type: 'video', url: 'nomi-local://old.mp4', durationSeconds: 5, createdAt: 1 },
    ...overrides,
  }
}

describe('timeline generation node drag payload', () => {
  it('carries nodeId separately so drop handlers can resolve the latest store node', () => {
    const decoded = decodeTimelineGenerationNodeDragPayload(encodeTimelineGenerationNodeDragPayload(node(), 'result-1'))

    expect(decoded?.nodeId).toBe('node-1')
    expect(decoded?.node.id).toBe('node-1')
    expect(decoded?.resultId).toBe('result-1')
  })

  it('keeps compatibility with old payloads that only serialized node.id', () => {
    const decoded = decodeTimelineGenerationNodeDragPayload(JSON.stringify({ kind: 'generationNode', node: node() }))

    expect(decoded?.nodeId).toBe('node-1')
    expect(decoded?.node.id).toBe('node-1')
  })
})
