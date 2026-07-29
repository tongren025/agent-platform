import { computed, EMPTY_ARRAY, transact } from "@tldraw/state";
import { AtomMap } from "@tldraw/store";
import {
  areArraysShallowEqual,
  compact,
  FileHelpers,
  mapObjectMapValues,
  objectMapEntries
} from "@tldraw/utils";
const EMPTY_SHAPE_FONT_FACES_CACHE = { get: () => void 0 };
const EMPTY_SHAPE_FONT_LOAD_STATE_CACHE = { get: () => void 0 };
class FontManager {
  constructor(editor, assetUrls) {
    this.editor = editor;
    this.assetUrls = assetUrls;
    this.shapeFontFacesCache = editor.store.createComputedCache(
      "shape font faces",
      (shape) => {
        const shapeUtil = this.editor.getShapeUtil(shape);
        return shapeUtil.getFontFaces(shape);
      },
      {
        areResultsEqual: areArraysShallowEqual,
        areRecordsEqual: (a, b) => a.props === b.props && a.meta === b.meta
      }
    );
    this.shapeFontLoadStateCache = editor.store.createCache(
      (id) => {
        const fontFacesComputed = computed("font faces", () => this.getShapeFontFaces(id));
        return computed(
          "font load state",
          () => {
            const states = fontFacesComputed.get().map((face) => this.getFontState(face));
            return states;
          },
          { isEqual: areArraysShallowEqual }
        );
      }
    );
  }
  editor;
  assetUrls;
  dispose() {
    this.fontStates.clear();
    this.fontsToLoad.clear();
    this.shapeFontFacesCache = EMPTY_SHAPE_FONT_FACES_CACHE;
    this.shapeFontLoadStateCache = EMPTY_SHAPE_FONT_LOAD_STATE_CACHE;
  }
  shapeFontFacesCache;
  shapeFontLoadStateCache;
  getShapeFontFaces(shape) {
    const shapeId = typeof shape === "string" ? shape : shape.id;
    return this.shapeFontFacesCache.get(shapeId) ?? EMPTY_ARRAY;
  }
  trackFontsForShape(shape) {
    const shapeId = typeof shape === "string" ? shape : shape.id;
    this.shapeFontLoadStateCache.get(shapeId);
  }
  async loadRequiredFontsForCurrentPage(limit = Infinity) {
    const neededFonts = /* @__PURE__ */ new Set();
    for (const shapeId of this.editor.getCurrentPageShapeIds()) {
      for (const font of this.getShapeFontFaces(this.editor.getShape(shapeId))) {
        neededFonts.add(font);
      }
    }
    if (neededFonts.size > limit) {
      return;
    }
    const promises = Array.from(neededFonts, (font) => this.ensureFontIsLoaded(font));
    await Promise.all(promises);
  }
  fontStates = new AtomMap("font states");
  getFontState(font) {
    return this.fontStates.get(font) ?? null;
  }
  ensureFontIsLoaded(font) {
    const existingState = this.getFontState(font);
    if (existingState) return existingState.loadingPromise;
    const instance = this.findOrCreateFontFace(font);
    const state = {
      state: "loading",
      instance,
      loadingPromise: instance.load().then(() => {
        this.editor.getContainerDocument().fonts.add(instance);
        this.fontStates.update(font, (s) => ({ ...s, state: "ready" }));
      }).catch((err) => {
        console.error(err);
        this.fontStates.update(font, (s) => ({ ...s, state: "error" }));
      })
    };
    this.fontStates.set(font, state);
    return state.loadingPromise;
  }
  fontsToLoad = /* @__PURE__ */ new Set();
  requestFonts(fonts) {
    if (!this.fontsToLoad.size) {
      queueMicrotask(() => {
        if (this.editor.isDisposed) return;
        const toLoad = this.fontsToLoad;
        this.fontsToLoad = /* @__PURE__ */ new Set();
        transact(() => {
          for (const font of toLoad) {
            this.ensureFontIsLoaded(font);
          }
        });
      });
    }
    for (const font of fonts) {
      this.fontsToLoad.add(font);
    }
  }
  findOrCreateFontFace(font) {
    const containerDocument = this.editor.getContainerDocument();
    let cache = fontFaceCacheByDocument.get(containerDocument);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      fontFaceCacheByDocument.set(containerDocument, cache);
    }
    const key = getFontFaceCacheKey(font);
    const cached = cache.get(key);
    if (cached) return cached;
    const fonts = containerDocument.fonts;
    for (const existing of fonts) {
      if (existing.family === font.family && objectMapEntries(defaultFontFaceDescriptors).every(
        ([key2, defaultValue]) => existing[key2] === (font[key2] ?? defaultValue)
      )) {
        cache.set(key, existing);
        return existing;
      }
    }
    const url = this.assetUrls?.[font.src.url] ?? font.src.url;
    const instance = new FontFace(font.family, `url(${JSON.stringify(url)})`, {
      ...mapObjectMapValues(defaultFontFaceDescriptors, (key2) => font[key2]),
      display: "swap"
    });
    fonts.add(instance);
    cache.set(key, instance);
    return instance;
  }
  async toEmbeddedCssDeclaration(font) {
    const url = this.assetUrls?.[font.src.url] ?? font.src.url;
    const dataUrl = await FileHelpers.urlToDataUrl(url);
    const src = compact([
      `url("${dataUrl}")`,
      font.src.format ? `format(${font.src.format})` : null,
      font.src.tech ? `tech(${font.src.tech})` : null
    ]).join(" ");
    return compact([
      `@font-face {`,
      `  font-family: "${font.family}";`,
      font.ascentOverride ? `  ascent-override: ${font.ascentOverride};` : null,
      font.descentOverride ? `  descent-override: ${font.descentOverride};` : null,
      font.stretch ? `  font-stretch: ${font.stretch};` : null,
      font.style ? `  font-style: ${font.style};` : null,
      font.weight ? `  font-weight: ${font.weight};` : null,
      font.featureSettings ? `  font-feature-settings: ${font.featureSettings};` : null,
      font.lineGapOverride ? `  line-gap-override: ${font.lineGapOverride};` : null,
      font.unicodeRange ? `  unicode-range: ${font.unicodeRange};` : null,
      `  src: ${src};`,
      `}`
    ]).join("\n");
  }
}
const defaultFontFaceDescriptors = {
  style: "normal",
  weight: "normal",
  stretch: "normal",
  unicodeRange: "U+0-10FFFF",
  featureSettings: "normal",
  ascentOverride: "normal",
  descentOverride: "normal",
  lineGapOverride: "normal"
};
let fontFaceCacheByDocument = /* @__PURE__ */ new WeakMap();
function getFontFaceCacheKey(font) {
  return JSON.stringify([
    font.family,
    ...objectMapEntries(defaultFontFaceDescriptors).map(
      ([key, defaultValue]) => font[key] ?? defaultValue
    )
  ]);
}
function clearFontFaceCacheForTests() {
  fontFaceCacheByDocument = /* @__PURE__ */ new WeakMap();
}
export {
  FontManager,
  clearFontFaceCacheForTests
};
//# sourceMappingURL=FontManager.mjs.map
