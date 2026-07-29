import { describe, expect, it, vi } from "vitest";

// 可控的 safeStorage mock：可用；encrypt/decrypt 互为逆（identity 编码，便于断言往返）；
// 对哨兵明文 "FAIL" 在解密时抛错，用来覆盖解密失败分支。
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (plain: string) => Buffer.from(plain, "utf8"),
    decryptString: (buf: Buffer) => {
      const s = buf.toString("utf8");
      if (s === "FAIL") throw new Error("decrypt failed");
      return s;
    },
  },
}));

import { decryptApiKeyRecord, isSafeStorageAvailable, makeApiKeyRecordFromPlain } from "./secrets";

describe("isSafeStorageAvailable", () => {
  it("reports availability from safeStorage", () => {
    expect(isSafeStorageAvailable()).toBe(true);
  });
});

describe("makeApiKeyRecordFromPlain + decryptApiKeyRecord round-trip", () => {
  it("encrypts to base64 with enc=safeStorage and decrypts back to plaintext", () => {
    const rec = makeApiKeyRecordFromPlain("sk-secret", "openai", true, "c1", "u1");
    expect(rec.enc).toBe("safeStorage");
    expect(rec.vendorKey).toBe("openai");
    expect(rec.enabled).toBe(true);
    expect(rec.apiKey).not.toBe("sk-secret"); // 不是明文
    expect(rec.apiKey).toBe(Buffer.from("sk-secret", "utf8").toString("base64"));
    expect(decryptApiKeyRecord(rec)).toBe("sk-secret");
  });
});

describe("decryptApiKeyRecord branches", () => {
  it("returns plaintext for enc=plain and legacy (no enc) records", () => {
    expect(decryptApiKeyRecord({ vendorKey: "v", apiKey: "raw", enc: "plain", enabled: true, createdAt: "c", updatedAt: "u" })).toBe("raw");
    expect(decryptApiKeyRecord({ vendorKey: "v", apiKey: "legacy", enabled: true, createdAt: "c", updatedAt: "u" })).toBe("legacy");
  });

  it("returns '' for missing record or empty key", () => {
    expect(decryptApiKeyRecord(undefined)).toBe("");
    expect(decryptApiKeyRecord({ vendorKey: "v", apiKey: "", enabled: true, createdAt: "c", updatedAt: "u" })).toBe("");
  });

  it("returns '' (not throw) when a safeStorage value fails to decrypt", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const corrupted = {
      vendorKey: "v",
      apiKey: Buffer.from("FAIL", "utf8").toString("base64"),
      enc: "safeStorage" as const,
      enabled: true,
      createdAt: "c",
      updatedAt: "u",
    };
    expect(decryptApiKeyRecord(corrupted)).toBe("");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
