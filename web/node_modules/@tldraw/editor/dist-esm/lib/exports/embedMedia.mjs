import { MediaHelpers } from "@tldraw/utils";
import { getOwnerWindow, getRenderedChildren } from "./domUtils.mjs";
import { resourceToDataUrl } from "./fetchCache.mjs";
function copyAttrs(source, target) {
  const attrs = Array.from(source.attributes);
  attrs.forEach((attr) => {
    target.setAttribute(attr.name, attr.value);
  });
}
function replace(original, replacement) {
  original.replaceWith(replacement);
  return replacement;
}
async function createImage(doc, dataUrl, cloneAttributesFrom) {
  const image = doc.createElement("img");
  if (cloneAttributesFrom) {
    copyAttrs(cloneAttributesFrom, image);
  }
  image.setAttribute("src", dataUrl ?? "data:");
  image.setAttribute("decoding", "sync");
  image.setAttribute("loading", "eager");
  try {
    await image.decode();
  } catch {
  }
  return image;
}
async function getCanvasReplacement(canvas) {
  const doc = canvas.ownerDocument;
  try {
    const dataURL = canvas.toDataURL();
    return await createImage(doc, dataURL, canvas);
  } catch {
    return await createImage(doc, null, canvas);
  }
}
async function getVideoReplacement(video) {
  const doc = video.ownerDocument;
  try {
    const dataUrl = await MediaHelpers.getVideoFrameAsDataUrl(video);
    return createImage(doc, dataUrl, video);
  } catch (err) {
    console.error("Could not get video frame", err);
  }
  if (video.poster) {
    const dataUrl = await resourceToDataUrl(video.poster);
    return createImage(doc, dataUrl, video);
  }
  return createImage(doc, null, video);
}
async function embedMedia(node) {
  const win = getOwnerWindow(node);
  if (node instanceof win.HTMLCanvasElement) {
    return replace(node, await getCanvasReplacement(node));
  } else if (node instanceof win.HTMLVideoElement) {
    return replace(node, await getVideoReplacement(node));
  } else if (node instanceof win.HTMLImageElement) {
    const src = node.currentSrc || node.src;
    const dataUrl = await resourceToDataUrl(src);
    node.setAttribute("src", dataUrl ?? "data:");
    node.setAttribute("decoding", "sync");
    node.setAttribute("loading", "eager");
    try {
      await node.decode();
    } catch {
    }
    return node;
  } else if (node instanceof win.HTMLInputElement) {
    node.setAttribute("value", node.value);
  } else if (node instanceof win.HTMLTextAreaElement) {
    node.textContent = node.value;
  }
  await Promise.all(
    Array.from(getRenderedChildren(node), (child) => embedMedia(child))
  );
}
export {
  embedMedia
};
//# sourceMappingURL=embedMedia.mjs.map
