import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkbenchStore } from '../../workbenchStore'
import type { StoryboardPlan } from '../../generationCanvas/agent/storyboardPlan'

const plan: StoryboardPlan = {
  title: '测试方案',
  anchors: [],
  shots: [{ index: 1, durationSec: 5, anchorIds: [], prompt: '镜一' }],
}

function reset() {
  useWorkbenchStore.getState().discardStoryboardPlan()
}

// 锁分镜卡片回看的生命周期不变量(核心:确认落画布不焚、载入态收起)。
describe('分镜方案卡片 生命周期', () => {
  beforeEach(reset)

  it('setStoryboardPlan = 草稿态;editorOpen 不被强开(由调用方管)', () => {
    const s = useWorkbenchStore.getState()
    s.setStoryboardEditorOpen(false)
    s.setStoryboardPlan(plan)
    const after = useWorkbenchStore.getState()
    expect(after.storyboardPlan).toEqual(plan)
    expect(after.storyboardPlanCommitted).toBe(false)
    expect(after.storyboardEditorOpen).toBe(false)
  })

  it('commitStoryboardPlan 不焚:方案保留、转已落画布、收起编辑器', () => {
    const s = useWorkbenchStore.getState()
    s.setStoryboardPlan(plan)
    s.setStoryboardEditorOpen(true)
    s.commitStoryboardPlan()
    const after = useWorkbenchStore.getState()
    expect(after.storyboardPlan).toEqual(plan) // 关键:不再 setStoryboardPlan(null)
    expect(after.storyboardPlanCommitted).toBe(true)
    expect(after.storyboardEditorOpen).toBe(false)
  })

  it('编辑已落画布的方案 → 回落草稿(与画布上旧节点视为不一致)', () => {
    const s = useWorkbenchStore.getState()
    s.setStoryboardPlan(plan)
    s.commitStoryboardPlan()
    s.setStoryboardPlan({ ...plan, title: '改了名' })
    expect(useWorkbenchStore.getState().storyboardPlanCommitted).toBe(false)
  })

  it('discardStoryboardPlan 清空方案 + 收起', () => {
    const s = useWorkbenchStore.getState()
    s.setStoryboardPlan(plan)
    s.setStoryboardEditorOpen(true)
    s.discardStoryboardPlan()
    const after = useWorkbenchStore.getState()
    expect(after.storyboardPlan).toBeNull()
    expect(after.storyboardEditorOpen).toBe(false)
  })

  it('hydrateStoryboardPlan 载入态:恢复 committed、编辑器收起', () => {
    const s = useWorkbenchStore.getState()
    s.hydrateStoryboardPlan(plan, true)
    const after = useWorkbenchStore.getState()
    expect(after.storyboardPlan).toEqual(plan)
    expect(after.storyboardPlanCommitted).toBe(true)
    expect(after.storyboardEditorOpen).toBe(false)
  })

  it('setStoryboardPlan(null) 顺手收起编辑器', () => {
    const s = useWorkbenchStore.getState()
    s.setStoryboardPlan(plan)
    s.setStoryboardEditorOpen(true)
    s.setStoryboardPlan(null)
    expect(useWorkbenchStore.getState().storyboardEditorOpen).toBe(false)
  })
})
