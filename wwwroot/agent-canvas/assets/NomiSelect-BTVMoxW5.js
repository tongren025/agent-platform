import { cS as f, S as je, dS as Ve, ci as u, aU as He, b8 as O, e1 as C, dV as St, d_ as de, P as Ge, a5 as Ze, F as Pt, c as E, d1 as G, c8 as ue, aK as Nt, at as It, dR as pe, dU as Dt, cD as Ot, du as _t, ck as $e, bj as ze, c2 as Fe, ar as Et, dw as kt, e4 as q, dY as ge, Q as Rt, bx as Tt, aV as Z, bL as At, bK as Xe, aS as Ye, d as jt, bA as K, cL as $t, b7 as zt, bM as ce, bP as Ft, e6 as Lt, aL as le, l as Bt } from "./agentStudioMount-S0u8Hm0S.js";
import { I as Mt } from "./IconChevronRight-CuoN5Ibj.js";
import { u as Qe } from "./use-resolved-styles-api-Dqx45Jgb.js";
const Wt = () => {
};
function Kt(t, e = { active: !0 }) {
  return typeof t != "function" || !e.active ? e.onKeyDown || Wt : (o) => {
    o.key === "Escape" && (t(o), e.onTrigger?.());
  };
}
const Le = ["mousedown", "touchstart"];
function qt(t, e, o) {
  const r = f.useRef(null);
  return f.useEffect(() => {
    const s = (a) => {
      const { target: n } = a ?? {};
      if (Array.isArray(o)) {
        const c = n?.hasAttribute("data-ignore-outside-clicks") || !document.body.contains(n) && n.tagName !== "HTML";
        o.every((d) => !!d && !a.composedPath().includes(d)) && !c && t();
      } else r.current && !r.current.contains(n) && t();
    };
    return (e || Le).forEach((a) => document.addEventListener(a, s)), () => {
      (e || Le).forEach((a) => document.removeEventListener(a, s));
    };
  }, [r, t, o]), r;
}
function Je({
  value: t,
  defaultValue: e,
  finalValue: o,
  onChange: r = () => {
  }
}) {
  const [s, a] = f.useState(
    e !== void 0 ? e : o
  ), n = (c, ...l) => {
    a(c), r?.(c, ...l);
  };
  return t !== void 0 ? [t, r, !0] : [s, n, !1];
}
function et(t) {
  const e = je.version;
  return typeof je.version != "string" || e.startsWith("18.") ? t?.ref : t?.props?.ref;
}
function Ut(t, e) {
  if (t === "rtl" && (e.includes("right") || e.includes("left"))) {
    const [o, r] = e.split("-"), s = o === "right" ? "left" : "right";
    return r === void 0 ? s : `${s}-${r}`;
  }
  return e;
}
function Be(t, e, o, r) {
  return t === "center" || r === "center" ? { top: e } : t === "end" ? { bottom: o } : t === "start" ? { top: o } : {};
}
function Me(t, e, o, r, s) {
  return t === "center" || r === "center" ? { left: e } : t === "end" ? { [s === "ltr" ? "right" : "left"]: o } : t === "start" ? { [s === "ltr" ? "left" : "right"]: o } : {};
}
const Vt = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function Ht({
  position: t,
  arrowSize: e,
  arrowOffset: o,
  arrowRadius: r,
  arrowPosition: s,
  arrowX: a,
  arrowY: n,
  dir: c
}) {
  const [l, d = "center"] = t.split("-"), m = {
    width: e,
    height: e,
    transform: "rotate(45deg)",
    position: "absolute",
    [Vt[l]]: r
  }, p = -e / 2;
  return l === "left" ? {
    ...m,
    ...Be(d, n, o, s),
    right: p,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : l === "right" ? {
    ...m,
    ...Be(d, n, o, s),
    left: p,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : l === "top" ? {
    ...m,
    ...Me(d, a, o, s, c),
    bottom: p,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : l === "bottom" ? {
    ...m,
    ...Me(d, a, o, s, c),
    top: p,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
const tt = f.forwardRef(
  ({
    position: t,
    arrowSize: e,
    arrowOffset: o,
    arrowRadius: r,
    arrowPosition: s,
    visible: a,
    arrowX: n,
    arrowY: c,
    style: l,
    ...d
  }, m) => {
    const { dir: p } = Ve();
    return a ? /* @__PURE__ */ u.jsx(
      "div",
      {
        ...d,
        ref: m,
        style: {
          ...l,
          ...Ht({
            position: t,
            arrowSize: e,
            arrowOffset: o,
            arrowRadius: r,
            arrowPosition: s,
            dir: p,
            arrowX: n,
            arrowY: c
          })
        }
      }
    ) : null;
  }
);
tt.displayName = "@mantine/core/FloatingArrow";
const [Gt, ot] = He(
  "Popover component was not found in the tree"
);
var rt = { dropdown: "m_38a85659", arrow: "m_a31dc6c1", overlay: "m_3d7bc908" };
const Zt = {}, ve = O((t, e) => {
  const o = C("PopoverDropdown", Zt, t), {
    className: r,
    style: s,
    vars: a,
    children: n,
    onKeyDownCapture: c,
    variant: l,
    classNames: d,
    styles: m,
    ...p
  } = o, i = ot(), b = St({
    opened: i.opened,
    shouldReturnFocus: i.returnFocus
  }), x = i.withRoles ? {
    "aria-labelledby": i.getTargetId(),
    id: i.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, v = de(e, i.floating);
  return i.disabled ? null : /* @__PURE__ */ u.jsx(Ge, { ...i.portalProps, withinPortal: i.withinPortal, children: /* @__PURE__ */ u.jsx(
    Ze,
    {
      mounted: i.opened,
      ...i.transitionProps,
      transition: i.transitionProps?.transition || "fade",
      duration: i.transitionProps?.duration ?? 150,
      keepMounted: i.keepMounted,
      exitDuration: typeof i.transitionProps?.exitDuration == "number" ? i.transitionProps.exitDuration : i.transitionProps?.duration,
      children: (w) => /* @__PURE__ */ u.jsx(Pt, { active: i.trapFocus && i.opened, innerRef: v, children: /* @__PURE__ */ u.jsxs(
        E,
        {
          ...x,
          ...p,
          variant: l,
          onKeyDownCapture: Kt(
            () => {
              i.onClose?.(), i.onDismiss?.();
            },
            {
              active: i.closeOnEscape,
              onTrigger: b,
              onKeyDown: c
            }
          ),
          "data-position": i.placement,
          "data-fixed": i.floatingStrategy === "fixed" || void 0,
          ...i.getStyles("dropdown", {
            className: r,
            props: o,
            classNames: d,
            styles: m,
            style: [
              {
                ...w,
                zIndex: i.zIndex,
                top: i.y ?? 0,
                left: i.x ?? 0,
                width: i.width === "target" ? void 0 : G(i.width)
              },
              i.resolvedStyles.dropdown,
              m?.dropdown,
              s
            ]
          }),
          children: [
            n,
            /* @__PURE__ */ u.jsx(
              tt,
              {
                ref: i.arrowRef,
                arrowX: i.arrowX,
                arrowY: i.arrowY,
                visible: i.withArrow,
                position: i.placement,
                arrowSize: i.arrowSize,
                arrowRadius: i.arrowRadius,
                arrowOffset: i.arrowOffset,
                arrowPosition: i.arrowPosition,
                ...i.getStyles("arrow", {
                  props: o,
                  classNames: d,
                  styles: m
                })
              }
            )
          ]
        }
      ) })
    }
  ) });
});
ve.classes = rt;
ve.displayName = "@mantine/core/PopoverDropdown";
const Xt = {
  refProp: "ref",
  popupType: "dialog"
}, nt = O((t, e) => {
  const { children: o, refProp: r, popupType: s, ...a } = C(
    "PopoverTarget",
    Xt,
    t
  );
  if (!ue(o))
    throw new Error(
      "Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  const n = a, c = ot(), l = de(c.reference, et(o), e), d = c.withRoles ? {
    "aria-haspopup": s,
    "aria-expanded": c.opened,
    "aria-controls": c.getDropdownId(),
    id: c.getTargetId()
  } : {};
  return f.cloneElement(o, {
    ...n,
    ...d,
    ...c.targetProps,
    className: Nt(
      c.targetProps.className,
      n.className,
      o.props.className
    ),
    [r]: l,
    ...c.controlled ? null : { onClick: c.onToggle }
  });
});
nt.displayName = "@mantine/core/PopoverTarget";
function Yt({
  opened: t,
  floating: e,
  position: o,
  positionDependencies: r
}) {
  const [s, a] = f.useState(0);
  f.useEffect(() => {
    if (e.refs.reference.current && e.refs.floating.current && t)
      return It(
        e.refs.reference.current,
        e.refs.floating.current,
        e.update
      );
  }, [
    e.refs.reference.current,
    e.refs.floating.current,
    t,
    s,
    o
  ]), pe(() => {
    e.update();
  }, r), pe(() => {
    a((n) => n + 1);
  }, [t]);
}
function Qt(t) {
  if (t === void 0)
    return { shift: !0, flip: !0 };
  const e = { ...t };
  return t.shift === void 0 && (e.shift = !0), t.flip === void 0 && (e.flip = !0), e;
}
function Jt(t, e) {
  const o = Qt(t.middlewares), r = [Ot(t.offset)];
  return o.shift && r.push(
    _t(
      typeof o.shift == "boolean" ? { limiter: $e(), padding: 5 } : { limiter: $e(), padding: 5, ...o.shift }
    )
  ), o.flip && r.push(
    typeof o.flip == "boolean" ? ze() : ze(o.flip)
  ), o.inline && r.push(
    typeof o.inline == "boolean" ? Fe() : Fe(o.inline)
  ), r.push(Et({ element: t.arrowRef, padding: t.arrowOffset })), (o.size || t.width === "target") && r.push(
    kt({
      ...typeof o.size == "boolean" ? {} : o.size,
      apply({ rects: s, availableWidth: a, availableHeight: n, ...c }) {
        const d = e().refs.floating.current?.style ?? {};
        o.size && (typeof o.size == "object" && o.size.apply ? o.size.apply({ rects: s, availableWidth: a, availableHeight: n, ...c }) : Object.assign(d, {
          maxWidth: `${a}px`,
          maxHeight: `${n}px`
        })), t.width === "target" && Object.assign(d, {
          width: `${s.reference.width}px`
        });
      }
    })
  ), r;
}
function eo(t) {
  const [e, o] = Je({
    value: t.opened,
    defaultValue: t.defaultOpened,
    finalValue: !1,
    onChange: t.onChange
  }), r = f.useRef(e), s = () => {
    e && !t.disabled && o(!1);
  }, a = () => !t.disabled && o(!e), n = Dt({
    strategy: t.strategy,
    placement: t.position,
    middleware: Jt(t, () => n)
  });
  return Yt({
    opened: e,
    position: t.position,
    positionDependencies: t.positionDependencies || [],
    floating: n
  }), pe(() => {
    t.onPositionChange?.(n.placement);
  }, [n.placement]), pe(() => {
    e !== r.current && (e ? t.onOpen?.() : t.onClose?.()), r.current = e;
  }, [e, t.onClose, t.onOpen]), {
    floating: n,
    controlled: typeof t.opened == "boolean",
    opened: e,
    onClose: s,
    onToggle: a
  };
}
const to = {
  position: "bottom",
  offset: 8,
  positionDependencies: [],
  transitionProps: { transition: "fade", duration: 150 },
  middlewares: { flip: !0, shift: !0, inline: !1 },
  arrowSize: 7,
  arrowOffset: 5,
  arrowRadius: 0,
  arrowPosition: "side",
  closeOnClickOutside: !0,
  withinPortal: !0,
  closeOnEscape: !0,
  trapFocus: !1,
  withRoles: !0,
  returnFocus: !1,
  withOverlay: !1,
  clickOutsideEvents: ["mousedown", "touchstart"],
  zIndex: Tt("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, oo = Z((t, { radius: e, shadow: o }) => ({
  dropdown: {
    "--popover-radius": e === void 0 ? void 0 : Xe(e),
    "--popover-shadow": At(o)
  }
}));
function X(t) {
  const e = C("Popover", to, t), {
    children: o,
    position: r,
    offset: s,
    onPositionChange: a,
    positionDependencies: n,
    opened: c,
    transitionProps: l,
    onExitTransitionEnd: d,
    onEnterTransitionEnd: m,
    width: p,
    middlewares: i,
    withArrow: b,
    arrowSize: x,
    arrowOffset: v,
    arrowRadius: w,
    arrowPosition: h,
    unstyled: N,
    classNames: S,
    styles: g,
    closeOnClickOutside: M,
    withinPortal: k,
    portalProps: U,
    closeOnEscape: Y,
    clickOutsideEvents: Q,
    trapFocus: J,
    onClose: oe,
    onDismiss: F,
    onOpen: $,
    onChange: z,
    zIndex: ee,
    radius: y,
    shadow: R,
    id: I,
    defaultOpened: D,
    __staticSelector: L,
    withRoles: re,
    disabled: ne,
    returnFocus: W,
    variant: se,
    keepMounted: V,
    vars: ae,
    floatingStrategy: H,
    withOverlay: xe,
    overlayProps: ie,
    ...ut
  } = e, Re = q({
    name: L,
    props: e,
    classes: rt,
    classNames: S,
    styles: g,
    unstyled: N,
    rootSelector: "dropdown",
    vars: ae,
    varsResolver: oo
  }), { resolvedStyles: mt } = Qe({ classNames: S, styles: g, props: e }), Te = f.useRef(null), [ft, bt] = f.useState(null), [ht, xt] = f.useState(null), { dir: gt } = Ve(), Ae = ge(I), _ = eo({
    middlewares: i,
    width: p,
    position: Ut(gt, r),
    offset: typeof s == "number" ? s + (b ? x / 2 : 0) : s,
    arrowRef: Te,
    arrowOffset: v,
    onPositionChange: a,
    positionDependencies: n,
    opened: c,
    defaultOpened: D,
    onChange: z,
    onOpen: $,
    onClose: oe,
    onDismiss: F,
    strategy: H,
    disabled: ne
  });
  qt(
    () => {
      M && (_.onClose(), F?.());
    },
    Q,
    [ft, ht]
  );
  const vt = f.useCallback(
    (te) => {
      bt(te), _.floating.refs.setReference(te);
    },
    [_.floating.refs.setReference]
  ), yt = f.useCallback(
    (te) => {
      xt(te), _.floating.refs.setFloating(te);
    },
    [_.floating.refs.setFloating]
  ), wt = f.useCallback(() => {
    l?.onExited?.(), d?.();
  }, [l?.onExited, d]), Ct = f.useCallback(() => {
    l?.onEntered?.(), m?.();
  }, [l?.onEntered, m]);
  return /* @__PURE__ */ u.jsxs(
    Gt,
    {
      value: {
        returnFocus: W,
        disabled: ne,
        controlled: _.controlled,
        reference: vt,
        floating: yt,
        x: _.floating.x,
        y: _.floating.y,
        arrowX: _.floating?.middlewareData?.arrow?.x,
        arrowY: _.floating?.middlewareData?.arrow?.y,
        opened: _.opened,
        arrowRef: Te,
        transitionProps: { ...l, onExited: wt, onEntered: Ct },
        width: p,
        withArrow: b,
        arrowSize: x,
        arrowOffset: v,
        arrowRadius: w,
        arrowPosition: h,
        placement: _.floating.placement,
        trapFocus: J,
        withinPortal: k,
        portalProps: U,
        zIndex: ee,
        radius: y,
        shadow: R,
        closeOnEscape: Y,
        onDismiss: F,
        onClose: _.onClose,
        onToggle: _.onToggle,
        getTargetId: () => `${Ae}-target`,
        getDropdownId: () => `${Ae}-dropdown`,
        withRoles: re,
        targetProps: ut,
        __staticSelector: L,
        classNames: S,
        styles: g,
        unstyled: N,
        variant: se,
        keepMounted: V,
        getStyles: Re,
        resolvedStyles: mt,
        floatingStrategy: H
      },
      children: [
        o,
        xe && /* @__PURE__ */ u.jsx(
          Ze,
          {
            transition: "fade",
            mounted: _.opened,
            duration: l?.duration || 250,
            exitDuration: l?.exitDuration || 250,
            children: (te) => /* @__PURE__ */ u.jsx(Ge, { withinPortal: k, children: /* @__PURE__ */ u.jsx(
              Rt,
              {
                ...ie,
                ...Re("overlay", {
                  className: ie?.className,
                  style: [te, ie?.style]
                })
              }
            ) })
          }
        )
      ]
    }
  );
}
X.Target = nt;
X.Dropdown = ve;
X.displayName = "@mantine/core/Popover";
X.extend = (t) => t;
const [ro, no] = Ye({
  size: "sm"
}), so = {}, st = O((t, e) => {
  const o = C("InputClearButton", so, t), { size: r, variant: s, vars: a, classNames: n, styles: c, ...l } = o, d = no(), { resolvedClassNames: m, resolvedStyles: p } = Qe({
    classNames: n,
    styles: c,
    props: o
  });
  return /* @__PURE__ */ u.jsx(
    jt,
    {
      variant: s || "transparent",
      ref: e,
      size: r || d?.size || "sm",
      classNames: m,
      styles: p,
      __staticSelector: "InputClearButton",
      ...l
    }
  );
});
st.displayName = "@mantine/core/InputClearButton";
const [ao, me] = Ye({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0
});
var T = { wrapper: "m_6c018570", input: "m_8fb7ebe7", section: "m_82577fc2", placeholder: "m_88bacfd0", root: "m_46b77525", label: "m_8fdc1311", required: "m_78a94662", error: "m_8f816625", description: "m_fe47ce59" };
const We = {}, io = Z((t, { size: e }) => ({
  description: {
    "--input-description-size": e === void 0 ? void 0 : `calc(${K(e)} - ${G(2)})`
  }
})), fe = O((t, e) => {
  const o = C("InputDescription", We, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    vars: l,
    size: d,
    __staticSelector: m,
    __inheritStyles: p = !0,
    variant: i,
    ...b
  } = C("InputDescription", We, o), x = me(), v = q({
    name: ["InputWrapper", m],
    props: o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    rootSelector: "description",
    vars: l,
    varsResolver: io
  }), w = p && x?.getStyles || v;
  return /* @__PURE__ */ u.jsx(
    E,
    {
      component: "p",
      ref: e,
      variant: i,
      size: d,
      ...w("description", x?.getStyles ? { className: s, style: a } : void 0),
      ...b
    }
  );
});
fe.classes = T;
fe.displayName = "@mantine/core/InputDescription";
const lo = {}, co = Z((t, { size: e }) => ({
  error: {
    "--input-error-size": e === void 0 ? void 0 : `calc(${K(e)} - ${G(2)})`
  }
})), be = O((t, e) => {
  const o = C("InputError", lo, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    vars: l,
    size: d,
    __staticSelector: m,
    __inheritStyles: p = !0,
    variant: i,
    ...b
  } = o, x = q({
    name: ["InputWrapper", m],
    props: o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    rootSelector: "error",
    vars: l,
    varsResolver: co
  }), v = me(), w = p && v?.getStyles || x;
  return /* @__PURE__ */ u.jsx(
    E,
    {
      component: "p",
      ref: e,
      variant: i,
      size: d,
      ...w("error", v?.getStyles ? { className: s, style: a } : void 0),
      ...b
    }
  );
});
be.classes = T;
be.displayName = "@mantine/core/InputError";
const Ke = {
  labelElement: "label"
}, po = Z((t, { size: e }) => ({
  label: {
    "--input-label-size": K(e),
    "--input-asterisk-color": void 0
  }
})), he = O((t, e) => {
  const o = C("InputLabel", Ke, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    vars: l,
    labelElement: d,
    size: m,
    required: p,
    htmlFor: i,
    onMouseDown: b,
    children: x,
    __staticSelector: v,
    variant: w,
    mod: h,
    ...N
  } = C("InputLabel", Ke, o), S = q({
    name: ["InputWrapper", v],
    props: o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    rootSelector: "label",
    vars: l,
    varsResolver: po
  }), g = me(), M = g?.getStyles || S;
  return /* @__PURE__ */ u.jsxs(
    E,
    {
      ...M("label", g?.getStyles ? { className: s, style: a } : void 0),
      component: d,
      variant: w,
      size: m,
      ref: e,
      htmlFor: d === "label" ? i : void 0,
      mod: [{ required: p }, h],
      onMouseDown: (k) => {
        b?.(k), !k.defaultPrevented && k.detail > 1 && k.preventDefault();
      },
      ...N,
      children: [
        x,
        p && /* @__PURE__ */ u.jsx("span", { ...M("required"), "aria-hidden": !0, children: " *" })
      ]
    }
  );
});
he.classes = T;
he.displayName = "@mantine/core/InputLabel";
const qe = {}, ye = O((t, e) => {
  const o = C("InputPlaceholder", qe, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    vars: l,
    __staticSelector: d,
    variant: m,
    error: p,
    mod: i,
    ...b
  } = C("InputPlaceholder", qe, o), x = q({
    name: ["InputPlaceholder", d],
    props: o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    rootSelector: "placeholder"
  });
  return /* @__PURE__ */ u.jsx(
    E,
    {
      ...x("placeholder"),
      mod: [{ error: !!p }, i],
      component: "span",
      variant: m,
      ref: e,
      ...b
    }
  );
});
ye.classes = T;
ye.displayName = "@mantine/core/InputPlaceholder";
function uo(t, { hasDescription: e, hasError: o }) {
  const r = t.findIndex((l) => l === "input"), s = t.slice(0, r), a = t.slice(r + 1), n = e && s.includes("description") || o && s.includes("error");
  return { offsetBottom: e && a.includes("description") || o && a.includes("error"), offsetTop: n };
}
const mo = {
  labelElement: "label",
  inputContainer: (t) => t,
  inputWrapperOrder: ["label", "description", "input", "error"]
}, fo = Z((t, { size: e }) => ({
  label: {
    "--input-label-size": K(e),
    "--input-asterisk-color": void 0
  },
  error: {
    "--input-error-size": e === void 0 ? void 0 : `calc(${K(e)} - ${G(2)})`
  },
  description: {
    "--input-description-size": e === void 0 ? void 0 : `calc(${K(e)} - ${G(2)})`
  }
})), we = O((t, e) => {
  const o = C("InputWrapper", mo, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    vars: l,
    size: d,
    variant: m,
    __staticSelector: p,
    inputContainer: i,
    inputWrapperOrder: b,
    label: x,
    error: v,
    description: w,
    labelProps: h,
    descriptionProps: N,
    errorProps: S,
    labelElement: g,
    children: M,
    withAsterisk: k,
    id: U,
    required: Y,
    __stylesApiProps: Q,
    mod: J,
    ...oe
  } = o, F = q({
    name: ["InputWrapper", p],
    props: Q || o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    vars: l,
    varsResolver: fo
  }), $ = {
    size: d,
    variant: m,
    __staticSelector: p
  }, z = ge(U), ee = typeof k == "boolean" ? k : Y, y = S?.id || `${z}-error`, R = N?.id || `${z}-description`, I = z, D = !!v && typeof v != "boolean", L = !!w, re = `${D ? y : ""} ${L ? R : ""}`, ne = re.trim().length > 0 ? re.trim() : void 0, W = h?.id || `${z}-label`, se = x && /* @__PURE__ */ u.jsx(
    he,
    {
      labelElement: g,
      id: W,
      htmlFor: I,
      required: ee,
      ...$,
      ...h,
      children: x
    },
    "label"
  ), V = L && /* @__PURE__ */ u.jsx(
    fe,
    {
      ...N,
      ...$,
      size: N?.size || $.size,
      id: N?.id || R,
      children: w
    },
    "description"
  ), ae = /* @__PURE__ */ u.jsx(f.Fragment, { children: i(M) }, "input"), H = D && /* @__PURE__ */ f.createElement(
    be,
    {
      ...S,
      ...$,
      size: S?.size || $.size,
      key: "error",
      id: S?.id || y
    },
    v
  ), xe = b.map((ie) => {
    switch (ie) {
      case "label":
        return se;
      case "input":
        return ae;
      case "description":
        return V;
      case "error":
        return H;
      default:
        return null;
    }
  });
  return /* @__PURE__ */ u.jsx(
    ao,
    {
      value: {
        getStyles: F,
        describedBy: ne,
        inputId: I,
        labelId: W,
        ...uo(b, { hasDescription: L, hasError: D })
      },
      children: /* @__PURE__ */ u.jsx(
        E,
        {
          ref: e,
          variant: m,
          size: d,
          mod: [{ error: !!v }, J],
          ...F("root"),
          ...oe,
          children: xe
        }
      )
    }
  );
});
we.classes = T;
we.displayName = "@mantine/core/InputWrapper";
const bo = {
  variant: "default",
  leftSectionPointerEvents: "none",
  rightSectionPointerEvents: "none",
  withAria: !0,
  withErrorStyles: !0
}, ho = Z((t, e, o) => ({
  wrapper: {
    "--input-margin-top": o.offsetTop ? "calc(var(--mantine-spacing-xs) / 2)" : void 0,
    "--input-margin-bottom": o.offsetBottom ? "calc(var(--mantine-spacing-xs) / 2)" : void 0,
    "--input-height": ce(e.size, "input-height"),
    "--input-fz": K(e.size),
    "--input-radius": e.radius === void 0 ? void 0 : Xe(e.radius),
    "--input-left-section-width": e.leftSectionWidth !== void 0 ? G(e.leftSectionWidth) : void 0,
    "--input-right-section-width": e.rightSectionWidth !== void 0 ? G(e.rightSectionWidth) : void 0,
    "--input-padding-y": e.multiline ? ce(e.size, "input-padding-y") : void 0,
    "--input-left-section-pointer-events": e.leftSectionPointerEvents,
    "--input-right-section-pointer-events": e.rightSectionPointerEvents
  }
})), B = $t((t, e) => {
  const o = C("Input", bo, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    unstyled: c,
    required: l,
    __staticSelector: d,
    __stylesApiProps: m,
    size: p,
    wrapperProps: i,
    error: b,
    disabled: x,
    leftSection: v,
    leftSectionProps: w,
    leftSectionWidth: h,
    rightSection: N,
    rightSectionProps: S,
    rightSectionWidth: g,
    rightSectionPointerEvents: M,
    leftSectionPointerEvents: k,
    variant: U,
    vars: Y,
    pointer: Q,
    multiline: J,
    radius: oe,
    id: F,
    withAria: $,
    withErrorStyles: z,
    mod: ee,
    inputSize: y,
    __clearSection: R,
    __clearable: I,
    __defaultRightSection: D,
    ...L
  } = o, { styleProps: re, rest: ne } = zt(L), W = me(), se = { offsetBottom: W?.offsetBottom, offsetTop: W?.offsetTop }, V = q({
    name: ["Input", d],
    props: m || o,
    classes: T,
    className: s,
    style: a,
    classNames: r,
    styles: n,
    unstyled: c,
    stylesCtx: se,
    rootSelector: "wrapper",
    vars: Y,
    varsResolver: ho
  }), ae = $ ? {
    required: l,
    disabled: x,
    "aria-invalid": !!b,
    "aria-describedby": W?.describedBy,
    id: W?.inputId || F
  } : {}, H = N || I && R || D;
  return /* @__PURE__ */ u.jsx(ro, { value: { size: p || "sm" }, children: /* @__PURE__ */ u.jsxs(
    E,
    {
      ...V("wrapper"),
      ...re,
      ...i,
      mod: [
        {
          error: !!b && z,
          pointer: Q,
          disabled: x,
          multiline: J,
          "data-with-right-section": !!H,
          "data-with-left-section": !!v
        },
        ee
      ],
      variant: U,
      size: p,
      children: [
        v && /* @__PURE__ */ u.jsx(
          "div",
          {
            ...w,
            "data-position": "left",
            ...V("section", {
              className: w?.className,
              style: w?.style
            }),
            children: v
          }
        ),
        /* @__PURE__ */ u.jsx(
          E,
          {
            component: "input",
            ...ne,
            ...ae,
            ref: e,
            required: l,
            mod: { disabled: x, error: !!b && z },
            variant: U,
            __size: y,
            ...V("input")
          }
        ),
        H && /* @__PURE__ */ u.jsx(
          "div",
          {
            ...S,
            "data-position": "right",
            ...V("section", {
              className: S?.className,
              style: S?.style
            }),
            children: H
          }
        )
      ]
    }
  ) });
});
B.classes = T;
B.Wrapper = we;
B.Label = he;
B.Error = be;
B.Description = fe;
B.Placeholder = ye;
B.ClearButton = st;
B.displayName = "@mantine/core/Input";
var A = { dropdown: "m_88b62a41", search: "m_985517d8", options: "m_b2821a6e", option: "m_92253aa5", empty: "m_2530cd1d", header: "m_858f94bd", footer: "m_82b967cb", group: "m_254f3e4f", groupLabel: "m_2bb2e9e5", chevron: "m_2943220b", optionsDropdownOption: "m_390b5f4", optionsDropdownCheckIcon: "m_8ee53fc2" };
const xo = {
  error: null
}, go = Z((t, { size: e, color: o }) => ({
  chevron: {
    "--combobox-chevron-size": ce(e, "combobox-chevron-size"),
    "--combobox-chevron-color": o ? Ft(o, t) : void 0
  }
})), Ce = O((t, e) => {
  const o = C("ComboboxChevron", xo, t), { size: r, error: s, style: a, className: n, classNames: c, styles: l, unstyled: d, vars: m, mod: p, ...i } = o, b = q({
    name: "ComboboxChevron",
    classes: A,
    props: o,
    style: a,
    className: n,
    classNames: c,
    styles: l,
    unstyled: d,
    vars: m,
    varsResolver: go,
    rootSelector: "chevron"
  });
  return /* @__PURE__ */ u.jsx(
    E,
    {
      component: "svg",
      ...i,
      ...b("chevron"),
      size: r,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      mod: ["combobox-chevron", { error: s }, p],
      ref: e,
      children: /* @__PURE__ */ u.jsx(
        "path",
        {
          d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
          fill: "currentColor",
          fillRule: "evenodd",
          clipRule: "evenodd"
        }
      )
    }
  );
});
Ce.classes = A;
Ce.displayName = "@mantine/core/ComboboxChevron";
const [vo, j] = He(
  "Combobox component was not found in tree"
), at = f.forwardRef(
  ({ size: t, onMouseDown: e, onClick: o, onClear: r, ...s }, a) => /* @__PURE__ */ u.jsx(
    B.ClearButton,
    {
      ref: a,
      tabIndex: -1,
      "aria-hidden": !0,
      ...s,
      onMouseDown: (n) => {
        n.preventDefault(), e?.(n);
      },
      onClick: (n) => {
        r(), o?.(n);
      }
    }
  )
);
at.displayName = "@mantine/core/ComboboxClearButton";
const yo = {}, Se = O((t, e) => {
  const { classNames: o, styles: r, className: s, style: a, hidden: n, ...c } = C(
    "ComboboxDropdown",
    yo,
    t
  ), l = j();
  return /* @__PURE__ */ u.jsx(
    X.Dropdown,
    {
      ...c,
      ref: e,
      role: "presentation",
      "data-hidden": n || void 0,
      ...l.getStyles("dropdown", { className: s, style: a, classNames: o, styles: r })
    }
  );
});
Se.classes = A;
Se.displayName = "@mantine/core/ComboboxDropdown";
const wo = {
  refProp: "ref"
}, it = O((t, e) => {
  const { children: o, refProp: r } = C("ComboboxDropdownTarget", wo, t);
  if (j(), !ue(o))
    throw new Error(
      "Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  return /* @__PURE__ */ u.jsx(X.Target, { ref: e, refProp: r, children: o });
});
it.displayName = "@mantine/core/ComboboxDropdownTarget";
const Co = {}, Pe = O((t, e) => {
  const { classNames: o, className: r, style: s, styles: a, vars: n, ...c } = C(
    "ComboboxEmpty",
    Co,
    t
  ), l = j();
  return /* @__PURE__ */ u.jsx(
    E,
    {
      ref: e,
      ...l.getStyles("empty", { className: r, classNames: o, styles: a, style: s }),
      ...c
    }
  );
});
Pe.classes = A;
Pe.displayName = "@mantine/core/ComboboxEmpty";
function Ne({
  onKeyDown: t,
  withKeyboardNavigation: e,
  withAriaAttributes: o,
  withExpandedAttribute: r,
  targetType: s,
  autoComplete: a
}) {
  const n = j(), [c, l] = f.useState(null), d = (p) => {
    if (t?.(p), !n.readOnly && e) {
      if (p.nativeEvent.isComposing)
        return;
      if (p.nativeEvent.code === "ArrowDown" && (p.preventDefault(), n.store.dropdownOpened ? l(n.store.selectNextOption()) : (n.store.openDropdown("keyboard"), l(n.store.selectActiveOption()), n.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), p.nativeEvent.code === "ArrowUp" && (p.preventDefault(), n.store.dropdownOpened ? l(n.store.selectPreviousOption()) : (n.store.openDropdown("keyboard"), l(n.store.selectActiveOption()), n.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), p.nativeEvent.code === "Enter" || p.nativeEvent.code === "NumpadEnter") {
        if (p.nativeEvent.keyCode === 229)
          return;
        const i = n.store.getSelectedOptionIndex();
        n.store.dropdownOpened && i !== -1 ? (p.preventDefault(), n.store.clickSelectedOption()) : s === "button" && (p.preventDefault(), n.store.openDropdown("keyboard"));
      }
      p.key === "Escape" && n.store.closeDropdown("keyboard"), p.nativeEvent.code === "Space" && s === "button" && (p.preventDefault(), n.store.toggleDropdown("keyboard"));
    }
  };
  return {
    ...o ? {
      "aria-haspopup": "listbox",
      "aria-expanded": r && !!(n.store.listId && n.store.dropdownOpened) || void 0,
      "aria-controls": n.store.dropdownOpened ? n.store.listId : void 0,
      "aria-activedescendant": n.store.dropdownOpened && c || void 0,
      autoComplete: a,
      "data-expanded": n.store.dropdownOpened || void 0,
      "data-mantine-stop-propagation": n.store.dropdownOpened || void 0
    } : {},
    onKeyDown: d
  };
}
const So = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, lt = O((t, e) => {
  const {
    children: o,
    refProp: r,
    withKeyboardNavigation: s,
    withAriaAttributes: a,
    withExpandedAttribute: n,
    targetType: c,
    autoComplete: l,
    ...d
  } = C("ComboboxEventsTarget", So, t);
  if (!ue(o))
    throw new Error(
      "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  const m = j(), p = Ne({
    targetType: c,
    withAriaAttributes: a,
    withKeyboardNavigation: s,
    withExpandedAttribute: n,
    onKeyDown: o.props.onKeyDown,
    autoComplete: l
  });
  return f.cloneElement(o, {
    ...p,
    ...d,
    [r]: de(e, m.store.targetRef, et(o))
  });
});
lt.displayName = "@mantine/core/ComboboxEventsTarget";
const Po = {}, Ie = O((t, e) => {
  const { classNames: o, className: r, style: s, styles: a, vars: n, ...c } = C(
    "ComboboxFooter",
    Po,
    t
  ), l = j();
  return /* @__PURE__ */ u.jsx(
    E,
    {
      ref: e,
      ...l.getStyles("footer", { className: r, classNames: o, style: s, styles: a }),
      ...c,
      onMouseDown: (d) => {
        d.preventDefault();
      }
    }
  );
});
Ie.classes = A;
Ie.displayName = "@mantine/core/ComboboxFooter";
const No = {}, De = O((t, e) => {
  const { classNames: o, className: r, style: s, styles: a, vars: n, children: c, label: l, ...d } = C(
    "ComboboxGroup",
    No,
    t
  ), m = j();
  return /* @__PURE__ */ u.jsxs(
    E,
    {
      ref: e,
      ...m.getStyles("group", { className: r, classNames: o, style: s, styles: a }),
      ...d,
      children: [
        l && /* @__PURE__ */ u.jsx("div", { ...m.getStyles("groupLabel", { classNames: o, styles: a }), children: l }),
        c
      ]
    }
  );
});
De.classes = A;
De.displayName = "@mantine/core/ComboboxGroup";
const Io = {}, Oe = O((t, e) => {
  const { classNames: o, className: r, style: s, styles: a, vars: n, ...c } = C(
    "ComboboxHeader",
    Io,
    t
  ), l = j();
  return /* @__PURE__ */ u.jsx(
    E,
    {
      ref: e,
      ...l.getStyles("header", { className: r, classNames: o, style: s, styles: a }),
      ...c,
      onMouseDown: (d) => {
        d.preventDefault();
      }
    }
  );
});
Oe.classes = A;
Oe.displayName = "@mantine/core/ComboboxHeader";
function ct({
  value: t,
  valuesDivider: e = ",",
  ...o
}) {
  return /* @__PURE__ */ u.jsx(
    "input",
    {
      type: "hidden",
      value: Array.isArray(t) ? t.join(e) : t || "",
      ...o
    }
  );
}
ct.displayName = "@mantine/core/ComboboxHiddenInput";
const Do = {}, _e = O((t, e) => {
  const o = C("ComboboxOption", Do, t), {
    classNames: r,
    className: s,
    style: a,
    styles: n,
    vars: c,
    onClick: l,
    id: d,
    active: m,
    onMouseDown: p,
    onMouseOver: i,
    disabled: b,
    selected: x,
    mod: v,
    ...w
  } = o, h = j(), N = f.useId(), S = d || N;
  return /* @__PURE__ */ u.jsx(
    E,
    {
      ...h.getStyles("option", { className: s, classNames: r, styles: n, style: a }),
      ...w,
      ref: e,
      id: S,
      mod: [
        "combobox-option",
        { "combobox-active": m, "combobox-disabled": b, "combobox-selected": x },
        v
      ],
      role: "option",
      onClick: (g) => {
        b ? g.preventDefault() : (h.onOptionSubmit?.(o.value, o), l?.(g));
      },
      onMouseDown: (g) => {
        g.preventDefault(), p?.(g);
      },
      onMouseOver: (g) => {
        h.resetSelectionOnOptionHover && h.store.resetSelectedOption(), i?.(g);
      }
    }
  );
});
_e.classes = A;
_e.displayName = "@mantine/core/ComboboxOption";
const Oo = {}, Ee = O((t, e) => {
  const o = C("ComboboxOptions", Oo, t), { classNames: r, className: s, style: a, styles: n, id: c, onMouseDown: l, labelledBy: d, ...m } = o, p = j(), i = ge(c);
  return f.useEffect(() => {
    p.store.setListId(i);
  }, [i]), /* @__PURE__ */ u.jsx(
    E,
    {
      ref: e,
      ...p.getStyles("options", { className: s, style: a, classNames: r, styles: n }),
      ...m,
      id: i,
      role: "listbox",
      "aria-labelledby": d,
      onMouseDown: (b) => {
        b.preventDefault(), l?.(b);
      }
    }
  );
});
Ee.classes = A;
Ee.displayName = "@mantine/core/ComboboxOptions";
const _o = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, ke = O((t, e) => {
  const o = C("ComboboxSearch", _o, t), {
    classNames: r,
    styles: s,
    unstyled: a,
    vars: n,
    withAriaAttributes: c,
    onKeyDown: l,
    withKeyboardNavigation: d,
    size: m,
    ...p
  } = o, i = j(), b = i.getStyles("search"), x = Ne({
    targetType: "input",
    withAriaAttributes: c,
    withKeyboardNavigation: d,
    withExpandedAttribute: !1,
    onKeyDown: l,
    autoComplete: "off"
  });
  return /* @__PURE__ */ u.jsx(
    B,
    {
      ref: de(e, i.store.searchRef),
      classNames: [{ input: b.className }, r],
      styles: [{ input: b.style }, s],
      size: m || i.size,
      ...x,
      ...p,
      __staticSelector: "Combobox"
    }
  );
});
ke.classes = A;
ke.displayName = "@mantine/core/ComboboxSearch";
const Eo = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, dt = O((t, e) => {
  const {
    children: o,
    refProp: r,
    withKeyboardNavigation: s,
    withAriaAttributes: a,
    withExpandedAttribute: n,
    targetType: c,
    autoComplete: l,
    ...d
  } = C("ComboboxTarget", Eo, t);
  if (!ue(o))
    throw new Error(
      "Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
    );
  const m = j(), p = Ne({
    targetType: c,
    withAriaAttributes: a,
    withKeyboardNavigation: s,
    withExpandedAttribute: n,
    onKeyDown: o.props.onKeyDown,
    autoComplete: l
  }), i = f.cloneElement(o, {
    ...p,
    ...d
  });
  return /* @__PURE__ */ u.jsx(X.Target, { ref: de(e, m.store.targetRef), children: i });
});
dt.displayName = "@mantine/core/ComboboxTarget";
function ko(t, e, o) {
  for (let r = t - 1; r >= 0; r -= 1)
    if (!e[r].hasAttribute("data-combobox-disabled"))
      return r;
  if (o) {
    for (let r = e.length - 1; r > -1; r -= 1)
      if (!e[r].hasAttribute("data-combobox-disabled"))
        return r;
  }
  return t;
}
function Ro(t, e, o) {
  for (let r = t + 1; r < e.length; r += 1)
    if (!e[r].hasAttribute("data-combobox-disabled"))
      return r;
  if (o) {
    for (let r = 0; r < e.length; r += 1)
      if (!e[r].hasAttribute("data-combobox-disabled"))
        return r;
  }
  return t;
}
function To(t) {
  for (let e = 0; e < t.length; e += 1)
    if (!t[e].hasAttribute("data-combobox-disabled"))
      return e;
  return -1;
}
function pt({
  defaultOpened: t,
  opened: e,
  onOpenedChange: o,
  onDropdownClose: r,
  onDropdownOpen: s,
  loop: a = !0,
  scrollBehavior: n = "instant"
} = {}) {
  const [c, l] = Je({
    value: e,
    defaultValue: t,
    finalValue: !1,
    onChange: o
  }), d = f.useRef(null), m = f.useRef(-1), p = f.useRef(null), i = f.useRef(null), b = f.useRef(-1), x = f.useRef(-1), v = f.useRef(-1), w = f.useCallback(
    (y = "unknown") => {
      c || (l(!0), s?.(y));
    },
    [l, s, c]
  ), h = f.useCallback(
    (y = "unknown") => {
      c && (l(!1), r?.(y));
    },
    [l, r, c]
  ), N = f.useCallback(
    (y = "unknown") => {
      c ? h(y) : w(y);
    },
    [h, w, c]
  ), S = f.useCallback(() => {
    const y = document.querySelector(`#${d.current} [data-combobox-selected]`);
    y?.removeAttribute("data-combobox-selected"), y?.removeAttribute("aria-selected");
  }, []), g = f.useCallback(
    (y) => {
      const I = document.getElementById(d.current)?.querySelectorAll("[data-combobox-option]");
      if (!I)
        return null;
      const D = y >= I.length ? 0 : y < 0 ? I.length - 1 : y;
      return m.current = D, I?.[D] && !I[D].hasAttribute("data-combobox-disabled") ? (S(), I[D].setAttribute("data-combobox-selected", "true"), I[D].setAttribute("aria-selected", "true"), I[D].scrollIntoView({ block: "nearest", behavior: n }), I[D].id) : null;
    },
    [n, S]
  ), M = f.useCallback(() => {
    const y = document.querySelector(
      `#${d.current} [data-combobox-active]`
    );
    if (y) {
      const R = document.querySelectorAll(
        `#${d.current} [data-combobox-option]`
      ), I = Array.from(R).findIndex((D) => D === y);
      return g(I);
    }
    return g(0);
  }, [g]), k = f.useCallback(
    () => g(
      Ro(
        m.current,
        document.querySelectorAll(`#${d.current} [data-combobox-option]`),
        a
      )
    ),
    [g, a]
  ), U = f.useCallback(
    () => g(
      ko(
        m.current,
        document.querySelectorAll(`#${d.current} [data-combobox-option]`),
        a
      )
    ),
    [g, a]
  ), Y = f.useCallback(
    () => g(
      To(
        document.querySelectorAll(`#${d.current} [data-combobox-option]`)
      )
    ),
    [g]
  ), Q = f.useCallback(
    (y = "selected", R) => {
      v.current = window.setTimeout(() => {
        const I = document.querySelectorAll(
          `#${d.current} [data-combobox-option]`
        ), D = Array.from(I).findIndex(
          (L) => L.hasAttribute(`data-combobox-${y}`)
        );
        m.current = D, R?.scrollIntoView && I[D]?.scrollIntoView({ block: "nearest", behavior: n });
      }, 0);
    },
    []
  ), J = f.useCallback(() => {
    m.current = -1, S();
  }, [S]), oe = f.useCallback(() => {
    document.querySelectorAll(
      `#${d.current} [data-combobox-option]`
    )?.[m.current]?.click();
  }, []), F = f.useCallback((y) => {
    d.current = y;
  }, []), $ = f.useCallback(() => {
    b.current = window.setTimeout(() => p.current.focus(), 0);
  }, []), z = f.useCallback(() => {
    x.current = window.setTimeout(() => i.current.focus(), 0);
  }, []), ee = f.useCallback(() => m.current, []);
  return f.useEffect(
    () => () => {
      window.clearTimeout(b.current), window.clearTimeout(x.current), window.clearTimeout(v.current);
    },
    []
  ), {
    dropdownOpened: c,
    openDropdown: w,
    closeDropdown: h,
    toggleDropdown: N,
    selectedOptionIndex: m.current,
    getSelectedOptionIndex: ee,
    selectOption: g,
    selectFirstOption: Y,
    selectActiveOption: M,
    selectNextOption: k,
    selectPreviousOption: U,
    resetSelectedOption: J,
    updateSelectedOptionIndex: Q,
    listId: d.current,
    setListId: F,
    clickSelectedOption: oe,
    searchRef: p,
    focusSearchInput: $,
    targetRef: i,
    focusTarget: z
  };
}
const Ao = {
  keepMounted: !0,
  withinPortal: !0,
  resetSelectionOnOptionHover: !1,
  width: "target",
  transitionProps: { transition: "fade", duration: 0 }
}, jo = Z((t, { size: e, dropdownPadding: o }) => ({
  options: {
    "--combobox-option-fz": K(e),
    "--combobox-option-padding": ce(e, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": o === void 0 ? void 0 : G(o),
    "--combobox-option-fz": K(e),
    "--combobox-option-padding": ce(e, "combobox-option-padding")
  }
}));
function P(t) {
  const e = C("Combobox", Ao, t), {
    classNames: o,
    styles: r,
    unstyled: s,
    children: a,
    store: n,
    vars: c,
    onOptionSubmit: l,
    onClose: d,
    size: m,
    dropdownPadding: p,
    resetSelectionOnOptionHover: i,
    __staticSelector: b,
    readOnly: x,
    ...v
  } = e, w = pt(), h = n || w, N = q({
    name: b || "Combobox",
    classes: A,
    props: e,
    classNames: o,
    styles: r,
    unstyled: s,
    vars: c,
    varsResolver: jo
  }), S = () => {
    d?.(), h.closeDropdown();
  };
  return /* @__PURE__ */ u.jsx(
    vo,
    {
      value: {
        getStyles: N,
        store: h,
        onOptionSubmit: l,
        size: m,
        resetSelectionOnOptionHover: i,
        readOnly: x
      },
      children: /* @__PURE__ */ u.jsx(
        X,
        {
          opened: h.dropdownOpened,
          ...v,
          onChange: (g) => !g && S(),
          withRoles: !1,
          unstyled: s,
          children: a
        }
      )
    }
  );
}
const $o = (t) => t;
P.extend = $o;
P.classes = A;
P.displayName = "@mantine/core/Combobox";
P.Target = dt;
P.Dropdown = Se;
P.Options = Ee;
P.Option = _e;
P.Search = ke;
P.Empty = Pe;
P.Chevron = Ce;
P.Footer = Ie;
P.Header = Oe;
P.EventsTarget = lt;
P.DropdownTarget = it;
P.Group = De;
P.ClearButton = at;
P.HiddenInput = ct;
const zo = "var(--workbench-shadow-pop)", Fo = 4500;
function Ue(t, e) {
  return t === "accent" ? "bg-nomi-accent-soft text-nomi-accent" : e === "badge" ? "bg-nomi-ink-10 text-nomi-ink-60" : "text-nomi-ink-40";
}
function Wo({
  value: t,
  options: e,
  onChange: o,
  ariaLabel: r,
  leadingLabel: s,
  placeholder: a,
  triggerBadge: n,
  size: c = "sm",
  triggerMaxWidth: l,
  disabled: d,
  title: m,
  className: p
}) {
  const { t: i } = Lt(), b = pt({ onDropdownClose: () => b.resetSelectedOption() }), v = e.find((h) => h.value === t)?.label ?? a ?? i("common.select"), w = c === "xs" ? "h-6" : "h-7";
  return /* @__PURE__ */ u.jsxs(
    P,
    {
      store: b,
      withinPortal: !0,
      width: "max-content",
      position: "bottom-start",
      offset: 6,
      zIndex: Fo,
      middlewares: { flip: !0, shift: !0 },
      onOptionSubmit: (h) => {
        o(h), b.closeDropdown();
      },
      styles: {
        dropdown: {
          padding: 4,
          maxWidth: 280,
          border: "1px solid var(--nomi-line)",
          borderRadius: "var(--nomi-radius-lg)",
          background: "var(--nomi-paper)",
          boxShadow: zo
        },
        option: {
          padding: "0 8px 0 9px",
          minHeight: 30,
          borderRadius: "var(--nomi-radius-sm)",
          // Mantine Option 是普通块级：minHeight 30 下内容顶在上沿（label/附注/对勾不垂直居中）。
          // 自己 flex 居中；水平布局仍由内层 span 管。
          display: "flex",
          alignItems: "center"
        }
      },
      children: [
        /* @__PURE__ */ u.jsx(P.Target, { children: /* @__PURE__ */ u.jsxs(
          "button",
          {
            type: "button",
            "aria-label": r,
            title: m,
            disabled: d,
            onClick: () => b.toggleDropdown(),
            className: le(
              "inline-flex items-center gap-1 pl-2.5 pr-2 rounded-pill border border-nomi-line bg-nomi-paper",
              "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              "focus:outline-none focus-visible:border-nomi-accent hover:border-nomi-ink-20",
              w,
              p
            ),
            children: [
              s ? /* @__PURE__ */ u.jsx("span", { className: "shrink-0 text-micro leading-none text-nomi-ink-40", children: s }) : null,
              /* @__PURE__ */ u.jsx(
                "span",
                {
                  className: "min-w-0 truncate text-caption text-nomi-ink-80",
                  style: l ? { maxWidth: l } : void 0,
                  children: v
                }
              ),
              n ? /* @__PURE__ */ u.jsx("span", { className: le("shrink-0 text-micro leading-none px-1.5 py-[1px] rounded-pill", Ue(n.tone, "badge")), children: n.text }) : null,
              /* @__PURE__ */ u.jsx(Mt, { size: 12, stroke: 1.6, className: "shrink-0 text-nomi-ink-40 pointer-events-none", "aria-hidden": !0 })
            ]
          }
        ) }),
        /* @__PURE__ */ u.jsx(P.Dropdown, { children: /* @__PURE__ */ u.jsx(P.Options, { className: "max-h-[240px] overflow-auto", children: e.map((h) => {
          const N = h.value === t;
          return /* @__PURE__ */ u.jsx(P.Option, { value: h.value, disabled: h.disabled, active: N, children: /* @__PURE__ */ u.jsxs("span", { className: "flex items-center gap-2 w-full", children: [
            /* @__PURE__ */ u.jsx("span", { className: le("min-w-0 truncate text-caption", N ? "text-nomi-ink font-semibold" : "text-nomi-ink-80"), children: h.label }),
            h.trailing ? (
              // max-w + truncate：trailing 是附注（厂商名/价格），不许反客为主挤压 label
              //（曾被「即梦会员（本地 CLI）」10 字长名挤乱布局）；悬停 title 看全文。
              /* @__PURE__ */ u.jsx(
                "span",
                {
                  title: h.trailing,
                  className: le("ml-auto shrink-0 max-w-[96px] truncate text-micro leading-none px-1.5 py-[1px] rounded-pill", Ue(h.trailingTone, "trailing")),
                  children: h.trailing
                }
              )
            ) : null,
            /* @__PURE__ */ u.jsx("span", { className: le("shrink-0 w-3.5 grid place-items-center", h.trailing ? "" : "ml-auto", N ? "" : "invisible"), "aria-hidden": !0, children: /* @__PURE__ */ u.jsx(Bt, { size: 14, stroke: 1.6, className: "text-nomi-accent", "aria-hidden": !0 }) })
          ] }) }, h.value);
        }) }) })
      ]
    }
  );
}
export {
  P as C,
  B as I,
  Wo as N,
  X as P,
  me as a,
  Je as b,
  A as c,
  pt as u
};
