var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { assert, bind, compact } from "@tldraw/utils";
import { fetchCache, resourceToDataUrl } from "./fetchCache.mjs";
import { parseCss, parseCssFontFaces, parseCssFontFamilyValue } from "./parseCss.mjs";
const SVG_EXPORT_CLASSNAME = "tldraw-svg-export";
class FontEmbedder {
  fontFacesPromise = null;
  foundFontNames = /* @__PURE__ */ new Set();
  fontFacesToEmbed = /* @__PURE__ */ new Set();
  pendingPromises = [];
  startFindingDocumentFontFaces(doc) {
    assert(!this.fontFacesPromise, "FontEmbedder already started");
    this.fontFacesPromise = getDocumentFontFaces(doc);
  }
  onFontFamilyValue(fontFamilyValue) {
    assert(this.fontFacesPromise, "FontEmbedder not started");
    const fonts = parseCssFontFamilyValue(fontFamilyValue);
    for (const font of fonts) {
      if (this.foundFontNames.has(font)) return;
      this.foundFontNames.add(font);
      this.pendingPromises.push(
        this.fontFacesPromise.then((fontFaces) => {
          const relevantFontFaces = fontFaces.filter((fontFace) => fontFace.fontFamilies.has(font));
          for (const fontFace of relevantFontFaces) {
            if (this.fontFacesToEmbed.has(fontFace)) continue;
            this.fontFacesToEmbed.add(fontFace);
            for (const url of fontFace.urls) {
              if (!url.resolved || url.embedded) continue;
              url.embedded = resourceToDataUrl(url.resolved);
            }
          }
        })
      );
    }
  }
  async createCss() {
    await Promise.all(this.pendingPromises);
    let css = "";
    for (const fontFace of this.fontFacesToEmbed) {
      let fontFaceString = `@font-face {${fontFace.fontFace}}`;
      for (const url of fontFace.urls) {
        if (!url.embedded) continue;
        const dataUrl = await url.embedded;
        if (!dataUrl) continue;
        fontFaceString = fontFaceString.replace(url.original, dataUrl);
      }
      css += fontFaceString;
    }
    return css;
  }
}
__decorateClass([
  bind
], FontEmbedder.prototype, "onFontFamilyValue", 1);
async function getDocumentFontFaces(doc) {
  const win = doc.defaultView ?? globalThis;
  const fontFaces = [];
  const styleSheetsWithoutSvgExports = Array.from(doc.styleSheets).filter(
    (styleSheet) => !styleSheet.ownerNode?.closest(`.${SVG_EXPORT_CLASSNAME}`)
  );
  for (const styleSheet of styleSheetsWithoutSvgExports) {
    let cssRules;
    try {
      cssRules = styleSheet.cssRules;
    } catch {
    }
    if (cssRules) {
      for (const rule of styleSheet.cssRules) {
        if (rule instanceof win.CSSFontFaceRule) {
          fontFaces.push(parseCssFontFaces(rule.cssText, styleSheet.href ?? doc.baseURI));
        } else if (rule instanceof win.CSSImportRule) {
          const absoluteUrl = new URL(rule.href, rule.parentStyleSheet?.href ?? doc.baseURI);
          fontFaces.push(fetchCssFontFaces(absoluteUrl.href));
        }
      }
    } else if (styleSheet.href) {
      fontFaces.push(fetchCssFontFaces(styleSheet.href));
    }
  }
  return compact(await Promise.all(fontFaces)).flat();
}
const fetchCssFontFaces = fetchCache(async (response) => {
  const parsed = parseCss(await response.text(), response.url);
  const importedFontFaces = await Promise.all(
    parsed.imports.map(({ url }) => fetchCssFontFaces(new URL(url, response.url).href))
  );
  return [...parsed.fontFaces, ...compact(importedFontFaces).flat()];
});
export {
  FontEmbedder,
  SVG_EXPORT_CLASSNAME
};
//# sourceMappingURL=FontEmbedder.mjs.map
