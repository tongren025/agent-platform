import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'

export type GuidedProductionStageId =
  | 'idea'
  | 'script'
  | 'style'
  | 'character'
  | 'scene'
  | 'storyboard'
  | 'motion'
  | 'keyframe'
  | 'video'
  | 'review'

export type GuidedProductionStage = {
  id: GuidedProductionStageId
  workspace: 'creation' | 'generation' | 'preview'
}

export type GuidedGeneratedAssetStageId =
  | 'style'
  | 'character'
  | 'scene'
  | 'storyboard'
  | 'keyframe'
  | 'video'

export type GuidedProductionInput = {
  documentText: string
  nodes: readonly GenerationCanvasNode[]
  storyboardPlanExists: boolean
  storyboardPlanCommitted: boolean
  timelineClipCount: number
}

export type GuidedProductionProgress = {
  stages: Array<GuidedProductionStage & { complete: boolean }>
  current: GuidedProductionStage & { complete: boolean }
  currentIndex: number
  completedCount: number
  hasVideoNodes: boolean
  hasGeneratedVideo: boolean
  shotCount: number
  plannedByStage: Record<GuidedGeneratedAssetStageId, boolean>
  generatedCountByStage: Record<GuidedGeneratedAssetStageId, number>
}

export const GUIDED_PRODUCTION_STAGES: readonly GuidedProductionStage[] = [
  { id: 'idea', workspace: 'creation' },
  { id: 'script', workspace: 'creation' },
  { id: 'style', workspace: 'generation' },
  { id: 'character', workspace: 'generation' },
  { id: 'scene', workspace: 'generation' },
  { id: 'storyboard', workspace: 'creation' },
  { id: 'motion', workspace: 'generation' },
  { id: 'keyframe', workspace: 'generation' },
  { id: 'video', workspace: 'generation' },
  { id: 'review', workspace: 'preview' },
] as const

function normalizedNodeText(node: GenerationCanvasNode): string {
  return `${node.title || ''}\n${node.prompt || ''}`.toLocaleLowerCase()
}

function nodeMatches(node: GenerationCanvasNode, pattern: RegExp): boolean {
  return pattern.test(normalizedNodeText(node))
}

function isReferenceSheet(node: GenerationCanvasNode): boolean {
  return node.meta?.referenceSheet === true
}

function isStoryboardNode(node: GenerationCanvasNode): boolean {
  if (isReferenceSheet(node)) return false
  if (node.kind === 'shot') return true
  if (node.kind !== 'image') return false
  if (node.meta?.storyboardKeyframe === true || node.meta?.workflowStage === 'keyframe') return false
  if (nodeMatches(node, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/)) return false
  return typeof node.shotIndex === 'number' || nodeMatches(node, /镜头|分镜|shot/)
}

function hasGeneratedResult(node: GenerationCanvasNode, type: 'image' | 'video'): boolean {
  return node.result?.type === type || node.history?.some((result) => result.type === type) === true
}

/** 单一阶段归属规则：进度判定和顶部“一键生成”必须共用，避免显示在 A 阶段却生成 B 阶段。 */
export function isNodeInGuidedGeneratedStage(
  node: GenerationCanvasNode,
  stageId: GuidedGeneratedAssetStageId,
): boolean {
  switch (stageId) {
    case 'style':
      return (
        nodeMatches(node, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) ||
        node.meta?.workflowStage === 'style'
      )
    case 'character':
      return (
        node.kind === 'character' ||
        nodeMatches(node, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) ||
        node.meta?.workflowStage === 'character'
      )
    case 'scene':
      return (
        node.kind === 'scene' ||
        nodeMatches(node, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) ||
        node.meta?.workflowStage === 'scene'
      )
    case 'storyboard':
      return isStoryboardNode(node)
    case 'keyframe':
      return (
        node.kind === 'keyframe' ||
        node.meta?.storyboardKeyframe === true ||
        nodeMatches(node, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ||
        node.meta?.workflowStage === 'keyframe'
      )
    case 'video':
      return node.kind === 'video'
  }
}

/**
 * 阶段节点是否已具备真实生产意义：有非空提示词可下单，或已有相应媒体结果可兼容旧项目。
 * 空白占位节点不能让流程误判“已规划”，也不能进入额度授权与生成队列。
 */
export function isNodeReadyForGuidedGeneratedStage(
  node: GenerationCanvasNode,
  stageId: GuidedGeneratedAssetStageId,
): boolean {
  if (!isNodeInGuidedGeneratedStage(node, stageId)) return false
  const resultType = stageId === 'video' ? 'video' : 'image'
  return Boolean(node.prompt?.trim()) || hasGeneratedResult(node, resultType)
}

/**
 * 当前阶段真正需要下单的节点：属于该阶段、没有对应媒体结果、且没有排队/生成中。
 * error/recoverable 没有结果时仍会返回，用户再次点击即可重试。
 */
export function selectPendingGuidedGenerationNodes(
  stageId: GuidedGeneratedAssetStageId,
  nodes: readonly GenerationCanvasNode[],
): GenerationCanvasNode[] {
  const resultType = stageId === 'video' ? 'video' : 'image'
  return nodes.filter((node) => (
    isNodeReadyForGuidedGeneratedStage(node, stageId) &&
    !hasGeneratedResult(node, resultType) &&
    node.status !== 'queued' &&
    node.status !== 'running'
  ))
}

function extractShotKey(node: GenerationCanvasNode, fallbackIndex: number): string {
  const match = normalizedNodeText(node).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i)
  if (match?.[1]) return `shot-${Number(match[1])}`
  if (typeof node.shotIndex === 'number') return `shot-${node.shotIndex}`
  return `position-${fallbackIndex + 1}`
}

