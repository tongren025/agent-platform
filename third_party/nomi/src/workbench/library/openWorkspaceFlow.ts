import type { DesktopBridge } from '../../desktop/bridge'

type WorkspaceOpenResult = { id?: unknown }

type OpenWorkspaceFromLibraryOptions = {
  bridge: DesktopBridge | null
  hydrateProject: (projectId: string) => Promise<boolean> | boolean
  refreshProjects: () => void
  confirmInitialize: (rootPath: string) => Promise<boolean> | boolean
  showMessage: (message: string, tone?: 'success' | 'error') => void
}

type OpenWorkspaceProjectFromPickerOptions = {
  bridge: DesktopBridge | null
  confirmInitialize: (rootPath: string) => Promise<boolean> | boolean
  showMessage: (message: string, tone?: 'success' | 'error') => void
  name?: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : String(error || '打开文件夹失败')
}

function isUninitializedWorkspaceError(error: unknown): boolean {
  return /not initialized|未初始化/i.test(errorMessage(error))
}

function projectIdFromResult(result: unknown): string | null {
  const id = (result as WorkspaceOpenResult | null | undefined)?.id
  return typeof id === 'string' && id.trim() ? id.trim() : null
}

export async function openWorkspaceProjectFromPicker(options: OpenWorkspaceProjectFromPickerOptions): Promise<string | null> {
  const { bridge, confirmInitialize, showMessage, name } = options
  if (!bridge?.workspace) {
    showMessage('当前运行环境不支持打开本地文件夹', 'error')
    return null
  }

  const selection = await bridge.workspace.selectFolder()
  if (selection.canceled) return null

  const rootPath = selection.rootPath
  const openPayload = (initialize: boolean) => (name ? { rootPath, initialize, name } : { rootPath, initialize })
  let opened: unknown
  try {
    opened = await bridge.workspace.openFolder(openPayload(false))
  } catch (error) {
    if (!isUninitializedWorkspaceError(error)) {
      showMessage(errorMessage(error), 'error')
      return null
    }
    const confirmed = await confirmInitialize(rootPath)
    if (!confirmed) return null
    try {
      opened = await bridge.workspace.openFolder(openPayload(true))
    } catch (initializeError) {
      showMessage(errorMessage(initializeError), 'error')
      return null
    }
  }

  const projectId = projectIdFromResult(opened)
  if (!projectId) {
    showMessage('打开的文件夹没有返回有效项目 ID', 'error')
    return null
  }
  return projectId
}

export async function openWorkspaceFromLibrary(options: OpenWorkspaceFromLibraryOptions): Promise<void> {
  const { bridge, hydrateProject, refreshProjects, confirmInitialize, showMessage } = options
  const projectId = await openWorkspaceProjectFromPicker({ bridge, confirmInitialize, showMessage })
  if (!projectId) return
  refreshProjects()
  await hydrateProject(projectId)
}
