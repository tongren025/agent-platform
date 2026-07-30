import { aS as qe, e3 as Ce, e4 as y, S as p, dc as Ke, D as Pt, V as Tt, W as _t, cf as s, aK as w, a9 as N, n as Ct, s as Et, Z as St, du as jt, az as Nt, cG as It, aC as Mt, df as Ge, eb as Ft, c0 as M, aM as G, d3 as Ee, d4 as Ze, aL as Rt, d8 as ae, c4 as zt, bv as Pe, bw as ie, dT as At, ax as Lt, aA as Dt, dG as Ue, co as Ot, q as Bt, a8 as Xe, x as Ut, J as Xt } from "./agentStudioMount-CNVmpr5A.js";
import Wt from "./TimelinePanel-Cy1PCUpS.js";
import { I as Yt } from "./IconChevronRight-CLEQFfP4.js";
import { I as $t } from "./IconDownload-BuoLeJCl.js";
import { I as be } from "./IconLetterCase-D9qq4wMZ.js";
import { a as Ht, I as Vt } from "./IconMinimize-xbLAyzBA.js";
import { I as qt } from "./IconPlayerPause-cuTVApY6.js";
import { I as Kt } from "./IconPlayerSkipBack-B8MOTN5I.js";
import { I as Gt } from "./IconRefresh-DHHu7gaL.js";
import { I as Zt } from "./IconVolumeOff-DUtsMfiw.js";
import { a as Jt, I as Qt } from "./IconZoomOut-BsP62hVq.js";
import { N as Te } from "./NomiSelect-DbJK-BOQ.js";
import { b as We } from "./referenceUrl-Chs-socL.js";
import { c as er, l as tr, a as rr } from "./timelineDragPayload-BKtrqhVN.js";
const nr = [["path", { d: "M4 5v14l12 -7l-12 -7", key: "svg-0" }], ["path", { d: "M20 5l0 14", key: "svg-1" }]], ir = qe("outline", "player-skip-forward", "PlayerSkipForward", nr);
const or = [["path", { d: "M15 8a5 5 0 0 1 0 8", key: "svg-0" }], ["path", { d: "M17.7 5a9 9 0 0 1 0 14", key: "svg-1" }], ["path", { d: "M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5", key: "svg-2" }]], ar = qe("outline", "volume", "Volume", or), K = "w-6 h-6 inline-grid place-items-center p-0 border border-transparent rounded-full bg-transparent text-[var(--workbench-muted)] enabled:cursor-pointer enabled:hover:bg-[var(--workbench-hover)] enabled:hover:text-[var(--workbench-ink)] disabled:hover:bg-transparent disabled:hover:text-[var(--workbench-muted)]";
function sr({ timeline: e, selectedTextClipId: r }) {
  const { t: n } = Ce(), o = y((l) => l.updateTimelineTextClipTransform), a = y((l) => l.updateTimelineTextClipFont), [t, c] = p.useState(""), u = (e.textClips ?? []).find((l) => l.id === r) || null, m = u ? Ke(u).scale : 1, d = u?.fontFamily ?? Pt, h = Math.round(m * 100);
  p.useEffect(() => {
    c(String(h));
  }, [h, r]);
  const k = p.useCallback(
    (l) => {
      r && o(
        r,
        { scale: Math.min(Tt, Math.max(_t, l)) },
        { commit: !0 }
      );
    },
    [r, o]
  ), b = p.useCallback(() => {
    const l = Number(t);
    Number.isFinite(l) && l > 0 && k(l / 100);
  }, [k, t]);
  return u ? /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
    /* @__PURE__ */ s.jsx(
      "div",
      {
        className: w("workbench-preview-player__control-separator", "w-px h-5 bg-[var(--workbench-border-soft)]"),
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ s.jsxs(
      "div",
      {
        className: w("workbench-preview-player__text-style", "flex-none inline-flex items-center gap-1.5"),
        "aria-label": n("timelinePreview.textStyle.aria"),
        children: [
          /* @__PURE__ */ s.jsx("span", { className: "text-micro text-[var(--workbench-muted)] font-bold", children: n("timelinePreview.textStyle.size") }),
          /* @__PURE__ */ s.jsxs("div", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ s.jsx(
              N,
              {
                className: w(K),
                label: n("timelinePreview.textStyle.decrease"),
                icon: /* @__PURE__ */ s.jsx(Ct, { size: 14 }),
                onClick: () => k(m - 0.1)
              }
            ),
            /* @__PURE__ */ s.jsx(
              "input",
              {
                className: w(
                  "w-[40px] h-6 text-center text-micro font-bold tabular-nums",
                  "rounded-[var(--nomi-radius-sm)] border border-[var(--workbench-border)] bg-[var(--nomi-paper)] text-[var(--workbench-ink)] outline-none focus:border-[var(--nomi-accent)]"
                ),
                value: t,
                inputMode: "numeric",
                "aria-label": n("timelinePreview.textStyle.percentage"),
                onChange: (l) => c(l.target.value.replace(/[^0-9]/g, "")),
                onBlur: b,
                onKeyDown: (l) => {
                  l.key === "Enter" && l.target.blur();
                }
              }
            ),
            /* @__PURE__ */ s.jsx("span", { className: "text-micro text-[var(--workbench-muted-soft)]", children: "%" }),
            /* @__PURE__ */ s.jsx(
              N,
              {
                className: w(K),
                label: n("timelinePreview.textStyle.increase"),
                icon: /* @__PURE__ */ s.jsx(Et, { size: 14 }),
                onClick: () => k(m + 0.1)
              }
            )
          ] }),
          /* @__PURE__ */ s.jsx(
            Te,
            {
              ariaLabel: n("timelinePreview.textStyle.font"),
              leadingLabel: n("timelinePreview.textStyle.font"),
              size: "xs",
              value: d,
              options: St.map((l) => ({
                value: l.id,
                label: n(`timelinePreview.textStyle.fonts.${l.id}`)
              })),
              onChange: (l) => {
                r && a(r, l);
              }
            }
          )
        ]
      }
    )
  ] }) : null;
}
function Ye(e, r) {
  const n = r ? e.offsetX * r.width : 0, o = r ? e.offsetY * r.height : 0;
  return { transform: `translate(${n}px, ${o}px) scale(${e.scale})` };
}
function $e(e) {
  return e.fit === "cover" ? "object-cover" : "object-contain";
}
function lr(e, r, n) {
  return n ? {
    offsetX: e.originOffsetX + r.x / n.width,
    offsetY: e.originOffsetY + r.y / n.height
  } : { offsetX: e.originOffsetX, offsetY: e.originOffsetY };
}
const cr = 1040;
function dr(e) {
  const r = Math.max(0, Number(e.containerWidth) || 0), n = Math.max(0, Number(e.containerHeight) || 0), o = Math.max(1, Number(e.ratioWidth) || 1), a = Math.max(1, Number(e.ratioHeight) || 1), t = Math.max(1, Number(e.maxWidth) || cr);
  if (r <= 0 || n <= 0)
    return { width: 0, height: 0 };
  const c = o / a;
  let u = Math.min(r, t, n * c), m = u / c;
  return m > n && (m = n, u = m * c), {
    width: Math.max(1, Math.floor(u)),
    height: Math.max(1, Math.floor(m))
  };
}
const ur = ["nw", "ne", "se", "sw"], mr = {
  nw: "-top-[5px] -left-[5px] cursor-nwse-resize",
  ne: "-top-[5px] -right-[5px] cursor-nesw-resize",
  se: "-bottom-[5px] -right-[5px] cursor-nwse-resize",
  sw: "-bottom-[5px] -left-[5px] cursor-nesw-resize"
};
function pr({
  centerNorm: e,
  scale: r,
  stageWidth: n,
  stageHeight: o,
  onTransform: a,
  onSnapGuides: t,
  children: c
}) {
  const u = p.useCallback((d) => {
    if (d.target.closest("[data-handle]")) return;
    d.preventDefault(), d.stopPropagation();
    const h = d.currentTarget;
    h.setPointerCapture?.(d.pointerId);
    const k = d.clientX, b = d.clientY, l = { x: e.x * n, y: e.y * o }, x = (g, T, E) => {
      const I = { x: l.x + (g - k), y: l.y + (T - b) }, V = jt(Nt(It(I, n, o)));
      t({ x: V.guideX, y: V.guideY }), a({ position: V.center }, E);
    }, v = (g) => x(g.clientX, g.clientY, !1), _ = (g) => {
      x(g.clientX, g.clientY, !0), t({ x: null, y: null }), h.releasePointerCapture?.(d.pointerId), window.removeEventListener("pointermove", v), window.removeEventListener("pointerup", _);
    };
    window.addEventListener("pointermove", v), window.addEventListener("pointerup", _);
  }, [e.x, e.y, t, a, o, n]), m = p.useCallback((d) => {
    d.preventDefault(), d.stopPropagation();
    const h = d.currentTarget;
    h.setPointerCapture?.(d.pointerId);
    const k = { x: e.x * n, y: e.y * o }, b = Math.hypot(d.clientX - k.x, d.clientY - k.y) || 1, l = r, x = (g, T, E) => {
      const I = Math.hypot(g - k.x, T - k.y);
      a({ scale: Mt(l * (I / b)) }, E);
    }, v = (g) => x(g.clientX, g.clientY, !1), _ = (g) => {
      x(g.clientX, g.clientY, !0), h.releasePointerCapture?.(d.pointerId), window.removeEventListener("pointermove", v), window.removeEventListener("pointerup", _);
    };
    window.addEventListener("pointermove", v), window.addEventListener("pointerup", _);
  }, [e.x, e.y, a, r, o, n]);
  return /* @__PURE__ */ s.jsxs(
    "div",
    {
      className: w(
        "workbench-overlay-selection",
        "absolute pointer-events-auto cursor-move touch-none",
        "outline outline-2 outline-[var(--nomi-accent)]"
      ),
      style: {
        left: `${e.x * n}px`,
        top: `${e.y * o}px`,
        transform: "translate(-50%, -50%)"
      },
      onPointerDown: u,
      children: [
        c,
        ur.map((d) => /* @__PURE__ */ s.jsx(
          "span",
          {
            "data-handle": d,
            className: w(
              "workbench-overlay-selection__handle",
              "absolute w-[10px] h-[10px] rounded-nomi-sm touch-none",
              "border-[1.5px] border-[var(--nomi-accent)] bg-[var(--nomi-paper)]",
              "shadow-nomi-sm",
              mr[d]
            ),
            onPointerDown: m
          },
          d
        ))
      ]
    }
  );
}
function ge(e, r) {
  return e.find((n) => n.type === r) || null;
}
function Se(e) {
  const r = Math.max(1, e.fps), n = Math.max(0, e.playheadFrame - e.clip.startFrame);
  return (e.clip.offsetStartFrame + n) / r;
}
function hr(e, r) {
  const n = p.useRef(null), o = e?.url || "", { playing: a, playheadFrame: t, fps: c, volume: u, muted: m } = r;
  return p.useEffect(() => {
    const d = n.current;
    if (!d || !e?.url) return;
    const h = Se({ clip: e, playheadFrame: t, fps: c });
    if (!Number.isFinite(h)) return;
    const k = a ? 0.3 : 0.04;
    Math.abs(d.currentTime - h) < k || (d.currentTime = h);
  }, [c, t, e, a]), p.useEffect(() => {
    const d = n.current;
    d && (d.volume = u, d.muted = m);
  }, [o, u, m]), p.useEffect(() => {
    const d = n.current;
    if (!(!d || !e?.url)) {
      if (a) {
        d.play().catch(() => {
        });
        return;
      }
      if (!d.paused)
        try {
          d.pause();
        } catch {
        }
    }
  }, [a, e?.url]), { audioRef: n, audioUrl: o };
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
function fr(e, r, n, o, a, t) {
  const c = Math.min(t, o / 2, a / 2);
  e.beginPath(), e.moveTo(r + c, n), e.arcTo(r + o, n, r + o, n + a, c), e.arcTo(r + o, n + a, r, n + a, c), e.arcTo(r, n + a, r, n, c), e.arcTo(r, n, r + o, n, c), e.closePath();
}
function Je(e, r, n, o) {
  const a = (r.text || "").trim();
  if (!a) return;
  const t = Ge(r, n, o), c = t.maxWidthPx - (t.hasBackdrop ? t.fontSizePx * 1.4 : 0);
  e.save(), e.font = `${t.fontWeight} ${t.fontSizePx}px ${t.fontFamily}`, e.textAlign = "center", e.textBaseline = "middle";
  const u = Ft(a, Math.max(1, c), (T) => e.measureText(T).width), m = t.fontSizePx * t.lineHeight, d = u.length * m, h = u.reduce((T, E) => Math.max(T, e.measureText(E).width), 0), k = t.hasBackdrop ? t.fontSizePx * 0.7 : 0, b = t.hasBackdrop ? t.fontSizePx * 0.32 : 0, l = Math.min(t.maxWidthPx, h + k * 2), x = d + b * 2, v = t.centerX - l / 2, _ = t.centerY - x / 2;
  t.hasBackdrop && (fr(e, v, _, l, x, t.fontSizePx * 0.32), e.fillStyle = "rgba(248, 247, 243, 0.86)", e.fill(), e.lineWidth = 1, e.strokeStyle = "rgba(29, 29, 31, 0.10)", e.stroke()), e.fillStyle = "rgb(29, 29, 31)";
  const g = t.centerY - d / 2 + m / 2;
  u.forEach((T, E) => {
    e.fillText(T, t.centerX, g + E * m);
  }), e.restore();
}
const wr = {
  "16:9": { width: 16, height: 9 },
  "9:16": { width: 9, height: 16 },
  "1:1": { width: 1, height: 1 },
  "4:5": { width: 4, height: 5 },
  "3:4": { width: 3, height: 4 },
  "4:3": { width: 4, height: 3 },
  "21:9": { width: 21, height: 9 }
}, vr = 1280, xr = "#ffffff";
function br(e, r = vr) {
  const n = wr[e], o = Math.max(320, Math.floor(r));
  return {
    width: o,
    height: Math.max(1, Math.round(o * n.height / n.width))
  };
}
function se(e) {
  return typeof e.url == "string" && e.url.trim().length > 0;
}
function _e(e, r) {
  return e.find((n) => n.type === r) || null;
}
function gr(e) {
  return new Promise((r, n) => {
    const o = new Image();
    o.crossOrigin = "anonymous", o.decoding = "async", o.onload = () => r(o), o.onerror = () => n(new Error(`无法加载导出图片素材：${e}`)), o.src = e;
  });
}
function kr(e) {
  return new Promise((r, n) => {
    const o = document.createElement("video");
    o.className = "workbench-export__video-source", o.crossOrigin = "anonymous", o.muted = !0, o.playsInline = !0, o.preload = "auto", o.onloadedmetadata = () => r(o), o.onerror = () => n(new Error(`无法加载导出视频素材：${e}`)), o.src = e, o.load();
  });
}
function yr(e) {
  return Promise.race([
    new Promise((r, n) => {
      const o = () => {
        e.removeEventListener("seeked", a), e.removeEventListener("error", t);
      }, a = () => {
        o(), r();
      }, t = () => {
        o(), n(new Error("视频素材 seek 失败"));
      };
      e.addEventListener("seeked", a, { once: !0 }), e.addEventListener("error", t, { once: !0 });
    }),
    new Promise((r, n) => setTimeout(() => n(new Error("视频定位超时")), 5e3))
  ]);
}
async function Pr(e, r) {
  const n = Math.max(0, r);
  if (Number.isFinite(e.currentTime) && Math.abs(e.currentTime - n) < 0.04) return;
  const o = yr(e);
  e.currentTime = n, await o, typeof e.requestVideoFrameCallback == "function" && await new Promise((a) => {
    e.requestVideoFrameCallback(() => a());
  });
}
async function Tr(e) {
  const r = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  for (const t of e.tracks)
    for (const c of t.clips)
      se(c) && (c.type === "image" && r.add(c.url), c.type === "video" && n.add(c.url));
  const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  return await Promise.all(Array.from(r, async (t) => {
    o.set(t, await gr(t));
  })), await Promise.all(Array.from(n, async (t) => {
    a.set(t, await kr(t));
  })), { images: o, videos: a };
}
function He(e, r, n, o, a, t) {
  const c = Rt(ae(t), a.width, a.height, n, o);
  c.width <= 0 || c.height <= 0 || e.drawImage(r, c.x, c.y, c.width, c.height);
}
function _r(e) {
  const { context: r, timeline: n, frame: o, size: a, background: t, assets: c } = e, u = Ee(n, o), m = _e(u, "video"), d = _e(u, "image");
  if (r.clearRect(0, 0, a.width, a.height), r.fillStyle = t, r.fillRect(0, 0, a.width, a.height), d && se(d)) {
    const h = c.images.get(d.url);
    h && He(r, h, h.naturalWidth, h.naturalHeight, a, d);
  }
  if (m && se(m)) {
    const h = c.videos.get(m.url);
    h && h.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && He(r, h, h.videoWidth, h.videoHeight, a, m);
  }
  for (const h of Ze(n, o))
    Je(r, h, a.width, a.height);
}
function Cr(e) {
  if (e) {
    if (!MediaRecorder.isTypeSupported(e))
      throw new Error(M.t("runtime.export.unsupportedFormat", { format: e }));
    return e;
  }
  return [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].find((n) => MediaRecorder.isTypeSupported(n));
}
function Er(e, r) {
  const n = URL.createObjectURL(e), o = document.createElement("a");
  o.className = "workbench-export__download-link", o.href = n, o.download = r, document.body.appendChild(o), o.click(), o.remove(), window.setTimeout(() => URL.revokeObjectURL(n), 5e3);
}
function Qe(e = "webm") {
  const r = /* @__PURE__ */ new Date(), n = (o) => String(o).padStart(2, "0");
  return `nomi-${r.getFullYear()}${n(r.getMonth() + 1)}${n(r.getDate())}-${n(r.getHours())}${n(r.getMinutes())}.${e}`;
}
async function Sr(e) {
  if (typeof document > "u") throw new Error(M.t("runtime.export.browserOnly"));
  if (typeof MediaRecorder > "u") throw new Error(M.t("runtime.export.mediaRecorderUnsupported"));
  const r = G(e.timeline);
  if (r <= 0) throw new Error(M.t("runtime.export.emptyTimeline"));
  const n = br(e.aspectRatio, e.width);
  e.onProgress?.({ status: "preparing", frame: 0, totalFrames: r, ratio: 0 });
  const o = await Tr(e.timeline), a = document.createElement("canvas");
  a.className = "workbench-export__canvas", a.width = n.width, a.height = n.height;
  const t = a.getContext("2d");
  if (!t) throw new Error(M.t("runtime.export.canvasUnavailable"));
  const c = a.captureStream(e.timeline.fps), u = Cr(e.mimeType), m = u ? new MediaRecorder(c, { mimeType: u }) : new MediaRecorder(c), d = [], h = new Promise((l, x) => {
    m.ondataavailable = (v) => {
      v.data.size > 0 && d.push(v.data);
    }, m.onerror = () => x(new Error("导出录制失败")), m.onstop = () => {
      l(new Blob(d, { type: m.mimeType || "video/webm" }));
    };
  });
  for (const l of o.videos.values())
    l.currentTime = 0;
  m.start(), e.onProgress?.({ status: "recording", frame: 0, totalFrames: r, ratio: 0 });
  const k = 1e3 / e.timeline.fps;
  try {
    await new Promise((l, x) => {
      let v = 0;
      const _ = async () => {
        try {
          const g = Ee(e.timeline, v), T = _e(g, "video");
          if (T && se(T)) {
            const E = o.videos.get(T.url);
            if (E) {
              const I = Se({ clip: T, playheadFrame: v, fps: e.timeline.fps });
              await Pr(E, I);
            }
          }
          if (_r({
            context: t,
            timeline: e.timeline,
            frame: v,
            size: n,
            background: e.background || xr,
            assets: o
          }), e.onProgress?.({
            status: "recording",
            frame: v,
            totalFrames: r,
            ratio: Math.min(1, v / r)
          }), v >= r - 1) {
            l();
            return;
          }
          v += 1, setTimeout(() => {
            _();
          }, k);
        } catch (g) {
          x(g);
        }
      };
      setTimeout(() => {
        _();
      }, 0);
    });
  } catch (l) {
    m.state !== "inactive" && m.stop();
    for (const x of o.videos.values())
      x.pause();
    throw l;
  }
  m.stop();
  for (const l of o.videos.values())
    l.pause();
  const b = await h;
  if (b.size <= 0) throw new Error(M.t("runtime.export.emptyResult"));
  return e.onProgress?.({ status: "done", frame: r, totalFrames: r, ratio: 1 }), Qe("webm"), b;
}
const jr = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 }
}, Nr = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "21:9": 21 / 9
}, Ir = "Timeline model only exposes image/video clips; audio/text/overlay/effect/keyframe entities are not first-class timeline tracks yet.", Mr = "Renderer request omits audio/text/overlay/effect/keyframe tracks instead of synthesizing unsupported timeline data.";
function ne(e) {
  return Math.max(2, Math.round(e / 2) * 2);
}
function Fr(e, r) {
  if (r === "16:9") return jr[e];
  const n = e === "720p" ? 720 : 1080, o = Nr[r];
  return o >= 1 ? { width: ne(n * o), height: ne(n) } : { width: ne(n), height: ne(n / o) };
}
function Rr(e) {
  const r = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const o of e)
    for (const a of o.clips) {
      const t = a.sourceNodeId, c = a.url ?? "";
      let u = n.get(t);
      u || (u = /* @__PURE__ */ new Map(), n.set(t, u));
      let m = u.get(c);
      m === void 0 && (m = u.size === 0 ? t : `${t}#${u.size + 1}`, u.set(c, m)), r.set(a.id, m);
    }
  return r;
}
function zr(e, r) {
  const n = e;
  return {
    id: r,
    kind: e.type,
    ...e.url ? { url: e.url } : {},
    ...typeof n.hasAudio == "boolean" ? { hasAudio: n.hasAudio } : {}
  };
}
function Ar(e, r) {
  const n = {
    ...r,
    ...e
  }, o = e?.url ?? r.url, a = e?.hasAudio ?? r.hasAudio;
  return o !== void 0 && (n.url = o), a !== void 0 && (n.hasAudio = a), n;
}
function Lr(e, r) {
  return e.reduce((n, o) => (o.clips.forEach((a) => {
    const t = r.get(a.id) ?? a.sourceNodeId, c = zr(a, t);
    n[c.id] = Ar(n[c.id], c);
  }), n), {});
}
function Dr(e, r) {
  const n = ae(e);
  return {
    id: e.id,
    assetId: r.get(e.id) ?? e.sourceNodeId,
    startFrame: e.startFrame,
    endFrame: e.endFrame,
    sourceStartFrame: e.offsetStartFrame,
    sourceEndFrame: Math.max(e.offsetStartFrame + 1, e.frameCount - e.offsetEndFrame),
    ...zt(n) ? {} : { transform: n }
  };
}
function Or(e, r) {
  return {
    id: e.id,
    kind: e.type,
    type: e.type,
    clips: e.clips.map((n) => Dr(n, r))
  };
}
function Br(e) {
  const r = G(e.timeline), n = Fr(e.resolution, e.aspectRatio), o = Rr(e.timeline.tracks), a = e.timeline.tracks.map((c) => Or(c, o)).filter((c) => c.clips.length > 0), t = [Ir, Mr];
  return a.length === 0 && t.unshift("Timeline has no image or video clips to render."), {
    version: 1,
    projectId: e.projectId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    timeline: {
      fps: e.timeline.fps,
      durationFrames: r,
      range: { startFrame: 0, endFrame: r },
      tracks: a
    },
    profile: {
      preset: e.preset,
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "none",
      audioMode: "mute",
      width: n.width,
      height: n.height,
      fps: e.timeline.fps,
      pixelFormat: "yuv420p",
      quality: e.quality
    },
    assets: Lr(e.timeline.tracks, o),
    diagnostics: { warnings: t }
  };
}
function Ur(e, r, n) {
  if (typeof document > "u") return [];
  const o = [];
  for (const a of e.textClips ?? []) {
    if (!(a.text || "").trim()) continue;
    const t = document.createElement("canvas");
    t.width = Math.max(2, Math.round(r)), t.height = Math.max(2, Math.round(n));
    const c = t.getContext("2d");
    if (!c) continue;
    Je(c, a, t.width, t.height);
    const u = (t.toDataURL("image/png").split(",")[1] || "").trim();
    u && o.push({ id: a.id, startFrame: a.startFrame, endFrame: a.endFrame, pngBase64: u });
  }
  return o;
}
function oe(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Ve(e) {
  return [oe(e?.url), oe(e?.providerUrl), oe(e?.thumbnailUrl)].filter(Boolean);
}
function Xr(e, r) {
  return r?.sourceNodeId && e.find((n) => n.id === r.sourceNodeId) || null;
}
function et(e, r) {
  const n = oe(e?.url);
  if (!e) return "";
  const o = Xr(r, e);
  if (!o) return n;
  const a = (o.history || []).find((u) => Ve(u).includes(n)), t = We(a);
  if (t) return t;
  const c = We(o.result);
  return c && (!n || Ve(o.result).includes(n)) ? c : n;
}
function Wr(e, r) {
  let n = !1;
  const o = e.tracks.map((a) => {
    let t = !1;
    const c = a.clips.map((u) => {
      const m = et(u, r);
      return !m || m === u.url ? u : (t = !0, n = !0, { ...u, url: m });
    });
    return t ? { ...a, clips: c } : a;
  });
  return n ? { ...e, tracks: o } : e;
}
const ye = 1024 * 1024;
async function Yr(e) {
  const r = ie();
  if (!r?.exports?.startJob || !r.exports.writeTempInput || !r.exports.finishTempInput)
    throw new Error(M.t("runtime.export.mp4RequiresDesktop"));
  const n = (e.projectId || Pe()).trim();
  if (!n) throw new Error(M.t("runtime.export.missingProjectId"));
  const o = e.resolution || "1080p", a = e.quality || "standard", t = Wr(e.timeline, e.generationNodes || []), c = Br({
    projectId: n,
    timeline: t,
    aspectRatio: e.aspectRatio,
    resolution: o,
    quality: a,
    preset: "publish"
  });
  c.textOverlays = Ur(t, c.profile.width, c.profile.height);
  const { jobId: u, backend: m } = await r.exports.startJob({
    projectId: n,
    outputName: e.outputName,
    manifest: c
  });
  let d = null, h = !1;
  const k = r.exports.onEvent?.((b) => {
    if (b.jobId !== u) return;
    const l = Math.max(0, Math.min(1, b.snapshot.progress.ratio)), x = b.snapshot.progress.stage, v = x === "succeeded" ? "done" : x === "encoding" || x === "muxing" || x === "finalizing" ? "converting" : "preparing";
    e.onProgress?.({ status: v, ratio: l });
  });
  try {
    if (m === "filtergraph") {
      e.onProgress?.({ status: "converting", ratio: 0.12 });
      const l = await r.exports.finishTempInput({ jobId: u });
      return h = !0, e.onProgress?.({ status: "done", ratio: 1 }), l;
    }
    d = await Sr({
      timeline: t,
      aspectRatio: e.aspectRatio,
      width: e.resolution === "720p" ? 1280 : 1920,
      autoDownload: !1,
      onProgress: (l) => {
        if (l.status === "preparing" || l.status === "recording" || l.status === "done") {
          const x = l.status;
          e.onProgress?.({ status: x, ratio: l.ratio * 0.82 });
        }
      }
    }), e.onProgress?.({ status: "converting", ratio: 0.86 });
    for (let l = 0; l < d.size; l += ye) {
      const x = await d.slice(l, l + ye).arrayBuffer();
      await r.exports.writeTempInput({ jobId: u, chunk: x });
      const v = d.size > 0 ? Math.min(1, (l + ye) / d.size) : 1;
      e.onProgress?.({ status: "converting", ratio: 0.86 + v * 0.04 });
    }
    const b = await r.exports.finishTempInput({ jobId: u });
    return h = !0, e.onProgress?.({ status: "done", ratio: 1 }), b;
  } catch (b) {
    if (!h && r.exports.cancel)
      try {
        await r.exports.cancel(u);
      } catch (v) {
        console.warn("Failed to cancel MP4 export job after renderer-side failure", v);
      }
    const l = b instanceof Error ? b.message : M.t("runtime.export.mp4Failed");
    if (!d)
      throw new Error(l);
    const x = Qe("webm");
    throw Er(d, x), new Error(M.t("runtime.export.webmFallbackDownloaded", { message: l, file: x }));
  } finally {
    k?.();
  }
}
function $r(e) {
  return e.isEmpty ? "时间轴为空，先添加素材" : e.isConverting ? "正在转码 MP4" : e.isRecording ? `导出中 ${Math.max(0, Math.min(100, Math.round(e.progressPercent ?? 0)))}%` : ["导出 MP4：1080p", e.aspectRatio, "标准发布", "保存到项目 exports 文件夹"].join(" · ");
}
function Hr(e, {
  videoClip: r,
  videoUrl: n,
  playheadFrame: o,
  fps: a,
  playing: t
}) {
  p.useEffect(() => {
    const c = e.current;
    if (!c || !r || !n) return;
    const u = Se({ clip: r, playheadFrame: o, fps: a });
    if (!Number.isFinite(u)) return;
    const m = t ? 0.3 : 0.04;
    Math.abs(c.currentTime - u) < m || (c.currentTime = u);
  }, [e, a, o, r, n, t]);
}
function Vr({ activeClips: e, aspectRatio: r, fps: n, playheadFrame: o, timeline: a }) {
  const { t } = Ce(), c = p.useRef(null), u = p.useRef(null), m = p.useRef(null), d = p.useRef(null), h = p.useRef(""), [k, b] = p.useState(!1), [l, x] = p.useState(null), [v, _] = p.useState("idle"), [g, T] = p.useState(0), [E, I] = p.useState(""), [V, Z] = p.useState(""), [le, ce] = p.useState(""), [J, de] = p.useState(!1), ue = p.useRef(null), [Q, tt] = p.useState({ x: null, y: null }), [ee, rt] = p.useState(1), [D, je] = p.useState(!1), [me, nt] = p.useState(!1), Ne = y((i) => i.addTimelineTextClip), Ie = y((i) => i.updateTimelineTextClip), it = y((i) => i.updateTimelineTextClipTransform), pe = y((i) => i.selectTimelineTextClip), Me = y((i) => i.selectedTextClipId), ot = y((i) => i.setPreviewAspectRatio), O = y((i) => i.setTimelineClipFraming), z = y((i) => i.timelinePlaying), q = y((i) => i.setTimelinePlaying), te = y((i) => i.setTimelinePlayhead), he = At((i) => i.nodes), B = ge(e, "video"), X = ge(e, "image"), at = ge(e, "audio"), F = et(B, he), Fe = F ? Lt(F) : "", W = ke.find((i) => i.value === r) || ke[0], A = !!(F || X?.url || ""), j = (B ?? X)?.id ?? "", fe = ae(X ?? void 0), we = ae(B ?? void 0), R = B ? we : fe, Y = a.tracks.every((i) => i.clips.length === 0) && (a.textClips ?? []).length === 0, ve = G(a), st = (o / (a.fps || 30)).toFixed(1), lt = (ve / (a.fps || 30)).toFixed(1), $ = v === "preparing" || v === "recording" || v === "converting", ct = $r({
    aspectRatio: r,
    isEmpty: Y,
    isRecording: v === "recording",
    isConverting: v === "converting",
    progressPercent: g * 100
  });
  Hr(m, { videoClip: B, videoUrl: F, playheadFrame: o, fps: n, playing: z }), p.useEffect(() => {
    const i = m.current;
    i && (i.volume = ee, i.muted = D);
  }, [F, ee, D]);
  const { audioRef: dt, audioUrl: Re } = hr(at, { playing: z, playheadFrame: o, fps: n, volume: ee, muted: D });
  p.useEffect(() => {
    const i = () => nt(document.fullscreenElement === u.current);
    return document.addEventListener("fullscreenchange", i), () => document.removeEventListener("fullscreenchange", i);
  }, []);
  const ze = p.useCallback((i) => {
    te(Math.max(0, Math.min(ve, o + i)));
  }, [o, te, ve]), ut = p.useCallback(() => {
    const i = u.current;
    i && (document.fullscreenElement ? document.exitFullscreen() : i.requestFullscreen?.());
  }, []);
  p.useEffect(() => {
    const i = m.current;
    if (!(!i || !B || !F)) {
      if (z) {
        I(""), i.play().catch((f) => {
          const C = f instanceof Error && f.message ? f.message : "video play failed";
          I(t("timelinePreview.videoPlayFailed", { message: C })), q(!1);
        });
        return;
      }
      if (!i.paused)
        try {
          i.pause();
        } catch {
        }
    }
  }, [z, q, B, F, t]), p.useEffect(() => {
    I("");
  }, [Fe]), p.useLayoutEffect(() => {
    const i = c.current;
    if (!i || typeof window > "u") return;
    const f = () => {
      const C = i.getBoundingClientRect(), S = window.getComputedStyle(i), U = Number.parseFloat(S.paddingLeft || "0") + Number.parseFloat(S.paddingRight || "0"), H = Number.parseFloat(S.paddingTop || "0") + Number.parseFloat(S.paddingBottom || "0"), L = dr({
        containerWidth: C.width - U,
        containerHeight: C.height - H,
        ratioWidth: W.width,
        ratioHeight: W.height
      });
      x((P) => P && P.width === L.width && P.height === L.height ? P : L.width > 0 && L.height > 0 ? L : null);
    };
    if (f(), typeof ResizeObserver < "u") {
      const C = new ResizeObserver(f);
      return C.observe(i), () => C.disconnect();
    }
    return window.addEventListener("resize", f), () => window.removeEventListener("resize", f);
  }, [W.height, W.width]);
  const Ae = p.useCallback((i) => {
    j && O(j, { scale: Dt(R.scale + i) }, { commit: !0 });
  }, [j, R.scale, O]), mt = p.useCallback(() => {
    j && O(j, { scale: 1, offsetX: 0, offsetY: 0 }, { commit: !0 });
  }, [j, O]), Le = p.useCallback((i) => {
    const f = Ne(i, o);
    Z(f), ce(""), de(!1);
  }, [Ne, o]);
  p.useEffect(() => {
    if (!J) return;
    const i = (f) => {
      ue.current && !ue.current.contains(f.target) && de(!1);
    };
    return window.addEventListener("pointerdown", i), () => window.removeEventListener("pointerdown", i);
  }, [J]);
  const De = p.useCallback((i, f) => {
    pe(i), Z(i), ce(f);
  }, [pe]), pt = p.useCallback((i) => {
    const f = le.trim();
    f && Ie(i, f), Z("");
  }, [le, Ie]), xe = p.useCallback(async () => {
    if (!$)
      try {
        _("preparing"), T(0);
        const i = Pe().trim(), f = await Yr({
          timeline: a,
          aspectRatio: r,
          projectId: i,
          resolution: "1080p",
          quality: "standard",
          generationNodes: he,
          onProgress: (C) => {
            _(C.status), T(C.ratio);
          }
        });
        Ue(t("timelinePreview.exportComplete", { path: f.relativePath }), "success"), Ot("exported"), ie()?.exports.showInFolder({ projectId: i, relativePath: f.relativePath }).catch(() => {
        }), _("idle");
      } catch (i) {
        _("idle");
        const f = i instanceof Error ? i.message : t("timelinePreview.exportFailed");
        Ue(f, "error");
      } finally {
        h.current = "", b(!1);
      }
  }, [r, $, he, a, t]);
  p.useEffect(() => {
    if (!$) return;
    const i = ie(), f = Pe().trim();
    if (!i?.exports?.onEvent || !i.exports.cancel || !f) return;
    const C = i.exports.onEvent((S) => {
      if (S.projectId !== f) return;
      const U = S.snapshot.progress.stage;
      U !== "succeeded" && U !== "failed" && U !== "cancelled" && S.jobId && (h.current = S.jobId, b(!0));
    });
    return () => C?.();
  }, [$]);
  const ht = p.useCallback(() => {
    const i = h.current;
    i && (b(!1), ie()?.exports.cancel(i).catch((f) => {
      console.warn("Failed to cancel export job", f);
    }));
  }, []);
  p.useEffect(() => {
    const i = () => {
      xe();
    };
    return window.addEventListener("nomi-request-export", i), () => window.removeEventListener("nomi-request-export", i);
  }, [xe]);
  const ft = p.useCallback(() => {
    const i = G(a);
    i <= 0 || (o >= i && te(0), q(!z));
  }, [o, z, te, q, a]), wt = p.useCallback((i) => {
    j && (i.target.closest("button") || (i.preventDefault(), i.currentTarget.setPointerCapture(i.pointerId), d.current = {
      pointerId: i.pointerId,
      clipId: j,
      startX: i.clientX,
      startY: i.clientY,
      originOffsetX: R.offsetX,
      originOffsetY: R.offsetY
    }));
  }, [j, R.offsetX, R.offsetY]), re = p.useCallback((i, f, C) => {
    if (!l) return;
    const S = lr(i, { x: f.clientX - i.startX, y: f.clientY - i.startY }, l);
    O(i.clipId, S, { commit: C });
  }, [l, O]), vt = p.useCallback((i) => {
    const f = d.current;
    !f || f.pointerId !== i.pointerId || re(f, i, !1);
  }, [re]), Oe = p.useCallback((i) => {
    const f = d.current;
    if (!(!f || f.pointerId !== i.pointerId)) {
      re(f, i, !0), d.current = null;
      try {
        i.currentTarget.releasePointerCapture(i.pointerId);
      } catch {
      }
    }
  }, [re]), xt = Ye(fe, l), bt = Ye(we, l), gt = $e(fe), kt = $e(we), Be = Ze(a, o);
  return /* @__PURE__ */ s.jsxs("section", { className: w(
    "workbench-preview-player",
    "relative min-w-0 min-h-0 flex flex-col items-center p-8 gap-3 bg-[var(--workbench-bg)]"
  ), "aria-label": t("timelinePreview.player"), children: [
    /* @__PURE__ */ s.jsx("div", { ref: c, className: "workbench-preview-player__stage-area flex-1 min-h-0 w-full grid place-items-center", children: /* @__PURE__ */ s.jsxs(
      "div",
      {
        ref: u,
        className: w(
          "workbench-preview-player__stage",
          "relative max-w-full max-h-full grid place-items-center overflow-hidden",
          "rounded-[var(--nomi-radius-lg)] border border-[var(--workbench-border)]",
          "bg-[var(--nomi-paper)] shadow-[var(--workbench-shadow-md)]",
          "cursor-default transition-[width,height] duration-[160ms] ease-in-out touch-none",
          A && "cursor-grab active:cursor-grabbing"
        ),
        "data-aspect-ratio": W.value,
        "data-fit-mode": R.fit,
        "data-has-media": A ? "true" : "false",
        style: {
          aspectRatio: W.css,
          ...l ? { width: `${l.width}px`, height: `${l.height}px` } : null
        },
        onPointerDown: wt,
        onPointerMove: vt,
        onPointerUp: Oe,
        onPointerCancel: Oe,
        children: [
          /* @__PURE__ */ s.jsx("div", { className: w(
            "workbench-preview-player__canvas",
            "absolute inset-0 grid place-items-center pointer-events-none",
            A ? "bg-[var(--nomi-paper)]" : "bg-[repeating-linear-gradient(45deg,var(--nomi-ink-05)_0_12px,var(--nomi-paper)_12px_24px)]"
          ), "aria-hidden": A ? "true" : "false", children: A ? null : /* @__PURE__ */ s.jsxs("div", { className: w(
            "workbench-preview-player__placeholder",
            "flex flex-col items-center gap-1 p-0 bg-transparent border-none"
          ), children: [
            /* @__PURE__ */ s.jsx("span", { className: w(
              "workbench-preview-player__placeholder-title",
              "font-nomi-display text-title tracking-tight text-[var(--workbench-muted)]"
            ), children: t("timelinePreview.canvas") }),
            /* @__PURE__ */ s.jsx("span", { className: w(
              "workbench-preview-player__placeholder-sub",
              "text-caption text-[var(--workbench-muted-soft)]"
            ), children: t("timelinePreview.emptyHint") })
          ] }) }),
          E ? /* @__PURE__ */ s.jsx("div", { className: w(
            "workbench-preview-player__media-error",
            "absolute left-3 right-3 bottom-3 z-[4]",
            "py-2 px-2 bg-[color-mix(in_srgb,var(--nomi-paper)_90%,transparent)]",
            "text-[var(--workbench-danger)] text-caption leading-snug pointer-events-none"
          ), role: "alert", children: E }) : null,
          X?.url ? /* @__PURE__ */ s.jsx("img", { className: w(
            "workbench-preview-player__image",
            "absolute inset-0 z-[1] w-full h-full bg-transparent select-none will-change-transform",
            gt
          ), src: X.url, alt: X.label || "", style: xt }) : null,
          F ? /* @__PURE__ */ s.jsx(
            "video",
            {
              ref: m,
              className: w(
                "workbench-preview-player__video",
                "absolute inset-0 z-[2] w-full h-full bg-transparent select-none will-change-transform",
                kt
              ),
              src: Fe,
              crossOrigin: "use-credentials",
              playsInline: !0,
              style: bt,
              onError: () => {
                er(F, m.current?.error || null).then((i) => {
                  tr(i), I(t("timelinePreview.videoLoadFailed", { message: rr(i) }));
                }), q(!1);
              }
            }
          ) : null,
          Re ? /* @__PURE__ */ s.jsx(
            "audio",
            {
              ref: dt,
              src: Re,
              crossOrigin: "use-credentials",
              preload: "auto",
              className: "hidden",
              "aria-hidden": "true"
            }
          ) : null,
          l && Be.length > 0 ? /* @__PURE__ */ s.jsxs("div", { className: "workbench-preview-player__text-layer absolute inset-0 z-[3] pointer-events-none", "aria-hidden": "false", children: [
            Q.x !== null ? /* @__PURE__ */ s.jsx("div", { className: "absolute top-0 bottom-0 w-px bg-[var(--nomi-accent)] opacity-70 pointer-events-none", style: { left: `${Q.x * l.width}px` }, "aria-hidden": "true" }) : null,
            Q.y !== null ? /* @__PURE__ */ s.jsx("div", { className: "absolute left-0 right-0 h-px bg-[var(--nomi-accent)] opacity-70 pointer-events-none", style: { top: `${Q.y * l.height}px` }, "aria-hidden": "true" }) : null,
            Be.map((i) => {
              const f = Ge(i, l.width, l.height), C = Ke(i), S = V === i.id, U = Me === i.id, H = {
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
              }, L = {
                left: `${f.centerX}px`,
                top: `${f.centerY}px`,
                transform: "translate(-50%, -50%)"
              };
              return S ? /* @__PURE__ */ s.jsx(
                "textarea",
                {
                  className: "workbench-preview-player__text-edit absolute pointer-events-auto resize-none outline-none overflow-hidden",
                  style: { ...L, ...H, boxShadow: "0 0 0 2px var(--nomi-accent)" },
                  value: le,
                  placeholder: i.text,
                  autoFocus: !0,
                  rows: 1,
                  onFocus: (P) => P.currentTarget.select(),
                  onChange: (P) => ce(P.target.value),
                  onBlur: () => pt(i.id),
                  onKeyDown: (P) => {
                    P.key === "Enter" && !P.shiftKey && (P.preventDefault(), P.currentTarget.blur()), P.key === "Escape" && (P.preventDefault(), Z(""));
                  }
                },
                i.id
              ) : U ? /* @__PURE__ */ s.jsx(
                pr,
                {
                  centerNorm: C.position,
                  scale: C.scale,
                  stageWidth: l.width,
                  stageHeight: l.height,
                  onTransform: (P, yt) => it(i.id, P, { commit: yt }),
                  onSnapGuides: tt,
                  children: /* @__PURE__ */ s.jsx("div", { style: H, onDoubleClick: (P) => {
                    P.stopPropagation(), De(i.id, i.text);
                  }, title: t("timelinePreview.moveResizeEdit"), children: i.text })
                },
                i.id
              ) : /* @__PURE__ */ s.jsx(
                "div",
                {
                  className: "workbench-preview-player__text-box absolute pointer-events-auto cursor-pointer select-none",
                  style: { ...L, ...H },
                  onPointerDown: (P) => {
                    P.stopPropagation(), pe(i.id);
                  },
                  onDoubleClick: (P) => {
                    P.stopPropagation(), De(i.id, i.text);
                  },
                  title: t("timelinePreview.selectEdit"),
                  children: i.text
                },
                i.id
              );
            })
          ] }) : null
        ]
      }
    ) }),
    /* @__PURE__ */ s.jsxs("div", { className: w(
      "workbench-preview-player__control-bar",
      // 窄窗口时换行而非把「导出 MP4」挤出/截断：flex-wrap + 居中；圆角改 lg（换行后不再是单行 pill）。
      "relative z-[3] shrink-0 max-w-full flex flex-wrap justify-center items-center gap-1.5 p-1.5",
      "border border-[var(--workbench-border)] rounded-[var(--nomi-radius-lg)]",
      "bg-[color-mix(in_oklch,var(--nomi-paper)_88%,transparent)]",
      "shadow-[var(--workbench-shadow-sm)] backdrop-blur-[12px] backdrop-saturate-[1.2]",
      // 子项一律不被 flex 挤压：避免画幅/显示下拉被截成「1…」「适.」；满了整组换到下一行。
      "[&>*]:shrink-0"
    ), role: "toolbar", "aria-label": t("timelinePreview.controls"), children: [
      /* @__PURE__ */ s.jsx(
        N,
        {
          className: w(
            "workbench-preview-player__play",
            "w-[30px] h-[30px] grid place-items-center border-0 rounded-full",
            "bg-[var(--nomi-ink)] text-[var(--nomi-paper)]",
            // 禁用态（时间轴为空）不再 hover 高亮成「假可点」：enabled: 门控自身 accent hover，
            // 并用 disabled:hover: 把基类那条无条件 hover:bg-workbench-hover 钉回静息 ink/paper。
            "enabled:hover:bg-[var(--nomi-accent)] enabled:hover:text-[var(--nomi-paper)]",
            "disabled:hover:bg-[var(--nomi-ink)] disabled:hover:text-[var(--nomi-paper)]"
          ),
          label: t(z ? "timelinePreview.pause" : "timelinePreview.play"),
          icon: z ? /* @__PURE__ */ s.jsx(qt, { size: 16, stroke: 1.6 }) : /* @__PURE__ */ s.jsx(Bt, { size: 16, stroke: 1.6 }),
          onClick: ft,
          disabled: Y,
          title: Y ? t("timelinePreview.emptyTimeline") : void 0
        }
      ),
      /* @__PURE__ */ s.jsx(
        N,
        {
          className: w("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)] disabled:opacity-40"),
          label: t("timelinePreview.previousFrame"),
          title: t("timelinePreview.previousFrameShortcut"),
          icon: /* @__PURE__ */ s.jsx(Kt, { size: 15, stroke: 1.6 }),
          onClick: () => ze(-1),
          disabled: Y
        }
      ),
      /* @__PURE__ */ s.jsx(
        N,
        {
          className: w("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)] disabled:opacity-40"),
          label: t("timelinePreview.nextFrame"),
          title: t("timelinePreview.nextFrameShortcut"),
          icon: /* @__PURE__ */ s.jsx(ir, { size: 15, stroke: 1.6 }),
          onClick: () => ze(1),
          disabled: Y
        }
      ),
      /* @__PURE__ */ s.jsx("span", { className: "text-micro opacity-60 tabular-nums min-w-[60px]", children: t("timelinePreview.timeSummary", { current: st, total: lt }) }),
      /* @__PURE__ */ s.jsxs("div", { className: w("workbench-preview-player__volume", "inline-flex items-center gap-1"), children: [
        /* @__PURE__ */ s.jsx(
          N,
          {
            className: w("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)]"),
            label: t(D ? "timelinePreview.unmute" : "timelinePreview.mute"),
            title: t(D ? "timelinePreview.unmute" : "timelinePreview.mute"),
            icon: D ? /* @__PURE__ */ s.jsx(Zt, { size: 15, stroke: 1.6 }) : /* @__PURE__ */ s.jsx(ar, { size: 15, stroke: 1.6 }),
            onClick: () => je((i) => !i)
          }
        ),
        /* @__PURE__ */ s.jsx(
          "input",
          {
            type: "range",
            min: 0,
            max: 1,
            step: 0.05,
            value: D ? 0 : ee,
            "aria-label": t("timelinePreview.volume"),
            className: "w-[54px] h-1 cursor-pointer",
            style: { accentColor: "var(--nomi-accent)" },
            onChange: (i) => {
              const f = Number(i.target.value);
              rt(f), je(f === 0);
            }
          }
        )
      ] }),
      /* @__PURE__ */ s.jsx(
        N,
        {
          className: w("w-[28px] h-[28px] grid place-items-center border-0 rounded-nomi-sm bg-transparent text-[var(--workbench-muted)] enabled:hover:bg-[var(--workbench-hover)]"),
          label: t(me ? "timelinePreview.exitFullscreen" : "timelinePreview.fullscreen"),
          title: t(me ? "timelinePreview.exitFullscreen" : "timelinePreview.fullscreenPreview"),
          icon: me ? /* @__PURE__ */ s.jsx(Ht, { size: 15, stroke: 1.6 }) : /* @__PURE__ */ s.jsx(Vt, { size: 15, stroke: 1.6 }),
          onClick: ut
        }
      ),
      /* @__PURE__ */ s.jsx("div", { className: w(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ s.jsx(
        Te,
        {
          ariaLabel: t("timelinePreview.aspectRatio"),
          leadingLabel: t("timelinePreview.aspectRatioShort"),
          size: "xs",
          value: r,
          options: ke.map((i) => ({ value: i.value, label: i.label })),
          onChange: (i) => ot(i)
        }
      ),
      /* @__PURE__ */ s.jsx("div", { className: w(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ s.jsx(
        Te,
        {
          ariaLabel: t("timelinePreview.fit"),
          leadingLabel: t("timelinePreview.fitShort"),
          size: "xs",
          value: R.fit,
          options: [
            { value: "contain", label: t("timelinePreview.contain") },
            { value: "cover", label: t("timelinePreview.cover") }
          ],
          onChange: (i) => {
            j && O(j, { fit: i }, { commit: !0 });
          }
        }
      ),
      /* @__PURE__ */ s.jsx("div", { className: w(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ s.jsxs("div", { className: w(
        "workbench-preview-player__control-group",
        "flex-none inline-flex items-center gap-1"
      ), "aria-label": t("timelinePreview.framing"), children: [
        /* @__PURE__ */ s.jsx(N, { className: w("workbench-preview-player__icon-button", K), label: t("timelinePreview.zoomOut"), icon: /* @__PURE__ */ s.jsx(Jt, { size: 16 }), onClick: () => Ae(-0.1), disabled: !A }),
        /* @__PURE__ */ s.jsxs("span", { className: w(
          "workbench-preview-player__zoom-label",
          "min-w-[38px] text-[var(--workbench-muted)] text-micro font-bold tabular-nums text-center"
        ), "aria-label": t("timelinePreview.currentZoom"), children: [
          Math.round(R.scale * 100),
          "%"
        ] }),
        /* @__PURE__ */ s.jsx(N, { className: w("workbench-preview-player__icon-button", K), label: t("timelinePreview.resetView"), icon: /* @__PURE__ */ s.jsx(Gt, { size: 16 }), onClick: mt, disabled: !A }),
        /* @__PURE__ */ s.jsx(N, { className: w("workbench-preview-player__icon-button", K), label: t("timelinePreview.zoomIn"), icon: /* @__PURE__ */ s.jsx(Qt, { size: 16 }), onClick: () => Ae(0.1), disabled: !A })
      ] }),
      /* @__PURE__ */ s.jsx("div", { className: w(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      /* @__PURE__ */ s.jsxs("div", { ref: ue, className: w(
        "workbench-preview-player__text-tools",
        "relative flex-none inline-flex items-center"
      ), "aria-label": t("timelinePreview.addText"), children: [
        /* @__PURE__ */ s.jsxs(
          Xe,
          {
            className: w("h-7 px-2.5 inline-flex items-center gap-1 border border-[var(--workbench-border)] rounded-full whitespace-nowrap bg-transparent text-[var(--workbench-muted)] text-micro font-bold cursor-pointer hover:bg-[var(--workbench-hover)] hover:text-[var(--workbench-ink)]"),
            "aria-label": t("timelinePreview.addText"),
            "aria-expanded": J,
            title: t("timelinePreview.addTextHint"),
            onClick: () => de((i) => !i),
            children: [
              /* @__PURE__ */ s.jsx(be, { size: 14 }),
              t("timelinePreview.text"),
              /* @__PURE__ */ s.jsx(Yt, { size: 12, className: "opacity-60" })
            ]
          }
        ),
        J ? /* @__PURE__ */ s.jsxs("div", { className: w(
          "workbench-preview-player__text-menu",
          "absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-[5]",
          "min-w-[148px] p-1 flex flex-col gap-0.5",
          "rounded-[var(--nomi-radius)] border border-[var(--workbench-border)]",
          "bg-[var(--nomi-paper)] shadow-[var(--workbench-shadow-pop)]"
        ), role: "menu", children: [
          /* @__PURE__ */ s.jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: w("flex items-center gap-2 px-2 py-1.5 rounded-[var(--nomi-radius-sm)] text-left text-caption text-[var(--workbench-ink)] hover:bg-[var(--workbench-hover)]"),
              onClick: () => Le("caption"),
              children: [
                /* @__PURE__ */ s.jsx(be, { size: 14, className: "flex-none text-[var(--workbench-text)]" }),
                /* @__PURE__ */ s.jsx("span", { className: "flex-1", children: t("timelinePreview.caption") }),
                /* @__PURE__ */ s.jsx("span", { className: "text-[var(--workbench-muted-soft)] text-micro", children: t("timelinePreview.captionPosition") })
              ]
            }
          ),
          /* @__PURE__ */ s.jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: w("flex items-center gap-2 px-2 py-1.5 rounded-[var(--nomi-radius-sm)] text-left text-caption text-[var(--workbench-ink)] hover:bg-[var(--workbench-hover)]"),
              onClick: () => Le("title"),
              children: [
                /* @__PURE__ */ s.jsx(be, { size: 14, className: "flex-none text-[var(--workbench-text)]" }),
                /* @__PURE__ */ s.jsx("span", { className: "flex-1", children: t("timelinePreview.titleCard") }),
                /* @__PURE__ */ s.jsx("span", { className: "text-[var(--workbench-muted-soft)] text-micro", children: t("timelinePreview.titleCardPosition") })
              ]
            }
          )
        ] }) : null
      ] }),
      /* @__PURE__ */ s.jsx(sr, { timeline: a, selectedTextClipId: Me }),
      /* @__PURE__ */ s.jsx("div", { className: w(
        "workbench-preview-player__control-separator",
        "w-px h-5 bg-[var(--workbench-border-soft)]"
      ), "aria-hidden": "true" }),
      v === "preparing" || v === "recording" || v === "converting" ? /* @__PURE__ */ s.jsxs("div", { className: w(
        "workbench-preview-player__export-progress",
        "flex items-center gap-2 px-2"
      ), children: [
        /* @__PURE__ */ s.jsx("div", { className: w(
          "workbench-preview-player__export-progress-bar-track",
          "w-20 h-1 bg-nomi-ink-10 rounded-nomi-sm overflow-hidden"
        ), children: /* @__PURE__ */ s.jsx(
          "div",
          {
            className: w(
              "workbench-preview-player__export-progress-bar",
              "h-1 bg-nomi-accent rounded-nomi-sm transition-[width] duration-200 ease-in-out min-w-1"
            ),
            style: { width: `${Math.round(g * 100)}%` }
          }
        ) }),
        /* @__PURE__ */ s.jsx("span", { className: w(
          "workbench-preview-player__export-progress-label",
          "text-caption text-nomi-ink-60 whitespace-nowrap"
        ), children: v === "preparing" ? t("timelinePreview.preparing") : v === "converting" ? t("timelinePreview.converting") : t("timelinePreview.exporting", { percent: Math.round(g * 100) }) }),
        /* @__PURE__ */ s.jsx(
          N,
          {
            className: w(
              "workbench-preview-player__export-cancel",
              "w-6 h-6 inline-grid place-items-center p-0 rounded-full border-0 bg-transparent text-[var(--workbench-muted)]",
              "enabled:cursor-pointer enabled:hover:bg-[var(--workbench-hover)] enabled:hover:text-[var(--workbench-danger)]",
              // 同 CONTROL_ICON_BUTTON_CLASS：钉死基类无条件 hover，禁用态（准备中）不假高亮。
              "disabled:hover:bg-transparent disabled:hover:text-[var(--workbench-muted)]"
            ),
            label: t("timelinePreview.cancelExport"),
            title: t(k ? "timelinePreview.cancelExport" : "timelinePreview.preparingCannotCancel"),
            icon: /* @__PURE__ */ s.jsx(Ut, { size: 14 }),
            onClick: ht,
            disabled: !k
          }
        )
      ] }) : null,
      /* @__PURE__ */ s.jsxs(
        Xe,
        {
          className: w(
            "workbench-preview-player__export-button",
            "h-7 px-3 border border-transparent rounded-full whitespace-nowrap",
            "inline-flex items-center justify-center gap-1.5",
            "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] text-micro font-bold cursor-pointer",
            "hover:bg-[var(--nomi-accent)] hover:text-[var(--nomi-paper)]",
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--nomi-ink)]"
          ),
          "aria-label": t("timelinePreview.exportMp4"),
          onClick: xe,
          disabled: $ || Y,
          title: ct,
          children: [
            $ ? /* @__PURE__ */ s.jsx(Xt, { size: 15, className: w("workbench-preview-player__spinner", "animate-spin") }) : /* @__PURE__ */ s.jsx($t, { size: 15 }),
            t("timelinePreview.exportMp4")
          ]
        }
      )
    ] })
  ] });
}
function dn() {
  const { t: e } = Ce(), r = y((h) => h.timeline), n = y((h) => h.timeline.tracks), o = y((h) => h.timeline.textClips), a = y((h) => h.timeline.playheadFrame), t = y((h) => h.timelinePlaying), c = y((h) => h.previewAspectRatio), u = y((h) => h.setTimelinePlaying), m = p.useMemo(() => G(r), [n, o]), d = p.useMemo(() => Ee(r, a), [n, a]);
  return p.useEffect(() => {
    if (!t) return;
    if (m <= 0) {
      u(!1);
      return;
    }
    const h = Math.max(1, y.getState().timeline.fps);
    let k = performance.now(), b = 0, l = 0;
    const x = (v) => {
      b += (v - k) / 1e3 * h, k = v;
      const _ = Math.floor(b);
      if (_ > 0) {
        b -= _;
        const T = y.getState().timeline.playheadFrame + _;
        if (T >= m) {
          y.getState().setTimelinePlayhead(m), y.getState().setTimelinePlaying(!1);
          return;
        }
        y.getState().setTimelinePlayhead(T);
      }
      l = window.requestAnimationFrame(x);
    };
    return l = window.requestAnimationFrame(x), () => window.cancelAnimationFrame(l);
  }, [m, t, u]), /* @__PURE__ */ s.jsxs(
    "section",
    {
      className: w(
        "workbench-preview",
        "w-full h-full min-w-0 min-h-0 grid grid-rows-[minmax(0,1fr)_var(--workbench-preview-timeline-height)]",
        "overflow-hidden bg-[var(--workbench-bg)]"
      ),
      "aria-label": e("workspace.preview"),
      children: [
        /* @__PURE__ */ s.jsx(
          Vr,
          {
            activeClips: d,
            aspectRatio: c,
            fps: r.fps,
            playheadFrame: r.playheadFrame,
            timeline: r
          }
        ),
        /* @__PURE__ */ s.jsx(
          Wt,
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
  dn as default
};
