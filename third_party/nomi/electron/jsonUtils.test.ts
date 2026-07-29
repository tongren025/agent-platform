import { describe, expect, it } from "vitest";
import { describeIllegalHeader, findIllegalHeader, findNonHeaderSafeChar, firstString, isJsonRecord, nowIso, readNestedRecord, trim } from "./jsonUtils";

describe("trim", () => {
  it("trims strings and returns '' for non-strings", () => {
    expect(trim("  hi  ")).toBe("hi");
    expect(trim("")).toBe("");
    expect(trim(123)).toBe("");
    expect(trim(null)).toBe("");
    expect(trim(undefined)).toBe("");
    expect(trim({})).toBe("");
  });
});

describe("firstString", () => {
  it("returns the first trim-nonempty string", () => {
    expect(firstString("", "  ", "x", "y")).toBe("x");
    expect(firstString(null, undefined, 0, "found")).toBe("found");
  });
  it("returns '' when nothing qualifies", () => {
    expect(firstString("", "   ", null, undefined, 42)).toBe("");
    expect(firstString()).toBe("");
  });
});

describe("isJsonRecord", () => {
  it("accepts plain objects only", () => {
    expect(isJsonRecord({})).toBe(true);
    expect(isJsonRecord({ a: 1 })).toBe(true);
  });
  it("rejects arrays, null, and primitives", () => {
    expect(isJsonRecord([])).toBe(false);
    expect(isJsonRecord(null)).toBe(false);
    expect(isJsonRecord("x")).toBe(false);
    expect(isJsonRecord(7)).toBe(false);
    expect(isJsonRecord(undefined)).toBe(false);
  });
});

describe("readNestedRecord", () => {
  const input = { data: { status: "ok", nested: { value: 42 } }, list: [{ a: 1 }] };
  it("walks a nested path", () => {
    expect(readNestedRecord(input, ["data", "status"])).toBe("ok");
    expect(readNestedRecord(input, ["data", "nested", "value"])).toBe(42);
  });
  it("returns undefined when a segment is missing or non-object", () => {
    expect(readNestedRecord(input, ["data", "missing"])).toBeUndefined();
    expect(readNestedRecord(input, ["data", "status", "deeper"])).toBeUndefined();
    expect(readNestedRecord(null, ["a"])).toBeUndefined();
  });
  it("returns the input itself for an empty path", () => {
    expect(readNestedRecord(input, [])).toBe(input);
  });
});

describe("nowIso", () => {
  it("returns an ISO-8601 timestamp string", () => {
    expect(nowIso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("findNonHeaderSafeChar", () => {
  it("纯英文/数字密钥 → null（安全）", () => {
    expect(findNonHeaderSafeChar("sk-AbC123_xyz.456")).toBeNull();
  });
  it("含中文字符 → 命中正确位置/码点（复现 kie ByteString 真坑：衣 U+8863）", () => {
    // "Bearer " 前缀 7 位 → 密钥首字符为中文时 fetch 报 index 7 / value 34915
    expect(findNonHeaderSafeChar("衣abc")).toEqual({ index: 0, code: 34915, char: "衣" });
    expect(findNonHeaderSafeChar("sk-衣")).toEqual({ index: 3, code: 34915, char: "衣" });
  });
  it("含控制字符（换行=头注入）→ 命中", () => {
    expect(findNonHeaderSafeChar("abc\ndef")).toEqual({ index: 3, code: 10, char: "\n" });
  });
  it("Latin1 扩展区(0x80-0xFF)与制表符不算非法（fetch 可接受）", () => {
    expect(findNonHeaderSafeChar("aÿb")).toBeNull();
    expect(findNonHeaderSafeChar("a\tb")).toBeNull();
  });
});

describe("findIllegalHeader", () => {
  it("全安全 → null", () => {
    expect(findIllegalHeader({ authorization: "Bearer sk-abc123", "content-type": "application/json" })).toBeNull();
  });
  it("头值含中文 → 命中该头名+位置/码点", () => {
    expect(findIllegalHeader({ Authorization: "Bearer 衣abc" })).toEqual({ name: "Authorization", index: 7, code: 34915, char: "衣" });
  });
  it("头名含非法字符也命中（头注入防线）", () => {
    expect(findIllegalHeader({ "X-标题": "v" })).toMatchObject({ name: "X-标题", char: "标" });
  });
});

describe("describeIllegalHeader", () => {
  it("鉴权头 → isAuth + 指向重新粘贴密钥（与发送闸同措辞前缀）", () => {
    const out = describeIllegalHeader({ name: "Authorization", index: 7, code: 34915, char: "衣" });
    expect(out.isAuth).toBe(true);
    expect(out.message).toContain("API 密钥含非法字符");
    expect(out.message).toContain("第 8 位");
    expect(out.message).toContain("请重新粘贴密钥");
  });
  it("「API Key」名（带空格）也识别为鉴权类", () => {
    expect(describeIllegalHeader({ name: "API Key", index: 0, code: 34915, char: "衣" }).isAuth).toBe(true);
  });
  it("非鉴权头 → 非 auth，标头名+位置不归咎密钥", () => {
    const out = describeIllegalHeader({ name: "X-Note", index: 0, code: 26631, char: "标" });
    expect(out.isAuth).toBe(false);
    expect(out.message).toContain("请求头 X-Note");
    expect(out.message).not.toContain("密钥");
  });
});
