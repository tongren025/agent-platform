import { aT as Q, e6 as N, S as s, b9 as ge, ba as ye, ac as ve, dM as ke, a_ as je, ci as e, a1 as X, a4 as Z, aL as t, p as ee, a2 as te, w as we, x as K, R as re, l as q, be as Ne, dW as H, a3 as Ce, O as Se, h as Te, s as Pe, f as F, J as Ie } from "./agentStudioMount-S0u8Hm0S.js";
import { u as Ee } from "./index-BQcJHAXh.js";
import { I as ze } from "./IconBulb-DYurfE_u.js";
import { I as Me } from "./IconRefresh-BAIwHoQ5.js";
import { s as J } from "./showUndoToast-DTGno_R0.js";
import { I as se } from "./IconPlayerPlayFilled-DUVpZtpl.js";
import { I as oe } from "./IconVideo-CHle5q9G.js";
import { I as Ue } from "./IconPencil-BOPpIHRl.js";
import { I as De } from "./IconCopy-C59QPh_X.js";
import { I as Ae } from "./IconExternalLink-QH_Ogpjl.js";
const Le = [["path", { d: "M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2", key: "svg-0" }], ["path", { d: "M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", key: "svg-1" }], ["path", { d: "M14 4l0 4l-6 0l0 -4", key: "svg-2" }]], $e = Q("outline", "device-floppy", "DeviceFloppy", Le);
const Oe = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M4 9h8", key: "svg-1" }], ["path", { d: "M12 15h8", key: "svg-2" }], ["path", { d: "M12 4v16", key: "svg-3" }]], Re = Q("outline", "layout-board", "LayoutBoard", Oe);
let M = null;
function _e(a) {
  const { t: r } = N(), [u, i] = s.useState({ items: M ?? [], loading: !1, error: null }), l = s.useCallback(
    (o) => {
      if (!o && M) {
        i({ items: M, loading: !1, error: null });
        return;
      }
      i((m) => ({ ...m, loading: !0, error: null })), ge().then((m) => {
        M = m, i({ items: m, loading: !1, error: m.length ? null : r("runtime.promptLibrary.empty") });
      }).catch((m) => {
        i({
          items: M ?? [],
          loading: !1,
          error: m instanceof Error ? m.message : r("runtime.promptLibrary.loadFailed")
        });
      });
    },
    [r]
  );
  return s.useEffect(() => {
    a && l(!1);
  }, [a, l]), { ...u, reload: () => l(!0) };
}
let U = null;
function Fe(a) {
  const { t: r } = N(), [u, i] = s.useState({ items: U ?? [], loading: !1, error: null }), l = s.useCallback((x) => {
    U = x, i({ items: x, loading: !1, error: null });
  }, []), o = s.useCallback(
    (x) => {
      if (!x && U) {
        i({ items: U, loading: !1, error: null });
        return;
      }
      i((b) => ({ ...b, loading: !0, error: null })), ye().then(l).catch(
        (b) => i({
          items: U ?? [],
          loading: !1,
          error: b instanceof Error ? b.message : r("runtime.promptLibrary.loadFailed")
        })
      );
    },
    [l, r]
  );
  s.useEffect(() => {
    a && o(!1);
  }, [a, o]);
  const m = s.useCallback(async (x) => l(await ve(x)), [l]), v = s.useCallback(
    async (x, b) => l(await ke(x, b)),
    [l]
  ), d = s.useCallback(async (x) => l(await je(x)), [l]);
  return { ...u, reload: () => o(!0), add: m, update: v, remove: d };
}
const Ke = s.memo(function({ prompt: r, onSelect: u }) {
  const { t: i } = N(), [l, o] = s.useState(!1), m = r.mediaType === "video", v = !!r.mediaUrl && !l;
  return /* @__PURE__ */ e.jsxs(X, { children: [
    /* @__PURE__ */ e.jsx(Z, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        onClick: (d) => u(r, d.currentTarget.getBoundingClientRect()),
        className: t(
          "group relative block w-full aspect-[4/3] overflow-hidden text-left cursor-pointer",
          "rounded-nomi border border-nomi-line bg-nomi-ink-05",
          "transition-[transform,box-shadow] duration-[var(--nomi-transition-fast)]",
          "hover:-translate-y-0.5 hover:shadow-nomi-md"
        ),
        children: [
          v ? m ? /* @__PURE__ */ e.jsx(
            "video",
            {
              src: r.mediaUrl,
              muted: !0,
              playsInline: !0,
              preload: "metadata",
              className: t("absolute inset-0 w-full h-full object-cover"),
              onError: () => o(!0)
            }
          ) : /* @__PURE__ */ e.jsx(
            "img",
            {
              src: r.mediaUrl,
              alt: r.title,
              loading: "lazy",
              className: t("absolute inset-0 w-full h-full object-cover"),
              onError: () => o(!0)
            }
          ) : /* @__PURE__ */ e.jsx("div", { className: t("absolute inset-0 grid place-items-center text-nomi-ink-30"), children: m ? /* @__PURE__ */ e.jsx(oe, { size: 30, stroke: 1.4 }) : /* @__PURE__ */ e.jsx(ee, { size: 30, stroke: 1.4 }) }),
          /* @__PURE__ */ e.jsxs(
            "span",
            {
              className: t(
                "absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-px rounded-full text-micro leading-none",
                "bg-nomi-overlay-chip text-nomi-paper backdrop-blur-sm"
              ),
              children: [
                m ? /* @__PURE__ */ e.jsx(se, { size: 9 }) : null,
                i(m ? "libraries.prompt.card.video" : "libraries.prompt.card.image")
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "span",
            {
              className: t(
                "absolute left-0 right-0 bottom-0 px-2 pt-3 pb-1.5",
                "bg-gradient-to-t from-nomi-media-veil to-transparent"
              ),
              children: [
                /* @__PURE__ */ e.jsx("span", { className: t("block text-caption text-nomi-paper font-medium truncate"), children: r.title }),
                /* @__PURE__ */ e.jsx("span", { className: t("block text-micro text-nomi-paper/70 truncate"), children: r.source })
              ]
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ e.jsx(te, { side: "top", className: "max-w-56 whitespace-normal leading-snug", children: r.title })
  ] });
}), Be = s.memo(function({
  prompt: r,
  onSelect: u,
  onEdit: i,
  onDelete: l
}) {
  const { t: o } = N(), m = r.promptType === "video", v = r.title === "未命名提示词" || r.title === "Untitled prompt" || r.title === o("libraries.prompt.card.unnamed");
  return /* @__PURE__ */ e.jsxs(X, { children: [
    /* @__PURE__ */ e.jsx(Z, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: t(
          "group relative flex flex-col w-full aspect-[4/3] overflow-hidden text-left cursor-pointer",
          "rounded-nomi border border-nomi-accent/40 bg-nomi-paper p-2.5",
          "transition-[transform,box-shadow] duration-[var(--nomi-transition-fast)] hover:-translate-y-0.5 hover:shadow-nomi-md"
        ),
        role: "button",
        tabIndex: 0,
        onClick: (d) => u(r, d.currentTarget.getBoundingClientRect()),
        onKeyDown: (d) => {
          (d.key === "Enter" || d.key === " ") && (d.preventDefault(), u(r, d.currentTarget.getBoundingClientRect()));
        },
        children: [
          /* @__PURE__ */ e.jsxs("div", { className: t("flex items-center gap-1 mb-1.5"), children: [
            /* @__PURE__ */ e.jsx(
              "span",
              {
                className: t(
                  "inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-micro leading-none",
                  "bg-nomi-accent/10 text-nomi-accent"
                ),
                children: o("libraries.prompt.card.mine")
              }
            ),
            /* @__PURE__ */ e.jsxs("span", { className: t("inline-flex items-center gap-0.5 text-micro text-nomi-ink-40"), children: [
              m ? /* @__PURE__ */ e.jsx(se, { size: 8 }) : null,
              o(m ? "libraries.prompt.card.video" : "libraries.prompt.card.image")
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: t("flex-1 min-h-0 overflow-hidden text-caption leading-relaxed text-nomi-ink-80"), children: r.prompt }),
          r.title && !v ? /* @__PURE__ */ e.jsx("span", { className: t("block mt-1.5 text-micro text-nomi-ink-40 truncate"), children: r.title }) : null,
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              className: t("absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"),
              children: [
                /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": o("libraries.prompt.card.edit"),
                    className: t(
                      "w-6 h-6 grid place-items-center rounded-nomi-sm cursor-pointer border-0",
                      "bg-nomi-paper/90 text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05 shadow-nomi-sm"
                    ),
                    onClick: (d) => {
                      d.stopPropagation(), i(r);
                    },
                    children: /* @__PURE__ */ e.jsx(Ue, { size: 13, stroke: 1.7 })
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": o("libraries.prompt.card.delete"),
                    className: t(
                      "w-6 h-6 grid place-items-center rounded-nomi-sm cursor-pointer border-0",
                      "bg-nomi-paper/90 text-nomi-ink-60 hover:text-nomi-danger hover:bg-nomi-ink-05 shadow-nomi-sm"
                    ),
                    onClick: (d) => {
                      d.stopPropagation(), l(r);
                    },
                    children: /* @__PURE__ */ e.jsx(we, { size: 13, stroke: 1.7 })
                  }
                )
              ]
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ e.jsx(te, { side: "top", className: "max-w-56 whitespace-normal leading-snug", children: r.title })
  ] });
}), We = ["image", "video"];
function Ve({ initial: a, onSubmit: r, onCancel: u }) {
  const { t: i } = N(), [l, o] = s.useState(a?.title ?? ""), [m, v] = s.useState(a?.prompt ?? ""), [d, x] = s.useState(a?.promptType ?? "image"), [b, S] = s.useState(!1), [y, j] = s.useState(null), f = s.useRef(null);
  s.useEffect(() => {
    f.current?.focus();
  }, []);
  const k = async () => {
    const p = m.trim();
    if (!p) {
      j(i("libraries.prompt.composer.required")), f.current?.focus();
      return;
    }
    S(!0), j(null);
    try {
      await r({ title: l.trim() || void 0, prompt: p, promptType: d });
    } catch (c) {
      j(c instanceof Error ? c.message : i("libraries.prompt.composer.saveFailed")), S(!1);
    }
  }, T = t(
    "w-full bg-nomi-paper border border-nomi-line rounded-nomi px-3 py-2 text-body-sm text-nomi-ink",
    "placeholder:text-nomi-ink-40 focus:outline-none focus:border-nomi-accent"
  );
  return /* @__PURE__ */ e.jsxs("div", { className: t("mb-3 p-3.5 rounded-nomi-lg border border-nomi-line bg-nomi-ink-02"), children: [
    /* @__PURE__ */ e.jsxs("div", { className: t("flex items-center gap-2 mb-2.5"), children: [
      /* @__PURE__ */ e.jsx("b", { className: t("text-caption font-semibold text-nomi-ink"), children: i(a ? "libraries.prompt.composer.edit" : "libraries.prompt.composer.create") }),
      /* @__PURE__ */ e.jsx("span", { className: t("flex-1") }),
      /* @__PURE__ */ e.jsx(
        "div",
        {
          className: t("inline-flex bg-nomi-ink-05 rounded-full p-0.5"),
          role: "tablist",
          "aria-label": i("libraries.prompt.composer.typeAria"),
          children: We.map((p) => {
            const c = d === p;
            return /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": c,
                className: t(
                  "px-3 py-0.5 rounded-full text-caption cursor-pointer border-0 bg-transparent",
                  c ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "text-nomi-ink-60 hover:text-nomi-ink"
                ),
                onClick: () => x(p),
                children: i(`libraries.prompt.category.${p}`)
              },
              p
            );
          })
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      "input",
      {
        className: t(T, "mb-2"),
        placeholder: i("libraries.prompt.composer.titlePlaceholder"),
        value: l,
        maxLength: 60,
        onChange: (p) => o(p.target.value)
      }
    ),
    /* @__PURE__ */ e.jsx(
      "textarea",
      {
        ref: f,
        className: t(T, "resize-none h-24 leading-relaxed"),
        placeholder: i("libraries.prompt.composer.promptPlaceholder"),
        value: m,
        onChange: (p) => v(p.target.value),
        onKeyDown: (p) => {
          (p.metaKey || p.ctrlKey) && p.key === "Enter" && k();
        }
      }
    ),
    /* @__PURE__ */ e.jsxs("div", { className: t("flex flex-wrap items-center gap-2 mt-2.5"), children: [
      y ? /* @__PURE__ */ e.jsx("span", { className: t("min-w-0 flex-1 text-micro text-nomi-danger"), children: y }) : null,
      /* @__PURE__ */ e.jsx("span", { className: t("min-w-4 flex-1") }),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: u,
          className: t(
            "inline-flex items-center gap-1 h-8 px-3 rounded-full cursor-pointer border-0 bg-transparent text-caption text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05"
          ),
          children: [
            /* @__PURE__ */ e.jsx(K, { size: 14, stroke: 1.8 }),
            i("libraries.prompt.composer.cancel")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            k();
          },
          disabled: b,
          className: t(
            "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full cursor-pointer border-0",
            "bg-nomi-accent text-nomi-paper text-caption font-medium hover:opacity-90 disabled:opacity-50"
          ),
          children: [
            /* @__PURE__ */ e.jsx($e, { size: 14, stroke: 1.8 }),
            i(a ? "libraries.prompt.composer.save" : "libraries.prompt.composer.saveToMine")
          ]
        }
      )
    ] })
  ] });
}
const D = "cubic-bezier(.2, .7, .3, 1)", I = 260;
function Ye({ prompt: a, originRect: r, onClose: u, onSendToCanvas: i }) {
  const { t: l } = N(), o = s.useRef(null), [m, v] = s.useState(!1), [d, x] = s.useState(!1), [b, S] = s.useState(!1), y = a.mediaType === "video", j = !!a.mediaUrl, f = s.useCallback(
    (c) => {
      const g = c.getBoundingClientRect(), E = r.width / g.width, R = r.left - g.left, A = r.top - g.top;
      return `translate(${R}px, ${A}px) scale(${E})`;
    },
    [r]
  );
  s.useLayoutEffect(() => {
    const c = o.current;
    if (!c) return;
    c.style.transformOrigin = "0 0", c.style.transform = f(c), c.style.opacity = "0.4";
    const g = requestAnimationFrame(() => {
      c.style.transition = `transform ${I}ms ${D}, opacity ${I}ms ${D}`, c.style.transform = "translate(0, 0) scale(1)", c.style.opacity = "1";
    });
    return () => cancelAnimationFrame(g);
  }, [f]);
  const k = s.useCallback(() => {
    const c = o.current;
    if (!c || m) {
      u();
      return;
    }
    v(!0), c.style.transition = `transform ${I}ms ${D}, opacity ${I}ms ${D}`, c.style.transform = f(c), c.style.opacity = "0", window.setTimeout(u, I);
  }, [m, f, u]);
  s.useEffect(() => {
    const c = (g) => {
      g.key === "Escape" && k();
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [k]);
  const T = () => {
    i(a), x(!0), window.setTimeout(k, 950);
  }, p = () => {
    navigator.clipboard?.writeText(a.prompt).catch(() => {
    }), S(!0);
  };
  return /* @__PURE__ */ e.jsx(re, { children: /* @__PURE__ */ e.jsxs(
    "div",
    {
      role: "dialog",
      "aria-label": a.title,
      className: t("fixed inset-0 grid place-items-center p-6"),
      style: { zIndex: 4200, background: "var(--nomi-scrim)", animation: `nomi-fade ${I}ms ${D}` },
      onMouseDown: (c) => {
        c.target === c.currentTarget && k();
      },
      children: [
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            ref: o,
            className: t(
              "w-[560px] max-w-full max-h-[88vh] flex flex-col overflow-hidden",
              "bg-nomi-paper border border-nomi-line rounded-nomi-lg shadow-nomi-lg"
            ),
            children: [
              /* @__PURE__ */ e.jsxs("div", { className: t("relative w-full bg-nomi-ink-05"), style: { aspectRatio: "16 / 9" }, children: [
                j ? y ? /* @__PURE__ */ e.jsx(
                  "video",
                  {
                    src: a.mediaUrl,
                    controls: !0,
                    autoPlay: !0,
                    muted: !0,
                    loop: !0,
                    playsInline: !0,
                    className: t("absolute inset-0 w-full h-full object-cover")
                  }
                ) : /* @__PURE__ */ e.jsx(
                  "img",
                  {
                    src: a.mediaUrl,
                    alt: a.title,
                    className: t("absolute inset-0 w-full h-full object-cover")
                  }
                ) : /* @__PURE__ */ e.jsxs("div", { className: t("absolute inset-0 grid place-items-center gap-1 text-nomi-ink-30"), children: [
                  y ? /* @__PURE__ */ e.jsx(oe, { size: 40, stroke: 1.3 }) : /* @__PURE__ */ e.jsx(ee, { size: 40, stroke: 1.3 }),
                  /* @__PURE__ */ e.jsx("span", { className: t("text-caption text-nomi-ink-40"), children: l("libraries.prompt.preview.noCover") })
                ] }),
                /* @__PURE__ */ e.jsxs(
                  "span",
                  {
                    className: t(
                      "absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-micro",
                      "bg-nomi-overlay-chip text-nomi-paper backdrop-blur-sm"
                    ),
                    children: [
                      l(y ? "libraries.prompt.category.video" : "libraries.prompt.category.image"),
                      " · ",
                      a.source
                    ]
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": l("libraries.prompt.preview.close"),
                    onClick: k,
                    className: t(
                      "absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full cursor-pointer border-0",
                      "bg-nomi-overlay-chip text-nomi-paper hover:bg-nomi-overlay-chip-strong"
                    ),
                    children: /* @__PURE__ */ e.jsx(K, { size: 16, stroke: 2 })
                  }
                )
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: t("flex-1 min-h-0 overflow-y-auto px-4 pt-3.5 pb-4"), children: [
                /* @__PURE__ */ e.jsx("div", { className: t("text-title font-semibold text-nomi-ink mb-2"), children: a.title }),
                /* @__PURE__ */ e.jsx("p", { className: t("text-body-sm leading-relaxed text-nomi-ink-80 whitespace-pre-wrap"), children: a.prompt })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: t("flex items-center gap-2 px-4 py-3 border-t border-nomi-line"), children: [
                /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: T,
                    className: t(
                      "inline-flex items-center gap-1.5 h-9 px-4 rounded-full cursor-pointer border-0",
                      "bg-nomi-ink text-nomi-paper text-body-sm font-semibold hover:bg-nomi-accent",
                      "transition-[background] duration-[var(--nomi-transition-fast)]"
                    ),
                    children: [
                      d ? /* @__PURE__ */ e.jsx(q, { size: 16, stroke: 2 }) : /* @__PURE__ */ e.jsx(Re, { size: 16, stroke: 1.8 }),
                      l(d ? "libraries.prompt.preview.sent" : "libraries.prompt.preview.send")
                    ]
                  }
                ),
                /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: p,
                    "aria-label": l("libraries.prompt.preview.copyAria"),
                    className: t(
                      "inline-flex items-center gap-1.5 h-9 px-3 rounded-full cursor-pointer",
                      "border border-nomi-line bg-transparent text-nomi-ink-80 text-body-sm hover:bg-nomi-ink-05"
                    ),
                    children: [
                      b ? /* @__PURE__ */ e.jsx(q, { size: 15, stroke: 2 }) : /* @__PURE__ */ e.jsx(De, { size: 15, stroke: 1.8 }),
                      l(b ? "libraries.prompt.preview.copied" : "libraries.prompt.preview.copy")
                    ]
                  }
                ),
                /* @__PURE__ */ e.jsx("span", { className: t("flex-1") }),
                a.sourceUrl ? /* @__PURE__ */ e.jsxs(
                  "a",
                  {
                    href: a.sourceUrl,
                    target: "_blank",
                    rel: "noreferrer",
                    className: t("inline-flex items-center gap-1 text-caption text-nomi-ink-40 hover:text-nomi-ink"),
                    children: [
                      /* @__PURE__ */ e.jsx(Ae, { size: 13, stroke: 1.7 }),
                      l("libraries.prompt.preview.source")
                    ]
                  }
                ) : /* @__PURE__ */ e.jsx("span", { className: t("inline-flex items-center gap-1 text-caption text-nomi-ink-40"), children: l("libraries.prompt.preview.localOnly") })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ e.jsx("style", { children: "@keyframes nomi-fade { from { opacity: 0 } to { opacity: 1 } }" })
      ]
    }
  ) });
}
const O = 12, Ge = 200, qe = 180, He = 3 / 4, Je = [
  { value: "mine", labelKey: "libraries.prompt.source.mine" },
  { value: "nomi", labelKey: "libraries.prompt.source.nomi" }
], Qe = [
  { value: "all", labelKey: "libraries.prompt.category.all" },
  { value: "image", labelKey: "libraries.prompt.category.image" },
  { value: "video", labelKey: "libraries.prompt.category.video" }
];
function Xe({
  active: a,
  compact: r = !1,
  showHeader: u = !0,
  onClose: i,
  className: l
}) {
  const { t: o } = N(), [m, v] = s.useState("nomi"), [d, x] = s.useState("all"), [b, S] = s.useState(""), [y, j] = s.useState(null), [f, k] = s.useState(null), [T, p] = s.useState(!1), [c, g] = s.useState(null), { items: E, loading: R, error: A, reload: ne } = _e(a), C = Fe(a), L = m === "mine", _ = L ? C.items : E, z = s.useMemo(() => Ne(_, d, b), [_, d, b]), [ie, ae] = s.useState(0);
  s.useEffect(() => {
    if (!f) return;
    const n = new ResizeObserver((h) => {
      const P = h[0]?.contentRect.width;
      P && ae(P);
    });
    return n.observe(f), () => n.disconnect();
  }, [f]);
  const B = ie || (r ? 416 : 920), le = r ? qe : Ge, w = Math.max(r ? 1 : 2, Math.min(r ? 2 : 5, Math.floor((B + O) / (le + O)))), W = (B - (w - 1) * O) / w * He + O, ce = Math.ceil(z.length / w), $ = Ee({
    count: ce,
    getScrollElement: () => f,
    estimateSize: () => W,
    overscan: 3
  });
  s.useEffect(() => {
    $.measure();
  }, [$, W, w]), s.useEffect(() => {
    if (!a || !i) return;
    const n = (h) => {
      h.key === "Escape" && !y && i();
    };
    return window.addEventListener("keydown", n), () => window.removeEventListener("keydown", n);
  }, [a, i, y]);
  const me = s.useCallback((n) => {
    v(n), n !== "mine" && (p(!1), g(null));
  }, []), V = s.useCallback((n, h) => {
    j({ prompt: n, rect: h });
  }, []), de = s.useCallback((n) => {
    const P = H.getState().addNode({
      kind: n.promptType === "video" ? "video" : "image",
      prompt: n.prompt,
      select: !0
    });
    J({
      message: o("libraries.prompt.sentToCanvas", { kind: n.promptType === "video" ? o("libraries.prompt.category.video") : o("libraries.prompt.storyboard") }),
      onUndo: () => H.getState().deleteNode(P.id)
    });
  }, [o]), pe = s.useCallback(() => {
    g(null), p(!0);
  }, []), ue = s.useCallback((n) => {
    p(!1), g(n);
  }, []), xe = s.useCallback((n) => {
    C.remove(n.id), J({
      message: o("libraries.prompt.removedFromMine", { title: n.title }),
      onUndo: () => {
        C.add({ title: n.title, prompt: n.prompt, promptType: n.promptType });
      }
    });
  }, [C, o]), Y = L && (T || c !== null), be = L && !Y, he = /* @__PURE__ */ e.jsx(
    "div",
    {
      className: t("inline-flex bg-nomi-ink-05 rounded-full p-0.5", r ? "w-full" : "shrink-0"),
      role: "tablist",
      "aria-label": o("libraries.prompt.sourceAria"),
      children: Je.map((n) => {
        const h = m === n.value;
        return /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": h,
            className: t(
              "rounded-full text-caption cursor-pointer border-0 bg-transparent whitespace-nowrap",
              "transition-[background,color] duration-[var(--nomi-transition-fast)]",
              r ? "min-w-0 flex-1 px-2 py-1" : "px-3 py-1",
              h ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "text-nomi-ink-60 hover:text-nomi-ink"
            ),
            onClick: () => me(n.value),
            children: o(n.labelKey)
          },
          n.value
        );
      })
    }
  ), fe = /* @__PURE__ */ e.jsx(
    "div",
    {
      className: t("inline-flex bg-nomi-ink-05 rounded-full p-0.5", r ? "w-full" : "shrink-0"),
      role: "tablist",
      "aria-label": o("libraries.prompt.categoryAria"),
      children: Qe.map((n) => {
        const h = d === n.value;
        return /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": h,
            className: t(
              "rounded-full text-caption cursor-pointer border-0 bg-transparent whitespace-nowrap",
              "transition-[background,color] duration-[var(--nomi-transition-fast)]",
              r ? "min-w-0 flex-1 px-2 py-1" : "px-3 py-1",
              h ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "text-nomi-ink-60 hover:text-nomi-ink"
            ),
            onClick: () => x(n.value),
            children: o(n.labelKey)
          },
          n.value
        );
      })
    }
  );
  return /* @__PURE__ */ e.jsx(Ce, { delayDuration: 180, skipDelayDuration: 80, children: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs("div", { className: t("flex min-h-0 flex-1 flex-col overflow-hidden", l), children: [
      u ? /* @__PURE__ */ e.jsxs("div", { className: t("flex items-center gap-2 px-5 pt-4 pb-3 border-b border-nomi-line"), children: [
        /* @__PURE__ */ e.jsx(ze, { size: 18, stroke: 1.6, className: t("text-nomi-accent") }),
        /* @__PURE__ */ e.jsx("b", { className: t("text-title font-bold text-nomi-ink"), children: o("libraries.prompt.title") }),
        /* @__PURE__ */ e.jsx(Se, { fontSize: 13, className: t("text-nomi-ink-40") }),
        /* @__PURE__ */ e.jsxs("span", { className: t("text-caption text-nomi-ink-40"), children: [
          "· ",
          _.length
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: t("flex-1") }),
        i ? /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: t("w-7 h-7 grid place-items-center rounded-nomi-sm cursor-pointer border-0 bg-transparent", "text-nomi-ink-40 hover:text-nomi-ink hover:bg-nomi-ink-05"),
            "aria-label": o("libraries.prompt.closeAria"),
            onClick: i,
            children: /* @__PURE__ */ e.jsx(K, { size: 16, stroke: 2 })
          }
        ) : null
      ] }) : null,
      /* @__PURE__ */ e.jsxs("div", { className: t("flex gap-2", r ? "flex-col px-3 py-3" : "items-center px-5 py-2.5"), children: [
        he,
        fe,
        /* @__PURE__ */ e.jsx(
          Te,
          {
            className: r ? "w-full" : "flex-1",
            placeholder: o("libraries.prompt.searchPlaceholder"),
            ariaLabel: o("libraries.prompt.searchAria"),
            value: b,
            onChange: S
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { ref: k, className: t("flex-1 overflow-y-auto", r ? "px-3 pb-3" : "px-5 pb-5"), children: [
        Y ? /* @__PURE__ */ e.jsx(
          Ve,
          {
            initial: c,
            onSubmit: async (n) => {
              c ? await C.update(c.id, n) : await C.add(n), p(!1), g(null);
            },
            onCancel: () => {
              p(!1), g(null);
            }
          }
        ) : null,
        L ? /* @__PURE__ */ e.jsxs("div", { className: t("grid gap-3"), style: { gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` }, children: [
          be ? /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: pe,
              className: t("flex flex-col items-center justify-center gap-1.5 w-full aspect-[4/3] cursor-pointer", "rounded-nomi border border-dashed border-nomi-line bg-transparent text-nomi-ink-40", "hover:border-nomi-accent hover:text-nomi-accent transition-colors"),
              children: [
                /* @__PURE__ */ e.jsx(Pe, { size: 22, stroke: 1.6 }),
                /* @__PURE__ */ e.jsx("span", { className: t("text-caption"), children: o("libraries.prompt.create") })
              ]
            }
          ) : null,
          z.map((n) => /* @__PURE__ */ e.jsx(Be, { prompt: n, onSelect: V, onEdit: ue, onDelete: xe }, n.id)),
          !z.length && !C.loading && (b || d !== "all") ? /* @__PURE__ */ e.jsx("div", { className: t("col-span-full py-10"), children: /* @__PURE__ */ e.jsx(F, { title: o("libraries.prompt.noMatch"), description: o("libraries.prompt.tryAnotherFilter") }) }) : null
        ] }) : R && !E.length ? /* @__PURE__ */ e.jsxs("div", { className: t("flex flex-col items-center justify-center gap-3 py-20 text-nomi-ink-40"), children: [
          /* @__PURE__ */ e.jsx(Ie, { size: 28 }),
          /* @__PURE__ */ e.jsx("span", { className: t("text-caption"), children: o("libraries.prompt.fetching") })
        ] }) : A && !E.length ? /* @__PURE__ */ e.jsx(
          F,
          {
            title: o("libraries.prompt.fetchFailed"),
            description: A,
            action: /* @__PURE__ */ e.jsxs("button", { type: "button", onClick: ne, className: t("inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full cursor-pointer", "border border-nomi-line bg-transparent text-nomi-ink-80 text-caption hover:bg-nomi-ink-05"), children: [
              /* @__PURE__ */ e.jsx(Me, { size: 14, stroke: 1.8 }),
              o("common.retry")
            ] })
          }
        ) : z.length ? /* @__PURE__ */ e.jsx("div", { style: { height: $.getTotalSize(), width: "100%", position: "relative" }, children: $.getVirtualItems().map((n) => {
          const h = n.index * w, P = z.slice(h, h + w);
          return /* @__PURE__ */ e.jsx(
            "div",
            {
              "data-index": n.index,
              className: t("grid gap-3 pb-3"),
              style: { position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${n.start}px)`, gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))` },
              children: P.map((G) => /* @__PURE__ */ e.jsx(Ke, { prompt: G, onSelect: V }, G.id))
            },
            n.key
          );
        }) }) : /* @__PURE__ */ e.jsx(F, { title: o("libraries.prompt.noMatch"), description: o("libraries.prompt.tryAnotherFilter") })
      ] })
    ] }),
    y ? /* @__PURE__ */ e.jsx(
      Ye,
      {
        prompt: y.prompt,
        originRect: y.rect,
        onClose: () => j(null),
        onSendToCanvas: de
      }
    ) : null
  ] }) });
}
function pt({ opened: a, onClose: r }) {
  const { t: u } = N();
  return a ? /* @__PURE__ */ e.jsx(re, { children: /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: t("fixed inset-0 grid place-items-center p-6"),
      style: { zIndex: 4e3, background: "var(--nomi-scrim)", animation: "nomi-fade 140ms cubic-bezier(.2,.7,.3,1)" },
      onMouseDown: (i) => {
        i.target === i.currentTarget && r();
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "div",
          {
            role: "dialog",
            "aria-label": u("libraries.prompt.title"),
            className: t("w-[960px] max-w-full h-[86vh] flex flex-col overflow-hidden", "bg-nomi-paper border border-nomi-line rounded-nomi-lg shadow-nomi-lg"),
            style: { animation: "nomi-panel-pop 160ms cubic-bezier(.2,.7,.3,1)" },
            children: /* @__PURE__ */ e.jsx(Xe, { active: a, onClose: r })
          }
        ),
        /* @__PURE__ */ e.jsx("style", { children: `
          @keyframes nomi-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes nomi-panel-pop { from { opacity: 0; transform: translateY(-6px) scale(0.99) } to { opacity: 1; transform: translateY(0) scale(1) } }
        ` })
      ]
    }
  ) }) : null;
}
export {
  Xe as PromptLibraryContent,
  pt as PromptLibraryPanel
};
