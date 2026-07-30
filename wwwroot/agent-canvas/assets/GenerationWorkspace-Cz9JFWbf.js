import { aR as T, bO as _, bV as P, cH as W, cC as S, dV as z, dW as h, S as a, aL as A, c8 as n, cn as I, aJ as r, c9 as L } from "./agentStudioMount-DueN8bR4.js";
import { I as D } from "./IconFolder-yn2TEQim.js";
const X = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-0" }], ["path", { d: "M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-1" }]], $ = T("outline", "layout-list", "LayoutList", X);
function U() {
  !_.current && P();
  const [c] = W.useState(S.current);
  return c;
}
const B = L(
  "i18n:generationCommon.workspace.timelineChunk",
  () => import("./TimelinePanel-Ddmacg2J.js")
), E = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9
};
function H({
  canvas: c,
  aiSidebar: o,
  aiLayout: s = "sidebar"
}) {
  const { t } = z(), m = h((e) => e.assistantWidth), p = h((e) => e.setAssistantWidth), l = h((e) => e.timeline), x = U(), [d, b] = a.useState(!0), g = a.useMemo(() => {
    const e = (l.tracks ?? []).reduce((N, R) => N + (R.clips?.length ?? 0), 0) + (l.textClips?.length ?? 0), i = Math.round(A(l) / Math.max(1, l.fps)), j = Math.floor(i / 60), M = String(i % 60).padStart(2, "0");
    return { clipCount: e, durationLabel: `${j}:${M}` };
  }, [l]), u = a.useRef(null), v = a.useCallback(
    (e) => {
      u.current = { startX: e.clientX, startW: m }, e.currentTarget.setPointerCapture(e.pointerId);
    },
    [m]
  ), C = a.useCallback(
    (e) => {
      const i = u.current;
      i && p(i.startW + (i.startX - e.clientX));
    },
    [p]
  ), k = a.useCallback((e) => {
    u.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
  }, []), w = `${m}px`, f = o && s === "sidebar" ? w : "0px", y = {
    "--generation-assistant-width": f,
    "--generation-assistant-target-width": w,
    gridTemplateColumns: !!o && s === "sidebar" ? "minmax(0,1fr) var(--generation-assistant-width)" : "minmax(0,1fr)",
    gridTemplateRows: `minmax(0,1fr) ${d ? "0px" : "var(--workbench-timeline-height)"}`
  };
  return /* @__PURE__ */ n.jsxs(
    I.section,
    {
      className: r(
        "workbench-generation",
        "grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_var(--workbench-timeline-height)]",
        "w-full h-full overflow-hidden bg-[var(--workbench-bg)]",
        o && s === "overlay" && "relative"
      ),
      style: y,
      initial: !1,
      animate: { "--generation-assistant-width": f },
      transition: x ? { duration: 0 } : E,
      "data-has-ai": o ? "true" : "false",
      "data-ai-layout": o ? s : "none",
      "aria-label": t("generationCommon.workspace.aria"),
      children: [
        /* @__PURE__ */ n.jsxs(
          "div",
          {
            className: r(
              "workbench-generation__canvas",
              "min-w-0 min-h-0 overflow-hidden border-b border-[var(--workbench-border)]",
              "relative"
            ),
            children: [
              c,
              d ? /* @__PURE__ */ n.jsxs(
                "button",
                {
                  type: "button",
                  className: r(
                    "workbench-generation__timeline-handle",
                    "absolute bottom-3 left-1/2 z-[8] -translate-x-1/2",
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                    "border border-[var(--workbench-border)] bg-nomi-paper shadow-workbench-pop",
                    "text-body-sm font-medium text-nomi-ink",
                    "transition-colors hover:bg-nomi-ink-05"
                  ),
                  "aria-label": t("generationCommon.workspace.expandTimeline"),
                  onClick: () => b(!1),
                  children: [
                    /* @__PURE__ */ n.jsx($, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" }),
                    /* @__PURE__ */ n.jsx("span", { children: t("generationCommon.workspace.timeline") }),
                    /* @__PURE__ */ n.jsx("span", { className: "text-nomi-ink-60", children: t("generationCommon.workspace.clipSummary", {
                      count: g.clipCount,
                      duration: g.durationLabel
                    }) }),
                    /* @__PURE__ */ n.jsx(D, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" })
                  ]
                }
              ) : null
            ]
          }
        ),
        o ? /* @__PURE__ */ n.jsxs(
          "aside",
          {
            className: r(
              "workbench-generation__ai relative",
              "grid min-w-0 min-h-0 overflow-hidden border-b border-[var(--workbench-border)]",
              s === "overlay" ? "absolute top-4 right-4 z-[80] block w-auto h-auto border-0 bg-transparent pointer-events-auto" : "justify-items-end border-l border-l-[var(--workbench-border)] bg-[var(--workbench-surface)]"
            ),
            "aria-label": t("generationCommon.workspace.assistantSidebar"),
            children: [
              s === "sidebar" ? /* @__PURE__ */ n.jsx(
                "div",
                {
                  role: "separator",
                  "aria-label": t("generationCommon.workspace.resizeAssistant"),
                  "aria-orientation": "vertical",
                  className: r(
                    "group absolute left-0 top-0 bottom-0 z-10 w-2 -translate-x-1/2",
                    "flex cursor-col-resize items-center justify-center touch-none"
                  ),
                  onPointerDown: v,
                  onPointerMove: C,
                  onPointerUp: k,
                  onPointerCancel: k,
                  children: /* @__PURE__ */ n.jsx("span", { className: r("h-8 w-[3px] rounded-full bg-nomi-ink-30 group-hover:bg-nomi-accent") })
                }
              ) : null,
              o
            ]
          }
        ) : null,
        /* @__PURE__ */ n.jsx("div", { className: r("workbench-generation__timeline", "relative col-span-full min-w-0 min-h-0"), children: d ? null : /* @__PURE__ */ n.jsx(a.Suspense, { fallback: null, children: /* @__PURE__ */ n.jsx(
          B,
          {
            density: "compact",
            regionLabel: t("generationCommon.workspace.timelineChunk"),
            actionLabelPrefix: t("generationCommon.workspace.timelineActionPrefix"),
            onCollapse: () => b(!0)
          }
        ) }) })
      ]
    }
  );
}
export {
  H as default
};
