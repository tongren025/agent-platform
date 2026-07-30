import { create } from 'zustand'

export type ProductionDirectorMode = 'guided' | 'professional'

type ProductionDirectorUiState = {
  mode: ProductionDirectorMode
  directoryOpen: boolean
  setMode: (mode: ProductionDirectorMode) => void
  setDirectoryOpen: (open: boolean) => void
  toggleDirectory: () => void
}

const MODE_STORAGE_KEY = 'agent-studio.production-director-mode'

function readStoredMode(): ProductionDirectorMode {
  if (typeof window === 'undefined') return 'guided'
  return window.localStorage.getItem(MODE_STORAGE_KEY) === 'professional' ? 'professional' : 'guided'
}

export const useProductionDirectorUiStore = create<ProductionDirectorUiState>((set) => ({
  // 新用户永远先进入一步一指引；主动切到专业画布后才记住选择。
  mode: readStoredMode(),
  directoryOpen: true,
  setMode: (mode) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(MODE_STORAGE_KEY, mode)
    set({ mode, directoryOpen: mode === 'guided' })
  },
  setDirectoryOpen: (directoryOpen) => set({ directoryOpen }),
  toggleDirectory: () => set((state) => ({ directoryOpen: !state.directoryOpen })),
}))
