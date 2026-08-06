import { aJ as O, bv as b, aQ as K, B as k, dF as B, dq as P, cY as G, cW as L, dN as D, cA as Y, au as V, dj as W, d2 as z, aF as q } from "./agentStudioMount-S0u8Hm0S.js";
const x = {
  shots: "shots",
  characters: "cast",
  scenes: "scene",
  audio: "audio",
  story: null,
  style: null,
  inbox: null,
  exports: null
};
function A(e) {
  if (!e || typeof e != "object") return;
  const r = e.categoryId;
  return typeof r == "string" ? r : void 0;
}
function M(e) {
  if (Object.prototype.hasOwnProperty.call(x, e))
    return x[e];
  const r = typeof e == "string" ? e.trim() : "";
  return r || null;
}
function H(e, r) {
  const o = A(e);
  return o ? M(o) : b(e.kind);
}
function J(e) {
  return Array.from(new Set(e));
}
function _(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function E(e, r) {
  if (Object.is(e, r)) return !0;
  if (Array.isArray(e) || Array.isArray(r))
    return !Array.isArray(e) || !Array.isArray(r) || e.length !== r.length ? !1 : e.every((o, t) => E(o, r[t]));
  if (_(e) && _(r)) {
    const o = Object.keys(e).filter((n) => e[n] !== void 0), t = Object.keys(r).filter((n) => r[n] !== void 0);
    return o.length !== t.length ? !1 : o.every((n) => Object.prototype.hasOwnProperty.call(r, n) && E(e[n], r[n]));
  }
  return !1;
}
function Q(e, r) {
  if (!Array.isArray(e)) return { groups: [], changed: !0 };
  const o = [];
  let t = !1;
  for (const n of e) {
    if (!n || typeof n != "object") {
      t = !0;
      continue;
    }
    const s = A(n), d = M(s || "");
    if (!d) {
      t = !0;
      continue;
    }
    const g = Array.isArray(n.nodeIds) ? n.nodeIds : [], a = g.filter((i) => typeof i == "string" && r.has(i)), c = a.length !== g.length || a.some((i, l) => i !== g[l]);
    (s !== d || c) && (t = !0), o.push(s === d && !c ? n : {
      ...n,
      categoryId: d,
      nodeIds: a
    });
  }
  return { groups: o, changed: t };
}
function X(e) {
  let r = 0;
  const o = [], t = [];
  for (const i of e.nodes) {
    const l = H(i, e.edges);
    if (!l) {
      o.push(A(i) || "(uncategorized)");
      continue;
    }
    A(i) !== l && (r += 1), t.push({
      ...i,
      categoryId: l
    });
  }
  const n = new Set(t.map((i) => i.id)), s = e.edges.filter((i) => n.has(i.source) && n.has(i.target)), d = (e.selectedNodeIds ?? []).filter((i) => n.has(i)), g = Q(e.groups, n), a = g.groups, c = e.nodes.length - t.length;
  return !r && !c && s.length === e.edges.length && d.length === (e.selectedNodeIds ?? []).length && !g.changed ? { snapshot: e, migratedCount: 0, removedCount: 0, removedCategoryIds: [] } : {
    snapshot: {
      ...e,
      nodes: t,
      edges: s,
      selectedNodeIds: d,
      groups: a
    },
    migratedCount: r,
    removedCount: c,
    removedCategoryIds: J(o)
  };
}
function Z(e) {
  if (!Array.isArray(e.categories) || e.categories.length === 0)
    return { categories: O(), seeded: !0 };
  const r = new Map(O().map((o) => [o.id, o]));
  for (const o of e.categories) {
    const t = M(o.id);
    if (!t) continue;
    const n = r.get(t);
    r.set(t, { ...n, ...o, id: t, order: n?.order ?? o.order });
  }
  return { categories: Array.from(r.values()).sort((o, t) => o.order - t.order), seeded: !1 };
}
function $(e) {
  const r = Z(e), o = X(e.generationCanvas), t = e.generationCanvas.nodes.length, n = e.categories?.map((a) => a.id) || [], s = r.categories?.map((a) => a.id) || [];
  return !(n.length !== s.length || n.some((a, c) => a !== s[c])) && o.migratedCount === 0 && o.removedCount === 0 && E(o.snapshot, e.generationCanvas) ? {
    payload: e,
    diagnostic: {
      totalNodes: t,
      migratedNodes: 0,
      removedNodes: 0,
      removedCategoryIds: [],
      categoriesSeeded: !1,
      alreadyMigrated: !0
    }
  } : {
    payload: {
      ...e,
      categories: r.categories,
      generationCanvas: o.snapshot
    },
    diagnostic: {
      totalNodes: t,
      migratedNodes: o.migratedCount,
      removedNodes: o.removedCount,
      removedCategoryIds: o.removedCategoryIds,
      categoriesSeeded: r.seeded,
      alreadyMigrated: !1
    }
  };
}
function ee(e) {
  const { payload: r, diagnostic: o } = $(e.payload);
  return o.alreadyMigrated ? { record: e, diagnostic: o } : {
    record: { ...e, payload: r },
    diagnostic: { ...o, projectId: e.id }
  };
}
function re(e) {
  const r = [], o = (t) => {
    if (t)
      for (const n of [t.providerUrl, t.url, t.thumbnailUrl]) {
        const s = typeof n == "string" ? n.trim() : "";
        s && r.push(s);
      }
  };
  o(e.result);
  for (const t of e.history || []) o(t);
  return r;
}
function te(e, r) {
  const o = /* @__PURE__ */ new Map();
  for (const a of e)
    for (const c of re(a))
      o.has(c) || o.set(c, a.id);
  let t = [...r], n = 0, s = 0, d = !1;
  const g = e.map((a) => {
    const c = a.meta || {}, i = c.referenceImageUrls;
    if (!Array.isArray(i) || i.length === 0) return a;
    const l = [];
    for (const y of i) {
      const h = typeof y == "string" ? y.trim() : "";
      if (!h) continue;
      const I = o.get(h);
      if (!I || I === a.id) {
        l.push(h), s += 1;
        continue;
      }
      const u = t;
      t = K(t, I, a.id, "character_ref"), t !== u && (n += 1);
    }
    if (l.length === i.length) return a;
    d = !0;
    const p = { ...c };
    return l.length > 0 ? p.referenceImageUrls = l : delete p.referenceImageUrls, { ...a, meta: p };
  });
  return {
    nodes: d ? g : e,
    edges: n > 0 ? t : r,
    edgesCreated: n,
    metaKept: s
  };
}
const oe = (() => {
  const e = {};
  for (const r of k)
    e[r.id] = r.defaultNodeRenderKind;
  return e;
})(), C = {
  alreadyMigrated: !0,
  renderKindBackfilled: 0,
  derivedFromKeptCrossCategory: 0,
  derivedFromMovedToRegeneratedFrom: 0,
  derivedFromClearedOrphan: 0,
  shotIndicesAssigned: 0,
  referenceEdgesCreated: 0
};
function U(e) {
  if (e)
    return oe[e];
}
function ne(e) {
  const r = [];
  for (const t of e) {
    if (!t.renderKind && U(t.categoryId) || t.categoryId === "shots" && typeof t.shotIndex != "number") return !0;
    t.derivedFrom && !t.regeneratedFrom && r.push(t);
  }
  if (!r.length) return !1;
  const o = /* @__PURE__ */ new Map();
  for (const t of e) o.set(t.id, t.categoryId);
  for (const t of r) {
    const n = o.get(t.derivedFrom || "");
    if (!n || n === t.categoryId) return !0;
  }
  return !1;
}
function se(e) {
  const r = e.payload?.generationCanvas;
  if (!r || !Array.isArray(r.nodes) || r.nodes.length === 0)
    return { record: e, diagnostic: C };
  if (!ne(r.nodes))
    return { record: e, diagnostic: C };
  const o = /* @__PURE__ */ new Map();
  for (const u of r.nodes)
    u && typeof u == "object" && "id" in u && o.set(u.id, u);
  let t = 0, n = 0, s = 0, d = 0, g = 0;
  const a = r.nodes.map((u) => {
    let f = u;
    if (!f.renderKind) {
      const m = U(f.categoryId);
      m && (f = { ...f, renderKind: m }, t += 1);
    }
    if (f.derivedFrom && !f.regeneratedFrom) {
      const m = o.get(f.derivedFrom);
      if (m)
        if (m.categoryId === f.categoryId) {
          const { derivedFrom: F, ...j } = f;
          f = { ...j, regeneratedFrom: F }, s += 1;
        } else
          n += 1;
      else {
        const { derivedFrom: F, ...j } = f;
        f = j, d += 1;
      }
    }
    return f;
  });
  a.map((u, v) => ({ node: u, idx: v })).filter(({ node: u }) => u.categoryId === "shots").sort((u, v) => {
    const f = u.node.position?.y ?? 0, m = v.node.position?.y ?? 0;
    return f !== m ? f - m : u.node.id.localeCompare(v.node.id);
  }).forEach(({ node: u, idx: v }, f) => {
    const m = f + 1;
    u.shotIndex !== m && (a[v] = { ...u, shotIndex: m }, g += 1);
  });
  const i = Array.isArray(r.edges) ? r.edges : [], l = te(a, i), p = l.edgesCreated, y = l.nodes !== a;
  return t + s + d + g + p > 0 || y ? {
    record: {
      ...e,
      payload: {
        ...e.payload,
        generationCanvas: {
          ...r,
          // 参考迁移可能改了节点 meta（清掉已建边的 referenceImageUrls）+ 加了边。
          nodes: l.nodes,
          edges: l.edges
        }
      }
    },
    diagnostic: {
      alreadyMigrated: !1,
      renderKindBackfilled: t,
      derivedFromKeptCrossCategory: n,
      derivedFromMovedToRegeneratedFrom: s,
      derivedFromClearedOrphan: d,
      shotIndicesAssigned: g,
      referenceEdgesCreated: p
    }
  } : {
    record: e,
    diagnostic: n > 0 ? {
      ...C,
      derivedFromKeptCrossCategory: n
    } : C
  };
}
let S = null;
function T(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
const ae = /* @__PURE__ */ new Set(["updatedAt", "createdAt", "savedAt", "revision"]);
function R(e) {
  return Object.keys(e).filter((r) => e[r] !== void 0 && !ae.has(r));
}
function w(e, r) {
  if (Object.is(e, r)) return !0;
  if (Array.isArray(e) || Array.isArray(r))
    return !Array.isArray(e) || !Array.isArray(r) || e.length !== r.length ? !1 : e.every((o, t) => w(o, r[t]));
  if (T(e) && T(r)) {
    const o = R(e), t = R(r);
    return o.length !== t.length ? !1 : o.every((n) => Object.prototype.hasOwnProperty.call(r, n) && w(e[n], r[n]));
  }
  return !1;
}
function de(e, r) {
  return w(e, r);
}
function ie(e, r) {
  return Object.is(e, r) ? !1 : e.name !== r.name ? !0 : !de(e.payload, r.payload);
}
function le() {
  const e = S;
  return S = null, e;
}
const ce = "nomi-workbench-last-active-project-v1";
function N(e) {
  if (typeof window > "u") return;
  const r = e.trim();
  r && window.localStorage.setItem(ce, r);
}
function ue(e) {
  const r = async (s, d) => {
    const g = P(s.id, d, s.name);
    return N(g.id), e.setActiveProject(g), g;
  }, o = (s) => B({
    projectId: s.project.id,
    projectName: s.project.name,
    isHydrating: s.isHydrating,
    canPersist: s.canPersist,
    saveProject: async (d, g, a) => {
      const c = P(s.project.id, g, s.project.name);
      return N(c.id), c;
    },
    onSaved: s.onSaved,
    onSaveError: s.onSaveError
  }), t = async (s) => {
    const d = await L(s);
    if (!d) return null;
    q();
    const g = await D(d), { record: a, diagnostic: c } = ee(g), { record: i } = se(a), l = Y(i), p = V(l.payload.generationCanvas.nodes), y = p.changed ? {
      ...l,
      payload: {
        ...l.payload,
        generationCanvas: {
          ...l.payload.generationCanvas,
          nodes: p.nodes
        }
      }
    } : l, h = ie(d, y);
    return h && !c.alreadyMigrated && (c.migratedNodes > 0 || c.removedNodes > 0 || c.categoriesSeeded) && (S = c), h && P(y.id, y.payload, y.name), W(y.payload), await z(y.id, y.payload), N(y.id), e.setActiveProject(y), e.setView("studio"), y;
  };
  return {
    hydrateProject: t,
    hydrateInitialProject: async (s) => {
      const d = G("projectId");
      return d ? t(d) : null;
    },
    persistProject: r,
    bindProjectPersistence: o
  };
}
export {
  le as consumeCategoryMigrationDiagnostic,
  ue as createWorkbenchProjectPersistenceService,
  ie as migratedRecordNeedsPersist,
  de as workbenchPayloadSemanticEquals
};
