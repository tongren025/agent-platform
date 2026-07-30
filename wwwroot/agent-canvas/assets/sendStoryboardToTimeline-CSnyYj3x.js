import { c3 as N, bX as h, bx as T, dK as x, dW as m } from "./agentStudioMount-Dd-4ILXh.js";
import { s as v } from "./sendGenerationNodeToTimeline-ddbdsR2h.js";
const b = Number.MAX_SAFE_INTEGER;
function S(t) {
  return !!(t.result?.url && String(t.result.url).trim());
}
function A(t) {
  return t.result?.type === "video" && S(t);
}
function I(t) {
  return T(t.kind) === "image";
}
function C(t) {
  return T(t.kind) === "video";
}
function g(t) {
  return typeof t?.shotIndex == "number" ? t.shotIndex : b;
}
function R(t, r, i) {
  const o = new Map(t.map((e) => [e.id, e])), s = i && i.length ? new Set(i) : null, a = t.filter((e) => N(e) && (!s || s.has(e.id))), c = a.filter(C), f = (e) => r.filter((n) => n.target === e.id).map((n) => o.get(n.source)).filter((n) => !!n && I(n)), l = (e) => r.filter(
    (d) => d.target === e.id && (d.mode === "first_frame" || d.mode === "reference" || d.mode == null)
  ).map((d) => o.get(d.source)).filter((d) => !!d && I(d))[0] ?? null, k = /* @__PURE__ */ new Set();
  for (const e of c)
    for (const n of f(e)) k.add(n.id);
  const u = [], p = [];
  for (const e of c) {
    if (A(e)) {
      u.push({ nodeId: e.id, shotIndex: g(e), role: "video" });
      continue;
    }
    const n = l(e);
    n && S(n) ? u.push({ nodeId: n.id, shotIndex: g(e), role: "placeholder" }) : p.push({
      nodeId: e.id,
      reason: n ? h.t("generationCommon.agentRuntime.videoAndKeyframeMissing") : h.t("generationCommon.agentRuntime.videoAndPlaceholderMissing")
    });
  }
  const F = new Set(u.map((e) => e.nodeId));
  for (const e of a)
    I(e) && (k.has(e.id) || F.has(e.id) || (S(e) ? u.push({ nodeId: e.id, shotIndex: g(e), role: "still" }) : p.push({ nodeId: e.id, reason: h.t("generationCommon.agentRuntime.shotNotGenerated") })));
  return u.sort((e, n) => {
    if (e.shotIndex !== n.shotIndex) return e.shotIndex - n.shotIndex;
    const d = o.get(e.nodeId)?.position?.y ?? 0, y = o.get(n.nodeId)?.position?.y ?? 0;
    return d !== y ? d - y : e.nodeId.localeCompare(n.nodeId);
  }), { units: u, skipped: p };
}
function E(t) {
  let r = 0;
  for (const i of t.tracks)
    for (const o of i.clips)
      o.endFrame > r && (r = o.endFrame);
  return r;
}
function G(t) {
  const r = /* @__PURE__ */ new Set();
  for (const i of t.tracks)
    for (const o of i.clips)
      o.sourceNodeId && r.add(o.sourceNodeId);
  return r;
}
function M(t, r) {
  const i = [], o = [];
  for (const s of t)
    r.has(s.nodeId) ? o.push({ nodeId: s.nodeId, reason: "already_on_timeline" }) : i.push(s);
  return { kept: i, skipped: o };
}
function _(t, r) {
  let i = Math.max(0, Math.floor(r));
  const o = [];
  for (const s of t) {
    const a = v(
      {
        readGenerationNodes: () => x.getState().nodes,
        readTimeline: () => m.getState().timeline,
        addTimelineClipAtFrame: (c, f, l) => {
          m.getState().addTimelineClipAtFrame(c, f, l);
        },
        readTimelineAfterInsert: () => m.getState().timeline
      },
      s.nodeId,
      { startFrame: i }
    );
    a.ok && (i = a.startFrame + a.clip.frameCount, o.push({
      nodeId: s.nodeId,
      clipId: a.clip.id,
      trackType: a.trackType,
      startFrame: a.startFrame,
      ...s.role ? { role: s.role } : {}
    }));
  }
  return o;
}
function O(t = {}) {
  const r = x.getState(), { units: i, skipped: o } = R(r.nodes, r.edges, t.nodeIds), s = m.getState().timeline, { kept: a, skipped: c } = M(i, G(s)), f = E(s), l = _(a, f);
  return { ok: l.length > 0, total: i.length, sent: l, skipped: [...o, ...c] };
}
export {
  O as arrangeStoryboardToTimeline,
  M as partitionUnitsByTimelinePresence
};
