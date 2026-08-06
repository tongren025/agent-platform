import { S as i, e6 as m, dW as h, ci as e, aL as o } from "./agentStudioMount-D0_EKHTh.js";
import { I as p } from "./IconBrush-BMZ4ndiR.js";
import { N as f, E as u, W as x, r as b } from "./BaseGenerationNode-CoxASVIl.js";
function C({
  node: t,
  readOnly: s = !1
}) {
  const { t: a } = m(), [l, n] = i.useState(!1), r = h((c) => c.selectNode), d = i.useCallback(() => {
    s || (r(t.id), n(!0));
  }, [t.id, s, r]);
  return /* @__PURE__ */ e.jsxs("div", { className: o("flex h-full w-full flex-col bg-nomi-paper"), children: [
    /* @__PURE__ */ e.jsx("div", { className: o("p-2.5 pointer-events-none"), children: /* @__PURE__ */ e.jsx(f, { title: t.title || a("generationCommon.whiteboard.title") }) }),
    /* @__PURE__ */ e.jsx("div", { className: o("flex-1 min-h-0 flex flex-col items-center justify-center pb-3"), children: /* @__PURE__ */ e.jsx(
      u,
      {
        icon: /* @__PURE__ */ e.jsx(p, { size: 24, stroke: 1.55 }),
        hint: a("generationCommon.whiteboard.openHint"),
        activateAriaLabel: a("generationCommon.whiteboard.openAria"),
        onActivate: d
      }
    ) }),
    l ? /* @__PURE__ */ e.jsx(
      x,
      {
        nodeId: t.id,
        sourceKind: "whiteboard",
        nodeTitle: t.title || a("generationCommon.whiteboard.title"),
        initialState: b(t),
        onClose: () => n(!1)
      }
    ) : null
  ] });
}
const j = i.memo(C);
j.displayName = "WhiteboardCardBody";
export {
  j as default
};
