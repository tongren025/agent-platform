import { tlenv } from "../globals/environment.mjs";
function isDirectDisplayPen(e) {
  if (e.pointerType !== "pen") return false;
  return tlenv.isTouchDevice;
}
function isSecondaryClickEvent(e) {
  return e.button === 2 || tlenv.isDarwin && e.button === 0 && e.ctrlKey && !e.metaKey;
}
function getPointerEventButton(e) {
  return isSecondaryClickEvent(e) ? 2 : e.button;
}
export {
  getPointerEventButton,
  isDirectDisplayPen,
  isSecondaryClickEvent
};
//# sourceMappingURL=pointer.mjs.map
