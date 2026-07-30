import { bL as c, bs as i } from "./agentStudioMount-D2l2f4Xv.js";
function s() {
  return typeof window < "u" && typeof document < "u";
}
async function l(e, n) {
  const t = window.localStorage.getItem("user_token"), r = await fetch(`/api/v1/agentapp/registry/skills${e}`, {
    ...n,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...t ? { Authorization: `Bearer ${t}` } : {},
      ...n?.headers || {}
    }
  }), o = await r.json();
  if (!r.ok || o.code !== 200 || o.data === void 0)
    throw new Error(o.message || `平台技能请求失败（${r.status}）`);
  return o.data;
}
function d(e) {
  const n = String(e.code || e.bindingCode || "").trim();
  if (!n) return null;
  const t = String(e.sourceType || e.source_type || "json"), r = [
    ...Array.isArray(e.skillDependencies) ? e.skillDependencies : [],
    ...Array.isArray(e.toolDependencies) ? e.toolDependencies : [],
    ...Array.isArray(e.mcpDependencies) ? e.mcpDependencies : []
  ].map(String);
  return {
    directoryName: n,
    name: n,
    label: String(e.name || n),
    description: String(e.description || e.summary || "") || null,
    author: "Agent Studio",
    stageLabels: r,
    isPlaybook: !!(e.isTree || e.is_tree),
    neededProviders: ["text"],
    manifestError: null,
    origin: t === "skill-md" ? "builtin" : "user"
  };
}
async function k() {
  const e = i();
  if (e) return e.skill.list();
  if (!s()) throw new Error("skill library requires a browser or Electron runtime");
  return (await l("")).map(d).filter((t) => t !== null);
}
async function p(e) {
  const n = i();
  if (n) return n.skill.exportPackage(e);
  if (!s()) throw new Error("skill export requires a browser or Electron runtime");
  return { format: "agent-studio-skill", version: 1, skill: await l(`/${encodeURIComponent(e)}`) };
}
async function f(e) {
  const n = i();
  if (n) return n.skill.importPackage(e);
  if (!s()) throw new Error("skill import requires a browser or Electron runtime");
  const t = e && typeof e == "object" ? e : {}, r = t.skill && typeof t.skill == "object" ? t.skill : t, o = String(r.code || r.bindingCode || r.name || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!o) return { ok: !1, error: "技能包缺少可用的 code/name" };
  const a = await l("", {
    method: "POST",
    body: JSON.stringify({
      ...r,
      code: o,
      name: String(r.name || o),
      sourceType: "json"
    })
  });
  return { ok: !0, dirName: o, skillName: String(a.name || o) };
}
async function m(e) {
  const n = i();
  if (n) return n.skill.deleteByDir(e);
  if (!s()) throw new Error("skill delete requires a browser or Electron runtime");
  return await l(`/${encodeURIComponent(e)}`, { method: "DELETE" }), { ok: !0, dirName: e };
}
async function g() {
  const e = await c(), n = /* @__PURE__ */ new Set();
  for (const t of e.byKind)
    t.enabledModels > 0 && (t.kind === "text" || t.kind === "image" || t.kind === "video") && n.add(t.kind);
  return n;
}
function y(e, n) {
  const t = e.neededProviders.filter((r) => !n.has(r));
  return { needs: e.neededProviders, missing: t, satisfied: t.length === 0 };
}
export {
  m as d,
  p as e,
  g,
  f as i,
  k as l,
  y as s
};
