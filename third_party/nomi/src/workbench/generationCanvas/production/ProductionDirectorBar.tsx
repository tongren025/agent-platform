import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutSidebarLeftExpand,
  IconMovie,
  IconSparkles,
  IconTool,
} from '@tabler/icons-react'
import { cn } from '../../../utils/cn'
import { extractWorkbenchDocumentText } from '../../creation/creationAiModes'
import { generationCanvasTools } from '../agent/generationCanvasTools'
import { useGenerationCanvasStore } from '../store/generationCanvasStore'
import { useWorkbenchStore } from '../../workbenchStore'
import {
  buildGuidedCanvasPrompt,
  buildGuidedMediaRunPrompt,
  buildGuidedScriptPrompt,
} from '../../onboarding/guidedProductionPrompts'
import {
  requestGuidedCanvas,
  requestGuidedCreation,
} from '../../onboarding/guidedProductionEvents'
import { guidedEmployeeForStage } from '../../onboarding/guidedProductionEmployees'
import {
  adjacentProductionShot,
  buildProductionHierarchy,
  findProductionShotLocation,
  flattenProductionShots,
  isNodeInProductionDisplayScope,
  resolveProductionScope,
  type ProductionScope,
} from './productionHierarchy'
import { useProductionScopeStore } from './productionScopeStore'
import {
  deriveProductionDirectorProgress,
  type ProductionDirectorProgress,
  type ProductionDirectorStageId,
} from './productionDirectorFlow'
import { useProductionDirectorUiStore } from './productionDirectorUiStore'

type Translate = ReturnType<typeof useTranslation>['t']

function stageTitle(t: Translate, stageId: ProductionDirectorStageId): string {
  return t(`generationCommon.director.stages.${stageId}.title` as 'generationCommon.director.stages.script.title')
}

function scopeLabel(t: Translate, scope: ProductionScope | null): string {
  if (!scope) return t('generationCommon.director.noShotSelected')
  if (scope.kind === 'global') return t('generationCommon.director.globalScope')
  if (scope.kind === 'episode') return t('generationCommon.director.episodeScope', { episode: scope.episode })
  return scope.episode === null
    ? t('generationCommon.director.unassignedShotScope', { shot: scope.shotNumber })
    : t('generationCommon.director.shotScope', { episode: scope.episode, shot: scope.shotNumber })
}

function actionLabel(t: Translate, progress: ProductionDirectorProgress): string {
  const stage = progress.current
  if (progress.complete) return t('generationCommon.director.nextIncomplete')
  if (stage.id === 'review') return t('generationCommon.director.reviewAction')
  if (stage.running) return t('generationCommon.director.runningAction', { stage: stageTitle(t, stage.id) })
  if (stage.id === 'script') return t('generationCommon.director.scriptAction')
  if (stage.id === 'storyboard') {
    return stage.planned
      ? t('generationCommon.director.stagePlannedAction', { stage: stageTitle(t, stage.id) })
      : t('generationCommon.director.storyboardAction')
  }
  if (stage.id === 'motion') return t('generationCommon.director.motionAction')
  if (stage.id === 'keyframe') {
    return stage.planned
      ? t('generationCommon.director.stagePlannedAction', { stage: stageTitle(t, stage.id) })
      : t('generationCommon.director.keyframeAction')
  }
  return stage.planned
    ? t('generationCommon.director.stagePlannedAction', { stage: stageTitle(t, stage.id) })
    : t('generationCommon.director.videoAction')
}

function canRunPlannedMedia(stageId: ProductionDirectorStageId): stageId is 'storyboard' | 'keyframe' | 'video' {
  return stageId === 'storyboard' || stageId === 'keyframe' || stageId === 'video'
}

