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
var CanvasOverlays_exports = {};
__export(CanvasOverlays_exports, {
  CanvasOverlays: () => CanvasOverlays
});
module.exports = __toCommonJS(CanvasOverlays_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state = require("@tldraw/state");
var import_react = require("react");
var import_useEditor = require("../../hooks/useEditor");
var import_Group2d = require("../../primitives/geometry/Group2d");
var import_debug_flags = require("../../utils/debug-flags");
const CanvasOverlays = (0, import_react.memo)(function CanvasOverlays2() {
  const editor = (0, import_useEditor.useEditor)();
  const canvasRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const renderInputs$ = (0, import_state.computed)(
      "canvas overlays render inputs",
      () => {
        const instance = editor.getInstanceState();
        const camera = editor.getCamera();
        return {
          dpr: instance.devicePixelRatio,
          w: instance.screenBounds.w,
          h: instance.screenBounds.h,
          cx: camera.x,
          cy: camera.y,
          zoom: camera.z
        };
      },
      {
        isEqual: (a, b) => a.dpr === b.dpr && a.w === b.w && a.h === b.h && a.cx === b.cx && a.cy === b.cy && a.zoom === b.zoom
      }
    );
    const scheduler = new import_state.EffectScheduler("canvas overlays render", () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { dpr, w, h, cx, cy, zoom } = renderInputs$.get();
      const canvasWidth = Math.ceil(w * dpr);
      const canvasHeight = Math.ceil(h * dpr);
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const s = dpr * zoom;
      ctx.setTransform(s, 0, 0, s, s * cx, s * cy);
      for (const { util, overlays } of editor.overlays.getActiveOverlayEntries()) {
        ctx.save();
        util.render(ctx, overlays);
        ctx.restore();
      }
      if (import_debug_flags.debugFlags.debugGeometry.get()) {
        const currentPagePoint = editor.inputs.getCurrentPagePoint();
        const renderingShapes = editor.getRenderingShapes();
        for (const result of renderingShapes) {
          const shape = editor.getShape(result.id);
          if (!shape || shape.type === "group") continue;
          const geometry = editor.getShapeGeometry(shape);
          const pageTransform = editor.getShapePageTransform(shape);
          if (!pageTransform) continue;
          ctx.save();
          const m = pageTransform;
          ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
          ctx.strokeStyle = geometry.debugColor ?? "red";
          ctx.lineWidth = 2 / zoom;
          ctx.fillStyle = "none";
          drawGeometryStroke(ctx, geometry);
          const { vertices } = geometry;
          for (let i = 0; i < vertices.length; i++) {
            const v = vertices[i];
            const hue = vertices.length > 1 ? 120 + (200 - 120) * i / (vertices.length - 1) : 160;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2 / zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          const pointInShapeSpace = editor.getPointInShapeSpace(shape, currentPagePoint);
          const dist = Math.abs(geometry.distanceToPoint(pointInShapeSpace, true)) * zoom;
          if (dist < 150) {
            const nearestPoint = geometry.nearestPoint(pointInShapeSpace);
            const hitInside = geometry.distanceToPoint(pointInShapeSpace, true) < 0;
            ctx.strokeStyle = hitInside ? "goldenrod" : "dodgerblue";
            ctx.lineWidth = 2 / zoom;
            ctx.globalAlpha = 1 - dist / 150;
            ctx.beginPath();
            ctx.moveTo(nearestPoint.x, nearestPoint.y);
            ctx.lineTo(pointInShapeSpace.x, pointInShapeSpace.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = "magenta";
        ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
        ctx.lineWidth = 1 / zoom;
        for (const { overlays } of editor.overlays.getActiveOverlayEntries()) {
          for (const overlay of overlays) {
            const geometry = editor.overlays.getOverlayGeometry(overlay);
            if (!geometry) continue;
            const vertices = geometry.vertices;
            if (vertices.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            if (geometry.isClosed) {
              ctx.closePath();
              ctx.fill();
            }
            ctx.stroke();
            for (const v of vertices) {
              ctx.beginPath();
              ctx.arc(v.x, v.y, 2 / zoom, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.restore();
      }
    });
    scheduler.attach();
    scheduler.execute();
    return () => scheduler.detach();
  }, [editor]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, className: "tl-canvas-overlays" });
});
function drawGeometryStroke(ctx, geometry) {
  if (geometry instanceof import_Group2d.Group2d) {
    const prevStroke = ctx.strokeStyle;
    for (const child of geometry.children) {
      if (child.debugColor) ctx.strokeStyle = child.debugColor;
      drawGeometryStroke(ctx, child);
      ctx.strokeStyle = prevStroke;
    }
    for (const child of geometry.ignoredChildren) {
      if (child.debugColor) ctx.strokeStyle = child.debugColor;
      drawGeometryStroke(ctx, child);
      ctx.strokeStyle = prevStroke;
    }
    return;
  }
  const vertices = geometry.vertices;
  if (vertices.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  if (geometry.isClosed) ctx.closePath();
  ctx.stroke();
}
//# sourceMappingURL=CanvasOverlays.js.map
