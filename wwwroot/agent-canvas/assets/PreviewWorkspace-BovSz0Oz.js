import { aT as Je, e6 as je, e7 as P, S as h, df as Ze, D as St, V as It, W as Ft, ci as l, aL as b, a9 as F, n as Nt, s as Mt, Z as Rt, dx as zt, aA as At, cJ as Lt, aD as Dt, di as Ge, ee as Ot, c3 as C, aN as Z, d6 as _e, d7 as Qe, aM as Bt, db as se, c7 as $t, by as Te, bz as q, dW as Ut, ay as Wt, aB as Xt, dJ as We, cr as Yt, q as Ht, a8 as Xe, x as Vt, J as qt } from "./agentStudioMount-CnF6gUyG.js";
import Kt from "./TimelinePanel-CvRpMDkF.js";
import { I as Jt } from "./IconChevronRight-DCt05yYU.js";
import { I as Zt } from "./IconDownload-jpogXoH4.js";
import { I as ge } from "./IconLetterCase-BCOi3-Wu.js";
import { a as Gt, I as Qt } from "./IconMinimize-Do8qreFd.js";
import { I as er } from "./IconPlayerPause-DvX0SyCj.js";
import { I as tr } from "./IconPlayerSkipBack-CXnL-wHT.js";
import { I as rr } from "./IconRefresh-ByGyVxBz.js";
import { I as nr } from "./IconVolumeOff-crb7wCkC.js";
import { a as ir, I as or } from "./IconZoomOut-HXlqDpWW.js";
import { N as Ee } from "./NomiSelect-BiogPU6p.js";
import { w as Ye } from "./generationRunController-wyKPxPqV.js";
import { c as ar, l as sr, a as lr } from "./timelineDragPayload-B0tGfedC.js";
const cr = [["path", { d: "M4 5v14l12 -7l-12 -7", key: "svg-0" }], ["path", { d: "M20 5l0 14", key: "svg-1" }]], dr = Je("outline", "player-skip-forward", "PlayerSkipForward", cr);
const ur = [["path", { d: "M15 8a5 5 0 0 1 0 8", key: "svg-0" }], ["path", { d: "M17.7 5a9 9 0 0 1 0 14", key: "svg-1" }], ["path", { d: "M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5", key: "svg-2" }]], mr = Je("outline", "volume", "Volume", ur), J = "w-6 h-6 inline-grid place-items-center p-0 border border-transparent rounded-full bg-transparent text-[var(--workbench-muted)] enabled:cursor-pointer enabled:hover:bg-[var(--workbench-hover)] enabled:hover:text-[var(--workbench-ink)] disabled:hover:bg-transparent disabled:hover:text-[var(--workbench-muted)]";
function pr({ timeline: e, selectedTextClipId: t }) {
  const { t: r } = je(), o = P((d) => d.updateTimelineTextClipTransform), a = P((d) => d.updateTimelineTextClipFont), [n, s] = h.useState(""), c = (e.textClips ?? []).find((d) => d.id === t) || null, m = c ? Ze(c).scale : 1, u = c?.fontFamily ?? St, p = Math.round(m * 100);
  h.useEffect(() => {
    s(String(p));
  }, [p, t]);
  const v = h.useCallback(
    (d) => {
      t && o(
        t,
        { scale: Math.min(It, Math.max(Ft, d)) },
        { commit: !0 }
      );
    },
    [t, o]
  ), x = h.useCallback(() => {
    const d = Number(n);
    Number.isFinite(d) && d > 0 && v(d / 100);
  }, [v, n]);
  return c ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx(
      "div",
      {
        className: b("workbench-preview-player__control-separator", "w-px h-5 bg-[var(--workbench-border-soft)]"),
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ l.jsxs(
      "div",
      {
        className: b("workbench-preview-player__text-style", "flex-none inline-flex items-center gap-1.5"),
        "aria-label": r("timelinePreview.textStyle.aria"),
        children: [
          /* @__PURE__ */ l.jsx("span", { className: "text-micro text-[var(--workbench-muted)] font-bold", children: r("timelinePreview.textStyle.size") }),
          /* @__PURE__ */ l.jsxs("div", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ l.jsx(
              F,
              {
                className: b(J),
                label: r("timelinePreview.textStyle.decrease"),
                icon: /* @__PURE__ */ l.jsx(Nt, { size: 14 }),
                onClick: () => v(m - 0.1)
              }
            ),
            /* @__PURE__ */ l.jsx(
              "input",
              {
                className: b(
                  "w-[40px] h-6 text-center text-micro font-bold tabular-nums",
                  "rounded-[var(--nomi-radius-sm)] border border-[var(--workbench-border)] bg-[var(--nomi-paper)] text-[var(--workbench-ink)] outline-none focus:border-[var(--nomi-accent)]"
                ),
                value: n,
                inputMode: "numeric",
                "aria-label": r("timelinePreview.textStyle.percentage"),
                onChange: (d) => s(d.target.value.replace(/[^0-9]/g, "")),
                onBlur: x,
                onKeyDown: (d) => {
                  d.key === "Enter" && d.target.blur();
                }
              }
            ),
            /* @__PURE__ */ l.jsx("span", { className: "text-micro text-[var(--workbench-muted-soft)]", children: "%" }),
            /* @__PURE__ */ l.jsx(
              F,
              {
                className: b(J),
                label: r("timelinePreview.textStyle.increase"),
                icon: /* @__PURE__ */ l.jsx(Mt, { size: 14 }),
                onClick: () => v(m + 0.1)
              }
            )
          ] }),
          /* @__PURE__ */ l.jsx(
            Ee,
            {
              ariaLabel: r("timelinePreview.textStyle.font"),
              leadingLabel: r("timelinePreview.textStyle.font"),
              size: "xs",
              value: u,
              options: Rt.map((d) => ({
                value: d.id,
                label: r(`timelinePreview.textStyle.fonts.${d.id}`)
              })),
              onChange: (d) => {
                t && a(t, d);
              }
            }
          )
        ]
      }
    )
  ] }) : null;
}
function He(e, t) {
  const r = t ? e.offsetX * t.width : 0, o = t ? e.offsetY * t.height : 0;
  return { transform: `translate(${r}px, ${o}px) scale(${e.scale})` };
}
function Ve(e) {
  return e.fit === "cover" ? "object-cover" : "object-contain";
}
function hr(e, t, r) {
  return r ? {
    offsetX: e.originOffsetX + t.x / r.width,
    offsetY: e.originOffsetY + t.y / r.height
  } : { offsetX: e.originOffsetX, offsetY: e.originOffsetY };
}
const fr = 1040;
function wr(e) {
  const t = Math.max(0, Number(e.containerWidth) || 0), r = Math.max(0, Number(e.containerHeight) || 0), o = Math.max(1, Number(e.ratioWidth) || 1), a = Math.max(1, Number(e.ratioHeight) || 1), n = Math.max(1, Number(e.maxWidth) || fr);
  if (t <= 0 || r <= 0)
    return { width: 0, height: 0 };
  const s = o / a;
  let c = Math.min(t, n, r * s), m = c / s;
  return m > r && (m = r, c = m * s), {
    width: Math.max(1, Math.floor(c)),
    height: Math.max(1, Math.floor(m))
  };
}
const br = ["nw", "ne", "se", "sw"], vr = {
  nw: "-top-[5px] -left-[5px] cursor-nwse-resize",
  ne: "-top-[5px] -right-[5px] cursor-nesw-resize",
  se: "-bottom-[5px] -right-[5px] cursor-nwse-resize",
  sw: "-bottom-[5px] -left-[5px] cursor-nesw-resize"
};
function xr({
  centerNorm: e,
  scale: t,
  stageWidth: r,
  stageHeight: o,
  onTransform: a,
  onSnapGuides: n,
  children: s
}) {
  const c = h.useCallback((u) => {
    if (u.target.closest("[data-handle]")) return;
    u.preventDefault(), u.stopPropagation();
    const p = u.currentTarget;
    p.setPointerCapture?.(u.pointerId);
    const v = u.clientX, x = u.clientY, d = { x: e.x * r, y: e.y * o }, w = (y, E, S) => {
      const R = { x: d.x + (y - v), y: d.y + (E - x) }, z = zt(At(Lt(R, r, o)));
      n({ x: z.guideX, y: z.guideY }), a({ position: z.center }, S);
    }, g = (y) => w(y.clientX, y.clientY, !1), k = (y) => {
      w(y.clientX, y.clientY, !0), n({ x: null, y: null }), p.releasePointerCapture?.(u.pointerId), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", k);
    };
    window.addEventListener("pointermove", g), window.addEventListener("pointerup", k);
  }, [e.x, e.y, n, a, o, r]), m = h.useCallback((u) => {
    u.preventDefault(), u.stopPropagation();
    const p = u.currentTarget;
    p.setPointerCapture?.(u.pointerId);
    const v = { x: e.x * r, y: e.y * o }, x = Math.hypot(u.clientX - v.x, u.clientY - v.y) || 1, d = t, w = (y, E, S) => {
      const R = Math.hypot(y - v.x, E - v.y);
      a({ scale: Dt(d * (R / x)) }, S);
    }, g = (y) => w(y.clientX, y.clientY, !1), k = (y) => {
      w(y.clientX, y.clientY, !0), p.releasePointerCapture?.(u.pointerId), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", k);
    };
    window.addEventListener("pointermove", g), window.addEventListener("pointerup", k);
  }, [e.x, e.y, a, t, o, r]);
  return /* @__PURE__ */ l.jsxs(
    "div",
    {
      className: b(
        "workbench-overlay-selection",
        "absolute pointer-events-auto cursor-move touch-none",
        "outline outline-2 outline-[var(--nomi-accent)]"
      ),
      style: {
        left: `${e.x * r}px`,
        top: `${e.y * o}px`,
        transform: "translate(-50%, -50%)"
      },
      onPointerDown: c,
      children: [
        s,
        br.map((u) => /* @__PURE__ */ l.jsx(
          "span",
          {
            "data-handle": u,
            className: b(
              "workbench-overlay-selection__handle",
              "absolute w-[10px] h-[10px] rounded-nomi-sm touch-none",
              "border-[1.5px] border-[var(--nomi-accent)] bg-[var(--nomi-paper)]",
              "shadow-nomi-sm",
              vr[u]
            ),
            onPointerDown: m
          },
          u
        ))
      ]
    }
  );
}
function ye(e, t) {
  return e.find((r) => r.type === t) || null;
}
function Se(e) {
  const t = Math.max(1, e.fps), r = Math.max(0, e.playheadFrame - e.clip.startFrame);
  return (e.clip.offsetStartFrame + r) / t;
}
function gr(e, t) {
  const r = h.useRef(null), o = e?.url || "", { playing: a, playheadFrame: n, fps: s, volume: c, muted: m } = t;
  return h.useEffect(() => {
    const u = r.current;
    if (!u || !e?.url) return;
    const p = Se({ clip: e, playheadFrame: n, fps: s });
    if (!Number.isFinite(p)) return;
    const v = a ? 0.3 : 0.04;
    Math.abs(u.currentTime - p) < v || (u.currentTime = p);
  }, [s, n, e, a]), h.useEffect(() => {
    const u = r.current;
    u && (u.volume = c, u.muted = m);
  }, [o, c, m]), h.useEffect(() => {
    const u = r.current;
    if (!(!u || !e?.url)) {
      if (a) {
        u.play().catch(() => {
        });
        return;
      }
      if (!u.paused)
        try {
          u.pause();
        } catch {
        }
    }
  }, [a, e?.url]), { audioRef: r, audioUrl: o };
}
const ke = [
  { value: "16:9", label: "16:9", css: "16 / 9", width: 16, height: 9 },
  { value: "9:16", label: "9:16", css: "9 / 16", width: 9, height: 16 },
  { value: "1:1", label: "1:1", css: "1 / 1", width: 1, height: 1 },
  { value: "4:5", label: "4:5", css: "4 / 5", width: 4, height: 5 },
  { value: "3:4", label: "3:4", css: "3 / 4", width: 3, height: 4 },
  { value: "4:3", label: "4:3", css: "4 / 3", width: 4, height: 3 },
  { value: "21:9", label: "21:9", css: "21 / 9", width: 21, height: 9 }
];
function yr(e, t, r, o, a, n) {
  const s = Math.min(n, o / 2, a / 2);
  e.beginPath(), e.moveTo(t + s, r), e.arcTo(t + o, r, t + o, r + a, s), e.arcTo(t + o, r + a, t, r + a, s), e.arcTo(t, r + a, t, r, s), e.arcTo(t, r, t + o, r, s), e.closePath();
}
function et(e, t, r, o) {
  const a = (t.text || "").trim();
  if (!a) return;
  const n = Ge(t, r, o), s = n.maxWidthPx - (n.hasBackdrop ? n.fontSizePx * 1.4 : 0);
  e.save(), e.font = `${n.fontWeight} ${n.fontSizePx}px ${n.fontFamily}`, e.textAlign = "center", e.textBaseline = "middle";
  const c = Ot(a, Math.max(1, s), (E) => e.measureText(E).width), m = n.fontSizePx * n.lineHeight, u = c.length * m, p = c.reduce((E, S) => Math.max(E, e.measureText(S).width), 0), v = n.hasBackdrop ? n.fontSizePx * 0.7 : 0, x = n.hasBackdrop ? n.fontSizePx * 0.32 : 0, d = Math.min(n.maxWidthPx, p + v * 2), w = u + x * 2, g = n.centerX - d / 2, k = n.centerY - w / 2;
  n.hasBackdrop && (yr(e, g, k, d, w, n.fontSizePx * 0.32), e.fillStyle = "rgba(248, 247, 243, 0.86)", e.fill(), e.lineWidth = 1, e.strokeStyle = "rgba(29, 29, 31, 0.10)", e.stroke()), e.fillStyle = "rgb(29, 29, 31)";
  const y = n.centerY - u / 2 + m / 2;
  c.forEach((E, S) => {
    e.fillText(E, n.centerX, y + S * m);
  }), e.restore();
}
const kr = {
  "16:9": { width: 16, height: 9 },
  "9:16": { width: 9, height: 16 },
  "1:1": { width: 1, height: 1 },
  "4:5": { width: 4, height: 5 },
  "3:4": { width: 3, height: 4 },
  "4:3": { width: 4, height: 3 },
  "21:9": { width: 21, height: 9 }
}, Pr = 1280, Tr = "#ffffff";
function Er(e, t = Pr) {
  const r = kr[e], o = Math.max(320, Math.floor(t));
  return {
    width: o,
    height: Math.max(1, Math.round(o * r.height / r.width))
  };
}
function le(e) {
  return typeof e.url == "string" && e.url.trim().length > 0;
}
function Ce(e, t) {
  return e.find((r) => r.type === t) || null;
}
function Cr(e) {
  return new Promise((t, r) => {
    const o = new Image();
    o.crossOrigin = "anonymous", o.decoding = "async", o.onload = () => t(o), o.onerror = () => r(new Error(`无法加载导出图片素材：${e}`)), o.src = e;
  });
}
function jr(e) {
  return new Promise((t, r) => {
    const o = document.createElement("video");
    o.className = "workbench-export__video-source", o.crossOrigin = "anonymous", o.muted = !0, o.playsInline = !0, o.preload = "auto", o.onloadedmetadata = () => t(o), o.onerror = () => r(new Error(`无法加载导出视频素材：${e}`)), o.src = e, o.load();
  });
}
function _r(e) {
  return Promise.race([
    new Promise((t, r) => {
      const o = () => {
        e.removeEventListener("seeked", a), e.removeEventListener("error", n);
      }, a = () => {
        o(), t();
      }, n = () => {
        o(), r(new Error("视频素材 seek 失败"));
      };
      e.addEventListener("seeked", a, { once: !0 }), e.addEventListener("error", n, { once: !0 });
    }),
    new Promise((t, r) => setTimeout(() => r(new Error("视频定位超时")), 5e3))
  ]);
}
async function Sr(e, t) {
  const r = Math.max(0, t);
  if (Number.isFinite(e.currentTime) && Math.abs(e.currentTime - r) < 0.04) return;
  const o = _r(e);
  e.currentTime = r, await o, typeof e.requestVideoFrameCallback == "function" && await new Promise((a) => {
    e.requestVideoFrameCallback(() => a());
  });
}
async function Ir(e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
  for (const n of e.tracks)
    for (const s of n.clips)
      le(s) && (s.type === "image" && t.add(s.url), s.type === "video" && r.add(s.url));
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  return await Promise.all(Array.from(t, async (n) => {
    o.set(n, await Cr(n));
  })), await Promise.all(Array.from(r, async (n) => {
    a.set(n, await jr(n));
  })), { images: o, videos: a };
}
function qe(e, t, r, o, a, n) {
  const s = Bt(se(n), a.width, a.height, r, o);
  s.width <= 0 || s.height <= 0 || e.drawImage(t, s.x, s.y, s.width, s.height);
}
function Fr(e) {
  const { context: t, timeline: r, frame: o, size: a, background: n, assets: s } = e, c = _e(r, o), m = Ce(c, "video"), u = Ce(c, "image");
  if (t.clearRect(0, 0, a.width, a.height), t.fillStyle = n, t.fillRect(0, 0, a.width, a.height), u && le(u)) {
    const p = s.images.get(u.url);
    p && qe(t, p, p.naturalWidth, p.naturalHeight, a, u);
  }
  if (m && le(m)) {
    const p = s.videos.get(m.url);
    p && p.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && qe(t, p, p.videoWidth, p.videoHeight, a, m);
  }
  for (const p of Qe(r, o))
    et(t, p, a.width, a.height);
}
function Nr(e) {
  if (e) {
    if (!MediaRecorder.isTypeSupported(e))
      throw new Error(C.t("runtime.export.unsupportedFormat", { format: e }));
    return e;
  }
  return [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].find((r) => MediaRecorder.isTypeSupported(r));
}
function tt(e, t) {
  const r = URL.createObjectURL(e), o = document.createElement("a");
  o.className = "workbench-export__download-link", o.href = r, o.download = t, document.body.appendChild(o), o.click(), o.remove(), window.setTimeout(() => URL.revokeObjectURL(r), 5e3);
}
function rt(e = "webm") {
  const t = /* @__PURE__ */ new Date(), r = (o) => String(o).padStart(2, "0");
  return `nomi-${t.getFullYear()}${r(t.getMonth() + 1)}${r(t.getDate())}-${r(t.getHours())}${r(t.getMinutes())}.${e}`;
}
async function Mr(e) {
  if (typeof document > "u") throw new Error(C.t("runtime.export.browserOnly"));
  if (typeof MediaRecorder > "u") throw new Error(C.t("runtime.export.mediaRecorderUnsupported"));
  const t = Z(e.timeline);
  if (t <= 0) throw new Error(C.t("runtime.export.emptyTimeline"));
  const r = Er(e.aspectRatio, e.width);
  e.onProgress?.({ status: "preparing", frame: 0, totalFrames: t, ratio: 0 });
  const o = await Ir(e.timeline), a = document.createElement("canvas");
  a.className = "workbench-export__canvas", a.width = r.width, a.height = r.height;
  const n = a.getContext("2d");
  if (!n) throw new Error(C.t("runtime.export.canvasUnavailable"));
  const s = a.captureStream(e.timeline.fps), c = Nr(e.mimeType), m = c ? new MediaRecorder(s, { mimeType: c }) : new MediaRecorder(s), u = [], p = new Promise((d, w) => {
    m.ondataavailable = (g) => {
      g.data.size > 0 && u.push(g.data);
    }, m.onerror = () => w(new Error("导出录制失败")), m.onstop = () => {
      d(new Blob(u, { type: m.mimeType || "video/webm" }));
    };
  });
  for (const d of o.videos.values())
    d.currentTime = 0;
  m.start(), e.onProgress?.({ status: "recording", frame: 0, totalFrames: t, ratio: 0 });
  const v = 1e3 / e.timeline.fps;
  try {
    await new Promise((d, w) => {
      let g = 0;
      const k = async () => {
        try {
          const y = _e(e.timeline, g), E = Ce(y, "video");
          if (E && le(E)) {
            const S = o.videos.get(E.url);
            if (S) {
              const R = Se({ clip: E, playheadFrame: g, fps: e.timeline.fps });
              await Sr(S, R);
            }
          }
          if (Fr({
            context: n,
            timeline: e.timeline,
            frame: g,
            size: r,
            background: e.background || Tr,
            assets: o
          }), e.onProgress?.({
            status: "recording",
            frame: g,
            totalFrames: t,
            ratio: Math.min(1, g / t)
          }), g >= t - 1) {
            d();
            return;
          }
          g += 1, setTimeout(() => {
            k();
          }, v);
        } catch (y) {
          w(y);
        }
      };
      setTimeout(() => {
        k();
      }, 0);
    });
  } catch (d) {
    m.state !== "inactive" && m.stop();
    for (const w of o.videos.values())
      w.pause();
    throw d;
  }
  m.stop();
  for (const d of o.videos.values())
    d.pause();
  const x = await p;
  if (x.size <= 0) throw new Error(C.t("runtime.export.emptyResult"));
  return e.onProgress?.({ status: "done", frame: t, totalFrames: t, ratio: 1 }), rt("webm"), x;
}
const Rr = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 }
}, zr = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "21:9": 21 / 9
};
function oe(e) {
  return Math.max(2, Math.round(e / 2) * 2);
}
function Ar(e, t) {
  if (t === "16:9") return Rr[e];
  const r = e === "720p" ? 720 : 1080, o = zr[t];
  return o >= 1 ? { width: oe(r * o), height: oe(r) } : { width: oe(r), height: oe(r / o) };
}
function Lr(e) {
  const t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const o of e)
    for (const a of o.clips) {
      const n = a.sourceNodeId, s = a.url ?? "";
      let c = r.get(n);
      c || (c = /* @__PURE__ */ new Map(), r.set(n, c));
      let m = c.get(s);
      m === void 0 && (m = c.size === 0 ? n : `${n}#${c.size + 1}`, c.set(s, m)), t.set(a.id, m);
    }
  return t;
}
function Dr(e, t) {
  const r = e;
  return {
    id: t,
    kind: e.type,
    ...e.url ? { url: e.url } : {},
    ...typeof r.hasAudio == "boolean" ? { hasAudio: r.hasAudio } : {}
  };
}
function Or(e, t) {
  const r = {
    ...t,
    ...e
  }, o = e?.url ?? t.url, a = e?.hasAudio ?? t.hasAudio;
  return o !== void 0 && (r.url = o), a !== void 0 && (r.hasAudio = a), r;
}
function Br(e, t) {
  return e.reduce((r, o) => (o.clips.forEach((a) => {
    const n = t.get(a.id) ?? a.sourceNodeId, s = Dr(a, n);
    r[s.id] = Or(r[s.id], s);
  }), r), {});
}
function $r(e, t) {
  const r = se(e);
  return {
    id: e.id,
    assetId: t.get(e.id) ?? e.sourceNodeId,
    startFrame: e.startFrame,
    endFrame: e.endFrame,
    sourceStartFrame: e.offsetStartFrame,
    sourceEndFrame: Math.max(e.offsetStartFrame + 1, e.frameCount - e.offsetEndFrame),
    ...$t(r) ? {} : { transform: r }
  };
}
function Ur(e, t) {
  return {
    id: e.id,
    kind: e.type,
    type: e.type,
    clips: e.clips.map((r) => $r(r, t))
  };
}
function Wr(e) {
  const t = Z(e.timeline), r = Ar(e.resolution, e.aspectRatio), o = Lr(e.timeline.tracks), a = e.timeline.tracks.map((s) => Ur(s, o)).filter((s) => s.clips.length > 0), n = [];
  return a.length === 0 && n.unshift("Timeline has no image or video clips to render."), {
    version: 1,
    projectId: e.projectId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    timeline: {
      fps: e.timeline.fps,
      durationFrames: t,
      range: { startFrame: 0, endFrame: t },
      tracks: a
    },
    profile: {
      preset: e.preset,
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "aac",
      audioMode: "mixdown",
      width: r.width,
      height: r.height,
      fps: e.timeline.fps,
      pixelFormat: "yuv420p",
      quality: e.quality
    },
    assets: Br(e.timeline.tracks, o),
    diagnostics: { warnings: n }
  };
}
function Xr(e, t, r) {
  if (typeof document > "u") return [];
  const o = [];
  for (const a of e.textClips ?? []) {
    if (!(a.text || "").trim()) continue;
    const n = document.createElement("canvas");
    n.width = Math.max(2, Math.round(t)), n.height = Math.max(2, Math.round(r));
    const s = n.getContext("2d");
    if (!s) continue;
    et(s, a, n.width, n.height);
    const c = (n.toDataURL("image/png").split(",")[1] || "").trim();
    c && o.push({ id: a.id, startFrame: a.startFrame, endFrame: a.endFrame, pngBase64: c });
  }
  return o;
}
function ae(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Ke(e) {
  return [ae(e?.url), ae(e?.providerUrl), ae(e?.thumbnailUrl)].filter(Boolean);
}
function Yr(e, t) {
  return t?.sourceNodeId && e.find((r) => r.id === t.sourceNodeId) || null;
}
function nt(e, t) {
  const r = ae(e?.url);
  if (!e) return "";
  const o = Yr(t, e);
  if (!o) return r;
  const a = (o.history || []).find((c) => Ke(c).includes(r)), n = Ye(a);
  if (n) return n;
  const s = Ye(o.result);
  return s && (!r || Ke(o.result).includes(r)) ? s : r;
}
function Hr(e, t) {
  let r = !1;
  const o = e.tracks.map((a) => {
    let n = !1;
    const s = a.clips.map((c) => {
      const m = nt(c, t);
      return !m || m === c.url ? c : (n = !0, r = !0, { ...c, url: m });
    });
    return n ? { ...a, clips: s } : a;
  });
  return r ? { ...e, tracks: o } : e;
}
function Ie() {
  const e = window.localStorage.getItem("user_token");
  return e ? { Authorization: `Bearer ${e}` } : {};
}
async function it(e) {
  const t = await e.json().catch(() => ({})), r = typeof t.detail == "string" ? t.detail : "";
  return new Error(t.message || r || `${C.t("runtime.export.mp4Failed")} (${e.status})`);
}
async function G(e, t = {}) {
  const r = await fetch(e, { ...t, headers: { ...Ie(), ...t.headers } });
  if (!r.ok) throw await it(r);
  const o = await r.json();
  if (o.code !== 200) throw new Error(o.message || C.t("runtime.export.mp4Failed"));
  return o.data;
}
function ot(e) {
  return `/api/v1/agentapp/canvas/workbench/projects/${encodeURIComponent(e)}/exports`;
}
async function Vr(e, t) {
  const { items: r } = await G(`/api/v1/agentapp/canvas/workbench/assets?project_id=${encodeURIComponent(e.projectId)}`, { signal: t }), o = [
    `/uploads/production/${e.projectId}/`,
    `/api/v1/agentapp/production/resource/production/${e.projectId}/`
  ], a = new Set(r.filter(({ data: s }) => s?.kind === "upload" || s?.kind === "production" && o.some((c) => s.url?.startsWith(c))).map((s) => s.data.url)), n = /* @__PURE__ */ new Map();
  for (const s of Object.values(e.assets)) {
    if (!s.url) throw new Error(C.t("runtime.export.missingMedia"));
    const c = new URL(s.url, window.location.origin);
    if (c.origin === window.location.origin && (c.pathname.startsWith("/uploads/") || c.pathname.startsWith("/api/v1/agentapp/production/resource/")) && a.has(c.pathname) && !c.search) {
      s.url = c.pathname;
      continue;
    }
    const u = n.get(s.url);
    if (u) {
      s.url = u;
      continue;
    }
    if (!["http:", "https:", "blob:", "data:"].includes(c.protocol)) throw new Error(C.t("runtime.export.missingMedia"));
    const p = await fetch(s.url, { signal: t, ...c.origin === window.location.origin ? { headers: Ie() } : {} });
    if (!p.ok) throw new Error(C.t("runtime.export.mediaUploadFailed"));
    const v = await p.blob();
    if (v.size > 50 * 1024 * 1024) throw new Error(C.t("runtime.export.mediaTooLarge"));
    const x = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/mp4": "m4a", "audio/aac": "aac", "audio/flac": "flac", "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[v.type.split(";")[0]] || c.pathname.match(/\.([a-zA-Z0-9]+)$/)?.[1];
    if (!x) throw new Error(C.t("runtime.export.mediaUploadFailed"));
    const d = new FormData();
    d.append("file", v, `export-media.${x}`);
    const w = await G(`/api/v1/agentapp/canvas/workbench/assets/${encodeURIComponent(e.projectId)}/upload`, { method: "POST", body: d, signal: t });
    n.set(s.url, w.data.url), s.url = w.data.url;
  }
}
async function qr(e, t, r) {
  return await Vr(e, r), G(ot(e.projectId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 提交不可中途丢失 jobId；收到响应后按 signal 取消已创建的任务。
    body: JSON.stringify({ manifest: e, outputName: t })
  });
}
async function Kr(e) {
  e.onProgress?.({ status: "preparing", ratio: 0 });
  let t = await qr(e.manifest, e.outputName, e.signal);
  const r = `${ot(e.manifest.projectId)}/${t.jobId}`, o = () => {
    G(r, { method: "DELETE" }).catch(() => {
    });
  };
  e.signal?.addEventListener("abort", o, { once: !0 });
  try {
    e.signal?.aborted && (o(), e.signal.throwIfAborted());
    const a = Date.now() + 1920 * 1e3;
    for (; t.status === "preparing" || t.status === "rendering"; ) {
      if (Date.now() > a)
        throw o(), new Error(C.t("runtime.export.exportTimeout"));
      e.onProgress?.({ status: t.status === "preparing" ? "preparing" : "converting", ratio: t.ratio }), await new Promise((c) => window.setTimeout(c, 1e3)), e.signal?.throwIfAborted(), t = await G(r, { signal: e.signal });
    }
    if (t.status !== "succeeded") throw new Error(t.error || C.t("runtime.export.mp4Failed"));
    const n = await fetch(`${r}/download`, { headers: Ie(), signal: e.signal });
    if (!n.ok) throw await it(n);
    const s = await n.blob();
    if (!s.size || !s.type.includes("video/mp4")) throw new Error(C.t("runtime.export.mp4Failed"));
    return tt(s, t.filename), e.onProgress?.({ status: "done", ratio: 1 }), { absolutePath: `${r}/download`, relativePath: t.filename, size: s.size };
  } finally {
    e.signal?.removeEventListener("abort", o);
  }
}
const Pe = 1024 * 1024;
async function Jr(e) {
  const t = q(), r = (e.projectId || Te()).trim();
  if (!r) throw new Error(C.t("runtime.export.missingProjectId"));
  const o = e.resolution || "1080p", a = e.quality || "standard", n = Hr(e.timeline, e.generationNodes || []), s = Wr({
    projectId: r,
    timeline: n,
    aspectRatio: e.aspectRatio,
    resolution: o,
    quality: a,
    preset: "publish"
  });
  if (s.textOverlays = Xr(n, s.profile.width, s.profile.height), !t?.exports?.startJob || !t.exports.writeTempInput || !t.exports.finishTempInput)
    return Kr({ manifest: s, outputName: e.outputName, signal: e.signal, onProgress: e.onProgress });
  const { jobId: c, backend: m } = await t.exports.startJob({
    projectId: r,
    outputName: e.outputName,
    manifest: s
  });
  let u = null, p = !1;
  const v = t.exports.onEvent?.((x) => {
    if (x.jobId !== c) return;
    const d = Math.max(0, Math.min(1, x.snapshot.progress.ratio)), w = x.snapshot.progress.stage, g = w === "succeeded" ? "done" : w === "encoding" || w === "muxing" || w === "finalizing" ? "converting" : "preparing";
    e.onProgress?.({ status: g, ratio: d });
  });
  try {
    if (m === "filtergraph") {
      e.onProgress?.({ status: "converting", ratio: 0.12 });
      const d = await t.exports.finishTempInput({ jobId: c });
      return p = !0, e.onProgress?.({ status: "done", ratio: 1 }), d;
    }
    u = await Mr({
      timeline: n,
      aspectRatio: e.aspectRatio,
      width: e.resolution === "720p" ? 1280 : 1920,
      autoDownload: !1,
      onProgress: (d) => {
        if (d.status === "preparing" || d.status === "recording" || d.status === "done") {
          const w = d.status;
          e.onProgress?.({ status: w, ratio: d.ratio * 0.82 });
        }
      }
    }), e.onProgress?.({ status: "converting", ratio: 0.86 });
    for (let d = 0; d < u.size; d += Pe) {
      const w = await u.slice(d, d + Pe).arrayBuffer();
      await t.exports.writeTempInput({ jobId: c, chunk: w });
      const g = u.size > 0 ? Math.min(1, (d + Pe) / u.size) : 1;
      e.onProgress?.({ status: "converting", ratio: 0.86 + g * 0.04 });
    }
    const x = await t.exports.finishTempInput({ jobId: c });
    return p = !0, e.onProgress?.({ status: "done", ratio: 1 }), x;
  } catch (x) {
    if (!p && t.exports.cancel)
      try {
        await t.exports.cancel(c);
      } catch (g) {
        console.warn("Failed to cancel MP4 export job after renderer-side failure", g);
      }
    const d = x instanceof Error ? x.message : C.t("runtime.export.mp4Failed");
    if (!u)
      throw new Error(d);
    const w = rt("webm");
    throw tt(u, w), new Error(C.t("runtime.export.webmFallbackDownloaded", { message: d, file: w }));
  } finally {
    v?.();
  }
}
function Zr(e) {
  return e.isEmpty ? "时间轴为空，先添加素材" : e.isConverting ? "正在转码 MP4" : e.isRecording ? `导出中 ${Math.max(0, Math.min(100, Math.round(e.progressPercent ?? 0)))}%` : ["导出 MP4：1080p", e.aspectRatio, "标准发布", e.downloadInBrowser ? C.t("runtime.export.browserDownload") : "保存到项目 exports 文件夹"].join(" · ");
}
function Gr(e, {
  videoClip: t,
  videoUrl: r,
  playheadFrame: o,
  fps: a,
  playing: n
}) {
  h.useEffect(() => {
    const s = e.current;
    if (!s || !t || !r) return;
    const c = Se({ clip: t, playheadFrame: o, fps: a });
    if (!Number.isFinite(c)) return;
    const m = n ? 0.3 : 0.04;
    Math.abs(s.currentTime - c) < m || (s.currentTime = c);
  }, [e, a, o, t, r, n]);
}
function Qr({ activeClips: e, aspectRatio: t, fps: r, playheadFrame: o, timeline: a }) {
  const { t: n } = je(), s = h.useRef(null), c = h.useRef(null), m = h.useRef(null), u = h.useRef(null), p = h.useRef(""), v = h.useRef(null), [x, d] = h.useState(!1), [w, g] = h.useState(null), [k, y] = h.useState("idle"), [E, S] = h.useState(0), [R, z] = h.useState(""), [at, Q] = h.useState(""), [ce, de] = h.useState(""), [ee, ue] = h.useState(!1), me = h.useRef(null), [te, st] = h.useState({ x: null, y: null }), [re, lt] = h.useState(1), [O, Fe] = h.useState(!1), [pe, ct] = h.useState(!1), Ne = P((i) => i.addTimelineTextClip), Me = P((i) => i.updateTimelineTextClip), dt = P((i) => i.updateTimelineTextClipTransform), he = P((i) => i.selectTimelineTextClip), Re = P((i) => i.selectedTextClipId), ut = P((i) => i.setPreviewAspectRatio), B = P((i) => i.setTimelineClipFraming), A = P((i) => i.timelinePlaying), K = P((i) => i.setTimelinePlaying), ne = P((i) => i.setTimelinePlayhead), fe = Ut((i) => i.nodes), $ = ye(e, "video"), W = ye(e, "image"), mt = ye(e, "audio"), N = nt($, fe), ze = N ? Wt(N) : "", X = ke.find((i) => i.value === t) || ke[0], L = !!(N || W?.url || ""), I = ($ ?? W)?.id ?? "", we = se(W ?? void 0), be = se($ ?? void 0), M = $ ? be : we, Y = a.tracks.every((i) => i.clips.length === 0) && (a.textClips ?? []).length === 0, ve = Z(a), pt = (o / (a.fps || 30)).toFixed(1), ht = (ve / (a.fps || 30)).toFixed(1), H = k === "preparing" || k === "recording" || k === "converting", ft = Zr({
    aspectRatio: t,
    isEmpty: Y,
    isRecording: k === "recording",
    isConverting: k === "converting",
    progressPercent: E * 100,
    downloadInBrowser: !q()
  });
  Gr(m, { videoClip: $, videoUrl: N, playheadFrame: o, fps: r, playing: A }), h.useEffect(() => {
    const i = m.current;
    i && (i.volume = re, i.muted = O);
  }, [N, re, O]);
  const { audioRef: wt, audioUrl: Ae } = gr(mt, { playing: A, playheadFrame: o, fps: r, volume: re, muted: O });
  h.useEffect(() => {
    const i = () => ct(document.fullscreenElement === c.current);
    return document.addEventListener("fullscreenchange", i), () => document.removeEventListener("fullscreenchange", i);
  }, []);
  const Le = h.useCallback((i) => {
    ne(Math.max(0, Math.min(ve, o + i)));
  }, [o, ne, ve]), bt = h.useCallback(() => {
    const i = c.current;
    i && (document.fullscreenElement ? document.exitFullscreen() : i.requestFullscreen?.());
  }, []);
  h.useEffect(() => {
    const i = m.current;
    if (!(!i || !$ || !N)) {
      if (A) {
        z(""), i.play().catch((f) => {
          const j = f instanceof Error && f.message ? f.message : "video play failed";
          z(n("timelinePreview.videoPlayFailed", { message: j })), K(!1);
        });
        return;
      }
      if (!i.paused)
        try {
          i.pause();
        } catch {
        }
    }
  }, [A, K, $, N, n]), h.useEffect(() => {
    z("");
  }, [ze]), h.useLayoutEffect(() => {
    const i = s.current;
    if (!i || typeof window > "u") return;
    const f = () => {
      const j = i.getBoundingClientRect(), _ = window.getComputedStyle(i), U = Number.parseFloat(_.paddingLeft || "0") + Number.parseFloat(_.paddingRight || "0"), V = Number.parseFloat(_.paddingTop || "0") + Number.parseFloat(_.paddingBottom || "0"), D = wr({
        containerWidth: j.width - U,
        containerHeight: j.height - V,
        ratioWidth: X.width,
        ratioHeight: X.height
      });
      g((T) => T && T.width === D.width && T.height === D.height ? T : D.width > 0 && D.height > 0 ? D : null);
    };
    if (f(), typeof ResizeObserver < "u") {
      const j = new ResizeObserver(f);
      return j.observe(i), () => j.disconnect();
    }
    return window.addEventListener("resize", f), () => window.removeEventListener("resize", f);
  }, [X.height, X.width]);
  const De = h.useCallback((i) => {
    I && B(I, { scale: Xt(M.scale + i) }, { commit: !0 });
  }, [I, M.scale, B]), vt = h.useCallback(() => {
    I && B(I, { scale: 1, offsetX: 0, offsetY: 0 }, { commit: !0 });
  }, [I, B]), Oe = h.useCallback((i) => {
    const f = Ne(i, o);
    Q(f), de(""), ue(!1);
  }, [Ne, o]);
  h.useEffect(() => {
    if (!ee) return;
    const i = (f) => {
      me.current && !me.current.contains(f.target) && ue(!1);
    };
    return window.addEventListener("pointerdown", i), () => window.removeEventListener("pointerdown", i);
  }, [ee]);
  const Be = h.useCallback((i, f) => {
    he(i), Q(i), de(f);
  }, [he]), xt = h.useCallback((i) => {
    const f = ce.trim();
    f && Me(i, f), Q("");
  }, [ce, Me]), xe = h.useCallback(async () => {
    if (!H)
      try {
        y("preparing"), S(0);
        const i = q() ? null : new AbortController();
        v.current = i, i && d(!0);
        const f = Te().trim(), j = await Jr({
          timeline: a,
          aspectRatio: t,
          projectId: f,
          resolution: "1080p",
          quality: "standard",
          generationNodes: fe,
          signal: i?.signal,
          onProgress: (_) => {
            y(_.status), S(_.ratio);
          }
        });
        We(n("timelinePreview.exportComplete", { path: j.relativePath }), "success"), Yt("exported"), q()?.exports.showInFolder({ projectId: f, relativePath: j.relativePath }).catch(() => {
        }), y("idle");
      } catch (i) {
        y("idle");
        const f = i instanceof Error ? i.message : n("timelinePreview.exportFailed");
        We(f, "error");
      } finally {
        v.current = null, p.current = "", d(!1);
      }
  }, [t, H, fe, a, n]);
  h.useEffect(() => {
    if (!H) return;
    const i = q(), f = Te().trim();
    if (!i?.exports?.onEvent || !i.exports.cancel || !f) return;
    const j = i.exports.onEvent((_) => {
      if (_.projectId !== f) return;
      const U = _.snapshot.progress.stage;
      U !== "succeeded" && U !== "failed" && U !== "cancelled" && _.jobId && (p.current = _.jobId, d(!0));
    });
    return () => j?.();
  }, [H]);
  const gt = h.useCallback(() => {
    if (v.current) {
      v.current.abort(), d(!1);
      return;
    }
    const i = p.current;
    i && (d(!1), q()?.exports.cancel(i).catch((f) => {
      console.warn("Failed to cancel export job", f);
    }));
  }, []);
  h.useEffect(() => {
    const i = () => {
      xe();
    };
    return window.addEventListener("nomi-request-export", i), () => window.removeEventListener("nomi-request-export", i);
  }, [xe]);
  const yt = h.useCallback(() => {
    const i = Z(a);
    i <= 0 || (o >= i && ne(0), K(!A));
  }, [o, A, ne, K, a]), kt = h.useCallback((i) => {
    I && (i.target.closest("button") || (i.preventDefault(), i.currentTarget.setPointerCapture(i.pointerId), u.current = {
      pointerId: i.pointerId,
      clipId: I,
      startX: i.clientX,
      startY: i.clientY,
      originOffsetX: M.offsetX,
      originOffsetY: M.offsetY
    }));
  }, [I, M.offsetX, M.offsetY]), ie = h.useCallback((i, f, j) => {
    if (!w) return;
    const _ = hr(i, { x: f.clientX - i.startX, y: f.clientY - i.startY }, w);
    B(i.clipId, _, { commit: j });
  }, [w, B]), Pt = h.useCallback((i) => {
    const f = u.current;
    !f || f.pointerId !== i.pointerId || ie(f, i, !1);
  }, [ie]), $e = h.useCallback((i) => {
    const f = u.current;
    if (!(!f || f.pointerId !== i.pointerId)) {
      ie(f, i, !0), u.current = null;
      try {
        i.currentTarget.releasePointerCapture(i.pointerId);
      } catch {
      }
    }
  }, [ie]), Tt = He(we, w), Et = He(be, w), Ct = Ve(we), jt = Ve(be), Ue = Qe(a, o);
  return /* @__PURE__ */ l.jsxs("section", { className: b(
    "workbench-preview-player",
    "relative min-w-0 min-h-0 flex flex-col items-center p-8 gap-3 bg-[var(--workbench-bg)]"
  ), "aria-label": n("timelinePreview.player"), children: [
    /* @__PURE__ */ l.jsx("div", { ref: s, className: "workbench-preview-player__stage-area flex-1 min-h-0 w-full grid place-items-center", children: /* @__PURE__ */ l.jsxs(
      "div",
      {
        ref: c,
        className: b(
          "workbench-preview-player__stage",
          "relative max-w-full max-h-full grid place-items-center overflow-hidden",
          "rounded-[var(--nomi-radius-lg)] border border-[var(--workbench-border)]",
          "bg-[var(--nomi-paper)] shadow-[var(--workbench-shadow-md)]",
          "cursor-default transition-[width,height] duration-[160ms] ease-in-out touch-none",
          L && "cursor-grab active:cursor-grabbing"
        ),
        "data-aspect-ratio": X.value,
        "data-fit-mode": M.fit,
        "data-has-media": L ? "true" : "false",
        style: {
          aspectRatio: X.css,
          ...w ? { width: `${w.width}px`, height: `${w.height}px` } : null
        },
        onPointerDown: kt,
        onPointerMove: Pt,
        onPointerUp: $e,
        onPointerCancel: $e,
        children: [
          /* @__PURE__ */ l.jsx("div", { className: b(
            "workbench-preview-player__canvas",
            "absolute inset-0 grid place-items-center pointer-events-none",
            L ? "bg-[var(--nomi-paper)]" : "bg-[repeating-linear-gradient(45deg,var(--nomi-ink-05)_0_12px,var(--nomi-paper)_12px_24px)]"
          ), "aria-hidden": L ? "true" : "false", children: L ? null : /* @__PURE__ */ l.jsxs("div", { className: b(
            "workbench-preview-player__placeholder",
            "flex flex-col items-center gap-1 p-0 bg-transparent border-none"
          ), children: [
            /* @__PURE__ */ l.jsx("span", { className: b(
              "workbench-preview-player__placeholder-title",
              "font-nomi-display text-title tracking-tight text-[var(--workbench-muted)]"
            ), children: n("timelinePreview.canvas") }),
            /* @__PURE__ */ l.jsx("span", { className: b(
              "workbench-preview-player__placeholder-sub",
              "text-caption text-[var(--workbench-muted-soft)]"
            ), children: n("timelinePreview.emptyHint") })
          ] }) }),
          R ? /* @__PURE__ */ l.jsx("div", { className: b(
            "workbench-preview-player__media-error",
            "absolute left-3 right-3 bottom-3 z-[4]",
            "py-2 px-2 bg-[color-mix(in_srgb,var(--nomi-paper)_90%,transparent)]",
            "text-[var(--workbench-danger)] text-caption leading-snug pointer-events-none"
          ), role: "alert", children: R }) : null,
          W?.url ? /* @__PURE__ */ l.jsx("img", { className: b(
            "workbench-preview-player__image",
            "absolute inset-0 z-[1] w-full h-full bg-transparent select-none will-change-transform",
            Ct
          ), src: W.url, alt: W.label || "", style: Tt }) : null,
          N ? /* @__PURE__ */ l.jsx(
            "video",
            {
              ref: m,
              className: b(
                "workbench-preview-player__video",
                "absolute inset-0 z-[2] w-full h-full bg-transparent select-none will-change-transform",
                jt
              ),
              src: ze,
              crossOrigin: "use-credentials",
              playsInline: !0,
              style: Et,
              onError: () => {
                ar(N, m.current?.error || null).then((i) => {
                  sr(i), z(n("timelinePreview.videoLoadFailed", { message: lr(i) }));
                }), K(!1);
              }
            }
          ) : null,
          Ae ? /* @__PURE__ */ l.jsx(
            "audio",
            {
              ref: wt,
              src: Ae,
              crossOrigin: "use-credentials",
              preload: "auto",
              className: "hidden",
              "aria-hidden": "true"
            }
          ) : null,
          w && Ue.length > 0 ? /* @__PURE__ */ l.jsxs("div", { className: "workbench-preview-player__text-layer absolute inset-0 z-[3] pointer-events-none", "aria-hidden": "false", children: [
            te.x !== null ? /* @__PURE__ */ l.jsx("div", { className: "absolute top-0 bottom-0 w-px bg-[var(--nomi-accent)] opacity-70 pointer-events-none", style: { left: `${te.x * w.width}px` }, "aria-hidden": "true" }) : null,
            te.y !== null ? /* @__PURE__ */ l.jsx("div", { className: "absolute left-0 right-0 h-px bg-[var(--nomi-accent)] opacity-70 pointer-events-none", style: { top: `${te.y * w.height}px` }, "aria-hidden": "true" }) : null,
            Ue.map((i) => {
              const f = Ge(i, w.width, w.height), j = Ze(i), _ = at === i.id, U = Re === i.id, V = {
                maxWidth: `${f.maxWidthPx}px`,
                fontSize: `${f.fontSizePx}px`,
                fontFamily: f.fontFamily,
                fontWeight: f.fontWeight,
                lineHeight: String(f.lineHeight),
                textAlign: "center",
                color: "var(--nomi-ink)",
                padding: f.hasBackdrop ? "0.32em 0.7em" : 0,
                background: f.hasBackdrop ? "color-mix(in oklch, var(--nomi-paper) 86%, transparent)" : "transparent",
                border: f.hasBackdrop ? "1px solid var(--nomi-line-soft)" : "none",
                borderRadius: "var(--nomi-radius)",
                // 折行契约：预览用 CSS 原生折行，导出 canvas 用 textLayout.wrapTextToWidth 复刻同一语义
                // （white-space:pre-wrap + word-break:break-word ⇔ 显式换行 + 优先整词断 + 超长词逐字断）。
                // 两端共用 box 几何（resolveTextBox）与内边距（0.32em/0.7em ↔ 导出 fontSize*1.4 budget），断行一致。
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }, D = {
                left: `${f.centerX}px`,
                top: `${f.centerY}px`,
                transform: "translate(-50%, -50%)"
              };
              return _ ? /* @__PURE__ */ l.jsx(
                "textarea",
                {
                  className: "workbench-preview-player__text-edit absolute pointer-events-auto resize-none outline-none overflow-hidden",
                  style: { ...D, ...V, boxShadow: "0 0 0 2px var(--nomi-accent)" },
                  value: ce,
                  placeholder: i.text,
                  autoFocus: !0,
                  rows: 1,
                  onFocus: (T) => T.currentTarget.select(),
                  onChange: (T) => de(T.target.value),
                  onBlur: () => xt(i.id),
                  onKeyDown: (T) => {
                    T.key === "Enter" && !T.shiftKey && (T.preventDefault(), T.currentTarget.blur()), T.key === "Escape" && (T.preventDefault(), Q(""));
                  }
                },
                i.id
              ) : U ? /* @__PURE__ */ l.jsx(
                xr,
                {
                  centerNorm: j.position,
                  scale: j.scale,
                  stageWidth: w.width,
                  stageHeight: w.height,
                  onTransform: (T, _t) => dt(i.id, T, { commit: _t }),
                  onSnapGuides: st,
                  children: /* @__PURE__ */ l.jsx("div", { style: V, onDoubleClick: (T) => {
                    T.stopPropagation(), Be(i.id, i.text);
                  }, title: n("timelinePreview.moveResizeEdit"), children: i.text })
                },
                i.id
              ) : /* @__PURE__ */ l.jsx(
                "div",
                {
                  className: "workbench-preview-player__text-box absolute pointer-events-auto cursor-pointer select-none",
                  style: { ...D, ...V },
                  onPointerDown: (T) => {
                    T.stopPropagation(), he(i.id);
                  },
                  onDoubleClick: (T) => {
                    T.stopPropagation(), Be(i.id, i.text);
                  },
                  title: n("timelinePreview.selectEdit"),
                  children: i.text
                },
                i.id
              );
            })
          ] }) : null
        ]
      }
    ) }),
    /* @__PURE__ */ l.jsxs("div", { className: b(
      "workbench-preview-player__control-bar",
      // 窄窗口时换行而非把「导出 MP4」挤出/截断：flex-wrap + 居中；圆角改 lg（换行后不再是单行 pill）。
      "relative z-[3] shrink-0 max-w-full flex flex-wrap justify-center items-center gap-1.5 p-1.5",
      "border border-[var(--workbench-border)] rounded-[var(--nomi-radius-lg)]",
      "bg-[color-mix(in_oklch,var(--nomi-paper)_88%,transparent)]",
      "shadow-[var(--workbench-shadow-sm)] backdrop-blur-[12px] backdrop-saturate-[1.2]",
      // 子项一律不被 flex 挤压：避免画幅/显示下拉被截成「1…」「适.」；满了整组换到下一行。
      "[&>*]:shrink-0"
    ), role: "toolbar", "aria-label": n("timelinePreview.controls"), children: [
      /* @__PURE__ */ l.jsx(
        F,
        {
          className: b(
            "workbench-preview-player__play",
            "w-[30px] h-[30px] grid place-items-center border-0 rounded-full",
            "bg-[var(--nomi-ink)] text-[var(--nomi-paper)]",
            // 禁用态（时间轴为空）不再 hover 高亮成「假可点」：enabled: 门控自身 accent hover，
            // 并用 disabled:hover: 把基类那条无条件 hover:bg-workbench-hover 钉回静息 ink/paper。
            "enabled:hover:bg-[var(--nomi-accent)] enabled:hover:text-[var(--nomi-paper)]",
            "disabled:hover:bg-[var(--nomi-ink)] disabled:hover:text-[var(--nomi-paper)]"
          ),
          label: n(A ? "timelinePreview.pause" : "timelinePreview.play"),
          icon: A ? /* @__PURE__ */ l.jsx(er, { size: 16, stroke: 1.6 }) : /* @__PURE__ */ l.jsx(Ht, { size: 16, stroke: 1.6 }),
          onClick: yt,
          disabled: Y,
          title: Y ? n("timelinePreview.emptyTimeline") : void 0
        }
      ),
      /* @__PURE__ */ l.jsx(
        F,
        {
          className: b("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)] disabled:opacity-40"),
          label: n("timelinePreview.previousFrame"),
          title: n("timelinePreview.previousFrameShortcut"),
          icon: /* @__PURE__ */ l.jsx(tr, { size: 15, stroke: 1.6 }),
          onClick: () => Le(-1),
          disabled: Y
        }
      ),
      /* @__PURE__ */ l.jsx(
        F,
        {
          className: b("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)] disabled:opacity-40"),
          label: n("timelinePreview.nextFrame"),
          title: n("timelinePreview.nextFrameShortcut"),
          icon: /* @__PURE__ */ l.jsx(dr, { size: 15, stroke: 1.6 }),
          onClick: () => Le(1),
          disabled: Y
        }
      ),
      /* @__PURE__ */ l.jsx("span", { className: "text-micro opacity-60 tabular-nums min-w-[60px]", children: n("timelinePreview.timeSummary", { current: pt, total: ht }) }),
      /* @__PURE__ */ l.jsxs("div", { className: b("workbench-preview-player__volume", "inline-flex items-center gap-1"), children: [
        /* @__PURE__ */ l.jsx(
          F,
          {
            className: b("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)]"),
            label: n(O ? "timelinePreview.unmute" : "timelinePreview.mute"),
            title: n(O ? "timelinePreview.unmute" : "timelinePreview.mute"),
            icon: O ? /* @__PURE__ */ l.jsx(nr, { size: 15, stroke: 1.6 }) : /* @__PURE__ */ l.jsx(mr, { size: 15, stroke: 1.6 }),
            onClick: () => Fe((i) => !i)
          }
        ),
        /* @__PURE__ */ l.jsx(
          "input",
          {
            type: "range",
            min: 0,
            max: 1,
            step: 0.05,
            value: O ? 0 : re,
            "aria-label": n("timelinePreview.volume"),
            className: "w-[54px] h-1 cursor-pointer",
            style: { accentColor: "var(--nomi-accent)" },
            onChange: (i) => {
              const f = Number(i.target.value);
              lt(f), Fe(f === 0);
            }
          }
        )
      ] }),
      /* @__PURE__ */ l.jsx(
        F,
        {
          className: b("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)]"),
          label: n(pe ? "timelinePreview.exitFullscreen" : "timelinePreview.fullscreen"),
          title: n(pe ? "timelinePreview.exitFullscreen" : "timelinePreview.fullscreenPreview"),
          icon: pe ? /* @__PURE__ */ l.jsx(Gt, { size: 15, stroke: 1.6 }) : /* @__PURE__ */ l.jsx(Qt, { size: 15, stroke: 1.6 }),
          onClick: bt
        }
      ),
      /* @__PURE__ */ l.jsx("div", { className: b(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ l.jsx(
        Ee,
        {
          ariaLabel: n("timelinePreview.aspectRatio"),
          leadingLabel: n("timelinePreview.aspectRatioShort"),
          size: "xs",
          value: t,
          options: ke.map((i) => ({ value: i.value, label: i.label })),
          onChange: (i) => ut(i)
        }
      ),
      /* @__PURE__ */ l.jsx("div", { className: b(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ l.jsx(
        Ee,
        {
          ariaLabel: n("timelinePreview.fit"),
          leadingLabel: n("timelinePreview.fitShort"),
          size: "xs",
          value: M.fit,
          options: [
            { value: "contain", label: n("timelinePreview.contain") },
            { value: "cover", label: n("timelinePreview.cover") }
          ],
          onChange: (i) => {
            I && B(I, { fit: i }, { commit: !0 });
          }
        }
      ),
      /* @__PURE__ */ l.jsx("div", { className: b(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ l.jsxs("div", { className: b(
        "workbench-preview-player__control-group",
        "flex-none inline-flex items-center gap-1"
      ), "aria-label": n("timelinePreview.framing"), children: [
        /* @__PURE__ */ l.jsx(F, { className: b("workbench-preview-player__icon-button", J), label: n("timelinePreview.zoomOut"), icon: /* @__PURE__ */ l.jsx(ir, { size: 16 }), onClick: () => De(-0.1), disabled: !L }),
        /* @__PURE__ */ l.jsxs("span", { className: b(
          "workbench-preview-player__zoom-label",
          "min-w-[38px] text-[var(--workbench-muted)] text-micro font-bold tabular-nums text-center"
        ), "aria-label": n("timelinePreview.currentZoom"), children: [
          Math.round(M.scale * 100),
          "%"
        ] }),
        /* @__PURE__ */ l.jsx(F, { className: b("workbench-preview-player__icon-button", J), label: n("timelinePreview.resetView"), icon: /* @__PURE__ */ l.jsx(rr, { size: 16 }), onClick: vt, disabled: !L }),
        /* @__PURE__ */ l.jsx(F, { className: b("workbench-preview-player__icon-button", J), label: n("timelinePreview.zoomIn"), icon: /* @__PURE__ */ l.jsx(or, { size: 16 }), onClick: () => De(0.1), disabled: !L })
      ] }),
      /* @__PURE__ */ l.jsx("div", { className: b(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ l.jsxs("div", { ref: me, className: b(
        "workbench-preview-player__text-tools",
        "relative flex-none inline-flex items-center"
      ), "aria-label": n("timelinePreview.addText"), children: [
        /* @__PURE__ */ l.jsxs(
          Xe,
          {
            className: b("h-7 px-2.5 inline-flex items-center gap-1 border border-[var(--workbench-border)] rounded-full whitespace-nowrap bg-transparent text-[var(--workbench-muted)] text-micro font-bold cursor-pointer hover:bg-[var(--workbench-hover)] hover:text-[var(--workbench-ink)]"),
            "aria-label": n("timelinePreview.addText"),
            "aria-expanded": ee,
            title: n("timelinePreview.addTextHint"),
            onClick: () => ue((i) => !i),
            children: [
              /* @__PURE__ */ l.jsx(ge, { size: 14 }),
              n("timelinePreview.text"),
              /* @__PURE__ */ l.jsx(Jt, { size: 12, className: "opacity-60" })
            ]
          }
        ),
        ee ? /* @__PURE__ */ l.jsxs("div", { className: b(
          "workbench-preview-player__text-menu",
          "absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-[5]",
          "min-w-[148px] p-1 flex flex-col gap-0.5",
          "rounded-[var(--nomi-radius)] border border-[var(--workbench-border)]",
          "bg-[var(--nomi-paper)] shadow-[var(--workbench-shadow-pop)]"
        ), role: "menu", children: [
          /* @__PURE__ */ l.jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: b("flex items-center gap-2 px-2 py-1.5 rounded-[var(--nomi-radius-sm)] text-left text-caption text-[var(--workbench-ink)] hover:bg-[var(--workbench-hover)]"),
              onClick: () => Oe("caption"),
              children: [
                /* @__PURE__ */ l.jsx(ge, { size: 14, className: "flex-none text-[var(--workbench-text)]" }),
                /* @__PURE__ */ l.jsx("span", { className: "flex-1", children: n("timelinePreview.caption") }),
                /* @__PURE__ */ l.jsx("span", { className: "text-[var(--workbench-muted-soft)] text-micro", children: n("timelinePreview.captionPosition") })
              ]
            }
          ),
          /* @__PURE__ */ l.jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: b("flex items-center gap-2 px-2 py-1.5 rounded-[var(--nomi-radius-sm)] text-left text-caption text-[var(--workbench-ink)] hover:bg-[var(--workbench-hover)]"),
              onClick: () => Oe("title"),
              children: [
                /* @__PURE__ */ l.jsx(ge, { size: 14, className: "flex-none text-[var(--workbench-text)]" }),
                /* @__PURE__ */ l.jsx("span", { className: "flex-1", children: n("timelinePreview.titleCard") }),
                /* @__PURE__ */ l.jsx("span", { className: "text-[var(--workbench-muted-soft)] text-micro", children: n("timelinePreview.titleCardPosition") })
              ]
            }
          )
        ] }) : null
      ] }),
      /* @__PURE__ */ l.jsx(pr, { timeline: a, selectedTextClipId: Re }),
      /* @__PURE__ */ l.jsx("div", { className: b(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      k === "preparing" || k === "recording" || k === "converting" ? /* @__PURE__ */ l.jsxs("div", { className: b(
        "workbench-preview-player__export-progress",
        "flex items-center gap-2 px-2"
      ), children: [
        /* @__PURE__ */ l.jsx("div", { className: b(
          "workbench-preview-player__export-progress-bar-track",
          "w-20 h-1 bg-nomi-ink-10 rounded-nomi-sm overflow-hidden"
        ), children: /* @__PURE__ */ l.jsx(
          "div",
          {
            className: b(
              "workbench-preview-player__export-progress-bar",
              "h-1 bg-nomi-accent rounded-nomi-sm transition-[width] duration-200 ease-in-out min-w-1"
            ),
            style: { width: `${Math.round(E * 100)}%` }
          }
        ) }),
        /* @__PURE__ */ l.jsx("span", { className: b(
          "workbench-preview-player__export-progress-label",
          "text-caption text-nomi-ink-60 whitespace-nowrap"
        ), children: k === "preparing" ? n("timelinePreview.preparing") : k === "converting" ? n("timelinePreview.converting") : n("timelinePreview.exporting", { percent: Math.round(E * 100) }) }),
        /* @__PURE__ */ l.jsx(
          F,
          {
            className: b(
              "workbench-preview-player__export-cancel",
              "w-6 h-6 inline-grid place-items-center p-0 rounded-full border-0 bg-transparent text-[var(--workbench-muted)]",
              "enabled:cursor-pointer enabled:hover:bg-[var(--workbench-hover)] enabled:hover:text-[var(--workbench-danger)]",
              // 同 CONTROL_ICON_BUTTON_CLASS：钉死基类无条件 hover，禁用态（准备中）不假高亮。
              "disabled:hover:bg-transparent disabled:hover:text-[var(--workbench-muted)]"
            ),
            label: n("timelinePreview.cancelExport"),
            title: n(x ? "timelinePreview.cancelExport" : "timelinePreview.preparingCannotCancel"),
            icon: /* @__PURE__ */ l.jsx(Vt, { size: 14 }),
            onClick: gt,
            disabled: !x
          }
        )
      ] }) : null,
      /* @__PURE__ */ l.jsxs(
        Xe,
        {
          className: b(
            "workbench-preview-player__export-button",
            "h-7 px-3 border border-transparent rounded-full whitespace-nowrap",
            "inline-flex items-center justify-center gap-1.5",
            "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] text-micro font-bold cursor-pointer",
            "hover:bg-[var(--nomi-accent)] hover:text-[var(--nomi-paper)]",
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--nomi-ink)]"
          ),
          "aria-label": n("timelinePreview.exportMp4"),
          onClick: xe,
          disabled: H || Y,
          title: ft,
          children: [
            H ? /* @__PURE__ */ l.jsx(qt, { size: 15, className: b("workbench-preview-player__spinner", "animate-spin") }) : /* @__PURE__ */ l.jsx(Zt, { size: 15 }),
            n("timelinePreview.exportMp4")
          ]
        }
      )
    ] })
  ] });
}
function wn() {
  const { t: e } = je(), t = P((p) => p.timeline), r = P((p) => p.timeline.tracks), o = P((p) => p.timeline.textClips), a = P((p) => p.timeline.playheadFrame), n = P((p) => p.timelinePlaying), s = P((p) => p.previewAspectRatio), c = P((p) => p.setTimelinePlaying), m = h.useMemo(() => Z(t), [r, o]), u = h.useMemo(() => _e(t, a), [r, a]);
  return h.useEffect(() => {
    if (!n) return;
    if (m <= 0) {
      c(!1);
      return;
    }
    const p = Math.max(1, P.getState().timeline.fps);
    let v = performance.now(), x = 0, d = 0;
    const w = (g) => {
      x += (g - v) / 1e3 * p, v = g;
      const k = Math.floor(x);
      if (k > 0) {
        x -= k;
        const E = P.getState().timeline.playheadFrame + k;
        if (E >= m) {
          P.getState().setTimelinePlayhead(m), P.getState().setTimelinePlaying(!1);
          return;
        }
        P.getState().setTimelinePlayhead(E);
      }
      d = window.requestAnimationFrame(w);
    };
    return d = window.requestAnimationFrame(w), () => window.cancelAnimationFrame(d);
  }, [m, n, c]), /* @__PURE__ */ l.jsxs(
    "section",
    {
      className: b(
        "workbench-preview",
        "w-full h-full min-w-0 min-h-0 grid grid-rows-[minmax(0,1fr)_var(--workbench-preview-timeline-height)]",
        "overflow-hidden bg-[var(--workbench-bg)]"
      ),
      "aria-label": e("workspace.preview"),
      children: [
        /* @__PURE__ */ l.jsx(
          Qr,
          {
            activeClips: u,
            aspectRatio: s,
            fps: t.fps,
            playheadFrame: t.playheadFrame,
            timeline: t
          }
        ),
        /* @__PURE__ */ l.jsx(
          Kt,
          {
            density: "full",
            regionLabel: e("timelinePreview.timelineRegion"),
            actionLabelPrefix: e("timelinePreview.timelineActionPrefix"),
            showTextTrack: !0
          }
        )
      ]
    }
  );
}
export {
  wn as default
};
