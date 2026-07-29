import type { Input, WebContents } from 'electron'

export type AppWindowInput = Pick<Input, 'key' | 'code' | 'control' | 'meta' | 'alt'>
  & Partial<Pick<Input, 'shift'>>

const PAGE_ZOOM_KEYS = new Set(['+', '-', '=', '0', 'Add', 'Subtract'])
const PAGE_ZOOM_CODES = new Set(['Equal', 'Minus', 'Digit0', 'NumpadAdd', 'NumpadSubtract', 'Numpad0'])

export function isAppPageZoomShortcut(input: AppWindowInput): boolean {
  if ((!input.control && !input.meta) || input.alt) return false
  return PAGE_ZOOM_KEYS.has(input.key) || PAGE_ZOOM_CODES.has(input.code)
}

function resetPageZoom(contents: WebContents): void {
  if (contents.isDestroyed()) return
  if (contents.getZoomFactor() !== 1) contents.setZoomFactor(1)
}

export function installAppPageZoomGuard(contents: WebContents): void {
  resetPageZoom(contents)
  contents.on('did-finish-load', () => resetPageZoom(contents))
  contents.on('before-input-event', (event, input) => {
    if (!isAppPageZoomShortcut(input)) return
    event.preventDefault()
    resetPageZoom(contents)
  })
}
