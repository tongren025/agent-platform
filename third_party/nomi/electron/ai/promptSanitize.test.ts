import { describe, expect, it } from "vitest";
import { sanitizeForBroadCompat, sanitizeObjectStrings } from "./promptSanitize";

describe("sanitizeForBroadCompat", () => {
  it("replaces em-dash with ASCII", () => {
    expect(sanitizeForBroadCompat("hello — world")).toBe("hello  -  world");
    expect(sanitizeForBroadCompat("a—b")).toBe("a - b");
  });

  it("replaces en-dash and minus", () => {
    expect(sanitizeForBroadCompat("a–b")).toBe("a-b");
    expect(sanitizeForBroadCompat("5−3")).toBe("5-3");
  });

  it("replaces curly quotes", () => {
    expect(sanitizeForBroadCompat("‘hello’")).toBe("'hello'");
    expect(sanitizeForBroadCompat("“hello”")).toBe('"hello"');
  });

  it("replaces math symbols", () => {
    expect(sanitizeForBroadCompat("a ≥ b")).toBe("a >= b");
    expect(sanitizeForBroadCompat("a ≤ b")).toBe("a <= b");
    expect(sanitizeForBroadCompat("a ≠ b")).toBe("a != b");
    expect(sanitizeForBroadCompat("2 × 3")).toBe("2 x 3");
  });

  it("replaces ellipsis", () => {
    expect(sanitizeForBroadCompat("wait…")).toBe("wait...");
  });

  it("replaces arrows", () => {
    expect(sanitizeForBroadCompat("a → b")).toBe("a -> b");
    expect(sanitizeForBroadCompat("a ⇒ b")).toBe("a -> b");
  });

  it("strips zero-width characters", () => {
    expect(sanitizeForBroadCompat("a​b‌c")).toBe("abc");
  });

  it("preserves ASCII unchanged", () => {
    expect(sanitizeForBroadCompat("Hello, world! [test]")).toBe("Hello, world! [test]");
  });

  it("handles empty / undefined safely", () => {
    expect(sanitizeForBroadCompat("")).toBe("");
  });
});

describe("sanitizeObjectStrings", () => {
  it("recurses through nested objects", () => {
    const input = {
      name: "test — description",
      params: { hint: "value ≥ 100" },
      tags: ["one—two", "three"],
    };
    const out = sanitizeObjectStrings(input);
    expect(out.name).toBe("test  -  description");
    expect(out.params.hint).toBe("value >= 100");
    expect(out.tags[0]).toBe("one - two");
  });

  it("preserves non-string leaves", () => {
    const input = { count: 42, enabled: true, nullVal: null };
    expect(sanitizeObjectStrings(input)).toEqual({ count: 42, enabled: true, nullVal: null });
  });
});
