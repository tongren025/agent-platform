import { describe, expect, it } from "vitest";
import { TtlLruCache } from "./taskCache";

function makeClock(start = 0) {
  let now = start;
  return { now: () => now, advance: (ms: number) => { now += ms; } };
}

describe("TtlLruCache", () => {
  it("stores and reads back values", () => {
    const c = new TtlLruCache<number>({ maxEntries: 10, ttlMs: 1000 });
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
    expect(c.get("missing")).toBeUndefined();
  });

  it("expires entries past their TTL", () => {
    const clock = makeClock();
    const c = new TtlLruCache<string>({ maxEntries: 10, ttlMs: 1000, clock: clock.now });
    c.set("k", "v");
    clock.advance(999);
    expect(c.get("k")).toBe("v");
    clock.advance(2); // 越过 ttl
    expect(c.get("k")).toBeUndefined();
    expect(c.size).toBe(0); // 过期即清
  });

  it("evicts the least-recently-used entry past maxEntries", () => {
    const c = new TtlLruCache<number>({ maxEntries: 2, ttlMs: 100000 });
    c.set("a", 1);
    c.set("b", 2);
    c.get("a"); // 触碰 a → b 变成最久未用
    c.set("c", 3); // 超上限 → 淘汰 b
    expect(c.get("a")).toBe(1);
    expect(c.get("b")).toBeUndefined();
    expect(c.get("c")).toBe(3);
    expect(c.size).toBe(2);
  });

  it("delete removes an entry", () => {
    const c = new TtlLruCache<number>({ maxEntries: 5, ttlMs: 1000 });
    c.set("a", 1);
    expect(c.delete("a")).toBe(true);
    expect(c.get("a")).toBeUndefined();
    expect(c.delete("a")).toBe(false);
  });
});
