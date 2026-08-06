import type { GenerationCanvasEdge, GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import type { DependencyWavePlan } from '../generationCanvas/runner/dependencyWaves'
import { buildDependencyWaves } from '../generationCanvas/runner/dependencyWaves'
import type { GuidedCanvasRequest, GuidedCreationRequest } from './guidedProductionEvents'
import type { GuidedGeneratedAssetStageId, GuidedProductionStageId } from './guidedProductionFlow'
import { selectPendingGuidedGenerationNodes } from './guidedProductionFlow'
import { guidedEmployeeForStage } from './guidedProductionEmployees'
import { buildGuidedCanvasPrompt, buildGuidedScriptPrompt } from './guidedProductionPrompts'

const GENERATED_STAGES = new Set<GuidedProductionStageId>([
  'style', 'character', 'scene', 'storyboard', 'keyframe', 'video',
])

function isGeneratedStage(stageId: GuidedProductionStageId): stageId is GuidedGeneratedAssetStageId {
  return GENERATED_STAGES.has(stageId)
}

export type GuidedPrimaryActionContext = {
  currentStageId: GuidedProductionStageId
  allComplete: boolean
  currentNeedsGeneration: boolean
  generationBlocked: boolean
  storyboardPlanExists: boolean
  storyboardPlanCommitted: boolean
  documentText: string
  translate: (key: string) => string
}

export type GuidedPrimaryActionPorts = {
  setWorkspaceMode: (mode: 'creation' | 'generation' | 'preview') => void
  openCreationAssistant: () => void
  focusSourceEditor: () => void
  openCanvasAssistant: () => void
  openStoryboardEditor: () => void
  ensureNarrativeNodes: () => void
  requestCreation: (request: GuidedCreationRequest) => void
  requestCanvas: (request: GuidedCanvasRequest) => void
  startGeneration: (stageId: GuidedGeneratedAssetStageId) => void
  review: () => void
}

export type GuidedPrimaryActionKind =
  | 'idea'
  | 'script'
  | 'plan-canvas'
  | 'plan-storyboard'
  | 'review-storyboard'
  | 'start-generation'
  | 'review'
  | 'blocked'

/** 顶部主按钮的唯一动作分发表：一次调用只允许命中一个端口。 */
export function dispatchGuidedProductionPrimaryAction(
  context: GuidedPrimaryActionContext,
  ports: GuidedPrimaryActionPorts,
): GuidedPrimaryActionKind {
  const stageId = context.currentStageId
  if (context.allComplete || stageId === 'review') {
    ports.review()
    return 'review'
  }
  if (stageId === 'idea') {
    ports.setWorkspaceMode('creation')
    ports.openCreationAssistant()
    ports.focusSourceEditor()
    return 'idea'
  }
  if (stageId === 'script') {
    ports.setWorkspaceMode('creation')
    ports.openCreationAssistant()
    ports.requestCreation({
      action: 'send',
      prompt: buildGuidedScriptPrompt(context.documentText),
      modeId: 'script',
      displayMessage: context.translate('guidedProduction.stage.script.displayMessage'),
      autoApproveWrites: true,
      employeeKey: guidedEmployeeForStage('script'),
      requiredTool: 'append_to_end',
    })
    return 'script'
  }
  if (context.currentNeedsGeneration && isGeneratedStage(stageId)) {
    if (context.generationBlocked) return 'blocked'
    ports.setWorkspaceMode('generation')
    ports.startGeneration(stageId)
    return 'start-generation'
  }
  if (stageId === 'storyboard') {
    if (context.storyboardPlanExists && !context.storyboardPlanCommitted) {
      ports.setWorkspaceMode('creation')
      ports.openCreationAssistant()
      ports.openStoryboardEditor()
      return 'review-storyboard'
    }
    ports.setWorkspaceMode('creation')
    ports.openCreationAssistant()
    ports.requestCreation({
      action: 'storyboard',
      displayMessage: context.translate('guidedProduction.stage.storyboard.displayMessage'),
      shotMode: 'image',
      employeeKey: guidedEmployeeForStage('storyboard'),
      requiredTool: 'propose_storyboard_plan',
    })
    return 'plan-storyboard'
  }

  ports.setWorkspaceMode('generation')
  ports.openCanvasAssistant()
  if (stageId === 'style') ports.ensureNarrativeNodes()
  ports.requestCanvas({
    prompt: buildGuidedCanvasPrompt(stageId, context.documentText),
    displayMessage: context.translate(`guidedProduction.stage.${stageId}.displayMessage`),
    autoApproveSafeWrites: true,
    employeeKey: guidedEmployeeForStage(stageId),
    requiredTool: 'create_canvas_nodes',
  })
  return 'plan-canvas'
}

export type GuidedGenerationStartLock = { current: boolean }

/** 真人点击后的确定性启动器；同步占锁，连续点击只会铸一份额度授权。 */
export async function startGuidedStageGeneration(
  input: {
    stageId: GuidedGeneratedAssetStageId
    nodes: readonly GenerationCanvasNode[]
    edges: readonly GenerationCanvasEdge[]
    lock: GuidedGenerationStartLock
  },
  ports: {
    mintGrant: (nodeIds: string[]) => Promise<string>
    runPlan: (plan: DependencyWavePlan, grantId?: string) => Promise<void>
    setStarting: (starting: boolean) => void
    authorizationFailed: (error: unknown) => void
  },
): Promise<boolean> {
  if (input.lock.current) return false
  const selected = selectPendingGuidedGenerationNodes(input.stageId, input.nodes)
  const plan = buildDependencyWaves(selected.map((node) => node.id), { nodes: input.nodes, edges: input.edges })
  const runnableIds = plan.waves.flat()
  if (runnableIds.length === 0) {
    await ports.runPlan(plan)
    return false
  }
  input.lock.current = true
  ports.setStarting(true)
  try {
    const grantId = await ports.mintGrant(runnableIds)
    await ports.runPlan(plan, grantId)
    return true
  } catch (error: unknown) {
    ports.authorizationFailed(error)
    return false
  } finally {
    input.lock.current = false
    ports.setStarting(false)
  }
}

/** 审片按钮只把当前 scope 内成功且尚未入轨的视频按镜号追加一次。 */
export function appendGuidedReviewVideos(
  input: {
    nodes: readonly GenerationCanvasNode[]
    existingSourceIds: ReadonlySet<string>
    initialFrame: number
  },
  sendToTimeline: (nodeId: string, startFrame: number) => { ok: boolean; endFrame?: number },
): number {
  let nextFrame = input.initialFrame
  let appended = 0
  const videos = input.nodes
    .filter((node) => node.kind === 'video' && (node.status === 'success' || node.result?.type === 'video'))
    .filter((node) => !input.existingSourceIds.has(node.id))
    .sort((left, right) => (left.shotIndex ?? Number.MAX_SAFE_INTEGER) - (right.shotIndex ?? Number.MAX_SAFE_INTEGER))
  for (const video of videos) {
    const outcome = sendToTimeline(video.id, nextFrame)
    if (!outcome.ok) continue
    appended += 1
    if (typeof outcome.endFrame === 'number') nextFrame = outcome.endFrame
  }
  return appended
}
