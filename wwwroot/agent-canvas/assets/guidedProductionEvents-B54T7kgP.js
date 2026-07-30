import { aS as A, b5 as b, dQ as P, c8 as n, c as R, dT as T, aT as D, bD as G, bF as V, dN as $, bm as q, bI as I, aJ as h, dV as L } from "./agentStudioMount-DueN8bR4.js";
import { u as z } from "./use-resolved-styles-api-BLxE6o7_.js";
import { g as k } from "./get-auto-contrast-value-BGSSZ1GD.js";
const [M, _] = A(
  "Progress.Root component was not found in tree"
);
var p = { root: "m_db6d6462", section: "m_2242eb65", "stripes-animation": "m_81a374bd", label: "m_91e40b74" };
const U = {}, E = b((s, o) => {
  const { classNames: e, className: t, style: a, styles: l, vars: g, ...r } = P(
    "ProgressLabel",
    U,
    s
  ), i = _();
  return /* @__PURE__ */ n.jsx(
    R,
    {
      ref: o,
      ...i.getStyles("label", { className: t, style: a, classNames: e, styles: l }),
      ...r
    }
  );
});
E.classes = p;
E.displayName = "@mantine/core/ProgressLabel";
const B = {}, F = D(
  (s, { size: o, radius: e, transitionDuration: t }) => ({
    root: {
      "--progress-size": V(o, "progress-size"),
      "--progress-radius": e === void 0 ? void 0 : G(e),
      "--progress-transition-duration": typeof t == "number" ? `${t}ms` : void 0
    }
  })
), N = b((s, o) => {
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
  } = e, d = T({
    name: "Progress",
    classes: p,
    props: e,
    className: a,
    style: l,
    classNames: t,
    styles: g,
    unstyled: r,
    vars: i,
    varsResolver: F
  });
  return /* @__PURE__ */ n.jsx(M, { value: { getStyles: d, autoContrast: c }, children: /* @__PURE__ */ n.jsx(R, { ref: o, ...d("root"), ...u }) });
});
N.classes = p;
N.displayName = "@mantine/core/ProgressRoot";
const J = {
  withAria: !0
}, y = b((s, o) => {
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
    ...C
  } = P("ProgressSection", J, s), f = _(), x = $(), j = i ? {
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
      ...f.getStyles("section", { className: t, classNames: e, styles: l, style: a }),
      ...C,
      ...j,
      mod: [{ striped: v || u, animated: u }, d],
      __vars: {
        "--progress-section-width": `${r}%`,
        "--progress-section-color": I(c, x),
        "--progress-label-color": k(f.autoContrast, x) ? q({ color: c, theme: x, autoContrast: f.autoContrast }) : void 0
      }
    }
  );
});
y.classes = p;
y.displayName = "@mantine/core/ProgressSection";
const O = {}, m = b((s, o) => {
  const e = P("Progress", O, s), {
    value: t,
    classNames: a,
    styles: l,
    vars: g,
    color: r,
    striped: i,
    animated: c,
    "aria-label": v,
    ...u
  } = e, { resolvedClassNames: d, resolvedStyles: C } = z({
    classNames: a,
    styles: l,
    props: e
  });
  return /* @__PURE__ */ n.jsx(
    N,
    {
      ref: o,
      classNames: d,
      styles: C,
      vars: g,
      ...u,
      children: /* @__PURE__ */ n.jsx(
        y,
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
m.Section = y;
m.Root = N;
m.Label = E;
function Y({ className: s, radius: o = "sm", ...e }) {
  const t = h("tc-design-progress", s);
  return /* @__PURE__ */ n.jsx(m, { ...e, className: t, radius: o });
}
function Z({ lines: s = 1, className: o }) {
  const { t: e } = L();
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
const Q = "agent-studio:guided-production:creation", H = "agent-studio:guided-production:canvas";
let S = null, w = null;
function ss(s) {
  S = s, window.dispatchEvent(new CustomEvent(Q, { detail: s }));
}
function es(s) {
  w = s, window.dispatchEvent(new CustomEvent(H, { detail: s }));
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
  H as G,
  Z as N,
  Q as a,
  os as b,
  ts as c,
  ss as d,
  es as r
};
