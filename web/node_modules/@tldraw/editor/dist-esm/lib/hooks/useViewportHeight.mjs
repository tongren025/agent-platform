import { useLayoutEffect, useState } from "react";
import { useMaybeEditor } from "./useEditor.mjs";
/*!
 * BSD License: https://github.com/outline/rich-markdown-editor/blob/main/LICENSE
 * Copyright (c) 2020 General Outline, Inc (https://www.getoutline.com/) and individual contributors.
 *
 * Returns the height of the viewport.
 * This is mainly to account for virtual keyboards on mobile devices.
 *
 * N.B. On iOS, you have to take into account the offsetTop as well so that you get an accurate position
 * while using the virtual keyboard.
 */
function useViewportHeight() {
  const editor = useMaybeEditor();
  const win = editor?.getContainerWindow() ?? window;
  const vv = win.visualViewport;
  const [height, setHeight] = useState(
    () => vv ? vv.height + vv.offsetTop : win.innerHeight
  );
  useLayoutEffect(() => {
    const win2 = editor?.getContainerWindow() ?? window;
    const handleResize = () => {
      const vv2 = win2.visualViewport;
      setHeight(() => vv2 ? vv2.height + vv2.offsetTop : win2.innerHeight);
    };
    win2.visualViewport?.addEventListener("resize", handleResize);
    win2.visualViewport?.addEventListener("scroll", handleResize);
    return () => {
      win2.visualViewport?.removeEventListener("resize", handleResize);
      win2.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, [editor]);
  return height;
}
export {
  useViewportHeight
};
//# sourceMappingURL=useViewportHeight.mjs.map
