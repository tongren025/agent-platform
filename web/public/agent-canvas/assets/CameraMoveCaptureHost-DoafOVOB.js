import { br as U, bs as I, c5 as O, bX as N, ai as V, bb as $, af as j, cI as L, dV as P, S as d, dK as M, c8 as K, dx as B } from "./agentStudioMount-DueN8bR4.js";
import { a1 as H } from "./scene3dSerializer-CA8L6Op6.js";
import { S as G } from "./Scene3DTrajectoryCapture-BHrjCa1c.js";
import { CAMERA_MOVE_LABEL as X, CAMERA_MOVE_DESC as Y } from "./cameraMoveVocab-CkwMRCGZ.js";
function x(e) {
  return e.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "camera-move";
}
async function q(e, t, n, o) {
  const r = I(), a = U();
  if (!r?.scene3d || !a)
    return { url: null, localOnly: !0 };
  const s = Date.now(), i = `${x(n)}-${x(t)}-${s}.mp4`, c = await r.scene3d.framesToVideo({
    projectId: a,
    ownerNodeId: t,
    fileName: i,
    fps: o,
    frames: e
  });
  return {
    url: c.url || null,
    assetId: c.assetId,
    localOnly: !1
  };
}
const _ = {
  maxAttempts: 3,
  retryDelayMs: 800,
  attemptTimeoutMs: 3e4
};
function z(e, t) {
  return e < Math.max(1, t.maxAttempts);
}
function J(e, t, n = _) {
  return e === "ok" ? { kind: "done" } : z(t, n) ? { kind: "retry", nextAttempt: t + 1, delayMs: Math.max(0, n.retryDelayMs) } : { kind: "giveUp" };
}
const w = "cameraMoveAttachedUrl";
function Q(e) {
  return e ? `
镜头运动：${X[e]}（${Y[e]}）` : "";
}
function D(e) {
  const t = e[w];
  return typeof t == "string" ? t : "";
}
function W(e, t, n) {
  if (!e) return { kind: "noop" };
  if (!O(e.kind))
    return {
      kind: "noop",
      toast: { message: N.t("scene3d.capture.videoTargetRequired"), level: "warning" }
    };
  const o = { ...e.meta || {} }, r = t.trim();
  if (r && D(o) === r) return { kind: "noop" };
  const a = D(o), s = V(e), i = $(s);
  if (s && i) {
    const C = typeof o.firstFrameUrl == "string" && o.firstFrameUrl.trim().length > 0 || typeof o.lastFrameUrl == "string" && o.lastFrameUrl.trim().length > 0;
    let y = j(o, s, i.modeId);
    const v = L(y, i.metaKey), p = a ? v.filter((m) => m !== a) : v, E = p.includes(r) ? p : [...p, r];
    y = { ...y, [i.metaKey]: E, [w]: r };
    const f = s.modes.find((m) => m.id === i.modeId)?.slots.some((m) => m.kind === "first_frame" || m.kind === "last_frame") ?? !1, A = `
@Video1 跟随这段参考视频的运镜（只参考镜头运动，画面内容由角色参考与文字决定）。`, g = typeof e.prompt == "string" ? e.prompt : "", T = g.includes("@Video1") ? g : `${g}${A}`;
    return {
      kind: "patch",
      patch: { meta: y, prompt: T },
      ...C && !f ? { toast: { message: N.t("scene3d.capture.switchedToOmni"), level: "warning" } } : {}
    };
  }
  const c = Q(n);
  if (!c) return { kind: "noop" };
  const l = typeof e.prompt == "string" ? e.prompt : "", h = l.includes("镜头运动：") ? l : `${l}${c}`;
  return { kind: "patch", patch: { meta: { ...o, [w]: r }, prompt: h } };
}
const S = 24;
function Z(e, t) {
  try {
    if (typeof window > "u") return t;
    const n = window.localStorage?.getItem("__nomiForceCameraMoveFail"), o = n ? Number(n) : 0;
    if (Number.isFinite(o) && o > 0 && e <= o) return "null";
  } catch {
  }
  return t;
}
const ee = 120, te = 2, ne = 240;
function b(e) {
  const t = e.meta?.cameraMoveAutoCapture;
  return t && typeof t == "object" ? t : null;
}
function re(e, t) {
  const n = Math.floor(e ?? t);
  return Number.isFinite(n) ? Math.min(ne, Math.max(te, n)) : t;
}
function oe(e, t) {
  const n = e && typeof e == "object" ? e : null, o = n && Array.isArray(n.trajectoryBindings) ? n.trajectoryBindings : [];
  let r = 0;
  for (const a of o) {
    const s = a && typeof a == "object" ? a : null, i = s && typeof s.endTime == "number" ? s.endTime : 0, c = s && typeof s.startTime == "number" ? s.startTime : 0;
    r = Math.max(r, i - c);
  }
  return r > 0 ? Math.round(r * t) : ee;
}
function ae(e) {
  const t = e ?? S;
  return !Number.isFinite(t) || t <= 0 ? S : Math.min(60, Math.max(24, t));
}
function se(e, t, n) {
  const o = M.getState(), r = o.nodes.find((s) => s.id === e), a = W(r, t, n);
  a.toast && B(a.toast.message, a.toast.level), a.kind === "patch" && o.updateNode(e, a.patch);
}
async function ce(e, t, n) {
  const r = M.getState().nodes.find((l) => l.id === e);
  if (!r) return !1;
  const a = b(r), s = await q(n.frames, e, n.title, t);
  if (!s.url) return !1;
  const i = {
    url: s.url,
    assetId: s.assetId,
    fps: t,
    targetNodeId: a?.targetNodeId,
    createdAt: Date.now()
  }, c = M.getState().nodes.find((l) => l.id === e);
  return M.getState().updateNode(e, {
    meta: {
      ...c?.meta || r.meta || {},
      cameraMoveVideo: i
    }
  }), a?.targetNodeId && se(a.targetNodeId, s.url, a.move), !0;
}
function le() {
  const { t: e } = P();
  d.useEffect(() => {
    try {
      typeof window < "u" && window.localStorage?.getItem("__nomiE2E") === "1" && (window.__nomiCanvasStore = M);
    } catch {
    }
  }, []);
  const t = M(
    (u) => u.nodes.find((f) => f.kind === "scene3d" && b(f) !== null) ?? null
  ), [n, o] = d.useState(null), r = d.useRef(null), a = d.useRef(null), s = d.useRef(!1), i = d.useRef(S), c = d.useCallback(() => {
    r.current && (clearTimeout(r.current), r.current = null), a.current && (clearTimeout(a.current), a.current = null);
  }, []), l = d.useCallback((u) => {
    const f = M.getState().nodes.find((g) => g.id === u);
    if (!f) return;
    const A = { ...f.meta || {} };
    delete A.cameraMoveAutoCapture, M.getState().updateNode(u, { meta: A });
  }, []), h = d.useCallback(
    (u, f, A, g, T) => {
      if (s.current) return;
      s.current = !0, c();
      const m = Z(f, g);
      (async () => {
        let R = m === "ok";
        if (m === "ok" && T)
          try {
            R = await ce(u, A, T);
          } catch {
            R = !1;
          }
        const k = J(
          R ? "ok" : m === "ok" ? "null" : m,
          f,
          _
        );
        if (k.kind === "retry") {
          a.current = setTimeout(() => {
            o((F) => F && F.nodeId === u ? { nodeId: u, attempt: k.nextAttempt } : F);
          }, k.delayMs);
          return;
        }
        l(u), o(null);
      })();
    },
    [c, l]
  );
  if (d.useEffect(() => {
    if (!t) {
      n && (c(), o(null));
      return;
    }
    n || o({ nodeId: t.id, attempt: 1 });
  }, [t, n, c]), d.useEffect(() => {
    if (n)
      return s.current = !1, r.current = setTimeout(() => {
        h(n.nodeId, n.attempt, i.current, "timeout", null);
      }, _.attemptTimeoutMs), () => {
        r.current && (clearTimeout(r.current), r.current = null);
      };
  }, [n, h]), d.useEffect(() => () => c(), [c]), !t || !n || n.nodeId !== t.id) return null;
  const C = b(t), y = H(t.meta?.scene3dState), v = t.id, p = ae(C?.fps);
  i.current = p;
  const E = re(C?.frameCount, oe(y, p));
  return /* @__PURE__ */ K.jsx(
    G,
    {
      state: y,
      frameCount: E,
      fps: p,
      title: e("scene3d.capture.cameraMoveReference"),
      onResult: (u) => h(v, n.attempt, p, u ? "ok" : "null", u)
    },
    `${v}:${n.attempt}`
  );
}
export {
  le as CameraMoveCaptureHost
};
