import fs from "node:fs";
import path from "node:path";

const DATE_SLICE_LENGTH = 10;

function workspaceBoundaryError(): Error {
  return new Error("Path must stay inside the selected workspace");
}

function assertWorkspaceRoot(workspaceRoot: string): string {
  const root = String(workspaceRoot || "").trim();
  if (!root) {
    throw workspaceBoundaryError();
  }
  return path.resolve(root);
}

function normalizeDateFolder(date: Date = new Date()): string {
  return date.toISOString().slice(0, DATE_SLICE_LENGTH);
}

function assertRelativeInsideRoot(rootPath: string, targetPath: string): string {
  const relative = path.relative(rootPath, targetPath);
  if (relative === "") {
    return targetPath;
  }
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw workspaceBoundaryError();
  }
  return targetPath;
}

function assertExistingAncestorsStayInsideWorkspace(workspaceRoot: string, targetPath: string): void {
  if (!fs.existsSync(workspaceRoot)) {
    return;
  }

  const realRoot = fs.realpathSync(workspaceRoot);
  const relative = path.relative(workspaceRoot, targetPath);
  const segments = relative ? relative.split(path.sep).filter(Boolean) : [];
  let cursor = workspaceRoot;

  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    if (!fs.existsSync(cursor)) {
      break;
    }
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) {
      assertRelativeInsideRoot(realRoot, fs.realpathSync(cursor));
    }
  }
}

function rejectUnsafeRelativePath(relativePath: string): string[] {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    normalized.startsWith("//") ||
    /^[a-zA-Z]:\//.test(normalized) ||
    path.isAbsolute(normalized)
  ) {
    throw workspaceBoundaryError();
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw workspaceBoundaryError();
  }
  return segments;
}

export function assertInsideWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  const target = path.resolve(targetPath);
  assertRelativeInsideRoot(root, target);
  assertExistingAncestorsStayInsideWorkspace(root, target);
  return target;
}

export function resolveWorkspaceRelativePath(workspaceRoot: string, relativePath: string): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  const segments = rejectUnsafeRelativePath(relativePath);
  const candidate = assertInsideWorkspace(root, path.join(root, ...segments));

  if (fs.existsSync(candidate)) {
    const realRoot = fs.realpathSync(root);
    const realCandidate = fs.realpathSync(candidate);
    assertRelativeInsideRoot(realRoot, realCandidate);
  }

  return candidate;
}

export function workspaceNomiDir(workspaceRoot: string): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  return assertInsideWorkspace(root, path.join(root, ".nomi"));
}

export function workspaceProjectFile(workspaceRoot: string): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  return assertInsideWorkspace(root, path.join(workspaceNomiDir(root), "project.json"));
}

export function workspaceAssetsGeneratedDir(workspaceRoot: string, date: Date = new Date()): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  return assertInsideWorkspace(root, path.join(root, "assets", "generated", normalizeDateFolder(date)));
}

export function workspaceAssetsImportedDir(workspaceRoot: string, date: Date = new Date()): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  return assertInsideWorkspace(root, path.join(root, "assets", "imported", normalizeDateFolder(date)));
}

export function workspaceExportsDir(workspaceRoot: string): string {
  const root = assertWorkspaceRoot(workspaceRoot);
  return assertInsideWorkspace(root, path.join(root, "exports"));
}
