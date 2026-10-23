import { e5 as n, c3 as c } from "./agentStudioMount-CnF6gUyG.js";
const a = 5e3;
function u({ message: o, onUndo: e, durationMs: s = a }) {
  let t = !1;
  n.getState().push({
    message: o,
    type: "success",
    ttl: s,
    actionLabel: c.t("common.undo"),
    onAction: () => {
      if (!t) {
        t = !0;
        try {
          e();
        } catch {
        }
      }
    }
  });
}
export {
  u as s
};
