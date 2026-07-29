import { describe, it, expect } from 'vitest'
import { resultUrl, findNodeResultUrl } from './referenceUrl'
import type { GenerationCanvasNode, GenerationNodeResult } from '../model/generationCanvasTypes'

// L2（2026-07-06）：URL 口径翻转为**本地持久文件优先**。providerUrl 是服务商临时直链（kie ~3 天 /
// apimart 72h），过期后「chip 加载失败 + 发死链给服务商」——本地优先让这整类失效；providerUrl 仅在
// 无本地拷贝时兜底（#4「providerUrl-only 被生成侧丢」仍覆盖）。

describe('resultUrl — 本地持久文件优先，providerUrl 兜底', () => {
  it('url + providerUrl 都有 → 取本地 url（nomi-local 永不过期）', () => {
    const result = { url: 'nomi-local://asset/p/a.png', providerUrl: 'https://cdn.kie/a.png' } as GenerationNodeResult
    expect(resultUrl(result)).toBe('nomi-local://asset/p/a.png')
  })
  it('只有 providerUrl（无本地拷贝）→ 兜到 providerUrl（#4 不回归）', () => {
    const result = { providerUrl: 'https://cdn.kie/a.png' } as GenerationNodeResult
    expect(resultUrl(result)).toBe('https://cdn.kie/a.png')
  })
  it('都没有 → thumbnailUrl 最后兜底；全空 → 空串', () => {
    expect(resultUrl({ thumbnailUrl: 'https://cdn/t.png' } as GenerationNodeResult)).toBe('https://cdn/t.png')
    expect(resultUrl({} as GenerationNodeResult)).toBe('')
    expect(resultUrl(undefined)).toBe('')
  })
})

describe('findNodeResultUrl — 节点/历史引用同口径', () => {
  const node = {
    id: 'n1', kind: 'image', title: '', position: { x: 0, y: 0 }, prompt: '',
    result: { id: 'r2', url: 'nomi-local://asset/p/r2.png', providerUrl: 'https://cdn/r2.png' },
    history: [{ id: 'r1', providerUrl: 'https://cdn/r1.png' }],
  } as unknown as GenerationCanvasNode
  const byId = new Map([[node.id, node]])
  it('nodeId → 当前 result 的本地 url', () => {
    expect(findNodeResultUrl(byId, 'n1')).toBe('nomi-local://asset/p/r2.png')
  })
  it('nodeId:resultId → 历史条目（providerUrl-only 兜底仍可用）', () => {
    expect(findNodeResultUrl(byId, 'n1:r1')).toBe('https://cdn/r1.png')
  })
})
