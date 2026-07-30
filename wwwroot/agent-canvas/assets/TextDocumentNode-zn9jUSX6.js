import { S as s, dV as D, dK as u, c8 as o, aJ as m } from "./agentStudioMount-DueN8bR4.js";
import { I as P } from "./IconPhotoPlus-Cw9xsM7z.js";
import { h as w, E as y } from "./index-Dm8bBlut.js";
import { u as S, d as j } from "./richTextActions-D6yFEE58.js";
const E = { type: "doc", content: [] };
function A(t) {
  const n = t?.content;
  return !n || n.length === 0 ? !0 : n.every((l) => {
    const r = l;
    return r.type === "paragraph" && (!r.content || r.content.length === 0);
  });
}
function R({ node: t }) {
  const { t: n } = D(), l = u((e) => e.updateNode), r = u((e) => e.commitPersistedChange), g = s.useMemo(() => t.contentJson ?? E, [t.contentJson]), b = s.useCallback(
    (e) => {
      l(t.id, { contentJson: e }, { persist: !1 });
    },
    [t.id, l]
  ), v = s.useCallback(
    (e) => {
      const i = u.getState(), d = i.nodes.find((p) => p.id === t.id);
      (d?.meta?.textGenSelection ?? "") !== e && i.updateNode(t.id, { meta: { ...d?.meta || {}, textGenSelection: e } }, { persist: !1 });
    },
    [t.id]
  ), { editor: c, tools: x } = S({
    content: g,
    placeholder: n("generationCommon.textDocument.placeholder"),
    onChange: b,
    onSelectionChange: v
  }), C = w({
    editor: c,
    selector: ({ editor: e }) => ({ focused: !!e?.isFocused })
  })?.focused ?? !1, f = s.useRef(t.result?.id ?? null), a = t.result?.id, h = t.meta?.textPendingSelectionApply;
  s.useEffect(() => {
    if (!a || h !== a || f.current === a) return;
    f.current = a;
    const e = (t.result?.text || "").trim();
    e && x.replaceSelection(e);
    const i = u.getState(), d = i.nodes.find((p) => p.id === t.id);
    i.updateNode(
      t.id,
      { meta: { ...d?.meta || {}, textPendingSelectionApply: null } },
      { persist: !1 }
    );
  }, [a, h, t.id, t.result?.text, x]);
  const N = A(t.contentJson), k = j(c);
  return (
    // 外层 overflow 可见，让格式条能浮到节点上方；圆角/阴影/裁剪都收进内层 body。
    /* @__PURE__ */ o.jsxs("div", { className: "relative h-full w-full", children: [
      c && C ? /* @__PURE__ */ o.jsx(
        "div",
        {
          role: "toolbar",
          "aria-label": n("generationCommon.textDocument.formattingAria"),
          onPointerDown: (e) => e.stopPropagation(),
          className: m(
            "absolute left-1/2 top-[-44px] z-[9] -translate-x-1/2",
            "flex items-center gap-0.5 rounded-full border border-nomi-line bg-nomi-paper px-1.5 py-1 shadow-nomi-lg"
          ),
          children: k.map((e) => /* @__PURE__ */ o.jsx(
            "button",
            {
              type: "button",
              title: e.label,
              "aria-label": e.label,
              "aria-pressed": e.active ? !0 : void 0,
              disabled: e.disabled,
              "data-active": e.active ? "true" : "false",
              onMouseDown: (i) => i.preventDefault(),
              onClick: e.onClick,
              className: m(
                "inline-grid h-7 w-7 place-items-center rounded-nomi-sm",
                "text-nomi-ink-60 hover:bg-nomi-ink-05 hover:text-nomi-ink",
                "data-[active=true]:bg-nomi-accent-soft data-[active=true]:text-nomi-accent",
                "disabled:cursor-not-allowed disabled:text-nomi-ink-30"
              ),
              children: e.icon
            },
            e.id
          ))
        }
      ) : null,
      /* @__PURE__ */ o.jsxs("div", { className: "flex h-full w-full flex-col overflow-hidden rounded-nomi bg-nomi-paper shadow-nomi-md ring-1 ring-inset ring-nomi-line", children: [
        /* @__PURE__ */ o.jsxs(
          "header",
          {
            className: m(
              "shrink-0 flex items-center gap-1 h-7 px-2",
              "border-b border-nomi-line-soft text-nomi-ink-40",
              "cursor-grab select-none"
            ),
            "aria-label": n("generationCommon.textDocument.dragAria"),
            children: [
              /* @__PURE__ */ o.jsx(P, { size: 13, stroke: 1.8, "aria-hidden": "true" }),
              /* @__PURE__ */ o.jsx("span", { className: "text-micro font-medium tracking-[0.04em]", children: n("generationCommon.textDocument.label") })
            ]
          }
        ),
        /* @__PURE__ */ o.jsxs(
          "section",
          {
            className: m(
              "relative flex-1 min-h-0 overflow-auto cursor-text select-text touch-auto",
              "[&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus-visible]:outline-none"
            ),
            onKeyDown: (e) => e.stopPropagation(),
            onKeyUp: (e) => e.stopPropagation(),
            onBlur: () => r(),
            children: [
              N ? /* @__PURE__ */ o.jsx("span", { className: "pointer-events-none absolute left-8 top-6 text-title leading-relaxed text-nomi-ink-40", children: n("generationCommon.textDocument.placeholder") }) : null,
              /* @__PURE__ */ o.jsx(y, { editor: c })
            ]
          }
        )
      ] })
    ] })
  );
}
const T = s.memo(R, (t, n) => t.node === n.node);
T.displayName = "TextDocumentNode";
export {
  T as default
};
