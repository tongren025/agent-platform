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
var useViewportHeight_exports = {};
__export(useViewportHeight_exports, {
  useViewportHeight: () => useViewportHeight
});
module.exports = __toCommonJS(useViewportHeight_exports);
var import_react = require("react");
var import_useEditor = require("./useEditor");
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
  const editor = (0, import_useEditor.useMaybeEditor)();
  const win = editor?.getContainerWindow() ?? window;
  const vv = win.visualViewport;
  const [height, setHeight] = (0, import_react.useState)(
    () => vv ? vv.height + vv.offsetTop : win.innerHeight
  );
  (0, import_react.useLayoutEffect)(() => {
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
//# sourceMappingURL=useViewportHeight.js.map
