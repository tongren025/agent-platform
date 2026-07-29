"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var getOverlayDisplayValues_exports = {};
__export(getOverlayDisplayValues_exports, {
  getOverlayDisplayValues: () => getOverlayDisplayValues
});
module.exports = __toCommonJS(getOverlayDisplayValues_exports);
const dvCache = /* @__PURE__ */ new WeakMap();
function getOverlayDisplayValues(util, overlay, colorMode) {
  const theme = util.editor.getCurrentTheme();
  const resolvedColorMode = colorMode ?? util.editor.getColorMode();
  const cached = dvCache.get(overlay);
  if (cached && cached.theme === theme && cached.colorMode === resolvedColorMode) {
    return cached.values;
  }
  const values = {
    ...util.options.getDefaultDisplayValues(util.editor, overlay, theme, resolvedColorMode),
    ...util.options.getCustomDisplayValues(util.editor, overlay, theme, resolvedColorMode)
  };
  dvCache.set(overlay, { theme, colorMode: resolvedColorMode, values });
  return values;
}
//# sourceMappingURL=getOverlayDisplayValues.js.map
