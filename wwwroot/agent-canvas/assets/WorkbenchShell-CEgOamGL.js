import { aT as fe, e6 as U, S as i, dW as $, dX as bt, cU as ge, c5 as ft, cV as gt, cr as kt, ef as vt, cq as Pe, c6 as yt, ci as t, aL as u, l as re, bz as wt, d$ as jt, b as Nt, K as Ct, O as St, a0 as _t, J as Ke, a8 as W, I as qe, bT as Ve, z as He, M as Et, L as It, k as Xe, r as Pt, e7 as z, a3 as Mt, a1 as ie, a4 as ae, a2 as ce, s as At, cj as ee, e0 as ne, dg as _e, cb as Tt, bd as Lt, u as Je, cw as zt, dJ as Bt, ax as Ye, cc as Dt, bg as Rt, ad as Me, bi as Ae, o as Qe, cN as Te, x as Gt, q as Wt, t as $t, p as Ot, cg as Ft, a7 as Ut } from "./agentStudioMount-CnF6gUyG.js";
import { I as Kt } from "./IconDownload-jpogXoH4.js";
import { I as Ee, a as he } from "./IconChevronRight-DCt05yYU.js";
import { I as qt } from "./IconListCheck-B4txLOw4.js";
import { I as Ze } from "./IconMap-DtjCL6cN.js";
import { u as Vt } from "./journeyTourActivity-B6o9LFnz.js";
import { D as et, r as we, d as je } from "./guidedProductionEvents-YDIMkHsY.js";
import { I as Ne, a as Le } from "./IconStack2-DQhcVido.js";
import { I as Ht } from "./IconBooks-BSO4uFWd.js";
import { I as Xt } from "./IconBulb-DyS7I3r4.js";
import { b as Jt, I as Yt, a as Qt } from "./IconFolder-DSyUkPWB.js";
import { I as tt } from "./IconLayoutSidebarLeftExpand-0pZ3DuOE.js";
import { I as Ce } from "./IconArrowRight-C-3QiUlA.js";
import { g as ue } from "./generationCanvasTools-izM_aYuS.js";
import { a as Zt, r as en } from "./batchPlanPreview-Uz3m1LML.js";
import { I as tn } from "./IconArrowLeft-BgnVgqai.js";
import { u as J, d as Se, p as nn } from "./productionDirectorUiStore-BzLvs5Tz.js";
const on = [["path", { d: "M15 6l-6 6l6 6", key: "svg-0" }]], rn = fe("outline", "chevron-left", "ChevronLeft", on);
const sn = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], ze = fe("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", sn);
const an = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], cn = fe("outline", "tags", "Tags", an);
const ln = [["path", { d: "M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5", key: "svg-0" }]], dn = fe("outline", "tool", "Tool", ln), X = ["model", "storyboard", "generated", "exported"];
function nt() {
  const { t: e } = U(), n = i.useMemo(
    () => [
      { key: "model", label: e("onboarding.steps.model.label"), hint: e("onboarding.steps.model.hint") },
      { key: "storyboard", label: e("onboarding.steps.storyboard.label"), hint: e("onboarding.steps.storyboard.hint") },
      { key: "generated", label: e("onboarding.steps.generated.label"), hint: e("onboarding.steps.generated.hint") },
      { key: "exported", label: e("onboarding.steps.exported.label"), hint: e("onboarding.steps.exported.hint") }
    ],
    [e]
  ), o = $((x) => x.nodes), { hasTextModel: a } = bt(), h = Vt(), c = i.useMemo(
    () => ({
      model: a === !0,
      storyboard: o.length > 0,
      generated: o.some((x) => x.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [a, o]
  ), [f, s] = i.useState(() => ge()), [w, j] = i.useState(() => ft()), [y, S] = i.useState(() => !gt()), L = i.useRef(null), [_, N] = i.useState(null);
  i.useEffect(() => {
    let x = !1;
    for (const E of X)
      c[E] && !f[E] && (kt(E), x = !0);
    x && s(ge());
  }, [c, f]), i.useEffect(() => {
    const x = () => s(ge());
    return window.addEventListener("storage", x), window.addEventListener("focus", x), () => {
      window.removeEventListener("storage", x), window.removeEventListener("focus", x);
    };
  }, []);
  const v = i.useMemo(
    () => ({
      model: f.model || c.model,
      storyboard: f.storyboard || c.storyboard,
      generated: f.generated || c.generated,
      exported: f.exported || c.exported
    }),
    [f, c]
  ), r = X.filter((x) => v[x]).length, p = r === X.length, k = n.find((x) => !v[x.key])?.key ?? null, d = i.useCallback(() => {
    const x = L.current;
    if (!x) return;
    const E = x.getBoundingClientRect();
    N({ top: E.bottom + 8, right: Math.max(8, window.innerWidth - E.right) });
  }, []);
  i.useEffect(() => {
    if (y)
      return d(), window.addEventListener("resize", d), () => window.removeEventListener("resize", d);
  }, [y, d]), i.useEffect(() => {
    if (!y) return;
    const x = (E) => {
      const C = E.target;
      C && C.closest("[data-onboarding-checklist-root]") || S(!1);
    };
    return window.addEventListener("pointerdown", x, !0), () => window.removeEventListener("pointerdown", x, !0);
  }, [y]);
  const I = i.useCallback(() => {
    S((x) => {
      const E = !x;
      return vt(!E), E;
    });
  }, []), T = i.useCallback(() => {
    Pe(), j(!0);
  }, []);
  return i.useEffect(() => {
    w || p || yt(Date.now()) && (Pe(), j(!0));
  }, [w, p]), p || h || w ? null : /* @__PURE__ */ t.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ t.jsxs(
      "button",
      {
        type: "button",
        ref: L,
        onClick: I,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": e("onboarding.progressLabel", { done: r, total: X.length }),
        "aria-expanded": y,
        className: u(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          y && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ t.jsx(qt, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ t.jsx("span", { className: "max-[700px]:hidden", children: e("onboarding.trigger") }),
          /* @__PURE__ */ t.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            r,
            "/",
            X.length
          ] })
        ]
      }
    ),
    y && _ ? /* @__PURE__ */ t.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": e("onboarding.panelLabel"),
        style: { top: _.top, right: _.right },
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
              X.length
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
                children: /* @__PURE__ */ t.jsx(Ee, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(et, { value: r / X.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ t.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((x) => {
            const E = v[x.key], C = !E && x.key === k;
            return /* @__PURE__ */ t.jsx(
              "li",
              {
                "data-step": x.key,
                "data-done": E ? "true" : "false",
                className: u("flex flex-col gap-1.5 p-2 rounded-nomi-sm", C && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ t.jsx(
                    "span",
                    {
                      className: u(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        E ? "bg-nomi-accent text-nomi-paper" : C ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: E ? /* @__PURE__ */ t.jsx(re, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ t.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ t.jsx(
                      "span",
                      {
                        className: u(
                          "block text-body-sm font-medium leading-snug",
                          E ? "text-nomi-ink-40" : C ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: x.label
                      }
                    ),
                    E ? null : /* @__PURE__ */ t.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: x.hint })
                  ] })
                ] })
              },
              x.key
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
                  /* @__PURE__ */ t.jsx(Ze, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  e("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: T,
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
const mn = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, Y = mn;
function pn(e, n) {
  switch (n.type) {
    case "checking":
      return { ...Y, phase: "checking" };
    case "up-to-date":
      return { ...Y, phase: "up-to-date" };
    case "available":
      return { ...Y, phase: "available", latestVersion: n.version, notes: n.notes };
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
function un() {
  const n = wt()?.update, o = !!n, [a, h] = i.useState(null), [c, f] = i.useState(Y);
  i.useEffect(() => {
    let _ = !0;
    n?.appInfo().then((v) => {
      _ && h(v);
    }).catch(() => {
    });
    const N = n?.onEvent((v) => f((r) => pn(r, v)));
    return () => {
      _ = !1, N?.();
    };
  }, [n]), i.useEffect(() => {
    if (c.phase !== "up-to-date") return;
    const _ = window.setTimeout(() => f(Y), 2500);
    return () => window.clearTimeout(_);
  }, [c.phase]);
  const s = i.useCallback(() => {
    f({ ...Y, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), w = i.useCallback(() => {
    f((_) => ({ ..._, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), j = i.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), y = i.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), S = i.useCallback(() => f(Y), []), L = a?.canAutoInstall ?? !0;
  return {
    phase: c.phase,
    appInfo: a,
    latestVersion: c.latestVersion,
    notes: c.notes,
    percent: c.percent,
    errorMessage: c.errorMessage,
    supported: o,
    canAutoInstall: L,
    check: s,
    download: w,
    install: j,
    openRelease: y,
    reset: S
  };
}
const hn = 360, Be = 12;
function xn(e) {
  return e ? `${e.platform === "win32" ? "Windows" : e.platform === "darwin" ? "macOS" : e.platform} · ${e.arch}` : "";
}
function ot({ anchorEl: e, onClose: n }) {
  const { t: o } = U(), a = un(), { isDark: h } = jt(), [c, f] = i.useState(null);
  return i.useLayoutEffect(() => {
    if (!e) return;
    const s = () => {
      const w = e.getBoundingClientRect(), j = Math.min(w.left, window.innerWidth - hn - Be), y = w.bottom + 8;
      f({ top: y, left: Math.max(Be, j) });
    };
    return s(), window.addEventListener("resize", s), window.addEventListener("scroll", s, !0), () => {
      window.removeEventListener("resize", s), window.removeEventListener("scroll", s, !0);
    };
  }, [e]), i.useEffect(() => {
    const s = (w) => {
      w.key === "Escape" && n();
    };
    return window.addEventListener("keydown", s), () => window.removeEventListener("keydown", s);
  }, [n]), /* @__PURE__ */ t.jsxs(Nt, { children: [
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
        style: { top: c?.top ?? -9999, left: c?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (s) => s.stopPropagation(),
        children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ t.jsx(Ct, { size: 40 }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx(St, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ t.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: a.appInfo?.version ?? "…" }),
                a.appInfo ? ` · ${xn(a.appInfo)}` : ""
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
                /* @__PURE__ */ t.jsx(Ze, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
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
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(h ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ t.jsx(_t, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: a.supported ? /* @__PURE__ */ t.jsx(bn, { updater: a }) : /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function bn({ updater: e }) {
  const { t: n } = U(), { phase: o } = e;
  return o === "checking" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ t.jsx(Ke, { size: 16, label: n("about.checking") }),
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
        /* @__PURE__ */ t.jsx(W, { variant: "default", onClick: e.reset, children: n("common.later") }),
        e.canAutoInstall ? /* @__PURE__ */ t.jsx(W, { variant: "primary", onClick: e.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ t.jsx(W, { variant: "primary", onClick: e.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    e.canAutoInstall ? null : /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    e.notes ? /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: e.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ t.jsx(et, { value: e.percent, size: "sm" }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: e.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ t.jsx(Ne, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ t.jsx(W, { variant: "default", onClick: e.reset, children: n("common.later") }),
      /* @__PURE__ */ t.jsx(W, { variant: "primary", onClick: e.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ t.jsx(qe, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ t.jsx("span", { className: "min-w-0 break-words", children: e.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ t.jsx(W, { variant: "default", onClick: e.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ t.jsx(W, { variant: "primary", onClick: e.check, children: n("about.checkUpdate") })
  ] });
}
const de = window.nomiDesktop?.platform === "win32";
function fn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function gn({
  workspaceMode: e,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: a,
  onOpenModelCatalog: h,
  onRenameProject: c,
  directorMode: f = !1
}) {
  const { t: s } = U(), [w, j] = i.useState(!1), [y, S] = i.useState(o || s("appBar.untitledProject")), [L, _] = i.useState(!1), N = i.useRef(null);
  i.useEffect(() => {
    !w && o && S(o);
  }, [o, w]);
  const v = i.useCallback(() => {
    S((p) => {
      const k = p.trim() || s("appBar.untitledProject");
      return c?.(k), k;
    }), j(!1);
  }, [c, s]), r = i.useCallback(() => {
    h?.();
  }, [h]);
  return /* @__PURE__ */ t.jsxs(
    "header",
    {
      className: u(
        "nomi-appbar",
        de && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": s("appBar.workspace"),
      "data-director-mode": f ? "true" : void 0,
      onDoubleClick: Ve,
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
              de ? null : /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    ref: N,
                    type: "button",
                    className: u(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": s("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": L,
                    onClick: () => _((p) => !p),
                    children: /* @__PURE__ */ t.jsx(He, {})
                  }
                ),
                L ? /* @__PURE__ */ t.jsx(ot, { anchorEl: N.current, onClose: () => _(!1) }) : null,
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
                  "aria-label": s("appBar.locationNavigation"),
                  children: [
                    a ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                      /* @__PURE__ */ t.jsx(
                        W,
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
                          "aria-label": s("appBar.backToLibrary"),
                          onClick: a,
                          children: s("appBar.projectLibrary")
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
                        value: y,
                        autoFocus: !0,
                        "aria-label": s("appBar.projectName"),
                        onBlur: v,
                        onChange: (p) => S(p.currentTarget.value),
                        onKeyDown: (p) => {
                          p.key === "Enter" && v(), p.key === "Escape" && j(!1);
                        }
                      }
                    ) : /* @__PURE__ */ t.jsx(
                      W,
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
                        title: y,
                        onClick: () => j(!0),
                        children: y
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ t.jsx("div", { className: "app-no-drag", children: f ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "inline-flex h-8 items-center gap-2 rounded-full border border-nomi-line px-3",
              "bg-nomi-ink-05 text-caption font-semibold text-nomi-ink-70",
              "max-[700px]:hidden"
            ),
            "aria-label": s("generationCommon.director.modeAria"),
            children: [
              /* @__PURE__ */ t.jsx("span", { className: "size-1.5 rounded-full bg-nomi-accent", "aria-hidden": "true" }),
              s("generationCommon.director.modeTitle")
            ]
          }
        ) : /* @__PURE__ */ t.jsx(Et, { value: e, onChange: n }) }),
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
            "aria-label": s("appBar.globalActions"),
            children: [
              /* @__PURE__ */ t.jsx(It, { className: "size-[30px]" }),
              !de && !f ? /* @__PURE__ */ t.jsx(nt, {}) : null,
              !de && !f ? /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs(
                W,
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
                  "aria-label": s("appBar.openBrowser"),
                  title: s("appBar.browser"),
                  onClick: fn,
                  children: [
                    /* @__PURE__ */ t.jsx(Xe, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.browser") })
                  ]
                }
              ) }) : null,
              /* @__PURE__ */ t.jsxs(
                W,
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
                  "aria-label": s("appBar.openModelAccess"),
                  title: s("appBar.modelAccess"),
                  onClick: r,
                  children: [
                    /* @__PURE__ */ t.jsx(Pt, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ t.jsxs(
                W,
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
                  "aria-label": s(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: s(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    e === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : n("preview");
                  },
                  children: [
                    /* @__PURE__ */ t.jsx(Kt, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: u("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.export") })
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
const kn = ee("i18n:sidebar.categoryPanel", () => import("./CategoryTree-DnVjIH0p.js")), vn = ee(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-B1uTxpkh.js").then((e) => ({
    default: e.PromptLibraryContent
  }))
), yn = ee(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-fvwPFiMA.js").then((e) => ({
    default: e.SkillLibraryContent
  }))
), wn = ee(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-BE1JqHc6.js").then((e) => ({
    default: e.AssetLibraryContent
  }))
), jn = 60, Nn = 300, Cn = 500, Sn = 60, _n = u(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), De = u(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Re = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", Ge = u(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function En(e, n) {
  return n(e === "categories" ? "sidebar.groups" : e === "prompt-library" ? "sidebar.promptLibrary" : e === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function In(e) {
  return e === "prompt-library" || e === "skill-library" || e === "asset-library";
}
function Pn({ categories: e, projectId: n = null }) {
  const { t: o } = U(), [a, h] = i.useState("asset-library"), [c, f] = i.useState(0), s = z((r) => r.sidebarCollapsed), w = z((r) => r.toggleSidebarCollapsed), j = z((r) => r.setSidebarCollapsed), y = i.useCallback(() => {
    h("categories"), j(!1), f((r) => r + 1);
  }, [j]), S = i.useCallback((r) => {
    if (!s && a === r) {
      j(!0);
      return;
    }
    h(r), j(!1);
  }, [s, j, a]);
  i.useEffect(() => {
    const r = () => {
      h("asset-library"), j(!1);
    };
    return window.addEventListener("nomi-open-files-panel", r), () => window.removeEventListener("nomi-open-files-panel", r);
  }, [j]);
  const L = i.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: Jt
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: cn
      }
    ],
    [o]
  ), _ = i.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: Xt
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: Ht
      }
    ],
    [o]
  ), N = En(a, o), v = In(a) ? Cn : Nn;
  return /* @__PURE__ */ t.jsx(
    "aside",
    {
      "data-collapsed": s ? "true" : "false",
      className: u(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: s ? jn : v },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ t.jsxs(Mt, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: Sn },
            children: [
              /* @__PURE__ */ t.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                L.map((r) => {
                  const p = r.icon, k = a === r.id;
                  return /* @__PURE__ */ t.jsxs(ie, { children: [
                    /* @__PURE__ */ t.jsx(ae, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: u(De, k && Re),
                        "aria-label": r.label,
                        "aria-pressed": k,
                        onClick: () => S(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(p, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(ce, { side: "right", children: r.label })
                  ] }, r.id);
                }),
                /* @__PURE__ */ t.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                _.map((r) => {
                  const p = r.icon, k = a === r.id;
                  return /* @__PURE__ */ t.jsxs(ie, { children: [
                    /* @__PURE__ */ t.jsx(ae, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: u(De, k && Re),
                        "aria-label": r.label,
                        "aria-pressed": k,
                        onClick: () => S(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(p, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(ce, { side: "right", children: r.label })
                  ] }, r.id);
                })
              ] }),
              /* @__PURE__ */ t.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ t.jsxs(ie, { children: [
                /* @__PURE__ */ t.jsx(ae, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: w,
                    className: _n,
                    "aria-label": o(s ? "sidebar.expand" : "sidebar.collapse"),
                    children: s ? /* @__PURE__ */ t.jsx(tt, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ t.jsx(ze, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ t.jsx(ce, { side: "right", children: o(s ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        s ? null : /* @__PURE__ */ t.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": N, children: /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ t.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: N }),
            a === "categories" ? /* @__PURE__ */ t.jsxs(ie, { children: [
              /* @__PURE__ */ t.jsx(ae, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: y,
                  className: Ge,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ t.jsx(At, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(ce, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ t.jsxs(ie, { children: [
              /* @__PURE__ */ t.jsx(ae, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: w,
                  className: Ge,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ t.jsx(ze, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(ce, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          a === "categories" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(kn, { categories: e, createCategoryNonce: c }) }) : a === "prompt-library" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(vn, { active: !0, compact: !0, showHeader: !1 }) }) : a === "skill-library" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(yn, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(wn, { projectId: n, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const We = [
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
function Bo(e) {
  return We.find((n) => n.id === e) || We[0];
}
function Do(e) {
  return !e.chatOnly;
}
function rt(e) {
  return st(e?.contentJson).trim();
}
function st(e) {
  if (!e || typeof e != "object") return "";
  const n = e, o = typeof n.text == "string" ? n.text : "", a = Array.isArray(n.content) ? n.content.map(st).filter(Boolean).join(`
`) : "";
  return [o, a].filter(Boolean).join(o && a ? `
` : "");
}
function Ro(e) {
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
const Mn = "nomi:focus-source-editor";
let xe = !1;
function An() {
  xe = !0, typeof window < "u" && window.dispatchEvent(new Event(Mn));
}
function Go() {
  return xe;
}
function Wo() {
  return xe ? (xe = !1, !0) : !1;
}
const Tn = [
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
function it(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function Q(e, n) {
  return n.test(it(e));
}
function Ln(e) {
  return e.meta?.referenceSheet === !0;
}
function zn(e) {
  return Ln(e) ? !1 : e.kind === "shot" ? !0 : e.kind !== "image" || e.meta?.storyboardKeyframe === !0 || e.meta?.workflowStage === "keyframe" || Q(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof e.shotIndex == "number" || Q(e, /镜头|分镜|shot/);
}
function q(e, n) {
  return e.result?.type === n || e.history?.some((o) => o.type === n) === !0;
}
function Bn(e, n) {
  switch (n) {
    case "style":
      return Q(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || e.meta?.workflowStage === "style";
    case "character":
      return e.kind === "character" || Q(e, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || e.meta?.workflowStage === "character";
    case "scene":
      return e.kind === "scene" || Q(e, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || e.meta?.workflowStage === "scene";
    case "storyboard":
      return zn(e);
    case "keyframe":
      return e.kind === "keyframe" || e.meta?.storyboardKeyframe === !0 || Q(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || e.meta?.workflowStage === "keyframe";
    case "video":
      return e.kind === "video";
  }
}
function V(e, n) {
  if (!Bn(e, n)) return !1;
  const o = n === "video" ? "video" : "image";
  return !!e.prompt?.trim() || q(e, o);
}
function Dn(e, n) {
  const o = e === "video" ? "video" : "image";
  return n.filter((a) => V(a, e) && !q(a, o) && a.status !== "queued" && a.status !== "running");
}
function $e(e, n) {
  const o = it(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof e.shotIndex == "number" ? `shot-${e.shotIndex}` : `position-${n + 1}`;
}
function me(e, n, o = () => !0) {
  const a = new Set(
    n.filter(o).map((h, c) => $e(h, c))
  );
  return new Set(
    e.map((h, c) => $e(h, c)).filter((h) => a.has(h))
  ).size;
}
function Rn(e) {
  const n = e.documentText.trim(), o = n.length >= 4, a = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, h = e.nodes.filter((b) => V(b, "style")), c = e.nodes.filter((b) => V(b, "character")), f = e.nodes.filter((b) => V(b, "scene")), s = e.nodes.filter((b) => V(b, "storyboard")), w = e.nodes.filter(
    (b) => Q(b, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || b.meta?.cameraMoveAutoCapture !== void 0 || b.meta?.cameraMovePromptApplied !== void 0 || b.meta?.workflowStage === "motion"
  ), j = e.nodes.filter((b) => V(b, "keyframe")), y = e.nodes.filter((b) => V(b, "video")), S = s.length, L = h.filter((b) => q(b, "image")).length, _ = c.filter((b) => q(b, "image")).length, N = f.filter((b) => q(b, "image")).length, v = s.filter((b) => q(b, "image")).length, r = me(
    s,
    j,
    (b) => q(b, "image")
  ), p = me(
    s,
    y,
    (b) => q(b, "video")
  ), k = me(s, w), d = h.length > 0 && L > 0, I = c.length > 0 && _ === c.length, T = f.length > 0 && N === f.length, x = S > 0 && v === S, E = S > 0 && k === S, C = S > 0 && r === S, A = y.length > 0, P = S > 0 && p === S, O = new Set(e.timelineSourceNodeIds), D = me(
    s,
    y,
    (b) => q(b, "video") && O.has(b.id)
  ), G = S > 0 && P && D === S, l = {
    style: h.length > 0,
    character: c.length > 0,
    scene: f.length > 0,
    storyboard: s.length > 0,
    keyframe: j.length > 0,
    video: y.length > 0
  }, B = {
    style: L,
    character: _,
    scene: N,
    storyboard: v,
    keyframe: r,
    video: p
  }, R = {
    idea: o,
    script: a,
    style: d,
    character: I,
    scene: T,
    storyboard: x,
    motion: E,
    keyframe: C,
    video: P,
    review: G
  }, g = Tn.map((b) => ({
    ...b,
    complete: R[b.id]
  })), m = g.findIndex((b) => !b.complete), M = m >= 0 ? m : g.length - 1;
  return {
    stages: g,
    current: g[M],
    currentIndex: M,
    completedCount: g.filter((b) => b.complete).length,
    hasVideoNodes: A,
    hasGeneratedVideo: P,
    shotCount: S,
    plannedByStage: l,
    generatedCountByStage: B
  };
}
function Gn(e) {
  return String(e.title || "").toLocaleLowerCase();
}
function at(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function F(e, n) {
  return n.test(Gn(e));
}
function H(e) {
  return String(e.meta?.workflowStage || "").toLocaleLowerCase();
}
function ct(e) {
  return H(e) === "story" || F(e, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function lt(e) {
  return H(e) === "script" || F(e, /剧本|分场|script|screenplay/);
}
function Wn(e) {
  return H(e) === "style" || F(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function $n(e) {
  return e.kind === "character" || H(e) === "character" || F(e, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function On(e) {
  return e.kind === "scene" || H(e) === "scene" || F(e, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function Fn(e) {
  return e.kind === "keyframe" || H(e) === "keyframe" || e.meta?.storyboardKeyframe === !0 || F(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function Un(e) {
  return e.kind === "video" && (H(e) === "video" || F(e, /镜头|shot|视频/));
}
function Kn(e) {
  return H(e) === "motion" || F(e, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function qn(e) {
  return V(e, "storyboard");
}
function be(e) {
  const n = at(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof e.shotIndex == "number" ? e.shotIndex : null;
}
function pe(e) {
  return [...e].sort((n, o) => {
    const a = be(n) ?? Number.MAX_SAFE_INTEGER, h = be(o) ?? Number.MAX_SAFE_INTEGER;
    return a !== h ? a - h : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function ke(e, n, o) {
  const a = be(n);
  if (a !== null) {
    const h = e.filter((c) => be(c) === a);
    if (h.length) return h;
  }
  return e[o] ? [e[o]] : [];
}
function Oe(e, n) {
  if (e.length <= 1) return e;
  const o = at(n), a = e.filter((h) => h.title.split(/[｜|·：:\s]/).map((f) => f.trim()).filter((f) => f.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(f)).some((f) => o.includes(f.toLocaleLowerCase())));
  return a.length ? a : e;
}
function Fe(e, n, o) {
  const a = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), h = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return e.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${a}\\s*\\n([\\s\\S]*?)${h}`, "i"))?.[1]?.trim() || "";
}
function Vn(e, n) {
  const o = [];
  if (!n.some(ct)) {
    const a = Fe(e, "故事设定", "剧本");
    a && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: a,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(lt)) {
    const a = Fe(e, "剧本");
    a && o.push({
      kind: "text",
      title: "剧本｜制作稿",
      prompt: a,
      position: { x: 420, y: 40 },
      meta: { workflowStage: "script" }
    });
  }
  return o;
}
function Hn(e, n) {
  const o = e.filter(ct), a = e.filter(lt), h = e.filter(Wn), c = h.filter((r) => r.kind !== "text"), f = e.filter($n), s = e.filter(On), w = pe(e.filter(qn)), j = pe(e.filter(Kn)), y = pe(e.filter(Fn)), S = pe(e.filter(Un)), L = [], _ = new Set(n.map((r) => `${r.source}:${r.target}:${r.mode || "reference"}`)), N = (r, p, k = "reference") => {
    if (!r || !p || r.id === p.id) return;
    const d = `${r.id}:${p.id}:${k}`;
    _.has(d) || (_.add(d), L.push({ source: r.id, target: p.id, mode: k }));
  };
  o.forEach((r) => a.forEach((p) => N(r, p))), a.forEach((r) => {
    f.forEach((p) => N(r, p)), s.forEach((p) => N(r, p)), w.forEach((p) => N(r, p));
  }), h.filter((r) => r.kind === "text").forEach((r) => {
    c.forEach((p) => N(r, p));
  });
  const v = c[0];
  return v && (f.forEach((r) => N(v, r, "style_ref")), s.forEach((r) => N(v, r, "style_ref")), y.forEach((r) => N(v, r, "style_ref"))), y.forEach((r, p) => {
    Oe(f, r).forEach((k) => N(k, r, "character_ref")), Oe(s, r).forEach((k) => N(k, r, "composition_ref")), ke(w, r, p).forEach((k) => N(k, r, "composition_ref"));
  }), S.forEach((r, p) => {
    const k = ke(y, r, p), d = k.find((T) => !F(T, /尾帧|last\s*frame/)) || k[0], I = k.find((T) => F(T, /尾帧|last\s*frame/));
    N(d, r, "first_frame"), N(I, r, "last_frame"), ke(j, r, p).forEach((T) => N(T, r));
  }), L;
}
function Z(e, n = !1) {
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
function dt(e) {
  const n = e.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function mt(e) {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "当前文稿已经完整附在下面，不要再说“我先读取”，直接根据它扩写成能生产的短剧剧本。",
    "本轮必须调用 append_to_end，把最终剧本放在 args.content 中写回文稿；不要只在聊天里解释、承诺或复述步骤。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。",
    "",
    "当前文稿：",
    dt(e)
  ].join(`
`);
}
function pt(e, n) {
  const a = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    dt(n),
    ""
  ], h = {
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
  return [...a, ...h[e]].join(`
`);
}
function Xn(e) {
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
  }, a = e === "video" ? "视频" : "图片";
  return [
    `读取当前画布，${n[e]}。`,
    `先${o[e]}。`,
    `然后调用一次 run_generation_batch 启动这些${a}节点的真实生成。这个调用会花费额度，必须让用户看到并确认额度操作；不要创建重复节点，也不要生成其他阶段的资产。`
  ].join(`
`);
}
const Jn = /* @__PURE__ */ new Set([
  "style",
  "character",
  "scene",
  "storyboard",
  "keyframe",
  "video"
]);
function Yn(e) {
  return Jn.has(e);
}
function Qn(e, n) {
  const o = e.currentStageId;
  return e.allComplete || o === "review" ? (n.review(), "review") : o === "idea" ? (n.setWorkspaceMode("creation"), n.openCreationAssistant(), n.focusSourceEditor(), "idea") : o === "script" ? (n.setWorkspaceMode("creation"), n.openCreationAssistant(), n.requestCreation({
    action: "send",
    prompt: mt(e.documentText),
    modeId: "script",
    displayMessage: e.translate("guidedProduction.stage.script.displayMessage"),
    autoApproveWrites: !0,
    employeeKey: Z("script"),
    requiredTool: "append_to_end"
  }), "script") : e.currentNeedsGeneration && Yn(o) ? e.generationBlocked ? "blocked" : (n.setWorkspaceMode("generation"), n.startGeneration(o), "start-generation") : o === "storyboard" ? e.storyboardPlanExists && !e.storyboardPlanCommitted ? (n.setWorkspaceMode("creation"), n.openCreationAssistant(), n.openStoryboardEditor(), "review-storyboard") : (n.setWorkspaceMode("creation"), n.openCreationAssistant(), n.requestCreation({
    action: "storyboard",
    displayMessage: e.translate("guidedProduction.stage.storyboard.displayMessage"),
    shotMode: "image",
    employeeKey: Z("storyboard"),
    requiredTool: "propose_storyboard_plan"
  }), "plan-storyboard") : (n.setWorkspaceMode("generation"), n.openCanvasAssistant(), o === "style" && n.ensureNarrativeNodes(), n.requestCanvas({
    prompt: pt(o, e.documentText),
    displayMessage: e.translate(`guidedProduction.stage.${o}.displayMessage`),
    autoApproveSafeWrites: !0,
    employeeKey: Z(o),
    requiredTool: "create_canvas_nodes"
  }), "plan-canvas");
}
async function Zn(e, n) {
  if (e.lock.current) return !1;
  const o = Dn(e.stageId, e.nodes), a = Zt(o.map((c) => c.id), { nodes: e.nodes, edges: e.edges }), h = a.waves.flat();
  if (h.length === 0)
    return await n.runPlan(a), !1;
  e.lock.current = !0, n.setStarting(!0);
  try {
    const c = await n.mintGrant(h);
    return await n.runPlan(a, c), !0;
  } catch (c) {
    return n.authorizationFailed(c), !1;
  } finally {
    e.lock.current = !1, n.setStarting(!1);
  }
}
function eo(e, n) {
  let o = e.initialFrame, a = 0;
  const h = e.nodes.filter((c) => c.kind === "video" && (c.status === "success" || c.result?.type === "video")).filter((c) => !e.existingSourceIds.has(c.id)).sort((c, f) => (c.shotIndex ?? Number.MAX_SAFE_INTEGER) - (f.shotIndex ?? Number.MAX_SAFE_INTEGER));
  for (const c of h) {
    const f = n(c.id, o);
    f.ok && (a += 1, typeof f.endFrame == "number" && (o = f.endFrame));
  }
  return a;
}
function te(e, n) {
  return `guidedProduction.stage.${e}.${n}`;
}
function to(e) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(e);
}
function no() {
  const { t: e } = U(), [n, o] = i.useState(!1), [a, h] = i.useState(!1), c = i.useRef(!1), f = z((m) => m.workbenchDocument), s = z((m) => m.storyboardPlan), w = z((m) => m.storyboardPlanCommitted), j = z((m) => m.timeline), y = z((m) => m.setWorkspaceMode), S = z((m) => m.setStoryboardEditorOpen), L = z((m) => m.setCreationAiCollapsed), _ = $((m) => m.setGenerationAiCollapsed), N = $((m) => m.nodes), v = $((m) => m.edges), r = ne((m) => m.activeScope), p = i.useMemo(
    () => _e(N, r),
    [N, r]
  ), k = i.useMemo(
    () => N.filter((m) => Tt(m, p)),
    [p, N]
  ), d = i.useMemo(() => new Set(k.map((m) => m.id)), [k]), I = i.useMemo(
    () => v.filter((m) => d.has(m.source) && d.has(m.target)),
    [v, d]
  ), T = i.useMemo(
    () => Lt(j, N, p),
    [p, N, j]
  ), x = i.useMemo(
    () => rt(f),
    [f]
  ), E = i.useMemo(
    () => T.tracks.flatMap((m) => m.clips.map((M) => M.sourceNodeId)),
    [T.tracks]
  ), C = i.useMemo(
    () => Rn({
      documentText: x,
      nodes: k,
      timelineSourceNodeIds: E
    }),
    [x, k, s, w, E]
  ), A = C.current, P = C.completedCount === C.stages.length, O = to(A.id) ? A.id : null, D = O !== null && C.plannedByStage[O] && !A.complete, G = O !== null && k.some(
    (m) => V(m, O) && (m.status === "queued" || m.status === "running")
  );
  i.useEffect(() => {
    const m = Hn(k, I);
    if (!m.length) return;
    const M = $.getState();
    m.forEach((b) => M.connectNodes(b.source, b.target, b.mode));
  }, [I, k]);
  const l = P ? e("guidedProduction.completeAction") : D && G ? e("guidedProduction.generationInProgress") : D && a ? e("guidedProduction.startingGeneration") : A.id === "storyboard" && s && !w ? e("guidedProduction.reviewStoryboardAction") : e(D ? te(A.id, "generateAction") : te(A.id, "action")), B = i.useCallback(() => {
    const m = $.getState(), M = z.getState(), b = new Set(
      M.timeline.tracks.flatMap((K) => K.clips.map((se) => se.sourceNodeId))
    ), ut = new Set(ue.read_canvas().nodes.map((K) => K.id)), ht = m.nodes.filter((K) => ut.has(K.id)), xt = Math.max(
      0,
      ...M.timeline.tracks.flatMap((K) => K.clips.map((se) => se.endFrame))
    );
    eo(
      { nodes: ht, existingSourceIds: b, initialFrame: xt },
      (K, se) => {
        const Ie = ue.send_to_timeline(K, { startFrame: se });
        return Ie.ok ? { ok: !0, endFrame: Ie.clip.endFrame } : { ok: !1 };
      }
    ), y("preview");
  }, [y]), R = i.useCallback(async (m) => {
    await Zn(
      { stageId: m, nodes: k, edges: I, lock: c },
      {
        mintGrant: zt,
        runPlan: en,
        setStarting: h,
        authorizationFailed: (M) => {
          Bt(
            M instanceof Error && M.message ? M.message : e("guidedProduction.authorizationFailed"),
            "error"
          );
        }
      }
    );
  }, [I, k, e]), g = i.useCallback(() => {
    Qn(
      {
        currentStageId: A.id,
        allComplete: P,
        currentNeedsGeneration: D,
        generationBlocked: c.current || G,
        storyboardPlanExists: !!s,
        storyboardPlanCommitted: w,
        documentText: x,
        translate: (m) => e(m)
      },
      {
        setWorkspaceMode: y,
        openCreationAssistant: () => L(!1),
        focusSourceEditor: An,
        openCanvasAssistant: () => _(!1),
        openStoryboardEditor: () => S(!0),
        ensureNarrativeNodes: () => {
          const m = Vn(
            x,
            $.getState().nodes
          );
          m.length && ue.create_nodes(m);
        },
        requestCreation: je,
        requestCanvas: we,
        startGeneration: (m) => {
          R(m);
        },
        review: B
      }
    );
  }, [
    P,
    A.id,
    G,
    x,
    B,
    D,
    L,
    _,
    S,
    y,
    R,
    s,
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
          /* @__PURE__ */ t.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: P ? /* @__PURE__ */ t.jsx(re, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ t.jsx(Je, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: P ? e("guidedProduction.complete") : e("guidedProduction.step", {
                current: C.currentIndex + 1,
                total: C.stages.length
              }) }),
              /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: e(P ? "guidedProduction.completeTitle" : te(A.id, "title")) }),
              P ? null : /* @__PURE__ */ t.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: e(te(A.id, "owner")) })
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: e(P ? "guidedProduction.completeDescription" : te(A.id, "description")) })
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
              onClick: g,
              disabled: D && (a || G),
              children: [
                l,
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
              onClick: () => o((m) => !m),
              children: n ? /* @__PURE__ */ t.jsx(Yt, { size: 16 }) : /* @__PURE__ */ t.jsx(Ee, { size: 16 })
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
                  completed: C.completedCount,
                  total: C.stages.length
                }) })
              ] }),
              /* @__PURE__ */ t.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: C.stages.map((m, M) => {
                const b = !P && m.id === A.id;
                return /* @__PURE__ */ t.jsxs(
                  "li",
                  {
                    className: u(
                      "min-w-0 rounded-nomi border p-2.5",
                      m.complete ? "border-transparent bg-nomi-ink-05" : b ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ t.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        m.complete ? /* @__PURE__ */ t.jsx(re, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ t.jsx(Qt, { size: 10, className: u("mx-0.5 shrink-0", b ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro text-nomi-ink-40", children: e("guidedProduction.shortStep", { current: M + 1 }) })
                      ] }),
                      /* @__PURE__ */ t.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: e(te(m.id, "title")) })
                    ]
                  },
                  m.id
                );
              }) })
            ]
          }
        ) : null
      ]
    }
  );
}
function oe(e, n) {
  return e(`generationCommon.director.stages.${n}.title`);
}
function le(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.globalScope") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : e("generationCommon.director.noShotSelected");
}
function oo(e, n) {
  const o = n.current;
  return n.complete ? e("generationCommon.director.nextIncomplete") : o.id === "review" ? e("generationCommon.director.reviewAction") : o.running ? e("generationCommon.director.runningAction", { stage: oe(e, o.id) }) : o.id === "script" ? e("generationCommon.director.scriptAction") : o.id === "storyboard" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: oe(e, o.id) }) : e("generationCommon.director.storyboardAction") : o.id === "motion" ? e("generationCommon.director.motionAction") : o.id === "keyframe" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: oe(e, o.id) }) : e("generationCommon.director.keyframeAction") : o.planned ? e("generationCommon.director.videoGenerateAction") : e("generationCommon.director.videoAction");
}
function ro(e) {
  return e === "storyboard" || e === "keyframe" || e === "video";
}
function so({ projectName: e }) {
  const { t: n } = U(), o = $((l) => l.nodes), a = z((l) => l.timeline), h = z((l) => l.workbenchDocument), c = z((l) => l.setWorkspaceMode), f = z((l) => l.setActiveCategoryId), s = z((l) => l.setCreationAiCollapsed), w = $((l) => l.setGenerationAiCollapsed), j = ne((l) => l.activeScope), y = ne((l) => l.setActiveScope), S = J((l) => l.mode), L = J((l) => l.setMode), _ = J((l) => l.directoryOpen), N = J((l) => l.toggleDirectory), v = i.useMemo(() => Ye(o), [o]), r = i.useMemo(
    () => _e(o, j),
    [o, j]
  ), p = i.useMemo(
    () => o.filter((l) => Dt(l, r)),
    [r, o]
  ), k = i.useMemo(
    () => new Set(a.tracks.flatMap((l) => l.clips.map((B) => B.sourceNodeId))),
    [a.tracks]
  ), d = i.useMemo(
    () => Se({ nodes: p, timelineSourceNodeIds: k }),
    [p, k]
  ), I = i.useMemo(
    () => Rt(v, r),
    [r, v]
  ), T = i.useMemo(
    () => Me(v, r, -1),
    [r, v]
  ), x = i.useMemo(
    () => Me(v, r, 1),
    [r, v]
  ), E = i.useMemo(
    () => rt(h),
    [h]
  ), C = i.useCallback((l) => {
    f("shots"), y(l), c("generation");
  }, [f, y, c]), A = i.useCallback(() => {
    const l = Ae(v);
    if (!l.length) return null;
    const B = Math.max(-1, I?.absoluteIndex ?? -1), R = [...l.slice(B + 1), ...l.slice(0, B + 1)];
    for (const g of R) {
      const m = o.filter((b) => g.shot.nodeIds.includes(b.id));
      if (!Se({ nodes: m, timelineSourceNodeIds: k }).complete) return g.shot.scope;
    }
    return null;
  }, [o, v, I?.absoluteIndex, k]), P = i.useCallback(() => {
    const l = z.getState(), B = new Set(
      l.timeline.tracks.flatMap((M) => M.clips.map((b) => b.sourceNodeId))
    ), R = new Set(p.map((M) => M.id)), g = $.getState().nodes.filter((M) => R.has(M.id)).filter((M) => M.kind === "video" && (M.status === "success" || M.result?.type === "video")).filter((M) => !B.has(M.id));
    let m = Math.max(
      0,
      ...l.timeline.tracks.flatMap((M) => M.clips.map((b) => b.endFrame))
    );
    for (const M of g) {
      const b = ue.send_to_timeline(M.id, { startFrame: m });
      b.ok && (m = b.clip.endFrame);
    }
    window.dispatchEvent(new CustomEvent("nomi-set-timeline-expanded", { detail: { expanded: !0 } })), c("preview");
  }, [p, c]), O = i.useCallback(() => {
    if (r?.kind !== "shot") {
      const B = Ae(v)[0]?.shot;
      B && C(B.scope);
      return;
    }
    if (d.complete) {
      const B = A();
      B ? C(B) : c("preview");
      return;
    }
    const l = d.current;
    if (!l.running) {
      if (l.id === "review") {
        P();
        return;
      }
      if (l.id === "script") {
        c("creation"), s(!1), je({
          action: "send",
          prompt: mt(E),
          modeId: "script",
          displayMessage: n("generationCommon.director.scopeScriptMessage", { scope: le(n, r) }),
          autoApproveWrites: !0,
          employeeKey: Z("script"),
          requiredTool: "append_to_end"
        });
        return;
      }
      if (l.id === "storyboard" && !l.planned) {
        c("creation"), s(!1), je({
          action: "storyboard",
          displayMessage: n("generationCommon.director.scopeStoryboardMessage", { scope: le(n, r) }),
          shotMode: "image",
          employeeKey: Z("storyboard"),
          requiredTool: "propose_storyboard_plan"
        });
        return;
      }
      if (c("generation"), w(!1), l.planned && ro(l.id)) {
        we({
          prompt: Xn(l.id),
          displayMessage: n("generationCommon.director.scopeGenerateMessage", {
            scope: le(n, r),
            stage: oe(n, l.id)
          }),
          autoApproveSafeWrites: !0,
          employeeKey: Z(l.id, !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      (l.id === "motion" || l.id === "keyframe" || l.id === "video") && we({
        prompt: pt(l.id, E),
        displayMessage: n("generationCommon.director.scopeCreateMessage", {
          scope: le(n, r),
          stage: oe(n, l.id)
        }),
        autoApproveSafeWrites: !0,
        employeeKey: Z(l.id),
        requiredTool: "create_canvas_nodes"
      });
    }
  }, [
    r,
    E,
    A,
    v,
    d,
    C,
    P,
    s,
    w,
    c,
    n
  ]);
  if (!v.isProductionProject || !r) return null;
  const D = r.kind === "shot", G = Math.round(d.productionCompletedCount / d.productionStageCount * 100);
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
              _ ? "border-nomi-accent bg-nomi-accent-soft text-nomi-accent" : "border-nomi-line bg-nomi-paper text-nomi-ink-70 hover:bg-nomi-ink-05"
            ),
            "aria-label": n(_ ? "generationCommon.director.closeDirectory" : "generationCommon.director.openDirectory"),
            "aria-pressed": _,
            onClick: N,
            children: [
              /* @__PURE__ */ t.jsx(tt, { size: 16, stroke: 1.9 }),
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
              disabled: !T,
              "aria-label": n("generationCommon.director.previousShot"),
              title: n("generationCommon.director.previousShot"),
              onClick: () => T && C(T.scope),
              children: /* @__PURE__ */ t.jsx(rn, { size: 17 })
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !x,
              "aria-label": n("generationCommon.director.nextShot"),
              title: n("generationCommon.director.nextShot"),
              onClick: () => x && C(x.scope),
              children: /* @__PURE__ */ t.jsx(he, { size: 17 })
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "min-w-[190px] shrink-0 max-[900px]:min-w-0 max-[700px]:min-w-[110px] max-[700px]:flex-1", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ t.jsx(Qe, { size: 15, stroke: 1.9, className: "shrink-0 text-nomi-accent" }),
            /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: le(n, r) })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-micro text-nomi-ink-50 max-[700px]:hidden", children: D && I ? n("generationCommon.director.shotPosition", {
            project: e || n("generationCommon.productionHierarchy.season"),
            current: I.absoluteIndex + 1,
            total: v.totalShotCount
          }) : n("generationCommon.director.seasonSummary", {
            episodes: v.episodes.length,
            shots: v.totalShotCount
          }) })
        ] }),
        D ? /* @__PURE__ */ t.jsx("ol", { className: "m-0 hidden min-w-0 flex-1 list-none items-center gap-1 p-0 min-[1120px]:flex", children: d.stages.map((l, B) => {
          const R = !d.complete && l.id === d.current.id;
          return /* @__PURE__ */ t.jsxs("li", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
            /* @__PURE__ */ t.jsxs(
              "div",
              {
                className: u(
                  "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-1.5",
                  l.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : R ? "bg-nomi-accent-soft text-nomi-accent ring-1 ring-inset ring-nomi-accent/30" : "bg-nomi-ink-05 text-nomi-ink-40"
                ),
                "aria-current": R ? "step" : void 0,
                children: [
                  /* @__PURE__ */ t.jsx("span", { className: "grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[9px] font-bold", children: l.complete ? /* @__PURE__ */ t.jsx(re, { size: 11, stroke: 2.5 }) : B + 1 }),
                  /* @__PURE__ */ t.jsx("span", { className: "truncate text-micro font-semibold", children: oe(n, l.id) })
                ]
              }
            ),
            B < d.stages.length - 1 ? /* @__PURE__ */ t.jsx(Ce, { size: 11, className: "shrink-0 text-nomi-ink-20" }) : null
          ] }, l.id);
        }) }) : /* @__PURE__ */ t.jsx("div", { className: "min-w-0 flex-1 text-caption text-nomi-ink-60", children: n("generationCommon.director.publicHint") }),
        D ? /* @__PURE__ */ t.jsxs("div", { className: "hidden w-[90px] shrink-0 text-right min-[900px]:block", children: [
          /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold text-nomi-ink-60", children: n("generationCommon.director.currentShotProgress", { percent: G }) }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-nomi-ink-10", children: /* @__PURE__ */ t.jsx(
            "span",
            {
              className: "block h-full rounded-full bg-nomi-accent transition-[width]",
              style: { width: `${G}%` }
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
              D && d.current.running && "cursor-wait opacity-70",
              "max-[700px]:order-10 max-[700px]:w-full max-[700px]:justify-center"
            ),
            disabled: D && d.current.running,
            "data-director-primary-action": D ? d.current.id : "enter-shot",
            onClick: O,
            children: [
              D && d.complete ? /* @__PURE__ */ t.jsx(re, { size: 15 }) : /* @__PURE__ */ t.jsx(Je, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "max-w-[180px] truncate", children: D ? oo(n, d) : n("generationCommon.director.enterFirstShot") }),
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
              L(l), l === "guided" && c("generation");
            },
            children: [
              S === "guided" ? /* @__PURE__ */ t.jsx(dn, { size: 15 }) : /* @__PURE__ */ t.jsx(tn, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "hidden min-[1280px]:inline", children: n(S === "guided" ? "generationCommon.director.professionalMode" : "generationCommon.director.guidedMode") })
            ]
          }
        )
      ] })
    }
  );
}
function ve(e) {
  return e === null ? "unassigned" : String(e);
}
function io(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.sidebar.global") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : "";
}
function ao(e, n) {
  return n.episode === null ? e("generationCommon.productionHierarchy.unassignedEpisode") : e("generationCommon.productionHierarchy.episode", { episode: n.episode });
}
function co({
  projectName: e,
  hierarchy: n,
  nodes: o,
  timelineSourceNodeIds: a = /* @__PURE__ */ new Set(),
  activeScope: h,
  onSelectScope: c,
  onClose: f
}) {
  const { t: s } = U(), [w, j] = i.useState(""), [y, S] = i.useState("all"), [L, _] = i.useState(() => {
    const d = h?.episode;
    return new Set(d !== void 0 ? [ve(d)] : []);
  }), N = i.useMemo(() => new Map(o.map((d) => [d.id, d])), [o]);
  i.useEffect(() => {
    if (h?.kind === "global") return;
    const d = ve(h?.episode ?? null);
    _((I) => I.has(d) ? I : /* @__PURE__ */ new Set([...I, d]));
  }, [h]);
  const v = i.useCallback((d) => {
    const I = d.nodeIds.flatMap((E) => {
      const C = N.get(E);
      return C ? [C] : [];
    }), T = Se({ nodes: I, timelineSourceNodeIds: a }), x = `${d.scope.shotNumber} ${I.map((E) => `${E.title} ${E.prompt ?? ""}`).join(" ")}`.toLowerCase();
    return { progress: T, searchable: x, status: nn(T) };
  }, [N, a]), r = i.useMemo(() => {
    const d = w.trim().toLowerCase();
    return n.episodes.map((I) => ({
      episode: I,
      shots: I.shots.filter((T) => {
        const x = v(T);
        return d && !x.searchable.includes(d) ? !1 : y === "failed" ? x.progress.hasFailure : y === "complete" ? x.progress.complete : y === "unfinished" ? !x.progress.complete : !0;
      })
    })).filter(({ shots: I }) => I.length > 0 || !d && y === "all");
  }, [y, n.episodes, w, v]), p = i.useMemo(() => {
    for (const d of n.episodes)
      for (const I of d.shots)
        if (!v(I).progress.complete) return I;
    return null;
  }, [n.episodes, v]);
  if (!n.isProductionProject || !h) return null;
  const k = Te(h);
  return /* @__PURE__ */ t.jsxs(
    "aside",
    {
      className: u(
        "production-hierarchy-navigator relative z-[70] flex h-full w-[276px] shrink-0 flex-col overflow-hidden",
        "border-r border-workbench-border bg-nomi-paper shadow-[8px_0_24px_rgba(20,20,24,0.04)]",
        "max-[1100px]:absolute max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-workbench-pop"
      ),
      "data-production-hierarchy": "true",
      "aria-label": s("generationCommon.director.sidebar.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("header", { className: "shrink-0 border-b border-nomi-line px-3 py-3", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ t.jsx("span", { className: "mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent", children: /* @__PURE__ */ t.jsx(Le, { size: 17, stroke: 1.9 }) }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40", children: s("generationCommon.director.sidebar.title") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-body-sm font-semibold text-nomi-ink", children: e || s("generationCommon.productionHierarchy.season") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-nomi-ink-50", children: s("generationCommon.director.seasonSummary", {
                episodes: n.episodes.filter((d) => d.episode !== null).length,
                shots: n.totalShotCount
              }) })
            ] }),
            f ? /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                className: "grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "aria-label": s("generationCommon.director.closeDirectory"),
                onClick: f,
                children: /* @__PURE__ */ t.jsx(Gt, { size: 16, stroke: 1.8 })
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
              onClick: () => p && c(p.scope),
              disabled: !p,
              children: [
                p ? /* @__PURE__ */ t.jsx(Wt, { size: 15, className: "shrink-0 text-nomi-accent" }) : /* @__PURE__ */ t.jsx(Ne, { size: 15, className: "shrink-0 text-workbench-success" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s(p ? "generationCommon.director.sidebar.continueIncomplete" : "generationCommon.director.sidebar.allComplete") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-50", children: p ? io(s, p.scope) : s("generationCommon.director.sidebar.allCompleteHint") })
                ] }),
                p ? /* @__PURE__ */ t.jsx(he, { size: 15, className: "text-nomi-ink-40" }) : null
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("label", { className: "mt-2.5 flex h-8 items-center gap-2 rounded-nomi border border-nomi-line bg-workbench-bg px-2.5 focus-within:border-nomi-accent", children: [
            /* @__PURE__ */ t.jsx($t, { size: 14, className: "shrink-0 text-nomi-ink-40" }),
            /* @__PURE__ */ t.jsx(
              "input",
              {
                className: "min-w-0 flex-1 border-0 bg-transparent p-0 text-caption text-nomi-ink outline-none placeholder:text-nomi-ink-30",
                value: w,
                placeholder: s("generationCommon.director.sidebar.searchPlaceholder"),
                "aria-label": s("generationCommon.director.sidebar.searchAria"),
                onChange: (d) => j(d.currentTarget.value)
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(
            "div",
            {
              className: "mt-2 grid grid-cols-4 gap-1",
              role: "group",
              "aria-label": s("generationCommon.director.sidebar.filterAria"),
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
                    y === d ? "bg-nomi-ink text-nomi-paper" : "bg-nomi-ink-05 text-nomi-ink-50 hover:text-nomi-ink"
                  ),
                  "aria-pressed": y === d,
                  onClick: () => S(d),
                  children: s(`generationCommon.director.sidebar.${I}`)
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
                k === "global" ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent bg-transparent hover:bg-nomi-ink-05"
              ),
              "data-production-scope": "global",
              "aria-current": k === "global" ? "page" : void 0,
              onClick: () => c({ kind: "global", episode: null, shotNumber: 0 }),
              children: [
                /* @__PURE__ */ t.jsx(Ot, { size: 16, stroke: 1.8, className: "shrink-0 text-nomi-ink-50" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s("generationCommon.director.sidebar.global") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-40", children: s("generationCommon.director.sidebar.globalDescription") })
                ] }),
                /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: n.globalNodeIds.length })
              ]
            }
          ) : null,
          r.map(({ episode: d, shots: I }) => {
            const T = ve(d.episode), x = L.has(T), E = d.shots.filter((C) => v(C).progress.complete).length;
            return /* @__PURE__ */ t.jsxs("section", { className: "mb-1 overflow-hidden rounded-nomi border border-nomi-line", children: [
              /* @__PURE__ */ t.jsxs(
                "button",
                {
                  type: "button",
                  className: "flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left hover:bg-nomi-ink-10",
                  "aria-expanded": x,
                  onClick: () => _((C) => {
                    const A = new Set(C);
                    return A.has(T) ? A.delete(T) : A.add(T), A;
                  }),
                  children: [
                    x ? /* @__PURE__ */ t.jsx(Ee, { size: 15 }) : /* @__PURE__ */ t.jsx(he, { size: 15 }),
                    /* @__PURE__ */ t.jsx(Qe, { size: 16, stroke: 1.8, className: "text-nomi-accent" }),
                    /* @__PURE__ */ t.jsx("span", { className: "min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink", children: ao(s, d) }),
                    /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: s("generationCommon.director.sidebar.episodeProgress", {
                      completed: E,
                      total: d.shots.length
                    }) })
                  ]
                }
              ),
              x ? /* @__PURE__ */ t.jsxs("div", { className: "space-y-1 bg-nomi-paper p-1.5", children: [
                d.episode !== null && d.overviewNodeIds.length ? /* @__PURE__ */ t.jsxs(
                  "button",
                  {
                    type: "button",
                    className: u(
                      "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left",
                      k === `episode:${d.episode}` ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent hover:bg-nomi-ink-05"
                    ),
                    "data-production-scope": `episode:${d.episode}`,
                    "aria-current": k === `episode:${d.episode}` ? "page" : void 0,
                    onClick: () => c({ kind: "episode", episode: d.episode, shotNumber: 0 }),
                    children: [
                      /* @__PURE__ */ t.jsx(Le, { size: 14, className: "text-nomi-ink-50" }),
                      /* @__PURE__ */ t.jsx("span", { className: "text-caption font-medium text-nomi-ink", children: s("generationCommon.director.sidebar.episodeOverview") })
                    ]
                  }
                ) : null,
                I.map((C) => {
                  const A = Te(C.scope), P = v(C);
                  return /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: u(
                        "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left",
                        k === A ? "border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]" : "border-transparent hover:bg-nomi-ink-05"
                      ),
                      "data-production-scope": A,
                      "data-shot-status": P.progress.complete ? "complete" : P.progress.hasFailure ? "failed" : "unfinished",
                      "aria-current": k === A ? "true" : void 0,
                      onClick: () => c(C.scope),
                      children: [
                        /* @__PURE__ */ t.jsx(
                          "span",
                          {
                            className: u(
                              "grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums",
                              k === A ? "bg-nomi-accent text-white" : P.progress.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : P.progress.hasFailure ? "bg-[color-mix(in_oklch,var(--workbench-danger)_12%,transparent)] text-workbench-danger" : "bg-nomi-ink-05 text-nomi-ink-60"
                            ),
                            children: P.progress.complete ? /* @__PURE__ */ t.jsx(re, { size: 13 }) : C.scope.shotNumber
                          }
                        ),
                        /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s("generationCommon.director.sidebar.shot", { shot: C.scope.shotNumber }) }),
                          /* @__PURE__ */ t.jsxs("span", { className: u(
                            "mt-0.5 flex items-center gap-1 text-micro",
                            P.progress.hasFailure ? "text-workbench-danger" : "text-nomi-ink-40"
                          ), children: [
                            P.progress.hasFailure ? /* @__PURE__ */ t.jsx(qe, { size: 11 }) : null,
                            s(`generationCommon.director.sidebar.status.${P.status}`, {
                              stage: s(`generationCommon.director.stages.${P.progress.current.id}.title`)
                            })
                          ] })
                        ] }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold tabular-nums text-nomi-ink-40", children: s("generationCommon.director.sidebar.stageProgress", {
                          completed: P.progress.productionCompletedCount,
                          total: P.progress.productionStageCount
                        }) })
                      ]
                    },
                    A
                  );
                }),
                I.length ? null : /* @__PURE__ */ t.jsx("div", { className: "px-2 py-4 text-center text-micro text-nomi-ink-40", children: s("generationCommon.director.sidebar.emptyFilter") })
              ] }) : null
            ] }, T);
          })
        ] })
      ]
    }
  );
}
const lo = ee(
  "创作区",
  () => import("./CreationWorkspace-DxTMWWJc.js")
), mo = ee(
  "生成区",
  () => import("./GenerationWorkspace-C3uIx60l.js")
), po = ee("预览区", () => import("./PreviewWorkspace-BovSz0Oz.js")), uo = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, ho = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function xo({ label: e }) {
  const { t: n } = U(), o = n("workspace.loading", { label: e });
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: u(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ t.jsx(Ke, { size: 28, label: o })
    }
  );
}
function ye({
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
        i.Suspense,
        {
          fallback: e ? /* @__PURE__ */ t.jsx(xo, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function bo() {
  if (typeof window > "u") return "generation";
  try {
    const e = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return ho[e] || "generation";
  } catch {
    return "generation";
  }
}
function Ue(e) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = uo[e];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function fo() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function go({
  generation: e,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: a,
  projectName: h,
  onBackToLibrary: c,
  onOpenModelCatalog: f,
  onRenameProject: s
}) {
  const { t: w } = U(), j = z((g) => g.workspaceMode), y = z(
    (g) => g.setWorkspaceMode
  ), S = z((g) => g.categories), L = z((g) => g.setActiveCategoryId), _ = $((g) => g.nodes), N = i.useMemo(
    () => Ye(_),
    [_]
  ), v = ne((g) => g.activeScope), r = ne((g) => g.syncProject), p = ne((g) => g.setActiveScope), k = i.useMemo(
    () => _e(_, v),
    [_, v]
  ), d = J((g) => g.mode), I = J((g) => g.directoryOpen), T = J((g) => g.setDirectoryOpen), x = N.isProductionProject, E = x && d === "guided", C = z((g) => g.timeline), A = i.useMemo(
    () => new Set(
      C.tracks.flatMap((g) => g.clips.map((m) => m.sourceNodeId))
    ),
    [C.tracks]
  ), [P, O] = i.useState(() => [j]), [D, G] = i.useState(!1), l = i.useRef(null);
  i.useEffect(() => {
    r(a ?? null, _);
  }, [_, a, r]);
  const B = window.nomiDesktop?.platform === "win32";
  i.useEffect(() => {
    const g = z.getState().workspaceMode;
    Ue(g);
    const m = () => {
      y(bo());
    };
    return window.addEventListener("popstate", m), () => window.removeEventListener("popstate", m);
  }, [y]), i.useEffect(() => {
    O(
      (g) => g.includes(j) ? g : [...g, j]
    );
  }, [j]);
  const R = i.useCallback(
    (g) => {
      Ft(g) && (y(g), Ue(g));
    },
    [y]
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
      "data-workspace-mode": j,
      children: [
        B ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: u(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": w("appBar.windowTitleBar"),
            onDoubleClick: Ve,
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
                  "aria-expanded": D,
                  onClick: () => G((g) => !g),
                  children: /* @__PURE__ */ t.jsx(He, { markSize: 18, wordSize: 14 })
                }
              ),
              D ? /* @__PURE__ */ t.jsx(ot, { anchorEl: l.current, onClose: () => G(!1) }) : null,
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              E ? null : /* @__PURE__ */ t.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ t.jsx(nt, {}) }),
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
                      onClick: fo,
                      children: [
                        /* @__PURE__ */ t.jsx(Xe, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ t.jsx("span", { children: w("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ t.jsx(Ut, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ t.jsx(
          gn,
          {
            workspaceMode: j,
            onWorkspaceModeChange: R,
            projectName: h,
            onBackToLibrary: c,
            onOpenModelCatalog: f,
            onRenameProject: s,
            directorMode: E
          }
        ),
        x ? /* @__PURE__ */ t.jsx(so, { projectName: h }) : /* @__PURE__ */ t.jsx(no, {}),
        /* @__PURE__ */ t.jsxs(
          "main",
          {
            className: u(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              j === "generation" && E && I ? /* @__PURE__ */ t.jsx(
                co,
                {
                  projectName: h,
                  hierarchy: N,
                  nodes: _,
                  timelineSourceNodeIds: A,
                  activeScope: k,
                  onSelectScope: (g) => {
                    L("shots"), p(g);
                  },
                  onClose: () => T(!1)
                }
              ) : null,
              j === "generation" && !E ? /* @__PURE__ */ t.jsx(Pn, { projectId: a ?? null, categories: S }) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                P.includes("creation") ? /* @__PURE__ */ t.jsx(
                  ye,
                  {
                    active: j === "creation",
                    label: w("workspace.creation"),
                    children: /* @__PURE__ */ t.jsx(lo, {})
                  }
                ) : null,
                P.includes("generation") ? /* @__PURE__ */ t.jsx(
                  ye,
                  {
                    active: j === "generation",
                    label: w("workspace.generation"),
                    children: /* @__PURE__ */ t.jsx(
                      mo,
                      {
                        canvas: e,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                P.includes("preview") ? /* @__PURE__ */ t.jsx(
                  ye,
                  {
                    active: j === "preview",
                    label: w("workspace.preview"),
                    children: /* @__PURE__ */ t.jsx(po, {})
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
const $o = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: go
}, Symbol.toStringTag, { value: "Module" }));
export {
  We as C,
  rn as I,
  Mn as S,
  $o as W,
  Ro as b,
  Wo as c,
  rt as e,
  Bo as g,
  Go as h,
  Do as m
};
