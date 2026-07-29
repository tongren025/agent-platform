import type { GenerationCanvasEdge, GenerationCanvasNode } from './generationCanvasTypes'
import { resultUrl } from '../runner/referenceUrl'

export type GenerationNodeContext = {
  node: GenerationCanvasNode | null
  upstream: GenerationCanvasNode[]
  prompt: string
  references: string[]
  resultUrls: string[]
  hasCycle: boolean
}

export function collectNodeContext(
  nodes: GenerationCanvasNode[],
  edges: GenerationCanvasEdge[],
  nodeId: string,
): GenerationNodeContext {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const upstream: GenerationCanvasNode[] = []
  let hasCycle = false

  const visit = (id: string) => {
    if (visiting.has(id)) {
      hasCycle = true
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    edges
      .filter((edge) => edge.target === id)
      .forEach((edge) => {
        visit(edge.source)
        const source = nodeById.get(edge.source)
        if (source && !upstream.some((item) => item.id === source.id)) {
          upstream.push(source)
        }
      })
    visiting.delete(id)
    visited.add(id)
  }

  visit(nodeId)

  const target = nodeById.get(nodeId) || null
  const promptParts = [...upstream, target].filter(Boolean).map((item) => item?.prompt || '').filter(Boolean)
  const references = [...new Set([...upstream, target].flatMap((item) => item?.references || []))]
  // URL 口径单源：referenceUrl.resultUrl（本地持久文件优先，providerUrl 兜底）。不再手写第二份优先级
  // ——三处（chip 显示 / 槽解析 / 生成收集）漂移正是 #4 与「过期临时链」两类 bug 的温床。
  const resultUrls = upstream.map((item) => resultUrl(item.result)).filter(Boolean)

  return {
    node: target,
    upstream,
    prompt: promptParts.join('\n\n'),
    references,
    resultUrls,
    hasCycle,
  }
}

