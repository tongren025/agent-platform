import { cf as i, cP as N, e3 as C, S as f, dT as p } from "./agentStudioMount-CNVmpr5A.js";
import { h as q, g as D, q as A, a1 as y } from "./scene3dSerializer-CA8L6Op6.js";
import { p as P } from "./scene3dScreenshot-DOK0um5p.js";
import { F as j, f as k, u as F } from "./Gltf-BvT-K_c7.js";
import { S as H, a as T, P as z, M as E, b as O, f as L } from "./scene3dEnvironment-DzZziasL.js";
import { dW as W } from "./scene3dConstants-DlRfsgmW.js";
function B({ state: s }) {
  let t = 0;
  return /* @__PURE__ */ i.jsx(i.Fragment, { children: s.objects.map((e) => {
    if (e.type === "mannequin") {
      const o = /* @__PURE__ */ i.jsx("group", { position: e.position, rotation: e.rotation, scale: e.scale, children: /* @__PURE__ */ i.jsx(E, { color: e.color || "#808080", pose: e.pose }) }, e.id);
      return t += 1, o;
    }
    if (e.type === "mannequinCrowd") {
      const o = t;
      return t += 0, /* @__PURE__ */ i.jsx("group", { position: e.position, rotation: e.rotation, scale: e.scale, children: /* @__PURE__ */ i.jsx(O, { object: e, roleStartIndex: o }) }, e.id);
    }
    return /* @__PURE__ */ i.jsx("group", { position: e.position, rotation: e.rotation, scale: e.scale, visible: e.visible, children: /* @__PURE__ */ i.jsx(L, { object: e }) }, e.id);
  }) });
}
function $({
  state: s,
  onResult: t
}) {
  const { t: e } = C(), { gl: o, scene: l } = k(), m = f.useRef(!1), a = f.useRef(0);
  return F(() => {
    if (m.current || (a.current += 1, a.current < 8)) return;
    m.current = !0;
    const n = s.cameras[0];
    if (!n) {
      t(null);
      return;
    }
    const r = q(n.aspectRatio), u = new W(n.fov, r.width / r.height, n.near, n.far);
    D(u, n);
    const h = A(
      o,
      l,
      u,
      r.width,
      r.height,
      e("scene3d.capture.stagingReference"),
      "scene3d-camera",
      !0
    );
    t(h);
  }), null;
}
function G({
  state: s,
  onResult: t
}) {
  return /* @__PURE__ */ i.jsx("div", { "aria-hidden": !0, style: { position: "absolute", left: -1e4, top: 0, width: 480, height: 270, opacity: 0, pointerEvents: "none" }, children: /* @__PURE__ */ i.jsxs(j, { gl: { preserveDrawingBuffer: !0, antialias: !0 }, camera: { position: [4, 2.4, 5], fov: 45 }, children: [
    /* @__PURE__ */ i.jsx(H, { environment: s.environment, ambientIntensity: 0.7 }),
    /* @__PURE__ */ i.jsx("directionalLight", { position: [4, 6, 5], intensity: 1.1 }),
    /* @__PURE__ */ i.jsx("directionalLight", { position: [-4, 3, -3], intensity: 0.4 }),
    /* @__PURE__ */ i.jsx(T, { fallback: /* @__PURE__ */ i.jsx(z, { color: "#808080" }), children: /* @__PURE__ */ i.jsxs(N.Suspense, { fallback: null, children: [
      /* @__PURE__ */ i.jsx(B, { state: s }),
      /* @__PURE__ */ i.jsx($, { state: s, onResult: t })
    ] }) })
  ] }) });
}
function v(s) {
  const t = s.meta?.stagingAutoCapture;
  return t && typeof t == "object" ? t : null;
}
function I(s, t) {
  const e = s / Math.max(1, t), o = e >= 1.75 ? 420 : e <= 0.72 ? 260 : 340, l = Math.min(520, Math.max(120, Math.round(o / Math.max(0.01, e))));
  return { width: o, height: l, previewHeight: l };
}
function X() {
  const { t: s } = C(), t = p(
    (a) => a.nodes.find((n) => n.kind === "scene3d" && v(n) !== null) ?? null
  ), e = f.useRef(null), o = f.useCallback(
    async (a, n) => {
      const r = p.getState(), u = r.nodes.find((c) => c.id === a), h = u ? v(u) : null, R = () => {
        const c = p.getState().nodes.find((d) => d.id === a);
        if (!c) return;
        const g = { ...c.meta || {} };
        delete g.stagingAutoCapture, p.getState().updateNode(a, { meta: g });
      };
      try {
        if (!u || !n) return;
        const c = await P(n.dataUrl, a, n.title), g = Date.now(), d = r.addNode({
          kind: "image",
          title: s("scene3d.capture.stagingReference"),
          prompt: s("scene3d.capture.stagingPrompt"),
          position: { x: Math.round(u.position.x + 380), y: Math.round(u.position.y) }
        }), x = I(n.width, n.height), S = {
          id: `staging-shot-${d.id}-${g}`,
          type: "image",
          url: c.url,
          assetId: c.assetId,
          raw: c.raw,
          createdAt: g
        };
        r.updateNode(d.id, {
          result: S,
          history: [S],
          status: "success",
          size: { width: x.width, height: x.height },
          meta: {
            ...d.meta || {},
            source: n.source,
            sourceNodeId: a,
            // 标记为站位构图图：被当 composition_ref 喂关键帧时，触发「构图控制+写实重渲染」prompt 后缀。
            stagingComposition: !0,
            localOnly: c.localOnly,
            imageWidth: n.width,
            imageHeight: n.height,
            imageAspectRatio: n.width / Math.max(1, n.height),
            previewHeight: x.previewHeight
          }
        }), r.connectNodes(a, d.id, "reference"), h?.targetNodeId && r.connectNodes(d.id, h.targetNodeId, "composition_ref");
        const w = p.getState().nodes.find((M) => M.id === a);
        r.updateNode(a, {
          meta: {
            ...w?.meta || u.meta || {},
            scene3dState: { ...y(w?.meta?.scene3dState), lastThumbnail: c.url }
          }
        });
      } finally {
        R(), e.current = null;
      }
    },
    [s]
  );
  if (!t || e.current && e.current !== t.id) return null;
  e.current = t.id;
  const l = y(t.meta?.scene3dState), m = t.id;
  return /* @__PURE__ */ i.jsx(G, { state: l, onResult: (a) => {
    o(m, a);
  } });
}
export {
  X as StagingCaptureHost
};
