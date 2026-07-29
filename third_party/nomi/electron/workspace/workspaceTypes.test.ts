import { describe, expect, it } from "vitest";
import {
  normalizeWorkspaceProjectRecord,
  normalizeRecentWorkspaceEntry,
  workspaceProjectRecordSchema,
} from "./workspaceTypes";

describe("workspaceProjectRecordSchema", () => {
  it("accepts portable v2 records without rootPath", () => {
    const parsed = workspaceProjectRecordSchema.parse({
      id: "project-1",
      name: "My Film",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
      savedAt: 300,
      revision: 4,
    });

    expect(parsed).toEqual({
      id: "project-1",
      name: "My Film",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
      savedAt: 300,
      revision: 4,
    });
  });

  it("keeps lastKnownRootPath optional and non-authoritative", () => {
    const parsed = workspaceProjectRecordSchema.parse({
      id: "project-1",
      name: "My Film",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
      savedAt: 300,
      revision: 4,
      lastKnownRootPath: "/old/machine/path/MyFilm",
    });

    expect(parsed.lastKnownRootPath).toBe("/old/machine/path/MyFilm");
  });

  it("rejects unsupported versions and missing required metadata", () => {
    expect(() => workspaceProjectRecordSchema.parse({ id: "project-1", name: "My Film", version: 1 })).toThrow();
    expect(() => workspaceProjectRecordSchema.parse({ name: "Missing Id", version: 2 })).toThrow();
  });
});

describe("normalizeWorkspaceProjectRecord", () => {
  it("fills savedAt and revision defaults without requiring rootPath", () => {
    const normalized = normalizeWorkspaceProjectRecord({
      id: "project-1",
      name: "My Film",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
    });

    expect(normalized).toEqual({
      id: "project-1",
      name: "My Film",
      version: 2,
      createdAt: 100,
      updatedAt: 200,
      savedAt: 200,
      revision: 0,
    });
  });
});

describe("normalizeRecentWorkspaceEntry", () => {
  it("requires rootPath only for recent registry entries", () => {
    const entry = normalizeRecentWorkspaceEntry({
      id: "project-1",
      name: "My Film",
      rootPath: "/Users/me/MyFilm",
      lastOpenedAt: 500,
    });

    expect(entry).toEqual({
      id: "project-1",
      name: "My Film",
      rootPath: "/Users/me/MyFilm",
      lastOpenedAt: 500,
      missing: false,
    });
  });

  it("rejects recent entries without rootPath", () => {
    expect(() => normalizeRecentWorkspaceEntry({ id: "project-1", name: "My Film", lastOpenedAt: 500 })).toThrow();
  });
});
