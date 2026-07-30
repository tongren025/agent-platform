import { bK as bt, cE as Ct, c_ as ve, dY as Ne, b0 as It, ah as kt, b1 as Ke, bX as Se, S as y, dV as ie, c8 as n, aJ as a, a8 as L, dW as ze, aZ as At, d9 as He, bo as Xe, bw as jt, E as Nt, c1 as wt, dK as V, B as _t, dD as St, cx as Et, dg as $t, dn as Mt, aE as Pt, d$ as Rt, N as Tt, K as Dt, a9 as be, x as Bt } from "./agentStudioMount-CP7x4OcS.js";
import { I as Kt, U as zt, S as Oe, A as Ot, a as Ft, m as Lt, u as Ut, s as Gt, k as Wt, j as Vt, f as Fe, g as Le, W as Jt, M as Ht, C as Xt, c as Yt, d as qt, l as Zt, b as Qt, h as en, i as tn, F as nn } from "./useComposerAttachments-BYQbp2IE.js";
import { I as on } from "./IconSettings-cTVIxxbi.js";
import { N as sn } from "./NomiSelect-l9fMiLNK.js";
import { r as an } from "./promptLearningApi-CtoVWXNr.js";
import { g as Z } from "./trajectoryLayout-ROrP_lkV.js";
import { a as Ye, l as qe, r as rn } from "./applyCanvasToolCall-BSuSR_kC.js";
import { f as ln, n as Ue } from "./referenceSlots-lwV8_4-H.js";
import { I as cn, a as dn } from "./IconChevronRight-CtUKyzdC.js";
import { CAMERA_MOVE_LABEL as mn, CAMERA_SPEED_DURATION as Ge } from "./cameraMoveVocab-CkwMRCGZ.js";
import { d as fe, b as fn } from "./batchPlanPreview-CZirgCW1.js";
const un = {
  unsupported_reference: "所选模型不支持这种参考连接",
  source_not_referenceable: "源节点没有可作参考的产物",
  dangling: "连接的一端节点找不到"
}, ae = (e) => e && typeof e == "object" ? e : {};
function pn(e) {
  const t = [], s = new Map(e.nodes.map((d) => [d.id, d])), r = (d) => e.clientIdToNodeId[d] ?? e.resolveExternalId?.(d) ?? d, c = (d) => {
    const v = s.get(d)?.title;
    return typeof v == "string" && v.trim() ? v.trim() : d;
  }, b = (d, v) => `「${c(d)}」→「${c(v)}」`, f = (d) => {
    const v = /* @__PURE__ */ new Map(), p = ae(d).skippedEdges;
    if (Array.isArray(p))
      for (const u of p) {
        const o = ae(u), m = String(o.source || "").trim(), w = String(o.target || "").trim();
        m && w && v.set(`${m}→${w}`, String(o.reason || ""));
      }
    return v;
  }, h = (d, v) => {
    for (const p of d) {
      const u = ae(p), o = r(String(u.sourceClientId || u.source || "").trim()), m = r(String(u.targetClientId || u.target || "").trim());
      if (!o || !m) continue;
      const w = e.edges.find((i) => i.source === o && i.target === m);
      if (!w) {
        const i = v.get(`${o}→${m}`);
        t.push({
          where: b(o, m),
          field: "引用边",
          expected: "已连接",
          actual: "未连接",
          ...i ? { reason: un[i] ?? i } : {}
        });
        continue;
      }
      const A = typeof u.mode == "string" && u.mode ? u.mode : void 0;
      A && (w.mode ?? "reference") !== A && t.push({ where: b(o, m), field: "边语义", expected: A, actual: w.mode ?? "(通用参考)" });
    }
  };
  for (const d of e.steps) {
    if (d.toolName === "create_canvas_nodes") {
      (Array.isArray(d.effectiveArgs.nodes) ? d.effectiveArgs.nodes : []).forEach((p, u) => {
        const o = ae(p), m = typeof o.clientId == "string" && o.clientId ? o.clientId : `#${u + 1}`, w = typeof o.title == "string" && o.title.trim() ? o.title.trim() : m, A = e.clientIdToNodeId[m], i = A ? s.get(A) : void 0;
        if (!i) {
          t.push({ where: w, field: "节点", expected: "已创建", actual: "不存在" });
          return;
        }
        typeof o.kind == "string" && o.kind !== i.kind && t.push({ where: w, field: "类型", expected: o.kind, actual: i.kind }), typeof o.prompt == "string" && o.prompt !== (i.prompt ?? "") && t.push({ where: w, field: "提示词", expected: o.prompt, actual: i.prompt ?? "" }), typeof o.title == "string" && o.title.trim() && o.title.trim() !== i.title && t.push({ where: w, field: "标题", expected: o.title.trim(), actual: i.title });
        const C = ae(i.meta);
        typeof o.modelKey == "string" && o.modelKey.trim() && C.modelKey !== o.modelKey.trim() && t.push({ where: w, field: "模型", expected: o.modelKey.trim(), actual: C.modelKey ?? "(回退自动选)" });
        const E = ae(o.params);
        for (const [_, S] of Object.entries(E))
          typeof S != "string" && typeof S != "number" && typeof S != "boolean" || typeof o.modelKey == "string" && C.modelKey === o.modelKey.trim() && C[_] !== S && t.push({ where: w, field: `参数 ${_}`, expected: S, actual: C[_] ?? "(默认值)" });
      }), h(Array.isArray(d.effectiveArgs.edges) ? d.effectiveArgs.edges : [], f(d.result));
      continue;
    }
    if (d.toolName === "connect_canvas_edges") {
      h(Array.isArray(d.effectiveArgs.edges) ? d.effectiveArgs.edges : [], f(d.result));
      continue;
    }
    if (d.toolName === "set_node_prompt") {
      const v = r(String(d.effectiveArgs.nodeId || "").trim()), p = typeof d.effectiveArgs.prompt == "string" ? d.effectiveArgs.prompt : "", u = s.get(v);
      u ? (u.prompt ?? "") !== p && t.push({ where: u.title || v, field: "提示词", expected: p, actual: u.prompt ?? "" }) : t.push({ where: v, field: "节点", expected: "存在", actual: "不存在" });
      continue;
    }
    if (d.toolName === "delete_canvas_nodes") {
      const v = Array.isArray(d.effectiveArgs.nodeIds) ? d.effectiveArgs.nodeIds : [];
      for (const p of v) {
        const u = r(String(p || "").trim());
        u && s.has(u) && t.push({ where: u, field: "节点", expected: "已删除", actual: "仍存在" });
      }
      continue;
    }
  }
  return e.auditOrphanArrayReferences && t.push(...e.auditOrphanArrayReferences(e.nodes, e.edges)), { ok: t.length === 0, deviations: t };
}
function gn() {
  return `prop_${crypto.randomUUID().slice(0, 10)}`;
}
async function xn(e) {
  const t = gn(), s = {
    source: "agent",
    txnId: `txn_${t}`,
    proposalId: t,
    suppressUndoBarriers: !0
  }, r = bt();
  Ct();
  const c = [], b = {}, f = [], h = [];
  for (let o = 0; o < e.length; o += 1) {
    const m = e[o], w = h.length;
    try {
      const A = Z.read_canvas();
      if (m.toolName === "set_node_prompt") {
        const C = ve(String(m.effectiveArgs.nodeId || "").trim()), E = A.nodes.find((_) => _.id === C);
        E && h.push({ kind: "restore-prompt", nodeId: C, prompt: E.prompt || "" });
      }
      if (m.toolName === "delete_canvas_nodes") {
        const C = new Set(
          (Array.isArray(m.effectiveArgs.nodeIds) ? m.effectiveArgs.nodeIds : []).map((S) => ve(String(S || "").trim())).filter(Boolean)
        ), E = A.nodes.filter((S) => C.has(S.id)), _ = A.edges.filter((S) => C.has(S.source) || C.has(S.target));
        E.length && h.push({
          kind: "restore-graph",
          nodes: JSON.parse(JSON.stringify(E)),
          edges: JSON.parse(JSON.stringify(_))
        });
      }
      const i = await Ye(m.toolName, m.effectiveArgs, s);
      if (m.toolName === "create_canvas_nodes" && i && typeof i == "object") {
        const C = i;
        if (Array.isArray(C.createdNodeIds)) {
          const E = C.createdNodeIds.filter((_) => typeof _ == "string");
          c.push(...E), E.length && h.push({ kind: "delete-nodes", nodeIds: E });
        }
        Object.assign(b, C.clientIdToNodeId ?? {});
      }
      if (m.toolName === "connect_canvas_edges" || m.toolName === "create_canvas_nodes" && Array.isArray(m.effectiveArgs.edges) && m.effectiveArgs.edges.length) {
        const C = new Set(A.edges.map((_) => `${_.source}→${_.target}`)), E = Z.read_canvas().edges.filter((_) => !C.has(`${_.source}→${_.target}`)).map((_) => ({ source: _.source, target: _.target }));
        E.length && h.push({ kind: "disconnect-edges", pairs: E });
      }
      f.push(i);
    } catch (A) {
      const i = A instanceof Error && A.message ? A.message : String(A);
      h.length = w;
      const C = new Set(Z.read_canvas().nodes.map((S) => S.id));
      h.length && Ne(s, () => kt(h));
      const E = new Set(Z.read_canvas().nodes.map((S) => S.id)), _ = c.filter((S) => C.has(S) && !E.has(S));
      return It(r), Ne(
        s,
        () => Ke([
          {
            type: "agent.txn.aborted",
            payload: {
              proposalId: t,
              reason: i,
              failedToolCallId: m.toolCallId,
              failedToolName: m.toolName,
              failedIndex: o,
              stepCount: e.length,
              compensatedNodeIds: _
            }
          }
        ])
      ), { status: "aborted", proposalId: t, failedIndex: o, reason: i, compensatedNodeIds: _ };
    }
  }
  const d = Z.read_canvas(), v = pn({
    steps: e.map((o, m) => ({
      toolName: o.toolName,
      effectiveArgs: o.effectiveArgs,
      result: f[m]
    })),
    clientIdToNodeId: b,
    nodes: d.nodes,
    edges: d.edges,
    // 跨提议 clientId 回退：与执行侧同一个全局 registry（修对账误报「未连接」，bug A）。
    resolveExternalId: ve,
    // 地基收口（§1c+§1d）：显示出的数组参考必须有对应已提交边，无边有图的 meta-only 孤儿如实报。
    // snapshot.nodes/edges 是完整 GenerationCanvasNode/Edge（read_canvas 后态），findOrphanArrayReferences
    // 需要完整图类型——在此适配 reconcile 的结构化 NodeLike/EdgeLike 注入签名。
    auditOrphanArrayReferences: () => ln(d.nodes, d.edges)
  });
  Ne(
    s,
    () => Ke([
      {
        type: "agent.txn.committed",
        payload: {
          proposalId: t,
          steps: e.map((o) => ({ toolCallId: o.toolCallId, toolName: o.toolName })),
          ...Object.keys(b).length ? { clientIdToNodeId: b } : {},
          reconciliation: {
            ok: v.ok,
            // payload ≤4KB 纪律:偏差列表截前 20 条(全量进 outcome 给 UI)。
            deviations: v.deviations.slice(0, 20)
          }
        }
      }
    ])
  );
  const p = new Set(c);
  for (const o of e)
    o.toolName === "set_node_prompt" && p.add(ve(String(o.effectiveArgs.nodeId || "").trim()));
  const u = d.nodes.filter((o) => p.has(o.id)).map((o) => ({ nodeId: o.id, title: o.title, prompt: o.prompt || "" }));
  return { status: "committed", proposalId: t, results: f, clientIdToNodeId: b, reconciliation: v, compensation: h, watchNodes: u };
}
function hn(e) {
  const t = {};
  for (const [s, r] of Object.entries(e))
    (typeof r == "string" || typeof r == "number" || typeof r == "boolean") && (t[s] = r);
  return t;
}
function We(e) {
  return e.kind === "character" || e.kind === "scene" ? "reference" : e.kind === "image" ? "keyframe" : e.kind === "video" ? "video" : null;
}
function Ve(e, t) {
  return e.mode === "first_frame" && t.get(e.sourceClientId) === "video" && t.get(e.targetClientId) === "video";
}
function yn(e) {
  const t = e.find((p) => p.toolName === "create_canvas_nodes");
  if (!t) return null;
  const s = t.args && typeof t.args == "object" ? t.args : {}, r = Array.isArray(s.nodes) ? s.nodes : [];
  if (r.length === 0) return null;
  const c = r.map((p, u) => {
    const o = p && typeof p == "object" ? p : {}, m = o.position && typeof o.position == "object" ? o.position : null;
    return {
      clientId: typeof o.clientId == "string" && o.clientId.trim() ? o.clientId : `n${u + 1}`,
      kind: typeof o.kind == "string" ? o.kind : "image",
      title: typeof o.title == "string" ? o.title : Se.t("generationCommon.agentRuntime.shotTitle", { index: u + 1 }),
      prompt: typeof o.prompt == "string" ? o.prompt : "",
      ...m && typeof m.x == "number" && typeof m.y == "number" ? { position: { x: m.x, y: m.y } } : {},
      ...typeof o.modelKey == "string" && o.modelKey.trim() ? { modelKey: o.modelKey.trim() } : {},
      ...typeof o.modeId == "string" && o.modeId.trim() ? { modeId: o.modeId.trim() } : {},
      ...o.params && typeof o.params == "object" && !Array.isArray(o.params) ? { params: hn(o.params) } : {}
    };
  }), b = (p) => p.map((u) => u && typeof u == "object" ? u : {}).map((u) => ({
    sourceClientId: String(u.sourceClientId || u.source || "").trim(),
    targetClientId: String(u.targetClientId || u.target || "").trim(),
    ...typeof u.mode == "string" && u.mode ? { mode: u.mode } : {}
  })).filter((u) => u.sourceClientId && u.targetClientId), f = b(Array.isArray(s.edges) ? s.edges : []), h = [...f], d = e.find((p) => p.toolName === "connect_canvas_edges");
  if (d) {
    const p = d.args && typeof d.args == "object" ? d.args : {}, u = new Set(h.map((o) => `${o.sourceClientId}→${o.targetClientId}`));
    for (const o of b(Array.isArray(p.edges) ? p.edges : []))
      u.has(`${o.sourceClientId}→${o.targetClientId}`) || h.push(o);
  }
  return {
    summary: typeof s.summary == "string" && s.summary.trim() ? s.summary.trim() : `${c.length} 个镜头 + ${h.length} 条引用边`,
    nodes: c,
    edges: h,
    createEdges: f,
    createCallId: t.toolCallId,
    connectCallId: d?.toolCallId ?? null
  };
}
const we = (e) => `${e.sourceClientId}→${e.targetClientId}`;
function vn(e, t) {
  if (!e.modelKey) return null;
  const s = e.params ?? {}, r = Ue(s.aspect_ratio) ?? Ue(s.size) ?? void 0, c = typeof s.resolution == "string" ? s.resolution : void 0;
  return {
    modelLabel: t.get(e.modelKey)?.label ?? e.modelKey,
    aspect: r,
    resolution: c
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
function bn({
  node: e,
  index: t,
  numbered: s,
  refTitles: r,
  chips: c,
  prompt: b,
  onPromptChange: f
}) {
  const { t: h } = ie(), [d, v] = y.useState(!1);
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
            onClick: () => v((p) => !p),
            children: [
              s ? /* @__PURE__ */ n.jsx(
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
        c ? /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-[6px] flex-wrap", s && "pl-7"), "data-plan-node-chips": "true", children: [
          /* @__PURE__ */ n.jsx(_e, { value: c.modelLabel }),
          c.aspect ? /* @__PURE__ */ n.jsx(_e, { label: h("generationCommon.agentPlan.aspect"), value: c.aspect }) : null,
          c.resolution ? /* @__PURE__ */ n.jsx(_e, { label: h("generationCommon.agentPlan.resolution"), value: c.resolution }) : null
        ] }) : null,
        d ? /* @__PURE__ */ n.jsx(
          "textarea",
          {
            className: a(
              "w-full min-h-[46px] p-2 rounded-nomi-sm",
              "border border-nomi-line-soft bg-nomi-paper text-nomi-ink-80 text-caption leading-[1.5] resize-y outline-0",
              "hover:border-nomi-line focus:border-nomi-accent focus:text-nomi-ink",
              s && "ml-7 w-[calc(100%-1.75rem)]"
            ),
            "aria-label": h("generationCommon.agentPlan.editNamedPrompt", { title: e.title }),
            value: b,
            autoFocus: !0,
            onChange: (p) => f(p.target.value)
          }
        ) : /* @__PURE__ */ n.jsx(
          "div",
          {
            className: a(
              "text-nomi-ink-60 text-caption overflow-hidden text-ellipsis whitespace-nowrap",
              s && "pl-7"
            ),
            "aria-hidden": "true",
            children: b
          }
        )
      ]
    }
  );
}
function Cn({ plan: e, approveCalls: t, rejectCall: s, flat: r = !1 }) {
  const { t: c } = ie(), [b, f] = y.useState(() => {
    const x = {};
    return e.nodes.forEach((j) => {
      x[j.clientId] = j.prompt;
    }), x;
  }), [h, d] = y.useState(/* @__PURE__ */ new Map());
  y.useEffect(() => {
    let x = !0;
    return qe().then((j) => {
      x && d(new Map(j.map((I) => [I.modelKey, I])));
    }).catch(() => {
    }), () => {
      x = !1;
    };
  }, []);
  const v = y.useMemo(() => new Map(e.nodes.map((x) => [x.clientId, x])), [e.nodes]), p = y.useMemo(
    () => new Map(e.nodes.map((x) => [x.clientId, x.kind])),
    [e.nodes]
  ), u = y.useMemo(
    () => e.createEdges.filter((x) => Ve(x, p)),
    [e.createEdges, p]
  ), [o, m] = y.useState(() => {
    const x = {};
    for (const j of u) x[we(j)] = !0;
    return x;
  }), w = e.nodes.map(We), A = !w.includes(null) && new Set(w).size >= 2, i = A ? ["reference", "keyframe", "video"].map((x) => ({ layer: x, nodes: e.nodes.filter((j) => We(j) === x) })).filter((x) => x.nodes.length > 0) : [], C = y.useCallback(
    (x) => A ? e.edges.filter(
      (j) => j.targetClientId === x && j.mode !== "first_frame" && v.has(j.sourceClientId)
    ).map((j) => (v.get(j.sourceClientId)?.title || j.sourceClientId).replace(/^(角色|场景|道具)[：:]\s*/, "").slice(0, 8)) : [],
    [A, e.edges, v]
  ), E = y.useCallback(() => {
    const x = e.nodes.map((I) => ({
      clientId: I.clientId,
      kind: I.kind,
      title: I.title,
      prompt: b[I.clientId] ?? I.prompt,
      ...I.position ? { position: I.position } : {},
      // bug①：把 agent 建议的模型/参数透传给执行层（确认后写入 node.meta）。
      ...I.modelKey ? { modelKey: I.modelKey } : {},
      ...I.modeId ? { modeId: I.modeId } : {},
      ...I.params ? { params: I.params } : {}
    })), j = e.createEdges.filter(
      (I) => !Ve(I, p) || o[we(I)] !== !1
    );
    t([
      {
        toolCallId: e.createCallId,
        overrides: {
          nodes: x,
          summary: e.summary,
          ...e.createEdges.length ? { edges: j } : {}
        }
      },
      ...e.connectCallId ? [{ toolCallId: e.connectCallId }] : []
    ]);
  }, [b, e, t, p, o]), _ = y.useCallback(() => {
    s(e.createCallId), e.connectCallId && s(e.connectCallId);
  }, [e, s]), S = (x, j, I) => /* @__PURE__ */ n.jsx(
    bn,
    {
      node: x,
      index: j,
      numbered: I,
      refTitles: C(x.clientId),
      chips: vn(x, h),
      prompt: b[x.clientId] ?? x.prompt,
      onPromptChange: (H) => f((X) => ({ ...X, [x.clientId]: H }))
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
      "aria-label": c("generationCommon.agentPlan.cardAria"),
      children: [
        r ? null : /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink text-body font-medium leading-snug"), children: e.summary }),
        A ? /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-3"), children: [
          i.map((x) => /* @__PURE__ */ n.jsxs("section", { className: a("flex flex-col gap-[6px]"), "data-plan-layer": x.layer, children: [
            /* @__PURE__ */ n.jsxs("div", { className: a("text-nomi-ink-60 text-micro font-semibold"), children: [
              c(`generationCommon.agentPlan.${x.layer}`),
              " ",
              /* @__PURE__ */ n.jsxs("span", { className: a("text-nomi-ink-40 font-medium"), children: [
                "×",
                x.nodes.length
              ] })
            ] }),
            /* @__PURE__ */ n.jsx("ol", { className: a("flex flex-col gap-2 list-none p-0 m-0"), children: x.nodes.map((j, I) => S(j, I, !1)) })
          ] }, x.layer)),
          u.length > 0 ? /* @__PURE__ */ n.jsxs("section", { className: a("flex flex-col gap-[6px]"), "data-plan-layer": "relay", children: [
            /* @__PURE__ */ n.jsxs("div", { className: a("text-nomi-ink-60 text-micro font-semibold"), children: [
              c("generationCommon.agentPlan.relay"),
              " ",
              /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink-40 font-medium"), children: c("generationCommon.agentPlan.optional") })
            ] }),
            u.map((x) => {
              const j = we(x), I = o[j] !== !1, H = (X) => (v.get(X)?.title || X).replace(/\s*(视频|video).*$/i, "");
              return /* @__PURE__ */ n.jsxs(
                "label",
                {
                  className: a(
                    "flex items-start gap-2 p-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line-soft cursor-pointer"
                  ),
                  "data-plan-relay-edge": j,
                  children: [
                    /* @__PURE__ */ n.jsx(
                      "input",
                      {
                        type: "checkbox",
                        className: a("mt-[2px] accent-[var(--nomi-accent)]"),
                        checked: I,
                        "aria-label": c("generationCommon.agentPlan.enableRelay", {
                          source: H(x.sourceClientId),
                          target: H(x.targetClientId)
                        }),
                        onChange: (X) => m((le) => ({ ...le, [j]: X.target.checked }))
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
                            H(x.sourceClientId),
                            " → ",
                            H(x.targetClientId)
                          ]
                        }
                      ),
                      /* @__PURE__ */ n.jsx("span", { className: a("text-micro text-nomi-ink-40"), children: c(I ? "generationCommon.agentPlan.relayEnabled" : "generationCommon.agentPlan.relayDisabled") })
                    ] })
                  ]
                },
                j
              );
            })
          ] }) : null
        ] }) : /* @__PURE__ */ n.jsx(
          "ol",
          {
            className: a("flex flex-col gap-2 list-none p-0 m-0"),
            "aria-label": c("generationCommon.agentPlan.pendingShots"),
            children: e.nodes.map((x, j) => S(x, j, !0))
          }
        ),
        /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-wrap items-center justify-end gap-2"), children: [
          /* @__PURE__ */ n.jsx(L, { className: a("shrink-0"), variant: "default", size: "md", onClick: _, children: c("generationCommon.agentPlan.rejectAll") }),
          /* @__PURE__ */ n.jsx(
            L,
            {
              className: a("shrink-0"),
              variant: "primary",
              size: "md",
              "data-plan-confirm-all": "true",
              onClick: E,
              children: c("generationCommon.agentPlan.confirmAll")
            }
          )
        ] })
      ]
    }
  );
}
const In = y.memo(Cn);
function kn({
  record: e,
  onUndone: t,
  flat: s = !1
}) {
  const { t: r } = ie(), [c, b] = y.useState(!1), [f, h] = y.useState(null), d = ze((o) => o.setActiveCategoryId), v = ze((o) => o.activeCategoryId), p = (e.categoryCounts ?? []).filter((o) => o.count > 0), u = () => {
    const o = At(e);
    if (o.length && f === null) {
      h(o);
      return;
    }
    He(e), t?.();
  };
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: a(
        "flex flex-col gap-2",
        s ? "" : "p-3 rounded-nomi border border-nomi-line-soft bg-nomi-ink-05/60"
      ),
      "data-committed-proposal-card": e.proposalId,
      children: [
        /* @__PURE__ */ n.jsxs("div", { className: a("flex items-start gap-1.5 min-w-0"), children: [
          /* @__PURE__ */ n.jsx("span", { className: a("shrink-0 text-caption text-workbench-success-ink"), children: "✓" }),
          /* @__PURE__ */ n.jsx("span", { className: a("min-w-0 text-caption text-nomi-ink-80 leading-[1.55]"), children: r("generationCommon.committedProposal.applied", { summary: e.summary }) }),
          e.reconciliationOk ? null : /* @__PURE__ */ n.jsx("span", { className: a("shrink-0 text-caption text-[var(--nomi-snap-tag)]"), children: r("generationCommon.committedProposal.mismatch") })
        ] }),
        p.length > 0 ? /* @__PURE__ */ n.jsx("div", { className: a("flex flex-wrap items-center gap-1"), children: p.map((o) => /* @__PURE__ */ n.jsxs(
          "button",
          {
            type: "button",
            "data-proposal-category-jump": o.categoryId,
            className: a(
              "inline-flex items-center h-5 px-2 rounded-full border text-micro cursor-pointer",
              o.categoryId === v ? "border-nomi-line-soft bg-nomi-ink-05 text-nomi-ink-60 cursor-default" : "border-nomi-line bg-nomi-paper text-nomi-ink-80 hover:bg-nomi-ink-05"
            ),
            onClick: () => d(o.categoryId),
            children: [
              o.label,
              " ",
              o.count
            ]
          },
          o.categoryId
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
              onClick: () => b((o) => !o),
              children: [
                c ? /* @__PURE__ */ n.jsx(cn, { size: 12, stroke: 1.8 }) : /* @__PURE__ */ n.jsx(dn, { size: 12, stroke: 1.8 }),
                r("generationCommon.committedProposal.viewSteps")
              ]
            }
          ),
          /* @__PURE__ */ n.jsx(
            L,
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
        c ? /* @__PURE__ */ n.jsx("ol", { className: a("flex flex-col gap-1 list-none p-0 m-0"), children: e.stepLabels.map((o, m) => /* @__PURE__ */ n.jsxs("li", { className: a("text-caption text-nomi-ink-60"), children: [
          m + 1,
          ". ",
          o
        ] }, m)) }) : null,
        f ? /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2 p-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line"), children: [
          /* @__PURE__ */ n.jsx("span", { className: a("text-caption font-medium text-[var(--nomi-snap-tag)]"), children: r("generationCommon.committedProposal.lostEdits") }),
          f.map((o, m) => /* @__PURE__ */ n.jsxs("span", { className: a("text-caption text-nomi-ink-80"), children: [
            "· ",
            o
          ] }, m)),
          /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center justify-end gap-2"), children: [
            /* @__PURE__ */ n.jsx(L, { variant: "default", size: "sm", onClick: () => h(null), children: r("generationCommon.committedProposal.cancel") }),
            /* @__PURE__ */ n.jsx(L, { variant: "primary", size: "sm", "data-proposal-undo-confirm": "true", onClick: u, children: r("generationCommon.committedProposal.confirmUndo") })
          ] })
        ] }) : null
      ]
    }
  );
}
const Ze = (e, t = 40) => {
  const s = typeof e == "string" ? e : JSON.stringify(e);
  return s.length > t ? `${s.slice(0, t)}…` : s;
}, An = (e) => e === "引用边" || e === "边语义";
function jn(e, t) {
  return e.kind === "content" ? e.reason ? String(e.reason) : t("generationCommon.reconcile.contentMismatch", { actual: Ze(e.actual) }) : e.field === "引用边" ? e.reason ? t("generationCommon.reconcile.edgeReason", { reason: Sn(e.reason, t) }) : t("generationCommon.reconcile.edgeMissing") : e.field === "边语义" ? t("generationCommon.reconcile.edgeSemantics", {
    actual: re(e.actual, t),
    expected: re(e.expected, t)
  }) : e.field === "节点" ? t("generationCommon.reconcile.nodeChange", {
    expected: re(e.expected, t),
    actual: re(e.actual, t)
  }) : t("generationCommon.reconcile.approvedActual", {
    expected: re(e.expected, t),
    actual: re(e.actual, t)
  });
}
function Nn(e, t) {
  return e === "引用边" ? t("generationCommon.reconcile.fields.referenceEdge") : e === "边语义" ? t("generationCommon.reconcile.fields.edgeSemantics") : e === "节点" ? t("generationCommon.reconcile.fields.node") : e === "类型" ? t("generationCommon.reconcile.fields.type") : e === "提示词" ? t("generationCommon.reconcile.fields.prompt") : e === "标题" ? t("generationCommon.reconcile.fields.title") : e === "模型" ? t("generationCommon.reconcile.fields.model") : e.startsWith("参数 ") ? t("generationCommon.reconcile.fields.parameter", { name: e.slice(3) }) : e.startsWith("数组参考槽 ") ? t("generationCommon.reconcile.fields.arrayReferenceSlot", { name: e.slice(6) }) : e;
}
const wn = {
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
}, _n = {
  所选模型不支持这种参考连接: "unsupportedReference",
  源节点没有可作参考的产物: "sourceNotReferenceable",
  连接的一端节点找不到: "dangling"
};
function re(e, t) {
  const s = Ze(e), r = wn[s];
  return r ? t(`generationCommon.reconcile.values.${r}`) : s;
}
function Sn(e, t) {
  const s = String(e ?? ""), r = _n[s];
  return r ? t(`generationCommon.reconcile.reasons.${r}`) : s;
}
function Je({
  deviations: e,
  onUndoAll: t,
  onDismiss: s,
  onAiFix: r,
  exhausted: c = !1,
  flat: b = !1
}) {
  const { t: f } = ie(), h = e.some((m) => m.field === "引用边"), d = e.some((m) => m.kind === "content"), v = e.some((m) => m.kind !== "content"), p = !!r && (h || d) && !c, u = !!t && v, o = f(d ? "generationCommon.reconcile.contentCaption" : "generationCommon.reconcile.structuralCaption");
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: a("flex flex-col gap-2", b ? "" : "p-3 rounded-nomi border border-nomi-line bg-nomi-paper"),
      "data-reconcile-deviation-card": "true",
      "aria-label": f("generationCommon.reconcile.aria"),
      children: [
        /* @__PURE__ */ n.jsx("div", { className: a("text-caption text-nomi-ink-60"), children: o }),
        /* @__PURE__ */ n.jsx("ul", { className: a("flex flex-col gap-1 list-none p-0 m-0"), children: e.map((m, w) => /* @__PURE__ */ n.jsxs("li", { className: a("flex flex-col gap-[2px] p-2 rounded-nomi-sm bg-nomi-ink-05 text-caption"), children: [
          /* @__PURE__ */ n.jsxs("span", { className: a("text-nomi-ink font-medium"), children: [
            m.where,
            An(m.field) ? "" : ` · ${Nn(m.field, f)}`
          ] }),
          /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink-60"), children: jn(m, f) })
        ] }, w)) }),
        c ? /* @__PURE__ */ n.jsx("div", { className: a("text-caption text-nomi-ink-40"), children: f("generationCommon.reconcile.exhausted") }) : null,
        /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-wrap items-center gap-2"), children: [
          p ? /* @__PURE__ */ n.jsx(
            L,
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
            /* @__PURE__ */ n.jsx(L, { className: a("shrink-0"), variant: "default", size: "sm", onClick: s, children: f(u ? "generationCommon.reconcile.keep" : "generationCommon.reconcile.acknowledge") }),
            u ? /* @__PURE__ */ n.jsx(
              L,
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
const En = new Map(_t.map((e) => [e.id, e.name]));
function Ie(e) {
  const s = V.getState().nodes.find((r) => r.id === e)?.title?.trim();
  return s || null;
}
function $n(e) {
  const t = e.map(Ie).filter((r) => !!r);
  if (t.length === 0) return "";
  const s = t.slice(0, 3).map((r) => `「${r}」`).join("、");
  return t.length > 3 ? `${s} 等 ${t.length} 个` : s;
}
function Ee(e) {
  return En.get(e) ?? e;
}
function Qe(e) {
  const t = e && typeof e == "object" ? e.kind : void 0;
  return wt(t) ? t : "image";
}
function $e(e, t) {
  const s = t && typeof t == "object" ? t : {};
  if (e === "create_canvas_nodes") {
    const r = Array.isArray(s.nodes) ? s.nodes : [], c = typeof s.summary == "string" ? s.summary : "";
    return `创建 ${r.length} 个节点${c ? `：${c}` : ""}`;
  }
  if (e === "connect_canvas_edges")
    return `连接 ${(Array.isArray(s.edges) ? s.edges : []).length} 条引用线`;
  if (e === "set_node_prompt") {
    const r = s.nodeId ? Ie(String(s.nodeId)) : null;
    return r ? `改写「${r}」的提示词` : "改写节点提示词";
  }
  if (e === "delete_canvas_nodes")
    return `删除 ${(Array.isArray(s.nodeIds) ? s.nodeIds : []).length} 个节点`;
  if (e === "run_generation_batch")
    return `批量生成 ${(Array.isArray(s.nodeIds) ? s.nodeIds : []).length} 个节点（将产生生成费用）`;
  if (e === "read_canvas_state")
    return "读取画布当前状态";
  if (e === "arrange_storyboard_to_timeline") {
    const r = Array.isArray(s.nodeIds) ? s.nodeIds : [];
    return r.length ? `把 ${r.length} 个镜头按剧本时序排入时间轴` : "把整条故事板按剧本时序排入时间轴";
  }
  if (e === "tidy_canvas")
    return `整理${typeof s.categoryId == "string" && s.categoryId ? Ee(s.categoryId) : "当前画布"}（按镜序归位 · ⌘Z 可撤销）`;
  if (e === "create_staging_reference") {
    const r = Array.isArray(s.characters) ? s.characters : [], c = s.camera && typeof s.camera == "object" ? s.camera : {};
    return `建站位参考图（${[
      `${r.length} 角色`,
      typeof s.layout == "string" ? String(s.layout) : null,
      typeof c.shot == "string" ? String(c.shot) : null
    ].filter(Boolean).join(" · ")}）`;
  }
  if (e === "create_camera_move") {
    const r = s.move, c = mn[r] ?? String(s.move ?? "运镜"), b = typeof s.speed == "string" ? s.speed : "medium", f = Ge[b] ?? Ge.medium, h = typeof s.shot == "string" ? s.shot : "medium";
    return `建运镜参考（${c} · ${h} · ≈${f}s）`;
  }
  return e;
}
function Mn(e, t) {
  const s = t && typeof t == "object" ? t : {};
  if (e === "create_canvas_nodes")
    return (Array.isArray(s.nodes) ? s.nodes : []).map((c, b) => {
      const f = c && typeof c == "object" ? c : {}, h = Qe(c);
      return `「${typeof f.title == "string" && f.title.trim() ? f.title.trim() : `${jt(h)} ${b + 1}`}」→ ${Ee(Xe(h))}`;
    });
  if (e === "connect_canvas_edges") {
    const r = Array.isArray(s.edges) ? s.edges : [], c = /* @__PURE__ */ new Map();
    for (const f of r) {
      const h = f && typeof f == "object" ? String(f.mode || "reference") : "reference";
      c.set(h, (c.get(h) ?? 0) + 1);
    }
    const b = Array.from(c.entries()).map(([f, h]) => `${Nt[f] ?? f} ${h}`);
    return [`连接 ${r.length} 条引用线${b.length ? `（${b.join(" · ")}）` : ""}`];
  }
  return [$e(e, t)];
}
function Pn(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    if (s.toolName !== "create_canvas_nodes") continue;
    const r = s.effectiveArgs && typeof s.effectiveArgs == "object" ? s.effectiveArgs : {}, c = Array.isArray(r.nodes) ? r.nodes : [];
    for (const b of c) {
      const f = Xe(Qe(b));
      t.set(f, (t.get(f) ?? 0) + 1);
    }
  }
  return Array.from(t.entries()).map(([s, r]) => ({
    categoryId: s,
    label: Ee(s),
    count: r
  }));
}
function Rn(e, t) {
  const s = t && typeof t == "object" ? t : {};
  if (e === "connect_canvas_edges")
    return (Array.isArray(s.edges) ? s.edges : []).map((b) => {
      const f = b && typeof b == "object" ? b : {}, h = Ie(String(f.sourceClientId || f.source || "")), d = Ie(String(f.targetClientId || f.target || ""));
      return h && d ? `「${h}」→「${d}」` : null;
    }).filter((b) => !!b).join("，");
  if (e === "set_node_prompt") {
    const r = String(s.prompt || "");
    return r.length > 80 ? `${r.slice(0, 80)}…` : r;
  }
  if (e === "delete_canvas_nodes" || e === "run_generation_batch") {
    const r = Array.isArray(s.nodeIds) ? s.nodeIds.map((c) => String(c)) : [];
    return $n(r);
  }
  return "";
}
function Ce({ title: e, badge: t, badgeTone: s }) {
  return /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2 min-w-0"), children: [
    /* @__PURE__ */ n.jsx("span", { className: a("text-nomi-ink text-body-sm font-semibold truncate"), children: e }),
    t ? /* @__PURE__ */ n.jsx(
      "span",
      {
        className: a(
          "text-micro shrink-0",
          s === "done" && "text-workbench-success-ink",
          s === "active" && "text-nomi-accent",
          s === "warn" && "text-[var(--nomi-snap-tag)]"
        ),
        children: t
      }
    ) : null
  ] });
}
function Tn(e) {
  const { t } = ie(), { messages: s, staleBoundaryId: r, pendingToolCalls: c } = e, b = [
    t("generationCommon.assistant.suggestionShots"),
    t("generationCommon.assistant.suggestionPrompt"),
    t("generationCommon.assistant.suggestionConnect")
  ], f = y.useMemo(() => yn(c), [c]), h = new Set([f?.createCallId, f?.connectCallId].filter(Boolean)), d = f ? c.filter((i) => !h.has(i.toolCallId)) : c, v = [];
  e.deviationReport ? v.push({
    key: "deviation",
    anchor: e.deviationAnchorId ?? void 0,
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-1"), children: [
      /* @__PURE__ */ n.jsx(
        Ce,
        {
          title: t("generationCommon.assistant.deviationTitle", { count: e.deviationReport.length }),
          badge: "⚠",
          badgeTone: "warn"
        }
      ),
      /* @__PURE__ */ n.jsx(
        Je,
        {
          flat: !0,
          deviations: e.deviationReport,
          onUndoAll: e.onDeviationUndo,
          onDismiss: e.onDeviationDismiss,
          onAiFix: e.onDeviationAiFix
        }
      )
    ] })
  }) : e.committedProposal && v.push({
    key: `committed-${e.committedProposal.proposalId}`,
    anchor: e.committedProposal.anchorMessageId,
    render: () => /* @__PURE__ */ n.jsx(kn, { flat: !0, record: e.committedProposal })
  }), e.contentDeviations && e.contentDeviations.length > 0 && v.push({
    key: "content-deviation",
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-1"), children: [
      /* @__PURE__ */ n.jsx(
        Ce,
        {
          title: t("generationCommon.assistant.contentDeviationTitle", { count: e.contentDeviations.length }),
          badge: "⚠",
          badgeTone: "warn"
        }
      ),
      /* @__PURE__ */ n.jsx(
        Je,
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
  }), f && v.push({
    key: "plan",
    anchor: c.find((i) => i.toolCallId === f.createCallId)?.anchorMessageId,
    render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2"), children: [
      /* @__PURE__ */ n.jsx(
        Ce,
        {
          title: t("generationCommon.assistant.createShots", { count: f.nodes.length }),
          badge: t("generationCommon.assistant.awaitingConfirmation"),
          badgeTone: "active"
        }
      ),
      /* @__PURE__ */ n.jsx(In, { flat: !0, plan: f, approveCalls: e.approveCalls, rejectCall: e.rejectPending })
    ] })
  });
  for (const i of d) {
    const C = Rn(i.toolName, i.args);
    v.push({
      key: i.toolCallId,
      anchor: i.anchorMessageId,
      render: () => /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-col gap-2"), "data-tool-call-id": i.toolCallId, children: [
        /* @__PURE__ */ n.jsx(
          Ce,
          {
            title: $e(i.toolName, i.args),
            badge: t("generationCommon.assistant.awaitingConfirmation"),
            badgeTone: "active"
          }
        ),
        C ? /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink-60 text-caption leading-[1.6]"), children: C }) : null,
        /* @__PURE__ */ n.jsxs("div", { className: a("flex items-center gap-2"), children: [
          /* @__PURE__ */ n.jsx(L, { variant: "default", size: "sm", onClick: () => e.rejectPending(i.toolCallId), children: t("generationCommon.assistant.reject") }),
          /* @__PURE__ */ n.jsx(
            L,
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
  if (s.length === 0 && c.length === 0)
    return /* @__PURE__ */ n.jsx("div", { className: a("flex flex-1 flex-col min-h-0 overflow-auto p-4"), children: /* @__PURE__ */ n.jsxs(
      "div",
      {
        className: a(
          "flex flex-1 flex-col items-center justify-center gap-2 max-w-[240px] mx-auto py-6 px-3 text-center"
        ),
        children: [
          /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink font-nomi-display text-title font-medium"), children: t("generationCommon.assistant.emptyTitle") }),
          /* @__PURE__ */ n.jsx("div", { className: a("text-nomi-ink-60 text-body-sm leading-relaxed"), children: t("generationCommon.assistant.emptyDescription") }),
          /* @__PURE__ */ n.jsx("div", { className: a("flex flex-col gap-1.5 w-full mt-2"), children: b.map((i) => /* @__PURE__ */ n.jsxs(
            L,
            {
              className: a(
                "w-full min-h-9 py-2 px-3 border border-transparent rounded-nomi",
                "flex items-center justify-between gap-2 text-left font-normal",
                "bg-nomi-ink-05 text-nomi-ink-80 cursor-pointer hover:border-nomi-line hover:bg-nomi-paper hover:text-nomi-ink"
              ),
              onClick: () => e.onSuggestion(i),
              children: [
                /* @__PURE__ */ n.jsx("span", { className: a("min-w-0"), children: i }),
                /* @__PURE__ */ n.jsx(Kt, { size: 13, className: a("shrink-0 text-nomi-ink-40") })
              ]
            },
            i
          )) })
        ]
      }
    ) });
  const p = (i) => /* @__PURE__ */ n.jsxs(y.Fragment, { children: [
    /* @__PURE__ */ n.jsx(zt, { content: i.content, attachments: i.attachments }),
    i.id === r ? /* @__PURE__ */ n.jsx(Oe, {}) : null
  ] }, i.id), u = (i) => {
    const C = i.content === "处理中..." || i.content === t("generationCommon.assistant.processing"), E = i.status === "error" || i.content.startsWith("（错误）") || i.content.startsWith("(Error)");
    return /* @__PURE__ */ n.jsxs(y.Fragment, { children: [
      E ? /* @__PURE__ */ n.jsx(Ot, { error: i.content, onRetry: e.onRetry }) : /* @__PURE__ */ n.jsx(
        Ft,
        {
          content: C ? "" : i.content,
          attachments: i.attachments,
          streaming: C,
          pendingLabel: C ? t("generationCommon.assistant.processingShort") : void 0,
          cancelled: i.status === "cancelled"
        }
      ),
      i.id === r ? /* @__PURE__ */ n.jsx(Oe, {}) : null
    ] }, i.id);
  }, o = new Set(s.map((i) => i.id)), m = /* @__PURE__ */ new Map(), w = [];
  for (const i of v)
    if (i.anchor && o.has(i.anchor)) {
      const C = m.get(i.anchor) ?? [];
      C.push(i), m.set(i.anchor, C);
    } else
      w.push(i);
  const A = (i) => /* @__PURE__ */ n.jsx("div", { children: i.render() }, i.key);
  return /* @__PURE__ */ n.jsxs("div", { className: a("flex flex-1 flex-col min-h-0 overflow-auto p-4 gap-3"), "data-assistant-thread": "true", children: [
    s.map((i) => /* @__PURE__ */ n.jsxs(y.Fragment, { children: [
      i.role === "user" ? p(i) : u(i),
      (m.get(i.id) ?? []).map(A)
    ] }, `row-${i.id}`)),
    w.map(A),
    /* @__PURE__ */ n.jsx("div", { ref: e.threadBottomRef, "aria-hidden": "true" })
  ] });
}
function ue() {
  return `assistant-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const Dn = /创建|生成|添加|新增|修改|删除|替换|连接|拆镜头|分镜|节点|我将|我会|我来|计划|操作/, Bn = () => Se.t("generationCommon.assistant.onlyTalkWarning"), Kn = () => Se.t("generationCommon.assistant.truncatedWarning");
function qn({
  onCollapsedChange: e
}) {
  const { t } = ie(), s = V((l) => l.nodes), r = V((l) => l.edges), c = V((l) => l.selectedNodeIds), b = y.useMemo(() => Z.read_canvas(), [s, r, c]), f = y.useMemo(() => Z.read_selected_nodes(), [s, c]), [h, d] = y.useState(!1), v = y.useRef(null), [p, u] = y.useState("agent"), [o, m] = y.useState([]), [w, A] = y.useState(null), [i, C] = y.useState(null), E = fe((l) => l.deviations), _ = fe((l) => l.exhausted), S = fe((l) => l.consumeRound), x = fe((l) => l.markFixing), j = fe((l) => l.clear), I = St(), [H, X] = y.useState(0), le = y.useRef(null), Q = y.useRef(/* @__PURE__ */ new Map()), Me = y.useCallback((l, P) => {
    const T = Q.current.get(l);
    Q.current.delete(l), T && T.confirm(P), m((D) => D.filter((oe) => oe.toolCallId !== l));
  }, []), ke = y.useRef(null), et = y.useCallback((l) => {
    ke.current?.(l);
  }, []), tt = y.useCallback(
    (l) => Me(l, { ok: !1, message: "rejected by user" }),
    [Me]
  ), nt = y.useRef({
    enqueue: (l) => {
      Q.current.set(l.toolCallId, l), m((P) => [...P, l]);
    },
    clear: () => {
      Q.current.clear(), m([]);
    }
  }), Ae = V((l) => l.generationAiDraft), pe = V((l) => l.generationAiMessages), ot = Lt(pe.map((l) => l.id), "generation"), ee = V((l) => l.generationAiCollapsed), ce = V((l) => l.setGenerationAiDraft), U = V((l) => l.setGenerationAiMessages), [ge, st] = y.useState([]), xe = V((l) => l.setGenerationAiCollapsed), {
    isDragging: at,
    openFilePicker: rt,
    inputRef: it,
    onInputChange: lt,
    removeAttachment: ct,
    clearAttachments: he,
    handlePaste: dt,
    dragHandlers: mt
  } = Ut({ setAttachments: st });
  y.useEffect(() => {
    e?.(ee);
  }, [ee, e]);
  const [Pe, ft] = y.useState(!0);
  y.useEffect(() => {
    const l = le.current;
    if (ee || !l || typeof IntersectionObserver > "u") return;
    const P = new IntersectionObserver(([T]) => ft(T.isIntersecting), {
      rootMargin: "0px 0px 80px 0px"
      // 距底 80px 内都算「在底部」
    });
    return P.observe(l), () => P.disconnect();
  }, [ee]), y.useEffect(() => {
    ee || !Pe || le.current?.scrollIntoView({ block: "end" });
  }, [pe, o, w, ee, Pe]);
  const ne = y.useCallback((l, P) => {
    U((T) => T.map((D) => D.id === l ? { ...D, content: P } : D));
  }, [U]), de = y.useCallback((l, P) => {
    U((T) => T.map((D) => D.id === l ? { ...D, status: P } : D));
  }, [U]), je = y.useCallback((l) => {
    U((P) => P.filter((T) => T.id !== l));
  }, [U]), te = y.useCallback((l, P = {}) => {
    const T = ge.filter((z) => z.status === "ready" && z.url);
    if (!l && !T.length || h) return;
    ce(""), he();
    const D = T.map((z) => ({
      url: z.url,
      contentType: z.contentType,
      fileName: z.fileName,
      kind: z.kind
    })), oe = ue(), Re = ue();
    U((z) => [
      ...z,
      {
        id: oe,
        role: "user",
        content: P.displayMessage || l || "请看这些附件",
        ...T.length ? { attachments: T } : {}
      },
      { id: Re, role: "assistant", content: "处理中...", status: "pending" }
    ]), d(!0), (async () => {
      let z = 0, Te = 0;
      ke.current = async (O) => {
        const B = O.map((g) => ({ request: g, call: Q.current.get(g.toolCallId) })).filter((g) => !!g.call);
        if (B.length === 0) return;
        const me = new Set(B.map((g) => g.request.toolCallId));
        B.forEach((g) => Q.current.delete(g.request.toolCallId)), m((g) => g.filter((k) => !me.has(k.toolCallId)));
        const se = B.map(({ request: g, call: k }) => {
          const N = k.args && typeof k.args == "object" ? k.args : {};
          return {
            toolCallId: k.toolCallId,
            toolName: k.toolName,
            effectiveArgs: g.overrides ? { ...N, ...g.overrides } : N,
            overridesDelta: g.overrides,
            transport: k.confirm
          };
        }), $ = se.some(
          (g) => g.toolName === "create_canvas_nodes" && Array.isArray(g.effectiveArgs.nodes) && g.effectiveArgs.nodes.some(
            (k) => k && typeof k == "object" && typeof k.modelKey == "string"
          )
        ) ? new Map((await qe()).map((g) => [g.modelKey, g])) : /* @__PURE__ */ new Map(), Y = se.map((g) => {
          const k = g.effectiveArgs;
          if (g.toolName !== "create_canvas_nodes" || !Array.isArray(k.nodes)) return g;
          const N = k.nodes.map(
            (K) => K && typeof K == "object" ? rn(K, $) : K
          );
          return { ...g, effectiveArgs: { ...k, nodes: N } };
        }), q = /* @__PURE__ */ new Map();
        for (const g of Y) {
          const k = g.effectiveArgs;
          if (!(g.toolName !== "create_canvas_nodes" || !Array.isArray(k.nodes)))
            for (const N of k.nodes)
              N && typeof N == "object" && typeof N.clientId == "string" && q.set(N.clientId, {
                id: N.clientId,
                kind: N.kind,
                meta: typeof N.modelKey == "string" ? { modelKey: N.modelKey } : {}
              });
        }
        const yt = new Map(Z.read_canvas().nodes.map((g) => [g.id, g])), vt = (g) => q.get(g) ?? yt.get(g) ?? null, W = Y.map((g) => {
          const k = g.effectiveArgs;
          if (!Array.isArray(k.edges)) return g;
          const { connectable: N } = Et(k.edges, vt);
          return { ...g, effectiveArgs: { ...k, edges: N } };
        }), R = await xn(
          W.map(({ toolCallId: g, toolName: k, effectiveArgs: N }) => ({ toolCallId: g, toolName: k, effectiveArgs: N }))
        );
        if (R.status === "committed") {
          z += W.length;
          const g = W.flatMap((N) => {
            if (N.toolName !== "create_canvas_nodes") return [];
            const K = N.effectiveArgs;
            return Array.isArray(K.nodes) ? K.nodes.flatMap((F) => {
              const Be = typeof F.prompt == "string" ? F.prompt.trim() : "";
              return Be ? [{
                kind: F.kind === "character" ? "character" : F.kind === "scene" ? "scene" : F.kind === "video" ? "video_prompt" : "image_prompt",
                title: typeof F.title == "string" ? F.title : "",
                prompt: Be
              }] : [];
            }) : [];
          });
          g.length > 0 && an(g).catch(() => {
          });
          const k = B.map((N) => N.call.anchorMessageId).find(Boolean) ?? null;
          if (R.reconciliation.ok || (A(R.reconciliation.deviations), C(k)), R.compensation.length > 0) {
            const N = Pn(W), K = {
              proposalId: R.proposalId,
              summary: W.map((F) => $e(F.toolName, F.effectiveArgs)).join(" · "),
              // A16:逐节点「标题 → 落点分类」明细,不再与 summary 同句重复。
              stepLabels: W.flatMap((F) => Mn(F.toolName, F.effectiveArgs)),
              ...N.length ? { categoryCounts: N } : {},
              compensation: R.compensation,
              watchNodes: R.watchNodes,
              reconciliationOk: R.reconciliation.ok,
              ...k ? { anchorMessageId: k } : {}
            };
            $t(K);
          }
          for (let N = 0; N < W.length; N += 1) {
            const K = W[N];
            await K.transport({
              ok: !0,
              result: R.results[N],
              effectiveArgs: K.effectiveArgs,
              ...K.overridesDelta ? { overridesDelta: K.overridesDelta } : {},
              proposalId: R.proposalId
            });
          }
        } else
          for (let g = 0; g < W.length; g += 1) {
            const k = g === R.failedIndex ? R.reason : g < R.failedIndex ? `已回滚:第 ${R.failedIndex + 1} 步(${W[R.failedIndex].toolName})失败——${R.reason}` : `未执行:第 ${R.failedIndex + 1} 步失败,整批已回滚`;
            await W[g].transport({ ok: !1, message: k });
          }
      };
      let M = Re, G = "", De = oe, J = null;
      const gt = () => {
        J = null, M !== null && ne(M, G || "处理中...");
      }, xt = () => {
        const O = ue();
        M = O, G = "", U((B) => [...B, { id: O, role: "assistant", content: "处理中...", status: "streaming" }]);
      }, ht = () => {
        M !== null && (J !== null && (cancelAnimationFrame(J), J = null), G.trim() === "" ? je(M) : (ne(M, G), de(M, "done")), M = null, G = "");
      };
      try {
        const O = await Gt({
          message: l || "请看这些附件",
          ...D.length ? { attachments: D } : {},
          snapshot: b,
          selectedNodes: f,
          mode: p,
          skill: P.skill,
          onContent: ($) => {
            M === null && xt(), G === "" && (De = M), G += $, J === null && (J = requestAnimationFrame(gt));
          },
          onCancelReady: ($) => {
            v.current = $;
          },
          onToolCall: ($) => {
            Te += 1;
            const Y = Wt({ kind: "tool-call", toolName: $.toolName, args: $.args }, Vt());
            if (Y.outcome === "deny") {
              $.confirm({ ok: !1, message: Y.reason, denied: !0 });
              return;
            }
            if (Y.outcome === "allow") {
              (async () => {
                try {
                  const q = await Ye($.toolName, $.args);
                  await $.confirm({ ok: !0, result: q, silent: !0 });
                } catch (q) {
                  await $.confirm({ ok: !1, message: q instanceof Error ? q.message : String(q) });
                }
              })();
              return;
            }
            nt.current.enqueue({
              toolCallId: $.toolCallId,
              toolName: $.toolName,
              args: $.args,
              confirm: $.confirm,
              anchorMessageId: De
            }), ht();
          }
        });
        J !== null && cancelAnimationFrame(J);
        const B = O.response.text?.trim() || "", me = Te === 0 && p === "agent" && Dn.test(B), se = O.response.finishReason === "length" && B !== "", ye = ($) => `${$}${me ? Bn() : ""}${se ? Kn() : ""}`;
        if (M !== null && G.trim() !== "")
          ne(M, ye(G)), de(M, "done");
        else if (M !== null)
          z > 0 ? je(M) : (ne(M, ye(B || "已完成。")), de(M, "done"));
        else if (z === 0) {
          const $ = ue();
          U((Y) => [...Y, { id: $, role: "assistant", content: ye(B || "已完成。"), status: "done" }]);
        }
      } catch (O) {
        J !== null && cancelAnimationFrame(J);
        const B = `生成区 Agent 执行失败：${O instanceof Error && O.message ? O.message : "未知错误"}`;
        if (M !== null)
          ne(M, G ? `${G}

${B}` : B), de(M, "error");
        else {
          const me = ue();
          U((se) => [...se, { id: me, role: "assistant", content: B, status: "error" }]);
        }
      } finally {
        d(!1), v.current = null, ke.current = null, X((O) => O + 1);
      }
    })();
  }, [ge, h, he, p, je, f, ce, U, de, b, ne]), ut = (l) => {
    l.preventDefault(), te(Ae.trim());
  };
  y.useEffect(() => {
    const l = (P) => {
      const D = P.detail?.storyText?.trim() || "";
      if (!D) return;
      xe(!1);
      const oe = tn(D);
      te(oe, {
        skill: nn,
        displayMessage: `💄 定妆

${D}`
      });
    };
    return window.addEventListener(Fe, l), () => window.removeEventListener(Fe, l);
  }, [xe, te]);
  const pt = y.useCallback(() => {
    Q.current.clear(), m([]), A(null), C(null), Mt("generation"), ce(""), he(), Pt(Rt("generation"));
  }, [he, ce]);
  return ee ? /* @__PURE__ */ n.jsx(
    "aside",
    {
      className: a(
        "generation-canvas-v2-assistant",
        "block w-auto h-auto rounded-full"
      ),
      "data-collapsed": "true",
      "aria-label": t("generationCommon.assistant.launcherAria"),
      children: /* @__PURE__ */ n.jsx(
        L,
        {
          className: a(
            "generation-canvas-v2-assistant__launcher",
            "inline-flex items-center gap-2 h-9 pl-[10px] pr-[14px]",
            "border border-nomi-line rounded-full",
            "bg-nomi-paper text-nomi-ink font-[inherit] text-body-sm font-medium",
            "shadow-nomi-sm cursor-pointer",
            "hover:shadow-nomi-md hover:-translate-y-px"
          ),
          onClick: () => xe(!1),
          children: /* @__PURE__ */ n.jsx(Tt, { markSize: 18, wordSize: 13, suffix: "生成" })
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
      ...mt,
      children: [
        at ? /* @__PURE__ */ n.jsxs(
          "div",
          {
            className: a(
              "absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none",
              "rounded-nomi border-2 border-dashed border-nomi-accent bg-nomi-accent-soft",
              "text-body-sm font-semibold text-nomi-accent"
            ),
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ n.jsx(Le, { size: 26, stroke: 1.5 }),
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
            /* @__PURE__ */ n.jsx(Dt, { size: 18 }),
            /* @__PURE__ */ n.jsx("span", { className: a("text-body-sm font-semibold text-nomi-ink"), children: t("generationCommon.assistant.title") })
          ] }),
          /* @__PURE__ */ n.jsxs("div", { className: a("inline-flex items-center gap-2 ml-auto min-w-0"), children: [
            /* @__PURE__ */ n.jsx(
              Jt,
              {
                area: "generation",
                className: a("generation-canvas-v2-assistant__shared-actions", "inline-flex items-center flex-nowrap gap-1"),
                actionClassName: a(
                  "size-6 inline-grid place-items-center",
                  "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                  "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                ),
                onNewConversation: pt
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
                onClick: () => xe(!0),
                icon: /* @__PURE__ */ n.jsx(Bt, { size: 14 })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ n.jsx(Ht, { refreshKey: H }),
        /* @__PURE__ */ n.jsx(
          Tn,
          {
            messages: pe,
            staleBoundaryId: ot,
            onSuggestion: te,
            pendingToolCalls: o,
            approveCalls: et,
            rejectPending: tt,
            committedProposal: I,
            deviationReport: w,
            deviationAnchorId: i,
            onDeviationUndo: () => {
              I ? He(I) : V.getState().undo(), A(null), C(null);
            },
            onRetry: () => {
              const l = [...pe].reverse().find((P) => P.role === "user");
              l && te(l.content);
            },
            onDeviationDismiss: () => {
              A(null), C(null);
            },
            onDeviationAiFix: () => {
              te(
                "刚才有几条参考连接没接上（所选模型不支持那种连接方式）。请先读画布，把这些没连上的参考连接，用所选模型支持的连接方式重连；如果模型确实不支持，就换成支持的模型再连。"
              ), A(null), C(null);
            },
            contentDeviations: E,
            contentExhausted: _,
            onContentAiFix: () => {
              S() && (te(fn(E)), x());
            },
            onContentDismiss: () => j(),
            threadBottomRef: le
          }
        ),
        /* @__PURE__ */ n.jsxs(
          "form",
          {
            className: a("grid gap-1 p-3 border-t border-nomi-line-soft bg-nomi-paper"),
            onSubmit: ut,
            children: [
              /* @__PURE__ */ n.jsx(
                "input",
                {
                  ref: it,
                  type: "file",
                  multiple: !0,
                  accept: Xt,
                  className: "hidden",
                  "aria-hidden": "true",
                  tabIndex: -1,
                  onChange: lt
                }
              ),
              /* @__PURE__ */ n.jsx(Yt, { attachments: ge, onRemove: ct, className: a("mb-1") }),
              /* @__PURE__ */ n.jsx(
                qt,
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
                  value: Ae,
                  onChange: (l) => ce(l.target.value),
                  onKeyDown: (l) => Zt(l, () => {
                    l.currentTarget.form?.requestSubmit();
                  }),
                  onPaste: dt
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
                      onClick: rt,
                      icon: /* @__PURE__ */ n.jsx(Le, { size: 16 })
                    }
                  ),
                  /* @__PURE__ */ n.jsx(
                    sn,
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
                      onChange: (l) => u(l)
                    }
                  ),
                  /* @__PURE__ */ n.jsx(Qt, { className: "h-7" })
                ] }),
                h ? /* @__PURE__ */ n.jsx(
                  be,
                  {
                    type: "button",
                    onClick: () => v.current?.(),
                    className: a(
                      "size-7 grid place-items-center shrink-0",
                      "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                      "hover:enabled:bg-nomi-accent"
                    ),
                    label: t("generationCommon.assistant.stop"),
                    "aria-label": t("generationCommon.assistant.stopAria"),
                    icon: /* @__PURE__ */ n.jsx(on, { size: 13 })
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
                    disabled: !Ae.trim() && !ge.some((l) => l.status === "ready"),
                    label: t("generationCommon.assistant.send"),
                    "aria-label": t("generationCommon.assistant.sendAria"),
                    icon: /* @__PURE__ */ n.jsx(en, { size: 15 })
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
  qn as default
};
