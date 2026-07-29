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
export {
  getOverlayDisplayValues
};
//# sourceMappingURL=getOverlayDisplayValues.mjs.map
