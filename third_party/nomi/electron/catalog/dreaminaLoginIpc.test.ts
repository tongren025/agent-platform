import { beforeEach, describe, expect, it, vi } from "vitest";

const runDreaminaCli = vi.fn();
const isDreaminaInstalled = vi.fn(() => true);
const resolveDreaminaBin = vi.fn(() => "/tmp/dreamina");

vi.mock("./dreaminaCli", () => ({
  runDreaminaCli: (...args: unknown[]) => runDreaminaCli(...args),
  isDreaminaInstalled: () => isDreaminaInstalled(),
  resolveDreaminaBin: () => resolveDreaminaBin(),
}));

import { dreaminaLoginStart } from "./dreaminaLoginIpc";

describe("dreaminaLoginIpc", () => {
  beforeEach(() => {
    runDreaminaCli.mockReset();
    isDreaminaInstalled.mockReturnValue(true);
    resolveDreaminaBin.mockReturnValue("/tmp/dreamina");
  });

  it("loginStart 返回设备码登录材料", async () => {
    runDreaminaCli.mockResolvedValue({
      code: 0,
      stdout: [
        "verification_uri: https://jimeng.jianying.com/ai-tool/cli-auth",
        "user_code: abc123",
        "device_code: dev456",
        "expires_at: 2026-07-05T12:00:00+08:00",
      ].join("\n"),
      stderr: "",
    });

    await expect(dreaminaLoginStart()).resolves.toMatchObject({
      verificationUri: "https://jimeng.jianying.com/ai-tool/cli-auth",
      userCode: "abc123",
      deviceCode: "dev456",
    });
  });

  it("loginStart 遇到已复用登录态时给可理解提示", async () => {
    runDreaminaCli.mockResolvedValue({
      code: 0,
      stdout: "已复用当前本地 OAuth 登录态",
      stderr: "",
    });

    await expect(dreaminaLoginStart()).rejects.toThrow(/复用.*登录态|无需重新扫码/);
  });
});
