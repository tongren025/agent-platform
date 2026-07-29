import { jsx } from "react/jsx-runtime";
import { useValue } from "@tldraw/state-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useCanvasEvents } from "../hooks/useCanvasEvents.mjs";
import { useEditor } from "../hooks/useEditor.mjs";
import { Vec } from "../primitives/Vec.mjs";
import { releasePointerCapture, setPointerCapture } from "../utils/dom.mjs";
import { getPointerInfo } from "../utils/getPointerInfo.mjs";
import { getPointerEventButton } from "../utils/pointer.mjs";
function MenuClickCapture() {
  const editor = useEditor();
  const isMenuOpen = useValue("is menu open", () => editor.menus.hasAnyOpenMenus(), [editor]);
  const [isPointing, setIsPointing] = useState(false);
  const showElement = isMenuOpen || isPointing;
  const canvasEvents = useCanvasEvents();
  const rPointerState = useRef({
    isDown: false,
    isDragging: false,
    button: 0,
    start: new Vec()
  });
  const rCancelContextMenuSwallow = useRef(null);
  useEffect(
    () => () => {
      rCancelContextMenuSwallow.current?.();
      rCancelContextMenuSwallow.current = null;
    },
    []
  );
  const swallowNextNativeContextMenu = useCallback(() => {
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
  const handlePointerDown = useCallback(
    (e) => {
      const button = getPointerEventButton(e);
      if (button !== 0 && button !== 2) return;
      flushSync(() => setIsPointing(true));
      setPointerCapture(e.currentTarget, e);
      rPointerState.current = {
        isDown: true,
        isDragging: false,
        button,
        start: new Vec(e.clientX, e.clientY)
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
  const handlePointerMove = useCallback(
    (e) => {
      const state = rPointerState.current;
      if (!state.isDown) return;
      if (state.button !== 2 && !state.isDragging) {
        if (Vec.Dist2(state.start, new Vec(e.clientX, e.clientY)) <= editor.options.dragDistanceSquared) {
          return;
        }
        state.isDragging = true;
        editor.dispatch({
          type: "pointer",
          target: "canvas",
          name: "pointer_down",
          ...getPointerInfo(editor, { ...e, clientX: state.start.x, clientY: state.start.y })
        });
      }
      editor.dispatch({
        type: "pointer",
        target: "canvas",
        name: "pointer_move",
        ...getPointerInfo(editor, e)
      });
    },
    [editor]
  );
  const handlePointerUp = useCallback(
    (e) => {
      const isStaticRightClick = rPointerState.current.button === 2 && !rPointerState.current.isDragging;
      editor.dispatch({
        type: "pointer",
        target: "canvas",
        name: "pointer_up",
        ...getPointerInfo(editor, e),
        button: rPointerState.current.button === 2 ? 2 : getPointerEventButton(e)
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
      releasePointerCapture(e.currentTarget, e);
      setIsPointing(false);
      rPointerState.current = {
        isDown: false,
        isDragging: false,
        button: 0,
        start: new Vec(e.clientX, e.clientY)
      };
    },
    [editor]
  );
  return showElement && /* @__PURE__ */ jsx(
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
export {
  MenuClickCapture
};
//# sourceMappingURL=MenuClickCapture.mjs.map
