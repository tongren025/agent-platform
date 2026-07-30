import { aU as A, b8 as b, e1 as P, ci as n, c as R, e4 as G, aV as D, bK as T, bM as V, dZ as $, bt as L, bP as q, aL as h, e6 as z } from "./agentStudioMount-CX1GI_dE.js";
import { u as I } from "./use-resolved-styles-api-C5W5zwhh.js";
import { g as M } from "./get-auto-contrast-value-BGSSZ1GD.js";
const [U, _] = A(
  "Progress.Root component was not found in tree"
);
var p = { root: "m_db6d6462", section: "m_2242eb65", "stripes-animation": "m_81a374bd", label: "m_91e40b74" };
const k = {}, E = b((s, t) => {
  const { classNames: e, className: o, style: a, styles: i, vars: g, ...r } = P(
    "ProgressLabel",
    k,
    s
  ), l = _();
  return /* @__PURE__ */ n.jsx(
    R,
    {
      ref: t,
      ...l.getStyles("label", { className: o, style: a, classNames: e, styles: i }),
      ...r
    }
  );
});
E.classes = p;
E.displayName = "@mantine/core/ProgressLabel";
const B = {}, K = D(
  (s, { size: t, radius: e, transitionDuration: o }) => ({
    root: {
      "--progress-size": V(t, "progress-size"),
      "--progress-radius": e === void 0 ? void 0 : T(e),
      "--progress-transition-duration": typeof o == "number" ? `${o}ms` : void 0
    }
  })
), y = b((s, t) => {
  const e = P("ProgressRoot", B, s), {
    classNames: o,
    className: a,
    style: i,
    styles: g,
    unstyled: r,
    vars: l,
    autoContrast: c,
    transitionDuration: v,
    ...u
  } = e, d = G({
    name: "Progress",
    classes: p,
    props: e,
    className: a,
    style: i,
    classNames: o,
    styles: g,
    unstyled: r,
    vars: l,
    varsResolver: K
  });
  return /* @__PURE__ */ n.jsx(U, { value: { getStyles: d, autoContrast: c }, children: /* @__PURE__ */ n.jsx(R, { ref: t, ...d("root"), ...u }) });
});
y.classes = p;
y.displayName = "@mantine/core/ProgressRoot";
const O = {
  withAria: !0
}, N = b((s, t) => {
  const {
    classNames: e,
    className: o,
    style: a,
    styles: i,
    vars: g,
    value: r,
    withAria: l,
    color: c,
    striped: v,
    animated: u,
    mod: d,
    ...C
  } = P("ProgressSection", O, s), f = _(), x = $(), j = l ? {
    role: "progressbar",
    "aria-valuemax": 100,
    "aria-valuemin": 0,
    "aria-valuenow": r,
    "aria-valuetext": `${r}%`
  } : {};
  return /* @__PURE__ */ n.jsx(
    R,
    {
      ref: t,
      ...f.getStyles("section", { className: o, classNames: e, styles: i, style: a }),
      ...C,
      ...j,
      mod: [{ striped: v || u, animated: u }, d],
      __vars: {
        "--progress-section-width": `${r}%`,
        "--progress-section-color": q(c, x),
        "--progress-label-color": M(f.autoContrast, x) ? L({ color: c, theme: x, autoContrast: f.autoContrast }) : void 0
      }
    }
  );
});
N.classes = p;
N.displayName = "@mantine/core/ProgressSection";
const Z = {}, m = b((s, t) => {
  const e = P("Progress", Z, s), {
    value: o,
    classNames: a,
    styles: i,
    vars: g,
    color: r,
    striped: l,
    animated: c,
    "aria-label": v,
    ...u
  } = e, { resolvedClassNames: d, resolvedStyles: C } = I({
    classNames: a,
    styles: i,
    props: e
  });
  return /* @__PURE__ */ n.jsx(
    y,
    {
      ref: t,
      classNames: d,
      styles: C,
      vars: g,
      ...u,
      children: /* @__PURE__ */ n.jsx(
        N,
        {
          value: o,
          color: r,
          striped: l,
          animated: c,
          "aria-label": v
        }
      )
    }
  );
});
m.classes = p;
m.displayName = "@mantine/core/Progress";
m.Section = N;
m.Root = y;
m.Label = E;
function X({ className: s, radius: t = "sm", ...e }) {
  const o = h("tc-design-progress", s);
  return /* @__PURE__ */ n.jsx(m, { ...e, className: o, radius: t });
}
function Y({ lines: s = 1, className: t }) {
  const { t: e } = z();
  return /* @__PURE__ */ n.jsx("div", { className: h("flex flex-col gap-2"), role: "status", "aria-label": e("common.loading"), "aria-busy": "true", children: Array.from({ length: Math.max(1, s) }).map((o, a) => /* @__PURE__ */ n.jsx(
    "div",
    {
      className: h(
        "h-4 rounded-nomi-sm bg-nomi-ink-10 animate-pulse motion-reduce:animate-none",
        // 多行时末行短一截,更像真实文本块
        s > 1 && a === s - 1 ? "w-3/5" : "w-full",
        t
      )
    },
    a
  )) });
}
const F = "agent-studio:guided-production:creation", H = "agent-studio:guided-production:canvas";
let S = null, w = null;
function ss(s) {
  S = s, window.dispatchEvent(new CustomEvent(F, { detail: s }));
}
function es(s) {
  w = s, window.dispatchEvent(new CustomEvent(H, { detail: s }));
}
function ts() {
  const s = S;
  return S = null, s;
}
function os() {
  const s = w;
  return w = null, s;
}
export {
  X as D,
  H as G,
  Y as N,
  F as a,
  ts as b,
  os as c,
  ss as d,
  es as r
};
