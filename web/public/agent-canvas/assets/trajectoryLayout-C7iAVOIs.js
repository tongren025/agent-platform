import { by as N } from "./agentStudioMount-DueN8bR4.js";
const w = 160, p = 160, R = 80, m = { width: 340, height: 280 }, O = 4;
function f(o) {
  return N(o);
}
function S(o) {
  return o === "character" || o === "scene" ? 0 : o === "image" ? 1 : o === "video" ? 2 : null;
}
function _(o) {
  let c = -1 / 0;
  for (const i of o) {
    if (!i.position) continue;
    const h = f(i.kind).height;
    c = Math.max(c, i.position.y + h);
  }
  return Number.isFinite(c) ? { x: w, y: Math.max(p, c + R) } : { x: w, y: p };
}
function A(o, c) {
  const i = _(c), h = o.map(S), l = new Set(h.filter((e) => e !== null));
  if (!(!h.includes(null) && l.size >= 2)) {
    let e = 0, r = 0;
    for (const n of o) {
      const y = f(n);
      e = Math.max(e, y.width), r = Math.max(r, y.height);
    }
    e = e || m.width, r = r || m.height;
    const t = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, o.length))));
    return o.map((n, y) => ({
      x: i.x + y % t * e,
      y: i.y + Math.floor(y / t) * r
    }));
  }
  const g = Array.from(l).sort((e, r) => e - r), u = /* @__PURE__ */ new Map();
  o.forEach((e, r) => {
    const t = h[r];
    u.set(t, Math.max(u.get(t) ?? 0, f(e).width));
  });
  const M = /* @__PURE__ */ new Map();
  let a = i.x;
  for (const e of g)
    M.set(e, a), a += u.get(e) ?? m.width;
  const s = /* @__PURE__ */ new Map();
  return o.map((e, r) => {
    const t = h[r], n = s.get(t) ?? i.y;
    return s.set(t, n + f(e).height), { x: M.get(t) ?? i.x, y: n };
  });
}
function I(o, c, i) {
  const h = _(i), l = Math.max(0, Math.min(c, o.length)), x = [];
  let g = h.x, u = 0;
  for (let t = 0; t < l; t += 1) {
    const n = f(o[t]);
    x.push({ x: g, y: h.y }), g += n.width, u = Math.max(u, n.height);
  }
  const M = l > 0 ? h.y + u + R : h.y;
  let a = 0, s = 0;
  for (let t = l; t < o.length; t += 1) {
    const n = f(o[t]);
    a = Math.max(a, n.width), s = Math.max(s, n.height);
  }
  a = a || m.width, s = s || m.height;
  const e = o.length - l, r = Math.max(1, Math.min(O, e || 1));
  for (let t = 0; t < e; t += 1) {
    const n = Math.floor(t / r), y = t % r;
    x.push({ x: h.x + y * a, y: M + n * s });
  }
  return x;
}
export {
  I as a,
  A as l
};
