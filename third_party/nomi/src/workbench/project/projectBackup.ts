import { workbenchProjectRecordSchema } from "./projectRecordSchema";
import {
    projectBackupIndexKey,
    projectBackupKey,
    projectRevisionBackupKey,
    readJson,
    writeJson,
} from "./projectStorage";

const MAX_PROJECT_BACKUPS = 1;

export function readBackupIndex(projectId: string): number[] {
    const raw = readJson(projectBackupIndexKey(projectId));
    if (!Array.isArray(raw)) return [];
    return raw
        .filter(
            (item): item is number =>
                typeof item === "number" && Number.isInteger(item) && item >= 0,
        )
        .sort((a, b) => b - a);
}

function writeBackupIndex(
    projectId: string,
    revisions: readonly number[],
): void {
    writeJson(projectBackupIndexKey(projectId), revisions);
}

export function rememberProjectBackup(projectId: string, rawRecord: unknown): void {
    const parsed = workbenchProjectRecordSchema.safeParse(rawRecord);
    if (!parsed.success) {
        writeJson(projectBackupKey(projectId), rawRecord);
        return;
    }
    const revision = parsed.data.revision ?? 0;
    writeJson(projectBackupKey(projectId), rawRecord);
    writeJson(projectRevisionBackupKey(projectId, revision), rawRecord);
    const nextRevisions = [
        revision,
        ...readBackupIndex(projectId).filter((item) => item !== revision),
    ].slice(0, MAX_PROJECT_BACKUPS);
    writeBackupIndex(projectId, nextRevisions);
}
