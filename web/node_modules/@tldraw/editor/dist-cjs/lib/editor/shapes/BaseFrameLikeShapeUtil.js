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
var BaseFrameLikeShapeUtil_exports = {};
__export(BaseFrameLikeShapeUtil_exports, {
  BaseFrameLikeShapeUtil: () => BaseFrameLikeShapeUtil
});
module.exports = __toCommonJS(BaseFrameLikeShapeUtil_exports);
var import_utils = require("@tldraw/utils");
var import_BaseBoxShapeUtil = require("./BaseBoxShapeUtil");
class BaseFrameLikeShapeUtil extends import_BaseBoxShapeUtil.BaseBoxShapeUtil {
  isFrameLike(_shape) {
    return true;
  }
  providesBackgroundForChildren() {
    return true;
  }
  canReceiveNewChildrenOfType(shape, _type) {
    return !shape.isLocked;
  }
  canRemoveChildrenOfType(shape, _type) {
    return !shape.isLocked;
  }
  getClipPath(shape) {
    return this.editor.getShapeGeometry(shape.id).vertices;
  }
  onDragShapesIn(shape, draggingShapes, { initialParentIds, initialIndices }) {
    const { editor } = this;
    if (draggingShapes.every((s) => s.parentId === shape.id)) return;
    let canRestoreOriginalIndices = false;
    const previousChildren = draggingShapes.filter(
      (s) => shape.id === initialParentIds.get(s.id)
    );
    if (previousChildren.length > 0) {
      const currentChildren = (0, import_utils.compact)(
        editor.getSortedChildIdsForParent(shape).map((id) => editor.getShape(id))
      );
      if (previousChildren.every((s) => !currentChildren.find((c) => c.index === s.index))) {
        canRestoreOriginalIndices = true;
      }
    }
    if (draggingShapes.some((s) => editor.hasAncestor(shape, s.id))) return;
    editor.reparentShapes(draggingShapes, shape.id);
    if (canRestoreOriginalIndices) {
      for (const s of previousChildren) {
        editor.updateShape({
          id: s.id,
          type: s.type,
          index: initialIndices.get(s.id)
        });
      }
    }
  }
  onDragShapesOut(shape, draggingShapes, info) {
    const { editor } = this;
    if (!info.nextDraggingOverShapeId) {
      editor.reparentShapes(
        draggingShapes.filter((s) => s.parentId === shape.id),
        editor.getCurrentPageId()
      );
    }
  }
}
//# sourceMappingURL=BaseFrameLikeShapeUtil.js.map
