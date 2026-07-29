// 有界闭环的「轮次预算」状态机(纯函数)—— HollyWood Town「有限重试有向有环图」的封顶 governor。
// 方案:docs/plan/2026-06-28-storyboard-closed-loop-verify.md（Stage 2 + §6 两套花钱模型）。
//
// 铁律(与渲染层瞬态 retry budget **完全分开**,见 §6):
//   · 瞬态 retry(generationRunController) = 同 run.id replay、绝不二次下单、封顶 5;
//   · 本预算 = 「verify 检出偏差→回灌改分镜→重生坏镜」这种**意图变了的付费重做**的轮次,默认封顶 2。
// 这是纯状态机:不调模型、不下单、不弹确认。startRound 只推进计数;真付费仍由调用方走 spendConfirm。
// roundsUsed 达 maxRounds → 闭环必须停、落「已尽力」态,**绝不静默续花**。

export const DEFAULT_LOOP_MAX_ROUNDS = 2
/** 上限:防误配置成超大轮次把额度烧穿(同 retry 上限 5 的精神)。 */
export const LOOP_MAX_ROUNDS_CEILING = 5

export type LoopBudgetState = {
  /** 本闭环允许的最大回灌重做轮次。0 = 只 verify 提示、不自动回灌(plan §8 的回退档)。 */
  readonly maxRounds: number
  /** 已用轮次。 */
  readonly roundsUsed: number
}

/** maxRounds 归一:非有限数 → 默认;夹取 [0, 上限]。0 合法(纯 verify 不闭环)。 */
export function normalizeMaxRounds(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_LOOP_MAX_ROUNDS
  return Math.max(0, Math.min(LOOP_MAX_ROUNDS_CEILING, Math.floor(value)))
}

export function createLoopBudget(maxRounds: number = DEFAULT_LOOP_MAX_ROUNDS): LoopBudgetState {
  return { maxRounds: normalizeMaxRounds(maxRounds), roundsUsed: 0 }
}

export function remainingRounds(state: LoopBudgetState): number {
  return Math.max(0, state.maxRounds - state.roundsUsed)
}

export function isExhausted(state: LoopBudgetState): boolean {
  return remainingRounds(state) <= 0
}

export function canStartRound(state: LoopBudgetState): boolean {
  return remainingRounds(state) > 0
}

/** 推进一轮(纯:返回新 state,不改原)。预算耗尽时调用 = 编程错误,抛错(调用方必须先 canStartRound)。 */
export function startRound(state: LoopBudgetState): LoopBudgetState {
  if (!canStartRound(state)) {
    throw new Error('闭环轮次预算已耗尽，不能再开新一轮(必须先 canStartRound 守门)')
  }
  return { maxRounds: state.maxRounds, roundsUsed: state.roundsUsed + 1 }
}

/**
 * 闭环下一步决策(纯):给定「本轮校验后剩余的画面偏差数」+ 当前预算 → 该干啥。
 * - 无偏差 → done(闭环成功收敛);
 * - 有偏差且还有预算 → replan(回灌改分镜、重生坏镜,真付费由调用方确认);
 * - 有偏差但预算耗尽 → exhausted(停,落「已尽力,剩下手动处理」,绝不续花)。
 */
export type LoopDecision = 'done' | 'replan' | 'exhausted'

export function decideNext(deviationCount: number, state: LoopBudgetState): LoopDecision {
  if (deviationCount <= 0) return 'done'
  return canStartRound(state) ? 'replan' : 'exhausted'
}
