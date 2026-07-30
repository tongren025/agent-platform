import { create } from 'zustand'
import type { GenerationCanvasNode } from '../model/generationCanvasTypes'
import {
  buildProductionHierarchy,
  defaultProductionScope,
  hierarchyContainsScope,
  productionMetaForScope,
  productionScopeKey,
  readProductionNodeScope,
  type ProductionHierarchy,
  type ProductionScope,
} from './productionHierarchy'

type ProductionScopeState = {
  projectId: string | null
  hierarchy: ProductionHierarchy
  activeScope: ProductionScope | null
  syncProject: (projectId: string | null, nodes: readonly GenerationCanvasNode[]) => void
  setActiveScope: (scope: ProductionScope) => void
  activateNode: (node: GenerationCanvasNode) => void
}

const EMPTY_HIERARCHY = buildProductionHierarchy([])
const SCOPE_STORAGE_PREFIX = 'agent-studio.production-scope.'

function readStoredScope(projectId: string | null): ProductionScope | null {
  if (!projectId || typeof window === 'undefined') return null
  try {
    const value = JSON.parse(window.localStorage.getItem(`${SCOPE_STORAGE_PREFIX}${projectId}`) ?? 'null') as unknown
    if (!value || typeof value !== 'object') return null
    const scope = value as Partial<ProductionScope>
    if (scope.kind === 'global') return { kind: 'global', episode: null, shotNumber: 0 }
    if (scope.kind === 'episode' && typeof scope.episode === 'number') {
      return { kind: 'episode', episode: scope.episode, shotNumber: 0 }
    }
    if (
      scope.kind === 'shot' &&
      (scope.episode === null || typeof scope.episode === 'number') &&
      typeof scope.shotNumber === 'number'
    ) {
      return { kind: 'shot', episode: scope.episode, shotNumber: scope.shotNumber }
    }
  } catch {
    // 历史坏值直接忽略，不能阻止项目打开。
  }
  return null
}

function storeScope(projectId: string | null, scope: ProductionScope): void {
  if (!projectId || typeof window === 'undefined') return
  window.localStorage.setItem(`${SCOPE_STORAGE_PREFIX}${projectId}`, JSON.stringify(scope))
}

export const useProductionScopeStore = create<ProductionScopeState>((set, get) => ({
  projectId: null,
  hierarchy: EMPTY_HIERARCHY,
  activeScope: null,
  syncProject: (projectId, nodes) => {
    const hierarchy = buildProductionHierarchy(nodes)
    const current = get()
    const projectChanged = current.projectId !== projectId
    const storedScope = projectChanged ? readStoredScope(projectId) : current.activeScope
    const activeScope =
      hierarchyContainsScope(hierarchy, storedScope)
        ? storedScope
        : defaultProductionScope(hierarchy)
    set({ projectId, hierarchy, activeScope })
  },
  setActiveScope: (scope) => {
    if (!hierarchyContainsScope(get().hierarchy, scope)) return
    storeScope(get().projectId, scope)
    set({ activeScope: scope })
  },
  activateNode: (node) => {
    const scope = readProductionNodeScope(node)
    if (scope && hierarchyContainsScope(get().hierarchy, scope)) {
      storeScope(get().projectId, scope)
      set({ activeScope: scope })
    }
  },
}))

export function activeProductionScopeKey(): string {
  return productionScopeKey(useProductionScopeStore.getState().activeScope)
}

/** 所有新节点自动继承当前镜头，避免创建后掉出当前层级。 */
export function withActiveProductionScopeMeta(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  const state = useProductionScopeStore.getState()
  if (!state.hierarchy.isProductionProject || !state.activeScope) return meta
  return {
    ...(meta ?? {}),
    ...productionMetaForScope(state.activeScope),
  }
}
