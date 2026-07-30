import { dK as o, S as s, c8 as n, dV as h, N as x, aJ as f } from "./agentStudioMount-Dd-4ILXh.js";
import { W as g } from "./workbenchActions-X_tGmiTg.js";
const v = s.lazy(() => import("./CanvasAssistantPanel-cr41484Y.js"));
function p({ onOpen: r }) {
  const { t: a } = h();
  return /* @__PURE__ */ n.jsx(
    "aside",
    {
      className: f("generation-canvas-v2-assistant", "block w-auto h-auto rounded-full"),
      "data-collapsed": "true",
      "aria-label": a("generationCommon.canvas.assistantLauncher"),
      children: /* @__PURE__ */ n.jsx(
        g,
        {
          className: f(
            "generation-canvas-v2-assistant__launcher",
            "inline-flex items-center gap-2 h-9 pl-[10px] pr-[14px]",
            "border border-nomi-line rounded-full",
            "bg-nomi-paper text-nomi-ink font-[inherit] text-body-sm font-medium",
            "shadow-nomi-sm cursor-pointer",
            "hover:shadow-nomi-md hover:-translate-y-px"
          ),
          onClick: r,
          children: /* @__PURE__ */ n.jsx(x, { markSize: 18, wordSize: 13, suffix: a("generationCommon.canvas.assistantSuffix") })
        }
      )
    }
  );
}
function A({
  defaultCollapsed: r = !0,
  onCollapsedChange: a
}) {
  const t = o((e) => e.generationAiCollapsed), i = o((e) => e.generationAiMessages.length), l = o((e) => e.generationAiDraft), u = o((e) => e.setGenerationAiCollapsed), [c, d] = s.useState(
    () => !r || !t || i > 0 || l.trim().length > 0
  );
  s.useEffect(() => {
    c || a?.(t);
  }, [t, a, c]), s.useEffect(() => {
    (!t || i > 0 || l.trim().length > 0) && d(!0);
  }, [t, l, i]);
  const m = s.useCallback(() => {
    d(!0), u(!1);
  }, [u]);
  return c ? /* @__PURE__ */ n.jsx(s.Suspense, { fallback: /* @__PURE__ */ n.jsx(p, { onOpen: m }), children: /* @__PURE__ */ n.jsx(v, { onCollapsedChange: a }) }) : /* @__PURE__ */ n.jsx(p, { onOpen: m });
}
export {
  A as default
};
