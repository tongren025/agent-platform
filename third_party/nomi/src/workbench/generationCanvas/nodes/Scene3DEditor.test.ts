import { describe, it, expect } from "vitest";
import { scene3DStateEqual, readTakeCaptureStatus } from "./Scene3DEditor";
import { readScene3DCardPreview } from "./scene3d/scene3dCardPreview";
import { normalizeScene3DState } from "./scene3d/scene3dSerializer";
import type { Scene3DState } from "./scene3d/scene3dTypes";
import type { GenerationCanvasNode } from "../model/generationCanvasTypes";

function nodeWithMeta(meta: Record<string, unknown> | undefined): GenerationCanvasNode {
  return { id: "n1", kind: "scene3d", title: "录制走位参考", position: { x: 0, y: 0 }, meta } as GenerationCanvasNode;
}

// 单一确定性基准 state（normalize 默认会带随机 id，故只生成一次，b 用深拷贝，
// 保证除被测字段外两侧完全一致 —— 测的是「字段值差异」而非「随机 id 差异」）。
const BASE: Scene3DState = normalizeScene3DState(undefined);
function clone(): Scene3DState {
  return JSON.parse(JSON.stringify(BASE)) as Scene3DState;
}

describe("scene3DStateEqual", () => {
  it("同一 state 的两份深拷贝相等（值相等而非引用相等，等价旧 JSON.stringify）", () => {
    expect(scene3DStateEqual(clone(), clone())).toBe(true);
  });

  it("editorCamera 位置变化即不相等（相机移动后要落盘）", () => {
    const a = clone();
    const b = clone();
    b.editorCamera = { ...b.editorCamera, position: [9, 9, 9] };
    expect(scene3DStateEqual(a, b)).toBe(false);
  });

  it("environment 字段变化即不相等", () => {
    const a = clone();
    const b = clone();
    b.environment = { ...b.environment, showGrid: !b.environment.showGrid };
    expect(scene3DStateEqual(a, b)).toBe(false);
  });

  it("objects 数组长度变化即不相等", () => {
    const a = clone();
    const b = clone();
    b.objects = [
      ...b.objects,
      {
        id: "o-extra",
        name: "立方体",
        type: "mesh",
        visible: true,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometry: "box",
      },
    ];
    expect(scene3DStateEqual(a, b)).toBe(false);
  });

  it("objects 内嵌套向量逐元素深比较", () => {
    const a = clone();
    const b = clone();
    // 仅改第一个对象的 position 一个分量 → 必须被识别为不等。
    a.objects = a.objects.map((o, i) => (i === 0 ? { ...o, position: [0, 0.5, 0] } : o));
    b.objects = b.objects.map((o, i) => (i === 0 ? { ...o, position: [0, 0.5, 0] } : o));
    expect(scene3DStateEqual(a, b)).toBe(true);
    b.objects = b.objects.map((o, i) => (i === 0 ? { ...o, position: [0, 0.51, 0] } : o));
    expect(scene3DStateEqual(a, b)).toBe(false);
  });

  it("多一个 defined 键即不相等（漏字段不会被误判为相等）", () => {
    const a = clone() as Scene3DState & { extra?: number };
    const b = clone();
    a.extra = 1;
    expect(scene3DStateEqual(a, b)).toBe(false);
  });

  it("忽略 value 为 undefined 的键（与 JSON.stringify 同义，避免多余写入）", () => {
    const a = clone() as Scene3DState & { ghost?: undefined };
    const b = clone();
    a.ghost = undefined;
    expect(scene3DStateEqual(a, b)).toBe(true);
  });

  it("lastThumbnail 变化即不相等", () => {
    const a = clone();
    const b = clone();
    b.lastThumbnail = "data:image/png;base64,xxx";
    expect(scene3DStateEqual(a, b)).toBe(false);
  });
});

describe("readTakeCaptureStatus（录 take 闭环徽标状态，#1）", () => {
  it("无相关 meta → null（普通 3D 节点不显徽标）", () => {
    expect(readTakeCaptureStatus(nodeWithMeta(undefined))).toBe(null);
    expect(readTakeCaptureStatus(nodeWithMeta({ scene3dState: {} }))).toBe(null);
  });

  it("有 cameraMoveAutoCapture → generating（离屏出片中）", () => {
    expect(readTakeCaptureStatus(nodeWithMeta({ cameraMoveAutoCapture: { fps: 24, frameCount: 48 } }))).toBe(
      "generating",
    );
  });

  it("有带 url 的 cameraMoveVideo → done（出片完成）", () => {
    expect(
      readTakeCaptureStatus(nodeWithMeta({ cameraMoveVideo: { url: "asset://take.mp4", fps: 24, createdAt: 1 } })),
    ).toBe("done");
  });

  it("cameraMoveVideo 缺 url → 不算完成（防半成品误报 ✓）", () => {
    expect(readTakeCaptureStatus(nodeWithMeta({ cameraMoveVideo: { fps: 24 } }))).toBe(null);
  });

  it("cameraMoveVideo 的 url 只有空白 → 不算完成", () => {
    expect(readTakeCaptureStatus(nodeWithMeta({ cameraMoveVideo: { url: "   ", fps: 24 } }))).toBe(null);
  });

  it("出片中优先 generating（标志尚未清，video 还没写）", () => {
    expect(
      readTakeCaptureStatus(
        nodeWithMeta({ cameraMoveAutoCapture: { fps: 24 }, cameraMoveVideo: { url: "x" } }),
      ),
    ).toBe("generating");
  });
});

describe("readScene3DCardPreview（3D 卡面媒体单一选择器）", () => {
  it("参考视频与旧截图同时存在时优先显示参考视频", () => {
    expect(
      readScene3DCardPreview(
        nodeWithMeta({
          cameraMoveVideo: { url: "  asset://take.mp4  ", fps: 24 },
          scene3dState: { lastThumbnail: "asset://old-frame.png" },
        }),
      ),
    ).toEqual({ kind: "video", url: "asset://take.mp4" });
  });

  it("没有有效参考视频时回退到 3D 截图", () => {
    expect(
      readScene3DCardPreview(
        nodeWithMeta({
          cameraMoveVideo: { url: "  " },
          scene3dState: { lastThumbnail: "asset://frame.png" },
        }),
      ),
    ).toEqual({ kind: "image", url: "asset://frame.png" });
  });

  it("视频和截图都没有时显示空态", () => {
    expect(readScene3DCardPreview(nodeWithMeta({ scene3dState: {} }))).toEqual({ kind: "empty" });
  });
});
