export const SOURCE_EDITOR_FOCUS_EVENT = 'nomi:focus-source-editor'

let pendingSourceEditorFocus = false

/**
 * 请求聚焦创作区原稿编辑器。
 *
 * 工作区采用延迟挂载，事件发出时编辑器可能还不存在，因此同时保留一个待处理标记，
 * 由编辑器挂载后消费，避免“去写一句话”只切页面却没有输入焦点。
 */
export function requestSourceEditorFocus(): void {
  pendingSourceEditorFocus = true
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SOURCE_EDITOR_FOCUS_EVENT))
  }
}

export function hasPendingSourceEditorFocus(): boolean {
  return pendingSourceEditorFocus
}

export function consumePendingSourceEditorFocus(): boolean {
  if (!pendingSourceEditorFocus) return false
  pendingSourceEditorFocus = false
  return true
}
