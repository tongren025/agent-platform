import { create } from 'zustand'
import type { WorkspaceFileNode } from '../../../electron/workspace/workspaceFileIndex'

/**
 * Singleton controller for the right-side file preview panel.
 *
 * The file tree (`FileTreeNode`) is deeply recursive and each row owns its own
 * local selection state, so threading an `onPreview` callback down every level
 * would be noisy. A tiny store lets any row open the preview and lets a single
 * `<FilePreviewPanel />` (mounted once, high up) render it — no prop drilling.
 */
type FilePreviewState = {
  open: boolean
  projectId: string
  node: WorkspaceFileNode | null
  openPreview: (projectId: string, node: WorkspaceFileNode) => void
  close: () => void
}

export const useFilePreviewStore = create<FilePreviewState>((set) => ({
  open: false,
  projectId: '',
  node: null,
  openPreview: (projectId, node) => set({ open: true, projectId, node }),
  close: () => set({ open: false, node: null }),
}))
