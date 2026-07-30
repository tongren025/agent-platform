import { c4 as M, aP as I, cm as k, dx as w, bX as c, aM as N, aY as U, dU as D, dK as x } from "./agentStudioMount-Dd-4ILXh.js";
import { w as E, t as G } from "./generationRunController-GOl2_cWO.js";
function _(e) {
  if (!e) return !1;
  const a = e.result?.url || e.result?.thumbnailUrl;
  return typeof a == "string" && a.length > 0;
}
function A(e, a) {
  const t = new Set(e), i = new Map(a.nodes.map((n) => [n.id, n])), r = [], o = /* @__PURE__ */ new Set(), h = [], u = /* @__PURE__ */ new Map();
  for (const n of t) u.set(n, /* @__PURE__ */ new Set());
  for (const n of a.edges) {
    if (!t.has(n.target)) continue;
    const g = i.get(n.source), s = i.get(n.target);
    if (!(g && s && M(g, s, n.mode))) {
      if (t.has(n.source)) {
        u.get(n.target)?.add(n.source), h.push(n);
        continue;
      }
      if (_(g))
        h.push(n);
      else if (!o.has(n.target)) {
        o.add(n.target);
        const p = g?.title || n.source;
        r.push({ nodeId: n.target, reason: "missing-upstream", detail: `上游「${p}」还没有生成结果` });
      }
    }
  }
  const l = [], d = new Set(o);
  let m = [], f = [...t].filter((n) => !o.has(n)), b = f.length + 1;
  for (; f.length > 0 && b > 0; ) {
    b -= 1, m = f.filter((s) => {
      const p = u.get(s) ?? /* @__PURE__ */ new Set();
      for (const C of p)
        if (o.has(C) || !d.has(C)) return !1;
      return !0;
    });
    const n = f.filter((s) => [...u.get(s) ?? []].some((p) => o.has(p)));
    for (const s of n)
      o.has(s) || (o.add(s), d.add(s), r.push({ nodeId: s, reason: "missing-upstream", detail: "依赖的节点本批被拦下" }));
    const g = m.filter((s) => !o.has(s));
    if (g.length === 0) {
      for (const s of f.filter((p) => !o.has(p)))
        o.add(s), r.push({ nodeId: s, reason: "cycle", detail: "与其他节点构成循环引用" });
      break;
    }
    l.push(g);
    for (const s of g) d.add(s);
    f = f.filter((s) => !d.has(s));
  }
  return { waves: l, blocked: r, edgesUsed: h };
}
function z(e) {
  const a = /* @__PURE__ */ new Map();
  return e.waves.forEach((t, i) => {
    for (const r of t) a.set(r, i + 1);
  }), a;
}
const R = 2, L = 5;
function T(e) {
  return typeof e != "number" || !Number.isFinite(e) ? R : Math.max(0, Math.min(L, Math.floor(e)));
}
function S(e = R) {
  return { maxRounds: T(e), roundsUsed: 0 };
}
function B(e) {
  return Math.max(0, e.maxRounds - e.roundsUsed);
}
function v(e) {
  return B(e) > 0;
}
function F(e) {
  if (!v(e))
    throw new Error("闭环轮次预算已耗尽，不能再开新一轮(必须先 canStartRound 守门)");
  return { maxRounds: e.maxRounds, roundsUsed: e.roundsUsed + 1 };
}
const O = "nomi:shot-verify:enabled";
function V() {
  try {
    return globalThis.localStorage?.getItem(O) !== "0";
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
    e({ status: "ready", deviations: t, exhausted: !v(a().budget) });
  },
  consumeRound: () => {
    const { budget: t } = a();
    return v(t) ? (e({ budget: F(t) }), !0) : (e({ exhausted: !0 }), !1);
  },
  markFixing: () => e({ status: "verifying", deviations: [] }),
  clear: () => e({ status: "idle", deviations: [], budget: S(), exhausted: !1 })
}));
async function W(e) {
  if (!V()) return;
  y.getState().beginVerify();
  try {
    const [{ gatherShotVerifyInputs: t }, { verifyGeneratedShots: i }, { makeShotVerifyDeps: r }, { useGenerationCanvasStore: o }] = await Promise.all([
      import("./gatherShotVerifyInputs-DyZbxgk-.js"),
      import("./shotVerifyRunner-C_z852N1.js"),
      import("./shotVerifyJudge-n9V_OeJ0.js"),
      import("./agentStudioMount-Dd-4ILXh.js").then((m) => m.be)
    ]), { nodes: h, edges: u } = o.getState(), l = t(e, h, u);
    if (l.length === 0) {
      y.getState().setDeviations([]);
      return;
    }
    const d = await i(l, r());
    y.getState().setDeviations(d);
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
    const { plan: t, running: i } = a();
    if (!t || i) return;
    e({ running: !0 });
    let r;
    try {
      r = await k(t.waves.flat());
    } catch (o) {
      e({ running: !1 }), w(
        o instanceof Error && o.message ? o.message : c.t("generationCommon.batchPlan.authorizationFailed"),
        "error"
      );
      return;
    }
    e({ plan: null, running: !1 }), await P(t, r);
  }
}));
function $(e) {
  if (e.blocked.length === 0) return null;
  const a = e.blocked.filter((r) => r.reason === "cycle").length, t = e.blocked.length - a, i = [];
  return t > 0 && i.push(c.t("generationCommon.batchPlan.waitingUpstream", { count: t })), a > 0 && i.push(c.t("generationCommon.batchPlan.cyclicReferences", { count: a })), c.t("generationCommon.batchPlan.blockedNotice", {
    details: i.join(c.t("generationCommon.batchPlan.detailSeparator"))
  });
}
async function K(e) {
  const a = e.waves.flat();
  if (a.length === 0) {
    await P(e);
    return;
  }
  const t = await N({
    nodeIds: a,
    title: c.t("generationCommon.batchPlan.startTitle"),
    message: U(a.length, E(a)),
    confirmLabel: c.t("generationCommon.batchPlan.confirmGenerate"),
    light: !0
  });
  t && await P(e, t);
}
async function P(e, a) {
  const t = e.waves, i = t.flat().length, r = $(e);
  if (i === 0) {
    w(
      r ? c.t("generationCommon.batchPlan.unavailable", { notice: r }) : c.t("generationCommon.batchPlan.noRunnableNodes"),
      "error"
    );
    return;
  }
  const o = t[0].length, h = t.length > 1 ? c.t("generationCommon.batchPlan.multiWaveStart", {
    waves: t.length,
    count: i,
    firstWave: o,
    remaining: i - o
  }) : c.t("generationCommon.batchPlan.start", { count: i });
  w(h, "info");
  try {
    const u = await G(e, a ? { grantId: a } : {}), l = u.successes.length, d = u.failures.length, m = r ? c.t("generationCommon.batchPlan.blockedTail", { notice: r }) : "";
    if (d === 0)
      w(c.t("generationCommon.batchPlan.completed", { count: l, tail: m }), r ? "warning" : "success");
    else {
      const f = u.failures.map((n) => n.nodeId), b = l === 0 ? c.t("generationCommon.batchPlan.failed", { count: d, tail: m }) : c.t("generationCommon.batchPlan.partiallyCompleted", { successes: l, failures: d, tail: m });
      D.getState().push({
        message: b,
        type: l === 0 ? "error" : "warning",
        ttl: 12e3,
        actionLabel: c.t("generationCommon.batchPlan.retryFailed", { count: d }),
        onAction: () => {
          const n = x.getState();
          K(A(f, { nodes: n.nodes, edges: n.edges }));
        }
      });
    }
    if (l > 0) {
      const f = x.getState().nodes, b = u.successes.map((n) => n.nodeId).filter((n) => typeof f.find((g) => g.id === n)?.shotIndex == "number");
      b.length > 0 && W(b);
    }
  } catch (u) {
    w(
      u instanceof Error && u.message ? u.message : c.t("generationCommon.batchPlan.exception"),
      "error"
    );
  }
}
export {
  A as a,
  Y as b,
  K as c,
  y as d,
  P as r,
  q as u,
  z as w
};
