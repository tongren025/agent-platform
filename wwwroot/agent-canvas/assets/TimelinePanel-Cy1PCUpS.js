import { aS as _e, c0 as $, e4 as a, e8 as ye, bN as me, ay as Te, bh as O, aD as Ce, S as w, e3 as ae, cf as r, ax as Se, aK as c, H as Ee, cH as ie, aB as Ne, aH as ge, dT as ue, av as je, dG as oe, a8 as Fe, s as ve, dZ as Ie, dd as Me, bc as Pe, aM as De, u as ze, n as Le, w as Re, _ as Ae, $ as Xe } from "./agentStudioMount-CNVmpr5A.js";
import { g as Ue } from "./generationCanvasTools-dJicdKdF.js";
import { I as Ge } from "./IconArrowBackUp-D-qc5obn.js";
import { I as Ke } from "./IconArrowForwardUp-ExEanhAb.js";
import { I as $e } from "./IconArrowLeft-D2a6mImu.js";
import { I as Be } from "./IconArrowRight-Cfql7j81.js";
import { I as He } from "./IconChevronRight-CLEQFfP4.js";
import { I as Oe } from "./IconCopy-VPKUSagN.js";
import { I as We } from "./IconRefresh-DHHu7gaL.js";
import { I as Ve } from "./IconWand-BLxHPrCS.js";
import { a as U } from "./workbenchActions-CyvMFzKN.js";
import { c as Ze, l as Ye, T as de, d as fe, b as qe } from "./timelineDragPayload-BKtrqhVN.js";
import { p as Je, a as le } from "./assetLibraryDrag-DG98WJrf.js";
import { I as Qe } from "./IconLetterCase-D9qq4wMZ.js";
import { I as et } from "./IconMusic-CkKbb_5I.js";
const tt = [["path", { d: "M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", key: "svg-0" }], ["path", { d: "M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", key: "svg-1" }], ["path", { d: "M9.15 14.85l8.85 -10.85", key: "svg-2" }], ["path", { d: "M6 4l8.85 10.85", key: "svg-3" }]], rt = _e("outline", "cut", "Cut", tt);
function nt(e) {
  return typeof document > "u" || !e.trim() ? Promise.resolve(null) : new Promise((s) => {
    const t = document.createElement("audio");
    t.preload = "metadata";
    let u = !1;
    const h = (b) => {
      u || (u = !0, window.clearTimeout(o), t.removeAttribute("src"), t.load(), s(b));
    }, o = window.setTimeout(() => h(null), 8e3);
    t.onloadedmetadata = () => {
      const b = t.duration;
      h(Number.isFinite(b) && b > 0 ? b : null);
    }, t.onerror = () => h(null), t.src = e.trim();
  });
}
const it = 10;
function ot(e, s) {
  const t = String(e.renderUrl || "").trim();
  if (!t) return null;
  const u = s.fps > 0 ? s.fps : 30, h = Math.max(0, Math.floor(s.startFrame)), o = s.durationSeconds && s.durationSeconds > 0 ? s.durationSeconds : it, b = Math.max(1, Math.round(o * u)), _ = `asset:${e.id}`;
  return {
    id: `clip-${_}-audio-${h}`,
    type: "audio",
    sourceNodeId: _,
    label: e.name || $.t("runtime.timeline.audio"),
    startFrame: h,
    endFrame: h + b,
    frameCount: b,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
    url: t
  };
}
function ke(e, s) {
  const t = Je(e);
  return t ? t.kind !== "audio" ? "reject" : (nt(t.renderUrl).then((u) => {
    const h = ot(
      {
        id: t.origin.source === "project" ? t.origin.relativePath : t.origin.nodeId,
        name: t.name,
        renderUrl: t.renderUrl,
        source: t.origin.source === "project" ? "project" : "canvas",
        origin: t.origin
      },
      { fps: s.fps, startFrame: s.startFrame, durationSeconds: u }
    );
    h && a.getState().addTimelineClipAtFrame(h, "audio", s.startFrame);
  }), "audio") : null;
}
function at(e) {
  return e === "image" ? $.t("timelineEditor.track.imageLabel") : e === "video" ? $.t("timelineEditor.track.videoLabel") : e === "audio" ? $.t("timelineEditor.track.audioLabel") : $.t("timelineEditor.track.genericLabel");
}
function st(e, s) {
  const t = Number.isFinite(s) && s > 0 ? s : 30, u = Math.floor(Math.max(0, e) / t), h = Math.floor(u / 60), o = u % 60;
  return `${h}:${String(o).padStart(2, "0")}`;
}
function lt(e) {
  const s = Math.max(0, Math.floor(Number(e.startFrame) || 0)), t = ye(e.clip, s), u = e.track.type === me(t.type), h = u && Te(e.track, t), o = h ? void 0 : u ? $.t("timelineEditor.track.occupied") : $.t("timelineEditor.track.wrongType", { track: at(t.type) });
  return {
    clip: t,
    canPlace: h,
    startFrame: t.startFrame,
    endFrame: t.endFrame,
    left: O(t.startFrame, e.scale),
    width: Math.max(36, O(t.endFrame - t.startFrame, e.scale)),
    timecode: st(t.startFrame, e.fps),
    ...o ? { reason: o } : {}
  };
}
function pe(e, s = {}) {
  const t = s.excludeClipIds ?? /* @__PURE__ */ new Set(), u = [{ frame: 0, type: "origin", label: $.t("timelineEditor.snap.start") }];
  s.includePlayhead !== !1 && u.push({
    frame: e.playheadFrame,
    type: "playhead",
    label: $.t("timelineEditor.snap.playhead")
  });
  for (const h of e.tracks)
    for (const o of h.clips) {
      if (t.has(o.id)) continue;
      const b = o.label || o.text || $.t("timelineEditor.snap.clip");
      u.push({
        frame: o.startFrame,
        type: "clipStart",
        label: $.t("timelineEditor.snap.clipStart", { clip: b }),
        clipId: o.id
      }), u.push({
        frame: o.endFrame,
        type: "clipEnd",
        label: $.t("timelineEditor.snap.clipEnd", { clip: b }),
        clipId: o.id
      });
    }
  return u;
}
const ct = 8;
function he(e, s = ct) {
  const t = Ce(e);
  return Math.max(1, Math.round(s / t));
}
function se(e, s, t) {
  let u = null, h = Number.POSITIVE_INFINITY;
  for (const o of s) {
    const b = Math.abs(o.frame - e);
    b <= t && b < h && (h = b, u = { frame: o.frame, point: o, deltaFrame: o.frame - e });
  }
  return u;
}
const dt = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
function ce(e) {
  return typeof e == "string" ? e.trim() : "";
}
function be(e) {
  const s = ce(e);
  return s ? /^data:image\//i.test(s) ? !0 : /^blob:/i.test(s) ? !1 : dt.test(s) : !1;
}
function mt(e, s) {
  const t = ce(e.url);
  return e.type === "video" && s.isSingleSelected && !!t && !be(t);
}
function ut(e, s) {
  const t = ce(e.url), u = ce(e.thumbnailUrl);
  if (e.type === "image") {
    const h = t || u;
    return h ? { kind: "image", src: h } : { kind: "none" };
  }
  return e.type !== "video" ? { kind: "none" } : mt(e, s) ? { kind: "video", src: t } : be(u) ? { kind: "image", src: u } : be(t) ? { kind: "image", src: t } : t || u ? { kind: "placeholder" } : { kind: "none" };
}
function pt({ clip: e }) {
  const { t: s } = ae(), t = a((m) => m.timeline.scale), u = a((m) => m.selectedTimelineClipIds.includes(e.id)), h = a((m) => m.selectedTimelineClipIds.length), o = a((m) => m.timelineSplitMode), [b, _] = w.useState(!1), [I, G] = w.useState(null), [f, i] = w.useState(null), p = w.useRef(null), T = w.useRef(null), k = w.useRef(!1), g = e.label || e.text || e.sourceNodeId, C = ut(e, {
    // 时间轴可有几十个视频片段；默认不批量挂 <video>，只让正在编辑的单个片段加载真实帧。
    isSingleSelected: u && h === 1
  }), A = w.useCallback(() => {
    const m = p.current;
    !m || typeof m.animate != "function" || m.animate([{ transform: "scale(1)" }, { transform: "scale(1.015)" }, { transform: "scale(1)" }], {
      duration: 130,
      easing: "cubic-bezier(.2,.7,.3,1)"
    });
  }, []), S = w.useCallback(
    (m) => {
      const N = a.getState();
      m ? (N.setTimelineSnapGuide({ frame: m.frame, label: m.point.label }), m.point.label !== T.current && (T.current = m.point.label, A())) : (N.setTimelineSnapGuide(null), T.current = null);
    },
    [A]
  ), M = w.useCallback(
    (m, N) => {
      m.preventDefault(), m.stopPropagation();
      const L = m.pointerId, X = m.currentTarget, Y = m.clientX, B = N === "left" ? e.startFrame : e.endFrame;
      let V = 0, re = !1;
      T.current = null, X.setPointerCapture(L);
      const Z = (q) => {
        const J = a.getState().timeline.scale;
        let n = Math.round((q.clientX - Y) / J);
        if (q.shiftKey)
          S(null);
        else {
          const y = a.getState().timeline, F = pe(y, { excludeClipIds: /* @__PURE__ */ new Set([e.id]) }), R = se(B + n, F, he(J));
          R && (n = R.frame - B), S(R);
        }
        const l = n - V;
        if (l === 0) return;
        re || (a.getState().captureTimelineUndo(), re = !0), V = n, a.getState().resizeTimelineClip(e.id, N, l);
        const j = a.getState().timeline, E = j.tracks.flatMap((y) => y.clips).find((y) => y.id === e.id);
        if (E) {
          const y = j.fps || 30, F = E.endFrame - E.startFrame, R = V >= 0 ? "+" : "−";
          i({ edge: N, text: `${R}${Math.abs(V)}f · ${(F / y).toFixed(1)}s` });
        }
      }, H = () => {
        X.releasePointerCapture(L), window.removeEventListener("pointermove", Z), window.removeEventListener("pointerup", H), a.getState().setTimelineSnapGuide(null), i(null);
      };
      window.addEventListener("pointermove", Z), window.addEventListener("pointerup", H);
    },
    [S, e.endFrame, e.id, e.startFrame]
  ), d = w.useCallback(
    (m) => {
      if (a.getState().timelineSplitMode || m.target.closest(".workbench-timeline-clip__handle") || m.shiftKey) return;
      m.preventDefault();
      const N = m.pointerId, L = m.currentTarget, X = m.clientX;
      k.current = !1, T.current = null;
      const Y = a.getState();
      let B = Y.selectedTimelineClipIds;
      B.includes(e.id) || (Y.selectTimelineClip(e.id), B = [e.id]);
      const V = new Set(B), re = B.length > 1, Z = [];
      for (const E of Y.timeline.tracks)
        for (const y of E.clips)
          V.has(y.id) && Z.push({ id: y.id, startFrame: y.startFrame, endFrame: y.endFrame });
      const H = Z.find((E) => E.id === e.id) ?? {
        id: e.id,
        startFrame: e.startFrame,
        endFrame: e.endFrame
      }, q = Math.max(1, H.endFrame - H.startFrame);
      let J = H.startFrame, n = {};
      L.setPointerCapture(N), _(!0);
      const l = (E) => {
        const y = a.getState().timeline.scale;
        Math.abs(E.clientX - X) > 3 && !k.current && (k.current = !0, a.getState().captureTimelineUndo());
        let F = Math.max(0, H.startFrame + Math.round((E.clientX - X) / y));
        if (E.shiftKey)
          S(null);
        else {
          const R = a.getState().timeline, Q = pe(R, { excludeClipIds: V }), K = he(y), ee = se(F, Q, K), ne = se(F + q, Q, K);
          let te = null;
          ee && (!ne || Math.abs(ee.deltaFrame) <= Math.abs(ne.deltaFrame)) ? (F = Math.max(0, ee.frame), te = ee) : ne && (F = Math.max(0, ne.frame - q), te = ne), S(te);
        }
        if (J = F, re) {
          const R = Ne(
            a.getState().timeline,
            Z,
            F - H.startFrame
          ), Q = {};
          for (const K of Z) Q[K.id] = Math.max(0, K.startFrame + R);
          n = Q, a.getState().moveTimelineClips(Q, { commit: !1 });
        } else
          a.getState().moveTimelineClip(e.id, F, { commit: !1 });
      }, j = () => {
        L.releasePointerCapture(N), window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", j), _(!1), a.getState().setTimelineSnapGuide(null), re && Object.keys(n).length > 0 ? a.getState().moveTimelineClips(n, { commit: !0 }) : re || a.getState().moveTimelineClip(e.id, J, { commit: !0 });
      };
      window.addEventListener("pointermove", l), window.addEventListener("pointerup", j);
    },
    [S, e.endFrame, e.id, e.startFrame]
  ), x = Math.max(36, O(e.frameCount, t)), P = C.kind === "video" ? /* @__PURE__ */ r.jsx(
    "video",
    {
      className: c(
        "workbench-timeline-clip__thumb",
        "block absolute inset-0 w-full h-full object-cover rounded-[inherit] bg-[var(--nomi-ink-10)]"
      ),
      src: Se(C.src),
      crossOrigin: "use-credentials",
      muted: !0,
      playsInline: !0,
      preload: "metadata",
      draggable: !1,
      onError: (m) => {
        Ze(C.src, m.currentTarget.error).then(Ye);
      }
    }
  ) : C.kind === "image" ? /* @__PURE__ */ r.jsx(
    Ee,
    {
      className: c(
        "workbench-timeline-clip__thumb",
        "block absolute inset-0 w-full h-full object-cover rounded-[inherit] bg-[var(--nomi-ink-10)]"
      ),
      src: C.src,
      alt: ""
    }
  ) : null, D = c(
    "workbench-timeline-clip",
    "absolute top-[5px] bottom-[5px] flex items-center gap-0 p-0",
    "rounded text-[var(--workbench-ink)] text-micro font-medium",
    "shadow-[inset_0_1px_0_var(--workbench-bevel)] cursor-grab select-none active:cursor-grabbing",
    e.type === "image" && "border border-[color-mix(in_srgb,var(--workbench-accent)_22%,transparent)] bg-[var(--workbench-accent-soft)]",
    e.type === "video" && "border border-[color-mix(in_srgb,var(--workbench-video)_24%,transparent)] bg-[var(--workbench-video-soft)]",
    // audio clip 视觉（紫色调 --workbench-audio，与图=蓝/视频=青区分）
    e.type === "audio" && "border border-[color-mix(in_srgb,var(--workbench-audio)_24%,transparent)] bg-[var(--workbench-audio-soft)]"
  ), W = u ? c(
    e.type === "video" && "border-[color-mix(in_srgb,var(--workbench-video)_56%,transparent)] bg-[color-mix(in_srgb,var(--workbench-video)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-video)_13%,transparent),0_8px_18px_var(--workbench-video-soft)]",
    e.type === "audio" && "border-[color-mix(in_srgb,var(--workbench-audio)_56%,transparent)] bg-[color-mix(in_srgb,var(--workbench-audio)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-audio)_13%,transparent),0_8px_18px_var(--workbench-audio-soft)]",
    e.type === "image" && "border-[color-mix(in_srgb,var(--workbench-accent)_62%,transparent)] bg-[color-mix(in_srgb,var(--workbench-accent)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-accent)_13%,transparent),0_8px_18px_var(--workbench-accent-soft)]"
  ) : "", v = c(
    "workbench-timeline-clip__handle",
    "absolute top-0 bottom-0 z-[2] w-3 p-0 m-0 border-0 bg-transparent appearance-none",
    "inline-flex items-center justify-center cursor-ew-resize"
  ), z = c(
    "block w-[3px] h-3.5 rounded-full pointer-events-none",
    "shadow-[0_0_0_1px_oklch(1_0_0/0.72)]",
    e.type === "video" && "bg-[var(--workbench-video)]",
    e.type === "audio" && "bg-[var(--workbench-audio)]",
    e.type === "image" && "bg-[var(--workbench-accent)]"
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      ref: p,
      className: c(D, W),
      "data-testid": "timeline-clip",
      "data-clip-type": e.type,
      title: g,
      "data-selected": u ? "true" : "false",
      "data-dragging": b ? "true" : "false",
      style: {
        left: O(e.startFrame, t),
        width: x,
        zIndex: b ? 5 : void 0,
        cursor: o ? "col-resize" : b ? "grabbing" : void 0
      },
      onClick: (m) => {
        if (o) {
          m.stopPropagation();
          const L = p.current?.getBoundingClientRect();
          if (!L) return;
          const X = e.startFrame + ie(m.clientX - L.left, t);
          a.getState().splitTimelineClip(e.id, X), G(null);
          return;
        }
        if (k.current) {
          k.current = !1;
          return;
        }
        m.stopPropagation();
        const N = a.getState();
        if (m.shiftKey || m.metaKey || m.ctrlKey) {
          N.selectTimelineClip(e.id, { additive: !0 });
          return;
        }
        N.selectTimelineClip(e.id), N.setTimelinePlayhead(e.startFrame);
      },
      onPointerMove: o ? (m) => {
        const N = p.current?.getBoundingClientRect();
        if (!N) return;
        const L = m.clientX - N.left, X = ie(L, t);
        G(X > 3 && X < e.frameCount - 3 ? L : null);
      } : void 0,
      onPointerLeave: o ? () => G(null) : void 0,
      onPointerDown: d,
      children: [
        u ? /* @__PURE__ */ r.jsx(
          "button",
          {
            type: "button",
            className: c(v, "workbench-timeline-clip__handle--left", "left-0 rounded-l-[5px]"),
            "aria-label": s("timelineEditor.clip.resizeStart"),
            title: s("timelineEditor.clip.resizeStart"),
            onPointerDown: (m) => M(m, "left"),
            children: /* @__PURE__ */ r.jsx("span", { className: z, "aria-hidden": "true" })
          }
        ) : null,
        P,
        /* @__PURE__ */ r.jsx(
          "span",
          {
            className: c(
              "workbench-timeline-clip__label",
              "relative z-[1] min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
              "rounded-nomi-sm text-[var(--nomi-ink)] backdrop-blur-[8px]",
              "self-end mt-auto mx-1 mb-1 px-[5px] py-0.5 bg-[color-mix(in_oklch,var(--nomi-paper)_72%,transparent)]"
            ),
            children: g
          }
        ),
        o && I !== null ? /* @__PURE__ */ r.jsx(
          "span",
          {
            className: c(
              "workbench-timeline-clip__cut-line",
              "absolute top-0 bottom-0 z-[3] w-0 pointer-events-none",
              "border-l border-dashed border-[var(--workbench-danger)]"
            ),
            style: { left: `${I}px` },
            "aria-hidden": "true"
          }
        ) : null,
        u ? /* @__PURE__ */ r.jsx(
          "button",
          {
            type: "button",
            className: c(v, "workbench-timeline-clip__handle--right", "right-0 rounded-r-[5px]"),
            "aria-label": s("timelineEditor.clip.resizeEnd"),
            title: s("timelineEditor.clip.resizeEnd"),
            onPointerDown: (m) => M(m, "right"),
            children: /* @__PURE__ */ r.jsx("span", { className: z, "aria-hidden": "true" })
          }
        ) : null,
        f ? /* @__PURE__ */ r.jsx(
          "span",
          {
            className: c(
              "workbench-timeline-clip__trim-tag",
              "absolute -top-[19px] z-[4] pointer-events-none whitespace-nowrap",
              "px-[5px] py-px rounded-nomi-sm text-micro tabular-nums",
              "bg-[var(--nomi-snap-tag)] text-[var(--nomi-paper)]",
              f.edge === "left" ? "left-0" : "right-0"
            ),
            "aria-hidden": "true",
            children: f.text
          }
        ) : null
      ]
    }
  );
}
const ht = w.memo(pt);
function bt({ track: e, variant: s = "primary" }) {
  const { t } = ae(), u = e.type === "image" ? t("timelineEditor.track.imageLabel") : e.type === "video" ? t("timelineEditor.track.videoLabel") : t("timelineEditor.track.audioLabel"), h = s === "secondary", o = a((d) => d.timeline.scale), b = a((d) => d.timeline.fps), _ = a((d) => d.addTimelineClipAtFrame), I = a((d) => d.setTimelinePlayhead), G = a((d) => d.setTimelineSelection), f = w.useRef(null), [i, p] = w.useState(null), [T, k] = w.useState(!1), g = w.useCallback(
    (d) => {
      const x = f.current?.getBoundingClientRect();
      return x ? ge(d, x.left, o) : 0;
    },
    [o]
  ), C = w.useCallback(
    (d) => !!(d.includes(de) || e.type === "audio" && d.includes(le)),
    [e.type]
  ), A = w.useCallback(
    (d) => {
      const x = fe(
        d.dataTransfer.getData(de)
      );
      if (!x) return null;
      const D = ue.getState().nodes.find((z) => z.id === x.nodeId) || x.node, W = g(d.clientX), v = je(D, {
        fps: b,
        startFrame: W,
        resultId: x.resultId
      });
      return v ? lt({
        track: e,
        clip: v,
        startFrame: W,
        scale: o,
        fps: b
      }) : null;
    },
    [g, b, o, e]
  ), S = w.useCallback(
    (d) => {
      if (e.type !== "audio") return !1;
      const x = ke(d.dataTransfer.getData(le), {
        fps: b,
        startFrame: g(d.clientX)
      });
      return x ? (d.preventDefault(), p(null), k(!1), x === "reject" && oe(t("timelineEditor.track.audioOnly"), "warning"), !0) : !1;
    },
    [e.type, g, b, t]
  ), M = w.useCallback(
    (d) => {
      if (S(d)) return;
      const x = A(d) || i;
      if (!x) return;
      if (d.preventDefault(), p(null), !x.canPlace) {
        oe(x.reason || t("timelineEditor.track.unavailable"), "warning");
        return;
      }
      const P = fe(
        d.dataTransfer.getData(de)
      );
      if (!P) {
        _(x.clip, me(x.clip.type), x.startFrame);
        return;
      }
      const W = ue.getState().nodes.find((v) => v.id === P.nodeId) || P.node;
      qe(W, {
        fps: b,
        startFrame: x.startFrame,
        resultId: P.resultId
      }).then((v) => {
        const z = v || x.clip;
        _(z, me(z.type), x.startFrame);
      });
    },
    [S, _, i, A, b, t]
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: c(
        "workbench-timeline-track",
        "w-full grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
        h ? "min-h-[40px] mb-1" : "min-h-[52px] mb-1.5",
        "items-center border-b-0"
      ),
      "data-testid": "timeline-track",
      "data-track-type": e.type,
      children: [
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: c(
              "workbench-timeline-track__label",
              "sticky left-0 z-[3] flex items-center gap-[7px]",
              h ? "min-h-[40px]" : "min-h-[52px]",
              "min-w-0 pr-3 border-r-0 bg-transparent",
              h ? "text-[var(--workbench-muted)] text-micro font-medium" : "text-[var(--workbench-ink)] text-xs font-semibold"
            ),
            children: [
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: c(
                    "workbench-timeline-track__type-dot",
                    "flex-none w-2 h-2 rounded-full shadow-none",
                    e.type === "image" && "bg-[var(--workbench-accent)]",
                    e.type === "video" && "bg-[var(--workbench-video)]",
                    e.type === "audio" && "bg-[var(--workbench-audio)]"
                  ),
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: c(
                    "workbench-timeline-track__name",
                    "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  ),
                  children: u
                }
              ),
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: c(
                    "workbench-timeline-track__count",
                    "flex-none min-w-0 h-auto ml-auto px-1.5 py-px",
                    "inline-grid place-items-center border-0 rounded-full",
                    "bg-[var(--nomi-ink-05)] text-[var(--nomi-ink-40)]",
                    "text-micro font-bold tabular-nums"
                  ),
                  children: e.clips.length
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            ref: f,
            className: c(
              "workbench-timeline-track__clips",
              h ? "min-h-[30px]" : "min-h-[46px]",
              "relative overflow-hidden cursor-crosshair",
              "border border-[var(--nomi-line-soft)] rounded-[var(--nomi-radius-sm)]",
              "bg-[var(--nomi-ink-05)] transition-[background,box-shadow] duration-[140ms] ease-in-out",
              i && i.canPlace && "bg-[var(--workbench-accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-accent)_20%,transparent)]",
              i && !i.canPlace && "bg-[var(--workbench-danger-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-danger)_28%,transparent)]",
              // v0.7.4: drag 中没有 preview 时也给一个 hover 高亮（accent）
              !i && T && "bg-[var(--workbench-accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-accent)_20%,transparent)]"
            ),
            style: {
              width: "var(--workbench-timeline-content-width, 100%)",
              minWidth: "var(--workbench-timeline-content-width, 100%)"
            },
            "data-drag-over": i ? "true" : "false",
            "data-drop-valid": i ? String(i.canPlace) : void 0,
            onClick: (d) => {
              a.getState().timelineSplitMode || (I(g(d.clientX)), d.shiftKey || G([]));
            },
            onDragEnter: (d) => {
              C(d.dataTransfer.types) && (d.preventDefault(), k(!0));
            },
            onDragLeave: (d) => {
              d.currentTarget.contains(d.relatedTarget) || (p(null), k(!1));
            },
            onDragOver: (d) => {
              C(d.dataTransfer.types) && (d.preventDefault(), d.dataTransfer.dropEffect = "copy");
            },
            onDrop: (d) => {
              k(!1), M(d);
            },
            children: [
              e.clips.length === 0 ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: c(
                    "workbench-timeline-track__empty",
                    "absolute inset-0 flex items-center justify-center",
                    "border border-dashed border-[var(--nomi-line)] rounded-[var(--nomi-radius-sm)]",
                    "text-[var(--nomi-ink-40)] leading-none text-micro font-medium pointer-events-none"
                  ),
                  children: e.type === "audio" ? t("timelineEditor.track.emptyAudio") : t("timelineEditor.track.emptyVisual")
                }
              ) : null,
              i ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: c(
                    "workbench-timeline-track__drop-preview",
                    "absolute top-[5px] bottom-[5px] z-[2] pointer-events-none",
                    "flex items-center justify-center overflow-visible rounded text-micro font-semibold",
                    "border border-dashed backdrop-blur-[8px] shadow-[0_8px_20px_rgba(18,24,38,0.12)]",
                    i.canPlace ? "border-[color-mix(in_srgb,var(--workbench-accent)_58%,transparent)] bg-[color-mix(in_srgb,var(--workbench-accent)_20%,var(--nomi-paper))] text-[var(--workbench-ink)]" : "border-[color-mix(in_srgb,var(--workbench-danger)_64%,transparent)] bg-[var(--workbench-danger-soft)] text-[var(--workbench-danger)]"
                  ),
                  "data-valid": i.canPlace ? "true" : "false",
                  style: { left: i.left, width: i.width },
                  children: /* @__PURE__ */ r.jsx("span", { className: c("px-2 whitespace-nowrap rounded-full bg-white/70 shadow-sm"), children: i.canPlace ? t("timelineEditor.track.placeAt", { timecode: i.timecode }) : i.reason })
                }
              ) : null,
              e.clips.map((d) => /* @__PURE__ */ r.jsx(ht, { clip: d }, d.id))
            ]
          }
        )
      ]
    }
  );
}
const we = w.memo(bt);
function ft() {
  const { t: e } = ae(), s = a((i) => i.timeline.textClips), t = a((i) => i.timeline.scale), u = a((i) => i.selectedTextClipId), h = a((i) => i.selectTimelineTextClip), o = a((i) => i.moveTimelineTextClip), b = a((i) => i.resizeTimelineTextClip), _ = a((i) => i.setTimelinePlayhead), I = w.useRef(null), G = w.useCallback(
    (i, p, T) => {
      i.preventDefault(), i.stopPropagation();
      const k = i.pointerId, g = i.currentTarget;
      g.setPointerCapture?.(k), h(p);
      const C = I.current?.getBoundingClientRect(), S = (C ? ie(i.clientX - C.left, t) : T) - T;
      let M = !1;
      const d = (D, W) => {
        const v = I.current?.getBoundingClientRect();
        if (!v) return;
        const z = Math.max(0, ie(D - v.left, t) - S);
        o(p, z, { commit: W });
      }, x = (D) => {
        M || (a.getState().captureTimelineUndo(), M = !0), d(D.clientX, !1);
      }, P = (D) => {
        d(D.clientX, !0), g.releasePointerCapture?.(k), window.removeEventListener("pointermove", x), window.removeEventListener("pointerup", P);
      };
      window.addEventListener("pointermove", x), window.addEventListener("pointerup", P);
    },
    [o, t, h]
  ), f = w.useCallback(
    (i, p, T) => {
      i.preventDefault(), i.stopPropagation();
      const k = i.pointerId, g = i.currentTarget;
      g.setPointerCapture?.(k), h(p);
      let C = !1;
      const A = (d, x) => {
        const P = I.current?.getBoundingClientRect();
        if (!P) return;
        const D = Math.max(0, ie(d - P.left, t));
        b(p, T, D, { commit: x });
      }, S = (d) => {
        C || (a.getState().captureTimelineUndo(), C = !0), A(d.clientX, !1);
      }, M = (d) => {
        A(d.clientX, !0), g.releasePointerCapture?.(k), window.removeEventListener("pointermove", S), window.removeEventListener("pointerup", M);
      };
      window.addEventListener("pointermove", S), window.addEventListener("pointerup", M);
    },
    [b, t, h]
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: c(
        "workbench-timeline-track",
        "w-full min-h-[40px] grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
        "items-center mb-1 border-b-0"
      ),
      "data-testid": "timeline-text-track",
      "data-track-type": "text",
      children: [
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: c(
              "workbench-timeline-track__label",
              "sticky left-0 z-[3] flex items-center gap-[7px]",
              "min-w-0 min-h-[40px] pr-3 border-r-0 bg-transparent",
              "text-[var(--workbench-muted)] text-micro font-medium"
            ),
            children: [
              /* @__PURE__ */ r.jsx("span", { className: "flex-none w-2 h-2 rounded-full shadow-none bg-[var(--workbench-text)]", "aria-hidden": "true" }),
              /* @__PURE__ */ r.jsx("span", { className: "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap", children: e("timelineEditor.textTrack.title") }),
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: c(
                    "flex-none min-w-0 h-auto ml-auto px-1.5 py-px inline-grid place-items-center border-0 rounded-full",
                    "bg-[var(--nomi-ink-05)] text-[var(--nomi-ink-40)] text-micro font-bold tabular-nums"
                  ),
                  children: s.length
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            ref: I,
            className: c(
              "workbench-timeline-track__clips",
              "relative min-h-[30px] overflow-hidden cursor-crosshair",
              "border border-[var(--nomi-line-soft)] rounded-[var(--nomi-radius-sm)]",
              "bg-[var(--nomi-ink-05)]"
            ),
            style: {
              width: "var(--workbench-timeline-content-width, 100%)",
              minWidth: "var(--workbench-timeline-content-width, 100%)"
            },
            onPointerDown: (i) => {
              const p = I.current?.getBoundingClientRect();
              p && _(ge(i.clientX, p.left, t));
            },
            children: [
              s.length === 0 ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: c(
                    "workbench-timeline-track__empty",
                    "absolute inset-0 flex items-center justify-center",
                    "border border-dashed border-[var(--nomi-line)] rounded-[var(--nomi-radius-sm)]",
                    "text-[var(--nomi-ink-40)] leading-none text-micro font-medium pointer-events-none"
                  ),
                  children: e("timelineEditor.textTrack.emptyHint")
                }
              ) : null,
              s.map((i) => {
                const p = O(i.startFrame, t), T = Math.max(24, O(i.endFrame - i.startFrame, t)), k = u === i.id;
                return /* @__PURE__ */ r.jsxs(
                  "button",
                  {
                    type: "button",
                    className: c(
                      "workbench-timeline-text-clip",
                      "absolute top-[5px] bottom-[5px] z-[1] flex items-center gap-1 px-2 overflow-hidden",
                      "rounded-[var(--nomi-radius-sm)] cursor-grab active:cursor-grabbing touch-none text-left",
                      "border bg-[var(--workbench-text-soft)] text-[var(--nomi-ink)] text-micro font-semibold",
                      k ? "border-[var(--workbench-text)] shadow-[0_0_0_1px_var(--workbench-text)]" : "border-[color-mix(in_oklch,var(--workbench-text)_36%,transparent)]"
                    ),
                    style: { left: `${p}px`, width: `${T}px` },
                    title: i.style === "title" ? e("timelineEditor.textTrack.titleCard") : e("timelineEditor.textTrack.caption"),
                    onPointerDown: (g) => G(g, i.id, i.startFrame),
                    onClick: () => _(i.startFrame),
                    children: [
                      /* @__PURE__ */ r.jsx(Qe, { size: 12, className: "flex-none opacity-70" }),
                      /* @__PURE__ */ r.jsx("span", { className: "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap", children: i.text || e("timelineEditor.textTrack.empty") }),
                      /* @__PURE__ */ r.jsx(
                        "span",
                        {
                          role: "separator",
                          "aria-label": e("timelineEditor.textTrack.resizeLeft"),
                          className: "absolute inset-y-0 left-0 w-1.5 z-[2] cursor-ew-resize hover:bg-[var(--workbench-text)]",
                          onPointerDown: (g) => f(g, i.id, "left"),
                          onClick: (g) => g.stopPropagation()
                        }
                      ),
                      /* @__PURE__ */ r.jsx(
                        "span",
                        {
                          role: "separator",
                          "aria-label": e("timelineEditor.textTrack.resizeRight"),
                          className: "absolute inset-y-0 right-0 w-1.5 z-[2] cursor-ew-resize hover:bg-[var(--workbench-text)]",
                          onPointerDown: (g) => f(g, i.id, "right"),
                          onClick: (g) => g.stopPropagation()
                        }
                      )
                    ]
                  },
                  i.id
                );
              })
            ]
          }
        )
      ]
    }
  );
}
function wt({
  showAudio: e,
  showText: s
}) {
  const { t } = ae(), u = a((p) => p.addTimelineTextClip), h = a((p) => p.selectTimelineTextClip), o = a((p) => p.timeline.fps), [b, _] = w.useState(!1);
  if (!e && !s) return null;
  const I = () => {
    const p = a.getState().timeline.playheadFrame;
    h(u("caption", p));
  }, G = (p) => {
    if (_(!1), !e) return;
    const T = a.getState().timeline.playheadFrame;
    ke(p.dataTransfer.getData(le), { fps: o, startFrame: T }) && p.preventDefault();
  }, f = (p) => e && p.includes(le), i = s ? /* @__PURE__ */ r.jsxs(
    Fe,
    {
      onClick: I,
      className: "h-6 px-2 text-micro [&>svg]:size-3 gap-1",
      "aria-label": t("timelineEditor.secondary.addCaption"),
      children: [
        /* @__PURE__ */ r.jsx(ve, { stroke: 2 }),
        t("timelineEditor.secondary.caption")
      ]
    }
  ) : null;
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: c(
        "workbench-timeline-secondary-add",
        "w-full min-h-[30px] grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
        "items-center mb-1 border-b-0 gap-2"
      ),
      "data-testid": "timeline-secondary-add",
      children: [
        /* @__PURE__ */ r.jsxs(
          "span",
          {
            className: c(
              "sticky left-0 z-[3] min-w-0 pr-3 flex items-center gap-[7px] text-micro text-[var(--workbench-muted)]"
            ),
            children: [
              /* @__PURE__ */ r.jsx("span", { className: "flex-none w-2 h-2 rounded-full bg-[var(--nomi-ink-20)]", "aria-hidden": "true" }),
              /* @__PURE__ */ r.jsx("span", { className: "truncate", children: t("timelineEditor.secondary.overlay") })
            ]
          }
        ),
        e ? /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: c(
              "relative h-[26px] flex items-center justify-center rounded-[var(--nomi-radius-sm)]",
              "border border-dashed transition-[background,border-color] duration-[var(--nomi-transition-fast)]",
              b ? "border-[var(--workbench-audio)] bg-[var(--workbench-audio-soft)]" : "border-[var(--nomi-line)]"
            ),
            "data-testid": "timeline-secondary-audio-drop",
            onDragEnter: (p) => {
              f(p.dataTransfer.types) && (p.preventDefault(), _(!0));
            },
            onDragOver: (p) => {
              f(p.dataTransfer.types) && (p.preventDefault(), p.dataTransfer.dropEffect = "copy");
            },
            onDragLeave: (p) => {
              p.currentTarget.contains(p.relatedTarget) || _(!1);
            },
            onDrop: G,
            children: [
              /* @__PURE__ */ r.jsxs(
                "span",
                {
                  className: c(
                    "flex items-center gap-1.5 text-micro font-medium text-[var(--nomi-ink-40)] pointer-events-none"
                  ),
                  children: [
                    /* @__PURE__ */ r.jsx(et, { size: 12, stroke: 1.8 }),
                    t("timelineEditor.secondary.dropAudio")
                  ]
                }
              ),
              i ? /* @__PURE__ */ r.jsx("span", { className: "absolute right-1", children: i }) : null
            ]
          }
        ) : /* @__PURE__ */ r.jsx("div", { className: "flex items-center", children: i })
      ]
    }
  );
}
const xe = 1.24;
function xt(e, s) {
  const t = Math.floor(e / s), u = Math.floor(t / 60), h = t % 60;
  return `${u}:${String(h).padStart(2, "0")}`;
}
function gt(e, s) {
  const t = O(e, s);
  return t < 36 ? e * 10 : t < 72 ? e * 5 : t < 132 ? e * 2 : e;
}
function vt(e) {
  const s = Math.max(1, e.fps), t = s * 120, u = s * 60;
  return Math.max(
    t,
    e.durationFrame + u,
    e.playheadFrame + u
  );
}
function kt(e, s, t) {
  const u = Math.max(0, e), h = gt(s, t), o = [];
  for (let b = 0; b <= u && o.length < 360; b += h)
    o.push({ frame: b, label: xt(b, s) });
  return o;
}
function Rt({ density: e = "compact", regionLabel: s, actionLabelPrefix: t, showTextTrack: u = !1, onCollapse: h }) {
  const { t: o } = ae(), b = a((n) => n.timeline), _ = ue((n) => n.nodes), I = Ie((n) => n.activeScope), G = w.useMemo(
    () => Me(_, I),
    [_, I]
  ), f = w.useMemo(
    () => Pe(b, _, G),
    [G, _, b]
  ), i = a((n) => n.selectedTimelineClipIds), p = a((n) => n.selectedTextClipId), T = a((n) => n.removeTimelineTextClip), k = a((n) => n.timelineSnapGuide), g = a((n) => n.duplicateTimelineClip), C = a((n) => n.nudgeTimelineClip), A = a((n) => n.removeSelectedTimelineClips), S = a((n) => n.setTimelineZoom), M = a((n) => n.timelineSplitMode), d = a((n) => n.setTimelineSplitMode), x = a((n) => n.timelineUndoStack.length > 0), P = a((n) => n.undoTimeline), D = a((n) => n.timelineRedoStack.length > 0), W = a((n) => n.redoTimeline), v = i.length > 0 ? i[i.length - 1] : "", z = i.length > 0, m = w.useMemo(() => {
    if (i.length !== 1 || !v) return null;
    for (const n of f.tracks) {
      const l = n.clips.find((j) => j.id === v);
      if (l) return l.sourceNodeId ? l : null;
    }
    return null;
  }, [i, v, f.tracks]), N = w.useCallback(() => {
    import("./sendStoryboardToTimeline-DEawyd9f.js").then(({ arrangeStoryboardToTimeline: n }) => {
      const l = Ue.read_canvas().nodes.map((E) => E.id), j = n(l.length ? { nodeIds: l } : {});
      j.sent.length > 0 ? oe(o("timelineEditor.arranged", { count: j.sent.length }), "success") : j.total === 0 ? oe(o("timelineEditor.noShots"), "info") : oe(o("timelineEditor.alreadyArranged"), "info");
    });
  }, [o]), L = a((n) => n.setTimelinePlayhead), X = a((n) => n.splitTimelineClip), Y = De(f), B = w.useMemo(
    () => vt({
      durationFrame: Y,
      playheadFrame: f.playheadFrame,
      fps: f.fps
    }),
    [Y, f.fps, f.playheadFrame]
  ), V = w.useMemo(
    () => kt(B, f.fps, f.scale),
    [B, f.fps, f.scale]
  ), Z = Math.max(O(B, f.scale), 2400);
  w.useEffect(() => {
    const n = (l) => {
      if (!(l.defaultPrevented || l.target?.closest('input, textarea, [contenteditable="true"]'))) {
        if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "z" && !l.shiftKey) {
          l.preventDefault(), a.getState().undoTimeline();
          return;
        }
        if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "z" && l.shiftKey) {
          l.preventDefault(), a.getState().redoTimeline();
          return;
        }
        if (l.key === "Escape" && a.getState().timelineSplitMode) {
          l.preventDefault(), a.getState().setTimelineSplitMode(!1);
          return;
        }
        if (l.key === "ArrowLeft" || l.key === "ArrowRight") {
          l.preventDefault(), L(f.playheadFrame + (l.key === "ArrowLeft" ? -1 : 1));
          return;
        }
        if (p && (l.key === "Backspace" || l.key === "Delete")) {
          l.preventDefault(), T(p);
          return;
        }
        if (z) {
          if (l.key === "Backspace" || l.key === "Delete") {
            l.preventDefault(), A();
            return;
          }
          if (v) {
            if (l.key.toLowerCase() === "s") {
              l.preventDefault(), X(v, f.playheadFrame);
              return;
            }
            if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "d") {
              l.preventDefault(), g(v);
              return;
            }
            l.shiftKey && (l.key === "<" || l.key === ">") && (l.preventDefault(), C(v, l.key === "<" ? -1 : 1));
          }
        }
      }
    };
    return window.addEventListener("keydown", n), () => window.removeEventListener("keydown", n);
  }, [
    g,
    z,
    C,
    v,
    A,
    T,
    p,
    L,
    X,
    f.playheadFrame
  ]);
  const H = w.useRef(null), q = w.useCallback((n) => {
    const l = H.current?.getBoundingClientRect();
    return l ? Math.max(0, ie(n - l.left, a.getState().timeline.scale)) : 0;
  }, []), J = w.useCallback((n) => {
    n.preventDefault(), n.stopPropagation();
    const l = n.pointerId, j = n.currentTarget;
    j.setPointerCapture?.(l);
    const E = (R, Q) => {
      const K = a.getState();
      let ee = q(R);
      if (Q)
        K.setTimelineSnapGuide(null);
      else {
        const ne = pe(K.timeline, { includePlayhead: !1 }), te = se(ee, ne, he(K.timeline.scale));
        te ? (ee = te.frame, K.setTimelineSnapGuide({ frame: te.frame, label: te.point.label })) : K.setTimelineSnapGuide(null);
      }
      K.setTimelinePlayhead(ee);
    };
    E(n.clientX, n.shiftKey);
    const y = (R) => E(R.clientX, R.shiftKey), F = () => {
      j.releasePointerCapture?.(l), window.removeEventListener("pointermove", y), window.removeEventListener("pointerup", F), a.getState().setTimelineSnapGuide(null);
    };
    window.addEventListener("pointermove", y), window.addEventListener("pointerup", F);
  }, [q]);
  return /* @__PURE__ */ r.jsxs(
    "section",
    {
      className: c(
        "workbench-timeline",
        "relative min-w-0 min-h-0 grid grid-rows-[minmax(0,1fr)]",
        "bg-[var(--workbench-surface-solid)] border-t border-[var(--workbench-border)]",
        "shadow-[0_-1px_0_var(--workbench-bevel)]",
        e === "full" ? "px-[18px] pt-[10px] pb-5" : "px-4 pt-3 pb-4"
      ),
      "data-density": e,
      "aria-label": s,
      style: { "--workbench-timeline-content-width": `${Z}px` },
      children: [
        /* @__PURE__ */ r.jsx("div", { className: c(
          "workbench-timeline__controls",
          "absolute top-[10px] right-4 z-[8] inline-flex items-center gap-0.5",
          "bg-[color-mix(in_oklch,var(--nomi-paper)_84%,transparent)]",
          "rounded-full backdrop-blur-[10px]"
        ), children: /* @__PURE__ */ r.jsxs("div", { className: c(
          "workbench-timeline__right",
          "inline-flex items-center gap-0.5 min-w-0 p-0"
        ), children: [
          z ? /* @__PURE__ */ r.jsxs("div", { className: c(
            "workbench-timeline__clip-tools",
            "inline-flex items-center gap-0.5 pr-0 border-r-0"
          ), "aria-label": o("timelineEditor.selectedClipActions"), children: [
            m ? /* @__PURE__ */ r.jsx(
              U,
              {
                className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-accent)] shadow-none cursor-pointer hover:bg-[var(--workbench-accent-soft)]"),
                label: o("timelineEditor.regenerate"),
                title: o("timelineEditor.regenerateHint"),
                icon: /* @__PURE__ */ r.jsx(ze, { size: 14 }),
                onClick: () => {
                  import("./generationRunController-C10j09Ce.js").then((n) => n.g).then(({ regenerateNodeInPlace: n }) => n(m.sourceNodeId));
                }
              }
            ) : null,
            /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.nudgeEarlier"), icon: /* @__PURE__ */ r.jsx($e, { size: 14 }), onClick: () => C(v, -1) }),
            /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.duplicateClip"), icon: /* @__PURE__ */ r.jsx(Oe, { size: 14 }), onClick: () => g(v) }),
            /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.nudgeLater"), icon: /* @__PURE__ */ r.jsx(Be, { size: 14 }), onClick: () => C(v, 1) })
          ] }) : null,
          /* @__PURE__ */ r.jsx(
            U,
            {
              className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-accent)] shadow-none cursor-pointer hover:bg-[var(--workbench-accent-soft)]"),
              label: o("timelineEditor.aiArrange"),
              title: o("timelineEditor.aiArrangeHint"),
              icon: /* @__PURE__ */ r.jsx(Ve, { size: 14 }),
              onClick: N
            }
          ),
          /* @__PURE__ */ r.jsx(
            U,
            {
              className: c(
                "workbench-timeline__tool",
                "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] shadow-none cursor-pointer",
                M ? "bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent)] hover:bg-[var(--workbench-accent-soft)]" : "bg-transparent text-[var(--workbench-muted)] hover:bg-[var(--workbench-hover)]"
              ),
              label: o(M ? "timelineEditor.exitSplitMode" : "timelineEditor.splitMode"),
              title: o(M ? "timelineEditor.splitModeActiveHint" : "timelineEditor.splitModeHint"),
              icon: /* @__PURE__ */ r.jsx(rt, { size: 14 }),
              onClick: () => d(!M)
            }
          ),
          D ? /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.redo"), title: o("timelineEditor.redoShortcut"), icon: /* @__PURE__ */ r.jsx(Ke, { size: 14 }), onClick: () => W() }) : null,
          x ? /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.undo"), title: o("timelineEditor.undoShortcut"), icon: /* @__PURE__ */ r.jsx(Ge, { size: 14 }), onClick: () => P() }) : null,
          /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.zoomOut", { prefix: t }), icon: /* @__PURE__ */ r.jsx(Le, { size: 14 }), onClick: () => S(f.scale / 1.25) }),
          /* @__PURE__ */ r.jsxs("span", { className: "text-micro opacity-60 min-w-[32px] text-center", children: [
            Math.round(f.scale * 100),
            "%"
          ] }),
          /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.resetZoom"), icon: /* @__PURE__ */ r.jsx(We, { size: 14 }), onClick: () => S(1) }),
          /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.zoomIn", { prefix: t }), icon: /* @__PURE__ */ r.jsx(ve, { size: 14 }), onClick: () => S(f.scale * 1.25) }),
          /* @__PURE__ */ r.jsx(U, { className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: o("timelineEditor.deleteSelected", { prefix: t }), icon: /* @__PURE__ */ r.jsx(Re, { size: 14 }), disabled: !z, onClick: () => A() }),
          h ? /* @__PURE__ */ r.jsx(
            U,
            {
              className: c("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"),
              label: o("timelineEditor.collapse", { prefix: t }),
              icon: /* @__PURE__ */ r.jsx(He, { size: 14 }),
              onClick: h
            }
          ) : null
        ] }) }),
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: c(
              "workbench-timeline__tracks",
              "relative min-w-0 min-h-0 block bg-transparent",
              "overflow-x-auto overflow-y-hidden pb-2",
              "scrollbar-thin scrollbar-color-transparent",
              "hover:scrollbar-color-[color-mix(in_srgb,var(--nomi-ink)_22%,transparent)]"
            ),
            onWheel: (n) => {
              if (!n.ctrlKey && !n.metaKey) return;
              n.preventDefault();
              const l = n.deltaY < 0 ? xe : 1 / xe;
              S(Math.min(Ae, Math.max(Xe, f.scale * l)));
            },
            children: [
              /* @__PURE__ */ r.jsxs("div", { className: c(
                "workbench-timeline__ruler",
                "w-full grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
                "h-[22px] mb-1.5 border-b border-[var(--nomi-line-soft)] bg-transparent"
              ), children: [
                /* @__PURE__ */ r.jsx("div", { className: c(
                  "workbench-timeline__ruler-spacer",
                  "sticky left-0 z-[4] border-r-0 bg-transparent"
                ), "aria-hidden": "true" }),
                /* @__PURE__ */ r.jsx(
                  "div",
                  {
                    ref: H,
                    className: c(
                      "workbench-timeline__ruler-content",
                      "relative h-full cursor-pointer bg-transparent touch-none"
                    ),
                    style: {
                      width: "var(--workbench-timeline-content-width, 100%)",
                      minWidth: "var(--workbench-timeline-content-width, 100%)"
                    },
                    "aria-label": o("timelineEditor.ruler"),
                    onPointerDown: J,
                    children: V.map((n) => /* @__PURE__ */ r.jsx(
                      "span",
                      {
                        className: c(
                          "workbench-timeline__ruler-tick",
                          "absolute left-0 top-0 w-0 h-full bg-transparent text-[var(--workbench-muted)]",
                          'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-px after:h-[22px] after:bg-[var(--nomi-line)]'
                        ),
                        "data-origin": n.frame === 0 ? "true" : "false",
                        style: { transform: `translateX(${O(n.frame, f.scale)}px)` },
                        children: /* @__PURE__ */ r.jsx("span", { className: c(
                          "workbench-timeline__ruler-label",
                          "absolute left-1.5 top-[3px] font-mono text-micro font-medium leading-none",
                          "text-[var(--nomi-ink-40)] whitespace-nowrap tabular-nums"
                        ), children: n.label })
                      },
                      n.frame
                    ))
                  }
                )
              ] }),
              k ? /* @__PURE__ */ r.jsxs(
                "div",
                {
                  className: c(
                    "workbench-timeline__snap-guide",
                    "absolute top-0 bottom-0 left-[var(--workbench-timeline-label-width)] z-[7] w-0 pointer-events-none"
                  ),
                  style: { transform: `translateX(${O(k.frame, f.scale)}px)` },
                  "aria-hidden": "true",
                  children: [
                    /* @__PURE__ */ r.jsx("div", { className: "absolute top-0 bottom-0 left-0 w-px -translate-x-1/2 bg-[repeating-linear-gradient(var(--nomi-snap)_0_4px,transparent_4px_8px)]" }),
                    /* @__PURE__ */ r.jsx("span", { className: c(
                      "absolute top-0.5 left-1 px-1 rounded-nomi-sm whitespace-nowrap",
                      "font-mono text-micro leading-[14px] text-[var(--nomi-paper)] bg-[var(--nomi-snap-tag)]"
                    ), children: k.label })
                  ]
                }
              ) : null,
              /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: c(
                    "workbench-timeline__playhead",
                    "absolute top-0 bottom-0 left-[var(--workbench-timeline-label-width)] z-[6]",
                    "w-px bg-[var(--workbench-accent)] shadow-[0_0_0_1px_rgba(0,122,255,0.08)]",
                    "pointer-events-none"
                  ),
                  style: { transform: `translateX(${O(f.playheadFrame, f.scale)}px)` },
                  "aria-hidden": "true",
                  children: /* @__PURE__ */ r.jsx(
                    "button",
                    {
                      type: "button",
                      className: c(
                        "workbench-timeline__playhead-handle",
                        "absolute -top-px left-1/2 -translate-x-1/2 w-[11px] h-[11px] p-0",
                        "rounded-nomi-sm border-[1.5px] border-[var(--nomi-paper)] bg-[var(--workbench-accent)]",
                        "shadow-[0_1px_2px_oklch(0_0_0/0.2)] cursor-ew-resize pointer-events-auto touch-none"
                      ),
                      "aria-label": o("timelineEditor.dragPlayhead"),
                      title: o("timelineEditor.dragPlayhead"),
                      onPointerDown: J
                    }
                  )
                }
              ),
              f.tracks.filter((n) => n.type !== "audio").map((n) => /* @__PURE__ */ r.jsx(we, { track: n, variant: "primary" }, n.id)),
              (() => {
                const n = f.tracks.find((F) => F.type === "audio"), l = (n?.clips.length ?? 0) > 0, j = (f.textClips?.length ?? 0) > 0, E = !!n && !l, y = u && !j;
                return /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
                  n && l ? /* @__PURE__ */ r.jsx(we, { track: n, variant: "secondary" }, n.id) : null,
                  u && j ? /* @__PURE__ */ r.jsx(ft, {}) : null,
                  E || y ? /* @__PURE__ */ r.jsx(wt, { showAudio: E, showText: y }) : null
                ] });
              })()
            ]
          }
        )
      ]
    }
  );
}
export {
  Rt as default
};