function coveredShotCount(
  shotNodes: readonly GenerationCanvasNode[],
  candidateNodes: readonly GenerationCanvasNode[],
  predicate: (node: GenerationCanvasNode) => boolean = () => true,
): number {
  const candidateKeys = new Set(
    candidateNodes
      .filter(predicate)
      .map((node, index) => extractShotKey(node, index)),
  )
  return new Set(
    shotNodes
      .map((node, index) => extractShotKey(node, index))
      .filter((key) => candidateKeys.has(key)),
  ).size
}

/**
 * 根据项目真实数据推导当前制作阶段。这里不保存第二份“手动打勾”状态：
 * 文稿、画布节点、分镜方案和时间轴始终是唯一真相源，旧项目也能自动接续。
 * 视觉资产只有在拿到真实图片结果后才算完成；动态、关键帧、视频与时间线按镜头逐一覆盖。
 */
export function deriveGuidedProductionProgress(input: GuidedProductionInput): GuidedProductionProgress {
  const documentText = input.documentText.trim()
  const hasIdea = documentText.length >= 4
  const hasScript =
    /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(documentText) ||
    /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(documentText) ||
    documentText.length >= 420
  const styleNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'style'))
  const characterNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'character'))
  const sceneNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'scene'))
  const storyboardNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'storyboard'))
  const motionNodes = input.nodes.filter(
    (node) =>
      nodeMatches(node, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) ||
      node.meta?.cameraMoveAutoCapture !== undefined ||
      node.meta?.cameraMovePromptApplied !== undefined ||
      node.meta?.workflowStage === 'motion',
  )
  const keyframeNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'keyframe'))
  const videoNodes = input.nodes.filter((node) => isNodeReadyForGuidedGeneratedStage(node, 'video'))
  const shotCount = storyboardNodes.length
  const generatedStyleCount = styleNodes.filter((node) => hasGeneratedResult(node, 'image')).length
  const generatedCharacterCount = characterNodes.filter((node) => hasGeneratedResult(node, 'image')).length
  const generatedSceneCount = sceneNodes.filter((node) => hasGeneratedResult(node, 'image')).length
  const generatedStoryboardCount = storyboardNodes.filter((node) => hasGeneratedResult(node, 'image')).length
  const generatedKeyframeCount = coveredShotCount(
    storyboardNodes,
    keyframeNodes,
    (node) => hasGeneratedResult(node, 'image'),
  )
  const generatedVideoCount = coveredShotCount(
    storyboardNodes,
    videoNodes,
    (node) => hasGeneratedResult(node, 'video'),
  )
  const motionCoverageCount = coveredShotCount(storyboardNodes, motionNodes)
  const hasStyle = styleNodes.length > 0 && generatedStyleCount > 0
  const hasCharacter =
    characterNodes.length > 0 &&
    generatedCharacterCount === characterNodes.length
  const hasScene =
    sceneNodes.length > 0 &&
    generatedSceneCount === sceneNodes.length
  const hasStoryboard =
    shotCount > 0 &&
    generatedStoryboardCount === shotCount
  const hasMotion = shotCount > 0 && motionCoverageCount === shotCount
  const hasKeyframe = shotCount > 0 && generatedKeyframeCount === shotCount
  const hasVideoNodes = videoNodes.length > 0
  const hasGeneratedVideo = shotCount > 0 && generatedVideoCount === shotCount
  const hasReviewTimeline =
    shotCount > 0 &&
    hasGeneratedVideo &&
    input.timelineClipCount >= shotCount
  const plannedByStage: Record<GuidedGeneratedAssetStageId, boolean> = {
    style: styleNodes.length > 0,
    character: characterNodes.length > 0,
    scene: sceneNodes.length > 0,
    storyboard: storyboardNodes.length > 0,
    keyframe: keyframeNodes.length > 0,
    video: videoNodes.length > 0,
  }
  const generatedCountByStage: Record<GuidedGeneratedAssetStageId, number> = {
    style: generatedStyleCount,
    character: generatedCharacterCount,
    scene: generatedSceneCount,
    storyboard: generatedStoryboardCount,
    keyframe: generatedKeyframeCount,
    video: generatedVideoCount,
  }

  const completedById: Record<GuidedProductionStageId, boolean> = {
    idea: hasIdea,
    script: hasScript,
    style: hasStyle,
    character: hasCharacter,
    scene: hasScene,
    storyboard: hasStoryboard,
    motion: hasMotion,
    keyframe: hasKeyframe,
    video: hasGeneratedVideo,
    review: hasReviewTimeline,
  }
  const stages = GUIDED_PRODUCTION_STAGES.map((stage) => ({
    ...stage,
    complete: completedById[stage.id],
  }))
  const firstIncomplete = stages.findIndex((stage) => !stage.complete)
  const currentIndex = firstIncomplete >= 0 ? firstIncomplete : stages.length - 1

  return {
    stages,
    current: stages[currentIndex],
    currentIndex,
    completedCount: stages.filter((stage) => stage.complete).length,
    hasVideoNodes,
    hasGeneratedVideo,
    shotCount,
    plannedByStage,
    generatedCountByStage,
  }
}
