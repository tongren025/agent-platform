import { describe, expect, it } from 'vitest'
import { describeBlockedNotice } from './batchPlanPreview'
import type { DependencyWavePlan } from '../runner/dependencyWaves'

function plan(over: Partial<DependencyWavePlan>): DependencyWavePlan {
  return { waves: [], blocked: [], edgesUsed: [], ...over }
}

describe('describeBlockedNotice — 批量「缺啥提示啥」', () => {
  it('无 blocked → null（不提示）', () => {
    expect(describeBlockedNotice(plan({ waves: [['a', 'b']] }))).toBeNull()
  })

  it('上游参考未生成被拦 → 提示「在等上游参考」', () => {
    const p = plan({
      waves: [['s1']],
      blocked: [{ nodeId: 's2', reason: 'missing-upstream', detail: '上游「创作工位」还没有生成结果' }],
    })
    const msg = describeBlockedNotice(p)
    expect(msg).toContain('1 个在等上游参考')
    expect(msg).toContain('先把它们生成')
  })

  it('循环引用单独计数', () => {
    const p = plan({
      blocked: [
        { nodeId: 'a', reason: 'cycle', detail: '与其他节点构成循环引用' },
        { nodeId: 'b', reason: 'missing-upstream', detail: 'x' },
      ],
    })
    const msg = describeBlockedNotice(p)!
    expect(msg).toContain('1 个在等上游参考')
    expect(msg).toContain('1 个存在循环引用')
  })

  it('空提示词单独提示已跳过，不误报为等待上游', () => {
    const msg = describeBlockedNotice(plan({
      blocked: [{ nodeId: 'empty', reason: 'missing-prompt', detail: '节点提示词为空，无法生成' }],
    }))!
    expect(msg).toContain('没有提示词')
    expect(msg).toContain('不会扣费')
    expect(msg).not.toContain('等待上游')
  })
})
