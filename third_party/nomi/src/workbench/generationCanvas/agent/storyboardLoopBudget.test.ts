import { describe, it, expect } from 'vitest'
import {
  DEFAULT_LOOP_MAX_ROUNDS,
  LOOP_MAX_ROUNDS_CEILING,
  createLoopBudget,
  normalizeMaxRounds,
  remainingRounds,
  isExhausted,
  canStartRound,
  startRound,
  decideNext,
} from './storyboardLoopBudget'

describe('normalizeMaxRounds', () => {
  it('缺省/非数 → 默认 2', () => {
    expect(normalizeMaxRounds(undefined)).toBe(DEFAULT_LOOP_MAX_ROUNDS)
    expect(normalizeMaxRounds('x' as unknown)).toBe(DEFAULT_LOOP_MAX_ROUNDS)
    expect(normalizeMaxRounds(NaN)).toBe(DEFAULT_LOOP_MAX_ROUNDS)
  })

  it('0 合法(纯 verify 不闭环)', () => {
    expect(normalizeMaxRounds(0)).toBe(0)
  })

  it('超上限夹到 ceiling、负数夹到 0、小数取整', () => {
    expect(normalizeMaxRounds(99)).toBe(LOOP_MAX_ROUNDS_CEILING)
    expect(normalizeMaxRounds(-3)).toBe(0)
    expect(normalizeMaxRounds(2.9)).toBe(2)
  })
})

describe('预算推进', () => {
  it('默认预算可走 2 轮，第 3 轮被挡', () => {
    let b = createLoopBudget()
    expect(remainingRounds(b)).toBe(2)
    expect(canStartRound(b)).toBe(true)
    b = startRound(b)
    expect(b.roundsUsed).toBe(1)
    b = startRound(b)
    expect(b.roundsUsed).toBe(2)
    expect(isExhausted(b)).toBe(true)
    expect(canStartRound(b)).toBe(false)
  })

  it('耗尽后 startRound 抛错(绝不静默续花)', () => {
    let b = createLoopBudget(1)
    b = startRound(b)
    expect(() => startRound(b)).toThrow()
  })

  it('startRound 纯函数:不改原 state', () => {
    const b = createLoopBudget(2)
    const next = startRound(b)
    expect(b.roundsUsed).toBe(0)
    expect(next.roundsUsed).toBe(1)
  })

  it('maxRounds=0 → 一开始就耗尽，不能开轮', () => {
    const b = createLoopBudget(0)
    expect(canStartRound(b)).toBe(false)
    expect(isExhausted(b)).toBe(true)
  })
})

describe('decideNext 闭环决策', () => {
  it('无偏差 → done(收敛)', () => {
    expect(decideNext(0, createLoopBudget())).toBe('done')
  })

  it('有偏差且有预算 → replan', () => {
    expect(decideNext(3, createLoopBudget())).toBe('replan')
  })

  it('有偏差但预算耗尽 → exhausted(停,不续花)', () => {
    let b = createLoopBudget(1)
    b = startRound(b)
    expect(decideNext(2, b)).toBe('exhausted')
  })

  it('maxRounds=0 时有偏差直接 exhausted(纯 verify 档不自动回灌)', () => {
    expect(decideNext(1, createLoopBudget(0))).toBe('exhausted')
  })
})
