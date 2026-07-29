import { describe, expect, it } from 'vitest'
import { isAppPageZoomShortcut } from './windowInput'

type TestInput = Parameters<typeof isAppPageZoomShortcut>[0]

function input(overrides: Partial<TestInput> = {}): TestInput {
  return {
    key: '',
    code: '',
    control: false,
    meta: false,
    alt: false,
    ...overrides,
  }
}

describe('isAppPageZoomShortcut', () => {
  it.each([
    { key: '-', code: 'Minus' },
    { key: '=', code: 'Equal' },
    { key: '+', code: 'Equal' },
    { key: '0', code: 'Digit0' },
    { key: 'Add', code: 'NumpadAdd' },
    { key: 'Subtract', code: 'NumpadSubtract' },
    { key: '0', code: 'Numpad0' },
  ])('识别 Meta + $code 为应用壳缩放快捷键', ({ key, code }) => {
    expect(isAppPageZoomShortcut(input({ key, code, meta: true }))).toBe(true)
  })

  it.each([
    { key: '-', code: 'Minus' },
    { key: '=', code: 'Equal' },
    { key: '+', code: 'Equal' },
    { key: '0', code: 'Digit0' },
  ])('识别 Control + $code 为应用壳缩放快捷键', ({ key, code }) => {
    expect(isAppPageZoomShortcut(input({ key, code, control: true }))).toBe(true)
  })

  it('允许 Shift 参与输入 +，不把正常加号漏掉', () => {
    expect(isAppPageZoomShortcut(input({ key: '+', code: 'Equal', control: true, shift: true }))).toBe(true)
  })

  it.each([
    input({ key: '-', code: 'Minus' }),
    input({ key: '-', code: 'Minus', alt: true, control: true }),
    input({ key: 'a', code: 'KeyA', control: true }),
    input({ key: 'ArrowUp', code: 'ArrowUp', meta: true }),
  ])('不拦无修饰键、AltGr 或普通快捷键', (candidate) => {
    expect(isAppPageZoomShortcut(candidate)).toBe(false)
  })
})
