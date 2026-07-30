import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconMovie,
  IconPhoto,
  IconPlayerPlay,
  IconSearch,
  IconStack2,
  IconX,
} from '@tabler/icons-react'
import { cn } from '../../../utils/cn'
import type { GenerationCanvasNode } from '../model/generationCanvasTypes'
import {
  deriveProductionDirectorProgress,
  productionShotStatus,
} from './productionDirectorFlow'
import {
  productionScopeKey,
  type ProductionEpisode,
  type ProductionHierarchy,
  type ProductionScope,
  type ProductionShot,
} from './productionHierarchy'

type ShotFilter = 'all' | 'unfinished' | 'failed' | 'complete'

type ProductionHierarchyNavigatorProps = {
  projectName?: string
  hierarchy: ProductionHierarchy
  nodes: readonly GenerationCanvasNode[]
  timelineSourceNodeIds?: ReadonlySet<string>
  activeScope: ProductionScope | null
  onSelectScope: (scope: ProductionScope) => void
  onClose?: () => void
}

function episodeKey(episode: number | null): string {
  return episode === null ? 'unassigned' : String(episode)
}

type Translate = ReturnType<typeof useTranslation>['t']

function scopeShortLabel(t: Translate, scope: ProductionScope | null): string {
  if (!scope) return ''
  if (scope.kind === 'global') return t('generationCommon.director.sidebar.global')
  if (scope.kind === 'episode') return t('generationCommon.director.episodeScope', { episode: scope.episode })
  return scope.episode === null
    ? t('generationCommon.director.unassignedShotScope', { shot: scope.shotNumber })
    : t('generationCommon.director.shotScope', { episode: scope.episode, shot: scope.shotNumber })
}

function episodeLabel(t: Translate, episode: ProductionEpisode): string {
  return episode.episode === null
    ? t('generationCommon.productionHierarchy.unassignedEpisode')
    : t('generationCommon.productionHierarchy.episode', { episode: episode.episode })
}

