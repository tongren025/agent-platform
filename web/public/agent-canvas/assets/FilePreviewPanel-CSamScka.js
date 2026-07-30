import { e6 as x, dT as c, S as d, cR as w, ci as e, x as h, bz as v } from "./agentStudioMount-CX1GI_dE.js";
import { I as k } from "./IconExternalLink-D9bF4xgN.js";
import { N as j } from "./NomiMarkdown-C1kxAr7u.js";
import { b } from "./workspaceFileDrag-CNxBSF4X.js";
function I() {
  const { t: r } = x(), n = c((s) => s.open), i = c((s) => s.projectId), t = c((s) => s.node), a = c((s) => s.close), l = d.useRef(null);
  if (d.useEffect(() => {
    if (!n) return;
    const s = (m) => {
      m.key === "Escape" && a();
    }, u = (m) => {
      l.current && !l.current.contains(m.target) && a();
    };
    window.addEventListener("keydown", s);
    const p = window.setTimeout(() => window.addEventListener("mousedown", u), 0);
    return () => {
      window.removeEventListener("keydown", s), window.removeEventListener("mousedown", u), window.clearTimeout(p);
    };
  }, [n, a]), !n || !t) return null;
  const o = b(i, t.relativePath), f = () => v()?.workspace?.revealFile?.({ projectId: i, relativePath: t.relativePath });
  return w.createPortal(
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        ref: l,
        role: "dialog",
        "aria-label": r("fileExplorer.previewAria", { name: t.name }),
        className: "bg-nomi-paper shadow-nomi-lg border-l border-nomi-line flex flex-col",
        style: { position: "fixed", top: 0, right: 0, bottom: 0, width: 440, zIndex: 4e3 },
        children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 px-3 border-b border-nomi-line shrink-0", style: { height: 44 }, children: [
            /* @__PURE__ */ e.jsx("span", { className: "flex-1 truncate text-body text-nomi-ink", title: t.relativePath, children: t.name }),
            /* @__PURE__ */ e.jsx("button", { type: "button", onClick: f, title: r("fileExplorer.reveal"), className: "p-1 text-nomi-ink-60 hover:text-nomi-ink", children: /* @__PURE__ */ e.jsx(k, { size: 16, stroke: 1.6 }) }),
            /* @__PURE__ */ e.jsx("button", { type: "button", onClick: a, "aria-label": r("common.close"), className: "p-1 text-nomi-ink-60 hover:text-nomi-ink", children: /* @__PURE__ */ e.jsx(h, { size: 16, stroke: 1.6 }) })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "flex-1 min-h-0 overflow-auto p-3", children: /* @__PURE__ */ e.jsx(g, { node: t, url: o }) })
        ]
      }
    ),
    document.body
  );
}
function g({ node: r, url: n }) {
  const { t: i } = x();
  switch (r.kind) {
    case "image":
      return /* @__PURE__ */ e.jsx("img", { src: n, alt: r.name, className: "mx-auto max-w-full object-contain" });
    case "video":
      return /* @__PURE__ */ e.jsx("video", { src: n, controls: !0, className: "w-full" });
    case "audio":
      return /* @__PURE__ */ e.jsx("audio", { src: n, controls: !0, className: "w-full" });
    case "document":
      return /* @__PURE__ */ e.jsx("iframe", { src: n, title: r.name, className: "w-full border-0", style: { height: "100%", minHeight: "70vh" } });
    case "text":
      return /* @__PURE__ */ e.jsx(y, { url: n, markdown: r.contentType === "text/markdown" });
    default:
      return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col items-center justify-center gap-1 py-10 text-center", children: [
        /* @__PURE__ */ e.jsx("span", { className: "text-body-sm text-nomi-ink-60", children: i("fileExplorer.unsupported") }),
        /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-40", children: i("fileExplorer.unsupportedHint") })
      ] });
  }
}
function y({ url: r, markdown: n }) {
  const { t: i } = x(), [t, a] = d.useState({ loading: !0, text: "", error: "" });
  return d.useEffect(() => {
    let l = !0;
    return a({ loading: !0, text: "", error: "" }), fetch(r).then((o) => {
      if (!o.ok) throw new Error(`HTTP ${o.status}`);
      return o.text();
    }).then((o) => {
      l && a({ loading: !1, text: o.slice(0, 5e5), error: "" });
    }).catch((o) => {
      l && a({ loading: !1, text: "", error: o instanceof Error ? o.message : String(o) });
    }), () => {
      l = !1;
    };
  }, [r]), t.loading ? /* @__PURE__ */ e.jsxs("div", { className: "text-body-sm text-nomi-ink-40", children: [
    i("common.loading"),
    "…"
  ] }) : t.error ? /* @__PURE__ */ e.jsx("div", { className: "text-body-sm text-workbench-danger", children: i("fileExplorer.readFailed", { message: t.error }) }) : n ? /* @__PURE__ */ e.jsx(j, { children: t.text }) : /* @__PURE__ */ e.jsx("pre", { className: "whitespace-pre-wrap break-words font-nomi-mono text-caption leading-relaxed text-nomi-ink-80", children: t.text });
}
export {
  I as FilePreviewPanel
};
