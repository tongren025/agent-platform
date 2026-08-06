import { cS as a, aa as B, e6 as q, ci as f, S as L, aL as U } from "./agentStudioMount-S0u8Hm0S.js";
import { f as V, u as H, F as G, b as Q } from "./Gltf-Ud_3OFS2.js";
import { J as W, gn as i, fv as J, e9 as O, d1 as D } from "./scene3dConstants-DlRfsgmW.js";
import "./three.module-DbUzIx2U.js";
import { O as _ } from "./OrbitControls-BOWfXk-9.js";
const K = /* @__PURE__ */ a.forwardRef(function({
  children: g,
  disable: y,
  disableX: M,
  disableY: P,
  disableZ: S,
  left: F,
  right: j,
  top: C,
  bottom: e,
  front: b,
  back: w,
  onCentered: s,
  precise: T = !0,
  cacheKey: R = 0,
  ...t
}, p) {
  const l = a.useRef(null), n = a.useRef(null), z = a.useRef(null);
  return a.useLayoutEffect(() => {
    n.current.matrixWorld.identity();
    const h = new W().setFromObject(z.current, T), u = new i(), r = new J(), o = h.max.x - h.min.x, m = h.max.y - h.min.y, d = h.max.z - h.min.z;
    h.getCenter(u), h.getBoundingSphere(r);
    const v = C ? m / 2 : e ? -m / 2 : 0, A = F ? -o / 2 : j ? o / 2 : 0, N = b ? d / 2 : w ? -d / 2 : 0;
    n.current.position.set(y || M ? 0 : -u.x + A, y || P ? 0 : -u.y + v, y || S ? 0 : -u.z + N), typeof s < "u" && s({
      parent: l.current.parent,
      container: l.current,
      width: o,
      height: m,
      depth: d,
      boundingBox: h,
      boundingSphere: r,
      center: u,
      verticalAlignment: v,
      horizontalAlignment: A,
      depthAlignment: N
    });
  }, [R, s, C, F, b, y, M, P, S, T, j, e, w]), a.useImperativeHandle(p, () => l.current, []), /* @__PURE__ */ a.createElement("group", B({
    ref: l
  }, t), /* @__PURE__ */ a.createElement("group", {
    ref: n
  }, /* @__PURE__ */ a.createElement("group", {
    ref: z
  }, g)));
});
var x = /* @__PURE__ */ (function(c) {
  return c[c.NONE = 0] = "NONE", c[c.START = 1] = "START", c[c.ACTIVE = 2] = "ACTIVE", c;
})(x || {});
const E = (c) => c && c.isOrthographicCamera, $ = (c) => c && c.isBox3, X = (c) => 1 - Math.exp(-5 * c) + 7e-3 * c, Y = /* @__PURE__ */ a.createContext(null);
function ee({
  children: c,
  maxDuration: g = 1,
  margin: y = 1.2,
  observe: M,
  fit: P,
  clip: S,
  interpolateFunc: F = X,
  onFit: j
}) {
  const C = a.useRef(null), {
    camera: e,
    size: b,
    invalidate: w
  } = V(), s = V((u) => u.controls), T = a.useRef(j);
  T.current = j;
  const R = a.useRef({
    camPos: new i(),
    camRot: new O(),
    camZoom: 1
  }), t = a.useRef({
    camPos: void 0,
    camRot: void 0,
    camZoom: void 0,
    camUp: void 0,
    target: void 0
  }), p = a.useRef(x.NONE), l = a.useRef(0), [n] = a.useState(() => new W()), z = a.useMemo(() => {
    function u() {
      const r = n.getSize(new i()), o = n.getCenter(new i()), m = Math.max(r.x, r.y, r.z), d = E(e) ? m * 4 : m / (2 * Math.atan(Math.PI * e.fov / 360)), v = E(e) ? m * 4 : d / e.aspect, A = y * Math.max(d, v);
      return {
        box: n,
        size: r,
        center: o,
        distance: A
      };
    }
    return {
      getSize: u,
      refresh(r) {
        if ($(r)) n.copy(r);
        else {
          const o = r || C.current;
          if (!o) return this;
          o.updateWorldMatrix(!0, !0), n.setFromObject(o);
        }
        if (n.isEmpty()) {
          const o = e.position.length() || 10;
          n.setFromCenterAndSize(new i(), new i(o, o, o));
        }
        return R.current.camPos.copy(e.position), R.current.camRot.copy(e.quaternion), E(e) && (R.current.camZoom = e.zoom), t.current.camPos = void 0, t.current.camRot = void 0, t.current.camZoom = void 0, t.current.camUp = void 0, t.current.target = void 0, this;
      },
      reset() {
        const {
          center: r,
          distance: o
        } = u(), m = e.position.clone().sub(r).normalize();
        t.current.camPos = r.clone().addScaledVector(m, o), t.current.target = r.clone();
        const d = new D().lookAt(t.current.camPos, t.current.target, e.up);
        return t.current.camRot = new O().setFromRotationMatrix(d), p.current = x.START, l.current = 0, this;
      },
      moveTo(r) {
        return t.current.camPos = Array.isArray(r) ? new i(...r) : r.clone(), p.current = x.START, l.current = 0, this;
      },
      lookAt({
        target: r,
        up: o
      }) {
        t.current.target = Array.isArray(r) ? new i(...r) : r.clone(), o ? t.current.camUp = Array.isArray(o) ? new i(...o) : o.clone() : t.current.camUp = e.up.clone();
        const m = new D().lookAt(t.current.camPos || e.position, t.current.target, t.current.camUp);
        return t.current.camRot = new O().setFromRotationMatrix(m), p.current = x.START, l.current = 0, this;
      },
      /**
       * @deprecated Use moveTo and lookAt instead
       */
      to({
        position: r,
        target: o
      }) {
        return this.moveTo(r).lookAt({
          target: o
        });
      },
      fit() {
        if (!E(e))
          return this.reset();
        let r = 0, o = 0;
        const m = [new i(n.min.x, n.min.y, n.min.z), new i(n.min.x, n.max.y, n.min.z), new i(n.min.x, n.min.y, n.max.z), new i(n.min.x, n.max.y, n.max.z), new i(n.max.x, n.max.y, n.max.z), new i(n.max.x, n.max.y, n.min.z), new i(n.max.x, n.min.y, n.max.z), new i(n.max.x, n.min.y, n.min.z)], d = t.current.camPos || e.position, v = t.current.target || s?.target, A = t.current.camUp || e.up, N = v ? new D().lookAt(d, v, A).setPosition(d).invert() : e.matrixWorldInverse;
        for (const k of m)
          k.applyMatrix4(N), r = Math.max(r, Math.abs(k.y)), o = Math.max(o, Math.abs(k.x));
        r *= 2, o *= 2;
        const Z = (e.top - e.bottom) / r, I = (e.right - e.left) / o;
        return t.current.camZoom = Math.min(Z, I) / y, p.current = x.START, l.current = 0, T.current && T.current(this.getSize()), this;
      },
      clip() {
        const {
          distance: r
        } = u();
        return e.near = r / 100, e.far = r * 100, e.updateProjectionMatrix(), s && (s.maxDistance = r * 10, s.update()), w(), this;
      }
    };
  }, [n, e, s, y, w]);
  a.useLayoutEffect(() => {
    if (s) {
      const u = () => {
        if (s && t.current.target && p.current !== x.NONE) {
          const r = new i().setFromMatrixColumn(e.matrix, 2), o = R.current.camPos.distanceTo(s.target), m = (t.current.camPos || R.current.camPos).distanceTo(t.current.target), d = (1 - l.current) * o + l.current * m;
          s.target.copy(e.position).addScaledVector(r, -d), s.update();
        }
        p.current = x.NONE;
      };
      return s.addEventListener("start", u), () => s.removeEventListener("start", u);
    }
  }, [s]);
  const h = a.useRef(0);
  return a.useLayoutEffect(() => {
    (M || h.current++ === 0) && (z.refresh(), P && z.reset().fit(), S && z.clip());
  }, [b, S, P, M, e, s]), H((u, r) => {
    if (p.current === x.START)
      p.current = x.ACTIVE, w();
    else if (p.current === x.ACTIVE) {
      if (l.current += r / g, l.current >= 1)
        t.current.camPos && e.position.copy(t.current.camPos), t.current.camRot && e.quaternion.copy(t.current.camRot), t.current.camUp && e.up.copy(t.current.camUp), t.current.camZoom && E(e) && (e.zoom = t.current.camZoom), e.updateMatrixWorld(), e.updateProjectionMatrix(), s && t.current.target && (s.target.copy(t.current.target), s.update()), p.current = x.NONE;
      else {
        const o = F(l.current);
        t.current.camPos && e.position.lerpVectors(R.current.camPos, t.current.camPos, o), t.current.camRot && e.quaternion.slerpQuaternions(R.current.camRot, t.current.camRot, o), t.current.camUp && e.up.set(0, 1, 0).applyQuaternion(e.quaternion), t.current.camZoom && E(e) && (e.zoom = (1 - o) * R.current.camZoom + o * t.current.camZoom), e.updateMatrixWorld(), e.updateProjectionMatrix();
      }
      w();
    }
  }), /* @__PURE__ */ a.createElement("group", {
    ref: C
  }, /* @__PURE__ */ a.createElement(Y.Provider, {
    value: z
  }, c));
}
function te({ url: c }) {
  const { scene: g } = Q(c), y = L.useMemo(() => g.clone(!0), [g]);
  return /* @__PURE__ */ f.jsx("primitive", { object: y });
}
class re extends L.Component {
  constructor() {
    super(...arguments), this.state = { failed: !1 };
  }
  static getDerivedStateFromError() {
    return { failed: !0 };
  }
  componentDidCatch(g) {
    console.error("Failed to load 3D model glb.", g);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function ie({ url: c }) {
  const { t: g } = q();
  return /* @__PURE__ */ f.jsx("div", { className: U("w-full h-full bg-nomi-ink-05"), children: /* @__PURE__ */ f.jsx(
    re,
    {
      fallback: /* @__PURE__ */ f.jsx("div", { className: U("flex h-full w-full items-center justify-center text-caption text-nomi-ink-40"), children: g("generationCommon.node.model3dLoadFailed") }),
      children: /* @__PURE__ */ f.jsxs(G, { camera: { position: [2.4, 1.8, 3.2], fov: 45 }, dpr: [1, 2], frameloop: "demand", children: [
        /* @__PURE__ */ f.jsx("ambientLight", { intensity: 0.75 }),
        /* @__PURE__ */ f.jsx("directionalLight", { position: [3, 5, 2], intensity: 1.1, castShadow: !0 }),
        /* @__PURE__ */ f.jsx("directionalLight", { position: [-3, 2, -2], intensity: 0.4 }),
        /* @__PURE__ */ f.jsx(L.Suspense, { fallback: null, children: /* @__PURE__ */ f.jsx(ee, { fit: !0, clip: !0, observe: !0, margin: 1.25, children: /* @__PURE__ */ f.jsx(K, { children: /* @__PURE__ */ f.jsx(te, { url: c }) }) }) }),
        /* @__PURE__ */ f.jsx(
          _,
          {
            makeDefault: !0,
            enablePan: !1,
            autoRotate: !0,
            autoRotateSpeed: 1.1,
            minDistance: 1.2,
            maxDistance: 14
          }
        )
      ] })
    }
  ) });
}
export {
  ie as default
};
