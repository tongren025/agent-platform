import { S as o, e6 as I, ci as e, o as q, aL as r, l as H, I as J, a1 as N, a4 as S, a2 as C, w as $, R as Q, e7 as U, a3 as X, O as G, x as V, h as Z, f as ee } from "./agentStudioMount-xGP7t2dE.js";
import { I as ie } from "./IconBooks-DSyp1GLp.js";
import { I as re } from "./IconUpload-BesgqNUv.js";
import { I as O } from "./IconWand-vIB0SOXd.js";
import { s as f } from "./showInfoToast-DGBavnQ5.js";
import { s as se } from "./showUndoToast-CbnL5NO4.js";
import { l as ne, g as D, d as te, i as ae, e as oe, s as le } from "./skillApi-mkWNogSI.js";
import { I as ce } from "./IconDownload-DwndPfH4.js";
import { I as me } from "./IconLock-S4tPCq6d.js";
function de(n) {
  const [l, x] = o.useState([]), [m, u] = o.useState(/* @__PURE__ */ new Set()), i = o.useCallback(() => {
    ne().then(x).catch(() => x([])), D().then(u).catch(() => u(/* @__PURE__ */ new Set()));
  }, []);
  o.useEffect(() => {
    if (!n) return;
    i();
    const c = () => {
      D().then(u).catch(() => u(/* @__PURE__ */ new Set()));
    };
    return window.addEventListener("nomi-model-catalog-changed", c), () => window.removeEventListener("nomi-model-catalog-changed", c);
  }, [n, i]);
  const d = o.useCallback(
    async (c) => {
      try {
        const a = await te(c);
        return a.ok && i(), { ok: a.ok, error: a.error };
      } catch (a) {
        return { ok: !1, error: a instanceof Error ? a.message : String(a) };
      }
    },
    [i]
  ), h = o.useCallback(
    async (c) => {
      try {
        const a = await ae(c);
        return a.ok && i(), { ok: a.ok, skillName: a.skillName, error: a.error };
      } catch (a) {
        return { ok: !1, error: a instanceof Error ? a.message : String(a) };
      }
    },
    [i]
  ), p = o.useCallback((c) => oe(c), []);
  return { items: l, available: m, reload: i, remove: d, importPackage: h, exportPackage: p };
}
function pe({
  skill: n,
  available: l,
  onUse: x,
  onExport: m,
  onDelete: u
}) {
  const { t: i } = I(), d = (c) => i(`libraries.skill.provider.${c}`), h = le(n, l), p = n.origin === "user";
  return /* @__PURE__ */ e.jsxs("div", { className: r("flex flex-col gap-2 rounded-nomi border border-nomi-line bg-nomi-paper p-3"), children: [
    /* @__PURE__ */ e.jsxs("div", { className: r("flex items-center gap-2"), children: [
      /* @__PURE__ */ e.jsx(q, { size: 15, stroke: 1.5, className: r("shrink-0 text-nomi-ink-60") }),
      /* @__PURE__ */ e.jsx("span", { className: r("flex-1 min-w-0 truncate text-body-sm font-medium text-nomi-ink"), children: n.label }),
      n.isPlaybook ? /* @__PURE__ */ e.jsx("span", { className: r("shrink-0 rounded-full bg-nomi-accent-soft px-2 py-0.5 text-micro text-nomi-accent"), children: i("libraries.skill.playbookStages", { count: n.stageLabels.length }) }) : /* @__PURE__ */ e.jsx("span", { className: r("shrink-0 rounded-full bg-nomi-ink-05 px-2 py-0.5 text-micro text-nomi-ink-60"), children: i("libraries.skill.assistant") })
    ] }),
    n.description ? /* @__PURE__ */ e.jsx("p", { className: r("text-caption text-nomi-ink-60 line-clamp-2"), children: n.description }) : /* @__PURE__ */ e.jsx("p", { className: r("text-caption text-nomi-ink-40"), children: i("libraries.skill.noDescription") }),
    n.neededProviders.length > 0 && /* @__PURE__ */ e.jsx("div", { className: r("flex flex-wrap items-center gap-2"), children: n.neededProviders.map((c) => {
      const a = !h.missing.includes(c);
      return /* @__PURE__ */ e.jsxs(
        "span",
        {
          className: r(
            "inline-flex items-center gap-0.5 text-micro",
            a ? "text-workbench-success" : "text-nomi-ink-40"
          ),
          children: [
            a ? /* @__PURE__ */ e.jsx(H, { size: 11, stroke: 2 }) : /* @__PURE__ */ e.jsx(J, { size: 11, stroke: 2 }),
            d(c)
          ]
        },
        c
      );
    }) }),
    /* @__PURE__ */ e.jsxs("div", { className: r("mt-0.5 flex items-center gap-1 border-t border-nomi-line-soft pt-2"), children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => x(n),
          className: r(
            "shrink-0 whitespace-nowrap rounded-nomi-sm px-2 py-1 text-caption text-nomi-accent hover:bg-nomi-accent-soft transition-colors"
          ),
          children: i("libraries.skill.useInCreation")
        }
      ),
      /* @__PURE__ */ e.jsx("span", { className: r("flex-1") }),
      /* @__PURE__ */ e.jsxs(N, { children: [
        /* @__PURE__ */ e.jsx(S, { asChild: !0, children: /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => m(n),
            "aria-label": i("libraries.skill.exportAria", { name: n.label }),
            className: r(
              "shrink-0 w-7 h-7 grid place-items-center rounded-nomi-sm text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05 transition-colors"
            ),
            children: /* @__PURE__ */ e.jsx(ce, { size: 14, stroke: 1.7 })
          }
        ) }),
        /* @__PURE__ */ e.jsx(C, { side: "top", children: i("libraries.skill.exportPackage") })
      ] }),
      p ? /* @__PURE__ */ e.jsxs(N, { children: [
        /* @__PURE__ */ e.jsx(S, { asChild: !0, children: /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => u(n),
            "aria-label": i("libraries.skill.deleteAria", { name: n.label }),
            className: r(
              "shrink-0 w-7 h-7 grid place-items-center rounded-nomi-sm text-nomi-ink-60 hover:text-workbench-danger hover:bg-nomi-ink-05 transition-colors"
            ),
            children: /* @__PURE__ */ e.jsx($, { size: 14, stroke: 1.7 })
          }
        ) }),
        /* @__PURE__ */ e.jsx(C, { side: "top", children: i("libraries.skill.deleteSkill") })
      ] }) : /* @__PURE__ */ e.jsxs(N, { children: [
        /* @__PURE__ */ e.jsx(S, { asChild: !0, children: /* @__PURE__ */ e.jsx(
          "span",
          {
            "aria-label": i("libraries.skill.builtinReadonlyAria"),
            className: r("shrink-0 w-7 h-7 grid place-items-center text-nomi-ink-30"),
            children: /* @__PURE__ */ e.jsx(me, { size: 14, stroke: 1.7 })
          }
        ) }),
        /* @__PURE__ */ e.jsx(C, { side: "top", children: i("libraries.skill.builtinReadonly") })
      ] })
    ] })
  ] });
}
const xe = [
  { value: "mine", labelKey: "libraries.skill.source.mine" },
  { value: "builtin", labelKey: "libraries.skill.source.builtin" }
], ue = "workbench.creation.skill-author";
function be({
  active: n,
  compact: l = !1,
  showHeader: x = !0,
  onClose: m,
  className: u
}) {
  const { t: i } = I(), [d, h] = o.useState("mine"), [p, c] = o.useState(""), a = o.useRef(null), { items: v, available: F, remove: L, importPackage: g, exportPackage: j } = de(n), E = U((s) => s.setWorkspaceMode), T = U((s) => s.setCreationActiveSkill), A = o.useMemo(() => {
    const s = p.trim().toLowerCase();
    return v.filter((t) => (d === "mine" ? t.origin !== "user" : t.origin !== "builtin") ? !1 : s ? t.label.toLowerCase().includes(s) || (t.description ?? "").toLowerCase().includes(s) : !0);
  }, [v, d, p]);
  o.useEffect(() => {
    if (!n || !m) return;
    const s = (t) => {
      t.key === "Escape" && m();
    };
    return window.addEventListener("keydown", s), () => window.removeEventListener("keydown", s);
  }, [n, m]);
  const y = o.useCallback(
    (s) => {
      T(s), E("creation"), m?.();
    },
    [T, E, m]
  ), M = o.useCallback(
    (s) => y({ key: s.name, name: s.label }),
    [y]
  ), z = o.useCallback(() => y({ key: ue, name: i("libraries.skill.authorName") }), [y, i]), B = o.useCallback(
    async (s) => {
      const t = await j(s.directoryName);
      if (!t) {
        f(i("libraries.skill.exportNotFound"));
        return;
      }
      const b = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), k = URL.createObjectURL(b), w = document.createElement("a");
      w.href = k, w.download = `${s.directoryName}.nomiskill.json`, w.click(), URL.revokeObjectURL(k);
    },
    [j, i]
  ), K = o.useCallback(
    async (s) => {
      const t = await j(s.directoryName), b = await L(s.directoryName);
      if (!b.ok) {
        f(b.error ?? i("libraries.skill.deleteFailed"));
        return;
      }
      se({
        message: i("libraries.skill.deleted", { name: s.label }),
        onUndo: () => {
          t && g(t);
        }
      });
    },
    [j, L, g, i]
  ), Y = o.useCallback(
    (s) => {
      const t = new FileReader();
      t.onload = async () => {
        let b;
        try {
          b = JSON.parse(String(t.result || ""));
        } catch {
          f(i("libraries.skill.invalidPackage"));
          return;
        }
        const k = await g(b);
        f(k.ok ? i("libraries.skill.imported", { name: k.skillName ?? i("libraries.skill.newSkill") }) : i("libraries.skill.importFailed", { message: k.error ?? i("libraries.skill.unknownError") }));
      }, t.onerror = () => f(i("libraries.skill.readFailed")), t.readAsText(s);
    },
    [g, i]
  ), P = d === "mine" && !p.trim(), _ = /* @__PURE__ */ e.jsx(
    "div",
    {
      className: r("inline-flex bg-nomi-ink-05 rounded-full p-0.5", l ? "w-full" : "shrink-0"),
      role: "tablist",
      "aria-label": i("libraries.skill.sourceAria"),
      children: xe.map((s) => {
        const t = d === s.value;
        return /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": t,
            className: r(
              "rounded-full text-caption cursor-pointer border-0 bg-transparent whitespace-nowrap",
              "transition-[background,color] duration-[var(--nomi-transition-fast)]",
              l ? "min-w-0 flex-1 px-2 py-1" : "px-3 py-1",
              t ? "bg-nomi-paper text-nomi-ink font-semibold shadow-nomi-sm" : "text-nomi-ink-60 hover:text-nomi-ink"
            ),
            onClick: () => h(s.value),
            children: i(s.labelKey)
          },
          s.value
        );
      })
    }
  ), R = /* @__PURE__ */ e.jsxs(
    "button",
    {
      type: "button",
      onClick: () => a.current?.click(),
      className: r(
        "shrink-0 inline-flex items-center justify-center gap-1.5 h-8 rounded-full cursor-pointer",
        "border border-nomi-line bg-transparent text-nomi-ink-80 text-caption hover:bg-nomi-ink-05 transition-colors",
        l ? "px-2" : "px-3"
      ),
      children: [
        /* @__PURE__ */ e.jsx(re, { size: 14, stroke: 1.7 }),
        i("libraries.skill.importFile")
      ]
    }
  ), W = /* @__PURE__ */ e.jsxs(
    "button",
    {
      type: "button",
      onClick: z,
      className: r(
        "shrink-0 inline-flex items-center justify-center gap-1.5 h-8 rounded-full cursor-pointer border-0",
        "bg-nomi-ink text-nomi-paper text-caption hover:bg-nomi-accent transition-colors",
        l ? "px-2" : "px-3.5"
      ),
      children: [
        /* @__PURE__ */ e.jsx(O, { size: 14, stroke: 1.7 }),
        i(l ? "libraries.skill.createCompact" : "libraries.skill.create")
      ]
    }
  );
  return /* @__PURE__ */ e.jsx(X, { delayDuration: 180, skipDelayDuration: 80, children: /* @__PURE__ */ e.jsxs("div", { className: r("flex min-h-0 flex-1 flex-col overflow-hidden", u), children: [
    x ? /* @__PURE__ */ e.jsxs("div", { className: r("flex items-center gap-2 px-5 pt-4 pb-3 border-b border-nomi-line"), children: [
      /* @__PURE__ */ e.jsx(ie, { size: 18, stroke: 1.6, className: r("text-nomi-accent") }),
      /* @__PURE__ */ e.jsx("b", { className: r("text-title font-bold text-nomi-ink"), children: i("libraries.skill.title") }),
      /* @__PURE__ */ e.jsx(G, { fontSize: 13, className: r("text-nomi-ink-40") }),
      /* @__PURE__ */ e.jsxs("span", { className: r("text-caption text-nomi-ink-40"), children: [
        "· ",
        v.length
      ] }),
      /* @__PURE__ */ e.jsx("span", { className: r("flex-1") }),
      m ? /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          className: r("w-7 h-7 grid place-items-center rounded-nomi-sm cursor-pointer border-0 bg-transparent", "text-nomi-ink-40 hover:text-nomi-ink hover:bg-nomi-ink-05"),
          "aria-label": i("libraries.skill.closeAria"),
          onClick: m,
          children: /* @__PURE__ */ e.jsx(V, { size: 16, stroke: 2 })
        }
      ) : null
    ] }) : null,
    /* @__PURE__ */ e.jsxs("div", { className: r("flex gap-2", l ? "flex-col px-3 py-3" : "items-center px-5 py-2.5"), children: [
      _,
      /* @__PURE__ */ e.jsx(
        Z,
        {
          className: l ? "w-full" : "flex-1",
          placeholder: i("libraries.skill.searchPlaceholder"),
          ariaLabel: i("libraries.skill.searchAria"),
          value: p,
          onChange: c
        }
      ),
      l ? /* @__PURE__ */ e.jsxs("div", { className: r("grid grid-cols-2 gap-2"), children: [
        R,
        W
      ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        R,
        W
      ] }),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          ref: a,
          type: "file",
          accept: ".json,.nomiskill,application/json",
          className: "hidden",
          onChange: (s) => {
            const t = s.target.files?.[0];
            t && Y(t), s.target.value = "";
          }
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: r("flex-1 overflow-y-auto", l ? "px-3 pb-3" : "px-5 pb-5"), children: !A.length && !P ? /* @__PURE__ */ e.jsx(
      ee,
      {
        title: p.trim() ? i("libraries.skill.noMatch") : i(d === "mine" ? "libraries.skill.noMine" : "libraries.skill.noBuiltin"),
        description: p.trim() ? i("libraries.skill.tryAnotherSearch") : d === "mine" ? i("libraries.skill.mineEmptyHint") : ""
      }
    ) : /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: r("grid gap-3"),
        style: { gridTemplateColumns: l ? "minmax(0, 1fr)" : "repeat(auto-fill, minmax(220px, 1fr))" },
        children: [
          P ? /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: z,
              className: r("flex flex-col items-center justify-center gap-1.5 w-full min-h-[120px] cursor-pointer", "rounded-nomi border border-dashed border-nomi-line bg-transparent text-nomi-ink-40", "hover:border-nomi-accent hover:text-nomi-accent transition-colors"),
              children: [
                /* @__PURE__ */ e.jsx(O, { size: 22, stroke: 1.6 }),
                /* @__PURE__ */ e.jsx("span", { className: r("text-caption"), children: i("libraries.skill.createOne") })
              ]
            }
          ) : null,
          A.map((s) => /* @__PURE__ */ e.jsx(
            pe,
            {
              skill: s,
              available: F,
              onUse: M,
              onExport: B,
              onDelete: K
            },
            s.directoryName
          ))
        ]
      }
    ) })
  ] }) });
}
function Se({ opened: n, onClose: l }) {
  const { t: x } = I();
  return n ? /* @__PURE__ */ e.jsx(Q, { children: /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: r("fixed inset-0 grid place-items-center p-6"),
      style: { zIndex: 4e3, background: "var(--nomi-scrim)", animation: "nomi-fade 140ms cubic-bezier(.2,.7,.3,1)" },
      onMouseDown: (m) => {
        m.target === m.currentTarget && l();
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "div",
          {
            role: "dialog",
            "aria-label": x("libraries.skill.title"),
            className: r("w-[960px] max-w-full h-[86vh] flex flex-col overflow-hidden", "bg-nomi-paper border border-nomi-line rounded-nomi-lg shadow-nomi-lg"),
            style: { animation: "nomi-panel-pop 160ms cubic-bezier(.2,.7,.3,1)" },
            children: /* @__PURE__ */ e.jsx(be, { active: n, onClose: l })
          }
        ),
        /* @__PURE__ */ e.jsx("style", { children: `
          @keyframes nomi-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes nomi-panel-pop { from { opacity: 0; transform: translateY(-6px) scale(0.99) } to { opacity: 1; transform: translateY(0) scale(1) } }
        ` })
      ]
    }
  ) }) : null;
}
export {
  be as SkillLibraryContent,
  Se as SkillLibraryPanel
};
