import { describe, expect, it } from 'vitest'
import { partitionUnitsByTimelinePresence } from './sendStoryboardToTimeline'

// arrange_storyboard_to_timeline 的 append 幂等地基（issue #5）：
// 重复触发不应把已在时间轴上的节点再复制一份到末尾。clip id 含 startFrame，
// 末尾 startFrame 每次不同 → 不加去重会生成「重复 clip」。这里锁 sourceNodeId 去重的纯逻辑。
describe('partitionUnitsByTimelinePresence — append 幂等去重', () => {
  it('已在时间轴上的单位被跳过（reason=already_on_timeline），其余保留', () => {
    const units = [{ nodeId: 'a' }, { nodeId: 'b' }, { nodeId: 'c' }]
    const present = new Set(['b'])
    const { kept, skipped } = partitionUnitsByTimelinePresence(units, present)
    expect(kept.map((u) => u.nodeId)).toEqual(['a', 'c'])
    expect(skipped).toEqual([{ nodeId: 'b', reason: 'already_on_timeline' }])
  })

  it('全部已在轨 → 全部跳过、保留为空（重复触发不再追加任何 clip）', () => {
    const units = [{ nodeId: 'a' }, { nodeId: 'b' }]
    const { kept, skipped } = partitionUnitsByTimelinePresence(units, new Set(['a', 'b']))
    expect(kept).toEqual([])
    expect(skipped.map((s) => s.nodeId)).toEqual(['a', 'b'])
  })

  it('空时间轴（首次 append）→ 全部保留、无跳过', () => {
    const units = [{ nodeId: 'a' }, { nodeId: 'b' }]
    const { kept, skipped } = partitionUnitsByTimelinePresence(units, new Set())
    expect(kept.map((u) => u.nodeId)).toEqual(['a', 'b'])
    expect(skipped).toEqual([])
  })

  it('保留单位时透传完整对象（role/shotIndex 不丢）', () => {
    const units = [
      { nodeId: 'a', role: 'video' as const, shotIndex: 1 },
      { nodeId: 'b', role: 'placeholder' as const, shotIndex: 2 },
    ]
    const { kept } = partitionUnitsByTimelinePresence(units, new Set(['a']))
    expect(kept).toEqual([{ nodeId: 'b', role: 'placeholder', shotIndex: 2 }])
  })
})
