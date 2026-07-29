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
var HandleSnaps_exports = {};
__export(HandleSnaps_exports, {
  HandleSnaps: () => HandleSnaps
});
module.exports = __toCommonJS(HandleSnaps_exports);
var import_state = require("@tldraw/state");
var import_utils = require("@tldraw/utils");
var import_Vec = require("../../../primitives/Vec");
const defaultGetSelfSnapOutline = () => null;
const defaultGetSelfSnapPoints = () => [];
class HandleSnaps {
  constructor(manager) {
    this.manager = manager;
    this.editor = manager.editor;
  }
  manager;
  editor;
  getSnapGeometryCache() {
    const { editor } = this;
    return editor.store.createComputedCache("handle snap geometry", (shape) => {
      const snapGeometry = editor.getShapeUtil(shape).getHandleSnapGeometry(shape);
      const getSelfSnapOutline = snapGeometry.getSelfSnapOutline ? snapGeometry.getSelfSnapOutline.bind(snapGeometry) : defaultGetSelfSnapOutline;
      const getSelfSnapPoints = snapGeometry.getSelfSnapPoints ? snapGeometry.getSelfSnapPoints.bind(snapGeometry) : defaultGetSelfSnapPoints;
      return {
        outline: snapGeometry.outline === void 0 ? editor.getShapeGeometry(shape) : snapGeometry.outline,
        points: snapGeometry.points ?? [],
        getSelfSnapOutline,
        getSelfSnapPoints
      };
    });
  }
  *iterateSnapPointsInPageSpace(currentShapeId, currentHandle) {
    const selfSnapPoints = this.getSnapGeometryCache().get(currentShapeId)?.getSelfSnapPoints(currentHandle);
    if (selfSnapPoints && selfSnapPoints.length) {
      const shapePageTransform = (0, import_utils.assertExists)(this.editor.getShapePageTransform(currentShapeId));
      for (const point of selfSnapPoints) {
        yield shapePageTransform.applyToPoint(point);
      }
    }
    for (const shapeId of this.manager.getSnappableShapes()) {
      if (shapeId === currentShapeId) continue;
      const snapPoints = this.getSnapGeometryCache().get(shapeId)?.points;
      if (!snapPoints || !snapPoints.length) continue;
      const shapePageTransform = (0, import_utils.assertExists)(this.editor.getShapePageTransform(shapeId));
      for (const point of snapPoints) {
        yield shapePageTransform.applyToPoint(point);
      }
    }
  }
  *iterateSnapOutlines(currentShapeId, currentHandle) {
    const selfSnapOutline = this.getSnapGeometryCache().get(currentShapeId)?.getSelfSnapOutline(currentHandle);
    if (selfSnapOutline) {
      yield { shapeId: currentShapeId, outline: selfSnapOutline };
    }
    for (const shapeId of this.manager.getSnappableShapes()) {
      if (shapeId === currentShapeId) continue;
      const snapOutline = this.getSnapGeometryCache().get(shapeId)?.outline;
      if (!snapOutline) continue;
      yield { shapeId, outline: snapOutline };
    }
  }
  getHandleSnapPosition({
    currentShapeId,
    handle,
    handleInPageSpace
  }) {
    const snapThreshold = this.manager.getSnapThreshold();
    let minDistanceForSnapPoint = snapThreshold;
    let nearestSnapPoint = null;
    for (const snapPoint of this.iterateSnapPointsInPageSpace(currentShapeId, handle)) {
      if (import_Vec.Vec.DistMin(handleInPageSpace, snapPoint, minDistanceForSnapPoint)) {
        minDistanceForSnapPoint = import_Vec.Vec.Dist(handleInPageSpace, snapPoint);
        nearestSnapPoint = snapPoint;
      }
    }
    if (nearestSnapPoint) return nearestSnapPoint;
    let minDistanceForOutline = snapThreshold;
    let nearestPointOnOutline = null;
    for (const { shapeId, outline } of this.iterateSnapOutlines(currentShapeId, handle)) {
      const shapePageTransform = (0, import_utils.assertExists)(this.editor.getShapePageTransform(shapeId));
      const pointInShapeSpace = this.editor.getPointInShapeSpace(shapeId, handleInPageSpace);
      const nearestShapePointInShapeSpace = outline.nearestPoint(pointInShapeSpace);
      const nearestInPageSpace = shapePageTransform.applyToPoint(nearestShapePointInShapeSpace);
      if (import_Vec.Vec.DistMin(handleInPageSpace, nearestInPageSpace, minDistanceForOutline)) {
        minDistanceForOutline = import_Vec.Vec.Dist(handleInPageSpace, nearestInPageSpace);
        nearestPointOnOutline = nearestInPageSpace;
      }
    }
    if (nearestPointOnOutline) return nearestPointOnOutline;
    return null;
  }
  getHandleSnapData({
    handle,
    currentShapeId
  }) {
    const snapThreshold = this.manager.getSnapThreshold();
    const currentShapeTransform = (0, import_utils.assertExists)(this.editor.getShapePageTransform(currentShapeId));
    const handleInPageSpace = currentShapeTransform.applyToPoint(handle);
    let nearestXSnap = null;
    let nearestYSnap = null;
    let minOffsetX = snapThreshold;
    let minOffsetY = snapThreshold;
    for (const snapPoint of this.iterateSnapPointsInPageSpace(currentShapeId, handle)) {
      const offsetX = Math.abs(handleInPageSpace.x - snapPoint.x);
      const offsetY = Math.abs(handleInPageSpace.y - snapPoint.y);
      if (offsetX < minOffsetX) {
        minOffsetX = offsetX;
        nearestXSnap = snapPoint;
      }
      if (offsetY < minOffsetY) {
        minOffsetY = offsetY;
        nearestYSnap = snapPoint;
      }
    }
    if (!nearestXSnap && !nearestYSnap) {
      return null;
    }
    const nudge = new import_Vec.Vec(
      nearestXSnap ? nearestXSnap.x - handleInPageSpace.x : 0,
      nearestYSnap ? nearestYSnap.y - handleInPageSpace.y : 0
    );
    const snappedHandle = import_Vec.Vec.Add(handleInPageSpace, nudge);
    const snaps = [];
    if (nearestXSnap) {
      const snappedHandleOnX = new import_Vec.Vec(nearestXSnap.x, snappedHandle.y);
      snaps.push({
        id: (0, import_utils.uniqueId)(),
        type: "points",
        points: [nearestXSnap, snappedHandleOnX]
      });
    }
    if (nearestYSnap) {
      const snappedHandleOnY = new import_Vec.Vec(snappedHandle.x, nearestYSnap.y);
      snaps.push({
        id: (0, import_utils.uniqueId)(),
        type: "points",
        points: [nearestYSnap, snappedHandleOnY]
      });
    }
    return { snaps, nudge };
  }
  snapHandle({
    currentShapeId,
    handle
  }) {
    const currentShapeTransform = (0, import_utils.assertExists)(this.editor.getShapePageTransform(currentShapeId));
    const handleInPageSpace = currentShapeTransform.applyToPoint(handle);
    const snapType = handle.canSnap ? "point" : handle.snapType;
    if (snapType === "point") {
      const snapPosition = this.getHandleSnapPosition({ currentShapeId, handle, handleInPageSpace });
      if (!snapPosition) {
        return null;
      }
      this.manager.setIndicators([
        {
          id: (0, import_utils.uniqueId)(),
          type: "points",
          points: [snapPosition]
        }
      ]);
      return { nudge: import_Vec.Vec.Sub(snapPosition, handleInPageSpace) };
    }
    if (snapType === "align") {
      const snapData = this.getHandleSnapData({
        handle,
        currentShapeId
      });
      if (!snapData) {
        return null;
      }
      this.manager.setIndicators(snapData.snaps);
      return { nudge: snapData.nudge };
    }
    return null;
  }
}
__decorateClass([
  import_state.computed
], HandleSnaps.prototype, "getSnapGeometryCache", 1);
//# sourceMappingURL=HandleSnaps.js.map
