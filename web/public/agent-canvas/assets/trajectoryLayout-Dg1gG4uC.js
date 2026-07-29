import { bx as B, dK as i, dX as A, dW as y, by as C } from "./agentStudioMount-C42uVxj4.js";
import { b as R } from "./referenceUrl-Chs-socL.js";
import { s as E } from "./sendGenerationNodeToTimeline-R8xh_vrJ.js";
function T(e, t, o) {
  const n = new Map(e.map((r) => [r.id, r])), s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), c = [];
  let g = !1;
  const _ = (r) => {
    if (u.has(r)) {
      g = !0;
      return;
    }
    s.has(r) || (u.add(r), t.filter((d) => d.target === r).forEach((d) => {
      _(d.source);
      const f = n.get(d.source);
      f && !c.some((v) => v.id === f.id) && c.push(f);
    }), u.delete(r), s.add(r));
  };
  _(o);
  const m = n.get(o) || null, h = [...c, m].filter(Boolean).map((r) => r?.prompt || "").filter(Boolean), a = [...new Set([...c, m].flatMap((r) => r?.references || []))], l = c.map((r) => R(r.result)).filter(Boolean);
  return {
    node: m,
    upstream: c,
    prompt: h.join(`

`),
    references: a,
    resultUrls: l,
    hasCycle: g
  };
}
function w(e) {
  const t = String(e || "").trim();
  return t && i.getState().nodes.find((o) => o.id === t) || null;
}
const p = {
  read_canvas() {
    return i.getState().readSnapshot();
  },
  read_selected_nodes() {
    const e = i.getState(), t = new Set(e.selectedNodeIds);
    return e.nodes.filter((o) => t.has(o.id));
  },
  create_nodes(e) {
    return e.map((t) => {
      const o = i.getState().addNode(t);
      return t.meta && Object.keys(t.meta).length > 0 && i.getState().updateNode(o.id, { meta: t.meta }), o;
    });
  },
  connect_nodes(e) {
    const t = new Map(i.getState().nodes.map((s) => [s.id, s])), o = [];
    let n = 0;
    for (const s of e) {
      const u = t.get(s.source), c = t.get(s.target);
      if (!u || !c) {
        o.push({ source: s.source, target: s.target, reason: "dangling" });
        continue;
      }
      const g = A(u, c, s.mode);
      if (!g.ok) {
        o.push({ source: s.source, target: s.target, reason: g.reason });
        continue;
      }
      i.getState().connectNodes(s.source, s.target, s.mode), n += 1;
    }
    return { connected: n, skipped: o, edges: i.getState().edges };
  },
  delete_nodes(e) {
    const t = new Set(i.getState().nodes.map((n) => n.id)), o = Array.from(new Set(e.map((n) => String(n || "").trim()).filter((n) => n && t.has(n))));
    return o.forEach((n) => i.getState().deleteNode(n)), o;
  },
  update_node_prompt(e, t) {
    return i.getState().updateNodePrompt(e, t), i.getState().nodes.find((o) => o.id === e) || null;
  },
  read_node_context(e) {
    const t = i.getState();
    return T(t.nodes, t.edges, e);
  },
  set_node_references(e, t) {
    const o = w(e);
    if (!o) return null;
    const n = Array.from(new Set(t.map((s) => String(s || "").trim()).filter(Boolean)));
    return i.getState().updateNode(o.id, { references: n }), i.getState().nodes.find((s) => s.id === o.id) || null;
  },
  send_to_timeline(e, t) {
    return E({
      readGenerationNodes: () => i.getState().nodes,
      readTimeline: () => y.getState().timeline,
      addTimelineClipAtFrame: (o, n, s) => {
        y.getState().addTimelineClipAtFrame(o, n, s);
      },
      readTimelineAfterInsert: () => y.getState().timeline
    }, e, t);
  },
  async execute(e) {
    if (e.tool === "read_canvas") {
      const t = p.read_canvas();
      return { ok: !0, tool: e.tool, message: `读取画布：${t.nodes.length} 个节点`, data: t };
    }
    if (e.tool === "read_selected_nodes") {
      const t = p.read_selected_nodes();
      return { ok: !0, tool: e.tool, message: `读取选中节点：${t.length} 个`, data: t };
    }
    if (e.tool === "read_node_context") {
      const t = p.read_node_context(e.nodeId);
      return {
        ok: !!t.node,
        tool: e.tool,
        message: t.node ? `读取节点上下文：${t.upstream.length} 个上游节点` : "未找到节点",
        data: t,
        ...t.node ? {} : { error: "node_not_found" }
      };
    }
    if (e.tool === "create_nodes") {
      const t = p.create_nodes(e.nodes);
      return { ok: !0, tool: e.tool, message: `创建节点：${t.length} 个`, data: t };
    }
    if (e.tool === "connect_nodes") {
      const t = p.connect_nodes(e.edges);
      return { ok: !0, tool: e.tool, message: `连接节点：${t.connected} 条`, data: t.edges };
    }
    if (e.tool === "delete_nodes") {
      const t = p.delete_nodes(e.nodeIds);
      return { ok: !0, tool: e.tool, message: `删除节点：${t.length} 个`, data: t };
    }
    if (e.tool === "update_node_prompt") {
      const t = p.update_node_prompt(e.nodeId, e.prompt);
      return {
        ok: !!t,
        tool: e.tool,
        message: t ? "已更新节点 prompt" : "未找到节点",
        data: t,
        ...t ? {} : { error: "node_not_found" }
      };
    }
    if (e.tool === "set_node_references") {
      const t = p.set_node_references(e.nodeId, e.references);
      return {
        ok: !!t,
        tool: e.tool,
        message: t ? `已设置 ${t.references?.length || 0} 个参考` : "未找到节点",
        data: t,
        ...t ? {} : { error: "node_not_found" }
      };
    }
    if (e.tool === "send_to_timeline") {
      const t = p.send_to_timeline(e.nodeId, e.options);
      return {
        ok: t.ok,
        tool: e.tool,
        message: t.ok ? "已发送到时间轴" : "发送到时间轴失败",
        data: t,
        ...t.ok ? {} : { error: t.error }
      };
    }
    if (e.tool === "generate_image" || e.tool === "generate_video") {
      const t = w(e.nodeId);
      if (!t) return { ok: !1, tool: e.tool, message: "未找到节点", error: "node_not_found" };
      const o = e.tool === "generate_image" ? "image" : "video";
      if (B(t.kind) !== o)
        return { ok: !1, tool: e.tool, message: `当前工具需要可执行的 ${o} 节点`, error: "kind_mismatch", data: t };
      if (!e.confirmed)
        return {
          ok: !0,
          tool: e.tool,
          message: "需要确认后开始真实生成",
          requiresConfirmation: !0,
          preview: {
            nodeId: t.id,
            title: t.title,
            kind: t.kind,
            prompt: t.prompt || "",
            references: t.references || []
          }
        };
      try {
        const { runGenerationNode: n } = await import("./generationRunController-mx7jFMGH.js").then((u) => u.g), s = await n(t.id);
        return { ok: !0, tool: e.tool, message: "生成完成", data: s };
      } catch (n) {
        const s = n instanceof Error && n.message ? n.message : "生成失败";
        return { ok: !1, tool: e.tool, message: s, error: s };
      }
    }
    return { ok: !1, tool: "unknown", message: "未知工具", error: "unknown_tool" };
  }
}, k = 160, M = 160, N = 80, x = { width: 340, height: 280 }, G = 4;
function S(e) {
  return C(e);
}
function O(e) {
  return e === "character" || e === "scene" ? 0 : e === "image" ? 1 : e === "video" ? 2 : null;
}
function I(e) {
  let t = -1 / 0;
  for (const o of e) {
    if (!o.position) continue;
    const n = S(o.kind).height;
    t = Math.max(t, o.position.y + n);
  }
  return Number.isFinite(t) ? { x: k, y: Math.max(M, t + N) } : { x: k, y: M };
}
function F(e, t) {
  const o = I(t), n = e.map(O), s = new Set(n.filter((a) => a !== null));
  if (!(!n.includes(null) && s.size >= 2)) {
    let a = 0, l = 0;
    for (const d of e) {
      const f = S(d);
      a = Math.max(a, f.width), l = Math.max(l, f.height);
    }
    a = a || x.width, l = l || x.height;
    const r = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, e.length))));
    return e.map((d, f) => ({
      x: o.x + f % r * a,
      y: o.y + Math.floor(f / r) * l
    }));
  }
  const c = Array.from(s).sort((a, l) => a - l), g = /* @__PURE__ */ new Map();
  e.forEach((a, l) => {
    const r = n[l];
    g.set(r, Math.max(g.get(r) ?? 0, S(a).width));
  });
  const _ = /* @__PURE__ */ new Map();
  let m = o.x;
  for (const a of c)
    _.set(a, m), m += g.get(a) ?? x.width;
  const h = /* @__PURE__ */ new Map();
  return e.map((a, l) => {
    const r = n[l], d = h.get(r) ?? o.y;
    return h.set(r, d + S(a).height), { x: _.get(r) ?? o.x, y: d };
  });
}
function W(e, t, o) {
  const n = I(o), s = Math.max(0, Math.min(t, e.length)), u = [];
  let c = n.x, g = 0;
  for (let r = 0; r < s; r += 1) {
    const d = S(e[r]);
    u.push({ x: c, y: n.y }), c += d.width, g = Math.max(g, d.height);
  }
  const _ = s > 0 ? n.y + g + N : n.y;
  let m = 0, h = 0;
  for (let r = s; r < e.length; r += 1) {
    const d = S(e[r]);
    m = Math.max(m, d.width), h = Math.max(h, d.height);
  }
  m = m || x.width, h = h || x.height;
  const a = e.length - s, l = Math.max(1, Math.min(G, a || 1));
  for (let r = 0; r < a; r += 1) {
    const d = Math.floor(r / l), f = r % l;
    u.push({ x: n.x + f * m, y: _ + d * h });
  }
  return u;
}
export {
  W as a,
  p as g,
  F as l
};
