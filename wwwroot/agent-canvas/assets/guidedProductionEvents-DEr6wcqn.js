import { aT as A, b7 as b, d_ as P, cf as n, c as R, e1 as G, aU as T, bH as D, bJ as $, dW as q, bq as V, bM as L, aK as h, e3 as z } from "./agentStudioMount-CNVmpr5A.js";
import { u as I } from "./use-resolved-styles-api-eG5ZIsuu.js";
import { g as M } from "./get-auto-contrast-value-BGSSZ1GD.js";
const [U, E] = A(
  "Progress.Root component was not found in tree"
);
var p = { root: "m_db6d6462", section: "m_2242eb65", "stripes-animation": "m_81a374bd", label: "m_91e40b74" };
const k = {}, _ = b((s, o) => {
  const { classNames: e, className: t, style: a, styles: l, vars: g, ...r } = P(
    "ProgressLabel",
    k,
    s
  ), i = E();
  return /* @__PURE__ */ n.jsx(
    R,
    {
      ref: o,
      ...i.getStyles("label", { className: t, style: a, classNames: e, styles: l }),
      ...r
    }
  );
});
_.classes = p;
_.displayName = "@mantine/core/ProgressLabel";
const B = {}, H = T(
  (s, { size: o, radius: e, transitionDuration: t }) => ({
    root: {
      "--progress-size": $(o, "progress-size"),
      "--progress-radius": e === void 0 ? void 0 : D(e),
      "--progress-transition-duration": typeof t == "number" ? `${t}ms` : void 0
    }
  })
), y = b((s, o) => {
  const e = P("ProgressRoot", B, s), {
    classNames: t,
    className: a,
    style: l,
    styles: g,
    unstyled: r,
    vars: i,
    autoContrast: c,
    transitionDuration: v,
    ...u
  } = e, d = G({
    name: "Progress",
    classes: p,
    props: e,
    className: a,
    style: l,
    classNames: t,
    styles: g,
    unstyled: r,
    vars: i,
    varsResolver: H
  });
  return /* @__PURE__ */ n.jsx(U, { value: { getStyles: d, autoContrast: c }, children: /* @__PURE__ */ n.jsx(R, { ref: o, ...d("root"), ...u }) });
});
y.classes = p;
y.displayName = "@mantine/core/ProgressRoot";
const J = {
  withAria: !0
}, N = b((s, o) => {
  const {
    classNames: e,
    className: t,
    style: a,
    styles: l,
    vars: g,
    value: r,
    withAria: i,
    color: c,
    striped: v,
    animated: u,
    mod: d,
    ...f
  } = P("ProgressSection", J, s), C = E(), x = q(), j = i ? {
    role: "progressbar",
    "aria-valuemax": 100,
    "aria-valuemin": 0,
    "aria-valuenow": r,
    "aria-valuetext": `${r}%`
  } : {};
  return /* @__PURE__ */ n.jsx(
    R,
    {
      ref: o,
      ...C.getStyles("section", { className: t, classNames: e, styles: l, style: a }),
      ...f,
      ...j,
      mod: [{ striped: v || u, animated: u }, d],
      __vars: {
        "--progress-section-width": `${r}%`,
        "--progress-section-color": L(c, x),
        "--progress-label-color": M(C.autoContrast, x) ? V({ color: c, theme: x, autoContrast: C.autoContrast }) : void 0
      }
    }
  );
});
N.classes = p;
N.displayName = "@mantine/core/ProgressSection";
const K = {}, m = b((s, o) => {
  const e = P("Progress", K, s), {
    value: t,
    classNames: a,
    styles: l,
    vars: g,
    color: r,
    striped: i,
    animated: c,
    "aria-label": v,
    ...u
  } = e, { resolvedClassNames: d, resolvedStyles: f } = I({
    classNames: a,
    styles: l,
    props: e
  });
  return /* @__PURE__ */ n.jsx(
    y,
    {
      ref: o,
      classNames: d,
      styles: f,
      vars: g,
      ...u,
      children: /* @__PURE__ */ n.jsx(
        N,
        {
          value: t,
          color: r,
          striped: i,
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
m.Label = _;
function Y({ className: s, radius: o = "sm", ...e }) {
  const t = h("tc-design-progress", s);
  return /* @__PURE__ */ n.jsx(m, { ...e, className: t, radius: o });
}
function Z({ lines: s = 1, className: o }) {
  const { t: e } = z();
  return /* @__PURE__ */ n.jsx("div", { className: h("flex flex-col gap-2"), role: "status", "aria-label": e("common.loading"), "aria-busy": "true", children: Array.from({ length: Math.max(1, s) }).map((t, a) => /* @__PURE__ */ n.jsx(
    "div",
    {
      className: h(
        "h-4 rounded-nomi-sm bg-nomi-ink-10 animate-pulse motion-reduce:animate-none",
        // 多行时末行短一截,更像真实文本块
        s > 1 && a === s - 1 ? "w-3/5" : "w-full",
        o
      )
    },
    a
  )) });
}
const O = "agent-studio:guided-production:creation", W = "agent-studio:guided-production:canvas";
let S = null, w = null;
function ss(s) {
  S = s, window.dispatchEvent(new CustomEvent(O, { detail: s }));
}
function es(s) {
  w = s, window.dispatchEvent(new CustomEvent(W, { detail: s }));
}
function os() {
  const s = S;
  return S = null, s;
}
function ts() {
  const s = w;
  return w = null, s;
}
export {
  Y as D,
  W as G,
  Z as N,
  O as a,
  os as b,
  ts as c,
  ss as d,
  es as r
};
