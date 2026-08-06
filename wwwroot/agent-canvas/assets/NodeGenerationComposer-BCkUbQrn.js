import { cS as ce, aU as lo, ci as i, c as Ie, a5 as co, b8 as uo, e1 as mo, e4 as po, dS as fo, d_ as go, aV as ho, d1 as bo, bK as xo, bP as yo, bM as vo, aT as Ae, aL as g, S as b, e6 as ye, ce as ko, c3 as ee, bB as wo, t as Co, J as Cn, b as So, cR as Sn, d8 as dt, dz as Mn, aX as Rn, am as Mo, aW as _t, dL as Ke, cz as Ro, b5 as Ao, dW as ne, dc as An, ag as mt, ca as jn, cf as wt, bE as Nn, c4 as En, aq as jo, an as No, al as Eo, ak as _o, ao as Po, c$ as Lt, cT as rt, by as Io, ah as zo, af as _n, b$ as lt, s as Oo, dJ as Pn, bO as Lo, dp as Do, K as Dt, a8 as it, x as To, bf as Fo, de as In, b2 as Ko, b1 as Vo, ba as Uo, aj as $o, dd as Bo, cI as Tt, a as Ho, bG as Wo, cx as Go } from "./agentStudioMount-S0u8Hm0S.js";
import { I as zn } from "./IconFileText-hUrRXVLk.js";
import { c as qo, N as Xo, R as Yo, m as Zo, P as Jo, d as Qo, a as er, D as tr, f as nr, b as or, e as rr, u as ir, i as ar, g as sr, E as lr } from "./index-CS_bBWIX.js";
import { p as cr, g as ur, w as Ft, l as dr, s as mr, t as pr, c as Kt, j as fr, f as gr, r as hr, e as br } from "./generationRunController-BQ4b1Xa_.js";
import { n as Ue, a as Vt, p as Ut, c as $t, A as On, b as Ct, d as xr } from "./referenceSlots-DtVNpJ2D.js";
import { a as yr, u as vr } from "./batchPlanPreview-BKmkPTzs.js";
import { a as kr, u as wr, I as Cr } from "./useDedupedModelSelect-HXLvwnVt.js";
import { d as Sr, f as Mr } from "./modelCatalogCache-CzefSJue.js";
import { u as Rr, f as Ar, a as jr, b as Bt, A as Ht, m as Nr } from "./useAssetPool-BJdFbBZW.js";
import { I as Er } from "./IconUpload-CUMbG66s.js";
import { s as Ee } from "./showInfoToast-BwF7mzAE.js";
import { I as Ln } from "./IconChevronRight-CuoN5Ibj.js";
import { b as _r } from "./forms-B148KJJz.js";
import { b as Pr, N as Wt, P as ht } from "./NomiSelect-BTVMoxW5.js";
import { I as Ir } from "./IconLock-CMtj0-i0.js";
import { I as zr, a as Or } from "./IconRotate-CJq7IAXh.js";
import { I as Lr } from "./IconVideo-CHle5q9G.js";
import { a as Dr, I as Tr } from "./IconZoomOut-DNP0S4cS.js";
import { CAMERA_SPEED_DURATION as Fr, CAMERA_MOVES as Dn } from "./cameraMoveVocab-CkwMRCGZ.js";
import { createCameraMoveReferenceNode as Kr } from "./cameraMoveReferenceNode-DPIlF08N.js";
import { r as Vr } from "./promptLearningApi-j-1R-imY.js";
import { W as Gt, p as Ur, b as $r } from "./workspaceFileDrag-CNxBSF4X.js";
function Ze(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Br(e, t, n = "ltr") {
  const o = ce.useRef(null), r = ce.useRef(!1), a = ce.useRef(!1), s = ce.useRef(0), [c, f] = ce.useState(!1);
  return ce.useEffect(() => {
    r.current = !0;
  }, []), ce.useEffect(() => {
    const m = o.current, h = ({ x: w, y: D }) => {
      cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
        if (r.current && m) {
          m.style.userSelect = "none";
          const q = m.getBoundingClientRect();
          if (q.width && q.height) {
            const N = Ze((w - q.left) / q.width, 0, 1);
            e({
              x: n === "ltr" ? N : 1 - N,
              y: Ze((D - q.top) / q.height, 0, 1)
            });
          }
        }
      });
    }, p = () => {
      document.addEventListener("mousemove", x), document.addEventListener("mouseup", M), document.addEventListener("touchmove", S), document.addEventListener("touchend", M);
    }, u = () => {
      document.removeEventListener("mousemove", x), document.removeEventListener("mouseup", M), document.removeEventListener("touchmove", S), document.removeEventListener("touchend", M);
    }, v = () => {
      !a.current && r.current && (a.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), f(!0), p());
    }, M = () => {
      a.current && r.current && (a.current = !1, f(!1), u(), setTimeout(() => {
        typeof t?.onScrubEnd == "function" && t.onScrubEnd();
      }, 0));
    }, d = (w) => {
      v(), w.preventDefault(), x(w);
    }, x = (w) => h({ x: w.clientX, y: w.clientY }), K = (w) => {
      w.cancelable && w.preventDefault(), v(), S(w);
    }, S = (w) => {
      w.cancelable && w.preventDefault(), h({ x: w.changedTouches[0].clientX, y: w.changedTouches[0].clientY });
    };
    return m?.addEventListener("mousedown", d), m?.addEventListener("touchstart", K, { passive: !1 }), () => {
      m && (m.removeEventListener("mousedown", d), m.removeEventListener("touchstart", K));
    };
  }, [n, e]), { ref: o, active: c };
}
function qt(e, t) {
  return t.length === 0 ? e : t.reduce(
    (n, o) => Math.abs(o - e) < Math.abs(n - e) ? o : n
  );
}
const [Hr, ft] = lo(
  "SliderProvider was not found in tree"
), Tn = ce.forwardRef(
  ({ size: e, disabled: t, variant: n, color: o, thumbSize: r, radius: a, ...s }, c) => {
    const { getStyles: f } = ft();
    return /* @__PURE__ */ i.jsx(
      Ie,
      {
        tabIndex: -1,
        variant: n,
        size: e,
        ref: c,
        ...f("root"),
        ...s
      }
    );
  }
);
Tn.displayName = "@mantine/core/SliderRoot";
const Fn = ce.forwardRef(
  ({
    max: e,
    min: t,
    value: n,
    position: o,
    label: r,
    dragging: a,
    onMouseDown: s,
    onKeyDownCapture: c,
    labelTransitionProps: f,
    labelAlwaysOn: m,
    thumbLabel: h,
    onFocus: p,
    onBlur: u,
    showLabelOnHover: v,
    isHovered: M,
    children: d = null,
    disabled: x
  }, K) => {
    const { getStyles: S } = ft(), [w, D] = ce.useState(!1), q = m || a || w || v && M;
    return /* @__PURE__ */ i.jsxs(
      Ie,
      {
        tabIndex: 0,
        role: "slider",
        "aria-label": h,
        "aria-valuemax": e,
        "aria-valuemin": t,
        "aria-valuenow": n,
        ref: K,
        __vars: { "--slider-thumb-offset": `${o}%` },
        ...S("thumb", { focusable: !0 }),
        mod: { dragging: a, disabled: x },
        onFocus: (N) => {
          D(!0), typeof p == "function" && p(N);
        },
        onBlur: (N) => {
          D(!1), typeof u == "function" && u(N);
        },
        onTouchStart: s,
        onMouseDown: s,
        onKeyDownCapture: c,
        onClick: (N) => N.stopPropagation(),
        children: [
          d,
          /* @__PURE__ */ i.jsx(
            co,
            {
              mounted: r != null && !!q,
              transition: "fade",
              duration: 0,
              ...f,
              children: (N) => /* @__PURE__ */ i.jsx("div", { ...S("label", { style: N }), children: r })
            }
          )
        ]
      }
    );
  }
);
Fn.displayName = "@mantine/core/SliderThumb";
function Kn({ value: e, min: t, max: n }) {
  const o = (e - t) / (n - t) * 100;
  return Math.min(Math.max(o, 0), 100);
}
function Wr({ mark: e, offset: t, value: n, inverted: o = !1 }) {
  return o ? typeof t == "number" && e.value <= t || e.value >= n : typeof t == "number" ? e.value >= t && e.value <= n : e.value <= n;
}
function Vn({ marks: e, min: t, max: n, disabled: o, value: r, offset: a, inverted: s }) {
  const { getStyles: c } = ft();
  if (!e)
    return null;
  const f = e.map((m, h) => /* @__PURE__ */ ce.createElement(
    Ie,
    {
      ...c("markWrapper"),
      __vars: { "--mark-offset": `${Kn({ value: m.value, min: t, max: n })}%` },
      key: h
    },
    /* @__PURE__ */ i.jsx(
      Ie,
      {
        ...c("mark"),
        mod: { filled: Wr({ mark: m, value: r, offset: a, inverted: s }), disabled: o }
      }
    ),
    m.label && /* @__PURE__ */ i.jsx("div", { ...c("markLabel"), children: m.label })
  ));
  return /* @__PURE__ */ i.jsx("div", { children: f });
}
Vn.displayName = "@mantine/core/SliderMarks";
function Un({
  filled: e,
  children: t,
  offset: n,
  disabled: o,
  marksOffset: r,
  inverted: a,
  containerProps: s,
  ...c
}) {
  const { getStyles: f } = ft();
  return /* @__PURE__ */ i.jsx(Ie, { ...f("trackContainer"), mod: { disabled: o }, ...s, children: /* @__PURE__ */ i.jsxs(Ie, { ...f("track"), mod: { inverted: a, disabled: o }, children: [
    /* @__PURE__ */ i.jsx(
      Ie,
      {
        mod: { inverted: a, disabled: o },
        __vars: {
          "--slider-bar-width": `calc(${e}% + var(--slider-size))`,
          "--slider-bar-offset": `calc(${n}% - var(--slider-size))`
        },
        ...f("bar")
      }
    ),
    t,
    /* @__PURE__ */ i.jsx(Vn, { ...c, offset: r, disabled: o, inverted: a })
  ] }) });
}
Un.displayName = "@mantine/core/SliderTrack";
function Gr({
  value: e,
  containerWidth: t,
  min: n,
  max: o,
  step: r,
  precision: a
}) {
  const c = (t ? Math.min(Math.max(e, 0), t) / t : e) * (o - n), f = (c !== 0 ? Math.round(c / r) * r : 0) + n, m = Math.max(f, n);
  return a !== void 0 ? Number(m.toFixed(a)) : m;
}
function at(e, t) {
  return parseFloat(e.toFixed(t));
}
function qr(e) {
  if (!e)
    return 0;
  const t = e.toString().split(".");
  return t.length > 1 ? t[1].length : 0;
}
function bt(e, t) {
  const o = [...t].sort((r, a) => r.value - a.value).find((r) => r.value > e);
  return o ? o.value : e;
}
function xt(e, t) {
  const o = [...t].sort((r, a) => a.value - r.value).find((r) => r.value < e);
  return o ? o.value : e;
}
function Xt(e) {
  const t = [...e].sort((n, o) => n.value - o.value);
  return t.length > 0 ? t[0].value : 0;
}
function Yt(e) {
  const t = [...e].sort((n, o) => n.value - o.value);
  return t.length > 0 ? t[t.length - 1].value : 100;
}
var $n = { root: "m_dd36362e", label: "m_c9357328", thumb: "m_c9a9a60a", trackContainer: "m_a8645c2", track: "m_c9ade57f", bar: "m_38aeed47", markWrapper: "m_b7b0423a", mark: "m_dd33bc19", markLabel: "m_68c77a5b" };
const Xr = {
  radius: "xl",
  min: 0,
  max: 100,
  step: 1,
  marks: [],
  label: (e) => e,
  labelTransitionProps: { transition: "fade", duration: 0 },
  labelAlwaysOn: !1,
  thumbLabel: "",
  showLabelOnHover: !0,
  disabled: !1,
  scale: (e) => e
}, Yr = ho(
  (e, { size: t, color: n, thumbSize: o, radius: r }) => ({
    root: {
      "--slider-size": vo(t, "slider-size"),
      "--slider-color": n ? yo(n, e) : void 0,
      "--slider-radius": r === void 0 ? void 0 : xo(r),
      "--slider-thumb-size": o !== void 0 ? bo(o) : "calc(var(--slider-size) * 2)"
    }
  })
), Pt = uo((e, t) => {
  const n = mo("Slider", Xr, e), {
    classNames: o,
    styles: r,
    value: a,
    onChange: s,
    onChangeEnd: c,
    size: f,
    min: m,
    max: h,
    step: p,
    precision: u,
    defaultValue: v,
    name: M,
    marks: d,
    label: x,
    labelTransitionProps: K,
    labelAlwaysOn: S,
    thumbLabel: w,
    showLabelOnHover: D,
    thumbChildren: q,
    disabled: N,
    unstyled: U,
    scale: Y,
    inverted: A,
    className: j,
    style: I,
    vars: T,
    hiddenInputProps: F,
    restrictToMarks: E,
    thumbProps: Z,
    ...y
  } = n, J = po({
    name: "Slider",
    props: n,
    classes: $n,
    classNames: o,
    className: j,
    styles: r,
    style: I,
    vars: T,
    varsResolver: Yr,
    unstyled: U
  }), { dir: z } = fo(), [_, B] = ce.useState(!1), [O, V] = Pr({
    value: typeof a == "number" ? Ze(a, m, h) : a,
    defaultValue: typeof v == "number" ? Ze(v, m, h) : v,
    finalValue: Ze(0, m, h),
    onChange: s
  }), X = ce.useRef(O), de = ce.useRef(c);
  ce.useEffect(() => {
    de.current = c;
  }, [c]);
  const me = ce.useRef(null), ge = ce.useRef(null), Ce = Kn({ value: O, min: m, max: h }), he = Y(O), be = typeof x == "function" ? x(he) : x, pe = u ?? qr(p), Oe = ce.useCallback(
    ({ x: se }) => {
      if (!N) {
        const te = Gr({
          value: se,
          min: m,
          max: h,
          step: p,
          precision: pe
        });
        V(
          E && d?.length ? qt(
            te,
            d.map((ie) => ie.value)
          ) : te
        ), X.current = te;
      }
    },
    [N, m, h, p, pe, V, d, E]
  ), Se = ce.useCallback(() => {
    if (!N && de.current) {
      const se = E && d?.length ? qt(
        X.current,
        d.map((te) => te.value)
      ) : X.current;
      de.current(se);
    }
  }, [N, d, E]), { ref: Ge, active: Pe } = Br(Oe, { onScrubEnd: Se }, z), fe = ce.useCallback(
    (se) => {
      !N && de.current && de.current(se);
    },
    [N]
  ), Le = (se) => {
    if (!N)
      switch (se.key) {
        case "ArrowUp": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            const ie = bt(O, d);
            V(ie), fe(ie);
            break;
          }
          const te = at(
            Math.min(Math.max(O + p, m), h),
            pe
          );
          V(te), fe(te);
          break;
        }
        case "ArrowRight": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            const ie = z === "rtl" ? xt(O, d) : bt(O, d);
            V(ie), fe(ie);
            break;
          }
          const te = at(
            Math.min(Math.max(z === "rtl" ? O - p : O + p, m), h),
            pe
          );
          V(te), fe(te);
          break;
        }
        case "ArrowDown": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            const ie = xt(O, d);
            V(ie), fe(ie);
            break;
          }
          const te = at(
            Math.min(Math.max(O - p, m), h),
            pe
          );
          V(te), fe(te);
          break;
        }
        case "ArrowLeft": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            const ie = z === "rtl" ? bt(O, d) : xt(O, d);
            V(ie), fe(ie);
            break;
          }
          const te = at(
            Math.min(Math.max(z === "rtl" ? O + p : O - p, m), h),
            pe
          );
          V(te), fe(te);
          break;
        }
        case "Home": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            V(Xt(d)), fe(Xt(d));
            break;
          }
          V(m), fe(m);
          break;
        }
        case "End": {
          if (se.preventDefault(), ge.current?.focus(), E && d) {
            V(Yt(d)), fe(Yt(d));
            break;
          }
          V(h), fe(h);
          break;
        }
      }
  };
  return /* @__PURE__ */ i.jsx(Hr, { value: { getStyles: J }, children: /* @__PURE__ */ i.jsxs(
    Tn,
    {
      ...y,
      ref: go(t, me),
      onKeyDownCapture: Le,
      onMouseDownCapture: () => me.current?.focus(),
      size: f,
      disabled: N,
      children: [
        /* @__PURE__ */ i.jsx(
          Un,
          {
            inverted: A,
            offset: 0,
            filled: Ce,
            marks: d,
            min: m,
            max: h,
            value: he,
            disabled: N,
            containerProps: {
              ref: Ge,
              onMouseEnter: D ? () => B(!0) : void 0,
              onMouseLeave: D ? () => B(!1) : void 0
            },
            children: /* @__PURE__ */ i.jsx(
              Fn,
              {
                max: h,
                min: m,
                value: he,
                position: Ce,
                dragging: Pe,
                label: be,
                ref: ge,
                labelTransitionProps: K,
                labelAlwaysOn: S,
                thumbLabel: w,
                showLabelOnHover: D,
                isHovered: _,
                disabled: N,
                ...Z,
                children: q
              }
            )
          }
        ),
        /* @__PURE__ */ i.jsx("input", { type: "hidden", name: M, value: he, ...F })
      ]
    }
  ) });
});
Pt.classes = $n;
Pt.displayName = "@mantine/core/Slider";
const Zr = [["path", { d: "M15 12h3.586a1 1 0 0 1 .707 1.707l-6.586 6.586a1 1 0 0 1 -1.414 0l-6.586 -6.586a1 1 0 0 1 .707 -1.707h3.586v-3h6v3", key: "svg-0" }], ["path", { d: "M15 3h-6", key: "svg-1" }], ["path", { d: "M15 6h-6", key: "svg-2" }]], Jr = Ae("outline", "arrow-big-down-lines", "ArrowBigDownLines", Zr);
const Qr = [["path", { d: "M9 12h-3.586a1 1 0 0 1 -.707 -1.707l6.586 -6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1 -.707 1.707h-3.586v3h-6v-3", key: "svg-0" }], ["path", { d: "M9 21h6", key: "svg-1" }], ["path", { d: "M9 18h6", key: "svg-2" }]], ei = Ae("outline", "arrow-big-up-lines", "ArrowBigUpLines", Qr);
const ti = [["path", { d: "M5 12l14 0", key: "svg-0" }], ["path", { d: "M5 12l4 4", key: "svg-1" }], ["path", { d: "M5 12l4 -4", key: "svg-2" }]], ni = Ae("outline", "arrow-narrow-left", "ArrowNarrowLeft", ti);
const oi = [["path", { d: "M5 12l14 0", key: "svg-0" }], ["path", { d: "M15 16l4 -4", key: "svg-1" }], ["path", { d: "M15 8l4 4", key: "svg-2" }]], ri = Ae("outline", "arrow-narrow-right", "ArrowNarrowRight", oi);
const ii = [["path", { d: "M17 3l0 8.707", key: "svg-0" }], ["path", { d: "M13 7l4 -4l4 4", key: "svg-1" }], ["path", { d: "M7 14l-4 -4l4 -4", key: "svg-2" }], ["path", { d: "M17 21a11 11 0 0 0 -11 -11h-3", key: "svg-3" }]], ai = Ae("outline", "arrow-ramp-left", "ArrowRampLeft", ii);
const si = [["path", { d: "M7 3l0 8.707", key: "svg-0" }], ["path", { d: "M11 7l-4 -4l-4 4", key: "svg-1" }], ["path", { d: "M17 14l4 -4l-4 -4", key: "svg-2" }], ["path", { d: "M7 21a11 11 0 0 1 11 -11h3", key: "svg-3" }]], li = Ae("outline", "arrow-ramp-right", "ArrowRampRight", si);
const ci = [["path", { d: "M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5", key: "svg-0" }]], ui = Ae("outline", "rotate-clockwise", "RotateClockwise", ci);
const di = [["path", { d: "M15 13v4", key: "svg-0" }], ["path", { d: "M13 15h4", key: "svg-1" }], ["path", { d: "M10 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", key: "svg-2" }], ["path", { d: "M22 22l-3 -3", key: "svg-3" }], ["path", { d: "M6 18h-1a2 2 0 0 1 -2 -2v-1", key: "svg-4" }], ["path", { d: "M3 11v-1", key: "svg-5" }], ["path", { d: "M3 6v-1a2 2 0 0 1 2 -2h1", key: "svg-6" }], ["path", { d: "M10 3h1", key: "svg-7" }], ["path", { d: "M15 3h1a2 2 0 0 1 2 2v1", key: "svg-8" }]], mi = Ae("outline", "zoom-in-area", "ZoomInArea", di);
const pi = [["path", { d: "M13 15h4", key: "svg-0" }], ["path", { d: "M10 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", key: "svg-1" }], ["path", { d: "M22 22l-3 -3", key: "svg-2" }], ["path", { d: "M6 18h-1a2 2 0 0 1 -2 -2v-1", key: "svg-3" }], ["path", { d: "M3 11v-1", key: "svg-4" }], ["path", { d: "M3 6v-1a2 2 0 0 1 2 -2h1", key: "svg-5" }], ["path", { d: "M10 3h1", key: "svg-6" }], ["path", { d: "M15 3h1a2 2 0 0 1 2 2v1", key: "svg-7" }]], fi = Ae("outline", "zoom-out-area", "ZoomOutArea", pi);
function Zt({ value: e, options: t, onChange: n, ariaLabel: o, className: r, itemClassName: a }) {
  return (
    // grid 等宽列（2026-07-17 用户反馈：flex-1 下换行的孤项被拉伸，「多出来的选项要和其他一样大」）：
    // auto-fit+minmax——所有项严格等宽；选项少于一行时空轨道塌陷、项拉伸**填满父容器**（1K/2K 两项
    // 各占一半，不缩在左边）；选项多于一行时与 auto-fill 无差（换行项与上行同宽）。
    // 尺寸走 inline style 不用任意值类：dev 的 tailwind 生成缓存可能缺新类 → 布局静默塌（栽过两次）。
    /* @__PURE__ */ i.jsx(
      "div",
      {
        className: g("grid rounded-nomi bg-nomi-ink-05 p-1 gap-1", r),
        style: { gridTemplateColumns: "repeat(auto-fit, minmax(56px, 1fr))" },
        role: "radiogroup",
        "aria-label": o,
        children: t.map((s) => {
          const c = s.value === e;
          return /* @__PURE__ */ i.jsx(
            "button",
            {
              type: "button",
              role: "radio",
              "aria-checked": c,
              title: s.title,
              disabled: s.disabled,
              onClick: () => {
                c || n(s.value);
              },
              style: { minHeight: 32 },
              className: g(
                "px-2 py-1 rounded-nomi-sm border-0 text-caption cursor-pointer min-w-0",
                "inline-flex flex-col items-center justify-center gap-1 font-[inherit]",
                "transition-colors duration-[var(--nomi-transition-fast)]",
                c ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "bg-transparent text-nomi-ink-60 hover:text-nomi-ink-80",
                s.disabled && "text-nomi-ink-30 hover:text-nomi-ink-30 cursor-not-allowed",
                a
              ),
              children: s.label
            },
            s.value
          );
        })
      }
    )
  );
}
function gi({ node: e }) {
  const t = String(e.attrs.url || ""), n = Number(e.attrs.index), o = Number.isInteger(n) && n > 0 ? `图片${n}` : "参考图";
  return /* @__PURE__ */ i.jsxs(
    qo,
    {
      as: "span",
      "data-asset-mention": "",
      "aria-label": o,
      className: g("inline-flex align-[-5px] h-[22px] items-center gap-[4px] mx-[2px] pr-[6px] rounded-nomi-sm border border-nomi-line bg-nomi-ink-05 overflow-hidden cursor-pointer hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-nomi-accent"),
      contentEditable: !1,
      children: [
        /* @__PURE__ */ i.jsx("img", { src: t, alt: "", draggable: !1, className: g("w-[22px] h-[22px] object-cover select-none shrink-0") }),
        /* @__PURE__ */ i.jsx("span", { className: g("text-micro font-medium leading-none text-nomi-ink-70 whitespace-nowrap"), children: o })
      ]
    }
  );
}
const hi = Xo.create({
  name: "assetMention",
  group: "inline",
  inline: !0,
  atom: !0,
  selectable: !0,
  draggable: !1,
  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (e) => e.getAttribute("data-url") || "",
        renderHTML: (e) => ({ "data-url": e.url })
      },
      // 仅用于 UI 显示「图片N」，持久化仍只认 url；编号始终由当前有序参考图列表实时投影。
      index: {
        default: null,
        parseHTML: (e) => {
          const t = Number(e.getAttribute("data-index"));
          return Number.isInteger(t) && t > 0 ? t : null;
        },
        renderHTML: (e) => Number.isInteger(e.index) && Number(e.index) > 0 ? { "data-index": String(e.index) } : {}
      }
    };
  },
  parseHTML() {
    return [{ tag: "span[data-asset-mention]" }];
  },
  renderHTML({ HTMLAttributes: e }) {
    return ["span", Zo(e, { "data-asset-mention": "" })];
  },
  addNodeView() {
    return Yo(gi);
  },
  addCommands() {
    return {
      insertAssetMention: (e, t) => ({ chain: n }) => n().focus().insertContent({ type: this.name, attrs: { url: e, index: t ?? null } }).run()
    };
  }
});
function bi(e) {
  var t;
  const { char: n, allowSpaces: o, allowToIncludeChar: r, allowedPrefixes: a, startOfLine: s, $position: c } = e, f = o && !r, m = nr(n), h = new RegExp(`\\s${m}$`), p = s ? "^" : "", u = r ? "" : m, v = f ? new RegExp(`${p}${m}.*?(?=\\s${u}|$)`, "gm") : new RegExp(`${p}(?:^)?${m}[^\\s${u}]*`, "gm"), M = ((t = c.nodeBefore) == null ? void 0 : t.isText) && c.nodeBefore.text;
  if (!M)
    return null;
  const d = c.pos - M.length, x = Array.from(M.matchAll(v)).pop();
  if (!x || x.input === void 0 || x.index === void 0)
    return null;
  const K = x.input.slice(Math.max(0, x.index - 1), x.index), S = new RegExp(`^[${a?.join("")}\0]?$`).test(K);
  if (a !== null && !S)
    return null;
  const w = d + x.index;
  let D = w + x[0].length;
  return f && h.test(M.slice(D - 1, D + 1)) && (x[0] += " ", D += 1), w < c.pos && D >= c.pos ? {
    range: {
      from: w,
      to: D
    },
    query: x[0].slice(n.length),
    text: x[0]
  } : null;
}
function xi(e) {
  return e.docChanged ? e.steps.some((t) => {
    const n = t.slice;
    if (!n?.content)
      return !1;
    const o = n.content.textBetween(0, n.content.size, `
`);
    return /\s/.test(o);
  }) : !1;
}
var yi = new Qo("suggestion");
function vi({
  pluginKey: e = yi,
  editor: t,
  char: n = "@",
  allowSpaces: o = !1,
  allowToIncludeChar: r = !1,
  allowedPrefixes: a = [" "],
  startOfLine: s = !1,
  decorationTag: c = "span",
  decorationClass: f = "suggestion",
  decorationContent: m = "",
  decorationEmptyClass: h = "is-empty",
  command: p = () => null,
  items: u = () => [],
  render: v = () => ({}),
  allow: M = () => !0,
  findSuggestionMatch: d = bi,
  shouldShow: x,
  shouldResetDismissed: K
}) {
  let S;
  const w = v?.(), D = o && !r, q = () => {
    const j = t.state.selection.$anchor.pos, I = t.view.coordsAtPos(j), { top: T, right: F, bottom: E, left: Z } = I;
    try {
      return new DOMRect(Z, T, F - Z, E - T);
    } catch {
      return null;
    }
  }, N = (j, I) => I ? () => {
    const T = e.getState(t.state), F = T?.decorationId, E = j.dom.querySelector(`[data-decoration-id="${F}"]`);
    return E?.getBoundingClientRect() || null;
  } : q, U = ({
    match: j,
    dismissedRange: I,
    state: T,
    transaction: F
  }) => K?.({
    editor: t,
    state: T,
    range: I,
    match: j,
    transaction: F,
    allowSpaces: D
  }) ? !1 : D ? j.range.from === I.from : j.range.from === I.from && !xi(F);
  function Y(j, I) {
    var T;
    try {
      const E = e.getState(j.state), Z = E?.decorationId ? j.dom.querySelector(`[data-decoration-id="${E.decorationId}"]`) : null, y = {
        // @ts-ignore editor is available in closure
        editor: t,
        range: E?.range || { from: 0, to: 0 },
        query: E?.query || null,
        text: E?.text || null,
        items: [],
        command: (J) => p({ editor: t, range: E?.range || { from: 0, to: 0 }, props: J }),
        decorationNode: Z,
        clientRect: N(j, Z)
      };
      (T = w?.onExit) == null || T.call(w, y);
    } catch {
    }
    const F = j.state.tr.setMeta(I, { exit: !0 });
    j.dispatch(F);
  }
  const A = new Jo({
    key: e,
    view() {
      return {
        update: async (j, I) => {
          var T, F, E, Z, y, J, z;
          const _ = (T = this.key) == null ? void 0 : T.getState(I), B = (F = this.key) == null ? void 0 : F.getState(j.state), O = _.active && B.active && _.range.from !== B.range.from, V = !_.active && B.active, X = _.active && !B.active, de = !V && !X && _.query !== B.query, me = V || O && de, ge = de || O, Ce = X || O && de;
          if (!me && !ge && !Ce)
            return;
          const he = Ce && !me ? _ : B, be = j.dom.querySelector(`[data-decoration-id="${he.decorationId}"]`);
          S = {
            editor: t,
            range: he.range,
            query: he.query,
            text: he.text,
            items: [],
            command: (pe) => p({
              editor: t,
              range: he.range,
              props: pe
            }),
            decorationNode: be,
            clientRect: N(j, be)
          }, me && ((E = w?.onBeforeStart) == null || E.call(w, S)), ge && ((Z = w?.onBeforeUpdate) == null || Z.call(w, S)), (ge || me) && (S.items = await u({
            editor: t,
            query: he.query
          })), Ce && ((y = w?.onExit) == null || y.call(w, S)), ge && ((J = w?.onUpdate) == null || J.call(w, S)), me && ((z = w?.onStart) == null || z.call(w, S));
        },
        destroy: () => {
          var j;
          S && ((j = w?.onExit) == null || j.call(w, S));
        }
      };
    },
    state: {
      // Initialize the plugin's internal state.
      init() {
        return {
          active: !1,
          range: {
            from: 0,
            to: 0
          },
          query: null,
          text: null,
          composing: !1,
          dismissedRange: null
        };
      },
      // Apply changes to the plugin state from a view transaction.
      apply(j, I, T, F) {
        const { isEditable: E } = t, { composing: Z } = t.view, { selection: y } = j, { empty: J, from: z } = y, _ = { ...I }, B = j.getMeta(e);
        if (B && B.exit)
          return _.active = !1, _.decorationId = null, _.range = { from: 0, to: 0 }, _.query = null, _.text = null, _.dismissedRange = I.active ? { ...I.range } : I.dismissedRange, _;
        if (_.composing = Z, j.docChanged && _.dismissedRange !== null && (_.dismissedRange = {
          from: j.mapping.map(_.dismissedRange.from),
          to: j.mapping.map(_.dismissedRange.to)
        }), E && (J || t.view.composing)) {
          (z < I.range.from || z > I.range.to) && !Z && !I.composing && (_.active = !1);
          const O = d({
            char: n,
            allowSpaces: o,
            allowToIncludeChar: r,
            allowedPrefixes: a,
            startOfLine: s,
            $position: y.$from
          }), V = `id_${Math.floor(Math.random() * 4294967295)}`;
          O && M({
            editor: t,
            state: F,
            range: O.range,
            isActive: I.active
          }) && (!x || x({
            editor: t,
            range: O.range,
            query: O.query,
            text: O.text,
            transaction: j
          })) ? (_.dismissedRange !== null && !U({
            match: O,
            dismissedRange: _.dismissedRange,
            state: F,
            transaction: j
          }) && (_.dismissedRange = null), _.dismissedRange === null ? (_.active = !0, _.decorationId = I.decorationId ? I.decorationId : V, _.range = O.range, _.query = O.query, _.text = O.text) : _.active = !1) : (O || (_.dismissedRange = null), _.active = !1);
        } else
          _.active = !1;
        return _.active || (_.decorationId = null, _.range = { from: 0, to: 0 }, _.query = null, _.text = null), _;
      }
    },
    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(j, I) {
        var T, F;
        const { active: E, range: Z } = A.getState(j.state);
        if (!E)
          return !1;
        if (I.key === "Escape" || I.key === "Esc") {
          const J = A.getState(j.state);
          return (T = w?.onKeyDown) == null || T.call(w, { view: j, event: I, range: J.range }), Y(j, e), !0;
        }
        return ((F = w?.onKeyDown) == null ? void 0 : F.call(w, { view: j, event: I, range: Z })) || !1;
      },
      // Setup decorator on the currently active suggestion.
      decorations(j) {
        const { active: I, range: T, decorationId: F, query: E } = A.getState(j);
        if (!I)
          return null;
        const Z = !E?.length, y = [f];
        return Z && y.push(h), er.create(j.doc, [
          tr.inline(T.from, T.to, {
            nodeName: c,
            class: y.join(" "),
            "data-decoration-id": F,
            "data-decoration-content": m
          })
        ]);
      }
    }
  });
  return A;
}
var ki = vi;
const Bn = b.forwardRef(({ items: e, command: t }, n) => {
  const { t: o } = ye(), [r, a] = b.useState(0);
  return b.useEffect(() => {
    a(0);
  }, [e]), b.useImperativeHandle(n, () => ({
    onKeyDown: ({ event: s }) => {
      if (!e.length) return !1;
      if (s.key === "ArrowDown" || s.key === "ArrowRight")
        return a((c) => (c + 1) % e.length), !0;
      if (s.key === "ArrowUp" || s.key === "ArrowLeft")
        return a((c) => (c - 1 + e.length) % e.length), !0;
      if (s.key === "Enter") {
        const c = e[r];
        return c && t(c), !0;
      }
      return !1;
    }
  }), [e, r, t]), e.length ? /* @__PURE__ */ i.jsxs(
    "div",
    {
      className: g("flex flex-wrap items-center gap-[6px] p-[6px] rounded-nomi-sm border border-nomi-line bg-nomi-paper shadow-nomi-sm"),
      style: { maxWidth: "min(520px, calc(100vw - 16px))" },
      children: [
        /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-40 text-micro px-[2px]"), children: o("assetLibrary.mentionLabel") }),
        e.map((s, c) => /* @__PURE__ */ i.jsxs(
          "button",
          {
            type: "button",
            "aria-label": o("assetLibrary.insertImageIndexed", { index: s.index + 1 }),
            onMouseEnter: () => a(c),
            onClick: () => t(s),
            className: g(
              "relative inline-flex h-[34px] items-center gap-[5px] rounded-nomi-sm overflow-hidden border border-nomi-line bg-nomi-paper pr-[7px] cursor-pointer",
              c === r && "outline outline-2 outline-offset-1 outline-nomi-accent"
            ),
            children: [
              /* @__PURE__ */ i.jsx("img", { src: s.url, alt: "", draggable: !1, className: g("w-[34px] h-[34px] object-cover select-none shrink-0") }),
              /* @__PURE__ */ i.jsx("span", { className: g("text-micro font-medium leading-none text-nomi-ink-70 whitespace-nowrap"), children: o("assetLibrary.referenceImageIndexed", { index: s.index + 1 }) })
            ]
          },
          s.url
        ))
      ]
    }
  ) : /* @__PURE__ */ i.jsx("div", { className: g("inline-flex items-center px-[8px] h-[30px] rounded-nomi-sm border border-nomi-line bg-nomi-paper shadow-nomi-sm text-nomi-ink-40 text-micro"), children: o("assetLibrary.mentionEmpty") });
});
Bn.displayName = "AssetMentionSuggestionList";
const Xe = 8, Jt = 4;
function Qt(e, t) {
  if (!t) return;
  const n = e.offsetHeight || 44, o = e.offsetWidth || 200;
  let r = t.bottom + Jt;
  r + n > window.innerHeight - Xe && (r = Math.max(Xe, t.top - Jt - n));
  let a = t.left;
  a + o > window.innerWidth - Xe && (a = window.innerWidth - Xe - o), a = Math.max(Xe, a), e.style.top = `${r}px`, e.style.left = `${a}px`;
}
function wi(e) {
  return or.create({
    name: "assetMentionSuggestion",
    addProseMirrorPlugins() {
      return [
        ki({
          editor: this.editor,
          char: "@",
          allowSpaces: !1,
          startOfLine: !1,
          // 候选 = 当前 image 参考(query 不用来过滤——参考是图、无人名可搜;打 @ 即可视选)。
          items: () => e.getCandidates().map((t, n) => ({ url: t, index: n })),
          command: ({ editor: t, range: n, props: o }) => {
            const r = o;
            t.chain().focus().deleteRange(n).insertAssetMention(r.url, r.index + 1).run();
          },
          render: () => {
            let t = null, n = null;
            return {
              onStart: (o) => {
                t = new rr(Bn, { props: o, editor: o.editor }), n = document.createElement("div"), n.style.position = "fixed", n.style.zIndex = "60", document.body.appendChild(n), n.appendChild(t.element), Qt(n, o.clientRect?.() ?? null);
              },
              onUpdate: (o) => {
                t?.updateProps(o), n && Qt(n, o.clientRect?.() ?? null);
              },
              onKeyDown: (o) => o.event.key === "Escape" ? !0 : t?.ref?.onKeyDown({ event: o.event }) ?? !1,
              onExit: () => {
                n?.remove(), n = null, t?.destroy(), t = null;
              }
            };
          }
        })
      ];
    }
  });
}
function St(e, t = []) {
  const n = cr(e), o = [{ type: "paragraph", content: [] }], r = (a) => {
    o[o.length - 1].content.push(a);
  };
  for (const a of n) {
    if (a.type === "mention") {
      const s = t.indexOf(a.url);
      r({ type: "assetMention", attrs: { url: a.url, index: s >= 0 ? s + 1 : null } });
      continue;
    }
    a.value.split(`
`).forEach((s, c) => {
      c > 0 && o.push({ type: "paragraph", content: [] }), s && r({ type: "text", text: s });
    });
  }
  return {
    type: "doc",
    content: o.map((a) => {
      const s = a.content;
      return s.length ? { type: "paragraph", content: s } : { type: "paragraph" };
    })
  };
}
function Ci(e) {
  return (e.getJSON().content || []).map(
    (o) => (o.content || []).map((r) => r.type === "assetMention" ? ur(String(r.attrs?.url || "")) : r.text || "").join("")
  ).join(`
`);
}
function Si({ value: e, onChange: t, placeholder: n, className: o, onBlur: r, onReady: a, mentionCandidates: s, editable: c }) {
  const f = b.useRef(t);
  b.useEffect(() => {
    f.current = t;
  }, [t]);
  const m = b.useRef(s || []);
  b.useEffect(() => {
    m.current = s || [];
  }, [s]);
  const h = b.useMemo(() => wi({ getCandidates: () => m.current }), []), p = b.useRef(e), u = ir({
    extensions: [
      ar.configure({ heading: !1, bulletList: !1, orderedList: !1, blockquote: !1, codeBlock: !1, horizontalRule: !1 }),
      sr.configure({ placeholder: n ?? "" }),
      hi,
      h
    ],
    content: St(e, s),
    editable: c !== !1,
    editorProps: { attributes: { class: "generation-canvas-v2-node__prompt-input outline-0" } },
    onUpdate: ({ editor: v }) => {
      const M = Ci(v);
      p.current = M, f.current(M);
    }
  });
  return b.useEffect(() => {
    u && a && a(u);
  }, [u, a]), b.useEffect(() => {
    if (!u || u.isDestroyed) return;
    const v = c !== !1;
    u.isEditable !== v && u.setEditable(v, !1);
  }, [u, c]), b.useEffect(() => {
    !u || u.isDestroyed || e !== p.current && (p.current = e, u.commands.setContent(St(e, m.current)));
  }, [u, e]), b.useEffect(() => {
    if (!u || u.isDestroyed) return;
    const v = s || [];
    let M = u.state.tr, d = !1;
    u.state.doc.descendants((x, K) => {
      if (x.type.name !== "assetMention") return;
      const S = String(x.attrs.url || ""), w = v.indexOf(S), D = w >= 0 ? w + 1 : null;
      x.attrs.index !== D && (M = M.setNodeMarkup(K, void 0, { ...x.attrs, index: D }), d = !0);
    }), d && u.view.dispatch(M);
  }, [u, s]), /* @__PURE__ */ i.jsx(
    lr,
    {
      editor: u,
      onBlur: r,
      className: g("text-nomi-ink text-body-sm leading-[1.7] [&_.ProseMirror]:outline-0 [&_.ProseMirror]:min-h-[38px] [&_.ProseMirror_p]:m-0 [&_.is-editor-empty]:before:text-nomi-ink-40 [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:h-0", o)
    }
  );
}
function Mi(e) {
  const t = e?.result?.url || e?.result?.thumbnailUrl;
  return typeof t == "string" && t.length > 0;
}
function en(e, t) {
  const n = new Map(t.nodes.map((c) => [c.id, c])), o = /* @__PURE__ */ new Set(), r = [e], a = t.edges.length + t.nodes.length + 1;
  let s = 0;
  for (; r.length > 0 && s < a; ) {
    s += 1;
    const c = r.pop(), f = n.get(c);
    for (const m of t.edges) {
      if (m.target !== c) continue;
      const h = m.source;
      if (o.has(h)) continue;
      const p = n.get(h);
      p && f && ko(p, f, m.mode) || Mi(p) || (o.add(h), r.push(h));
    }
  }
  return o.delete(e), [...o];
}
const Ri = /* @__PURE__ */ new Set(["portrait", "vertical", "竖屏", "竖向", "vertical-screen", "portrait-mode"]), Ai = /* @__PURE__ */ new Set(["landscape", "horizontal", "横屏", "横向", "horizontal-screen", "landscape-mode"]);
function Je(e) {
  if (e == null) return "landscape";
  const t = String(e).trim().toLowerCase();
  if (!t) return "landscape";
  if (Ri.has(t)) return "portrait";
  if (Ai.has(t)) return "landscape";
  const n = t.match(/^(\d+)\s*:\s*(\d+)$/);
  if (n) {
    const o = Number(n[1]), r = Number(n[2]);
    if (Number.isFinite(o) && Number.isFinite(r))
      return r > o ? "portrait" : "landscape";
  }
  return "landscape";
}
function Mt(e) {
  return typeof e != "string" ? "" : e.trim().replace(/\s+/g, "").toLowerCase();
}
function oe(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function $(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Be(e) {
  const t = typeof e == "number" ? e : typeof e == "string" ? Number(e) : NaN;
  return !Number.isFinite(t) || t <= 0 ? null : t;
}
function yt(e) {
  return typeof e == "boolean" ? e : void 0;
}
function Rt(e) {
  if (typeof e == "string" || typeof e == "number" && Number.isFinite(e) || typeof e == "boolean") return e;
}
function we(e) {
  return $(e).replace(/\s+/g, "");
}
function ji(e) {
  const t = $(e).toLowerCase();
  return t === "number" || t === "integer" || t === "float" ? "number" : t === "boolean" || t === "bool" || t === "switch" || t === "checkbox" ? "boolean" : t === "text" || t === "string" || t === "input" || t === "textarea" ? "text" : t === "image-url" || t === "imageurl" || t === "image_url" || t === "image-ref" || t === "image-reference" ? "image-url" : "select";
}
function Ni(e) {
  const t = Rt(e);
  if (typeof t < "u") return { value: t, label: String(t) };
  if (!oe(e)) return null;
  const n = Rt(e.value ?? e.key);
  if (typeof n > "u") return null;
  const o = $(e.label) || String(n), r = $(e.priceLabel ?? e.price);
  return {
    value: n,
    label: o,
    ...r ? { priceLabel: r } : {}
  };
}
function Ei(e) {
  if (!oe(e)) return null;
  const t = $(e.key ?? e.name ?? e.binding ?? e.field);
  if (!t) return null;
  const n = $(e.label) || t, o = ji(e.type), r = Array.isArray(e.options) ? e.options.map(Ni).filter((h) => h !== null) : [], a = Rt(e.defaultValue ?? e.default), s = Be(e.min) ?? void 0, c = Be(e.max) ?? void 0, f = Be(e.step) ?? void 0, m = $(e.placeholder);
  return {
    key: t,
    label: n,
    type: o !== "image-url" && r.length > 0 ? "select" : o,
    options: ke(r),
    ...typeof a < "u" ? { defaultValue: a } : {},
    ...typeof s == "number" ? { min: s } : {},
    ...typeof c == "number" ? { max: c } : {},
    ...typeof f == "number" ? { step: f } : {},
    ...m ? { placeholder: m } : {}
  };
}
function It(e) {
  if (!oe(e)) return [];
  const t = Array.isArray(e.parameterControls) ? e.parameterControls : Array.isArray(e.parameters) ? e.parameters : [];
  return ke(
    t.map(Ei).filter((n) => n !== null).map((n) => ({ ...n, value: n.key }))
  ).map(({ value: n, ...o }) => o);
}
function _i(e) {
  if (typeof e == "string") {
    const o = we(e);
    return o ? { value: o, label: o } : null;
  }
  if (!oe(e)) return null;
  const t = we(e.value ?? e.aspectRatio ?? e.aspect_ratio);
  if (!t) return null;
  const n = $(e.label) || t;
  return {
    value: t,
    label: n
  };
}
function Pi(e) {
  if (typeof e == "string") {
    const r = we(e);
    return r ? { value: r, label: r } : null;
  }
  if (!oe(e)) return null;
  const t = we(e.value ?? e.size ?? e.imageSize ?? e.image_size);
  if (!t) return null;
  const n = $(e.label) || t, o = $(e.priceLabel ?? e.price);
  return {
    value: t,
    label: n,
    ...o ? { priceLabel: o } : {}
  };
}
function Ii(e) {
  if (typeof e == "string") {
    const r = we(e);
    return r ? { value: r, label: r } : null;
  }
  if (!oe(e)) return null;
  const t = we(
    e.value ?? e.resolution ?? e.imageResolution ?? e.image_resolution
  );
  if (!t) return null;
  const n = $(e.label) || t, o = $(e.priceLabel ?? e.price);
  return {
    value: t,
    label: n,
    ...o ? { priceLabel: o } : {}
  };
}
function tn(e) {
  const t = $(e).toLowerCase();
  return t ? t === "aspectratio" || t === "aspect" || t === "ratio" ? "aspectRatio" : t === "imagesize" || t === "size" || t === "outputsize" || t === "dimensions" ? "imageSize" : t === "resolution" || t === "imageresolution" || t === "outputresolution" ? "resolution" : null : null;
}
function nn(e) {
  return e === "aspectRatio" ? ee.t("runtime.modelCatalog.control.aspectRatio") : e === "resolution" ? ee.t("runtime.modelCatalog.control.resolution") : ee.t("runtime.modelCatalog.control.size");
}
function Hn(e) {
  return e === "aspectRatio" ? "aspectRatioOptions" : e === "resolution" ? "resolutionOptions" : "imageSizeOptions";
}
function zi(e, t) {
  const n = $(e).toLowerCase();
  return n === "aspectratiooptions" || n === "aspectratio" || n === "ratio" ? "aspectRatioOptions" : n === "imagesizeoptions" || n === "imagesize" || n === "size" || n === "outputsize" ? "imageSizeOptions" : n === "resolutionoptions" || n === "resolution" || n === "outputresolution" ? "resolutionOptions" : Hn(t);
}
function on(e, t) {
  if (typeof t == "string") {
    const r = tn(t);
    return r ? {
      key: e || r,
      label: nn(r),
      binding: r,
      optionSource: Hn(r)
    } : null;
  }
  if (!oe(t)) return null;
  const n = tn(t.binding ?? t.field ?? t.modelField ?? e);
  if (!n) return null;
  const o = $(t.label) || nn(n);
  return {
    key: $(t.key) || e || n,
    label: o,
    binding: n,
    optionSource: zi(t.optionSource ?? t.options ?? t.source, n)
  };
}
function Oi(e) {
  const n = (Array.isArray(e.controls) ? e.controls : []).map((r, a) => on(`control_${a + 1}`, r)).filter((r) => r !== null);
  if (n.length)
    return ke(n.map((r) => ({ ...r, value: r.key }))).map(
      ({ value: r, ...a }) => a
    );
  const o = oe(e.controlMappings) ? e.controlMappings : oe(e.controlMap) ? e.controlMap : null;
  return o ? Object.entries(o).map(([r, a]) => on(r, a)).filter((r) => r !== null) : [];
}
function Li(e) {
  if (typeof e == "number" || typeof e == "string") {
    const r = Be(e);
    return r == null ? null : { value: Math.trunc(r), label: `${Math.trunc(r)}s` };
  }
  if (!oe(e)) return null;
  const t = Be(e.value ?? e.duration ?? e.seconds);
  if (t == null) return null;
  const n = $(e.label) || `${Math.trunc(t)}s`, o = $(e.priceLabel ?? e.price);
  return {
    value: Math.trunc(t),
    label: n,
    ...o ? { priceLabel: o } : {}
  };
}
function Di(e) {
  if (typeof e == "string") {
    const c = we(e);
    return c ? { value: c, label: c } : null;
  }
  if (!oe(e)) return null;
  const t = we(e.value ?? e.size);
  if (!t) return null;
  const n = $(e.label) || t, o = $(e.aspectRatio ?? e.aspect_ratio), r = $(e.priceLabel ?? e.price), a = e.orientation ?? e.direction, s = typeof a > "u" ? void 0 : Je(a);
  return {
    value: t,
    label: n,
    ...s ? { orientation: s } : {},
    ...o ? { aspectRatio: o } : {},
    ...r ? { priceLabel: r } : {}
  };
}
function Ti(e) {
  if (typeof e == "string") {
    const s = Je(e);
    return {
      value: s,
      label: s === "portrait" ? ee.t("runtime.modelCatalog.control.portrait") : ee.t("runtime.modelCatalog.control.landscape")
    };
  }
  if (!oe(e)) return null;
  const t = e.value ?? e.orientation;
  if (typeof t > "u") return null;
  const n = Je(t), o = $(e.label) || (n === "portrait" ? ee.t("runtime.modelCatalog.control.portrait") : ee.t("runtime.modelCatalog.control.landscape")), r = $(e.size).replace(/\s+/g, ""), a = $(e.aspectRatio ?? e.aspect_ratio);
  return {
    value: n,
    label: o,
    ...r ? { size: r } : {},
    ...a ? { aspectRatio: a } : {}
  };
}
function Fi(e) {
  if (typeof e == "string") {
    const r = Mt(e);
    return r ? { value: r, label: r } : null;
  }
  if (!oe(e)) return null;
  const t = Mt(e.value ?? e.resolution);
  if (!t) return null;
  const n = $(e.label) || t, o = $(e.priceLabel ?? e.price);
  return {
    value: t,
    label: n,
    ...o ? { priceLabel: o } : {}
  };
}
function rn(e) {
  const t = $(e).toLowerCase();
  return t ? t === "duration" || t === "durationseconds" || t === "videoDurationSeconds".toLowerCase() ? "durationSeconds" : t === "size" || t === "videosize" || t === "ratio" || t === "aspectratio" ? "size" : t === "resolution" || t === "videoresolution" || t === "outputresolution" ? "resolution" : t === "orientation" || t === "direction" ? "orientation" : null : null;
}
function an(e) {
  return e === "durationSeconds" ? ee.t("runtime.modelCatalog.control.duration") : e === "resolution" ? ee.t("runtime.modelCatalog.control.resolution") : e === "orientation" ? ee.t("runtime.modelCatalog.control.orientation") : ee.t("runtime.modelCatalog.control.frame");
}
function Wn(e) {
  return e === "durationSeconds" ? "durationOptions" : e === "resolution" ? "resolutionOptions" : e === "orientation" ? "orientationOptions" : "sizeOptions";
}
function Ki(e, t) {
  const n = $(e).toLowerCase();
  return n === "durationoptions" || n === "duration" ? "durationOptions" : n === "resolutionoptions" || n === "resolution" || n === "outputresolution" ? "resolutionOptions" : n === "orientationoptions" || n === "orientation" ? "orientationOptions" : n === "sizeoptions" || n === "size" || n === "ratio" || n === "aspectratio" ? "sizeOptions" : Wn(t);
}
function sn(e, t) {
  if (typeof t == "string") {
    const r = rn(t);
    return r ? {
      key: e || r,
      label: an(r),
      binding: r,
      optionSource: Wn(r)
    } : null;
  }
  if (!oe(t)) return null;
  const n = rn(t.binding ?? t.field ?? t.modelField ?? e);
  if (!n) return null;
  const o = $(t.label) || an(n);
  return {
    key: $(t.key) || e || n,
    label: o,
    binding: n,
    optionSource: Ki(t.optionSource ?? t.options ?? t.source, n)
  };
}
function Vi(e) {
  const n = (Array.isArray(e.controls) ? e.controls : []).map((r, a) => sn(`control_${a + 1}`, r)).filter((r) => r !== null);
  if (n.length)
    return ke(n.map((r) => ({ ...r, value: r.key }))).map(
      ({ value: r, ...a }) => a
    );
  const o = oe(e.controlMappings) ? e.controlMappings : oe(e.controlMap) ? e.controlMap : null;
  return o ? Object.entries(o).map(([r, a]) => sn(r, a)).filter((r) => r !== null) : [];
}
function ke(e) {
  const t = /* @__PURE__ */ new Set();
  return e.filter((n) => {
    const o = String(n.value);
    return t.has(o) ? !1 : (t.add(o), !0);
  });
}
function Ui(e) {
  if (!oe(e)) return null;
  const t = oe(e.imageOptions) ? e.imageOptions : oe(e.imageConfig) ? e.imageConfig : oe(e.image) ? e.image : e, n = Array.isArray(t.aspectRatioOptions) ? t.aspectRatioOptions : [], o = Array.isArray(t.imageSizeOptions) ? t.imageSizeOptions : Array.isArray(t.sizeOptions) ? t.sizeOptions : [], r = Array.isArray(t.resolutionOptions) ? t.resolutionOptions : Array.isArray(t.outputResolutionOptions) ? t.outputResolutionOptions : [], a = ke(
    n.map(_i).filter((M) => M !== null)
  ), s = ke(
    o.map(Pi).filter((M) => M !== null)
  ), c = ke(
    r.map(Ii).filter((M) => M !== null)
  ), f = we(t.defaultAspectRatio ?? t.defaultAspect ?? t.aspectRatio), m = we(
    t.defaultImageSize ?? t.defaultSize ?? t.imageSize ?? t.image_size
  ), h = Oi(t), p = yt(t.supportsReferenceImages), u = yt(t.supportsTextToImage), v = yt(t.supportsImageToImage);
  return !a.length && !s.length && !c.length && !h.length && !f && !m && typeof p > "u" && typeof u > "u" && typeof v > "u" ? null : {
    ...f ? { defaultAspectRatio: f } : {},
    ...m ? { defaultImageSize: m } : {},
    aspectRatioOptions: a,
    imageSizeOptions: s,
    resolutionOptions: c,
    controls: h,
    ...typeof p == "boolean" ? { supportsReferenceImages: p } : {},
    ...typeof u == "boolean" ? { supportsTextToImage: u } : {},
    ...typeof v == "boolean" ? { supportsImageToImage: v } : {}
  };
}
function $i(e) {
  if (!oe(e)) return null;
  const t = oe(e.videoOptions) ? e.videoOptions : oe(e.videoConfig) ? e.videoConfig : oe(e.video) ? e.video : e, n = Array.isArray(t.durationOptions) ? t.durationOptions : [], o = Array.isArray(t.sizeOptions) ? t.sizeOptions : [], r = Array.isArray(t.resolutionOptions) ? t.resolutionOptions : Array.isArray(t.outputResolutionOptions) ? t.outputResolutionOptions : [], a = Array.isArray(t.orientationOptions) ? t.orientationOptions : [], s = ke(
    n.map(Li).filter((x) => x !== null)
  ), c = ke(
    o.map(Di).filter((x) => x !== null)
  ), f = ke(
    r.map(Fi).filter((x) => x !== null)
  ), m = ke(
    a.map(Ti).filter((x) => x !== null)
  ), h = Be(t.defaultDurationSeconds ?? t.defaultDuration), p = we(t.defaultSize), u = Mt(
    t.defaultResolution ?? t.defaultOutputResolution ?? t.outputResolution
  ), v = t.defaultOrientation, M = typeof v > "u" ? void 0 : Je(v), d = Vi(t);
  return !s.length && !c.length && !f.length && !m.length && !d.length && h == null && !p && !u && !M ? null : {
    ...h != null ? { defaultDurationSeconds: Math.trunc(h) } : {},
    ...p ? { defaultSize: p } : {},
    ...u ? { defaultResolution: u } : {},
    ...M ? { defaultOrientation: M } : {},
    durationOptions: s,
    sizeOptions: c,
    resolutionOptions: f,
    orientationOptions: m,
    controls: d
  };
}
function Gn(e, t) {
  const n = e.trim(), o = typeof t == "string" ? t.trim() : "";
  return o ? `${n} ${o}` : n;
}
function ln(e, t) {
  return Mr(e, t);
}
function Bi(e) {
  return kr(qn(e));
}
function Hi(e, t) {
  return Sr({
    kind: qn(e),
    options: t.options,
    health: t.health,
    error: t.error,
    healthError: t.healthError,
    loading: t.loading
  });
}
function qn(e) {
  return wo(e);
}
const Wi = ["firstframe", "firstimage", "startframe", "startimage", "initialframe"], Gi = ["lastframe", "lastimage", "endframe", "endimage", "finalframe"];
function qi(e) {
  const t = e.toLowerCase().replace(/[-_]/g, "");
  return Wi.some((n) => t.includes(n)) ? "first_frame" : Gi.some((n) => t.includes(n)) ? "last_frame" : "reference";
}
const Xi = [
  "imageurl",
  "imgurl",
  "imageurls",
  "inputurl",
  "inputurls",
  "inputimage",
  "inputimg",
  "imageinput",
  "referenceimage",
  "refimage",
  "initimage",
  "sourceimage",
  "sourceimg",
  "startimage",
  "endimage",
  "firstframe",
  "lastframe",
  "frameurl",
  "photourl"
];
function Xn(e) {
  if (e.type === "image-url") return !0;
  if (e.type !== "text") return !1;
  const t = e.key.toLowerCase().replace(/[-_]/g, "");
  return Xi.some((n) => t.includes(n));
}
function At(e) {
  return e === "first_frame" ? "first_frame" : e === "last_frame" ? "last_frame" : "reference";
}
function Yi(e, t, n) {
  const o = At(e);
  return t.find((r) => r.target === n && r.mode === o)?.source || "";
}
function Zi(e) {
  return It(e).filter(Xn).map((n) => ({ key: n.key, label: n.label, group: qi(n.key) }));
}
function Ji(e) {
  if (!e || typeof e != "object") return null;
  const t = e.comfyWorkflowImport;
  if (!t || typeof t != "object") return null;
  const n = t.binding;
  return n && typeof n == "object" ? n : null;
}
function Qi(e, t) {
  const n = Ji(e);
  if (!n) return null;
  const o = [];
  return typeof n.firstFrameNodeId == "string" && typeof n.firstFrameInputKey == "string" && o.push({ key: "firstFrameUrl", label: t.firstFrame, group: "first_frame" }), typeof n.lastFrameNodeId == "string" && typeof n.lastFrameInputKey == "string" && o.push({ key: "lastFrameUrl", label: t.lastFrame, group: "last_frame" }), o;
}
function ea(e) {
  return !e.isVideoLike || e.modelImageUrlSlots.length > 0 || String(e.vendor || "").trim() === "comfyui-local" ? !1 : !e.comfyImageUrlSlots;
}
function ta(e) {
  return e?.supportsReferenceImages ? [{ key: "referenceImageUrl", label: "参考图", group: "reference" }] : [];
}
function Yn(e, t) {
  const n = ue(e, t + "_nodeRef");
  return n || (t === "firstFrameUrl" ? ue(e, "firstFrameRef") : t === "lastFrameUrl" ? ue(e, "lastFrameRef") : t === "referenceImageUrl" || t === "imageUrl" ? ue(e, "referenceImageRef") : "");
}
function na(e, t, n) {
  const o = ue(e, t);
  if (o) return o;
  const r = Yn(e, t);
  return r ? Jn(n.find((a) => a.id === r)) : "";
}
const Zn = ["aspect_ratio", "aspectRatio", "aspect", "size", "imageSize", "videoSize", "ratio", "video_size", "image_size"], oa = ["durationSeconds", "videoDuration", "duration", "video_duration", "length", "clip_length"], ra = ["resolution", "videoResolution", "video_resolution", "output_resolution", "outputResolution"], ia = ["output_format", "outputFormat", "format", "image_format"];
function aa(e) {
  const t = {};
  for (const n of e)
    for (const o of n)
      t[o] = n.filter((r) => r !== o);
  return t;
}
const sa = aa([
  Zn,
  oa,
  ra,
  ia
]);
function ue(e, t) {
  const n = e?.[t];
  return typeof n == "string" || typeof n == "number" ? String(n) : "";
}
function jt(e, t) {
  if (!e || typeof e != "object") return [];
  const n = e[t];
  return Array.isArray(n) ? n.filter((o) => typeof o == "string" && o.trim().length > 0) : [];
}
function la(e) {
  if (!e || typeof e != "object") return [];
  const t = e.durs;
  return Array.isArray(t) ? t.flatMap((n) => {
    if (!n || typeof n != "object") return [];
    const o = n, r = typeof o.key == "number" || typeof o.key == "string" ? String(o.key) : "", a = typeof o.label == "string" ? o.label : r ? `${r}s` : "";
    return r && a ? [{ value: r, label: a }] : [];
  }) : [];
}
function ct(e, t) {
  if (!e || typeof e != "object") return "";
  const n = e.defaultParams;
  if (!n || typeof n != "object") return "";
  const o = n[t];
  return typeof o == "string" || typeof o == "number" ? String(o) : "";
}
function Jn(e) {
  return Ft(e?.result) || Ft(e?.history?.[0]);
}
function ut(e) {
  const t = e.data && typeof e.data == "object" && !Array.isArray(e.data) ? e.data : {}, n = typeof t.url == "string" ? t.url.trim() : "";
  if (n) return n;
  const o = typeof t.imageUrl == "string" ? t.imageUrl.trim() : "";
  return o || (typeof t.thumbnailUrl == "string" ? t.thumbnailUrl.trim() : "");
}
function He(e) {
  return typeof e == "string" ? e : String(e.value);
}
function ca(e) {
  return typeof e == "string" ? e || "自动" : Gn(e.label, e.priceLabel);
}
function Re(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : "";
}
function ua(e, t) {
  if (e.type === "boolean") return t === "true";
  if (e.type === "number") {
    if (!t.trim()) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  if (e.type === "select") {
    const n = e.options.find((o) => Re(o.value) === t);
    if (n && typeof n.value < "u") return n.value;
  }
  return t;
}
function $e(e, t) {
  const n = t[e.key];
  if (typeof n < "u") return Re(n);
  if (typeof e.defaultValue < "u") return Re(e.defaultValue);
  const o = e.options[0];
  return o ? Re(o.value) : "";
}
function Qn(e, t) {
  const n = t[e.key];
  if (typeof n < "u") return Re(n);
  if (typeof e.defaultValue < "u") return Re(e.defaultValue);
  const o = e.options[0];
  return o ? He(o) : "";
}
function We(e) {
  return e.binding === "parameter";
}
function pt(e) {
  return [e, ...sa[e] || []];
}
function da(e) {
  return We(e) ? pt(e.key) : e.binding === "aspectRatio" ? ["aspect_ratio", "aspectRatio", "aspect", "size", "imageSize"] : e.binding === "imageSize" ? ["imageSize", "size"] : e.binding === "durationSeconds" ? ["durationSeconds", "videoDuration"] : e.binding === "size" ? ["aspect_ratio", "aspectRatio", "videoSize", "size", "aspect"] : e.binding === "resolution" ? ["resolution", "videoResolution"] : [e.key];
}
function eo(e, t) {
  return t.some((n) => e.has(n));
}
function _e(e, t) {
  if (typeof t < "u" && String(t).trim()) return t;
  const n = e[0];
  return typeof n > "u" ? void 0 : He(n);
}
function to(e) {
  return e.length > 0;
}
function ma(e, t) {
  return e ? t === "aspectRatioOptions" ? e.aspectRatioOptions : t === "resolutionOptions" ? e.resolutionOptions : e.imageSizeOptions : [];
}
function pa(e, t) {
  return e ? t === "durationOptions" ? e.durationOptions : t === "resolutionOptions" ? e.resolutionOptions : t === "orientationOptions" ? e.orientationOptions : e.sizeOptions : [];
}
function fa(e, t) {
  if (t === "aspectRatio") return e.defaultAspectRatio;
  if (t === "imageSize") return e.defaultImageSize;
}
function ga(e, t) {
  return t === "durationSeconds" ? e.defaultDurationSeconds : t === "size" ? e.defaultSize : t === "resolution" ? e.defaultResolution : e.defaultOrientation;
}
function ha(e) {
  return e ? [
    {
      key: "aspect_ratio",
      label: "比例",
      binding: "aspectRatio",
      options: e.aspectRatioOptions,
      defaultValue: _e(e.aspectRatioOptions, e.defaultAspectRatio)
    },
    {
      key: "resolution",
      label: "清晰度",
      binding: "resolution",
      options: e.resolutionOptions,
      defaultValue: _e(e.resolutionOptions, void 0)
    }
  ].filter((n) => to(n.options)) : [];
}
function ba(e) {
  return e ? [
    {
      key: "durationSeconds",
      label: "时长",
      binding: "durationSeconds",
      options: e.durationOptions,
      defaultValue: _e(e.durationOptions, e.defaultDurationSeconds)
    },
    {
      key: "aspect_ratio",
      label: "画幅",
      binding: "size",
      options: e.sizeOptions,
      defaultValue: _e(e.sizeOptions, e.defaultSize)
    },
    {
      key: "resolution",
      label: "分辨率",
      binding: "resolution",
      options: e.resolutionOptions,
      defaultValue: _e(e.resolutionOptions, e.defaultResolution)
    }
  ].filter((n) => to(n.options)) : [];
}
function xa(e) {
  return e ? e.controls.flatMap((t) => {
    const n = ma(e, t.optionSource);
    return n.length ? [{
      key: t.key,
      label: t.label,
      binding: t.binding,
      options: n,
      defaultValue: _e(n, fa(e, t.binding))
    }] : [];
  }) : [];
}
function ya(e) {
  return e ? e.controls.flatMap((t) => {
    const n = pa(e, t.optionSource);
    return n.length ? [{
      key: t.key,
      label: t.label,
      binding: t.binding,
      options: n,
      defaultValue: _e(n, ga(e, t.binding))
    }] : [];
  }) : [];
}
function va(e) {
  if (e.type !== "text" && e.type !== "number" || e.options.length > 0) return !1;
  const t = typeof e.defaultValue < "u" && String(e.defaultValue).trim() !== "", n = typeof e.placeholder == "string" && e.placeholder.trim() !== "";
  return !t && !n;
}
function ka(e) {
  const t = /* @__PURE__ */ new Set();
  return e.filter((n) => {
    const o = pt(n.key);
    return eo(t, o) ? !1 : (o.forEach((r) => t.add(r)), !0);
  });
}
function Nt(e) {
  const n = ka(
    // image-url-like params render as reference boxes at the top (buildImageUrlSlots),
    // so they must NOT also appear in the bottom value row.
    e.parameterControls.filter((a) => !Xn(a) && !va(a))
  ).map((a) => ({
    ...a,
    binding: "parameter"
  })), o = new Set(n.flatMap((a) => pt(a.key)));
  return (e.isImageLike ? [
    ...xa(e.imageCatalogConfig),
    ...ha(e.imageCatalogConfig)
  ] : e.isVideoLike ? [
    ...ya(e.videoCatalogConfig),
    ...ba(e.videoCatalogConfig)
  ] : []).forEach((a) => {
    const s = pt(a.key);
    eo(o, s) || (n.push(a), s.forEach((c) => o.add(c)));
  }), n;
}
function wa(e) {
  return typeof e.defaultValue > "u" ? {} : { [e.key]: e.defaultValue };
}
function zt(e) {
  const t = _e(e.options, e.defaultValue);
  if (typeof t > "u") return {};
  if (e.binding === "aspectRatio")
    return {
      [e.key]: t,
      aspect_ratio: t,
      aspectRatio: t,
      aspect: t,
      size: t,
      imageSize: t
    };
  if (e.binding === "imageSize")
    return {
      [e.key]: t,
      imageSize: t,
      size: t
    };
  if (e.binding === "durationSeconds") {
    const n = Number(t);
    return Number.isFinite(n) ? { [e.key]: n, durationSeconds: n, videoDuration: n } : {};
  }
  if (e.binding === "size") {
    const n = String(t).trim().replace(/\s+/g, "");
    return {
      [e.key]: n,
      aspect_ratio: n,
      aspectRatio: n,
      videoSize: n,
      size: n,
      aspect: n
    };
  }
  return e.binding === "resolution" ? {
    [e.key]: t,
    resolution: t,
    videoResolution: t
  } : e.binding === "orientation" ? { [e.key]: Je(t) } : { [e.key]: t };
}
function no(e) {
  return e.reduce((t, n) => ({
    ...t,
    ...We(n) ? wa(n) : zt(n)
  }), {});
}
function cn(e, t) {
  for (const n of e) {
    if (We(n)) {
      if (!Zn.includes(n.key)) continue;
      const r = n.options.find(
        (a) => Ue(Re(a.value)) === t || Ue(a.label) === t
      );
      return r ? { [n.key]: r.value, aspect_ratio: t } : {};
    }
    if (n.binding !== "size" && n.binding !== "aspectRatio") continue;
    const o = n.options.find((r) => {
      const a = Ue(He(r)), s = typeof r == "string" ? a : Ue(r.label);
      return a === t || s === t;
    });
    return o ? zt({ ...n, defaultValue: He(o) }) : {};
  }
  return {};
}
function Ca(e, t) {
  const n = new Set(t.flatMap(da));
  return Object.fromEntries(
    Object.entries(e).filter(([o]) => !n.has(o))
  );
}
function Ot(e) {
  const t = Ui(e);
  if (t) return t;
  const n = jt(e, "sizes");
  if (!n.length) return null;
  const o = ct(e, "size");
  return {
    ...o ? { defaultImageSize: o } : {},
    aspectRatioOptions: [],
    imageSizeOptions: n.map((r) => ({ value: r, label: r })),
    resolutionOptions: [],
    controls: [{ key: "size", label: "比例", binding: "aspectRatio", optionSource: "imageSizeOptions" }]
  };
}
function oo(e) {
  const t = $i(e);
  if (t) return t;
  const n = jt(e, "ratios"), o = la(e).flatMap((f) => {
    const m = typeof f == "string" ? f : String(f.value), h = Number(m);
    return !Number.isFinite(h) || h <= 0 ? [] : [{ value: Math.trunc(h), label: typeof f == "string" ? `${Math.trunc(h)}s` : f.label }];
  }), r = jt(e, "resolutions");
  if (!n.length && !o.length && !r.length) return null;
  const a = Number(ct(e, "duration")), s = ct(e, "ratio"), c = ct(e, "resolution");
  return {
    ...Number.isFinite(a) && a > 0 ? { defaultDurationSeconds: Math.trunc(a) } : {},
    ...s ? { defaultSize: s } : {},
    ...c ? { defaultResolution: c } : {},
    durationOptions: o,
    sizeOptions: n.map((f) => ({ value: f, label: f })),
    resolutionOptions: r.map((f) => ({ value: f, label: f })),
    orientationOptions: [],
    controls: [
      { key: "durationSeconds", label: "时长", binding: "durationSeconds", optionSource: "durationOptions" },
      { key: "aspect_ratio", label: "画幅", binding: "size", optionSource: "sizeOptions" },
      { key: "resolution", label: "分辨率", binding: "resolution", optionSource: "resolutionOptions" }
    ]
  };
}
function ro(e, t, n) {
  return Nt({
    parameterControls: It(e),
    imageCatalogConfig: Ot(e),
    videoCatalogConfig: oo(e),
    isImageLike: t,
    isVideoLike: n
  });
}
function Sa({ choices: e, activeId: t, onSelect: n }) {
  const { t: o } = ye();
  if (e.length <= 1) return null;
  const r = e.find((a) => a.id === t) ?? e[0];
  return /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-1"), children: [
    /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-40 text-micro leading-none"), children: o("generationCommon.parameters.generationMode") }),
    /* @__PURE__ */ i.jsx(
      "div",
      {
        className: g("inline-flex flex-wrap gap-0.5 p-0.5 rounded-nomi-sm bg-nomi-ink-05 self-start"),
        role: "group",
        "aria-label": o("generationCommon.parameters.generationMode"),
        children: e.map((a) => {
          const s = a.id === r.id;
          return /* @__PURE__ */ i.jsx(
            "button",
            {
              type: "button",
              "aria-pressed": s,
              "data-active": s ? "true" : "false",
              className: g(
                "rounded-nomi-sm px-3 py-1.5 text-body-sm leading-none",
                "text-nomi-ink-60 cursor-pointer transition-colors",
                "data-[active=true]:bg-nomi-paper data-[active=true]:text-nomi-ink",
                "data-[active=true]:font-semibold data-[active=true]:shadow-nomi-sm"
              ),
              onClick: (c) => {
                c.stopPropagation(), n(a.id);
              },
              children: a.vendorTerm
            },
            a.id
          );
        })
      }
    ),
    /* @__PURE__ */ i.jsx("div", { className: g("text-nomi-ink-40 text-micro leading-[1.35]"), children: r.hint })
  ] });
}
const Ma = { image: "image/*", video: "video/*", audio: "audio/*" };
function un({ asset: e, onPick: t, dimmed: n }) {
  const { t: o } = ye();
  return /* @__PURE__ */ i.jsx(
    "button",
    {
      type: "button",
      "aria-label": e.name,
      onClick: () => t(e),
      title: n ? o("assetLibrary.picker.typeLimitReached") : void 0,
      className: g(
        "relative w-12 h-12 rounded-nomi-sm overflow-hidden border border-nomi-line bg-nomi-ink-05 flex items-center justify-center cursor-pointer hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-nomi-accent",
        n && "opacity-40"
      ),
      children: /* @__PURE__ */ i.jsx(jr, { asset: e, playSize: 18 })
    }
  );
}
function dn({ projectId: e, accept: t, onPick: n, onUpload: o, onBrowseAll: r, atLimitKinds: a, uploading: s, className: c }) {
  const { t: f } = ye(), m = (S) => !!a?.includes(S), { assets: h, loading: p } = Rr(e), [u, v] = b.useState(""), M = b.useMemo(() => Ar(h, { query: u, accept: t }), [h, u, t]), d = M.filter((S) => S.source === "canvas"), x = M.filter((S) => S.source === "project"), K = (t && t.length ? t : ["image", "video", "audio"]).map((S) => Ma[S]).join(",");
  return /* @__PURE__ */ i.jsxs(
    "div",
    {
      "data-testid": "asset-picker",
      className: g("flex flex-col gap-[10px] w-[300px] max-w-[300px] max-h-[70vh] overflow-y-auto p-[10px] rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-md", c),
      onDragOver: (S) => {
        S.preventDefault(), S.stopPropagation();
      },
      onDrop: (S) => {
        S.preventDefault(), S.stopPropagation();
        const w = S.dataTransfer.files?.[0];
        w && o(w);
      },
      children: [
        /* @__PURE__ */ i.jsxs("label", { className: g("flex items-center gap-[6px] h-[30px] px-[8px] rounded-nomi-sm border border-nomi-line bg-nomi-ink-05"), children: [
          /* @__PURE__ */ i.jsx(Co, { size: 13, stroke: 2, className: g("text-nomi-ink-40 shrink-0") }),
          /* @__PURE__ */ i.jsx(
            "input",
            {
              type: "text",
              value: u,
              onChange: (S) => v(S.target.value),
              placeholder: f("assetLibrary.picker.searchPlaceholder"),
              "aria-label": f("assetLibrary.picker.searchAria"),
              className: g("flex-1 min-w-0 bg-transparent border-0 outline-none text-xs text-nomi-ink placeholder:text-nomi-ink-40")
            }
          )
        ] }),
        d.length ? /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-[6px]"), children: [
          /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-40 text-micro"), children: f("assetLibrary.picker.canvas") }),
          /* @__PURE__ */ i.jsx("div", { className: g("flex gap-[6px] overflow-x-auto pb-[2px]"), children: d.map((S) => /* @__PURE__ */ i.jsx("div", { className: g("shrink-0"), children: /* @__PURE__ */ i.jsx(un, { asset: S, onPick: n, dimmed: m(S.kind) }) }, S.id)) })
        ] }) : null,
        x.length ? /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-[6px]"), children: [
          /* @__PURE__ */ i.jsxs("div", { className: g("flex items-baseline justify-between"), children: [
            /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-40 text-micro"), children: f("assetLibrary.picker.recentProjectAssets") }),
            r ? /* @__PURE__ */ i.jsx("button", { type: "button", onClick: r, className: g("text-nomi-accent text-micro cursor-pointer"), children: f("assetLibrary.picker.browseAll") }) : null
          ] }),
          /* @__PURE__ */ i.jsx("div", { className: g("grid grid-cols-[repeat(5,48px)] gap-[6px] max-h-[108px] overflow-auto pb-[2px]"), children: x.map((S) => /* @__PURE__ */ i.jsx(un, { asset: S, onPick: n, dimmed: m(S.kind) }, S.id)) })
        ] }) : null,
        p && !d.length && !x.length ? /* @__PURE__ */ i.jsx("div", { className: g("grid grid-cols-[repeat(5,48px)] gap-[6px] py-[6px]"), "aria-label": f("assetLibrary.picker.loading"), children: Array.from({ length: 5 }).map((S, w) => /* @__PURE__ */ i.jsx("div", { className: g("size-12 rounded-nomi-sm bg-nomi-ink-10 animate-pulse motion-reduce:animate-none") }, w)) }) : !d.length && !x.length ? /* @__PURE__ */ i.jsx("div", { className: g("text-nomi-ink-40 text-micro text-center py-[6px]"), children: f(u ? "assetLibrary.picker.noMatches" : "assetLibrary.picker.empty") }) : null,
        /* @__PURE__ */ i.jsxs("label", { className: g("relative flex items-center justify-center gap-[6px] h-[34px] rounded-nomi-sm border border-dashed border-nomi-ink-20 bg-nomi-paper text-nomi-ink-60 text-xs cursor-pointer hover:border-nomi-accent hover:text-nomi-accent"), children: [
          s ? /* @__PURE__ */ i.jsx(Cn, { size: 15, label: f("assetLibrary.picker.uploading") }) : /* @__PURE__ */ i.jsx(Er, { size: 15, stroke: 2 }),
          f(s ? "assetLibrary.picker.uploadingEllipsis" : "assetLibrary.picker.uploadLocal"),
          /* @__PURE__ */ i.jsx(
            "input",
            {
              type: "file",
              accept: K,
              "aria-label": f("assetLibrary.picker.uploadLocal"),
              disabled: s,
              className: g("absolute w-px h-px opacity-0 overflow-hidden"),
              onChange: (S) => {
                const w = S.currentTarget.files?.[0];
                w && o(w), S.currentTarget.value = "";
              }
            }
          )
        ] }),
        /* @__PURE__ */ i.jsx("div", { className: g("text-nomi-ink-40 text-micro text-center"), children: f("assetLibrary.picker.dropHint") })
      ]
    }
  );
}
const Ye = 8, mn = 4;
function pn({ onClose: e, children: t }) {
  const n = b.useRef(null), o = b.useRef(null), [r, a] = b.useState(null);
  return b.useLayoutEffect(() => {
    const s = n.current, c = o.current;
    if (!s) return;
    const f = s.getBoundingClientRect(), m = c ? c.offsetHeight : 360, h = c ? c.offsetWidth : 300;
    let p = f.bottom + mn;
    p + m > window.innerHeight - Ye && (p = Math.max(Ye, f.top - mn - m));
    let u = f.left;
    u + h > window.innerWidth - Ye && (u = window.innerWidth - Ye - h), u = Math.max(Ye, u), a({ top: p, left: u });
  }, []), b.useEffect(() => {
    const s = (f) => {
      f.key === "Escape" && e();
    }, c = (f) => {
      const m = f.target;
      o.current?.contains(m) || n.current?.contains(m) || e();
    };
    return document.addEventListener("keydown", s), document.addEventListener("mousedown", c), () => {
      document.removeEventListener("keydown", s), document.removeEventListener("mousedown", c);
    };
  }, [e]), /* @__PURE__ */ i.jsxs(i.Fragment, { children: [
    /* @__PURE__ */ i.jsx("span", { ref: n, className: "inline-block w-0 h-0 align-bottom", "aria-hidden": !0 }),
    /* @__PURE__ */ i.jsx(So, { children: /* @__PURE__ */ i.jsx(
      "div",
      {
        ref: o,
        style: { position: "fixed", top: r?.top ?? -9999, left: r?.left ?? -9999, zIndex: 60, visibility: r ? "visible" : "hidden" },
        onPointerDown: (s) => s.stopPropagation(),
        children: t
      }
    ) })
  ] });
}
const st = "__refs__";
function fn(e, t, n) {
  return { id: e, kind: t, name: n, renderUrl: e, source: "project", origin: { source: "project", projectId: "", relativePath: "" } };
}
function Ra(e) {
  return e.type.startsWith("video/") ? "video" : e.type.startsWith("audio/") ? "audio" : "image";
}
function Aa({
  slots: e,
  valuesByKey: t,
  occupiedByKey: n,
  projectId: o,
  openSlotKey: r,
  uploadingSlotKey: a,
  onTogglePicker: s,
  onPick: c,
  onUpload: f,
  onRemove: m,
  onInsertMention: h,
  onReorder: p,
  onBrowseAll: u
}) {
  const { t: v } = ye(), M = b.useRef(null), d = e.filter((A) => A.form === "single"), x = e.filter((A) => A.form === "array"), K = d.length > 1, S = (A) => {
    const j = t[A.key], I = Array.isArray(j) ? j.filter(Boolean).length : 0, T = n instanceof Map ? n.get(A.key) : n?.[A.key];
    return Math.max(T ?? 0, I);
  }, w = Array.from(new Set(x.map((A) => A.accept))), D = x.flatMap((A) => {
    const j = t[A.key];
    return (Array.isArray(j) ? j : []).filter(Boolean).map((T, F) => ({ slot: A, url: T, index: F }));
  }), q = x.some((A) => S(A) < A.max), N = x.some((A) => a === A.key), U = x.filter((A) => S(A) >= A.max).map((A) => A.accept), Y = (A) => x.find((j) => j.accept === A) ?? x[0];
  return /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-[8px]"), children: [
    d.length > 0 ? /* @__PURE__ */ i.jsx("div", { className: g("flex flex-wrap items-start gap-[8px]"), children: d.map((A) => {
      const j = t[A.key], I = typeof j == "string" ? j : "", T = r === A.key;
      return /* @__PURE__ */ i.jsxs("div", { className: g("relative flex flex-col gap-[4px]"), children: [
        K ? /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-60 text-micro leading-none"), children: A.label }) : null,
        I ? /* @__PURE__ */ i.jsx(Bt, { asset: fn(I, A.accept, A.label), onRemove: () => m(A, 0) }) : /* @__PURE__ */ i.jsx(Ht, { label: v("assetLibrary.addNamed", { label: A.label }), selected: T, onClick: () => s(A.key) }),
        T ? /* @__PURE__ */ i.jsx(pn, { onClose: () => s(A.key), children: /* @__PURE__ */ i.jsx(
          dn,
          {
            projectId: o,
            accept: [A.accept],
            uploading: a === A.key,
            onPick: (F) => c(A, F),
            onUpload: (F) => f(A, F),
            onBrowseAll: u
          }
        ) }) : null
      ] }, A.key);
    }) }) : null,
    x.length > 0 ? /* @__PURE__ */ i.jsxs("div", { className: g("relative flex flex-col gap-[4px]"), children: [
      /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-wrap items-center gap-[8px]"), children: [
        D.map(({ slot: A, url: j, index: I }) => /* @__PURE__ */ i.jsx(
          Bt,
          {
            asset: fn(j, A.accept, `${A.label}${I + 1}`),
            index: A.numbered ? I + 1 : void 0,
            onRemove: () => m(A, I),
            onClick: A.accept === "image" && h ? () => h(j) : void 0,
            dragProps: p ? {
              draggable: !0,
              onDragStart: () => {
                M.current = { key: A.key, index: I };
              },
              onDragOver: (T) => {
                T.preventDefault(), T.currentTarget.setAttribute("data-dragover", "true");
              },
              onDragLeave: (T) => {
                T.currentTarget.removeAttribute("data-dragover");
              },
              onDrop: (T) => {
                T.preventDefault(), T.currentTarget.removeAttribute("data-dragover");
                const F = M.current;
                M.current = null, F && F.key === A.key && F.index !== I && p(A, F.index, I);
              },
              onDragEnd: () => {
                M.current = null;
              }
            } : void 0
          },
          `${A.key}-${j}-${I}`
        )),
        q ? /* @__PURE__ */ i.jsx(Ht, { label: v("assetLibrary.addReference"), selected: r === st, onClick: () => s(st) }) : null
      ] }),
      r === st ? /* @__PURE__ */ i.jsx(pn, { onClose: () => s(st), children: /* @__PURE__ */ i.jsx(
        dn,
        {
          projectId: o,
          accept: w,
          uploading: N,
          onPick: (A) => c(Y(A.kind), A),
          onUpload: (A) => f(Y(Ra(A)), A),
          onBrowseAll: u,
          atLimitKinds: U
        }
      ) }) : null
    ] }) : null
  ] });
}
function ja(...e) {
  for (const t of e) {
    const n = /^(\d{1,3}):(\d{1,3})$/.exec(String(t || "").trim());
    if (!n) continue;
    const o = Number(n[1]), r = Number(n[2]);
    if (!o || !r) continue;
    const a = 18 / Math.max(o, r);
    return /* @__PURE__ */ i.jsx(
      "span",
      {
        "aria-hidden": !0,
        className: "block",
        style: {
          width: Math.max(6, Math.round(o * a)),
          height: Math.max(6, Math.round(r * a)),
          border: "1.4px solid currentColor"
        }
      }
    );
  }
  return null;
}
function Na(e, t) {
  return /* @__PURE__ */ i.jsxs(i.Fragment, { children: [
    /* @__PURE__ */ i.jsx("span", { className: "flex items-center justify-center", style: { height: 18 }, "aria-hidden": !0, children: t }),
    /* @__PURE__ */ i.jsx("span", { className: "leading-none", children: e })
  ] });
}
function Ea(e, t, n) {
  if (!We(e)) {
    const a = Qn(e, t), s = e.options.find((c) => He(c) === a);
    return s ? typeof s == "string" ? s || n : s.label : a;
  }
  if (e.type === "boolean")
    return ($e(e, t) || "false") === "true" ? e.label : "";
  const o = $e(e, t);
  if (!o) return "";
  const r = e.options.find((a) => Re(a.value) === o);
  return r ? r.label : o.length > 8 ? `${o.slice(0, 8)}…` : o;
}
function _a({
  modelOptions: e,
  modelCatalogStatus: t,
  renderedControls: n,
  selectedModelOption: o,
  meta: r,
  onModelChange: a,
  onCatalogControlChange: s,
  onParameterControlChange: c,
  variantChoices: f,
  activeVariantId: m,
  onVariantSelect: h,
  onParamPanelOpenChange: p
}) {
  const { t: u } = ye(), v = wr(e, o?.value || "", a), M = n.map((y) => Ea(y, r, u("generationCommon.parameters.auto"))).filter(Boolean).join(" · "), [d, x] = b.useState(!1), [K, S] = b.useState(null), [w, D] = b.useState(""), q = b.useRef(null), N = b.useRef(null), U = 320, Y = 6, A = () => {
    const y = q.current?.getBoundingClientRect();
    if (!y) return;
    const J = window.innerWidth, z = window.innerHeight, _ = Math.min(Math.max(8, y.left), Math.max(8, J - U - 8)), B = y.top - 12, O = B >= 240 ? "above" : "below", V = O === "above" ? Math.min(420, B) : Math.min(420, Math.max(160, z - y.bottom - 18)), X = O === "above" ? z - y.top + Y : y.bottom + Y;
    S({ left: _, top: X, maxHeight: V, side: O }), D(M), x(!0), p?.(!0);
  }, j = b.useCallback(() => {
    x(!1), S(null), p?.(!1);
  }, [p]);
  b.useEffect(
    () => () => {
      p?.(!1);
    },
    [p]
  ), b.useEffect(() => {
    if (!d) return;
    const y = (z) => {
      const _ = z.target;
      N.current && (N.current.contains(_) || q.current?.contains(_) || j());
    }, J = (z) => {
      z.key === "Escape" && (z.stopPropagation(), j());
    };
    return document.addEventListener("pointerdown", y, !0), window.addEventListener("keydown", J, !0), () => {
      document.removeEventListener("pointerdown", y, !0), window.removeEventListener("keydown", J, !0);
    };
  }, [d, j]);
  const I = d ? w : M;
  if (e.length === 0)
    return /* @__PURE__ */ i.jsxs(
      "button",
      {
        type: "button",
        className: g(
          "inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-nomi-accent/30",
          "bg-nomi-accent-soft text-nomi-accent font-medium text-caption",
          "hover:bg-nomi-accent hover:text-nomi-paper transition-colors cursor-pointer"
        ),
        "aria-label": u("generationCommon.parameters.configureModel"),
        title: u("generationCommon.parameters.openModelCatalog"),
        onClick: (y) => {
          y.preventDefault(), y.stopPropagation(), window.dispatchEvent(new CustomEvent("nomi-open-model-catalog"));
        },
        children: [
          /* @__PURE__ */ i.jsx("span", { className: "truncate", children: t.message }),
          /* @__PURE__ */ i.jsx("span", { className: "shrink-0", children: u("generationCommon.parameters.configure") })
        ]
      }
    );
  const T = (y, J, z, _) => {
    let B = z.map((X) => ({ ...X, shape: ja(X.value, X.text) }));
    const O = B.some((X) => X.shape);
    O && (B = [...B].sort((X, de) => Vt(X.value, X.text) - Vt(de.value, de.text)));
    const V = B.map((X) => ({
      value: X.value,
      label: O ? Na(X.text, X.shape) : X.text,
      title: X.text
    }));
    return /* @__PURE__ */ i.jsx(
      Zt,
      {
        ariaLabel: y,
        value: J,
        options: V,
        onChange: _
      }
    );
  }, F = (y) => {
    if (We(y) && y.type === "boolean") {
      const z = ($e(y, r) || "false") === "true";
      return /* @__PURE__ */ i.jsxs("div", { className: "flex items-center justify-between gap-2", style: { minHeight: 26 }, children: [
        /* @__PURE__ */ i.jsx("div", { className: "text-micro font-semibold leading-none text-nomi-ink-40", children: y.label }),
        /* @__PURE__ */ i.jsx(
          _r,
          {
            size: "sm",
            color: "var(--nomi-accent)",
            "aria-label": y.label,
            checked: z,
            onChange: (_) => c(y, _.currentTarget.checked ? "true" : "false")
          }
        )
      ] }, y.key);
    }
    const J = (() => {
      if (!We(y))
        return T(
          y.label,
          Qn(y, r),
          y.options.map((z) => ({ value: He(z), text: ca(z) })),
          (z) => s(y, z)
        );
      if (y.options.length > 0)
        return T(
          y.label,
          $e(y, r),
          y.options.map((z) => ({
            value: Re(z.value),
            text: Gn(z.label, z.priceLabel)
          })),
          (z) => c(y, z)
        );
      if (y.type === "number" && typeof y.min == "number" && typeof y.max == "number") {
        const z = Number($e(y, r)), _ = Number.isFinite(z) ? z : y.min;
        return /* @__PURE__ */ i.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ i.jsx(
            Pt,
            {
              className: "flex-1 min-w-0",
              "aria-label": y.label,
              value: _,
              min: y.min,
              max: y.max,
              step: y.step || 1,
              label: null,
              onChange: (B) => c(y, String(B)),
              styles: {
                track: { "--slider-track-bg": "var(--nomi-ink-10)" },
                bar: { background: "var(--nomi-accent)" },
                thumb: { borderColor: "var(--nomi-accent)", background: "var(--nomi-paper)" }
              }
            }
          ),
          /* @__PURE__ */ i.jsx("span", { className: "shrink-0 text-right text-caption text-nomi-ink-80 tabular-nums", style: { minWidth: 28 }, children: _ })
        ] });
      }
      return /* @__PURE__ */ i.jsx(
        "label",
        {
          className: g(
            "flex items-center gap-2 px-2.5 rounded-nomi border border-nomi-line min-w-0 focus-within:border-nomi-accent"
          ),
          style: { height: 30 },
          children: /* @__PURE__ */ i.jsx(
            "input",
            {
              className: g(
                "flex-1 appearance-none bg-transparent border-0 outline-0 text-caption text-nomi-ink-80 min-w-0"
              ),
              "aria-label": y.label,
              type: y.type === "number" ? "number" : "text",
              value: $e(y, r),
              min: y.min,
              max: y.max,
              step: y.step,
              placeholder: y.placeholder,
              onChange: (z) => c(y, z.target.value)
            }
          )
        }
      );
    })();
    return /* @__PURE__ */ i.jsxs("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ i.jsx("div", { className: "text-micro font-semibold leading-none text-nomi-ink-40", children: y.label }),
      J
    ] }, y.key);
  }, E = v.providerOptions.length > 1, Z = n.length > 0 || E;
  return /* @__PURE__ */ i.jsxs("div", { className: g("generation-canvas-v2-node__params--parameters", "flex items-center gap-2 min-w-0"), children: [
    /* @__PURE__ */ i.jsx(
      Wt,
      {
        ariaLabel: u("generationCommon.parameters.model"),
        placeholder: u("generationCommon.parameters.selectModel"),
        triggerMaxWidth: 150,
        value: v.modelValue,
        options: v.modelOptions,
        onChange: v.onModelPick
      }
    ),
    f && f.length > 1 ? /* @__PURE__ */ i.jsx(
      Wt,
      {
        ariaLabel: u("generationCommon.parameters.variant"),
        leadingLabel: u("generationCommon.parameters.variant"),
        value: m || "",
        options: f.map((y) => ({ value: y.id, label: y.label })),
        onChange: (y) => h?.(y)
      }
    ) : null,
    Z ? /* @__PURE__ */ i.jsxs(i.Fragment, { children: [
      /* @__PURE__ */ i.jsxs(
        "button",
        {
          ref: q,
          type: "button",
          "aria-label": u("generationCommon.parameters.generationParameters"),
          "aria-expanded": d,
          title: I || u("generationCommon.parameters.generationParameters"),
          onClick: () => d ? j() : A(),
          className: g(
            "inline-flex items-center gap-1 h-7 pl-2.5 pr-2 rounded-pill border border-nomi-line bg-nomi-ink-05",
            "text-caption text-nomi-ink-80 cursor-pointer min-w-0",
            "hover:border-nomi-ink-20 focus:outline-none focus-visible:border-nomi-accent"
          ),
          children: [
            /* @__PURE__ */ i.jsx("span", { className: "min-w-0 truncate", style: { maxWidth: 240 }, children: I || u("generationCommon.parameters.parameters") }),
            /* @__PURE__ */ i.jsx(
              Ln,
              {
                size: 12,
                stroke: 1.6,
                className: g(
                  "shrink-0 text-nomi-ink-40 pointer-events-none transition-transform",
                  d && "rotate-180"
                ),
                "aria-hidden": !0
              }
            )
          ]
        }
      ),
      d && K ? Sn.createPortal(
        /* @__PURE__ */ i.jsxs(
          "div",
          {
            ref: N,
            role: "group",
            "aria-label": u("generationCommon.parameters.panel"),
            className: "fixed flex flex-col gap-3 overflow-y-auto rounded-nomi-lg border border-nomi-line bg-nomi-paper p-3",
            style: {
              zIndex: 600,
              left: K.left,
              ...K.side === "above" ? { bottom: K.top } : { top: K.top },
              width: U,
              maxHeight: K.maxHeight,
              boxShadow: "var(--workbench-shadow-pop)"
            },
            children: [
              n.map((y) => F(y)),
              E ? /* @__PURE__ */ i.jsxs("div", { className: "flex flex-col gap-1.5", children: [
                /* @__PURE__ */ i.jsx("div", { className: "text-micro font-semibold leading-none text-nomi-ink-40", children: u("generationCommon.parameters.provider") }),
                /* @__PURE__ */ i.jsx(
                  Zt,
                  {
                    ariaLabel: u("generationCommon.parameters.provider"),
                    value: v.providerValue,
                    options: v.providerOptions.map((y) => ({ value: y.value, label: y.label })),
                    onChange: v.onProviderPick
                  }
                )
              ] }) : null
            ]
          }
        ),
        document.body
      ) : null
    ] }) : null
  ] });
}
function Pa(e, t, n) {
  const o = (s) => /image-to-image|img2img|i2i|image2video|edit|inpaint/i.test(
    `${s.value} ${s.modelKey || ""} ${s.modelAlias || ""}`
  ), r = e.filter((s) => !!ze(s)), a = r.filter((s) => !o(s));
  return a.find((s) => !dr(s.modelKey || s.value)) || a[0] || r[0] || e[0];
}
function ze(e) {
  return dt({
    modelKey: e?.modelKey,
    modelAlias: e?.modelAlias,
    vendorKey: e?.vendor,
    meta: e?.meta
  });
}
function Ia(e, t, n, o) {
  const r = ze(e);
  if (r) {
    const a = Mn(r, Rn(r, t)?.id);
    return gn(
      Nt({
        parameterControls: Mo(_t(a, t)),
        imageCatalogConfig: null,
        videoCatalogConfig: null,
        isImageLike: n,
        isVideoLike: o
      })
    );
  }
  return gn(
    Nt({
      parameterControls: It(e?.meta),
      imageCatalogConfig: Ot(e?.meta),
      videoCatalogConfig: oo(e?.meta),
      isImageLike: n,
      isVideoLike: o
    })
  );
}
function gn(e) {
  return e.map((t) => "type" in t ? {
    ...t,
    label: Ke(t.label),
    ...t.placeholder ? { placeholder: Ke(t.placeholder) } : {},
    options: t.options.map((n) => ({
      ...n,
      label: Ke(n.label)
    }))
  } : {
    ...t,
    label: Ke(t.label),
    options: t.options.map(
      (n) => typeof n == "string" ? Ke(n) : { ...n, label: Ke(n.label) }
    )
  });
}
function za({
  node: e,
  meta: t,
  modelOptions: n,
  selectedModelValue: o,
  selectedModelOption: r,
  archetype: a,
  isGenerationNode: s,
  isImageLike: c,
  isVideoLike: f,
  updateNode: m
}) {
  const { t: h } = ye();
  b.useEffect(() => {
    if (!s || o) return;
    const p = Pa(n);
    if (!p?.value) return;
    const u = no(ro(p.meta, c, f));
    m(e.id, {
      meta: {
        ...e.meta || {},
        modelKey: p.modelKey || p.value,
        modelAlias: p.modelAlias || p.value,
        modelVendor: p.vendor || null,
        vendor: p.vendor || null,
        modelLabel: p.label,
        ...u,
        ...f ? { videoModel: p.value, videoModelVendor: p.vendor || null } : { imageModel: p.value, imageModelVendor: p.vendor || null }
      }
    });
  }, [s, f, n, e.id, e.meta, o, m]), b.useEffect(() => {
    if (!s || !r) return;
    const p = typeof r.vendor == "string" ? r.vendor.trim() : "", u = ue(t, "modelVendor") || ue(t, "vendor") || ue(t, f ? "videoModelVendor" : "imageModelVendor");
    !p || u === p || m(e.id, {
      meta: {
        ...e.meta || {},
        modelKey: r.modelKey || r.value,
        modelAlias: r.modelAlias || r.value,
        modelVendor: p,
        vendor: p,
        modelLabel: r.label,
        ...f ? { videoModel: r.value, videoModelVendor: p } : { imageModel: r.value, imageModelVendor: p }
      }
    });
  }, [s, f, t, e.id, e.meta, r, m]), b.useEffect(() => {
    if (!s || !o) return;
    const p = dt({
      modelKey: o,
      modelAlias: ue(t, "modelAlias"),
      vendorKey: ue(t, "modelVendor") || ue(t, "vendor"),
      meta: t
    });
    if (!p?.variants?.length) return;
    const u = Ro(e.meta || {}, p);
    u && m(e.id, {
      meta: {
        ...e.meta || {},
        ...u,
        modelAlias: u.modelKey,
        ...f ? { videoModel: u.modelKey } : { imageModel: u.modelKey }
      }
    });
  }, [s, f, t, e.id, e.meta, o, m]), b.useEffect(() => {
    if (!s || !o || r) return;
    const p = dt({
      modelKey: o,
      modelAlias: ue(t, "modelAlias"),
      vendorKey: ue(t, "modelVendor") || ue(t, "vendor"),
      meta: t
    });
    if (!p) return;
    const u = n.find((x) => ze(x)?.id === p.id) || n.find((x) => ze(x)?.family === p.family), v = typeof u?.vendor == "string" ? u.vendor.trim() : "";
    if (!u?.value || !v) return;
    const M = ze(u), d = M ? mr(
      p,
      t.archetype?.modeId,
      M
    ) : null;
    m(e.id, {
      meta: {
        ...e.meta || {},
        modelKey: u.modelKey || u.value,
        modelAlias: u.modelAlias || u.value,
        modelVendor: v,
        vendor: v,
        modelLabel: u.label,
        ...d ? { archetype: d } : {},
        ...f ? { videoModel: u.value, videoModelVendor: v } : { imageModel: u.value, imageModelVendor: v }
      }
    }), Ee(h("generationCommon.node.providerDisconnectedSwitched", { model: u.label }));
  }, [
    s,
    f,
    t,
    n,
    e.id,
    e.meta,
    r,
    o,
    h,
    m
  ]), b.useEffect(() => {
    if (!s || !a) return;
    const p = Ao(e.meta || {}, a);
    if (!p) return;
    const u = ne.getState(), v = An({ ...e, meta: p }, u.nodes, u.edges);
    m(e.id, { meta: v ? mt(p, a, v) : p });
  }, [s, a, e, e.id, e.meta, m]);
}
const hn = new Set(On);
function bn({
  node: e,
  section: t = "all",
  onInsertMention: n,
  onParamPanelOpenChange: o
}) {
  const { t: r } = ye(), a = ne((l) => l.nodes), s = ne((l) => l.edges), c = ne((l) => l.updateNode), f = ne((l) => l.updateEdgeMode), m = ne((l) => l.connectNodes), h = ne((l) => l.disconnectEdge), p = Bi(e.kind), u = p.options, v = Hi(e.kind, p), M = b.useMemo(() => e.meta || {}, [e.meta]), [d, x] = b.useState(""), [K, S] = b.useState(""), [w, D] = b.useState(""), [q, N] = b.useState(""), U = jn(e.kind), Y = wt(e.kind), A = Nn(e.kind) === "text", j = En(e.kind), I = U || Y || A || j, T = ue(M, "modelKey") || ue(M, "modelAlias") || ue(M, "imageModel") || ue(M, "videoModel"), F = ln(u, T) || null, E = ze(F), Z = E ? jo(E) : [], y = E && Rn(E, M)?.id || "", J = E ? Mn(E, y) : null, z = J ? _t(J, M) : null, _ = E ? null : Ot(F?.meta), B = Ia(F, M, U, Y), O = () => ne.getState().nodes.find((l) => l.id === e.id)?.meta || {}, V = (l) => {
    c(e.id, {
      meta: { ...O(), ...l }
    });
  }, X = (l) => {
    const k = ln(u, l), C = ro(k?.meta, U, Y), L = no(C), re = ze(k), G = Y ? cn(C, Ut($t(e.id, s, a))) : {};
    let H = {
      ...Ca(O(), B),
      modelKey: k?.modelKey || k?.value || l || null,
      modelAlias: k?.modelAlias || k?.value || l || null,
      modelVendor: k?.vendor || null,
      vendor: k?.vendor || null,
      modelLabel: k?.label || l || null,
      ...L,
      ...G,
      ...Y ? { videoModel: k?.value || l || null, videoModelVendor: k?.vendor || null } : { imageModel: k?.value || l || null, imageModelVendor: k?.vendor || null }
    };
    if (!re)
      delete H.archetype;
    else {
      const W = ne.getState(), Me = An({ ...e, meta: H }, W.nodes, W.edges);
      Me && (H = mt(H, re, Me));
    }
    c(e.id, {
      meta: H
    });
  };
  za({
    node: e,
    meta: M,
    modelOptions: u,
    selectedModelValue: T,
    selectedModelOption: F,
    archetype: E,
    isGenerationNode: I,
    isImageLike: U,
    isVideoLike: Y,
    updateNode: c
  });
  const de = s.filter((l) => l.target === e.id).map((l) => `${l.source}:${String(l.mode || "")}`).sort().join("|");
  if (b.useEffect(() => {
    if (!Y) return;
    const l = O();
    if (l.aspect_ratio_user_set === !0) return;
    const k = ne.getState(), C = Ut($t(e.id, k.edges, k.nodes));
    if ((() => {
      for (const G of On) {
        const H = Ue(String(l[G] ?? ""));
        if (H) return H;
      }
      return null;
    })() === C) return;
    const re = cn(B, C);
    Object.keys(re).length > 0 && V(re);
  }, [de, Y, T, e.id]), !I) return null;
  const me = (l, k) => {
    const C = ua(l, k), L = { [l.key]: C };
    if (hn.has(l.key)) {
      const re = Ue(C);
      re && (L.aspect_ratio = re), L.aspect_ratio_user_set = !0;
    }
    V(L);
  }, ge = (l, k) => {
    const C = l.binding === "size" || l.binding === "aspectRatio" || hn.has(l.key);
    V({
      ...zt({ ...l, defaultValue: k }),
      ...C ? { aspect_ratio_user_set: !0 } : {}
    });
  }, Ce = (l) => {
    E && (c(e.id, { meta: mt(O(), E, l) }), D(""));
  }, he = (l) => {
    E && (c(e.id, { meta: zo(O(), E, l) }), D(""));
  }, be = (l, k) => V({ [l]: k }), pe = (l, k) => {
    const C = Ct(e, a, s).find(
      (re) => Lt({ kind: re.slotKind })?.metaKey === l.metaKey
    )?.fills.length;
    if (C != null && C >= l.max) {
      Ee(r("generationCommon.parameters.referenceFull", { max: l.max }));
      return;
    }
    const L = _n(O(), l, k);
    if (L.status === "full") {
      Ee(r("generationCommon.parameters.maximum", { max: l.max, label: l.label }));
      return;
    }
    L.status === "added" && (be(l.metaKey, L.next), D(""));
  }, Oe = (l, k) => {
    const C = xr(e, a, s, l, k), L = (W) => l === "referenceImageUrls" && W ? pr(e.prompt || "", W) : null;
    if (C.kind === "disconnect-edge") {
      h(C.edgeId);
      const W = O(), Me = rt(W, l), ot = C.url ? Me.filter((so) => so !== C.url) : Me, Fe = L(C.url), Ne = {};
      ot.length !== Me.length && (Ne.meta = { ...W, [l]: ot }), Fe != null && Fe !== (e.prompt || "") && (Ne.prompt = Fe), Object.keys(Ne).length > 0 && c(e.id, Ne);
      return;
    }
    if (C.kind === "noop") return;
    const re = O(), G = rt(re, l).filter((W) => W !== C.url), H = L(C.url);
    if (H != null && H !== (e.prompt || "")) {
      c(e.id, { meta: { ...re, [l]: G }, prompt: H });
      return;
    }
    be(l, G);
  }, Se = async (l, k) => {
    if (k) {
      N(l.metaKey), S("");
      try {
        const C = await lt(k, k.name || l.label, {
          ownerNodeId: e.id,
          taskKind: "image_edit"
        }), L = ut(C);
        if (!L) throw new Error(r("generationCommon.parameters.missingAssetUrl"));
        pe(l, L);
      } catch (C) {
        S(C instanceof Error ? C.message : String(C));
      } finally {
        N("");
      }
    }
  }, Ge = async (l, k) => {
    if (k) {
      N(l), S("");
      try {
        const C = await lt(
          k,
          k.name || r("generationCommon.parameters.sourceVideo"),
          { ownerNodeId: e.id, taskKind: "image_edit" }
        ), L = ut(C);
        if (!L) throw new Error(r("generationCommon.parameters.missingVideoUrl"));
        V({ [l]: L });
      } catch (C) {
        S(C instanceof Error ? C.message : String(C));
      } finally {
        N("");
      }
    }
  }, Pe = (l, k) => {
    const C = At(l.group);
    if (!k) {
      const G = s.find((W) => W.target === e.id && W.mode === C);
      G && h(G.id);
      const H = { [l.key]: null, [l.key + "_nodeRef"]: null };
      l.group === "first_frame" && (H.firstFrameUrl = null, H.firstFrameRef = null), l.group === "last_frame" && (H.lastFrameUrl = null, H.lastFrameRef = null), l.group === "reference" && (H.referenceImages = [], H.referenceImageUrl = null, H.referenceImageRef = null), c(e.id, { meta: { ...O(), ...H } }), D("");
      return;
    }
    const L = s.find((G) => G.source === k && G.target === e.id);
    L ? L.mode !== C && f(L.id, C) : m(k, e.id, C);
    const re = s.find(
      (G) => G.target === e.id && G.mode === C && G.source !== k
    );
    re && h(re.id), D("");
  }, fe = (l, k) => {
    const C = At(l.group), L = s.find((H) => H.target === e.id && H.mode === C);
    L && h(L.id);
    const re = O(), G = { [l.key]: k, [l.key + "_nodeRef"]: null };
    l.group === "first_frame" && (G.firstFrameUrl = k, G.firstFrameRef = null), l.group === "last_frame" && (G.lastFrameUrl = k, G.lastFrameRef = null), l.group === "reference" && (G.referenceImages = [k], G.referenceImageUrl = k, G.referenceImageRef = null), c(e.id, { meta: { ...re, ...G } }), D("");
  }, Le = async (l, k) => {
    if (k) {
      if (!k.type.startsWith("image/")) {
        S(r("generationCommon.parameters.imageOnly"));
        return;
      }
      x(l.key), S("");
      try {
        const C = await lt(k, k.name || l.label, {
          ownerNodeId: e.id,
          taskKind: "image_edit"
        }), L = ut(C);
        if (!L) throw new Error(r("generationCommon.parameters.missingImageUrl"));
        fe(l, L);
      } catch (C) {
        S(C instanceof Error ? C.message : String(C));
      } finally {
        x("");
      }
    }
  }, se = Qi(F?.meta, {
    firstFrame: r("generationCommon.parameters.firstFrame"),
    lastFrame: r("generationCommon.parameters.lastFrame")
  }), te = [
    ...se ?? Zi(F?.meta),
    ...se ? [] : ta(_)
  ].filter(
    (l, k, C) => C.findIndex((L) => L.key === l.key && L.group === l.group) === k
  ), ie = z ? No(z) : ea({
    isVideoLike: Y,
    modelImageUrlSlots: te,
    comfyImageUrlSlots: se,
    vendor: F?.vendor
  }) ? [
    { key: "firstFrameUrl", label: r("generationCommon.parameters.firstFrame"), group: "first_frame" },
    { key: "lastFrameUrl", label: r("generationCommon.parameters.lastFrame"), group: "last_frame" }
  ] : te, Qe = E ? Eo(E) : [], et = Qe.length > 1, gt = Z.length > 1, R = z ? _o(z) : [], P = z ? Po(z) : null, ae = t === "all" || t === "references", le = [
    ...ie.map(
      (l) => ({
        key: l.key,
        label: l.label,
        accept: "image",
        form: "single",
        persistAsEdge: !0,
        numbered: !1,
        max: 1
      })
    ),
    ...R.map(
      (l) => ({
        key: l.metaKey,
        label: l.label,
        accept: l.accept,
        form: "array",
        persistAsEdge: !1,
        numbered: l.numbered,
        max: l.max,
        caption: l.caption
      })
    ),
    ...P ? [
      {
        key: P.metaKey,
        label: P.label,
        accept: "video",
        form: "single",
        persistAsEdge: !1,
        numbered: !1,
        max: 1
      }
    ] : []
  ], xe = /* @__PURE__ */ new Map(), ve = /* @__PURE__ */ new Map();
  if (z)
    for (const l of Ct(e, a, s)) {
      const k = Lt({ kind: l.slotKind });
      k && (xe.set(
        k.metaKey,
        l.fills.map((C) => C.url).filter((C) => !!C)
      ), ve.set(k.metaKey, l.fills.length));
    }
  const Q = {};
  for (const l of ie) {
    if (z && xe.has(l.key)) {
      Q[l.key] = xe.get(l.key)[0] || "";
      continue;
    }
    const C = Yi(l.group, s, e.id) || Yn(M, l.key), L = C ? a.find((re) => re.id === C) : void 0;
    Q[l.key] = (L ? Jn(L) : null) || na(M, l.key, a) || ue(M, l.key) || "";
  }
  for (const l of R)
    Q[l.metaKey] = xe.get(l.metaKey) ?? rt(M, l.metaKey);
  P && (Q[P.metaKey] = xe.get(P.metaKey)?.[0] || ue(M, P.metaKey) || "");
  const De = (l, k) => {
    if (l.form === "array") {
      const C = R.find((L) => L.metaKey === l.key);
      C && pe(C, k.renderUrl), D("");
      return;
    }
    if (l.persistAsEdge) {
      const C = ie.find((L) => L.key === l.key);
      if (!C) return;
      k.source === "canvas" && k.origin.source === "canvas" ? Pe(C, k.origin.nodeId) : fe(C, k.renderUrl);
      return;
    }
    V({ [l.key]: k.renderUrl }), D("");
  }, je = async (l, k) => {
    if (l.form === "array") {
      const C = R.find((L) => L.metaKey === l.key);
      C && await Se(C, k);
      return;
    }
    if (l.persistAsEdge) {
      const C = ie.find((L) => L.key === l.key);
      C && await Le(C, k);
      return;
    }
    await Ge(l.key, k);
  }, qe = (l, k, C) => {
    if (l.form !== "array") return;
    const L = rt(O(), l.key);
    k === C || k < 0 || C < 0 || k >= L.length || C >= L.length || be(l.key, Nr(L, k, C));
  }, Te = () => {
    D(""), window.dispatchEvent(new CustomEvent("nomi-open-files-panel"));
  }, tt = (l, k) => {
    if (l.form === "array") {
      Oe(l.key, k);
      return;
    }
    if (l.persistAsEdge) {
      const C = ie.find((L) => L.key === l.key);
      C && Pe(C, "");
      return;
    }
    V({ [l.key]: null });
  };
  if (t === "parameters")
    return /* @__PURE__ */ i.jsx(
      _a,
      {
        modelOptions: u,
        modelCatalogStatus: v,
        renderedControls: B,
        selectedModelOption: F,
        archetype: E,
        meta: M,
        onModelChange: X,
        onCatalogControlChange: ge,
        onParameterControlChange: me,
        variantChoices: gt ? Z : [],
        activeVariantId: y,
        onVariantSelect: he,
        onParamPanelOpenChange: o
      }
    );
  if (t === "references" && ie.length === 0 && R.length === 0 && !P && !et)
    return null;
  const nt = g("generation-canvas-v2-node__ref-section", "flex flex-col gap-1");
  return /* @__PURE__ */ i.jsxs("div", { className: nt, "aria-label": r("generationCommon.parameters.referencesAria"), children: [
    ae && et ? /* @__PURE__ */ i.jsx(Sa, { choices: Qe, activeId: z?.id || "", onSelect: Ce }) : null,
    ae && le.length > 0 ? /* @__PURE__ */ i.jsx(
      Aa,
      {
        slots: le,
        valuesByKey: Q,
        occupiedByKey: ve,
        projectId: Io() || null,
        openSlotKey: w,
        uploadingSlotKey: d || q,
        onTogglePicker: (l) => D((k) => k === l ? "" : l),
        onPick: De,
        onUpload: (l, k) => {
          je(l, k);
        },
        onRemove: tt,
        onInsertMention: n,
        onReorder: qe,
        onBrowseAll: Te
      }
    ) : null,
    ae && K ? /* @__PURE__ */ i.jsx("div", { className: g("text-workbench-danger text-micro leading-tight"), role: "alert", children: K }) : null
  ] });
}
const Oa = g(
  "inline-flex items-center justify-center shrink-0 w-[30px] h-[30px] p-0",
  "border-0 rounded-full bg-nomi-ink text-nomi-paper text-body leading-none cursor-pointer",
  "transition-colors hover:enabled:bg-nomi-accent",
  "disabled:bg-nomi-ink-20 disabled:text-nomi-ink-40 disabled:cursor-not-allowed"
);
function La({
  nodeId: e,
  locked: t,
  selected: n
}) {
  const { t: o } = ye();
  return !t && !n ? null : /* @__PURE__ */ i.jsx(
    "button",
    {
      type: "button",
      className: g(
        "inline-grid place-items-center w-6 h-6 rounded-full border-0 p-0",
        "backdrop-blur-[8px] cursor-pointer pointer-events-auto transition-colors duration-150",
        t ? "bg-nomi-ink text-nomi-paper hover:bg-nomi-ink-80" : "bg-nomi-paper/[0.82] text-nomi-ink-40 hover:text-nomi-ink"
      ),
      "aria-label": o(t ? "generationCommon.node.lock.unlockAria" : "generationCommon.node.lock.lockAria"),
      title: o(t ? "generationCommon.node.lock.unlockHint" : "generationCommon.node.lock.lockHint"),
      "data-node-lock": t ? "locked" : "unlocked",
      onClick: (r) => {
        r.stopPropagation(), ne.getState().setNodeLocked(e, !t);
      },
      onPointerDown: (r) => r.stopPropagation(),
      children: t ? /* @__PURE__ */ i.jsx(Ir, { size: 13, stroke: 1.8 }) : /* @__PURE__ */ i.jsx(Cr, { size: 13, stroke: 1.8 })
    }
  );
}
const Da = {
  push_in: Tr,
  pull_out: Dr,
  orbit_left: Or,
  orbit_right: ui,
  crane_up: ei,
  crane_down: Jr,
  track_left: ni,
  track_right: ri,
  arc_left: ai,
  arc_right: li,
  zoom_in: mi,
  zoom_out: fi,
  dolly_zoom: zr
}, io = ["slow", "medium", "fast"], ao = ["wide", "medium", "close"], Ta = "push_in", Fa = "medium", Ka = "medium";
function Va(e) {
  return typeof e == "string" && Dn.includes(e);
}
function Ua(e) {
  return typeof e == "string" && io.includes(e);
}
function $a(e) {
  return typeof e == "string" && ao.includes(e);
}
function vt(e) {
  const t = e?.cameraMovePick || {};
  return {
    move: Va(t.move) ? t.move : Ta,
    speed: Ua(t.speed) ? t.speed : Fa,
    shot: $a(t.shot) ? t.shot : Ka
  };
}
function xn({
  label: e,
  value: t,
  options: n,
  onChange: o
}) {
  return /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-1 w-full"), children: [
    /* @__PURE__ */ i.jsx("span", { className: g("text-nomi-ink-40 text-micro leading-none"), children: e }),
    /* @__PURE__ */ i.jsx(
      "div",
      {
        className: g("inline-flex gap-0.5 p-0.5 rounded-nomi-sm bg-nomi-ink-05 self-start"),
        role: "group",
        "aria-label": e,
        children: n.map((r) => /* @__PURE__ */ i.jsx(
          "button",
          {
            type: "button",
            "aria-pressed": t === r.value,
            "data-active": t === r.value ? "true" : "false",
            className: g(
              "rounded-nomi-sm px-3 py-1 text-caption leading-none",
              "text-nomi-ink-60 cursor-pointer transition-colors",
              "data-[active=true]:bg-nomi-paper data-[active=true]:text-nomi-ink",
              "data-[active=true]:font-semibold data-[active=true]:shadow-nomi-sm"
            ),
            onClick: (a) => {
              a.stopPropagation(), o(r.value);
            },
            children: r.label
          },
          r.value
        ))
      }
    )
  ] });
}
function Ba({ node: e }) {
  const { t } = ye(), n = ne((d) => d.updateNode), [o, r] = b.useState(!1), [a, s] = b.useState(() => vt(e.meta));
  b.useEffect(() => {
    o && s(vt(e.meta));
  }, [o, e.meta]);
  const c = vt(e.meta), f = (d) => t(`generationCommon.cameraMove.move.${d}`), m = (d) => t(`generationCommon.cameraMove.${d}`), h = (d) => t(`generationCommon.cameraMove.${d}`), p = `${f(c.move)} ${m(c.speed)}`, u = Fr[a.speed], v = () => ne.getState().nodes.find((d) => d.id === e.id)?.meta || {}, M = (d) => {
    d.stopPropagation(), n(e.id, { meta: { ...v(), cameraMovePick: { ...a } } }), Kr({
      spec: { move: a.move, speed: a.speed, shot: a.shot },
      targetNodeId: e.id
    }), Pn(
      t("generationCommon.cameraMove.created", {
        move: f(a.move),
        speed: m(a.speed),
        duration: u
      }),
      "success"
    ), r(!1);
  };
  return /* @__PURE__ */ i.jsxs(ht, { opened: o, onChange: r, position: "bottom-start", offset: 6, withinPortal: !0, shadow: "md", radius: "md", children: [
    /* @__PURE__ */ i.jsx(ht.Target, { children: /* @__PURE__ */ i.jsxs(
      "button",
      {
        type: "button",
        "aria-label": t("generationCommon.cameraMove.title"),
        title: t("generationCommon.cameraMove.hint"),
        onClick: (d) => {
          d.stopPropagation(), r((x) => !x);
        },
        className: g(
          "inline-flex items-center gap-1 h-7 pl-2.5 pr-2 rounded-pill border border-nomi-line bg-nomi-paper",
          "text-caption text-nomi-ink-80 cursor-pointer hover:border-nomi-ink-20 focus:outline-none focus-visible:border-nomi-accent"
        ),
        children: [
          /* @__PURE__ */ i.jsx(Lr, { size: 13, stroke: 1.6, className: "shrink-0 text-nomi-ink-40", "aria-hidden": !0 }),
          /* @__PURE__ */ i.jsx("span", { className: "shrink-0", children: t("generationCommon.cameraMove.title") }),
          /* @__PURE__ */ i.jsx("span", { className: "text-nomi-ink-40", "aria-hidden": !0, children: "·" }),
          /* @__PURE__ */ i.jsx("span", { className: "shrink-0 whitespace-nowrap", children: p }),
          /* @__PURE__ */ i.jsx(
            Ln,
            {
              size: 12,
              stroke: 1.6,
              className: "shrink-0 text-nomi-ink-40 pointer-events-none",
              "aria-hidden": !0
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ i.jsx(
      ht.Dropdown,
      {
        onClick: (d) => d.stopPropagation(),
        styles: {
          dropdown: {
            padding: 12,
            border: "1px solid var(--nomi-line)",
            borderRadius: "var(--nomi-radius-lg)",
            background: "var(--nomi-paper)",
            boxShadow: "var(--workbench-shadow-pop)"
          }
        },
        children: /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-3 w-[300px]"), children: [
          /* @__PURE__ */ i.jsxs("div", { className: g("flex flex-col gap-0.5"), children: [
            /* @__PURE__ */ i.jsx("span", { className: g("text-body-sm font-semibold text-nomi-ink"), children: t("generationCommon.cameraMove.title") }),
            /* @__PURE__ */ i.jsx("span", { className: g("text-micro text-nomi-ink-40"), children: t("generationCommon.cameraMove.noSceneHint") })
          ] }),
          /* @__PURE__ */ i.jsx("div", { className: g("grid grid-cols-5 gap-1"), role: "group", "aria-label": t("generationCommon.cameraMove.type"), children: Dn.map((d) => {
            const x = Da[d], K = a.move === d;
            return /* @__PURE__ */ i.jsxs(
              "button",
              {
                type: "button",
                "aria-pressed": K,
                "data-active": K ? "true" : "false",
                title: f(d),
                className: g(
                  "flex flex-col items-center gap-1 py-1.5 rounded-nomi-sm border border-transparent",
                  "text-nomi-ink-60 cursor-pointer transition-colors hover:bg-nomi-ink-05",
                  "data-[active=true]:border-nomi-accent data-[active=true]:bg-nomi-accent-soft data-[active=true]:text-nomi-accent"
                ),
                onClick: (S) => {
                  S.stopPropagation(), s((w) => ({ ...w, move: d }));
                },
                children: [
                  /* @__PURE__ */ i.jsx(x, { size: 18, stroke: 1.6, "aria-hidden": !0 }),
                  /* @__PURE__ */ i.jsx("span", { className: g("text-micro leading-none"), children: f(d) })
                ]
              },
              d
            );
          }) }),
          /* @__PURE__ */ i.jsx(
            xn,
            {
              label: t("generationCommon.cameraMove.speed"),
              value: a.speed,
              options: io.map((d) => ({ value: d, label: m(d) })),
              onChange: (d) => s((x) => ({ ...x, speed: d }))
            }
          ),
          /* @__PURE__ */ i.jsx(
            xn,
            {
              label: t("generationCommon.cameraMove.shot"),
              value: a.shot,
              options: ao.map((d) => ({ value: d, label: h(d) })),
              onChange: (d) => s((x) => ({ ...x, shot: d }))
            }
          ),
          /* @__PURE__ */ i.jsxs(
            "button",
            {
              type: "button",
              disabled: !0,
              "aria-disabled": "true",
              title: t("generationCommon.cameraMove.overlayHint"),
              className: g(
                "inline-flex items-center justify-center gap-1 h-7 rounded-pill border border-dashed border-nomi-line",
                "text-caption text-nomi-ink-40 self-start px-3 cursor-not-allowed opacity-70"
              ),
              onClick: (d) => d.stopPropagation(),
              children: [
                /* @__PURE__ */ i.jsx(Oo, { size: 12, stroke: 1.6, "aria-hidden": !0 }),
                t("generationCommon.cameraMove.addLayer"),
                /* @__PURE__ */ i.jsx("span", { className: g("text-micro text-nomi-ink-40"), children: t("generationCommon.cameraMove.comingSoon") })
              ]
            }
          ),
          /* @__PURE__ */ i.jsxs("div", { className: g("flex items-center gap-2 pt-1 border-t border-nomi-line-soft"), children: [
            /* @__PURE__ */ i.jsx("span", { className: g("flex-1 text-micro text-nomi-ink-60 leading-[1.35]"), children: t("generationCommon.cameraMove.readout", {
              move: f(a.move),
              speed: m(a.speed),
              duration: u
            }) }),
            /* @__PURE__ */ i.jsx(
              "button",
              {
                type: "button",
                className: g(
                  "shrink-0 inline-flex items-center h-7 px-3 rounded-pill",
                  "bg-nomi-accent text-nomi-paper text-caption font-medium cursor-pointer",
                  "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-nomi-accent"
                ),
                onClick: M,
                children: t("generationCommon.cameraMove.apply")
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function yn(e) {
  return e.match(/[A-Za-z0-9]+|[一-鿿]|\s+|[^\sA-Za-z0-9]/g) || [];
}
function Ha(e, t) {
  const n = yn(e), o = yn(t), r = n.length, a = o.length, s = Array.from({ length: r + 1 }, () => new Array(a + 1).fill(0));
  for (let p = r - 1; p >= 0; p--)
    for (let u = a - 1; u >= 0; u--)
      s[p][u] = n[p] === o[u] ? s[p + 1][u + 1] + 1 : Math.max(s[p + 1][u], s[p][u + 1]);
  const c = [], f = (p, u) => {
    const v = c[c.length - 1];
    v && v.added === u ? v.text += p : c.push({ text: p, added: u });
  };
  let m = 0, h = 0;
  for (; h < a; )
    m < r && n[m] === o[h] ? (f(o[h], !1), m++, h++) : m < r && s[m + 1][h] >= s[m][h + 1] ? m++ : (f(o[h], !0), h++);
  return c;
}
function Wa(e, t, n) {
  const o = ee.t(n ? "generationCommon.optimizer.videoKind" : "generationCommon.optimizer.imageKind");
  return [
    ee.t("generationCommon.optimizer.intro", {
      kind: o,
      resultType: ee.t(n ? "generationCommon.optimizer.videoResult" : "generationCommon.optimizer.imageResult")
    }),
    `"""
${e || ee.t("generationCommon.optimizer.blank")}
"""`,
    t ? ee.t("generationCommon.optimizer.idea", { idea: t }) : "",
    ee.t(n ? "generationCommon.optimizer.videoDetails" : "generationCommon.optimizer.imageDetails"),
    ee.t("generationCommon.optimizer.outputRule")
  ].filter(Boolean).join(`
`);
}
function Ga({ node: e, isVideo: t }) {
  const { t: n } = ye(), [o, r] = b.useState(!1), [a, s] = b.useState(""), [c, f] = b.useState(!1), [m, h] = b.useState(null), [p, u] = b.useState(""), [v, M] = b.useState(null), d = b.useRef(""), x = b.useRef(null), K = b.useCallback(() => {
    u(""), M(null), h(null);
  }, []), S = b.useCallback(async () => {
    f(!0), h(null), M(null), u(""), d.current = e.prompt || "";
    const N = new AbortController();
    x.current = N;
    try {
      const U = await Lo();
      if (!U) {
        h(n("generationCommon.optimizer.configureTextModel"));
        return;
      }
      const Y = Wa(d.current, a.trim(), t);
      let A = "";
      await Do(
        U.vendor,
        { kind: "prompt_refine", prompt: Y, extras: { modelKey: U.modelKey } },
        {
          signal: N.signal,
          onDelta: (I) => {
            A += I, u(A);
          }
        }
      );
      const j = A.trim();
      j ? M(j) : h(n("generationCommon.optimizer.emptyResult"));
    } catch (U) {
      if (U instanceof DOMException && U.name === "AbortError") return;
      h(U instanceof Error ? U.message : n("generationCommon.optimizer.failed"));
    } finally {
      f(!1), x.current = null;
    }
  }, [e.prompt, a, t, n]), w = b.useCallback(() => {
    v && (ne.getState().updateNode(e.id, { prompt: v }), Vr([{
      kind: "prompt_refine",
      title: e.title || (t ? "视频提示词优化" : "图片提示词优化"),
      prompt: v
    }]).catch(() => {
    }), r(!1), s(""), K());
  }, [v, e.id, e.title, t, K]), D = b.useCallback(() => {
    if (c) {
      x.current?.abort();
      return;
    }
    r((N) => (N && K(), !N));
  }, [c, K]), q = v != null ? Ha(d.current, v) : null;
  return /* @__PURE__ */ i.jsxs("div", { className: g("relative ml-auto"), children: [
    o ? /* @__PURE__ */ i.jsxs(
      "div",
      {
        className: g(
          "absolute bottom-full right-0 mb-2 w-[280px] z-10",
          "bg-nomi-paper border border-nomi-line rounded-nomi shadow-nomi-md p-2.5"
        ),
        children: [
          /* @__PURE__ */ i.jsxs("div", { className: g("flex items-center gap-1.5 mb-2 text-caption text-nomi-ink-60"), children: [
            /* @__PURE__ */ i.jsx(Dt, { size: 14 }),
            v != null ? n("generationCommon.optimizer.optimizedTitle") : n("generationCommon.optimizer.ideaTitle")
          ] }),
          v != null ? /* @__PURE__ */ i.jsxs(i.Fragment, { children: [
            /* @__PURE__ */ i.jsx(
              "div",
              {
                className: g(
                  "max-h-[160px] overflow-y-auto rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2 py-1.5 text-body-sm leading-relaxed text-nomi-ink"
                ),
                children: q.map((N, U) => /* @__PURE__ */ i.jsx(
                  "span",
                  {
                    className: N.added ? g("bg-nomi-accent-soft text-nomi-accent rounded-nomi-sm px-px") : void 0,
                    children: N.text
                  },
                  U
                ))
              }
            ),
            /* @__PURE__ */ i.jsxs("div", { className: g("mt-2 flex gap-2"), children: [
              /* @__PURE__ */ i.jsx(it, { variant: "primary", className: "flex-1", onClick: w, children: n("generationCommon.optimizer.apply") }),
              /* @__PURE__ */ i.jsx(it, { variant: "default", onClick: () => {
                S();
              }, children: n("generationCommon.optimizer.retry") })
            ] })
          ] }) : c ? /* @__PURE__ */ i.jsx(
            "div",
            {
              className: g(
                "rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2 py-1.5 min-h-[52px] text-body-sm leading-relaxed text-nomi-ink-80 whitespace-pre-wrap"
              ),
              children: p || n("generationCommon.optimizer.optimizing")
            }
          ) : /* @__PURE__ */ i.jsxs(i.Fragment, { children: [
            /* @__PURE__ */ i.jsx(
              "textarea",
              {
                className: g(
                  "w-full h-[52px] resize-none rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2 py-1.5",
                  "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40 outline-none focus:border-nomi-accent"
                ),
                value: a,
                placeholder: n("generationCommon.optimizer.placeholder"),
                "aria-label": n("generationCommon.optimizer.ideaAria"),
                onChange: (N) => s(N.currentTarget.value),
                onKeyDown: (N) => {
                  N.key === "Enter" && (N.metaKey || N.ctrlKey) && S();
                }
              }
            ),
            m ? /* @__PURE__ */ i.jsx("div", { className: g("mt-1.5 text-micro text-workbench-danger"), children: m }) : null,
            /* @__PURE__ */ i.jsx(it, { variant: "primary", className: "mt-2 w-full", onClick: () => {
              S();
            }, children: n("generationCommon.optimizer.optimizePrompt") })
          ] })
        ]
      }
    ) : null,
    /* @__PURE__ */ i.jsxs(
      it,
      {
        variant: "default",
        "aria-label": n("generationCommon.optimizer.aria"),
        title: n("generationCommon.optimizer.aria"),
        onClick: D,
        children: [
          o ? /* @__PURE__ */ i.jsx(To, { size: 14, stroke: 1.6 }) : /* @__PURE__ */ i.jsx(Dt, { size: 14 }),
          n(c ? "generationCommon.optimizer.running" : "generationCommon.optimizer.optimize")
        ]
      }
    )
  ] });
}
function Et(e, t, n) {
  const o = ne.getState(), r = o.nodes.find((f) => f.id === e);
  if (!r) return { status: "no-slot" };
  const a = r.meta || {}, s = Fo(In(a), t);
  if (!s) return { status: "no-slot" };
  const c = _n(a, s, n);
  return c.status === "full" ? { status: "full", max: s.max, label: s.label } : c.status !== "added" ? { status: c.status } : (o.updateNode(e, { meta: { ...a, [s.metaKey]: c.next } }), { status: "added" });
}
function vn(e) {
  e.status === "full" ? Ee(ee.t("generationCommon.node.assetDrop.full", { max: e.max, label: e.label })) : e.status === "no-slot" && Ee(ee.t("generationCommon.node.assetDrop.noSlot"));
}
function qa(e) {
  const [t, n] = b.useState(!1), [o, r] = b.useState(!1), a = b.useMemo(() => In(e.meta).length > 0, [e.meta]), s = b.useCallback(
    (m) => {
      if (!a) return;
      const h = Array.from(m.dataTransfer.types || []);
      !h.includes("Files") && !h.includes(Gt) || (m.preventDefault(), m.stopPropagation(), m.dataTransfer.dropEffect = "copy", n(!0));
    },
    [a]
  ), c = b.useCallback((m) => {
    m.currentTarget.contains(m.relatedTarget) || n(!1);
  }, []), f = b.useCallback(
    async (m) => {
      if (!a) return;
      m.preventDefault(), m.stopPropagation(), n(!1);
      const h = m.dataTransfer, p = Ur(h.getData(Gt));
      if (p) {
        const v = Ko(p.kind);
        if (!v) {
          Ee(ee.t("generationCommon.node.assetDrop.noSlot"));
          return;
        }
        vn(
          Et(e.id, v, $r(p.projectId, p.relativePath))
        );
        return;
      }
      const u = Array.from(h.files || []);
      if (u.length) {
        r(!0);
        try {
          for (const v of u) {
            const M = Vo(v);
            if (!M) {
              Ee(ee.t("generationCommon.node.assetDrop.unsupported"));
              continue;
            }
            try {
              const d = await lt(
                v,
                v.name || ee.t("generationCommon.node.assetDrop.defaultName"),
                {
                  ownerNodeId: e.id,
                  taskKind: "image_edit"
                }
              ), x = ut(d);
              if (!x) throw new Error(ee.t("generationCommon.node.assetDrop.missingUrl"));
              vn(Et(e.id, M, x));
            } catch (d) {
              Ee(
                d instanceof Error ? d.message : ee.t("generationCommon.node.assetDrop.uploadFailed")
              );
            }
          }
        } finally {
          r(!1);
        }
      }
    },
    [a, e.id]
  );
  return { acceptsDrop: a, isDragOver: t, isUploading: o, dropHandlers: { onDragOver: s, onDragLeave: c, onDrop: f } };
}
const Xa = [
  { value: "append", labelKey: "composer.append" },
  { value: "rewrite", labelKey: "composer.rewrite" },
  { value: "replace", labelKey: "composer.replace" }
], Ya = {
  append: "composer.appendPlaceholder",
  rewrite: "composer.rewritePlaceholder",
  replace: "composer.replacePlaceholder"
}, Za = 48, Ja = 245, Qa = 240, kt = 310, Ve = 12, kn = 296, es = 4, wn = 380;
function ts(e, t, n) {
  const o = n === "video" ? 460 : 400, r = e >= 420 ? 14 : 10;
  return { maxHeight: o, gap: r };
}
function ns({
  items: e,
  position: t,
  onSelect: n,
  setNodeRef: o
}) {
  const { t: r } = ye(), [a, s] = b.useState(null), [c, f] = b.useState(0), [m, h] = b.useState(0), p = b.useRef(null), u = a ? e.find((d) => d.id === a) ?? null : null, v = u?.referenceImages ?? [], M = b.useCallback((d, x) => {
    s(d);
    const S = x.closest('[data-prompt-picker-root="true"]')?.getBoundingClientRect(), w = x.getBoundingClientRect(), D = S ? w.top - S.top + w.height / 2 : w.height / 2, q = e.find((j) => j.id === d), N = q?.referenceImages.length ? 1 : 0, U = kn - 16, Y = q?.prompt ? 118 : 0, A = Math.min(
      wn,
      16 + N * (U * 9 / 16) + Y
    );
    h(D), f(D - A / 2);
  }, [e]);
  return b.useLayoutEffect(() => {
    if (v.length === 0) return;
    const d = p.current;
    d && f(m - d.getBoundingClientRect().height / 2);
  }, [v.length, m]), !t || typeof document > "u" ? null : Sn.createPortal(
    /* @__PURE__ */ i.jsxs(
      Go.div,
      {
        ref: o,
        "data-prompt-picker-root": "true",
        className: "fixed z-[80] overflow-visible",
        style: { left: t.left, top: t.top, width: t.width, transformOrigin: "top right" },
        initial: { opacity: 0, y: -6, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.98 },
        transition: { type: "spring", stiffness: 420, damping: 34, mass: 0.7 },
        role: "menu",
        "aria-label": r("generationCommon.composer.promptLibrary"),
        onPointerDown: (d) => d.stopPropagation(),
        onMouseLeave: () => s(null),
        children: [
          /* @__PURE__ */ i.jsx("div", { className: "max-h-[310px] overflow-hidden rounded-nomi bg-nomi-paper shadow-nomi-lg", children: /* @__PURE__ */ i.jsx("div", { className: "min-w-0 overflow-y-auto py-1", children: e.length === 0 ? /* @__PURE__ */ i.jsx("div", { className: "grid min-h-24 place-items-center px-4 text-center text-caption text-nomi-ink-40", children: r("generationCommon.composer.emptyPromptLibrary") }) : e.map((d) => /* @__PURE__ */ i.jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: g(
                "grid w-full min-w-0 grid-cols-[32px_minmax(0,1fr)] items-center gap-2 border-0 bg-transparent px-2.5 py-1.5 text-left",
                "cursor-pointer transition-colors duration-[var(--nomi-transition-fast)]",
                "text-nomi-ink-70 hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              onMouseEnter: (x) => M(d.id, x.currentTarget),
              onFocus: (x) => M(d.id, x.currentTarget),
              onClick: () => n(d),
              children: [
                d.referenceImages[0]?.url ? /* @__PURE__ */ i.jsx(
                  "img",
                  {
                    src: d.referenceImages[0].url,
                    alt: "",
                    draggable: !1,
                    className: "block size-8 rounded-nomi-sm object-cover"
                  }
                ) : /* @__PURE__ */ i.jsx("span", { className: "grid size-8 place-items-center rounded-nomi-sm bg-nomi-bg text-nomi-ink-35", children: /* @__PURE__ */ i.jsx(zn, { size: 15, stroke: 1.6, "aria-hidden": "true" }) }),
                /* @__PURE__ */ i.jsx("span", { className: "block min-w-0 overflow-hidden whitespace-nowrap text-caption leading-none", children: d.prompt })
              ]
            },
            d.id
          )) }) }),
          v.length > 0 ? /* @__PURE__ */ i.jsx(
            "aside",
            {
              ref: p,
              className: "absolute left-full overflow-hidden rounded-nomi bg-nomi-paper p-2 shadow-nomi-lg",
              style: {
                top: c,
                marginLeft: es,
                width: kn,
                maxHeight: wn
              },
              children: /* @__PURE__ */ i.jsxs("div", { className: "grid gap-2", children: [
                v.slice(0, 1).map((d, x) => /* @__PURE__ */ i.jsx(
                  "div",
                  {
                    className: "overflow-hidden rounded-nomi-sm bg-nomi-paper shadow-nomi-sm",
                    children: /* @__PURE__ */ i.jsx("img", { src: d.url, alt: "", draggable: !1, className: "block aspect-video w-full object-cover" })
                  },
                  `${d.url}-${x}`
                )),
                u?.prompt ? /* @__PURE__ */ i.jsx("div", { className: "overflow-hidden rounded-nomi-sm bg-nomi-bg/70 px-2 py-1.5 text-caption leading-snug text-nomi-ink-70 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] [overflow-wrap:anywhere]", children: u.prompt }) : null
              ] })
            }
          ) : null
        ]
      }
    ),
    document.body
  );
}
function Ms({ node: e, visualSize: t }) {
  const { t: n } = ye(), o = ne((R) => R.updateNode), r = e.status || "idle", a = r === "queued" || r === "running", s = !!e.result?.url, c = Nn(e.kind), f = ne(
    (R) => Kt(e, { nodes: R.nodes, edges: R.edges })
  ) && !a, h = ne(
    (R) => en(e.id, { nodes: R.nodes, edges: R.edges }).join(",")
  ).length > 0, p = f || h && !a, u = ts(t.width, t.height, e.kind), v = e.kind === "text", M = En(e.kind), x = b.useMemo(() => {
    if (!M) return null;
    const R = e.meta || {}, P = dt({
      modelKey: typeof R.modelKey == "string" ? R.modelKey : void 0,
      modelAlias: typeof R.modelAlias == "string" ? R.modelAlias : void 0,
      vendorKey: typeof R.modelVendor == "string" ? R.modelVendor : typeof R.vendor == "string" ? R.vendor : null,
      meta: R
    });
    return P ? _t(P, R) : null;
  }, [M, e.meta])?.transportTaskKind === "transcribe", K = fr(e), S = !!c && !x && !v, w = jn(e.kind) || wt(e.kind) || M, [D, q] = b.useState(null), [N, U] = b.useState(!1), [Y, A] = b.useState([]), [j, I] = b.useState(1), [T, F] = b.useState(null), E = b.useRef(null), Z = b.useRef(null), { acceptsDrop: y, isDragOver: J, isUploading: z, dropHandlers: _ } = qa(e), B = ne((R) => R.nodes), O = ne((R) => R.edges), V = b.useMemo(() => {
    const R = Ct(e, B, O).find((P) => P.slotKind === "image_ref");
    return R ? R.fills.flatMap((P) => P.url ? [P.url] : []) : [];
  }, [e, B, O]), X = b.useCallback((R) => {
    if (!D || D.isDestroyed) return;
    const P = V.indexOf(R);
    D.commands.insertAssetMention(R, P >= 0 ? P + 1 : void 0);
  }, [V, D]), de = b.useCallback(() => {
    Uo().then((R) => {
      A(R.map((P) => ({
        id: P.id,
        title: P.title,
        prompt: P.prompt,
        promptType: P.promptType,
        referenceImages: P.referenceImages ?? []
      })));
    }).catch(() => A([]));
  }, []), me = b.useCallback(() => {
    const R = E.current;
    if (!R || typeof window > "u") return;
    const P = R.getBoundingClientRect(), ae = window.innerWidth, le = window.innerHeight, xe = ae - Ve * 2, ve = Math.max(
      Qa,
      Math.min(Ja, xe)
    ), Q = ae - ve - Ve, De = Math.max(
      Ve,
      Math.min(P.right - ve, Q)
    ), je = P.bottom + 8, qe = P.top - kt - 8, Te = je + kt <= le - Ve ? je : Math.max(Ve, Math.min(qe, le - kt - Ve));
    F({ left: De, top: Te, width: ve });
  }, []);
  b.useEffect(() => {
    if (!N) return;
    const R = (ae) => {
      const le = ae.target;
      le && E.current?.contains(le) || le && Z.current?.contains(le) || U(!1);
    }, P = (ae) => {
      ae.key === "Escape" && U(!1);
    };
    return window.addEventListener("pointerdown", R, { capture: !0 }), window.addEventListener("keydown", P), () => {
      window.removeEventListener("pointerdown", R, { capture: !0 }), window.removeEventListener("keydown", P);
    };
  }, [N]), b.useLayoutEffect(() => {
    if (!N || typeof window > "u") return;
    me();
    const R = window.requestAnimationFrame(me), P = () => me();
    return window.addEventListener("resize", P), window.addEventListener("scroll", P, !0), () => {
      window.cancelAnimationFrame(R), window.removeEventListener("resize", P), window.removeEventListener("scroll", P, !0);
    };
  }, [N, me]);
  const ge = b.useCallback((R) => {
    if (R.stopPropagation(), N) {
      U(!1);
      return;
    }
    de(), me(), U(!0);
  }, [de, N, me]), Ce = b.useCallback(
    (R) => {
      if (e.locked) return;
      D && !D.isDestroyed && (D.commands.setContent(St(R.prompt, V)), D.commands.focus("end")), o(e.id, { prompt: R.prompt });
      const P = R.referenceImages.map((ae) => ae.url).filter(Boolean);
      if (P.length) {
        const ae = ne.getState(), le = ae.nodes.find((Q) => Q.id === e.id), xe = le ? $o(le) : null;
        if (le && xe) {
          const Q = Bo(
            xe,
            le.meta || {},
            [{ slots: ["image_ref"], asset: "image" }]
          );
          Q && ae.updateNode(e.id, {
            meta: mt(le.meta || {}, xe, Q)
          });
        }
        P.map((Q) => Et(e.id, "image", Q)).every((Q) => Q.status === "no-slot") && Pn(n("generationCommon.composer.promptReferenceUnsupported"), "info");
      }
      U(!1), Tt().catch(() => {
      });
    },
    [V, e.id, e.locked, D, n, o]
  ), he = async (R) => {
    R.stopPropagation();
    const P = ne.getState(), ae = en(e.id, { nodes: P.nodes, edges: P.edges });
    if (ae.length > 0) {
      const le = yr([...ae, e.id], { nodes: P.nodes, edges: P.edges });
      vr.getState().open(le);
      return;
    }
    if (Kt(e, { nodes: P.nodes, edges: P.edges })) {
      if (j > 1) {
        await gr(e.id, j);
        return;
      }
      s ? await hr(e.id) : await br(e.id);
    }
  }, be = ne((R) => R.canvasZoom), pe = ne((R) => R.canvasOffset), Oe = b.useRef(null), [Se, Ge] = b.useState(!1), [Pe, fe] = b.useState(!1), [Le, se] = b.useState({ x: 0, y: 0 }), te = b.useRef(null), [ie, Qe] = b.useState(0), [et, gt] = b.useState(0);
  return b.useLayoutEffect(() => {
    const R = Oe.current, P = R?.closest(".generation-canvas-v2__stage"), ae = R?.parentElement;
    if (!R || !P || !ae) return;
    const le = () => {
      const ve = P.getBoundingClientRect(), Q = ae.getBoundingClientRect();
      if (Pe) {
        const W = te.current, Me = Q.left + Q.width / 2, ot = W && W.zoom === be && W.offsetX === pe.x && W.offsetY === pe.y && W.posX === (e.position?.x ?? 0) && W.posY === (e.position?.y ?? 0), Fe = W?.flipUp ?? Se ? Q.top : Q.bottom;
        if (!ot) {
          te.current = {
            edgeY: Fe,
            centerX: Me,
            zoom: be,
            offsetX: pe.x,
            offsetY: pe.y,
            posX: e.position?.x ?? 0,
            posY: e.position?.y ?? 0,
            flipUp: Se
          }, se((Ne) => Ne.x || Ne.y ? { x: 0, y: 0 } : Ne);
          return;
        }
        se({ x: Math.round(W.centerX - Me), y: Math.round(W.edgeY - Fe) });
        return;
      }
      te.current = null, se((W) => W.x || W.y ? { x: 0, y: 0 } : W);
      const De = (R.offsetHeight || 280) + u.gap * be, je = ve.bottom - Q.bottom, qe = Q.top - ve.top;
      Ge(
        (W) => W ? !(je > De + Za) : je < De && qe > je
      );
      const Te = ae.querySelector(".generation-canvas-v2-node__floating-toolbar"), tt = Te ? Te.getBoundingClientRect().height : 0;
      Qe(tt > 0 ? tt / (be || 1) + 18 : 0);
      const nt = 12, l = R.offsetWidth, k = Q.left + Q.width / 2, C = k - l / 2, L = k + l / 2, re = ve.left + nt, G = ve.right - nt;
      let H = 0;
      L > G && (H = G - L), C + H < re && (H = re - C), gt(Math.round(H));
    };
    le();
    const xe = new ResizeObserver(le);
    return xe.observe(R), () => xe.disconnect();
  }, [be, pe, e.position?.x, e.position?.y, t.width, t.height, u.gap, e.result?.url, Pe, Se]), // 外层只做定位锚（不裁剪），宽度跟随内层卡（w-max 包住按内容长开的卡，便于 -translate-x-1/2 居中）。
  /* @__PURE__ */ i.jsxs(
    "div",
    {
      ref: Oe,
      className: g("generation-canvas-v2-node__composer", "absolute left-1/2 z-[8] w-max"),
      "data-flipped": Se ? "true" : "false",
      style: {
        // 用户反馈③：反向缩放抵消画布 scale(zoom) → 面板恒定屏幕尺寸（缩小画布只缩上面的卡片框，
        // 不缩这个参数框）。横向居中的 -translate-x-1/2 改写进 transform（否则被 scale 覆盖）。
        // transform-origin 贴住与节点相连的那条边（默认朝下=顶边、翻上=底边），缩放时锚点不漂移。
        // 最左的 translateX(shiftX px) 在屏幕空间生效（不被 scale 缩）→ 横向夹取把溢出视口的宽卡拉回。
        // freezeShift 在最前（屏幕空间）：参数面板打开期间抵消节点变形位移，composer 钉在原地。
        transform: `translate(${Le.x}px, ${Le.y}px) translateX(${et}px) translateX(-50%) scale(${1 / (be || 1)})`,
        transformOrigin: Se ? "bottom center" : "top center",
        ...Se ? { bottom: `calc(100% + ${u.gap + ie}px)` } : { top: `calc(100% + ${u.gap}px)` },
        cursor: "default",
        userSelect: "auto",
        touchAction: "auto"
      },
      onPointerDown: (R) => R.stopPropagation(),
      ...y ? _ : {},
      children: [
        /* @__PURE__ */ i.jsxs(
          "div",
          {
            className: g(
              "generation-canvas-v2-node__composer-card",
              "relative flex flex-col gap-2.5 p-3 min-h-[150px] min-w-[360px] max-w-[880px] w-max",
              // 宽度内容驱动（w-max）：按底栏一行(锁+参数+生成钮)的真实宽长开，参数少则窄、多则宽，不塌不爆、不换行。
              // max-w-[880px] 兜底：现有最宽是 apimart Seedance 7 控件(model+变体+比例+清晰度+时长+seed+生成音频)
              // ≈810px，880 留头不触发截断；纯防极端（防 omni 模式参考槽行等异常撑爆）。实测 2026-06-16 校准。
              "border border-nomi-line rounded-nomi bg-nomi-paper overflow-hidden shadow-nomi-md",
              "transition-[outline-color] duration-150",
              J && "outline-2 outline-dashed outline-nomi-accent outline-offset-[-2px]"
            ),
            style: { maxHeight: u.maxHeight, cursor: "default", userSelect: "auto", touchAction: "auto" },
            children: [
              w || S ? /* @__PURE__ */ i.jsxs("div", { className: g("flex w-0 min-w-full items-start gap-3"), children: [
                w ? /* @__PURE__ */ i.jsx("div", { className: g("min-w-0 flex-1"), children: /* @__PURE__ */ i.jsx(bn, { node: e, section: "references", onInsertMention: X }) }) : null,
                S ? /* @__PURE__ */ i.jsxs(
                  "button",
                  {
                    ref: E,
                    type: "button",
                    className: g(
                      "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-nomi-sm border-0 bg-transparent px-2",
                      "cursor-pointer text-nomi-ink-45 transition-[background,color,transform] duration-[var(--nomi-transition-fast)]",
                      "hover:-translate-y-0.5 hover:bg-nomi-ink-05 hover:text-nomi-accent",
                      N && "bg-nomi-ink-05 text-nomi-accent",
                      e.locked && "cursor-not-allowed opacity-45 hover:translate-y-0 hover:bg-transparent hover:text-nomi-ink-45"
                    ),
                    "aria-label": n("generationCommon.composer.openPromptLibrary"),
                    "aria-haspopup": "menu",
                    "aria-expanded": N,
                    title: n("generationCommon.composer.promptLibrary"),
                    disabled: e.locked,
                    onClick: ge,
                    children: [
                      /* @__PURE__ */ i.jsx(zn, { size: 15, stroke: 1.8, "aria-hidden": "true" }),
                      /* @__PURE__ */ i.jsx("span", { className: "text-caption font-medium leading-none", children: n("generationCommon.composer.prompt") })
                    ]
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ i.jsx(Ho, { initial: !1, children: S && N ? /* @__PURE__ */ i.jsx(
                ns,
                {
                  items: Y,
                  position: T,
                  onSelect: Ce,
                  setNodeRef: (R) => {
                    Z.current = R;
                  }
                },
                "browser-prompt-picker"
              ) : null }),
              w ? (
                // 样张 v4 .divider：参考区与描述之间一条极淡分隔线
                /* @__PURE__ */ i.jsx("div", { className: g("h-px bg-nomi-line-soft") })
              ) : null,
              v ? /* @__PURE__ */ i.jsx("div", { className: g("flex items-center gap-1"), role: "group", "aria-label": n("generationCommon.composer.generationMode"), children: Xa.map((R) => /* @__PURE__ */ i.jsx(
                "button",
                {
                  type: "button",
                  "data-active": K === R.value ? "true" : "false",
                  onClick: (P) => {
                    P.stopPropagation(), o(e.id, { meta: { ...e.meta || {}, textGenMode: R.value } });
                  },
                  className: g(
                    "h-[22px] rounded-full px-2.5 text-micro font-medium",
                    "text-nomi-ink-60 hover:bg-nomi-ink-05",
                    "data-[active=true]:bg-nomi-accent-soft data-[active=true]:text-nomi-accent"
                  ),
                  children: n(`generationCommon.${R.labelKey}`)
                },
                R.value
              )) }) : null,
              x || v ? null : (
                // w-0 min-w-full：填满卡宽但**贡献 0** 到 max-content（长 prompt 在卡宽内换行，不把卡撑爆 → 卡宽由底栏定）。
                // overflow-y-auto 直接挂在 flex-1 伸缩区上：该区高度被卡片 maxHeight 卡住后有界 → 超长 prompt 在本区内部
                // 滚动，底栏（shrink-0）永远贴底可见。min-h-[72px] 保底 3 行。
                // ⚠️ 别再往里套「无高度约束的内层块 + overflow-y-auto」：那样内层块按内容长到全高、滚动永不触发，
                // 整片 prompt 下溢盖住底栏（= 截图里「文字太长盖住 选择模型/优化」的根因）。滚动容器必须自己有界。
                // 用 overflow-y-auto 而非 overflow-auto：卡宽已被 w-0 min-w-full 锁死、prompt 在卡宽内换行，横向永不溢出，明确关掉横向滚动条。
                /* @__PURE__ */ i.jsx(
                  "div",
                  {
                    className: g("relative flex-1 min-h-[72px] w-0 min-w-full overflow-y-auto"),
                    style: { cursor: e.locked ? "default" : "text", userSelect: e.locked ? "auto" : "text" },
                    children: /* @__PURE__ */ i.jsx(
                      Si,
                      {
                        className: g("min-h-[72px]"),
                        value: e.prompt || "",
                        placeholder: v ? n(`generationCommon.${Ya[K]}`) : Wo(e.kind),
                        editable: !e.locked,
                        onChange: (R) => o(e.id, { prompt: R }),
                        onBlur: () => {
                          Tt().catch(() => {
                          });
                        },
                        onReady: q,
                        mentionCandidates: V
                      }
                    )
                  }
                )
              ),
              /* @__PURE__ */ i.jsxs("div", { className: g("flex items-center gap-2 mt-auto pt-1 shrink-0 w-full"), children: [
                /* @__PURE__ */ i.jsx(La, { nodeId: e.id, locked: e.locked, selected: !0 }),
                /* @__PURE__ */ i.jsx(bn, { node: e, section: "parameters", onParamPanelOpenChange: fe }),
                wt(e.kind) && !e.locked ? /* @__PURE__ */ i.jsx(Ba, { node: e }) : null,
                (c === "image" || c === "video") && !e.locked ? /* @__PURE__ */ i.jsx(Ga, { node: e, isVideo: c === "video" }) : null,
                (c === "image" || c === "video") && !e.locked ? /* @__PURE__ */ i.jsxs(
                  "button",
                  {
                    type: "button",
                    className: g(
                      "inline-flex h-7 shrink-0 items-center rounded-full border border-nomi-line bg-transparent px-2.5",
                      "cursor-pointer text-caption text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05",
                      "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                      j > 1 && "border-nomi-accent text-nomi-accent"
                    ),
                    "aria-label": n("generationCommon.composer.variantCountAria"),
                    title: n("generationCommon.composer.variantCountTitle", { count: j }),
                    disabled: a,
                    onClick: (R) => {
                      R.stopPropagation(), I((P) => P === 1 ? 2 : P === 2 ? 4 : 1);
                    },
                    children: [
                      "×",
                      j
                    ]
                  }
                ) : null,
                (() => {
                  const P = (!p && !a ? c === "video" ? n(y ? "generationCommon.composer.videoReferenceRequired" : "generationCommon.composer.videoFirstFrameRequired") : c === "image" ? n(y ? "generationCommon.composer.imageReferenceRequired" : "generationCommon.composer.imageConnectionRequired") : n("generationCommon.composer.unsupportedKind", { kind: e.kind }) : void 0) ?? n(a ? "generationCommon.composer.generating" : h ? "generationCommon.composer.generateReferencesFirst" : s ? "generationCommon.composer.regenerate" : "generationCommon.composer.generate");
                  return /* @__PURE__ */ i.jsx("span", { title: P, style: { display: "contents" }, children: /* @__PURE__ */ i.jsx(
                    "button",
                    {
                      type: "button",
                      className: g(Oa, "ml-auto"),
                      "aria-label": n(s ? "generationCommon.composer.regenerate" : "generationCommon.composer.generateAsset"),
                      disabled: !p,
                      onClick: he,
                      children: a ? "···" : "↑"
                    }
                  ) });
                })()
              ] })
            ]
          }
        ),
        J ? /* @__PURE__ */ i.jsx(
          "div",
          {
            className: g(
              "generation-canvas-v2-node__composer-dropzone",
              "absolute inset-0 z-[10] flex items-center justify-center rounded-nomi",
              "bg-nomi-paper/[0.7] pointer-events-none"
            ),
            "aria-hidden": "true",
            children: /* @__PURE__ */ i.jsxs("span", { className: g("inline-flex items-center gap-1.5 text-caption text-nomi-ink-60"), children: [
              z ? /* @__PURE__ */ i.jsx(Cn, { size: 14, label: n("generationCommon.composer.uploading") }) : null,
              n(z ? "generationCommon.composer.uploadingEllipsis" : "generationCommon.composer.dropToAddReference")
            ] })
          }
        ) : null
      ]
    }
  );
}
export {
  Ms as default
};
