import { useEffect } from "react";
import { elementShouldCaptureKeys, preventDefault } from "../utils/dom.mjs";
import { useEditor } from "./useEditor.mjs";
function useFixSafariDoubleTapZoomPencilEvents(ref) {
  const editor = useEditor();
  useEffect(() => {
    const elm = ref.current;
    if (!elm) return;
    const win = editor.getContainerWindow();
    const handleEvent = (e) => {
      if (e instanceof win.PointerEvent && e.pointerType === "pen") {
        editor.markEventAsHandled(e);
        const { target } = e;
        if (elementShouldCaptureKeys(target instanceof win.Element ? target : null, false) || editor.isIn("select.editing_shape")) {
          return;
        }
        preventDefault(e);
      }
    };
    elm.addEventListener("touchstart", handleEvent);
    elm.addEventListener("touchend", handleEvent);
    return () => {
      elm.removeEventListener("touchstart", handleEvent);
      elm.removeEventListener("touchend", handleEvent);
    };
  }, [editor, ref]);
}
export {
  useFixSafariDoubleTapZoomPencilEvents
};
//# sourceMappingURL=useFixSafariDoubleTapZoomPencilEvents.mjs.map
