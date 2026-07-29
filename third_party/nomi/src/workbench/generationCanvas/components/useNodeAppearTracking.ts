// 节点出现动画的「新落点」判定（从 GenerationCanvas 抽出，R9/R12 防巨壳）。
// 只让**新出现**的节点弹入（add/paste/Agent）；开项目时已有节点不齐闪。
//
// 根因（P2）：appear 标志必须在**动画时长内粘住**。若用「每次 render 算一遍新 id」的纯派生集，
// add 后 store 常会再改一次 allNodes（自动选中/归一化等）→ 派生集立刻清空 → 动画半路被掐断。
// 故改为：effect 侦测新 id → 进 appeared 集 → 计时器到点（>动画 340ms）才移除，期间任何重渲染都不影响。
import React from 'react'

const APPEAR_HOLD_MS = 420

export function useNodeAppearTracking(allNodes: { id: string }[]): Set<string> {
  const seenRef = React.useRef<Set<string> | null>(null)
  const mountedRef = React.useRef(true)
  const [appeared, setAppeared] = React.useState<Set<string>>(() => new Set())

  React.useEffect(() => () => { mountedRef.current = false }, [])

  React.useEffect(() => {
    if (seenRef.current === null) {
      // 首帧收录全部现有 id（含其它分类，避免切分类重放）——这些都不弹。
      seenRef.current = new Set(allNodes.map((node) => node.id))
      return
    }
    const seen = seenRef.current
    const fresh: string[] = []
    for (const node of allNodes) {
      if (!seen.has(node.id)) {
        seen.add(node.id)
        fresh.push(node.id)
      }
    }
    if (fresh.length === 0) return
    setAppeared((prev) => {
      const next = new Set(prev)
      for (const id of fresh) next.add(id)
      return next
    })
    window.setTimeout(() => {
      if (!mountedRef.current) return
      setAppeared((prev) => {
        const next = new Set(prev)
        for (const id of fresh) next.delete(id)
        return next
      })
    }, APPEAR_HOLD_MS)
  }, [allNodes])

  return appeared
}
