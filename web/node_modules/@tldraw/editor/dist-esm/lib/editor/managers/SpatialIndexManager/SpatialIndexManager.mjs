import { RESET_VALUE, computed, isUninitialized } from "@tldraw/state";
import { isShape } from "@tldraw/tlschema";
import { objectMapValues } from "@tldraw/utils";
import { Box } from "../../../primitives/Box.mjs";
import { RBushIndex } from "./RBushIndex.mjs";
class SpatialIndexManager {
  constructor(editor) {
    this.editor = editor;
    this.rbush = new RBushIndex();
    this.spatialIndexComputed = this.createSpatialIndexComputed();
  }
  editor;
  rbush;
  spatialIndexComputed;
  lastPageId = null;
  // Bumps only when the rbush content may have changed. Consumers subscribe
  // via the computed; a stable epoch lets prop-only diffs skip downstream
  // invalidations.
  _boundsEpoch = 0;
  rebuildAndBumpEpoch() {
    this.buildFromScratch();
    this._boundsEpoch++;
    return this._boundsEpoch;
  }
  createSpatialIndexComputed() {
    const shapeHistory = this.editor.store.query.filterHistory("shape");
    const bindingHistory = this.editor.store.query.filterHistory("binding");
    return computed("spatialIndex", (_prevValue, lastComputedEpoch) => {
      if (isUninitialized(_prevValue)) {
        return this.rebuildAndBumpEpoch();
      }
      const shapeDiff = shapeHistory.getDiffSince(lastComputedEpoch);
      const bindingDiff = bindingHistory.getDiffSince(lastComputedEpoch);
      if (shapeDiff === RESET_VALUE || bindingDiff === RESET_VALUE) {
        return this.rebuildAndBumpEpoch();
      }
      const currentPageId = this.editor.getCurrentPageId();
      if (this.lastPageId !== currentPageId) {
        return this.rebuildAndBumpEpoch();
      }
      if (shapeDiff.length === 0 && bindingDiff.length === 0) return this._boundsEpoch;
      if (this.processIncrementalUpdate(shapeDiff)) {
        this._boundsEpoch++;
      }
      return this._boundsEpoch;
    });
  }
  buildFromScratch() {
    this.rbush.clear();
    this.lastPageId = this.editor.getCurrentPageId();
    const elements = [];
    for (const shape of this.editor.getCurrentPageShapes()) {
      const bounds = this.editor.getShapePageBounds(shape.id);
      if (bounds && bounds.isValid()) {
        elements.push({
          minX: bounds.minX,
          minY: bounds.minY,
          maxX: bounds.maxX,
          maxY: bounds.maxY,
          id: shape.id
        });
      }
    }
    this.rbush.bulkLoad(elements);
  }
  processIncrementalUpdate(shapeDiff) {
    const processedShapeIds = /* @__PURE__ */ new Set();
    let changed = false;
    for (const changes of shapeDiff) {
      for (const shape of objectMapValues(changes.added)) {
        if (isShape(shape) && this.editor.getAncestorPageId(shape) === this.lastPageId) {
          const bounds = this.editor.getShapePageBounds(shape.id);
          if (bounds && bounds.isValid()) {
            this.rbush.upsert(shape.id, bounds);
            changed = true;
          }
          processedShapeIds.add(shape.id);
        }
      }
      for (const shape of objectMapValues(changes.removed)) {
        if (isShape(shape)) {
          if (this.rbush.has(shape.id)) {
            this.rbush.remove(shape.id);
            changed = true;
          }
          processedShapeIds.add(shape.id);
        }
      }
      for (const [, to] of objectMapValues(changes.updated)) {
        if (!isShape(to)) continue;
        processedShapeIds.add(to.id);
        const isOnPage = this.editor.getAncestorPageId(to) === this.lastPageId;
        if (isOnPage) {
          const bounds = this.editor.getShapePageBounds(to.id);
          if (bounds && bounds.isValid()) {
            const indexedElement = this.rbush.getElement(to.id);
            if (!this.areBoundsEqualToSpatialElement(bounds, indexedElement)) {
              this.rbush.upsert(to.id, bounds);
              changed = true;
            }
          } else if (this.rbush.has(to.id)) {
            this.rbush.remove(to.id);
            changed = true;
          }
        } else if (this.rbush.has(to.id)) {
          this.rbush.remove(to.id);
          changed = true;
        }
      }
    }
    for (const [shapeId, indexedElement] of this.rbush.entries()) {
      if (processedShapeIds.has(shapeId)) continue;
      const currentBounds = this.editor.getShapePageBounds(shapeId);
      if (this.areBoundsEqualToSpatialElement(currentBounds, indexedElement)) continue;
      if (currentBounds && currentBounds.isValid()) {
        this.rbush.upsert(shapeId, currentBounds);
      } else {
        this.rbush.remove(shapeId);
      }
      changed = true;
    }
    return changed;
  }
  areBoundsEqualToSpatialElement(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.minX === b.minX && a.minY === b.minY && a.maxX === b.maxX && a.maxY === b.maxY;
  }
  /**
   * Get shape IDs within the given bounds.
   * Optimized for viewport culling queries.
   *
   * Note: Results are unordered. If you need z-order, combine with sorted shapes:
   * ```ts
   * const candidates = editor.spatialIndex.getShapeIdsInsideBounds(bounds)
   * const sorted = editor.getCurrentPageShapesSorted().filter(s => candidates.has(s.id))
   * ```
   *
   * @param bounds - The bounds to search within
   * @returns Unordered set of shape IDs within the bounds
   *
   * @public
   */
  getShapeIdsInsideBounds(bounds) {
    this.spatialIndexComputed.get();
    return this.rbush.search(bounds);
  }
  /**
   * Get shape IDs at a point (with optional margin).
   * Creates a small bounding box around the point and searches the spatial index.
   *
   * Note: Results are unordered. If you need z-order, combine with sorted shapes:
   * ```ts
   * const candidates = editor.spatialIndex.getShapeIdsAtPoint(point, margin)
   * const sorted = editor.getCurrentPageShapesSorted().filter(s => candidates.has(s.id))
   * ```
   *
   * @param point - The point to search at
   * @param margin - The margin around the point to search (default: 0)
   * @returns Unordered set of shape IDs that could potentially contain the point
   *
   * @public
   */
  getShapeIdsAtPoint(point, margin = 0) {
    this.spatialIndexComputed.get();
    return this.rbush.search(new Box(point.x - margin, point.y - margin, margin * 2, margin * 2));
  }
  /**
   * Dispose of the spatial index manager.
   * Clears the R-tree to prevent memory leaks.
   *
   * @public
   */
  dispose() {
    this.rbush.dispose();
    this.lastPageId = null;
  }
}
export {
  SpatialIndexManager
};
//# sourceMappingURL=SpatialIndexManager.mjs.map
