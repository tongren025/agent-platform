import { objectMapKeys } from "@tldraw/utils";
function resolveLineHeightPx(fontSize, lineHeight) {
  return Math.round(fontSize * lineHeight);
}
const fixNewLines = /\r?\n|\r/g;
function normalizeTextForDom(text) {
  return text.replace(fixNewLines, "\n").split("\n").map((x) => x || " ").join("\n");
}
const textAlignmentsForLtr = {
  start: "left",
  "start-legacy": "left",
  middle: "center",
  "middle-legacy": "center",
  end: "right",
  "end-legacy": "right"
};
const spaceCharacterRegex = /\s/;
const initialDefaultStyles = Object.freeze({
  "overflow-wrap": "break-word",
  "word-break": "auto",
  width: null,
  height: null,
  "max-width": null,
  "min-width": null
});
class TextManager {
  constructor(editor) {
    this.editor = editor;
    this.elm = this.createMeasurementEl();
    this.editor.getContainer().appendChild(this.elm);
  }
  editor;
  elm;
  poolElms = [];
  createMeasurementEl() {
    const elm = this.editor.getContainerDocument().createElement("div");
    elm.classList.add("tl-text");
    elm.classList.add("tl-text-measure");
    elm.setAttribute("dir", "auto");
    elm.tabIndex = -1;
    for (const key of objectMapKeys(initialDefaultStyles)) {
      elm.style.setProperty(key, initialDefaultStyles[key]);
    }
    return elm;
  }
  resetElementStyles(el, appliedStyleKeys) {
    for (const key of appliedStyleKeys) {
      if (key in initialDefaultStyles) {
        el.style.setProperty(key, initialDefaultStyles[key]);
      } else {
        el.style.removeProperty(key);
      }
    }
  }
  setElementStyles(el, styles) {
    const restore = [];
    for (const [key, nextValue] of Object.entries(styles)) {
      const oldValue = el.style.getPropertyValue(key);
      if (typeof nextValue === "string") {
        if (oldValue === nextValue) continue;
        restore.push([key, oldValue || null]);
        el.style.setProperty(key, nextValue);
      } else {
        if (!oldValue) continue;
        restore.push([key, oldValue]);
        el.style.removeProperty(key);
      }
    }
    return () => {
      for (const [key, value] of restore) {
        if (value === null || value === "") el.style.removeProperty(key);
        else el.style.setProperty(key, value);
      }
    };
  }
  getMeasureStyles(opts) {
    return {
      "font-family": opts.fontFamily,
      "font-style": opts.fontStyle,
      "font-weight": opts.fontWeight,
      "font-size": opts.fontSize + "px",
      "line-height": `${resolveLineHeightPx(opts.fontSize, opts.lineHeight)}px`,
      padding: opts.padding,
      "max-width": opts.maxWidth ? opts.maxWidth + "px" : void 0,
      "min-width": opts.minWidth ? opts.minWidth + "px" : void 0,
      "overflow-wrap": opts.disableOverflowWrapBreaking ? "normal" : "break-word",
      ...opts.otherStyles
    };
  }
  dispose() {
    this.elm.remove();
    for (const { el } of this.poolElms) {
      el.remove();
    }
    this.poolElms.length = 0;
  }
  ensurePoolSize(size) {
    if (this.poolElms.length >= size) return;
    const fragment = this.editor.getContainerDocument().createDocumentFragment();
    while (this.poolElms.length < size) {
      const el = this.createMeasurementEl();
      this.poolElms.push({ el, html: "", appliedStyleKeys: [] });
      fragment.appendChild(el);
    }
    this.editor.getContainer().appendChild(fragment);
  }
  getPoolItem(index) {
    this.ensurePoolSize(index + 1);
    return this.poolElms[index];
  }
  measureHtmlBatch(requests) {
    if (requests.length === 0) return [];
    while (this.poolElms.length > requests.length) {
      const { el } = this.poolElms.pop();
      el.remove();
    }
    for (let i = 0; i < requests.length; i++) {
      const { html, opts } = requests[i];
      const poolItem = this.getPoolItem(i);
      const { el } = poolItem;
      this.resetElementStyles(el, poolItem.appliedStyleKeys);
      const styles = this.getMeasureStyles(opts);
      this.setElementStyles(el, styles);
      poolItem.appliedStyleKeys = Object.keys(styles);
      if (poolItem.html !== html) {
        el.innerHTML = html;
        poolItem.html = html;
      }
    }
    const results = [];
    for (let i = 0; i < requests.length; i++) {
      const el = this.getPoolItem(i).el;
      const scrollWidth = requests[i].opts.measureScrollWidth ? el.scrollWidth : 0;
      const rect = el.getBoundingClientRect();
      results.push({
        x: 0,
        y: 0,
        w: rect.width,
        h: rect.height,
        scrollWidth
      });
    }
    return results;
  }
  measureText(textToMeasure, opts) {
    const div = this.editor.getContainerDocument().createElement("div");
    div.textContent = normalizeTextForDom(textToMeasure);
    return this.measureHtml(div.innerHTML, opts);
  }
  measureHtml(html, opts) {
    const { elm } = this;
    const restoreStyles = this.setElementStyles(elm, this.getMeasureStyles(opts));
    try {
      elm.innerHTML = html;
      const scrollWidth = opts.measureScrollWidth ? elm.scrollWidth : 0;
      const rect = elm.getBoundingClientRect();
      return {
        x: 0,
        y: 0,
        w: rect.width,
        h: rect.height,
        scrollWidth
      };
    } finally {
      restoreStyles();
    }
  }
  /**
   * Given an html element, measure the position of each span of unbroken
   * word/white-space characters within any text nodes it contains.
   */
  measureElementTextNodeSpans(element, { shouldTruncateToFirstLine = false } = {}) {
    const spans = [];
    const elmBounds = element.getBoundingClientRect();
    const offsetX = -elmBounds.left;
    const offsetY = -elmBounds.top;
    const range = new Range();
    const textNode = element.childNodes[0];
    let idx = 0;
    let currentSpan = null;
    let prevCharWasSpaceCharacter = null;
    let prevCharTop = 0;
    let prevCharLeftForRTLTest = 0;
    let didTruncate = false;
    for (const childNode of element.childNodes) {
      if (childNode.nodeType !== Node.TEXT_NODE) continue;
      for (const char of childNode.textContent ?? "") {
        range.setStart(textNode, idx);
        range.setEnd(textNode, idx + char.length);
        const rects = range.getClientRects();
        const rect = rects[rects.length - 1];
        const top = rect.top + offsetY;
        const left = rect.left + offsetX;
        const right = rect.right + offsetX;
        const isRTL = left < prevCharLeftForRTLTest;
        const isSpaceCharacter = spaceCharacterRegex.test(char);
        if (
          // If we're at a word boundary...
          isSpaceCharacter !== prevCharWasSpaceCharacter || // ...or we're on a different line...
          top !== prevCharTop || // ...or we're at the start of the text and haven't created a span yet...
          !currentSpan
        ) {
          if (currentSpan) {
            if (shouldTruncateToFirstLine && top !== prevCharTop) {
              didTruncate = true;
              break;
            }
            spans.push(currentSpan);
          }
          currentSpan = {
            box: { x: left, y: top, w: rect.width, h: rect.height },
            text: char
          };
          prevCharLeftForRTLTest = left;
        } else {
          if (isRTL) {
            currentSpan.box.x = left;
          }
          currentSpan.box.w = isRTL ? currentSpan.box.w + rect.width : right - currentSpan.box.x;
          currentSpan.text += char;
        }
        if (char === "\n") {
          prevCharLeftForRTLTest = 0;
        }
        prevCharWasSpaceCharacter = isSpaceCharacter;
        prevCharTop = top;
        idx += char.length;
      }
    }
    if (currentSpan) {
      spans.push(currentSpan);
    }
    return { spans, didTruncate };
  }
  /**
   * Measure text into individual spans. Spans are created by rendering the
   * text, then dividing it up according to line breaks and word boundaries.
   *
   * It works by having the browser render the text, then measuring the
   * position of each character. You can use this to replicate the text-layout
   * algorithm of the current browser in e.g. an SVG export.
   */
  measureTextSpans(textToMeasure, opts) {
    if (textToMeasure === "") return [];
    const { elm } = this;
    const shouldTruncateToFirstLine = opts.overflow === "truncate-ellipsis" || opts.overflow === "truncate-clip";
    const elementWidth = Math.ceil(opts.width - opts.padding * 2);
    const newStyles = {
      "font-family": opts.fontFamily,
      "font-style": opts.fontStyle,
      "font-weight": opts.fontWeight,
      "font-size": opts.fontSize + "px",
      "line-height": `${resolveLineHeightPx(opts.fontSize, opts.lineHeight)}px`,
      width: `${elementWidth}px`,
      height: "min-content",
      "text-align": textAlignmentsForLtr[opts.textAlign],
      "overflow-wrap": shouldTruncateToFirstLine ? "anywhere" : "break-word",
      "word-break": shouldTruncateToFirstLine ? "break-all" : "normal",
      ...opts.otherStyles
    };
    const restoreStyles = this.setElementStyles(elm, newStyles);
    try {
      const normalizedText = normalizeTextForDom(textToMeasure);
      elm.textContent = normalizedText;
      const { spans, didTruncate } = this.measureElementTextNodeSpans(elm, {
        shouldTruncateToFirstLine
      });
      if (opts.overflow === "truncate-ellipsis" && didTruncate) {
        elm.textContent = "\u2026";
        const ellipsisWidth = Math.ceil(this.measureElementTextNodeSpans(elm).spans[0].box.w);
        elm.style.setProperty("width", `${elementWidth - ellipsisWidth}px`);
        elm.textContent = normalizedText;
        const truncatedSpans = this.measureElementTextNodeSpans(elm, {
          shouldTruncateToFirstLine: true
        }).spans;
        const lastSpan = truncatedSpans[truncatedSpans.length - 1];
        truncatedSpans.push({
          text: "\u2026",
          box: {
            x: Math.min(lastSpan.box.x + lastSpan.box.w, opts.width - opts.padding - ellipsisWidth),
            y: lastSpan.box.y,
            w: ellipsisWidth,
            h: lastSpan.box.h
          }
        });
        return truncatedSpans;
      }
      return spans;
    } finally {
      restoreStyles();
    }
  }
}
export {
  TextManager,
  resolveLineHeightPx
};
//# sourceMappingURL=TextManager.mjs.map
