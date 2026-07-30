import { e2 as n, c0 as c } from "./agentStudioMount-CNVmpr5A.js";
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
