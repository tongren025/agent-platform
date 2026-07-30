import type { CreationAiModeId } from '../creation/creationAiModes'

export const GUIDED_CREATION_EVENT = 'agent-studio:guided-production:creation' as const
export const GUIDED_CANVAS_EVENT = 'agent-studio:guided-production:canvas' as const

export type GuidedCreationRequest =
  | {
      action: 'send'
      prompt: string
      modeId: CreationAiModeId
      displayMessage: string
      autoApproveWrites: true
    }
  | {
      action: 'storyboard'
      displayMessage: string
      shotMode: 'image' | 'video' | 'image-video'
    }

export type GuidedCanvasRequest = {
  prompt: string
  displayMessage: string
  autoApproveSafeWrites: true
}

let pendingCreationRequest: GuidedCreationRequest | null = null
let pendingCanvasRequest: GuidedCanvasRequest | null = null

export function requestGuidedCreation(request: GuidedCreationRequest): void {
  pendingCreationRequest = request
  window.dispatchEvent(new CustomEvent<GuidedCreationRequest>(GUIDED_CREATION_EVENT, { detail: request }))
}

export function requestGuidedCanvas(request: GuidedCanvasRequest): void {
  pendingCanvasRequest = request
  window.dispatchEvent(new CustomEvent<GuidedCanvasRequest>(GUIDED_CANVAS_EVENT, { detail: request }))
}

export function consumePendingGuidedCreation(): GuidedCreationRequest | null {
  const request = pendingCreationRequest
  pendingCreationRequest = null
  return request
}

export function consumePendingGuidedCanvas(): GuidedCanvasRequest | null {
  const request = pendingCanvasRequest
  pendingCanvasRequest = null
  return request
}

