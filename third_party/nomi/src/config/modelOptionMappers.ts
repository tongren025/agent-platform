import type { ModelCatalogModelDto } from '../workbench/api/modelCatalogApi'
import type { ModelOption, ModelOptionPricing } from './models'
import { archetypeParameterControls } from './modelArchetypes'

function toCatalogModelPricing(pricing: ModelCatalogModelDto['pricing']): ModelOptionPricing | undefined {
  if (!pricing) return undefined
  const cost = typeof pricing.cost === 'number' && Number.isFinite(pricing.cost)
    ? Math.max(0, Math.floor(pricing.cost))
    : 0
  const specCosts = Array.isArray(pricing.specCosts)
    ? pricing.specCosts
        .map((spec) => {
          const specKey = typeof spec?.specKey === 'string' ? spec.specKey.trim() : ''
          if (!specKey) return null
          const specCost = typeof spec.cost === 'number' && Number.isFinite(spec.cost)
            ? Math.max(0, Math.floor(spec.cost))
            : 0
          return {
            specKey,
            cost: specCost,
            enabled: typeof spec.enabled === 'boolean' ? spec.enabled : true,
          }
        })
        .filter((spec): spec is ModelOptionPricing['specCosts'][number] => spec !== null)
    : []
  return {
    cost,
    enabled: typeof pricing.enabled === 'boolean' ? pricing.enabled : true,
    specCosts,
  }
}

export function toCatalogModelOptions(items: ModelCatalogModelDto[]): ModelOption[] {
  if (!Array.isArray(items)) return []
  const modelKeyCounts = new Map<string, number>()
  for (const item of items) {
    const modelKey = typeof item?.modelKey === 'string' ? item.modelKey.trim() : ''
    if (!modelKey) continue
    const key = modelKey.toLowerCase()
    modelKeyCounts.set(key, (modelKeyCounts.get(key) || 0) + 1)
  }
  const seen = new Set<string>()
  const out: ModelOption[] = []
  for (const item of items) {
    const alias = typeof item?.modelAlias === 'string' ? item.modelAlias.trim() : ''
    const modelKey = typeof item?.modelKey === 'string' ? item.modelKey.trim() : ''
    const vendor = typeof item?.vendorKey === 'string' ? item.vendorKey.trim() : ''
    const identity = modelKey || alias
    // 同一模型可以由多家用户已配置供应商提供。option.value 只用于 UI 定位，重复时加入
    // 供应商命名空间；真正执行仍使用下方 modelKey + vendor，不能因为去重丢掉其中一家。
    const value =
      identity && (modelKeyCounts.get(identity.toLowerCase()) || 0) > 1
        ? `${vendor}::${identity}`
        : identity
    if (!value || seen.has(value)) continue
    seen.add(value)
    const labelZh = typeof item?.labelZh === 'string' ? item.labelZh.trim() : ''
    const label = labelZh || alias || value
    // 认得的模型（按模型身份，供应商无关）→ 用内置档案的控件覆盖 meta.parameterControls，
    // 这样现有渲染路径不变就能渲染档案控件；认不出则保持原 meta（走通用 flat 解析）。
    const archControls = archetypeParameterControls({ modelKey: modelKey || value, modelAlias: alias, vendorKey: vendor, meta: item?.meta })
    const meta = archControls
      ? { ...(item?.meta && typeof item.meta === 'object' ? item.meta : {}), parameterControls: archControls }
      : item?.meta
    out.push({
      value,
      label,
      vendor: vendor || undefined,
      modelKey: modelKey || value,
      modelAlias: alias || null,
      meta,
      pricing: toCatalogModelPricing(item?.pricing),
    })
  }
  return out
}
