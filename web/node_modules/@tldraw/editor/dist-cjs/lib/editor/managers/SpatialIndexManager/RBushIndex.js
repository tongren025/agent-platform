"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var RBushIndex_exports = {};
__export(RBushIndex_exports, {
  RBushIndex: () => RBushIndex
});
module.exports = __toCommonJS(RBushIndex_exports);
var import_rbush = __toESM(require("rbush"), 1);
class TldrawRBush extends import_rbush.default {
}
class RBushIndex {
  rBush;
  elementsInTree;
  constructor() {
    this.rBush = new TldrawRBush();
    this.elementsInTree = /* @__PURE__ */ new Map();
  }
  /**
   * Search for shapes within the given bounds.
   * Returns set of shape IDs that intersect with the bounds.
   */
  search(bounds) {
    const results = this.rBush.search({
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY
    });
    return new Set(results.map((e) => e.id));
  }
  /**
   * Insert or update a shape in the spatial index.
   * If the shape already exists, it will be removed first to prevent duplicates.
   */
  upsert(id, bounds) {
    const existing = this.elementsInTree.get(id);
    if (existing) {
      this.rBush.remove(existing);
    }
    const element = {
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY,
      id
    };
    this.rBush.insert(element);
    this.elementsInTree.set(id, element);
  }
  /**
   * Remove a shape from the spatial index.
   */
  remove(id) {
    const element = this.elementsInTree.get(id);
    if (element) {
      this.rBush.remove(element);
      this.elementsInTree.delete(id);
    }
  }
  /**
   * Bulk load elements into the spatial index.
   * More efficient than individual inserts for initial loading.
   */
  bulkLoad(elements) {
    this.rBush.load(elements);
    for (const element of elements) {
      this.elementsInTree.set(element.id, element);
    }
  }
  /**
   * Clear all elements from the spatial index.
   */
  clear() {
    this.rBush.clear();
    this.elementsInTree.clear();
  }
  /**
   * Check if a shape is in the spatial index.
   */
  has(id) {
    return this.elementsInTree.has(id);
  }
  /**
   * Get the number of elements in the spatial index.
   */
  getSize() {
    return this.elementsInTree.size;
  }
  /**
   * Get the raw stored element for a shape, without allocating a Box.
   * Use when you only need to read the indexed bounds for comparison.
   *
   * @internal
   */
  getElement(id) {
    return this.elementsInTree.get(id);
  }
  /**
   * Iterate the entries currently in the index. Callers may upsert existing
   * keys or remove keys during iteration; current callers do not insert new
   * keys.
   *
   * @internal
   */
  entries() {
    return this.elementsInTree.entries();
  }
  /**
   * Dispose of the spatial index.
   * Clears all data structures to prevent memory leaks.
   */
  dispose() {
    this.clear();
  }
}
//# sourceMappingURL=RBushIndex.js.map