export default function ProductionDirectorBar({ projectName }: { projectName?: string }): JSX.Element | null {
  const { t } = useTranslation()
  const allNodes = useGenerationCanvasStore((state) => state.nodes)
  const rawTimeline = useWorkbenchStore((state) => state.timeline)
  const workbenchDocument = useWorkbenchStore((state) => state.workbenchDocument)
  const setWorkspaceMode = useWorkbenchStore((state) => state.setWorkspaceMode)
  const setActiveCategoryId = useWorkbenchStore((state) => state.setActiveCategoryId)
  const setCreationAiCollapsed = useWorkbenchStore((state) => state.setCreationAiCollapsed)
  const storedScope = useProductionScopeStore((state) => state.activeScope)
  const setActiveScope = useProductionScopeStore((state) => state.setActiveScope)
  const directorMode = useProductionDirectorUiStore((state) => state.mode)
  const setDirectorMode = useProductionDirectorUiStore((state) => state.setMode)
  const directoryOpen = useProductionDirectorUiStore((state) => state.directoryOpen)
  const toggleDirectory = useProductionDirectorUiStore((state) => state.toggleDirectory)
  const hierarchy = React.useMemo(() => buildProductionHierarchy(allNodes), [allNodes])
  const activeScope = React.useMemo(
    () => resolveProductionScope(allNodes, storedScope),
    [allNodes, storedScope],
  )
  const currentNodes = React.useMemo(
    () => allNodes.filter((node) => isNodeInProductionDisplayScope(node, activeScope)),
    [activeScope, allNodes],
  )
  const timelineSourceNodeIds = React.useMemo(
    () => new Set(rawTimeline.tracks.flatMap((track) => track.clips.map((clip) => clip.sourceNodeId))),
    [rawTimeline.tracks],
  )
  const progress = React.useMemo(
    () => deriveProductionDirectorProgress({ nodes: currentNodes, timelineSourceNodeIds }),
    [currentNodes, timelineSourceNodeIds],
  )
  const shotLocation = React.useMemo(
    () => findProductionShotLocation(hierarchy, activeScope),
    [activeScope, hierarchy],
  )
  const previousShot = React.useMemo(
    () => adjacentProductionShot(hierarchy, activeScope, -1),
    [activeScope, hierarchy],
  )
  const nextShot = React.useMemo(
    () => adjacentProductionShot(hierarchy, activeScope, 1),
    [activeScope, hierarchy],
  )
  const documentText = React.useMemo(
    () => extractWorkbenchDocumentText(workbenchDocument),
    [workbenchDocument],
  )

  const selectScope = React.useCallback((scope: ProductionScope) => {
    setActiveCategoryId('shots')
    setActiveScope(scope)
    setWorkspaceMode('generation')
  }, [setActiveCategoryId, setActiveScope, setWorkspaceMode])

  const findNextIncompleteScope = React.useCallback((): ProductionScope | null => {
    const shots = flattenProductionShots(hierarchy)
    if (!shots.length) return null
    const start = Math.max(-1, shotLocation?.absoluteIndex ?? -1)
    const ordered = [...shots.slice(start + 1), ...shots.slice(0, start + 1)]
    for (const entry of ordered) {
      const nodes = allNodes.filter((node) => entry.shot.nodeIds.includes(node.id))
      const shotProgress = deriveProductionDirectorProgress({ nodes, timelineSourceNodeIds })
      if (!shotProgress.complete) return entry.shot.scope
    }
    return null
  }, [allNodes, hierarchy, shotLocation?.absoluteIndex, timelineSourceNodeIds])

  const sendCurrentVideoToTimeline = React.useCallback(() => {
    const state = useWorkbenchStore.getState()
    const existingSourceIds = new Set(
      state.timeline.tracks.flatMap((track) => track.clips.map((clip) => clip.sourceNodeId)),
    )
    const currentNodeIds = new Set(currentNodes.map((node) => node.id))
    const videos = useGenerationCanvasStore.getState().nodes
      .filter((node) => currentNodeIds.has(node.id))
      .filter((node) => node.kind === 'video' && (node.status === 'success' || node.result?.type === 'video'))
      .filter((node) => !existingSourceIds.has(node.id))
    let nextFrame = Math.max(
      0,
      ...state.timeline.tracks.flatMap((track) => track.clips.map((clip) => clip.endFrame)),
    )
    for (const video of videos) {
      const outcome = generationCanvasTools.send_to_timeline(video.id, { startFrame: nextFrame })
      if (outcome.ok) nextFrame = outcome.clip.endFrame
    }
    window.dispatchEvent(new CustomEvent('nomi-set-timeline-expanded', { detail: { expanded: true } }))
    setWorkspaceMode('preview')
  }, [currentNodes, setWorkspaceMode])

  const handlePrimaryAction = React.useCallback(() => {
    if (activeScope?.kind !== 'shot') {
      const firstShot = flattenProductionShots(hierarchy)[0]?.shot
      if (firstShot) selectScope(firstShot.scope)
      return
    }
    if (progress.complete) {
      const incomplete = findNextIncompleteScope()
      if (incomplete) selectScope(incomplete)
      else setWorkspaceMode('preview')
      return
    }
    const stage = progress.current
    if (stage.running) return
    if (stage.id === 'review') {
      sendCurrentVideoToTimeline()
      return
    }
    if (stage.id === 'script') {
      setWorkspaceMode('creation')
      setCreationAiCollapsed(false)
      requestGuidedCreation({
        action: 'send',
        prompt: buildGuidedScriptPrompt(documentText),
        modeId: 'script',
        displayMessage: t('generationCommon.director.scopeScriptMessage', { scope: scopeLabel(t, activeScope) }),
        autoApproveWrites: true,
        employeeKey: guidedEmployeeForStage('script'),
        requiredTool: 'append_to_end',
      })
      return
    }
    if (stage.id === 'storyboard' && !stage.planned) {
      setWorkspaceMode('creation')
      setCreationAiCollapsed(false)
      requestGuidedCreation({
        action: 'storyboard',
        displayMessage: t('generationCommon.director.scopeStoryboardMessage', { scope: scopeLabel(t, activeScope) }),
        shotMode: 'image',
        employeeKey: guidedEmployeeForStage('storyboard'),
        requiredTool: 'propose_storyboard_plan',
      })
      return
    }
    setWorkspaceMode('generation')
    if (stage.planned && canRunPlannedMedia(stage.id)) {
      requestGuidedCanvas({
        prompt: buildGuidedMediaRunPrompt(stage.id),
        displayMessage: t('generationCommon.director.scopeGenerateMessage', {
          scope: scopeLabel(t, activeScope),
          stage: stageTitle(t, stage.id),
        }),
        autoApproveSafeWrites: true,
        employeeKey: guidedEmployeeForStage(stage.id, true),
        requiredTool: 'run_generation_batch',
      })
      return
    }
    if (stage.id === 'motion' || stage.id === 'keyframe' || stage.id === 'video') {
      requestGuidedCanvas({
        prompt: buildGuidedCanvasPrompt(stage.id, documentText),
        displayMessage: t('generationCommon.director.scopeCreateMessage', {
          scope: scopeLabel(t, activeScope),
          stage: stageTitle(t, stage.id),
        }),
        autoApproveSafeWrites: true,
        employeeKey: guidedEmployeeForStage(stage.id),
        requiredTool: 'create_canvas_nodes',
      })
    }
  }, [
    activeScope,
    documentText,
    findNextIncompleteScope,
    hierarchy,
    progress,
    selectScope,
    sendCurrentVideoToTimeline,
    setCreationAiCollapsed,
    setWorkspaceMode,
    t,
  ])

  if (!hierarchy.isProductionProject || !activeScope) return null
  const isShot = activeScope.kind === 'shot'
  const completePercent = Math.round((progress.productionCompletedCount / progress.productionStageCount) * 100)

  return (
    <section
      className={cn(
        'production-director-bar relative z-[65] shrink-0 border-b border-nomi-line',
        'bg-[linear-gradient(90deg,var(--nomi-paper),color-mix(in_oklch,var(--nomi-accent)_5%,var(--nomi-paper)))]',
        'px-3 py-2',
      )}
      data-production-director="true"
      data-director-mode={directorMode}
      aria-label={t('generationCommon.director.aria')}
    >
      <div className="flex min-w-0 items-center gap-2.5 max-[700px]:flex-wrap">
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-nomi border px-3',
            directoryOpen
              ? 'border-nomi-accent bg-nomi-accent-soft text-nomi-accent'
              : 'border-nomi-line bg-nomi-paper text-nomi-ink-70 hover:bg-nomi-ink-05',
          )}
          aria-label={directoryOpen
            ? t('generationCommon.director.closeDirectory')
            : t('generationCommon.director.openDirectory')}
          aria-pressed={directoryOpen}
          onClick={toggleDirectory}
        >
          <IconLayoutSidebarLeftExpand size={16} stroke={1.9} />
          <span className="hidden text-caption font-semibold xl:inline">
            {t('generationCommon.director.directory')}
          </span>
        </button>

        <div className="inline-flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!previousShot}
            aria-label={t('generationCommon.director.previousShot')}
            title={t('generationCommon.director.previousShot')}
            onClick={() => previousShot && selectScope(previousShot.scope)}
          >
            <IconChevronLeft size={17} />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!nextShot}
            aria-label={t('generationCommon.director.nextShot')}
            title={t('generationCommon.director.nextShot')}
            onClick={() => nextShot && selectScope(nextShot.scope)}
          >
            <IconChevronRight size={17} />
          </button>
        </div>

        <div className="min-w-[190px] shrink-0 max-[900px]:min-w-0 max-[700px]:min-w-[110px] max-[700px]:flex-1">
          <div className="flex items-center gap-1.5">
            <IconMovie size={15} stroke={1.9} className="shrink-0 text-nomi-accent" />
            <span className="truncate text-body-sm font-semibold text-nomi-ink">
              {scopeLabel(t, activeScope)}
            </span>
          </div>
          <div className="mt-0.5 truncate text-micro text-nomi-ink-50 max-[700px]:hidden">
            {isShot && shotLocation
              ? t('generationCommon.director.shotPosition', {
                  project: projectName || t('generationCommon.productionHierarchy.season'),
                  current: shotLocation.absoluteIndex + 1,
                  total: hierarchy.totalShotCount,
                })
              : t('generationCommon.director.seasonSummary', {
                  episodes: hierarchy.episodes.length,
                  shots: hierarchy.totalShotCount,
                })}
          </div>
        </div>

        {isShot ? (
          <ol className="m-0 hidden min-w-0 flex-1 list-none items-center gap-1 p-0 min-[1120px]:flex">
            {progress.stages.map((stage, index) => {
              const current = !progress.complete && stage.id === progress.current.id
              return (
                <li key={stage.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <div
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-1.5',
                      stage.complete
                        ? 'bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success'
                        : current
                          ? 'bg-nomi-accent-soft text-nomi-accent ring-1 ring-inset ring-nomi-accent/30'
                          : 'bg-nomi-ink-05 text-nomi-ink-40',
                    )}
                    aria-current={current ? 'step' : undefined}
                  >
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[9px] font-bold">
                      {stage.complete ? <IconCheck size={11} stroke={2.5} /> : index + 1}
                    </span>
                    <span className="truncate text-micro font-semibold">{stageTitle(t, stage.id)}</span>
                  </div>
                  {index < progress.stages.length - 1 ? (
                    <IconArrowRight size={11} className="shrink-0 text-nomi-ink-20" />
                  ) : null}
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="min-w-0 flex-1 text-caption text-nomi-ink-60">
            {t('generationCommon.director.publicHint')}
          </div>
        )}

        {isShot ? (
          <div className="hidden w-[90px] shrink-0 text-right min-[900px]:block">
            <div className="text-micro font-semibold text-nomi-ink-60">
              {t('generationCommon.director.currentShotProgress', { percent: completePercent })}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-nomi-ink-10">
              <span
                className="block h-full rounded-full bg-nomi-accent transition-[width]"
                style={{ width: `${completePercent}%` }}
              />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-3.5',
            'border-0 bg-nomi-accent text-white text-body-sm font-semibold shadow-nomi-sm',
            'transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-accent focus-visible:ring-offset-2',
            isShot && progress.current.running && 'cursor-wait opacity-70',
            'max-[700px]:order-10 max-[700px]:w-full max-[700px]:justify-center',
          )}
          disabled={isShot && progress.current.running}
          data-director-primary-action={isShot ? progress.current.id : 'enter-shot'}
          onClick={handlePrimaryAction}
        >
          {isShot && progress.complete ? <IconCheck size={15} /> : <IconSparkles size={15} />}
          <span className="max-w-[180px] truncate">
            {isShot ? actionLabel(t, progress) : t('generationCommon.director.enterFirstShot')}
          </span>
          <IconArrowRight size={15} />
        </button>

        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi border border-nomi-line px-2.5',
            'bg-nomi-paper text-caption font-semibold text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink',
          )}
          aria-label={directorMode === 'guided'
            ? t('generationCommon.director.switchToProfessional')
            : t('generationCommon.director.switchToGuided')}
          onClick={() => {
            const nextMode = directorMode === 'guided' ? 'professional' : 'guided'
            setDirectorMode(nextMode)
            if (nextMode === 'guided') setWorkspaceMode('generation')
          }}
        >
          {directorMode === 'guided' ? <IconTool size={15} /> : <IconArrowLeft size={15} />}
          <span className="hidden min-[1280px]:inline">
            {directorMode === 'guided'
              ? t('generationCommon.director.professionalMode')
              : t('generationCommon.director.guidedMode')}
          </span>
        </button>
      </div>
    </section>
  )
}
