import { cP as l, d_ as T, b6 as ae, cI as Oe, cf as r, dF as ee, b7 as B, e1 as q, dX as ye, c as R, aU as X, bJ as G, bx as Ce, aR as Ae, a6 as Le, bH as Q, c_ as ve, cD as ge, bM as K, bq as ce, dV as ie, dW as Ve, cN as xe, aK as te } from "./agentStudioMount-CNVmpr5A.js";
import { I as $, b as Z, a as De } from "./NomiSelect-DbJK-BOQ.js";
import { g as ke } from "./get-auto-contrast-value-BGSSZ1GD.js";
function Me(t, e) {
  if (t === e || Number.isNaN(t) && Number.isNaN(e))
    return !0;
  if (!(t instanceof Object) || !(e instanceof Object))
    return !1;
  const s = Object.keys(t), { length: o } = s;
  if (o !== Object.keys(e).length)
    return !1;
  for (let n = 0; n < o; n += 1) {
    const a = s[n];
    if (!(a in e) || t[a] !== e[a] && !(Number.isNaN(t[a]) && Number.isNaN(e[a])))
      return !1;
  }
  return !0;
}
function qe(t, e) {
  if (!t || !e)
    return !1;
  if (t === e)
    return !0;
  if (t.length !== e.length)
    return !1;
  for (let s = 0; s < t.length; s += 1)
    if (!Me(t[s], e[s]))
      return !1;
  return !0;
}
function Ue(t) {
  const e = l.useRef([]), s = l.useRef(0);
  return qe(e.current, t) || (e.current = t, s.current += 1), [s.current];
}
function He(t, e) {
  l.useEffect(t, Ue(e));
}
function Ke(t, e, s = { autoInvoke: !1 }) {
  const o = l.useRef(null), n = l.useCallback(
    (...u) => {
      o.current || (o.current = window.setTimeout(() => {
        t(u), o.current = null;
      }, e));
    },
    [e]
  ), a = l.useCallback(() => {
    o.current && (window.clearTimeout(o.current), o.current = null);
  }, []);
  return l.useEffect(() => (s.autoInvoke && n(), a), [a, n]), { start: n, clear: a };
}
function Xe(t, e, s) {
  const o = l.useRef(null), n = l.useRef(null);
  return l.useEffect(() => {
    const a = typeof s == "function" ? s() : s;
    return (a || n.current) && (o.current = new MutationObserver(t), o.current.observe(a || n.current, e)), () => {
      o.current?.disconnect();
    };
  }, [t, e]), n;
}
function Je() {
  const [t, e] = l.useState(!1);
  return l.useEffect(() => e(!0), []), t;
}
function Ye() {
  return typeof process < "u" && process.env ? "production" : "development";
}
function Qe(t, e, s) {
  const o = T(t, e, s), {
    label: n,
    description: a,
    error: u,
    required: c,
    classNames: m,
    styles: h,
    className: i,
    unstyled: v,
    __staticSelector: f,
    __stylesApiProps: p,
    errorProps: d,
    labelProps: b,
    descriptionProps: C,
    wrapperProps: k,
    id: y,
    size: g,
    style: w,
    inputContainer: _,
    inputWrapperOrder: S,
    withAsterisk: I,
    variant: F,
    vars: V,
    mod: U,
    ...D
  } = o, { styleProps: N, rest: P } = ae(D), O = {
    label: n,
    description: a,
    error: u,
    required: c,
    classNames: m,
    className: i,
    __staticSelector: f,
    __stylesApiProps: p || o,
    errorProps: d,
    labelProps: b,
    descriptionProps: C,
    unstyled: v,
    styles: h,
    size: g,
    style: w,
    inputContainer: _,
    inputWrapperOrder: S,
    withAsterisk: I,
    variant: F,
    id: y,
    mod: U,
    ...k
  };
  return {
    ...P,
    classNames: m,
    styles: h,
    unstyled: v,
    wrapperProps: { ...O, ...N },
    inputProps: {
      required: c,
      classNames: m,
      styles: h,
      unstyled: v,
      size: g,
      __staticSelector: f,
      __stylesApiProps: p || o,
      error: u,
      variant: F,
      id: y
    }
  };
}
const Ze = {
  __staticSelector: "InputBase",
  withAria: !0
}, se = Oe((t, e) => {
  const { inputProps: s, wrapperProps: o, ...n } = Qe("InputBase", Ze, t);
  return /* @__PURE__ */ r.jsx($.Wrapper, { ...o, children: /* @__PURE__ */ r.jsx($, { ...s, ...n, ref: e }) });
});
se.classes = { ...$.classes, ...$.Wrapper.classes };
se.displayName = "@mantine/core/InputBase";
function et(t, e) {
  if (!e || !t)
    return !1;
  let s = e.parentNode;
  for (; s != null; ) {
    if (s === t)
      return !0;
    s = s.parentNode;
  }
  return !1;
}
function tt({
  target: t,
  parent: e,
  ref: s,
  displayAfterTransitionEnd: o
}) {
  const n = l.useRef(-1), [a, u] = l.useState(!1), [c, m] = l.useState(
    typeof o == "boolean" ? o : !1
  ), h = () => {
    if (!t || !e || !s.current)
      return;
    const p = t.getBoundingClientRect(), d = e.getBoundingClientRect(), b = window.getComputedStyle(t), C = window.getComputedStyle(e), k = ee(b.borderTopWidth) + ee(C.borderTopWidth), y = ee(b.borderLeftWidth) + ee(C.borderLeftWidth), g = {
      top: p.top - d.top - k,
      left: p.left - d.left - y,
      width: p.width,
      height: p.height
    };
    s.current.style.transform = `translateY(${g.top}px) translateX(${g.left}px)`, s.current.style.width = `${g.width}px`, s.current.style.height = `${g.height}px`;
  }, i = () => {
    window.clearTimeout(n.current), s.current && (s.current.style.transitionDuration = "0ms"), h(), n.current = window.setTimeout(() => {
      s.current && (s.current.style.transitionDuration = "");
    }, 30);
  }, v = l.useRef(null), f = l.useRef(null);
  return l.useEffect(() => {
    if (h(), t)
      return v.current = new ResizeObserver(i), v.current.observe(t), e && (f.current = new ResizeObserver(i), f.current.observe(e)), () => {
        v.current?.disconnect(), f.current?.disconnect();
      };
  }, [e, t]), l.useEffect(() => {
    if (e) {
      const p = (d) => {
        et(d.target, e) && (i(), m(!1));
      };
      return e.addEventListener("transitionend", p), () => {
        e.removeEventListener("transitionend", p);
      };
    }
  }, [e]), Ke(
    () => {
      Ye() !== "test" && u(!0);
    },
    20,
    { autoInvoke: !0 }
  ), Xe(
    (p) => {
      p.forEach((d) => {
        d.type === "attributes" && d.attributeName === "dir" && i();
      });
    },
    { attributes: !0, attributeFilter: ["dir"] },
    () => document.documentElement
  ), { initialized: a, hidden: c };
}
var we = { root: "m_96b553a6" };
const st = {}, ot = X(
  (t, { transitionDuration: e }) => ({
    root: {
      "--transition-duration": typeof e == "number" ? `${e}ms` : e
    }
  })
), le = B((t, e) => {
  const s = T("FloatingIndicator", st, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    target: h,
    parent: i,
    transitionDuration: v,
    mod: f,
    displayAfterTransitionEnd: p,
    ...d
  } = s, b = q({
    name: "FloatingIndicator",
    classes: we,
    props: s,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: ot
  }), C = l.useRef(null), { initialized: k, hidden: y } = tt({
    target: h,
    parent: i,
    ref: C,
    displayAfterTransitionEnd: p
  }), g = ye(e, C);
  return !h || !i ? null : /* @__PURE__ */ r.jsx(R, { ref: g, mod: [{ initialized: k, hidden: y }, f], ...b("root"), ...d });
});
le.displayName = "@mantine/core/FloatingIndicator";
le.classes = we;
var _e = { root: "m_5f75b09e", body: "m_5f6e695e", labelWrapper: "m_d3ea56bb", label: "m_8ee546b8", description: "m_328f68c0", error: "m_8e8a99cc" };
const Se = _e, ue = l.forwardRef(
  ({
    __staticSelector: t,
    __stylesApiProps: e,
    className: s,
    classNames: o,
    styles: n,
    unstyled: a,
    children: u,
    label: c,
    description: m,
    id: h,
    disabled: i,
    error: v,
    size: f,
    labelPosition: p = "left",
    bodyElement: d = "div",
    labelElement: b = "label",
    variant: C,
    style: k,
    vars: y,
    mod: g,
    ...w
  }, _) => {
    const S = q({
      name: t,
      props: e,
      className: s,
      style: k,
      classes: _e,
      classNames: o,
      styles: n,
      unstyled: a
    });
    return /* @__PURE__ */ r.jsx(
      R,
      {
        ...S("root"),
        ref: _,
        __vars: {
          "--label-fz": Ce(f),
          "--label-lh": G(f, "label-lh")
        },
        mod: [{ "label-position": p }, g],
        variant: C,
        size: f,
        ...w,
        children: /* @__PURE__ */ r.jsxs(
          R,
          {
            component: d,
            htmlFor: d === "label" ? h : void 0,
            ...S("body"),
            children: [
              u,
              /* @__PURE__ */ r.jsxs("div", { ...S("labelWrapper"), "data-disabled": i || void 0, children: [
                c && /* @__PURE__ */ r.jsx(
                  R,
                  {
                    component: b,
                    htmlFor: b === "label" ? h : void 0,
                    ...S("label"),
                    "data-disabled": i || void 0,
                    children: c
                  }
                ),
                m && /* @__PURE__ */ r.jsx($.Description, { size: f, __inheritStyles: !1, ...S("description"), children: m }),
                v && typeof v != "boolean" && /* @__PURE__ */ r.jsx($.Error, { size: f, __inheritStyles: !1, ...S("error"), children: v })
              ] })
            ]
          }
        )
      }
    );
  }
);
ue.displayName = "@mantine/core/InlineInput";
const Pe = l.createContext(null), nt = Pe.Provider, Ne = () => l.useContext(Pe), [rt, at] = Ae();
var je = { card: "m_26775b0a" };
const ct = {
  withBorder: !0
}, it = X((t, { radius: e }) => ({
  card: {
    "--card-radius": Q(e)
  }
})), de = B((t, e) => {
  const s = T("CheckboxCard", ct, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    checked: h,
    mod: i,
    withBorder: v,
    value: f,
    onClick: p,
    defaultChecked: d,
    onChange: b,
    ...C
  } = s, k = q({
    name: "CheckboxCard",
    classes: je,
    props: s,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: it,
    rootSelector: "card"
  }), y = Ne(), g = typeof h == "boolean" ? h : y ? y.value.includes(f || "") : void 0, [w, _] = Z({
    value: g,
    defaultValue: d,
    finalValue: !1,
    onChange: b
  });
  return /* @__PURE__ */ r.jsx(rt, { value: { checked: w }, children: /* @__PURE__ */ r.jsx(
    Le,
    {
      ref: e,
      mod: [{ "with-border": v, checked: w }, i],
      ...k("card"),
      ...C,
      role: "checkbox",
      "aria-checked": w,
      onClick: (S) => {
        p?.(S), y?.onChange(f || ""), _(!w);
      }
    }
  ) });
});
de.displayName = "@mantine/core/CheckboxCard";
de.classes = je;
function Re({ children: t, role: e }) {
  const s = De();
  return s ? /* @__PURE__ */ r.jsx("div", { role: e, "aria-labelledby": s.labelId, "aria-describedby": s.describedBy, children: t }) : /* @__PURE__ */ r.jsx(r.Fragment, { children: t });
}
const lt = {}, pe = B((t, e) => {
  const { value: s, defaultValue: o, onChange: n, size: a, wrapperProps: u, children: c, readOnly: m, ...h } = T("CheckboxGroup", lt, t), [i, v] = Z({
    value: s,
    defaultValue: o,
    finalValue: [],
    onChange: n
  }), f = (p) => {
    const d = typeof p == "string" ? p : p.currentTarget.value;
    !m && v(
      i.includes(d) ? i.filter((b) => b !== d) : [...i, d]
    );
  };
  return /* @__PURE__ */ r.jsx(nt, { value: { value: i, onChange: f, size: a }, children: /* @__PURE__ */ r.jsx(
    $.Wrapper,
    {
      size: a,
      ref: e,
      ...u,
      ...h,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: /* @__PURE__ */ r.jsx(Re, { role: "group", children: c })
    }
  ) });
});
pe.classes = $.Wrapper.classes;
pe.displayName = "@mantine/core/CheckboxGroup";
function ut({ size: t, style: e, ...s }) {
  const o = t !== void 0 ? { width: ve(t), height: ve(t), ...e } : e;
  return /* @__PURE__ */ r.jsx(
    "svg",
    {
      viewBox: "0 0 10 7",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: o,
      "aria-hidden": !0,
      ...s,
      children: /* @__PURE__ */ r.jsx(
        "path",
        {
          d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
          fill: "currentColor",
          fillRule: "evenodd",
          clipRule: "evenodd"
        }
      )
    }
  );
}
function Ie({ indeterminate: t, ...e }) {
  return t ? /* @__PURE__ */ r.jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 32 6",
      "aria-hidden": !0,
      ...e,
      children: /* @__PURE__ */ r.jsx("rect", { width: "32", height: "6", fill: "currentColor", rx: "3" })
    }
  ) : /* @__PURE__ */ r.jsx(ut, { ...e });
}
var $e = { indicator: "m_5e5256ee", icon: "m_1b1c543a", "indicator--outline": "m_76e20374" };
const dt = {
  icon: Ie
}, pt = X(
  (t, { radius: e, color: s, size: o, iconColor: n, variant: a, autoContrast: u }) => {
    const c = ge({ color: s || t.primaryColor, theme: t }), m = c.isThemeColor && c.shade === void 0 ? `var(--mantine-color-${c.color}-outline)` : c.color;
    return {
      indicator: {
        "--checkbox-size": G(o, "checkbox-size"),
        "--checkbox-radius": e === void 0 ? void 0 : Q(e),
        "--checkbox-color": a === "outline" ? m : K(s, t),
        "--checkbox-icon-color": n ? K(n, t) : ke(u, t) ? ce({ color: s, theme: t, autoContrast: u }) : void 0
      }
    };
  }
), he = B((t, e) => {
  const s = T("CheckboxIndicator", dt, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    icon: h,
    indeterminate: i,
    radius: v,
    color: f,
    iconColor: p,
    autoContrast: d,
    checked: b,
    mod: C,
    variant: k,
    disabled: y,
    ...g
  } = s, w = h, _ = q({
    name: "CheckboxIndicator",
    classes: $e,
    props: s,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: pt,
    rootSelector: "indicator"
  }), S = at(), I = typeof b == "boolean" || typeof i == "boolean" ? b || i : S?.checked || !1;
  return /* @__PURE__ */ r.jsx(
    R,
    {
      ref: e,
      ..._("indicator", { variant: k }),
      variant: k,
      mod: [{ checked: I, disabled: y }, C],
      ...g,
      children: /* @__PURE__ */ r.jsx(w, { indeterminate: i, ..._("icon") })
    }
  );
});
he.displayName = "@mantine/core/CheckboxIndicator";
he.classes = $e;
var Te = { root: "m_bf2d988c", inner: "m_26062bec", input: "m_26063560", icon: "m_bf295423", "input--outline": "m_215c4542" };
const ht = {
  labelPosition: "right",
  icon: Ie
}, ft = X(
  (t, { radius: e, color: s, size: o, iconColor: n, variant: a, autoContrast: u }) => {
    const c = ge({ color: s || t.primaryColor, theme: t }), m = c.isThemeColor && c.shade === void 0 ? `var(--mantine-color-${c.color}-outline)` : c.color;
    return {
      root: {
        "--checkbox-size": G(o, "checkbox-size"),
        "--checkbox-radius": e === void 0 ? void 0 : Q(e),
        "--checkbox-color": a === "outline" ? m : K(s, t),
        "--checkbox-icon-color": n ? K(n, t) : ke(u, t) ? ce({ color: s, theme: t, autoContrast: u }) : void 0
      }
    };
  }
), J = B((t, e) => {
  const s = T("Checkbox", ht, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    color: h,
    label: i,
    id: v,
    size: f,
    radius: p,
    wrapperProps: d,
    checked: b,
    labelPosition: C,
    description: k,
    error: y,
    disabled: g,
    variant: w,
    indeterminate: _,
    icon: S,
    rootRef: I,
    iconColor: F,
    onChange: V,
    autoContrast: U,
    mod: D,
    ...N
  } = s, P = Ne(), O = f || P?.size, E = S, A = q({
    name: "Checkbox",
    props: s,
    classes: Te,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: ft
  }), { styleProps: H, rest: M } = ae(N), z = ie(v), W = P ? {
    checked: P.value.includes(M.value),
    onChange: (L) => {
      P.onChange(L), V?.(L);
    }
  } : {}, Y = l.useRef(null), j = e || Y;
  return l.useEffect(() => {
    j && "current" in j && j.current && (j.current.indeterminate = _ || !1);
  }, [_, j]), /* @__PURE__ */ r.jsx(
    ue,
    {
      ...A("root"),
      __staticSelector: "Checkbox",
      __stylesApiProps: s,
      id: z,
      size: O,
      labelPosition: C,
      label: i,
      description: k,
      error: y,
      disabled: g,
      classNames: o,
      styles: u,
      unstyled: c,
      "data-checked": W.checked || b || void 0,
      variant: w,
      ref: I,
      mod: D,
      ...H,
      ...d,
      children: /* @__PURE__ */ r.jsxs(R, { ...A("inner"), mod: { "data-label-position": C }, children: [
        /* @__PURE__ */ r.jsx(
          R,
          {
            component: "input",
            id: z,
            ref: j,
            checked: b,
            disabled: g,
            mod: { error: !!y, indeterminate: _ },
            ...A("input", { focusable: !0, variant: w }),
            onChange: V,
            ...M,
            ...W,
            type: "checkbox"
          }
        ),
        /* @__PURE__ */ r.jsx(E, { indeterminate: _, ...A("icon") })
      ] })
    }
  );
});
J.classes = { ...Te, ...Se };
J.displayName = "@mantine/core/Checkbox";
J.Group = pe;
J.Indicator = he;
J.Card = de;
var Ee = { root: "m_cf365364", indicator: "m_9e182ccd", label: "m_1738fcb2", input: "m_1714d588", control: "m_69686b9b", innerLabel: "m_78882f40" };
const mt = {
  withItemsBorders: !0
}, bt = X(
  (t, { radius: e, color: s, transitionDuration: o, size: n, transitionTimingFunction: a }) => ({
    root: {
      "--sc-radius": e === void 0 ? void 0 : Q(e),
      "--sc-color": s ? K(s, t) : void 0,
      "--sc-shadow": s ? void 0 : "var(--mantine-shadow-xs)",
      "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
      "--sc-transition-timing-function": a,
      "--sc-padding": G(n, "sc-padding"),
      "--sc-font-size": Ce(n)
    }
  })
), fe = B((t, e) => {
  const s = T("SegmentedControl", mt, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    data: h,
    value: i,
    defaultValue: v,
    onChange: f,
    size: p,
    name: d,
    disabled: b,
    readOnly: C,
    fullWidth: k,
    orientation: y,
    radius: g,
    color: w,
    transitionDuration: _,
    transitionTimingFunction: S,
    variant: I,
    autoContrast: F,
    withItemsBorders: V,
    mod: U,
    ...D
  } = s, N = q({
    name: "SegmentedControl",
    props: s,
    classes: Ee,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: bt
  }), P = Ve(), O = h.map(
    (x) => typeof x == "string" ? { label: x, value: x } : x
  ), E = Je(), [A, H] = l.useState(xe()), [M, z] = l.useState(null), [W, Y] = l.useState({}), j = (x, re) => {
    W[re] = x, Y(W);
  }, [L, Ge] = Z({
    value: i,
    defaultValue: v,
    finalValue: Array.isArray(h) ? O.find((x) => !x.disabled)?.value ?? h[0]?.value ?? null : null,
    onChange: f
  }), ne = ie(d), Be = O.map((x) => /* @__PURE__ */ l.createElement(
    R,
    {
      ...N("control"),
      mod: { active: L === x.value, orientation: y },
      key: x.value
    },
    /* @__PURE__ */ l.createElement(
      "input",
      {
        ...N("input"),
        disabled: b || x.disabled,
        type: "radio",
        name: ne,
        value: x.value,
        id: `${ne}-${x.value}`,
        checked: L === x.value,
        onChange: () => !C && Ge(x.value),
        "data-focus-ring": P.focusRing,
        key: `${x.value}-input`
      }
    ),
    /* @__PURE__ */ l.createElement(
      R,
      {
        component: "label",
        ...N("label"),
        mod: {
          active: L === x.value && !(b || x.disabled),
          disabled: b || x.disabled,
          "read-only": C
        },
        htmlFor: `${ne}-${x.value}`,
        ref: (re) => j(re, x.value),
        __vars: {
          "--sc-label-color": w !== void 0 ? ce({ color: w, theme: P, autoContrast: F }) : void 0
        },
        key: `${x.value}-label`
      },
      /* @__PURE__ */ r.jsx("span", { ...N("innerLabel"), children: x.label })
    )
  )), Fe = ye(e, (x) => z(x));
  return He(() => {
    H(xe());
  }, [h.length]), h.length === 0 ? null : /* @__PURE__ */ r.jsxs(
    R,
    {
      ...N("root"),
      variant: I,
      size: p,
      ref: Fe,
      mod: [
        {
          "full-width": k,
          orientation: y,
          initialized: E,
          "with-items-borders": V
        },
        U
      ],
      ...D,
      role: "radiogroup",
      "data-disabled": b,
      children: [
        typeof L == "string" && /* @__PURE__ */ r.jsx(
          le,
          {
            target: W[L],
            parent: M,
            component: "span",
            transitionDuration: "var(--sc-transition-duration)",
            ...N("indicator")
          },
          A
        ),
        Be
      ]
    }
  );
});
fe.classes = Ee;
fe.displayName = "@mantine/core/SegmentedControl";
const ze = l.createContext(null), vt = ze.Provider, xt = () => l.useContext(ze), yt = {}, me = B((t, e) => {
  const { value: s, defaultValue: o, onChange: n, size: a, wrapperProps: u, children: c, readOnly: m, ...h } = T("SwitchGroup", yt, t), [i, v] = Z({
    value: s,
    defaultValue: o,
    finalValue: [],
    onChange: n
  }), f = (p) => {
    const d = p.currentTarget.value;
    !m && v(
      i.includes(d) ? i.filter((b) => b !== d) : [...i, d]
    );
  };
  return /* @__PURE__ */ r.jsx(vt, { value: { value: i, onChange: f, size: a }, children: /* @__PURE__ */ r.jsx(
    $.Wrapper,
    {
      size: a,
      ref: e,
      ...u,
      ...h,
      labelElement: "div",
      __staticSelector: "SwitchGroup",
      children: /* @__PURE__ */ r.jsx(Re, { role: "group", children: c })
    }
  ) });
});
me.classes = $.Wrapper.classes;
me.displayName = "@mantine/core/SwitchGroup";
var We = { root: "m_5f93f3bb", input: "m_926b4011", track: "m_9307d992", thumb: "m_93039a1d", trackLabel: "m_8277e082" };
const Ct = {
  labelPosition: "right"
}, gt = X((t, { radius: e, color: s, size: o }) => ({
  root: {
    "--switch-radius": e === void 0 ? void 0 : Q(e),
    "--switch-height": G(o, "switch-height"),
    "--switch-width": G(o, "switch-width"),
    "--switch-thumb-size": G(o, "switch-thumb-size"),
    "--switch-label-font-size": G(o, "switch-label-font-size"),
    "--switch-track-label-padding": G(o, "switch-track-label-padding"),
    "--switch-color": s ? K(s, t) : void 0
  }
})), oe = B((t, e) => {
  const s = T("Switch", Ct, t), {
    classNames: o,
    className: n,
    style: a,
    styles: u,
    unstyled: c,
    vars: m,
    color: h,
    label: i,
    offLabel: v,
    onLabel: f,
    id: p,
    size: d,
    radius: b,
    wrapperProps: C,
    thumbIcon: k,
    checked: y,
    defaultChecked: g,
    onChange: w,
    labelPosition: _,
    description: S,
    error: I,
    disabled: F,
    variant: V,
    rootRef: U,
    mod: D,
    ...N
  } = s, P = xt(), O = d || P?.size, E = q({
    name: "Switch",
    props: s,
    classes: We,
    className: n,
    style: a,
    classNames: o,
    styles: u,
    unstyled: c,
    vars: m,
    varsResolver: gt
  }), { styleProps: A, rest: H } = ae(N), M = ie(p), z = P ? {
    checked: P.value.includes(H.value),
    onChange: P.onChange
  } : {}, [W, Y] = Z({
    value: z.checked ?? y,
    defaultValue: g,
    finalValue: !1
  });
  return /* @__PURE__ */ r.jsxs(
    ue,
    {
      ...E("root"),
      __staticSelector: "Switch",
      __stylesApiProps: s,
      id: M,
      size: O,
      labelPosition: _,
      label: i,
      description: S,
      error: I,
      disabled: F,
      bodyElement: "label",
      labelElement: "span",
      classNames: o,
      styles: u,
      unstyled: c,
      "data-checked": z.checked || y || void 0,
      variant: V,
      ref: U,
      mod: D,
      ...A,
      ...C,
      children: [
        /* @__PURE__ */ r.jsx(
          "input",
          {
            ...H,
            disabled: F,
            checked: W,
            "data-checked": z.checked || y || void 0,
            onChange: (j) => {
              P ? z.onChange?.(j) : w?.(j), Y(j.currentTarget.checked);
            },
            id: M,
            ref: e,
            type: "checkbox",
            role: "switch",
            ...E("input")
          }
        ),
        /* @__PURE__ */ r.jsxs(
          R,
          {
            "aria-hidden": "true",
            component: "span",
            mod: { error: I, "label-position": _, "without-labels": !f && !v },
            ...E("track"),
            children: [
              /* @__PURE__ */ r.jsx(R, { component: "span", mod: "reduce-motion", ...E("thumb"), children: k }),
              /* @__PURE__ */ r.jsx("span", { ...E("trackLabel"), children: W ? f : v })
            ]
          }
        )
      ]
    }
  );
});
oe.classes = { ...We, ...Se };
oe.displayName = "@mantine/core/Switch";
oe.Group = me;
const kt = {}, be = B((t, e) => {
  const s = T("TextInput", kt, t);
  return /* @__PURE__ */ r.jsx(se, { component: "input", ref: e, ...s, __staticSelector: "TextInput" });
});
be.classes = se.classes;
be.displayName = "@mantine/core/TextInput";
function Pt({ className: t, radius: e = "sm", ...s }) {
  const o = te(
    "tc-design-checkbox",
    "text-body-sm",
    t
  );
  return /* @__PURE__ */ r.jsx(J, { ...s, className: o, radius: e });
}
function Nt({ className: t, radius: e = "sm", ...s }) {
  const o = te(
    "tc-design-text-input",
    "text-body-sm",
    t
  );
  return /* @__PURE__ */ r.jsx(be, { ...s, className: o, radius: e });
}
function jt({
  className: t,
  radius: e = "sm",
  ...s
}) {
  const o = te(
    "tc-design-segmented-control",
    "text-body-sm",
    t
  );
  return /* @__PURE__ */ r.jsx(fe, { ...s, className: o, radius: e });
}
function Rt({ className: t, ...e }) {
  const s = te(
    "tc-design-switch",
    "text-body-sm",
    t
  );
  return /* @__PURE__ */ r.jsx(oe, { ...e, className: s });
}
export {
  ut as C,
  Pt as D,
  se as I,
  jt as a,
  Rt as b,
  Nt as c
};
