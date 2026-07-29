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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var UserPreferencesManager_exports = {};
__export(UserPreferencesManager_exports, {
  UserPreferencesManager: () => UserPreferencesManager
});
module.exports = __toCommonJS(UserPreferencesManager_exports);
var import_state = require("@tldraw/state");
var import_tlschema = require("@tldraw/tlschema");
var import_TLUserPreferences = require("../../../config/TLUserPreferences");
var import_dom = require("../../../utils/dom");
class UserPreferencesManager {
  constructor(user, colorScheme) {
    this.user = user;
    this.colorScheme = colorScheme;
    if (typeof window === "undefined" || !(0, import_dom.getGlobalWindow)().matchMedia) return;
    const darkModeMediaQuery = (0, import_dom.getGlobalWindow)().matchMedia("(prefers-color-scheme: dark)");
    if (darkModeMediaQuery?.matches) {
      this.systemColorScheme.set("dark");
    }
    const handleChange = (e) => {
      if (e.matches) {
        this.systemColorScheme.set("dark");
      } else {
        this.systemColorScheme.set("light");
      }
    };
    darkModeMediaQuery?.addEventListener("change", handleChange);
    this.disposables.add(() => darkModeMediaQuery?.removeEventListener("change", handleChange));
  }
  user;
  colorScheme;
  systemColorScheme = (0, import_state.atom)("systemColorScheme", "light");
  disposables = /* @__PURE__ */ new Set();
  dispose() {
    this.disposables.forEach((d) => d());
  }
  updateUserPreferences(userPreferences) {
    this.user.setUserPreferences({
      ...this.user.userPreferences.get(),
      ...userPreferences
    });
  }
  getUserPreferences() {
    return {
      id: this.getExternalId(),
      name: this.getName(),
      locale: this.getLocale(),
      color: this.getColor(),
      animationSpeed: this.getAnimationSpeed(),
      areKeyboardShortcutsEnabled: this.getAreKeyboardShortcutsEnabled(),
      isSnapMode: this.getIsSnapMode(),
      colorScheme: this.user.userPreferences.get().colorScheme,
      isDarkMode: this.getIsDarkMode(),
      isWrapMode: this.getIsWrapMode(),
      isDynamicResizeMode: this.getIsDynamicResizeMode(),
      enhancedA11yMode: this.getEnhancedA11yMode(),
      inputMode: this.getInputMode(),
      isZoomDirectionInverted: this.getIsZoomDirectionInverted()
    };
  }
  getIsDarkMode() {
    const userColorScheme = this.user.userPreferences.get().colorScheme;
    const scheme = userColorScheme ?? this.colorScheme;
    switch (scheme) {
      case "dark":
        return true;
      case "light":
        return false;
      case "system":
        return this.systemColorScheme.get() === "dark";
      default:
        return false;
    }
  }
  getEdgeScrollSpeed() {
    return this.user.userPreferences.get().edgeScrollSpeed ?? import_TLUserPreferences.defaultUserPreferences.edgeScrollSpeed;
  }
  getAnimationSpeed() {
    return this.user.userPreferences.get().animationSpeed ?? import_TLUserPreferences.defaultUserPreferences.animationSpeed;
  }
  getAreKeyboardShortcutsEnabled() {
    return this.user.userPreferences.get().areKeyboardShortcutsEnabled ?? import_TLUserPreferences.defaultUserPreferences.areKeyboardShortcutsEnabled;
  }
  getExternalId() {
    return this.user.userPreferences.get().id;
  }
  getId() {
    return this.getExternalId();
  }
  getRecordId() {
    return (0, import_tlschema.createUserId)(this.getExternalId());
  }
  getName() {
    return this.user.userPreferences.get().name?.trim() ?? import_TLUserPreferences.defaultUserPreferences.name;
  }
  getLocale() {
    return this.user.userPreferences.get().locale ?? import_TLUserPreferences.defaultUserPreferences.locale;
  }
  getColor() {
    return this.user.userPreferences.get().color ?? import_TLUserPreferences.defaultUserPreferences.color;
  }
  getIsSnapMode() {
    return this.user.userPreferences.get().isSnapMode ?? import_TLUserPreferences.defaultUserPreferences.isSnapMode;
  }
  getIsWrapMode() {
    return this.user.userPreferences.get().isWrapMode ?? import_TLUserPreferences.defaultUserPreferences.isWrapMode;
  }
  getIsDynamicResizeMode() {
    return this.user.userPreferences.get().isDynamicSizeMode ?? import_TLUserPreferences.defaultUserPreferences.isDynamicSizeMode;
  }
  getIsPasteAtCursorMode() {
    return this.user.userPreferences.get().isPasteAtCursorMode ?? import_TLUserPreferences.defaultUserPreferences.isPasteAtCursorMode;
  }
  getEnhancedA11yMode() {
    return this.user.userPreferences.get().enhancedA11yMode ?? import_TLUserPreferences.defaultUserPreferences.enhancedA11yMode;
  }
  getInputMode() {
    return this.user.userPreferences.get().inputMode ?? import_TLUserPreferences.defaultUserPreferences.inputMode;
  }
  getIsZoomDirectionInverted() {
    return this.user.userPreferences.get().isZoomDirectionInverted ?? import_TLUserPreferences.defaultUserPreferences.isZoomDirectionInverted;
  }
}
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getUserPreferences", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsDarkMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getEdgeScrollSpeed", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getAnimationSpeed", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getAreKeyboardShortcutsEnabled", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getExternalId", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getId", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getRecordId", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getName", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getLocale", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getColor", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsSnapMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsWrapMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsDynamicResizeMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsPasteAtCursorMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getEnhancedA11yMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getInputMode", 1);
__decorateClass([
  import_state.computed
], UserPreferencesManager.prototype, "getIsZoomDirectionInverted", 1);
//# sourceMappingURL=UserPreferencesManager.js.map
