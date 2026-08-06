import { bR as It, cP as At, d9 as Ce, ea as je, ai as kt, b3 as Nt, b4 as Oe, c3 as Se, S as v, e6 as le, ci as n, aL as a, a8 as F, e7 as Le, b0 as jt, dl as Ze, bv as Qe, bD as wt, E as _t, dW as V, c9 as St, B as Et, dP as Pt, dA as Mt, aG as $t, ed as Tt, N as Rt, K as Kt, a9 as be, x as Dt, cH as Bt, dt as zt, ds as Ot } from "./agentStudioMount-D0_EKHTh.js";
import { I as Lt, U as Ft, S as Fe, A as Gt, a as Ut, m as Wt, u as Vt, s as qt, k as Ht, j as Jt, f as Ge, g as Ue, W as Xt, M as Yt, C as Zt, c as Qt, d as en, l as tn, b as nn, h as on, i as sn, F as an } from "./useComposerAttachments-D-GkVIbl.js";
import { I as rn } from "./IconSettings-BXMzzf15.js";
import { N as ln } from "./NomiSelect-BSK2iM6w.js";
import { r as cn } from "./promptLearningApi-NjWbwLYU.js";
import { g as ee } from "./generationCanvasTools-CReQxY6p.js";
import { a as et, l as tt, r as dn } from "./applyCanvasToolCall-CmLvkhnG.js";
import { f as mn, n as We } from "./referenceSlots-D8z8-IQO.js";
import { I as fn, a as un } from "./IconChevronRight-DDnQp8GK.js";
import { CAMERA_MOVE_LABEL as pn, CAMERA_SPEED_DURATION as Ve } from "./cameraMoveVocab-CkwMRCGZ.js";
import { d as pe, b as gn } from "./batchPlanPreview-DT3DYrAW.js";
import { G as qe, c as He } from "./guidedProductionEvents-By-1YOZ6.js";
const xn = {
  unsupported_reference: "所选模型不支持这种参考连接",
  source_not_referenceable: "源节点没有可作参考的产物",
  dangling: "连接的一端节点找不到"
}, re = (e) => e && typeof e == "object" ? e : {};
function hn(e) {
  const t = [], o = new Map(e.nodes.map((d) => [d.id, d])), r = (d) => e.clientIdToNodeId[d] ?? e.resolveExternalId?.(d) ?? d, l = (d) => {
    const C = o.get(d)?.title;
    return typeof C == "string" && C.trim() ? C.trim() : d;
  }, y = (d, C) => `「${l(d)}」→「${l(C)}」`, f = (d) => {
    const C = /* @__PURE__ */ new Map(), p = re(d).skippedEdges;
    if (Array.isArray(p))
      for (const u of p) {
        const s = re(u), m = String(s.source || "").trim(), _ = String(s.target || "").trim();
        m && _ && C.set(`${m}→${_}`, String(s.reason || ""));
      }
    return C;
  }, h = (d, C) => {
    for (const p of d) {
      const u = re(p), s = r(String(u.sourceClientId || u.source || "").trim()), m = r(String(u.targetClientId || u.target || "").trim());
      if (!s || !m) continue;
      const _ = e.edges.find((i) => i.source === s && i.target === m);
      if (!_) {
        const i = C.get(`${s}→${m}`);
        t.push({
          where: y(s, m),
          field: "引用边",
          expected: "已连接",
          actual: "未连接",
          ...i ? { reason: xn[i] ?? i } : {}
        });
        continue;
      }
      const k = typeof u.mode == "string" && u.mode ? u.mode : void 0;
      k && (_.mode ?? "reference") !== k && t.push({ where: y(s, m), field: "边语义", expected: k, actual: _.mode ?? "(通用参考)" });
    }
  };
  for (const d of e.steps) {
    if (d.toolName === "create_canvas_nodes") {
      (Array.isArray(d.effectiveArgs.nodes) ? d.effectiveArgs.nodes : []).forEach((p, u) => {
        const s = re(p), m = typeof s.clientId == "string" && s.clientId ? s.clientId : `#${u + 1}`, _ = typeof s.title == "string" && s.title.trim() ? s.title.trim() : m, k = e.clientIdToNodeId[m], i = k ? o.get(k) : void 0;
        if (!i) {
          t.push({ where: _, field: "节点", expected: "已创建", actual: "不存在" });
          return;
        }
        typeof s.kind == "string" && s.kind !== i.kind && t.push({ where: _, field: "类型", expected: s.kind, actual: i.kind }), typeof s.prompt == "string" && s.prompt !== (i.prompt ?? "") && t.push({ where: _, field: "提示词", expected: s.prompt, actual: i.prompt ?? "" }), typeof s.title == "string" && s.title.trim() && s.title.trim() !== i.title && t.push({ where: _, field: "标题", expected: s.title.trim(), actual: i.title });
        const b = re(i.meta);
        typeof s.modelKey == "string" && s.modelKey.trim() && b.modelKey !== s.modelKey.trim() && t.push({ where: _, field: "模型", expected: s.modelKey.trim(), actual: b.modelKey ?? "(回退自动选)" });
        const $ = re(s.params);
        for (const [E, M] of Object.entries($))
          typeof M != "string" && typeof M != "number" && typeof M != "boolean" || typeof s.modelKey == "string" && b.modelKey === s.modelKey.trim() && b[E] !== M && t.push({ where: _, field: `参数 ${E}`, expected: M, actual: b[E] ?? "(默认值)" });
      }), h(Array.isArray(d.effectiveArgs.edges) ? d.effectiveArgs.edges : [], f(d.result));
      continue;
    }
    if (d.toolName === "connect_canvas_edges") {
      h(Array.isArray(d.effectiveArgs.edges) ? d.effectiveArgs.edges : [], f(d.result));
      continue;
    }
    if (d.toolName === "set_node_prompt") {
      const C = r(String(d.effectiveArgs.nodeId || "").trim()), p = typeof d.effectiveArgs.prompt == "string" ? d.effectiveArgs.prompt : "", u = o.get(C);
      u ? (u.prompt ?? "") !== p && t.push({ where: u.title || C, field: "提示词", expected: p, actual: u.prompt ?? "" }) : t.push({ where: C, field: "节点", expected: "存在", actual: "不存在" });
      continue;
    }
    if (d.toolName === "delete_canvas_nodes") {
      const C = Array.isArray(d.effectiveArgs.nodeIds) ? d.effectiveArgs.nodeIds : [];
      for (const p of C) {
        const u = r(String(p || "").trim());
        u && o.has(u) && t.push({ where: u, field: "节点", expected: "已删除", actual: "仍存在" });
      }
      continue;
    }
  }
  return e.auditOrphanArrayReferences && t.push(...e.auditOrphanArrayReferences(e.nodes, e.edges)), { ok: t.length === 0, deviations: t };
}
function yn() {
  return `prop_${crypto.randomUUID().slice(0, 10)}`;
}
async function vn(e) {
  const t = yn(), o = {
    source: "agent",
    txnId: `txn_${t}`,
    proposalId: t,
    suppressUndoBarriers: !0
  }, r = It();
  At();
  const l = [], y = {}, f = [], h = [];
  for (let s = 0; s < e.length; s += 1) {
    const m = e[s], _ = h.length;
    try {
      const k = ee.read_canvas();
      if (m.toolName === "set_node_prompt") {
        const b = Ce(String(m.effectiveArgs.nodeId || "").trim()), $ = k.nodes.find((E) => E.id === b);
        $ && h.push({ kind: "restore-prompt", nodeId: b, prompt: $.prompt || "" });
      }
      if (m.toolName === "delete_canvas_nodes") {
        const b = new Set(
          (Array.isArray(m.effectiveArgs.nodeIds) ? m.effectiveArgs.nodeIds : []).map((M) => Ce(String(M || "").trim())).filter(Boolean)
        ), $ = k.nodes.filter((M) => b.has(M.id)), E = k.edges.filter((M) => b.has(M.source) || b.has(M.target));
        $.length && h.push({
          kind: "restore-graph",
          nodes: JSON.parse(JSON.stringify($)),
          edges: JSON.parse(JSON.stringify(E))
        });
      }
      const i = await et(m.toolName, m.effectiveArgs, o);
      if (m.toolName === "create_canvas_nodes" && i && typeof i == "object") {
        const b = i;
        if (Array.isArray(b.createdNodeIds)) {
          const $ = b.createdNodeIds.filter((E) => typeof E == "string");
          l.push(...$), $.length && h.push({ kind: "delete-nodes", nodeIds: $ });
        }
        Object.assign(y, b.clientIdToNodeId ?? {});
      }
      if (m.toolName === "connect_canvas_edges" || m.toolName === "create_canvas_nodes" && Array.isArray(m.effectiveArgs.edges) && m.effectiveArgs.edges.length) {
        const b = new Set(k.edges.map((E) => `${E.source}→${E.target}`)), $ = ee.read_canvas().edges.filter((E) => !b.has(`${E.source}→${E.target}`)).map((E) => ({ source: E.source, target: E.target }));
        $.length && h.push({ kind: "disconnect-edges", pairs: $ });
      }
      f.push(i);
    } catch (k) {
      const i = k instanceof Error && k.message ? k.message : String(k);
      h.length = _;
      const b = new Set(ee.read_canvas().nodes.map((M) => M.id));
      h.length && je(o, () => kt(h));
      const $ = new Set(ee.read_canvas().nodes.map((M) => M.id)), E = l.filter((M) => b.has(M) && !$.has(M));
      return Nt(r), je(
        o,
        () => Oe([
          {
            type: "agent.txn.aborted",
            payload: {
              proposalId: t,
              reason: i,
              failedToolCallId: m.toolCallId,
              failedToolName: m.toolName,
              failedIndex: s,
              stepCount: e.length,
              compensatedNodeIds: E
            }
          }
        ])
      ), { status: "aborted", proposalId: t, failedIndex: s, reason: i, compensatedNodeIds: E };
    }
  }
  const d = ee.read_canvas(), C = hn({
    steps: e.map((s, m) => ({
      toolName: s.toolName,
      effectiveArgs: s.effectiveArgs,
      result: f[m]
    })),
    clientIdToNodeId: y,
    nodes: d.nodes,
    edges: d.edges,
    // 跨提议 clientId 回退：与执行侧同一个全局 registry（修对账误报「未连接」，bug A）。
    resolveExternalId: Ce,
    // 地基收口（§1c+§1d）：显示出的数组参考必须有对应已提交边，无边有图的 meta-only 孤儿如实报。
    // snapshot.nodes/edges 是完整 GenerationCanvasNode/Edge（read_canvas 后态），findOrphanArrayReferences
    // 需要完整图类型——在此适配 reconcile 的结构化 NodeLike/EdgeLike 注入签名。
    auditOrphanArrayReferences: () => mn(d.nodes, d.edges)
  });
  je(
    o,
    () => Oe([
      {
        type: "agent.txn.committed",
        payload: {
          proposalId: t,
          steps: e.map((s) => ({ toolCallId: s.toolCallId, toolName: s.toolName })),
          ...Object.keys(y).length ? { clientIdToNodeId: y } : {},
          reconciliation: {
            ok: C.ok,
            // payload ≤4KB 纪律:偏差列表截前 20 条(全量进 outcome 给 UI)。
            deviations: C.deviations.slice(0, 20)
          }
        }
      }
    ])
  );
  const p = new Set(l);
  for (const s of e)
    s.toolName === "set_node_prompt" && p.add(Ce(String(s.effectiveArgs.nodeId || "").trim()));
  const u = d.nodes.filter((s) => p.has(s.id)).map((s) => ({ nodeId: s.id, title: s.title, prompt: s.prompt || "" }));
  return { status: "committed", proposalId: t, results: f, clientIdToNodeId: y, reconciliation: C, compensation: h, watchNodes: u };
}
function Cn(e) {
  const t = {};
  for (const [o, r] of Object.entries(e))
    (typeof r == "string" || typeof r == "number" || typeof r == "boolean") && (t[o] = r);
  return t;
}
function Je(e) {
  return e.kind === "character" || e.kind === "scene" ? "reference" : e.kind === "image" ? "keyframe" : e.kind === "video" ? "video" : null;
}
function Xe(e, t) {
  return e.mode === "first_frame" && t.get(e.sourceClientId) === "video" && t.get(e.targetClientId) === "video";
}
function bn(e) {
  const t = e.find((p) => p.toolName === "create_canvas_nodes");
  if (!t) return null;
  const o = t.args && typeof t.args == "object" ? t.args : {}, r = Array.isArray(o.nodes) ? o.nodes : [];
  if (r.length === 0) return null;
  const l = r.map((p, u) => {
    const s = p && typeof p == "object" ? p : {}, m = s.position && typeof s.position == "object" ? s.position : null;
    return {
      clientId: typeof s.clientId == "string" && s.clientId.trim() ? s.clientId : `n${u + 1}`,
      kind: typeof s.kind == "string" ? s.kind : "image",
      title: typeof s.title == "string" ? s.title : Se.t("generationCommon.agentRuntime.shotTitle", { index: u + 1 }),
      prompt: typeof s.prompt == "string" ? s.prompt : "",
      ...m && typeof m.x == "number" && typeof m.y == "number" ? { position: { x: m.x, y: m.y } } : {},
      ...typeof s.modelKey == "string" && s.modelKey.trim() ? { modelKey: s.modelKey.trim() } : {},
      ...typeof s.modeId == "string" && s.modeId.trim() ? { modeId: s.modeId.trim() } : {},
      ...s.params && typeof s.params == "object" && !Array.isArray(s.params) ? { params: Cn(s.params) } : {}
    };
  }), y = (p) => p.map((u) => u && typeof u == "object" ? u : {}).map((u) => ({
    sourceClientId: String(u.sourceClientId || u.source || "").trim(),
    targetClientId: String(u.targetClientId || u.target || "").trim(),
    ...typeof u.mode == "string" && u.mode ? { mode: u.mode } : {}
  })).filter((u) => u.sourceClientId && u.targetClientId), f = y(Array.isArray(o.edges) ? o.edges : []), h = [...f], d = e.find((p) => p.toolName === "connect_canvas_edges");
  if (d) {
    const p = d.args && typeof d.args == "object" ? d.args : {}, u = new Set(h.map((s) => `${s.sourceClientId}→${s.targetClientId}`));
    for (const s of y(Array.isArray(p.edges) ? p.edges : []))
      u.has(`${s.sourceClientId}→${s.targetClientId}`) || h.push(s);
  }
  return {
    summary: typeof o.summary == "string" && o.summary.trim() ? o.summary.trim() : `${l.length} 个镜头 + ${h.length} 条引用边`,
    nodes: l,
    edges: h,
    createEdges: f,
    createCallId: t.toolCallId,
    connectCallId: d?.toolCallId ?? null
  };
}
const we = (e) => `${e.sourceClientId}→${e.targetClientId}`;
function In(e, t) {
  if (!e.modelKey) return null;
  const o = e.params ?? {}, r = We(o.aspect_ratio) ?? We(o.size) ?? void 0, l = typeof o.resolution == "string" ? o.resolution : void 0;
  return {
    modelLabel: t.get(e.modelKey)?.label ?? e.modelKey,
    aspect: r,
    resolution: l
  };
}
function _e({ label: e, value: t }) {
  return /* @__PURE__ */ n.jsxs(
    "span",
    {
      className: a(
        "inline-flex items-center gap-1 h-6 px-2 rounded-full",
        "border border-nomi-accent bg-nomi-accent-soft text-nomi-accent text-micro font-medium"
      ),
      children: [
        e ? /* @__PURE__ */ n.jsx("span", { className: a("text-micro text-nomi-accent/70"), children: e }) : null,
        /* @__PURE__ */ n.jsx("span", { className: a("truncate max-w-[120px]"), children: t })
      ]
    }
  );
}
function An({
  node: e,
  index: t,
  numbered: o,
  refTitles: r,
  chips: l,
  prompt: y,
  onPromptChange: f
}) {
  const { t: h } = le(), [d, C] = v.useState(!1);
  return /* @__PURE__ */ n.jsxs(
    "li",
    {
      className: a("flex flex-col gap-[6px] p-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line-soft"),
      "data-plan-node-id": e.clientId,
      children: [
        /* @__PURE__ */ n.jsxs(
          "button",
          {
            type: "button",
            className: a("flex items-center gap-2 min-w-0 border-0 bg-transparent p-0 text-left cursor-pointer"),
            "aria-expanded": d,
            "aria-label": h(
              d ? "generationCommon.agentPlan.collapsePromptAria" : "generationCommon.agentPlan.editPromptAria",
              { title: e.title }
            ),
            onClick: () => C((p) => !p),
            children: [
              o ? /* @__PURE__ */ n.jsx(
                "span",
                {
                  className: a(
                    "inline-grid place-items-center w-5 h-5 rounded-full bg-nomi-ink text-nomi-paper text-micro font-medium shrink-0"
                  ),
                  children: t + 1
                }
              ) : null,
              /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink text-body-sm font-medium truncate"), children: e.title }),
              r.length > 0 ? /* @__PURE__ */ n.jsx("span", { className: a("ml-auto inline-flex items-center gap-1 shrink-0"), "data-plan-node-refs": "true", children: r.map((p) => /* @__PURE__ */ n.jsx(
                "span",
                {
                  className: a(
                    "inline-flex items-center h-[18px] px-[7px] rounded-full bg-nomi-ink-05 text-nomi-ink-60 text-micro font-semibold"
                  ),
                  children: p
                },
                p
              )) }) : null
            ]
          }
        ),
        l ? /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-[6px] flex-wrap", o && "pl-7"), "data-plan-node-chips": "true", children: [
          /* @__PURE__ */ n.jsx(_e, { value: l.modelLabel }),
          l.aspect ? /* @__PURE__ */ n.jsx(_e, { label: h("generationCommon.agentPlan.aspect"), value: l.aspect }) : null,
          l.resolution ? /* @__PURE__ */ n.jsx(_e, { label: h("generationCommon.agentPlan.resolution"), value: l.resolution }) : null
        ] }) : null,
        d ? /* @__PURE__ */ n.jsx(
          "textarea",
          {
            className: a(
              "w-full min-h-[46px] p-2 rounded-nomi-sm",
              "border border-nomi-line-soft bg-nomi-paper text-nomi-ink-80 text-caption leading-[1.5] resize-y outline-0",
              "hover:border-nomi-line focus:border-nomi-accent focus:text-nomi-ink",
              o && "ml-7 w-[calc(100%-1.75rem)]"
            ),
            "aria-label": h("generationCommon.agentPlan.editNamedPrompt", { title: e.title }),
            value: y,
            autoFocus: !0,
            onChange: (p) => f(p.target.value)
          }
        ) : /* @__PURE__ */ n.jsx(
          "div",
          {
            className: a(
              "text-nomi-ink-60 text-caption overflow-hidden text-ellipsis whitespace-nowrap",
              o && "pl-7"
            ),
            "aria-hidden": "true",
            children: y
          }
        )
      ]
    }
  );
}
function kn({ plan: e, approveCalls: t, rejectCall: o, flat: r = !1 }) {
  const { t: l } = le(), [y, f] = v.useState(() => {
    const x = {};
    return e.nodes.forEach((N) => {
      x[N.clientId] = N.prompt;
    }), x;
  }), [h, d] = v.useState(/* @__PURE__ */ new Map());
  v.useEffect(() => {
    let x = !0;
    return tt().then((N) => {
      x && d(new Map(N.map((I) => [I.modelKey, I])));
    }).catch(() => {
    }), () => {
      x = !1;
    };
  }, []);
  const C = v.useMemo(() => new Map(e.nodes.map((x) => [x.clientId, x])), [e.nodes]), p = v.useMemo(
    () => new Map(e.nodes.map((x) => [x.clientId, x.kind])),
    [e.nodes]
  ), u = v.useMemo(
    () => e.createEdges.filter((x) => Xe(x, p)),
    [e.createEdges, p]
  ), [s, m] = v.useState(() => {
    const x = {};
    for (const N of u) x[we(N)] = !0;
    return x;
  }), _ = e.nodes.map(Je), k = !_.includes(null) && new Set(_).size >= 2, i = k ? ["reference", "keyframe", "video"].map((x) => ({ layer: x, nodes: e.nodes.filter((N) => Je(N) === x) })).filter((x) => x.nodes.length > 0) : [], b = v.useCallback(
    (x) => k ? e.edges.filter(
      (N) => N.targetClientId === x && N.mode !== "first_frame" && C.has(N.sourceClientId)
    ).map((N) => (C.get(N.sourceClientId)?.title || N.sourceClientId).replace(/^(角色|场景|道具)[：:]\s*/, "").slice(0, 8)) : [],
    [k, e.edges, C]
  ), $ = v.useCallback(() => {
    const x = e.nodes.map((I) => ({
      clientId: I.clientId,
      kind: I.kind,
      title: I.title,
      prompt: y[I.clientId] ?? I.prompt,
      ...I.position ? { position: I.position } : {},
      // bug①：把 agent 建议的模型/参数透传给执行层（确认后写入 node.meta）。
      ...I.modelKey ? { modelKey: I.modelKey } : {},
      ...I.modeId ? { modeId: I.modeId } : {},
      ...I.params ? { params: I.params } : {}
    })), N = e.createEdges.filter(
      (I) => !Xe(I, p) || s[we(I)] !== !1
    );
    t([
      {
        toolCallId: e.createCallId,
        overrides: {
          nodes: x,
          summary: e.summary,
          ...e.createEdges.length ? { edges: N } : {}
        }
      },
      ...e.connectCallId ? [{ toolCallId: e.connectCallId }] : []
    ]);
  }, [y, e, t, p, s]), E = v.useCallback(() => {
    o(e.createCallId), e.connectCallId && o(e.connectCallId);
  }, [e, o]), M = (x, N, I) => /* @__PURE__ */ n.jsx(
    An,
    {
      node: x,
      index: N,
      numbered: I,
      refTitles: b(x.clientId),
      chips: In(x, h),
      prompt: y[x.clientId] ?? x.prompt,
      onPromptChange: (X) => f((Y) => ({ ...Y, [x.clientId]: X }))
    },
    x.clientId
  );
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: a(
        "flex flex-col gap-3",
        r ? "" : "p-3 rounded-nomi border border-nomi-accent-soft bg-nomi-accent-soft/40"
      ),
      "data-agent-plan-card": "true",
      "aria-label": l("generationCommon.agentPlan.cardAria"),
      children: [
        r ? null : /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink text-body font-medium leading-snug"), children: e.summary }),
        k ? /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-3"), children: [
          i.map((x) => /* @__PURE__ */ n.jsxs("section", { className: a("flex flex-col gap-[6px]"), "data-plan-layer": x.layer, children: [
            /* @__PURE__ */ n.jsxs("div", { className: a("text-nomi-ink-60 text-micro font-semibold"), children: [
              l(`generationCommon.agentPlan.${x.layer}`),
              " ",
              /* @__PURE__ */ n.jsxs("span", { className: a("text-nomi-ink-40 font-medium"), children: [
                "×",
                x.nodes.length
              ] })
            ] }),
            /* @__PURE__ */ n.jsx("ol", { className: a("flex flex-col gap-2 list-none p-0 m-0"), children: x.nodes.map((N, I) => M(N, I, !1)) })
          ] }, x.layer)),
          u.length > 0 ? /* @__PURE__ */ n.jsxs("section", { className: a("flex flex-col gap-[6px]"), "data-plan-layer": "relay", children: [
            /* @__PURE__ */ n.jsxs("div", { className: a("text-nomi-ink-60 text-micro font-semibold"), children: [
              l("generationCommon.agentPlan.relay"),
              " ",
              /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink-40 font-medium"), children: l("generationCommon.agentPlan.optional") })
            ] }),
            u.map((x) => {
              const N = we(x), I = s[N] !== !1, X = (Y) => (C.get(Y)?.title || Y).replace(/\s*(视频|video).*$/i, "");
              return /* @__PURE__ */ n.jsxs(
                "label",
                {
                  className: a(
                    "flex items-start gap-2 p-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line-soft cursor-pointer"
                  ),
                  "data-plan-relay-edge": N,
                  children: [
                    /* @__PURE__ */ n.jsx(
                      "input",
                      {
                        type: "checkbox",
                        className: a("mt-[2px] accent-[var(--nomi-accent)]"),
                        checked: I,
                        "aria-label": l("generationCommon.agentPlan.enableRelay", {
                          source: X(x.sourceClientId),
                          target: X(x.targetClientId)
                        }),
                        onChange: (Y) => m((ce) => ({ ...ce, [N]: Y.target.checked }))
                      }
                    ),
                    /* @__PURE__ */ n.jsxs("span", { className: a("flex flex-col gap-[2px] min-w-0"), children: [
                      /* @__PURE__ */ n.jsxs(
                        "span",
                        {
                          className: a(
                            "text-caption font-semibold",
                            I ? "text-nomi-ink" : "text-nomi-ink-40 line-through"
                          ),
                          children: [
                            X(x.sourceClientId),
                            " → ",
                            X(x.targetClientId)
                          ]
                        }
                      ),
                      /* @__PURE__ */ n.jsx("span", { className: a("text-micro text-nomi-ink-40"), children: l(I ? "generationCommon.agentPlan.relayEnabled" : "generationCommon.agentPlan.relayDisabled") })
                    ] })
                  ]
                },
                N
              );
            })
          ] }) : null
        ] }) : /* @__PURE__ */ n.jsx(
          "ol",
          {
            className: a("flex flex-col gap-2 list-none p-0 m-0"),
            "aria-label": l("generationCommon.agentPlan.pendingShots"),
            children: e.nodes.map((x, N) => M(x, N, !0))
          }
        ),
        /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-wrap items-center justify-end gap-2"), children: [
          /* @__PURE__ */ n.jsx(F, { className: a("shrink-0"), variant: "default", size: "md", onClick: E, children: l("generationCommon.agentPlan.rejectAll") }),
          /* @__PURE__ */ n.jsx(
            F,
            {
              className: a("shrink-0"),
              variant: "primary",
              size: "md",
              "data-plan-confirm-all": "true",
              onClick: $,
              children: l("generationCommon.agentPlan.confirmAll")
            }
          )
        ] })
      ]
    }
  );
}
const Nn = v.memo(kn);
function jn({
  record: e,
  onUndone: t,
  flat: o = !1
}) {
  const { t: r } = le(), [l, y] = v.useState(!1), [f, h] = v.useState(null), d = Le((s) => s.setActiveCategoryId), C = Le((s) => s.activeCategoryId), p = (e.categoryCounts ?? []).filter((s) => s.count > 0), u = () => {
    const s = jt(e);
    if (s.length && f === null) {
      h(s);
      return;
    }
    Ze(e), t?.();
  };
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: a(
        "flex flex-col gap-2",
        o ? "" : "p-3 rounded-nomi border border-nomi-line-soft bg-nomi-ink-05/60"
      ),
      "data-committed-proposal-card": e.proposalId,
      children: [
        /* @__PURE__ */ n.jsxs("div", { className: a("flex items-start gap-1.5 min-w-0"), children: [
          /* @__PURE__ */ n.jsx("span", { className: a("shrink-0 text-caption text-workbench-success-ink"), children: "✓" }),
          /* @__PURE__ */ n.jsx("span", { className: a("min-w-0 text-caption text-nomi-ink-80 leading-[1.55]"), children: r("generationCommon.committedProposal.applied", { summary: e.summary }) }),
          e.reconciliationOk ? null : /* @__PURE__ */ n.jsx("span", { className: a("shrink-0 text-caption text-[var(--nomi-snap-tag)]"), children: r("generationCommon.committedProposal.mismatch") })
        ] }),
        p.length > 0 ? /* @__PURE__ */ n.jsx("div", { className: a("flex flex-wrap items-center gap-1"), children: p.map((s) => /* @__PURE__ */ n.jsxs(
          "button",
          {
            type: "button",
            "data-proposal-category-jump": s.categoryId,
            className: a(
              "inline-flex items-center h-5 px-2 rounded-full border text-micro cursor-pointer",
              s.categoryId === C ? "border-nomi-line-soft bg-nomi-ink-05 text-nomi-ink-60 cursor-default" : "border-nomi-line bg-nomi-paper text-nomi-ink-80 hover:bg-nomi-ink-05"
            ),
            onClick: () => d(s.categoryId),
            children: [
              s.label,
              " ",
              s.count
            ]
          },
          s.categoryId
        )) }) : null,
        /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2"), children: [
          /* @__PURE__ */ n.jsxs(
            "button",
            {
              type: "button",
              className: a(
                "inline-flex items-center gap-1 border-0 bg-transparent p-0 cursor-pointer whitespace-nowrap",
                "text-caption text-nomi-ink-60 hover:text-nomi-ink"
              ),
              onClick: () => y((s) => !s),
              children: [
                l ? /* @__PURE__ */ n.jsx(fn, { size: 12, stroke: 1.8 }) : /* @__PURE__ */ n.jsx(un, { size: 12, stroke: 1.8 }),
                r("generationCommon.committedProposal.viewSteps")
              ]
            }
          ),
          /* @__PURE__ */ n.jsx(
            F,
            {
              className: a("ml-auto shrink-0"),
              variant: "default",
              size: "sm",
              "data-proposal-undo-all": "true",
              onClick: u,
              children: r("generationCommon.committedProposal.undo")
            }
          )
        ] }),
        l ? /* @__PURE__ */ n.jsx("ol", { className: a("flex flex-col gap-1 list-none p-0 m-0"), children: e.stepLabels.map((s, m) => /* @__PURE__ */ n.jsxs("li", { className: a("text-caption text-nomi-ink-60"), children: [
          m + 1,
          ". ",
          s
        ] }, m)) }) : null,
        f ? /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2 p-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line"), children: [
          /* @__PURE__ */ n.jsx("span", { className: a("text-caption font-medium text-[var(--nomi-snap-tag)]"), children: r("generationCommon.committedProposal.lostEdits") }),
          f.map((s, m) => /* @__PURE__ */ n.jsxs("span", { className: a("text-caption text-nomi-ink-80"), children: [
            "· ",
            s
          ] }, m)),
          /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center justify-end gap-2"), children: [
            /* @__PURE__ */ n.jsx(F, { variant: "default", size: "sm", onClick: () => h(null), children: r("generationCommon.committedProposal.cancel") }),
            /* @__PURE__ */ n.jsx(F, { variant: "primary", size: "sm", "data-proposal-undo-confirm": "true", onClick: u, children: r("generationCommon.committedProposal.confirmUndo") })
          ] })
        ] }) : null
      ]
    }
  );
}
const nt = (e, t = 40) => {
  const o = typeof e == "string" ? e : JSON.stringify(e);
  return o.length > t ? `${o.slice(0, t)}…` : o;
}, wn = (e) => e === "引用边" || e === "边语义";
function _n(e, t) {
  return e.kind === "content" ? e.reason ? String(e.reason) : t("generationCommon.reconcile.contentMismatch", { actual: nt(e.actual) }) : e.field === "引用边" ? e.reason ? t("generationCommon.reconcile.edgeReason", { reason: Mn(e.reason, t) }) : t("generationCommon.reconcile.edgeMissing") : e.field === "边语义" ? t("generationCommon.reconcile.edgeSemantics", {
    actual: ie(e.actual, t),
    expected: ie(e.expected, t)
  }) : e.field === "节点" ? t("generationCommon.reconcile.nodeChange", {
    expected: ie(e.expected, t),
    actual: ie(e.actual, t)
  }) : t("generationCommon.reconcile.approvedActual", {
    expected: ie(e.expected, t),
    actual: ie(e.actual, t)
  });
}
function Sn(e, t) {
  return e === "引用边" ? t("generationCommon.reconcile.fields.referenceEdge") : e === "边语义" ? t("generationCommon.reconcile.fields.edgeSemantics") : e === "节点" ? t("generationCommon.reconcile.fields.node") : e === "类型" ? t("generationCommon.reconcile.fields.type") : e === "提示词" ? t("generationCommon.reconcile.fields.prompt") : e === "标题" ? t("generationCommon.reconcile.fields.title") : e === "模型" ? t("generationCommon.reconcile.fields.model") : e.startsWith("参数 ") ? t("generationCommon.reconcile.fields.parameter", { name: e.slice(3) }) : e.startsWith("数组参考槽 ") ? t("generationCommon.reconcile.fields.arrayReferenceSlot", { name: e.slice(6) }) : e;
}
const En = {
  已连接: "connected",
  未连接: "notConnected",
  "(通用参考)": "genericReference",
  已创建: "created",
  不存在: "missing",
  "(回退自动选)": "autoFallback",
  "(默认值)": "defaultValue",
  存在: "exists",
  已删除: "deleted",
  仍存在: "stillExists",
  有对应已提交边: "committedEdge",
  画布内来源应建成有序边: "edgeBackedSource",
  显示出边参考但无边: "orphanEdgeReference",
  "meta-only 残留（无边有图）": "orphanMeta"
}, Pn = {
  所选模型不支持这种参考连接: "unsupportedReference",
  源节点没有可作参考的产物: "sourceNotReferenceable",
  连接的一端节点找不到: "dangling"
};
function ie(e, t) {
  const o = nt(e), r = En[o];
  return r ? t(`generationCommon.reconcile.values.${r}`) : o;
}
function Mn(e, t) {
  const o = String(e ?? ""), r = Pn[o];
  return r ? t(`generationCommon.reconcile.reasons.${r}`) : o;
}
function Ye({
  deviations: e,
  onUndoAll: t,
  onDismiss: o,
  onAiFix: r,
  exhausted: l = !1,
  flat: y = !1
}) {
  const { t: f } = le(), h = e.some((m) => m.field === "引用边"), d = e.some((m) => m.kind === "content"), C = e.some((m) => m.kind !== "content"), p = !!r && (h || d) && !l, u = !!t && C, s = f(d ? "generationCommon.reconcile.contentCaption" : "generationCommon.reconcile.structuralCaption");
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: a("flex flex-col gap-2", y ? "" : "p-3 rounded-nomi border border-nomi-line bg-nomi-paper"),
      "data-reconcile-deviation-card": "true",
      "aria-label": f("generationCommon.reconcile.aria"),
      children: [
        /* @__PURE__ */ n.jsx("div", { className: a("text-caption text-nomi-ink-60"), children: s }),
        /* @__PURE__ */ n.jsx("ul", { className: a("flex flex-col gap-1 list-none p-0 m-0"), children: e.map((m, _) => /* @__PURE__ */ n.jsxs("li", { className: a("flex flex-col gap-[2px] p-2 rounded-nomi-sm bg-nomi-ink-05 text-caption"), children: [
          /* @__PURE__ */ n.jsxs("span", { className: a("text-nomi-ink font-medium"), children: [
            m.where,
            wn(m.field) ? "" : ` · ${Sn(m.field, f)}`
          ] }),
          /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink-60"), children: _n(m, f) })
        ] }, _)) }),
        l ? /* @__PURE__ */ n.jsx("div", { className: a("text-caption text-nomi-ink-40"), children: f("generationCommon.reconcile.exhausted") }) : null,
        /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-wrap items-center gap-2"), children: [
          p ? /* @__PURE__ */ n.jsx(
            F,
            {
              className: a("shrink-0"),
              variant: "accent",
              size: "sm",
              "data-reconcile-ai-fix": "true",
              onClick: r,
              children: f("generationCommon.reconcile.aiFix")
            }
          ) : null,
          /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2 ml-auto"), children: [
            /* @__PURE__ */ n.jsx(F, { className: a("shrink-0"), variant: "default", size: "sm", onClick: o, children: f(u ? "generationCommon.reconcile.keep" : "generationCommon.reconcile.acknowledge") }),
            u ? /* @__PURE__ */ n.jsx(
              F,
              {
                className: a("shrink-0"),
                variant: "primary",
                size: "sm",
                "data-reconcile-undo-all": "true",
                onClick: t,
                children: f("generationCommon.reconcile.undo")
              }
            ) : null
          ] })
        ] })
      ]
    }
  );
}
const $n = new Map(Et.map((e) => [e.id, e.name]));
function Ae(e) {
  const o = V.getState().nodes.find((r) => r.id === e)?.title?.trim();
  return o || null;
}
function Tn(e) {
  const t = e.map(Ae).filter((r) => !!r);
  if (t.length === 0) return "";
  const o = t.slice(0, 3).map((r) => `「${r}」`).join("、");
  return t.length > 3 ? `${o} 等 ${t.length} 个` : o;
}
function Ee(e) {
  return $n.get(e) ?? e;
}
function ot(e) {
  const t = e && typeof e == "object" ? e.kind : void 0;
  return St(t) ? t : "image";
}
function Pe(e, t) {
  const o = t && typeof t == "object" ? t : {};
  if (e === "create_canvas_nodes") {
    const r = Array.isArray(o.nodes) ? o.nodes : [], l = typeof o.summary == "string" ? o.summary : "";
    return `创建 ${r.length} 个节点${l ? `：${l}` : ""}`;
  }
  if (e === "connect_canvas_edges")
    return `连接 ${(Array.isArray(o.edges) ? o.edges : []).length} 条引用线`;
  if (e === "set_node_prompt") {
    const r = o.nodeId ? Ae(String(o.nodeId)) : null;
    return r ? `改写「${r}」的提示词` : "改写节点提示词";
  }
  if (e === "delete_canvas_nodes")
    return `删除 ${(Array.isArray(o.nodeIds) ? o.nodeIds : []).length} 个节点`;
  if (e === "run_generation_batch")
    return `批量生成 ${(Array.isArray(o.nodeIds) ? o.nodeIds : []).length} 个节点（将产生生成费用）`;
  if (e === "read_canvas_state")
    return "读取画布当前状态";
  if (e === "arrange_storyboard_to_timeline") {
    const r = Array.isArray(o.nodeIds) ? o.nodeIds : [];
    return r.length ? `把 ${r.length} 个镜头按剧本时序排入时间轴` : "把整条故事板按剧本时序排入时间轴";
  }
  if (e === "tidy_canvas")
    return `整理${typeof o.categoryId == "string" && o.categoryId ? Ee(o.categoryId) : "当前画布"}（按镜序归位 · ⌘Z 可撤销）`;
  if (e === "create_staging_reference") {
    const r = Array.isArray(o.characters) ? o.characters : [], l = o.camera && typeof o.camera == "object" ? o.camera : {};
    return `建站位参考图（${[
      `${r.length} 角色`,
      typeof o.layout == "string" ? String(o.layout) : null,
      typeof l.shot == "string" ? String(l.shot) : null
    ].filter(Boolean).join(" · ")}）`;
  }
  if (e === "create_camera_move") {
    const r = o.move, l = pn[r] ?? String(o.move ?? "运镜"), y = typeof o.speed == "string" ? o.speed : "medium", f = Ve[y] ?? Ve.medium, h = typeof o.shot == "string" ? o.shot : "medium";
    return `建运镜参考（${l} · ${h} · ≈${f}s）`;
  }
  return e;
}
function Rn(e, t) {
  const o = t && typeof t == "object" ? t : {};
  if (e === "create_canvas_nodes")
    return (Array.isArray(o.nodes) ? o.nodes : []).map((l, y) => {
      const f = l && typeof l == "object" ? l : {}, h = ot(l);
      return `「${typeof f.title == "string" && f.title.trim() ? f.title.trim() : `${wt(h)} ${y + 1}`}」→ ${Ee(Qe(h))}`;
    });
  if (e === "connect_canvas_edges") {
    const r = Array.isArray(o.edges) ? o.edges : [], l = /* @__PURE__ */ new Map();
    for (const f of r) {
      const h = f && typeof f == "object" ? String(f.mode || "reference") : "reference";
      l.set(h, (l.get(h) ?? 0) + 1);
    }
    const y = Array.from(l.entries()).map(([f, h]) => `${_t[f] ?? f} ${h}`);
    return [`连接 ${r.length} 条引用线${y.length ? `（${y.join(" · ")}）` : ""}`];
  }
  return [Pe(e, t)];
}
function Kn(e) {
  const t = /* @__PURE__ */ new Map();
  for (const o of e) {
    if (o.toolName !== "create_canvas_nodes") continue;
    const r = o.effectiveArgs && typeof o.effectiveArgs == "object" ? o.effectiveArgs : {}, l = Array.isArray(r.nodes) ? r.nodes : [];
    for (const y of l) {
      const f = Qe(ot(y));
      t.set(f, (t.get(f) ?? 0) + 1);
    }
  }
  return Array.from(t.entries()).map(([o, r]) => ({
    categoryId: o,
    label: Ee(o),
    count: r
  }));
}
function Dn(e, t) {
  const o = t && typeof t == "object" ? t : {};
  if (e === "connect_canvas_edges")
    return (Array.isArray(o.edges) ? o.edges : []).map((y) => {
      const f = y && typeof y == "object" ? y : {}, h = Ae(String(f.sourceClientId || f.source || "")), d = Ae(String(f.targetClientId || f.target || ""));
      return h && d ? `「${h}」→「${d}」` : null;
    }).filter((y) => !!y).join("，");
  if (e === "set_node_prompt") {
    const r = String(o.prompt || "");
    return r.length > 80 ? `${r.slice(0, 80)}…` : r;
  }
  if (e === "delete_canvas_nodes" || e === "run_generation_batch") {
    const r = Array.isArray(o.nodeIds) ? o.nodeIds.map((l) => String(l)) : [];
    return Tn(r);
  }
  return "";
}
function Ie({ title: e, badge: t, badgeTone: o }) {
  return /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2 min-w-0"), children: [
    /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink text-body-sm font-semibold truncate"), children: e }),
    t ? /* @__PURE__ */ n.jsx(
      "span",
      {
        className: a(
          "text-micro shrink-0",
          o === "done" && "text-workbench-success-ink",
          o === "active" && "text-nomi-accent",
          o === "warn" && "text-[var(--nomi-snap-tag)]"
        ),
        children: t
      }
    ) : null
  ] });
}
function Bn(e) {
  const { t } = le(), { messages: o, staleBoundaryId: r, pendingToolCalls: l } = e, y = [
    t("generationCommon.assistant.suggestionShots"),
    t("generationCommon.assistant.suggestionPrompt"),
    t("generationCommon.assistant.suggestionConnect")
  ], f = v.useMemo(() => bn(l), [l]), h = new Set([f?.createCallId, f?.connectCallId].filter(Boolean)), d = f ? l.filter((i) => !h.has(i.toolCallId)) : l, C = [];
  e.deviationReport ? C.push({
    key: "deviation",
    anchor: e.deviationAnchorId ?? void 0,
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-1"), children: [
      /* @__PURE__ */ n.jsx(
        Ie,
        {
          title: t("generationCommon.assistant.deviationTitle", { count: e.deviationReport.length }),
          badge: "⚠",
          badgeTone: "warn"
        }
      ),
      /* @__PURE__ */ n.jsx(
        Ye,
        {
          flat: !0,
          deviations: e.deviationReport,
          onUndoAll: e.onDeviationUndo,
          onDismiss: e.onDeviationDismiss,
          onAiFix: e.onDeviationAiFix
        }
      )
    ] })
  }) : e.committedProposal && C.push({
    key: `committed-${e.committedProposal.proposalId}`,
    anchor: e.committedProposal.anchorMessageId,
    render: () => /* @__PURE__ */ n.jsx(jn, { flat: !0, record: e.committedProposal })
  }), e.contentDeviations && e.contentDeviations.length > 0 && C.push({
    key: "content-deviation",
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-1"), children: [
      /* @__PURE__ */ n.jsx(
        Ie,
        {
          title: t("generationCommon.assistant.contentDeviationTitle", { count: e.contentDeviations.length }),
          badge: "⚠",
          badgeTone: "warn"
        }
      ),
      /* @__PURE__ */ n.jsx(
        Ye,
        {
          flat: !0,
          deviations: e.contentDeviations,
          exhausted: e.contentExhausted,
          ...e.onContentAiFix ? { onAiFix: e.onContentAiFix } : {},
          onDismiss: e.onContentDismiss ?? (() => {
          })
        }
      )
    ] })
  }), f && C.push({
    key: "plan",
    anchor: l.find((i) => i.toolCallId === f.createCallId)?.anchorMessageId,
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2"), children: [
      /* @__PURE__ */ n.jsx(
        Ie,
        {
          title: t("generationCommon.assistant.createShots", { count: f.nodes.length }),
          badge: t("generationCommon.assistant.awaitingConfirmation"),
          badgeTone: "active"
        }
      ),
      /* @__PURE__ */ n.jsx(Nn, { flat: !0, plan: f, approveCalls: e.approveCalls, rejectCall: e.rejectPending })
    ] })
  });
  for (const i of d) {
    const b = Dn(i.toolName, i.args);
    C.push({
      key: i.toolCallId,
      anchor: i.anchorMessageId,
      render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2"), "data-tool-call-id": i.toolCallId, children: [
        /* @__PURE__ */ n.jsx(
          Ie,
          {
            title: Pe(i.toolName, i.args),
            badge: t("generationCommon.assistant.awaitingConfirmation"),
            badgeTone: "active"
          }
        ),
        b ? /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink-60 text-caption leading-[1.6]"), children: b }) : null,
        /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2"), children: [
          /* @__PURE__ */ n.jsx(F, { variant: "default", size: "sm", onClick: () => e.rejectPending(i.toolCallId), children: t("generationCommon.assistant.reject") }),
          /* @__PURE__ */ n.jsx(
            F,
            {
              variant: "primary",
              size: "sm",
              onClick: () => e.approveCalls([{ toolCallId: i.toolCallId }]),
              children: t("generationCommon.assistant.confirm")
            }
          )
        ] })
      ] })
    });
  }
  if (o.length === 0 && l.length === 0)
    return /* @__PURE__ */ n.jsx("div", { className: a("flex flex-1 flex-col min-h-0 overflow-auto p-4"), children: /* @__PURE__ */ n.jsxs(
      "div",
      {
        className: a(
          "flex flex-1 flex-col items-center justify-center gap-2 max-w-[240px] mx-auto py-6 px-3 text-center"
        ),
        children: [
          /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink font-nomi-display text-title font-medium"), children: t("generationCommon.assistant.emptyTitle") }),
          /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink-60 text-body-sm leading-relaxed"), children: t("generationCommon.assistant.emptyDescription") }),
          /* @__PURE__ */ n.jsx("div", { className: a("flex flex-col gap-1.5 w-full mt-2"), children: y.map((i) => /* @__PURE__ */ n.jsxs(
            F,
            {
              className: a(
                "w-full min-h-9 py-2 px-3 border border-transparent rounded-nomi",
                "flex items-center justify-between gap-2 text-left font-normal",
                "bg-nomi-ink-05 text-nomi-ink-80 cursor-pointer hover:border-nomi-line hover:bg-nomi-paper hover:text-nomi-ink"
              ),
              onClick: () => e.onSuggestion(i),
              children: [
                /* @__PURE__ */ n.jsx("span", { className: a("min-w-0"), children: i }),
                /* @__PURE__ */ n.jsx(Lt, { size: 13, className: a("shrink-0 text-nomi-ink-40") })
              ]
            },
            i
          )) })
        ]
      }
    ) });
  const p = (i) => /* @__PURE__ */ n.jsxs(v.Fragment, { children: [
    /* @__PURE__ */ n.jsx(Ft, { content: i.content, attachments: i.attachments }),
    i.id === r ? /* @__PURE__ */ n.jsx(Fe, {}) : null
  ] }, i.id), u = (i) => {
    const b = i.content === "处理中..." || i.content === t("generationCommon.assistant.processing"), $ = i.status === "error" || i.content.startsWith("（错误）") || i.content.startsWith("(Error)");
    return /* @__PURE__ */ n.jsxs(v.Fragment, { children: [
      $ ? /* @__PURE__ */ n.jsx(Gt, { error: i.content, onRetry: e.onRetry }) : /* @__PURE__ */ n.jsx(
        Ut,
        {
          content: b ? "" : i.content,
          attachments: i.attachments,
          streaming: b,
          pendingLabel: b ? t("generationCommon.assistant.processingShort") : void 0,
          cancelled: i.status === "cancelled"
        }
      ),
      i.id === r ? /* @__PURE__ */ n.jsx(Fe, {}) : null
    ] }, i.id);
  }, s = new Set(o.map((i) => i.id)), m = /* @__PURE__ */ new Map(), _ = [];
  for (const i of C)
    if (i.anchor && s.has(i.anchor)) {
      const b = m.get(i.anchor) ?? [];
      b.push(i), m.set(i.anchor, b);
    } else
      _.push(i);
  const k = (i) => /* @__PURE__ */ n.jsx("div", { children: i.render() }, i.key);
  return /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-1 flex-col min-h-0 overflow-auto p-4 gap-3"), "data-assistant-thread": "true", children: [
    o.map((i) => /* @__PURE__ */ n.jsxs(v.Fragment, { children: [
      i.role === "user" ? p(i) : u(i),
      (m.get(i.id) ?? []).map(k)
    ] }, `row-${i.id}`)),
    _.map(k),
    /* @__PURE__ */ n.jsx("div", { ref: e.threadBottomRef, "aria-hidden": "true" })
  ] });
}
async function zn(e, t) {
  const o = /* @__PURE__ */ new Map();
  for (const r of e) {
    const l = t(r.toolCallId);
    if (!l) continue;
    const y = o.get(l);
    y ? y.push(r) : o.set(l, [r]);
  }
  for (const [r, l] of o)
    await r(l);
}
function ge() {
  return `assistant-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const On = /创建|生成|添加|新增|修改|删除|替换|连接|拆镜头|分镜|节点|我将|我会|我来|计划|操作/, Ln = () => Se.t("generationCommon.assistant.onlyTalkWarning"), Fn = () => Se.t("generationCommon.assistant.truncatedWarning");
function no({
  onCollapsedChange: e
}) {
  const { t } = le(), o = V((c) => c.nodes), r = V((c) => c.edges), l = V((c) => c.selectedNodeIds), y = v.useMemo(() => ee.read_canvas(), [o, r, l]), f = v.useMemo(() => ee.read_selected_nodes(), [o, l]), [h, d] = v.useState(!1), C = v.useRef(null), [p, u] = v.useState("agent"), [s, m] = v.useState([]), [_, k] = v.useState(null), [i, b] = v.useState(null), $ = pe((c) => c.deviations), E = pe((c) => c.exhausted), M = pe((c) => c.consumeRound), x = pe((c) => c.markFixing), N = pe((c) => c.clear), I = Pt(), [X, Y] = v.useState(0), ce = v.useRef(null), Z = v.useRef(/* @__PURE__ */ new Map()), Me = v.useCallback((c, j) => {
    const S = Z.current.get(c);
    Z.current.delete(c), S && S.confirm(j), m((K) => K.filter((se) => se.toolCallId !== c));
  }, []), st = v.useCallback((c) => {
    zn(
      c,
      (j) => Z.current.get(j)?.approveOwner
    );
  }, []), at = v.useCallback(
    (c) => Me(c, { ok: !1, message: "rejected by user" }),
    [Me]
  ), ke = V((c) => c.generationAiDraft), xe = V((c) => c.generationAiMessages), rt = Wt(xe.map((c) => c.id), "generation"), te = V((c) => c.generationAiCollapsed), de = V((c) => c.setGenerationAiDraft), G = V((c) => c.setGenerationAiMessages), [he, it] = v.useState([]), ne = V((c) => c.setGenerationAiCollapsed), {
    isDragging: lt,
    openFilePicker: ct,
    inputRef: dt,
    onInputChange: mt,
    removeAttachment: ft,
    clearAttachments: ye,
    handlePaste: ut,
    dragHandlers: pt
  } = Vt({ setAttachments: it });
  v.useEffect(() => {
    e?.(te);
  }, [te, e]);
  const [$e, gt] = v.useState(!0);
  v.useEffect(() => {
    const c = ce.current;
    if (te || !c || typeof IntersectionObserver > "u") return;
    const j = new IntersectionObserver(([S]) => gt(S.isIntersecting), {
      rootMargin: "0px 0px 80px 0px"
      // 距底 80px 内都算「在底部」
    });
    return j.observe(c), () => j.disconnect();
  }, [te]), v.useEffect(() => {
    te || !$e || ce.current?.scrollIntoView({ block: "end" });
  }, [xe, s, _, te, $e]);
  const oe = v.useCallback((c, j) => {
    G((S) => S.map((K) => K.id === c ? { ...K, content: j } : K));
  }, [G]), me = v.useCallback((c, j) => {
    G((S) => S.map((K) => K.id === c ? { ...K, status: j } : K));
  }, [G]), Ne = v.useCallback((c) => {
    G((j) => j.filter((S) => S.id !== c));
  }, [G]), H = v.useCallback((c, j = {}) => {
    const S = he.filter((z) => z.status === "ready" && z.url);
    if (!c && !S.length || h) return;
    de(""), ye();
    const K = S.map((z) => ({
      url: z.url,
      contentType: z.contentType,
      fileName: z.fileName,
      kind: z.kind
    })), se = ge(), Te = ge();
    G((z) => [
      ...z,
      {
        id: se,
        role: "user",
        content: j.displayMessage || c || "请看这些附件",
        ...S.length ? { attachments: S } : {}
      },
      { id: Te, role: "assistant", content: "处理中...", status: "pending" }
    ]), d(!0), (async () => {
      let z = 0, Re = 0, Ke = !j.requiredTool;
      const De = async (O) => {
        const D = O.map((g) => ({ request: g, call: Z.current.get(g.toolCallId) })).filter((g) => !!g.call);
        if (D.length === 0) return;
        const fe = new Set(D.map((g) => g.request.toolCallId));
        D.forEach((g) => Z.current.delete(g.request.toolCallId)), m((g) => g.filter((A) => !fe.has(A.toolCallId)));
        const ae = D.map(({ request: g, call: A }) => {
          const w = A.args && typeof A.args == "object" ? A.args : {};
          return {
            toolCallId: A.toolCallId,
            toolName: A.toolName,
            effectiveArgs: g.overrides ? { ...w, ...g.overrides } : w,
            overridesDelta: g.overrides,
            transport: A.confirm
          };
        }), P = ae.some(
          (g) => g.toolName === "create_canvas_nodes" && Array.isArray(g.effectiveArgs.nodes) && g.effectiveArgs.nodes.some(
            (A) => A && typeof A == "object" && typeof A.modelKey == "string"
          )
        ) ? new Map((await tt()).map((g) => [g.modelKey, g])) : /* @__PURE__ */ new Map(), Q = ae.map((g) => {
          const A = g.effectiveArgs;
          if (g.toolName !== "create_canvas_nodes" || !Array.isArray(A.nodes)) return g;
          const w = A.nodes.map(
            (B) => B && typeof B == "object" ? dn(B, P) : B
          );
          return { ...g, effectiveArgs: { ...A, nodes: w } };
        }), ue = /* @__PURE__ */ new Map();
        for (const g of Q) {
          const A = g.effectiveArgs;
          if (!(g.toolName !== "create_canvas_nodes" || !Array.isArray(A.nodes)))
            for (const w of A.nodes)
              w && typeof w == "object" && typeof w.clientId == "string" && ue.set(w.clientId, {
                id: w.clientId,
                kind: w.kind,
                meta: typeof w.modelKey == "string" ? { modelKey: w.modelKey } : {}
              });
        }
        const J = new Map(ee.read_canvas().nodes.map((g) => [g.id, g])), bt = (g) => ue.get(g) ?? J.get(g) ?? null, W = Q.map((g) => {
          const A = g.effectiveArgs;
          if (!Array.isArray(A.edges)) return g;
          const { connectable: w } = Bt(A.edges, bt);
          return { ...g, effectiveArgs: { ...A, edges: w } };
        }), R = await vn(
          W.map(({ toolCallId: g, toolName: A, effectiveArgs: w }) => ({ toolCallId: g, toolName: A, effectiveArgs: w }))
        );
        if (R.status === "committed") {
          z += W.length;
          const g = W.flatMap((w) => {
            if (w.toolName !== "create_canvas_nodes") return [];
            const B = w.effectiveArgs;
            return Array.isArray(B.nodes) ? B.nodes.flatMap((L) => {
              const ze = typeof L.prompt == "string" ? L.prompt.trim() : "";
              return ze ? [{
                kind: L.kind === "character" ? "character" : L.kind === "scene" ? "scene" : L.kind === "video" ? "video_prompt" : "image_prompt",
                title: typeof L.title == "string" ? L.title : "",
                prompt: ze
              }] : [];
            }) : [];
          });
          g.length > 0 && cn(g).catch(() => {
          });
          const A = D.map((w) => w.call.anchorMessageId).find(Boolean) ?? null;
          if (R.reconciliation.ok || (k(R.reconciliation.deviations), b(A)), R.compensation.length > 0) {
            const w = Kn(W), B = {
              proposalId: R.proposalId,
              summary: W.map((L) => Pe(L.toolName, L.effectiveArgs)).join(" · "),
              // A16:逐节点「标题 → 落点分类」明细,不再与 summary 同句重复。
              stepLabels: W.flatMap((L) => Rn(L.toolName, L.effectiveArgs)),
              ...w.length ? { categoryCounts: w } : {},
              compensation: R.compensation,
              watchNodes: R.watchNodes,
              reconciliationOk: R.reconciliation.ok,
              ...A ? { anchorMessageId: A } : {}
            };
            zt(B);
          }
          for (let w = 0; w < W.length; w += 1) {
            const B = W[w];
            await B.transport({
              ok: !0,
              result: R.results[w],
              effectiveArgs: B.effectiveArgs,
              ...B.overridesDelta ? { overridesDelta: B.overridesDelta } : {},
              proposalId: R.proposalId
            });
          }
        } else
          for (let g = 0; g < W.length; g += 1) {
            const A = g === R.failedIndex ? R.reason : g < R.failedIndex ? `已回滚:第 ${R.failedIndex + 1} 步(${W[R.failedIndex].toolName})失败——${R.reason}` : `未执行:第 ${R.failedIndex + 1} 步失败,整批已回滚`;
            await W[g].transport({ ok: !1, message: A });
          }
      };
      let T = Te, U = "", Be = se, q = null;
      const yt = () => {
        q = null, T !== null && oe(T, U || "处理中...");
      }, vt = () => {
        const O = ge();
        T = O, U = "", G((D) => [...D, { id: O, role: "assistant", content: "处理中...", status: "streaming" }]);
      }, Ct = () => {
        T !== null && (q !== null && (cancelAnimationFrame(q), q = null), U.trim() === "" ? Ne(T) : (oe(T, U), me(T, "done")), T = null, U = "");
      };
      try {
        const O = await qt({
          message: c || "请看这些附件",
          ...K.length ? { attachments: K } : {},
          snapshot: y,
          selectedNodes: f,
          mode: p,
          skill: j.skill,
          ...j.employeeKey ? {
            agentPreference: { vendorKey: "platform-employee", modelKey: j.employeeKey }
          } : {},
          ...j.requiredTool ? { requiredTool: j.requiredTool } : {},
          onContent: (P) => {
            T === null && vt(), U === "" && (Be = T), U += P, q === null && (q = requestAnimationFrame(yt));
          },
          onCancelReady: (P) => {
            C.current = P;
          },
          onToolCall: (P) => {
            Re += 1, P.toolName === j.requiredTool && (Ke = !0);
            const Q = Ht({ kind: "tool-call", toolName: P.toolName, args: P.args }, Jt());
            if (Q.outcome === "deny") {
              P.confirm({ ok: !1, message: Q.reason, denied: !0 });
              return;
            }
            if (Q.outcome === "allow") {
              (async () => {
                try {
                  const J = await et(P.toolName, P.args);
                  await P.confirm({ ok: !0, result: J, silent: !0 });
                } catch (J) {
                  await P.confirm({ ok: !1, message: J instanceof Error ? J.message : String(J) });
                }
              })();
              return;
            }
            const ue = {
              toolCallId: P.toolCallId,
              toolName: P.toolName,
              args: P.args,
              confirm: P.confirm,
              approveOwner: De,
              anchorMessageId: Be
            };
            Z.current.set(P.toolCallId, ue), m((J) => [...J, ue]), Ct(), j.autoApproveSafeWrites && (/* @__PURE__ */ new Set([
              "create_canvas_nodes",
              "connect_canvas_edges",
              "create_staging_reference",
              "create_camera_move",
              "set_node_prompt"
            ])).has(P.toolName) && Promise.resolve().then(() => De([{ toolCallId: P.toolCallId }]));
          }
        });
        if (!Ke)
          throw new Error(`本步骤没有执行 ${j.requiredTool}，系统已拦截“只说不做”，请重试当前步骤。`);
        q !== null && cancelAnimationFrame(q);
        const D = O.response.text?.trim() || "", fe = Re === 0 && p === "agent" && On.test(D), ae = O.response.finishReason === "length" && D !== "", ve = (P) => `${P}${fe ? Ln() : ""}${ae ? Fn() : ""}`;
        if (T !== null && U.trim() !== "")
          oe(T, ve(U)), me(T, "done");
        else if (T !== null)
          z > 0 ? Ne(T) : (oe(T, ve(D || "已完成。")), me(T, "done"));
        else if (z === 0) {
          const P = ge();
          G((Q) => [...Q, { id: P, role: "assistant", content: ve(D || "已完成。"), status: "done" }]);
        }
      } catch (O) {
        q !== null && cancelAnimationFrame(q);
        const D = `生成区 Agent 执行失败：${O instanceof Error && O.message ? O.message : "未知错误"}`;
        if (T !== null)
          oe(T, U ? `${U}

${D}` : D), me(T, "error");
        else {
          const fe = ge();
          G((ae) => [...ae, { id: fe, role: "assistant", content: D, status: "error" }]);
        }
      } finally {
        d(!1), C.current = null, Y((O) => O + 1);
      }
    })();
  }, [he, h, ye, p, Ne, f, de, G, me, y, oe]), xt = (c) => {
    c.preventDefault(), H(ke.trim());
  };
  v.useEffect(() => {
    const c = (j) => {
      const K = j.detail?.storyText?.trim() || "";
      if (!K) return;
      ne(!1);
      const se = sn(K);
      H(se, {
        skill: an,
        displayMessage: `💄 定妆

${K}`
      });
    };
    return window.addEventListener(Ge, c), () => window.removeEventListener(Ge, c);
  }, [ne, H]), v.useEffect(() => {
    const c = (S) => {
      S && (Ot({ vendorKey: "platform-employee", modelKey: S.employeeKey }), u("agent"), ne(!1), H(S.prompt, {
        displayMessage: S.displayMessage,
        autoApproveSafeWrites: S.autoApproveSafeWrites,
        employeeKey: S.employeeKey,
        requiredTool: S.requiredTool
      }));
    }, j = (S) => {
      He(), c(S.detail);
    };
    return window.addEventListener(qe, j), c(He()), () => window.removeEventListener(qe, j);
  }, [ne, H]);
  const ht = v.useCallback(() => {
    Z.current.clear(), m([]), k(null), b(null), Mt("generation"), de(""), ye(), $t(Tt("generation"));
  }, [ye, de]);
  return v.useEffect(() => () => {
    Z.current.clear();
  }, []), te ? /* @__PURE__ */ n.jsx(
    "aside",
    {
      className: a(
        "generation-canvas-v2-assistant",
        "block w-auto h-auto rounded-full"
      ),
      "data-collapsed": "true",
      "aria-label": t("generationCommon.assistant.launcherAria"),
      children: /* @__PURE__ */ n.jsx(
        F,
        {
          className: a(
            "generation-canvas-v2-assistant__launcher",
            "inline-flex items-center gap-2 h-9 pl-[10px] pr-[14px]",
            "border border-nomi-line rounded-full",
            "bg-nomi-paper text-nomi-ink font-[inherit] text-body-sm font-medium",
            "shadow-nomi-sm cursor-pointer",
            "hover:shadow-nomi-md hover:-translate-y-px"
          ),
          onClick: () => ne(!1),
          children: /* @__PURE__ */ n.jsx(Rt, { markSize: 18, wordSize: 13, suffix: "生成" })
        }
      )
    }
  ) : /* @__PURE__ */ n.jsxs(
    "aside",
    {
      className: a(
        "generation-canvas-v2-assistant",
        // flexbox 而非 grid-rows-[…minmax(0,1fr)…] 任意值——后者在本环境解析异常，
        // 把工具条行撑成 145px 留出 ~120px 空白（用户反馈"上面空这么大"的真凶）。
        // 停靠展开时外层 grid 列宽从 0 动到目标宽；面板本体固定按目标宽排版并贴右侧，
        // 只让外层裁切露出，避免文字在 20px→340px 的中间宽度里反复换行。
        "relative flex flex-col w-[var(--generation-assistant-target-width,340px)] h-full justify-self-end",
        "max-h-none min-w-[var(--generation-assistant-target-width,340px)] min-h-0 overflow-hidden",
        "border-0 rounded-none bg-nomi-paper shadow-none",
        "max-[900px]:w-[min(340px,calc(100vw-28px))]",
        "max-[900px]:min-w-0",
        "max-[900px]:max-h-[calc(100vh-var(--workbench-topbar-height)-var(--workbench-timeline-height)-32px)]",
        "max-[900px]:border max-[900px]:border-nomi-line max-[900px]:rounded-nomi max-[900px]:shadow-nomi-lg"
      ),
      "data-collapsed": "false",
      "aria-label": t("generationCommon.assistant.panelAria"),
      ...pt,
      children: [
        lt ? /* @__PURE__ */ n.jsxs(
          "div",
          {
            className: a(
              "absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none",
              "rounded-nomi border-2 border-dashed border-nomi-accent bg-nomi-accent-soft",
              "text-body-sm font-semibold text-nomi-accent"
            ),
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ n.jsx(Ue, { size: 26, stroke: 1.5 }),
              /* @__PURE__ */ n.jsx("div", { children: t("generationCommon.assistant.dropAttachments") }),
              /* @__PURE__ */ n.jsx("div", { className: a("text-micro font-normal text-nomi-ink-60"), children: t("generationCommon.assistant.attachmentLimits") })
            ]
          }
        ) : null,
        /* @__PURE__ */ n.jsxs("header", { className: a(
          "flex items-center justify-between gap-2 px-3 py-2",
          "border-b border-nomi-line-soft bg-nomi-paper"
        ), children: [
          /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2 min-w-0"), children: [
            /* @__PURE__ */ n.jsx(Kt, { size: 18 }),
            /* @__PURE__ */ n.jsx("span", { className: a("text-body-sm font-semibold text-nomi-ink"), children: t("generationCommon.assistant.title") })
          ] }),
          /* @__PURE__ */ n.jsxs("div", { className: a("inline-flex items-center gap-2 ml-auto min-w-0"), children: [
            /* @__PURE__ */ n.jsx(
              Xt,
              {
                area: "generation",
                className: a("generation-canvas-v2-assistant__shared-actions", "inline-flex items-center flex-nowrap gap-1"),
                actionClassName: a(
                  "size-6 inline-grid place-items-center",
                  "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                ),
                onNewConversation: ht
              }
            ),
            /* @__PURE__ */ n.jsx(
              be,
              {
                className: a(
                  "size-6 inline-grid place-items-center",
                  "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                ),
                label: t("generationCommon.assistant.collapse"),
                onClick: () => ne(!0),
                icon: /* @__PURE__ */ n.jsx(Dt, { size: 14 })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ n.jsx(Yt, { refreshKey: X }),
        /* @__PURE__ */ n.jsx(
          Bn,
          {
            messages: xe,
            staleBoundaryId: rt,
            onSuggestion: H,
            pendingToolCalls: s,
            approveCalls: st,
            rejectPending: at,
            committedProposal: I,
            deviationReport: _,
            deviationAnchorId: i,
            onDeviationUndo: () => {
              I ? Ze(I) : V.getState().undo(), k(null), b(null);
            },
            onRetry: () => {
              const c = [...xe].reverse().find((j) => j.role === "user");
              c && H(c.content);
            },
            onDeviationDismiss: () => {
              k(null), b(null);
            },
            onDeviationAiFix: () => {
              H(
                "刚才有几条参考连接没接上（所选模型不支持那种连接方式）。请先读画布，把这些没连上的参考连接，用所选模型支持的连接方式重连；如果模型确实不支持，就换成支持的模型再连。"
              ), k(null), b(null);
            },
            contentDeviations: $,
            contentExhausted: E,
            onContentAiFix: () => {
              M() && (H(gn($)), x());
            },
            onContentDismiss: () => N(),
            threadBottomRef: ce
          }
        ),
        /* @__PURE__ */ n.jsxs(
          "form",
          {
            className: a("grid gap-1 p-3 border-t border-nomi-line-soft bg-nomi-paper"),
            onSubmit: xt,
            children: [
              /* @__PURE__ */ n.jsx(
                "input",
                {
                  ref: dt,
                  type: "file",
                  multiple: !0,
                  accept: Zt,
                  className: "hidden",
                  "aria-hidden": "true",
                  tabIndex: -1,
                  onChange: mt
                }
              ),
              /* @__PURE__ */ n.jsx(Qt, { attachments: he, onRemove: ft, className: a("mb-1") }),
              /* @__PURE__ */ n.jsx(
                en,
                {
                  className: a(
                    // 对齐样张 .input：带边框圆角输入盒。
                    "min-h-14 px-2 py-2 rounded-nomi",
                    "border border-nomi-line focus:border-nomi-accent",
                    "bg-nomi-paper text-nomi-ink text-body-sm leading-[1.45]",
                    "placeholder:text-nomi-ink-40"
                  ),
                  "aria-label": t("generationCommon.assistant.inputAria"),
                  placeholder: t("generationCommon.assistant.placeholder"),
                  value: ke,
                  onChange: (c) => de(c.target.value),
                  onKeyDown: (c) => tn(c, () => {
                    c.currentTarget.form?.requestSubmit();
                  }),
                  onPaste: ut
                }
              ),
              /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center justify-between gap-2"), children: [
                /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2 flex-1 min-w-0"), children: [
                  /* @__PURE__ */ n.jsx(
                    be,
                    {
                      type: "button",
                      className: a(
                        "size-7 grid place-items-center shrink-0",
                        "border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                        "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                      ),
                      label: t("generationCommon.assistant.addAttachment"),
                      "aria-label": t("generationCommon.assistant.addAttachmentAria"),
                      onClick: ct,
                      icon: /* @__PURE__ */ n.jsx(Ue, { size: 16 })
                    }
                  ),
                  /* @__PURE__ */ n.jsx(
                    ln,
                    {
                      ariaLabel: t("generationCommon.assistant.modeAria"),
                      leadingLabel: t("generationCommon.assistant.modeLeading"),
                      size: "sm",
                      value: p,
                      options: [
                        { value: "agent", label: "Agent" },
                        { value: "chat", label: t("generationCommon.assistant.chat") },
                        { value: "refine", label: t("generationCommon.assistant.refine") }
                      ],
                      onChange: (c) => u(c)
                    }
                  ),
                  /* @__PURE__ */ n.jsx(nn, { className: "h-7" })
                ] }),
                h ? /* @__PURE__ */ n.jsx(
                  be,
                  {
                    type: "button",
                    onClick: () => C.current?.(),
                    className: a(
                      "size-7 grid place-items-center shrink-0",
                      "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                      "hover:enabled:bg-nomi-accent"
                    ),
                    label: t("generationCommon.assistant.stop"),
                    "aria-label": t("generationCommon.assistant.stopAria"),
                    icon: /* @__PURE__ */ n.jsx(rn, { size: 13 })
                  }
                ) : /* @__PURE__ */ n.jsx(
                  be,
                  {
                    type: "submit",
                    className: a(
                      "size-7 grid place-items-center shrink-0",
                      "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                      "hover:enabled:bg-nomi-accent",
                      "disabled:bg-nomi-ink-20 disabled:text-nomi-ink-40 disabled:cursor-not-allowed"
                    ),
                    disabled: !ke.trim() && !he.some((c) => c.status === "ready"),
                    label: t("generationCommon.assistant.send"),
                    "aria-label": t("generationCommon.assistant.sendAria"),
                    icon: /* @__PURE__ */ n.jsx(on, { size: 15 })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
export {
  no as default
};
