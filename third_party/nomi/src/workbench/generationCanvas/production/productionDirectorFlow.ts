import type { GenerationCanvasNode } from '../model/generationCanvasTypes'

export type ProductionDirectorStageId =
  | 'script'
  | 'storyboard'
  | 'motion'
  | 'keyframe'
  | 'video'
  | 'review'

export type ProductionDirectorStage = {
  id: ProductionDirectorStageId
  complete: boolean
  planned: boolean
  failed: boolean
  running: boolean
}

export type ProductionDirectorProgress = {
  stages: ProductionDirectorStage[]
  current: ProductionDirectorStage
  currentIndex: number
  completedCount: number
  productionCompletedCount: number
  productionStageCount: number
  complete: boolean
  hasFailure: boolean
  running: boolean
}

function productionStage(node: GenerationCanvasNode): string {
  return String(node.meta?.productionStage ?? '').trim().toLowerCase()
}

function searchableNodeText(node: GenerationCanvasNode): string {
  return [
    node.kind,
    node.title,
    node.prompt,
    productionStage(node),
    node.result?.type,
    node.result?.text,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function isSuccessful(node: GenerationCanvasNode, resultType?: 'image' | 'video'): boolean {
  if (node.status !== 'success' && !node.result) return false
  return resultType ? node.result?.type === resultType : true
}

export function matchesProductionDirectorStage(
  node: GenerationCanvasNode,
  stageId: ProductionDirectorStageId,
): boolean {
  const stage = productionStage(node)
  // 导入的生产卡已经有明确阶段时，以结构化元数据为准。长剧本/提示词通常会同时出现
  // “分镜、首帧、视频”等词；继续对全文做模糊命中会让一张文本卡冒充多个已完成阶段。
  if (stage) {
    if (stageId === 'script') return stage === 'script'
    if (stageId === 'storyboard') return stage === 'storyboard'
    if (stageId === 'motion') return stage === 'vid_prompt' || stage === 'motion'
    if (stageId === 'keyframe') return stage === 'img_prompt' || stage === 'keyframe'
    if (stageId === 'video') {
      return stage === 'video' || node.kind === 'video' || node.result?.type === 'video'
    }
    return false
  }
  const text = searchableNodeText(node)
  switch (stageId) {
    case 'script':
      return node.kind === 'text' && /剧本|台词|对白|shot script/.test(text)
    case 'storyboard':
      return /分镜|storyboard/.test(text)
    case 'motion':
      return /动态设计|运镜|镜头运动|视频提示词|camera move/.test(text)
    case 'keyframe':
      return node.kind === 'keyframe' || /首帧|尾帧|关键帧|keyframe/.test(text)
    case 'video':
      return node.kind === 'video' || node.result?.type === 'video'
    case 'review':
      return false
  }
}

function stageState(
  nodes: readonly GenerationCanvasNode[],
  stageId: Exclude<ProductionDirectorStageId, 'review'>,
): Pick<ProductionDirectorStage, 'complete' | 'planned' | 'failed' | 'running'> {
  const matches = nodes.filter((node) => matchesProductionDirectorStage(node, stageId))
  const failed = matches.some((node) => node.status === 'error')
  const running = matches.some((node) => node.status === 'queued' || node.status === 'running')
  let complete = false
  if (stageId === 'script' || stageId === 'motion') {
    // 剧本文本和动态设计本身就是阶段产物，不要求节点进入媒体生成 success。
    complete = matches.length > 0
  } else if (stageId === 'storyboard' || stageId === 'keyframe') {
    complete = matches.some((node) => isSuccessful(node, 'image'))
  } else {
    complete = matches.some((node) => isSuccessful(node, 'video'))
  }
  return {
    complete,
    planned: matches.length > 0,
    failed,
    running,
  }
}

/**
 * 推导单个镜头的真实制作进度。输入必须已经限定为当前镜头节点；
 * timelineSourceNodeIds 来自当前镜头时间线投影，避免其他镜头入轨后误判完成。
 */
export function deriveProductionDirectorProgress(params: {
  nodes: readonly GenerationCanvasNode[]
  timelineSourceNodeIds?: ReadonlySet<string>
}): ProductionDirectorProgress {
  const { nodes, timelineSourceNodeIds = new Set<string>() } = params
  const productionStages: ProductionDirectorStage[] = (
    ['script', 'storyboard', 'motion', 'keyframe', 'video'] as const
  ).map((id) => ({
    id,
    ...stageState(nodes, id),
  }))
  const successfulVideoIds = new Set(
    nodes
      .filter((node) => matchesProductionDirectorStage(node, 'video') && isSuccessful(node, 'video'))
      .map((node) => node.id),
  )
  const reviewComplete = Array.from(successfulVideoIds).some((id) => timelineSourceNodeIds.has(id))
  const review: ProductionDirectorStage = {
    id: 'review',
    complete: reviewComplete,
    planned: successfulVideoIds.size > 0,
    failed: false,
    running: false,
  }
  const stages = [...productionStages, review]
  const firstIncompleteIndex = stages.findIndex((stage) => !stage.complete)
  const currentIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : stages.length - 1
  const completedCount = stages.filter((stage) => stage.complete).length
  return {
    stages,
    current: stages[currentIndex],
    currentIndex,
    completedCount,
    productionCompletedCount: productionStages.filter((stage) => stage.complete).length,
    productionStageCount: productionStages.length,
    complete: completedCount === stages.length,
    hasFailure: stages.some((stage) => stage.failed),
    running: stages.some((stage) => stage.running),
  }
}

export type ProductionShotStatus =
  | 'needsAttention'
  | 'running'
  | 'complete'
  | 'review'
  | 'videoPlanned'
  | 'videoMissing'
  | 'stageMissing'

export function productionShotStatus(progress: ProductionDirectorProgress): ProductionShotStatus {
  if (progress.hasFailure) return 'needsAttention'
  if (progress.running) return 'running'
  if (progress.complete) return 'complete'
  if (progress.current.id === 'review') return 'review'
  if (progress.current.id === 'video') return progress.current.planned ? 'videoPlanned' : 'videoMissing'
  return 'stageMissing'
}
