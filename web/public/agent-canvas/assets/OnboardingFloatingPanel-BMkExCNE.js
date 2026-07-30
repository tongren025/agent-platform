import { cH as Ce, dF as So, cl as Mo, S as i, cG as Io, b5 as cn, dQ as Te, dN as Ko, dR as Eo, c8 as e, c as ln, cB as no, dT as Pn, aT as Cn, bI as zo, bA as Lo, bB as Wo, bt as Do, aI as Nn, Y as Fo, dM as oo, b4 as Ho, A as kn, bF as Fn, bG as Oo, aR as ye, dV as pe, j as ne, e as me, h as Bo, p as mn, aJ as E, s as un, l as xe, g as To, y as Uo, x as Je, I as Sn, w as Ie, bs as ie, aN as Ze, t as Ro, bX as $e, r as to, dx as le, o as Mn, ad as sn, R as Yo } from "./agentStudioMount-CP7x4OcS.js";
import { I as In, a as ro } from "./IconChevronRight-CtUKyzdC.js";
import { I as Qo } from "./IconMusic-i0aBRPL8.js";
import { I as Kn } from "./IconRefresh-CyWW0ZCa.js";
import { I as so } from "./IconVideo-Wpl4-gzk.js";
import { I as Go } from "./IconListCheck-CFf1m1LT.js";
import { C as Jo, I as En, D as Vo, c as Ye, a as io } from "./forms-CyiX33Nh.js";
import { I as Zo } from "./IconArrowLeft-DCsHZimd.js";
import { I as Xo } from "./IconCube-DC-33uAh.js";
import { u as ao } from "./use-resolved-styles-api-Cpd4wlDG.js";
import { C as he, c as Hn, b as An, I as On, u as qo, N as He } from "./NomiSelect-l9fMiLNK.js";
import { I as pn } from "./IconExternalLink-Dcznuk5a.js";
import { I as zn } from "./IconPencil-CtQ9wHVP.js";
import { I as dn } from "./IconCircleCheck-Dnc8OOno.js";
import { I as lo } from "./IconCopy-Cd9CnWkO.js";
import { I as _o } from "./IconDownload-B_d95R-W.js";
import { I as $o } from "./IconWand-Dv2yC9eQ.js";
import { a as Bn } from "./modelCatalogCache-CwAFTyKw.js";
function et(n) {
  const r = Ce.useRef(void 0);
  return Ce.useEffect(() => {
    r.current = n;
  }, [n]), r.current;
}
function co(n, r) {
  return Array.isArray(n) ? [...n].reduce(
    (s, o) => ({ ...s, ...co(o, r) }),
    {}
  ) : typeof n == "function" ? n(r) : n ?? {};
}
function nt(n) {
  if (!n || typeof n == "string")
    return 0;
  const r = n / 36;
  return Math.round((4 + 15 * r ** 0.25 + r / 5) * 10);
}
function xn(n) {
  return n?.current ? n.current.scrollHeight : "auto";
}
const Ue = typeof window < "u" && window.requestAnimationFrame;
function ot({
  transitionDuration: n,
  transitionTimingFunction: r = "ease",
  onTransitionEnd: s = () => {
  },
  opened: o
}) {
  const t = Ce.useRef(null), a = 0, l = {
    height: 0,
    overflow: "hidden"
  }, [d, N] = Ce.useState(o ? {} : l), h = (k) => {
    Io.flushSync(() => N(k));
  }, c = (k) => {
    h((w) => ({ ...w, ...k }));
  };
  function j(k) {
    const w = n || nt(k);
    return {
      transition: `height ${w}ms ${r}, opacity ${w}ms ${r}`
    };
  }
  So(() => {
    typeof Ue == "function" && Ue(o ? () => {
      c({ willChange: "height", display: "block", overflow: "hidden" }), Ue(() => {
        const k = xn(t);
        c({ ...j(k), height: k });
      });
    } : () => {
      const k = xn(t);
      c({ ...j(k), willChange: "height", height: k }), Ue(() => c({ height: a, overflow: "hidden" }));
    });
  }, [o]);
  const m = (k) => {
    if (!(k.target !== t.current || k.propertyName !== "height"))
      if (o) {
        const w = xn(t);
        w === d.height ? h({}) : c({ height: w }), s();
      } else d.height === a && (h(l), s());
  };
  function x({ style: k = {}, refKey: w = "ref", ...D } = {}) {
    const L = D[w], P = {
      "aria-hidden": !o,
      ...D,
      [w]: Mo(t, L),
      onTransitionEnd: m,
      style: { boxSizing: "border-box", ...k, ...d }
    };
    return i.version.startsWith("18") ? o || (P.inert = "") : P.inert = !o, P;
  }
  return x;
}
const tt = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0
}, mo = cn((n, r) => {
  const {
    children: s,
    in: o,
    transitionDuration: t,
    transitionTimingFunction: a,
    style: l,
    onTransitionEnd: d,
    animateOpacity: N,
    ...h
  } = Te("Collapse", tt, n), c = Ko(), j = Eo(), x = (c.respectReducedMotion ? j : !1) ? 0 : t, k = ot({
    opened: o,
    transitionDuration: x,
    transitionTimingFunction: a,
    onTransitionEnd: d
  });
  return x === 0 ? o ? /* @__PURE__ */ e.jsx(ln, { ...h, children: s }) : null : /* @__PURE__ */ e.jsx(
    ln,
    {
      ...k({
        style: {
          opacity: o || !N ? 1 : 0,
          transition: N ? `opacity ${x}ms ${a}` : "none",
          ...co(l, c)
        },
        ref: r,
        ...h
      }),
      children: s
    }
  );
});
mo.displayName = "@mantine/core/Collapse";
var uo = { root: "m_b6d8b162" };
function rt(n) {
  if (n === "start")
    return "start";
  if (n === "end" || n)
    return "end";
}
const st = {
  inherit: !1
}, it = Cn(
  (n, { variant: r, lineClamp: s, gradient: o, size: t, color: a }) => ({
    root: {
      "--text-fz": Do(t),
      "--text-lh": Wo(t),
      "--text-gradient": r === "gradient" ? Lo(o, n) : void 0,
      "--text-line-clamp": typeof s == "number" ? s.toString() : void 0,
      "--text-color": a ? zo(a, n) : void 0
    }
  })
), G = no((n, r) => {
  const s = Te("Text", st, n), {
    lineClamp: o,
    truncate: t,
    inline: a,
    inherit: l,
    gradient: d,
    span: N,
    __staticSelector: h,
    vars: c,
    className: j,
    style: m,
    classNames: x,
    styles: k,
    unstyled: w,
    variant: D,
    mod: L,
    size: P,
    ...F
  } = s, b = Pn({
    name: ["Text", h],
    props: s,
    classes: uo,
    className: j,
    style: m,
    classNames: x,
    styles: k,
    unstyled: w,
    vars: c,
    varsResolver: it
  });
  return /* @__PURE__ */ e.jsx(
    ln,
    {
      ...b("root", { focusable: !0 }),
      ref: r,
      component: N ? "span" : "p",
      variant: D,
      mod: [
        {
          "data-truncate": rt(t),
          "data-line-clamp": typeof o == "number",
          "data-inline": a,
          "data-inherit": l
        },
        L
      ],
      size: P,
      ...F
    }
  );
});
G.classes = uo;
G.displayName = "@mantine/core/Text";
var po = { root: "m_849cf0da" };
const at = {
  underline: "hover"
}, Me = no((n, r) => {
  const { underline: s, className: o, unstyled: t, mod: a, ...l } = Te(
    "Anchor",
    at,
    n
  );
  return /* @__PURE__ */ e.jsx(
    G,
    {
      component: "a",
      ref: r,
      className: Nn({ [po.root]: !t }, o),
      ...l,
      mod: [{ underline: s }, a],
      __staticSelector: "Anchor",
      unstyled: t
    }
  );
});
Me.classes = po;
Me.displayName = "@mantine/core/Anchor";
function go(n) {
  return typeof n == "string" ? { value: n, label: n } : "value" in n && !("label" in n) ? { value: n.value, label: n.value, disabled: n.disabled } : typeof n == "number" ? { value: n.toString(), label: n.toString() } : "group" in n ? {
    group: n.group,
    items: n.items.map((r) => go(r))
  } : n;
}
function lt(n) {
  return n ? n.map((r) => go(r)) : [];
}
function fo(n) {
  return n.reduce((r, s) => "group" in s ? { ...r, ...fo(s.items) } : (r[s.value] = s, r), {});
}
function Ve(n) {
  return "group" in n;
}
function ho({
  options: n,
  search: r,
  limit: s
}) {
  const o = r.trim().toLowerCase(), t = [];
  for (let a = 0; a < n.length; a += 1) {
    const l = n[a];
    if (t.length === s)
      return t;
    Ve(l) && t.push({
      group: l.group,
      items: ho({
        options: l.items,
        search: r,
        limit: s - t.length
      })
    }), Ve(l) || l.label.toLowerCase().includes(o) && t.push(l);
  }
  return t;
}
function dt(n) {
  if (n.length === 0)
    return !0;
  for (const r of n)
    if (!("group" in r) || r.items.length > 0)
      return !1;
  return !0;
}
function xo(n, r = /* @__PURE__ */ new Set()) {
  if (Array.isArray(n))
    for (const s of n)
      if (Ve(s))
        xo(s.items, r);
      else {
        if (typeof s.value > "u")
          throw new Error("[@mantine/core] Each option must have value property");
        if (typeof s.value != "string")
          throw new Error(
            `[@mantine/core] Option value must be a string, other data formats are not supported, got ${typeof s.value}`
          );
        if (r.has(s.value))
          throw new Error(
            `[@mantine/core] Duplicate options are not supported. Option with value "${s.value}" was provided more than once`
          );
        r.add(s.value);
      }
}
function ct(n, r) {
  return Array.isArray(n) ? n.includes(r) : n === r;
}
function bo({
  data: n,
  withCheckIcon: r,
  value: s,
  checkIconPosition: o,
  unstyled: t,
  renderOption: a
}) {
  if (!Ve(n)) {
    const d = ct(s, n.value), N = r && d && /* @__PURE__ */ e.jsx(Jo, { className: Hn.optionsDropdownCheckIcon }), h = /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      o === "left" && N,
      /* @__PURE__ */ e.jsx("span", { children: n.label }),
      o === "right" && N
    ] });
    return /* @__PURE__ */ e.jsx(
      he.Option,
      {
        value: n.value,
        disabled: n.disabled,
        className: Nn({ [Hn.optionsDropdownOption]: !t }),
        "data-reverse": o === "right" || void 0,
        "data-checked": d || void 0,
        "aria-selected": d,
        active: d,
        children: typeof a == "function" ? a({ option: n, checked: d }) : h
      }
    );
  }
  const l = n.items.map((d) => /* @__PURE__ */ e.jsx(
    bo,
    {
      data: d,
      value: s,
      unstyled: t,
      withCheckIcon: r,
      checkIconPosition: o,
      renderOption: a
    },
    d.value
  ));
  return /* @__PURE__ */ e.jsx(he.Group, { label: n.group, children: l });
}
function mt({
  data: n,
  hidden: r,
  hiddenWhenEmpty: s,
  filter: o,
  search: t,
  limit: a,
  maxDropdownHeight: l,
  withScrollArea: d = !0,
  filterOptions: N = !0,
  withCheckIcon: h = !1,
  value: c,
  checkIconPosition: j,
  nothingFoundMessage: m,
  unstyled: x,
  labelId: k,
  renderOption: w,
  scrollAreaProps: D,
  "aria-label": L
}) {
  xo(n);
  const F = typeof t == "string" ? (o || ho)({
    options: n,
    search: N ? t : "",
    limit: a ?? 1 / 0
  }) : n, b = dt(F), y = F.map((C) => /* @__PURE__ */ e.jsx(
    bo,
    {
      data: C,
      withCheckIcon: h,
      value: c,
      checkIconPosition: j,
      unstyled: x,
      renderOption: w
    },
    Ve(C) ? C.group : C.value
  ));
  return /* @__PURE__ */ e.jsx(he.Dropdown, { hidden: r || s && b, "data-composed": !0, children: /* @__PURE__ */ e.jsxs(he.Options, { labelledBy: k, "aria-label": L, children: [
    d ? /* @__PURE__ */ e.jsx(
      Fo.Autosize,
      {
        mah: l ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...D,
        children: y
      }
    ) : y,
    b && m && /* @__PURE__ */ e.jsx(he.Empty, { children: m })
  ] }) });
}
const ut = ({
  reveal: n
}) => /* @__PURE__ */ e.jsx(
  "svg",
  {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { width: "var(--psi-icon-size)", height: "var(--psi-icon-size)" },
    children: /* @__PURE__ */ e.jsx(
      "path",
      {
        d: n ? "M13.3536 2.35355C13.5488 2.15829 13.5488 1.84171 13.3536 1.64645C13.1583 1.45118 12.8417 1.45118 12.6464 1.64645L10.6828 3.61012C9.70652 3.21671 8.63759 3 7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C0.902945 9.08812 2.02314 10.1861 3.36061 10.9323L1.64645 12.6464C1.45118 12.8417 1.45118 13.1583 1.64645 13.3536C1.84171 13.5488 2.15829 13.5488 2.35355 13.3536L4.31723 11.3899C5.29348 11.7833 6.36241 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C14.0971 5.9119 12.9769 4.81391 11.6394 4.06771L13.3536 2.35355ZM9.90428 4.38861C9.15332 4.1361 8.34759 4 7.5 4C4.80285 4 2.52952 5.37816 1.09622 7.50001C1.87284 8.6497 2.89609 9.58106 4.09974 10.1931L9.90428 4.38861ZM5.09572 10.6114L10.9003 4.80685C12.1039 5.41894 13.1272 6.35031 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11C6.65241 11 5.84668 10.8639 5.09572 10.6114Z" : "M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd"
      }
    )
  }
);
var wn = { root: "m_f61ca620", input: "m_ccf8da4c", innerInput: "m_f2d85dd2", visibilityToggle: "m_b1072d44" };
const pt = {
  visibilityToggleIcon: ut
}, gt = Cn((n, { size: r }) => ({
  root: {
    "--psi-icon-size": Fn(r, "psi-icon-size"),
    "--psi-button-size": Fn(r, "psi-button-size")
  }
})), Ln = cn((n, r) => {
  const s = Te("PasswordInput", pt, n), {
    classNames: o,
    className: t,
    style: a,
    styles: l,
    unstyled: d,
    vars: N,
    required: h,
    error: c,
    leftSection: j,
    disabled: m,
    id: x,
    variant: k,
    inputContainer: w,
    description: D,
    label: L,
    size: P,
    errorProps: F,
    descriptionProps: b,
    labelProps: y,
    withAsterisk: C,
    inputWrapperOrder: I,
    wrapperProps: K,
    radius: U,
    rightSection: Z,
    rightSectionWidth: X,
    rightSectionPointerEvents: p,
    leftSectionWidth: H,
    visible: u,
    defaultVisible: B,
    onVisibilityChange: J,
    visibilityToggleIcon: V,
    visibilityToggleButtonProps: q,
    rightSectionProps: de,
    leftSectionProps: f,
    leftSectionPointerEvents: v,
    withErrorStyles: M,
    mod: O,
    ...R
  } = s, _ = oo(x), [oe, ue] = An({
    value: u,
    defaultValue: B,
    finalValue: !1,
    onChange: J
  }), g = () => ue(!oe), W = Pn({
    name: "PasswordInput",
    classes: wn,
    props: s,
    className: t,
    style: a,
    classNames: o,
    styles: l,
    unstyled: d,
    vars: N,
    varsResolver: gt
  }), { resolvedClassNames: z, resolvedStyles: T } = ao({
    classNames: o,
    styles: l,
    props: s
  }), { styleProps: $, rest: Ke } = Ho(R), ke = V, Ae = F?.id || `${_}-error`, ge = b?.id || `${_}-description`, Y = `${!!c && typeof c != "boolean" ? Ae : ""} ${!!D ? ge : ""}`, Ee = Y.trim().length > 0 ? Y.trim() : void 0, re = /* @__PURE__ */ e.jsx(
    kn,
    {
      ...W("visibilityToggle"),
      disabled: m,
      radius: U,
      "aria-hidden": !q,
      tabIndex: -1,
      ...q,
      variant: q?.variant ?? "subtle",
      color: "gray",
      unstyled: d,
      onTouchEnd: (ae) => {
        ae.preventDefault(), q?.onTouchEnd?.(ae), g();
      },
      onMouseDown: (ae) => {
        ae.preventDefault(), q?.onMouseDown?.(ae), g();
      },
      onKeyDown: (ae) => {
        q?.onKeyDown?.(ae), ae.key === " " && (ae.preventDefault(), g());
      },
      children: /* @__PURE__ */ e.jsx(ke, { reveal: oe })
    }
  );
  return /* @__PURE__ */ e.jsx(
    On.Wrapper,
    {
      required: h,
      id: _,
      label: L,
      error: c,
      description: D,
      size: P,
      classNames: z,
      styles: T,
      __staticSelector: "PasswordInput",
      unstyled: d,
      withAsterisk: C,
      inputWrapperOrder: I,
      inputContainer: w,
      variant: k,
      labelProps: { ...y, htmlFor: _ },
      descriptionProps: { ...b, id: ge },
      errorProps: { ...F, id: Ae },
      mod: O,
      ...W("root"),
      ...$,
      ...K,
      children: /* @__PURE__ */ e.jsx(
        On,
        {
          component: "div",
          error: c,
          leftSection: j,
          size: P,
          classNames: { ...z, input: Nn(wn.input, z.input) },
          styles: T,
          radius: U,
          disabled: m,
          __staticSelector: "PasswordInput",
          rightSectionWidth: X,
          rightSection: Z ?? re,
          variant: k,
          unstyled: d,
          leftSectionWidth: H,
          rightSectionPointerEvents: p || "all",
          rightSectionProps: de,
          leftSectionProps: f,
          leftSectionPointerEvents: v,
          withAria: !1,
          withErrorStyles: M,
          children: /* @__PURE__ */ e.jsx(
            "input",
            {
              required: h,
              "data-invalid": !!c || void 0,
              "data-with-left-section": !!j || void 0,
              ...W("innerInput"),
              disabled: m,
              id: _,
              ref: r,
              ...Ke,
              "aria-describedby": Ee,
              autoComplete: Ke.autoComplete || "off",
              type: oe ? "text" : "password"
            }
          )
        }
      )
    }
  );
});
Ln.classes = { ...En.classes, ...wn };
Ln.displayName = "@mantine/core/PasswordInput";
const ft = {
  searchable: !1,
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left"
}, Wn = cn((n, r) => {
  const s = Te("Select", ft, n), {
    classNames: o,
    styles: t,
    unstyled: a,
    vars: l,
    dropdownOpened: d,
    defaultDropdownOpened: N,
    onDropdownClose: h,
    onDropdownOpen: c,
    onFocus: j,
    onBlur: m,
    onClick: x,
    onChange: k,
    data: w,
    value: D,
    defaultValue: L,
    selectFirstOptionOnChange: P,
    onOptionSubmit: F,
    comboboxProps: b,
    readOnly: y,
    disabled: C,
    filter: I,
    limit: K,
    withScrollArea: U,
    maxDropdownHeight: Z,
    size: X,
    searchable: p,
    rightSection: H,
    checkIconPosition: u,
    withCheckIcon: B,
    nothingFoundMessage: J,
    name: V,
    form: q,
    searchValue: de,
    defaultSearchValue: f,
    onSearchChange: v,
    allowDeselect: M,
    error: O,
    rightSectionPointerEvents: R,
    id: _,
    clearable: oe,
    clearButtonProps: ue,
    hiddenInputProps: g,
    renderOption: W,
    onClear: z,
    autoComplete: T,
    scrollAreaProps: $,
    __defaultRightSection: Ke,
    __clearSection: ke,
    __clearable: Ae,
    chevronColor: ge,
    ...be
  } = s, ve = Ce.useMemo(() => lt(w), [w]), Y = Ce.useMemo(() => fo(ve), [ve]), Ee = oo(_), [re, ae, qe] = An({
    value: D,
    defaultValue: L,
    finalValue: null,
    onChange: k
  }), fe = typeof re == "string" ? Y[re] : void 0, we = et(fe), [ze, gn, fn] = An({
    value: de,
    defaultValue: f,
    finalValue: fe ? fe.label : "",
    onChange: v
  }), ce = qo({
    opened: d,
    defaultOpened: N,
    onDropdownOpen: () => {
      c?.(), ce.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      h?.(), ce.resetSelectedOption();
    }
  }), je = (te) => {
    gn(te), ce.resetSelectedOption();
  }, { resolvedClassNames: We, resolvedStyles: _e } = ao({
    props: s,
    styles: t,
    classNames: o
  });
  Ce.useEffect(() => {
    P && ce.selectFirstOption();
  }, [P, ze]), Ce.useEffect(() => {
    D === null && je(""), typeof D == "string" && fe && (we?.value !== fe.value || we?.label !== fe.label) && je(fe.label);
  }, [D, fe]), Ce.useEffect(() => {
    !qe && !fn && je(typeof re == "string" && Y[re]?.label || "");
  }, [w, re]);
  const hn = /* @__PURE__ */ e.jsx(
    he.ClearButton,
    {
      ...ue,
      onClear: () => {
        ae(null, null), je(""), z?.();
      }
    }
  ), Pe = oe && !!re && !C && !y;
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs(
      he,
      {
        store: ce,
        __staticSelector: "Select",
        classNames: We,
        styles: _e,
        unstyled: a,
        readOnly: y,
        onOptionSubmit: (te) => {
          F?.(te);
          const Se = M && Y[te].value === re ? null : Y[te], De = Se ? Se.value : null;
          De !== re && ae(De, Se), !qe && je(typeof De == "string" && Se?.label || ""), ce.closeDropdown();
        },
        size: X,
        ...b,
        children: [
          /* @__PURE__ */ e.jsx(he.Target, { targetType: p ? "input" : "button", autoComplete: T, children: /* @__PURE__ */ e.jsx(
            En,
            {
              id: Ee,
              ref: r,
              __defaultRightSection: /* @__PURE__ */ e.jsx(
                he.Chevron,
                {
                  size: X,
                  error: O,
                  unstyled: a,
                  color: ge
                }
              ),
              __clearSection: hn,
              __clearable: Pe,
              rightSection: H,
              rightSectionPointerEvents: R || (Pe ? "all" : "none"),
              ...be,
              size: X,
              __staticSelector: "Select",
              disabled: C,
              readOnly: y || !p,
              value: ze,
              onChange: (te) => {
                je(te.currentTarget.value), ce.openDropdown(), P && ce.selectFirstOption();
              },
              onFocus: (te) => {
                p && ce.openDropdown(), j?.(te);
              },
              onBlur: (te) => {
                p && ce.closeDropdown(), je(re != null && Y[re]?.label || ""), m?.(te);
              },
              onClick: (te) => {
                p ? ce.openDropdown() : ce.toggleDropdown(), x?.(te);
              },
              classNames: We,
              styles: _e,
              unstyled: a,
              pointer: !p,
              error: O
            }
          ) }),
          /* @__PURE__ */ e.jsx(
            mt,
            {
              data: ve,
              hidden: y || C,
              filter: I,
              search: ze,
              limit: K,
              hiddenWhenEmpty: !J,
              withScrollArea: U,
              maxDropdownHeight: Z,
              filterOptions: p && fe?.label !== ze,
              value: re,
              checkIconPosition: u,
              withCheckIcon: B,
              nothingFoundMessage: J,
              unstyled: a,
              labelId: be.label ? `${Ee}-label` : void 0,
              "aria-label": be.label ? void 0 : be["aria-label"],
              renderOption: W,
              scrollAreaProps: $
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e.jsx(
      he.HiddenInput,
      {
        value: re,
        name: V,
        form: q,
        disabled: C,
        ...g
      }
    )
  ] });
});
Wn.classes = { ...En.classes, ...he.classes };
Wn.displayName = "@mantine/core/Select";
var vo = { root: "m_6d731127" };
const ht = {
  gap: "md",
  align: "stretch",
  justify: "flex-start"
}, xt = Cn((n, { gap: r, align: s, justify: o }) => ({
  root: {
    "--stack-gap": Oo(r),
    "--stack-align": s,
    "--stack-justify": o
  }
})), se = cn((n, r) => {
  const s = Te("Stack", ht, n), {
    classNames: o,
    className: t,
    style: a,
    styles: l,
    unstyled: d,
    vars: N,
    align: h,
    justify: c,
    gap: j,
    variant: m,
    ...x
  } = s, k = Pn({
    name: "Stack",
    props: s,
    classes: vo,
    className: t,
    style: a,
    classNames: o,
    styles: l,
    unstyled: d,
    vars: N,
    varsResolver: xt
  });
  return /* @__PURE__ */ e.jsx(ln, { ref: r, ...k("root"), variant: m, ...x });
});
se.classes = vo;
se.displayName = "@mantine/core/Stack";
const bt = [["path", { d: "M14 3v4a1 1 0 0 0 1 1h4", key: "svg-0" }], ["path", { d: "M5 13v-8a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5.5m-9.5 -2h7m-3 -3l3 3l-3 3", key: "svg-1" }]], bn = ye("outline", "file-import", "FileImport", bt);
const vt = [["path", { d: "M19 18a3.5 3.5 0 0 0 0 -7h-1a5 4.5 0 0 0 -11 -2a4.6 4.4 0 0 0 -2.1 8.4", key: "svg-0" }], ["path", { d: "M12 13l0 9", key: "svg-1" }], ["path", { d: "M9 19l3 3l3 -3", key: "svg-2" }]], yt = ye("outline", "cloud-download", "CloudDownload", vt);
const kt = [["path", { d: "M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0", key: "svg-0" }], ["path", { d: "M15 9h.01", key: "svg-1" }]], jn = ye("outline", "key", "Key", kt);
const At = [["path", { d: "M8 9h8", key: "svg-0" }], ["path", { d: "M8 13h6", key: "svg-1" }], ["path", { d: "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12", key: "svg-2" }]], yo = ye("outline", "message", "Message", At);
const wt = [["path", { d: "M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1", key: "svg-0" }]], jt = ye("outline", "message-circle", "MessageCircle", wt);
const Pt = [["path", { d: "M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5", key: "svg-0" }], ["path", { d: "M5 10a7 7 0 0 0 14 0", key: "svg-1" }], ["path", { d: "M8 21l8 0", key: "svg-2" }], ["path", { d: "M12 17l0 4", key: "svg-3" }]], Ct = ye("outline", "microphone", "Microphone", Pt);
const Nt = [["path", { d: "M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-0" }], ["path", { d: "M7 17l0 .01", key: "svg-1" }], ["path", { d: "M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-2" }], ["path", { d: "M7 7l0 .01", key: "svg-3" }], ["path", { d: "M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-4" }], ["path", { d: "M17 7l0 .01", key: "svg-5" }], ["path", { d: "M14 14l3 0", key: "svg-6" }], ["path", { d: "M20 14l0 .01", key: "svg-7" }], ["path", { d: "M14 14l0 3", key: "svg-8" }], ["path", { d: "M14 20l3 0", key: "svg-9" }], ["path", { d: "M17 17l3 0", key: "svg-10" }], ["path", { d: "M20 17l0 3", key: "svg-11" }]], Tn = ye("outline", "qrcode", "Qrcode", Nt);
const St = [["path", { d: "M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3", key: "svg-0" }], ["path", { d: "M15 20h-9a3 3 0 0 1 -3 -3v-2a3 3 0 0 1 3 -3h12", key: "svg-1" }], ["path", { d: "M7 8v.01", key: "svg-2" }], ["path", { d: "M7 16v.01", key: "svg-3" }], ["path", { d: "M20 15l-2 3h3l-2 3", key: "svg-4" }]], Mt = ye("outline", "server-bolt", "ServerBolt", St);
const It = [["path", { d: "M12 4l-8 4l8 4l8 -4l-8 -4", key: "svg-0" }], ["path", { d: "M4 12l8 4l8 -4", key: "svg-1" }], ["path", { d: "M4 16l8 4l8 -4", key: "svg-2" }]], Kt = ye("outline", "stack-2", "Stack2", It);
const Et = [["path", { d: "M8 9l3 3l-3 3", key: "svg-0" }], ["path", { d: "M13 15l3 0", key: "svg-1" }], ["path", { d: "M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12", key: "svg-2" }]], zt = ye("outline", "terminal-2", "Terminal2", Et), ko = {
  text: "文本",
  image: "图片",
  video: "视频",
  audio: "音频",
  model3d: "3D"
}, Un = ["text", "image", "video", "audio", "model3d"];
function Dn(n) {
  const r = /* @__PURE__ */ new Map();
  for (const t of n) {
    const a = t.kind || "text", l = r.get(a);
    l ? l.push(t) : r.set(a, [t]);
  }
  const s = Un.filter((t) => r.has(t)), o = [...r.keys()].filter((t) => !Un.includes(t));
  return [...s, ...o].map((t) => ({
    kind: t,
    label: ko[t] ?? t,
    // 未知 kind：原始字符串当标签，宁可丑也不崩
    models: r.get(t)
  }));
}
function Lt(n) {
  return [...n].sort((r, s) => Number(s.enabled) - Number(r.enabled));
}
const Rn = {
  text: yo,
  image: mn,
  video: so,
  audio: Ct,
  model3d: Xo
};
function Wt({
  candidates: n,
  initialSelected: r,
  sourceName: s,
  host: o,
  total: t,
  fetching: a,
  onRefetch: l,
  onBack: d,
  onConfirm: N,
  onResolveKind: h
}) {
  const { t: c } = pe(), [j, m] = i.useState(() => new Set(r.map((p) => p.id))), [x, k] = i.useState([]), [w, D] = i.useState(""), [L, P] = i.useState(""), F = i.useMemo(() => {
    const p = /* @__PURE__ */ new Set(), H = [];
    for (const u of [...x, ...r, ...n]) {
      const B = u.id.trim();
      !B || p.has(B) || (p.add(B), H.push({ id: B, kind: u.kind }));
    }
    return H;
  }, [n, x, r]), b = L.trim().toLowerCase(), y = b ? F.filter((p) => p.id.toLowerCase().includes(b)) : F, C = Dn(y), I = i.useCallback((p) => {
    m((H) => {
      const u = new Set(H);
      return u.has(p) ? u.delete(p) : u.add(p), u;
    });
  }, []), K = i.useCallback((p) => {
    m((H) => {
      const u = new Set(H), B = p.every((J) => u.has(J));
      for (const J of p)
        B ? u.delete(J) : u.add(J);
      return u;
    });
  }, []), U = i.useCallback(async () => {
    const p = w.trim();
    if (!p) return;
    if (D(""), F.some((u) => u.id === p)) {
      m((u) => new Set(u).add(p));
      return;
    }
    let H = "text";
    if (h)
      try {
        H = await h(p);
      } catch {
      }
    k((u) => [{ id: p, kind: H }, ...u]), m((u) => new Set(u).add(p));
  }, [w, F, h]), Z = i.useCallback(() => {
    N(F.filter((p) => j.has(p.id)));
  }, [F, j, N]), X = j.size;
  return /* @__PURE__ */ e.jsxs(se, { gap: 10, children: [
    /* @__PURE__ */ e.jsxs(ne, { justify: "space-between", align: "center", wrap: "nowrap", children: [
      /* @__PURE__ */ e.jsxs(ne, { gap: 8, align: "center", wrap: "nowrap", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: d,
            "aria-label": c("common.back"),
            className: "inline-flex text-nomi-ink-60 hover:text-nomi-ink",
            children: /* @__PURE__ */ e.jsx(Zo, { size: 18, stroke: 1.7 })
          }
        ),
        /* @__PURE__ */ e.jsx(G, { size: "md", fw: 600, c: "var(--nomi-ink)", children: c("onboardingProviders.modelControls.pickerTitle") })
      ] }),
      /* @__PURE__ */ e.jsx(me, { variant: "subtle", leftSection: /* @__PURE__ */ e.jsx(Kn, { size: 13 }), onClick: l, loading: a, children: c("onboardingProviders.modelControls.refetch") })
    ] }),
    /* @__PURE__ */ e.jsxs(G, { size: "xs", c: "var(--nomi-ink-60)", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
      s ? `${s} · ` : "",
      o,
      t > 0 ? ` · ${c("onboardingProviders.modelControls.fetchedCount", { count: t })}` : ""
    ] }),
    /* @__PURE__ */ e.jsx(Bo, { value: L, onChange: P, placeholder: c("onboardingProviders.modelControls.searchIdPlaceholder"), className: "w-full" }),
    /* @__PURE__ */ e.jsxs(ne, { justify: "space-between", align: "center", children: [
      /* @__PURE__ */ e.jsxs(G, { size: "sm", c: "var(--nomi-ink-60)", children: [
        c("onboardingProviders.modelControls.pickerSelected", { count: X }),
        t > 0 ? c("onboardingProviders.modelControls.pickerTotal", { count: t }) : ""
      ] }),
      X > 0 && /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => m(/* @__PURE__ */ new Set()), className: "text-body-sm text-nomi-ink-40 hover:text-nomi-ink-60", children: c("onboardingProviders.modelControls.clear") })
    ] }),
    /* @__PURE__ */ e.jsx(se, { gap: 4, mah: 260, style: { overflowY: "auto" }, children: C.length === 0 ? /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-40)", py: 16, ta: "center", children: F.length === 0 ? c("onboardingProviders.modelControls.endpointEmpty") : c("onboardingProviders.modelControls.noMatchingModels") }) : C.map(({ kind: p, models: H }) => {
      const u = H.map((V) => V.id), B = u.every((V) => j.has(V)), J = Rn[p] ?? yo;
      return /* @__PURE__ */ e.jsxs(se, { gap: 2, children: [
        /* @__PURE__ */ e.jsxs(ne, { justify: "space-between", align: "center", px: 2, pt: 6, children: [
          /* @__PURE__ */ e.jsxs(ne, { gap: 5, align: "center", wrap: "nowrap", children: [
            /* @__PURE__ */ e.jsx(J, { size: 14, stroke: 1.6, style: { color: "var(--nomi-ink-60)" } }),
            /* @__PURE__ */ e.jsxs(G, { size: "xs", fw: 600, c: "var(--nomi-ink-60)", children: [
              p in Rn ? c(`onboardingProviders.modelControls.kind.${p}`) : p,
              " ",
              /* @__PURE__ */ e.jsx(G, { span: !0, fw: 400, c: "var(--nomi-ink-40)", children: H.length })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => K(u), className: "text-micro text-nomi-accent hover:underline", children: c(B ? "onboardingProviders.modelControls.deselectGroup" : "onboardingProviders.modelControls.selectGroup") })
        ] }),
        H.map((V) => {
          const q = j.has(V.id);
          return /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => I(V.id),
              className: E(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-nomi text-left w-full",
                "transition-colors duration-100 hover:bg-nomi-ink-05"
              ),
              children: [
                /* @__PURE__ */ e.jsx(Vo, { checked: q, readOnly: !0, tabIndex: -1, "aria-hidden": !0 }),
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: "text-body-sm text-nomi-ink truncate",
                    style: { fontFamily: "var(--nomi-font-mono, monospace)" },
                    children: V.id
                  }
                )
              ]
            },
            V.id
          );
        })
      ] }, p);
    }) }),
    /* @__PURE__ */ e.jsxs(ne, { gap: 6, wrap: "nowrap", align: "center", children: [
      /* @__PURE__ */ e.jsx(
        Ye,
        {
          value: w,
          onChange: (p) => D(p.currentTarget.value),
          onKeyDown: (p) => {
            p.key === "Enter" && (p.preventDefault(), U());
          },
          placeholder: c("onboardingProviders.modelControls.manualPlaceholder"),
          style: { flex: 1 }
        }
      ),
      /* @__PURE__ */ e.jsx(me, { variant: "subtle", leftSection: /* @__PURE__ */ e.jsx(un, { size: 14 }), onClick: () => {
        U();
      }, disabled: !w.trim(), children: c("onboardingProviders.modelControls.add") })
    ] }),
    /* @__PURE__ */ e.jsxs(ne, { justify: "flex-end", gap: 8, pt: 2, children: [
      /* @__PURE__ */ e.jsx(me, { variant: "subtle", onClick: d, children: c("common.cancel") }),
      /* @__PURE__ */ e.jsx(me, { variant: "filled", leftSection: /* @__PURE__ */ e.jsx(xe, { size: 14 }), onClick: Z, disabled: X === 0, children: c("onboardingProviders.modelControls.addModels", { count: X }) })
    ] })
  ] });
}
function Dt(n) {
  return n.fieldsReady ? n.testPassed ? "save" : n.forceArmed ? "confirm" : "arm" : "disabled";
}
const vn = [
  // 中转站组（一等公民，最上）：用户填自己地址；图片/视频/文本都能接。
  { id: "newapi", label: "new-api 中转", providerKind: "openai-compatible", baseUrl: "", custom: !0, group: "relay" },
  { id: "custom", label: "自定义", providerKind: "openai-compatible", baseUrl: "", custom: !0, group: "relay" },
  // 官方厂商组（文本，地址内置）。
  { id: "openai", label: "OpenAI", providerKind: "openai-compatible", baseUrl: "https://api.openai.com/v1", keyUrl: "https://platform.openai.com/api-keys", group: "official" },
  { id: "claude", label: "Claude", providerKind: "anthropic", baseUrl: "", keyUrl: "https://console.anthropic.com/settings/keys", group: "official" },
  { id: "gemini", label: "Gemini", providerKind: "openai-compatible", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", keyUrl: "https://aistudio.google.com/apikey", group: "official" },
  { id: "openrouter", label: "OpenRouter", providerKind: "openai-compatible", baseUrl: "https://openrouter.ai/api/v1", keyUrl: "https://openrouter.ai/keys", group: "official" },
  { id: "siliconflow", label: "SiliconFlow", providerKind: "openai-compatible", baseUrl: "https://api.siliconflow.cn/v1", keyUrl: "https://cloud.siliconflow.cn/account/ak", group: "official" },
  { id: "kimi", label: "Kimi", providerKind: "openai-compatible", baseUrl: "https://api.moonshot.cn/v1", keyUrl: "https://platform.moonshot.cn/console/api-keys", group: "official" },
  { id: "zhipu", label: "智谱 GLM", providerKind: "openai-compatible", baseUrl: "https://open.bigmodel.cn/api/paas/v4", keyUrl: "https://open.bigmodel.cn/usercenter/apikeys", group: "official" },
  { id: "deepseek", label: "DeepSeek", providerKind: "openai-compatible", baseUrl: "https://api.deepseek.com/v1", keyUrl: "https://platform.deepseek.com/api_keys", group: "official" },
  // 阶跃星辰（中国区 OpenAI 兼容 base；官方迁移文档 platform.stepfun.com/docs/.../openai）。
  // 注：Step Plan 订阅制账户需改用 https://api.stepfun.com/step_plan/v1、国际区用 .ai——预设填最常见的按量地址。
  { id: "stepfun", label: "阶跃星辰", providerKind: "openai-compatible", baseUrl: "https://api.stepfun.com/v1", keyUrl: "https://platform.stepfun.com", group: "official" },
  { id: "volcengine", label: "火山 / Doubao", providerKind: "openai-compatible", baseUrl: "https://ark.cn-beijing.volces.com/api/v3", keyUrl: "https://console.volcengine.com/ark", group: "official" },
  { id: "dashscope", label: "阿里百炼", providerKind: "openai-compatible", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", keyUrl: "https://bailian.console.aliyun.com", group: "official" },
  { id: "groq", label: "Groq", providerKind: "openai-compatible", baseUrl: "https://api.groq.com/openai/v1", keyUrl: "https://console.groq.com/keys", group: "official" }
];
function Re({ label: n, hint: r, children: s }) {
  return /* @__PURE__ */ e.jsxs(se, { gap: 4, children: [
    /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink)", children: n }),
    s,
    r && /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--nomi-ink-60)", children: r })
  ] });
}
const Yn = {
  "openai-compatible": "Chat Completions",
  "openai-responses": "Responses",
  anthropic: "Anthropic"
}, Ft = ["image", "video", "audio", "text"];
function Ht({ opened: n, onClose: r, onCommitted: s, initialPreset: o }) {
  const { t } = pe(), a = i.useMemo(
    () => Ft.map((A) => ({ value: A, label: t(`modelSetup.kinds.${A}`) })),
    [t]
  ), l = ie(), [d, N] = i.useState("input"), [h] = i.useState("manual"), [c, j] = i.useState(""), [m, x] = i.useState(""), [k, w] = i.useState(""), [D, L] = i.useState(!1), [P, F] = i.useState("openai-compatible"), [b, y] = i.useState(!1), [C, I] = i.useState(!1), [K, U] = i.useState(!1), [Z, X] = i.useState(""), [p, H] = i.useState([]), [u, B] = i.useState([]), [J, V] = i.useState("form"), [q, de] = i.useState(!1), [f, v] = i.useState(!1), [M, O] = i.useState(""), R = i.useRef(""), [_, oe] = i.useState([]), [ue, g] = i.useState(!1), [W, z] = i.useState("idle"), [T, $] = i.useState(""), [Ke, ke] = i.useState(!1), [Ae, ge] = i.useState(""), [be, ve] = i.useState(""), [Y, Ee] = i.useState(""), re = i.useCallback(() => {
    N("input"), ge(""), ve(""), Ee(""), H([]), B([]), V("form"), de(!1), O(""), z("idle"), $("");
  }, []), ae = i.useCallback((A, S) => {
    oe((Q) => Q.map((ee, No) => No === A ? { ...ee, ...S } : ee)), z("idle");
  }, []), qe = i.useCallback(() => {
    oe((A) => [...A, { key: "", value: "" }]);
  }, []), fe = i.useCallback((A) => {
    oe((S) => S.filter((Q, ee) => ee !== A)), z("idle");
  }, []), we = i.useCallback(() => {
    const A = {};
    for (const S of _) {
      const Q = S.key.trim(), ee = S.value.trim();
      Q && ee && (A[Q] = ee);
    }
    return A;
  }, [_]), ze = i.useCallback((A) => {
    const S = vn.find((Q) => Q.id === A);
    S && (w(A), F(S.providerKind), X(S.baseUrl), x(S.custom ? "" : S.label), L(!1), y(!S.custom), I(!1), U(!1), B([]), de(!1), V("form"), O(""), z("idle"), R.current = "");
  }, []);
  i.useEffect(() => {
    n && o && ze(o);
  }, [n, o]);
  const gn = i.useCallback((A, S) => {
    H((Q) => Q.map((ee) => ee.id === A ? { ...ee, kind: S } : ee));
  }, []), fn = i.useCallback((A) => {
    H((S) => S.filter((Q) => Q.id !== A)), z("idle");
  }, []), ce = i.useCallback(async (A) => {
    if (!l?.onboarding?.guessKinds) return "text";
    try {
      return (await l.onboarding.guessKinds({ ids: [A] })).kinds?.[A] ?? "text";
    } catch {
      return "text";
    }
  }, [l]), je = i.useCallback((A) => {
    H(A.map((S) => ({
      id: S.id,
      kind: S.kind === "image" || S.kind === "video" || S.kind === "audio" ? S.kind : "text"
    }))), V("form"), z("idle");
  }, []), We = i.useCallback(async () => {
    if (l?.onboarding?.listModels) {
      v(!0), O("");
      try {
        const A = await l.onboarding.listModels({
          baseUrl: Z.trim(),
          apiKey: c.trim(),
          providerKind: P,
          headers: we()
        });
        if (A.ok && A.models && A.models.length > 0) {
          const S = Array.from(new Set(A.models.map((ee) => ee.trim()).filter(Boolean)));
          let Q = {};
          if (l?.onboarding?.guessKinds)
            try {
              Q = (await l.onboarding.guessKinds({ ids: S })).kinds || {};
            } catch {
            }
          B(S.map((ee) => ({ id: ee, kind: Q[ee] ?? "text" }))), O("");
        } else A.ok ? (B([]), O(t("modelSetup.noModelsListedHint"))) : (B([]), O(t("modelSetup.noModelsFetchedHint")));
      } finally {
        de(!0), v(!1);
      }
    }
  }, [l, Z, c, P, we, t]), _e = i.useCallback(async () => {
    if (!l?.onboarding?.testConnection) return;
    z("testing"), $("");
    const A = p.map((Q) => Q.id.trim()).find(Boolean), S = await l.onboarding.testConnection({
      baseUrl: Z.trim(),
      apiKey: c.trim(),
      modelId: A,
      // 专家锁定 → 强制走该协议；否则交主进程 auto-probe（chat↔responses，anthropic 按 hostname）。
      ...b ? { providerKind: P } : { autoProbe: !0 },
      headers: we()
    });
    S.ok ? (S.detectedKind && F(S.detectedKind), z("ok"), $(S.detectedKind ? t("modelSetup.connectedProtocol", { protocol: Yn[S.detectedKind] }) : t("modelSetup.connected"))) : (z("fail"), U(!0), I(!0), $(S.error ? t("modelSetup.connectionFailedWithReason", { error: S.error }) : t("modelSetup.connectionFailed")));
  }, [l, Z, c, p, P, b, we, t]), hn = i.useCallback(async () => {
    if (!l?.onboarding?.manualCommit) {
      ve(t("modelSetup.desktopUnavailable")), N("error");
      return;
    }
    const A = p.map((S) => ({ id: S.id.trim(), kind: S.kind })).filter((S) => S.id.length > 0);
    if (A.length !== 0) {
      g(!0);
      try {
        const S = await l.onboarding.manualCommit({
          vendorName: m.trim(),
          baseUrl: Z.trim(),
          apiKey: c.trim(),
          providerKind: P,
          headers: we(),
          models: A
        });
        if (S.ok) {
          const Q = S.committed?.length ?? A.length;
          ge(Q === 1 ? S.committed?.[0]?.displayName || A[0].id : t("modelSetup.modelCount", { count: Q })), N("success"), S.committed && s?.(S.committed);
        } else
          ve(t("modelSetup.saveFailed")), Ee(S.error || t("modelSetup.checkCredentials")), N("error");
      } finally {
        g(!1);
      }
    }
  }, [l, m, Z, c, p, P, we, s, t]);
  i.useEffect(() => {
    ke(!1);
  }, [W, Z, c, p, P]);
  const Pe = Z.trim(), te = P === "anthropic" ? Pe === "" || /^https?:\/\//i.test(Pe) : /^https?:\/\//i.test(Pe), Se = te && (P === "anthropic" || Pe.length > 0), De = () => {
    if (!Se || f || c.trim().length === 0 || u.length > 0 || p.length > 0) return;
    const A = `${Pe}\0${c.trim()}\0${P}`;
    A !== R.current && (R.current = A, We());
  }, jo = p.some((A) => A.id.trim().length > 0), Po = te && c.trim().length > 0 && jo && !ue, Fe = Dt({
    fieldsReady: Po,
    testPassed: W === "ok",
    forceArmed: Ke
  }), Le = vn.find((A) => A.id === k), Co = !!!(Le && !Le.custom) || D;
  return /* @__PURE__ */ e.jsx(
    To,
    {
      opened: n,
      onClose: r,
      title: t("modelSetup.addModel"),
      size: 480,
      centered: !0,
      closeOnClickOutside: d !== "running",
      closeOnEscape: d !== "running",
      children: /* @__PURE__ */ e.jsxs(se, { gap: "md", children: [
        d === "input" && J === "form" && /* @__PURE__ */ e.jsxs(se, { gap: 12, children: [
          /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--nomi-ink-60)", children: t("modelSetup.intro") }),
          h === "manual" && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            [
              { key: "relay", label: t("modelSetup.relayGroup") },
              { key: "official", label: t("modelSetup.officialGroup") }
            ].map((A) => {
              const S = vn.filter((Q) => (Q.group ?? "official") === A.key);
              return S.length === 0 ? null : /* @__PURE__ */ e.jsx(Re, { label: A.label, hint: A.key === "relay" ? t("modelSetup.relayHint") : void 0, children: /* @__PURE__ */ e.jsx("div", { className: "flex flex-wrap gap-1.5", children: S.map((Q) => {
                const ee = k === Q.id;
                return /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => ze(Q.id),
                    className: E(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-sm border",
                      "transition-[background,color,border-color] duration-150",
                      ee ? "bg-nomi-accent-soft text-nomi-accent border-nomi-accent" : "bg-nomi-paper text-nomi-ink-80 border-nomi-line hover:bg-nomi-ink-05"
                    ),
                    children: [
                      Q.label,
                      ee && /* @__PURE__ */ e.jsx(xe, { size: 13, stroke: 2 })
                    ]
                  },
                  Q.id
                );
              }) }) }, A.key);
            }),
            /* @__PURE__ */ e.jsx(Re, { label: t("modelSetup.vendorName"), hint: t("modelSetup.vendorNameHint"), children: /* @__PURE__ */ e.jsx(
              Ye,
              {
                value: m,
                onChange: (A) => x(A.currentTarget.value),
                placeholder: t("modelSetup.vendorNamePlaceholder")
              }
            ) }),
            Co ? /* @__PURE__ */ e.jsx(
              Re,
              {
                label: t("modelSetup.baseUrl"),
                hint: t(P === "anthropic" ? "modelSetup.baseUrlAnthropicHint" : "modelSetup.baseUrlHint"),
                children: /* @__PURE__ */ e.jsx(
                  Ye,
                  {
                    value: Z,
                    onChange: (A) => {
                      const S = A.currentTarget.value;
                      if (X(S), z("idle"), Le?.custom && !b)
                        try {
                          F(/anthropic/i.test(new URL(S).hostname) ? "anthropic" : "openai-compatible");
                        } catch {
                        }
                    },
                    placeholder: t(P === "anthropic" ? "modelSetup.anthropicUrlPlaceholder" : "modelSetup.openAiUrlPlaceholder"),
                    error: Pe.length > 0 && !te ? t("modelSetup.invalidUrl") : void 0,
                    onBlur: De
                  }
                )
              }
            ) : /* @__PURE__ */ e.jsxs(G, { size: "xs", c: "var(--nomi-ink-60)", children: [
              t("modelSetup.autoFilledUrl"),
              " ",
              /* @__PURE__ */ e.jsx(Me, { component: "button", type: "button", onClick: () => L(!0), c: "var(--nomi-accent)", inherit: !0, children: t("modelSetup.customize") })
            ] }),
            /* @__PURE__ */ e.jsxs(Re, { label: t("modelSetup.apiKey"), hint: t("modelSetup.apiKeyHint"), children: [
              /* @__PURE__ */ e.jsx(
                Ln,
                {
                  value: c,
                  onChange: (A) => {
                    j(A.currentTarget.value), z("idle");
                  },
                  onBlur: De,
                  placeholder: t("modelSetup.apiKeyPlaceholder"),
                  autoFocus: !0
                }
              ),
              Le?.keyUrl && /* @__PURE__ */ e.jsx(Me, { href: Le.keyUrl, target: "_blank", rel: "noreferrer", c: "var(--nomi-accent)", size: "xs", children: t("modelSetup.getKey", { provider: Le.label }) })
            ] }),
            /* @__PURE__ */ e.jsxs(se, { gap: 6, children: [
              /* @__PURE__ */ e.jsxs(ne, { gap: 6, align: "center", wrap: "nowrap", children: [
                /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink)", children: t("modelSetup.models") }),
                p.length > 0 && /* @__PURE__ */ e.jsxs(ne, { gap: 3, align: "center", wrap: "nowrap", children: [
                  /* @__PURE__ */ e.jsx(xe, { size: 13, stroke: 1.5, style: { color: "var(--workbench-success)" } }),
                  /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--workbench-success)", children: t("modelSetup.selectedCount", { count: p.length }) })
                ] })
              ] }),
              f && u.length === 0 ? (
                // 加载态（失焦自动拉取替用户干活）：明确告诉他「我没点但它在转」是正常的。
                /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 rounded-nomi border border-nomi-line px-3.5 py-3", children: [
                  /* @__PURE__ */ e.jsx(Uo, { size: "xs" }),
                  /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-60)", children: t("modelSetup.fetchingModels") })
                ] })
              ) : p.length > 0 ? (
                // 已选摘要：每行 id + 类型（可改）+ 删除；「修改所选」回第二屏增删。
                /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                  /* @__PURE__ */ e.jsx(se, { gap: 6, children: p.map((A) => /* @__PURE__ */ e.jsxs(ne, { gap: 8, wrap: "nowrap", align: "center", justify: "space-between", children: [
                    /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink)", style: { fontFamily: "var(--nomi-font-mono, monospace)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: A.id }),
                    /* @__PURE__ */ e.jsxs(ne, { gap: 4, wrap: "nowrap", align: "center", style: { flexShrink: 0 }, children: [
                      /* @__PURE__ */ e.jsx(
                        Wn,
                        {
                          value: A.kind,
                          onChange: (S) => {
                            S && gn(A.id, S);
                          },
                          data: a,
                          size: "xs",
                          allowDeselect: !1,
                          style: { width: 88 }
                        }
                      ),
                      /* @__PURE__ */ e.jsx(kn, { variant: "subtle", color: "gray", onClick: () => fn(A.id), "aria-label": t("modelSetup.removeModel", { id: A.id }), children: /* @__PURE__ */ e.jsx(Je, { size: 14 }) })
                    ] })
                  ] }, A.id)) }),
                  /* @__PURE__ */ e.jsx(Me, { component: "button", type: "button", size: "xs", c: "var(--nomi-accent)", onClick: () => V("select"), style: { alignSelf: "flex-start" }, children: t("modelSetup.modifySelection") })
                ] })
              ) : u.length > 0 ? (
                // 拉到候选池但还没选 → 进第二屏挑（opt-in 主路径）。
                /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 rounded-nomi border border-nomi-line px-3.5 py-3", children: [
                  /* @__PURE__ */ e.jsx(Go, { size: 18, stroke: 1.6, style: { color: "var(--nomi-ink-40)", flexShrink: 0 } }),
                  /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-60)", style: { flex: 1 }, children: t("modelSetup.fetchedNotSelected", { count: u.length }) }),
                  /* @__PURE__ */ e.jsx(me, { variant: "light", onClick: () => V("select"), children: t("modelSetup.chooseModels") })
                ] })
              ) : q ? (
                // 拉了但端点没列出 → 去第二屏手填 id（保留逃生口）。
                /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 rounded-nomi border border-nomi-line px-3.5 py-3", children: [
                  /* @__PURE__ */ e.jsx(Sn, { size: 16, stroke: 1.5, style: { color: "var(--nomi-ink-60)", flexShrink: 0 } }),
                  /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--nomi-ink-60)", style: { flex: 1 }, children: M || t("modelSetup.noModelsListed") }),
                  /* @__PURE__ */ e.jsx(me, { variant: "light", onClick: () => V("select"), children: t("modelSetup.manualSelect") })
                ] })
              ) : (
                // 还没拉 → 提示 + 显式拉取（失焦也会自动拉）。
                /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 rounded-nomi border border-nomi-line px-3.5 py-3", children: [
                  /* @__PURE__ */ e.jsx(yt, { size: 18, stroke: 1.6, style: { color: "var(--nomi-ink-40)", flexShrink: 0 } }),
                  /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-60)", style: { flex: 1 }, children: t("modelSetup.fetchHint") }),
                  /* @__PURE__ */ e.jsx(me, { variant: "light", onClick: We, disabled: !Se, loading: f, children: t("modelSetup.fetchModels") })
                ] })
              )
            ] }),
            Le?.custom && /* @__PURE__ */ e.jsxs(se, { gap: 6, children: [
              /* @__PURE__ */ e.jsxs(
                Me,
                {
                  component: "button",
                  type: "button",
                  size: "xs",
                  c: "var(--nomi-ink-60)",
                  onClick: () => U((A) => !A),
                  style: { alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4 },
                  children: [
                    K ? /* @__PURE__ */ e.jsx(In, { size: 13 }) : /* @__PURE__ */ e.jsx(ro, { size: 13 }),
                    t("modelSetup.advanced")
                  ]
                }
              ),
              /* @__PURE__ */ e.jsx(mo, { in: K, children: /* @__PURE__ */ e.jsxs(se, { gap: 12, children: [
                C ? /* @__PURE__ */ e.jsxs(Re, { label: t("modelSetup.protocol"), hint: t("modelSetup.protocolHint"), children: [
                  /* @__PURE__ */ e.jsx(
                    io,
                    {
                      value: P,
                      onChange: (A) => {
                        F(A), y(!0), z("idle");
                      },
                      data: [
                        { label: "Chat Completions", value: "openai-compatible" },
                        { label: "Responses", value: "openai-responses" },
                        { label: "Anthropic", value: "anthropic" }
                      ],
                      fullWidth: !0
                    }
                  ),
                  b && /* @__PURE__ */ e.jsx(
                    Me,
                    {
                      component: "button",
                      type: "button",
                      size: "xs",
                      c: "var(--nomi-ink-60)",
                      onClick: () => {
                        y(!1), I(!1), z("idle");
                      },
                      children: t("modelSetup.restoreAutoDetect")
                    }
                  )
                ] }) : /* @__PURE__ */ e.jsxs(G, { size: "xs", c: "var(--nomi-ink-60)", children: [
                  t("modelSetup.protocolSummary", { protocol: b ? Yn[P] : t("modelSetup.autoDetectOnSave") }),
                  " ",
                  /* @__PURE__ */ e.jsx(Me, { component: "button", type: "button", onClick: () => I(!0), c: "var(--nomi-accent)", inherit: !0, children: t("modelSetup.manualProtocol") })
                ] }),
                /* @__PURE__ */ e.jsxs(se, { gap: 4, children: [
                  _.length > 0 && /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink)", children: t("modelSetup.customHeaders") }),
                  _.length > 0 && /* @__PURE__ */ e.jsx(se, { gap: 6, children: _.map((A, S) => /* @__PURE__ */ e.jsxs(ne, { gap: 6, wrap: "nowrap", align: "flex-start", children: [
                    /* @__PURE__ */ e.jsx(
                      Ye,
                      {
                        value: A.key,
                        onChange: (Q) => ae(S, { key: Q.currentTarget.value }),
                        placeholder: t("modelSetup.headerNamePlaceholder"),
                        style: { flex: 1 }
                      }
                    ),
                    /* @__PURE__ */ e.jsx(
                      Ye,
                      {
                        value: A.value,
                        onChange: (Q) => ae(S, { value: Q.currentTarget.value }),
                        placeholder: t("modelSetup.headerValuePlaceholder"),
                        style: { flex: 1 }
                      }
                    ),
                    /* @__PURE__ */ e.jsx(
                      kn,
                      {
                        variant: "subtle",
                        color: "gray",
                        onClick: () => fe(S),
                        "aria-label": t("modelSetup.deleteHeader"),
                        children: /* @__PURE__ */ e.jsx(Ie, { size: 14 })
                      }
                    )
                  ] }, S)) }),
                  /* @__PURE__ */ e.jsx(ne, { justify: "flex-start", children: /* @__PURE__ */ e.jsx(me, { variant: "subtle", leftSection: /* @__PURE__ */ e.jsx(un, { size: 14 }), onClick: qe, children: t("modelSetup.addHeader") }) })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ e.jsxs(ne, { justify: "space-between", align: "center", children: [
              /* @__PURE__ */ e.jsxs(ne, { gap: 8, align: "center", children: [
                /* @__PURE__ */ e.jsx(
                  me,
                  {
                    variant: "subtle",
                    onClick: _e,
                    disabled: !Se || W === "testing",
                    loading: W === "testing",
                    children: t("modelSetup.testConnection")
                  }
                ),
                W === "ok" && /* @__PURE__ */ e.jsxs(ne, { gap: 4, align: "center", wrap: "nowrap", c: "var(--workbench-success)", children: [
                  /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--workbench-success)", children: T }),
                  /* @__PURE__ */ e.jsx(xe, { size: 14, stroke: 1.5 })
                ] }),
                W === "fail" && /* @__PURE__ */ e.jsxs(ne, { gap: 4, align: "center", wrap: "nowrap", c: "var(--workbench-danger)", children: [
                  /* @__PURE__ */ e.jsx(G, { size: "xs", c: "var(--workbench-danger)", lineClamp: 1, children: T }),
                  /* @__PURE__ */ e.jsx(Je, { size: 14, stroke: 1.5 })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx(
                me,
                {
                  variant: "filled",
                  onClick: () => {
                    Fe === "arm" ? ke(!0) : hn();
                  },
                  disabled: Fe === "disabled",
                  loading: ue,
                  title: Fe === "arm" ? t("modelSetup.saveFirstWarning") : Fe === "confirm" ? t("modelSetup.saveSecondWarning") : void 0,
                  children: t(Fe === "arm" ? "modelSetup.saveAnyway" : Fe === "confirm" ? "modelSetup.confirmUnverified" : "modelSetup.save")
                }
              )
            ] })
          ] })
        ] }),
        d === "input" && J === "select" && /* @__PURE__ */ e.jsx(
          Wt,
          {
            candidates: u,
            initialSelected: p,
            sourceName: m.trim(),
            host: (() => {
              try {
                return new URL(Z.trim()).hostname;
              } catch {
                return Z.trim();
              }
            })(),
            total: u.length,
            fetching: f,
            onRefetch: We,
            onBack: () => V("form"),
            onConfirm: je,
            onResolveKind: ce
          }
        ),
        d === "success" && /* @__PURE__ */ e.jsxs(se, { gap: 12, align: "center", py: 8, children: [
          /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-center size-12 rounded-full bg-workbench-success-soft text-workbench-success", children: /* @__PURE__ */ e.jsx(xe, { size: 26, stroke: 1.8 }) }),
          /* @__PURE__ */ e.jsxs(se, { gap: 2, align: "center", children: [
            /* @__PURE__ */ e.jsx(G, { size: "md", fw: 600, c: "var(--nomi-ink)", children: t("modelSetup.added", { name: Ae }) }),
            /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-60)", children: t("modelSetup.addedHint") })
          ] }),
          /* @__PURE__ */ e.jsxs(ne, { justify: "center", gap: 8, w: "100%", mt: 4, children: [
            /* @__PURE__ */ e.jsx(me, { variant: "subtle", onClick: () => {
              re();
            }, children: t("modelSetup.addAnother") }),
            /* @__PURE__ */ e.jsx(me, { variant: "filled", onClick: r, children: t("modelSetup.done") })
          ] })
        ] }),
        d === "error" && /* @__PURE__ */ e.jsxs(se, { gap: "sm", children: [
          /* @__PURE__ */ e.jsx(G, { size: "md", c: "var(--nomi-ink)", children: t("modelSetup.addFailed") }),
          /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink)", children: be }),
          Y && /* @__PURE__ */ e.jsx(G, { size: "sm", c: "var(--nomi-ink-60)", children: Y }),
          /* @__PURE__ */ e.jsxs(ne, { justify: "flex-end", children: [
            /* @__PURE__ */ e.jsx(me, { variant: "subtle", onClick: re, children: t("modelSetup.retryEdit") }),
            /* @__PURE__ */ e.jsx(me, { onClick: r, children: t("modelSetup.close") })
          ] })
        ] })
      ] })
    }
  );
}
function Xe({
  glyph: n,
  glyphTone: r = "ink",
  name: s,
  subtitle: o,
  status: t,
  statusLabel: a,
  badge: l,
  headerAction: d,
  defaultExpanded: N = !1,
  children: h
}) {
  const { t: c } = pe(), [j, m] = i.useState(N), x = i.useId();
  return /* @__PURE__ */ e.jsxs("div", { className: "border border-nomi-line rounded-nomi bg-nomi-paper overflow-hidden", children: [
    /* @__PURE__ */ e.jsxs("div", { className: E("flex items-center", j && "bg-nomi-ink-05"), children: [
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          "aria-expanded": j,
          "aria-controls": x,
          onClick: () => m((k) => !k),
          className: E(
            "flex items-center gap-3 p-3 flex-1 min-w-0 text-left",
            "hover:bg-nomi-ink-05"
          ),
          children: [
            /* @__PURE__ */ e.jsx(
              "span",
              {
                className: E(
                  "w-7 h-7 rounded-nomi-sm grid place-items-center shrink-0 overflow-hidden text-body-sm font-semibold",
                  r === "logo" && "bg-nomi-paper border border-nomi-line p-0.5",
                  r === "soft" && "bg-nomi-ink-05 text-nomi-ink-60",
                  r === "ink" && "bg-nomi-ink text-nomi-paper"
                ),
                "aria-hidden": !0,
                children: n
              }
            ),
            /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ e.jsx("span", { className: "block text-body-sm font-semibold text-nomi-ink truncate", children: s }),
              /* @__PURE__ */ e.jsx("span", { className: "block text-caption text-nomi-ink-40 truncate", children: o })
            ] }),
            l ? /* @__PURE__ */ e.jsx("span", { className: "shrink-0", children: l }) : null,
            /* @__PURE__ */ e.jsxs(
              "span",
              {
                className: E(
                  "inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-micro font-semibold shrink-0",
                  t === "ok" ? "bg-[var(--workbench-success-soft)] text-[var(--workbench-success-ink)]" : "bg-nomi-ink-10 text-nomi-ink-60"
                ),
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: E("w-1.5 h-1.5 rounded-full", t === "ok" ? "bg-workbench-success" : "bg-nomi-ink-30") }),
                  a ?? c(t === "ok" ? "onboardingProviders.modelControls.connected" : "onboardingProviders.modelControls.pending")
                ]
              }
            ),
            /* @__PURE__ */ e.jsx(
              In,
              {
                size: 16,
                stroke: 1.8,
                className: E("shrink-0 text-nomi-ink-40 transition-transform duration-150", j && "rotate-180")
              }
            )
          ]
        }
      ),
      d ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center shrink-0 pl-0.5 pr-2", children: d }) : null
    ] }),
    j ? /* @__PURE__ */ e.jsx("div", { id: x, className: "border-t border-nomi-line-soft p-3 flex flex-col gap-3", children: h }) : null
  ] });
}
function Ot({ models: n, connected: r, onToggle: s, onDelete: o }) {
  const { t } = pe();
  return n.length === 0 ? null : /* @__PURE__ */ e.jsx(e.Fragment, { children: Dn(n).map(({ kind: a, models: l }) => {
    const d = l.filter((h) => h.enabled).length, N = s ? Lt(l) : l;
    return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "text-micro font-semibold text-nomi-ink-60", children: [
        a in { text: 1, image: 1, video: 1, audio: 1, model3d: 1 } ? t(`onboardingProviders.modelControls.kind.${a}`) : a,
        " ",
        /* @__PURE__ */ e.jsx("span", { className: "font-normal text-nomi-ink-40", children: s ? `${d} / ${l.length}` : l.length })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex flex-wrap gap-2", children: N.map((h) => {
        const c = /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          s && h.enabled ? /* @__PURE__ */ e.jsx(xe, { size: 12, stroke: 2.4, className: "text-nomi-accent", "aria-hidden": "true" }) : /* @__PURE__ */ e.jsx("span", { className: E("w-1.5 h-1.5 rounded-full", r && h.enabled ? "bg-workbench-success" : "bg-nomi-ink-20") }),
          h.labelZh,
          o ? (
            // span role=button 而非 <button>：chip 在 toggle 模式下本身是 button，嵌套 button 非法。
            /* @__PURE__ */ e.jsx(
              "span",
              {
                role: "button",
                tabIndex: 0,
                "aria-label": t("onboardingProviders.modelControls.removeModelAria", { name: h.labelZh }),
                onClick: (j) => {
                  j.stopPropagation(), o(h);
                },
                onKeyDown: (j) => {
                  (j.key === "Enter" || j.key === " ") && (j.preventDefault(), j.stopPropagation(), o(h));
                },
                className: "ml-0.5 inline-flex cursor-pointer text-nomi-ink-30 hover:text-workbench-danger",
                children: /* @__PURE__ */ e.jsx(Je, { size: 12, stroke: 2 })
              }
            )
          ) : null
        ] });
        return s ? /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            "aria-pressed": h.enabled,
            title: h.enabled ? t("onboardingProviders.modelControls.enabledTitle") : t("onboardingProviders.modelControls.hiddenTitle"),
            onClick: () => s(h, !h.enabled),
            className: E(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-caption cursor-pointer",
              "transition-colors duration-[var(--nomi-transition-fast)]",
              h.enabled ? "border-nomi-accent-soft bg-nomi-accent-soft text-nomi-ink hover:border-nomi-accent" : "border-nomi-line text-nomi-ink-40 hover:border-nomi-ink-20 hover:text-nomi-ink-60"
            ),
            children: c
          },
          `${h.vendorKey}-${h.modelKey}`
        ) : /* @__PURE__ */ e.jsx(
          "span",
          {
            className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-nomi-line text-caption text-nomi-ink-80",
            children: c
          },
          `${h.vendorKey}-${h.modelKey}`
        );
      }) })
    ] }, a);
  }) });
}
function Bt({
  directory: n,
  vendorName: r,
  baseUrl: s,
  hasApiKey: o,
  models: t,
  onToggleModel: a,
  onChanged: l
}) {
  const { t: d } = pe(), [N, h] = i.useState(!o), [c, j] = i.useState({}), [m, x] = i.useState(!1), [k, w] = i.useState(""), [D, L] = i.useState(!1), [P, F] = i.useState("");
  i.useEffect(() => {
    h(!o);
  }, [o]);
  const b = t.length, y = i.useMemo(
    () => n.credentialFields ?? [
      {
        key: "apiKey",
        label: "",
        placeholder: n.credentialPlaceholder ?? d("onboardingProviders.vendorCard.defaultKeyPlaceholder"),
        secret: !0
      }
    ],
    [n.credentialFields, n.credentialPlaceholder, d]
  ), C = y.length > 1, I = i.useCallback((p, H) => {
    j((u) => ({ ...u, [p]: H }));
  }, []), K = i.useCallback(() => {
    const p = y.map((B) => (c[B.key] ?? "").trim());
    if (p.some((B) => !B)) {
      w(
        d(C ? "onboardingProviders.vendorCard.fillAllCredentials" : "onboardingProviders.vendorCard.pasteApiKeyFirst")
      );
      return;
    }
    const H = p.join(n.credentialJoin ?? ":"), u = ie();
    if (u) {
      x(!0), w("");
      try {
        u.modelCatalog.upsertVendorApiKey(n.vendorKey, { apiKey: H, enabled: !0 }), j({}), h(!1), l();
      } catch (B) {
        w(
          d("onboardingProviders.vendorCard.unlockFailed", { message: B instanceof Error ? B.message : String(B) })
        );
      } finally {
        x(!1);
      }
    }
  }, [y, c, C, n.vendorKey, n.credentialJoin, l, d]), U = i.useCallback(async () => {
    const p = ie();
    if (!(!p || !await Ze({
      title: d("onboardingProviders.vendorCard.disconnectTitle"),
      message: d("onboardingProviders.vendorCard.disconnectMessage", { name: r }),
      confirmLabel: d("onboardingProviders.vendorCard.disconnect"),
      danger: !0
    }))) {
      x(!0), w("");
      try {
        p.modelCatalog.clearVendorApiKey(n.vendorKey), l();
      } catch (u) {
        w(
          d("onboardingProviders.vendorCard.disconnectFailed", { message: u instanceof Error ? u.message : String(u) })
        );
      } finally {
        x(!1);
      }
    }
  }, [n.vendorKey, r, l, d]), Z = i.useCallback(() => {
    const p = P.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/\S+$/.test(p)) {
      w(d("onboardingProviders.vendorCard.invalidAddress"));
      return;
    }
    const H = ie();
    if (H) {
      x(!0), w("");
      try {
        H.modelCatalog.upsertVendor({ key: n.vendorKey, baseUrlHint: p }), L(!1), l();
      } catch (u) {
        w(d("onboardingProviders.vendorCard.saveFailed", { message: u instanceof Error ? u.message : String(u) }));
      } finally {
        x(!1);
      }
    }
  }, [P, n.vendorKey, l, d]), X = i.useCallback(() => {
    n.promo && window.open(n.promo.url, "_blank", "noopener");
  }, [n.promo]);
  return /* @__PURE__ */ e.jsxs(
    Xe,
    {
      glyph: n.logo ? /* @__PURE__ */ e.jsx("img", { src: n.logo, alt: "", className: "w-full h-full object-contain" }) : n.glyph,
      glyphTone: n.logo ? "logo" : "ink",
      name: r,
      subtitle: o ? d("onboardingProviders.vendorCard.modelsAvailable", { count: b }) : n.tagline,
      status: o ? "ok" : "todo",
      badge: !o && n.recommended ? /* @__PURE__ */ e.jsx("span", { className: "text-micro font-semibold text-nomi-accent bg-nomi-accent-soft rounded-full px-2 py-[2px] whitespace-nowrap", children: d("onboardingProviders.vendorCard.recommended") }) : void 0,
      defaultExpanded: !1,
      children: [
        N ? /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2", children: [
          C ? (
            // 多段凭证：每段一个标注好的独立框，别让用户自己拼（D1）。
            /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2.5", children: [
              y.map((p) => /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ e.jsx(
                  "label",
                  {
                    htmlFor: `${n.vendorKey}-${p.key}`,
                    className: "text-caption font-medium text-nomi-ink-80",
                    children: p.label
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  "input",
                  {
                    id: `${n.vendorKey}-${p.key}`,
                    type: p.secret ? "password" : "text",
                    "aria-label": `${r} ${p.label}`,
                    placeholder: p.placeholder,
                    value: c[p.key] ?? "",
                    onChange: (H) => I(p.key, H.currentTarget.value),
                    onKeyDown: (H) => {
                      H.key === "Enter" && K();
                    },
                    disabled: m,
                    className: E(
                      "h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
                      "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40",
                      "outline-none focus:border-nomi-accent"
                    )
                  }
                ),
                p.hint ? /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40", children: p.hint }) : null
              ] }, p.key)),
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: K,
                    disabled: m,
                    className: E(
                      "shrink-0 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
                      "text-body-sm font-semibold inline-flex items-center gap-1.5",
                      "hover:bg-nomi-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    ),
                    children: [
                      /* @__PURE__ */ e.jsx(jn, { size: 14, stroke: 1.6 }),
                      d("onboardingProviders.vendorCard.unlock")
                    ]
                  }
                ),
                o ? /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => h(!1),
                    disabled: m,
                    className: "text-caption text-nomi-ink-40 hover:text-nomi-ink-60",
                    children: d("common.cancel")
                  }
                ) : null
              ] })
            ] })
          ) : (
            // 单段凭证：输入框 + 解锁按钮同排（绝大多数家）。
            /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ e.jsx(
                  "input",
                  {
                    type: y[0].secret ? "password" : "text",
                    "aria-label": d("onboardingProviders.vendorCard.apiKeyAria", { name: r }),
                    placeholder: y[0].placeholder,
                    value: c[y[0].key] ?? "",
                    onChange: (p) => I(y[0].key, p.currentTarget.value),
                    onKeyDown: (p) => {
                      p.key === "Enter" && K();
                    },
                    disabled: m,
                    className: E(
                      "flex-1 min-w-0 h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
                      "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40",
                      "outline-none focus:border-nomi-accent"
                    )
                  }
                ),
                /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: K,
                    disabled: m,
                    className: E(
                      "shrink-0 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
                      "text-body-sm font-semibold inline-flex items-center gap-1.5",
                      "hover:bg-nomi-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    ),
                    children: [
                      /* @__PURE__ */ e.jsx(jn, { size: 14, stroke: 1.6 }),
                      d("onboardingProviders.vendorCard.unlock")
                    ]
                  }
                )
              ] }),
              o ? /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => h(!1),
                  disabled: m,
                  className: "self-start text-caption text-nomi-ink-40 hover:text-nomi-ink-60",
                  children: d("common.cancel")
                }
              ) : null
            ] })
          ),
          /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-40", children: n.credentialHint ?? d("onboardingProviders.vendorCard.credentialHint") })
        ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: d("onboardingProviders.vendorCard.credentialSaved") }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => h(!0),
                disabled: m,
                className: "text-caption text-nomi-ink-60 border border-nomi-line rounded-full px-2.5 py-[3px] hover:border-nomi-ink-20",
                children: d("onboardingProviders.vendorCard.replace")
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: U,
                disabled: m,
                className: "text-caption text-nomi-ink-40 px-1 hover:text-workbench-danger",
                children: d("onboardingProviders.vendorCard.disconnect")
              }
            )
          ] })
        ] }),
        k ? /* @__PURE__ */ e.jsx("div", { className: "text-caption text-workbench-danger", children: k }) : null,
        D ? /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              "aria-label": d("onboardingProviders.vendorCard.addressAria", { name: r }),
              placeholder: d("onboardingProviders.vendorCard.addressPlaceholder"),
              value: P,
              onChange: (p) => F(p.currentTarget.value),
              onKeyDown: (p) => {
                p.key === "Enter" && Z(), p.key === "Escape" && (L(!1), w(""));
              },
              disabled: m,
              autoFocus: !0,
              className: E(
                "flex-1 min-w-0 h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
                "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40",
                "outline-none focus:border-nomi-accent"
              )
            }
          ),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: Z,
              disabled: m,
              className: E(
                "shrink-0 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
                "text-body-sm font-semibold",
                "hover:bg-nomi-accent disabled:opacity-50 disabled:cursor-not-allowed"
              ),
              children: d("onboardingProviders.vendorCard.save")
            }
          ),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                L(!1), w("");
              },
              disabled: m,
              className: "shrink-0 text-caption text-nomi-ink-40 hover:text-nomi-ink-60",
              children: d("common.cancel")
            }
          )
        ] }) : s ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-30 truncate", children: d("onboardingProviders.vendorCard.address", { address: s }) }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              "aria-label": d("onboardingProviders.vendorCard.editAddressAria", { name: r }),
              onClick: () => {
                F(s), L(!0);
              },
              disabled: m,
              className: "shrink-0 p-0.5 text-nomi-ink-30 hover:text-nomi-ink-60",
              children: /* @__PURE__ */ e.jsx(zn, { size: 13, stroke: 1.6 })
            }
          )
        ] }) : null,
        /* @__PURE__ */ e.jsx(Ot, { models: t, connected: o, onToggle: o ? a : void 0 }),
        n.promo ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 border-t border-nomi-line-soft pt-3", children: [
          /* @__PURE__ */ e.jsx("span", { className: "flex-1 min-w-0 text-caption text-nomi-ink-40 leading-snug", children: n.promo.text }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: X,
              className: "shrink-0 inline-flex items-center gap-1 text-caption text-nomi-ink-60 hover:text-nomi-accent",
              children: [
                n.promo.ctaLabel,
                /* @__PURE__ */ e.jsx(pn, { size: 13, stroke: 1.6 })
              ]
            }
          )
        ] }) : null
      ]
    }
  );
}
function en({
  title: n,
  count: r,
  defaultExpanded: s = !1,
  children: o
}) {
  const [t, a] = i.useState(s), l = i.useId();
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        "aria-expanded": t,
        "aria-controls": l,
        onClick: () => a((d) => !d),
        className: "flex items-center gap-1.5 w-full text-left px-0.5 py-1.5 group",
        children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-micro font-semibold text-nomi-ink-40", children: n }),
          r != null && r > 0 ? /* @__PURE__ */ e.jsxs("span", { className: "text-micro text-nomi-ink-30", children: [
            "· ",
            r
          ] }) : null,
          /* @__PURE__ */ e.jsx("span", { className: "flex-1" }),
          /* @__PURE__ */ e.jsx(
            In,
            {
              size: 15,
              stroke: 1.8,
              className: E(
                "shrink-0 text-nomi-ink-30 transition-transform duration-150 group-hover:text-nomi-ink-40",
                t && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    t ? /* @__PURE__ */ e.jsx("div", { id: l, className: "flex flex-col gap-2 pt-0.5", children: o }) : null
  ] });
}
function Tt(n, r) {
  const s = r.trim().toLowerCase();
  return s ? n.filter(
    (o) => o.labelZh.toLowerCase().includes(s) || o.modelKey.toLowerCase().includes(s)
  ) : n;
}
function Qn(n) {
  return n.reduce((r, s) => s.enabled ? r + 1 : r, 0);
}
function Ut(n, r) {
  return n.filter((s) => s.enabled !== r);
}
function an(n) {
  return `${n.vendorKey}\0${n.modelKey}`;
}
function Rt(n, r) {
  return r.size === 0 ? [] : n.filter((s) => r.has(an(s)));
}
const Oe = "h-6 px-2.5 rounded-full border text-micro inline-flex items-center gap-1";
function Yt({ models: n, onToggle: r, onDelete: s }) {
  const { t: o } = pe(), [t, a] = i.useState(""), [l, d] = i.useState(!1), [N, h] = i.useState(() => /* @__PURE__ */ new Set()), c = i.useMemo(() => Tt(n, t), [n, t]), j = i.useMemo(() => Dn(c), [c]), m = Qn(n), x = i.useMemo(() => Rt(n, N), [n, N]), k = i.useCallback((b) => {
    const y = Ut(c, b);
    y.length > 0 && r(y, b);
  }, [c, r]), w = i.useCallback(() => {
    d(!1), h(/* @__PURE__ */ new Set());
  }, []), D = i.useCallback((b) => {
    h((y) => {
      const C = new Set(y);
      return C.has(b) ? C.delete(b) : C.add(b), C;
    });
  }, []), L = c.length > 0 && c.every((b) => N.has(an(b))), P = i.useCallback(() => {
    h((b) => {
      const y = c.map(an), C = y.length > 0 && y.every((K) => b.has(K)), I = new Set(b);
      return y.forEach((K) => C ? I.delete(K) : I.add(K)), I;
    });
  }, [c]), F = i.useCallback(() => {
    x.length !== 0 && (s(x), w());
  }, [x, s, w]);
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2.5", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ e.jsx(Ro, { size: 14, stroke: 1.7, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-nomi-ink-40" }),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          type: "text",
          "aria-label": o("onboardingProviders.modelControls.searchAria"),
          placeholder: o("onboardingProviders.modelControls.searchPlaceholder"),
          value: t,
          onChange: (b) => a(b.currentTarget.value),
          className: E(
            "w-full h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper pl-8 pr-2.5",
            "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40 outline-none focus:border-nomi-accent"
          )
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between gap-2", children: l ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ e.jsx("button", { type: "button", onClick: P, className: E(Oe, "border-nomi-line text-nomi-ink-60 hover:border-nomi-ink-20"), children: o(L ? "onboardingProviders.modelControls.selectNone" : "onboardingProviders.modelControls.selectAll") }),
        /* @__PURE__ */ e.jsx("button", { type: "button", onClick: w, className: E(Oe, "border-nomi-line text-nomi-ink-60 hover:border-nomi-ink-20"), children: o("common.cancel") })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: o("onboardingProviders.modelControls.selectedCount", { count: x.length }) }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            disabled: x.length === 0,
            onClick: F,
            className: E(Oe, "border-[var(--workbench-danger-soft)] text-workbench-danger hover:bg-[var(--workbench-danger-soft)] disabled:opacity-40"),
            children: [
              /* @__PURE__ */ e.jsx(Ie, { size: 12, stroke: 1.8 }),
              o("onboardingProviders.modelControls.deleteSelected")
            ]
          }
        )
      ] })
    ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => k(!0), className: E(Oe, "border-nomi-line text-nomi-ink-60 hover:border-nomi-ink-20"), children: o("onboardingProviders.modelControls.selectAll") }),
        /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => k(!1), className: E(Oe, "border-nomi-line text-nomi-ink-60 hover:border-nomi-ink-20"), children: o("onboardingProviders.modelControls.selectNone") }),
        n.length > 0 ? /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => d(!0),
            className: E(Oe, "border-nomi-line text-nomi-ink-60 hover:text-workbench-danger hover:border-[var(--workbench-danger-soft)]"),
            children: [
              /* @__PURE__ */ e.jsx(Ie, { size: 12, stroke: 1.8 }),
              o("onboardingProviders.modelControls.bulkDelete")
            ]
          }
        ) : null
      ] }),
      /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: o("onboardingProviders.modelControls.enabledCount", { enabled: m, total: n.length }) })
    ] }) }),
    j.length === 0 ? /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-40 text-center py-5", children: o("onboardingProviders.modelControls.noMatchQuery", { query: t }) }) : /* @__PURE__ */ e.jsx("div", { className: "flex flex-col max-h-[300px] overflow-y-auto -mx-1 px-1", children: j.map((b) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsxs("div", { className: "text-micro font-semibold text-nomi-ink-60 mt-2 mb-1 px-1", children: [
        b.kind in ko ? o(`onboardingProviders.modelControls.kind.${b.kind}`) : b.kind,
        " ",
        /* @__PURE__ */ e.jsxs("span", { className: "font-normal text-nomi-ink-40", children: [
          Qn(b.models),
          "/",
          b.models.length
        ] })
      ] }),
      b.models.map((y) => {
        const C = an(y);
        if (l) {
          const I = N.has(C);
          return /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              role: "checkbox",
              "aria-checked": I,
              "aria-label": o(I ? "onboardingProviders.modelControls.deselectModelAria" : "onboardingProviders.modelControls.selectModelAria", { name: y.labelZh }),
              onClick: () => D(C),
              className: E(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-nomi-sm text-left hover:bg-nomi-ink-05",
                y.enabled ? "" : "opacity-55"
              ),
              children: [
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: E(
                      "w-[18px] h-[18px] rounded-nomi-sm shrink-0 grid place-items-center border",
                      I ? "bg-workbench-danger border-workbench-danger text-nomi-paper" : "bg-nomi-paper border-nomi-ink-20 text-transparent"
                    ),
                    children: /* @__PURE__ */ e.jsx(xe, { size: 12, stroke: 2.4 })
                  }
                ),
                /* @__PURE__ */ e.jsx("span", { className: E("flex-1 min-w-0 text-body-sm truncate", y.enabled ? "text-nomi-ink" : "text-nomi-ink-60"), children: y.labelZh })
              ]
            },
            `${y.vendorKey}-${y.modelKey}`
          );
        }
        return /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: E(
              "group flex items-center gap-2.5 px-2 py-1.5 rounded-nomi-sm hover:bg-nomi-ink-05",
              y.enabled ? "" : "opacity-55"
            ),
            children: [
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  role: "checkbox",
                  "aria-checked": y.enabled,
                  "aria-label": o(y.enabled ? "onboardingProviders.modelControls.disableModelAria" : "onboardingProviders.modelControls.enableModelAria", { name: y.labelZh }),
                  onClick: () => r([y], !y.enabled),
                  className: E(
                    "w-[18px] h-[18px] rounded-nomi-sm shrink-0 grid place-items-center border",
                    y.enabled ? "bg-nomi-accent border-nomi-accent text-nomi-paper" : "bg-nomi-paper border-nomi-ink-20 text-transparent"
                  ),
                  children: /* @__PURE__ */ e.jsx(xe, { size: 12, stroke: 2.4 })
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => r([y], !y.enabled),
                  className: E("flex-1 min-w-0 text-left text-body-sm truncate", y.enabled ? "text-nomi-ink" : "text-nomi-ink-60"),
                  children: y.labelZh
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": o("onboardingProviders.modelControls.deleteModelAria", { name: y.labelZh }),
                  title: o("onboardingProviders.modelControls.deleteModelTitle"),
                  onClick: () => s([y]),
                  className: "shrink-0 p-1 text-nomi-ink-30 hover:text-workbench-danger",
                  children: /* @__PURE__ */ e.jsx(Ie, { size: 13, stroke: 1.7 })
                }
              )
            ]
          },
          `${y.vendorKey}-${y.modelKey}`
        );
      })
    ] }, b.kind)) })
  ] });
}
async function Ao(n) {
  const r = ie();
  if (!r) return { deleted: !1 };
  if (!await Ze({
    title: $e.t("onboardingProviders.drawer.deleteVendorDialog.title"),
    message: $e.t("onboardingProviders.drawer.deleteVendorDialog.message", {
      name: n.vendorName,
      count: n.modelCount
    }),
    confirmLabel: $e.t("onboardingProviders.drawer.deleteVendorDialog.confirm"),
    danger: !0
  })) return { deleted: !1 };
  try {
    return r.modelCatalog.deleteVendor(n.vendorKey), n.onChanged(), { deleted: !0 };
  } catch (o) {
    return {
      deleted: !1,
      error: $e.t("onboardingProviders.drawer.deleteVendorDialog.failed", {
        message: o instanceof Error ? o.message : String(o)
      })
    };
  }
}
function Qt({
  vendorKey: n,
  vendorName: r,
  baseUrl: s,
  hasApiKey: o,
  modelCount: t,
  onChanged: a
}) {
  const { t: l } = pe(), [d, N] = i.useState(!o), [h, c] = i.useState(""), [j, m] = i.useState(!1), [x, k] = i.useState(""), [w, D] = i.useState(!1), [L, P] = i.useState("");
  i.useEffect(() => {
    N(!o);
  }, [o]);
  const F = i.useCallback(() => {
    const I = h.trim();
    if (!I) {
      P(l("onboardingProviders.vendorCard.pasteApiKeyFirst"));
      return;
    }
    const K = ie();
    if (K) {
      D(!0), P("");
      try {
        K.modelCatalog.upsertVendorApiKey(n, { apiKey: I, enabled: !0 }), c(""), N(!1), a();
      } catch (U) {
        P(l("onboardingProviders.vendorCard.saveFailed", { message: U instanceof Error ? U.message : String(U) }));
      } finally {
        D(!1);
      }
    }
  }, [h, n, a, l]), b = i.useCallback(async () => {
    const I = ie();
    if (!(!I || !await Ze({
      title: l("onboardingProviders.vendorCard.disconnectTitle"),
      message: l("onboardingProviders.vendorCard.disconnectMessage", { name: r }),
      confirmLabel: l("onboardingProviders.vendorCard.disconnect"),
      danger: !0
    }))) {
      D(!0), P("");
      try {
        I.modelCatalog.clearVendorApiKey(n), a();
      } catch (U) {
        P(
          l("onboardingProviders.vendorCard.disconnectFailed", { message: U instanceof Error ? U.message : String(U) })
        );
      } finally {
        D(!1);
      }
    }
  }, [n, r, a, l]), y = i.useCallback(() => {
    const I = x.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/\S+$/.test(I)) {
      P(l("onboardingProviders.vendorCard.invalidAddress"));
      return;
    }
    const K = ie();
    if (K) {
      D(!0), P("");
      try {
        K.modelCatalog.upsertVendor({ key: n, baseUrlHint: I }), m(!1), a();
      } catch (U) {
        P(l("onboardingProviders.vendorCard.saveFailed", { message: U instanceof Error ? U.message : String(U) }));
      } finally {
        D(!1);
      }
    }
  }, [x, n, a, l]), C = i.useCallback(async () => {
    D(!0), P("");
    const I = await Ao({ vendorKey: n, vendorName: r, modelCount: t, onChanged: a });
    I.error && P(I.error), D(!1);
  }, [n, r, t, a]);
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2.5 border-t border-nomi-line-soft pt-3", children: [
    d ? /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "password",
            "aria-label": l("onboardingProviders.vendorCard.apiKeyAria", { name: r }),
            placeholder: l("onboardingProviders.customVendor.newKeyPlaceholder"),
            value: h,
            onChange: (I) => c(I.currentTarget.value),
            onKeyDown: (I) => {
              I.key === "Enter" && F();
            },
            disabled: w,
            className: E(
              "flex-1 min-w-0 h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
              "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40 outline-none focus:border-nomi-accent"
            )
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: F,
            disabled: w,
            className: E(
              "shrink-0 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper text-body-sm font-semibold",
              "inline-flex items-center gap-1.5 hover:bg-nomi-accent disabled:opacity-50 disabled:cursor-not-allowed"
            ),
            children: [
              /* @__PURE__ */ e.jsx(jn, { size: 14, stroke: 1.6 }),
              l("onboardingProviders.vendorCard.save")
            ]
          }
        )
      ] }),
      o ? /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => N(!1),
          disabled: w,
          className: "self-start text-caption text-nomi-ink-40 hover:text-nomi-ink-60",
          children: l("common.cancel")
        }
      ) : null
    ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: l("onboardingProviders.vendorCard.credentialSaved") }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => N(!0),
            disabled: w,
            className: "text-caption text-nomi-ink-60 border border-nomi-line rounded-full px-2.5 py-[3px] hover:border-nomi-ink-20",
            children: l("onboardingProviders.vendorCard.replace")
          }
        ),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: b,
            disabled: w,
            className: "text-caption text-nomi-ink-40 px-1 hover:text-workbench-danger",
            children: l("onboardingProviders.vendorCard.disconnect")
          }
        )
      ] })
    ] }),
    j ? /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ e.jsx(
        "input",
        {
          type: "text",
          "aria-label": l("onboardingProviders.vendorCard.addressAria", { name: r }),
          placeholder: l("onboardingProviders.vendorCard.addressPlaceholder"),
          value: x,
          onChange: (I) => k(I.currentTarget.value),
          onKeyDown: (I) => {
            I.key === "Enter" && y(), I.key === "Escape" && (m(!1), P(""));
          },
          disabled: w,
          autoFocus: !0,
          className: E(
            "flex-1 min-w-0 h-8 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
            "text-body-sm text-nomi-ink placeholder:text-nomi-ink-40 outline-none focus:border-nomi-accent"
          )
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: y,
          disabled: w,
          className: "shrink-0 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper text-body-sm font-semibold hover:bg-nomi-accent disabled:opacity-50",
          children: l("onboardingProviders.vendorCard.save")
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            m(!1), P("");
          },
          disabled: w,
          className: "shrink-0 text-caption text-nomi-ink-40 hover:text-nomi-ink-60",
          children: l("common.cancel")
        }
      )
    ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
      /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-30 truncate", children: l("onboardingProviders.vendorCard.address", {
        address: s || l("onboardingProviders.customVendor.notSet")
      }) }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": l("onboardingProviders.vendorCard.editAddressAria", { name: r }),
          onClick: () => {
            k(s), m(!0);
          },
          disabled: w,
          className: "shrink-0 p-0.5 text-nomi-ink-30 hover:text-nomi-ink-60",
          children: /* @__PURE__ */ e.jsx(zn, { size: 13, stroke: 1.6 })
        }
      )
    ] }),
    L ? /* @__PURE__ */ e.jsx("div", { className: "text-caption text-workbench-danger", children: L }) : null,
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        onClick: C,
        disabled: w,
        className: E(
          "self-start inline-flex items-center gap-1.5 h-8 px-2.5 rounded-nomi-sm",
          "text-caption text-workbench-danger border border-[var(--workbench-danger-soft)]",
          "hover:bg-[var(--workbench-danger-soft)] disabled:opacity-50"
        ),
        children: [
          /* @__PURE__ */ e.jsx(Ie, { size: 14, stroke: 1.7 }),
          l("onboardingProviders.customVendor.deleteEntire")
        ]
      }
    )
  ] });
}
const Qe = "codex-local", Gt = "Codex 生图（登录额度）", Jt = "https://github.com/aqm857886159/Nomi/blob/main/docs/guide/capability-core-cli-mcp.md", Gn = { claude: "Claude Code", codex: "Codex", cursor: "Cursor" }, yn = ["claude", "codex", "cursor"];
function Jn(n) {
  try {
    ie()?.modelCatalog?.upsertVendor({ key: Qe, enabled: n });
  } catch {
  }
}
function Vn({ info: n, onChanged: r }) {
  const { t: s } = pe(), [o, t] = i.useState("claude"), a = i.useRef(!1), [l, d] = i.useState(!1), [N, h] = i.useState(!1), [c, j] = i.useState(""), m = ie()?.capability;
  if (i.useEffect(() => {
    if (!n || a.current) return;
    a.current = !0;
    const b = yn.find((y) => n.clients[y]?.installed);
    b && t(b);
  }, [n]), !m?.mcpInfo || !n) return null;
  const x = Gn[o], k = n.clients[o], w = yn.some((b) => n.clients[b]?.installed), D = () => {
    if (m.installMcp) {
      d(!0), j("");
      try {
        m.installMcp(o), o === "codex" && Jn(!0), r(), le(s("onboardingProviders.assistant.connectedToast", { client: x }), "success");
      } catch (b) {
        j(s("onboardingProviders.assistant.connectFailed", { message: b instanceof Error ? b.message : String(b) }));
      } finally {
        d(!1);
      }
    }
  }, L = () => {
    if (m.uninstallMcp) {
      d(!0), j("");
      try {
        m.uninstallMcp(o), o === "codex" && Jn(!1), r(), le(s("onboardingProviders.assistant.disconnectedToast"), "success");
      } catch (b) {
        j(s("onboardingProviders.assistant.disconnectFailed", { message: b instanceof Error ? b.message : String(b) }));
      } finally {
        d(!1);
      }
    }
  }, P = () => {
    navigator.clipboard.writeText(k.snippet).then(() => {
      h(!0), le(s("onboardingProviders.assistant.copiedToast"), "success"), window.setTimeout(() => h(!1), 1600);
    });
  }, F = k.installed ? s("onboardingProviders.assistant.status.connected") : n.tokenReady ? s("onboardingProviders.assistant.status.ready") : s("onboardingProviders.assistant.status.notReady");
  return /* @__PURE__ */ e.jsxs(
    Xe,
    {
      glyph: /* @__PURE__ */ e.jsx(zt, { size: 16, stroke: 1.6 }),
      glyphTone: "ink",
      name: s("onboardingProviders.assistant.name"),
      subtitle: s("onboardingProviders.assistant.subtitle"),
      status: w || n.tokenReady ? "ok" : "todo",
      statusLabel: F,
      defaultExpanded: !1,
      children: [
        n.tokenReady ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx(
            io,
            {
              size: "xs",
              fullWidth: !0,
              value: o,
              onChange: (b) => t(b),
              data: yn.map((b) => ({ label: Gn[b], value: b }))
            }
          ),
          k.installed ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-[var(--workbench-success-soft)] px-3 py-2.5", children: [
              /* @__PURE__ */ e.jsx(dn, { size: 17, className: "shrink-0 mt-0.5 text-workbench-success" }),
              /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-semibold text-nomi-ink", children: s("onboardingProviders.assistant.configWritten", { client: x }) }),
                /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: s("onboardingProviders.assistant.restartClient", { client: x }) })
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-40", children: s("onboardingProviders.assistant.sayNow") }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-body-sm text-nomi-ink-80 leading-relaxed rounded-nomi-sm border border-nomi-line bg-nomi-paper px-3 py-2.5", children: [
              "“",
              s("onboardingProviders.assistant.example"),
              "”"
            ] }),
            o === "codex" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-nomi-ink-05 px-3 py-2.5", children: [
              /* @__PURE__ */ e.jsx(dn, { size: 16, className: "shrink-0 mt-0.5 text-workbench-success" }),
              /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-semibold text-nomi-ink", children: s("onboardingProviders.assistant.codexImageReadyTitle") }),
                /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: s("onboardingProviders.assistant.codexImageReadyBody", { model: Gt }) })
              ] })
            ] }) : null,
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: L,
                disabled: l,
                className: "self-start text-caption text-nomi-ink-40 hover:text-workbench-danger disabled:opacity-50",
                children: s("onboardingProviders.assistant.disconnect")
              }
            )
          ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: s("onboardingProviders.assistant.description", { client: x }) }),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: D,
                disabled: l,
                className: E(
                  "w-full h-9 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
                  "text-body-sm font-semibold inline-flex items-center justify-center gap-1.5",
                  "hover:bg-nomi-accent disabled:opacity-50 disabled:cursor-not-allowed"
                ),
                children: [
                  /* @__PURE__ */ e.jsx(to, { size: 15, stroke: 1.8 }),
                  s("onboardingProviders.assistant.connect", { client: x })
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsxs(
                "button",
                {
                  type: "button",
                  onClick: P,
                  className: E(
                    "flex-1 h-8 rounded-nomi-sm border border-nomi-line text-nomi-ink-60",
                    "text-caption inline-flex items-center justify-center gap-1.5 hover:border-nomi-ink-20"
                  ),
                  children: [
                    N ? /* @__PURE__ */ e.jsx(xe, { size: 14, stroke: 1.8 }) : /* @__PURE__ */ e.jsx(lo, { size: 14, stroke: 1.6 }),
                    s(N ? "onboardingProviders.assistant.copied" : "onboardingProviders.assistant.copyConfig")
                  ]
                }
              ),
              /* @__PURE__ */ e.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => window.open(Jt, "_blank", "noopener"),
                  className: "h-8 px-1 text-caption text-nomi-ink-60 inline-flex items-center gap-1 hover:text-nomi-accent",
                  children: [
                    s("onboardingProviders.assistant.guide"),
                    /* @__PURE__ */ e.jsx(pn, { size: 13, stroke: 1.6 })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-30", children: s("onboardingProviders.assistant.otherClients") })
          ] })
        ] }) : /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: s("onboardingProviders.assistant.credentialPending") }),
        c ? /* @__PURE__ */ e.jsx("div", { className: "text-caption text-workbench-danger", children: c }) : null
      ]
    }
  );
}
function Zn({ status: n, onChanged: r }) {
  const { t: s } = pe(), o = ie()?.dreamina, [t, a] = i.useState(!1), [l, d] = i.useState(null), [N, h] = i.useState(!1), [c, j] = i.useState(!1), [m, x] = i.useState(""), k = i.useRef(!1);
  if (i.useEffect(() => () => {
    k.current = !0;
  }, []), !o || !n) return null;
  const w = async () => {
    a(!0), x("");
    try {
      const C = await o.install();
      C.ok ? (le(s("onboardingProviders.dreamina.installComplete"), "success"), r()) : x(C.message);
    } catch (C) {
      x(C instanceof Error ? C.message : String(C));
    } finally {
      a(!1);
    }
  }, D = async (C) => {
    k.current = !1, h(!0);
    try {
      for (let I = 0; I < 8 && !k.current; I += 1) {
        const K = await o.loginPoll(C);
        if (K.status === "success") {
          le(s("onboardingProviders.dreamina.loginComplete"), "success"), d(null), r();
          return;
        }
        if (K.status === "error") {
          x(K.message);
          return;
        }
      }
      k.current || x(s("onboardingProviders.dreamina.loginTimeout"));
    } finally {
      h(!1);
    }
  }, L = async () => {
    a(!0), x("");
    try {
      const C = await o.loginStart();
      d(C), D(C.deviceCode);
    } catch (C) {
      const I = C instanceof Error ? C.message : String(C);
      /复用.*登录态|已登录|already logged in|already authenticated/i.test(I) ? (le(s("onboardingProviders.dreamina.alreadyLoggedIn"), "success"), r()) : x(I);
    } finally {
      a(!1);
    }
  }, P = async () => {
    k.current = !0, a(!0), x("");
    try {
      await o.logout(), d(null), r(), le(s("onboardingProviders.dreamina.loggedOut"), "success");
    } catch (C) {
      x(C instanceof Error ? C.message : String(C));
    } finally {
      a(!1);
    }
  }, F = () => {
    l && navigator.clipboard.writeText(l.verificationUri).then(() => {
      j(!0), le(s("onboardingProviders.dreamina.linkCopied"), "success"), window.setTimeout(() => j(!1), 1600);
    });
  }, b = n.installed && n.loggedIn ? "ok" : "todo", y = n.installed ? n.loggedIn ? n.notMaestroVip ? s("onboardingProviders.dreamina.status.notPremium") : s("onboardingProviders.dreamina.status.loggedIn") : s("onboardingProviders.dreamina.status.loginRequired") : s("onboardingProviders.dreamina.status.notInstalled");
  return /* @__PURE__ */ e.jsxs(
    Xe,
    {
      glyph: /* @__PURE__ */ e.jsx(Mn, { size: 16, stroke: 1.6 }),
      glyphTone: "ink",
      name: s("onboardingProviders.dreamina.name"),
      subtitle: s("onboardingProviders.dreamina.subtitle"),
      status: b,
      statusLabel: y,
      defaultExpanded: !1,
      children: [
        n.installed ? l ? (
          /* 设备码登录中：显链接 + 验证码 */
          /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper px-3 py-2.5", children: [
              /* @__PURE__ */ e.jsx(Tn, { size: 17, className: "shrink-0 mt-0.5 text-nomi-accent" }),
              /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-semibold text-nomi-ink", children: s("onboardingProviders.dreamina.authorizeTitle") }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: [
                  s("onboardingProviders.dreamina.authorizeBeforePremium"),
                  /* @__PURE__ */ e.jsx("strong", { children: s("onboardingProviders.dreamina.premiumMembership") }),
                  s("onboardingProviders.dreamina.authorizeAfterPremium")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => window.open(l.verificationUri, "_blank", "noopener"),
                className: "w-full h-9 rounded-nomi-sm border border-nomi-line text-body-sm text-nomi-ink inline-flex items-center justify-center gap-1.5 hover:border-nomi-accent hover:text-nomi-accent",
                children: [
                  s("onboardingProviders.dreamina.openAuthorizePage"),
                  /* @__PURE__ */ e.jsx(pn, { size: 14, stroke: 1.6 })
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1 text-caption text-nomi-ink-60", children: [
                s("onboardingProviders.dreamina.verificationCode"),
                " ",
                /* @__PURE__ */ e.jsxs("code", { className: "text-nomi-ink font-mono", children: [
                  l.userCode.slice(0, 12),
                  "…"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("button", { type: "button", onClick: F, className: "h-8 px-2 text-caption text-nomi-ink-60 inline-flex items-center gap-1 hover:text-nomi-accent", children: [
                c ? /* @__PURE__ */ e.jsx(xe, { size: 13, stroke: 1.8 }) : /* @__PURE__ */ e.jsx(lo, { size: 13, stroke: 1.6 }),
                s(c ? "onboardingProviders.dreamina.copied" : "onboardingProviders.dreamina.copyLink")
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-40", children: s(N ? "onboardingProviders.dreamina.waitingAuthorize" : "onboardingProviders.dreamina.authorizePending") }),
            /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => {
              k.current = !0, d(null);
            }, className: "self-start text-caption text-nomi-ink-40 hover:text-workbench-danger", children: s("onboardingProviders.dreamina.cancel") })
          ] })
        ) : n.loggedIn ? (
          /* 已登录。注意：user_credit 成功 ≠ 能生成（「not maestro vip」只在生成时才报），故这里**不承诺**
             能出片，始终诚实标门槛——避免给非会员账号误报「可以出片」（D4）。 */
          /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-[var(--workbench-success-soft)] px-3 py-2.5", children: [
              /* @__PURE__ */ e.jsx(dn, { size: 17, className: "shrink-0 mt-0.5 text-workbench-success" }),
              /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-body-sm font-semibold text-nomi-ink", children: [
                  s("onboardingProviders.dreamina.loggedInTitle"),
                  n.totalCredit != null ? /* @__PURE__ */ e.jsxs("span", { className: "text-nomi-ink-60 font-normal", children: [
                    " ",
                    s("onboardingProviders.dreamina.credits", { count: n.totalCredit })
                  ] }) : null
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: [
                  s("onboardingProviders.dreamina.loggedInBeforePremium"),
                  /* @__PURE__ */ e.jsx("strong", { children: s("onboardingProviders.dreamina.premiumMembership") }),
                  s("onboardingProviders.dreamina.loggedInAfterPremium")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("button", { type: "button", onClick: P, disabled: t, className: "self-start text-caption text-nomi-ink-40 hover:text-workbench-danger disabled:opacity-50", children: s("onboardingProviders.dreamina.logout") })
          ] })
        ) : (
          /* 已装未登录 */
          /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: [
              s("onboardingProviders.dreamina.loginBeforeRequirement"),
              /* @__PURE__ */ e.jsx("strong", { children: s("onboardingProviders.dreamina.premiumRequirement") }),
              s("onboardingProviders.dreamina.loginAfterRequirement")
            ] }),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: L,
                disabled: t,
                className: E(
                  "w-full h-9 rounded-nomi-sm bg-nomi-ink text-nomi-paper text-body-sm font-semibold",
                  "inline-flex items-center justify-center gap-1.5 hover:bg-nomi-accent disabled:opacity-50"
                ),
                children: [
                  /* @__PURE__ */ e.jsx(Tn, { size: 15, stroke: 1.8 }),
                  s(t ? "onboardingProviders.dreamina.starting" : "onboardingProviders.dreamina.login")
                ]
              }
            )
          ] })
        ) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: s("onboardingProviders.dreamina.installDescription") }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: w,
              disabled: t,
              className: E(
                "w-full h-9 rounded-nomi-sm bg-nomi-ink text-nomi-paper text-body-sm font-semibold",
                "inline-flex items-center justify-center gap-1.5 hover:bg-nomi-accent disabled:opacity-50"
              ),
              children: [
                /* @__PURE__ */ e.jsx(_o, { size: 15, stroke: 1.8 }),
                s(t ? "onboardingProviders.dreamina.installing" : "onboardingProviders.dreamina.install")
              ]
            }
          ),
          /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-30", children: s("onboardingProviders.dreamina.officialSource") })
        ] }),
        m ? /* @__PURE__ */ e.jsx("div", { className: "text-caption text-workbench-danger", children: m }) : null
      ]
    }
  );
}
const Be = "__none__", Ge = (n, r) => `${encodeURIComponent(n)}|${encodeURIComponent(r)}`, Xn = (n) => {
  try {
    const [r, s] = n.split("|");
    if (r && s) return { nodeId: decodeURIComponent(r), inputKey: decodeURIComponent(s) };
  } catch {
    return null;
  }
  return null;
}, Vt = (n) => ({ value: Ge(n.nodeId, n.inputKey), label: `#${n.nodeId} ${n.classType}` }), Zt = (n) => typeof n == "string" && n ? `「${n.slice(0, 18)}${n.length > 18 ? "…" : ""}」` : typeof n == "number" || typeof n == "boolean" ? String(n) : "", nn = (n) => n.map((r) => ({ ...Vt(r), trailing: Zt(r.value) || void 0 })), Xt = /^[A-Za-z0-9_]+$/, qt = (n) => typeof n == "number" ? "number" : typeof n == "boolean" ? "boolean" : "text", _t = (n, r) => n.trim().replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || r, $t = (n) => n.title?.trim() || `${n.inputKey} #${n.nodeId}`, qn = (n, r = []) => {
  const s = $t(n), o = _t(s.toLowerCase(), `comfy_${n.inputKey}`);
  let t = o, a = 2;
  for (; r.some((l) => l.paramKey === t); )
    t = `${o}_${a}`, a += 1;
  return {
    nodeId: n.nodeId,
    inputKey: n.inputKey,
    paramKey: t,
    label: s,
    type: qt(n.value),
    default: n.value
  };
}, on = (n) => ({
  ...n,
  numeric: n.numeric ?? [],
  params: n.params ?? (n.numeric ?? []).map((r) => ({ ...r, type: "number" }))
}), tn = (n) => `${n.nodeId} ${n.inputKey} ${n.classType} ${n.title ?? ""}`.toLowerCase(), er = [
  {
    key: "width",
    labelKey: "onboardingProviders.comfyWorkflow.presetWidth",
    paramKey: "comfy_width",
    match: (n) => /width|宽度/i.test(tn(n))
  },
  {
    key: "height",
    labelKey: "onboardingProviders.comfyWorkflow.presetHeight",
    paramKey: "comfy_height",
    match: (n) => /height|高度/i.test(tn(n))
  },
  {
    key: "seconds",
    labelKey: "onboardingProviders.comfyWorkflow.presetSeconds",
    paramKey: "comfy_seconds",
    match: (n) => /(seconds?|duration|时长|秒数)/i.test(tn(n))
  },
  {
    key: "fps",
    labelKey: "onboardingProviders.comfyWorkflow.presetFps",
    paramKey: "comfy_fps",
    match: (n) => /\b(fps|frame_rate|帧率)\b/i.test(tn(n))
  }
];
function _n({ onImported: n, initial: r, onCancel: s }) {
  const { t: o } = pe(), t = ie()?.modelCatalog, a = !!r, [l, d] = i.useState(a), [N, h] = i.useState(r?.text ?? ""), [c, j] = i.useState(null), [m, x] = i.useState(r?.binding ? on(r.binding) : null), [k, w] = i.useState(r?.labelZh ?? ""), [D, L] = i.useState(""), [P, F] = i.useState(!1), b = i.useCallback(() => {
    h(""), j(null), x(null), w(""), L("");
  }, []), y = r?.modelKey;
  i.useEffect(() => {
    if (!r) return;
    d(!0), h(r.text), w(r.labelZh), x(r.binding ? on(r.binding) : null), L("");
    const f = t?.analyzeComfyWorkflow?.(r.text);
    if (!f) {
      L(o("onboardingProviders.comfyWorkflow.unsupportedEdit")), j(null);
      return;
    }
    if (!f.ok) {
      L(f.error), j(null);
      return;
    }
    const v = f.analysis;
    j(v), x(on(r.binding ?? v.suggested));
  }, [t, y]);
  const C = i.useCallback(() => {
    L("");
    const f = t?.analyzeComfyWorkflow?.(N);
    if (!f) {
      L(o("onboardingProviders.comfyWorkflow.unsupported"));
      return;
    }
    if (!f.ok) {
      L(f.error), j(null), x(null);
      return;
    }
    const v = f.analysis;
    j(v), x(on(v.suggested));
  }, [t, N, o]), I = i.useMemo(() => {
    const f = m?.params ?? [], v = /* @__PURE__ */ new Set();
    for (const M of f) {
      if (!M.paramKey.trim() || !Xt.test(M.paramKey)) return o("onboardingProviders.comfyWorkflow.paramKeyInvalid");
      if (v.has(M.paramKey)) return o("onboardingProviders.comfyWorkflow.paramKeyDuplicate");
      v.add(M.paramKey);
    }
    return "";
  }, [m?.params, o]), K = i.useCallback(() => {
    if (!(!m || !t?.importComfyWorkflow)) {
      if (I) {
        L(I);
        return;
      }
      F(!0);
      try {
        const f = k.trim() || o("onboardingProviders.comfyWorkflow.defaultName"), v = a && r ? t.updateComfyWorkflow?.({ modelKey: r.modelKey, text: N, binding: m, labelZh: f }) ?? { ok: !1, error: o("onboardingProviders.comfyWorkflow.unsupportedEdit") } : t.importComfyWorkflow({ text: N, binding: m, labelZh: f });
        if (!v.ok) {
          L(v.error);
          return;
        }
        const M = v.kind === "video" ? o("onboardingProviders.comfyWorkflow.video") : o("onboardingProviders.comfyWorkflow.image");
        le(o(a ? "onboardingProviders.comfyWorkflow.saved" : "onboardingProviders.comfyWorkflow.imported", { name: f, kind: M }), "success"), a ? s?.() : (b(), d(!1)), n();
      } finally {
        F(!1);
      }
    }
  }, [m, t, a, r, N, k, s, b, n, I, o]);
  if (!l && !a)
    return /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        onClick: () => d(!0),
        className: E(
          "self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-nomi-sm border border-nomi-line",
          "text-caption text-nomi-ink-60 hover:text-nomi-accent hover:border-nomi-accent"
        ),
        children: [
          /* @__PURE__ */ e.jsx(bn, { size: 14, stroke: 1.7 }),
          o("onboardingProviders.comfyWorkflow.importCustom")
        ]
      }
    );
  const U = (f, v) => {
    x((M) => {
      if (!M) return M;
      if (v === Be)
        return f === "firstFrame" ? { ...M, firstFrameNodeId: void 0, firstFrameInputKey: void 0 } : f === "lastFrame" ? { ...M, lastFrameNodeId: void 0, lastFrameInputKey: void 0 } : { ...M, promptNodeId: void 0, promptInputKey: void 0 };
      const O = Xn(v);
      if (!O) return M;
      const { nodeId: R, inputKey: _ } = O;
      return f === "prompt" ? { ...M, promptNodeId: R, promptInputKey: _ } : f === "firstFrame" ? { ...M, firstFrameNodeId: R, firstFrameInputKey: _ } : { ...M, lastFrameNodeId: R, lastFrameInputKey: _ };
    });
  }, Z = (f) => {
    x((v) => {
      if (!v || !c) return v;
      const M = c.outputNodes.find((O) => O.nodeId === f);
      return { ...v, outputNodeId: f, outputKind: M?.kind };
    });
  }, X = c?.widgetInputs?.length ? c.widgetInputs : c?.numericInputs ?? [], p = [
    { value: "number", label: o("onboardingProviders.comfyWorkflow.paramTypeNumber") },
    { value: "text", label: o("onboardingProviders.comfyWorkflow.paramTypeText") },
    { value: "boolean", label: o("onboardingProviders.comfyWorkflow.paramTypeBoolean") }
  ], H = er.map((f) => {
    const v = X.find((O) => typeof O.value == "number" && f.match(O)), M = !!(v && (m?.params ?? []).some(
      (O) => O.nodeId === v.nodeId && O.inputKey === v.inputKey || O.paramKey === f.paramKey
    ));
    return { preset: f, candidate: v, added: M };
  }), u = () => {
    X.length && x((f) => {
      if (!f) return f;
      const v = f.params ?? [], M = X.find((O) => !v.some((R) => R.nodeId === O.nodeId && R.inputKey === O.inputKey)) ?? X[0];
      return { ...f, params: [...v, qn(M, v)] };
    });
  }, B = (f, v) => {
    x((M) => {
      if (!M) return M;
      const O = M.params ?? [];
      return O.some((R) => R.nodeId === v.nodeId && R.inputKey === v.inputKey || R.paramKey === f.paramKey) ? M : {
        ...M,
        params: [
          ...O,
          {
            nodeId: v.nodeId,
            inputKey: v.inputKey,
            paramKey: f.paramKey,
            label: o(f.labelKey),
            type: "number",
            default: v.value
          }
        ]
      };
    });
  }, J = (f, v) => {
    x((M) => {
      if (!M) return M;
      const O = [...M.params ?? []], R = O[f];
      return R ? (O[f] = { ...R, ...v }, { ...M, params: O }) : M;
    });
  }, V = (f, v) => {
    const M = Xn(v);
    if (!M) return;
    const O = X.find((R) => R.nodeId === M.nodeId && R.inputKey === M.inputKey);
    O && x((R) => {
      if (!R) return R;
      const _ = [...R.params ?? []], oe = _[f];
      if (!oe) return R;
      const ue = qn(O, _.filter((g, W) => W !== f));
      return _[f] = { ...ue, paramKey: oe.paramKey || ue.paramKey, label: oe.label || ue.label }, { ...R, params: _ };
    });
  }, q = (f) => {
    x((v) => v && { ...v, params: (v.params ?? []).filter((M, O) => O !== f) });
  }, de = m?.firstFrameNodeId && m.lastFrameNodeId ? o("onboardingProviders.comfyWorkflow.frameKindBoth") : m?.firstFrameNodeId ? o("onboardingProviders.comfyWorkflow.frameKindFirst") : m?.lastFrameNodeId ? o("onboardingProviders.comfyWorkflow.frameKindLast") : o("onboardingProviders.comfyWorkflow.frameKindNone");
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper p-3", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ e.jsx(bn, { size: 15, stroke: 1.7, className: "text-nomi-ink-60" }),
      /* @__PURE__ */ e.jsx("span", { className: "text-body-sm font-semibold text-nomi-ink flex-1", children: o(a ? "onboardingProviders.comfyWorkflow.editTitle" : "onboardingProviders.comfyWorkflow.title") }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            a ? s?.() : (b(), d(!1));
          },
          className: "h-6 w-6 grid place-items-center rounded-nomi-sm text-nomi-ink-40 hover:bg-nomi-ink-05",
          "aria-label": o(a ? "onboardingProviders.comfyWorkflow.cancelEdit" : "onboardingProviders.comfyWorkflow.collapse"),
          children: /* @__PURE__ */ e.jsx(Je, { size: 14, stroke: 1.8 })
        }
      )
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: [
      o("onboardingProviders.comfyWorkflow.instructionsBefore"),
      " ",
      /* @__PURE__ */ e.jsx("code", { className: "font-mono text-nomi-ink", children: o("onboardingProviders.comfyWorkflow.exportCommand") }),
      " ",
      o("onboardingProviders.comfyWorkflow.instructionsMiddle"),
      " ",
      /* @__PURE__ */ e.jsx("code", { className: "font-mono text-nomi-ink", children: o("onboardingProviders.comfyWorkflow.fileName") }),
      " ",
      o("onboardingProviders.comfyWorkflow.instructionsAfter")
    ] }),
    /* @__PURE__ */ e.jsx(
      "textarea",
      {
        value: N,
        onChange: (f) => {
          h(f.target.value), j(null), x(null), L("");
        },
        spellCheck: !1,
        "aria-label": o("onboardingProviders.comfyWorkflow.pasteArea"),
        placeholder: o("onboardingProviders.comfyWorkflow.jsonPlaceholder"),
        className: E(
          "w-full min-h-[110px] max-h-[220px] rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5 py-2",
          "font-mono text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none resize-y"
        )
      }
    ),
    D ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-[var(--workbench-danger-soft)] px-2.5 py-2", children: [
      /* @__PURE__ */ e.jsx(Sn, { size: 15, className: "shrink-0 mt-0.5 text-workbench-danger" }),
      /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink leading-relaxed", children: D })
    ] }) : null,
    c ? m ? /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2.5", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 text-caption text-nomi-ink-60", children: [
        m.outputKind === "video" ? /* @__PURE__ */ e.jsx(Mn, { size: 14, className: "text-nomi-accent" }) : /* @__PURE__ */ e.jsx(mn, { size: 14, className: "text-nomi-accent" }),
        o("onboardingProviders.comfyWorkflow.detectedBefore"),
        /* @__PURE__ */ e.jsx("b", { className: "text-nomi-ink font-semibold", children: m.outputKind === "video" ? o("onboardingProviders.comfyWorkflow.video") : o("onboardingProviders.comfyWorkflow.image") }),
        o("onboardingProviders.comfyWorkflow.detectedAfter"),
        de,
        o("onboardingProviders.comfyWorkflow.confirmBindings")
      ] }),
      /* @__PURE__ */ e.jsx(rn, { label: o("onboardingProviders.comfyWorkflow.promptNode"), children: /* @__PURE__ */ e.jsx(
        He,
        {
          ariaLabel: o("onboardingProviders.comfyWorkflow.promptNodeAria"),
          size: "sm",
          value: m.promptNodeId && m.promptInputKey ? Ge(m.promptNodeId, m.promptInputKey) : Be,
          options: nn(c.textInputs),
          onChange: (f) => U("prompt", f),
          triggerMaxWidth: 160,
          className: "w-full max-w-full justify-between"
        }
      ) }),
      c.imageInputs.length > 0 ? /* @__PURE__ */ e.jsx(rn, { label: o("onboardingProviders.comfyWorkflow.firstFrameNode"), children: /* @__PURE__ */ e.jsx(
        He,
        {
          ariaLabel: o("onboardingProviders.comfyWorkflow.firstFrameNodeAria"),
          size: "sm",
          value: m.firstFrameNodeId && m.firstFrameInputKey ? Ge(m.firstFrameNodeId, m.firstFrameInputKey) : Be,
          options: [{ value: Be, label: o("onboardingProviders.comfyWorkflow.noFirstFrame") }, ...nn(c.imageInputs)],
          onChange: (f) => U("firstFrame", f),
          triggerMaxWidth: 160,
          className: "w-full max-w-full justify-between"
        }
      ) }) : null,
      c.imageInputs.length > 1 ? /* @__PURE__ */ e.jsx(rn, { label: o("onboardingProviders.comfyWorkflow.lastFrameNode"), children: /* @__PURE__ */ e.jsx(
        He,
        {
          ariaLabel: o("onboardingProviders.comfyWorkflow.lastFrameNodeAria"),
          size: "sm",
          value: m.lastFrameNodeId && m.lastFrameInputKey ? Ge(m.lastFrameNodeId, m.lastFrameInputKey) : Be,
          options: [{ value: Be, label: o("onboardingProviders.comfyWorkflow.noLastFrame") }, ...nn(c.imageInputs)],
          onChange: (f) => U("lastFrame", f),
          triggerMaxWidth: 160,
          className: "w-full max-w-full justify-between"
        }
      ) }) : null,
      /* @__PURE__ */ e.jsx(rn, { label: o("onboardingProviders.comfyWorkflow.outputNode"), children: /* @__PURE__ */ e.jsx(
        He,
        {
          ariaLabel: o("onboardingProviders.comfyWorkflow.outputNodeAria"),
          size: "sm",
          value: m.outputNodeId ?? "",
          options: c.outputNodes.map((f) => ({ value: f.nodeId, label: `#${f.nodeId} ${f.classType}（${f.kind === "video" ? o("onboardingProviders.comfyWorkflow.video") : o("onboardingProviders.comfyWorkflow.image")}）` })),
          onChange: Z,
          triggerMaxWidth: 160,
          className: "w-full max-w-full justify-between"
        }
      ) }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2 rounded-nomi-sm border border-nomi-line-soft bg-nomi-ink-05 p-2", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption font-semibold text-nomi-ink flex-1", children: o("onboardingProviders.comfyWorkflow.customParamsTitle") }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: u,
              disabled: !X.length,
              className: E(
                "inline-flex items-center gap-1 h-7 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper",
                "text-caption text-nomi-ink-80 hover:border-nomi-accent disabled:opacity-45"
              ),
              children: [
                /* @__PURE__ */ e.jsx(un, { size: 13, stroke: 1.8 }),
                o("onboardingProviders.comfyWorkflow.addParam")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40 leading-relaxed", children: o("onboardingProviders.comfyWorkflow.customParamsHint") }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: o("onboardingProviders.comfyWorkflow.commonParams") }),
          H.map(({ preset: f, candidate: v, added: M }) => /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => v ? B(f, v) : void 0,
              disabled: !v || M,
              title: v ? `#${v.nodeId}.${v.inputKey}` : void 0,
              className: E(
                "inline-flex items-center h-6 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper",
                "text-micro text-nomi-ink-80 hover:border-nomi-accent disabled:opacity-45 disabled:hover:border-nomi-line"
              ),
              children: o(f.labelKey)
            },
            f.key
          ))
        ] }),
        (m.params ?? []).length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "flex flex-col gap-1.5", children: (m.params ?? []).map((f, v) => /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-1.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper p-1.5", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ e.jsx(
              He,
              {
                ariaLabel: o("onboardingProviders.comfyWorkflow.paramNodeAria"),
                size: "xs",
                value: Ge(f.nodeId, f.inputKey),
                options: nn(X),
                onChange: (M) => V(v, M),
                triggerMaxWidth: 190,
                className: "w-full max-w-full justify-between bg-nomi-paper"
              }
            ) }),
            /* @__PURE__ */ e.jsx(
              He,
              {
                ariaLabel: o("onboardingProviders.comfyWorkflow.paramTypeAria"),
                size: "xs",
                value: f.type,
                options: p,
                onChange: (M) => J(v, { type: M }),
                triggerMaxWidth: 64,
                className: "shrink-0 bg-nomi-paper"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => q(v),
                "aria-label": o("onboardingProviders.comfyWorkflow.removeParam"),
                className: "h-6 w-6 shrink-0 grid place-items-center rounded-nomi-sm text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-workbench-danger",
                children: /* @__PURE__ */ e.jsx(Ie, { size: 13, stroke: 1.7 })
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 gap-1.5", children: /* @__PURE__ */ e.jsx(
            "input",
            {
              value: f.label,
              onChange: (M) => J(v, { label: M.target.value }),
              "aria-label": o("onboardingProviders.comfyWorkflow.paramLabelAria"),
              placeholder: o("onboardingProviders.comfyWorkflow.paramLabelPlaceholder"),
              className: "h-7 min-w-0 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none"
            }
          ) })
        ] }, `${f.nodeId}:${f.inputKey}:${v}`)) }) : /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40", children: o("onboardingProviders.comfyWorkflow.noCustomParams") }),
        I ? /* @__PURE__ */ e.jsx("div", { className: "text-micro text-workbench-danger", children: I }) : null
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 pt-0.5", children: [
        /* @__PURE__ */ e.jsx(
          "input",
          {
            value: k,
            onChange: (f) => w(f.target.value),
            placeholder: o("onboardingProviders.comfyWorkflow.namePlaceholder"),
            className: "flex-1 h-8 px-2.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none"
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: K,
            disabled: P || !m.outputNodeId,
            className: E(
              "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
              "text-caption font-medium hover:bg-nomi-accent disabled:opacity-45"
            ),
            children: [
              /* @__PURE__ */ e.jsx(bn, { size: 14, stroke: 1.8 }),
              o(P ? a ? "onboardingProviders.comfyWorkflow.saving" : "onboardingProviders.comfyWorkflow.importing" : a ? "onboardingProviders.comfyWorkflow.save" : "onboardingProviders.comfyWorkflow.import")
            ]
          }
        )
      ] })
    ] }) : null : /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        onClick: C,
        disabled: !N.trim(),
        className: E(
          "self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper",
          "text-caption font-medium hover:bg-nomi-accent disabled:opacity-45"
        ),
        children: [
          /* @__PURE__ */ e.jsx($o, { size: 14, stroke: 1.8 }),
          o("onboardingProviders.comfyWorkflow.analyze")
        ]
      }
    )
  ] });
}
function rn({ label: n, children: r }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60 w-24 shrink-0", children: n }),
    /* @__PURE__ */ e.jsx("div", { className: "flex-1 min-w-0 overflow-hidden", children: r })
  ] });
}
const Ne = "comfyui-local", nr = "comfyui-txt2img";
function or(n) {
  if (!n || typeof n != "object") return null;
  const r = n.comfyWorkflowImport;
  if (!r || typeof r != "object") return null;
  const s = r.text, o = r.binding;
  if (typeof s != "string" || !o || typeof o != "object") return null;
  const t = o.numeric;
  return Array.isArray(t) ? { text: s, binding: o } : null;
}
function tr(n, r) {
  const o = n?.find((l) => l.vendorKey === Ne && l.modelKey === r)?.create, t = o && typeof o == "object" ? o.body : null, a = t && typeof t == "object" ? t.prompt : null;
  return !a || typeof a != "object" || Array.isArray(a) ? null : { text: JSON.stringify(a, null, 2) };
}
function $n({ enabled: n, baseUrl: r, models: s, mappings: o, onChanged: t }) {
  const { t: a } = pe(), l = ie()?.modelCatalog, [d, N] = i.useState(null), [h, c] = i.useState(!1), [j, m] = i.useState(!1), [x, k] = i.useState(!1), [w, D] = i.useState(null), [L, P] = i.useState(null), [F, b] = i.useState(r || "http://127.0.0.1:8188"), y = r || "http://127.0.0.1:8188", C = i.useCallback(async () => {
    if (!l?.probeComfyui) return { ok: !1, error: a("onboardingProviders.comfyLocal.unsupportedProbe") };
    c(!0);
    try {
      const u = await l.probeComfyui(r || void 0);
      return N(u), u;
    } catch (u) {
      const B = { ok: !1, error: u instanceof Error ? u.message : String(u) };
      return N(B), B;
    } finally {
      c(!1);
    }
  }, [l, r, a]);
  if (i.useEffect(() => {
    n ? C() : N(null);
  }, [n, C]), !l) return null;
  const I = async () => {
    m(!0);
    try {
      const u = await C();
      l.upsertVendor({ key: Ne, enabled: !0 }), t(), le(u.ok ? a("onboardingProviders.comfyLocal.enabled") : a("onboardingProviders.comfyLocal.enabledWithoutConnection"), u.ok ? "success" : "info");
    } catch (u) {
      le(u instanceof Error ? u.message : a("onboardingProviders.comfyLocal.enableFailed"), "error");
    } finally {
      m(!1);
    }
  }, K = () => {
    m(!0);
    try {
      l.upsertVendor({ key: Ne, enabled: !1 }), N(null), t(), le(a("onboardingProviders.comfyLocal.disabled"), "success");
    } catch (u) {
      le(u instanceof Error ? u.message : a("onboardingProviders.comfyLocal.disableFailed"), "error");
    } finally {
      m(!1);
    }
  }, U = async () => {
    const u = F.trim();
    u && (l.upsertVendor({ key: Ne, baseUrlHint: u }), k(!1), t(), le(a("onboardingProviders.comfyLocal.addressUpdated"), "success"));
  }, Z = async (u) => {
    if (await Ze({
      title: a("onboardingProviders.comfyLocal.deleteWorkflowTitle"),
      message: a("onboardingProviders.comfyLocal.deleteWorkflowMessage", { name: u.labelZh }),
      confirmLabel: a("common.delete"),
      danger: !0
    }))
      try {
        l.deleteModels([{ vendorKey: Ne, modelKey: u.modelKey }]), t(), le(a("onboardingProviders.comfyLocal.workflowDeleted", { name: u.labelZh }), "success");
      } catch (J) {
        sn({ title: a("onboardingProviders.drawer.deleteFailed"), message: J instanceof Error ? J.message : String(J) });
      }
  }, X = n && d?.ok ? "ok" : "todo", p = n ? h && !d ? a("onboardingProviders.comfyLocal.status.checking") : d?.ok ? a("onboardingProviders.comfyLocal.status.running") : a("onboardingProviders.comfyLocal.status.disconnected") : a("onboardingProviders.comfyLocal.status.notEnabled"), H = /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60 whitespace-nowrap", children: a("onboardingProviders.comfyLocal.addressLabelCloud") }),
    x ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx(
        "input",
        {
          value: F,
          onChange: (u) => b(u.target.value),
          spellCheck: !1,
          className: "flex-1 h-8 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-caption font-mono text-nomi-ink focus:border-nomi-accent outline-none"
        }
      ),
      /* @__PURE__ */ e.jsx("button", { type: "button", onClick: U, className: "h-8 w-8 grid place-items-center rounded-nomi-sm text-workbench-success hover:bg-nomi-ink-05", "aria-label": a("onboardingProviders.comfyLocal.saveAddress"), children: /* @__PURE__ */ e.jsx(xe, { size: 15, stroke: 1.8 }) }),
      /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => {
        k(!1), b(y);
      }, className: "h-8 w-8 grid place-items-center rounded-nomi-sm text-nomi-ink-40 hover:bg-nomi-ink-05", "aria-label": a("common.cancel"), children: /* @__PURE__ */ e.jsx(Je, { size: 15, stroke: 1.8 }) })
    ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx("code", { className: "flex-1 text-caption font-mono text-nomi-ink bg-nomi-ink-05 rounded-nomi-sm px-2 py-1.5 truncate", children: y }),
      /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => {
        b(y), k(!0);
      }, className: "h-8 px-2 text-caption text-nomi-ink-60 hover:text-nomi-accent", children: a("onboardingProviders.comfyLocal.editAddressShort") })
    ] })
  ] });
  return /* @__PURE__ */ e.jsx(
    Xe,
    {
      glyph: /* @__PURE__ */ e.jsx(Mt, { size: 16, stroke: 1.6 }),
      glyphTone: "ink",
      name: a("onboardingProviders.comfyLocal.cardName"),
      subtitle: a("onboardingProviders.comfyLocal.cloudSubtitle"),
      status: X,
      statusLabel: p,
      defaultExpanded: !1,
      children: n ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        d?.ok ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-[var(--workbench-success-soft)] px-3 py-2.5", children: [
          /* @__PURE__ */ e.jsx(dn, { size: 17, className: "shrink-0 mt-0.5 text-workbench-success" }),
          /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "text-body-sm font-semibold text-nomi-ink", children: [
              a("onboardingProviders.comfyLocal.connected"),
              d.version ? /* @__PURE__ */ e.jsx("span", { className: "text-nomi-ink-60 font-normal", children: a("onboardingProviders.comfyLocal.version", { version: d.version }) }) : null
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: d.summary })
          ] })
        ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2 rounded-nomi-sm bg-nomi-ink-05 px-3 py-2.5", children: [
          /* @__PURE__ */ e.jsx(Sn, { size: 17, className: "shrink-0 mt-0.5 text-nomi-accent" }),
          /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-semibold text-nomi-ink", children: a(h ? "onboardingProviders.comfyLocal.checkingShort" : "onboardingProviders.comfyLocal.enabledButDisconnectedShort") }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-caption text-nomi-ink-60 mt-0.5", children: [
              a("onboardingProviders.comfyLocal.reconnectBeforeAddress"),
              " ",
              /* @__PURE__ */ e.jsx("code", { className: "font-mono", children: y }),
              a("onboardingProviders.comfyLocal.reconnectAfterShort")
            ] })
          ] })
        ] }),
        s.map((u) => {
          const B = u.kind === "video", J = B ? Mn : mn, V = u.modelKey !== nr, q = V ? or(u.meta) ?? tr(o, u.modelKey) : null, de = !!q, f = L === u.modelKey;
          return /* @__PURE__ */ e.jsxs(i.Fragment, { children: [
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                className: "flex items-center gap-2.5 px-3 py-2 bg-nomi-ink-05 rounded-nomi-sm",
                onMouseEnter: () => P(u.modelKey),
                onMouseLeave: () => P((v) => v === u.modelKey ? null : v),
                onFocus: () => P(u.modelKey),
                onBlur: (v) => {
                  v.currentTarget.contains(v.relatedTarget) || P((M) => M === u.modelKey ? null : M);
                },
                children: [
                  /* @__PURE__ */ e.jsx(J, { size: 16, className: "text-nomi-ink-60" }),
                  /* @__PURE__ */ e.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ e.jsx("div", { className: "text-body-sm text-nomi-ink truncate", children: u.labelZh }),
                    /* @__PURE__ */ e.jsxs("div", { className: "text-micro text-nomi-ink-30", children: [
                      a(B ? "onboardingProviders.comfyWorkflow.video" : "onboardingProviders.comfyWorkflow.image"),
                      " ",
                      a("onboardingProviders.comfyLocal.workflowKindSuffix")
                    ] })
                  ] }),
                  V ? /* @__PURE__ */ e.jsx("span", { className: "flex h-7 w-16 shrink-0 items-center justify-end", children: f ? /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1", children: [
                    de ? /* @__PURE__ */ e.jsx(
                      "button",
                      {
                        type: "button",
                        "aria-label": a("onboardingProviders.comfyLocal.editWorkflowAria", { name: u.labelZh }),
                        title: a("onboardingProviders.comfyLocal.editWorkflowTitle"),
                        onClick: () => D(u.modelKey),
                        className: "grid size-7 place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
                        children: /* @__PURE__ */ e.jsx(zn, { size: 14, stroke: 1.7 })
                      }
                    ) : null,
                    /* @__PURE__ */ e.jsx(
                      "button",
                      {
                        type: "button",
                        "aria-label": a("onboardingProviders.comfyLocal.deleteWorkflowAria", { name: u.labelZh }),
                        title: a("onboardingProviders.comfyLocal.deleteWorkflowActionTitle"),
                        onClick: () => {
                          Z(u);
                        },
                        className: "grid size-7 place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-workbench-danger",
                        children: /* @__PURE__ */ e.jsx(Ie, { size: 14, stroke: 1.7 })
                      }
                    )
                  ] }) : /* @__PURE__ */ e.jsx("span", { className: "text-micro text-workbench-success bg-[var(--workbench-success-soft)] px-2 py-0.5 rounded-full", children: a("onboardingProviders.comfyLocal.modelEnabled") }) }) : /* @__PURE__ */ e.jsx("span", { className: "text-micro text-workbench-success bg-[var(--workbench-success-soft)] px-2 py-0.5 rounded-full", children: a("onboardingProviders.comfyLocal.modelEnabled") })
                ]
              }
            ),
            w === u.modelKey && q ? /* @__PURE__ */ e.jsx(
              _n,
              {
                initial: { modelKey: u.modelKey, labelZh: u.labelZh, text: q.text, binding: q.binding },
                onCancel: () => D(null),
                onImported: () => {
                  D(null), t();
                }
              }
            ) : null
          ] }, u.modelKey);
        }),
        /* @__PURE__ */ e.jsx(_n, { onImported: t }),
        H,
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsxs("button", { type: "button", onClick: () => {
            C();
          }, disabled: h, className: "inline-flex items-center gap-1 h-8 px-2.5 text-caption text-nomi-ink-60 rounded-nomi-sm border border-nomi-line hover:border-nomi-accent hover:text-nomi-accent disabled:opacity-50", children: [
            /* @__PURE__ */ e.jsx(Kn, { size: 13, stroke: 1.7, className: h ? "animate-spin" : void 0 }),
            a(h ? "onboardingProviders.comfyLocal.checkingInline" : "onboardingProviders.comfyLocal.recheck")
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "flex-1" }),
          /* @__PURE__ */ e.jsx("button", { type: "button", onClick: K, disabled: j, className: "text-caption text-nomi-ink-40 hover:text-workbench-danger disabled:opacity-50", children: a("onboardingProviders.comfyLocal.disable") })
        ] })
      ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        H,
        /* @__PURE__ */ e.jsxs("div", { className: "text-micro text-nomi-ink-30 leading-relaxed", children: [
          a("onboardingProviders.comfyLocal.defaultLocalPrefix"),
          " ",
          /* @__PURE__ */ e.jsx("code", { className: "font-mono", children: "127.0.0.1:8188" }),
          a("onboardingProviders.comfyLocal.cloudAddressHint")
        ] }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: I,
            disabled: j || h,
            className: E(
              "w-full h-9 rounded-nomi-sm bg-nomi-ink text-nomi-paper text-body-sm font-semibold",
              "inline-flex items-center justify-center gap-1.5 hover:bg-nomi-accent disabled:opacity-50"
            ),
            children: [
              /* @__PURE__ */ e.jsx(to, { size: 15, stroke: 1.8 }),
              a(h ? "onboardingProviders.comfyLocal.checkingButton" : "onboardingProviders.comfyLocal.enableButton")
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("button", { type: "button", onClick: () => window.open("https://github.com/comfyanonymous/ComfyUI", "_blank", "noopener"), className: "self-start inline-flex items-center gap-1 text-micro text-nomi-ink-30 hover:text-nomi-accent", children: [
          a("onboardingProviders.comfyLocal.installHintCloud"),
          /* @__PURE__ */ e.jsx(pn, { size: 12, stroke: 1.6 })
        ] })
      ] })
    }
  );
}
const wo = [
  {
    vendorKey: "apimart",
    logo: new URL("data:image/png;base64,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", import.meta.url).href,
    glyph: "A",
    tagline: "一个 key，解锁全部预置模型",
    recommended: !0,
    // 聚合中转，一个 key 解锁图/视频/文本/配音 → 新手最省事的起点
    promo: {
      text: "如果你愿意，可以用我们的链接注册；不愿意也可以直接去官方注册。",
      ctaLabel: "用我们的链接",
      url: "https://apimart.ai/register?aff=t55VtP"
      // 专属推广链接
    }
  },
  {
    // Agnes AI（Sapiens AI，新加坡）：全模态 OpenAI 兼容网关，文本/图片/视频**无限期免费**
    // （2026-06-01 起，免费层 RPM 20）。一个 key 解锁三模态、邮箱注册不绑卡 → 新手零成本起点。
    vendorKey: "agnes",
    glyph: "Ag",
    tagline: "全模态免费 · 一个 key 解锁文本/图片/视频",
    credentialPlaceholder: "粘贴 Agnes API Key",
    credentialHint: "免费：去 platform.agnes-ai.com 邮箱注册（不绑卡）→ 创建 API Key。免费层有速率上限（RPM 20），个人/原型够用。凭证本地加密存储。",
    promo: {
      text: "Agnes AI（新加坡 Sapiens AI）把文本/图片/视频三模态 API 无限期免费开放，OpenAI 兼容。邮箱注册不绑卡即可拿 Key。",
      ctaLabel: "去 Agnes 注册（免费）",
      url: "https://agnes-ai.com"
    }
  },
  {
    vendorKey: "kie",
    logo: new URL("data:image/png;base64,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", import.meta.url).href,
    glyph: "K",
    tagline: "一个 key，解锁内置模型",
    promo: {
      text: "如果你愿意，可以用我们的链接注册；不愿意也可以直接去官方注册。",
      ctaLabel: "用我们的链接",
      url: "https://kie.ai"
      // TODO: 替换为专属 ?ref 链接
    }
  },
  {
    vendorKey: "modelscope",
    logo: new URL("data:image/png;base64,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", import.meta.url).href,
    glyph: "魔",
    tagline: "官方原生 · 绑定阿里云每天免费额度",
    promo: {
      text: "魔搭社区由阿里达摩院运营，绑定阿里云账号后每天有免费推理额度。去官网拿 API Key。",
      ctaLabel: "去魔搭注册",
      url: "https://modelscope.cn/my/myaccesstoken"
    }
  },
  {
    vendorKey: "volcengine",
    logo: new URL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAADAFBMVEVHcEw34+M34+MglvclqPI34uI44+MXef8ose8cjvk34uI44+M44+Nm//////844+M54+M75OQXev8WeP8Yef8Wef8Wef8Xef834uI55OQWef877u444uIXev8Yev8Xef8eeP8Xef8ihv87iv8bev8Wef8Wef845OQXeP8XeP844uIXeP92wv8WeP8rgP8Yev8Ze/8Xev8XeP9A//8WeP8Xef8Wef8Wev8Yev8Xef854uIWeP8WeP8af/8XeP8ffv845OQXev855eUXev8WeP845uYZfP8WeP834uIWef834uIYfP9B7+8WeP834+MXev8Xev8Yef8WeP844+MYev844uIXev8Xef8Yef8bg/8Zef844+MXev834+MWeP844+M86Og34+Mkkv9H5eU34uI45OQ34+Mbff8Xef8+6OgZef8Xef855OQXeP8XeP834+MWeP8Xe/8XeP834+M34+M64uIXeP8XeP845OQXeP835OQ85uYXe/895+cXi/844+M54+M34uI44uIXef845OQ34+M76+sZg/045OQ34+M34uIXef8Xef8Xef8YeP8XeP844+MXef844+MflPgaev844+MbivsXef8Xev834+M54+NV//875uYlqfIlqvE34+M54uInrvA12eUxzOgwzOk55OQYgP0osfAgl/ckovUosvEz0OohmPgwxOofk/g44+Mpte8rt+0aef855OQ54+M44+MYef8kovMdivw34+M34uIWeP824OMXe/4os/Avyek02eUZg/0ah/shnvYque4tw+sYgP0y0ucioPQlqPMekvkru+4dkPk13uQbivsdjvkosPAswesz1+YWef8swOwci/oxz+gWev8lqPIvy+kjpPQlq/I13OQpte8ux+oXfv4z0+cy1eYmrPErvO0gmPYgmfcXe/8jofQhmfYahPwkpfMflfgWev4hm/Yek/gx0Ocnr/AwzOk02uUosvA02uQsweouxes34uM23+MnrvErvuwhnfUflfcqtu4wzegptu3dtsHFAAAAunRSTlMArv7Y6Gr2nMXFwpwkBQGbhzgh/jX1rHBzTP0R6HRg1hHTDgQl+5Jgv7DW6gLCBkk6hPgE5fnnXEuYdNmIE5sYX005Y8VFJ33VuOcuD/GV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", import.meta.url).href,
    glyph: "火",
    tagline: "官方原生 · 豆包 Seedream / Seedance",
    promo: {
      text: "火山方舟（字节跳动）官方。需先在 Ark 控制台「开通管理」激活模型（Seedream/Seedance），再拿 API Key。",
      ctaLabel: "去火山方舟",
      url: "https://console.volcengine.com/ark"
    }
  },
  {
    // RunningHub 标准模型 API（openapi/v2）：一个 key 解锁 355+ 模型（Seedance/可灵/Veo/混元3D/Meshy…）。
    // ⚠️ 实测（2026-06-27）：标准模型 API **仅限 Enterprise-Shared（企业级-共享）key**，Consumer/个人 key
    // 会报错误码 1014「访问被拒绝」。故 credentialHint 明着标，免得用户拿个人 key 填进来被 1014 蒙（D4 诚实）。
    vendorKey: "runninghub",
    glyph: "R",
    tagline: "一个 key，解锁 355+ 标准模型（Seedance / 可灵 / 混元3D / Meshy…）",
    credentialPlaceholder: "粘贴 RunningHub API Key（32 位）",
    credentialHint: "⚠️ 标准模型 API 需「Enterprise-Shared（企业级-共享）」API Key；个人/Consumer key 会报「访问被拒绝（1014）」。登录 RunningHub → API 设置里拿。凭证本地加密存储。",
    promo: {
      text: "RunningHub 聚合 355+ 主流模型（按量付费）。标准模型 API 需企业级-共享 key——登录后在控制台 API 设置里获取。",
      ctaLabel: "去 RunningHub",
      url: "https://www.runninghub.cn"
    }
  },
  {
    // 火山「语音技术」= 独立产品线，凭证 ≠ 方舟 bearer key（见 volcengineVendor.ts）。
    // 故必须独立成卡：否则豆包语音音色被归进「其他模型」且写死「已配置」，
    // 用户既无处填 APP_ID:ACCESS_KEY，又被误导以为已连通（真实坑，2026-06-25 用户反馈）。
    vendorKey: "volcengine-speech",
    logo: new URL("data:image/png;base64,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", import.meta.url).href,
    glyph: "声",
    tagline: "官方原生 · 豆包语音 2.0 配音（自然语言情感控制）",
    // 火山语音需要两段凭证（App ID + Access Token），声明成两个独立框，别让用户自己拼冒号
    // （D1：让用户照我们的格式手写 = 离谱）。卡片保存时内部拼成 APP_ID:ACCESS_KEY 存单槽。
    credentialFields: [
      {
        key: "appId",
        label: "App ID",
        placeholder: "火山语音应用的 App ID",
        hint: "语音控制台 → 应用管理里的 App ID"
      },
      {
        key: "accessToken",
        label: "Access Token",
        placeholder: "对应的 Access Token",
        secret: !0,
        hint: "同一应用的访问令牌（Access Key）"
      }
    ],
    credentialHint: "需先开通豆包语音合成 2.0 + 付费音色；凭证本地加密存储、只在调用时使用。",
    promo: {
      text: "火山「语音技术」官方（与方舟是不同控制台）。开通豆包语音合成 2.0 与付费音色后，拿 App ID 与 Access Token。",
      ctaLabel: "去火山语音控制台",
      url: "https://console.volcengine.com/speech/app"
    }
  },
  {
    // Replicate：图片「元素拆解」(qwen-image-layered) 的托管端点。本机跑不动 57GB 模型，必须走云；
    // 一把 r8_ token 即可（按量付费，约 $0.05/张）。见 docs/plan/2026-06-28-element-decomposition-feature.md。
    vendorKey: "replicate",
    glyph: "R",
    tagline: "一个 token，解锁「元素拆解」（一张图拆成可编辑图层）",
    credentialPlaceholder: "粘贴 Replicate API Token（r8_…）",
    credentialHint: "用于「元素拆解」(qwen-image-layered，约 $0.05/张，按量付费)。登录 Replicate → Account → API tokens 里拿。凭证本地加密存储、只在调用时使用。",
    promo: {
      text: "Replicate 托管 qwen-image-layered（开源 Apache 2.0），把一张图拆成前景/背景/元素多个可编辑图层。注册后在 Account 里拿 API token，按量付费。",
      ctaLabel: "去 Replicate 拿 token",
      url: "https://replicate.com/account/api-tokens"
    }
  }
], rr = new Map(wo.map((n) => [n.vendorKey, n]));
function sr(n) {
  return rr.has(n);
}
const ir = [
  { kind: "image", labelKey: "onboardingProviders.drawer.kind.image", Icon: mn },
  { kind: "video", labelKey: "onboardingProviders.drawer.kind.video", Icon: so },
  { kind: "text", labelKey: "onboardingProviders.drawer.kind.text", Icon: jt },
  { kind: "audio", labelKey: "onboardingProviders.drawer.kind.audio", Icon: Qo }
], ar = 5, lr = 400;
function dr() {
  const { t: n } = pe(), [r, s] = i.useState(!1), [o, t] = i.useState(void 0), a = i.useCallback((g) => {
    t(g), s(!0);
  }, []), [l, d] = i.useState([]), [N, h] = i.useState([]), [c, j] = i.useState(/* @__PURE__ */ new Map()), [m, x] = i.useState(null), [k, w] = i.useState(null), [D, L] = i.useState(!1), [P, F] = i.useState(!1), b = i.useRef(0), [y, C] = i.useState(0);
  i.useEffect(() => {
    const g = ie();
    if (!g) {
      if (b.current < ar) {
        b.current += 1;
        const T = setTimeout(() => C(($) => $ + 1), lr);
        return () => clearTimeout(T);
      }
      F(!0), L(!0);
      return;
    }
    b.current = 0, F(!1);
    try {
      const T = g.modelCatalog.listModels(), $ = g.modelCatalog.listVendors(), Ke = g.modelCatalog.listMappings({ vendorKey: Ne });
      let ke = null;
      try {
        ke = g.capability?.mcpInfo?.() ?? null;
      } catch {
        ke = null;
      }
      const Ae = ke?.clients.codex?.installed === !0, ge = $.find((Y) => String(Y.key) === Qe);
      ge && ge.enabled !== !1 !== Ae && (g.modelCatalog.upsertVendor({ key: Qe, enabled: Ae }), ge.enabled = Ae, Bn("all"), window.dispatchEvent(new CustomEvent("nomi-model-catalog-changed")));
      const be = /* @__PURE__ */ new Map();
      for (const Y of $)
        be.set(String(Y.key), {
          name: String(Y.name || Y.key),
          hasApiKey: !!Y.hasApiKey,
          baseUrl: String(Y.baseUrlHint || ""),
          enabled: Y.enabled !== !1,
          authType: String(Y.authType || "")
        });
      const ve = T.map((Y) => ({
        modelKey: String(Y.modelKey),
        vendorKey: String(Y.vendorKey),
        labelZh: String(Y.labelZh || Y.modelKey),
        kind: Y.kind,
        // enabled 缺省视为 true（老快照/DTO 未带时不误停用）。
        enabled: Y.enabled !== !1,
        meta: Y.meta
      }));
      j(be), d(ve), h(Ke);
    } catch {
      j(/* @__PURE__ */ new Map()), d([]), h([]);
    }
    try {
      w(g.capability?.mcpInfo?.() ?? null);
    } catch {
      w(null);
    }
    L(!0);
    let W = !0;
    const z = g.dreamina;
    return z ? z.status().then((T) => {
      W && x(T);
    }).catch(() => {
      W && x(null);
    }) : x(null), () => {
      W = !1;
    };
  }, [y]);
  const I = i.useCallback(() => {
    b.current = 0, F(!1), L(!1), C((g) => g + 1);
  }, []), K = i.useCallback(() => {
    Bn("all"), C((g) => g + 1), window.dispatchEvent(new CustomEvent("nomi-model-catalog-changed"));
  }, []), U = i.useCallback(async (g) => {
    const W = ie();
    if (!W || g.length === 0) return;
    const z = g.length === 1;
    if (await Ze({
      title: z ? n("onboardingProviders.drawer.deleteModel") : n("onboardingProviders.drawer.deleteModels", { count: g.length }),
      message: z ? n("onboardingProviders.drawer.deleteSingleMessage", { name: g[0].labelZh }) : n("onboardingProviders.drawer.deleteMultipleMessage", { count: g.length }),
      confirmLabel: n("common.delete"),
      danger: !0
    }))
      try {
        W.modelCatalog.deleteModels(g.map(($) => ({ vendorKey: $.vendorKey, modelKey: $.modelKey }))), K();
      } catch ($) {
        sn({ title: n("onboardingProviders.drawer.deleteFailed"), message: $ instanceof Error ? $.message : String($) });
      }
  }, [K, n]), Z = i.useCallback((g, W) => {
    const z = ie();
    if (!(!z || g.length === 0))
      try {
        for (const T of g)
          z.modelCatalog.upsertModel({ vendorKey: T.vendorKey, modelKey: T.modelKey, enabled: W });
        K();
      } catch (T) {
        sn({ title: n("onboardingProviders.drawer.operationFailed"), message: T instanceof Error ? T.message : String(T) });
      }
  }, [K, n]), X = i.useCallback(async (g, W, z) => {
    const T = await Ao({ vendorKey: g, vendorName: W, modelCount: z, onChanged: K });
    T.error && sn({ title: n("onboardingProviders.drawer.deleteFailed"), message: T.error });
  }, [K, n]), p = wo.map((g) => {
    const W = c.get(g.vendorKey);
    if (!W) return null;
    const z = l.filter((T) => T.vendorKey === g.vendorKey);
    return { directory: g, meta: W, vendorModels: z };
  }).filter((g) => g !== null), H = p.filter((g) => g.meta.hasApiKey), u = p.filter((g) => !g.meta.hasApiKey), B = l.filter(
    (g) => !sr(g.vendorKey) && g.vendorKey !== "dreamina" && g.vendorKey !== Ne && g.vendorKey !== Qe
  ), J = c.get(Ne), V = J !== void 0, q = !!J?.enabled, de = l.filter((g) => g.vendorKey === Ne), f = m !== null, v = !!(m?.installed && m?.loggedIn), M = k !== null, O = !!(k && Object.values(k.clients).some((g) => g.installed)), R = H.length > 0 || B.length > 0 || q || v || O, _ = i.useMemo(() => {
    const g = /* @__PURE__ */ new Map();
    for (const W of l) {
      if (!W.enabled) continue;
      const z = c.get(W.vendorKey);
      if (!z?.hasApiKey && !(W.vendorKey === Qe && z?.authType === "none" && z.enabled)) continue;
      const T = String(W.kind);
      g.set(T, (g.get(T) ?? 0) + 1);
    }
    return g;
  }, [l, c]), oe = [];
  {
    const g = /* @__PURE__ */ new Map();
    for (const W of B) {
      let z = g.get(W.vendorKey);
      z === void 0 && (z = oe.length, g.set(W.vendorKey, z), oe.push({ vendorKey: W.vendorKey, name: c.get(W.vendorKey)?.name || W.vendorKey, models: [] })), oe[z].models.push(W);
    }
  }
  const ue = (g) => /* @__PURE__ */ e.jsx(
    Bt,
    {
      directory: g.directory,
      vendorName: g.meta.name,
      baseUrl: g.meta.baseUrl,
      hasApiKey: g.meta.hasApiKey,
      models: g.vendorModels,
      onToggleModel: (W, z) => Z([W], z),
      onChanged: K
    },
    g.directory.vendorKey
  );
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ e.jsx("div", { className: "px-4 pt-4 pb-1", children: /* @__PURE__ */ e.jsx("div", { className: "text-title font-bold text-nomi-ink", children: n("onboardingProviders.drawer.title") }) }),
    /* @__PURE__ */ e.jsxs("div", { className: "px-4 pt-1 pb-2", children: [
      /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40 mb-1.5", children: n("onboardingProviders.drawer.capabilities") }),
      /* @__PURE__ */ e.jsx("div", { className: "flex flex-wrap gap-1.5", children: ir.map(({ kind: g, labelKey: W, Icon: z }) => {
        const T = _.get(g) ?? 0, $ = T > 0;
        return /* @__PURE__ */ e.jsxs(
          "span",
          {
            className: E(
              "inline-flex items-center gap-1 text-caption rounded-nomi-sm px-2 py-1",
              $ ? "bg-workbench-success-soft text-workbench-success" : "bg-nomi-ink-05 text-nomi-ink-40"
            ),
            children: [
              /* @__PURE__ */ e.jsx(z, { size: 13, stroke: 1.7 }),
              n(W),
              $ ? /* @__PURE__ */ e.jsx("span", { className: "font-semibold tabular-nums", children: T }) : /* @__PURE__ */ e.jsx("span", { className: "text-nomi-ink-30", children: n("onboardingProviders.drawer.notConnected") })
            ]
          },
          g
        );
      }) })
    ] }),
    P ? /* @__PURE__ */ e.jsxs("div", { className: "px-4 py-6 flex flex-col items-start gap-2", children: [
      /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-semibold text-nomi-ink", children: n("onboardingProviders.drawer.bridgeMissingTitle") }),
      /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-60 leading-relaxed", children: n("onboardingProviders.drawer.bridgeMissingBody") }),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: I,
          className: E(
            "mt-1 inline-flex items-center gap-1.5 h-8 px-3 rounded-nomi-sm",
            "bg-nomi-ink text-nomi-paper text-caption font-semibold hover:bg-nomi-accent"
          ),
          children: [
            /* @__PURE__ */ e.jsx(Kn, { size: 14, stroke: 1.8 }),
            n("common.reload")
          ]
        }
      )
    ] }) : D ? /* @__PURE__ */ e.jsxs("div", { className: "px-3 pb-3 pt-1 flex flex-col gap-2", children: [
      R ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsx("div", { className: "text-micro font-semibold text-nomi-ink-40 pt-1 px-0.5", children: n("onboardingProviders.drawer.connected") }),
        H.map(ue),
        oe.map((g) => {
          const W = g.models.filter((T) => T.enabled).length, z = c.get(g.vendorKey);
          return /* @__PURE__ */ e.jsxs(
            Xe,
            {
              glyph: /* @__PURE__ */ e.jsx(Kt, { size: 16, stroke: 1.6 }),
              glyphTone: "soft",
              name: g.name,
              subtitle: n("onboardingProviders.drawer.modelsEnabled", { enabled: W, total: g.models.length }),
              status: "ok",
              statusLabel: n("onboardingProviders.drawer.configured"),
              defaultExpanded: !1,
              headerAction: /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": n("onboardingProviders.drawer.deleteVendorAria", { name: g.name }),
                  title: n("onboardingProviders.drawer.deleteVendorTitle"),
                  onClick: () => {
                    X(g.vendorKey, g.name, g.models.length);
                  },
                  className: E(
                    "grid place-items-center size-7 rounded-nomi-sm text-nomi-ink-40 transition-colors",
                    "hover:bg-[var(--workbench-danger-soft)] hover:text-workbench-danger"
                  ),
                  children: /* @__PURE__ */ e.jsx(Ie, { size: 15, stroke: 1.7 })
                }
              ),
              children: [
                /* @__PURE__ */ e.jsx(Yt, { models: g.models, onToggle: Z, onDelete: U }),
                /* @__PURE__ */ e.jsx(
                  Qt,
                  {
                    vendorKey: g.vendorKey,
                    vendorName: g.name,
                    baseUrl: z?.baseUrl ?? "",
                    hasApiKey: z?.hasApiKey ?? !0,
                    modelCount: g.models.length,
                    onChanged: K
                  }
                )
              ]
            },
            g.vendorKey
          );
        }),
        V && q ? /* @__PURE__ */ e.jsx($n, { enabled: q, baseUrl: J?.baseUrl ?? "", models: de, mappings: N, onChanged: K }) : null,
        f && v ? /* @__PURE__ */ e.jsx(Zn, { status: m, onChanged: K }) : null,
        M && O ? /* @__PURE__ */ e.jsx(Vn, { info: k, onChanged: K }) : null
      ] }) : null,
      /* @__PURE__ */ e.jsx("div", { className: "text-micro font-semibold text-nomi-ink-40 pt-2 px-0.5", children: n("onboardingProviders.drawer.available") }),
      /* @__PURE__ */ e.jsxs(en, { title: n("onboardingProviders.drawer.connectGenerationModels"), count: u.length, defaultExpanded: !R, children: [
        u.map(ue),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => a(void 0),
            className: E(
              "group flex items-center gap-2.5 px-3 h-11 w-full text-left mt-0.5",
              "bg-nomi-ink text-nomi-paper rounded-nomi text-body-sm font-semibold",
              "hover:bg-nomi-accent transition-colors duration-[var(--nomi-transition-fast)]"
            ),
            children: [
              /* @__PURE__ */ e.jsx(un, { size: 16, stroke: 1.9 }),
              /* @__PURE__ */ e.jsx("span", { className: "flex-1 min-w-0", children: n("onboardingProviders.drawer.addModel") }),
              /* @__PURE__ */ e.jsx(ro, { size: 15, className: "shrink-0 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40 px-1 -mt-0.5", children: n("onboardingProviders.drawer.addModelHint") })
      ] }),
      V && !q ? /* @__PURE__ */ e.jsx(en, { title: n("onboardingProviders.drawer.localComfyui"), count: 1, defaultExpanded: !1, children: /* @__PURE__ */ e.jsx($n, { enabled: q, baseUrl: J?.baseUrl ?? "", models: de, mappings: N, onChanged: K }) }) : null,
      f && !v ? /* @__PURE__ */ e.jsx(en, { title: n("onboardingProviders.drawer.dreaminaMember"), count: 1, defaultExpanded: !1, children: /* @__PURE__ */ e.jsx(Zn, { status: m, onChanged: K }) }) : null,
      M && !O ? /* @__PURE__ */ e.jsx(en, { title: n("onboardingProviders.drawer.connectAssistant"), count: 1, defaultExpanded: !1, children: /* @__PURE__ */ e.jsx(Vn, { info: k, onChanged: K }) }) : null
    ] }) : /* @__PURE__ */ e.jsx("div", { className: "px-4 py-6 text-caption text-nomi-ink-40", children: n("onboardingProviders.drawer.loading") }),
    /* @__PURE__ */ e.jsx(
      Ht,
      {
        opened: r,
        onClose: () => s(!1),
        onCommitted: K,
        initialPreset: o
      }
    )
  ] });
}
const cr = 320, eo = 64, mr = 12;
function Kr({ opened: n, onClose: r }) {
  const { t: s } = pe(), o = i.useRef(null);
  return i.useEffect(() => {
    if (!n) return;
    const t = (a) => {
      a.key === "Escape" && r();
    };
    return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
  }, [n, r]), i.useEffect(() => {
    if (!n) return;
    const t = (l) => {
      if (!o.current) return;
      const d = l.target;
      d && (o.current.contains(d) || d.closest(
        '.mantine-Modal-root, .mantine-Modal-overlay, .mantine-Modal-content,.mantine-Drawer-root, .mantine-Drawer-overlay,.mantine-Popover-dropdown, .mantine-Menu-dropdown, .mantine-Combobox-dropdown, .mantine-Tooltip-tooltip,[role="dialog"]'
      ) || r());
    }, a = window.requestAnimationFrame(() => {
      window.addEventListener("mousedown", t);
    });
    return () => {
      window.cancelAnimationFrame(a), window.removeEventListener("mousedown", t);
    };
  }, [n, r]), n ? /* @__PURE__ */ e.jsx(Yo, { children: /* @__PURE__ */ e.jsxs(
    "div",
    {
      ref: o,
      role: "dialog",
      "aria-label": s("onboardingProviders.drawer.title"),
      style: {
        position: "fixed",
        top: eo,
        right: mr,
        width: cr,
        maxHeight: `calc(100vh - ${eo + 16}px)`,
        background: "var(--nomi-paper)",
        borderRadius: "var(--nomi-radius-lg)",
        boxShadow: "var(--nomi-shadow-lg)",
        zIndex: 4e3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        // 进入动画
        animation: "nomi-panel-pop 140ms cubic-bezier(.2, .7, .3, 1)"
      },
      children: [
        /* @__PURE__ */ e.jsx("div", { style: { flex: 1, minHeight: 0, overflowY: "auto" }, children: /* @__PURE__ */ e.jsx(dr, {}) }),
        /* @__PURE__ */ e.jsx("style", { children: `
          @keyframes nomi-panel-pop {
            from { opacity: 0; transform: translateY(-4px) scale(0.985); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        ` })
      ]
    }
  ) }) : null;
}
export {
  Kr as OnboardingFloatingPanel
};
