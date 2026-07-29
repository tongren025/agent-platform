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
var strokeShapeIndicators_exports = {};
__export(strokeShapeIndicators_exports, {
  strokeShapeIndicators: () => strokeShapeIndicators
});
module.exports = __toCommonJS(strokeShapeIndicators_exports);
var import_store = require("@tldraw/store");
const indicatorPathCache = (0, import_store.createComputedCache)(
  "shapeIndicatorPath",
  (editor, shape) => {
    const util = editor.getShapeUtil(shape);
    return util.getIndicatorPath(shape);
  },
  {
    areRecordsEqual(a, b) {
      return a.props === b.props;
    }
  }
);
function strokeShapeIndicators(editor, ctx, shapeIds) {
  if (shapeIds.length === 0) return;
  const batched = new Path2D();
  for (const shapeId of shapeIds) {
    const shape = editor.getShape(shapeId);
    if (!shape || shape.isLocked) continue;
    const pageTransform = editor.getShapePageTransform(shape);
    if (!pageTransform) continue;
    const indicatorPath = indicatorPathCache.get(editor, shape.id);
    if (!indicatorPath) continue;
    if (indicatorPath instanceof Path2D) {
      batched.addPath(indicatorPath, pageTransform);
      continue;
    }
    const { path, clipPath, additionalPaths } = indicatorPath;
    if (!clipPath) {
      batched.addPath(path, pageTransform);
      if (additionalPaths) {
        for (const p of additionalPaths) batched.addPath(p, pageTransform);
      }
      continue;
    }
    ctx.save();
    ctx.transform(
      pageTransform.a,
      pageTransform.b,
      pageTransform.c,
      pageTransform.d,
      pageTransform.e,
      pageTransform.f
    );
    ctx.save();
    ctx.clip(clipPath, "evenodd");
    ctx.stroke(path);
    ctx.restore();
    if (additionalPaths) {
      for (const p of additionalPaths) ctx.stroke(p);
    }
    ctx.restore();
  }
  ctx.stroke(batched);
}
//# sourceMappingURL=strokeShapeIndicators.js.map
