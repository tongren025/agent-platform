import { aS as W, bS as z, b_ as A, cP as I, cJ as D, e3 as L, e4 as h, dT as X, dZ as $, S as t, dd as G, bc as U, aM as B, cf as n, cu as E, aK as a, cg as J } from "./agentStudioMount-CNVmpr5A.js";
import { I as K } from "./IconFolder-BTaPDGgk.js";
const O = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-0" }], ["path", { d: "M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-1" }]], Y = W("outline", "layout-list", "LayoutList", O);
function Z() {
  !z.current && A();
  const [d] = I.useState(D.current);
  return d;
}
const q = J(
  "i18n:generationCommon.workspace.timelineChunk",
  () => import("./TimelinePanel-Cy1PCUpS.js")
), F = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9
};
function ee({
  canvas: d,
  aiSidebar: r,
  aiLayout: s = "sidebar"
}) {
  const { t: o } = L(), m = h((e) => e.assistantWidth), b = h((e) => e.setAssistantWidth), g = h((e) => e.timeline), l = X((e) => e.nodes), k = $((e) => e.activeScope), w = t.useMemo(
    () => G(l, k),
    [l, k]
  ), c = t.useMemo(
    () => U(g, l, w),
    [w, l, g]
  ), y = Z(), [u, f] = t.useState(!0), x = t.useMemo(() => {
    const e = (c.tracks ?? []).reduce((_, R) => _ + (R.clips?.length ?? 0), 0) + (c.textClips?.length ?? 0), i = Math.round(B(c) / Math.max(1, c.fps)), T = Math.floor(i / 60), N = String(i % 60).padStart(2, "0");
    return { clipCount: e, durationLabel: `${T}:${N}` };
  }, [c]), p = t.useRef(null), P = t.useCallback(
    (e) => {
      p.current = { startX: e.clientX, startW: m }, e.currentTarget.setPointerCapture(e.pointerId);
    },
    [m]
  ), j = t.useCallback(
    (e) => {
      const i = p.current;
      i && b(i.startW + (i.startX - e.clientX));
    },
    [b]
  ), v = t.useCallback((e) => {
    p.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
  }, []), C = `${m}px`, S = r && s === "sidebar" ? C : "0px", M = {
    "--generation-assistant-width": S,
    "--generation-assistant-target-width": C,
    gridTemplateColumns: !!r && s === "sidebar" ? "minmax(0,1fr) var(--generation-assistant-width)" : "minmax(0,1fr)",
    gridTemplateRows: `minmax(0,1fr) ${u ? "0px" : "var(--workbench-timeline-height)"}`
  };
  return /* @__PURE__ */ n.jsxs(
    E.section,
    {
      className: a(
        "workbench-generation",
        "grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_var(--workbench-timeline-height)]",
        "w-full h-full overflow-hidden bg-[var(--workbench-bg)]",
        r && s === "overlay" && "relative"
      ),
      style: M,
      initial: !1,
      animate: { "--generation-assistant-width": S },
      transition: y ? { duration: 0 } : F,
      "data-has-ai": r ? "true" : "false",
      "data-ai-layout": r ? s : "none",
      "aria-label": o("generationCommon.workspace.aria"),
      children: [
        /* @__PURE__ */ n.jsxs(
          "div",
          {
            className: a(
              "workbench-generation__canvas",
              "min-w-0 min-h-0 overflow-hidden border-b border-[var(--workbench-border)]",
              "relative"
            ),
            children: [
              d,
              u ? /* @__PURE__ */ n.jsxs(
                "button",
                {
                  type: "button",
                  className: a(
                    "workbench-generation__timeline-handle",
                    "absolute bottom-3 left-1/2 z-[8] -translate-x-1/2",
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                    "border border-[var(--workbench-border)] bg-nomi-paper shadow-workbench-pop",
                    "text-body-sm font-medium text-nomi-ink",
                    "transition-colors hover:bg-nomi-ink-05"
                  ),
                  "aria-label": o("generationCommon.workspace.expandTimeline"),
                  onClick: () => f(!1),
                  children: [
                    /* @__PURE__ */ n.jsx(Y, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" }),
                    /* @__PURE__ */ n.jsx("span", { children: o("generationCommon.workspace.timeline") }),
                    /* @__PURE__ */ n.jsx("span", { className: "text-nomi-ink-60", children: o("generationCommon.workspace.clipSummary", {
                      count: x.clipCount,
                      duration: x.durationLabel
                    }) }),
                    /* @__PURE__ */ n.jsx(K, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" })
                  ]
                }
              ) : null
            ]
          }
        ),
        r ? /* @__PURE__ */ n.jsxs(
          "aside",
          {
            className: a(
              "workbench-generation__ai relative",
              "grid min-w-0 min-h-0 overflow-hidden border-b border-[var(--workbench-border)]",
              s === "overlay" ? "absolute top-4 right-4 z-[80] block w-auto h-auto border-0 bg-transparent pointer-events-auto" : "justify-items-end border-l border-l-[var(--workbench-border)] bg-[var(--workbench-surface)]"
            ),
            "aria-label": o("generationCommon.workspace.assistantSidebar"),
            children: [
              s === "sidebar" ? /* @__PURE__ */ n.jsx(
                "div",
                {
                  role: "separator",
                  "aria-label": o("generationCommon.workspace.resizeAssistant"),
                  "aria-orientation": "vertical",
                  className: a(
                    "group absolute left-0 top-0 bottom-0 z-10 w-2 -translate-x-1/2",
                    "flex cursor-col-resize items-center justify-center touch-none"
                  ),
                  onPointerDown: P,
                  onPointerMove: j,
                  onPointerUp: v,
                  onPointerCancel: v,
                  children: /* @__PURE__ */ n.jsx("span", { className: a("h-8 w-[3px] rounded-full bg-nomi-ink-30 group-hover:bg-nomi-accent") })
                }
              ) : null,
              r
            ]
          }
        ) : null,
        /* @__PURE__ */ n.jsx("div", { className: a("workbench-generation__timeline", "relative col-span-full min-w-0 min-h-0"), children: u ? null : /* @__PURE__ */ n.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ n.jsx(
          q,
          {
            density: "compact",
            regionLabel: o("generationCommon.workspace.timelineChunk"),
            actionLabelPrefix: o("generationCommon.workspace.timelineActionPrefix"),
            onCollapse: () => f(!0)
          }
        ) }) })
      ]
    }
  );
}
export {
  ee as default
};
