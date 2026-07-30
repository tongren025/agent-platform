import { c8 as m, cH as tn, S as g } from "./agentStudioMount-DueN8bR4.js";
import { F as on, f as sn, u as rn } from "./Gltf-dQXGqy4r.js";
import { S as an, a as cn, P as un, o as D, M as ln, b as fn, f as mn } from "./scene3dEnvironment-CqCHuxH9.js";
import { ai as M, k as dn, m as pn, a4 as Y, J as hn, ad as K, o as H, g as gn, q as Tn, P as Rn, ab as vn, e as Cn, Q as j, a7 as z, f as Mn } from "./scene3dSerializer-CA8L6Op6.js";
import { c_ as Q, a5 as X, aB as wn, e8 as Sn, gn as C, g3 as xn, S as Pn, dH as An, dW as En, bD as L } from "./scene3dConstants-DlRfsgmW.js";
const yn = 0.12, $n = 0.15, kn = 64, b = 200;
function k(n) {
  return new C(n[0], n[1], n[2]);
}
function F(n) {
  return n.points.length < 2 ? 0 : n.closed ? n.points.length : n.points.length - 1;
}
function N(n) {
  const e = /* @__PURE__ */ new Set(), s = F(n);
  for (let t = 0; t < s; t += 1)
    e.add(n.points[t]?.id ?? "");
  const o = /* @__PURE__ */ new Map();
  return n.curveControls?.forEach((t) => {
    e.has(t.segmentStartPointId) && o.set(t.segmentStartPointId, k(t.position));
  }), o;
}
function In(n) {
  return N(n).size > 0;
}
function ne(n, e) {
  const s = F(n);
  if (e < 0 || e >= s) return null;
  const o = n.points[e], t = n.points[(e + 1) % n.points.length];
  if (!o || !t) return null;
  const i = N(n).get(o.id);
  return i || k(o.position).lerp(k(t.position), 0.5);
}
function qn(n, e, s) {
  const t = [];
  for (let i = 0; i <= 8; i += 1)
    t.push(n.getPoint((e + i / 8) / s));
  return new X(t, !1, "catmullrom", 0.5);
}
function Z(n) {
  if (n.points.length < 2) return null;
  const e = n.points.map((t) => k(t.position)), s = N(n), o = new X(e, n.closed, "catmullrom", n.tension);
  if (o.updateArcLengths(), s.size > 0) {
    const t = new wn(), i = F(n);
    for (let r = 0; r < i; r += 1) {
      const a = n.points[r], c = e[r], u = e[(r + 1) % e.length], l = a ? s.get(a.id) : void 0;
      t.add(l ? new Sn(c, l, u) : qn(o, r, i));
    }
    return t.updateArcLengths(), t;
  }
  return o;
}
function ee(n) {
  const e = Z(n);
  if (!e) return [];
  const s = e.getPoints(kn);
  if (!In(n) && n.closed && s.length > 1) {
    const o = s.slice(0, -1);
    return [...o, o[0].clone()];
  }
  return s;
}
function On(n) {
  return Math.min(Math.max(64, n * 8), 512);
}
function te(n, e) {
  const s = n.closed === !0;
  return new xn(
    n,
    On(e),
    yn,
    8,
    s
  );
}
function h(n) {
  return Q.clamp(n, 0, 1);
}
function I(n) {
  const e = (n % 1 + 1) % 1;
  return e >= 1 ? 0 : e;
}
function B(n, e, s = !1) {
  return e <= 1 ? 0 : s ? h(n / e) : n / (e - 1);
}
function _n(n, e) {
  const s = n.points[e];
  if (!s || e <= 0) return 0;
  if (!n.closed && e >= n.points.length - 1) return 1;
  const o = B(e, n.points.length, n.closed);
  return typeof s.timeRatio == "number" && Number.isFinite(s.timeRatio) ? h(s.timeRatio) : o;
}
function G(n, e) {
  const s = n.points.length;
  if (s < 2) return h(e);
  const o = n.closed ? I(e) : h(e), t = n.closed ? s : s - 1;
  let i = 0, r = 0;
  for (let a = 1; a <= t; a += 1) {
    const c = n.closed && a === s, u = c ? 1 : B(a, s, n.closed), l = c || !n.closed && a === t ? 1 : _n(n, a), f = Math.max(i, h(Number.isFinite(l) ? l : u)), d = n.closed ? a / s : B(a, s);
    if (o <= f || a === t) {
      const p = f - i;
      if (p <= 1e-4) return d;
      const v = (o - i) / p;
      return Q.lerp(r, d, h(v));
    }
    i = f, r = d;
  }
  return n.closed ? I(o) : h(o);
}
function oe(n, e, s) {
  e.updateArcLengths();
  const o = e.getSpacedPoints(b);
  let t = 0, i = Number.POSITIVE_INFINITY;
  o.forEach((l, f) => {
    const d = l.distanceToSquared(s);
    d < i && (i = d, t = f);
  });
  const r = Math.min(t, b - 1), a = e.getUtoTmapping(r / b, 0), c = n.closed ? n.points.length : n.points.length - 1;
  return Math.min(Math.floor(a * c), c - 1) + 1;
}
function se(n) {
  const e = n.trajectories.some((t) => t.points.length >= 2), s = new Set(n.cameras.map((t) => t.id)), o = n.trajectoryBindings.some(
    (t) => t.objects.some((i) => s.has(i.objectId))
  );
  return e && o;
}
function $(n, e, s = null) {
  return n.trajectoryBindings.find((o) => (!s || s.has(o.trajectoryId)) && o.objects.some((t) => t.objectId === e)) ?? null;
}
function q(n, e, s, o = null) {
  const t = $(n, e, o);
  if (!t) return null;
  const i = t.objects.find((w) => w.objectId === e), r = n.trajectories.find((w) => w.id === t.trajectoryId);
  if (!i || !r) return null;
  const a = Z(r);
  if (!a) return null;
  const c = t.endTime - t.startTime;
  if (c <= 0) return null;
  const u = !(r.closed && s < t.startTime), l = (s - t.startTime) / c;
  let f = r.closed ? I(l) : h(l);
  t.direction === "reverse" && (f = 1 - f);
  const d = t.direction === "reverse" ? -i.offsetRatio : i.offsetRatio, p = r.closed ? G(r, I(f + d)) : G(r, h(f + d)), v = a.getTangentAt(p);
  return {
    position: a.getPointAt(p),
    tangent: v.lengthSq() >= 1e-10 ? v.normalize() : null,
    visible: u
  };
}
function bn(n, e, s, o = null) {
  if (!e) return null;
  const t = n.objects.find((r) => r.id === e);
  if (!t) return null;
  const i = q(n, t.id, s, o);
  return i ? M(i.position.clone().add(new C(0, Y(t), 0))) : [...t.position];
}
const J = 0.028, W = 0.035;
function y(n, e) {
  return 0.5 * Math.sin(n * 2 * Math.PI * 0.9 + e) + 0.3 * Math.sin(n * 2 * Math.PI * 2.3 + e * 1.7) + 0.2 * Math.sin(n * 2 * Math.PI * 4.7 + e * 2.9);
}
function Ln(n, e, s, o) {
  const t = Math.min(100, Math.max(0, s)) / 100;
  if (t <= 0) return { position: n, target: e };
  const i = new C(...n), r = new C(...e), a = r.clone().sub(i), c = a.length();
  if (c < 1e-3) return { position: n, target: e };
  a.normalize();
  const u = a.clone().cross(new C(0, 1, 0));
  u.lengthSq() < 1e-6 && u.set(1, 0, 0), u.normalize();
  const l = u.clone().cross(a).normalize(), f = o, d = u.clone().multiplyScalar(y(f, 0.7) * W * t).addScaledVector(l, y(f, 2.1) * W * t), p = u.clone().multiplyScalar(y(f, 4.2) * J * c * t).addScaledVector(l, y(f, 5.6) * J * c * t);
  return {
    position: M(i.add(d)),
    target: M(r.add(p))
  };
}
function Bn(n, e, s) {
  if (n.fovFrom === void 0 && n.fovTo === void 0) return null;
  const o = n.fovFrom ?? e, t = n.fovTo ?? e, i = n.endTime - n.startTime, r = i > 0 ? h((s - n.startTime) / i) : 1;
  return o + (t - o) * r;
}
function Dn(n, e, s, o = null) {
  const t = $(n, e.id, o), i = q(n, e.id, s, o), r = i ? M(i.position) : e.position, a = t ? Bn(t, e.fov, s) : null, c = e.aimTrajectoryId ? q(n, dn(e.id), s, o) : null, u = c ? M(c.position) : bn(n, e.followTargetId, s, o) ?? e.target ?? Pn, l = Ln(r, u, e.shakeAmplitude ?? 0, s);
  return {
    ...e,
    position: l.position,
    target: l.target,
    rotation: pn(l.position, l.target),
    fov: a ?? e.fov
  };
}
function ie(n, e, s = null) {
  const o = new Map(n.cameras.map((r) => [r.id, r])), t = new Map(n.trajectories.map((r) => [r.id, r]));
  let i = null;
  return n.trajectoryBindings.forEach((r) => {
    if (s && !s.has(r.trajectoryId) || e < r.startTime || e > r.endTime) return;
    const a = t.get(r.trajectoryId);
    if (!a) return;
    const c = r.objects.flatMap((u) => {
      const l = o.get(u.objectId);
      return l ? [l] : [];
    })[0];
    c && (!i || r.startTime > i.binding.startTime || r.startTime === i.binding.startTime && r.endTime < i.binding.endTime) && (i = { camera: c, binding: r, trajectory: a });
  }), i;
}
function Fn(n, e) {
  if (!n.poseTrack || n.poseTrack.length === 0) return n;
  const s = K(n.poseTrack, e);
  return s ? { ...n, pose: s.pose } : n;
}
function Nn(n, e, s, o = null) {
  const t = Fn(e, s), i = q(n, e.id, s, o);
  if (!i) return t;
  const r = i.position.clone().add(new C(0, Y(e), 0)), a = {
    ...t,
    visible: t.visible && i.visible,
    position: M(r)
  };
  if (!i.tangent) return a;
  const c = new An();
  return c.position.copy(r), c.lookAt(r.clone().add(i.tangent)), {
    ...a,
    rotation: hn(c.rotation)
  };
}
function Un(n, e, s) {
  const o = Math.max(0, Math.floor(s));
  if (o <= 0) return [];
  if (o === 1) return [n];
  const t = e - n;
  return Array.from({ length: o }, (i, r) => n + r / (o - 1) * t);
}
function Vn(n, e) {
  const s = (t) => {
    t.preventDefault();
  }, o = () => {
    e();
  };
  return n.addEventListener("webglcontextlost", s, !1), n.addEventListener("webglcontextrestored", o, !1), () => {
    n.removeEventListener("webglcontextlost", s, !1), n.removeEventListener("webglcontextrestored", o, !1);
  };
}
function Hn({
  objects: n,
  driverRefs: e
}) {
  let s = 0;
  return /* @__PURE__ */ m.jsx(m.Fragment, { children: n.map((o) => {
    const t = o.type === "mannequin" ? /* @__PURE__ */ m.jsx(
      ln,
      {
        color: o.color || "#808080",
        pose: o.pose,
        activeClip: o.locomotionClip,
        driverRef: D(o.locomotionClip) ? e.get(o.id) : void 0
      }
    ) : o.type === "mannequinCrowd" ? /* @__PURE__ */ m.jsx(fn, { object: o, roleStartIndex: s }) : /* @__PURE__ */ m.jsx(mn, { object: o });
    return o.type === "mannequin" && (s += 1), /* @__PURE__ */ m.jsx("group", { position: o.position, rotation: o.rotation, scale: o.scale, children: t }, o.id);
  }) });
}
function zn(n, e, s, o) {
  if (n.type !== "mannequin") return;
  const t = !!(n.poseTrack && n.poseTrack.length > 0), i = t ? K(n.poseTrack, e) : void 0, r = i ? i.pose : n.pose, a = t ? z(i) : z({ pose: r });
  if (o.get(n.id) === a) return;
  const c = s.children[0];
  c instanceof L && (Mn(c, r), j(c), o.set(n.id, a));
}
function Gn(n, e, s, o, t, i) {
  if (n.type !== "mannequin") return;
  const r = Rn(n.poseTrack, D(n.locomotionClip), e), a = t.get(n.id);
  if (t.set(n.id, r), r === "locomotion") {
    const c = i.get(n.id)?.current;
    if (c) {
      const u = s.children[0];
      a && a !== "locomotion" && u instanceof L && vn(u), c.setTime(e), u instanceof L && (Cn(u), j(u));
    }
    o.delete(n.id);
    return;
  }
  zn(n, e, s, o);
}
function Jn(n, e) {
  const s = n.cameras[0], o = s ? n.trajectoryBindings.find((r) => r.objects.some((a) => a.objectId === s.id)) : void 0, t = o?.startTime ?? 0, i = o?.endTime ?? Math.max(t + 1, n.sceneTimeline?.totalDuration ?? t + 1);
  return Un(t, i, e);
}
function Wn({
  state: n,
  frameCount: e,
  fps: s,
  title: o,
  sizeMode: t,
  onResult: i
}) {
  const { gl: r, scene: a } = sn(), c = g.useRef(!1), u = g.useRef(0), l = g.useRef(0), f = g.useRef([]), d = g.useMemo(() => Jn(n, e), [n, e]), p = g.useRef(null), v = g.useRef(/* @__PURE__ */ new Map()), w = g.useRef(/* @__PURE__ */ new Map()), A = g.useRef(/* @__PURE__ */ new Map()).current;
  return n.objects.forEach((T) => {
    T.type === "mannequin" && D(T.locomotionClip) && !A.has(T.id) && A.set(T.id, { current: null });
  }), rn(() => {
    if (c.current) return;
    if (u.current < 8) {
      u.current += 1;
      return;
    }
    const T = n.cameras[0];
    if (!T || d.length === 0) {
      c.current = !0, i(null);
      return;
    }
    const nn = l.current, O = d[nn], _ = p.current;
    _ && (n.objects.forEach((x, en) => {
      const P = _.children[en];
      if (!P) return;
      const R = Nn(n, x, O);
      P.position.set(R.position[0], R.position[1], R.position[2]), P.rotation.set(R.rotation[0], R.rotation[1], R.rotation[2]), P.visible = R.visible, Gn(x, O, P, v.current, w.current, A);
    }), _.updateMatrixWorld(!0));
    const S = Dn(n, T, O), E = H(S.aspectRatio, t), U = new En(
      S.fov,
      E.width / E.height,
      S.near,
      S.far
    );
    gn(U, S);
    const V = Tn(r, a, U, E.width, E.height, o, "scene3d-camera", !0);
    if (V && f.current.push(V.dataUrl), l.current += 1, l.current >= d.length) {
      if (c.current = !0, f.current.length < 2) {
        i(null);
        return;
      }
      const x = H(T.aspectRatio, t);
      i({ frames: f.current, width: x.width, height: x.height, fps: s, title: o });
    }
  }), /* @__PURE__ */ m.jsx("group", { ref: p, children: /* @__PURE__ */ m.jsx(Hn, { objects: n.objects, driverRefs: A }) });
}
function re({
  state: n,
  frameCount: e,
  fps: s,
  title: o,
  sizeMode: t = "reference-video",
  onResult: i
}) {
  return /* @__PURE__ */ m.jsx("div", { "aria-hidden": !0, style: { position: "absolute", left: -1e4, top: 0, width: 480, height: 270, opacity: 0, pointerEvents: "none" }, children: /* @__PURE__ */ m.jsxs(
    on,
    {
      gl: { preserveDrawingBuffer: !0, antialias: !0 },
      camera: { position: [4, 2.4, 5], fov: 45 },
      onCreated: ({ gl: r, invalidate: a }) => Vn(r.domElement, a),
      children: [
        /* @__PURE__ */ m.jsx(an, { environment: n.environment, ambientIntensity: 0.7 }),
        /* @__PURE__ */ m.jsx("directionalLight", { position: [4, 6, 5], intensity: 1.1 }),
        /* @__PURE__ */ m.jsx("directionalLight", { position: [-4, 3, -3], intensity: 0.4 }),
        /* @__PURE__ */ m.jsx(cn, { fallback: /* @__PURE__ */ m.jsx(un, { color: "#808080" }), children: /* @__PURE__ */ m.jsx(tn.Suspense, { fallback: null, children: /* @__PURE__ */ m.jsx(
          Wn,
          {
            state: n,
            frameCount: e,
            fps: s,
            title: o,
            sizeMode: t,
            onResult: i
          }
        ) }) })
      ]
    }
  ) });
}
export {
  re as S,
  $n as T,
  Vn as a,
  Z as b,
  Dn as c,
  h as d,
  te as e,
  ee as f,
  _n as g,
  ne as h,
  se as i,
  F as j,
  Nn as o,
  ie as p,
  G as r,
  oe as t,
  I as w
};
