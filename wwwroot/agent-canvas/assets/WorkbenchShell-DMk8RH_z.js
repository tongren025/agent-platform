import { aT as fe, e6 as K, S as a, dW as G, dX as xt, cU as ge, c5 as bt, cV as ft, cr as gt, ef as kt, cq as Me, c6 as vt, ci as t, aL as u, l as ie, bz as yt, d$ as wt, b as jt, K as Nt, O as Ct, a0 as St, J as Ve, a8 as O, I as qe, bT as Xe, z as Je, M as _t, L as It, k as Ye, r as Et, e7 as z, a3 as Mt, a1 as ae, a4 as ce, a2 as le, s as Pt, cj as ne, e0 as re, dg as _e, cb as At, bd as Tt, cw as Lt, dJ as zt, u as Qe, ax as Ze, cc as Bt, bg as Dt, ad as Pe, bi as Ae, o as et, cN as Te, x as Rt, q as $t, t as Wt, p as Ot, cg as Gt, a7 as Ft } from "./agentStudioMount-S0u8Hm0S.js";
import { I as Kt } from "./IconDownload-aYER3sCG.js";
import { I as Ie, a as he } from "./IconChevronRight-CuoN5Ibj.js";
import { I as Ut } from "./IconListCheck-CkvC06WG.js";
import { I as tt } from "./IconMap-di2AyFxj.js";
import { u as Ht } from "./journeyTourActivity-B2spbIJh.js";
import { D as nt, d as xe, r as je } from "./guidedProductionEvents-OaDLZ3B-.js";
import { I as Ne, a as Le } from "./IconStack2-BhHFtQtm.js";
import { I as Vt } from "./IconBooks-Bylx1Es5.js";
import { I as qt } from "./IconBulb-DYurfE_u.js";
import { b as Xt, I as Jt, a as Yt } from "./IconFolder-DxBa8qm3.js";
import { I as ot } from "./IconLayoutSidebarLeftExpand-BF80BBbY.js";
import { I as Ce } from "./IconArrowRight-d4jEq4ds.js";
import { g as ue } from "./generationCanvasTools-dGOKmCYM.js";
import { a as Qt, r as ze } from "./batchPlanPreview-BKmkPTzs.js";
import { I as Zt } from "./IconArrowLeft-CnZLZTCp.js";
import { u as Q, d as Se, p as en } from "./productionDirectorUiStore-DHA8oTcQ.js";
const tn = [["path", { d: "M15 6l-6 6l6 6", key: "svg-0" }]], nn = fe("outline", "chevron-left", "ChevronLeft", tn);
const on = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], Be = fe("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", on);
const rn = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], sn = fe("outline", "tags", "Tags", rn);
const an = [["path", { d: "M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5", key: "svg-0" }]], cn = fe("outline", "tool", "Tool", an), Y = ["model", "storyboard", "generated", "exported"];
function rt() {
  const { t: e } = K(), n = a.useMemo(
    () => [
      { key: "model", label: e("onboarding.steps.model.label"), hint: e("onboarding.steps.model.hint") },
      { key: "storyboard", label: e("onboarding.steps.storyboard.label"), hint: e("onboarding.steps.storyboard.hint") },
      { key: "generated", label: e("onboarding.steps.generated.label"), hint: e("onboarding.steps.generated.hint") },
      { key: "exported", label: e("onboarding.steps.exported.label"), hint: e("onboarding.steps.exported.hint") }
    ],
    [e]
  ), o = G((b) => b.nodes), { hasTextModel: c } = xt(), x = Ht(), p = a.useMemo(
    () => ({
      model: c === !0,
      storyboard: o.length > 0,
      generated: o.some((b) => b.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [c, o]
  ), [k, i] = a.useState(() => ge()), [w, N] = a.useState(() => bt()), [g, S] = a.useState(() => !ft()), P = a.useRef(null), [C, _] = a.useState(null);
  a.useEffect(() => {
    let b = !1;
    for (const y of Y)
      p[y] && !k[y] && (gt(y), b = !0);
    b && i(ge());
  }, [p, k]), a.useEffect(() => {
    const b = () => i(ge());
    return window.addEventListener("storage", b), window.addEventListener("focus", b), () => {
      window.removeEventListener("storage", b), window.removeEventListener("focus", b);
    };
  }, []);
  const v = a.useMemo(
    () => ({
      model: k.model || p.model,
      storyboard: k.storyboard || p.storyboard,
      generated: k.generated || p.generated,
      exported: k.exported || p.exported
    }),
    [k, p]
  ), r = Y.filter((b) => v[b]).length, m = r === Y.length, j = n.find((b) => !v[b.key])?.key ?? null, d = a.useCallback(() => {
    const b = P.current;
    if (!b) return;
    const y = b.getBoundingClientRect();
    _({ top: y.bottom + 8, right: Math.max(8, window.innerWidth - y.right) });
  }, []);
  a.useEffect(() => {
    if (g)
      return d(), window.addEventListener("resize", d), () => window.removeEventListener("resize", d);
  }, [g, d]), a.useEffect(() => {
    if (!g) return;
    const b = (y) => {
      const f = y.target;
      f && f.closest("[data-onboarding-checklist-root]") || S(!1);
    };
    return window.addEventListener("pointerdown", b, !0), () => window.removeEventListener("pointerdown", b, !0);
  }, [g]);
  const I = a.useCallback(() => {
    S((b) => {
      const y = !b;
      return kt(!y), y;
    });
  }, []), E = a.useCallback(() => {
    Me(), N(!0);
  }, []);
  return a.useEffect(() => {
    w || m || vt(Date.now()) && (Me(), N(!0));
  }, [w, m]), m || x || w ? null : /* @__PURE__ */ t.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ t.jsxs(
      "button",
      {
        type: "button",
        ref: P,
        onClick: I,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": e("onboarding.progressLabel", { done: r, total: Y.length }),
        "aria-expanded": g,
        className: u(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          g && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ t.jsx(Ut, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ t.jsx("span", { className: "max-[700px]:hidden", children: e("onboarding.trigger") }),
          /* @__PURE__ */ t.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            r,
            "/",
            Y.length
          ] })
        ]
      }
    ),
    g && C ? /* @__PURE__ */ t.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": e("onboarding.panelLabel"),
        style: { top: C.top, right: C.right },
        className: u(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: e("onboarding.panelLabel") }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              r,
              " / ",
              Y.length
            ] }),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: () => I(),
                "aria-label": e("onboarding.collapse"),
                className: u(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ t.jsx(Ie, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(nt, { value: r / Y.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ t.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((b) => {
            const y = v[b.key], f = !y && b.key === j;
            return /* @__PURE__ */ t.jsx(
              "li",
              {
                "data-step": b.key,
                "data-done": y ? "true" : "false",
                className: u("flex flex-col gap-1.5 p-2 rounded-nomi-sm", f && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ t.jsx(
                    "span",
                    {
                      className: u(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        y ? "bg-nomi-accent text-nomi-paper" : f ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: y ? /* @__PURE__ */ t.jsx(ie, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ t.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ t.jsx(
                      "span",
                      {
                        className: u(
                          "block text-body-sm font-medium leading-snug",
                          y ? "text-nomi-ink-40" : f ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: b.label
                      }
                    ),
                    y ? null : /* @__PURE__ */ t.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: b.hint })
                  ] })
                ] })
              },
              b.key
            );
          }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between border-t border-nomi-line-soft px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), S(!1);
                },
                className: u(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ t.jsx(tt, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  e("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: E,
                className: u(
                  "rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-ink-40 transition-colors hover:text-nomi-ink"
                ),
                children: e("onboarding.dismiss")
              }
            )
          ] })
        ]
      }
    ) : null
  ] });
}
const ln = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, Z = ln;
function dn(e, n) {
  switch (n.type) {
    case "checking":
      return { ...Z, phase: "checking" };
    case "up-to-date":
      return { ...Z, phase: "up-to-date" };
    case "available":
      return { ...Z, phase: "available", latestVersion: n.version, notes: n.notes };
    case "progress":
      return { ...e, phase: "downloading", percent: n.percent };
    case "downloaded":
      return { ...e, phase: "downloaded", latestVersion: n.version || e.latestVersion };
    case "error":
      return { ...e, phase: "error", errorMessage: n.message };
    default:
      return e;
  }
}
function mn() {
  const n = yt()?.update, o = !!n, [c, x] = a.useState(null), [p, k] = a.useState(Z);
  a.useEffect(() => {
    let C = !0;
    n?.appInfo().then((v) => {
      C && x(v);
    }).catch(() => {
    });
    const _ = n?.onEvent((v) => k((r) => dn(r, v)));
    return () => {
      C = !1, _?.();
    };
  }, [n]), a.useEffect(() => {
    if (p.phase !== "up-to-date") return;
    const C = window.setTimeout(() => k(Z), 2500);
    return () => window.clearTimeout(C);
  }, [p.phase]);
  const i = a.useCallback(() => {
    k({ ...Z, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), w = a.useCallback(() => {
    k((C) => ({ ...C, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), N = a.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), g = a.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), S = a.useCallback(() => k(Z), []), P = c?.canAutoInstall ?? !0;
  return {
    phase: p.phase,
    appInfo: c,
    latestVersion: p.latestVersion,
    notes: p.notes,
    percent: p.percent,
    errorMessage: p.errorMessage,
    supported: o,
    canAutoInstall: P,
    check: i,
    download: w,
    install: N,
    openRelease: g,
    reset: S
  };
}
const pn = 360, De = 12;
function un(e) {
  return e ? `${e.platform === "win32" ? "Windows" : e.platform === "darwin" ? "macOS" : e.platform} · ${e.arch}` : "";
}
function st({ anchorEl: e, onClose: n }) {
  const { t: o } = K(), c = mn(), { isDark: x } = wt(), [p, k] = a.useState(null);
  return a.useLayoutEffect(() => {
    if (!e) return;
    const i = () => {
      const w = e.getBoundingClientRect(), N = Math.min(w.left, window.innerWidth - pn - De), g = w.bottom + 8;
      k({ top: g, left: Math.max(De, N) });
    };
    return i(), window.addEventListener("resize", i), window.addEventListener("scroll", i, !0), () => {
      window.removeEventListener("resize", i), window.removeEventListener("scroll", i, !0);
    };
  }, [e]), a.useEffect(() => {
    const i = (w) => {
      w.key === "Escape" && n();
    };
    return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
  }, [n]), /* @__PURE__ */ t.jsxs(jt, { children: [
    /* @__PURE__ */ t.jsx(
      "div",
      {
        className: "fixed inset-0 z-[600]",
        onMouseDown: n,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ t.jsxs(
      "div",
      {
        className: u(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: p?.top ?? -9999, left: p?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (i) => i.stopPropagation(),
        children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ t.jsx(Nt, { size: 40 }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx(Ct, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ t.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: c.appInfo?.version ?? "…" }),
                c.appInfo ? ` · ${un(c.appInfo)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: "mb-3.5 flex w-full min-h-9 items-center gap-2.5 rounded-nomi-sm border-0 bg-[var(--nomi-ink-05)] px-3 py-2 cursor-pointer text-left transition-colors hover:bg-[var(--nomi-ink-10)]",
              onClick: () => {
                window.dispatchEvent(new CustomEvent("nomi-open-handbook")), n();
              },
              children: [
                /* @__PURE__ */ t.jsx(tt, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: o("about.handbook") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: o("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ t.jsx(he, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: o("theme.appearance") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(x ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ t.jsx(St, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: c.supported ? /* @__PURE__ */ t.jsx(hn, { updater: c }) : /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function hn({ updater: e }) {
  const { t: n } = K(), { phase: o } = e;
  return o === "checking" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ t.jsx(Ve, { size: 16, label: n("about.checking") }),
    n("about.checkingEllipsis")
  ] }) : o === "up-to-date" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ t.jsx(Ne, { size: 16, className: "text-[var(--workbench-success)]" }),
    n("about.upToDate")
  ] }) : o === "available" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ t.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        n("about.available"),
        " ",
        /* @__PURE__ */ t.jsx("b", { className: "font-medium", children: e.latestVersion })
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ t.jsx(O, { variant: "default", onClick: e.reset, children: n("common.later") }),
        e.canAutoInstall ? /* @__PURE__ */ t.jsx(O, { variant: "primary", onClick: e.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ t.jsx(O, { variant: "primary", onClick: e.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    e.canAutoInstall ? null : /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    e.notes ? /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: e.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ t.jsx(nt, { value: e.percent, size: "sm" }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: e.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ t.jsx(Ne, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ t.jsx(O, { variant: "default", onClick: e.reset, children: n("common.later") }),
      /* @__PURE__ */ t.jsx(O, { variant: "primary", onClick: e.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ t.jsx(qe, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ t.jsx("span", { className: "min-w-0 break-words", children: e.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ t.jsx(O, { variant: "default", onClick: e.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ t.jsx(O, { variant: "primary", onClick: e.check, children: n("about.checkUpdate") })
  ] });
}
const me = window.nomiDesktop?.platform === "win32";
function xn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function bn({
  workspaceMode: e,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: c,
  onOpenModelCatalog: x,
  onRenameProject: p,
  directorMode: k = !1
}) {
  const { t: i } = K(), [w, N] = a.useState(!1), [g, S] = a.useState(o || i("appBar.untitledProject")), [P, C] = a.useState(!1), _ = a.useRef(null);
  a.useEffect(() => {
    !w && o && S(o);
  }, [o, w]);
  const v = a.useCallback(() => {
    S((m) => {
      const j = m.trim() || i("appBar.untitledProject");
      return p?.(j), j;
    }), N(!1);
  }, [p, i]), r = a.useCallback(() => {
    x?.();
  }, [x]);
  return /* @__PURE__ */ t.jsxs(
    "header",
    {
      className: u(
        "nomi-appbar",
        me && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": i("appBar.workspace"),
      "data-director-mode": k ? "true" : void 0,
      onDoubleClick: Xe,
      children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              me ? null : /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    ref: _,
                    type: "button",
                    className: u(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": i("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": P,
                    onClick: () => C((m) => !m),
                    children: /* @__PURE__ */ t.jsx(Je, {})
                  }
                ),
                P ? /* @__PURE__ */ t.jsx(st, { anchorEl: _.current, onClose: () => C(!1) }) : null,
                /* @__PURE__ */ t.jsx(
                  "span",
                  {
                    className: u("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ t.jsxs(
                "div",
                {
                  className: u(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": i("appBar.locationNavigation"),
                  children: [
                    c ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                      /* @__PURE__ */ t.jsx(
                        O,
                        {
                          className: u(
                            "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--lib",
                            "app-no-drag",
                            "inline-flex items-center h-full px-2.5",
                            "border-none bg-transparent font-inherit text-body-sm",
                            "cursor-pointer whitespace-nowrap",
                            "text-[var(--nomi-ink-40)]",
                            "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                            "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                            "max-[700px]:hidden"
                          ),
                          "aria-label": i("appBar.backToLibrary"),
                          onClick: c,
                          children: i("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ t.jsx(
                        "span",
                        {
                          className: u(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    w ? /* @__PURE__ */ t.jsx(
                      "input",
                      {
                        className: u(
                          "nomi-appbar__breadcrumb-input",
                          "app-no-drag",
                          "h-full px-2.5 border-none",
                          "bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]",
                          "text-[var(--nomi-ink)] font-inherit text-body-sm",
                          "outline-none min-w-[80px] max-w-[240px]"
                        ),
                        value: g,
                        autoFocus: !0,
                        "aria-label": i("appBar.projectName"),
                        onBlur: v,
                        onChange: (m) => S(m.currentTarget.value),
                        onKeyDown: (m) => {
                          m.key === "Enter" && v(), m.key === "Escape" && N(!1);
                        }
                      }
                    ) : /* @__PURE__ */ t.jsx(
                      O,
                      {
                        className: u(
                          "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--name",
                          "app-no-drag",
                          "inline-flex items-center h-full px-2.5",
                          "border-none bg-transparent font-inherit text-body-sm",
                          "cursor-pointer whitespace-nowrap",
                          "text-[var(--nomi-ink-80)] max-w-[200px] overflow-hidden text-ellipsis",
                          "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                          "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]"
                        ),
                        title: g,
                        onClick: () => N(!0),
                        children: g
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ t.jsx("div", { className: "app-no-drag", children: k ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "inline-flex h-8 items-center gap-2 rounded-full border border-nomi-line px-3",
              "bg-nomi-ink-05 text-caption font-semibold text-nomi-ink-70",
              "max-[700px]:hidden"
            ),
            "aria-label": i("generationCommon.director.modeAria"),
            children: [
              /* @__PURE__ */ t.jsx("span", { className: "size-1.5 rounded-full bg-nomi-accent", "aria-hidden": "true" }),
              i("generationCommon.director.modeTitle")
            ]
          }
        ) : /* @__PURE__ */ t.jsx(_t, { value: e, onChange: n }) }),
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": i("appBar.globalActions"),
            children: [
              /* @__PURE__ */ t.jsx(It, { className: "size-[30px]" }),
              !me && !k ? /* @__PURE__ */ t.jsx(rt, {}) : null,
              !me && !k ? /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs(
                O,
                {
                  className: u(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": i("appBar.openBrowser"),
                  title: i("appBar.browser"),
                  onClick: xn,
                  children: [
                    /* @__PURE__ */ t.jsx(Ye, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.browser") })
                  ]
                }
              ) }) : null,
              /* @__PURE__ */ t.jsxs(
                O,
                {
                  className: u(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": i("appBar.openModelAccess"),
                  title: i("appBar.modelAccess"),
                  onClick: r,
                  children: [
                    /* @__PURE__ */ t.jsx(Et, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ t.jsxs(
                O,
                {
                  className: u(
                    "nomi-appbar__primary",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-80)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": i(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: i(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    e === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : n("preview");
                  },
                  children: [
                    /* @__PURE__ */ t.jsx(Kt, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.export") })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const fn = ne("i18n:sidebar.categoryPanel", () => import("./CategoryTree-DofWtsP5.js")), gn = ne(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-DOJYODUr.js").then((e) => ({
    default: e.PromptLibraryContent
  }))
), kn = ne(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-CXAOcgEu.js").then((e) => ({
    default: e.SkillLibraryContent
  }))
), vn = ne(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-C2JvN3B9.js").then((e) => ({
    default: e.AssetLibraryContent
  }))
), yn = 60, wn = 300, jn = 500, Nn = 60, Cn = u(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Re = u(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), $e = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", We = u(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function Sn(e, n) {
  return n(e === "categories" ? "sidebar.groups" : e === "prompt-library" ? "sidebar.promptLibrary" : e === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function _n(e) {
  return e === "prompt-library" || e === "skill-library" || e === "asset-library";
}
function In({ categories: e, projectId: n = null }) {
  const { t: o } = K(), [c, x] = a.useState("asset-library"), [p, k] = a.useState(0), i = z((r) => r.sidebarCollapsed), w = z((r) => r.toggleSidebarCollapsed), N = z((r) => r.setSidebarCollapsed), g = a.useCallback(() => {
    x("categories"), N(!1), k((r) => r + 1);
  }, [N]), S = a.useCallback((r) => {
    if (!i && c === r) {
      N(!0);
      return;
    }
    x(r), N(!1);
  }, [i, N, c]);
  a.useEffect(() => {
    const r = () => {
      x("asset-library"), N(!1);
    };
    return window.addEventListener("nomi-open-files-panel", r), () => window.removeEventListener("nomi-open-files-panel", r);
  }, [N]);
  const P = a.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: Xt
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: sn
      }
    ],
    [o]
  ), C = a.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: qt
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: Vt
      }
    ],
    [o]
  ), _ = Sn(c, o), v = _n(c) ? jn : wn;
  return /* @__PURE__ */ t.jsx(
    "aside",
    {
      "data-collapsed": i ? "true" : "false",
      className: u(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: i ? yn : v },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ t.jsxs(Mt, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: Nn },
            children: [
              /* @__PURE__ */ t.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                P.map((r) => {
                  const m = r.icon, j = c === r.id;
                  return /* @__PURE__ */ t.jsxs(ae, { children: [
                    /* @__PURE__ */ t.jsx(ce, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: u(Re, j && $e),
                        "aria-label": r.label,
                        "aria-pressed": j,
                        onClick: () => S(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(m, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(le, { side: "right", children: r.label })
                  ] }, r.id);
                }),
                /* @__PURE__ */ t.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                C.map((r) => {
                  const m = r.icon, j = c === r.id;
                  return /* @__PURE__ */ t.jsxs(ae, { children: [
                    /* @__PURE__ */ t.jsx(ce, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: u(Re, j && $e),
                        "aria-label": r.label,
                        "aria-pressed": j,
                        onClick: () => S(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(m, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(le, { side: "right", children: r.label })
                  ] }, r.id);
                })
              ] }),
              /* @__PURE__ */ t.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ t.jsxs(ae, { children: [
                /* @__PURE__ */ t.jsx(ce, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: w,
                    className: Cn,
                    "aria-label": o(i ? "sidebar.expand" : "sidebar.collapse"),
                    children: i ? /* @__PURE__ */ t.jsx(ot, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ t.jsx(Be, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ t.jsx(le, { side: "right", children: o(i ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        i ? null : /* @__PURE__ */ t.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": _, children: /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ t.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: _ }),
            c === "categories" ? /* @__PURE__ */ t.jsxs(ae, { children: [
              /* @__PURE__ */ t.jsx(ce, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: g,
                  className: We,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ t.jsx(Pt, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(le, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ t.jsxs(ae, { children: [
              /* @__PURE__ */ t.jsx(ce, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: w,
                  className: We,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ t.jsx(Be, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(le, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          c === "categories" ? /* @__PURE__ */ t.jsx(a.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(fn, { categories: e, createCategoryNonce: p }) }) : c === "prompt-library" ? /* @__PURE__ */ t.jsx(a.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(gn, { active: !0, compact: !0, showHeader: !1 }) }) : c === "skill-library" ? /* @__PURE__ */ t.jsx(a.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(kn, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ t.jsx(a.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(vn, { projectId: n, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const Oe = [
  {
    id: "general",
    label: "通用问答",
    shortLabel: "通用",
    title: "通用助手",
    description: "像普通 AI 一样直接回答，不强制套创作模板、不写入文稿。",
    prompt: "本轮是通用问答：直接、简洁地回答用户的问题或请求。不要强行套用任何创作模板，也不要主动改写文稿。",
    chatOnly: !0
  },
  {
    id: "story",
    label: "写故事",
    shortLabel: "故事",
    title: "故事开发",
    description: "从主题、片段或选区扩展为可拍的故事梗概。",
    prompt: [
      "本轮任务：故事开发。基于用户输入、当前文稿和选区，产出可继续制作的视频故事方案。",
      "输出包括：核心梗、故事梗概、主角画像、核心冲突、情绪曲线、一句话卖点。"
    ].join(`
`)
  },
  {
    id: "script",
    label: "写剧本",
    shortLabel: "剧本",
    title: "剧本创作",
    description: "按镜头、对白、OS/VO 和字幕格式生成剧本。",
    prompt: [
      "本轮任务：剧本创作。把材料改写成标准剧本。",
      "剧本正文必须使用镜头格式：每个镜头以“△ ”开头，包含景别、运镜、光线、氛围、动作和声音。",
      "对白使用“角色名（情绪/OS/VO）：内容”。需要字幕时使用“【字幕：xxx】”。",
      "输出优先给可直接粘贴进创作区的剧本正文。"
    ].join(`
`)
  },
  {
    id: "assets",
    label: "素材规划",
    shortLabel: "素材",
    title: "角色/场景/道具",
    description: "拆出角色、场景、道具，并生成生图提示词。",
    prompt: [
      "本轮任务：素材规划。基于故事或剧本拆分视觉资产。",
      "按角色 C01-C99、场景 S01-S99、道具 P01-P99 编号。",
      "每个资产输出名称、用途、视觉标记、生成提示词。所有提示词保持同一视觉风格前缀。",
      "角色必须有可区分的颜色、轮廓或配件标记。"
    ].join(`
`)
  },
  {
    // 名字要和「拆成镜头·落画布」区分开：这个模式只在文稿里写文字稿，不落画布、不生成。
    // 旧名「写分镜/分镜」和画布的「分镜」撞车，用户误选它以为能拆镜头到画布（名实不符）→ 改叫「文字稿」。
    id: "storyboard",
    label: "写分镜文字稿",
    shortLabel: "文字稿",
    title: "分镜文字稿",
    description: "在文稿里起草文字版分镜稿（15 秒一集，纯文字、不落画布）。想把故事结构化拆成镜头、落到画布生成，直接说「拆成镜头」或用浮现的卡片。",
    prompt: [
      "本轮任务：分镜脚本。把当前故事或剧本拆成可生成视频的分镜脚本。",
      "每集包含：素材上传清单、Seedance Prompt、尾帧描述。",
      "15秒分镜按 0-3秒、3-6秒、6-9秒、9-12秒、12-15秒 拆分。",
      "每段写清楚主体、动作、镜头运动、情绪、光线、转场和声音。"
    ].join(`
`)
  },
  {
    id: "seedance",
    label: "提示词",
    shortLabel: "提示词",
    title: "Seedance 提示词",
    description: "生成可复制到 Seedance 2.0 的最终提示词。",
    prompt: [
      "本轮任务：Seedance 2.0 提示词。输出可直接用于视频生成的时间轴提示词。",
      "格式：风格描述、15秒、画幅、整体氛围；然后按 0-3秒/3-6秒/6-9秒/9-12秒/12-15秒写画面。",
      "使用明确运镜词：推镜头、拉镜头、摇镜头、移镜头、跟镜头、环绕镜头、升降镜头、希区柯克变焦、一镜到底、手持晃动。",
      "如果是续集，保留“将@视频1延长15s”的开头，并说明 @图片/@视频 引用用途。",
      "避免过长堆砌，优先清晰可执行。"
    ].join(`
`)
  },
  {
    id: "review",
    label: "审校优化",
    shortLabel: "审校",
    title: "连续性审校",
    description: "检查资产引用、时间轴、情绪弧和敏感风险。",
    prompt: [
      "本轮任务：连续性审校。检查当前文稿的问题并给出可直接修改的结果。",
      "重点检查：资产引用是否对应、15秒时间轴是否完整、剧集尾帧和下一集开场是否连续、镜头语言是否具体、情绪弧是否成立、提示词是否过长或可能触发敏感风险。",
      "先列问题，再给修订版。不要输出泛泛建议。"
    ].join(`
`)
  }
];
function So(e) {
  return Oe.find((n) => n.id === e) || Oe[0];
}
function _o(e) {
  return !e.chatOnly;
}
function it(e) {
  return at(e?.contentJson).trim();
}
function at(e) {
  if (!e || typeof e != "object") return "";
  const n = e, o = typeof n.text == "string" ? n.text : "", c = Array.isArray(n.content) ? n.content.map(at).filter(Boolean).join(`
`) : "";
  return [o, c].filter(Boolean).join(o && c ? `
` : "");
}
function Io(e) {
  const n = e.userRequest.trim();
  return e.mode.chatOnly ? [
    e.mode.prompt,
    "",
    "需要时可调用 read_full_text 读取当前文稿、read_selection 读取选区作为上下文；本模式不要改写文档。",
    "",
    "用户问题：",
    n || "（用户未输入文字，请礼貌询问需要什么帮助）"
  ].join(`
`) : [
    e.mode.prompt,
    "",
    "工具使用规则（真实工具调用，用户会在卡片上确认每一次写入）：",
    "- 读取上下文：需要现有正文时调用 read_full_text；只针对选中片段操作时调用 read_selection。不要假设你已经知道文稿内容，先读再写。",
    "- 写入文档：改写/润色选中片段用 replace_selection；在光标处续写或补充用 insert_at_cursor；交付完整结果追加到文末用 append_to_end。",
    "- 写入工具的 content 字段只放最终正文，不要写使用说明或解释。",
    "- 只有用户明确要求写入/插入/替换/追加时才调用写入工具；否则用自然语言回答即可。",
    "",
    "当前任务：",
    n || `请按“${e.mode.label}”模式处理当前材料。`
  ].join(`
`);
}
const En = [
  { id: "idea", workspace: "creation" },
  { id: "script", workspace: "creation" },
  { id: "style", workspace: "generation" },
  { id: "character", workspace: "generation" },
  { id: "scene", workspace: "generation" },
  { id: "storyboard", workspace: "creation" },
  { id: "motion", workspace: "generation" },
  { id: "keyframe", workspace: "generation" },
  { id: "video", workspace: "generation" },
  { id: "review", workspace: "preview" }
];
function ct(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function ee(e, n) {
  return n.test(ct(e));
}
function Mn(e) {
  return e.meta?.referenceSheet === !0;
}
function Pn(e) {
  return Mn(e) ? !1 : e.kind === "shot" ? !0 : e.kind !== "image" || e.meta?.storyboardKeyframe === !0 || e.meta?.workflowStage === "keyframe" || ee(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof e.shotIndex == "number" || ee(e, /镜头|分镜|shot/);
}
function X(e, n) {
  return e.result?.type === n || e.history?.some((o) => o.type === n) === !0;
}
function An(e, n) {
  switch (n) {
    case "style":
      return ee(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || e.meta?.workflowStage === "style";
    case "character":
      return e.kind === "character" || ee(e, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || e.meta?.workflowStage === "character";
    case "scene":
      return e.kind === "scene" || ee(e, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || e.meta?.workflowStage === "scene";
    case "storyboard":
      return Pn(e);
    case "keyframe":
      return e.kind === "keyframe" || e.meta?.storyboardKeyframe === !0 || ee(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || e.meta?.workflowStage === "keyframe";
    case "video":
      return e.kind === "video";
  }
}
function V(e, n) {
  if (!An(e, n)) return !1;
  const o = n === "video" ? "video" : "image";
  return !!e.prompt?.trim() || X(e, o);
}
function Tn(e, n) {
  const o = e === "video" ? "video" : "image";
  return n.filter((c) => V(c, e) && !X(c, o) && c.status !== "queued" && c.status !== "running");
}
function Ge(e, n) {
  const o = ct(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof e.shotIndex == "number" ? `shot-${e.shotIndex}` : `position-${n + 1}`;
}
function ke(e, n, o = () => !0) {
  const c = new Set(
    n.filter(o).map((x, p) => Ge(x, p))
  );
  return new Set(
    e.map((x, p) => Ge(x, p)).filter((x) => c.has(x))
  ).size;
}
function Ln(e) {
  const n = e.documentText.trim(), o = n.length >= 4, c = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, x = e.nodes.filter((h) => V(h, "style")), p = e.nodes.filter((h) => V(h, "character")), k = e.nodes.filter((h) => V(h, "scene")), i = e.nodes.filter((h) => V(h, "storyboard")), w = e.nodes.filter(
    (h) => ee(h, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || h.meta?.cameraMoveAutoCapture !== void 0 || h.meta?.cameraMovePromptApplied !== void 0 || h.meta?.workflowStage === "motion"
  ), N = e.nodes.filter((h) => V(h, "keyframe")), g = e.nodes.filter((h) => V(h, "video")), S = i.length, P = x.filter((h) => X(h, "image")).length, C = p.filter((h) => X(h, "image")).length, _ = k.filter((h) => X(h, "image")).length, v = i.filter((h) => X(h, "image")).length, r = ke(
    i,
    N,
    (h) => X(h, "image")
  ), m = ke(
    i,
    g,
    (h) => X(h, "video")
  ), j = ke(i, w), d = x.length > 0 && P > 0, I = p.length > 0 && C === p.length, E = k.length > 0 && _ === k.length, b = S > 0 && v === S, y = S > 0 && j === S, f = S > 0 && r === S, A = g.length > 0, T = S > 0 && m === S, R = S > 0 && T && e.timelineClipCount >= S, B = {
    style: x.length > 0,
    character: p.length > 0,
    scene: k.length > 0,
    storyboard: i.length > 0,
    keyframe: N.length > 0,
    video: g.length > 0
  }, U = {
    style: P,
    character: C,
    scene: _,
    storyboard: v,
    keyframe: r,
    video: m
  }, l = {
    idea: o,
    script: c,
    style: d,
    character: I,
    scene: E,
    storyboard: b,
    motion: y,
    keyframe: f,
    video: T,
    review: R
  }, L = En.map((h) => ({
    ...h,
    complete: l[h.id]
  })), $ = L.findIndex((h) => !h.complete), s = $ >= 0 ? $ : L.length - 1;
  return {
    stages: L,
    current: L[s],
    currentIndex: s,
    completedCount: L.filter((h) => h.complete).length,
    hasVideoNodes: A,
    hasGeneratedVideo: T,
    shotCount: S,
    plannedByStage: B,
    generatedCountByStage: U
  };
}
function zn(e) {
  return String(e.title || "").toLocaleLowerCase();
}
function lt(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function F(e, n) {
  return n.test(zn(e));
}
function J(e) {
  return String(e.meta?.workflowStage || "").toLocaleLowerCase();
}
function dt(e) {
  return J(e) === "story" || F(e, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function mt(e) {
  return J(e) === "script" || F(e, /剧本|分场|script|screenplay/);
}
function Bn(e) {
  return J(e) === "style" || F(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function Dn(e) {
  return e.kind === "character" || J(e) === "character" || F(e, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function Rn(e) {
  return e.kind === "scene" || J(e) === "scene" || F(e, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function $n(e) {
  return e.kind === "keyframe" || J(e) === "keyframe" || e.meta?.storyboardKeyframe === !0 || F(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function Wn(e) {
  return e.kind === "video" && (J(e) === "video" || F(e, /镜头|shot|视频/));
}
function On(e) {
  return J(e) === "motion" || F(e, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function Gn(e) {
  return V(e, "storyboard");
}
function be(e) {
  const n = lt(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof e.shotIndex == "number" ? e.shotIndex : null;
}
function pe(e) {
  return [...e].sort((n, o) => {
    const c = be(n) ?? Number.MAX_SAFE_INTEGER, x = be(o) ?? Number.MAX_SAFE_INTEGER;
    return c !== x ? c - x : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function ve(e, n, o) {
  const c = be(n);
  if (c !== null) {
    const x = e.filter((p) => be(p) === c);
    if (x.length) return x;
  }
  return e[o] ? [e[o]] : [];
}
function Fe(e, n) {
  if (e.length <= 1) return e;
  const o = lt(n), c = e.filter((x) => x.title.split(/[｜|·：:\s]/).map((k) => k.trim()).filter((k) => k.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(k)).some((k) => o.includes(k.toLocaleLowerCase())));
  return c.length ? c : e;
}
function Ke(e, n, o) {
  const c = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), x = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return e.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${c}\\s*\\n([\\s\\S]*?)${x}`, "i"))?.[1]?.trim() || "";
}
function Fn(e, n) {
  const o = [];
  if (!n.some(dt)) {
    const c = Ke(e, "故事设定", "剧本");
    c && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: c,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(mt)) {
    const c = Ke(e, "剧本");
    c && o.push({
      kind: "text",
      title: "剧本｜制作稿",
      prompt: c,
      position: { x: 420, y: 40 },
      meta: { workflowStage: "script" }
    });
  }
  return o;
}
function Kn(e, n) {
  const o = e.filter(dt), c = e.filter(mt), x = e.filter(Bn), p = x.filter((r) => r.kind !== "text"), k = e.filter(Dn), i = e.filter(Rn), w = pe(e.filter(Gn)), N = pe(e.filter(On)), g = pe(e.filter($n)), S = pe(e.filter(Wn)), P = [], C = new Set(n.map((r) => `${r.source}:${r.target}:${r.mode || "reference"}`)), _ = (r, m, j = "reference") => {
    if (!r || !m || r.id === m.id) return;
    const d = `${r.id}:${m.id}:${j}`;
    C.has(d) || (C.add(d), P.push({ source: r.id, target: m.id, mode: j }));
  };
  o.forEach((r) => c.forEach((m) => _(r, m))), c.forEach((r) => {
    k.forEach((m) => _(r, m)), i.forEach((m) => _(r, m)), w.forEach((m) => _(r, m));
  }), x.filter((r) => r.kind === "text").forEach((r) => {
    p.forEach((m) => _(r, m));
  });
  const v = p[0];
  return v && (k.forEach((r) => _(v, r, "style_ref")), i.forEach((r) => _(v, r, "style_ref")), g.forEach((r) => _(v, r, "style_ref"))), g.forEach((r, m) => {
    Fe(k, r).forEach((j) => _(j, r, "character_ref")), Fe(i, r).forEach((j) => _(j, r, "composition_ref")), ve(w, r, m).forEach((j) => _(j, r, "composition_ref"));
  }), S.forEach((r, m) => {
    const j = ve(g, r, m), d = j.find((E) => !F(E, /尾帧|last\s*frame/)) || j[0], I = j.find((E) => F(E, /尾帧|last\s*frame/));
    _(d, r, "first_frame"), _(I, r, "last_frame"), ve(N, r, m).forEach((E) => _(E, r));
  }), P;
}
function pt(e) {
  const n = e.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function ut(e) {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "当前文稿已经完整附在下面，不要再说“我先读取”，直接根据它扩写成能生产的短剧剧本。",
    "本轮必须调用 append_to_end，把最终剧本放在 args.content 中写回文稿；不要只在聊天里解释、承诺或复述步骤。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。",
    "",
    "当前文稿：",
    pt(e)
  ].join(`
`);
}
function ht(e, n) {
  const c = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    pt(n),
    ""
  ], x = {
    style: [
      "当前唯一任务：建立视觉风格母版。",
      "一次 create_canvas_nodes 创建两张参考卡：",
      "1）text 节点，标题必须含“视觉风格母版”，prompt 写清画幅、媒介/画风、时代地域、线条材质、色彩系统、主辅光、镜头质感、细节密度、全项目一致性规则；",
      "2）image 节点，标题必须含“视觉风格母版图”，prompt 是可直接生图的无具体剧情风格样张，referenceSheet=true。",
      "同一次调用中把文字母版连到母版图。只建母版，不生成角色、场景或分镜。"
    ],
    character: [
      "当前唯一任务：建立主要人物的身份资产。",
      "按剧本识别所有主要角色，每个角色只建一个 character 参考卡，referenceSheet=true。",
      "每张卡的标题使用“R编号｜角色名｜人物三视图·表情·服装”。",
      "prompt 必须包含：纯净中性背景、统一比例、正面/侧面/背面三视图、头身比与骨相、发型肤色、标志物、至少 6 种表情、基础服装与剧情所需服装变体、材质配色、不可漂移的身份特征。",
      "继承已有视觉风格母版。只建人物卡，不建场景和镜头。"
    ],
    scene: [
      "当前唯一任务：建立场景与关键道具资产。",
      "按剧本出现地点，每个主要场景建一个 scene 参考卡，referenceSheet=true；关键剧情道具可建 image 参考卡。",
      "场景标题使用“SCENE编号｜场景名｜场景设定·道具”。",
      "prompt 必须包含：无人物空间母版、空间尺度与布局、入口出口、前中后景、2-3 个永久地标、行动区、关键道具、主辅光方向与色温、日夜变体、分镜可复用角度；继承视觉风格母版。",
      "只建场景/道具卡，不拆分镜头。"
    ],
    motion: [
      "当前唯一任务：为现有每一个分镜做“镜头动态设计”。即使是固定镜头，也必须有一张对应设计卡。",
      "逐镜创建 text 节点，标题必须使用“镜头动态设计｜镜头N”。",
      "prompt 写清镜头时长、人物起点/终点、身体部位动作、屏幕方向、物体运动、速度与节奏、摄影机起点/终点、唯一运镜、焦距/焦点变化、剪辑点、上一镜与下一镜的姿态承接。",
      "有明确推拉摇移、环绕、升降或跟拍的镜头，调用 create_camera_move 把运镜参考连接到对应视频镜头；固定镜头只写静止机位，不强加运动。",
      "不要生成关键帧或最终视频。"
    ],
    keyframe: [
      "当前唯一任务：建立每镜首帧/关键帧，必要时建立尾帧。",
      "读取已有分镜、人物、场景和运动设计。每个镜头创建 keyframe 节点，标题必须使用“镜头N｜首帧关键帧”；大幅位移、变装或明确首尾帧控制的镜头，再加“镜头N｜尾帧关键帧”。",
      "prompt 必须写清角色版本、表情姿态、画面位置、景别机位、前中后景、光线、动作瞬间，并继承人物/场景/风格参考。",
      "用 character_ref、style_ref、composition_ref 或 first_frame/last_frame 等当前模型支持的引用边正确连接。不要默认九宫格，不要启动付费生成。"
    ],
    video: [
      "当前唯一任务：把已批准的分镜、运动设计和关键帧转成视频生成节点。",
      "每个 2-6 秒镜头建立一个 video 节点，标题使用“镜头N｜视频”。",
      "prompt 分开写：素材引用、首帧承接、人物身体动作、唯一运镜、场景光影、对白/音效、末帧姿态；不得把多个镜头塞进一个节点。",
      "把对应首帧以 first_frame、可选尾帧以 last_frame 连接到视频节点，并复用已配置的可用视频模型。",
      "本步骤只建立视频任务，不调用 run_generation_batch，不消耗额度。"
    ]
  };
  return [...c, ...x[e]].join(`
`);
}
function Un(e) {
  const n = {
    style: "只处理标题含“视觉风格母版”的尚未成功图片节点",
    character: "只处理人物三视图、表情、服装参考卡中尚未成功的图片节点",
    scene: "只处理场景设定、场景母版和关键道具中尚未成功的图片节点",
    storyboard: "只处理逐镜分镜图中尚未成功的图片节点，不要处理人物、场景或关键帧参考卡",
    keyframe: "只处理每镜首帧、关键帧和可选尾帧中尚未成功的图片节点",
    video: "只处理标题含“镜头”且尚未成功的视频节点"
  }, o = {
    style: "检查画幅、画风、色彩、光线、材质和时代基调是否齐全",
    character: "检查正面/侧面/背面、脸部、表情、服装与不可漂移身份特征是否齐全",
    scene: "检查空间布局、永久地标、日夜灯光、关键道具和可复用角度是否齐全",
    storyboard: "检查每个镜头的构图、景别、人物位置、动作瞬间与连续性是否齐全",
    keyframe: "检查每镜首帧都已连接人物、场景、风格和分镜构图参考；尾帧只按需",
    video: "检查每个节点已有首帧/可选尾帧、2-6 秒动作和唯一运镜"
  }, c = e === "video" ? "视频" : "图片";
  return [
    `读取当前画布，${n[e]}。`,
    `先${o[e]}。`,
    `然后调用一次 run_generation_batch 启动这些${c}节点的真实生成。这个调用会花费额度，必须让用户看到并确认额度操作；不要创建重复节点，也不要生成其他阶段的资产。`
  ].join(`
`);
}
function te(e, n = !1) {
  return {
    script: "comic-screenwriter",
    style: "comic-vfx-designer",
    character: n ? "comic-character-artist" : "comic-character-designer",
    scene: n ? "comic-scene-artist" : "comic-scene-designer",
    storyboard: "comic-storyboard",
    motion: "comic-trajectory-artist",
    keyframe: "comic-keyframe-artist",
    video: "comic-video-artist"
  }[e];
}
function oe(e, n) {
  return `guidedProduction.stage.${e}.${n}`;
}
function Ue(e) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(e);
}
function Hn() {
  const { t: e } = K(), [n, o] = a.useState(!1), [c, x] = a.useState(!1), p = a.useRef(!1), k = z((s) => s.workbenchDocument), i = z((s) => s.storyboardPlan), w = z((s) => s.storyboardPlanCommitted), N = z((s) => s.timeline), g = z((s) => s.setWorkspaceMode), S = z((s) => s.setStoryboardEditorOpen), P = z((s) => s.setCreationAiCollapsed), C = G((s) => s.nodes), _ = G((s) => s.edges), v = re((s) => s.activeScope), r = a.useMemo(
    () => _e(C, v),
    [C, v]
  ), m = a.useMemo(
    () => C.filter((s) => At(s, r)),
    [r, C]
  ), j = a.useMemo(() => new Set(m.map((s) => s.id)), [m]), d = a.useMemo(
    () => _.filter((s) => j.has(s.source) && j.has(s.target)),
    [_, j]
  ), I = a.useMemo(
    () => Tt(N, C, r),
    [r, C, N]
  ), E = a.useMemo(
    () => it(k),
    [k]
  ), b = a.useMemo(
    () => I.tracks.reduce((s, h) => s + h.clips.length, 0),
    [I.tracks]
  ), y = a.useMemo(
    () => Ln({
      documentText: E,
      nodes: m,
      timelineClipCount: b
    }),
    [E, m, i, w, b]
  ), f = y.current, A = y.completedCount === y.stages.length, T = Ue(f.id) ? f.id : null, R = T !== null && y.plannedByStage[T] && !f.complete, B = T !== null && m.some(
    (s) => V(s, T) && (s.status === "queued" || s.status === "running")
  );
  a.useEffect(() => {
    const s = Kn(m, d);
    if (!s.length) return;
    const h = G.getState();
    s.forEach((M) => h.connectNodes(M.source, M.target, M.mode));
  }, [d, m]);
  const U = A ? e("guidedProduction.completeAction") : R && B ? e("guidedProduction.generationInProgress") : R && c ? e("guidedProduction.startingGeneration") : f.id === "storyboard" && i && !w ? e("guidedProduction.reviewStoryboardAction") : e(R ? oe(f.id, "generateAction") : oe(f.id, "action")), l = a.useCallback(() => {
    const s = G.getState(), h = z.getState(), M = new Set(
      h.timeline.tracks.flatMap((D) => D.clips.map((q) => q.sourceNodeId))
    ), W = new Set(ue.read_canvas().nodes.map((D) => D.id)), H = s.nodes.filter((D) => W.has(D.id)).filter((D) => D.kind === "video" && (D.status === "success" || D.result?.type === "video")).filter((D) => !M.has(D.id)).sort((D, q) => (D.shotIndex ?? Number.MAX_SAFE_INTEGER) - (q.shotIndex ?? Number.MAX_SAFE_INTEGER));
    let Ee = Math.max(
      0,
      ...h.timeline.tracks.flatMap((D) => D.clips.map((q) => q.endFrame))
    );
    for (const D of H) {
      const q = ue.send_to_timeline(D.id, { startFrame: Ee });
      q.ok && (Ee = q.clip.endFrame);
    }
    g("preview");
  }, [g]), L = a.useCallback(async (s) => {
    if (p.current) return;
    const h = Tn(s, m), M = Qt(h.map((H) => H.id), { nodes: m, edges: d }), W = M.waves.flat();
    if (W.length === 0) {
      await ze(M);
      return;
    }
    p.current = !0, x(!0);
    try {
      const H = await Lt(W);
      await ze(M, H);
    } catch (H) {
      zt(
        H instanceof Error && H.message ? H.message : e("guidedProduction.authorizationFailed"),
        "error"
      );
    } finally {
      p.current = !1, x(!1);
    }
  }, [d, m, e]), $ = a.useCallback(() => {
    if (!(R && (p.current || B))) {
      if (A || f.id === "review") {
        l();
        return;
      }
      if (f.id === "idea") {
        g("creation"), P(!1);
        return;
      }
      if (f.id === "script") {
        g("creation"), P(!1), xe({
          action: "send",
          prompt: ut(E),
          modeId: "script",
          displayMessage: e("guidedProduction.stage.script.displayMessage"),
          autoApproveWrites: !0,
          employeeKey: te("script"),
          requiredTool: "append_to_end"
        });
        return;
      }
      if (R && Ue(f.id)) {
        g("generation"), L(f.id);
        return;
      }
      if (f.id === "storyboard") {
        if (i && !w) {
          g("creation"), P(!1), S(!0);
          return;
        }
        g("creation"), P(!1), xe({
          action: "storyboard",
          displayMessage: e("guidedProduction.stage.storyboard.displayMessage"),
          shotMode: "image",
          employeeKey: te("storyboard"),
          requiredTool: "propose_storyboard_plan"
        });
        return;
      }
      if (g("generation"), f.id === "style") {
        const s = Fn(
          E,
          G.getState().nodes
        );
        s.length && ue.create_nodes(s);
      }
      je({
        prompt: ht(f.id, E),
        displayMessage: e(`guidedProduction.stage.${f.id}.displayMessage`),
        autoApproveSafeWrites: !0,
        employeeKey: te(f.id),
        requiredTool: "create_canvas_nodes"
      });
    }
  }, [
    A,
    f.id,
    B,
    E,
    l,
    R,
    P,
    S,
    g,
    L,
    i,
    w,
    e
  ]);
  return /* @__PURE__ */ t.jsxs(
    "section",
    {
      className: u(
        "relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper",
        "px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      ),
      "aria-label": e("guidedProduction.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center gap-3", children: [
          /* @__PURE__ */ t.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: A ? /* @__PURE__ */ t.jsx(ie, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ t.jsx(Qe, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: A ? e("guidedProduction.complete") : e("guidedProduction.step", {
                current: y.currentIndex + 1,
                total: y.stages.length
              }) }),
              /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: e(A ? "guidedProduction.completeTitle" : oe(f.id, "title")) }),
              A ? null : /* @__PURE__ */ t.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: e(oe(f.id, "owner")) })
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: e(A ? "guidedProduction.completeDescription" : oe(f.id, "description")) })
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: u(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4",
                "border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer",
                "shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-nomi-sm"
              ),
              onClick: $,
              disabled: R && (c || B),
              children: [
                U,
                /* @__PURE__ */ t.jsx(Ce, { size: 15, stroke: 2 })
              ]
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: u(
                "grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line",
                "bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              "aria-label": e(n ? "guidedProduction.collapse" : "guidedProduction.expand"),
              "aria-expanded": n,
              onClick: () => o((s) => !s),
              children: n ? /* @__PURE__ */ t.jsx(Jt, { size: 16 }) : /* @__PURE__ */ t.jsx(Ie, { size: 16 })
            }
          )
        ] }),
        n ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "absolute left-4 right-4 top-[calc(100%+8px)] mx-auto max-w-[1120px]",
              "rounded-nomi-lg border border-nomi-line bg-nomi-paper p-4 shadow-nomi-lg"
            ),
            children: [
              /* @__PURE__ */ t.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ t.jsxs("div", { children: [
                  /* @__PURE__ */ t.jsx("h2", { className: "m-0 text-body font-semibold text-nomi-ink", children: e("guidedProduction.allSteps") }),
                  /* @__PURE__ */ t.jsx("p", { className: "m-0 mt-0.5 text-caption text-nomi-ink-60", children: e("guidedProduction.allStepsDescription") })
                ] }),
                /* @__PURE__ */ t.jsx("span", { className: "shrink-0 text-caption font-semibold text-nomi-accent", children: e("guidedProduction.completedCount", {
                  completed: y.completedCount,
                  total: y.stages.length
                }) })
              ] }),
              /* @__PURE__ */ t.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: y.stages.map((s, h) => {
                const M = !A && s.id === f.id;
                return /* @__PURE__ */ t.jsxs(
                  "li",
                  {
                    className: u(
                      "min-w-0 rounded-nomi border p-2.5",
                      s.complete ? "border-transparent bg-nomi-ink-05" : M ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ t.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        s.complete ? /* @__PURE__ */ t.jsx(ie, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ t.jsx(Yt, { size: 10, className: u("mx-0.5 shrink-0", M ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro text-nomi-ink-40", children: e("guidedProduction.shortStep", { current: h + 1 }) })
                      ] }),
                      /* @__PURE__ */ t.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: e(oe(s.id, "title")) })
                    ]
                  },
                  s.id
                );
              }) })
            ]
          }
        ) : null
      ]
    }
  );
}
function se(e, n) {
  return e(`generationCommon.director.stages.${n}.title`);
}
function de(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.globalScope") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : e("generationCommon.director.noShotSelected");
}
function Vn(e, n) {
  const o = n.current;
  return n.complete ? e("generationCommon.director.nextIncomplete") : o.id === "review" ? e("generationCommon.director.reviewAction") : o.running ? e("generationCommon.director.runningAction", { stage: se(e, o.id) }) : o.id === "script" ? e("generationCommon.director.scriptAction") : o.id === "storyboard" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: se(e, o.id) }) : e("generationCommon.director.storyboardAction") : o.id === "motion" ? e("generationCommon.director.motionAction") : o.id === "keyframe" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: se(e, o.id) }) : e("generationCommon.director.keyframeAction") : o.planned ? e("generationCommon.director.videoGenerateAction") : e("generationCommon.director.videoAction");
}
function qn(e) {
  return e === "storyboard" || e === "keyframe" || e === "video";
}
function Xn({ projectName: e }) {
  const { t: n } = K(), o = G((l) => l.nodes), c = z((l) => l.timeline), x = z((l) => l.workbenchDocument), p = z((l) => l.setWorkspaceMode), k = z((l) => l.setActiveCategoryId), i = z((l) => l.setCreationAiCollapsed), w = G((l) => l.setGenerationAiCollapsed), N = re((l) => l.activeScope), g = re((l) => l.setActiveScope), S = Q((l) => l.mode), P = Q((l) => l.setMode), C = Q((l) => l.directoryOpen), _ = Q((l) => l.toggleDirectory), v = a.useMemo(() => Ze(o), [o]), r = a.useMemo(
    () => _e(o, N),
    [o, N]
  ), m = a.useMemo(
    () => o.filter((l) => Bt(l, r)),
    [r, o]
  ), j = a.useMemo(
    () => new Set(c.tracks.flatMap((l) => l.clips.map((L) => L.sourceNodeId))),
    [c.tracks]
  ), d = a.useMemo(
    () => Se({ nodes: m, timelineSourceNodeIds: j }),
    [m, j]
  ), I = a.useMemo(
    () => Dt(v, r),
    [r, v]
  ), E = a.useMemo(
    () => Pe(v, r, -1),
    [r, v]
  ), b = a.useMemo(
    () => Pe(v, r, 1),
    [r, v]
  ), y = a.useMemo(
    () => it(x),
    [x]
  ), f = a.useCallback((l) => {
    k("shots"), g(l), p("generation");
  }, [k, g, p]), A = a.useCallback(() => {
    const l = Ae(v);
    if (!l.length) return null;
    const L = Math.max(-1, I?.absoluteIndex ?? -1), $ = [...l.slice(L + 1), ...l.slice(0, L + 1)];
    for (const s of $) {
      const h = o.filter((W) => s.shot.nodeIds.includes(W.id));
      if (!Se({ nodes: h, timelineSourceNodeIds: j }).complete) return s.shot.scope;
    }
    return null;
  }, [o, v, I?.absoluteIndex, j]), T = a.useCallback(() => {
    const l = z.getState(), L = new Set(
      l.timeline.tracks.flatMap((M) => M.clips.map((W) => W.sourceNodeId))
    ), $ = new Set(m.map((M) => M.id)), s = G.getState().nodes.filter((M) => $.has(M.id)).filter((M) => M.kind === "video" && (M.status === "success" || M.result?.type === "video")).filter((M) => !L.has(M.id));
    let h = Math.max(
      0,
      ...l.timeline.tracks.flatMap((M) => M.clips.map((W) => W.endFrame))
    );
    for (const M of s) {
      const W = ue.send_to_timeline(M.id, { startFrame: h });
      W.ok && (h = W.clip.endFrame);
    }
    window.dispatchEvent(new CustomEvent("nomi-set-timeline-expanded", { detail: { expanded: !0 } })), p("preview");
  }, [m, p]), R = a.useCallback(() => {
    if (r?.kind !== "shot") {
      const L = Ae(v)[0]?.shot;
      L && f(L.scope);
      return;
    }
    if (d.complete) {
      const L = A();
      L ? f(L) : p("preview");
      return;
    }
    const l = d.current;
    if (!l.running) {
      if (l.id === "review") {
        T();
        return;
      }
      if (l.id === "script") {
        p("creation"), i(!1), xe({
          action: "send",
          prompt: ut(y),
          modeId: "script",
          displayMessage: n("generationCommon.director.scopeScriptMessage", { scope: de(n, r) }),
          autoApproveWrites: !0,
          employeeKey: te("script"),
          requiredTool: "append_to_end"
        });
        return;
      }
      if (l.id === "storyboard" && !l.planned) {
        p("creation"), i(!1), xe({
          action: "storyboard",
          displayMessage: n("generationCommon.director.scopeStoryboardMessage", { scope: de(n, r) }),
          shotMode: "image",
          employeeKey: te("storyboard"),
          requiredTool: "propose_storyboard_plan"
        });
        return;
      }
      if (p("generation"), w(!1), l.planned && qn(l.id)) {
        je({
          prompt: Un(l.id),
          displayMessage: n("generationCommon.director.scopeGenerateMessage", {
            scope: de(n, r),
            stage: se(n, l.id)
          }),
          autoApproveSafeWrites: !0,
          employeeKey: te(l.id, !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      (l.id === "motion" || l.id === "keyframe" || l.id === "video") && je({
        prompt: ht(l.id, y),
        displayMessage: n("generationCommon.director.scopeCreateMessage", {
          scope: de(n, r),
          stage: se(n, l.id)
        }),
        autoApproveSafeWrites: !0,
        employeeKey: te(l.id),
        requiredTool: "create_canvas_nodes"
      });
    }
  }, [
    r,
    y,
    A,
    v,
    d,
    f,
    T,
    i,
    w,
    p,
    n
  ]);
  if (!v.isProductionProject || !r) return null;
  const B = r.kind === "shot", U = Math.round(d.productionCompletedCount / d.productionStageCount * 100);
  return /* @__PURE__ */ t.jsx(
    "section",
    {
      className: u(
        "production-director-bar relative z-[65] shrink-0 border-b border-nomi-line",
        "bg-[linear-gradient(90deg,var(--nomi-paper),color-mix(in_oklch,var(--nomi-accent)_5%,var(--nomi-paper)))]",
        "px-3 py-2"
      ),
      "data-production-director": "true",
      "data-director-mode": S,
      "aria-label": n("generationCommon.director.aria"),
      children: /* @__PURE__ */ t.jsxs("div", { className: "flex min-w-0 items-center gap-2.5 max-[700px]:flex-wrap", children: [
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: u(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-nomi border px-3",
              C ? "border-nomi-accent bg-nomi-accent-soft text-nomi-accent" : "border-nomi-line bg-nomi-paper text-nomi-ink-70 hover:bg-nomi-ink-05"
            ),
            "aria-label": n(C ? "generationCommon.director.closeDirectory" : "generationCommon.director.openDirectory"),
            "aria-pressed": C,
            onClick: _,
            children: [
              /* @__PURE__ */ t.jsx(ot, { size: 16, stroke: 1.9 }),
              /* @__PURE__ */ t.jsx("span", { className: "hidden text-caption font-semibold xl:inline", children: n("generationCommon.director.directory") })
            ]
          }
        ),
        /* @__PURE__ */ t.jsxs("div", { className: "inline-flex shrink-0 items-center gap-1", children: [
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !E,
              "aria-label": n("generationCommon.director.previousShot"),
              title: n("generationCommon.director.previousShot"),
              onClick: () => E && f(E.scope),
              children: /* @__PURE__ */ t.jsx(nn, { size: 17 })
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !b,
              "aria-label": n("generationCommon.director.nextShot"),
              title: n("generationCommon.director.nextShot"),
              onClick: () => b && f(b.scope),
              children: /* @__PURE__ */ t.jsx(he, { size: 17 })
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "min-w-[190px] shrink-0 max-[900px]:min-w-0 max-[700px]:min-w-[110px] max-[700px]:flex-1", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ t.jsx(et, { size: 15, stroke: 1.9, className: "shrink-0 text-nomi-accent" }),
            /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: de(n, r) })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-micro text-nomi-ink-50 max-[700px]:hidden", children: B && I ? n("generationCommon.director.shotPosition", {
            project: e || n("generationCommon.productionHierarchy.season"),
            current: I.absoluteIndex + 1,
            total: v.totalShotCount
          }) : n("generationCommon.director.seasonSummary", {
            episodes: v.episodes.length,
            shots: v.totalShotCount
          }) })
        ] }),
        B ? /* @__PURE__ */ t.jsx("ol", { className: "m-0 hidden min-w-0 flex-1 list-none items-center gap-1 p-0 min-[1120px]:flex", children: d.stages.map((l, L) => {
          const $ = !d.complete && l.id === d.current.id;
          return /* @__PURE__ */ t.jsxs("li", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
            /* @__PURE__ */ t.jsxs(
              "div",
              {
                className: u(
                  "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-1.5",
                  l.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : $ ? "bg-nomi-accent-soft text-nomi-accent ring-1 ring-inset ring-nomi-accent/30" : "bg-nomi-ink-05 text-nomi-ink-40"
                ),
                "aria-current": $ ? "step" : void 0,
                children: [
                  /* @__PURE__ */ t.jsx("span", { className: "grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[9px] font-bold", children: l.complete ? /* @__PURE__ */ t.jsx(ie, { size: 11, stroke: 2.5 }) : L + 1 }),
                  /* @__PURE__ */ t.jsx("span", { className: "truncate text-micro font-semibold", children: se(n, l.id) })
                ]
              }
            ),
            L < d.stages.length - 1 ? /* @__PURE__ */ t.jsx(Ce, { size: 11, className: "shrink-0 text-nomi-ink-20" }) : null
          ] }, l.id);
        }) }) : /* @__PURE__ */ t.jsx("div", { className: "min-w-0 flex-1 text-caption text-nomi-ink-60", children: n("generationCommon.director.publicHint") }),
        B ? /* @__PURE__ */ t.jsxs("div", { className: "hidden w-[90px] shrink-0 text-right min-[900px]:block", children: [
          /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold text-nomi-ink-60", children: n("generationCommon.director.currentShotProgress", { percent: U }) }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-nomi-ink-10", children: /* @__PURE__ */ t.jsx(
            "span",
            {
              className: "block h-full rounded-full bg-nomi-accent transition-[width]",
              style: { width: `${U}%` }
            }
          ) })
        ] }) : null,
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: u(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-3.5",
              "border-0 bg-nomi-accent text-white text-body-sm font-semibold shadow-nomi-sm",
              "transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-accent focus-visible:ring-offset-2",
              B && d.current.running && "cursor-wait opacity-70",
              "max-[700px]:order-10 max-[700px]:w-full max-[700px]:justify-center"
            ),
            disabled: B && d.current.running,
            "data-director-primary-action": B ? d.current.id : "enter-shot",
            onClick: R,
            children: [
              B && d.complete ? /* @__PURE__ */ t.jsx(ie, { size: 15 }) : /* @__PURE__ */ t.jsx(Qe, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "max-w-[180px] truncate", children: B ? Vn(n, d) : n("generationCommon.director.enterFirstShot") }),
              /* @__PURE__ */ t.jsx(Ce, { size: 15 })
            ]
          }
        ),
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: u(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi border border-nomi-line px-2.5",
              "bg-nomi-paper text-caption font-semibold text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink"
            ),
            "aria-label": n(S === "guided" ? "generationCommon.director.switchToProfessional" : "generationCommon.director.switchToGuided"),
            onClick: () => {
              const l = S === "guided" ? "professional" : "guided";
              P(l), l === "guided" && p("generation");
            },
            children: [
              S === "guided" ? /* @__PURE__ */ t.jsx(cn, { size: 15 }) : /* @__PURE__ */ t.jsx(Zt, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "hidden min-[1280px]:inline", children: n(S === "guided" ? "generationCommon.director.professionalMode" : "generationCommon.director.guidedMode") })
            ]
          }
        )
      ] })
    }
  );
}
function ye(e) {
  return e === null ? "unassigned" : String(e);
}
function Jn(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.sidebar.global") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : "";
}
function Yn(e, n) {
  return n.episode === null ? e("generationCommon.productionHierarchy.unassignedEpisode") : e("generationCommon.productionHierarchy.episode", { episode: n.episode });
}
function Qn({
  projectName: e,
  hierarchy: n,
  nodes: o,
  timelineSourceNodeIds: c = /* @__PURE__ */ new Set(),
  activeScope: x,
  onSelectScope: p,
  onClose: k
}) {
  const { t: i } = K(), [w, N] = a.useState(""), [g, S] = a.useState("all"), [P, C] = a.useState(() => {
    const d = x?.episode;
    return new Set(d !== void 0 ? [ye(d)] : []);
  }), _ = a.useMemo(() => new Map(o.map((d) => [d.id, d])), [o]);
  a.useEffect(() => {
    if (x?.kind === "global") return;
    const d = ye(x?.episode ?? null);
    C((I) => I.has(d) ? I : /* @__PURE__ */ new Set([...I, d]));
  }, [x]);
  const v = a.useCallback((d) => {
    const I = d.nodeIds.flatMap((y) => {
      const f = _.get(y);
      return f ? [f] : [];
    }), E = Se({ nodes: I, timelineSourceNodeIds: c }), b = `${d.scope.shotNumber} ${I.map((y) => `${y.title} ${y.prompt ?? ""}`).join(" ")}`.toLowerCase();
    return { progress: E, searchable: b, status: en(E) };
  }, [_, c]), r = a.useMemo(() => {
    const d = w.trim().toLowerCase();
    return n.episodes.map((I) => ({
      episode: I,
      shots: I.shots.filter((E) => {
        const b = v(E);
        return d && !b.searchable.includes(d) ? !1 : g === "failed" ? b.progress.hasFailure : g === "complete" ? b.progress.complete : g === "unfinished" ? !b.progress.complete : !0;
      })
    })).filter(({ shots: I }) => I.length > 0 || !d && g === "all");
  }, [g, n.episodes, w, v]), m = a.useMemo(() => {
    for (const d of n.episodes)
      for (const I of d.shots)
        if (!v(I).progress.complete) return I;
    return null;
  }, [n.episodes, v]);
  if (!n.isProductionProject || !x) return null;
  const j = Te(x);
  return /* @__PURE__ */ t.jsxs(
    "aside",
    {
      className: u(
        "production-hierarchy-navigator relative z-[70] flex h-full w-[276px] shrink-0 flex-col overflow-hidden",
        "border-r border-workbench-border bg-nomi-paper shadow-[8px_0_24px_rgba(20,20,24,0.04)]",
        "max-[1100px]:absolute max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-workbench-pop"
      ),
      "data-production-hierarchy": "true",
      "aria-label": i("generationCommon.director.sidebar.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("header", { className: "shrink-0 border-b border-nomi-line px-3 py-3", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ t.jsx("span", { className: "mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent", children: /* @__PURE__ */ t.jsx(Le, { size: 17, stroke: 1.9 }) }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40", children: i("generationCommon.director.sidebar.title") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-body-sm font-semibold text-nomi-ink", children: e || i("generationCommon.productionHierarchy.season") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-nomi-ink-50", children: i("generationCommon.director.seasonSummary", {
                episodes: n.episodes.filter((d) => d.episode !== null).length,
                shots: n.totalShotCount
              }) })
            ] }),
            k ? /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                className: "grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "aria-label": i("generationCommon.director.closeDirectory"),
                onClick: k,
                children: /* @__PURE__ */ t.jsx(Rt, { size: 16, stroke: 1.8 })
              }
            ) : null
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: u(
                "mt-3 flex w-full items-center gap-2 rounded-nomi border border-nomi-accent/25",
                "bg-nomi-accent-soft px-2.5 py-2 text-left hover:border-nomi-accent/50"
              ),
              onClick: () => m && p(m.scope),
              disabled: !m,
              children: [
                m ? /* @__PURE__ */ t.jsx($t, { size: 15, className: "shrink-0 text-nomi-accent" }) : /* @__PURE__ */ t.jsx(Ne, { size: 15, className: "shrink-0 text-workbench-success" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: i(m ? "generationCommon.director.sidebar.continueIncomplete" : "generationCommon.director.sidebar.allComplete") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-50", children: m ? Jn(i, m.scope) : i("generationCommon.director.sidebar.allCompleteHint") })
                ] }),
                m ? /* @__PURE__ */ t.jsx(he, { size: 15, className: "text-nomi-ink-40" }) : null
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("label", { className: "mt-2.5 flex h-8 items-center gap-2 rounded-nomi border border-nomi-line bg-workbench-bg px-2.5 focus-within:border-nomi-accent", children: [
            /* @__PURE__ */ t.jsx(Wt, { size: 14, className: "shrink-0 text-nomi-ink-40" }),
            /* @__PURE__ */ t.jsx(
              "input",
              {
                className: "min-w-0 flex-1 border-0 bg-transparent p-0 text-caption text-nomi-ink outline-none placeholder:text-nomi-ink-30",
                value: w,
                placeholder: i("generationCommon.director.sidebar.searchPlaceholder"),
                "aria-label": i("generationCommon.director.sidebar.searchAria"),
                onChange: (d) => N(d.currentTarget.value)
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(
            "div",
            {
              className: "mt-2 grid grid-cols-4 gap-1",
              role: "group",
              "aria-label": i("generationCommon.director.sidebar.filterAria"),
              children: [
                ["all", "filterAll"],
                ["unfinished", "filterUnfinished"],
                ["failed", "filterFailed"],
                ["complete", "filterComplete"]
              ].map(([d, I]) => /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  className: u(
                    "h-7 rounded-nomi-sm border-0 px-1 text-micro font-semibold",
                    g === d ? "bg-nomi-ink text-nomi-paper" : "bg-nomi-ink-05 text-nomi-ink-50 hover:text-nomi-ink"
                  ),
                  "aria-pressed": g === d,
                  onClick: () => S(d),
                  children: i(`generationCommon.director.sidebar.${I}`)
                },
                d
              ))
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]", children: [
          n.globalNodeIds.length ? /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: u(
                "mb-1 flex w-full items-center gap-2 rounded-nomi border px-2.5 py-2 text-left",
                j === "global" ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent bg-transparent hover:bg-nomi-ink-05"
              ),
              "data-production-scope": "global",
              "aria-current": j === "global" ? "page" : void 0,
              onClick: () => p({ kind: "global", episode: null, shotNumber: 0 }),
              children: [
                /* @__PURE__ */ t.jsx(Ot, { size: 16, stroke: 1.8, className: "shrink-0 text-nomi-ink-50" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: i("generationCommon.director.sidebar.global") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-40", children: i("generationCommon.director.sidebar.globalDescription") })
                ] }),
                /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: n.globalNodeIds.length })
              ]
            }
          ) : null,
          r.map(({ episode: d, shots: I }) => {
            const E = ye(d.episode), b = P.has(E), y = d.shots.filter((f) => v(f).progress.complete).length;
            return /* @__PURE__ */ t.jsxs("section", { className: "mb-1 overflow-hidden rounded-nomi border border-nomi-line", children: [
              /* @__PURE__ */ t.jsxs(
                "button",
                {
                  type: "button",
                  className: "flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left hover:bg-nomi-ink-10",
                  "aria-expanded": b,
                  onClick: () => C((f) => {
                    const A = new Set(f);
                    return A.has(E) ? A.delete(E) : A.add(E), A;
                  }),
                  children: [
                    b ? /* @__PURE__ */ t.jsx(Ie, { size: 15 }) : /* @__PURE__ */ t.jsx(he, { size: 15 }),
                    /* @__PURE__ */ t.jsx(et, { size: 16, stroke: 1.8, className: "text-nomi-accent" }),
                    /* @__PURE__ */ t.jsx("span", { className: "min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink", children: Yn(i, d) }),
                    /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: i("generationCommon.director.sidebar.episodeProgress", {
                      completed: y,
                      total: d.shots.length
                    }) })
                  ]
                }
              ),
              b ? /* @__PURE__ */ t.jsxs("div", { className: "space-y-1 bg-nomi-paper p-1.5", children: [
                d.episode !== null && d.overviewNodeIds.length ? /* @__PURE__ */ t.jsxs(
                  "button",
                  {
                    type: "button",
                    className: u(
                      "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left",
                      j === `episode:${d.episode}` ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent hover:bg-nomi-ink-05"
                    ),
                    "data-production-scope": `episode:${d.episode}`,
                    "aria-current": j === `episode:${d.episode}` ? "page" : void 0,
                    onClick: () => p({ kind: "episode", episode: d.episode, shotNumber: 0 }),
                    children: [
                      /* @__PURE__ */ t.jsx(Le, { size: 14, className: "text-nomi-ink-50" }),
                      /* @__PURE__ */ t.jsx("span", { className: "text-caption font-medium text-nomi-ink", children: i("generationCommon.director.sidebar.episodeOverview") })
                    ]
                  }
                ) : null,
                I.map((f) => {
                  const A = Te(f.scope), T = v(f);
                  return /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: u(
                        "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left",
                        j === A ? "border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]" : "border-transparent hover:bg-nomi-ink-05"
                      ),
                      "data-production-scope": A,
                      "data-shot-status": T.progress.complete ? "complete" : T.progress.hasFailure ? "failed" : "unfinished",
                      "aria-current": j === A ? "true" : void 0,
                      onClick: () => p(f.scope),
                      children: [
                        /* @__PURE__ */ t.jsx(
                          "span",
                          {
                            className: u(
                              "grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums",
                              j === A ? "bg-nomi-accent text-white" : T.progress.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : T.progress.hasFailure ? "bg-[color-mix(in_oklch,var(--workbench-danger)_12%,transparent)] text-workbench-danger" : "bg-nomi-ink-05 text-nomi-ink-60"
                            ),
                            children: T.progress.complete ? /* @__PURE__ */ t.jsx(ie, { size: 13 }) : f.scope.shotNumber
                          }
                        ),
                        /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: i("generationCommon.director.sidebar.shot", { shot: f.scope.shotNumber }) }),
                          /* @__PURE__ */ t.jsxs("span", { className: u(
                            "mt-0.5 flex items-center gap-1 text-micro",
                            T.progress.hasFailure ? "text-workbench-danger" : "text-nomi-ink-40"
                          ), children: [
                            T.progress.hasFailure ? /* @__PURE__ */ t.jsx(qe, { size: 11 }) : null,
                            i(`generationCommon.director.sidebar.status.${T.status}`, {
                              stage: i(`generationCommon.director.stages.${T.progress.current.id}.title`)
                            })
                          ] })
                        ] }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold tabular-nums text-nomi-ink-40", children: i("generationCommon.director.sidebar.stageProgress", {
                          completed: T.progress.productionCompletedCount,
                          total: T.progress.productionStageCount
                        }) })
                      ]
                    },
                    A
                  );
                }),
                I.length ? null : /* @__PURE__ */ t.jsx("div", { className: "px-2 py-4 text-center text-micro text-nomi-ink-40", children: i("generationCommon.director.sidebar.emptyFilter") })
              ] }) : null
            ] }, E);
          })
        ] })
      ]
    }
  );
}
const Zn = ne(
  "创作区",
  () => import("./CreationWorkspace-AcP4YMMy.js")
), eo = ne(
  "生成区",
  () => import("./GenerationWorkspace-DA1LOpgM.js")
), to = ne("预览区", () => import("./PreviewWorkspace-Dg0O45zK.js")), no = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, oo = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function ro({ label: e }) {
  const { t: n } = K(), o = n("workspace.loading", { label: e });
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: u(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ t.jsx(Ve, { size: 28, label: o })
    }
  );
}
function we({
  active: e,
  children: n,
  label: o
}) {
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: u(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !e,
      children: /* @__PURE__ */ t.jsx(
        a.Suspense,
        {
          fallback: e ? /* @__PURE__ */ t.jsx(ro, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function so() {
  if (typeof window > "u") return "generation";
  try {
    const e = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return oo[e] || "generation";
  } catch {
    return "generation";
  }
}
function He(e) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = no[e];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function io() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function ao({
  generation: e,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: c,
  projectName: x,
  onBackToLibrary: p,
  onOpenModelCatalog: k,
  onRenameProject: i
}) {
  const { t: w } = K(), N = z((s) => s.workspaceMode), g = z(
    (s) => s.setWorkspaceMode
  ), S = z((s) => s.categories), P = z((s) => s.setActiveCategoryId), C = G((s) => s.nodes), _ = a.useMemo(
    () => Ze(C),
    [C]
  ), v = re((s) => s.activeScope), r = re((s) => s.syncProject), m = re((s) => s.setActiveScope), j = a.useMemo(
    () => _e(C, v),
    [C, v]
  ), d = Q((s) => s.mode), I = Q((s) => s.directoryOpen), E = Q((s) => s.setDirectoryOpen), b = _.isProductionProject, y = b && d === "guided", f = z((s) => s.timeline), A = a.useMemo(
    () => new Set(
      f.tracks.flatMap((s) => s.clips.map((h) => h.sourceNodeId))
    ),
    [f.tracks]
  ), [T, R] = a.useState(() => [N]), [B, U] = a.useState(!1), l = a.useRef(null);
  a.useEffect(() => {
    r(c ?? null, C);
  }, [C, c, r]);
  const L = window.nomiDesktop?.platform === "win32";
  a.useEffect(() => {
    const s = z.getState().workspaceMode;
    He(s);
    const h = () => {
      g(so());
    };
    return window.addEventListener("popstate", h), () => window.removeEventListener("popstate", h);
  }, [g]), a.useEffect(() => {
    R(
      (s) => s.includes(N) ? s : [...s, N]
    );
  }, [N]);
  const $ = a.useCallback(
    (s) => {
      Gt(s) && (g(s), He(s));
    },
    [g]
  );
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      className: u(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": N,
      children: [
        L ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": w("appBar.windowTitleBar"),
            onDoubleClick: Xe,
            children: [
              /* @__PURE__ */ t.jsx(
                "button",
                {
                  ref: l,
                  type: "button",
                  className: u(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": w("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": B,
                  onClick: () => U((s) => !s),
                  children: /* @__PURE__ */ t.jsx(Je, { markSize: 18, wordSize: 14 })
                }
              ),
              B ? /* @__PURE__ */ t.jsx(st, { anchorEl: l.current, onClose: () => U(!1) }) : null,
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              y ? null : /* @__PURE__ */ t.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ t.jsx(rt, {}) }),
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: u(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": w("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: u(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": w("appBar.openBrowser"),
                      title: w("appBar.browser"),
                      onClick: io,
                      children: [
                        /* @__PURE__ */ t.jsx(Ye, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ t.jsx("span", { children: w("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ t.jsx(Ft, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ t.jsx(
          bn,
          {
            workspaceMode: N,
            onWorkspaceModeChange: $,
            projectName: x,
            onBackToLibrary: p,
            onOpenModelCatalog: k,
            onRenameProject: i,
            directorMode: y
          }
        ),
        b ? /* @__PURE__ */ t.jsx(Xn, { projectName: x }) : /* @__PURE__ */ t.jsx(Hn, {}),
        /* @__PURE__ */ t.jsxs(
          "main",
          {
            className: u(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              N === "generation" && y && I ? /* @__PURE__ */ t.jsx(
                Qn,
                {
                  projectName: x,
                  hierarchy: _,
                  nodes: C,
                  timelineSourceNodeIds: A,
                  activeScope: j,
                  onSelectScope: (s) => {
                    P("shots"), m(s);
                  },
                  onClose: () => E(!1)
                }
              ) : null,
              N === "generation" && !y ? /* @__PURE__ */ t.jsx(In, { projectId: c ?? null, categories: S }) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                T.includes("creation") ? /* @__PURE__ */ t.jsx(
                  we,
                  {
                    active: N === "creation",
                    label: w("workspace.creation"),
                    children: /* @__PURE__ */ t.jsx(Zn, {})
                  }
                ) : null,
                T.includes("generation") ? /* @__PURE__ */ t.jsx(
                  we,
                  {
                    active: N === "generation",
                    label: w("workspace.generation"),
                    children: /* @__PURE__ */ t.jsx(
                      eo,
                      {
                        canvas: e,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                T.includes("preview") ? /* @__PURE__ */ t.jsx(
                  we,
                  {
                    active: N === "preview",
                    label: w("workspace.preview"),
                    children: /* @__PURE__ */ t.jsx(to, {})
                  }
                ) : null
              ] })
            ]
          }
        )
      ]
    }
  );
}
const Eo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ao
}, Symbol.toStringTag, { value: "Module" }));
export {
  Oe as C,
  nn as I,
  Eo as W,
  Io as b,
  it as e,
  So as g,
  _o as m
};
