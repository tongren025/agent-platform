import { aw as w, bQ as y, bE as I, dW as s, e8 as T, e9 as N, dg as x, e0 as C, bc as B, e7 as S } from "./agentStudioMount-CnF6gUyG.js";
import { w as A } from "./generationRunController-wyKPxPqV.js";
function F(t, e, o) {
  const r = new Map(t.map((d) => [d.id, d])), n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = [];
  let l = !1;
  const u = (d) => {
    if (i.has(d)) {
      l = !0;
      return;
    }
    n.has(d) || (i.add(d), e.filter((g) => g.target === d).forEach((g) => {
      u(g.source);
      const _ = r.get(g.source);
      _ && !a.some((v) => v.id === _.id) && a.push(_);
    }), i.delete(d), n.add(d));
  };
  u(o);
  const f = r.get(o) || null, m = [...a, f].filter(Boolean).map((d) => d?.prompt || "").filter(Boolean), p = [...new Set([...a, f].flatMap((d) => d?.references || []))], h = a.map((d) => A(d.result)).filter(Boolean);
  return {
    node: f,
    upstream: a,
    prompt: m.join(`

`),
    references: p,
    resultUrls: h,
    hasCycle: l
  };
}
function $(t, e, o) {
  const r = String(e || "").trim(), n = t.readGenerationNodes().find((m) => m.id === r);
  if (!n) return { ok: !1, error: "node_not_found", nodeId: r || e };
  const i = t.readTimeline(), a = Math.max(0, Math.floor(o?.startFrame ?? i.playheadFrame ?? 0)), l = w(n, {
    fps: o?.fps ?? i.fps,
    startFrame: a,
    resultId: o?.resultId
  });
  if (!l) return { ok: !1, error: "clip_unavailable", nodeId: r };
  const u = y(l.type);
  return o?.trackType && o.trackType !== u ? { ok: !1, error: "track_type_mismatch", nodeId: r, clip: l } : (t.addTimelineClipAtFrame(l, u, a), t.readTimelineAfterInsert().tracks.some((m) => m.type === u && m.clips.some((p) => p.id === l.id)) ? { ok: !0, nodeId: r, clip: l, trackType: u, startFrame: a } : { ok: !1, error: "timeline_insert_failed", nodeId: r, clip: l });
}
function k(t) {
  const e = String(t || "").trim();
  return e && s.getState().nodes.find((o) => o.id === e) || null;
}
const c = {
  read_canvas() {
    const t = s.getState(), e = x(
      t.nodes,
      C.getState().activeScope
    );
    return B(
      t.readSnapshot(),
      e
    );
  },
  read_selected_nodes() {
    const t = s.getState(), e = new Set(t.selectedNodeIds);
    return t.nodes.filter((o) => e.has(o.id));
  },
  create_nodes(t) {
    return t.map((e) => {
      const o = N(e.meta), r = s.getState().addNode({ ...e, meta: o });
      return o && Object.keys(o).length > 0 && s.getState().updateNode(r.id, { meta: o }), r;
    });
  },
  connect_nodes(t) {
    const e = new Map(s.getState().nodes.map((n) => [n.id, n])), o = [];
    let r = 0;
    for (const n of t) {
      const i = e.get(n.source), a = e.get(n.target);
      if (!i || !a) {
        o.push({ source: n.source, target: n.target, reason: "dangling" });
        continue;
      }
      const l = T(i, a, n.mode);
      if (!l.ok) {
        o.push({ source: n.source, target: n.target, reason: l.reason });
        continue;
      }
      s.getState().connectNodes(n.source, n.target, n.mode), r += 1;
    }
    return { connected: r, skipped: o, edges: s.getState().edges };
  },
  delete_nodes(t) {
    const e = new Set(s.getState().nodes.map((r) => r.id)), o = Array.from(new Set(t.map((r) => String(r || "").trim()).filter((r) => r && e.has(r))));
    return o.forEach((r) => s.getState().deleteNode(r)), o;
  },
  update_node_prompt(t, e) {
    return s.getState().updateNodePrompt(t, e), s.getState().nodes.find((o) => o.id === t) || null;
  },
  read_node_context(t) {
    const e = s.getState();
    return F(e.nodes, e.edges, t);
  },
  set_node_references(t, e) {
    const o = k(t);
    if (!o) return null;
    const r = Array.from(new Set(e.map((n) => String(n || "").trim()).filter(Boolean)));
    return s.getState().updateNode(o.id, { references: r }), s.getState().nodes.find((n) => n.id === o.id) || null;
  },
  send_to_timeline(t, e) {
    return $({
      readGenerationNodes: () => s.getState().nodes,
      readTimeline: () => S.getState().timeline,
      addTimelineClipAtFrame: (o, r, n) => {
        S.getState().addTimelineClipAtFrame(o, r, n);
      },
      readTimelineAfterInsert: () => S.getState().timeline
    }, t, e);
  },
  async execute(t) {
    if (t.tool === "read_canvas") {
      const e = c.read_canvas();
      return { ok: !0, tool: t.tool, message: `读取画布：${e.nodes.length} 个节点`, data: e };
    }
    if (t.tool === "read_selected_nodes") {
      const e = c.read_selected_nodes();
      return { ok: !0, tool: t.tool, message: `读取选中节点：${e.length} 个`, data: e };
    }
    if (t.tool === "read_node_context") {
      const e = c.read_node_context(t.nodeId);
      return {
        ok: !!e.node,
        tool: t.tool,
        message: e.node ? `读取节点上下文：${e.upstream.length} 个上游节点` : "未找到节点",
        data: e,
        ...e.node ? {} : { error: "node_not_found" }
      };
    }
    if (t.tool === "create_nodes") {
      const e = c.create_nodes(t.nodes);
      return { ok: !0, tool: t.tool, message: `创建节点：${e.length} 个`, data: e };
    }
    if (t.tool === "connect_nodes") {
      const e = c.connect_nodes(t.edges);
      return { ok: !0, tool: t.tool, message: `连接节点：${e.connected} 条`, data: e.edges };
    }
    if (t.tool === "delete_nodes") {
      const e = c.delete_nodes(t.nodeIds);
      return { ok: !0, tool: t.tool, message: `删除节点：${e.length} 个`, data: e };
    }
    if (t.tool === "update_node_prompt") {
      const e = c.update_node_prompt(t.nodeId, t.prompt);
      return {
        ok: !!e,
        tool: t.tool,
        message: e ? "已更新节点 prompt" : "未找到节点",
        data: e,
        ...e ? {} : { error: "node_not_found" }
      };
    }
    if (t.tool === "set_node_references") {
      const e = c.set_node_references(t.nodeId, t.references);
      return {
        ok: !!e,
        tool: t.tool,
        message: e ? `已设置 ${e.references?.length || 0} 个参考` : "未找到节点",
        data: e,
        ...e ? {} : { error: "node_not_found" }
      };
    }
    if (t.tool === "send_to_timeline") {
      const e = c.send_to_timeline(t.nodeId, t.options);
      return {
        ok: e.ok,
        tool: t.tool,
        message: e.ok ? "已发送到时间轴" : "发送到时间轴失败",
        data: e,
        ...e.ok ? {} : { error: e.error }
      };
    }
    if (t.tool === "generate_image" || t.tool === "generate_video") {
      const e = k(t.nodeId);
      if (!e) return { ok: !1, tool: t.tool, message: "未找到节点", error: "node_not_found" };
      const o = t.tool === "generate_image" ? "image" : "video";
      if (I(e.kind) !== o)
        return { ok: !1, tool: t.tool, message: `当前工具需要可执行的 ${o} 节点`, error: "kind_mismatch", data: e };
      if (!t.confirmed)
        return {
          ok: !0,
          tool: t.tool,
          message: "需要确认后开始真实生成",
          requiresConfirmation: !0,
          preview: {
            nodeId: e.id,
            title: e.title,
            kind: e.kind,
            prompt: e.prompt || "",
            references: e.references || []
          }
        };
      try {
        const { runGenerationNode: r } = await import("./generationRunController-wyKPxPqV.js").then((i) => i.i), n = await r(e.id);
        return { ok: !0, tool: t.tool, message: "生成完成", data: n };
      } catch (r) {
        const n = r instanceof Error && r.message ? r.message : "生成失败";
        return { ok: !1, tool: t.tool, message: n, error: n };
      }
    }
    return { ok: !1, tool: "unknown", message: "未知工具", error: "unknown_tool" };
  }
};
export {
  c as g,
  $ as s
};
