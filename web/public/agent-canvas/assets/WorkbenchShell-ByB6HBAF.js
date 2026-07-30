import { aT as he, e6 as G, S as i, dW as F, dX as pt, cU as xe, c5 as ut, cV as ht, cr as xt, ef as bt, cq as Se, c6 as ft, ci as e, aL as h, l as ne, bz as gt, d$ as kt, b as vt, K as yt, O as wt, a0 as jt, J as Fe, a8 as W, I as Ge, bT as Ke, z as Ue, M as Nt, L as Ct, k as He, r as St, e7 as T, a3 as _t, a1 as oe, a4 as re, a2 as se, s as It, cj as Q, e0 as ee, dg as Ne, cb as Et, bd as Mt, u as Ve, ax as qe, cc as Pt, bg as At, ad as _e, bi as Ie, o as Xe, cN as Ee, x as Lt, q as Tt, t as zt, p as Dt, cg as Bt, a7 as Rt } from "./agentStudioMount-CX1GI_dE.js";
import { I as $t } from "./IconDownload-BW0zDCD-.js";
import { I as Ce, a as de } from "./IconChevronRight-D2Lu34s5.js";
import { I as Wt } from "./IconListCheck-Ja92pjvk.js";
import { I as Je } from "./IconMap-NLLC572T.js";
import { u as Ot } from "./journeyTourActivity-BJiqWAEe.js";
import { D as Ye, d as me, r as pe } from "./guidedProductionEvents-CMumc3XF.js";
import { I as ve, a as Me } from "./IconStack2-kPyG21bd.js";
import { I as Ft } from "./IconBooks-Dom1OjAG.js";
import { I as Gt } from "./IconBulb-YKlH6hlL.js";
import { b as Kt, I as Ut, a as Ht } from "./IconFolder-4oKiOy6R.js";
import { I as Qe } from "./IconLayoutSidebarLeftExpand-DyW9RqD_.js";
import { I as ye } from "./IconArrowRight-CskebOxJ.js";
import { g as le } from "./generationCanvasTools-C2aOUeap.js";
import { I as Vt } from "./IconArrowLeft-Dqxi8h38.js";
import { u as J, d as we, p as qt } from "./productionDirectorUiStore-am1qEuGF.js";
const Xt = [["path", { d: "M15 6l-6 6l6 6", key: "svg-0" }]], Jt = he("outline", "chevron-left", "ChevronLeft", Xt);
const Yt = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], Pe = he("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", Yt);
const Qt = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], Zt = he("outline", "tags", "Tags", Qt);
const en = [["path", { d: "M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5", key: "svg-0" }]], tn = he("outline", "tool", "Tool", en), V = ["model", "storyboard", "generated", "exported"];
function Ze() {
  const { t } = G(), n = i.useMemo(
    () => [
      { key: "model", label: t("onboarding.steps.model.label"), hint: t("onboarding.steps.model.hint") },
      { key: "storyboard", label: t("onboarding.steps.storyboard.label"), hint: t("onboarding.steps.storyboard.hint") },
      { key: "generated", label: t("onboarding.steps.generated.label"), hint: t("onboarding.steps.generated.hint") },
      { key: "exported", label: t("onboarding.steps.exported.label"), hint: t("onboarding.steps.exported.hint") }
    ],
    [t]
  ), o = F((p) => p.nodes), { hasTextModel: c } = pt(), b = Ot(), m = i.useMemo(
    () => ({
      model: c === !0,
      storyboard: o.length > 0,
      generated: o.some((p) => p.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [c, o]
  ), [g, s] = i.useState(() => xe()), [S, j] = i.useState(() => ut()), [y, E] = i.useState(() => !ht()), A = i.useRef(null), [I, _] = i.useState(null);
  i.useEffect(() => {
    let p = !1;
    for (const N of V)
      m[N] && !g[N] && (xt(N), p = !0);
    p && s(xe());
  }, [m, g]), i.useEffect(() => {
    const p = () => s(xe());
    return window.addEventListener("storage", p), window.addEventListener("focus", p), () => {
      window.removeEventListener("storage", p), window.removeEventListener("focus", p);
    };
  }, []);
  const k = i.useMemo(
    () => ({
      model: g.model || m.model,
      storyboard: g.storyboard || m.storyboard,
      generated: g.generated || m.generated,
      exported: g.exported || m.exported
    }),
    [g, m]
  ), r = V.filter((p) => k[p]).length, x = r === V.length, w = n.find((p) => !k[p.key])?.key ?? null, l = i.useCallback(() => {
    const p = A.current;
    if (!p) return;
    const N = p.getBoundingClientRect();
    _({ top: N.bottom + 8, right: Math.max(8, window.innerWidth - N.right) });
  }, []);
  i.useEffect(() => {
    if (y)
      return l(), window.addEventListener("resize", l), () => window.removeEventListener("resize", l);
  }, [y, l]), i.useEffect(() => {
    if (!y) return;
    const p = (N) => {
      const M = N.target;
      M && M.closest("[data-onboarding-checklist-root]") || E(!1);
    };
    return window.addEventListener("pointerdown", p, !0), () => window.removeEventListener("pointerdown", p, !0);
  }, [y]);
  const C = i.useCallback(() => {
    E((p) => {
      const N = !p;
      return bt(!N), N;
    });
  }, []), v = i.useCallback(() => {
    Se(), j(!0);
  }, []);
  return i.useEffect(() => {
    S || x || ft(Date.now()) && (Se(), j(!0));
  }, [S, x]), x || b || S ? null : /* @__PURE__ */ e.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        ref: A,
        onClick: C,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": t("onboarding.progressLabel", { done: r, total: V.length }),
        "aria-expanded": y,
        className: h(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          y && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ e.jsx(Wt, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ e.jsx("span", { className: "max-[700px]:hidden", children: t("onboarding.trigger") }),
          /* @__PURE__ */ e.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            r,
            "/",
            V.length
          ] })
        ]
      }
    ),
    y && I ? /* @__PURE__ */ e.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": t("onboarding.panelLabel"),
        style: { top: I.top, right: I.right },
        className: h(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ e.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: t("onboarding.panelLabel") }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              r,
              " / ",
              V.length
            ] }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => C(),
                "aria-label": t("onboarding.collapse"),
                className: h(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ e.jsx(Ce, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(Ye, { value: r / V.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ e.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((p) => {
            const N = k[p.key], M = !N && p.key === w;
            return /* @__PURE__ */ e.jsx(
              "li",
              {
                "data-step": p.key,
                "data-done": N ? "true" : "false",
                className: h("flex flex-col gap-1.5 p-2 rounded-nomi-sm", M && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ e.jsx(
                    "span",
                    {
                      className: h(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        N ? "bg-nomi-accent text-nomi-paper" : M ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: N ? /* @__PURE__ */ e.jsx(ne, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ e.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ e.jsx(
                      "span",
                      {
                        className: h(
                          "block text-body-sm font-medium leading-snug",
                          N ? "text-nomi-ink-40" : M ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: p.label
                      }
                    ),
                    N ? null : /* @__PURE__ */ e.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: p.hint })
                  ] })
                ] })
              },
              p.key
            );
          }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-t border-nomi-line-soft px-3 py-2", children: [
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), E(!1);
                },
                className: h(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ e.jsx(Je, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  t("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: v,
                className: h(
                  "rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-ink-40 transition-colors hover:text-nomi-ink"
                ),
                children: t("onboarding.dismiss")
              }
            )
          ] })
        ]
      }
    ) : null
  ] });
}
const nn = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, Y = nn;
function on(t, n) {
  switch (n.type) {
    case "checking":
      return { ...Y, phase: "checking" };
    case "up-to-date":
      return { ...Y, phase: "up-to-date" };
    case "available":
      return { ...Y, phase: "available", latestVersion: n.version, notes: n.notes };
    case "progress":
      return { ...t, phase: "downloading", percent: n.percent };
    case "downloaded":
      return { ...t, phase: "downloaded", latestVersion: n.version || t.latestVersion };
    case "error":
      return { ...t, phase: "error", errorMessage: n.message };
    default:
      return t;
  }
}
function rn() {
  const n = gt()?.update, o = !!n, [c, b] = i.useState(null), [m, g] = i.useState(Y);
  i.useEffect(() => {
    let I = !0;
    n?.appInfo().then((k) => {
      I && b(k);
    }).catch(() => {
    });
    const _ = n?.onEvent((k) => g((r) => on(r, k)));
    return () => {
      I = !1, _?.();
    };
  }, [n]), i.useEffect(() => {
    if (m.phase !== "up-to-date") return;
    const I = window.setTimeout(() => g(Y), 2500);
    return () => window.clearTimeout(I);
  }, [m.phase]);
  const s = i.useCallback(() => {
    g({ ...Y, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), S = i.useCallback(() => {
    g((I) => ({ ...I, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), j = i.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), y = i.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), E = i.useCallback(() => g(Y), []), A = c?.canAutoInstall ?? !0;
  return {
    phase: m.phase,
    appInfo: c,
    latestVersion: m.latestVersion,
    notes: m.notes,
    percent: m.percent,
    errorMessage: m.errorMessage,
    supported: o,
    canAutoInstall: A,
    check: s,
    download: S,
    install: j,
    openRelease: y,
    reset: E
  };
}
const sn = 360, Ae = 12;
function an(t) {
  return t ? `${t.platform === "win32" ? "Windows" : t.platform === "darwin" ? "macOS" : t.platform} · ${t.arch}` : "";
}
function et({ anchorEl: t, onClose: n }) {
  const { t: o } = G(), c = rn(), { isDark: b } = kt(), [m, g] = i.useState(null);
  return i.useLayoutEffect(() => {
    if (!t) return;
    const s = () => {
      const S = t.getBoundingClientRect(), j = Math.min(S.left, window.innerWidth - sn - Ae), y = S.bottom + 8;
      g({ top: y, left: Math.max(Ae, j) });
    };
    return s(), window.addEventListener("resize", s), window.addEventListener("scroll", s, !0), () => {
      window.removeEventListener("resize", s), window.removeEventListener("scroll", s, !0);
    };
  }, [t]), i.useEffect(() => {
    const s = (S) => {
      S.key === "Escape" && n();
    };
    return window.addEventListener("keydown", s), () => window.removeEventListener("keydown", s);
  }, [n]), /* @__PURE__ */ e.jsxs(vt, { children: [
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: "fixed inset-0 z-[600]",
        onMouseDown: n,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: h(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: m?.top ?? -9999, left: m?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (s) => s.stopPropagation(),
        children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ e.jsx(yt, { size: 40 }),
            /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ e.jsx(wt, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ e.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: c.appInfo?.version ?? "…" }),
                c.appInfo ? ` · ${an(c.appInfo)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              className: "mb-3.5 flex w-full min-h-9 items-center gap-2.5 rounded-nomi-sm border-0 bg-[var(--nomi-ink-05)] px-3 py-2 cursor-pointer text-left transition-colors hover:bg-[var(--nomi-ink-10)]",
              onClick: () => {
                window.dispatchEvent(new CustomEvent("nomi-open-handbook")), n();
              },
              children: [
                /* @__PURE__ */ e.jsx(Je, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ e.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: o("about.handbook") }),
                  /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: o("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ e.jsx(de, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: o("theme.appearance") }),
              /* @__PURE__ */ e.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(b ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ e.jsx(jt, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: c.supported ? /* @__PURE__ */ e.jsx(cn, { updater: c }) : /* @__PURE__ */ e.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function cn({ updater: t }) {
  const { t: n } = G(), { phase: o } = t;
  return o === "checking" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ e.jsx(Fe, { size: 16, label: n("about.checking") }),
    n("about.checkingEllipsis")
  ] }) : o === "up-to-date" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ e.jsx(ve, { size: 16, className: "text-[var(--workbench-success)]" }),
    n("about.upToDate")
  ] }) : o === "available" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ e.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        n("about.available"),
        " ",
        /* @__PURE__ */ e.jsx("b", { className: "font-medium", children: t.latestVersion })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ e.jsx(W, { variant: "default", onClick: t.reset, children: n("common.later") }),
        t.canAutoInstall ? /* @__PURE__ */ e.jsx(W, { variant: "primary", onClick: t.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ e.jsx(W, { variant: "primary", onClick: t.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    t.canAutoInstall ? null : /* @__PURE__ */ e.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    t.notes ? /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: t.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ e.jsx(Ye, { value: t.percent, size: "sm" }),
    /* @__PURE__ */ e.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: t.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ e.jsx(ve, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ e.jsx(W, { variant: "default", onClick: t.reset, children: n("common.later") }),
      /* @__PURE__ */ e.jsx(W, { variant: "primary", onClick: t.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ e.jsx(Ge, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ e.jsx("span", { className: "min-w-0 break-words", children: t.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ e.jsx(W, { variant: "default", onClick: t.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ e.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ e.jsx(W, { variant: "primary", onClick: t.check, children: n("about.checkUpdate") })
  ] });
}
const ae = window.nomiDesktop?.platform === "win32";
function ln() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function dn({
  workspaceMode: t,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: c,
  onOpenModelCatalog: b,
  onRenameProject: m,
  directorMode: g = !1
}) {
  const { t: s } = G(), [S, j] = i.useState(!1), [y, E] = i.useState(o || s("appBar.untitledProject")), [A, I] = i.useState(!1), _ = i.useRef(null);
  i.useEffect(() => {
    !S && o && E(o);
  }, [o, S]);
  const k = i.useCallback(() => {
    E((x) => {
      const w = x.trim() || s("appBar.untitledProject");
      return m?.(w), w;
    }), j(!1);
  }, [m, s]), r = i.useCallback(() => {
    b?.();
  }, [b]);
  return /* @__PURE__ */ e.jsxs(
    "header",
    {
      className: h(
        "nomi-appbar",
        ae && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": s("appBar.workspace"),
      "data-director-mode": g ? "true" : void 0,
      onDoubleClick: Ke,
      children: [
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: h(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              ae ? null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    ref: _,
                    type: "button",
                    className: h(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": s("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": A,
                    onClick: () => I((x) => !x),
                    children: /* @__PURE__ */ e.jsx(Ue, {})
                  }
                ),
                A ? /* @__PURE__ */ e.jsx(et, { anchorEl: _.current, onClose: () => I(!1) }) : null,
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: h("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ e.jsxs(
                "div",
                {
                  className: h(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": s("appBar.locationNavigation"),
                  children: [
                    c ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                      /* @__PURE__ */ e.jsx(
                        W,
                        {
                          className: h(
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
                          onClick: c,
                          children: s("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ e.jsx(
                        "span",
                        {
                          className: h(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    S ? /* @__PURE__ */ e.jsx(
                      "input",
                      {
                        className: h(
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
                        onBlur: k,
                        onChange: (x) => E(x.currentTarget.value),
                        onKeyDown: (x) => {
                          x.key === "Enter" && k(), x.key === "Escape" && j(!1);
                        }
                      }
                    ) : /* @__PURE__ */ e.jsx(
                      W,
                      {
                        className: h(
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
        /* @__PURE__ */ e.jsx("div", { className: "app-no-drag", children: g ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: h(
              "inline-flex h-8 items-center gap-2 rounded-full border border-nomi-line px-3",
              "bg-nomi-ink-05 text-caption font-semibold text-nomi-ink-70",
              "max-[700px]:hidden"
            ),
            "aria-label": s("generationCommon.director.modeAria"),
            children: [
              /* @__PURE__ */ e.jsx("span", { className: "size-1.5 rounded-full bg-nomi-accent", "aria-hidden": "true" }),
              s("generationCommon.director.modeTitle")
            ]
          }
        ) : /* @__PURE__ */ e.jsx(Nt, { value: t, onChange: n }) }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: h(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": s("appBar.globalActions"),
            children: [
              /* @__PURE__ */ e.jsx(Ct, { className: "size-[30px]" }),
              !ae && !g ? /* @__PURE__ */ e.jsx(Ze, {}) : null,
              !ae && !g ? /* @__PURE__ */ e.jsx(e.Fragment, { children: /* @__PURE__ */ e.jsxs(
                W,
                {
                  className: h(
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
                  onClick: ln,
                  children: [
                    /* @__PURE__ */ e.jsx(He, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: h("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.browser") })
                  ]
                }
              ) }) : null,
              /* @__PURE__ */ e.jsxs(
                W,
                {
                  className: h(
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
                    /* @__PURE__ */ e.jsx(St, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: h("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ e.jsxs(
                W,
                {
                  className: h(
                    "nomi-appbar__primary",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-80)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": s(t === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: s(t === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    t === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : n("preview");
                  },
                  children: [
                    /* @__PURE__ */ e.jsx($t, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: h("nomi-appbar__action-text", "max-[1400px]:hidden"), children: s("appBar.export") })
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
const mn = Q("i18n:sidebar.categoryPanel", () => import("./CategoryTree-Qi5eDpUV.js")), pn = Q(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-C8cj2fNr.js").then((t) => ({
    default: t.PromptLibraryContent
  }))
), un = Q(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-BaDQQpNI.js").then((t) => ({
    default: t.SkillLibraryContent
  }))
), hn = Q(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-BfQNLD-8.js").then((t) => ({
    default: t.AssetLibraryContent
  }))
), xn = 60, bn = 300, fn = 500, gn = 60, kn = h(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Le = h(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), Te = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", ze = h(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function vn(t, n) {
  return n(t === "categories" ? "sidebar.groups" : t === "prompt-library" ? "sidebar.promptLibrary" : t === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function yn(t) {
  return t === "prompt-library" || t === "skill-library" || t === "asset-library";
}
function wn({ categories: t, projectId: n = null }) {
  const { t: o } = G(), [c, b] = i.useState("asset-library"), [m, g] = i.useState(0), s = T((r) => r.sidebarCollapsed), S = T((r) => r.toggleSidebarCollapsed), j = T((r) => r.setSidebarCollapsed), y = i.useCallback(() => {
    b("categories"), j(!1), g((r) => r + 1);
  }, [j]), E = i.useCallback((r) => {
    if (!s && c === r) {
      j(!0);
      return;
    }
    b(r), j(!1);
  }, [s, j, c]);
  i.useEffect(() => {
    const r = () => {
      b("asset-library"), j(!1);
    };
    return window.addEventListener("nomi-open-files-panel", r), () => window.removeEventListener("nomi-open-files-panel", r);
  }, [j]);
  const A = i.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: Kt
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: Zt
      }
    ],
    [o]
  ), I = i.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: Gt
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: Ft
      }
    ],
    [o]
  ), _ = vn(c, o), k = yn(c) ? fn : bn;
  return /* @__PURE__ */ e.jsx(
    "aside",
    {
      "data-collapsed": s ? "true" : "false",
      className: h(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: s ? xn : k },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ e.jsxs(_t, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: gn },
            children: [
              /* @__PURE__ */ e.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                A.map((r) => {
                  const x = r.icon, w = c === r.id;
                  return /* @__PURE__ */ e.jsxs(oe, { children: [
                    /* @__PURE__ */ e.jsx(re, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
                      "button",
                      {
                        type: "button",
                        className: h(Le, w && Te),
                        "aria-label": r.label,
                        "aria-pressed": w,
                        onClick: () => E(r.id),
                        children: [
                          /* @__PURE__ */ e.jsx(x, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ e.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ e.jsx(se, { side: "right", children: r.label })
                  ] }, r.id);
                }),
                /* @__PURE__ */ e.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                I.map((r) => {
                  const x = r.icon, w = c === r.id;
                  return /* @__PURE__ */ e.jsxs(oe, { children: [
                    /* @__PURE__ */ e.jsx(re, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
                      "button",
                      {
                        type: "button",
                        className: h(Le, w && Te),
                        "aria-label": r.label,
                        "aria-pressed": w,
                        onClick: () => E(r.id),
                        children: [
                          /* @__PURE__ */ e.jsx(x, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ e.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ e.jsx(se, { side: "right", children: r.label })
                  ] }, r.id);
                })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ e.jsxs(oe, { children: [
                /* @__PURE__ */ e.jsx(re, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: S,
                    className: kn,
                    "aria-label": o(s ? "sidebar.expand" : "sidebar.collapse"),
                    children: s ? /* @__PURE__ */ e.jsx(Qe, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ e.jsx(Pe, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ e.jsx(se, { side: "right", children: o(s ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        s ? null : /* @__PURE__ */ e.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": _, children: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ e.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: _ }),
            c === "categories" ? /* @__PURE__ */ e.jsxs(oe, { children: [
              /* @__PURE__ */ e.jsx(re, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: y,
                  className: ze,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ e.jsx(It, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ e.jsx(se, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ e.jsxs(oe, { children: [
              /* @__PURE__ */ e.jsx(re, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: S,
                  className: ze,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ e.jsx(Pe, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ e.jsx(se, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          c === "categories" ? /* @__PURE__ */ e.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(mn, { categories: t, createCategoryNonce: m }) }) : c === "prompt-library" ? /* @__PURE__ */ e.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(pn, { active: !0, compact: !0, showHeader: !1 }) }) : c === "skill-library" ? /* @__PURE__ */ e.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(un, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ e.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(hn, { projectId: n, compact: !0, showHeader: !1 }) })
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
function ho(t) {
  return De.find((n) => n.id === t) || De[0];
}
function xo(t) {
  return !t.chatOnly;
}
function tt(t) {
  return nt(t?.contentJson).trim();
}
function nt(t) {
  if (!t || typeof t != "object") return "";
  const n = t, o = typeof n.text == "string" ? n.text : "", c = Array.isArray(n.content) ? n.content.map(nt).filter(Boolean).join(`
`) : "";
  return [o, c].filter(Boolean).join(o && c ? `
` : "");
}
function bo(t) {
  const n = t.userRequest.trim();
  return t.mode.chatOnly ? [
    t.mode.prompt,
    "",
    "需要时可调用 read_full_text 读取当前文稿、read_selection 读取选区作为上下文；本模式不要改写文档。",
    "",
    "用户问题：",
    n || "（用户未输入文字，请礼貌询问需要什么帮助）"
  ].join(`
`) : [
    t.mode.prompt,
    "",
    "工具使用规则（真实工具调用，用户会在卡片上确认每一次写入）：",
    "- 读取上下文：需要现有正文时调用 read_full_text；只针对选中片段操作时调用 read_selection。不要假设你已经知道文稿内容，先读再写。",
    "- 写入文档：改写/润色选中片段用 replace_selection；在光标处续写或补充用 insert_at_cursor；交付完整结果追加到文末用 append_to_end。",
    "- 写入工具的 content 字段只放最终正文，不要写使用说明或解释。",
    "- 只有用户明确要求写入/插入/替换/追加时才调用写入工具；否则用自然语言回答即可。",
    "",
    "当前任务：",
    n || `请按“${t.mode.label}”模式处理当前材料。`
  ].join(`
`);
}
const jn = [
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
function ot(t) {
  return `${t.title || ""}
${t.prompt || ""}`.toLocaleLowerCase();
}
function X(t, n) {
  return n.test(ot(t));
}
function Nn(t) {
  return t.meta?.referenceSheet === !0;
}
function Cn(t) {
  return Nn(t) ? !1 : t.kind === "shot" ? !0 : t.kind !== "image" || t.meta?.storyboardKeyframe === !0 || t.meta?.workflowStage === "keyframe" || X(t, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof t.shotIndex == "number" || X(t, /镜头|分镜|shot/);
}
function Z(t, n) {
  return t.result?.type === n || t.history?.some((o) => o.type === n) === !0;
}
function Be(t, n) {
  const o = ot(t).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof t.shotIndex == "number" ? `shot-${t.shotIndex}` : `position-${n + 1}`;
}
function be(t, n, o = () => !0) {
  const c = new Set(
    n.filter(o).map((b, m) => Be(b, m))
  );
  return new Set(
    t.map((b, m) => Be(b, m)).filter((b) => c.has(b))
  ).size;
}
function Sn(t) {
  const n = t.documentText.trim(), o = n.length >= 4, c = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, b = t.nodes.filter(
    (u) => X(u, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || u.meta?.workflowStage === "style"
  ), m = t.nodes.filter(
    (u) => u.kind === "character" || X(u, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || u.meta?.workflowStage === "character"
  ), g = t.nodes.filter(
    (u) => u.kind === "scene" || X(u, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || u.meta?.workflowStage === "scene"
  ), s = t.nodes.filter(Cn), S = t.nodes.filter(
    (u) => X(u, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || u.meta?.cameraMoveAutoCapture !== void 0 || u.meta?.cameraMovePromptApplied !== void 0 || u.meta?.workflowStage === "motion"
  ), j = t.nodes.filter(
    (u) => u.kind === "keyframe" || u.meta?.storyboardKeyframe === !0 || X(u, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || u.meta?.workflowStage === "keyframe"
  ), y = t.nodes.filter((u) => u.kind === "video"), E = s.length, A = b.filter((u) => Z(u, "image")).length, I = m.filter((u) => Z(u, "image")).length, _ = g.filter((u) => Z(u, "image")).length, k = s.filter((u) => Z(u, "image")).length, r = be(
    s,
    j,
    (u) => Z(u, "image")
  ), x = be(
    s,
    y,
    (u) => Z(u, "video")
  ), w = be(s, S), l = b.length > 0 && A > 0, C = m.length > 0 && I === m.length, v = g.length > 0 && _ === g.length, p = E > 0 && k === E, N = E > 0 && w === E, M = E > 0 && r === E, D = y.length > 0, L = E > 0 && x === E, f = E > 0 && L && t.timelineClipCount >= E, z = {
    style: b.length > 0,
    character: m.length > 0,
    scene: g.length > 0,
    storyboard: s.length > 0,
    keyframe: j.length > 0,
    video: y.length > 0
  }, B = {
    style: A,
    character: I,
    scene: _,
    storyboard: k,
    keyframe: r,
    video: x
  }, a = {
    idea: o,
    script: c,
    style: l,
    character: C,
    scene: v,
    storyboard: p,
    motion: N,
    keyframe: M,
    video: L,
    review: f
  }, P = jn.map((u) => ({
    ...u,
    complete: a[u.id]
  })), $ = P.findIndex((u) => !u.complete), d = $ >= 0 ? $ : P.length - 1;
  return {
    stages: P,
    current: P[d],
    currentIndex: d,
    completedCount: P.filter((u) => u.complete).length,
    hasVideoNodes: D,
    hasGeneratedVideo: L,
    shotCount: E,
    plannedByStage: z,
    generatedCountByStage: B
  };
}
function _n(t) {
  return String(t.title || "").toLocaleLowerCase();
}
function rt(t) {
  return `${t.title || ""}
${t.prompt || ""}`.toLocaleLowerCase();
}
function O(t, n) {
  return n.test(_n(t));
}
function K(t) {
  return String(t.meta?.workflowStage || "").toLocaleLowerCase();
}
function st(t) {
  return K(t) === "story" || O(t, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function it(t) {
  return K(t) === "script" || O(t, /剧本|分场|script|screenplay/);
}
function In(t) {
  return K(t) === "style" || O(t, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function En(t) {
  return t.kind === "character" || K(t) === "character" || O(t, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function Mn(t) {
  return t.kind === "scene" || K(t) === "scene" || O(t, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function at(t) {
  return t.kind === "keyframe" || K(t) === "keyframe" || t.meta?.storyboardKeyframe === !0 || O(t, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function ct(t) {
  return t.kind === "video" && (K(t) === "video" || O(t, /镜头|shot|视频/));
}
function Pn(t) {
  return K(t) === "motion" || O(t, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function An(t) {
  return t.meta?.referenceSheet === !0 || at(t) || ct(t) ? !1 : t.kind === "shot" || t.kind === "image" && (K(t) === "storyboard" || typeof t.shotIndex == "number" || O(t, /镜头|分镜|shot/));
}
function ue(t) {
  const n = rt(t).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof t.shotIndex == "number" ? t.shotIndex : null;
}
function ce(t) {
  return [...t].sort((n, o) => {
    const c = ue(n) ?? Number.MAX_SAFE_INTEGER, b = ue(o) ?? Number.MAX_SAFE_INTEGER;
    return c !== b ? c - b : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function fe(t, n, o) {
  const c = ue(n);
  if (c !== null) {
    const b = t.filter((m) => ue(m) === c);
    if (b.length) return b;
  }
  return t[o] ? [t[o]] : [];
}
function Re(t, n) {
  if (t.length <= 1) return t;
  const o = rt(n), c = t.filter((b) => b.title.split(/[｜|·：:\s]/).map((g) => g.trim()).filter((g) => g.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(g)).some((g) => o.includes(g.toLocaleLowerCase())));
  return c.length ? c : t;
}
function $e(t, n, o) {
  const c = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), b = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return t.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${c}\\s*\\n([\\s\\S]*?)${b}`, "i"))?.[1]?.trim() || "";
}
function Ln(t, n) {
  const o = [];
  if (!n.some(st)) {
    const c = $e(t, "故事设定", "剧本");
    c && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: c,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(it)) {
    const c = $e(t, "剧本");
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
function Tn(t, n) {
  const o = t.filter(st), c = t.filter(it), b = t.filter(In), m = b.filter((r) => r.kind !== "text"), g = t.filter(En), s = t.filter(Mn), S = ce(t.filter(An)), j = ce(t.filter(Pn)), y = ce(t.filter(at)), E = ce(t.filter(ct)), A = [], I = new Set(n.map((r) => `${r.source}:${r.target}:${r.mode || "reference"}`)), _ = (r, x, w = "reference") => {
    if (!r || !x || r.id === x.id) return;
    const l = `${r.id}:${x.id}:${w}`;
    I.has(l) || (I.add(l), A.push({ source: r.id, target: x.id, mode: w }));
  };
  o.forEach((r) => c.forEach((x) => _(r, x))), c.forEach((r) => {
    g.forEach((x) => _(r, x)), s.forEach((x) => _(r, x)), S.forEach((x) => _(r, x));
  }), b.filter((r) => r.kind === "text").forEach((r) => {
    m.forEach((x) => _(r, x));
  });
  const k = m[0];
  return k && (g.forEach((r) => _(k, r, "style_ref")), s.forEach((r) => _(k, r, "style_ref")), y.forEach((r) => _(k, r, "style_ref"))), y.forEach((r, x) => {
    Re(g, r).forEach((w) => _(w, r, "character_ref")), Re(s, r).forEach((w) => _(w, r, "composition_ref")), fe(S, r, x).forEach((w) => _(w, r, "composition_ref"));
  }), E.forEach((r, x) => {
    const w = fe(y, r, x), l = w.find((v) => !O(v, /尾帧|last\s*frame/)) || w[0], C = w.find((v) => O(v, /尾帧|last\s*frame/));
    _(l, r, "first_frame"), _(C, r, "last_frame"), fe(j, r, x).forEach((v) => _(v, r));
  }), A;
}
function lt(t) {
  const n = t.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function dt(t) {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "当前文稿已经完整附在下面，不要再说“我先读取”，直接根据它扩写成能生产的短剧剧本。",
    "本轮必须调用 append_to_end，把最终剧本放在 args.content 中写回文稿；不要只在聊天里解释、承诺或复述步骤。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。",
    "",
    "当前文稿：",
    lt(t)
  ].join(`
`);
}
function mt(t, n) {
  const c = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    lt(n),
    ""
  ], b = {
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
  return [...c, ...b[t]].join(`
`);
}
function je(t) {
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
  }, c = t === "video" ? "视频" : "图片";
  return [
    `读取当前画布，${n[t]}。`,
    `先${o[t]}。`,
    `然后调用一次 run_generation_batch 启动这些${c}节点的真实生成。这个调用会花费额度，必须让用户看到并确认额度操作；不要创建重复节点，也不要生成其他阶段的资产。`
  ].join(`
`);
}
function H(t, n = !1) {
  return {
    script: "comic-screenwriter",
    style: "comic-vfx-designer",
    character: n ? "comic-character-artist" : "comic-character-designer",
    scene: n ? "comic-scene-artist" : "comic-scene-designer",
    storyboard: "comic-storyboard",
    motion: "comic-trajectory-artist",
    keyframe: "comic-keyframe-artist",
    video: "comic-video-artist"
  }[t];
}
function q(t, n) {
  return `guidedProduction.stage.${t}.${n}`;
}
function We(t) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(t);
}
function zn() {
  const { t } = G(), [n, o] = i.useState(!1), c = T((f) => f.workbenchDocument), b = T((f) => f.storyboardPlan), m = T((f) => f.storyboardPlanCommitted), g = T((f) => f.timeline), s = T((f) => f.setWorkspaceMode), S = T((f) => f.setStoryboardEditorOpen), j = T((f) => f.setCreationAiCollapsed), y = F((f) => f.nodes), E = F((f) => f.edges), A = ee((f) => f.activeScope), I = i.useMemo(
    () => Ne(y, A),
    [y, A]
  ), _ = i.useMemo(
    () => y.filter((f) => Et(f, I)),
    [I, y]
  ), k = i.useMemo(() => new Set(_.map((f) => f.id)), [_]), r = i.useMemo(
    () => E.filter((f) => k.has(f.source) && k.has(f.target)),
    [E, k]
  ), x = i.useMemo(
    () => Mt(g, y, I),
    [I, y, g]
  ), w = i.useMemo(
    () => tt(c),
    [c]
  ), l = i.useMemo(
    () => x.tracks.reduce((f, z) => f + z.clips.length, 0),
    [x.tracks]
  ), C = i.useMemo(
    () => Sn({
      documentText: w,
      nodes: _,
      timelineClipCount: l
    }),
    [w, _, b, m, l]
  ), v = C.current, p = C.completedCount === C.stages.length, N = We(v.id) && C.plannedByStage[v.id] && !v.complete;
  i.useEffect(() => {
    const f = Tn(_, r);
    if (!f.length) return;
    const z = F.getState();
    f.forEach((B) => z.connectNodes(B.source, B.target, B.mode));
  }, [r, _]);
  const M = p ? t("guidedProduction.completeAction") : v.id === "storyboard" && b && !m ? t("guidedProduction.reviewStoryboardAction") : t(N ? q(v.id, "generateAction") : q(v.id, "action")), D = i.useCallback(() => {
    const f = F.getState(), z = T.getState(), B = new Set(
      z.timeline.tracks.flatMap((d) => d.clips.map((u) => u.sourceNodeId))
    ), a = new Set(le.read_canvas().nodes.map((d) => d.id)), P = f.nodes.filter((d) => a.has(d.id)).filter((d) => d.kind === "video" && (d.status === "success" || d.result?.type === "video")).filter((d) => !B.has(d.id)).sort((d, u) => (d.shotIndex ?? Number.MAX_SAFE_INTEGER) - (u.shotIndex ?? Number.MAX_SAFE_INTEGER));
    let $ = Math.max(
      0,
      ...z.timeline.tracks.flatMap((d) => d.clips.map((u) => u.endFrame))
    );
    for (const d of P) {
      const u = le.send_to_timeline(d.id, { startFrame: $ });
      u.ok && ($ = u.clip.endFrame);
    }
    s("preview");
  }, [s]), L = i.useCallback(() => {
    if (p || v.id === "review") {
      D();
      return;
    }
    if (v.id === "idea") {
      s("creation"), j(!1);
      return;
    }
    if (v.id === "script") {
      s("creation"), j(!1), me({
        action: "send",
        prompt: dt(w),
        modeId: "script",
        displayMessage: t("guidedProduction.stage.script.displayMessage"),
        autoApproveWrites: !0,
        employeeKey: H("script"),
        requiredTool: "append_to_end"
      });
      return;
    }
    if (v.id === "storyboard") {
      if (b && !m) {
        s("creation"), j(!1), S(!0);
        return;
      }
      if (N) {
        s("generation"), pe({
          prompt: je("storyboard"),
          displayMessage: t("guidedProduction.stage.storyboard.generateDisplayMessage"),
          autoApproveSafeWrites: !0,
          employeeKey: H("storyboard", !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      s("creation"), j(!1), me({
        action: "storyboard",
        displayMessage: t("guidedProduction.stage.storyboard.displayMessage"),
        shotMode: "image",
        employeeKey: H("storyboard"),
        requiredTool: "propose_storyboard_plan"
      });
      return;
    }
    if (s("generation"), v.id === "style") {
      const f = Ln(
        w,
        F.getState().nodes
      );
      f.length && le.create_nodes(f);
    }
    pe({
      prompt: N && We(v.id) ? je(v.id) : mt(v.id, w),
      displayMessage: t(N ? q(v.id, "generateDisplayMessage") : `guidedProduction.stage.${v.id}.displayMessage`),
      autoApproveSafeWrites: !0,
      employeeKey: H(v.id, N),
      requiredTool: N ? "run_generation_batch" : "create_canvas_nodes"
    });
  }, [
    p,
    v.id,
    w,
    D,
    N,
    j,
    S,
    s,
    b,
    m,
    t
  ]);
  return /* @__PURE__ */ e.jsxs(
    "section",
    {
      className: h(
        "relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper",
        "px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      ),
      "aria-label": t("guidedProduction.aria"),
      children: [
        /* @__PURE__ */ e.jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center gap-3", children: [
          /* @__PURE__ */ e.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: p ? /* @__PURE__ */ e.jsx(ne, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ e.jsx(Ve, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: p ? t("guidedProduction.complete") : t("guidedProduction.step", {
                current: C.currentIndex + 1,
                total: C.stages.length
              }) }),
              /* @__PURE__ */ e.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: t(p ? "guidedProduction.completeTitle" : q(v.id, "title")) }),
              p ? null : /* @__PURE__ */ e.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: t(q(v.id, "owner")) })
            ] }),
            /* @__PURE__ */ e.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: t(p ? "guidedProduction.completeDescription" : q(v.id, "description")) })
          ] }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              className: h(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4",
                "border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer",
                "shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md"
              ),
              onClick: L,
              children: [
                M,
                /* @__PURE__ */ e.jsx(ye, { size: 15, stroke: 2 })
              ]
            }
          ),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: h(
                "grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line",
                "bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              "aria-label": t(n ? "guidedProduction.collapse" : "guidedProduction.expand"),
              "aria-expanded": n,
              onClick: () => o((f) => !f),
              children: n ? /* @__PURE__ */ e.jsx(Ut, { size: 16 }) : /* @__PURE__ */ e.jsx(Ce, { size: 16 })
            }
          )
        ] }),
        n ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: h(
              "absolute left-4 right-4 top-[calc(100%+8px)] mx-auto max-w-[1120px]",
              "rounded-nomi-lg border border-nomi-line bg-nomi-paper p-4 shadow-nomi-lg"
            ),
            children: [
              /* @__PURE__ */ e.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ e.jsxs("div", { children: [
                  /* @__PURE__ */ e.jsx("h2", { className: "m-0 text-body font-semibold text-nomi-ink", children: t("guidedProduction.allSteps") }),
                  /* @__PURE__ */ e.jsx("p", { className: "m-0 mt-0.5 text-caption text-nomi-ink-60", children: t("guidedProduction.allStepsDescription") })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-caption font-semibold text-nomi-accent", children: t("guidedProduction.completedCount", {
                  completed: C.completedCount,
                  total: C.stages.length
                }) })
              ] }),
              /* @__PURE__ */ e.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: C.stages.map((f, z) => {
                const B = !p && f.id === v.id;
                return /* @__PURE__ */ e.jsxs(
                  "li",
                  {
                    className: h(
                      "min-w-0 rounded-nomi border p-2.5",
                      f.complete ? "border-transparent bg-nomi-ink-05" : B ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ e.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        f.complete ? /* @__PURE__ */ e.jsx(ne, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ e.jsx(Ht, { size: 10, className: h("mx-0.5 shrink-0", B ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: t("guidedProduction.shortStep", { current: z + 1 }) })
                      ] }),
                      /* @__PURE__ */ e.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: t(q(f.id, "title")) })
                    ]
                  },
                  f.id
                );
              }) })
            ]
          }
        ) : null
      ]
    }
  );
}
function te(t, n) {
  return t(`generationCommon.director.stages.${n}.title`);
}
function ie(t, n) {
  return n ? n.kind === "global" ? t("generationCommon.director.globalScope") : n.kind === "episode" ? t("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? t("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : t("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : t("generationCommon.director.noShotSelected");
}
function Dn(t, n) {
  const o = n.current;
  return n.complete ? t("generationCommon.director.nextIncomplete") : o.id === "review" ? t("generationCommon.director.reviewAction") : o.running ? t("generationCommon.director.runningAction", { stage: te(t, o.id) }) : o.id === "script" ? t("generationCommon.director.scriptAction") : o.id === "storyboard" ? o.planned ? t("generationCommon.director.stagePlannedAction", { stage: te(t, o.id) }) : t("generationCommon.director.storyboardAction") : o.id === "motion" ? t("generationCommon.director.motionAction") : o.id === "keyframe" ? o.planned ? t("generationCommon.director.stagePlannedAction", { stage: te(t, o.id) }) : t("generationCommon.director.keyframeAction") : o.planned ? t("generationCommon.director.videoGenerateAction") : t("generationCommon.director.videoAction");
}
function Bn(t) {
  return t === "storyboard" || t === "keyframe" || t === "video";
}
function Rn({ projectName: t }) {
  const { t: n } = G(), o = F((a) => a.nodes), c = T((a) => a.timeline), b = T((a) => a.workbenchDocument), m = T((a) => a.setWorkspaceMode), g = T((a) => a.setActiveCategoryId), s = T((a) => a.setCreationAiCollapsed), S = F((a) => a.setGenerationAiCollapsed), j = ee((a) => a.activeScope), y = ee((a) => a.setActiveScope), E = J((a) => a.mode), A = J((a) => a.setMode), I = J((a) => a.directoryOpen), _ = J((a) => a.toggleDirectory), k = i.useMemo(() => qe(o), [o]), r = i.useMemo(
    () => Ne(o, j),
    [o, j]
  ), x = i.useMemo(
    () => o.filter((a) => Pt(a, r)),
    [r, o]
  ), w = i.useMemo(
    () => new Set(c.tracks.flatMap((a) => a.clips.map((P) => P.sourceNodeId))),
    [c.tracks]
  ), l = i.useMemo(
    () => we({ nodes: x, timelineSourceNodeIds: w }),
    [x, w]
  ), C = i.useMemo(
    () => At(k, r),
    [r, k]
  ), v = i.useMemo(
    () => _e(k, r, -1),
    [r, k]
  ), p = i.useMemo(
    () => _e(k, r, 1),
    [r, k]
  ), N = i.useMemo(
    () => tt(b),
    [b]
  ), M = i.useCallback((a) => {
    g("shots"), y(a), m("generation");
  }, [g, y, m]), D = i.useCallback(() => {
    const a = Ie(k);
    if (!a.length) return null;
    const P = Math.max(-1, C?.absoluteIndex ?? -1), $ = [...a.slice(P + 1), ...a.slice(0, P + 1)];
    for (const d of $) {
      const u = o.filter((U) => d.shot.nodeIds.includes(U.id));
      if (!we({ nodes: u, timelineSourceNodeIds: w }).complete) return d.shot.scope;
    }
    return null;
  }, [o, k, C?.absoluteIndex, w]), L = i.useCallback(() => {
    const a = T.getState(), P = new Set(
      a.timeline.tracks.flatMap((R) => R.clips.map((U) => U.sourceNodeId))
    ), $ = new Set(x.map((R) => R.id)), d = F.getState().nodes.filter((R) => $.has(R.id)).filter((R) => R.kind === "video" && (R.status === "success" || R.result?.type === "video")).filter((R) => !P.has(R.id));
    let u = Math.max(
      0,
      ...a.timeline.tracks.flatMap((R) => R.clips.map((U) => U.endFrame))
    );
    for (const R of d) {
      const U = le.send_to_timeline(R.id, { startFrame: u });
      U.ok && (u = U.clip.endFrame);
    }
    window.dispatchEvent(new CustomEvent("nomi-set-timeline-expanded", { detail: { expanded: !0 } })), m("preview");
  }, [x, m]), f = i.useCallback(() => {
    if (r?.kind !== "shot") {
      const P = Ie(k)[0]?.shot;
      P && M(P.scope);
      return;
    }
    if (l.complete) {
      const P = D();
      P ? M(P) : m("preview");
      return;
    }
    const a = l.current;
    if (!a.running) {
      if (a.id === "review") {
        L();
        return;
      }
      if (a.id === "script") {
        m("creation"), s(!1), me({
          action: "send",
          prompt: dt(N),
          modeId: "script",
          displayMessage: n("generationCommon.director.scopeScriptMessage", { scope: ie(n, r) }),
          autoApproveWrites: !0,
          employeeKey: H("script"),
          requiredTool: "append_to_end"
        });
        return;
      }
      if (a.id === "storyboard" && !a.planned) {
        m("creation"), s(!1), me({
          action: "storyboard",
          displayMessage: n("generationCommon.director.scopeStoryboardMessage", { scope: ie(n, r) }),
          shotMode: "image",
          employeeKey: H("storyboard"),
          requiredTool: "propose_storyboard_plan"
        });
        return;
      }
      if (m("generation"), S(!1), a.planned && Bn(a.id)) {
        pe({
          prompt: je(a.id),
          displayMessage: n("generationCommon.director.scopeGenerateMessage", {
            scope: ie(n, r),
            stage: te(n, a.id)
          }),
          autoApproveSafeWrites: !0,
          employeeKey: H(a.id, !0),
          requiredTool: "run_generation_batch"
        });
        return;
      }
      (a.id === "motion" || a.id === "keyframe" || a.id === "video") && pe({
        prompt: mt(a.id, N),
        displayMessage: n("generationCommon.director.scopeCreateMessage", {
          scope: ie(n, r),
          stage: te(n, a.id)
        }),
        autoApproveSafeWrites: !0,
        employeeKey: H(a.id),
        requiredTool: "create_canvas_nodes"
      });
    }
  }, [
    r,
    N,
    D,
    k,
    l,
    M,
    L,
    s,
    S,
    m,
    n
  ]);
  if (!k.isProductionProject || !r) return null;
  const z = r.kind === "shot", B = Math.round(l.productionCompletedCount / l.productionStageCount * 100);
  return /* @__PURE__ */ e.jsx(
    "section",
    {
      className: h(
        "production-director-bar relative z-[65] shrink-0 border-b border-nomi-line",
        "bg-[linear-gradient(90deg,var(--nomi-paper),color-mix(in_oklch,var(--nomi-accent)_5%,var(--nomi-paper)))]",
        "px-3 py-2"
      ),
      "data-production-director": "true",
      "data-director-mode": E,
      "aria-label": n("generationCommon.director.aria"),
      children: /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 items-center gap-2.5 max-[700px]:flex-wrap", children: [
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            className: h(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-nomi border px-3",
              I ? "border-nomi-accent bg-nomi-accent-soft text-nomi-accent" : "border-nomi-line bg-nomi-paper text-nomi-ink-70 hover:bg-nomi-ink-05"
            ),
            "aria-label": n(I ? "generationCommon.director.closeDirectory" : "generationCommon.director.openDirectory"),
            "aria-pressed": I,
            onClick: _,
            children: [
              /* @__PURE__ */ e.jsx(Qe, { size: 16, stroke: 1.9 }),
              /* @__PURE__ */ e.jsx("span", { className: "hidden text-caption font-semibold xl:inline", children: n("generationCommon.director.directory") })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "inline-flex shrink-0 items-center gap-1", children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !v,
              "aria-label": n("generationCommon.director.previousShot"),
              title: n("generationCommon.director.previousShot"),
              onClick: () => v && M(v.scope),
              children: /* @__PURE__ */ e.jsx(Jt, { size: 17 })
            }
          ),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: "grid size-8 place-items-center rounded-nomi border border-nomi-line bg-nomi-paper text-nomi-ink-60 disabled:cursor-not-allowed disabled:opacity-30",
              disabled: !p,
              "aria-label": n("generationCommon.director.nextShot"),
              title: n("generationCommon.director.nextShot"),
              onClick: () => p && M(p.scope),
              children: /* @__PURE__ */ e.jsx(de, { size: 17 })
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "min-w-[190px] shrink-0 max-[900px]:min-w-0 max-[700px]:min-w-[110px] max-[700px]:flex-1", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ e.jsx(Xe, { size: 15, stroke: 1.9, className: "shrink-0 text-nomi-accent" }),
            /* @__PURE__ */ e.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: ie(n, r) })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "mt-0.5 truncate text-micro text-nomi-ink-50 max-[700px]:hidden", children: z && C ? n("generationCommon.director.shotPosition", {
            project: t || n("generationCommon.productionHierarchy.season"),
            current: C.absoluteIndex + 1,
            total: k.totalShotCount
          }) : n("generationCommon.director.seasonSummary", {
            episodes: k.episodes.length,
            shots: k.totalShotCount
          }) })
        ] }),
        z ? /* @__PURE__ */ e.jsx("ol", { className: "m-0 hidden min-w-0 flex-1 list-none items-center gap-1 p-0 min-[1120px]:flex", children: l.stages.map((a, P) => {
          const $ = !l.complete && a.id === l.current.id;
          return /* @__PURE__ */ e.jsxs("li", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                className: h(
                  "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2 py-1.5",
                  a.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : $ ? "bg-nomi-accent-soft text-nomi-accent ring-1 ring-inset ring-nomi-accent/30" : "bg-nomi-ink-05 text-nomi-ink-40"
                ),
                "aria-current": $ ? "step" : void 0,
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "grid size-4 shrink-0 place-items-center rounded-full bg-current/10 text-[9px] font-bold", children: a.complete ? /* @__PURE__ */ e.jsx(ne, { size: 11, stroke: 2.5 }) : P + 1 }),
                  /* @__PURE__ */ e.jsx("span", { className: "truncate text-micro font-semibold", children: te(n, a.id) })
                ]
              }
            ),
            P < l.stages.length - 1 ? /* @__PURE__ */ e.jsx(ye, { size: 11, className: "shrink-0 text-nomi-ink-20" }) : null
          ] }, a.id);
        }) }) : /* @__PURE__ */ e.jsx("div", { className: "min-w-0 flex-1 text-caption text-nomi-ink-60", children: n("generationCommon.director.publicHint") }),
        z ? /* @__PURE__ */ e.jsxs("div", { className: "hidden w-[90px] shrink-0 text-right min-[900px]:block", children: [
          /* @__PURE__ */ e.jsx("div", { className: "text-micro font-semibold text-nomi-ink-60", children: n("generationCommon.director.currentShotProgress", { percent: B }) }),
          /* @__PURE__ */ e.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-nomi-ink-10", children: /* @__PURE__ */ e.jsx(
            "span",
            {
              className: "block h-full rounded-full bg-nomi-accent transition-[width]",
              style: { width: `${B}%` }
            }
          ) })
        ] }) : null,
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            className: h(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-3.5",
              "border-0 bg-nomi-accent text-white text-body-sm font-semibold shadow-nomi-sm",
              "transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-accent focus-visible:ring-offset-2",
              z && l.current.running && "cursor-wait opacity-70",
              "max-[700px]:order-10 max-[700px]:w-full max-[700px]:justify-center"
            ),
            disabled: z && l.current.running,
            "data-director-primary-action": z ? l.current.id : "enter-shot",
            onClick: f,
            children: [
              z && l.complete ? /* @__PURE__ */ e.jsx(ne, { size: 15 }) : /* @__PURE__ */ e.jsx(Ve, { size: 15 }),
              /* @__PURE__ */ e.jsx("span", { className: "max-w-[180px] truncate", children: z ? Dn(n, l) : n("generationCommon.director.enterFirstShot") }),
              /* @__PURE__ */ e.jsx(ye, { size: 15 })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            className: h(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi border border-nomi-line px-2.5",
              "bg-nomi-paper text-caption font-semibold text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink"
            ),
            "aria-label": n(E === "guided" ? "generationCommon.director.switchToProfessional" : "generationCommon.director.switchToGuided"),
            onClick: () => {
              const a = E === "guided" ? "professional" : "guided";
              A(a), a === "guided" && m("generation");
            },
            children: [
              E === "guided" ? /* @__PURE__ */ e.jsx(tn, { size: 15 }) : /* @__PURE__ */ e.jsx(Vt, { size: 15 }),
              /* @__PURE__ */ e.jsx("span", { className: "hidden min-[1280px]:inline", children: n(E === "guided" ? "generationCommon.director.professionalMode" : "generationCommon.director.guidedMode") })
            ]
          }
        )
      ] })
    }
  );
}
function ge(t) {
  return t === null ? "unassigned" : String(t);
}
function $n(t, n) {
  return n ? n.kind === "global" ? t("generationCommon.director.sidebar.global") : n.kind === "episode" ? t("generationCommon.director.episodeScope", { episode: n.episode }) : n.episode === null ? t("generationCommon.director.unassignedShotScope", { shot: n.shotNumber }) : t("generationCommon.director.shotScope", { episode: n.episode, shot: n.shotNumber }) : "";
}
function Wn(t, n) {
  return n.episode === null ? t("generationCommon.productionHierarchy.unassignedEpisode") : t("generationCommon.productionHierarchy.episode", { episode: n.episode });
}
function On({
  projectName: t,
  hierarchy: n,
  nodes: o,
  timelineSourceNodeIds: c = /* @__PURE__ */ new Set(),
  activeScope: b,
  onSelectScope: m,
  onClose: g
}) {
  const { t: s } = G(), [S, j] = i.useState(""), [y, E] = i.useState("all"), [A, I] = i.useState(() => {
    const l = b?.episode;
    return new Set(l !== void 0 ? [ge(l)] : []);
  }), _ = i.useMemo(() => new Map(o.map((l) => [l.id, l])), [o]);
  i.useEffect(() => {
    if (b?.kind === "global") return;
    const l = ge(b?.episode ?? null);
    I((C) => C.has(l) ? C : /* @__PURE__ */ new Set([...C, l]));
  }, [b]);
  const k = i.useCallback((l) => {
    const C = l.nodeIds.flatMap((N) => {
      const M = _.get(N);
      return M ? [M] : [];
    }), v = we({ nodes: C, timelineSourceNodeIds: c }), p = `${l.scope.shotNumber} ${C.map((N) => `${N.title} ${N.prompt ?? ""}`).join(" ")}`.toLowerCase();
    return { progress: v, searchable: p, status: qt(v) };
  }, [_, c]), r = i.useMemo(() => {
    const l = S.trim().toLowerCase();
    return n.episodes.map((C) => ({
      episode: C,
      shots: C.shots.filter((v) => {
        const p = k(v);
        return l && !p.searchable.includes(l) ? !1 : y === "failed" ? p.progress.hasFailure : y === "complete" ? p.progress.complete : y === "unfinished" ? !p.progress.complete : !0;
      })
    })).filter(({ shots: C }) => C.length > 0 || !l && y === "all");
  }, [y, n.episodes, S, k]), x = i.useMemo(() => {
    for (const l of n.episodes)
      for (const C of l.shots)
        if (!k(C).progress.complete) return C;
    return null;
  }, [n.episodes, k]);
  if (!n.isProductionProject || !b) return null;
  const w = Ee(b);
  return /* @__PURE__ */ e.jsxs(
    "aside",
    {
      className: h(
        "production-hierarchy-navigator relative z-[70] flex h-full w-[276px] shrink-0 flex-col overflow-hidden",
        "border-r border-workbench-border bg-nomi-paper shadow-[8px_0_24px_rgba(20,20,24,0.04)]",
        "max-[1100px]:absolute max-[1100px]:inset-y-0 max-[1100px]:left-0 max-[1100px]:shadow-workbench-pop"
      ),
      "data-production-hierarchy": "true",
      "aria-label": s("generationCommon.director.sidebar.aria"),
      children: [
        /* @__PURE__ */ e.jsxs("header", { className: "shrink-0 border-b border-nomi-line px-3 py-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ e.jsx("span", { className: "mt-0.5 grid size-8 shrink-0 place-items-center rounded-nomi bg-nomi-accent-soft text-nomi-accent", children: /* @__PURE__ */ e.jsx(Me, { size: 17, stroke: 1.9 }) }),
            /* @__PURE__ */ e.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-micro font-semibold uppercase tracking-[0.08em] text-nomi-ink-40", children: s("generationCommon.director.sidebar.title") }),
              /* @__PURE__ */ e.jsx("div", { className: "mt-0.5 truncate text-body-sm font-semibold text-nomi-ink", children: t || s("generationCommon.productionHierarchy.season") }),
              /* @__PURE__ */ e.jsx("div", { className: "mt-0.5 text-micro text-nomi-ink-50", children: s("generationCommon.director.seasonSummary", {
                episodes: n.episodes.filter((l) => l.episode !== null).length,
                shots: n.totalShotCount
              }) })
            ] }),
            g ? /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                className: "grid size-7 shrink-0 place-items-center rounded-nomi border-0 bg-transparent text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "aria-label": s("generationCommon.director.closeDirectory"),
                onClick: g,
                children: /* @__PURE__ */ e.jsx(Lt, { size: 16, stroke: 1.8 })
              }
            ) : null
          ] }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              className: h(
                "mt-3 flex w-full items-center gap-2 rounded-nomi border border-nomi-accent/25",
                "bg-nomi-accent-soft px-2.5 py-2 text-left hover:border-nomi-accent/50"
              ),
              onClick: () => x && m(x.scope),
              disabled: !x,
              children: [
                x ? /* @__PURE__ */ e.jsx(Tt, { size: 15, className: "shrink-0 text-nomi-accent" }) : /* @__PURE__ */ e.jsx(ve, { size: 15, className: "shrink-0 text-workbench-success" }),
                /* @__PURE__ */ e.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s(x ? "generationCommon.director.sidebar.continueIncomplete" : "generationCommon.director.sidebar.allComplete") }),
                  /* @__PURE__ */ e.jsx("span", { className: "block truncate text-micro text-nomi-ink-50", children: x ? $n(s, x.scope) : s("generationCommon.director.sidebar.allCompleteHint") })
                ] }),
                x ? /* @__PURE__ */ e.jsx(de, { size: 15, className: "text-nomi-ink-40" }) : null
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs("label", { className: "mt-2.5 flex h-8 items-center gap-2 rounded-nomi border border-nomi-line bg-workbench-bg px-2.5 focus-within:border-nomi-accent", children: [
            /* @__PURE__ */ e.jsx(zt, { size: 14, className: "shrink-0 text-nomi-ink-40" }),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                className: "min-w-0 flex-1 border-0 bg-transparent p-0 text-caption text-nomi-ink outline-none placeholder:text-nomi-ink-30",
                value: S,
                placeholder: s("generationCommon.director.sidebar.searchPlaceholder"),
                "aria-label": s("generationCommon.director.sidebar.searchAria"),
                onChange: (l) => j(l.currentTarget.value)
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(
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
              ].map(([l, C]) => /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  className: h(
                    "h-7 rounded-nomi-sm border-0 px-1 text-micro font-semibold",
                    y === l ? "bg-nomi-ink text-nomi-paper" : "bg-nomi-ink-05 text-nomi-ink-50 hover:text-nomi-ink"
                  ),
                  "aria-pressed": y === l,
                  onClick: () => E(l),
                  children: s(`generationCommon.director.sidebar.${C}`)
                },
                l
              ))
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]", children: [
          n.globalNodeIds.length ? /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              className: h(
                "mb-1 flex w-full items-center gap-2 rounded-nomi border px-2.5 py-2 text-left",
                w === "global" ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent bg-transparent hover:bg-nomi-ink-05"
              ),
              "data-production-scope": "global",
              "aria-current": w === "global" ? "page" : void 0,
              onClick: () => m({ kind: "global", episode: null, shotNumber: 0 }),
              children: [
                /* @__PURE__ */ e.jsx(Dt, { size: 16, stroke: 1.8, className: "shrink-0 text-nomi-ink-50" }),
                /* @__PURE__ */ e.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s("generationCommon.director.sidebar.global") }),
                  /* @__PURE__ */ e.jsx("span", { className: "block truncate text-micro text-nomi-ink-40", children: s("generationCommon.director.sidebar.globalDescription") })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: n.globalNodeIds.length })
              ]
            }
          ) : null,
          r.map(({ episode: l, shots: C }) => {
            const v = ge(l.episode), p = A.has(v), N = l.shots.filter((M) => k(M).progress.complete).length;
            return /* @__PURE__ */ e.jsxs("section", { className: "mb-1 overflow-hidden rounded-nomi border border-nomi-line", children: [
              /* @__PURE__ */ e.jsxs(
                "button",
                {
                  type: "button",
                  className: "flex w-full items-center gap-2 border-0 bg-nomi-ink-05 px-2.5 py-2 text-left hover:bg-nomi-ink-10",
                  "aria-expanded": p,
                  onClick: () => I((M) => {
                    const D = new Set(M);
                    return D.has(v) ? D.delete(v) : D.add(v), D;
                  }),
                  children: [
                    p ? /* @__PURE__ */ e.jsx(Ce, { size: 15 }) : /* @__PURE__ */ e.jsx(de, { size: 15 }),
                    /* @__PURE__ */ e.jsx(Xe, { size: 16, stroke: 1.8, className: "text-nomi-accent" }),
                    /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate text-caption font-semibold text-nomi-ink", children: Wn(s, l) }),
                    /* @__PURE__ */ e.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: s("generationCommon.director.sidebar.episodeProgress", {
                      completed: N,
                      total: l.shots.length
                    }) })
                  ]
                }
              ),
              p ? /* @__PURE__ */ e.jsxs("div", { className: "space-y-1 bg-nomi-paper p-1.5", children: [
                l.episode !== null && l.overviewNodeIds.length ? /* @__PURE__ */ e.jsxs(
                  "button",
                  {
                    type: "button",
                    className: h(
                      "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-1.5 text-left",
                      w === `episode:${l.episode}` ? "border-nomi-accent bg-nomi-accent-soft" : "border-transparent hover:bg-nomi-ink-05"
                    ),
                    "data-production-scope": `episode:${l.episode}`,
                    "aria-current": w === `episode:${l.episode}` ? "page" : void 0,
                    onClick: () => m({ kind: "episode", episode: l.episode, shotNumber: 0 }),
                    children: [
                      /* @__PURE__ */ e.jsx(Me, { size: 14, className: "text-nomi-ink-50" }),
                      /* @__PURE__ */ e.jsx("span", { className: "text-caption font-medium text-nomi-ink", children: s("generationCommon.director.sidebar.episodeOverview") })
                    ]
                  }
                ) : null,
                C.map((M) => {
                  const D = Ee(M.scope), L = k(M);
                  return /* @__PURE__ */ e.jsxs(
                    "button",
                    {
                      type: "button",
                      className: h(
                        "flex w-full items-center gap-2 rounded-nomi-sm border px-2 py-2 text-left",
                        w === D ? "border-nomi-accent bg-nomi-accent-soft shadow-[inset_3px_0_0_var(--nomi-accent)]" : "border-transparent hover:bg-nomi-ink-05"
                      ),
                      "data-production-scope": D,
                      "data-shot-status": L.progress.complete ? "complete" : L.progress.hasFailure ? "failed" : "unfinished",
                      "aria-current": w === D ? "true" : void 0,
                      onClick: () => m(M.scope),
                      children: [
                        /* @__PURE__ */ e.jsx(
                          "span",
                          {
                            className: h(
                              "grid size-7 shrink-0 place-items-center rounded-full text-micro font-bold tabular-nums",
                              w === D ? "bg-nomi-accent text-white" : L.progress.complete ? "bg-[color-mix(in_oklch,var(--workbench-success)_12%,transparent)] text-workbench-success" : L.progress.hasFailure ? "bg-[color-mix(in_oklch,var(--workbench-danger)_12%,transparent)] text-workbench-danger" : "bg-nomi-ink-05 text-nomi-ink-60"
                            ),
                            children: L.progress.complete ? /* @__PURE__ */ e.jsx(ne, { size: 13 }) : M.scope.shotNumber
                          }
                        ),
                        /* @__PURE__ */ e.jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ e.jsx("span", { className: "block text-caption font-semibold text-nomi-ink", children: s("generationCommon.director.sidebar.shot", { shot: M.scope.shotNumber }) }),
                          /* @__PURE__ */ e.jsxs("span", { className: h(
                            "mt-0.5 flex items-center gap-1 text-micro",
                            L.progress.hasFailure ? "text-workbench-danger" : "text-nomi-ink-40"
                          ), children: [
                            L.progress.hasFailure ? /* @__PURE__ */ e.jsx(Ge, { size: 11 }) : null,
                            s(`generationCommon.director.sidebar.status.${L.status}`, {
                              stage: s(`generationCommon.director.stages.${L.progress.current.id}.title`)
                            })
                          ] })
                        ] }),
                        /* @__PURE__ */ e.jsx("span", { className: "text-micro font-semibold tabular-nums text-nomi-ink-40", children: s("generationCommon.director.sidebar.stageProgress", {
                          completed: L.progress.productionCompletedCount,
                          total: L.progress.productionStageCount
                        }) })
                      ]
                    },
                    D
                  );
                }),
                C.length ? null : /* @__PURE__ */ e.jsx("div", { className: "px-2 py-4 text-center text-micro text-nomi-ink-40", children: s("generationCommon.director.sidebar.emptyFilter") })
              ] }) : null
            ] }, v);
          })
        ] })
      ]
    }
  );
}
const Fn = Q(
  "创作区",
  () => import("./CreationWorkspace-CNZD8wiS.js")
), Gn = Q(
  "生成区",
  () => import("./GenerationWorkspace-CsWqiTVk.js")
), Kn = Q("预览区", () => import("./PreviewWorkspace-C99Nilds.js")), Un = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, Hn = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function Vn({ label: t }) {
  const { t: n } = G(), o = n("workspace.loading", { label: t });
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      className: h(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ e.jsx(Fe, { size: 28, label: o })
    }
  );
}
function ke({
  active: t,
  children: n,
  label: o
}) {
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      className: h(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !t,
      children: /* @__PURE__ */ e.jsx(
        i.Suspense,
        {
          fallback: t ? /* @__PURE__ */ e.jsx(Vn, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function qn() {
  if (typeof window > "u") return "generation";
  try {
    const t = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return Hn[t] || "generation";
  } catch {
    return "generation";
  }
}
function Oe(t) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = Un[t];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function Xn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function Jn({
  generation: t,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: c,
  projectName: b,
  onBackToLibrary: m,
  onOpenModelCatalog: g,
  onRenameProject: s
}) {
  const { t: S } = G(), j = T((d) => d.workspaceMode), y = T(
    (d) => d.setWorkspaceMode
  ), E = T((d) => d.categories), A = T((d) => d.setActiveCategoryId), I = F((d) => d.nodes), _ = i.useMemo(
    () => qe(I),
    [I]
  ), k = ee((d) => d.activeScope), r = ee((d) => d.syncProject), x = ee((d) => d.setActiveScope), w = i.useMemo(
    () => Ne(I, k),
    [I, k]
  ), l = J((d) => d.mode), C = J((d) => d.directoryOpen), v = J((d) => d.setDirectoryOpen), p = _.isProductionProject, N = p && l === "guided", M = T((d) => d.timeline), D = i.useMemo(
    () => new Set(
      M.tracks.flatMap((d) => d.clips.map((u) => u.sourceNodeId))
    ),
    [M.tracks]
  ), [L, f] = i.useState(() => [j]), [z, B] = i.useState(!1), a = i.useRef(null);
  i.useEffect(() => {
    r(c ?? null, I);
  }, [I, c, r]);
  const P = window.nomiDesktop?.platform === "win32";
  i.useEffect(() => {
    const d = T.getState().workspaceMode;
    Oe(d);
    const u = () => {
      y(qn());
    };
    return window.addEventListener("popstate", u), () => window.removeEventListener("popstate", u);
  }, [y]), i.useEffect(() => {
    f(
      (d) => d.includes(j) ? d : [...d, j]
    );
  }, [j]);
  const $ = i.useCallback(
    (d) => {
      Bt(d) && (y(d), Oe(d));
    },
    [y]
  );
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: h(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": j,
      children: [
        P ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: h(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": S("appBar.windowTitleBar"),
            onDoubleClick: Ke,
            children: [
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  ref: a,
                  type: "button",
                  className: h(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": S("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": z,
                  onClick: () => B((d) => !d),
                  children: /* @__PURE__ */ e.jsx(Ue, { markSize: 18, wordSize: 14 })
                }
              ),
              z ? /* @__PURE__ */ e.jsx(et, { anchorEl: a.current, onClose: () => B(!1) }) : null,
              /* @__PURE__ */ e.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              N ? null : /* @__PURE__ */ e.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ e.jsx(Ze, {}) }),
              /* @__PURE__ */ e.jsx(
                "div",
                {
                  className: h(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": S("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ e.jsxs(
                    "button",
                    {
                      type: "button",
                      className: h(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": S("appBar.openBrowser"),
                      title: S("appBar.browser"),
                      onClick: Xn,
                      children: [
                        /* @__PURE__ */ e.jsx(He, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ e.jsx("span", { children: S("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ e.jsx(Rt, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ e.jsx(
          dn,
          {
            workspaceMode: j,
            onWorkspaceModeChange: $,
            projectName: b,
            onBackToLibrary: m,
            onOpenModelCatalog: g,
            onRenameProject: s,
            directorMode: N
          }
        ),
        p ? /* @__PURE__ */ e.jsx(Rn, { projectName: b }) : /* @__PURE__ */ e.jsx(zn, {}),
        /* @__PURE__ */ e.jsxs(
          "main",
          {
            className: h(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              j === "generation" && N && C ? /* @__PURE__ */ e.jsx(
                On,
                {
                  projectName: b,
                  hierarchy: _,
                  nodes: I,
                  timelineSourceNodeIds: D,
                  activeScope: w,
                  onSelectScope: (d) => {
                    A("shots"), x(d);
                  },
                  onClose: () => v(!1)
                }
              ) : null,
              j === "generation" && !N ? /* @__PURE__ */ e.jsx(wn, { projectId: c ?? null, categories: E }) : null,
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                L.includes("creation") ? /* @__PURE__ */ e.jsx(
                  ke,
                  {
                    active: j === "creation",
                    label: S("workspace.creation"),
                    children: /* @__PURE__ */ e.jsx(Fn, {})
                  }
                ) : null,
                L.includes("generation") ? /* @__PURE__ */ e.jsx(
                  ke,
                  {
                    active: j === "generation",
                    label: S("workspace.generation"),
                    children: /* @__PURE__ */ e.jsx(
                      Gn,
                      {
                        canvas: t,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                L.includes("preview") ? /* @__PURE__ */ e.jsx(
                  ke,
                  {
                    active: j === "preview",
                    label: S("workspace.preview"),
                    children: /* @__PURE__ */ e.jsx(Kn, {})
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
const fo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Jn
}, Symbol.toStringTag, { value: "Module" }));
export {
  De as C,
  Jt as I,
  fo as W,
  bo as b,
  tt as e,
  ho as g,
  xo as m
};
