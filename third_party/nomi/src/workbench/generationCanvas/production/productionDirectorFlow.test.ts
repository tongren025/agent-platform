import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode } from '../model/generationCanvasTypes'
import {
  deriveProductionDirectorProgress,
  productionShotStatus,
} from './productionDirectorFlow'

function node(
  id: string,
  kind: GenerationCanvasNode['kind'],
  productionStage: string,
  resultType?: 'image' | 'video',
  status: GenerationCanvasNode['status'] = resultType ? 'success' : 'idle',
): GenerationCanvasNode {
  return {
    id,
    kind,
    title: id,
    position: { x: 0, y: 0 },
    status,
    meta: { productionScope: true, episode: 1, shotNumber: 1, productionStage },
    ...(resultType
      ? { result: { id: `${id}-result`, type: resultType, url: `/media/${id}`, createdAt: 1 } }
      : {}),
  }
}

describe('productionDirectorFlow', () => {
  it('对已有剧本、分镜、动态和关键帧的镜头，唯一下一步是生成视频', () => {
    const progress = deriveProductionDirectorProgress({
      nodes: [
        node('script', 'text', 'script'),
        node('storyboard', 'image', 'storyboard', 'image'),
        node('motion', 'text', 'vid_prompt'),
        node('first-frame', 'image', 'img_prompt', 'image'),
      ],
    })

    expect(progress.current.id).toBe('video')
    expect(progress.productionCompletedCount).toBe(4)
    expect(productionShotStatus(progress)).toBe('videoMissing')
  })

  it('结构化阶段优先于长文本关键词，不让一张剧本卡冒充后续全部阶段', () => {
    const script = node('script', 'text', 'script')
    script.prompt = '剧本写完后制作分镜、首帧、运镜和视频提示词'
    const progress = deriveProductionDirectorProgress({ nodes: [script] })

    expect(progress.current.id).toBe('storyboard')
    expect(progress.productionCompletedCount).toBe(1)
  })

  it('视频节点已规划但未出片时提示待出片，失败时提示需处理', () => {
    const base = [
      node('script', 'text', 'script'),
      node('storyboard', 'image', 'storyboard', 'image'),
      node('motion', 'text', 'vid_prompt'),
      node('first-frame', 'image', 'img_prompt', 'image'),
    ]
    const planned = deriveProductionDirectorProgress({
      nodes: [...base, node('video', 'video', 'video')],
    })
    expect(planned.current.id).toBe('video')
    expect(productionShotStatus(planned)).toBe('videoPlanned')

    const failed = deriveProductionDirectorProgress({
      nodes: [...base, node('video', 'video', 'video', undefined, 'error')],
    })
    expect(productionShotStatus(failed)).toBe('needsAttention')
  })

  it('视频成功后进入审片，只有当前视频入轨才算整镜完成', () => {
    const nodes = [
      node('script', 'text', 'script'),
      node('storyboard', 'image', 'storyboard', 'image'),
      node('motion', 'text', 'vid_prompt'),
      node('first-frame', 'image', 'img_prompt', 'image'),
      node('video', 'video', 'video', 'video'),
    ]
    const awaitingReview = deriveProductionDirectorProgress({ nodes })
    expect(awaitingReview.current.id).toBe('review')
    expect(awaitingReview.complete).toBe(false)

    const complete = deriveProductionDirectorProgress({
      nodes,
      timelineSourceNodeIds: new Set(['video']),
    })
    expect(complete.complete).toBe(true)
    expect(productionShotStatus(complete)).toBe('complete')
  })
})
