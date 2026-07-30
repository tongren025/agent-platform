import { bv as i, bw as p } from "./agentStudioMount-CNVmpr5A.js";
function n(e) {
  return e.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "scene3d";
}
async function f(e, r, c) {
  const s = p(), a = i();
  if (!s || !a)
    return { url: e, localOnly: !0 };
  const o = Date.now(), l = `${n(c)}-${n(r)}-${o}.png`, t = await s.assets.importRemoteUrl({
    projectId: a,
    url: e,
    kind: "generated",
    fileName: l,
    ownerNodeId: r
  });
  return {
    url: typeof t.data?.url == "string" && t.data.url ? t.data.url : e,
    assetId: t.id,
    raw: { asset: t },
    localOnly: !1
  };
}
export {
  f as p
};
