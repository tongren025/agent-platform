import { aR as Ue, S as c, bs as ce, dV as H, aN as Ke, bT as pt, b3 as ft, bH as bt, dc as ht, dK as X, dx as C, c8 as s, h as Ge, aJ as y, u as gt, f as Be, o as Ce, H as be, w as $e, l as xt, a1 as yt, a4 as kt, a2 as vt, p as Ve, s as jt, a3 as wt, x as Lt, ck as St, bX as E, ab as At } from "./agentStudioMount-DueN8bR4.js";
import { u as It } from "./index-BzvhSK0O.js";
import { a as He, b as Ct, I as Nt } from "./IconStarFilled-BMNlYjv_.js";
import { I as Ft } from "./IconFolderPlus-BlQ3d2y9.js";
import { a as Ne, u as Tt, f as Dt } from "./useAssetPool-CW8puyw4.js";
import { b as Et } from "./workspaceFileDrag-CNxBSF4X.js";
import { A as Fe, d as Pt, c as Mt, b as Rt, a as We, s as _t } from "./assetLibraryDrag-DG98WJrf.js";
import { l as Ot, I as zt } from "./useNodeRelationships-DYafoI9a.js";
import { I as Ut } from "./IconEyeOff-D2I87hGE.js";
import { b as Kt } from "./IconFolder-yn2TEQim.js";
import { I as Gt } from "./IconMusic-D8s6hV8i.js";
import { I as Ye } from "./IconPlayerPlayFilled-CLdhMvl0.js";
const Bt = [["path", { d: "M15 6l-6 6l6 6", key: "svg-0" }]], $t = Ue("outline", "chevron-left", "ChevronLeft", Bt);
const Vt = [["path", { d: "M15 8h.01", key: "svg-0" }], ["path", { d: "M11 21h-5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5", key: "svg-1" }], ["path", { d: "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l2 2", key: "svg-2" }], ["path", { d: "M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138", key: "svg-3" }]], Te = Ue("outline", "photo-star", "PhotoStar", Vt), Ht = 500;
function Wt(e) {
  if (!Array.isArray(e)) return [];
  const t = /* @__PURE__ */ new Set();
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const r = String(i.id || "").trim();
    r && t.add(r);
  }
  return [...t];
}
function Yt(e) {
  const t = typeof e.data.mediaType == "string" ? e.data.mediaType.toLowerCase() : "";
  if (t === "image" || t === "video" || t === "audio") return t;
  const i = typeof e.data.contentType == "string" ? e.data.contentType.toLowerCase() : "";
  return i.startsWith("image/") ? "image" : i.startsWith("video/") ? "video" : i.startsWith("audio/") ? "audio" : /\.(png|jpe?g|webp|gif|avif)$/i.test(e.name) ? "image" : /\.(mp4|webm|mov|m4v)$/i.test(e.name) ? "video" : /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(e.name) ? "audio" : null;
}
function Jt(e) {
  if (e.name.endsWith(".meta")) return null;
  const t = Yt(e);
  if (!t) return null;
  const i = String(e.projectId || "").trim(), r = typeof e.data.relativePath == "string" ? e.data.relativePath.trim() : "";
  if (!i || !r) return null;
  const o = typeof e.data.url == "string" && e.data.url.trim() ? e.data.url.trim() : Et(i, r);
  return {
    id: `${i}:${r}`,
    kind: t,
    name: e.name || r.split("/").pop() || t,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    renderUrl: o,
    ownerNodeId: typeof e.data.ownerNodeId == "string" && e.data.ownerNodeId.trim() ? e.data.ownerNodeId.trim() : void 0,
    source: "project",
    origin: { source: "project", projectId: i, relativePath: r }
  };
}
function De(e) {
  const t = e.updatedAt ? Date.parse(e.updatedAt) : 0;
  if (Number.isFinite(t) && t > 0) return t;
  const i = e.createdAt ? Date.parse(e.createdAt) : 0;
  if (Number.isFinite(i) && i > 0) return i;
  const r = e.id.match(/\d{12,}/)?.[0];
  return r ? Number(r) : 0;
}
function qt(...e) {
  const t = /* @__PURE__ */ new Map();
  for (const i of e)
    for (const r of i) {
      const o = r.renderUrl || r.id;
      t.has(o) || t.set(o, r);
    }
  return [...t.values()].sort((i, r) => {
    const o = De(r) - De(i);
    if (o !== 0) return o;
    const n = i.name.localeCompare(r.name, "zh-CN");
    return n !== 0 ? n : i.id.localeCompare(r.id);
  });
}
function Xt() {
  const [e, t] = c.useState([]), [i, r] = c.useState(!1), [o, n] = c.useState(0), u = c.useCallback(() => n((l) => l + 1), []);
  return c.useEffect(() => {
    let l = !1;
    return (async () => {
      const d = ce();
      if (!d?.projects || !d.assets?.list) {
        t([]), r(!1);
        return;
      }
      r(!0);
      const p = d.projects.listAsync ? await d.projects.listAsync() : d.projects.list(), m = Wt(p), g = [];
      for (const k of m) {
        let x = null;
        do
          try {
            const w = await d.assets.list({ projectId: k, cursor: x, limit: Ht });
            for (const A of w.items) {
              const N = Jt(A);
              N && g.push(N);
            }
            x = w.cursor;
          } catch {
            x = null;
          }
        while (x && !l);
        if (l) return;
      }
      l || (t(qt(g)), r(!1));
    })().catch(() => {
      l || (t([]), r(!1));
    }), () => {
      l = !0;
    };
  }, [o]), { assets: e, loading: i, refresh: u };
}
const Ee = { version: 1, folders: [], assignments: {} };
function Zt(e, t, i) {
  return i ? e.filter((r) => t[r.renderUrl] === i) : e.filter((r) => !t[r.renderUrl]);
}
function Qt(e, t) {
  const i = /* @__PURE__ */ new Map();
  for (const r of e) {
    const o = t[r.renderUrl];
    o && i.set(o, (i.get(o) ?? 0) + 1);
  }
  return i;
}
function en() {
  return `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function tn(e) {
  const t = ce(), i = !!(e && t?.assets?.foldersGet && t?.assets?.foldersSave), [r, o] = c.useState(Ee);
  c.useEffect(() => {
    let d = !1;
    if (o(Ee), !(!e || !t?.assets?.foldersGet))
      return t.assets.foldersGet({ projectId: e }).then((p) => {
        !d && p?.ok && o(p.state);
      }).catch(() => {
      }), () => {
        d = !0;
      };
  }, [e]);
  const n = c.useCallback(
    (d) => {
      o((p) => {
        const m = d(p);
        return e && t?.assets?.foldersSave && t.assets.foldersSave({ projectId: e, state: m }).catch(() => {
        }), m;
      });
    },
    [t, e]
  ), u = c.useCallback((d) => {
    const p = d.trim();
    p && n((m) => ({
      ...m,
      folders: [...m.folders, { id: en(), label: p, order: m.folders.length }]
    }));
  }, [n]), l = c.useCallback((d) => {
    n((p) => ({
      version: 1,
      folders: p.folders.filter((m) => m.id !== d),
      // 删夹不删素材:该夹归属清掉,素材回到未分类(never-wipe:文件本体不动)。
      assignments: Object.fromEntries(Object.entries(p.assignments).filter(([, m]) => m !== d))
    }));
  }, [n]), h = c.useCallback((d, p) => {
    d.length !== 0 && n((m) => {
      const g = { ...m.assignments };
      for (const k of d)
        k && (p ? g[k] = p : delete g[k]);
      return { ...m, assignments: g };
    });
  }, [n]);
  return { state: r, available: i, createFolder: u, deleteFolder: l, assignAssets: h };
}
function nn(e) {
  const { folderApi: t, visibleAssetsRef: i, selectedIdsRef: r, setSelectedIds: o, lastSelectedIdRef: n, setActiveFolderId: u, collectSelection: l } = e, { t: h } = H(), d = c.useCallback((g, k) => {
    const x = r.current, w = l(i.current, x, g);
    x.has(g.id) || (o(/* @__PURE__ */ new Set([g.id])), n.current = g.id), k.dataTransfer.setData(Fe, Pt(w.map((A) => A.renderUrl))), k.dataTransfer.effectAllowed = "copy", k.dataTransfer.setData("text/plain", w.length > 1 ? `${w.length} 个素材` : g.name);
  }, [l, n, r, o, i]), p = c.useCallback((g, k) => {
    k.preventDefault();
    const x = Mt(k.dataTransfer.getData(Fe)), w = Rt(k.dataTransfer.getData(We)).map((N) => N.renderUrl), A = x.length > 0 ? x : w;
    A.length > 0 && t.assignAssets(A, g);
  }, [t]), m = c.useCallback((g) => {
    const k = t.state.folders.find((x) => x.id === g);
    k && Ke({
      title: h("assetLibrary.confirmDeleteFolderTitle", { label: k.label }),
      message: h("assetLibrary.confirmDeleteFolderMessage"),
      confirmLabel: h("assetLibrary.delete"),
      danger: !0
    }).then((x) => {
      x && (t.deleteFolder(g), u((w) => w === g ? null : w));
    });
  }, [t, u, h]);
  return { handleFolderAssignDragStart: d, handleFolderDropAssets: p, handleDeleteFolder: m };
}
const rn = 200 * 1024 * 1024;
new Set(ft("audio"));
function sn(e) {
  return [e.name || "", e.type || "", typeof e.size == "number" ? e.size : 0].join("|");
}
function on(e) {
  const t = /* @__PURE__ */ new Set();
  let i = 0, r = 0;
  const o = [];
  for (const n of e) {
    const u = sn(n);
    if (t.has(u)) {
      i += 1;
      continue;
    }
    if (t.add(u), (typeof n.size == "number" ? n.size : 0) > rn) {
      r += 1;
      continue;
    }
    o.push(n);
  }
  return { files: o, skippedDuplicateCount: i, skippedTooLargeCount: r };
}
async function an(e, t) {
  const i = on(e);
  let r = 0;
  return await Promise.all(
    i.files.map(async (o) => {
      try {
        await pt(o, o.name, { projectId: t.projectId });
      } catch (n) {
        r += 1, console.error("asset library audio upload failed", n);
      }
    })
  ), {
    uploadedCount: i.files.length - r,
    skippedDuplicateCount: i.skippedDuplicateCount,
    skippedTooLargeCount: i.skippedTooLargeCount,
    failedCount: r
  };
}
const ln = /* @__PURE__ */ new Set(["character", "scene", "prop"]), cn = /* @__PURE__ */ new Set(["upload", "clipboard-url", "drop"]);
function dn(e) {
  if (e.kind === "asset") return "reference";
  const t = typeof e.meta?.source == "string" ? e.meta.source : void 0;
  return t && cn.has(t) ? "reference" : "film";
}
function un(e) {
  const t = e.result;
  return t?.thumbnailUrl || t?.url || t?.providerUrl || void 0;
}
function mn(e) {
  const t = e.result?.provenance?.timestamp;
  if (typeof t == "number") return t;
  const i = e.meta?.createdAt;
  return typeof i == "number" ? i : 0;
}
function pn(e, t) {
  let i = e;
  const r = /* @__PURE__ */ new Set([i.id]);
  for (; ; ) {
    const o = i.derivedFrom || i.regeneratedFrom;
    if (!o || r.has(o)) break;
    const n = t.get(o);
    if (!n) break;
    r.add(o), i = n;
  }
  return i.id;
}
function fn(e, t) {
  const i = new Map(e.map((o) => [o.id, o])), r = [];
  for (const o of e) {
    if (ln.has(o.kind)) continue;
    const n = un(o);
    if (!n) continue;
    const u = typeof o.meta?.mark == "string" ? o.meta.mark : void 0, l = typeof o.meta?.autoGroup == "string" ? o.meta.autoGroup : void 0;
    r.push({
      nodeId: o.id,
      title: o.title || o.prompt?.slice(0, 24) || "未命名",
      prompt: o.prompt,
      thumbUrl: n,
      zone: dn(o),
      createdAt: mn(o),
      mark: u,
      mounted: Ot(o.id, e, t),
      variantRootId: pn(o, i),
      categoryId: o.categoryId || "shots",
      autoGroupName: l
    });
  }
  return r;
}
function bn(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const o = t.get(r.variantRootId);
    o ? o.push(r) : t.set(r.variantRootId, [r]);
  }
  const i = [];
  for (const [r, o] of t) {
    const n = [...o].sort((u, l) => l.createdAt - u.createdAt);
    i.push({ rootId: r, cover: n[0], items: n });
  }
  return i;
}
function hn(e) {
  const t = e.filter((r) => r.kind === "scene").map((r) => r.title).filter(Boolean), i = e.filter((r) => r.kind === "character").map((r) => r.title).filter(Boolean);
  return [t.join("+"), i.join("+")].filter(Boolean).join(" · ") || "未命名";
}
function gn(e, t = Je) {
  const i = /* @__PURE__ */ new Map(), r = [];
  for (const n of e) {
    const u = n.cover.mounted;
    let l, h;
    if (u.length > 0)
      l = `card:${u.map((p) => p.id).sort().join("|")}`, h = hn(u);
    else if (n.cover.autoGroupName)
      l = `ai:${n.cover.autoGroupName}`, h = n.cover.autoGroupName;
    else {
      r.push(n);
      continue;
    }
    const d = i.get(l);
    d ? d.stacks.push(n) : i.set(l, { key: l, name: h, stacks: [n] });
  }
  const o = [];
  for (const n of i.values())
    n.stacks.length >= t ? o.push(n) : r.push(...n.stacks);
  return o.sort((n, u) => u.stacks.length - n.stacks.length), r.sort((n, u) => u.cover.createdAt - n.cover.createdAt), { groups: o, ungrouped: r };
}
const xn = 0.7, Je = 2;
function yn(e) {
  return [
    "你是素材整理助手。下面是一批视频镜头，每条有 id 和它的画面描述。",
    '请把"画面内容相近"的归成几堆，每堆起一个简短大白话名字（像相册："雪地里的林夏"、"雨夜街头"）。',
    "规则：① 只把确实相近的（≥2 条）归一堆；② 拿不准的别硬归，留着不分；③ 名字用中文、≤8 字，点出 场景/谁/在干嘛；④ 严格只输出下面格式的 JSON，不要任何解释。",
    "镜头：",
    ...e.map((i) => `- id=${i.nodeId}: ${(i.prompt || i.title || "").replace(/\s+/g, " ").slice(0, 120)}`),
    "只输出这个 JSON（confidence 0~1，表示这堆归得有多准）：",
    '{"groups":[{"name":"雪地里的林夏","nodeIds":["id1","id2"],"confidence":0.9}]}'
  ].join(`
`);
}
function kn(e) {
  if (!e) return null;
  const t = e.indexOf("{"), i = e.lastIndexOf("}");
  if (t < 0 || i <= t) return null;
  try {
    return JSON.parse(e.slice(t, i + 1));
  } catch {
    return null;
  }
}
function vn(e, t, i) {
  const r = xn, o = Je, n = new Set(t), u = /* @__PURE__ */ new Set(), l = [], h = kn(e), d = Array.isArray(h?.groups) ? h.groups : [];
  for (const m of d) {
    const g = typeof m?.name == "string" ? m.name.trim() : "", k = typeof m?.confidence == "number" ? m.confidence : 1, x = Array.isArray(m?.nodeIds) ? m.nodeIds : [];
    if (!g || k < r) continue;
    const w = x.filter((A) => typeof A == "string" && n.has(A) && !u.has(A));
    w.length < o || (w.forEach((A) => u.add(A)), l.push({ name: g, nodeIds: w }));
  }
  const p = t.filter((m) => !u.has(m));
  return { groups: l, ungroupedIds: p };
}
async function jn(e, t) {
  const i = e.map((u) => u.nodeId);
  if (e.length < 2) return { groups: [], ungroupedIds: i };
  const r = await bt();
  if (!r) throw new Error("请先在「模型接入」里启用一个文本模型");
  const o = yn(e);
  let n = "";
  return await ht(
    r.vendor,
    { kind: "chat", prompt: o, extras: { modelKey: r.modelKey } },
    { signal: t, onDelta: (u) => {
      n += u;
    } }
  ), vn(n, i);
}
const wn = "nomi-focus-generation-node";
function Ln(e, t) {
  if (!t) return !0;
  const i = t.toLowerCase();
  return e.items.some(
    (r) => `${r.title} ${r.prompt || ""} ${r.mounted.map((o) => o.title).join(" ")}`.toLowerCase().includes(i)
  );
}
function Sn({
  stack: e,
  onOpen: t,
  onToggleStar: i
}) {
  const { t: r } = H(), { cover: o } = e, n = e.items.length, u = !!o.mark;
  return /* @__PURE__ */ s.jsxs(
    "div",
    {
      role: "button",
      tabIndex: 0,
      className: y(
        "group relative block w-full text-left rounded-nomi-sm overflow-hidden border border-nomi-line bg-nomi-ink-05 cursor-pointer",
        "transition-[box-shadow,border-color] duration-[var(--nomi-transition-fast)] hover:border-nomi-accent"
      ),
      title: o.title,
      onClick: () => t(o.nodeId),
      onKeyDown: (l) => {
        (l.key === "Enter" || l.key === " ") && (l.preventDefault(), t(o.nodeId));
      },
      children: [
        /* @__PURE__ */ s.jsx("span", { className: "block aspect-square", children: /* @__PURE__ */ s.jsx(be, { className: "w-full h-full object-cover", thumbnailSrc: o.thumbUrl, src: o.thumbUrl, alt: o.title }) }),
        n > 1 ? /* @__PURE__ */ s.jsxs("span", { className: y("absolute top-1 right-1 px-1.5 py-px rounded-full text-micro leading-none bg-nomi-ink text-nomi-paper"), children: [
          "×",
          n
        ] }) : null,
        /* @__PURE__ */ s.jsx(
          "button",
          {
            type: "button",
            "aria-label": r(u ? "assetLibrary.finder.unmark" : "assetLibrary.finder.markPrimary"),
            title: r(u ? "assetLibrary.finder.unmark" : "assetLibrary.finder.markPrimary"),
            onClick: (l) => {
              l.stopPropagation(), i(o.nodeId);
            },
            className: y(
              "absolute top-1 left-1 w-[18px] h-[18px] grid place-items-center rounded-full border-0 cursor-pointer",
              u ? "bg-nomi-accent text-nomi-paper" : "bg-nomi-paper/85 text-nomi-ink-40 opacity-0 group-hover:opacity-100 hover:text-nomi-ink"
            ),
            children: u ? /* @__PURE__ */ s.jsx(Ct, { size: 12 }) : /* @__PURE__ */ s.jsx(He, { size: 12, stroke: 1.5 })
          }
        ),
        /* @__PURE__ */ s.jsx("span", { className: y("block px-1.5 pt-1 pb-1.5 text-micro text-nomi-ink-80 truncate"), children: o.title })
      ]
    }
  );
}
function pe({
  title: e,
  count: t,
  stacks: i,
  onOpen: r,
  onToggleStar: o
}) {
  return /* @__PURE__ */ s.jsxs("div", { className: "mb-3", children: [
    e ? /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-1.5 px-1 pb-1.5 text-caption text-nomi-ink-60", children: [
      /* @__PURE__ */ s.jsx("span", { className: "font-semibold text-nomi-ink-80 truncate", children: e }),
      typeof t == "number" ? /* @__PURE__ */ s.jsx("span", { className: "text-nomi-ink-30", children: t }) : null
    ] }) : null,
    /* @__PURE__ */ s.jsx("div", { className: "grid grid-cols-2 gap-2", children: i.map((n) => /* @__PURE__ */ s.jsx(Sn, { stack: n, onOpen: r, onToggleStar: o }, n.rootId)) })
  ] });
}
function An() {
  const { t: e } = H(), t = X((f) => f.nodes), i = X((f) => f.edges), r = X((f) => f.selectNode), o = X((f) => f.updateNode), [n, u] = c.useState("film"), [l, h] = c.useState(""), [d, p] = c.useState(!1), m = c.useMemo(() => fn(t, i), [t, i]), g = c.useMemo(
    () => ({
      film: m.filter((f) => f.zone === "film").length,
      reference: m.filter((f) => f.zone === "reference").length
    }),
    [m]
  ), k = c.useMemo(() => {
    const f = m.filter((S) => S.zone === n && (!d || S.mark));
    return bn(f).filter((S) => Ln(S, l)).sort((S, L) => L.cover.createdAt - S.cover.createdAt);
  }, [m, n, d, l]), x = c.useMemo(
    () => n === "film" ? gn(k) : null,
    [n, k]
  ), w = c.useCallback(
    (f) => {
      r(f), window.dispatchEvent(new CustomEvent(wn, { detail: { nodeId: f } }));
    },
    [r]
  ), A = c.useCallback(
    (f) => {
      const S = t.find((M) => M.id === f);
      if (!S) return;
      const L = S.meta || {};
      o(f, { meta: { ...L, mark: L.mark ? void 0 : "主镜" } });
    },
    [t, o]
  ), [N, G] = c.useState(!1), D = c.useMemo(
    () => (x?.ungrouped || []).map((f) => f.cover).filter((f) => !!(f.prompt && f.prompt.trim())),
    [x]
  ), Y = c.useCallback(async () => {
    if (!(D.length < 2 || N)) {
      G(!0);
      try {
        const f = await jn(D.map((L) => ({ nodeId: L.nodeId, prompt: L.prompt, title: L.title })));
        let S = 0;
        for (const L of f.groups)
          for (const M of L.nodeIds) {
            const O = t.find((re) => re.id === M);
            if (!O) continue;
            const z = O.meta || {};
            o(M, { meta: { ...z, autoGroup: L.name } }), S += 1;
          }
        C(S ? e("assetLibrary.finder.grouped", { groups: f.groups.length, count: S }) : e("assetLibrary.finder.noCertainGroup"), S ? "success" : "info");
      } catch (f) {
        C(f instanceof Error ? f.message : e("assetLibrary.finder.aiGroupingFailed"), "error");
      } finally {
        G(!1);
      }
    }
  }, [D, N, t, o, e]), ne = (f, S, L, M) => /* @__PURE__ */ s.jsxs(
    "button",
    {
      type: "button",
      onClick: () => u(f),
      className: y(
        "flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-micro rounded-nomi-sm",
        n === f ? "bg-nomi-paper text-nomi-ink shadow-nomi-sm" : "text-nomi-ink-40 hover:text-nomi-ink-60"
      ),
      children: [
        /* @__PURE__ */ s.jsx(M, { size: 14, stroke: 1.5 }),
        S,
        " ",
        /* @__PURE__ */ s.jsx("span", { className: "text-nomi-ink-30", children: L })
      ]
    }
  ), Z = n === "film" ? g.film : g.reference, P = k.length === 0;
  return /* @__PURE__ */ s.jsxs("div", { className: "flex flex-col h-full min-h-0", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "px-2 pt-2 pb-1.5 flex flex-col gap-2", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-0.5 rounded-nomi-sm bg-nomi-bg p-0.5", children: [
        ne("film", e("assetLibrary.finder.film"), g.film, Ce),
        ne("reference", e("assetLibrary.finder.reference"), g.reference, Te)
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ s.jsx(Ge, { className: "flex-1", placeholder: e("assetLibrary.finder.search"), ariaLabel: e("assetLibrary.finder.searchAria"), value: l, onChange: h }),
        /* @__PURE__ */ s.jsx(
          "button",
          {
            type: "button",
            "aria-pressed": d,
            title: e("assetLibrary.finder.markedOnly"),
            onClick: () => p((f) => !f),
            className: y(
              "shrink-0 inline-flex items-center justify-center w-[30px] h-[30px] rounded-full border",
              d ? "bg-nomi-accent text-nomi-paper border-nomi-accent" : "bg-nomi-paper text-nomi-ink-40 border-nomi-line hover:text-nomi-ink"
            ),
            children: /* @__PURE__ */ s.jsx(He, { size: 14, stroke: 1.5 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ s.jsxs("div", { className: "flex-1 overflow-y-auto px-2 pb-3", children: [
      n === "film" && D.length >= 2 && !P ? /* @__PURE__ */ s.jsxs(
        "button",
        {
          type: "button",
          onClick: Y,
          disabled: N,
          className: y(
            "mb-2 w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-nomi-sm text-caption",
            "border border-nomi-line bg-nomi-paper text-nomi-ink-80 hover:border-nomi-accent hover:text-nomi-ink",
            "disabled:opacity-60 disabled:cursor-default"
          ),
          title: e("assetLibrary.finder.aiGroupHint"),
          children: [
            /* @__PURE__ */ s.jsx(gt, { size: 14, stroke: 1.5, className: "text-nomi-accent" }),
            N ? e("assetLibrary.finder.grouping") : e("assetLibrary.finder.groupUngrouped", { count: D.length })
          ]
        }
      ) : null,
      P ? /* @__PURE__ */ s.jsx(
        Be,
        {
          density: "inline",
          icon: n === "film" ? /* @__PURE__ */ s.jsx(Ce, { size: 32, stroke: 1.5, className: "text-nomi-ink-30" }) : /* @__PURE__ */ s.jsx(Te, { size: 32, stroke: 1.5, className: "text-nomi-ink-30" }),
          title: e(Z === 0 ? n === "film" ? "assetLibrary.finder.noFilm" : "assetLibrary.finder.noReference" : "assetLibrary.finder.noMatches"),
          description: e(l || d ? "assetLibrary.finder.filteredEmpty" : n === "film" ? "assetLibrary.finder.filmEmpty" : "assetLibrary.finder.referenceEmpty")
        }
      ) : n === "film" && x ? /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
        x.groups.map((f) => /* @__PURE__ */ s.jsx(pe, { title: f.name, count: f.stacks.length, stacks: f.stacks, onOpen: w, onToggleStar: A }, f.key)),
        x.ungrouped.length > 0 ? /* @__PURE__ */ s.jsx(
          pe,
          {
            title: x.groups.length > 0 ? e("assetLibrary.finder.ungrouped") : void 0,
            count: x.groups.length > 0 ? x.ungrouped.length : void 0,
            stacks: x.ungrouped,
            onOpen: w,
            onToggleStar: A
          }
        ) : null
      ] }) : /* @__PURE__ */ s.jsx(pe, { stacks: k, onOpen: w, onToggleStar: A })
    ] })
  ] });
}
const te = ["image", "video", "audio"], qe = [
  { value: "all", labelKey: "assetLibrary.all" },
  { value: "image", labelKey: "assetLibrary.image" },
  { value: "video", labelKey: "assetLibrary.video" },
  { value: "audio", labelKey: "assetLibrary.audio" }
], In = {
  image: "assetLibrary.image",
  video: "assetLibrary.video",
  audio: "assetLibrary.audio"
}, Cn = {
  image: Ve,
  video: Ye,
  audio: Gt
};
function Pe({ kind: e, compact: t = !1 }) {
  const { t: i } = H(), r = Cn[e];
  return /* @__PURE__ */ s.jsxs(
    "span",
    {
      className: y(
        "absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full",
        "bg-nomi-ink text-nomi-paper shadow-nomi-sm",
        t ? "px-1.5 py-0.5 text-micro leading-none" : "px-2 py-0.5 text-micro leading-none"
      ),
      children: [
        /* @__PURE__ */ s.jsx(r, { size: t ? 10 : 11, stroke: 1.8, "aria-hidden": "true" }),
        i(In[e])
      ]
    }
  );
}
function Nn({
  selectedKinds: e,
  counts: t,
  setNodeRef: i,
  onToggleKind: r,
  onShowAll: o
}) {
  const { t: n } = H(), u = te.every((l) => e.has(l));
  return /* @__PURE__ */ s.jsx(
    "div",
    {
      ref: i,
      className: y(
        "absolute right-0 top-[calc(100%+6px)] z-[5] rounded-nomi border border-nomi-line bg-nomi-paper",
        "p-2 shadow-nomi-lg"
      ),
      style: { width: 176 },
      role: "dialog",
      "aria-label": n("assetLibrary.kindFilter"),
      children: /* @__PURE__ */ s.jsx("div", { className: "grid gap-0.5", role: "listbox", "aria-label": n("assetLibrary.kinds"), "aria-multiselectable": "true", children: qe.map((l) => {
        const h = l.value === "all" ? null : l.value, d = t.get(l.value) ?? 0, p = h === null ? u : e.has(h), m = p ? zt : Ut, g = d === 0 && !p;
        return /* @__PURE__ */ s.jsxs(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": p,
            className: y(
              "grid h-8 items-center gap-2 rounded-nomi-sm border-0 px-1.5",
              "bg-transparent text-left text-caption transition-colors duration-[var(--nomi-transition-fast)]",
              "cursor-pointer text-nomi-ink-65 hover:bg-nomi-ink-05 hover:text-nomi-ink",
              g && "text-nomi-ink-35",
              p && "bg-nomi-accent-soft font-semibold text-nomi-accent"
            ),
            style: { gridTemplateColumns: "20px minmax(42px, 1fr) auto" },
            onClick: h === null ? o : () => r(h),
            children: [
              /* @__PURE__ */ s.jsx(m, { size: 15, stroke: 1.8, "aria-hidden": "true" }),
              /* @__PURE__ */ s.jsx("span", { className: "min-w-0 whitespace-nowrap", children: n(l.labelKey) }),
              /* @__PURE__ */ s.jsx(
                "span",
                {
                  className: y(
                    "min-w-7 justify-self-end rounded-nomi-sm px-1.5 py-0.5 text-center text-micro leading-none tabular-nums",
                    p ? "bg-nomi-paper text-nomi-accent" : g ? "text-nomi-ink-30" : "bg-nomi-ink-05 text-nomi-ink-45"
                  ),
                  children: d
                }
              )
            ]
          },
          l.value
        );
      }) })
    }
  );
}
function Fn({
  id: e,
  label: t,
  count: i,
  compact: r = !1,
  onOpen: o,
  onDelete: n,
  onDropAssets: u
}) {
  const { t: l } = H(), [h, d] = c.useState(!1);
  return /* @__PURE__ */ s.jsxs(
    "div",
    {
      role: "button",
      tabIndex: 0,
      "aria-label": l("assetLibrary.openFolder", { label: t }),
      className: y(
        "group relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-nomi-sm border bg-nomi-paper",
        "cursor-pointer transition-[border-color,background,box-shadow] duration-[var(--nomi-transition-fast)]",
        r ? "mb-2.5 h-[92px] w-full" : "aspect-square",
        h ? "border-nomi-accent bg-nomi-accent-soft shadow-nomi-md" : "border-nomi-line hover:border-nomi-ink-20 hover:bg-nomi-ink-05"
      ),
      style: r ? { breakInside: "avoid" } : void 0,
      onClick: () => o(e),
      onKeyDown: (p) => {
        (p.key === "Enter" || p.key === " ") && o(e);
      },
      onDragOver: (p) => {
        p.preventDefault(), p.dataTransfer.dropEffect = "copy", d(!0);
      },
      onDragLeave: () => d(!1),
      onDrop: (p) => {
        d(!1), u(e, p);
      },
      children: [
        /* @__PURE__ */ s.jsx(Kt, { size: r ? 22 : 26, stroke: 1.6, className: y(h ? "text-nomi-accent" : "text-nomi-ink-45"), "aria-hidden": "true" }),
        /* @__PURE__ */ s.jsx("span", { className: "max-w-[90%] truncate text-caption text-nomi-ink", children: t }),
        /* @__PURE__ */ s.jsx("span", { className: "text-micro tabular-nums text-nomi-ink-40", children: i }),
        /* @__PURE__ */ s.jsx(
          "button",
          {
            type: "button",
            className: y(
              "absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-nomi-sm border-0 bg-transparent",
              "cursor-pointer text-transparent transition-colors duration-[var(--nomi-transition-fast)]",
              "hover:bg-workbench-danger-soft hover:text-workbench-danger group-hover:text-nomi-ink-40"
            ),
            "aria-label": l("assetLibrary.deleteFolder", { label: t }),
            title: l("assetLibrary.deleteFolderHint"),
            onClick: (p) => {
              p.stopPropagation(), n(e);
            },
            children: /* @__PURE__ */ s.jsx($e, { size: 13, stroke: 2, "aria-hidden": "true" })
          }
        )
      ]
    }
  );
}
function Tn({
  onCreate: e,
  onCancel: t
}) {
  const { t: i } = H(), r = c.useRef(null);
  return c.useEffect(() => {
    r.current?.focus();
  }, []), /* @__PURE__ */ s.jsx(
    "input",
    {
      ref: r,
      type: "text",
      placeholder: i("assetLibrary.newFolderPlaceholder"),
      "aria-label": i("assetLibrary.newFolderNameAria"),
      className: y(
        "h-8 w-36 rounded-nomi-sm border border-nomi-accent bg-nomi-paper px-2 text-caption text-nomi-ink outline-none"
      ),
      onKeyDown: (o) => {
        if (o.key === "Enter") {
          const n = o.currentTarget.value.trim();
          n && e(n), t();
        }
        o.key === "Escape" && t();
      },
      onBlur: t
    }
  );
}
const Me = c.memo(function({
  asset: t,
  compact: i = !1,
  selected: r = !1,
  selectable: o = !1,
  draggable: n = !0,
  dragHint: u,
  onSelect: l,
  onDragStartAsset: h
}) {
  const { t: d } = H(), p = c.useCallback((x) => {
    if (!n || !h) {
      x.preventDefault();
      return;
    }
    h(t, x);
  }, [t, n, h]), m = c.useCallback((x) => {
    l?.(t, x);
  }, [t, l]), g = u ?? (n ? t.kind === "audio" ? d("assetLibrary.dragAudio") : d("assetLibrary.dragCanvas") : d("assetLibrary.selectableProjectAsset")), k = o ? /* @__PURE__ */ s.jsx(
    "span",
    {
      className: y(
        "absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-pill border shadow-nomi-sm",
        r ? "border-nomi-accent bg-nomi-accent text-nomi-paper" : "border-nomi-line bg-nomi-paper/85 text-transparent group-hover:text-nomi-ink-40"
      ),
      "aria-hidden": "true",
      children: /* @__PURE__ */ s.jsx(xt, { size: 12, stroke: 2.4 })
    }
  ) : null;
  return /* @__PURE__ */ s.jsxs(yt, { children: [
    /* @__PURE__ */ s.jsx(kt, { asChild: !0, children: i ? /* @__PURE__ */ s.jsx(
      "div",
      {
        draggable: n,
        onClick: o ? m : void 0,
        onDragStart: p,
        className: y(
          "group relative mb-2.5 inline-block w-full overflow-hidden rounded-nomi border border-nomi-line bg-nomi-paper align-top",
          "shadow-nomi-sm transition-[border-color,box-shadow,transform] duration-[var(--nomi-transition-fast)]",
          "hover:border-nomi-ink-20 hover:shadow-nomi-md",
          n ? "cursor-grab active:cursor-grabbing" : o ? "cursor-pointer" : "cursor-default",
          r && "border-nomi-accent shadow-nomi-md ring-2 ring-nomi-accent ring-offset-1 ring-offset-nomi-paper"
        ),
        style: { breakInside: "avoid" },
        "aria-selected": r,
        children: /* @__PURE__ */ s.jsxs("div", { className: "relative overflow-hidden bg-nomi-ink-05", children: [
          t.kind === "image" ? /* @__PURE__ */ s.jsx(be, { className: "block h-auto w-full object-contain", thumbnailSrc: t.thumbUrl, src: t.renderUrl, alt: t.name }) : t.kind === "video" ? /* @__PURE__ */ s.jsxs("div", { className: "relative min-h-[86px]", children: [
            t.thumbUrl ? /* @__PURE__ */ s.jsx(be, { className: "block h-auto min-h-[86px] w-full object-cover", src: t.thumbUrl, alt: t.name }) : /* @__PURE__ */ s.jsx("div", { className: "h-[96px] bg-nomi-ink-05" }),
            /* @__PURE__ */ s.jsx("span", { className: "absolute inset-0 bg-[oklch(0.2_0.01_80/0.22)]", "aria-hidden": !0 }),
            /* @__PURE__ */ s.jsx("span", { className: "absolute inset-0 grid place-items-center text-nomi-paper drop-shadow-[0_1px_2px_oklch(0_0_0/0.55)]", "aria-hidden": !0, children: /* @__PURE__ */ s.jsx(Ye, { size: 22 }) })
          ] }) : /* @__PURE__ */ s.jsx("div", { className: "flex h-[92px] items-center justify-center bg-nomi-ink-05", children: /* @__PURE__ */ s.jsx(Ne, { asset: t }) }),
          /* @__PURE__ */ s.jsx(Pe, { kind: t.kind, compact: !0 }),
          k
        ] })
      }
    ) : /* @__PURE__ */ s.jsxs(
      "div",
      {
        draggable: n,
        onClick: o ? m : void 0,
        onDragStart: p,
        className: y(
          "group relative flex aspect-square items-center justify-center overflow-hidden rounded-nomi-sm border border-nomi-line bg-nomi-ink-05",
          n ? "cursor-grab active:cursor-grabbing" : o ? "cursor-pointer" : "cursor-default",
          r && "border-nomi-accent ring-2 ring-nomi-accent ring-offset-1 ring-offset-nomi-paper"
        ),
        "aria-selected": r,
        children: [
          /* @__PURE__ */ s.jsx(Ne, { asset: t }),
          /* @__PURE__ */ s.jsx(Pe, { kind: t.kind }),
          k,
          /* @__PURE__ */ s.jsx("span", { className: "absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-[oklch(0_0_0/0.6)] to-transparent px-1.5 pb-1 pt-2.5 text-micro text-nomi-paper", children: t.name })
        ]
      }
    ) }),
    /* @__PURE__ */ s.jsxs(vt, { side: "top", className: "max-w-56 whitespace-normal leading-snug", children: [
      t.name,
      " · ",
      g
    ] })
  ] });
});
function Re(e) {
  return e.filter((t) => t.kind === "image" || t.kind === "video");
}
function Dn(e) {
  if (typeof e != "string") return null;
  const t = "nomi-local://asset/";
  if (!e.startsWith(t)) return null;
  const r = e.slice(t.length).split(/[?#]/, 1)[0].split("/").filter(Boolean);
  if (r.length < 2) return null;
  try {
    const o = decodeURIComponent(r[0]).trim(), n = r.slice(1).map((u) => decodeURIComponent(u)).join("/").trim();
    return o && n ? { projectId: o, relativePath: n } : null;
  } catch {
    return null;
  }
}
function fe(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function En(e, t) {
  const i = fe(e), r = fe(i?.asset), o = fe(r?.data), n = typeof r?.projectId == "string" && r.projectId.trim() ? r.projectId.trim() : t, u = typeof o?.relativePath == "string" ? o.relativePath.trim() : "";
  return n && u ? { projectId: n, relativePath: u } : null;
}
function _e(e) {
  return `${e.projectId}\0${e.relativePath}`;
}
function Oe(e) {
  return e.split(/[?#]/, 1)[0];
}
function Pn(e) {
  const t = Array.from(new Set(e.selectedAssets.flatMap(
    (l) => l.origin.source === "canvas" ? [l.origin.nodeId] : []
  ))), i = new Set(t), r = e.canvasNodes.filter((l) => i.has(l.id)), o = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Map(), u = (l) => {
    l && n.set(_e(l), l);
  };
  for (const l of r) {
    let h = !1;
    for (const d of [l.result, ...l.history ?? []]) {
      if (!d) continue;
      for (const m of [d.url, d.thumbnailUrl]) {
        if (typeof m != "string" || !m.trim()) continue;
        o.add(Oe(m.trim()));
        const g = Dn(m);
        g && (u(g), h = !0);
      }
      const p = En(d.raw, e.currentProjectId);
      p && (u(p), h = !0);
    }
    if (!h) {
      const d = typeof l.meta?.workspaceRelativePath == "string" ? l.meta.workspaceRelativePath.trim() : "";
      e.currentProjectId && d && u({ projectId: e.currentProjectId, relativePath: d });
    }
  }
  for (const l of e.allProjectAssets) {
    if (l.origin.source !== "project") continue;
    const h = {
      projectId: l.origin.projectId,
      relativePath: l.origin.relativePath
    }, d = l.origin.projectId === e.currentProjectId && !!(l.ownerNodeId && i.has(l.ownerNodeId)), p = o.has(Oe(l.renderUrl)), m = n.has(_e(h));
    (d || p || m) && u(h);
  }
  return { nodeIds: t, fileTargets: [...n.values()] };
}
const Mn = 3, Rn = 121, _n = 113, On = At(["image", "video", "audio"]);
function zn(e) {
  const t = [], i = [], r = [];
  for (const o of e) {
    const n = (o.type || "").toLowerCase(), u = n.startsWith("image/") ? "image" : n.startsWith("video/") ? "video" : n.startsWith("audio/") ? "audio" : St(o.name);
    u === "image" || u === "video" ? t.push(o) : u === "audio" ? i.push(o) : r.push(o);
  }
  return { mediaFiles: t, audioFiles: i, unsupported: r };
}
function Un(e) {
  e.created.length && C(E.t("assetLibrary.importedAssets", { count: e.created.length }), "success");
  const t = [];
  e.skippedTooLargeCount && t.push(E.t("assetLibrary.skippedTooLarge", { count: e.skippedTooLargeCount })), e.skippedOverLimitCount && t.push(E.t("assetLibrary.skippedOverLimit", { count: e.skippedOverLimitCount })), e.skippedDuplicateCount && t.push(E.t("assetLibrary.skippedDuplicate", { count: e.skippedDuplicateCount })), e.failedCount && t.push(E.t("assetLibrary.skippedFailed", { count: e.failedCount })), t.length && C(E.t("assetLibrary.skippedSummary", { items: t.join(E.t("assetLibrary.listSeparator")) }), e.failedCount ? "error" : "warning");
}
function Kn(e) {
  e.uploadedCount && C(E.t("assetLibrary.importedAudio", { count: e.uploadedCount }), "success");
  const t = [];
  e.skippedTooLargeCount && t.push(E.t("assetLibrary.skippedTooLarge", { count: e.skippedTooLargeCount })), e.skippedDuplicateCount && t.push(E.t("assetLibrary.skippedDuplicate", { count: e.skippedDuplicateCount })), e.failedCount && t.push(E.t("assetLibrary.skippedFailed", { count: e.failedCount })), t.length && C(E.t("assetLibrary.skippedSummary", { items: t.join(E.t("assetLibrary.listSeparator")) }), e.failedCount ? "error" : "warning");
}
const Gn = [
  { value: "all", labelKey: "assetLibrary.allAssets" },
  { value: "project", labelKey: "assetLibrary.projectAssets" },
  // 找素材并入素材库（2026-07-13 ③）：AI 自动分组是素材库的一个视图，不再独占左栏一格。
  { value: "smart", labelKey: "assetLibrary.smartGroups" }
];
function Bn(e, t) {
  return {
    kind: e.kind,
    name: e.name,
    renderUrl: e.renderUrl,
    origin: e.origin,
    ...t ? { dragAnchor: t } : {}
  };
}
function ze(e, t, i) {
  return t.has(i.id) ? [
    i,
    ...e.filter((r) => r.id !== i.id && t.has(r.id))
  ] : [i];
}
function nr({
  projectId: e,
  compact: t = !1,
  showHeader: i = !0,
  onClose: r,
  className: o
}) {
  const { t: n } = H(), u = c.useRef(null), l = c.useRef(null), h = c.useRef(null), [d, p] = c.useState("all"), [m, g] = c.useState(() => new Set(te)), [k, x] = c.useState(!1), [w, A] = c.useState(""), [N, G] = c.useState(() => /* @__PURE__ */ new Set()), [D, Y] = c.useState(null), [ne, Z] = c.useState(!1), P = c.useRef(null), f = c.useRef(N);
  f.current = N;
  const {
    canvasAssets: S,
    refresh: L
  } = Tt(e), { assets: M, refresh: O } = Xt(), z = tn(e), re = c.useMemo(
    () => Re(M),
    [M]
  ), se = c.useMemo(
    () => Re(S),
    [S]
  ), oe = c.useMemo(
    () => d === "project" ? se : re,
    [re, se, d]
  ), Q = c.useMemo(
    () => Dt(oe, { query: w }),
    [oe, w]
  ), Xe = c.useMemo(() => {
    const a = /* @__PURE__ */ new Map();
    a.set("all", Q.length);
    for (const b of Q) a.set(b.kind, (a.get(b.kind) ?? 0) + 1);
    return a;
  }, [Q]);
  c.useEffect(() => {
    const a = ce();
    if (a?.assets?.onUpdated)
      return a.assets.onUpdated((b) => {
        b?.projectId === e && (L(), O());
      });
  }, [e, O, L]);
  const de = c.useMemo(
    () => Q.filter((a) => m.has(a.kind)),
    [Q, m]
  ), B = d === "project", ie = B && w.trim() === "", R = c.useMemo(
    () => ie ? Zt(de, z.state.assignments, D) : de,
    [D, z.state.assignments, ie, de]
  ), Ze = c.useMemo(
    () => Qt(se, z.state.assignments),
    [z.state.assignments, se]
  ), ue = ie && !D ? z.state.folders : [], ae = D ? z.state.folders.find((a) => a.id === D) ?? null : null;
  c.useEffect(() => {
    D && !ae && Y(null);
  }, [ae, D]);
  const le = c.useRef(R);
  le.current = R;
  const me = c.useMemo(
    () => te.filter((a) => m.has(a)),
    [m]
  ), he = me.length === te.length, ge = !he, xe = c.useMemo(() => R.map((a) => a.id), [R]), ye = c.useMemo(
    () => R.filter((a) => N.has(a.id)),
    [N, R]
  ), _ = c.useMemo(
    () => B ? ye : [],
    [B, ye]
  ), [Qe, et] = c.useState(null), ee = t ? 2 : Mn, tt = t ? _n : Rn, nt = Math.ceil(R.length / ee), ke = It({
    count: nt,
    getScrollElement: () => Qe,
    estimateSize: () => tt,
    overscan: 3
  }), rt = c.useCallback((a) => {
    const b = Array.from(a.currentTarget.files || []);
    a.currentTarget.value = "";
    const { mediaFiles: v, audioFiles: I, unsupported: F } = zn(b);
    v.length && import("./agentStudioMount-DueN8bR4.js").then((j) => j.ar).then(({ importLocalMediaFilesToGenerationCanvas: j }) => j(v, { basePosition: { x: 120, y: 90 } })).then((j) => {
      L(), O(), Un(j);
    }).catch((j) => {
      console.error("asset library upload failed", j), C(n("assetLibrary.importFailed"), "error");
    }), I.length && an(I, { projectId: e }).then((j) => {
      L(), O(), Kn(j);
    }).catch((j) => {
      console.error("asset library audio upload failed", j), C(n("assetLibrary.audioImportFailed"), "error");
    }), F.length && C(n("assetLibrary.skippedUnsupported", { count: F.length }), "warning");
  }, [e, O, L, n]), st = R.length === 0 && ue.length === 0, ve = oe.length === 0, ot = c.useMemo(
    () => new Map(qe.map((a) => [a.value, n(a.labelKey)])),
    [n]
  ), je = he ? n("assetLibrary.all") : me.length > 0 ? me.map((a) => ot.get(a) ?? a).join(n("assetLibrary.listSeparator")) : n("assetLibrary.noCategories");
  c.useEffect(() => {
    if (!k) return;
    const a = (v) => {
      const I = v.target;
      h.current?.contains(I) || l.current?.contains(I) || x(!1);
    }, b = (v) => {
      v.key === "Escape" && x(!1);
    };
    return document.addEventListener("pointerdown", a), window.addEventListener("keydown", b), () => {
      document.removeEventListener("pointerdown", a), window.removeEventListener("keydown", b);
    };
  }, [k]), c.useEffect(() => {
    const a = new Set(xe);
    G((b) => {
      const v = new Set([...b].filter((I) => a.has(I)));
      return v.size === b.size ? b : v;
    }), P.current && !a.has(P.current) && (P.current = null);
  }, [xe]);
  const we = c.useCallback((a, b) => {
    const v = le.current, I = b.metaKey || b.ctrlKey, F = P.current;
    G((j) => {
      if (b.shiftKey && F) {
        const T = v.findIndex((V) => V.id === F), $ = v.findIndex((V) => V.id === a.id);
        if (T >= 0 && $ >= 0) {
          const V = Math.min(T, $), J = Math.max(T, $), U = I ? new Set(j) : /* @__PURE__ */ new Set();
          for (let q = V; q <= J; q += 1) U.add(v[q].id);
          return U;
        }
      }
      if (I) {
        const T = new Set(j);
        return T.has(a.id) ? T.delete(a.id) : T.add(a.id), T;
      }
      return j.size === 1 && j.has(a.id) ? j : /* @__PURE__ */ new Set([a.id]);
    }), P.current = a.id;
  }, []), Le = c.useCallback(() => {
    g(new Set(te));
  }, []), it = c.useCallback((a) => {
    g((b) => {
      const v = new Set(b);
      return v.has(a) ? v.delete(a) : v.add(a), v;
    });
  }, []), Se = c.useCallback((a, b) => {
    const v = f.current, I = ze(le.current, v, a);
    v.has(a.id) || (G(/* @__PURE__ */ new Set([a.id])), P.current = a.id);
    const F = b.currentTarget.getBoundingClientRect(), j = {
      xRatio: F.width > 0 ? Math.min(1, Math.max(0, (b.clientX - F.left) / F.width)) : 0.5,
      yRatio: F.height > 0 ? Math.min(1, Math.max(0, (b.clientY - F.top) / F.height)) : 0.5
    }, T = I.map(
      ($, V) => Bn($, V === 0 ? j : void 0)
    );
    b.dataTransfer.setData(We, _t(T)), b.dataTransfer.effectAllowed = "copy", b.dataTransfer.setData("text/plain", T.length > 1 ? `${T.length} 个素材` : a.name);
  }, []), { handleFolderAssignDragStart: Ae, handleFolderDropAssets: Ie, handleDeleteFolder: at } = nn({
    folderApi: z,
    visibleAssetsRef: le,
    selectedIdsRef: f,
    setSelectedIds: G,
    lastSelectedIdRef: P,
    setActiveFolderId: Y,
    collectSelection: ze
  }), lt = c.useCallback(async () => {
    if (!e) {
      C(n("assetLibrary.deleteNoProject"), "warning");
      return;
    }
    if (_.length === 0) {
      C(n("assetLibrary.selectToDelete"), "warning");
      return;
    }
    const a = X.getState(), b = Pn({
      selectedAssets: _,
      canvasNodes: a.nodes,
      allProjectAssets: M,
      currentProjectId: e
    });
    if (b.nodeIds.length === 0) {
      C(n("assetLibrary.cannotDeleteSelected"), "warning");
      return;
    }
    if (!await Ke({
      title: n("assetLibrary.confirmDeleteTitle", { count: b.nodeIds.length }),
      message: n("assetLibrary.confirmDeleteMessage"),
      confirmLabel: n("assetLibrary.delete"),
      danger: !0
    })) return;
    const F = ce()?.workspace?.deleteFiles;
    if (b.fileTargets.length > 0 && !F) {
      C(n("assetLibrary.deleteUnsupported"), "error");
      return;
    }
    try {
      let j = 0, T = 0;
      if (b.fileTargets.length > 0 && F) {
        const U = /* @__PURE__ */ new Map();
        for (const K of b.fileTargets) {
          const W = U.get(K.projectId);
          W ? W.push(K.relativePath) : U.set(K.projectId, [K.relativePath]);
        }
        const q = await Promise.all([...U].map(
          ([K, W]) => F({ projectId: K, relativePaths: W })
        ));
        j = q.reduce((K, W) => K + W.deletedCount, 0), T = q.reduce((K, W) => K + W.failedCount, 0);
      }
      const $ = X.getState(), V = new Set($.nodes.map((U) => U.id)), J = b.nodeIds.filter((U) => V.has(U));
      J.length > 0 && ($.selectNodes(J), $.deleteSelectedNodes()), L(), O(), G(/* @__PURE__ */ new Set()), J.length > 0 && C(n("assetLibrary.deletedProjectAssets", { count: J.length }), "success"), j > 0 && J.length === 0 && C(n("assetLibrary.deletedFiles", { count: j }), "success"), T > 0 && C(n("assetLibrary.failedFiles", { count: T }), "warning");
    } catch (j) {
      console.error("delete project assets failed", j), C(n("assetLibrary.deleteFailed"), "error");
    }
  }, [M, e, O, L, _, n]), ct = /* @__PURE__ */ s.jsxs(
    "button",
    {
      type: "button",
      className: y(
        "inline-flex items-center justify-center gap-1.5 rounded-full cursor-pointer",
        "bg-nomi-ink text-nomi-paper text-caption font-semibold border-0",
        "transition-[background] duration-[var(--nomi-transition-fast)] hover:bg-nomi-ink-80",
        t ? "h-[30px] px-2.5 shrink-0" : "h-7 px-3"
      ),
      "aria-label": n("assetLibrary.uploadAssets"),
      onClick: () => u.current?.click(),
      children: [
        /* @__PURE__ */ s.jsx(jt, { size: t ? 12 : 13, stroke: 2 }),
        n("assetLibrary.upload")
      ]
    }
  ), dt = B ? /* @__PURE__ */ s.jsxs(
    "button",
    {
      type: "button",
      className: y(
        "inline-flex h-8 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-nomi-sm border text-caption font-semibold tabular-nums",
        "transition-[background,color,border-color] duration-[var(--nomi-transition-fast)]",
        _.length > 0 ? "cursor-pointer border-workbench-danger/20 bg-workbench-danger-soft px-2 text-workbench-danger hover:bg-workbench-danger-soft/80" : "cursor-default border-nomi-line bg-nomi-ink-05 px-2 text-nomi-ink-30"
      ),
      disabled: _.length === 0,
      "aria-disabled": _.length === 0,
      "aria-label": _.length > 0 ? n("assetLibrary.deleteSelection", { count: _.length }) : n("assetLibrary.deleteProjectAsset"),
      title: _.length > 0 ? n("assetLibrary.deleteSelection", { count: _.length }) : n("assetLibrary.selectProjectAssetFirst"),
      onMouseDown: (a) => a.stopPropagation(),
      onClick: () => {
        lt();
      },
      children: [
        /* @__PURE__ */ s.jsx($e, { size: 15, stroke: 2, "aria-hidden": "true" }),
        /* @__PURE__ */ s.jsx("span", { children: _.length })
      ]
    }
  ) : null, ut = /* @__PURE__ */ s.jsx(
    "div",
    {
      className: y(
        "inline-flex bg-nomi-ink-05 rounded-full p-0.5",
        t ? "min-w-0 flex-1" : "shrink-0"
      ),
      role: "tablist",
      "aria-label": n("assetLibrary.sourceFilter"),
      children: Gn.map((a) => {
        const b = d === a.value;
        return /* @__PURE__ */ s.jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": b,
            className: y(
              "rounded-full text-caption cursor-pointer border-0 bg-transparent whitespace-nowrap",
              "transition-[background,color] duration-[var(--nomi-transition-fast)]",
              t ? "min-w-0 flex-1 px-1.5 py-1" : "px-2.5 py-1",
              b ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "text-nomi-ink-60 hover:text-nomi-ink"
            ),
            onClick: () => {
              p(a.value), G(/* @__PURE__ */ new Set()), P.current = null, Le(), x(!1), Y(null), Z(!1);
            },
            children: n(a.labelKey)
          },
          a.value
        );
      })
    }
  ), mt = /* @__PURE__ */ s.jsxs("div", { className: "relative shrink-0", children: [
    /* @__PURE__ */ s.jsxs(
      "button",
      {
        ref: l,
        type: "button",
        className: y(
          "inline-flex items-center justify-center gap-1.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper",
          "cursor-pointer text-caption text-nomi-ink-65 transition-[background,color,border-color] duration-[var(--nomi-transition-fast)]",
          "hover:border-nomi-ink-20 hover:bg-nomi-ink-05 hover:text-nomi-ink",
          t ? "h-8 px-2.5" : "h-8 px-3",
          (k || ge) && "border-nomi-ink-20 bg-nomi-ink-05 text-nomi-ink"
        ),
        "aria-label": n("assetLibrary.categoryFilter"),
        "aria-haspopup": "dialog",
        "aria-expanded": k,
        "aria-pressed": ge,
        title: n("assetLibrary.categoryTitle", { label: je }),
        onClick: () => x((a) => !a),
        children: [
          /* @__PURE__ */ s.jsx(Nt, { size: 15, stroke: 1.8, "aria-hidden": "true" }),
          t ? null : /* @__PURE__ */ s.jsx("span", { children: je })
        ]
      }
    ),
    k ? /* @__PURE__ */ s.jsx(
      Nn,
      {
        selectedKinds: m,
        counts: Xe,
        setNodeRef: (a) => {
          h.current = a;
        },
        onToggleKind: it,
        onShowAll: Le
      }
    ) : null
  ] });
  return /* @__PURE__ */ s.jsx(wt, { delayDuration: 180, skipDelayDuration: 80, children: /* @__PURE__ */ s.jsxs("div", { className: y("flex min-h-0 flex-1 flex-col overflow-hidden", o), children: [
    i ? /* @__PURE__ */ s.jsxs("div", { className: y("flex items-center gap-2 px-4 pt-3.5 pb-3 border-b border-nomi-line"), children: [
      /* @__PURE__ */ s.jsx("b", { className: y("text-title font-bold text-nomi-ink"), children: n("assetLibrary.title") }),
      /* @__PURE__ */ s.jsxs("span", { className: y("text-caption text-nomi-ink-40"), children: [
        "· ",
        oe.length
      ] }),
      /* @__PURE__ */ s.jsx("span", { className: y("flex-1") }),
      r ? /* @__PURE__ */ s.jsx(
        "button",
        {
          type: "button",
          className: y(
            "w-7 h-7 grid place-items-center rounded-nomi-sm cursor-pointer border-0 bg-transparent",
            "text-nomi-ink-40 hover:text-nomi-ink hover:bg-nomi-ink-05",
            "transition-[background,color] duration-[var(--nomi-transition-fast)]"
          ),
          "aria-label": n("assetLibrary.close"),
          onClick: r,
          children: /* @__PURE__ */ s.jsx(Lt, { size: 16, stroke: 2 })
        }
      ) : null
    ] }) : null,
    /* @__PURE__ */ s.jsx(
      "input",
      {
        ref: u,
        className: y("absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"),
        type: "file",
        accept: On,
        multiple: !0,
        "aria-label": n("assetLibrary.filePicker"),
        onChange: rt
      }
    ),
    /* @__PURE__ */ s.jsxs("div", { className: y("grid gap-2", t ? "px-3 py-3" : "px-3 py-2.5"), children: [
      /* @__PURE__ */ s.jsxs("div", { className: y("flex min-w-0 items-center gap-2"), children: [
        ut,
        ct
      ] }),
      d !== "smart" ? /* @__PURE__ */ s.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ s.jsx(Ge, { className: "min-w-0 flex-1", placeholder: n("assetLibrary.search"), ariaLabel: n("assetLibrary.searchAria"), value: w, onChange: A }),
        dt,
        B ? ne ? /* @__PURE__ */ s.jsx(Tn, { onCreate: z.createFolder, onCancel: () => Z(!1) }) : /* @__PURE__ */ s.jsx(
          "button",
          {
            type: "button",
            className: y(
              "inline-flex h-8 shrink-0 items-center justify-center rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5",
              "cursor-pointer text-nomi-ink-65 transition-[background,color,border-color] duration-[var(--nomi-transition-fast)]",
              "hover:border-nomi-ink-20 hover:bg-nomi-ink-05 hover:text-nomi-ink"
            ),
            "aria-label": n("assetLibrary.newFolder"),
            title: n("assetLibrary.newFolder"),
            onClick: () => Z(!0),
            children: /* @__PURE__ */ s.jsx(Ft, { size: 15, stroke: 1.8, "aria-hidden": "true" })
          }
        ) : null,
        mt
      ] }) : null,
      ie && ae ? /* @__PURE__ */ s.jsxs("div", { className: "flex min-w-0 items-center gap-1.5", children: [
        /* @__PURE__ */ s.jsxs(
          "button",
          {
            type: "button",
            className: y(
              "inline-flex shrink-0 items-center gap-0.5 rounded-nomi-sm border-0 bg-transparent px-1.5 py-1",
              "cursor-pointer text-caption text-nomi-accent transition-colors duration-[var(--nomi-transition-fast)] hover:bg-nomi-ink-05"
            ),
            "aria-label": n("assetLibrary.backToAllAssets"),
            title: n("assetLibrary.backDropToRemove"),
            onClick: () => Y(null),
            onDragOver: (a) => {
              a.preventDefault(), a.dataTransfer.dropEffect = "copy";
            },
            onDrop: (a) => Ie(null, a),
            children: [
              /* @__PURE__ */ s.jsx($t, { size: 14, stroke: 2, "aria-hidden": "true" }),
              n("common.back")
            ]
          }
        ),
        /* @__PURE__ */ s.jsxs("span", { className: "min-w-0 truncate text-caption text-nomi-ink-40", children: [
          "／ ",
          ae.label,
          " · ",
          R.length
        ] })
      ] }) : null
    ] }),
    d === "smart" ? /* @__PURE__ */ s.jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ s.jsx(An, {}) }) : /* @__PURE__ */ s.jsxs("div", { ref: et, className: y("flex-1 overflow-y-auto", t ? "px-3 pb-3" : "px-3.5 pb-4"), children: [
      ue.length > 0 ? /* @__PURE__ */ s.jsx(
        "div",
        {
          className: "grid gap-2.5 pb-2.5",
          style: { gridTemplateColumns: `repeat(${ee}, minmax(0, 1fr))` },
          role: "list",
          "aria-label": n("assetLibrary.foldersAria"),
          children: ue.map((a) => /* @__PURE__ */ s.jsx(
            Fn,
            {
              id: a.id,
              label: a.label,
              count: Ze.get(a.id) ?? 0,
              onOpen: Y,
              onDelete: at,
              onDropAssets: (b, v) => Ie(b, v)
            },
            a.id
          ))
        }
      ) : null,
      st ? /* @__PURE__ */ s.jsx(
        Be,
        {
          density: "inline",
          icon: /* @__PURE__ */ s.jsx(Ve, { size: 34, stroke: 1.4, className: "text-nomi-ink-30" }),
          title: n(ve ? d === "project" ? "assetLibrary.noProjectAssets" : "assetLibrary.noAssets" : "assetLibrary.noMatches"),
          description: n(ve ? "assetLibrary.emptyDescription" : "assetLibrary.noMatchesDescription")
        }
      ) : t ? /* @__PURE__ */ s.jsx("div", { style: { columnCount: 3, columnGap: "10px" }, children: R.map((a) => /* @__PURE__ */ s.jsx(
        Me,
        {
          asset: a,
          compact: !0,
          selectable: !0,
          draggable: !0,
          selected: N.has(a.id),
          dragHint: B ? n("assetLibrary.dragHintFolder") : void 0,
          onSelect: we,
          onDragStartAsset: B ? Ae : Se
        },
        a.id
      )) }) : /* @__PURE__ */ s.jsx("div", { style: { height: ke.getTotalSize(), width: "100%", position: "relative" }, children: ke.getVirtualItems().map((a) => {
        const b = a.index * ee, v = R.slice(b, b + ee);
        return /* @__PURE__ */ s.jsx(
          "div",
          {
            "data-index": a.index,
            className: y("grid gap-2.5 pb-2.5"),
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: a.size,
              transform: `translateY(${a.start}px)`,
              gridTemplateColumns: `repeat(${ee}, minmax(0, 1fr))`
            },
            children: v.map((I) => /* @__PURE__ */ s.jsx(
              Me,
              {
                asset: I,
                selectable: !0,
                draggable: !0,
                selected: N.has(I.id),
                dragHint: B ? n("assetLibrary.dragHintFolder") : void 0,
                onSelect: we,
                onDragStartAsset: B ? Ae : Se
              },
              I.id
            ))
          },
          a.key
        );
      }) })
    ] })
  ] }) });
}
export {
  nr as AssetLibraryContent,
  ze as assetsForLibraryDrag,
  zn as classifyUploadFiles
};
