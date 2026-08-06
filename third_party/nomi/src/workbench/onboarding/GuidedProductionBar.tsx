import React from 'react'
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleFilled,
  IconSparkles,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { toast } from '../../ui/toast'
import { extractWorkbenchDocumentText } from '../creation/creationAiModes'
import { mintSpendGrant } from '../api/taskApi'
import { generationCanvasTools } from '../generationCanvas/agent/generationCanvasTools'
import { runPlanWithToasts } from '../generationCanvas/components/batchPlanPreview'
import { buildDependencyWaves } from '../generationCanvas/runner/dependencyWaves'
import { useGenerationCanvasStore } from '../generationCanvas/store/generationCanvasStore'
import { useWorkbenchStore } from '../workbenchStore'
import {
  deriveGuidedProductionProgress,
  isNodeInGuidedGeneratedStage,
  selectPendingGuidedGenerationNodes,
  type GuidedGeneratedAssetStageId,
  type GuidedProductionStageId,
} from './guidedProductionFlow'
import {
  buildMissingGuidedProductionEdges,
  buildMissingNarrativeNodes,
} from './guidedProductionGraph'
import {
  requestGuidedCanvas,
  requestGuidedCreation,
} from './guidedProductionEvents'
import {
  buildGuidedCanvasPrompt,
  buildGuidedScriptPrompt,
} from './guidedProductionPrompts'
import { guidedEmployeeForStage } from './guidedProductionEmployees'
import {
  filterProductionTimeline,
  isNodeInProductionAgentScope,
  resolveProductionScope,
} from '../generationCanvas/production/productionHierarchy'
import { useProductionScopeStore } from '../generationCanvas/production/productionScopeStore'

function stageTranslationKey(
  stageId: GuidedProductionStageId,
  field: 'title' | 'description' | 'owner' | 'action' | 'generateAction' | 'generateDisplayMessage',
): `guidedProduction.stage.${GuidedProductionStageId}.${typeof field}` {
  return `guidedProduction.stage.${stageId}.${field}`
}

function isGeneratedAssetStage(stageId: GuidedProductionStageId): stageId is GuidedGeneratedAssetStageId {
  return ['style', 'character', 'scene', 'storyboard', 'keyframe', 'video'].includes(stageId)
}

/**
 * 常驻“制作导演条”：只展示项目当前唯一下一步，并从真实文稿/节点/时间轴推导进度。
 * 用户不需要理解员工、节点或提示词，点击主按钮即可把任务交给正确的工作区。
 */
