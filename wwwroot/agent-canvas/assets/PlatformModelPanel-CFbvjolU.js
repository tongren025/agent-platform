import { S as a, ds as b, ci as e, R as k, K as N, a8 as g, cm as K } from "./agentStudioMount-D0_EKHTh.js";
const E = { text: [], image: [], video: [] };
async function x(i) {
  return K({ kind: i, enabled: !0 });
}
function L({ opened: i, onClose: s }) {
  const o = a.useRef(null), [r, w] = a.useState(E), [f, u] = a.useState(!1), [m, y] = a.useState(""), [h, p] = a.useState(
    () => window.localStorage.getItem("canvas.employee") || ""
  );
  if (a.useEffect(() => {
    if (!i) return;
    let t = !0;
    return u(!0), y(""), Promise.all([x("text"), x("image"), x("video")]).then(([n, d, c]) => {
      if (!t) return;
      w({ text: n, image: d, video: c });
      const l = h || n[0]?.modelKey || "";
      l && (p(l), window.localStorage.setItem("canvas.employee", l), b({ vendorKey: "platform-employee", modelKey: l }));
    }).catch((n) => {
      t && y(n instanceof Error ? n.message : String(n));
    }).finally(() => {
      t && u(!1);
    }), () => {
      t = !1;
    };
  }, [i]), a.useEffect(() => {
    if (!i) return;
    const t = (c) => {
      c.key === "Escape" && s();
    }, n = (c) => {
      const l = c.target;
      l && o.current && !o.current.contains(l) && s();
    };
    window.addEventListener("keydown", t);
    const d = window.requestAnimationFrame(() => window.addEventListener("mousedown", n));
    return () => {
      window.cancelAnimationFrame(d), window.removeEventListener("keydown", t), window.removeEventListener("mousedown", n);
    };
  }, [i, s]), !i) return null;
  const v = (t) => {
    p(t.modelKey), window.localStorage.setItem("canvas.employee", t.modelKey), b({ vendorKey: t.vendorKey, modelKey: t.modelKey });
  };
  return /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsxs(
    "div",
    {
      ref: o,
      role: "dialog",
      "aria-label": "平台模型与数字员工",
      className: "fixed right-3 top-16 z-[4000] flex max-h-[calc(100vh-80px)] w-[360px] flex-col overflow-hidden rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg",
      children: [
        /* @__PURE__ */ e.jsxs("header", { className: "flex items-center gap-3 border-b border-nomi-line-soft px-4 py-3", children: [
          /* @__PURE__ */ e.jsx(N, { size: 30 }),
          /* @__PURE__ */ e.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-body font-semibold text-nomi-ink", children: "平台模型与数字员工" }),
            /* @__PURE__ */ e.jsx("div", { className: "text-micro text-nomi-ink-40", children: "直接使用 Agent Studio 已配置的能力" })
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: "border-0 bg-transparent text-body-sm text-nomi-ink-60 cursor-pointer",
              onClick: s,
              children: "关闭"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto p-4", children: [
          f ? /* @__PURE__ */ e.jsx("p", { className: "text-body-sm text-nomi-ink-60", children: "正在读取平台能力…" }) : null,
          m ? /* @__PURE__ */ e.jsx("div", { className: "rounded-nomi-sm bg-red-50 px-3 py-2 text-body-sm text-red-700", children: m }) : null,
          !f && !m ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            /* @__PURE__ */ e.jsxs("section", { children: [
              /* @__PURE__ */ e.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ e.jsx("h3", { className: "m-0 text-body-sm font-semibold text-nomi-ink", children: "画布助手员工" }),
                /* @__PURE__ */ e.jsxs("span", { className: "text-micro text-nomi-ink-40", children: [
                  r.text.length,
                  " 个"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "grid gap-2", children: [
                r.text.map((t) => {
                  const n = t.modelKey === h;
                  return /* @__PURE__ */ e.jsxs(
                    "button",
                    {
                      type: "button",
                      className: [
                        "flex w-full items-center justify-between rounded-nomi-sm border px-3 py-2 text-left cursor-pointer",
                        n ? "border-nomi-accent bg-nomi-accent-soft text-nomi-ink" : "border-nomi-line-soft bg-nomi-paper text-nomi-ink hover:bg-nomi-ink-05"
                      ].join(" "),
                      onClick: () => v(t),
                      children: [
                        /* @__PURE__ */ e.jsx("span", { className: "truncate text-body-sm", children: t.labelZh || t.modelKey }),
                        /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: n ? "当前使用" : "选择" })
                      ]
                    },
                    t.modelKey
                  );
                }),
                r.text.length === 0 ? /* @__PURE__ */ e.jsx("p", { className: "m-0 text-body-sm text-nomi-ink-40", children: "还没有可用数字员工。" }) : null
              ] })
            ] }),
            /* @__PURE__ */ e.jsx(j, { title: "图片模型", rows: r.image }),
            /* @__PURE__ */ e.jsx(j, { title: "视频模型", rows: r.video })
          ] }) : null
        ] }),
        /* @__PURE__ */ e.jsxs("footer", { className: "flex gap-2 border-t border-nomi-line-soft px-4 py-3", children: [
          /* @__PURE__ */ e.jsx(g, { variant: "default", onClick: () => window.location.assign("/employees"), children: "管理数字员工" }),
          /* @__PURE__ */ e.jsx(g, { variant: "primary", onClick: () => window.location.assign("/models"), children: "管理媒体模型" })
        ] })
      ]
    }
  ) });
}
function j({ title: i, rows: s }) {
  return /* @__PURE__ */ e.jsxs("section", { className: "mt-5", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ e.jsx("h3", { className: "m-0 text-body-sm font-semibold text-nomi-ink", children: i }),
      /* @__PURE__ */ e.jsxs("span", { className: "text-micro text-nomi-ink-40", children: [
        s.length,
        " 个"
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
      s.slice(0, 12).map((o) => /* @__PURE__ */ e.jsx(
        "span",
        {
          className: "max-w-full truncate rounded-pill bg-nomi-ink-05 px-2.5 py-1 text-micro text-nomi-ink-60",
          title: o.modelKey,
          children: o.labelZh || o.modelKey
        },
        `${o.vendorKey}:${o.modelKey}`
      )),
      s.length === 0 ? /* @__PURE__ */ e.jsx("span", { className: "text-body-sm text-nomi-ink-40", children: "暂无可用模型" }) : null,
      s.length > 12 ? /* @__PURE__ */ e.jsxs("span", { className: "text-micro text-nomi-ink-40", children: [
        "另有 ",
        s.length - 12,
        " 个"
      ] }) : null
    ] })
  ] });
}
export {
  L as PlatformModelPanel
};
