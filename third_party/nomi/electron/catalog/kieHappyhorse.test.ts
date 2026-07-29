import { describe, it, expect } from "vitest";
import { buildHttpRequest, buildTemplateContext } from "../ai/requestPipeline";
import { KIE_VENDOR_SEED } from "./kieSeedance";
import { HAPPYHORSE_CREATE_OP } from "./kieHappyhorse";

// C4 离线锁定 HappyHorse 经 kie.ai 的传输契约（不花额度）。验三件事：
// ① per-mode model enum 覆盖（M3，body.model = request.params.model）；
// ② 各模式 input 形状（image_urls[1] / reference_image[N] / video_url）+ §2 坑1 尾随空格键；
// ③ 一条 body 覆盖 4 模式，非当前模式的键 undefined-丢弃（M2）。
// params 模拟 taskTemplateParams 的产物：renderer 的 archetypeInput（model + 参考键）+ 标量。

const inputOf = (params: Record<string, unknown>) => {
  const ctx = buildTemplateContext({
    request: { prompt: "一段视频" },
    params,
    model: { modelKey: "happyhorse" },
    modelKey: "happyhorse",
    apiKey: "SECRET",
  });
  const built = buildHttpRequest({ baseUrl: KIE_VENDOR_SEED.baseUrl, authType: KIE_VENDOR_SEED.authType, apiKey: "SECRET", context: ctx, operation: HAPPYHORSE_CREATE_OP });
  return built.body as { model: unknown; input: Record<string, unknown> };
};

describe("HappyHorse · per-mode enum 覆盖（M3）", () => {
  it("body.model 取 request.params.model（mode 的 enum），不是 catalog modelKey", () => {
    const body = inputOf({ model: "happyhorse/text-to-video", resolution: "1080p", aspect_ratio: "16:9", duration: 5 });
    expect(body.model).toBe("happyhorse/text-to-video");
  });
});

describe("HappyHorse · 各模式 input 形状 + 尾随空格键（§2 坑1）", () => {
  it("text-to-video：无参考键，只标量", () => {
    const input = inputOf({ model: "happyhorse/text-to-video", resolution: "1080p", aspect_ratio: "16:9", duration: 5 }).input;
    expect(input).not.toHaveProperty("image_urls ");
    expect(input).not.toHaveProperty("reference_image ");
    expect(input).not.toHaveProperty("video_url");
    expect(input.resolution).toBe("1080p");
  });

  it("image-to-video：image_urls 是 1 元素数组，键带尾随空格；无 aspect_ratio", () => {
    const input = inputOf({ model: "happyhorse/image-to-video", image_urls: ["F.png"], resolution: "1080p", duration: 5 }).input;
    expect(input).toHaveProperty("image_urls ", ["F.png"]);
    expect(input).not.toHaveProperty("image_urls");
    expect(input).not.toHaveProperty("aspect_ratio"); // i2v 模式 params 不含 → 不入 body
    expect(input).not.toHaveProperty("reference_image ");
  });

  it("reference-to-video：reference_image 是数组，键带尾随空格（按序 character1..9）", () => {
    const input = inputOf({ model: "happyhorse/reference-to-video", reference_image: ["c1", "c2", "c3"], resolution: "1080p", aspect_ratio: "9:16", duration: 8 }).input;
    expect(input).toHaveProperty("reference_image ", ["c1", "c2", "c3"]);
    expect(input).not.toHaveProperty("reference_image");
    expect(input).not.toHaveProperty("image_urls ");
  });

  it("video-edit：video_url + reference_image + audio_setting；无 duration/aspect_ratio", () => {
    const input = inputOf({ model: "happyhorse/video-edit", video_url: "src.mp4", reference_image: ["r1"], resolution: "720p", audio_setting: "origin" }).input;
    expect(input.video_url).toBe("src.mp4");
    expect(input).toHaveProperty("reference_image ", ["r1"]);
    expect(input.audio_setting).toBe("origin");
    expect(input).not.toHaveProperty("duration");
    expect(input).not.toHaveProperty("aspect_ratio");
  });
});
