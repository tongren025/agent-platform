import { dV as k, dK as c, c8 as t, aJ as o, a8 as p } from "./agentStudioMount-Dd-4ILXh.js";
import { I as y } from "./IconListCheck-Da2tvSQu.js";
import { u as i, w as C } from "./batchPlanPreview-Cd24nneo.js";
function B() {
  const { t: a } = k(), n = i((e) => e.plan), h = i((e) => e.cancel), b = i((e) => e.confirm), u = c((e) => e.nodes), l = c((e) => e.canvasZoom), m = c((e) => e.canvasOffset);
  if (!n) return null;
  const x = C(n), f = new Map(n.blocked.map((e) => [e.nodeId, e])), d = n.waves.flat().length, g = n.waves[0]?.length ?? 0;
  return /* @__PURE__ */ t.jsxs("div", { className: o("absolute inset-0 z-40 pointer-events-none"), "data-batch-plan-overlay": !0, children: [
    u.map((e) => {
      const r = x.get(e.id), s = f.get(e.id);
      if (!r && !s) return null;
      const v = e.position.x * l + m.x, w = e.position.y * l + m.y;
      return /* @__PURE__ */ t.jsx(
        "span",
        {
          className: o(
            "absolute flex h-6 min-w-6 items-center justify-center rounded-full px-1",
            "text-micro font-medium border -translate-x-1/2 -translate-y-1/2",
            s ? "bg-workbench-danger-soft text-workbench-danger border-workbench-danger" : "bg-nomi-accent-soft text-nomi-accent border-nomi-accent"
          ),
          style: { left: v, top: w },
          title: s ? s.detail : a("generationCommon.batchPlan.waveTitle", { wave: r }),
          children: s ? "⚠" : r
        },
        e.id
      );
    }),
    /* @__PURE__ */ t.jsxs(
      "div",
      {
        className: o(
          "pointer-events-auto absolute left-1/2 top-3 -translate-x-1/2",
          "flex items-center gap-3 rounded-nomi border border-nomi-line bg-nomi-paper py-2 px-3 shadow-nomi-md"
        ),
        children: [
          /* @__PURE__ */ t.jsx(y, { size: 16, className: o("shrink-0 text-nomi-accent"), "aria-hidden": !0 }),
          /* @__PURE__ */ t.jsx("span", { className: o("text-body-sm font-medium text-nomi-ink whitespace-nowrap"), children: a("generationCommon.batchPlan.summary", { count: d, waves: n.waves.length }) }),
          /* @__PURE__ */ t.jsxs("span", { className: o("text-caption text-nomi-ink-60 whitespace-nowrap"), children: [
            a("generationCommon.batchPlan.firstWave", { count: g }),
            n.blocked.length > 0 ? a("generationCommon.batchPlan.blocked", { count: n.blocked.length }) : ""
          ] }),
          /* @__PURE__ */ t.jsx(p, { className: o("h-7 min-h-7 px-3 cursor-pointer"), onClick: h, children: a("generationCommon.batchPlan.cancel") }),
          /* @__PURE__ */ t.jsx(
            p,
            {
              className: o(
                "h-7 min-h-7 px-3 cursor-pointer bg-nomi-ink text-nomi-paper border-nomi-ink hover:bg-nomi-ink hover:text-nomi-paper"
              ),
              onClick: () => {
                b();
              },
              disabled: d === 0,
              children: a("generationCommon.batchPlan.generate")
            }
          )
        ]
      }
    )
  ] });
}
export {
  B as BatchPlanOverlay
};
