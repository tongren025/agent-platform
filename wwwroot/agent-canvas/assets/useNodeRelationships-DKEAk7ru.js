import { aR as h, dK as d } from "./agentStudioMount-C42uVxj4.js";
const m = [["path", { d: "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0", key: "svg-0" }], ["path", { d: "M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6", key: "svg-1" }]], y = h("outline", "eye", "Eye", m), f = /* @__PURE__ */ new WeakMap();
function M(t, e) {
  const n = f.get(e);
  if (n) return n;
  const o = /* @__PURE__ */ new Set();
  for (const r of t)
    (r.categoryId || "shots") === "shots" && o.add(r.id);
  const s = /* @__PURE__ */ new Map();
  for (const r of e) {
    if (!o.has(r.target)) continue;
    let a = s.get(r.source);
    a || (a = /* @__PURE__ */ new Set(), s.set(r.source, a)), a.add(r.target);
  }
  return f.set(e, s), s;
}
function l(t, e, n) {
  return M(e, n).get(t)?.size ?? 0;
}
function S(t, e) {
  return d((n) => l(t, n.nodes, n.edges));
}
const g = /* @__PURE__ */ new WeakMap();
function k(t, e) {
  const n = g.get(e);
  if (n) return n;
  const o = new Map(t.map((a) => [a.id, a])), s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const a of e) {
    const c = o.get(a.source);
    if (!c || c.kind !== "character" && c.kind !== "scene") continue;
    let u = r.get(a.target);
    if (u || (u = /* @__PURE__ */ new Set(), r.set(a.target, u)), u.has(c.id)) continue;
    u.add(c.id);
    let i = s.get(a.target);
    i || (i = [], s.set(a.target, i)), i.push({ id: c.id, title: c.title || (c.kind === "character" ? "角色" : "场景"), kind: c.kind });
  }
  return g.set(e, s), s;
}
const w = [];
function C(t, e, n) {
  return k(e, n).get(t) ?? w;
}
function _(t) {
  return d((e) => C(t, e.nodes, e.edges));
}
const p = /* @__PURE__ */ new WeakMap();
function I(t) {
  const e = p.get(t);
  if (e) return e;
  const n = /* @__PURE__ */ new Map();
  for (const o of t) {
    const s = o.derivedFrom || o.regeneratedFrom;
    s && n.set(s, (n.get(s) || 0) + 1);
  }
  return p.set(t, n), n;
}
function v(t) {
  return d((e) => I(e.nodes).get(t) || 0);
}
function E(t, e) {
  return d(
    (n) => e && n.edges.some(
      (o) => o.target === t && (!o.mode || o.mode === "first_frame" || o.mode === "last_frame" || o.mode === "reference")
    )
  );
}
function x(t, e) {
  return d((n) => {
    if (e !== "shots") return null;
    const o = n.nodes.find((s) => s.id === t);
    return typeof o?.shotIndex == "number" ? o.shotIndex : null;
  });
}
export {
  y as I,
  _ as a,
  S as b,
  v as c,
  x as d,
  C as l,
  E as u
};
