import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { react } from "@tldraw/state";
import { useQuickReactor, useValue } from "@tldraw/state-react";
import { modulate, objectMapValues } from "@tldraw/utils";
import classNames from "classnames";
import { Fragment as Fragment2, useEffect, useRef, useState } from "react";
import { tlenv } from "../../globals/environment.mjs";
import { useEditorComponents } from "../../hooks/EditorComponentsContext.mjs";
import { useCanvasEvents } from "../../hooks/useCanvasEvents.mjs";
import { useCoarsePointer } from "../../hooks/useCoarsePointer.mjs";
import { useContainer } from "../../hooks/useContainer.mjs";
import { useDocumentEvents } from "../../hooks/useDocumentEvents.mjs";
import { useEditor } from "../../hooks/useEditor.mjs";
import { useFixSafariDoubleTapZoomPencilEvents } from "../../hooks/useFixSafariDoubleTapZoomPencilEvents.mjs";
import { useGestureEvents } from "../../hooks/useGestureEvents.mjs";
import { useScreenBounds } from "../../hooks/useScreenBounds.mjs";
import { ShapeCullingProvider, useShapeCulling } from "../../hooks/useShapeCulling.mjs";
import { toDomPrecision } from "../../primitives/utils.mjs";
import { debugFlags } from "../../utils/debug-flags.mjs";
import { setStyleProperty } from "../../utils/dom.mjs";
import { MenuClickCapture } from "../MenuClickCapture.mjs";
import { Shape } from "../Shape.mjs";
import { CanvasOverlays } from "./CanvasOverlays.mjs";
function DefaultCanvas({ className }) {
  const editor = useEditor();
  const { Background, SvgDefs } = useEditorComponents();
  const rCanvas = useRef(null);
  const rHtmlLayer = useRef(null);
  const container = useContainer();
  useScreenBounds(rCanvas);
  useDocumentEvents();
  useCoarsePointer();
  useGestureEvents(rCanvas);
  useFixSafariDoubleTapZoomPencilEvents(rCanvas);
  useQuickReactor(
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
  const rMemoizedStuff = useRef({ lodDisableTextOutline: false, canUpdateTextOutline: true });
  useQuickReactor(
    "set text outline",
    function setTextOutline() {
      if (rMemoizedStuff.current.canUpdateTextOutline) {
        if (tlenv.isSafari) {
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
  useQuickReactor(
    "position layers",
    function positionLayersWhenCameraMoves() {
      const { x, y, z } = editor.getCamera();
      const offset = z >= 1 ? modulate(z, [1, 8], [0.125, 0.5], true) : modulate(z, [0.1, 1], [-2, 0.125], true);
      setStyleProperty(
        rHtmlLayer.current,
        "transform",
        `scale(${toDomPrecision(z)}) translate(${toDomPrecision(
          x + offset
        )}px,${toDomPrecision(y + offset)}px)`
      );
    },
    [editor, container]
  );
  const events = useCanvasEvents();
  const shapeSvgDefs = useValue(
    "shapeSvgDefs",
    () => {
      const shapeSvgDefsByKey = /* @__PURE__ */ new Map();
      for (const util of objectMapValues(editor.shapeUtils)) {
        if (!util) return;
        const defs = util.getCanvasSvgDefs();
        for (const { key, component: Component } of defs) {
          if (shapeSvgDefsByKey.has(key)) continue;
          shapeSvgDefsByKey.set(key, /* @__PURE__ */ jsx(Component, {}, key));
        }
      }
      return [...shapeSvgDefsByKey.values()];
    },
    [editor]
  );
  const hideShapes = useValue("debug_shapes", () => debugFlags.hideShapes.get(), [debugFlags]);
  const isGridMode = useValue("isGridMode", () => editor.getInstanceState().isGridMode, [editor]);
  const { Grid } = useEditorComponents();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: rCanvas,
        draggable: false,
        className: classNames("tl-canvas", className),
        "data-testid": "canvas",
        ...events,
        children: [
          /* @__PURE__ */ jsx("svg", { className: "tl-svg-context", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("defs", { children: [
            shapeSvgDefs,
            SvgDefs && /* @__PURE__ */ jsx(SvgDefs, {})
          ] }) }),
          Background && /* @__PURE__ */ jsx("div", { className: "tl-background__wrapper", children: /* @__PURE__ */ jsx(Background, {}) }),
          isGridMode && Grid && /* @__PURE__ */ jsx(GridWrapper, {}),
          /* @__PURE__ */ jsxs("div", { ref: rHtmlLayer, className: "tl-html-layer tl-shapes", draggable: false, children: [
            /* @__PURE__ */ jsx(OnTheCanvasWrapper, {}),
            hideShapes ? null : /* @__PURE__ */ jsx(ShapesLayer, { canvasRef: rCanvas })
          ] }),
          /* @__PURE__ */ jsx(CanvasOverlays, {}),
          /* @__PURE__ */ jsx(MovingCameraHitTestBlocker, {})
        ]
      }
    ),
    /* @__PURE__ */ jsx(InFrontOfTheCanvasWrapper, {}),
    /* @__PURE__ */ jsx(MenuClickCapture, {})
  ] });
}
function InFrontOfTheCanvasWrapper() {
  const editor = useEditor();
  const { InFrontOfTheCanvas } = useEditorComponents();
  if (!InFrontOfTheCanvas) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "tl-canvas__in-front",
      onPointerDown: editor.markEventAsHandled,
      onPointerUp: editor.markEventAsHandled,
      onTouchStart: editor.markEventAsHandled,
      onTouchEnd: editor.markEventAsHandled,
      children: /* @__PURE__ */ jsx(InFrontOfTheCanvas, {})
    }
  );
}
function GridWrapper() {
  const editor = useEditor();
  const gridSize = useValue("gridSize", () => editor.getDocumentSettings().gridSize, [editor]);
  const { x, y, z } = useValue("camera", () => editor.getCamera(), [editor]);
  const { Grid } = useEditorComponents();
  if (!Grid) return null;
  return /* @__PURE__ */ jsx(Grid, { x, y, z, size: gridSize });
}
function ShapesLayer({ canvasRef }) {
  const editor = useEditor();
  const debugSvg = useValue("debug svg", () => debugFlags.debugSvg.get(), [debugFlags]);
  const renderingShapes = useValue("rendering shapes", () => editor.getRenderingShapes(), [editor]);
  return /* @__PURE__ */ jsxs(ShapeCullingProvider, { children: [
    renderingShapes.map(
      (result) => debugSvg ? /* @__PURE__ */ jsxs(Fragment2, { children: [
        /* @__PURE__ */ jsx(Shape, { ...result }),
        /* @__PURE__ */ jsx(DebugSvgCopy, { id: result.id, mode: "iframe" })
      ] }, result.id + "_fragment") : /* @__PURE__ */ jsx(Shape, { ...result }, result.id + "_shape")
    ),
    /* @__PURE__ */ jsx(CullingController, {}),
    tlenv.isSafari && /* @__PURE__ */ jsx(ReflowIfNeeded, { canvasRef })
  ] });
}
function ReflowIfNeeded({ canvasRef }) {
  const editor = useEditor();
  const culledShapesRef = useRef(/* @__PURE__ */ new Set());
  useQuickReactor(
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
  const editor = useEditor();
  const { updateCulling } = useShapeCulling();
  useQuickReactor(
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
  const editor = useEditor();
  const [image, setImage] = useState(null);
  const isInRoot = useValue(
    "is in root",
    () => {
      const shape = editor.getShape(id);
      return shape?.parentId === editor.getCurrentPageId();
    },
    [editor, id]
  );
  useEffect(() => {
    if (!isInRoot) return;
    let latest = null;
    const unsubscribe = react("shape to svg", async () => {
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
    return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx(
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
  const { OnTheCanvas } = useEditorComponents();
  if (!OnTheCanvas) return null;
  return /* @__PURE__ */ jsx(OnTheCanvas, {});
}
function MovingCameraHitTestBlocker() {
  const editor = useEditor();
  const cameraState = useValue("camera state", () => editor.getCameraState(), [editor]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: classNames("tl-hit-test-blocker", {
        "tl-hit-test-blocker__hidden": cameraState === "idle"
      })
    }
  );
}
export {
  DefaultCanvas
};
//# sourceMappingURL=DefaultCanvas.mjs.map
