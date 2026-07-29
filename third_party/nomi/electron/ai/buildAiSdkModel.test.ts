import { describe, expect, it } from "vitest";
import { buildAiSdkModel } from "./buildAiSdkModel";

describe("buildAiSdkModel", () => {
  it("returns an openai-compatible language model for kind=openai-compatible", () => {
    const model = buildAiSdkModel({
      kind: "openai-compatible",
      baseURL: "https://api.chatfire.site/v1",
      apiKey: "test-key",
      modelId: "gpt-4o-mini",
    });
    // Vercel AI SDK exposes a stable shape on language models
    expect(model.specificationVersion).toBe("v1");
    expect(model.modelId).toBe("gpt-4o-mini");
    // openai-compatible providers expose a provider id derived from the
    // `name` passed to createOpenAICompatible (here: "nomi")
    expect(model.provider).toMatch(/^nomi/);
  });

  it("returns an anthropic language model for kind=anthropic", () => {
    const model = buildAiSdkModel({
      kind: "anthropic",
      baseURL: "",
      apiKey: "test-key",
      modelId: "claude-3-5-sonnet-latest",
    });
    expect(model.specificationVersion).toBe("v1");
    expect(model.modelId).toBe("claude-3-5-sonnet-latest");
    expect(model.provider).toMatch(/anthropic/);
  });

  it("accepts custom request headers without breaking model construction", () => {
    const model = buildAiSdkModel({
      kind: "openai-compatible",
      baseURL: "https://relay.example.com/v1",
      apiKey: "test-key",
      modelId: "gpt-4o-mini",
      headers: { "HTTP-Referer": "https://nomi.app", "X-Title": "Nomi", blank: "  " },
    });
    expect(model.modelId).toBe("gpt-4o-mini");

    const anthropic = buildAiSdkModel({
      kind: "anthropic",
      baseURL: "",
      apiKey: "test-key",
      modelId: "claude-3-5-sonnet-latest",
      headers: { "anthropic-beta": "prompt-caching-2024-07-31" },
    });
    expect(anthropic.modelId).toBe("claude-3-5-sonnet-latest");
  });

  it("throws when apiKey is missing", () => {
    expect(() =>
      buildAiSdkModel({
        kind: "openai-compatible",
        baseURL: "https://api.chatfire.site/v1",
        apiKey: "",
        modelId: "gpt-4o-mini",
      }),
    ).toThrow(/apiKey/);
  });

  it("requires baseURL for openai-compatible providers and accepts a custom one", () => {
    expect(() =>
      buildAiSdkModel({
        kind: "openai-compatible",
        baseURL: "",
        apiKey: "test-key",
        modelId: "gpt-4o-mini",
      }),
    ).toThrow(/baseURL/);

    const model = buildAiSdkModel({
      kind: "openai-compatible",
      baseURL: "https://custom.example.com/v1/",
      apiKey: "test-key",
      modelId: "gpt-4o-mini",
    });
    expect(model.modelId).toBe("gpt-4o-mini");
  });
});
