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
import { createUserId } from "@tldraw/tlschema";
import { defaultUserPreferences } from "../../../config/TLUserPreferences.mjs";
import { getGlobalWindow } from "../../../utils/dom.mjs";
class UserPreferencesManager {
  constructor(user, colorScheme) {
    this.user = user;
    this.colorScheme = colorScheme;
    if (typeof window === "undefined" || !getGlobalWindow().matchMedia) return;
    const darkModeMediaQuery = getGlobalWindow().matchMedia("(prefers-color-scheme: dark)");
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
  systemColorScheme = atom("systemColorScheme", "light");
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
    return this.user.userPreferences.get().edgeScrollSpeed ?? defaultUserPreferences.edgeScrollSpeed;
  }
  getAnimationSpeed() {
    return this.user.userPreferences.get().animationSpeed ?? defaultUserPreferences.animationSpeed;
  }
  getAreKeyboardShortcutsEnabled() {
    return this.user.userPreferences.get().areKeyboardShortcutsEnabled ?? defaultUserPreferences.areKeyboardShortcutsEnabled;
  }
  getExternalId() {
    return this.user.userPreferences.get().id;
  }
  getId() {
    return this.getExternalId();
  }
  getRecordId() {
    return createUserId(this.getExternalId());
  }
  getName() {
    return this.user.userPreferences.get().name?.trim() ?? defaultUserPreferences.name;
  }
  getLocale() {
    return this.user.userPreferences.get().locale ?? defaultUserPreferences.locale;
  }
  getColor() {
    return this.user.userPreferences.get().color ?? defaultUserPreferences.color;
  }
  getIsSnapMode() {
    return this.user.userPreferences.get().isSnapMode ?? defaultUserPreferences.isSnapMode;
  }
  getIsWrapMode() {
    return this.user.userPreferences.get().isWrapMode ?? defaultUserPreferences.isWrapMode;
  }
  getIsDynamicResizeMode() {
    return this.user.userPreferences.get().isDynamicSizeMode ?? defaultUserPreferences.isDynamicSizeMode;
  }
  getIsPasteAtCursorMode() {
    return this.user.userPreferences.get().isPasteAtCursorMode ?? defaultUserPreferences.isPasteAtCursorMode;
  }
  getEnhancedA11yMode() {
    return this.user.userPreferences.get().enhancedA11yMode ?? defaultUserPreferences.enhancedA11yMode;
  }
  getInputMode() {
    return this.user.userPreferences.get().inputMode ?? defaultUserPreferences.inputMode;
  }
  getIsZoomDirectionInverted() {
    return this.user.userPreferences.get().isZoomDirectionInverted ?? defaultUserPreferences.isZoomDirectionInverted;
  }
}
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getUserPreferences", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsDarkMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getEdgeScrollSpeed", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getAnimationSpeed", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getAreKeyboardShortcutsEnabled", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getExternalId", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getId", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getRecordId", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getName", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getLocale", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getColor", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsSnapMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsWrapMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsDynamicResizeMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsPasteAtCursorMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getEnhancedA11yMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getInputMode", 1);
__decorateClass([
  computed
], UserPreferencesManager.prototype, "getIsZoomDirectionInverted", 1);
export {
  UserPreferencesManager
};
//# sourceMappingURL=UserPreferencesManager.mjs.map
