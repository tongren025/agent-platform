import { gn as M, J as et, $ as _, dH as ht, G as b, cU as P, bD as Mt, cL as rt, eT as Z, ft as gt, c_ as L, cM as v, S as z, fa as yt, X as V, f7 as ot, fx as wt, dW as At, gw as St, gd as Tt, ej as xt, fh as It, cW as Rt, bd as Ct, be as Et, f8 as _t, U as bt } from "./scene3dConstants-DlRfsgmW.js";
const G = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "1:1": 1,
  "2.39:1": 2.39
  // 宽银幕 cinemascope；下游尺寸(截图/运镜小片)全按比值派生，无需特判
}, Nt = Object.keys(G);
function Ot(t) {
  if (t)
    return Object.fromEntries(
      Object.entries(t).map(([e, n]) => [e, [...n]])
    );
}
function at(t) {
  return t ? t.presetId ? `preset:${t.presetId}` : t.pose && Object.keys(t.pose).length > 0 ? `pose:${Object.entries(t.pose).sort(([n], [r]) => n < r ? -1 : n > r ? 1 : 0).map(([n, r]) => `${n}:${r.join(",")}`).join("|")}` : "base" : "base";
}
function vt(t) {
  const e = t.map((o, a) => ({ event: o, index: a })).filter(({ event: o }) => Number.isFinite(o.time) && o.time >= 0);
  e.sort((o, a) => o.event.time - a.event.time || o.index - a.index);
  const n = [];
  let r = null;
  for (const { event: o } of e) {
    const a = at(o);
    a !== r && (r = a, n.push({
      time: o.time,
      presetId: o.presetId,
      pose: Ot(o.pose)
    }));
  }
  return n;
}
function Gn(t, e, n) {
  const r = t && t.length > 0 ? Dt(t, n) : void 0;
  return at(r) !== "base" ? "static-pose" : e ? "locomotion" : "static-base";
}
function Dt(t, e) {
  let n;
  for (const r of t)
    r.time > e || (!n || r.time > n.time) && (n = r);
  return n;
}
const Ft = ":aim";
function Pt(t) {
  return `${t}${Ft}`;
}
const Un = "__scene-fit__", Lt = new M(-5, 2.45, 6).normalize(), zt = 55, Gt = 1.12;
function Ut(t) {
  if (t.type === "mannequin" || t.type === "mannequinCrowd") return 1.4;
  const e = t.scale ?? [1, 1, 1];
  return Math.max(e[0], e[1], e[2], 0.5) * 0.75;
}
function qt(t, e) {
  const n = new et();
  if (t.forEach((u) => {
    const d = Ut(u), p = new M(...u.position);
    n.expandByPoint(p.clone().addScalar(d)), n.expandByPoint(p.clone().addScalar(-d));
  }), e.forEach((u) => {
    const d = new M(...u.position);
    n.expandByPoint(d.clone().addScalar(0.8)), n.expandByPoint(d.clone().addScalar(-0.8));
  }), n.isEmpty()) return { position: [-5, 3.2, 6], target: [0, 0.75, 0] };
  const r = n.getCenter(new M()), o = Math.max(n.getSize(new M()).length() / 2, 2), a = zt / 2 * (Math.PI / 180), c = o / Math.sin(a) * Gt, i = r.clone().addScaledVector(Lt, c);
  return {
    position: [i.x, i.y, i.z],
    target: [r.x, r.y, r.z]
  };
}
function Bt(t) {
  return Math.min(_, Math.max(1, Math.round(t.crowdRows || 1)));
}
function jt(t) {
  return Math.min(_, Math.max(1, Math.round(t.crowdColumns || 1)));
}
function Vt(t) {
  return Math.min(10, Math.max(0.2, t.crowdSpacing || 1.2));
}
function it(t) {
  const e = Math.max(0.08, Math.abs(t.scale[0] || 1)), n = Math.max(0.08, Math.abs(t.scale[2] || 1));
  return Math.max(0.28, Math.max(0.78 * e, 0.54 * n) * 0.36);
}
function $t(t) {
  return Vt(t) + it(t) * 2;
}
function qn(t) {
  const e = Math.max(0.08, Math.abs(t.scale[0] || 1)), n = Math.max(0.08, Math.abs(t.scale[1] || 1)), r = Math.max(0.08, Math.abs(t.scale[2] || 1));
  if (t.type === "light") return { width: 0.42 * e, depth: 0.42 * r };
  if (t.type === "mannequinCrowd") {
    const o = it(t) * 2, a = $t(t);
    return {
      width: (jt(t) - 1) * a + o,
      depth: (Bt(t) - 1) * a + o
    };
  }
  return t.type === "mannequin" ? { width: 0.78 * e, depth: 0.54 * r } : t.type === "model" || t.type === "group" ? { width: 1 * e, depth: 1 * r } : t.geometry === "sphere" ? { width: 1.1 * e, depth: 1.1 * r } : t.geometry === "cylinder" ? { width: 0.92 * e, depth: 0.92 * r } : t.geometry === "plane" ? { width: e, depth: n } : { width: e, depth: r };
}
function Wt(t, e = t.scale) {
  const n = Math.max(0.08, Math.abs(e[1] || 1));
  return t.type === "light" ? 0.12 * n : t.type === "mannequin" || t.type === "mannequinCrowd" ? 0.5 * n : t.geometry === "sphere" || t.geometry === "cylinder" ? 0.55 * n : t.geometry === "plane" ? 0 : 0.5 * n;
}
function Bn(t) {
  return t instanceof HTMLElement ? !!t.closest('input, textarea, select, [contenteditable="true"]') : !1;
}
function jn(t) {
  return t && typeof t == "object" ? t : null;
}
function Vn(t, e) {
  if (!t || !e) return null;
  let n = null;
  return t.traverse((r) => {
    !n && r.userData?.[yt] === e && (n = r);
  }), n;
}
function X(t) {
  return t.replace(/^mixamorig:/, "mixamorig");
}
function Kt(t) {
  const e = X(t), n = e.replace(/^mixamorig/, "mixamorig:");
  return Array.from(/* @__PURE__ */ new Set([t, e, n]));
}
function Ht(t, e) {
  if (t)
    for (const n of Kt(e)) {
      const r = t[n];
      if (r) return r;
    }
}
function T(t) {
  return new M(t[0], t[1], t[2]);
}
function $n(t) {
  return [
    Number(t.x.toFixed(4)),
    Number(t.y.toFixed(4)),
    Number(t.z.toFixed(4))
  ];
}
function U(t, e) {
  const n = new ht();
  return n.position.fromArray(t), n.lookAt(T(e)), Xt(n.rotation);
}
function st(t, e) {
  const n = T(e).sub(T(t));
  if (n.lengthSq() < 1e-6) return [0, 0, 0];
  n.normalize();
  const r = Math.asin(L.clamp(n.y, -1, 1)), o = Math.atan2(-n.x, -n.z);
  return [
    Number(r.toFixed(4)),
    Number(o.toFixed(4)),
    0
  ];
}
function Wn(t, e) {
  const n = st(e.position, e.target);
  t.up.set(0, 1, 0), t.position.fromArray(e.position), t.rotation.set(n[0], n[1], n[2], "YXZ"), t.updateMatrixWorld(!0);
}
function Yt(t) {
  const e = T(t.position), r = T(t.target || z).clone().sub(e), o = r.length();
  if (o < 1e-3) return e;
  const a = L.clamp(t.lensDepth ?? 0, -100, 100) / 100;
  if (Math.abs(a) < 1e-3) return e;
  r.normalize();
  const c = o * bt * a, i = Math.max(0, o - Math.max(t.near ?? 0.1, 0.1) - 0.2), u = a > 0 ? Math.min(c, i) : c;
  return e.addScaledVector(r, u);
}
function Kn(t, e) {
  t instanceof At && (t.fov = e.fov, t.aspect = G[e.aspectRatio], t.near = e.near, t.far = e.far, t.updateProjectionMatrix()), t.position.copy(Yt(e)), t.lookAt(T(e.target || z)), t.updateMatrixWorld(!0);
}
function Hn(t) {
  const e = t.target || z;
  return {
    position: [...t.position],
    target: [...e],
    rotation: st(t.position, e),
    mode: "fly"
  };
}
function Yn(t) {
  const e = T(t.target).sub(T(t.position));
  return e.lengthSq() < 1e-4 && e.set(0, -0.2, 1), new wt().setFromVector3(e);
}
function Xt(t) {
  return [
    Number(t.x.toFixed(4)),
    Number(t.y.toFixed(4)),
    Number(t.z.toFixed(4))
  ];
}
function $(t, e, n = 2e-3) {
  return Math.abs(t[0] - e[0]) <= n && Math.abs(t[1] - e[1]) <= n && Math.abs(t[2] - e[2]) <= n;
}
function Qt(t) {
  return Math.min(_, Math.max(1, Math.round(t.crowdRows || 1)));
}
function Zt(t) {
  return Math.min(_, Math.max(1, Math.round(t.crowdColumns || 1)));
}
function Xn(t) {
  return Math.min(10, Math.max(0.2, t.crowdSpacing || 1.2));
}
function Qn(t) {
  return t.type === "mannequinCrowd" ? Qt(t) * Zt(t) : 1;
}
const kt = 1e-4;
function Zn(t, e, n = kt) {
  return t ? Math.abs(t.px - e.px) > n || Math.abs(t.py - e.py) > n || Math.abs(t.pz - e.pz) > n || Math.abs(t.rx - e.rx) > n || Math.abs(t.ry - e.ry) > n || Math.abs(t.rz - e.rz) > n || Math.abs(t.tx - e.tx) > n || Math.abs(t.ty - e.ty) > n || Math.abs(t.tz - e.tz) > n : !0;
}
function Jt(t) {
  if (t)
    return Object.fromEntries(
      Object.entries(t).map(([e, n]) => [e, [...n]])
    );
}
function kn(t, e) {
  if (!e.pose) return !t || Object.keys(t).length === 0;
  if (!t) return !1;
  const n = Object.entries(e.pose);
  return n.length !== Object.keys(t).length ? !1 : n.every(([r, o]) => {
    const a = t[r];
    return a ? $(a, o) : !1;
  });
}
function Jn(t) {
  t.traverse((e) => {
    e instanceof b && (e.userData[P] = [
      e.rotation.x,
      e.rotation.y,
      e.rotation.z
    ]);
  });
}
function te(t) {
  t.traverse((e) => {
    if (!(e instanceof b)) return;
    const n = e.userData[P];
    n && e.rotation.set(n[0], n[1], n[2]);
  }), t.updateMatrixWorld(!0);
}
function tn(t, e) {
  t.traverse((n) => {
    if (!(n instanceof b)) return;
    const r = n.userData[P];
    r && n.rotation.set(r[0], r[1], r[2]);
  }), t.traverse((n) => {
    if (!(n instanceof b)) return;
    const r = rt[X(n.name)], o = Ht(e, n.name);
    !r && !o || (n.rotation.x += (r?.[0] || 0) + (o?.[0] || 0), n.rotation.y += (r?.[1] || 0) + (o?.[1] || 0), n.rotation.z += (r?.[2] || 0) + (o?.[2] || 0));
  }), t.updateMatrixWorld(!0);
}
const nn = /(Shoulder|Arm|ForeArm|Hand)/;
function en(t) {
  return /(Left|Right)/.test(t) ? nn.test(t) : !1;
}
function ne(t) {
  t.traverse((e) => {
    if (!(e instanceof b) || !en(e.name)) return;
    const n = e.userData[P];
    n && e.rotation.set(n[0], n[1], n[2]);
    const r = rt[X(e.name)];
    r && (e.rotation.x += r[0], e.rotation.y += r[1], e.rotation.z += r[2]);
  }), t.updateMatrixWorld(!0);
}
const ct = "scene3dGroundRefY", W = "scene3dGroundBaseY", E = new M();
function ut(t) {
  let e = null;
  if (t.updateMatrixWorld(!0), t.traverse((r) => {
    if (!(r instanceof gt)) return;
    const o = r.geometry.getAttribute("position");
    if (o)
      for (let a = 0; a < o.count; a += 1)
        E.fromBufferAttribute(o, a), r.applyBoneTransform(a, E), r.localToWorld(E), t.worldToLocal(E), (e === null || E.y < e) && (e = E.y);
  }), e !== null) return e;
  const n = new M();
  return t.traverse((r) => {
    r instanceof b && (r.getWorldPosition(n), t.worldToLocal(n), (e === null || n.y < e) && (e = n.y));
  }), e;
}
function ee(t) {
  tn(t, void 0);
  const e = t.children[0];
  if (!e) return;
  e.userData[W] === void 0 && (e.userData[W] = e.position.y), t.updateMatrixWorld(!0);
  const n = ut(t);
  n !== null && (t.userData[ct] = n);
}
function re(t) {
  const e = t.children[0], n = t.userData[ct];
  if (!e || n === void 0) return;
  const r = e.userData[W] ?? e.position.y;
  e.position.y = r, t.updateMatrixWorld(!0);
  const o = ut(t);
  o !== null && (e.position.y = r + (n - o), t.updateMatrixWorld(!0));
}
function oe(t) {
  t.updateMatrixWorld(!0);
  const e = new et().setFromObject(t), n = e.getSize(new M()), r = e.getCenter(new M()), o = new Mt(), a = Math.max(1e-3, n.y);
  return t.position.sub(r), o.scale.setScalar(1 / a), o.add(t), o.updateMatrixWorld(!0), o;
}
const lt = 12, ft = 200;
function ae(t) {
  const e = 12 / Math.tan(L.degToRad(t / 2));
  return Math.round(Math.min(ft, Math.max(lt, e)));
}
function ie(t) {
  const e = Math.min(ft, Math.max(lt, t));
  return Number(L.radToDeg(2 * Math.atan(12 / e)).toFixed(2));
}
function rn(t) {
  const e = G[t], n = 1920;
  return {
    width: n,
    height: Math.max(1, Math.round(n / e))
  };
}
function on(t) {
  const { width: r, height: o } = t;
  if (r <= 0 || o <= 0) return t;
  const a = Math.max(r, o), c = Math.min(r, o), i = Math.min(1, 1280 / a, 720 / c);
  return i >= 1 ? t : {
    width: Math.max(2, Math.round(r * i / 2) * 2),
    height: Math.max(2, Math.round(o * i / 2) * 2)
  };
}
function an(t, e) {
  const n = [];
  return t.traverse((r) => {
    (r.userData?.[ot] === !0 || e && r.userData?.[_t] === !0) && n.push(r);
  }), n;
}
function se(t) {
  t.traverse((e) => {
    e.userData[ot] = !0;
  });
}
function ce(t, e) {
  const n = rn(t);
  return e === "still-frame" ? n : on(n);
}
function ue(t, e, n, r, o, a, c, i = !1) {
  const u = an(e, i).map((l) => {
    const A = { object: l, visible: l.visible };
    return l.visible = !1, A;
  }), d = t.getRenderTarget(), p = new St(r, o, {
    format: xt,
    type: Tt
  });
  p.texture.colorSpace = It;
  try {
    t.setRenderTarget(p), t.clear(), t.render(e, n);
    const l = new Uint8Array(r * o * 4);
    t.readRenderTargetPixels(p, 0, 0, r, o, l);
    const A = document.createElement("canvas");
    A.width = r, A.height = o;
    const x = A.getContext("2d");
    if (!x) return null;
    const I = x.createImageData(r, o);
    for (let S = 0; S < o; S += 1) {
      const R = (o - S - 1) * r * 4, C = S * r * 4;
      I.data.set(l.subarray(R, R + r * 4), C);
    }
    return x.putImageData(I, 0, 0), {
      dataUrl: A.toDataURL("image/png"),
      width: r,
      height: o,
      title: a,
      source: c
    };
  } finally {
    t.setRenderTarget(d), u.forEach((l) => {
      l.object.visible = l.visible;
    }), p.dispose();
  }
}
function sn(t) {
  return Z[t % Z.length];
}
function le(t) {
  return t < 26 ? `角色${String.fromCharCode(65 + t)}` : `角色A${t - 25}`;
}
function cn(t) {
  return {
    rows: Math.min(_, Math.max(1, Math.round(t.rows))),
    columns: Math.min(_, Math.max(1, Math.round(t.columns))),
    spacing: Math.min(10, Math.max(0.2, Number(t.spacing.toFixed(2))))
  };
}
function fe(t, e = 0) {
  const n = q();
  return t === "mannequin" ? {
    id: n,
    name: "假人",
    type: "mannequin",
    visible: !0,
    position: [0, v[1] * 0.5, 0],
    rotation: [0, 0, 0],
    scale: [...v],
    color: sn(e)
  } : t === "light" ? {
    id: n,
    name: "点光源",
    type: "light",
    visible: !0,
    position: [2.5, 3.5, 2.5],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    lightType: "point",
    lightColor: "#ffffff",
    lightIntensity: 2.4
  } : {
    id: n,
    name: {
      box: "立方体",
      sphere: "球体",
      cylinder: "圆柱体",
      plane: "平面"
    }[t],
    type: "mesh",
    visible: !0,
    position: t === "plane" ? [0, 0, 0] : [0, 0.5, 0],
    rotation: t === "plane" ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
    scale: t === "plane" ? [4, 4, 4] : [1, 1, 1],
    color: t === "plane" ? "#4b5563" : "#7c8ea0",
    geometry: t
  };
}
function me(t) {
  const e = q(), n = cn(t);
  return {
    id: e,
    name: `群众(${n.rows}x${n.columns})`,
    type: "mannequinCrowd",
    visible: !0,
    position: [0, v[1] * 0.5, 0],
    rotation: [0, 0, 0],
    scale: [...v],
    crowdRows: n.rows,
    crowdColumns: n.columns,
    crowdSpacing: n.spacing
  };
}
function de(t) {
  const e = [4, 2.4, 5], n = [...z];
  return {
    id: Q(),
    name: `相机${t + 1}`,
    visible: !0,
    position: e,
    rotation: U(e, n),
    target: n,
    fov: 45,
    aspectRatio: "16:9",
    lensDepth: 0,
    near: 0.1,
    far: 200
  };
}
function K(t, e) {
  return [
    Number((t[0] + V[0] * e).toFixed(4)),
    Number((t[1] + V[1] * e).toFixed(4)),
    Number((t[2] + V[2] * e).toFixed(4))
  ];
}
function un(t) {
  return {
    ...t,
    position: [...t.position],
    rotation: [...t.rotation],
    scale: [...t.scale],
    pose: Jt(t.pose),
    children: t.children ? [...t.children] : void 0
  };
}
function ln(t) {
  return {
    ...t,
    position: [...t.position],
    rotation: [...t.rotation],
    target: [...t.target]
  };
}
function pe(t, e) {
  return {
    ...un(t),
    id: q(),
    name: `${t.name} 副本`,
    position: K(t.position, e),
    parentId: void 0,
    children: void 0
  };
}
function he(t, e) {
  const n = K(t.position, e), r = K(t.target, e);
  return {
    ...ln(t),
    id: Q(),
    name: `${t.name} 副本`,
    position: n,
    target: r,
    rotation: U(n, r)
  };
}
function Me(t, e, n) {
  const r = [...t];
  return r[e] = Number.isFinite(n) ? n : t[e], r;
}
function ge(t) {
  return Number.isFinite(t) ? String(Number(t.toFixed(3))) : "0";
}
function ye(t) {
  return Rt.has(t);
}
function we(t) {
  return t ? { min: Et, max: Ct } : { min: 0, max: Math.PI };
}
function Ae(t) {
  t.KeyW = !1, t.KeyA = !1, t.KeyS = !1, t.KeyD = !1, t.ArrowUp = !1, t.ArrowDown = !1, t.ArrowLeft = !1, t.ArrowRight = !1, t.Space = !1, t.ShiftLeft = !1, t.ShiftRight = !1;
}
function Se(t) {
  return t.KeyW || t.KeyA || t.KeyS || t.KeyD || t.ArrowUp || t.ArrowDown || t.ArrowLeft || t.ArrowRight || t.Space || t.ShiftLeft || t.ShiftRight;
}
const k = 0.42, J = 0.3, fn = 1.3, mn = new M(0, 1, 0);
function dn(t) {
  if (!t.visible || t.type !== "mannequin" && t.type !== "mannequinCrowd") return null;
  const e = Wt(t), n = e * fn, r = Math.max(n * k, 0.5 * Math.abs(t.scale[0] || 1) * k), o = Math.max(n * J, 0.5 * Math.abs(t.scale[2] || 1) * J);
  return {
    center: [t.position[0], t.position[1] + e, t.position[2]],
    half: [r, n, o]
  };
}
function pn(t) {
  const e = t.map(dn).filter((o) => o !== null);
  if (e.length === 0) return null;
  const n = new M(1 / 0, 1 / 0, 1 / 0), r = new M(-1 / 0, -1 / 0, -1 / 0);
  for (const o of e)
    for (let a = 0; a < 3; a += 1)
      n.setComponent(a, Math.min(n.getComponent(a), o.center[a] - o.half[a])), r.setComponent(a, Math.max(r.getComponent(a), o.center[a] + o.half[a]));
  return {
    center: [(n.x + r.x) / 2, (n.y + r.y) / 2, (n.z + r.z) / 2],
    half: [(r.x - n.x) / 2, (r.y - n.y) / 2, (r.z - n.z) / 2]
  };
}
function hn(t, e) {
  const n = e.clone().sub(t);
  n.lengthSq() < 1e-10 && n.set(0, 0, -1), n.normalize();
  let r = n.clone().cross(mn);
  r.lengthSq() < 1e-8 && (r = n.clone().cross(new M(1, 0, 0))), r.normalize();
  const o = r.clone().cross(n).normalize();
  return { forward: n, right: r, up: o };
}
function Mn(t) {
  const { subject: e, fovVerticalDeg: n, aspect: r, margin: o } = t, a = new M(...e.center), c = new M(...t.direction);
  c.lengthSq() < 1e-10 && c.set(0.6, 0.35, 0.8), c.normalize();
  const i = a.clone().addScaledVector(c, -1), { forward: u, right: d, up: p } = hn(i, a), l = new M(...e.half), A = Math.abs(l.x * d.x) + Math.abs(l.y * d.y) + Math.abs(l.z * d.z), x = Math.abs(l.x * p.x) + Math.abs(l.y * p.y) + Math.abs(l.z * p.z), I = Math.abs(l.x * u.x) + Math.abs(l.y * u.y) + Math.abs(l.z * u.z), S = Math.tan(n * Math.PI / 360), R = S * r, C = Math.max(0.05, 1 - 2 * o), B = x / (S * C) + I, j = A / (R * C) + I, O = Math.max(B, j, t.minDistance ?? 0), s = a.clone().addScaledVector(c, -O);
  return {
    target: [a.x, a.y, a.z],
    position: [s.x, s.y, s.z],
    distance: O
  };
}
const mt = 0.12;
function dt(t, e, n = mt) {
  const r = pn(t);
  if (!r) return null;
  const o = [
    e.target[0] - e.position[0],
    e.target[1] - e.position[1],
    e.target[2] - e.position[2]
  ], a = Mn({
    subject: r,
    direction: o,
    fovVerticalDeg: e.fov,
    aspect: G[e.aspectRatio] ?? 16 / 9,
    margin: n
  });
  return { position: a.position, target: a.target };
}
function gn(t, e, n = mt) {
  return t.framing !== "auto" ? null : dt(e, t, n);
}
function Te(t, e) {
  return e.framing !== void 0 ? e : e.position !== void 0 && !$(e.position, t.position) || e.target !== void 0 && !$(e.target, t.target) ? { ...e, framing: "manual" } : e;
}
function xe(t, e, n = {}) {
  const r = gn({ ...t, ...n }, e);
  return r ? {
    ...n,
    position: r.position,
    target: r.target,
    rotation: U(r.position, r.target),
    framing: "auto"
  } : n;
}
const yn = /* @__PURE__ */ new Set(["box", "sphere", "cylinder", "plane"]), wn = /* @__PURE__ */ new Set(["car", "building", "tree", "streetlamp", "wall"]), An = /* @__PURE__ */ new Set(["point", "directional", "spot"]), Sn = new Set(Nt), Tn = /* @__PURE__ */ new Set(["edit", "fly"]), xn = /* @__PURE__ */ new Set(["panorama", "sphere"]), In = /* @__PURE__ */ new Set(["forward", "reverse"]), Rn = /^#[0-9a-f]{6}$/i, Cn = /^(nomi-local:\/\/|data:image\/|https?:\/\/)/i, D = [2.5, 2.5, 2.5], H = ["#ef4444", "#facc15", "#3b82f6", "#22c55e"], tt = 10, Y = 10;
function y(t) {
  return t && typeof t == "object" ? t : {};
}
function h(t, e) {
  return typeof t == "string" && t.trim() ? t.trim() : e;
}
function f(t, e) {
  return typeof t == "number" && Number.isFinite(t) ? t : e;
}
function nt(t, e) {
  return Number.isInteger(t) ? t : e;
}
function w(t, e) {
  return !Array.isArray(t) || t.length < 3 ? [...e] : [
    f(t[0], e[0]),
    f(t[1], e[1]),
    f(t[2], e[2])
  ];
}
function F(t, e) {
  return typeof t == "string" && Rn.test(t) ? t : e;
}
function En(t) {
  if (typeof t != "string") return;
  const e = t.trim();
  return Cn.test(e) ? e : void 0;
}
function pt(t) {
  const e = y(t), n = Object.entries(e).reduce((r, [o, a]) => {
    if (!o.trim()) return r;
    const c = o.replace(/^mixamorig:/, "mixamorig");
    return r[c] = w(a, [0, 0, 0]), r;
  }, {});
  return Object.keys(n).length > 0 ? n : void 0;
}
function _n(t) {
  if (!Array.isArray(t)) return;
  const e = t.flatMap((r) => {
    const o = y(r), a = f(o.time, Number.NaN);
    return !Number.isFinite(a) || a < 0 ? [] : [{
      time: a,
      presetId: typeof o.presetId == "string" ? o.presetId : void 0,
      pose: pt(o.pose)
    }];
  });
  if (e.length === 0) return;
  const n = vt(e);
  return n.length > 0 ? n : void 0;
}
function N(t) {
  return `${t}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function q() {
  return N("scene3d-object");
}
function Q() {
  return N("scene3d-camera");
}
function Ie() {
  return N("scene3d-trajectory");
}
function Re() {
  return N("scene3d-trajectory-point");
}
function Ce() {
  return N("scene3d-trajectory-binding");
}
function Ee() {
  return N("scene3d-trajectory-group");
}
function bn() {
  const t = [
    {
      id: q(),
      name: "假人",
      type: "mannequin",
      visible: !0,
      position: [0, D[1] * 0.5, 0],
      rotation: [0, 0, 0],
      scale: [...D],
      color: H[0]
    }
  ], e = [
    {
      id: Q(),
      name: "相机1",
      visible: !0,
      // 保留出厂 3/4 俯视方位；下面按主体安全画幅重解 target + 距离（F1：不再固定看 0.75 把头裁掉）。
      position: [4, 2.4, 5],
      rotation: [-0.36, 0.68, 0],
      target: [0, 0.75, 0],
      fov: 45,
      aspectRatio: "16:9",
      lensDepth: 0,
      near: 0.1,
      far: 200,
      // auto-managed：默认/模板/切画幅走安全画幅求解器；用户手动构图后转 manual、不再被自动覆盖。
      framing: "auto"
    }
  ], n = dt(t, e[0]);
  return n && (e[0].position = n.position, e[0].target = n.target, e[0].rotation = U(n.position, n.target)), {
    objects: t,
    cameras: e,
    trajectories: [],
    trajectoryBindings: [],
    trajectoryGroups: [],
    sceneTimeline: {
      totalDuration: Y
    },
    environment: {
      preset: "city",
      showGrid: !0,
      showAxes: !0,
      showSky: !1,
      darkMode: !1,
      backgroundColor: "#f6f3ee",
      panoramaRotation: 0,
      environmentMode: "panorama",
      sphereRadius: 50
    },
    editorCamera: {
      // 出厂机位 = 看全场取景（相机1 也要在画面里，见 scene3dFitView 与用户 2026-07-20 反馈）
      ...qt(t, e),
      rotation: [0, 0, 0],
      mode: "edit"
    }
  };
}
function Nn(t, e) {
  const n = y(t), r = h(n.id, "");
  if (!r) return null;
  const o = wn.has(n.propKind) ? n.propKind : void 0, a = n.type === "mannequin" || n.type === "mannequinCrowd" || n.type === "model" || n.type === "light" || n.type === "group" || n.type === "prop" && o ? n.type : "mesh", c = yn.has(n.geometry) ? n.geometry : "box", i = An.has(n.lightType) ? n.lightType : "point";
  return {
    id: r,
    name: h(n.name, `${a === "light" ? "灯光" : "对象"}${e + 1}`),
    type: a,
    visible: n.visible !== !1,
    // prop 的 origin 在地面中心 → 默认落 y=0 贴地。
    position: w(n.position, [0, a === "mesh" ? 0.5 : a === "mannequin" || a === "mannequinCrowd" ? D[1] * 0.5 : 0, 0]),
    rotation: w(n.rotation, [0, 0, 0]),
    scale: w(n.scale, a === "mannequin" || a === "mannequinCrowd" ? D : [1, 1, 1]),
    parentId: typeof n.parentId == "string" ? n.parentId : void 0,
    color: F(n.color, "#808080"),
    geometry: c,
    propKind: a === "prop" ? o : void 0,
    modelUrl: typeof n.modelUrl == "string" ? n.modelUrl : void 0,
    lightType: i,
    lightColor: F(n.lightColor, "#ffffff"),
    lightIntensity: Math.max(0, f(n.lightIntensity, 2)),
    crowdRows: Math.min(tt, Math.max(1, nt(n.crowdRows, 1))),
    crowdColumns: Math.min(tt, Math.max(1, nt(n.crowdColumns, 1))),
    crowdSpacing: Math.min(10, Math.max(0.2, f(n.crowdSpacing, 1.2))),
    pose: pt(n.pose),
    poseTrack: _n(n.poseTrack),
    locomotionClip: typeof n.locomotionClip == "string" ? n.locomotionClip : void 0,
    children: Array.isArray(n.children) ? n.children.filter((u) => typeof u == "string") : void 0,
    ...typeof n.templateGroup == "string" && n.templateGroup ? { templateGroup: n.templateGroup } : {}
  };
}
function On(t, e) {
  const n = y(t), r = h(n.id, "");
  if (!r) return null;
  const o = h(n.followTargetId, "");
  return {
    id: r,
    name: h(n.name, `相机${e + 1}`),
    visible: n.visible !== !1,
    position: w(n.position, [4, 2.4, 5]),
    rotation: w(n.rotation, [-0.35, 0.65, 0]),
    target: w(n.target, [0, 0.75, 0]),
    followTargetId: o || void 0,
    // fov 下限 6：焦段 200mm 长焦 ↔ 竖直 fov≈6.9°（scene3dMath 焦段换算）。
    fov: Math.min(120, Math.max(6, f(n.fov, 45))),
    aspectRatio: Sn.has(n.aspectRatio) ? n.aspectRatio : "16:9",
    lensDepth: Math.min(100, Math.max(-100, f(n.lensDepth, 0))),
    near: Math.max(0.01, f(n.near, 0.1)),
    far: Math.max(1, f(n.far, 200)),
    // 相机运镜 take 的「瞄准轨迹」标志：原样保留，是否指向真实轨迹在下方 normalizeScene3DState
    // 统一校验（与 followTargetId 同批处理——那时 trajectoryIds 才算出）。缺省不落字段。
    ...h(n.aimTrajectoryId, "") ? { aimTrajectoryId: h(n.aimTrajectoryId, "") } : {},
    // 手持抖动 0-100；0/缺省不落字段（老快照字节不变）。
    ...f(n.shakeAmplitude, 0) > 0 ? { shakeAmplitude: Math.min(100, Math.max(0, f(n.shakeAmplitude, 0))) } : {},
    // 构图所有权：只认显式 'auto'；缺省/其它一律不落字段 = 按 manual 处理（老项目相机绝不被自动取景覆盖）。
    ...n.framing === "auto" ? { framing: "auto" } : {}
  };
}
function vn(t) {
  const e = y(t), n = h(e.id, "");
  if (!n) return null;
  const r = f(e.timeRatio, Number.NaN);
  return {
    id: n,
    position: w(e.position, [0, 0, 0]),
    timeRatio: Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : void 0
  };
}
function Dn(t, e) {
  const n = y(t), r = h(n.segmentStartPointId, "");
  return e.has(r) ? {
    segmentStartPointId: r,
    position: w(n.position, [0, 0, 0])
  } : null;
}
function Fn(t, e) {
  const n = y(t), r = h(n.id, "");
  if (!r) return null;
  const o = Array.isArray(n.points) ? n.points.flatMap((i) => {
    const u = vn(i);
    return u ? [u] : [];
  }) : [], a = new Set(o.map((i) => i.id)), c = Array.isArray(n.curveControls) ? n.curveControls.flatMap((i) => {
    const u = Dn(i, a);
    return u ? [u] : [];
  }) : [];
  return {
    id: r,
    name: h(n.name, `轨迹${e + 1}`),
    points: o,
    curveControls: c,
    tension: Math.min(1, Math.max(0, f(n.tension, 0.5))),
    closed: n.closed === !0,
    color: F(n.color, H[e % H.length])
  };
}
function Pn(t, e, n) {
  const r = y(t), o = h(r.id, ""), a = h(r.trajectoryId, "");
  if (!o || !e.has(a)) return null;
  const c = Array.isArray(r.objects) ? r.objects.flatMap((d) => {
    const p = y(d), l = h(p.objectId, "");
    return n.has(l) ? [{
      objectId: l,
      offsetRatio: Math.min(0.999, Math.max(-0.999, f(p.offsetRatio, 0)))
    }] : [];
  }) : [], i = Math.max(0, f(r.startTime, 0)), u = {
    id: o,
    trajectoryId: a,
    objects: c,
    startTime: i,
    endTime: Math.max(i + 1e-3, f(r.endTime, i + 3)),
    direction: In.has(r.direction) ? r.direction : "forward"
  };
  return Number.isFinite(r.fovFrom) && (u.fovFrom = Math.min(120, Math.max(6, r.fovFrom))), Number.isFinite(r.fovTo) && (u.fovTo = Math.min(120, Math.max(6, r.fovTo))), u;
}
function Ln(t, e, n, r) {
  const o = y(t), a = h(o.id, "");
  if (!a) return null;
  const c = Array.isArray(o.trajectoryIds) ? o.trajectoryIds.filter((i) => typeof i != "string" || !n.has(i) || r.has(i) ? !1 : (r.add(i), !0)) : [];
  return {
    id: a,
    name: h(o.name, `组${e + 1}`),
    trajectoryIds: c
  };
}
function _e(t) {
  const e = bn(), n = y(t), r = y(n.environment), o = y(n.editorCamera), a = y(n.sceneTimeline), c = Array.isArray(n.objects) ? n.objects.flatMap((s, m) => {
    const g = Nn(s, m);
    return g ? [g] : [];
  }) : e.objects, i = Array.isArray(n.cameras) ? n.cameras.flatMap((s, m) => {
    const g = On(s, m);
    return g ? [g] : [];
  }) : e.cameras, u = Array.isArray(n.trajectories) ? n.trajectories.flatMap((s, m) => {
    const g = Fn(s, m);
    return g ? [g] : [];
  }) : [], d = new Set(u.map((s) => s.id)), p = new Set(c.map((s) => s.id)), l = i.map((s) => {
    let m = s;
    return s.followTargetId && !p.has(s.followTargetId) && (m = { ...m, followTargetId: void 0 }), s.aimTrajectoryId && !d.has(s.aimTrajectoryId) && (m = { ...m, aimTrajectoryId: void 0 }), m;
  }), A = l.map((s) => s.id), x = new Set(A), I = /* @__PURE__ */ new Set([...p, ...x, ...A.map((s) => Pt(s))]), S = Array.isArray(n.trajectoryBindings) ? n.trajectoryBindings.flatMap((s) => {
    const m = Pn(s, d, I);
    return m ? [m] : [];
  }) : [], R = /* @__PURE__ */ new Set(), C = S.map((s) => {
    const m = s.objects.filter((g) => R.has(g.objectId) ? !1 : (R.add(g.objectId), !0));
    return m.length === s.objects.length ? s : { ...s, objects: m };
  }), B = /* @__PURE__ */ new Set(), j = Array.isArray(n.trajectoryGroups) ? n.trajectoryGroups.flatMap((s, m) => {
    const g = Ln(s, m, d, B);
    return g ? [g] : [];
  }) : [], O = f(a.totalDuration, Y);
  return {
    objects: c,
    cameras: l,
    trajectories: u,
    trajectoryBindings: C,
    trajectoryGroups: j,
    sceneTimeline: {
      totalDuration: O > 0 ? O : Y
    },
    environment: {
      preset: h(r.preset, e.environment.preset),
      showGrid: r.showGrid !== !1,
      showAxes: r.showAxes !== !1,
      showSky: r.showSky === !0,
      darkMode: r.darkMode === !0,
      backgroundColor: F(r.backgroundColor, e.environment.backgroundColor),
      panoramaUrl: En(r.panoramaUrl),
      panoramaFileName: typeof r.panoramaFileName == "string" && r.panoramaFileName.trim() ? r.panoramaFileName.trim() : void 0,
      panoramaRotation: f(r.panoramaRotation, e.environment.panoramaRotation),
      environmentMode: xn.has(r.environmentMode) ? r.environmentMode : e.environment.environmentMode,
      sphereRadius: Math.min(200, Math.max(10, f(r.sphereRadius, e.environment.sphereRadius)))
    },
    editorCamera: {
      position: w(o.position, e.editorCamera.position),
      target: w(o.target, e.editorCamera.target),
      rotation: w(o.rotation, e.editorCamera.rotation),
      mode: Tn.has(o.mode) ? o.mode : "edit"
    },
    lastThumbnail: typeof n.lastThumbnail == "string" && n.lastThumbnail ? n.lastThumbnail : void 0
  };
}
function be(t) {
  return {
    objects: t.objects.map((e) => ({
      ...e,
      position: [...e.position],
      rotation: [...e.rotation],
      scale: [...e.scale],
      pose: e.pose ? Object.fromEntries(Object.entries(e.pose).map(([n, r]) => [n, [...r]])) : void 0,
      poseTrack: e.poseTrack ? e.poseTrack.map((n) => ({
        time: n.time,
        presetId: n.presetId,
        pose: n.pose ? Object.fromEntries(Object.entries(n.pose).map(([r, o]) => [r, [...o]])) : void 0
      })) : void 0,
      children: e.children ? [...e.children] : void 0
    })),
    cameras: t.cameras.map((e) => ({
      ...e,
      position: [...e.position],
      rotation: [...e.rotation],
      target: [...e.target || [0, 0.75, 0]]
    })),
    trajectories: t.trajectories.map((e) => ({
      ...e,
      points: e.points.map((n) => ({
        ...n,
        position: [...n.position],
        timeRatio: n.timeRatio
      })),
      curveControls: e.curveControls?.map((n) => ({
        ...n,
        position: [...n.position]
      }))
    })),
    trajectoryBindings: t.trajectoryBindings.map((e) => ({
      ...e,
      objects: e.objects.map((n) => ({ ...n }))
    })),
    trajectoryGroups: t.trajectoryGroups.map((e) => ({
      ...e,
      trajectoryIds: [...e.trajectoryIds]
    })),
    sceneTimeline: { ...t.sceneTimeline },
    environment: { ...t.environment },
    editorCamera: {
      position: [...t.editorCamera.position],
      target: [...t.editorCamera.target],
      rotation: [...t.editorCamera.rotation],
      mode: t.editorCamera.mode
    },
    lastThumbnail: t.lastThumbnail
  };
}
export {
  le as $,
  Ee as A,
  Ie as B,
  Re as C,
  Zt as D,
  Qn as E,
  ft as F,
  Qt as G,
  Xn as H,
  Hn as I,
  Xt as J,
  Vn as K,
  qt as L,
  ie as M,
  we as N,
  ae as O,
  Gn as P,
  re as Q,
  Se as R,
  Nt as S,
  Bn as T,
  ye as U,
  st as V,
  de as W,
  me as X,
  fe as Y,
  he as Z,
  pe as _,
  lt as a,
  oe as a0,
  _e as a1,
  ge as a2,
  qn as a3,
  Wt as a4,
  Te as a5,
  jn as a6,
  at as a7,
  kn as a8,
  gn as a9,
  Jn as aa,
  te as ab,
  sn as ac,
  Dt as ad,
  se as ae,
  Me as af,
  $ as ag,
  T as ah,
  $n as ai,
  G as b,
  Un as c,
  Wn as d,
  ne as e,
  tn as f,
  Kn as g,
  rn as h,
  xe as i,
  vt as j,
  Pt as k,
  Yn as l,
  U as m,
  Zn as n,
  ce as o,
  ee as p,
  ue as q,
  Ae as r,
  ln as s,
  un as t,
  Jt as u,
  be as v,
  bn as w,
  Q as x,
  q as y,
  Ce as z
};
