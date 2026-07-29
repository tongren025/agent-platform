import { FileHelpers, Image, PngHelpers, sleep } from "@tldraw/utils";
import { tlenv } from "../globals/environment.mjs";
import { clampToBrowserMaxCanvasSize } from "../utils/browserCanvasMaxSize.mjs";
import { debugFlags } from "../utils/debug-flags.mjs";
import { getGlobalDocument } from "../utils/dom.mjs";
async function getSvgAsImage(svgString, options) {
  const result = await getSvgAsImageWithOptions(svgString, options);
  return result?.blob ?? null;
}
async function getSvgAsImageWithOptions(svgString, options) {
  const { type, width, height, quality = 1, pixelRatio = 2, trimPadding = 0, scale = 1 } = options;
  if (width <= 0 || height <= 0) return null;
  let [clampedWidth, clampedHeight] = clampToBrowserMaxCanvasSize(
    width * pixelRatio,
    height * pixelRatio
  );
  clampedWidth = Math.floor(clampedWidth);
  clampedHeight = Math.floor(clampedHeight);
  const effectiveScale = clampedWidth / width;
  const canvas = await renderSvgToCanvas(svgString, clampedWidth, clampedHeight);
  if (!canvas) return null;
  const outputCanvas = trimPadding > 0 ? trimExtraPadding(canvas, trimPadding * scale * effectiveScale) : { canvas, width: clampedWidth, height: clampedHeight };
  const blob = await new Promise(
    (resolve) => outputCanvas.canvas.toBlob(
      (blob2) => {
        if (!blob2 || debugFlags.throwToBlob.get()) {
          resolve(null);
        }
        resolve(blob2);
      },
      "image/" + type,
      quality
    )
  );
  if (!blob) return null;
  let resultBlob;
  if (type === "png") {
    resultBlob = PngHelpers.setPhysChunk(new DataView(await blob.arrayBuffer()), effectiveScale, {
      type: "image/" + type
    });
  } else {
    resultBlob = blob;
  }
  return {
    blob: resultBlob,
    width: outputCanvas.width / effectiveScale,
    height: outputCanvas.height / effectiveScale
  };
}
async function renderSvgToCanvas(svgString, width, height) {
  const svgUrl = await FileHelpers.blobToDataUrl(new Blob([svgString], { type: "image/svg+xml" }));
  return new Promise((resolve) => {
    const image = Image();
    image.crossOrigin = "anonymous";
    image.onload = async () => {
      if (tlenv.isSafari) {
        await sleep(250);
      }
      const canvas = getGlobalDocument().createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas);
    };
    image.onerror = () => {
      resolve(null);
    };
    image.src = svgUrl;
  });
}
function measureContentBounds(canvas, trimPaddingPx) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  const extraPx = Math.ceil(trimPaddingPx);
  if (extraPx <= 0 || extraPx * 2 >= w || extraPx * 2 >= h) return null;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const cornerR = data[0];
  const cornerG = data[1];
  const cornerB = data[2];
  const cornerA = data[3];
  const hasTransparentBackground = cornerA === 0;
  function isContentPixel(offset) {
    if (hasTransparentBackground) {
      return data[offset + 3] > 0;
    } else {
      const a = data[offset + 3];
      if (a !== cornerA) return true;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      return r !== cornerR || g !== cornerG || b !== cornerB;
    }
  }
  const declaredLeft = extraPx;
  const declaredTop = extraPx;
  const declaredRight = w - extraPx;
  const declaredBottom = h - extraPx;
  let cropTop = declaredTop;
  for (let y = 0; y < declaredTop; y++) {
    let hasContent = false;
    for (let x = 0; x < w; x++) {
      if (isContentPixel((y * w + x) * 4)) {
        hasContent = true;
        break;
      }
    }
    if (hasContent) {
      cropTop = y;
      break;
    }
  }
  let cropBottom = declaredBottom;
  for (let y = h - 1; y >= declaredBottom; y--) {
    let hasContent = false;
    for (let x = 0; x < w; x++) {
      if (isContentPixel((y * w + x) * 4)) {
        hasContent = true;
        break;
      }
    }
    if (hasContent) {
      cropBottom = y + 1;
      break;
    }
  }
  let cropLeft = declaredLeft;
  for (let x = 0; x < declaredLeft; x++) {
    let hasContent = false;
    for (let y = cropTop; y < cropBottom; y++) {
      if (isContentPixel((y * w + x) * 4)) {
        hasContent = true;
        break;
      }
    }
    if (hasContent) {
      cropLeft = x;
      break;
    }
  }
  let cropRight = declaredRight;
  for (let x = w - 1; x >= declaredRight; x--) {
    let hasContent = false;
    for (let y = cropTop; y < cropBottom; y++) {
      if (isContentPixel((y * w + x) * 4)) {
        hasContent = true;
        break;
      }
    }
    if (hasContent) {
      cropRight = x + 1;
      break;
    }
  }
  if (cropLeft === 0 && cropTop === 0 && cropRight === w && cropBottom === h) {
    return null;
  }
  return { cropLeft, cropTop, cropRight, cropBottom };
}
function trimExtraPadding(canvas, trimPaddingPx) {
  const w = canvas.width;
  const h = canvas.height;
  const bounds = measureContentBounds(canvas, trimPaddingPx);
  if (!bounds) return { canvas, width: w, height: h };
  const { cropLeft, cropTop, cropRight, cropBottom } = bounds;
  const cropW = cropRight - cropLeft;
  const cropH = cropBottom - cropTop;
  const croppedCanvas = getGlobalDocument().createElement("canvas");
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const croppedCtx = croppedCanvas.getContext("2d");
  croppedCtx.drawImage(canvas, cropLeft, cropTop, cropW, cropH, 0, 0, cropW, cropH);
  return { canvas: croppedCanvas, width: cropW, height: cropH };
}
async function trimSvgToContent(svgString, options) {
  const { width, height, trimPadding, scale } = options;
  if (trimPadding <= 0) return null;
  const canvasWidth = Math.floor(width);
  const canvasHeight = Math.floor(height);
  if (canvasWidth <= 0 || canvasHeight <= 0) return null;
  const canvas = await renderSvgToCanvas(svgString, canvasWidth, canvasHeight);
  if (!canvas) return null;
  const trimPaddingPx = trimPadding * scale;
  const bounds = measureContentBounds(canvas, trimPaddingPx);
  if (!bounds) return null;
  const { cropLeft, cropTop, cropRight, cropBottom } = bounds;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;
  const viewBoxAttr = svgEl.getAttribute("viewBox");
  if (!viewBoxAttr) return null;
  const [vbMinX, vbMinY, vbW, vbH] = viewBoxAttr.split(/\s+/).map(Number);
  const newMinX = vbMinX + cropLeft / canvasWidth * vbW;
  const newMinY = vbMinY + cropTop / canvasHeight * vbH;
  const newVbW = (cropRight - cropLeft) / canvasWidth * vbW;
  const newVbH = (cropBottom - cropTop) / canvasHeight * vbH;
  const newWidth = newVbW * scale;
  const newHeight = newVbH * scale;
  svgEl.setAttribute("viewBox", `${newMinX} ${newMinY} ${newVbW} ${newVbH}`);
  svgEl.setAttribute("width", String(newWidth));
  svgEl.setAttribute("height", String(newHeight));
  const serializer = new XMLSerializer();
  const newSvgString = serializer.serializeToString(svgEl);
  return { svg: newSvgString, width: newWidth, height: newHeight };
}
export {
  getSvgAsImage,
  getSvgAsImageWithOptions,
  trimSvgToContent
};
//# sourceMappingURL=getSvgAsImage.mjs.map
