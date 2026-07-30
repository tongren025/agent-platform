import { aS as Se, e3 as D, S as s, dT as K, dU as Ue, cR as re, c2 as Fe, cS as Ke, co as Ve, ec as He, cn as le, c3 as qe, cf as t, aK as p, l as ce, bw as Je, dY as Xe, b as Ye, K as Qe, O as Ze, a0 as et, J as Ce, a8 as T, I as tt, bQ as _e, z as Ee, M as nt, L as rt, k as Ie, r as ot, e4 as L, a3 as st, a1 as q, a4 as J, a2 as X, s as at, cg as U, dZ as it, dd as ct, c8 as lt, bc as dt, u as mt, cd as pt, a7 as ut } from "./agentStudioMount-CNVmpr5A.js";
import { I as ht } from "./IconDownload-BuoLeJCl.js";
import { I as Le, a as bt } from "./IconChevronRight-CLEQFfP4.js";
import { I as xt } from "./IconListCheck-DeRV0Fax.js";
import { I as Te } from "./IconMap-fvu29d96.js";
import { u as ft } from "./journeyTourActivity-Br4kxmhH.js";
import { D as Me, d as de, r as me } from "./guidedProductionEvents-DEr6wcqn.js";
import { I as pe } from "./IconCircleCheck-DEgDFGrF.js";
import { I as gt } from "./IconBooks-BifYVK5i.js";
import { I as kt } from "./IconBulb-aTW65K6s.js";
import { b as vt, I as wt, a as yt } from "./IconFolder-BTaPDGgk.js";
import { I as jt } from "./IconLayoutSidebarLeftExpand-DJ9bj-gv.js";
import { I as Nt } from "./IconArrowRight-Cfql7j81.js";
import { g as oe } from "./generationCanvasTools-dJicdKdF.js";
const St = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], ue = Se("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", St);
const Ct = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], _t = Se("outline", "tags", "Tags", Ct), W = ["model", "storyboard", "generated", "exported"];
function Ae() {
  const { t: e } = D(), n = s.useMemo(
    () => [
      { key: "model", label: e("onboarding.steps.model.label"), hint: e("onboarding.steps.model.hint") },
      { key: "storyboard", label: e("onboarding.steps.storyboard.label"), hint: e("onboarding.steps.storyboard.hint") },
      { key: "generated", label: e("onboarding.steps.generated.label"), hint: e("onboarding.steps.generated.hint") },
      { key: "exported", label: e("onboarding.steps.exported.label"), hint: e("onboarding.steps.exported.hint") }
    ],
    [e]
  ), o = K((h) => h.nodes), { hasTextModel: a } = Ue(), u = ft(), d = s.useMemo(
    () => ({
      model: a === !0,
      storyboard: o.length > 0,
      generated: o.some((h) => h.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [a, o]
  ), [i, c] = s.useState(() => re()), [k, b] = s.useState(() => Fe()), [f, j] = s.useState(() => !Ke()), _ = s.useRef(null), [N, g] = s.useState(null);
  s.useEffect(() => {
    let h = !1;
    for (const S of W)
      d[S] && !i[S] && (Ve(S), h = !0);
    h && c(re());
  }, [d, i]), s.useEffect(() => {
    const h = () => c(re());
    return window.addEventListener("storage", h), window.addEventListener("focus", h), () => {
      window.removeEventListener("storage", h), window.removeEventListener("focus", h);
    };
  }, []);
  const C = s.useMemo(
    () => ({
      model: i.model || d.model,
      storyboard: i.storyboard || d.storyboard,
      generated: i.generated || d.generated,
      exported: i.exported || d.exported
    }),
    [i, d]
  ), r = W.filter((h) => C[h]).length, x = r === W.length, y = n.find((h) => !C[h.key])?.key ?? null, v = s.useCallback(() => {
    const h = _.current;
    if (!h) return;
    const S = h.getBoundingClientRect();
    g({ top: S.bottom + 8, right: Math.max(8, window.innerWidth - S.right) });
  }, []);
  s.useEffect(() => {
    if (f)
      return v(), window.addEventListener("resize", v), () => window.removeEventListener("resize", v);
  }, [f, v]), s.useEffect(() => {
    if (!f) return;
    const h = (S) => {
      const A = S.target;
      A && A.closest("[data-onboarding-checklist-root]") || j(!1);
    };
    return window.addEventListener("pointerdown", h, !0), () => window.removeEventListener("pointerdown", h, !0);
  }, [f]);
  const I = s.useCallback(() => {
    j((h) => {
      const S = !h;
      return He(!S), S;
    });
  }, []), w = s.useCallback(() => {
    le(), b(!0);
  }, []);
  return s.useEffect(() => {
    k || x || qe(Date.now()) && (le(), b(!0));
  }, [k, x]), x || u || k ? null : /* @__PURE__ */ t.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ t.jsxs(
      "button",
      {
        type: "button",
        ref: _,
        onClick: I,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": e("onboarding.progressLabel", { done: r, total: W.length }),
        "aria-expanded": f,
        className: p(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          f && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ t.jsx(xt, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ t.jsx("span", { className: "max-[700px]:hidden", children: e("onboarding.trigger") }),
          /* @__PURE__ */ t.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            r,
            "/",
            W.length
          ] })
        ]
      }
    ),
    f && N ? /* @__PURE__ */ t.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": e("onboarding.panelLabel"),
        style: { top: N.top, right: N.right },
        className: p(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: e("onboarding.panelLabel") }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              r,
              " / ",
              W.length
            ] }),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: () => I(),
                "aria-label": e("onboarding.collapse"),
                className: p(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ t.jsx(Le, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(Me, { value: r / W.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ t.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((h) => {
            const S = C[h.key], A = !S && h.key === y;
            return /* @__PURE__ */ t.jsx(
              "li",
              {
                "data-step": h.key,
                "data-done": S ? "true" : "false",
                className: p("flex flex-col gap-1.5 p-2 rounded-nomi-sm", A && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ t.jsx(
                    "span",
                    {
                      className: p(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        S ? "bg-nomi-accent text-nomi-paper" : A ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: S ? /* @__PURE__ */ t.jsx(ce, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ t.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ t.jsx(
                      "span",
                      {
                        className: p(
                          "block text-body-sm font-medium leading-snug",
                          S ? "text-nomi-ink-40" : A ? "text-nomi-accent" : "text-nomi-ink"
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
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), j(!1);
                },
                className: p(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ t.jsx(Te, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  e("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: w,
                className: p(
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
const Et = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, G = Et;
function It(e, n) {
  switch (n.type) {
    case "checking":
      return { ...G, phase: "checking" };
    case "up-to-date":
      return { ...G, phase: "up-to-date" };
    case "available":
      return { ...G, phase: "available", latestVersion: n.version, notes: n.notes };
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
function Lt() {
  const n = Je()?.update, o = !!n, [a, u] = s.useState(null), [d, i] = s.useState(G);
  s.useEffect(() => {
    let N = !0;
    n?.appInfo().then((C) => {
      N && u(C);
    }).catch(() => {
    });
    const g = n?.onEvent((C) => i((r) => It(r, C)));
    return () => {
      N = !1, g?.();
    };
  }, [n]), s.useEffect(() => {
    if (d.phase !== "up-to-date") return;
    const N = window.setTimeout(() => i(G), 2500);
    return () => window.clearTimeout(N);
  }, [d.phase]);
  const c = s.useCallback(() => {
    i({ ...G, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), k = s.useCallback(() => {
    i((N) => ({ ...N, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), b = s.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), f = s.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), j = s.useCallback(() => i(G), []), _ = a?.canAutoInstall ?? !0;
  return {
    phase: d.phase,
    appInfo: a,
    latestVersion: d.latestVersion,
    notes: d.notes,
    percent: d.percent,
    errorMessage: d.errorMessage,
    supported: o,
    canAutoInstall: _,
    check: c,
    download: k,
    install: b,
    openRelease: f,
    reset: j
  };
}
const Tt = 360, he = 12;
function Mt(e) {
  return e ? `${e.platform === "win32" ? "Windows" : e.platform === "darwin" ? "macOS" : e.platform} · ${e.arch}` : "";
}
function Pe({ anchorEl: e, onClose: n }) {
  const { t: o } = D(), a = Lt(), { isDark: u } = Xe(), [d, i] = s.useState(null);
  return s.useLayoutEffect(() => {
    if (!e) return;
    const c = () => {
      const k = e.getBoundingClientRect(), b = Math.min(k.left, window.innerWidth - Tt - he), f = k.bottom + 8;
      i({ top: f, left: Math.max(he, b) });
    };
    return c(), window.addEventListener("resize", c), window.addEventListener("scroll", c, !0), () => {
      window.removeEventListener("resize", c), window.removeEventListener("scroll", c, !0);
    };
  }, [e]), s.useEffect(() => {
    const c = (k) => {
      k.key === "Escape" && n();
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [n]), /* @__PURE__ */ t.jsxs(Ye, { children: [
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
        className: p(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: d?.top ?? -9999, left: d?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (c) => c.stopPropagation(),
        children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ t.jsx(Qe, { size: 40 }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx(Ze, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ t.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: a.appInfo?.version ?? "…" }),
                a.appInfo ? ` · ${Mt(a.appInfo)}` : ""
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
                /* @__PURE__ */ t.jsx(Te, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: o("about.handbook") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: o("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ t.jsx(bt, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: o("theme.appearance") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(u ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ t.jsx(et, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: a.supported ? /* @__PURE__ */ t.jsx(At, { updater: a }) : /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function At({ updater: e }) {
  const { t: n } = D(), { phase: o } = e;
  return o === "checking" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ t.jsx(Ce, { size: 16, label: n("about.checking") }),
    n("about.checkingEllipsis")
  ] }) : o === "up-to-date" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ t.jsx(pe, { size: 16, className: "text-[var(--workbench-success)]" }),
    n("about.upToDate")
  ] }) : o === "available" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ t.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        n("about.available"),
        " ",
        /* @__PURE__ */ t.jsx("b", { className: "font-medium", children: e.latestVersion })
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ t.jsx(T, { variant: "default", onClick: e.reset, children: n("common.later") }),
        e.canAutoInstall ? /* @__PURE__ */ t.jsx(T, { variant: "primary", onClick: e.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ t.jsx(T, { variant: "primary", onClick: e.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    e.canAutoInstall ? null : /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    e.notes ? /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: e.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ t.jsx(Me, { value: e.percent, size: "sm" }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: e.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ t.jsx(pe, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ t.jsx(T, { variant: "default", onClick: e.reset, children: n("common.later") }),
      /* @__PURE__ */ t.jsx(T, { variant: "primary", onClick: e.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ t.jsx(tt, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ t.jsx("span", { className: "min-w-0 break-words", children: e.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ t.jsx(T, { variant: "default", onClick: e.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ t.jsx(T, { variant: "primary", onClick: e.check, children: n("about.checkUpdate") })
  ] });
}
const Q = window.nomiDesktop?.platform === "win32";
function Pt() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function Bt({
  workspaceMode: e,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: a,
  onOpenModelCatalog: u,
  onRenameProject: d
}) {
  const { t: i } = D(), [c, k] = s.useState(!1), [b, f] = s.useState(o || i("appBar.untitledProject")), [j, _] = s.useState(!1), N = s.useRef(null);
  s.useEffect(() => {
    !c && o && f(o);
  }, [o, c]);
  const g = s.useCallback(() => {
    f((r) => {
      const x = r.trim() || i("appBar.untitledProject");
      return d?.(x), x;
    }), k(!1);
  }, [d, i]), C = s.useCallback(() => {
    u?.();
  }, [u]);
  return /* @__PURE__ */ t.jsxs(
    "header",
    {
      className: p(
        "nomi-appbar",
        Q && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": i("appBar.workspace"),
      onDoubleClick: _e,
      children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: p(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              Q ? null : /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    ref: N,
                    type: "button",
                    className: p(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": i("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": j,
                    onClick: () => _((r) => !r),
                    children: /* @__PURE__ */ t.jsx(Ee, {})
                  }
                ),
                j ? /* @__PURE__ */ t.jsx(Pe, { anchorEl: N.current, onClose: () => _(!1) }) : null,
                /* @__PURE__ */ t.jsx(
                  "span",
                  {
                    className: p("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ t.jsxs(
                "div",
                {
                  className: p(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": i("appBar.locationNavigation"),
                  children: [
                    a ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                      /* @__PURE__ */ t.jsx(
                        T,
                        {
                          className: p(
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
                          onClick: a,
                          children: i("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ t.jsx(
                        "span",
                        {
                          className: p(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    c ? /* @__PURE__ */ t.jsx(
                      "input",
                      {
                        className: p(
                          "nomi-appbar__breadcrumb-input",
                          "app-no-drag",
                          "h-full px-2.5 border-none",
                          "bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]",
                          "text-[var(--nomi-ink)] font-inherit text-body-sm",
                          "outline-none min-w-[80px] max-w-[240px]"
                        ),
                        value: b,
                        autoFocus: !0,
                        "aria-label": i("appBar.projectName"),
                        onBlur: g,
                        onChange: (r) => f(r.currentTarget.value),
                        onKeyDown: (r) => {
                          r.key === "Enter" && g(), r.key === "Escape" && k(!1);
                        }
                      }
                    ) : /* @__PURE__ */ t.jsx(
                      T,
                      {
                        className: p(
                          "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--name",
                          "app-no-drag",
                          "inline-flex items-center h-full px-2.5",
                          "border-none bg-transparent font-inherit text-body-sm",
                          "cursor-pointer whitespace-nowrap",
                          "text-[var(--nomi-ink-80)] max-w-[200px] overflow-hidden text-ellipsis",
                          "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                          "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]"
                        ),
                        title: b,
                        onClick: () => k(!0),
                        children: b
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ t.jsx("div", { className: "app-no-drag", children: /* @__PURE__ */ t.jsx(nt, { value: e, onChange: n }) }),
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: p(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": i("appBar.globalActions"),
            children: [
              /* @__PURE__ */ t.jsx(rt, { className: "size-[30px]" }),
              Q ? null : /* @__PURE__ */ t.jsx(Ae, {}),
              Q ? null : /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs(
                T,
                {
                  className: p(
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
                  onClick: Pt,
                  children: [
                    /* @__PURE__ */ t.jsx(Ie, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: p("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.browser") })
                  ]
                }
              ) }),
              /* @__PURE__ */ t.jsxs(
                T,
                {
                  className: p(
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
                  onClick: C,
                  children: [
                    /* @__PURE__ */ t.jsx(ot, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: p("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ t.jsxs(
                T,
                {
                  className: p(
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
                    /* @__PURE__ */ t.jsx(ht, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: p("nomi-appbar__action-text", "max-[1400px]:hidden"), children: i("appBar.export") })
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
const zt = U("i18n:sidebar.categoryPanel", () => import("./CategoryTree-BK59Nosb.js")), Dt = U(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-CInV9bXp.js").then((e) => ({
    default: e.PromptLibraryContent
  }))
), Rt = U(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-8xtmBuuN.js").then((e) => ({
    default: e.SkillLibraryContent
  }))
), Wt = U(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-b8Akjvs7.js").then((e) => ({
    default: e.AssetLibraryContent
  }))
), $t = 60, Ot = 300, Gt = 500, Ut = 60, Ft = p(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), be = p(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), xe = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", fe = p(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function Kt(e, n) {
  return n(e === "categories" ? "sidebar.groups" : e === "prompt-library" ? "sidebar.promptLibrary" : e === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function Vt(e) {
  return e === "prompt-library" || e === "skill-library" || e === "asset-library";
}
function Ht({ categories: e, projectId: n = null }) {
  const { t: o } = D(), [a, u] = s.useState("asset-library"), [d, i] = s.useState(0), c = L((r) => r.sidebarCollapsed), k = L((r) => r.toggleSidebarCollapsed), b = L((r) => r.setSidebarCollapsed), f = s.useCallback(() => {
    u("categories"), b(!1), i((r) => r + 1);
  }, [b]), j = s.useCallback((r) => {
    if (!c && a === r) {
      b(!0);
      return;
    }
    u(r), b(!1);
  }, [c, b, a]);
  s.useEffect(() => {
    const r = () => {
      u("asset-library"), b(!1);
    };
    return window.addEventListener("nomi-open-files-panel", r), () => window.removeEventListener("nomi-open-files-panel", r);
  }, [b]);
  const _ = s.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: vt
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: _t
      }
    ],
    [o]
  ), N = s.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: kt
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: gt
      }
    ],
    [o]
  ), g = Kt(a, o), C = Vt(a) ? Gt : Ot;
  return /* @__PURE__ */ t.jsx(
    "aside",
    {
      "data-collapsed": c ? "true" : "false",
      className: p(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: c ? $t : C },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ t.jsxs(st, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: Ut },
            children: [
              /* @__PURE__ */ t.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                _.map((r) => {
                  const x = r.icon, y = a === r.id;
                  return /* @__PURE__ */ t.jsxs(q, { children: [
                    /* @__PURE__ */ t.jsx(J, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: p(be, y && xe),
                        "aria-label": r.label,
                        "aria-pressed": y,
                        onClick: () => j(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(x, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(X, { side: "right", children: r.label })
                  ] }, r.id);
                }),
                /* @__PURE__ */ t.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                N.map((r) => {
                  const x = r.icon, y = a === r.id;
                  return /* @__PURE__ */ t.jsxs(q, { children: [
                    /* @__PURE__ */ t.jsx(J, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: p(be, y && xe),
                        "aria-label": r.label,
                        "aria-pressed": y,
                        onClick: () => j(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(x, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(X, { side: "right", children: r.label })
                  ] }, r.id);
                })
              ] }),
              /* @__PURE__ */ t.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ t.jsxs(q, { children: [
                /* @__PURE__ */ t.jsx(J, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: k,
                    className: Ft,
                    "aria-label": o(c ? "sidebar.expand" : "sidebar.collapse"),
                    children: c ? /* @__PURE__ */ t.jsx(jt, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ t.jsx(ue, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ t.jsx(X, { side: "right", children: o(c ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        c ? null : /* @__PURE__ */ t.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": g, children: /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ t.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: g }),
            a === "categories" ? /* @__PURE__ */ t.jsxs(q, { children: [
              /* @__PURE__ */ t.jsx(J, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: f,
                  className: fe,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ t.jsx(at, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(X, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ t.jsxs(q, { children: [
              /* @__PURE__ */ t.jsx(J, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: k,
                  className: fe,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ t.jsx(ue, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(X, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          a === "categories" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(zt, { categories: e, createCategoryNonce: d }) }) : a === "prompt-library" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Dt, { active: !0, compact: !0, showHeader: !1 }) }) : a === "skill-library" ? /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Rt, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ t.jsx(s.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Wt, { projectId: n, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const ge = [
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
function Pn(e) {
  return ge.find((n) => n.id === e) || ge[0];
}
function Bn(e) {
  return !e.chatOnly;
}
function qt(e) {
  return Be(e?.contentJson).trim();
}
function Be(e) {
  if (!e || typeof e != "object") return "";
  const n = e, o = typeof n.text == "string" ? n.text : "", a = Array.isArray(n.content) ? n.content.map(Be).filter(Boolean).join(`
`) : "";
  return [o, a].filter(Boolean).join(o && a ? `
` : "");
}
function zn(e) {
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
const Jt = [
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
function ze(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function O(e, n) {
  return n.test(ze(e));
}
function Xt(e) {
  return e.meta?.referenceSheet === !0;
}
function Yt(e) {
  return Xt(e) ? !1 : e.kind === "shot" ? !0 : e.kind !== "image" || e.meta?.storyboardKeyframe === !0 || e.meta?.workflowStage === "keyframe" || O(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof e.shotIndex == "number" || O(e, /镜头|分镜|shot/);
}
function F(e, n) {
  return e.result?.type === n || e.history?.some((o) => o.type === n) === !0;
}
function ke(e, n) {
  const o = ze(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof e.shotIndex == "number" ? `shot-${e.shotIndex}` : `position-${n + 1}`;
}
function se(e, n, o = () => !0) {
  const a = new Set(
    n.filter(o).map((u, d) => ke(u, d))
  );
  return new Set(
    e.map((u, d) => ke(u, d)).filter((u) => a.has(u))
  ).size;
}
function Qt(e) {
  const n = e.documentText.trim(), o = n.length >= 4, a = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, u = e.nodes.filter(
    (l) => O(l, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || l.meta?.workflowStage === "style"
  ), d = e.nodes.filter(
    (l) => l.kind === "character" || O(l, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || l.meta?.workflowStage === "character"
  ), i = e.nodes.filter(
    (l) => l.kind === "scene" || O(l, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || l.meta?.workflowStage === "scene"
  ), c = e.nodes.filter(Yt), k = e.nodes.filter(
    (l) => O(l, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || l.meta?.cameraMoveAutoCapture !== void 0 || l.meta?.cameraMovePromptApplied !== void 0 || l.meta?.workflowStage === "motion"
  ), b = e.nodes.filter(
    (l) => l.kind === "keyframe" || l.meta?.storyboardKeyframe === !0 || O(l, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || l.meta?.workflowStage === "keyframe"
  ), f = e.nodes.filter((l) => l.kind === "video"), j = c.length, _ = u.filter((l) => F(l, "image")).length, N = d.filter((l) => F(l, "image")).length, g = i.filter((l) => F(l, "image")).length, C = c.filter((l) => F(l, "image")).length, r = se(
    c,
    b,
    (l) => F(l, "image")
  ), x = se(
    c,
    f,
    (l) => F(l, "video")
  ), y = se(c, k), v = u.length > 0 && _ > 0, I = d.length > 0 && N === d.length, w = i.length > 0 && g === i.length, h = j > 0 && C === j, S = j > 0 && y === j, A = j > 0 && r === j, Y = f.length > 0, V = j > 0 && x === j, m = j > 0 && V && e.timelineClipCount >= j, P = {
    style: u.length > 0,
    character: d.length > 0,
    scene: i.length > 0,
    storyboard: c.length > 0,
    keyframe: b.length > 0,
    video: f.length > 0
  }, B = {
    style: _,
    character: N,
    scene: g,
    storyboard: C,
    keyframe: r,
    video: x
  }, ne = {
    idea: o,
    script: a,
    style: v,
    character: I,
    scene: w,
    storyboard: h,
    motion: S,
    keyframe: A,
    video: V,
    review: m
  }, R = Jt.map((l) => ({
    ...l,
    complete: ne[l.id]
  })), H = R.findIndex((l) => !l.complete), E = H >= 0 ? H : R.length - 1;
  return {
    stages: R,
    current: R[E],
    currentIndex: E,
    completedCount: R.filter((l) => l.complete).length,
    hasVideoNodes: Y,
    hasGeneratedVideo: V,
    shotCount: j,
    plannedByStage: P,
    generatedCountByStage: B
  };
}
function Zt(e) {
  return String(e.title || "").toLocaleLowerCase();
}
function De(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function M(e, n) {
  return n.test(Zt(e));
}
function z(e) {
  return String(e.meta?.workflowStage || "").toLocaleLowerCase();
}
function Re(e) {
  return z(e) === "story" || M(e, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function We(e) {
  return z(e) === "script" || M(e, /剧本|分场|script|screenplay/);
}
function en(e) {
  return z(e) === "style" || M(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function tn(e) {
  return e.kind === "character" || z(e) === "character" || M(e, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function nn(e) {
  return e.kind === "scene" || z(e) === "scene" || M(e, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function $e(e) {
  return e.kind === "keyframe" || z(e) === "keyframe" || e.meta?.storyboardKeyframe === !0 || M(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function Oe(e) {
  return e.kind === "video" && (z(e) === "video" || M(e, /镜头|shot|视频/));
}
function rn(e) {
  return z(e) === "motion" || M(e, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function on(e) {
  return e.meta?.referenceSheet === !0 || $e(e) || Oe(e) ? !1 : e.kind === "shot" || e.kind === "image" && (z(e) === "storyboard" || typeof e.shotIndex == "number" || M(e, /镜头|分镜|shot/));
}
function te(e) {
  const n = De(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof e.shotIndex == "number" ? e.shotIndex : null;
}
function Z(e) {
  return [...e].sort((n, o) => {
    const a = te(n) ?? Number.MAX_SAFE_INTEGER, u = te(o) ?? Number.MAX_SAFE_INTEGER;
    return a !== u ? a - u : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function ae(e, n, o) {
  const a = te(n);
  if (a !== null) {
    const u = e.filter((d) => te(d) === a);
    if (u.length) return u;
  }
  return e[o] ? [e[o]] : [];
}
function ve(e, n) {
  if (e.length <= 1) return e;
  const o = De(n), a = e.filter((u) => u.title.split(/[｜|·：:\s]/).map((i) => i.trim()).filter((i) => i.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(i)).some((i) => o.includes(i.toLocaleLowerCase())));
  return a.length ? a : e;
}
function we(e, n, o) {
  const a = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), u = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return e.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${a}\\s*\\n([\\s\\S]*?)${u}`, "i"))?.[1]?.trim() || "";
}
function sn(e, n) {
  const o = [];
  if (!n.some(Re)) {
    const a = we(e, "故事设定", "剧本");
    a && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: a,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(We)) {
    const a = we(e, "剧本");
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
function an(e, n) {
  const o = e.filter(Re), a = e.filter(We), u = e.filter(en), d = u.filter((r) => r.kind !== "text"), i = e.filter(tn), c = e.filter(nn), k = Z(e.filter(on)), b = Z(e.filter(rn)), f = Z(e.filter($e)), j = Z(e.filter(Oe)), _ = [], N = new Set(n.map((r) => `${r.source}:${r.target}:${r.mode || "reference"}`)), g = (r, x, y = "reference") => {
    if (!r || !x || r.id === x.id) return;
    const v = `${r.id}:${x.id}:${y}`;
    N.has(v) || (N.add(v), _.push({ source: r.id, target: x.id, mode: y }));
  };
  o.forEach((r) => a.forEach((x) => g(r, x))), a.forEach((r) => {
    i.forEach((x) => g(r, x)), c.forEach((x) => g(r, x)), k.forEach((x) => g(r, x));
  }), u.filter((r) => r.kind === "text").forEach((r) => {
    d.forEach((x) => g(r, x));
  });
  const C = d[0];
  return C && (i.forEach((r) => g(C, r, "style_ref")), c.forEach((r) => g(C, r, "style_ref")), f.forEach((r) => g(C, r, "style_ref"))), f.forEach((r, x) => {
    ve(i, r).forEach((y) => g(y, r, "character_ref")), ve(c, r).forEach((y) => g(y, r, "composition_ref")), ae(k, r, x).forEach((y) => g(y, r, "composition_ref"));
  }), j.forEach((r, x) => {
    const y = ae(f, r, x), v = y.find((w) => !M(w, /尾帧|last\s*frame/)) || y[0], I = y.find((w) => M(w, /尾帧|last\s*frame/));
    g(v, r, "first_frame"), g(I, r, "last_frame"), ae(b, r, x).forEach((w) => g(w, r));
  }), _;
}
function Ge(e) {
  const n = e.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function cn(e) {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "当前文稿已经完整附在下面，不要再说“我先读取”，直接根据它扩写成能生产的短剧剧本。",
    "本轮必须调用 append_to_end，把最终剧本放在 args.content 中写回文稿；不要只在聊天里解释、承诺或复述步骤。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。",
    "",
    "当前文稿：",
    Ge(e)
  ].join(`
`);
}
function ln(e, n) {
  const a = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    Ge(n),
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
function ee(e, n = !1) {
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
function $(e, n) {
  return `guidedProduction.stage.${e}.${n}`;
}
function je(e) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(e);
}
function dn() {
  const { t: e } = D(), [n, o] = s.useState(!1), a = L((m) => m.workbenchDocument), u = L((m) => m.storyboardPlan), d = L((m) => m.storyboardPlanCommitted), i = L((m) => m.timeline), c = L((m) => m.setWorkspaceMode), k = L((m) => m.setStoryboardEditorOpen), b = L((m) => m.setCreationAiCollapsed), f = K((m) => m.nodes), j = K((m) => m.edges), _ = it((m) => m.activeScope), N = s.useMemo(
    () => ct(f, _),
    [f, _]
  ), g = s.useMemo(
    () => f.filter((m) => lt(m, N)),
    [N, f]
  ), C = s.useMemo(() => new Set(g.map((m) => m.id)), [g]), r = s.useMemo(
    () => j.filter((m) => C.has(m.source) && C.has(m.target)),
    [j, C]
  ), x = s.useMemo(
    () => dt(i, f, N),
    [N, f, i]
  ), y = s.useMemo(
    () => qt(a),
    [a]
  ), v = s.useMemo(
    () => x.tracks.reduce((m, P) => m + P.clips.length, 0),
    [x.tracks]
  ), I = s.useMemo(
    () => Qt({
      documentText: y,
      nodes: g,
      timelineClipCount: v
    }),
    [y, g, u, d, v]
  ), w = I.current, h = I.completedCount === I.stages.length, S = je(w.id) && I.plannedByStage[w.id] && !w.complete;
  s.useEffect(() => {
    const m = an(g, r);
    if (!m.length) return;
    const P = K.getState();
    m.forEach((B) => P.connectNodes(B.source, B.target, B.mode));
  }, [r, g]);
  const A = h ? e("guidedProduction.completeAction") : w.id === "storyboard" && u && !d ? e("guidedProduction.reviewStoryboardAction") : e(S ? $(w.id, "generateAction") : $(w.id, "action")), Y = s.useCallback(() => {
    const m = K.getState(), P = L.getState(), B = new Set(
      P.timeline.tracks.flatMap((E) => E.clips.map((l) => l.sourceNodeId))
    ), ne = new Set(oe.read_canvas().nodes.map((E) => E.id)), R = m.nodes.filter((E) => ne.has(E.id)).filter((E) => E.kind === "video" && (E.status === "success" || E.result?.type === "video")).filter((E) => !B.has(E.id)).sort((E, l) => (E.shotIndex ?? Number.MAX_SAFE_INTEGER) - (l.shotIndex ?? Number.MAX_SAFE_INTEGER));
    let H = Math.max(
      0,
      ...P.timeline.tracks.flatMap((E) => E.clips.map((l) => l.endFrame))
    );
    for (const E of R) {
      const l = oe.send_to_timeline(E.id, { startFrame: H });
      l.ok && (H = l.clip.endFrame);
    }
    c("preview");
  }, [c]), V = s.useCallback(() => {
    if (h || w.id === "review") {
      Y();
      return;
    }
    if (w.id === "idea") {
      c("creation"), b(!1);
      return;
    }
    if (w.id === "script") {
      c("creation"), b(!1), de({
        action: "send",
        prompt: cn(y),
        modeId: "script",
        displayMessage: e("guidedProduction.stage.script.displayMessage"),
        autoApproveWrites: !0,
        employeeKey: ee("script"),
        requiredTool: "append_to_end"
      });
      return;
    }
    if (w.id === "storyboard") {
      if (u && !d) {
        c("creation"), b(!1), k(!0);
        return;
      }
      if (S) {
        c("generation"), me({
          prompt: ye("storyboard"),
          displayMessage: e("guidedProduction.stage.storyboard.generateDisplayMessage"),
          autoApproveSafeWrites: !0,
          employeeKey: ee("storyboard", !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      c("creation"), b(!1), de({
        action: "storyboard",
        displayMessage: e("guidedProduction.stage.storyboard.displayMessage"),
        shotMode: "image",
        employeeKey: ee("storyboard"),
        requiredTool: "propose_storyboard_plan"
      });
      return;
    }
    if (c("generation"), w.id === "style") {
      const m = sn(
        y,
        K.getState().nodes
      );
      m.length && oe.create_nodes(m);
    }
    me({
      prompt: S && je(w.id) ? ye(w.id) : ln(w.id, y),
      displayMessage: e(S ? $(w.id, "generateDisplayMessage") : `guidedProduction.stage.${w.id}.displayMessage`),
      autoApproveSafeWrites: !0,
      employeeKey: ee(w.id, S),
      requiredTool: S ? "run_generation_batch" : "create_canvas_nodes"
    });
  }, [
    h,
    w.id,
    y,
    Y,
    S,
    b,
    k,
    c,
    u,
    d,
    e
  ]);
  return /* @__PURE__ */ t.jsxs(
    "section",
    {
      className: p(
        "relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper",
        "px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      ),
      "aria-label": e("guidedProduction.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center gap-3", children: [
          /* @__PURE__ */ t.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: h ? /* @__PURE__ */ t.jsx(ce, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ t.jsx(mt, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: h ? e("guidedProduction.complete") : e("guidedProduction.step", {
                current: I.currentIndex + 1,
                total: I.stages.length
              }) }),
              /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: e(h ? "guidedProduction.completeTitle" : $(w.id, "title")) }),
              h ? null : /* @__PURE__ */ t.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: e($(w.id, "owner")) })
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: e(h ? "guidedProduction.completeDescription" : $(w.id, "description")) })
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: p(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4",
                "border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer",
                "shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md"
              ),
              onClick: V,
              children: [
                A,
                /* @__PURE__ */ t.jsx(Nt, { size: 15, stroke: 2 })
              ]
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: p(
                "grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line",
                "bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              "aria-label": e(n ? "guidedProduction.collapse" : "guidedProduction.expand"),
              "aria-expanded": n,
              onClick: () => o((m) => !m),
              children: n ? /* @__PURE__ */ t.jsx(wt, { size: 16 }) : /* @__PURE__ */ t.jsx(Le, { size: 16 })
            }
          )
        ] }),
        n ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: p(
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
              /* @__PURE__ */ t.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: I.stages.map((m, P) => {
                const B = !h && m.id === w.id;
                return /* @__PURE__ */ t.jsxs(
                  "li",
                  {
                    className: p(
                      "min-w-0 rounded-nomi border p-2.5",
                      m.complete ? "border-transparent bg-nomi-ink-05" : B ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ t.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        m.complete ? /* @__PURE__ */ t.jsx(ce, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ t.jsx(yt, { size: 10, className: p("mx-0.5 shrink-0", B ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro text-nomi-ink-40", children: e("guidedProduction.shortStep", { current: P + 1 }) })
                      ] }),
                      /* @__PURE__ */ t.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: e($(m.id, "title")) })
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
const mn = U(
  "创作区",
  () => import("./CreationWorkspace-DVRbcsZ0.js")
), pn = U(
  "生成区",
  () => import("./GenerationWorkspace-D-aMGGxa.js")
), un = U("预览区", () => import("./PreviewWorkspace-Dxo-Aitm.js")), hn = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, bn = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function xn({ label: e }) {
  const { t: n } = D(), o = n("workspace.loading", { label: e });
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: p(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ t.jsx(Ce, { size: 28, label: o })
    }
  );
}
function ie({
  active: e,
  children: n,
  label: o
}) {
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: p(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !e,
      children: /* @__PURE__ */ t.jsx(
        s.Suspense,
        {
          fallback: e ? /* @__PURE__ */ t.jsx(xn, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function fn() {
  if (typeof window > "u") return "generation";
  try {
    const e = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return bn[e] || "generation";
  } catch {
    return "generation";
  }
}
function Ne(e) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = hn[e];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function gn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function kn({
  generation: e,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: a,
  projectName: u,
  onBackToLibrary: d,
  onOpenModelCatalog: i,
  onRenameProject: c
}) {
  const { t: k } = D(), b = L((v) => v.workspaceMode), f = L(
    (v) => v.setWorkspaceMode
  ), j = L((v) => v.categories), [_, N] = s.useState(() => [b]), [g, C] = s.useState(!1), r = s.useRef(null), x = window.nomiDesktop?.platform === "win32";
  s.useEffect(() => {
    const v = L.getState().workspaceMode;
    Ne(v);
    const I = () => {
      f(fn());
    };
    return window.addEventListener("popstate", I), () => window.removeEventListener("popstate", I);
  }, [f]), s.useEffect(() => {
    N(
      (v) => v.includes(b) ? v : [...v, b]
    );
  }, [b]);
  const y = s.useCallback(
    (v) => {
      pt(v) && (f(v), Ne(v));
    },
    [f]
  );
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      className: p(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": b,
      children: [
        x ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: p(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": k("appBar.windowTitleBar"),
            onDoubleClick: _e,
            children: [
              /* @__PURE__ */ t.jsx(
                "button",
                {
                  ref: r,
                  type: "button",
                  className: p(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": k("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": g,
                  onClick: () => C((v) => !v),
                  children: /* @__PURE__ */ t.jsx(Ee, { markSize: 18, wordSize: 14 })
                }
              ),
              g ? /* @__PURE__ */ t.jsx(Pe, { anchorEl: r.current, onClose: () => C(!1) }) : null,
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ t.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ t.jsx(Ae, {}) }),
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: p(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": k("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: p(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": k("appBar.openBrowser"),
                      title: k("appBar.browser"),
                      onClick: gn,
                      children: [
                        /* @__PURE__ */ t.jsx(Ie, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ t.jsx("span", { children: k("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ t.jsx(ut, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ t.jsx(
          Bt,
          {
            workspaceMode: b,
            onWorkspaceModeChange: y,
            projectName: u,
            onBackToLibrary: d,
            onOpenModelCatalog: i,
            onRenameProject: c
          }
        ),
        /* @__PURE__ */ t.jsx(dn, {}),
        /* @__PURE__ */ t.jsxs(
          "main",
          {
            className: p(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              b === "generation" ? /* @__PURE__ */ t.jsx(Ht, { projectId: a ?? null, categories: j }) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                _.includes("creation") ? /* @__PURE__ */ t.jsx(
                  ie,
                  {
                    active: b === "creation",
                    label: k("workspace.creation"),
                    children: /* @__PURE__ */ t.jsx(mn, {})
                  }
                ) : null,
                _.includes("generation") ? /* @__PURE__ */ t.jsx(
                  ie,
                  {
                    active: b === "generation",
                    label: k("workspace.generation"),
                    children: /* @__PURE__ */ t.jsx(
                      pn,
                      {
                        canvas: e,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                _.includes("preview") ? /* @__PURE__ */ t.jsx(
                  ie,
                  {
                    active: b === "preview",
                    label: k("workspace.preview"),
                    children: /* @__PURE__ */ t.jsx(un, {})
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
const Dn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: kn
}, Symbol.toStringTag, { value: "Module" }));
export {
  ge as C,
  Dn as W,
  zn as b,
  qt as e,
  Pn as g,
  Bn as m
};
