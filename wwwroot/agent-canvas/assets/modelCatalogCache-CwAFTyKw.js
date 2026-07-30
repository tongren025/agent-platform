import { bX as i, ao as E, bL as k, cd as _, ce as z } from "./agentStudioMount-CP7x4OcS.js";
function A(e) {
  return e === "image" || e === "imageEdit" ? "image" : e === "video" ? "video" : e === "audio" ? "audio" : "text";
}
function D(e) {
  if (e instanceof Error) {
    const a = e.message.trim();
    return e instanceof TypeError || /failed to fetch|networkerror|load failed|fetch failed/i.test(a) ? new Error(i.t("runtime.modelCatalog.desktopUnavailable")) : e;
  }
  return new Error(i.t("runtime.modelCatalog.loadFailed"));
}
function P(e) {
  if (e.loading)
    return { status: "loading", message: i.t("runtime.modelCatalog.loading") };
  if (e.error)
    return {
      status: "api_unreachable",
      message: i.t("runtime.modelCatalog.loadFailedWithMessage", { message: e.error.message })
    };
  if (e.healthError)
    return {
      status: "api_unreachable",
      message: i.t("runtime.modelCatalog.healthFailed", { message: e.healthError.message })
    };
  const a = A(e.kind), o = e.health;
  if (o?.issues.some((t) => t.code === "catalog_empty" && t.severity === "error"))
    return { status: "catalog_empty", message: i.t("runtime.modelCatalog.empty") };
  const n = o?.byKind.find((t) => t.kind === a);
  if (n && n.enabledModels === 0) {
    const t = i.t(`runtime.modelCatalog.kind.${a}`);
    return { status: "kind_empty", message: i.t("runtime.modelCatalog.noKind", { kind: t }) };
  }
  if (o?.issues.some(
    (t) => t.severity === "error" && (t.kind === a || typeof t.kind > "u")
  ))
    return { status: "incomplete", message: i.t("runtime.modelCatalog.incomplete") };
  if (e.options.length === 0) {
    const t = i.t(`runtime.modelCatalog.kind.${a}`);
    return { status: "kind_empty", message: i.t("runtime.modelCatalog.noKind", { kind: t }) };
  }
  return { status: "ready", message: i.t("runtime.modelCatalog.ready") };
}
function f(e) {
  return e ? e.startsWith("models/") ? e.slice(7) : e : "";
}
function g(e) {
  return typeof e == "string" ? e.trim() : "";
}
function R(e, a) {
  const o = g(a), n = f(o);
  return o && e.find((t) => {
    const r = g(t.value), l = g(t.modelKey), d = g(t.modelAlias), m = f(r), s = f(l), y = f(d);
    return o === r || o === l || o === d || n === m || n === s || n === y;
  }) || null;
}
function L(e) {
  if (!e) return;
  const a = typeof e.cost == "number" && Number.isFinite(e.cost) ? Math.max(0, Math.floor(e.cost)) : 0, o = Array.isArray(e.specCosts) ? e.specCosts.map((n) => {
    const t = typeof n?.specKey == "string" ? n.specKey.trim() : "";
    if (!t) return null;
    const r = typeof n.cost == "number" && Number.isFinite(n.cost) ? Math.max(0, Math.floor(n.cost)) : 0;
    return {
      specKey: t,
      cost: r,
      enabled: typeof n.enabled == "boolean" ? n.enabled : !0
    };
  }).filter((n) => n !== null) : [];
  return {
    cost: a,
    enabled: typeof e.enabled == "boolean" ? e.enabled : !0,
    specCosts: o
  };
}
function O(e) {
  if (!Array.isArray(e)) return [];
  const a = /* @__PURE__ */ new Map();
  for (const t of e) {
    const r = typeof t?.modelKey == "string" ? t.modelKey.trim() : "";
    if (!r) continue;
    const l = r.toLowerCase();
    a.set(l, (a.get(l) || 0) + 1);
  }
  const o = /* @__PURE__ */ new Set(), n = [];
  for (const t of e) {
    const r = typeof t?.modelAlias == "string" ? t.modelAlias.trim() : "", l = typeof t?.modelKey == "string" ? t.modelKey.trim() : "", d = typeof t?.vendorKey == "string" ? t.vendorKey.trim() : "", m = l || r, s = m && (a.get(m.toLowerCase()) || 0) > 1 ? `${d}::${m}` : m;
    if (!s || o.has(s)) continue;
    o.add(s);
    const p = (typeof t?.labelZh == "string" ? t.labelZh.trim() : "") || r || s, c = E({ modelKey: l || s, modelAlias: r, vendorKey: d, meta: t?.meta }), u = c ? { ...t?.meta && typeof t.meta == "object" ? t.meta : {}, parameterControls: c } : t?.meta;
    n.push({
      value: s,
      label: p,
      vendor: d || void 0,
      modelKey: l || s,
      modelAlias: r || null,
      meta: u,
      pricing: L(t?.pricing)
    });
  }
  return n;
}
const V = "nomi-models-refresh", M = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
let w = null, h = null, K = null, C = null, v = null;
const S = /^(gemini-.*-image(?:-(?:landscape|portrait))?|imagen-.*-(?:landscape|portrait))$/i;
function H(e, a) {
  return a !== "image" && a !== "imageEdit" ? e : e.filter((o) => {
    const n = f(o.value);
    if (!S.test(n)) return !0;
    const t = f(g(o.modelAlias));
    return !!(t && t !== n);
  });
}
function I() {
  M.clear(), b.clear(), w = null, h = null, K = null, C = null, v = null;
}
async function W() {
  return w || (h || (h = (async () => {
    try {
      const e = await k();
      return w = e, e;
    } finally {
      h = null;
    }
  })()), h);
}
function $(e) {
  I(), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent(V, { detail: e }));
}
async function N() {
  return K || (C || (C = (async () => {
    try {
      const e = await z(), a = new Set(
        (Array.isArray(e) ? e : []).filter((n) => !!n?.enabled && (n?.authType === "none" || !!n?.hasApiKey)).map((n) => String(n?.key || "").trim().toLowerCase()).filter(Boolean)
      ), o = /* @__PURE__ */ new Map();
      for (const n of Array.isArray(e) ? e : []) {
        const t = String(n?.key || "").trim().toLowerCase(), r = String(n?.name || "").trim();
        t && r && o.set(t, r);
      }
      return v = o, K = a, a;
    } finally {
      C = null;
    }
  })()), C);
}
async function B(e) {
  const a = A(e), o = a, n = M.get(o);
  if (n) return n;
  const t = b.get(o);
  if (t) return t;
  const r = (async () => {
    try {
      const l = await _({ kind: a, enabled: !0 }), d = await N(), m = (Array.isArray(l) ? l : []).filter((c) => {
        const u = String(c?.vendorKey || "").trim().toLowerCase();
        return u ? d.size ? d.has(u) : !0 : !1;
      }), s = O(m), y = v, p = y ? s.map((c) => {
        const u = c.vendor ? y.get(c.vendor.toLowerCase()) : void 0;
        return u ? { ...c, vendorName: u } : c;
      }) : s;
      return M.set(o, p), p;
    } finally {
      b.delete(o);
    }
  })();
  return b.set(o, r), r;
}
async function x(e) {
  const a = await B(e);
  return H(a, e);
}
export {
  V as M,
  $ as a,
  P as d,
  R as f,
  W as g,
  D as n,
  x as p
};
