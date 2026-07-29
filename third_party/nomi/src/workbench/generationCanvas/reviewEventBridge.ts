// 技术自检结果 → 节点 meta(harness S4-2b 渲染层胶水)。
// verdict 是终态事实,写进 node.meta.technicalReview 随项目持久化;⚠ 徽标据此渲染。
// 纪律:只标记——不动结果、不弹窗打断(N5/N23 的"自检"是提醒不是裁决)。
import { getDesktopBridge } from '../../desktop/bridge'
import { useGenerationCanvasStore } from './store/generationCanvasStore'

export type NodeTechnicalReview = {
  verdict: 'ok' | 'suspect'
  checks: { id: string; suspect: boolean; detail: string }[]
  checkedAt: number
}

type ReviewEventPayload = {
  projectId?: string
  nodeId?: string
  verdict?: { suspect?: boolean; checks?: { id: string; suspect: boolean; detail: string }[] }
}

/** 订阅主进程自检广播,把 verdict 写进节点 meta。返回解除函数。 */
export function initReviewEventBridge(): () => void {
  const onEvent = getDesktopBridge()?.review?.onEvent
  if (!onEvent) return () => {}
  return onEvent((raw) => {
    const payload = (raw || {}) as ReviewEventPayload
    const nodeId = String(payload.nodeId || '')
    if (!nodeId || !payload.verdict) return
    const state = useGenerationCanvasStore.getState()
    const node = state.nodes.find((candidate) => candidate.id === nodeId)
    if (!node) return
    const review: NodeTechnicalReview = {
      verdict: payload.verdict.suspect ? 'suspect' : 'ok',
      checks: Array.isArray(payload.verdict.checks) ? payload.verdict.checks : [],
      checkedAt: Date.now(),
    }
    state.updateNode(nodeId, { meta: { ...(node.meta || {}), technicalReview: review } })
  })
}
