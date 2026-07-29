import type { ProviderKind } from '../desktop/providerKind'
import { getDesktopBridge } from '../desktop/bridge'
import {
  requireDesktopRuntime,
  openDesktopAgentsChatStream,
  type AgentsChatRequestDto,
  type AgentsChatStreamHandlers,
} from './desktopAgentsChatStream'

// 重导出：openDesktopAgentsChatStream + chatV2 事件适配 + agents-chat 相关类型已拆到
// desktopAgentsChatStream.ts（requireDesktopRuntime 这一守卫也随之搬过去，避免主文件 ↔
// 流模块循环依赖），但 desktopClient 对外公共导出面保持不变。
export {
  coerceAgentUsage,
  type AgentAttachmentPayload,
  type AgentsChatRequestDto,
  type AgentUsage,
  type AgentsChatResponseDto,
  type AgentsChatToolStreamPayload,
  type AgentsChatStreamEvent,
  type AgentChatV2ToolDecision,
  type AgentChatV2Session,
  type AgentsChatStreamHandlers,
} from './desktopAgentsChatStream'

export type BillingModelKind = 'text' | 'image' | 'video' | 'audio' | 'model3d'

export type ProfileKind =
  | 'chat'
  | 'prompt_refine'
  | 'text_to_image'
  | 'image_to_prompt'
  | 'image_to_video'
  | 'text_to_video'
  | 'image_edit'
  | 'text_to_audio'
  | 'image_to_audio'
  | 'transcribe'
  | 'text_to_3d'
  | 'image_to_3d'

export type ModelCatalogVendorAuthType = 'none' | 'bearer' | 'x-api-key' | 'query'
export type ModelCatalogVendorProviderKind = ProviderKind

export type ModelCatalogIntegrationChannelKind =
  | 'official_provider'
  | 'aggregator_gateway'
  | 'private_proxy'
  | 'local_runtime'
  | 'custom_endpoint'

