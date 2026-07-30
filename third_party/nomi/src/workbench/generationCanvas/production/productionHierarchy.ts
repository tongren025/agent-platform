import type { GenerationCanvasNode, GenerationCanvasSnapshot } from '../model/generationCanvasTypes'
import type { TimelineState } from '../../timeline/timelineTypes'

export type ProductionScope =
  | { kind: 'global'; episode: null; shotNumber: 0 }
  | { kind: 'episode'; episode: number; shotNumber: 0 }
  | { kind: 'shot'; episode: number | null; shotNumber: number }

export type ProductionShot = {
  scope: ProductionScope & { kind: 'shot' }
  nodeIds: string[]
  nodeCount: number
  generatedCount: number
  imageCount: number
  videoCount: number
}

export type ProductionEpisode = {
  episode: number | null
  overviewNodeIds: string[]
  shots: ProductionShot[]
  nodeCount: number
  generatedCount: number
}

export type ProductionHierarchy = {
  isProductionProject: boolean
  globalNodeIds: string[]
  episodes: ProductionEpisode[]
  totalNodeCount: number
  totalShotCount: number
}

function finiteInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return null
}

function isProductionMeta(meta: Record<string, unknown> | undefined): boolean {
  if (!meta) return false
  return Boolean(
    (typeof meta.productionCardId === 'string' && meta.productionCardId.trim()) ||
      meta.productionScope === true,
  )
}

/** 读取节点所属制作单元。只有生产项目节点会进入层级，普通自由画布保持原行为。 */
export function readProductionNodeScope(node: GenerationCanvasNode): ProductionScope | null {
  if (!isProductionMeta(node.meta)) return null
  const episode = finiteInteger(node.meta?.episode)
  const shotNumber = Math.max(0, finiteInteger(node.meta?.shotNumber) ?? 0)
  if (shotNumber > 0) return { kind: 'shot', episode, shotNumber }
  if (episode !== null) return { kind: 'episode', episode, shotNumber: 0 }
  return { kind: 'global', episode: null, shotNumber: 0 }
}

export function productionScopeKey(scope: ProductionScope | null): string {
  if (!scope) return ''
  if (scope.kind === 'global') return 'global'
  if (scope.kind === 'episode') return `episode:${scope.episode}`
  return `shot:${scope.episode ?? 'unassigned'}:${scope.shotNumber}`
}

export function productionScopesEqual(left: ProductionScope | null, right: ProductionScope | null): boolean {
  return productionScopeKey(left) === productionScopeKey(right)
}

function countGenerated(nodes: readonly GenerationCanvasNode[]): number {
  return nodes.filter((node) => node.status === 'success' || Boolean(node.result)).length
}

export function buildProductionHierarchy(nodes: readonly GenerationCanvasNode[]): ProductionHierarchy {
  const scopedNodes = nodes
    .map((node) => ({ node, scope: readProductionNodeScope(node) }))
    .filter((entry): entry is { node: GenerationCanvasNode; scope: ProductionScope } => Boolean(entry.scope))
  if (!scopedNodes.length) {
    return {
      isProductionProject: false,
      globalNodeIds: [],
      episodes: [],
      totalNodeCount: 0,
      totalShotCount: 0,
    }
  }

  const globalNodeIds: string[] = []
  const episodes = new Map<number | null, { overview: GenerationCanvasNode[]; shots: Map<number, GenerationCanvasNode[]> }>()
  for (const { node, scope } of scopedNodes) {
    if (scope.kind === 'global') {
      globalNodeIds.push(node.id)
      continue
    }
    const bucket = episodes.get(scope.episode) ?? { overview: [], shots: new Map<number, GenerationCanvasNode[]>() }
    episodes.set(scope.episode, bucket)
    if (scope.kind === 'episode') {
      bucket.overview.push(node)
      continue
    }
    const shotNodes = bucket.shots.get(scope.shotNumber) ?? []
    shotNodes.push(node)
    bucket.shots.set(scope.shotNumber, shotNodes)
  }

  const normalizedEpisodes = Array.from(episodes.entries())
    .sort(([left], [right]) => {
      if (left === null) return 1
      if (right === null) return -1
      return left - right
    })
    .map(([episode, bucket]): ProductionEpisode => {
      const shots = Array.from(bucket.shots.entries())
        .sort(([left], [right]) => left - right)
        .map(([shotNumber, shotNodes]): ProductionShot => ({
          scope: { kind: 'shot', episode, shotNumber },
          nodeIds: shotNodes.map((node) => node.id),
          nodeCount: shotNodes.length,
          generatedCount: countGenerated(shotNodes),
          imageCount: shotNodes.filter((node) => node.result?.type === 'image' || node.kind === 'image').length,
          videoCount: shotNodes.filter((node) => node.result?.type === 'video' || node.kind === 'video').length,
        }))
      const episodeNodes = [...bucket.overview, ...Array.from(bucket.shots.values()).flat()]
      return {
        episode,
        overviewNodeIds: bucket.overview.map((node) => node.id),
        shots,
        nodeCount: episodeNodes.length,
        generatedCount: countGenerated(episodeNodes),
      }
    })

  return {
    isProductionProject: true,
    globalNodeIds,
    episodes: normalizedEpisodes,
    totalNodeCount: scopedNodes.length,
    totalShotCount: normalizedEpisodes.reduce((total, episode) => total + episode.shots.length, 0),
  }
}

