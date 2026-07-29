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
var DefaultCanvas_exports = {};
__export(DefaultCanvas_exports, {
  DefaultCanvas: () => DefaultCanvas
});
module.exports = __toCommonJS(DefaultCanvas_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state = require("@tldraw/state");
var import_state_react = require("@tldraw/state-react");
var import_utils = require("@tldraw/utils");
var import_classnames = __toESM(require("classnames"), 1);
var import_react = require("react");
var import_environment = require("../../globals/environment");
var import_EditorComponentsContext = require("../../hooks/EditorComponentsContext");
var import_useCanvasEvents = require("../../hooks/useCanvasEvents");
var import_useCoarsePointer = require("../../hooks/useCoarsePointer");
var import_useContainer = require("../../hooks/useContainer");
var import_useDocumentEvents = require("../../hooks/useDocumentEvents");
var import_useEditor = require("../../hooks/useEditor");
var import_useFixSafariDoubleTapZoomPencilEvents = require("../../hooks/useFixSafariDoubleTapZoomPencilEvents");
var import_useGestureEvents = require("../../hooks/useGestureEvents");
var import_useScreenBounds = require("../../hooks/useScreenBounds");
var import_useShapeCulling = require("../../hooks/useShapeCulling");
var import_utils2 = require("../../primitives/utils");
var import_debug_flags = require("../../utils/debug-flags");
var import_dom = require("../../utils/dom");
var import_MenuClickCapture = require("../MenuClickCapture");
var import_Shape = require("../Shape");
var import_CanvasOverlays = require("./CanvasOverlays");
function DefaultCanvas({ className }) {
  const editor = (0, import_useEditor.useEditor)();
  const { Background, SvgDefs } = (0, import_EditorComponentsContext.useEditorComponents)();
  const rCanvas = (0, import_react.useRef)(null);
  const rHtmlLayer = (0, import_react.useRef)(null);
  const container = (0, import_useContainer.useContainer)();
  (0, import_useScreenBounds.useScreenBounds)(rCanvas);
  (0, import_useDocumentEvents.useDocumentEvents)();
  (0, import_useCoarsePointer.useCoarsePointer)();
  (0, import_useGestureEvents.useGestureEvents)(rCanvas);
  (0, import_useFixSafariDoubleTapZoomPencilEvents.useFixSafariDoubleTapZoomPencilEvents)(rCanvas);
  (0, import_state_react.useQuickReactor)(
    "update canvas state data attributes",
    () => {
      const canvas = rCanvas.current;
      if (!canvas) return;
      canvas.setAttribute(
        "data-iseditinganything",
        editor.getEditingShapeId() === null ? "false" : "true"
      );
      canvas.setAttribute(
        "data-isselectinganything",
        editor.getSelectedShapeIds().length === 0 ? "false" : "true"
      );
    },
    [editor]
  );
  const rMemoizedStuff = (0, import_react.useRef)({ lodDisableTextOutline: false, canUpdateTextOutline: true });
  (0, import_state_react.useQuickReactor)(
    "set text outline",
    function setTextOutline() {
      if (rMemoizedStuff.current.canUpdateTextOutline) {
        if (import_environment.tlenv.isSafari) {
          container.style.setProperty("--tl-text-outline", "none");
          rMemoizedStuff.current.canUpdateTextOutline = false;
        } else {
          const efficientZoom = editor.getEfficientZoomLevel();
          const lodDisableTextOutline = efficientZoom < editor.options.textShadowLod;
          if (lodDisableTextOutline !== rMemoizedStuff.current.lodDisableTextOutline) {
            container.style.setProperty(
              "--tl-text-outline",
              lodDisableTextOutline ? "none" : `var(--tl-text-outline-reference)`
            );
          }
          rMemoizedStuff.current.lodDisableTextOutline = lodDisableTextOutline;
        }
      }
    },
    [editor, container]
  );
  (0, import_state_react.useQuickReactor)(
    "position layers",
    function positionLayersWhenCameraMoves() {
      const { x, y, z } = editor.getCamera();
      const offset = z >= 1 ? (0, import_utils.modulate)(z, [1, 8], [0.125, 0.5], true) : (0, import_utils.modulate)(z, [0.1, 1], [-2, 0.125], true);
      (0, import_dom.setStyleProperty)(
        rHtmlLayer.current,
        "transform",
        `scale(${(0, import_utils2.toDomPrecision)(z)}) translate(${(0, import_utils2.toDomPrecision)(
          x + offset
        )}px,${(0, import_utils2.toDomPrecision)(y + offset)}px)`
      );
    },
    [editor, container]
  );
  const events = (0, import_useCanvasEvents.useCanvasEvents)();
  const shapeSvgDefs = (0, import_state_react.useValue)(
    "shapeSvgDefs",
    () => {
      const shapeSvgDefsByKey = /* @__PURE__ */ new Map();
      for (const util of (0, import_utils.objectMapValues)(editor.shapeUtils)) {
        if (!util) return;
        const defs = util.getCanvasSvgDefs();
        for (const { key, component: Component } of defs) {
          if (shapeSvgDefsByKey.has(key)) continue;
          shapeSvgDefsByKey.set(key, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {}, key));
        }
      }
      return [...shapeSvgDefsByKey.values()];
    },
    [editor]
  );
  const hideShapes = (0, import_state_react.useValue)("debug_shapes", () => import_debug_flags.debugFlags.hideShapes.get(), [import_debug_flags.debugFlags]);
  const isGridMode = (0, import_state_react.useValue)("isGridMode", () => editor.getInstanceState().isGridMode, [editor]);
  const { Grid } = (0, import_EditorComponentsContext.useEditorComponents)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        ref: rCanvas,
        draggable: false,
        className: (0, import_classnames.default)("tl-canvas", className),
        "data-testid": "canvas",
        ...events,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { className: "tl-svg-context", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
            shapeSvgDefs,
            SvgDefs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvgDefs, {})
          ] }) }),
          Background && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tl-background__wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Background, {}) }),
          isGridMode && Grid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridWrapper, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: rHtmlLayer, className: "tl-html-layer tl-shapes", draggable: false, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnTheCanvasWrapper, {}),
            hideShapes ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapesLayer, { canvasRef: rCanvas })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_CanvasOverlays.CanvasOverlays, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovingCameraHitTestBlocker, {})
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InFrontOfTheCanvasWrapper, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_MenuClickCapture.MenuClickCapture, {})
  ] });
}
function InFrontOfTheCanvasWrapper() {
  const editor = (0, import_useEditor.useEditor)();
  const { InFrontOfTheCanvas } = (0, import_EditorComponentsContext.useEditorComponents)();
  if (!InFrontOfTheCanvas) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "tl-canvas__in-front",
      onPointerDown: editor.markEventAsHandled,
      onPointerUp: editor.markEventAsHandled,
      onTouchStart: editor.markEventAsHandled,
      onTouchEnd: editor.markEventAsHandled,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InFrontOfTheCanvas, {})
    }
  );
}
function GridWrapper() {
  const editor = (0, import_useEditor.useEditor)();
  const gridSize = (0, import_state_react.useValue)("gridSize", () => editor.getDocumentSettings().gridSize, [editor]);
  const { x, y, z } = (0, import_state_react.useValue)("camera", () => editor.getCamera(), [editor]);
  const { Grid } = (0, import_EditorComponentsContext.useEditorComponents)();
  if (!Grid) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { x, y, z, size: gridSize });
}
function ShapesLayer({ canvasRef }) {
  const editor = (0, import_useEditor.useEditor)();
  const debugSvg = (0, import_state_react.useValue)("debug svg", () => import_debug_flags.debugFlags.debugSvg.get(), [import_debug_flags.debugFlags]);
  const renderingShapes = (0, import_state_react.useValue)("rendering shapes", () => editor.getRenderingShapes(), [editor]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_useShapeCulling.ShapeCullingProvider, { children: [
    renderingShapes.map(
      (result) => debugSvg ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_Shape.Shape, { ...result }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebugSvgCopy, { id: result.id, mode: "iframe" })
      ] }, result.id + "_fragment") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_Shape.Shape, { ...result }, result.id + "_shape")
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CullingController, {}),
    import_environment.tlenv.isSafari && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReflowIfNeeded, { canvasRef })
  ] });
}
function ReflowIfNeeded({ canvasRef }) {
  const editor = (0, import_useEditor.useEditor)();
  const culledShapesRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
  (0, import_state_react.useQuickReactor)(
    "reflow for culled shapes",
    () => {
      const culledShapes = editor.getCulledShapes();
      if (culledShapesRef.current === culledShapes) return;
      culledShapesRef.current = culledShapes;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const _height = canvas.offsetHeight;
    },
    [editor, canvasRef]
  );
  return null;
}
function CullingController() {
  const editor = (0, import_useEditor.useEditor)();
  const { updateCulling } = (0, import_useShapeCulling.useShapeCulling)();
  (0, import_state_react.useQuickReactor)(
    "update shape culling",
    () => {
      const culledShapes = editor.getCulledShapes();
      updateCulling(culledShapes);
    },
    [editor, updateCulling]
  );
  return null;
}
function DebugSvgCopy({ id, mode }) {
  const editor = (0, import_useEditor.useEditor)();
  const [image, setImage] = (0, import_react.useState)(null);
  const isInRoot = (0, import_state_react.useValue)(
    "is in root",
    () => {
      const shape = editor.getShape(id);
      return shape?.parentId === editor.getCurrentPageId();
    },
    [editor, id]
  );
  (0, import_react.useEffect)(() => {
    if (!isInRoot) return;
    let latest = null;
    const unsubscribe = (0, import_state.react)("shape to svg", async () => {
      const renderId = Math.random();
      latest = renderId;
      const shape = editor.getShape(id);
      const isSingleFrame = !!shape && editor.isShapeFrameLike(shape);
      const padding = isSingleFrame ? 0 : 10;
      let bounds = editor.getShapePageBounds(id);
      if (!bounds) return;
      bounds = bounds.clone().expandBy(padding);
      const result = await editor.getSvgString([id], { padding });
      if (latest !== renderId || !result) return;
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(result.svg)}`;
      setImage({ src: svgDataUrl, bounds });
    });
    return () => {
      latest = null;
      unsubscribe();
    };
  }, [editor, id, isInRoot]);
  if (!isInRoot || !image) return null;
  if (mode === "iframe") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "iframe",
      {
        src: image.src,
        width: image.bounds.width,
        height: image.bounds.height,
        referrerPolicy: "no-referrer",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          border: "none",
          transform: `translate(${image.bounds.x}px, ${image.bounds.maxY + 12}px)`,
          outline: "1px solid black",
          maxWidth: "none"
        }
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "img",
    {
      src: image.src,
      width: image.bounds.width,
      height: image.bounds.height,
      referrerPolicy: "no-referrer",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${image.bounds.x}px, ${image.bounds.maxY + 12}px)`,
        outline: "1px solid black",
        maxWidth: "none"
      }
    }
  );
}
function OnTheCanvasWrapper() {
  const { OnTheCanvas } = (0, import_EditorComponentsContext.useEditorComponents)();
  if (!OnTheCanvas) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnTheCanvas, {});
}
function MovingCameraHitTestBlocker() {
  const editor = (0, import_useEditor.useEditor)();
  const cameraState = (0, import_state_react.useValue)("camera state", () => editor.getCameraState(), [editor]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: (0, import_classnames.default)("tl-hit-test-blocker", {
        "tl-hit-test-blocker__hidden": cameraState === "idle"
      })
    }
  );
}
//# sourceMappingURL=DefaultCanvas.js.map
