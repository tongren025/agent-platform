import { aR as je, dV as _, S as p, dC as At, c8 as e, l as re, aJ as l, a8 as L, cd as St, ce as Et, dW as k, o as ie, aN as Be, x as ke, p as Se, u as It, I as ye, cH as ne, dE as we, dL as _t, da as Tt, c7 as Mt, cN as Pt, d$ as Me, dn as Rt, aE as zt, K as Ot, a9 as de, cG as Dt, bX as Kt, dK as He, cr as Lt, w as Ve, cZ as Ft, s as Ne, dp as Wt, c_ as Bt, ad as Ht, N as Vt } from "./agentStudioMount-CP7x4OcS.js";
import { N as $t, e as Ut, s as qt, k as Gt, j as Jt, m as Yt, u as Zt, r as Xt, g as Pe, W as Qt, M as eo, I as to, U as oo, A as no, a as ro, S as io, C as so, c as ao, d as ve, l as lo, b as co, h as mo } from "./useComposerAttachments-BYQbp2IE.js";
import { a as uo, I as po } from "./IconMinimize-D2SXVB4y.js";
import { a as ho, I as xo } from "./IconSettings-cTVIxxbi.js";
import { N as Z } from "./NomiSelect-l9fMiLNK.js";
import { I as Re } from "./IconBulb-BWat85of.js";
import { I as $e } from "./IconArrowRight-B1lG7P3M.js";
import { I as bo } from "./IconCircleCheck-Dnc8OOno.js";
import { a as fo, I as go } from "./IconPhotoPlus-DGFgAY4Y.js";
import { I as Ue } from "./IconChevronRight-CtUKyzdC.js";
import { I as ze } from "./IconWand-Dv2yC9eQ.js";
import { l as ko, g as qe, s as Ce, i as yo } from "./skillApi-UBroaBvC.js";
import { g as vo } from "./trajectoryLayout-ROrP_lkV.js";
import { a as Ge, c as jo, d as wo } from "./applyCanvasToolCall-BSuSR_kC.js";
import { E as No } from "./index-lCOLy7AU.js";
import { I as Co, c as Ao, a as So, b as Eo, u as Io, d as _o } from "./richTextActions-CZ_aGjwQ.js";
import { I as To } from "./IconVideo-Wpl4-gzk.js";
import { a as ge } from "./workbenchActions-CjZ4Rby5.js";
import { u as Mo, a as Oe, I as Po } from "./useDedupedModelSelect-BmXmeFtL.js";
import { r as Ro } from "./promptLearningApi-CtoVWXNr.js";
import { I as zo } from "./IconBox-B3Ee3xqu.js";
import { I as Oo } from "./IconCamera-Dilr_-7o.js";
import { I as Je } from "./IconChevronUp-DpfuedBz.js";
import { I as Do } from "./IconLetterCase-DqTA5XpZ.js";
import { a as Ko, I as Lo } from "./IconPalette-DQ07j_uO.js";
import { I as Fo } from "./IconUser-DkJ2iwmb.js";
const Wo = [["path", { d: "M10 12h4", key: "svg-0" }], ["path", { d: "M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3", key: "svg-1" }], ["path", { d: "M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3", key: "svg-2" }]], Bo = je("outline", "cursor-text", "CursorText", Wo);
const Ho = [["path", { d: "M14 3v4a1 1 0 0 0 1 1h4", key: "svg-0" }], ["path", { d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2", key: "svg-1" }], ["path", { d: "M12 11l0 6", key: "svg-2" }], ["path", { d: "M9 14l6 0", key: "svg-3" }]], Vo = je("outline", "file-plus", "FilePlus", Ho);
const $o = [["path", { d: "M3 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-0" }], ["path", { d: "M15 16a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-1" }], ["path", { d: "M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3", key: "svg-2" }], ["path", { d: "M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3", key: "svg-3" }]], Uo = je("outline", "replace", "Replace", $o);
const qo = [["path", { d: "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", key: "svg-0" }], ["path", { d: "M16 19h6", key: "svg-1" }], ["path", { d: "M19 16v6", key: "svg-2" }], ["path", { d: "M6 21v-2a4 4 0 0 1 4 -4h4", key: "svg-3" }]], Go = je("outline", "user-plus", "UserPlus", qo);
async function Jo() {
  try {
    const [o, t] = await Promise.all([
      St({ kind: "text", enabled: !1 }),
      Et()
    ]), n = new Set(t.filter((i) => i.hasApiKey).map((i) => i.key)), r = o.find((i) => n.has(i.vendorKey));
    return r ? { vendorKey: r.vendorKey, modelKey: r.modelKey, labelZh: r.labelZh } : null;
  } catch {
    return null;
  }
}
function Yo({ onResolved: o }) {
  const { t } = _(), [n, r] = p.useState("prompt"), [i, a] = p.useState(null);
  p.useEffect(() => {
    let f = !0;
    return Jo().then((m) => {
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
        await At({ ...i, kind: "text", enabled: !0 }), window.dispatchEvent(new CustomEvent("nomi-model-catalog-changed")), r("done"), o?.();
      } catch {
        r("prompt");
      }
    }
  }, [i, o]);
  return /* @__PURE__ */ e.jsxs("div", { className: l("self-start w-full max-w-full"), "data-role": "assistant", "data-recovery": "no-text-model", children: [
    /* @__PURE__ */ e.jsx($t, {}),
    n === "done" ? /* @__PURE__ */ e.jsxs("div", { className: l("flex items-start gap-2 p-3 rounded-nomi border border-nomi-line bg-nomi-ink-05"), children: [
      /* @__PURE__ */ e.jsx(re, { size: 16, className: l("mt-0.5 shrink-0 text-nomi-ink-80") }),
      /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-1"), children: [
        /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-medium text-nomi-ink"), children: t("creationAi.noTextModel.readyTitle") }),
        /* @__PURE__ */ e.jsx("span", { className: l("text-caption text-nomi-ink-60 leading-snug"), children: t("creationAi.noTextModel.readyDescription") })
      ] })
    ] }) : /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-3 p-3 rounded-nomi border border-nomi-line"), children: [
      /* @__PURE__ */ e.jsxs("div", { className: l("flex items-start gap-2"), children: [
        /* @__PURE__ */ e.jsx(Re, { size: 18, className: l("mt-0.5 shrink-0 text-nomi-ink-60") }),
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
          L,
          {
            variant: "primary",
            className: "w-full",
            loading: n === "enabling",
            onClick: () => {
              c();
            },
            children: [
              /* @__PURE__ */ e.jsx(Re, {}),
              /* @__PURE__ */ e.jsx("span", { className: "min-w-0 truncate", children: t("creationAi.noTextModel.enable", { model: i.labelZh }) })
            ]
          }
        ) : null,
        /* @__PURE__ */ e.jsxs(L, { variant: "default", className: "w-full", onClick: u, children: [
          /* @__PURE__ */ e.jsx(ho, {}),
          t("creationAi.noTextModel.settings")
        ] })
      ] })
    ] })
  ] });
}
function Zo() {
  const { t: o } = _(), t = k((d) => d.storyboardPlan), n = k((d) => d.storyboardPlanCommitted), r = k((d) => d.storyboardEditorOpen), i = k((d) => d.setStoryboardEditorOpen), a = k((d) => d.discardStoryboardPlan), u = k((d) => d.setWorkspaceMode);
  if (!t) return null;
  const c = t.title.trim() || o("storyboardEditor.planCard.defaultTitle"), f = t.shots.length, m = t.anchors.length, j = Math.round(t.shots.reduce((d, C) => d + (C.shotKind === "image" ? 0 : C.durationSec || 0), 0)), w = o("storyboardEditor.planCard.meta", {
    shots: f,
    anchors: m,
    duration: j > 0 ? o("storyboardEditor.planCard.duration", { seconds: j }) : o("storyboardEditor.planCard.imageStoryboard")
  }), v = async () => {
    await Be({
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
          n && !r ? /* @__PURE__ */ e.jsx(bo, { size: 15, stroke: 1.6, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ e.jsx(ie, { size: 15, stroke: 1.6, className: "shrink-0 text-nomi-ink-60" }),
          /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate text-body-sm font-medium text-nomi-ink", children: c }),
          /* @__PURE__ */ e.jsx("span", { className: l("shrink-0 text-micro px-2 py-0.5 rounded-full leading-relaxed", g.cls), children: g.label })
        ] }),
        r ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.editingSummary", { count: f }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(L, { variant: "default", size: "sm", onClick: () => i(!1), children: o("storyboardEditor.planCard.backToDraft") }),
            /* @__PURE__ */ e.jsx("span", { className: "ml-auto text-caption text-nomi-ink-40", children: o("storyboardEditor.planCard.confirmHint") })
          ] })
        ] }) : n ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.committedSummary", { count: f }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(L, { variant: "default", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.editAgain") }),
            /* @__PURE__ */ e.jsxs(L, { variant: "default", size: "sm", className: "ml-auto", onClick: () => u("generation"), children: [
              o("storyboardEditor.planCard.goGeneration"),
              /* @__PURE__ */ e.jsx($e, { size: 13, stroke: 1.6 })
            ] })
          ] })
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: w }),
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
            /* @__PURE__ */ e.jsx(L, { variant: "primary", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.openEditor") }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: v,
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
const Xo = {
  storyboard: ie,
  fixation: Go
}, Qo = [
  { value: "image", labelKey: "storyboardEditor.action.imageMode", Icon: Se },
  { value: "video", labelKey: "storyboardEditor.action.videoMode", Icon: ie },
  { value: "image-video", labelKey: "storyboardEditor.action.imageVideoMode", Icon: fo }
];
function Ye({
  kind: o,
  resolved: t,
  onRun: n,
  lead: r,
  onDismiss: i
}) {
  const { t: a } = _(), u = Xo[o], c = a(o === "storyboard" ? "storyboardEditor.action.storyboardLead" : "storyboardEditor.action.fixationLead"), f = a(o === "storyboard" ? "storyboardEditor.action.storyboardCta" : "storyboardEditor.action.fixationCta"), m = r ?? c, [j, w] = p.useState("image");
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
          children: /* @__PURE__ */ e.jsx(ke, { size: 13, stroke: 1.8 })
        }
      ) : null
    ] }),
    o === "storyboard" ? /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-1"), role: "radiogroup", "aria-label": a("storyboardEditor.action.typeAria"), children: [
      Qo.map((v) => {
        const g = j === v.value;
        return /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": g,
            disabled: t,
            onClick: () => w(v.value),
            "data-shot-mode": v.value,
            className: l(
              "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-caption border whitespace-nowrap shrink-0",
              g ? "border-nomi-ink bg-nomi-ink text-nomi-paper font-medium" : "border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
            ),
            children: [
              /* @__PURE__ */ e.jsx(v.Icon, { size: 12, stroke: 1.8 }),
              a(v.labelKey)
            ]
          },
          v.value
        );
      }),
      /* @__PURE__ */ e.jsx("span", { className: l("text-micro text-nomi-ink-40 ml-1 min-w-0 truncate"), children: a(j === "image" ? "storyboardEditor.action.imageHint" : j === "image-video" ? "storyboardEditor.action.imageVideoHint" : "storyboardEditor.action.videoHint") })
    ] }) : null,
    /* @__PURE__ */ e.jsxs(
      L,
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
          t ? null : /* @__PURE__ */ e.jsx($e, { size: 13, stroke: 1.7 })
        ]
      }
    )
  ] });
}
const Ze = /拆镜头|分镜|拆分|镜头脚本|storyboard|成片|出片/i, Xe = /(?:拆|切|分|变|做|整|铺|排|拍|剪|生成|搞|弄|规划).{0,6}(?:镜头|分镜|画面|场景|视频|短片|片子|一段段|一格格|一幕幕|一幕)/, en = /立角色卡|角色卡|人物卡|定妆|角色设定|建.{0,2}角色/;
function tn(o) {
  return Ze.test(o) || Xe.test(o);
}
function on(o) {
  const t = o.trim();
  return t ? tn(t) ? "storyboard" : en.test(t) ? "fixation" : null : null;
}
function nn(o) {
  const t = o.trim();
  if (!t) return "";
  const n = t.split(/[:：]/).slice(1).join("：").trim();
  return n.length >= 12 ? n : t.replace(Ze, "").replace(Xe, "").replace(/[\s,，。、!！?？]+/g, "").length >= 12 ? t : "";
}
const rn = "workbench.creation.skill-author";
function sn() {
  window.dispatchEvent(new Event("nomi-open-model-catalog"));
}
function an({
  activeSkill: o,
  autoLabel: t,
  onSelect: n
}) {
  const { t: r } = _(), i = (h) => r(`libraries.skill.provider.${h}`), a = p.useRef(null), [u, c] = p.useState(!1), [f, m] = p.useState([]), [j, w] = p.useState(/* @__PURE__ */ new Set()), v = p.useCallback(() => {
    ko().then((h) => m(h.filter((S) => S.isPlaybook))).catch(() => m([])), qe().then(w).catch(() => w(/* @__PURE__ */ new Set()));
  }, []);
  p.useEffect(() => {
    v();
  }, [v]);
  const g = o ? f.find((h) => h.name === o.key) ?? null : null, d = g ? Ce(g, j).missing : [], C = !!o;
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
          C ? "bg-nomi-accent-soft text-nomi-accent" : "bg-nomi-ink-05 text-nomi-ink-80 hover:bg-nomi-ink-10"
        ].join(" "),
        children: [
          C ? /* @__PURE__ */ e.jsx(ie, { size: 14, stroke: 1.5, className: "shrink-0" }) : /* @__PURE__ */ e.jsx(It, { size: 14, stroke: 1.5, className: "shrink-0" }),
          /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o ? o.name : t }),
          d.length > 0 && /* @__PURE__ */ e.jsx(ye, { size: 13, stroke: 1.8, className: "shrink-0 text-workbench-danger" }),
          /* @__PURE__ */ e.jsx(Ue, { size: 13, stroke: 1.6, className: "shrink-0 opacity-60" })
        ]
      }
    ),
    u && /* @__PURE__ */ e.jsx(Ut, { anchorRef: a, onClose: () => c(!1), children: /* @__PURE__ */ e.jsxs("div", { className: "w-[284px] rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg p-1.5 text-body-sm text-nomi-ink", children: [
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
            /* @__PURE__ */ e.jsx(ze, { size: 16, stroke: 1.5, className: "shrink-0" }),
            /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ e.jsx("span", { className: "block font-medium", children: r("libraries.skill.auto") }),
              /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: r("libraries.skill.followsMode", { mode: t }) })
            ] }),
            !o && /* @__PURE__ */ e.jsx(re, { size: 15, stroke: 1.8, className: "shrink-0" })
          ]
        }
      ),
      f.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "my-1 border-t border-nomi-line-soft" }),
      f.map((h) => {
        const S = Ce(h, j), H = o?.key === h.name;
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
              H ? "bg-nomi-accent-soft text-nomi-accent" : "hover:bg-nomi-ink-05"
            ].join(" "),
            children: [
              /* @__PURE__ */ e.jsx(ie, { size: 16, stroke: 1.5, className: "mt-0.5 shrink-0" }),
              /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "font-medium truncate", children: h.label }),
                  /* @__PURE__ */ e.jsx("span", { className: "shrink-0 rounded-full bg-nomi-ink-05 px-1.5 text-micro text-nomi-ink-60", children: r("libraries.skill.playbookStages", { count: h.stageLabels.length }) })
                ] }),
                h.author && /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: h.author }),
                /* @__PURE__ */ e.jsx("span", { className: "mt-1 flex flex-wrap items-center gap-1", children: h.neededProviders.map((T) => {
                  const R = !S.missing.includes(T);
                  return /* @__PURE__ */ e.jsxs(
                    "span",
                    {
                      className: [
                        "inline-flex items-center gap-0.5 text-micro",
                        R ? "text-workbench-success" : "text-nomi-ink-40"
                      ].join(" "),
                      children: [
                        R ? /* @__PURE__ */ e.jsx(re, { size: 11, stroke: 2 }) : /* @__PURE__ */ e.jsx(ye, { size: 11, stroke: 2 }),
                        i(T)
                      ]
                    },
                    T
                  );
                }) })
              ] }),
              H && /* @__PURE__ */ e.jsx(re, { size: 15, stroke: 1.8, className: "mt-0.5 shrink-0" })
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
              sn(), c(!1);
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
            n({ key: rn, name: r("libraries.skill.authorName") }), c(!1);
          },
          className: "flex w-full items-center gap-2 rounded-nomi-sm px-2.5 py-2 text-left text-nomi-accent hover:bg-nomi-accent-soft transition-colors duration-[var(--nomi-transition-fast)]",
          children: [
            /* @__PURE__ */ e.jsx(ze, { size: 16, stroke: 1.5, className: "shrink-0" }),
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
const ln = {
  key: "workbench.storyboard.planner",
  name: "故事板规划师"
};
function cn(o) {
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
function dn(o) {
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
    cn(o.shotMode ?? "image"),
    "",
    "结构化工具调用硬约束：propose_storyboard_plan 参数必须是对象本体，anchors/shots 必须是数组本体；不要把任何数组序列化成字符串。",
    "",
    "--- 故事正文 ---",
    t,
    "--- 故事正文结束 ---"
  ].join(`
`);
}
async function mn(o) {
  return { text: (await qt({
    message: dn({
      storyText: o.storyText,
      currentPlan: o.currentPlan,
      revisionRequest: o.revisionRequest,
      ...o.shotMode ? { shotMode: o.shotMode } : {}
    }),
    snapshot: vo.read_canvas(),
    selectedNodes: [],
    mode: "agent",
    skill: ln,
    onContent: (n, r) => o.onContent?.(r),
    ...o.onCancelReady ? { onCancelReady: o.onCancelReady } : {},
    onToolCall: (n) => {
      if (Gt(
        { kind: "tool-call", toolName: n.toolName, args: n.args },
        Jt()
      ).outcome === "allow") {
        (async () => {
          try {
            const i = await Ge(n.toolName, n.args);
            await n.confirm({ ok: !0, result: i, silent: !0 });
          } catch (i) {
            await n.confirm({ ok: !1, message: i instanceof Error ? i.message : String(i) });
          }
        })();
        return;
      }
      n.confirm({
        ok: !1,
        message: "现在是分镜规划阶段，请用 propose_storyboard_plan 产出方案给用户审阅，不要直接创建或修改画布节点。",
        denied: !0
      });
    }
  })).response.text?.trim() ?? "" };
}
const Ae = [
  {
    id: "general",
    label: "通用问答",
    shortLabel: "通用",
    title: "通用助手",
    description: "像普通 AI 一样直接回答，不强制套创作模板、不写入文稿。",
    prompt: "本轮是通用问答：直接、简洁地回答用户的问题或请求。不要强行套用任何创作模板，也不要主动改写文稿。",
    chatOnly: !0
  },
  {
    id: "story",
    label: "写故事",
    shortLabel: "故事",
    title: "故事开发",
    description: "从主题、片段或选区扩展为可拍的故事梗概。",
    prompt: [
      "本轮任务：故事开发。基于用户输入、当前文稿和选区，产出可继续制作的视频故事方案。",
      "输出包括：核心梗、故事梗概、主角画像、核心冲突、情绪曲线、一句话卖点。"
    ].join(`
`)
  },
  {
    id: "script",
    label: "写剧本",
    shortLabel: "剧本",
    title: "剧本创作",
    description: "按镜头、对白、OS/VO 和字幕格式生成剧本。",
    prompt: [
      "本轮任务：剧本创作。把材料改写成标准剧本。",
      "剧本正文必须使用镜头格式：每个镜头以“△ ”开头，包含景别、运镜、光线、氛围、动作和声音。",
      "对白使用“角色名（情绪/OS/VO）：内容”。需要字幕时使用“【字幕：xxx】”。",
      "输出优先给可直接粘贴进创作区的剧本正文。"
    ].join(`
`)
  },
  {
    id: "assets",
    label: "素材规划",
    shortLabel: "素材",
    title: "角色/场景/道具",
    description: "拆出角色、场景、道具，并生成生图提示词。",
    prompt: [
      "本轮任务：素材规划。基于故事或剧本拆分视觉资产。",
      "按角色 C01-C99、场景 S01-S99、道具 P01-P99 编号。",
      "每个资产输出名称、用途、视觉标记、生成提示词。所有提示词保持同一视觉风格前缀。",
      "角色必须有可区分的颜色、轮廓或配件标记。"
    ].join(`
`)
  },
  {
    // 名字要和「拆成镜头·落画布」区分开：这个模式只在文稿里写文字稿，不落画布、不生成。
    // 旧名「写分镜/分镜」和画布的「分镜」撞车，用户误选它以为能拆镜头到画布（名实不符）→ 改叫「文字稿」。
    id: "storyboard",
    label: "写分镜文字稿",
    shortLabel: "文字稿",
    title: "分镜文字稿",
    description: "在文稿里起草文字版分镜稿（15 秒一集，纯文字、不落画布）。想把故事结构化拆成镜头、落到画布生成，直接说「拆成镜头」或用浮现的卡片。",
    prompt: [
      "本轮任务：分镜脚本。把当前故事或剧本拆成可生成视频的分镜脚本。",
      "每集包含：素材上传清单、Seedance Prompt、尾帧描述。",
      "15秒分镜按 0-3秒、3-6秒、6-9秒、9-12秒、12-15秒 拆分。",
      "每段写清楚主体、动作、镜头运动、情绪、光线、转场和声音。"
    ].join(`
`)
  },
  {
    id: "seedance",
    label: "提示词",
    shortLabel: "提示词",
    title: "Seedance 提示词",
    description: "生成可复制到 Seedance 2.0 的最终提示词。",
    prompt: [
      "本轮任务：Seedance 2.0 提示词。输出可直接用于视频生成的时间轴提示词。",
      "格式：风格描述、15秒、画幅、整体氛围；然后按 0-3秒/3-6秒/6-9秒/9-12秒/12-15秒写画面。",
      "使用明确运镜词：推镜头、拉镜头、摇镜头、移镜头、跟镜头、环绕镜头、升降镜头、希区柯克变焦、一镜到底、手持晃动。",
      "如果是续集，保留“将@视频1延长15s”的开头，并说明 @图片/@视频 引用用途。",
      "避免过长堆砌，优先清晰可执行。"
    ].join(`
`)
  },
  {
    id: "review",
    label: "审校优化",
    shortLabel: "审校",
    title: "连续性审校",
    description: "检查资产引用、时间轴、情绪弧和敏感风险。",
    prompt: [
      "本轮任务：连续性审校。检查当前文稿的问题并给出可直接修改的结果。",
      "重点检查：资产引用是否对应、15秒时间轴是否完整、剧集尾帧和下一集开场是否连续、镜头语言是否具体、情绪弧是否成立、提示词是否过长或可能触发敏感风险。",
      "先列问题，再给修订版。不要输出泛泛建议。"
    ].join(`
`)
  }
];
function un(o) {
  return Ae.find((t) => t.id === o) || Ae[0];
}
function pn(o) {
  return !o.chatOnly;
}
function Qe(o) {
  return et(o?.contentJson).trim();
}
function et(o) {
  if (!o || typeof o != "object") return "";
  const t = o, n = typeof t.text == "string" ? t.text : "", r = Array.isArray(t.content) ? t.content.map(et).filter(Boolean).join(`
`) : "";
  return [n, r].filter(Boolean).join(n && r ? `
` : "");
}
function hn(o) {
  const t = o.userRequest.trim();
  return o.mode.chatOnly ? [
    o.mode.prompt,
    "",
    "需要时可调用 read_full_text 读取当前文稿、read_selection 读取选区作为上下文；本模式不要改写文档。",
    "",
    "用户问题：",
    t || "（用户未输入文字，请礼貌询问需要什么帮助）"
  ].join(`
`) : [
    o.mode.prompt,
    "",
    "工具使用规则（真实工具调用，用户会在卡片上确认每一次写入）：",
    "- 读取上下文：需要现有正文时调用 read_full_text；只针对选中片段操作时调用 read_selection。不要假设你已经知道文稿内容，先读再写。",
    "- 写入文档：改写/润色选中片段用 replace_selection；在光标处续写或补充用 insert_at_cursor；交付完整结果追加到文末用 append_to_end。",
    "- 写入工具的 content 字段只放最终正文，不要写使用说明或解释。",
    "- 只有用户明确要求写入/插入/替换/追加时才调用写入工具；否则用自然语言回答即可。",
    "",
    "当前任务：",
    t || `请按“${o.mode.label}”模式处理当前材料。`
  ].join(`
`);
}
function tt(o) {
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
function xn() {
  const o = ne.useRef(null), t = ne.useRef(null), n = ne.useCallback(() => {
    t.current = null;
    const a = o.current;
    o.current = null, a?.();
  }, []), r = ne.useCallback(
    (a) => {
      o.current = a, t.current === null && (t.current = requestAnimationFrame(n));
    },
    [n]
  ), i = ne.useCallback(() => {
    t.current !== null && (cancelAnimationFrame(t.current), t.current = null), o.current = null;
  }, []);
  return ne.useEffect(
    () => () => {
      t.current !== null && cancelAnimationFrame(t.current);
    },
    []
  ), { push: r, cancel: i };
}
const bn = 60;
function fn({
  busy: o,
  onRun: t
}) {
  const { t: n } = _(), r = k((m) => m.workbenchDocument), i = k((m) => m.storyboardPlan), [a, u] = p.useState(!1), c = p.useMemo(() => Qe(r), [r]);
  return !o && !i && !a && c.trim().length >= bn ? /* @__PURE__ */ e.jsx("div", { className: l("pt-1.5"), children: /* @__PURE__ */ e.jsx(
    Ye,
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
function gn(o) {
  return o === "insert_at_cursor" ? "creationAi.writeTool.insert" : o === "replace_selection" ? "creationAi.writeTool.replace" : "creationAi.writeTool.append";
}
function kn(o) {
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
function yn({ onCollapse: o } = {}) {
  const { t } = _(), n = we((s) => s.sending), r = we((s) => s.pendingToolCalls), i = we, { push: a, cancel: u } = xn(), [c, f] = p.useState(0), m = p.useRef(n);
  p.useEffect(() => {
    m.current && !n && f((s) => s + 1), m.current = n;
  }, [n]);
  const [j, w] = p.useState(!1), v = tt("workbench-scrollbar-visible"), g = k((s) => s.workbenchDocument), d = k((s) => s.creationDocumentTools), C = k((s) => s.creationSelectionText), h = k((s) => s.creationAiModeId), S = k((s) => s.creationActiveSkill), H = k((s) => s.setCreationActiveSkill), T = k((s) => s.creationAiDraft), R = k((s) => s.creationAiMessages), x = Yt(R.map((s) => s.id), "creation"), { hasTextModel: E, refresh: M } = _t(), [F, V] = p.useState(() => /* @__PURE__ */ new Set()), [me, ue] = p.useState(() => /* @__PURE__ */ new Set()), b = k((s) => s.creationAiAttachments), G = k((s) => s.creationAiError), dt = k((s) => s.setCreationAiModeId), $ = k((s) => s.setCreationAiDraft), z = k((s) => s.setCreationAiMessages), mt = k((s) => s.setCreationAiAttachments), D = k((s) => s.setCreationAiError), Ee = k((s) => s.setWorkspaceMode), {
    isDragging: ut,
    openFilePicker: pt,
    inputRef: ht,
    onInputChange: xt,
    removeAttachment: bt,
    clearAttachments: pe,
    handlePaste: ft,
    dragHandlers: gt
  } = Zt({ setAttachments: mt, onError: D }), se = p.useRef(d);
  se.current = d;
  const U = un(h), q = p.useRef({ activeSkill: S, activeMode: U });
  q.current = { activeSkill: S, activeMode: U };
  const X = p.useMemo(() => Qe(g), [g]), he = p.useCallback((s, N) => {
    i.getState().resolvePendingToolCall(s, N);
  }, [i]), kt = p.useCallback((s) => {
    const N = se.current;
    if (!N) {
      he(s.toolCallId, { ok: !1, message: "editor_not_ready" });
      return;
    }
    s.toolName === "insert_at_cursor" ? N.insertAtCursor(s.content) : s.toolName === "replace_selection" ? N.replaceSelection(s.content) : N.appendToEnd(s.content), he(s.toolCallId, { ok: !0, result: { applied: !0 } });
  }, [he]), yt = p.useCallback((s) => s === "insert_at_cursor" ? /* @__PURE__ */ e.jsx(Bo, { size: 13 }) : s === "replace_selection" ? /* @__PURE__ */ e.jsx(Uo, { size: 13 }) : /* @__PURE__ */ e.jsx(Vo, { size: 13 }), []), xe = p.useCallback((s = t("creationAi.storyboardCommand"), N, O = "image") => {
    const ae = k.getState(), Q = ae.storyboardPlan, ee = !!(Q && !ae.storyboardPlanCommitted && N?.trim()), le = (C || X).trim(), te = le ? "" : nn(s);
    te && se.current?.appendToEnd(te);
    const fe = le || te;
    if (!ee && !fe) {
      D(t("creationAi.writeStoryFirst"));
      return;
    }
    const J = i.getState().nextMessageId("user"), W = i.getState().nextMessageId("assistant");
    z((K) => [
      ...K,
      { id: J, role: "user", content: s },
      { id: W, role: "assistant", content: t(ee ? "creationAi.revisingPlan" : "creationAi.planningStoryboard"), status: "pending" }
    ]), $(""), D("");
    const A = i.getState().begin();
    (async () => {
      try {
        const { text: K } = await mn({
          // 首拆带分镜模式（图片/视频，动作卡上选，默认图片）；改方案不带——保留现方案每镜已定的 shotKind。
          ...ee ? { currentPlan: Q, revisionRequest: N } : { storyText: fe, shotMode: O },
          onContent: (P) => {
            A.isCurrent() && a(
              () => z((y) => y.map((I) => I.id === W ? { ...I, content: P || t("creationAi.planningShort"), status: "streaming" } : I))
            );
          },
          onCancelReady: (P) => i.getState().attachCancel(A.id, P)
        });
        if (!A.isCurrent()) return;
        z(
          (P) => P.map(
            (y) => y.id === W ? { ...y, content: K || t(ee ? "creationAi.revisionComplete" : "creationAi.planComplete"), status: "done" } : y
          )
        );
      } catch (K) {
        if (!A.isCurrent()) return;
        z(
          (P) => P.map(
            (y) => y.id === W ? { ...y, content: t("creationAi.planFailed", { message: K instanceof Error && K.message ? K.message : t("creationAi.unknownError") }), status: "error" } : y
          )
        );
      } finally {
        u(), i.getState().finish(A.id);
      }
    })();
  }, [u, X, a, C, $, D, z, i, t]), Ie = p.useCallback((s = t("creationAi.fixationCommand")) => {
    const N = (C || X).trim();
    if (!N) {
      D(t("creationAi.writeScriptFirst"));
      return;
    }
    z((O) => [
      ...O,
      { id: i.getState().nextMessageId("user"), role: "user", content: s },
      { id: i.getState().nextMessageId("assistant"), role: "assistant", content: t("creationAi.fixationStarted"), status: "done" }
    ]), $(""), D(""), Ee("generation"), window.setTimeout(() => {
      Xt({ storyText: N, source: "creation-ai-panel" });
    }, 60);
  }, [X, C, $, D, z, Ee, i, t]), be = p.useCallback(async (s) => {
    if (i.getState().sending) return;
    const N = (s ?? T).trim();
    if (b.some((A) => A.status === "uploading")) {
      D(t("creationAi.attachmentsUploading"));
      return;
    }
    const O = b.filter((A) => A.status === "ready" && A.url);
    if (!N && !C && !X && !O.length) return;
    if (k.getState().storyboardEditorOpen && N) {
      xe(N, N);
      return;
    }
    const Q = q.current.activeSkill || q.current.activeMode.id === "storyboard" ? null : on(N);
    if (Q) {
      const A = i.getState().nextMessageId("user"), K = i.getState().nextMessageId("assistant");
      z((P) => [
        ...P,
        { id: A, role: "user", content: N || t(Q === "storyboard" ? "creationAi.storyboardCommand" : "creationAi.fixationCommand") },
        { id: K, role: "assistant", content: "", status: "done", action: { kind: Q, prompt: N } }
      ]), $(""), D("");
      return;
    }
    const ee = hn({ mode: U, userRequest: N }), le = N || (O.length ? t("creationAi.attachmentPrompt") : t("creationAi.processDocument", { mode: t(`creationAi.mode.${U.id}.label`) })), te = O.map((A) => ({
      url: A.url,
      contentType: A.contentType,
      fileName: A.fileName,
      kind: A.kind
    })), fe = {
      id: i.getState().nextMessageId("user"),
      role: "user",
      content: le,
      ...O.length ? { attachments: O } : {}
    }, J = i.getState().nextMessageId("assistant");
    z((A) => [...A, fe, { id: J, role: "assistant", content: "", status: "pending" }]), $(""), pe(), D("");
    const W = i.getState().begin();
    try {
      const A = await Tt({
        prompt: ee,
        displayPrompt: le,
        ...te.length ? { attachments: te } : {},
        sessionKey: Me("creation"),
        projectId: Pt("projectId"),
        // 手动锁定的 active skill 优先（如「品牌宣传片」playbook）；否则回退创作模式推导。
        skillKey: q.current.activeSkill ? q.current.activeSkill.key : `workbench.creation.${q.current.activeMode.id}`,
        skillName: q.current.activeSkill ? q.current.activeSkill.name : t(`creationAi.mode.${q.current.activeMode.id}.title`),
        onContent: (y, I) => {
          W.isCurrent() && a(
            () => z((B) => B.map((Y) => Y.id === J ? { ...Y, content: I, status: "streaming" } : Y))
          );
        },
        onCancelReady: (y) => i.getState().attachCancel(W.id, y),
        onToolCall: (y) => {
          if (!W.isCurrent()) {
            y.confirm({ ok: !1, message: "creation turn abandoned" });
            return;
          }
          if (y.toolName === "read_full_text") {
            y.confirm({ ok: !0, result: { text: se.current?.readFullText() ?? "" } });
            return;
          }
          if (y.toolName === "read_selection") {
            y.confirm({ ok: !0, result: { text: se.current?.readSelectionText() ?? "" } });
            return;
          }
          if (y.toolName === "author_skill") {
            const I = y.args && typeof y.args == "object" ? y.args : {}, B = I.manifest, Y = typeof I.dirName == "string" && I.dirName.trim() ? I.dirName : "imported-skill", ce = typeof I.skillMarkdown == "string" ? I.skillMarkdown : "", wt = {
              version: "nomi-skill-v1",
              exportedAt: Date.now(),
              dirName: Y,
              files: { "SKILL.md": ce, "skill.json": JSON.stringify(B ?? {}, null, 2) }
            }, Nt = B && typeof B == "object" && Array.isArray(B.requiredProviders) ? B.requiredProviders : [];
            (async () => {
              const oe = await yo(wt);
              if (!oe.ok) {
                await y.confirm({ ok: !1, message: oe.error ?? t("creationAi.skillSaveFailed") });
                return;
              }
              try {
                const Ct = await qe(), Te = Ce({ neededProviders: Nt }, Ct);
                await y.confirm({ ok: !0, result: { saved: !0, skillName: oe.skillName, dirName: oe.dirName, missingProviders: Te.missing, satisfied: Te.satisfied } });
              } catch {
                await y.confirm({ ok: !0, result: { saved: !0, skillName: oe.skillName, dirName: oe.dirName } });
              }
            })();
            return;
          }
          if (Mt(y.toolName)) {
            if (!pn(U)) {
              y.confirm({ ok: !1, message: "chat-only mode does not write to the document" });
              return;
            }
            const I = y.args && typeof y.args == "object" ? y.args : {}, B = typeof I.content == "string" ? I.content : "";
            i.getState().addPendingToolCall({
              toolCallId: y.toolCallId,
              toolName: y.toolName,
              content: B,
              confirm: y.confirm
            });
            return;
          }
          y.confirm({ ok: !1, message: `unknown tool ${y.toolName}` });
        }
      });
      if (!W.isCurrent()) return;
      const K = !!A.raw?.cancelled, P = kn(A);
      if (K)
        z((y) => y.map((I) => I.id === J ? { ...I, content: P || t("creationAi.stopped"), status: "cancelled" } : I));
      else {
        const y = P || t("creationAi.emptyResponse"), B = A.finishReason === "length" && P.trim() !== "" ? t("creationAi.truncated", { text: y }) : y;
        z((Y) => Y.map((ce) => ce.id === J ? { ...ce, content: B, status: "done" } : ce));
      }
    } catch (A) {
      if (!W.isCurrent()) return;
      const K = A instanceof Error ? A.message : t("creationAi.callFailed");
      z((P) => P.map((y) => y.id === J ? { ...y, content: `${t("creationAi.errorPrefix")}${K}`, status: "error" } : y));
    } finally {
      u(), i.getState().finish(W.id);
    }
  }, [U, S, b, u, pe, X, T, xe, Ie, a, C, $, D, z, i, t]), vt = p.useMemo(() => [
    t("creationAi.suggestion.opening"),
    t("creationAi.suggestion.visual"),
    t("creationAi.suggestion.storyboard")
  ], [t]), jt = p.useCallback(() => {
    i.getState().abandon(), Rt("creation"), $(""), pe(), D(""), zt(Me("creation"));
  }, [pe, $, D, i]), _e = /* @__PURE__ */ e.jsxs(
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
      ...gt,
      children: [
        ut ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: l(
              "absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none",
              "rounded-nomi border-2 border-dashed border-nomi-accent bg-nomi-accent-soft",
              "text-body-sm font-semibold text-nomi-accent"
            ),
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ e.jsx(Pe, { size: 26, stroke: 1.5 }),
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
                /* @__PURE__ */ e.jsx(Ot, { size: 18 }),
                /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-semibold text-nomi-ink"), children: t("creationAi.title") })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: l("inline-flex items-center gap-2 ml-auto min-w-0"), children: [
                /* @__PURE__ */ e.jsx(an, { activeSkill: S, autoLabel: t(`creationAi.mode.${U.id}.title`), onSelect: H }),
                /* @__PURE__ */ e.jsx(
                  Qt,
                  {
                    area: "creation",
                    className: l("inline-flex items-center flex-nowrap gap-1"),
                    actionClassName: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    onNewConversation: jt
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  de,
                  {
                    className: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    label: t(j ? "creationAi.shrink" : "creationAi.expandConversation"),
                    "aria-label": t(j ? "creationAi.shrinkAria" : "creationAi.expandAria"),
                    onClick: () => w((s) => !s),
                    icon: j ? /* @__PURE__ */ e.jsx(uo, { size: 15 }) : /* @__PURE__ */ e.jsx(po, { size: 15 })
                  }
                ),
                o ? /* @__PURE__ */ e.jsx(
                  de,
                  {
                    className: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    label: t("creationAi.collapse"),
                    "aria-label": t("creationAi.collapseAria"),
                    onClick: o,
                    icon: /* @__PURE__ */ e.jsx(ke, { size: 15 })
                  }
                ) : null
              ] })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: l("[grid-area:tools] min-w-0"), children: [
          /* @__PURE__ */ e.jsx(eo, { refreshKey: c }),
          /* @__PURE__ */ e.jsx(fn, { busy: n, onRun: (s) => xe(t("creationAi.storyboardCommand"), void 0, s) })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            ref: v,
            className: l(
              "workbench-creation-ai__messages",
              "[grid-area:messages] min-h-0 overflow-auto",
              "flex flex-col gap-3"
            ),
            "aria-live": "polite",
            children: [
              R.length === 0 && r.length === 0 ? /* @__PURE__ */ e.jsxs("div", { className: l(
                "flex h-full flex-col items-center justify-center gap-2",
                "max-w-[240px] mx-auto py-6 px-3 text-center"
              ), children: [
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink font-nomi-display text-title font-medium"), children: t("creationAi.inspirationTitle") }),
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink-60 text-body-sm leading-relaxed"), children: t("creationAi.inspirationDescription") }),
                /* @__PURE__ */ e.jsx("div", { className: l("flex flex-col gap-1.5 w-full mt-2"), children: vt.map((s) => /* @__PURE__ */ e.jsxs(
                  L,
                  {
                    className: l(
                      "w-full min-h-9 py-2 px-3 border border-transparent rounded-nomi",
                      "flex items-center justify-between gap-2 text-left font-normal",
                      "bg-nomi-ink-05 text-nomi-ink-80 cursor-pointer",
                      "hover:border-nomi-line hover:bg-nomi-paper hover:text-nomi-ink"
                    ),
                    onClick: () => {
                      be(s);
                    },
                    children: [
                      /* @__PURE__ */ e.jsx("span", { className: l("min-w-0"), children: s }),
                      /* @__PURE__ */ e.jsx(to, { size: 13, className: l("shrink-0 text-nomi-ink-40") })
                    ]
                  },
                  s
                )) })
              ] }) : R.map((s) => /* @__PURE__ */ e.jsxs(p.Fragment, { children: [
                s.role === "user" ? /* @__PURE__ */ e.jsx(oo, { content: s.content, attachments: s.attachments }) : s.action ? /* @__PURE__ */ e.jsx(
                  Ye,
                  {
                    kind: s.action.kind,
                    resolved: me.has(s.id),
                    onRun: (N) => {
                      if (me.has(s.id)) return;
                      ue((ae) => new Set(ae).add(s.id));
                      const O = s.action.prompt;
                      s.action.kind === "storyboard" ? xe(O || t("creationAi.storyboardCommand"), void 0, N) : Ie(O || t("creationAi.fixationCommand"));
                    }
                  }
                ) : s.status === "error" && (E === !1 || F.has(s.id)) ? /* @__PURE__ */ e.jsx(
                  Yo,
                  {
                    onResolved: () => {
                      V((N) => new Set(N).add(s.id)), M();
                    }
                  }
                ) : s.status === "error" || s.content.startsWith(t("creationAi.errorPrefix")) ? (
                  // 缺大脑(上一分支)外的一般错误 → 红色错误卡(人话+重试/去模型接入),与生成侧同一张卡。
                  /* @__PURE__ */ e.jsx(
                    no,
                    {
                      error: s.content,
                      onRetry: () => {
                        const N = [...R].reverse().find((O) => O.role === "user");
                        N && be(N.content);
                      }
                    }
                  )
                ) : /* @__PURE__ */ e.jsx(
                  ro,
                  {
                    content: s.status === "pending" ? "" : s.content,
                    attachments: s.attachments,
                    streaming: s.status === "pending" || s.status === "streaming",
                    pendingLabel: s.status === "pending" ? s.content : void 0,
                    cancelled: s.status === "cancelled"
                  }
                ),
                s.id === x ? /* @__PURE__ */ e.jsx(io, {}) : null
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
                      yt(s.toolName),
                      t(gn(s.toolName))
                    ] }),
                    /* @__PURE__ */ e.jsx("div", { className: l("workbench-creation-ai__tool-call-body", "max-h-[160px] overflow-auto text-nomi-ink text-body-sm leading-[1.5] whitespace-pre-wrap"), children: s.content || t("creationAi.emptyContent") }),
                    /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center justify-end gap-2 mt-1"), children: [
                      /* @__PURE__ */ e.jsx(
                        L,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-nomi-ink-80 text-caption cursor-pointer hover:bg-nomi-ink-05"),
                          onClick: () => he(s.toolCallId, { ok: !1, message: "rejected by user" }),
                          children: t("creationAi.reject")
                        }
                      ),
                      /* @__PURE__ */ e.jsx(
                        L,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border-0 bg-nomi-ink text-nomi-paper text-caption cursor-pointer hover:bg-nomi-accent disabled:cursor-not-allowed disabled:opacity-45"),
                          "data-primary": "true",
                          disabled: !d,
                          onClick: () => kt(s),
                          children: t("creationAi.apply")
                        }
                      )
                    ] })
                  ]
                },
                s.toolCallId
              )) }) : null,
              /* @__PURE__ */ e.jsx(Zo, {})
            ]
          }
        ),
        G ? /* @__PURE__ */ e.jsx(
          "div",
          {
            className: l(
              "workbench-creation-ai__error",
              "[grid-area:error] py-2 px-3 min-w-0",
              "border-t border-[color-mix(in_srgb,var(--workbench-danger)_16%,transparent)]",
              "bg-workbench-danger-soft text-workbench-danger",
              "text-caption leading-[1.45]"
            ),
            children: G
          }
        ) : null,
        /* @__PURE__ */ e.jsxs("footer", { className: l("workbench-creation-ai__composer", "[grid-area:composer] min-w-0"), children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              ref: ht,
              type: "file",
              multiple: !0,
              accept: so,
              className: "hidden",
              "aria-hidden": "true",
              tabIndex: -1,
              onChange: xt
            }
          ),
          /* @__PURE__ */ e.jsx(ao, { attachments: b, onRemove: bt, className: l("mb-2") }),
          /* @__PURE__ */ e.jsx(
            ve,
            {
              className: l(
                // 与画布助手输入框同一套 Tailwind（不再走 workbench-ai.css 的 !important 覆写）。
                "min-h-14 px-2 py-2 rounded-nomi",
                "border border-nomi-line focus:border-nomi-accent",
                "bg-nomi-paper text-nomi-ink text-body-sm leading-[1.45]",
                "placeholder:text-nomi-ink-40"
              ),
              value: T,
              placeholder: t("creationAi.placeholder"),
              "aria-label": t("creationAi.inputAria"),
              "data-tour": "storyboard-cta",
              onChange: (s) => $(s.currentTarget.value),
              onKeyDown: (s) => lo(s, () => {
                be();
              }),
              onPaste: ft
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: l("workbench-creation-ai__actions", "flex items-center justify-between"), children: [
            /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-1.5 flex-1 min-w-0"), children: [
              /* @__PURE__ */ e.jsx(
                de,
                {
                  className: l(
                    "size-7 grid place-items-center shrink-0",
                    "border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                    "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                  ),
                  label: t("creationAi.addAttachment"),
                  "aria-label": t("creationAi.addAttachmentAria"),
                  onClick: pt,
                  icon: /* @__PURE__ */ e.jsx(Pe, { size: 16 })
                }
              ),
              /* @__PURE__ */ e.jsx(
                Z,
                {
                  ariaLabel: t("creationAi.modeAria"),
                  leadingLabel: t("creationAi.modeLeading"),
                  size: "sm",
                  title: t(`creationAi.mode.${U.id}.description`),
                  value: U.id,
                  options: Ae.map((s) => ({ value: s.id, label: t(`creationAi.mode.${s.id}.short`) })),
                  onChange: (s) => dt(s)
                }
              ),
              /* @__PURE__ */ e.jsx(co, {})
            ] }),
            n ? /* @__PURE__ */ e.jsx(
              de,
              {
                className: l(
                  "size-7 grid place-items-center shrink-0",
                  "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                  "hover:enabled:bg-nomi-accent"
                ),
                label: t("creationAi.stop"),
                "aria-label": t("creationAi.stopAria"),
                onClick: () => i.getState().requestUserCancel(),
                icon: /* @__PURE__ */ e.jsx(xo, { size: 13 })
              }
            ) : /* @__PURE__ */ e.jsx(
              de,
              {
                className: l(
                  "size-7 grid place-items-center shrink-0",
                  "border-0 rounded-full bg-nomi-ink text-nomi-paper cursor-pointer",
                  "hover:enabled:bg-nomi-accent",
                  "disabled:bg-nomi-ink-20 disabled:text-nomi-ink-40 disabled:cursor-not-allowed"
                ),
                label: t("creationAi.send"),
                "aria-label": t("creationAi.sendAria"),
                disabled: !T.trim(),
                onClick: () => {
                  be();
                },
                icon: /* @__PURE__ */ e.jsx(mo, { size: 15 })
              }
            )
          ] })
        ] })
      ]
    }
  );
  return !j || typeof document > "u" ? _e : Dt.createPortal(
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: l("workbench-shell", "fixed inset-0 z-[200] grid place-items-center bg-[var(--workbench-backdrop)] p-4"),
        onClick: (s) => {
          s.target === s.currentTarget && w(!1);
        },
        children: _e
      }
    ),
    document.body
  );
}
function vn(o) {
  const t = typeof o.selectedText == "string" ? o.selectedText.trim() : "";
  if (!t) return !1;
  const n = Kt.t(
    o.kind === "image" ? "runtime.nodeRegistry.image.title" : "runtime.nodeRegistry.video.title"
  );
  return o.addGenerationNode({
    kind: o.kind,
    title: n,
    prompt: t,
    position: o.position
  }), o.setWorkspaceMode("generation"), !0;
}
const De = 210, Ke = 40, Le = 10;
function jn(o, t) {
  if (!t) return null;
  const { from: n, to: r, empty: i } = o.state.selection;
  if (i || n === r) return null;
  const a = o.view.coordsAtPos(n), u = o.view.coordsAtPos(r), c = t.getBoundingClientRect(), f = Math.min(a.left, u.left), m = Math.max(a.right, u.right), j = Math.min(a.top, u.top), w = Math.max(a.bottom, u.bottom), v = f + (m - f) / 2 - c.left - De / 2, g = Math.max(12, Math.min(v, Math.max(12, c.width - De - 12))), d = j - c.top - Ke - Le;
  return d >= 8 ? { left: g, top: d, placement: "top" } : {
    left: g,
    top: Math.min(w - c.top + Le, Math.max(8, c.height - Ke - 8)),
    placement: "bottom"
  };
}
function wn({
  editor: o,
  selectedText: t,
  selectionVersion: n,
  onCreated: r
}) {
  const { t: i } = _(), a = t.trim(), u = p.useRef(null), [c, f] = p.useState(null), m = He((d) => d.addNode), j = k((d) => d.setWorkspaceMode), w = p.useCallback(() => {
    if (!o || !a) {
      f(null);
      return;
    }
    const d = u.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor");
    f(jn(o, d));
  }, [o, a]);
  if (p.useLayoutEffect(() => {
    w();
  }, [n, w]), p.useEffect(() => {
    if (!o || !a) return;
    const C = (u.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor"))?.querySelector(".workbench-editor__scroll"), h = () => window.requestAnimationFrame(w), S = () => {
      h();
    }, H = () => {
      h();
    };
    return C?.addEventListener("scroll", S, { passive: !0 }), window.addEventListener("resize", H), () => {
      C?.removeEventListener("scroll", S), window.removeEventListener("resize", H);
    };
  }, [o, a, w]), !a || !o || !c) return null;
  const v = (d) => {
    vn({ selectedText: a, kind: d, addGenerationNode: m, setWorkspaceMode: j }) && r?.();
  }, g = [
    {
      id: "bold",
      label: i("creationAi.selection.bold"),
      icon: /* @__PURE__ */ e.jsx(Co, { size: 14 }),
      active: o.isActive("bold"),
      onClick: () => o.chain().focus().toggleBold().run()
    },
    {
      id: "italic",
      label: i("creationAi.selection.italic"),
      icon: /* @__PURE__ */ e.jsx(Ao, { size: 14 }),
      active: o.isActive("italic"),
      onClick: () => o.chain().focus().toggleItalic().run()
    },
    {
      id: "h1",
      label: i("creationAi.selection.heading1"),
      icon: /* @__PURE__ */ e.jsx(So, { size: 15 }),
      active: o.isActive("heading", { level: 1 }),
      onClick: () => o.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      id: "h2",
      label: i("creationAi.selection.heading2"),
      icon: /* @__PURE__ */ e.jsx(Eo, { size: 15 }),
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
              ge,
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
                onMouseDown: (C) => C.preventDefault(),
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
                ge,
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
                  onClick: () => v("image"),
                  icon: /* @__PURE__ */ e.jsx(Se, { size: 14 })
                }
              ),
              /* @__PURE__ */ e.jsx(
                ge,
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
                  onClick: () => v("video"),
                  icon: /* @__PURE__ */ e.jsx(To, { size: 14 })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const Nn = [
  ["bold", "italic"],
  ["h1", "h2"],
  ["bullet-list", "ordered-list", "blockquote"]
], Cn = ["undo", "redo"];
function Fe({ action: o }) {
  return /* @__PURE__ */ e.jsx(
    ge,
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
function An() {
  return /* @__PURE__ */ e.jsx("div", { className: "w-px h-[18px] bg-workbench-border mx-1", "aria-hidden": "true" });
}
function Sn({ editor: o }) {
  const { t } = _(), n = _o(o);
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
  const r = new Map(n.map((c) => [c.id, c])), i = (c) => c.map((f) => r.get(f)).filter((f) => !!f), a = Nn.map(i).filter((c) => c.length > 0), u = i(Cn);
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
          f > 0 ? /* @__PURE__ */ e.jsx(An, {}) : null,
          c.map((m) => /* @__PURE__ */ e.jsx(Fe, { action: m }, m.id))
        ] }, c[0]?.id ?? f)),
        /* @__PURE__ */ e.jsx("div", { className: "flex-1", "aria-hidden": "true" }),
        u.map((c) => /* @__PURE__ */ e.jsx(Fe, { action: c }, c.id))
      ]
    }
  );
}
function En() {
  const { t: o } = _(), t = k((h) => h.workbenchDocument), n = k((h) => h.setWorkbenchDocument), r = k((h) => h.setCreationDocumentTools), i = k((h) => h.setCreationSelectionText), [a, u] = p.useState({ text: "", version: 0 }), c = tt("workbench-scrollbar-visible"), f = p.useRef(t);
  p.useEffect(() => {
    f.current = t;
  }, [t]);
  const m = p.useMemo(
    () => Lt(t.contentJson),
    [t.contentJson]
  ), j = p.useCallback(
    (h) => {
      n({ ...f.current, contentJson: h, updatedAt: Date.now() });
    },
    [n]
  ), w = p.useCallback(
    (h) => {
      u((S) => !S.text && !h.trim() ? S : { text: h, version: S.version + 1 }), i(h);
    },
    [i]
  ), v = p.useCallback(() => {
    u((h) => ({ text: "", version: h.version + 1 })), i("");
  }, [i]), { editor: g, tools: d } = Io({
    content: m,
    placeholder: o("creationAi.editor.placeholder"),
    onChange: j,
    onSelectionChange: w
  }), C = p.useRef(null);
  return p.useEffect(() => {
    if (!g) return;
    const h = {
      readFullText: d.readFullText,
      readSelectionText: d.readSelectionText,
      insertAtCursor: d.insertAtCursor,
      replaceSelection: d.replaceSelection,
      appendToEnd: d.appendToEnd
    };
    return r(h), C.current = h, () => {
      C.current === h && (r(null), C.current = null);
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
        /* @__PURE__ */ e.jsx(Sn, { editor: g }),
        /* @__PURE__ */ e.jsx(
          wn,
          {
            editor: g,
            selectedText: a.text,
            selectionVersion: a.version,
            onCreated: v
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
            children: /* @__PURE__ */ e.jsx(No, { editor: g })
          }
        )
      ]
    }
  );
}
const In = ["character", "scene", "prop", "style"], _n = [4, 5, 6, 8, 10, 12, 15];
function ot(o) {
  return o === "style" ? "text" : "visual";
}
function nt(o) {
  return o === "style" ? "all" : "selective";
}
function Tn(o) {
  const t = new Set(o.anchors.map((r) => r.id));
  let n = o.anchors.length + 1;
  for (; t.has(`anchor-${n}`); ) n += 1;
  return `anchor-${n}`;
}
function Mn(o, t) {
  return { ...o, title: t };
}
function Pn(o, t = "character") {
  const n = {
    id: Tn(o),
    kind: t,
    name: "",
    description: "",
    carrier: ot(t),
    scope: nt(t)
  };
  return { ...o, anchors: [...o.anchors, n] };
}
function rt(o, t, n) {
  return { ...o, anchors: o.anchors.map((r) => r.id === t ? { ...r, ...n } : r) };
}
function Rn(o, t, n) {
  return rt(o, t, { kind: n, carrier: ot(n), scope: nt(n) });
}
function zn(o, t) {
  return { ...o, anchors: o.anchors.filter((n) => n.id !== t) };
}
function it(o) {
  return o.map((t, n) => t.index === n + 1 ? t : { ...t, index: n + 1 });
}
function On(o) {
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
function st(o, t, n) {
  return { ...o, shots: o.shots.map((r, i) => i === t ? { ...r, ...n } : r) };
}
function Dn(o, t) {
  return { ...o, shots: it(o.shots.filter((n, r) => r !== t)) };
}
function Kn(o, t, n) {
  if (t === n || t < 0 || n < 0 || t >= o.shots.length || n >= o.shots.length) return o;
  const r = [...o.shots], [i] = r.splice(t, 1);
  return r.splice(n, 0, i), { ...o, shots: it(r) };
}
function Ln(o, t, n) {
  const r = o.shots[t];
  if (!r) return o;
  const a = r.anchorIds.includes(n) ? r.anchorIds.filter((u) => u !== n) : [...r.anchorIds, n];
  return st(o, t, { anchorIds: a });
}
function Fn(o) {
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
function Wn(o, t) {
  const n = new Set(o.anchors.map((r) => r.id));
  return t.anchorIds.filter((r) => !n.has(r));
}
const We = {
  character: Fo,
  scene: Se,
  prop: zo,
  style: Ko
};
function Bn({ anchor: o, onUpdate: t, onChangeKind: n, onRemove: r, nameInvalid: i }) {
  const { t: a } = _(), [u, c] = p.useState(() => !o.description.trim()), [f, m] = p.useState(!1), j = We[o.kind], w = o.description.trim();
  return /* @__PURE__ */ e.jsxs("div", { className: "px-2.5 py-2", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.typeAria", { type: a(`storyboardEditor.anchor.kind.${o.kind}`) }),
          title: a("storyboardEditor.anchor.switchType"),
          onClick: () => m((v) => !v),
          className: "shrink-0 size-[22px] grid place-items-center rounded-nomi-sm bg-nomi-ink-05 text-nomi-ink-60 hover:bg-nomi-ink-10 hover:text-nomi-ink-80",
          children: /* @__PURE__ */ e.jsx(j, { size: 13, stroke: 1.6 })
        }
      ),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          value: o.name,
          onChange: (v) => t({ name: v.target.value }),
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
          children: w || a("storyboardEditor.anchor.addDescription")
        }
      ),
      /* @__PURE__ */ e.jsx(Hn, { value: o.carrier, onChange: (v) => t({ carrier: v }) }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.delete"),
          onClick: r,
          className: "shrink-0 size-7 grid place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
          children: /* @__PURE__ */ e.jsx(Ve, { size: 15, stroke: 1.6 })
        }
      )
    ] }),
    f ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-2 pl-[32px]", children: In.map((v) => {
      const g = We[v], d = v === o.kind;
      return /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            n(v), m(!1);
          },
          className: l(
            "h-6 px-2 rounded-full text-caption inline-flex items-center gap-1",
            d ? "bg-nomi-accent-soft text-nomi-accent" : "border border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
          ),
          children: [
            /* @__PURE__ */ e.jsx(g, { size: 12, stroke: 1.8 }),
            a(`storyboardEditor.anchor.kind.${v}`)
          ]
        },
        v
      );
    }) }) : null,
    u ? /* @__PURE__ */ e.jsxs("div", { className: "mt-1.5 pl-[32px]", children: [
      /* @__PURE__ */ e.jsx(
        ve,
        {
          value: o.description,
          onChange: (v) => t({ description: v.target.value }),
          "aria-label": a("storyboardEditor.anchor.descriptionAria"),
          autoFocus: !w,
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
            /* @__PURE__ */ e.jsx(Je, { size: 12, stroke: 1.8 })
          ]
        }
      ) })
    ] }) : null
  ] });
}
function Hn({ value: o, onChange: t }) {
  const { t: n } = _(), r = o === "visual";
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
        r ? /* @__PURE__ */ e.jsx(Oo, { size: 13, stroke: 1.7 }) : /* @__PURE__ */ e.jsx(Do, { size: 13, stroke: 1.7 }),
        n(r ? "storyboardEditor.anchor.visual" : "storyboardEditor.anchor.text")
      ]
    }
  );
}
function Vn(o) {
  const t = o.filter((a) => a.key !== "duration"), n = t.filter((a) => a.type === "select").slice(0, 2), r = new Set(n.map((a) => a.key)), i = t.filter((a) => !r.has(a.key));
  return { inline: n, drawer: i };
}
function at(o, t) {
  if (!o) return null;
  const n = Ft({
    modelKey: o.modelKey || o.value,
    modelAlias: o.modelAlias,
    vendorKey: o.vendor,
    meta: o.meta
  });
  if (!n) return null;
  const r = n.modes, i = r.find((f) => f.id === t) ?? r.find((f) => f.id === n.defaultModeId) ?? r[0];
  if (!i) return null;
  const { inline: a, drawer: u } = Vn(i.params), c = u.length > 0 || r.length > 1;
  return { modes: r, mode: i, inline: a, drawer: u, hasDrawer: c };
}
function lt(o, t) {
  return { valueOf: (i) => {
    const a = o[i.key];
    return a != null ? String(a) : i.defaultValue !== void 0 ? String(i.defaultValue) : "";
  }, setParam: (i, a) => {
    const u = i.type === "number" ? Number(a) : i.type === "boolean" ? !!a : a;
    t({ params: { ...o, [i.key]: u } });
  } };
}
function ct({
  control: o,
  params: t,
  onUpdate: n
}) {
  const { valueOf: r, setParam: i } = lt(t, n);
  return /* @__PURE__ */ e.jsx(
    Z,
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
function $n({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  open: i,
  onToggleOpen: a
}) {
  const { t: u } = _(), c = at(o, t);
  if (!c) return null;
  const { inline: f, hasDrawer: m } = c;
  return f.length === 0 && !m ? null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    f.map((j) => /* @__PURE__ */ e.jsx(ct, { control: j, params: n, onUpdate: r }, j.key)),
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
          /* @__PURE__ */ e.jsx(Lo, { size: 12, stroke: 1.8, "aria-hidden": !0 }),
          u("storyboardEditor.shotParams.parameters"),
          i ? /* @__PURE__ */ e.jsx(Je, { size: 12, stroke: 1.8, "aria-hidden": !0 }) : /* @__PURE__ */ e.jsx(Ue, { size: 12, stroke: 1.8, "aria-hidden": !0 })
        ]
      }
    ) : null
  ] });
}
function Un({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  onApplyToAll: i
}) {
  const { t: a } = _(), { valueOf: u, setParam: c } = lt(n, r), f = at(o, t);
  if (!f) return null;
  const { modes: m, mode: j, drawer: w, hasDrawer: v } = f;
  return v ? /* @__PURE__ */ e.jsxs("div", { className: "w-full mt-2 p-2.5 rounded-nomi-sm bg-nomi-ink-05 flex flex-col gap-2", children: [
    m.length > 1 ? /* @__PURE__ */ e.jsx(
      Z,
      {
        ariaLabel: a("storyboardEditor.shotParams.mode"),
        leadingLabel: a("storyboardEditor.shotParams.mode"),
        size: "xs",
        value: j.id,
        options: m.map((g) => ({ value: g.id, label: g.vendorTerm || g.id })),
        onChange: (g) => r({ modeId: g })
      }
    ) : null,
    w.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: w.map((g) => g.type === "select" ? /* @__PURE__ */ e.jsx(ct, { control: g, params: n, onUpdate: r }, g.key) : g.type === "boolean" ? /* @__PURE__ */ e.jsxs("label", { className: "inline-flex items-center gap-1.5 text-caption text-nomi-ink-60", children: [
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
function qn(o) {
  const { t } = _(), { shot: n, anchors: r, modelOptions: i, danglingIds: a, onUpdate: u, onToggleAnchor: c, onRemove: f, promptInvalid: m, onApplyParamsToAll: j } = o, [w, v] = p.useState(!1), [g, d] = p.useState(!1), C = new Map(r.map((b) => [b.id, b])), h = n.anchorIds.filter((b) => C.has(b)), S = r.filter((b) => !n.anchorIds.includes(b.id)), T = (n.shotKind ?? "video") === "image", R = T ? "image" : n.keyframe?.enabled === !0 ? "image-video" : "video", x = (b) => {
    b !== R && u(b === "image" ? { shotKind: "image", keyframe: void 0, modelKey: void 0, modeId: void 0, params: void 0 } : b === "image-video" ? {
      shotKind: "video",
      durationSec: n.durationSec > 0 ? n.durationSec : 5,
      keyframe: { ...n.keyframe || {}, enabled: !0, prompt: n.keyframe?.prompt || "" },
      modelKey: void 0,
      modeId: void 0,
      params: void 0
    } : { shotKind: "video", keyframe: void 0, durationSec: n.durationSec > 0 ? n.durationSec : 5, modelKey: void 0, modeId: void 0, params: void 0 });
  }, E = [.../* @__PURE__ */ new Set([..._n, n.durationSec])].filter((b) => Number.isFinite(b) && b > 0).sort((b, G) => b - G).map((b) => ({ value: String(b), label: t("storyboardEditor.second", { count: b }) })), M = p.useCallback(
    (b) => u({ modelKey: b || void 0, modeId: void 0, params: void 0 }),
    [u]
  ), F = Mo(i ?? [], n.modelKey ?? "", M), V = i && i.length > 0 ? [{ value: "", label: t("storyboardEditor.defaultModel") }, ...F.modelOptions] : null, me = (b) => b ? F.onModelPick(b) : M(""), ue = i?.find((b) => b.value === n.modelKey) ?? null;
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
            /* @__PURE__ */ e.jsx("span", { className: "shrink-0 cursor-grab text-nomi-ink-20 active:cursor-grabbing", "aria-hidden": !0, children: /* @__PURE__ */ e.jsx(go, { size: 15, stroke: 1.6 }) }),
            /* @__PURE__ */ e.jsx("span", { className: "text-title font-semibold text-nomi-ink tabular-nums mr-0.5", children: t("storyboardEditor.shotNumber", { index: n.index }) }),
            /* @__PURE__ */ e.jsx(
              Z,
              {
                ariaLabel: t("storyboardEditor.shotType"),
                leadingLabel: t("storyboardEditor.type"),
                size: "xs",
                value: R,
                options: [
                  { value: "image", label: t("storyboardEditor.image") },
                  { value: "video", label: t("storyboardEditor.video") },
                  { value: "image-video", label: t("storyboardEditor.imageVideo") }
                ],
                onChange: x
              }
            ),
            T ? null : /* @__PURE__ */ e.jsx(
              Z,
              {
                ariaLabel: t("storyboardEditor.duration"),
                leadingLabel: t("storyboardEditor.duration"),
                size: "xs",
                value: String(n.durationSec),
                options: E,
                onChange: (b) => u({ durationSec: Number(b) })
              }
            ),
            V ? /* @__PURE__ */ e.jsx(
              Z,
              {
                ariaLabel: t(T ? "storyboardEditor.imageModel" : "storyboardEditor.videoModel"),
                leadingLabel: t("storyboardEditor.model"),
                size: "xs",
                triggerMaxWidth: 150,
                value: n.modelKey ? F.modelValue : "",
                options: V,
                onChange: me
              }
            ) : null,
            F.providerOptions.length > 1 ? /* @__PURE__ */ e.jsx(
              Z,
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
              $n,
              {
                modelOption: ue,
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
              children: /* @__PURE__ */ e.jsx(Ve, { size: 14, stroke: 1.6 })
            }
          )
        ] }),
        g ? /* @__PURE__ */ e.jsx(
          Un,
          {
            modelOption: ue,
            modeId: n.modeId,
            params: n.params || {},
            onUpdate: (b) => u(b),
            ...j ? { onApplyToAll: j } : {}
          }
        ) : null,
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mt-2.5", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40 mr-0.5", children: t("storyboardEditor.reference") }),
          h.map((b) => {
            const G = C.get(b);
            return /* @__PURE__ */ e.jsxs(
              "span",
              {
                className: "h-6 pl-2.5 pr-1 rounded-full bg-nomi-ink-05 text-nomi-ink-80 text-caption inline-flex items-center gap-1",
                children: [
                  G.name || t("storyboardEditor.unnamed"),
                  /* @__PURE__ */ e.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": t("storyboardEditor.removeReference", { name: G.name || t("storyboardEditor.thisAnchor") }),
                      title: t("storyboardEditor.removeReference", { name: G.name || t("storyboardEditor.thisAnchor") }),
                      onClick: () => c(b),
                      className: "grid place-items-center size-4 rounded-full text-nomi-ink-40 hover:bg-nomi-ink-20 hover:text-nomi-ink-80",
                      children: /* @__PURE__ */ e.jsx(ke, { size: 11, stroke: 1.8, "aria-hidden": !0 })
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
                /* @__PURE__ */ e.jsx(ke, { size: 12, stroke: 1.8 })
              ]
            },
            b
          )),
          S.length > 0 && /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => v((b) => !b),
              "aria-expanded": w,
              className: "h-6 px-2.5 rounded-full border border-dashed border-nomi-ink-20 text-nomi-ink-60 text-caption inline-flex items-center gap-1 hover:text-nomi-ink-80",
              children: [
                /* @__PURE__ */ e.jsx(Ne, { size: 12, stroke: 1.8 }),
                t("storyboardEditor.reference")
              ]
            }
          )
        ] }),
        w && S.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-1.5 pl-7", children: S.map((b) => /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              c(b.id), S.length === 1 && v(!1);
            },
            className: "h-6 px-2.5 rounded-full border border-nomi-line text-nomi-ink-60 text-caption inline-flex items-center hover:border-nomi-ink-20 hover:text-nomi-ink-80",
            children: b.name || t("storyboardEditor.unnamed")
          },
          b.id
        )) }),
        a.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "text-micro text-workbench-danger mt-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ e.jsx(ye, { size: 12, stroke: 1.8 }),
          t("storyboardEditor.danglingWarning")
        ] }),
        R === "image-video" ? /* @__PURE__ */ e.jsxs("div", { className: "mt-2.5", children: [
          /* @__PURE__ */ e.jsx("div", { className: "mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.keyframePrompt") }),
          /* @__PURE__ */ e.jsx(
            ve,
            {
              value: n.keyframe?.prompt || "",
              onChange: (b) => u({ keyframe: { ...n.keyframe || {}, enabled: !0, prompt: b.target.value } }),
              "aria-label": t("storyboardEditor.keyframePromptAria", { index: n.index }),
              placeholder: t("storyboardEditor.keyframePromptPlaceholder"),
              className: "px-2 py-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-body-sm text-nomi-ink-80 leading-normal focus:border-nomi-accent"
            }
          )
        ] }) : null,
        R === "image-video" ? /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.videoPrompt") }) : null,
        /* @__PURE__ */ e.jsx(
          ve,
          {
            value: n.prompt,
            onChange: (b) => u({ prompt: b.target.value }),
            "aria-label": t("storyboardEditor.promptAria", { index: n.index }),
            placeholder: t(T ? "storyboardEditor.imagePromptPlaceholder" : "storyboardEditor.videoPromptPlaceholder"),
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
function Gn() {
  const { t: o } = _(), t = k((x) => x.storyboardPlan), n = k((x) => x.setStoryboardPlan), r = k((x) => x.commitStoryboardPlan), i = k((x) => x.discardStoryboardPlan), a = k((x) => x.setWorkspaceMode), u = k((x) => x.requestCanvasFit), [c, f] = p.useState(null), [m, j] = p.useState(null), [w, v] = p.useState(!1), g = Oe("video").options, d = Oe("image").options, C = (x) => {
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
  const h = Fn(t), S = new Set(h.filter((x) => x.kind === "empty-shot-prompt").map((x) => x.shotIndex)), H = new Set(h.filter((x) => x.kind === "anchor-no-name").map((x) => x.anchorId)), T = async () => {
    await Be({
      title: o("storyboardEditor.discardTitle"),
      message: o("storyboardEditor.discardMessage"),
      confirmLabel: o("storyboardEditor.discard"),
      danger: !0
    }) && i();
  }, R = async () => {
    if (!(h.length > 0 || w)) {
      v(!0);
      try {
        const [x, E] = await Promise.all([
          jo(),
          wo()
        ]), M = Wt(t, {
          ...x.modelKey ? { defaultImageModelKey: x.modelKey } : {},
          ...x.modeId ? { defaultImageModeId: x.modeId } : {},
          ...x.refModeId ? { defaultImageRefModeId: x.refModeId } : {},
          ...E.modelKey ? { defaultVideoModelKey: E.modelKey } : {},
          ...E.modeId ? { defaultVideoModeId: E.modeId } : {}
        });
        await Ge("create_canvas_nodes", M), r(), Ro([
          {
            kind: "storyboard",
            title: t.title,
            prompt: JSON.stringify(t)
          },
          ...t.shots.map((V) => ({
            kind: V.shotKind === "video" ? "video_prompt" : "image_prompt",
            title: `${t.title} · 镜头 ${V.index}`,
            prompt: V.prompt
          }))
        ]).catch(() => {
        }), a("generation"), u();
        const F = M.nodes.map((V) => Bt(V.clientId));
        F.length > 1 && He.getState().selectNodes(F);
      } catch (x) {
        await Ht({
          title: o("storyboardEditor.landFailed"),
          message: x instanceof Error && x.message ? x.message : o("storyboardEditor.unknownRetry")
        });
      } finally {
        v(!1);
      }
    }
  };
  return /* @__PURE__ */ e.jsxs("section", { className: "relative w-full h-full min-h-0 grid grid-rows-[auto_auto_minmax(0,1fr)_auto] border border-workbench-border rounded-workbench bg-workbench-surface-solid shadow-workbench-md overflow-hidden", children: [
    /* @__PURE__ */ e.jsxs("header", { className: "flex items-center justify-between gap-3 h-12 px-4 border-b border-nomi-line", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ e.jsx(ie, { size: 16, stroke: 1.5, className: "text-nomi-ink-60 shrink-0" }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            value: t.title,
            onChange: (x) => n(Mn(t, x.target.value)),
            "aria-label": o("storyboardEditor.titleAria"),
            placeholder: o("storyboardEditor.titlePlaceholder"),
            className: "min-w-0 max-w-[260px] text-title font-medium text-nomi-ink bg-transparent outline-none focus:bg-nomi-ink-05 rounded-nomi-sm px-1"
          }
        ),
        /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-micro text-nomi-ink-40 bg-nomi-ink-05 px-2 py-0.5 rounded-full", children: o("storyboardEditor.shotCount", { count: t.shots.length }) })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ e.jsx(
        L,
        {
          variant: "default",
          size: "sm",
          onClick: T,
          children: o("storyboardEditor.discardPlan")
        }
      ) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 px-4 py-1.5 border-b border-nomi-line-soft text-caption text-nomi-ink-40", children: [
      /* @__PURE__ */ e.jsx(Po, { size: 14, stroke: 1.6, className: "shrink-0" }),
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
            Bn,
            {
              anchor: x,
              nameInvalid: H.has(x.id),
              onUpdate: (E) => n(rt(t, x.id, E)),
              onChangeKind: (E) => n(Rn(t, x.id, E)),
              onRemove: () => n(zn(t, x.id))
            },
            x.id
          )),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => n(Pn(t)),
              className: "w-full flex items-center gap-1.5 px-2.5 py-2 bg-nomi-ink-05 text-caption text-nomi-ink-40 hover:text-nomi-ink-60 hover:bg-nomi-ink-10",
              children: [
                /* @__PURE__ */ e.jsx(Ne, { size: 13, stroke: 1.8 }),
                o("storyboardEditor.addAnchor")
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { children: [
        /* @__PURE__ */ e.jsx("div", { className: "text-body-sm font-medium text-nomi-ink-80 mb-2", children: o("storyboardEditor.storyboardHeading", { count: t.shots.length }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2", children: [
          t.shots.map((x, E) => /* @__PURE__ */ e.jsx(
            qn,
            {
              shot: x,
              anchors: t.anchors,
              modelOptions: x.shotKind === "image" ? d : g,
              danglingIds: Wn(t, x),
              promptInvalid: S.has(x.index),
              draggable: !0,
              isDragOver: m === E && c !== null && c !== E,
              onDragStart: () => f(E),
              onDragOver: (M) => {
                M.preventDefault(), j(E);
              },
              onDrop: () => {
                c !== null && c !== E && n(Kn(t, c, E)), f(null), j(null);
              },
              onDragEnd: () => {
                f(null), j(null);
              },
              onUpdate: (M) => n(st(t, E, M)),
              onToggleAnchor: (M) => n(Ln(t, E, M)),
              onRemove: () => n(Dn(t, E)),
              onApplyParamsToAll: () => n({
                ...t,
                shots: t.shots.map((M) => ({ ...M, modelKey: x.modelKey, modeId: x.modeId, params: x.params }))
              })
            },
            x.index
          )),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => n(On(t)),
              className: "self-start h-6 px-2.5 rounded-full border border-dashed border-nomi-ink-20 text-caption text-nomi-ink-60 inline-flex items-center gap-1 hover:text-nomi-ink-80",
              children: [
                /* @__PURE__ */ e.jsx(Ne, { size: 13, stroke: 1.8 }),
                o("storyboardEditor.addShot")
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("footer", { className: "flex items-center justify-between gap-3 px-4 py-2.5 border-t border-nomi-line bg-nomi-paper", children: [
      h.length > 0 ? /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-danger inline-flex items-center gap-[5px] min-w-0", children: [
        /* @__PURE__ */ e.jsx(ye, { size: 14, stroke: 1.8, className: "shrink-0" }),
        /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o("storyboardEditor.issuesSummary", { count: h.length, issue: C(h[0]) }) })
      ] }) : /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-success inline-flex items-center gap-[5px]", children: [
        /* @__PURE__ */ e.jsx(re, { size: 14, stroke: 1.8 }),
        o("storyboardEditor.readySummary", { anchors: t.anchors.length, shots: t.shots.length })
      ] }),
      /* @__PURE__ */ e.jsxs(
        L,
        {
          variant: "primary",
          onClick: R,
          disabled: h.length > 0 || w,
          children: [
            /* @__PURE__ */ e.jsx(re, { size: 15, stroke: 1.8 }),
            o(w ? "storyboardEditor.landing" : "storyboardEditor.confirmLanding")
          ]
        }
      )
    ] })
  ] });
}
function vr() {
  const { t: o } = _(), t = k((m) => m.creationAiCollapsed), n = k((m) => m.setCreationAiCollapsed), r = k((m) => m.creationAssistantAutoOpen), i = k((m) => m.setCreationAssistantAutoOpen), a = k((m) => m.storyboardPlan), u = k((m) => m.storyboardPlanCommitted), c = k((m) => m.storyboardEditorOpen), f = k((m) => m.setStoryboardEditorOpen);
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
          /* @__PURE__ */ e.jsx("div", { className: "min-h-0 flex-1", "data-creation-surface": c ? "storyboard" : "source", children: c ? /* @__PURE__ */ e.jsx(Gn, {}) : /* @__PURE__ */ e.jsx(En, {}) })
        ] }),
        t ? /* @__PURE__ */ e.jsx(
          L,
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
            children: /* @__PURE__ */ e.jsx(Vt, { markSize: 18, wordSize: 13, suffix: o("creationAi.workspace.assistantSuffix") })
          }
        ) : /* @__PURE__ */ e.jsx(yn, { onCollapse: () => n(!0) })
      ]
    }
  );
}
export {
  vr as default
};