export function defaultProductionScope(hierarchy: ProductionHierarchy): ProductionScope | null {
  for (const episode of hierarchy.episodes) {
    if (episode.shots[0]) return episode.shots[0].scope
    if (episode.episode !== null && episode.overviewNodeIds.length) {
      return { kind: 'episode', episode: episode.episode, shotNumber: 0 }
    }
  }
  return hierarchy.globalNodeIds.length ? { kind: 'global', episode: null, shotNumber: 0 } : null
}

export function hierarchyContainsScope(hierarchy: ProductionHierarchy, scope: ProductionScope | null): boolean {
  if (!scope) return false
  if (scope.kind === 'global') return hierarchy.globalNodeIds.length > 0
  const episode = hierarchy.episodes.find((entry) => entry.episode === scope.episode)
  if (!episode) return false
  if (scope.kind === 'episode') return episode.overviewNodeIds.length > 0
  return episode.shots.some((shot) => shot.scope.shotNumber === scope.shotNumber)
}

/**
 * 项目节点刚水合进 store、导航器的 effect 还没来得及同步时，也必须立刻得到一个有效镜头。
 * 否则依赖 activeScope 的制作指引会在首帧把整季节点当成一个画布处理，自动连线可能产生
 * 组合爆炸并锁死主线程。
 */
export function resolveProductionScope(
  nodes: readonly GenerationCanvasNode[],
  scope: ProductionScope | null,
): ProductionScope | null {
  const hierarchy = buildProductionHierarchy(nodes)
  if (!hierarchy.isProductionProject) return null
  return hierarchyContainsScope(hierarchy, scope) ? scope : defaultProductionScope(hierarchy)
}

/** 画布严格只显示当前层级，避免一次把整季所有镜头挂进 DOM。 */
export function isNodeInProductionDisplayScope(node: GenerationCanvasNode, scope: ProductionScope | null): boolean {
  if (!scope) return true
  const nodeScope = readProductionNodeScope(node)
  // 升级前用户手动创建的自由节点没有制作元数据；统一收进“全局资产”，既不丢失也不污染每个镜头。
  if (!nodeScope) return scope.kind === 'global'
  return productionScopesEqual(nodeScope, scope)
}

/**
 * AI 读取当前镜头时可同时看到项目级与本集级参考，但看不到其他镜头。
 * 这样角色/风格上下文仍完整，真实生成范围又不会越过当前镜头。
 */
export function isNodeInProductionAgentScope(node: GenerationCanvasNode, scope: ProductionScope | null): boolean {
  if (!scope) return true
  const nodeScope = readProductionNodeScope(node)
  if (!nodeScope) return true
  if (productionScopesEqual(nodeScope, scope)) return true
  if (nodeScope.kind === 'global') return true
  return scope.kind === 'shot' && nodeScope.kind === 'episode' && nodeScope.episode === scope.episode
}

export function filterProductionSnapshot(
  snapshot: GenerationCanvasSnapshot,
  scope: ProductionScope | null,
): GenerationCanvasSnapshot {
  if (!scope) return snapshot
  const nodes = snapshot.nodes.filter((node) => isNodeInProductionAgentScope(node, scope))
  const nodeIds = new Set(nodes.map((node) => node.id))
  return {
    nodes,
    edges: snapshot.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)),
    selectedNodeIds: (snapshot.selectedNodeIds ?? []).filter((id) => nodeIds.has(id)),
    groups: snapshot.groups
      .map((group) => ({ ...group, nodeIds: group.nodeIds.filter((id) => nodeIds.has(id)) }))
      .filter((group) => group.nodeIds.length > 0),
  }
}

function isNodeInProductionTimelineScope(node: GenerationCanvasNode, scope: ProductionScope): boolean {
  const nodeScope = readProductionNodeScope(node)
  if (!nodeScope) return scope.kind === 'global'
  if (scope.kind === 'global') return nodeScope.kind === 'global'
  if (scope.kind === 'episode') {
    return nodeScope.kind !== 'global' && nodeScope.episode === scope.episode
  }
  return productionScopesEqual(nodeScope, scope)
}

/**
 * 镜头态时间轴只显示这一镜；本集资料态显示整集，供用户检查十几个镜头的拼接。
 * 时间轴原数据不删除，只做显示投影，切换层级即可回来。
 */
export function filterProductionTimeline(
  timeline: TimelineState,
  nodes: readonly GenerationCanvasNode[],
  scope: ProductionScope | null,
): TimelineState {
  if (!scope) return timeline
  const sourceNodeIds = new Set(
    nodes.filter((node) => isNodeInProductionTimelineScope(node, scope)).map((node) => node.id),
  )
  return {
    ...timeline,
    tracks: timeline.tracks.map((track) => ({
      ...track,
      clips: track.clips.filter((clip) => sourceNodeIds.has(clip.sourceNodeId)),
    })),
  }
}

export function productionMetaForScope(scope: ProductionScope | null): Record<string, unknown> {
  if (!scope) return {}
  return {
    productionScope: true,
    episode: scope.episode,
    shotNumber: scope.shotNumber,
  }
}
