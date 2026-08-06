import { beforeEach, describe, expect, it } from 'vitest'
import {
  consumePendingSourceEditorFocus,
  hasPendingSourceEditorFocus,
  requestSourceEditorFocus,
} from './sourceEditorFocus'

describe('原稿编辑器延迟聚焦请求', () => {
  beforeEach(() => {
    consumePendingSourceEditorFocus()
  })

  it('编辑器尚未挂载时保留请求，挂载后只消费一次', () => {
    requestSourceEditorFocus()

    expect(hasPendingSourceEditorFocus()).toBe(true)
    expect(consumePendingSourceEditorFocus()).toBe(true)
    expect(consumePendingSourceEditorFocus()).toBe(false)
  })
})
