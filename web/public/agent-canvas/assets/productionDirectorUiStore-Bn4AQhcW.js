import { aR as g } from "./agentStudioMount-xGP7t2dE.js";
function m(e) {
  return String(e.meta?.productionStage ?? "").trim().toLowerCase();
}
function v(e) {
  return [
    e.kind,
    e.title,
    e.prompt,
    m(e),
    e.result?.type,
    e.result?.text
  ].filter(Boolean).join(" ").toLowerCase();
}
function a(e, t) {
  return e.status !== "success" && !e.result ? !1 : t ? e.result?.type === t : !0;
}
function p(e, t) {
  const n = m(e);
  if (n)
    return t === "script" ? n === "script" : t === "storyboard" ? n === "storyboard" : t === "motion" ? n === "vid_prompt" || n === "motion" : t === "keyframe" ? n === "img_prompt" || n === "keyframe" : t === "video" ? n === "video" || e.kind === "video" || e.result?.type === "video" : !1;
  const i = v(e);
  switch (t) {
    case "script":
      return e.kind === "text" && /剧本|台词|对白|shot script/.test(i);
    case "storyboard":
      return /分镜|storyboard/.test(i);
    case "motion":
      return /动态设计|运镜|镜头运动|视频提示词|camera move/.test(i);
    case "keyframe":
      return e.kind === "keyframe" || /首帧|尾帧|关键帧|keyframe/.test(i);
    case "video":
      return e.kind === "video" || e.result?.type === "video";
    case "review":
      return !1;
  }
}
function w(e, t) {
  const n = e.filter((o) => p(o, t)), i = n.some((o) => o.status === "error"), c = n.some((o) => o.status === "queued" || o.status === "running");
  let u = !1;
  return t === "script" || t === "motion" ? u = n.length > 0 : t === "storyboard" || t === "keyframe" ? u = n.some((o) => a(o, "image")) : u = n.some((o) => a(o, "video")), {
    complete: u,
    planned: n.length > 0,
    failed: i,
    running: c
  };
}
function k(e) {
  const { nodes: t, timelineSourceNodeIds: n = /* @__PURE__ */ new Set() } = e, i = ["script", "storyboard", "motion", "keyframe", "video"].map((r) => ({
    id: r,
    ...w(t, r)
  })), c = new Set(
    t.filter((r) => p(r, "video") && a(r, "video")).map((r) => r.id)
  ), o = {
    id: "review",
    complete: Array.from(c).some((r) => n.has(r)),
    planned: c.size > 0,
    failed: !1,
    running: !1
  }, s = [...i, o], d = s.findIndex((r) => !r.complete), l = d >= 0 ? d : s.length - 1, f = s.filter((r) => r.complete).length;
  return {
    stages: s,
    current: s[l],
    currentIndex: l,
    completedCount: f,
    productionCompletedCount: i.filter((r) => r.complete).length,
    productionStageCount: i.length,
    complete: f === s.length,
    hasFailure: s.some((r) => r.failed),
    running: s.some((r) => r.running)
  };
}
function x(e) {
  return e.hasFailure ? "needsAttention" : e.running ? "running" : e.complete ? "complete" : e.current.id === "review" ? "review" : e.current.id === "video" ? e.current.planned ? "videoPlanned" : "videoMissing" : "stageMissing";
}
const y = "agent-studio.production-director-mode";
function S() {
  return typeof window > "u" ? "guided" : window.localStorage.getItem(y) === "professional" ? "professional" : "guided";
}
const C = g((e) => ({
  // 新用户永远先进入一步一指引；主动切到专业画布后才记住选择。
  mode: S(),
  directoryOpen: !0,
  setMode: (t) => {
    typeof window < "u" && window.localStorage.setItem(y, t), e({ mode: t, directoryOpen: t === "guided" });
  },
  setDirectoryOpen: (t) => e({ directoryOpen: t }),
  toggleDirectory: () => e((t) => ({ directoryOpen: !t.directoryOpen }))
}));
export {
  k as d,
  p as m,
  x as p,
  C as u
};
