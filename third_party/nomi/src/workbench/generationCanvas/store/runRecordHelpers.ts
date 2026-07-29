// 节点运行记录/进度的纯计算 helper。从 generationCanvasStore.ts 抽出。
import type {
  GenerationNodeProgress,
  GenerationNodeResult,
  GenerationNodeRunRecord,
  GenerationNodeTaskKind,
} from '../model/generationCanvasTypes'

export type NodeProgressInput = Omit<GenerationNodeProgress, 'updatedAt'> & {
  updatedAt?: number
}

export type NodeRunRecordInput = Omit<GenerationNodeRunRecord, 'id' | 'startedAt' | 'updatedAt'> & {
  id?: string
  startedAt?: number
  updatedAt?: number
}

export type NodeRunRecordPatch = Partial<Omit<GenerationNodeRunRecord, 'id' | 'startedAt'>> & {
  updatedAt?: number
}

export function getResultTaskKind(result: GenerationNodeResult): GenerationNodeTaskKind | undefined {
  if (result.taskKind) return result.taskKind
  if (result.type === 'text') return 'text'
  if (result.type === 'image') return 'image'
  if (result.type === 'video') return 'video'
  return undefined
}

export function createProgress(progress: NodeProgressInput, fallbackRunId?: string): GenerationNodeProgress {
  const percent = typeof progress.percent === 'number' ? Math.min(100, Math.max(0, progress.percent)) : undefined
  return {
    ...progress,
    runId: progress.runId ?? fallbackRunId,
    percent,
    updatedAt: progress.updatedAt ?? Date.now(),
  }
}

export function getRunDurationSeconds(run: Pick<GenerationNodeRunRecord, 'startedAt' | 'completedAt' | 'durationSeconds'>): number | undefined {
  if (typeof run.durationSeconds === 'number') return run.durationSeconds
  if (typeof run.completedAt !== 'number') return undefined
  return Math.max(0, (run.completedAt - run.startedAt) / 1000)
}

export function mergeRunRecord(
  run: GenerationNodeRunRecord,
  patch: NodeRunRecordPatch,
  now = Date.now(),
): GenerationNodeRunRecord {
  const isTerminalStatus = patch.status === 'success' || patch.status === 'error' || patch.status === 'cancelled'
  const completedAt = patch.completedAt ?? (isTerminalStatus ? now : run.completedAt)
  const nextRun = {
    ...run,
    ...patch,
    updatedAt: patch.updatedAt ?? now,
    completedAt,
    progress: isTerminalStatus && !patch.progress ? undefined : patch.progress ?? run.progress,
  }
  return {
    ...nextRun,
    durationSeconds: getRunDurationSeconds(nextRun),
  }
}
