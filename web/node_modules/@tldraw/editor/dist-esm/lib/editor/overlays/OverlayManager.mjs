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
class OverlayManager {
  constructor(editor) {
    this.editor = editor;
  }
  editor;
  /** @internal */
  _overlayUtils = /* @__PURE__ */ new Map();
  /**
   * Register an overlay util instance. Called during editor construction.
   * @internal
   */
  registerUtil(util) {
    const type = util.constructor.type;
    if (!type) {
      throw new Error(`Overlay util ${util.constructor.name} is missing a static 'type' property.`);
    }
    if (this._overlayUtils.has(type)) {
      throw new Error(`Duplicate overlay util type: "${type}"`);
    }
    this._overlayUtils.set(type, util);
  }
  dispose() {
    for (const util of this._overlayUtils.values()) {
      util.dispose();
    }
  }
  getOverlayUtil(arg) {
    const type = typeof arg === "string" ? arg : arg.type;
    const util = this._overlayUtils.get(type);
    if (!util) throw new Error(`No overlay util found for type: "${type}"`);
    return util;
  }
  getOverlayUtilsInZOrder() {
    const utils = Array.from(this._overlayUtils.values());
    return utils.map((util, i) => ({ util, i, z: util.options.zIndex ?? 0 })).sort((a, b) => a.z - b.z || a.i - b.i).map((entry) => entry.util);
  }
  getActiveOverlayEntries() {
    const entries = [];
    for (const util of this.getOverlayUtilsInZOrder()) {
      if (!util.isActive()) continue;
      entries.push({ util, overlays: util.getOverlays() });
    }
    return entries;
  }
  getCurrentOverlays() {
    const all = [];
    for (const { overlays } of this.getActiveOverlayEntries()) {
      all.push(...overlays);
    }
    return all;
  }
  // Hit-test geometry cache keyed by overlay identity. Entries remain valid
  // while getActiveOverlayEntries() keeps returning the same overlay
  // instances; when its reactive deps change, getOverlays() emits fresh
  // objects and stale entries fall out by GC.
  _geometryCache = /* @__PURE__ */ new WeakMap();
  /**
   * Get hit-test geometry for an overlay, cached by overlay identity. Lets
   * hit-testing on a pointermove storm skip the per-overlay geometry
   * allocation that {@link OverlayUtil.getGeometry} would otherwise do on
   * every call.
   *
   * @public
   */
  getOverlayGeometry(overlay) {
    const cached = this._geometryCache.get(overlay);
    if (cached !== void 0) return cached;
    const util = this.getOverlayUtil(overlay);
    const geometry = util.getGeometry(overlay);
    this._geometryCache.set(overlay, geometry);
    return geometry;
  }
  /**
   * The currently hovered overlay id.
   * @public
   */
  _hoveredOverlayId = atom("hoveredOverlayId", null);
  getHoveredOverlayId() {
    return this._hoveredOverlayId.get();
  }
  getHoveredOverlay() {
    const id = this._hoveredOverlayId.get();
    if (!id) return null;
    return this.getCurrentOverlays().find((o) => o.id === id) ?? null;
  }
  setHoveredOverlay(id) {
    if (id === this._hoveredOverlayId.get()) return;
    this._hoveredOverlayId.set(id);
  }
  /**
   * Hit test all active overlays at a given page point.
   * Returns the topmost overlay whose geometry contains the point, or null.
   * Utils are walked from highest zIndex to lowest so the overlay painted on
   * top also wins the hit test. Within a util, overlays are walked in
   * array order: the first overlay whose geometry contains the point wins,
   * so utils should place highest-priority overlays first in `getOverlays`.
   * Interactive overlays (those with geometry) are checked; non-interactive are skipped.
   *
   * @param point - Point in page coordinates
   * @param margin - Hit test margin
   * @public
   */
  getOverlayAtPoint(point, margin = 0) {
    const entries = this.getActiveOverlayEntries();
    for (let i = entries.length - 1; i >= 0; i--) {
      const { overlays } = entries[i];
      for (const overlay of overlays) {
        const geometry = this.getOverlayGeometry(overlay);
        if (!geometry) continue;
        if (geometry.hitTestPoint(point, geometry.isFilled ? 0 : margin, true)) {
          return overlay;
        }
      }
    }
    return null;
  }
}
__decorateClass([
  computed
], OverlayManager.prototype, "getOverlayUtilsInZOrder", 1);
__decorateClass([
  computed
], OverlayManager.prototype, "getActiveOverlayEntries", 1);
__decorateClass([
  computed
], OverlayManager.prototype, "getCurrentOverlays", 1);
export {
  OverlayManager
};
//# sourceMappingURL=OverlayManager.mjs.map
