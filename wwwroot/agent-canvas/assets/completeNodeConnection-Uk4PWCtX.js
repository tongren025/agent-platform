import { b$ as I, bZ as N, dW as p, c3 as f, ce as v } from "./agentStudioMount-D0_EKHTh.js";
import { r as x, b as S } from "./referenceSlots-D8z8-IQO.js";
import { s as H } from "./showInfoToast-C9_I4JQX.js";
const b = ["character-card", "scene-card", "prop-card", "audio-strip", "whiteboard-card"];
function F(e) {
  if (e.kind === "asset") return;
  const t = e.renderKind;
  if (t) return t;
  if (e.kind === "whiteboard") return "whiteboard-card";
  if (e.kind === "audio") return "audio-strip";
  if (e.kind === "character") return "character-card";
  if (e.kind === "scene") return "scene-card";
  if (e.categoryId === "cast") return "character-card";
  if (e.categoryId === "scene") return "scene-card";
  if (e.categoryId === "prop") return "prop-card";
  if (e.categoryId === "audio") return "audio-strip";
}
function W(e) {
  return b.includes(e);
}
async function j(e, t) {
  try {
    const i = await I(e, e.name || "asset", { ownerNodeId: t });
    return N(i) || null;
  } catch {
    return null;
  }
}
function q(e, t) {
  const i = /^data:([^;,]*?)(;base64)?,(.*)$/s.exec(e);
  if (!i) return null;
  const s = i[1] || "image/png", r = !!i[2], o = i[3];
  try {
    let c;
    if (r) {
      const a = atob(o);
      c = new Uint8Array(a.length);
      for (let n = 0; n < a.length; n += 1) c[n] = a.charCodeAt(n);
    } else {
      const a = decodeURIComponent(o);
      c = new Uint8Array(a.length);
      for (let n = 0; n < a.length; n += 1) c[n] = a.charCodeAt(n);
    }
    return new File([c], t, { type: s });
  } catch {
    return null;
  }
}
const J = {
  queued: "排队中",
  running: "生成中",
  error: "生成失败"
}, Q = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw"
], D = 240, M = 680, R = 120, A = 520, y = 280, C = 680, z = 200, k = 800;
function P(e) {
  return e === "text" ? {
    minWidth: y,
    maxWidth: C,
    minHeight: z,
    maxHeight: k
  } : {
    minWidth: D,
    maxWidth: M,
    minHeight: R,
    maxHeight: A
  };
}
const T = ".workbench-timeline-track__clips", Y = "nomi-focus-generation-node";
function g(e, t, i) {
  return Math.max(t, Math.min(i, e));
}
function E(e) {
  const t = typeof e == "number" ? e : typeof e == "string" ? Number(e) : NaN;
  return Number.isFinite(t) && t > 0 ? t : null;
}
function O(e) {
  return e >= 1.75 ? 420 : e <= 0.72 ? 260 : 340;
}
function U(e, t, i) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0)
    return null;
  const s = e / t, r = g(
    i || O(s),
    240,
    680
  ), o = g(
    Math.round(r / s),
    120,
    520
  );
  return {
    width: r,
    height: o,
    previewHeight: o
  };
}
function ee(e) {
  const { resultType: t, meta: i, currentSize: s, width: r, height: o, durationSeconds: c } = e, a = U(r, o, s?.width);
  if (!a) return null;
  const n = t === "video", d = E(i.imageWidth ?? i.videoWidth), h = E(i.imageHeight ?? i.videoHeight), u = E(i.videoDuration), l = i.userResized === !0, m = n && Number.isFinite(c) && c > 0 ? Math.round(c * 1e3) / 1e3 : null, w = n ? {
    videoWidth: r,
    videoHeight: o,
    videoAspectRatio: r / o,
    ...m !== null ? { videoDuration: m } : {}
  } : { imageWidth: r, imageHeight: o, imageAspectRatio: r / o }, _ = !l && (s?.width !== a.width || s?.height !== a.height);
  return d === r && h === o && (m === null || u === m) && !_ ? null : {
    ..._ ? { size: { width: a.width, height: a.height } } : {},
    meta: { ...i, ...w, previewHeight: a.previewHeight }
  };
}
const L = {
  "character-card": 200,
  "scene-card": 320,
  "prop-card": 200,
  "audio-strip": 420
}, X = {
  "character-card": null,
  // 动态：宽/比例
  "scene-card": null,
  "prop-card": null,
  "audio-strip": 80
};
function G(e, t) {
  return !t || !e ? { width: null, height: null } : {
    width: L[e] ?? null,
    height: X[e] ?? null
  };
}
function K(e) {
  const {
    node: t,
    hasResult: i,
    isCardKind: s,
    cardFixedWidth: r,
    cardFixedHeight: o,
    storedPreviewHeight: c,
    sizeWidth: a,
    sizeHeight: n,
    bounds: d
  } = e, h = i || s ? null : x(t), u = h ? g(
    Math.round(
      (r ?? Math.max(d.minWidth, a)) / h
    ),
    d.minHeight,
    d.maxHeight
  ) : null;
  return o ?? c ?? u ?? g(n, d.minHeight, d.maxHeight);
}
const B = { width: 320, height: 360 };
function te(e) {
  const t = e.size || B, i = F(e), s = W(i), r = P(e.kind), { width: o, height: c } = G(i, s), a = !!e.result?.url, n = e.kind === "image" && typeof e.meta?.source == "string" && e.meta.source.startsWith("image-grid-split-"), d = typeof e.meta?.previewHeight == "number" && Number.isFinite(e.meta.previewHeight) ? n ? Math.max(1, Math.round(e.meta.previewHeight)) : g(Math.round(e.meta.previewHeight), r.minHeight, r.maxHeight) : null, h = K({
    node: e,
    hasResult: a,
    isCardKind: s,
    cardFixedWidth: o,
    cardFixedHeight: c,
    storedPreviewHeight: d,
    sizeWidth: t.width,
    sizeHeight: t.height,
    bounds: r
  });
  return {
    width: o ?? Math.max(r.minWidth, t.width),
    height: h
  };
}
function ie(e, t) {
  if (typeof document.elementsFromPoint == "function") {
    const s = document.elementsFromPoint(e, t);
    for (const r of s) {
      const o = r.closest(T);
      if (o instanceof HTMLElement) return o;
    }
    return null;
  }
  const i = document.elementFromPoint(e, t);
  return i ? i.closest(T) : null;
}
function ne(e) {
  const t = p.getState().pendingConnectionSourceId, i = p.getState().connectToNode(e);
  if (!i.ok && i.reason === "source_not_referenceable") {
    H(f.t("connection.sourceUnavailable"));
    return;
  }
  if (!i.ok && i.reason === "unsupported_reference") {
    H(f.t("connection.unsupported"));
    return;
  }
  if (i.ok && t) {
    const { nodes: s, edges: r } = p.getState(), o = s.find((n) => n.id === t), c = s.find((n) => n.id === e);
    if (o && c && r.some(
      (n) => n.source === t && n.target === e && v(o, c, n.mode)
    )) return;
    if (c) {
      const n = S(c, s, r), d = n.some((u) => u.fills.some((l) => l.origin.type === "edge" && l.origin.sourceNodeId === t));
      if (r.some((u) => u.source === t && u.target === e) && !d) {
        const u = n.reduce((l, m) => Math.max(l, m.max), 0);
        H(
          u > 0 ? f.t("connection.slotsFull", { max: u }) : f.t("connection.referenceFull")
        );
      }
    }
  }
}
export {
  Y as F,
  A as M,
  Q as R,
  J as S,
  M as a,
  R as b,
  D as c,
  g as d,
  ne as e,
  ee as f,
  q as g,
  ie as h,
  P as i,
  W as j,
  te as k,
  U as m,
  j as p,
  F as r
};
