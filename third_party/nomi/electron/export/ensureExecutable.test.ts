import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ensureExecutable } from "./ensureExecutable";

const isWindows = process.platform === "win32";

describe("ensureExecutable", () => {
  let dir = "";

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-exec-"));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it.skipIf(isWindows)("给缺执行位的随附二进制补上执行位（模拟打包跳过 chmod）", () => {
    const bin = path.join(dir, "ffprobe");
    fs.writeFileSync(bin, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(bin, 0o644); // 复现 ffprobe 落盘无执行位的状态
    expect(fs.statSync(bin).mode & 0o111).toBe(0);

    ensureExecutable(bin);

    expect(fs.statSync(bin).mode & 0o100).not.toBe(0); // 至少 owner 可执行
  });

  it.skipIf(isWindows)("已可执行时幂等不改", () => {
    const bin = path.join(dir, "ffmpeg");
    fs.writeFileSync(bin, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(bin, 0o755);
    const before = fs.statSync(bin).mode;

    ensureExecutable(bin);

    expect(fs.statSync(bin).mode).toBe(before);
  });

  it("裸命令（非绝对路径，走 PATH）不处理、不抛错", () => {
    expect(() => ensureExecutable("ffprobe")).not.toThrow();
    expect(() => ensureExecutable("")).not.toThrow();
  });

  it("不存在的路径 best-effort 吞错、不抛", () => {
    expect(() => ensureExecutable(path.join(dir, "does-not-exist"))).not.toThrow();
  });
});
