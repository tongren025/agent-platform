// 画布实体 id 生成器（纯函数，依赖 Date.now/Math.random）。从 generationCanvasStore.ts 抽出。
import type { CategoryId, GenerationNodeKind } from '../model/generationCanvasTypes'

export const CLIPBOARD_OFFSET = 36

export function createNodeId(kind: GenerationNodeKind): string {
  return `gen-v2-${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function createGroupId(categoryId: CategoryId): string {
  return `group-${categoryId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function createRunId(nodeId: string): string {
  return `run-${nodeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createClipboardNodeId(nodeId: string): string {
  return `${nodeId}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
