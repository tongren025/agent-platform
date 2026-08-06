import { bq as s, cY as p } from "./agentStudioMount-S0u8Hm0S.js";
async function i(o) {
  if (typeof window > "u" || o.length === 0) return;
  const t = s(), a = t?.vendorKey === "platform-employee" ? t.modelKey : "", r = window.localStorage.getItem("user_token"), e = await fetch("/api/v1/agentapp/canvas/workbench/prompt-learning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...r ? { Authorization: `Bearer ${r}` } : {}
    },
    body: JSON.stringify({
      projectId: p("projectId"),
      employeeKey: a,
      items: o
    })
  });
  if (!e.ok) throw new Error(`画布提示词学习失败（${e.status}）`);
  const n = await e.json();
  if (n.code !== 200) throw new Error(n.message || "画布提示词学习失败");
}
export {
  i as r
};