export default function GuidedProductionBar(): JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = React.useState(false)
  const [startingGeneration, setStartingGeneration] = React.useState(false)
  const startingGenerationRef = React.useRef(false)
  const workbenchDocument = useWorkbenchStore((state) => state.workbenchDocument)
  const storyboardPlan = useWorkbenchStore((state) => state.storyboardPlan)
  const storyboardPlanCommitted = useWorkbenchStore((state) => state.storyboardPlanCommitted)
  const rawTimeline = useWorkbenchStore((state) => state.timeline)
  const setWorkspaceMode = useWorkbenchStore((state) => state.setWorkspaceMode)
  const setStoryboardEditorOpen = useWorkbenchStore((state) => state.setStoryboardEditorOpen)
  const setCreationAiCollapsed = useWorkbenchStore((state) => state.setCreationAiCollapsed)
  const allNodes = useGenerationCanvasStore((state) => state.nodes)
  const allEdges = useGenerationCanvasStore((state) => state.edges)
  const storedProductionScope = useProductionScopeStore((state) => state.activeScope)
  const activeProductionScope = React.useMemo(
    () => resolveProductionScope(allNodes, storedProductionScope),
    [allNodes, storedProductionScope],
  )
  const nodes = React.useMemo(
    () => allNodes.filter((node) => isNodeInProductionAgentScope(node, activeProductionScope)),
    [activeProductionScope, allNodes],
  )
  const nodeIds = React.useMemo(() => new Set(nodes.map((node) => node.id)), [nodes])
  const edges = React.useMemo(
    () => allEdges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)),
    [allEdges, nodeIds],
  )
  const timeline = React.useMemo(
    () => filterProductionTimeline(rawTimeline, allNodes, activeProductionScope),
    [activeProductionScope, allNodes, rawTimeline],
  )
  const documentText = React.useMemo(
    () => extractWorkbenchDocumentText(workbenchDocument),
    [workbenchDocument],
  )
  const timelineClipCount = React.useMemo(
    () => timeline.tracks.reduce((total, track) => total + track.clips.length, 0),
    [timeline.tracks],
  )
  const progress = React.useMemo(
    () =>
      deriveGuidedProductionProgress({
        documentText,
        nodes,
        storyboardPlanExists: Boolean(storyboardPlan),
        storyboardPlanCommitted,
        timelineClipCount,
      }),
    [documentText, nodes, storyboardPlan, storyboardPlanCommitted, timelineClipCount],
  )
  const current = progress.current
  const allComplete = progress.completedCount === progress.stages.length
  const currentGeneratedStageId = isGeneratedAssetStage(current.id) ? current.id : null
  const currentNeedsGeneration =
    currentGeneratedStageId !== null &&
    progress.plannedByStage[currentGeneratedStageId] &&
    !current.complete
  const currentStageHasActiveGeneration = currentGeneratedStageId !== null && nodes.some(
    (node) =>
      isNodeInGuidedGeneratedStage(node, currentGeneratedStageId) &&
      (node.status === 'queued' || node.status === 'running'),
  )

  React.useEffect(() => {
    const missingEdges = buildMissingGuidedProductionEdges(nodes, edges)
    if (!missingEdges.length) return
    const store = useGenerationCanvasStore.getState()
    missingEdges.forEach((edge) => store.connectNodes(edge.source, edge.target, edge.mode))
  }, [edges, nodes])

  const actionLabel = allComplete
    ? t('guidedProduction.completeAction')
    : currentNeedsGeneration && currentStageHasActiveGeneration
      ? t('guidedProduction.generationInProgress')
      : currentNeedsGeneration && startingGeneration
        ? t('guidedProduction.startingGeneration')
    : current.id === 'storyboard' && storyboardPlan && !storyboardPlanCommitted
      ? t('guidedProduction.reviewStoryboardAction')
      : currentNeedsGeneration
        ? t(stageTranslationKey(current.id, 'generateAction'))
        : t(stageTranslationKey(current.id, 'action'))

  const handleReview = React.useCallback(() => {
    const canvasState = useGenerationCanvasStore.getState()
    const workbenchState = useWorkbenchStore.getState()
    const existingSourceIds = new Set(
      workbenchState.timeline.tracks.flatMap((track) => track.clips.map((clip) => clip.sourceNodeId)),
    )
    const scopedNodeIds = new Set(generationCanvasTools.read_canvas().nodes.map((node) => node.id))
    const videos = canvasState.nodes
      .filter((node) => scopedNodeIds.has(node.id))
      .filter((node) => node.kind === 'video' && (node.status === 'success' || node.result?.type === 'video'))
      .filter((node) => !existingSourceIds.has(node.id))
      .sort((left, right) => (left.shotIndex ?? Number.MAX_SAFE_INTEGER) - (right.shotIndex ?? Number.MAX_SAFE_INTEGER))
    let nextFrame = Math.max(
      0,
      ...workbenchState.timeline.tracks.flatMap((track) => track.clips.map((clip) => clip.endFrame)),
    )
    for (const video of videos) {
      const outcome = generationCanvasTools.send_to_timeline(video.id, { startFrame: nextFrame })
      if (outcome.ok) nextFrame = outcome.clip.endFrame
    }
    setWorkspaceMode('preview')
  }, [setWorkspaceMode])

  const startCurrentStageGeneration = React.useCallback(async (stageId: GuidedGeneratedAssetStageId) => {
    if (startingGenerationRef.current) return
    const selected = selectPendingGuidedGenerationNodes(stageId, nodes)
    const plan = buildDependencyWaves(selected.map((node) => node.id), { nodes, edges })
    const runnableIds = plan.waves.flat()
    if (runnableIds.length === 0) {
      await runPlanWithToasts(plan)
      return
    }
    startingGenerationRef.current = true
    setStartingGeneration(true)
    try {
      const grantId = await mintSpendGrant(runnableIds)
      await runPlanWithToasts(plan, grantId)
    } catch (error: unknown) {
      toast(
        error instanceof Error && error.message
          ? error.message
          : t('guidedProduction.authorizationFailed'),
        'error',
      )
    } finally {
      startingGenerationRef.current = false
      setStartingGeneration(false)
    }
  }, [edges, nodes, t])

  const handleAction = React.useCallback(() => {
    if (currentNeedsGeneration && (startingGenerationRef.current || currentStageHasActiveGeneration)) return
    if (allComplete || current.id === 'review') {
      handleReview()
      return
    }
    if (current.id === 'idea') {
      setWorkspaceMode('creation')
      setCreationAiCollapsed(false)
      return
    }
    if (current.id === 'script') {
      setWorkspaceMode('creation')
      setCreationAiCollapsed(false)
      requestGuidedCreation({
        action: 'send',
        prompt: buildGuidedScriptPrompt(documentText),
        modeId: 'script',
        displayMessage: t('guidedProduction.stage.script.displayMessage'),
        autoApproveWrites: true,
        employeeKey: guidedEmployeeForStage('script'),
        requiredTool: 'append_to_end',
      })
      return
    }
    if (currentNeedsGeneration && isGeneratedAssetStage(current.id)) {
      setWorkspaceMode('generation')
      void startCurrentStageGeneration(current.id)
      return
    }
    if (current.id === 'storyboard') {
      if (storyboardPlan && !storyboardPlanCommitted) {
        setWorkspaceMode('creation')
        setCreationAiCollapsed(false)
        setStoryboardEditorOpen(true)
        return
      }
      setWorkspaceMode('creation')
      setCreationAiCollapsed(false)
      requestGuidedCreation({
        action: 'storyboard',
        displayMessage: t('guidedProduction.stage.storyboard.displayMessage'),
        shotMode: 'image',
        employeeKey: guidedEmployeeForStage('storyboard'),
        requiredTool: 'propose_storyboard_plan',
      })
      return
    }
    setWorkspaceMode('generation')
    if (current.id === 'style') {
      const missingNarrative = buildMissingNarrativeNodes(
        documentText,
        useGenerationCanvasStore.getState().nodes,
      )
      if (missingNarrative.length) generationCanvasTools.create_nodes(missingNarrative)
    }
    requestGuidedCanvas({
      prompt: buildGuidedCanvasPrompt(current.id, documentText),
      displayMessage: t(`guidedProduction.stage.${current.id}.displayMessage` as 'guidedProduction.stage.style.displayMessage'),
      autoApproveSafeWrites: true,
      employeeKey: guidedEmployeeForStage(current.id),
      requiredTool: 'create_canvas_nodes',
    })
  }, [
    allComplete,
    current.id,
    currentStageHasActiveGeneration,
    documentText,
    handleReview,
    currentNeedsGeneration,
    setCreationAiCollapsed,
    setStoryboardEditorOpen,
    setWorkspaceMode,
    startCurrentStageGeneration,
    storyboardPlan,
    storyboardPlanCommitted,
    t,
  ])

  return (
    <section
      className={cn(
        'relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper',
        'px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]',
      )}
      aria-label={t('guidedProduction.aria')}
    >
      <div className="mx-auto flex max-w-[1480px] items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent">
          {allComplete ? <IconCheck size={18} stroke={2.2} /> : <IconSparkles size={18} stroke={1.9} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-micro font-semibold text-nomi-accent">
              {allComplete
                ? t('guidedProduction.complete')
                : t('guidedProduction.step', {
                    current: progress.currentIndex + 1,
                    total: progress.stages.length,
                  })}
            </span>
            <span className="truncate text-body-sm font-semibold text-nomi-ink">
              {allComplete ? t('guidedProduction.completeTitle') : t(stageTranslationKey(current.id, 'title'))}
            </span>
            {!allComplete ? (
              <span className="hidden truncate text-micro text-nomi-ink-40 md:inline">
                {t(stageTranslationKey(current.id, 'owner'))}
              </span>
            ) : null}
          </div>
          <p className="m-0 truncate text-caption text-nomi-ink-60">
            {allComplete ? t('guidedProduction.completeDescription') : t(stageTranslationKey(current.id, 'description'))}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4',
            'border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer',
            'shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-nomi-sm',
          )}
          onClick={handleAction}
          disabled={currentNeedsGeneration && (startingGeneration || currentStageHasActiveGeneration)}
        >
          {actionLabel}
          <IconArrowRight size={15} stroke={2} />
        </button>
        <button
          type="button"
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line',
            'bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink',
          )}
          aria-label={expanded ? t('guidedProduction.collapse') : t('guidedProduction.expand')}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
      </div>

      {expanded ? (
        <div
          className={cn(
            'absolute left-4 right-4 top-[calc(100%+8px)] mx-auto max-w-[1120px]',
            'rounded-nomi-lg border border-nomi-line bg-nomi-paper p-4 shadow-nomi-lg',
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-body font-semibold text-nomi-ink">{t('guidedProduction.allSteps')}</h2>
              <p className="m-0 mt-0.5 text-caption text-nomi-ink-60">{t('guidedProduction.allStepsDescription')}</p>
            </div>
            <span className="shrink-0 text-caption font-semibold text-nomi-accent">
              {t('guidedProduction.completedCount', {
                completed: progress.completedCount,
                total: progress.stages.length,
              })}
            </span>
          </div>
          <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5">
            {progress.stages.map((stage, index) => {
              const isCurrent = !allComplete && stage.id === current.id
              return (
                <li
                  key={stage.id}
                  className={cn(
                    'min-w-0 rounded-nomi border p-2.5',
                    stage.complete
                      ? 'border-transparent bg-nomi-ink-05'
                      : isCurrent
                        ? 'border-nomi-accent bg-nomi-accent-soft'
                        : 'border-nomi-line bg-nomi-paper',
                  )}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    {stage.complete ? (
                      <IconCheck size={14} className="shrink-0 text-workbench-success" />
                    ) : (
                      <IconCircleFilled size={10} className={cn('mx-0.5 shrink-0', isCurrent ? 'text-nomi-accent' : 'text-nomi-ink-20')} />
                    )}
                    <span className="text-micro text-nomi-ink-40">
                      {t('guidedProduction.shortStep', { current: index + 1 })}
                    </span>
                  </div>
                  <div className="truncate text-caption font-semibold text-nomi-ink">
                    {t(stageTranslationKey(stage.id, 'title'))}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
