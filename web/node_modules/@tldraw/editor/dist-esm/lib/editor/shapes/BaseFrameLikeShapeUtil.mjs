import { compact } from "@tldraw/utils";
import { BaseBoxShapeUtil } from "./BaseBoxShapeUtil.mjs";
class BaseFrameLikeShapeUtil extends BaseBoxShapeUtil {
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
      const currentChildren = compact(
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
export {
  BaseFrameLikeShapeUtil
};
//# sourceMappingURL=BaseFrameLikeShapeUtil.mjs.map
