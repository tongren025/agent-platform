import { e6 as Tt, S as g, ci as d, H as Bs, aL as N, cR as Ys, dJ as Re, x as Xs, c3 as ut } from "./agentStudioMount-CX1GI_dE.js";
import { a as Zs } from "./three.module-DbUzIx2U.js";
import { fw as we, gm as Ne, fk as $s, d3 as ge, d4 as Ke, gn as B, a0 as De, cB as Gs, cC as qs, fj as pt, dW as Ks, eW as Qs, bp as Js, bD as vt, gw as en, c_ as p, d1 as tn, J as sn, bh as nn, b9 as rn, fU as on, cz as an, cv as hn, bK as cn, e9 as ln, ac as dn } from "./scene3dConstants-DlRfsgmW.js";
import { I as un } from "./IconCamera-BLChpvkt.js";
import { I as pn } from "./IconMinimize-CxQKYkuW.js";
import { a as ft } from "./workbenchActions-CmBpaPQy.js";
var vn = Object.defineProperty, Qe = (e, t) => {
  for (var i in t)
    vn(e, i, { get: t[i], enumerable: !0 });
}, fn = {};
Qe(fn, {
  ACTIONS: () => St,
  ANIMATION_MIN_DURATION: () => Fe,
  CAPTURE_EVENTS_CLASS: () => ce,
  CTRLZOOM_TIMEOUT: () => Ot,
  DBLCLICK_DELAY: () => Ct,
  EASINGS: () => fe,
  ICONS: () => A,
  IDS: () => T,
  KEY_CODES: () => y,
  LONGTOUCH_DELAY: () => Lt,
  MOVE_THRESHOLD: () => Mt,
  SPHERE_RADIUS: () => D,
  TWOFINGERSOVERLAY_DELAY: () => Pt,
  VIEWER_DATA: () => W
});
var mn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 432 432"><g transform="rotate(0, 256, 256)"><path fill="currentColor" d="M425.23 210.55H227.39a5 5 0 01-3.53-8.53l56.56-56.57a45.5 45.5 0 000-64.28 45.15 45.15 0 00-32.13-13.3 45.15 45.15 0 00-32.14 13.3L41.32 256l174.83 174.83a45.15 45.15 0 0032.14 13.3 45.15 45.15 0 0032.13-13.3 45.5 45.5 0 000-64.28l-56.57-56.57a5 5 0 013.54-8.53h197.84c25.06 0 45.45-20.39 45.45-45.45s-20.4-45.45-45.45-45.45z"/></g><!-- Created by Flatart from the Noun Project --></svg>
`, wn = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="currentColor" transform=" translate(50, 50) rotate(45)"><rect x="-5" y="-65" width="10" height="130"/><rect x="-65" y="-5" width="130" height="10"/></g></svg>', gn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M83.3 35.6h-17V3H32.2v32.6H16.6l33.6 32.7 33-32.7z"/><path fill="currentColor" d="M83.3 64.2v16.3H16.6V64.2H-.1v32.6H100V64.2H83.3z"/><!--Created by Michael Zenaty from the Noun Project--></svg>
`, bn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M100 40H87.1V18.8h-21V6H100zM100 93.2H66V80.3h21.1v-21H100zM34 93.2H0v-34h12.9v21.1h21zM12.9 40H0V6h34v12.9H12.8z"/><!--Created by Garrett Knoll from the Noun Project--></svg>
`, En = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M66 7h13v21h21v13H66zM66 60.3h34v12.9H79v21H66zM0 60.3h34v34H21V73.1H0zM21 7h13v34H0V28h21z"/><!--Created by Garrett Knoll from the Noun Project--></svg>
`, yn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="currentColor" d="M28.3 26.1c-1 2.6-1.9 4.8-2.6 7-2.5 7.4-5 14.7-7.2 22-1.3 4.4.5 7.2 4.3 7.8 1.3.2 2.8.2 4.2-.1 8.2-2 11.9-8.6 15.7-15.2l-2.2 2a18.8 18.8 0 0 1-7.4 5.2 2 2 0 0 1-1.6-.2c-.2-.1 0-1 0-1.4l.8-1.8L41.9 28c.5-1.4.9-3 .7-4.4-.2-2.6-3-4.4-6.3-4.4-8.8.2-15 4.5-19.5 11.8-.2.3-.2.6-.3 1.3 3.7-2.8 6.8-6.1 11.8-6.2z"/><circle fill="currentColor" cx="39.3" cy="9.2" r="8.2"/><!--Created by Arafat Uddin from the Noun Project--></svg>
`, _n = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 80 80"><g fill="currentColor"><circle r="10" cx="20" cy="20"/><circle r="10" cx="50" cy="20"/><circle r="10" cx="80" cy="20"/><circle r="10" cx="20" cy="50"/><circle r="10" cx="50" cy="50"/><circle r="10" cx="80" cy="50"/><circle r="10" cx="20" cy="80"/><circle r="10" cx="50" cy="80"/><circle r="10" cx="80" cy="80"/></g><!-- Created by Richard Kunák from the Noun Project--></svg>
`, xn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path fill="currentColor" d="M8.728 4.009H6.744v2.737H4.006V8.73h2.738v2.736h1.984V8.73h2.737V6.746H8.728z"/><!--Created by Ryan Canning from the Noun Project--></svg>
`, Tn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path fill="currentColor" d="M4.006 6.746h7.459V8.73H4.006z"/><!--Created by Ryan Canning from the Noun Project--></svg>
`, Fe = 500, Mt = 4, Ct = 300, Lt = 500, Pt = 100, Ot = 2e3, D = 10, W = "photoSphereViewer", ce = "psv--capture-event", St = /* @__PURE__ */ ((e) => (e.ROTATE_UP = "ROTATE_UP", e.ROTATE_DOWN = "ROTATE_DOWN", e.ROTATE_RIGHT = "ROTATE_RIGHT", e.ROTATE_LEFT = "ROTATE_LEFT", e.ZOOM_IN = "ZOOM_IN", e.ZOOM_OUT = "ZOOM_OUT", e))(St || {}), T = {
  MENU: "menu",
  TWO_FINGERS: "twoFingers",
  CTRL_ZOOM: "ctrlZoom",
  ERROR: "error",
  DESCRIPTION: "description"
}, y = {
  Enter: "Enter",
  Control: "Control",
  Escape: "Escape",
  Space: " ",
  PageUp: "PageUp",
  PageDown: "PageDown",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowDown",
  Delete: "Delete",
  Plus: "+",
  Minus: "-"
}, A = {
  arrow: mn,
  close: wn,
  download: gn,
  fullscreenIn: bn,
  fullscreenOut: En,
  info: yn,
  menu: _n,
  zoomIn: xn,
  zoomOut: Tn
}, fe = {
  linear: (e) => e,
  inQuad: (e) => e * e,
  outQuad: (e) => e * (2 - e),
  inOutQuad: (e) => e < 0.5 ? 2 * e * e : -1 + (4 - 2 * e) * e,
  inCubic: (e) => e * e * e,
  outCubic: (e) => --e * e * e + 1,
  inOutCubic: (e) => e < 0.5 ? 4 * e * e * e : (e - 1) * (2 * e - 2) * (2 * e - 2) + 1,
  inQuart: (e) => e * e * e * e,
  outQuart: (e) => 1 - --e * e * e * e,
  inOutQuart: (e) => e < 0.5 ? 8 * e * e * e * e : 1 - 8 * --e * e * e * e,
  inQuint: (e) => e * e * e * e * e,
  outQuint: (e) => 1 + --e * e * e * e * e,
  inOutQuint: (e) => e < 0.5 ? 16 * e * e * e * e * e : 1 + 16 * --e * e * e * e * e,
  inSine: (e) => 1 - Math.cos(e * (Math.PI / 2)),
  outSine: (e) => Math.sin(e * (Math.PI / 2)),
  inOutSine: (e) => 0.5 - 0.5 * Math.cos(Math.PI * e),
  inExpo: (e) => Math.pow(2, 10 * (e - 1)),
  outExpo: (e) => 1 - Math.pow(2, -10 * e),
  inOutExpo: (e) => (e = e * 2 - 1) < 0 ? 0.5 * Math.pow(2, 10 * e) : 1 - 0.5 * Math.pow(2, -10 * e),
  inCirc: (e) => 1 - Math.sqrt(1 - e * e),
  outCirc: (e) => Math.sqrt(1 - (e - 1) * (e - 1)),
  inOutCirc: (e) => (e *= 2) < 1 ? 0.5 - 0.5 * Math.sqrt(1 - e * e) : 0.5 + 0.5 * Math.sqrt(1 - (e -= 2) * e)
}, Mn = {};
Qe(Mn, {
  Animation: () => xe,
  Dynamic: () => K,
  MultiDynamic: () => Jt,
  PressHandler: () => Oe,
  Slider: () => ti,
  SliderDirection: () => ei,
  addClasses: () => Je,
  angle: () => kt,
  applyEulerInverse: () => Be,
  checkClosedShadowDom: () => Kt,
  checkStylesheet: () => qt,
  checkVersion: () => rt,
  cleanCssPosition: () => $t,
  clone: () => Ce,
  createTexture: () => We,
  cssPositionIsOrdered: () => nt,
  dasherize: () => Sn,
  deepEqual: () => Yt,
  deepmerge: () => Wt,
  distance: () => It,
  exitFullscreen: () => jt,
  firstNonNull: () => z,
  getAbortError: () => je,
  getAngle: () => zt,
  getClosest: () => Ht,
  getConfigParser: () => Pe,
  getElement: () => Rt,
  getEventTarget: () => be,
  getMatchingTarget: () => Nt,
  getPosition: () => Dt,
  getShortestArc: () => At,
  getStyleProperty: () => H,
  getTouchData: () => Ue,
  getXMPValue: () => O,
  greatArcDistance: () => Ln,
  hasParent: () => On,
  invertResolvableBoolean: () => Le,
  isAbortError: () => Zt,
  isEmpty: () => Bt,
  isExtendedPosition: () => st,
  isFullscreenEnabled: () => Ft,
  isNil: () => _,
  isPlainObject: () => tt,
  keyPressMatch: () => et,
  logWarn: () => M,
  mergePanoData: () => Qt,
  parseAngle: () => R,
  parsePoint: () => In,
  parseSpeed: () => Gt,
  removeClasses: () => Pn,
  requestFullscreen: () => Ut,
  resolveBoolean: () => it,
  speedToDuration: () => Ve,
  sum: () => Cn,
  throttle: () => Vt,
  toggleClass: () => Me,
  wrap: () => Q
});
function Q(e, t) {
  let i = e % t;
  return i < 0 && (i += t), i;
}
function Cn(e) {
  return e.reduce((t, i) => t + i, 0);
}
function It(e, t) {
  return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
}
function kt(e, t) {
  return Math.atan2(t.y - e.y, t.x - e.x);
}
function At(e, t) {
  return [
    0,
    // direct
    Math.PI * 2,
    // clock-wise cross zero
    -Math.PI * 2
    // counter-clock-wise cross zero
  ].reduce((s, n) => {
    const r = t - e + n;
    return Math.abs(r) < Math.abs(s) ? r : s;
  }, 1 / 0);
}
function zt(e, t) {
  return Math.acos(
    Math.cos(e.pitch) * Math.cos(t.pitch) * Math.cos(e.yaw - t.yaw) + Math.sin(e.pitch) * Math.sin(t.pitch)
  );
}
function Ln([e, t], [i, s]) {
  e - i > Math.PI ? e -= 2 * Math.PI : e - i < -Math.PI && (e += 2 * Math.PI);
  const n = (i - e) * Math.cos((t + s) / 2), r = s - t;
  return Math.sqrt(n * n + r * r);
}
function Rt(e) {
  return typeof e == "string" ? e.match(/^[a-z]/i) ? document.getElementById(e) : document.querySelector(e) : e;
}
function Me(e, t, i) {
  i === void 0 ? e.classList.toggle(t) : i ? e.classList.add(t) : i || e.classList.remove(t);
}
function Je(e, t) {
  e.classList.add(...t.split(" ").filter((i) => !!i));
}
function Pn(e, t) {
  e.classList.remove(...t.split(" ").filter((i) => !!i));
}
function On(e, t) {
  let i = e;
  do {
    if (i === t)
      return !0;
    i = i.parentElement;
  } while (i);
  return !1;
}
function Ht(e, t) {
  if (!e?.matches)
    return null;
  let i = e;
  do {
    if (i.matches(t))
      return i;
    i = i.parentElement;
  } while (i);
  return null;
}
function be(e) {
  return e?.composedPath()[0] || null;
}
function Nt(e, t) {
  return e ? e.composedPath().find((i) => !(i instanceof HTMLElement) && !(i instanceof SVGElement) ? !1 : i.matches(t)) : null;
}
function Dt(e) {
  let t = 0, i = 0, s = e;
  for (; s; )
    t += s.offsetLeft - s.scrollLeft + s.clientLeft, i += s.offsetTop - s.scrollTop + s.clientTop, s = s.offsetParent;
  return t -= window.scrollX, i -= window.scrollY, { x: t, y: i };
}
function H(e, t) {
  return window.getComputedStyle(e).getPropertyValue(t);
}
function Ue(e) {
  if (e.touches.length < 2)
    return null;
  const t = { x: e.touches[0].clientX, y: e.touches[0].clientY }, i = { x: e.touches[1].clientX, y: e.touches[1].clientY };
  return {
    distance: It(t, i),
    angle: kt(t, i),
    center: { x: (t.x + i.x) / 2, y: (t.y + i.y) / 2 }
  };
}
var Ee;
function Ft(e, t = !1) {
  return t ? e === Ee : document.fullscreenElement === e;
}
function Ut(e, t = !1) {
  t ? (Ee = e, e.classList.add("psv-fullscreen-emulation"), document.dispatchEvent(new Event("fullscreenchange"))) : e.requestFullscreen();
}
function jt(e = !1) {
  e ? (Ee.classList.remove("psv-fullscreen-emulation"), Ee = null, document.dispatchEvent(new Event("fullscreenchange"))) : document.exitFullscreen();
}
function et(e, t) {
  let i, s = !1, n = !1, r = !1, o = !1;
  return t === "+" ? i = t : t.split("+").forEach((a) => {
    switch (a) {
      case "Shift":
        s = !0;
        break;
      case "Ctrl":
        n = !0;
        break;
      case "Alt":
        r = !0;
        break;
      case "Meta":
        o = !0;
        break;
      case "Space":
        i = " ";
        break;
      case "Plus":
        i = "+";
        break;
      case "Minus":
        i = "-";
        break;
      default:
        i = a;
        break;
    }
  }), s === e.shiftKey && n === e.ctrlKey && r === e.altKey && o === e.metaKey && i === e.key;
}
function Sn(e) {
  return e.replace(/[A-Z](?:(?=[^A-Z])|[A-Z]*(?=[A-Z][^A-Z]|$))/g, (t, i) => (i > 0 ? "-" : "") + t.toLowerCase());
}
function Vt(e, t) {
  let i = !1;
  return function(...s) {
    i || (i = !0, setTimeout(() => {
      e.apply(this, s), i = !1;
    }, t));
  };
}
function tt(e) {
  if (typeof e != "object" || e === null || Object.prototype.toString.call(e) !== "[object Object]")
    return !1;
  if (Object.getPrototypeOf(e) === null)
    return !0;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; )
    t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t;
}
function Wt(e, t) {
  const i = t;
  return (function s(n, r) {
    return Array.isArray(r) ? (!n || !Array.isArray(n) ? n = [] : n.length = 0, r.forEach((o, a) => {
      n[a] = s(null, o);
    })) : typeof r == "object" ? ((!n || Array.isArray(n)) && (n = {}), Object.keys(r).forEach((o) => {
      o !== "__proto__" && (typeof r[o] != "object" || !r[o] || !tt(r[o]) ? n[o] = r[o] : r[o] !== i && (n[o] ? s(n[o], r[o]) : n[o] = s(null, r[o])));
    })) : n = r, n;
  })(e, t);
}
function Ce(e) {
  return Wt(null, e);
}
function Bt(e) {
  return !e || Object.keys(e).length === 0 && e.constructor === Object;
}
function _(e) {
  return e == null;
}
function z(...e) {
  for (const t of e)
    if (!_(t))
      return t;
  return null;
}
function Yt(e, t) {
  if (e === t)
    return !0;
  if (mt(e) && mt(t)) {
    if (Object.keys(e).length !== Object.keys(t).length)
      return !1;
    for (const i of Object.keys(e))
      if (!Yt(e[i], t[i]))
        return !1;
    return !0;
  } else
    return !1;
}
function mt(e) {
  return typeof e == "object" && e !== null;
}
var v = class Xt extends Error {
  constructor(t, i) {
    super(i && i instanceof Error ? `${t}: ${i.message}` : t), this.name = "PSVError", Error.captureStackTrace?.(this, Xt);
  }
};
function it(e, t) {
  tt(e) ? (t(e.initial, !0), e.promise.then((i) => t(i, !1))) : t(e, !0);
}
function Le(e) {
  return {
    initial: !e.initial,
    promise: e.promise.then((t) => !t)
  };
}
function je() {
  const e = new Error("Loading was aborted.");
  return e.name = "AbortError", e;
}
function Zt(e) {
  return e?.name === "AbortError";
}
function M(e) {
  console.warn(`PhotoSphereViewer: ${e}`);
}
function st(e) {
  return !e || Array.isArray(e) ? !1 : [
    ["textureX", "textureY"],
    ["yaw", "pitch"]
  ].some(([t, i]) => e[t] !== void 0 && e[i] !== void 0);
}
function O(e, t, i = !0) {
  let s = e.match("<GPano:" + t + ">(.*)</GPano:" + t + ">");
  if (s !== null) {
    const n = i ? parseInt(s[1], 10) : parseFloat(s[1]);
    return isNaN(n) ? null : n;
  }
  if (s = e.match("GPano:" + t + '="(.*?)"'), s !== null) {
    const n = i ? parseInt(s[1], 10) : parseFloat(s[1]);
    return isNaN(n) ? null : n;
  }
  return null;
}
var wt = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, ye = ["left", "center", "right"], _e = ["top", "center", "bottom"], gt = [...ye, ..._e], I = "center";
function In(e) {
  if (!e)
    return { x: 0.5, y: 0.5 };
  if (typeof e == "object")
    return e;
  let t = e.toLocaleLowerCase().split(" ").slice(0, 2);
  t.length === 1 && (wt[t[0]] ? t = [t[0], I] : t = [t[0], t[0]]);
  const i = t[1] !== "left" && t[1] !== "right" && t[0] !== "top" && t[0] !== "bottom";
  t = t.map((n) => wt[n] || n), i || t.reverse();
  const s = t.join(" ").match(/^([0-9.]+)% ([0-9.]+)%$/);
  return s ? {
    x: parseFloat(s[1]) / 100,
    y: parseFloat(s[2]) / 100
  } : { x: 0.5, y: 0.5 };
}
function $t(e, { allowCenter: t, cssOrder: i } = {
  allowCenter: !0,
  cssOrder: !0
}) {
  return e ? (typeof e == "string" && (e = e.split(" ")), e.length === 1 && (e[0] === I ? e = [I, I] : ye.indexOf(e[0]) !== -1 ? e = [I, e[0]] : _e.indexOf(e[0]) !== -1 && (e = [e[0], I])), e.length !== 2 || gt.indexOf(e[0]) === -1 || gt.indexOf(e[1]) === -1 ? (M(`Unparsable position ${e}`), null) : !t && e[0] === I && e[1] === I ? (M("Invalid position center center"), null) : (i && !nt(e) && (e = [e[1], e[0]]), e[1] === I && ye.indexOf(e[0]) !== -1 && (e = [I, e[0]]), e[0] === I && _e.indexOf(e[1]) !== -1 && (e = [e[1], I]), e)) : null;
}
function nt(e) {
  return _e.indexOf(e[0]) !== -1 && ye.indexOf(e[1]) !== -1;
}
function Gt(e) {
  let t;
  if (typeof e == "string") {
    const i = e.toString().trim();
    let s = parseFloat(i.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/, "$1"));
    const n = i.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/, "$1").trim();
    switch (n.match(/(pm|per minute)$/) && (s /= 60), n) {
      // Degrees per minute / second
      case "dpm":
      case "degrees per minute":
      case "dps":
      case "degrees per second":
        t = p.degToRad(s);
        break;
      // Radians per minute / second
      case "rdpm":
      case "radians per minute":
      case "rdps":
      case "radians per second":
        t = s;
        break;
      // Revolutions per minute / second
      case "rpm":
      case "revolutions per minute":
      case "rps":
      case "revolutions per second":
        t = s * Math.PI * 2;
        break;
      // Unknown unit
      default:
        throw new v(`Unknown speed unit "${n}"`);
    }
  } else
    t = e;
  return t;
}
function Ve(e, t) {
  if (typeof e != "number") {
    const i = Gt(e);
    return t / Math.abs(i) * 1e3;
  } else
    return Math.abs(e);
}
function R(e, t = !1, i = t) {
  let s;
  if (typeof e == "string") {
    const n = e.toLowerCase().trim().match(/^(-?[0-9]+(?:\.[0-9]*)?)(.*)$/);
    if (!n)
      throw new v(`Unknown angle "${e}"`);
    const r = parseFloat(n[1]), o = n[2];
    if (o)
      switch (o) {
        case "deg":
        case "degs":
          s = p.degToRad(r);
          break;
        case "rad":
        case "rads":
          s = r;
          break;
        default:
          throw new v(`Unknown angle unit "${o}"`);
      }
    else
      s = r;
  } else if (typeof e == "number" && !isNaN(e))
    s = e;
  else
    throw new v(`Unknown angle "${e}"`);
  return s = Q(t ? s + Math.PI : s, Math.PI * 2), t ? p.clamp(s - Math.PI, -Math.PI / (i ? 2 : 1), Math.PI / (i ? 2 : 1)) : s;
}
function We(e, t = !1) {
  const i = new on(e);
  return i.needsUpdate = !0, i.minFilter = t ? an : hn, i.generateMipmaps = t, i.anisotropy = t ? 2 : 1, i;
}
var bt = new ln();
function Be(e, t) {
  bt.setFromEuler(t).invert(), e.applyQuaternion(bt);
}
function Pe(e, t) {
  const i = function(s) {
    const n = Ce({
      ...e,
      ...s
    }), r = {};
    for (let [o, a] of Object.entries(n)) {
      if (t && o in t)
        a = t[o](a, {
          rawConfig: n,
          defValue: e[o]
        });
      else if (!(o in e)) {
        M(`Unknown option ${o}`);
        continue;
      }
      r[o] = a;
    }
    return r;
  };
  return i.defaults = e, i.parsers = t || {}, i;
}
function qt(e, t) {
  H(e, `--psv-${t}-loaded`) !== "true" && console.error(`PhotoSphereViewer: stylesheet "@photo-sphere-viewer/${t}/index.css" is not loaded`);
}
function rt(e, t, i) {
  t && t !== i && console.error(`PhotoSphereViewer: @photo-sphere-viewer/${e} is in version ${t} but @photo-sphere-viewer/core is in version ${i}`);
}
function Kt(e) {
  do {
    if (e instanceof ShadowRoot && e.mode === "closed") {
      console.error("PhotoSphereViewer: closed shadow DOM detected, the viewer might not work as expected");
      return;
    }
    e = e.parentNode;
  } while (e);
}
function Qt(e, t, i, s) {
  const n = {
    isEquirectangular: !0,
    fullWidth: z(i?.fullWidth, s?.fullWidth),
    fullHeight: z(i?.fullHeight, s?.fullHeight),
    croppedWidth: z(i?.croppedWidth, s?.croppedWidth, e),
    croppedHeight: z(i?.croppedHeight, s?.croppedHeight, t),
    croppedX: z(i?.croppedX, s?.croppedX),
    croppedY: z(i?.croppedY, s?.croppedY),
    poseHeading: z(i?.poseHeading, s?.poseHeading, 0),
    posePitch: z(i?.posePitch, s?.posePitch, 0),
    poseRoll: z(i?.poseRoll, s?.poseRoll, 0),
    initialHeading: s?.initialHeading,
    initialPitch: s?.initialPitch,
    initialFov: s?.initialFov
  };
  if (n.croppedWidth !== e) {
    const r = e / n.croppedWidth;
    [
      "fullWidth",
      "fullHeight",
      "croppedWidth",
      "croppedHeight",
      "croppedX",
      "croppedY"
    ].forEach((o) => {
      n[o] && (n[o] = Math.round(n[o] * r));
    });
  }
  return !n.fullWidth && !n.fullHeight && (n.fullWidth = Math.max(n.croppedWidth, n.croppedHeight * 2), n.fullHeight = Math.round(n.fullWidth / 2)), n.fullWidth || (n.fullWidth = n.fullHeight * 2), n.fullHeight || (n.fullHeight = Math.round(n.fullWidth / 2)), n.croppedX === null && (n.croppedX = Math.round((n.fullWidth - e) / 2)), n.croppedY === null && (n.croppedY = Math.round((n.fullHeight - t) / 2)), Math.abs(n.fullWidth - n.fullHeight * 2) > 1 && (M("Invalid panoData, fullWidth should be twice fullHeight"), n.fullHeight = Math.round(n.fullWidth / 2)), n.croppedX + n.croppedWidth > n.fullWidth && (M("Invalid panoData, croppedX + croppedWidth > fullWidth"), n.croppedX = n.fullWidth - n.croppedWidth), n.croppedY + n.croppedHeight > n.fullHeight && (M("Invalid panoData, croppedY + croppedHeight > fullHeight"), n.croppedY = n.fullHeight - n.croppedHeight), n.croppedX < 0 && (M("Invalid panoData, croppedX < 0"), n.croppedX = 0), n.croppedY < 0 && (M("Invalid panoData, croppedY < 0"), n.croppedY = 0), n;
}
var xe = class {
  constructor(e) {
    this.easing = fe.linear, this.callbacks = [], this.resolved = !1, this.cancelled = !1, this.options = e, e ? (e.easing && (this.easing = typeof e.easing == "function" ? e.easing : fe[e.easing] || fe.linear), this.delayTimeout = setTimeout(() => {
      this.delayTimeout = void 0, this.animationFrame = window.requestAnimationFrame((t) => this.__run(t));
    }, e.delay || 0)) : this.resolved = !0;
  }
  __run(e) {
    if (this.cancelled)
      return;
    this.start || (this.start = e);
    const t = (e - this.start) / this.options.duration, i = {};
    if (t < 1) {
      for (const [s, n] of Object.entries(this.options.properties))
        if (n) {
          const r = n.start + (n.end - n.start) * this.easing(t);
          i[s] = r;
        }
      this.options.onTick(i, t), this.animationFrame = window.requestAnimationFrame((s) => this.__run(s));
    } else {
      for (const [s, n] of Object.entries(this.options.properties))
        n && (i[s] = n.end);
      this.options.onTick(i, 1), this.__resolve(!0), this.animationFrame = void 0;
    }
  }
  __resolve(e) {
    e ? this.resolved = !0 : this.cancelled = !0, this.callbacks.forEach((t) => t(e)), this.callbacks.length = 0;
  }
  /**
   * Promise chaining
   * @param [onFulfilled] - Called when the animation is complete (true) or cancelled (false)
   */
  then(e) {
    return this.resolved || this.cancelled ? Promise.resolve(this.resolved).then(e) : new Promise((t) => {
      this.callbacks.push(t);
    }).then(e);
  }
  /**
   * Cancels the animation
   */
  cancel() {
    !this.cancelled && !this.resolved && (this.__resolve(!1), this.delayTimeout && (window.clearTimeout(this.delayTimeout), this.delayTimeout = void 0), this.animationFrame && (window.cancelAnimationFrame(this.animationFrame), this.animationFrame = void 0));
  }
}, K = class {
  constructor(e, t) {
    if (this.fn = e, this.mode = 0, this.speed = 0, this.speedMult = 0, this.currentSpeed = 0, this.target = 0, this.__current = 0, this.min = t.min, this.max = t.max, this.wrap = t.wrap, this.current = t.defaultValue, this.wrap && this.min !== 0)
      throw new v("invalid config");
    this.fn && this.fn(this.current);
  }
  get current() {
    return this.__current;
  }
  set current(e) {
    this.__current = e;
  }
  /**
   * Changes base speed
   */
  setSpeed(e) {
    this.speed = e;
  }
  /**
   * Defines the target position
   */
  goto(e, t = 1) {
    this.mode = 2, this.target = this.wrap ? Q(e, this.max) : p.clamp(e, this.min, this.max), this.speedMult = t;
  }
  /**
   * Increases/decreases the target position
   */
  step(e, t = 1) {
    t === 0 ? this.setValue(this.current + e) : (this.mode !== 2 && (this.target = this.current), this.goto(this.target + e, t));
  }
  /**
   * Starts infinite movement
   */
  roll(e = !1, t = 1) {
    this.mode = 1, this.target = e ? -1 / 0 : 1 / 0, this.speedMult = t;
  }
  /**
   * Stops movement
   */
  stop() {
    this.mode = 0;
  }
  /**
   * Defines the current position and immediately stops movement
   * @param {number} value
   */
  setValue(e) {
    return this.target = this.wrap ? Q(e, this.max) : p.clamp(e, this.min, this.max), this.mode = 0, this.currentSpeed = 0, this.target !== this.current ? (this.current = this.target, this.fn && this.fn(this.current), !0) : !1;
  }
  /**
   * @internal
   */
  update(e) {
    if (this.mode === 2) {
      this.wrap && Math.abs(this.target - this.current) > this.max / 2 && (this.current = this.current < this.target ? this.current + this.max : this.current - this.max);
      const s = this.currentSpeed * this.currentSpeed / (this.speed * this.speedMult * 4);
      Math.abs(this.target - this.current) <= s && (this.mode = 0);
    }
    let t = this.mode === 0 ? 0 : this.speed * this.speedMult;
    this.target < this.current && (t = -t), this.currentSpeed < t ? this.currentSpeed = Math.min(
      t,
      this.currentSpeed + e / 1e3 * this.speed * this.speedMult * 2
    ) : this.currentSpeed > t && (this.currentSpeed = Math.max(
      t,
      this.currentSpeed - e / 1e3 * this.speed * this.speedMult * 2
    ));
    let i = null;
    return this.current > this.target && this.currentSpeed ? i = Math.max(this.target, this.current + this.currentSpeed * e / 1e3) : this.current < this.target && this.currentSpeed && (i = Math.min(this.target, this.current + this.currentSpeed * e / 1e3)), i !== null && (i = this.wrap ? Q(i, this.max) : p.clamp(i, this.min, this.max), i !== this.current) ? (this.current = i, this.fn && this.fn(this.current), !0) : !1;
  }
}, Jt = class {
  constructor(e, t) {
    this.fn = e, this.dynamics = t, this.fn && this.fn(this.current);
  }
  get current() {
    return Object.entries(this.dynamics).reduce(
      (e, [t, i]) => (e[t] = i.current, e),
      {}
    );
  }
  /**
   * Changes base speed
   */
  setSpeed(e) {
    for (const t of Object.values(this.dynamics))
      t.setSpeed(e);
  }
  /**
   * Defines the target positions
   */
  goto(e, t = 1) {
    for (const [i, s] of Object.entries(e))
      this.dynamics[i].goto(s, t);
  }
  /**
   * Increase/decrease the target positions
   */
  step(e, t = 1) {
    if (t === 0)
      this.setValue(
        Object.keys(e).reduce(
          (i, s) => (i[s] = e[s] + this.dynamics[s].current, i),
          {}
        )
      );
    else
      for (const [i, s] of Object.entries(e))
        this.dynamics[i].step(s, t);
  }
  /**
   * Starts infinite movements
   */
  roll(e, t = 1) {
    for (const [i, s] of Object.entries(e))
      this.dynamics[i].roll(s, t);
  }
  /**
   * Stops movements
   */
  stop() {
    for (const e of Object.values(this.dynamics))
      e.stop();
  }
  /**
   * Defines the current positions and immediately stops movements
   */
  setValue(e) {
    let t = !1;
    for (const [i, s] of Object.entries(e))
      t = this.dynamics[i].setValue(s) || t;
    return t && this.fn && this.fn(this.current), t;
  }
  /**
   * @internal
   */
  update(e) {
    let t = !1;
    for (const i of Object.values(this.dynamics))
      t = i.update(e) || t;
    return t && this.fn && this.fn(this.current), t;
  }
}, Oe = class {
  constructor(e = 200) {
    this.delay = e, this.time = 0, this.delay = e;
  }
  get pending() {
    return this.time !== 0;
  }
  down(e) {
    this.timeout && (clearTimeout(this.timeout), this.timeout = void 0), this.time = (/* @__PURE__ */ new Date()).getTime(), this.data = e;
  }
  up(e) {
    if (!this.time)
      return;
    Date.now() - this.time < this.delay ? this.timeout = setTimeout(() => {
      e(this.data), this.timeout = void 0, this.time = 0, this.data = void 0;
    }, this.delay) : (e(this.data), this.time = 0, this.data = void 0);
  }
}, ei = /* @__PURE__ */ ((e) => (e.VERTICAL = "VERTICAL", e.HORIZONTAL = "HORIZONTAL", e))(ei || {}), ti = class {
  constructor(e, t, i) {
    this.container = e, this.direction = t, this.listener = i, this.mousedown = !1, this.mouseover = !1, this.container.addEventListener("click", this), this.container.addEventListener("mousedown", this), this.container.addEventListener("mouseenter", this), this.container.addEventListener("mouseleave", this), this.container.addEventListener("touchstart", this), this.container.addEventListener("mousemove", this, !0), this.container.addEventListener("touchmove", this, !0), window.addEventListener("mouseup", this), window.addEventListener("touchend", this);
  }
  get isVertical() {
    return this.direction === "VERTICAL";
  }
  get isHorizontal() {
    return this.direction === "HORIZONTAL";
  }
  destroy() {
    window.removeEventListener("mouseup", this), window.removeEventListener("touchend", this);
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case "click":
        e.stopPropagation();
        break;
      case "mousedown":
        this.__onMouseDown(e);
        break;
      case "mouseenter":
        this.__onMouseEnter(e);
        break;
      case "mouseleave":
        this.__onMouseLeave(e);
        break;
      case "touchstart":
        this.__onTouchStart(e);
        break;
      case "mousemove":
        this.__onMouseMove(e);
        break;
      case "touchmove":
        this.__onTouchMove(e);
        break;
      case "mouseup":
        this.__onMouseUp(e);
        break;
      case "touchend":
        this.__onTouchEnd(e);
        break;
    }
  }
  __onMouseDown(e) {
    this.mousedown = !0, this.__update(e.clientX, e.clientY, !0);
  }
  __onMouseEnter(e) {
    this.mouseover = !0, this.__update(e.clientX, e.clientY, !0);
  }
  __onTouchStart(e) {
    this.mouseover = !0, this.mousedown = !0;
    const t = e.changedTouches[0];
    this.__update(t.clientX, t.clientY, !0);
  }
  __onMouseMove(e) {
    (this.mousedown || this.mouseover) && (e.stopPropagation(), this.__update(e.clientX, e.clientY, !0));
  }
  __onTouchMove(e) {
    if (this.mousedown || this.mouseover) {
      e.stopPropagation();
      const t = e.changedTouches[0];
      this.__update(t.clientX, t.clientY, !0);
    }
  }
  __onMouseUp(e) {
    this.mousedown && (this.mousedown = !1, this.__update(e.clientX, e.clientY, !1));
  }
  __onMouseLeave(e) {
    this.mouseover && (this.mouseover = !1, this.__update(e.clientX, e.clientY, !0));
  }
  __onTouchEnd(e) {
    if (this.mousedown) {
      this.mouseover = !1, this.mousedown = !1;
      const t = e.changedTouches[0];
      this.__update(t.clientX, t.clientY, !1);
    }
  }
  __update(e, t, i) {
    const s = this.container.getBoundingClientRect();
    let n;
    this.isVertical ? n = p.clamp((s.bottom - t) / s.height, 0, 1) : n = p.clamp((e - s.left) / s.width, 0, 1), this.listener({
      value: n,
      click: !i,
      mousedown: this.mousedown,
      mouseover: this.mouseover,
      cursor: { clientX: e, clientY: t }
    });
  }
}, kn = {};
Qe(kn, {
  BeforeAnimateEvent: () => ot,
  BeforeRenderEvent: () => J,
  BeforeRotateEvent: () => ci,
  ClickEvent: () => ui,
  ConfigChangedEvent: () => P,
  DoubleClickEvent: () => wi,
  FullscreenEvent: () => ee,
  HideNotificationEvent: () => te,
  HideOverlayEvent: () => Ti,
  HidePanelEvent: () => U,
  HideTooltipEvent: () => Oi,
  KeypressEvent: () => j,
  LoadProgressEvent: () => zi,
  ObjectEnterEvent: () => bs,
  ObjectEvent: () => Se,
  ObjectHoverEvent: () => Ts,
  ObjectLeaveEvent: () => Ye,
  PanoramaErrorEvent: () => Vi,
  PanoramaLoadEvent: () => Ni,
  PanoramaLoadedEvent: () => $,
  PositionUpdatedEvent: () => ie,
  ReadyEvent: () => ne,
  RenderEvent: () => es,
  RollUpdatedEvent: () => se,
  ShowNotificationEvent: () => re,
  ShowOverlayEvent: () => rs,
  ShowPanelEvent: () => V,
  ShowTooltipEvent: () => ls,
  SizeUpdatedEvent: () => oe,
  StopAllEvent: () => ae,
  TransitionDoneEvent: () => Yi,
  ViewerEvent: () => f,
  ZoomUpdatedEvent: () => F
});
var An = class extends Event {
  constructor(e, t = !1) {
    super(e, { cancelable: t });
  }
}, ii = class extends EventTarget {
  dispatchEvent(e) {
    return super.dispatchEvent(e);
  }
  /**
   * @template T the name of event
   * @template E the class of the event
   */
  addEventListener(e, t, i) {
    super.addEventListener(e, t, i);
  }
  /**
   * @template T the name of event
   * @template E the class of the event
   */
  removeEventListener(e, t, i) {
    super.removeEventListener(e, t, i);
  }
}, f = class extends An {
}, si = class ni extends f {
  /** @internal */
  constructor(t, i) {
    super(ni.type, !0), this.position = t, this.zoomLevel = i;
  }
};
si.type = "before-animate";
var ot = si, ri = class oi extends f {
  /** @internal */
  constructor(t, i) {
    super(oi.type), this.timestamp = t, this.elapsed = i;
  }
};
ri.type = "before-render";
var J = ri, ai = class hi extends f {
  /** @internal */
  constructor(t) {
    super(hi.type, !0), this.position = t;
  }
};
ai.type = "before-rotate";
var ci = ai, li = class di extends f {
  /** @internal */
  constructor(t) {
    super(di.type), this.data = t;
  }
};
li.type = "click";
var ui = li, pi = class vi extends f {
  /** @internal */
  constructor(t) {
    super(vi.type), this.options = t;
  }
  /**
   * Checks if at least one of the `options` has been modified
   */
  containsOptions(...t) {
    return t.some((i) => this.options.includes(i));
  }
};
pi.type = "config-changed";
var P = pi, fi = class mi extends f {
  /** @internal */
  constructor(t) {
    super(mi.type), this.data = t;
  }
};
fi.type = "dblclick";
var wi = fi, gi = class bi extends f {
  /** @internal */
  constructor(t) {
    super(bi.type), this.fullscreenEnabled = t;
  }
};
gi.type = "fullscreen";
var ee = gi, Ei = class yi extends f {
  /** @internal */
  constructor(t) {
    super(yi.type), this.notificationId = t;
  }
};
Ei.type = "hide-notification";
var te = Ei, _i = class xi extends f {
  /** @internal */
  constructor(t) {
    super(xi.type), this.overlayId = t;
  }
};
_i.type = "hide-overlay";
var Ti = _i, Mi = class Ci extends f {
  /** @internal */
  constructor(t) {
    super(Ci.type), this.panelId = t;
  }
};
Mi.type = "hide-panel";
var U = Mi, Li = class Pi extends f {
  /** @internal */
  constructor(t) {
    super(Pi.type), this.tooltipData = t;
  }
};
Li.type = "hide-tooltip";
var Oi = Li, Si = class Ii extends f {
  /** @internal */
  constructor(t, i) {
    super(Ii.type, !0), this.key = t, this.originalEvent = i;
  }
  /**
   * Checks if the key events matches the given pattern
   */
  matches(t) {
    return et(this.originalEvent, t);
  }
};
Si.type = "key-press";
var j = Si, ki = class Ai extends f {
  /** @internal */
  constructor(t) {
    super(Ai.type), this.progress = t;
  }
};
ki.type = "load-progress";
var zi = ki, Ri = class Hi extends f {
  /** @internal */
  constructor(t) {
    super(Hi.type), this.panorama = t;
  }
};
Ri.type = "panorama-load";
var Ni = Ri, Di = class Fi extends f {
  /** @internal */
  constructor(t) {
    super(Fi.type), this.data = t;
  }
};
Di.type = "panorama-loaded";
var $ = Di, Ui = class ji extends f {
  /** @internal */
  constructor(t, i) {
    super(ji.type), this.panorama = t, this.error = i;
  }
};
Ui.type = "panorama-error";
var Vi = Ui, Wi = class Bi extends f {
  /** @internal */
  constructor(t) {
    super(Bi.type), this.completed = t;
  }
};
Wi.type = "transition-done";
var Yi = Wi, Xi = class Zi extends f {
  /** @internal */
  constructor(t) {
    super(Zi.type), this.position = t;
  }
};
Xi.type = "position-updated";
var ie = Xi, $i = class Gi extends f {
  /** @internal */
  constructor(t) {
    super(Gi.type), this.roll = t;
  }
};
$i.type = "roll-updated";
var se = $i, qi = class Ki extends f {
  /** @internal */
  constructor() {
    super(Ki.type);
  }
};
qi.type = "ready";
var ne = qi, Qi = class Ji extends f {
  /** @internal */
  constructor() {
    super(Ji.type);
  }
};
Qi.type = "render";
var es = Qi, ts = class is extends f {
  /** @internal */
  constructor(t) {
    super(is.type), this.notificationId = t;
  }
};
ts.type = "show-notification";
var re = ts, ss = class ns extends f {
  /** @internal */
  constructor(t) {
    super(ns.type), this.overlayId = t;
  }
};
ss.type = "show-overlay";
var rs = ss, os = class as extends f {
  /** @internal */
  constructor(t) {
    super(as.type), this.panelId = t;
  }
};
os.type = "show-panel";
var V = os, hs = class cs extends f {
  /** @internal */
  constructor(t, i) {
    super(cs.type), this.tooltip = t, this.tooltipData = i;
  }
};
hs.type = "show-tooltip";
var ls = hs, ds = class us extends f {
  /** @internal */
  constructor(t) {
    super(us.type), this.size = t;
  }
};
ds.type = "size-updated";
var oe = ds, ps = class vs extends f {
  /** @internal */
  constructor() {
    super(vs.type);
  }
};
ps.type = "stop-all";
var ae = ps, fs = class ms extends f {
  /** @internal */
  constructor(t) {
    super(ms.type), this.zoomLevel = t;
  }
};
fs.type = "zoom-updated";
var F = fs, Se = class extends f {
  /** @internal */
  constructor(e, t, i, s, n) {
    super(e), this.originalEvent = t, this.object = i, this.viewerPoint = s, this.userDataKey = n;
  }
}, ws = class gs extends Se {
  /** @internal */
  constructor(t, i, s, n) {
    super(gs.type, t, i, s, n);
  }
};
ws.type = "enter-object";
var bs = ws, Es = class ys extends Se {
  /** @internal */
  constructor(t, i, s, n) {
    super(ys.type, t, i, s, n);
  }
};
Es.type = "leave-object";
var Ye = Es, _s = class xs extends Se {
  /** @internal */
  constructor(t, i, s, n) {
    super(xs.type, t, i, s, n);
  }
};
_s.type = "hover-object";
var Ts = _s, at = class {
  constructor(e) {
    this.viewer = e;
  }
  /**
   * Initializes the adapter
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  /**
   * Destroys the adapter
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {
  }
  /**
   * Indicates if the adapter supports transitions between panoramas
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supportsTransition(e) {
    return !1;
  }
  /**
   * Indicates if the adapter supports preload of a panorama
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supportsPreload(e) {
    return !1;
  }
  /**
   * Converts pixel texture coordinates to spherical radians coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  textureCoordsToSphericalCoords(e, t) {
    throw new v("Current adapter does not support texture coordinates.");
  }
  /**
   * Converts spherical radians coordinates to pixel texture coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sphericalCoordsToTextureCoords(e, t) {
    throw new v("Current adapter does not support texture coordinates.");
  }
};
at.supportsDownload = !1;
function Et(e) {
  if (e) {
    for (const [, t] of [["_", e], ...Object.entries(e)])
      if (t.prototype instanceof at)
        return rt(t.id, t.VERSION, "5.14.3"), t;
  }
  return null;
}
var q = `${W}_touchSupport`, C = {
  /**
   * Indicates if the system data has been loaded
   */
  loaded: !1,
  /**
   * Device screen pixel ratio
   */
  pixelRatio: 1,
  /**
   * Device supports WebGL
   */
  isWebGLSupported: !1,
  /**
   * Maximum WebGL texture width
   */
  maxTextureWidth: 0,
  /**
   * Device supports touch events
   */
  isTouchEnabled: null,
  /**
   * @internal
   */
  __maxCanvasWidth: null,
  /**
   * If the current device is an iPhone
   */
  isIphone: !1,
  /**
   * Maximum canvas width
   */
  get maxCanvasWidth() {
    return this.__maxCanvasWidth === null && (this.__maxCanvasWidth = Hn(this.maxTextureWidth)), this.__maxCanvasWidth;
  },
  /**
   * Loads the system if not already loaded
   * @internal
   */
  load() {
    if (!this.loaded) {
      const e = zn();
      this.pixelRatio = window.devicePixelRatio || 1, this.isWebGLSupported = !!e, this.maxTextureWidth = e ? e.getParameter(e.MAX_TEXTURE_SIZE) : 0, this.isTouchEnabled = Rn(), this.isIphone = /iPhone/i.test(navigator.userAgent), this.loaded = !0;
    }
    if (!C.isWebGLSupported)
      throw new v("WebGL 2 is not supported.");
    if (C.maxTextureWidth === 0)
      throw new v("Unable to detect system capabilities");
  }
};
function zn() {
  try {
    return document.createElement("canvas").getContext("webgl2");
  } catch {
    return null;
  }
}
function Rn() {
  let e = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  q in localStorage && (e = localStorage[q] === "true");
  const t = new Promise((i) => {
    const s = () => {
      window.removeEventListener("mousedown", n), window.removeEventListener("touchstart", r), clearTimeout(a);
    }, n = () => {
      s(), localStorage[q] = !1, i(!1);
    }, r = () => {
      s(), localStorage[q] = !0, i(!0);
    }, o = () => {
      s(), localStorage[q] = e, i(e);
    };
    window.addEventListener("mousedown", n, !1), window.addEventListener("touchstart", r, !1);
    const a = setTimeout(o, 1e4);
  });
  return { initial: e, promise: t };
}
function Hn(e) {
  let t = e, i = !1;
  const s = document.createElement("canvas"), n = s.getContext("2d");
  for (s.width = 1, s.height = 1; t > 1024 && !i; ) {
    const r = document.createElement("canvas"), o = r.getContext("2d");
    r.width = t, r.height = t / 2;
    try {
      o.fillStyle = "white", o.fillRect(t - 1, t / 2 - 1, 1, 1), n.drawImage(r, t - 1, t / 2 - 1, 1, 1, 0, 0, 1, 1), n.getImageData(0, 0, 1, 1).data[0] > 0 && (i = !0);
    } catch {
    }
    r.width = 0, r.height = 0, i || (t /= 2);
  }
  if (i)
    return t;
  throw new v("Unable to detect system capabilities");
}
var Nn = `varying vec3 vWorldPos;
uniform sampler2D map;
uniform float opacity;
uniform vec2 uvOffset;
uniform vec2 uvScale;
uniform float radius;

const float PI = 3.1415926535897932384626433832795;

// Analytic edge antialiasing across one screen-space pixel at the
// cropped-region boundary on a single axis (replaces the MSAA the standard
// adapter gets from rasterizing arc-restricted geometry).
float edgeAlpha(float coord) {
    float dist = min(coord, 1.0 - coord);
    return clamp(dist / fwidth(coord) + 0.5, 0.0, 1.0);
}

void main() {
    // Ray-cast the true sphere from the camera through the (interpolated, on
    // the polygon chord) world position, and use the exit-point direction for
    // sampling. This makes the result independent of mesh tessellation even
    // when the camera is offset from the sphere center (e.g. fisheye config).
    vec3 rayDir = vWorldPos - cameraPosition;
    float a = dot(rayDir, rayDir);
    float b = dot(cameraPosition, rayDir);
    float c = dot(cameraPosition, cameraPosition) - radius * radius;
    float t = (-b + sqrt(max(b * b - a * c, 0.0))) / a;
    vec3 dir = (cameraPosition + t * rayDir) / radius;

    float u = atan(-dir.x, dir.z) / (2.0 * PI) + 0.5;
    float v = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5;
    vec2 uv = (vec2(u, v) - uvOffset) / uvScale;

    float alpha = 1.0;
    if (uvScale.x < 1.0) alpha = min(alpha, edgeAlpha(uv.x));
    if (uvScale.y < 1.0) alpha = min(alpha, edgeAlpha(uv.y));
    if (alpha <= 0.0) discard;

    gl_FragColor = texture2D(map, uv);
    gl_FragColor.a *= opacity * alpha;
}
`, Dn = `varying vec3 vWorldPos;

void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`, Fn = Pe(
  {
    shader: !1,
    resolution: 64,
    useXmpData: !0,
    blur: !1
  },
  {
    resolution: (e) => {
      if (!e || !p.isPowerOfTwo(e))
        throw new v("EquirectangularAdapter resolution must be power of two.");
      return e;
    }
  }
), Ie = class Ms extends at {
  static withConfig(t) {
    return [Ms, t];
  }
  constructor(t, i) {
    super(t), this.config = Fn(i), this.SPHERE_SEGMENTS = this.config.resolution, this.SPHERE_HORIZONTAL_SEGMENTS = this.SPHERE_SEGMENTS / 2;
  }
  supportsTransition() {
    return !0;
  }
  supportsPreload() {
    return !0;
  }
  textureCoordsToSphericalCoords(t, i) {
    if (_(t.textureX) || _(t.textureY))
      throw new v("Texture position is missing 'textureX' or 'textureY'");
    const s = (t.textureX + i.croppedX) / i.fullWidth * Math.PI * 2, n = (t.textureY + i.croppedY) / i.fullHeight * Math.PI;
    return {
      yaw: s >= Math.PI ? s - Math.PI : s + Math.PI,
      pitch: Math.PI / 2 - n
    };
  }
  sphericalCoordsToTextureCoords(t, i) {
    const s = t.yaw / Math.PI / 2 * i.fullWidth, n = t.pitch / Math.PI * i.fullHeight;
    let r = Math.round(t.yaw < Math.PI ? s + i.fullWidth / 2 : s - i.fullWidth / 2) - i.croppedX, o = Math.round(i.fullHeight / 2 - n) - i.croppedY;
    return (r < 0 || r > i.croppedWidth || o < 0 || o > i.croppedHeight) && (r = o = void 0), { textureX: r, textureY: o };
  }
  async loadTexture(t, i = !0, s, n = this.config.useXmpData) {
    if (typeof t != "string" && (typeof t != "object" || !t.path))
      return Promise.reject(new v("Invalid panorama url, are you using the right adapter?"));
    let r;
    typeof t == "string" ? r = {
      path: t,
      data: s
    } : r = {
      data: s,
      ...t
    };
    const o = await this.viewer.textureLoader.loadFile(
      r.path,
      i ? (m) => this.viewer.textureLoader.dispatchProgress(m) : null,
      r.path
    ), a = n ? await this.loadXMP(o) : null, h = await this.viewer.textureLoader.blobToImage(o);
    typeof r.data == "function" && (r.data = r.data(h, a));
    const c = Qt(h.width, h.height, r.data, a), u = this.createEquirectangularTexture(h);
    return {
      panorama: t,
      texture: u,
      panoData: c,
      cacheKey: r.path
    };
  }
  /**
   * Loads the XMP data of an image
   */
  async loadXMP(t) {
    const i = await this.loadBlobAsString(t), s = i.indexOf("<x:xmpmeta");
    if (s === -1)
      return null;
    const n = i.indexOf("</x:xmpmeta>", s);
    if (n === -1)
      return null;
    const r = i.substring(s, n);
    return r.includes("GPano:") ? {
      fullWidth: O(r, "FullPanoWidthPixels"),
      fullHeight: O(r, "FullPanoHeightPixels"),
      croppedWidth: O(r, "CroppedAreaImageWidthPixels"),
      croppedHeight: O(r, "CroppedAreaImageHeightPixels"),
      croppedX: O(r, "CroppedAreaLeftPixels"),
      croppedY: O(r, "CroppedAreaTopPixels"),
      poseHeading: O(r, "PoseHeadingDegrees", !1),
      posePitch: O(r, "PosePitchDegrees", !1),
      poseRoll: O(r, "PoseRollDegrees", !1),
      initialHeading: O(r, "InitialViewHeadingDegrees", !1),
      initialPitch: O(r, "InitialViewPitchDegrees", !1),
      initialFov: O(r, "InitialHorizontalFOVDegrees", !1)
    } : null;
  }
  /**
   * Reads a Blob as a string
   */
  loadBlobAsString(t) {
    return new Promise((i, s) => {
      const n = new FileReader();
      n.onload = () => i(n.result), n.onerror = s, n.readAsText(t);
    });
  }
  /**
   * Creates the final texture from image and panorama data
   */
  createEquirectangularTexture(t) {
    if (this.config.blur || t.width > C.maxTextureWidth) {
      const i = Math.min(1, C.maxCanvasWidth / t.width), s = new OffscreenCanvas(Math.floor(t.width * i), Math.floor(t.height * i)), n = s.getContext("2d");
      return this.config.blur && (n.filter = `blur(${s.width / 2048}px)`), n.drawImage(t, 0, 0, s.width, s.height), We(s);
    }
    return We(t);
  }
  createMesh(t) {
    if (this.config.shader) {
      const i = new we(D, 32, 16).scale(-1, 1, 1), s = {
        map: { value: null },
        opacity: { value: 1 },
        radius: { value: D },
        uvOffset: {
          value: new Ne(
            t.croppedX / t.fullWidth,
            // V is computed bottom-up in the shader (north pole = 1), so
            // the offset is the distance from the bottom of the full pano
            // to the bottom of the cropped region, not the top.
            (t.fullHeight - t.croppedY - t.croppedHeight) / t.fullHeight
          )
        },
        uvScale: {
          value: new Ne(
            t.croppedWidth / t.fullWidth,
            t.croppedHeight / t.fullHeight
          )
        }
      }, n = new $s({
        uniforms: s,
        vertexShader: Dn,
        fragmentShader: Nn,
        depthTest: !1,
        depthWrite: !1,
        transparent: !0
      });
      return new ge(i, n);
    } else {
      const i = t.croppedX / t.fullWidth * 2 * Math.PI, s = t.croppedWidth / t.fullWidth * 2 * Math.PI, n = t.croppedY / t.fullHeight * Math.PI, r = t.croppedHeight / t.fullHeight * Math.PI, o = new we(
        D,
        Math.round(this.SPHERE_SEGMENTS / (2 * Math.PI) * s),
        Math.round(this.SPHERE_HORIZONTAL_SEGMENTS / Math.PI * r),
        -Math.PI / 2 + i,
        s,
        n,
        r
      ).scale(-1, 1, 1), a = new Ke({ depthTest: !1, depthWrite: !1 });
      return new ge(o, a);
    }
  }
  setTexture(t, i) {
    this.config.shader ? t.material.uniforms.map.value = i.texture : t.material.map = i.texture;
  }
  setTextureOpacity(t, i) {
    this.config.shader ? t.material.uniforms.opacity.value = i : (t.material.opacity = i, t.material.transparent = i < 1);
  }
  disposeTexture({ texture: t }) {
    t.dispose();
  }
  disposeMesh(t) {
    t.geometry.dispose(), t.material.dispose();
  }
};
Ie.id = "equirectangular";
Ie.VERSION = "5.14.3";
Ie.supportsDownload = !0;
var ht = Ie, Cs = class Ls extends ht {
  static withConfig(t) {
    return [Ls, t];
  }
  constructor(t, i) {
    super(t, {
      resolution: i?.resolution ?? 64,
      useXmpData: !1
    });
  }
  async loadTexture(t, i) {
    const s = await super.loadTexture(t, i, null, !1);
    return s.panoData = null, s;
  }
  createMesh() {
    const t = new we(
      D,
      this.SPHERE_SEGMENTS,
      this.SPHERE_HORIZONTAL_SEGMENTS
    ).scale(-1, 1, 1).toNonIndexed(), i = t.getAttribute("uv"), s = t.getAttribute("normal");
    for (let r = 0; r < i.count; r++)
      for (let o = 0; o < 3; o++) {
        const a = r * 3 + o, h = s.getX(a), c = s.getY(a), u = s.getZ(a), m = 0.947;
        if (r < i.count / 6) {
          const l = h === 0 && u === 0 ? 1 : Math.acos(c) / Math.sqrt(h * h + u * u) * (2 / Math.PI);
          i.setXY(
            a,
            h * (m / 4) * l + 1 / 4,
            u * (m / 2) * l + 1 / 2
          );
        } else {
          const l = h === 0 && u === 0 ? 1 : Math.acos(-c) / Math.sqrt(h * h + u * u) * (2 / Math.PI);
          i.setXY(
            a,
            -h * (m / 4) * l + 3 / 4,
            u * (m / 2) * l + 1 / 2
          );
        }
      }
    t.rotateX(-Math.PI / 2), t.rotateY(Math.PI);
    const n = new Ke({ depthTest: !1, depthWrite: !1 });
    return new ge(t, n);
  }
};
Cs.id = "dual-fisheye";
Cs.VERSION = "5.14.3";
var Y = class Ps {
  constructor(t, i) {
    this.parent = t, this.children = [], this.state = {
      visible: !0
    }, this.viewer = t instanceof Ps ? t.viewer : t, this.container = document.createElement(i.tagName ?? "div"), this.container.className = i.className || "", this.parent.children.push(this), this.parent.container.appendChild(this.container);
  }
  /**
   * Destroys the component
   */
  destroy() {
    this.parent.container.removeChild(this.container);
    const t = this.parent.children.indexOf(this);
    t !== -1 && this.parent.children.splice(t, 1), this.children.slice().forEach((i) => i.destroy()), this.children.length = 0;
  }
  /**
   * Displays or hides the component
   */
  toggle(t = !this.isVisible()) {
    t ? this.show() : this.hide();
  }
  /**
   * Hides the component
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hide(t) {
    this.container.style.display = "none", this.state.visible = !1;
  }
  /**
   * Displays the component
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  show(t) {
    this.container.style.display = "", this.state.visible = !0;
  }
  /**
   * Checks if the component is visible
   */
  isVisible() {
    return this.state.visible;
  }
}, Un = Pe({
  id: null,
  tagName: null,
  className: null,
  title: null,
  hoverScale: !1,
  collapsable: !1,
  tabbable: !0,
  icon: null,
  iconActive: null
}), S = class extends Y {
  constructor(e, t) {
    super(e, {
      tagName: t.tagName,
      className: `psv-button ${t.hoverScale ? "psv-button--hover-scale" : ""} ${t.className || ""}`
    }), this.state = {
      visible: !0,
      enabled: !0,
      supported: !0,
      collapsed: !1,
      active: !1,
      width: 0
    }, this.config = Un(t), t.id || (this.config.id = this.constructor.id), t.icon && this.__setIcon(t.icon), this.state.width = this.container.offsetWidth, this.config.title ? this.container.title = this.viewer.config.lang[this.config.title] ?? this.config.title : this.id && this.id in this.viewer.config.lang && (this.container.title = this.viewer.config.lang[this.id]), t.tabbable && (this.container.tabIndex = 0), this.container.addEventListener("click", (i) => {
      this.state.enabled && this.onClick(), i.stopPropagation();
    }), this.container.addEventListener("keydown", (i) => {
      i.key === y.Enter && this.state.enabled && (this.onClick(), i.stopPropagation());
    });
  }
  get id() {
    return this.config.id;
  }
  get title() {
    return this.container.title;
  }
  get content() {
    return this.container.innerHTML;
  }
  get width() {
    return this.state.width;
  }
  get collapsable() {
    return this.config.collapsable;
  }
  show(e = !0) {
    this.isVisible() || (this.state.visible = !0, this.state.collapsed || (this.container.style.display = ""), e && this.viewer.navbar.autoSize());
  }
  hide(e = !0) {
    this.isVisible() && (this.state.visible = !1, this.container.style.display = "none", e && this.viewer.navbar.autoSize());
  }
  /**
   * Hides/shows the button depending of the result of {@link isSupported}
   * @internal
   */
  checkSupported() {
    it(this.isSupported(), (e, t) => {
      this.state && (this.state.supported = e, t ? e || this.hide() : this.toggle(e));
    });
  }
  /**
   * Perform action when the navbar size/content changes
   * @internal
   */
  autoSize() {
  }
  /**
   * Checks if the button can be displayed
   */
  isSupported() {
    return !0;
  }
  /**
   * Changes the active state of the button
   */
  toggleActive(e = !this.state.active) {
    e !== this.state.active && (this.state.active = e, Me(this.container, "psv-button--active", this.state.active), this.config.iconActive && this.__setIcon(this.state.active ? this.config.iconActive : this.config.icon));
  }
  /**
   * Disables the button
   */
  disable() {
    this.container.classList.add("psv-button--disabled"), this.state.enabled = !1;
  }
  /**
   * Enables the button
   */
  enable() {
    this.container.classList.remove("psv-button--disabled"), this.state.enabled = !0;
  }
  /**
   * Collapses the button in the navbar menu
   */
  collapse() {
    this.state.collapsed = !0, this.container.style.display = "none";
  }
  /**
   * Uncollapses the button from the navbar menu
   */
  uncollapse() {
    this.state.collapsed = !1, this.state.visible && (this.container.style.display = "");
  }
  __setIcon(e) {
    this.container.innerHTML = e, Je(this.container.querySelector("svg"), "psv-button-svg");
  }
}, jn = class extends S {
  constructor(e, t) {
    super(e, {
      id: t.id ?? `psvButton-${Math.random().toString(36).substring(2)}`,
      className: `psv-custom-button ${t.className || ""}`,
      hoverScale: !1,
      collapsable: t.collapsable !== !1,
      tabbable: t.tabbable !== !1,
      title: t.title
    }), this.customOnClick = t.onClick, t.content && (typeof t.content == "string" ? this.container.innerHTML = t.content : (this.container.classList.add("psv-custom-button--no-padding"), t.content.style.height = "100%", t.content.attachViewer?.(this.viewer), this.container.appendChild(t.content))), this.state.width = this.container.offsetWidth, t.disabled && this.disable(), t.visible === !1 && this.hide();
  }
  onClick() {
    this.customOnClick?.(this.viewer);
  }
}, he = class extends S {
  constructor(e) {
    super(e, {
      className: "psv-description-button",
      hoverScale: !0,
      collapsable: !1,
      tabbable: !0,
      icon: A.info
    }), this.mode = 0, this.viewer.addEventListener(te.type, this), this.viewer.addEventListener(re.type, this), this.viewer.addEventListener(U.type, this), this.viewer.addEventListener(V.type, this), this.viewer.addEventListener(P.type, this);
  }
  destroy() {
    this.viewer.removeEventListener(te.type, this), this.viewer.removeEventListener(re.type, this), this.viewer.removeEventListener(U.type, this), this.viewer.removeEventListener(V.type, this), this.viewer.removeEventListener(P.type, this), super.destroy();
  }
  handleEvent(e) {
    if (e instanceof P) {
      e.containsOptions("description") && this.autoSize(!0);
      return;
    }
    if (!this.mode)
      return;
    let t = !1;
    e instanceof te ? t = this.mode === 1 : e instanceof re ? t = this.mode === 1 && e.notificationId !== T.DESCRIPTION : e instanceof U ? t = this.mode === 2 : e instanceof V && (t = this.mode === 2 && e.panelId !== T.DESCRIPTION), t && (this.toggleActive(!1), this.mode = 0);
  }
  onClick() {
    this.mode ? this.__close() : this.__open();
  }
  hide(e) {
    super.hide(e), this.mode && this.__close();
  }
  /**
   * This button can only be refreshed from NavbarCaption
   * @internal
   */
  autoSize(e = !1) {
    if (e) {
      const t = this.viewer.navbar.getButton("caption", !1), i = t && !t.isVisible(), s = !!this.viewer.config.description;
      i || s ? this.show(!1) : this.hide(!1);
    }
  }
  __close() {
    switch (this.mode) {
      case 1:
        this.viewer.notification.hide(T.DESCRIPTION);
        break;
      case 2:
        this.viewer.panel.hide(T.DESCRIPTION);
        break;
    }
  }
  __open() {
    this.toggleActive(!0), this.viewer.config.description ? (this.mode = 2, this.viewer.panel.show({
      id: T.DESCRIPTION,
      content: `${this.viewer.config.caption ? `<p>${this.viewer.config.caption}</p>` : ""}${this.viewer.config.description}`
    })) : (this.mode = 1, this.viewer.notification.show({
      id: T.DESCRIPTION,
      content: this.viewer.config.caption
    }));
  }
};
he.id = "description";
var Os = class extends S {
  constructor(e) {
    super(e, {
      tagName: "a",
      className: "psv-download-button",
      hoverScale: !0,
      collapsable: !0,
      tabbable: !0,
      icon: A.download
    }), this.viewer.addEventListener(P.type, this), this.viewer.addEventListener($.type, this);
  }
  destroy() {
    this.viewer.removeEventListener(P.type, this), this.viewer.removeEventListener($.type, this), super.destroy();
  }
  handleEvent(e) {
    e instanceof P ? (e.containsOptions("downloadUrl") && this.checkSupported(), e.containsOptions("downloadUrl", "downloadName") && this.__update()) : e instanceof $ && this.__update();
  }
  onClick() {
  }
  checkSupported() {
    this.viewer.adapter.constructor.supportsDownload || this.viewer.config.downloadUrl ? this.show() : this.hide();
  }
  __update() {
    const e = this.container;
    e.href = this.viewer.config.downloadUrl || this.viewer.config.panorama, e.target = "_blank", e.href.startsWith("data:") && !this.viewer.config.downloadName ? e.download = "panorama." + e.href.substring(0, e.href.indexOf(";")).split("/").pop() : e.download = this.viewer.config.downloadName || e.href.split("/").pop();
  }
};
Os.id = "download";
var Ss = class extends S {
  constructor(e) {
    super(e, {
      className: "psv-fullscreen-button",
      hoverScale: !0,
      collapsable: !1,
      tabbable: !0,
      icon: A.fullscreenIn,
      iconActive: A.fullscreenOut
    }), this.viewer.addEventListener(ee.type, this);
  }
  destroy() {
    this.viewer.removeEventListener(ee.type, this), super.destroy();
  }
  handleEvent(e) {
    e instanceof ee && this.toggleActive(e.fullscreenEnabled);
  }
  onClick() {
    this.viewer.toggleFullscreen();
  }
};
Ss.id = "fullscreen";
var Vn = "psvButton", Wn = (e, t) => `
<div class="psv-panel-menu psv-panel-menu--stripped">
  <h1 class="psv-panel-menu-title">${A.menu} ${t}</h1>
  <ul class="psv-panel-menu-list">
    ${e.map(
  (i) => `
    <li data-psv-button="${i.id}" class="psv-panel-menu-item" tabindex="0">
      <span class="psv-panel-menu-item-icon">${i.content}</span>
      <span class="psv-panel-menu-item-label">${i.title}</span>
    </li>
    `
).join("")}
  </ul>
</div>
`, me = class extends S {
  constructor(e) {
    super(e, {
      className: "psv-menu-button",
      hoverScale: !0,
      collapsable: !1,
      tabbable: !0,
      icon: A.menu
    }), this.viewer.addEventListener(V.type, this), this.viewer.addEventListener(U.type, this), super.hide();
  }
  destroy() {
    this.viewer.removeEventListener(V.type, this), this.viewer.removeEventListener(U.type, this), super.destroy();
  }
  handleEvent(e) {
    e instanceof V ? this.toggleActive(e.panelId === T.MENU) : e instanceof U && this.toggleActive(!1);
  }
  onClick() {
    this.state.active ? this.__hideMenu() : this.__showMenu();
  }
  hide(e) {
    super.hide(e), this.__hideMenu();
  }
  show(e) {
    super.show(e), this.state.active && this.__showMenu();
  }
  __showMenu() {
    this.viewer.panel.show({
      id: T.MENU,
      content: Wn(this.viewer.navbar.collapsed, this.viewer.config.lang.menu),
      noMargin: !0,
      clickHandler: (e) => {
        const t = e ? Ht(e, ".psv-panel-menu-item") : void 0, i = t ? t.dataset[Vn] : void 0;
        i && (this.viewer.navbar.getButton(i).onClick(), this.__hideMenu());
      }
    });
  }
  __hideMenu() {
    this.viewer.panel.hide(T.MENU);
  }
};
me.id = "menu";
function Bn(e) {
  let t;
  switch (e) {
    case 0:
      t = 90;
      break;
    case 1:
      t = -90;
      break;
    case 3:
      t = 180;
      break;
    default:
      t = 0;
      break;
  }
  return A.arrow.replace("rotate(0", `rotate(${t}`);
}
var le = class extends S {
  constructor(e, t) {
    super(e, {
      className: "psv-move-button",
      hoverScale: !0,
      collapsable: !1,
      tabbable: !0,
      icon: Bn(t)
    }), this.direction = t, this.handler = new Oe(), this.container.addEventListener("mousedown", this), this.container.addEventListener("keydown", this), this.container.addEventListener("keyup", this), this.viewer.container.addEventListener("mouseup", this), this.viewer.container.addEventListener("touchend", this);
  }
  destroy() {
    this.__onMouseUp(), this.viewer.container.removeEventListener("mouseup", this), this.viewer.container.removeEventListener("touchend", this), super.destroy();
  }
  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        this.__onMouseDown();
        break;
      case "mouseup":
        this.__onMouseUp();
        break;
      case "touchend":
        this.__onMouseUp();
        break;
      case "keydown":
        e.key === y.Enter && this.__onMouseDown();
        break;
      case "keyup":
        e.key === y.Enter && this.__onMouseUp();
        break;
    }
  }
  onClick() {
  }
  isSupported() {
    return Le(C.isTouchEnabled);
  }
  __onMouseDown() {
    if (!this.state.enabled)
      return;
    const e = {};
    switch (this.direction) {
      case 0:
        e.pitch = !1;
        break;
      case 1:
        e.pitch = !0;
        break;
      case 3:
        e.yaw = !1;
        break;
      default:
        e.yaw = !0;
        break;
    }
    this.viewer.stopAll(), this.viewer.dynamics.position.roll(e), this.handler.down();
  }
  __onMouseUp() {
    this.state.enabled && this.handler.up(() => {
      this.viewer.dynamics.position.stop(), this.viewer.resetIdleTimer();
    });
  }
};
le.groupId = "move";
var Is = class extends le {
  constructor(e) {
    super(
      e,
      1
      /* DOWN */
    );
  }
};
Is.id = "moveDown";
var ks = class extends le {
  constructor(e) {
    super(
      e,
      2
      /* LEFT */
    );
  }
};
ks.id = "moveLeft";
var As = class extends le {
  constructor(e) {
    super(
      e,
      3
      /* RIGHT */
    );
  }
};
As.id = "moveRight";
var zs = class extends le {
  constructor(e) {
    super(
      e,
      0
      /* UP */
    );
  }
};
zs.id = "moveUp";
var ct = class extends S {
  constructor(e, t, i) {
    super(e, {
      className: "psv-zoom-button",
      hoverScale: !0,
      collapsable: !1,
      tabbable: !0,
      icon: t
    }), this.direction = i, this.handler = new Oe(), this.container.addEventListener("mousedown", this), this.container.addEventListener("keydown", this), this.container.addEventListener("keyup", this), this.viewer.container.addEventListener("mouseup", this), this.viewer.container.addEventListener("touchend", this);
  }
  destroy() {
    this.__onMouseUp(), this.viewer.container.removeEventListener("mouseup", this), this.viewer.container.removeEventListener("touchend", this), super.destroy();
  }
  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        this.__onMouseDown();
        break;
      case "mouseup":
        this.__onMouseUp();
        break;
      case "touchend":
        this.__onMouseUp();
        break;
      case "keydown":
        e.key === y.Enter && this.__onMouseDown();
        break;
      case "keyup":
        e.key === y.Enter && this.__onMouseUp();
        break;
    }
  }
  onClick() {
  }
  isSupported() {
    return Le(C.isTouchEnabled);
  }
  __onMouseDown() {
    this.state.enabled && (this.viewer.dynamics.zoom.roll(
      this.direction === 1
      /* OUT */
    ), this.handler.down());
  }
  __onMouseUp() {
    this.state.enabled && this.handler.up(() => this.viewer.dynamics.zoom.stop());
  }
};
ct.groupId = "zoom";
var Rs = class extends ct {
  constructor(e) {
    super(
      e,
      A.zoomIn,
      0
      /* IN */
    );
  }
};
Rs.id = "zoomIn";
var Hs = class extends ct {
  constructor(e) {
    super(
      e,
      A.zoomOut,
      1
      /* OUT */
    );
  }
};
Hs.id = "zoomOut";
var lt = class extends S {
  constructor(e) {
    super(e, {
      className: "psv-zoom-range",
      hoverScale: !1,
      collapsable: !1,
      tabbable: !1
    }), this.zoomRange = document.createElement("div"), this.zoomRange.className = "psv-zoom-range-line", this.container.appendChild(this.zoomRange), this.zoomValue = document.createElement("div"), this.zoomValue.className = "psv-zoom-range-handle", this.zoomRange.appendChild(this.zoomValue), this.slider = new ti(this.container, "HORIZONTAL", (t) => this.__onSliderUpdate(t)), this.mediaMinWidth = parseInt(H(this.container, "max-width"), 10), this.viewer.addEventListener(F.type, this), this.viewer.state.ready ? this.__moveZoomValue(this.viewer.getZoomLevel()) : this.viewer.addEventListener(ne.type, this);
  }
  destroy() {
    this.slider.destroy(), this.viewer.removeEventListener(F.type, this), this.viewer.removeEventListener(ne.type, this), super.destroy();
  }
  handleEvent(e) {
    e instanceof F ? this.__moveZoomValue(e.zoomLevel) : e instanceof ne && this.__moveZoomValue(this.viewer.getZoomLevel());
  }
  onClick() {
  }
  isSupported() {
    return Le(C.isTouchEnabled);
  }
  autoSize() {
    this.state.supported && (this.viewer.state.size.width <= this.mediaMinWidth && this.state.visible ? this.hide(!1) : this.viewer.state.size.width > this.mediaMinWidth && !this.state.visible && this.show(!1));
  }
  __moveZoomValue(e) {
    this.zoomValue.style.left = e / 100 * this.zoomRange.offsetWidth - this.zoomValue.offsetWidth / 2 + "px";
  }
  __onSliderUpdate(e) {
    e.mousedown && this.viewer.zoom(e.value * 100);
  }
};
lt.id = "zoomRange";
lt.groupId = "zoom";
var Ns = class extends ii {
  constructor(e) {
    super(), this.viewer = e;
  }
  /**
   * Initializes the plugin
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  /**
   * Destroys the plugin
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {
  }
}, Yn = class extends Ns {
  constructor(e, t) {
    super(e), this.config = this.constructor.configParser(t);
  }
  /**
   * Update options
   */
  setOption(e, t) {
    this.setOptions({ [e]: t });
  }
  /**
   * Update options
   */
  setOptions(e) {
    const t = {
      ...this.config,
      ...e
    }, i = this.constructor, s = i.configParser, n = i.readonlyOptions, r = i.id;
    for (let [o, a] of Object.entries(e)) {
      if (!(o in s.defaults)) {
        M(`${r}: Unknown option "${o}"`);
        continue;
      }
      if (n.includes(o)) {
        M(`${r}: Option "${o}" cannot be updated`);
        continue;
      }
      o in s.parsers && (a = s.parsers[o](a, {
        rawConfig: t,
        defValue: s.defaults[o]
      })), this.config[o] = a;
    }
  }
};
Yn.readonlyOptions = [];
function Xe(e) {
  if (e) {
    for (const [, t] of [["_", e], ...Object.entries(e)])
      if (t.prototype instanceof Ns)
        return rt(t.id, t.VERSION, "5.14.3"), t;
  }
  return null;
}
var G = {
  panorama: null,
  container: null,
  adapter: [ht, null],
  plugins: [],
  caption: null,
  description: null,
  downloadUrl: null,
  downloadName: null,
  loadingImg: null,
  loadingTxt: "",
  // empty string => `lang.loading`
  size: null,
  fisheye: 0,
  minFov: 30,
  maxFov: 90,
  defaultZoomLvl: 50,
  defaultYaw: 0,
  defaultPitch: 0,
  sphereCorrection: null,
  moveSpeed: 1,
  zoomSpeed: 1,
  moveInertia: 0.8,
  mousewheel: !0,
  mousemove: !0,
  mousewheelCtrlKey: !1,
  touchmoveTwoFingers: !1,
  panoData: null,
  requestHeaders: null,
  canvasBackground: "#000",
  defaultTransition: {
    speed: 1500,
    rotation: !0,
    effect: "fade"
  },
  rendererParameters: { alpha: !0, antialias: !0 },
  withCredentials: () => !1,
  navbar: [
    "zoom",
    "move",
    "download",
    "description",
    "caption",
    "fullscreen"
  ],
  lang: {
    zoom: "Zoom",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    moveUp: "Move up",
    moveDown: "Move down",
    moveLeft: "Move left",
    moveRight: "Move right",
    description: "Description",
    download: "Download",
    fullscreen: "Fullscreen",
    loading: "Loading...",
    menu: "Menu",
    close: "Close",
    twoFingers: "Use two fingers to navigate",
    ctrlZoom: "Use ctrl + scroll to zoom the image",
    loadError: "The panorama cannot be loaded",
    webglError: "Your browser does not seem to support WebGL"
  },
  keyboard: "fullscreen",
  keyboardActions: {
    [y.ArrowUp]: "ROTATE_UP",
    [y.ArrowDown]: "ROTATE_DOWN",
    [y.ArrowRight]: "ROTATE_RIGHT",
    [y.ArrowLeft]: "ROTATE_LEFT",
    [y.PageUp]: "ZOOM_IN",
    [y.PageDown]: "ZOOM_OUT",
    [y.Plus]: "ZOOM_IN",
    [y.Minus]: "ZOOM_OUT"
    /* ZOOM_OUT */
  }
}, yt = {
  panorama: "Use setPanorama method to change the panorama",
  panoData: "Use setPanorama method to change the panorama",
  container: "Cannot change viewer container",
  adapter: "Cannot change adapter",
  plugins: "Cannot change plugins"
}, Ze = {
  container: (e) => {
    if (!e)
      throw new v("No value given for container.");
    return e;
  },
  adapter: (e, { defValue: t }) => {
    if (e ? Array.isArray(e) ? e = [Et(e[0]), e[1]] : e = [Et(e), null] : e = t, !e[0])
      throw new v("An undefined value was given for adapter.");
    if (!e[0].id)
      throw new v("Adapter has no id.");
    return e;
  },
  defaultYaw: (e) => R(e),
  defaultPitch: (e) => R(e, !0),
  defaultZoomLvl: (e) => p.clamp(e, 0, 100),
  minFov: (e, { rawConfig: t }) => (t.maxFov < e && (M("maxFov cannot be lower than minFov"), e = t.maxFov), p.clamp(e, 1, 179)),
  maxFov: (e, { rawConfig: t }) => (e < t.minFov && (e = t.minFov), p.clamp(e, 1, 179)),
  moveInertia: (e, { defValue: t }) => e === !0 ? t : e === !1 ? 0 : e,
  lang: (e) => ({
    ...G.lang,
    ...e
  }),
  fisheye: (e) => e === !0 ? 1 : e === !1 ? 0 : p.clamp(e, 0, 2),
  requestHeaders: (e) => e && typeof e == "object" ? () => e : typeof e == "function" ? e : null,
  withCredentials: (e) => typeof e == "boolean" ? () => e : typeof e == "function" ? e : () => !1,
  defaultTransition: (e, { defValue: t }) => e === null || e.speed === 0 ? null : { ...t, ...e },
  rendererParameters: (e, { defValue: t }) => ({
    ...e,
    ...t
  }),
  plugins: (e) => e.map((t, i) => {
    if (Array.isArray(t) ? t = [Xe(t[0]), t[1]] : t = [Xe(t), null], !t[0])
      throw new v(`An undefined value was given for plugin ${i}.`);
    if (!t[0].id)
      throw new v(`Plugin ${i} has no id.`);
    return t;
  }),
  navbar: (e) => e === !1 ? null : e === !0 ? Ce(G.navbar) : typeof e == "string" ? e.split(/[ ,]/) : e
}, Xn = Pe(G, Ze), Z = class extends S {
  constructor(e) {
    super(e, {
      className: "psv-caption",
      hoverScale: !1,
      collapsable: !1,
      tabbable: !0
    }), this.contentWidth = 0, this.state.width = 0, this.contentElt = document.createElement("div"), this.contentElt.className = "psv-caption-content", this.container.appendChild(this.contentElt), this.setCaption(this.viewer.config.caption);
  }
  hide() {
    this.contentElt.style.display = "none", this.state.visible = !1;
  }
  show() {
    this.contentElt.style.display = "", this.state.visible = !0;
  }
  onClick() {
  }
  /**
   * Changes the caption
   */
  setCaption(e) {
    this.show(), this.contentElt.innerHTML = e ?? "", this.contentElt.innerHTML ? this.contentWidth = this.contentElt.offsetWidth : this.contentWidth = 0, this.autoSize();
  }
  /**
   * Toggles content and icon depending on available space
   */
  autoSize() {
    this.toggle(this.container.offsetWidth >= this.contentWidth), this.__refreshButton();
  }
  __refreshButton() {
    this.viewer.navbar.getButton(he.id, !1)?.autoSize(!0);
  }
};
Z.id = "caption";
var $e = {}, Te = {};
function Zn(e, t) {
  if (!e.id)
    throw new v("Button id is required");
  $e[e.id] = e, e.groupId && (Te[e.groupId] = Te[e.groupId] || []).push(e);
}
[
  Hs,
  lt,
  Rs,
  he,
  Z,
  Os,
  Ss,
  ks,
  As,
  zs,
  Is
].forEach((e) => Zn(e));
var $n = class extends Y {
  /**
   * @internal
   */
  constructor(e) {
    super(e, {
      className: `psv-navbar ${ce}`
    }), this.collapsed = [], this.state.visible = !1;
  }
  /**
   * Shows the navbar
   */
  show() {
    this.viewer.container.classList.add("psv--has-navbar"), this.container.classList.add("psv-navbar--open"), this.state.visible = !0;
  }
  /**
   * Hides the navbar
   */
  hide() {
    this.viewer.container.classList.remove("psv--has-navbar"), this.container.classList.remove("psv-navbar--open"), this.state.visible = !1;
  }
  /**
   * Change the buttons visible on the navbar
   */
  setButtons(e) {
    this.children.slice().forEach((t) => t.destroy()), this.children.length = 0, e.indexOf(Z.id) !== -1 && e.indexOf(he.id) === -1 && e.splice(e.indexOf(Z.id), 0, he.id), e.forEach((t) => {
      typeof t == "object" ? new jn(this, t) : $e[t] ? new $e[t](this) : Te[t] ? Te[t].forEach((i) => {
        new i(this);
      }) : M(`Unknown button ${t}`);
    }), new me(this), this.children.forEach((t) => {
      t instanceof S && t.checkSupported();
    }), this.autoSize();
  }
  /**
   * Changes the navbar caption
   */
  setCaption(e) {
    this.children.some((t) => t instanceof Z ? (t.setCaption(e), !0) : !1);
  }
  /**
   * Returns a button by its identifier
   */
  getButton(e, t = !0) {
    const i = this.children.find((s) => s instanceof S && s.id === e);
    return !i && t && M(`button "${e}" not found in the navbar`), i;
  }
  /**
   * Try to focus a button, will focus the first button if the requested button does not exist.
   */
  focusButton(e) {
    this.isVisible() && (this.getButton(e, !1)?.container || this.container.firstElementChild)?.focus();
  }
  /**
   * Automatically collapses buttons
   * @internal
   */
  autoSize() {
    this.children.forEach((s) => {
      s instanceof S && s.autoSize();
    });
    const e = this.container.offsetWidth;
    let t = 0;
    const i = [];
    this.children.forEach((s) => {
      s.isVisible() && s instanceof S && (t += s.width, s.collapsable && i.push(s));
    }), t !== 0 && (e < t && i.length > 0 ? (i.forEach((s) => s.collapse()), this.collapsed = i, this.getButton(me.id).show(!1)) : e >= t && this.collapsed.length > 0 && (this.collapsed.forEach((s) => s.uncollapse()), this.collapsed = [], this.getButton(me.id).hide(!1)), this.getButton(Z.id, !1)?.autoSize());
  }
};
De.enabled = !1;
var X = {
  enabled: !0,
  maxItems: 10,
  ttl: 600,
  items: {},
  purgeInterval: null,
  init() {
    De.enabled && (M("ThreeJS cache should be disabled"), De.enabled = !1), !this.purgeInterval && this.enabled && (this.purgeInterval = setInterval(() => this.purge(), 60 * 1e3));
  },
  add(e, t, i) {
    this.enabled && t && (this.items[t] = this.items[t] ?? { files: {}, lastAccess: null }, this.items[t].files[e] = i, this.items[t].lastAccess = Date.now());
  },
  get(e, t) {
    if (this.enabled && t && this.items[t])
      return this.items[t].lastAccess = Date.now(), this.items[t].files[e];
  },
  remove(e, t) {
    this.enabled && t && this.items[t] && (delete this.items[t].files[e], Object.keys(this.items[t].files).length === 0 && delete this.items[t]);
  },
  purge() {
    Object.entries(this.items).sort(([, e], [, t]) => t.lastAccess - e.lastAccess).forEach(([e, { lastAccess: t }], i) => {
      i > 0 && (Date.now() - t >= this.ttl * 1e3 || i >= this.maxItems) && delete this.items[e];
    });
  }
}, Gn = class extends Y {
  /**
   * @internal
   */
  constructor(e) {
    super(e, { className: "psv-loader-container" }), this.loader = document.createElement("div"), this.loader.className = "psv-loader", this.container.appendChild(this.loader), this.size = this.loader.offsetWidth, this.canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.canvas.setAttribute("class", "psv-loader-canvas"), this.canvas.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), this.loader.appendChild(this.canvas), this.textColor = H(this.loader, "color"), this.color = H(this.canvas, "color"), this.border = parseInt(H(this.loader, "--psv-loader-border"), 10), this.thickness = parseInt(H(this.loader, "--psv-loader-tickness"), 10);
    const t = this.size / 2;
    this.canvas.innerHTML = `
            <circle cx="${t}" cy="${t}" r="${t}" fill="${this.color}"/>
            <path d="" fill="none" stroke="${this.textColor}" stroke-width="${this.thickness}" stroke-linecap="round"/>
        `, this.viewer.addEventListener(P.type, this), this.__updateContent(), this.hide();
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(P.type, this), super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    e instanceof P && e.containsOptions("loadingImg", "loadingTxt", "lang") && this.__updateContent();
  }
  /**
   * Sets the loader progression
   */
  setProgress(e) {
    this.container.classList.remove("psv-loader--undefined");
    const t = p.clamp(e, 0, 99.999) / 100 * Math.PI * 2, i = this.size / 2, s = i, n = this.thickness / 2 + this.border, r = (this.size - this.thickness) / 2 - this.border, o = Math.sin(t) * r + i, a = -Math.cos(t) * r + i, h = e > 50 ? "1" : "0";
    this.canvas.querySelector("path").setAttributeNS(
      null,
      "d",
      `M ${s} ${n} A ${r} ${r} 0 ${h} 1 ${o} ${a}`
    );
  }
  /**
   * Animates the loader with an unknown state
   */
  showUndefined() {
    this.show(), this.setProgress(25), this.container.classList.add("psv-loader--undefined");
  }
  __updateContent() {
    const e = this.loader.querySelector(".psv-loader-image, .psv-loader-text");
    e && this.loader.removeChild(e);
    let t;
    if (this.viewer.config.loadingImg ? (t = document.createElement("img"), t.className = "psv-loader-image", t.src = this.viewer.config.loadingImg) : this.viewer.config.loadingTxt !== null && (t = document.createElement("div"), t.className = "psv-loader-text", t.innerHTML = this.viewer.config.loadingTxt || this.viewer.config.lang.loading), t) {
      const i = Math.round(Math.sqrt(2 * Math.pow(this.size / 2 - this.thickness / 2 - this.border, 2)));
      t.style.maxWidth = i + "px", t.style.maxHeight = i + "px", this.loader.appendChild(t);
    }
  }
}, qn = class extends Y {
  /**
   * @internal
   */
  constructor(e) {
    super(e, {
      className: "psv-notification"
    }), this.state = {
      visible: !1,
      contentId: null,
      timeout: null
    }, this.content = document.createElement("div"), this.content.className = "psv-notification-content", this.container.appendChild(this.content), this.content.addEventListener("click", () => this.hide());
  }
  /**
   * Checks if the notification is visible
   */
  isVisible(e) {
    return this.state.visible && (!e || !this.state.contentId || this.state.contentId === e);
  }
  /**
   * @throws {@link PSVError} always
   * @internal
   */
  toggle() {
    throw new v("Notification cannot be toggled");
  }
  /**
   * Displays a notification on the viewer
   *
   * @example
   * viewer.showNotification({ content: 'Hello world', timeout: 5000 })
   * @example
   * viewer.showNotification('Hello world')
   */
  show(e) {
    this.state.timeout && (clearTimeout(this.state.timeout), this.state.timeout = null), typeof e == "string" && (e = { content: e }), this.state.contentId = e.id || null, this.content.innerHTML = e.content, this.container.classList.add("psv-notification--visible"), this.state.visible = !0, this.viewer.dispatchEvent(new re(this.state.contentId)), e.timeout && (this.state.timeout = setTimeout(() => this.hide(this.state.contentId), e.timeout));
  }
  /**
   * Hides the notification
   */
  hide(e) {
    if (this.isVisible(e)) {
      const t = this.state.contentId;
      this.container.classList.remove("psv-notification--visible"), this.state.visible = !1, this.state.contentId = null, this.viewer.dispatchEvent(new te(t));
    }
  }
}, Kn = class extends Y {
  /**
   * @internal
   */
  constructor(e) {
    super(e, {
      className: `psv-overlay ${ce}`
    }), this.state = {
      visible: !1,
      contentId: null,
      dismissible: !0
    }, this.image = document.createElement("div"), this.image.className = "psv-overlay-image", this.container.appendChild(this.image), this.title = document.createElement("div"), this.title.className = "psv-overlay-title", this.container.appendChild(this.title), this.text = document.createElement("div"), this.text.className = "psv-overlay-text", this.container.appendChild(this.text), this.container.addEventListener("click", this), this.viewer.addEventListener(j.type, this), super.hide();
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(j.type, this), super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    e.type === "click" ? this.isVisible() && this.state.dismissible && (this.hide(), e.stopPropagation()) : e instanceof j && this.isVisible() && this.state.dismissible && e.matches(y.Escape) && (this.hide(), e.preventDefault());
  }
  /**
   * Checks if the overlay is visible
   */
  isVisible(e) {
    return this.state.visible && (!e || !this.state.contentId || this.state.contentId === e);
  }
  /**
   * @throws {@link PSVError} always
   * @internal
   */
  toggle() {
    throw new v("Overlay cannot be toggled");
  }
  /**
   * Displays an overlay on the viewer
   */
  show(e) {
    typeof e == "string" && (e = { title: e }), this.state.contentId = e.id || null, this.state.dismissible = e.dismissible !== !1, this.image.innerHTML = e.image || "", this.title.innerHTML = e.title || "", this.text.innerHTML = e.text || "", super.show(), this.viewer.dispatchEvent(new rs(this.state.contentId));
  }
  /**
   * Hides the overlay
   */
  hide(e) {
    if (this.isVisible(e)) {
      const t = this.state.contentId;
      super.hide(), this.state.contentId = null, this.viewer.dispatchEvent(new Ti(t));
    }
  }
}, Qn = 200, He = "psv-panel-content--no-interaction", Jn = class extends Y {
  /**
   * @internal
   */
  constructor(e) {
    super(e, {
      className: `psv-panel ${ce}`
    }), this.state = {
      visible: !1,
      contentId: null,
      mouseX: 0,
      mouseY: 0,
      mousedown: !1,
      clickHandler: null,
      keyHandler: null,
      width: {}
    };
    const t = document.createElement("div");
    t.className = "psv-panel-resizer", this.container.appendChild(t);
    const i = document.createElement("div");
    i.className = "psv-panel-close-button", i.innerHTML = A.close, i.title = e.config.lang.close, this.container.appendChild(i), this.content = document.createElement("div"), this.content.className = "psv-panel-content", this.container.appendChild(this.content), i.addEventListener("click", () => this.hide()), t.addEventListener("mousedown", this), t.addEventListener("touchstart", this), this.viewer.container.addEventListener("mouseup", this), this.viewer.container.addEventListener("touchend", this), this.viewer.container.addEventListener("mousemove", this), this.viewer.container.addEventListener("touchmove", this), this.viewer.addEventListener(j.type, this);
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(j.type, this), this.viewer.container.removeEventListener("mousemove", this), this.viewer.container.removeEventListener("touchmove", this), this.viewer.container.removeEventListener("mouseup", this), this.viewer.container.removeEventListener("touchend", this), super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        this.__onMouseDown(e);
        break;
      case "touchstart":
        this.__onTouchStart(e);
        break;
      case "mousemove":
        this.__onMouseMove(e);
        break;
      case "touchmove":
        this.__onTouchMove(e);
        break;
      case "mouseup":
        this.__onMouseUp(e);
        break;
      case "touchend":
        this.__onTouchEnd(e);
        break;
      case j.type:
        this.__onKeyPress(e);
        break;
    }
  }
  /**
   * Checks if the panel is visible
   */
  isVisible(e) {
    return this.state.visible && (!e || !this.state.contentId || this.state.contentId === e);
  }
  /**
   * @throws {@link PSVError} always
   * @internal
   */
  toggle() {
    throw new v("Panel cannot be toggled");
  }
  /**
   * Shows the panel
   */
  show(e) {
    typeof e == "string" && (e = { content: e });
    const t = this.isVisible(e.id);
    this.state.contentId = e.id || null, this.state.visible = !0, this.state.clickHandler && (this.content.removeEventListener("click", this.state.clickHandler), this.content.removeEventListener("keydown", this.state.keyHandler), this.state.clickHandler = null, this.state.keyHandler = null), e.id && this.state.width[e.id] ? this.container.style.width = this.state.width[e.id] : e.width ? this.container.style.width = e.width : this.container.style.width = null, this.content.innerHTML = e.content, this.content.scrollTop = 0, this.container.classList.add("psv-panel--open"), Me(this.content, "psv-panel-content--no-margin", e.noMargin === !0), e.clickHandler && (this.state.clickHandler = (i) => {
      e.clickHandler(be(i));
    }, this.state.keyHandler = (i) => {
      i.key === y.Enter && e.clickHandler(be(i));
    }, this.content.addEventListener("click", this.state.clickHandler), this.content.addEventListener("keydown", this.state.keyHandler), t || setTimeout(() => {
      this.content.querySelector("a,button,[tabindex]")?.focus();
    }, 300)), this.viewer.dispatchEvent(new V(this.state.contentId));
  }
  /**
   * Hides the panel
   */
  hide(e) {
    if (this.isVisible(e)) {
      const t = this.state.contentId;
      this.state.visible = !1, this.state.contentId = null, this.content.innerHTML = null, this.container.classList.remove("psv-panel--open"), this.state.clickHandler && (this.content.removeEventListener("click", this.state.clickHandler), this.content.removeEventListener("keydown", this.state.keyHandler), this.state.clickHandler = null, this.state.keyHandler = null), this.viewer.dispatchEvent(new U(t));
    }
  }
  __onMouseDown(e) {
    e.stopPropagation(), this.__startResize(e.clientX, e.clientY);
  }
  __onTouchStart(e) {
    if (e.stopPropagation(), e.touches.length === 1) {
      const t = e.touches[0];
      this.__startResize(t.clientX, t.clientY);
    }
  }
  __onMouseUp(e) {
    this.state.mousedown && (e.stopPropagation(), this.state.mousedown = !1, this.content.classList.remove(He));
  }
  __onTouchEnd(e) {
    this.state.mousedown && (e.stopPropagation(), e.touches.length === 0 && (this.state.mousedown = !1, this.content.classList.remove(He)));
  }
  __onMouseMove(e) {
    this.state.mousedown && (e.stopPropagation(), this.__resize(e.clientX, e.clientY));
  }
  __onTouchMove(e) {
    if (this.state.mousedown) {
      const t = e.touches[0];
      this.__resize(t.clientX, t.clientY);
    }
  }
  __onKeyPress(e) {
    this.isVisible() && e.matches(y.Escape) && (this.hide(), e.preventDefault());
  }
  __startResize(e, t) {
    this.state.mouseX = e, this.state.mouseY = t, this.state.mousedown = !0, this.content.classList.add(He);
  }
  __resize(e, t) {
    const i = e, s = t, n = Math.max(Qn, this.container.offsetWidth - (i - this.state.mouseX)) + "px";
    this.state.contentId && (this.state.width[this.state.contentId] = n), this.container.style.width = n, this.state.mouseX = i, this.state.mouseY = s;
  }
}, er = class extends Y {
  /**
   * @internal
   */
  constructor(e, t) {
    super(e, {
      className: "psv-tooltip"
    }), this.state = {
      visible: !0,
      arrow: 0,
      border: 0,
      state: 0,
      width: 0,
      height: 0,
      pos: "",
      config: null,
      data: null,
      hideTimeout: null
    }, this.content = document.createElement("div"), this.content.className = "psv-tooltip-content", this.container.appendChild(this.content), this.arrow = document.createElement("div"), this.arrow.className = "psv-tooltip-arrow", this.container.appendChild(this.arrow), this.container.addEventListener("transitionend", this), this.container.addEventListener("touchdown", (i) => i.stopPropagation()), this.container.addEventListener("mousedown", (i) => i.stopPropagation()), this.container.style.top = "-1000px", this.container.style.left = "-1000px", this.show(t);
  }
  /**
   * @internal
   */
  handleEvent(e) {
    e.type === "transitionend" && this.__onTransitionEnd(e);
  }
  /**
   * @internal
   */
  destroy() {
    clearTimeout(this.state.hideTimeout), delete this.state.data, super.destroy();
  }
  /**
   * @throws {@link PSVError} always
   * @internal
   */
  toggle() {
    throw new v("Tooltip cannot be toggled");
  }
  /**
   * Displays the tooltip on the viewer
   * @internal
   */
  show(e) {
    if (this.state.state !== 0)
      throw new v("Initialized tooltip cannot be re-initialized");
    e.className && Je(this.container, e.className), e.style && Object.assign(this.container.style, e.style), this.state.state = 3, this.update(e.content, e), this.state.data = e.data, this.state.state = 1, this.viewer.dispatchEvent(new ls(this, this.state.data)), this.__waitImages();
  }
  /**
   * Updates the content of the tooltip, optionally with a new position
   * @throws {@link PSVError} if the configuration is invalid
   */
  update(e, t) {
    this.content.innerHTML = e;
    const i = this.container.getBoundingClientRect();
    this.state.width = i.right - i.left, this.state.height = i.bottom - i.top, this.state.arrow = parseInt(H(this.arrow, "border-top-width"), 10), this.state.border = parseInt(H(this.container, "border-top-left-radius"), 10), this.move(t ?? this.state.config), this.__waitImages();
  }
  /**
   * Moves the tooltip to a new position
   * @throws {@link PSVError} if the configuration is invalid
   */
  move(e) {
    if (this.state.state !== 1 && this.state.state !== 3)
      throw new v("Uninitialized tooltip cannot be moved");
    e.box = e.box ?? this.state.config?.box ?? { width: 0, height: 0 }, this.state.config = e;
    const t = this.container, i = this.arrow, s = {
      posClass: $t(e.position, { allowCenter: !1, cssOrder: !1 }) || ["top", "center"],
      width: this.state.width,
      height: this.state.height,
      top: 0,
      left: 0,
      arrowTop: 0,
      arrowLeft: 0
    };
    this.__computeTooltipPosition(s, e);
    let n = null, r = null;
    if (s.top < 0 ? n = "bottom" : s.top + s.height > this.viewer.state.size.height && (n = "top"), s.left < 0 ? r = "right" : s.left + s.width > this.viewer.state.size.width && (r = "left"), r || n) {
      const a = nt(s.posClass);
      n && (s.posClass[a ? 0 : 1] = n), r && (s.posClass[a ? 1 : 0] = r), this.__computeTooltipPosition(s, e);
    }
    t.style.top = s.top + "px", t.style.left = s.left + "px", i.style.top = s.arrowTop + "px", i.style.left = s.arrowLeft + "px";
    const o = s.posClass.join("-");
    o !== this.state.pos && (t.classList.remove(`psv-tooltip--${this.state.pos}`), this.state.pos = o, t.classList.add(`psv-tooltip--${this.state.pos}`));
  }
  /**
   * Hides the tooltip
   */
  hide() {
    this.container.classList.remove("psv-tooltip--visible"), this.state.state = 2, this.viewer.dispatchEvent(new Oi(this.state.data));
    const e = parseFloat(H(this.container, "transition-duration"));
    this.state.hideTimeout = setTimeout(() => {
      this.destroy();
    }, e * 2);
  }
  /**
   * Finalize transition
   */
  __onTransitionEnd(e) {
    if (e.propertyName === "transform")
      switch (this.state.state) {
        case 1:
          this.container.classList.add("psv-tooltip--visible"), this.state.state = 3;
          break;
        case 2:
          this.state.state = 0, this.destroy();
          break;
      }
  }
  /**
   * Computes the position of the tooltip and its arrow
   */
  __computeTooltipPosition(e, t) {
    const i = this.state.arrow, s = t.top, n = e.height, r = t.left, o = e.width, a = i + this.state.border, h = t.box.width / 2 + i * 2, c = t.box.height / 2 + i * 2;
    switch (e.posClass.join("-")) {
      case "top-left":
        e.top = s - c - n, e.left = r + a - o, e.arrowTop = n, e.arrowLeft = o - a - i;
        break;
      case "top-center":
        e.top = s - c - n, e.left = r - o / 2, e.arrowTop = n, e.arrowLeft = o / 2 - i;
        break;
      case "top-right":
        e.top = s - c - n, e.left = r - a, e.arrowTop = n, e.arrowLeft = i;
        break;
      case "bottom-left":
        e.top = s + c, e.left = r + a - o, e.arrowTop = -i * 2, e.arrowLeft = o - a - i;
        break;
      case "bottom-center":
        e.top = s + c, e.left = r - o / 2, e.arrowTop = -i * 2, e.arrowLeft = o / 2 - i;
        break;
      case "bottom-right":
        e.top = s + c, e.left = r - a, e.arrowTop = -i * 2, e.arrowLeft = i;
        break;
      case "left-top":
        e.top = s + a - n, e.left = r - h - o, e.arrowTop = n - a - i, e.arrowLeft = o;
        break;
      case "center-left":
        e.top = s - n / 2, e.left = r - h - o, e.arrowTop = n / 2 - i, e.arrowLeft = o;
        break;
      case "left-bottom":
        e.top = s - a, e.left = r - h - o, e.arrowTop = i, e.arrowLeft = o;
        break;
      case "right-top":
        e.top = s + a - n, e.left = r + h, e.arrowTop = n - a - i, e.arrowLeft = -i * 2;
        break;
      case "center-right":
        e.top = s - n / 2, e.left = r + h, e.arrowTop = n / 2 - i, e.arrowLeft = -i * 2;
        break;
      case "right-bottom":
        e.top = s - a, e.left = r + h, e.arrowTop = i, e.arrowLeft = -i * 2;
        break;
    }
  }
  /**
   * If the tooltip contains images, recompute its size once they are loaded
   */
  __waitImages() {
    const e = this.content.querySelectorAll("img");
    if (e.length > 0) {
      const t = [];
      e.forEach((i) => {
        i.complete || t.push(
          new Promise((s) => {
            i.onload = s, i.onerror = s;
          })
        );
      }), t.length && Promise.all(t).then(() => {
        if (this.state.state === 1 || this.state.state === 3) {
          const i = this.container.getBoundingClientRect();
          this.state.width = i.right - i.left, this.state.height = i.bottom - i.top, this.move(this.state.config);
        }
      });
    }
  }
}, tr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 15 70 70"><path fill="currentColor" d="M50,16.2c-18.6,0-33.8,15.1-33.8,33.8S31.4,83.7,50,83.7S83.8,68.6,83.8,50S68.6,16.2,50,16.2z M50,80.2c-16.7,0-30.2-13.6-30.2-30.2S33.3,19.7,50,19.7S80.3,33.3,80.3,50S66.7,80.2,50,80.2z"/><rect fill="currentColor" x="48" y="31.7" width="4" height="28"/><rect fill="currentColor" x="48" y="63.2" width="4" height="5"/><!--Created by Shastry from the Noun Project--></svg>
`, de = class {
  /**
   * @internal
   */
  constructor(e) {
    this.viewer = e, this.config = e.config, this.state = e.state;
  }
  /**
   * Destroys the service
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {
  }
}, k = new B(), pe = new rn(0, 0, 0, "ZXY"), ir = class extends de {
  /**
   * @internal
   */
  constructor(e) {
    super(e);
  }
  /**
   * Converts vertical FOV to zoom level
   */
  fovToZoomLevel(e) {
    const t = Math.round((e - this.config.minFov) / (this.config.maxFov - this.config.minFov) * 100);
    return p.clamp(t - 2 * (t - 50), 0, 100);
  }
  /**
   * Converts zoom level to vertical FOV
   */
  zoomLevelToFov(e) {
    return this.config.maxFov + e / 100 * (this.config.minFov - this.config.maxFov);
  }
  /**
   * Converts vertical FOV to horizontal FOV
   */
  vFovToHFov(e) {
    return p.radToDeg(2 * Math.atan(Math.tan(p.degToRad(e) / 2) * this.state.aspect));
  }
  /**
   * Converts horizontal FOV to vertical FOV
   */
  hFovToVFov(e) {
    return p.radToDeg(2 * Math.atan(Math.tan(p.degToRad(e) / 2) / this.state.aspect));
  }
  /**
   * @internal
   */
  getAnimationProperties(e, t, i) {
    const s = !_(t), n = !_(i), r = {};
    let o = null;
    if (s) {
      const a = this.viewer.getPosition(), h = At(a.yaw, t.yaw);
      r.yaw = { start: a.yaw, end: a.yaw + h }, r.pitch = { start: a.pitch, end: t.pitch }, o = Ve(e, zt(a, t));
    }
    if (n) {
      const a = this.viewer.getZoomLevel(), h = Math.abs(i - a);
      r.zoom = { start: a, end: i }, o === null && (o = Ve(e, Math.PI / 4 * h / 100));
    }
    return o === null ? typeof e == "number" ? o = e : o = Fe : o = Math.max(Fe, o), { duration: o, properties: r };
  }
  /**
   * @internal
   */
  getTransitionOptions(e) {
    let t;
    const i = this.config.defaultTransition ?? G.defaultTransition;
    return e.transition === !1 || e.transition === null ? t = null : e.transition === !0 ? t = {
      ...i
    } : typeof e.transition == "object" ? t = {
      ...i,
      ...e.transition
    } : t = this.config.defaultTransition, t;
  }
  /**
   * Converts pixel texture coordinates to spherical radians coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  textureCoordsToSphericalCoords(e) {
    if (!this.state.textureData?.panoData)
      throw new v("Current adapter does not support texture coordinates or no texture has been loaded");
    const t = this.viewer.adapter.textureCoordsToSphericalCoords(e, this.state.textureData.panoData);
    return !pe.equals(this.viewer.renderer.panoramaPose) || !pe.equals(this.viewer.renderer.sphereCorrection) ? (this.sphericalCoordsToVector3(t, k), k.applyEuler(this.viewer.renderer.panoramaPose), k.applyEuler(this.viewer.renderer.sphereCorrection), this.vector3ToSphericalCoords(k)) : t;
  }
  /**
   * Converts spherical radians coordinates to pixel texture coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  sphericalCoordsToTextureCoords(e) {
    if (!this.state.textureData?.panoData)
      throw new v("Current adapter does not support texture coordinates or no texture has been loaded");
    return (!pe.equals(this.viewer.renderer.panoramaPose) || !pe.equals(this.viewer.renderer.sphereCorrection)) && (this.sphericalCoordsToVector3(e, k), Be(k, this.viewer.renderer.sphereCorrection), Be(k, this.viewer.renderer.panoramaPose), e = this.vector3ToSphericalCoords(k)), this.viewer.adapter.sphericalCoordsToTextureCoords(e, this.state.textureData.panoData);
  }
  /**
   * Converts spherical radians coordinates to a Vector3
   */
  sphericalCoordsToVector3(e, t, i = D) {
    return t || (t = new B()), t.x = i * -Math.cos(e.pitch) * Math.sin(e.yaw), t.y = i * Math.sin(e.pitch), t.z = i * Math.cos(e.pitch) * Math.cos(e.yaw), t;
  }
  /**
   * Converts a Vector3 to spherical radians coordinates
   */
  vector3ToSphericalCoords(e) {
    const t = Math.acos(e.y / Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z)), i = Math.atan2(e.x, e.z);
    return {
      yaw: i < 0 ? -i : Math.PI * 2 - i,
      pitch: Math.PI / 2 - t
    };
  }
  /**
   * Converts position on the viewer to a THREE.Vector3
   */
  viewerCoordsToVector3(e) {
    const t = this.viewer.renderer.getIntersections(e).filter((i) => i.object.userData[W]);
    return t.length ? t[0].point : null;
  }
  /**
   * Converts position on the viewer to spherical radians coordinates
   */
  viewerCoordsToSphericalCoords(e) {
    const t = this.viewerCoordsToVector3(e);
    return t ? this.vector3ToSphericalCoords(t) : null;
  }
  /**
   * Converts a Vector3 to position on the viewer
   */
  vector3ToViewerCoords(e) {
    const t = e.clone();
    return t.project(this.viewer.renderer.camera), {
      x: Math.round((t.x + 1) / 2 * this.state.size.width),
      y: Math.round((1 - t.y) / 2 * this.state.size.height)
    };
  }
  /**
   * Converts spherical radians coordinates to position on the viewer
   */
  sphericalCoordsToViewerCoords(e) {
    return this.sphericalCoordsToVector3(e, k), this.vector3ToViewerCoords(k);
  }
  /**
   * @internal
   */
  isPointVisible(e) {
    let t, i;
    if (e instanceof B)
      t = e, i = this.vector3ToViewerCoords(e);
    else if (st(e))
      t = this.sphericalCoordsToVector3(e, k), i = this.vector3ToViewerCoords(t);
    else
      return !1;
    return t.dot(this.viewer.state.direction) > 0 && i.x >= 0 && i.x <= this.viewer.state.size.width && i.y >= 0 && i.y <= this.viewer.state.size.height;
  }
  /**
   * Converts pixel position to angles if present and ensure boundaries
   */
  cleanPosition(e) {
    if ("yaw" in e || "pitch" in e) {
      if (!("yaw" in e) || !("pitch" in e))
        throw new v("Position is missing 'yaw' or 'pitch'");
      return {
        yaw: R(e.yaw),
        pitch: R(e.pitch, !0)
      };
    } else
      return this.textureCoordsToSphericalCoords(e);
  }
  /**
   * Ensure a SphereCorrection object is valid
   */
  cleanSphereCorrection(e) {
    return {
      pan: R(e?.pan || 0),
      tilt: R(e?.tilt || 0, !0),
      roll: R(e?.roll || 0, !0, !1)
    };
  }
  /**
   * Parse the pose angles of the pano data
   */
  cleanPanoramaPose(e) {
    return {
      pan: p.degToRad(e?.poseHeading || 0),
      tilt: p.degToRad(e?.posePitch || 0),
      roll: p.degToRad(e?.poseRoll || 0)
    };
  }
  /**
   * Update the panorama options if the panorama files contains "InitialView" metadata
   */
  cleanPanoramaOptions(e, t) {
    return t?.isEquirectangular && (_(e.zoom) && !_(t.initialFov) && (e = {
      ...e,
      zoom: this.fovToZoomLevel(this.hFovToVFov(t.initialFov))
    }), _(e.position) && !_(t.initialHeading) && !_(t.initialPitch) && (e = {
      ...e,
      position: {
        yaw: R(t.initialHeading),
        pitch: R(t.initialPitch, !0)
      }
    })), e;
  }
}, sr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M33.38 33.2a1.96 1.96 0 0 0 1.5-3.23 10.61 10.61 0 0 1 7.18-17.51c.7-.06 1.31-.49 1.61-1.12a13.02 13.02 0 0 1 11.74-7.43c7.14 0 12.96 5.8 12.96 12.9 0 3.07-1.1 6.05-3.1 8.38-.7.82-.61 2.05.21 2.76.83.7 2.07.6 2.78-.22a16.77 16.77 0 0 0 4.04-10.91C72.3 7.54 64.72 0 55.4 0a16.98 16.98 0 0 0-14.79 8.7 14.6 14.6 0 0 0-12.23 14.36c0 3.46 1.25 6.82 3.5 9.45.4.45.94.69 1.5.69m45.74 43.55a22.13 22.13 0 0 1-5.23 12.4c-4 4.55-9.53 6.86-16.42 6.86-12.6 0-20.1-10.8-20.17-10.91a1.82 1.82 0 0 0-.08-.1c-5.3-6.83-14.55-23.82-17.27-28.87-.05-.1 0-.21.02-.23a6.3 6.3 0 0 1 8.24 1.85l9.38 12.59a1.97 1.97 0 0 0 3.54-1.17V25.34a4 4 0 0 1 1.19-2.87 3.32 3.32 0 0 1 2.4-.95c1.88.05 3.4 1.82 3.4 3.94v24.32a1.96 1.96 0 0 0 3.93 0v-33.1a3.5 3.5 0 0 1 7 0v35.39a1.96 1.96 0 0 0 3.93 0v-.44c.05-2.05 1.6-3.7 3.49-3.7 1.93 0 3.5 1.7 3.5 3.82v5.63c0 .24.04.48.13.71l.1.26a1.97 1.97 0 0 0 3.76-.37c.33-1.78 1.77-3.07 3.43-3.07 1.9 0 3.45 1.67 3.5 3.74l-1.77 18.1zM77.39 51c-1.25 0-2.45.32-3.5.9v-.15c0-4.27-3.33-7.74-7.42-7.74-1.26 0-2.45.33-3.5.9V16.69a7.42 7.42 0 0 0-14.85 0v1.86a7 7 0 0 0-3.28-.94 7.21 7.21 0 0 0-5.26 2.07 7.92 7.92 0 0 0-2.38 5.67v37.9l-5.83-7.82a10.2 10.2 0 0 0-13.35-2.92 4.1 4.1 0 0 0-1.53 5.48C20 64.52 28.74 80.45 34.07 87.34c.72 1.04 9.02 12.59 23.4 12.59 7.96 0 14.66-2.84 19.38-8.2a26.06 26.06 0 0 0 6.18-14.6l1.78-18.2v-.2c0-4.26-3.32-7.73-7.42-7.73z"/><!--Created by AomAm from the Noun Project--></svg>
`, nr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 17 79 79"><path fill="currentColor" d="M38.1 29.27c-.24 0-.44.2-.44.45v10.7a.45.45 0 00.9 0v-10.7c0-.25-.2-.45-.45-.45zm10.2 26.66a11.54 11.54 0 01-8.48-6.14.45.45 0 10-.8.41 12.45 12.45 0 009.22 6.62.45.45 0 00.07-.9zm24.55-13.08a23.04 23.04 0 00-22.56-23v7.07l-.01.05a2.83 2.83 0 012.39 2.78v14.03l.09-.02h8.84v-9.22a.45.45 0 11.9 0v9.22h10.35v-.9zm0 27.33V44.66H62.5c-.02 2.01-.52 4-1.47 5.76a.45.45 0 01-.61.18.45.45 0 01-.19-.61 11.54 11.54 0 001.36-5.33h-8.83l-.1-.01a2.83 2.83 0 01-2.83 2.84h-.04-.04a2.83 2.83 0 01-2.83-2.83v-14.9a2.82 2.82 0 012.47-2.8v-7.11a23.04 23.04 0 00-22.57 23v.91h14.72V29.88a8.2 8.2 0 015.02-7.57c.22-.1.5.01.59.24.1.23-.01.5-.24.6a7.3 7.3 0 00-4.47 6.73v13.88h3.9a.45.45 0 110 .9h-3.9v.15a7.32 7.32 0 0011.23 6.17.45.45 0 01.49.76 8.22 8.22 0 01-12.62-6.93v-.15H26.82v25.52a23.04 23.04 0 0023.01 23.01 23.04 23.04 0 0023.02-23.01zm1.8-27.33v27.33A24.85 24.85 0 0149.84 95a24.85 24.85 0 01-24.82-24.82V42.85a24.85 24.85 0 0124.82-24.82 24.85 24.85 0 0124.83 24.82zM57.98 29.88v9.36a.45.45 0 11-.9 0v-9.36a7.28 7.28 0 00-3.4-6.17.45.45 0 01.49-.76 8.18 8.18 0 013.8 6.93z"/><!-- Created by Icon Island from the Noun Project --></svg>
`, ke = class Ds {
  constructor() {
    this.$ = Ds.IDLE;
  }
  is(...t) {
    return t.some((i) => this.$ & i);
  }
  set(t) {
    this.$ = t;
  }
  add(t) {
    this.$ |= t;
  }
  remove(t) {
    this.$ &= ~t;
  }
};
ke.IDLE = 0;
ke.CLICK = 1;
ke.MOVING = 2;
var E = ke, rr = class extends de {
  constructor(e) {
    super(e), this.data = {
      /** start x position of the click/touch */
      startMouseX: 0,
      /** start y position of the click/touch */
      startMouseY: 0,
      /** current x position of the cursor */
      mouseX: 0,
      /** current y position of the cursor */
      mouseY: 0,
      /** current distance between fingers */
      pinchDist: 0,
      /** accumulator for smooth movement */
      moveDelta: { yaw: 0, pitch: 0, zoom: 0 },
      accumulatorFactor: 0,
      /** when the Ctrl key is pressed */
      ctrlKeyDown: !1,
      /** temporary storage of click data between two clicks */
      dblclickData: null,
      dblclickTimeout: null,
      longtouchTimeout: null,
      twofingersTimeout: null,
      ctrlZoomTimeout: null
    }, this.step = new E(), this.keyHandler = new Oe(), this.resizeObserver = new ResizeObserver(Vt(() => this.viewer.autoSize(), 50)), this.moveThreshold = Mt * C.pixelRatio;
  }
  /**
   * @internal
   */
  init() {
    window.addEventListener("keydown", this, { passive: !1 }), window.addEventListener("keyup", this), this.viewer.container.addEventListener("mousedown", this), window.addEventListener("mousemove", this, { passive: !1 }), window.addEventListener("mouseup", this), this.viewer.container.addEventListener("touchstart", this, { passive: !1 }), window.addEventListener("touchmove", this, { passive: !1 }), window.addEventListener("touchend", this, { passive: !1 }), this.viewer.container.addEventListener("wheel", this, { passive: !1 }), document.addEventListener("fullscreenchange", this), this.resizeObserver.observe(this.viewer.container), this.viewer.addEventListener(J.type, this), this.viewer.addEventListener(ae.type, this);
  }
  destroy() {
    window.removeEventListener("keydown", this), window.removeEventListener("keyup", this), this.viewer.container.removeEventListener("mousedown", this), window.removeEventListener("mousemove", this), window.removeEventListener("mouseup", this), this.viewer.container.removeEventListener("touchstart", this), window.removeEventListener("touchmove", this), window.removeEventListener("touchend", this), this.viewer.container.removeEventListener("wheel", this), document.removeEventListener("fullscreenchange", this), this.resizeObserver.disconnect(), this.viewer.removeEventListener(J.type, this), this.viewer.removeEventListener(ae.type, this), clearTimeout(this.data.dblclickTimeout), clearTimeout(this.data.longtouchTimeout), clearTimeout(this.data.twofingersTimeout), clearTimeout(this.data.ctrlZoomTimeout), super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case "keydown":
        this.__onKeyDown(e);
        break;
      case "keyup":
        this.__onKeyUp();
        break;
      case "mousemove":
        this.__onMouseMove(e);
        break;
      case "mouseup":
        this.__onMouseUp(e);
        break;
      case "touchmove":
        this.__onTouchMove(e);
        break;
      case "touchend":
        this.__onTouchEnd(e);
        break;
      case "fullscreenchange":
        this.__onFullscreenChange();
        break;
      case J.type:
        this.__applyMoveDelta();
        break;
      case ae.type:
        this.__clearMoveDelta();
        break;
    }
    if (!Nt(e, "." + ce))
      switch (e.type) {
        case "mousedown":
          this.__onMouseDown(e);
          break;
        case "touchstart":
          this.__onTouchStart(e);
          break;
        case "wheel":
          this.__onMouseWheel(e);
          break;
      }
  }
  /**
   * Handles keyboard events
   */
  __onKeyDown(e) {
    if (this.config.mousewheelCtrlKey && (this.data.ctrlKeyDown = e.key === y.Control, this.data.ctrlKeyDown && (clearTimeout(this.data.ctrlZoomTimeout), this.viewer.overlay.hide(T.CTRL_ZOOM))), !!this.viewer.dispatchEvent(new j(e.key, e)) && !(!this.state.keyboardEnabled || !this.config.keyboardActions || this.keyHandler.pending)) {
      for (const [t, i] of Object.entries(this.config.keyboardActions))
        if (et(e, t)) {
          if (typeof i == "function")
            i(this.viewer, e);
          else {
            switch (i !== "ZOOM_IN" && i !== "ZOOM_OUT" && this.viewer.stopAll(), i) {
              case "ROTATE_UP":
                this.viewer.dynamics.position.roll({ pitch: !1 });
                break;
              case "ROTATE_DOWN":
                this.viewer.dynamics.position.roll({ pitch: !0 });
                break;
              case "ROTATE_RIGHT":
                this.viewer.dynamics.position.roll({ yaw: !1 });
                break;
              case "ROTATE_LEFT":
                this.viewer.dynamics.position.roll({ yaw: !0 });
                break;
              case "ZOOM_IN":
                this.viewer.dynamics.zoom.roll(!1);
                break;
              case "ZOOM_OUT":
                this.viewer.dynamics.zoom.roll(!0);
                break;
            }
            this.keyHandler.down(i);
          }
          e.preventDefault();
          return;
        }
    }
  }
  /**
   * Handles keyboard events
   */
  __onKeyUp() {
    this.data.ctrlKeyDown = !1, this.state.keyboardEnabled && this.keyHandler.up((e) => {
      e === "ZOOM_IN" || e === "ZOOM_OUT" ? this.viewer.dynamics.zoom.stop() : (this.viewer.dynamics.position.stop(), this.viewer.resetIdleTimer());
    });
  }
  /**
   * Handles mouse down events
   */
  __onMouseDown(e) {
    this.step.add(E.CLICK), this.data.startMouseX = e.clientX, this.data.startMouseY = e.clientY, this.config.mousemove && e.preventDefault();
  }
  /**
   *Handles mouse up events
   */
  __onMouseUp(e) {
    this.step.is(E.CLICK, E.MOVING) && this.__stopMove(e.clientX, e.clientY, e, e.button === 2);
  }
  /**
   * Handles mouse move events
   */
  __onMouseMove(e) {
    this.config.mousemove && this.step.is(E.CLICK, E.MOVING) && (e.preventDefault(), this.__doMove(e.clientX, e.clientY)), this.__handleObjectsEvents(e);
  }
  /**
   * Handles touch events
   */
  __onTouchStart(e) {
    e.touches.length === 1 ? (this.step.add(E.CLICK), this.data.startMouseX = e.touches[0].clientX, this.data.startMouseY = e.touches[0].clientY, this.data.longtouchTimeout || (this.data.longtouchTimeout = setTimeout(() => {
      const t = e.touches[0];
      this.__stopMove(t.clientX, t.clientY, e, !0), this.data.longtouchTimeout = null;
    }, Lt))) : e.touches.length === 2 && (this.step.set(E.IDLE), this.__cancelLongTouch(), this.config.mousemove && (this.__cancelTwoFingersOverlay(), this.__startMoveZoom(e), e.preventDefault()));
  }
  /**
   * Handles touch events
   */
  __onTouchEnd(e) {
    if (this.__cancelLongTouch(), this.step.is(E.CLICK, E.MOVING)) {
      if (e.preventDefault(), this.__cancelTwoFingersOverlay(), e.touches.length === 1)
        this.__stopMove(this.data.mouseX, this.data.mouseY);
      else if (e.touches.length === 0) {
        const t = e.changedTouches[0];
        this.__stopMove(t.clientX, t.clientY, e);
      }
    }
  }
  /**
   * Handles touch move events
   */
  __onTouchMove(e) {
    if (this.__cancelLongTouch(), !!this.config.mousemove)
      if (e.touches.length === 1) {
        if (this.config.touchmoveTwoFingers)
          this.step.is(E.CLICK) && !this.data.twofingersTimeout && (this.data.twofingersTimeout = setTimeout(() => {
            this.viewer.overlay.show({
              id: T.TWO_FINGERS,
              image: sr,
              title: this.config.lang.twoFingers
            });
          }, Pt));
        else if (this.step.is(E.CLICK, E.MOVING)) {
          e.preventDefault();
          const t = e.touches[0];
          this.__doMove(t.clientX, t.clientY);
        }
      } else
        this.__doMoveZoom(e), this.__cancelTwoFingersOverlay();
  }
  /**
   * Cancel the long touch timer if any
   */
  __cancelLongTouch() {
    this.data.longtouchTimeout && (clearTimeout(this.data.longtouchTimeout), this.data.longtouchTimeout = null);
  }
  /**
   * Cancel the two fingers overlay timer if any
   */
  __cancelTwoFingersOverlay() {
    this.config.touchmoveTwoFingers && (this.data.twofingersTimeout && (clearTimeout(this.data.twofingersTimeout), this.data.twofingersTimeout = null), this.viewer.overlay.hide(T.TWO_FINGERS));
  }
  /**
   * Handles mouse wheel events
   */
  __onMouseWheel(e) {
    if (!this.config.mousewheel || !e.deltaY)
      return;
    if (this.config.mousewheelCtrlKey && !this.data.ctrlKeyDown) {
      this.viewer.overlay.show({
        id: T.CTRL_ZOOM,
        image: nr,
        title: this.config.lang.ctrlZoom
      }), clearTimeout(this.data.ctrlZoomTimeout), this.data.ctrlZoomTimeout = setTimeout(() => this.viewer.overlay.hide(T.CTRL_ZOOM), Ot);
      return;
    }
    e.preventDefault(), e.stopPropagation();
    const t = e.deltaY / Math.abs(e.deltaY) * 5 * this.config.zoomSpeed;
    t !== 0 && this.viewer.dynamics.zoom.step(-t, 5);
  }
  /**
   * Handles fullscreen events
   */
  __onFullscreenChange() {
    const e = this.viewer.isFullscreenEnabled();
    this.config.keyboard === "fullscreen" && (e ? this.viewer.startKeyboardControl() : this.viewer.stopKeyboardControl()), this.viewer.dispatchEvent(new ee(e));
  }
  /**
   * Resets all state variables
   */
  __resetMove() {
    this.step.set(E.IDLE), this.data.mouseX = 0, this.data.mouseY = 0, this.data.startMouseX = 0, this.data.startMouseY = 0;
  }
  /**
   * Initializes the combines move and zoom
   */
  __startMoveZoom(e) {
    this.viewer.stopAll(), this.__resetMove();
    const t = Ue(e);
    this.step.set(E.MOVING), this.data.accumulatorFactor = this.config.moveInertia, {
      distance: this.data.pinchDist,
      center: { x: this.data.mouseX, y: this.data.mouseY }
    } = t;
  }
  /**
   * Stops the movement
   * @description If the move threshold was not reached a click event is triggered
   */
  __stopMove(e, t, i, s = !1) {
    this.step.is(E.CLICK) && !this.__moveThresholdReached(e, t) && this.__doClick(e, t, i, s), this.config.moveInertia && (this.data.accumulatorFactor = Math.pow(this.config.moveInertia, 0.5)), this.__resetMove(), this.viewer.resetIdleTimer();
  }
  /**
   * Triggers an event with all coordinates when a simple click is performed
   */
  __doClick(e, t, i, s = !1) {
    const n = this.viewer.container.getBoundingClientRect(), r = e - n.left, o = t - n.top, a = this.viewer.renderer.getIntersections({ x: r, y: o }), h = a.find((c) => c.object.userData[W]);
    if (h) {
      const c = this.viewer.dataHelper.vector3ToSphericalCoords(h.point), u = {
        rightclick: s,
        originalEvent: i,
        target: be(i),
        clientX: e,
        clientY: t,
        viewerX: r,
        viewerY: o,
        yaw: c.yaw,
        pitch: c.pitch,
        objects: a.map((m) => m.object).filter((m) => !m.userData[W])
      };
      try {
        const m = this.viewer.dataHelper.sphericalCoordsToTextureCoords(u);
        Object.assign(u, m);
      } catch {
      }
      this.data.dblclickTimeout ? (Math.abs(this.data.dblclickData.clientX - u.clientX) < this.moveThreshold && Math.abs(this.data.dblclickData.clientY - u.clientY) < this.moveThreshold && this.viewer.dispatchEvent(new wi(this.data.dblclickData)), clearTimeout(this.data.dblclickTimeout), this.data.dblclickTimeout = null, this.data.dblclickData = null) : (this.viewer.dispatchEvent(new ui(u)), this.data.dblclickData = Ce(u), this.data.dblclickTimeout = setTimeout(() => {
        this.data.dblclickTimeout = null, this.data.dblclickData = null;
      }, Ct));
    }
  }
  /**
   * Trigger events for observed THREE objects
   */
  __handleObjectsEvents(e) {
    if (!Bt(this.state.objectsObservers) && e.composedPath().includes(this.viewer.container)) {
      const t = Dt(this.viewer.container), i = {
        x: e.clientX - t.x,
        y: e.clientY - t.y
      }, s = this.viewer.renderer.getIntersections(i), n = (r, o, a) => {
        this.viewer.dispatchEvent(new a(e, r, i, o));
      };
      for (const [r, o] of Object.entries(this.state.objectsObservers)) {
        const a = s.find((h) => h.object.userData[r]);
        a ? (o && a.object !== o && (n(o, r, Ye), this.state.objectsObservers[r] = null), o ? n(a.object, r, Ts) : (this.state.objectsObservers[r] = a.object, n(a.object, r, bs))) : o && (n(o, r, Ye), this.state.objectsObservers[r] = null);
      }
    }
  }
  /**
   * Starts moving when crossing moveThreshold and performs movement
   */
  __doMove(e, t) {
    if (this.step.is(E.CLICK) && this.__moveThresholdReached(e, t))
      this.viewer.stopAll(), this.__resetMove(), this.step.set(E.MOVING), this.data.mouseX = e, this.data.mouseY = t, this.data.accumulatorFactor = this.config.moveInertia;
    else if (this.step.is(E.MOVING)) {
      const i = (e - this.data.mouseX) * Math.cos(this.state.roll) - (t - this.data.mouseY) * Math.sin(this.state.roll), s = (t - this.data.mouseY) * Math.cos(this.state.roll) + (e - this.data.mouseX) * Math.sin(this.state.roll), n = {
        yaw: this.config.moveSpeed * (i / this.state.size.width) * p.degToRad(this.state.hFov),
        pitch: this.config.moveSpeed * (s / this.state.size.height) * p.degToRad(this.state.vFov)
      };
      this.data.moveDelta.yaw += n.yaw, this.data.moveDelta.pitch += n.pitch, this.data.mouseX = e, this.data.mouseY = t;
    }
  }
  /**
   * Checks if the cursor was move beyond the move threshold
   */
  __moveThresholdReached(e, t) {
    return Math.abs(e - this.data.startMouseX) >= this.moveThreshold || Math.abs(t - this.data.startMouseY) >= this.moveThreshold;
  }
  /**
   * Perfoms combined move and zoom
   */
  __doMoveZoom(e) {
    if (this.step.is(E.MOVING)) {
      e.preventDefault();
      const t = Ue(e);
      this.__doMove(t.center.x, t.center.y), this.data.moveDelta.zoom += this.config.zoomSpeed * ((t.distance - this.data.pinchDist) / C.pixelRatio), this.data.pinchDist = t.distance;
    }
  }
  __applyMoveDelta() {
    if (Math.abs(this.data.moveDelta.yaw) > 0 || Math.abs(this.data.moveDelta.pitch) > 0) {
      const t = this.viewer.getPosition();
      this.viewer.rotate({
        yaw: t.yaw - this.data.moveDelta.yaw * (1 - this.config.moveInertia),
        pitch: t.pitch + this.data.moveDelta.pitch * (1 - this.config.moveInertia)
      }), this.data.moveDelta.yaw *= this.data.accumulatorFactor, this.data.moveDelta.pitch *= this.data.accumulatorFactor, Math.abs(this.data.moveDelta.yaw) <= 1e-3 && (this.data.moveDelta.yaw = 0), Math.abs(this.data.moveDelta.pitch) <= 1e-3 && (this.data.moveDelta.pitch = 0);
    }
    if (Math.abs(this.data.moveDelta.zoom) > 0) {
      const t = this.viewer.getZoomLevel();
      this.viewer.zoom(t + this.data.moveDelta.zoom * (1 - this.config.moveInertia)), this.data.moveDelta.zoom *= this.config.moveInertia, Math.abs(this.data.moveDelta.zoom) <= 1e-3 && (this.data.moveDelta.zoom = 0);
    }
  }
  __clearMoveDelta() {
    this.data.moveDelta.yaw = 0, this.data.moveDelta.pitch = 0, this.data.moveDelta.zoom = 0;
  }
};
dn.enabled = !1;
var ve = new Ne(), _t = new tn(), xt = new sn(), or = class extends de {
  /**
   * @internal
   */
  constructor(e) {
    super(e), this.frustumNeedsUpdate = !0, this.renderer = new Zs(this.config.rendererParameters), this.renderer.setPixelRatio(C.pixelRatio), this.renderer.outputColorSpace = Gs, this.renderer.toneMapping = qs, this.renderer.domElement.className = "psv-canvas", this.renderer.domElement.style.background = this.config.canvasBackground, this.scene = new pt(), this.camera = new Ks(50, 16 / 9, 0.1, 2 * D), this.camera.matrixAutoUpdate = !1;
    const t = new ge(
      new we(D).scale(-1, 1, 1),
      new Ke({ opacity: 0, transparent: !0, depthTest: !1, depthWrite: !1 })
    );
    t.userData = { [W]: !0 }, this.scene.add(t), this.raycaster = new Qs(), this.frustum = new Js(), this.container = document.createElement("div"), this.container.className = "psv-canvas-container", this.container.appendChild(this.renderer.domElement), this.viewer.container.appendChild(this.container), this.container.addEventListener("contextmenu", (i) => i.preventDefault()), this.viewer.addEventListener(oe.type, this), this.viewer.addEventListener(F.type, this), this.viewer.addEventListener(ie.type, this), this.viewer.addEventListener(se.type, this), this.viewer.addEventListener(P.type, this), this.hide();
  }
  get panoramaPose() {
    return this.mesh.rotation;
  }
  get sphereCorrection() {
    return this.meshContainer.rotation;
  }
  /**
   * @internal
   */
  init() {
    this.show(), this.renderer.setAnimationLoop((e) => this.__renderLoop(e));
  }
  /**
   * @internal
   */
  destroy() {
    this.renderer.setAnimationLoop(null), this.cleanScene(this.scene), this.renderer.dispose(), this.viewer.container.removeChild(this.container), this.viewer.removeEventListener(oe.type, this), this.viewer.removeEventListener(F.type, this), this.viewer.removeEventListener(ie.type, this), this.viewer.removeEventListener(se.type, this), this.viewer.removeEventListener(P.type, this), super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case oe.type:
        this.__onSizeUpdated();
        break;
      case F.type:
        this.__onZoomUpdated();
        break;
      case ie.type:
        this.__onPositionUpdated();
        break;
      case se.type:
        this.__onPositionUpdated();
        break;
      case P.type:
        e.containsOptions("fisheye") && this.__onPositionUpdated(), e.containsOptions("canvasBackground") && (this.renderer.domElement.style.background = this.config.canvasBackground);
        break;
    }
  }
  /**
   * Hides the viewer
   */
  hide() {
    this.container.style.opacity = "0";
  }
  /**
   * Shows the viewer
   */
  show() {
    this.container.style.opacity = "1";
  }
  /**
   * Resets or replaces the THREE renderer by a custom one
   */
  setCustomRenderer(e) {
    e ? this.customRenderer = e(this.renderer) : this.customRenderer = null, this.viewer.needsUpdate();
  }
  /**
   * Updates the size of the renderer and the aspect of the camera
   */
  __onSizeUpdated() {
    this.renderer.setSize(this.state.size.width, this.state.size.height), this.camera.aspect = this.state.aspect, this.camera.updateProjectionMatrix(), this.viewer.needsUpdate(), this.frustumNeedsUpdate = !0;
  }
  /**
   * Updates the fov of the camera
   */
  __onZoomUpdated() {
    this.camera.fov = this.state.vFov, this.camera.updateProjectionMatrix(), this.viewer.needsUpdate(), this.frustumNeedsUpdate = !0;
  }
  /**
   * Updates the position of the camera
   */
  __onPositionUpdated() {
    this.camera.position.set(0, 0, 0), this.camera.lookAt(this.state.direction), this.config.fisheye && this.camera.position.copy(this.state.direction).multiplyScalar(this.config.fisheye / 2).negate(), this.camera.rotateZ(-this.state.roll), this.camera.updateMatrix(), this.camera.updateMatrixWorld(), this.viewer.needsUpdate(), this.frustumNeedsUpdate = !0;
  }
  /**
   * Main event loop, performs a render if `state.needsUpdate` is true
   */
  __renderLoop(e) {
    const t = this.timestamp ? e - this.timestamp : 0;
    this.timestamp = e, this.viewer.dispatchEvent(new J(e, t)), this.viewer.dynamics.update(t), (this.state.needsUpdate || this.state.continuousUpdateCount > 0) && (this.state.needsUpdate = !1, (this.customRenderer || this.renderer).render(this.scene, this.camera), this.viewer.dispatchEvent(new es()));
  }
  /**
   * Applies the texture to the scene, creates the scene if needed
   * @internal
   */
  setTexture(e) {
    this.meshContainer || (this.meshContainer = new vt(), this.scene.add(this.meshContainer)), this.state.textureData && this.viewer.adapter.disposeTexture(this.state.textureData), this.mesh && (this.meshContainer.remove(this.mesh), this.viewer.adapter.disposeMesh(this.mesh)), this.mesh = this.viewer.adapter.createMesh(e.panoData), this.viewer.adapter.setTexture(this.mesh, e, !1), this.meshContainer.add(this.mesh), this.state.textureData = e, this.viewer.needsUpdate();
  }
  /**
   * Applies a panorama data pose to a Mesh
   * @internal
   */
  setPanoramaPose(e, t = this.mesh) {
    const i = this.viewer.dataHelper.cleanPanoramaPose(e);
    t.rotation.set(-i.tilt, i.pan, i.roll, "YXZ");
  }
  /**
   * Applies a SphereCorrection to a Group
   * @internal
   */
  setSphereCorrection(e, t = this.meshContainer) {
    const i = this.viewer.dataHelper.cleanSphereCorrection(e);
    t.rotation.set(i.tilt, i.pan, i.roll, "YXZ");
  }
  /**
   * Performs transition between the current and a new texture
   * @internal
   */
  transition(e, t, i) {
    const s = i.effect === "fade" || i.rotation, n = !_(t.position), r = !_(t.zoom), o = new ot(
      n ? this.viewer.dataHelper.cleanPosition(t.position) : void 0,
      t.zoom
    );
    this.viewer.dispatchEvent(o);
    const a = new vt(), h = this.viewer.adapter.createMesh(e.panoData);
    if (this.viewer.adapter.setTexture(h, e, !0), this.viewer.adapter.setTextureOpacity(h, 0), this.setPanoramaPose(e.panoData, h), this.setSphereCorrection(t.sphereCorrection, a), n && !i.rotation) {
      const l = this.viewer.getPosition(), b = new B(0, 1, 0);
      a.rotateOnWorldAxis(b, o.position.yaw - l.yaw);
      const x = new B(0, 1, 0).cross(this.camera.getWorldDirection(new B())).normalize();
      a.rotateOnWorldAxis(x, o.position.pitch - l.pitch);
    }
    a.add(h), this.scene.add(a), this.renderer.setRenderTarget(new en()), this.renderer.render(this.scene, this.camera), this.renderer.setRenderTarget(null);
    const { duration: c, properties: u } = this.viewer.dataHelper.getAnimationProperties(
      i.speed,
      i.rotation ? o.position : null,
      s ? o.zoomLevel : null
    ), m = new xe({
      properties: {
        ...u,
        opacity: { start: 0, end: 1 }
      },
      duration: c,
      easing: "inOutCubic",
      onTick: (l) => {
        switch (i.effect) {
          case "fade":
            this.viewer.adapter.setTextureOpacity(h, l.opacity);
            break;
          case "black":
          case "white":
            l.opacity < 0.5 ? this.renderer.toneMappingExposure = i.effect === "black" ? p.mapLinear(l.opacity, 0, 0.5, 1, 0) : p.mapLinear(l.opacity, 0, 0.5, 1, 5) : (this.renderer.toneMappingExposure = i.effect === "black" ? p.mapLinear(l.opacity, 0.5, 1, 0, 1) : p.mapLinear(l.opacity, 0.5, 1, 5, 1), this.mesh.visible = !1, this.viewer.adapter.setTextureOpacity(h, 1), r && !s && this.viewer.dynamics.zoom.setValue(o.zoomLevel));
            break;
        }
        n && i.rotation && this.viewer.dynamics.position.setValue({
          yaw: l.yaw,
          pitch: l.pitch
        }), r && s && this.viewer.dynamics.zoom.setValue(l.zoom), this.viewer.needsUpdate();
      }
    });
    return m.then((l) => {
      a.remove(h), this.scene.remove(a), l ? (this.viewer.adapter.disposeTexture(this.state.textureData), this.meshContainer.remove(this.mesh), this.viewer.adapter.disposeMesh(this.mesh), this.mesh = h, this.meshContainer.add(h), this.state.textureData = e, this.setPanoramaPose(e.panoData), this.setSphereCorrection(t.sphereCorrection), n && !i.rotation && this.viewer.rotate(t.position)) : (this.viewer.adapter.disposeTexture(e), this.viewer.adapter.disposeMesh(h));
    }), m;
  }
  /**
   * Returns intersections with objects in the scene
   */
  getIntersections(e) {
    ve.x = 2 * e.x / this.state.size.width - 1, ve.y = -2 * e.y / this.state.size.height + 1, this.raycaster.setFromCamera(ve, this.camera);
    const t = this.raycaster.intersectObjects(this.scene.children, !0).filter((i) => i.object.visible).filter((i) => i.object.isMesh && !!i.object.userData);
    return this.customRenderer?.getIntersections && t.push(...this.customRenderer.getIntersections(this.raycaster, ve)), t;
  }
  /**
   * Checks if an object/point is currently visible
   */
  isObjectVisible(e) {
    if (!e)
      return !1;
    if (this.frustumNeedsUpdate && (_t.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse), this.frustum.setFromProjectionMatrix(_t), this.frustumNeedsUpdate = !1), e.isVector3)
      return this.frustum.containsPoint(e);
    if (e.isMesh && e.geometry) {
      const t = e;
      return t.geometry.boundingBox || t.geometry.computeBoundingBox(), xt.copy(t.geometry.boundingBox).applyMatrix4(t.matrixWorld), this.frustum.intersectsBox(xt);
    } else return e.isObject3D ? this.frustum.intersectsObject(e) : !1;
  }
  /**
   * Adds an object to the THREE scene
   */
  addObject(e) {
    this.scene.add(e);
  }
  /**
   * Removes an object from the THREE scene
   */
  removeObject(e) {
    this.scene.remove(e);
  }
  /**
   * Calls `dispose` on all objects and textures
   * @internal
   */
  cleanScene(e) {
    const t = (i) => {
      i.map?.dispose(), i.uniforms && Object.values(i.uniforms).forEach((s) => {
        s.value?.dispose?.();
      }), i.dispose();
    };
    e.traverse((i) => {
      i.geometry?.dispose(), i.material && (Array.isArray(i.material) ? i.material.forEach((s) => {
        t(s);
      }) : t(i.material)), i instanceof pt || i.dispose?.(), i !== e && this.cleanScene(i);
    });
  }
}, ar = class extends cn {
  constructor() {
    super(...arguments), this._abortController = new AbortController();
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
  load(e, t, i, s) {
    const n = this._abortController.signal, r = super.load(
      e,
      (h) => {
        a(), t(h);
      },
      i,
      (h) => {
        if (a(), n.aborted) {
          const c = new Error();
          c.name = "AbortError", c.message = "The operation was aborted.", s(c);
        } else
          s(h);
      }
    );
    function o() {
      r.src = "";
    }
    function a() {
      n.removeEventListener("abort", o, !1);
    }
    return n.addEventListener("abort", o, !1), r;
  }
}, hr = class extends de {
  /**
   * @internal
   */
  constructor(e) {
    super(e), this.fileLoader = new nn(), this.fileLoader.setResponseType("blob"), this.imageLoader = new ar();
  }
  /**
   * @internal
   */
  destroy() {
    this.abortLoading(), super.destroy();
  }
  /**
   * Cancels current HTTP requests
   * @internal
   */
  abortLoading() {
    this.fileLoader.abort?.(), this.imageLoader.abort();
  }
  /**
   * Loads a Blob with FileLoader
   */
  loadFile(e, t, i) {
    const s = X.get(e, i);
    if (s) {
      if (s instanceof Blob)
        return t?.(100), Promise.resolve(s);
      X.remove(e, i);
    }
    this.config.requestHeaders && this.fileLoader.setRequestHeader(this.config.requestHeaders(e)), this.fileLoader.setWithCredentials(this.config.withCredentials(e));
    let n = 0;
    return t?.(n), this.fileLoader.loadAsync(
      e,
      (r) => {
        if (r.lengthComputable) {
          const o = r.loaded / r.total * 100;
          o > n && (n = o, t?.(n));
        }
      }
    ).then((r) => (n = 100, t?.(n), X.add(e, i, r), r));
  }
  /**
   * Loads an image with ImageLoader or with FileLoader if progress is tracked or if request headers are configured
   */
  loadImage(e, t, i) {
    const s = X.get(e, i);
    return s ? (t?.(100), s instanceof Blob ? this.blobToImage(s) : Promise.resolve(s)) : !t && !this.config.requestHeaders ? (this.imageLoader.setWithCredentials(this.config.withCredentials(e)), this.imageLoader.loadAsync(e).then((n) => (X.add(e, i, n), n))) : this.loadFile(e, t, i).then((n) => this.blobToImage(n));
  }
  /**
   * Converts a file loaded with {@link loadFile} into an image
   */
  blobToImage(e) {
    return new Promise((t, i) => {
      const s = document.createElement("img");
      s.onload = () => {
        URL.revokeObjectURL(s.src), t(s);
      }, s.onerror = i, s.src = URL.createObjectURL(e);
    });
  }
  /**
   * Preload a panorama file without displaying it
   */
  preloadPanorama(e) {
    return this.viewer.adapter.supportsPreload(e) ? this.viewer.adapter.loadTexture(e, !1) : Promise.reject(new v("Current adapter does not support preload"));
  }
  /**
   * @internal
   */
  dispatchProgress(e) {
    this.viewer.loader.setProgress(e), this.viewer.dispatchEvent(new zi(Math.round(e)));
  }
}, cr = class extends de {
  /**
   * @internal
   */
  constructor(e) {
    super(e), this.zoom = new K(
      (t) => {
        this.viewer.state.vFov = this.viewer.dataHelper.zoomLevelToFov(t), this.viewer.state.hFov = this.viewer.dataHelper.vFovToHFov(this.viewer.state.vFov), this.viewer.dispatchEvent(new F(t));
      },
      {
        defaultValue: this.viewer.config.defaultZoomLvl,
        min: 0,
        max: 100,
        wrap: !1
      }
    ), this.position = new Jt(
      (t) => {
        this.viewer.dataHelper.sphericalCoordsToVector3(t, this.viewer.state.direction), this.viewer.dispatchEvent(new ie(t));
      },
      {
        yaw: new K(null, {
          defaultValue: this.config.defaultYaw,
          min: 0,
          max: 2 * Math.PI,
          wrap: !0
        }),
        pitch: new K(null, {
          defaultValue: this.config.defaultPitch,
          min: -Math.PI / 2,
          max: Math.PI / 2,
          wrap: !1
        })
      }
    ), this.roll = new K(
      (t) => {
        this.viewer.state.roll = t, this.viewer.dispatchEvent(new se(t));
      },
      {
        defaultValue: 0,
        min: -Math.PI,
        max: Math.PI,
        wrap: !1
      }
    ), this.updateSpeeds();
  }
  /**
   * @internal
   */
  updateSpeeds() {
    this.zoom.setSpeed(this.config.zoomSpeed * 50), this.position.setSpeed(p.degToRad(this.config.moveSpeed * 50)), this.roll.setSpeed(p.degToRad(this.config.moveSpeed * 50));
  }
  /**
   * @internal
   */
  update(e) {
    this.zoom.update(e), this.position.update(e), this.roll.update(e);
  }
}, lr = class {
  /**
   * @internal
   */
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  constructor() {
    this.ready = !1, this.needsUpdate = !1, this.continuousUpdateCount = 0, this.keyboardEnabled = !1, this.direction = new B(0, 0, D), this.roll = 0, this.vFov = 60, this.hFov = 60, this.aspect = 1, this.animation = null, this.transitionAnimation = null, this.loadingPromise = null, this.idleTime = -1, this.objectsObservers = {}, this.size = {
      width: 0,
      height: 0
    };
  }
}, dr = class extends ii {
  constructor(e) {
    if (super(), this.plugins = {}, this.children = [], this.parent = Rt(e.container), !this.parent)
      throw new v('"container" element not found.');
    this.parent[W] = this, this.container = document.createElement("div"), this.container.classList.add("psv-container"), this.parent.appendChild(this.container), Kt(this.parent), qt(this.container, "core"), this.state = new lr(), this.config = Xn(e), this.__setSize(this.config.size), this.overlay = new Kn(this);
    try {
      C.load();
    } catch (t) {
      console.error(t), this.showError(this.config.lang.webglError);
      return;
    }
    X.init(), this.adapter = new this.config.adapter[0](this, this.config.adapter[1]), this.renderer = new or(this), this.textureLoader = new hr(this), this.eventsHandler = new rr(this), this.dataHelper = new ir(this), this.dynamics = new cr(this), this.adapter.init?.(), this.loader = new Gn(this), this.navbar = new $n(this), this.panel = new Jn(this), this.notification = new qn(this), this.autoSize(), this.setCursor(null), it(C.isTouchEnabled, (t) => {
      Me(this.container, "psv--is-touch", t);
    }), this.config.plugins.forEach(([t, i]) => {
      this.plugins[t.id] = new t(this, i);
    });
    for (const t of Object.values(this.plugins))
      t.init?.();
    this.config.navbar && this.navbar.setButtons(this.config.navbar), this.state.loadingPromise || (this.config.panorama ? this.setPanorama(this.config.panorama, {
      sphereCorrection: this.config.sphereCorrection,
      panoData: this.config.panoData
    }) : this.loader.show());
  }
  /**
   * Destroys the viewer
   */
  destroy() {
    this.stopAll(), this.stopKeyboardControl(), this.exitFullscreen();
    for (const [e, t] of Object.entries(this.plugins))
      t.destroy(), delete this.plugins[e];
    this.children.slice().forEach((e) => e.destroy()), this.children.length = 0, this.eventsHandler?.destroy(), this.renderer?.destroy(), this.textureLoader?.destroy(), this.dataHelper?.destroy(), this.adapter?.destroy(), this.dynamics?.destroy(), this.parent.removeChild(this.container), delete this.parent[W];
  }
  init() {
    this.eventsHandler.init(), this.renderer.init(), this.config.navbar && this.navbar.show(), this.config.keyboard === "always" && this.startKeyboardControl(), this.resetIdleTimer(), this.state.ready = !0, this.dispatchEvent(new ne());
  }
  /**
   * Restarts the idle timer
   * @internal
   */
  resetIdleTimer() {
    this.state.idleTime = performance.now();
  }
  /**
   * Stops the idle timer
   * @internal
   */
  disableIdleTimer() {
    this.state.idleTime = -1;
  }
  /**
   * Returns the instance of a plugin if it exists
   * @example By plugin identifier
   * ```js
   * viewer.getPlugin('markers')
   * ```
   * @example By plugin class with TypeScript support
   * ```ts
   * viewer.getPlugin<MarkersPlugin>(MarkersPlugin)
   * ```
   */
  getPlugin(e) {
    if (typeof e == "string")
      return this.plugins[e];
    {
      const t = Xe(e);
      return t ? this.plugins[t.id] : null;
    }
  }
  /**
   * Returns the current position of the camera
   */
  getPosition() {
    return this.dataHelper.cleanPosition(this.dynamics.position.current);
  }
  /**
   * Returns the current zoom level
   */
  getZoomLevel() {
    return this.dynamics.zoom.current;
  }
  /**
   * Returns the current viewer size
   */
  getSize() {
    return { ...this.state.size };
  }
  /**
   * Checks if the viewer is in fullscreen
   */
  isFullscreenEnabled() {
    return Ft(this.parent, C.isIphone);
  }
  /**
   * Request a new render of the scene
   */
  needsUpdate() {
    this.state.needsUpdate = !0;
  }
  /**
   * Request the scene to be continuously renderer (when using videos)
   */
  needsContinuousUpdate(e) {
    e ? this.state.continuousUpdateCount++ : this.state.continuousUpdateCount > 0 && this.state.continuousUpdateCount--;
  }
  /**
   * Resizes the scene if the viewer is resized
   */
  autoSize() {
    (this.container.clientWidth !== this.state.size.width || this.container.clientHeight !== this.state.size.height) && (this.state.size.width = Math.round(this.container.clientWidth), this.state.size.height = Math.round(this.container.clientHeight), this.state.aspect = this.state.size.width / this.state.size.height, this.state.hFov = this.dataHelper.vFovToHFov(this.state.vFov), this.dispatchEvent(new oe(this.getSize())), this.navbar.autoSize());
  }
  /**
   * Loads a new panorama file
   * Loads a new panorama file, optionally changing the camera position/zoom and activating the transition animation.<br>
   * If the "options" parameter is not defined, the camera will not move and the ongoing animation will continue.<br>
   * If another loading is already in progress it will be aborted.
   * @returns promise resolved with false if the loading was aborted by another call
   */
  setPanorama(e, t = {}) {
    this.textureLoader.abortLoading(), this.state.transitionAnimation?.cancel();
    const i = this.dataHelper.getTransitionOptions(t);
    t.showLoader === void 0 && (t.showLoader = !0), t.caption === void 0 && (t.caption = this.config.caption), t.description === void 0 && (t.description = this.config.description), !t.panoData && typeof this.config.panoData == "function" && (t.panoData = this.config.panoData), this.hideError(), this.resetIdleTimer(), this.config.panorama = e, this.config.caption = t.caption, this.config.description = t.description, this.config.sphereCorrection = t.sphereCorrection, (typeof this.config.panoData != "function" || typeof t.panoData == "function") && (this.config.panoData = t.panoData);
    const s = (r) => {
      if (Zt(r))
        return !1;
      if (this.loader.hide(), this.state.loadingPromise = null, r)
        throw this.navbar.setCaption(null), this.showError(this.config.lang.loadError), console.error(r), this.dispatchEvent(new Vi(e, r)), r;
      return this.navbar.setCaption(this.config.caption), !0;
    };
    this.navbar.setCaption(`<em>${this.config.lang.loading}</em>`), (t.showLoader || !this.state.ready) && this.loader.show(), this.dispatchEvent(new Ni(e));
    const n = this.adapter.loadTexture(this.config.panorama, !0, t.panoData).then((r) => {
      if (r.panorama !== this.config.panorama)
        throw this.adapter.disposeTexture(r), je();
      const o = this.dataHelper.cleanPanoramaOptions(t, r.panoData);
      return (!_(o.zoom) || !_(o.position)) && this.stopAll(), {
        textureData: r,
        cleanOptions: o
      };
    });
    return !i || !this.state.ready || !this.adapter.supportsTransition(this.config.panorama) ? this.state.loadingPromise = n.then(({ textureData: r, cleanOptions: o }) => {
      this.renderer.show(), this.renderer.setTexture(r), this.renderer.setPanoramaPose(r.panoData), this.renderer.setSphereCorrection(t.sphereCorrection), this.state.ready || this.init(), this.dispatchEvent(new $(r)), _(o.zoom) || this.zoom(o.zoom), _(o.position) || this.rotate(o.position);
    }).then(
      () => s(),
      (r) => s(r)
    ) : this.state.loadingPromise = n.then(({ textureData: r, cleanOptions: o }) => (this.loader.hide(), this.dispatchEvent(new $(r)), this.state.transitionAnimation = this.renderer.transition(r, o, i), this.state.transitionAnimation)).then((r) => {
      if (this.state.transitionAnimation = null, this.dispatchEvent(new Yi(r)), !r)
        throw je();
    }).then(
      () => s(),
      (r) => s(r)
    ), this.state.loadingPromise;
  }
  /**
   * Update options
   * @throws {@link PSVError} if the configuration is invalid
   */
  setOptions(e) {
    const t = {
      ...this.config,
      ...e
    };
    for (let [i, s] of Object.entries(e)) {
      if (!(i in G)) {
        M(`Unknown option ${i}`);
        continue;
      }
      if (i in yt) {
        M(yt[i]);
        continue;
      }
      switch (i in Ze && (s = Ze[i](s, {
        rawConfig: t,
        defValue: G[i]
      })), this.config[i] = s, i) {
        case "mousemove":
          this.state.cursorOverride || this.setCursor(null);
          break;
        case "caption":
          this.navbar.setCaption(this.config.caption);
          break;
        case "size":
          this.resize(this.config.size);
          break;
        case "sphereCorrection":
          this.renderer.setSphereCorrection(this.config.sphereCorrection);
          break;
        case "navbar":
        case "lang":
          this.navbar.setButtons(this.config.navbar);
          break;
        case "moveSpeed":
        case "zoomSpeed":
          this.dynamics.updateSpeeds();
          break;
        case "minFov":
        case "maxFov":
          this.dynamics.zoom.setValue(this.dataHelper.fovToZoomLevel(this.state.vFov)), this.dispatchEvent(new F(this.getZoomLevel()));
          break;
        case "keyboard":
          this.config.keyboard === "always" ? this.startKeyboardControl() : this.stopKeyboardControl();
          break;
      }
    }
    this.needsUpdate(), this.dispatchEvent(new P(Object.keys(e)));
  }
  /**
   * Update options
   * @throws {@link PSVError} if the configuration is invalid
   */
  setOption(e, t) {
    this.setOptions({ [e]: t });
  }
  /**
   * Displays an error message over the viewer
   */
  showError(e) {
    this.overlay.show({
      id: T.ERROR,
      image: tr,
      title: e,
      dismissible: !1
    });
  }
  /**
   *  Hides the error message
   */
  hideError() {
    this.overlay.hide(T.ERROR);
  }
  /**
   * Rotates the view to specific position
   */
  rotate(e) {
    const t = new ci(this.dataHelper.cleanPosition(e));
    this.dispatchEvent(t), !t.defaultPrevented && this.dynamics.position.setValue(t.position);
  }
  /**
   * Zooms to a specific level between `maxFov` and `minFov`
   */
  zoom(e) {
    this.dynamics.zoom.setValue(e);
  }
  /**
   * Increases the zoom level
   */
  zoomIn(e = 1) {
    this.dynamics.zoom.step(e);
  }
  /**
   * Decreases the zoom level
   */
  zoomOut(e = 1) {
    this.dynamics.zoom.step(-e);
  }
  /**
   * Rotates and zooms the view with a smooth animation
   */
  animate(e) {
    const t = st(e), i = !_(e.zoom), s = new ot(
      t ? this.dataHelper.cleanPosition(e) : void 0,
      e.zoom
    );
    if (this.dispatchEvent(s), s.defaultPrevented)
      return;
    this.stopAll();
    const { duration: n, properties: r } = this.dataHelper.getAnimationProperties(e.speed, s.position, s.zoomLevel);
    return n ? (this.state.animation = new xe({
      properties: r,
      duration: n,
      easing: e.easing || "inOutSine",
      onTick: (o) => {
        t && this.dynamics.position.setValue({
          yaw: o.yaw,
          pitch: o.pitch
        }), i && this.dynamics.zoom.setValue(o.zoom);
      }
    }), this.state.animation.then(() => {
      this.state.animation = null, this.resetIdleTimer();
    }), this.state.animation) : (t && this.rotate(s.position), i && this.zoom(s.zoomLevel), new xe(null));
  }
  /**
   * Stops the ongoing animation
   * The return value is a Promise because the is no guaranty the animation can be stopped synchronously.
   */
  stopAnimation() {
    return this.state.animation ? (this.state.animation.cancel(), this.state.animation) : Promise.resolve();
  }
  /**
   * Resizes the viewer
   */
  resize(e) {
    this.__setSize(e), this.autoSize();
  }
  __setSize(e) {
    ["width", "height"].forEach((t) => {
      e?.[t] && (/^[0-9.]+$/.test(e[t]) && (e[t] += "px"), this.parent.style[t] = e[t]);
    });
  }
  /**
   * Enters the fullscreen mode
   */
  enterFullscreen() {
    this.isFullscreenEnabled() || Ut(this.parent, C.isIphone);
  }
  /**
   * Exits the fullscreen mode
   */
  exitFullscreen() {
    this.isFullscreenEnabled() && jt(C.isIphone);
  }
  /**
   * Enters or exits the fullscreen mode
   */
  toggleFullscreen() {
    this.isFullscreenEnabled() ? this.exitFullscreen() : this.enterFullscreen();
  }
  /**
   * Enables the keyboard controls
   */
  startKeyboardControl() {
    this.state.keyboardEnabled = !0;
  }
  /**
   * Disables the keyboard controls
   */
  stopKeyboardControl() {
    this.state.keyboardEnabled = !1;
  }
  /**
   * Creates a new tooltip
   * Use {@link Tooltip.move} to update the tooltip without re-create
   * @throws {@link PSVError} if the configuration is invalid
   */
  createTooltip(e) {
    return new er(this, e);
  }
  /**
   * Changes the global mouse cursor
   */
  setCursor(e) {
    this.state.cursorOverride = e, e ? this.container.style.cursor = e : this.container.style.cursor = this.config.mousemove ? "move" : "default";
  }
  /**
   * Subscribes to events on objects in the three.js scene
   * @param userDataKey - only objects with the following `userData` will be observed
   */
  observeObjects(e) {
    this.state.objectsObservers[e] || (this.state.objectsObservers[e] = null);
  }
  /**
   * Unsubscribes to events on objects
   */
  unobserveObjects(e) {
    delete this.state.objectsObservers[e];
  }
  /**
   * Stops all current animations
   * @internal
   */
  stopAll() {
    return this.dispatchEvent(new ae()), this.disableIdleTimer(), this.stopAnimation();
  }
};
const ur = {
  keyboard: "always",
  mousemove: !0,
  mousewheel: !0,
  moveInertia: !0,
  touchmoveTwoFingers: !1
}, Ge = [
  { id: "16:9", label: "16:9", width: 16, height: 9 },
  { id: "9:16", label: "9:16", width: 9, height: 16 },
  { id: "1:1", label: "1:1", width: 1, height: 1 },
  { id: "4:3", label: "4:3", width: 4, height: 3 }
], pr = "16:9", Fs = 48, qe = 96, Us = g.createContext(null);
function vr(e) {
  return {
    isEquirectangular: !0,
    fullWidth: e.width,
    fullHeight: e.height,
    croppedWidth: e.width,
    croppedHeight: e.height,
    croppedX: 0,
    croppedY: 0,
    poseHeading: 0,
    posePitch: 0,
    poseRoll: 0
  };
}
function fr(e) {
  return Ge.find((t) => t.id === e) || Ge[0];
}
function mr(e) {
  const i = e?.renderer?.renderer?.domElement;
  return i instanceof HTMLCanvasElement ? i : e?.container.querySelector("canvas") ?? null;
}
function wr(e, t) {
  const i = mr(e);
  if (!i || i.width <= 0 || i.height <= 0) return null;
  const s = e.container.getBoundingClientRect(), n = t.getBoundingClientRect(), r = Math.max(n.left, s.left), o = Math.max(n.top, s.top), a = Math.min(n.right, s.right), h = Math.min(n.bottom, s.bottom);
  if (a <= r || h <= o || s.width <= 0 || s.height <= 0) return null;
  const c = i.width / s.width, u = i.height / s.height, m = Math.max(0, Math.round((r - s.left) * c)), l = Math.max(0, Math.round((o - s.top) * u)), b = Math.max(1, Math.min(i.width - m, Math.round((a - r) * c))), x = Math.max(1, Math.min(i.height - l, Math.round((h - o) * u))), w = document.createElement("canvas");
  w.width = b, w.height = x;
  const ue = w.getContext("2d");
  if (!ue) return null;
  try {
    return ue.drawImage(i, m, l, b, x, 0, 0, b, x), {
      dataUrl: w.toDataURL("image/png"),
      dimensions: { width: w.width, height: w.height },
      title: ut.t("generationCommon.panorama.screenshotTitle"),
      prompt: ut.t("generationCommon.panorama.screenshotPrompt"),
      source: "panorama-framed-screenshot"
    };
  } catch {
    return null;
  }
}
function gr(e, t) {
  return new Promise((i) => {
    let s = !1, n = null;
    const r = () => {
      s || (s = !0, n && clearTimeout(n), i(wr(e, t)));
    };
    e.addEventListener("render", r, { once: !0 }), n = setTimeout(r, 250), e.needsUpdate();
  });
}
function br(e) {
  const [t, i] = g.useState({ width: 0, height: 0 });
  return g.useLayoutEffect(() => {
    if (!e) {
      i({ width: 0, height: 0 });
      return;
    }
    const s = () => {
      const r = e.getBoundingClientRect();
      i({
        width: Math.max(0, Math.round(r.width)),
        height: Math.max(0, Math.round(r.height))
      });
    };
    if (s(), typeof ResizeObserver > "u") return;
    const n = new ResizeObserver(s);
    return n.observe(e), () => n.disconnect();
  }, [e]), t;
}
function Er(e, t) {
  if (e.width <= 0 || e.height <= 0) return null;
  const i = t.width / t.height, s = Math.max(1, e.width - Fs), n = Math.max(1, e.height - qe);
  if (s / n > i) {
    const o = Math.max(1, Math.round(n));
    return { width: Math.max(1, Math.round(o * i)), height: o };
  }
  const r = Math.max(1, Math.round(s));
  return { width: r, height: Math.max(1, Math.round(r / i)) };
}
function yr({
  children: e,
  config: t,
  imageUrl: i
}) {
  const s = g.useRef(null), [n, r] = g.useState(null);
  return g.useLayoutEffect(() => {
    const o = s.current;
    if (!o || !i) return;
    o.innerHTML = "";
    const a = new dr({
      container: o,
      panorama: i,
      adapter: ht.withConfig({
        resolution: 128,
        useXmpData: !1
      }),
      panoData: vr,
      navbar: !1,
      loadingTxt: "",
      canvasBackground: "#000",
      defaultYaw: 0,
      defaultPitch: 0,
      defaultZoomLvl: 50,
      rendererParameters: {
        alpha: !1,
        antialias: !1,
        powerPreference: "low-power",
        preserveDrawingBuffer: !0
      },
      ...t
    });
    r(a);
    let h = !1, c = 0, u = 0, m = null, l = null;
    const b = () => {
      if (h) return;
      const x = o.getBoundingClientRect();
      if (!(x.width <= 0 || x.height <= 0))
        try {
          a.resize({
            width: `${Math.round(x.width)}px`,
            height: `${Math.round(x.height)}px`
          }), a.needsUpdate();
        } catch {
        }
    };
    return a.addEventListener("ready", b, { once: !0 }), c = requestAnimationFrame(() => {
      b(), u = requestAnimationFrame(b);
    }), m = setTimeout(b, 240), typeof ResizeObserver < "u" && (l = new ResizeObserver(b), l.observe(o)), () => {
      h = !0, cancelAnimationFrame(c), cancelAnimationFrame(u), m && clearTimeout(m), l?.disconnect(), r((x) => x === a ? null : x);
      try {
        a.destroy();
      } catch {
      }
      o.innerHTML = "";
    };
  }, [t, i]), /* @__PURE__ */ d.jsxs(Us.Provider, { value: n, children: [
    /* @__PURE__ */ d.jsx(
      "div",
      {
        ref: s,
        className: "h-full w-full [&_.psv-container]:!bg-nomi-ink",
        style: { width: "100%", height: "100%" }
      }
    ),
    e
  ] });
}
function _r({
  captureFrameRef: e,
  captureRatio: t,
  frameSize: i
}) {
  return /* @__PURE__ */ d.jsx("div", { className: "pointer-events-none absolute inset-0 z-[1] flex items-center justify-center", "aria-hidden": "true", children: /* @__PURE__ */ d.jsxs(
    "div",
    {
      ref: e,
      "data-panorama-capture-frame": !0,
      className: "relative rounded-nomi-sm border border-nomi-paper/[0.92]",
      style: {
        width: i?.width ?? "auto",
        height: i?.height ?? `max(1px, calc(100% - ${qe}px))`,
        maxWidth: `max(1px, calc(100% - ${Fs}px))`,
        maxHeight: `max(1px, calc(100% - ${qe}px))`,
        aspectRatio: `${t.width} / ${t.height}`,
        boxSizing: "border-box",
        flex: "0 0 auto",
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.56), 0 0 0 1px rgba(0, 0, 0, 0.45) inset"
      },
      children: [
        /* @__PURE__ */ d.jsx("span", { className: "absolute left-[-1px] top-[-1px] h-5 w-5 rounded-tl-[6px] border-l-2 border-t-2 border-nomi-paper" }),
        /* @__PURE__ */ d.jsx("span", { className: "absolute right-[-1px] top-[-1px] h-5 w-5 rounded-tr-[6px] border-r-2 border-t-2 border-nomi-paper" }),
        /* @__PURE__ */ d.jsx("span", { className: "absolute bottom-[-1px] left-[-1px] h-5 w-5 rounded-bl-[6px] border-b-2 border-l-2 border-nomi-paper" }),
        /* @__PURE__ */ d.jsx("span", { className: "absolute bottom-[-1px] right-[-1px] h-5 w-5 rounded-br-[6px] border-b-2 border-r-2 border-nomi-paper" })
      ]
    }
  ) });
}
function xr({
  captureFrameRef: e,
  captureRatioId: t,
  onCaptureRatioChange: i,
  onClose: s,
  onScreenshot: n
}) {
  const { t: r } = Tt(), o = g.useContext(Us), [a, h] = g.useState(!1), [c, u] = g.useState(null), m = g.useRef(!0), l = g.useRef(null), b = g.useCallback((w) => {
    l.current && clearTimeout(l.current), u(w), l.current = setTimeout(() => {
      m.current && u(null);
    }, 2200);
  }, []);
  g.useEffect(() => (m.current = !0, () => {
    m.current = !1, l.current && clearTimeout(l.current);
  }), []);
  const x = g.useCallback(() => {
    if (!a) {
      if (!o || !e.current) {
        b({ tone: "info", message: r("generationCommon.panorama.notReady") }), Re(r("generationCommon.panorama.notReady"), "info");
        return;
      }
      h(!0), b({ tone: "info", message: r("generationCommon.panorama.capturing") }), gr(o, e.current).then((w) => {
        if (!w) {
          b({ tone: "error", message: r("generationCommon.panorama.captureFailed") }), Re(r("generationCommon.panorama.captureFailed"), "error");
          return;
        }
        n?.(w), b({ tone: "success", message: r("generationCommon.panorama.created") });
      }).catch(() => {
        b({ tone: "error", message: r("generationCommon.panorama.captureFailed") }), Re(r("generationCommon.panorama.captureFailed"), "error");
      }).finally(() => {
        m.current && h(!1);
      });
    }
  }, [e, a, n, b, r, o]);
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    c ? /* @__PURE__ */ d.jsx(
      "div",
      {
        className: N(
          "pointer-events-none absolute bottom-6 left-1/2 z-[4] -translate-x-1/2",
          "rounded-pill border px-4 py-2 text-caption font-semibold shadow-[0_14px_34px_rgba(0,0,0,0.42)]",
          c.tone === "success" ? "border-white/85 bg-white text-black" : c.tone === "error" ? "border-white/40 bg-workbench-danger text-white" : "border-white/20 bg-black/90 text-white"
        ),
        role: "status",
        "aria-live": "polite",
        children: c.message
      }
    ) : null,
    /* @__PURE__ */ d.jsx(
      "div",
      {
        className: N(
          "absolute left-1/2 top-3 z-[3] flex -translate-x-1/2 items-center gap-1 p-1",
          "rounded-pill border border-nomi-line bg-nomi-paper shadow-nomi-md",
          "backdrop-blur-[12px] saturate-[1.2]"
        ),
        onPointerDown: (w) => w.stopPropagation(),
        children: Ge.map((w) => /* @__PURE__ */ d.jsx(
          "button",
          {
            type: "button",
            className: N(
              "h-7 rounded-full px-2.5 text-micro font-medium tabular-nums transition-colors duration-150",
              t === w.id ? "bg-nomi-ink text-nomi-paper" : "bg-transparent text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink"
            ),
            "aria-pressed": t === w.id,
            onClick: () => i(w.id),
            children: w.label
          },
          w.id
        ))
      }
    ),
    /* @__PURE__ */ d.jsxs(
      "div",
      {
        className: N(
          "absolute right-3 top-3 z-[3] flex items-center gap-1 p-1.5",
          "rounded-pill border border-nomi-line bg-nomi-paper shadow-nomi-md",
          "backdrop-blur-[12px] saturate-[1.2]"
        ),
        onPointerDown: (w) => w.stopPropagation(),
        children: [
          /* @__PURE__ */ d.jsx(
            ft,
            {
              className: N(
                "inline-grid h-6 w-6 place-items-center p-0",
                "rounded-full border border-transparent bg-transparent text-nomi-ink-60 cursor-pointer",
                "hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "disabled:opacity-45 disabled:cursor-wait"
              ),
              label: r(a ? "generationCommon.panorama.capturingShort" : "generationCommon.panorama.captureFrame"),
              icon: /* @__PURE__ */ d.jsx(un, { size: 15 }),
              disabled: a,
              onClick: x
            }
          ),
          /* @__PURE__ */ d.jsx(
            ft,
            {
              className: N(
                "inline-grid h-6 w-6 place-items-center p-0",
                "rounded-full border border-transparent bg-transparent text-nomi-ink-60 cursor-pointer",
                "hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "disabled:opacity-45 disabled:cursor-wait"
              ),
              label: r("generationCommon.panorama.closePreview"),
              icon: /* @__PURE__ */ d.jsx(Xs, { size: 15 }),
              onClick: s
            }
          )
        ]
      }
    )
  ] });
}
function Sr({
  imageUrl: e,
  width: t,
  height: i,
  onEnterFullscreen: s,
  onScreenshot: n
}) {
  const { t: r } = Tt(), [o, a] = g.useState(!1), [h, c] = g.useState(pr), u = g.useId().replace(/[^a-zA-Z0-9_-]/g, ""), [m, l] = g.useState(null), b = g.useRef(null), x = br(m), w = fr(h), ue = Er(x, w), Ae = g.useCallback(() => {
    a(!0);
  }, []);
  return g.useLayoutEffect(() => (s?.(Ae), () => s?.(null)), [s, Ae]), g.useEffect(() => {
    if (!o) return;
    const L = document.body, ze = document.documentElement, js = L.style.overflow, Vs = ze.style.overflow;
    L.style.overflow = "hidden", ze.style.overflow = "hidden";
    const dt = (Ws) => {
      Ws.key === "Escape" && a(!1);
    };
    return document.addEventListener("keydown", dt), () => {
      document.removeEventListener("keydown", dt), L.style.overflow = js, ze.style.overflow = Vs;
    };
  }, [o]), e ? /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsxs(
      "div",
      {
        className: "group relative overflow-hidden rounded-nomi bg-nomi-ink",
        style: { width: t, height: i },
        "data-panorama-viewer-id": u,
        children: [
          /* @__PURE__ */ d.jsx(
            Bs,
            {
              src: e,
              className: "h-full w-full object-cover object-center pointer-events-none select-none",
              alt: ""
            }
          ),
          /* @__PURE__ */ d.jsx("div", { className: "absolute inset-0 pointer-events-none flex items-center justify-center", children: /* @__PURE__ */ d.jsxs(
            "button",
            {
              type: "button",
              onPointerDown: (L) => L.stopPropagation(),
              onClick: (L) => {
                L.stopPropagation(), Ae();
              },
              className: N(
                "pointer-events-auto inline-flex items-center gap-1.5 rounded-full",
                "px-3 py-1.5 text-micro font-medium text-nomi-paper",
                "bg-[color-mix(in_oklab,var(--nomi-ink)64%,transparent)] backdrop-blur-[6px]",
                "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                "hover:bg-[color-mix(in_oklab,var(--nomi-ink)80%,transparent)] focus-visible:opacity-100"
              ),
              "aria-label": r("generationCommon.panorama.enterAria"),
              children: [
                /* @__PURE__ */ d.jsx(pn, { size: 14, stroke: 1.6 }),
                r("generationCommon.panorama.enter")
              ]
            }
          ) })
        ]
      }
    ),
    o && typeof document < "u" ? Ys.createPortal(
      /* @__PURE__ */ d.jsx(
        "div",
        {
          className: N(
            "fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center overflow-hidden p-8 overscroll-contain",
            "bg-workbench-backdrop backdrop-blur-[10px]"
          ),
          onPointerDown: (L) => L.stopPropagation(),
          onClick: (L) => {
            L.target === L.currentTarget && a(!1);
          },
          children: /* @__PURE__ */ d.jsx(
            "section",
            {
              ref: l,
              className: N(
                "relative w-[min(96vw,calc((100vh-64px)*16/9))] aspect-video",
                "max-h-[calc(100vh-64px)] overflow-hidden rounded-nomi-lg",
                "bg-nomi-ink shadow-nomi-lg"
              ),
              "data-panorama-dialog-panel": !0,
              role: "dialog",
              "aria-modal": "true",
              "aria-label": r("generationCommon.panorama.preview"),
              children: /* @__PURE__ */ d.jsxs(
                yr,
                {
                  imageUrl: e,
                  config: ur,
                  children: [
                    /* @__PURE__ */ d.jsx(
                      _r,
                      {
                        captureFrameRef: b,
                        captureRatio: w,
                        frameSize: ue
                      }
                    ),
                    /* @__PURE__ */ d.jsx(
                      xr,
                      {
                        captureFrameRef: b,
                        captureRatioId: h,
                        onCaptureRatioChange: c,
                        onClose: () => a(!1),
                        onScreenshot: (L) => n?.(L)
                      }
                    )
                  ]
                },
                `fullscreen-${e}`
              )
            }
          )
        }
      ),
      document.body
    ) : null
  ] }) : /* @__PURE__ */ d.jsx("div", { className: "flex items-center justify-center text-caption opacity-50", style: { width: t, height: i }, children: r("generationCommon.panorama.empty") });
}
export {
  Sr as default
};
