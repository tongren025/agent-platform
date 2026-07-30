import { getAssistantModelPref } from '../ai/assistantModelPref'
import { readWindowUrlParam } from '../windowUrlParam'

export type AcceptedCanvasPrompt = {
  kind: 'character' | 'scene' | 'storyboard' | 'image_prompt' | 'video_prompt' | 'prompt_refine'
  title?: string
  prompt: string
}

/**
 * 用户确认采用后才调用。失败不回滚已经完成的画布操作，学习是增强链而不是写画布的前置条件。
 */
export async function recordAcceptedCanvasPrompts(items: AcceptedCanvasPrompt[]): Promise<void> {
  if (typeof window === 'undefined' || items.length === 0) return
  const pref = getAssistantModelPref()
  const employeeKey = pref?.vendorKey === 'platform-employee' ? pref.modelKey : ''
  const token = window.localStorage.getItem('user_token')
  const response = await fetch('/api/v1/agentapp/canvas/workbench/prompt-learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      projectId: readWindowUrlParam('projectId'),
      employeeKey,
      items,
    }),
  })
  if (!response.ok) throw new Error(`画布提示词学习失败（${response.status}）`)
  const envelope = await response.json() as { code?: number; message?: string }
  if (envelope.code !== 200) throw new Error(envelope.message || '画布提示词学习失败')
}
