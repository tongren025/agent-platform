import { aR as G, dV as I, S as t, dK as re, dL as te, cJ as P, bZ as se, cK as oe, ch as ie, e1 as le, cg as W, b_ as ce, c8 as e, aJ as i, l as de, bs as pe, dP as me, b as be, K as ue, O as xe, a0 as he, J as $, a8 as N, I as fe, bM as Y, z as X, M as ge, L as ke, k as q, r as ve, dW as L, a3 as we, a1 as A, a4 as M, a2 as z, s as je, c9 as S, c6 as ye, a7 as Ne } from "./agentStudioMount-Dd-4ILXh.js";
import { I as Ce } from "./IconDownload-b-qIzclr.js";
import { I as _e, a as Le } from "./IconChevronRight-bRJxnxSO.js";
import { I as Ee } from "./IconListCheck-Da2tvSQu.js";
import { I as Q } from "./IconMap-e5uoo2mP.js";
import { u as Ie } from "./journeyTourActivity-DX9aD3lI.js";
import { D as Z } from "./status-BCKlZ5vb.js";
import { I as O } from "./IconCircleCheck-Cb5er4T1.js";
import { I as Se } from "./IconBooks-mLYlmElM.js";
import { I as Te } from "./IconBulb-CWRNOE2D.js";
import { I as Be } from "./IconFolder-BSlB-oYc.js";
import { I as Ae } from "./IconLayoutSidebarLeftExpand-CiAEZXay.js";
const Me = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], U = G("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", Me);
const ze = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], De = G("outline", "tags", "Tags", ze), _ = ["model", "storyboard", "generated", "exported"];
function ee() {
  const { t: n } = I(), a = t.useMemo(
    () => [
      { key: "model", label: n("onboarding.steps.model.label"), hint: n("onboarding.steps.model.hint") },
      { key: "storyboard", label: n("onboarding.steps.storyboard.label"), hint: n("onboarding.steps.storyboard.hint") },
      { key: "generated", label: n("onboarding.steps.generated.label"), hint: n("onboarding.steps.generated.hint") },
      { key: "exported", label: n("onboarding.steps.exported.label"), hint: n("onboarding.steps.exported.hint") }
    ],
    [n]
  ), r = re((c) => c.nodes), { hasTextModel: p } = te(), g = Ie(), b = t.useMemo(
    () => ({
      model: p === !0,
      storyboard: r.length > 0,
      generated: r.some((c) => c.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [p, r]
  ), [o, l] = t.useState(() => P()), [m, d] = t.useState(() => se()), [u, v] = t.useState(() => !oe()), w = t.useRef(null), [f, j] = t.useState(null);
  t.useEffect(() => {
    let c = !1;
    for (const h of _)
      b[h] && !o[h] && (ie(h), c = !0);
    c && l(P());
  }, [b, o]), t.useEffect(() => {
    const c = () => l(P());
    return window.addEventListener("storage", c), window.addEventListener("focus", c), () => {
      window.removeEventListener("storage", c), window.removeEventListener("focus", c);
    };
  }, []);
  const k = t.useMemo(
    () => ({
      model: o.model || b.model,
      storyboard: o.storyboard || b.storyboard,
      generated: o.generated || b.generated,
      exported: o.exported || b.exported
    }),
    [o, b]
  ), s = _.filter((c) => k[c]).length, y = s === _.length, C = a.find((c) => !k[c.key])?.key ?? null, x = t.useCallback(() => {
    const c = w.current;
    if (!c) return;
    const h = c.getBoundingClientRect();
    j({ top: h.bottom + 8, right: Math.max(8, window.innerWidth - h.right) });
  }, []);
  t.useEffect(() => {
    if (u)
      return x(), window.addEventListener("resize", x), () => window.removeEventListener("resize", x);
  }, [u, x]), t.useEffect(() => {
    if (!u) return;
    const c = (h) => {
      const T = h.target;
      T && T.closest("[data-onboarding-checklist-root]") || v(!1);
    };
    return window.addEventListener("pointerdown", c, !0), () => window.removeEventListener("pointerdown", c, !0);
  }, [u]);
  const B = t.useCallback(() => {
    v((c) => {
      const h = !c;
      return le(!h), h;
    });
  }, []), ae = t.useCallback(() => {
    W(), d(!0);
  }, []);
  return t.useEffect(() => {
    m || y || ce(Date.now()) && (W(), d(!0));
  }, [m, y]), y || g || m ? null : /* @__PURE__ */ e.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        ref: w,
        onClick: B,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": n("onboarding.progressLabel", { done: s, total: _.length }),
        "aria-expanded": u,
        className: i(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          u && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ e.jsx(Ee, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ e.jsx("span", { className: "max-[700px]:hidden", children: n("onboarding.trigger") }),
          /* @__PURE__ */ e.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            s,
            "/",
            _.length
          ] })
        ]
      }
    ),
    u && f ? /* @__PURE__ */ e.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": n("onboarding.panelLabel"),
        style: { top: f.top, right: f.right },
        className: i(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ e.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: n("onboarding.panelLabel") }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              s,
              " / ",
              _.length
            ] }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => B(),
                "aria-label": n("onboarding.collapse"),
                className: i(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ e.jsx(_e, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(Z, { value: s / _.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ e.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: a.map((c) => {
            const h = k[c.key], T = !h && c.key === C;
            return /* @__PURE__ */ e.jsx(
              "li",
              {
                "data-step": c.key,
                "data-done": h ? "true" : "false",
                className: i("flex flex-col gap-1.5 p-2 rounded-nomi-sm", T && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ e.jsx(
                    "span",
                    {
                      className: i(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        h ? "bg-nomi-accent text-nomi-paper" : T ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: h ? /* @__PURE__ */ e.jsx(de, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ e.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ e.jsx(
                      "span",
                      {
                        className: i(
                          "block text-body-sm font-medium leading-snug",
                          h ? "text-nomi-ink-40" : T ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: c.label
                      }
                    ),
                    h ? null : /* @__PURE__ */ e.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: c.hint })
                  ] })
                ] })
              },
              c.key
            );
          }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-t border-nomi-line-soft px-3 py-2", children: [
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), v(!1);
                },
                className: i(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ e.jsx(Q, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  n("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: ae,
                className: i(
                  "rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-ink-40 transition-colors hover:text-nomi-ink"
                ),
                children: n("onboarding.dismiss")
              }
            )
          ] })
        ]
      }
    ) : null
  ] });
}
const Pe = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, E = Pe;
function Re(n, a) {
  switch (a.type) {
    case "checking":
      return { ...E, phase: "checking" };
    case "up-to-date":
      return { ...E, phase: "up-to-date" };
    case "available":
      return { ...E, phase: "available", latestVersion: a.version, notes: a.notes };
    case "progress":
      return { ...n, phase: "downloading", percent: a.percent };
    case "downloaded":
      return { ...n, phase: "downloaded", latestVersion: a.version || n.latestVersion };
    case "error":
      return { ...n, phase: "error", errorMessage: a.message };
    default:
      return n;
  }
}
function We() {
  const a = pe()?.update, r = !!a, [p, g] = t.useState(null), [b, o] = t.useState(E);
  t.useEffect(() => {
    let f = !0;
    a?.appInfo().then((k) => {
      f && g(k);
    }).catch(() => {
    });
    const j = a?.onEvent((k) => o((s) => Re(s, k)));
    return () => {
      f = !1, j?.();
    };
  }, [a]), t.useEffect(() => {
    if (b.phase !== "up-to-date") return;
    const f = window.setTimeout(() => o(E), 2500);
    return () => window.clearTimeout(f);
  }, [b.phase]);
  const l = t.useCallback(() => {
    o({ ...E, phase: "checking" }), a?.check().catch(() => {
    });
  }, [a]), m = t.useCallback(() => {
    o((f) => ({ ...f, phase: "downloading", percent: 0 })), a?.download().catch(() => {
    });
  }, [a]), d = t.useCallback(() => {
    a?.install().catch(() => {
    });
  }, [a]), u = t.useCallback(() => {
    a?.openRelease().catch(() => {
    });
  }, [a]), v = t.useCallback(() => o(E), []), w = p?.canAutoInstall ?? !0;
  return {
    phase: b.phase,
    appInfo: p,
    latestVersion: b.latestVersion,
    notes: b.notes,
    percent: b.percent,
    errorMessage: b.errorMessage,
    supported: r,
    canAutoInstall: w,
    check: l,
    download: m,
    install: d,
    openRelease: u,
    reset: v
  };
}
const Oe = 360, H = 12;
function Ue(n) {
  return n ? `${n.platform === "win32" ? "Windows" : n.platform === "darwin" ? "macOS" : n.platform} · ${n.arch}` : "";
}
function ne({ anchorEl: n, onClose: a }) {
  const { t: r } = I(), p = We(), { isDark: g } = me(), [b, o] = t.useState(null);
  return t.useLayoutEffect(() => {
    if (!n) return;
    const l = () => {
      const m = n.getBoundingClientRect(), d = Math.min(m.left, window.innerWidth - Oe - H), u = m.bottom + 8;
      o({ top: u, left: Math.max(H, d) });
    };
    return l(), window.addEventListener("resize", l), window.addEventListener("scroll", l, !0), () => {
      window.removeEventListener("resize", l), window.removeEventListener("scroll", l, !0);
    };
  }, [n]), t.useEffect(() => {
    const l = (m) => {
      m.key === "Escape" && a();
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [a]), /* @__PURE__ */ e.jsxs(be, { children: [
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: "fixed inset-0 z-[600]",
        onMouseDown: a,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: i(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: b?.top ?? -9999, left: b?.left ?? -9999 },
        role: "dialog",
        "aria-label": r("about.dialogLabel"),
        onMouseDown: (l) => l.stopPropagation(),
        children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ e.jsx(ue, { size: 40 }),
            /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ e.jsx(xe, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ e.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                r("about.currentVersion", { version: p.appInfo?.version ?? "…" }),
                p.appInfo ? ` · ${Ue(p.appInfo)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              className: "mb-3.5 flex w-full min-h-9 items-center gap-2.5 rounded-nomi-sm border-0 bg-[var(--nomi-ink-05)] px-3 py-2 cursor-pointer text-left transition-colors hover:bg-[var(--nomi-ink-10)]",
              onClick: () => {
                window.dispatchEvent(new CustomEvent("nomi-open-handbook")), a();
              },
              children: [
                /* @__PURE__ */ e.jsx(Q, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ e.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: r("about.handbook") }),
                  /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: r("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ e.jsx(Le, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: r("theme.appearance") }),
              /* @__PURE__ */ e.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: r(g ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ e.jsx(he, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: p.supported ? /* @__PURE__ */ e.jsx(He, { updater: p }) : /* @__PURE__ */ e.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: r("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function He({ updater: n }) {
  const { t: a } = I(), { phase: r } = n;
  return r === "checking" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ e.jsx($, { size: 16, label: a("about.checking") }),
    a("about.checkingEllipsis")
  ] }) : r === "up-to-date" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ e.jsx(O, { size: 16, className: "text-[var(--workbench-success)]" }),
    a("about.upToDate")
  ] }) : r === "available" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ e.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        a("about.available"),
        " ",
        /* @__PURE__ */ e.jsx("b", { className: "font-medium", children: n.latestVersion })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ e.jsx(N, { variant: "default", onClick: n.reset, children: a("common.later") }),
        n.canAutoInstall ? /* @__PURE__ */ e.jsx(N, { variant: "primary", onClick: n.download, children: a("about.downloadUpdate") }) : /* @__PURE__ */ e.jsx(N, { variant: "primary", onClick: n.openRelease, children: a("about.openDownload") })
      ] })
    ] }),
    n.canAutoInstall ? null : /* @__PURE__ */ e.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: a("about.macManualUpdate") }),
    n.notes ? /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: n.notes }) : null
  ] }) : r === "downloading" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: a("about.downloading") }),
    /* @__PURE__ */ e.jsx(Z, { value: n.percent, size: "sm" }),
    /* @__PURE__ */ e.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: a("about.downloadingHint", { percent: n.percent }) })
  ] }) : r === "downloaded" ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ e.jsx(O, { size: 16, className: "text-[var(--workbench-success)]" }),
      a("about.downloaded")
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ e.jsx(N, { variant: "default", onClick: n.reset, children: a("common.later") }),
      /* @__PURE__ */ e.jsx(N, { variant: "primary", onClick: n.install, children: a("about.restartInstall") })
    ] })
  ] }) : r === "error" ? /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ e.jsx(fe, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ e.jsx("span", { className: "min-w-0 break-words", children: n.errorMessage || a("about.updateError") })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ e.jsx(N, { variant: "default", onClick: n.check, children: a("common.retry") }) })
  ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ e.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: a("about.checkAvailable") }),
    /* @__PURE__ */ e.jsx(N, { variant: "primary", onClick: n.check, children: a("about.checkUpdate") })
  ] });
}
const D = window.nomiDesktop?.platform === "win32";
function Ve() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function Je({
  workspaceMode: n,
  onWorkspaceModeChange: a,
  projectName: r,
  onBackToLibrary: p,
  onOpenModelCatalog: g,
  onRenameProject: b
}) {
  const { t: o } = I(), [l, m] = t.useState(!1), [d, u] = t.useState(r || o("appBar.untitledProject")), [v, w] = t.useState(!1), f = t.useRef(null);
  t.useEffect(() => {
    !l && r && u(r);
  }, [r, l]);
  const j = t.useCallback(() => {
    u((s) => {
      const y = s.trim() || o("appBar.untitledProject");
      return b?.(y), y;
    }), m(!1);
  }, [b, o]), k = t.useCallback(() => {
    g?.();
  }, [g]);
  return /* @__PURE__ */ e.jsxs(
    "header",
    {
      className: i(
        "nomi-appbar",
        D && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": o("appBar.workspace"),
      onDoubleClick: Y,
      children: [
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: i(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              D ? null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    ref: f,
                    type: "button",
                    className: i(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": o("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": v,
                    onClick: () => w((s) => !s),
                    children: /* @__PURE__ */ e.jsx(X, {})
                  }
                ),
                v ? /* @__PURE__ */ e.jsx(ne, { anchorEl: f.current, onClose: () => w(!1) }) : null,
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: i("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ e.jsxs(
                "div",
                {
                  className: i(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": o("appBar.locationNavigation"),
                  children: [
                    p ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                      /* @__PURE__ */ e.jsx(
                        N,
                        {
                          className: i(
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
                          "aria-label": o("appBar.backToLibrary"),
                          onClick: p,
                          children: o("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ e.jsx(
                        "span",
                        {
                          className: i(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    l ? /* @__PURE__ */ e.jsx(
                      "input",
                      {
                        className: i(
                          "nomi-appbar__breadcrumb-input",
                          "app-no-drag",
                          "h-full px-2.5 border-none",
                          "bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]",
                          "text-[var(--nomi-ink)] font-inherit text-body-sm",
                          "outline-none min-w-[80px] max-w-[240px]"
                        ),
                        value: d,
                        autoFocus: !0,
                        "aria-label": o("appBar.projectName"),
                        onBlur: j,
                        onChange: (s) => u(s.currentTarget.value),
                        onKeyDown: (s) => {
                          s.key === "Enter" && j(), s.key === "Escape" && m(!1);
                        }
                      }
                    ) : /* @__PURE__ */ e.jsx(
                      N,
                      {
                        className: i(
                          "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--name",
                          "app-no-drag",
                          "inline-flex items-center h-full px-2.5",
                          "border-none bg-transparent font-inherit text-body-sm",
                          "cursor-pointer whitespace-nowrap",
                          "text-[var(--nomi-ink-80)] max-w-[200px] overflow-hidden text-ellipsis",
                          "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                          "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]"
                        ),
                        title: d,
                        onClick: () => m(!0),
                        children: d
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ e.jsx("div", { className: "app-no-drag", children: /* @__PURE__ */ e.jsx(ge, { value: n, onChange: a }) }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: i(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": o("appBar.globalActions"),
            children: [
              /* @__PURE__ */ e.jsx(ke, { className: "size-[30px]" }),
              D ? null : /* @__PURE__ */ e.jsx(ee, {}),
              D ? null : /* @__PURE__ */ e.jsx(e.Fragment, { children: /* @__PURE__ */ e.jsxs(
                N,
                {
                  className: i(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": o("appBar.openBrowser"),
                  title: o("appBar.browser"),
                  onClick: Ve,
                  children: [
                    /* @__PURE__ */ e.jsx(q, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: i("nomi-appbar__action-text", "max-[1400px]:hidden"), children: o("appBar.browser") })
                  ]
                }
              ) }),
              /* @__PURE__ */ e.jsxs(
                N,
                {
                  className: i(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": o("appBar.openModelAccess"),
                  title: o("appBar.modelAccess"),
                  onClick: k,
                  children: [
                    /* @__PURE__ */ e.jsx(ve, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: i("nomi-appbar__action-text", "max-[1400px]:hidden"), children: o("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ e.jsxs(
                N,
                {
                  className: i(
                    "nomi-appbar__primary",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-80)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": o(n === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: o(n === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    n === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : a("preview");
                  },
                  children: [
                    /* @__PURE__ */ e.jsx(Ce, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ e.jsx("span", { className: i("nomi-appbar__action-text", "max-[1400px]:hidden"), children: o("appBar.export") })
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
const Fe = S("i18n:sidebar.categoryPanel", () => import("./CategoryTree-B7Oe_UG-.js")), Ke = S(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-IVx80pkS.js").then((n) => ({
    default: n.PromptLibraryContent
  }))
), Ge = S(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-BC0s8Ijp.js").then((n) => ({
    default: n.SkillLibraryContent
  }))
), $e = S(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-dnQU4UYX.js").then((n) => ({
    default: n.AssetLibraryContent
  }))
), Ye = 60, Xe = 300, qe = 500, Qe = 60, Ze = i(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), V = i(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), J = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", F = i(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function en(n, a) {
  return a(n === "categories" ? "sidebar.groups" : n === "prompt-library" ? "sidebar.promptLibrary" : n === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function nn(n) {
  return n === "prompt-library" || n === "skill-library" || n === "asset-library";
}
function an({ categories: n, projectId: a = null }) {
  const { t: r } = I(), [p, g] = t.useState("asset-library"), [b, o] = t.useState(0), l = L((s) => s.sidebarCollapsed), m = L((s) => s.toggleSidebarCollapsed), d = L((s) => s.setSidebarCollapsed), u = t.useCallback(() => {
    g("categories"), d(!1), o((s) => s + 1);
  }, [d]), v = t.useCallback((s) => {
    if (!l && p === s) {
      d(!0);
      return;
    }
    g(s), d(!1);
  }, [l, d, p]);
  t.useEffect(() => {
    const s = () => {
      g("asset-library"), d(!1);
    };
    return window.addEventListener("nomi-open-files-panel", s), () => window.removeEventListener("nomi-open-files-panel", s);
  }, [d]);
  const w = t.useMemo(
    () => [
      {
        id: "asset-library",
        label: r("sidebar.assetLibrary"),
        icon: Be
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: r("sidebar.groups"),
        railLabel: r("sidebar.groups"),
        icon: De
      }
    ],
    [r]
  ), f = t.useMemo(
    () => [
      {
        id: "prompt-library",
        label: r("sidebar.promptLibrary"),
        railLabel: r("sidebar.prompts"),
        icon: Te
      },
      {
        id: "skill-library",
        label: r("sidebar.skillLibrary"),
        railLabel: r("sidebar.skills"),
        icon: Se
      }
    ],
    [r]
  ), j = en(p, r), k = nn(p) ? qe : Xe;
  return /* @__PURE__ */ e.jsx(
    "aside",
    {
      "data-collapsed": l ? "true" : "false",
      className: i(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: l ? Ye : k },
      "aria-label": r("sidebar.explorer"),
      children: /* @__PURE__ */ e.jsxs(we, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: Qe },
            children: [
              /* @__PURE__ */ e.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": r("sidebar.navigation"), children: [
                w.map((s) => {
                  const y = s.icon, C = p === s.id;
                  return /* @__PURE__ */ e.jsxs(A, { children: [
                    /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
                      "button",
                      {
                        type: "button",
                        className: i(V, C && J),
                        "aria-label": s.label,
                        "aria-pressed": C,
                        onClick: () => v(s.id),
                        children: [
                          /* @__PURE__ */ e.jsx(y, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ e.jsx("span", { className: "text-micro leading-none", children: s.railLabel ?? s.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ e.jsx(z, { side: "right", children: s.label })
                  ] }, s.id);
                }),
                /* @__PURE__ */ e.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                f.map((s) => {
                  const y = s.icon, C = p === s.id;
                  return /* @__PURE__ */ e.jsxs(A, { children: [
                    /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsxs(
                      "button",
                      {
                        type: "button",
                        className: i(V, C && J),
                        "aria-label": s.label,
                        "aria-pressed": C,
                        onClick: () => v(s.id),
                        children: [
                          /* @__PURE__ */ e.jsx(y, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ e.jsx("span", { className: "text-micro leading-none", children: s.railLabel ?? s.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ e.jsx(z, { side: "right", children: s.label })
                  ] }, s.id);
                })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ e.jsxs(A, { children: [
                /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: m,
                    className: Ze,
                    "aria-label": r(l ? "sidebar.expand" : "sidebar.collapse"),
                    children: l ? /* @__PURE__ */ e.jsx(Ae, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ e.jsx(U, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ e.jsx(z, { side: "right", children: r(l ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        l ? null : /* @__PURE__ */ e.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": j, children: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ e.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: j }),
            p === "categories" ? /* @__PURE__ */ e.jsxs(A, { children: [
              /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: u,
                  className: F,
                  "aria-label": r("sidebar.newGroup"),
                  children: /* @__PURE__ */ e.jsx(je, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ e.jsx(z, { side: "bottom", children: r("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ e.jsxs(A, { children: [
              /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: m,
                  className: F,
                  "aria-label": r("sidebar.collapse"),
                  children: /* @__PURE__ */ e.jsx(U, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ e.jsx(z, { side: "bottom", children: r("sidebar.collapse") })
            ] })
          ] }),
          p === "categories" ? /* @__PURE__ */ e.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(Fe, { categories: n, createCategoryNonce: b }) }) : p === "prompt-library" ? /* @__PURE__ */ e.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(Ke, { active: !0, compact: !0, showHeader: !1 }) }) : p === "skill-library" ? /* @__PURE__ */ e.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx(Ge, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ e.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ e.jsx($e, { projectId: a, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const rn = S(
  "创作区",
  () => import("./CreationWorkspace-D1hC6zU6.js")
), tn = S(
  "生成区",
  () => import("./GenerationWorkspace-DR-3G4xn.js")
), sn = S("预览区", () => import("./PreviewWorkspace-tmU9hMKp.js")), on = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, ln = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function cn({ label: n }) {
  const { t: a } = I(), r = a("workspace.loading", { label: n });
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      className: i(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": r,
      children: /* @__PURE__ */ e.jsx($, { size: 28, label: r })
    }
  );
}
function R({
  active: n,
  children: a,
  label: r
}) {
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      className: i(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !n,
      children: /* @__PURE__ */ e.jsx(
        t.Suspense,
        {
          fallback: n ? /* @__PURE__ */ e.jsx(cn, { label: r }) : null,
          children: a
        }
      )
    }
  );
}
function dn() {
  if (typeof window > "u") return "generation";
  try {
    const n = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return ln[n] || "generation";
  } catch {
    return "generation";
  }
}
function K(n) {
  if (typeof window > "u") return;
  const a = new URL(window.location.href), r = on[n];
  a.searchParams.get("step") !== r && (a.searchParams.set("step", r), window.history.replaceState(null, "", a.toString()));
}
function pn() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function Nn({
  generation: n,
  generationAi: a,
  generationAiLayout: r = "sidebar",
  projectId: p,
  projectName: g,
  onBackToLibrary: b,
  onOpenModelCatalog: o,
  onRenameProject: l
}) {
  const { t: m } = I(), d = L((x) => x.workspaceMode), u = L(
    (x) => x.setWorkspaceMode
  ), v = L((x) => x.categories), [w, f] = t.useState(() => [d]), [j, k] = t.useState(!1), s = t.useRef(null), y = window.nomiDesktop?.platform === "win32";
  t.useEffect(() => {
    const x = L.getState().workspaceMode;
    K(x);
    const B = () => {
      u(dn());
    };
    return window.addEventListener("popstate", B), () => window.removeEventListener("popstate", B);
  }, [u]), t.useEffect(() => {
    f(
      (x) => x.includes(d) ? x : [...x, d]
    );
  }, [d]);
  const C = t.useCallback(
    (x) => {
      ye(x) && (u(x), K(x));
    },
    [u]
  );
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: i(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": d,
      children: [
        y ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: i(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": m("appBar.windowTitleBar"),
            onDoubleClick: Y,
            children: [
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  ref: s,
                  type: "button",
                  className: i(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": m("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": j,
                  onClick: () => k((x) => !x),
                  children: /* @__PURE__ */ e.jsx(X, { markSize: 18, wordSize: 14 })
                }
              ),
              j ? /* @__PURE__ */ e.jsx(ne, { anchorEl: s.current, onClose: () => k(!1) }) : null,
              /* @__PURE__ */ e.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ e.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ e.jsx(ee, {}) }),
              /* @__PURE__ */ e.jsx(
                "div",
                {
                  className: i(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": m("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ e.jsxs(
                    "button",
                    {
                      type: "button",
                      className: i(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": m("appBar.openBrowser"),
                      title: m("appBar.browser"),
                      onClick: pn,
                      children: [
                        /* @__PURE__ */ e.jsx(q, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ e.jsx("span", { children: m("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ e.jsx(Ne, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ e.jsx(
          Je,
          {
            workspaceMode: d,
            onWorkspaceModeChange: C,
            projectName: g,
            onBackToLibrary: b,
            onOpenModelCatalog: o,
            onRenameProject: l
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "main",
          {
            className: i(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              d === "generation" ? /* @__PURE__ */ e.jsx(an, { projectId: p ?? null, categories: v }) : null,
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                w.includes("creation") ? /* @__PURE__ */ e.jsx(
                  R,
                  {
                    active: d === "creation",
                    label: m("workspace.creation"),
                    children: /* @__PURE__ */ e.jsx(rn, {})
                  }
                ) : null,
                w.includes("generation") ? /* @__PURE__ */ e.jsx(
                  R,
                  {
                    active: d === "generation",
                    label: m("workspace.generation"),
                    children: /* @__PURE__ */ e.jsx(
                      tn,
                      {
                        canvas: n,
                        aiSidebar: a,
                        aiLayout: r
                      }
                    )
                  }
                ) : null,
                w.includes("preview") ? /* @__PURE__ */ e.jsx(
                  R,
                  {
                    active: d === "preview",
                    label: m("workspace.preview"),
                    children: /* @__PURE__ */ e.jsx(sn, {})
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
export {
  Nn as default
};
