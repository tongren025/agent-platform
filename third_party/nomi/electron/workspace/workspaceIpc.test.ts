import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assessWorkspaceFolderSafety,
  openWorkspaceFolder,
  selectWorkspaceFolder,
  type WorkspaceFolderDialog,
} from "./workspaceIpc";
import { workspaceProjectFile } from "./workspacePaths";

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function makeTempDir(name = "nomi-workspace-ipc-test-"): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), name));
  tempRoots.push(dir);
  return dir;
}

describe("workspace folder IPC helpers", () => {
  it("returns canceled=true when user cancels folder selection", async () => {
    const dialog: WorkspaceFolderDialog = {
      showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })),
    };

    await expect(selectWorkspaceFolder(dialog)).resolves.toEqual({ canceled: true });
  });

  it("returns selected rootPath when user chooses one directory", async () => {
    const rootPath = makeTempDir();
    const dialog: WorkspaceFolderDialog = {
      showOpenDialog: vi.fn(async () => ({ canceled: false, filePaths: [rootPath] })),
    };

    await expect(selectWorkspaceFolder(dialog)).resolves.toEqual({ canceled: false, rootPath: path.resolve(rootPath) });
    expect(dialog.showOpenDialog).toHaveBeenCalledWith(expect.objectContaining({ properties: expect.arrayContaining(["openDirectory"]) }));
  });

  it("opens existing workspace without reinitializing", async () => {
    const rootPath = makeTempDir();
    const existing = {
      id: "existing-id",
      name: "Existing Workspace",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
      savedAt: 300,
      revision: 1,
      payload: { keep: true },
    };
    fs.mkdirSync(path.dirname(workspaceProjectFile(rootPath)), { recursive: true });
    fs.writeFileSync(workspaceProjectFile(rootPath), JSON.stringify(existing, null, 2));
    const createProject = vi.fn((payload: unknown) => ({ ...existing, ...(payload as object), id: existing.id, version: 2 }));

    await expect(openWorkspaceFolder({ rootPath }, { createProject })).resolves.toMatchObject({ id: "existing-id", name: "Existing Workspace", payload: { keep: true } });
    expect(createProject).toHaveBeenCalledWith({ rootPath: path.resolve(rootPath) });
  });

  it("initializes a workspace when requested and main process confirms", async () => {
    const rootPath = makeTempDir();
    const createProject = vi.fn((payload: unknown) => ({ id: "new-id", version: 2, name: "New Workspace", ...(payload as object) }));
    const confirmInitialize = vi.fn(async () => true);

    const opened = await openWorkspaceFolder({ rootPath, initialize: true, name: "New Workspace" }, { createProject, confirmInitialize });

    // 空目录初始化：确认回调收到 isEmpty=true（非空才需要额外提示）。
    expect(confirmInitialize).toHaveBeenCalledWith(path.resolve(rootPath), { isEmpty: true });
    expect(opened).toMatchObject({ id: "new-id", name: "New Workspace", rootPath: path.resolve(rootPath) });
    expect(createProject).toHaveBeenCalledWith({ rootPath: path.resolve(rootPath), name: "New Workspace" });
  });

  it("rejects initialization when main-process confirmation is canceled", async () => {
    const rootPath = makeTempDir();
    const createProject = vi.fn();
    const confirmInitialize = vi.fn(async () => false);

    await expect(openWorkspaceFolder({ rootPath, initialize: true }, { createProject, confirmInitialize })).rejects.toThrow(/canceled/i);
    expect(createProject).not.toHaveBeenCalled();
  });

  it("rejects rootPath values that were not selected by the native picker", async () => {
    const rootPath = makeTempDir();
    const createProject = vi.fn();
    const selectedRootPaths = new Set<string>();

    await expect(openWorkspaceFolder({ rootPath, initialize: true }, { createProject, selectedRootPaths, confirmInitialize: vi.fn(async () => true) })).rejects.toThrow(/native picker/i);
    expect(createProject).not.toHaveBeenCalled();
  });

  it("rejects empty rootPath instead of resolving to cwd", async () => {
    const createProject = vi.fn();

    await expect(openWorkspaceFolder({ rootPath: "", initialize: true }, { createProject, confirmInitialize: vi.fn(async () => true) })).rejects.toThrow(/rootPath is required/i);
    expect(createProject).not.toHaveBeenCalled();
  });

  it("throws when opening an uninitialized folder without initialize=true", async () => {
    const rootPath = makeTempDir();
    const createProject = vi.fn();

    await expect(openWorkspaceFolder({ rootPath }, { createProject })).rejects.toThrow(/not initialized/i);
    expect(createProject).not.toHaveBeenCalled();
  });
});

