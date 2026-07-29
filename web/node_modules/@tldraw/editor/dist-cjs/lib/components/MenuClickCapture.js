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
var MenuClickCapture_exports = {};
__export(MenuClickCapture_exports, {
  MenuClickCapture: () => MenuClickCapture
});
module.exports = __toCommonJS(MenuClickCapture_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state_react = require("@tldraw/state-react");
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_useCanvasEvents = require("../hooks/useCanvasEvents");
var import_useEditor = require("../hooks/useEditor");
var import_Vec = require("../primitives/Vec");
var import_dom = require("../utils/dom");
var import_getPointerInfo = require("../utils/getPointerInfo");
var import_pointer = require("../utils/pointer");
function MenuClickCapture() {
  const editor = (0, import_useEditor.useEditor)();
  const isMenuOpen = (0, import_state_react.useValue)("is menu open", () => editor.menus.hasAnyOpenMenus(), [editor]);
  const [isPointing, setIsPointing] = (0, import_react.useState)(false);
  const showElement = isMenuOpen || isPointing;
  const canvasEvents = (0, import_useCanvasEvents.useCanvasEvents)();
  const rPointerState = (0, import_react.useRef)({
    isDown: false,
    isDragging: false,
    button: 0,
    start: new import_Vec.Vec()
  });
  const rCancelContextMenuSwallow = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(
    () => () => {
      rCancelContextMenuSwallow.current?.();
      rCancelContextMenuSwallow.current = null;
    },
    []
  );
  const swallowNextNativeContextMenu = (0, import_react.useCallback)(() => {
    rCancelContextMenuSwallow.current?.();
    const doc = editor.getContainerDocument();
    const onContextMenu = (event) => {
      if (!event.isTrusted) return;
      rCancelContextMenuSwallow.current?.();
      rCancelContextMenuSwallow.current = null;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const cancel = () => doc.removeEventListener("contextmenu", onContextMenu, true);
    rCancelContextMenuSwallow.current = cancel;
    doc.addEventListener("contextmenu", onContextMenu, true);
    doc.defaultView?.setTimeout(() => {
      if (rCancelContextMenuSwallow.current === cancel) {
        cancel();
        rCancelContextMenuSwallow.current = null;
      }
    }, 0);
  }, [editor]);
  const handlePointerDown = (0, import_react.useCallback)(
    (e) => {
      const button = (0, import_pointer.getPointerEventButton)(e);
      if (button !== 0 && button !== 2) return;
      (0, import_react_dom.flushSync)(() => setIsPointing(true));
      (0, import_dom.setPointerCapture)(e.currentTarget, e);
      rPointerState.current = {
        isDown: true,
        isDragging: false,
        button,
        start: new import_Vec.Vec(e.clientX, e.clientY)
      };
      if (button === 2) {
        if (!editor.options.rightClickPanning) {
          swallowNextNativeContextMenu();
          editor.menus.clearOpenMenus();
          return;
        }
        const canvas = editor.getContainer().querySelector(".tl-canvas") ?? e.currentTarget;
        canvasEvents.onPointerDown?.({ ...e, currentTarget: canvas });
        swallowNextNativeContextMenu();
        return;
      }
      editor.menus.clearOpenMenus();
    },
    [canvasEvents, editor, swallowNextNativeContextMenu]
  );
  const handlePointerMove = (0, import_react.useCallback)(
    (e) => {
      const state = rPointerState.current;
      if (!state.isDown) return;
      if (state.button !== 2 && !state.isDragging) {
        if (import_Vec.Vec.Dist2(state.start, new import_Vec.Vec(e.clientX, e.clientY)) <= editor.options.dragDistanceSquared) {
          return;
        }
        state.isDragging = true;
        editor.dispatch({
          type: "pointer",
          target: "canvas",
          name: "pointer_down",
          ...(0, import_getPointerInfo.getPointerInfo)(editor, { ...e, clientX: state.start.x, clientY: state.start.y })
        });
      }
      editor.dispatch({
        type: "pointer",
        target: "canvas",
        name: "pointer_move",
        ...(0, import_getPointerInfo.getPointerInfo)(editor, e)
      });
    },
    [editor]
  );
  const handlePointerUp = (0, import_react.useCallback)(
    (e) => {
      const isStaticRightClick = rPointerState.current.button === 2 && !rPointerState.current.isDragging;
      editor.dispatch({
        type: "pointer",
        target: "canvas",
        name: "pointer_up",
        ...(0, import_getPointerInfo.getPointerInfo)(editor, e),
        button: rPointerState.current.button === 2 ? 2 : (0, import_pointer.getPointerEventButton)(e)
      });
      if (isStaticRightClick && editor.options.rightClickPanning) {
        const canvas = editor.getContainer().querySelector(".tl-canvas");
        const trigger = canvas?.parentElement ?? e.currentTarget;
        editor.timers.requestAnimationFrame(() => {
          trigger.dispatchEvent(
            new PointerEvent("contextmenu", {
              bubbles: true,
              clientX: e.clientX,
              clientY: e.clientY,
              button: 2,
              buttons: 0,
              pointerId: e.pointerId,
              pointerType: e.pointerType,
              isPrimary: e.isPrimary
            })
          );
        });
      }
      (0, import_dom.releasePointerCapture)(e.currentTarget, e);
      setIsPointing(false);
      rPointerState.current = {
        isDown: false,
        isDragging: false,
        button: 0,
        start: new import_Vec.Vec(e.clientX, e.clientY)
      };
    },
    [editor]
  );
  return showElement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "tlui-menu-click-capture",
      "data-testid": "menu-click-capture.content",
      ...canvasEvents,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onContextMenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  );
}
//# sourceMappingURL=MenuClickCapture.js.map
