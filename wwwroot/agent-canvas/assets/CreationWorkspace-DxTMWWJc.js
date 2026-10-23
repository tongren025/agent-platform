import { aT as je, e6 as P, S as h, dO as Pt, ci as e, l as ce, aL as l, a8 as F, cn as Mt, co as Rt, e7 as k, o as de, aP as Ye, x as ye, p as Te, u as zt, I as ve, cS as le, dQ as Se, dX as Dt, dm as Kt, ch as Ot, cY as Lt, ed as ze, dA as Ft, aG as Wt, K as Bt, a9 as pe, cR as Ht, ds as De, c3 as Vt, dW as Xe, cB as Ut, w as Ze, d8 as Gt, s as Ee, dB as $t, d9 as qt, ae as Jt, N as Yt } from "./agentStudioMount-CnF6gUyG.js";
import { N as Xt, e as Zt, s as Qt, k as eo, j as to, m as oo, u as no, r as ro, g as Ke, W as io, M as so, I as ao, U as lo, A as co, a as mo, S as uo, C as po, c as ho, d as we, l as xo, b as bo, h as fo } from "./useComposerAttachments-BQOLNYvr.js";
import { a as go, I as ko } from "./IconMinimize-Do8qreFd.js";
import { a as yo, I as vo } from "./IconSettings-CSeOp6oK.js";
import { N as te } from "./NomiSelect-BiogPU6p.js";
import { I as Oe } from "./IconBulb-DyS7I3r4.js";
import { I as Qe } from "./IconArrowRight-C-3QiUlA.js";
import { I as wo } from "./IconStack2-DQhcVido.js";
import { a as jo, I as No } from "./IconPhotoPlus-BwYC1gXW.js";
import { I as et } from "./IconChevronRight-DCt05yYU.js";
import { I as Le } from "./IconWand-DpnK9P1R.js";
import { l as Co, g as tt, s as Ie, i as Ao } from "./skillApi-cuPEAJ5r.js";
import { g as So } from "./generationCanvasTools-izM_aYuS.js";
import { a as ot, c as Eo, d as Io } from "./applyCanvasToolCall-BMis8IrC.js";
import { e as nt, g as Fe, b as To, m as _o, C as Po, S as We, h as Mo, c as Ro } from "./WorkbenchShell-CEgOamGL.js";
import { a as Be, b as He } from "./guidedProductionEvents-YDIMkHsY.js";
import { E as zo } from "./index-CiuTC7o7.js";
import { I as Do, c as Ko, a as Oo, b as Lo, u as Fo, d as Wo } from "./richTextActions-DCqwY-BX.js";
import { I as Bo } from "./IconVideo-xmaFxG4f.js";
import { a as ke } from "./workbenchActions-BmzgD2q4.js";
import { u as Ho, a as Ve, I as Vo } from "./useDedupedModelSelect-BZXPqqwg.js";
import { r as Uo } from "./promptLearningApi-CzMvegPS.js";
import { I as Go } from "./IconBox-Cszk-I-Q.js";
import { I as $o } from "./IconCamera-CcPUMX_j.js";
import { I as rt } from "./IconFolder-DSyUkPWB.js";
import { I as qo } from "./IconLetterCase-BCOi3-Wu.js";
import { a as Jo, I as Yo } from "./IconPalette-BrCzTfHY.js";
import { I as Xo } from "./IconUser-DxD7Uufk.js";
const Zo = [["path", { d: "M10 12h4", key: "svg-0" }], ["path", { d: "M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3", key: "svg-1" }], ["path", { d: "M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3", key: "svg-2" }]], Qo = je("outline", "cursor-text", "CursorText", Zo);
const en = [["path", { d: "M14 3v4a1 1 0 0 0 1 1h4", key: "svg-0" }], ["path", { d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2", key: "svg-1" }], ["path", { d: "M12 11l0 6", key: "svg-2" }], ["path", { d: "M9 14l6 0", key: "svg-3" }]], tn = je("outline", "file-plus", "FilePlus", en);
const on = [["path", { d: "M3 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-0" }], ["path", { d: "M15 16a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4", key: "svg-1" }], ["path", { d: "M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3", key: "svg-2" }], ["path", { d: "M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3", key: "svg-3" }]], nn = je("outline", "replace", "Replace", on);
const rn = [["path", { d: "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", key: "svg-0" }], ["path", { d: "M16 19h6", key: "svg-1" }], ["path", { d: "M19 16v6", key: "svg-2" }], ["path", { d: "M6 21v-2a4 4 0 0 1 4 -4h4", key: "svg-3" }]], sn = je("outline", "user-plus", "UserPlus", rn);
async function an() {
  try {
    const [o, t] = await Promise.all([
      Mt({ kind: "text", enabled: !1 }),
      Rt()
    ]), n = new Set(t.filter((i) => i.hasApiKey).map((i) => i.key)), r = o.find((i) => n.has(i.vendorKey));
    return r ? { vendorKey: r.vendorKey, modelKey: r.modelKey, labelZh: r.labelZh } : null;
  } catch {
    return null;
  }
}
function ln({ onResolved: o }) {
  const { t } = P(), [n, r] = h.useState("prompt"), [i, a] = h.useState(null);
  h.useEffect(() => {
    let g = !0;
    return an().then((u) => {
      g && a(u);
    }), () => {
      g = !1;
    };
  }, []);
  const p = h.useCallback(() => {
    window.dispatchEvent(new CustomEvent("nomi-open-model-catalog"));
  }, []), c = h.useCallback(async () => {
    if (i) {
      r("enabling");
      try {
        await Pt({ ...i, kind: "text", enabled: !0 }), window.dispatchEvent(new CustomEvent("nomi-model-catalog-changed")), r("done"), o?.();
      } catch {
        r("prompt");
      }
    }
  }, [i, o]);
  return /* @__PURE__ */ e.jsxs("div", { className: l("self-start w-full max-w-full"), "data-role": "assistant", "data-recovery": "no-text-model", children: [
    /* @__PURE__ */ e.jsx(Xt, {}),
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
          F,
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
        /* @__PURE__ */ e.jsxs(F, { variant: "default", className: "w-full", onClick: p, children: [
          /* @__PURE__ */ e.jsx(yo, {}),
          t("creationAi.noTextModel.settings")
        ] })
      ] })
    ] })
  ] });
}
function cn() {
  const { t: o } = P(), t = k((d) => d.storyboardPlan), n = k((d) => d.storyboardPlanCommitted), r = k((d) => d.storyboardEditorOpen), i = k((d) => d.setStoryboardEditorOpen), a = k((d) => d.discardStoryboardPlan), p = k((d) => d.setWorkspaceMode);
  if (!t) return null;
  const c = t.title.trim() || o("storyboardEditor.planCard.defaultTitle"), g = t.shots.length, u = t.anchors.length, w = Math.round(t.shots.reduce((d, S) => d + (S.shotKind === "image" ? 0 : S.durationSec || 0), 0)), C = o("storyboardEditor.planCard.meta", {
    shots: g,
    anchors: u,
    duration: w > 0 ? o("storyboardEditor.planCard.duration", { seconds: w }) : o("storyboardEditor.planCard.imageStoryboard")
  }), y = async () => {
    await Ye({
      title: o("storyboardEditor.discardTitle"),
      message: o("storyboardEditor.planCard.discardMessage"),
      confirmLabel: o("storyboardEditor.discard"),
      danger: !0
    }) && a();
  }, f = r ? { label: o("storyboardEditor.planCard.editing"), cls: "bg-nomi-accent-soft text-nomi-accent" } : n ? { label: o("storyboardEditor.planCard.committed"), cls: "bg-workbench-success-soft text-workbench-success" } : { label: o("storyboardEditor.planCard.draft"), cls: "bg-nomi-accent-soft text-nomi-accent" };
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
          n && !r ? /* @__PURE__ */ e.jsx(wo, { size: 15, stroke: 1.6, className: "shrink-0 text-workbench-success" }) : /* @__PURE__ */ e.jsx(de, { size: 15, stroke: 1.6, className: "shrink-0 text-nomi-ink-60" }),
          /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate text-body-sm font-medium text-nomi-ink", children: c }),
          /* @__PURE__ */ e.jsx("span", { className: l("shrink-0 text-micro px-2 py-0.5 rounded-full leading-relaxed", f.cls), children: f.label })
        ] }),
        r ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.editingSummary", { count: g }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(F, { variant: "default", size: "sm", onClick: () => i(!1), children: o("storyboardEditor.planCard.backToDraft") }),
            /* @__PURE__ */ e.jsx("span", { className: "ml-auto text-caption text-nomi-ink-40", children: o("storyboardEditor.planCard.confirmHint") })
          ] })
        ] }) : n ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: o("storyboardEditor.planCard.committedSummary", { count: g }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(F, { variant: "default", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.editAgain") }),
            /* @__PURE__ */ e.jsxs(F, { variant: "default", size: "sm", className: "ml-auto", onClick: () => p("generation"), children: [
              o("storyboardEditor.planCard.goGeneration"),
              /* @__PURE__ */ e.jsx(Qe, { size: 13, stroke: 1.6 })
            ] })
          ] })
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-caption text-nomi-ink-60", children: C }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
            t.shots.slice(0, 2).map((d) => /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 py-1 border-t border-nomi-line-soft text-caption text-nomi-ink-60", children: [
              /* @__PURE__ */ e.jsx("span", { className: "shrink-0 tabular-nums text-nomi-ink-40", children: String(d.index).padStart(2, "0") }),
              /* @__PURE__ */ e.jsx("span", { className: "min-w-0 flex-1 truncate", children: d.prompt.trim() || o("storyboardEditor.planCard.emptyPrompt") })
            ] }, d.index)),
            g > 2 ? /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 py-1 border-t border-nomi-line-soft text-caption text-nomi-ink-40", children: [
              /* @__PURE__ */ e.jsx("span", { className: "shrink-0", children: "···" }),
              /* @__PURE__ */ e.jsx("span", { children: o("storyboardEditor.planCard.moreShots", { count: g - 2 }) })
            ] }) : null
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(F, { variant: "primary", size: "sm", onClick: () => i(!0), children: o("storyboardEditor.planCard.openEditor") }),
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
const dn = {
  storyboard: de,
  fixation: sn
}, mn = [
  { value: "image", labelKey: "storyboardEditor.action.imageMode", Icon: Te },
  { value: "video", labelKey: "storyboardEditor.action.videoMode", Icon: de },
  { value: "image-video", labelKey: "storyboardEditor.action.imageVideoMode", Icon: jo }
];
function it({
  kind: o,
  resolved: t,
  onRun: n,
  lead: r,
  onDismiss: i
}) {
  const { t: a } = P(), p = dn[o], c = a(o === "storyboard" ? "storyboardEditor.action.storyboardLead" : "storyboardEditor.action.fixationLead"), g = a(o === "storyboard" ? "storyboardEditor.action.storyboardCta" : "storyboardEditor.action.fixationCta"), u = r ?? c, [w, C] = h.useState("image");
  return /* @__PURE__ */ e.jsxs("div", { className: l("flex flex-col gap-2 p-3 rounded-nomi border border-nomi-line bg-nomi-paper"), "data-action-card": o, children: [
    /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center gap-2 min-w-0"), children: [
      /* @__PURE__ */ e.jsx(p, { size: 15, stroke: 1.6, className: l("shrink-0 text-nomi-ink-60") }),
      /* @__PURE__ */ e.jsx("span", { className: l("min-w-0 flex-1 text-body-sm text-nomi-ink-80 leading-relaxed"), children: u }),
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
      mn.map((y) => {
        const f = w === y.value;
        return /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": f,
            disabled: t,
            onClick: () => C(y.value),
            "data-shot-mode": y.value,
            className: l(
              "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-caption border whitespace-nowrap shrink-0",
              f ? "border-nomi-ink bg-nomi-ink text-nomi-paper font-medium" : "border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
            ),
            children: [
              /* @__PURE__ */ e.jsx(y.Icon, { size: 12, stroke: 1.8 }),
              a(y.labelKey)
            ]
          },
          y.value
        );
      }),
      /* @__PURE__ */ e.jsx("span", { className: l("text-micro text-nomi-ink-40 ml-1 min-w-0 truncate"), children: a(w === "image" ? "storyboardEditor.action.imageHint" : w === "image-video" ? "storyboardEditor.action.imageVideoHint" : "storyboardEditor.action.videoHint") })
    ] }) : null,
    /* @__PURE__ */ e.jsxs(
      F,
      {
        variant: "primary",
        size: "sm",
        className: l("self-start"),
        disabled: t,
        onClick: () => n(w),
        "data-action-run": o,
        children: [
          /* @__PURE__ */ e.jsx(p, { size: 14, stroke: 1.7 }),
          t ? a("storyboardEditor.action.started") : g,
          t ? null : /* @__PURE__ */ e.jsx(Qe, { size: 13, stroke: 1.7 })
        ]
      }
    )
  ] });
}
const st = /拆镜头|分镜|拆分|镜头脚本|storyboard|成片|出片/i, at = /(?:拆|切|分|变|做|整|铺|排|拍|剪|生成|搞|弄|规划).{0,6}(?:镜头|分镜|画面|场景|视频|短片|片子|一段段|一格格|一幕幕|一幕)/, un = /立角色卡|角色卡|人物卡|定妆|角色设定|建.{0,2}角色/;
function pn(o) {
  return st.test(o) || at.test(o);
}
function hn(o) {
  const t = o.trim();
  return t ? pn(t) ? "storyboard" : un.test(t) ? "fixation" : null : null;
}
function xn(o) {
  const t = o.trim();
  if (!t) return "";
  const n = t.split(/[:：]/).slice(1).join("：").trim();
  return n.length >= 12 ? n : t.replace(st, "").replace(at, "").replace(/[\s,，。、!！?？]+/g, "").length >= 12 ? t : "";
}
const bn = "workbench.creation.skill-author";
function fn() {
  window.dispatchEvent(new Event("nomi-open-model-catalog"));
}
function gn({
  activeSkill: o,
  autoLabel: t,
  onSelect: n
}) {
  const { t: r } = P(), i = (m) => r(`libraries.skill.provider.${m}`), a = h.useRef(null), [p, c] = h.useState(!1), [g, u] = h.useState([]), [w, C] = h.useState(/* @__PURE__ */ new Set()), y = h.useCallback(() => {
    Co().then((m) => u(m.filter((E) => E.isPlaybook))).catch(() => u([])), tt().then(C).catch(() => C(/* @__PURE__ */ new Set()));
  }, []);
  h.useEffect(() => {
    y();
  }, [y]);
  const f = o ? g.find((m) => m.name === o.key) ?? null : null, d = f ? Ie(f, w).missing : [], S = !!o;
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs(
      "button",
      {
        ref: a,
        type: "button",
        onClick: () => c((m) => !m),
        title: r("libraries.skill.currentHint"),
        className: [
          "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-caption font-medium shrink min-w-0 transition-colors",
          "duration-[var(--nomi-transition-fast)]",
          S ? "bg-nomi-accent-soft text-nomi-accent" : "bg-nomi-ink-05 text-nomi-ink-80 hover:bg-nomi-ink-10"
        ].join(" "),
        children: [
          S ? /* @__PURE__ */ e.jsx(de, { size: 14, stroke: 1.5, className: "shrink-0" }) : /* @__PURE__ */ e.jsx(zt, { size: 14, stroke: 1.5, className: "shrink-0" }),
          /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o ? o.name : t }),
          d.length > 0 && /* @__PURE__ */ e.jsx(ve, { size: 13, stroke: 1.8, className: "shrink-0 text-workbench-danger" }),
          /* @__PURE__ */ e.jsx(et, { size: 13, stroke: 1.6, className: "shrink-0 opacity-60" })
        ]
      }
    ),
    p && /* @__PURE__ */ e.jsx(Zt, { anchorRef: a, onClose: () => c(!1), children: /* @__PURE__ */ e.jsxs("div", { className: "w-[284px] rounded-nomi border border-nomi-line bg-nomi-paper shadow-nomi-lg p-1.5 text-body-sm text-nomi-ink", children: [
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
      g.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "my-1 border-t border-nomi-line-soft" }),
      g.map((m) => {
        const E = Ie(m, w), G = o?.key === m.name;
        return /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              n({ key: m.name, name: m.label }), c(!1);
            },
            className: [
              "flex w-full items-start gap-2 rounded-nomi-sm px-2.5 py-2 text-left transition-colors",
              "duration-[var(--nomi-transition-fast)]",
              G ? "bg-nomi-accent-soft text-nomi-accent" : "hover:bg-nomi-ink-05"
            ].join(" "),
            children: [
              /* @__PURE__ */ e.jsx(de, { size: 16, stroke: 1.5, className: "mt-0.5 shrink-0" }),
              /* @__PURE__ */ e.jsxs("span", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "font-medium truncate", children: m.label }),
                  /* @__PURE__ */ e.jsx("span", { className: "shrink-0 rounded-full bg-nomi-ink-05 px-1.5 text-micro text-nomi-ink-60", children: r("libraries.skill.playbookStages", { count: m.stageLabels.length }) })
                ] }),
                m.author && /* @__PURE__ */ e.jsx("span", { className: "block text-micro text-nomi-ink-60", children: m.author }),
                /* @__PURE__ */ e.jsx("span", { className: "mt-1 flex flex-wrap items-center gap-1", children: m.neededProviders.map((M) => {
                  const D = !E.missing.includes(M);
                  return /* @__PURE__ */ e.jsxs(
                    "span",
                    {
                      className: [
                        "inline-flex items-center gap-0.5 text-micro",
                        D ? "text-workbench-success" : "text-nomi-ink-40"
                      ].join(" "),
                      children: [
                        D ? /* @__PURE__ */ e.jsx(ce, { size: 11, stroke: 2 }) : /* @__PURE__ */ e.jsx(ve, { size: 11, stroke: 2 }),
                        i(M)
                      ]
                    },
                    M
                  );
                }) })
              ] }),
              G && /* @__PURE__ */ e.jsx(ce, { size: 15, stroke: 1.8, className: "mt-0.5 shrink-0" })
            ]
          },
          m.directoryName
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
              fn(), c(!1);
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
            n({ key: bn, name: r("libraries.skill.authorName") }), c(!1);
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
const kn = {
  key: "workbench.storyboard.planner",
  name: "故事板规划师"
};
function yn(o) {
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
function vn(o) {
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
    yn(o.shotMode ?? "image"),
    "",
    "结构化工具调用硬约束：propose_storyboard_plan 参数必须是对象本体，anchors/shots 必须是数组本体；不要把任何数组序列化成字符串。",
    "",
    "--- 故事正文 ---",
    t,
    "--- 故事正文结束 ---"
  ].join(`
`);
}
async function wn(o) {
  let t = !o.requiredTool;
  const n = await Qt({
    message: vn({
      storyText: o.storyText,
      currentPlan: o.currentPlan,
      revisionRequest: o.revisionRequest,
      ...o.shotMode ? { shotMode: o.shotMode } : {}
    }),
    snapshot: So.read_canvas(),
    selectedNodes: [],
    mode: "agent",
    skill: kn,
    ...o.agentPreference ? { agentPreference: o.agentPreference } : {},
    ...o.requiredTool ? { requiredTool: o.requiredTool } : {},
    onContent: (r, i) => o.onContent?.(i),
    ...o.onCancelReady ? { onCancelReady: o.onCancelReady } : {},
    onToolCall: (r) => {
      if (r.toolName === o.requiredTool && (t = !0), eo(
        { kind: "tool-call", toolName: r.toolName, args: r.args },
        to()
      ).outcome === "allow") {
        (async () => {
          try {
            const a = await ot(r.toolName, r.args);
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
function lt(o) {
  const t = h.useRef(null);
  return h.useEffect(() => {
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
function jn() {
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
const Nn = 60;
function Cn({
  busy: o,
  onRun: t
}) {
  const { t: n } = P(), r = k((u) => u.workbenchDocument), i = k((u) => u.storyboardPlan), [a, p] = h.useState(!1), c = h.useMemo(() => nt(r), [r]);
  return !o && !i && !a && c.trim().length >= Nn ? /* @__PURE__ */ e.jsx("div", { className: l("pt-1.5"), children: /* @__PURE__ */ e.jsx(
    it,
    {
      kind: "storyboard",
      resolved: !1,
      lead: n("storyboardEditor.action.nudgeLead"),
      onRun: (u) => {
        p(!0), t(u);
      },
      onDismiss: () => p(!0)
    }
  ) }) : null;
}
function An(o) {
  return o === "insert_at_cursor" ? "creationAi.writeTool.insert" : o === "replace_selection" ? "creationAi.writeTool.replace" : "creationAi.writeTool.append";
}
function Sn(o) {
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
function En(o) {
  const t = o.trim();
  return t.length >= 120 && /(^|\n)\s*#\s*故事设定/m.test(t) && /(^|\n)\s*#\s*剧本/m.test(t);
}
function In({ onCollapse: o } = {}) {
  const { t } = P(), n = Se((s) => s.sending), r = Se((s) => s.pendingToolCalls), i = Se, { push: a, cancel: p } = jn(), [c, g] = h.useState(0), u = h.useRef(n);
  h.useEffect(() => {
    u.current && !n && g((s) => s + 1), u.current = n;
  }, [n]);
  const [w, C] = h.useState(!1), y = lt("workbench-scrollbar-visible"), f = k((s) => s.workbenchDocument), d = k((s) => s.creationDocumentTools), S = k((s) => s.creationSelectionText), m = k((s) => s.creationAiModeId), E = k((s) => s.creationActiveSkill), G = k((s) => s.setCreationActiveSkill), M = k((s) => s.creationAiDraft), D = k((s) => s.creationAiMessages), x = oo(D.map((s) => s.id), "creation"), { hasTextModel: I, refresh: R } = Dt(), [W, $] = h.useState(() => /* @__PURE__ */ new Set()), [he, xe] = h.useState(() => /* @__PURE__ */ new Set()), b = k((s) => s.creationAiAttachments), Y = k((s) => s.creationAiError), Ne = k((s) => s.setCreationAiModeId), q = k((s) => s.setCreationAiDraft), K = k((s) => s.setCreationAiMessages), ft = k((s) => s.setCreationAiAttachments), O = k((s) => s.setCreationAiError), _e = k((s) => s.setWorkspaceMode), {
    isDragging: gt,
    openFilePicker: kt,
    inputRef: yt,
    onInputChange: vt,
    removeAttachment: wt,
    clearAttachments: be,
    handlePaste: jt,
    dragHandlers: Nt
  } = no({ setAttachments: ft, onError: O }), X = h.useRef(d);
  X.current = d;
  const ee = Fe(m), oe = h.useRef({ activeSkill: E, activeMode: ee });
  oe.current = { activeSkill: E, activeMode: ee };
  const ne = h.useMemo(() => nt(f), [f]), fe = h.useCallback((s, j) => {
    i.getState().resolvePendingToolCall(s, j);
  }, [i]), Ct = h.useCallback((s) => {
    const j = X.current;
    if (!j) {
      fe(s.toolCallId, { ok: !1, message: "editor_not_ready" });
      return;
    }
    s.toolName === "insert_at_cursor" ? j.insertAtCursor(s.content) : s.toolName === "replace_selection" ? j.replaceSelection(s.content) : j.appendToEnd(s.content), fe(s.toolCallId, { ok: !0, result: { applied: !0 } });
  }, [fe]), At = h.useCallback((s) => s === "insert_at_cursor" ? /* @__PURE__ */ e.jsx(Qo, { size: 13 }) : s === "replace_selection" ? /* @__PURE__ */ e.jsx(nn, { size: 13 }) : /* @__PURE__ */ e.jsx(tn, { size: 13 }), []), re = h.useCallback((s = t("creationAi.storyboardCommand"), j, N = "image", V) => {
    const Z = k.getState(), Ce = Z.storyboardPlan, Q = !!(Ce && !Z.storyboardPlanCommitted && j?.trim()), ge = (S || ne).trim(), se = ge ? "" : xn(s);
    se && X.current?.appendToEnd(se);
    const me = ge || se;
    if (!Q && !me) {
      O(t("creationAi.writeStoryFirst"));
      return;
    }
    const Ae = i.getState().nextMessageId("user"), J = i.getState().nextMessageId("assistant");
    K((U) => [
      ...U,
      { id: Ae, role: "user", content: s },
      { id: J, role: "assistant", content: t(Q ? "creationAi.revisingPlan" : "creationAi.planningStoryboard"), status: "pending" }
    ]), q(""), O("");
    const B = i.getState().begin();
    (async () => {
      try {
        const { text: U } = await wn({
          // 首拆带分镜模式（图片/视频，动作卡上选，默认图片）；改方案不带——保留现方案每镜已定的 shotKind。
          ...Q ? { currentPlan: Ce, revisionRequest: j } : { storyText: me, shotMode: N },
          onContent: (A) => {
            B.isCurrent() && a(
              () => K((_) => _.map((L) => L.id === J ? { ...L, content: A || t("creationAi.planningShort"), status: "streaming" } : L))
            );
          },
          onCancelReady: (A) => i.getState().attachCancel(B.id, A),
          ...V ? {
            agentPreference: { vendorKey: "platform-employee", modelKey: V },
            requiredTool: "propose_storyboard_plan"
          } : {}
        });
        if (!B.isCurrent()) return;
        K(
          (A) => A.map(
            (_) => _.id === J ? { ..._, content: U || t(Q ? "creationAi.revisionComplete" : "creationAi.planComplete"), status: "done" } : _
          )
        );
      } catch (U) {
        if (!B.isCurrent()) return;
        K(
          (A) => A.map(
            (_) => _.id === J ? { ..._, content: t("creationAi.planFailed", { message: U instanceof Error && U.message ? U.message : t("creationAi.unknownError") }), status: "error" } : _
          )
        );
      } finally {
        p(), i.getState().finish(B.id);
      }
    })();
  }, [p, ne, a, S, q, O, K, i, t]), Pe = h.useCallback((s = t("creationAi.fixationCommand")) => {
    const j = (S || ne).trim();
    if (!j) {
      O(t("creationAi.writeScriptFirst"));
      return;
    }
    K((N) => [
      ...N,
      { id: i.getState().nextMessageId("user"), role: "user", content: s },
      { id: i.getState().nextMessageId("assistant"), role: "assistant", content: t("creationAi.fixationStarted"), status: "done" }
    ]), q(""), O(""), _e("generation"), window.setTimeout(() => {
      ro({ storyText: j, source: "creation-ai-panel" });
    }, 60);
  }, [ne, S, q, O, K, _e, i, t]), ie = h.useCallback(async (s, j = {}) => {
    if (i.getState().sending) return;
    const N = (s ?? M).trim(), V = j.modeId ? Fe(j.modeId) : ee;
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
    const Q = j.guided || oe.current.activeSkill || V.id === "storyboard" ? null : hn(N);
    if (Q) {
      const A = i.getState().nextMessageId("user"), _ = i.getState().nextMessageId("assistant");
      K((L) => [
        ...L,
        { id: A, role: "user", content: N || t(Q === "storyboard" ? "creationAi.storyboardCommand" : "creationAi.fixationCommand") },
        { id: _, role: "assistant", content: "", status: "done", action: { kind: Q, prompt: N } }
      ]), q(""), O("");
      return;
    }
    const ge = To({ mode: V, userRequest: N }), se = j.displayMessage || N || (Z.length ? t("creationAi.attachmentPrompt") : t("creationAi.processDocument", { mode: t(`creationAi.mode.${V.id}.label`) })), me = Z.map((A) => ({
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
    K((A) => [...A, Ae, { id: J, role: "assistant", content: "", status: "pending" }]), q(""), be(), O("");
    const B = i.getState().begin();
    let U = !1;
    try {
      const A = await Kt({
        prompt: ge,
        displayPrompt: se,
        ...me.length ? { attachments: me } : {},
        sessionKey: ze("creation"),
        projectId: Lt("projectId"),
        // 手动锁定的 active skill 优先（如「品牌宣传片」playbook）；否则回退创作模式推导。
        skillKey: !j.modeId && oe.current.activeSkill ? oe.current.activeSkill.key : `workbench.creation.${V.id}`,
        skillName: !j.modeId && oe.current.activeSkill ? oe.current.activeSkill.name : t(`creationAi.mode.${V.id}.title`),
        ...j.employeeKey ? {
          agentPreference: { vendorKey: "platform-employee", modelKey: j.employeeKey }
        } : {},
        ...j.requiredTool ? { requiredTool: j.requiredTool } : {},
        onContent: (v, T) => {
          B.isCurrent() && a(
            () => K((z) => z.map((H) => H.id === J ? { ...H, content: T, status: "streaming" } : H))
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
            const T = v.args && typeof v.args == "object" ? v.args : {}, z = T.manifest, H = typeof T.dirName == "string" && T.dirName.trim() ? T.dirName : "imported-skill", ue = typeof T.skillMarkdown == "string" ? T.skillMarkdown : "", It = {
              version: "nomi-skill-v1",
              exportedAt: Date.now(),
              dirName: H,
              files: { "SKILL.md": ue, "skill.json": JSON.stringify(z ?? {}, null, 2) }
            }, Tt = z && typeof z == "object" && Array.isArray(z.requiredProviders) ? z.requiredProviders : [];
            (async () => {
              const ae = await Ao(It);
              if (!ae.ok) {
                await v.confirm({ ok: !1, message: ae.error ?? t("creationAi.skillSaveFailed") });
                return;
              }
              try {
                const _t = await tt(), Re = Ie({ neededProviders: Tt }, _t);
                await v.confirm({ ok: !0, result: { saved: !0, skillName: ae.skillName, dirName: ae.dirName, missingProviders: Re.missing, satisfied: Re.satisfied } });
              } catch {
                await v.confirm({ ok: !0, result: { saved: !0, skillName: ae.skillName, dirName: ae.dirName } });
              }
            })();
            return;
          }
          if (Ot(v.toolName)) {
            if (!_o(V)) {
              v.confirm({ ok: !1, message: "chat-only mode does not write to the document" });
              return;
            }
            const T = v.args && typeof v.args == "object" ? v.args : {}, z = typeof T.content == "string" ? T.content : typeof T.text == "string" ? T.text : "";
            if (j.autoApproveWrites) {
              const H = X.current;
              if (!H || !z.trim()) {
                v.confirm({ ok: !1, message: "editor_not_ready" });
                return;
              }
              v.toolName === "insert_at_cursor" ? H.insertAtCursor(z) : v.toolName === "replace_selection" ? H.replaceSelection(z) : H.appendToEnd(z), U = !0, v.confirm({ ok: !0, result: { applied: !0, guided: !0 } });
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
      const _ = !!A.raw?.cancelled, L = Sn(A);
      if (!_ && j.requiredTool === "append_to_end" && !U) {
        if (!En(L) || !X.current)
          throw new Error("编剧只回复了说明，没有交付可写入的完整剧本；系统已拦截这次假完成，请重新点击“生成剧本”。");
        X.current.appendToEnd(L), U = !0;
      }
      if (_)
        K((v) => v.map((T) => T.id === J ? { ...T, content: L || t("creationAi.stopped"), status: "cancelled" } : T));
      else {
        const v = L || t("creationAi.emptyResponse"), z = A.finishReason === "length" && L.trim() !== "" ? t("creationAi.truncated", { text: v }) : v;
        K((H) => H.map((ue) => ue.id === J ? { ...ue, content: z, status: "done" } : ue));
      }
    } catch (A) {
      if (!B.isCurrent()) return;
      const _ = A instanceof Error ? A.message : t("creationAi.callFailed");
      K((L) => L.map((v) => v.id === J ? { ...v, content: `${t("creationAi.errorPrefix")}${_}`, status: "error" } : v));
    } finally {
      p(), i.getState().finish(B.id);
    }
  }, [ee, E, b, p, be, ne, M, re, Pe, a, S, q, O, K, i, t]);
  h.useEffect(() => {
    const s = (N) => {
      if (N) {
        if (N.action === "storyboard") {
          De({ vendorKey: "platform-employee", modelKey: N.employeeKey }), re(N.displayMessage, void 0, N.shotMode, N.employeeKey);
          return;
        }
        De({ vendorKey: "platform-employee", modelKey: N.employeeKey }), Ne(N.modeId), ie(N.prompt, {
          modeId: N.modeId,
          displayMessage: N.displayMessage,
          autoApproveWrites: N.autoApproveWrites,
          guided: !0,
          employeeKey: N.employeeKey,
          requiredTool: N.requiredTool
        });
      }
    }, j = (N) => {
      He(), s(N.detail);
    };
    return window.addEventListener(Be, j), s(He()), () => window.removeEventListener(Be, j);
  }, [re, ie, Ne]);
  const St = h.useMemo(() => [
    t("creationAi.suggestion.opening"),
    t("creationAi.suggestion.visual"),
    t("creationAi.suggestion.storyboard")
  ], [t]), Et = h.useCallback(() => {
    i.getState().abandon(), Ft("creation"), q(""), be(), O(""), Wt(ze("creation"));
  }, [be, q, O, i]), Me = /* @__PURE__ */ e.jsxs(
    "aside",
    {
      className: l(
        "workbench-creation-ai",
        "relative grid grid-cols-[minmax(0,1fr)] grid-rows-[44px_auto_minmax(0,1fr)_auto_auto]",
        '[grid-template-areas:"header"_"tools"_"messages"_"error"_"composer"]',
        "min-w-0 min-h-0 overflow-hidden",
        w && "h-[86vh] w-[min(760px,92vw)] rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg"
      ),
      "aria-label": t("creationAi.panelAria"),
      ...Nt,
      children: [
        gt ? /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: l(
              "absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none",
              "rounded-nomi border-2 border-dashed border-nomi-accent bg-nomi-accent-soft",
              "text-body-sm font-semibold text-nomi-accent"
            ),
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ e.jsx(Ke, { size: 26, stroke: 1.5 }),
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
                /* @__PURE__ */ e.jsx(Bt, { size: 18 }),
                /* @__PURE__ */ e.jsx("span", { className: l("text-body-sm font-semibold text-nomi-ink"), children: t("creationAi.title") })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: l("inline-flex items-center gap-2 ml-auto min-w-0"), children: [
                /* @__PURE__ */ e.jsx(gn, { activeSkill: E, autoLabel: t(`creationAi.mode.${ee.id}.title`), onSelect: G }),
                /* @__PURE__ */ e.jsx(
                  io,
                  {
                    area: "creation",
                    className: l("inline-flex items-center flex-nowrap gap-1"),
                    actionClassName: l(
                      "size-6 inline-grid place-items-center shrink-0",
                      "p-0 border-0 rounded-nomi-sm bg-transparent text-nomi-ink-60 cursor-pointer",
                      "hover:bg-nomi-ink-05 hover:text-nomi-ink"
                    ),
                    onNewConversation: Et
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
                    label: t(w ? "creationAi.shrink" : "creationAi.expandConversation"),
                    "aria-label": t(w ? "creationAi.shrinkAria" : "creationAi.expandAria"),
                    onClick: () => C((s) => !s),
                    icon: w ? /* @__PURE__ */ e.jsx(go, { size: 15 }) : /* @__PURE__ */ e.jsx(ko, { size: 15 })
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
          /* @__PURE__ */ e.jsx(so, { refreshKey: c }),
          /* @__PURE__ */ e.jsx(Cn, { busy: n, onRun: (s) => re(t("creationAi.storyboardCommand"), void 0, s) })
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
              D.length === 0 && r.length === 0 ? /* @__PURE__ */ e.jsxs("div", { className: l(
                "flex h-full flex-col items-center justify-center gap-2",
                "max-w-[240px] mx-auto py-6 px-3 text-center"
              ), children: [
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink font-nomi-display text-title font-medium"), children: t("creationAi.inspirationTitle") }),
                /* @__PURE__ */ e.jsx("div", { className: l("text-nomi-ink-60 text-body-sm leading-relaxed"), children: t("creationAi.inspirationDescription") }),
                /* @__PURE__ */ e.jsx("div", { className: l("flex flex-col gap-1.5 w-full mt-2"), children: St.map((s) => /* @__PURE__ */ e.jsxs(
                  F,
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
                      /* @__PURE__ */ e.jsx(ao, { size: 13, className: l("shrink-0 text-nomi-ink-40") })
                    ]
                  },
                  s
                )) })
              ] }) : D.map((s) => /* @__PURE__ */ e.jsxs(h.Fragment, { children: [
                s.role === "user" ? /* @__PURE__ */ e.jsx(lo, { content: s.content, attachments: s.attachments }) : s.action ? /* @__PURE__ */ e.jsx(
                  it,
                  {
                    kind: s.action.kind,
                    resolved: he.has(s.id),
                    onRun: (j) => {
                      if (he.has(s.id)) return;
                      xe((V) => new Set(V).add(s.id));
                      const N = s.action.prompt;
                      s.action.kind === "storyboard" ? re(N || t("creationAi.storyboardCommand"), void 0, j) : Pe(N || t("creationAi.fixationCommand"));
                    }
                  }
                ) : s.status === "error" && (I === !1 || W.has(s.id)) ? /* @__PURE__ */ e.jsx(
                  ln,
                  {
                    onResolved: () => {
                      $((j) => new Set(j).add(s.id)), R();
                    }
                  }
                ) : s.status === "error" || s.content.startsWith(t("creationAi.errorPrefix")) ? (
                  // 缺大脑(上一分支)外的一般错误 → 红色错误卡(人话+重试/去模型接入),与生成侧同一张卡。
                  /* @__PURE__ */ e.jsx(
                    co,
                    {
                      error: s.content,
                      onRetry: () => {
                        const j = [...D].reverse().find((N) => N.role === "user");
                        j && ie(j.content);
                      }
                    }
                  )
                ) : /* @__PURE__ */ e.jsx(
                  mo,
                  {
                    content: s.status === "pending" ? "" : s.content,
                    attachments: s.attachments,
                    streaming: s.status === "pending" || s.status === "streaming",
                    pendingLabel: s.status === "pending" ? s.content : void 0,
                    cancelled: s.status === "cancelled"
                  }
                ),
                s.id === x ? /* @__PURE__ */ e.jsx(uo, {}) : null
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
                      At(s.toolName),
                      t(An(s.toolName))
                    ] }),
                    /* @__PURE__ */ e.jsx("div", { className: l("workbench-creation-ai__tool-call-body", "max-h-[160px] overflow-auto text-nomi-ink text-body-sm leading-[1.5] whitespace-pre-wrap"), children: s.content || t("creationAi.emptyContent") }),
                    /* @__PURE__ */ e.jsxs("div", { className: l("flex items-center justify-end gap-2 mt-1"), children: [
                      /* @__PURE__ */ e.jsx(
                        F,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-nomi-ink-80 text-caption cursor-pointer hover:bg-nomi-ink-05"),
                          onClick: () => fe(s.toolCallId, { ok: !1, message: "rejected by user" }),
                          children: t("creationAi.reject")
                        }
                      ),
                      /* @__PURE__ */ e.jsx(
                        F,
                        {
                          className: l("h-7 px-3 rounded-nomi-sm border-0 bg-nomi-ink text-nomi-paper text-caption cursor-pointer hover:bg-nomi-accent disabled:cursor-not-allowed disabled:opacity-45"),
                          "data-primary": "true",
                          disabled: !d,
                          onClick: () => Ct(s),
                          children: t("creationAi.apply")
                        }
                      )
                    ] })
                  ]
                },
                s.toolCallId
              )) }) : null,
              /* @__PURE__ */ e.jsx(cn, {})
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
              ref: yt,
              type: "file",
              multiple: !0,
              accept: po,
              className: "hidden",
              "aria-hidden": "true",
              tabIndex: -1,
              onChange: vt
            }
          ),
          /* @__PURE__ */ e.jsx(ho, { attachments: b, onRemove: wt, className: l("mb-2") }),
          /* @__PURE__ */ e.jsx(
            we,
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
              onKeyDown: (s) => xo(s, () => {
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
                  onClick: kt,
                  icon: /* @__PURE__ */ e.jsx(Ke, { size: 16 })
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
                  options: Po.map((s) => ({ value: s.id, label: t(`creationAi.mode.${s.id}.short`) })),
                  onChange: (s) => Ne(s)
                }
              ),
              /* @__PURE__ */ e.jsx(bo, {})
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
                icon: /* @__PURE__ */ e.jsx(vo, { size: 13 })
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
                icon: /* @__PURE__ */ e.jsx(fo, { size: 15 })
              }
            )
          ] })
        ] })
      ]
    }
  );
  return !w || typeof document > "u" ? Me : Ht.createPortal(
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
function Tn(o) {
  const t = typeof o.selectedText == "string" ? o.selectedText.trim() : "";
  if (!t) return !1;
  const n = Vt.t(
    o.kind === "image" ? "runtime.nodeRegistry.image.title" : "runtime.nodeRegistry.video.title"
  );
  return o.addGenerationNode({
    kind: o.kind,
    title: n,
    prompt: t,
    position: o.position
  }), o.setWorkspaceMode("generation"), !0;
}
const Ue = 210, Ge = 40, $e = 10;
function _n(o, t) {
  if (!t) return null;
  const { from: n, to: r, empty: i } = o.state.selection;
  if (i || n === r) return null;
  const a = o.view.coordsAtPos(n), p = o.view.coordsAtPos(r), c = t.getBoundingClientRect(), g = Math.min(a.left, p.left), u = Math.max(a.right, p.right), w = Math.min(a.top, p.top), C = Math.max(a.bottom, p.bottom), y = g + (u - g) / 2 - c.left - Ue / 2, f = Math.max(12, Math.min(y, Math.max(12, c.width - Ue - 12))), d = w - c.top - Ge - $e;
  return d >= 8 ? { left: f, top: d, placement: "top" } : {
    left: f,
    top: Math.min(C - c.top + $e, Math.max(8, c.height - Ge - 8)),
    placement: "bottom"
  };
}
function Pn({
  editor: o,
  selectedText: t,
  selectionVersion: n,
  onCreated: r
}) {
  const { t: i } = P(), a = t.trim(), p = h.useRef(null), [c, g] = h.useState(null), u = Xe((d) => d.addNode), w = k((d) => d.setWorkspaceMode), C = h.useCallback(() => {
    if (!o || !a) {
      g(null);
      return;
    }
    const d = p.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor");
    g(_n(o, d));
  }, [o, a]);
  if (h.useLayoutEffect(() => {
    C();
  }, [n, C]), h.useEffect(() => {
    if (!o || !a) return;
    const S = (p.current?.closest(".workbench-editor") ?? o.view.dom.closest(".workbench-editor"))?.querySelector(".workbench-editor__scroll"), m = () => window.requestAnimationFrame(C), E = () => {
      m();
    }, G = () => {
      m();
    };
    return S?.addEventListener("scroll", E, { passive: !0 }), window.addEventListener("resize", G), () => {
      S?.removeEventListener("scroll", E), window.removeEventListener("resize", G);
    };
  }, [o, a, C]), !a || !o || !c) return null;
  const y = (d) => {
    Tn({ selectedText: a, kind: d, addGenerationNode: u, setWorkspaceMode: w }) && r?.();
  }, f = [
    {
      id: "bold",
      label: i("creationAi.selection.bold"),
      icon: /* @__PURE__ */ e.jsx(Do, { size: 14 }),
      active: o.isActive("bold"),
      onClick: () => o.chain().focus().toggleBold().run()
    },
    {
      id: "italic",
      label: i("creationAi.selection.italic"),
      icon: /* @__PURE__ */ e.jsx(Ko, { size: 14 }),
      active: o.isActive("italic"),
      onClick: () => o.chain().focus().toggleItalic().run()
    },
    {
      id: "h1",
      label: i("creationAi.selection.heading1"),
      icon: /* @__PURE__ */ e.jsx(Oo, { size: 15 }),
      active: o.isActive("heading", { level: 1 }),
      onClick: () => o.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      id: "h2",
      label: i("creationAi.selection.heading2"),
      icon: /* @__PURE__ */ e.jsx(Lo, { size: 15 }),
      active: o.isActive("heading", { level: 2 }),
      onClick: () => o.chain().focus().toggleHeading({ level: 2 }).run()
    }
  ];
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      ref: p,
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
            children: f.map((d) => /* @__PURE__ */ e.jsx(
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
                  icon: /* @__PURE__ */ e.jsx(Bo, { size: 14 })
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const Mn = [
  ["bold", "italic"],
  ["h1", "h2"],
  ["bullet-list", "ordered-list", "blockquote"]
], Rn = ["undo", "redo"];
function qe({ action: o }) {
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
function zn() {
  return /* @__PURE__ */ e.jsx("div", { className: "w-px h-[18px] bg-workbench-border mx-1", "aria-hidden": "true" });
}
function Dn({ editor: o }) {
  const { t } = P(), n = Wo(o);
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
  const r = new Map(n.map((c) => [c.id, c])), i = (c) => c.map((g) => r.get(g)).filter((g) => !!g), a = Mn.map(i).filter((c) => c.length > 0), p = i(Rn);
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
        a.map((c, g) => /* @__PURE__ */ e.jsxs(h.Fragment, { children: [
          g > 0 ? /* @__PURE__ */ e.jsx(zn, {}) : null,
          c.map((u) => /* @__PURE__ */ e.jsx(qe, { action: u }, u.id))
        ] }, c[0]?.id ?? g)),
        /* @__PURE__ */ e.jsx("div", { className: "flex-1", "aria-hidden": "true" }),
        p.map((c) => /* @__PURE__ */ e.jsx(qe, { action: c }, c.id))
      ]
    }
  );
}
function Kn() {
  const { t: o } = P(), t = k((m) => m.workbenchDocument), n = k((m) => m.setWorkbenchDocument), r = k((m) => m.setCreationDocumentTools), i = k((m) => m.setCreationSelectionText), [a, p] = h.useState({ text: "", version: 0 }), c = lt("workbench-scrollbar-visible"), g = h.useRef(t);
  h.useEffect(() => {
    g.current = t;
  }, [t]);
  const u = h.useMemo(
    () => Ut(t.contentJson),
    [t.contentJson]
  ), w = h.useCallback(
    (m) => {
      n({ ...g.current, contentJson: m, updatedAt: Date.now() });
    },
    [n]
  ), C = h.useCallback(
    (m) => {
      p((E) => !E.text && !m.trim() ? E : { text: m, version: E.version + 1 }), i(m);
    },
    [i]
  ), y = h.useCallback(() => {
    p((m) => ({ text: "", version: m.version + 1 })), i("");
  }, [i]), { editor: f, tools: d } = Fo({
    content: u,
    placeholder: o("creationAi.editor.placeholder"),
    onChange: w,
    onSelectionChange: C
  });
  h.useEffect(() => {
    if (!f) return;
    let m = null;
    const E = () => {
      Mo() && (m !== null && window.cancelAnimationFrame(m), m = window.requestAnimationFrame(() => {
        m = null, !(f.isDestroyed || !Ro()) && f.chain().focus("end").run();
      }));
    };
    return window.addEventListener(We, E), E(), () => {
      window.removeEventListener(We, E), m !== null && window.cancelAnimationFrame(m);
    };
  }, [f]);
  const S = h.useRef(null);
  return h.useEffect(() => {
    if (!f) return;
    const m = {
      readFullText: d.readFullText,
      readSelectionText: d.readSelectionText,
      insertAtCursor: d.insertAtCursor,
      replaceSelection: d.replaceSelection,
      appendToEnd: d.appendToEnd
    };
    return r(m), S.current = m, () => {
      S.current === m && (r(null), S.current = null);
    };
  }, [f, d, r]), /* @__PURE__ */ e.jsxs(
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
      onKeyDown: (m) => m.stopPropagation(),
      onKeyUp: (m) => m.stopPropagation(),
      children: [
        /* @__PURE__ */ e.jsx(Dn, { editor: f }),
        /* @__PURE__ */ e.jsx(
          Pn,
          {
            editor: f,
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
            children: /* @__PURE__ */ e.jsx(zo, { editor: f })
          }
        )
      ]
    }
  );
}
const On = ["character", "scene", "prop", "style"], Ln = [4, 5, 6, 8, 10, 12, 15];
function ct(o) {
  return o === "style" ? "text" : "visual";
}
function dt(o) {
  return o === "style" ? "all" : "selective";
}
function Fn(o) {
  const t = new Set(o.anchors.map((r) => r.id));
  let n = o.anchors.length + 1;
  for (; t.has(`anchor-${n}`); ) n += 1;
  return `anchor-${n}`;
}
function Wn(o, t) {
  return { ...o, title: t };
}
function Bn(o, t = "character") {
  const n = {
    id: Fn(o),
    kind: t,
    name: "",
    description: "",
    carrier: ct(t),
    scope: dt(t)
  };
  return { ...o, anchors: [...o.anchors, n] };
}
function mt(o, t, n) {
  return { ...o, anchors: o.anchors.map((r) => r.id === t ? { ...r, ...n } : r) };
}
function Hn(o, t, n) {
  return mt(o, t, { kind: n, carrier: ct(n), scope: dt(n) });
}
function Vn(o, t) {
  return { ...o, anchors: o.anchors.filter((n) => n.id !== t) };
}
function ut(o) {
  return o.map((t, n) => t.index === n + 1 ? t : { ...t, index: n + 1 });
}
function Un(o) {
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
function pt(o, t, n) {
  return { ...o, shots: o.shots.map((r, i) => i === t ? { ...r, ...n } : r) };
}
function Gn(o, t) {
  return { ...o, shots: ut(o.shots.filter((n, r) => r !== t)) };
}
function $n(o, t, n) {
  if (t === n || t < 0 || n < 0 || t >= o.shots.length || n >= o.shots.length) return o;
  const r = [...o.shots], [i] = r.splice(t, 1);
  return r.splice(n, 0, i), { ...o, shots: ut(r) };
}
function qn(o, t, n) {
  const r = o.shots[t];
  if (!r) return o;
  const a = r.anchorIds.includes(n) ? r.anchorIds.filter((p) => p !== n) : [...r.anchorIds, n];
  return pt(o, t, { anchorIds: a });
}
function Jn(o) {
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
function Yn(o, t) {
  const n = new Set(o.anchors.map((r) => r.id));
  return t.anchorIds.filter((r) => !n.has(r));
}
const Je = {
  character: Xo,
  scene: Te,
  prop: Go,
  style: Jo
};
function Xn({ anchor: o, onUpdate: t, onChangeKind: n, onRemove: r, nameInvalid: i }) {
  const { t: a } = P(), [p, c] = h.useState(() => !o.description.trim()), [g, u] = h.useState(!1), w = Je[o.kind], C = o.description.trim();
  return /* @__PURE__ */ e.jsxs("div", { className: "px-2.5 py-2", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.typeAria", { type: a(`storyboardEditor.anchor.kind.${o.kind}`) }),
          title: a("storyboardEditor.anchor.switchType"),
          onClick: () => u((y) => !y),
          className: "shrink-0 size-[22px] grid place-items-center rounded-nomi-sm bg-nomi-ink-05 text-nomi-ink-60 hover:bg-nomi-ink-10 hover:text-nomi-ink-80",
          children: /* @__PURE__ */ e.jsx(w, { size: 13, stroke: 1.6 })
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
      /* @__PURE__ */ e.jsx(Zn, { value: o.carrier, onChange: (y) => t({ carrier: y }) }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          "aria-label": a("storyboardEditor.anchor.delete"),
          onClick: r,
          className: "shrink-0 size-7 grid place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
          children: /* @__PURE__ */ e.jsx(Ze, { size: 15, stroke: 1.6 })
        }
      )
    ] }),
    g ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-2 pl-[32px]", children: On.map((y) => {
      const f = Je[y], d = y === o.kind;
      return /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            n(y), u(!1);
          },
          className: l(
            "h-6 px-2 rounded-full text-caption inline-flex items-center gap-1",
            d ? "bg-nomi-accent-soft text-nomi-accent" : "border border-nomi-line text-nomi-ink-60 hover:text-nomi-ink-80 hover:border-nomi-ink-20"
          ),
          children: [
            /* @__PURE__ */ e.jsx(f, { size: 12, stroke: 1.8 }),
            a(`storyboardEditor.anchor.kind.${y}`)
          ]
        },
        y
      );
    }) }) : null,
    p ? /* @__PURE__ */ e.jsxs("div", { className: "mt-1.5 pl-[32px]", children: [
      /* @__PURE__ */ e.jsx(
        we,
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
            /* @__PURE__ */ e.jsx(rt, { size: 12, stroke: 1.8 })
          ]
        }
      ) })
    ] }) : null
  ] });
}
function Zn({ value: o, onChange: t }) {
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
        r ? /* @__PURE__ */ e.jsx($o, { size: 13, stroke: 1.7 }) : /* @__PURE__ */ e.jsx(qo, { size: 13, stroke: 1.7 }),
        n(r ? "storyboardEditor.anchor.visual" : "storyboardEditor.anchor.text")
      ]
    }
  );
}
function Qn(o) {
  const t = o.filter((a) => a.key !== "duration"), n = t.filter((a) => a.type === "select").slice(0, 2), r = new Set(n.map((a) => a.key)), i = t.filter((a) => !r.has(a.key));
  return { inline: n, drawer: i };
}
function ht(o, t) {
  if (!o) return null;
  const n = Gt({
    modelKey: o.modelKey || o.value,
    modelAlias: o.modelAlias,
    vendorKey: o.vendor,
    meta: o.meta
  });
  if (!n) return null;
  const r = n.modes, i = r.find((g) => g.id === t) ?? r.find((g) => g.id === n.defaultModeId) ?? r[0];
  if (!i) return null;
  const { inline: a, drawer: p } = Qn(i.params), c = p.length > 0 || r.length > 1;
  return { modes: r, mode: i, inline: a, drawer: p, hasDrawer: c };
}
function xt(o, t) {
  return { valueOf: (i) => {
    const a = o[i.key];
    return a != null ? String(a) : i.defaultValue !== void 0 ? String(i.defaultValue) : "";
  }, setParam: (i, a) => {
    const p = i.type === "number" ? Number(a) : i.type === "boolean" ? !!a : a;
    t({ params: { ...o, [i.key]: p } });
  } };
}
function bt({
  control: o,
  params: t,
  onUpdate: n
}) {
  const { valueOf: r, setParam: i } = xt(t, n);
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
function er({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  open: i,
  onToggleOpen: a
}) {
  const { t: p } = P(), c = ht(o, t);
  if (!c) return null;
  const { inline: g, hasDrawer: u } = c;
  return g.length === 0 && !u ? null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    g.map((w) => /* @__PURE__ */ e.jsx(bt, { control: w, params: n, onUpdate: r }, w.key)),
    u ? /* @__PURE__ */ e.jsxs(
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
          /* @__PURE__ */ e.jsx(Yo, { size: 12, stroke: 1.8, "aria-hidden": !0 }),
          p("storyboardEditor.shotParams.parameters"),
          i ? /* @__PURE__ */ e.jsx(rt, { size: 12, stroke: 1.8, "aria-hidden": !0 }) : /* @__PURE__ */ e.jsx(et, { size: 12, stroke: 1.8, "aria-hidden": !0 })
        ]
      }
    ) : null
  ] });
}
function tr({
  modelOption: o,
  modeId: t,
  params: n,
  onUpdate: r,
  onApplyToAll: i
}) {
  const { t: a } = P(), { valueOf: p, setParam: c } = xt(n, r), g = ht(o, t);
  if (!g) return null;
  const { modes: u, mode: w, drawer: C, hasDrawer: y } = g;
  return y ? /* @__PURE__ */ e.jsxs("div", { className: "w-full mt-2 p-2.5 rounded-nomi-sm bg-nomi-ink-05 flex flex-col gap-2", children: [
    u.length > 1 ? /* @__PURE__ */ e.jsx(
      te,
      {
        ariaLabel: a("storyboardEditor.shotParams.mode"),
        leadingLabel: a("storyboardEditor.shotParams.mode"),
        size: "xs",
        value: w.id,
        options: u.map((f) => ({ value: f.id, label: f.vendorTerm || f.id })),
        onChange: (f) => r({ modeId: f })
      }
    ) : null,
    C.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: C.map((f) => f.type === "select" ? /* @__PURE__ */ e.jsx(bt, { control: f, params: n, onUpdate: r }, f.key) : f.type === "boolean" ? /* @__PURE__ */ e.jsxs("label", { className: "inline-flex items-center gap-1.5 text-caption text-nomi-ink-60", children: [
      /* @__PURE__ */ e.jsx(
        "input",
        {
          type: "checkbox",
          checked: p(f) === "true",
          onChange: (d) => c(f, d.target.checked)
        }
      ),
      f.label
    ] }, f.key) : /* @__PURE__ */ e.jsx(
      "textarea",
      {
        "aria-label": f.label,
        placeholder: f.placeholder || f.label,
        value: p(f),
        onChange: (d) => c(f, d.target.value),
        rows: 2,
        className: "basis-full w-full resize-y px-2 py-1.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-body-sm text-nomi-ink-80 focus:border-nomi-accent"
      },
      f.key
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
function or(o) {
  const { t } = P(), { shot: n, anchors: r, modelOptions: i, danglingIds: a, onUpdate: p, onToggleAnchor: c, onRemove: g, promptInvalid: u, onApplyParamsToAll: w } = o, [C, y] = h.useState(!1), [f, d] = h.useState(!1), S = new Map(r.map((b) => [b.id, b])), m = n.anchorIds.filter((b) => S.has(b)), E = r.filter((b) => !n.anchorIds.includes(b.id)), M = (n.shotKind ?? "video") === "image", D = M ? "image" : n.keyframe?.enabled === !0 ? "image-video" : "video", x = (b) => {
    b !== D && p(b === "image" ? { shotKind: "image", keyframe: void 0, modelKey: void 0, modeId: void 0, params: void 0 } : b === "image-video" ? {
      shotKind: "video",
      durationSec: n.durationSec > 0 ? n.durationSec : 5,
      keyframe: { ...n.keyframe || {}, enabled: !0, prompt: n.keyframe?.prompt || "" },
      modelKey: void 0,
      modeId: void 0,
      params: void 0
    } : { shotKind: "video", keyframe: void 0, durationSec: n.durationSec > 0 ? n.durationSec : 5, modelKey: void 0, modeId: void 0, params: void 0 });
  }, I = [.../* @__PURE__ */ new Set([...Ln, n.durationSec])].filter((b) => Number.isFinite(b) && b > 0).sort((b, Y) => b - Y).map((b) => ({ value: String(b), label: t("storyboardEditor.second", { count: b }) })), R = h.useCallback(
    (b) => p({ modelKey: b || void 0, modeId: void 0, params: void 0 }),
    [p]
  ), W = Ho(i ?? [], n.modelKey ?? "", R), $ = i && i.length > 0 ? [{ value: "", label: t("storyboardEditor.defaultModel") }, ...W.modelOptions] : null, he = (b) => b ? W.onModelPick(b) : R(""), xe = i?.find((b) => b.value === n.modelKey) ?? null;
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
            /* @__PURE__ */ e.jsx("span", { className: "shrink-0 cursor-grab text-nomi-ink-20 active:cursor-grabbing", "aria-hidden": !0, children: /* @__PURE__ */ e.jsx(No, { size: 15, stroke: 1.6 }) }),
            /* @__PURE__ */ e.jsx("span", { className: "text-title font-semibold text-nomi-ink tabular-nums mr-0.5", children: t("storyboardEditor.shotNumber", { index: n.index }) }),
            /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t("storyboardEditor.shotType"),
                leadingLabel: t("storyboardEditor.type"),
                size: "xs",
                value: D,
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
                onChange: (b) => p({ durationSec: Number(b) })
              }
            ),
            $ ? /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t(M ? "storyboardEditor.imageModel" : "storyboardEditor.videoModel"),
                leadingLabel: t("storyboardEditor.model"),
                size: "xs",
                triggerMaxWidth: 150,
                value: n.modelKey ? W.modelValue : "",
                options: $,
                onChange: he
              }
            ) : null,
            W.providerOptions.length > 1 ? /* @__PURE__ */ e.jsx(
              te,
              {
                ariaLabel: t("storyboardEditor.provider"),
                leadingLabel: t("storyboardEditor.provider"),
                size: "xs",
                triggerMaxWidth: 110,
                value: W.providerValue,
                options: W.providerOptions,
                onChange: W.onProviderPick
              }
            ) : null,
            /* @__PURE__ */ e.jsx(
              er,
              {
                modelOption: xe,
                modeId: n.modeId,
                params: n.params || {},
                onUpdate: (b) => p(b),
                open: f,
                onToggleOpen: () => d((b) => !b)
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              "aria-label": t("storyboardEditor.deleteShot"),
              onClick: g,
              className: "shrink-0 size-7 grid place-items-center rounded-nomi-sm text-nomi-ink-30 hover:bg-nomi-ink-10 hover:text-nomi-ink-60",
              children: /* @__PURE__ */ e.jsx(Ze, { size: 14, stroke: 1.6 })
            }
          )
        ] }),
        f ? /* @__PURE__ */ e.jsx(
          tr,
          {
            modelOption: xe,
            modeId: n.modeId,
            params: n.params || {},
            onUpdate: (b) => p(b),
            ...w ? { onApplyToAll: w } : {}
          }
        ) : null,
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mt-2.5", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-micro text-nomi-ink-40 mr-0.5", children: t("storyboardEditor.reference") }),
          m.map((b) => {
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
        D === "image-video" ? /* @__PURE__ */ e.jsxs("div", { className: "mt-2.5", children: [
          /* @__PURE__ */ e.jsx("div", { className: "mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.keyframePrompt") }),
          /* @__PURE__ */ e.jsx(
            we,
            {
              value: n.keyframe?.prompt || "",
              onChange: (b) => p({ keyframe: { ...n.keyframe || {}, enabled: !0, prompt: b.target.value } }),
              "aria-label": t("storyboardEditor.keyframePromptAria", { index: n.index }),
              placeholder: t("storyboardEditor.keyframePromptPlaceholder"),
              className: "px-2 py-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-body-sm text-nomi-ink-80 leading-normal focus:border-nomi-accent"
            }
          )
        ] }) : null,
        D === "image-video" ? /* @__PURE__ */ e.jsx("div", { className: "mt-2.5 mb-1 text-micro text-nomi-ink-40", children: t("storyboardEditor.videoPrompt") }) : null,
        /* @__PURE__ */ e.jsx(
          we,
          {
            value: n.prompt,
            onChange: (b) => p({ prompt: b.target.value }),
            "aria-label": t("storyboardEditor.promptAria", { index: n.index }),
            placeholder: t(M ? "storyboardEditor.imagePromptPlaceholder" : "storyboardEditor.videoPromptPlaceholder"),
            className: l(
              "mt-2.5 px-2 py-2 rounded-nomi-sm border bg-nomi-paper",
              "text-body-sm text-nomi-ink-80 leading-normal focus:border-nomi-accent",
              u ? "border-workbench-danger" : "border-nomi-line"
            )
          }
        )
      ]
    }
  );
}
function nr() {
  const { t: o } = P(), t = k((x) => x.storyboardPlan), n = k((x) => x.setStoryboardPlan), r = k((x) => x.commitStoryboardPlan), i = k((x) => x.discardStoryboardPlan), a = k((x) => x.setWorkspaceMode), p = k((x) => x.requestCanvasFit), [c, g] = h.useState(null), [u, w] = h.useState(null), [C, y] = h.useState(!1), f = Ve("video").options, d = Ve("image").options, S = (x) => {
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
  const m = Jn(t), E = new Set(m.filter((x) => x.kind === "empty-shot-prompt").map((x) => x.shotIndex)), G = new Set(m.filter((x) => x.kind === "anchor-no-name").map((x) => x.anchorId)), M = async () => {
    await Ye({
      title: o("storyboardEditor.discardTitle"),
      message: o("storyboardEditor.discardMessage"),
      confirmLabel: o("storyboardEditor.discard"),
      danger: !0
    }) && i();
  }, D = async () => {
    if (!(m.length > 0 || C)) {
      y(!0);
      try {
        const [x, I] = await Promise.all([
          Eo(),
          Io()
        ]), R = $t(t, {
          ...x.modelKey ? { defaultImageModelKey: x.modelKey } : {},
          ...x.modeId ? { defaultImageModeId: x.modeId } : {},
          ...x.refModeId ? { defaultImageRefModeId: x.refModeId } : {},
          ...I.modelKey ? { defaultVideoModelKey: I.modelKey } : {},
          ...I.modeId ? { defaultVideoModeId: I.modeId } : {}
        });
        await ot("create_canvas_nodes", R), r(), Uo([
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
        }), a("generation"), p();
        const W = R.nodes.map(($) => qt($.clientId));
        W.length > 1 && Xe.getState().selectNodes(W);
      } catch (x) {
        await Jt({
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
            onChange: (x) => n(Wn(t, x.target.value)),
            "aria-label": o("storyboardEditor.titleAria"),
            placeholder: o("storyboardEditor.titlePlaceholder"),
            className: "min-w-0 max-w-[260px] text-title font-medium text-nomi-ink bg-transparent outline-none focus:bg-nomi-ink-05 rounded-nomi-sm px-1"
          }
        ),
        /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-micro text-nomi-ink-40 bg-nomi-ink-05 px-2 py-0.5 rounded-full", children: o("storyboardEditor.shotCount", { count: t.shots.length }) })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ e.jsx(
        F,
        {
          variant: "default",
          size: "sm",
          onClick: M,
          children: o("storyboardEditor.discardPlan")
        }
      ) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5 px-4 py-1.5 border-b border-nomi-line-soft text-caption text-nomi-ink-40", children: [
      /* @__PURE__ */ e.jsx(Vo, { size: 14, stroke: 1.6, className: "shrink-0" }),
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
            Xn,
            {
              anchor: x,
              nameInvalid: G.has(x.id),
              onUpdate: (I) => n(mt(t, x.id, I)),
              onChangeKind: (I) => n(Hn(t, x.id, I)),
              onRemove: () => n(Vn(t, x.id))
            },
            x.id
          )),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => n(Bn(t)),
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
            or,
            {
              shot: x,
              anchors: t.anchors,
              modelOptions: x.shotKind === "image" ? d : f,
              danglingIds: Yn(t, x),
              promptInvalid: E.has(x.index),
              draggable: !0,
              isDragOver: u === I && c !== null && c !== I,
              onDragStart: () => g(I),
              onDragOver: (R) => {
                R.preventDefault(), w(I);
              },
              onDrop: () => {
                c !== null && c !== I && n($n(t, c, I)), g(null), w(null);
              },
              onDragEnd: () => {
                g(null), w(null);
              },
              onUpdate: (R) => n(pt(t, I, R)),
              onToggleAnchor: (R) => n(qn(t, I, R)),
              onRemove: () => n(Gn(t, I)),
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
              onClick: () => n(Un(t)),
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
      m.length > 0 ? /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-danger inline-flex items-center gap-[5px] min-w-0", children: [
        /* @__PURE__ */ e.jsx(ve, { size: 14, stroke: 1.8, className: "shrink-0" }),
        /* @__PURE__ */ e.jsx("span", { className: "truncate", children: o("storyboardEditor.issuesSummary", { count: m.length, issue: S(m[0]) }) })
      ] }) : /* @__PURE__ */ e.jsxs("span", { className: "text-caption text-workbench-success inline-flex items-center gap-[5px]", children: [
        /* @__PURE__ */ e.jsx(ce, { size: 14, stroke: 1.8 }),
        o("storyboardEditor.readySummary", { anchors: t.anchors.length, shots: t.shots.length })
      ] }),
      /* @__PURE__ */ e.jsxs(
        F,
        {
          variant: "primary",
          onClick: D,
          disabled: m.length > 0 || C,
          children: [
            /* @__PURE__ */ e.jsx(ce, { size: 15, stroke: 1.8 }),
            o(C ? "storyboardEditor.landing" : "storyboardEditor.confirmLanding")
          ]
        }
      )
    ] })
  ] });
}
function Pr() {
  const { t: o } = P(), t = k((u) => u.creationAiCollapsed), n = k((u) => u.setCreationAiCollapsed), r = k((u) => u.creationAssistantAutoOpen), i = k((u) => u.setCreationAssistantAutoOpen), a = k((u) => u.storyboardPlan), p = k((u) => u.storyboardPlanCommitted), c = k((u) => u.storyboardEditorOpen), g = k((u) => u.setStoryboardEditorOpen);
  return h.useEffect(() => {
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
                ].map((u) => /* @__PURE__ */ e.jsx(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    "aria-selected": u.active,
                    onClick: () => g(u.open),
                    className: l(
                      "h-7 px-3 rounded-nomi-sm text-caption font-semibold cursor-pointer",
                      "transition-[background,color,box-shadow] duration-[var(--nomi-transition-fast)]",
                      u.active ? "bg-nomi-ink-10 text-nomi-ink shadow-nomi-sm" : "bg-transparent text-nomi-ink-40 hover:text-nomi-ink-60"
                    ),
                    children: u.label
                  },
                  u.label
                )) }),
                /* @__PURE__ */ e.jsx(
                  "span",
                  {
                    className: l("mr-2 text-micro", p ? "text-workbench-success" : "text-nomi-accent"),
                    children: o(p ? "creationAi.workspace.committed" : "creationAi.workspace.draft")
                  }
                )
              ]
            }
          ) : null,
          /* @__PURE__ */ e.jsx("div", { className: "min-h-0 flex-1", "data-creation-surface": c ? "storyboard" : "source", children: c ? /* @__PURE__ */ e.jsx(nr, {}) : /* @__PURE__ */ e.jsx(Kn, {}) })
        ] }),
        t ? /* @__PURE__ */ e.jsx(
          F,
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
            children: /* @__PURE__ */ e.jsx(Yt, { markSize: 18, wordSize: 13, suffix: o("creationAi.workspace.assistantSuffix") })
          }
        ) : /* @__PURE__ */ e.jsx(In, { onCollapse: () => n(!0) })
      ]
    }
  );
}
export {
  Pr as default
};
