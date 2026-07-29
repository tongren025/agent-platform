import { dU as n, bX as a } from "./agentStudioMount-C42uVxj4.js";
const c = 5e3;
function u({ message: o, onUndo: s, durationMs: e = c }) {
  let t = !1;
  n.getState().push({
    message: o,
    type: "success",
    ttl: e,
    actionLabel: a.t("common.undo"),
    onAction: () => {
      if (!t) {
        t = !0;
        try {
          s();
        } catch {
        }
      }
    }
  });
}
export {
  u as s
};
