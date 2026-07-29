import {
  type ModelCatalogModelDto,
  type ModelCatalogVendorDto,
  listWorkbenchModelCatalogVendors,
} from '../../api/modelCatalogApi'
import { resolveArchetypeForModel, type ModelArchetype } from '../../../config/modelArchetypes'

/**
 * 「可用供应商」= 内置启用 **且** 现在真能用（有 API key，或免鉴权）。
 *
 * 根因修复（2026-06-08）：旧代码把「内置启用（enabled）」当成「能用」，于是用户断开某供应商
 * （只拔了 key，vendor.enabled 仍为 true）后，钉死该供应商的老节点运行时仍去要它的 key →
 * `API key missing: <vendor>`。可用性必须由 hasApiKey 派生，不看 enabled 单独一项。
 */
export function vendorIsUsable(vendor: ModelCatalogVendorDto | null | undefined): boolean {
  if (!vendor || !vendor.enabled) return false
  if (vendor.authType === 'none') return true
  return Boolean(vendor.hasApiKey)
}

export async function loadUsableVendorKeys(
  listVendors: () => Promise<ModelCatalogVendorDto[]> = listWorkbenchModelCatalogVendors,
): Promise<Set<string>> {
  const vendors = await listVendors()
  return new Set(
    (Array.isArray(vendors) ? vendors : [])
      .filter(vendorIsUsable)
      .map((vendor) => String(vendor.key || '').trim())
      .filter(Boolean),
  )
}

function archetypeOfCatalogModel(model: ModelCatalogModelDto): ModelArchetype | null {
  return resolveArchetypeForModel({
    modelKey: model.modelKey,
    modelAlias: model.modelAlias,
    vendorKey: model.vendorKey,
    meta: model.meta,
  })
}

function normalizeIdentifier(value: unknown): string {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed.startsWith('models/') ? trimmed.slice(7) : trimmed
}

function modelMatchesModelKey(model: ModelCatalogModelDto, identifier: string): boolean {
  const target = normalizeIdentifier(identifier)
  if (!target) return false
  return [model.modelKey, model.modelAlias]
    .map((value) => normalizeIdentifier(value))
    .filter(Boolean)
    .includes(target)
}

export type UsableModelQuery = {
  /** 节点当前钉的 modelKey（可能是已断开供应商的命名，如 kie 的 `seedream`）。 */
  modelKey: string
  modelAlias?: string
  /** 节点当前钉的供应商（用于解析源 archetype；可空）。 */
  vendor?: string
  /** 节点 meta（resolveArchetypeForModel 会读 meta.archetypeId，并据此特化）。 */
  meta?: unknown
  /** 当前 kind 下、enabled 的全部 catalog 模型。 */
  models: ModelCatalogModelDto[]
  /** 可用供应商 key 集合（loadUsableVendorKeys 的结果）。 */
  usable: Set<string>
}

/**
 * 把一个（可能钉在已断开供应商上的）模型，解析到一个**已连接供应商**提供的同款 catalog 行。
 *
 * 解析顺序（前一步无解才进下一步）：
 *   1. 精确 modelKey —— 可用供应商里存在同 modelKey/别名的行（保留「空供应商按 modelKey 解析」旧行为，
 *      也覆盖无 archetype 的 flat 模型）。
 *   2. 同 archetypeId —— 跨供应商「同款」单一真相源（kie `seedream` ↔ apimart `doubao-seedream-4.5`）。
 *   3. 同 family 兜底 —— Seedance kie(`seedance-2`) ↔ apimart(`seedance-2-apimart`) id 不同但 family 都 `seedance`。
 *
 * 返回命中的 catalog 行；无解返回 null（调用方据此抛清晰错误，而非 cryptic key missing）。
 */
export function resolveUsableModelForNode(query: UsableModelQuery): ModelCatalogModelDto | null {
  const candidates = query.models.filter((model) => model.enabled && query.usable.has(String(model.vendorKey || '').trim()))
  if (!candidates.length) return null

  // 1. 精确 modelKey（含别名）
  const exactKey = candidates.filter((model) => modelMatchesModelKey(model, query.modelKey) || (query.modelAlias ? modelMatchesModelKey(model, query.modelAlias) : false))
  if (exactKey.length) return exactKey[0]

  // 2/3. 按 archetype（同 id 优先，family 兜底）
  const sourceArchetype = resolveArchetypeForModel({
    modelKey: query.modelKey,
    modelAlias: query.modelAlias,
    vendorKey: query.vendor,
    meta: query.meta,
  })
  if (!sourceArchetype) return null

  const byId = candidates.filter((model) => archetypeOfCatalogModel(model)?.id === sourceArchetype.id)
  if (byId.length) return byId[0]

  const byFamily = candidates.filter((model) => archetypeOfCatalogModel(model)?.family === sourceArchetype.family)
  if (byFamily.length) return byFamily[0]

  return null
}

/**
 * 跨档案迁移时（family 兜底命中，源/目标 archetypeId 不同）重映射 node.meta.archetype：
 * 按 transportTaskKind 在目标档案里找意图等价的模式（保住 t2v/i2v / 文生·改图），落不到用目标 defaultModeId。
 * 同档案（id 相同）返回 null —— 调用方保持节点原 archetype meta 不动。
 */
export function remapArchetypeMode(
  sourceArchetype: ModelArchetype | null,
  sourceModeId: string | undefined,
  targetArchetype: ModelArchetype,
): { id: string; modeId: string } | null {
  if (sourceArchetype && sourceArchetype.id === targetArchetype.id) return null

  const sourceMode = sourceArchetype?.modes.find((mode) => mode.id === sourceModeId)
  const sourceTransport = sourceMode ? (sourceMode.transportTaskKind ?? sourceArchetype?.transportTaskKind) : undefined

  const matched = sourceTransport
    ? targetArchetype.modes.find((mode) => (mode.transportTaskKind ?? targetArchetype.transportTaskKind) === sourceTransport)
    : undefined
  const target = matched
    || targetArchetype.modes.find((mode) => mode.id === targetArchetype.defaultModeId)
    || targetArchetype.modes[0]
  return target ? { id: targetArchetype.id, modeId: target.id } : null
}
