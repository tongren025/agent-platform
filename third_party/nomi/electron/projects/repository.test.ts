import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  app: { getPath: () => os.tmpdir(), getAppPath: () => process.cwd() },
}));

import {
  createProject,
  legacyProjectDirById,
  listProjects,
  normalizeProjectRecord,
  resetEmptyDraftGcGuard,
  sanitizeName,
} from "./repository";

describe("sanitizeName", () => {
  it("replaces filesystem-unsafe characters with underscore", () => {
    expect(sanitizeName('a/b:c*d?e"f')).toBe("a_b_c_d_e_f");
    expect(sanitizeName("a\\b|c<d>e")).toBe("a_b_c_d_e");
  });
  it("collapses whitespace and trims", () => {
    expect(sanitizeName("  hello   world  ")).toBe("hello world");
  });
  it("falls back when empty/blank", () => {
    expect(sanitizeName("")).toBe("Untitled");
    expect(sanitizeName("   ")).toBe("Untitled");
    expect(sanitizeName("", "Project")).toBe("Project");
  });
  it("caps length at 90 chars", () => {
    expect(sanitizeName("x".repeat(200)).length).toBe(90);
  });
});

describe("normalizeProjectRecord", () => {
  it("throws on non-object input", () => {
    expect(() => normalizeProjectRecord(null)).toThrow();
    expect(() => normalizeProjectRecord([])).toThrow();
    expect(() => normalizeProjectRecord("x")).toThrow();
  });
  it("fills defaults and sanitizes the name", () => {
    const rec = normalizeProjectRecord({ name: "My/Film" });
    expect(rec.id).toMatch(/^project-/);
    expect(rec.name).toBe("My_Film");
    expect(rec.revision).toBe(0);
    expect(rec.version).toBe(1);
    expect(typeof rec.createdAt).toBe("number");
    expect(typeof rec.updatedAt).toBe("number");
    expect(typeof rec.savedAt).toBe("number");
  });
  it("preserves a provided id and numeric timestamps", () => {
    const rec = normalizeProjectRecord({ id: " p1 ", name: "n", createdAt: 100, updatedAt: 200, revision: 5, version: 3 });
    expect(rec.id).toBe("p1");
    expect(rec.createdAt).toBe(100);
    expect(rec.updatedAt).toBe(200);
    expect(rec.revision).toBe(5);
    expect(rec.version).toBe(3);
  });
});

// 修「文件夹改名后 nomi-local 图全部 404 消失」：legacyProjectDirById 按内容（manifest id）
// 找回项目目录，必须同时认根 project.json（legacy）和 .nomi/project.json（workspace 清单）。
describe("legacyProjectDirById（folder rename 自愈）", () => {
  let root = "";
  let prevEnv: string | undefined;
  beforeEach(() => {
    prevEnv = process.env.NOMI_PROJECTS_DIR;
    root = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-projroot-"));
    process.env.NOMI_PROJECTS_DIR = root;
  });
  afterEach(() => {
    if (prevEnv === undefined) delete process.env.NOMI_PROJECTS_DIR;
    else process.env.NOMI_PROJECTS_DIR = prevEnv;
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("按根 project.json 找到 legacy 项目目录", () => {
    const dir = path.join(root, "any-renamed-folder");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify({ id: "id-legacy", name: "L", version: 1 }));
    expect(legacyProjectDirById("id-legacy")).toBe(dir);
  });

  it("按 .nomi/project.json 找到被改名的 workspace 项目（核心修复）", () => {
    const dir = path.join(root, "renamed-after-move");
    fs.mkdirSync(path.join(dir, ".nomi"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".nomi", "project.json"), JSON.stringify({ id: "id-nomi", name: "W", version: 1 }));
    expect(legacyProjectDirById("id-nomi")).toBe(dir);
  });

  it("找不到匹配 id 时返回 null", () => {
    expect(legacyProjectDirById("nope")).toBeNull();
  });
});

// 启动 GC 挂在 listProjects 首次调用：回收上个进程遗留的空白草稿，但只跑一次——
// 本会话之后新建的草稿绝不被误删（once-guard）。
describe("listProjects 启动一次 GC（空白草稿回收）", () => {
  let projectsRoot = "";
  let settingsRoot = "";
  let prevProjects: string | undefined;
  let prevSettings: string | undefined;
  beforeEach(() => {
    prevProjects = process.env.NOMI_PROJECTS_DIR;
    prevSettings = process.env.NOMI_SETTINGS_DIR;
    projectsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-gc-proj-"));
    settingsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-gc-settings-"));
    process.env.NOMI_PROJECTS_DIR = projectsRoot;
    process.env.NOMI_SETTINGS_DIR = settingsRoot;
    resetEmptyDraftGcGuard();
  });
  afterEach(() => {
    if (prevProjects === undefined) delete process.env.NOMI_PROJECTS_DIR;
    else process.env.NOMI_PROJECTS_DIR = prevProjects;
    if (prevSettings === undefined) delete process.env.NOMI_SETTINGS_DIR;
    else process.env.NOMI_SETTINGS_DIR = prevSettings;
    fs.rmSync(projectsRoot, { recursive: true, force: true });
    fs.rmSync(settingsRoot, { recursive: true, force: true });
  });

  it("首次列举回收草稿，二次列举不再回收本会话新建的草稿", () => {
    const stale = createProject({ name: "上个进程的空白", draft: true });
    expect(listProjects().some((p) => p.id === stale.id)).toBe(false); // 首次 = 回收

    const fresh = createProject({ name: "本会话新建空白", draft: true });
    expect(listProjects().some((p) => p.id === fresh.id)).toBe(true); // 二次 = guard 已消费，保留
  });

  it("非草稿项目不被回收", () => {
    const keep = createProject({ name: "正常项目" });
    expect(listProjects().some((p) => p.id === keep.id)).toBe(true);
  });
});
