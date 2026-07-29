import { atom } from "@tldraw/state";
import { getGlobalWindow } from "../utils/dom.mjs";
const tlenv = {
  isSafari: false,
  isIos: false,
  isChromeForIos: false,
  isFirefox: false,
  isAndroid: false,
  isWebview: false,
  isDarwin: false,
  hasCanvasSupport: false,
  // Whether the device has a touch screen (an integrated coarse pointer, e.g. an iPad or a
  // touchscreen laptop). Unlike `isCoarsePointer`, this reflects the device's hardware rather than
  // the pointer currently in use, so it stays stable when a pen or mouse is used.
  isTouchDevice: false
};
let isForcedFinePointer = false;
if (typeof window !== "undefined") {
  if ("navigator" in window) {
    tlenv.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    tlenv.isIos = !!navigator.userAgent.match(/iPad/i) || !!navigator.userAgent.match(/iPhone/i);
    tlenv.isChromeForIos = /crios.*safari/i.test(navigator.userAgent);
    tlenv.isFirefox = /firefox/i.test(navigator.userAgent);
    tlenv.isAndroid = /android/i.test(navigator.userAgent);
    tlenv.isDarwin = getGlobalWindow().navigator.userAgent.toLowerCase().indexOf("mac") > -1;
  }
  tlenv.hasCanvasSupport = "Promise" in window && "HTMLCanvasElement" in window;
  isForcedFinePointer = tlenv.isFirefox && !tlenv.isAndroid && !tlenv.isIos;
  tlenv.isTouchDevice = "navigator" in window && window.navigator.maxTouchPoints > 0 || typeof window.matchMedia === "function" && window.matchMedia("(any-pointer: coarse)").matches;
}
const tlenvReactive = atom("tlenvReactive", {
  // Whether the user's device has a coarse pointer. This is dynamic on many systems, especially
  // on touch-screen laptops, which will become "coarse" if the user touches the screen.
  // See https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer#coarse
  isCoarsePointer: false,
  // Whether the user's display supports P3 color space. This is dynamic because a window can
  // move between displays with different color gamut support.
  supportsP3ColorSpace: false
});
if (typeof window !== "undefined") {
  const canRenderP3 = typeof CSS !== "undefined" && CSS.supports("color", "color(display-p3 1 1 1)");
  if (canRenderP3) {
    const p3mql = window.matchMedia("(color-gamut: p3)");
    const updateSupportsP3 = () => {
      const supportsP3 = p3mql.matches;
      if (supportsP3 !== tlenvReactive.__unsafe__getWithoutCapture().supportsP3ColorSpace) {
        tlenvReactive.update((prev) => ({ ...prev, supportsP3ColorSpace: supportsP3 }));
      }
    };
    updateSupportsP3();
    p3mql.addEventListener("change", updateSupportsP3);
  }
}
if (typeof window !== "undefined" && !isForcedFinePointer) {
  const mql = getGlobalWindow().matchMedia && getGlobalWindow().matchMedia("(any-pointer: coarse)");
  const isCurrentCoarsePointer = () => tlenvReactive.__unsafe__getWithoutCapture().isCoarsePointer;
  if (mql) {
    const updateIsCoarsePointer = () => {
      const isCoarsePointer = mql.matches;
      if (isCoarsePointer !== isCurrentCoarsePointer()) {
        tlenvReactive.update((prev) => ({ ...prev, isCoarsePointer }));
      }
    };
    updateIsCoarsePointer();
    mql.addEventListener("change", updateIsCoarsePointer);
  }
  getGlobalWindow().addEventListener(
    "pointerdown",
    (e) => {
      const isCoarseEvent = e.pointerType !== "mouse";
      if (isCoarseEvent !== isCurrentCoarsePointer()) {
        tlenvReactive.update((prev) => ({ ...prev, isCoarsePointer: isCoarseEvent }));
      }
    },
    { capture: true }
  );
}
export {
  tlenv,
  tlenvReactive
};
//# sourceMappingURL=environment.mjs.map
