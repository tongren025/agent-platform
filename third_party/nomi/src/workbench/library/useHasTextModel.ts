import React from 'react'
import { getDesktopBridge } from '../../desktop/bridge'
import { listWorkbenchModelCatalogModels } from '../api/modelCatalogApi'

/**
 * 「文本模型是否已接入」——库页状态条 / 空库提示行的单一数据源。
 * null = 未知（查询中），不渲染告警（避免闪条）；查询失败同样不报警，
 * 状态条只在确证缺失时出现。Web 端无模型目录，视为已接入（不吓人）。
 */
export function useHasTextModel(): { hasTextModel: boolean | null; refresh: () => void } {
  const [hasTextModel, setHasTextModel] = React.useState<boolean | null>(null)
  const refresh = React.useCallback(() => {
    if (!getDesktopBridge()) {
      setHasTextModel(true)
      return
    }
    listWorkbenchModelCatalogModels({ kind: 'text', enabled: true })
      .then((models) => setHasTextModel(models.length > 0))
      .catch(() => setHasTextModel(true))
  }, [])
  React.useEffect(() => {
    refresh()
    // 模型目录变更（OnboardingDrawer.refresh 广播）→ 立即重查，状态条/弱入口当场翻面
    window.addEventListener('nomi-model-catalog-changed', refresh)
    return () => window.removeEventListener('nomi-model-catalog-changed', refresh)
  }, [refresh])
  return { hasTextModel, refresh }
}