export type ModelCatalogVendorDto = {
  key: string
  name: string
  enabled: boolean
  hasApiKey?: boolean
  baseUrlHint?: string | null
  authType?: ModelCatalogVendorAuthType
  authHeader?: string | null
  authQueryParam?: string | null
  providerKind?: ModelCatalogVendorProviderKind
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

export type HttpOperationDto = {
  method: string
  path: string
  headers?: Record<string, string>
  query?: Record<string, unknown>
  body?: unknown
  response_mapping?: Record<string, unknown>
  provider_meta_mapping?: Record<string, unknown>
}

export type ModelCatalogMappingDto = {
  id: string
  vendorKey: string
  taskKind: ProfileKind
  name: string
  enabled: boolean
  create: HttpOperationDto
  query?: HttpOperationDto
  statusMapping?: Record<string, string[]>
  createdAt: string
  updatedAt: string
}

export type ModelCatalogVendorApiKeyStatusDto = {
  vendorKey: string
  hasApiKey: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type ModelCatalogImportPackageDto = {
  version: string
  exportedAt?: string
  vendors: Array<{
    vendor: {
      key: string
      name: string
      enabled?: boolean
      baseUrlHint?: string | null
      authType?: ModelCatalogVendorAuthType
      authHeader?: string | null
      authQueryParam?: string | null
      meta?: unknown
    }
    apiKey?: {
      apiKey?: string
      enabled?: boolean
    }
    models?: Array<{
      modelKey: string
      vendorKey?: string
      modelAlias?: string | null
      labelZh: string
      kind: BillingModelKind
      enabled?: boolean
      meta?: unknown
      pricing?: ModelCatalogModelDto['pricing']
    }>
    mappings?: Array<{
      id?: string
      vendorKey?: string
      taskKind: ProfileKind
      name: string
      enabled?: boolean
      requestProfile?: unknown
      requestMapping?: unknown
      responseMapping?: unknown
    }>
  }>
}

export type ModelCatalogImportResultDto = {
  imported: {
    vendors: number
    models: number
    mappings: number
  }
  errors: string[]
}

export type ModelCatalogDocsFetchResultDto = {
  url: string
  finalUrl: string
  status: number
  contentType: string
  title: string | null
  text: string
  truncated: boolean
  diagnostics: string[]
}

export type ModelCatalogMappingTestRequestDto = {
  modelKey?: string
  prompt?: string
  stage?: 'create' | 'query' | string
  execute?: boolean
}

export type ModelCatalogMappingTestResultDto = {
  mappingId: string
  vendorKey: string
  taskKind: ProfileKind
  stage: string
  executed: boolean
  ok: boolean
  diagnostics: string[]
  request: unknown
  response?: unknown
}

export async function workbenchAgentsChatStream(
  payload: AgentsChatRequestDto,
  handlers: AgentsChatStreamHandlers,
): Promise<() => void> {
  return openDesktopAgentsChatStream(payload, handlers)
}


/** Wipe the backend conversation memory for a sessionKey ("新对话"). */
export async function clearWorkbenchAgentSession(sessionKey: string): Promise<void> {
  if (!getDesktopBridge() && hasWebRuntime()) {
    const token = window.localStorage.getItem('user_token')
    const response = await fetch(
      `/api/v1/agentapp/agent/sessions/${encodeURIComponent(sessionKey)}`,
      {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
    // 会话可能尚未写入；“新对话”在这种情况下已经达到目的。
    if (response.status === 404) return
    if (!response.ok) throw new Error(`清理平台会话失败（${response.status}）`)
    return
  }
  await requireDesktopRuntime('clear agent session').agents.clearChatV2Session(sessionKey)
}

/** 会话历史:从线程气泡重建该 sessionKey 的模型工作缓存(翻回旧对话接着聊)。 */
export async function seedWorkbenchAgentSession(
  sessionKey: string,
  messages: Array<{ role: string; content: string }>,
): Promise<void> {
  if (messages.length === 0) return
  // 平台会话仓储由 /agent/run 按 sessionId 持久化；历史气泡仍由项目记录恢复，
  // 当前没有“伪造历史消息”接口，Web 端不向服务端写入来源不明的会话。
  if (!getDesktopBridge() && hasWebRuntime()) return
  await requireDesktopRuntime('seed agent session').agents.seedChatV2Session?.(sessionKey, messages)
}

type PlatformEnvelope<T> = { code?: number; data?: T; message?: string }

function hasWebRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function platformGet<T>(path: string): Promise<T> {
  const token = window.localStorage.getItem('user_token')
  const response = await fetch(`/api/v1/agentapp${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const payload = await response.json() as PlatformEnvelope<T>
  if (!response.ok || payload.code !== 200 || payload.data === undefined) {
    throw new Error(payload.message || `平台请求失败（${response.status}）`)
  }
  return payload.data
}

export async function listModelCatalogVendors(): Promise<ModelCatalogVendorDto[]> {
  if (!getDesktopBridge() && hasWebRuntime()) {
    const now = new Date().toISOString()
    return [
      { key: 'platform-employee', name: 'Agent Studio 数字员工', enabled: true, hasApiKey: true, createdAt: now, updatedAt: now },
      { key: 'openrouter', name: 'Agent Studio 媒体模型', enabled: true, hasApiKey: true, createdAt: now, updatedAt: now },
    ]
  }
  return requireDesktopRuntime('model catalog').modelCatalog.listVendors() as ModelCatalogVendorDto[]
}

export async function listModelCatalogModels(params?: {
  vendorKey?: string
  kind?: BillingModelKind
  enabled?: boolean
}): Promise<ModelCatalogModelDto[]> {
  if (!getDesktopBridge() && hasWebRuntime()) {
    if (params?.kind === 'text' || !params?.kind) {
      const employees = await platformGet<Array<Record<string, unknown>>>('/registry/employees')
      const now = new Date().toISOString()
      const textModels = employees.map((employee) => ({
        modelKey: String(employee.employeeKey || employee.employee_key || ''),
        vendorKey: 'platform-employee',
        labelZh: String(employee.name || employee.employeeName || employee.employeeKey || '数字员工'),
        kind: 'text' as const,
        enabled: employee.enabled !== false,
        meta: { description: employee.description || '', employee },
        createdAt: now,
        updatedAt: now,
      })).filter((model) => model.modelKey)
      if (params?.kind === 'text') return textModels
    }
    if (params?.kind === 'image' || params?.kind === 'video') {
      return platformGet<ModelCatalogModelDto[]>(`/canvas/workbench/models?kind=${params.kind}`)
    }
    return []
  }
  return requireDesktopRuntime('model catalog').modelCatalog.listModels(params) as ModelCatalogModelDto[]
}

export async function listModelCatalogMappings(params?: {
  vendorKey?: string
  taskKind?: ProfileKind
  enabled?: boolean
}): Promise<ModelCatalogMappingDto[]> {
  return requireDesktopRuntime('model catalog').modelCatalog.listMappings(params) as ModelCatalogMappingDto[]
}

export async function upsertModelCatalogVendor(
  payload: Partial<ModelCatalogVendorDto> & Pick<ModelCatalogVendorDto, 'key' | 'name'>,
): Promise<ModelCatalogVendorDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.upsertVendor(payload) as ModelCatalogVendorDto
}

export async function deleteModelCatalogVendor(key: string): Promise<void> {
  requireDesktopRuntime('model catalog').modelCatalog.deleteVendor(key)
}

export async function upsertModelCatalogVendorApiKey(
  vendorKey: string,
  payload: { apiKey: string; enabled?: boolean },
): Promise<ModelCatalogVendorApiKeyStatusDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.upsertVendorApiKey(vendorKey, payload) as ModelCatalogVendorApiKeyStatusDto
}

export async function clearModelCatalogVendorApiKey(vendorKey: string): Promise<ModelCatalogVendorApiKeyStatusDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.clearVendorApiKey(vendorKey) as ModelCatalogVendorApiKeyStatusDto
}

export async function upsertModelCatalogModel(
  payload: Partial<ModelCatalogModelDto> & Pick<ModelCatalogModelDto, 'modelKey' | 'vendorKey' | 'labelZh' | 'kind'>,
): Promise<ModelCatalogModelDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.upsertModel(payload) as ModelCatalogModelDto
}

export async function deleteModelCatalogModel(vendorKey: string, modelKey: string): Promise<void> {
  requireDesktopRuntime('model catalog').modelCatalog.deleteModel(vendorKey, modelKey)
}

export async function upsertModelCatalogMapping(
  payload: Partial<ModelCatalogMappingDto> & Pick<ModelCatalogMappingDto, 'vendorKey' | 'taskKind' | 'name'>,
): Promise<ModelCatalogMappingDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.upsertMapping(payload) as ModelCatalogMappingDto
}

export async function deleteModelCatalogMapping(id: string): Promise<void> {
  requireDesktopRuntime('model catalog').modelCatalog.deleteMapping(id)
}

export async function exportModelCatalogPackage(params?: { includeApiKeys?: boolean }): Promise<ModelCatalogImportPackageDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.exportPackage(params) as ModelCatalogImportPackageDto
}

export async function importModelCatalogPackage(payload: ModelCatalogImportPackageDto): Promise<ModelCatalogImportResultDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.importPackage(payload) as ModelCatalogImportResultDto
}

export async function fetchModelCatalogDocs(payload: { url: string }): Promise<ModelCatalogDocsFetchResultDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.fetchDocs(payload) as Promise<ModelCatalogDocsFetchResultDto>
}

export async function testModelCatalogMapping(
  id: string,
  payload: ModelCatalogMappingTestRequestDto,
): Promise<ModelCatalogMappingTestResultDto> {
  return requireDesktopRuntime('model catalog').modelCatalog.testMapping(id, payload) as Promise<ModelCatalogMappingTestResultDto>
}
