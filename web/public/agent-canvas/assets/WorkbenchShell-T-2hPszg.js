import { aT as ue, e6 as O, S as s, dW as F, dX as ht, cU as he, c5 as xt, cV as bt, cr as ft, ef as gt, cq as Se, c6 as kt, ci as t, aL as b, l as te, bz as vt, d$ as yt, b as wt, K as jt, O as Nt, a0 as Ct, J as Fe, a8 as $, I as Ke, bT as Ge, z as Ue, M as St, L as _t, k as Ve, r as It, e7 as L, a3 as Et, a1 as ne, a4 as oe, a2 as re, s as Mt, cj as Q, e0 as ee, dg as Ne, cb as Pt, bd as At, u as He, ax as qe, cc as Lt, bg as Tt, ad as _e, bi as Ie, o as Xe, cN as Ee, x as zt, q as Dt, t as Bt, p as Rt, cg as $t, a7 as Wt } from "./agentStudioMount-BaWK4RwX.js";
import { I as Ot } from "./IconDownload-2gk6Ytok.js";
import { I as Ce, a as le } from "./IconChevronRight-DIa5qTWP.js";
import { I as Ft } from "./IconListCheck-CdZ6gS6p.js";
import { I as Je } from "./IconMap-Bta0nclb.js";
import { u as Kt } from "./journeyTourActivity-CXYOC18O.js";
import { D as Ye, d as de, r as me } from "./guidedProductionEvents-DQruDmqB.js";
import { I as ke, a as Me } from "./IconStack2-zEVDXtra.js";
import { I as Gt } from "./IconBooks-BaGhiuLE.js";
import { I as Ut } from "./IconBulb-Bd-f-uAA.js";
import { b as Vt, I as Ht, a as qt } from "./IconFolder-CdYCe-pz.js";
import { I as Qe } from "./IconLayoutSidebarLeftExpand-xRUSu7yx.js";
import { I as ve } from "./IconArrowRight-5DWpOm7J.js";
import { g as ce } from "./generationCanvasTools-D1IGg4FI.js";
import { I as Xt } from "./IconArrowLeft-0AwHDFFT.js";
import { u as X } from "./productionDirectorUiStore-BfZ8SI4d.js";
const Jt = [["path", { d: "M15 6l-6 6l6 6", key: "svg-0" }]], Yt = ue("outline", "chevron-left", "ChevronLeft", Jt);
const Qt = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], Pe = ue("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", Qt);
const Zt = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], en = ue("outline", "tags", "Tags", Zt);
const tn = [["path", { d: "M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5", key: "svg-0" }]], nn = ue("outline", "tool", "Tool", tn), V = ["model", "storyboard", "generated", "exported"];
function Ze() {
  const { t: e } = O(), n = s.useMemo(
    () => [
      { key: "model", label: e("onboarding.steps.model.label"), hint: e("onboarding.steps.model.hint") },
      { key: "storyboard", label: e("onboarding.steps.storyboard.label"), hint: e("onboarding.steps.storyboard.hint") },
      { key: "generated", label: e("onboarding.steps.generated.label"), hint: e("onboarding.steps.generated.hint") },
      { key: "exported", label: e("onboarding.steps.exported.label"), hint: e("onboarding.steps.exported.hint") }
    ],
    [e]
  ), o = F((h) => h.nodes), { hasTextModel: a } = ht(), u = Kt(), d = s.useMemo(
    () => ({
      model: a === !0,
      storyboard: o.length > 0,
      generated: o.some((h) => h.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [a, o]
  ), [p, r] = s.useState(() => he()), [_, N] = s.useState(() => xt()), [w, v] = s.useState(() => !bt()), P = s.useRef(null), [E, y] = s.useState(null);
  s.useEffect(() => {
    let h = !1;
    for (const S of V)
      d[S] && !p[S] && (ft(S), h = !0);
    h && r(he());
  }, [d, p]), s.useEffect(() => {
    const h = () => r(he());
    return window.addEventListener("storage", h), window.addEventListener("focus", h), () => {
      window.removeEventListener("storage", h), window.removeEventListener("focus", h);
    };
  }, []);
  const j = s.useMemo(
    () => ({
      model: p.model || d.model,
      storyboard: p.storyboard || d.storyboard,
      generated: p.generated || d.generated,
      exported: p.exported || d.exported
    }),
    [p, d]
  ), i = V.filter((h) => j[h]).length, f = i === V.length, g = n.find((h) => !j[h.key])?.key ?? null, x = s.useCallback(() => {
    const h = P.current;
    if (!h) return;
    const S = h.getBoundingClientRect();
    y({ top: S.bottom + 8, right: Math.max(8, window.innerWidth - S.right) });
  }, []);
  s.useEffect(() => {
    if (w)
      return x(), window.addEventListener("resize", x), () => window.removeEventListener("resize", x);
  }, [w, x]), s.useEffect(() => {
    if (!w) return;
    const h = (S) => {
      const M = S.target;
      M && M.closest("[data-onboarding-checklist-root]") || v(!1);
    };
    return window.addEventListener("pointerdown", h, !0), () => window.removeEventListener("pointerdown", h, !0);
  }, [w]);
  const I = s.useCallback(() => {
    v((h) => {
      const S = !h;
      return gt(!S), S;
    });
  }, []), C = s.useCallback(() => {
    Se(), N(!0);
  }, []);
  return s.useEffect(() => {
    _ || f || kt(Date.now()) && (Se(), N(!0));
  }, [_, f]), f || u || _ ? null : /* @__PURE__ */ t.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ t.jsxs(
      "button",
      {
        type: "button",
        ref: P,
        onClick: I,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": e("onboarding.progressLabel", { done: i, total: V.length }),
        "aria-expanded": w,
        className: b(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          w && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ t.jsx(Ft, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ t.jsx("span", { className: "max-[700px]:hidden", children: e("onboarding.trigger") }),
          /* @__PURE__ */ t.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            i,
            "/",
            V.length
          ] })
        ]
      }
    ),
    w && E ? /* @__PURE__ */ t.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": e("onboarding.panelLabel"),
        style: { top: E.top, right: E.right },
        className: b(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: e("onboarding.panelLabel") }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              i,
              " / ",
              V.length
            ] }),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: () => I(),
                "aria-label": e("onboarding.collapse"),
                className: b(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ t.jsx(Ce, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(Ye, { value: i / V.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ t.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((h) => {
            const S = j[h.key], M = !S && h.key === g;
            return /* @__PURE__ */ t.jsx(
              "li",
              {
                "data-step": h.key,
                "data-done": S ? "true" : "false",
                className: b("flex flex-col gap-1.5 p-2 rounded-nomi-sm", M && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ t.jsx(
                    "span",
                    {
                      className: b(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        S ? "bg-nomi-accent text-nomi-paper" : M ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: S ? /* @__PURE__ */ t.jsx(te, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ t.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ t.jsx(
                      "span",
                      {
                        className: b(
                          "block text-body-sm font-medium leading-snug",
                          S ? "text-nomi-ink-40" : M ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: h.label
                      }
                    ),
                    S ? null : /* @__PURE__ */ t.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: h.hint })
                  ] })
                ] })
              },
              h.key
            );
          }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between border-t border-nomi-line-soft px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), v(!1);
                },
                className: b(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ t.jsx(Je, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  e("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: C,
                className: b(
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
const on = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, J = on;
function rn(e, n) {
  switch (n.type) {
    case "checking":
      return { ...J, phase: "checking" };
    case "up-to-date":
      return { ...J, phase: "up-to-date" };
    case "available":
      return { ...J, phase: "available", latestVersion: n.version, notes: n.notes };
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
function sn() {
  const n = vt()?.update, o = !!n, [a, u] = s.useState(null), [d, p] = s.useState(J);
  s.useEffect(() => {
    let E = !0;
    n?.appInfo().then((j) => {
      E && u(j);
    }).catch(() => {
    });
    const y = n?.onEvent((j) => p((i) => rn(i, j)));
    return () => {
      E = !1, y?.();
    };
  }, [n]), s.useEffect(() => {
    if (d.phase !== "up-to-date") return;
    const E = window.setTimeout(() => p(J), 2500);
    return () => window.clearTimeout(E);
  }, [d.phase]);
  const r = s.useCallback(() => {
    p({ ...J, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), _ = s.useCallback(() => {
    p((E) => ({ ...E, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), N = s.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), w = s.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), v = s.useCallback(() => p(J), []), P = a?.canAutoInstall ?? !0;
  return {
    phase: d.phase,
    appInfo: a,
    latestVersion: d.latestVersion,
    notes: d.notes,
    percent: d.percent,
    errorMessage: d.errorMessage,
    supported: o,
    canAutoInstall: P,
    check: r,
    download: _,
    install: N,
    openRelease: w,
    reset: v
  };
}
const an = 360, Ae = 12;
function cn(e) {
  return e ? `${e.platform === "win32" ? "Windows" : e.platform === "darwin" ? "macOS" : e.platform} · ${e.arch}` : "";
}
function et({ anchorEl: e, onClose: n }) {
  const { t: o } = O(), a = sn(), { isDark: u } = yt(), [d, p] = s.useState(null);
  return s.useLayoutEffect(() => {
    if (!e) return;
    const r = () => {
      const _ = e.getBoundingClientRect(), N = Math.min(_.left, window.innerWidth - an - Ae), w = _.bottom + 8;
      p({ top: w, left: Math.max(Ae, N) });
    };
    return r(), window.addEventListener("resize", r), window.addEventListener("scroll", r, !0), () => {
      window.removeEventListener("resize", r), window.removeEventListener("scroll", r, !0);
    };
  }, [e]), s.useEffect(() => {
    const r = (_) => {
      _.key === "Escape" && n();
    };
    return window.addEventListener("keydown", r), () => window.removeEventListener("keydown", r);
  }, [n]), /* @__PURE__ */ t.jsxs(wt, { children: [
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
        className: b(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: d?.top ?? -9999, left: d?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (r) => r.stopPropagation(),
        children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ t.jsx(jt, { size: 40 }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx(Nt, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ t.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: a.appInfo?.version ?? "…" }),
                a.appInfo ? ` · ${cn(a.appInfo)}` : ""
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
                /* @__PURE__ */ t.jsx(Je, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: o("about.handbook") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: o("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ t.jsx(le, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: o("theme.appearance") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(u ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ t.jsx(Ct, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: a.supported ? /* @__PURE__ */ t.jsx(ln, { updater: a }) : /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function ln({ updater: e }) {
  const { t: n } = O(), { phase: o } = e;
  return o === "checking" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ t.jsx(Fe, { size: 16, label: n("about.checking") }),
    n("about.checkingEllipsis")
  ] }) : o === "up-to-date" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ t.jsx(ke, { size: 16, className: "text-[var(--workbench-success)]" }),
    n("about.upToDate")
  ] }) : o === "available" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ t.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        n("about.available"),
        " ",
        /* @__PURE__ */ t.jsx("b", { className: "font-medium", children: e.latestVersion })
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ t.jsx($, { variant: "default", onClick: e.reset, children: n("common.later") }),
        e.canAutoInstall ? /* @__PURE__ */ t.jsx($, { variant: "primary", onClick: e.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ t.jsx($, { variant: "primary", onClick: e.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    e.canAutoInstall ? null : /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    e.notes ? /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: e.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ t.jsx(Ye, { value: e.percent, size: "sm" }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: e.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ t.jsx(ke, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ t.jsx($, { variant: "default", onClick: e.reset, children: n("common.later") }),
      /* @__PURE__ */ t.jsx($, { variant: "primary", onClick: e.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ t.jsx(Ke, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ t.jsx("span", { className: "min-w-0 break-words", children: e.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ t.jsx($, { variant: "default", onClick: e.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ t.jsx($, { variant: "primary", onClick: e.check, children: n("about.checkUpdate") })
  ] });
}
const se = window.nomiDesktop?.platform === "win32";
function dn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function mn({
  workspaceMode: e,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: a,
  onOpenModelCatalog: u,
  onRenameProject: d,
  directorMode: p = !1
}) {
  const { t: r } = O(), [_, N] = s.useState(!1), [w, v] = s.useState(o || r("appBar.untitledProject")), [P, E] = s.useState(!1), y = s.useRef(null);
  s.useEffect(() => {
    !_ && o && v(o);
  }, [o, _]);
  const j = s.useCallback(() => {
    v((f) => {
      const g = f.trim() || r("appBar.untitledProject");
      return d?.(g), g;
    }), N(!1);
  }, [d, r]), i = s.useCallback(() => {
    u?.();
  }, [u]);
  return /* @__PURE__ */ t.jsxs(
    "header",
    {
      className: b(
        "nomi-appbar",
        se && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": r("appBar.workspace"),
      "data-director-mode": p ? "true" : void 0,
      onDoubleClick: Ge,
      children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: b(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              se ? null : /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    ref: y,
                    type: "button",
                    className: b(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": r("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": P,
                    onClick: () => E((f) => !f),
                    children: /* @__PURE__ */ t.jsx(Ue, {})
                  }
                ),
                P ? /* @__PURE__ */ t.jsx(et, { anchorEl: y.current, onClose: () => E(!1) }) : null,
                /* @__PURE__ */ t.jsx(
                  "span",
                  {
                    className: b("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ t.jsxs(
                "div",
                {
                  className: b(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": r("appBar.locationNavigation"),
                  children: [
                    a ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                      /* @__PURE__ */ t.jsx(
                        $,
                        {
                          className: b(
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
                          "aria-label": r("appBar.backToLibrary"),
                          onClick: a,
                          children: r("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ t.jsx(
                        "span",
                        {
                          className: b(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    _ ? /* @__PURE__ */ t.jsx(
                      "input",
                      {
                        className: b(
                          "nomi-appbar__breadcrumb-input",
                          "app-no-drag",
                          "h-full px-2.5 border-none",
                          "bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]",
                          "text-[var(--nomi-ink)] font-inherit text-body-sm",
                          "outline-none min-w-[80px] max-w-[240px]"
                        ),
                        value: w,
                        autoFocus: !0,
                        "aria-label": r("appBar.projectName"),
                        onBlur: j,
                        onChange: (f) => v(f.currentTarget.value),
                        onKeyDown: (f) => {
                          f.key === "Enter" && j(), f.key === "Escape" && N(!1);
                        }
                      }
                    ) : /* @__PURE__ */ t.jsx(
                      $,
                      {
                        className: b(
                          "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--name",
                          "app-no-drag",
                          "inline-flex items-center h-full px-2.5",
                          "border-none bg-transparent font-inherit text-body-sm",
                          "cursor-pointer whitespace-nowrap",
                          "text-[var(--nomi-ink-80)] max-w-[200px] overflow-hidden text-ellipsis",
                          "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                          "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]"
                        ),
                        title: w,
                        onClick: () => N(!0),
                        children: w
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ t.jsx("div", { className: "app-no-drag", children: p ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: b(
              "inline-flex h-8 items-center gap-2 rounded-full border border-nomi-line px-3",
              "bg-nomi-ink-05 text-caption font-semibold text-nomi-ink-70",
              "max-[700px]:hidden"
            ),
            "aria-label": r("generationCommon.director.modeAria"),
            children: [
              /* @__PURE__ */ t.jsx("span", { className: "size-1.5 rounded-full bg-nomi-accent", "aria-hidden": "true" }),
              r("generationCommon.director.modeTitle")
            ]
          }
        ) : /* @__PURE__ */ t.jsx(St, { value: e, onChange: n }) }),
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: b(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": r("appBar.globalActions"),
            children: [
              /* @__PURE__ */ t.jsx(_t, { className: "size-[30px]" }),
              !se && !p ? /* @__PURE__ */ t.jsx(Ze, {}) : null,
              !se && !p ? /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs(
                $,
                {
                  className: b(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": r("appBar.openBrowser"),
                  title: r("appBar.browser"),
                  onClick: dn,
                  children: [
                    /* @__PURE__ */ t.jsx(Ve, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: b("nomi-appbar__action-text", "max-[1400px]:hidden"), children: r("appBar.browser") })
                  ]
                }
              ) }) : null,
              /* @__PURE__ */ t.jsxs(
                $,
                {
                  className: b(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": r("appBar.openModelAccess"),
                  title: r("appBar.modelAccess"),
                  onClick: i,
                  children: [
                    /* @__PURE__ */ t.jsx(It, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: b("nomi-appbar__action-text", "max-[1400px]:hidden"), children: r("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ t.jsxs(
                $,
                {
                  className: b(
                    "nomi-appbar__primary",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-80)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": r(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: r(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    e === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : n("preview");
                  },
                  children: [
                    /* @__PURE__ */ t.jsx(Ot, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: b("nomi-appbar__action-text", "max-[1400px]:hidden"), children: r("appBar.export") })
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
const pn = Q("i18n:sidebar.categoryPanel", () => import("./CategoryTree-BN5uWsfn.js")), un = Q(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-e4l1cMS-.js").then((e) => ({
    default: e.PromptLibraryContent
  }))
), hn = Q(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-DXVfeO5o.js").then((e) => ({
    default: e.SkillLibraryContent
  }))
), xn = Q(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-Y9NL48qI.js").then((e) => ({
    default: e.AssetLibraryContent
  }))
), bn = 60, fn = 300, gn = 500, kn = 60, vn = b(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Le = b(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Te = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", ze = b(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function yn(e, n) {
  return n(e === "categories" ? "sidebar.groups" : e === "prompt-library" ? "sidebar.promptLibrary" : e === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function wn(e) {
  return e === "prompt-library" || e === "skill-library" || e === "asset-library";
}
function jn({ categories: e, projectId: n = null }) {
  const { t: o } = O(), [a, u] = s.useState("asset-library"), [d, p] = s.useState(0), r = L((i) => i.sidebarCollapsed), _ = L((i) => i.toggleSidebarCollapsed), N = L((i) => i.setSidebarCollapsed), w = s.useCallback(() => {
    u("categories"), N(!1), p((i) => i + 1);
  }, [N]), v = s.useCallback((i) => {
    if (!r && a === i) {
      N(!0);
      return;
    }
    u(i), N(!1);
  }, [r, N, a]);
  s.useEffect(() => {
    const i = () => {
      u("asset-library"), N(!1);
    };
    return window.addEventListener("nomi-open-files-panel", i), () => window.removeEventListener("nomi-open-files-panel", i);
  }, [N]);
  const P = s.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: Vt
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: en
      }
    ],
    [o]
  ), E = s.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: Ut
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: Gt
      }
    ],
    [o]
  ), y = yn(a, o), j = wn(a) ? gn : fn;
  return /* @__PURE__ */ t.jsx(
    "aside",
    {
      "data-collapsed": r ? "true" : "false",
      className: b(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: r ? bn : j },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ t.jsxs(Et, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: kn },
            children: [
              /* @__PURE__ */ t.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                P.map((i) => {
                  const f = i.icon, g = a === i.id;
                  return /* @__PURE__ */ t.jsxs(ne, { children: [
                    /* @__PURE__ */ t.jsx(oe, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: b(Le, g && Te),
                        "aria-label": i.label,
                        "aria-pressed": g,
                        onClick: () => v(i.id),
                        children: [
                          /* @__PURE__ */ t.jsx(f, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: i.railLabel ?? i.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(re, { side: "right", children: i.label })
                  ] }, i.id);
                }),
                /* @__PURE__ */ t.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                E.map((i) => {
                  const f = i.icon, g = a === i.id;
                  return /* @__PURE__ */ t.jsxs(ne, { children: [
                    /* @__PURE__ */ t.jsx(oe, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: b(Le, g && Te),
                        "aria-label": i.label,
                        "aria-pressed": g,
                        onClick: () => v(i.id),
                        children: [
                          /* @__PURE__ */ t.jsx(f, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: i.railLabel ?? i.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(re, { side: "right", children: i.label })
                  ] }, i.id);
                })
              ] }),
              /* @__PURE__ */ t.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ t.jsxs(ne, { children: [
                /* @__PURE__ */ t.jsx(oe, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: _,
                    className: vn,
                    "aria-label": o(r ? "sidebar.expand" : "sidebar.collapse"),
                    children: r ? /* @__PURE__ */ t.jsx(Qe, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ t.jsx(Pe, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ t.jsx(re, { side: "right", children: o(r ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        r ? null : /* @__PURE__ */ t.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": y, children: /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ t.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: y }),
            a === "categories" ? /* @__PURE__ */ t.jsxs(ne, { children: [
              /* @__PURE__ */ t.jsx(oe, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: w,
                  className: ze,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ t.jsx(Mt, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(re, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ t.jsxs(ne, { children: [
              /* @__PURE__ */ t.jsx(oe, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: _,
                  className: ze,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ t.jsx(Pe, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(re, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          a === "categories" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(pn, { categories: e, createCategoryNonce: d }) }) : a === "prompt-library" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(un, { active: !0, compact: !0, showHeader: !1 }) }) : a === "skill-library" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(hn, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(xn, { projectId: n, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const De = [
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
function go(e) {
  return De.find((n) => n.id === e) || De[0];
}
function ko(e) {
  return !e.chatOnly;
}
function tt(e) {
  return nt(e?.contentJson).trim();
}
function nt(e) {
  if (!e || typeof e != "object") return "";
  const n = e, o = typeof n.text == "string" ? n.text : "", a = Array.isArray(n.content) ? n.content.map(nt).filter(Boolean).join(`
`) : "";
  return [o, a].filter(Boolean).join(o && a ? `
` : "");
}
function vo(e) {
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
const Nn = [
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
function ot(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function q(e, n) {
  return n.test(ot(e));
}
function Cn(e) {
  return e.meta?.referenceSheet === !0;
}
function Sn(e) {
  return Cn(e) ? !1 : e.kind === "shot" ? !0 : e.kind !== "image" || e.meta?.storyboardKeyframe === !0 || e.meta?.workflowStage === "keyframe" || q(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof e.shotIndex == "number" || q(e, /镜头|分镜|shot/);
}
function Z(e, n) {
  return e.result?.type === n || e.history?.some((o) => o.type === n) === !0;
}
function Be(e, n) {
  const o = ot(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof e.shotIndex == "number" ? `shot-${e.shotIndex}` : `position-${n + 1}`;
}
function xe(e, n, o = () => !0) {
  const a = new Set(
    n.filter(o).map((u, d) => Be(u, d))
  );
  return new Set(
    e.map((u, d) => Be(u, d)).filter((u) => a.has(u))
  ).size;
}
function _n(e) {
  const n = e.documentText.trim(), o = n.length >= 4, a = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, u = e.nodes.filter(
    (l) => q(l, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || l.meta?.workflowStage === "style"
  ), d = e.nodes.filter(
    (l) => l.kind === "character" || q(l, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || l.meta?.workflowStage === "character"
  ), p = e.nodes.filter(
    (l) => l.kind === "scene" || q(l, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || l.meta?.workflowStage === "scene"
  ), r = e.nodes.filter(Sn), _ = e.nodes.filter(
    (l) => q(l, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || l.meta?.cameraMoveAutoCapture !== void 0 || l.meta?.cameraMovePromptApplied !== void 0 || l.meta?.workflowStage === "motion"
  ), N = e.nodes.filter(
    (l) => l.kind === "keyframe" || l.meta?.storyboardKeyframe === !0 || q(l, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || l.meta?.workflowStage === "keyframe"
  ), w = e.nodes.filter((l) => l.kind === "video"), v = r.length, P = u.filter((l) => Z(l, "image")).length, E = d.filter((l) => Z(l, "image")).length, y = p.filter((l) => Z(l, "image")).length, j = r.filter((l) => Z(l, "image")).length, i = xe(
    r,
    N,
    (l) => Z(l, "image")
  ), f = xe(
    r,
    w,
    (l) => Z(l, "video")
  ), g = xe(r, _), x = u.length > 0 && P > 0, I = d.length > 0 && E === d.length, C = p.length > 0 && y === p.length, h = v > 0 && j === v, S = v > 0 && g === v, M = v > 0 && i === v, z = w.length > 0, A = v > 0 && f === v, k = v > 0 && A && e.timelineClipCount >= v, D = {
    style: u.length > 0,
    character: d.length > 0,
    scene: p.length > 0,
    storyboard: r.length > 0,
    keyframe: N.length > 0,
    video: w.length > 0
  }, c = {
    style: P,
    character: E,
    scene: y,
    storyboard: j,
    keyframe: i,
    video: f
  }, T = {
    idea: o,
    script: a,
    style: x,
    character: I,
    scene: C,
    storyboard: h,
    motion: S,
    keyframe: M,
    video: A,
    review: k
  }, B = Nn.map((l) => ({
    ...l,
    complete: T[l.id]
  })), R = B.findIndex((l) => !l.complete), m = R >= 0 ? R : B.length - 1;
  return {
    stages: B,
    current: B[m],
    currentIndex: m,
    completedCount: B.filter((l) => l.complete).length,
    hasVideoNodes: z,
    hasGeneratedVideo: A,
    shotCount: v,
    plannedByStage: D,
    generatedCountByStage: c
  };
}
function In(e) {
  return String(e.title || "").toLocaleLowerCase();
}
function rt(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function W(e, n) {
  return n.test(In(e));
}
function K(e) {
  return String(e.meta?.workflowStage || "").toLocaleLowerCase();
}
function it(e) {
  return K(e) === "story" || W(e, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function st(e) {
  return K(e) === "script" || W(e, /剧本|分场|script|screenplay/);
}
function En(e) {
  return K(e) === "style" || W(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function Mn(e) {
  return e.kind === "character" || K(e) === "character" || W(e, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function Pn(e) {
  return e.kind === "scene" || K(e) === "scene" || W(e, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function at(e) {
  return e.kind === "keyframe" || K(e) === "keyframe" || e.meta?.storyboardKeyframe === !0 || W(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function ct(e) {
  return e.kind === "video" && (K(e) === "video" || W(e, /镜头|shot|视频/));
}
function An(e) {
  return K(e) === "motion" || W(e, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function Ln(e) {
  return e.meta?.referenceSheet === !0 || at(e) || ct(e) ? !1 : e.kind === "shot" || e.kind === "image" && (K(e) === "storyboard" || typeof e.shotIndex == "number" || W(e, /镜头|分镜|shot/));
}
function pe(e) {
  const n = rt(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof e.shotIndex == "number" ? e.shotIndex : null;
}
function ae(e) {
  return [...e].sort((n, o) => {
    const a = pe(n) ?? Number.MAX_SAFE_INTEGER, u = pe(o) ?? Number.MAX_SAFE_INTEGER;
    return a !== u ? a - u : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function be(e, n, o) {
  const a = pe(n);
  if (a !== null) {
    const u = e.filter((d) => pe(d) === a);
    if (u.length) return u;
  }
  return e[o] ? [e[o]] : [];
}
function Re(e, n) {
  if (e.length <= 1) return e;
  const o = rt(n), a = e.filter((u) => u.title.split(/[｜|·：:\s]/).map((p) => p.trim()).filter((p) => p.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(p)).some((p) => o.includes(p.toLocaleLowerCase())));
  return a.length ? a : e;
}
function $e(e, n, o) {
  const a = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), u = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return e.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${a}\\s*\\n([\\s\\S]*?)${u}`, "i"))?.[1]?.trim() || "";
}
function Tn(e, n) {
  const o = [];
  if (!n.some(it)) {
    const a = $e(e, "故事设定", "剧本");
    a && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: a,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(st)) {
    const a = $e(e, "剧本");
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
function zn(e, n) {
  const o = e.filter(it), a = e.filter(st), u = e.filter(En), d = u.filter((i) => i.kind !== "text"), p = e.filter(Mn), r = e.filter(Pn), _ = ae(e.filter(Ln)), N = ae(e.filter(An)), w = ae(e.filter(at)), v = ae(e.filter(ct)), P = [], E = new Set(n.map((i) => `${i.source}:${i.target}:${i.mode || "reference"}`)), y = (i, f, g = "reference") => {
    if (!i || !f || i.id === f.id) return;
    const x = `${i.id}:${f.id}:${g}`;
    E.has(x) || (E.add(x), P.push({ source: i.id, target: f.id, mode: g }));
  };
  o.forEach((i) => a.forEach((f) => y(i, f))), a.forEach((i) => {
    p.forEach((f) => y(i, f)), r.forEach((f) => y(i, f)), _.forEach((f) => y(i, f));
  }), u.filter((i) => i.kind === "text").forEach((i) => {
    d.forEach((f) => y(i, f));
  });
  const j = d[0];
  return j && (p.forEach((i) => y(j, i, "style_ref")), r.forEach((i) => y(j, i, "style_ref")), w.forEach((i) => y(j, i, "style_ref"))), w.forEach((i, f) => {
    Re(p, i).forEach((g) => y(g, i, "character_ref")), Re(r, i).forEach((g) => y(g, i, "composition_ref")), be(_, i, f).forEach((g) => y(g, i, "composition_ref"));
  }), v.forEach((i, f) => {
    const g = be(w, i, f), x = g.find((C) => !W(C, /尾帧|last\s*frame/)) || g[0], I = g.find((C) => W(C, /尾帧|last\s*frame/));
    y(x, i, "first_frame"), y(I, i, "last_frame"), be(N, i, f).forEach((C) => y(C, i));
  }), P;
}
function lt(e) {
  const n = e.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function dt(e) {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "当前文稿已经完整附在下面，不要再说“我先读取”，直接根据它扩写成能生产的短剧剧本。",
    "本轮必须调用 append_to_end，把最终剧本放在 args.content 中写回文稿；不要只在聊天里解释、承诺或复述步骤。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。",
    "",
    "当前文稿：",
    lt(e)
  ].join(`
`);
}
function mt(e, n) {
  const a = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    lt(n),
    ""
  ], u = {
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
  return [...a, ...u[e]].join(`
`);
}
function ye(e) {
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
function U(e, n = !1) {
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
function H(e, n) {
  return `guidedProduction.stage.${e}.${n}`;
}
function We(e) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(e);
}
function Dn() {
  const { t: e } = O(), [n, o] = s.useState(!1), a = L((k) => k.workbenchDocument), u = L((k) => k.storyboardPlan), d = L((k) => k.storyboardPlanCommitted), p = L((k) => k.timeline), r = L((k) => k.setWorkspaceMode), _ = L((k) => k.setStoryboardEditorOpen), N = L((k) => k.setCreationAiCollapsed), w = F((k) => k.nodes), v = F((k) => k.edges), P = ee((k) => k.activeScope), E = s.useMemo(
    () => Ne(w, P),
    [w, P]
  ), y = s.useMemo(
    () => w.filter((k) => Pt(k, E)),
    [E, w]
  ), j = s.useMemo(() => new Set(y.map((k) => k.id)), [y]), i = s.useMemo(
    () => v.filter((k) => j.has(k.source) && j.has(k.target)),
    [v, j]
  ), f = s.useMemo(
    () => At(p, w, E),
    [E, w, p]
  ), g = s.useMemo(
    () => tt(a),
    [a]
  ), x = s.useMemo(
    () => f.tracks.reduce((k, D) => k + D.clips.length, 0),
    [f.tracks]
  ), I = s.useMemo(
    () => _n({
      documentText: g,
      nodes: y,
      timelineClipCount: x
    }),
    [g, y, u, d, x]
  ), C = I.current, h = I.completedCount === I.stages.length, S = We(C.id) && I.plannedByStage[C.id] && !C.complete;
  s.useEffect(() => {
    const k = zn(y, i);
    if (!k.length) return;
    const D = F.getState();
    k.forEach((c) => D.connectNodes(c.source, c.target, c.mode));
  }, [i, y]);
  const M = h ? e("guidedProduction.completeAction") : C.id === "storyboard" && u && !d ? e("guidedProduction.reviewStoryboardAction") : e(S ? H(C.id, "generateAction") : H(C.id, "action")), z = s.useCallback(() => {
    const k = F.getState(), D = L.getState(), c = new Set(
      D.timeline.tracks.flatMap((m) => m.clips.map((l) => l.sourceNodeId))
    ), T = new Set(ce.read_canvas().nodes.map((m) => m.id)), B = k.nodes.filter((m) => T.has(m.id)).filter((m) => m.kind === "video" && (m.status === "success" || m.result?.type === "video")).filter((m) => !c.has(m.id)).sort((m, l) => (m.shotIndex ?? Number.MAX_SAFE_INTEGER) - (l.shotIndex ?? Number.MAX_SAFE_INTEGER));
    let R = Math.max(
      0,
      ...D.timeline.tracks.flatMap((m) => m.clips.map((l) => l.endFrame))
    );
    for (const m of B) {
      const l = ce.send_to_timeline(m.id, { startFrame: R });
      l.ok && (R = l.clip.endFrame);
    }
    r("preview");
  }, [r]), A = s.useCallback(() => {
    if (h || C.id === "review") {
      z();
      return;
    }
    if (C.id === "idea") {
      r("creation"), N(!1);
      return;
    }
    if (C.id === "script") {
      r("creation"), N(!1), de({
        action: "send",
        prompt: dt(g),
        modeId: "script",
        displayMessage: e("guidedProduction.stage.script.displayMessage"),
        autoApproveWrites: !0,
        employeeKey: U("script"),
        requiredTool: "append_to_end"
      });
      return;
    }
    if (C.id === "storyboard") {
      if (u && !d) {
        r("creation"), N(!1), _(!0);
        return;
      }
      if (S) {
        r("generation"), me({
          prompt: ye("storyboard"),
          displayMessage: e("guidedProduction.stage.storyboard.generateDisplayMessage"),
          autoApproveSafeWrites: !0,
          employeeKey: U("storyboard", !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      r("creation"), N(!1), de({
        action: "storyboard",
        displayMessage: e("guidedProduction.stage.storyboard.displayMessage"),
        shotMode: "image",
        employeeKey: U("storyboard"),
        requiredTool: "propose_storyboard_plan"
      });
      return;
    }
    if (r("generation"), C.id === "style") {
      const k = Tn(
        g,
        F.getState().nodes
      );
      k.length && ce.create_nodes(k);
    }
    me({
      prompt: S && We(C.id) ? ye(C.id) : mt(C.id, g),
      displayMessage: e(S ? H(C.id, "generateDisplayMessage") : `guidedProduction.stage.${C.id}.displayMessage`),
      autoApproveSafeWrites: !0,
      employeeKey: U(C.id, S),
      requiredTool: S ? "run_generation_batch" : "create_canvas_nodes"
    });
  }, [
    h,
    C.id,
    g,
    z,
    S,
    N,
    _,
    r,
    u,
    d,
    e
  ]);
  return /* @__PURE__ */ t.jsxs(
    "section",
    {
      className: b(
        "relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper",
        "px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      ),
      "aria-label": e("guidedProduction.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center gap-3", children: [
          /* @__PURE__ */ t.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: h ? /* @__PURE__ */ t.jsx(te, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ t.jsx(He, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: h ? e("guidedProduction.complete") : e("guidedProduction.step", {
                current: I.currentIndex + 1,
                total: I.stages.length
              }) }),
              /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: e(h ? "guidedProduction.completeTitle" : H(C.id, "title")) }),
              h ? null : /* @__PURE__ */ t.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: e(H(C.id, "owner")) })
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: e(h ? "guidedProduction.completeDescription" : H(C.id, "description")) })
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: b(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4",
                "border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer",
                "shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md"
              ),
              onClick: A,
              children: [
                M,
                /* @__PURE__ */ t.jsx(ve, { size: 15, stroke: 2 })
              ]
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: b(
                "grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line",
                "bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              "aria-label": e(n ? "guidedProduction.collapse" : "guidedProduction.expand"),
              "aria-expanded": n,
              onClick: () => o((k) => !k),
              children: n ? /* @__PURE__ */ t.jsx(Ht, { size: 16 }) : /* @__PURE__ */ t.jsx(Ce, { size: 16 })
            }
          )
        ] }),
        n ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: b(
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
                  completed: I.completedCount,
                  total: I.stages.length
                }) })
              ] }),
              /* @__PURE__ */ t.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: I.stages.map((k, D) => {
                const c = !h && k.id === C.id;
                return /* @__PURE__ */ t.jsxs(
                  "li",
                  {
                    className: b(
                      "min-w-0 rounded-nomi border p-2.5",
                      k.complete ? "border-transparent bg-nomi-ink-05" : c ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ t.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        k.complete ? /* @__PURE__ */ t.jsx(te, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ t.jsx(qt, { size: 10, className: b("mx-0.5 shrink-0", c ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro text-nomi-ink-40", children: e("guidedProduction.shortStep", { current: D + 1 }) })
                      ] }),
                      /* @__PURE__ */ t.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: e(H(k.id, "title")) })
                    ]
                  },
                  k.id
                );
              }) })
            ]
          }
        ) : null
      ]
    }
  );
}
function pt(e) {
  return String(e.meta?.productionStage ?? "").trim().toLowerCase();
}
function Bn(e) {
  return [
    e.kind,
    e.title,
    e.prompt,
    pt(e),
    e.result?.type,
    e.result?.text
  ].filter(Boolean).join(" ").toLowerCase();
}
function we(e, n) {
  return e.status !== "success" && !e.result ? !1 : n ? e.result?.type === n : !0;
}
function ut(e, n) {
  const o = pt(e), a = Bn(e);
  switch (n) {
    case "script":
      return o === "script" || e.kind === "text" && /剧本|台词|对白|shot script/.test(a);
    case "storyboard":
      return o === "storyboard" || /分镜|storyboard/.test(a);
    case "motion":
      return o === "vid_prompt" || o === "motion" || /动态设计|运镜|镜头运动|视频提示词|camera move/.test(a);
    case "keyframe":
      return o === "img_prompt" || e.kind === "keyframe" || /首帧|尾帧|关键帧|keyframe/.test(a);
    case "video":
      return e.kind === "video" || e.result?.type === "video" || o === "video";
    case "review":
      return !1;
  }
}
function Rn(e, n) {
  const o = e.filter((p) => ut(p, n)), a = o.some((p) => p.status === "error"), u = o.some((p) => p.status === "queued" || p.status === "running");
  let d = !1;
  return n === "script" || n === "motion" ? d = o.length > 0 : n === "storyboard" || n === "keyframe" ? d = o.some((p) => we(p, "image")) : d = o.some((p) => we(p, "video")), {
    complete: d,
    planned: o.length > 0,
    failed: a,
    running: u
  };
}
function je(e) {
  const { nodes: n, timelineSourceNodeIds: o = /* @__PURE__ */ new Set() } = e, a = ["script", "storyboard", "motion", "keyframe", "video"].map((v) => ({
    id: v,
    ...Rn(n, v)
  })), u = new Set(
    n.filter((v) => ut(v, "video") && we(v, "video")).map((v) => v.id)
  ), p = {
    id: "review",
    complete: Array.from(u).some((v) => o.has(v)),
    planned: u.size > 0,
    failed: !1,
    running: !1
  }, r = [...a, p], _ = r.findIndex((v) => !v.complete), N = _ >= 0 ? _ : r.length - 1, w = r.filter((v) => v.complete).length;
  return {
    stages: r,
    current: r[N],
    currentIndex: N,
    completedCount: w,
    productionCompletedCount: a.filter((v) => v.complete).length,
    productionStageCount: a.length,
    complete: w === r.length,
    hasFailure: r.some((v) => v.failed),
    running: r.some((v) => v.running)
  };
}
function $n(e) {
  return e.hasFailure ? "needsAttention" : e.running ? "running" : e.complete ? "complete" : e.current.id === "review" ? "review" : e.current.id === "video" ? e.current.planned ? "videoPlanned" : "videoMissing" : "stageMissing";
}
function Y(e, n) {
  return e(`generationCommon.director.stages.${n}.title`);
}
function ie(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.globalScope") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : e("generationCommon.director.noShotSelected");
}
function Wn(e, n) {
  const o = n.current;
  return n.complete ? e("generationCommon.director.nextIncomplete") : o.id === "review" ? e("generationCommon.director.reviewAction") : o.running ? e("generationCommon.director.runningAction", { stage: Y(e, o.id) }) : o.id === "script" ? e("generationCommon.director.scriptAction") : o.id === "storyboard" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: Y(e, o.id) }) : e("generationCommon.director.storyboardAction") : o.id === "motion" ? e("generationCommon.director.motionAction") : o.id === "keyframe" ? o.planned ? e("generationCommon.director.stagePlannedAction", { stage: Y(e, o.id) }) : e("generationCommon.director.keyframeAction") : o.planned ? e("generationCommon.director.stagePlannedAction", { stage: Y(e, o.id) }) : e("generationCommon.director.videoAction");
}
function On(e) {
  return e === "storyboard" || e === "keyframe" || e === "video";
}
function Fn({ projectName: e }) {
  const { t: n } = O(), o = F((c) => c.nodes), a = L((c) => c.timeline), u = L((c) => c.workbenchDocument), d = L((c) => c.setWorkspaceMode), p = L((c) => c.setActiveCategoryId), r = L((c) => c.setCreationAiCollapsed), _ = ee((c) => c.activeScope), N = ee((c) => c.setActiveScope), w = X((c) => c.mode), v = X((c) => c.setMode), P = X((c) => c.directoryOpen), E = X((c) => c.toggleDirectory), y = s.useMemo(() => qe(o), [o]), j = s.useMemo(
    () => Ne(o, _),
    [o, _]
  ), i = s.useMemo(
    () => o.filter((c) => Lt(c, j)),
    [j, o]
  ), f = s.useMemo(
    () => new Set(a.tracks.flatMap((c) => c.clips.map((T) => T.sourceNodeId))),
    [a.tracks]
  ), g = s.useMemo(
    () => je({ nodes: i, timelineSourceNodeIds: f }),
    [i, f]
  ), x = s.useMemo(
    () => Tt(y, j),
    [j, y]
  ), I = s.useMemo(
    () => _e(y, j, -1),
    [j, y]
  ), C = s.useMemo(
    () => _e(y, j, 1),
    [j, y]
  ), h = s.useMemo(
    () => tt(u),
    [u]
  ), S = s.useCallback((c) => {
    p("shots"), N(c), d("generation");
  }, [p, N, d]), M = s.useCallback(() => {
    const c = Ie(y);
    if (!c.length) return null;
    const T = Math.max(-1, x?.absoluteIndex ?? -1), B = [...c.slice(T + 1), ...c.slice(0, T + 1)];
    for (const R of B) {
      const m = o.filter((G) => R.shot.nodeIds.includes(G.id));
      if (!je({ nodes: m, timelineSourceNodeIds: f }).complete) return R.shot.scope;
    }
    return null;
  }, [o, y, x?.absoluteIndex, f]), z = s.useCallback(() => {
    const c = L.getState(), T = new Set(
      c.timeline.tracks.flatMap((l) => l.clips.map((G) => G.sourceNodeId))
    ), B = new Set(i.map((l) => l.id)), R = F.getState().nodes.filter((l) => B.has(l.id)).filter((l) => l.kind === "video" && (l.status === "success" || l.result?.type === "video")).filter((l) => !T.has(l.id));
    let m = Math.max(
      0,
      ...c.timeline.tracks.flatMap((l) => l.clips.map((G) => G.endFrame))
    );
    for (const l of R) {
      const G = ce.send_to_timeline(l.id, { startFrame: m });
      G.ok && (m = G.clip.endFrame);
    }
    window.dispatchEvent(new CustomEvent("nomi-set-timeline-expanded", { detail: { expanded: !0 } })), d("preview");
  }, [i, d]), A = s.useCallback(() => {
    if (j?.kind !== "shot") {
      const T = Ie(y)[0]?.shot;
      T && S(T.scope);
      return;
    }
    if (g.complete) {
      const T = M();
      T ? S(T) : d("preview");
      return;
    }
    const c = g.current;
    if (!c.running) {
      if (c.id === "review") {
        z();
        return;
      }
      if (c.id === "script") {
        d("creation"), r(!1), de({
          action: "send",
          prompt: dt(h),
          modeId: "script",
          displayMessage: n("generationCommon.director.scopeScriptMessage", { scope: ie(n, j) }),
          autoApproveWrites: !0,
          employeeKey: U("script"),
          requiredTool: "append_to_end"
        });
        return;
      }
      if (c.id === "storyboard" && !c.planned) {
        d("creation"), r(!1), de({
          action: "storyboard",
          displayMessage: n("generationCommon.director.scopeStoryboardMessage", { scope: ie(n, j) }),
          shotMode: "image",
          employeeKey: U("storyboard"),
          requiredTool: "propose_storyboard_plan"
        });
        return;
      }
      if (d("generation"), c.planned && On(c.id)) {
        me({
          prompt: ye(c.id),
          displayMessage: n("generationCommon.director.scopeGenerateMessage", {
            scope: ie(n, j),
            stage: Y(n, c.id)
          }),
          autoApproveSafeWrites: !0,
          employeeKey: U(c.id, !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      (c.id === "motion" || c.id === "keyframe" || c.id === "video") && me({
        prompt: mt(c.id, h),
        displayMessage: n("generationCommon.director.scopeCreateMessage", {
          scope: ie(n, j),
          stage: Y(n, c.id)
        }),
        autoApproveSafeWrites: !0,
        employeeKey: U(c.id),
        requiredTool: "create_canvas_nodes"
      });
    }
  }, [
    j,
    h,
    M,
    y,
    g,
    S,
    z,
    r,
    d,
    n
  ]);
  if (!y.isProductionProject || !j) return null;
  const k = j.kind === "shot", D = Math.round(g.productionCompletedCount / g.productionStageCount * 100);
  return /* @__PURE__ */ t.jsx(
    "section",
    {
      className: b(
        "production-director-bar relative z-[65] shrink-0 border-b border-nomi-line",
        "bg-[linear-gradient(90deg,var(--nomi-paper),color-mix(in_oklch,var(--nomi-accent)_5%,var(--nomi-paper)))]",
        "px-3 py-2"
      ),
      "data-production-director": "true",
      "data-director-mode": w,
      "aria-label": n("generationCommon.director.aria"),
      children: /* @__PURE__ */ t.jsxs("div", { className: "flex min-w-0 items-center gap-2.5 max-[700px]:flex-wrap", children: [
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: b(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-nomi border px-3",
              P ? "border-nomi-accent bg-nomi-accent-soft text-nomi-accent" : "border-nomi-line bg-nomi-paper text-nomi-ink-70 hover:bg-nomi-ink-05"
            ),
            "aria-label": n(P ? "generationCommon.director.closeDirectory" : "generationCommon.director.openDirectory"),
            "aria-pressed": P,
            onClick: E,
            children: [
              /* @__PURE__ */ t.jsx(Qe, { size: 16, stroke: 1.9 }),
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
              disabled: !I,
              "aria-label": n("generationCommon.director.previousShot"),
              title: n("generationCommon.director.previousShot"),
              onClick: () => I && S(I.scope),
              children: /* @__PURE__ */ t.jsx(Yt, { size: 17 })
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !C,
              "aria-label": n("generationCommon.director.nextShot"),
              title: n("generationCommon.director.nextShot"),
              onClick: () => C && S(C.scope),
              children: /* @__PURE__ */ t.jsx(le, { size: 17 })
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "min-w-[190px] shrink-0 max-[900px]:min-w-0 max-[700px]:min-w-[110px] max-[700px]:flex-1", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ t.jsx(Xe, { size: 15, stroke: 1.9, className: "shrink-0 text-nomi-accent" }),
            /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: ie(n, j) })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-micro text-nomi-ink-50 max-[700px]:hidden", children: k && x ? n("generationCommon.director.shotPosition", {
            project: e || n("generationCommon.productionHierarchy.season"),
            current: x.absoluteIndex + 1,
            total: y.totalShotCount
          }) : n("generationCommon.director.seasonSummary", {
            episodes: y.episodes.length,
            shots: y.totalShotCount
          }) })
        ] }),
        k ? /* @__PURE__ */ t.jsx("ol", { className: "m-0 hidden min-w-0 flex-1 list-none items-center gap-1 p-0 min-[1120px]:flex", children: g.stages.map((c, T) => {
          const B = !g.complete && c.id === g.current.id;
          return /* @__PURE__ */ t.jsxs("li", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
            /* @__PURE__ */ t.jsxs(
              "div",
              {
                className: b(
                  "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-1.5",
                  c.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : B ? "bg-nomi-accent-soft text-nomi-accent ring-1 ring-inset ring-nomi-accent/30" : "bg-nomi-ink-05 text-nomi-ink-40"
                ),
                "aria-current": B ? "step" : void 0,
                children: [
                  /* @__PURE__ */ t.jsx("span", { className: "grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[9px] font-bold", children: c.complete ? /* @__PURE__ */ t.jsx(te, { size: 11, stroke: 2.5 }) : T + 1 }),
                  /* @__PURE__ */ t.jsx("span", { className: "truncate text-micro font-semibold", children: Y(n, c.id) })
                ]
              }
            ),
            T < g.stages.length - 1 ? /* @__PURE__ */ t.jsx(ve, { size: 11, className: "shrink-0 text-nomi-ink-20" }) : null
          ] }, c.id);
        }) }) : /* @__PURE__ */ t.jsx("div", { className: "min-w-0 flex-1 text-caption text-nomi-ink-60", children: n("generationCommon.director.publicHint") }),
        k ? /* @__PURE__ */ t.jsxs("div", { className: "hidden w-[90px] shrink-0 text-right min-[900px]:block", children: [
          /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold text-nomi-ink-60", children: n("generationCommon.director.currentShotProgress", { percent: D }) }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-nomi-ink-10", children: /* @__PURE__ */ t.jsx(
            "span",
            {
              className: "block h-full rounded-full bg-nomi-accent transition-[width]",
              style: { width: `${D}%` }
            }
          ) })
        ] }) : null,
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: b(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-3.5",
              "border-0 bg-nomi-accent text-white text-body-sm font-semibold shadow-nomi-sm",
              "transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-accent focus-visible:ring-offset-2",
              k && g.current.running && "cursor-wait opacity-70",
              "max-[700px]:order-10 max-[700px]:w-full max-[700px]:justify-center"
            ),
            disabled: k && g.current.running,
            "data-director-primary-action": k ? g.current.id : "enter-shot",
            onClick: A,
            children: [
              k && g.complete ? /* @__PURE__ */ t.jsx(te, { size: 15 }) : /* @__PURE__ */ t.jsx(He, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "max-w-[180px] truncate", children: k ? Wn(n, g) : n("generationCommon.director.enterFirstShot") }),
              /* @__PURE__ */ t.jsx(ve, { size: 15 })
            ]
          }
        ),
        /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            className: b(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi border border-nomi-line px-2.5",
              "bg-nomi-paper text-caption font-semibold text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink"
            ),
            "aria-label": n(w === "guided" ? "generationCommon.director.switchToProfessional" : "generationCommon.director.switchToGuided"),
            onClick: () => {
              const c = w === "guided" ? "professional" : "guided";
              v(c), c === "guided" && d("generation");
            },
            children: [
              w === "guided" ? /* @__PURE__ */ t.jsx(nn, { size: 15 }) : /* @__PURE__ */ t.jsx(Xt, { size: 15 }),
              /* @__PURE__ */ t.jsx("span", { className: "hidden min-[1280px]:inline", children: n(w === "guided" ? "generationCommon.director.professionalMode" : "generationCommon.director.guidedMode") })
            ]
          }
        )
      ] })
    }
  );
}
function fe(e) {
  return e === null ? "unassigned" : String(e);
}
function Kn(e, n) {
  return n ? n.kind === "global" ? e("generationCommon.director.sidebar.global") : n.kind === "episode" ? e("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? e("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : e("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : "";
}
function Gn(e, n) {
  return n.episode === null ? e("generationCommon.productionHierarchy.unassignedEpisode") : e("generationCommon.productionHierarchy.episode", { episode: n.episode });
}
function Un({
  projectName: e,
  hierarchy: n,
  nodes: o,
  timelineSourceNodeIds: a = /* @__PURE__ */ new Set(),
  activeScope: u,
  onSelectScope: d,
  onClose: p
}) {
  const { t: r } = O(), [_, N] = s.useState(""), [w, v] = s.useState("all"), [P, E] = s.useState(() => {
    const x = u?.episode;
    return new Set(x !== void 0 ? [fe(x)] : []);
  }), y = s.useMemo(() => new Map(o.map((x) => [x.id, x])), [o]);
  s.useEffect(() => {
    if (u?.kind === "global") return;
    const x = fe(u?.episode ?? null);
    E((I) => I.has(x) ? I : /* @__PURE__ */ new Set([...I, x]));
  }, [u]);
  const j = s.useCallback((x) => {
    const I = x.nodeIds.flatMap((S) => {
      const M = y.get(S);
      return M ? [M] : [];
    }), C = je({ nodes: I, timelineSourceNodeIds: a }), h = `${x.scope.shotNumber} ${I.map((S) => `${S.title} ${S.prompt ?? ""}`).join(" ")}`.toLowerCase();
    return { progress: C, searchable: h, status: $n(C) };
  }, [y, a]), i = s.useMemo(() => {
    const x = _.trim().toLowerCase();
    return n.episodes.map((I) => ({
      episode: I,
      shots: I.shots.filter((C) => {
        const h = j(C);
        return x && !h.searchable.includes(x) ? !1 : w === "failed" ? h.progress.hasFailure : w === "complete" ? h.progress.complete : w === "unfinished" ? !h.progress.complete : !0;
      })
    })).filter(({ shots: I }) => I.length > 0 || !x && w === "all");
  }, [w, n.episodes, _, j]), f = s.useMemo(() => {
    for (const x of n.episodes)
      for (const I of x.shots)
        if (!j(I).progress.complete) return I;
    return null;
  }, [n.episodes, j]);
  if (!n.isProductionProject || !u) return null;
  const g = Ee(u);
  return /* @__PURE__ */ t.jsxs(
    "aside",
    {
      className: b(
        "production-hierarchy-navigator relative z-[70] flex h-full w-[276px] shrink-0 flex-col overflow-hidden",
        "border-r border-workbench-border bg-nomi-paper shadow-[8px_0_24px_rgba(20,20,24,0.04)]",
        "max-[1100px]:absolute max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-workbench-pop"
      ),
      "data-production-hierarchy": "true",
      "aria-label": r("generationCommon.director.sidebar.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("header", { className: "shrink-0 border-b border-nomi-line px-3 py-3", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ t.jsx("span", { className: "mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent", children: /* @__PURE__ */ t.jsx(Me, { size: 17, stroke: 1.9 }) }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40", children: r("generationCommon.director.sidebar.title") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 truncate text-body-sm font-semibold text-nomi-ink", children: e || r("generationCommon.productionHierarchy.season") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-nomi-ink-50", children: r("generationCommon.director.seasonSummary", {
                episodes: n.episodes.filter((x) => x.episode !== null).length,
                shots: n.totalShotCount
              }) })
            ] }),
            p ? /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                className: "grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "aria-label": r("generationCommon.director.closeDirectory"),
                onClick: p,
                children: /* @__PURE__ */ t.jsx(zt, { size: 16, stroke: 1.8 })
              }
            ) : null
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: b(
                "mt-3 flex w-full items-center gap-2 rounded-nomi border border-nomi-accent/25",
                "bg-nomi-accent-soft px-2.5 py-2 text-left hover:border-nomi-accent/50"
              ),
              onClick: () => f && d(f.scope),
              disabled: !f,
              children: [
                f ? /* @__PURE__ */ t.jsx(Dt, { size: 15, className: "shrink-0 text-nomi-accent" }) : /* @__PURE__ */ t.jsx(ke, { size: 15, className: "shrink-0 text-workbench-success" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: r(f ? "generationCommon.director.sidebar.continueIncomplete" : "generationCommon.director.sidebar.allComplete") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-50", children: f ? Kn(r, f.scope) : r("generationCommon.director.sidebar.allCompleteHint") })
                ] }),
                f ? /* @__PURE__ */ t.jsx(le, { size: 15, className: "text-nomi-ink-40" }) : null
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("label", { className: "mt-2.5 flex h-8 items-center gap-2 rounded-nomi border border-nomi-line bg-workbench-bg px-2.5 focus-within:border-nomi-accent", children: [
            /* @__PURE__ */ t.jsx(Bt, { size: 14, className: "shrink-0 text-nomi-ink-40" }),
            /* @__PURE__ */ t.jsx(
              "input",
              {
                className: "min-w-0 flex-1 border-0 bg-transparent p-0 text-caption text-nomi-ink outline-none placeholder:text-nomi-ink-30",
                value: _,
                placeholder: r("generationCommon.director.sidebar.searchPlaceholder"),
                "aria-label": r("generationCommon.director.sidebar.searchAria"),
                onChange: (x) => N(x.currentTarget.value)
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(
            "div",
            {
              className: "mt-2 grid grid-cols-4 gap-1",
              role: "group",
              "aria-label": r("generationCommon.director.sidebar.filterAria"),
              children: [
                ["all", "filterAll"],
                ["unfinished", "filterUnfinished"],
                ["failed", "filterFailed"],
                ["complete", "filterComplete"]
              ].map(([x, I]) => /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  className: b(
                    "h-7 rounded-nomi-sm border-0 px-1 text-micro font-semibold",
                    w === x ? "bg-nomi-ink text-nomi-paper" : "bg-nomi-ink-05 text-nomi-ink-50 hover:text-nomi-ink"
                  ),
                  "aria-pressed": w === x,
                  onClick: () => v(x),
                  children: r(`generationCommon.director.sidebar.${I}`)
                },
                x
              ))
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]", children: [
          n.globalNodeIds.length ? /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: b(
                "mb-1 flex w-full items-center gap-2 rounded-nomi border px-2.5 py-2 text-left",
                g === "global" ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent bg-transparent hover:bg-nomi-ink-05"
              ),
              "data-production-scope": "global",
              "aria-current": g === "global" ? "page" : void 0,
              onClick: () => d({ kind: "global", episode: null, shotNumber: 0 }),
              children: [
                /* @__PURE__ */ t.jsx(Rt, { size: 16, stroke: 1.8, className: "shrink-0 text-nomi-ink-50" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: r("generationCommon.director.sidebar.global") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block truncate text-micro text-nomi-ink-40", children: r("generationCommon.director.sidebar.globalDescription") })
                ] }),
                /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: n.globalNodeIds.length })
              ]
            }
          ) : null,
          i.map(({ episode: x, shots: I }) => {
            const C = fe(x.episode), h = P.has(C), S = x.shots.filter((M) => j(M).progress.complete).length;
            return /* @__PURE__ */ t.jsxs("section", { className: "mb-1 overflow-hidden rounded-nomi border border-nomi-line", children: [
              /* @__PURE__ */ t.jsxs(
                "button",
                {
                  type: "button",
                  className: "flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left hover:bg-nomi-ink-10",
                  "aria-expanded": h,
                  onClick: () => E((M) => {
                    const z = new Set(M);
                    return z.has(C) ? z.delete(C) : z.add(C), z;
                  }),
                  children: [
                    h ? /* @__PURE__ */ t.jsx(Ce, { size: 15 }) : /* @__PURE__ */ t.jsx(le, { size: 15 }),
                    /* @__PURE__ */ t.jsx(Xe, { size: 16, stroke: 1.8, className: "text-nomi-accent" }),
                    /* @__PURE__ */ t.jsx("span", { className: "min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink", children: Gn(r, x) }),
                    /* @__PURE__ */ t.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: r("generationCommon.director.sidebar.episodeProgress", {
                      completed: S,
                      total: x.shots.length
                    }) })
                  ]
                }
              ),
              h ? /* @__PURE__ */ t.jsxs("div", { className: "space-y-1 bg-nomi-paper p-1.5", children: [
                x.episode !== null && x.overviewNodeIds.length ? /* @__PURE__ */ t.jsxs(
                  "button",
                  {
                    type: "button",
                    className: b(
                      "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left",
                      g === `episode:${x.episode}` ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent hover:bg-nomi-ink-05"
                    ),
                    "data-production-scope": `episode:${x.episode}`,
                    "aria-current": g === `episode:${x.episode}` ? "page" : void 0,
                    onClick: () => d({ kind: "episode", episode: x.episode, shotNumber: 0 }),
                    children: [
                      /* @__PURE__ */ t.jsx(Me, { size: 14, className: "text-nomi-ink-50" }),
                      /* @__PURE__ */ t.jsx("span", { className: "text-caption font-medium text-nomi-ink", children: r("generationCommon.director.sidebar.episodeOverview") })
                    ]
                  }
                ) : null,
                I.map((M) => {
                  const z = Ee(M.scope), A = j(M);
                  return /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: b(
                        "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left",
                        g === z ? "border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]" : "border-transparent hover:bg-nomi-ink-05"
                      ),
                      "data-production-scope": z,
                      "data-shot-status": A.progress.complete ? "complete" : A.progress.hasFailure ? "failed" : "unfinished",
                      "aria-current": g === z ? "true" : void 0,
                      onClick: () => d(M.scope),
                      children: [
                        /* @__PURE__ */ t.jsx(
                          "span",
                          {
                            className: b(
                              "grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums",
                              g === z ? "bg-nomi-accent text-white" : A.progress.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : A.progress.hasFailure ? "bg-[color-mix(in_oklch,var(--workbench-danger)_12%,transparent)] text-workbench-danger" : "bg-nomi-ink-05 text-nomi-ink-60"
                            ),
                            children: A.progress.complete ? /* @__PURE__ */ t.jsx(te, { size: 13 }) : M.scope.shotNumber
                          }
                        ),
                        /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ t.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: r("generationCommon.director.sidebar.shot", { shot: M.scope.shotNumber }) }),
                          /* @__PURE__ */ t.jsxs("span", { className: b(
                            "mt-0.5 flex items-center gap-1 text-micro",
                            A.progress.hasFailure ? "text-workbench-danger" : "text-nomi-ink-40"
                          ), children: [
                            A.progress.hasFailure ? /* @__PURE__ */ t.jsx(Ke, { size: 11 }) : null,
                            r(`generationCommon.director.sidebar.status.${A.status}`, {
                              stage: r(`generationCommon.director.stages.${A.progress.current.id}.title`)
                            })
                          ] })
                        ] }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold tabular-nums text-nomi-ink-40", children: r("generationCommon.director.sidebar.stageProgress", {
                          completed: A.progress.productionCompletedCount,
                          total: A.progress.productionStageCount
                        }) })
                      ]
                    },
                    z
                  );
                }),
                I.length ? null : /* @__PURE__ */ t.jsx("div", { className: "px-2 py-4 text-center text-micro text-nomi-ink-40", children: r("generationCommon.director.sidebar.emptyFilter") })
              ] }) : null
            ] }, C);
          })
        ] })
      ]
    }
  );
}
const Vn = Q(
  "创作区",
  () => import("./CreationWorkspace-FV9GavQQ.js")
), Hn = Q(
  "生成区",
  () => import("./GenerationWorkspace-BVX_hDPa.js")
), qn = Q("预览区", () => import("./PreviewWorkspace-DM-v4FB0.js")), Xn = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, Jn = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function Yn({ label: e }) {
  const { t: n } = O(), o = n("workspace.loading", { label: e });
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: b(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ t.jsx(Fe, { size: 28, label: o })
    }
  );
}
function ge({
  active: e,
  children: n,
  label: o
}) {
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: b(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !e,
      children: /* @__PURE__ */ t.jsx(
        s.Suspense,
        {
          fallback: e ? /* @__PURE__ */ t.jsx(Yn, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function Qn() {
  if (typeof window > "u") return "generation";
  try {
    const e = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return Jn[e] || "generation";
  } catch {
    return "generation";
  }
}
function Oe(e) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = Xn[e];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function Zn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function eo({
  generation: e,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: a,
  projectName: u,
  onBackToLibrary: d,
  onOpenModelCatalog: p,
  onRenameProject: r
}) {
  const { t: _ } = O(), N = L((m) => m.workspaceMode), w = L(
    (m) => m.setWorkspaceMode
  ), v = L((m) => m.categories), P = L((m) => m.setActiveCategoryId), E = F((m) => m.nodes), y = s.useMemo(
    () => qe(E),
    [E]
  ), j = ee((m) => m.activeScope), i = ee((m) => m.syncProject), f = ee((m) => m.setActiveScope), g = s.useMemo(
    () => Ne(E, j),
    [E, j]
  ), x = X((m) => m.mode), I = X((m) => m.directoryOpen), C = X((m) => m.setDirectoryOpen), h = y.isProductionProject, S = h && x === "guided", M = L((m) => m.timeline), z = s.useMemo(
    () => new Set(
      M.tracks.flatMap((m) => m.clips.map((l) => l.sourceNodeId))
    ),
    [M.tracks]
  ), [A, k] = s.useState(() => [N]), [D, c] = s.useState(!1), T = s.useRef(null);
  s.useEffect(() => {
    i(a ?? null, E);
  }, [E, a, i]);
  const B = window.nomiDesktop?.platform === "win32";
  s.useEffect(() => {
    const m = L.getState().workspaceMode;
    Oe(m);
    const l = () => {
      w(Qn());
    };
    return window.addEventListener("popstate", l), () => window.removeEventListener("popstate", l);
  }, [w]), s.useEffect(() => {
    k(
      (m) => m.includes(N) ? m : [...m, N]
    );
  }, [N]);
  const R = s.useCallback(
    (m) => {
      $t(m) && (w(m), Oe(m));
    },
    [w]
  );
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      className: b(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": N,
      children: [
        B ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: b(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": _("appBar.windowTitleBar"),
            onDoubleClick: Ge,
            children: [
              /* @__PURE__ */ t.jsx(
                "button",
                {
                  ref: T,
                  type: "button",
                  className: b(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": _("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": D,
                  onClick: () => c((m) => !m),
                  children: /* @__PURE__ */ t.jsx(Ue, { markSize: 18, wordSize: 14 })
                }
              ),
              D ? /* @__PURE__ */ t.jsx(et, { anchorEl: T.current, onClose: () => c(!1) }) : null,
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              S ? null : /* @__PURE__ */ t.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ t.jsx(Ze, {}) }),
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: b(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": _("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: b(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": _("appBar.openBrowser"),
                      title: _("appBar.browser"),
                      onClick: Zn,
                      children: [
                        /* @__PURE__ */ t.jsx(Ve, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ t.jsx("span", { children: _("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ t.jsx(Wt, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ t.jsx(
          mn,
          {
            workspaceMode: N,
            onWorkspaceModeChange: R,
            projectName: u,
            onBackToLibrary: d,
            onOpenModelCatalog: p,
            onRenameProject: r,
            directorMode: S
          }
        ),
        h ? /* @__PURE__ */ t.jsx(Fn, { projectName: u }) : /* @__PURE__ */ t.jsx(Dn, {}),
        /* @__PURE__ */ t.jsxs(
          "main",
          {
            className: b(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              N === "generation" && S && I ? /* @__PURE__ */ t.jsx(
                Un,
                {
                  projectName: u,
                  hierarchy: y,
                  nodes: E,
                  timelineSourceNodeIds: z,
                  activeScope: g,
                  onSelectScope: (m) => {
                    P("shots"), f(m);
                  },
                  onClose: () => C(!1)
                }
              ) : null,
              N === "generation" && !S ? /* @__PURE__ */ t.jsx(jn, { projectId: a ?? null, categories: v }) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                A.includes("creation") ? /* @__PURE__ */ t.jsx(
                  ge,
                  {
                    active: N === "creation",
                    label: _("workspace.creation"),
                    children: /* @__PURE__ */ t.jsx(Vn, {})
                  }
                ) : null,
                A.includes("generation") ? /* @__PURE__ */ t.jsx(
                  ge,
                  {
                    active: N === "generation",
                    label: _("workspace.generation"),
                    children: /* @__PURE__ */ t.jsx(
                      Hn,
                      {
                        canvas: e,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                A.includes("preview") ? /* @__PURE__ */ t.jsx(
                  ge,
                  {
                    active: N === "preview",
                    label: _("workspace.preview"),
                    children: /* @__PURE__ */ t.jsx(qn, {})
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
const yo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: eo
}, Symbol.toStringTag, { value: "Module" }));
export {
  De as C,
  Yt as I,
  yo as W,
  vo as b,
  tt as e,
  go as g,
  ko as m
};
