import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  app: { getPath: () => os.tmpdir(), getAppPath: () => process.cwd() },
}));

import { readJson, readText } from "./runtimePaths";

const tempRoots: string[] = [];
afterEach(() => {
  for (const root of tempRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});
function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-runtime-paths-test-"));
  tempRoots.push(dir);
  return dir;
}

describe("readJson", () => {
  it("parses valid JSON files", () => {
    const dir = makeTempDir();
    const file = path.join(dir, "x.json");
    fs.writeFileSync(file, JSON.stringify({ a: 1 }));
    expect(readJson(file, { a: 0 })).toEqual({ a: 1 });
  });
  it("returns the fallback for missing or malformed files", () => {
    const dir = makeTempDir();
    expect(readJson(path.join(dir, "missing.json"), { def: true })).toEqual({ def: true });
    const bad = path.join(dir, "bad.json");
    fs.writeFileSync(bad, "{not json");
    expect(readJson(bad, null)).toBeNull();
  });
});

describe("readText", () => {
  it("reads file contents, '' when missing", () => {
    const dir = makeTempDir();
    const file = path.join(dir, "x.txt");
    fs.writeFileSync(file, "hello");
    expect(readText(file)).toBe("hello");
    expect(readText(path.join(dir, "missing.txt"))).toBe("");
  });
});
