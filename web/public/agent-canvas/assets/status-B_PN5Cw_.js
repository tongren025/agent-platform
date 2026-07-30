import { aS as w, b5 as b, dQ as y, c8 as n, c as C, dT as A, aT as $, bD as T, bF as L, dN as z, bm as D, bI as V, aJ as S, dV as k } from "./agentStudioMount-D2l2f4Xv.js";
import { u as M } from "./use-resolved-styles-api-CJMFBFWt.js";
import { g as B } from "./get-auto-contrast-value-BGSSZ1GD.js";
const [E, R] = w(
  "Progress.Root component was not found in tree"
);
var p = { root: "m_db6d6462", section: "m_2242eb65", "stripes-animation": "m_81a374bd", label: "m_91e40b74" };
const F = {}, j = b((e, o) => {
  const { classNames: s, className: a, style: r, styles: l, vars: g, ...t } = y(
    "ProgressLabel",
    F,
    e
  ), c = R();
  return /* @__PURE__ */ n.jsx(
    C,
    {
      ref: o,
      ...c.getStyles("label", { className: a, style: r, classNames: s, styles: l }),
      ...t
    }
  );
});
j.classes = p;
j.displayName = "@mantine/core/ProgressLabel";
const I = {}, J = $(
  (e, { size: o, radius: s, transitionDuration: a }) => ({
    root: {
      "--progress-size": L(o, "progress-size"),
      "--progress-radius": s === void 0 ? void 0 : T(s),
      "--progress-transition-duration": typeof a == "number" ? `${a}ms` : void 0
    }
  })
), P = b((e, o) => {
  const s = y("ProgressRoot", I, e), {
    classNames: a,
    className: r,
    style: l,
    styles: g,
    unstyled: t,
    vars: c,
    autoContrast: i,
    transitionDuration: v,
    ...m
  } = s, u = A({
    name: "Progress",
    classes: p,
    props: s,
    className: r,
    style: l,
    classNames: a,
    styles: g,
    unstyled: t,
    vars: c,
    varsResolver: J
  });
  return /* @__PURE__ */ n.jsx(E, { value: { getStyles: u, autoContrast: i }, children: /* @__PURE__ */ n.jsx(C, { ref: o, ...u("root"), ...m }) });
});
P.classes = p;
P.displayName = "@mantine/core/ProgressRoot";
const Q = {
  withAria: !0
}, x = b((e, o) => {
  const {
    classNames: s,
    className: a,
    style: r,
    styles: l,
    vars: g,
    value: t,
    withAria: c,
    color: i,
    striped: v,
    animated: m,
    mod: u,
    ...N
  } = y("ProgressSection", Q, e), f = R(), h = z(), _ = c ? {
    role: "progressbar",
    "aria-valuemax": 100,
    "aria-valuemin": 0,
    "aria-valuenow": t,
    "aria-valuetext": `${t}%`
  } : {};
  return /* @__PURE__ */ n.jsx(
    C,
    {
      ref: o,
      ...f.getStyles("section", { className: a, classNames: s, styles: l, style: r }),
      ...N,
      ..._,
      mod: [{ striped: v || m, animated: m }, u],
      __vars: {
        "--progress-section-width": `${t}%`,
        "--progress-section-color": V(i, h),
        "--progress-label-color": B(f.autoContrast, h) ? D({ color: i, theme: h, autoContrast: f.autoContrast }) : void 0
      }
    }
  );
});
x.classes = p;
x.displayName = "@mantine/core/ProgressSection";
const q = {}, d = b((e, o) => {
  const s = y("Progress", q, e), {
    value: a,
    classNames: r,
    styles: l,
    vars: g,
    color: t,
    striped: c,
    animated: i,
    "aria-label": v,
    ...m
  } = s, { resolvedClassNames: u, resolvedStyles: N } = M({
    classNames: r,
    styles: l,
    props: s
  });
  return /* @__PURE__ */ n.jsx(
    P,
    {
      ref: o,
      classNames: u,
      styles: N,
      vars: g,
      ...m,
      children: /* @__PURE__ */ n.jsx(
        x,
        {
          value: a,
          color: t,
          striped: c,
          animated: i,
          "aria-label": v
        }
      )
    }
  );
});
d.classes = p;
d.displayName = "@mantine/core/Progress";
d.Section = x;
d.Root = P;
d.Label = j;
function O({ className: e, radius: o = "sm", ...s }) {
  const a = S("tc-design-progress", e);
  return /* @__PURE__ */ n.jsx(d, { ...s, className: a, radius: o });
}
function U({ lines: e = 1, className: o }) {
  const { t: s } = k();
  return /* @__PURE__ */ n.jsx("div", { className: S("flex flex-col gap-2"), role: "status", "aria-label": s("common.loading"), "aria-busy": "true", children: Array.from({ length: Math.max(1, e) }).map((a, r) => /* @__PURE__ */ n.jsx(
    "div",
    {
      className: S(
        "h-4 rounded-nomi-sm bg-nomi-ink-10 animate-pulse motion-reduce:animate-none",
        // 多行时末行短一截,更像真实文本块
        e > 1 && r === e - 1 ? "w-3/5" : "w-full",
        o
      )
    },
    r
  )) });
}
export {
  O as D,
  U as N
};
