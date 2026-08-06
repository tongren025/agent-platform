import type { GenerationCanvasNode } from '../model/generationCanvasTypes'
import { getGenerationNodeExecutionKind } from '../model/generationNodeKinds'

/** 可执行的生成节点必须有非空提示词；素材等非生成节点不受此守卫影响。 */
export function isGenerationPromptMissing(
  node: Pick<GenerationCanvasNode, 'kind' | 'prompt'> | null | undefined,
): boolean {
  if (!node || getGenerationNodeExecutionKind(node.kind) === undefined) return false
  return !node.prompt?.trim()
}
