import { aT as we, e6 as P, S as p, dO as _t, ci as e, l as ce, aL as l, a8 as W, cn as Pt, co as Mt, e7 as k, o as de, aP as Je, x as ye, p as Te, u as Rt, I as ve, cS as le, dQ as Se, dX as zt, dm as Kt, ch as Dt, cY as Ot, ed as ze, dA as Lt, aG as Wt, K as Ft, a9 as pe, cR as Bt, ds as Ke, c3 as Ht, dW as Ye, cB as Vt, w as Xe, d8 as Gt, s as Ee, dB as Ut, d9 as $t, ae as qt, N as Jt } from "./agentStudioMount-BaWK4RwX.js";
import { N as Yt, e as Xt, s as Zt, k as Qt, j as eo, m as to, u as oo, r as no, g as De, W as ro, M as io, I as so, U as ao, A as lo, a as co, S as mo, C as uo, c as po, d as je, l as ho, b as xo, h as bo } from "./useComposerAttachments-_ALDH2kv.js";
import { a as fo, I as go } from "./IconMinimize-Dcrjml9I.js";
import { a as ko, I as yo } from "./IconSettings-CaEy4NBd.js";
import { N as te } from "./NomiSelect-DdTzVQLj.js";
import { I as Oe } from "./IconBulb-Bd-f-uAA.js";
import { I as Ze } from "./IconArrowRight-5DWpOm7J.js";
import { I as vo } from "./IconStack2-zEVDXtra.js";
import { a as jo, I as wo } from "./IconPhotoPlus-wIGvZQXU.js";
import { I as Qe } from "./IconChevronRight-DIa5qTWP.js";
import { I as Le } from "./IconWand-DhVn0cCC.js";
import { l as No, g as et, s as Ie, i as Co } from "./skillApi-YO_JxpPW.js";
import { g as Ao } from "./generationCanvasTools-D1IGg4FI.js";
import { a as tt, c as So, d as Eo } from "./applyCanvasToolCall-CJg90HLw.js";
import { e as ot, g as We, b as Io, m as To, C as _o } from "./WorkbenchShell-T-2hPszg.js";
import { a as Fe, b as Be } from "./guidedProductionEvents-DQruDmqB.js";
import { E as Po } from "./index-Bv2h0T1m.js";
import { I as Mo, c as Ro, a as zo, b as Ko, u as Do, d as Oo } from "./richTextActions-BrcNf4NY.js";
import { I as Lo } from "./IconVideo-B329A_-e.js";
import { a as ke } from "./workbenchActions-DHj7PSde.js";
import { u as Wo, a as He, I as Fo } from "./useDedupedModelSelect-DtDhX_U7.js";
import { r as Bo } from "./promptLearningApi-CFrVWfho.js";
import { I as Ho } from "./IconBox-D0_Vt9W8.js";
import { I as Vo } from "./IconCamera-Cdtry-DY.js";
import { I as nt } from "./IconFolder-CdYCe-pz.js";
import { I as Go } from "./IconLetterCase-BcHOlwvn.js";
import { a as Uo, I as $o } from "./IconPalette-BEKngY0D.js";
import { I as qo } from "./IconUser-B27gxuZu.js";
const Jo = [["path", { d: "M10 12h4", key: "svg-0" }], ["path", { d: "M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3", key: "svg-1" }], ["path", { d: "M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3", key: "svg-2" }]], Yo = we("outline", "cursor-text", "CursorText", Jo);
const Xo = [["path", { d: "M14 3v4a1 1 0 0 0 1 1h4", key: "svg-0" }], ["path", { d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2", key: "svg-1" }], ["path", { d: "M12 11l0 6", key: "svg-2" }], ["path", { d: "M9 14l6 0", key: "svg-3" }]], Zo = we("outline", "file-plus", "FilePlus", Xo);
const Qo = [["path", { d: "M3 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-0" }], ["path", { d: "M15 16a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-1" }], ["path", { d: "M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3", key: "svg-2" }], ["path", { d: "M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3", key: "svg-3" }]], en = we("outline", "replace", "Replace", Qo);
const tn = [["path", { d: "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", key: "svg-0" }], ["path", { d: "M16 19h6", key: "svg-1" }], ["path", { d: "M19 16v6", key: "svg-2" }], ["path", { d: "M6 21v-2a4 4 0 0 1 4 -4h4", key: "svg-3" }]], on = we("outline", "user-plus", "UserPlus", tn);
async function nn() {
  try {
    const [o, t] = await Promise.all([
      Pt({ kind: "text", enabled: !1 }),
      Mt()
    ]), n = new Set(t.filter((i) => i.hasApiKey).map((i) => i.key)), r = o.find((i) => n.has(i.vendorKey));
    return r ? { vendorKey: r.vendorKey, modelKey: r.modelKey, labelZh: r.labelZh } : null;
  } catch {
    return null;
  }
}
function rn({ onResolved: o }) {
  const { t } = P(), [n, r] = p.useState("prompt"), [i, a] = p.useState(null);
  p.useEffect(() => {
    let f = !0;
    return nn().then((m) => {
      f && a(m);
    }), () => {
      f = !1;
    };
  }, []);
  const u = p.useCallback(() => {
    window.dispatchEvent(new CustomEvent("nomi-open-model-catalog"));
  }, []), c = p.useCallback(async () => {
    if (i) {
      r("enabling");
      try {
        await _t({ ...i, kind: "text", enabled: !0 }), window.dispatchEvent(new CustomEvent("nomi-model-catalog-changed")), r("done"), o?.();
      } catch {
        r("prompt");
      }
    }
  }, [i, o]);
  return /* @__PURE__ */ e.jsxs("div", { className: l("self-start w-full max-w-full"), "data-role": "assistant", "data-recovery": "no-text-model", children: [
    /* @__PURE__ */ e.jsx(Yt, {}),
    n === "done" ? /* @__PURE__ */ e.jsxs("div", { className: l("flex items-start gap-2 p-3 rounded-nomi border border-nomi-line bg-nomi-ink-05"), children: [
      /* @__PURE__ */ e.jsx(ce, { size: 16, className: l("mt-0.5 shrink-0 text-nomi-ink-80") }),
      /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-1"), children: [
        /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-medium text-nomi-ink"), children: t("creationAi.noTextModel.readyTitle") }),
        /* @__PURE__ */ e.jsx("span", { className: l("text-caption text-nomi-ink-60 leading-snug"), children: t("creationAi.noTextModel.readyDescription") })
      ] })
    ] }) : /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-3 p-3 rounded-nomi border border-nomi-line"), children: [
      /* @__PURE__ */ e.jsxs("div", { className: l("flex items-start gap-2"), children: [
        /* @__PURE__ */ e.jsx(Oe, { size: 18, className: l("mt-0.5 shrink-0 text-nomi-ink-60") }),
        /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-1"), children: [
          /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-medium text-nomi-ink leading-snug"), children: t("creationAi.noTextModel.title") }),
          /* @__PURE__ */ e.jsxs("span", { className: l("text-caption text-nomi-ink-60 leading-snug"), children: [
            t("creationAi.noTextModel.descriptionBefore"),
            /* @__PURE__ */ e.jsx("span", { className: l("text-nomi-ink"), children: t("creationAi.noTextModel.textModel") }),
            t("creationAi.noTextModel.descriptionAfter")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-2"), children: [
        i ? /* @__PURE__ */ e.jsxs(
          W,
          {
            variant: "primary",
            className: "w-full",
            loading: n === "enabling",
            onClick: () => {
              c();
            },
            children: [
              /* @__PURE__ */ e.jsx(Oe, {}),
              /* @__PURE__ */ e.jsx("span", { className: "min-w-0 truncate", children: t("creationAi.noTextModel.enable", { model: i.labelZh }) })
            ]
          }
        ) : null,
        /* @__PURE__ */ e.jsxs(W, { variant: "default", className: "w-full", onClick: u, children: [
          /* @__PURE__ */ e.jsx(ko, {}),
          t("creationAi.noTextModel.settings")
        ] })
      ] })
    ] })
  ] });
}
function sn() {
  const { t: o } = P(), t = k((d) => d.storyboardPlan), n = k((d) => d.storyboardPlanCommitted), r = k((d) => d.storyboardEditorOpen), i = k((d) => d.setStoryboardEditorOpen), a = k((d) => d.discardStoryboardPlan), u = k((d) => d.setWorkspaceMode);
  if (!t) return null;
  const c = t.title.trim() || o("storyboardEditor.planCard.defaultTitle"), f = t.shots.length, m = t.anchors.length, j = Math.round(t.shots.reduce((d, S) => d + (S.shotKind === "image" ? 0 : S.durationSec || 0), 0)), C = o("storyboardEditor.planCard.meta", {
    shots: f,
    anchors: m,
    duration: j > 0 ? o("storyboardEditor.planCard.duration", { seconds: j }) : o("storyboardEditor.planCard.imageStoryboard")
  }), y = async () => {
    await Je({
      title: o("storyboardEditor.discardTitle"),
      message: o("storyboardEditor.planCard.discardMessage"),
      confirmLabel: o("storyboardEditor.discard"),
      danger: !0
    }) && a();
  }, g = r ? { label: o("storyboardEditor.planCard.editing"), cls: "bg-nomi-accent-soft text-nomi-accent" } : n ? { label: o("storyboardEditor.planCard.committed"), cls: "bg-workbench-success-soft text-workbench-success" } : { label: o("storyboardEditor.planCard.draft"), cls: "bg-nomi-accent-soft text-nomi-accent" };
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: l(
        "flex flex-col gap-2 p-3 rounded-nomi border bg-nomi-paper",
        r ? "border-nomi-accent" : "border-nomi-line"
      ),
      "data-storyboard-card": n ? "committed" : r ? "editing" : "draft",
      children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          n && !r ? /* @__PURE__ */ e.jsx(vo, { size: 15, stroke: 1.6, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ e.jsx(de, { size: 15, stroke: 1.6, className: "shrink-0 text-nomi-ink-60" }),
          /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate text-body-sm font-medium text-nomi-ink", children: c }),
          /* @__PURE__ */ e.jsx("span", { className: l("shrink-0 text-micro px-2 py-0.5 rounded-full leading-relaxed", g.cls), children: g.label })
        ] }),
        r ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.editingSummary", { count: f }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(W, { variant: "default", size: "sm", onClick: () => i(!1), children: o("storyboardEditor.planCard.backToDraft") }),
            /* @__PURE__ */ e.jsx("span", { className: "ml-auto text-caption text-nomi-ink-40", children: o("storyboardEditor.planCard.confirmHint") })
          ] })
        ] }) : n ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.committedSummary", { count: f }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(W, { variant: "default", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.editAgain") }),
            /* @__PURE__ */ e.jsxs(W, { variant: "default", size: "sm", className: "ml-auto", onClick: () => u("generation"), children: [
              o("storyboardEditor.planCard.goGeneration"),
              /* @__PURE__ */ e.jsx(Ze, { size: 13, stroke: 1.6 })
            ] })
          ] })
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: C }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
            t.shots.slice(0, 2).map((d) => /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 py-1 border-t border-nomi-line-soft text-caption text-nomi-ink-60", children: [
              /* @__PURE__ */ e.jsx("span", { className: "shrink-0 tabular-nums text-nomi-ink-40", children: String(d.index).padStart(2, "0") }),
              /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate", children: d.prompt.trim() || o("storyboardEditor.planCard.emptyPrompt") })
            ] }, d.index)),
            f > 2 ? /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 py-1 border-t border-nomi-line-soft text-caption text-nomi-ink-40", children: [
              /* @__PURE__ */ e.jsx("span", { className: "shrink-0", children: "···" }),
              /* @__PURE__ */ e.jsx("span", { children: o("storyboardEditor.planCard.moreShots", { count: f - 2 }) })
            ] }) : null
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(W, { variant: "primary", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.openEditor") }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: y,
                className: "ml-auto text-caption text-nomi-ink-40 hover:text-workbench-danger",
                children: o("storyboardEditor.discard")
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const an = {
  storyboard: de,
  fixation: on
}, ln = [
  { value: "image", labelKey: "storyboardEditor.action.imageMode", Icon: Te },
  { value: "video", labelKey: "storyboardEditor.action.videoMode", Icon: de },
  { value: "image-video", labelKey: "storyboardEditor.action.imageVideoMode", Icon: jo }
];
function rt({
  kind: o,
  resolved: t,
  onRun: n,
  lead: r,
  onDismiss: i
}) {
  const { t: a } = P(), u = an[o], c = a(o === "storyboard" ? "storyboardEditor.action.storyboardLead" : "storyboardEditor.action.fixationLead"), f = a(o === "storyboard" ? "storyboardEditor.action.storyboardCta" : "storyboardEditor.action.fixationCta"), m = r ?? c, [j, C] = p.useState("image");
  return /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-2 p-3 rounded-nomi border border-nomi-line bg-nomi-paper"), "data-action-card": o, children: [
    /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-2 min-w-0"), children: [
      /* @__PURE__ */ e.jsx(u, { size: 15, stroke: 1.6, className: l("shrink-0 text-nomi-ink-60") }),
      /* @__PURE__ */ e.jsx("span", { className: l("min-w-0 flex-1 text-body-sm text-nomi-ink-80 leading-relaxed"), children: m }),
      i ? /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.action.dismiss"),
          onClick: i,
          className: l("shrink-0 -mr-1 -mt-0.5 p-1 rounded-nomi-sm text-nomi-ink-40 hover:text-nomi-ink hover:bg-nomi-ink-05"),
          children: /* @__PURE__ */ e.jsx(ye, { size: 13, stroke: 1.8 })
        }
      ) : null
    ] }),
    o === "storyboard" ? /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-1"), role: "radiogroup", "aria-label": a("storyboardEditor.action.typeAria"), children: [
      ln.map((y) => {
        const g = j === y.value;
        return /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": g,
            disabled: t,
            onClick: () => C(y.value),
            "data-shot-mode": y.value,
            className: l(
              "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-caption border whitespace-nowrap shrink-0",
              g ? "border-nomi-ink bg-nomi-ink text-nomi-paper font-medium" : "border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
            ),
            children: [
              /* @__PURE__ */ e.jsx(y.Icon, { size: 12, stroke: 1.8 }),
              a(y.labelKey)
            ]
          },
          y.value
        );
      }),
      /* @__PURE__ */ e.jsx("span", { className: l("text-micro text-nomi-ink-40 ml-1 min-w-0 truncate"), children: a(j === "image" ? "storyboardEditor.action.imageHint" : j === "image-video" ? "storyboardEditor.action.imageVideoHint" : "storyboardEditor.action.videoHint") })
    ] }) : null,
    /* @__PURE__ */ e.jsxs(
      W,
      {
        variant: "primary",
        size: "sm",
        className: l("self-start"),
        disabled: t,
        onClick: () => n(j),
        "data-action-run": o,
        children: [
          /* @__PURE__ */ e.jsx(u, { size: 14, stroke: 1.7 }),
          t ? a("storyboardEditor.action.started") : f,
          t ? null : /* @__PURE__ */ e.jsx(Ze, { size: 13, stroke: 1.7 })
        ]
      }
    )
  ] });
}
const it = /拆镜头|分镜|拆分|镜头脚本|storyboard|成片|出片/i, st = /(?:拆|切|分|变|做|整|铺|排|拍|剪|生成|搞|弄|规划).{0,6}(?:镜头|分镜|画面|场景|视频|短片|片子|一段段|一格格|一幕幕|一幕)/, cn = /立角色卡|角色卡|人物卡|定妆|角色设定|建.{0,2}角色/;
function dn(o) {
  return it.test(o) || st.test(o);
}
function mn(o) {
  const t = o.trim();
  return t ? dn(t) ? "storyboard" : cn.test(t) ? "fixation" : null : null;
}
function un(o) {
  const t = o.trim();
  if (!t) return "";
  const n = t.split(/[:：]/).slice(1).join("：").trim();
  return n.length >= 12 ? n : t.replace(it, "").replace(st, "").replace(/[\s,，。、!！?？]+/g, "").length >= 12 ? t : "";
}
const pn = "workbench.creation.skill-author";
function hn() {
  window.dispatchEvent(new Event("nomi-open-model-catalog"));
}
function xn({
  activeSkill: o,
  autoLabel: t,
  onSelect: n
}) {
  const { t: r } = P(), i = (h) => r(`libraries.skill.provider.${h}`), a = p.useRef(null), [u, c] = p.useState(!1), [f, m] = p.useState([]), [j, C] = p.useState(/* @__PURE__ */ new Set()), y = p.useCallback(() => {
    No().then((h) => m(h.filter((E) => E.isPlaybook))).catch(() => m([])), et().then(C).catch(() => C(/* @__PURE__ */ new Set()));
  }, []);
  p.useEffect(() => {
    y();
  }, [y]);
  const g = o ? f.find((h) => h.name === o.key) ?? null : null, d = g ? Ie(g, j).missing : [], S = !!o;
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        ref: a,
        type: "button",
        onClick: () => c((h) => !h),
        title: r("libraries.skill.currentHint"),
        className: [
          "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-caption font-medium shrink min-w-0 transition-colors",
          "duration-[var(--nomi-transition-fast)]",
          S ? "bg-nomi-accent-soft text-nomi-accent" : "bg-nomi-ink-05 text-nomi-ink-80 hover:bg-nomi-ink-10"
        ].join(" "),
        children: [
          S ? /* @__PURE__ */ e.jsx(de, { size: 14, stroke: 1.5, className: "shrink-0" }) : /* @__PURE__ */ e.jsx(Rt, { size: 14, stroke: 1.5, className: "shrink-0" }),
          /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o ? o.name : t }),
          d.length > 0 && /* @__PURE__ */ e.jsx(ve, { size: 13, stroke: 1.8, className: "shrink-0 text-workbench-danger" }),
          /* @__PURE__ */ e.jsx(Qe, { size: 13, stroke: 1.6, className: "shrink-0 opacity-60" })
        ]
      }
    ),
    u && /* @__PURE__ */ e.jsx(Xt, { anchorRef: a, onClose: () => c(!1), children: /* @__PURE__ */ e.jsxs("div", { className: "w-[284px] rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg p-1.5 text-body-sm text-nomi-ink", children: [
      /* @__PURE__ */ e.jsx("div", { className: "px-2 pt-1 pb-2 text-caption text-nomi-ink-60", children: r("libraries.skill.choose") }),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            n(null), c(!1);
          },
          className: [
            "flex w-full items-center gap-2 rounded-nomi-sm px-2.5 py-2 text-left transition-colors",
            "duration-[var(--nomi-transition-fast)]",
            o ? "hover:bg-nomi-ink-05" : "bg-nomi-accent-soft text-nomi-accent"
          ].join(" "),
          children: [
            /* @__PURE__ */ e.jsx(Le, { size: 16, stroke: 1.5, className: "shrink-0" }),
            /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ e.jsx("span", { className: "block font-medium", children: r("libraries.skill.auto") }),
              /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: r("libraries.skill.followsMode", { mode: t }) })
            ] }),
            !o && /* @__PURE__ */ e.jsx(ce, { size: 15, stroke: 1.8, className: "shrink-0" })
          ]
        }
      ),
      f.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "my-1 border-t border-nomi-line-soft" }),
      f.map((h) => {
        const E = Ie(h, j), U = o?.key === h.name;
        return /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              n({ key: h.name, name: h.label }), c(!1);
            },
            className: [
              "flex w-full items-start gap-2 rounded-nomi-sm px-2.5 py-2 text-left transition-colors",
              "duration-[var(--nomi-transition-fast)]",
              U ? "bg-nomi-accent-soft text-nomi-accent" : "hover:bg-nomi-ink-05"
            ].join(" "),
            children: [
              /* @__PURE__ */ e.jsx(de, { size: 16, stroke: 1.5, className: "mt-0.5 shrink-0" }),
              /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "font-medium truncate", children: h.label }),
                  /* @__PURE__ */ e.jsx("span", { className: "shrink-0 rounded-full bg-nomi-ink-05 px-1.5 text-micro text-nomi-ink-60", children: r("libraries.skill.playbookStages", { count: h.stageLabels.length }) })
                ] }),
                h.author && /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: h.author }),
                /* @__PURE__ */ e.jsx("span", { className: "mt-1 flex flex-wrap items-center gap-1", children: h.neededProviders.map((M) => {
                  const K = !E.missing.includes(M);
                  return /* @__PURE__ */ e.jsxs(
                    "span",
                    {
                      className: [
                        "inline-flex items-center gap-0.5 text-micro",
                        K ? "text-workbench-success" : "text-nomi-ink-40"
                      ].join(" "),
                      children: [
                        K ? /* @__PURE__ */ e.jsx(ce, { size: 11, stroke: 2 }) : /* @__PURE__ */ e.jsx(ve, { size: 11, stroke: 2 }),
                        i(M)
                      ]
                    },
                    M
                  );
                }) })
              ] }),
              U && /* @__PURE__ */ e.jsx(ce, { size: 15, stroke: 1.8, className: "mt-0.5 shrink-0" })
            ]
          },
          h.directoryName
        );
      }),
      d.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "mx-1 mt-1.5 flex items-center justify-between gap-2 rounded-nomi-sm bg-nomi-ink-05 px-2.5 py-2", children: [
        /* @__PURE__ */ e.jsx("span", { className: "min-w-0 text-micro text-nomi-ink-80", children: r("libraries.skill.missingModels", {
          providers: d.map(i).join(r("assetLibrary.listSeparator"))
        }) }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              hn(), c(!1);
            },
            className: "shrink-0 rounded-full bg-nomi-ink px-2.5 py-1 text-micro text-nomi-paper hover:bg-nomi-accent transition-colors duration-[var(--nomi-transition-fast)]",
            children: r("libraries.skill.connect")
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "my-1 border-t border-nomi-line-soft" }),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            n({ key: pn, name: r("libraries.skill.authorName") }), c(!1);
          },
          className: "flex w-full items-center gap-2 rounded-nomi-sm px-2.5 py-2 text-left text-nomi-accent hover:bg-nomi-accent-soft transition-colors duration-[var(--nomi-transition-fast)]",
          children: [
            /* @__PURE__ */ e.jsx(Le, { size: 16, stroke: 1.5, className: "shrink-0" }),
            /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ e.jsx("span", { className: "block font-medium", children: r("libraries.skill.authorAction") }),
              /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: r("libraries.skill.authorDescription") })
            ] })
          ]
        }
      )
    ] }) })
  ] });
}
const bn = {
  key: "workbench.storyboard.planner",
  name: "故事板规划师"
};
function fn(o) {
  return o === "video" ? '本次拆的是**视频分镜**：每个 shot 的 shotKind 必须填 "video"，按方法论给时长（durationSec）、运镜与动作演进，modelKey 从可用清单里选视频模型。' : o === "image-video" ? [
    "本次拆的是**图片+视频分镜**：每个逻辑镜头只允许输出一个 shot，不要把首帧图另拆成一条 image shot。",
    '每个 shot 的 shotKind 必须填 "video"，durationSec 按视频镜头填写。',
    '每个 shot 必须填 keyframe: { enabled: true, prompt: "..." }；keyframe.prompt 写一张静态首帧图：构图/景别/光线/人物姿态与表情/环境，禁止写运镜、动作演进、转场、时长感、台词/字幕/声音。',
    "shot.prompt 写视频部分：从这张首帧继续发生的动作演进、运镜、节奏与时长感，不要复述锚的静态外貌。",
    "keyframe.modelKey 从可用模型清单里选图片模型；shot.modelKey 从可用模型清单里选视频模型。拿不准就留空，系统用默认模型兜底。",
    "anchorIds 只引用 anchors 里的 id，绝对不要引用 image-1、shot-1-keyframe 等系统派生 id；系统会自动创建首帧图并把它用 first_frame 连到视频。",
    'propose_storyboard_plan 的 shots 字段必须是**数组本体**，形如 shots: [{...}, {...}]；绝对不要写成字符串，禁止 shots: "[{...}]" 或任何转义 JSON 文本。'
  ].join(`
`) : [
    '本次拆的是**图片分镜**（不是视频分镜）：每个 shot 的 shotKind 必须填 "image"，durationSec 一律填 0。',
    "prompt 写**一张静态画面**——构图/景别/光线/人物姿态与表情/环境，**禁止**写运镜（推拉摇跟）、动作演进、转场、时长感、台词/字幕/声音。",
    "modelKey 从可用模型清单里选**图片模型**（不是视频模型）；清单里没有合适的图片模型就留空（系统用默认图片模型兜底）。"
  ].join(`
`);
}
function gn(o) {
  if (o.currentPlan && o.revisionRequest?.trim())
    return [
      "用户正在审阅你之前产出的分镜方案，现在要求你修改它。请基于下面的「当前方案」按用户要求改——",
      "**只改用户点名要改的部分，其余镜头/锚/已选模型/镜号一律原样保留**；改完通过 propose_storyboard_plan 重新产出**整份**方案（不是增量、不是片段）。",
      "",
      "--- 当前方案(JSON) ---",
      JSON.stringify(o.currentPlan),
      "--- 当前方案结束 ---",
      "",
      "--- 用户的修改要求 ---",
      o.revisionRequest.trim(),
      "--- 修改要求结束 ---"
    ].join(`
`);
  const t = (o.storyText || "").trim();
  return [
    "请把下面这段故事规划成一份「分镜方案」（跨镜头要一致的角色/场景/道具/风格 + 每个镜头），通过 propose_storyboard_plan 产出结构化方案对象——先给用户在创作区审阅、修改，不要直接写画布。",
    "",
    fn(o.shotMode ?? "image"),
    "",
    "结构化工具调用硬约束：propose_storyboard_plan 参数必须是对象本体，anchors/shots 必须是数组本体；不要把任何数组序列化成字符串。",
    "",
    "--- 故事正文 ---",
    t,
    "--- 故事正文结束 ---"
  ].join(`
`);
}
async function kn(o) {
  let t = !o.requiredTool;
  const n = await Zt({
    message: gn({
      storyText: o.storyText,
      currentPlan: o.currentPlan,
      revisionRequest: o.revisionRequest,
      ...o.shotMode ? { shotMode: o.shotMode } : {}
    }),
    snapshot: Ao.read_canvas(),
    selectedNodes: [],
    mode: "agent",
    skill: bn,
    ...o.agentPreference ? { agentPreference: o.agentPreference } : {},
    ...o.requiredTool ? { requiredTool: o.requiredTool } : {},
    onContent: (r, i) => o.onContent?.(i),
    ...o.onCancelReady ? { onCancelReady: o.onCancelReady } : {},
    onToolCall: (r) => {
      if (r.toolName === o.requiredTool && (t = !0), Qt(
        { kind: "tool-call", toolName: r.toolName, args: r.args },
        eo()
      ).outcome === "allow") {
        (async () => {
          try {
            const a = await tt(r.toolName, r.args);
            await r.confirm({ ok: !0, result: a, silent: !0 });
          } catch (a) {
            await r.confirm({ ok: !1, message: a instanceof Error ? a.message : String(a) });
          }
        })();
        return;
      }
      r.confirm({
        ok: !1,
        message: "现在是分镜规划阶段，请用 propose_storyboard_plan 产出方案给用户审阅，不要直接创建或修改画布节点。",
        denied: !0
      });
    }
  });
  if (!t)
    throw new Error("分镜师没有交付可审阅的分镜方案，系统已拦截“只说不做”，请重试当前步骤。");
  return { text: n.response.text?.trim() ?? "" };
}
function at(o) {
  const t = p.useRef(null);
  return p.useEffect(() => {
    const n = t.current;
    if (!n) return;
    let r = null;
    const i = () => {
      n.classList.add(o), r !== null && window.clearTimeout(r), r = window.setTimeout(() => {
        n.classList.remove(o), r = null;
      }, 820);
    };
    return n.addEventListener("scroll", i, { passive: !0 }), () => {
      n.removeEventListener("scroll", i), r !== null && window.clearTimeout(r);
    };
  }, [o]), t;
}
function yn() {
  const o = le.useRef(null), t = le.useRef(null), n = le.useCallback(() => {
    t.current = null;
    const a = o.current;
    o.current = null, a?.();
  }, []), r = le.useCallback(
    (a) => {
      o.current = a, t.current === null && (t.current = requestAnimationFrame(n));
    },
    [n]
  ), i = le.useCallback(() => {
    t.current !== null && (cancelAnimationFrame(t.current), t.current = null), o.current = null;
  }, []);
  return le.useEffect(
    () => () => {
      t.current !== null && cancelAnimationFrame(t.current);
    },
    []
  ), { push: r, cancel: i };
}
const vn = 60;
function jn({
  busy: o,
  onRun: t
}) {
  const { t: n } = P(), r = k((m) => m.workbenchDocument), i = k((m) => m.storyboardPlan), [a, u] = p.useState(!1), c = p.useMemo(() => ot(r), [r]);
  return !o && !i && !a && c.trim().length >= vn ? /* @__PURE__ */ e.jsx("div", { className: l("pt-1.5"), children: /* @__PURE__ */ e.jsx(
    rt,
    {
      kind: "storyboard",
      resolved: !1,
      lead: n("storyboardEditor.action.nudgeLead"),
      onRun: (m) => {
        u(!0), t(m);
      },
      onDismiss: () => u(!0)
    }
  ) }) : null;
}
function wn(o) {
  return o === "insert_at_cursor" ? "creationAi.writeTool.insert" : o === "replace_selection" ? "creationAi.writeTool.replace" : "creationAi.writeTool.append";
}
function Nn(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return "";
  const t = o, n = typeof t.text == "string" ? t.text.trim() : "";
  if (n) return n;
  const r = t.response;
  if (r && typeof r == "object" && !Array.isArray(r)) {
    const i = r.text;
    return typeof i == "string" ? i.trim() : "";
  }
  return "";
}
function Cn(o) {
  const t = o.trim();
  return t.length >= 120 && /(^|\n)\s*#\s*故事设定/m.test(t) && /(^|\n)\s*#\s*剧本/m.test(t);
}
function An({ onCollapse: o } = {}) {
  const { t } = P(), n = Se((s) => s.sending), r = Se((s) => s.pendingToolCalls), i = Se, { push: a, cancel: u } = yn(), [c, f] = p.useState(0), m = p.useRef(n);
  p.useEffect(() => {
    m.current && !n && f((s) => s + 1), m.current = n;
  }, [n]);
  const [j, C] = p.useState(!1), y = at("workbench-scrollbar-visible"), g = k((s) => s.workbenchDocument), d = k((s) => s.creationDocumentTools), S = k((s) => s.creationSelectionText), h = k((s) => s.creationAiModeId), E = k((s) => s.creationActiveSkill), U = k((s) => s.setCreationActiveSkill), M = k((s) => s.creationAiDraft), K = k((s) => s.creationAiMessages), x = to(K.map((s) => s.id), "creation"), { hasTextModel: I, refresh: R } = zt(), [F, $] = p.useState(() => /* @__PURE__ */ new Set()), [he, xe] = p.useState(() => /* @__PURE__ */ new Set()), b = k((s) => s.creationAiAttachments), Y = k((s) => s.creationAiError), Ne = k((s) => s.setCreationAiModeId), q = k((s) => s.setCreationAiDraft), D = k((s) => s.setCreationAiMessages), bt = k((s) => s.setCreationAiAttachments), O = k((s) => s.setCreationAiError), _e = k((s) => s.setWorkspaceMode), {
    isDragging: ft,
    openFilePicker: gt,
    inputRef: kt,
    onInputChange: yt,
    removeAttachment: vt,
    clearAttachments: be,
    handlePaste: jt,
    dragHandlers: wt
  } = oo({ setAttachments: bt, onError: O }), X = p.useRef(d);
  X.current = d;
  const ee = We(h), oe = p.useRef({ activeSkill: E, activeMode: ee });
  oe.current = { activeSkill: E, activeMode: ee };
  const ne = p.useMemo(() => ot(g), [g]), fe = p.useCallback((s, w) => {
    i.getState().resolvePendingToolCall(s, w);
  }, [i]), Nt = p.useCallback((s) => {
    const w = X.current;
    if (!w) {
      fe(s.toolCallId, { ok: !1, message: "editor_not_ready" });
      return;
    }
    s.toolName === "insert_at_cursor" ? w.insertAtCursor(s.content) : s.toolName === "replace_selection" ? w.replaceSelection(s.content) : w.appendToEnd(s.content), fe(s.toolCallId, { ok: !0, result: { applied: !0 } });
  }, [fe]), Ct = p.useCallback((s) => s === "insert_at_cursor" ? /* @__PURE__ */ e.jsx(Yo, { size: 13 }) : s === "replace_selection" ? /* @__PURE__ */ e.jsx(en, { size: 13 }) : /* @__PURE__ */ e.jsx(Zo, { size: 13 }), []), re = p.useCallback((s = t("creationAi.storyboardCommand"), w, N = "image", V) => {
    const Z = k.getState(), Ce = Z.storyboardPlan, Q = !!(Ce && !Z.storyboardPlanCommitted && w?.trim()), ge = (S || ne).trim(), se = ge ? "" : un(s);
    se && X.current?.appendToEnd(se);
    const me = ge || se;
    if (!Q && !me) {
      O(t("creationAi.writeStoryFirst"));
      return;
    }
    const Ae = i.getState().nextMessageId("user"), J = i.getState().nextMessageId("assistant");
    D((G) => [
      ...G,
      { id: Ae, role: "user", content: s },
      { id: J, role: "assistant", content: t(Q ? "creationAi.revisingPlan" : "creationAi.planningStoryboard"), status: "pending" }
    ]), q(""), O("");
    const B = i.getState().begin();
    (async () => {
      try {
        const { text: G } = await kn({
          // 首拆带分镜模式（图片/视频，动作卡上选，默认图片）；改方案不带——保留现方案每镜已定的 shotKind。
          ...Q ? { currentPlan: Ce, revisionRequest: w } : { storyText: me, shotMode: N },
          onContent: (A) => {
            B.isCurrent() && a(
              () => D((_) => _.map((L) => L.id === J ? { ...L, content: A || t("creationAi.planningShort"), status: "streaming" } : L))
            );
          },
          onCancelReady: (A) => i.getState().attachCancel(B.id, A),
          ...V ? {
            agentPreference: { vendorKey: "platform-employee", modelKey: V },
            requiredTool: "propose_storyboard_plan"
          } : {}
        });
        if (!B.isCurrent()) return;
        D(
          (A) => A.map(
            (_) => _.id === J ? { ..._, content: G || t(Q ? "creationAi.revisionComplete" : "creationAi.planComplete"), status: "done" } : _
          )
        );
      } catch (G) {
        if (!B.isCurrent()) return;
        D(
          (A) => A.map(
            (_) => _.id === J ? { ..._, content: t("creationAi.planFailed", { message: G instanceof Error && G.message ? G.message : t("creationAi.unknownError") }), status: "error" } : _
          )
        );
      } finally {
        u(), i.getState().finish(B.id);
      }
    })();
  }, [u, ne, a, S, q, O, D, i, t]), Pe = p.useCallback((s = t("creationAi.fixationCommand")) => {
    const w = (S || ne).trim();
    if (!w) {
      O(t("creationAi.writeScriptFirst"));
      return;
    }
    D((N) => [
      ...N,
      { id: i.getState().nextMessageId("user"), role: "user", content: s },
      { id: i.getState().nextMessageId("assistant"), role: "assistant", content: t("creationAi.fixationStarted"), status: "done" }
    ]), q(""), O(""), _e("generation"), window.setTimeout(() => {
      no({ storyText: w, source: "creation-ai-panel" });
    }, 60);
  }, [ne, S, q, O, D, _e, i, t]), ie = p.useCallback(async (s, w = {}) => {
    if (i.getState().sending) return;
    const N = (s ?? M).trim(), V = w.modeId ? We(w.modeId) : ee;
    if (b.some((A) => A.status === "uploading")) {
      O(t("creationAi.attachmentsUploading"));
      return;
    }
    const Z = b.filter((A) => A.status === "ready" && A.url);
    if (!N && !S && !ne && !Z.length) return;
    if (k.getState().storyboardEditorOpen && N) {
      re(N, N);
      return;
    }
    const Q = w.guided || oe.current.activeSkill || V.id === "storyboard" ? null : mn(N);
    if (Q) {
      const A = i.getState().nextMessageId("user"), _ = i.getState().nextMessageId("assistant");
      D((L) => [
        ...L,
        { id: A, role: "user", content: N || t(Q === "storyboard" ? "creationAi.storyboardCommand" : "creationAi.fixationCommand") },
        { id: _, role: "assistant", content: "", status: "done", action: { kind: Q, prompt: N } }
      ]), q(""), O("");
      return;
    }
    const ge = Io({ mode: V, userRequest: N }), se = w.displayMessage || N || (Z.length ? t("creationAi.attachmentPrompt") : t("creationAi.processDocument", { mode: t(`creationAi.mode.${V.id}.label`) })), me = Z.map((A) => ({
      url: A.url,
      contentType: A.contentType,
      fileName: A.fileName,
      kind: A.kind
    })), Ae = {
      id: i.getState().nextMessageId("user"),
      role: "user",
      content: se,
      ...Z.length ? { attachments: Z } : {}
    }, J = i.getState().nextMessageId("assistant");
    D((A) => [...A, Ae, { id: J, role: "assistant", content: "", status: "pending" }]), q(""), be(), O("");
    const B = i.getState().begin();
    let G = !1;
    try {
      const A = await Kt({
        prompt: ge,
        displayPrompt: se,
        ...me.length ? { attachments: me } : {},
        sessionKey: ze("creation"),
        projectId: Ot("projectId"),
        // 手动锁定的 active skill 优先（如「品牌宣传片」playbook）；否则回退创作模式推导。
        skillKey: !w.modeId && oe.current.activeSkill ? oe.current.activeSkill.key : `workbench.creation.${V.id}`,
        skillName: !w.modeId && oe.current.activeSkill ? oe.current.activeSkill.name : t(`creationAi.mode.${V.id}.title`),
        ...w.employeeKey ? {
          agentPreference: { vendorKey: "platform-employee", modelKey: w.employeeKey }
        } : {},
        ...w.requiredTool ? { requiredTool: w.requiredTool } : {},
        onContent: (v, T) => {
          B.isCurrent() && a(
            () => D((z) => z.map((H) => H.id === J ? { ...H, content: T, status: "streaming" } : H))
          );
        },
        onCancelReady: (v) => i.getState().attachCancel(B.id, v),
        onToolCall: (v) => {
          if (!B.isCurrent()) {
            v.confirm({ ok: !1, message: "creation turn abandoned" });
            return;
          }
          if (v.toolName === "read_full_text") {
            v.confirm({ ok: !0, result: { text: X.current?.readFullText() ?? "" } });
            return;
          }
          if (v.toolName === "read_selection") {
            v.confirm({ ok: !0, result: { text: X.current?.readSelectionText() ?? "" } });
            return;
          }
          if (v.toolName === "author_skill") {
            const T = v.args && typeof v.args == "object" ? v.args : {}, z = T.manifest, H = typeof T.dirName == "string" && T.dirName.trim() ? T.dirName : "imported-skill", ue = typeof T.skillMarkdown == "string" ? T.skillMarkdown : "", Et = {
              version: "nomi-skill-v1",
              exportedAt: Date.now(),
              dirName: H,
              files: { "SKILL.md": ue, "skill.json": JSON.stringify(z ?? {}, null, 2) }
            }, It = z && typeof z == "object" && Array.isArray(z.requiredProviders) ? z.requiredProviders : [];
            (async () => {
              const ae = await Co(Et);
              if (!ae.ok) {
                await v.confirm({ ok: !1, message: ae.error ?? t("creationAi.skillSaveFailed") });
                return;
              }
              try {
                const Tt = await et(), Re = Ie({ neededProviders: It }, Tt);
                await v.confirm({ ok: !0, result: { saved: !0, skillName: ae.skillName, dirName: ae.dirName, missingProviders: Re.missing, satisfied: Re.satisfied } });
              } catch {
                await v.confirm({ ok: !0, result: { saved: !0, skillName: ae.skillName, dirName: ae.dirName } });
              }
            })();
            return;
          }
          if (Dt(v.toolName)) {
            if (!To(V)) {
              v.confirm({ ok: !1, message: "chat-only mode does not write to the document" });
              return;
            }
            const T = v.args && typeof v.args == "object" ? v.args : {}, z = typeof T.content == "string" ? T.content : typeof T.text == "string" ? T.text : "";
            if (w.autoApproveWrites) {
              const H = X.current;
              if (!H || !z.trim()) {
                v.confirm({ ok: !1, message: "editor_not_ready" });
                return;
              }
              v.toolName === "insert_at_cursor" ? H.insertAtCursor(z) : v.toolName === "replace_selection" ? H.replaceSelection(z) : H.appendToEnd(z), G = !0, v.confirm({ ok: !0, result: { applied: !0, guided: !0 } });
              return;
            }
            i.getState().addPendingToolCall({
              toolCallId: v.toolCallId,
              toolName: v.toolName,
              content: z,
              confirm: v.confirm
            });
            return;
          }
          v.confirm({ ok: !1, message: `unknown tool ${v.toolName}` });
        }
      });
      if (!B.isCurrent()) return;
      const _ = !!A.raw?.cancelled, L = Nn(A);
      if (!_ && w.requiredTool === "append_to_end" && !G) {
        if (!Cn(L) || !X.current)
          throw new Error("编剧只回复了说明，没有交付可写入的完整剧本；系统已拦截这次假完成，请重新点击“生成剧本”。");
        X.current.appendToEnd(L), G = !0;
      }
      if (_)
        D((v) => v.map((T) => T.id === J ? { ...T, content: L || t("creationAi.stopped"), status: "cancelled" } : T));
      else {
        const v = L || t("creationAi.emptyResponse"), z = A.finishReason === "length" && L.trim() !== "" ? t("creationAi.truncated", { text: v }) : v;
        D((H) => H.map((ue) => ue.id === J ? { ...ue, content: z, status: "done" } : ue));
      }
    } catch (A) {
      if (!B.isCurrent()) return;
      const _ = A instanceof Error ? A.message : t("creationAi.callFailed");
      D((L) => L.map((v) => v.id === J ? { ...v, content: `${t("creationAi.errorPrefix")}${_}`, status: "error" } : v));
    } finally {
      u(), i.getState().finish(B.id);
    }
  }, [ee, E, b, u, be, ne, M, re, Pe, a, S, q, O, D, i, t]);
  p.useEffect(() => {
    const s = (N) => {
      if (N) {
        if (N.action === "storyboard") {
          Ke({ vendorKey: "platform-employee", modelKey: N.employeeKey }), re(N.displayMessage, void 0, N.shotMode, N.employeeKey);
          return;
        }
        Ke({ vendorKey: "platform-employee", modelKey: N.employeeKey }), Ne(N.modeId), ie(N.prompt, {
          modeId: N.modeId,
          displayMessage: N.displayMessage,
          autoApproveWrites: N.autoApproveWrites,
          guided: !0,
          employeeKey: N.employeeKey,
          requiredTool: N.requiredTool
        });
      }
    }, w = (N) => {
      Be(), s(N.detail);
    };
    return window.addEventListener(Fe, w), s(Be()), () => window.removeEventListener(Fe, w);
  }, [re, ie, Ne]);
  const At = p.useMemo(() => [
    t("creationAi.suggestion.opening"),
    t("creationAi.suggestion.visual"),
    t("creationAi.suggestion.storyboard")
  ], [t]), St = p.useCallback(() => {
    i.getState().abandon(), Lt("creation"), q(""), be(), O(""), Wt(ze("creation"));
  }, [be, q, O, i]), Me = /* @__PURE__ */ e.jsxs(
    "aside",
    {
      className: l(
        "workbench-creation-ai",
        "relative grid grid-cols-[minmax(0,1fr)] grid-rows-[44px_auto_minmax(0,1fr)_auto_auto]",
        '[grid-template-areas:"header"_"tools"_"messages"_"error"_"composer"]',
        "min-w-0 min-h-0 overflow-hidden",
        j && "h-[86vh] w-[min(760px,92vw)] rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg"
      ),
      "aria-label": t("creationAi.panelAria"),
      ...wt,
      children: [
        ft ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: l(
              "absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none",
              "rounded-nomi border-2 border-dashed border-nomi-accent bg-nomi-accent-soft",
              "text-body-sm font-semibold text-nomi-accent"
            ),
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ e.jsx(De, { size: 26, stroke: 1.5 }),
              /* @__PURE__ */ e.jsx("div", { children: t("creationAi.dropAttachments") }),
              /* @__PURE__ */ e.jsx("div", { className: l("text-micro font-normal text-nomi-ink-60"), children: t("creationAi.attachmentLimits") })
            ]
          }
        ) : null,
        /* @__PURE__ */ e.jsxs(
          "header",
          {
            className: l(
              "workbench-creation-ai__header",
              "[grid-area:header] flex items-center justify-between gap-[10px] min-w-0"
            ),
            children: [
              /* @__PURE__ */ e.jsxs("div", { className: l("workbench-creation-ai__title", "inline-flex items-center gap-2 min-w-0"), children: [
                /* @__PURE__ */ e.jsx(Ft, { size: 18 }),
                /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-semibold text-nomi-ink"), children: t("creationAi.title") })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: l("inline-flex items-center gap-2 ml-auto min-w-0"), children: [
                /* @__PURE__ */ e.jsx(xn, { activeSkill: E, autoLabel: t(`creationAi.mode.${ee.id}.title`), onSelect: U }),
                /* @__PURE__ */ e.jsx(
                  ro,
                  {
                    area: "creation",
                    className: l("inline-flex items-center flex-nowrap gap-1"),
                    actionClassName: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    onNewConversation: St
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  pe,
                  {
                    className: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    label: t(j ? "creationAi.shrink" : "creationAi.expandConversation"),
                    "aria-label": t(j ? "creationAi.shrinkAria" : "creationAi.expandAria"),
                    onClick: () => C((s) => !s),
                    icon: j ? /* @__PURE__ */ e.jsx(fo, { size: 15 }) : /* @__PURE__ */ e.jsx(go, { size: 15 })
                  }
                ),
                o ? /* @__PURE__ */ e.jsx(
                  pe,
                  {
                    className: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    label: t("creationAi.collapse"),
                    "aria-label": t("creationAi.collapseAria"),
                    onClick: o,
                    icon: /* @__PURE__ */ e.jsx(ye, { size: 15 })
                  }
                ) : null
              ] })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: l("[grid-area:tools] min-w-0"), children: [
          /* @__PURE__ */ e.jsx(io, { refreshKey: c }),
          /* @__PURE__ */ e.jsx(jn, { busy: n, onRun: (s) => re(t("creationAi.storyboardCommand"), void 0, s) })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            ref: y,
            className: l(
              "workbench-creation-ai__messages",
              "[grid-area:messages] min-h-0 overflow-auto",
              "flex flex-col gap-3"
            ),
            "aria-live": "polite",
            children: [
              K.length === 0 && r.length === 0 ? /* @__PURE__ */ e.jsxs("div", { className: l(
                "flex h-full flex-col items-center justify-center gap-2",
                "max-w-[240px] mx-auto py-6 px-3 text-center"
              ), children: [
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink font-nomi-display text-title font-medium"), children: t("creationAi.inspirationTitle") }),
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink-60 text-body-sm leading-relaxed"), children: t("creationAi.inspirationDescription") }),
                /* @__PURE__ */ e.jsx("div", { className: l("flex flex-col gap-1.5 w-full mt-2"), children: At.map((s) => /* @__PURE__ */ e.jsxs(
                  W,
                  {
                    className: l(
                      "w-full min-h-9 py-2 px-3 border border-transparent rounded-nomi",
                      "flex items-center justify-between gap-2 text-left font-normal",
                      "bg-nomi-ink-05 text-nomi-ink-80 cursor-pointer",
                      "hover:border-nomi-line hover:bg-nomi-paper hover:text-nomi-ink"
                    ),
                    onClick: () => {
                      ie(s);
                    },
                    children: [
                      /* @__PURE__ */ e.jsx("span", { className: l("min-w-0"), children: s }),
                      /* @__PURE__ */ e.jsx(so, { size: 13, className: l("shrink-0 text-nomi-ink-40") })
                    ]
                  },
                  s
                )) })
              ] }) : K.map((s) => /* @__PURE__ */ e.jsxs(p.Fragment, { children: [
                s.role === "user" ? /* @__PURE__ */ e.jsx(ao, { content: s.content, attachments: s.attachments }) : s.action ? /* @__PURE__ */ e.jsx(
                  rt,
                  {
                    kind: s.action.kind,
                    resolved: he.has(s.id),
                    onRun: (w) => {
                      if (he.has(s.id)) return;
                      xe((V) => new Set(V).add(s.id));
                      const N = s.action.prompt;
                      s.action.kind === "storyboard" ? re(N || t("creationAi.storyboardCommand"), void 0, w) : Pe(N || t("creationAi.fixationCommand"));
                    }
                  }
                ) : s.status === "error" && (I === !1 || F.has(s.id)) ? /* @__PURE__ */ e.jsx(
                  rn,
                  {
                    onResolved: () => {
                      $((w) => new Set(w).add(s.id)), R();
                    }
                  }
                ) : s.status === "error" || s.content.startsWith(t("creationAi.errorPrefix")) ? (
                  // 缺大脑(上一分支)外的一般错误 → 红色错误卡(人话+重试/去模型接入),与生成侧同一张卡。
                  /* @__PURE__ */ e.jsx(
                    lo,
                    {
                      error: s.content,
                      onRetry: () => {
                        const w = [...K].reverse().find((N) => N.role === "user");
                        w && ie(w.content);
                      }
                    }
                  )
                ) : /* @__PURE__ */ e.jsx(
                  co,
                  {
                    content: s.status === "pending" ? "" : s.content,
                    attachments: s.attachments,
                    streaming: s.status === "pending" || s.status === "streaming",
                    pendingLabel: s.status === "pending" ? s.content : void 0,
                    cancelled: s.status === "cancelled"
                  }
                ),
                s.id === x ? /* @__PURE__ */ e.jsx(mo, {}) : null
              ] }, s.id)),
              r.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: l("workbench-creation-ai__tool-calls", "flex flex-col gap-2 p-[10px_11px]"), children: r.map((s) => /* @__PURE__ */ e.jsxs(
                "div",
                {
                  className: l(
                    "workbench-creation-ai__tool-call",
                    "flex flex-col gap-2 p-3 rounded-nomi border border-nomi-accent-soft bg-nomi-accent-soft/40"
                  ),
                  "data-tool-call-id": s.toolCallId,
                  children: [
                    /* @__PURE__ */ e.jsxs("div", { className: l("workbench-creation-ai__tool-call-head", "inline-flex items-center gap-[6px] text-nomi-accent text-caption font-medium"), children: [
                      Ct(s.toolName),
                      t(wn(s.toolName))
                    ] }),
                    /* @__PURE__ */ e.jsx("div", { className: l("workbench-creation-ai__tool-call-body", "max-h-[160px] overflow-auto text-nomi-ink text-body-sm leading-[1.5] whitespace-pre-wrap"), children: s.content || t("creationAi.emptyContent") }),
                    /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center justify-end gap-2 mt-1"), children: [
                      /* @__PURE__ */ e.jsx(
                        W,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-nomi-ink-80 text-caption cursor-pointer hover:bg-nomi-ink-05"),
                          onClick: () => fe(s.toolCallId, { ok: !1, message: "rejected by user" }),
                          children: t("creationAi.reject")
                        }
                      ),
                      /* @__PURE__ */ e.jsx(
                        W,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border-0 bg-nomi-ink text-nomi-paper text-caption cursor-pointer hover:bg-nomi-accent disabled:cursor-not-allowed disabled:opacity-45"),
                          "data-primary": "true",
                          disabled: !d,
                          onClick: () => Nt(s),
                          children: t("creationAi.apply")
                        }
                      )
                    ] })
                  ]
                },
                s.toolCallId
              )) }) : null,
              /* @__PURE__ */ e.jsx(sn, {})
            ]
          }
        ),
        Y ? /* @__PURE__ */ e.jsx(
          "div",
          {
            className: l(
              "workbench-creation-ai__error",
              "[grid-area:error] py-2 px-3 min-w-0",
              "border-t border-[color-mix(in_srgb,var(--workbench-danger)_16%,transparent)]",
              "bg-workbench-danger-soft text-workbench-danger",
              "text-caption leading-[1.45]"
            ),
            children: Y
          }
        ) : null,
        /* @__PURE__ */ e.jsxs("footer", { className: l("workbench-creation-ai__composer", "[grid-area:composer] min-w-0"), children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              ref: kt,
              type: "file",
              multiple: !0,
              accept: uo,
              className: "hidden",
              "aria-hidden": "true",
              tabIndex: -1,
              onChange: yt
            }
          ),
          /* @__PURE__ */ e.jsx(po, { attachments: b, onRemove: vt, className: l("mb-2") }),
          /* @__PURE__ */ e.jsx(
            je,
            {
              className: l(
                // 与画布助手输入框同一套 Tailwind（不再走 workbench-ai.css 的 !important 覆写）。
                "min-h-14 px-2 py-2 rounded-nomi",
                "border border-nomi-line focus:border-nomi-accent",
                "bg-nomi-paper text-nomi-ink text-body-sm leading-[1.45]",
                "placeholder:text-nomi-ink-40"
              ),
              value: M,
              placeholder: t("creationAi.placeholder"),
              "aria-label": t("creationAi.inputAria"),
              "data-tour": "storyboard-cta",
              onChange: (s) => q(s.currentTarget.value),
              onKeyDown: (s) => ho(s, () => {
                ie();
              }),
              onPaste: jt
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: l("workbench-creation-ai__actions", "flex items-center justify-between"), children: [
            /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-1.5 flex-1 min-w-0"), children: [
              /* @__PURE__ */ e.jsx(
                pe,
                {
                  className: l(
                    "size-7 grid place-items-center shrink-0",
                    "border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                    "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                  ),
                  label: t("creationAi.addAttachment"),
                  "aria-label": t("creationAi.addAttachmentAria"),
                  onClick: gt,
                  icon: /* @__PURE__ */ e.jsx(De, { size: 16 })
                }
              ),
              /* @__PURE__ */ e.jsx(
                te,
                {
                  ariaLabel: t("creationAi.modeAria"),
                  leadingLabel: t("creationAi.modeLeading"),
                  size: "sm",
                  title: t(`creationAi.mode.${ee.id}.description`),
                  value: ee.id,
                  options: _o.map((s) => ({ value: s.id, label: t(`creationAi.mode.${s.id}.short`) })),
                  onChange: (s) => Ne(s)
                }
              ),
              /* @__PURE__ */ e.jsx(xo, {})
            ] }),
            n ? /* @__PURE__ */ e.jsx(
              pe,
              {
                className: l(
                  "size-7 grid place-items-center shrink-0",
                  "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                  "hover:enabled:bg-nomi-accent"
                ),
                label: t("creationAi.stop"),
                "aria-label": t("creationAi.stopAria"),
                onClick: () => i.getState().requestUserCancel(),
                icon: /* @__PURE__ */ e.jsx(yo, { size: 13 })
              }
            ) : /* @__PURE__ */ e.jsx(
              pe,
              {
                className: l(
                  "size-7 grid place-items-center shrink-0",
                  "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                  "hover:enabled:bg-nomi-accent",
                  "disabled:bg-nomi-ink-20 disabled:text-nomi-ink-40 disabled:cursor-not-allowed"
                ),
                label: t("creationAi.send"),
                "aria-label": t("creationAi.sendAria"),
                disabled: !M.trim(),
                onClick: () => {
                  ie();
                },
                icon: /* @__PURE__ */ e.jsx(bo, { size: 15 })
              }
            )
          ] })
        ] })
      ]
    }
  );
  return !j || typeof document > "u" ? Me : Bt.createPortal(
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: l("workbench-shell", "fixed inset-0 z-[200] grid place-items-center bg-[var(--workbench-backdrop)] p-4"),
        onClick: (s) => {
          s.target === s.currentTarget && C(!1);
        },
        children: Me
      }
    ),
    document.body
  );
}
function Sn(o) {
  const t = typeof o.selectedText == "string" ? o.selectedText.trim() : "";
  if (!t) return !1;
  const n = Ht.t(
    o.kind === "image" ? "runtime.nodeRegistry.image.title" : "runtime.nodeRegistry.video.title"
  );
  return o.addGenerationNode({
    kind: o.kind,
    title: n,
    prompt: t,
    position: o.position
  }), o.setWorkspaceMode("generation"), !0;
}
const Ve = 210, Ge = 40, Ue = 10;
function En(o, t) {
  if (!t) return null;
  const { from: n, to: r, empty: i } = o.state.selection;
  if (i || n === r) return null;
  const a = o.view.coordsAtPos(n), u = o.view.coordsAtPos(r), c = t.getBoundingClientRect(), f = Math.min(a.left, u.left), m = Math.max(a.right, u.right), j = Math.min(a.top, u.top), C = Math.max(a.bottom, u.bottom), y = f + (m - f) / 2 - c.left - Ve / 2, g = Math.max(12, Math.min(y, Math.max(12, c.width - Ve - 12))), d = j - c.top - Ge - Ue;
  return d >= 8 ? { left: g, top: d, placement: "top" } : {
    left: g,
    top: Math.min(C - c.top + Ue, Math.max(8, c.height - Ge - 8)),
    placement: "bottom"
  };
}
function In({
  editor: o,
  selectedText: t,
  selectionVersion: n,
  onCreated: r
}) {
  const { t: i } = P(), a = t.trim(), u = p.useRef(null), [c, f] = p.useState(null), m = Ye((d) => d.addNode), j = k((d) => d.setWorkspaceMode), C = p.useCallback(() => {
    if (!o || !a) {
      f(null);
      return;
    }
    const d = u.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor");
    f(En(o, d));
  }, [o, a]);
  if (p.useLayoutEffect(() => {
    C();
  }, [n, C]), p.useEffect(() => {
    if (!o || !a) return;
    const S = (u.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor"))?.querySelector(".workbench-editor__scroll"), h = () => window.requestAnimationFrame(C), E = () => {
      h();
    }, U = () => {
      h();
    };
    return S?.addEventListener("scroll", E, { passive: !0 }), window.addEventListener("resize", U), () => {
      S?.removeEventListener("scroll", E), window.removeEventListener("resize", U);
    };
  }, [o, a, C]), !a || !o || !c) return null;
  const y = (d) => {
    Sn({ selectedText: a, kind: d, addGenerationNode: m, setWorkspaceMode: j }) && r?.();
  }, g = [
    {
      id: "bold",
      label: i("creationAi.selection.bold"),
      icon: /* @__PURE__ */ e.jsx(Mo, { size: 14 }),
      active: o.isActive("bold"),
      onClick: () => o.chain().focus().toggleBold().run()
    },
    {
      id: "italic",
      label: i("creationAi.selection.italic"),
      icon: /* @__PURE__ */ e.jsx(Ro, { size: 14 }),
      active: o.isActive("italic"),
      onClick: () => o.chain().focus().toggleItalic().run()
    },
    {
      id: "h1",
      label: i("creationAi.selection.heading1"),
      icon: /* @__PURE__ */ e.jsx(zo, { size: 15 }),
      active: o.isActive("heading", { level: 1 }),
      onClick: () => o.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      id: "h2",
      label: i("creationAi.selection.heading2"),
      icon: /* @__PURE__ */ e.jsx(Ko, { size: 15 }),
      active: o.isActive("heading", { level: 2 }),
      onClick: () => o.chain().focus().toggleHeading({ level: 2 }).run()
    }
  ];
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      ref: u,
      className: l(
        "workbench-selection-popover",
        "absolute z-20 inline-flex items-center",
        "w-[210px] h-[40px] gap-[5px] p-1 pr-[5px]",
        "border border-workbench-border rounded-nomi-lg",
        "bg-workbench-overlay shadow-workbench-pop",
        "backdrop-blur-[18px] backdrop-saturate-[1.06]",
        "origin-[50%_100%]"
      ),
      role: "toolbar",
      "aria-label": i("creationAi.selection.toolbar"),
      "data-placement": c.placement,
      style: { left: c.left, top: c.top },
      children: [
        /* @__PURE__ */ e.jsx(
          "div",
          {
            className: l("workbench-selection-popover__format-group", "inline-flex items-center gap-[3px] shrink-0"),
            "aria-label": i("creationAi.selection.formatting"),
            children: g.map((d) => /* @__PURE__ */ e.jsx(
              ke,
              {
                className: l(
                  "workbench-selection-popover__tool",
                  "h-[30px] w-[28px] inline-flex items-center justify-center",
                  "border border-transparent rounded-workbench-control",
                  "bg-transparent text-workbench-muted",
                  "cursor-pointer",
                  "hover:border-[color-mix(in_srgb,var(--workbench-accent)_14%,transparent)]",
                  "hover:bg-workbench-accent-soft hover:text-workbench-accent"
                ),
                label: d.label,
                "data-active": d.active ? "true" : "false",
                onMouseDown: (S) => S.preventDefault(),
                onClick: d.onClick,
                icon: d.icon
              },
              d.id
            ))
          }
        ),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            className: l(
              "workbench-selection-popover__divider",
              "self-stretch w-px mx-[2px] my-[3px] bg-workbench-border-soft"
            )
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: l("workbench-selection-popover__generate-group", "inline-flex items-center gap-[3px] shrink-0"),
            "aria-label": i("creationAi.selection.generate"),
            children: [
              /* @__PURE__ */ e.jsx(
                ke,
                {
                  className: l(
                    "workbench-selection-popover__tool workbench-selection-popover__tool--generate",
                    "h-[30px] w-[30px] inline-flex items-center justify-center",
                    "border border-workbench-border-soft rounded-workbench-control",
                    "bg-workbench-surface text-workbench-ink",
                    "cursor-pointer",
                    "hover:border-[color-mix(in_srgb,var(--workbench-accent)_18%,transparent)]",
                    "hover:bg-workbench-accent-soft hover:text-workbench-accent"
                  ),
                  label: i("creationAi.selection.image"),
                  onMouseDown: (d) => d.preventDefault(),
                  onClick: () => y("image"),
                  icon: /* @__PURE__ */ e.jsx(Te, { size: 14 })
                }
              ),
              /* @__PURE__ */ e.jsx(
                ke,
                {
                  className: l(
                    "workbench-selection-popover__tool workbench-selection-popover__tool--generate",
                    "h-[30px] w-[30px] inline-flex items-center justify-center",
                    "border border-workbench-border-soft rounded-workbench-control",
                    "bg-workbench-surface text-workbench-ink",
                    "cursor-pointer",
                    "hover:border-[color-mix(in_srgb,var(--workbench-accent)_18%,transparent)]",
                    "hover:bg-workbench-accent-soft hover:text-workbench-accent"
                  ),
                  label: i("creationAi.selection.video"),
                  onMouseDown: (d) => d.preventDefault(),
                  onClick: () => y("video"),
                  icon: /* @__PURE__ */ e.jsx(Lo, { size: 14 })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const Tn = [
  ["bold", "italic"],
  ["h1", "h2"],
  ["bullet-list", "ordered-list", "blockquote"]
], _n = ["undo", "redo"];
function $e({ action: o }) {
  return /* @__PURE__ */ e.jsx(
    ke,
    {
      className: l(
        "workbench-editor-toolbar__button",
        "w-[30px] h-[30px] inline-grid place-items-center",
        "border border-transparent rounded-nomi-sm",
        "bg-transparent text-workbench-muted cursor-pointer",
        "hover:bg-workbench-hover",
        "disabled:cursor-not-allowed disabled:opacity-[0.38]"
      ),
      label: o.label,
      "data-active": o.active ? "true" : "false",
      disabled: o.disabled,
      onMouseDown: (t) => t.preventDefault(),
      onClick: o.onClick,
      icon: o.icon
    }
  );
}
function Pn() {
  return /* @__PURE__ */ e.jsx("div", { className: "w-px h-[18px] bg-workbench-border mx-1", "aria-hidden": "true" });
}
function Mn({ editor: o }) {
  const { t } = P(), n = Oo(o);
  if (n.length === 0)
    return /* @__PURE__ */ e.jsx(
      "div",
      {
        className: l(
          "workbench-editor-toolbar",
          "h-[44px] flex items-center gap-1 px-3",
          "border-b border-workbench-border-soft bg-workbench-surface"
        ),
        "aria-label": t("creationAi.editor.toolbarAria")
      }
    );
  const r = new Map(n.map((c) => [c.id, c])), i = (c) => c.map((f) => r.get(f)).filter((f) => !!f), a = Tn.map(i).filter((c) => c.length > 0), u = i(_n);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: l(
        "workbench-editor-toolbar",
        "h-[44px] flex items-center gap-1 px-3",
        "border-b border-workbench-border-soft bg-workbench-surface"
      ),
      "aria-label": t("creationAi.editor.toolbarAria"),
      children: [
        a.map((c, f) => /* @__PURE__ */ e.jsxs(p.Fragment, { children: [
          f > 0 ? /* @__PURE__ */ e.jsx(Pn, {}) : null,
          c.map((m) => /* @__PURE__ */ e.jsx($e, { action: m }, m.id))
        ] }, c[0]?.id ?? f)),
        /* @__PURE__ */ e.jsx("div", { className: "flex-1", "aria-hidden": "true" }),
        u.map((c) => /* @__PURE__ */ e.jsx($e, { action: c }, c.id))
      ]
    }
  );
}
function Rn() {
  const { t: o } = P(), t = k((h) => h.workbenchDocument), n = k((h) => h.setWorkbenchDocument), r = k((h) => h.setCreationDocumentTools), i = k((h) => h.setCreationSelectionText), [a, u] = p.useState({ text: "", version: 0 }), c = at("workbench-scrollbar-visible"), f = p.useRef(t);
  p.useEffect(() => {
    f.current = t;
  }, [t]);
  const m = p.useMemo(
    () => Vt(t.contentJson),
    [t.contentJson]
  ), j = p.useCallback(
    (h) => {
      n({ ...f.current, contentJson: h, updatedAt: Date.now() });
    },
    [n]
  ), C = p.useCallback(
    (h) => {
      u((E) => !E.text && !h.trim() ? E : { text: h, version: E.version + 1 }), i(h);
    },
    [i]
  ), y = p.useCallback(() => {
    u((h) => ({ text: "", version: h.version + 1 })), i("");
  }, [i]), { editor: g, tools: d } = Do({
    content: m,
    placeholder: o("creationAi.editor.placeholder"),
    onChange: j,
    onSelectionChange: C
  }), S = p.useRef(null);
  return p.useEffect(() => {
    if (!g) return;
    const h = {
      readFullText: d.readFullText,
      readSelectionText: d.readSelectionText,
      insertAtCursor: d.insertAtCursor,
      replaceSelection: d.replaceSelection,
      appendToEnd: d.appendToEnd
    };
    return r(h), S.current = h, () => {
      S.current === h && (r(null), S.current = null);
    };
  }, [g, d, r]), /* @__PURE__ */ e.jsxs(
    "section",
    {
      className: l(
        "workbench-editor",
        "relative w-full h-full min-h-0",
        "grid grid-rows-[44px_minmax(0,1fr)]",
        "border border-workbench-border rounded-workbench",
        "bg-workbench-surface-solid shadow-workbench-md",
        "overflow-hidden"
      ),
      "aria-label": o("creationAi.editor.documentAria"),
      onKeyDown: (h) => h.stopPropagation(),
      onKeyUp: (h) => h.stopPropagation(),
      children: [
        /* @__PURE__ */ e.jsx(Mn, { editor: g }),
        /* @__PURE__ */ e.jsx(
          In,
          {
            editor: g,
            selectedText: a.text,
            selectionVersion: a.version,
            onCreated: y
          }
        ),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            ref: c,
            className: l(
              "workbench-editor__scroll",
              "min-w-0 min-h-0 overflow-auto",
              // Tiptap Placeholder 渲染：空文档第一段显示 data-placeholder（仿 PromptEditor，
              // 补上创作编辑器缺失的 ::before 规则——根因，不是只在这一处贴症状）。
              "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
              "[&_.is-editor-empty]:before:text-nomi-ink-40 [&_.is-editor-empty]:before:float-left",
              "[&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:h-0"
            ),
            children: /* @__PURE__ */ e.jsx(Po, { editor: g })
          }
        )
      ]
    }
  );
}
const zn = ["character", "scene", "prop", "style"], Kn = [4, 5, 6, 8, 10, 12, 15];
function lt(o) {
  return o === "style" ? "text" : "visual";
}
function ct(o) {
  return o === "style" ? "all" : "selective";
}
function Dn(o) {
  const t = new Set(o.anchors.map((r) => r.id));
  let n = o.anchors.length + 1;
  for (; t.has(`anchor-${n}`); ) n += 1;
  return `anchor-${n}`;
}
function On(o, t) {
  return { ...o, title: t };
}
function Ln(o, t = "character") {
  const n = {
    id: Dn(o),
    kind: t,
    name: "",
    description: "",
    carrier: lt(t),
    scope: ct(t)
  };
  return { ...o, anchors: [...o.anchors, n] };
}
function dt(o, t, n) {
  return { ...o, anchors: o.anchors.map((r) => r.id === t ? { ...r, ...n } : r) };
}
function Wn(o, t, n) {
  return dt(o, t, { kind: n, carrier: lt(n), scope: ct(n) });
}
function Fn(o, t) {
  return { ...o, anchors: o.anchors.filter((n) => n.id !== t) };
}
function mt(o) {
  return o.map((t, n) => t.index === n + 1 ? t : { ...t, index: n + 1 });
}
function Bn(o) {
  const t = o.shots[o.shots.length - 1]?.shotKind, n = o.shots[o.shots.length - 1]?.keyframe?.enabled === !0, r = {
    index: o.shots.length + 1,
    ...t ? { shotKind: t } : {},
    ...t === "video" && n ? { keyframe: { enabled: !0, prompt: "" } } : {},
    durationSec: t === "image" ? 0 : 5,
    anchorIds: [],
    prompt: ""
  };
  return { ...o, shots: [...o.shots, r] };
}
function ut(o, t, n) {
  return { ...o, shots: o.shots.map((r, i) => i === t ? { ...r, ...n } : r) };
}
function Hn(o, t) {
  return { ...o, shots: mt(o.shots.filter((n, r) => r !== t)) };
}
function Vn(o, t, n) {
  if (t === n || t < 0 || n < 0 || t >= o.shots.length || n >= o.shots.length) return o;
  const r = [...o.shots], [i] = r.splice(t, 1);
  return r.splice(n, 0, i), { ...o, shots: mt(r) };
}
function Gn(o, t, n) {
  const r = o.shots[t];
  if (!r) return o;
  const a = r.anchorIds.includes(n) ? r.anchorIds.filter((u) => u !== n) : [...r.anchorIds, n];
  return ut(o, t, { anchorIds: a });
}
function Un(o) {
  const t = [], n = new Set(o.anchors.map((r) => r.id));
  for (const r of o.anchors)
    r.carrier === "visual" && !r.name.trim() && t.push({ kind: "anchor-no-name", anchorId: r.id });
  o.shots.length === 0 && t.push({ kind: "no-shots" });
  for (const r of o.shots) {
    r.prompt.trim() || t.push({ kind: "empty-shot-prompt", shotIndex: r.index });
    for (const i of r.anchorIds)
      n.has(i) || t.push({ kind: "dangling-ref", shotIndex: r.index, anchorId: i });
  }
  return t;
}
function $n(o, t) {
  const n = new Set(o.anchors.map((r) => r.id));
  return t.anchorIds.filter((r) => !n.has(r));
}
const qe = {
  character: qo,
  scene: Te,
  prop: Ho,
  style: Uo
};
function qn({ anchor: o, onUpdate: t, onChangeKind: n, onRemove: r, nameInvalid: i }) {
  const { t: a } = P(), [u, c] = p.useState(() => !o.description.trim()), [f, m] = p.useState(!1), j = qe[o.kind], C = o.description.trim();
  return /* @__PURE__ */ e.jsxs("div", { className: "px-2.5 py-2", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.typeAria", { type: a(`storyboardEditor.anchor.kind.${o.kind}`) }),
          title: a("storyboardEditor.anchor.switchType"),
          onClick: () => m((y) => !y),
          className: "shrink-0 size-[22px] grid place-items-center rounded-nomi-sm bg-nomi-ink-05 text-nomi-ink-60 hover:bg-nomi-ink-10 hover:text-nomi-ink-80",
          children: /* @__PURE__ */ e.jsx(j, { size: 13, stroke: 1.6 })
        }
      ),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          value: o.name,
          onChange: (y) => t({ name: y.target.value }),
          placeholder: a("storyboardEditor.anchor.namePlaceholder"),
          "aria-label": a("storyboardEditor.anchor.nameAria"),
          className: l(
            "shrink-0 w-[124px] h-7 px-2 rounded-nomi-sm border bg-nomi-paper",
            "text-body-sm font-medium text-nomi-ink outline-none focus:border-nomi-accent",
            i ? "border-workbench-danger" : "border-transparent hover:border-nomi-line"
          )
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => c(!0),
          "aria-label": a("storyboardEditor.anchor.editDescription"),
          className: "flex-1 min-w-0 text-left text-caption text-nomi-ink-40 truncate hover:text-nomi-ink-60",
          children: C || a("storyboardEditor.anchor.addDescription")
        }
      ),
      /* @__PURE__ */ e.jsx(Jn, { value: o.carrier, onChange: (y) => t({ carrier: y }) }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.delete"),
          onClick: r,
          className: "shrink-0 size-7 grid place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
          children: /* @__PURE__ */ e.jsx(Xe, { size: 15, stroke: 1.6 })
        }
      )
    ] }),
    f ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-2 pl-[32px]", children: zn.map((y) => {
      const g = qe[y], d = y === o.kind;
      return /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            n(y), m(!1);
          },
          className: l(
            "h-6 px-2 rounded-full text-caption inline-flex items-center gap-1",
            d ? "bg-nomi-accent-soft text-nomi-accent" : "border border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
          ),
          children: [
            /* @__PURE__ */ e.jsx(g, { size: 12, stroke: 1.8 }),
            a(`storyboardEditor.anchor.kind.${y}`)
          ]
        },
        y
      );
    }) }) : null,
    u ? /* @__PURE__ */ e.jsxs("div", { className: "mt-1.5 pl-[32px]", children: [
      /* @__PURE__ */ e.jsx(
        je,
        {
          value: o.description,
          onChange: (y) => t({ description: y.target.value }),
          "aria-label": a("storyboardEditor.anchor.descriptionAria"),
          autoFocus: !C,
          placeholder: o.carrier === "visual" ? a("storyboardEditor.anchor.visualPlaceholder") : a("storyboardEditor.anchor.textPlaceholder"),
          className: "px-2 py-2 rounded-nomi-sm bg-nomi-paper border border-nomi-line text-body-sm text-nomi-ink-60 leading-normal focus:border-nomi-accent"
        }
      ),
      /* @__PURE__ */ e.jsx("div", { className: "flex justify-end mt-0.5", children: /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => c(!1),
          className: "text-micro text-nomi-ink-40 inline-flex items-center gap-1 hover:text-nomi-ink-60",
          children: [
            a("storyboardEditor.anchor.collapse"),
            /* @__PURE__ */ e.jsx(nt, { size: 12, stroke: 1.8 })
          ]
        }
      ) })
    ] }) : null
  ] });
}
function Jn({ value: o, onChange: t }) {
  const { t: n } = P(), r = o === "visual";
  return /* @__PURE__ */ e.jsxs(
    "button",
    {
      type: "button",
      onClick: () => t(r ? "text" : "visual"),
      title: n(r ? "storyboardEditor.anchor.switchToText" : "storyboardEditor.anchor.switchToVisual"),
      className: l(
        "shrink-0 h-6 px-2 rounded-full text-caption inline-flex items-center gap-1",
        r ? "bg-nomi-accent-soft text-nomi-accent" : "border border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80"
      ),
      children: [
        r ? /* @__PURE__ */ e.jsx(Vo, { size: 13, stroke: 1.7 }) : /* @__PURE__ */ e.jsx(Go, { size: 13, stroke: 1.7 }),
        n(r ? "storyboardEditor.anchor.visual" : "storyboardEditor.anchor.text")
      ]
    }
  );
}
function Yn(o) {
  const t = o.filter((a) => a.key !== "duration"), n = t.filter((a) => a.type === "select").slice(0, 2), r = new Set(n.map((a) => a.key)), i = t.filter((a) => !r.has(a.key));
  return { inline: n, drawer: i };
}
function pt(o, t) {
  if (!o) return null;
  const n = Gt({
    modelKey: o.modelKey || o.value,
    modelAlias: o.modelAlias,
    vendorKey: o.vendor,
    meta: o.meta
  });
  if (!n) return null;
  const r = n.modes, i = r.find((f) => f.id === t) ?? r.find((f) => f.id === n.defaultModeId) ?? r[0];
  if (!i) return null;
  const { inline: a, drawer: u } = Yn(i.params), c = u.length > 0 || r.length > 1;
  return { modes: r, mode: i, inline: a, drawer: u, hasDrawer: c };
}
function ht(o, t) {
  return { valueOf: (i) => {
    const a = o[i.key];
    return a != null ? String(a) : i.defaultValue !== void 0 ? String(i.defaultValue) : "";
  }, setParam: (i, a) => {
    const u = i.type === "number" ? Number(a) : i.type === "boolean" ? !!a : a;
    t({ params: { ...o, [i.key]: u } });
  } };
}
function xt({
  control: o,
  params: t,
  onUpdate: n
}) {
  const { valueOf: r, setParam: i } = ht(t, n);
  return /* @__PURE__ */ e.jsx(
    te,
    {
      ariaLabel: o.label,
      leadingLabel: o.label,
      size: "xs",
      value: r(o),
      options: o.options.map((a) => ({ value: String(a.value), label: a.label })),
      onChange: (a) => i(o, a)
    }
  );
}
function Xn({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  open: i,
  onToggleOpen: a
}) {
  const { t: u } = P(), c = pt(o, t);
  if (!c) return null;
  const { inline: f, hasDrawer: m } = c;
  return f.length === 0 && !m ? null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    f.map((j) => /* @__PURE__ */ e.jsx(xt, { control: j, params: n, onUpdate: r }, j.key)),
    m ? /* @__PURE__ */ e.jsxs(
      "button",
      {
        type: "button",
        onClick: a,
        "aria-expanded": i,
        className: l(
          "h-6 px-2.5 rounded-full border text-caption inline-flex items-center gap-1",
          i ? "border-nomi-accent text-nomi-ink-80 bg-nomi-ink-05" : "border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80"
        ),
        children: [
          /* @__PURE__ */ e.jsx($o, { size: 12, stroke: 1.8, "aria-hidden": !0 }),
          u("storyboardEditor.shotParams.parameters"),
          i ? /* @__PURE__ */ e.jsx(nt, { size: 12, stroke: 1.8, "aria-hidden": !0 }) : /* @__PURE__ */ e.jsx(Qe, { size: 12, stroke: 1.8, "aria-hidden": !0 })
        ]
      }
    ) : null
  ] });
}
function Zn({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  onApplyToAll: i
}) {
  const { t: a } = P(), { valueOf: u, setParam: c } = ht(n, r), f = pt(o, t);
  if (!f) return null;
  const { modes: m, mode: j, drawer: C, hasDrawer: y } = f;
  return y ? /* @__PURE__ */ e.jsxs("div", { className: "w-full mt-2 p-2.5 rounded-nomi-sm bg-nomi-ink-05 flex flex-col gap-2", children: [
    m.length > 1 ? /* @__PURE__ */ e.jsx(
      te,
      {
        ariaLabel: a("storyboardEditor.shotParams.mode"),
        leadingLabel: a("storyboardEditor.shotParams.mode"),
        size: "xs",
        value: j.id,
        options: m.map((g) => ({ value: g.id, label: g.vendorTerm || g.id })),
        onChange: (g) => r({ modeId: g })
      }
    ) : null,
    C.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: C.map((g) => g.type === "select" ? /* @__PURE__ */ e.jsx(xt, { control: g, params: n, onUpdate: r }, g.key) : g.type === "boolean" ? /* @__PURE__ */ e.jsxs("label", { className: "inline-flex items-center gap-1.5 text-caption text-nomi-ink-60", children: [
      /* @__PURE__ */ e.jsx(
        "input",
        {
          type: "checkbox",
          checked: u(g) === "true",
          onChange: (d) => c(g, d.target.checked)
        }
      ),
      g.label
    ] }, g.key) : /* @__PURE__ */ e.jsx(
      "textarea",
      {
        "aria-label": g.label,
        placeholder: g.placeholder || g.label,
        value: u(g),
        onChange: (d) => c(g, d.target.value),
        rows: 2,
        className: "basis-full w-full resize-y px-2 py-1.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-body-sm text-nomi-ink-80 focus:border-nomi-accent"
      },
      g.key
    )) }) : null,
    i ? /* @__PURE__ */ e.jsx(
      "button",
      {
        type: "button",
        onClick: i,
        className: "self-start text-caption text-nomi-accent hover:underline",
        children: a("storyboardEditor.shotParams.applyAll")
      }
    ) : null
  ] }) : null;
}
function Qn(o) {
  const { t } = P(), { shot: n, anchors: r, modelOptions: i, danglingIds: a, onUpdate: u, onToggleAnchor: c, onRemove: f, promptInvalid: m, onApplyParamsToAll: j } = o, [C, y] = p.useState(!1), [g, d] = p.useState(!1), S = new Map(r.map((b) => [b.id, b])), h = n.anchorIds.filter((b) => S.has(b)), E = r.filter((b) => !n.anchorIds.includes(b.id)), M = (n.shotKind ?? "video") === "image", K = M ? "image" : n.keyframe?.enabled === !0 ? "image-video" : "video", x = (b) => {
    b !== K && u(b === "image" ? { shotKind: "image", keyframe: void 0, modelKey: void 0, modeId: void 0, params: void 0 } : b === "image-video" ? {
      shotKind: "video",
      durationSec: n.durationSec > 0 ? n.durationSec : 5,
      keyframe: { ...n.keyframe || {}, enabled: !0, prompt: n.keyframe?.prompt || "" },
      modelKey: void 0,
      modeId: void 0,
      params: void 0
    } : { shotKind: "video", keyframe: void 0, durationSec: n.durationSec > 0 ? n.durationSec : 5, modelKey: void 0, modeId: void 0, params: void 0 });
  }, I = [.../* @__PURE__ */ new Set([...Kn, n.durationSec])].filter((b) => Number.isFinite(b) && b > 0).sort((b, Y) => b - Y).map((b) => ({ value: String(b), label: t("storyboardEditor.second", { count: b }) })), R = p.useCallback(
    (b) => u({ modelKey: b || void 0, modeId: void 0, params: void 0 }),
    [u]
  ), F = Wo(i ?? [], n.modelKey ?? "", R), $ = i && i.length > 0 ? [{ value: "", label: t("storyboardEditor.defaultModel") }, ...F.modelOptions] : null, he = (b) => b ? F.onModelPick(b) : R(""), xe = i?.find((b) => b.value === n.modelKey) ?? null;
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      draggable: o.draggable,
      onDragStart: o.onDragStart,
      onDragOver: o.onDragOver,
      onDrop: o.onDrop,
      onDragEnd: o.onDragEnd,
      className: l(
        "border rounded-nomi p-3 bg-nomi-paper shadow-nomi-sm",
        o.isDragOver ? "border-nomi-accent" : "border-nomi-line"
      ),
      children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-1.5", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap flex-1 min-w-0", children: [
            /* @__PURE__ */ e.jsx("span", { className: "shrink-0 cursor-grab text-nomi-ink-20 active:cursor-grabbing", "aria-hidden": !0, children: /* @__PURE__ */ e.jsx(wo, { size: 15, stroke: 1.6 }) }),
            /* @__PURE__ */ e.jsx("span", { className: "text-title font-semibold text-nomi-ink tabular-nums mr-0.5", children: t("storyboardEditor.shotNumber", { index: n.index }) }),
            /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t("storyboardEditor.shotType"),
                leadingLabel: t("storyboardEditor.type"),
                size: "xs",
                value: K,
                options: [
                  { value: "image", label: t("storyboardEditor.image") },
                  { value: "video", label: t("storyboardEditor.video") },
                  { value: "image-video", label: t("storyboardEditor.imageVideo") }
                ],
                onChange: x
              }
            ),
            M ? null : /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t("storyboardEditor.duration"),
                leadingLabel: t("storyboardEditor.duration"),
                size: "xs",
                value: String(n.durationSec),
                options: I,
                onChange: (b) => u({ durationSec: Number(b) })
              }
            ),
            $ ? /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t(M ? "storyboardEditor.imageModel" : "storyboardEditor.videoModel"),
                leadingLabel: t("storyboardEditor.model"),
                size: "xs",
                triggerMaxWidth: 150,
                value: n.modelKey ? F.modelValue : "",
                options: $,
                onChange: he
              }
            ) : null,
            F.providerOptions.length > 1 ? /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t("storyboardEditor.provider"),
                leadingLabel: t("storyboardEditor.provider"),
                size: "xs",
                triggerMaxWidth: 110,
                value: F.providerValue,
                options: F.providerOptions,
                onChange: F.onProviderPick
              }
            ) : null,
            /* @__PURE__ */ e.jsx(
              Xn,
              {
                modelOption: xe,
                modeId: n.modeId,
                params: n.params || {},
                onUpdate: (b) => u(b),
                open: g,
                onToggleOpen: () => d((b) => !b)
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              "aria-label": t("storyboardEditor.deleteShot"),
              onClick: f,
              className: "shrink-0 size-7 grid place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
              children: /* @__PURE__ */ e.jsx(Xe, { size: 14, stroke: 1.6 })
            }
          )
        ] }),
        g ? /* @__PURE__ */ e.jsx(
          Zn,
          {
            modelOption: xe,
            modeId: n.modeId,
            params: n.params || {},
            onUpdate: (b) => u(b),
            ...j ? { onApplyToAll: j } : {}
          }
        ) : null,
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mt-2.5", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40 mr-0.5", children: t("storyboardEditor.reference") }),
          h.map((b) => {
            const Y = S.get(b);
            return /* @__PURE__ */ e.jsxs(
              "span",
              {
                className: "h-6 pl-2.5 pr-1 rounded-full bg-nomi-ink-05 text-nomi-ink-80 text-caption inline-flex items-center gap-1",
                children: [
                  Y.name || t("storyboardEditor.unnamed"),
                  /* @__PURE__ */ e.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": t("storyboardEditor.removeReference", { name: Y.name || t("storyboardEditor.thisAnchor") }),
                      title: t("storyboardEditor.removeReference", { name: Y.name || t("storyboardEditor.thisAnchor") }),
                      onClick: () => c(b),
                      className: "grid place-items-center size-4 rounded-full text-nomi-ink-40 hover:bg-nomi-ink-20 hover:text-nomi-ink-80",
                      children: /* @__PURE__ */ e.jsx(ye, { size: 11, stroke: 1.8, "aria-hidden": !0 })
                    }
                  )
                ]
              },
              b
            );
          }),
          a.map((b) => /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => c(b),
              title: t("storyboardEditor.invalidReferenceHint"),
              className: "h-6 px-2 rounded-full bg-workbench-danger-soft text-workbench-danger text-caption inline-flex items-center gap-1",
              children: [
                /* @__PURE__ */ e.jsx("span", { className: "line-through", children: t("storyboardEditor.invalidReference") }),
                /* @__PURE__ */ e.jsx(ye, { size: 12, stroke: 1.8 })
              ]
            },
            b
          )),
          E.length > 0 && /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => y((b) => !b),
              "aria-expanded": C,
              className: "h-6 px-2.5 rounded-full border border-dashed border-nomi-ink-20 text-nomi-ink-60 text-caption inline-flex items-center gap-1 hover:text-nomi-ink-80",
              children: [
                /* @__PURE__ */ e.jsx(Ee, { size: 12, stroke: 1.8 }),
                t("storyboardEditor.reference")
              ]
            }
          )
        ] }),
        C && E.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-1.5 pl-7", children: E.map((b) => /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              c(b.id), E.length === 1 && y(!1);
            },
            className: "h-6 px-2.5 rounded-full border border-nomi-line text-nomi-ink-60 text-caption inline-flex items-center hover:border-nomi-ink-20 hover:text-nomi-ink-80",
            children: b.name || t("storyboardEditor.unnamed")
          },
          b.id
        )) }),
        a.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "text-micro text-workbench-danger mt-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ e.jsx(ve, { size: 12, stroke: 1.8 }),
          t("storyboardEditor.danglingWarning")
        ] }),
        K === "image-video" ? /* @__PURE__ */ e.jsxs("div", { className: "mt-2.5", children: [
          /* @__PURE__ */ e.jsx("div", { className: "mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.keyframePrompt") }),
          /* @__PURE__ */ e.jsx(
            je,
            {
              value: n.keyframe?.prompt || "",
              onChange: (b) => u({ keyframe: { ...n.keyframe || {}, enabled: !0, prompt: b.target.value } }),
              "aria-label": t("storyboardEditor.keyframePromptAria", { index: n.index }),
              placeholder: t("storyboardEditor.keyframePromptPlaceholder"),
              className: "px-2 py-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-body-sm text-nomi-ink-80 leading-normal focus:border-nomi-accent"
            }
          )
        ] }) : null,
        K === "image-video" ? /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.videoPrompt") }) : null,
        /* @__PURE__ */ e.jsx(
          je,
          {
            value: n.prompt,
            onChange: (b) => u({ prompt: b.target.value }),
            "aria-label": t("storyboardEditor.promptAria", { index: n.index }),
            placeholder: t(M ? "storyboardEditor.imagePromptPlaceholder" : "storyboardEditor.videoPromptPlaceholder"),
            className: l(
              "mt-2.5 px-2 py-2 rounded-nomi-sm border bg-nomi-paper",
              "text-body-sm text-nomi-ink-80 leading-normal focus:border-nomi-accent",
              m ? "border-workbench-danger" : "border-nomi-line"
            )
          }
        )
      ]
    }
  );
}
function er() {
  const { t: o } = P(), t = k((x) => x.storyboardPlan), n = k((x) => x.setStoryboardPlan), r = k((x) => x.commitStoryboardPlan), i = k((x) => x.discardStoryboardPlan), a = k((x) => x.setWorkspaceMode), u = k((x) => x.requestCanvasFit), [c, f] = p.useState(null), [m, j] = p.useState(null), [C, y] = p.useState(!1), g = He("video").options, d = He("image").options, S = (x) => {
    switch (x.kind) {
      case "no-shots":
        return o("storyboardEditor.issue.noShots");
      case "empty-shot-prompt":
        return o("storyboardEditor.issue.emptyPrompt", { index: x.shotIndex });
      case "dangling-ref":
        return o("storyboardEditor.issue.danglingRef", { index: x.shotIndex });
      case "anchor-no-name":
        return o("storyboardEditor.issue.anchorNoName");
    }
  };
  if (!t) return null;
  const h = Un(t), E = new Set(h.filter((x) => x.kind === "empty-shot-prompt").map((x) => x.shotIndex)), U = new Set(h.filter((x) => x.kind === "anchor-no-name").map((x) => x.anchorId)), M = async () => {
    await Je({
      title: o("storyboardEditor.discardTitle"),
      message: o("storyboardEditor.discardMessage"),
      confirmLabel: o("storyboardEditor.discard"),
      danger: !0
    }) && i();
  }, K = async () => {
    if (!(h.length > 0 || C)) {
      y(!0);
      try {
        const [x, I] = await Promise.all([
          So(),
          Eo()
        ]), R = Ut(t, {
          ...x.modelKey ? { defaultImageModelKey: x.modelKey } : {},
          ...x.modeId ? { defaultImageModeId: x.modeId } : {},
          ...x.refModeId ? { defaultImageRefModeId: x.refModeId } : {},
          ...I.modelKey ? { defaultVideoModelKey: I.modelKey } : {},
          ...I.modeId ? { defaultVideoModeId: I.modeId } : {}
        });
        await tt("create_canvas_nodes", R), r(), Bo([
          {
            kind: "storyboard",
            title: t.title,
            prompt: JSON.stringify(t)
          },
          ...t.shots.map(($) => ({
            kind: $.shotKind === "video" ? "video_prompt" : "image_prompt",
            title: `${t.title} · 镜头 ${$.index}`,
            prompt: $.prompt
          }))
        ]).catch(() => {
        }), a("generation"), u();
        const F = R.nodes.map(($) => $t($.clientId));
        F.length > 1 && Ye.getState().selectNodes(F);
      } catch (x) {
        await qt({
          title: o("storyboardEditor.landFailed"),
          message: x instanceof Error && x.message ? x.message : o("storyboardEditor.unknownRetry")
        });
      } finally {
        y(!1);
      }
    }
  };
  return /* @__PURE__ */ e.jsxs("section", { className: "relative w-full h-full min-h-0 grid grid-rows-[auto_auto_minmax(0,1fr)_auto] border border-workbench-border rounded-workbench bg-workbench-surface-solid shadow-workbench-md overflow-hidden", children: [
    /* @__PURE__ */ e.jsxs("header", { className: "flex items-center justify-between gap-3 h-12 px-4 border-b border-nomi-line", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ e.jsx(de, { size: 16, stroke: 1.5, className: "text-nomi-ink-60 shrink-0" }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            value: t.title,
            onChange: (x) => n(On(t, x.target.value)),
            "aria-label": o("storyboardEditor.titleAria"),
            placeholder: o("storyboardEditor.titlePlaceholder"),
            className: "min-w-0 max-w-[260px] text-title font-medium text-nomi-ink bg-transparent outline-none focus:bg-nomi-ink-05 rounded-nomi-sm px-1"
          }
        ),
        /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-micro text-nomi-ink-40 bg-nomi-ink-05 px-2 py-0.5 rounded-full", children: o("storyboardEditor.shotCount", { count: t.shots.length }) })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ e.jsx(
        W,
        {
          variant: "default",
          size: "sm",
          onClick: M,
          children: o("storyboardEditor.discardPlan")
        }
      ) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 px-4 py-1.5 border-b border-nomi-line-soft text-caption text-nomi-ink-40", children: [
      /* @__PURE__ */ e.jsx(Fo, { size: 14, stroke: 1.6, className: "shrink-0" }),
      /* @__PURE__ */ e.jsxs("span", { className: "truncate", children: [
        /* @__PURE__ */ e.jsx("span", { className: "text-nomi-ink-60", children: o("storyboardEditor.draftEditable") }),
        " · ",
        o("storyboardEditor.freeBeforeConfirm")
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "overflow-y-auto px-4 py-4 flex flex-col gap-4", children: [
      /* @__PURE__ */ e.jsxs("section", { children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline gap-2 mb-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-body-sm font-medium text-nomi-ink-80", children: o("storyboardEditor.consistencyTitle") }),
          /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40", children: o("storyboardEditor.consistencyHint") })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "border border-nomi-line rounded-nomi divide-y divide-nomi-line-soft overflow-hidden", children: [
          t.anchors.length === 0 && /* @__PURE__ */ e.jsx("div", { className: "text-caption text-nomi-ink-40 px-2.5 py-2", children: o("storyboardEditor.noAnchors") }),
          t.anchors.map((x) => /* @__PURE__ */ e.jsx(
            qn,
            {
              anchor: x,
              nameInvalid: U.has(x.id),
              onUpdate: (I) => n(dt(t, x.id, I)),
              onChangeKind: (I) => n(Wn(t, x.id, I)),
              onRemove: () => n(Fn(t, x.id))
            },
            x.id
          )),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => n(Ln(t)),
              className: "w-full flex items-center gap-1.5 px-2.5 py-2 bg-nomi-ink-05 text-caption text-nomi-ink-40 hover:text-nomi-ink-60 hover:bg-nomi-ink-10",
              children: [
                /* @__PURE__ */ e.jsx(Ee, { size: 13, stroke: 1.8 }),
                o("storyboardEditor.addAnchor")
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { children: [
        /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-medium text-nomi-ink-80 mb-2", children: o("storyboardEditor.storyboardHeading", { count: t.shots.length }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2", children: [
          t.shots.map((x, I) => /* @__PURE__ */ e.jsx(
            Qn,
            {
              shot: x,
              anchors: t.anchors,
              modelOptions: x.shotKind === "image" ? d : g,
              danglingIds: $n(t, x),
              promptInvalid: E.has(x.index),
              draggable: !0,
              isDragOver: m === I && c !== null && c !== I,
              onDragStart: () => f(I),
              onDragOver: (R) => {
                R.preventDefault(), j(I);
              },
              onDrop: () => {
                c !== null && c !== I && n(Vn(t, c, I)), f(null), j(null);
              },
              onDragEnd: () => {
                f(null), j(null);
              },
              onUpdate: (R) => n(ut(t, I, R)),
              onToggleAnchor: (R) => n(Gn(t, I, R)),
              onRemove: () => n(Hn(t, I)),
              onApplyParamsToAll: () => n({
                ...t,
                shots: t.shots.map((R) => ({ ...R, modelKey: x.modelKey, modeId: x.modeId, params: x.params }))
              })
            },
            x.index
          )),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => n(Bn(t)),
              className: "self-start h-6 px-2.5 rounded-full border border-dashed border-nomi-ink-20 text-caption text-nomi-ink-60 inline-flex items-center gap-1 hover:text-nomi-ink-80",
              children: [
                /* @__PURE__ */ e.jsx(Ee, { size: 13, stroke: 1.8 }),
                o("storyboardEditor.addShot")
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("footer", { className: "flex items-center justify-between gap-3 px-4 py-2.5 border-t border-nomi-line bg-nomi-paper", children: [
      h.length > 0 ? /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-danger inline-flex items-center gap-[5px] min-w-0", children: [
        /* @__PURE__ */ e.jsx(ve, { size: 14, stroke: 1.8, className: "shrink-0" }),
        /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o("storyboardEditor.issuesSummary", { count: h.length, issue: S(h[0]) }) })
      ] }) : /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-success inline-flex items-center gap-[5px]", children: [
        /* @__PURE__ */ e.jsx(ce, { size: 14, stroke: 1.8 }),
        o("storyboardEditor.readySummary", { anchors: t.anchors.length, shots: t.shots.length })
      ] }),
      /* @__PURE__ */ e.jsxs(
        W,
        {
          variant: "primary",
          onClick: K,
          disabled: h.length > 0 || C,
          children: [
            /* @__PURE__ */ e.jsx(ce, { size: 15, stroke: 1.8 }),
            o(C ? "storyboardEditor.landing" : "storyboardEditor.confirmLanding")
          ]
        }
      )
    ] })
  ] });
}
function Ir() {
  const { t: o } = P(), t = k((m) => m.creationAiCollapsed), n = k((m) => m.setCreationAiCollapsed), r = k((m) => m.creationAssistantAutoOpen), i = k((m) => m.setCreationAssistantAutoOpen), a = k((m) => m.storyboardPlan), u = k((m) => m.storyboardPlanCommitted), c = k((m) => m.storyboardEditorOpen), f = k((m) => m.setStoryboardEditorOpen);
  return p.useEffect(() => {
    r && (n(!1), i(!1));
  }, [r, i]), /* @__PURE__ */ e.jsxs(
    "section",
    {
      className: l(
        "workbench-creation relative",
        "w-full h-full min-w-0 min-h-0",
        "pt-[22px] px-6 pb-6",
        "bg-workbench-bg",
        t ? "grid max-w-[900px] mx-auto" : l(
          "grid grid-cols-[minmax(0,1fr)_344px] max-w-[1264px] mx-auto gap-5",
          "max-[1120px]:grid-cols-[minmax(0,1fr)] max-[1120px]:grid-rows-[minmax(420px,1fr)_minmax(320px,42vh)]"
        )
      ),
      "aria-label": o("creationAi.workspace.aria"),
      children: [
        /* @__PURE__ */ e.jsxs("div", { className: "min-w-0 min-h-0 flex flex-col gap-2", children: [
          a ? /* @__PURE__ */ e.jsxs(
            "div",
            {
              className: "h-9 shrink-0 flex items-center justify-between gap-3 p-0.5 border border-nomi-line rounded-nomi bg-nomi-paper",
              role: "tablist",
              "aria-label": o("creationAi.workspace.surfacesAria"),
              children: [
                /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-0.5", children: [
                  { label: o("creationAi.workspace.source"), active: !c, open: !1 },
                  { label: o("creationAi.workspace.storyboard"), active: c, open: !0 }
                ].map((m) => /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    "aria-selected": m.active,
                    onClick: () => f(m.open),
                    className: l(
                      "h-7 px-3 rounded-nomi-sm text-caption font-semibold cursor-pointer",
                      "transition-[background,color,box-shadow] duration-[var(--nomi-transition-fast)]",
                      m.active ? "bg-nomi-ink-10 text-nomi-ink shadow-nomi-sm" : "bg-transparent text-nomi-ink-40 hover:text-nomi-ink-60"
                    ),
                    children: m.label
                  },
                  m.label
                )) }),
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: l("mr-2 text-micro", u ? "text-workbench-success" : "text-nomi-accent"),
                    children: o(u ? "creationAi.workspace.committed" : "creationAi.workspace.draft")
                  }
                )
              ]
            }
          ) : null,
          /* @__PURE__ */ e.jsx("div", { className: "min-h-0 flex-1", "data-creation-surface": c ? "storyboard" : "source", children: c ? /* @__PURE__ */ e.jsx(er, {}) : /* @__PURE__ */ e.jsx(Rn, {}) })
        ] }),
        t ? /* @__PURE__ */ e.jsx(
          W,
          {
            className: l(
              "absolute top-[22px] right-6 z-[20]",
              "inline-flex items-center gap-2 h-9 pl-[10px] pr-[14px]",
              "border border-nomi-line rounded-full bg-nomi-paper text-nomi-ink",
              "text-body-sm font-medium shadow-nomi-sm cursor-pointer",
              "hover:shadow-nomi-md hover:-translate-y-px"
            ),
            "aria-label": o("creationAi.workspace.expandAssistant"),
            onClick: () => n(!1),
            children: /* @__PURE__ */ e.jsx(Jt, { markSize: 18, wordSize: 13, suffix: o("creationAi.workspace.assistantSuffix") })
          }
        ) : /* @__PURE__ */ e.jsx(An, { onCollapse: () => n(!0) })
      ]
    }
  );
}
export {
  Ir as default
};
