import { createComputedCache } from "@tldraw/store";
const indicatorPathCache = createComputedCache(
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
export {
  strokeShapeIndicators
};
//# sourceMappingURL=strokeShapeIndicators.mjs.map
