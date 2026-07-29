import { getDesktopActiveProjectId } from '../../desktop/activeProject'
import { getDesktopBridge } from '../../desktop/bridge'
import type { TaskKind } from './taskApi'

export type WorkbenchAssetDto = {
  id: string
  name: string
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
  userId: string
  projectId?: string | null
}

/** 从落盘资产 DTO 取可持久化 URL；无则空串。单一实现，别在各 adapter 各抄一份（P1）。 */
export function hostedAssetUrl(asset: WorkbenchAssetDto | null | undefined): string {
  return typeof asset?.data?.url === 'string' ? asset.data.url.trim() : ''
}

export type UploadWorkbenchAssetMeta = {
  prompt?: string | null
  vendor?: string | null
  modelKey?: string | null
  taskKind?: TaskKind | string | null
  projectId?: string | null
  ownerNodeId?: string | null
}

type PlatformEnvelope<T> = { code?: number; data?: T; message?: string }

function isPlatformWebRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function platformAssetRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem('user_token')
  const response = await fetch(`/api/v1/agentapp/canvas/workbench/assets${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const envelope = await response.json() as PlatformEnvelope<T>
  if (!response.ok || envelope.code !== 200 || envelope.data === undefined) {
    throw new Error(envelope.message || `平台素材请求失败（${response.status}）`)
  }
  return envelope.data
}

function resolveProjectId(meta?: UploadWorkbenchAssetMeta): string {
  const projectId = (meta?.projectId || getDesktopActiveProjectId() || '').trim()
  if (!projectId) throw new Error('projectId is required for local asset import')
  return projectId
}

export function buildWorkbenchAssetImportRequestKey(
  file: File,
  name?: string,
  meta?: UploadWorkbenchAssetMeta,
): string {
  const fileName = typeof file.name === 'string' ? file.name.trim() : ''
  const fileSize = typeof file.size === 'number' && Number.isFinite(file.size) ? String(file.size) : ''
  const lastModified =
    typeof file.lastModified === 'number' && Number.isFinite(file.lastModified)
      ? String(file.lastModified)
      : ''
  const fileType = typeof file.type === 'string' ? file.type.trim().toLowerCase() : ''
  const uploadName = typeof name === 'string' ? name.trim() : ''
  const projectId = typeof meta?.projectId === 'string' ? meta.projectId.trim() : ''
  const ownerNodeId = typeof meta?.ownerNodeId === 'string' ? meta.ownerNodeId.trim() : ''
  return [fileName, fileSize, lastModified, fileType, uploadName, projectId, ownerNodeId].join('|')
}

export async function listWorkbenchLocalAssets(): Promise<{ items: WorkbenchAssetDto[]; cursor: string | null }> {
  const projectId = getDesktopActiveProjectId()
  if (!projectId) return { items: [], cursor: null }
  const desktop = getDesktopBridge()
  if (desktop) {
    return desktop.assets.list({ projectId, limit: 200 }) as Promise<{ items: WorkbenchAssetDto[]; cursor: string | null }>
  }
  if (!isPlatformWebRuntime()) throw new Error('asset list requires a browser or Electron runtime')
  return platformAssetRequest<{ items: WorkbenchAssetDto[]; cursor: string | null }>(
    `?project_id=${encodeURIComponent(projectId)}`,
  )
}

export async function importWorkbenchLocalAssetFile(
  file: File,
  name?: string,
  meta?: UploadWorkbenchAssetMeta,
): Promise<WorkbenchAssetDto> {
  const desktop = getDesktopBridge()
  const projectId = resolveProjectId(meta)
  if (desktop) {
    const arrayBuffer = await file.arrayBuffer()
    return desktop.assets.importFile({
      projectId,
      fileName: name || file.name || 'asset',
      contentType: file.type || 'application/octet-stream',
      bytes: arrayBuffer,
      kind: 'upload',
    }) as Promise<WorkbenchAssetDto>
  }
  if (!isPlatformWebRuntime()) throw new Error('asset import requires a browser or Electron runtime')
  const uploadFile = name && name !== file.name
    ? new File([file], name, { type: file.type, lastModified: file.lastModified })
    : file
  const form = new FormData()
  form.append('file', uploadFile)
  return platformAssetRequest<WorkbenchAssetDto>(
    `/${encodeURIComponent(projectId)}/upload`,
    { method: 'POST', body: form },
  )
}

export async function importWorkbenchRemoteAssetUrl(
  url: string,
  name?: string,
  meta?: UploadWorkbenchAssetMeta,
): Promise<WorkbenchAssetDto> {
  const desktop = getDesktopBridge()
  const projectId = resolveProjectId(meta)
  if (desktop) {
    return desktop.assets.importRemoteUrl({
      projectId,
      url,
      kind: 'upload',
      fileName: name,
      ownerNodeId: meta?.ownerNodeId || null,
    }) as Promise<WorkbenchAssetDto>
  }
  if (!isPlatformWebRuntime()) throw new Error('remote asset import requires a browser or Electron runtime')
  return platformAssetRequest<WorkbenchAssetDto>(
    `/${encodeURIComponent(projectId)}/remote`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        name: name || '',
        ownerNodeId: meta?.ownerNodeId || null,
      }),
    },
  )
}

export async function recoverImportedWorkbenchLocalAssetFile(_file: File): Promise<WorkbenchAssetDto | null> {
  return null
}
