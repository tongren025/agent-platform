import React from 'react'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMovie,
  IconPhoto,
  IconStack2,
  IconVideo,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../utils/cn'
import {
  productionScopeKey,
  type ProductionEpisode,
  type ProductionHierarchy,
  type ProductionScope,
} from './productionHierarchy'

type ProductionHierarchyNavigatorProps = {
  projectName?: string
  hierarchy: ProductionHierarchy
  activeScope: ProductionScope | null
  onSelectScope: (scope: ProductionScope) => void
}

function episodeKey(episode: number | null): string {
  return episode === null ? 'unassigned' : String(episode)
}

function scopeShortLabel(scope: ProductionScope | null): string {
  if (!scope) return ''
  if (scope.kind === 'global') return '全局'
  if (scope.kind === 'episode') return `EP${String(scope.episode).padStart(2, '0')}`
  const episode = scope.episode === null ? '未分集' : `EP${String(scope.episode).padStart(2, '0')}`
  return `${episode} · G${scope.shotNumber}`
}

function episodeLabel(
  episode: ProductionEpisode,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  return episode.episode === null
    ? t('generationCommon.productionHierarchy.unassignedEpisode')
    : t('generationCommon.productionHierarchy.episode', { episode: episode.episode })
}

export function ProductionHierarchyNavigator({
  projectName,
  hierarchy,
  activeScope,
  onSelectScope,
}: ProductionHierarchyNavigatorProps): JSX.Element | null {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = React.useState(false)
  const [expandedEpisodes, setExpandedEpisodes] = React.useState<Set<string>>(() => {
    const initial = activeScope?.episode
    return new Set(initial !== undefined ? [episodeKey(initial)] : [])
  })

  React.useEffect(() => {
    if (activeScope?.kind === 'global') return
    const key = episodeKey(activeScope?.episode ?? null)
    setExpandedEpisodes((current) => {
      if (current.has(key)) return current
      return new Set([...current, key])
    })
  }, [activeScope])

  if (!hierarchy.isProductionProject || !activeScope) return null

  if (collapsed) {
    return (
      <button
        type="button"
        className={cn(
          'absolute right-4 top-4 z-[12] inline-flex h-10 items-center gap-2 rounded-full px-3',
          'border border-workbench-border bg-nomi-paper text-body-sm font-semibold text-nomi-ink',
          'shadow-workbench-md cursor-pointer hover:bg-nomi-ink-05',
        )}
        data-production-hierarchy-collapsed="true"
        aria-label={t('generationCommon.productionHierarchy.expand')}
        onClick={() => setCollapsed(false)}
      >
        <IconStack2 size={16} stroke={1.8} className="text-nomi-accent" />
        <span>{scopeShortLabel(activeScope)}</span>
        <IconChevronLeft size={15} stroke={1.8} className="text-nomi-ink-40" />
      </button>
    )
  }

  const activeKey = productionScopeKey(activeScope)
  return (
    <aside
      className={cn(
        'absolute right-4 top-4 z-[12] flex w-[286px] max-h-[calc(100%-32px)] flex-col overflow-hidden',
        'rounded-[18px] border border-workbench-border bg-nomi-paper/95 shadow-workbench-pop backdrop-blur-xl',
      )}
      data-production-hierarchy="true"
      aria-label={t('generationCommon.productionHierarchy.aria')}
    >
      <header className="shrink-0 border-b border-nomi-line px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent">
            <IconStack2 size={17} stroke={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40">
              {t('generationCommon.productionHierarchy.title')}
            </div>
            <div className="mt-0.5 truncate text-body-sm font-semibold text-nomi-ink">
              {projectName || t('generationCommon.productionHierarchy.season')}
            </div>
            <div className="mt-0.5 text-micro text-nomi-ink-50">
              {t('generationCommon.productionHierarchy.seasonSummary', {
                episodes: hierarchy.episodes.filter((episode) => episode.episode !== null).length,
                shots: hierarchy.totalShotCount,
              })}
            </div>
          </div>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
            aria-label={t('generationCommon.productionHierarchy.collapse')}
            onClick={() => setCollapsed(true)}
          >
            <IconChevronRight size={16} stroke={1.8} />
          </button>
        </div>
        <div className="mt-3 rounded-nomi bg-nomi-accent-soft px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-micro font-semibold text-nomi-accent">
              {t('generationCommon.productionHierarchy.currentScope')}
            </span>
            <span className="rounded-full bg-nomi-paper px-2 py-0.5 text-micro font-semibold text-nomi-ink">
              {scopeShortLabel(activeScope)}
            </span>
          </div>
          <p className="m-0 mt-1 text-micro text-nomi-ink-60">
            {activeScope.kind === 'shot'
              ? t('generationCommon.productionHierarchy.currentOnly')
              : t('generationCommon.productionHierarchy.scopeRule')}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
        {hierarchy.globalNodeIds.length ? (
          <button
            type="button"
            className={cn(
              'mb-1 flex w-full items-center gap-2 rounded-nomi border px-2.5 py-2 text-left cursor-pointer',
              activeKey === 'global'
                ? 'border-nomi-accent bg-nomi-accent-soft'
                : 'border-transparent bg-transparent hover:bg-nomi-ink-05',
            )}
            data-production-scope="global"
            onClick={() => onSelectScope({ kind: 'global', episode: null, shotNumber: 0 })}
          >
            <IconPhoto size={16} stroke={1.8} className="shrink-0 text-nomi-ink-50" />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-semibold text-nomi-ink">
                {t('generationCommon.productionHierarchy.global')}
              </span>
              <span className="block truncate text-micro text-nomi-ink-40">
                {t('generationCommon.productionHierarchy.globalDescription')}
              </span>
            </span>
            <span className="text-micro tabular-nums text-nomi-ink-40">{hierarchy.globalNodeIds.length}</span>
          </button>
        ) : null}

        {hierarchy.episodes.map((episode) => {
          const key = episodeKey(episode.episode)
          const expanded = expandedEpisodes.has(key)
          return (
            <section key={key} className="mb-1 overflow-hidden rounded-nomi border border-nomi-line">
              <button
                type="button"
                className="flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left cursor-pointer hover:bg-nomi-ink-10"
                aria-expanded={expanded}
                onClick={() =>
                  setExpandedEpisodes((current) => {
                    const next = new Set(current)
                    if (next.has(key)) next.delete(key)
                    else next.add(key)
                    return next
                  })
                }
              >
                {expanded ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
                <IconMovie size={16} stroke={1.8} className="text-nomi-accent" />
                <span className="min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink">
                  {episodeLabel(episode, t)}
                </span>
                <span className="text-micro tabular-nums text-nomi-ink-40">
                  {episode.generatedCount}/{episode.nodeCount}
                </span>
              </button>

              {expanded ? (
                <div className="space-y-1 bg-nomi-paper p-1.5">
                  {episode.episode !== null && episode.overviewNodeIds.length ? (
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left cursor-pointer',
                        activeKey === `episode:${episode.episode}`
                          ? 'border-nomi-accent bg-nomi-accent-soft'
                          : 'border-transparent hover:bg-nomi-ink-05',
                      )}
                      data-production-scope={`episode:${episode.episode}`}
                      onClick={() =>
                        onSelectScope({ kind: 'episode', episode: episode.episode as number, shotNumber: 0 })
                      }
                    >
                      <IconStack2 size={14} stroke={1.8} className="text-nomi-ink-50" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption font-medium text-nomi-ink">
                          {t('generationCommon.productionHierarchy.episodeOverview')}
                        </span>
                        <span className="block truncate text-micro text-nomi-ink-40">
                          {t('generationCommon.productionHierarchy.episodeOverviewDescription')}
                        </span>
                      </span>
                    </button>
                  ) : null}

                  {episode.shots.map((shot) => {
                    const shotKey = productionScopeKey(shot.scope)
                    return (
                      <button
                        type="button"
                        key={shotKey}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left cursor-pointer',
                          activeKey === shotKey
                            ? 'border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]'
                            : 'border-transparent hover:bg-nomi-ink-05',
                        )}
                        data-production-scope={shotKey}
                        aria-current={activeKey === shotKey ? 'true' : undefined}
                        onClick={() => onSelectScope(shot.scope)}
                      >
                        <span
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums',
                            activeKey === shotKey
                              ? 'bg-nomi-accent text-white'
                              : 'bg-nomi-ink-05 text-nomi-ink-60',
                          )}
                        >
                          G{shot.scope.shotNumber}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-caption font-semibold text-nomi-ink">
                            {t('generationCommon.productionHierarchy.shot', { shot: shot.scope.shotNumber })}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-micro text-nomi-ink-40">
                            <span>
                              {t('generationCommon.productionHierarchy.nodeCount', { count: shot.nodeCount })}
                            </span>
                            {shot.videoCount ? (
                              <span className="inline-flex items-center gap-0.5">
                                <IconVideo size={12} stroke={1.8} />
                                {t('generationCommon.productionHierarchy.videoCount', { count: shot.videoCount })}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="text-micro font-semibold tabular-nums text-nomi-ink-40">
                          {shot.generatedCount}/{shot.nodeCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
