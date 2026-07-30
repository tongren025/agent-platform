import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode, GenerationCanvasSnapshot } from '../model/generationCanvasTypes'
import {
  buildProductionHierarchy,
  defaultProductionScope,
  filterProductionSnapshot,
  filterProductionTimeline,
  isNodeInProductionDisplayScope,
  resolveProductionScope,
} from './productionHierarchy'

function node(
  id: string,
  episode: number | null,
  shotNumber: number,
  resultType?: 'image' | 'video',
): GenerationCanvasNode {
  return {
    id,
    kind: resultType ?? 'text',
    title: id,
    position: { x: 0, y: 0 },
    meta: { productionCardId: id, episode, shotNumber },
    ...(resultType
      ? { result: { id: `${id}-result`, type: resultType, url: `/media/${id}`, createdAt: 1 }, status: 'success' }
      : {}),
  }
}

describe('productionHierarchy', () => {
  it('按集和镜头建立层级并默认进入第一镜', () => {
    const nodes = [
      node('global', null, 0),
      node('ep1-overview', 1, 0),
      node('ep1-g2', 1, 2, 'video'),
      node('ep1-g1-a', 1, 1, 'image'),
      node('ep1-g1-b', 1, 1, 'video'),
      node('ep2-g1', 2, 1),
    ]
    const hierarchy = buildProductionHierarchy(nodes)

    expect(hierarchy.totalShotCount).toBe(3)
    expect(hierarchy.episodes.map((episode) => episode.episode)).toEqual([1, 2])
    expect(hierarchy.episodes[0].shots.map((shot) => shot.scope.shotNumber)).toEqual([1, 2])
    expect(hierarchy.episodes[0].shots[0]).toMatchObject({
      nodeCount: 2,
      generatedCount: 2,
      imageCount: 1,
      videoCount: 1,
    })
    expect(defaultProductionScope(hierarchy)).toEqual({ kind: 'shot', episode: 1, shotNumber: 1 })
    expect(resolveProductionScope(nodes, null)).toEqual({ kind: 'shot', episode: 1, shotNumber: 1 })
    expect(resolveProductionScope(nodes, { kind: 'shot', episode: 9, shotNumber: 9 })).toEqual({
      kind: 'shot',
      episode: 1,
      shotNumber: 1,
    })
  })

  it('显示只保留当前镜头，AI 上下文保留全局与本集资料', () => {
    const nodes = [
      node('global', null, 0),
      node('overview', 1, 0),
      node('g1', 1, 1),
      node('g2', 1, 2),
      {
        id: 'free',
        kind: 'text',
        title: '自由节点',
        position: { x: 0, y: 0 },
      },
    ]
    const scope = { kind: 'shot', episode: 1, shotNumber: 1 } as const
    expect(nodes.filter((item) => isNodeInProductionDisplayScope(item, scope)).map((item) => item.id)).toEqual(['g1'])

    const snapshot: GenerationCanvasSnapshot = {
      nodes,
      edges: [
        { id: 'global-g1', source: 'global', target: 'g1' },
        { id: 'g2-g1', source: 'g2', target: 'g1' },
      ],
      selectedNodeIds: ['g1', 'g2'],
      groups: [],
    }
    const filtered = filterProductionSnapshot(snapshot, scope)
    expect(filtered.nodes.map((item) => item.id)).toEqual(['global', 'overview', 'g1', 'free'])
    expect(filtered.edges.map((edge) => edge.id)).toEqual(['global-g1'])
    expect(filtered.selectedNodeIds).toEqual(['g1'])
  })

  it('镜头态时间轴只显示当前镜头，本集态显示整集镜头', () => {
    const nodes = [node('g1', 1, 1, 'video'), node('g2', 1, 2, 'video'), node('ep2-g1', 2, 1, 'video')]
    const timeline = {
      version: 1 as const,
      fps: 30,
      scale: 1,
      playheadFrame: 0,
      tracks: [{
        id: 'videoTrack',
        type: 'video' as const,
        label: '视频轨',
        clips: nodes.map((item, index) => ({
          id: `clip-${item.id}`,
          type: 'video' as const,
          sourceNodeId: item.id,
          label: item.id,
          startFrame: index * 30,
          endFrame: index * 30 + 30,
          frameCount: 30,
          offsetStartFrame: 0,
          offsetEndFrame: 0,
        })),
      }],
      textClips: [],
    }

    expect(
      filterProductionTimeline(timeline, nodes, { kind: 'shot', episode: 1, shotNumber: 2 })
        .tracks[0].clips.map((clip) => clip.sourceNodeId),
    ).toEqual(['g2'])
    expect(
      filterProductionTimeline(timeline, nodes, { kind: 'episode', episode: 1, shotNumber: 0 })
        .tracks[0].clips.map((clip) => clip.sourceNodeId),
    ).toEqual(['g1', 'g2'])
  })
})
