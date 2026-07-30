import { d8 as Y, cF as L, e7 as N, C as z, bD as H, bv as x, d0 as q, dW as E, cw as U, ea as J, d9 as Q } from "./agentStudioMount-CX1GI_dE.js";
import { g as f } from "./generationCanvasTools-C2aOUeap.js";
import { p as D } from "./modelCatalogCache-SOQxA6cq.js";
import { a as X, l as B } from "./trajectoryLayout-BNpOJu6X.js";
import { a as Z, r as ee } from "./batchPlanPreview-BOvo9znp.js";
import { arrangeStoryboardToTimeline as te } from "./sendStoryboardToTimeline-z7YdHrj5.js";
function oe(e) {
  const s = [], a = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.modelKey ?? o.value;
    if (!i || a.has(i)) continue;
    const n = Y({
      modelKey: o.modelKey ?? o.value,
      modelAlias: o.modelAlias,
      vendorKey: o.vendor,
      meta: o.meta
    });
    n && (a.add(i), s.push({
      modelKey: i,
      modelAlias: o.modelAlias ?? null,
      vendor: o.vendor ?? null,
      label: o.label,
      kind: n.kind,
      archetypeId: n.id,
      defaultModeId: n.defaultModeId,
      modes: n.modes.map((r) => ({
        modeId: r.id,
        vendorTerm: r.vendorTerm,
        intent: r.intent,
        hint: r.hint,
        params: r.params,
        slots: r.slots.map((t) => ({
          kind: t.kind,
          label: t.label,
          max: t.max,
          ...t.characterIndexed ? { characterIndexed: !0 } : {}
        }))
      }))
    }));
  }
  return s;
}
async function P() {
  const [e, s] = await Promise.all([
    D("image"),
    D("video")
  ]);
  return oe([...e, ...s]);
}
async function ye() {
  let e;
  try {
    e = await P();
  } catch {
    return {};
  }
  const s = e.filter((r) => r.kind === "image");
  if (s.length === 0) return {};
  const a = (r) => s.find((t) => r.test(`${t.modelKey} ${t.modelAlias ?? ""} ${t.label}`)), o = a(/gpt[\s-]?image/i) ?? a(/nano[\s-]?banana/i) ?? s[0], i = o.modes.find((r) => r.modeId === o.defaultModeId) ?? o.modes[0], n = o.modes.find((r) => r.slots.some((t) => t.kind === "image_ref"));
  return {
    modelKey: o.modelKey,
    ...i ? { modeId: i.modeId } : {},
    ...n ? { refModeId: n.modeId } : {}
  };
}
async function he() {
  let e;
  try {
    e = await P();
  } catch {
    return {};
  }
  const s = e.filter((r) => r.kind === "video");
  if (s.length === 0) return {};
  const o = ((r) => s.find((t) => r.test(`${t.modelKey} ${t.modelAlias ?? ""} ${t.label}`)))(/seedance/i) ?? s[0], n = o.modes.find((r) => r.slots.some((t) => t.kind === "image_ref" || t.kind === "first_frame")) ?? o.modes.find((r) => r.modeId === o.defaultModeId) ?? o.modes[0];
  return {
    modelKey: o.modelKey,
    ...n ? { modeId: n.modeId } : {}
  };
}
function Ie(e) {
  return e.length === 0 ? "" : [
    "可用模型（为每个节点选一个，在 create_canvas_nodes 的节点里给出 modelKey、可选 modeId、params）：",
    ...e.map((a) => {
      const o = a.modes.map((n) => {
        const r = n.slots.length ? `[参考槽:${n.slots.map((t) => `${t.label}${t.max > 1 ? `×${t.max}` : ""}`).join("/")}]` : "[纯文生,不接参考边]";
        return `${n.modeId}(${n.vendorTerm})${r}`;
      }).join(" / "), i = a.modes[0]?.params.map((n) => {
        const r = n.options?.map((t) => t.value).join(",");
        return r ? `${n.key}[${r}]` : n.key;
      }).join(" ") ?? "";
      return `- modelKey=${a.modelKey}（${a.label}，${a.kind}）模式: ${o}；参数: ${i}`;
    }),
    "规则：modelKey 必须用上面列出的；modeId 用该模型的模式 id；params 用对应模型/模式支持的取值（如 aspect_ratio=9:16）。用户会在确认卡上调整，配错会被自动纠正。",
    "连参考边只连目标模型支持的：character_ref/style_ref/composition_ref 需要目标模式有图片参考槽（角色参考/参考图/输入图）；first_frame/last_frame 需要对应的首/尾帧槽；纯文生模式（无参考槽）不要连任何参考边。文本/镜头/输出节点不能作参考源（它们没有可参考的产物）。配错的边会被跳过并在 skippedEdges 里告知原因。"
  ].join(`
`);
}
function ne(e, s) {
  return e.options.length > 0 ? e.options.some((a) => String(a.value) === String(s)) : e.type === "number" ? !(typeof s != "number" || !Number.isFinite(s) || e.min !== void 0 && s < e.min || e.max !== void 0 && s > e.max) : e.type === "boolean" ? typeof s == "boolean" : !0;
}
function F(e, s) {
  const a = typeof e.modelKey == "string" ? e.modelKey.trim() : "";
  if (!a) return;
  const o = s.get(a);
  if (!o) return;
  const i = typeof e.modeId == "string" ? e.modeId.trim() : "", n = o.modes.find((d) => d.modeId === i) ?? o.modes.find((d) => d.modeId === o.defaultModeId) ?? o.modes[0], r = {
    modelKey: a,
    modelLabel: o.label,
    archetype: { id: o.archetypeId, modeId: n?.modeId ?? o.defaultModeId }
  };
  if (o.vendor && (r.modelVendor = o.vendor), !n) return r;
  for (const d of n.params)
    d.defaultValue !== void 0 && (r[d.key] = d.defaultValue);
  const t = e.params && typeof e.params == "object" && !Array.isArray(e.params) ? e.params : {};
  for (const d of n.params) {
    const l = t[d.key];
    l !== void 0 && (typeof l == "string" || typeof l == "number" || typeof l == "boolean") && ne(d, l) && (r[d.key] = l);
  }
  return r;
}
const re = /* @__PURE__ */ new Set(["modelKey", "modelLabel", "archetype", "modelVendor"]);
function ve(e, s) {
  if (typeof e.modelKey != "string" || !e.modelKey.trim()) return e;
  const a = F(e, s);
  if (!a) {
    const { modelKey: n, modeId: r, params: t, ...d } = e;
    return d;
  }
  const o = {};
  for (const [n, r] of Object.entries(a))
    re.has(n) || (o[n] = r);
  const i = a.archetype;
  return {
    ...e,
    modelKey: a.modelKey,
    ...i?.modeId ? { modeId: i.modeId } : {},
    params: o
  };
}
const se = (e, s = 60) => {
  const a = String(e || "").trim().replace(/\s+/g, " ");
  return a.length > s ? `${a.slice(0, s)}…` : a;
};
function ae(e, s = []) {
  if (e.nodes.length === 0) return "画布当前为空。";
  const a = new Map(e.nodes.map((t) => [t.id, t.title])), o = e.nodes.map((t) => {
    const d = [
      t.locked ? "已锁定" : null,
      // 区分已出视频 / 已出图——排片(arrange_storyboard_to_timeline)按视频优先、缺则关键帧占位。
      t.result?.type === "video" ? "已出视频" : t.result ? "已出图" : null,
      t.status && t.status !== "idle" && t.status !== "success" ? t.status : null
    ].filter(Boolean), l = se(t.prompt || "");
    return [
      `- ${t.id} | ${t.kind}`,
      // 镜号(shotIndex)= 剧本时序的真相,排片即按它排;让 Agent 决策/复报能引用「镜 N」。
      typeof t.shotIndex == "number" ? ` | 镜${t.shotIndex}` : "",
      ` | ${t.title}`,
      d.length ? ` | ${d.join(",")}` : "",
      l ? ` | prompt: ${l}` : ""
    ].join("");
  }), i = e.edges.map((t) => `${a.get(t.source) || t.source}→${a.get(t.target) || t.target}`).join(", "), n = s.length ? s.map((t) => t.id) : e.selectedNodeIds ?? [], r = s.filter((t) => (t.prompt || "").length > 60).map((t) => `「${t.title}」(${t.id}) 完整提示词:
${t.prompt}`);
  return [
    `画布节点 ${e.nodes.length} 个(id | 类型 | 标题 | 状态 | prompt 摘要):`,
    ...o,
    `引用边: ${i || "无"}`,
    `当前选中: ${n.length ? n.join(", ") : "无"}`,
    ...r.length ? ["", ...r] : []
  ].join(`
`);
}
const de = /* @__PURE__ */ new Set([
  "reference",
  "first_frame",
  "last_frame",
  "style_ref",
  "character_ref",
  "composition_ref"
]);
function O(e) {
  return typeof e == "string" && de.has(e) ? e : void 0;
}
function R(e) {
  return e.map((s) => s && typeof s == "object" ? s : {}).map((s) => ({
    source: v(String(s.sourceClientId || s.source || "").trim()),
    target: v(String(s.targetClientId || s.target || "").trim()),
    ...O(s.mode) ? { mode: O(s.mode) } : {}
  })).filter((s) => s.source && s.target);
}
function v(e) {
  return Q(e);
}
function V(e, s, a, o, i) {
  const n = f.read_canvas().nodes.find((g) => g.id === e);
  if (!n) return { found: !1, applied: !1, alreadyApplied: !1 };
  const r = n.meta ?? {};
  if (r[o] === a)
    return { found: !0, applied: !1, alreadyApplied: !0 };
  const t = typeof n.prompt == "string" ? n.prompt : "", d = `${s}：${a}`, l = t.trim() ? `${t}
${d}` : d;
  return i(() => {
    f.update_node_prompt(e, l), E.getState().updateNode(e, { meta: { ...r, [o]: a } });
  }), { found: !0, applied: !0, alreadyApplied: !1 };
}
const j = (e) => typeof e == "string" && e.trim() ? e.trim() : void 0;
function G(e) {
  const a = (Array.isArray(e.props) ? e.props : []).map((o) => o && typeof o == "object" ? o : {}).flatMap((o) => {
    const i = j(o.kind);
    if (!i) return [];
    const n = Array.isArray(o.position) && o.position.length >= 2 && typeof o.position[0] == "number" && typeof o.position[1] == "number" ? [o.position[0], o.position[1]] : void 0;
    return [{
      kind: i,
      position: n,
      rotationY: typeof o.rotationY == "number" ? o.rotationY : void 0,
      scale: typeof o.scale == "number" ? o.scale : void 0
    }];
  });
  return {
    sceneTemplate: j(e.sceneTemplate),
    props: a.length > 0 ? a : void 0
  };
}
function ie(e) {
  const s = j, o = (Array.isArray(e.characters) ? e.characters : []).map((t) => t && typeof t == "object" ? t : {}).map((t) => ({
    name: s(t.name),
    pose: s(t.pose),
    facing: s(t.facing)
  }));
  o.length === 0 && o.push({});
  const i = e.camera && typeof e.camera == "object" ? e.camera : null, n = e.crowd && typeof e.crowd == "object" ? e.crowd : null, r = G(e);
  return {
    characters: o,
    layout: s(e.layout),
    camera: i ? {
      angle: s(i.angle),
      height: s(i.height),
      shot: s(i.shot)
    } : void 0,
    environment: s(e.environment),
    crowd: n && typeof n.rows == "number" && typeof n.columns == "number" ? { rows: n.rows, columns: n.columns } : void 0,
    sceneTemplate: r.sceneTemplate,
    props: r.props
  };
}
function ce(e) {
  const s = j, a = G(e);
  return {
    move: s(e.move),
    speed: s(e.speed),
    shot: s(e.shot),
    subjectPose: s(e.subjectPose),
    customMove: s(e.customMove),
    sceneTemplate: a.sceneTemplate,
    props: a.props
  };
}
async function be(e, s, a) {
  const o = s && typeof s == "object" ? s : {}, i = (n) => a ? J(a, n) : n();
  if (e === "read_canvas_state") {
    const n = f.read_canvas(), r = new Set(n.selectedNodeIds ?? []), t = n.nodes.filter((d) => r.has(d.id));
    return ae(n, t);
  }
  if (e === "propose_storyboard_plan") {
    const n = L(o), r = N.getState();
    return r.setStoryboardPlan(n), r.setStoryboardEditorOpen(!0), r.setWorkspaceMode("creation"), `已生成分镜方案「${n.title || "未命名"}」：${n.anchors.length} 个锚 · ${n.shots.length} 个镜头，已放到创作区，待你审阅/修改后确认落画布。`;
  }
  if (e === "create_canvas_nodes") {
    const n = Array.isArray(o.nodes) ? o.nodes : [], r = n.some(
      (c) => c && typeof c == "object" && typeof c.modelKey == "string"
    ), t = new Map(
      r ? (await P()).map((c) => [c.modelKey, c]) : []
    ), d = n.length, l = n.map((c) => {
      const u = c && typeof c == "object" ? c : {};
      return typeof u.kind == "string" ? u.kind : "image";
    }), g = f.read_canvas().nodes, p = typeof o.anchorCount == "number" ? o.anchorCount : null, y = p !== null ? X(l, p, g) : B(l, g), w = typeof o.groupCategoryId == "string" && z.includes(o.groupCategoryId) ? o.groupCategoryId : null, _ = n.map((c, u) => {
      const m = c && typeof c == "object" ? c : {}, h = l[u], b = m.position && typeof m.position == "object" ? m.position : null, S = F(m, t), M = {
        ...m.referenceSheet === !0 ? { referenceSheet: !0 } : {},
        ...m.storyboardKeyframe === !0 ? { storyboardKeyframe: !0 } : {}
      }, C = Object.keys(M).length ? { ...S ?? {}, ...M } : S, W = d > 1 ? y[u] : {
        x: typeof b?.x == "number" ? b.x : y[u].x,
        y: typeof b?.y == "number" ? b.y : y[u].y
      };
      return {
        kind: h,
        // groupCategoryId 在则整批落同一分类（分镜方案：角色/场景/镜头落在一起）；否则按 kind
        // 归类（镜头→分镜、角色→cast、场景→scene）。character/scene kind 不参与 shotIndex，
        // 故落进 shots 也不抢「镜头 N」编号（见 model/shotNumbering.ts）。
        categoryId: w ?? x(h),
        title: typeof m.title == "string" && m.title.trim() ? m.title.trim() : `${H(h)} ${u + 1}`,
        prompt: typeof m.prompt == "string" ? m.prompt : "",
        position: W,
        ...C ? { meta: C } : {}
      };
    }), A = i(() => f.create_nodes(_)), $ = {};
    n.forEach((c, u) => {
      const m = c && typeof c == "object" ? c : {}, h = typeof m.clientId == "string" ? m.clientId : "";
      h && A[u] && ($[h] = A[u].id, q(h, A[u].id));
    });
    const I = Array.isArray(o.edges) ? o.edges : [];
    let k = 0, K = [];
    if (I.length) {
      const c = i(() => f.connect_nodes(R(I)));
      k = c.connected, K = c.skipped;
    }
    const T = new Set(
      n.filter((c) => c && typeof c == "object" && c.storyboardKeyframe === !0).map((c) => String(c.clientId || ""))
    );
    if (T.size) {
      const c = E.getState(), u = new Map(c.nodes.map((m) => [m.id, m]));
      for (const m of I) {
        const h = m && typeof m == "object" ? m : {};
        if (h.mode !== "first_frame") continue;
        const b = String(h.sourceClientId || "");
        if (!T.has(b)) continue;
        const S = $[b], M = $[String(h.targetClientId || "")], C = M ? u.get(M)?.shotIndex : void 0;
        S && typeof C == "number" && c.updateNode(S, { shotIndex: C });
      }
    }
    return {
      createdNodeIds: A.map((c) => c.id),
      clientIdToNodeId: $,
      ...I.length ? { connectedCount: k } : {},
      ...K.length > 0 ? { skippedEdges: K } : {}
    };
  }
  if (e === "create_staging_reference") {
    const n = typeof o.shotClientId == "string" ? o.shotClientId.trim() : "", r = n ? v(n) : void 0, t = Array.isArray(o.characters) ? o.characters : [], d = typeof o.customBlocking == "string" ? o.customBlocking.trim() : "";
    if (t.length === 0 && d) {
      if (!r)
        throw new Error("customBlocking 需要 shotClientId 指向该镜头的关键帧图片节点才能注入构图指令");
      const k = V(r, "构图", d, "stagingPromptApplied", i);
      if (!k.found) throw new Error("node_not_found:customBlocking 的目标节点不存在");
      return {
        stagingNodeId: null,
        targetNodeId: r,
        degraded: !0,
        message: k.alreadyApplied ? "该构图指令已写入镜头关键帧 prompt（词表外，prompt 引导，未渲精确站位图）。" : "站位意图不在词表内，已用 prompt 引导：把构图指令写进镜头关键帧 prompt（未渲精确站位图，保真度低于 3D 站位参考）。"
      };
    }
    const l = ie(o), { buildStagingSceneAudited: g } = await import("./stagingBuilder-B_OyLKR2.js"), { state: p, issues: y } = g(l), w = f.read_canvas().nodes, _ = B(["image"], w)[0], $ = i(
      () => f.create_nodes([
        {
          kind: "scene3d",
          categoryId: x("scene3d"),
          title: "站位参考",
          prompt: "",
          position: _,
          meta: {
            scene3dState: p,
            stagingAutoCapture: r ? { targetNodeId: r } : {}
          }
        }
      ])
    )[0]?.id ?? null, I = l.camera ?? {};
    return {
      stagingNodeId: $,
      targetNodeId: r ?? null,
      message: `已创建站位参考（${l.characters.length} 角色 · ${l.layout ?? "自动"} 站位 · ${I.angle ?? "three-quarter"}/${I.height ?? "eye"}/${I.shot ?? "medium"}）。正在离屏渲染出图${r ? "并连到镜头作 composition_ref" : ""}。${y.length ? " ⚠️ " + y.join("；") : ""}`
    };
  }
  if (e === "create_camera_move") {
    const n = ce(o), r = typeof o.shotClientId == "string" ? o.shotClientId.trim() : "", t = r ? v(r) : void 0;
    if (!n.move && !n.customMove)
      throw new Error("create_camera_move 需要 move（词表内精确运镜）或 customMove（词表外自由描述）二选一");
    if (n.move && n.customMove)
      throw new Error("create_camera_move 的 move 与 customMove 互斥：词表内用 move，词表外只用 customMove");
    if (!n.move && n.customMove) {
      if (!t)
        throw new Error("customMove 需要 shotClientId 指向该镜头的视频节点才能注入运镜指令");
      const _ = V(t, "镜头运动", n.customMove, "cameraMovePromptApplied", i);
      if (!_.found) throw new Error("node_not_found:customMove 的目标节点不存在");
      return {
        cameraMoveNodeId: null,
        targetNodeId: t,
        degraded: !0,
        message: _.alreadyApplied ? "该运镜指令已写入镜头视频 prompt（词表外，prompt 引导，未渲精确运镜参考）。" : "运镜意图不在词表内，已用 prompt 引导：把运镜指令写进镜头视频 prompt（未渲精确运镜参考，保真度低于 3D 运镜小片）。"
      };
    }
    const d = {
      move: n.move ?? "push_in",
      speed: n.speed,
      shot: n.shot,
      subjectPose: n.subjectPose,
      sceneTemplate: n.sceneTemplate,
      props: n.props
    }, [{ createCameraMoveReferenceNode: l }, { CAMERA_SPEED_DURATION: g, CAMERA_MOVE_LABEL: p }] = await Promise.all([
      import("./cameraMoveReferenceNode-CMjvCe1u.js"),
      import("./cameraMoveVocab-CkwMRCGZ.js")
    ]), y = d.speed ?? "medium", { cameraMoveNodeId: w } = l({ spec: d, targetNodeId: t, inCtx: i });
    return {
      cameraMoveNodeId: w,
      targetNodeId: t ?? null,
      message: `已创建运镜参考（${p[d.move]} · ${d.shot ?? "medium"} · ${y} ≈${g[y]}s）。正在离屏渲染运镜小片${t ? "并喂给镜头作运镜参考视频" : ""}。`
    };
  }
  if (e === "connect_canvas_edges") {
    const n = Array.isArray(o.edges) ? o.edges : [], r = R(n), { connected: t, skipped: d } = i(() => f.connect_nodes(r));
    return { connectedCount: t, ...d.length > 0 ? { skippedEdges: d } : {} };
  }
  if (e === "set_node_prompt") {
    const n = v(String(o.nodeId || "").trim()), r = typeof o.prompt == "string" ? o.prompt : "", t = i(() => f.update_node_prompt(n, r));
    if (!t) throw new Error("node_not_found");
    return { nodeId: t.id };
  }
  if (e === "delete_canvas_nodes") {
    const n = Array.isArray(o.nodeIds) ? o.nodeIds.map((t) => v(String(t || "").trim())).filter(Boolean) : [];
    return { deletedNodeIds: i(() => f.delete_nodes(n)) };
  }
  if (e === "run_generation_batch") {
    const n = Array.isArray(o.nodeIds) ? o.nodeIds.map((p) => v(String(p || "").trim())).filter(Boolean) : [], r = new Set(f.read_canvas().nodes.map((p) => p.id)), t = n.filter((p) => r.has(p));
    if (!t.length) throw new Error("node_not_found:请求生成的节点都不存在");
    const d = f.read_canvas(), l = Z(t, { nodes: d.nodes, edges: d.edges }), g = l.waves.flat();
    if (!g.length) {
      const p = l.blocked.map((y) => y.detail).join(";");
      throw new Error(`批量被拦:${p || "没有可执行节点"}`);
    }
    return U(g).then((p) => ee(l, p)).catch(() => {
    }), {
      accepted: !0,
      acceptedNodeIds: g,
      waves: l.waves.length,
      blocked: l.blocked.map((p) => ({ nodeId: p.nodeId, detail: p.detail }))
    };
  }
  if (e === "arrange_storyboard_to_timeline") {
    const n = Array.isArray(o.nodeIds) ? o.nodeIds.map((t) => v(String(t || "").trim())).filter(Boolean) : void 0, r = te(n && n.length ? { nodeIds: n } : {});
    if (!r.ok && r.total === 0)
      throw new Error("没有可排片的镜头:画布上还没有生成好的视频或可占位的关键帧");
    return {
      arranged: r.sent.length,
      total: r.total,
      // 回报每镜落点(role: video/placeholder/still),供 LLM 向用户复述"镜N用视频/用关键帧占位"。
      placed: r.sent.map((t) => ({ nodeId: t.nodeId, role: t.role, startFrame: t.startFrame })),
      ...r.skipped.length ? { skipped: r.skipped } : {}
    };
  }
  if (e === "tidy_canvas") {
    const n = typeof o.categoryId == "string" && o.categoryId.trim() || N.getState().activeCategoryId || "shots", r = typeof window < "u" && window.innerHeight > 0 ? window.innerWidth / window.innerHeight : 16 / 9, t = E.getState().nodes.filter((d) => (d.categoryId || "shots") === n).length;
    return i(() => E.getState().tidyCategory(n, r)), { tidied: n, nodeCount: t };
  }
  throw new Error(`unknown tool ${e}`);
}
export {
  be as a,
  ae as b,
  ye as c,
  he as d,
  Ie as f,
  P as l,
  ve as r
};
