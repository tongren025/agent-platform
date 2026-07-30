import { getDesktopBridge } from '../../desktop/bridge'
import type { BillingModelKind } from '../../api/desktopClient'
import i18n from '../../i18n'

// 单一真相源：复用 desktopClient 的 BillingModelKind（含 'audio'），避免两份定义漂移。
export type { BillingModelKind }

export type ModelCatalogVendorAuthType = 'none' | 'bearer' | 'x-api-key' | 'query'

export type ModelCatalogHealthIssueCode =
  | 'catalog_empty'
  | 'vendor_disabled'
  | 'vendor_api_key_missing'
  | 'model_mapping_missing'

export type ModelCatalogHealthIssueDto = {
  code: ModelCatalogHealthIssueCode
  severity: 'error' | 'warning'
  message: string
  vendorKey?: string
  modelKey?: string
  kind?: BillingModelKind
}

export type ModelCatalogHealthDto = {
  ok: boolean
  counts: {
    vendors: number
    enabledVendors: number
    models: number
    enabledModels: number
    mappings: number
    enabledMappings: number
    enabledApiKeys: number
  }
  byKind: Array<{
    kind: BillingModelKind
    enabledModels: number
    executableModels: number
  }>
  issues: ModelCatalogHealthIssueDto[]
}

export type ModelCatalogVendorDto = {
  key: string
  name: string
  enabled: boolean
  hasApiKey?: boolean
  baseUrlHint?: string | null
  authType?: ModelCatalogVendorAuthType
  authHeader?: string | null
  authQueryParam?: string | null
  meta?: unknown
  createdAt: string
  updatedAt: string
}

export type ModelCatalogModelDto = {
  modelKey: string
  vendorKey: string
  modelAlias?: string | null
  labelZh: string
  kind: BillingModelKind
  enabled: boolean
  meta?: unknown
  pricing?: {
    cost: number
    enabled: boolean
    createdAt?: string
    updatedAt?: string
    specCosts: Array<{
      specKey: string
      cost: number
      enabled: boolean
      createdAt?: string
      updatedAt?: string
    }>
  }
  createdAt: string
  updatedAt: string
}

type PlatformEnvelope<T> = {
  code: number
  message?: string
  data: T
}

function isPlatformWebRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function platformRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('user_token') : ''
  const response = await fetch(`/api/v1/agentapp${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const payload = await response.json() as PlatformEnvelope<T>
  if (!response.ok || payload.code !== 200) {
    throw new Error(payload.message || `平台接口请求失败 (${response.status})`)
  }
  return payload.data
}

export async function listWorkbenchModelCatalogVendors(): Promise<ModelCatalogVendorDto[]> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.modelCatalog.listVendors() as ModelCatalogVendorDto[]
  if (!isPlatformWebRuntime()) throw new Error('model catalog requires the Electron desktop runtime')
  return platformRequest<ModelCatalogVendorDto[]>('/canvas/workbench/vendors')
}

export async function getWorkbenchModelCatalogHealth(): Promise<ModelCatalogHealthDto> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.modelCatalog.health() as ModelCatalogHealthDto
  if (!isPlatformWebRuntime()) throw new Error('model catalog requires the Electron desktop runtime')
  const [texts, images, videos] = await Promise.all([
    listWorkbenchModelCatalogModels({ kind: 'text', enabled: true }).catch(() => []),
    listWorkbenchModelCatalogModels({ kind: 'image', enabled: true }).catch(() => []),
    listWorkbenchModelCatalogModels({ kind: 'video', enabled: true }).catch(() => []),
  ])
  const vendors = await listWorkbenchModelCatalogVendors().catch(() => [])
  const total = texts.length + images.length + videos.length
  const enabledVendors = vendors.filter((vendor) => vendor.enabled)
  return {
    ok: total > 0,
    counts: {
      vendors: vendors.length,
      enabledVendors: enabledVendors.length,
      models: total,
      enabledModels: total,
      mappings: total,
      enabledMappings: total,
      enabledApiKeys: enabledVendors.filter(
        (vendor) => vendor.authType === 'none' || vendor.hasApiKey,
      ).length,
    },
    byKind: [
      { kind: 'text', enabledModels: texts.length, executableModels: texts.length },
      { kind: 'image', enabledModels: images.length, executableModels: images.length },
      { kind: 'video', enabledModels: videos.length, executableModels: videos.length },
    ],
    issues: total ? [] : [{
      code: 'catalog_empty',
      severity: 'warning',
      message: i18n.t('runtime.modelCatalog.empty'),
    }],
  }
}

export async function listWorkbenchModelCatalogModels(params?: {
  vendorKey?: string
  kind?: BillingModelKind
  enabled?: boolean
}): Promise<ModelCatalogModelDto[]> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.modelCatalog.listModels(params) as ModelCatalogModelDto[]
  if (!isPlatformWebRuntime()) throw new Error('model catalog requires the Electron desktop runtime')
  const kinds: BillingModelKind[] = params?.kind ? [params.kind] : ['text', 'image', 'video']
  const rows = (
    await Promise.all(kinds.map(async (kind): Promise<ModelCatalogModelDto[]> => {
      if (kind === 'text' || kind === 'image' || kind === 'video') {
        const query = new URLSearchParams({ kind })
        return platformRequest<ModelCatalogModelDto[]>(`/canvas/workbench/models?${query.toString()}`)
      }
      return []
    }))
  ).flat()
  return rows.filter((row) => {
    if (params?.vendorKey && row.vendorKey !== params.vendorKey) return false
    if (params?.enabled !== undefined && row.enabled !== params.enabled) return false
    return true
  })
}

/** 启用/更新一个已存在的目录模型（恢复卡「一键启用被禁用的文本大脑」用）。 */
export async function upsertWorkbenchModelCatalogModel(payload: {
  vendorKey: string
  modelKey: string
  labelZh?: string
  kind?: BillingModelKind
  enabled?: boolean
}): Promise<ModelCatalogModelDto> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.modelCatalog.upsertModel(payload) as ModelCatalogModelDto
  throw new Error('请在 Agent Platform 的“系统设置 → AI 供应商”中管理模型')
}