describe("assessWorkspaceFolderSafety（危险目录 denylist + 非空二次确认信号）", () => {
  it("拒绝 home 根目录本身并给出可读原因", () => {
    const home = makeTempDir("nomi-home-");
    const result = assessWorkspaceFolderSafety(home, { homedir: home });
    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.reason).toMatch(/主目录|home|系统/i);
  });

  it.each(["Pictures", "Music", "Desktop", "Documents", "Downloads", "Movies"])(
    "拒绝 home 下的系统关键目录 ~/%s（避免污染照片/音乐库）",
    (sub) => {
      const home = makeTempDir("nomi-home-");
      const target = path.join(home, sub);
      fs.mkdirSync(target, { recursive: true });
      const result = assessWorkspaceFolderSafety(target, { homedir: home });
      expect(result.ok).toBe(false);
    },
  );

  it("拒绝文件系统根 / 与 darwin 系统目录", () => {
    const home = makeTempDir("nomi-home-");
    expect(assessWorkspaceFolderSafety(path.parse(home).root, { homedir: home, platform: "darwin" }).ok).toBe(false);
    expect(assessWorkspaceFolderSafety("/System", { homedir: home, platform: "darwin" }).ok).toBe(false);
    expect(assessWorkspaceFolderSafety("/Applications", { homedir: home, platform: "darwin" }).ok).toBe(false);
    expect(assessWorkspaceFolderSafety("/Library", { homedir: home, platform: "darwin" }).ok).toBe(false);
  });

  it("允许 home 下的普通子目录（默认根之外的正常项目文件夹）且标记 isEmpty", () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "My Nomi Projects", "Film One");
    fs.mkdirSync(target, { recursive: true });
    const result = assessWorkspaceFolderSafety(target, { homedir: home });
    expect(result).toEqual({ ok: true, isEmpty: true });
  });

  it("非空且无 Nomi 清单的目录返回 isEmpty=false（IPC 层据此要求二次确认）", () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "Has Stuff");
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "photo-1.jpg"), "x");
    fs.writeFileSync(path.join(target, "photo-2.jpg"), "x");
    const result = assessWorkspaceFolderSafety(target, { homedir: home });
    expect(result).toEqual({ ok: true, isEmpty: false });
  });

  it("已是 Nomi 工作区（含 .nomi/project.json）视为安全且不要求确认（isEmpty 语义=可直接打开）", () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "Existing Nomi");
    fs.mkdirSync(path.dirname(workspaceProjectFile(target)), { recursive: true });
    fs.writeFileSync(workspaceProjectFile(target), JSON.stringify({ id: "x", version: 2 }));
    const result = assessWorkspaceFolderSafety(target, { homedir: home });
    expect(result).toEqual({ ok: true, isEmpty: true });
  });
});

describe("selectWorkspaceFolder 危险目录拦截", () => {
  it("用户选中危险目录时返回 rejected + 可读原因（不直接放行）", async () => {
    const home = makeTempDir("nomi-home-");
    const dialog: WorkspaceFolderDialog = {
      showOpenDialog: vi.fn(async () => ({ canceled: false, filePaths: [home] })),
    };

    const selection = await selectWorkspaceFolder(dialog, { homedir: home });
    expect(selection).toMatchObject({ canceled: false, rejected: true });
    expect("reason" in selection ? selection.reason : "").toMatch(/.+/);
  });
});

describe("openWorkspaceFolder 危险目录拦截 + 非空确认", () => {
  it("拒绝把外部危险目录初始化为工作区（即便已通过 picker 选中）", async () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "Pictures");
    fs.mkdirSync(target, { recursive: true });
    const createProject = vi.fn();

    await expect(
      openWorkspaceFolder(
        { rootPath: target, initialize: true },
        { createProject, selectedRootPaths: new Set([path.resolve(target)]), homedir: home, confirmInitialize: vi.fn(async () => true) },
      ),
    ).rejects.toThrow();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("初始化到非空非 Nomi 目录时，把 isEmpty=false 透传给确认回调", async () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "Busy Folder");
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "a.txt"), "x");
    const createProject = vi.fn((payload: unknown) => ({ id: "n", version: 2, ...(payload as object) }));
    const confirmInitialize = vi.fn(async () => true);

    await openWorkspaceFolder(
      { rootPath: target, initialize: true },
      { createProject, selectedRootPaths: new Set([path.resolve(target)]), homedir: home, confirmInitialize },
    );

    expect(confirmInitialize).toHaveBeenCalledWith(path.resolve(target), { isEmpty: false });
    expect(createProject).toHaveBeenCalled();
  });

  it("用户在确认回调中拒绝非空目录初始化时不创建项目", async () => {
    const home = makeTempDir("nomi-home-");
    const target = path.join(home, "Busy Folder 2");
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "a.txt"), "x");
    const createProject = vi.fn();
    const confirmInitialize = vi.fn(async () => false);

    await expect(
      openWorkspaceFolder(
        { rootPath: target, initialize: true },
        { createProject, selectedRootPaths: new Set([path.resolve(target)]), homedir: home, confirmInitialize },
      ),
    ).rejects.toThrow(/canceled/i);
    expect(createProject).not.toHaveBeenCalled();
  });
});
