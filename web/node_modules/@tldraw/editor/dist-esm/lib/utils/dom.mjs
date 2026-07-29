import { debugFlags, pointerCaptureTrackingObject } from "./debug-flags.mjs";
function loopToHtmlElement(elm) {
  if (elm.nodeType === Node.ELEMENT_NODE) return elm;
  if (elm.parentElement) return loopToHtmlElement(elm.parentElement);
  else throw Error("Could not find a parent element of an HTML type!");
}
function preventDefault(event) {
  if ("cancelable" in event && !event.cancelable) return;
  event.preventDefault();
  if (debugFlags.logPreventDefaults.get()) {
    console.warn("preventDefault called on event:", event);
  }
}
function setPointerCapture(element, event) {
  element.setPointerCapture(event.pointerId);
  if (debugFlags.logPointerCaptures.get()) {
    const trackingObj = pointerCaptureTrackingObject.get();
    trackingObj.set(element, (trackingObj.get(element) ?? 0) + 1);
    console.warn("setPointerCapture called on element:", element, event);
  }
}
function releasePointerCapture(element, event) {
  if (!element.hasPointerCapture(event.pointerId)) {
    return;
  }
  element.releasePointerCapture(event.pointerId);
  if (debugFlags.logPointerCaptures.get()) {
    const trackingObj = pointerCaptureTrackingObject.get();
    if (trackingObj.get(element) === 1) {
      trackingObj.delete(element);
    } else if (trackingObj.has(element)) {
      trackingObj.set(element, trackingObj.get(element) - 1);
    } else {
      console.warn("Release without capture");
    }
    console.warn("releasePointerCapture called on element:", element, event);
  }
}
function stopEventPropagation(e) {
  return e.stopPropagation();
}
function setStyleProperty(elm, property, value) {
  if (!elm) return;
  elm.style.setProperty(property, String(value));
}
function moveElementInto(parent, element) {
  if (element.isConnected && parent.isConnected && typeof parent.moveBefore === "function" && element.ownerDocument === parent.ownerDocument) {
    try {
      ;
      parent.moveBefore(element, null);
      return;
    } catch {
    }
  }
  parent.appendChild(element);
}
function elementShouldCaptureKeys(el, includeButtonsAndMenus = true) {
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  return el.isContentEditable || tagName === "input" || tagName === "textarea" || includeButtonsAndMenus && tagName === "select" || includeButtonsAndMenus && tagName === "button" || el.classList.contains("tlui-slider__thumb");
}
function getGlobalDocument() {
  if (typeof document !== "undefined") return document;
  return globalThis.document;
}
function getGlobalWindow() {
  if (typeof window !== "undefined") return window;
  return globalThis;
}
function activeElementShouldCaptureKeys(includeButtonsAndMenus = true, doc) {
  return elementShouldCaptureKeys(
    (doc ?? getGlobalDocument()).activeElement,
    includeButtonsAndMenus
  );
}
export {
  activeElementShouldCaptureKeys,
  elementShouldCaptureKeys,
  getGlobalDocument,
  getGlobalWindow,
  loopToHtmlElement,
  moveElementInto,
  preventDefault,
  releasePointerCapture,
  setPointerCapture,
  setStyleProperty,
  stopEventPropagation
};
//# sourceMappingURL=dom.mjs.map
