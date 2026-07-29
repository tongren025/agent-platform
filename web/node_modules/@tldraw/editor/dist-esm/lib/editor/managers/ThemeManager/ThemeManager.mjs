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
import { atom, computed } from "@tldraw/state";
import { structuredClone } from "@tldraw/utils";
import { DEFAULT_THEME } from "./defaultThemes.mjs";
function resolveThemes(themes) {
  return { default: DEFAULT_THEME, ...themes };
}
class ThemeManager {
  constructor(editor, options) {
    this.editor = editor;
    this._themes = atom("ThemeManager._definitions", options.themes);
    this._currentThemeId = atom("ThemeManager._currentThemeName", options.initial);
  }
  editor;
  _themes;
  _currentThemeId;
  getColorMode() {
    return this.editor.user.getIsDarkMode() ? "dark" : "light";
  }
  /** Get all registered theme definitions. */
  getThemes() {
    return this._themes.get();
  }
  /** Get a single theme definition by id. */
  getTheme(id) {
    return this._themes.get()[id];
  }
  /** Get the id of the current theme. */
  getCurrentThemeId() {
    return this._currentThemeId.get();
  }
  getCurrentTheme() {
    return this._themes.get()[this.getCurrentThemeId()];
  }
  /** Set the current theme by id. The theme must have been previously registered. */
  setCurrentTheme(id) {
    if (process.env.NODE_ENV !== "production") {
      if (!(id in this._themes.get())) {
        console.warn(
          `Theme '${id}' not found. Available themes: ${Object.keys(this._themes.get()).join(", ")}`
        );
      }
    }
    this._currentThemeId.set(id);
  }
  /** Replace all theme definitions, or update them via a callback that receives a deep copy. */
  updateThemes(themes) {
    this._themes.update((prev) => {
      const next = typeof themes === "function" ? themes(structuredClone(prev)) : themes;
      if (process.env.NODE_ENV !== "production") {
        if (!("default" in next)) {
          console.warn("The 'default' theme cannot be removed.");
          return prev;
        }
      }
      if (!(this._currentThemeId.get() in next)) {
        this._currentThemeId.set("default");
      }
      return next;
    });
  }
  /** Register or update a named theme definition. */
  updateTheme(theme) {
    this._themes.update((prev) => ({
      ...prev,
      [theme.id]: theme
    }));
  }
  /** Clean up any resources held by the manager. */
  dispose() {
  }
}
__decorateClass([
  computed
], ThemeManager.prototype, "getColorMode", 1);
export {
  ThemeManager,
  resolveThemes
};
//# sourceMappingURL=ThemeManager.mjs.map
