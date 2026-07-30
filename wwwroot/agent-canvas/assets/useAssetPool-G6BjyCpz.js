import { dV as f, c8 as s, aJ as a, H as m, s as p, S as d, bs as h, dK as b } from "./agentStudioMount-CP7x4OcS.js";
import { I as x } from "./IconPlayerPlayFilled-D5omMmaP.js";
import { b as g } from "./workspaceFileDrag-CNxBSF4X.js";
const v = [8, 16, 22, 12, 18, 9];
function k({ index: e }) {
  return /* @__PURE__ */ s.jsx("span", { className: a("absolute -top-[5px] -left-[5px] min-w-[16px] h-[16px] px-[4px] rounded-pill bg-nomi-accent text-nomi-paper text-micro font-semibold flex items-center justify-center leading-none"), children: e });
}
function y({ label: e, onRemove: t }) {
  const { t: r } = f();
  return /* @__PURE__ */ s.jsx(
    "button",
    {
      type: "button",
      "aria-label": r("assetLibrary.removeNamed", { name: e }),
      className: a("absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-pill bg-nomi-paper border border-nomi-line text-nomi-ink-60 text-micro leading-none flex items-center justify-center cursor-pointer z-[2]"),
      onClick: (n) => {
        n.stopPropagation(), t();
      },
      children: "×"
    }
  );
}
function A({ asset: e, playSize: t = 22 }) {
  const { t: r } = f();
  return e.kind === "audio" ? /* @__PURE__ */ s.jsx("span", { className: a("flex items-center gap-[2px] h-[22px]"), "aria-hidden": !0, children: v.map((n, i) => /* @__PURE__ */ s.jsx("i", { className: a("w-[2px] rounded-nomi-sm bg-nomi-ink-40"), style: { height: `${n}px` } }, i)) }) : e.kind === "video" ? /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
    e.thumbUrl ? /* @__PURE__ */ s.jsx(m, { className: a("w-full h-full object-cover"), src: e.thumbUrl, alt: e.name }) : null,
    /* @__PURE__ */ s.jsx("span", { className: a("absolute inset-0 bg-[oklch(0.2_0.01_80/0.28)]"), "aria-hidden": !0 }),
    /* @__PURE__ */ s.jsx("span", { className: a("absolute inset-0 flex items-center justify-center z-[1]"), "aria-hidden": !0, children: /* @__PURE__ */ s.jsx(x, { size: t, className: a("text-nomi-paper drop-shadow-[0_1px_2px_oklch(0_0_0/0.5)]") }) })
  ] }) : /* @__PURE__ */ s.jsx(
    m,
    {
      className: a("w-full h-full object-cover"),
      thumbnailSrc: e.thumbUrl,
      src: e.renderUrl,
      alt: e.name,
      fallbackLabel: r("assetLibrary.expiredReference"),
      fallbackTitle: r("assetLibrary.expiredReferenceDetail", { url: e.renderUrl })
    }
  );
}
function F({ asset: e, index: t, onRemove: r, onClick: n, dragProps: i, className: u }) {
  const o = !!n;
  return /* @__PURE__ */ s.jsxs(
    "div",
    {
      className: a(
        "relative w-14 h-14 rounded-nomi-sm border border-nomi-line bg-nomi-ink-05 overflow-hidden flex items-center justify-center",
        o && "cursor-pointer hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-nomi-accent",
        i?.draggable && "data-[dragover=true]:outline data-[dragover=true]:outline-2 data-[dragover=true]:outline-nomi-accent",
        u
      ),
      role: o ? "button" : void 0,
      tabIndex: o ? 0 : void 0,
      "aria-label": o ? e.name : void 0,
      onClick: n,
      onKeyDown: o ? (l) => {
        (l.key === "Enter" || l.key === " ") && (l.preventDefault(), n?.());
      } : void 0,
      ...i,
      children: [
        /* @__PURE__ */ s.jsx(A, { asset: e }),
        typeof t == "number" ? /* @__PURE__ */ s.jsx(k, { index: t }) : null,
        r ? /* @__PURE__ */ s.jsx(y, { label: e.name, onRemove: r }) : null
      ]
    }
  );
}
function I({ onClick: e, selected: t, label: r, className: n }) {
  const { t: i } = f();
  return /* @__PURE__ */ s.jsx(
    "button",
    {
      type: "button",
      "aria-label": r ?? i("assetLibrary.addReference"),
      onClick: e,
      className: a(
        "w-14 h-14 rounded-nomi-sm border border-dashed border-nomi-ink-20 bg-nomi-ink-05 text-nomi-ink-40 flex items-center justify-center cursor-pointer hover:border-nomi-accent hover:text-nomi-accent",
        t && "outline outline-2 outline-offset-1 outline-nomi-accent",
        n
      ),
      children: /* @__PURE__ */ s.jsx(p, { size: 18, stroke: 2 })
    }
  );
}
const j = 2e3;
function w(e) {
  const [t, r] = d.useState({ items: [], truncated: !1, loading: !1, error: null }), [n, i] = d.useState(0), u = d.useCallback(() => i((o) => o + 1), []);
  return d.useEffect(() => {
    let o = !1;
    const l = h();
    return !e || !l?.workspace?.listFiles ? (r({ items: [], truncated: !1, loading: !1, error: null }), () => {
      o = !0;
    }) : (r((c) => ({ ...c, loading: !0, error: null })), l.workspace.listFiles({ projectId: e, limit: j }).then((c) => {
      o || r({ items: c.items, truncated: c.truncated, loading: !1, error: null });
    }).catch(() => {
      o || r({ items: [], truncated: !1, loading: !1, error: "无法读取项目文件夹，请检查权限或重新打开文件夹" });
    }), () => {
      o = !0;
    });
  }, [e, n]), { ...t, refresh: u };
}
const S = /* @__PURE__ */ new Set(["image", "video", "audio"]);
function N(e) {
  const t = e.result;
  if (!t || t.type !== "image" && t.type !== "video") return null;
  const r = String(t.url || t.thumbnailUrl || "").trim();
  if (!r) return null;
  const n = String(t.thumbnailUrl || "").trim();
  return {
    id: e.id,
    kind: t.type,
    name: String(e.title || "").trim() || t.type,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : void 0,
    updatedAt: t.createdAt ? new Date(t.createdAt).toISOString() : void 0,
    renderUrl: r,
    thumbUrl: n || void 0,
    source: "canvas",
    origin: { source: "canvas", nodeId: e.id }
  };
}
function U(e, t) {
  return S.has(e.kind) ? {
    id: e.relativePath,
    kind: e.kind,
    name: e.name,
    updatedAt: e.updatedAt,
    renderUrl: g(t, e.relativePath),
    source: "project",
    origin: { source: "project", projectId: t, relativePath: e.relativePath }
  } : null;
}
function R(e, t, r) {
  if (t < 0 || t >= e.length || r < 0 || r >= e.length || t === r) return e.slice();
  const n = e.slice(), [i] = n.splice(t, 1);
  return n.splice(r, 0, i), n;
}
function D(e, t = {}) {
  const r = (t.query || "").trim().toLowerCase(), n = t.accept && t.accept.length ? t.accept : null;
  return e.filter((i) => !(n && !n.includes(i.kind) || r && !i.name.toLowerCase().includes(r)));
}
function _(e) {
  const t = [], r = (n) => {
    for (const i of n)
      t.push(i), i.children && i.children.length && r(i.children);
  };
  return r(e), t;
}
function P(e, t) {
  const r = /* @__PURE__ */ new Map();
  for (const n of e)
    r.has(n.renderUrl) || r.set(n.renderUrl, n);
  for (const n of t)
    r.has(n.renderUrl) || r.set(n.renderUrl, n);
  return {
    assets: Array.from(r.values()),
    canvasAssets: [...e],
    projectAssets: [...t]
  };
}
function W(e) {
  const t = b((u) => u.nodes), { items: r, loading: n, refresh: i } = w(e);
  return d.useMemo(() => {
    const u = [];
    for (const l of t) {
      const c = N(l);
      c && u.push(c);
    }
    const o = [];
    if (e)
      for (const l of _(r)) {
        const c = U(l, e);
        c && o.push(c);
      }
    return { ...P(u, o), loading: n, refresh: i };
  }, [t, r, e, n, i]);
}
export {
  I as A,
  A as a,
  F as b,
  D as f,
  R as m,
  W as u
};
