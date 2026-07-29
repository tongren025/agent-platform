import { describe, expect, it } from "vitest";
import {
  MEDIA_TYPES,
  acceptAttrForKinds,
  contentTypeFromExtension,
  extensionFromContentType,
  extensionsForKind,
  mediaKindFromExtension,
  normalizeExtension,
} from "./mediaTypes";

describe("media types registry — single source of truth", () => {
  it("has no duplicate extensions", () => {
    const exts = MEDIA_TYPES.map((e) => e.ext);
    expect(new Set(exts).size).toBe(exts.length);
  });

  it("every ext is lowercase with a leading dot", () => {
    for (const entry of MEDIA_TYPES) {
      expect(entry.ext).toMatch(/^\.[a-z0-9]+$/);
    }
  });

  it("round-trips ext → contentType → ext for single-ext content types", () => {
    // jpg/jpeg、ogg/oga 等多扩展名共享 contentType,反查取首条;此处只验单扩展名条目的往返。
    const contentTypeCounts = new Map<string, number>();
    for (const e of MEDIA_TYPES) contentTypeCounts.set(e.contentType, (contentTypeCounts.get(e.contentType) || 0) + 1);
    for (const entry of MEDIA_TYPES) {
      if (contentTypeCounts.get(entry.contentType) === 1) {
        expect(`.${extensionFromContentType(entry.contentType)}`).toBe(entry.ext);
      }
    }
  });
});

describe("normalizeExtension", () => {
  it("accepts ext, dotted ext, filename and path; lowercases", () => {
    expect(normalizeExtension("mp3")).toBe(".mp3");
    expect(normalizeExtension(".MP3")).toBe(".mp3");
    expect(normalizeExtension("song.FLAC")).toBe(".flac");
    expect(normalizeExtension("/a/b/voice.m4a")).toBe(".m4a");
    expect(normalizeExtension("")).toBe("");
  });
});

describe("mediaKindFromExtension", () => {
  it("classifies image / video / audio", () => {
    expect(mediaKindFromExtension("photo.png")).toBe("image");
    expect(mediaKindFromExtension("clip.mp4")).toBe("video");
    expect(mediaKindFromExtension("clip.m4v")).toBe("video");
    expect(mediaKindFromExtension("voice.m4a")).toBe("audio");
    expect(mediaKindFromExtension("song.flac")).toBe("audio");
    expect(mediaKindFromExtension("a.aac")).toBe("audio");
    expect(mediaKindFromExtension("a.ogg")).toBe("audio");
  });
  it("returns null for unknown", () => {
    expect(mediaKindFromExtension("a.zip")).toBeNull();
    expect(mediaKindFromExtension("noext")).toBeNull();
  });
});

describe("contentTypeFromExtension", () => {
  it("maps audio extensions the old tables missed", () => {
    expect(contentTypeFromExtension(".m4a")).toBe("audio/mp4");
    expect(contentTypeFromExtension(".aac")).toBe("audio/aac");
    expect(contentTypeFromExtension(".flac")).toBe("audio/flac");
    expect(contentTypeFromExtension(".opus")).toBe("audio/opus");
  });
  it("returns null for unknown", () => {
    expect(contentTypeFromExtension(".zip")).toBeNull();
  });
});

describe("extensionFromContentType", () => {
  it("strips charset params and is case-insensitive", () => {
    expect(extensionFromContentType("AUDIO/MPEG; charset=x")).toBe("mp3");
  });
});

describe("extensionsForKind", () => {
  it("returns audio extensions without dots", () => {
    expect(extensionsForKind("audio")).toEqual(["mp3", "wav", "m4a", "aac", "ogg", "oga", "flac", "opus", "weba"]);
  });
});

describe("acceptAttrForKinds", () => {
  it("lists wildcards plus explicit extensions for picker", () => {
    const accept = acceptAttrForKinds(["image", "video", "audio"]);
    expect(accept).toContain("image/*");
    expect(accept).toContain("video/*");
    expect(accept).toContain("audio/*");
    // 显式扩展名补齐(macOS 灰掉坑):放行的音频格式都在
    expect(accept).toContain(".m4a");
    expect(accept).toContain(".flac");
    expect(accept).toContain(".mov");
    // 不含其它 kind
    expect(accept).not.toContain(".pdf");
    expect(accept).not.toContain(".glb");
  });
});
