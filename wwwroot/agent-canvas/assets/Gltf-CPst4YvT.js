import { cH as J, cU as Hc, cV as da, bp as xc, c8 as Ee, S as Lc } from "./agentStudioMount-D2l2f4Xv.js";
import { a as Pc, T as _c } from "./three.module-DbUzIx2U.js";
import { eW as Aa, dS as pa, dW as ha, fj as Jc, dU as di, gl as Oc, dT as Nc, D as kc, dw as Uc, A as Kc, a1 as Qc, a9 as jc, gn as tt, gm as ts, ce as Ai, ej as zc, gd as Xc, eg as Yc, g2 as Wc, g0 as Hi, g1 as Ba, cE as ma, cF as Xn, bh as br, db as ct, aa as Wt, fA as Zc, d_ as Vc, aU as qc, d1 as $r, bR as bc, e9 as Ca, bO as $c, dH as ga, fV as ef, bJ as tf, N as Yn, bW as nf, cz as va, dm as rf, cA as sf, dn as of, cv as Ea, dj as lf, f1 as xi, df as af, a8 as uf, e1 as cf, cX as pi, cp as ff, dc as ya, aY as df, d4 as zn, e5 as Af, O as Fa, ft as pf, d3 as hf, cu as Bf, cn as mf, ct as Cf, e0 as gf, bD as hi, c_ as vf, fr as Ef, l as yf, G as Ff, b_ as Mf, b$ as Ma, bX as Rf, fU as Pl, gp as _l, dE as Jl, ea as Ol, bo as Sf, bY as If, J as Gf, fv as Df } from "./scene3dConstants-DlRfsgmW.js";
var Bi = { exports: {} }, xt = {};
var Nl;
function Tf() {
  return Nl || (Nl = 1, xt.ConcurrentRoot = 1, xt.ContinuousEventPriority = 4, xt.DefaultEventPriority = 16, xt.DiscreteEventPriority = 1, xt.IdleEventPriority = 536870912, xt.LegacyRoot = 0), xt;
}
var kl;
function wf() {
  return kl || (kl = 1, Bi.exports = Tf()), Bi.exports;
}
var Bn = wf();
function Hf(f) {
  let s;
  const i = /* @__PURE__ */ new Set(), c = (m, A) => {
    const h = typeof m == "function" ? m(s) : m;
    if (h !== s) {
      const g = s;
      s = A ? h : Object.assign({}, s, h), i.forEach((v) => v(s, g));
    }
  }, l = () => s, d = (m, A = l, h = Object.is) => {
    console.warn("[DEPRECATED] Please use `subscribeWithSelector` middleware");
    let g = A(s);
    function v() {
      const E = A(s);
      if (!h(g, E)) {
        const T = g;
        m(g = E, T);
      }
    }
    return i.add(v), () => i.delete(v);
  }, p = { setState: c, getState: l, subscribe: (m, A, h) => A || h ? d(m, A, h) : (i.add(m), () => i.delete(m)), destroy: () => i.clear() };
  return s = f(c, l, p), p;
}
const xf = typeof window > "u" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent), Ul = xf ? J.useEffect : J.useLayoutEffect;
function Ra(f) {
  const s = typeof f == "function" ? Hf(f) : f, i = (c = s.getState, l = Object.is) => {
    const [, d] = J.useReducer((G) => G + 1, 0), u = s.getState(), B = J.useRef(u), p = J.useRef(c), m = J.useRef(l), A = J.useRef(!1), h = J.useRef();
    h.current === void 0 && (h.current = c(u));
    let g, v = !1;
    (B.current !== u || p.current !== c || m.current !== l || A.current) && (g = c(u), v = !l(h.current, g)), Ul(() => {
      v && (h.current = g), B.current = u, p.current = c, m.current = l, A.current = !1;
    });
    const E = J.useRef(u);
    Ul(() => {
      const G = () => {
        try {
          const S = s.getState(), w = p.current(S);
          m.current(h.current, w) || (B.current = S, h.current = w, d());
        } catch {
          A.current = !0, d();
        }
      }, M = s.subscribe(G);
      return s.getState() !== E.current && G(), M;
    }, []);
    const T = v ? g : h.current;
    return J.useDebugValue(T), T;
  };
  return Object.assign(i, s), i[Symbol.iterator] = function() {
    console.warn("[useStore, api] = create() is deprecated and will be removed in v4");
    const c = [i, s];
    return {
      next() {
        const l = c.length <= 0;
        return { value: c.shift(), done: l };
      }
    };
  }, i;
}
const Lf = (f) => typeof f == "object" && typeof f.then == "function", Xt = [];
function Sa(f, s, i = (c, l) => c === l) {
  if (f === s) return !0;
  if (!f || !s) return !1;
  const c = f.length;
  if (s.length !== c) return !1;
  for (let l = 0; l < c; l++) if (!i(f[l], s[l])) return !1;
  return !0;
}
function Ia(f, s = null, i = !1, c = {}) {
  s === null && (s = [f]);
  for (const d of Xt)
    if (Sa(s, d.keys, d.equal)) {
      if (i) return;
      if (Object.prototype.hasOwnProperty.call(d, "error")) throw d.error;
      if (Object.prototype.hasOwnProperty.call(d, "response"))
        return c.lifespan && c.lifespan > 0 && (d.timeout && clearTimeout(d.timeout), d.timeout = setTimeout(d.remove, c.lifespan)), d.response;
      if (!i) throw d.promise;
    }
  const l = {
    keys: s,
    equal: c.equal,
    remove: () => {
      const d = Xt.indexOf(l);
      d !== -1 && Xt.splice(d, 1);
    },
    promise: (
      // Execute the promise
      (Lf(f) ? f : f(...s)).then((d) => {
        l.response = d, c.lifespan && c.lifespan > 0 && (l.timeout = setTimeout(l.remove, c.lifespan));
      }).catch((d) => l.error = d)
    )
  };
  if (Xt.push(l), !i) throw l.promise;
}
const Pf = (f, s, i) => Ia(f, s, !1, i), _f = (f, s, i) => {
  Ia(f, s, !0, i);
}, Jf = (f) => {
  if (f === void 0 || f.length === 0) Xt.splice(0, Xt.length);
  else {
    const s = Xt.find((i) => Sa(f, i.keys, i.equal));
    s && s.remove();
  }
};
var mi = { exports: {} };
var Ci, Kl;
function Of() {
  return Kl || (Kl = 1, Ci = function(s) {
    var i = {}, c = Hc(), l = da(), d = Object.assign;
    function u(e) {
      for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
      return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    var B = c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, p = /* @__PURE__ */ Symbol.for("react.element"), m = /* @__PURE__ */ Symbol.for("react.portal"), A = /* @__PURE__ */ Symbol.for("react.fragment"), h = /* @__PURE__ */ Symbol.for("react.strict_mode"), g = /* @__PURE__ */ Symbol.for("react.profiler"), v = /* @__PURE__ */ Symbol.for("react.provider"), E = /* @__PURE__ */ Symbol.for("react.context"), T = /* @__PURE__ */ Symbol.for("react.forward_ref"), G = /* @__PURE__ */ Symbol.for("react.suspense"), M = /* @__PURE__ */ Symbol.for("react.suspense_list"), S = /* @__PURE__ */ Symbol.for("react.memo"), w = /* @__PURE__ */ Symbol.for("react.lazy"), x = /* @__PURE__ */ Symbol.for("react.offscreen"), U = Symbol.iterator;
    function K(e) {
      return e === null || typeof e != "object" ? null : (e = U && e[U] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    function X(e) {
      if (e == null) return null;
      if (typeof e == "function") return e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case A:
          return "Fragment";
        case m:
          return "Portal";
        case g:
          return "Profiler";
        case h:
          return "StrictMode";
        case G:
          return "Suspense";
        case M:
          return "SuspenseList";
      }
      if (typeof e == "object") switch (e.$$typeof) {
        case E:
          return (e.displayName || "Context") + ".Consumer";
        case v:
          return (e._context.displayName || "Context") + ".Provider";
        case T:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case S:
          return t = e.displayName || null, t !== null ? t : X(e.type) || "Memo";
        case w:
          t = e._payload, e = e._init;
          try {
            return X(e(t));
          } catch {
          }
      }
      return null;
    }
    function te(e) {
      var t = e.type;
      switch (e.tag) {
        case 24:
          return "Cache";
        case 9:
          return (t.displayName || "Context") + ".Consumer";
        case 10:
          return (t._context.displayName || "Context") + ".Provider";
        case 18:
          return "DehydratedFragment";
        case 11:
          return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
        case 7:
          return "Fragment";
        case 5:
          return t;
        case 4:
          return "Portal";
        case 3:
          return "Root";
        case 6:
          return "Text";
        case 16:
          return X(t);
        case 8:
          return t === h ? "StrictMode" : "Mode";
        case 22:
          return "Offscreen";
        case 12:
          return "Profiler";
        case 21:
          return "Scope";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 25:
          return "TracingMarker";
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
          if (typeof t == "function") return t.displayName || t.name || null;
          if (typeof t == "string") return t;
      }
      return null;
    }
    function Z(e) {
      var t = e, n = e;
      if (e.alternate) for (; t.return; ) t = t.return;
      else {
        e = t;
        do
          t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return;
        while (e);
      }
      return t.tag === 3 ? n : null;
    }
    function q(e) {
      if (Z(e) !== e) throw Error(u(188));
    }
    function O(e) {
      var t = e.alternate;
      if (!t) {
        if (t = Z(e), t === null) throw Error(u(188));
        return t !== e ? null : e;
      }
      for (var n = e, r = t; ; ) {
        var o = n.return;
        if (o === null) break;
        var a = o.alternate;
        if (a === null) {
          if (r = o.return, r !== null) {
            n = r;
            continue;
          }
          break;
        }
        if (o.child === a.child) {
          for (a = o.child; a; ) {
            if (a === n) return q(o), e;
            if (a === r) return q(o), t;
            a = a.sibling;
          }
          throw Error(u(188));
        }
        if (n.return !== r.return) n = o, r = a;
        else {
          for (var C = !1, y = o.child; y; ) {
            if (y === n) {
              C = !0, n = o, r = a;
              break;
            }
            if (y === r) {
              C = !0, r = o, n = a;
              break;
            }
            y = y.sibling;
          }
          if (!C) {
            for (y = a.child; y; ) {
              if (y === n) {
                C = !0, n = a, r = o;
                break;
              }
              if (y === r) {
                C = !0, r = a, n = o;
                break;
              }
              y = y.sibling;
            }
            if (!C) throw Error(u(189));
          }
        }
        if (n.alternate !== r) throw Error(u(190));
      }
      if (n.tag !== 3) throw Error(u(188));
      return n.stateNode.current === n ? e : t;
    }
    function ne(e) {
      return e = O(e), e !== null ? De(e) : null;
    }
    function De(e) {
      if (e.tag === 5 || e.tag === 6) return e;
      for (e = e.child; e !== null; ) {
        var t = De(e);
        if (t !== null) return t;
        e = e.sibling;
      }
      return null;
    }
    function Et(e) {
      if (e.tag === 5 || e.tag === 6) return e;
      for (e = e.child; e !== null; ) {
        if (e.tag !== 4) {
          var t = Et(e);
          if (t !== null) return t;
        }
        e = e.sibling;
      }
      return null;
    }
    var ft = Array.isArray, dt = s.getPublicInstance, Zt = s.getRootHostContext, ke = s.getChildHostContext, nt = s.prepareForCommit, fe = s.resetAfterCommit, le = s.createInstance, Ve = s.appendInitialChild, ae = s.finalizeInitialChildren, Vt = s.prepareUpdate, yt = s.shouldSetTextContent, ji = s.createTextInstance, zi = s.scheduleTimeout, Wa = s.cancelTimeout, ns = s.noTimeout, qn = s.isPrimaryRenderer, qe = s.supportsMutation, bn = s.supportsPersistence, Pe = s.supportsHydration, Za = s.getInstanceFromNode, Va = s.preparePortalMount, qa = s.getCurrentEventPriority, ba = s.detachDeletedInstance, $a = s.supportsMicrotasks, eu = s.scheduleMicrotask, gn = s.supportsTestSelectors, tu = s.findFiberRoot, nu = s.getBoundingRect, ru = s.getTextContent, vn = s.isHiddenSubtree, su = s.matchAccessibilityRole, iu = s.setFocusIfFocusable, ou = s.setupIntersectionObserver, lu = s.appendChild, au = s.appendChildToContainer, uu = s.commitTextUpdate, cu = s.commitMount, fu = s.commitUpdate, du = s.insertBefore, Au = s.insertInContainerBefore, pu = s.removeChild, hu = s.removeChildFromContainer, Xi = s.resetTextContent, Bu = s.hideInstance, mu = s.hideTextInstance, Cu = s.unhideInstance, gu = s.unhideTextInstance, vu = s.clearContainer, Eu = s.cloneInstance, Yi = s.createContainerChildSet, Wi = s.appendChildToContainerChildSet, yu = s.finalizeContainerChildren, Zi = s.replaceContainerChildren, Vi = s.cloneHiddenInstance, qi = s.cloneHiddenTextInstance, Fu = s.canHydrateInstance, Mu = s.canHydrateTextInstance, Ru = s.canHydrateSuspenseInstance, bi = s.isSuspenseInstancePending, rs = s.isSuspenseInstanceFallback, Su = s.registerSuspenseInstanceRetry, En = s.getNextHydratableSibling, Iu = s.getFirstHydratableChild, Gu = s.getFirstHydratableChildWithinContainer, Du = s.getFirstHydratableChildWithinSuspenseInstance, Tu = s.hydrateInstance, wu = s.hydrateTextInstance, Hu = s.hydrateSuspenseInstance, xu = s.getNextHydratableInstanceAfterSuspenseInstance, $i = s.commitHydratedContainer, Lu = s.commitHydratedSuspenseInstance, Pu = s.clearSuspenseBoundary, _u = s.clearSuspenseBoundaryFromContainer, Ju = s.shouldDeleteUnhydratedTailInstances, Ou = s.didNotMatchHydratedContainerTextInstance, Nu = s.didNotMatchHydratedTextInstance, ss;
    function yn(e) {
      if (ss === void 0) try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        ss = t && t[1] || "";
      }
      return `
` + ss + e;
    }
    var is = !1;
    function os(e, t) {
      if (!e || is) return "";
      is = !0;
      var n = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        if (t) if (t = function() {
          throw Error();
        }, Object.defineProperty(t.prototype, "props", { set: function() {
          throw Error();
        } }), typeof Reflect == "object" && Reflect.construct) {
          try {
            Reflect.construct(t, []);
          } catch (H) {
            var r = H;
          }
          Reflect.construct(e, [], t);
        } else {
          try {
            t.call();
          } catch (H) {
            r = H;
          }
          e.call(t.prototype);
        }
        else {
          try {
            throw Error();
          } catch (H) {
            r = H;
          }
          e();
        }
      } catch (H) {
        if (H && r && typeof H.stack == "string") {
          for (var o = H.stack.split(`
`), a = r.stack.split(`
`), C = o.length - 1, y = a.length - 1; 1 <= C && 0 <= y && o[C] !== a[y]; ) y--;
          for (; 1 <= C && 0 <= y; C--, y--) if (o[C] !== a[y]) {
            if (C !== 1 || y !== 1)
              do
                if (C--, y--, 0 > y || o[C] !== a[y]) {
                  var D = `
` + o[C].replace(" at new ", " at ");
                  return e.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", e.displayName)), D;
                }
              while (1 <= C && 0 <= y);
            break;
          }
        }
      } finally {
        is = !1, Error.prepareStackTrace = n;
      }
      return (e = e ? e.displayName || e.name : "") ? yn(e) : "";
    }
    var ku = Object.prototype.hasOwnProperty, ls = [], qt = -1;
    function Ft(e) {
      return { current: e };
    }
    function oe(e) {
      0 > qt || (e.current = ls[qt], ls[qt] = null, qt--);
    }
    function se(e, t) {
      qt++, ls[qt] = e.current, e.current = t;
    }
    var Mt = {}, ye = Ft(Mt), Te = Ft(!1), Pt = Mt;
    function bt(e, t) {
      var n = e.type.contextTypes;
      if (!n) return Mt;
      var r = e.stateNode;
      if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
      var o = {}, a;
      for (a in n) o[a] = t[a];
      return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = o), o;
    }
    function we(e) {
      return e = e.childContextTypes, e != null;
    }
    function $n() {
      oe(Te), oe(ye);
    }
    function eo(e, t, n) {
      if (ye.current !== Mt) throw Error(u(168));
      se(ye, t), se(Te, n);
    }
    function to(e, t, n) {
      var r = e.stateNode;
      if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
      r = r.getChildContext();
      for (var o in r) if (!(o in t)) throw Error(u(108, te(e) || "Unknown", o));
      return d({}, n, r);
    }
    function er(e) {
      return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Mt, Pt = ye.current, se(ye, e), se(Te, Te.current), !0;
    }
    function no(e, t, n) {
      var r = e.stateNode;
      if (!r) throw Error(u(169));
      n ? (e = to(e, t, Pt), r.__reactInternalMemoizedMergedChildContext = e, oe(Te), oe(ye), se(ye, e)) : oe(Te), se(Te, n);
    }
    var be = Math.clz32 ? Math.clz32 : Qu, Uu = Math.log, Ku = Math.LN2;
    function Qu(e) {
      return e >>>= 0, e === 0 ? 32 : 31 - (Uu(e) / Ku | 0) | 0;
    }
    var tr = 64, nr = 4194304;
    function Fn(e) {
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 4194240;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return e & 130023424;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 1073741824;
        default:
          return e;
      }
    }
    function rr(e, t) {
      var n = e.pendingLanes;
      if (n === 0) return 0;
      var r = 0, o = e.suspendedLanes, a = e.pingedLanes, C = n & 268435455;
      if (C !== 0) {
        var y = C & ~o;
        y !== 0 ? r = Fn(y) : (a &= C, a !== 0 && (r = Fn(a)));
      } else C = n & ~o, C !== 0 ? r = Fn(C) : a !== 0 && (r = Fn(a));
      if (r === 0) return 0;
      if (t !== 0 && t !== r && (t & o) === 0 && (o = r & -r, a = t & -t, o >= a || o === 16 && (a & 4194240) !== 0)) return t;
      if ((r & 4) !== 0 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - be(t), o = 1 << n, r |= e[n], t &= ~o;
      return r;
    }
    function ju(e, t) {
      switch (e) {
        case 1:
        case 2:
        case 4:
          return t + 250;
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return -1;
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function zu(e, t) {
      for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, a = e.pendingLanes; 0 < a; ) {
        var C = 31 - be(a), y = 1 << C, D = o[C];
        D === -1 ? ((y & n) === 0 || (y & r) !== 0) && (o[C] = ju(y, t)) : D <= t && (e.expiredLanes |= y), a &= ~y;
      }
    }
    function as(e) {
      return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
    }
    function us(e) {
      for (var t = [], n = 0; 31 > n; n++) t.push(e);
      return t;
    }
    function Mn(e, t, n) {
      e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - be(t), e[t] = n;
    }
    function Xu(e, t) {
      var n = e.pendingLanes & ~t;
      e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
      var r = e.eventTimes;
      for (e = e.expirationTimes; 0 < n; ) {
        var o = 31 - be(n), a = 1 << o;
        t[o] = 0, r[o] = -1, e[o] = -1, n &= ~a;
      }
    }
    function cs(e, t) {
      var n = e.entangledLanes |= t;
      for (e = e.entanglements; n; ) {
        var r = 31 - be(n), o = 1 << r;
        o & t | e[r] & t && (e[r] |= t), n &= ~o;
      }
    }
    var b = 0;
    function ro(e) {
      return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
    }
    var fs = l.unstable_scheduleCallback, so = l.unstable_cancelCallback, Yu = l.unstable_shouldYield, Wu = l.unstable_requestPaint, me = l.unstable_now, ds = l.unstable_ImmediatePriority, Zu = l.unstable_UserBlockingPriority, As = l.unstable_NormalPriority, Vu = l.unstable_IdlePriority, sr = null, rt = null;
    function qu(e) {
      if (rt && typeof rt.onCommitFiberRoot == "function") try {
        rt.onCommitFiberRoot(sr, e, void 0, (e.current.flags & 128) === 128);
      } catch {
      }
    }
    function bu(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    var st = typeof Object.is == "function" ? Object.is : bu, At = null, ir = !1, ps = !1;
    function io(e) {
      At === null ? At = [e] : At.push(e);
    }
    function $u(e) {
      ir = !0, io(e);
    }
    function it() {
      if (!ps && At !== null) {
        ps = !0;
        var e = 0, t = b;
        try {
          var n = At;
          for (b = 1; e < n.length; e++) {
            var r = n[e];
            do
              r = r(!0);
            while (r !== null);
          }
          At = null, ir = !1;
        } catch (o) {
          throw At !== null && (At = At.slice(e + 1)), fs(ds, it), o;
        } finally {
          b = t, ps = !1;
        }
      }
      return null;
    }
    var ec = B.ReactCurrentBatchConfig;
    function or(e, t) {
      if (st(e, t)) return !0;
      if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
      var n = Object.keys(e), r = Object.keys(t);
      if (n.length !== r.length) return !1;
      for (r = 0; r < n.length; r++) {
        var o = n[r];
        if (!ku.call(t, o) || !st(e[o], t[o])) return !1;
      }
      return !0;
    }
    function tc(e) {
      switch (e.tag) {
        case 5:
          return yn(e.type);
        case 16:
          return yn("Lazy");
        case 13:
          return yn("Suspense");
        case 19:
          return yn("SuspenseList");
        case 0:
        case 2:
        case 15:
          return e = os(e.type, !1), e;
        case 11:
          return e = os(e.type.render, !1), e;
        case 1:
          return e = os(e.type, !0), e;
        default:
          return "";
      }
    }
    function $e(e, t) {
      if (e && e.defaultProps) {
        t = d({}, t), e = e.defaultProps;
        for (var n in e) t[n] === void 0 && (t[n] = e[n]);
        return t;
      }
      return t;
    }
    var lr = Ft(null), ar = null, $t = null, hs = null;
    function Bs() {
      hs = $t = ar = null;
    }
    function oo(e, t, n) {
      qn ? (se(lr, t._currentValue), t._currentValue = n) : (se(lr, t._currentValue2), t._currentValue2 = n);
    }
    function ms(e) {
      var t = lr.current;
      oe(lr), qn ? e._currentValue = t : e._currentValue2 = t;
    }
    function Cs(e, t, n) {
      for (; e !== null; ) {
        var r = e.alternate;
        if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
        e = e.return;
      }
    }
    function en(e, t) {
      ar = e, hs = $t = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (Oe = !0), e.firstContext = null);
    }
    function Ue(e) {
      var t = qn ? e._currentValue : e._currentValue2;
      if (hs !== e) if (e = { context: e, memoizedValue: t, next: null }, $t === null) {
        if (ar === null) throw Error(u(308));
        $t = e, ar.dependencies = { lanes: 0, firstContext: e };
      } else $t = $t.next = e;
      return t;
    }
    var ot = null, Rt = !1;
    function gs(e) {
      e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
    }
    function lo(e, t) {
      e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
    }
    function pt(e, t) {
      return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
    }
    function St(e, t) {
      var n = e.updateQueue;
      n !== null && (n = n.shared, pe !== null && (e.mode & 1) !== 0 && (W & 2) === 0 ? (e = n.interleaved, e === null ? (t.next = t, ot === null ? ot = [n] : ot.push(n)) : (t.next = e.next, e.next = t), n.interleaved = t) : (e = n.pending, e === null ? t.next = t : (t.next = e.next, e.next = t), n.pending = t));
    }
    function ur(e, t, n) {
      if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
        var r = t.lanes;
        r &= e.pendingLanes, n |= r, t.lanes = n, cs(e, n);
      }
    }
    function ao(e, t) {
      var n = e.updateQueue, r = e.alternate;
      if (r !== null && (r = r.updateQueue, n === r)) {
        var o = null, a = null;
        if (n = n.firstBaseUpdate, n !== null) {
          do {
            var C = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
            a === null ? o = a = C : a = a.next = C, n = n.next;
          } while (n !== null);
          a === null ? o = a = t : a = a.next = t;
        } else o = a = t;
        n = { baseState: r.baseState, firstBaseUpdate: o, lastBaseUpdate: a, shared: r.shared, effects: r.effects }, e.updateQueue = n;
        return;
      }
      e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
    }
    function cr(e, t, n, r) {
      var o = e.updateQueue;
      Rt = !1;
      var a = o.firstBaseUpdate, C = o.lastBaseUpdate, y = o.shared.pending;
      if (y !== null) {
        o.shared.pending = null;
        var D = y, H = D.next;
        D.next = null, C === null ? a = H : C.next = H, C = D;
        var _ = e.alternate;
        _ !== null && (_ = _.updateQueue, y = _.lastBaseUpdate, y !== C && (y === null ? _.firstBaseUpdate = H : y.next = H, _.lastBaseUpdate = D));
      }
      if (a !== null) {
        var j = o.baseState;
        C = 0, _ = H = D = null, y = a;
        do {
          var Q = y.lane, re = y.eventTime;
          if ((r & Q) === Q) {
            _ !== null && (_ = _.next = {
              eventTime: re,
              lane: 0,
              tag: y.tag,
              payload: y.payload,
              callback: y.callback,
              next: null
            });
            e: {
              var k = e, Se = y;
              switch (Q = t, re = n, Se.tag) {
                case 1:
                  if (k = Se.payload, typeof k == "function") {
                    j = k.call(re, j, Q);
                    break e;
                  }
                  j = k;
                  break e;
                case 3:
                  k.flags = k.flags & -65537 | 128;
                case 0:
                  if (k = Se.payload, Q = typeof k == "function" ? k.call(re, j, Q) : k, Q == null) break e;
                  j = d({}, j, Q);
                  break e;
                case 2:
                  Rt = !0;
              }
            }
            y.callback !== null && y.lane !== 0 && (e.flags |= 64, Q = o.effects, Q === null ? o.effects = [y] : Q.push(y));
          } else re = { eventTime: re, lane: Q, tag: y.tag, payload: y.payload, callback: y.callback, next: null }, _ === null ? (H = _ = re, D = j) : _ = _.next = re, C |= Q;
          if (y = y.next, y === null) {
            if (y = o.shared.pending, y === null) break;
            Q = y, y = Q.next, Q.next = null, o.lastBaseUpdate = Q, o.shared.pending = null;
          }
        } while (!0);
        if (_ === null && (D = j), o.baseState = D, o.firstBaseUpdate = H, o.lastBaseUpdate = _, t = o.shared.interleaved, t !== null) {
          o = t;
          do
            C |= o.lane, o = o.next;
          while (o !== t);
        } else a === null && (o.shared.lanes = 0);
        cn |= C, e.lanes = C, e.memoizedState = j;
      }
    }
    function uo(e, t, n) {
      if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
        var r = e[t], o = r.callback;
        if (o !== null) {
          if (r.callback = null, r = n, typeof o != "function") throw Error(u(191, o));
          o.call(r);
        }
      }
    }
    var co = new c.Component().refs;
    function vs(e, t, n, r) {
      t = e.memoizedState, n = n(r, t), n = n == null ? t : d({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
    }
    var fr = { isMounted: function(e) {
      return (e = e._reactInternals) ? Z(e) === e : !1;
    }, enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var r = Ge(), o = Dt(e), a = pt(r, o);
      a.payload = t, n != null && (a.callback = n), St(e, a), t = Xe(e, o, r), t !== null && ur(t, e, o);
    }, enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var r = Ge(), o = Dt(e), a = pt(r, o);
      a.tag = 1, a.payload = t, n != null && (a.callback = n), St(e, a), t = Xe(e, o, r), t !== null && ur(t, e, o);
    }, enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Ge(), r = Dt(e), o = pt(
        n,
        r
      );
      o.tag = 2, t != null && (o.callback = t), St(e, o), t = Xe(e, r, n), t !== null && ur(t, e, r);
    } };
    function fo(e, t, n, r, o, a, C) {
      return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, C) : t.prototype && t.prototype.isPureReactComponent ? !or(n, r) || !or(o, a) : !0;
    }
    function Ao(e, t, n) {
      var r = !1, o = Mt, a = t.contextType;
      return typeof a == "object" && a !== null ? a = Ue(a) : (o = we(t) ? Pt : ye.current, r = t.contextTypes, a = (r = r != null) ? bt(e, o) : Mt), t = new t(n, a), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = fr, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = o, e.__reactInternalMemoizedMaskedChildContext = a), t;
    }
    function po(e, t, n, r) {
      e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && fr.enqueueReplaceState(t, t.state, null);
    }
    function Es(e, t, n, r) {
      var o = e.stateNode;
      o.props = n, o.state = e.memoizedState, o.refs = co, gs(e);
      var a = t.contextType;
      typeof a == "object" && a !== null ? o.context = Ue(a) : (a = we(t) ? Pt : ye.current, o.context = bt(e, a)), o.state = e.memoizedState, a = t.getDerivedStateFromProps, typeof a == "function" && (vs(e, t, a, n), o.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), t !== o.state && fr.enqueueReplaceState(o, o.state, null), cr(e, n, o, r), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308);
    }
    var tn = [], nn = 0, dr = null, Ar = 0, Ke = [], Qe = 0, _t = null, ht = 1, Bt = "";
    function Jt(e, t) {
      tn[nn++] = Ar, tn[nn++] = dr, dr = e, Ar = t;
    }
    function ho(e, t, n) {
      Ke[Qe++] = ht, Ke[Qe++] = Bt, Ke[Qe++] = _t, _t = e;
      var r = ht;
      e = Bt;
      var o = 32 - be(r) - 1;
      r &= ~(1 << o), n += 1;
      var a = 32 - be(t) + o;
      if (30 < a) {
        var C = o - o % 5;
        a = (r & (1 << C) - 1).toString(32), r >>= C, o -= C, ht = 1 << 32 - be(t) + o | n << o | r, Bt = a + e;
      } else ht = 1 << a | n << o | r, Bt = e;
    }
    function ys(e) {
      e.return !== null && (Jt(e, 1), ho(e, 1, 0));
    }
    function Fs(e) {
      for (; e === dr; ) dr = tn[--nn], tn[nn] = null, Ar = tn[--nn], tn[nn] = null;
      for (; e === _t; ) _t = Ke[--Qe], Ke[Qe] = null, Bt = Ke[--Qe], Ke[Qe] = null, ht = Ke[--Qe], Ke[Qe] = null;
    }
    var _e = null, Je = null, ue = !1, Rn = !1, et = null;
    function Bo(e, t) {
      var n = Ye(5, null, null, 0);
      n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
    }
    function mo(e, t) {
      switch (e.tag) {
        case 5:
          return t = Fu(t, e.type, e.pendingProps), t !== null ? (e.stateNode = t, _e = e, Je = Iu(t), !0) : !1;
        case 6:
          return t = Mu(t, e.pendingProps), t !== null ? (e.stateNode = t, _e = e, Je = null, !0) : !1;
        case 13:
          if (t = Ru(t), t !== null) {
            var n = _t !== null ? { id: ht, overflow: Bt } : null;
            return e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Ye(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, _e = e, Je = null, !0;
          }
          return !1;
        default:
          return !1;
      }
    }
    function Ms(e) {
      return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
    }
    function Rs(e) {
      if (ue) {
        var t = Je;
        if (t) {
          var n = t;
          if (!mo(e, t)) {
            if (Ms(e)) throw Error(u(418));
            t = En(n);
            var r = _e;
            t && mo(e, t) ? Bo(r, n) : (e.flags = e.flags & -4097 | 2, ue = !1, _e = e);
          }
        } else {
          if (Ms(e)) throw Error(u(418));
          e.flags = e.flags & -4097 | 2, ue = !1, _e = e;
        }
      }
    }
    function Co(e) {
      for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
      _e = e;
    }
    function Sn(e) {
      if (!Pe || e !== _e) return !1;
      if (!ue) return Co(e), ue = !0, !1;
      if (e.tag !== 3 && (e.tag !== 5 || Ju(e.type) && !yt(e.type, e.memoizedProps))) {
        var t = Je;
        if (t) {
          if (Ms(e)) {
            for (e = Je; e; ) e = En(e);
            throw Error(u(418));
          }
          for (; t; ) Bo(e, t), t = En(t);
        }
      }
      if (Co(e), e.tag === 13) {
        if (!Pe) throw Error(u(316));
        if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
        Je = xu(e);
      } else Je = _e ? En(e.stateNode) : null;
      return !0;
    }
    function rn() {
      Pe && (Je = _e = null, Rn = ue = !1);
    }
    function Ss(e) {
      et === null ? et = [e] : et.push(e);
    }
    function In(e, t, n) {
      if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
        if (n._owner) {
          if (n = n._owner, n) {
            if (n.tag !== 1) throw Error(u(309));
            var r = n.stateNode;
          }
          if (!r) throw Error(u(147, e));
          var o = r, a = "" + e;
          return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === a ? t.ref : (t = function(C) {
            var y = o.refs;
            y === co && (y = o.refs = {}), C === null ? delete y[a] : y[a] = C;
          }, t._stringRef = a, t);
        }
        if (typeof e != "string") throw Error(u(284));
        if (!n._owner) throw Error(u(290, e));
      }
      return e;
    }
    function pr(e, t) {
      throw e = Object.prototype.toString.call(t), Error(u(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
    }
    function go(e) {
      var t = e._init;
      return t(e._payload);
    }
    function vo(e) {
      function t(R, F) {
        if (e) {
          var I = R.deletions;
          I === null ? (R.deletions = [F], R.flags |= 16) : I.push(F);
        }
      }
      function n(R, F) {
        if (!e) return null;
        for (; F !== null; ) t(R, F), F = F.sibling;
        return null;
      }
      function r(R, F) {
        for (R = /* @__PURE__ */ new Map(); F !== null; ) F.key !== null ? R.set(F.key, F) : R.set(F.index, F), F = F.sibling;
        return R;
      }
      function o(R, F) {
        return R = wt(R, F), R.index = 0, R.sibling = null, R;
      }
      function a(R, F, I) {
        return R.index = I, e ? (I = R.alternate, I !== null ? (I = I.index, I < F ? (R.flags |= 2, F) : I) : (R.flags |= 2, F)) : (R.flags |= 1048576, F);
      }
      function C(R) {
        return e && R.alternate === null && (R.flags |= 2), R;
      }
      function y(R, F, I, P) {
        return F === null || F.tag !== 6 ? (F = ui(I, R.mode, P), F.return = R, F) : (F = o(F, I), F.return = R, F);
      }
      function D(R, F, I, P) {
        var N = I.type;
        return N === A ? _(R, F, I.props.children, P, I.key) : F !== null && (F.elementType === N || typeof N == "object" && N !== null && N.$$typeof === w && go(N) === F.type) ? (P = o(F, I.props), P.ref = In(R, F, I), P.return = R, P) : (P = zr(I.type, I.key, I.props, null, R.mode, P), P.ref = In(R, F, I), P.return = R, P);
      }
      function H(R, F, I, P) {
        return F === null || F.tag !== 4 || F.stateNode.containerInfo !== I.containerInfo || F.stateNode.implementation !== I.implementation ? (F = ci(I, R.mode, P), F.return = R, F) : (F = o(F, I.children || []), F.return = R, F);
      }
      function _(R, F, I, P, N) {
        return F === null || F.tag !== 7 ? (F = jt(I, R.mode, P, N), F.return = R, F) : (F = o(F, I), F.return = R, F);
      }
      function j(R, F, I) {
        if (typeof F == "string" && F !== "" || typeof F == "number") return F = ui("" + F, R.mode, I), F.return = R, F;
        if (typeof F == "object" && F !== null) {
          switch (F.$$typeof) {
            case p:
              return I = zr(F.type, F.key, F.props, null, R.mode, I), I.ref = In(R, null, F), I.return = R, I;
            case m:
              return F = ci(F, R.mode, I), F.return = R, F;
            case w:
              var P = F._init;
              return j(R, P(F._payload), I);
          }
          if (ft(F) || K(F)) return F = jt(F, R.mode, I, null), F.return = R, F;
          pr(R, F);
        }
        return null;
      }
      function Q(R, F, I, P) {
        var N = F !== null ? F.key : null;
        if (typeof I == "string" && I !== "" || typeof I == "number") return N !== null ? null : y(R, F, "" + I, P);
        if (typeof I == "object" && I !== null) {
          switch (I.$$typeof) {
            case p:
              return I.key === N ? D(R, F, I, P) : null;
            case m:
              return I.key === N ? H(R, F, I, P) : null;
            case w:
              return N = I._init, Q(
                R,
                F,
                N(I._payload),
                P
              );
          }
          if (ft(I) || K(I)) return N !== null ? null : _(R, F, I, P, null);
          pr(R, I);
        }
        return null;
      }
      function re(R, F, I, P, N) {
        if (typeof P == "string" && P !== "" || typeof P == "number") return R = R.get(I) || null, y(F, R, "" + P, N);
        if (typeof P == "object" && P !== null) {
          switch (P.$$typeof) {
            case p:
              return R = R.get(P.key === null ? I : P.key) || null, D(F, R, P, N);
            case m:
              return R = R.get(P.key === null ? I : P.key) || null, H(F, R, P, N);
            case w:
              var Y = P._init;
              return re(R, F, I, Y(P._payload), N);
          }
          if (ft(P) || K(P)) return R = R.get(I) || null, _(F, R, P, N, null);
          pr(F, P);
        }
        return null;
      }
      function k(R, F, I, P) {
        for (var N = null, Y = null, z = F, $ = F = 0, ge = null; z !== null && $ < I.length; $++) {
          z.index > $ ? (ge = z, z = null) : ge = z.sibling;
          var ee = Q(R, z, I[$], P);
          if (ee === null) {
            z === null && (z = ge);
            break;
          }
          e && z && ee.alternate === null && t(R, z), F = a(ee, F, $), Y === null ? N = ee : Y.sibling = ee, Y = ee, z = ge;
        }
        if ($ === I.length) return n(R, z), ue && Jt(R, $), N;
        if (z === null) {
          for (; $ < I.length; $++) z = j(R, I[$], P), z !== null && (F = a(z, F, $), Y === null ? N = z : Y.sibling = z, Y = z);
          return ue && Jt(R, $), N;
        }
        for (z = r(R, z); $ < I.length; $++) ge = re(z, R, $, I[$], P), ge !== null && (e && ge.alternate !== null && z.delete(ge.key === null ? $ : ge.key), F = a(ge, F, $), Y === null ? N = ge : Y.sibling = ge, Y = ge);
        return e && z.forEach(function(Ht) {
          return t(R, Ht);
        }), ue && Jt(R, $), N;
      }
      function Se(R, F, I, P) {
        var N = K(I);
        if (typeof N != "function") throw Error(u(150));
        if (I = N.call(I), I == null) throw Error(u(151));
        for (var Y = N = null, z = F, $ = F = 0, ge = null, ee = I.next(); z !== null && !ee.done; $++, ee = I.next()) {
          z.index > $ ? (ge = z, z = null) : ge = z.sibling;
          var Ht = Q(R, z, ee.value, P);
          if (Ht === null) {
            z === null && (z = ge);
            break;
          }
          e && z && Ht.alternate === null && t(R, z), F = a(Ht, F, $), Y === null ? N = Ht : Y.sibling = Ht, Y = Ht, z = ge;
        }
        if (ee.done) return n(
          R,
          z
        ), ue && Jt(R, $), N;
        if (z === null) {
          for (; !ee.done; $++, ee = I.next()) ee = j(R, ee.value, P), ee !== null && (F = a(ee, F, $), Y === null ? N = ee : Y.sibling = ee, Y = ee);
          return ue && Jt(R, $), N;
        }
        for (z = r(R, z); !ee.done; $++, ee = I.next()) ee = re(z, R, $, ee.value, P), ee !== null && (e && ee.alternate !== null && z.delete(ee.key === null ? $ : ee.key), F = a(ee, F, $), Y === null ? N = ee : Y.sibling = ee, Y = ee);
        return e && z.forEach(function(wc) {
          return t(R, wc);
        }), ue && Jt(R, $), N;
      }
      function We(R, F, I, P) {
        if (typeof I == "object" && I !== null && I.type === A && I.key === null && (I = I.props.children), typeof I == "object" && I !== null) {
          switch (I.$$typeof) {
            case p:
              e: {
                for (var N = I.key, Y = F; Y !== null; ) {
                  if (Y.key === N) {
                    if (N = I.type, N === A) {
                      if (Y.tag === 7) {
                        n(R, Y.sibling), F = o(Y, I.props.children), F.return = R, R = F;
                        break e;
                      }
                    } else if (Y.elementType === N || typeof N == "object" && N !== null && N.$$typeof === w && go(N) === Y.type) {
                      n(R, Y.sibling), F = o(Y, I.props), F.ref = In(R, Y, I), F.return = R, R = F;
                      break e;
                    }
                    n(R, Y);
                    break;
                  } else t(R, Y);
                  Y = Y.sibling;
                }
                I.type === A ? (F = jt(I.props.children, R.mode, P, I.key), F.return = R, R = F) : (P = zr(I.type, I.key, I.props, null, R.mode, P), P.ref = In(R, F, I), P.return = R, R = P);
              }
              return C(R);
            case m:
              e: {
                for (Y = I.key; F !== null; ) {
                  if (F.key === Y) if (F.tag === 4 && F.stateNode.containerInfo === I.containerInfo && F.stateNode.implementation === I.implementation) {
                    n(R, F.sibling), F = o(F, I.children || []), F.return = R, R = F;
                    break e;
                  } else {
                    n(R, F);
                    break;
                  }
                  else t(R, F);
                  F = F.sibling;
                }
                F = ci(I, R.mode, P), F.return = R, R = F;
              }
              return C(R);
            case w:
              return Y = I._init, We(R, F, Y(I._payload), P);
          }
          if (ft(I)) return k(R, F, I, P);
          if (K(I)) return Se(R, F, I, P);
          pr(R, I);
        }
        return typeof I == "string" && I !== "" || typeof I == "number" ? (I = "" + I, F !== null && F.tag === 6 ? (n(R, F.sibling), F = o(F, I), F.return = R, R = F) : (n(R, F), F = ui(I, R.mode, P), F.return = R, R = F), C(R)) : n(R, F);
      }
      return We;
    }
    var sn = vo(!0), Eo = vo(!1), Gn = {}, je = Ft(Gn), Dn = Ft(Gn), on = Ft(Gn);
    function lt(e) {
      if (e === Gn) throw Error(u(174));
      return e;
    }
    function Is(e, t) {
      se(on, t), se(Dn, e), se(je, Gn), e = Zt(t), oe(je), se(je, e);
    }
    function ln() {
      oe(je), oe(Dn), oe(on);
    }
    function yo(e) {
      var t = lt(on.current), n = lt(je.current);
      t = ke(n, e.type, t), n !== t && (se(Dn, e), se(je, t));
    }
    function Gs(e) {
      Dn.current === e && (oe(je), oe(Dn));
    }
    var ce = Ft(0);
    function hr(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === 13) {
          var n = t.memoizedState;
          if (n !== null && (n = n.dehydrated, n === null || bi(n) || rs(n))) return t;
        } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
          if ((t.flags & 128) !== 0) return t;
        } else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return null;
    }
    var Ds = [];
    function Ts() {
      for (var e = 0; e < Ds.length; e++) {
        var t = Ds[e];
        qn ? t._workInProgressVersionPrimary = null : t._workInProgressVersionSecondary = null;
      }
      Ds.length = 0;
    }
    var Br = B.ReactCurrentDispatcher, ze = B.ReactCurrentBatchConfig, an = 0, de = null, Fe = null, Ce = null, mr = !1, Tn = !1, wn = 0, nc = 0;
    function Me() {
      throw Error(u(321));
    }
    function ws(e, t) {
      if (t === null) return !1;
      for (var n = 0; n < t.length && n < e.length; n++) if (!st(e[n], t[n])) return !1;
      return !0;
    }
    function Hs(e, t, n, r, o, a) {
      if (an = a, de = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Br.current = e === null || e.memoizedState === null ? oc : lc, e = n(r, o), Tn) {
        a = 0;
        do {
          if (Tn = !1, wn = 0, 25 <= a) throw Error(u(301));
          a += 1, Ce = Fe = null, t.updateQueue = null, Br.current = ac, e = n(r, o);
        } while (Tn);
      }
      if (Br.current = yr, t = Fe !== null && Fe.next !== null, an = 0, Ce = Fe = de = null, mr = !1, t) throw Error(u(300));
      return e;
    }
    function xs() {
      var e = wn !== 0;
      return wn = 0, e;
    }
    function mt() {
      var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      return Ce === null ? de.memoizedState = Ce = e : Ce = Ce.next = e, Ce;
    }
    function at() {
      if (Fe === null) {
        var e = de.alternate;
        e = e !== null ? e.memoizedState : null;
      } else e = Fe.next;
      var t = Ce === null ? de.memoizedState : Ce.next;
      if (t !== null) Ce = t, Fe = e;
      else {
        if (e === null) throw Error(u(310));
        Fe = e, e = { memoizedState: Fe.memoizedState, baseState: Fe.baseState, baseQueue: Fe.baseQueue, queue: Fe.queue, next: null }, Ce === null ? de.memoizedState = Ce = e : Ce = Ce.next = e;
      }
      return Ce;
    }
    function Ot(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function Cr(e) {
      var t = at(), n = t.queue;
      if (n === null) throw Error(u(311));
      n.lastRenderedReducer = e;
      var r = Fe, o = r.baseQueue, a = n.pending;
      if (a !== null) {
        if (o !== null) {
          var C = o.next;
          o.next = a.next, a.next = C;
        }
        r.baseQueue = o = a, n.pending = null;
      }
      if (o !== null) {
        a = o.next, r = r.baseState;
        var y = C = null, D = null, H = a;
        do {
          var _ = H.lane;
          if ((an & _) === _) D !== null && (D = D.next = { lane: 0, action: H.action, hasEagerState: H.hasEagerState, eagerState: H.eagerState, next: null }), r = H.hasEagerState ? H.eagerState : e(r, H.action);
          else {
            var j = {
              lane: _,
              action: H.action,
              hasEagerState: H.hasEagerState,
              eagerState: H.eagerState,
              next: null
            };
            D === null ? (y = D = j, C = r) : D = D.next = j, de.lanes |= _, cn |= _;
          }
          H = H.next;
        } while (H !== null && H !== a);
        D === null ? C = r : D.next = y, st(r, t.memoizedState) || (Oe = !0), t.memoizedState = r, t.baseState = C, t.baseQueue = D, n.lastRenderedState = r;
      }
      if (e = n.interleaved, e !== null) {
        o = e;
        do
          a = o.lane, de.lanes |= a, cn |= a, o = o.next;
        while (o !== e);
      } else o === null && (n.lanes = 0);
      return [t.memoizedState, n.dispatch];
    }
    function gr(e) {
      var t = at(), n = t.queue;
      if (n === null) throw Error(u(311));
      n.lastRenderedReducer = e;
      var r = n.dispatch, o = n.pending, a = t.memoizedState;
      if (o !== null) {
        n.pending = null;
        var C = o = o.next;
        do
          a = e(a, C.action), C = C.next;
        while (C !== o);
        st(a, t.memoizedState) || (Oe = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
      }
      return [a, r];
    }
    function Fo() {
    }
    function Mo(e, t) {
      var n = de, r = at(), o = t(), a = !st(r.memoizedState, o);
      if (a && (r.memoizedState = o, Oe = !0), r = r.queue, xn(Io.bind(null, n, r, e), [e]), r.getSnapshot !== t || a || Ce !== null && Ce.memoizedState.tag & 1) {
        if (n.flags |= 2048, Hn(9, So.bind(null, n, r, o, t), void 0, null), pe === null) throw Error(u(349));
        (an & 30) !== 0 || Ro(n, t, o);
      }
      return o;
    }
    function Ro(e, t, n) {
      e.flags |= 16384, e = { getSnapshot: t, value: n }, t = de.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, de.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
    }
    function So(e, t, n, r) {
      t.value = n, t.getSnapshot = r, Go(t) && Xe(e, 1, -1);
    }
    function Io(e, t, n) {
      return n(function() {
        Go(t) && Xe(e, 1, -1);
      });
    }
    function Go(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !st(e, n);
      } catch {
        return !0;
      }
    }
    function Ls(e) {
      var t = mt();
      return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Ot, lastRenderedState: e }, t.queue = e, e = e.dispatch = ic.bind(null, de, e), [t.memoizedState, e];
    }
    function Hn(e, t, n, r) {
      return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = de.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, de.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
    }
    function Do() {
      return at().memoizedState;
    }
    function vr(e, t, n, r) {
      var o = mt();
      de.flags |= e, o.memoizedState = Hn(1 | t, n, void 0, r === void 0 ? null : r);
    }
    function Er(e, t, n, r) {
      var o = at();
      r = r === void 0 ? null : r;
      var a = void 0;
      if (Fe !== null) {
        var C = Fe.memoizedState;
        if (a = C.destroy, r !== null && ws(r, C.deps)) {
          o.memoizedState = Hn(t, n, a, r);
          return;
        }
      }
      de.flags |= e, o.memoizedState = Hn(1 | t, n, a, r);
    }
    function Ps(e, t) {
      return vr(8390656, 8, e, t);
    }
    function xn(e, t) {
      return Er(2048, 8, e, t);
    }
    function To(e, t) {
      return Er(4, 2, e, t);
    }
    function wo(e, t) {
      return Er(4, 4, e, t);
    }
    function Ho(e, t) {
      if (typeof t == "function") return e = e(), t(e), function() {
        t(null);
      };
      if (t != null) return e = e(), t.current = e, function() {
        t.current = null;
      };
    }
    function xo(e, t, n) {
      return n = n != null ? n.concat([e]) : null, Er(4, 4, Ho.bind(null, t, e), n);
    }
    function _s() {
    }
    function Lo(e, t) {
      var n = at();
      t = t === void 0 ? null : t;
      var r = n.memoizedState;
      return r !== null && t !== null && ws(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
    }
    function Po(e, t) {
      var n = at();
      t = t === void 0 ? null : t;
      var r = n.memoizedState;
      return r !== null && t !== null && ws(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
    }
    function rc(e, t) {
      var n = b;
      b = n !== 0 && 4 > n ? n : 4, e(!0);
      var r = ze.transition;
      ze.transition = {};
      try {
        e(!1), t();
      } finally {
        b = n, ze.transition = r;
      }
    }
    function _o() {
      return at().memoizedState;
    }
    function sc(e, t, n) {
      var r = Dt(e);
      n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Jo(e) ? Oo(t, n) : (No(e, t, n), n = Ge(), e = Xe(e, r, n), e !== null && ko(e, t, r));
    }
    function ic(e, t, n) {
      var r = Dt(e), o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
      if (Jo(e)) Oo(t, o);
      else {
        No(e, t, o);
        var a = e.alternate;
        if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
          var C = t.lastRenderedState, y = a(C, n);
          if (o.hasEagerState = !0, o.eagerState = y, st(y, C)) return;
        } catch {
        }
        n = Ge(), e = Xe(e, r, n), e !== null && ko(e, t, r);
      }
    }
    function Jo(e) {
      var t = e.alternate;
      return e === de || t !== null && t === de;
    }
    function Oo(e, t) {
      Tn = mr = !0;
      var n = e.pending;
      n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
    }
    function No(e, t, n) {
      pe !== null && (e.mode & 1) !== 0 && (W & 2) === 0 ? (e = t.interleaved, e === null ? (n.next = n, ot === null ? ot = [t] : ot.push(t)) : (n.next = e.next, e.next = n), t.interleaved = n) : (e = t.pending, e === null ? n.next = n : (n.next = e.next, e.next = n), t.pending = n);
    }
    function ko(e, t, n) {
      if ((n & 4194240) !== 0) {
        var r = t.lanes;
        r &= e.pendingLanes, n |= r, t.lanes = n, cs(e, n);
      }
    }
    var yr = { readContext: Ue, useCallback: Me, useContext: Me, useEffect: Me, useImperativeHandle: Me, useInsertionEffect: Me, useLayoutEffect: Me, useMemo: Me, useReducer: Me, useRef: Me, useState: Me, useDebugValue: Me, useDeferredValue: Me, useTransition: Me, useMutableSource: Me, useSyncExternalStore: Me, useId: Me, unstable_isNewReconciler: !1 }, oc = { readContext: Ue, useCallback: function(e, t) {
      return mt().memoizedState = [e, t === void 0 ? null : t], e;
    }, useContext: Ue, useEffect: Ps, useImperativeHandle: function(e, t, n) {
      return n = n != null ? n.concat([e]) : null, vr(
        4194308,
        4,
        Ho.bind(null, t, e),
        n
      );
    }, useLayoutEffect: function(e, t) {
      return vr(4194308, 4, e, t);
    }, useInsertionEffect: function(e, t) {
      return vr(4, 2, e, t);
    }, useMemo: function(e, t) {
      var n = mt();
      return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
    }, useReducer: function(e, t, n) {
      var r = mt();
      return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = sc.bind(null, de, e), [r.memoizedState, e];
    }, useRef: function(e) {
      var t = mt();
      return e = { current: e }, t.memoizedState = e;
    }, useState: Ls, useDebugValue: _s, useDeferredValue: function(e) {
      var t = Ls(e), n = t[0], r = t[1];
      return Ps(function() {
        var o = ze.transition;
        ze.transition = {};
        try {
          r(e);
        } finally {
          ze.transition = o;
        }
      }, [e]), n;
    }, useTransition: function() {
      var e = Ls(!1), t = e[0];
      return e = rc.bind(null, e[1]), mt().memoizedState = e, [t, e];
    }, useMutableSource: function() {
    }, useSyncExternalStore: function(e, t, n) {
      var r = de, o = mt();
      if (ue) {
        if (n === void 0) throw Error(u(407));
        n = n();
      } else {
        if (n = t(), pe === null) throw Error(u(349));
        (an & 30) !== 0 || Ro(r, t, n);
      }
      o.memoizedState = n;
      var a = { value: n, getSnapshot: t };
      return o.queue = a, Ps(Io.bind(null, r, a, e), [e]), r.flags |= 2048, Hn(9, So.bind(null, r, a, n, t), void 0, null), n;
    }, useId: function() {
      var e = mt(), t = pe.identifierPrefix;
      if (ue) {
        var n = Bt, r = ht;
        n = (r & ~(1 << 32 - be(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = wn++, 0 < n && (t += "H" + n.toString(32)), t += ":";
      } else n = nc++, t = ":" + t + "r" + n.toString(32) + ":";
      return e.memoizedState = t;
    }, unstable_isNewReconciler: !1 }, lc = {
      readContext: Ue,
      useCallback: Lo,
      useContext: Ue,
      useEffect: xn,
      useImperativeHandle: xo,
      useInsertionEffect: To,
      useLayoutEffect: wo,
      useMemo: Po,
      useReducer: Cr,
      useRef: Do,
      useState: function() {
        return Cr(Ot);
      },
      useDebugValue: _s,
      useDeferredValue: function(e) {
        var t = Cr(Ot), n = t[0], r = t[1];
        return xn(function() {
          var o = ze.transition;
          ze.transition = {};
          try {
            r(e);
          } finally {
            ze.transition = o;
          }
        }, [e]), n;
      },
      useTransition: function() {
        var e = Cr(Ot)[0], t = at().memoizedState;
        return [e, t];
      },
      useMutableSource: Fo,
      useSyncExternalStore: Mo,
      useId: _o,
      unstable_isNewReconciler: !1
    }, ac = {
      readContext: Ue,
      useCallback: Lo,
      useContext: Ue,
      useEffect: xn,
      useImperativeHandle: xo,
      useInsertionEffect: To,
      useLayoutEffect: wo,
      useMemo: Po,
      useReducer: gr,
      useRef: Do,
      useState: function() {
        return gr(Ot);
      },
      useDebugValue: _s,
      useDeferredValue: function(e) {
        var t = gr(Ot), n = t[0], r = t[1];
        return xn(function() {
          var o = ze.transition;
          ze.transition = {};
          try {
            r(e);
          } finally {
            ze.transition = o;
          }
        }, [e]), n;
      },
      useTransition: function() {
        var e = gr(Ot)[0], t = at().memoizedState;
        return [e, t];
      },
      useMutableSource: Fo,
      useSyncExternalStore: Mo,
      useId: _o,
      unstable_isNewReconciler: !1
    };
    function Js(e, t) {
      try {
        var n = "", r = t;
        do
          n += tc(r), r = r.return;
        while (r);
        var o = n;
      } catch (a) {
        o = `
Error generating stack: ` + a.message + `
` + a.stack;
      }
      return { value: e, source: t, stack: o };
    }
    function Os(e, t) {
      try {
        console.error(t.value);
      } catch (n) {
        setTimeout(function() {
          throw n;
        });
      }
    }
    var uc = typeof WeakMap == "function" ? WeakMap : Map;
    function Uo(e, t, n) {
      n = pt(-1, n), n.tag = 3, n.payload = { element: null };
      var r = t.value;
      return n.callback = function() {
        Or || (Or = !0, ni = r), Os(e, t);
      }, n;
    }
    function Ko(e, t, n) {
      n = pt(-1, n), n.tag = 3;
      var r = e.type.getDerivedStateFromError;
      if (typeof r == "function") {
        var o = t.value;
        n.payload = function() {
          return r(o);
        }, n.callback = function() {
          Os(e, t);
        };
      }
      var a = e.stateNode;
      return a !== null && typeof a.componentDidCatch == "function" && (n.callback = function() {
        Os(e, t), typeof r != "function" && (It === null ? It = /* @__PURE__ */ new Set([this]) : It.add(this));
        var C = t.stack;
        this.componentDidCatch(t.value, { componentStack: C !== null ? C : "" });
      }), n;
    }
    function Qo(e, t, n) {
      var r = e.pingCache;
      if (r === null) {
        r = e.pingCache = new uc();
        var o = /* @__PURE__ */ new Set();
        r.set(t, o);
      } else o = r.get(t), o === void 0 && (o = /* @__PURE__ */ new Set(), r.set(t, o));
      o.has(n) || (o.add(n), e = Fc.bind(null, e, t, n), t.then(e, e));
    }
    function jo(e) {
      do {
        var t;
        if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
        e = e.return;
      } while (e !== null);
      return null;
    }
    function zo(e, t, n, r, o) {
      return (e.mode & 1) === 0 ? (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = pt(-1, 1), t.tag = 2, St(n, t))), n.lanes |= 1), e) : (e.flags |= 65536, e.lanes = o, e);
    }
    function ut(e) {
      e.flags |= 4;
    }
    function Xo(e, t) {
      if (e !== null && e.child === t.child) return !0;
      if ((t.flags & 16) !== 0) return !1;
      for (e = t.child; e !== null; ) {
        if ((e.flags & 12854) !== 0 || (e.subtreeFlags & 12854) !== 0) return !1;
        e = e.sibling;
      }
      return !0;
    }
    var Ln, Pn, Fr, Mr;
    if (qe) Ln = function(e, t) {
      for (var n = t.child; n !== null; ) {
        if (n.tag === 5 || n.tag === 6) Ve(e, n.stateNode);
        else if (n.tag !== 4 && n.child !== null) {
          n.child.return = n, n = n.child;
          continue;
        }
        if (n === t) break;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === t) return;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
    }, Pn = function() {
    }, Fr = function(e, t, n, r, o) {
      if (e = e.memoizedProps, e !== r) {
        var a = t.stateNode, C = lt(je.current);
        n = Vt(a, n, e, r, o, C), (t.updateQueue = n) && ut(t);
      }
    }, Mr = function(e, t, n, r) {
      n !== r && ut(t);
    };
    else if (bn) {
      Ln = function(e, t, n, r) {
        for (var o = t.child; o !== null; ) {
          if (o.tag === 5) {
            var a = o.stateNode;
            n && r && (a = Vi(a, o.type, o.memoizedProps, o)), Ve(e, a);
          } else if (o.tag === 6) a = o.stateNode, n && r && (a = qi(a, o.memoizedProps, o)), Ve(e, a);
          else if (o.tag !== 4) {
            if (o.tag === 22 && o.memoizedState !== null) a = o.child, a !== null && (a.return = o), Ln(e, o, !0, !0);
            else if (o.child !== null) {
              o.child.return = o, o = o.child;
              continue;
            }
          }
          if (o === t) break;
          for (; o.sibling === null; ) {
            if (o.return === null || o.return === t) return;
            o = o.return;
          }
          o.sibling.return = o.return, o = o.sibling;
        }
      };
      var Yo = function(e, t, n, r) {
        for (var o = t.child; o !== null; ) {
          if (o.tag === 5) {
            var a = o.stateNode;
            n && r && (a = Vi(a, o.type, o.memoizedProps, o)), Wi(e, a);
          } else if (o.tag === 6) a = o.stateNode, n && r && (a = qi(a, o.memoizedProps, o)), Wi(e, a);
          else if (o.tag !== 4) {
            if (o.tag === 22 && o.memoizedState !== null) a = o.child, a !== null && (a.return = o), Yo(e, o, !0, !0);
            else if (o.child !== null) {
              o.child.return = o, o = o.child;
              continue;
            }
          }
          if (o === t) break;
          for (; o.sibling === null; ) {
            if (o.return === null || o.return === t) return;
            o = o.return;
          }
          o.sibling.return = o.return, o = o.sibling;
        }
      };
      Pn = function(e, t) {
        var n = t.stateNode;
        if (!Xo(e, t)) {
          e = n.containerInfo;
          var r = Yi(e);
          Yo(r, t, !1, !1), n.pendingChildren = r, ut(t), yu(e, r);
        }
      }, Fr = function(e, t, n, r, o) {
        var a = e.stateNode, C = e.memoizedProps;
        if ((e = Xo(e, t)) && C === r) t.stateNode = a;
        else {
          var y = t.stateNode, D = lt(je.current), H = null;
          C !== r && (H = Vt(y, n, C, r, o, D)), e && H === null ? t.stateNode = a : (a = Eu(a, H, n, C, r, t, e, y), ae(a, n, r, o, D) && ut(t), t.stateNode = a, e ? ut(t) : Ln(a, t, !1, !1));
        }
      }, Mr = function(e, t, n, r) {
        n !== r ? (e = lt(on.current), n = lt(je.current), t.stateNode = ji(r, e, n, t), ut(t)) : t.stateNode = e.stateNode;
      };
    } else Pn = function() {
    }, Fr = function() {
    }, Mr = function() {
    };
    function _n(e, t) {
      if (!ue) switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
          n === null ? e.tail = null : n.sibling = null;
          break;
        case "collapsed":
          n = e.tail;
          for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
          r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
      }
    }
    function Re(e) {
      var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
      if (t) for (var o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags & 14680064, r |= o.flags & 14680064, o.return = e, o = o.sibling;
      else for (o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags, r |= o.flags, o.return = e, o = o.sibling;
      return e.subtreeFlags |= r, e.childLanes = n, t;
    }
    function cc(e, t, n) {
      var r = t.pendingProps;
      switch (Fs(t), t.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return Re(t), null;
        case 1:
          return we(t.type) && $n(), Re(t), null;
        case 3:
          return r = t.stateNode, ln(), oe(Te), oe(ye), Ts(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Sn(t) ? ut(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, et !== null && (ii(et), et = null))), Pn(e, t), Re(t), null;
        case 5:
          Gs(t), n = lt(on.current);
          var o = t.type;
          if (e !== null && t.stateNode != null) Fr(e, t, o, r, n), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
          else {
            if (!r) {
              if (t.stateNode === null) throw Error(u(166));
              return Re(t), null;
            }
            if (e = lt(je.current), Sn(t)) {
              if (!Pe) throw Error(u(175));
              e = Tu(t.stateNode, t.type, t.memoizedProps, n, e, t, !Rn), t.updateQueue = e, e !== null && ut(t);
            } else {
              var a = le(o, r, n, e, t);
              Ln(a, t, !1, !1), t.stateNode = a, ae(a, o, r, n, e) && ut(t);
            }
            t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
          }
          return Re(t), null;
        case 6:
          if (e && t.stateNode != null) Mr(e, t, e.memoizedProps, r);
          else {
            if (typeof r != "string" && t.stateNode === null) throw Error(u(166));
            if (e = lt(on.current), n = lt(je.current), Sn(t)) {
              if (!Pe) throw Error(u(176));
              if (e = t.stateNode, r = t.memoizedProps, (n = wu(e, r, t, !Rn)) && (o = _e, o !== null)) switch (a = (o.mode & 1) !== 0, o.tag) {
                case 3:
                  Ou(o.stateNode.containerInfo, e, r, a);
                  break;
                case 5:
                  Nu(o.type, o.memoizedProps, o.stateNode, e, r, a);
              }
              n && ut(t);
            } else t.stateNode = ji(r, e, n, t);
          }
          return Re(t), null;
        case 13:
          if (oe(ce), r = t.memoizedState, ue && Je !== null && (t.mode & 1) !== 0 && (t.flags & 128) === 0) {
            for (e = Je; e; ) e = En(e);
            return rn(), t.flags |= 98560, t;
          }
          if (r !== null && r.dehydrated !== null) {
            if (r = Sn(t), e === null) {
              if (!r) throw Error(u(318));
              if (!Pe) throw Error(u(344));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
              Hu(e, t);
            } else rn(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            return Re(t), null;
          }
          return et !== null && (ii(et), et = null), (t.flags & 128) !== 0 ? (t.lanes = n, t) : (r = r !== null, n = !1, e === null ? Sn(t) : n = e.memoizedState !== null, r && !n && (t.child.flags |= 8192, (t.mode & 1) !== 0 && (e === null || (ce.current & 1) !== 0 ? Be === 0 && (Be = 3) : li())), t.updateQueue !== null && (t.flags |= 4), Re(t), null);
        case 4:
          return ln(), Pn(e, t), e === null && Va(t.stateNode.containerInfo), Re(t), null;
        case 10:
          return ms(t.type._context), Re(t), null;
        case 17:
          return we(t.type) && $n(), Re(t), null;
        case 19:
          if (oe(ce), o = t.memoizedState, o === null) return Re(t), null;
          if (r = (t.flags & 128) !== 0, a = o.rendering, a === null) if (r) _n(o, !1);
          else {
            if (Be !== 0 || e !== null && (e.flags & 128) !== 0) for (e = t.child; e !== null; ) {
              if (a = hr(e), a !== null) {
                for (t.flags |= 128, _n(o, !1), e = a.updateQueue, e !== null && (t.updateQueue = e, t.flags |= 4), t.subtreeFlags = 0, e = n, r = t.child; r !== null; ) n = r, o = e, n.flags &= 14680066, a = n.alternate, a === null ? (n.childLanes = 0, n.lanes = o, n.child = null, n.subtreeFlags = 0, n.memoizedProps = null, n.memoizedState = null, n.updateQueue = null, n.dependencies = null, n.stateNode = null) : (n.childLanes = a.childLanes, n.lanes = a.lanes, n.child = a.child, n.subtreeFlags = 0, n.deletions = null, n.memoizedProps = a.memoizedProps, n.memoizedState = a.memoizedState, n.updateQueue = a.updateQueue, n.type = a.type, o = a.dependencies, n.dependencies = o === null ? null : { lanes: o.lanes, firstContext: o.firstContext }), r = r.sibling;
                return se(ce, ce.current & 1 | 2), t.child;
              }
              e = e.sibling;
            }
            o.tail !== null && me() > ti && (t.flags |= 128, r = !0, _n(o, !1), t.lanes = 4194304);
          }
          else {
            if (!r) if (e = hr(a), e !== null) {
              if (t.flags |= 128, r = !0, e = e.updateQueue, e !== null && (t.updateQueue = e, t.flags |= 4), _n(o, !0), o.tail === null && o.tailMode === "hidden" && !a.alternate && !ue) return Re(t), null;
            } else 2 * me() - o.renderingStartTime > ti && n !== 1073741824 && (t.flags |= 128, r = !0, _n(o, !1), t.lanes = 4194304);
            o.isBackwards ? (a.sibling = t.child, t.child = a) : (e = o.last, e !== null ? e.sibling = a : t.child = a, o.last = a);
          }
          return o.tail !== null ? (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = me(), t.sibling = null, e = ce.current, se(ce, r ? e & 1 | 2 : e & 1), t) : (Re(t), null);
        case 22:
        case 23:
          return oi(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && (t.mode & 1) !== 0 ? (Ne & 1073741824) !== 0 && (Re(t), qe && t.subtreeFlags & 6 && (t.flags |= 8192)) : Re(t), null;
        case 24:
          return null;
        case 25:
          return null;
      }
      throw Error(u(156, t.tag));
    }
    var fc = B.ReactCurrentOwner, Oe = !1;
    function Ie(e, t, n, r) {
      t.child = e === null ? Eo(t, null, n, r) : sn(t, e.child, n, r);
    }
    function Wo(e, t, n, r, o) {
      n = n.render;
      var a = t.ref;
      return en(t, o), r = Hs(e, t, n, r, a, o), n = xs(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Ct(e, t, o)) : (ue && n && ys(t), t.flags |= 1, Ie(e, t, r, o), t.child);
    }
    function Zo(e, t, n, r, o) {
      if (e === null) {
        var a = n.type;
        return typeof a == "function" && !ai(a) && a.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = a, Vo(e, t, a, r, o)) : (e = zr(n.type, null, r, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
      }
      if (a = e.child, (e.lanes & o) === 0) {
        var C = a.memoizedProps;
        if (n = n.compare, n = n !== null ? n : or, n(C, r) && e.ref === t.ref) return Ct(e, t, o);
      }
      return t.flags |= 1, e = wt(a, r), e.ref = t.ref, e.return = t, t.child = e;
    }
    function Vo(e, t, n, r, o) {
      if (e !== null && or(e.memoizedProps, r) && e.ref === t.ref) if (Oe = !1, (e.lanes & o) !== 0) (e.flags & 131072) !== 0 && (Oe = !0);
      else return t.lanes = e.lanes, Ct(e, t, o);
      return Ns(e, t, n, r, o);
    }
    function qo(e, t, n) {
      var r = t.pendingProps, o = r.children, a = e !== null ? e.memoizedState : null;
      if (r.mode === "hidden") if ((t.mode & 1) === 0) t.memoizedState = { baseLanes: 0, cachePool: null }, se(un, Ne), Ne |= n;
      else if ((n & 1073741824) !== 0) t.memoizedState = { baseLanes: 0, cachePool: null }, r = a !== null ? a.baseLanes : n, se(un, Ne), Ne |= r;
      else return e = a !== null ? a.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null }, t.updateQueue = null, se(un, Ne), Ne |= e, null;
      else a !== null ? (r = a.baseLanes | n, t.memoizedState = null) : r = n, se(un, Ne), Ne |= r;
      return Ie(e, t, o, n), t.child;
    }
    function bo(e, t) {
      var n = t.ref;
      (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
    }
    function Ns(e, t, n, r, o) {
      var a = we(n) ? Pt : ye.current;
      return a = bt(t, a), en(t, o), n = Hs(e, t, n, r, a, o), r = xs(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Ct(e, t, o)) : (ue && r && ys(t), t.flags |= 1, Ie(e, t, n, o), t.child);
    }
    function $o(e, t, n, r, o) {
      if (we(n)) {
        var a = !0;
        er(t);
      } else a = !1;
      if (en(t, o), t.stateNode === null) e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2), Ao(t, n, r), Es(t, n, r, o), r = !0;
      else if (e === null) {
        var C = t.stateNode, y = t.memoizedProps;
        C.props = y;
        var D = C.context, H = n.contextType;
        typeof H == "object" && H !== null ? H = Ue(H) : (H = we(n) ? Pt : ye.current, H = bt(t, H));
        var _ = n.getDerivedStateFromProps, j = typeof _ == "function" || typeof C.getSnapshotBeforeUpdate == "function";
        j || typeof C.UNSAFE_componentWillReceiveProps != "function" && typeof C.componentWillReceiveProps != "function" || (y !== r || D !== H) && po(t, C, r, H), Rt = !1;
        var Q = t.memoizedState;
        C.state = Q, cr(t, r, C, o), D = t.memoizedState, y !== r || Q !== D || Te.current || Rt ? (typeof _ == "function" && (vs(t, n, _, r), D = t.memoizedState), (y = Rt || fo(t, n, y, r, Q, D, H)) ? (j || typeof C.UNSAFE_componentWillMount != "function" && typeof C.componentWillMount != "function" || (typeof C.componentWillMount == "function" && C.componentWillMount(), typeof C.UNSAFE_componentWillMount == "function" && C.UNSAFE_componentWillMount()), typeof C.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof C.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = D), C.props = r, C.state = D, C.context = H, r = y) : (typeof C.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
      } else {
        C = t.stateNode, lo(e, t), y = t.memoizedProps, H = t.type === t.elementType ? y : $e(t.type, y), C.props = H, j = t.pendingProps, Q = C.context, D = n.contextType, typeof D == "object" && D !== null ? D = Ue(D) : (D = we(n) ? Pt : ye.current, D = bt(t, D));
        var re = n.getDerivedStateFromProps;
        (_ = typeof re == "function" || typeof C.getSnapshotBeforeUpdate == "function") || typeof C.UNSAFE_componentWillReceiveProps != "function" && typeof C.componentWillReceiveProps != "function" || (y !== j || Q !== D) && po(t, C, r, D), Rt = !1, Q = t.memoizedState, C.state = Q, cr(t, r, C, o);
        var k = t.memoizedState;
        y !== j || Q !== k || Te.current || Rt ? (typeof re == "function" && (vs(t, n, re, r), k = t.memoizedState), (H = Rt || fo(t, n, H, r, Q, k, D) || !1) ? (_ || typeof C.UNSAFE_componentWillUpdate != "function" && typeof C.componentWillUpdate != "function" || (typeof C.componentWillUpdate == "function" && C.componentWillUpdate(
          r,
          k,
          D
        ), typeof C.UNSAFE_componentWillUpdate == "function" && C.UNSAFE_componentWillUpdate(r, k, D)), typeof C.componentDidUpdate == "function" && (t.flags |= 4), typeof C.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof C.componentDidUpdate != "function" || y === e.memoizedProps && Q === e.memoizedState || (t.flags |= 4), typeof C.getSnapshotBeforeUpdate != "function" || y === e.memoizedProps && Q === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = k), C.props = r, C.state = k, C.context = D, r = H) : (typeof C.componentDidUpdate != "function" || y === e.memoizedProps && Q === e.memoizedState || (t.flags |= 4), typeof C.getSnapshotBeforeUpdate != "function" || y === e.memoizedProps && Q === e.memoizedState || (t.flags |= 1024), r = !1);
      }
      return ks(e, t, n, r, a, o);
    }
    function ks(e, t, n, r, o, a) {
      bo(e, t);
      var C = (t.flags & 128) !== 0;
      if (!r && !C) return o && no(t, n, !1), Ct(e, t, a);
      r = t.stateNode, fc.current = t;
      var y = C && typeof n.getDerivedStateFromError != "function" ? null : r.render();
      return t.flags |= 1, e !== null && C ? (t.child = sn(t, e.child, null, a), t.child = sn(t, null, y, a)) : Ie(e, t, y, a), t.memoizedState = r.state, o && no(t, n, !0), t.child;
    }
    function el(e) {
      var t = e.stateNode;
      t.pendingContext ? eo(e, t.pendingContext, t.pendingContext !== t.context) : t.context && eo(e, t.context, !1), Is(e, t.containerInfo);
    }
    function tl(e, t, n, r, o) {
      return rn(), Ss(o), t.flags |= 256, Ie(e, t, n, r), t.child;
    }
    var Rr = { dehydrated: null, treeContext: null, retryLane: 0 };
    function Sr(e) {
      return { baseLanes: e, cachePool: null };
    }
    function nl(e, t, n) {
      var r = t.pendingProps, o = ce.current, a = !1, C = (t.flags & 128) !== 0, y;
      if ((y = C) || (y = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0), y ? (a = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1), se(ce, o & 1), e === null)
        return Rs(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((t.mode & 1) === 0 ? t.lanes = 1 : rs(e) ? t.lanes = 8 : t.lanes = 1073741824, null) : (o = r.children, e = r.fallback, a ? (r = t.mode, a = t.child, o = { mode: "hidden", children: o }, (r & 1) === 0 && a !== null ? (a.childLanes = 0, a.pendingProps = o) : a = Xr(o, r, 0, null), e = jt(e, r, n, null), a.return = t, e.return = t, a.sibling = e, t.child = a, t.child.memoizedState = Sr(n), t.memoizedState = Rr, e) : Us(t, o));
      if (o = e.memoizedState, o !== null) {
        if (y = o.dehydrated, y !== null) {
          if (C)
            return t.flags & 256 ? (t.flags &= -257, Ir(e, t, n, Error(u(422)))) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (a = r.fallback, o = t.mode, r = Xr({ mode: "visible", children: r.children }, o, 0, null), a = jt(a, o, n, null), a.flags |= 2, r.return = t, a.return = t, r.sibling = a, t.child = r, (t.mode & 1) !== 0 && sn(
              t,
              e.child,
              null,
              n
            ), t.child.memoizedState = Sr(n), t.memoizedState = Rr, a);
          if ((t.mode & 1) === 0) t = Ir(e, t, n, null);
          else if (rs(y)) t = Ir(e, t, n, Error(u(419)));
          else if (r = (n & e.childLanes) !== 0, Oe || r) {
            if (r = pe, r !== null) {
              switch (n & -n) {
                case 4:
                  a = 2;
                  break;
                case 16:
                  a = 8;
                  break;
                case 64:
                case 128:
                case 256:
                case 512:
                case 1024:
                case 2048:
                case 4096:
                case 8192:
                case 16384:
                case 32768:
                case 65536:
                case 131072:
                case 262144:
                case 524288:
                case 1048576:
                case 2097152:
                case 4194304:
                case 8388608:
                case 16777216:
                case 33554432:
                case 67108864:
                  a = 32;
                  break;
                case 536870912:
                  a = 268435456;
                  break;
                default:
                  a = 0;
              }
              r = (a & (r.suspendedLanes | n)) !== 0 ? 0 : a, r !== 0 && r !== o.retryLane && (o.retryLane = r, Xe(e, r, -1));
            }
            li(), t = Ir(e, t, n, Error(u(421)));
          } else bi(y) ? (t.flags |= 128, t.child = e.child, t = Mc.bind(null, e), Su(y, t), t = null) : (n = o.treeContext, Pe && (Je = Du(y), _e = t, ue = !0, et = null, Rn = !1, n !== null && (Ke[Qe++] = ht, Ke[Qe++] = Bt, Ke[Qe++] = _t, ht = n.id, Bt = n.overflow, _t = t)), t = Us(t, t.pendingProps.children), t.flags |= 4096);
          return t;
        }
        return a ? (r = sl(e, t, r.children, r.fallback, n), a = t.child, o = e.child.memoizedState, a.memoizedState = o === null ? Sr(n) : { baseLanes: o.baseLanes | n, cachePool: null }, a.childLanes = e.childLanes & ~n, t.memoizedState = Rr, r) : (n = rl(e, t, r.children, n), t.memoizedState = null, n);
      }
      return a ? (r = sl(e, t, r.children, r.fallback, n), a = t.child, o = e.child.memoizedState, a.memoizedState = o === null ? Sr(n) : { baseLanes: o.baseLanes | n, cachePool: null }, a.childLanes = e.childLanes & ~n, t.memoizedState = Rr, r) : (n = rl(e, t, r.children, n), t.memoizedState = null, n);
    }
    function Us(e, t) {
      return t = Xr({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
    }
    function rl(e, t, n, r) {
      var o = e.child;
      return e = o.sibling, n = wt(o, { mode: "visible", children: n }), (t.mode & 1) === 0 && (n.lanes = r), n.return = t, n.sibling = null, e !== null && (r = t.deletions, r === null ? (t.deletions = [e], t.flags |= 16) : r.push(e)), t.child = n;
    }
    function sl(e, t, n, r, o) {
      var a = t.mode;
      e = e.child;
      var C = e.sibling, y = { mode: "hidden", children: n };
      return (a & 1) === 0 && t.child !== e ? (n = t.child, n.childLanes = 0, n.pendingProps = y, t.deletions = null) : (n = wt(e, y), n.subtreeFlags = e.subtreeFlags & 14680064), C !== null ? r = wt(C, r) : (r = jt(r, a, o, null), r.flags |= 2), r.return = t, n.return = t, n.sibling = r, t.child = n, r;
    }
    function Ir(e, t, n, r) {
      return r !== null && Ss(r), sn(t, e.child, null, n), e = Us(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
    }
    function il(e, t, n) {
      e.lanes |= t;
      var r = e.alternate;
      r !== null && (r.lanes |= t), Cs(e.return, t, n);
    }
    function Ks(e, t, n, r, o) {
      var a = e.memoizedState;
      a === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: o } : (a.isBackwards = t, a.rendering = null, a.renderingStartTime = 0, a.last = r, a.tail = n, a.tailMode = o);
    }
    function ol(e, t, n) {
      var r = t.pendingProps, o = r.revealOrder, a = r.tail;
      if (Ie(e, t, r.children, n), r = ce.current, (r & 2) !== 0) r = r & 1 | 2, t.flags |= 128;
      else {
        if (e !== null && (e.flags & 128) !== 0) e: for (e = t.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && il(e, n, t);
          else if (e.tag === 19) il(e, n, t);
          else if (e.child !== null) {
            e.child.return = e, e = e.child;
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) break e;
            e = e.return;
          }
          e.sibling.return = e.return, e = e.sibling;
        }
        r &= 1;
      }
      if (se(ce, r), (t.mode & 1) === 0) t.memoizedState = null;
      else switch (o) {
        case "forwards":
          for (n = t.child, o = null; n !== null; ) e = n.alternate, e !== null && hr(e) === null && (o = n), n = n.sibling;
          n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), Ks(t, !1, o, n, a);
          break;
        case "backwards":
          for (n = null, o = t.child, t.child = null; o !== null; ) {
            if (e = o.alternate, e !== null && hr(e) === null) {
              t.child = o;
              break;
            }
            e = o.sibling, o.sibling = n, n = o, o = e;
          }
          Ks(t, !0, n, null, a);
          break;
        case "together":
          Ks(t, !1, null, null, void 0);
          break;
        default:
          t.memoizedState = null;
      }
      return t.child;
    }
    function Ct(e, t, n) {
      if (e !== null && (t.dependencies = e.dependencies), cn |= t.lanes, (n & t.childLanes) === 0) return null;
      if (e !== null && t.child !== e.child) throw Error(u(153));
      if (t.child !== null) {
        for (e = t.child, n = wt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = wt(e, e.pendingProps), n.return = t;
        n.sibling = null;
      }
      return t.child;
    }
    function dc(e, t, n) {
      switch (t.tag) {
        case 3:
          el(t), rn();
          break;
        case 5:
          yo(t);
          break;
        case 1:
          we(t.type) && er(t);
          break;
        case 4:
          Is(t, t.stateNode.containerInfo);
          break;
        case 10:
          oo(t, t.type._context, t.memoizedProps.value);
          break;
        case 13:
          var r = t.memoizedState;
          if (r !== null)
            return r.dehydrated !== null ? (se(ce, ce.current & 1), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? nl(e, t, n) : (se(ce, ce.current & 1), e = Ct(e, t, n), e !== null ? e.sibling : null);
          se(ce, ce.current & 1);
          break;
        case 19:
          if (r = (n & t.childLanes) !== 0, (e.flags & 128) !== 0) {
            if (r) return ol(
              e,
              t,
              n
            );
            t.flags |= 128;
          }
          var o = t.memoizedState;
          if (o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), se(ce, ce.current), r) break;
          return null;
        case 22:
        case 23:
          return t.lanes = 0, qo(e, t, n);
      }
      return Ct(e, t, n);
    }
    function Ac(e, t) {
      switch (Fs(t), t.tag) {
        case 1:
          return we(t.type) && $n(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 3:
          return ln(), oe(Te), oe(ye), Ts(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
        case 5:
          return Gs(t), null;
        case 13:
          if (oe(ce), e = t.memoizedState, e !== null && e.dehydrated !== null) {
            if (t.alternate === null) throw Error(u(340));
            rn();
          }
          return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
        case 19:
          return oe(ce), null;
        case 4:
          return ln(), null;
        case 10:
          return ms(t.type._context), null;
        case 22:
        case 23:
          return oi(), null;
        case 24:
          return null;
        default:
          return null;
      }
    }
    var Gr = !1, Nt = !1, pc = typeof WeakSet == "function" ? WeakSet : Set, L = null;
    function Dr(e, t) {
      var n = e.ref;
      if (n !== null) if (typeof n == "function") try {
        n(null);
      } catch (r) {
        Le(e, t, r);
      }
      else n.current = null;
    }
    function Qs(e, t, n) {
      try {
        n();
      } catch (r) {
        Le(e, t, r);
      }
    }
    var ll = !1;
    function hc(e, t) {
      for (nt(e.containerInfo), L = t; L !== null; ) if (e = L, t = e.child, (e.subtreeFlags & 1028) !== 0 && t !== null) t.return = e, L = t;
      else for (; L !== null; ) {
        e = L;
        try {
          var n = e.alternate;
          if ((e.flags & 1024) !== 0) switch (e.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (n !== null) {
                var r = n.memoizedProps, o = n.memoizedState, a = e.stateNode, C = a.getSnapshotBeforeUpdate(e.elementType === e.type ? r : $e(e.type, r), o);
                a.__reactInternalSnapshotBeforeUpdate = C;
              }
              break;
            case 3:
              qe && vu(e.stateNode.containerInfo);
              break;
            case 5:
            case 6:
            case 4:
            case 17:
              break;
            default:
              throw Error(u(163));
          }
        } catch (y) {
          Le(e, e.return, y);
        }
        if (t = e.sibling, t !== null) {
          t.return = e.return, L = t;
          break;
        }
        L = e.return;
      }
      return n = ll, ll = !1, n;
    }
    function kt(e, t, n) {
      var r = t.updateQueue;
      if (r = r !== null ? r.lastEffect : null, r !== null) {
        var o = r = r.next;
        do {
          if ((o.tag & e) === e) {
            var a = o.destroy;
            o.destroy = void 0, a !== void 0 && Qs(t, n, a);
          }
          o = o.next;
        } while (o !== r);
      }
    }
    function Jn(e, t) {
      if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
        var n = t = t.next;
        do {
          if ((n.tag & e) === e) {
            var r = n.create;
            n.destroy = r();
          }
          n = n.next;
        } while (n !== t);
      }
    }
    function js(e) {
      var t = e.ref;
      if (t !== null) {
        var n = e.stateNode;
        e.tag === 5 ? e = dt(n) : e = n, typeof t == "function" ? t(e) : t.current = e;
      }
    }
    function al(e, t, n) {
      if (rt && typeof rt.onCommitFiberUnmount == "function") try {
        rt.onCommitFiberUnmount(sr, t);
      } catch {
      }
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          if (e = t.updateQueue, e !== null && (e = e.lastEffect, e !== null)) {
            var r = e = e.next;
            do {
              var o = r, a = o.destroy;
              o = o.tag, a !== void 0 && ((o & 2) !== 0 || (o & 4) !== 0) && Qs(t, n, a), r = r.next;
            } while (r !== e);
          }
          break;
        case 1:
          if (Dr(t, n), e = t.stateNode, typeof e.componentWillUnmount == "function") try {
            e.props = t.memoizedProps, e.state = t.memoizedState, e.componentWillUnmount();
          } catch (C) {
            Le(
              t,
              n,
              C
            );
          }
          break;
        case 5:
          Dr(t, n);
          break;
        case 4:
          qe ? pl(e, t, n) : bn && bn && (t = t.stateNode.containerInfo, n = Yi(t), Zi(t, n));
      }
    }
    function ul(e, t, n) {
      for (var r = t; ; ) if (al(e, r, n), r.child === null || qe && r.tag === 4) {
        if (r === t) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === t) return;
          r = r.return;
        }
        r.sibling.return = r.return, r = r.sibling;
      } else r.child.return = r, r = r.child;
    }
    function cl(e) {
      var t = e.alternate;
      t !== null && (e.alternate = null, cl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ba(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
    }
    function fl(e) {
      return e.tag === 5 || e.tag === 3 || e.tag === 4;
    }
    function dl(e) {
      e: for (; ; ) {
        for (; e.sibling === null; ) {
          if (e.return === null || fl(e.return)) return null;
          e = e.return;
        }
        for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
          if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
          e.child.return = e, e = e.child;
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function Al(e) {
      if (qe) {
        e: {
          for (var t = e.return; t !== null; ) {
            if (fl(t)) break e;
            t = t.return;
          }
          throw Error(u(160));
        }
        var n = t;
        switch (n.tag) {
          case 5:
            t = n.stateNode, n.flags & 32 && (Xi(t), n.flags &= -33), n = dl(e), Xs(e, n, t);
            break;
          case 3:
          case 4:
            t = n.stateNode.containerInfo, n = dl(e), zs(e, n, t);
            break;
          default:
            throw Error(u(161));
        }
      }
    }
    function zs(e, t, n) {
      var r = e.tag;
      if (r === 5 || r === 6) e = e.stateNode, t ? Au(n, e, t) : au(n, e);
      else if (r !== 4 && (e = e.child, e !== null)) for (zs(e, t, n), e = e.sibling; e !== null; ) zs(e, t, n), e = e.sibling;
    }
    function Xs(e, t, n) {
      var r = e.tag;
      if (r === 5 || r === 6) e = e.stateNode, t ? du(n, e, t) : lu(n, e);
      else if (r !== 4 && (e = e.child, e !== null)) for (Xs(e, t, n), e = e.sibling; e !== null; ) Xs(e, t, n), e = e.sibling;
    }
    function pl(e, t, n) {
      for (var r = t, o = !1, a, C; ; ) {
        if (!o) {
          o = r.return;
          e: for (; ; ) {
            if (o === null) throw Error(u(160));
            switch (a = o.stateNode, o.tag) {
              case 5:
                C = !1;
                break e;
              case 3:
                a = a.containerInfo, C = !0;
                break e;
              case 4:
                a = a.containerInfo, C = !0;
                break e;
            }
            o = o.return;
          }
          o = !0;
        }
        if (r.tag === 5 || r.tag === 6) ul(e, r, n), C ? hu(a, r.stateNode) : pu(a, r.stateNode);
        else if (r.tag === 18) C ? _u(a, r.stateNode) : Pu(a, r.stateNode);
        else if (r.tag === 4) {
          if (r.child !== null) {
            a = r.stateNode.containerInfo, C = !0, r.child.return = r, r = r.child;
            continue;
          }
        } else if (al(e, r, n), r.child !== null) {
          r.child.return = r, r = r.child;
          continue;
        }
        if (r === t) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === t) return;
          r = r.return, r.tag === 4 && (o = !1);
        }
        r.sibling.return = r.return, r = r.sibling;
      }
    }
    function Ys(e, t) {
      if (qe) {
        switch (t.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            kt(3, t, t.return), Jn(3, t), kt(5, t, t.return);
            return;
          case 1:
            return;
          case 5:
            var n = t.stateNode;
            if (n != null) {
              var r = t.memoizedProps;
              e = e !== null ? e.memoizedProps : r;
              var o = t.type, a = t.updateQueue;
              t.updateQueue = null, a !== null && fu(n, a, o, e, r, t);
            }
            return;
          case 6:
            if (t.stateNode === null) throw Error(u(162));
            n = t.memoizedProps, uu(t.stateNode, e !== null ? e.memoizedProps : n, n);
            return;
          case 3:
            Pe && e !== null && e.memoizedState.isDehydrated && $i(t.stateNode.containerInfo);
            return;
          case 12:
            return;
          case 13:
            Tr(t);
            return;
          case 19:
            Tr(t);
            return;
          case 17:
            return;
        }
        throw Error(u(163));
      }
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          kt(3, t, t.return), Jn(3, t), kt(5, t, t.return);
          return;
        case 12:
          return;
        case 13:
          Tr(t);
          return;
        case 19:
          Tr(t);
          return;
        case 3:
          Pe && e !== null && e.memoizedState.isDehydrated && $i(t.stateNode.containerInfo);
          break;
        case 22:
        case 23:
          return;
      }
      e: if (bn) {
        switch (t.tag) {
          case 1:
          case 5:
          case 6:
            break e;
          case 3:
          case 4:
            t = t.stateNode, Zi(t.containerInfo, t.pendingChildren);
            break e;
        }
        throw Error(u(163));
      }
    }
    function Tr(e) {
      var t = e.updateQueue;
      if (t !== null) {
        e.updateQueue = null;
        var n = e.stateNode;
        n === null && (n = e.stateNode = new pc()), t.forEach(function(r) {
          var o = Rc.bind(null, e, r);
          n.has(r) || (n.add(r), r.then(o, o));
        });
      }
    }
    function Bc(e, t) {
      for (L = t; L !== null; ) {
        t = L;
        var n = t.deletions;
        if (n !== null) for (var r = 0; r < n.length; r++) {
          var o = n[r];
          try {
            var a = e;
            qe ? pl(a, o, t) : ul(a, o, t);
            var C = o.alternate;
            C !== null && (C.return = null), o.return = null;
          } catch (N) {
            Le(o, t, N);
          }
        }
        if (n = t.child, (t.subtreeFlags & 12854) !== 0 && n !== null) n.return = t, L = n;
        else for (; L !== null; ) {
          t = L;
          try {
            var y = t.flags;
            if (y & 32 && qe && Xi(t.stateNode), y & 512) {
              var D = t.alternate;
              if (D !== null) {
                var H = D.ref;
                H !== null && (typeof H == "function" ? H(null) : H.current = null);
              }
            }
            if (y & 8192) switch (t.tag) {
              case 13:
                if (t.memoizedState !== null) {
                  var _ = t.alternate;
                  (_ === null || _.memoizedState === null) && (ei = me());
                }
                break;
              case 22:
                var j = t.memoizedState !== null, Q = t.alternate, re = Q !== null && Q.memoizedState !== null;
                if (n = t, qe) {
                  e: if (r = n, o = j, a = null, qe) for (var k = r; ; ) {
                    if (k.tag === 5) {
                      if (a === null) {
                        a = k;
                        var Se = k.stateNode;
                        o ? Bu(Se) : Cu(k.stateNode, k.memoizedProps);
                      }
                    } else if (k.tag === 6) {
                      if (a === null) {
                        var We = k.stateNode;
                        o ? mu(We) : gu(We, k.memoizedProps);
                      }
                    } else if ((k.tag !== 22 && k.tag !== 23 || k.memoizedState === null || k === r) && k.child !== null) {
                      k.child.return = k, k = k.child;
                      continue;
                    }
                    if (k === r) break;
                    for (; k.sibling === null; ) {
                      if (k.return === null || k.return === r) break e;
                      a === k && (a = null), k = k.return;
                    }
                    a === k && (a = null), k.sibling.return = k.return, k = k.sibling;
                  }
                }
                if (j && !re && (n.mode & 1) !== 0) {
                  L = n;
                  for (var R = n.child; R !== null; ) {
                    for (n = L = R; L !== null; ) {
                      r = L;
                      var F = r.child;
                      switch (r.tag) {
                        case 0:
                        case 11:
                        case 14:
                        case 15:
                          kt(4, r, r.return);
                          break;
                        case 1:
                          Dr(r, r.return);
                          var I = r.stateNode;
                          if (typeof I.componentWillUnmount == "function") {
                            var P = r.return;
                            try {
                              I.props = r.memoizedProps, I.state = r.memoizedState, I.componentWillUnmount();
                            } catch (N) {
                              Le(
                                r,
                                P,
                                N
                              );
                            }
                          }
                          break;
                        case 5:
                          Dr(r, r.return);
                          break;
                        case 22:
                          if (r.memoizedState !== null) {
                            ml(n);
                            continue;
                          }
                      }
                      F !== null ? (F.return = r, L = F) : ml(n);
                    }
                    R = R.sibling;
                  }
                }
            }
            switch (y & 4102) {
              case 2:
                Al(t), t.flags &= -3;
                break;
              case 6:
                Al(t), t.flags &= -3, Ys(t.alternate, t);
                break;
              case 4096:
                t.flags &= -4097;
                break;
              case 4100:
                t.flags &= -4097, Ys(t.alternate, t);
                break;
              case 4:
                Ys(t.alternate, t);
            }
          } catch (N) {
            Le(t, t.return, N);
          }
          if (n = t.sibling, n !== null) {
            n.return = t.return, L = n;
            break;
          }
          L = t.return;
        }
      }
    }
    function mc(e, t, n) {
      L = e, hl(e);
    }
    function hl(e, t, n) {
      for (var r = (e.mode & 1) !== 0; L !== null; ) {
        var o = L, a = o.child;
        if (o.tag === 22 && r) {
          var C = o.memoizedState !== null || Gr;
          if (!C) {
            var y = o.alternate, D = y !== null && y.memoizedState !== null || Nt;
            y = Gr;
            var H = Nt;
            if (Gr = C, (Nt = D) && !H) for (L = o; L !== null; ) C = L, D = C.child, C.tag === 22 && C.memoizedState !== null ? Cl(o) : D !== null ? (D.return = C, L = D) : Cl(o);
            for (; a !== null; ) L = a, hl(a), a = a.sibling;
            L = o, Gr = y, Nt = H;
          }
          Bl(e);
        } else (o.subtreeFlags & 8772) !== 0 && a !== null ? (a.return = o, L = a) : Bl(e);
      }
    }
    function Bl(e) {
      for (; L !== null; ) {
        var t = L;
        if ((t.flags & 8772) !== 0) {
          var n = t.alternate;
          try {
            if ((t.flags & 8772) !== 0) switch (t.tag) {
              case 0:
              case 11:
              case 15:
                Nt || Jn(5, t);
                break;
              case 1:
                var r = t.stateNode;
                if (t.flags & 4 && !Nt) if (n === null) r.componentDidMount();
                else {
                  var o = t.elementType === t.type ? n.memoizedProps : $e(t.type, n.memoizedProps);
                  r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                }
                var a = t.updateQueue;
                a !== null && uo(t, a, r);
                break;
              case 3:
                var C = t.updateQueue;
                if (C !== null) {
                  if (n = null, t.child !== null) switch (t.child.tag) {
                    case 5:
                      n = dt(t.child.stateNode);
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                  uo(t, C, n);
                }
                break;
              case 5:
                var y = t.stateNode;
                n === null && t.flags & 4 && cu(y, t.type, t.memoizedProps, t);
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (Pe && t.memoizedState === null) {
                  var D = t.alternate;
                  if (D !== null) {
                    var H = D.memoizedState;
                    if (H !== null) {
                      var _ = H.dehydrated;
                      _ !== null && Lu(_);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
                break;
              default:
                throw Error(u(163));
            }
            Nt || t.flags & 512 && js(t);
          } catch (j) {
            Le(t, t.return, j);
          }
        }
        if (t === e) {
          L = null;
          break;
        }
        if (n = t.sibling, n !== null) {
          n.return = t.return, L = n;
          break;
        }
        L = t.return;
      }
    }
    function ml(e) {
      for (; L !== null; ) {
        var t = L;
        if (t === e) {
          L = null;
          break;
        }
        var n = t.sibling;
        if (n !== null) {
          n.return = t.return, L = n;
          break;
        }
        L = t.return;
      }
    }
    function Cl(e) {
      for (; L !== null; ) {
        var t = L;
        try {
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              var n = t.return;
              try {
                Jn(4, t);
              } catch (D) {
                Le(t, n, D);
              }
              break;
            case 1:
              var r = t.stateNode;
              if (typeof r.componentDidMount == "function") {
                var o = t.return;
                try {
                  r.componentDidMount();
                } catch (D) {
                  Le(t, o, D);
                }
              }
              var a = t.return;
              try {
                js(t);
              } catch (D) {
                Le(t, a, D);
              }
              break;
            case 5:
              var C = t.return;
              try {
                js(t);
              } catch (D) {
                Le(t, C, D);
              }
          }
        } catch (D) {
          Le(t, t.return, D);
        }
        if (t === e) {
          L = null;
          break;
        }
        var y = t.sibling;
        if (y !== null) {
          y.return = t.return, L = y;
          break;
        }
        L = t.return;
      }
    }
    var wr = 0, Hr = 1, xr = 2, Lr = 3, Pr = 4;
    if (typeof Symbol == "function" && Symbol.for) {
      var On = Symbol.for;
      wr = On("selector.component"), Hr = On("selector.has_pseudo_class"), xr = On("selector.role"), Lr = On("selector.test_id"), Pr = On("selector.text");
    }
    function Ws(e) {
      var t = Za(e);
      if (t != null) {
        if (typeof t.memoizedProps["data-testname"] != "string") throw Error(u(364));
        return t;
      }
      if (e = tu(e), e === null) throw Error(u(362));
      return e.stateNode.current;
    }
    function Zs(e, t) {
      switch (t.$$typeof) {
        case wr:
          if (e.type === t.value) return !0;
          break;
        case Hr:
          e: {
            t = t.value, e = [e, 0];
            for (var n = 0; n < e.length; ) {
              var r = e[n++], o = e[n++], a = t[o];
              if (r.tag !== 5 || !vn(r)) {
                for (; a != null && Zs(r, a); ) o++, a = t[o];
                if (o === t.length) {
                  t = !0;
                  break e;
                } else for (r = r.child; r !== null; ) e.push(r, o), r = r.sibling;
              }
            }
            t = !1;
          }
          return t;
        case xr:
          if (e.tag === 5 && su(e.stateNode, t.value)) return !0;
          break;
        case Pr:
          if ((e.tag === 5 || e.tag === 6) && (e = ru(e), e !== null && 0 <= e.indexOf(t.value))) return !0;
          break;
        case Lr:
          if (e.tag === 5 && (e = e.memoizedProps["data-testname"], typeof e == "string" && e.toLowerCase() === t.value.toLowerCase())) return !0;
          break;
        default:
          throw Error(u(365));
      }
      return !1;
    }
    function Vs(e) {
      switch (e.$$typeof) {
        case wr:
          return "<" + (X(e.value) || "Unknown") + ">";
        case Hr:
          return ":has(" + (Vs(e) || "") + ")";
        case xr:
          return '[role="' + e.value + '"]';
        case Pr:
          return '"' + e.value + '"';
        case Lr:
          return '[data-testname="' + e.value + '"]';
        default:
          throw Error(u(365));
      }
    }
    function gl(e, t) {
      var n = [];
      e = [e, 0];
      for (var r = 0; r < e.length; ) {
        var o = e[r++], a = e[r++], C = t[a];
        if (o.tag !== 5 || !vn(o)) {
          for (; C != null && Zs(o, C); ) a++, C = t[a];
          if (a === t.length) n.push(o);
          else for (o = o.child; o !== null; ) e.push(o, a), o = o.sibling;
        }
      }
      return n;
    }
    function qs(e, t) {
      if (!gn) throw Error(u(363));
      e = Ws(e), e = gl(e, t), t = [], e = Array.from(e);
      for (var n = 0; n < e.length; ) {
        var r = e[n++];
        if (r.tag === 5) vn(r) || t.push(r.stateNode);
        else for (r = r.child; r !== null; ) e.push(r), r = r.sibling;
      }
      return t;
    }
    var Cc = Math.ceil, _r = B.ReactCurrentDispatcher, bs = B.ReactCurrentOwner, Ae = B.ReactCurrentBatchConfig, W = 0, pe = null, he = null, ve = 0, Ne = 0, un = Ft(0), Be = 0, Nn = null, cn = 0, Jr = 0, $s = 0, kn = null, He = null, ei = 0, ti = 1 / 0;
    function fn() {
      ti = me() + 500;
    }
    var Or = !1, ni = null, It = null, Nr = !1, Gt = null, kr = 0, Un = 0, ri = null, Ur = -1, Kr = 0;
    function Ge() {
      return (W & 6) !== 0 ? me() : Ur !== -1 ? Ur : Ur = me();
    }
    function Dt(e) {
      return (e.mode & 1) === 0 ? 1 : (W & 2) !== 0 && ve !== 0 ? ve & -ve : ec.transition !== null ? (Kr === 0 && (e = tr, tr <<= 1, (tr & 4194240) === 0 && (tr = 64), Kr = e), Kr) : (e = b, e !== 0 ? e : qa());
    }
    function Xe(e, t, n) {
      if (50 < Un) throw Un = 0, ri = null, Error(u(185));
      var r = Qr(e, t);
      return r === null ? null : (Mn(r, t, n), ((W & 2) === 0 || r !== pe) && (r === pe && ((W & 2) === 0 && (Jr |= t), Be === 4 && Tt(r, ve)), xe(r, n), t === 1 && W === 0 && (e.mode & 1) === 0 && (fn(), ir && it())), r);
    }
    function Qr(e, t) {
      e.lanes |= t;
      var n = e.alternate;
      for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
      return n.tag === 3 ? n.stateNode : null;
    }
    function xe(e, t) {
      var n = e.callbackNode;
      zu(e, t);
      var r = rr(e, e === pe ? ve : 0);
      if (r === 0) n !== null && so(n), e.callbackNode = null, e.callbackPriority = 0;
      else if (t = r & -r, e.callbackPriority !== t) {
        if (n != null && so(n), t === 1) e.tag === 0 ? $u(El.bind(null, e)) : io(El.bind(null, e)), $a ? eu(function() {
          W === 0 && it();
        }) : fs(ds, it), n = null;
        else {
          switch (ro(r)) {
            case 1:
              n = ds;
              break;
            case 4:
              n = Zu;
              break;
            case 16:
              n = As;
              break;
            case 536870912:
              n = Vu;
              break;
            default:
              n = As;
          }
          n = Tl(n, vl.bind(null, e));
        }
        e.callbackPriority = t, e.callbackNode = n;
      }
    }
    function vl(e, t) {
      if (Ur = -1, Kr = 0, (W & 6) !== 0) throw Error(u(327));
      var n = e.callbackNode;
      if (Qt() && e.callbackNode !== n) return null;
      var r = rr(e, e === pe ? ve : 0);
      if (r === 0) return null;
      if ((r & 30) !== 0 || (r & e.expiredLanes) !== 0 || t) t = jr(e, r);
      else {
        t = r;
        var o = W;
        W |= 2;
        var a = Ml();
        (pe !== e || ve !== t) && (fn(), Ut(e, t));
        do
          try {
            Ec();
            break;
          } catch (y) {
            Fl(e, y);
          }
        while (!0);
        Bs(), _r.current = a, W = o, he !== null ? t = 0 : (pe = null, ve = 0, t = Be);
      }
      if (t !== 0) {
        if (t === 2 && (o = as(e), o !== 0 && (r = o, t = si(e, o))), t === 1) throw n = Nn, Ut(e, 0), Tt(e, r), xe(e, me()), n;
        if (t === 6) Tt(e, r);
        else {
          if (o = e.current.alternate, (r & 30) === 0 && !gc(o) && (t = jr(e, r), t === 2 && (a = as(e), a !== 0 && (r = a, t = si(e, a))), t === 1)) throw n = Nn, Ut(e, 0), Tt(e, r), xe(e, me()), n;
          switch (e.finishedWork = o, e.finishedLanes = r, t) {
            case 0:
            case 1:
              throw Error(u(345));
            case 2:
              Kt(e, He);
              break;
            case 3:
              if (Tt(e, r), (r & 130023424) === r && (t = ei + 500 - me(), 10 < t)) {
                if (rr(e, 0) !== 0) break;
                if (o = e.suspendedLanes, (o & r) !== r) {
                  Ge(), e.pingedLanes |= e.suspendedLanes & o;
                  break;
                }
                e.timeoutHandle = zi(Kt.bind(null, e, He), t);
                break;
              }
              Kt(e, He);
              break;
            case 4:
              if (Tt(e, r), (r & 4194240) === r) break;
              for (t = e.eventTimes, o = -1; 0 < r; ) {
                var C = 31 - be(r);
                a = 1 << C, C = t[C], C > o && (o = C), r &= ~a;
              }
              if (r = o, r = me() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Cc(r / 1960)) - r, 10 < r) {
                e.timeoutHandle = zi(Kt.bind(null, e, He), r);
                break;
              }
              Kt(e, He);
              break;
            case 5:
              Kt(e, He);
              break;
            default:
              throw Error(u(329));
          }
        }
      }
      return xe(e, me()), e.callbackNode === n ? vl.bind(null, e) : null;
    }
    function si(e, t) {
      var n = kn;
      return e.current.memoizedState.isDehydrated && (Ut(e, t).flags |= 256), e = jr(e, t), e !== 2 && (t = He, He = n, t !== null && ii(t)), e;
    }
    function ii(e) {
      He === null ? He = e : He.push.apply(He, e);
    }
    function gc(e) {
      for (var t = e; ; ) {
        if (t.flags & 16384) {
          var n = t.updateQueue;
          if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
            var o = n[r], a = o.getSnapshot;
            o = o.value;
            try {
              if (!st(a(), o)) return !1;
            } catch {
              return !1;
            }
          }
        }
        if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
        else {
          if (t === e) break;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e) return !0;
            t = t.return;
          }
          t.sibling.return = t.return, t = t.sibling;
        }
      }
      return !0;
    }
    function Tt(e, t) {
      for (t &= ~$s, t &= ~Jr, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
        var n = 31 - be(t), r = 1 << n;
        e[n] = -1, t &= ~r;
      }
    }
    function El(e) {
      if ((W & 6) !== 0) throw Error(u(327));
      Qt();
      var t = rr(e, 0);
      if ((t & 1) === 0) return xe(e, me()), null;
      var n = jr(e, t);
      if (e.tag !== 0 && n === 2) {
        var r = as(e);
        r !== 0 && (t = r, n = si(e, r));
      }
      if (n === 1) throw n = Nn, Ut(e, 0), Tt(e, t), xe(e, me()), n;
      if (n === 6) throw Error(u(345));
      return e.finishedWork = e.current.alternate, e.finishedLanes = t, Kt(e, He), xe(e, me()), null;
    }
    function yl(e) {
      Gt !== null && Gt.tag === 0 && (W & 6) === 0 && Qt();
      var t = W;
      W |= 1;
      var n = Ae.transition, r = b;
      try {
        if (Ae.transition = null, b = 1, e) return e();
      } finally {
        b = r, Ae.transition = n, W = t, (W & 6) === 0 && it();
      }
    }
    function oi() {
      Ne = un.current, oe(un);
    }
    function Ut(e, t) {
      e.finishedWork = null, e.finishedLanes = 0;
      var n = e.timeoutHandle;
      if (n !== ns && (e.timeoutHandle = ns, Wa(n)), he !== null) for (n = he.return; n !== null; ) {
        var r = n;
        switch (Fs(r), r.tag) {
          case 1:
            r = r.type.childContextTypes, r != null && $n();
            break;
          case 3:
            ln(), oe(Te), oe(ye), Ts();
            break;
          case 5:
            Gs(r);
            break;
          case 4:
            ln();
            break;
          case 13:
            oe(ce);
            break;
          case 19:
            oe(ce);
            break;
          case 10:
            ms(r.type._context);
            break;
          case 22:
          case 23:
            oi();
        }
        n = n.return;
      }
      if (pe = e, he = e = wt(e.current, null), ve = Ne = t, Be = 0, Nn = null, $s = Jr = cn = 0, He = kn = null, ot !== null) {
        for (t = 0; t < ot.length; t++) if (n = ot[t], r = n.interleaved, r !== null) {
          n.interleaved = null;
          var o = r.next, a = n.pending;
          if (a !== null) {
            var C = a.next;
            a.next = o, r.next = C;
          }
          n.pending = r;
        }
        ot = null;
      }
      return e;
    }
    function Fl(e, t) {
      do {
        var n = he;
        try {
          if (Bs(), Br.current = yr, mr) {
            for (var r = de.memoizedState; r !== null; ) {
              var o = r.queue;
              o !== null && (o.pending = null), r = r.next;
            }
            mr = !1;
          }
          if (an = 0, Ce = Fe = de = null, Tn = !1, wn = 0, bs.current = null, n === null || n.return === null) {
            Be = 1, Nn = t, he = null;
            break;
          }
          e: {
            var a = e, C = n.return, y = n, D = t;
            if (t = ve, y.flags |= 32768, D !== null && typeof D == "object" && typeof D.then == "function") {
              var H = D, _ = y, j = _.tag;
              if ((_.mode & 1) === 0 && (j === 0 || j === 11 || j === 15)) {
                var Q = _.alternate;
                Q ? (_.updateQueue = Q.updateQueue, _.memoizedState = Q.memoizedState, _.lanes = Q.lanes) : (_.updateQueue = null, _.memoizedState = null);
              }
              var re = jo(C);
              if (re !== null) {
                re.flags &= -257, zo(re, C, y, a, t), re.mode & 1 && Qo(a, H, t), t = re, D = H;
                var k = t.updateQueue;
                if (k === null) {
                  var Se = /* @__PURE__ */ new Set();
                  Se.add(D), t.updateQueue = Se;
                } else k.add(D);
                break e;
              } else {
                if ((t & 1) === 0) {
                  Qo(a, H, t), li();
                  break e;
                }
                D = Error(u(426));
              }
            } else if (ue && y.mode & 1) {
              var We = jo(C);
              if (We !== null) {
                (We.flags & 65536) === 0 && (We.flags |= 256), zo(We, C, y, a, t), Ss(D);
                break e;
              }
            }
            a = D, Be !== 4 && (Be = 2), kn === null ? kn = [a] : kn.push(a), D = Js(D, y), y = C;
            do {
              switch (y.tag) {
                case 3:
                  y.flags |= 65536, t &= -t, y.lanes |= t;
                  var R = Uo(y, D, t);
                  ao(y, R);
                  break e;
                case 1:
                  a = D;
                  var F = y.type, I = y.stateNode;
                  if ((y.flags & 128) === 0 && (typeof F.getDerivedStateFromError == "function" || I !== null && typeof I.componentDidCatch == "function" && (It === null || !It.has(I)))) {
                    y.flags |= 65536, t &= -t, y.lanes |= t;
                    var P = Ko(y, a, t);
                    ao(y, P);
                    break e;
                  }
              }
              y = y.return;
            } while (y !== null);
          }
          Sl(n);
        } catch (N) {
          t = N, he === n && n !== null && (he = n = n.return);
          continue;
        }
        break;
      } while (!0);
    }
    function Ml() {
      var e = _r.current;
      return _r.current = yr, e === null ? yr : e;
    }
    function li() {
      (Be === 0 || Be === 3 || Be === 2) && (Be = 4), pe === null || (cn & 268435455) === 0 && (Jr & 268435455) === 0 || Tt(pe, ve);
    }
    function jr(e, t) {
      var n = W;
      W |= 2;
      var r = Ml();
      pe === e && ve === t || Ut(e, t);
      do
        try {
          vc();
          break;
        } catch (o) {
          Fl(e, o);
        }
      while (!0);
      if (Bs(), W = n, _r.current = r, he !== null) throw Error(u(261));
      return pe = null, ve = 0, Be;
    }
    function vc() {
      for (; he !== null; ) Rl(he);
    }
    function Ec() {
      for (; he !== null && !Yu(); ) Rl(he);
    }
    function Rl(e) {
      var t = Dl(e.alternate, e, Ne);
      e.memoizedProps = e.pendingProps, t === null ? Sl(e) : he = t, bs.current = null;
    }
    function Sl(e) {
      var t = e;
      do {
        var n = t.alternate;
        if (e = t.return, (t.flags & 32768) === 0) {
          if (n = cc(n, t, Ne), n !== null) {
            he = n;
            return;
          }
        } else {
          if (n = Ac(n, t), n !== null) {
            n.flags &= 32767, he = n;
            return;
          }
          if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
          else {
            Be = 6, he = null;
            return;
          }
        }
        if (t = t.sibling, t !== null) {
          he = t;
          return;
        }
        he = t = e;
      } while (t !== null);
      Be === 0 && (Be = 5);
    }
    function Kt(e, t) {
      var n = b, r = Ae.transition;
      try {
        Ae.transition = null, b = 1, yc(e, t, n);
      } finally {
        Ae.transition = r, b = n;
      }
      return null;
    }
    function yc(e, t, n) {
      do
        Qt();
      while (Gt !== null);
      if ((W & 6) !== 0) throw Error(u(327));
      var r = e.finishedWork, o = e.finishedLanes;
      if (r === null) return null;
      if (e.finishedWork = null, e.finishedLanes = 0, r === e.current) throw Error(u(177));
      e.callbackNode = null, e.callbackPriority = 0;
      var a = r.lanes | r.childLanes;
      if (Xu(e, a), e === pe && (he = pe = null, ve = 0), (r.subtreeFlags & 2064) === 0 && (r.flags & 2064) === 0 || Nr || (Nr = !0, Tl(As, function() {
        return Qt(), null;
      })), a = (r.flags & 15990) !== 0, (r.subtreeFlags & 15990) !== 0 || a) {
        a = Ae.transition, Ae.transition = null;
        var C = b;
        b = 1;
        var y = W;
        W |= 4, bs.current = null, hc(e, r), Bc(e, r), fe(e.containerInfo), e.current = r, mc(r), Wu(), W = y, b = C, Ae.transition = a;
      } else e.current = r;
      if (Nr && (Nr = !1, Gt = e, kr = o), a = e.pendingLanes, a === 0 && (It = null), qu(r.stateNode), xe(e, me()), t !== null) for (n = e.onRecoverableError, r = 0; r < t.length; r++) n(t[r]);
      if (Or) throw Or = !1, e = ni, ni = null, e;
      return (kr & 1) !== 0 && e.tag !== 0 && Qt(), a = e.pendingLanes, (a & 1) !== 0 ? e === ri ? Un++ : (Un = 0, ri = e) : Un = 0, it(), null;
    }
    function Qt() {
      if (Gt !== null) {
        var e = ro(kr), t = Ae.transition, n = b;
        try {
          if (Ae.transition = null, b = 16 > e ? 16 : e, Gt === null) var r = !1;
          else {
            if (e = Gt, Gt = null, kr = 0, (W & 6) !== 0) throw Error(u(331));
            var o = W;
            for (W |= 4, L = e.current; L !== null; ) {
              var a = L, C = a.child;
              if ((L.flags & 16) !== 0) {
                var y = a.deletions;
                if (y !== null) {
                  for (var D = 0; D < y.length; D++) {
                    var H = y[D];
                    for (L = H; L !== null; ) {
                      var _ = L;
                      switch (_.tag) {
                        case 0:
                        case 11:
                        case 15:
                          kt(8, _, a);
                      }
                      var j = _.child;
                      if (j !== null) j.return = _, L = j;
                      else for (; L !== null; ) {
                        _ = L;
                        var Q = _.sibling, re = _.return;
                        if (cl(_), _ === H) {
                          L = null;
                          break;
                        }
                        if (Q !== null) {
                          Q.return = re, L = Q;
                          break;
                        }
                        L = re;
                      }
                    }
                  }
                  var k = a.alternate;
                  if (k !== null) {
                    var Se = k.child;
                    if (Se !== null) {
                      k.child = null;
                      do {
                        var We = Se.sibling;
                        Se.sibling = null, Se = We;
                      } while (Se !== null);
                    }
                  }
                  L = a;
                }
              }
              if ((a.subtreeFlags & 2064) !== 0 && C !== null) C.return = a, L = C;
              else e: for (; L !== null; ) {
                if (a = L, (a.flags & 2048) !== 0) switch (a.tag) {
                  case 0:
                  case 11:
                  case 15:
                    kt(9, a, a.return);
                }
                var R = a.sibling;
                if (R !== null) {
                  R.return = a.return, L = R;
                  break e;
                }
                L = a.return;
              }
            }
            var F = e.current;
            for (L = F; L !== null; ) {
              C = L;
              var I = C.child;
              if ((C.subtreeFlags & 2064) !== 0 && I !== null) I.return = C, L = I;
              else e: for (C = F; L !== null; ) {
                if (y = L, (y.flags & 2048) !== 0) try {
                  switch (y.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Jn(9, y);
                  }
                } catch (N) {
                  Le(y, y.return, N);
                }
                if (y === C) {
                  L = null;
                  break e;
                }
                var P = y.sibling;
                if (P !== null) {
                  P.return = y.return, L = P;
                  break e;
                }
                L = y.return;
              }
            }
            if (W = o, it(), rt && typeof rt.onPostCommitFiberRoot == "function") try {
              rt.onPostCommitFiberRoot(sr, e);
            } catch {
            }
            r = !0;
          }
          return r;
        } finally {
          b = n, Ae.transition = t;
        }
      }
      return !1;
    }
    function Il(e, t, n) {
      t = Js(n, t), t = Uo(e, t, 1), St(e, t), t = Ge(), e = Qr(e, 1), e !== null && (Mn(e, 1, t), xe(e, t));
    }
    function Le(e, t, n) {
      if (e.tag === 3) Il(e, e, n);
      else for (; t !== null; ) {
        if (t.tag === 3) {
          Il(t, e, n);
          break;
        } else if (t.tag === 1) {
          var r = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (It === null || !It.has(r))) {
            e = Js(n, e), e = Ko(t, e, 1), St(t, e), e = Ge(), t = Qr(t, 1), t !== null && (Mn(t, 1, e), xe(t, e));
            break;
          }
        }
        t = t.return;
      }
    }
    function Fc(e, t, n) {
      var r = e.pingCache;
      r !== null && r.delete(t), t = Ge(), e.pingedLanes |= e.suspendedLanes & n, pe === e && (ve & n) === n && (Be === 4 || Be === 3 && (ve & 130023424) === ve && 500 > me() - ei ? Ut(e, 0) : $s |= n), xe(e, t);
    }
    function Gl(e, t) {
      t === 0 && ((e.mode & 1) === 0 ? t = 1 : (t = nr, nr <<= 1, (nr & 130023424) === 0 && (nr = 4194304)));
      var n = Ge();
      e = Qr(e, t), e !== null && (Mn(e, t, n), xe(e, n));
    }
    function Mc(e) {
      var t = e.memoizedState, n = 0;
      t !== null && (n = t.retryLane), Gl(e, n);
    }
    function Rc(e, t) {
      var n = 0;
      switch (e.tag) {
        case 13:
          var r = e.stateNode, o = e.memoizedState;
          o !== null && (n = o.retryLane);
          break;
        case 19:
          r = e.stateNode;
          break;
        default:
          throw Error(u(314));
      }
      r !== null && r.delete(t), Gl(e, n);
    }
    var Dl;
    Dl = function(e, t, n) {
      if (e !== null) if (e.memoizedProps !== t.pendingProps || Te.current) Oe = !0;
      else {
        if ((e.lanes & n) === 0 && (t.flags & 128) === 0) return Oe = !1, dc(e, t, n);
        Oe = (e.flags & 131072) !== 0;
      }
      else Oe = !1, ue && (t.flags & 1048576) !== 0 && ho(t, Ar, t.index);
      switch (t.lanes = 0, t.tag) {
        case 2:
          var r = t.type;
          e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2), e = t.pendingProps;
          var o = bt(t, ye.current);
          en(t, n), o = Hs(null, t, r, e, o, n);
          var a = xs();
          return t.flags |= 1, typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, we(r) ? (a = !0, er(t)) : a = !1, t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, gs(t), o.updater = fr, t.stateNode = o, o._reactInternals = t, Es(t, r, e, n), t = ks(null, t, r, !0, a, n)) : (t.tag = 0, ue && a && ys(t), Ie(null, t, o, n), t = t.child), t;
        case 16:
          r = t.elementType;
          e: {
            switch (e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2), e = t.pendingProps, o = r._init, r = o(r._payload), t.type = r, o = t.tag = Ic(r), e = $e(r, e), o) {
              case 0:
                t = Ns(null, t, r, e, n);
                break e;
              case 1:
                t = $o(
                  null,
                  t,
                  r,
                  e,
                  n
                );
                break e;
              case 11:
                t = Wo(null, t, r, e, n);
                break e;
              case 14:
                t = Zo(null, t, r, $e(r.type, e), n);
                break e;
            }
            throw Error(u(306, r, ""));
          }
          return t;
        case 0:
          return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : $e(r, o), Ns(e, t, r, o, n);
        case 1:
          return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : $e(r, o), $o(e, t, r, o, n);
        case 3:
          e: {
            if (el(t), e === null) throw Error(u(387));
            r = t.pendingProps, a = t.memoizedState, o = a.element, lo(e, t), cr(t, r, null, n);
            var C = t.memoizedState;
            if (r = C.element, Pe && a.isDehydrated) if (a = {
              element: r,
              isDehydrated: !1,
              cache: C.cache,
              transitions: C.transitions
            }, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
              o = Error(u(423)), t = tl(e, t, r, n, o);
              break e;
            } else if (r !== o) {
              o = Error(u(424)), t = tl(e, t, r, n, o);
              break e;
            } else for (Pe && (Je = Gu(t.stateNode.containerInfo), _e = t, ue = !0, et = null, Rn = !1), n = Eo(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
            else {
              if (rn(), r === o) {
                t = Ct(e, t, n);
                break e;
              }
              Ie(e, t, r, n);
            }
            t = t.child;
          }
          return t;
        case 5:
          return yo(t), e === null && Rs(t), r = t.type, o = t.pendingProps, a = e !== null ? e.memoizedProps : null, C = o.children, yt(r, o) ? C = null : a !== null && yt(r, a) && (t.flags |= 32), bo(e, t), Ie(e, t, C, n), t.child;
        case 6:
          return e === null && Rs(t), null;
        case 13:
          return nl(e, t, n);
        case 4:
          return Is(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = sn(t, null, r, n) : Ie(e, t, r, n), t.child;
        case 11:
          return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : $e(r, o), Wo(e, t, r, o, n);
        case 7:
          return Ie(e, t, t.pendingProps, n), t.child;
        case 8:
          return Ie(e, t, t.pendingProps.children, n), t.child;
        case 12:
          return Ie(e, t, t.pendingProps.children, n), t.child;
        case 10:
          e: {
            if (r = t.type._context, o = t.pendingProps, a = t.memoizedProps, C = o.value, oo(t, r, C), a !== null) if (st(a.value, C)) {
              if (a.children === o.children && !Te.current) {
                t = Ct(e, t, n);
                break e;
              }
            } else for (a = t.child, a !== null && (a.return = t); a !== null; ) {
              var y = a.dependencies;
              if (y !== null) {
                C = a.child;
                for (var D = y.firstContext; D !== null; ) {
                  if (D.context === r) {
                    if (a.tag === 1) {
                      D = pt(-1, n & -n), D.tag = 2;
                      var H = a.updateQueue;
                      if (H !== null) {
                        H = H.shared;
                        var _ = H.pending;
                        _ === null ? D.next = D : (D.next = _.next, _.next = D), H.pending = D;
                      }
                    }
                    a.lanes |= n, D = a.alternate, D !== null && (D.lanes |= n), Cs(a.return, n, t), y.lanes |= n;
                    break;
                  }
                  D = D.next;
                }
              } else if (a.tag === 10) C = a.type === t.type ? null : a.child;
              else if (a.tag === 18) {
                if (C = a.return, C === null) throw Error(u(341));
                C.lanes |= n, y = C.alternate, y !== null && (y.lanes |= n), Cs(C, n, t), C = a.sibling;
              } else C = a.child;
              if (C !== null) C.return = a;
              else for (C = a; C !== null; ) {
                if (C === t) {
                  C = null;
                  break;
                }
                if (a = C.sibling, a !== null) {
                  a.return = C.return, C = a;
                  break;
                }
                C = C.return;
              }
              a = C;
            }
            Ie(e, t, o.children, n), t = t.child;
          }
          return t;
        case 9:
          return o = t.type, r = t.pendingProps.children, en(t, n), o = Ue(o), r = r(o), t.flags |= 1, Ie(e, t, r, n), t.child;
        case 14:
          return r = t.type, o = $e(r, t.pendingProps), o = $e(r.type, o), Zo(e, t, r, o, n);
        case 15:
          return Vo(e, t, t.type, t.pendingProps, n);
        case 17:
          return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : $e(r, o), e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2), t.tag = 1, we(r) ? (e = !0, er(t)) : e = !1, en(t, n), Ao(t, r, o), Es(t, r, o, n), ks(null, t, r, !0, e, n);
        case 19:
          return ol(e, t, n);
        case 22:
          return qo(e, t, n);
      }
      throw Error(u(156, t.tag));
    };
    function Tl(e, t) {
      return fs(e, t);
    }
    function Sc(e, t, n, r) {
      this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
    }
    function Ye(e, t, n, r) {
      return new Sc(e, t, n, r);
    }
    function ai(e) {
      return e = e.prototype, !(!e || !e.isReactComponent);
    }
    function Ic(e) {
      if (typeof e == "function") return ai(e) ? 1 : 0;
      if (e != null) {
        if (e = e.$$typeof, e === T) return 11;
        if (e === S) return 14;
      }
      return 2;
    }
    function wt(e, t) {
      var n = e.alternate;
      return n === null ? (n = Ye(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
    }
    function zr(e, t, n, r, o, a) {
      var C = 2;
      if (r = e, typeof e == "function") ai(e) && (C = 1);
      else if (typeof e == "string") C = 5;
      else e: switch (e) {
        case A:
          return jt(n.children, o, a, t);
        case h:
          C = 8, o |= 8;
          break;
        case g:
          return e = Ye(12, n, t, o | 2), e.elementType = g, e.lanes = a, e;
        case G:
          return e = Ye(13, n, t, o), e.elementType = G, e.lanes = a, e;
        case M:
          return e = Ye(19, n, t, o), e.elementType = M, e.lanes = a, e;
        case x:
          return Xr(n, o, a, t);
        default:
          if (typeof e == "object" && e !== null) switch (e.$$typeof) {
            case v:
              C = 10;
              break e;
            case E:
              C = 9;
              break e;
            case T:
              C = 11;
              break e;
            case S:
              C = 14;
              break e;
            case w:
              C = 16, r = null;
              break e;
          }
          throw Error(u(130, e == null ? e : typeof e, ""));
      }
      return t = Ye(C, n, t, o), t.elementType = e, t.type = r, t.lanes = a, t;
    }
    function jt(e, t, n, r) {
      return e = Ye(7, e, r, t), e.lanes = n, e;
    }
    function Xr(e, t, n, r) {
      return e = Ye(22, e, r, t), e.elementType = x, e.lanes = n, e.stateNode = {}, e;
    }
    function ui(e, t, n) {
      return e = Ye(6, e, null, t), e.lanes = n, e;
    }
    function ci(e, t, n) {
      return t = Ye(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
    }
    function Gc(e, t, n, r, o) {
      this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = ns, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = us(0), this.expirationTimes = us(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = us(0), this.identifierPrefix = r, this.onRecoverableError = o, Pe && (this.mutableSourceEagerHydrationData = null);
    }
    function wl(e, t, n, r, o, a, C, y, D) {
      return e = new Gc(e, t, n, y, D), t === 1 ? (t = 1, a === !0 && (t |= 8)) : t = 0, a = Ye(3, null, null, t), e.current = a, a.stateNode = e, a.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null }, gs(a), e;
    }
    function Hl(e) {
      if (!e) return Mt;
      e = e._reactInternals;
      e: {
        if (Z(e) !== e || e.tag !== 1) throw Error(u(170));
        var t = e;
        do {
          switch (t.tag) {
            case 3:
              t = t.stateNode.context;
              break e;
            case 1:
              if (we(t.type)) {
                t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                break e;
              }
          }
          t = t.return;
        } while (t !== null);
        throw Error(u(171));
      }
      if (e.tag === 1) {
        var n = e.type;
        if (we(n)) return to(e, n, t);
      }
      return t;
    }
    function xl(e) {
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
      return e = ne(t), e === null ? null : e.stateNode;
    }
    function Ll(e, t) {
      if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
        var n = e.retryLane;
        e.retryLane = n !== 0 && n < t ? n : t;
      }
    }
    function fi(e, t) {
      Ll(e, t), (e = e.alternate) && Ll(e, t);
    }
    function Dc(e) {
      return e = ne(e), e === null ? null : e.stateNode;
    }
    function Tc() {
      return null;
    }
    return i.attemptContinuousHydration = function(e) {
      if (e.tag === 13) {
        var t = Ge();
        Xe(e, 134217728, t), fi(e, 134217728);
      }
    }, i.attemptHydrationAtCurrentPriority = function(e) {
      if (e.tag === 13) {
        var t = Ge(), n = Dt(e);
        Xe(e, n, t), fi(e, n);
      }
    }, i.attemptSynchronousHydration = function(e) {
      switch (e.tag) {
        case 3:
          var t = e.stateNode;
          if (t.current.memoizedState.isDehydrated) {
            var n = Fn(t.pendingLanes);
            n !== 0 && (cs(t, n | 1), xe(t, me()), (W & 6) === 0 && (fn(), it()));
          }
          break;
        case 13:
          var r = Ge();
          yl(function() {
            return Xe(e, 1, r);
          }), fi(e, 1);
      }
    }, i.batchedUpdates = function(e, t) {
      var n = W;
      W |= 1;
      try {
        return e(t);
      } finally {
        W = n, W === 0 && (fn(), ir && it());
      }
    }, i.createComponentSelector = function(e) {
      return { $$typeof: wr, value: e };
    }, i.createContainer = function(e, t, n, r, o, a, C) {
      return wl(e, t, !1, null, n, r, o, a, C);
    }, i.createHasPseudoClassSelector = function(e) {
      return { $$typeof: Hr, value: e };
    }, i.createHydrationContainer = function(e, t, n, r, o, a, C, y, D) {
      return e = wl(n, r, !0, e, o, a, C, y, D), e.context = Hl(null), n = e.current, r = Ge(), o = Dt(n), a = pt(r, o), a.callback = t ?? null, St(n, a), e.current.lanes = o, Mn(e, o, r), xe(e, r), e;
    }, i.createPortal = function(e, t, n) {
      var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return { $$typeof: m, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
    }, i.createRoleSelector = function(e) {
      return { $$typeof: xr, value: e };
    }, i.createTestNameSelector = function(e) {
      return { $$typeof: Lr, value: e };
    }, i.createTextSelector = function(e) {
      return { $$typeof: Pr, value: e };
    }, i.deferredUpdates = function(e) {
      var t = b, n = Ae.transition;
      try {
        return Ae.transition = null, b = 16, e();
      } finally {
        b = t, Ae.transition = n;
      }
    }, i.discreteUpdates = function(e, t, n, r, o) {
      var a = b, C = Ae.transition;
      try {
        return Ae.transition = null, b = 1, e(t, n, r, o);
      } finally {
        b = a, Ae.transition = C, W === 0 && fn();
      }
    }, i.findAllNodes = qs, i.findBoundingRects = function(e, t) {
      if (!gn) throw Error(u(363));
      t = qs(e, t), e = [];
      for (var n = 0; n < t.length; n++) e.push(nu(t[n]));
      for (t = e.length - 1; 0 < t; t--) {
        n = e[t];
        for (var r = n.x, o = r + n.width, a = n.y, C = a + n.height, y = t - 1; 0 <= y; y--) if (t !== y) {
          var D = e[y], H = D.x, _ = H + D.width, j = D.y, Q = j + D.height;
          if (r >= H && a >= j && o <= _ && C <= Q) {
            e.splice(t, 1);
            break;
          } else if (r !== H || n.width !== D.width || Q < a || j > C) {
            if (!(a !== j || n.height !== D.height || _ < r || H > o)) {
              H > r && (D.width += H - r, D.x = r), _ < o && (D.width = o - H), e.splice(t, 1);
              break;
            }
          } else {
            j > a && (D.height += j - a, D.y = a), Q < C && (D.height = C - j), e.splice(t, 1);
            break;
          }
        }
      }
      return e;
    }, i.findHostInstance = xl, i.findHostInstanceWithNoPortals = function(e) {
      return e = O(e), e = e !== null ? Et(e) : null, e === null ? null : e.stateNode;
    }, i.findHostInstanceWithWarning = function(e) {
      return xl(e);
    }, i.flushControlled = function(e) {
      var t = W;
      W |= 1;
      var n = Ae.transition, r = b;
      try {
        Ae.transition = null, b = 1, e();
      } finally {
        b = r, Ae.transition = n, W = t, W === 0 && (fn(), it());
      }
    }, i.flushPassiveEffects = Qt, i.flushSync = yl, i.focusWithin = function(e, t) {
      if (!gn) throw Error(u(363));
      for (e = Ws(e), t = gl(e, t), t = Array.from(t), e = 0; e < t.length; ) {
        var n = t[e++];
        if (!vn(n)) {
          if (n.tag === 5 && iu(n.stateNode)) return !0;
          for (n = n.child; n !== null; ) t.push(n), n = n.sibling;
        }
      }
      return !1;
    }, i.getCurrentUpdatePriority = function() {
      return b;
    }, i.getFindAllNodesFailureDescription = function(e, t) {
      if (!gn) throw Error(u(363));
      var n = 0, r = [];
      e = [Ws(e), 0];
      for (var o = 0; o < e.length; ) {
        var a = e[o++], C = e[o++], y = t[C];
        if ((a.tag !== 5 || !vn(a)) && (Zs(a, y) && (r.push(Vs(y)), C++, C > n && (n = C)), C < t.length)) for (a = a.child; a !== null; ) e.push(a, C), a = a.sibling;
      }
      if (n < t.length) {
        for (e = []; n < t.length; n++) e.push(Vs(t[n]));
        return `findAllNodes was able to match part of the selector:
  ` + (r.join(" > ") + `

No matching component was found for:
  `) + e.join(" > ");
      }
      return null;
    }, i.getPublicRootInstance = function(e) {
      return e = e.current, e.child ? e.child.tag === 5 ? dt(e.child.stateNode) : e.child.stateNode : null;
    }, i.injectIntoDevTools = function(e) {
      if (e = { bundleType: e.bundleType, version: e.version, rendererPackageName: e.rendererPackageName, rendererConfig: e.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: B.ReactCurrentDispatcher, findHostInstanceByFiber: Dc, findFiberByHostInstance: e.findFiberByHostInstance || Tc, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.0.0-fc46dba67-20220329" }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u") e = !1;
      else {
        var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (t.isDisabled || !t.supportsFiber) e = !0;
        else {
          try {
            sr = t.inject(e), rt = t;
          } catch {
          }
          e = !!t.checkDCE;
        }
      }
      return e;
    }, i.isAlreadyRendering = function() {
      return !1;
    }, i.observeVisibleRects = function(e, t, n, r) {
      if (!gn) throw Error(u(363));
      e = qs(e, t);
      var o = ou(e, n, r).disconnect;
      return { disconnect: function() {
        o();
      } };
    }, i.registerMutableSourceForHydration = function(e, t) {
      var n = t._getVersion;
      n = n(t._source), e.mutableSourceEagerHydrationData == null ? e.mutableSourceEagerHydrationData = [t, n] : e.mutableSourceEagerHydrationData.push(t, n);
    }, i.runWithPriority = function(e, t) {
      var n = b;
      try {
        return b = e, t();
      } finally {
        b = n;
      }
    }, i.shouldError = function() {
      return null;
    }, i.shouldSuspend = function() {
      return !1;
    }, i.updateContainer = function(e, t, n, r) {
      var o = t.current, a = Ge(), C = Dt(o);
      return n = Hl(n), t.context === null ? t.context = n : t.pendingContext = n, t = pt(a, C), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), St(o, t), e = Xe(o, C, a), e !== null && ur(e, o, C), C;
    }, i;
  }), Ci;
}
var Ql;
function Nf() {
  return Ql || (Ql = 1, mi.exports = Of()), mi.exports;
}
var kf = Nf();
const Uf = /* @__PURE__ */ xc(kf);
var jl = da();
const Oi = {}, Kf = (f) => {
  Object.assign(Oi, f);
};
function Qf(f, s) {
  function i(A, {
    args: h = [],
    attach: g,
    ...v
  }, E) {
    let T = `${A[0].toUpperCase()}${A.slice(1)}`, G;
    if (A === "primitive") {
      if (v.object === void 0) throw new Error("R3F: Primitives without 'object' are invalid!");
      const M = v.object;
      G = pn(M, {
        type: A,
        root: E,
        attach: g,
        primitive: !0
      });
    } else {
      const M = Oi[T];
      if (!M)
        throw new Error(`R3F: ${T} is not part of the THREE namespace! Did you forget to extend? See: https://docs.pmnd.rs/react-three-fiber/api/objects#using-3rd-party-objects-declaratively`);
      if (!Array.isArray(h)) throw new Error("R3F: The args prop must be an array!");
      G = pn(new M(...h), {
        type: A,
        root: E,
        attach: g,
        // Save args in case we need to reconstruct later for HMR
        memoizedProps: {
          args: h
        }
      });
    }
    return G.__r3f.attach === void 0 && (G.isBufferGeometry ? G.__r3f.attach = "geometry" : G.isMaterial && (G.__r3f.attach = "material")), T !== "inject" && Ei(G, v), G;
  }
  function c(A, h) {
    let g = !1;
    if (h) {
      var v, E;
      (v = h.__r3f) != null && v.attach ? vi(A, h, h.__r3f.attach) : h.isObject3D && A.isObject3D && (A.add(h), g = !0), g || (E = A.__r3f) == null || E.objects.push(h), h.__r3f || pn(h, {}), h.__r3f.parent = A, Pi(h), hn(h);
    }
  }
  function l(A, h, g) {
    let v = !1;
    if (h) {
      var E, T;
      if ((E = h.__r3f) != null && E.attach)
        vi(A, h, h.__r3f.attach);
      else if (h.isObject3D && A.isObject3D) {
        h.parent = A, h.dispatchEvent({
          type: "added"
        }), A.dispatchEvent({
          type: "childadded",
          child: h
        });
        const G = A.children.filter((S) => S !== h), M = G.indexOf(g);
        A.children = [...G.slice(0, M), h, ...G.slice(M)], v = !0;
      }
      v || (T = A.__r3f) == null || T.objects.push(h), h.__r3f || pn(h, {}), h.__r3f.parent = A, Pi(h), hn(h);
    }
  }
  function d(A, h, g = !1) {
    A && [...A].forEach((v) => u(h, v, g));
  }
  function u(A, h, g) {
    if (h) {
      var v, E, T;
      if (h.__r3f && (h.__r3f.parent = null), (v = A.__r3f) != null && v.objects && (A.__r3f.objects = A.__r3f.objects.filter((x) => x !== h)), (E = h.__r3f) != null && E.attach)
        Zl(A, h, h.__r3f.attach);
      else if (h.isObject3D && A.isObject3D) {
        var G;
        A.remove(h), (G = h.__r3f) != null && G.root && Vf(qr(h), h);
      }
      const S = (T = h.__r3f) == null ? void 0 : T.primitive, w = !S && (g === void 0 ? h.dispose !== null : g);
      if (!S) {
        var M;
        d((M = h.__r3f) == null ? void 0 : M.objects, h, w), d(h.children, h, w);
      }
      if (delete h.__r3f, w && h.dispose && h.type !== "Scene") {
        const x = () => {
          try {
            h.dispose();
          } catch {
          }
        };
        typeof IS_REACT_ACT_ENVIRONMENT > "u" ? jl.unstable_scheduleCallback(jl.unstable_IdlePriority, x) : x();
      }
      hn(A);
    }
  }
  function B(A, h, g, v) {
    var E;
    const T = (E = A.__r3f) == null ? void 0 : E.parent;
    if (!T) return;
    const G = i(h, g, A.__r3f.root);
    if (A.children) {
      for (const M of A.children)
        M.__r3f && c(G, M);
      A.children = A.children.filter((M) => !M.__r3f);
    }
    A.__r3f.objects.forEach((M) => c(G, M)), A.__r3f.objects = [], A.__r3f.autoRemovedBeforeAppend || u(T, A), G.parent && (G.__r3f.autoRemovedBeforeAppend = !0), c(T, G), G.raycast && G.__r3f.eventCount && qr(G).getState().internal.interaction.push(G), [v, v.alternate].forEach((M) => {
      M !== null && (M.stateNode = G, M.ref && (typeof M.ref == "function" ? M.ref(G) : M.ref.current = G));
    });
  }
  const p = () => {
  };
  return {
    reconciler: Uf({
      createInstance: i,
      removeChild: u,
      appendChild: c,
      appendInitialChild: c,
      insertBefore: l,
      supportsMutation: !0,
      isPrimaryRenderer: !1,
      supportsPersistence: !1,
      supportsHydration: !1,
      noTimeout: -1,
      appendChildToContainer: (A, h) => {
        if (!h) return;
        const g = A.getState().scene;
        g.__r3f && (g.__r3f.root = A, c(g, h));
      },
      removeChildFromContainer: (A, h) => {
        h && u(A.getState().scene, h);
      },
      insertInContainerBefore: (A, h, g) => {
        if (!h || !g) return;
        const v = A.getState().scene;
        v.__r3f && l(v, h, g);
      },
      getRootHostContext: () => null,
      getChildHostContext: (A) => A,
      finalizeInitialChildren(A) {
        var h;
        return !!((h = A?.__r3f) != null ? h : {}).handlers;
      },
      prepareUpdate(A, h, g, v) {
        var E;
        if (((E = A?.__r3f) != null ? E : {}).primitive && v.object && v.object !== A)
          return [!0];
        {
          const {
            args: G = [],
            children: M,
            ...S
          } = v, {
            args: w = [],
            children: x,
            ...U
          } = g;
          if (!Array.isArray(G)) throw new Error("R3F: the args prop must be an array!");
          if (G.some((X, te) => X !== w[te])) return [!0];
          const K = La(A, S, U, !0);
          return K.changes.length ? [!1, K] : null;
        }
      },
      commitUpdate(A, [h, g], v, E, T, G) {
        h ? B(A, v, T, G) : Ei(A, g);
      },
      commitMount(A, h, g, v) {
        var E;
        const T = (E = A.__r3f) != null ? E : {};
        A.raycast && T.handlers && T.eventCount && qr(A).getState().internal.interaction.push(A);
      },
      getPublicInstance: (A) => A,
      prepareForCommit: () => null,
      preparePortalMount: (A) => pn(A.getState().scene),
      resetAfterCommit: () => {
      },
      shouldSetTextContent: () => !1,
      clearContainer: () => !1,
      hideInstance(A) {
        var h;
        const {
          attach: g,
          parent: v
        } = (h = A.__r3f) != null ? h : {};
        g && v && Zl(v, A, g), A.isObject3D && (A.visible = !1), hn(A);
      },
      unhideInstance(A, h) {
        var g;
        const {
          attach: v,
          parent: E
        } = (g = A.__r3f) != null ? g : {};
        v && E && vi(E, A, v), (A.isObject3D && h.visible == null || h.visible) && (A.visible = !0), hn(A);
      },
      createTextInstance: p,
      hideTextInstance: p,
      unhideTextInstance: p,
      // https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r916356874
      // @ts-expect-error
      getCurrentEventPriority: () => s ? s() : Bn.DefaultEventPriority,
      beforeActiveInstanceBlur: () => {
      },
      afterActiveInstanceBlur: () => {
      },
      detachDeletedInstance: () => {
      },
      now: typeof performance < "u" && ie.fun(performance.now) ? performance.now : ie.fun(Date.now) ? Date.now : () => 0,
      // https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r920883503
      scheduleTimeout: ie.fun(setTimeout) ? setTimeout : void 0,
      cancelTimeout: ie.fun(clearTimeout) ? clearTimeout : void 0
    }),
    applyProps: Ei
  };
}
var zl, Xl;
const gi = (f) => "colorSpace" in f || "outputColorSpace" in f, Ga = () => {
  var f;
  return (f = Oi.ColorManagement) != null ? f : null;
}, Da = (f) => f && f.isOrthographicCamera, jf = (f) => f && f.hasOwnProperty("current"), Zn = typeof window < "u" && ((zl = window.document) != null && zl.createElement || ((Xl = window.navigator) == null ? void 0 : Xl.product) === "ReactNative") ? J.useLayoutEffect : J.useEffect;
function Ta(f) {
  const s = J.useRef(f);
  return Zn(() => {
    s.current = f;
  }, [f]), s;
}
function zf({
  set: f
}) {
  return Zn(() => (f(new Promise(() => null)), () => f(!1)), [f]), null;
}
class wa extends J.Component {
  constructor(...s) {
    super(...s), this.state = {
      error: !1
    };
  }
  componentDidCatch(s) {
    this.props.set(s);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}
wa.getDerivedStateFromError = () => ({
  error: !0
});
const Ha = "__default", Yl = /* @__PURE__ */ new Map(), Xf = (f) => f && !!f.memoized && !!f.changes;
function xa(f) {
  var s;
  const i = typeof window < "u" ? (s = window.devicePixelRatio) != null ? s : 2 : 1;
  return Array.isArray(f) ? Math.min(Math.max(f[0], i), f[1]) : f;
}
const Kn = (f) => {
  var s;
  return (s = f.__r3f) == null ? void 0 : s.root.getState();
};
function qr(f) {
  let s = f.__r3f.root;
  for (; s.getState().previousRoot; ) s = s.getState().previousRoot;
  return s;
}
const ie = {
  obj: (f) => f === Object(f) && !ie.arr(f) && typeof f != "function",
  fun: (f) => typeof f == "function",
  str: (f) => typeof f == "string",
  num: (f) => typeof f == "number",
  boo: (f) => typeof f == "boolean",
  und: (f) => f === void 0,
  arr: (f) => Array.isArray(f),
  equ(f, s, {
    arrays: i = "shallow",
    objects: c = "reference",
    strict: l = !0
  } = {}) {
    if (typeof f != typeof s || !!f != !!s) return !1;
    if (ie.str(f) || ie.num(f) || ie.boo(f)) return f === s;
    const d = ie.obj(f);
    if (d && c === "reference") return f === s;
    const u = ie.arr(f);
    if (u && i === "reference") return f === s;
    if ((u || d) && f === s) return !0;
    let B;
    for (B in f) if (!(B in s)) return !1;
    if (d && i === "shallow" && c === "shallow") {
      for (B in l ? s : f) if (!ie.equ(f[B], s[B], {
        strict: l,
        objects: "reference"
      })) return !1;
    } else
      for (B in l ? s : f) if (f[B] !== s[B]) return !1;
    if (ie.und(B)) {
      if (u && f.length === 0 && s.length === 0 || d && Object.keys(f).length === 0 && Object.keys(s).length === 0) return !0;
      if (f !== s) return !1;
    }
    return !0;
  }
};
function Yf(f) {
  const s = {
    nodes: {},
    materials: {}
  };
  return f && f.traverse((i) => {
    i.name && (s.nodes[i.name] = i), i.material && !s.materials[i.material.name] && (s.materials[i.material.name] = i.material);
  }), s;
}
function Wf(f) {
  f.dispose && f.type !== "Scene" && f.dispose();
  for (const s in f)
    s.dispose == null || s.dispose(), delete f[s];
}
function pn(f, s) {
  const i = f;
  return i.__r3f = {
    type: "",
    root: null,
    previousAttach: null,
    memoizedProps: {},
    eventCount: 0,
    handlers: {},
    objects: [],
    parent: null,
    ...s
  }, f;
}
function Li(f, s) {
  let i = f;
  if (s.includes("-")) {
    const c = s.split("-"), l = c.pop();
    return i = c.reduce((d, u) => d[u], f), {
      target: i,
      key: l
    };
  } else return {
    target: i,
    key: s
  };
}
const Wl = /-\d+$/;
function vi(f, s, i) {
  if (ie.str(i)) {
    if (Wl.test(i)) {
      const d = i.replace(Wl, ""), {
        target: u,
        key: B
      } = Li(f, d);
      Array.isArray(u[B]) || (u[B] = []);
    }
    const {
      target: c,
      key: l
    } = Li(f, i);
    s.__r3f.previousAttach = c[l], c[l] = s;
  } else s.__r3f.previousAttach = i(f, s);
}
function Zl(f, s, i) {
  var c, l;
  if (ie.str(i)) {
    const {
      target: d,
      key: u
    } = Li(f, i), B = s.__r3f.previousAttach;
    B === void 0 ? delete d[u] : d[u] = B;
  } else (c = s.__r3f) == null || c.previousAttach == null || c.previousAttach(f, s);
  (l = s.__r3f) == null || delete l.previousAttach;
}
function La(f, {
  children: s,
  key: i,
  ref: c,
  ...l
}, {
  children: d,
  key: u,
  ref: B,
  ...p
} = {}, m = !1) {
  const A = f.__r3f, h = Object.entries(l), g = [];
  if (m) {
    const E = Object.keys(p);
    for (let T = 0; T < E.length; T++)
      l.hasOwnProperty(E[T]) || h.unshift([E[T], Ha + "remove"]);
  }
  h.forEach(([E, T]) => {
    var G;
    if ((G = f.__r3f) != null && G.primitive && E === "object" || ie.equ(T, p[E])) return;
    if (/^on(Pointer|Click|DoubleClick|ContextMenu|Wheel)/.test(E)) return g.push([E, T, !0, []]);
    let M = [];
    E.includes("-") && (M = E.split("-")), g.push([E, T, !1, M]);
    for (const S in l) {
      const w = l[S];
      S.startsWith(`${E}-`) && g.push([S, w, !1, S.split("-")]);
    }
  });
  const v = {
    ...l
  };
  return A != null && A.memoizedProps && A != null && A.memoizedProps.args && (v.args = A.memoizedProps.args), A != null && A.memoizedProps && A != null && A.memoizedProps.attach && (v.attach = A.memoizedProps.attach), {
    memoized: v,
    changes: g
  };
}
function Ei(f, s) {
  var i;
  const c = f.__r3f, l = c?.root, d = l == null || l.getState == null ? void 0 : l.getState(), {
    memoized: u,
    changes: B
  } = Xf(s) ? s : La(f, s), p = c?.eventCount;
  f.__r3f && (f.__r3f.memoizedProps = u);
  for (let g = 0; g < B.length; g++) {
    let [v, E, T, G] = B[g];
    if (gi(f)) {
      const x = "srgb", U = "srgb-linear";
      v === "encoding" ? (v = "colorSpace", E = E === 3001 ? x : U) : v === "outputEncoding" && (v = "outputColorSpace", E = E === 3001 ? x : U);
    }
    let M = f, S = M[v];
    if (G.length && (S = G.reduce((w, x) => w[x], f), !(S && S.set))) {
      const [w, ...x] = G.reverse();
      M = x.reverse().reduce((U, K) => U[K], f), v = w;
    }
    if (E === Ha + "remove")
      if (M.constructor) {
        let w = Yl.get(M.constructor);
        w || (w = new M.constructor(), Yl.set(M.constructor, w)), E = w[v];
      } else
        E = 0;
    if (T && c)
      E ? c.handlers[v] = E : delete c.handlers[v], c.eventCount = Object.keys(c.handlers).length;
    else if (S && S.set && (S.copy || S instanceof Ai)) {
      if (Array.isArray(E))
        S.fromArray ? S.fromArray(E) : S.set(...E);
      else if (S.copy && E && E.constructor && // Some environments may break strict identity checks by duplicating versions of three.js.
      // Loosen to unminified names, ignoring descendents.
      // https://github.com/pmndrs/react-three-fiber/issues/2856
      // TODO: fix upstream and remove in v9
      S.constructor === E.constructor)
        S.copy(E);
      else if (E !== void 0) {
        var m;
        const w = (m = S) == null ? void 0 : m.isColor;
        !w && S.setScalar ? S.setScalar(E) : S instanceof Ai && E instanceof Ai ? S.mask = E.mask : S.set(E), !Ga() && d && !d.linear && w && S.convertSRGBToLinear();
      }
    } else {
      var A;
      if (M[v] = E, (A = M[v]) != null && A.isTexture && // sRGB textures must be RGBA8 since r137 https://github.com/mrdoob/three.js/pull/23129
      M[v].format === zc && M[v].type === Xc && d) {
        const w = M[v];
        gi(w) && gi(d.gl) ? w.colorSpace = d.gl.outputColorSpace : w.encoding = d.gl.outputEncoding;
      }
    }
    hn(f);
  }
  if (c && c.parent && f.raycast && p !== c.eventCount) {
    const g = qr(f).getState().internal, v = g.interaction.indexOf(f);
    v > -1 && g.interaction.splice(v, 1), c.eventCount && g.interaction.push(f);
  }
  return !(B.length === 1 && B[0][0] === "onUpdate") && B.length && (i = f.__r3f) != null && i.parent && Pi(f), f;
}
function hn(f) {
  var s, i;
  const c = (s = f.__r3f) == null || (i = s.root) == null || i.getState == null ? void 0 : i.getState();
  c && c.internal.frames === 0 && c.invalidate();
}
function Pi(f) {
  f.onUpdate == null || f.onUpdate(f);
}
function Pa(f, s) {
  f.manual || (Da(f) ? (f.left = s.width / -2, f.right = s.width / 2, f.top = s.height / 2, f.bottom = s.height / -2) : f.aspect = s.width / s.height, f.updateProjectionMatrix(), f.updateMatrixWorld());
}
function Yr(f) {
  return (f.eventObject || f.object).uuid + "/" + f.index + f.instanceId;
}
function Zf() {
  var f;
  const s = typeof self < "u" && self || typeof window < "u" && window;
  if (!s) return Bn.DefaultEventPriority;
  switch ((f = s.event) == null ? void 0 : f.type) {
    case "click":
    case "contextmenu":
    case "dblclick":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
      return Bn.DiscreteEventPriority;
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "pointerenter":
    case "pointerleave":
    case "wheel":
      return Bn.ContinuousEventPriority;
    default:
      return Bn.DefaultEventPriority;
  }
}
function _a(f, s, i, c) {
  const l = i.get(s);
  l && (i.delete(s), i.size === 0 && (f.delete(c), l.target.releasePointerCapture(c)));
}
function Vf(f, s) {
  const {
    internal: i
  } = f.getState();
  i.interaction = i.interaction.filter((c) => c !== s), i.initialHits = i.initialHits.filter((c) => c !== s), i.hovered.forEach((c, l) => {
    (c.eventObject === s || c.object === s) && i.hovered.delete(l);
  }), i.capturedMap.forEach((c, l) => {
    _a(i.capturedMap, s, c, l);
  });
}
function qf(f) {
  function s(p) {
    const {
      internal: m
    } = f.getState(), A = p.offsetX - m.initialClick[0], h = p.offsetY - m.initialClick[1];
    return Math.round(Math.sqrt(A * A + h * h));
  }
  function i(p) {
    return p.filter((m) => ["Move", "Over", "Enter", "Out", "Leave"].some((A) => {
      var h;
      return (h = m.__r3f) == null ? void 0 : h.handlers["onPointer" + A];
    }));
  }
  function c(p, m) {
    const A = f.getState(), h = /* @__PURE__ */ new Set(), g = [], v = m ? m(A.internal.interaction) : A.internal.interaction;
    for (let M = 0; M < v.length; M++) {
      const S = Kn(v[M]);
      S && (S.raycaster.camera = void 0);
    }
    A.previousRoot || A.events.compute == null || A.events.compute(p, A);
    function E(M) {
      const S = Kn(M);
      if (!S || !S.events.enabled || S.raycaster.camera === null) return [];
      if (S.raycaster.camera === void 0) {
        var w;
        S.events.compute == null || S.events.compute(p, S, (w = S.previousRoot) == null ? void 0 : w.getState()), S.raycaster.camera === void 0 && (S.raycaster.camera = null);
      }
      return S.raycaster.camera ? S.raycaster.intersectObject(M, !0) : [];
    }
    let T = v.flatMap(E).sort((M, S) => {
      const w = Kn(M.object), x = Kn(S.object);
      return !w || !x ? M.distance - S.distance : x.events.priority - w.events.priority || M.distance - S.distance;
    }).filter((M) => {
      const S = Yr(M);
      return h.has(S) ? !1 : (h.add(S), !0);
    });
    A.events.filter && (T = A.events.filter(T, A));
    for (const M of T) {
      let S = M.object;
      for (; S; ) {
        var G;
        (G = S.__r3f) != null && G.eventCount && g.push({
          ...M,
          eventObject: S
        }), S = S.parent;
      }
    }
    if ("pointerId" in p && A.internal.capturedMap.has(p.pointerId))
      for (let M of A.internal.capturedMap.get(p.pointerId).values())
        h.has(Yr(M.intersection)) || g.push(M.intersection);
    return g;
  }
  function l(p, m, A, h) {
    const g = f.getState();
    if (p.length) {
      const v = {
        stopped: !1
      };
      for (const E of p) {
        const T = Kn(E.object) || g, {
          raycaster: G,
          pointer: M,
          camera: S,
          internal: w
        } = T, x = new tt(M.x, M.y, 0).unproject(S), U = (q) => {
          var O, ne;
          return (O = (ne = w.capturedMap.get(q)) == null ? void 0 : ne.has(E.eventObject)) != null ? O : !1;
        }, K = (q) => {
          const O = {
            intersection: E,
            target: m.target
          };
          w.capturedMap.has(q) ? w.capturedMap.get(q).set(E.eventObject, O) : w.capturedMap.set(q, /* @__PURE__ */ new Map([[E.eventObject, O]])), m.target.setPointerCapture(q);
        }, X = (q) => {
          const O = w.capturedMap.get(q);
          O && _a(w.capturedMap, E.eventObject, O, q);
        };
        let te = {};
        for (let q in m) {
          let O = m[q];
          typeof O != "function" && (te[q] = O);
        }
        let Z = {
          ...E,
          ...te,
          pointer: M,
          intersections: p,
          stopped: v.stopped,
          delta: A,
          unprojectedPoint: x,
          ray: G.ray,
          camera: S,
          // Hijack stopPropagation, which just sets a flag
          stopPropagation() {
            const q = "pointerId" in m && w.capturedMap.get(m.pointerId);
            if (
              // ...if this pointer hasn't been captured
              (!q || // ... or if the hit object is capturing the pointer
              q.has(E.eventObject)) && (Z.stopped = v.stopped = !0, w.hovered.size && Array.from(w.hovered.values()).find((O) => O.eventObject === E.eventObject))
            ) {
              const O = p.slice(0, p.indexOf(E));
              d([...O, E]);
            }
          },
          // there should be a distinction between target and currentTarget
          target: {
            hasPointerCapture: U,
            setPointerCapture: K,
            releasePointerCapture: X
          },
          currentTarget: {
            hasPointerCapture: U,
            setPointerCapture: K,
            releasePointerCapture: X
          },
          nativeEvent: m
        };
        if (h(Z), v.stopped === !0) break;
      }
    }
    return p;
  }
  function d(p) {
    const {
      internal: m
    } = f.getState();
    for (const A of m.hovered.values())
      if (!p.length || !p.find((h) => h.object === A.object && h.index === A.index && h.instanceId === A.instanceId)) {
        const g = A.eventObject.__r3f, v = g?.handlers;
        if (m.hovered.delete(Yr(A)), g != null && g.eventCount) {
          const E = {
            ...A,
            intersections: p
          };
          v.onPointerOut == null || v.onPointerOut(E), v.onPointerLeave == null || v.onPointerLeave(E);
        }
      }
  }
  function u(p, m) {
    for (let A = 0; A < m.length; A++) {
      const h = m[A].__r3f;
      h == null || h.handlers.onPointerMissed == null || h.handlers.onPointerMissed(p);
    }
  }
  function B(p) {
    switch (p) {
      case "onPointerLeave":
      case "onPointerCancel":
        return () => d([]);
      case "onLostPointerCapture":
        return (m) => {
          const {
            internal: A
          } = f.getState();
          "pointerId" in m && A.capturedMap.has(m.pointerId) && requestAnimationFrame(() => {
            A.capturedMap.has(m.pointerId) && (A.capturedMap.delete(m.pointerId), d([]));
          });
        };
    }
    return function(A) {
      const {
        onPointerMissed: h,
        internal: g
      } = f.getState();
      g.lastEvent.current = A;
      const v = p === "onPointerMove", E = p === "onClick" || p === "onContextMenu" || p === "onDoubleClick", G = c(A, v ? i : void 0), M = E ? s(A) : 0;
      p === "onPointerDown" && (g.initialClick = [A.offsetX, A.offsetY], g.initialHits = G.map((w) => w.eventObject)), E && !G.length && M <= 2 && (u(A, g.interaction), h && h(A)), v && d(G);
      function S(w) {
        const x = w.eventObject, U = x.__r3f, K = U?.handlers;
        if (U != null && U.eventCount)
          if (v) {
            if (K.onPointerOver || K.onPointerEnter || K.onPointerOut || K.onPointerLeave) {
              const X = Yr(w), te = g.hovered.get(X);
              te ? te.stopped && w.stopPropagation() : (g.hovered.set(X, w), K.onPointerOver == null || K.onPointerOver(w), K.onPointerEnter == null || K.onPointerEnter(w));
            }
            K.onPointerMove == null || K.onPointerMove(w);
          } else {
            const X = K[p];
            X ? (!E || g.initialHits.includes(x)) && (u(A, g.interaction.filter((te) => !g.initialHits.includes(te))), X(w)) : E && g.initialHits.includes(x) && u(A, g.interaction.filter((te) => !g.initialHits.includes(te)));
          }
      }
      l(G, A, M, S);
    };
  }
  return {
    handlePointer: B
  };
}
const bf = ["set", "get", "setSize", "setFrameloop", "setDpr", "events", "invalidate", "advance", "size", "viewport"], Ja = (f) => !!(f != null && f.render), Ni = /* @__PURE__ */ J.createContext(null), $f = (f, s) => {
  const i = Ra((B, p) => {
    const m = new tt(), A = new tt(), h = new tt();
    function g(M = p().camera, S = A, w = p().size) {
      const {
        width: x,
        height: U,
        top: K,
        left: X
      } = w, te = x / U;
      S.isVector3 ? h.copy(S) : h.set(...S);
      const Z = M.getWorldPosition(m).distanceTo(h);
      if (Da(M))
        return {
          width: x / M.zoom,
          height: U / M.zoom,
          top: K,
          left: X,
          factor: 1,
          distance: Z,
          aspect: te
        };
      {
        const q = M.fov * Math.PI / 180, O = 2 * Math.tan(q / 2) * Z, ne = O * (x / U);
        return {
          width: ne,
          height: O,
          top: K,
          left: X,
          factor: x / ne,
          distance: Z,
          aspect: te
        };
      }
    }
    let v;
    const E = (M) => B((S) => ({
      performance: {
        ...S.performance,
        current: M
      }
    })), T = new ts();
    return {
      set: B,
      get: p,
      // Mock objects that have to be configured
      gl: null,
      camera: null,
      raycaster: null,
      events: {
        priority: 1,
        enabled: !0,
        connected: !1
      },
      xr: null,
      scene: null,
      invalidate: (M = 1) => f(p(), M),
      advance: (M, S) => s(M, S, p()),
      legacy: !1,
      linear: !1,
      flat: !1,
      controls: null,
      clock: new jc(),
      pointer: T,
      mouse: T,
      frameloop: "always",
      onPointerMissed: void 0,
      performance: {
        current: 1,
        min: 0.5,
        max: 1,
        debounce: 200,
        regress: () => {
          const M = p();
          v && clearTimeout(v), M.performance.current !== M.performance.min && E(M.performance.min), v = setTimeout(() => E(p().performance.max), M.performance.debounce);
        }
      },
      size: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        updateStyle: !1
      },
      viewport: {
        initialDpr: 0,
        dpr: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        aspect: 0,
        distance: 0,
        factor: 0,
        getCurrentViewport: g
      },
      setEvents: (M) => B((S) => ({
        ...S,
        events: {
          ...S.events,
          ...M
        }
      })),
      setSize: (M, S, w, x, U) => {
        const K = p().camera, X = {
          width: M,
          height: S,
          top: x || 0,
          left: U || 0,
          updateStyle: w
        };
        B((te) => ({
          size: X,
          viewport: {
            ...te.viewport,
            ...g(K, A, X)
          }
        }));
      },
      setDpr: (M) => B((S) => {
        const w = xa(M);
        return {
          viewport: {
            ...S.viewport,
            dpr: w,
            initialDpr: S.viewport.initialDpr || w
          }
        };
      }),
      setFrameloop: (M = "always") => {
        const S = p().clock;
        S.stop(), S.elapsedTime = 0, M !== "never" && (S.start(), S.elapsedTime = 0), B(() => ({
          frameloop: M
        }));
      },
      previousRoot: void 0,
      internal: {
        active: !1,
        priority: 0,
        frames: 0,
        lastEvent: /* @__PURE__ */ J.createRef(),
        interaction: [],
        hovered: /* @__PURE__ */ new Map(),
        subscribers: [],
        initialClick: [0, 0],
        initialHits: [],
        capturedMap: /* @__PURE__ */ new Map(),
        subscribe: (M, S, w) => {
          const x = p().internal;
          return x.priority = x.priority + (S > 0 ? 1 : 0), x.subscribers.push({
            ref: M,
            priority: S,
            store: w
          }), x.subscribers = x.subscribers.sort((U, K) => U.priority - K.priority), () => {
            const U = p().internal;
            U != null && U.subscribers && (U.priority = U.priority - (S > 0 ? 1 : 0), U.subscribers = U.subscribers.filter((K) => K.ref !== M));
          };
        }
      }
    };
  }), c = i.getState();
  let l = c.size, d = c.viewport.dpr, u = c.camera;
  return i.subscribe(() => {
    const {
      camera: B,
      size: p,
      viewport: m,
      gl: A,
      set: h
    } = i.getState();
    if (p.width !== l.width || p.height !== l.height || m.dpr !== d) {
      var g;
      l = p, d = m.dpr, Pa(B, p), A.setPixelRatio(m.dpr);
      const v = (g = p.updateStyle) != null ? g : typeof HTMLCanvasElement < "u" && A.domElement instanceof HTMLCanvasElement;
      A.setSize(p.width, p.height, v);
    }
    B !== u && (u = B, h((v) => ({
      viewport: {
        ...v.viewport,
        ...v.viewport.getCurrentViewport(B)
      }
    })));
  }), i.subscribe((B) => f(B)), i;
};
let Wr, ed = /* @__PURE__ */ new Set(), td = /* @__PURE__ */ new Set(), nd = /* @__PURE__ */ new Set();
function yi(f, s) {
  if (f.size)
    for (const {
      callback: i
    } of f.values())
      i(s);
}
function Qn(f, s) {
  switch (f) {
    case "before":
      return yi(ed, s);
    case "after":
      return yi(td, s);
    case "tail":
      return yi(nd, s);
  }
}
let Fi, Mi;
function Ri(f, s, i) {
  let c = s.clock.getDelta();
  for (s.frameloop === "never" && typeof f == "number" && (c = f - s.clock.elapsedTime, s.clock.oldTime = s.clock.elapsedTime, s.clock.elapsedTime = f), Fi = s.internal.subscribers, Wr = 0; Wr < Fi.length; Wr++)
    Mi = Fi[Wr], Mi.ref.current(Mi.store.getState(), c, i);
  return !s.internal.priority && s.gl.render && s.gl.render(s.scene, s.camera), s.internal.frames = Math.max(0, s.internal.frames - 1), s.frameloop === "always" ? 1 : s.internal.frames;
}
function rd(f) {
  let s = !1, i = !1, c, l, d;
  function u(m) {
    l = requestAnimationFrame(u), s = !0, c = 0, Qn("before", m), i = !0;
    for (const h of f.values()) {
      var A;
      d = h.store.getState(), d.internal.active && (d.frameloop === "always" || d.internal.frames > 0) && !((A = d.gl.xr) != null && A.isPresenting) && (c += Ri(m, d));
    }
    if (i = !1, Qn("after", m), c === 0)
      return Qn("tail", m), s = !1, cancelAnimationFrame(l);
  }
  function B(m, A = 1) {
    var h;
    if (!m) return f.forEach((g) => B(g.store.getState(), A));
    (h = m.gl.xr) != null && h.isPresenting || !m.internal.active || m.frameloop === "never" || (A > 1 ? m.internal.frames = Math.min(60, m.internal.frames + A) : i ? m.internal.frames = 2 : m.internal.frames = 1, s || (s = !0, requestAnimationFrame(u)));
  }
  function p(m, A = !0, h, g) {
    if (A && Qn("before", m), h) Ri(m, h, g);
    else for (const v of f.values()) Ri(m, v.store.getState());
    A && Qn("after", m);
  }
  return {
    loop: u,
    invalidate: B,
    advance: p
  };
}
function ki() {
  const f = J.useContext(Ni);
  if (!f) throw new Error("R3F: Hooks can only be used within the Canvas component!");
  return f;
}
function AA(f = (i) => i, s) {
  return ki()(f, s);
}
function pA(f, s = 0) {
  const i = ki(), c = i.getState().internal.subscribe, l = Ta(f);
  return Zn(() => c(l, s, i), [s, c, i]), null;
}
const Vl = /* @__PURE__ */ new WeakMap();
function Oa(f, s) {
  return function(i, ...c) {
    let l = Vl.get(i);
    return l || (l = new i(), Vl.set(i, l)), f && f(l), Promise.all(c.map((d) => new Promise((u, B) => l.load(d, (p) => {
      p.scene && Object.assign(p, Yf(p.scene)), u(p);
    }, s, (p) => B(new Error(`Could not load ${d}: ${p?.message}`))))));
  };
}
function Vn(f, s, i, c) {
  const l = Array.isArray(s) ? s : [s], d = Pf(Oa(i, c), [f, ...l], {
    equal: ie.equ
  });
  return Array.isArray(s) ? d : d[0];
}
Vn.preload = function(f, s, i) {
  const c = Array.isArray(s) ? s : [s];
  return _f(Oa(i), [f, ...c]);
};
Vn.clear = function(f, s) {
  const i = Array.isArray(s) ? s : [s];
  return Jf([f, ...i]);
};
const Cn = /* @__PURE__ */ new Map(), {
  invalidate: ql,
  advance: bl
} = rd(Cn), {
  reconciler: Wn,
  applyProps: dn
} = Qf(Cn, Zf), An = {
  objects: "shallow",
  strict: !1
}, sd = (f, s) => {
  const i = typeof f == "function" ? f(s) : f;
  return Ja(i) ? i : new Pc({
    powerPreference: "high-performance",
    canvas: s,
    antialias: !0,
    alpha: !0,
    ...f
  });
};
function id(f, s) {
  const i = typeof HTMLCanvasElement < "u" && f instanceof HTMLCanvasElement;
  if (s) {
    const {
      width: c,
      height: l,
      top: d,
      left: u,
      updateStyle: B = i
    } = s;
    return {
      width: c,
      height: l,
      top: d,
      left: u,
      updateStyle: B
    };
  } else if (typeof HTMLCanvasElement < "u" && f instanceof HTMLCanvasElement && f.parentElement) {
    const {
      width: c,
      height: l,
      top: d,
      left: u
    } = f.parentElement.getBoundingClientRect();
    return {
      width: c,
      height: l,
      top: d,
      left: u,
      updateStyle: i
    };
  } else if (typeof OffscreenCanvas < "u" && f instanceof OffscreenCanvas)
    return {
      width: f.width,
      height: f.height,
      top: 0,
      left: 0,
      updateStyle: i
    };
  return {
    width: 0,
    height: 0,
    top: 0,
    left: 0
  };
}
function od(f) {
  const s = Cn.get(f), i = s?.fiber, c = s?.store;
  s && console.warn("R3F.createRoot should only be called once!");
  const l = typeof reportError == "function" ? (
    // In modern browsers, reportError will dispatch an error event,
    // emulating an uncaught JavaScript error.
    reportError
  ) : (
    // In older browsers and test environments, fallback to console.error.
    console.error
  ), d = c || $f(ql, bl), u = i || Wn.createContainer(d, Bn.ConcurrentRoot, null, !1, null, "", l, null);
  s || Cn.set(f, {
    fiber: u,
    store: d
  });
  let B, p = !1, m;
  return {
    configure(A = {}) {
      let {
        gl: h,
        size: g,
        scene: v,
        events: E,
        onCreated: T,
        shadows: G = !1,
        linear: M = !1,
        flat: S = !1,
        legacy: w = !1,
        orthographic: x = !1,
        frameloop: U = "always",
        dpr: K = [1, 2],
        performance: X,
        raycaster: te,
        camera: Z,
        onPointerMissed: q
      } = A, O = d.getState(), ne = O.gl;
      O.gl || O.set({
        gl: ne = sd(h, f)
      });
      let De = O.raycaster;
      De || O.set({
        raycaster: De = new Aa()
      });
      const {
        params: Et,
        ...ft
      } = te || {};
      if (ie.equ(ft, De, An) || dn(De, {
        ...ft
      }), ie.equ(Et, De.params, An) || dn(De, {
        params: {
          ...De.params,
          ...Et
        }
      }), !O.camera || O.camera === m && !ie.equ(m, Z, An)) {
        m = Z;
        const fe = Z instanceof Qc, le = fe ? Z : x ? new pa(0, 0, 0, 0, 0.1, 1e3) : new ha(75, 0, 0.1, 1e3);
        fe || (le.position.z = 5, Z && (dn(le, Z), ("aspect" in Z || "left" in Z || "right" in Z || "bottom" in Z || "top" in Z) && (le.manual = !0, le.updateProjectionMatrix())), !O.camera && !(Z != null && Z.rotation) && le.lookAt(0, 0, 0)), O.set({
          camera: le
        }), De.camera = le;
      }
      if (!O.scene) {
        let fe;
        v != null && v.isScene ? fe = v : (fe = new Jc(), v && dn(fe, v)), O.set({
          scene: pn(fe)
        });
      }
      if (!O.xr) {
        var dt;
        const fe = (ae, Vt) => {
          const yt = d.getState();
          yt.frameloop !== "never" && bl(ae, !0, yt, Vt);
        }, le = () => {
          const ae = d.getState();
          ae.gl.xr.enabled = ae.gl.xr.isPresenting, ae.gl.xr.setAnimationLoop(ae.gl.xr.isPresenting ? fe : null), ae.gl.xr.isPresenting || ql(ae);
        }, Ve = {
          connect() {
            const ae = d.getState().gl;
            ae.xr.addEventListener("sessionstart", le), ae.xr.addEventListener("sessionend", le);
          },
          disconnect() {
            const ae = d.getState().gl;
            ae.xr.removeEventListener("sessionstart", le), ae.xr.removeEventListener("sessionend", le);
          }
        };
        typeof ((dt = ne.xr) == null ? void 0 : dt.addEventListener) == "function" && Ve.connect(), O.set({
          xr: Ve
        });
      }
      if (ne.shadowMap) {
        const fe = ne.shadowMap.enabled, le = ne.shadowMap.type;
        if (ne.shadowMap.enabled = !!G, ie.boo(G))
          ne.shadowMap.type = di;
        else if (ie.str(G)) {
          var Zt;
          const Ve = {
            basic: kc,
            percentage: Nc,
            soft: di,
            variance: Oc
          };
          ne.shadowMap.type = (Zt = Ve[G]) != null ? Zt : di;
        } else ie.obj(G) && Object.assign(ne.shadowMap, G);
        (fe !== ne.shadowMap.enabled || le !== ne.shadowMap.type) && (ne.shadowMap.needsUpdate = !0);
      }
      const ke = Ga();
      ke && ("enabled" in ke ? ke.enabled = !w : "legacyMode" in ke && (ke.legacyMode = w)), p || dn(ne, {
        outputEncoding: M ? 3e3 : 3001,
        toneMapping: S ? Uc : Kc
      }), O.legacy !== w && O.set(() => ({
        legacy: w
      })), O.linear !== M && O.set(() => ({
        linear: M
      })), O.flat !== S && O.set(() => ({
        flat: S
      })), h && !ie.fun(h) && !Ja(h) && !ie.equ(h, ne, An) && dn(ne, h), E && !O.events.handlers && O.set({
        events: E(d)
      });
      const nt = id(f, g);
      return ie.equ(nt, O.size, An) || O.setSize(nt.width, nt.height, nt.updateStyle, nt.top, nt.left), K && O.viewport.dpr !== xa(K) && O.setDpr(K), O.frameloop !== U && O.setFrameloop(U), O.onPointerMissed || O.set({
        onPointerMissed: q
      }), X && !ie.equ(X, O.performance, An) && O.set((fe) => ({
        performance: {
          ...fe.performance,
          ...X
        }
      })), B = T, p = !0, this;
    },
    render(A) {
      return p || this.configure(), Wn.updateContainer(/* @__PURE__ */ Ee.jsx(ld, {
        store: d,
        children: A,
        onCreated: B,
        rootElement: f
      }), u, null, () => {
      }), d;
    },
    unmount() {
      Na(f);
    }
  };
}
function ld({
  store: f,
  children: s,
  onCreated: i,
  rootElement: c
}) {
  return Zn(() => {
    const l = f.getState();
    l.set((d) => ({
      internal: {
        ...d.internal,
        active: !0
      }
    })), i && i(l), f.getState().events.connected || l.events.connect == null || l.events.connect(c);
  }, []), /* @__PURE__ */ Ee.jsx(Ni.Provider, {
    value: f,
    children: s
  });
}
function Na(f, s) {
  const i = Cn.get(f), c = i?.fiber;
  if (c) {
    const l = i?.store.getState();
    l && (l.internal.active = !1), Wn.updateContainer(null, c, null, () => {
      l && setTimeout(() => {
        try {
          var d, u, B, p;
          l.events.disconnect == null || l.events.disconnect(), (d = l.gl) == null || (u = d.renderLists) == null || u.dispose == null || u.dispose(), (B = l.gl) == null || B.forceContextLoss == null || B.forceContextLoss(), (p = l.gl) != null && p.xr && l.xr.disconnect(), Wf(l), Cn.delete(f);
        } catch {
        }
      }, 500);
    });
  }
}
function hA(f, s, i) {
  return /* @__PURE__ */ Ee.jsx(ad, {
    children: f,
    container: s,
    state: i
  }, s.uuid);
}
function ad({
  state: f = {},
  children: s,
  container: i
}) {
  const {
    events: c,
    size: l,
    ...d
  } = f, u = ki(), [B] = J.useState(() => new Aa()), [p] = J.useState(() => new ts()), m = J.useCallback(
    (h, g) => {
      const v = {
        ...h
      };
      Object.keys(h).forEach((T) => {
        // Some props should be off-limits
        (bf.includes(T) || // Otherwise filter out the props that are different and let the inject layer take precedence
        // Unless the inject layer props is undefined, then we keep the root layer
        h[T] !== g[T] && g[T]) && delete v[T];
      });
      let E;
      if (g && l) {
        const T = g.camera;
        E = h.viewport.getCurrentViewport(T, new tt(), l), T !== h.camera && Pa(T, l);
      }
      return {
        // The intersect consists of the previous root state
        ...v,
        // Portals have their own scene, which forms the root, a raycaster and a pointer
        scene: i,
        raycaster: B,
        pointer: p,
        mouse: p,
        // Their previous root is the layer before it
        previousRoot: u,
        // Events, size and viewport can be overridden by the inject layer
        events: {
          ...h.events,
          ...g?.events,
          ...c
        },
        size: {
          ...h.size,
          ...l
        },
        viewport: {
          ...h.viewport,
          ...E
        },
        ...d
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f]
  ), [A] = J.useState(() => {
    const h = u.getState();
    return Ra((v, E) => ({
      ...h,
      scene: i,
      raycaster: B,
      pointer: p,
      mouse: p,
      previousRoot: u,
      events: {
        ...h.events,
        ...c
      },
      size: {
        ...h.size,
        ...l
      },
      ...d,
      // Set and get refer to this root-state
      set: v,
      get: E,
      // Layers are allowed to override events
      setEvents: (T) => v((G) => ({
        ...G,
        events: {
          ...G.events,
          ...T
        }
      }))
    }));
  });
  return J.useEffect(() => {
    const h = u.subscribe((g) => A.setState((v) => m(g, v)));
    return () => {
      h();
    };
  }, [m]), J.useEffect(() => {
    A.setState((h) => m(u.getState(), h));
  }, [m]), J.useEffect(() => () => {
    A.destroy();
  }, []), /* @__PURE__ */ Ee.jsx(Ee.Fragment, {
    children: Wn.createPortal(/* @__PURE__ */ Ee.jsx(Ni.Provider, {
      value: A,
      children: s
    }), A, null)
  });
}
Wn.injectIntoDevTools({
  bundleType: 0,
  rendererPackageName: "@react-three/fiber",
  version: J.version
});
const Si = {
  onClick: ["click", !1],
  onContextMenu: ["contextmenu", !1],
  onDoubleClick: ["dblclick", !1],
  onWheel: ["wheel", !0],
  onPointerDown: ["pointerdown", !0],
  onPointerUp: ["pointerup", !0],
  onPointerLeave: ["pointerleave", !0],
  onPointerMove: ["pointermove", !0],
  onPointerCancel: ["pointercancel", !0],
  onLostPointerCapture: ["lostpointercapture", !0]
};
function ud(f) {
  const {
    handlePointer: s
  } = qf(f);
  return {
    priority: 1,
    enabled: !0,
    compute(i, c, l) {
      c.pointer.set(i.offsetX / c.size.width * 2 - 1, -(i.offsetY / c.size.height) * 2 + 1), c.raycaster.setFromCamera(c.pointer, c.camera);
    },
    connected: void 0,
    handlers: Object.keys(Si).reduce((i, c) => ({
      ...i,
      [c]: s(c)
    }), {}),
    update: () => {
      var i;
      const {
        events: c,
        internal: l
      } = f.getState();
      (i = l.lastEvent) != null && i.current && c.handlers && c.handlers.onPointerMove(l.lastEvent.current);
    },
    connect: (i) => {
      var c;
      const {
        set: l,
        events: d
      } = f.getState();
      d.disconnect == null || d.disconnect(), l((u) => ({
        events: {
          ...u.events,
          connected: i
        }
      })), Object.entries((c = d.handlers) != null ? c : []).forEach(([u, B]) => {
        const [p, m] = Si[u];
        i.addEventListener(p, B, {
          passive: m
        });
      });
    },
    disconnect: () => {
      const {
        set: i,
        events: c
      } = f.getState();
      if (c.connected) {
        var l;
        Object.entries((l = c.handlers) != null ? l : []).forEach(([d, u]) => {
          if (c && c.connected instanceof HTMLElement) {
            const [B] = Si[d];
            c.connected.removeEventListener(B, u);
          }
        }), i((d) => ({
          events: {
            ...d.events,
            connected: void 0
          }
        }));
      }
    }
  };
}
function $l(f, s) {
  let i;
  return (...c) => {
    window.clearTimeout(i), i = window.setTimeout(() => f(...c), s);
  };
}
function cd({ debounce: f, scroll: s, polyfill: i, offsetSize: c } = { debounce: 0, scroll: !1, offsetSize: !1 }) {
  const l = i || (typeof window > "u" ? class {
  } : window.ResizeObserver);
  if (!l) throw new Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");
  const [d, u] = J.useState({ left: 0, top: 0, width: 0, height: 0, bottom: 0, right: 0, x: 0, y: 0 }), B = J.useRef({ element: null, scrollContainers: null, resizeObserver: null, lastBounds: d, orientationHandler: null }), p = f ? typeof f == "number" ? f : f.scroll : null, m = f ? typeof f == "number" ? f : f.resize : null, A = J.useRef(!1);
  J.useEffect(() => (A.current = !0, () => {
    A.current = !1;
  }));
  const [h, g, v] = J.useMemo(() => {
    const M = () => {
      if (!B.current.element) return;
      const { left: S, top: w, width: x, height: U, bottom: K, right: X, x: te, y: Z } = B.current.element.getBoundingClientRect(), q = { left: S, top: w, width: x, height: U, bottom: K, right: X, x: te, y: Z };
      B.current.element instanceof HTMLElement && c && (q.height = B.current.element.offsetHeight, q.width = B.current.element.offsetWidth), Object.freeze(q), A.current && !pd(B.current.lastBounds, q) && u(B.current.lastBounds = q);
    };
    return [M, m ? $l(M, m) : M, p ? $l(M, p) : M];
  }, [u, c, p, m]);
  function E() {
    B.current.scrollContainers && (B.current.scrollContainers.forEach((M) => M.removeEventListener("scroll", v, !0)), B.current.scrollContainers = null), B.current.resizeObserver && (B.current.resizeObserver.disconnect(), B.current.resizeObserver = null), B.current.orientationHandler && ("orientation" in screen && "removeEventListener" in screen.orientation ? screen.orientation.removeEventListener("change", B.current.orientationHandler) : "onorientationchange" in window && window.removeEventListener("orientationchange", B.current.orientationHandler));
  }
  function T() {
    B.current.element && (B.current.resizeObserver = new l(v), B.current.resizeObserver.observe(B.current.element), s && B.current.scrollContainers && B.current.scrollContainers.forEach((M) => M.addEventListener("scroll", v, { capture: !0, passive: !0 })), B.current.orientationHandler = () => {
      v();
    }, "orientation" in screen && "addEventListener" in screen.orientation ? screen.orientation.addEventListener("change", B.current.orientationHandler) : "onorientationchange" in window && window.addEventListener("orientationchange", B.current.orientationHandler));
  }
  const G = (M) => {
    !M || M === B.current.element || (E(), B.current.element = M, B.current.scrollContainers = ka(M), T());
  };
  return dd(v, !!s), fd(g), J.useEffect(() => {
    E(), T();
  }, [s, v, g]), J.useEffect(() => E, []), [G, d, h];
}
function fd(f) {
  J.useEffect(() => {
    const s = f;
    return window.addEventListener("resize", s), () => {
      window.removeEventListener("resize", s);
    };
  }, [f]);
}
function dd(f, s) {
  J.useEffect(() => {
    if (s) {
      const i = f;
      return window.addEventListener("scroll", i, { capture: !0, passive: !0 }), () => {
        window.removeEventListener("scroll", i, !0);
      };
    }
  }, [f, s]);
}
function ka(f) {
  const s = [];
  if (!f || f === document.body) return s;
  const { overflow: i, overflowX: c, overflowY: l } = window.getComputedStyle(f);
  return [i, c, l].some((d) => d === "auto" || d === "scroll") && s.push(f), [...s, ...ka(f.parentElement)];
}
const Ad = ["x", "y", "top", "bottom", "left", "right", "width", "height"], pd = (f, s) => Ad.every((i) => f[i] === s[i]);
var hd = Object.defineProperty, Bd = Object.defineProperties, md = Object.getOwnPropertyDescriptors, ea = Object.getOwnPropertySymbols, Cd = Object.prototype.hasOwnProperty, gd = Object.prototype.propertyIsEnumerable, ta = (f, s, i) => s in f ? hd(f, s, { enumerable: !0, configurable: !0, writable: !0, value: i }) : f[s] = i, na = (f, s) => {
  for (var i in s || (s = {}))
    Cd.call(s, i) && ta(f, i, s[i]);
  if (ea)
    for (var i of ea(s))
      gd.call(s, i) && ta(f, i, s[i]);
  return f;
}, vd = (f, s) => Bd(f, md(s)), ra, sa;
typeof window < "u" && ((ra = window.document) != null && ra.createElement || ((sa = window.navigator) == null ? void 0 : sa.product) === "ReactNative") ? J.useLayoutEffect : J.useEffect;
function Ua(f, s, i) {
  if (!f)
    return;
  if (i(f) === !0)
    return f;
  let c = f.child;
  for (; c; ) {
    const l = Ua(c, s, i);
    if (l)
      return l;
    c = c.sibling;
  }
}
function Ka(f) {
  try {
    return Object.defineProperties(f, {
      _currentRenderer: {
        get() {
          return null;
        },
        set() {
        }
      },
      _currentRenderer2: {
        get() {
          return null;
        },
        set() {
        }
      }
    });
  } catch {
    return f;
  }
}
const ia = console.error;
console.error = function() {
  const f = [...arguments].join("");
  if (f?.startsWith("Warning:") && f.includes("useContext")) {
    console.error = ia;
    return;
  }
  return ia.apply(this, arguments);
};
const Ui = Ka(J.createContext(null));
class Qa extends J.Component {
  render() {
    return /* @__PURE__ */ J.createElement(Ui.Provider, {
      value: this._reactInternals
    }, this.props.children);
  }
}
function Ed() {
  const f = J.useContext(Ui);
  if (f === null)
    throw new Error("its-fine: useFiber must be called within a <FiberProvider />!");
  const s = J.useId();
  return J.useMemo(() => {
    for (const c of [f, f?.alternate]) {
      if (!c)
        continue;
      const l = Ua(c, !1, (d) => {
        let u = d.memoizedState;
        for (; u; ) {
          if (u.memoizedState === s)
            return !0;
          u = u.next;
        }
      });
      if (l)
        return l;
    }
  }, [f, s]);
}
function yd() {
  const f = Ed(), [s] = J.useState(() => /* @__PURE__ */ new Map());
  s.clear();
  let i = f;
  for (; i; ) {
    if (i.type && typeof i.type == "object") {
      const l = i.type._context === void 0 && i.type.Provider === i.type ? i.type : i.type._context;
      l && l !== Ui && !s.has(l) && s.set(l, J.useContext(Ka(l)));
    }
    i = i.return;
  }
  return s;
}
function Fd() {
  const f = yd();
  return J.useMemo(
    () => Array.from(f.keys()).reduce(
      (s, i) => (c) => /* @__PURE__ */ J.createElement(s, null, /* @__PURE__ */ J.createElement(i.Provider, vd(na({}, c), {
        value: f.get(i)
      }))),
      (s) => /* @__PURE__ */ J.createElement(Qa, na({}, s))
    ),
    [f]
  );
}
const Md = /* @__PURE__ */ J.forwardRef(function({
  children: s,
  fallback: i,
  resize: c,
  style: l,
  gl: d,
  events: u = ud,
  eventSource: B,
  eventPrefix: p,
  shadows: m,
  linear: A,
  flat: h,
  legacy: g,
  orthographic: v,
  frameloop: E,
  dpr: T,
  performance: G,
  raycaster: M,
  camera: S,
  scene: w,
  onPointerMissed: x,
  onCreated: U,
  ...K
}, X) {
  J.useMemo(() => Kf(_c), []);
  const te = Fd(), [Z, q] = cd({
    scroll: !0,
    debounce: {
      scroll: 50,
      resize: 0
    },
    ...c
  }), O = J.useRef(null), ne = J.useRef(null);
  J.useImperativeHandle(X, () => O.current);
  const De = Ta(x), [Et, ft] = J.useState(!1), [dt, Zt] = J.useState(!1);
  if (Et) throw Et;
  if (dt) throw dt;
  const ke = J.useRef(null);
  Zn(() => {
    const fe = O.current;
    q.width > 0 && q.height > 0 && fe && (ke.current || (ke.current = od(fe)), ke.current.configure({
      gl: d,
      events: u,
      shadows: m,
      linear: A,
      flat: h,
      legacy: g,
      orthographic: v,
      frameloop: E,
      dpr: T,
      performance: G,
      raycaster: M,
      camera: S,
      scene: w,
      size: q,
      // Pass mutable reference to onPointerMissed so it's free to update
      onPointerMissed: (...le) => De.current == null ? void 0 : De.current(...le),
      onCreated: (le) => {
        le.events.connect == null || le.events.connect(B ? jf(B) ? B.current : B : ne.current), p && le.setEvents({
          compute: (Ve, ae) => {
            const Vt = Ve[p + "X"], yt = Ve[p + "Y"];
            ae.pointer.set(Vt / ae.size.width * 2 - 1, -(yt / ae.size.height) * 2 + 1), ae.raycaster.setFromCamera(ae.pointer, ae.camera);
          }
        }), U?.(le);
      }
    }), ke.current.render(/* @__PURE__ */ Ee.jsx(te, {
      children: /* @__PURE__ */ Ee.jsx(wa, {
        set: Zt,
        children: /* @__PURE__ */ Ee.jsx(J.Suspense, {
          fallback: /* @__PURE__ */ Ee.jsx(zf, {
            set: ft
          }),
          children: s ?? null
        })
      })
    })));
  }), J.useEffect(() => {
    const fe = O.current;
    if (fe) return () => Na(fe);
  }, []);
  const nt = B ? "none" : "auto";
  return /* @__PURE__ */ Ee.jsx("div", {
    ref: ne,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      pointerEvents: nt,
      ...l
    },
    ...K,
    children: /* @__PURE__ */ Ee.jsx("div", {
      ref: Z,
      style: {
        width: "100%",
        height: "100%"
      },
      children: /* @__PURE__ */ Ee.jsx("canvas", {
        ref: O,
        style: {
          display: "block"
        },
        children: i
      })
    })
  });
}), Rd = /* @__PURE__ */ J.forwardRef(function(s, i) {
  return /* @__PURE__ */ Ee.jsx(Qa, {
    children: /* @__PURE__ */ Ee.jsx(Md, {
      ...s,
      ref: i
    })
  });
});
function BA({ fence: f = null, ...s }) {
  return /* @__PURE__ */ Ee.jsx(Lc.Suspense, { fallback: f, children: /* @__PURE__ */ Ee.jsx(Rd, { ...s }) });
}
const Sd = parseInt(Yc.replace(/\D+/g, ""));
function oa(f, s) {
  if (s === Wc)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), f;
  if (s === Hi || s === Ba) {
    let i = f.getIndex();
    if (i === null) {
      const u = [], B = f.getAttribute("position");
      if (B !== void 0) {
        for (let p = 0; p < B.count; p++)
          u.push(p);
        f.setIndex(u), i = f.getIndex();
      } else
        return console.error(
          "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."
        ), f;
    }
    const c = i.count - 2, l = [];
    if (i)
      if (s === Hi)
        for (let u = 1; u <= c; u++)
          l.push(i.getX(0)), l.push(i.getX(u)), l.push(i.getX(u + 1));
      else
        for (let u = 0; u < c; u++)
          u % 2 === 0 ? (l.push(i.getX(u)), l.push(i.getX(u + 1)), l.push(i.getX(u + 2))) : (l.push(i.getX(u + 2)), l.push(i.getX(u + 1)), l.push(i.getX(u)));
    l.length / 3 !== c && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const d = f.clone();
    return d.setIndex(l), d.clearGroups(), d;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", s), f;
}
function es(f) {
  if (typeof TextDecoder < "u")
    return new TextDecoder().decode(f);
  let s = "";
  for (let i = 0, c = f.length; i < c; i++)
    s += String.fromCharCode(f[i]);
  try {
    return decodeURIComponent(escape(s));
  } catch {
    return s;
  }
}
const Yt = "srgb", vt = "srgb-linear", la = 3001, Id = 3e3;
class Ki extends ma {
  constructor(s) {
    super(s), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(i) {
      return new Hd(i);
    }), this.register(function(i) {
      return new xd(i);
    }), this.register(function(i) {
      return new Kd(i);
    }), this.register(function(i) {
      return new Qd(i);
    }), this.register(function(i) {
      return new jd(i);
    }), this.register(function(i) {
      return new Pd(i);
    }), this.register(function(i) {
      return new _d(i);
    }), this.register(function(i) {
      return new Jd(i);
    }), this.register(function(i) {
      return new Od(i);
    }), this.register(function(i) {
      return new wd(i);
    }), this.register(function(i) {
      return new Nd(i);
    }), this.register(function(i) {
      return new Ld(i);
    }), this.register(function(i) {
      return new Ud(i);
    }), this.register(function(i) {
      return new kd(i);
    }), this.register(function(i) {
      return new Dd(i);
    }), this.register(function(i) {
      return new zd(i);
    }), this.register(function(i) {
      return new Xd(i);
    });
  }
  load(s, i, c, l) {
    const d = this;
    let u;
    if (this.resourcePath !== "")
      u = this.resourcePath;
    else if (this.path !== "") {
      const m = Xn.extractUrlBase(s);
      u = Xn.resolveURL(m, this.path);
    } else
      u = Xn.extractUrlBase(s);
    this.manager.itemStart(s);
    const B = function(m) {
      l ? l(m) : console.error(m), d.manager.itemError(s), d.manager.itemEnd(s);
    }, p = new br(this.manager);
    p.setPath(this.path), p.setResponseType("arraybuffer"), p.setRequestHeader(this.requestHeader), p.setWithCredentials(this.withCredentials), p.load(
      s,
      function(m) {
        try {
          d.parse(
            m,
            u,
            function(A) {
              i(A), d.manager.itemEnd(s);
            },
            B
          );
        } catch (A) {
          B(A);
        }
      },
      c,
      B
    );
  }
  setDRACOLoader(s) {
    return this.dracoLoader = s, this;
  }
  setDDSLoader() {
    throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".');
  }
  setKTX2Loader(s) {
    return this.ktx2Loader = s, this;
  }
  setMeshoptDecoder(s) {
    return this.meshoptDecoder = s, this;
  }
  register(s) {
    return this.pluginCallbacks.indexOf(s) === -1 && this.pluginCallbacks.push(s), this;
  }
  unregister(s) {
    return this.pluginCallbacks.indexOf(s) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(s), 1), this;
  }
  parse(s, i, c, l) {
    let d;
    const u = {}, B = {};
    if (typeof s == "string")
      d = JSON.parse(s);
    else if (s instanceof ArrayBuffer)
      if (es(new Uint8Array(s.slice(0, 4))) === ja) {
        try {
          u[V.KHR_BINARY_GLTF] = new Yd(s);
        } catch (A) {
          l && l(A);
          return;
        }
        d = JSON.parse(u[V.KHR_BINARY_GLTF].content);
      } else
        d = JSON.parse(es(new Uint8Array(s)));
    else
      d = s;
    if (d.asset === void 0 || d.asset.version[0] < 2) {
      l && l(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const p = new oA(d, {
      path: i || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    p.fileLoader.setRequestHeader(this.requestHeader);
    for (let m = 0; m < this.pluginCallbacks.length; m++) {
      const A = this.pluginCallbacks[m](p);
      A.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), B[A.name] = A, u[A.name] = !0;
    }
    if (d.extensionsUsed)
      for (let m = 0; m < d.extensionsUsed.length; ++m) {
        const A = d.extensionsUsed[m], h = d.extensionsRequired || [];
        switch (A) {
          case V.KHR_MATERIALS_UNLIT:
            u[A] = new Td();
            break;
          case V.KHR_DRACO_MESH_COMPRESSION:
            u[A] = new Wd(d, this.dracoLoader);
            break;
          case V.KHR_TEXTURE_TRANSFORM:
            u[A] = new Zd();
            break;
          case V.KHR_MESH_QUANTIZATION:
            u[A] = new Vd();
            break;
          default:
            h.indexOf(A) >= 0 && B[A] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + A + '".');
        }
      }
    p.setExtensions(u), p.setPlugins(B), p.parse(c, l);
  }
  parseAsync(s, i) {
    const c = this;
    return new Promise(function(l, d) {
      c.parse(s, i, l, d);
    });
  }
}
function Gd() {
  let f = {};
  return {
    get: function(s) {
      return f[s];
    },
    add: function(s, i) {
      f[s] = i;
    },
    remove: function(s) {
      delete f[s];
    },
    removeAll: function() {
      f = {};
    }
  };
}
const V = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class Dd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const s = this.parser, i = this.parser.json.nodes || [];
    for (let c = 0, l = i.length; c < l; c++) {
      const d = i[c];
      d.extensions && d.extensions[this.name] && d.extensions[this.name].light !== void 0 && s._addNodeRef(this.cache, d.extensions[this.name].light);
    }
  }
  _loadLight(s) {
    const i = this.parser, c = "light:" + s;
    let l = i.cache.get(c);
    if (l)
      return l;
    const d = i.json, p = ((d.extensions && d.extensions[this.name] || {}).lights || [])[s];
    let m;
    const A = new Wt(16777215);
    p.color !== void 0 && A.setRGB(p.color[0], p.color[1], p.color[2], vt);
    const h = p.range !== void 0 ? p.range : 0;
    switch (p.type) {
      case "directional":
        m = new qc(A), m.target.position.set(0, 0, -1), m.add(m.target);
        break;
      case "point":
        m = new Vc(A), m.distance = h;
        break;
      case "spot":
        m = new Zc(A), m.distance = h, p.spot = p.spot || {}, p.spot.innerConeAngle = p.spot.innerConeAngle !== void 0 ? p.spot.innerConeAngle : 0, p.spot.outerConeAngle = p.spot.outerConeAngle !== void 0 ? p.spot.outerConeAngle : Math.PI / 4, m.angle = p.spot.outerConeAngle, m.penumbra = 1 - p.spot.innerConeAngle / p.spot.outerConeAngle, m.target.position.set(0, 0, -1), m.add(m.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + p.type);
    }
    return m.position.set(0, 0, 0), m.decay = 2, gt(m, p), p.intensity !== void 0 && (m.intensity = p.intensity), m.name = i.createUniqueName(p.name || "light_" + s), l = Promise.resolve(m), i.cache.add(c, l), l;
  }
  getDependency(s, i) {
    if (s === "light")
      return this._loadLight(i);
  }
  createNodeAttachment(s) {
    const i = this, c = this.parser, d = c.json.nodes[s], B = (d.extensions && d.extensions[this.name] || {}).light;
    return B === void 0 ? null : this._loadLight(B).then(function(p) {
      return c._getNodeRef(i.cache, B, p);
    });
  }
}
class Td {
  constructor() {
    this.name = V.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return zn;
  }
  extendParams(s, i, c) {
    const l = [];
    s.color = new Wt(1, 1, 1), s.opacity = 1;
    const d = i.pbrMetallicRoughness;
    if (d) {
      if (Array.isArray(d.baseColorFactor)) {
        const u = d.baseColorFactor;
        s.color.setRGB(u[0], u[1], u[2], vt), s.opacity = u[3];
      }
      d.baseColorTexture !== void 0 && l.push(c.assignTexture(s, "map", d.baseColorTexture, Yt));
    }
    return Promise.all(l);
  }
}
class wd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(s, i) {
    const l = this.parser.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = l.extensions[this.name].emissiveStrength;
    return d !== void 0 && (i.emissiveIntensity = d), Promise.resolve();
  }
}
class Hd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    if (u.clearcoatFactor !== void 0 && (i.clearcoat = u.clearcoatFactor), u.clearcoatTexture !== void 0 && d.push(c.assignTexture(i, "clearcoatMap", u.clearcoatTexture)), u.clearcoatRoughnessFactor !== void 0 && (i.clearcoatRoughness = u.clearcoatRoughnessFactor), u.clearcoatRoughnessTexture !== void 0 && d.push(c.assignTexture(i, "clearcoatRoughnessMap", u.clearcoatRoughnessTexture)), u.clearcoatNormalTexture !== void 0 && (d.push(c.assignTexture(i, "clearcoatNormalMap", u.clearcoatNormalTexture)), u.clearcoatNormalTexture.scale !== void 0)) {
      const B = u.clearcoatNormalTexture.scale;
      i.clearcoatNormalScale = new ts(B, B);
    }
    return Promise.all(d);
  }
}
class xd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const l = this.parser.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = l.extensions[this.name];
    return i.dispersion = d.dispersion !== void 0 ? d.dispersion : 0, Promise.resolve();
  }
}
class Ld {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    return u.iridescenceFactor !== void 0 && (i.iridescence = u.iridescenceFactor), u.iridescenceTexture !== void 0 && d.push(c.assignTexture(i, "iridescenceMap", u.iridescenceTexture)), u.iridescenceIor !== void 0 && (i.iridescenceIOR = u.iridescenceIor), i.iridescenceThicknessRange === void 0 && (i.iridescenceThicknessRange = [100, 400]), u.iridescenceThicknessMinimum !== void 0 && (i.iridescenceThicknessRange[0] = u.iridescenceThicknessMinimum), u.iridescenceThicknessMaximum !== void 0 && (i.iridescenceThicknessRange[1] = u.iridescenceThicknessMaximum), u.iridescenceThicknessTexture !== void 0 && d.push(
      c.assignTexture(i, "iridescenceThicknessMap", u.iridescenceThicknessTexture)
    ), Promise.all(d);
  }
}
class Pd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [];
    i.sheenColor = new Wt(0, 0, 0), i.sheenRoughness = 0, i.sheen = 1;
    const u = l.extensions[this.name];
    if (u.sheenColorFactor !== void 0) {
      const B = u.sheenColorFactor;
      i.sheenColor.setRGB(B[0], B[1], B[2], vt);
    }
    return u.sheenRoughnessFactor !== void 0 && (i.sheenRoughness = u.sheenRoughnessFactor), u.sheenColorTexture !== void 0 && d.push(c.assignTexture(i, "sheenColorMap", u.sheenColorTexture, Yt)), u.sheenRoughnessTexture !== void 0 && d.push(c.assignTexture(i, "sheenRoughnessMap", u.sheenRoughnessTexture)), Promise.all(d);
  }
}
class _d {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    return u.transmissionFactor !== void 0 && (i.transmission = u.transmissionFactor), u.transmissionTexture !== void 0 && d.push(c.assignTexture(i, "transmissionMap", u.transmissionTexture)), Promise.all(d);
  }
}
class Jd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    i.thickness = u.thicknessFactor !== void 0 ? u.thicknessFactor : 0, u.thicknessTexture !== void 0 && d.push(c.assignTexture(i, "thicknessMap", u.thicknessTexture)), i.attenuationDistance = u.attenuationDistance || 1 / 0;
    const B = u.attenuationColor || [1, 1, 1];
    return i.attenuationColor = new Wt().setRGB(
      B[0],
      B[1],
      B[2],
      vt
    ), Promise.all(d);
  }
}
class Od {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_IOR;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const l = this.parser.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = l.extensions[this.name];
    return i.ior = d.ior !== void 0 ? d.ior : 1.5, Promise.resolve();
  }
}
class Nd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    i.specularIntensity = u.specularFactor !== void 0 ? u.specularFactor : 1, u.specularTexture !== void 0 && d.push(c.assignTexture(i, "specularIntensityMap", u.specularTexture));
    const B = u.specularColorFactor || [1, 1, 1];
    return i.specularColor = new Wt().setRGB(B[0], B[1], B[2], vt), u.specularColorTexture !== void 0 && d.push(
      c.assignTexture(i, "specularColorMap", u.specularColorTexture, Yt)
    ), Promise.all(d);
  }
}
class kd {
  constructor(s) {
    this.parser = s, this.name = V.EXT_MATERIALS_BUMP;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    return i.bumpScale = u.bumpFactor !== void 0 ? u.bumpFactor : 1, u.bumpTexture !== void 0 && d.push(c.assignTexture(i, "bumpMap", u.bumpTexture)), Promise.all(d);
  }
}
class Ud {
  constructor(s) {
    this.parser = s, this.name = V.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(s) {
    const c = this.parser.json.materials[s];
    return !c.extensions || !c.extensions[this.name] ? null : ct;
  }
  extendMaterialParams(s, i) {
    const c = this.parser, l = c.json.materials[s];
    if (!l.extensions || !l.extensions[this.name])
      return Promise.resolve();
    const d = [], u = l.extensions[this.name];
    return u.anisotropyStrength !== void 0 && (i.anisotropy = u.anisotropyStrength), u.anisotropyRotation !== void 0 && (i.anisotropyRotation = u.anisotropyRotation), u.anisotropyTexture !== void 0 && d.push(c.assignTexture(i, "anisotropyMap", u.anisotropyTexture)), Promise.all(d);
  }
}
class Kd {
  constructor(s) {
    this.parser = s, this.name = V.KHR_TEXTURE_BASISU;
  }
  loadTexture(s) {
    const i = this.parser, c = i.json, l = c.textures[s];
    if (!l.extensions || !l.extensions[this.name])
      return null;
    const d = l.extensions[this.name], u = i.options.ktx2Loader;
    if (!u) {
      if (c.extensionsRequired && c.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return i.loadTextureImage(s, d.source, u);
  }
}
class Qd {
  constructor(s) {
    this.parser = s, this.name = V.EXT_TEXTURE_WEBP, this.isSupported = null;
  }
  loadTexture(s) {
    const i = this.name, c = this.parser, l = c.json, d = l.textures[s];
    if (!d.extensions || !d.extensions[i])
      return null;
    const u = d.extensions[i], B = l.images[u.source];
    let p = c.textureLoader;
    if (B.uri) {
      const m = c.options.manager.getHandler(B.uri);
      m !== null && (p = m);
    }
    return this.detectSupport().then(function(m) {
      if (m)
        return c.loadTextureImage(s, u.source, p);
      if (l.extensionsRequired && l.extensionsRequired.indexOf(i) >= 0)
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      return c.loadTexture(s);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(s) {
      const i = new Image();
      i.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", i.onload = i.onerror = function() {
        s(i.height === 1);
      };
    })), this.isSupported;
  }
}
class jd {
  constructor(s) {
    this.parser = s, this.name = V.EXT_TEXTURE_AVIF, this.isSupported = null;
  }
  loadTexture(s) {
    const i = this.name, c = this.parser, l = c.json, d = l.textures[s];
    if (!d.extensions || !d.extensions[i])
      return null;
    const u = d.extensions[i], B = l.images[u.source];
    let p = c.textureLoader;
    if (B.uri) {
      const m = c.options.manager.getHandler(B.uri);
      m !== null && (p = m);
    }
    return this.detectSupport().then(function(m) {
      if (m)
        return c.loadTextureImage(s, u.source, p);
      if (l.extensionsRequired && l.extensionsRequired.indexOf(i) >= 0)
        throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
      return c.loadTexture(s);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(s) {
      const i = new Image();
      i.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", i.onload = i.onerror = function() {
        s(i.height === 1);
      };
    })), this.isSupported;
  }
}
class zd {
  constructor(s) {
    this.name = V.EXT_MESHOPT_COMPRESSION, this.parser = s;
  }
  loadBufferView(s) {
    const i = this.parser.json, c = i.bufferViews[s];
    if (c.extensions && c.extensions[this.name]) {
      const l = c.extensions[this.name], d = this.parser.getDependency("buffer", l.buffer), u = this.parser.options.meshoptDecoder;
      if (!u || !u.supported) {
        if (i.extensionsRequired && i.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return d.then(function(B) {
        const p = l.byteOffset || 0, m = l.byteLength || 0, A = l.count, h = l.byteStride, g = new Uint8Array(B, p, m);
        return u.decodeGltfBufferAsync ? u.decodeGltfBufferAsync(A, h, g, l.mode, l.filter).then(function(v) {
          return v.buffer;
        }) : u.ready.then(function() {
          const v = new ArrayBuffer(A * h);
          return u.decodeGltfBuffer(
            new Uint8Array(v),
            A,
            h,
            g,
            l.mode,
            l.filter
          ), v;
        });
      });
    } else
      return null;
  }
}
class Xd {
  constructor(s) {
    this.name = V.EXT_MESH_GPU_INSTANCING, this.parser = s;
  }
  createNodeMesh(s) {
    const i = this.parser.json, c = i.nodes[s];
    if (!c.extensions || !c.extensions[this.name] || c.mesh === void 0)
      return null;
    const l = i.meshes[c.mesh];
    for (const m of l.primitives)
      if (m.mode !== Ze.TRIANGLES && m.mode !== Ze.TRIANGLE_STRIP && m.mode !== Ze.TRIANGLE_FAN && m.mode !== void 0)
        return null;
    const u = c.extensions[this.name].attributes, B = [], p = {};
    for (const m in u)
      B.push(
        this.parser.getDependency("accessor", u[m]).then((A) => (p[m] = A, p[m]))
      );
    return B.length < 1 ? null : (B.push(this.parser.createNodeMesh(s)), Promise.all(B).then((m) => {
      const A = m.pop(), h = A.isGroup ? A.children : [A], g = m[0].count, v = [];
      for (const E of h) {
        const T = new $r(), G = new tt(), M = new Ca(), S = new tt(1, 1, 1), w = new bc(E.geometry, E.material, g);
        for (let x = 0; x < g; x++)
          p.TRANSLATION && G.fromBufferAttribute(p.TRANSLATION, x), p.ROTATION && M.fromBufferAttribute(p.ROTATION, x), p.SCALE && S.fromBufferAttribute(p.SCALE, x), w.setMatrixAt(x, T.compose(G, M, S));
        for (const x in p)
          if (x === "_COLOR_0") {
            const U = p[x];
            w.instanceColor = new $c(U.array, U.itemSize, U.normalized);
          } else x !== "TRANSLATION" && x !== "ROTATION" && x !== "SCALE" && E.geometry.setAttribute(x, p[x]);
        ga.prototype.copy.call(w, E), this.parser.assignFinalMaterial(w), v.push(w);
      }
      return A.isGroup ? (A.clear(), A.add(...v), A) : v[0];
    }));
  }
}
const ja = "glTF", jn = 12, aa = { JSON: 1313821514, BIN: 5130562 };
class Yd {
  constructor(s) {
    this.name = V.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const i = new DataView(s, 0, jn);
    if (this.header = {
      magic: es(new Uint8Array(s.slice(0, 4))),
      version: i.getUint32(4, !0),
      length: i.getUint32(8, !0)
    }, this.header.magic !== ja)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const c = this.header.length - jn, l = new DataView(s, jn);
    let d = 0;
    for (; d < c; ) {
      const u = l.getUint32(d, !0);
      d += 4;
      const B = l.getUint32(d, !0);
      if (d += 4, B === aa.JSON) {
        const p = new Uint8Array(s, jn + d, u);
        this.content = es(p);
      } else if (B === aa.BIN) {
        const p = jn + d;
        this.body = s.slice(p, p + u);
      }
      d += u;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Wd {
  constructor(s, i) {
    if (!i)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = V.KHR_DRACO_MESH_COMPRESSION, this.json = s, this.dracoLoader = i, this.dracoLoader.preload();
  }
  decodePrimitive(s, i) {
    const c = this.json, l = this.dracoLoader, d = s.extensions[this.name].bufferView, u = s.extensions[this.name].attributes, B = {}, p = {}, m = {};
    for (const A in u) {
      const h = _i[A] || A.toLowerCase();
      B[h] = u[A];
    }
    for (const A in s.attributes) {
      const h = _i[A] || A.toLowerCase();
      if (u[A] !== void 0) {
        const g = c.accessors[s.attributes[A]], v = mn[g.componentType];
        m[h] = v.name, p[h] = g.normalized === !0;
      }
    }
    return i.getDependency("bufferView", d).then(function(A) {
      return new Promise(function(h, g) {
        l.decodeDracoFile(
          A,
          function(v) {
            for (const E in v.attributes) {
              const T = v.attributes[E], G = p[E];
              G !== void 0 && (T.normalized = G);
            }
            h(v);
          },
          B,
          m,
          vt,
          g
        );
      });
    });
  }
}
class Zd {
  constructor() {
    this.name = V.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(s, i) {
    return (i.texCoord === void 0 || i.texCoord === s.channel) && i.offset === void 0 && i.rotation === void 0 && i.scale === void 0 || (s = s.clone(), i.texCoord !== void 0 && (s.channel = i.texCoord), i.offset !== void 0 && s.offset.fromArray(i.offset), i.rotation !== void 0 && (s.rotation = i.rotation), i.scale !== void 0 && s.repeat.fromArray(i.scale), s.needsUpdate = !0), s;
  }
}
class Vd {
  constructor() {
    this.name = V.KHR_MESH_QUANTIZATION;
  }
}
class za extends If {
  constructor(s, i, c, l) {
    super(s, i, c, l);
  }
  copySampleValue_(s) {
    const i = this.resultBuffer, c = this.sampleValues, l = this.valueSize, d = s * l * 3 + l;
    for (let u = 0; u !== l; u++)
      i[u] = c[d + u];
    return i;
  }
  interpolate_(s, i, c, l) {
    const d = this.resultBuffer, u = this.sampleValues, B = this.valueSize, p = B * 2, m = B * 3, A = l - i, h = (c - i) / A, g = h * h, v = g * h, E = s * m, T = E - m, G = -2 * v + 3 * g, M = v - g, S = 1 - G, w = M - g + h;
    for (let x = 0; x !== B; x++) {
      const U = u[T + x + B], K = u[T + x + p] * A, X = u[E + x + B], te = u[E + x] * A;
      d[x] = S * U + w * K + G * X + M * te;
    }
    return d;
  }
}
const qd = /* @__PURE__ */ new Ca();
class bd extends za {
  interpolate_(s, i, c, l) {
    const d = super.interpolate_(s, i, c, l);
    return qd.fromArray(d).normalize().toArray(d), d;
  }
}
const Ze = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, mn = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, ua = {
  9728: lf,
  9729: Ea,
  9984: of,
  9985: sf,
  9986: rf,
  9987: va
}, ca = {
  33071: uf,
  33648: af,
  10497: xi
}, Ii = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, _i = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  // uv => uv1, 4 uv channels
  // https://github.com/mrdoob/three.js/pull/25943
  // https://github.com/mrdoob/three.js/pull/25788
  ...Sd >= 152 ? {
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3"
  } : {
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv2"
  },
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, Lt = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, $d = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: Ma,
  STEP: Mf
}, Gi = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function eA(f) {
  return f.DefaultMaterial === void 0 && (f.DefaultMaterial = new ya({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: Sf
  })), f.DefaultMaterial;
}
function zt(f, s, i) {
  for (const c in i.extensions)
    f[c] === void 0 && (s.userData.gltfExtensions = s.userData.gltfExtensions || {}, s.userData.gltfExtensions[c] = i.extensions[c]);
}
function gt(f, s) {
  s.extras !== void 0 && (typeof s.extras == "object" ? Object.assign(f.userData, s.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + s.extras));
}
function tA(f, s, i) {
  let c = !1, l = !1, d = !1;
  for (let m = 0, A = s.length; m < A; m++) {
    const h = s[m];
    if (h.POSITION !== void 0 && (c = !0), h.NORMAL !== void 0 && (l = !0), h.COLOR_0 !== void 0 && (d = !0), c && l && d)
      break;
  }
  if (!c && !l && !d)
    return Promise.resolve(f);
  const u = [], B = [], p = [];
  for (let m = 0, A = s.length; m < A; m++) {
    const h = s[m];
    if (c) {
      const g = h.POSITION !== void 0 ? i.getDependency("accessor", h.POSITION) : f.attributes.position;
      u.push(g);
    }
    if (l) {
      const g = h.NORMAL !== void 0 ? i.getDependency("accessor", h.NORMAL) : f.attributes.normal;
      B.push(g);
    }
    if (d) {
      const g = h.COLOR_0 !== void 0 ? i.getDependency("accessor", h.COLOR_0) : f.attributes.color;
      p.push(g);
    }
  }
  return Promise.all([
    Promise.all(u),
    Promise.all(B),
    Promise.all(p)
  ]).then(function(m) {
    const A = m[0], h = m[1], g = m[2];
    return c && (f.morphAttributes.position = A), l && (f.morphAttributes.normal = h), d && (f.morphAttributes.color = g), f.morphTargetsRelative = !0, f;
  });
}
function nA(f, s) {
  if (f.updateMorphTargets(), s.weights !== void 0)
    for (let i = 0, c = s.weights.length; i < c; i++)
      f.morphTargetInfluences[i] = s.weights[i];
  if (s.extras && Array.isArray(s.extras.targetNames)) {
    const i = s.extras.targetNames;
    if (f.morphTargetInfluences.length === i.length) {
      f.morphTargetDictionary = {};
      for (let c = 0, l = i.length; c < l; c++)
        f.morphTargetDictionary[i[c]] = c;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function rA(f) {
  let s;
  const i = f.extensions && f.extensions[V.KHR_DRACO_MESH_COMPRESSION];
  if (i ? s = "draco:" + i.bufferView + ":" + i.indices + ":" + Di(i.attributes) : s = f.indices + ":" + Di(f.attributes) + ":" + f.mode, f.targets !== void 0)
    for (let c = 0, l = f.targets.length; c < l; c++)
      s += ":" + Di(f.targets[c]);
  return s;
}
function Di(f) {
  let s = "";
  const i = Object.keys(f).sort();
  for (let c = 0, l = i.length; c < l; c++)
    s += i[c] + ":" + f[i[c]] + ";";
  return s;
}
function Ji(f) {
  switch (f) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function sA(f) {
  return f.search(/\.jpe?g($|\?)/i) > 0 || f.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : f.search(/\.webp($|\?)/i) > 0 || f.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const iA = /* @__PURE__ */ new $r();
class oA {
  constructor(s = {}, i = {}) {
    this.json = s, this.extensions = {}, this.plugins = {}, this.options = i, this.cache = new Gd(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let c = !1, l = !1, d = -1;
    typeof navigator < "u" && typeof navigator.userAgent < "u" && (c = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === !0, l = navigator.userAgent.indexOf("Firefox") > -1, d = l ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1), typeof createImageBitmap > "u" || c || l && d < 98 ? this.textureLoader = new ef(this.options.manager) : this.textureLoader = new tf(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new br(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(s) {
    this.extensions = s;
  }
  setPlugins(s) {
    this.plugins = s;
  }
  parse(s, i) {
    const c = this, l = this.json, d = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(u) {
      return u._markDefs && u._markDefs();
    }), Promise.all(
      this._invokeAll(function(u) {
        return u.beforeRoot && u.beforeRoot();
      })
    ).then(function() {
      return Promise.all([
        c.getDependencies("scene"),
        c.getDependencies("animation"),
        c.getDependencies("camera")
      ]);
    }).then(function(u) {
      const B = {
        scene: u[0][l.scene || 0],
        scenes: u[0],
        animations: u[1],
        cameras: u[2],
        asset: l.asset,
        parser: c,
        userData: {}
      };
      return zt(d, B, l), gt(B, l), Promise.all(
        c._invokeAll(function(p) {
          return p.afterRoot && p.afterRoot(B);
        })
      ).then(function() {
        for (const p of B.scenes)
          p.updateMatrixWorld();
        s(B);
      });
    }).catch(i);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const s = this.json.nodes || [], i = this.json.skins || [], c = this.json.meshes || [];
    for (let l = 0, d = i.length; l < d; l++) {
      const u = i[l].joints;
      for (let B = 0, p = u.length; B < p; B++)
        s[u[B]].isBone = !0;
    }
    for (let l = 0, d = s.length; l < d; l++) {
      const u = s[l];
      u.mesh !== void 0 && (this._addNodeRef(this.meshCache, u.mesh), u.skin !== void 0 && (c[u.mesh].isSkinnedMesh = !0)), u.camera !== void 0 && this._addNodeRef(this.cameraCache, u.camera);
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(s, i) {
    i !== void 0 && (s.refs[i] === void 0 && (s.refs[i] = s.uses[i] = 0), s.refs[i]++);
  }
  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(s, i, c) {
    if (s.refs[i] <= 1)
      return c;
    const l = c.clone(), d = (u, B) => {
      const p = this.associations.get(u);
      p != null && this.associations.set(B, p);
      for (const [m, A] of u.children.entries())
        d(A, B.children[m]);
    };
    return d(c, l), l.name += "_instance_" + s.uses[i]++, l;
  }
  _invokeOne(s) {
    const i = Object.values(this.plugins);
    i.push(this);
    for (let c = 0; c < i.length; c++) {
      const l = s(i[c]);
      if (l)
        return l;
    }
    return null;
  }
  _invokeAll(s) {
    const i = Object.values(this.plugins);
    i.unshift(this);
    const c = [];
    for (let l = 0; l < i.length; l++) {
      const d = s(i[l]);
      d && c.push(d);
    }
    return c;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(s, i) {
    const c = s + ":" + i;
    let l = this.cache.get(c);
    if (!l) {
      switch (s) {
        case "scene":
          l = this.loadScene(i);
          break;
        case "node":
          l = this._invokeOne(function(d) {
            return d.loadNode && d.loadNode(i);
          });
          break;
        case "mesh":
          l = this._invokeOne(function(d) {
            return d.loadMesh && d.loadMesh(i);
          });
          break;
        case "accessor":
          l = this.loadAccessor(i);
          break;
        case "bufferView":
          l = this._invokeOne(function(d) {
            return d.loadBufferView && d.loadBufferView(i);
          });
          break;
        case "buffer":
          l = this.loadBuffer(i);
          break;
        case "material":
          l = this._invokeOne(function(d) {
            return d.loadMaterial && d.loadMaterial(i);
          });
          break;
        case "texture":
          l = this._invokeOne(function(d) {
            return d.loadTexture && d.loadTexture(i);
          });
          break;
        case "skin":
          l = this.loadSkin(i);
          break;
        case "animation":
          l = this._invokeOne(function(d) {
            return d.loadAnimation && d.loadAnimation(i);
          });
          break;
        case "camera":
          l = this.loadCamera(i);
          break;
        default:
          if (l = this._invokeOne(function(d) {
            return d != this && d.getDependency && d.getDependency(s, i);
          }), !l)
            throw new Error("Unknown type: " + s);
          break;
      }
      this.cache.add(c, l);
    }
    return l;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(s) {
    let i = this.cache.get(s);
    if (!i) {
      const c = this, l = this.json[s + (s === "mesh" ? "es" : "s")] || [];
      i = Promise.all(
        l.map(function(d, u) {
          return c.getDependency(s, u);
        })
      ), this.cache.add(s, i);
    }
    return i;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(s) {
    const i = this.json.buffers[s], c = this.fileLoader;
    if (i.type && i.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + i.type + " buffer type is not supported.");
    if (i.uri === void 0 && s === 0)
      return Promise.resolve(this.extensions[V.KHR_BINARY_GLTF].body);
    const l = this.options;
    return new Promise(function(d, u) {
      c.load(Xn.resolveURL(i.uri, l.path), d, void 0, function() {
        u(new Error('THREE.GLTFLoader: Failed to load buffer "' + i.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(s) {
    const i = this.json.bufferViews[s];
    return this.getDependency("buffer", i.buffer).then(function(c) {
      const l = i.byteLength || 0, d = i.byteOffset || 0;
      return c.slice(d, d + l);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(s) {
    const i = this, c = this.json, l = this.json.accessors[s];
    if (l.bufferView === void 0 && l.sparse === void 0) {
      const u = Ii[l.type], B = mn[l.componentType], p = l.normalized === !0, m = new B(l.count * u);
      return Promise.resolve(new Yn(m, u, p));
    }
    const d = [];
    return l.bufferView !== void 0 ? d.push(this.getDependency("bufferView", l.bufferView)) : d.push(null), l.sparse !== void 0 && (d.push(this.getDependency("bufferView", l.sparse.indices.bufferView)), d.push(this.getDependency("bufferView", l.sparse.values.bufferView))), Promise.all(d).then(function(u) {
      const B = u[0], p = Ii[l.type], m = mn[l.componentType], A = m.BYTES_PER_ELEMENT, h = A * p, g = l.byteOffset || 0, v = l.bufferView !== void 0 ? c.bufferViews[l.bufferView].byteStride : void 0, E = l.normalized === !0;
      let T, G;
      if (v && v !== h) {
        const M = Math.floor(g / v), S = "InterleavedBuffer:" + l.bufferView + ":" + l.componentType + ":" + M + ":" + l.count;
        let w = i.cache.get(S);
        w || (T = new m(B, M * v, l.count * v / A), w = new nf(T, v / A), i.cache.add(S, w)), G = new Rf(
          w,
          p,
          g % v / A,
          E
        );
      } else
        B === null ? T = new m(l.count * p) : T = new m(B, g, l.count * p), G = new Yn(T, p, E);
      if (l.sparse !== void 0) {
        const M = Ii.SCALAR, S = mn[l.sparse.indices.componentType], w = l.sparse.indices.byteOffset || 0, x = l.sparse.values.byteOffset || 0, U = new S(
          u[1],
          w,
          l.sparse.count * M
        ), K = new m(u[2], x, l.sparse.count * p);
        B !== null && (G = new Yn(
          G.array.slice(),
          G.itemSize,
          G.normalized
        ));
        for (let X = 0, te = U.length; X < te; X++) {
          const Z = U[X];
          if (G.setX(Z, K[X * p]), p >= 2 && G.setY(Z, K[X * p + 1]), p >= 3 && G.setZ(Z, K[X * p + 2]), p >= 4 && G.setW(Z, K[X * p + 3]), p >= 5)
            throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
      }
      return G;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(s) {
    const i = this.json, c = this.options, d = i.textures[s].source, u = i.images[d];
    let B = this.textureLoader;
    if (u.uri) {
      const p = c.manager.getHandler(u.uri);
      p !== null && (B = p);
    }
    return this.loadTextureImage(s, d, B);
  }
  loadTextureImage(s, i, c) {
    const l = this, d = this.json, u = d.textures[s], B = d.images[i], p = (B.uri || B.bufferView) + ":" + u.sampler;
    if (this.textureCache[p])
      return this.textureCache[p];
    const m = this.loadImageSource(i, c).then(function(A) {
      A.flipY = !1, A.name = u.name || B.name || "", A.name === "" && typeof B.uri == "string" && B.uri.startsWith("data:image/") === !1 && (A.name = B.uri);
      const g = (d.samplers || {})[u.sampler] || {};
      return A.magFilter = ua[g.magFilter] || Ea, A.minFilter = ua[g.minFilter] || va, A.wrapS = ca[g.wrapS] || xi, A.wrapT = ca[g.wrapT] || xi, l.associations.set(A, { textures: s }), A;
    }).catch(function() {
      return null;
    });
    return this.textureCache[p] = m, m;
  }
  loadImageSource(s, i) {
    const c = this, l = this.json, d = this.options;
    if (this.sourceCache[s] !== void 0)
      return this.sourceCache[s].then((h) => h.clone());
    const u = l.images[s], B = self.URL || self.webkitURL;
    let p = u.uri || "", m = !1;
    if (u.bufferView !== void 0)
      p = c.getDependency("bufferView", u.bufferView).then(function(h) {
        m = !0;
        const g = new Blob([h], { type: u.mimeType });
        return p = B.createObjectURL(g), p;
      });
    else if (u.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + s + " is missing URI and bufferView");
    const A = Promise.resolve(p).then(function(h) {
      return new Promise(function(g, v) {
        let E = g;
        i.isImageBitmapLoader === !0 && (E = function(T) {
          const G = new Pl(T);
          G.needsUpdate = !0, g(G);
        }), i.load(Xn.resolveURL(h, d.path), E, void 0, v);
      });
    }).then(function(h) {
      return m === !0 && B.revokeObjectURL(p), gt(h, u), h.userData.mimeType = u.mimeType || sA(u.uri), h;
    }).catch(function(h) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", p), h;
    });
    return this.sourceCache[s] = A, A;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(s, i, c, l) {
    const d = this;
    return this.getDependency("texture", c.index).then(function(u) {
      if (!u)
        return null;
      if (c.texCoord !== void 0 && c.texCoord > 0 && (u = u.clone(), u.channel = c.texCoord), d.extensions[V.KHR_TEXTURE_TRANSFORM]) {
        const B = c.extensions !== void 0 ? c.extensions[V.KHR_TEXTURE_TRANSFORM] : void 0;
        if (B) {
          const p = d.associations.get(u);
          u = d.extensions[V.KHR_TEXTURE_TRANSFORM].extendTexture(u, B), d.associations.set(u, p);
        }
      }
      return l !== void 0 && (typeof l == "number" && (l = l === la ? Yt : vt), "colorSpace" in u ? u.colorSpace = l : u.encoding = l === Yt ? la : Id), s[i] = u, u;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(s) {
    const i = s.geometry;
    let c = s.material;
    const l = i.attributes.tangent === void 0, d = i.attributes.color !== void 0, u = i.attributes.normal === void 0;
    if (s.isPoints) {
      const B = "PointsMaterial:" + c.uuid;
      let p = this.cache.get(B);
      p || (p = new cf(), pi.prototype.copy.call(p, c), p.color.copy(c.color), p.map = c.map, p.sizeAttenuation = !1, this.cache.add(B, p)), c = p;
    } else if (s.isLine) {
      const B = "LineBasicMaterial:" + c.uuid;
      let p = this.cache.get(B);
      p || (p = new ff(), pi.prototype.copy.call(p, c), p.color.copy(c.color), p.map = c.map, this.cache.add(B, p)), c = p;
    }
    if (l || d || u) {
      let B = "ClonedMaterial:" + c.uuid + ":";
      l && (B += "derivative-tangents:"), d && (B += "vertex-colors:"), u && (B += "flat-shading:");
      let p = this.cache.get(B);
      p || (p = c.clone(), d && (p.vertexColors = !0), u && (p.flatShading = !0), l && (p.normalScale && (p.normalScale.y *= -1), p.clearcoatNormalScale && (p.clearcoatNormalScale.y *= -1)), this.cache.add(B, p), this.associations.set(p, this.associations.get(c))), c = p;
    }
    s.material = c;
  }
  getMaterialType() {
    return ya;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(s) {
    const i = this, c = this.json, l = this.extensions, d = c.materials[s];
    let u;
    const B = {}, p = d.extensions || {}, m = [];
    if (p[V.KHR_MATERIALS_UNLIT]) {
      const h = l[V.KHR_MATERIALS_UNLIT];
      u = h.getMaterialType(), m.push(h.extendParams(B, d, i));
    } else {
      const h = d.pbrMetallicRoughness || {};
      if (B.color = new Wt(1, 1, 1), B.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const g = h.baseColorFactor;
        B.color.setRGB(g[0], g[1], g[2], vt), B.opacity = g[3];
      }
      h.baseColorTexture !== void 0 && m.push(i.assignTexture(B, "map", h.baseColorTexture, Yt)), B.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, B.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (m.push(i.assignTexture(B, "metalnessMap", h.metallicRoughnessTexture)), m.push(i.assignTexture(B, "roughnessMap", h.metallicRoughnessTexture))), u = this._invokeOne(function(g) {
        return g.getMaterialType && g.getMaterialType(s);
      }), m.push(
        Promise.all(
          this._invokeAll(function(g) {
            return g.extendMaterialParams && g.extendMaterialParams(s, B);
          })
        )
      );
    }
    d.doubleSided === !0 && (B.side = df);
    const A = d.alphaMode || Gi.OPAQUE;
    if (A === Gi.BLEND ? (B.transparent = !0, B.depthWrite = !1) : (B.transparent = !1, A === Gi.MASK && (B.alphaTest = d.alphaCutoff !== void 0 ? d.alphaCutoff : 0.5)), d.normalTexture !== void 0 && u !== zn && (m.push(i.assignTexture(B, "normalMap", d.normalTexture)), B.normalScale = new ts(1, 1), d.normalTexture.scale !== void 0)) {
      const h = d.normalTexture.scale;
      B.normalScale.set(h, h);
    }
    if (d.occlusionTexture !== void 0 && u !== zn && (m.push(i.assignTexture(B, "aoMap", d.occlusionTexture)), d.occlusionTexture.strength !== void 0 && (B.aoMapIntensity = d.occlusionTexture.strength)), d.emissiveFactor !== void 0 && u !== zn) {
      const h = d.emissiveFactor;
      B.emissive = new Wt().setRGB(
        h[0],
        h[1],
        h[2],
        vt
      );
    }
    return d.emissiveTexture !== void 0 && u !== zn && m.push(i.assignTexture(B, "emissiveMap", d.emissiveTexture, Yt)), Promise.all(m).then(function() {
      const h = new u(B);
      return d.name && (h.name = d.name), gt(h, d), i.associations.set(h, { materials: s }), d.extensions && zt(l, h, d), h;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(s) {
    const i = Af.sanitizeNodeName(s || "");
    return i in this.nodeNamesUsed ? i + "_" + ++this.nodeNamesUsed[i] : (this.nodeNamesUsed[i] = 0, i);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(s) {
    const i = this, c = this.extensions, l = this.primitiveCache;
    function d(B) {
      return c[V.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(B, i).then(function(p) {
        return fa(p, B, i);
      });
    }
    const u = [];
    for (let B = 0, p = s.length; B < p; B++) {
      const m = s[B], A = rA(m), h = l[A];
      if (h)
        u.push(h.promise);
      else {
        let g;
        m.extensions && m.extensions[V.KHR_DRACO_MESH_COMPRESSION] ? g = d(m) : g = fa(new Fa(), m, i), l[A] = { primitive: m, promise: g }, u.push(g);
      }
    }
    return Promise.all(u);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(s) {
    const i = this, c = this.json, l = this.extensions, d = c.meshes[s], u = d.primitives, B = [];
    for (let p = 0, m = u.length; p < m; p++) {
      const A = u[p].material === void 0 ? eA(this.cache) : this.getDependency("material", u[p].material);
      B.push(A);
    }
    return B.push(i.loadGeometries(u)), Promise.all(B).then(function(p) {
      const m = p.slice(0, p.length - 1), A = p[p.length - 1], h = [];
      for (let v = 0, E = A.length; v < E; v++) {
        const T = A[v], G = u[v];
        let M;
        const S = m[v];
        if (G.mode === Ze.TRIANGLES || G.mode === Ze.TRIANGLE_STRIP || G.mode === Ze.TRIANGLE_FAN || G.mode === void 0)
          M = d.isSkinnedMesh === !0 ? new pf(T, S) : new hf(T, S), M.isSkinnedMesh === !0 && M.normalizeSkinWeights(), G.mode === Ze.TRIANGLE_STRIP ? M.geometry = oa(M.geometry, Ba) : G.mode === Ze.TRIANGLE_FAN && (M.geometry = oa(M.geometry, Hi));
        else if (G.mode === Ze.LINES)
          M = new Bf(T, S);
        else if (G.mode === Ze.LINE_STRIP)
          M = new mf(T, S);
        else if (G.mode === Ze.LINE_LOOP)
          M = new Cf(T, S);
        else if (G.mode === Ze.POINTS)
          M = new gf(T, S);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + G.mode);
        Object.keys(M.geometry.morphAttributes).length > 0 && nA(M, d), M.name = i.createUniqueName(d.name || "mesh_" + s), gt(M, d), G.extensions && zt(l, M, G), i.assignFinalMaterial(M), h.push(M);
      }
      for (let v = 0, E = h.length; v < E; v++)
        i.associations.set(h[v], {
          meshes: s,
          primitives: v
        });
      if (h.length === 1)
        return d.extensions && zt(l, h[0], d), h[0];
      const g = new hi();
      d.extensions && zt(l, g, d), i.associations.set(g, { meshes: s });
      for (let v = 0, E = h.length; v < E; v++)
        g.add(h[v]);
      return g;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(s) {
    let i;
    const c = this.json.cameras[s], l = c[c.type];
    if (!l) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return c.type === "perspective" ? i = new ha(
      vf.radToDeg(l.yfov),
      l.aspectRatio || 1,
      l.znear || 1,
      l.zfar || 2e6
    ) : c.type === "orthographic" && (i = new pa(-l.xmag, l.xmag, l.ymag, -l.ymag, l.znear, l.zfar)), c.name && (i.name = this.createUniqueName(c.name)), gt(i, c), Promise.resolve(i);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(s) {
    const i = this.json.skins[s], c = [];
    for (let l = 0, d = i.joints.length; l < d; l++)
      c.push(this._loadNodeShallow(i.joints[l]));
    return i.inverseBindMatrices !== void 0 ? c.push(this.getDependency("accessor", i.inverseBindMatrices)) : c.push(null), Promise.all(c).then(function(l) {
      const d = l.pop(), u = l, B = [], p = [];
      for (let m = 0, A = u.length; m < A; m++) {
        const h = u[m];
        if (h) {
          B.push(h);
          const g = new $r();
          d !== null && g.fromArray(d.array, m * 16), p.push(g);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', i.joints[m]);
      }
      return new Ef(B, p);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(s) {
    const i = this.json, c = this, l = i.animations[s], d = l.name ? l.name : "animation_" + s, u = [], B = [], p = [], m = [], A = [];
    for (let h = 0, g = l.channels.length; h < g; h++) {
      const v = l.channels[h], E = l.samplers[v.sampler], T = v.target, G = T.node, M = l.parameters !== void 0 ? l.parameters[E.input] : E.input, S = l.parameters !== void 0 ? l.parameters[E.output] : E.output;
      T.node !== void 0 && (u.push(this.getDependency("node", G)), B.push(this.getDependency("accessor", M)), p.push(this.getDependency("accessor", S)), m.push(E), A.push(T));
    }
    return Promise.all([
      Promise.all(u),
      Promise.all(B),
      Promise.all(p),
      Promise.all(m),
      Promise.all(A)
    ]).then(function(h) {
      const g = h[0], v = h[1], E = h[2], T = h[3], G = h[4], M = [];
      for (let S = 0, w = g.length; S < w; S++) {
        const x = g[S], U = v[S], K = E[S], X = T[S], te = G[S];
        if (x === void 0)
          continue;
        x.updateMatrix && x.updateMatrix();
        const Z = c._createAnimationTracks(x, U, K, X, te);
        if (Z)
          for (let q = 0; q < Z.length; q++)
            M.push(Z[q]);
      }
      return new yf(d, void 0, M);
    });
  }
  createNodeMesh(s) {
    const i = this.json, c = this, l = i.nodes[s];
    return l.mesh === void 0 ? null : c.getDependency("mesh", l.mesh).then(function(d) {
      const u = c._getNodeRef(c.meshCache, l.mesh, d);
      return l.weights !== void 0 && u.traverse(function(B) {
        if (B.isMesh)
          for (let p = 0, m = l.weights.length; p < m; p++)
            B.morphTargetInfluences[p] = l.weights[p];
      }), u;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(s) {
    const i = this.json, c = this, l = i.nodes[s], d = c._loadNodeShallow(s), u = [], B = l.children || [];
    for (let m = 0, A = B.length; m < A; m++)
      u.push(c.getDependency("node", B[m]));
    const p = l.skin === void 0 ? Promise.resolve(null) : c.getDependency("skin", l.skin);
    return Promise.all([d, Promise.all(u), p]).then(function(m) {
      const A = m[0], h = m[1], g = m[2];
      g !== null && A.traverse(function(v) {
        v.isSkinnedMesh && v.bind(g, iA);
      });
      for (let v = 0, E = h.length; v < E; v++)
        A.add(h[v]);
      return A;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(s) {
    const i = this.json, c = this.extensions, l = this;
    if (this.nodeCache[s] !== void 0)
      return this.nodeCache[s];
    const d = i.nodes[s], u = d.name ? l.createUniqueName(d.name) : "", B = [], p = l._invokeOne(function(m) {
      return m.createNodeMesh && m.createNodeMesh(s);
    });
    return p && B.push(p), d.camera !== void 0 && B.push(
      l.getDependency("camera", d.camera).then(function(m) {
        return l._getNodeRef(l.cameraCache, d.camera, m);
      })
    ), l._invokeAll(function(m) {
      return m.createNodeAttachment && m.createNodeAttachment(s);
    }).forEach(function(m) {
      B.push(m);
    }), this.nodeCache[s] = Promise.all(B).then(function(m) {
      let A;
      if (d.isBone === !0 ? A = new Ff() : m.length > 1 ? A = new hi() : m.length === 1 ? A = m[0] : A = new ga(), A !== m[0])
        for (let h = 0, g = m.length; h < g; h++)
          A.add(m[h]);
      if (d.name && (A.userData.name = d.name, A.name = u), gt(A, d), d.extensions && zt(c, A, d), d.matrix !== void 0) {
        const h = new $r();
        h.fromArray(d.matrix), A.applyMatrix4(h);
      } else
        d.translation !== void 0 && A.position.fromArray(d.translation), d.rotation !== void 0 && A.quaternion.fromArray(d.rotation), d.scale !== void 0 && A.scale.fromArray(d.scale);
      return l.associations.has(A) || l.associations.set(A, {}), l.associations.get(A).nodes = s, A;
    }), this.nodeCache[s];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(s) {
    const i = this.extensions, c = this.json.scenes[s], l = this, d = new hi();
    c.name && (d.name = l.createUniqueName(c.name)), gt(d, c), c.extensions && zt(i, d, c);
    const u = c.nodes || [], B = [];
    for (let p = 0, m = u.length; p < m; p++)
      B.push(l.getDependency("node", u[p]));
    return Promise.all(B).then(function(p) {
      for (let A = 0, h = p.length; A < h; A++)
        d.add(p[A]);
      const m = (A) => {
        const h = /* @__PURE__ */ new Map();
        for (const [g, v] of l.associations)
          (g instanceof pi || g instanceof Pl) && h.set(g, v);
        return A.traverse((g) => {
          const v = l.associations.get(g);
          v != null && h.set(g, v);
        }), h;
      };
      return l.associations = m(d), d;
    });
  }
  _createAnimationTracks(s, i, c, l, d) {
    const u = [], B = s.name ? s.name : s.uuid, p = [];
    Lt[d.path] === Lt.weights ? s.traverse(function(g) {
      g.morphTargetInfluences && p.push(g.name ? g.name : g.uuid);
    }) : p.push(B);
    let m;
    switch (Lt[d.path]) {
      case Lt.weights:
        m = Jl;
        break;
      case Lt.rotation:
        m = Ol;
        break;
      case Lt.position:
      case Lt.scale:
        m = _l;
        break;
      default:
        c.itemSize === 1 ? m = Jl : m = _l;
        break;
    }
    const A = l.interpolation !== void 0 ? $d[l.interpolation] : Ma, h = this._getArrayFromAccessor(c);
    for (let g = 0, v = p.length; g < v; g++) {
      const E = new m(
        p[g] + "." + Lt[d.path],
        i.array,
        h,
        A
      );
      l.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(E), u.push(E);
    }
    return u;
  }
  _getArrayFromAccessor(s) {
    let i = s.array;
    if (s.normalized) {
      const c = Ji(i.constructor), l = new Float32Array(i.length);
      for (let d = 0, u = i.length; d < u; d++)
        l[d] = i[d] * c;
      i = l;
    }
    return i;
  }
  _createCubicSplineTrackInterpolant(s) {
    s.createInterpolant = function(c) {
      const l = this instanceof Ol ? bd : za;
      return new l(this.times, this.values, this.getValueSize() / 3, c);
    }, s.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function lA(f, s, i) {
  const c = s.attributes, l = new Gf();
  if (c.POSITION !== void 0) {
    const B = i.json.accessors[c.POSITION], p = B.min, m = B.max;
    if (p !== void 0 && m !== void 0) {
      if (l.set(new tt(p[0], p[1], p[2]), new tt(m[0], m[1], m[2])), B.normalized) {
        const A = Ji(mn[B.componentType]);
        l.min.multiplyScalar(A), l.max.multiplyScalar(A);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const d = s.targets;
  if (d !== void 0) {
    const B = new tt(), p = new tt();
    for (let m = 0, A = d.length; m < A; m++) {
      const h = d[m];
      if (h.POSITION !== void 0) {
        const g = i.json.accessors[h.POSITION], v = g.min, E = g.max;
        if (v !== void 0 && E !== void 0) {
          if (p.setX(Math.max(Math.abs(v[0]), Math.abs(E[0]))), p.setY(Math.max(Math.abs(v[1]), Math.abs(E[1]))), p.setZ(Math.max(Math.abs(v[2]), Math.abs(E[2]))), g.normalized) {
            const T = Ji(mn[g.componentType]);
            p.multiplyScalar(T);
          }
          B.max(p);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    l.expandByVector(B);
  }
  f.boundingBox = l;
  const u = new Df();
  l.getCenter(u.center), u.radius = l.min.distanceTo(l.max) / 2, f.boundingSphere = u;
}
function fa(f, s, i) {
  const c = s.attributes, l = [];
  function d(u, B) {
    return i.getDependency("accessor", u).then(function(p) {
      f.setAttribute(B, p);
    });
  }
  for (const u in c) {
    const B = _i[u] || u.toLowerCase();
    B in f.attributes || l.push(d(c[u], B));
  }
  if (s.indices !== void 0 && !f.index) {
    const u = i.getDependency("accessor", s.indices).then(function(B) {
      f.setIndex(B);
    });
    l.push(u);
  }
  return gt(f, s), lA(f, s, i), Promise.all(l).then(function() {
    return s.targets !== void 0 ? tA(f, s.targets, i) : f;
  });
}
const Ti = /* @__PURE__ */ new WeakMap();
class aA extends ma {
  constructor(s) {
    super(s), this.decoderPath = "", this.decoderConfig = {}, this.decoderBinary = null, this.decoderPending = null, this.workerLimit = 4, this.workerPool = [], this.workerNextTaskID = 1, this.workerSourceURL = "", this.defaultAttributeIDs = {
      position: "POSITION",
      normal: "NORMAL",
      color: "COLOR",
      uv: "TEX_COORD"
    }, this.defaultAttributeTypes = {
      position: "Float32Array",
      normal: "Float32Array",
      color: "Float32Array",
      uv: "Float32Array"
    };
  }
  setDecoderPath(s) {
    return this.decoderPath = s, this;
  }
  setDecoderConfig(s) {
    return this.decoderConfig = s, this;
  }
  setWorkerLimit(s) {
    return this.workerLimit = s, this;
  }
  load(s, i, c, l) {
    const d = new br(this.manager);
    d.setPath(this.path), d.setResponseType("arraybuffer"), d.setRequestHeader(this.requestHeader), d.setWithCredentials(this.withCredentials), d.load(
      s,
      (u) => {
        const B = {
          attributeIDs: this.defaultAttributeIDs,
          attributeTypes: this.defaultAttributeTypes,
          useUniqueIDs: !1
        };
        this.decodeGeometry(u, B).then(i).catch(l);
      },
      c,
      l
    );
  }
  /** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
  decodeDracoFile(s, i, c, l) {
    const d = {
      attributeIDs: c || this.defaultAttributeIDs,
      attributeTypes: l || this.defaultAttributeTypes,
      useUniqueIDs: !!c
    };
    this.decodeGeometry(s, d).then(i);
  }
  decodeGeometry(s, i) {
    for (const p in i.attributeTypes) {
      const m = i.attributeTypes[p];
      m.BYTES_PER_ELEMENT !== void 0 && (i.attributeTypes[p] = m.name);
    }
    const c = JSON.stringify(i);
    if (Ti.has(s)) {
      const p = Ti.get(s);
      if (p.key === c)
        return p.promise;
      if (s.byteLength === 0)
        throw new Error(
          "THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred."
        );
    }
    let l;
    const d = this.workerNextTaskID++, u = s.byteLength, B = this._getWorker(d, u).then((p) => (l = p, new Promise((m, A) => {
      l._callbacks[d] = { resolve: m, reject: A }, l.postMessage({ type: "decode", id: d, taskConfig: i, buffer: s }, [s]);
    }))).then((p) => this._createGeometry(p.geometry));
    return B.catch(() => !0).then(() => {
      l && d && this._releaseTask(l, d);
    }), Ti.set(s, {
      key: c,
      promise: B
    }), B;
  }
  _createGeometry(s) {
    const i = new Fa();
    s.index && i.setIndex(new Yn(s.index.array, 1));
    for (let c = 0; c < s.attributes.length; c++) {
      const l = s.attributes[c], d = l.name, u = l.array, B = l.itemSize;
      i.setAttribute(d, new Yn(u, B));
    }
    return i;
  }
  _loadLibrary(s, i) {
    const c = new br(this.manager);
    return c.setPath(this.decoderPath), c.setResponseType(i), c.setWithCredentials(this.withCredentials), new Promise((l, d) => {
      c.load(s, l, void 0, d);
    });
  }
  preload() {
    return this._initDecoder(), this;
  }
  _initDecoder() {
    if (this.decoderPending)
      return this.decoderPending;
    const s = typeof WebAssembly != "object" || this.decoderConfig.type === "js", i = [];
    return s ? i.push(this._loadLibrary("draco_decoder.js", "text")) : (i.push(this._loadLibrary("draco_wasm_wrapper.js", "text")), i.push(this._loadLibrary("draco_decoder.wasm", "arraybuffer"))), this.decoderPending = Promise.all(i).then((c) => {
      const l = c[0];
      s || (this.decoderConfig.wasmBinary = c[1]);
      const d = uA.toString(), u = [
        "/* draco decoder */",
        l,
        "",
        "/* worker */",
        d.substring(d.indexOf("{") + 1, d.lastIndexOf("}"))
      ].join(`
`);
      this.workerSourceURL = URL.createObjectURL(new Blob([u]));
    }), this.decoderPending;
  }
  _getWorker(s, i) {
    return this._initDecoder().then(() => {
      if (this.workerPool.length < this.workerLimit) {
        const l = new Worker(this.workerSourceURL);
        l._callbacks = {}, l._taskCosts = {}, l._taskLoad = 0, l.postMessage({ type: "init", decoderConfig: this.decoderConfig }), l.onmessage = function(d) {
          const u = d.data;
          switch (u.type) {
            case "decode":
              l._callbacks[u.id].resolve(u);
              break;
            case "error":
              l._callbacks[u.id].reject(u);
              break;
            default:
              console.error('THREE.DRACOLoader: Unexpected message, "' + u.type + '"');
          }
        }, this.workerPool.push(l);
      } else
        this.workerPool.sort(function(l, d) {
          return l._taskLoad > d._taskLoad ? -1 : 1;
        });
      const c = this.workerPool[this.workerPool.length - 1];
      return c._taskCosts[s] = i, c._taskLoad += i, c;
    });
  }
  _releaseTask(s, i) {
    s._taskLoad -= s._taskCosts[i], delete s._callbacks[i], delete s._taskCosts[i];
  }
  debug() {
    console.log(
      "Task load: ",
      this.workerPool.map((s) => s._taskLoad)
    );
  }
  dispose() {
    for (let s = 0; s < this.workerPool.length; ++s)
      this.workerPool[s].terminate();
    return this.workerPool.length = 0, this;
  }
}
function uA() {
  let f, s;
  onmessage = function(u) {
    const B = u.data;
    switch (B.type) {
      case "init":
        f = B.decoderConfig, s = new Promise(function(A) {
          f.onModuleLoaded = function(h) {
            A({ draco: h });
          }, DracoDecoderModule(f);
        });
        break;
      case "decode":
        const p = B.buffer, m = B.taskConfig;
        s.then((A) => {
          const h = A.draco, g = new h.Decoder(), v = new h.DecoderBuffer();
          v.Init(new Int8Array(p), p.byteLength);
          try {
            const E = i(h, g, v, m), T = E.attributes.map((G) => G.array.buffer);
            E.index && T.push(E.index.array.buffer), self.postMessage({ type: "decode", id: B.id, geometry: E }, T);
          } catch (E) {
            console.error(E), self.postMessage({ type: "error", id: B.id, error: E.message });
          } finally {
            h.destroy(v), h.destroy(g);
          }
        });
        break;
    }
  };
  function i(u, B, p, m) {
    const A = m.attributeIDs, h = m.attributeTypes;
    let g, v;
    const E = B.GetEncodedGeometryType(p);
    if (E === u.TRIANGULAR_MESH)
      g = new u.Mesh(), v = B.DecodeBufferToMesh(p, g);
    else if (E === u.POINT_CLOUD)
      g = new u.PointCloud(), v = B.DecodeBufferToPointCloud(p, g);
    else
      throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
    if (!v.ok() || g.ptr === 0)
      throw new Error("THREE.DRACOLoader: Decoding failed: " + v.error_msg());
    const T = { index: null, attributes: [] };
    for (const G in A) {
      const M = self[h[G]];
      let S, w;
      if (m.useUniqueIDs)
        w = A[G], S = B.GetAttributeByUniqueId(g, w);
      else {
        if (w = B.GetAttributeId(g, u[A[G]]), w === -1)
          continue;
        S = B.GetAttribute(g, w);
      }
      T.attributes.push(l(u, B, g, G, M, S));
    }
    return E === u.TRIANGULAR_MESH && (T.index = c(u, B, g)), u.destroy(g), T;
  }
  function c(u, B, p) {
    const A = p.num_faces() * 3, h = A * 4, g = u._malloc(h);
    B.GetTrianglesUInt32Array(p, h, g);
    const v = new Uint32Array(u.HEAPF32.buffer, g, A).slice();
    return u._free(g), { array: v, itemSize: 1 };
  }
  function l(u, B, p, m, A, h) {
    const g = h.num_components(), E = p.num_points() * g, T = E * A.BYTES_PER_ELEMENT, G = d(u, A), M = u._malloc(T);
    B.GetAttributeDataArrayForAllPoints(p, h, G, T, M);
    const S = new A(u.HEAPF32.buffer, M, E).slice();
    return u._free(M), {
      name: m,
      array: S,
      itemSize: g
    };
  }
  function d(u, B) {
    switch (B) {
      case Float32Array:
        return u.DT_FLOAT32;
      case Int8Array:
        return u.DT_INT8;
      case Int16Array:
        return u.DT_INT16;
      case Int32Array:
        return u.DT_INT32;
      case Uint8Array:
        return u.DT_UINT8;
      case Uint16Array:
        return u.DT_UINT16;
      case Uint32Array:
        return u.DT_UINT32;
    }
  }
}
let Zr;
const wi = () => {
  if (Zr)
    return Zr;
  const f = "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", s = "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", i = new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    4,
    1,
    96,
    0,
    0,
    3,
    3,
    2,
    0,
    0,
    5,
    3,
    1,
    0,
    1,
    12,
    1,
    0,
    10,
    22,
    2,
    12,
    0,
    65,
    0,
    65,
    0,
    65,
    0,
    252,
    10,
    0,
    0,
    11,
    7,
    0,
    65,
    0,
    253,
    15,
    26,
    11
  ]), c = new Uint8Array([
    32,
    0,
    65,
    253,
    3,
    1,
    2,
    34,
    4,
    106,
    6,
    5,
    11,
    8,
    7,
    20,
    13,
    33,
    12,
    16,
    128,
    9,
    116,
    64,
    19,
    113,
    127,
    15,
    10,
    21,
    22,
    14,
    255,
    66,
    24,
    54,
    136,
    107,
    18,
    23,
    192,
    26,
    114,
    118,
    132,
    17,
    77,
    101,
    130,
    144,
    27,
    87,
    131,
    44,
    45,
    74,
    156,
    154,
    70,
    167
  ]);
  if (typeof WebAssembly != "object")
    return {
      supported: !1
    };
  let l = f;
  WebAssembly.validate(i) && (l = s);
  let d;
  const u = WebAssembly.instantiate(B(l), {}).then((h) => {
    d = h.instance, d.exports.__wasm_call_ctors();
  });
  function B(h) {
    const g = new Uint8Array(h.length);
    for (let E = 0; E < h.length; ++E) {
      const T = h.charCodeAt(E);
      g[E] = T > 96 ? T - 71 : T > 64 ? T - 65 : T > 47 ? T + 4 : T > 46 ? 63 : 62;
    }
    let v = 0;
    for (let E = 0; E < h.length; ++E)
      g[v++] = g[E] < 60 ? c[g[E]] : (g[E] - 60) * 64 + g[++E];
    return g.buffer.slice(0, v);
  }
  function p(h, g, v, E, T, G) {
    const M = d.exports.sbrk, S = v + 3 & -4, w = M(S * E), x = M(T.length), U = new Uint8Array(d.exports.memory.buffer);
    U.set(T, x);
    const K = h(w, v, E, x, T.length);
    if (K === 0 && G && G(w, S, E), g.set(U.subarray(w, w + v * E)), M(w - M(0)), K !== 0)
      throw new Error(`Malformed buffer data: ${K}`);
  }
  const m = {
    // legacy index-based enums for glTF
    0: "",
    1: "meshopt_decodeFilterOct",
    2: "meshopt_decodeFilterQuat",
    3: "meshopt_decodeFilterExp",
    // string-based enums for glTF
    NONE: "",
    OCTAHEDRAL: "meshopt_decodeFilterOct",
    QUATERNION: "meshopt_decodeFilterQuat",
    EXPONENTIAL: "meshopt_decodeFilterExp"
  }, A = {
    // legacy index-based enums for glTF
    0: "meshopt_decodeVertexBuffer",
    1: "meshopt_decodeIndexBuffer",
    2: "meshopt_decodeIndexSequence",
    // string-based enums for glTF
    ATTRIBUTES: "meshopt_decodeVertexBuffer",
    TRIANGLES: "meshopt_decodeIndexBuffer",
    INDICES: "meshopt_decodeIndexSequence"
  };
  return Zr = {
    ready: u,
    supported: !0,
    decodeVertexBuffer(h, g, v, E, T) {
      p(
        d.exports.meshopt_decodeVertexBuffer,
        h,
        g,
        v,
        E,
        d.exports[m[T]]
      );
    },
    decodeIndexBuffer(h, g, v, E) {
      p(d.exports.meshopt_decodeIndexBuffer, h, g, v, E);
    },
    decodeIndexSequence(h, g, v, E) {
      p(d.exports.meshopt_decodeIndexSequence, h, g, v, E);
    },
    decodeGltfBuffer(h, g, v, E, T, G) {
      p(
        d.exports[A[T]],
        h,
        g,
        v,
        E,
        d.exports[m[G]]
      );
    }
  }, Zr;
};
let Vr = null, Xa = "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";
function Ya(f = !0, s = !0, i) {
  return (c) => {
    i && i(c), f && (Vr || (Vr = new aA()), Vr.setDecoderPath(typeof f == "string" ? f : Xa), c.setDRACOLoader(Vr)), s && c.setMeshoptDecoder(typeof wi == "function" ? wi() : wi);
  };
}
const Qi = (f, s, i, c) => Vn(Ki, f, Ya(s, i, c));
Qi.preload = (f, s, i, c) => Vn.preload(Ki, f, Ya(s, i, c));
Qi.clear = (f) => Vn.clear(Ki, f);
Qi.setDecoderPath = (f) => {
  Xa = f;
};
export {
  BA as F,
  dn as a,
  Qi as b,
  hA as c,
  Vn as d,
  Kf as e,
  AA as f,
  Pf as s,
  pA as u,
  Sd as v
};
