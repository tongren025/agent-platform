import { bX as s, ao as E, bL as k, cd as _, ce as z } from "./agentStudioMount-C42uVxj4.js";
function A(e) {
  return e === "image" || e === "imageEdit" ? "image" : e === "video" ? "video" : e === "audio" ? "audio" : "text";
}
function D(e) {
  if (e instanceof Error) {
    const a = e.message.trim();
    return e instanceof TypeError || /failed to fetch|networkerror|load failed|fetch failed/i.test(a) ? new Error(s.t("runtime.modelCatalog.desktopUnavailable")) : e;
  }
  return new Error(s.t("runtime.modelCatalog.loadFailed"));
}
function P(e) {
  if (e.loading)
    return { status: "loading", message: s.t("runtime.modelCatalog.loading") };
  if (e.error)
    return {
      status: "api_unreachable",
      message: s.t("runtime.modelCatalog.loadFailedWithMessage", { message: e.error.message })
    };
  if (e.healthError)
    return {
      status: "api_unreachable",
      message: s.t("runtime.modelCatalog.healthFailed", { message: e.healthError.message })
    };
  const a = A(e.kind), o = e.health;
  if (o?.issues.some((n) => n.code === "catalog_empty" && n.severity === "error"))
    return { status: "catalog_empty", message: s.t("runtime.modelCatalog.empty") };
  const t = o?.byKind.find((n) => n.kind === a);
  if (t && t.enabledModels === 0) {
    const n = s.t(`runtime.modelCatalog.kind.${a}`);
    return { status: "kind_empty", message: s.t("runtime.modelCatalog.noKind", { kind: n }) };
  }
  if (o?.issues.some(
    (n) => n.severity === "error" && (n.kind === a || typeof n.kind > "u")
  ))
    return { status: "incomplete", message: s.t("runtime.modelCatalog.incomplete") };
  if (e.options.length === 0) {
    const n = s.t(`runtime.modelCatalog.kind.${a}`);
    return { status: "kind_empty", message: s.t("runtime.modelCatalog.noKind", { kind: n }) };
  }
  return { status: "ready", message: s.t("runtime.modelCatalog.ready") };
}
function u(e) {
  return e ? e.startsWith("models/") ? e.slice(7) : e : "";
}
function g(e) {
  return typeof e == "string" ? e.trim() : "";
}
function R(e, a) {
  const o = g(a), t = u(o);
  return o && e.find((n) => {
    const r = g(n.value), l = g(n.modelKey), c = g(n.modelAlias), f = u(r), i = u(l), d = u(c);
    return o === r || o === l || o === c || t === f || t === i || t === d;
  }) || null;
}
function O(e) {
  if (!e) return;
  const a = typeof e.cost == "number" && Number.isFinite(e.cost) ? Math.max(0, Math.floor(e.cost)) : 0, o = Array.isArray(e.specCosts) ? e.specCosts.map((t) => {
    const n = typeof t?.specKey == "string" ? t.specKey.trim() : "";
    if (!n) return null;
    const r = typeof t.cost == "number" && Number.isFinite(t.cost) ? Math.max(0, Math.floor(t.cost)) : 0;
    return {
      specKey: n,
      cost: r,
      enabled: typeof t.enabled == "boolean" ? t.enabled : !0
    };
  }).filter((t) => t !== null) : [];
  return {
    cost: a,
    enabled: typeof e.enabled == "boolean" ? e.enabled : !0,
    specCosts: o
  };
}
function V(e) {
  if (!Array.isArray(e)) return [];
  const a = /* @__PURE__ */ new Set(), o = [];
  for (const t of e) {
    const n = typeof t?.modelAlias == "string" ? t.modelAlias.trim() : "", r = typeof t?.modelKey == "string" ? t.modelKey.trim() : "", l = r || n;
    if (!l || a.has(l)) continue;
    a.add(l);
    const f = (typeof t?.labelZh == "string" ? t.labelZh.trim() : "") || n || l, i = typeof t?.vendorKey == "string" ? t.vendorKey : void 0, d = E({ modelKey: r || l, modelAlias: n, vendorKey: i, meta: t?.meta }), b = d ? { ...t?.meta && typeof t.meta == "object" ? t.meta : {}, parameterControls: d } : t?.meta;
    o.push({
      value: l,
      label: f,
      vendor: i,
      modelKey: r || l,
      modelAlias: n || null,
      meta: b,
      pricing: O(t?.pricing)
    });
  }
  return o;
}
const S = "nomi-models-refresh", K = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
let w = null, h = null, M = null, C = null, v = null;
const L = /^(gemini-.*-image(?:-(?:landscape|portrait))?|imagen-.*-(?:landscape|portrait))$/i;
function H(e, a) {
  return a !== "image" && a !== "imageEdit" ? e : e.filter((o) => {
    const t = u(o.value);
    if (!L.test(t)) return !0;
    const n = u(g(o.modelAlias));
    return !!(n && n !== t);
  });
}
function I() {
  K.clear(), p.clear(), w = null, h = null, M = null, C = null, v = null;
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
function x(e) {
  I(), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent(S, { detail: e }));
}
async function N() {
  return M || (C || (C = (async () => {
    try {
      const e = await z(), a = new Set(
        (Array.isArray(e) ? e : []).filter((t) => !!t?.enabled && (t?.authType === "none" || !!t?.hasApiKey)).map((t) => String(t?.key || "").trim().toLowerCase()).filter(Boolean)
      ), o = /* @__PURE__ */ new Map();
      for (const t of Array.isArray(e) ? e : []) {
        const n = String(t?.key || "").trim().toLowerCase(), r = String(t?.name || "").trim();
        n && r && o.set(n, r);
      }
      return v = o, M = a, a;
    } finally {
      C = null;
    }
  })()), C);
}
async function B(e) {
  const a = A(e), o = a, t = K.get(o);
  if (t) return t;
  const n = p.get(o);
  if (n) return n;
  const r = (async () => {
    try {
      const l = await _({ kind: a, enabled: !0 }), c = await N(), f = (Array.isArray(l) ? l : []).filter((m) => {
        const y = String(m?.vendorKey || "").trim().toLowerCase();
        return y ? c.size ? c.has(y) : !0 : !1;
      }), i = V(f), d = v, b = d ? i.map((m) => {
        const y = m.vendor ? d.get(m.vendor.toLowerCase()) : void 0;
        return y ? { ...m, vendorName: y } : m;
      }) : i;
      return K.set(o, b), b;
    } finally {
      p.delete(o);
    }
  })();
  return p.set(o, r), r;
}
async function Z(e) {
  const a = await B(e);
  return H(a, e);
}
export {
  S as M,
  x as a,
  P as d,
  R as f,
  W as g,
  D as n,
  Z as p
};
