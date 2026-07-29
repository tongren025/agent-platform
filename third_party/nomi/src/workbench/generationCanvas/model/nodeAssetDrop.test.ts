import { describe, it, expect } from 'vitest'
import {
  dropKindFromMime,
  dropKindFromNodeKind,
  dropKindFromWorkspaceKind,
  findArraySlotForKind,
  resolveNodeArraySlots,
} from './nodeAssetDrop'

describe('dropKindFromMime — OS 文件 MIME 路由', () => {
  it('image/video/audio 前缀 → 对应 kind', () => {
    expect(dropKindFromMime('image/png')).toBe('image')
    expect(dropKindFromMime('video/mp4')).toBe('video')
    expect(dropKindFromMime('audio/mpeg')).toBe('audio')
  })
  it('其它 / 空 → null', () => {
    expect(dropKindFromMime('application/pdf')).toBeNull()
    expect(dropKindFromMime('')).toBeNull()
    expect(dropKindFromMime(undefined)).toBeNull()
  })
})

describe('dropKindFromWorkspaceKind — 文件树 payload.kind 路由', () => {
  it('已知类型 → kind；未知 / 空 → null', () => {
    expect(dropKindFromWorkspaceKind('image')).toBe('image')
    expect(dropKindFromWorkspaceKind('video')).toBe('video')
    expect(dropKindFromWorkspaceKind('file')).toBeNull()
    expect(dropKindFromWorkspaceKind(undefined)).toBeNull()
  })
})

describe('dropKindFromNodeKind — 画布节点种类 → 产物类型（连线判断 source）', () => {
  it('image 节点 → image，video 节点 → video', () => {
    expect(dropKindFromNodeKind('image')).toBe('image')
    expect(dropKindFromNodeKind('video')).toBe('video')
  })
  it('文本节点无可参考产物 → null（连线落回普通边）', () => {
    expect(dropKindFromNodeKind('text')).toBeNull()
  })
})

describe('resolveNodeArraySlots + findArraySlotForKind — 据 meta 找当前模式的数组槽', () => {
  it('Seedance omni → image/video/audio 三槽；按 kind 命中正确 metaKey', () => {
    const meta = { modelKey: 'seedance-2', archetype: { id: 'seedance-2', modeId: 'omni' } }
    const slots = resolveNodeArraySlots(meta)
    expect(slots.map((s) => s.accept)).toEqual(['image', 'video', 'audio'])
    expect(findArraySlotForKind(slots, 'image')?.metaKey).toBe('referenceImageUrls')
    expect(findArraySlotForKind(slots, 'video')?.metaKey).toBe('referenceVideoUrls')
  })
  it('Seedance 首帧模式 → 无数组槽（互斥）', () => {
    const meta = { modelKey: 'seedance-2', archetype: { id: 'seedance-2', modeId: 'first' } }
    expect(resolveNodeArraySlots(meta)).toEqual([])
    expect(findArraySlotForKind(resolveNodeArraySlots(meta), 'image')).toBeNull()
  })
  it('认不出的模型 → 无数组槽（[]，不接管拖入）', () => {
    expect(resolveNodeArraySlots({ modelKey: 'unknown/model' })).toEqual([])
    expect(resolveNodeArraySlots({})).toEqual([])
    expect(resolveNodeArraySlots(undefined)).toEqual([])
  })
})
