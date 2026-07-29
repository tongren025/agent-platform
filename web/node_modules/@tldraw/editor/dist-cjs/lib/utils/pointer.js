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
var pointer_exports = {};
__export(pointer_exports, {
  getPointerEventButton: () => getPointerEventButton,
  isDirectDisplayPen: () => isDirectDisplayPen,
  isSecondaryClickEvent: () => isSecondaryClickEvent
});
module.exports = __toCommonJS(pointer_exports);
var import_environment = require("../globals/environment");
function isDirectDisplayPen(e) {
  if (e.pointerType !== "pen") return false;
  return import_environment.tlenv.isTouchDevice;
}
function isSecondaryClickEvent(e) {
  return e.button === 2 || import_environment.tlenv.isDarwin && e.button === 0 && e.ctrlKey && !e.metaKey;
}
function getPointerEventButton(e) {
  return isSecondaryClickEvent(e) ? 2 : e.button;
}
//# sourceMappingURL=pointer.js.map
