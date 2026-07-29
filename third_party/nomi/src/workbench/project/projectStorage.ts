export const PROJECT_INDEX_KEY = "tapcanvas-open-workbench-project-index-v1";
export const PROJECT_RECORD_PREFIX = "tapcanvas-open-workbench-project-v1:";
export const PROJECT_BACKUP_PREFIX = "tapcanvas-open-workbench-project-backup-v1:";
export const PROJECT_BACKUP_INDEX_PREFIX =
    "tapcanvas-open-workbench-project-backup-index-v1:";

// Clear old backups on load to prevent localStorage quota issues
if (typeof window !== "undefined") {
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k?.startsWith(PROJECT_BACKUP_PREFIX))
                window.localStorage.removeItem(k);
        }
    } catch {
        /* ignore */
    }
}

export function readJson(key: string): unknown {
    if (typeof window === "undefined") return null;
    try {
        return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
}

// v0.7.6: 之前 localStorage 配额耗尽时静默丢失 — 创作工具的高风险体验问题
// 现在驱逐 backup 重试失败后抛错，让调用方决定如何提示用户（通常会冒泡到 onSaveError → toast）
export class ProjectStorageQuotaError extends Error {
  readonly key: string;
  constructor(key: string, cause?: unknown) {
    super(`Local storage quota exceeded while saving "${key}"`);
    this.name = "ProjectStorageQuotaError";
    this.key = key;
    if (cause instanceof Error) this.stack = cause.stack;
  }
}

export function writeJson(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    const serialized = JSON.stringify(value);
    try {
        window.localStorage.setItem(key, serialized);
    } catch (firstError) {
        // quota exceeded — evict oldest backups and retry once
        evictOldBackups();
        try {
            window.localStorage.setItem(key, serialized);
        } catch (retryError) {
            // 不再静默 — 上抛，让 persistence 层 onSaveError 走 toast 通知用户
            throw new ProjectStorageQuotaError(key, retryError);
        }
    }
}

export function removeStorageKey(key: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

function evictOldBackups(): void {
    const keys = Array.from({ length: window.localStorage.length }, (_, i) =>
        window.localStorage.key(i),
    ).filter(
        (k): k is string =>
            typeof k === "string" && k.startsWith(PROJECT_BACKUP_PREFIX),
    );
    for (const k of keys) window.localStorage.removeItem(k);
}

export function projectRecordKey(projectId: string): string {
    return `${PROJECT_RECORD_PREFIX}${projectId}`;
}

export function projectBackupKey(projectId: string): string {
    return `${PROJECT_BACKUP_PREFIX}${projectId}:latest`;
}

export function projectRevisionBackupKey(projectId: string, revision: number): string {
    return `${PROJECT_BACKUP_PREFIX}${projectId}:r${revision}`;
}

export function projectBackupIndexKey(projectId: string): string {
    return `${PROJECT_BACKUP_INDEX_PREFIX}${projectId}`;
}

export function readStorageKeys(): string[] {
    if (typeof window === "undefined") return [];
    return Array.from({ length: window.localStorage.length }, (_, index) =>
        window.localStorage.key(index),
    ).filter((key): key is string => typeof key === "string");
}
