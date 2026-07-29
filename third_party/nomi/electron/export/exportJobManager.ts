import { randomUUID } from "node:crypto";
import path from "node:path";

import type { NomiRenderManifestV1 } from "./exportManifest";
import { createExportTempDir } from "./exportPaths";
import type { ExportJobStatus } from "./exportTypes";
import { ExportJobStore } from "./exportJobStore";

export type ExportJobProgress = {
  ratio: number;
  stage: ExportJobStatus;
  message: string;
};

export type ExportJobResult = {
  outputPath: string;
  relativeOutputPath?: string;
  bytes?: number;
  durationMs?: number;
};

export type ExportJobError = {
  message: string;
  name?: string;
  stack?: string;
};

export type CreateExportJobInput = {
  projectId: string;
  projectDir: string;
  manifest: NomiRenderManifestV1;
  outputName?: string;
};

export type ExportJobSnapshot = {
  id: string;
  projectId: string;
  projectDir: string;
  jobDir: string;
  manifest: NomiRenderManifestV1;
  outputName?: string;
  status: ExportJobStatus;
  progress: ExportJobProgress;
  cancelled: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  result?: ExportJobResult;
  error?: ExportJobError;
};

export type ExportJobPatch = {
  status?: ExportJobStatus;
  progress?: Partial<ExportJobProgress>;
};

export type ExportJobEventType = "status" | "progress" | "result" | "error";

export type ExportJobEvent = {
  type: ExportJobEventType;
  jobId: string;
  projectId: string;
  snapshot: ExportJobSnapshot;
};

type ExportJobManagerOptions = {
  store?: ExportJobStore;
  idGenerator?: () => string;
  clock?: () => string;
  projectDirs?: string[];
};

const ACTIVE_STATUSES = new Set<ExportJobStatus>(["queued", "preparing", "planning", "rendering", "encoding", "muxing", "finalizing"]);

