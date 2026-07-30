import type { GuidedProductionStageId } from './guidedProductionFlow'

export type GuidedProductionWorkerStage = Exclude<GuidedProductionStageId, 'idea' | 'review'>

/**
 * 制作向导按生产阶段自动派工。用户仍可在普通聊天中手选员工，但点击“下一步”时，
 * 系统必须把任务交给对应岗位，不能沿用上一阶段残留的员工选择。
 */
export function guidedEmployeeForStage(
  stage: GuidedProductionWorkerStage,
  generating = false,
): string {
  const employeeByStage: Record<GuidedProductionWorkerStage, string> = {
    script: 'comic-screenwriter',
    style: 'comic-vfx-designer',
    character: generating ? 'comic-character-artist' : 'comic-character-designer',
    scene: generating ? 'comic-scene-artist' : 'comic-scene-designer',
    storyboard: 'comic-storyboard',
    motion: 'comic-trajectory-artist',
    keyframe: 'comic-keyframe-artist',
    video: 'comic-video-artist',
  }
  return employeeByStage[stage]
}
