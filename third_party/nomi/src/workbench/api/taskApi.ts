import { getDesktopActiveProjectId } from '../../desktop/activeProject'
import { getDesktopBridge } from '../../desktop/bridge'

export type TaskKind =
  | 'chat'
  | 'prompt_refine'
  | 'text_to_image'
  | 'image_to_prompt'
  | 'image_to_video'
  | 'text_to_video'
  | 'image_edit'
  | 'text_to_audio'
  | 'transcribe'
  | 'text_to_3d'
  | 'image_to_3d'

export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type TaskAssetDto = {
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnailUrl?: string | null
  assetId?: string | null
  assetRefId?: string | null
  assetName?: string | null
  durationSeconds?: number
  /** 原始 CDN URL（https://...）。供后续生成直接用，任何 vendor 都能接受，无需上传或转 base64。 */
  providerUrl?: string | null
}

export type TaskResultDto = {
  id: string
  kind: TaskKind
  status: TaskStatus
  assets: TaskAssetDto[]
  raw: unknown
  /**
   * E11: Complete provenance for reproducibility. Populated by the electron
   * runtime on successful generation. Renderer copies into
   * GenerationNodeResult.provenance via extractProvenanceFromTaskResult.
   */
  provenance?: {
    provider?: string
    modelKey?: string
    modelVersion?: string
    prompt?: string
    negativePrompt?: string
    seed?: number
    params?: Record<string, unknown>
    vendorRequestId?: string
    cost?: { amount: number; currency: string; unit: 'estimate' }
    timestamp: number
    agentRunId?: string
  }
}

export type TaskRequestDto = {
  kind: TaskKind
  prompt: string
  negativePrompt?: string
  seed?: number
  width?: number
  height?: number
  steps?: number
  cfgScale?: number
  extras?: Record<string, unknown>
}

export type FetchWorkbenchTaskResultRequestDto = {
  taskId: string
  vendor?: string
  taskKind?: TaskKind
  prompt?: string | null
  modelKey?: string | null
  /** 续查所属项目：内存缓存 miss 后主进程无状态重建查询时，用它把找回的资产本地化进项目。 */
  projectId?: string | null
}

export type FetchWorkbenchTaskResultResponseDto = {
  vendor: string
  result: TaskResultDto
}

type PlatformEnvelope<T> = {
  code?: number
  data?: T
  message?: string
}

function isPlatformWebRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function platformTaskRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem('user_token')
  const response = await fetch(`/api/v1/agentapp${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const payload = await response.json() as PlatformEnvelope<T>
  if (!response.ok || payload.code !== 200 || payload.data === undefined) {
    throw new Error(payload.message || `平台生成服务请求失败（${response.status}）`)
  }
  return payload.data
}

/** 付费守卫：真人确认后铸一次性令牌（绑 nodeIds），返回 grantId。仅由确认事件链调用。 */
export async function mintSpendGrant(nodeIds: string[], maxAttemptsPerNode?: number): Promise<string> {
  const desktop = getDesktopBridge()
  if (!desktop) {
    if (!isPlatformWebRuntime()) throw new Error('spend authorization requires the Electron desktop runtime')
    return `platform-${crypto.randomUUID()}`
  }
  const { grantId } = await desktop.tasks.grantSpend({
    nodeIds,
    ...(maxAttemptsPerNode ? { maxAttemptsPerNode } : {}),
  })
  return grantId
}

export async function runWorkbenchTaskByVendor(vendor: string, request: TaskRequestDto): Promise<TaskResultDto> {
  const normalizedVendor = String(vendor || '').trim()
  if (!normalizedVendor) throw new Error('vendor is required')
  const projectId = getDesktopActiveProjectId()
  const payload = {
    vendor: normalizedVendor,
    request: {
      ...request,
      extras: {
        ...(request.extras || {}),
        ...(projectId ? { projectId } : {}),
      },
    },
  }
  const desktop = getDesktopBridge()
  if (desktop) return desktop.tasks.run(payload) as Promise<TaskResultDto>
  if (!isPlatformWebRuntime()) throw new Error('task execution requires the Electron desktop runtime')
  if (normalizedVendor === 'platform-employee' && (request.kind === 'chat' || request.kind === 'prompt_refine')) {
    const employeeKey = String(request.extras?.modelKey || request.extras?.employeeKey || '').trim()
    if (!employeeKey) throw new Error('请选择执行任务的数字员工')
    const result = await platformTaskRequest<Record<string, unknown>>('/agent/run', {
      method: 'POST',
      body: JSON.stringify({
        employeeKey,
        userInput: request.prompt,
        sessionId: String(request.extras?.sessionKey || `canvas-${projectId || 'default'}`),
      }),
    })
    const text = String(
      result.assistantMessage
      || result.assistant_message
      || result.output
      || result.content
      || '',
    )
    return {
      id: String(result.runId || result.run_id || `employee-${crypto.randomUUID()}`),
      kind: request.kind,
      status: 'succeeded',
      assets: [],
      raw: { choices: [{ message: { content: text } }], platformResult: result },
      provenance: {
        provider: 'agent-studio',
        modelKey: employeeKey,
        prompt: request.prompt,
        timestamp: Date.now(),
      },
    }
  }
  return platformTaskRequest<TaskResultDto>('/canvas/workbench/tasks', {
    method: 'POST',
    body: JSON.stringify({
      vendor: normalizedVendor,
      ...payload.request,
    }),
  })
}

export async function fetchWorkbenchTaskResultByVendor(
  payload: FetchWorkbenchTaskResultRequestDto,
): Promise<FetchWorkbenchTaskResultResponseDto> {
  // 带上当前项目：内存缓存命中走 cached.projectId；miss 后无状态重建查询时主进程用 payload.projectId 本地化资产。
  const projectId = payload.projectId ?? getDesktopActiveProjectId()
  const normalizedPayload = {
    ...payload,
    ...(projectId ? { projectId } : {}),
  }
  const desktop = getDesktopBridge()
  if (desktop) {
    return desktop.tasks.result(normalizedPayload) as Promise<FetchWorkbenchTaskResultResponseDto>
  }
  if (!isPlatformWebRuntime()) throw new Error('task result polling requires the Electron desktop runtime')
  const params = new URLSearchParams({
    kind: payload.taskKind || 'text_to_video',
    project_id: projectId || 'agent-canvas',
    ...(payload.vendor ? { vendor: payload.vendor } : {}),
  })
  return platformTaskRequest<FetchWorkbenchTaskResultResponseDto>(
    `/canvas/workbench/tasks/${encodeURIComponent(payload.taskId)}?${params}`,
  )
}

/**
 * 文本任务流式执行：逐 token 回调 onDelta，最终 resolve 与 runWorkbenchTaskByVendor 同形的
 * TaskResultDto（status:'succeeded'，raw 为 OpenAI choices 形状）。把 IPC 的 streamId+事件
 * 订阅包成一个 Promise，调用方无需感知通道细节。
 */
export async function runWorkbenchTextTaskStream(
  vendor: string,
  request: TaskRequestDto,
  opts: { onDelta?: (delta: string) => void; signal?: AbortSignal } = {},
): Promise<TaskResultDto> {
  const normalizedVendor = String(vendor || '').trim()
  if (!normalizedVendor) throw new Error('vendor is required')
  const desktop = getDesktopBridge()
  if (!desktop) {
    if (!isPlatformWebRuntime()) throw new Error('text streaming requires the Electron desktop runtime')
    const result = await runWorkbenchTaskByVendor(normalizedVendor, request)
    const raw = result.raw as { choices?: Array<{ message?: { content?: string } }> } | null
    const text = raw?.choices?.[0]?.message?.content
    if (text) opts.onDelta?.(text)
    return result
  }
  const projectId = getDesktopActiveProjectId()
  const payload = {
    vendor: normalizedVendor,
    request: {
      ...request,
      extras: {
        ...(request.extras || {}),
        ...(projectId ? { projectId } : {}),
      },
    },
  }
  const { streamId } = await desktop.tasks.runTextStream(payload)
  return new Promise<TaskResultDto>((resolve, reject) => {
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      unsubscribe()
      fn()
    }
    const unsubscribe = desktop.tasks.onTextEvent(streamId, (event) => {
      const evt = event as { type?: string; delta?: string; result?: TaskResultDto; message?: string }
      if (evt?.type === 'delta') {
        opts.onDelta?.(String(evt.delta || ''))
      } else if (evt?.type === 'done') {
        finish(() => resolve(evt.result as TaskResultDto))
      } else if (evt?.type === 'error') {
        finish(() => reject(new Error(evt.message || '文本流式生成失败')))
      }
    })
    // 外部取消：通知主进程真中断流 + 兜底 reject。
    if (opts.signal) {
      const onAbort = () => finish(() => {
        void desktop.tasks.cancelTextStream(streamId)
        reject(new DOMException('文本流式已取消', 'AbortError'))
      })
      if (opts.signal.aborted) onAbort()
      else opts.signal.addEventListener('abort', onAbort, { once: true })
    }
  })
}
