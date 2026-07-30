import { bn as s, cV as p } from "./agentStudioMount-CNVmpr5A.js";
async function i(o) {
  if (typeof window > "u" || o.length === 0) return;
  const t = s(), a = t?.vendorKey === "platform-employee" ? t.modelKey : "", n = window.localStorage.getItem("user_token"), e = await fetch("/api/v1/agentapp/canvas/workbench/prompt-learning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...n ? { Authorization: `Bearer ${n}` } : {}
    },
    body: JSON.stringify({
      projectId: p("projectId"),
      employeeKey: a,
      items: o
    })
  });
  if (!e.ok) throw new Error(`画布提示词学习失败（${e.status}）`);
  const r = await e.json();
  if (r.code !== 200) throw new Error(r.message || "画布提示词学习失败");
}
export {
  i as r
};
