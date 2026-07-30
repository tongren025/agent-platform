import { aR as q, p as Oe, dV as V, S as o, c8 as n, aJ as U, dW as A, dK as h, B as X, dD as Be, bk as oe, aN as Y, cD as re } from "./agentStudioMount-CP7x4OcS.js";
import { s as se } from "./showUndoToast-DmEf7fDl.js";
import { I as _e } from "./IconBox-B3Ee3xqu.js";
import { I as Ae } from "./IconUser-DkJ2iwmb.js";
const Ue = [["path", { d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6", key: "svg-0" }], ["path", { d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10", key: "svg-1" }], ["path", { d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14", key: "svg-2" }], ["path", { d: "M4 20h14", key: "svg-3" }]], $e = q("outline", "chart-bar", "ChartBar", Ue);
const Pe = [["path", { d: "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", key: "svg-0" }], ["path", { d: "M4 12l16 0", key: "svg-1" }]], Ke = q("outline", "layout-rows", "LayoutRows", Pe);
const Ve = [["path", { d: "M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", key: "svg-0" }], ["path", { d: "M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3", key: "svg-1" }]], de = q("outline", "tag", "Tag", Ve), ze = {
  IconLayoutRows: Ke,
  IconUser: Ae,
  IconPhoto: Oe,
  IconBox: _e,
  IconChartBar: $e,
  IconTag: de
  // 自定义顶层分类的通用图标
};
function ie(r) {
  return ze[r] ?? de;
}
function We({
  category: r,
  count: p,
  active: s,
  collapsed: f,
  expanded: y = !1,
  editing: N = !1,
  onCommitName: I,
  onCancelEdit: D,
  onActivate: v,
  onDropNode: u,
  onContextMenu: R
}) {
  const { t: M } = V(), j = (/* @__PURE__ */ new Set(["shots", "cast", "scene", "prop", "audio"])).has(r.id) ? M(`libraries.sidebar.builtinCategory.${r.id}`) : r.name, [g, C] = o.useState(!1), k = o.useRef(!1);
  o.useEffect(() => {
    N && (k.current = !1);
  }, [N]);
  const L = o.useCallback(
    (i) => {
      if (!u) return;
      const d = i.dataTransfer?.types;
      !d || !Array.from(d).includes("application/x-nomi-node-id") || (i.preventDefault(), i.dataTransfer.dropEffect = "move", g || C(!0));
    },
    [g, u]
  ), F = o.useCallback(() => {
    g && C(!1);
  }, [g]), O = o.useCallback(
    (i) => {
      if (!u) return;
      const d = i.dataTransfer?.getData("application/x-nomi-node-id");
      C(!1), d && (i.preventDefault(), u(d));
    },
    [u]
  );
  if (N && !f) {
    const i = ie(r.iconName);
    return /* @__PURE__ */ n.jsxs("div", { className: "w-full flex items-center gap-2 px-2 py-1.5 rounded-nomi-sm border border-nomi-accent/30 bg-nomi-accent/10 text-caption", children: [
      /* @__PURE__ */ n.jsx("span", { className: "w-3 shrink-0 text-micro text-nomi-ink-40", "aria-hidden": !0, children: y ? "▾" : "▸" }),
      /* @__PURE__ */ n.jsx(i, { size: 16, stroke: 1.5, className: "shrink-0", "aria-hidden": !0 }),
      /* @__PURE__ */ n.jsx(
        "input",
        {
          autoFocus: !0,
          defaultValue: j,
          "aria-label": M("sidebar.categoryName"),
          onFocus: (d) => d.currentTarget.select(),
          onClick: (d) => d.stopPropagation(),
          onKeyDown: (d) => {
            d.key === "Enter" ? (k.current = !0, I?.(d.currentTarget.value)) : d.key === "Escape" && (k.current = !0, D?.());
          },
          onBlur: (d) => {
            k.current || (k.current = !0, I?.(d.currentTarget.value));
          },
          className: "min-w-0 flex-1 bg-transparent border-b border-nomi-accent/50 text-caption text-nomi-ink outline-none"
        }
      )
    ] });
  }
  return /* @__PURE__ */ n.jsxs(
    "button",
    {
      type: "button",
      onClick: v,
      onContextMenu: R,
      onDragOver: L,
      onDragLeave: F,
      onDrop: O,
      "data-category-id": r.id,
      "data-active": s ? "true" : "false",
      title: f ? `${j} (${p})` : void 0,
      className: U(
        "w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-nomi-sm transition-colors",
        "text-caption leading-tight border border-transparent",
        s ? "bg-nomi-ink-10 text-nomi-accent" : "text-nomi-ink-80 hover:bg-nomi-ink-05 hover:text-nomi-ink",
        g && "ring-2 ring-nomi-accent border-nomi-accent",
        f && "justify-center px-0"
      ),
      children: [
        f ? null : /* @__PURE__ */ n.jsx("span", { className: "w-3 shrink-0 text-micro text-nomi-ink-40", "aria-hidden": !0, children: y ? "▾" : "▸" }),
        (() => {
          const i = ie(r.iconName);
          return /* @__PURE__ */ n.jsx(i, { size: 16, stroke: 1.5, className: "shrink-0", "aria-hidden": !0 });
        })(),
        f ? p > 0 ? /* @__PURE__ */ n.jsxs("span", { className: "sr-only", children: [
          j,
          " (",
          p,
          ")"
        ] }) : /* @__PURE__ */ n.jsx("span", { className: "sr-only", children: j }) : /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
          /* @__PURE__ */ n.jsx("span", { className: "flex-1 truncate", children: j }),
          p > 0 ? /* @__PURE__ */ n.jsx("span", { className: "text-micro text-nomi-ink-40 tabular-nums", children: p }) : null
        ] }),
        f && p > 0 ? /* @__PURE__ */ n.jsx(
          "span",
          {
            className: U(
              "absolute -mt-5 ml-3 rounded-full bg-nomi-accent text-nomi-paper text-micro leading-none",
              "px-1.5 py-[2px] tabular-nums"
            ),
            "aria-hidden": !0,
            children: p > 99 ? "99+" : p
          }
        ) : null
      ]
    }
  );
}
const He = /* @__PURE__ */ new Set([
  "text",
  "character",
  "scene",
  "image",
  "keyframe",
  "video",
  "shot",
  "output",
  "panorama"
]);
function ce({ node: r, active: p = !1, depth: s = 0, onSelect: f, onContextMenu: y }) {
  const { t: N } = V(), I = He.has(r.kind) ? r.kind : "fallback", D = o.useCallback(
    (u) => {
      u.dataTransfer.setData("application/x-nomi-node-id", r.id), u.dataTransfer.effectAllowed = "move";
    },
    [r.id]
  ), v = o.useCallback(() => {
    f?.(r.id);
  }, [r.id, f]);
  return /* @__PURE__ */ n.jsxs(
    "button",
    {
      type: "button",
      draggable: !0,
      onDragStart: D,
      onClick: v,
      onContextMenu: (u) => y?.(u, r.id),
      "data-node-id": r.id,
      "data-active": p ? "true" : "false",
      className: U(
        "w-full flex items-center gap-2 rounded-nomi-sm px-2 py-1.5 text-left transition-colors",
        "text-micro leading-tight border border-transparent",
        p ? "bg-nomi-ink-10 text-nomi-accent" : "text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink"
      ),
      style: { paddingLeft: `${8 + s * 10}px` },
      title: r.title || r.id,
      children: [
        /* @__PURE__ */ n.jsx(
          "span",
          {
            className: "grid place-items-center h-4 w-4 shrink-0 rounded-nomi-sm bg-nomi-ink-05 text-micro text-nomi-ink-40",
            "aria-hidden": !0,
            children: N(`libraries.sidebar.nodeKindShort.${I}`)
          }
        ),
        /* @__PURE__ */ n.jsx("span", { className: "min-w-0 flex-1 truncate", children: r.title || r.id }),
        r.derivedFrom ? /* @__PURE__ */ n.jsx(
          "span",
          {
            className: "shrink-0 rounded-full bg-nomi-accent/10 px-1.5 py-0.5 text-micro text-nomi-accent",
            title: N("sidebar.derivedNode"),
            children: "↩"
          }
        ) : null
      ]
    }
  );
}
const le = "rgba(160,132,90,0.18)";
function Je({
  group: r,
  nodes: p,
  selectedNodeIds: s,
  editing: f = !1,
  onCommitName: y,
  onCancelEdit: N,
  onSelectNode: I,
  onDropNode: D,
  onDropGroup: v,
  onContextMenu: u,
  onNodeContextMenu: R
}) {
  const { t: M } = V(), [E, j] = o.useState(!r.collapsed), [g, C] = o.useState(!1), k = o.useRef(!1);
  o.useEffect(() => {
    f && (k.current = !1);
  }, [f]);
  const L = o.useCallback(
    (i) => {
      i.dataTransfer.setData("application/x-nomi-group-id", r.id), i.dataTransfer.effectAllowed = "move";
    },
    [r.id]
  ), F = o.useCallback(
    (i) => {
      const d = Array.from(i.dataTransfer?.types || []);
      !d.includes("application/x-nomi-node-id") && !d.includes("application/x-nomi-group-id") || (i.preventDefault(), i.dataTransfer.dropEffect = "move", g || C(!0));
    },
    [g]
  ), O = o.useCallback(
    (i) => {
      const d = i.dataTransfer.getData("application/x-nomi-node-id"), B = i.dataTransfer.getData("application/x-nomi-group-id");
      if (C(!1), d) {
        i.preventDefault(), D?.(d, r.id);
        return;
      }
      B && B !== r.id && (i.preventDefault(), v?.(B, r.id));
    },
    [r.id, v, D]
  );
  return /* @__PURE__ */ n.jsxs(
    "div",
    {
      className: U(
        "rounded-nomi-sm border border-nomi-line/70 bg-nomi-paper/35",
        g && "ring-2 ring-nomi-accent/60"
      ),
      onDragOver: F,
      onDragLeave: () => C(!1),
      onDrop: O,
      children: [
        f ? /* @__PURE__ */ n.jsxs("div", { className: "w-full flex items-center gap-2 px-2 py-1.5 rounded-nomi-sm text-micro text-nomi-ink-60", children: [
          /* @__PURE__ */ n.jsx("span", { className: "w-3 text-micro text-nomi-ink-40", "aria-hidden": !0, children: E ? "▾" : "▸" }),
          /* @__PURE__ */ n.jsx(
            "span",
            {
              className: "h-2.5 w-2.5 rounded-full border border-nomi-line shrink-0",
              style: { backgroundColor: r.color || le },
              "aria-hidden": !0
            }
          ),
          /* @__PURE__ */ n.jsx(
            "input",
            {
              autoFocus: !0,
              defaultValue: r.name,
              "aria-label": M("libraries.sidebar.subgroupName"),
              onFocus: (i) => i.currentTarget.select(),
              onClick: (i) => i.stopPropagation(),
              onKeyDown: (i) => {
                i.key === "Enter" ? (k.current = !0, y?.(r.id, i.currentTarget.value)) : i.key === "Escape" && (k.current = !0, N?.());
              },
              onBlur: (i) => {
                k.current || (k.current = !0, y?.(r.id, i.currentTarget.value));
              },
              className: "min-w-0 flex-1 bg-transparent border-b border-nomi-accent/40 text-micro text-nomi-ink outline-none"
            }
          )
        ] }) : /* @__PURE__ */ n.jsxs(
          "button",
          {
            type: "button",
            draggable: !0,
            onDragStart: L,
            onClick: () => j((i) => !i),
            onContextMenu: (i) => u?.(i, r.id),
            "aria-expanded": E,
            className: U(
              "w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-nomi-sm",
              "text-micro text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05"
            ),
            title: r.name,
            children: [
              /* @__PURE__ */ n.jsx("span", { className: "w-3 text-micro text-nomi-ink-40", "aria-hidden": !0, children: E ? "▾" : "▸" }),
              /* @__PURE__ */ n.jsx(
                "span",
                {
                  className: "h-2.5 w-2.5 rounded-full border border-nomi-line shrink-0",
                  style: { backgroundColor: r.color || le },
                  "aria-hidden": !0
                }
              ),
              /* @__PURE__ */ n.jsx("span", { className: "min-w-0 flex-1 truncate", children: r.name }),
              /* @__PURE__ */ n.jsx("span", { className: "shrink-0 tabular-nums text-micro text-nomi-ink-40", children: p.length })
            ]
          }
        ),
        E ? /* @__PURE__ */ n.jsx("div", { className: "pb-1", children: p.length ? p.map((i) => /* @__PURE__ */ n.jsx(
          ce,
          {
            node: i,
            active: s.includes(i.id),
            depth: 1,
            onSelect: I,
            onContextMenu: R
          },
          i.id
        )) : /* @__PURE__ */ n.jsx("div", { className: "px-7 py-1.5 text-micro text-nomi-ink-30", children: M("libraries.sidebar.emptyGroup") }) }) : null
      ]
    }
  );
}
const Xe = "#d8c3a5";
function et({ categories: r, createCategoryNonce: p = 0 }) {
  const { t: s } = V(), f = A((e) => e.activeCategoryId), y = A((e) => e.setActiveCategoryId), N = A((e) => e.addCategory), I = A((e) => e.renameCategory), D = A((e) => e.deleteCategory), v = h((e) => e.nodes), u = h((e) => e.groups), R = h((e) => e.selectedNodeIds), M = h((e) => e.selectNode), E = h((e) => e.updateNode), j = h((e) => e.duplicateNodeForRegeneration), g = h((e) => e.copyNodeToCategory), C = h((e) => e.deleteNode), k = h((e) => e.createGroup), L = h((e) => e.renameGroup), F = h((e) => e.setGroupColor), O = h((e) => e.ungroup), i = h((e) => e.deleteGroup), d = h((e) => e.moveNodeToGroup), B = h((e) => e.removeNodeFromGroup), ue = h((e) => e.reorderGroup), [z, _] = o.useState(() => /* @__PURE__ */ new Set([f])), [b, W] = o.useState(null), [me, $] = o.useState(null), [pe, P] = o.useState(null), be = o.useMemo(() => (r && r.length ? r : X).filter((t) => !t.isHidden).map((t) => t.isBuiltin ? { ...t, name: s(`libraries.sidebar.builtinCategory.${t.id}`) } : t).slice().sort((t, a) => t.order - a.order), [r, s]);
  o.useEffect(() => {
    _((e) => {
      if (e.has(f)) return e;
      const t = new Set(e);
      return t.add(f), t;
    });
  }, [f]);
  const Q = Be();
  o.useEffect(() => {
    const e = Q?.categoryCounts;
    e?.length && _((t) => {
      const a = e.filter((x) => x.count > 0 && !t.has(x.categoryId));
      if (!a.length) return t;
      const l = new Set(t);
      for (const x of a) l.add(x.categoryId);
      return l;
    });
  }, [Q]), o.useEffect(() => {
    if (!b) return;
    const e = () => W(null), t = (a) => {
      a.key === "Escape" && e();
    };
    return window.addEventListener("click", e), window.addEventListener("keydown", t), () => {
      window.removeEventListener("click", e), window.removeEventListener("keydown", t);
    };
  }, [b]);
  const K = o.useCallback((e, t) => {
    e.preventDefault(), e.stopPropagation(), W({ ...t, x: e.clientX, y: e.clientY });
  }, []), c = o.useCallback(() => W(null), []), H = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const t of v) {
      const a = t.categoryId || "shots", l = e.get(a);
      l ? l.push(t) : e.set(a, [t]);
    }
    return e;
  }, [v]), w = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const t of v) e.set(t.id, t);
    return e;
  }, [v]), fe = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const t of u) {
      const a = e.get(t.categoryId);
      a ? a.push(t) : e.set(t.categoryId, [t]);
    }
    return e;
  }, [u]), ge = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const [t, a] of H)
      e.set(t, a.length);
    return e;
  }, [H]), Z = o.useCallback((e) => {
    _((t) => {
      const a = new Set(t);
      return a.has(e) ? a.delete(e) : a.add(e), a;
    });
  }, []), ee = o.useCallback((e) => {
    y(e), _((t) => {
      if (t.has(e)) return t;
      const a = new Set(t);
      return a.add(e), a;
    });
  }, [y]), xe = o.useCallback((e) => {
    const t = !z.has(e);
    Z(e), t && y(e);
  }, [z, y, Z]), te = o.useCallback((e) => {
    M(e), window.dispatchEvent(new CustomEvent("nomi-focus-generation-node", { detail: { nodeId: e } }));
  }, [M]), he = o.useCallback((e, t) => {
    const a = w.get(e);
    if (!a) return;
    if (a.categoryId === t) {
      B(e);
      return;
    }
    const l = g(e, t);
    if (l) {
      const S = oe(t) ? s(`libraries.sidebar.builtinCategory.${t}`) : t;
      se({
        message: s("libraries.sidebar.copiedTo", { target: S }),
        onUndo: () => C(l.id)
      });
    }
  }, [g, C, w, B, s]), ye = o.useCallback((e, t) => {
    const a = w.get(e), l = u.find((S) => S.id === t);
    if (!a || !l) return;
    if (a.categoryId === l.categoryId) {
      d(e, t);
      return;
    }
    const x = g(e, l.categoryId);
    if (x) {
      d(x.id, t);
      const m = oe(l.categoryId) ? s(`libraries.sidebar.builtinCategory.${l.categoryId}`) : l.categoryId;
      se({
        message: s("libraries.sidebar.copiedToGroup", { target: m, group: l.name }),
        onUndo: () => C(x.id)
      });
    }
  }, [g, C, u, d, w, s]), Ce = o.useCallback((e) => {
    const t = k(e);
    t && (ee(e), _((a) => new Set(a).add(e)), $(t.id)), c();
  }, [c, k, ee]), ke = o.useCallback((e, t) => {
    const a = t.trim();
    a && L(e, a), $(null);
  }, [L]), Ne = o.useCallback(() => $(null), []), ne = o.useCallback(() => {
    const e = N();
    e && (y(e.id), _((t) => new Set(t).add(e.id)), P(e.id));
  }, [N, y]), ae = o.useRef(0);
  o.useEffect(() => {
    p !== ae.current && (ae.current = p, p > 0 && ne());
  }, [p, ne]);
  const ve = o.useCallback((e, t) => {
    const a = t.trim();
    a && I(e, a), P(null);
  }, [I]), we = o.useCallback(() => P(null), []), je = o.useCallback((e) => {
    P(e), c();
  }, [c]), Ie = o.useCallback(async (e) => {
    const a = (r || X).find((x) => x.id === e)?.name || e;
    c(), await Y({
      title: s("libraries.sidebar.deleteCategoryTitle"),
      message: s("libraries.sidebar.deleteCategoryMessage", { name: a }),
      confirmLabel: s("common.delete"),
      danger: !0
    }) && D(e);
  }, [r, c, D, s]), De = o.useCallback((e) => {
    const a = w.get(e)?.categoryId;
    a && g(e, a), c();
  }, [c, g, w]), Te = o.useCallback(async (e) => {
    const t = w.get(e);
    if (!t) return;
    c();
    const a = await re({ title: s("libraries.sidebar.nodeName"), initialValue: t.title || t.id });
    a !== null && a.trim() && E(e, { title: a.trim() });
  }, [c, w, E, s]), Ge = o.useCallback((e) => {
    j(e), c();
  }, [c, j]), Me = o.useCallback(async (e) => {
    const a = w.get(e)?.title || e;
    c(), await Y({
      title: s("libraries.sidebar.deleteNodeTitle"),
      message: s("libraries.sidebar.deleteNodeMessage", { name: a }),
      confirmLabel: s("common.delete"),
      danger: !0
    }) && C(e);
  }, [c, C, w, s]), Ee = o.useCallback((e) => {
    $(e), c();
  }, [c]), Se = o.useCallback(async (e) => {
    const t = u.find((l) => l.id === e);
    if (!t) return;
    c();
    const a = await re({ title: s("libraries.sidebar.groupColor"), message: s("libraries.sidebar.groupColorMessage"), initialValue: t.color || Xe });
    a !== null && F(e, a);
  }, [c, u, F, s]), Re = o.useCallback((e) => {
    O(e), c();
  }, [c, O]), Le = o.useCallback(async (e) => {
    const t = u.find((l) => l.id === e);
    if (!t) return;
    c(), await Y({
      title: s("libraries.sidebar.deleteGroupTitle"),
      message: s("libraries.sidebar.deleteGroupMessage", { name: t.name, count: t.nodeIds.length }),
      confirmLabel: s("common.delete"),
      danger: !0
    }) && i(e, !0);
  }, [c, i, u, s]), Fe = () => {
    if (!b) return null;
    const e = "w-full px-2.5 py-1 text-left text-caption text-nomi-ink-80 hover:bg-nomi-ink-05", t = "w-full px-2.5 py-1 text-left text-caption text-workbench-danger hover:bg-workbench-danger-soft";
    return /* @__PURE__ */ n.jsxs(
      "div",
      {
        role: "menu",
        className: "fixed z-50 min-w-[120px] overflow-hidden rounded-nomi-sm border border-nomi-line bg-nomi-paper py-1 shadow-workbench-pop",
        style: { left: b.x, top: b.y },
        onClick: (a) => a.stopPropagation(),
        onContextMenu: (a) => a.preventDefault(),
        children: [
          b.type === "category" ? (() => {
            const a = (r || X).find((x) => x.id === b.categoryId), l = a ? !a.isBuiltin : !1;
            return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
              /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Ce(b.categoryId), children: s("libraries.sidebar.createGroup") }),
              l ? /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
                /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => je(b.categoryId), children: s("libraries.sidebar.rename") }),
                /* @__PURE__ */ n.jsx("div", { className: "my-0.5 h-px bg-nomi-line" }),
                /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: t, onClick: () => Ie(b.categoryId), children: s("libraries.sidebar.deleteCategory") })
              ] }) : null
            ] });
          })() : null,
          b.type === "node" ? /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => De(b.nodeId), children: s("libraries.sidebar.copy") }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Te(b.nodeId), children: s("libraries.sidebar.rename") }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Ge(b.nodeId), children: s("libraries.sidebar.regenerateDerived") }),
            /* @__PURE__ */ n.jsx("div", { className: "my-0.5 h-px bg-nomi-line" }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: t, onClick: () => Me(b.nodeId), children: s("common.delete") })
          ] }) : null,
          b.type === "group" ? /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Ee(b.groupId), children: s("libraries.sidebar.rename") }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Se(b.groupId), children: s("libraries.sidebar.changeColor") }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: e, onClick: () => Re(b.groupId), children: s("libraries.sidebar.ungroup") }),
            /* @__PURE__ */ n.jsx("div", { className: "my-0.5 h-px bg-nomi-line" }),
            /* @__PURE__ */ n.jsx("button", { type: "button", role: "menuitem", className: t, onClick: () => Le(b.groupId), children: s("libraries.sidebar.deleteWithNodes") })
          ] }) : null
        ]
      }
    );
  };
  return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsx("nav", { className: "flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1", children: be.map((e) => {
      const t = H.get(e.id) || [], a = fe.get(e.id) || [], l = new Set(a.flatMap((m) => m.nodeIds)), x = t.filter((m) => !l.has(m.id)), S = z.has(e.id);
      return /* @__PURE__ */ n.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ n.jsx(
          We,
          {
            category: e,
            count: ge.get(e.id) || 0,
            active: f === e.id,
            collapsed: !1,
            expanded: S,
            editing: pe === e.id,
            onCommitName: (m) => ve(e.id, m),
            onCancelEdit: we,
            onActivate: () => xe(e.id),
            onDropNode: (m) => he(m, e.id),
            onContextMenu: (m) => K(m, { type: "category", categoryId: e.id })
          }
        ),
        S ? /* @__PURE__ */ n.jsxs("div", { className: "ml-5 flex flex-col gap-1 border-l border-nomi-line/70 pl-2", children: [
          x.map((m) => /* @__PURE__ */ n.jsx(
            ce,
            {
              node: m,
              active: R.includes(m.id),
              onSelect: te,
              onContextMenu: (J, T) => K(J, { type: "node", nodeId: T })
            },
            m.id
          )),
          a.map((m) => {
            const J = m.nodeIds.flatMap((T) => {
              const G = w.get(T);
              return G && G.categoryId === m.categoryId ? [G] : [];
            });
            return /* @__PURE__ */ n.jsx(
              Je,
              {
                group: m,
                nodes: J,
                selectedNodeIds: R,
                editing: me === m.id,
                onCommitName: ke,
                onCancelEdit: Ne,
                onSelectNode: te,
                onDropNode: ye,
                onDropGroup: (T, G) => ue(e.id, T, G),
                onContextMenu: (T, G) => K(T, { type: "group", groupId: G }),
                onNodeContextMenu: (T, G) => K(T, { type: "node", nodeId: G })
              },
              m.id
            );
          }),
          !x.length && !a.length ? /* @__PURE__ */ n.jsx("div", { className: "px-2 py-1.5 text-micro text-nomi-ink-30", children: s("libraries.sidebar.noNodes") }) : null
        ] }) : null
      ] }, e.id);
    }) }),
    Fe()
  ] });
}
export {
  et as default
};
