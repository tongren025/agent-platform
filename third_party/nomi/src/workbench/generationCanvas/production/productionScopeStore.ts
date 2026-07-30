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

export const useProductionScopeStore = create<ProductionScopeState>((set, get) => ({
  projectId: null,
  hierarchy: EMPTY_HIERARCHY,
  activeScope: null,
  syncProject: (projectId, nodes) => {
    const hierarchy = buildProductionHierarchy(nodes)
    const current = get()
    const projectChanged = current.projectId !== projectId
    const activeScope =
      !projectChanged && hierarchyContainsScope(hierarchy, current.activeScope)
        ? current.activeScope
        : defaultProductionScope(hierarchy)
    set({ projectId, hierarchy, activeScope })
  },
  setActiveScope: (scope) => {
    if (!hierarchyContainsScope(get().hierarchy, scope)) return
    set({ activeScope: scope })
  },
  activateNode: (node) => {
    const scope = readProductionNodeScope(node)
    if (scope && hierarchyContainsScope(get().hierarchy, scope)) set({ activeScope: scope })
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