function isActive(status: ExportJobStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

function toErrorDetails(error: unknown): ExportJobError {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return { message: JSON.stringify(error) || String(error) };
}

export class ExportJobManager {
  private readonly store: ExportJobStore;
  private readonly idGenerator: () => string;
  private readonly clock: () => string;
  private readonly jobs = new Map<string, ExportJobSnapshot>();
  private readonly projectDirs = new Set<string>();
  private readonly listeners = new Set<(event: ExportJobEvent) => void>();

  constructor(options: ExportJobManagerOptions = {}) {
    this.store = options.store ?? new ExportJobStore();
    this.idGenerator = options.idGenerator ?? randomUUID;
    this.clock = options.clock ?? (() => new Date().toISOString());
    for (const projectDir of options.projectDirs ?? []) {
      this.hydrateProject(projectDir);
    }
  }

  createJob(input: CreateExportJobInput): ExportJobSnapshot {
    if (input.manifest.projectId !== input.projectId) {
      throw new Error("Export job projectId must match manifest.projectId");
    }
    this.hydrateProject(input.projectDir);
    // active 锁按 projectId 维度，而非全局：同一项目同一时刻只允许一个在跑的导出
    // （避免互相覆盖输出/抢临时目录），但不同项目可并行导出，彼此不阻塞。
    const activeJob = [...this.jobs.values()].find((job) => job.projectId === input.projectId && isActive(job.status));
    if (activeJob !== undefined) {
      throw new Error(`Cannot create export job while active export job ${activeJob.id} is ${activeJob.status}`);
    }

    const id = this.idGenerator();
    const now = this.clock();
    const snapshot: ExportJobSnapshot = {
      id,
      projectId: input.projectId,
      projectDir: input.projectDir,
      jobDir: createExportTempDir(input.projectDir, id),
      manifest: input.manifest,
      outputName: input.outputName,
      status: "queued",
      progress: { ratio: 0, stage: "queued", message: "Queued" },
      cancelled: false,
      createdAt: now,
      updatedAt: now,
    };
    const stored = this.store.create(snapshot);
    this.jobs.set(stored.id, stored);
    return stored;
  }

  getJob(jobId: string): ExportJobSnapshot | null {
    this.hydrateKnownProjects();
    return this.jobs.get(jobId) ?? null;
  }

  listJobs(projectId?: string): ExportJobSnapshot[] {
    this.hydrateKnownProjects();
    const jobs = [...this.jobs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return projectId === undefined ? jobs : jobs.filter((job) => job.projectId === projectId);
  }

  updateJob(jobId: string, patch: ExportJobPatch): ExportJobSnapshot {
    const current = this.requireJob(jobId);
    const status = patch.status ?? current.status;
    const progress = patch.progress === undefined ? current.progress : { ...current.progress, ...patch.progress };
    const updated: ExportJobSnapshot = {
      ...current,
      status,
      progress,
      updatedAt: this.clock(),
    };
    if (isActive(status)) {
      delete updated.error;
      delete updated.result;
      delete updated.completedAt;
    }
    return this.saveAndEmit(updated, this.eventTypesForPatch(current, patch));
  }

  failJob(jobId: string, error: unknown): ExportJobSnapshot {
    const current = this.requireJob(jobId);
    const failed: ExportJobSnapshot = {
      ...current,
      status: "failed",
      error: toErrorDetails(error),
      updatedAt: this.clock(),
    };
    return this.saveAndEmit(failed, ["status", "error"]);
  }

  completeJob(jobId: string, result: ExportJobResult): ExportJobSnapshot {
    const current = this.requireJob(jobId);
    const completed: ExportJobSnapshot = {
      ...current,
      status: "succeeded",
      progress: { ratio: 1, stage: "succeeded", message: "Succeeded" },
      result,
      updatedAt: this.clock(),
    };
    delete completed.error;
    return this.saveAndEmit(completed, ["status", "progress", "result"]);
  }

  async cancelJob(jobId: string): Promise<ExportJobSnapshot> {
    const current = this.requireJob(jobId);
    const cancelled: ExportJobSnapshot = {
      ...current,
      status: "cancelled",
      cancelled: true,
      updatedAt: this.clock(),
    };
    return this.saveAndEmit(cancelled, ["status"]);
  }

  onEvent(listener: (event: ExportJobEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private requireJob(jobId: string): ExportJobSnapshot {
    this.hydrateKnownProjects();
    const job = this.jobs.get(jobId);
    if (job === undefined) {
      throw new Error(`Export job ${jobId} was not found`);
    }
    return job;
  }

  private eventTypesForPatch(current: ExportJobSnapshot, patch: ExportJobPatch): ExportJobEventType[] {
    const eventTypes: ExportJobEventType[] = [];
    if (patch.status !== undefined && patch.status !== current.status) {
      eventTypes.push("status");
    }
    if (patch.progress !== undefined) {
      eventTypes.push("progress");
    }
    return eventTypes;
  }

  private saveAndEmit(snapshot: ExportJobSnapshot, eventTypes: ExportJobEventType[]): ExportJobSnapshot {
    const saved = this.store.save(snapshot);
    this.projectDirs.add(path.resolve(saved.projectDir));
    this.jobs.set(saved.id, saved);
    for (const type of eventTypes) {
      this.emit({ type, jobId: saved.id, projectId: saved.projectId, snapshot: saved });
    }
    return saved;
  }

  private emit(event: ExportJobEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private hydrateKnownProjects(): void {
    for (const projectDir of [...this.projectDirs]) {
      this.hydrateProject(projectDir);
    }
  }

  private hydrateProject(projectDir: string): void {
    const resolvedProjectDir = path.resolve(projectDir);
    this.projectDirs.add(resolvedProjectDir);
    for (const job of this.store.loadRecentJobs(resolvedProjectDir)) {
      if (this.jobs.has(job.id)) continue; // 本会话已在跟踪，别用磁盘旧态覆盖
      if (isActive(job.status)) {
        // 上个进程崩溃/退出残留的孤儿 active job：本实例并未在跑它，却会永久占用
        // "单 active job" 名额，导致该项目再也无法导出。reap 成 failed 解锁。
        this.reapStaleActiveJob(job);
        continue;
      }
      this.jobs.set(job.id, job);
      this.projectDirs.add(path.resolve(job.projectDir));
    }
  }

  private reapStaleActiveJob(job: ExportJobSnapshot): void {
    const failed: ExportJobSnapshot = {
      ...job,
      status: "failed",
      cancelled: false,
      error: { message: "Export interrupted by app restart" },
      updatedAt: this.clock(),
    };
    this.saveAndEmit(failed, ["status", "error"]);
  }
}
