import { cf as Y, bh as me, aj as Z, aW as fe, S as p, e6 as ee, dW as T, e7 as pe, cI as he, dJ as W, ci as u, ay as ge, aL as w, J as Se, cj as ye } from "./agentStudioMount-BaWK4RwX.js";
import { I as q } from "./IconCube-Dk7v7SCp.js";
import { I as be } from "./IconMinimize-Dcrjml9I.js";
import { D as je, E as Te } from "./BaseGenerationNode-BP2r8pST.js";
import { v as K, k as te, j as ve, C as B, B as ne, z as ke, a1 as E } from "./scene3dSerializer-CA8L6Op6.js";
import { p as xe } from "./scene3dScreenshot-DvsOqrNj.js";
import { eT as D, c8 as Ne } from "./scene3dConstants-DlRfsgmW.js";
import { c as Me, l as Ie } from "./timelineDragPayload-ClILhAtN.js";
const G = 0.01, Ce = 0.25, H = 2, Fe = 240;
function $(e, t) {
  const r = e[0] - t[0], i = e[1] - t[1], n = e[2] - t[2];
  return r * r + i * i + n * n;
}
function _(e, t, r) {
  if (e.length < 2) return null;
  const i = e[0].time, a = e[e.length - 1].time - i, s = [];
  for (const l of e) {
    const h = s[s.length - 1];
    (!h || $(h.position, l.position) >= G) && s.push(l);
  }
  const c = e[e.length - 1];
  if (s[s.length - 1] !== c && $(s[s.length - 1].position, c.position) >= G && s.push(c), s.length < 2) return null;
  const f = s.map((l, h) => {
    let S;
    return h === 0 ? S = 0 : h === s.length - 1 ? S = 1 : S = a > 0 ? (l.time - i) / a : h / (s.length - 1), {
      id: B(),
      position: [...l.position],
      timeRatio: S
    };
  });
  return {
    id: ne(),
    name: r,
    points: f,
    tension: 0.5,
    closed: !1,
    color: t
  };
}
function P(e, t, r, i) {
  return {
    id: ke(),
    trajectoryId: e,
    objects: [{ objectId: t, offsetRatio: 0 }],
    startTime: r,
    endTime: i,
    direction: "forward"
  };
}
function Ze(e, t) {
  return Math.max(Ce, (t - e) / 1e3);
}
function Ae(e, t) {
  const r = Math.round(e * t);
  return Number.isFinite(r) ? Math.min(Fe, Math.max(H, r)) : H;
}
function we(e, t, r, i) {
  const n = te(e), a = r.filter(
    (d) => d.objects.some((y) => y.objectId === e || y.objectId === n)
  );
  if (a.length === 0) return null;
  const s = new Set(a.map((d) => d.trajectoryId)), c = t.filter((d) => s.has(d.id));
  if (c.length === 0) return null;
  const f = a.some((d) => d.objects.some((y) => y.objectId === n)), l = Math.min(...a.map((d) => d.startTime)), S = Math.max(...a.map((d) => d.endTime)) - l, M = (d) => S > 0 ? (d - l) / S * i : 0, v = a.map((d) => ({
    ...d,
    startTime: M(d.startTime),
    endTime: M(d.endTime)
  }));
  return { trajectories: c, bindings: v, hasAim: f };
}
function et(e, t) {
  const r = K(e), i = r.objects.find((l) => l.id === t.possessedObjectId);
  if (!i) return null;
  const n = _(
    t.characterSamples,
    D[0],
    `${i.name} 走位`
  );
  if (!n) return null;
  const a = ve(t.poseEvents ?? []);
  i.poseTrack = a.length >= 2 ? a : void 0, i.locomotionClip = Ne;
  const s = [n], c = [
    P(n.id, i.id, 0, t.durationSeconds)
  ], f = r.cameras[0];
  if (f) {
    const l = we(f.id, r.trajectories, r.trajectoryBindings, t.durationSeconds);
    if (l)
      s.push(...l.trajectories), c.push(...l.bindings), f.followTargetId = l.hasAim ? void 0 : i.id;
    else {
      f.followTargetId = i.id;
      const h = _(
        t.cameraSamples,
        D[2],
        "机位路径"
      );
      h && (s.push(h), c.push(P(h.id, f.id, 0, t.durationSeconds)));
    }
  }
  return {
    ...r,
    trajectories: s,
    trajectoryBindings: c,
    trajectoryGroups: [],
    sceneTimeline: { totalDuration: t.durationSeconds }
  };
}
function De(e, t, r) {
  if (e.length < 2) return null;
  const i = e[0], n = e[e.length - 1];
  return {
    id: ne(),
    name: r,
    points: [
      { id: B(), position: [...i.position], timeRatio: 0 },
      { id: B(), position: [...n.position], timeRatio: 1 }
    ],
    tension: 0.5,
    closed: !1,
    color: t
  };
}
function tt(e, t) {
  const r = K(e), i = r.cameras.findIndex((l) => l.id === t.possessedCameraId);
  if (i < 0) return null;
  if (i > 0) {
    const [l] = r.cameras.splice(i, 1);
    r.cameras.unshift(l);
  }
  const n = r.cameras[0], a = _(t.targetSamples, D[1], "镜头朝向"), s = _(t.cameraSamples, D[2], "运镜路径") ?? (a ? De(t.cameraSamples, D[2], "运镜路径") : null);
  if (!s && !a || !s) return null;
  const c = [s], f = [
    P(s.id, n.id, 0, t.durationSeconds)
  ];
  return n.followTargetId = void 0, n.aimTrajectoryId = void 0, a && (c.push(a), f.push(P(a.id, te(n.id), 0, t.durationSeconds)), n.aimTrajectoryId = a.id), {
    ...r,
    trajectories: c,
    trajectoryBindings: f,
    trajectoryGroups: [],
    sceneTimeline: { totalDuration: t.durationSeconds }
  };
}
function J(e) {
  return typeof e != "string" ? null : e.trim() || null;
}
function Ee(e) {
  const t = e.meta?.cameraMoveVideo, r = t && typeof t == "object" ? J(t.url) : null;
  if (r) return { kind: "video", url: r };
  const i = J(E(e.meta?.scene3dState).lastThumbnail);
  return i ? { kind: "image", url: i } : { kind: "empty" };
}
function z() {
  return { firstFrame: !1, lastFrame: !1 };
}
function Re(e) {
  const t = Z(e);
  if (!t)
    return {
      currentFrameSupport: z(),
      anyFrameSupport: z()
    };
  const r = fe(t, e.meta || {}), i = (n) => ({
    firstFrame: n.some((a) => a.kind === "first_frame" || a.kind === "image_ref"),
    lastFrame: n.some((a) => a.kind === "last_frame")
  });
  return {
    currentFrameSupport: i(r.slots),
    anyFrameSupport: i(t.modes.flatMap((n) => n.slots))
  };
}
function Oe(e, t, r) {
  const i = r.filter((s) => s.source === e).map((s) => t.find((c) => c.id === s.target)).find((s) => !!(s && Y(s.kind)));
  if (!i)
    return {
      state: "not-connected",
      currentFrameSupport: z(),
      anyFrameSupport: z()
    };
  const n = Re(i), a = me(Z(i));
  return a ? {
    state: "video-ref",
    targetNodeId: i.id,
    targetTitle: i.title || "视频镜头",
    videoRefModeId: a.modeId,
    videoRefMetaKey: a.metaKey,
    ...n
  } : {
    state: "prompt-fallback",
    targetNodeId: i.id,
    targetTitle: i.title || "视频镜头",
    ...n
  };
}
function _e(e) {
  return e.includes("运镜首帧") ? "first_frame" : e.includes("运镜尾帧") ? "last_frame" : null;
}
function Pe(e, t) {
  return e.state === "not-connected" ? !1 : t === "first_frame" ? e.anyFrameSupport.firstFrame : e.anyFrameSupport.lastFrame;
}
const re = () => import("./Scene3DFullscreen-C14XAjD2.js"), ze = ye("i18n:scene3d.fullscreen.chunkTitle", re);
function Ve(e, t) {
  const r = e / Math.max(1, t), i = r >= 1.75 ? 420 : r <= 0.72 ? 260 : 340, n = Math.min(520, Math.max(120, Math.round(i / Math.max(0.01, r))));
  return {
    width: i,
    height: n,
    previewHeight: n
  };
}
function Be(e) {
  return E(e.meta?.scene3dState);
}
function Le(e) {
  return typeof e != "string" ? null : e.trim() || null;
}
function Q(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function L(e, t) {
  if (e === t) return !0;
  if (Array.isArray(e) || Array.isArray(t)) {
    if (!Array.isArray(e) || !Array.isArray(t) || e.length !== t.length) return !1;
    for (let r = 0; r < e.length; r += 1)
      if (!L(e[r], t[r])) return !1;
    return !0;
  }
  if (Q(e) && Q(t)) {
    const r = Object.keys(e).filter((n) => e[n] !== void 0), i = Object.keys(t).filter((n) => t[n] !== void 0);
    if (r.length !== i.length) return !1;
    for (const n of r)
      if (t[n] === void 0 || !L(e[n], t[n])) return !1;
    return !0;
  }
  return !1;
}
function oe(e, t) {
  return L(e, t);
}
function V(e) {
  return JSON.stringify(e);
}
function X(e) {
  return K(E(e));
}
function ie(e) {
  const t = e.meta;
  if (!t) return null;
  if (t.cameraMoveAutoCapture && typeof t.cameraMoveAutoCapture == "object") return "generating";
  const r = t.cameraMoveVideo;
  return r && typeof r == "object" && Le(r.url) ? "done" : null;
}
function Ke() {
  const { t: e } = ee();
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      className: w(
        "pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-center justify-center gap-2",
        "bg-nomi-ink/[0.62] px-3 py-1.5 text-caption font-medium text-nomi-paper backdrop-blur-[3px]"
      ),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ u.jsx(Se, { size: 16 }),
        /* @__PURE__ */ u.jsx("span", { children: e("scene3d.fullscreen.referenceVideoGenerating") })
      ]
    }
  );
}
function Ue({ node: e, width: t, height: r, readOnly: i = !1 }) {
  const { t: n } = ee(), [a, s] = p.useState(!1), c = T((o) => o.updateNode), f = T((o) => o.addNode), l = T((o) => o.connectNodes), h = T((o) => o.nodes), S = T((o) => o.edges), M = pe((o) => o.requestCanvasFit), v = p.useMemo(() => Be(e), [e.id, e.meta?.scene3dState]), d = p.useMemo(() => V(v), [v]), y = p.useMemo(
    () => Oe(e.id, h, S),
    [S, h, e.id]
  ), I = p.useRef(d), C = p.useRef(v.lastThumbnail), F = Ee(e);
  p.useEffect(() => {
    I.current = d, C.current = v.lastThumbnail;
  }, [v.lastThumbnail, d]);
  const A = p.useCallback(() => {
    re();
  }, []), se = p.useCallback(
    (o) => {
      const m = X({
        ...o,
        lastThumbnail: o.lastThumbnail ?? C.current
      }), b = V(m);
      if (I.current === b) return;
      const g = T.getState().nodes.find((x) => x.id === e.id), N = E(g?.meta?.scene3dState);
      if (oe(N, m)) {
        I.current = b, C.current = m.lastThumbnail;
        return;
      }
      I.current = b, C.current = m.lastThumbnail, c(e.id, {
        meta: {
          ...g?.meta || {},
          scene3dState: m
        }
      });
    },
    [e.id, c]
  ), R = p.useRef(null), U = T((o) => o.selectNode), ae = p.useCallback(() => {
    s(!1), he().catch(() => {
    });
    const o = R.current;
    o && (R.current = null, requestAnimationFrame(() => {
      M(), U(o);
    }));
  }, [M, U]), ce = p.useCallback((o) => {
    const m = T.getState(), b = m.edges.filter((j) => j.source === e.id).map((j) => m.nodes.find((O) => O.id === j.target)).find((j) => j && Y(j.kind)), g = 24, N = o.sceneTimeline?.totalDuration ?? 1, x = Ae(N, g), k = f({
      kind: "scene3d",
      title: n("scene3d.fullscreen.recordedTakeTitle"),
      prompt: "",
      // #1 闭环可见性根因：scene3d 的默认分类是 'scene'，但用户正看着的子画布
      // （source 节点所在分类，常是 'shots'）未必是 'scene'。漏传 categoryId →
      // 新节点落到另一个子画布 → 既不进当前 activeCategoryId 过滤后的 nodes、也不渲染 DOM，
      // fitView 只框当前分类的 nodes 永远带不进它（用户看到的就是「录完节点人间蒸发」）。
      // 让 take 节点继承 source 节点「实际显示所在」的分类，确保它和 source 同屏、fit 能框到。
      // 用 (node.categoryId || 'shots') 而非裸 node.categoryId：source 是 legacy 无分类节点时
      // 它按 'shots' 兜底渲染（见 GenerationCanvas 过滤），但 addNode 对 undefined 会退到
      // scene3d 默认分类 'scene'——直接传 undefined 仍会错位，必须用同一套兜底口径。
      categoryId: e.categoryId || "shots",
      position: {
        x: Math.round(e.position.x),
        y: Math.round(e.position.y + r + 80)
      }
    });
    return c(k.id, {
      meta: {
        ...k.meta || {},
        scene3dState: o,
        cameraMoveAutoCapture: {
          ...b ? { targetNodeId: b.id } : {},
          fps: g,
          frameCount: x
        }
      }
    }), R.current = k.id, k.id;
  }, [f, r, e.categoryId, e.id, e.position.x, e.position.y, n, c]), le = p.useCallback(async (o) => {
    try {
      const m = await xe(o.dataUrl, e.id, o.title), b = Date.now(), g = f({
        kind: "image",
        title: o.title,
        prompt: n("scene3d.fullscreen.screenshotPrompt"),
        position: {
          x: Math.round(e.position.x + t + 80),
          y: Math.round(e.position.y)
        }
      }), N = {
        id: `scene3d-shot-${g.id}-${b}`,
        type: "image",
        url: m.url,
        assetId: m.assetId,
        raw: m.raw,
        createdAt: b
      }, x = Ve(o.width, o.height);
      c(g.id, {
        result: N,
        history: [N],
        status: "success",
        size: { width: x.width, height: x.height },
        meta: {
          ...g.meta || {},
          source: o.source,
          sourceNodeId: e.id,
          localOnly: m.localOnly,
          imageWidth: o.width,
          imageHeight: o.height,
          imageAspectRatio: o.width / Math.max(1, o.height),
          previewHeight: x.previewHeight
        }
      }), l(e.id, g.id, "reference");
      const k = _e(o.title);
      k && y.state !== "not-connected" && Pe(y, k) && l(g.id, y.targetNodeId, k);
      const j = T.getState().nodes.find((ue) => ue.id === e.id), O = X({
        ...E(j?.meta?.scene3dState),
        lastThumbnail: m.url
      });
      C.current = m.url, I.current = V(O), c(e.id, {
        meta: {
          ...j?.meta || e.meta || {},
          scene3dState: O
        }
      }), W(n("scene3d.fullscreen.screenshotCreated"), "success"), R.current = g.id;
    } catch (m) {
      W(m instanceof Error ? m.message : n("scene3d.fullscreen.screenshotFailed"), "error");
    }
  }, [f, l, e.id, e.meta, e.position.x, e.position.y, y, n, c, t]), de = ie(e);
  return /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
    /* @__PURE__ */ u.jsxs("div", { className: "group relative w-full h-full overflow-hidden", "data-tour-target": "staging trajectory", children: [
      de === "generating" ? /* @__PURE__ */ u.jsx(Ke, {}) : null,
      F.kind === "video" ? /* @__PURE__ */ u.jsx(
        je,
        {
          "data-scene3d-take-video": "true",
          className: "h-full w-full min-h-0 bg-nomi-ink-05 object-contain pointer-events-auto select-none",
          src: ge(F.url),
          crossOrigin: "use-credentials",
          controls: !0,
          muted: !0,
          playsInline: !0,
          preload: "metadata",
          draggable: !1,
          onError: (o) => {
            Me(F.url, o.currentTarget.error).then(
              Ie
            );
          }
        }
      ) : F.kind === "image" ? /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
        /* @__PURE__ */ u.jsx(
          "img",
          {
            className: "w-full h-full object-contain select-none pointer-events-none bg-nomi-ink-05",
            src: F.url,
            alt: "",
            draggable: !1
          }
        ),
        /* @__PURE__ */ u.jsx(
          "div",
          {
            className: w(
              "pointer-events-none absolute inset-0 grid place-items-center",
              "bg-nomi-ink/0 transition-colors duration-[var(--nomi-transition-fast)] group-hover:bg-nomi-ink/[0.32]"
            ),
            children: /* @__PURE__ */ u.jsxs(
              "button",
              {
                type: "button",
                "aria-label": n("scene3d.fullscreen.openEditor"),
                className: w(
                  "pointer-events-auto inline-flex items-center gap-1.5 rounded-nomi px-3 py-1.5 border-0 cursor-pointer",
                  "bg-nomi-paper/[0.92] text-body-sm font-semibold text-nomi-ink shadow-nomi-sm backdrop-blur-[10px]",
                  "opacity-0 transition-opacity duration-[var(--nomi-transition-fast)] group-hover:opacity-100",
                  "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-nomi-accent focus-visible:outline-offset-2"
                ),
                onFocus: A,
                onPointerEnter: A,
                onPointerDown: (o) => o.stopPropagation(),
                onClick: (o) => {
                  o.stopPropagation(), s(!0);
                },
                children: [
                  /* @__PURE__ */ u.jsx(q, { size: 15, stroke: 1.7 }),
                  n("scene3d.fullscreen.openEditor")
                ]
              }
            )
          }
        )
      ] }) : /* @__PURE__ */ u.jsx("div", { className: w("flex h-full w-full items-center justify-center"), children: /* @__PURE__ */ u.jsx(
        Te,
        {
          icon: /* @__PURE__ */ u.jsx(q, { size: 24, stroke: 1.65 }),
          label: n("scene3d.fullscreen.enterEditor"),
          hint: n("scene3d.fullscreen.editorHint"),
          activateAriaLabel: n("scene3d.fullscreen.enterEditorAria"),
          onActivate: () => s(!0),
          onPreload: A
        }
      ) }),
      /* @__PURE__ */ u.jsx(
        "button",
        {
          className: w(
            "absolute right-3 top-3 grid size-8 place-items-center",
            "rounded-nomi border border-nomi-line-soft",
            "bg-nomi-paper/[0.82] text-nomi-ink-60 shadow-nomi-sm",
            "backdrop-blur-[10px] transition hover:bg-nomi-paper hover:text-nomi-ink"
          ),
          type: "button",
          "aria-label": n("scene3d.fullscreen.openEditor"),
          title: n("scene3d.fullscreen.openEditor"),
          onFocus: A,
          onPointerDown: (o) => o.stopPropagation(),
          onPointerEnter: A,
          onClick: (o) => {
            o.stopPropagation(), s(!0);
          },
          children: /* @__PURE__ */ u.jsx(be, { size: 16, stroke: 1.9 })
        }
      )
    ] }),
    a ? /* @__PURE__ */ u.jsx(p.Suspense, { fallback: null, children: /* @__PURE__ */ u.jsx(
      ze,
      {
        initialState: v,
        nodeTitle: e.title || n("scene3d.fullscreen.sceneTitle"),
        readOnly: i,
        onClose: ae,
        onScreenshot: (o) => {
          le(o);
        },
        onStateChange: se,
        onRecordTake: i ? void 0 : ce,
        referenceTarget: y
      }
    ) }) : null
  ] });
}
const We = p.memo(
  Ue,
  (e, t) => e.node.id === t.node.id && e.node.title === t.node.title && e.node.meta?.scene3dState === t.node.meta?.scene3dState && // 录 take 状态徽标（#1）随这两个标志变化重渲染：CaptureHost 出片后清 cameraMoveAutoCapture、写 cameraMoveVideo，
  // 而 scene3dState 引用不变——只比 scene3dState 会漏掉状态切换、徽标永远停在「生成中」。
  e.node.meta?.cameraMoveAutoCapture === t.node.meta?.cameraMoveAutoCapture && e.node.meta?.cameraMoveVideo === t.node.meta?.cameraMoveVideo && e.node.position.x === t.node.position.x && e.node.position.y === t.node.position.y && e.width === t.width && e.height === t.height && e.readOnly === t.readOnly
), nt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: We,
  readTakeCaptureStatus: ie,
  scene3DStateEqual: oe
}, Symbol.toStringTag, { value: "Module" }));
export {
  nt as S,
  et as a,
  tt as b,
  Ze as r
};
