import { aT as W, bV as z, c1 as A, cS as L, cM as I, e6 as D, e7 as g, dW as E, e0 as X, S as t, dg as $, bd as G, aN as U, ci as n, cx as B, aL as r, cj as V } from "./agentStudioMount-D0_EKHTh.js";
import { I as O } from "./IconFolder-NDbyvQsq.js";
const Y = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-0" }], ["path", { d: "M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2", key: "svg-1" }]], q = W("outline", "layout-list", "LayoutList", Y);
function F() {
  !z.current && A();
  const [d] = L.useState(I.current);
  return d;
}
const H = V(
  "i18n:generationCommon.workspace.timelineChunk",
  () => import("./TimelinePanel-BztCMP6L.js")
), J = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9
};
function ee({
  canvas: d,
  aiSidebar: a,
  aiLayout: i = "sidebar"
}) {
  const { t: o } = D(), m = g((e) => e.assistantWidth), k = g((e) => e.setAssistantWidth), w = g((e) => e.timeline), c = E((e) => e.nodes), f = X((e) => e.activeScope), x = t.useMemo(
    () => $(c, f),
    [c, f]
  ), l = t.useMemo(
    () => G(w, c, x),
    [x, c, w]
  ), j = F(), [u, p] = t.useState(!0);
  t.useEffect(() => {
    const e = (s) => {
      const b = s.detail;
      p(b?.expanded === !1);
    };
    return window.addEventListener("nomi-set-timeline-expanded", e), () => window.removeEventListener("nomi-set-timeline-expanded", e);
  }, []);
  const v = t.useMemo(() => {
    const e = (l.tracks ?? []).reduce((_, R) => _ + (R.clips?.length ?? 0), 0) + (l.textClips?.length ?? 0), s = Math.round(U(l) / Math.max(1, l.fps)), b = Math.floor(s / 60), N = String(s % 60).padStart(2, "0");
    return { clipCount: e, durationLabel: `${b}:${N}` };
  }, [l]), h = t.useRef(null), T = t.useCallback(
    (e) => {
      h.current = { startX: e.clientX, startW: m }, e.currentTarget.setPointerCapture(e.pointerId);
    },
    [m]
  ), M = t.useCallback(
    (e) => {
      const s = h.current;
      s && k(s.startW + (s.startX - e.clientX));
    },
    [k]
  ), C = t.useCallback((e) => {
    h.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
  }, []), y = `${m}px`, S = a && i === "sidebar" ? y : "0px", P = {
    "--generation-assistant-width": S,
    "--generation-assistant-target-width": y,
    gridTemplateColumns: !!a && i === "sidebar" ? "minmax(0,1fr) var(--generation-assistant-width)" : "minmax(0,1fr)",
    gridTemplateRows: `minmax(0,1fr) ${u ? "0px" : "var(--workbench-timeline-height)"}`
  };
  return /* @__PURE__ */ n.jsxs(
    B.section,
    {
      className: r(
        "workbench-generation",
        "grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_var(--workbench-timeline-height)]",
        "w-full h-full overflow-hidden bg-[var(--workbench-bg)]",
        a && i === "overlay" && "relative"
      ),
      style: P,
      initial: !1,
      animate: { "--generation-assistant-width": S },
      transition: j ? { duration: 0 } : J,
      "data-has-ai": a ? "true" : "false",
      "data-ai-layout": a ? i : "none",
      "aria-label": o("generationCommon.workspace.aria"),
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
              d,
              u ? /* @__PURE__ */ n.jsxs(
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
                  "aria-label": o("generationCommon.workspace.expandTimeline"),
                  onClick: () => p(!1),
                  children: [
                    /* @__PURE__ */ n.jsx(q, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" }),
                    /* @__PURE__ */ n.jsx("span", { children: o("generationCommon.workspace.timeline") }),
                    /* @__PURE__ */ n.jsx("span", { className: "text-nomi-ink-60", children: o("generationCommon.workspace.clipSummary", {
                      count: v.clipCount,
                      duration: v.durationLabel
                    }) }),
                    /* @__PURE__ */ n.jsx(O, { size: 15, stroke: 1.8, className: "text-nomi-ink-60" })
                  ]
                }
              ) : null
            ]
          }
        ),
        a ? /* @__PURE__ */ n.jsxs(
          "aside",
          {
            className: r(
              "workbench-generation__ai relative",
              "grid min-w-0 min-h-0 overflow-hidden border-b border-[var(--workbench-border)]",
              i === "overlay" ? "absolute top-4 right-4 z-[80] block w-auto h-auto border-0 bg-transparent pointer-events-auto" : "justify-items-end border-l border-l-[var(--workbench-border)] bg-[var(--workbench-surface)]"
            ),
            "aria-label": o("generationCommon.workspace.assistantSidebar"),
            children: [
              i === "sidebar" ? /* @__PURE__ */ n.jsx(
                "div",
                {
                  role: "separator",
                  "aria-label": o("generationCommon.workspace.resizeAssistant"),
                  "aria-orientation": "vertical",
                  className: r(
                    "group absolute left-0 top-0 bottom-0 z-10 w-2 -translate-x-1/2",
                    "flex cursor-col-resize items-center justify-center touch-none"
                  ),
                  onPointerDown: T,
                  onPointerMove: M,
                  onPointerUp: C,
                  onPointerCancel: C,
                  children: /* @__PURE__ */ n.jsx("span", { className: r("h-8 w-[3px] rounded-full bg-nomi-ink-30 group-hover:bg-nomi-accent") })
                }
              ) : null,
              a
            ]
          }
        ) : null,
        /* @__PURE__ */ n.jsx("div", { className: r("workbench-generation__timeline", "relative col-span-full min-w-0 min-h-0"), children: u ? null : /* @__PURE__ */ n.jsx(t.Suspense, { fallback: null, children: /* @__PURE__ */ n.jsx(
          H,
          {
            density: "compact",
            regionLabel: o("generationCommon.workspace.timelineChunk"),
            actionLabelPrefix: o("generationCommon.workspace.timelineActionPrefix"),
            onCollapse: () => p(!0)
          }
        ) }) })
      ]
    }
  );
}
export {
  ee as default
};
