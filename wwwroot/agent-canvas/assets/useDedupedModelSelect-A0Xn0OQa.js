import { aR as L, cH as f, S as v } from "./agentStudioMount-DueN8bR4.js";
import { M as h, p as k, n as y, g as O, d as R } from "./modelCatalogCache-TPMAM11p.js";
const V = [["path", { d: "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6", key: "svg-0" }], ["path", { d: "M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", key: "svg-1" }], ["path", { d: "M8 11v-5a4 4 0 0 1 8 0", key: "svg-2" }]], F = L("outline", "lock-open", "LockOpen", V);
function x(e) {
  const [o, a] = f.useState([]), [n, t] = f.useState(null), [i, s] = f.useState(null), [p, r] = f.useState(null), [l, c] = f.useState(!0), [m, b] = f.useState(0);
  f.useEffect(() => {
    a([]), t(null), s(null), r(null), c(!0);
  }, [e]), f.useEffect(() => {
    if (typeof window > "u") return;
    const d = () => b((u) => u + 1);
    return window.addEventListener(h, d), () => window.removeEventListener(h, d);
  }, []), f.useEffect(() => {
    let d = !1;
    return c(!0), (async () => {
      try {
        const u = await k(e);
        d || (t(null), a(u));
      } catch (u) {
        d || (t(y(u)), a([]), s(null), r(null));
      }
      try {
        const u = await O();
        d || (r(u), s(null));
      } catch (u) {
        d || (r(null), s(y(u)));
      }
      d || c(!1);
    })(), () => {
      d = !0;
    };
  }, [e, m]);
  const g = R({ kind: e, options: o, health: p, error: n, healthError: i, loading: l });
  return {
    options: o,
    error: n,
    healthError: i,
    loading: l,
    health: p,
    status: g.status,
    statusMessage: g.message
  };
}
const I = /\s*[·•・]\s*(文生图|图生图|改图|文生视频|图生视频|首尾帧|参考图?|编辑).*$/u;
function S(e) {
  return e?.meta && typeof e.meta == "object" ? e.meta : {};
}
function K(e) {
  return e.replace(I, "").trim().toLowerCase().replace(/\s+/g, " ");
}
function _(e) {
  const o = S(e), a = typeof o.canonicalModelId == "string" ? o.canonicalModelId.trim() : "";
  if (a) return a;
  const n = typeof e?.label == "string" ? e.label : "", t = K(n);
  return t || (e?.value || e?.modelKey || "").trim();
}
function M(e) {
  const o = S(e);
  return typeof o.archetypeId == "string" && o.archetypeId.trim().length > 0;
}
const A = /* @__PURE__ */ new Set([
  "volcengine",
  "modelscope",
  "openai",
  "anthropic",
  "claude",
  "gemini",
  "google",
  "deepseek",
  "dashscope",
  "zhipu",
  "moonshot",
  "kimi",
  "siliconflow",
  "groq",
  "openrouter"
]), C = /* @__PURE__ */ new Set(["apimart", "kie", "newapi"]);
function E(e) {
  const o = (e || "").toLowerCase();
  return A.has(o) ? 0 : C.has(o) ? 1 : 2;
}
function z(e, o = {}) {
  const a = e.providers.filter(
    (n) => !o.usableVendorKeys || n.vendor != null && o.usableVendorKeys.has(n.vendor)
  );
  if (a.length === 0) return null;
  if (o.lockedVendorKey) {
    const n = a.find((t) => t.vendor === o.lockedVendorKey);
    if (n) return n;
  }
  return a.reduce((n, t) => E(t.vendor) < E(n.vendor) ? t : n, a[0]);
}
function H(e) {
  if (!Array.isArray(e)) return [];
  const o = /* @__PURE__ */ new Map(), a = [];
  for (const n of e) {
    if (!n) continue;
    const t = _(n);
    if (!t) continue;
    const i = {
      vendor: n.vendor,
      modelKey: n.modelKey,
      modelAlias: n.modelAlias ?? null,
      option: n
    }, s = o.get(t);
    if (s) {
      s.providers.some((r) => r.vendor === i.vendor && r.modelKey === i.modelKey) || s.providers.push(i), s.recognized = s.recognized || M(n);
      continue;
    }
    o.set(t, {
      canonicalId: t,
      // 展示名去能力后缀（kie 把 GPT Image 2 拆「· 文生图/· 图生图」两行，合并成一条后
      // 不该带着首家的后缀当组名）；无后缀的 label 原样。
      label: (n.label || t).replace(I, "").trim() || t,
      recognized: M(n),
      providers: [i]
    }), a.push(t);
  }
  return a.map((n) => o.get(n));
}
const N = {
  volcengine: "火山方舟",
  "volcengine-speech": "火山语音",
  modelscope: "魔搭",
  apimart: "APIMart",
  kie: "Kie",
  newapi: "new-api",
  runninghub: "RunningHub",
  agnes: "Agnes",
  replicate: "Replicate",
  dreamina: "即梦",
  "comfyui-local": "本地 ComfyUI"
};
function w(e) {
  if (!e) return "默认";
  const o = e.vendor ? N[e.vendor.toLowerCase()] : void 0;
  if (o) return o;
  const a = e.option.vendorName?.trim();
  return a || e.vendor || "默认";
}
function B(e, o, a) {
  const n = v.useMemo(() => H([...e]), [e]), t = v.useMemo(
    () => n.find((r) => r.providers.some((l) => l.option.value === o)) || null,
    [n, o]
  ), i = v.useMemo(
    () => n.map((r) => ({
      value: r.canonicalId,
      label: r.label,
      // 厂商标注（用户 2026-07-17：模型来自哪家要看得见）：多家=「N 家」，单家=厂商短名。
      trailing: r.providers.length > 1 ? `${r.providers.length} 家` : w(r.providers[0])
    })),
    [n]
  ), s = v.useCallback(
    (r) => {
      const l = n.find((m) => m.canonicalId === r);
      if (!l) return;
      const c = z(l);
      c && a(c.option.value);
    },
    [n, a]
  ), p = v.useMemo(() => {
    if (!t || t.providers.length <= 1) return [];
    const r = /* @__PURE__ */ new Map();
    for (const l of t.providers) {
      const c = l.vendor || l.option.value;
      r.has(c) || r.set(c, { value: l.option.value, label: w(l) });
    }
    return r.size > 1 ? [...r.values()] : [];
  }, [t]);
  return {
    modelOptions: i,
    modelValue: t?.canonicalId || "",
    onModelPick: s,
    providerOptions: p,
    providerValue: o,
    onProviderPick: a,
    selectedModel: t
  };
}
export {
  F as I,
  x as a,
  B as u
};
