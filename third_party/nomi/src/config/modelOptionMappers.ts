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
  const seen = new Set<string>()
  const out: ModelOption[] = []
  for (const item of items) {
    const alias = typeof item?.modelAlias === 'string' ? item.modelAlias.trim() : ''
    const modelKey = typeof item?.modelKey === 'string' ? item.modelKey.trim() : ''
    const value = modelKey || alias
    if (!value || seen.has(value)) continue
    seen.add(value)
    const labelZh = typeof item?.labelZh === 'string' ? item.labelZh.trim() : ''
    const label = labelZh || alias || value
    const vendor = typeof item?.vendorKey === 'string' ? item.vendorKey : undefined
    // 认得的模型（按模型身份，供应商无关）→ 用内置档案的控件覆盖 meta.parameterControls，
    // 这样现有渲染路径不变就能渲染档案控件；认不出则保持原 meta（走通用 flat 解析）。
    const archControls = archetypeParameterControls({ modelKey: modelKey || value, modelAlias: alias, vendorKey: vendor, meta: item?.meta })
    const meta = archControls
      ? { ...(item?.meta && typeof item.meta === 'object' ? item.meta : {}), parameterControls: archControls }
      : item?.meta
    out.push({
      value,
      label,
      vendor,
      modelKey: modelKey || value,
      modelAlias: alias || null,
      meta,
      pricing: toCatalogModelPricing(item?.pricing),
    })
  }
  return out
}
