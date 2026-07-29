import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { validateCapabilityMatrix } from "./test-capability-matrix.mjs";

const root = path.resolve(import.meta.dirname, "..");
const matrix = JSON.parse(fs.readFileSync(path.join(root, "tests/system/capabilities.json"), "utf8"));

describe("capability matrix", () => {
  test("contains unique capability ids", () => {
    const result = validateCapabilityMatrix(matrix, { root });
    expect(result.errors.filter((error) => error.includes("duplicate id"))).toEqual([]);
  });

  test("high-risk capabilities declare all four test dimensions", () => {
    const result = validateCapabilityMatrix(matrix, { root });
    expect(result.errors.filter((error) => error.includes("dimension"))).toEqual([]);
  });

  test("referenced test files exist or have an honest unsupported reason", () => {
    const result = validateCapabilityMatrix(matrix, { root });
    expect(result.errors.filter((error) => error.includes("missing test file"))).toEqual([]);
  });

  test("reports uncovered dimensions without treating them as schema errors", () => {
    const result = validateCapabilityMatrix([
      { id: "demo", group: "demo", risk: "high", normal: [], boundary: [], failure: [], persistence: [], journeys: [], unsupportedReason: null },
    ], { root });
    expect(result.errors).toEqual([]);
    expect(result.uncovered).toEqual(["demo:normal", "demo:boundary", "demo:failure", "demo:persistence"]);
  });
});
