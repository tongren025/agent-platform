import { describe, expect, it } from 'vitest'
import { guidedEmployeeForStage } from './guidedProductionEmployees'

describe('guidedEmployeeForStage', () => {
  it('剧本步骤固定交给编剧，不受上次手选员工影响', () => {
    expect(guidedEmployeeForStage('script')).toBe('comic-screenwriter')
  })

  it('人物和场景在规划与真实生成阶段使用对应岗位', () => {
    expect(guidedEmployeeForStage('character')).toBe('comic-character-designer')
    expect(guidedEmployeeForStage('character', true)).toBe('comic-character-artist')
    expect(guidedEmployeeForStage('scene')).toBe('comic-scene-designer')
    expect(guidedEmployeeForStage('scene', true)).toBe('comic-scene-artist')
  })

  it('后续专业步骤逐一自动派工', () => {
    expect(guidedEmployeeForStage('storyboard')).toBe('comic-storyboard')
    expect(guidedEmployeeForStage('motion')).toBe('comic-trajectory-artist')
    expect(guidedEmployeeForStage('keyframe')).toBe('comic-keyframe-artist')
    expect(guidedEmployeeForStage('video')).toBe('comic-video-artist')
  })
})
