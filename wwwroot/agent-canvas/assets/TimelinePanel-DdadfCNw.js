import { aR as _e, bX as U, dW as o, dZ as ye, bJ as me, ax as Te, bd as H, aC as Ce, S as w, dV as ie, c8 as r, aw as Se, aJ as d, H as Ee, cA as ee, aA as je, aG as ge, dK as be, av as Fe, dx as ne, a8 as Ne, s as ke, aL as Ie, u as Me, n as De, w as Pe, _ as ze, $ as Le } from "./agentStudioMount-D2l2f4Xv.js";
import { I as Re } from "./IconArrowBackUp-DN3S08bk.js";
import { I as Ae } from "./IconArrowForwardUp--viKIvLt.js";
import { I as Xe } from "./IconArrowLeft-wHJdsXTK.js";
import { I as Ue } from "./IconArrowRight-DShBmYI1.js";
import { I as Ge } from "./IconChevronRight-DK0WZbt9.js";
import { I as Ke } from "./IconCopy-BPt548Lc.js";
import { I as $e } from "./IconRefresh-DnLmoll8.js";
import { I as Be } from "./IconWand-Chu6YHG8.js";
import { a as L } from "./workbenchActions-dBvqdtev.js";
import { c as Oe, l as He, T as de, d as fe, b as We } from "./timelineDragPayload-jvHba57t.js";
import { p as Ve, a as se } from "./assetLibraryDrag-DG98WJrf.js";
import { I as Ze } from "./IconLetterCase-E8IBM2gK.js";
import { I as Ye } from "./IconMusic-BWYubG_S.js";
const Je = [["path", { d: "M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", key: "svg-0" }], ["path", { d: "M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", key: "svg-1" }], ["path", { d: "M9.15 14.85l8.85 -10.85", key: "svg-2" }], ["path", { d: "M6 4l8.85 10.85", key: "svg-3" }]], qe = _e("outline", "cut", "Cut", Je);
function Qe(e) {
  return typeof document > "u" || !e.trim() ? Promise.resolve(null) : new Promise((c) => {
    const t = document.createElement("audio");
    t.preload = "metadata";
    let p = !1;
    const b = (s) => {
      p || (p = !0, window.clearTimeout(i), t.removeAttribute("src"), t.load(), c(s));
    }, i = window.setTimeout(() => b(null), 8e3);
    t.onloadedmetadata = () => {
      const s = t.duration;
      b(Number.isFinite(s) && s > 0 ? s : null);
    }, t.onerror = () => b(null), t.src = e.trim();
  });
}
const et = 10;
function tt(e, c) {
  const t = String(e.renderUrl || "").trim();
  if (!t) return null;
  const p = c.fps > 0 ? c.fps : 30, b = Math.max(0, Math.floor(c.startFrame)), i = c.durationSeconds && c.durationSeconds > 0 ? c.durationSeconds : et, s = Math.max(1, Math.round(i * p)), g = `asset:${e.id}`;
  return {
    id: `clip-${g}-audio-${b}`,
    type: "audio",
    sourceNodeId: g,
    label: e.name || U.t("runtime.timeline.audio"),
    startFrame: b,
    endFrame: b + s,
    frameCount: s,
    offsetStartFrame: 0,
    offsetEndFrame: 0,
    url: t
  };
}
function ve(e, c) {
  const t = Ve(e);
  return t ? t.kind !== "audio" ? "reject" : (Qe(t.renderUrl).then((p) => {
    const b = tt(
      {
        id: t.origin.source === "project" ? t.origin.relativePath : t.origin.nodeId,
        name: t.name,
        renderUrl: t.renderUrl,
        source: t.origin.source === "project" ? "project" : "canvas",
        origin: t.origin
      },
      { fps: c.fps, startFrame: c.startFrame, durationSeconds: p }
    );
    b && o.getState().addTimelineClipAtFrame(b, "audio", c.startFrame);
  }), "audio") : null;
}
function rt(e) {
  return e === "image" ? U.t("timelineEditor.track.imageLabel") : e === "video" ? U.t("timelineEditor.track.videoLabel") : e === "audio" ? U.t("timelineEditor.track.audioLabel") : U.t("timelineEditor.track.genericLabel");
}
function nt(e, c) {
  const t = Number.isFinite(c) && c > 0 ? c : 30, p = Math.floor(Math.max(0, e) / t), b = Math.floor(p / 60), i = p % 60;
  return `${b}:${String(i).padStart(2, "0")}`;
}
function it(e) {
  const c = Math.max(0, Math.floor(Number(e.startFrame) || 0)), t = ye(e.clip, c), p = e.track.type === me(t.type), b = p && Te(e.track, t), i = b ? void 0 : p ? U.t("timelineEditor.track.occupied") : U.t("timelineEditor.track.wrongType", { track: rt(t.type) });
  return {
    clip: t,
    canPlace: b,
    startFrame: t.startFrame,
    endFrame: t.endFrame,
    left: H(t.startFrame, e.scale),
    width: Math.max(36, H(t.endFrame - t.startFrame, e.scale)),
    timecode: nt(t.startFrame, e.fps),
    ...i ? { reason: i } : {}
  };
}
function ue(e, c = {}) {
  const t = c.excludeClipIds ?? /* @__PURE__ */ new Set(), p = [{ frame: 0, type: "origin", label: U.t("timelineEditor.snap.start") }];
  c.includePlayhead !== !1 && p.push({
    frame: e.playheadFrame,
    type: "playhead",
    label: U.t("timelineEditor.snap.playhead")
  });
  for (const b of e.tracks)
    for (const i of b.clips) {
      if (t.has(i.id)) continue;
      const s = i.label || i.text || U.t("timelineEditor.snap.clip");
      p.push({
        frame: i.startFrame,
        type: "clipStart",
        label: U.t("timelineEditor.snap.clipStart", { clip: s }),
        clipId: i.id
      }), p.push({
        frame: i.endFrame,
        type: "clipEnd",
        label: U.t("timelineEditor.snap.clipEnd", { clip: s }),
        clipId: i.id
      });
    }
  return p;
}
const at = 8;
function pe(e, c = at) {
  const t = Ce(e);
  return Math.max(1, Math.round(c / t));
}
function oe(e, c, t) {
  let p = null, b = Number.POSITIVE_INFINITY;
  for (const i of c) {
    const s = Math.abs(i.frame - e);
    s <= t && s < b && (b = s, p = { frame: i.frame, point: i, deltaFrame: i.frame - e });
  }
  return p;
}
const ot = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
function le(e) {
  return typeof e == "string" ? e.trim() : "";
}
function he(e) {
  const c = le(e);
  return c ? /^data:image\//i.test(c) ? !0 : /^blob:/i.test(c) ? !1 : ot.test(c) : !1;
}
function st(e, c) {
  const t = le(e.url);
  return e.type === "video" && c.isSingleSelected && !!t && !he(t);
}
function lt(e, c) {
  const t = le(e.url), p = le(e.thumbnailUrl);
  if (e.type === "image") {
    const b = t || p;
    return b ? { kind: "image", src: b } : { kind: "none" };
  }
  return e.type !== "video" ? { kind: "none" } : st(e, c) ? { kind: "video", src: t } : he(p) ? { kind: "image", src: p } : he(t) ? { kind: "image", src: t } : t || p ? { kind: "placeholder" } : { kind: "none" };
}
function ct({ clip: e }) {
  const { t: c } = ie(), t = o((u) => u.timeline.scale), p = o((u) => u.selectedTimelineClipIds.includes(e.id)), b = o((u) => u.selectedTimelineClipIds.length), i = o((u) => u.timelineSplitMode), [s, g] = w.useState(!1), [C, R] = w.useState(null), [S, a] = w.useState(null), h = w.useRef(null), _ = w.useRef(null), k = w.useRef(!1), x = e.label || e.text || e.sourceNodeId, E = lt(e, {
    // 时间轴可有几十个视频片段；默认不批量挂 <video>，只让正在编辑的单个片段加载真实帧。
    isSingleSelected: p && b === 1
  }), G = w.useCallback(() => {
    const u = h.current;
    !u || typeof u.animate != "function" || u.animate([{ transform: "scale(1)" }, { transform: "scale(1.015)" }, { transform: "scale(1)" }], {
      duration: 130,
      easing: "cubic-bezier(.2,.7,.3,1)"
    });
  }, []), j = w.useCallback(
    (u) => {
      const y = o.getState();
      u ? (y.setTimelineSnapGuide({ frame: u.frame, label: u.point.label }), u.point.label !== _.current && (_.current = u.point.label, G())) : (y.setTimelineSnapGuide(null), _.current = null);
    },
    [G]
  ), A = w.useCallback(
    (u, y) => {
      u.preventDefault(), u.stopPropagation();
      const P = u.pointerId, K = u.currentTarget, Q = u.clientX, V = y === "left" ? e.startFrame : e.endFrame;
      let Z = 0, q = !1;
      _.current = null, K.setPointerCapture(P);
      const n = (M) => {
        const $ = o.getState().timeline.scale;
        let D = Math.round((M.clientX - Q) / $);
        if (M.shiftKey)
          j(null);
        else {
          const v = o.getState().timeline, I = ue(v, { excludeClipIds: /* @__PURE__ */ new Set([e.id]) }), B = oe(V + D, I, pe($));
          B && (D = B.frame - V), j(B);
        }
        const Y = D - Z;
        if (Y === 0) return;
        q || (o.getState().captureTimelineUndo(), q = !0), Z = D, o.getState().resizeTimelineClip(e.id, y, Y);
        const J = o.getState().timeline, z = J.tracks.flatMap((v) => v.clips).find((v) => v.id === e.id);
        if (z) {
          const v = J.fps || 30, I = z.endFrame - z.startFrame, B = Z >= 0 ? "+" : "−";
          a({ edge: y, text: `${B}${Math.abs(Z)}f · ${(I / v).toFixed(1)}s` });
        }
      }, l = () => {
        K.releasePointerCapture(P), window.removeEventListener("pointermove", n), window.removeEventListener("pointerup", l), o.getState().setTimelineSnapGuide(null), a(null);
      };
      window.addEventListener("pointermove", n), window.addEventListener("pointerup", l);
    },
    [j, e.endFrame, e.id, e.startFrame]
  ), m = w.useCallback(
    (u) => {
      if (o.getState().timelineSplitMode || u.target.closest(".workbench-timeline-clip__handle") || u.shiftKey) return;
      u.preventDefault();
      const y = u.pointerId, P = u.currentTarget, K = u.clientX;
      k.current = !1, _.current = null;
      const Q = o.getState();
      let V = Q.selectedTimelineClipIds;
      V.includes(e.id) || (Q.selectTimelineClip(e.id), V = [e.id]);
      const Z = new Set(V), q = V.length > 1, n = [];
      for (const z of Q.timeline.tracks)
        for (const v of z.clips)
          Z.has(v.id) && n.push({ id: v.id, startFrame: v.startFrame, endFrame: v.endFrame });
      const l = n.find((z) => z.id === e.id) ?? {
        id: e.id,
        startFrame: e.startFrame,
        endFrame: e.endFrame
      }, M = Math.max(1, l.endFrame - l.startFrame);
      let $ = l.startFrame, D = {};
      P.setPointerCapture(y), g(!0);
      const Y = (z) => {
        const v = o.getState().timeline.scale;
        Math.abs(z.clientX - K) > 3 && !k.current && (k.current = !0, o.getState().captureTimelineUndo());
        let I = Math.max(0, l.startFrame + Math.round((z.clientX - K) / v));
        if (z.shiftKey)
          j(null);
        else {
          const B = o.getState().timeline, O = ue(B, { excludeClipIds: Z }), te = pe(v), ae = oe(I, O, te), re = oe(I + M, O, te);
          let ce = null;
          ae && (!re || Math.abs(ae.deltaFrame) <= Math.abs(re.deltaFrame)) ? (I = Math.max(0, ae.frame), ce = ae) : re && (I = Math.max(0, re.frame - M), ce = re), j(ce);
        }
        if ($ = I, q) {
          const B = je(
            o.getState().timeline,
            n,
            I - l.startFrame
          ), O = {};
          for (const te of n) O[te.id] = Math.max(0, te.startFrame + B);
          D = O, o.getState().moveTimelineClips(O, { commit: !1 });
        } else
          o.getState().moveTimelineClip(e.id, I, { commit: !1 });
      }, J = () => {
        P.releasePointerCapture(y), window.removeEventListener("pointermove", Y), window.removeEventListener("pointerup", J), g(!1), o.getState().setTimelineSnapGuide(null), q && Object.keys(D).length > 0 ? o.getState().moveTimelineClips(D, { commit: !0 }) : q || o.getState().moveTimelineClip(e.id, $, { commit: !0 });
      };
      window.addEventListener("pointermove", Y), window.addEventListener("pointerup", J);
    },
    [j, e.endFrame, e.id, e.startFrame]
  ), f = Math.max(36, H(e.frameCount, t)), T = E.kind === "video" ? /* @__PURE__ */ r.jsx(
    "video",
    {
      className: d(
        "workbench-timeline-clip__thumb",
        "block absolute inset-0 w-full h-full object-cover rounded-[inherit] bg-[var(--nomi-ink-10)]"
      ),
      src: Se(E.src),
      crossOrigin: "use-credentials",
      muted: !0,
      playsInline: !0,
      preload: "metadata",
      draggable: !1,
      onError: (u) => {
        Oe(E.src, u.currentTarget.error).then(He);
      }
    }
  ) : E.kind === "image" ? /* @__PURE__ */ r.jsx(
    Ee,
    {
      className: d(
        "workbench-timeline-clip__thumb",
        "block absolute inset-0 w-full h-full object-cover rounded-[inherit] bg-[var(--nomi-ink-10)]"
      ),
      src: E.src,
      alt: ""
    }
  ) : null, F = d(
    "workbench-timeline-clip",
    "absolute top-[5px] bottom-[5px] flex items-center gap-0 p-0",
    "rounded text-[var(--workbench-ink)] text-micro font-medium",
    "shadow-[inset_0_1px_0_var(--workbench-bevel)] cursor-grab select-none active:cursor-grabbing",
    e.type === "image" && "border border-[color-mix(in_srgb,var(--workbench-accent)_22%,transparent)] bg-[var(--workbench-accent-soft)]",
    e.type === "video" && "border border-[color-mix(in_srgb,var(--workbench-video)_24%,transparent)] bg-[var(--workbench-video-soft)]",
    // audio clip 视觉（紫色调 --workbench-audio，与图=蓝/视频=青区分）
    e.type === "audio" && "border border-[color-mix(in_srgb,var(--workbench-audio)_24%,transparent)] bg-[var(--workbench-audio-soft)]"
  ), W = p ? d(
    e.type === "video" && "border-[color-mix(in_srgb,var(--workbench-video)_56%,transparent)] bg-[color-mix(in_srgb,var(--workbench-video)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-video)_13%,transparent),0_8px_18px_var(--workbench-video-soft)]",
    e.type === "audio" && "border-[color-mix(in_srgb,var(--workbench-audio)_56%,transparent)] bg-[color-mix(in_srgb,var(--workbench-audio)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-audio)_13%,transparent),0_8px_18px_var(--workbench-audio-soft)]",
    e.type === "image" && "border-[color-mix(in_srgb,var(--workbench-accent)_62%,transparent)] bg-[color-mix(in_srgb,var(--workbench-accent)_16%,var(--workbench-surface))] shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--workbench-accent)_13%,transparent),0_8px_18px_var(--workbench-accent-soft)]"
  ) : "", N = d(
    "workbench-timeline-clip__handle",
    "absolute top-0 bottom-0 z-[2] w-3 p-0 m-0 border-0 bg-transparent appearance-none",
    "inline-flex items-center justify-center cursor-ew-resize"
  ), X = d(
    "block w-[3px] h-3.5 rounded-full pointer-events-none",
    "shadow-[0_0_0_1px_oklch(1_0_0/0.72)]",
    e.type === "video" && "bg-[var(--workbench-video)]",
    e.type === "audio" && "bg-[var(--workbench-audio)]",
    e.type === "image" && "bg-[var(--workbench-accent)]"
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      ref: h,
      className: d(F, W),
      "data-testid": "timeline-clip",
      "data-clip-type": e.type,
      title: x,
      "data-selected": p ? "true" : "false",
      "data-dragging": s ? "true" : "false",
      style: {
        left: H(e.startFrame, t),
        width: f,
        zIndex: s ? 5 : void 0,
        cursor: i ? "col-resize" : s ? "grabbing" : void 0
      },
      onClick: (u) => {
        if (i) {
          u.stopPropagation();
          const P = h.current?.getBoundingClientRect();
          if (!P) return;
          const K = e.startFrame + ee(u.clientX - P.left, t);
          o.getState().splitTimelineClip(e.id, K), R(null);
          return;
        }
        if (k.current) {
          k.current = !1;
          return;
        }
        u.stopPropagation();
        const y = o.getState();
        if (u.shiftKey || u.metaKey || u.ctrlKey) {
          y.selectTimelineClip(e.id, { additive: !0 });
          return;
        }
        y.selectTimelineClip(e.id), y.setTimelinePlayhead(e.startFrame);
      },
      onPointerMove: i ? (u) => {
        const y = h.current?.getBoundingClientRect();
        if (!y) return;
        const P = u.clientX - y.left, K = ee(P, t);
        R(K > 3 && K < e.frameCount - 3 ? P : null);
      } : void 0,
      onPointerLeave: i ? () => R(null) : void 0,
      onPointerDown: m,
      children: [
        p ? /* @__PURE__ */ r.jsx(
          "button",
          {
            type: "button",
            className: d(N, "workbench-timeline-clip__handle--left", "left-0 rounded-l-[5px]"),
            "aria-label": c("timelineEditor.clip.resizeStart"),
            title: c("timelineEditor.clip.resizeStart"),
            onPointerDown: (u) => A(u, "left"),
            children: /* @__PURE__ */ r.jsx("span", { className: X, "aria-hidden": "true" })
          }
        ) : null,
        T,
        /* @__PURE__ */ r.jsx(
          "span",
          {
            className: d(
              "workbench-timeline-clip__label",
              "relative z-[1] min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
              "rounded-nomi-sm text-[var(--nomi-ink)] backdrop-blur-[8px]",
              "self-end mt-auto mx-1 mb-1 px-[5px] py-0.5 bg-[color-mix(in_oklch,var(--nomi-paper)_72%,transparent)]"
            ),
            children: x
          }
        ),
        i && C !== null ? /* @__PURE__ */ r.jsx(
          "span",
          {
            className: d(
              "workbench-timeline-clip__cut-line",
              "absolute top-0 bottom-0 z-[3] w-0 pointer-events-none",
              "border-l border-dashed border-[var(--workbench-danger)]"
            ),
            style: { left: `${C}px` },
            "aria-hidden": "true"
          }
        ) : null,
        p ? /* @__PURE__ */ r.jsx(
          "button",
          {
            type: "button",
            className: d(N, "workbench-timeline-clip__handle--right", "right-0 rounded-r-[5px]"),
            "aria-label": c("timelineEditor.clip.resizeEnd"),
            title: c("timelineEditor.clip.resizeEnd"),
            onPointerDown: (u) => A(u, "right"),
            children: /* @__PURE__ */ r.jsx("span", { className: X, "aria-hidden": "true" })
          }
        ) : null,
        S ? /* @__PURE__ */ r.jsx(
          "span",
          {
            className: d(
              "workbench-timeline-clip__trim-tag",
              "absolute -top-[19px] z-[4] pointer-events-none whitespace-nowrap",
              "px-[5px] py-px rounded-nomi-sm text-micro tabular-nums",
              "bg-[var(--nomi-snap-tag)] text-[var(--nomi-paper)]",
              S.edge === "left" ? "left-0" : "right-0"
            ),
            "aria-hidden": "true",
            children: S.text
          }
        ) : null
      ]
    }
  );
}
const dt = w.memo(ct);
function mt({ track: e, variant: c = "primary" }) {
  const { t } = ie(), p = e.type === "image" ? t("timelineEditor.track.imageLabel") : e.type === "video" ? t("timelineEditor.track.videoLabel") : t("timelineEditor.track.audioLabel"), b = c === "secondary", i = o((m) => m.timeline.scale), s = o((m) => m.timeline.fps), g = o((m) => m.addTimelineClipAtFrame), C = o((m) => m.setTimelinePlayhead), R = o((m) => m.setTimelineSelection), S = w.useRef(null), [a, h] = w.useState(null), [_, k] = w.useState(!1), x = w.useCallback(
    (m) => {
      const f = S.current?.getBoundingClientRect();
      return f ? ge(m, f.left, i) : 0;
    },
    [i]
  ), E = w.useCallback(
    (m) => !!(m.includes(de) || e.type === "audio" && m.includes(se)),
    [e.type]
  ), G = w.useCallback(
    (m) => {
      const f = fe(
        m.dataTransfer.getData(de)
      );
      if (!f) return null;
      const F = be.getState().nodes.find((X) => X.id === f.nodeId) || f.node, W = x(m.clientX), N = Fe(F, {
        fps: s,
        startFrame: W,
        resultId: f.resultId
      });
      return N ? it({
        track: e,
        clip: N,
        startFrame: W,
        scale: i,
        fps: s
      }) : null;
    },
    [x, s, i, e]
  ), j = w.useCallback(
    (m) => {
      if (e.type !== "audio") return !1;
      const f = ve(m.dataTransfer.getData(se), {
        fps: s,
        startFrame: x(m.clientX)
      });
      return f ? (m.preventDefault(), h(null), k(!1), f === "reject" && ne(t("timelineEditor.track.audioOnly"), "warning"), !0) : !1;
    },
    [e.type, x, s, t]
  ), A = w.useCallback(
    (m) => {
      if (j(m)) return;
      const f = G(m) || a;
      if (!f) return;
      if (m.preventDefault(), h(null), !f.canPlace) {
        ne(f.reason || t("timelineEditor.track.unavailable"), "warning");
        return;
      }
      const T = fe(
        m.dataTransfer.getData(de)
      );
      if (!T) {
        g(f.clip, me(f.clip.type), f.startFrame);
        return;
      }
      const W = be.getState().nodes.find((N) => N.id === T.nodeId) || T.node;
      We(W, {
        fps: s,
        startFrame: f.startFrame,
        resultId: T.resultId
      }).then((N) => {
        const X = N || f.clip;
        g(X, me(X.type), f.startFrame);
      });
    },
    [j, g, a, G, s, t]
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: d(
        "workbench-timeline-track",
        "w-full grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
        b ? "min-h-[40px] mb-1" : "min-h-[52px] mb-1.5",
        "items-center border-b-0"
      ),
      "data-testid": "timeline-track",
      "data-track-type": e.type,
      children: [
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: d(
              "workbench-timeline-track__label",
              "sticky left-0 z-[3] flex items-center gap-[7px]",
              b ? "min-h-[40px]" : "min-h-[52px]",
              "min-w-0 pr-3 border-r-0 bg-transparent",
              b ? "text-[var(--workbench-muted)] text-micro font-medium" : "text-[var(--workbench-ink)] text-xs font-semibold"
            ),
            children: [
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: d(
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
                  className: d(
                    "workbench-timeline-track__name",
                    "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  ),
                  children: p
                }
              ),
              /* @__PURE__ */ r.jsx(
                "span",
                {
                  className: d(
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
            ref: S,
            className: d(
              "workbench-timeline-track__clips",
              b ? "min-h-[30px]" : "min-h-[46px]",
              "relative overflow-hidden cursor-crosshair",
              "border border-[var(--nomi-line-soft)] rounded-[var(--nomi-radius-sm)]",
              "bg-[var(--nomi-ink-05)] transition-[background,box-shadow] duration-[140ms] ease-in-out",
              a && a.canPlace && "bg-[var(--workbench-accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-accent)_20%,transparent)]",
              a && !a.canPlace && "bg-[var(--workbench-danger-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-danger)_28%,transparent)]",
              // v0.7.4: drag 中没有 preview 时也给一个 hover 高亮（accent）
              !a && _ && "bg-[var(--workbench-accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-accent)_20%,transparent)]"
            ),
            style: {
              width: "var(--workbench-timeline-content-width, 100%)",
              minWidth: "var(--workbench-timeline-content-width, 100%)"
            },
            "data-drag-over": a ? "true" : "false",
            "data-drop-valid": a ? String(a.canPlace) : void 0,
            onClick: (m) => {
              o.getState().timelineSplitMode || (C(x(m.clientX)), m.shiftKey || R([]));
            },
            onDragEnter: (m) => {
              E(m.dataTransfer.types) && (m.preventDefault(), k(!0));
            },
            onDragLeave: (m) => {
              m.currentTarget.contains(m.relatedTarget) || (h(null), k(!1));
            },
            onDragOver: (m) => {
              E(m.dataTransfer.types) && (m.preventDefault(), m.dataTransfer.dropEffect = "copy");
            },
            onDrop: (m) => {
              k(!1), A(m);
            },
            children: [
              e.clips.length === 0 ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: d(
                    "workbench-timeline-track__empty",
                    "absolute inset-0 flex items-center justify-center",
                    "border border-dashed border-[var(--nomi-line)] rounded-[var(--nomi-radius-sm)]",
                    "text-[var(--nomi-ink-40)] leading-none text-micro font-medium pointer-events-none"
                  ),
                  children: e.type === "audio" ? t("timelineEditor.track.emptyAudio") : t("timelineEditor.track.emptyVisual")
                }
              ) : null,
              a ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: d(
                    "workbench-timeline-track__drop-preview",
                    "absolute top-[5px] bottom-[5px] z-[2] pointer-events-none",
                    "flex items-center justify-center overflow-visible rounded text-micro font-semibold",
                    "border border-dashed backdrop-blur-[8px] shadow-[0_8px_20px_rgba(18,24,38,0.12)]",
                    a.canPlace ? "border-[color-mix(in_srgb,var(--workbench-accent)_58%,transparent)] bg-[color-mix(in_srgb,var(--workbench-accent)_20%,var(--nomi-paper))] text-[var(--workbench-ink)]" : "border-[color-mix(in_srgb,var(--workbench-danger)_64%,transparent)] bg-[var(--workbench-danger-soft)] text-[var(--workbench-danger)]"
                  ),
                  "data-valid": a.canPlace ? "true" : "false",
                  style: { left: a.left, width: a.width },
                  children: /* @__PURE__ */ r.jsx("span", { className: d("px-2 whitespace-nowrap rounded-full bg-white/70 shadow-sm"), children: a.canPlace ? t("timelineEditor.track.placeAt", { timecode: a.timecode }) : a.reason })
                }
              ) : null,
              e.clips.map((m) => /* @__PURE__ */ r.jsx(dt, { clip: m }, m.id))
            ]
          }
        )
      ]
    }
  );
}
const we = w.memo(mt);
function ut() {
  const { t: e } = ie(), c = o((a) => a.timeline.textClips), t = o((a) => a.timeline.scale), p = o((a) => a.selectedTextClipId), b = o((a) => a.selectTimelineTextClip), i = o((a) => a.moveTimelineTextClip), s = o((a) => a.resizeTimelineTextClip), g = o((a) => a.setTimelinePlayhead), C = w.useRef(null), R = w.useCallback(
    (a, h, _) => {
      a.preventDefault(), a.stopPropagation();
      const k = a.pointerId, x = a.currentTarget;
      x.setPointerCapture?.(k), b(h);
      const E = C.current?.getBoundingClientRect(), j = (E ? ee(a.clientX - E.left, t) : _) - _;
      let A = !1;
      const m = (F, W) => {
        const N = C.current?.getBoundingClientRect();
        if (!N) return;
        const X = Math.max(0, ee(F - N.left, t) - j);
        i(h, X, { commit: W });
      }, f = (F) => {
        A || (o.getState().captureTimelineUndo(), A = !0), m(F.clientX, !1);
      }, T = (F) => {
        m(F.clientX, !0), x.releasePointerCapture?.(k), window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", T);
      };
      window.addEventListener("pointermove", f), window.addEventListener("pointerup", T);
    },
    [i, t, b]
  ), S = w.useCallback(
    (a, h, _) => {
      a.preventDefault(), a.stopPropagation();
      const k = a.pointerId, x = a.currentTarget;
      x.setPointerCapture?.(k), b(h);
      let E = !1;
      const G = (m, f) => {
        const T = C.current?.getBoundingClientRect();
        if (!T) return;
        const F = Math.max(0, ee(m - T.left, t));
        s(h, _, F, { commit: f });
      }, j = (m) => {
        E || (o.getState().captureTimelineUndo(), E = !0), G(m.clientX, !1);
      }, A = (m) => {
        G(m.clientX, !0), x.releasePointerCapture?.(k), window.removeEventListener("pointermove", j), window.removeEventListener("pointerup", A);
      };
      window.addEventListener("pointermove", j), window.addEventListener("pointerup", A);
    },
    [s, t, b]
  );
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: d(
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
            className: d(
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
                  className: d(
                    "flex-none min-w-0 h-auto ml-auto px-1.5 py-px inline-grid place-items-center border-0 rounded-full",
                    "bg-[var(--nomi-ink-05)] text-[var(--nomi-ink-40)] text-micro font-bold tabular-nums"
                  ),
                  children: c.length
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            ref: C,
            className: d(
              "workbench-timeline-track__clips",
              "relative min-h-[30px] overflow-hidden cursor-crosshair",
              "border border-[var(--nomi-line-soft)] rounded-[var(--nomi-radius-sm)]",
              "bg-[var(--nomi-ink-05)]"
            ),
            style: {
              width: "var(--workbench-timeline-content-width, 100%)",
              minWidth: "var(--workbench-timeline-content-width, 100%)"
            },
            onPointerDown: (a) => {
              const h = C.current?.getBoundingClientRect();
              h && g(ge(a.clientX, h.left, t));
            },
            children: [
              c.length === 0 ? /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: d(
                    "workbench-timeline-track__empty",
                    "absolute inset-0 flex items-center justify-center",
                    "border border-dashed border-[var(--nomi-line)] rounded-[var(--nomi-radius-sm)]",
                    "text-[var(--nomi-ink-40)] leading-none text-micro font-medium pointer-events-none"
                  ),
                  children: e("timelineEditor.textTrack.emptyHint")
                }
              ) : null,
              c.map((a) => {
                const h = H(a.startFrame, t), _ = Math.max(24, H(a.endFrame - a.startFrame, t)), k = p === a.id;
                return /* @__PURE__ */ r.jsxs(
                  "button",
                  {
                    type: "button",
                    className: d(
                      "workbench-timeline-text-clip",
                      "absolute top-[5px] bottom-[5px] z-[1] flex items-center gap-1 px-2 overflow-hidden",
                      "rounded-[var(--nomi-radius-sm)] cursor-grab active:cursor-grabbing touch-none text-left",
                      "border bg-[var(--workbench-text-soft)] text-[var(--nomi-ink)] text-micro font-semibold",
                      k ? "border-[var(--workbench-text)] shadow-[0_0_0_1px_var(--workbench-text)]" : "border-[color-mix(in_oklch,var(--workbench-text)_36%,transparent)]"
                    ),
                    style: { left: `${h}px`, width: `${_}px` },
                    title: a.style === "title" ? e("timelineEditor.textTrack.titleCard") : e("timelineEditor.textTrack.caption"),
                    onPointerDown: (x) => R(x, a.id, a.startFrame),
                    onClick: () => g(a.startFrame),
                    children: [
                      /* @__PURE__ */ r.jsx(Ze, { size: 12, className: "flex-none opacity-70" }),
                      /* @__PURE__ */ r.jsx("span", { className: "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap", children: a.text || e("timelineEditor.textTrack.empty") }),
                      /* @__PURE__ */ r.jsx(
                        "span",
                        {
                          role: "separator",
                          "aria-label": e("timelineEditor.textTrack.resizeLeft"),
                          className: "absolute inset-y-0 left-0 w-1.5 z-[2] cursor-ew-resize hover:bg-[var(--workbench-text)]",
                          onPointerDown: (x) => S(x, a.id, "left"),
                          onClick: (x) => x.stopPropagation()
                        }
                      ),
                      /* @__PURE__ */ r.jsx(
                        "span",
                        {
                          role: "separator",
                          "aria-label": e("timelineEditor.textTrack.resizeRight"),
                          className: "absolute inset-y-0 right-0 w-1.5 z-[2] cursor-ew-resize hover:bg-[var(--workbench-text)]",
                          onPointerDown: (x) => S(x, a.id, "right"),
                          onClick: (x) => x.stopPropagation()
                        }
                      )
                    ]
                  },
                  a.id
                );
              })
            ]
          }
        )
      ]
    }
  );
}
function pt({
  showAudio: e,
  showText: c
}) {
  const { t } = ie(), p = o((h) => h.addTimelineTextClip), b = o((h) => h.selectTimelineTextClip), i = o((h) => h.timeline.fps), [s, g] = w.useState(!1);
  if (!e && !c) return null;
  const C = () => {
    const h = o.getState().timeline.playheadFrame;
    b(p("caption", h));
  }, R = (h) => {
    if (g(!1), !e) return;
    const _ = o.getState().timeline.playheadFrame;
    ve(h.dataTransfer.getData(se), { fps: i, startFrame: _ }) && h.preventDefault();
  }, S = (h) => e && h.includes(se), a = c ? /* @__PURE__ */ r.jsxs(
    Ne,
    {
      onClick: C,
      className: "h-6 px-2 text-micro [&>svg]:size-3 gap-1",
      "aria-label": t("timelineEditor.secondary.addCaption"),
      children: [
        /* @__PURE__ */ r.jsx(ke, { stroke: 2 }),
        t("timelineEditor.secondary.caption")
      ]
    }
  ) : null;
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: d(
        "workbench-timeline-secondary-add",
        "w-full min-h-[30px] grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
        "items-center mb-1 border-b-0 gap-2"
      ),
      "data-testid": "timeline-secondary-add",
      children: [
        /* @__PURE__ */ r.jsxs(
          "span",
          {
            className: d(
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
            className: d(
              "relative h-[26px] flex items-center justify-center rounded-[var(--nomi-radius-sm)]",
              "border border-dashed transition-[background,border-color] duration-[var(--nomi-transition-fast)]",
              s ? "border-[var(--workbench-audio)] bg-[var(--workbench-audio-soft)]" : "border-[var(--nomi-line)]"
            ),
            "data-testid": "timeline-secondary-audio-drop",
            onDragEnter: (h) => {
              S(h.dataTransfer.types) && (h.preventDefault(), g(!0));
            },
            onDragOver: (h) => {
              S(h.dataTransfer.types) && (h.preventDefault(), h.dataTransfer.dropEffect = "copy");
            },
            onDragLeave: (h) => {
              h.currentTarget.contains(h.relatedTarget) || g(!1);
            },
            onDrop: R,
            children: [
              /* @__PURE__ */ r.jsxs(
                "span",
                {
                  className: d(
                    "flex items-center gap-1.5 text-micro font-medium text-[var(--nomi-ink-40)] pointer-events-none"
                  ),
                  children: [
                    /* @__PURE__ */ r.jsx(Ye, { size: 12, stroke: 1.8 }),
                    t("timelineEditor.secondary.dropAudio")
                  ]
                }
              ),
              a ? /* @__PURE__ */ r.jsx("span", { className: "absolute right-1", children: a }) : null
            ]
          }
        ) : /* @__PURE__ */ r.jsx("div", { className: "flex items-center", children: a })
      ]
    }
  );
}
const xe = 1.24;
function ht(e, c) {
  const t = Math.floor(e / c), p = Math.floor(t / 60), b = t % 60;
  return `${p}:${String(b).padStart(2, "0")}`;
}
function bt(e, c) {
  const t = H(e, c);
  return t < 36 ? e * 10 : t < 72 ? e * 5 : t < 132 ? e * 2 : e;
}
function ft(e) {
  const c = Math.max(1, e.fps), t = c * 120, p = c * 60;
  return Math.max(
    t,
    e.durationFrame + p,
    e.playheadFrame + p
  );
}
function wt(e, c, t) {
  const p = Math.max(0, e), b = bt(c, t), i = [];
  for (let s = 0; s <= p && i.length < 360; s += b)
    i.push({ frame: s, label: ht(s, c) });
  return i;
}
function Mt({ density: e = "compact", regionLabel: c, actionLabelPrefix: t, showTextTrack: p = !1, onCollapse: b }) {
  const { t: i } = ie(), s = o((n) => n.timeline), g = o((n) => n.selectedTimelineClipIds), C = o((n) => n.selectedTextClipId), R = o((n) => n.removeTimelineTextClip), S = o((n) => n.timelineSnapGuide), a = o((n) => n.duplicateTimelineClip), h = o((n) => n.nudgeTimelineClip), _ = o((n) => n.removeSelectedTimelineClips), k = o((n) => n.setTimelineZoom), x = o((n) => n.timelineSplitMode), E = o((n) => n.setTimelineSplitMode), G = o((n) => n.timelineUndoStack.length > 0), j = o((n) => n.undoTimeline), A = o((n) => n.timelineRedoStack.length > 0), m = o((n) => n.redoTimeline), f = g.length > 0 ? g[g.length - 1] : "", T = g.length > 0, F = w.useMemo(() => {
    if (g.length !== 1 || !f) return null;
    for (const n of s.tracks) {
      const l = n.clips.find((M) => M.id === f);
      if (l) return l.sourceNodeId ? l : null;
    }
    return null;
  }, [g, f, s.tracks]), W = w.useCallback(() => {
    import("./sendStoryboardToTimeline-Bd6dW1iR.js").then(({ arrangeStoryboardToTimeline: n }) => {
      const l = n();
      l.sent.length > 0 ? ne(i("timelineEditor.arranged", { count: l.sent.length }), "success") : l.total === 0 ? ne(i("timelineEditor.noShots"), "info") : ne(i("timelineEditor.alreadyArranged"), "info");
    });
  }, [i]), N = o((n) => n.setTimelinePlayhead), X = o((n) => n.splitTimelineClip), u = Ie(s), y = w.useMemo(
    () => ft({
      durationFrame: u,
      playheadFrame: s.playheadFrame,
      fps: s.fps
    }),
    [u, s.fps, s.playheadFrame]
  ), P = w.useMemo(
    () => wt(y, s.fps, s.scale),
    [y, s.fps, s.scale]
  ), Q = Math.max(H(y, s.scale), 2400);
  w.useEffect(() => {
    const n = (l) => {
      if (!(l.defaultPrevented || l.target?.closest('input, textarea, [contenteditable="true"]'))) {
        if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "z" && !l.shiftKey) {
          l.preventDefault(), o.getState().undoTimeline();
          return;
        }
        if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "z" && l.shiftKey) {
          l.preventDefault(), o.getState().redoTimeline();
          return;
        }
        if (l.key === "Escape" && o.getState().timelineSplitMode) {
          l.preventDefault(), o.getState().setTimelineSplitMode(!1);
          return;
        }
        if (l.key === "ArrowLeft" || l.key === "ArrowRight") {
          l.preventDefault(), N(s.playheadFrame + (l.key === "ArrowLeft" ? -1 : 1));
          return;
        }
        if (C && (l.key === "Backspace" || l.key === "Delete")) {
          l.preventDefault(), R(C);
          return;
        }
        if (T) {
          if (l.key === "Backspace" || l.key === "Delete") {
            l.preventDefault(), _();
            return;
          }
          if (f) {
            if (l.key.toLowerCase() === "s") {
              l.preventDefault(), X(f, s.playheadFrame);
              return;
            }
            if ((l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "d") {
              l.preventDefault(), a(f);
              return;
            }
            l.shiftKey && (l.key === "<" || l.key === ">") && (l.preventDefault(), h(f, l.key === "<" ? -1 : 1));
          }
        }
      }
    };
    return window.addEventListener("keydown", n), () => window.removeEventListener("keydown", n);
  }, [
    a,
    T,
    h,
    f,
    _,
    R,
    C,
    N,
    X,
    s.playheadFrame
  ]);
  const V = w.useRef(null), Z = w.useCallback((n) => {
    const l = V.current?.getBoundingClientRect();
    return l ? Math.max(0, ee(n - l.left, o.getState().timeline.scale)) : 0;
  }, []), q = w.useCallback((n) => {
    n.preventDefault(), n.stopPropagation();
    const l = n.pointerId, M = n.currentTarget;
    M.setPointerCapture?.(l);
    const $ = (J, z) => {
      const v = o.getState();
      let I = Z(J);
      if (z)
        v.setTimelineSnapGuide(null);
      else {
        const B = ue(v.timeline, { includePlayhead: !1 }), O = oe(I, B, pe(v.timeline.scale));
        O ? (I = O.frame, v.setTimelineSnapGuide({ frame: O.frame, label: O.point.label })) : v.setTimelineSnapGuide(null);
      }
      v.setTimelinePlayhead(I);
    };
    $(n.clientX, n.shiftKey);
    const D = (J) => $(J.clientX, J.shiftKey), Y = () => {
      M.releasePointerCapture?.(l), window.removeEventListener("pointermove", D), window.removeEventListener("pointerup", Y), o.getState().setTimelineSnapGuide(null);
    };
    window.addEventListener("pointermove", D), window.addEventListener("pointerup", Y);
  }, [Z]);
  return /* @__PURE__ */ r.jsxs(
    "section",
    {
      className: d(
        "workbench-timeline",
        "relative min-w-0 min-h-0 grid grid-rows-[minmax(0,1fr)]",
        "bg-[var(--workbench-surface-solid)] border-t border-[var(--workbench-border)]",
        "shadow-[0_-1px_0_var(--workbench-bevel)]",
        e === "full" ? "px-[18px] pt-[10px] pb-5" : "px-4 pt-3 pb-4"
      ),
      "data-density": e,
      "aria-label": c,
      style: { "--workbench-timeline-content-width": `${Q}px` },
      children: [
        /* @__PURE__ */ r.jsx("div", { className: d(
          "workbench-timeline__controls",
          "absolute top-[10px] right-4 z-[8] inline-flex items-center gap-0.5",
          "bg-[color-mix(in_oklch,var(--nomi-paper)_84%,transparent)]",
          "rounded-full backdrop-blur-[10px]"
        ), children: /* @__PURE__ */ r.jsxs("div", { className: d(
          "workbench-timeline__right",
          "inline-flex items-center gap-0.5 min-w-0 p-0"
        ), children: [
          T ? /* @__PURE__ */ r.jsxs("div", { className: d(
            "workbench-timeline__clip-tools",
            "inline-flex items-center gap-0.5 pr-0 border-r-0"
          ), "aria-label": i("timelineEditor.selectedClipActions"), children: [
            F ? /* @__PURE__ */ r.jsx(
              L,
              {
                className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-accent)] shadow-none cursor-pointer hover:bg-[var(--workbench-accent-soft)]"),
                label: i("timelineEditor.regenerate"),
                title: i("timelineEditor.regenerateHint"),
                icon: /* @__PURE__ */ r.jsx(Me, { size: 14 }),
                onClick: () => {
                  import("./generationRunController-CRopUfFZ.js").then((n) => n.g).then(({ regenerateNodeInPlace: n }) => n(F.sourceNodeId));
                }
              }
            ) : null,
            /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.nudgeEarlier"), icon: /* @__PURE__ */ r.jsx(Xe, { size: 14 }), onClick: () => h(f, -1) }),
            /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.duplicateClip"), icon: /* @__PURE__ */ r.jsx(Ke, { size: 14 }), onClick: () => a(f) }),
            /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.nudgeLater"), icon: /* @__PURE__ */ r.jsx(Ue, { size: 14 }), onClick: () => h(f, 1) })
          ] }) : null,
          /* @__PURE__ */ r.jsx(
            L,
            {
              className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-accent)] shadow-none cursor-pointer hover:bg-[var(--workbench-accent-soft)]"),
              label: i("timelineEditor.aiArrange"),
              title: i("timelineEditor.aiArrangeHint"),
              icon: /* @__PURE__ */ r.jsx(Be, { size: 14 }),
              onClick: W
            }
          ),
          /* @__PURE__ */ r.jsx(
            L,
            {
              className: d(
                "workbench-timeline__tool",
                "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] shadow-none cursor-pointer",
                x ? "bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent)] hover:bg-[var(--workbench-accent-soft)]" : "bg-transparent text-[var(--workbench-muted)] hover:bg-[var(--workbench-hover)]"
              ),
              label: i(x ? "timelineEditor.exitSplitMode" : "timelineEditor.splitMode"),
              title: i(x ? "timelineEditor.splitModeActiveHint" : "timelineEditor.splitModeHint"),
              icon: /* @__PURE__ */ r.jsx(qe, { size: 14 }),
              onClick: () => E(!x)
            }
          ),
          A ? /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.redo"), title: i("timelineEditor.redoShortcut"), icon: /* @__PURE__ */ r.jsx(Ae, { size: 14 }), onClick: () => m() }) : null,
          G ? /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.undo"), title: i("timelineEditor.undoShortcut"), icon: /* @__PURE__ */ r.jsx(Re, { size: 14 }), onClick: () => j() }) : null,
          /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.zoomOut", { prefix: t }), icon: /* @__PURE__ */ r.jsx(De, { size: 14 }), onClick: () => k(s.scale / 1.25) }),
          /* @__PURE__ */ r.jsxs("span", { className: "text-micro opacity-60 min-w-[32px] text-center", children: [
            Math.round(s.scale * 100),
            "%"
          ] }),
          /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.resetZoom"), icon: /* @__PURE__ */ r.jsx($e, { size: 14 }), onClick: () => k(1) }),
          /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.zoomIn", { prefix: t }), icon: /* @__PURE__ */ r.jsx(ke, { size: 14 }), onClick: () => k(s.scale * 1.25) }),
          /* @__PURE__ */ r.jsx(L, { className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"), label: i("timelineEditor.deleteSelected", { prefix: t }), icon: /* @__PURE__ */ r.jsx(Pe, { size: 14 }), disabled: !T, onClick: () => _() }),
          b ? /* @__PURE__ */ r.jsx(
            L,
            {
              className: d("workbench-timeline__tool", "w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]"),
              label: i("timelineEditor.collapse", { prefix: t }),
              icon: /* @__PURE__ */ r.jsx(Ge, { size: 14 }),
              onClick: b
            }
          ) : null
        ] }) }),
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: d(
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
              k(Math.min(ze, Math.max(Le, s.scale * l)));
            },
            children: [
              /* @__PURE__ */ r.jsxs("div", { className: d(
                "workbench-timeline__ruler",
                "w-full grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]",
                "h-[22px] mb-1.5 border-b border-[var(--nomi-line-soft)] bg-transparent"
              ), children: [
                /* @__PURE__ */ r.jsx("div", { className: d(
                  "workbench-timeline__ruler-spacer",
                  "sticky left-0 z-[4] border-r-0 bg-transparent"
                ), "aria-hidden": "true" }),
                /* @__PURE__ */ r.jsx(
                  "div",
                  {
                    ref: V,
                    className: d(
                      "workbench-timeline__ruler-content",
                      "relative h-full cursor-pointer bg-transparent touch-none"
                    ),
                    style: {
                      width: "var(--workbench-timeline-content-width, 100%)",
                      minWidth: "var(--workbench-timeline-content-width, 100%)"
                    },
                    "aria-label": i("timelineEditor.ruler"),
                    onPointerDown: q,
                    children: P.map((n) => /* @__PURE__ */ r.jsx(
                      "span",
                      {
                        className: d(
                          "workbench-timeline__ruler-tick",
                          "absolute left-0 top-0 w-0 h-full bg-transparent text-[var(--workbench-muted)]",
                          'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-px after:h-[22px] after:bg-[var(--nomi-line)]'
                        ),
                        "data-origin": n.frame === 0 ? "true" : "false",
                        style: { transform: `translateX(${H(n.frame, s.scale)}px)` },
                        children: /* @__PURE__ */ r.jsx("span", { className: d(
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
              S ? /* @__PURE__ */ r.jsxs(
                "div",
                {
                  className: d(
                    "workbench-timeline__snap-guide",
                    "absolute top-0 bottom-0 left-[var(--workbench-timeline-label-width)] z-[7] w-0 pointer-events-none"
                  ),
                  style: { transform: `translateX(${H(S.frame, s.scale)}px)` },
                  "aria-hidden": "true",
                  children: [
                    /* @__PURE__ */ r.jsx("div", { className: "absolute top-0 bottom-0 left-0 w-px -translate-x-1/2 bg-[repeating-linear-gradient(var(--nomi-snap)_0_4px,transparent_4px_8px)]" }),
                    /* @__PURE__ */ r.jsx("span", { className: d(
                      "absolute top-0.5 left-1 px-1 rounded-nomi-sm whitespace-nowrap",
                      "font-mono text-micro leading-[14px] text-[var(--nomi-paper)] bg-[var(--nomi-snap-tag)]"
                    ), children: S.label })
                  ]
                }
              ) : null,
              /* @__PURE__ */ r.jsx(
                "div",
                {
                  className: d(
                    "workbench-timeline__playhead",
                    "absolute top-0 bottom-0 left-[var(--workbench-timeline-label-width)] z-[6]",
                    "w-px bg-[var(--workbench-accent)] shadow-[0_0_0_1px_rgba(0,122,255,0.08)]",
                    "pointer-events-none"
                  ),
                  style: { transform: `translateX(${H(s.playheadFrame, s.scale)}px)` },
                  "aria-hidden": "true",
                  children: /* @__PURE__ */ r.jsx(
                    "button",
                    {
                      type: "button",
                      className: d(
                        "workbench-timeline__playhead-handle",
                        "absolute -top-px left-1/2 -translate-x-1/2 w-[11px] h-[11px] p-0",
                        "rounded-nomi-sm border-[1.5px] border-[var(--nomi-paper)] bg-[var(--workbench-accent)]",
                        "shadow-[0_1px_2px_oklch(0_0_0/0.2)] cursor-ew-resize pointer-events-auto touch-none"
                      ),
                      "aria-label": i("timelineEditor.dragPlayhead"),
                      title: i("timelineEditor.dragPlayhead"),
                      onPointerDown: q
                    }
                  )
                }
              ),
              s.tracks.filter((n) => n.type !== "audio").map((n) => /* @__PURE__ */ r.jsx(we, { track: n, variant: "primary" }, n.id)),
              (() => {
                const n = s.tracks.find((Y) => Y.type === "audio"), l = (n?.clips.length ?? 0) > 0, M = (s.textClips?.length ?? 0) > 0, $ = !!n && !l, D = p && !M;
                return /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
                  n && l ? /* @__PURE__ */ r.jsx(we, { track: n, variant: "secondary" }, n.id) : null,
                  p && M ? /* @__PURE__ */ r.jsx(ut, {}) : null,
                  $ || D ? /* @__PURE__ */ r.jsx(pt, { showAudio: $, showText: D }) : null
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
  Mt as default
};
