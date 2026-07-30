import { bx as f } from "./agentStudioMount-DueN8bR4.js";
function m(r, o = 160) {
  const e = (r ?? "").trim();
  return e.length > o ? `${e.slice(0, o)}…` : e;
}
function I(r) {
  const o = (r.title || "").trim(), e = m(r.prompt, 120);
  return o && e ? `${o}：${e}` : o || e;
}
function v(r, o, e) {
  const s = new Map(o.map((t) => [t.id, t])), c = /* @__PURE__ */ new Map();
  for (const t of o)
    typeof t.shotIndex == "number" && c.set(t.shotIndex, t);
  const p = [];
  for (const t of r) {
    const n = s.get(t);
    if (!n) continue;
    const d = n.result?.url || n.result?.providerUrl || "";
    if (!d) continue;
    const l = f(n.kind) === "video", h = e.filter((i) => i.target === t).map((i) => s.get(i.source)).filter((i) => !!i && f(i.kind) !== "video").map(I).filter(Boolean), a = typeof n.shotIndex == "number" ? c.get(n.shotIndex - 1) : void 0, u = m(a?.prompt, 160) || void 0;
    p.push({
      shotNodeId: t,
      shotTitle: (n.title || "").trim() || t,
      shotPrompt: (n.prompt || "").trim(),
      anchorDescriptions: h,
      ...u ? { previousShotPrompt: u } : {},
      frameSourceUrl: d,
      isVideo: l
    });
  }
  return p;
}
export {
  v as gatherShotVerifyInputs
};
