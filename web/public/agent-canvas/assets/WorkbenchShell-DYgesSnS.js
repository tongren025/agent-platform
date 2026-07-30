import { aR as we, dV as B, S as i, dK as G, dL as Oe, cJ as Y, bZ as Ge, cK as Ue, ch as Fe, e1 as Ve, cg as oe, b_ as Ke, c8 as t, aJ as m, l as te, bs as He, dP as Je, b as Xe, K as qe, O as Ye, a0 as Qe, J as ye, a8 as I, I as Ze, bM as je, z as Ne, M as et, L as tt, k as Ce, r as nt, dW as E, a3 as rt, a1 as F, a4 as V, a2 as K, s as ot, c9 as $, u as st, c6 as at, a7 as it } from "./agentStudioMount-DueN8bR4.js";
import { I as lt } from "./IconDownload-DYwSKy1l.js";
import { I as Se, a as ct } from "./IconChevronRight-Bqqx43Qp.js";
import { I as dt } from "./IconListCheck-ZPIjcegB.js";
import { I as _e } from "./IconMap-DKxyJDP0.js";
import { u as mt } from "./journeyTourActivity-D9RXwkYb.js";
import { D as Ee, d as se, r as ae } from "./guidedProductionEvents-B54T7kgP.js";
import { I as ie } from "./IconCircleCheck-BbsNjLCa.js";
import { I as pt } from "./IconBooks-hmwcilDw.js";
import { I as ut } from "./IconBulb-BuSTQ4ls.js";
import { b as ht, I as bt, a as xt } from "./IconFolder-yn2TEQim.js";
import { I as ft } from "./IconLayoutSidebarLeftExpand-CgQE9xC6.js";
import { I as gt } from "./IconArrowRight-BkqBpWQa.js";
import { g as le } from "./generationCanvasTools-DA1D20El.js";
const kt = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M9 4v16", key: "svg-1" }], ["path", { d: "M15 10l-2 2l2 2", key: "svg-2" }]], ce = we("outline", "layout-sidebar-left-collapse", "LayoutSidebarLeftCollapse", kt);
const vt = [["path", { d: "M3 8v4.172a2 2 0 0 0 .586 1.414l5.71 5.71a2.41 2.41 0 0 0 3.408 0l3.592 -3.592a2.41 2.41 0 0 0 0 -3.408l-5.71 -5.71a2 2 0 0 0 -1.414 -.586h-4.172a2 2 0 0 0 -2 2", key: "svg-0" }], ["path", { d: "M18 19l1.592 -1.592a4.82 4.82 0 0 0 0 -6.816l-4.592 -4.592", key: "svg-1" }], ["path", { d: "M7 10h-.01", key: "svg-2" }]], wt = we("outline", "tags", "Tags", vt), z = ["model", "storyboard", "generated", "exported"];
function Ie() {
  const { t: e } = B(), n = i.useMemo(
    () => [
      { key: "model", label: e("onboarding.steps.model.label"), hint: e("onboarding.steps.model.hint") },
      { key: "storyboard", label: e("onboarding.steps.storyboard.label"), hint: e("onboarding.steps.storyboard.hint") },
      { key: "generated", label: e("onboarding.steps.generated.label"), hint: e("onboarding.steps.generated.hint") },
      { key: "exported", label: e("onboarding.steps.exported.label"), hint: e("onboarding.steps.exported.hint") }
    ],
    [e]
  ), o = G((b) => b.nodes), { hasTextModel: s } = Oe(), p = mt(), c = i.useMemo(
    () => ({
      model: s === !0,
      storyboard: o.length > 0,
      generated: o.some((b) => b.status === "success"),
      exported: !1
      // 导出 fire-and-forget 无 live 源，只走 TimelinePreview 持久标记
    }),
    [s, o]
  ), [a, l] = i.useState(() => Y()), [k, f] = i.useState(() => Ge()), [v, y] = i.useState(() => !Ue()), S = i.useRef(null), [N, g] = i.useState(null);
  i.useEffect(() => {
    let b = !1;
    for (const j of z)
      c[j] && !a[j] && (Fe(j), b = !0);
    b && l(Y());
  }, [c, a]), i.useEffect(() => {
    const b = () => l(Y());
    return window.addEventListener("storage", b), window.addEventListener("focus", b), () => {
      window.removeEventListener("storage", b), window.removeEventListener("focus", b);
    };
  }, []);
  const u = i.useMemo(
    () => ({
      model: a.model || c.model,
      storyboard: a.storyboard || c.storyboard,
      generated: a.generated || c.generated,
      exported: a.exported || c.exported
    }),
    [a, c]
  ), r = z.filter((b) => u[b]).length, h = r === z.length, C = n.find((b) => !u[b.key])?.key ?? null, w = i.useCallback(() => {
    const b = S.current;
    if (!b) return;
    const j = b.getBoundingClientRect();
    g({ top: j.bottom + 8, right: Math.max(8, window.innerWidth - j.right) });
  }, []);
  i.useEffect(() => {
    if (v)
      return w(), window.addEventListener("resize", w), () => window.removeEventListener("resize", w);
  }, [v, w]), i.useEffect(() => {
    if (!v) return;
    const b = (j) => {
      const T = j.target;
      T && T.closest("[data-onboarding-checklist-root]") || y(!1);
    };
    return window.addEventListener("pointerdown", b, !0), () => window.removeEventListener("pointerdown", b, !0);
  }, [v]);
  const L = i.useCallback(() => {
    y((b) => {
      const j = !b;
      return Ve(!j), j;
    });
  }, []), d = i.useCallback(() => {
    oe(), f(!0);
  }, []);
  return i.useEffect(() => {
    k || h || Ke(Date.now()) && (oe(), f(!0));
  }, [k, h]), h || p || k ? null : /* @__PURE__ */ t.jsxs("div", { "data-onboarding-checklist-root": "true", className: "contents", children: [
    /* @__PURE__ */ t.jsxs(
      "button",
      {
        type: "button",
        ref: S,
        onClick: L,
        "data-onboarding-checklist-trigger": "true",
        "aria-label": e("onboarding.progressLabel", { done: r, total: z.length }),
        "aria-expanded": v,
        className: m(
          "inline-flex items-center gap-1.5 h-7 px-2.5 cursor-pointer font-inherit",
          "rounded-nomi-sm border border-transparent bg-transparent",
          "text-body-sm text-nomi-ink-80 transition-[background,color] duration-[var(--nomi-transition-fast)]",
          "hover:bg-nomi-ink-05 hover:text-nomi-ink",
          v && "bg-nomi-ink-05 text-nomi-ink"
        ),
        children: [
          /* @__PURE__ */ t.jsx(dt, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
          /* @__PURE__ */ t.jsx("span", { className: "max-[700px]:hidden", children: e("onboarding.trigger") }),
          /* @__PURE__ */ t.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-nomi-accent-soft text-nomi-accent text-micro font-semibold tabular-nums", children: [
            r,
            "/",
            z.length
          ] })
        ]
      }
    ),
    v && N ? /* @__PURE__ */ t.jsxs(
      "section",
      {
        "data-onboarding-checklist": "panel",
        "aria-label": e("onboarding.panelLabel"),
        style: { top: N.top, right: N.right },
        className: m(
          "fixed z-[180] w-64 overflow-hidden",
          "rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg"
        ),
        children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex items-center gap-2 pl-4 pr-2 pt-3 pb-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "text-body font-semibold text-nomi-ink", children: e("onboarding.panelLabel") }),
            /* @__PURE__ */ t.jsxs("span", { className: "text-caption font-medium text-nomi-ink-40 tabular-nums", children: [
              r,
              " / ",
              z.length
            ] }),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: () => L(),
                "aria-label": e("onboarding.collapse"),
                className: m(
                  "ml-auto grid place-items-center size-6 rounded-nomi-sm border-0 bg-transparent cursor-pointer",
                  "text-nomi-ink-40 transition-colors hover:bg-nomi-ink-10 hover:text-nomi-ink"
                ),
                children: /* @__PURE__ */ t.jsx(Se, { size: 16, stroke: 1.8, "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ t.jsx(Ee, { value: r / z.length * 100, size: "xs", className: "mx-4 mb-2" }),
          /* @__PURE__ */ t.jsx("ul", { className: "flex flex-col px-1.5 pb-2 m-0 list-none", children: n.map((b) => {
            const j = u[b.key], T = !j && b.key === C;
            return /* @__PURE__ */ t.jsx(
              "li",
              {
                "data-step": b.key,
                "data-done": j ? "true" : "false",
                className: m("flex flex-col gap-1.5 p-2 rounded-nomi-sm", T && "bg-nomi-accent-soft"),
                children: /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-2.5", children: [
                  /* @__PURE__ */ t.jsx(
                    "span",
                    {
                      className: m(
                        "shrink-0 grid place-items-center size-5 rounded-full mt-px",
                        j ? "bg-nomi-accent text-nomi-paper" : T ? "border-2 border-nomi-accent" : "border-2 border-nomi-ink-20"
                      ),
                      children: j ? /* @__PURE__ */ t.jsx(te, { size: 12, stroke: 1.8, "aria-hidden": "true" }) : null
                    }
                  ),
                  /* @__PURE__ */ t.jsxs("span", { className: "min-w-0", children: [
                    /* @__PURE__ */ t.jsx(
                      "span",
                      {
                        className: m(
                          "block text-body-sm font-medium leading-snug",
                          j ? "text-nomi-ink-40" : T ? "text-nomi-accent" : "text-nomi-ink"
                        ),
                        children: b.label
                      }
                    ),
                    j ? null : /* @__PURE__ */ t.jsx("span", { className: "block text-caption text-nomi-ink-40 leading-snug mt-px", children: b.hint })
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
                  window.dispatchEvent(new CustomEvent("nomi-open-handbook")), y(!1);
                },
                className: m(
                  "inline-flex items-center gap-1 rounded-nomi-sm border-0 bg-transparent px-1.5 py-0.5 cursor-pointer",
                  "text-caption text-nomi-accent transition-colors hover:text-nomi-ink"
                ),
                children: [
                  /* @__PURE__ */ t.jsx(_e, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
                  e("onboarding.fullHandbook")
                ]
              }
            ),
            /* @__PURE__ */ t.jsx(
              "button",
              {
                type: "button",
                onClick: d,
                className: m(
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
const yt = { phase: "idle", latestVersion: null, notes: "", percent: 0, errorMessage: "" }, W = yt;
function jt(e, n) {
  switch (n.type) {
    case "checking":
      return { ...W, phase: "checking" };
    case "up-to-date":
      return { ...W, phase: "up-to-date" };
    case "available":
      return { ...W, phase: "available", latestVersion: n.version, notes: n.notes };
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
function Nt() {
  const n = He()?.update, o = !!n, [s, p] = i.useState(null), [c, a] = i.useState(W);
  i.useEffect(() => {
    let N = !0;
    n?.appInfo().then((u) => {
      N && p(u);
    }).catch(() => {
    });
    const g = n?.onEvent((u) => a((r) => jt(r, u)));
    return () => {
      N = !1, g?.();
    };
  }, [n]), i.useEffect(() => {
    if (c.phase !== "up-to-date") return;
    const N = window.setTimeout(() => a(W), 2500);
    return () => window.clearTimeout(N);
  }, [c.phase]);
  const l = i.useCallback(() => {
    a({ ...W, phase: "checking" }), n?.check().catch(() => {
    });
  }, [n]), k = i.useCallback(() => {
    a((N) => ({ ...N, phase: "downloading", percent: 0 })), n?.download().catch(() => {
    });
  }, [n]), f = i.useCallback(() => {
    n?.install().catch(() => {
    });
  }, [n]), v = i.useCallback(() => {
    n?.openRelease().catch(() => {
    });
  }, [n]), y = i.useCallback(() => a(W), []), S = s?.canAutoInstall ?? !0;
  return {
    phase: c.phase,
    appInfo: s,
    latestVersion: c.latestVersion,
    notes: c.notes,
    percent: c.percent,
    errorMessage: c.errorMessage,
    supported: o,
    canAutoInstall: S,
    check: l,
    download: k,
    install: f,
    openRelease: v,
    reset: y
  };
}
const Ct = 360, de = 12;
function St(e) {
  return e ? `${e.platform === "win32" ? "Windows" : e.platform === "darwin" ? "macOS" : e.platform} · ${e.arch}` : "";
}
function Le({ anchorEl: e, onClose: n }) {
  const { t: o } = B(), s = Nt(), { isDark: p } = Je(), [c, a] = i.useState(null);
  return i.useLayoutEffect(() => {
    if (!e) return;
    const l = () => {
      const k = e.getBoundingClientRect(), f = Math.min(k.left, window.innerWidth - Ct - de), v = k.bottom + 8;
      a({ top: v, left: Math.max(de, f) });
    };
    return l(), window.addEventListener("resize", l), window.addEventListener("scroll", l, !0), () => {
      window.removeEventListener("resize", l), window.removeEventListener("scroll", l, !0);
    };
  }, [e]), i.useEffect(() => {
    const l = (k) => {
      k.key === "Escape" && n();
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [n]), /* @__PURE__ */ t.jsxs(Xe, { children: [
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
        className: m(
          "about-nomi-popover",
          "fixed z-[601] w-[360px] p-4",
          "bg-[var(--nomi-paper)] border border-[var(--nomi-line)] rounded-nomi shadow-nomi-lg"
        ),
        style: { top: c?.top ?? -9999, left: c?.left ?? -9999 },
        role: "dialog",
        "aria-label": o("about.dialogLabel"),
        onMouseDown: (l) => l.stopPropagation(),
        children: [
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 mb-3.5", children: [
            /* @__PURE__ */ t.jsx(qe, { size: 40 }),
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx(Ye, { fontSize: 17, className: "text-nomi-ink" }),
              /* @__PURE__ */ t.jsxs("p", { className: "mt-0.5 text-micro text-[var(--nomi-ink-60)]", children: [
                o("about.currentVersion", { version: s.appInfo?.version ?? "…" }),
                s.appInfo ? ` · ${St(s.appInfo)}` : ""
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
                /* @__PURE__ */ t.jsx(_e, { size: 18, stroke: 1.6, className: "shrink-0 text-[var(--nomi-accent)]" }),
                /* @__PURE__ */ t.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "block text-body-sm text-[var(--nomi-ink)]", children: o("about.handbook") }),
                  /* @__PURE__ */ t.jsx("span", { className: "block text-micro text-[var(--nomi-ink-40)]", children: o("about.handbookDescription") })
                ] }),
                /* @__PURE__ */ t.jsx(ct, { size: 16, stroke: 1.8, className: "shrink-0 text-[var(--nomi-ink-40)]" })
              ]
            }
          ),
          /* @__PURE__ */ t.jsxs("div", { className: "mb-3.5 flex min-h-9 items-center justify-between gap-3 rounded-nomi-sm bg-[var(--nomi-ink-05)] px-3 py-2", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsx("div", { className: "text-body-sm text-[var(--nomi-ink)]", children: o("theme.appearance") }),
              /* @__PURE__ */ t.jsx("div", { className: "mt-0.5 text-micro text-[var(--nomi-ink-40)]", children: o(p ? "theme.dark" : "theme.light") })
            ] }),
            /* @__PURE__ */ t.jsx(Qe, { className: "shrink-0 border-[var(--nomi-line-soft)] bg-[var(--nomi-paper)]" })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "pt-3.5 border-t border-[var(--nomi-line-soft)]", children: s.supported ? /* @__PURE__ */ t.jsx(_t, { updater: s }) : /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: o("about.desktopUpdateUnsupported") }) })
        ]
      }
    )
  ] });
}
function _t({ updater: e }) {
  const { t: n } = B(), { phase: o } = e;
  return o === "checking" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 min-h-8 text-body-sm text-[var(--nomi-ink-80)]", children: [
    /* @__PURE__ */ t.jsx(ye, { size: 16, label: n("about.checking") }),
    n("about.checkingEllipsis")
  ] }) : o === "up-to-date" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-1.5 min-h-8 text-body-sm text-[var(--nomi-ink)]", children: [
    /* @__PURE__ */ t.jsx(ie, { size: 16, className: "text-[var(--workbench-success)]" }),
    n("about.upToDate")
  ] }) : o === "available" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
      /* @__PURE__ */ t.jsxs("span", { className: "text-body-sm text-[var(--nomi-ink)]", children: [
        n("about.available"),
        " ",
        /* @__PURE__ */ t.jsx("b", { className: "font-medium", children: e.latestVersion })
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ t.jsx(I, { variant: "default", onClick: e.reset, children: n("common.later") }),
        e.canAutoInstall ? /* @__PURE__ */ t.jsx(I, { variant: "primary", onClick: e.download, children: n("about.downloadUpdate") }) : /* @__PURE__ */ t.jsx(I, { variant: "primary", onClick: e.openRelease, children: n("about.openDownload") })
      ] })
    ] }),
    e.canAutoInstall ? null : /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-micro text-[var(--nomi-ink-40)]", children: n("about.macManualUpdate") }),
    e.notes ? /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 p-3 rounded-[var(--nomi-radius-sm)] bg-[var(--nomi-ink-05)] text-micro text-[var(--nomi-ink-60)] leading-relaxed whitespace-pre-line max-h-[120px] overflow-auto", children: e.notes }) : null
  ] }) : o === "downloading" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsx("p", { className: "text-body-sm text-[var(--nomi-ink)] mb-2", children: n("about.downloading") }),
    /* @__PURE__ */ t.jsx(Ee, { value: e.percent, size: "sm" }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-1.5 text-micro text-[var(--nomi-ink-40)]", children: n("about.downloadingHint", { percent: e.percent }) })
  ] }) : o === "downloaded" ? /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsxs("span", { className: "flex items-center gap-1.5 text-body-sm text-[var(--nomi-ink)]", children: [
      /* @__PURE__ */ t.jsx(ie, { size: 16, className: "text-[var(--workbench-success)]" }),
      n("about.downloaded")
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
      /* @__PURE__ */ t.jsx(I, { variant: "default", onClick: e.reset, children: n("common.later") }),
      /* @__PURE__ */ t.jsx(I, { variant: "primary", onClick: e.install, children: n("about.restartInstall") })
    ] })
  ] }) : o === "error" ? /* @__PURE__ */ t.jsxs("div", { children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-1.5 text-body-sm text-[var(--workbench-danger)]", children: [
      /* @__PURE__ */ t.jsx(Ze, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ t.jsx("span", { className: "min-w-0 break-words", children: e.errorMessage || n("about.updateError") })
    ] }),
    /* @__PURE__ */ t.jsx("div", { className: "mt-2.5 flex justify-end", children: /* @__PURE__ */ t.jsx(I, { variant: "default", onClick: e.check, children: n("common.retry") }) })
  ] }) : /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 min-h-8", children: [
    /* @__PURE__ */ t.jsx("span", { className: "text-body-sm text-[var(--nomi-ink-60)]", children: n("about.checkAvailable") }),
    /* @__PURE__ */ t.jsx(I, { variant: "primary", onClick: e.check, children: n("about.checkUpdate") })
  ] });
}
const J = window.nomiDesktop?.platform === "win32";
function Et() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function It({
  workspaceMode: e,
  onWorkspaceModeChange: n,
  projectName: o,
  onBackToLibrary: s,
  onOpenModelCatalog: p,
  onRenameProject: c
}) {
  const { t: a } = B(), [l, k] = i.useState(!1), [f, v] = i.useState(o || a("appBar.untitledProject")), [y, S] = i.useState(!1), N = i.useRef(null);
  i.useEffect(() => {
    !l && o && v(o);
  }, [o, l]);
  const g = i.useCallback(() => {
    v((r) => {
      const h = r.trim() || a("appBar.untitledProject");
      return c?.(h), h;
    }), k(!1);
  }, [c, a]), u = i.useCallback(() => {
    p?.();
  }, [p]);
  return /* @__PURE__ */ t.jsxs(
    "header",
    {
      className: m(
        "nomi-appbar",
        J && "app-drag",
        "relative z-[120] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
        "h-[var(--workbench-topbar-height)] px-[18px]",
        "border-b border-workbench-border bg-workbench-surface",
        "max-[700px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:gap-x-1.5 max-[700px]:px-2"
      ),
      "aria-label": a("appBar.workspace"),
      onDoubleClick: je,
      children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: m(
              "nomi-appbar__left",
              "app-no-drag",
              "inline-flex items-center justify-self-start gap-3 min-w-0",
              "max-[700px]:gap-0"
            ),
            children: [
              J ? null : /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    ref: N,
                    type: "button",
                    className: m(
                      "nomi-appbar__brand-btn",
                      "app-no-drag",
                      "inline-flex items-center border-0 bg-transparent p-0 cursor-pointer rounded-[var(--nomi-radius-sm)]",
                      "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                    ),
                    "aria-label": a("appBar.aboutAndUpdate"),
                    "aria-haspopup": "dialog",
                    "aria-expanded": y,
                    onClick: () => S((r) => !r),
                    children: /* @__PURE__ */ t.jsx(Ne, {})
                  }
                ),
                y ? /* @__PURE__ */ t.jsx(Le, { anchorEl: N.current, onClose: () => S(!1) }) : null,
                /* @__PURE__ */ t.jsx(
                  "span",
                  {
                    className: m("nomi-appbar__divider", "w-px h-[18px] bg-workbench-border", "max-[700px]:hidden"),
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ t.jsxs(
                "div",
                {
                  className: m(
                    "nomi-appbar__breadcrumb",
                    "inline-flex items-center h-[30px]",
                    "border border-workbench-border rounded-[var(--nomi-radius-sm)]",
                    "bg-workbench-bg overflow-hidden min-w-0 shrink"
                  ),
                  role: "navigation",
                  "aria-label": a("appBar.locationNavigation"),
                  children: [
                    s ? /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
                      /* @__PURE__ */ t.jsx(
                        I,
                        {
                          className: m(
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
                          "aria-label": a("appBar.backToLibrary"),
                          onClick: s,
                          children: a("appBar.projectLibrary")
                        }
                      ),
                      /* @__PURE__ */ t.jsx(
                        "span",
                        {
                          className: m(
                            "nomi-appbar__breadcrumb-arrow",
                            "text-[var(--nomi-ink-30)] text-sm leading-none select-none shrink-0",
                            "max-[700px]:hidden"
                          ),
                          "aria-hidden": "true",
                          children: "›"
                        }
                      )
                    ] }) : null,
                    l ? /* @__PURE__ */ t.jsx(
                      "input",
                      {
                        className: m(
                          "nomi-appbar__breadcrumb-input",
                          "app-no-drag",
                          "h-full px-2.5 border-none",
                          "bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]",
                          "text-[var(--nomi-ink)] font-inherit text-body-sm",
                          "outline-none min-w-[80px] max-w-[240px]"
                        ),
                        value: f,
                        autoFocus: !0,
                        "aria-label": a("appBar.projectName"),
                        onBlur: g,
                        onChange: (r) => v(r.currentTarget.value),
                        onKeyDown: (r) => {
                          r.key === "Enter" && g(), r.key === "Escape" && k(!1);
                        }
                      }
                    ) : /* @__PURE__ */ t.jsx(
                      I,
                      {
                        className: m(
                          "nomi-appbar__breadcrumb-seg nomi-appbar__breadcrumb-seg--name",
                          "app-no-drag",
                          "inline-flex items-center h-full px-2.5",
                          "border-none bg-transparent font-inherit text-body-sm",
                          "cursor-pointer whitespace-nowrap",
                          "text-[var(--nomi-ink-80)] max-w-[200px] overflow-hidden text-ellipsis",
                          "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                          "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]"
                        ),
                        title: f,
                        onClick: () => k(!0),
                        children: f
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ t.jsx("div", { className: "app-no-drag", children: /* @__PURE__ */ t.jsx(et, { value: e, onChange: n }) }),
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: m(
              "nomi-appbar__right",
              "app-no-drag",
              "inline-flex items-center justify-self-end gap-2 min-w-0",
              "max-[700px]:gap-1"
            ),
            role: "toolbar",
            "aria-label": a("appBar.globalActions"),
            children: [
              /* @__PURE__ */ t.jsx(tt, { className: "size-[30px]" }),
              J ? null : /* @__PURE__ */ t.jsx(Ie, {}),
              J ? null : /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs(
                I,
                {
                  className: m(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": a("appBar.openBrowser"),
                  title: a("appBar.browser"),
                  onClick: Et,
                  children: [
                    /* @__PURE__ */ t.jsx(Ce, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: m("nomi-appbar__action-text", "max-[1400px]:hidden"), children: a("appBar.browser") })
                  ]
                }
              ) }),
              /* @__PURE__ */ t.jsxs(
                I,
                {
                  className: m(
                    "nomi-appbar__ghost",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-transparent text-[var(--nomi-ink-80)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-05)] hover:text-[var(--nomi-ink)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": a("appBar.openModelAccess"),
                  title: a("appBar.modelAccess"),
                  onClick: u,
                  children: [
                    /* @__PURE__ */ t.jsx(nt, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: m("nomi-appbar__action-text", "max-[1400px]:hidden"), children: a("appBar.modelAccess") })
                  ]
                }
              ),
              /* @__PURE__ */ t.jsxs(
                I,
                {
                  className: m(
                    "nomi-appbar__primary",
                    "app-no-drag",
                    "inline-flex items-center gap-1.5 h-[30px] px-2.5",
                    "border border-transparent rounded-[var(--nomi-radius-sm)]",
                    "bg-[var(--nomi-ink)] text-[var(--nomi-paper)] font-inherit text-body-sm",
                    "transition-[background,color] duration-[var(--nomi-transition-fast)]",
                    "hover:bg-[var(--nomi-ink-80)]",
                    "max-[1400px]:w-[30px] max-[1400px]:h-[30px] max-[1400px]:justify-center max-[1400px]:p-0"
                  ),
                  "aria-label": a(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  title: a(e === "preview" ? "appBar.exportMp4" : "appBar.goToPreviewExport"),
                  onClick: () => {
                    e === "preview" ? window.dispatchEvent(new CustomEvent("nomi-request-export")) : n("preview");
                  },
                  children: [
                    /* @__PURE__ */ t.jsx(lt, { size: 15, stroke: 1.8 }),
                    /* @__PURE__ */ t.jsx("span", { className: m("nomi-appbar__action-text", "max-[1400px]:hidden"), children: a("appBar.export") })
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
const Lt = $("i18n:sidebar.categoryPanel", () => import("./CategoryTree-BAUhSUlw.js")), At = $(
  "i18n:sidebar.promptLibrary",
  () => import("./PromptLibraryPanel-BOFo0sMl.js").then((e) => ({
    default: e.PromptLibraryContent
  }))
), Tt = $(
  "i18n:sidebar.skillLibrary",
  () => import("./SkillLibraryPanel-DzN-YaQ9.js").then((e) => ({
    default: e.SkillLibraryContent
  }))
), Mt = $(
  "i18n:sidebar.assetLibrary",
  () => import("./AssetLibraryPanel-CS_otuJT.js").then((e) => ({
    default: e.AssetLibraryContent
  }))
), Pt = 60, Bt = 300, zt = 500, Dt = 60, Rt = m(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), me = m(
  "flex w-11 flex-col items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent py-1.5",
  "cursor-pointer text-nomi-ink-40 transition-[background,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink",
  "disabled:cursor-not-allowed disabled:opacity-50"
), pe = "bg-nomi-ink text-nomi-paper shadow-nomi-sm", ue = m(
  "grid size-8 place-items-center rounded-nomi-sm border-0 bg-transparent",
  "cursor-pointer text-nomi-ink-40 transition-[background,border-color,color] duration-[var(--nomi-transition-fast)]",
  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
);
function Wt(e, n) {
  return n(e === "categories" ? "sidebar.groups" : e === "prompt-library" ? "sidebar.promptLibrary" : e === "skill-library" ? "sidebar.skillLibrary" : "sidebar.assetLibrary");
}
function $t(e) {
  return e === "prompt-library" || e === "skill-library" || e === "asset-library";
}
function Ot({ categories: e, projectId: n = null }) {
  const { t: o } = B(), [s, p] = i.useState("asset-library"), [c, a] = i.useState(0), l = E((r) => r.sidebarCollapsed), k = E((r) => r.toggleSidebarCollapsed), f = E((r) => r.setSidebarCollapsed), v = i.useCallback(() => {
    p("categories"), f(!1), a((r) => r + 1);
  }, [f]), y = i.useCallback((r) => {
    if (!l && s === r) {
      f(!0);
      return;
    }
    p(r), f(!1);
  }, [l, f, s]);
  i.useEffect(() => {
    const r = () => {
      p("asset-library"), f(!1);
    };
    return window.addEventListener("nomi-open-files-panel", r), () => window.removeEventListener("nomi-open-files-panel", r);
  }, [f]);
  const S = i.useMemo(
    () => [
      {
        id: "asset-library",
        label: o("sidebar.assetLibrary"),
        icon: ht
      },
      {
        // ④ 2026-07-13：原名「分类」名实不符——它管的是画布画面的分组（搬家归下一轮设计）。
        id: "categories",
        label: o("sidebar.groups"),
        railLabel: o("sidebar.groups"),
        icon: wt
      }
    ],
    [o]
  ), N = i.useMemo(
    () => [
      {
        id: "prompt-library",
        label: o("sidebar.promptLibrary"),
        railLabel: o("sidebar.prompts"),
        icon: ut
      },
      {
        id: "skill-library",
        label: o("sidebar.skillLibrary"),
        railLabel: o("sidebar.skills"),
        icon: pt
      }
    ],
    [o]
  ), g = Wt(s, o), u = $t(s) ? zt : Bt;
  return /* @__PURE__ */ t.jsx(
    "aside",
    {
      "data-collapsed": l ? "true" : "false",
      className: m(
        "flex h-full min-h-0 shrink-0 overflow-hidden border-r border-nomi-line bg-nomi-paper text-nomi-ink",
        "transition-[width] duration-150 ease-out"
      ),
      style: { width: l ? Pt : u },
      "aria-label": o("sidebar.explorer"),
      children: /* @__PURE__ */ t.jsxs(rt, { delayDuration: 180, skipDelayDuration: 80, children: [
        /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: "flex shrink-0 flex-col items-center border-r border-nomi-line-soft bg-nomi-paper px-2 py-3",
            style: { width: Dt },
            children: [
              /* @__PURE__ */ t.jsxs("nav", { className: "flex flex-1 flex-col items-center gap-2.5 pt-1", "aria-label": o("sidebar.navigation"), children: [
                S.map((r) => {
                  const h = r.icon, C = s === r.id;
                  return /* @__PURE__ */ t.jsxs(F, { children: [
                    /* @__PURE__ */ t.jsx(V, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: m(me, C && pe),
                        "aria-label": r.label,
                        "aria-pressed": C,
                        onClick: () => y(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(h, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(K, { side: "right", children: r.label })
                  ] }, r.id);
                }),
                /* @__PURE__ */ t.jsx("div", { className: "my-1 h-px w-6 shrink-0 bg-nomi-line-soft", "aria-hidden": "true" }),
                N.map((r) => {
                  const h = r.icon, C = s === r.id;
                  return /* @__PURE__ */ t.jsxs(F, { children: [
                    /* @__PURE__ */ t.jsx(V, { asChild: !0, children: /* @__PURE__ */ t.jsxs(
                      "button",
                      {
                        type: "button",
                        className: m(me, C && pe),
                        "aria-label": r.label,
                        "aria-pressed": C,
                        onClick: () => y(r.id),
                        children: [
                          /* @__PURE__ */ t.jsx(h, { size: 18, stroke: 1.8, "aria-hidden": "true" }),
                          /* @__PURE__ */ t.jsx("span", { className: "text-micro leading-none", children: r.railLabel ?? r.label })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ t.jsx(K, { side: "right", children: r.label })
                  ] }, r.id);
                })
              ] }),
              /* @__PURE__ */ t.jsx("div", { className: "flex flex-col items-center gap-2 pb-1", children: /* @__PURE__ */ t.jsxs(F, { children: [
                /* @__PURE__ */ t.jsx(V, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: k,
                    className: Rt,
                    "aria-label": o(l ? "sidebar.expand" : "sidebar.collapse"),
                    children: l ? /* @__PURE__ */ t.jsx(ft, { size: 18, stroke: 1.8, "aria-hidden": "true" }) : /* @__PURE__ */ t.jsx(ce, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                  }
                ) }),
                /* @__PURE__ */ t.jsx(K, { side: "right", children: o(l ? "sidebar.expand" : "sidebar.collapse") })
              ] }) })
            ]
          }
        ),
        l ? null : /* @__PURE__ */ t.jsx("section", { className: "relative flex min-w-0 flex-1 flex-col bg-nomi-paper", "aria-label": g, children: /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsxs("header", { className: "flex h-12 shrink-0 items-center border-b border-nomi-line-soft px-3", children: [
            /* @__PURE__ */ t.jsx("h2", { className: "m-0 min-w-0 flex-1 truncate text-body-sm font-bold leading-none text-nomi-ink", children: g }),
            s === "categories" ? /* @__PURE__ */ t.jsxs(F, { children: [
              /* @__PURE__ */ t.jsx(V, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: v,
                  className: ue,
                  "aria-label": o("sidebar.newGroup"),
                  children: /* @__PURE__ */ t.jsx(ot, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(K, { side: "bottom", children: o("sidebar.newGroup") })
            ] }) : null,
            /* @__PURE__ */ t.jsxs(F, { children: [
              /* @__PURE__ */ t.jsx(V, { asChild: !0, children: /* @__PURE__ */ t.jsx(
                "button",
                {
                  type: "button",
                  onClick: k,
                  className: ue,
                  "aria-label": o("sidebar.collapse"),
                  children: /* @__PURE__ */ t.jsx(ce, { size: 18, stroke: 1.8, "aria-hidden": "true" })
                }
              ) }),
              /* @__PURE__ */ t.jsx(K, { side: "bottom", children: o("sidebar.collapse") })
            ] })
          ] }),
          s === "categories" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Lt, { categories: e, createCategoryNonce: c }) }) : s === "prompt-library" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(At, { active: !0, compact: !0, showHeader: !1 }) }) : s === "skill-library" ? /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Tt, { active: !0, compact: !0, showHeader: !1 }) }) : /* @__PURE__ */ t.jsx(i.Suspense, { fallback: null, children: /* @__PURE__ */ t.jsx(Mt, { projectId: n, compact: !0, showHeader: !1 }) })
        ] }) })
      ] })
    }
  );
}
const he = [
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
function In(e) {
  return he.find((n) => n.id === e) || he[0];
}
function Ln(e) {
  return !e.chatOnly;
}
function Gt(e) {
  return Ae(e?.contentJson).trim();
}
function Ae(e) {
  if (!e || typeof e != "object") return "";
  const n = e, o = typeof n.text == "string" ? n.text : "", s = Array.isArray(n.content) ? n.content.map(Ae).filter(Boolean).join(`
`) : "";
  return [o, s].filter(Boolean).join(o && s ? `
` : "");
}
function An(e) {
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
const Ut = [
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
function Te(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function R(e, n) {
  return n.test(Te(e));
}
function Ft(e) {
  return e.meta?.referenceSheet === !0;
}
function Vt(e) {
  return Ft(e) ? !1 : e.kind === "shot" ? !0 : e.kind !== "image" || e.meta?.storyboardKeyframe === !0 || e.meta?.workflowStage === "keyframe" || R(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) ? !1 : typeof e.shotIndex == "number" || R(e, /镜头|分镜|shot/);
}
function O(e, n) {
  return e.result?.type === n || e.history?.some((o) => o.type === n) === !0;
}
function be(e, n) {
  const o = Te(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return o?.[1] ? `shot-${Number(o[1])}` : typeof e.shotIndex == "number" ? `shot-${e.shotIndex}` : `position-${n + 1}`;
}
function Q(e, n, o = () => !0) {
  const s = new Set(
    n.filter(o).map((p, c) => be(p, c))
  );
  return new Set(
    e.map((p, c) => be(p, c)).filter((p) => s.has(p))
  ).size;
}
function Kt(e) {
  const n = e.documentText.trim(), o = n.length >= 4, s = /(^|\n)\s*#{0,3}\s*(剧本|分场剧本|逐镜剧本)(?:\s|$)/m.test(n) || /(^|\n)\s*(△|场景\s*\d+|第\s*\d+\s*场|INT\.|EXT\.)/im.test(n) || n.length >= 420, p = e.nodes.filter(
    (x) => R(x, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/) || x.meta?.workflowStage === "style"
  ), c = e.nodes.filter(
    (x) => x.kind === "character" || R(x, /人物三视图|角色三视图|表情服装|character\s*(sheet|turnaround)/) || x.meta?.workflowStage === "character"
  ), a = e.nodes.filter(
    (x) => x.kind === "scene" || R(x, /场景设定|场景母版|场景道具|scene\s*(sheet|bible)/) || x.meta?.workflowStage === "scene"
  ), l = e.nodes.filter(Vt), k = e.nodes.filter(
    (x) => R(x, /镜头动态设计|运镜设计|镜头运动|运动轨迹|动作轨迹|camera\s*(move|path)|motion\s*design/) || x.meta?.cameraMoveAutoCapture !== void 0 || x.meta?.cameraMovePromptApplied !== void 0 || x.meta?.workflowStage === "motion"
  ), f = e.nodes.filter(
    (x) => x.kind === "keyframe" || x.meta?.storyboardKeyframe === !0 || R(x, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/) || x.meta?.workflowStage === "keyframe"
  ), v = e.nodes.filter((x) => x.kind === "video"), y = l.length, S = p.filter((x) => O(x, "image")).length, N = c.filter((x) => O(x, "image")).length, g = a.filter((x) => O(x, "image")).length, u = l.filter((x) => O(x, "image")).length, r = Q(
    l,
    f,
    (x) => O(x, "image")
  ), h = Q(
    l,
    v,
    (x) => O(x, "video")
  ), C = Q(l, k), w = p.length > 0 && S > 0, L = c.length > 0 && N === c.length, d = a.length > 0 && g === a.length, b = y > 0 && u === y, j = y > 0 && C === y, T = y > 0 && r === y, H = v.length > 0, _ = y > 0 && h === y, M = y > 0 && _ && e.timelineClipCount >= y, Re = {
    style: p.length > 0,
    character: c.length > 0,
    scene: a.length > 0,
    storyboard: l.length > 0,
    keyframe: f.length > 0,
    video: v.length > 0
  }, We = {
    style: S,
    character: N,
    scene: g,
    storyboard: u,
    keyframe: r,
    video: h
  }, $e = {
    idea: o,
    script: s,
    style: w,
    character: L,
    scene: d,
    storyboard: b,
    motion: j,
    keyframe: T,
    video: _,
    review: M
  }, U = Ut.map((x) => ({
    ...x,
    complete: $e[x.id]
  })), ne = U.findIndex((x) => !x.complete), re = ne >= 0 ? ne : U.length - 1;
  return {
    stages: U,
    current: U[re],
    currentIndex: re,
    completedCount: U.filter((x) => x.complete).length,
    hasVideoNodes: H,
    hasGeneratedVideo: _,
    shotCount: y,
    plannedByStage: Re,
    generatedCountByStage: We
  };
}
function Ht(e) {
  return String(e.title || "").toLocaleLowerCase();
}
function Me(e) {
  return `${e.title || ""}
${e.prompt || ""}`.toLocaleLowerCase();
}
function A(e, n) {
  return n.test(Ht(e));
}
function P(e) {
  return String(e.meta?.workflowStage || "").toLocaleLowerCase();
}
function Pe(e) {
  return P(e) === "story" || A(e, /故事设定|故事背景|世界观|story\s*(world|setting)/);
}
function Be(e) {
  return P(e) === "script" || A(e, /剧本|分场|script|screenplay/);
}
function Jt(e) {
  return P(e) === "style" || A(e, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/);
}
function Xt(e) {
  return e.kind === "character" || P(e) === "character" || A(e, /人物三视图|角色三视图|character\s*(sheet|turnaround)/);
}
function qt(e) {
  return e.kind === "scene" || P(e) === "scene" || A(e, /场景设定|场景母版|scene\s*(sheet|bible)/);
}
function ze(e) {
  return e.kind === "keyframe" || P(e) === "keyframe" || e.meta?.storyboardKeyframe === !0 || A(e, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/);
}
function De(e) {
  return e.kind === "video" && (P(e) === "video" || A(e, /镜头|shot|视频/));
}
function Yt(e) {
  return P(e) === "motion" || A(e, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/);
}
function Qt(e) {
  return e.meta?.referenceSheet === !0 || ze(e) || De(e) ? !1 : e.kind === "shot" || e.kind === "image" && (P(e) === "storyboard" || typeof e.shotIndex == "number" || A(e, /镜头|分镜|shot/));
}
function q(e) {
  const n = Me(e).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i);
  return n?.[1] ? Number(n[1]) : typeof e.shotIndex == "number" ? e.shotIndex : null;
}
function X(e) {
  return [...e].sort((n, o) => {
    const s = q(n) ?? Number.MAX_SAFE_INTEGER, p = q(o) ?? Number.MAX_SAFE_INTEGER;
    return s !== p ? s - p : n.position.y !== o.position.y ? n.position.y - o.position.y : n.position.x - o.position.x;
  });
}
function Z(e, n, o) {
  const s = q(n);
  if (s !== null) {
    const p = e.filter((c) => q(c) === s);
    if (p.length) return p;
  }
  return e[o] ? [e[o]] : [];
}
function xe(e, n) {
  if (e.length <= 1) return e;
  const o = Me(n), s = e.filter((p) => p.title.split(/[｜|·：:\s]/).map((a) => a.trim()).filter((a) => a.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(a)).some((a) => o.includes(a.toLocaleLowerCase())));
  return s.length ? s : e;
}
function fe(e, n, o) {
  const s = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), p = o ? `(?=\\n\\s*#{1,3}\\s*${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$))` : "(?=\\n\\s*#{1,3}\\s|$)";
  return e.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${s}\\s*\\n([\\s\\S]*?)${p}`, "i"))?.[1]?.trim() || "";
}
function Zt(e, n) {
  const o = [];
  if (!n.some(Pe)) {
    const s = fe(e, "故事设定", "剧本");
    s && o.push({
      kind: "text",
      title: "故事设定｜项目背景",
      prompt: s,
      position: { x: 40, y: 40 },
      meta: { workflowStage: "story" }
    });
  }
  if (!n.some(Be)) {
    const s = fe(e, "剧本");
    s && o.push({
      kind: "text",
      title: "剧本｜制作稿",
      prompt: s,
      position: { x: 420, y: 40 },
      meta: { workflowStage: "script" }
    });
  }
  return o;
}
function en(e, n) {
  const o = e.filter(Pe), s = e.filter(Be), p = e.filter(Jt), c = p.filter((r) => r.kind !== "text"), a = e.filter(Xt), l = e.filter(qt), k = X(e.filter(Qt)), f = X(e.filter(Yt)), v = X(e.filter(ze)), y = X(e.filter(De)), S = [], N = new Set(n.map((r) => `${r.source}:${r.target}:${r.mode || "reference"}`)), g = (r, h, C = "reference") => {
    if (!r || !h || r.id === h.id) return;
    const w = `${r.id}:${h.id}:${C}`;
    N.has(w) || (N.add(w), S.push({ source: r.id, target: h.id, mode: C }));
  };
  o.forEach((r) => s.forEach((h) => g(r, h))), s.forEach((r) => {
    a.forEach((h) => g(r, h)), l.forEach((h) => g(r, h)), k.forEach((h) => g(r, h));
  }), p.filter((r) => r.kind === "text").forEach((r) => {
    c.forEach((h) => g(r, h));
  });
  const u = c[0];
  return u && (a.forEach((r) => g(u, r, "style_ref")), l.forEach((r) => g(u, r, "style_ref")), v.forEach((r) => g(u, r, "style_ref"))), v.forEach((r, h) => {
    xe(a, r).forEach((C) => g(C, r, "character_ref")), xe(l, r).forEach((C) => g(C, r, "composition_ref")), Z(k, r, h).forEach((C) => g(C, r, "composition_ref"));
  }), y.forEach((r, h) => {
    const C = Z(v, r, h), w = C.find((d) => !A(d, /尾帧|last\s*frame/)) || C[0], L = C.find((d) => A(d, /尾帧|last\s*frame/));
    g(w, r, "first_frame"), g(L, r, "last_frame"), Z(f, r, h).forEach((d) => g(d, r));
  }), S;
}
function tn(e) {
  const n = e.trim();
  return n ? n.length <= 16e3 ? n : `${n.slice(0, 16e3)}
（文稿过长，已截取前 16000 字）` : "（当前文稿为空）";
}
function nn() {
  return [
    "用户已经点击“生成剧本”，这就是对本次写入的明确授权。",
    "先调用 read_full_text 读取当前文稿里的一句话创意，再扩写成能直接生产的短剧剧本。",
    "必须调用 append_to_end 把最终剧本写回文稿，不要只在聊天里解释。",
    "写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。",
    "每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。"
  ].join(`
`);
}
function rn(e, n) {
  const s = [
    "这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。",
    "先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。",
    "",
    "当前故事/剧本：",
    tn(n),
    ""
  ], p = {
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
  return [...s, ...p[e]].join(`
`);
}
function ge(e) {
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
  }, s = e === "video" ? "视频" : "图片";
  return [
    `读取当前画布，${n[e]}。`,
    `先${o[e]}。`,
    `然后调用一次 run_generation_batch 启动这些${s}节点的真实生成。这个调用会花费额度，必须让用户看到并确认额度操作；不要创建重复节点，也不要生成其他阶段的资产。`
  ].join(`
`);
}
function D(e, n) {
  return `guidedProduction.stage.${e}.${n}`;
}
function ke(e) {
  return ["style", "character", "scene", "storyboard", "keyframe", "video"].includes(e);
}
function on() {
  const { t: e } = B(), [n, o] = i.useState(!1), s = E((d) => d.workbenchDocument), p = E((d) => d.storyboardPlan), c = E((d) => d.storyboardPlanCommitted), a = E((d) => d.timeline), l = E((d) => d.setWorkspaceMode), k = E((d) => d.setStoryboardEditorOpen), f = E((d) => d.setCreationAiCollapsed), v = G((d) => d.nodes), y = G((d) => d.edges), S = i.useMemo(
    () => Gt(s),
    [s]
  ), N = i.useMemo(
    () => a.tracks.reduce((d, b) => d + b.clips.length, 0),
    [a.tracks]
  ), g = i.useMemo(
    () => Kt({
      documentText: S,
      nodes: v,
      timelineClipCount: N
    }),
    [S, v, p, c, N]
  ), u = g.current, r = g.completedCount === g.stages.length, h = ke(u.id) && g.plannedByStage[u.id] && !u.complete;
  i.useEffect(() => {
    const d = en(v, y);
    if (!d.length) return;
    const b = G.getState();
    d.forEach((j) => b.connectNodes(j.source, j.target, j.mode));
  }, [y, v]);
  const C = r ? e("guidedProduction.completeAction") : u.id === "storyboard" && p && !c ? e("guidedProduction.reviewStoryboardAction") : e(h ? D(u.id, "generateAction") : D(u.id, "action")), w = i.useCallback(() => {
    const d = G.getState(), b = E.getState(), j = new Set(
      b.timeline.tracks.flatMap((_) => _.clips.map((M) => M.sourceNodeId))
    ), T = d.nodes.filter((_) => _.kind === "video" && (_.status === "success" || _.result?.type === "video")).filter((_) => !j.has(_.id)).sort((_, M) => (_.shotIndex ?? Number.MAX_SAFE_INTEGER) - (M.shotIndex ?? Number.MAX_SAFE_INTEGER));
    let H = Math.max(
      0,
      ...b.timeline.tracks.flatMap((_) => _.clips.map((M) => M.endFrame))
    );
    for (const _ of T) {
      const M = le.send_to_timeline(_.id, { startFrame: H });
      M.ok && (H = M.clip.endFrame);
    }
    l("preview");
  }, [l]), L = i.useCallback(() => {
    if (r || u.id === "review") {
      w();
      return;
    }
    if (u.id === "idea") {
      l("creation"), f(!1);
      return;
    }
    if (u.id === "script") {
      l("creation"), f(!1), se({
        action: "send",
        prompt: nn(),
        modeId: "script",
        displayMessage: e("guidedProduction.stage.script.displayMessage"),
        autoApproveWrites: !0
      });
      return;
    }
    if (u.id === "storyboard") {
      if (p && !c) {
        l("creation"), f(!1), k(!0);
        return;
      }
      if (h) {
        l("generation"), ae({
          prompt: ge("storyboard"),
          displayMessage: e("guidedProduction.stage.storyboard.generateDisplayMessage"),
          autoApproveSafeWrites: !0
        });
        return;
      }
      l("creation"), f(!1), se({
        action: "storyboard",
        displayMessage: e("guidedProduction.stage.storyboard.displayMessage"),
        shotMode: "image"
      });
      return;
    }
    if (l("generation"), u.id === "style") {
      const d = Zt(
        S,
        G.getState().nodes
      );
      d.length && le.create_nodes(d);
    }
    ae({
      prompt: h && ke(u.id) ? ge(u.id) : rn(u.id, S),
      displayMessage: e(h ? D(u.id, "generateDisplayMessage") : `guidedProduction.stage.${u.id}.displayMessage`),
      autoApproveSafeWrites: !0
    });
  }, [
    r,
    u.id,
    S,
    w,
    h,
    f,
    k,
    l,
    p,
    c,
    e
  ]);
  return /* @__PURE__ */ t.jsxs(
    "section",
    {
      className: m(
        "relative z-[60] shrink-0 border-b border-nomi-line bg-nomi-paper",
        "px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      ),
      "aria-label": e("guidedProduction.aria"),
      children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center gap-3", children: [
          /* @__PURE__ */ t.jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nomi-accent-soft text-nomi-accent", children: r ? /* @__PURE__ */ t.jsx(te, { size: 18, stroke: 2.2 }) : /* @__PURE__ */ t.jsx(st, { size: 18, stroke: 1.9 }) }),
          /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx("span", { className: "text-micro font-semibold text-nomi-accent", children: r ? e("guidedProduction.complete") : e("guidedProduction.step", {
                current: g.currentIndex + 1,
                total: g.stages.length
              }) }),
              /* @__PURE__ */ t.jsx("span", { className: "truncate text-body-sm font-semibold text-nomi-ink", children: e(r ? "guidedProduction.completeTitle" : D(u.id, "title")) }),
              r ? null : /* @__PURE__ */ t.jsx("span", { className: "hidden truncate text-micro text-nomi-ink-40 md:inline", children: e(D(u.id, "owner")) })
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "m-0 truncate text-caption text-nomi-ink-60", children: e(r ? "guidedProduction.completeDescription" : D(u.id, "description")) })
          ] }),
          /* @__PURE__ */ t.jsxs(
            "button",
            {
              type: "button",
              className: m(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-nomi px-4",
                "border-0 bg-nomi-accent text-white text-body-sm font-semibold cursor-pointer",
                "shadow-nomi-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-nomi-md"
              ),
              onClick: L,
              children: [
                C,
                /* @__PURE__ */ t.jsx(gt, { size: 15, stroke: 2 })
              ]
            }
          ),
          /* @__PURE__ */ t.jsx(
            "button",
            {
              type: "button",
              className: m(
                "grid h-9 w-9 shrink-0 place-items-center rounded-nomi border border-nomi-line",
                "bg-nomi-paper text-nomi-ink-60 cursor-pointer hover:bg-nomi-ink-05 hover:text-nomi-ink"
              ),
              "aria-label": e(n ? "guidedProduction.collapse" : "guidedProduction.expand"),
              "aria-expanded": n,
              onClick: () => o((d) => !d),
              children: n ? /* @__PURE__ */ t.jsx(bt, { size: 16 }) : /* @__PURE__ */ t.jsx(Se, { size: 16 })
            }
          )
        ] }),
        n ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: m(
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
                  completed: g.completedCount,
                  total: g.stages.length
                }) })
              ] }),
              /* @__PURE__ */ t.jsx("ol", { className: "m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-5", children: g.stages.map((d, b) => {
                const j = !r && d.id === u.id;
                return /* @__PURE__ */ t.jsxs(
                  "li",
                  {
                    className: m(
                      "min-w-0 rounded-nomi border p-2.5",
                      d.complete ? "border-transparent bg-nomi-ink-05" : j ? "border-nomi-accent bg-nomi-accent-soft" : "border-nomi-line bg-nomi-paper"
                    ),
                    children: [
                      /* @__PURE__ */ t.jsxs("div", { className: "mb-1 flex items-center gap-1.5", children: [
                        d.complete ? /* @__PURE__ */ t.jsx(te, { size: 14, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ t.jsx(xt, { size: 10, className: m("mx-0.5 shrink-0", j ? "text-nomi-accent" : "text-nomi-ink-20") }),
                        /* @__PURE__ */ t.jsx("span", { className: "text-micro text-nomi-ink-40", children: e("guidedProduction.shortStep", { current: b + 1 }) })
                      ] }),
                      /* @__PURE__ */ t.jsx("div", { className: "truncate text-caption font-semibold text-nomi-ink", children: e(D(d.id, "title")) })
                    ]
                  },
                  d.id
                );
              }) })
            ]
          }
        ) : null
      ]
    }
  );
}
const sn = $(
  "创作区",
  () => import("./CreationWorkspace-Cn93jegk.js")
), an = $(
  "生成区",
  () => import("./GenerationWorkspace-Cz9JFWbf.js")
), ln = $("预览区", () => import("./PreviewWorkspace-BQ4Hh62s.js")), cn = {
  creation: "create",
  generation: "generate",
  preview: "preview"
}, dn = {
  create: "creation",
  creation: "creation",
  generate: "generation",
  generation: "generation",
  preview: "preview"
};
function mn({ label: e }) {
  const { t: n } = B(), o = n("workspace.loading", { label: e });
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: m(
        "workbench-shell__loading",
        "w-full h-full bg-workbench-bg grid place-items-center"
      ),
      "aria-label": o,
      children: /* @__PURE__ */ t.jsx(ye, { size: 28, label: o })
    }
  );
}
function ee({
  active: e,
  children: n,
  label: o
}) {
  return /* @__PURE__ */ t.jsx(
    "div",
    {
      className: m(
        "workbench-shell__workspace",
        "w-full h-full min-w-0 min-h-0"
      ),
      hidden: !e,
      children: /* @__PURE__ */ t.jsx(
        i.Suspense,
        {
          fallback: e ? /* @__PURE__ */ t.jsx(mn, { label: o }) : null,
          children: n
        }
      )
    }
  );
}
function pn() {
  if (typeof window > "u") return "generation";
  try {
    const e = String(
      new URL(window.location.href).searchParams.get("step") || ""
    ).trim();
    return dn[e] || "generation";
  } catch {
    return "generation";
  }
}
function ve(e) {
  if (typeof window > "u") return;
  const n = new URL(window.location.href), o = cn[e];
  n.searchParams.get("step") !== o && (n.searchParams.set("step", o), window.history.replaceState(null, "", n.toString()));
}
function un() {
  window.dispatchEvent(new CustomEvent("nomi-open-browser"));
}
function hn({
  generation: e,
  generationAi: n,
  generationAiLayout: o = "sidebar",
  projectId: s,
  projectName: p,
  onBackToLibrary: c,
  onOpenModelCatalog: a,
  onRenameProject: l
}) {
  const { t: k } = B(), f = E((w) => w.workspaceMode), v = E(
    (w) => w.setWorkspaceMode
  ), y = E((w) => w.categories), [S, N] = i.useState(() => [f]), [g, u] = i.useState(!1), r = i.useRef(null), h = window.nomiDesktop?.platform === "win32";
  i.useEffect(() => {
    const w = E.getState().workspaceMode;
    ve(w);
    const L = () => {
      v(pn());
    };
    return window.addEventListener("popstate", L), () => window.removeEventListener("popstate", L);
  }, [v]), i.useEffect(() => {
    N(
      (w) => w.includes(f) ? w : [...w, f]
    );
  }, [f]);
  const C = i.useCallback(
    (w) => {
      at(w) && (v(w), ve(w));
    },
    [v]
  );
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      className: m(
        "workbench-shell",
        "flex flex-col w-full h-full min-h-0",
        "bg-workbench-bg text-workbench-ink",
        'font-nomi-sans [font-feature-settings:"cv02","cv03","cv04","tnum"]'
      ),
      "data-workspace-mode": f,
      children: [
        h ? /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: m(
              "workbench-windowbar",
              "app-drag",
              "relative flex h-8 w-full shrink-0 items-center",
              "bg-workbench-surface text-workbench-ink"
            ),
            "aria-label": k("appBar.windowTitleBar"),
            onDoubleClick: je,
            children: [
              /* @__PURE__ */ t.jsx(
                "button",
                {
                  ref: r,
                  type: "button",
                  className: m(
                    "workbench-windowbar__brand",
                    "app-no-drag relative z-[2] inline-flex h-full items-center pl-4 pr-3",
                    "border-0 bg-transparent cursor-pointer rounded-none text-workbench-ink",
                    "transition-[opacity] duration-[var(--nomi-transition-fast)] hover:opacity-80"
                  ),
                  "aria-label": k("appBar.aboutAndUpdate"),
                  "aria-haspopup": "dialog",
                  "aria-expanded": g,
                  onClick: () => u((w) => !w),
                  children: /* @__PURE__ */ t.jsx(Ne, { markSize: 18, wordSize: 14 })
                }
              ),
              g ? /* @__PURE__ */ t.jsx(Le, { anchorEl: r.current, onClose: () => u(!1) }) : null,
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: "app-drag relative z-[1] h-full min-w-0 flex-1",
                  "data-window-drag-region": "true",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ t.jsx("div", { className: "app-no-drag relative z-[2] inline-flex h-full items-center pt-0.5 pb-0.5", children: /* @__PURE__ */ t.jsx(Ie, {}) }),
              /* @__PURE__ */ t.jsx(
                "div",
                {
                  className: m(
                    "app-no-drag relative z-[2] inline-flex h-full items-center gap-1 pt-0.5 pb-0.5",
                    "text-workbench-muted"
                  ),
                  role: "toolbar",
                  "aria-label": k("appBar.projectQuickActions"),
                  children: /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      className: m(
                        "inline-flex h-7 items-center gap-1.5 rounded-pill border-0 bg-transparent px-2",
                        "cursor-pointer font-inherit text-caption text-workbench-muted",
                        "transition-colors hover:text-workbench-ink"
                      ),
                      "aria-label": k("appBar.openBrowser"),
                      title: k("appBar.browser"),
                      onClick: un,
                      children: [
                        /* @__PURE__ */ t.jsx(Ce, { size: 14, stroke: 1.8, "aria-hidden": "true" }),
                        /* @__PURE__ */ t.jsx("span", { children: k("appBar.browser") })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ t.jsx(it, { className: "relative z-[2]" })
            ]
          }
        ) : null,
        /* @__PURE__ */ t.jsx(
          It,
          {
            workspaceMode: f,
            onWorkspaceModeChange: C,
            projectName: p,
            onBackToLibrary: c,
            onOpenModelCatalog: a,
            onRenameProject: l
          }
        ),
        /* @__PURE__ */ t.jsx(on, {}),
        /* @__PURE__ */ t.jsxs(
          "main",
          {
            className: m(
              "workbench-shell__body",
              "relative min-w-0 min-h-0 overflow-hidden flex flex-1"
            ),
            children: [
              f === "generation" ? /* @__PURE__ */ t.jsx(Ot, { projectId: s ?? null, categories: y }) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex-1 min-w-0 min-h-0 relative", children: [
                S.includes("creation") ? /* @__PURE__ */ t.jsx(
                  ee,
                  {
                    active: f === "creation",
                    label: k("workspace.creation"),
                    children: /* @__PURE__ */ t.jsx(sn, {})
                  }
                ) : null,
                S.includes("generation") ? /* @__PURE__ */ t.jsx(
                  ee,
                  {
                    active: f === "generation",
                    label: k("workspace.generation"),
                    children: /* @__PURE__ */ t.jsx(
                      an,
                      {
                        canvas: e,
                        aiSidebar: n,
                        aiLayout: o
                      }
                    )
                  }
                ) : null,
                S.includes("preview") ? /* @__PURE__ */ t.jsx(
                  ee,
                  {
                    active: f === "preview",
                    label: k("workspace.preview"),
                    children: /* @__PURE__ */ t.jsx(ln, {})
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
const Tn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: hn
}, Symbol.toStringTag, { value: "Module" }));
export {
  he as C,
  Tn as W,
  An as b,
  Gt as e,
  In as g,
  Ln as m
};