export function ProductionHierarchyNavigator({
  projectName,
  hierarchy,
  nodes,
  timelineSourceNodeIds = new Set<string>(),
  activeScope,
  onSelectScope,
  onClose,
}: ProductionHierarchyNavigatorProps): JSX.Element | null {
  const { t } = useTranslation()
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<ShotFilter>('all')
  const [expandedEpisodes, setExpandedEpisodes] = React.useState<Set<string>>(() => {
    const initial = activeScope?.episode
    return new Set(initial !== undefined ? [episodeKey(initial)] : [])
  })
  const nodeById = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  React.useEffect(() => {
    if (activeScope?.kind === 'global') return
    const key = episodeKey(activeScope?.episode ?? null)
    setExpandedEpisodes((current) => current.has(key) ? current : new Set([...current, key]))
  }, [activeScope])

  const shotInfo = React.useCallback((shot: ProductionShot) => {
    const shotNodes = shot.nodeIds.flatMap((id) => {
      const node = nodeById.get(id)
      return node ? [node] : []
    })
    const progress = deriveProductionDirectorProgress({ nodes: shotNodes, timelineSourceNodeIds })
    const searchable = `${shot.scope.shotNumber} ${shotNodes.map((node) => `${node.title} ${node.prompt ?? ''}`).join(' ')}`.toLowerCase()
    return { progress, searchable, status: productionShotStatus(progress) }
  }, [nodeById, timelineSourceNodeIds])

  const visibleEpisodes = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return hierarchy.episodes.map((episode) => ({
      episode,
      shots: episode.shots.filter((shot) => {
        const info = shotInfo(shot)
        if (normalizedQuery && !info.searchable.includes(normalizedQuery)) return false
        if (filter === 'failed') return info.progress.hasFailure
        if (filter === 'complete') return info.progress.complete
        if (filter === 'unfinished') return !info.progress.complete
        return true
      }),
    })).filter(({ shots }) => shots.length > 0 || !normalizedQuery && filter === 'all')
  }, [filter, hierarchy.episodes, query, shotInfo])

  const firstIncomplete = React.useMemo(() => {
    for (const episode of hierarchy.episodes) {
      for (const shot of episode.shots) {
        if (!shotInfo(shot).progress.complete) return shot
      }
    }
    return null
  }, [hierarchy.episodes, shotInfo])

  if (!hierarchy.isProductionProject || !activeScope) return null
  const activeKey = productionScopeKey(activeScope)

  return (
    <aside
      className={cn(
        'production-hierarchy-navigator relative z-[70] flex h-full w-[276px] shrink-0 flex-col overflow-hidden',
        'border-r border-workbench-border bg-nomi-paper shadow-[8px_0_24px_rgba(20,20,24,0.04)]',
        'max-[1100px]:absolute max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-workbench-pop',
      )}
      data-production-hierarchy="true"
      aria-label={t('generationCommon.director.sidebar.aria')}
    >
      <header className="shrink-0 border-b border-nomi-line px-3 py-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent">
            <IconStack2 size={17} stroke={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40">
              {t('generationCommon.director.sidebar.title')}
            </div>
            <div className="mt-0.5 truncate text-body-sm font-semibold text-nomi-ink">
              {projectName || t('generationCommon.productionHierarchy.season')}
            </div>
            <div className="mt-0.5 text-micro text-nomi-ink-50">
              {t('generationCommon.director.seasonSummary', {
                episodes: hierarchy.episodes.filter((episode) => episode.episode !== null).length,
                shots: hierarchy.totalShotCount,
              })}
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              className="grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-nomi-ink"
              aria-label={t('generationCommon.director.closeDirectory')}
              onClick={onClose}
            >
              <IconX size={16} stroke={1.8} />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={cn(
            'mt-3 flex w-full items-center gap-2 rounded-nomi border border-nomi-accent/25',
            'bg-nomi-accent-soft px-2.5 py-2 text-left hover:border-nomi-accent/50',
          )}
          onClick={() => firstIncomplete && onSelectScope(firstIncomplete.scope)}
          disabled={!firstIncomplete}
        >
          {firstIncomplete ? (
            <IconPlayerPlay size={15} className="shrink-0 text-nomi-accent" />
          ) : (
            <IconCircleCheck size={15} className="shrink-0 text-workbench-success" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-caption font-semibold text-nomi-ink">
              {firstIncomplete
                ? t('generationCommon.director.sidebar.continueIncomplete')
                : t('generationCommon.director.sidebar.allComplete')}
            </span>
            <span className="block truncate text-micro text-nomi-ink-50">
              {firstIncomplete
                ? scopeShortLabel(t, firstIncomplete.scope)
                : t('generationCommon.director.sidebar.allCompleteHint')}
            </span>
          </span>
          {firstIncomplete ? <IconChevronRight size={15} className="text-nomi-ink-40" /> : null}
        </button>

        <label className="mt-2.5 flex h-8 items-center gap-2 rounded-nomi border border-nomi-line bg-workbench-bg px-2.5 focus-within:border-nomi-accent">
          <IconSearch size={14} className="shrink-0 text-nomi-ink-40" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-caption text-nomi-ink outline-none placeholder:text-nomi-ink-30"
            value={query}
            placeholder={t('generationCommon.director.sidebar.searchPlaceholder')}
            aria-label={t('generationCommon.director.sidebar.searchAria')}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>

        <div
          className="mt-2 grid grid-cols-4 gap-1"
          role="group"
          aria-label={t('generationCommon.director.sidebar.filterAria')}
        >
          {([
            ['all', 'filterAll'],
            ['unfinished', 'filterUnfinished'],
            ['failed', 'filterFailed'],
            ['complete', 'filterComplete'],
          ] as const).map(([id, labelKey]) => (
            <button
              key={id}
              type="button"
              className={cn(
                'h-7 rounded-nomi-sm border-0 px-1 text-micro font-semibold',
                filter === id
                  ? 'bg-nomi-ink text-nomi-paper'
                  : 'bg-nomi-ink-05 text-nomi-ink-50 hover:text-nomi-ink',
              )}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {t(`generationCommon.director.sidebar.${labelKey}` as 'generationCommon.director.sidebar.filterAll')}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
        {hierarchy.globalNodeIds.length ? (
          <button
            type="button"
            className={cn(
              'mb-1 flex w-full items-center gap-2 rounded-nomi border px-2.5 py-2 text-left',
              activeKey === 'global'
                ? 'border-nomi-accent bg-nomi-accent-soft'
                : 'border-transparent bg-transparent hover:bg-nomi-ink-05',
            )}
            data-production-scope="global"
            aria-current={activeKey === 'global' ? 'page' : undefined}
            onClick={() => onSelectScope({ kind: 'global', episode: null, shotNumber: 0 })}
          >
            <IconPhoto size={16} stroke={1.8} className="shrink-0 text-nomi-ink-50" />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-semibold text-nomi-ink">
                {t('generationCommon.director.sidebar.global')}
              </span>
              <span className="block truncate text-micro text-nomi-ink-40">
                {t('generationCommon.director.sidebar.globalDescription')}
              </span>
            </span>
            <span className="text-micro tabular-nums text-nomi-ink-40">{hierarchy.globalNodeIds.length}</span>
          </button>
        ) : null}

        {visibleEpisodes.map(({ episode, shots }) => {
          const key = episodeKey(episode.episode)
          const expanded = expandedEpisodes.has(key)
          const completedShots = episode.shots.filter((shot) => shotInfo(shot).progress.complete).length
          return (
            <section key={key} className="mb-1 overflow-hidden rounded-nomi border border-nomi-line">
              <button
                type="button"
                className="flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left hover:bg-nomi-ink-10"
                aria-expanded={expanded}
                onClick={() => setExpandedEpisodes((current) => {
                  const next = new Set(current)
                  if (next.has(key)) next.delete(key)
                  else next.add(key)
                  return next
                })}
              >
                {expanded ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
                <IconMovie size={16} stroke={1.8} className="text-nomi-accent" />
                <span className="min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink">
                  {episodeLabel(t, episode)}
                </span>
                <span className="text-micro tabular-nums text-nomi-ink-40">
                  {t('generationCommon.director.sidebar.episodeProgress', {
                    completed: completedShots,
                    total: episode.shots.length,
                  })}
                </span>
              </button>

              {expanded ? (
                <div className="space-y-1 bg-nomi-paper p-1.5">
                  {episode.episode !== null && episode.overviewNodeIds.length ? (
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left',
                        activeKey === `episode:${episode.episode}`
                          ? 'border-nomi-accent bg-nomi-accent-soft'
                          : 'border-transparent hover:bg-nomi-ink-05',
                      )}
                      data-production-scope={`episode:${episode.episode}`}
                      aria-current={activeKey === `episode:${episode.episode}` ? 'page' : undefined}
                      onClick={() => onSelectScope({ kind: 'episode', episode: episode.episode as number, shotNumber: 0 })}
                    >
                      <IconStack2 size={14} className="text-nomi-ink-50" />
                      <span className="text-caption font-medium text-nomi-ink">
                        {t('generationCommon.director.sidebar.episodeOverview')}
                      </span>
                    </button>
                  ) : null}

                  {shots.map((shot) => {
                    const shotKey = productionScopeKey(shot.scope)
                    const info = shotInfo(shot)
                    return (
                      <button
                        type="button"
                        key={shotKey}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left',
                          activeKey === shotKey
                            ? 'border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]'
                            : 'border-transparent hover:bg-nomi-ink-05',
                        )}
                        data-production-scope={shotKey}
                        data-shot-status={info.progress.complete ? 'complete' : info.progress.hasFailure ? 'failed' : 'unfinished'}
                        aria-current={activeKey === shotKey ? 'true' : undefined}
                        onClick={() => onSelectScope(shot.scope)}
                      >
                        <span
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums',
                            activeKey === shotKey
                              ? 'bg-nomi-accent text-white'
                              : info.progress.complete
                                ? 'bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success'
                                : info.progress.hasFailure
                                  ? 'bg-[color-mix(in_oklch,var(--workbench-danger)_12%,transparent)] text-workbench-danger'
                                  : 'bg-nomi-ink-05 text-nomi-ink-60',
                          )}
                        >
                          {info.progress.complete ? <IconCheck size={13} /> : shot.scope.shotNumber}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-caption font-semibold text-nomi-ink">
                            {t('generationCommon.director.sidebar.shot', { shot: shot.scope.shotNumber })}
                          </span>
                          <span className={cn(
                            'mt-0.5 flex items-center gap-1 text-micro',
                            info.progress.hasFailure ? 'text-workbench-danger' : 'text-nomi-ink-40',
                          )}>
                            {info.progress.hasFailure ? <IconAlertTriangle size={11} /> : null}
                            {t(`generationCommon.director.sidebar.status.${info.status}` as 'generationCommon.director.sidebar.status.complete', {
                              stage: t(`generationCommon.director.stages.${info.progress.current.id}.title` as 'generationCommon.director.stages.script.title'),
                            })}
                          </span>
                        </span>
                        <span className="text-micro font-semibold tabular-nums text-nomi-ink-40">
                          {t('generationCommon.director.sidebar.stageProgress', {
                            completed: info.progress.productionCompletedCount,
                            total: info.progress.productionStageCount,
                          })}
                        </span>
                      </button>
                    )
                  })}
                  {!shots.length ? (
                    <div className="px-2 py-4 text-center text-micro text-nomi-ink-40">
                      {t('generationCommon.director.sidebar.emptyFilter')}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
