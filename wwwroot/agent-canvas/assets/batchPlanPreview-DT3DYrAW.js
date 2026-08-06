import { ce as k, aR as I, cw as M, dJ as w, c3 as i, aO as N, a$ as D, e5 as E, dW as x } from "./agentStudioMount-D0_EKHTh.js";
import { k as U, A as G, x as A } from "./generationRunController-CdGrqG6l.js";
function _(e) {
  if (!e) return !1;
  const a = e.result?.url || e.result?.thumbnailUrl;
  return typeof a == "string" && a.length > 0;
}
function L(e, a) {
  const t = new Set(e), c = new Map(a.nodes.map((n) => [n.id, n])), s = [], o = /* @__PURE__ */ new Set(), h = [];
  for (const n of t)
    U(c.get(n)) && (o.add(n), s.push({ nodeId: n, reason: "missing-prompt", detail: "节点提示词为空，无法生成" }));
  const u = /* @__PURE__ */ new Map();
  for (const n of t) u.set(n, /* @__PURE__ */ new Set());
  for (const n of a.edges) {
    if (!t.has(n.target)) continue;
    const l = c.get(n.source), m = c.get(n.target);
    if (!(l && m && k(l, m, n.mode))) {
      if (t.has(n.source)) {
        u.get(n.target)?.add(n.source), h.push(n);
        continue;
      }
      if (_(l))
        h.push(n);
      else if (!o.has(n.target)) {
        o.add(n.target);
        const r = l?.title || n.source;
        s.push({ nodeId: n.target, reason: "missing-upstream", detail: `上游「${r}」还没有生成结果` });
      }
    }
  }
  const f = [], g = new Set(o);
  let d = [...t].filter((n) => !o.has(n)), p = d.length + 1;
  for (; d.length > 0 && p > 0; ) {
    p -= 1;
    const n = d.filter((r) => {
      const b = u.get(r) ?? /* @__PURE__ */ new Set();
      for (const C of b)
        if (o.has(C) || !g.has(C)) return !1;
      return !0;
    }), l = d.filter((r) => [...u.get(r) ?? []].some((b) => o.has(b)));
    for (const r of l)
      o.has(r) || (o.add(r), g.add(r), s.push({ nodeId: r, reason: "missing-upstream", detail: "依赖的节点本批被拦下" }));
    const m = n.filter((r) => !o.has(r));
    if (m.length === 0) {
      for (const r of d.filter((b) => !o.has(b)))
        o.add(r), s.push({ nodeId: r, reason: "cycle", detail: "与其他节点构成循环引用" });
      break;
    }
    f.push(m);
    for (const r of m) g.add(r);
    d = d.filter((r) => !g.has(r));
  }
  return { waves: f, blocked: s, edgesUsed: h };
}
function J(e) {
  const a = /* @__PURE__ */ new Map();
  return e.waves.forEach((t, c) => {
    for (const s of t) a.set(s, c + 1);
  }), a;
}
const R = 2, T = 5;
function B(e) {
  return typeof e != "number" || !Number.isFinite(e) ? R : Math.max(0, Math.min(T, Math.floor(e)));
}
function S(e = R) {
  return { maxRounds: B(e), roundsUsed: 0 };
}
function F(e) {
  return Math.max(0, e.maxRounds - e.roundsUsed);
}
function P(e) {
  return F(e) > 0;
}
function O(e) {
  if (!P(e))
    throw new Error("闭环轮次预算已耗尽，不能再开新一轮(必须先 canStartRound 守门)");
  return { maxRounds: e.maxRounds, roundsUsed: e.roundsUsed + 1 };
}
const V = "nomi:shot-verify:enabled";
function W() {
  try {
    return globalThis.localStorage?.getItem(V) !== "0";
  } catch {
    return !0;
  }
}
const y = I()((e, a) => ({
  status: "idle",
  deviations: [],
  budget: S(),
  exhausted: !1,
  beginVerify: () => e({ status: "verifying" }),
  setDeviations: (t) => {
    if (t.length === 0) {
      e({ status: "ready", deviations: [], budget: S(), exhausted: !1 });
      return;
    }
    e({ status: "ready", deviations: t, exhausted: !P(a().budget) });
  },
  consumeRound: () => {
    const { budget: t } = a();
    return P(t) ? (e({ budget: O(t) }), !0) : (e({ exhausted: !0 }), !1);
  },
  markFixing: () => e({ status: "verifying", deviations: [] }),
  clear: () => e({ status: "idle", deviations: [], budget: S(), exhausted: !1 })
}));
async function $(e) {
  if (!W()) return;
  y.getState().beginVerify();
  try {
    const [{ gatherShotVerifyInputs: t }, { verifyGeneratedShots: c }, { makeShotVerifyDeps: s }, { useGenerationCanvasStore: o }] = await Promise.all([
      import("./gatherShotVerifyInputs-B3tE4w2Z.js"),
      import("./shotVerifyRunner-C_z852N1.js"),
      import("./shotVerifyJudge-CRsAzK-_.js"),
      import("./agentStudioMount-D0_EKHTh.js").then((d) => d.bl)
    ]), { nodes: h, edges: u } = o.getState(), f = t(e, h, u);
    if (f.length === 0) {
      y.getState().setDeviations([]);
      return;
    }
    const g = await c(f, s());
    y.getState().setDeviations(g);
  } catch {
    y.getState().setDeviations([]);
  }
}
function Y(e) {
  return [
    "刚生成的这几镜，画面校验发现和设定/描述对不上：",
    ...e.filter((t) => t.kind === "content").map((t) => `· ${t.where}（${t.field}）：${typeof t.reason == "string" ? t.reason : ""}`.trim()),
    "",
    "请读画布，针对这几镜：先判断是提示词没写清还是分镜本身要调；",
    "能靠改这几镜的提示词修好的就改提示词，再用 run_generation_batch 只重新生成这几镜（会让我确认花费）。",
    "不要动其它已经正常的镜头。"
  ].join(`
`);
}
const q = I()((e, a) => ({
  plan: null,
  running: !1,
  open: (t) => e({ plan: t, running: !1 }),
  cancel: () => e({ plan: null, running: !1 }),
  confirm: async () => {
    const { plan: t, running: c } = a();
    if (!t || c) return;
    e({ running: !0 });
    let s;
    try {
      s = await M(t.waves.flat());
    } catch (o) {
      e({ running: !1 }), w(
        o instanceof Error && o.message ? o.message : i.t("generationCommon.batchPlan.authorizationFailed"),
        "error"
      );
      return;
    }
    e({ plan: null, running: !1 }), await v(t, s);
  }
}));
function j(e) {
  if (e.blocked.length === 0) return null;
  const a = e.blocked.filter((o) => o.reason === "cycle").length, t = e.blocked.filter((o) => o.reason === "missing-prompt").length, c = e.blocked.filter((o) => o.reason === "missing-upstream").length, s = [];
  return t > 0 && s.push(i.t("generationCommon.batchPlan.missingPrompt", { count: t })), c > 0 && s.push(i.t("generationCommon.batchPlan.waitingUpstream", { count: c })), a > 0 && s.push(i.t("generationCommon.batchPlan.cyclicReferences", { count: a })), i.t("generationCommon.batchPlan.blockedNotice", {
    details: s.join(i.t("generationCommon.batchPlan.detailSeparator"))
  });
}
async function z(e) {
  const a = e.waves.flat();
  if (a.length === 0) {
    await v(e);
    return;
  }
  const t = await N({
    nodeIds: a,
    title: i.t("generationCommon.batchPlan.startTitle"),
    message: D(a.length, G(a)),
    confirmLabel: i.t("generationCommon.batchPlan.confirmGenerate"),
    light: !0
  });
  t && await v(e, t);
}
async function v(e, a) {
  const t = e.waves, c = t.flat().length, s = j(e);
  if (c === 0) {
    w(
      s ? i.t("generationCommon.batchPlan.unavailable", { notice: s }) : i.t("generationCommon.batchPlan.noRunnableNodes"),
      "error"
    );
    return;
  }
  const o = t[0].length, h = t.length > 1 ? i.t("generationCommon.batchPlan.multiWaveStart", {
    waves: t.length,
    count: c,
    firstWave: o,
    remaining: c - o
  }) : i.t("generationCommon.batchPlan.start", { count: c });
  w(h, "info");
  try {
    const u = await A(e, a ? { grantId: a } : {}), f = u.successes.length, g = u.failures.length, d = s ? i.t("generationCommon.batchPlan.blockedTail", { notice: s }) : "";
    if (g === 0)
      w(i.t("generationCommon.batchPlan.completed", { count: f, tail: d }), s ? "warning" : "success");
    else {
      const p = u.failures.map((l) => l.nodeId), n = f === 0 ? i.t("generationCommon.batchPlan.failed", { count: g, tail: d }) : i.t("generationCommon.batchPlan.partiallyCompleted", { successes: f, failures: g, tail: d });
      E.getState().push({
        message: n,
        type: f === 0 ? "error" : "warning",
        ttl: 12e3,
        actionLabel: i.t("generationCommon.batchPlan.retryFailed", { count: g }),
        onAction: () => {
          const l = x.getState();
          z(L(p, { nodes: l.nodes, edges: l.edges }));
        }
      });
    }
    if (f > 0) {
      const p = x.getState().nodes, n = u.successes.map((l) => l.nodeId).filter((l) => typeof p.find((m) => m.id === l)?.shotIndex == "number");
      n.length > 0 && $(n);
    }
  } catch (u) {
    w(
      u instanceof Error && u.message ? u.message : i.t("generationCommon.batchPlan.exception"),
      "error"
    );
  }
}
export {
  L as a,
  Y as b,
  z as c,
  y as d,
  v as r,
  q as u,
  J as w
};
