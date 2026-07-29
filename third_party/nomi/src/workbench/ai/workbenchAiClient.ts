import {
  workbenchAgentsChatStream,
  type AgentAttachmentPayload,
  type AgentChatV2Session,
  type AgentsChatResponseDto,
  type AgentsChatStreamEvent,
} from '../../api/desktopClient'

export type WorkbenchAiRequest = {
  prompt: string
  displayPrompt: string
  sessionKey: string
  projectId?: string
  flowId?: string
  projectName?: string
  skillKey: string
  skillName: string
  mode?: 'chat' | 'auto'
  /** 助手模型偏好（用户选的）：透传给后端 chooseTextModel 优先用。 */
  agentModelKey?: string
  agentVendorKey?: string
  /** 待发附件（图片走原生多模态；文件 S4 抽文本）。 */
  attachments?: AgentAttachmentPayload[]
}

export type WorkbenchAiStreamHandlers = {
  onContent?: (delta: string, text: string) => void
  onEvent?: (event: AgentsChatStreamEvent) => void
  onSession?: (session: AgentChatV2Session) => void
}

function buildWorkbenchAiPayload(input: WorkbenchAiRequest) {
  return {
    vendor: 'agents',
    prompt: input.prompt,
    displayPrompt: input.displayPrompt,
    sessionKey: input.sessionKey,
    ...(input.projectId ? { canvasProjectId: input.projectId } : {}),
    ...(input.flowId ? { canvasFlowId: input.flowId } : {}),
    chatContext: {
      ...(input.projectName ? { currentProjectName: input.projectName } : {}),
      skill: {
        key: input.skillKey,
        name: input.skillName,
      },
    },
    mode: input.mode || 'auto',
    temperature: 0.7,
    ...(input.agentModelKey ? { agentModelKey: input.agentModelKey, agentVendorKey: input.agentVendorKey } : {}),
    ...(input.attachments?.length ? { attachments: input.attachments } : {}),
  }
}

export async function sendWorkbenchAiMessage(
  input: WorkbenchAiRequest,
  handlers: WorkbenchAiStreamHandlers,
): Promise<AgentsChatResponseDto> {
  const payload = buildWorkbenchAiPayload(input)

  let streamedText = ''
  let finalResponse: AgentsChatResponseDto | null = null
  let streamError: Error | null = null

  const terminalReason = await new Promise<'finished' | 'error'>((resolve, reject) => {
    void workbenchAgentsChatStream(payload, {
      onSession: handlers.onSession,
      onEvent: (event) => {
        handlers.onEvent?.(event)
        if (event.event === 'content') {
          const delta = String(event.data.delta || '')
          if (!delta) return
          streamedText += delta
          handlers.onContent?.(delta, streamedText)
          return
        }
        if (event.event === 'result') {
          finalResponse = event.data.response
          return
        }
        if (event.event === 'error') {
          const message = String(event.data.message || '').trim() || 'agents chat stream failed'
          streamError = new Error(message)
          reject(streamError)
          return
        }
        if (event.event === 'done') {
          resolve(event.data.reason)
        }
      },
      onError: reject,
    }).catch(reject)
  })

  if (streamError) throw streamError
  if (terminalReason === 'error') throw new Error('agents chat stream failed')
  if (!finalResponse) throw new Error('agents chat stream ended without result')
  return finalResponse
}
