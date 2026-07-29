/**
 * 剧本 → 定妆/定景 launcher（Tier2，复刻 storyboardLauncher 模式）。
 *
 * 创作 AI 面板的「💄 定妆」chip / 自然语言触发调 `requestFixationPlanning(text)`；
 * 生成画布的 assistant 面板在同一 window 事件通道上监听，跑 fixation planner skill：
 * 读剧本 → 为主要角色/场景建卡节点 + 注入按 §5.7 规律写好的身份板提示词 → 用户在 AgentPlanCard 确认落地。
 *
 * 用 window CustomEvent（而非共享 zustand 切片），让 launcher 跨 React 生命周期可用
 * （切换 workspace mode 时面板会重挂）。与 storyboardLauncher 同构。
 */

export const FIXATION_PLANNING_EVENT = 'nomi:generation:fixation:request' as const

export type FixationPlanningRequest = {
  /** 用户在创作区写的剧本全文（或选中段）。 */
  storyText: string
  /** 来源标签（analytics / UI）。 */
  source?: string
}

export const FIXATION_PLANNER_SKILL = {
  key: 'workbench.fixation.planner',
  name: '定妆规划师',
} as const

/** 发给 fixation planner agent 的用户消息（方法论在 skill 正文，这里只递剧本 + 一句指令）。 */
export function buildFixationPlanningMessage(storyText: string): string {
  const trimmed = storyText.trim()
  return [
    '请从下面这段剧本里识别出主要角色与关键场景，为每个建一张卡节点并注入身份板/场景板提示词，写入生成画布。',
    '',
    '--- 剧本正文 ---',
    trimmed,
    '--- 剧本正文结束 ---',
  ].join('\n')
}

/** 派发定妆规划请求。返回是否有监听器（assistant 面板）已挂载，供调用方决定是否回退提示。 */
export function requestFixationPlanning(request: FixationPlanningRequest): boolean {
  if (typeof window === 'undefined') return false
  const event = new CustomEvent<FixationPlanningRequest>(FIXATION_PLANNING_EVENT, { detail: request })
  return window.dispatchEvent(event)
}
